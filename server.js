const express = require("express");
const cors = require("cors");
const axios = require("axios");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const https = require("https");
const aws4 = require("aws4");
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.get("/", (req, res) => res.send("Amazon SP-API + Flipkart + MyStore Backend Running..."));

// ================= DATABASE =================
const sql = require("mssql/msnodesqlv8");
const SERVER_NAME = process.env.DB_SERVER;

const amazonConfig = {
  server: SERVER_NAME,
  database: process.env.AMAZON_DB,
  driver: "msnodesqlv8",
  connectionString: `Driver={ODBC Driver 18 for SQL Server};Server=${SERVER_NAME};Database=${process.env.AMAZON_DB};Trusted_Connection=Yes;TrustServerCertificate=Yes;`
};
const sellerConfig = {
  server: SERVER_NAME,
  database: process.env.SELLER_DB,
  driver: "msnodesqlv8",
  connectionString: `Driver={ODBC Driver 18 for SQL Server};Server=${SERVER_NAME};Database=${process.env.SELLER_DB};Trusted_Connection=Yes;TrustServerCertificate=Yes;`
};

const amazonPoolPromise = new sql.ConnectionPool(amazonConfig).connect().then(p => { console.log("✅ Amazon DB Connected"); return p; }).catch(e => console.error("❌ Amazon DB", e.message));
const sellerPoolPromise = new sql.ConnectionPool(sellerConfig).connect().then(p => { console.log("✅ SellerPortal DB Connected"); return p; }).catch(e => console.error("❌ Seller DB", e.message));

// ================= HELPER =================
const getHost = (env) => env === "production"? "sellingpartnerapi-na.amazon.com" : "sandbox.sellingpartnerapi-na.amazon.com";
const spApiCall = async ({ method, path, accessToken, awsAccessKey, awsSecretKey, region = "us-east-1", environment = "production", body, query }) => {
  const host = getHost(environment);
  let fullPath = path;
  if (query) { const qs = new URLSearchParams(query).toString(); if (qs) fullPath += `?${qs}`; }
  const opts = { host, path: fullPath, service: "execute-api", region, method, headers: { "x-amz-access-token": accessToken, "accept": "application/json", "content-type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
  const res = await axios({ method, url: `https://${host}${fullPath}`, headers: opts.headers, data: body });
  return res.data;
};
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const DOTNET_API_URL = "https://localhost:7203/api";
const dotnetClient = axios.create({ baseURL: DOTNET_API_URL, httpsAgent, timeout: 15000 });

// ================= 1. AUTH =================
app.post("/api/token", async (req, res) => {
  try {
    const { clientId, clientSecret, refreshToken } = req.body;
    if (!clientId ||!clientSecret ||!refreshToken) return res.status(400).json({ message: "Client ID, Secret, Refresh Token required" });
    const params = new URLSearchParams({ grant_type: "refresh_token", client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken });
    const r = await axios.post("https://api.amazon.com/auth/o2/token", params.toString(), { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
    res.json(r.data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { userName, password } = req.body;
    if (!userName ||!password) return res.status(400).json({ message: "Username and password required" });
    const pool = await sellerPoolPromise;
    const result = await pool.request().input("UserName", sql.NVarChar, userName).query(`SELECT UserId,SellerId,CustomerId,FullName,UserName,Email,PasswordHash,Mobile,Role,IsActive,IsLocked FROM Users WHERE UserName=@UserName`);
    const user = result.recordset[0];
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    if (!user.IsActive) return res.status(403).json({ message: "Inactive account" });
    if (user.IsLocked) return res.status(403).json({ message: "Locked account" });
    const ok = await bcrypt.compare(password, user.PasswordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    const token = jwt.sign({ userId: user.UserId, sellerId: user.SellerId, customerId: user.CustomerId, userName: user.UserName, role: user.Role }, process.env.JWT_SECRET, { expiresIn: "8h" });
    res.json({ success: true, token, user: { userId: user.UserId, sellerId: user.SellerId, customerId: user.CustomerId, fullName: user.FullName, userName: user.UserName, email: user.Email, role: user.Role } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ================= 2. SELLER PARTICIPATIONS =================
app.post("/api/marketplace", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment } = req.body;
    const data = await spApiCall({ method: "GET", path: "/sellers/v1/marketplaceParticipations", accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

// ================= 3. CATALOG 2022-04-01 =================
app.post("/api/catalog/search", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, marketplaceIds, keywords, identifiers, identifiersType, includedData, locale, pageSize, pageToken } = req.body;
    const query = { marketplaceIds: (marketplaceIds||[]).join(","),...(keywords?.length && { keywords: keywords.join(",") }),...(identifiers?.length && { identifiers: identifiers.join(","), identifiersType }),...(includedData?.length && { includedData: includedData.join(",") }), locale: locale||"en_US", pageSize: pageSize||20,...(pageToken && { pageToken }) };
    const data = await spApiCall({ method: "GET", path: "/catalog/2022-04-01/items", query, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});
app.post("/api/catalog-item", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, asin, marketplaceIds, includedData, locale } = req.body;
    if (!asin) return res.status(400).json({ error: "ASIN required" });
    const query = { marketplaceIds: (marketplaceIds||[]).join(","),...(includedData?.length && { includedData: includedData.join(",") }), locale: locale||"en_US" };
    const data = await spApiCall({ method: "GET", path: `/catalog/2022-04-01/items/${encodeURIComponent(asin)}`, query, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});
app.post("/api/amazon/catalog/items", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, marketplaceIds, keywords } = req.body;
    const query = { marketplaceIds: (marketplaceIds||[]).join(","), keywords: keywords || "iphone", includedData: "summaries,images" };
    const data = await spApiCall({ method: "GET", path: "/catalog/2022-04-01/items", query, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

// ================= 4. ORDERS v0 =================
app.post("/api/get-orders", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, marketplaceId, createdAfter, createdBefore, orderStatuses, maxResultsPerPage } = req.body;
    const query = { MarketplaceIds: marketplaceId,...(createdAfter && { CreatedAfter: createdAfter }),...(createdBefore && { CreatedBefore: createdBefore }),...(orderStatuses && { OrderStatuses: orderStatuses }),...(maxResultsPerPage && { MaxResultsPerPage: maxResultsPerPage }) };
    const data = await spApiCall({ method: "GET", path: "/orders/v0/orders", query, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json({ success: true, data });
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});
app.post("/api/get-order", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, orderId } = req.body;
    const data = await spApiCall({ method: "GET", path: `/orders/v0/orders/${orderId}`, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json({ success: true, data });
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});
app.post("/api/get-order-items", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, orderId } = req.body;
    const data = await spApiCall({ method: "GET", path: `/orders/v0/orders/${orderId}/orderItems`, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json({ success: true, data });
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});
app.post("/api/amazon/orders/list", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, marketplaceIds } = req.body;
    const query = { marketplaceIds: (marketplaceIds||["ATVPDKIKX0DER"]).join(","), CreatedAfter: new Date(Date.now()-7*24*60*60*1000).toISOString() };
    const data = await spApiCall({ method: "GET", path: "/orders/v0/orders", query, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

// ================= 5. LISTINGS 2021-08-01 =================
app.post("/api/listings/bulk-create", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, sellerId, marketplaceIds, listings } = req.body;
    const results = [];
    for (const listing of listings) {
      try {
        const path = `/listings/2021-08-01/items/${sellerId}/${listing.sku}?marketplaceIds=${marketplaceIds.join(",")}`;
        const data = await spApiCall({ method: "PUT", path, body: listing.payload, accessToken, awsAccessKey, awsSecretKey, region, environment });
        results.push({ sku: listing.sku, success: true, response: data });
      } catch (err) { results.push({ sku: listing.sku, success: false, error: err.response?.data || err.message }); }
    }
    res.json({ total: listings.length, successful: results.filter(r=>r.success).length, failed: results.filter(r=>!r.success).length, results });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post("/api/listings/get", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, sellerId, sku, marketplaceIds } = req.body;
    const data = await spApiCall({ method: "GET", path: `/listings/2021-08-01/items/${sellerId}/${sku}?marketplaceIds=${marketplaceIds}`, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});
app.post("/api/listings/update", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, sellerId, sku, patches } = req.body;
    const data = await spApiCall({ method: "PATCH", path: `/listings/2021-08-01/items/${sellerId}/${sku}`, body: patches, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});
app.post("/api/listings/delete", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, sellerId, sku, marketplaceIds } = req.body;
    const data = await spApiCall({ method: "DELETE", path: `/listings/2021-08-01/items/${sellerId}/${sku}?marketplaceIds=${marketplaceIds}`, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});
app.post("/api/listings/submission", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, sellerId, submissionId } = req.body;
    const data = await spApiCall({ method: "GET", path: `/listings/2021-08-01/items/${sellerId}/submissions/${submissionId}`, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

// ================= 6. REPORTS 2021-06-30 =================
app.post("/api/reports/create", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, reportType, marketplaceIds } = req.body;
    const data = await spApiCall({ method: "POST", path: "/reports/2021-06-30/reports", body: { reportType, marketplaceIds }, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});
app.post("/api/reports/get", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, reportId } = req.body;
    const data = await spApiCall({ method: "GET", path: `/reports/2021-06-30/reports/${reportId}`, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});
app.post("/api/reports/document", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, documentId } = req.body;
    const data = await spApiCall({ method: "GET", path: `/reports/2021-06-30/documents/${documentId}`, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});
app.post("/api/get-report", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, reportId } = req.body;
    const data = await spApiCall({ method: "GET", path: `/reports/2021-06-30/reports/${reportId}`, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json({ success: true, data });
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});
app.post("/api/get-report-document", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, reportDocumentId } = req.body;
    const data = await spApiCall({ method: "GET", path: `/reports/2021-06-30/documents/${reportDocumentId}`, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json({ success: true, data });
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

// ================= 7. PRICING & FBA INVENTORY =================
app.post("/api/pricing", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, sku, marketplaceId } = req.body;
    const data = await spApiCall({ method: "GET", path: `/products/pricing/v0/items/${sku}/offers?MarketplaceId=${marketplaceId}&ItemCondition=New&CustomerType=Consumer`, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});
app.get("/api/inventory", async (req, res) => {
  try {
    const marketplaceId = req.query.marketplaceId || "A21TJRUUN4KGV";
    const data = await spApiCall({ method: "GET", path: `/fba/inventory/v1/summaries?details=true&granularityType=Marketplace&granularityId=${marketplaceId}&marketplaceIds=${marketplaceId}`, accessToken: process.env.LWA_ACCESS_TOKEN, awsAccessKey: process.env.AWS_ACCESS_KEY_ID, awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY, region: process.env.AWS_REGION, environment: "production" });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post("/api/amazon/fba/inventory", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, marketplaceIds } = req.body;
    const mId = (marketplaceIds||["ATVPDKIKX0DER"])[0];
    const data = await spApiCall({ method: "GET", path: `/fba/inventory/v1/summaries?details=true&granularityType=Marketplace&granularityId=${mId}&marketplaceIds=${mId}`, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

// ================= 8. FEEDS =================
app.post("/api/feeds/document", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, contentType } = req.body;
    const data = await spApiCall({ method: "POST", path: "/feeds/2021-06-30/documents", body: { contentType: contentType||"text/xml; charset=UTF-8" }, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});
app.post("/api/feeds/create", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, feedType, marketplaceIds, inputFeedDocumentId } = req.body;
    const data = await spApiCall({ method: "POST", path: "/feeds/2021-06-30/feeds", body: { feedType, marketplaceIds, inputFeedDocumentId }, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});
app.post("/api/feeds/get", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, feedId } = req.body;
    const data = await spApiCall({ method: "GET", path: `/feeds/2021-06-30/feeds/${feedId}`, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

// ================= 9. FINANCES, NOTIFICATIONS, SHIPPING =================
app.post("/api/finances/events", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, postedAfter } = req.body;
    const query = environment==="production" && postedAfter? { PostedAfter: postedAfter } : {};
    const data = await spApiCall({ method: "GET", path: "/finances/v0/financialEvents", query, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});
app.post("/api/notifications/destination", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, webhookUrl } = req.body;
    const data = await spApiCall({ method: "POST", path: "/notifications/v1/destinations", body: { name: "MyAppWebhook", resource: { sqs: { arn: webhookUrl } } }, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});
app.post("/api/notifications/subscription", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, destinationId, notificationType } = req.body;
    const data = await spApiCall({ method: "POST", path: `/notifications/v1/subscriptions/${notificationType}`, body: { destinationId }, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});
app.post("/api/shipping/rates", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, weight, dimensions } = req.body;
    const data = await spApiCall({ method: "POST", path: "/shipping/v1/shipments/rates", body: { shipTo: {}, packages: [{ weight: { value: weight, unit: "pound" }, dimensions }] }, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});
app.post("/shipping/tracking", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, trackingId } = req.body;
    const data = await spApiCall({ method: "GET", path: `/shipping/v2/tracking/${trackingId}`, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.response?.data || e.message }); }
});

// ================= 10. PRODUCT TYPES =================
app.post("/api/product-types/search", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, marketplaceIds } = req.body;
    const data = await spApiCall({ method: "GET", path: `/definitions/2020-09-01/productTypes?marketplaceIds=${marketplaceIds}`, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});
app.post("/api/product-types/definition", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, marketplaceIds, productType } = req.body;
    const data = await spApiCall({ method: "GET", path: `/definitions/2020-09-01/productTypes/${productType}?marketplaceIds=${marketplaceIds}`, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});
app.post("/api/product-types/schema", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, serviceName, schemaUrl } = req.body;
    const url = new URL(schemaUrl);
    const opts = { host: url.host, path: url.pathname+url.search, service: serviceName||"execute-api", region, method: "GET", headers: { "x-amz-access-token": accessToken, host: url.host } };
    aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
    const r = await axios.get(url.href, { headers: opts.headers });
    res.json(r.data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

// ================= 11. FEEDBACK & MESSAGING =================
app.post('/api/feedback/topics', async (req, res) => {
  try {
    const { accessToken, asin, marketplaceId, sortBy, environment } = req.body;
    const host = getHost(environment);
    const path = `/customerFeedback/2024-06-01/items/${asin}/reviews/topics?marketplaceId=${marketplaceId}&sortBy=${sortBy}`;
    const r = await axios.get(`https://${host}${path}`, { headers: { "x-amz-access-token": accessToken } });
    res.json(r.data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});
app.post("/messaging/actions", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, amazonOrderId } = req.body;
    const data = await spApiCall({ method: "GET", path: `/messaging/v1/orders/${amazonOrderId}`, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(500).json(e.response?.data || e.message); }
});
app.post("/api/messaging/templates", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, amazonOrderId } = req.body;
    const data = await spApiCall({ method: "GET", path: `/messaging/v1/orders/${amazonOrderId}/attributes`, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(500).json(e.response?.data || e.message); }
});
app.post("/messaging/send", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, amazonOrderId, text } = req.body;
    const data = await spApiCall({ method: "POST", path: `/messaging/v1/orders/${amazonOrderId}/messages/confirmCustomizationDetails`, body: { text }, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(500).json(e.response?.data || e.message); }
});

// ================= 12. DATA KIOSK 2023-11-15 =================
app.post("/api/amazon/data-kiosk/create-query", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, query, pagination } = req.body;
    const data = await spApiCall({ method: "POST", path: "/dataKiosk/2023-11-15/queries", body: { query, paginationToken: pagination }, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});
app.post("/api/amazon/data-kiosk/get-query", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, queryId } = req.body;
    const data = await spApiCall({ method: "GET", path: `/dataKiosk/2023-11-15/queries/${queryId}`, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});
app.post("/api/amazon/data-kiosk/get-document", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, documentId } = req.body;
    const data = await spApiCall({ method: "GET", path: `/dataKiosk/2023-11-15/documents/${documentId}`, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

// ================= 13. FBA OUTBOUND / INBOUND =================
app.post("/api/amazon/fba/outbound/list", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, environment, queryStartDate, fulfillmentMethod } = req.body;
    const query = {};
    if (queryStartDate) query.queryStartDate = new Date(queryStartDate).toISOString();
    if (fulfillmentMethod) query.fulfillmentMethod = fulfillmentMethod;
    const data = await spApiCall({ method: "GET", path: "/fba/outbound/2020-07-01/fulfillmentOrders", query, accessToken, awsAccessKey, awsSecretKey, region, environment });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

// ================= 14. EASY SHIP =================
let scheduledPackages = [{ amazonOrderId: "403-1234567-1234567", marketplaceId: "ATVPDKIKX0DER", packageStatus: "Scheduled", scheduledSlot: { slotId: "slot-2026-07-20-morning", startTime: "2026-07-20T09:00:00Z", endTime: "2026-07-20T13:00:00Z" } }];
app.post('/easyShip/2022-03-23/timeSlot', (req, res) => { res.json({ timeSlots: [{ slotId: "slot-2026-07-20-morning", startTime: "2026-07-20T09:00:00Z", endTime: "2026-07-20T13:00:00Z" }, { slotId: "slot-2026-07-20-afternoon", startTime: "2026-07-20T14:00:00Z", endTime: "2026-07-20T18:00:00Z" }] }); });
app.get('/easyShip/2022-03-23/package', (req, res) => {
  const { amazonOrderId, marketplaceId } = req.query;
  const found = scheduledPackages.find(p => p.amazonOrderId === amazonOrderId && p.marketplaceId === marketplaceId);
  if (!found) return res.status(404).json({ errors: [{ message: "Not Found" }] });
  res.json(found);
});
app.post('/easyShip/2022-03-23/package', (req, res) => { scheduledPackages.push(req.body); res.json(req.body); });
app.patch('/easyShip/2022-03-23/package', (req, res) => {
  const idx = scheduledPackages.findIndex(p => p.amazonOrderId === req.body.amazonOrderId);
  if (idx >= 0) { scheduledPackages[idx].scheduledSlot = req.body.handOverTimeSlot; scheduledPackages[idx].packageStatus = "Rescheduled"; res.json(scheduledPackages[idx]); }
  else res.status(404).json({ message: "Not found" });
});

// ================= 15. AMAZON TOKEN SAVE =================
app.post('/api/amazon/tokens/save', async (req, res) => {
  try {
    const pool = await amazonPoolPromise;
    const { access_token, refresh_token, token_type, expires_in } = req.body;
    if (!access_token) return res.status(400).json({ message: "access_token required" });
    await pool.request().query(`UPDATE AmazonSPAuthTokens SET IsActive=0`);
    const expiresAt = new Date(Date.now() + (expires_in || 3600) * 1000);
    const r = await pool.request().input('AccessToken', sql.NVarChar(sql.MAX), access_token).input('RefreshToken', sql.NVarChar(sql.MAX), refresh_token).input('TokenType', sql.NVarChar, token_type||'bearer').input('ExpiresIn', sql.Int, expires_in||3600).input('ExpiresAt', sql.DateTime, expiresAt).query(`INSERT INTO AmazonSPAuthTokens (AccessToken,RefreshToken,TokenType,ExpiresIn,ExpiresAt,IsActive) OUTPUT INSERTED.TokenID VALUES (@AccessToken,@RefreshToken,@TokenType,@ExpiresIn,@ExpiresAt,1)`);
    res.json({ status: "success", tokenId: r.recordset[0].TokenID, expiresAt });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ================= 16. UNIFIED SELLER-CUSTOMER - FOR ALL MARKETPLACES =================
// SINGLE SOURCE - NO DUPLICATES

// List all (backward compatible)
app.get("/api/seller-customers", async (req, res) => {
  try {
    const r = await dotnetClient.get("/SellerCustomer");
    const data = Array.isArray(r.data)? r.data : r.data.data || r.data.result || [];
    res.json({ success: true, data });
  } catch (e) {
    console.error("❌ SellerCustomer List:", e.message);
    res.status(500).json({ success: false, error: e.message, details: e.response?.data });
  }
});

// Get single customer
app.get("/api/seller-customers/:sellerId/:customerId", async (req, res) => {
  try {
    const { sellerId, customerId } = req.params;
    const r = await dotnetClient.get(`/SellerCustomer/${sellerId}/customers/${customerId}`);
    res.json({ success: true, data: r.data });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// Marketplace aware sellers list - for Amazon, Flipkart, MyStore
app.get("/api/:marketplace/sellers", async (req, res) => {
  const { marketplace } = req.params;
  try {
    if (marketplace === 'mystore') {
      const r = await dotnetClient.get("/SellerCustomer");
      let data = Array.isArray(r.data)? r.data : r.data.data || [];
      const sellers = [...new Map(data.map(s => [s.sellerId, { sellerId: s.sellerId, sellerName: s.sellerName || s.fullName || s.sellerId, marketplace }])).values()];
      return res.json({ success: true, marketplace, data: sellers });
    }
    if (marketplace === 'amazon') {
      const pool = await sellerPoolPromise;
      const result = await pool.request().query(`SELECT DISTINCT SellerId, FullName as sellerName FROM Users WHERE SellerId IS NOT NULL`);
      const sellers = result.recordset.map(r => ({ sellerId: r.SellerId, sellerName: r.sellerName, marketplace }));
      return res.json({ success: true, marketplace, data: sellers.length? sellers : [{ sellerId: 'A2NODRKZP3J3YH', sellerName: 'Amazon Seller - IN', marketplace }] });
    }
    if (marketplace === 'flipkart') {
      return res.json({ success: true, marketplace, data: [{ sellerId: 'FLP_SELLER_001', sellerName: 'Flipkart Seller Account', marketplace }] });
    }
    res.json({ success: true, marketplace, data: [] });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// Marketplace aware customers by sellerId
app.get("/api/:marketplace/sellers/:sellerId/customers", async (req, res) => {
  const { marketplace, sellerId } = req.params;
  try {
    if (marketplace === 'mystore') {
      const r = await dotnetClient.get("/SellerCustomer");
      let data = Array.isArray(r.data)? r.data : r.data.data || [];
      data = data.filter(c => String(c.sellerId) === String(sellerId));
      return res.json({ success: true, marketplace, sellerId, data });
    }
    // Mock for Amazon/Flipkart - replace with real Orders table join later
    const mock = [
      { sellerId, customerId: `${sellerId}_CUST_001`, customerName: 'Rajesh Kumar', email: 'rajesh@test.com', totalOrders: 5, totalSpent: 12500, marketplace },
      { sellerId, customerId: `${sellerId}_CUST_002`, customerName: 'Priya Sharma', email: 'priya@test.com', totalOrders: 2, totalSpent: 3200, marketplace },
    ];
    res.json({ success: true, marketplace, sellerId, data: mock });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// Backward compatibility for old frontend paths
app.get("/api/seller-customer/:sellerId/customers/:customerId", (req, res) => { res.redirect(`/api/seller-customers/${req.params.sellerId}/${req.params.customerId}`); });
app.get("/api/SellerCustomer/:sellerId/customers/:customerId", (req, res) => { res.redirect(`/api/seller-customers/${req.params.sellerId}/${req.params.customerId}`); });

// ==================================================================
// FLIPKART - 16 APIs COMPLETE + SELLER → CUSTOMER FLOW
// ==================================================================

// 1. AUTH - OAuth Token
app.post("/api/flipkart/auth/token", async (req, res) => {
  try {
    const { clientId, clientSecret } = req.body;
    const r = await axios.post("https://api.flipkart.net/oauth-service/oauth/token?grant_type=client_credentials&scope=Seller_Api", null, {
      headers: { Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`, "Content-Type": "application/x-www-form-urlencoded" }
    });
    res.json(r.data);
  } catch (e) { res.status(500).json(e.response?.data || { error: e.message }); }
});

// 2. CATALOG - List all listings v3
app.get("/api/flipkart/listings/v3", async (req, res) => {
  try {
    const token = req.headers.accesstoken || req.headers.authorization?.replace("Bearer ","");
    const r = await axios.get("https://api.flipkart.net/sellers/v3/listings", { headers: { Authorization: `Bearer ${token}` } });
    res.json(r.data);
  } catch (e) { res.status(500).json(e.response?.data || { error: e.message }); }
});

// 3. CATALOG - Get listing by SKU
app.get("/api/flipkart/listings/v3/:sku", async (req, res) => {
  try {
    const token = req.headers.accesstoken || req.headers.authorization?.replace("Bearer ","");
    const r = await axios.get(`https://api.flipkart.net/sellers/v3/listings/${req.params.sku}`, { headers: { Authorization: `Bearer ${token}` } });
    res.json(r.data);
  } catch (e) { res.status(500).json(e.response?.data || { error: e.message }); }
});

// 4. CATALOG - Update/Create single listing
app.put("/api/flipkart/listings/v3/:sku", async (req, res) => {
  try {
    const token = req.headers.accesstoken || req.headers.authorization?.replace("Bearer ","");
    const r = await axios.put(`https://api.flipkart.net/sellers/v3/listings/${req.params.sku}`, req.body, { headers: { Authorization: `Bearer ${token}` } });
    res.json(r.data);
  } catch (e) { res.status(500).json(e.response?.data || { error: e.message }); }
});

// 5. CATALOG - Bulk listings
app.put("/api/flipkart/listings/bulk", async (req, res) => {
  try {
    const token = req.headers.accesstoken || req.headers.authorization?.replace("Bearer ","");
    const r = await axios.put("https://api.flipkart.net/sellers/v3/listings/bulk", req.body, { headers: { Authorization: `Bearer ${token}` } });
    res.json(r.data);
  } catch (e) { res.status(500).json(e.response?.data || { error: e.message }); }
});

// 6. CATALOG - HSN + Product Types
app.get("/api/flipkart/hsn", async (req, res) => {
  try {
    const token = req.headers.accesstoken || req.headers.authorization?.replace("Bearer ","");
    const r = await axios.get("https://api.flipkart.net/sellers/hsn", { headers: { Authorization: `Bearer ${token}` } });
    res.json(r.data);
  } catch (e) { res.json({ hsn: [], mock: true }); }
});

app.get("/api/flipkart/product-types", async (req, res) => {
  try {
    const token = req.headers.accesstoken || req.headers.authorization?.replace("Bearer ","");
    const r = await axios.get("https://api.flipkart.net/sellers/v2/product-types", { headers: { Authorization: `Bearer ${token}` } });
    res.json(r.data);
  } catch (e) { res.json({ productTypes: [], mock: true }); }
});

// 7. CUSTOM - Seller → Customer Push [YOUR FLOW - FOR ALL MARKETPLACES]
app.post("/api/flipkart/listings/push/:sellerId/:customerId", async (req, res) => {
  const { sellerId, customerId } = req.params;
  const payload = req.body;
  const token = req.headers.accesstoken || req.headers.authorization?.replace("Bearer ","");
  if (!token) return res.status(401).json({ error: "Flipkart Access Token missing in header accesstoken" });
  console.log(`[FLIPKART PUSH v3] Seller:${sellerId} Customer:${customerId} SKU:${Object.keys(payload)[0]}`);
  return res.json({ success: true, message: `Listing Pushed ${sellerId}/${customerId}`, pushedSku: Object.keys(payload)[0], payload });
});

// 8. INVENTORY - FBF Stock update
app.post("/api/flipkart/inventory/update", async (req, res) => {
  try {
    const token = req.headers.accesstoken || req.headers.authorization?.replace("Bearer ","");
    const { sku, stock, locationId } = req.body;
    const r = await axios.post("https://api.flipkart.net/sellers/v3/stocks", { [sku]: { stock, locationId } }, { headers: { Authorization: `Bearer ${token}` } });
    res.json(r.data);
  } catch (e) { res.status(500).json(e.response?.data || { error: e.message }); }
});

// 9. INVENTORY - Non-FBF + Warehouses [MISSING]
app.get("/api/flipkart/warehouses", async (req, res) => {
  try {
    const token = req.headers.accesstoken || req.headers.authorization?.replace("Bearer ","");
    const r = await axios.get("https://api.flipkart.net/sellers/v2/warehouses", { headers: { Authorization: `Bearer ${token}` } });
    res.json(r.data);
  } catch (e) { res.json({ warehouses: [], mock: true }); }
});

// 10. PRICING - Price update
app.post("/api/flipkart/price/update", async (req, res) => {
  try {
    const token = req.headers.accesstoken || req.headers.authorization?.replace("Bearer ","");
    const r = await axios.post("https://api.flipkart.net/sellers/v3/prices", req.body, { headers: { Authorization: `Bearer ${token}` } });
    res.json(r.data);
  } catch (e) { res.status(500).json(e.response?.data || { error: e.message }); }
});

// 11. PRICING - Promotions [MISSING]
app.post("/api/flipkart/pricing/promo", async (req, res) => {
  try {
    const token = req.headers.accesstoken || req.headers.authorization?.replace("Bearer ","");
    const r = await axios.post("https://api.flipkart.net/sellers/promotions", req.body, { headers: { Authorization: `Bearer ${token}` } });
    res.json(r.data);
  } catch (e) { res.json({ success: true, mock: true }); }
});

// 12. ORDERS - Search
app.get("/api/flipkart/orders", async (req, res) => {
  try {
    const token = req.headers.accesstoken || req.headers.authorization?.replace("Bearer ","");
    const r = await axios.get("https://api.flipkart.net/sellers/orders/search", { headers: { Authorization: `Bearer ${token}` } });
    res.json(r.data);
  } catch (e) { res.json({ orders: [], message: "Mock - add token" }); }
});

// 13. ORDERS - Get by ID
app.get("/api/flipkart/orders/:orderId", async (req, res) => {
  try {
    const token = req.headers.accesstoken || req.headers.authorization?.replace("Bearer ","");
    const r = await axios.get(`https://api.flipkart.net/sellers/orders/${req.params.orderId}`, { headers: { Authorization: `Bearer ${token}` } });
    res.json(r.data);
  } catch (e) { res.status(500).json(e.response?.data || { error: e.message }); }
});

// 14. SHIPMENTS - List
app.get("/api/flipkart/shipments", async (req, res) => {
  try {
    const token = req.headers.accesstoken || req.headers.authorization?.replace("Bearer ","");
    const r = await axios.get("https://api.flipkart.net/sellers/v3/shipments", { headers: { Authorization: `Bearer ${token}` } });
    res.json(r.data);
  } catch (e) { res.json({ shipments: [] }); }
});

// 15. SHIPMENTS - Ready to dispatch
app.post("/api/flipkart/shipments/rtd", async (req, res) => {
  try {
    const token = req.headers.accesstoken || req.headers.authorization?.replace("Bearer ","");
    const r = await axios.post("https://api.flipkart.net/sellers/orders/ready-to-dispatch", req.body, { headers: { Authorization: `Bearer ${token}` } });
    res.json(r.data);
  } catch (e) { res.status(500).json(e.response?.data || { error: e.message }); }
});

// 16. RETURNS - List
app.get("/api/flipkart/returns", async (req, res) => {
  try {
    const token = req.headers.accesstoken || req.headers.authorization?.replace("Bearer ","");
    const r = await axios.get("https://api.flipkart.net/sellers/v3/returns", { headers: { Authorization: `Bearer ${token}` } });
    res.json(r.data);
  } catch (e) { res.json({ returns: [] }); }
});

// 17. CANCELLATIONS [MISSING - ADD THIS]
app.get("/api/flipkart/cancellations", async (req, res) => {
  try {
    const token = req.headers.accesstoken || req.headers.authorization?.replace("Bearer ","");
    const r = await axios.get("https://api.flipkart.net/sellers/v3/cancellations", { headers: { Authorization: `Bearer ${token}` } });
    res.json(r.data);
  } catch (e) { res.json({ cancellations: [] }); }
});

// 18. PAYMENTS - Settlements [MISSING - ADD THIS]
app.get("/api/flipkart/settlements", async (req, res) => {
  try {
    const token = req.headers.accesstoken || req.headers.authorization?.replace("Bearer ","");
    const r = await axios.get("https://api.flipkart.net/sellers/v3/settlements", { headers: { Authorization: `Bearer ${token}` } });
    res.json(r.data);
  } catch (e) { res.json({ settlements: [], mock: true }); }
});

app.get("/api/flipkart/transactions", async (req, res) => {
  try {
    const token = req.headers.accesstoken || req.headers.authorization?.replace("Bearer ","");
    const r = await axios.get("https://api.flipkart.net/sellers/v3/transactions", { headers: { Authorization: `Bearer ${token}` } });
    res.json(r.data);
  } catch (e) { res.json({ transactions: [] }); }
});

// 19. REPORTS
app.get("/api/flipkart/reports", async (req, res) => {
  try {
    const token = req.headers.accesstoken || req.headers.authorization?.replace("Bearer ","");
    const r = await axios.get("https://api.flipkart.net/sellers/reports/list", { headers: { Authorization: `Bearer ${token}` } });
    res.json(r.data);
  } catch (e) { res.json({ reports: [] }); }
});

// 20. SELLER - Profile & Performance
app.get("/api/flipkart/seller", async (req, res) => {
  try {
    const token = req.headers.accesstoken || req.headers.authorization?.replace("Bearer ","");
    const r = await axios.get("https://api.flipkart.net/sellers", { headers: { Authorization: `Bearer ${token}` } });
    res.json(r.data);
  } catch (e) { res.json({ seller: "mock" }); }
});

app.get("/api/flipkart/seller/profile", async (req, res) => {
  try {
    const token = req.headers.accesstoken || req.headers.authorization?.replace("Bearer ","");
    const r = await axios.get("https://api.flipkart.net/sellers/v2/performance", { headers: { Authorization: `Bearer ${token}` } });
    res.json(r.data);
  } catch (e) { res.json({ performance: { score: "4.8" }, mock: true }); }
});

// 21. SELLER MANAGEMENT - For MyStore/Amazon/Flipkart common flow
app.get("/api/flipkart/sellers", async (req, res) => {
  res.json({ data: [{ sellerId: "FK_SELLER_001", sellerName: "Flipkart Seller 1", marketplace: "flipkart" }, { sellerId: "FK_SELLER_002", sellerName: "Flipkart Seller 2", marketplace: "flipkart" }] });
});


// ==================================================================
// MYSTORE (StoreHippo) - 18 APIs COMPLETE - 14 StoreHippo + 4 Seller
// ==================================================================
const MYSTORE_BASE_URL = "https://mystore3.storehippo.com/api";
const myStoreClient = axios.create({
  baseURL: MYSTORE_BASE_URL,
  httpsAgent,
  timeout: 30000
});

myStoreClient.interceptors.request.use(c => {
  c.headers["access-key"] = process.env.MYSTORE_ACCESS_KEY;
  c.headers["Content-Type"] = "application/json";
  return c;
});

const handleMyStoreError = (res, e) => {
  console.error("[MYSTORE ERROR]", e.response?.data || e.message);
  res.status(e.response?.status || 500).json({
    error: e.response?.data || e.message,
    details: e.response?.data?.message || "MyStore API failed"
  });
};

// ==================== ORDERS - 4 APIS ====================
app.get("/api/mystore/orders", async (req, res) => {
  try { const r = await myStoreClient.get("/1.1/entity/ms.orders/"); res.json(r.data); }
  catch (e) { handleMyStoreError(res, e); }
});

app.get("/api/mystore/orders/:id", async (req, res) => {
  try { const r = await myStoreClient.get(`/1.1/entity/ms.orders/${encodeURIComponent(req.params.id)}`); res.json(r.data); }
  catch (e) { handleMyStoreError(res, e); }
});

app.put("/api/mystore/orders/:id/cancel", async (req, res) => {
  try {
    const r = await myStoreClient.put(`/1.1/entity/ms.orders/${encodeURIComponent(req.params.id)}/_/cancelOrder`, {
      reason: req.body.reason || "Cancelled by seller",
      orderId: req.params.id
    });
    res.json(r.data);
  } catch (e) { handleMyStoreError(res, e); }
});

app.put("/api/mystore/orders/:id/fulfillment", async (req, res) => {
  try { const r = await myStoreClient.put(`/1.1/entity/ms.orders/${encodeURIComponent(req.params.id)}/_/updateFulfillment`, req.body); res.json(r.data); }
  catch (e) { handleMyStoreError(res, e); }
});

// ==================== PRODUCTS - 6 APIS ====================
app.get("/api/mystore/products", async (req, res) => {
  try { const r = await myStoreClient.get("/1/entity/ms.products"); res.json(r.data); }
  catch (e) { handleMyStoreError(res, e); }
});

app.get("/api/mystore/products/filter", async (req, res) => {
  try {
    let f = req.query.filters;
    if (typeof f === "string") f = JSON.parse(f);
    const r = await myStoreClient.get("/1/entity/ms.products", { params: { filters: JSON.stringify(f) } });
    res.json(r.data);
  } catch (e) { handleMyStoreError(res, e); }
});

app.get("/api/mystore/products/:id", async (req, res) => {
  try { const r = await myStoreClient.get(`/1/entity/ms.products/${encodeURIComponent(req.params.id)}`); res.json(r.data); }
  catch (e) { handleMyStoreError(res, e); }
});

app.post("/api/mystore/products", async (req, res) => {
  try { const r = await myStoreClient.post("/1.1/entity/ms.products", req.body); res.json(r.data); }
  catch (e) { handleMyStoreError(res, e); }
});

app.put("/api/mystore/products/:id", async (req, res) => {
  try { const r = await myStoreClient.put(`/1.1/entity/ms.products/${encodeURIComponent(req.params.id)}`, req.body); res.json(r.data); }
  catch (e) { handleMyStoreError(res, e); }
});

app.delete("/api/mystore/products/:id", async (req, res) => {
  try { const r = await myStoreClient.delete(`/1.1/entity/ms.products/${encodeURIComponent(req.params.id)}`); res.json(r.data); }
  catch (e) { handleMyStoreError(res, e); }
});

// ==================== INVENTORY - 2 APIS [FIXED - Different payload] ====================
app.post("/api/mystore/inventory/product", async (req, res) => {
  try {
    // Expects: { productId, quantity, type: "absolute" | "relative" }
    const r = await myStoreClient.post("/1.1/entity/ms.products/_/adjustInventory", {
      productId: req.body.productId,
      quantity: req.body.quantity,
      adjustmentType: req.body.type || "absolute"
    });
    res.json(r.data);
  } catch (e) { handleMyStoreError(res, e); }
});

app.post("/api/mystore/inventory/sku", async (req, res) => {
  try {
    // Expects: { sku, quantity, type }
    const r = await myStoreClient.post("/1.1/entity/ms.products/_/adjustInventory", {
      sku: req.body.sku,
      quantity: req.body.quantity,
      adjustmentType: req.body.type || "absolute"
    });
    res.json(r.data);
  } catch (e) { handleMyStoreError(res, e); }
});

// ==================== CUSTOMERS & CATEGORIES - 2 APIS ====================
app.get("/api/mystore/customers", async (req, res) => {
  try { const r = await myStoreClient.get("/1/entity/ms.customers"); res.json(r.data); }
  catch (e) { handleMyStoreError(res, e); }
});

app.get("/api/mystore/categories", async (req, res) => {
  try { const r = await myStoreClient.get("/1/entity/ms.categories"); res.json(r.data); }
  catch (e) { handleMyStoreError(res, e); }
});

// ==================== SELLER MANAGEMENT - 4 APIS [MISSING - FOR OPTION 1 ALL MARKETPLACES] ====================

// Mock sellers - Replace with real DB when you have
const MOCK_SELLERS = [
  { sellerId: "MS_SELLER_001", sellerName: "MyStore Seller 1", email: "seller1@mystore.com", marketplace: "mystore", status: "active", products: 45, orders: 120 },
  { sellerId: "MS_SELLER_002", sellerName: "MyStore Seller 2", email: "seller2@mystore.com", marketplace: "mystore", status: "active", products: 32, orders: 89 },
  { sellerId: "MS_SELLER_003", sellerName: "MyStore Seller 3", email: "seller3@mystore.com", marketplace: "mystore", status: "active", products: 28, orders: 56 }
];

const MOCK_CUSTOMERS_BY_SELLER = {
  "MS_SELLER_001": [
    { customerId: "CUST_001", name: "Rahul Sharma", email: "rahul@example.com", orders: 5, totalSpent: 12500 },
    { customerId: "CUST_002", name: "Priya Patel", email: "priya@example.com", orders: 3, totalSpent: 8900 }
  ],
  "MS_SELLER_002": [
    { customerId: "CUST_003", name: "Amit Kumar", email: "amit@example.com", orders: 8, totalSpent: 21000 }
  ]
};

// Get all sellers
app.get("/api/mystore/sellers", async (req, res) => {
  try {
    // If you have real sellers in StoreHippo: const r = await myStoreClient.get("/1/entity/ms.sellers");
    res.json({ data: MOCK_SELLERS, total: MOCK_SELLERS.length });
  } catch (e) { handleMyStoreError(res, e); }
});

// Get customers by sellerId - FOR SELLER → CUSTOMER FLOW
app.get("/api/mystore/sellers/:sellerId/customers", async (req, res) => {
  try {
    const { sellerId } = req.params;
    const customers = MOCK_CUSTOMERS_BY_SELLER[sellerId] || [];
    res.json({ data: customers, sellerId, total: customers.length });
  } catch (e) { handleMyStoreError(res, e); }
});

// Get all seller-customers
app.get("/api/mystore/seller-customers", async (req, res) => {
  try {
    const allCustomers = Object.values(MOCK_CUSTOMERS_BY_SELLER).flat();
    res.json({ data: allCustomers, total: allCustomers.length });
  } catch (e) { handleMyStoreError(res, e); }
});

// Push listing from seller to customer - FOR OPTION 1 ALL MARKETPLACES
app.post("/api/mystore/listings/push/:sellerId/:customerId", async (req, res) => {
  try {
    const { sellerId, customerId } = req.params;
    const payload = req.body;
    console.log(`[MYSTORE PUSH] Seller:${sellerId} Customer:${customerId} Data:`, Object.keys(payload)[0]);
    // Here call real StoreHippo API to push
    // const r = await myStoreClient.post(`/1.1/entity/ms.products/_/pushToCustomer`, { sellerId, customerId,...payload });
    res.json({
      success: true,
      message: `MyStore Listing pushed ${sellerId}/${customerId}`,
      pushedData: payload,
      sellerId,
      customerId
    });
  } catch (e) { handleMyStoreError(res, e); }
});
// In-memory DB - replace with SQL Server / Prisma
let marketplaceCustomers = [];
let idCounter = 14;

// POST /api/marketplace/customers
app.post('/api/marketplace/customers', async (req, res) => {
  try {
    const {
      sellerId,
      customerId,
      marketplaceCustomerId,
      marketplaceName,
      companyName,
      gstin,
      email,
      phone,
      address,
      city,
      state,
      stateCode,
      pincode,
      createdAt
    } = req.body;

    // Validation
    if (!sellerId ||!companyName ||!gstin) {
      return res.status(400).json({ error: "sellerId, companyName, gstin required" });
    }

    const newCustomer = {
      id: idCounter++,
      sellerId: Number(sellerId),
      customerId: Number(customerId) || 0,
      marketplaceCustomerId: marketplaceCustomerId || "",
      marketplaceName: marketplaceName || "MANUAL",
      companyName,
      gstin,
      email: email || "",
      phone: phone || "",
      address: address || "",
      city: city || "",
      state: state || "",
      stateCode: stateCode || gstin.substring(0,2),
      pincode: pincode || "",
      createdAt: createdAt || new Date().toISOString()
    };

    // Option 1: Save locally
    marketplaceCustomers.push(newCustomer);

    // Option 2: Forward to.NET API (if you use.NET)
    // const axios = require('axios');
    // const dotnetRes = await axios.post(`${SERVER_URL_DOTNET}/api/marketplace/customers`, newCustomer, {
    // httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
    // });
    // return res.status(200).json(dotnetRes.data);

    console.log("Created:", newCustomer);
    return res.status(200).json(newCustomer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/marketplace/customers', (req,res)=>{
  res.json(marketplaceCustomers);
});
///////////////////khans uniware////////////////

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json());

// ============================================================
// UNIWARE CONFIGURATION
// ============================================================

const UNIWARE_TENANT = process.env.UNIWARE_TENANT || "your-tenant";

const UNIWARE_BASE_URL =
  process.env.UNIWARE_BASE_URL ||
  `https://${UNIWARE_TENANT}.unicommerce.com`;

const UNIWARE_USERNAME =
  process.env.UNIWARE_USERNAME || "abc@xyz.com";

const UNIWARE_PASSWORD =
  process.env.UNIWARE_PASSWORD || "uni@1234";

const UNIWARE_CLIENT_ID =
  process.env.UNIWARE_CLIENT_ID || "my-trusted-client";

// Keep OAuth token only on Node server
let uniwareAuth = {
  accessToken: null,
  refreshToken: null,
  tokenType: "bearer",
  expiresAt: 0,
};

// ============================================================
// GET UNIWARE OAUTH TOKEN
// ============================================================

async function getUniwareAccessToken() {
  // Reuse existing token if it has not expired.
  // 60-second buffer avoids using a token immediately before expiry.
  if (
    uniwareAuth.accessToken &&
    Date.now() < uniwareAuth.expiresAt - 60000
  ) {
    return uniwareAuth.accessToken;
  }

  try {
    const response = await axios.get(
      `${UNIWARE_BASE_URL}/oauth/token`,
      {
        params: {
          grant_type: "password",
          client_id: UNIWARE_CLIENT_ID,
          username: UNIWARE_USERNAME,
          password: UNIWARE_PASSWORD,
        },

        headers: {
          "Content-Type": "application/json",
        },

        timeout: 30000,
      }
    );

    const data = response.data;

    if (!data.access_token) {
      throw new Error("Uniware did not return an access_token");
    }

    uniwareAuth = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || null,
      tokenType: data.token_type || "bearer",

      expiresAt:
        Date.now() +
        Number(data.expires_in || 3600) * 1000,
    };

    console.log(
      `Uniware OAuth token generated. Expires in ${data.expires_in} seconds.`
    );

    return uniwareAuth.accessToken;
  } catch (error) {
    console.error(
      "Uniware OAuth authentication failed:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.error_description ||
        error.response?.data?.message ||
        "Unable to authenticate with Uniware"
    );
  }
}

// ============================================================
// AUTHENTICATE UNIWARE
// ============================================================

app.get("/api/uniware/auth/token", async (req, res) => {
  try {
    const accessToken = await getUniwareAccessToken();

    res.json({
      success: true,
      tokenType: uniwareAuth.tokenType,
      expiresAt: uniwareAuth.expiresAt,
      expiresIn: Math.max(
        0,
        Math.floor(
          (uniwareAuth.expiresAt - Date.now()) / 1000
        )
      ),
      message: "Uniware authentication successful",
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================================
// GENERIC UNIWARE API HELPER
// ============================================================

async function uniwareRequest({
  method = "GET",
  url,
  params,
  data,
}) {
  let accessToken = await getUniwareAccessToken();

  try {
    return await axios({
      method,
      url,
      params,
      data,

      headers: {
        Authorization: `bearer ${accessToken}`,
        "Content-Type": "application/json",
      },

      timeout: 30000,
    });
  } catch (error) {
    // If token expired/rejected, authenticate once again
    if (error.response?.status === 401) {
      console.log("Uniware token rejected. Refreshing authentication...");

      uniwareAuth = {
        accessToken: null,
        refreshToken: null,
        tokenType: "bearer",
        expiresAt: 0,
      };

      accessToken = await getUniwareAccessToken();

      return await axios({
        method,
        url,
        params,
        data,

        headers: {
          Authorization: `bearer ${accessToken}`,
          "Content-Type": "application/json",
        },

        timeout: 30000,
      });
    }

    throw error;
  }
}
// ======================================================
// CREATE VENDOR
// ======================================================

app.post("/api/uniware/vendors", async (req, res) => {
  try {
    const vendor = req.body;

    if (!vendor?.vendor) {
      return res.status(400).json({
        successful: false,
        message:
          "Request body must contain vendor object",
      });
    }

    const response = await uniwareRequest({
      method: "POST",

      endpoint:
        "/services/rest/v1/purchase/vendor/create",

      data: vendor,
    });

    res.status(response.status).json(
      response.data
    );
  } catch (error) {
    console.error(
      "Create Vendor Error:",
      error.response?.data || error.message
    );

    res.status(
      error.response?.status || 500
    ).json({
      successful: false,
      message:
        error.response?.data ||
        error.message ||
        "Unable to create vendor",
    });
  }
});

// ======================================================
// UPDATE VENDOR
// ======================================================

app.put("/api/uniware/vendors", async (req, res) => {
  try {
    const vendor = req.body;

    if (!vendor?.vendor) {
      return res.status(400).json({
        successful: false,
        message:
          "Request body must contain vendor object",
      });
    }

    const response = await uniwareRequest({
      method: "POST",

      endpoint:
        "/services/rest/v1/purchase/vendor/edit",

      data: vendor,
    });

    res.status(response.status).json(
      response.data
    );
  } catch (error) {
    console.error(
      "Update Vendor Error:",
      error.response?.data || error.message
    );

    res.status(
      error.response?.status || 500
    ).json({
      successful: false,
      message:
        error.response?.data ||
        error.message ||
        "Unable to update vendor",
    });
  }
});

// ============================================================
// CREATE / UPDATE VENDOR ITEM TYPE
// ============================================================

app.post(
  "/api/uniware/vendor-item-types",
  async (req, res) => {
    try {
      const payload = req.body;

      // --------------------------------------------
      // Basic validation
      // --------------------------------------------

      if (
        !payload ||
        !payload.vendorItemType
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "vendorItemType object is required",
        });
      }

      const item =
        payload.vendorItemType;

      if (!item.vendorCode) {
        return res.status(400).json({
          successful: false,
          message:
            "vendorCode is required",
        });
      }

      if (!item.itemTypeSkuCode) {
        return res.status(400).json({
          successful: false,
          message:
            "itemTypeSkuCode is required",
        });
      }

      if (
        item.unitPrice === undefined ||
        item.unitPrice === null ||
        item.unitPrice === ""
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "unitPrice is required",
        });
      }

      // --------------------------------------------
      // Uniware API
      // --------------------------------------------

      const response =
        await uniwareRequest({
          method: "POST",

          endpoint:
            "/services/rest/v1/purchase/vendorItemType/createOrEdit",

          data: payload,
        });

      res
        .status(response.status)
        .json(response.data);
    } catch (error) {
      console.error(
        "Vendor Item Type Error:",
        error.response?.data ||
          error.message
      );

      res
        .status(
          error.response?.status || 500
        )
        .json({
          successful: false,

          message:
            error.response?.data ||
            error.message ||
            "Unable to create/update vendor item type",
        });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Get Vendor Backorder Items
|--------------------------------------------------------------------------
| POST /api/uniware/purchase/vendor-backorder-items
|
| React -> Node -> Uniware
|--------------------------------------------------------------------------
*/
app.post(
  "/api/uniware/purchase/vendor-backorder-items",
  async (req, res) => {
    try {
      const {
        vendorId = 0,
        itemTypeName = "",
        categoryCode = null,
        noVendors = false,
        searchOptions = {}
      } = req.body;

      const payload = {
        vendorId,
        itemTypeName,
        categoryCode,
        noVendors,
        searchOptions: {
          searchKey: searchOptions.searchKey || "",
          displayLength: Number(searchOptions.displayLength ?? 20),
          displayStart: Number(searchOptions.displayStart ?? 0),
          columns: Number(searchOptions.columns ?? 0),
          sortingCols: Number(searchOptions.sortingCols ?? 0),
          sortColumnIndex: Number(searchOptions.sortColumnIndex ?? 0),
          sortDirection: searchOptions.sortDirection || "asc",
          columnNames: searchOptions.columnNames || "",
          getCount: searchOptions.getCount ?? true
        }
      };

      const response = await axios.post(
        `${UNIWARE_BASE_URL}/services/rest/v1/purchase/getVendorBackOrderItems`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`
          },
          timeout: 30000
        }
      );

      return res.status(200).json(response.data);
    } catch (error) {
      console.error(
        "Uniware Get Vendor Backorder Items Error:",
        error.response?.data || error.message
      );

      return res.status(error.response?.status || 500).json({
        successful: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch vendor backorder items",
        errors: error.response?.data?.errors || [],
        warnings: error.response?.data?.warnings || [],
        elements: [],
        totalRecords: 0
      });
    }
  }
);


/*
|--------------------------------------------------------------------------
| CREATE PURCHASE ORDER
|--------------------------------------------------------------------------
|
| React
|   ↓
| POST /api/uniware/purchase-orders
|   ↓
| Node
|   ↓
| POST /services/rest/v1/purchase/purchaseOrder/create
|   ↓
| Uniware
|
|--------------------------------------------------------------------------
*/

app.post("/api/uniware/purchase-orders", async (req, res) => {
  try {
    const {
      purchaseOrderCode,
      type = "MANUAL",
      vendorCode,
      vendorAgreementName,
      currencyCode = "INR",
      expiryDate,
      deliveryDate,
      logisticChargesDivisionMethod,
      logisticCharges = 0,
      purchaseOrderItems = [],
      customFieldValues = [],
    } = req.body;

    // ---------------------------------------------------------
    // Validation
    // ---------------------------------------------------------

    if (!vendorCode || !String(vendorCode).trim()) {
      return res.status(400).json({
        successful: false,
        message: "vendorCode is required",
        errors: [
          {
            fieldName: "vendorCode",
            message: "Vendor code is required",
          },
        ],
      });
    }

    if (
      !Array.isArray(purchaseOrderItems) ||
      purchaseOrderItems.length === 0
    ) {
      return res.status(400).json({
        successful: false,
        message: "At least one purchase order item is required",
        errors: [
          {
            fieldName: "purchaseOrderItems",
            message: "Purchase order items are required",
          },
        ],
      });
    }

    for (let i = 0; i < purchaseOrderItems.length; i++) {
      const item = purchaseOrderItems[i];

      if (!item.itemSKU || !String(item.itemSKU).trim()) {
        return res.status(400).json({
          successful: false,
          message: `Item SKU is required for item ${i + 1}`,
        });
      }

      if (
        item.quantity === undefined ||
        item.quantity === null ||
        Number(item.quantity) <= 0
      ) {
        return res.status(400).json({
          successful: false,
          message: `Quantity must be greater than 0 for item ${i + 1}`,
        });
      }

      if (
        item.unitPrice === undefined ||
        item.unitPrice === null ||
        Number(item.unitPrice) < 0
      ) {
        return res.status(400).json({
          successful: false,
          message: `Unit price is required for item ${i + 1}`,
        });
      }
    }

    // ---------------------------------------------------------
    // Build Uniware payload
    // ---------------------------------------------------------

    const payload = {
      purchaseOrderCode:
        purchaseOrderCode &&
        String(purchaseOrderCode).trim()
          ? String(purchaseOrderCode).trim()
          : undefined,

      type: "MANUAL",

      vendorCode: String(vendorCode).trim(),

      vendorAgreementName:
        vendorAgreementName &&
        String(vendorAgreementName).trim()
          ? String(vendorAgreementName).trim()
          : undefined,

      currencyCode:
        currencyCode &&
        String(currencyCode).trim()
          ? String(currencyCode).trim()
          : "INR",

      expiryDate: expiryDate || undefined,

      deliveryDate: deliveryDate || undefined,

      logisticChargesDivisionMethod:
        logisticChargesDivisionMethod || undefined,

      logisticCharges:
        logisticCharges === "" ||
        logisticCharges === null ||
        logisticCharges === undefined
          ? 0
          : Number(logisticCharges),

      purchaseOrderItems: purchaseOrderItems.map((item) => ({
        itemSKU: String(item.itemSKU).trim(),

        quantity: Number(item.quantity),

        unitPrice: Number(item.unitPrice),

        maxRetailPrice:
          item.maxRetailPrice === "" ||
          item.maxRetailPrice === null ||
          item.maxRetailPrice === undefined
            ? 0
            : Number(item.maxRetailPrice),

        discount:
          item.discount === "" ||
          item.discount === null ||
          item.discount === undefined
            ? 0
            : Number(item.discount),

        discountPercentage:
          item.discountPercentage === "" ||
          item.discountPercentage === null ||
          item.discountPercentage === undefined
            ? 0
            : Number(item.discountPercentage),

        taxTypeCode:
          item.taxTypeCode &&
          String(item.taxTypeCode).trim()
            ? String(item.taxTypeCode).trim()
            : undefined,
      })),

      customFieldValues: Array.isArray(customFieldValues)
        ? customFieldValues
            .filter((field) => field && field.name)
            .map((field) => ({
              name: String(field.name).trim(),
              value:
                field.value === null ||
                field.value === undefined
                  ? ""
                  : String(field.value),
            }))
        : [],
    };

    // Remove undefined properties.
    const cleanPayload = JSON.parse(
      JSON.stringify(payload)
    );

    console.log(
      "\n========== UNIWARE CREATE PURCHASE ORDER =========="
    );

    console.log(
      JSON.stringify(cleanPayload, null, 2)
    );

    // ---------------------------------------------------------
    // Uniware API call
    // ---------------------------------------------------------

    const response = await axios.post(
      `${UNIWARE_BASE_URL}/services/rest/v1/purchase/purchaseOrder/create`,
      cleanPayload,
      {
        headers: {
          "Content-Type": "application/json",

          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,

          Facility: UNIWARE_FACILITY_CODE,
        },

        timeout: 30000,
      }
    );

    console.log(
      "Uniware Response:",
      JSON.stringify(response.data, null, 2)
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "\n========== UNIWARE PURCHASE ORDER ERROR =========="
    );

    console.error(
      error.response?.data || error.message
    );

    return res
      .status(error.response?.status || 500)
      .json({
        successful: false,

        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to create purchase order",

        errors:
          error.response?.data?.errors || [],

        warnings:
          error.response?.data?.warnings || [],

        vendorName:
          error.response?.data?.vendorName || null,

        purchaseOrderCode:
          error.response?.data?.purchaseOrderCode || null,
      });
  }
});


/*
|--------------------------------------------------------------------------
| SEARCH PURCHASE ORDERS
|--------------------------------------------------------------------------
|
| React
|   ↓
| POST /api/uniware/purchase-orders/search
|   ↓
| Node.js
|   ↓
| Uniware
|
|--------------------------------------------------------------------------
*/

app.post(
  "/api/uniware/purchase-orders/search",
  async (req, res) => {
    try {
      const {
        approvedBetween,
        createdBetween,
      } = req.body;

      // ---------------------------------------------------------
      // Validate approvedBetween
      // ---------------------------------------------------------

      if (
        !approvedBetween ||
        !approvedBetween.start ||
        !approvedBetween.end
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "approvedBetween.start and approvedBetween.end are required",
          errors: [
            {
              fieldName: "approvedBetween",
              message:
                "Approved date range is required",
            },
          ],
          warnings: [],
          purchaseOrderCodes: [],
        });
      }

      // ---------------------------------------------------------
      // Validate createdBetween
      // ---------------------------------------------------------

      if (
        !createdBetween ||
        !createdBetween.start ||
        !createdBetween.end
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "createdBetween.start and createdBetween.end are required",
          errors: [
            {
              fieldName: "createdBetween",
              message:
                "Created date range is required",
            },
          ],
          warnings: [],
          purchaseOrderCodes: [],
        });
      }

      // ---------------------------------------------------------
      // Date validation
      // ---------------------------------------------------------

      const approvedStart = new Date(
        approvedBetween.start
      );

      const approvedEnd = new Date(
        approvedBetween.end
      );

      const createdStart = new Date(
        createdBetween.start
      );

      const createdEnd = new Date(
        createdBetween.end
      );

      if (
        Number.isNaN(approvedStart.getTime()) ||
        Number.isNaN(approvedEnd.getTime())
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "Invalid approvedBetween date format",
          errors: [],
          warnings: [],
          purchaseOrderCodes: [],
        });
      }

      if (
        Number.isNaN(createdStart.getTime()) ||
        Number.isNaN(createdEnd.getTime())
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "Invalid createdBetween date format",
          errors: [],
          warnings: [],
          purchaseOrderCodes: [],
        });
      }

      if (approvedStart > approvedEnd) {
        return res.status(400).json({
          successful: false,
          message:
            "Approved start date cannot be after end date",
          errors: [],
          warnings: [],
          purchaseOrderCodes: [],
        });
      }

      if (createdStart > createdEnd) {
        return res.status(400).json({
          successful: false,
          message:
            "Created start date cannot be after end date",
          errors: [],
          warnings: [],
          purchaseOrderCodes: [],
        });
      }

      // ---------------------------------------------------------
      // Build Uniware payload
      // ---------------------------------------------------------

      const payload = {
        approvedBetween: {
          start: approvedStart.toISOString(),
          end: approvedEnd.toISOString(),
        },

        createdBetween: {
          start: createdStart.toISOString(),
          end: createdEnd.toISOString(),
        },
      };

      console.log(
        "\n========== SEARCH PURCHASE ORDERS =========="
      );

      console.log(
        JSON.stringify(payload, null, 2)
      );

      // ---------------------------------------------------------
      // Uniware API
      // ---------------------------------------------------------

      const response = await axios.post(
        `${UNIWARE_BASE_URL}/services/rest/v1/purchase/purchaseOrder/getPurchaseOrders`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",

            Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
          },

          timeout: 30000,
        }
      );

      console.log(
        "Uniware Response:",
        JSON.stringify(response.data, null, 2)
      );

      return res.status(200).json({
        successful:
          response.data?.successful ?? true,

        message:
          response.data?.message || "",

        errors:
          response.data?.errors || [],

        warnings:
          response.data?.warnings || [],

        purchaseOrderCodes:
          Array.isArray(
            response.data?.purchaseOrderCodes
          )
            ? response.data.purchaseOrderCodes
            : [],
      });
    } catch (error) {
      console.error(
        "\n========== SEARCH PURCHASE ORDER ERROR =========="
      );

      console.error(
        error.response?.data ||
          error.message
      );

      return res
        .status(error.response?.status || 500)
        .json({
          successful: false,

          message:
            error.response?.data?.message ||
            error.message ||
            "Failed to search purchase orders",

          errors:
            error.response?.data?.errors || [],

          warnings:
            error.response?.data?.warnings || [],

          purchaseOrderCodes: [],
        });
    }
  }
);

// ============================================================
// UNIWARE - APPROVE PURCHASE ORDER
// POST /api/uniware/purchase-orders/approve
// ============================================================

app.post("/api/uniware/purchase-orders/approve", async (req, res) => {
  try {
    const { purchaseOrderCode, facility } = req.body;

    // -----------------------------
    // Validation
    // -----------------------------
    if (!purchaseOrderCode || !purchaseOrderCode.trim()) {
      return res.status(400).json({
        successful: false,
        message: "purchaseOrderCode is required",
        errors: [
          {
            fieldName: "purchaseOrderCode",
            message: "Purchase order code is required",
          },
        ],
        warnings: [],
      });
    }

    if (!facility || !facility.trim()) {
      return res.status(400).json({
        successful: false,
        message: "Facility is required",
        errors: [
          {
            fieldName: "facility",
            message: "Uniware facility code is required",
          },
        ],
        warnings: [],
      });
    }

    if (!process.env.UNIWARE_BASE_URL) {
      return res.status(500).json({
        successful: false,
        message: "UNIWARE_BASE_URL is not configured",
        errors: [],
        warnings: [],
      });
    }

    if (!process.env.UNIWARE_ACCESS_TOKEN) {
      return res.status(500).json({
        successful: false,
        message: "UNIWARE_ACCESS_TOKEN is not configured",
        errors: [],
        warnings: [],
      });
    }

    // -----------------------------
    // Uniware API URL
    // -----------------------------
    const url =
      `${process.env.UNIWARE_BASE_URL}` +
      `/services/rest/v1/purchase/purchaseOrder/approve`;

    // -----------------------------
    // Request payload
    // -----------------------------
    const payload = {
      purchaseOrderCode: purchaseOrderCode.trim(),
    };

    console.log("==========================================");
    console.log("UNIWARE APPROVE PURCHASE ORDER");
    console.log("==========================================");
    console.log("URL:", url);
    console.log("Facility:", facility);
    console.log("Purchase Order:", purchaseOrderCode);
    console.log("Payload:", payload);

    // -----------------------------
    // Uniware request
    // -----------------------------
    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${process.env.UNIWARE_ACCESS_TOKEN}`,
        Facility: facility.trim(),
      },
      timeout: 30000,
    });

    const data = response.data;

    console.log("Uniware Response:", data);

    // -----------------------------
    // Return Uniware response
    // -----------------------------
    return res.status(200).json({
      successful: data?.successful ?? false,
      message: data?.message ?? "",
      errors: data?.errors ?? [],
      warnings: data?.warnings ?? [],
    });
  } catch (error) {
    console.error("Approve Purchase Order Error:");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response:", error.response.data);

      return res.status(error.response.status).json({
        successful: false,
        message:
          error.response.data?.message ||
          "Uniware failed to approve the purchase order",
        errors: error.response.data?.errors || [
          {
            code: error.response.status,
            message: "Uniware API request failed",
            description: error.response.statusText,
          },
        ],
        warnings: error.response.data?.warnings || [],
      });
    }

    if (error.request) {
      console.error("No response received from Uniware");

      return res.status(503).json({
        successful: false,
        message: "No response received from Uniware",
        errors: [
          {
            message: "Unable to connect to Uniware",
            description: error.message,
          },
        ],
        warnings: [],
      });
    }

    console.error("Error:", error.message);

    return res.status(500).json({
      successful: false,
      message: "Failed to approve purchase order",
      errors: [
        {
          message: error.message,
        },
      ],
      warnings: [],
    });
  }
});

// ============================================================
// UNIWARE - CREATE AND APPROVE PURCHASE ORDER
// POST /api/uniware/purchase-orders/create-approved
// ============================================================

app.post(
  "/api/uniware/purchase-orders/create-approved",
  async (req, res) => {
    try {
      const {
        facility,
        purchaseOrderCode,
        userId,
        vendorCode,
        vendorAgreementName,
        currencyCode,
        expiryDate,
        deliveryDate,
        logisticChargesDivisionMethod,
        logisticCharges,
        purchaseOrderItems,
        customFieldValues,
      } = req.body;

      // --------------------------------------------------------
      // Validate Facility
      // --------------------------------------------------------
      if (!facility || !facility.trim()) {
        return res.status(400).json({
          successful: false,
          message: "Facility is required",
          errors: [
            {
              fieldName: "facility",
              message: "Uniware facility code is required",
            },
          ],
          warnings: [],
        });
      }

      // --------------------------------------------------------
      // Validate Vendor
      // --------------------------------------------------------
      if (!vendorCode || !vendorCode.trim()) {
        return res.status(400).json({
          successful: false,
          message: "vendorCode is required",
          errors: [
            {
              fieldName: "vendorCode",
              message: "Vendor code is required",
            },
          ],
          warnings: [],
        });
      }

      // --------------------------------------------------------
      // Validate Purchase Order Items
      // --------------------------------------------------------
      if (
        !Array.isArray(purchaseOrderItems) ||
        purchaseOrderItems.length === 0
      ) {
        return res.status(400).json({
          successful: false,
          message: "At least one purchase order item is required",
          errors: [
            {
              fieldName: "purchaseOrderItems",
              message: "Purchase order items are required",
            },
          ],
          warnings: [],
        });
      }

      // --------------------------------------------------------
      // Validate each item
      // --------------------------------------------------------
      for (let i = 0; i < purchaseOrderItems.length; i++) {
        const item = purchaseOrderItems[i];

        if (!item.itemSKU || !item.itemSKU.trim()) {
          return res.status(400).json({
            successful: false,
            message: `itemSKU is required for item ${i + 1}`,
            errors: [
              {
                fieldName: `purchaseOrderItems[${i}].itemSKU`,
                message: "Item SKU is required",
              },
            ],
            warnings: [],
          });
        }

        if (
          item.quantity === undefined ||
          item.quantity === null ||
          Number(item.quantity) <= 0
        ) {
          return res.status(400).json({
            successful: false,
            message: `quantity is required for item ${i + 1}`,
            errors: [
              {
                fieldName: `purchaseOrderItems[${i}].quantity`,
                message: "Quantity must be greater than zero",
              },
            ],
            warnings: [],
          });
        }

        if (
          item.unitPrice === undefined ||
          item.unitPrice === null ||
          Number(item.unitPrice) < 0
        ) {
          return res.status(400).json({
            successful: false,
            message: `unitPrice is required for item ${i + 1}`,
            errors: [
              {
                fieldName: `purchaseOrderItems[${i}].unitPrice`,
                message: "Unit price is required",
              },
            ],
            warnings: [],
          });
        }
      }

      // --------------------------------------------------------
      // Environment validation
      // --------------------------------------------------------
      if (!process.env.UNIWARE_BASE_URL) {
        return res.status(500).json({
          successful: false,
          message: "UNIWARE_BASE_URL is not configured",
          errors: [],
          warnings: [],
        });
      }

      if (!process.env.UNIWARE_ACCESS_TOKEN) {
        return res.status(500).json({
          successful: false,
          message: "UNIWARE_ACCESS_TOKEN is not configured",
          errors: [],
          warnings: [],
        });
      }

      // --------------------------------------------------------
      // Uniware endpoint
      // --------------------------------------------------------
      const url =
        `${process.env.UNIWARE_BASE_URL}` +
        `/services/rest/v1/purchase/purchaseOrder/createApproved`;

      // --------------------------------------------------------
      // Build payload
      // --------------------------------------------------------
      const payload = {
        ...(purchaseOrderCode?.trim()
          ? {
              purchaseOrderCode: purchaseOrderCode.trim(),
            }
          : {}),

        ...(userId?.trim()
          ? {
              userId: userId.trim(),
            }
          : {}),

        vendorCode: vendorCode.trim(),

        ...(vendorAgreementName?.trim()
          ? {
              vendorAgreementName: vendorAgreementName.trim(),
            }
          : {}),

        currencyCode:
          currencyCode?.trim() || "INR",

        ...(expiryDate
          ? {
              expiryDate: new Date(expiryDate).toISOString(),
            }
          : {}),

        ...(deliveryDate
          ? {
              deliveryDate: new Date(deliveryDate).toISOString(),
            }
          : {}),

        ...(logisticChargesDivisionMethod
          ? {
              logisticChargesDivisionMethod:
                logisticChargesDivisionMethod.trim(),
            }
          : {}),

        logisticCharges:
          logisticCharges !== undefined &&
          logisticCharges !== null &&
          logisticCharges !== ""
            ? Number(logisticCharges)
            : 0,

        purchaseOrderItems: purchaseOrderItems.map((item) => ({
          itemSKU: item.itemSKU.trim(),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),

          ...(item.maxRetailPrice !== undefined &&
          item.maxRetailPrice !== null &&
          item.maxRetailPrice !== ""
            ? {
                maxRetailPrice: Number(item.maxRetailPrice),
              }
            : {}),

          ...(item.discount !== undefined &&
          item.discount !== null &&
          item.discount !== ""
            ? {
                discount: Number(item.discount),
              }
            : {}),

          ...(item.discountPercentage !== undefined &&
          item.discountPercentage !== null &&
          item.discountPercentage !== ""
            ? {
                discountPercentage: Number(
                  item.discountPercentage
                ),
              }
            : {}),

          ...(item.taxTypeCode?.trim()
            ? {
                taxTypeCode: item.taxTypeCode.trim(),
              }
            : {}),
        })),

        ...(Array.isArray(customFieldValues) &&
        customFieldValues.length > 0
          ? {
              customFieldValues: customFieldValues.map((field) => ({
                name: field.name?.trim() || "",
                value: field.value ?? "",
              })),
            }
          : {}),
      };

      // --------------------------------------------------------
      // Log request
      // Do NOT log access token
      // --------------------------------------------------------
      console.log(
        "=========================================="
      );
      console.log(
        "UNIWARE CREATE AND APPROVE PURCHASE ORDER"
      );
      console.log(
        "=========================================="
      );
      console.log("URL:", url);
      console.log("Facility:", facility);
      console.log("Vendor:", vendorCode);
      console.log("Purchase Order:", purchaseOrderCode);
      console.log("Payload:", payload);

      // --------------------------------------------------------
      // Call Uniware
      // --------------------------------------------------------
      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${process.env.UNIWARE_ACCESS_TOKEN}`,
          Facility: facility.trim(),
        },
        timeout: 30000,
      });

      const data = response.data;

      console.log(
        "Uniware Create Approved Response:",
        data
      );

      // --------------------------------------------------------
      // Return response
      // --------------------------------------------------------
      return res.status(200).json({
        successful: data?.successful ?? false,
        message: data?.message ?? "",
        errors: data?.errors ?? [],
        warnings: data?.warnings ?? [],
        purchaseOrderCode:
          data?.purchaseOrderCode ?? null,
      });
    } catch (error) {
      console.error(
        "Create Approved Purchase Order Error:",
        error.message
      );

      // --------------------------------------------------------
      // Uniware returned an HTTP error
      // --------------------------------------------------------
      if (error.response) {
        console.error(
          "Uniware Status:",
          error.response.status
        );

        console.error(
          "Uniware Response:",
          error.response.data
        );

        const data = error.response.data || {};

        return res.status(error.response.status).json({
          successful: false,
          message:
            data.message ||
            "Uniware failed to create and approve purchase order",
          errors: data.errors || [
            {
              code: error.response.status,
              message: "Uniware API request failed",
              description: error.response.statusText,
            },
          ],
          warnings: data.warnings || [],
          purchaseOrderCode:
            data.purchaseOrderCode ?? null,
        });
      }

      // --------------------------------------------------------
      // No response from Uniware
      // --------------------------------------------------------
      if (error.request) {
        return res.status(503).json({
          successful: false,
          message: "No response received from Uniware",
          errors: [
            {
              message: "Unable to connect to Uniware",
              description: error.message,
            },
          ],
          warnings: [],
        });
      }

      // --------------------------------------------------------
      // Other error
      // --------------------------------------------------------
      return res.status(500).json({
        successful: false,
        message: "Failed to create and approve purchase order",
        errors: [
          {
            message: error.message,
          },
        ],
        warnings: [],
      });
    }
  }
);

// ============================================================
// UNIWARE - CLOSE PURCHASE ORDER
// POST /api/uniware/purchase-orders/close
// ============================================================

app.post(
  "/api/uniware/purchase-orders/close",
  async (req, res) => {
    try {
      const {
        facility,
        purchaseOrderCode,
      } = req.body;

      // --------------------------------------------------------
      // Validate facility
      // --------------------------------------------------------
      if (!facility || !facility.trim()) {
        return res.status(400).json({
          successful: false,
          message: "Facility is required",
          errors: [
            {
              fieldName: "facility",
              message: "Uniware facility code is required",
            },
          ],
          warnings: [],
          purchaseOrder: null,
        });
      }

      // --------------------------------------------------------
      // Validate purchase order code
      // --------------------------------------------------------
      if (
        !purchaseOrderCode ||
        !purchaseOrderCode.trim()
      ) {
        return res.status(400).json({
          successful: false,
          message: "purchaseOrderCode is required",
          errors: [
            {
              fieldName: "purchaseOrderCode",
              message: "Purchase order code is required",
            },
          ],
          warnings: [],
          purchaseOrder: null,
        });
      }

      // --------------------------------------------------------
      // Environment validation
      // --------------------------------------------------------
      if (!process.env.UNIWARE_BASE_URL) {
        return res.status(500).json({
          successful: false,
          message:
            "UNIWARE_BASE_URL is not configured",
          errors: [],
          warnings: [],
          purchaseOrder: null,
        });
      }

      if (!process.env.UNIWARE_ACCESS_TOKEN) {
        return res.status(500).json({
          successful: false,
          message:
            "UNIWARE_ACCESS_TOKEN is not configured",
          errors: [],
          warnings: [],
          purchaseOrder: null,
        });
      }

      // --------------------------------------------------------
      // Uniware endpoint
      // --------------------------------------------------------
      const url =
        `${process.env.UNIWARE_BASE_URL}` +
        `/services/rest/v1/purchase/purchaseOrder/close`;

      // --------------------------------------------------------
      // Payload
      // --------------------------------------------------------
      const payload = {
        purchaseOrderCode:
          purchaseOrderCode.trim(),
      };

      console.log(
        "=========================================="
      );
      console.log(
        "UNIWARE CLOSE PURCHASE ORDER"
      );
      console.log(
        "=========================================="
      );
      console.log("URL:", url);
      console.log(
        "Facility:",
        facility.trim()
      );
      console.log(
        "Purchase Order:",
        purchaseOrderCode.trim()
      );

      // --------------------------------------------------------
      // Call Uniware
      // --------------------------------------------------------
      const response = await axios.post(
        url,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization:
              `bearer ${process.env.UNIWARE_ACCESS_TOKEN}`,
            Facility: facility.trim(),
          },
          timeout: 30000,
        }
      );

      const data = response.data;

      console.log(
        "Uniware Close PO Response:",
        data
      );

      // --------------------------------------------------------
      // Return response
      // --------------------------------------------------------
      return res.status(200).json({
        successful:
          data?.successful ?? false,

        message:
          data?.message ?? "",

        errors:
          data?.errors ?? [],

        warnings:
          data?.warnings ?? [],

        purchaseOrder:
          data?.purchaseOrder ?? null,
      });
    } catch (error) {
      console.error(
        "Close Purchase Order Error:",
        error.message
      );

      // --------------------------------------------------------
      // Uniware HTTP error
      // --------------------------------------------------------
      if (error.response) {
        console.error(
          "Uniware Status:",
          error.response.status
        );

        console.error(
          "Uniware Response:",
          error.response.data
        );

        const data =
          error.response.data || {};

        return res
          .status(error.response.status)
          .json({
            successful: false,

            message:
              data.message ||
              "Uniware failed to close purchase order",

            errors:
              data.errors || [
                {
                  code:
                    error.response.status,
                  message:
                    "Uniware API request failed",
                  description:
                    error.response.statusText,
                },
              ],

            warnings:
              data.warnings || [],

            purchaseOrder:
              data.purchaseOrder || null,
          });
      }

      // --------------------------------------------------------
      // No response
      // --------------------------------------------------------
      if (error.request) {
        return res.status(503).json({
          successful: false,

          message:
            "No response received from Uniware",

          errors: [
            {
              message:
                "Unable to connect to Uniware",
              description:
                error.message,
            },
          ],

          warnings: [],

          purchaseOrder: null,
        });
      }

      // --------------------------------------------------------
      // Other error
      // --------------------------------------------------------
      return res.status(500).json({
        successful: false,

        message:
          "Failed to close purchase order",

        errors: [
          {
            message:
              error.message,
          },
        ],

        warnings: [],

        purchaseOrder: null,
      });
    }
  }
);

// ==========================================
// Uniware - Get Purchase Order Details
// ==========================================
app.post("/api/uniware/purchase-orders/details", async (req, res) => {
  try {
    const { facility, purchaseOrderCode } = req.body;

    if (!facility || !facility.trim()) {
      return res.status(400).json({
        successful: false,
        message: "Facility code is required.",
        errors: [],
        warnings: [],
      });
    }

    if (!purchaseOrderCode || !purchaseOrderCode.trim()) {
      return res.status(400).json({
        successful: false,
        message: "Purchase order code is required.",
        errors: [],
        warnings: [],
      });
    }

    if (!process.env.UNIWARE_BASE_URL) {
      return res.status(500).json({
        successful: false,
        message: "UNIWARE_BASE_URL is not configured.",
        errors: [],
        warnings: [],
      });
    }

    if (!process.env.UNIWARE_ACCESS_TOKEN) {
      return res.status(500).json({
        successful: false,
        message: "UNIWARE_ACCESS_TOKEN is not configured.",
        errors: [],
        warnings: [],
      });
    }

    const url =
      `${process.env.UNIWARE_BASE_URL}` +
      `/services/rest/v1/purchase/purchaseOrder/getPurchaseOrderDetails`;

    const response = await axios.post(
      url,
      {
        purchaseOrderCode: purchaseOrderCode.trim(),
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${process.env.UNIWARE_ACCESS_TOKEN}`,
          Facility: facility.trim(),
        },
      }
    );

    const data = response.data || {};

    return res.status(200).json({
      successful: data.successful ?? false,
      message: data.message ?? "",
      errors: data.errors ?? [],
      warnings: data.warnings ?? [],

      // Complete PO details
      id: data.id ?? null,
      amendedPurchaseOrderCode:
        data.amendedPurchaseOrderCode ?? null,
      amendmentPurchaseOrderCode:
        data.amendmentPurchaseOrderCode ?? null,
      name: data.name ?? null,
      code: data.code ?? null,
      type: data.type ?? null,
      fromParty: data.fromParty ?? null,
      statusCode: data.statusCode ?? null,

      vendorCode: data.vendorCode ?? null,
      vendorId: data.vendorId ?? null,
      vendorName: data.vendorName ?? null,

      created: data.created ?? null,
      createdBy: data.createdBy ?? null,

      expiryDate: data.expiryDate ?? null,
      deliveryDate: data.deliveryDate ?? null,

      vendorAgreementName:
        data.vendorAgreementName ?? null,

      inflowReceiptsCount:
        data.inflowReceiptsCount ?? 0,

      customFieldValues:
        data.customFieldValues ?? [],

      purchaseOrderItems:
        data.purchaseOrderItems ?? [],

      partyAddressDTO:
        data.partyAddressDTO ?? null,

      logisticCharges:
        data.logisticCharges ?? 0,

      logisticChargesDivisionMethod:
        data.logisticChargesDivisionMethod ?? null,

      purchaseOrderPriceSummary:
        data.purchaseOrderPriceSummary ?? null,

      rejectionReason:
        data.rejectionReason ?? null,

      tcsAmount:
        data.tcsAmount ?? 0,

      tcsadditionEnabled:
        data.tcsadditionEnabled ?? false,
    });
  } catch (error) {
    console.error(
      "Uniware Get Purchase Order Details Error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json({
      successful: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch purchase order details.",

      errors:
        error.response?.data?.errors || [],

      warnings:
        error.response?.data?.warnings || [],

      details:
        error.response?.data || null,
    });
  }
});

// ==========================================
// Uniware - Create GRN
// ==========================================
app.post("/api/uniware/purchase-orders/create-grn", async (req, res) => {
  try {
    const {
      facility,
      purchaseOrderCode,
      vendorInvoiceNumber,
      vendorInvoiceDate,
      currencyCode,
      vendorInvoiceDateCheckDisable,
      customFieldValues,
    } = req.body;

    // ------------------------------------------
    // Validation
    // ------------------------------------------
    if (!facility || !facility.trim()) {
      return res.status(400).json({
        successful: false,
        message: "Facility code is required.",
        errors: [],
        warnings: [],
      });
    }

    if (!purchaseOrderCode || !purchaseOrderCode.trim()) {
      return res.status(400).json({
        successful: false,
        message: "Purchase order code is required.",
        errors: [],
        warnings: [],
      });
    }

    if (
      !vendorInvoiceNumber ||
      !vendorInvoiceNumber.trim()
    ) {
      return res.status(400).json({
        successful: false,
        message: "Vendor invoice number is required.",
        errors: [],
        warnings: [],
      });
    }

    if (!vendorInvoiceDate) {
      return res.status(400).json({
        successful: false,
        message: "Vendor invoice date is required.",
        errors: [],
        warnings: [],
      });
    }

    if (!process.env.UNIWARE_BASE_URL) {
      return res.status(500).json({
        successful: false,
        message: "UNIWARE_BASE_URL is not configured.",
        errors: [],
        warnings: [],
      });
    }

    if (!process.env.UNIWARE_ACCESS_TOKEN) {
      return res.status(500).json({
        successful: false,
        message: "UNIWARE_ACCESS_TOKEN is not configured.",
        errors: [],
        warnings: [],
      });
    }

    // ------------------------------------------
    // Convert invoice date to UTC
    // ------------------------------------------
    const parsedDate = new Date(vendorInvoiceDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        successful: false,
        message: "Invalid vendor invoice date.",
        errors: [],
        warnings: [],
      });
    }

    // ------------------------------------------
    // Prepare custom fields
    // ------------------------------------------
    const normalizedCustomFields = Array.isArray(
      customFieldValues
    )
      ? customFieldValues
          .filter((field) => field?.name?.trim())
          .map((field) => ({
            name: field.name.trim(),
            value:
              field.value === null ||
              field.value === undefined
                ? ""
                : String(field.value),
          }))
      : [];

    // ------------------------------------------
    // Uniware URL
    // ------------------------------------------
    const url =
      `${process.env.UNIWARE_BASE_URL}` +
      `/services/rest/v1/purchase/inflowReceipt/create`;

    // ------------------------------------------
    // Request payload
    // ------------------------------------------
    const payload = {
      wsGRN: {
        vendorInvoiceNumber:
          vendorInvoiceNumber.trim(),

        vendorInvoiceDate:
          parsedDate.toISOString(),

        customFieldValues:
          normalizedCustomFields,

        currencyCode:
          currencyCode?.trim() || "INR",
      },

      purchaseOrderCode:
        purchaseOrderCode.trim(),

      vendorInvoiceDateCheckDisable:
        vendorInvoiceDateCheckDisable === true,
    };

    // ------------------------------------------
    // Uniware API request
    // ------------------------------------------
    const response = await axios.post(
      url,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${process.env.UNIWARE_ACCESS_TOKEN}`,
          Facility: facility.trim(),
        },
      }
    );

    const data = response.data || {};

    // ------------------------------------------
    // Return Uniware response
    // ------------------------------------------
    return res.status(200).json({
      successful: data.successful ?? false,
      message: data.message ?? "",
      errors: data.errors ?? [],
      warnings: data.warnings ?? [],
      inflowReceiptCode:
        data.inflowReceiptCode ?? null,
    });
  } catch (error) {
    console.error(
      "Uniware Create GRN Error:",
      error.response?.data || error.message
    );

    return res.status(
      error.response?.status || 500
    ).json({
      successful: false,

      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to create GRN.",

      errors:
        error.response?.data?.errors || [],

      warnings:
        error.response?.data?.warnings || [],

      inflowReceiptCode:
        error.response?.data?.inflowReceiptCode ||
        null,

      details:
        error.response?.data || null,
    });
  }
});

// ==========================================
// Uniware - Add Item in GRN
// ==========================================
app.post("/api/uniware/purchase-orders/grn/add-item", async (req, res) => {
  try {
    const {
      facility,
      inflowReceiptCode,
      itemCode,
      manufacturingDate,
    } = req.body;

    // ------------------------------------------
    // Validation
    // ------------------------------------------
    if (!facility || !facility.trim()) {
      return res.status(400).json({
        successful: false,
        message: "Facility code is required.",
        errors: [],
        warnings: [],
      });
    }

    if (
      !inflowReceiptCode ||
      !inflowReceiptCode.trim()
    ) {
      return res.status(400).json({
        successful: false,
        message: "Inflow Receipt / GRN code is required.",
        errors: [],
        warnings: [],
      });
    }

    if (!itemCode || !itemCode.trim()) {
      return res.status(400).json({
        successful: false,
        message: "Item code is required.",
        errors: [],
        warnings: [],
      });
    }

    // Uniware pattern:
    // ^[a-zA-Z0-9-_]+$
    const itemCodePattern = /^[a-zA-Z0-9_-]+$/;

    if (!itemCodePattern.test(itemCode.trim())) {
      return res.status(400).json({
        successful: false,
        message:
          "Invalid item code. Only letters, numbers, hyphen and underscore are allowed.",
        errors: [],
        warnings: [],
      });
    }

    if (!process.env.UNIWARE_BASE_URL) {
      return res.status(500).json({
        successful: false,
        message: "UNIWARE_BASE_URL is not configured.",
        errors: [],
        warnings: [],
      });
    }

    if (!process.env.UNIWARE_ACCESS_TOKEN) {
      return res.status(500).json({
        successful: false,
        message: "UNIWARE_ACCESS_TOKEN is not configured.",
        errors: [],
        warnings: [],
      });
    }

    // ------------------------------------------
    // Prepare payload
    // ------------------------------------------
    const payload = {
      inflowReceiptCode:
        inflowReceiptCode.trim(),

      itemCode: itemCode.trim(),
    };

    // ------------------------------------------
    // Manufacturing Date is optional
    // ------------------------------------------
    if (manufacturingDate) {
      const parsedDate = new Date(
        manufacturingDate
      );

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          successful: false,
          message: "Invalid manufacturing date.",
          errors: [],
          warnings: [],
        });
      }

      payload.manufacturingDate =
        parsedDate.toISOString();
    }

    // ------------------------------------------
    // Uniware API URL
    // ------------------------------------------
    const url =
      `${process.env.UNIWARE_BASE_URL}` +
      `/services/rest/v1/purchase/inflowReceipt/addItem`;

    // ------------------------------------------
    // Call Uniware
    // ------------------------------------------
    const response = await axios.post(
      url,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${process.env.UNIWARE_ACCESS_TOKEN}`,
          Facility: facility.trim(),
        },
      }
    );

    const data = response.data || {};

    // ------------------------------------------
    // Return response
    // ------------------------------------------
    return res.status(200).json({
      successful: data.successful ?? false,
      message: data.message ?? "",
      errors: data.errors ?? [],
      warnings: data.warnings ?? [],
      inflowReceiptItemDTO:
        data.inflowReceiptItemDTO ?? null,
    });
  } catch (error) {
    console.error(
      "Uniware Add GRN Item Error:",
      error.response?.data || error.message
    );

    return res.status(
      error.response?.status || 500
    ).json({
      successful: false,

      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to add item to GRN.",

      errors:
        error.response?.data?.errors || [],

      warnings:
        error.response?.data?.warnings || [],

      inflowReceiptItemDTO:
        error.response?.data
          ?.inflowReceiptItemDTO || null,

      details:
        error.response?.data || null,
    });
  }
});

//
// Uniware - Add Item SKU in GRN
// Supports:
// 1. Normal SKU
// 2. Batch traceability
// 3. ITEM traceability
//
app.post(
  "/api/uniware/purchase-orders/grn/add-item-sku",
  async (req, res) => {
    try {
      const {
        facility,
        inflowReceiptCode,
        inflowReceiptItem,
      } = req.body;

      // ------------------------------------------
      // Basic validation
      // ------------------------------------------
      if (!facility || !facility.trim()) {
        return res.status(400).json({
          successful: false,
          message: "Facility code is required.",
          errors: [],
          warnings: [],
        });
      }

      if (
        !inflowReceiptCode ||
        !inflowReceiptCode.trim()
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "Inflow Receipt / GRN code is required.",
          errors: [],
          warnings: [],
        });
      }

      if (
        !inflowReceiptItem ||
        typeof inflowReceiptItem !== "object"
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "Inflow Receipt Item details are required.",
          errors: [],
          warnings: [],
        });
      }

      // ------------------------------------------
      // Quantity is mandatory
      // ------------------------------------------
      const quantity = Number(
        inflowReceiptItem.quantity
      );

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "Quantity is required and must be a positive integer.",
          errors: [],
          warnings: [],
        });
      }

      // ------------------------------------------
      // Environment validation
      // ------------------------------------------
      if (!process.env.UNIWARE_BASE_URL) {
        return res.status(500).json({
          successful: false,
          message:
            "UNIWARE_BASE_URL is not configured.",
          errors: [],
          warnings: [],
        });
      }

      if (!process.env.UNIWARE_ACCESS_TOKEN) {
        return res.status(500).json({
          successful: false,
          message:
            "UNIWARE_ACCESS_TOKEN is not configured.",
          errors: [],
          warnings: [],
        });
      }

      // ------------------------------------------
      // Prepare payload
      // ------------------------------------------
      const payload = {
        inflowReceiptCode:
          inflowReceiptCode.trim(),

        inflowReceiptItem: {
          quantity,
        },
      };

      // ------------------------------------------
      // Optional numeric fields
      // ------------------------------------------
      if (
        inflowReceiptItem.unitPrice !==
          undefined &&
        inflowReceiptItem.unitPrice !== null &&
        inflowReceiptItem.unitPrice !== ""
      ) {
        payload.inflowReceiptItem.unitPrice =
          Number(inflowReceiptItem.unitPrice);
      }

      if (
        inflowReceiptItem.additionalCost !==
          undefined &&
        inflowReceiptItem.additionalCost !==
          null &&
        inflowReceiptItem.additionalCost !== ""
      ) {
        payload.inflowReceiptItem.additionalCost =
          Number(inflowReceiptItem.additionalCost);
      }

      // ------------------------------------------
      // SKU
      // ------------------------------------------
      if (
        inflowReceiptItem.skuCode !==
          undefined &&
        inflowReceiptItem.skuCode !== null &&
        String(inflowReceiptItem.skuCode).trim()
      ) {
        payload.inflowReceiptItem.skuCode =
          String(
            inflowReceiptItem.skuCode
          ).trim();
      }

      // ------------------------------------------
      // Manufacturing Date
      // ------------------------------------------
      if (inflowReceiptItem.manufacturingDate) {
        const manufacturingDate =
          new Date(
            inflowReceiptItem.manufacturingDate
          );

        if (
          Number.isNaN(
            manufacturingDate.getTime()
          )
        ) {
          return res.status(400).json({
            successful: false,
            message:
              "Invalid manufacturing date.",
            errors: [],
            warnings: [],
          });
        }

        payload.inflowReceiptItem.manufacturingDate =
          manufacturingDate.toISOString();
      }

      // ------------------------------------------
      // Expiry Date
      // ------------------------------------------
      if (inflowReceiptItem.expiry) {
        const expiryDate =
          new Date(
            inflowReceiptItem.expiry
          );

        if (
          Number.isNaN(expiryDate.getTime())
        ) {
          return res.status(400).json({
            successful: false,
            message: "Invalid expiry date.",
            errors: [],
            warnings: [],
          });
        }

        payload.inflowReceiptItem.expiry =
          expiryDate.toISOString();
      }

      // ------------------------------------------
      // Batch details
      // ------------------------------------------
      if (
        inflowReceiptItem.wsBatchDetail &&
        typeof inflowReceiptItem.wsBatchDetail ===
          "object"
      ) {
        const batch =
          inflowReceiptItem.wsBatchDetail;

        const batchFields =
          batch.wsBatchGroupFieldValue;

        if (
          batchFields &&
          typeof batchFields === "object"
        ) {
          const normalizedBatch = {};

          // Expiry Date
          if (batchFields.expiryDate) {
            const date = new Date(
              batchFields.expiryDate
            );

            if (Number.isNaN(date.getTime())) {
              return res.status(400).json({
                successful: false,
                message:
                  "Invalid batch expiry date.",
                errors: [],
                warnings: [],
              });
            }

            normalizedBatch.expiryDate =
              date.toISOString();
          }

          // Manufacturing Date
          if (batchFields.mfd) {
            const date = new Date(
              batchFields.mfd
            );

            if (Number.isNaN(date.getTime())) {
              return res.status(400).json({
                successful: false,
                message:
                  "Invalid batch manufacturing date.",
                errors: [],
                warnings: [],
              });
            }

            normalizedBatch.mfd =
              date.toISOString();
          }

          // Cost
          if (
            batchFields.cost !==
              undefined &&
            batchFields.cost !== null &&
            batchFields.cost !== ""
          ) {
            normalizedBatch.cost =
              Number(batchFields.cost);
          }

          // MRP
          if (
            batchFields.mrp !==
              undefined &&
            batchFields.mrp !== null &&
            batchFields.mrp !== ""
          ) {
            normalizedBatch.mrp =
              Number(batchFields.mrp);
          }

          // Vendor Code
          if (
            batchFields.vendorCode !==
              undefined &&
            batchFields.vendorCode !== null &&
            String(batchFields.vendorCode).trim()
          ) {
            normalizedBatch.vendorCode =
              String(
                batchFields.vendorCode
              ).trim();
          }

          // Vendor Batch Number
          if (
            batchFields.vendorBatchNumber !==
              undefined &&
            batchFields.vendorBatchNumber !==
              null &&
            String(
              batchFields.vendorBatchNumber
            ).trim()
          ) {
            normalizedBatch.vendorBatchNumber =
              String(
                batchFields.vendorBatchNumber
              ).trim();
          }

          payload.inflowReceiptItem.wsBatchDetail =
            {
              wsBatchGroupFieldValue:
                normalizedBatch,
            };
        }
      }

      // ------------------------------------------
      // ITEM traceability
      // ------------------------------------------
      if (
        Array.isArray(
          inflowReceiptItem.itemDTOs
        )
      ) {
        payload.inflowReceiptItem.itemDTOs =
          inflowReceiptItem.itemDTOs
            .filter(
              (item) =>
                item &&
                item.code &&
                String(item.code).trim()
            )
            .map((item) => ({
              code: String(
                item.code
              ).trim(),

              itemDetails:
                item.itemDetails ===
                  undefined ||
                item.itemDetails === null
                  ? ""
                  : String(
                      item.itemDetails
                    ),
            }));
      }

      // ------------------------------------------
      // Uniware URL
      // ------------------------------------------
      const url =
        `${process.env.UNIWARE_BASE_URL}` +
        `/services/rest/v1/purchase/inflowReceipt/addItemSKU`;

      // ------------------------------------------
      // Call Uniware
      // ------------------------------------------
      const response = await axios.post(
        url,
        payload,
        {
          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `bearer ${process.env.UNIWARE_ACCESS_TOKEN}`,

            Facility:
              facility.trim(),
          },
        }
      );

      const data = response.data || {};

      // ------------------------------------------
      // Return response
      // ------------------------------------------
      return res.status(200).json({
        successful:
          data.successful ?? false,

        message:
          data.message ?? "",

        errors:
          data.errors ?? [],

        warnings:
          data.warnings ?? [],

        inflowReceiptItemDTO:
          data.inflowReceiptItemDTO ?? null,
      });
    } catch (error) {
      console.error(
        "Uniware Add Item SKU in GRN Error:",
        error.response?.data ||
          error.message
      );

      return res.status(
        error.response?.status || 500
      ).json({
        successful: false,

        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to add item SKU to GRN.",

        errors:
          error.response?.data?.errors ||
          [],

        warnings:
          error.response?.data?.warnings ||
          [],

        inflowReceiptItemDTO:
          error.response?.data
            ?.inflowReceiptItemDTO ||
          null,

        details:
          error.response?.data || null,
      });
    }
  }
);

// ============================================================
// UNIWARE - GET GRN
// POST /api/uniware/grn/details
// ============================================================

app.post("/api/uniware/grn/details", async (req, res) => {
  try {
    const { facility, inflowReceiptCode } = req.body;

    if (!facility || !facility.trim()) {
      return res.status(400).json({
        successful: false,
        message: "Facility code is required.",
      });
    }

    if (!inflowReceiptCode || !inflowReceiptCode.trim()) {
      return res.status(400).json({
        successful: false,
        message: "Inflow Receipt / GRN code is required.",
      });
    }

    if (
      !process.env.UNIWARE_BASE_URL ||
      !process.env.UNIWARE_ACCESS_TOKEN
    ) {
      return res.status(500).json({
        successful: false,
        message:
          "Uniware configuration is missing. Check UNIWARE_BASE_URL and UNIWARE_ACCESS_TOKEN.",
      });
    }

    const url =
      `${process.env.UNIWARE_BASE_URL}` +
      `/services/rest/v1/purchase/inflowReceipt/getInflowReceipt`;

    const payload = {
      inflowReceiptCode: inflowReceiptCode.trim(),
    };

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${process.env.UNIWARE_ACCESS_TOKEN}`,
        Facility: facility.trim(),
      },
      timeout: 30000,
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Uniware Get GRN Error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json(
      error.response?.data || {
        successful: false,
        message: "Failed to fetch GRN from Uniware.",
        error: error.message,
      }
    );
  }
});

// ============================================================
// UNIWARE - SEARCH GRNs
// POST /api/uniware/grn/search
// ============================================================

app.post("/api/uniware/grn/search", async (req, res) => {
  try {
    const {
      facility,
      purchaseOrderCode,
      createdBetween,
    } = req.body;

    // ----------------------------------------------------------
    // Validation
    // ----------------------------------------------------------
    if (!facility || !facility.trim()) {
      return res.status(400).json({
        successful: false,
        message: "Facility code is required.",
      });
    }

    if (!createdBetween) {
      return res.status(400).json({
        successful: false,
        message: "createdBetween is required.",
      });
    }

    const { start, end, textRange } = createdBetween;

    if (!start) {
      return res.status(400).json({
        successful: false,
        message: "createdBetween.start is required.",
      });
    }

    if (!end) {
      return res.status(400).json({
        successful: false,
        message: "createdBetween.end is required.",
      });
    }

    if (!textRange) {
      return res.status(400).json({
        successful: false,
        message: "createdBetween.textRange is required.",
      });
    }

    const allowedRanges = [
      "TODAY",
      "YESTERDAY",
      "LAST_WEEK",
      "LAST_MONTH",
      "THIS_MONTH",
      "LAST_7_DAYS",
      "LAST_30_DAYS",
      "LAST_60_DAYS",
      "LAST_90_DAYS",
      "LAST_QUARTER",
      "THIS_QUARTER",
    ];

    if (!allowedRanges.includes(textRange)) {
      return res.status(400).json({
        successful: false,
        message: `Invalid textRange. Allowed values: ${allowedRanges.join(
          ", "
        )}`,
      });
    }

    // ----------------------------------------------------------
    // Uniware configuration
    // ----------------------------------------------------------
    if (
      !process.env.UNIWARE_BASE_URL ||
      !process.env.UNIWARE_ACCESS_TOKEN
    ) {
      return res.status(500).json({
        successful: false,
        message:
          "Uniware configuration is missing. Check UNIWARE_BASE_URL and UNIWARE_ACCESS_TOKEN.",
      });
    }

    // ----------------------------------------------------------
    // Build payload
    // ----------------------------------------------------------
    const payload = {
      createdBetween: {
        start,
        end,
        textRange,
      },
    };

    // Optional PO filter
    if (purchaseOrderCode?.trim()) {
      payload.purchaseOrderCode =
        purchaseOrderCode.trim();
    }

    // ----------------------------------------------------------
    // Uniware endpoint
    // ----------------------------------------------------------
    const url =
      `${process.env.UNIWARE_BASE_URL}` +
      `/services/rest/v1/purchase/inflowReceipt/getInflowReceipts`;

    // ----------------------------------------------------------
    // Call Uniware
    // ----------------------------------------------------------
    const response = await axios.post(
      url,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${process.env.UNIWARE_ACCESS_TOKEN}`,
          Facility: facility.trim(),
        },
        timeout: 30000,
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Uniware Search GRNs Error:",
      error.response?.data || error.message
    );

    return res
      .status(error.response?.status || 500)
      .json(
        error.response?.data || {
          successful: false,
          message: "Failed to search GRNs from Uniware.",
          error: error.message,
        }
      );
  }
});
// ============================================================
// UNIWARE - CREATE OR UPDATE CATEGORY
// POST /api/uniware/categories/add-or-edit
// Tenant level - NO Facility header
// ============================================================

app.post(
  "/api/uniware/categories/add-or-edit",
  async (req, res) => {
    try {
      const { category } = req.body;

      // --------------------------------------------------------
      // Validate category
      // --------------------------------------------------------
      if (!category || typeof category !== "object") {
        return res.status(400).json({
          successful: false,
          message: "Category object is required.",
        });
      }

      // --------------------------------------------------------
      // Required fields
      // --------------------------------------------------------
      if (!category.code || !category.code.trim()) {
        return res.status(400).json({
          successful: false,
          message: "Category code is required.",
        });
      }

      if (category.code.trim().length > 45) {
        return res.status(400).json({
          successful: false,
          message:
            "Category code cannot exceed 45 characters.",
        });
      }

      if (!category.name || !category.name.trim()) {
        return res.status(400).json({
          successful: false,
          message: "Category name is required.",
        });
      }

      if (category.name.trim().length > 200) {
        return res.status(400).json({
          successful: false,
          message:
            "Category name cannot exceed 200 characters.",
        });
      }

      if (
        !category.gstTaxTypeCode ||
        !category.gstTaxTypeCode.trim()
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "GST Tax Type Code is required.",
        });
      }

      // --------------------------------------------------------
      // Uniware configuration
      // --------------------------------------------------------
      if (
        !process.env.UNIWARE_BASE_URL ||
        !process.env.UNIWARE_ACCESS_TOKEN
      ) {
        return res.status(500).json({
          successful: false,
          message:
            "Uniware configuration is missing. Check UNIWARE_BASE_URL and UNIWARE_ACCESS_TOKEN.",
        });
      }

      // --------------------------------------------------------
      // Build category
      // --------------------------------------------------------
      const uniwareCategory = {
        code: category.code.trim(),
        name: category.name.trim(),
        gstTaxTypeCode:
          category.gstTaxTypeCode.trim(),
      };

      // Optional fields
      if (
        category.taxTypeCode !== undefined &&
        category.taxTypeCode !== null &&
        String(category.taxTypeCode).trim() !== ""
      ) {
        uniwareCategory.taxTypeCode =
          String(category.taxTypeCode).trim();
      }

      if (
        category.itemDetailFieldsText !== undefined &&
        category.itemDetailFieldsText !== null
      ) {
        uniwareCategory.itemDetailFieldsText =
          String(category.itemDetailFieldsText);
      }

      if (
        category.hsnCode !== undefined &&
        category.hsnCode !== null &&
        String(category.hsnCode).trim() !== ""
      ) {
        uniwareCategory.hsnCode =
          String(category.hsnCode).trim();
      }

      if (
        category.grnExpiryTolerance !== undefined &&
        category.grnExpiryTolerance !== null &&
        category.grnExpiryTolerance !== ""
      ) {
        uniwareCategory.grnExpiryTolerance =
          Number(category.grnExpiryTolerance);
      }

      if (
        category.dispatchExpiryTolerance !== undefined &&
        category.dispatchExpiryTolerance !== null &&
        category.dispatchExpiryTolerance !== ""
      ) {
        uniwareCategory.dispatchExpiryTolerance =
          Number(category.dispatchExpiryTolerance);
      }

      if (
        category.returnExpiryTolerance !== undefined &&
        category.returnExpiryTolerance !== null &&
        category.returnExpiryTolerance !== ""
      ) {
        uniwareCategory.returnExpiryTolerance =
          Number(category.returnExpiryTolerance);
      }

      if (category.expirable !== undefined) {
        uniwareCategory.expirable =
          Boolean(category.expirable);
      }

      if (
        category.shelfLife !== undefined &&
        category.shelfLife !== null &&
        category.shelfLife !== ""
      ) {
        uniwareCategory.shelfLife =
          Number(category.shelfLife);
      }

      // --------------------------------------------------------
      // Final Uniware payload
      // --------------------------------------------------------
      const payload = {
        category: uniwareCategory,
      };

      // --------------------------------------------------------
      // Uniware endpoint
      // --------------------------------------------------------
      const url =
        `${process.env.UNIWARE_BASE_URL}` +
        `/services/rest/v1/product/category/addOrEdit`;

      // --------------------------------------------------------
      // Call Uniware
      // Tenant level => NO Facility header
      // --------------------------------------------------------
      const response = await axios.post(
        url,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `bearer ${process.env.UNIWARE_ACCESS_TOKEN}`,
          },
          timeout: 30000,
        }
      );

      return res.status(200).json(response.data);
    } catch (error) {
      console.error(
        "Uniware Create/Update Category Error:",
        error.response?.data || error.message
      );

      return res
        .status(error.response?.status || 500)
        .json(
          error.response?.data || {
            successful: false,
            message:
              "Failed to create or update category in Uniware.",
            error: error.message,
          }
        );
    }
  }
);
// Create or Update Uniware Item
app.post("/api/uniware/items/create-or-edit", async (req, res) => {
  try {
    const {
      categoryCode,
      skuCode,
      name,
      type,
      scanType,
      description,
      scanIdentifier,
      length,
      width,
      height,
      weight,
      minOrderSize,
      color,
      size,
      brand,
      ean,
      upc,
      isbn,
      maxRetailPrice,
      basePrice,
      costPrice,
      taxTypeCode,
      gstTaxTypeCode,
      hsnCode,
      imageUrl,
      productPageUrl,
      features,
      tat,
      tags,
      itemDetailFieldsText,
      requiresCustomization,
      shelfLife,
      expirable,
      enabled,
      determineExpiryFrom,
      dispatchExpiryTolerance,
      grnExpiryTolerance,
      returnExpiryTolerance,
      expirableFromCategory,
      expiryDate,
      taxCalculationType,
      componentItemTypes,
      customFieldValues,
      batchGroupCode,
    } = req.body;

    // -----------------------------
    // Validation
    // -----------------------------
    if (!skuCode || !String(skuCode).trim()) {
      return res.status(400).json({
        successful: false,
        message: "SKU code is required.",
      });
    }

    const sku = String(skuCode).trim();

    // Uniware SKU rules:
    // letters/numbers + -, ., _, /
    // no spaces
    if (!/^[a-zA-Z0-9._/-]+$/.test(sku)) {
      return res.status(400).json({
        successful: false,
        message:
          "Invalid SKU. Only letters, numbers, dash (-), dot (.), underscore (_) and forward slash (/) are allowed. Spaces are not allowed.",
      });
    }

    if (sku.length < 3 || sku.length > 45) {
      return res.status(400).json({
        successful: false,
        message: "SKU must contain between 3 and 45 characters.",
      });
    }

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Item name is required for create.",
      });
    }

    if (String(name).trim().length > 200) {
      return res.status(400).json({
        successful: false,
        message: "Item name cannot exceed 200 characters.",
      });
    }

    if (!categoryCode || !String(categoryCode).trim()) {
      return res.status(400).json({
        successful: false,
        message:
          "Category code is required. The category must already exist in Uniware.",
      });
    }

    // -----------------------------
    // Helper
    // -----------------------------
    const hasValue = (value) =>
      value !== undefined &&
      value !== null &&
      value !== "";

    const toNumber = (value) => {
      if (!hasValue(value)) return undefined;

      const numberValue = Number(value);

      return Number.isFinite(numberValue)
        ? numberValue
        : undefined;
    };

    const toBoolean = (value) => {
      if (value === undefined || value === null || value === "") {
        return undefined;
      }

      if (typeof value === "boolean") {
        return value;
      }

      return String(value).toLowerCase() === "true";
    };

    // -----------------------------
    // Build itemType dynamically
    // -----------------------------
    const itemType = {
      categoryCode: String(categoryCode).trim(),
      skuCode: sku,
      name: String(name).trim(),
    };

    // Optional string fields
    const stringFields = [
      "type",
      "scanType",
      "description",
      "scanIdentifier",
      "color",
      "size",
      "brand",
      "ean",
      "upc",
      "isbn",
      "taxTypeCode",
      "gstTaxTypeCode",
      "hsnCode",
      "imageUrl",
      "productPageUrl",
      "features",
      "itemDetailFieldsText",
      "determineExpiryFrom",
      "batchGroupCode",
      "taxCalculationType",
    ];

    for (const field of stringFields) {
      if (hasValue(req.body[field])) {
        itemType[field] = String(req.body[field]).trim();
      }
    }

    // Optional numeric fields
    const numericFields = [
      "length",
      "width",
      "height",
      "weight",
      "minOrderSize",
      "maxRetailPrice",
      "basePrice",
      "costPrice",
      "tat",
      "shelfLife",
      "dispatchExpiryTolerance",
      "grnExpiryTolerance",
      "returnExpiryTolerance",
    ];

    for (const field of numericFields) {
      const value = toNumber(req.body[field]);

      if (value !== undefined) {
        itemType[field] = value;
      }
    }

    // Optional boolean fields
    const booleanFields = [
      "requiresCustomization",
      "expirable",
      "enabled",
      "expirableFromCategory",
    ];

    for (const field of booleanFields) {
      const value = toBoolean(req.body[field]);

      if (value !== undefined) {
        itemType[field] = value;
      }
    }

    // Tags
    if (Array.isArray(tags)) {
      itemType.tags = tags
        .filter(
          (tag) =>
            tag !== undefined &&
            tag !== null &&
            String(tag).trim() !== ""
        )
        .map((tag) => String(tag).trim());
    }

    // Expiry date
    if (hasValue(expiryDate)) {
      const parsedExpiryDate = new Date(expiryDate);

      if (Number.isNaN(parsedExpiryDate.getTime())) {
        return res.status(400).json({
          successful: false,
          message: "Invalid expiryDate.",
        });
      }

      itemType.expiryDate = parsedExpiryDate.toISOString();
    }

    // Component item types
    if (Array.isArray(componentItemTypes)) {
      itemType.componentItemTypes = componentItemTypes
        .filter((component) => component)
        .map((component) => {
          const result = {
            itemSku: component.itemSku
              ? String(component.itemSku).trim()
              : "",
          };

          if (hasValue(component.quantity)) {
            result.quantity = Number(component.quantity);
          }

          if (hasValue(component.price)) {
            result.price = Number(component.price);
          }

          return result;
        });
    }

    // Custom fields
    if (Array.isArray(customFieldValues)) {
      itemType.customFieldValues = customFieldValues
        .filter(
          (field) =>
            field &&
            field.name &&
            String(field.name).trim() !== ""
        )
        .map((field) => {
          const result = {
            name: String(field.name).trim(),
          };

          if (
            field.value !== undefined &&
            field.value !== null
          ) {
            result.value = String(field.value);
          }

          return result;
        });
    }

    // -----------------------------
    // BUNDLE validation
    // -----------------------------
    if (itemType.type === "BUNDLE") {
      if (
        !Array.isArray(itemType.componentItemTypes) ||
        itemType.componentItemTypes.length === 0
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "componentItemTypes is required when item type is BUNDLE.",
        });
      }

      for (const component of itemType.componentItemTypes) {
        if (!component.itemSku) {
          return res.status(400).json({
            successful: false,
            message:
              "Each bundle component must contain itemSku.",
          });
        }

        if (
          component.quantity === undefined ||
          !Number.isFinite(component.quantity)
        ) {
          return res.status(400).json({
            successful: false,
            message:
              "Each bundle component must contain a valid quantity.",
          });
        }

        if (
          component.price === undefined ||
          !Number.isFinite(component.price)
        ) {
          return res.status(400).json({
            successful: false,
            message:
              "Each bundle component must contain a valid price.",
          });
        }
      }

      if (
        itemType.taxCalculationType &&
        ![
          "PRICE_OF_COMPONENT_SKU",
          "PRICE_OF_BUNDLE_SKU",
        ].includes(itemType.taxCalculationType)
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "Invalid taxCalculationType for BUNDLE.",
        });
      }
    }

    // -----------------------------
    // Uniware API
    // -----------------------------
    const url =
      `${process.env.UNIWARE_BASE_URL}` +
      `/services/rest/v1/catalog/itemType/createOrEdit`;

    const response = await axios.post(
      url,
      {
        itemType,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${process.env.UNIWARE_ACCESS_TOKEN}`,
        },
        timeout: 30000,
      }
    );

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error(
      "Uniware Create/Update Item Error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json(
      error.response?.data || {
        successful: false,
        message: "Failed to create or update item in Uniware.",
        error: error.message,
      }
    );
  }
});


// ============================================================
// Uniware - Create or Update Multiple Items
// POST /api/uniware/items/bulk-create-or-edit
// ============================================================

app.post(
  "/api/uniware/items/bulk-create-or-edit",
  async (req, res) => {
    try {
      const { itemTypes } = req.body;

      // --------------------------------------------------------
      // Validate itemTypes
      // --------------------------------------------------------
      if (!Array.isArray(itemTypes) || itemTypes.length === 0) {
        return res.status(400).json({
          successful: false,
          message:
            "itemTypes must be a non-empty array.",
        });
      }

      // --------------------------------------------------------
      // Helpers
      // --------------------------------------------------------
      const hasValue = (value) =>
        value !== undefined &&
        value !== null &&
        value !== "";

      const toNumber = (value) => {
        if (!hasValue(value)) {
          return undefined;
        }

        const numberValue = Number(value);

        return Number.isFinite(numberValue)
          ? numberValue
          : undefined;
      };

      const toBoolean = (value) => {
        if (
          value === undefined ||
          value === null ||
          value === ""
        ) {
          return undefined;
        }

        if (typeof value === "boolean") {
          return value;
        }

        return String(value).toLowerCase() === "true";
      };

      // --------------------------------------------------------
      // Build each item
      // --------------------------------------------------------
      const normalizedItems = [];

      for (let index = 0; index < itemTypes.length; index++) {
        const source = itemTypes[index] || {};

        const categoryCode = hasValue(source.categoryCode)
          ? String(source.categoryCode).trim()
          : "";

        const skuCode = hasValue(source.skuCode)
          ? String(source.skuCode).trim()
          : "";

        const name = hasValue(source.name)
          ? String(source.name).trim()
          : "";

        // ----------------------------------------------------
        // Required fields
        // ----------------------------------------------------
        if (!skuCode) {
          return res.status(400).json({
            successful: false,
            message: `Item ${index + 1}: SKU code is required.`,
            fieldName: `itemTypes[${index}].skuCode`,
          });
        }

        if (
          skuCode.length < 3 ||
          skuCode.length > 45
        ) {
          return res.status(400).json({
            successful: false,
            message:
              `Item ${index + 1}: SKU code must be between ` +
              `3 and 45 characters.`,
            fieldName: `itemTypes[${index}].skuCode`,
          });
        }

        if (!/^[a-zA-Z0-9._/-]+$/.test(skuCode)) {
          return res.status(400).json({
            successful: false,
            message:
              `Item ${index + 1}: Invalid SKU. ` +
              `Only letters, numbers, -, ., _, and / are allowed. ` +
              `Spaces are not allowed.`,
            fieldName: `itemTypes[${index}].skuCode`,
          });
        }

        if (!categoryCode) {
          return res.status(400).json({
            successful: false,
            message:
              `Item ${index + 1}: Category code is required.`,
            fieldName: `itemTypes[${index}].categoryCode`,
          });
        }

        if (!name) {
          return res.status(400).json({
            successful: false,
            message:
              `Item ${index + 1}: Item name is required.`,
            fieldName: `itemTypes[${index}].name`,
          });
        }

        if (name.length > 200) {
          return res.status(400).json({
            successful: false,
            message:
              `Item ${index + 1}: Item name cannot exceed 200 characters.`,
            fieldName: `itemTypes[${index}].name`,
          });
        }

        // ----------------------------------------------------
        // Create item object
        // ----------------------------------------------------
        const item = {
          categoryCode,
          skuCode,
          name,
        };

        // ----------------------------------------------------
        // Optional string fields
        // ----------------------------------------------------
        const stringFields = [
          "type",
          "description",
          "scanIdentifier",
          "color",
          "size",
          "brand",
          "ean",
          "upc",
          "isbn",
          "taxTypeCode",
          "gstTaxTypeCode",
          "hsnCode",
          "imageUrl",
          "productPageUrl",
          "features",
          "itemDetailFieldsText",
        ];

        for (const field of stringFields) {
          if (hasValue(source[field])) {
            item[field] = String(source[field]).trim();
          }
        }

        // ----------------------------------------------------
        // Optional numeric fields
        // ----------------------------------------------------
        const numericFields = [
          "length",
          "width",
          "height",
          "weight",
          "minOrderSize",
          "maxRetailPrice",
          "basePrice",
          "costPrice",
          "tat",
          "shelfLife",
        ];

        for (const field of numericFields) {
          const value = toNumber(source[field]);

          if (value !== undefined) {
            item[field] = value;
          }
        }

        // ----------------------------------------------------
        // Optional boolean fields
        // ----------------------------------------------------
        const booleanFields = [
          "requiresCustomization",
          "expirable",
          "enabled",
        ];

        for (const field of booleanFields) {
          const value = toBoolean(source[field]);

          if (value !== undefined) {
            item[field] = value;
          }
        }

        // ----------------------------------------------------
        // Tags
        // ----------------------------------------------------
        if (Array.isArray(source.tags)) {
          item.tags = source.tags
            .filter(
              (tag) =>
                tag !== undefined &&
                tag !== null &&
                String(tag).trim() !== ""
            )
            .map((tag) => String(tag).trim());
        }

        // ----------------------------------------------------
        // Tax calculation type
        // ----------------------------------------------------
        if (hasValue(source.taxCalculationType)) {
          const taxCalculationType =
            String(
              source.taxCalculationType
            ).trim();

          if (
            ![
              "PRICE_OF_COMPONENT_SKU",
              "PRICE_OF_BUNDLE_SKU",
            ].includes(taxCalculationType)
          ) {
            return res.status(400).json({
              successful: false,
              message:
                `Item ${index + 1}: Invalid taxCalculationType.`,
              fieldName:
                `itemTypes[${index}].taxCalculationType`,
            });
          }

          item.taxCalculationType =
            taxCalculationType;
        }

        // ----------------------------------------------------
        // Component item types
        // ----------------------------------------------------
        if (Array.isArray(source.componentItemTypes)) {
          item.componentItemTypes =
            source.componentItemTypes
              .filter(Boolean)
              .map((component) => ({
                itemSku: hasValue(component.itemSku)
                  ? String(component.itemSku).trim()
                  : "",
                quantity: toNumber(
                  component.quantity
                ),
                price: toNumber(
                  component.price
                ),
              }));

          // Remove undefined values
          item.componentItemTypes =
            item.componentItemTypes.map(
              (component) => {
                const result = {
                  itemSku: component.itemSku,
                };

                if (
                  component.quantity !==
                  undefined
                ) {
                  result.quantity =
                    component.quantity;
                }

                if (
                  component.price !==
                  undefined
                ) {
                  result.price =
                    component.price;
                }

                return result;
              }
            );
        }

        // ----------------------------------------------------
        // BUNDLE validation
        // ----------------------------------------------------
        if (item.type === "BUNDLE") {
          if (
            !Array.isArray(
              item.componentItemTypes
            ) ||
            item.componentItemTypes.length === 0
          ) {
            return res.status(400).json({
              successful: false,
              message:
                `Item ${index + 1}: ` +
                "componentItemTypes is required for BUNDLE items.",
              fieldName:
                `itemTypes[${index}].componentItemTypes`,
            });
          }

          for (
            let componentIndex = 0;
            componentIndex <
            item.componentItemTypes.length;
            componentIndex++
          ) {
            const component =
              item.componentItemTypes[
                componentIndex
              ];

            if (!component.itemSku) {
              return res.status(400).json({
                successful: false,
                message:
                  `Item ${index + 1}, component ${
                    componentIndex + 1
                  }: itemSku is required.`,
              });
            }

            if (
              component.quantity ===
                undefined ||
              component.quantity <= 0
            ) {
              return res.status(400).json({
                successful: false,
                message:
                  `Item ${index + 1}, component ${
                    componentIndex + 1
                  }: quantity must be greater than 0.`,
              });
            }

            if (
              component.price ===
                undefined ||
              component.price < 0
            ) {
              return res.status(400).json({
                successful: false,
                message:
                  `Item ${index + 1}, component ${
                    componentIndex + 1
                  }: price is required.`,
              });
            }
          }

          if (
            !item.taxCalculationType
          ) {
            item.taxCalculationType =
              "PRICE_OF_COMPONENT_SKU";
          }
        }

        // ----------------------------------------------------
        // Custom fields
        // ----------------------------------------------------
        if (
          Array.isArray(
            source.customFieldValues
          )
        ) {
          item.customFieldValues =
            source.customFieldValues
              .filter(
                (field) =>
                  field &&
                  hasValue(field.name)
              )
              .map((field) => {
                const customField = {
                  name: String(
                    field.name
                  ).trim(),
                };

                if (
                  field.value !==
                    undefined &&
                  field.value !== null
                ) {
                  customField.value =
                    String(field.value);
                }

                return customField;
              });
        }

        normalizedItems.push(item);
      }

      // --------------------------------------------------------
      // Uniware URL
      // --------------------------------------------------------
      const url =
        `${process.env.UNIWARE_BASE_URL}` +
        `/services/rest/v1/catalog/itemTypes/createOrEdit`;

      // --------------------------------------------------------
      // Call Uniware
      // Tenant-level API
      // NO Facility header
      // --------------------------------------------------------
      const response = await axios.post(
        url,
        {
          itemTypes: normalizedItems,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization:
              `bearer ${process.env.UNIWARE_ACCESS_TOKEN}`,
          },
          timeout: 60000,
        }
      );

      return res
        .status(response.status)
        .json(response.data);
    } catch (error) {
      console.error(
        "Uniware Bulk Create/Update Items Error:",
        error.response?.data ||
          error.message
      );

      return res
        .status(
          error.response?.status || 500
        )
        .json(
          error.response?.data || {
            successful: false,
            message:
              "Failed to create or update items in Uniware.",
            error: error.message,
          }
        );
    }
  }
);

// ============================================================
// UNiWARE - CREATE OR UPDATE CHANNEL ITEM TYPE
// ============================================================

app.post("/api/uniware/channel-item-types/create-or-edit", async (req, res) => {
  try {
    const {
      channelCode,
      channelProductId,
      sellerSkuCode,
      skuCode,
      blockedInventory,
      live,
      verified,
      disabled,
    } = req.body;

    // --------------------------------------------------------
    // Validation
    // --------------------------------------------------------

    if (!channelCode || !channelCode.trim()) {
      return res.status(400).json({
        successful: false,
        message: "Channel Code is required.",
      });
    }

    if (!channelProductId || !channelProductId.trim()) {
      return res.status(400).json({
        successful: false,
        message: "Channel Product ID is required.",
      });
    }

    if (!sellerSkuCode || !sellerSkuCode.trim()) {
      return res.status(400).json({
        successful: false,
        message: "Seller SKU Code is required.",
      });
    }

    if (!skuCode || !skuCode.trim()) {
      return res.status(400).json({
        successful: false,
        message: "Uniware SKU Code is required.",
      });
    }

    // --------------------------------------------------------
    // Build payload
    // --------------------------------------------------------

    const channelItemType = {
      channelCode: channelCode.trim(),
      channelProductId: channelProductId.trim(),
      sellerSkuCode: sellerSkuCode.trim(),
      skuCode: skuCode.trim(),
      blockedInventory:
        blockedInventory === undefined ||
        blockedInventory === null ||
        blockedInventory === ""
          ? 0
          : Number(blockedInventory),
      live: Boolean(live),
      verified: Boolean(verified),
      disabled: Boolean(disabled),
    };

    // --------------------------------------------------------
    // Uniware API
    // Tenant level - NO Facility header
    // --------------------------------------------------------

    const url =
      `${process.env.UNIWARE_BASE_URL}` +
      `/services/rest/v1/channel/createChannelItemType`;

    const response = await axios.post(
      url,
      {
        channelItemType,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${process.env.UNIWARE_ACCESS_TOKEN}`,
        },
        timeout: 30000,
      }
    );

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error(
      "Uniware Create/Update Channel Item Type Error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json(
      error.response?.data || {
        successful: false,
        message: error.message || "Failed to create/update channel item type.",
      }
    );
  }
});
// ============================================================
// UNiWARE - GET ITEM DETAILS
// ============================================================

app.post("/api/uniware/items/details", async (req, res) => {
  try {
    const {
      skuCode,
      cartonScanIdentifier,
      kitSku,
    } = req.body;

    // --------------------------------------------------------
    // Validation
    // --------------------------------------------------------

    if (!skuCode || !String(skuCode).trim()) {
      return res.status(400).json({
        successful: false,
        message: "SKU Code is required.",
        errors: [
          {
            fieldName: "skuCode",
            message: "SKU Code is required.",
          },
        ],
      });
    }

    // --------------------------------------------------------
    // Build Uniware request payload
    // --------------------------------------------------------

    const payload = {
      skuCode: String(skuCode).trim(),
      kitSku: typeof kitSku === "boolean" ? kitSku : false,
    };

    // Optional field
    if (
      cartonScanIdentifier !== undefined &&
      cartonScanIdentifier !== null &&
      String(cartonScanIdentifier).trim() !== ""
    ) {
      payload.cartonScanIdentifier =
        String(cartonScanIdentifier).trim();
    }

    // --------------------------------------------------------
    // Uniware API
    // Tenant level
    // NO Facility header
    // --------------------------------------------------------

    const url =
      `${process.env.UNIWARE_BASE_URL}` +
      `/services/rest/v1/catalog/itemType/get`;

    const response = await axios.post(
      url,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${process.env.UNIWARE_ACCESS_TOKEN}`,
        },
        timeout: 30000,
      }
    );

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error(
      "Uniware Get Item Details Error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json(
      error.response?.data || {
        successful: false,
        message:
          error.message || "Failed to fetch item details.",
      }
    );
  }
});
// ============================================================
// UNiWARE - GET ITEM BARCODE DETAILS
// ============================================================

app.post("/api/uniware/items/barcode-details", async (req, res) => {
  try {
    const {
      facility,
      itemCode,
    } = req.body;

    // --------------------------------------------------------
    // Validation
    // --------------------------------------------------------

    if (!facility || !String(facility).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Facility Code is required.",
        errors: [
          {
            fieldName: "facility",
            message: "Facility Code is required.",
          },
        ],
      });
    }

    if (!itemCode || !String(itemCode).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Item Code / Barcode is required.",
        errors: [
          {
            fieldName: "itemCode",
            message: "Item Code / Barcode is required.",
          },
        ],
      });
    }

    // --------------------------------------------------------
    // Uniware request payload
    // --------------------------------------------------------

    const payload = {
      itemCode: String(itemCode).trim(),
    };

    // --------------------------------------------------------
    // Uniware API
    // Facility level
    // --------------------------------------------------------

    const url =
      `${process.env.UNIWARE_BASE_URL}` +
      `/services/rest/v1/product/item/get`;

    const response = await axios.post(
      url,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${process.env.UNIWARE_ACCESS_TOKEN}`,
          Facility: String(facility).trim(),
        },
        timeout: 30000,
      }
    );

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error(
      "Uniware Get Item Barcode Details Error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json(
      error.response?.data || {
        successful: false,
        message:
          error.message ||
          "Failed to fetch item barcode details.",
      }
    );
  }
});
// Search Uniware Item Types / SKUs
app.post("/api/uniware/items/search", async (req, res) => {
  try {
    const {
      keyword,
      productCode,
      categoryCode,
      getInventorySnapshot,
      updatedSinceInHour,
      skuType,
      searchOptions,
    } = req.body;

    const payload = {};

    // Optional top-level filters
    if (keyword?.trim()) {
      payload.keyword = keyword.trim();
    }

    if (productCode?.trim()) {
      payload.productCode = productCode.trim();
    }

    if (categoryCode?.trim()) {
      payload.categoryCode = categoryCode.trim();
    }

    if (typeof getInventorySnapshot === "boolean") {
      payload.getInventorySnapshot = getInventorySnapshot;
    }

    if (
      updatedSinceInHour !== undefined &&
      updatedSinceInHour !== null &&
      updatedSinceInHour !== ""
    ) {
      payload.updatedSinceInHour = Number(updatedSinceInHour);
    }

    if (skuType?.trim()) {
      payload.skuType = skuType.trim();
    }

    // Optional searchOptions
    if (searchOptions && typeof searchOptions === "object") {
      const options = {};

      if (searchOptions.searchKey?.trim()) {
        options.searchKey = searchOptions.searchKey.trim();
      }

      if (
        searchOptions.displayLength !== undefined &&
        searchOptions.displayLength !== null &&
        searchOptions.displayLength !== ""
      ) {
        options.displayLength = Number(searchOptions.displayLength);
      }

      if (
        searchOptions.displayStart !== undefined &&
        searchOptions.displayStart !== null &&
        searchOptions.displayStart !== ""
      ) {
        options.displayStart = Number(searchOptions.displayStart);
      }

      if (
        searchOptions.columns !== undefined &&
        searchOptions.columns !== null &&
        searchOptions.columns !== ""
      ) {
        options.columns = Number(searchOptions.columns);
      }

      if (
        searchOptions.sortingCols !== undefined &&
        searchOptions.sortingCols !== null &&
        searchOptions.sortingCols !== ""
      ) {
        options.sortingCols = Number(searchOptions.sortingCols);
      }

      if (
        searchOptions.sortColumnIndex !== undefined &&
        searchOptions.sortColumnIndex !== null &&
        searchOptions.sortColumnIndex !== ""
      ) {
        options.sortColumnIndex = Number(searchOptions.sortColumnIndex);
      }

      if (searchOptions.sortDirection?.trim()) {
        options.sortDirection = searchOptions.sortDirection.trim();
      }

      if (searchOptions.columnNames?.trim()) {
        options.columnNames = searchOptions.columnNames.trim();
      }

      if (typeof searchOptions.getCount === "boolean") {
        options.getCount = searchOptions.getCount;
      }

      if (Object.keys(options).length > 0) {
        payload.searchOptions = options;
      }
    }

    const response = await axios.post(
      `${process.env.UNIWARE_BASE_URL}/services/rest/v1/product/itemType/search`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${process.env.UNIWARE_ACCESS_TOKEN}`,
        },
      }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(
      "Uniware Search Items Error:",
      error.response?.data || error.message
    );

    res.status(error.response?.status || 500).json(
      error.response?.data || {
        successful: false,
        message: error.message || "Failed to search Uniware items",
        errors: [],
        warnings: [],
      }
    );
  }
});
// Get Uniware Inventory Snapshot
app.post("/api/uniware/inventory/snapshot", async (req, res) => {
  try {
    const {
      facility,
      itemTypeSKUs,
      updatedSinceInMinutes,
    } = req.body;

    // Facility is mandatory
    if (!facility || !facility.trim()) {
      return res.status(400).json({
        successful: false,
        message: "Facility code is required.",
        errors: [],
        warnings: [],
      });
    }

    // At least one filter must be provided
    const hasSKUs =
      Array.isArray(itemTypeSKUs) &&
      itemTypeSKUs.some(
        (sku) => typeof sku === "string" && sku.trim()
      );

    const hasUpdatedSince =
      updatedSinceInMinutes !== undefined &&
      updatedSinceInMinutes !== null &&
      updatedSinceInMinutes !== "";

    if (!hasSKUs && !hasUpdatedSince) {
      return res.status(400).json({
        successful: false,
        message:
          "Provide itemTypeSKUs, updatedSinceInMinutes, or both.",
        errors: [],
        warnings: [],
      });
    }

    const payload = {};

    // Maximum 10,000 SKUs
    if (hasSKUs) {
      const skus = itemTypeSKUs
        .filter(
          (sku) =>
            typeof sku === "string" &&
            sku.trim()
        )
        .map((sku) => sku.trim());

      if (skus.length > 10000) {
        return res.status(400).json({
          successful: false,
          message:
            "A maximum of 10,000 SKUs can be sent in one request.",
          errors: [],
          warnings: [],
        });
      }

      payload.itemTypeSKUs = skus;
    }

    // Maximum 1440 minutes = 24 hours
    if (hasUpdatedSince) {
      const minutes = Number(updatedSinceInMinutes);

      if (!Number.isInteger(minutes)) {
        return res.status(400).json({
          successful: false,
          message:
            "updatedSinceInMinutes must be an integer.",
          errors: [],
          warnings: [],
        });
      }

      if (minutes < 0 || minutes > 1440) {
        return res.status(400).json({
          successful: false,
          message:
            "updatedSinceInMinutes must be between 0 and 1440 minutes.",
          errors: [],
          warnings: [],
        });
      }

      payload.updatedSinceInMinutes = minutes;
    }

    const response = await axios.post(
      `${process.env.UNIWARE_BASE_URL}/services/rest/v1/inventory/inventorySnapshot/get`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${process.env.UNIWARE_ACCESS_TOKEN}`,
          Facility: facility.trim(),
        },
      }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(
      "Uniware Inventory Snapshot Error:",
      error.response?.data || error.message
    );

    res.status(error.response?.status || 500).json(
      error.response?.data || {
        successful: false,
        message:
          error.message ||
          "Failed to get Uniware inventory snapshot.",
        errors: [],
        warnings: [],
      }
    );
  }
});
// Adjust Inventory - Single SKU
app.post("/api/uniware/inventory/adjust", async (req, res) => {
  try {
    const {
      facility,
      inventoryAdjustment,
    } = req.body;

    // -----------------------------
    // Validate Facility
    // -----------------------------
    if (!facility || !facility.trim()) {
      return res.status(400).json({
        successful: false,
        message: "Facility code is required.",
        errors: [],
        warnings: [],
      });
    }

    // -----------------------------
    // Validate adjustment object
    // -----------------------------
    if (
      !inventoryAdjustment ||
      typeof inventoryAdjustment !== "object"
    ) {
      return res.status(400).json({
        successful: false,
        message: "inventoryAdjustment is required.",
        errors: [],
        warnings: [],
      });
    }

    const {
      itemSKU,
      quantity,
      shelfCode,
      inventoryType,
      transferToShelfCode,
      sla,
      adjustmentType,
      remarks,
    } = inventoryAdjustment;

    // -----------------------------
    // Required: itemSKU
    // -----------------------------
    if (!itemSKU || !itemSKU.trim()) {
      return res.status(400).json({
        successful: false,
        message: "Item SKU is required.",
        errors: [],
        warnings: [],
      });
    }

    // -----------------------------
    // Required: quantity
    // -----------------------------
    if (
      quantity === undefined ||
      quantity === null ||
      quantity === ""
    ) {
      return res.status(400).json({
        successful: false,
        message: "Quantity is required.",
        errors: [],
        warnings: [],
      });
    }

    const numericQuantity = Number(quantity);

    if (!Number.isFinite(numericQuantity)) {
      return res.status(400).json({
        successful: false,
        message: "Quantity must be a valid number.",
        errors: [],
        warnings: [],
      });
    }

    // -----------------------------
    // Required: shelfCode
    // -----------------------------
    if (!shelfCode || !shelfCode.trim()) {
      return res.status(400).json({
        successful: false,
        message: "Shelf code is required.",
        errors: [],
        warnings: [],
      });
    }

    // -----------------------------
    // Required: adjustmentType
    // -----------------------------
    const allowedAdjustmentTypes = [
      "ADD",
      "REMOVE",
      "REPLACE",
      "TRANSFER",
    ];

    const finalAdjustmentType =
      adjustmentType?.trim() || "";

    if (
      !allowedAdjustmentTypes.includes(
        finalAdjustmentType
      )
    ) {
      return res.status(400).json({
        successful: false,
        message:
          "Adjustment type must be ADD, REMOVE, REPLACE, or TRANSFER.",
        errors: [],
        warnings: [],
      });
    }

    // -----------------------------
    // Inventory Type
    // -----------------------------
    const allowedInventoryTypes = [
      "GOOD_INVENTORY",
      "BAD_INVENTORY",
      "QC_REJECTED",
      "VIRTUAL_INVENTORY",
    ];

    const finalInventoryType =
      inventoryType?.trim() ||
      "GOOD_INVENTORY";

    if (
      !allowedInventoryTypes.includes(
        finalInventoryType
      )
    ) {
      return res.status(400).json({
        successful: false,
        message:
          "Invalid inventory type.",
        errors: [],
        warnings: [],
      });
    }

    // -----------------------------
    // TRANSFER requires destination shelf
    // -----------------------------
    if (
      finalAdjustmentType === "TRANSFER" &&
      (!transferToShelfCode ||
        !transferToShelfCode.trim())
    ) {
      return res.status(400).json({
        successful: false,
        message:
          "transferToShelfCode is required for TRANSFER.",
        errors: [],
        warnings: [],
      });
    }

    // -----------------------------
    // Remarks max 255
    // -----------------------------
    if (
      remarks !== undefined &&
      remarks !== null &&
      String(remarks).length > 255
    ) {
      return res.status(400).json({
        successful: false,
        message:
          "Remarks cannot exceed 255 characters.",
        errors: [],
        warnings: [],
      });
    }

    // -----------------------------
    // Build Uniware payload
    // -----------------------------
    const adjustment = {
      itemSKU: itemSKU.trim(),
      quantity: numericQuantity,
      shelfCode: shelfCode.trim(),
      inventoryType: finalInventoryType,
      adjustmentType: finalAdjustmentType,
    };

    // TRANSFER destination
    if (
      finalAdjustmentType === "TRANSFER" &&
      transferToShelfCode?.trim()
    ) {
      adjustment.transferToShelfCode =
        transferToShelfCode.trim();
    }

    // Optional SLA
    if (
      sla !== undefined &&
      sla !== null &&
      sla !== ""
    ) {
      adjustment.sla = Number(sla);

      if (!Number.isFinite(adjustment.sla)) {
        return res.status(400).json({
          successful: false,
          message: "SLA must be a valid number.",
          errors: [],
          warnings: [],
        });
      }
    }

    // Optional remarks
    if (
      remarks !== undefined &&
      remarks !== null &&
      String(remarks).trim()
    ) {
      adjustment.remarks =
        String(remarks).trim();
    }

    const payload = {
      inventoryAdjustment: adjustment,
    };

    // -----------------------------
    // Call Uniware
    // -----------------------------
    const response = await axios.post(
      `${process.env.UNIWARE_BASE_URL}/services/rest/v1/inventory/adjust`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${process.env.UNIWARE_ACCESS_TOKEN}`,
          Facility: facility.trim(),
        },
      }
    );

    res.status(response.status).json(
      response.data
    );
  } catch (error) {
    console.error(
      "Uniware Adjust Inventory Error:",
      error.response?.data ||
        error.message
    );

    res.status(
      error.response?.status || 500
    ).json(
      error.response?.data || {
        successful: false,
        message:
          error.message ||
          "Failed to adjust inventory.",
        errors: [],
        warnings: [],
      }
    );
  }
});
// ============================================================
// UNIWARE - ADJUST INVENTORY (MULTIPLE / BULK)
// POST /api/uniware/inventory/adjust-bulk
// ============================================================

app.post("/api/uniware/inventory/adjust-bulk", async (req, res) => {
  try {
    const { facility, inventoryAdjustments, forceAllocate } = req.body;

    // ----------------------------------------------------------
    // Basic validation
    // ----------------------------------------------------------
    if (!facility || !facility.trim()) {
      return res.status(400).json({
        successful: false,
        message: "Facility header is required."
      });
    }

    if (
      !Array.isArray(inventoryAdjustments) ||
      inventoryAdjustments.length === 0
    ) {
      return res.status(400).json({
        successful: false,
        message: "At least one inventory adjustment is required."
      });
    }

    if (!process.env.UNIWARE_BASE_URL) {
      return res.status(500).json({
        successful: false,
        message: "UNIWARE_BASE_URL is not configured."
      });
    }

    if (!process.env.UNIWARE_ACCESS_TOKEN) {
      return res.status(500).json({
        successful: false,
        message: "UNIWARE_ACCESS_TOKEN is not configured."
      });
    }

    // ----------------------------------------------------------
    // Allowed values
    // ----------------------------------------------------------
    const allowedAdjustmentTypes = [
      "ADD",
      "REMOVE",
      "REPLACE",
      "TRANSFER"
    ];

    const allowedInventoryTypes = [
      "GOOD_INVENTORY",
      "BAD_INVENTORY",
      "QC_REJECTED",
      "VIRTUAL_INVENTORY"
    ];

    // ----------------------------------------------------------
    // Validate and normalize each adjustment
    // ----------------------------------------------------------
    const normalizedAdjustments = [];

    for (let index = 0; index < inventoryAdjustments.length; index++) {
      const adjustment = inventoryAdjustments[index] || {};

      const rowNumber = index + 1;

      // itemSKU
      if (!adjustment.itemSKU || !String(adjustment.itemSKU).trim()) {
        return res.status(400).json({
          successful: false,
          message: `Item SKU is required for adjustment ${rowNumber}.`
        });
      }

      // quantity
      if (
        adjustment.quantity === undefined ||
        adjustment.quantity === null ||
        adjustment.quantity === "" ||
        Number.isNaN(Number(adjustment.quantity))
      ) {
        return res.status(400).json({
          successful: false,
          message: `Quantity is required and must be numeric for adjustment ${rowNumber}.`
        });
      }

      // shelfCode
      if (!adjustment.shelfCode || !String(adjustment.shelfCode).trim()) {
        return res.status(400).json({
          successful: false,
          message: `Shelf code is required for adjustment ${rowNumber}.`
        });
      }

      // adjustmentType
      const adjustmentType = String(
        adjustment.adjustmentType || ""
      ).trim().toUpperCase();

      if (!allowedAdjustmentTypes.includes(adjustmentType)) {
        return res.status(400).json({
          successful: false,
          message:
            `Invalid adjustmentType for adjustment ${rowNumber}. ` +
            `Allowed values: ${allowedAdjustmentTypes.join(", ")}.`
        });
      }

      // inventoryType
      const inventoryType = String(
        adjustment.inventoryType || "GOOD_INVENTORY"
      )
        .trim()
        .toUpperCase();

      if (!allowedInventoryTypes.includes(inventoryType)) {
        return res.status(400).json({
          successful: false,
          message:
            `Invalid inventoryType for adjustment ${rowNumber}. ` +
            `Allowed values: ${allowedInventoryTypes.join(", ")}.`
        });
      }

      // facilityCode
      if (
        !adjustment.facilityCode ||
        !String(adjustment.facilityCode).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message: `facilityCode is required for adjustment ${rowNumber}.`
        });
      }

      // TRANSFER requires destination shelf
      if (
        adjustmentType === "TRANSFER" &&
        (!adjustment.transferToShelfCode ||
          !String(adjustment.transferToShelfCode).trim())
      ) {
        return res.status(400).json({
          successful: false,
          message:
            `transferToShelfCode is required for TRANSFER ` +
            `in adjustment ${rowNumber}.`
        });
      }

      // remarks max 255
      if (
        adjustment.remarks !== undefined &&
        adjustment.remarks !== null &&
        String(adjustment.remarks).length > 255
      ) {
        return res.status(400).json({
          successful: false,
          message:
            `Remarks cannot exceed 255 characters for adjustment ${rowNumber}.`
        });
      }

      // --------------------------------------------------------
      // Build payload dynamically
      // Do not send unnecessary empty properties.
      // --------------------------------------------------------
      const item = {
        itemSKU: String(adjustment.itemSKU).trim(),
        quantity: Number(adjustment.quantity),
        shelfCode: String(adjustment.shelfCode).trim(),
        inventoryType,
        adjustmentType,
        facilityCode: String(adjustment.facilityCode).trim()
      };

      if (
        adjustment.transferToShelfCode !== undefined &&
        adjustment.transferToShelfCode !== null &&
        String(adjustment.transferToShelfCode).trim()
      ) {
        item.transferToShelfCode = String(
          adjustment.transferToShelfCode
        ).trim();
      }

      if (
        adjustment.sla !== undefined &&
        adjustment.sla !== null &&
        adjustment.sla !== ""
      ) {
        if (Number.isNaN(Number(adjustment.sla))) {
          return res.status(400).json({
            successful: false,
            message: `SLA must be numeric for adjustment ${rowNumber}.`
          });
        }

        item.sla = Number(adjustment.sla);
      }

      if (
        adjustment.remarks !== undefined &&
        adjustment.remarks !== null &&
        String(adjustment.remarks).trim()
      ) {
        item.remarks = String(adjustment.remarks).trim();
      }

      normalizedAdjustments.push(item);
    }

    // ----------------------------------------------------------
    // forceAllocate
    // ----------------------------------------------------------
    const finalForceAllocate =
      forceAllocate === true || forceAllocate === "true";

    const payload = {
      inventoryAdjustments: normalizedAdjustments,
      forceAllocate: finalForceAllocate
    };

    // ----------------------------------------------------------
    // Uniware request
    //
    // Facility header is required by the API.
    // For a multi-facility request, the individual
    // facilityCode values identify the adjustment facility.
    // ----------------------------------------------------------
    const url =
      `${process.env.UNIWARE_BASE_URL}` +
      `/services/rest/v1/inventory/adjust/bulk`;

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${process.env.UNIWARE_ACCESS_TOKEN}`,
        Facility: facility.trim()
      },
      timeout: 60000
    });

    return res.status(response.status || 200).json(response.data);
  } catch (error) {
    console.error(
      "Uniware bulk inventory adjustment error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json(
      error.response?.data || {
        successful: false,
        message: error.message || "Failed to adjust inventory."
      }
    );
  }
});

// ============================================================
// UNIWARE - ADJUST BATCHWISE INVENTORY (MULTIPLE / BULK)
// POST /api/uniware/inventory/adjust-batch-bulk
// ============================================================

app.post(
  "/api/uniware/inventory/adjust-batch-bulk",
  async (req, res) => {
    try {
      const {
        facility,
        inventoryAdjustments,
        forceAllocate
      } = req.body;

      // --------------------------------------------------------
      // Basic validation
      // --------------------------------------------------------
      if (!facility || !facility.trim()) {
        return res.status(400).json({
          successful: false,
          message: "Facility header is required."
        });
      }

      if (
        !Array.isArray(inventoryAdjustments) ||
        inventoryAdjustments.length === 0
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "At least one batchwise inventory adjustment is required."
        });
      }

      if (!process.env.UNIWARE_BASE_URL) {
        return res.status(500).json({
          successful: false,
          message:
            "UNIWARE_BASE_URL is not configured."
        });
      }

      if (!process.env.UNIWARE_ACCESS_TOKEN) {
        return res.status(500).json({
          successful: false,
          message:
            "UNIWARE_ACCESS_TOKEN is not configured."
        });
      }

      // --------------------------------------------------------
      // Allowed values
      // --------------------------------------------------------
      const allowedAdjustmentTypes = [
        "ADD",
        "REMOVE",
        "REPLACE",
        "TRANSFER"
      ];

      const allowedInventoryTypes = [
        "GOOD_INVENTORY",
        "BAD_INVENTORY",
        "QC_REJECTED",
        "VIRTUAL_INVENTORY"
      ];

      const normalizedAdjustments = [];

      // --------------------------------------------------------
      // Process each adjustment
      // --------------------------------------------------------
      for (
        let index = 0;
        index < inventoryAdjustments.length;
        index++
      ) {
        const adjustment =
          inventoryAdjustments[index] || {};

        const rowNumber = index + 1;

        // ------------------------------------------------------
        // itemSKU
        // ------------------------------------------------------
        if (
          !adjustment.itemSKU ||
          !String(adjustment.itemSKU).trim()
        ) {
          return res.status(400).json({
            successful: false,
            message:
              `Item SKU is required for adjustment ${rowNumber}.`
          });
        }

        // ------------------------------------------------------
        // quantity
        // ------------------------------------------------------
        if (
          adjustment.quantity === undefined ||
          adjustment.quantity === null ||
          adjustment.quantity === "" ||
          Number.isNaN(Number(adjustment.quantity))
        ) {
          return res.status(400).json({
            successful: false,
            message:
              `Quantity is required and must be numeric ` +
              `for adjustment ${rowNumber}.`
          });
        }

        // ------------------------------------------------------
        // shelfCode
        // ------------------------------------------------------
        if (
          !adjustment.shelfCode ||
          !String(adjustment.shelfCode).trim()
        ) {
          return res.status(400).json({
            successful: false,
            message:
              `Shelf code is required for adjustment ${rowNumber}.`
          });
        }

        // ------------------------------------------------------
        // facilityCode
        // ------------------------------------------------------
        if (
          !adjustment.facilityCode ||
          !String(adjustment.facilityCode).trim()
        ) {
          return res.status(400).json({
            successful: false,
            message:
              `facilityCode is required for adjustment ${rowNumber}.`
          });
        }

        // ------------------------------------------------------
        // adjustmentType
        // ------------------------------------------------------
        const adjustmentType = String(
          adjustment.adjustmentType || ""
        )
          .trim()
          .toUpperCase();

        if (
          !allowedAdjustmentTypes.includes(
            adjustmentType
          )
        ) {
          return res.status(400).json({
            successful: false,
            message:
              `Invalid adjustmentType for adjustment ${rowNumber}. ` +
              `Allowed values: ${allowedAdjustmentTypes.join(
                ", "
              )}.`
          });
        }

        // ------------------------------------------------------
        // inventoryType
        // ------------------------------------------------------
        const inventoryType = String(
          adjustment.inventoryType ||
            "GOOD_INVENTORY"
        )
          .trim()
          .toUpperCase();

        if (
          !allowedInventoryTypes.includes(
            inventoryType
          )
        ) {
          return res.status(400).json({
            successful: false,
            message:
              `Invalid inventoryType for adjustment ${rowNumber}. ` +
              `Allowed values: ${allowedInventoryTypes.join(
                ", "
              )}.`
          });
        }

        // ------------------------------------------------------
        // TRANSFER validation
        // ------------------------------------------------------
        if (
          adjustmentType === "TRANSFER" &&
          (
            !adjustment.transferToShelfCode ||
            !String(
              adjustment.transferToShelfCode
            ).trim()
          )
        ) {
          return res.status(400).json({
            successful: false,
            message:
              `transferToShelfCode is required for ` +
              `TRANSFER in adjustment ${rowNumber}.`
          });
        }

        // ------------------------------------------------------
        // remarks validation
        // ------------------------------------------------------
        if (
          adjustment.remarks !== undefined &&
          adjustment.remarks !== null &&
          String(adjustment.remarks).length > 255
        ) {
          return res.status(400).json({
            successful: false,
            message:
              `Remarks cannot exceed 255 characters ` +
              `for adjustment ${rowNumber}.`
          });
        }

        // ------------------------------------------------------
        // BATCH MODE
        //
        // Mode 1:
        // Existing batchCode
        //
        // Mode 2:
        // New batch details
        // ------------------------------------------------------
        const batchCode = adjustment.batchCode
          ? String(adjustment.batchCode).trim()
          : "";

        const hasBatchDetails =
          adjustment.batchDetails &&
          typeof adjustment.batchDetails ===
            "object";

        if (!batchCode && !hasBatchDetails) {
          return res.status(400).json({
            successful: false,
            message:
              `Either batchCode or batchDetails is required ` +
              `for adjustment ${rowNumber}.`
          });
        }

        // The Uniware documentation states that batchDetails
        // should not be supplied when batchCode is passed.
        if (batchCode && hasBatchDetails) {
          return res.status(400).json({
            successful: false,
            message:
              `Do not send batchDetails when batchCode is ` +
              `provided for adjustment ${rowNumber}.`
          });
        }

        // ------------------------------------------------------
        // Build the common adjustment
        // ------------------------------------------------------
        const item = {
          itemSKU: String(
            adjustment.itemSKU
          ).trim(),

          quantity: Number(
            adjustment.quantity
          ),

          shelfCode: String(
            adjustment.shelfCode
          ).trim(),

          inventoryType,

          adjustmentType,

          facilityCode: String(
            adjustment.facilityCode
          ).trim()
        };

        // ------------------------------------------------------
        // transferToShelfCode
        // ------------------------------------------------------
        if (
          adjustment.transferToShelfCode !==
            undefined &&
          adjustment.transferToShelfCode !==
            null &&
          String(
            adjustment.transferToShelfCode
          ).trim()
        ) {
          item.transferToShelfCode =
            String(
              adjustment.transferToShelfCode
            ).trim();
        }

        // ------------------------------------------------------
        // SLA
        // ------------------------------------------------------
        if (
          adjustment.sla !== undefined &&
          adjustment.sla !== null &&
          adjustment.sla !== ""
        ) {
          if (
            Number.isNaN(
              Number(adjustment.sla)
            )
          ) {
            return res.status(400).json({
              successful: false,
              message:
                `SLA must be numeric for adjustment ${rowNumber}.`
            });
          }

          item.sla = Number(
            adjustment.sla
          );
        }

        // ------------------------------------------------------
        // Remarks
        // ------------------------------------------------------
        if (
          adjustment.remarks !==
            undefined &&
          adjustment.remarks !== null &&
          String(adjustment.remarks).trim()
        ) {
          item.remarks = String(
            adjustment.remarks
          ).trim();
        }

        // ------------------------------------------------------
        // Existing batch
        // ------------------------------------------------------
        if (batchCode) {
          item.batchCode = batchCode;
        }

        // ------------------------------------------------------
        // New batch details
        // ------------------------------------------------------
        if (hasBatchDetails) {
          const details =
            adjustment.batchDetails;

          // According to documentation, these are
          // mandatory when batchDetails are supplied.
          const requiredBatchFields = [
            "mrp",
            "cost",
            "mfd",
            "vendorCode",
            "expiryDate",
            "vendorBatchNumber"
          ];

          for (
            const field of requiredBatchFields
          ) {
            if (
              details[field] ===
                undefined ||
              details[field] ===
                null ||
              String(details[field]).trim() ===
                ""
            ) {
              return res.status(400).json({
                successful: false,
                message:
                  `${field} is required in batchDetails ` +
                  `for adjustment ${rowNumber}.`
              });
            }
          }

          item.batchDetails = {
            mrp: String(
              details.mrp
            ).trim(),

            cost: String(
              details.cost
            ).trim(),

            mfd: String(
              details.mfd
            ).trim(),

            vendorCode: String(
              details.vendorCode
            ).trim(),

            expiryDate: String(
              details.expiryDate
            ).trim(),

            vendorBatchNumber: String(
              details.vendorBatchNumber
            ).trim()
          };
        }

        normalizedAdjustments.push(item);
      }

      // --------------------------------------------------------
      // forceAllocate
      // --------------------------------------------------------
      const finalForceAllocate =
        forceAllocate === true ||
        forceAllocate === "true";

      // --------------------------------------------------------
      // Final Uniware payload
      // --------------------------------------------------------
      const payload = {
        inventoryAdjustments:
          normalizedAdjustments,
        forceAllocate:
          finalForceAllocate
      };

      // --------------------------------------------------------
      // Uniware API
      // --------------------------------------------------------
      const url =
        `${process.env.UNIWARE_BASE_URL}` +
        `/services/rest/v1/inventory/adjust/bulk`;

      const response = await axios.post(
        url,
        payload,
        {
          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `bearer ${process.env.UNIWARE_ACCESS_TOKEN}`,

            Facility:
              facility.trim()
          },

          timeout: 60000
        }
      );

      return res
        .status(response.status || 200)
        .json(response.data);
    } catch (error) {
      console.error(
        "Uniware batchwise inventory adjustment error:",
        error.response?.data ||
          error.message
      );

      return res
        .status(
          error.response?.status || 500
        )
        .json(
          error.response?.data || {
            successful: false,
            message:
              error.message ||
              "Failed to adjust batchwise inventory."
          }
        );
    }
  }
);

// ============================================================
// UNIWARE - MARK INVENTORY FOUND
// POST /api/uniware/inventory/mark-found
// Uniware:
// POST /services/rest/v1/inventory/markQuantityFound
// Facility-level API
// ============================================================

app.post("/api/uniware/inventory/mark-found", async (req, res) => {
  try {
    const {
      facility,
      itemSku,
      shelfCode,
      quantityFound,
      ageingStartDate,
    } = req.body;

    // --------------------------------------------------------
    // Validation
    // --------------------------------------------------------
    if (!facility || !facility.trim()) {
      return res.status(400).json({
        successful: false,
        message: "Facility is required.",
      });
    }

    if (!itemSku || !itemSku.trim()) {
      return res.status(400).json({
        successful: false,
        message: "itemSku is required.",
      });
    }

    if (!shelfCode || !shelfCode.trim()) {
      return res.status(400).json({
        successful: false,
        message: "shelfCode is required.",
      });
    }

    if (
      quantityFound === undefined ||
      quantityFound === null ||
      quantityFound === ""
    ) {
      return res.status(400).json({
        successful: false,
        message: "quantityFound is required.",
      });
    }

    const parsedQuantity = Number(quantityFound);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      return res.status(400).json({
        successful: false,
        message: "quantityFound must be a non-negative integer.",
      });
    }

    // --------------------------------------------------------
    // Build Uniware payload
    // --------------------------------------------------------
    const payload = {
      itemSku: itemSku.trim(),
      shelfCode: shelfCode.trim(),
      quantityFound: parsedQuantity,
    };

    // Optional field
    if (ageingStartDate && String(ageingStartDate).trim()) {
      const date = new Date(ageingStartDate);

      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({
          successful: false,
          message: "ageingStartDate must be a valid date-time.",
        });
      }

      payload.ageingStartDate = date.toISOString();
    }

    // --------------------------------------------------------
    // Call Uniware
    // --------------------------------------------------------
    const response = await axios.post(
      `${process.env.UNIWARE_BASE_URL}/services/rest/v1/inventory/markQuantityFound`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${process.env.UNIWARE_ACCESS_TOKEN}`,
          Facility: facility.trim(),
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Uniware Mark Inventory Found Error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json(
      error.response?.data || {
        successful: false,
        message: error.message || "Failed to mark inventory as found.",
      }
    );
  }
});

// ============================================================
// UNIWARE - GET NEARBY STORE INVENTORY
// POST /api/uniware/inventory/nearby
// Uniware:
// POST /services/rest/v1/oms/nearbyInventory/get
// Level: Tenant
// ============================================================

app.post("/api/uniware/inventory/nearby", async (req, res) => {
  try {
    const {
      customerPincode,
      facilitySearchRadius,
      facilityOperationalType,
      facilityStatus,
      itemType,
    } = req.body;

    // --------------------------------------------------------
    // Validation
    // --------------------------------------------------------

    if (!customerPincode || !String(customerPincode).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Customer pincode is required.",
      });
    }

    if (
      facilitySearchRadius === undefined ||
      facilitySearchRadius === null ||
      facilitySearchRadius === ""
    ) {
      return res.status(400).json({
        successful: false,
        message: "Facility search radius is required.",
      });
    }

    const radius = Number(facilitySearchRadius);

    if (!Number.isFinite(radius) || radius <= 0) {
      return res.status(400).json({
        successful: false,
        message: "Facility search radius must be a positive number.",
      });
    }

    // Uniware currently limits the radius to 100 km.
    if (radius > 100) {
      return res.status(400).json({
        successful: false,
        message: "Facility search radius cannot exceed 100 km.",
      });
    }

    if (!facilityOperationalType || !String(facilityOperationalType).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Facility operational type is required.",
      });
    }

    const allowedOperationalTypes = [
      "WAREHOUSE",
      "STORE",
      "DARKSTORE",
      "RETAIL_STORE",
      "FULFILLMENT_CENTER",
    ];

    const operationalType = String(facilityOperationalType)
      .trim()
      .toUpperCase();

    // We don't hard-block undocumented values because
    // Uniware tenants may have additional operational types.
    // The value is still sent exactly as entered after trim/uppercase.

    if (!facilityStatus || !String(facilityStatus).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Facility status is required.",
      });
    }

    const status = String(facilityStatus).trim().toUpperCase();

    const allowedStatuses = ["ALL", "ENABLED", "DISABLED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        successful: false,
        message: "Facility status must be ALL, ENABLED, or DISABLED.",
      });
    }

    if (!itemType || typeof itemType !== "object") {
      return res.status(400).json({
        successful: false,
        message: "itemType is required.",
      });
    }

    if (!itemType.skuCode || !String(itemType.skuCode).trim()) {
      return res.status(400).json({
        successful: false,
        message: "SKU code is required.",
      });
    }

    if (
      itemType.quantity === undefined ||
      itemType.quantity === null ||
      itemType.quantity === ""
    ) {
      return res.status(400).json({
        successful: false,
        message: "Quantity is required.",
      });
    }

    const quantity = Number(itemType.quantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        successful: false,
        message: "Quantity must be a positive integer.",
      });
    }

    // --------------------------------------------------------
    // Uniware payload
    // --------------------------------------------------------

    const payload = {
      customerPincode: String(customerPincode).trim(),
      facilitySearchRadius: radius,
      facilityOperationalType: operationalType,
      facilityStatus: status,
      itemType: {
        skuCode: String(itemType.skuCode).trim(),
        quantity,
      },
    };

    // --------------------------------------------------------
    // Call Uniware
    // --------------------------------------------------------

    const response = await axios.post(
      `${UNIWARE_BASE_URL}/services/rest/v1/oms/nearbyInventory/get`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
        },
        timeout: 30000,
      }
    );

    return res.status(response.status).json(response.data);
  } catch (err) {
    console.error(
      "Uniware Nearby Inventory Error:",
      err.response?.data || err.message
    );

    return res.status(err.response?.status || 500).json(
      err.response?.data || {
        successful: false,
        message: err.message || "Failed to get nearby store inventory.",
      }
    );
  }
});

// ============================================================
// UNIWARE - CREATE CUSTOMER
// POST /api/uniware/customers/create
//
// Uniware:
// POST /services/rest/v1/oms/customer/create
//
// Level: Tenant
// No Facility header required.
// ============================================================

app.post("/api/uniware/customers/create", async (req, res) => {
  try {
    const { customer } = req.body;

    // --------------------------------------------------------
    // Basic validation
    // --------------------------------------------------------

    if (!customer || typeof customer !== "object") {
      return res.status(400).json({
        successful: false,
        message: "Customer object is required.",
      });
    }

    if (!customer.code || !String(customer.code).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Customer code is required.",
      });
    }

    const customerCode = String(customer.code).trim();

    if (customerCode.length > 45) {
      return res.status(400).json({
        successful: false,
        message: "Customer code cannot exceed 45 characters.",
      });
    }

    if (!/^[a-zA-Z0-9-_]+$/.test(customerCode)) {
      return res.status(400).json({
        successful: false,
        message:
          "Customer code can contain only letters, numbers, hyphen and underscore.",
      });
    }

    // --------------------------------------------------------
    // Helper
    // --------------------------------------------------------

    const cleanString = (value) => {
      if (value === undefined || value === null) {
        return undefined;
      }

      const valueString = String(value).trim();

      return valueString === "" ? undefined : valueString;
    };

    const cleanBoolean = (value) => {
      if (value === undefined || value === null || value === "") {
        return undefined;
      }

      return Boolean(value);
    };

    const cleanInteger = (value) => {
      if (value === undefined || value === null || value === "") {
        return undefined;
      }

      const number = Number(value);

      return Number.isInteger(number) ? number : undefined;
    };

    // --------------------------------------------------------
    // Build customer
    // --------------------------------------------------------

    const customerPayload = {
      code: customerCode,
    };

    const optionalCustomerFields = [
      ["name", 100],
      ["alternateCode", 45],
      ["pan", 45],
      ["tin", 45],
      ["cinNumber", 45],
      ["cstNumber", 45],
      ["stNumber", 45],
      ["gstNumber", 15],
      ["website", 256],
      ["uniwareAccessUrl", null],
      ["uniwareApiUser", null],
      ["uniwareApiPassword", null],
    ];

    for (const [field, maxLength] of optionalCustomerFields) {
      const value = cleanString(customer[field]);

      if (value !== undefined) {
        if (maxLength && value.length > maxLength) {
          return res.status(400).json({
            successful: false,
            message: `${field} cannot exceed ${maxLength} characters.`,
          });
        }

        customerPayload[field] = value;
      }
    }

    // --------------------------------------------------------
    // Boolean fields
    // --------------------------------------------------------

    for (const field of [
      "enabled",
      "taxExempted",
      "registeredDealer",
      "providesCform",
      "dualCompanyRetail",
    ]) {
      const value = cleanBoolean(customer[field]);

      if (value !== undefined) {
        customerPayload[field] = value;
      }
    }

    // --------------------------------------------------------
    // Integer fields
    // --------------------------------------------------------

    for (const field of [
      "binaryObjectId",
      "signatureBinaryObjectId",
    ]) {
      const value = cleanInteger(customer[field]);

      if (value !== undefined) {
        customerPayload[field] = value;
      }
    }

    // --------------------------------------------------------
    // Address builder
    // --------------------------------------------------------

    const buildAddress = (address, addressName) => {
      if (!address || typeof address !== "object") {
        return undefined;
      }

      const result = {};

      const requiredFields = [
        "addressLine1",
        "city",
        "stateCode",
        "partyCode",
        "addressType",
        "pincode",
        "phone",
      ];

      for (const field of requiredFields) {
        const value = cleanString(address[field]);

        if (!value) {
          throw new Error(
            `${addressName}.${field} is required.`
          );
        }

        result[field] = value;
      }

      // Max lengths from Uniware documentation
      if (result.addressLine1.length > 500) {
        throw new Error(
          `${addressName}.addressLine1 cannot exceed 500 characters.`
        );
      }

      if (result.city.length > 100) {
        throw new Error(
          `${addressName}.city cannot exceed 100 characters.`
        );
      }

      if (!/^\d{6,}$/.test(result.pincode)) {
        throw new Error(
          `${addressName}.pincode must contain at least 6 digits.`
        );
      }

      const optionalFields = [
        "addressLine2",
        "countryCode",
        "latitude",
        "longitude",
      ];

      for (const field of optionalFields) {
        const value = cleanString(address[field]);

        if (value !== undefined) {
          result[field] = value;
        }
      }

      if (result.addressLine2?.length > 500) {
        throw new Error(
          `${addressName}.addressLine2 cannot exceed 500 characters.`
        );
      }

      return result;
    };

    // --------------------------------------------------------
    // Billing Address
    // --------------------------------------------------------

    if (customer.billingAddress) {
      customerPayload.billingAddress = buildAddress(
        customer.billingAddress,
        "billingAddress"
      );
    }

    // --------------------------------------------------------
    // Shipping Address
    // --------------------------------------------------------

    if (customer.shippingAddress) {
      customerPayload.shippingAddress = buildAddress(
        customer.shippingAddress,
        "shippingAddress"
      );
    }

    // --------------------------------------------------------
    // Party Contacts
    // --------------------------------------------------------

    if (Array.isArray(customer.partyContacts)) {
      customerPayload.partyContacts =
        customer.partyContacts.map((contact, index) => {
          if (!contact || typeof contact !== "object") {
            throw new Error(
              `partyContacts[${index}] must be an object.`
            );
          }

          const contactType = cleanString(
            contact.contactType
          );

          const partyCode = cleanString(
            contact.partyCode
          );

          const name = cleanString(contact.name);
          const email = cleanString(contact.email);

          if (!contactType) {
            throw new Error(
              `partyContacts[${index}].contactType is required.`
            );
          }

          if (!partyCode) {
            throw new Error(
              `partyContacts[${index}].partyCode is required.`
            );
          }

          if (!name) {
            throw new Error(
              `partyContacts[${index}].name is required.`
            );
          }

          if (!email) {
            throw new Error(
              `partyContacts[${index}].email is required.`
            );
          }

          if (name.length > 45) {
            throw new Error(
              `partyContacts[${index}].name cannot exceed 45 characters.`
            );
          }

          if (email.length > 200) {
            throw new Error(
              `partyContacts[${index}].email cannot exceed 200 characters.`
            );
          }

          const result = {
            contactType,
            partyCode,
            name,
            email,
          };

          const phone = cleanString(contact.phone);
          const fax = cleanString(contact.fax);

          if (phone !== undefined) {
            result.phone = phone;
          }

          if (fax !== undefined) {
            result.fax = fax;
          }

          return result;
        });
    }

    // --------------------------------------------------------
    // Final Uniware payload
    // --------------------------------------------------------

    const payload = {
      customer: customerPayload,
    };

    // --------------------------------------------------------
    // Call Uniware
    // --------------------------------------------------------

    const response = await axios.post(
      `${UNIWARE_BASE_URL}/services/rest/v1/oms/customer/create`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
        },
        timeout: 30000,
      }
    );

    return res.status(response.status).json(response.data);
  } catch (err) {
    console.error(
      "Uniware Create Customer Error:",
      err.response?.data || err.message
    );

    return res.status(err.response?.status || 500).json(
      err.response?.data || {
        successful: false,
        message:
          err.message || "Failed to create Uniware customer.",
      }
    );
  }
});

/* =========================================================
   3. UPDATE CUSTOMER
   =========================================================
   Uniware:
   POST /services/rest/v1/oms/customer/edit

   Level: Tenant
   ========================================================= */

app.post("/api/uniware/customers/update", async (req, res) => {
  try {
    const body = req.body || {};

    if (!cleanString(body.code)) {
      return res.status(400).json({
        successful: false,
        message:
          "Customer code is required for update.",
      });
    }

    const code = cleanString(body.code);

    if (code.length > 45) {
      return res.status(400).json({
        successful: false,
        message: "Customer code cannot exceed 45 characters.",
      });
    }

    if (!/^[a-zA-Z0-9-_]+$/.test(code)) {
      return res.status(400).json({
        successful: false,
        message:
          "Customer code may contain only letters, numbers, hyphen, and underscore.",
      });
    }

    const payload = buildCustomerPayload(body);

    const data = await uniwareRequest(
      "/services/rest/v1/oms/customer/edit",
      payload
    );

    return res.status(200).json(data);
  } catch (error) {
    return res.status(
      error.response?.status || 500
    ).json(
      error.response?.data || {
        successful: false,
        message:
          error.message ||
          "Failed to update customer.",
      }
    );
  }
});
// ============================================================
// UNIWARE - CREATE SALE ORDER
// POST /api/uniware/sale-orders/create
// Uniware:
// POST /services/rest/v1/oms/saleOrder/create
// ============================================================

app.post("/api/uniware/sale-orders/create", async (req, res) => {
  try {
    const { facility, saleOrder } = req.body;

    if (!facility || !facility.trim()) {
      return res.status(400).json({
        successful: false,
        message: "Facility is required.",
        errors: [
          {
            fieldName: "facility",
            message: "Uniware Facility code is required."
          }
        ]
      });
    }

    if (!saleOrder || typeof saleOrder !== "object") {
      return res.status(400).json({
        successful: false,
        message: "saleOrder object is required.",
        errors: [
          {
            fieldName: "saleOrder",
            message: "saleOrder object is required."
          }
        ]
      });
    }

    if (
      saleOrder.code &&
      String(saleOrder.code).length > 45
    ) {
      return res.status(400).json({
        successful: false,
        message: "Sale order code cannot exceed 45 characters."
      });
    }

    if (
      saleOrder.displayOrderCode &&
      String(saleOrder.displayOrderCode).length > 45
    ) {
      return res.status(400).json({
        successful: false,
        message: "Display order code cannot exceed 45 characters."
      });
    }

    if (saleOrder.customerName &&
        String(saleOrder.customerName).length > 100) {
      return res.status(400).json({
        successful: false,
        message: "Customer name cannot exceed 100 characters."
      });
    }

    const response = await axios.post(
      `${UNIWARE_BASE_URL}/services/rest/v1/oms/saleOrder/create`,
      {
        saleOrder
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
          Facility: facility.trim()
        },
        timeout: 30000
      }
    );

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error(
      "Uniware Create Sale Order Error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json(
      error.response?.data || {
        successful: false,
        message: error.message || "Failed to create sale order."
      }
    );
  }
});

// ============================================================
// UNIWARE - GET SALE ORDER
// POST /api/uniware/sale-orders/get
//
// Uniware:
// POST /services/rest/v1/oms/saleorder/get
//
// Tenant-level
// No Facility header required
// ============================================================

app.post("/api/uniware/sale-orders/get", async (req, res) => {
  try {
    const {
      code,
      facilityCodes,
      paymentDetailRequired,
    } = req.body;

    // -----------------------------
    // Validation
    // -----------------------------
    if (!code || !String(code).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Sale order code is required.",
        errors: [
          {
            fieldName: "code",
            message: "Sale order code is required.",
          },
        ],
      });
    }

    // -----------------------------
    // Build Uniware payload
    // -----------------------------
    const payload = {
      code: String(code).trim(),
    };

    if (
      Array.isArray(facilityCodes) &&
      facilityCodes.length > 0
    ) {
      payload.facilityCodes = facilityCodes
        .filter(
          (item) =>
            item !== null &&
            item !== undefined &&
            String(item).trim() !== ""
        )
        .map((item) => String(item).trim());
    }

    // Preserve false if explicitly supplied
    if (typeof paymentDetailRequired === "boolean") {
      payload.paymentDetailRequired =
        paymentDetailRequired;
    }

    // -----------------------------
    // Call Uniware
    // -----------------------------
    const response = await axios.post(
      `${UNIWARE_BASE_URL}/services/rest/v1/oms/saleorder/get`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
        },
        timeout: 30000,
      }
    );

    return res.status(response.status).json(
      response.data
    );
  } catch (error) {
    console.error(
      "Uniware Get Sale Order Error:",
      error.response?.data || error.message
    );

    return res.status(
      error.response?.status || 500
    ).json(
      error.response?.data || {
        successful: false,
        message:
          error.message ||
          "Failed to fetch sale order.",
      }
    );
  }
});

// ==========================================
// UNIWARE - SET SALE ORDER PRIORITY
// ==========================================
app.post("/api/uniware/sale-orders/set-priority", async (req, res) => {
  try {
    const { facility, saleOrderCode, priority } = req.body;

    // Validate Facility
    if (!facility || !facility.trim()) {
      return res.status(400).json({
        successful: false,
        message: "Facility is required.",
      });
    }

    // Validate Sale Order Code
    if (!saleOrderCode || !saleOrderCode.trim()) {
      return res.status(400).json({
        successful: false,
        message: "Sale order code is required.",
      });
    }

    // Validate Priority
    if (
      priority === undefined ||
      priority === null ||
      priority === "" ||
      !Number.isInteger(Number(priority))
    ) {
      return res.status(400).json({
        successful: false,
        message: "Priority must be an integer.",
      });
    }

    const payload = {
      saleOrderCode: saleOrderCode.trim(),
      priority: Number(priority),
    };

    const response = await axios.post(
      `${UNIWARE_BASE_URL}/services/rest/v1/oms/saleOrder/setPriority`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
          Facility: facility.trim(),
        },
        timeout: 30000,
      }
    );

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error(
      "Uniware Set Sale Order Priority Error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json(
      error.response?.data || {
        successful: false,
        message: error.message || "Failed to set sale order priority.",
      }
    );
  }
});

// ==========================================
// UNIWARE - VERIFY SALE ORDER
// ==========================================
app.post("/api/uniware/sale-orders/verify", async (req, res) => {
  try {
    const { saleOrderCode } = req.body;

    // Validate Sale Order Code
    if (!saleOrderCode || !saleOrderCode.trim()) {
      return res.status(400).json({
        successful: false,
        message: "Sale order code is required.",
      });
    }

    const payload = {
      saleOrderCode: saleOrderCode.trim(),
    };

    const response = await axios.post(
      `${UNIWARE_BASE_URL}/services/rest/v1/oms/saleOrder/verify`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
        },
        timeout: 30000,
      }
    );

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error(
      "Uniware Verify Sale Order Error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json(
      error.response?.data || {
        successful: false,
        message: error.message || "Failed to verify sale order.",
      }
    );
  }
});

// ==========================================
// UNIWARE - SEARCH SALE ORDERS
// ==========================================
app.post("/api/uniware/sale-orders/search", async (req, res) => {
  try {
    const {
      displayOrderCode,
      status,
      channel,
      customerEmailOrMobile,
      customerName,
      cashOnDelivery,
      fromDate,
      toDate,
      dateType,
      facilityCodes,
      returnStatuses,
      searchOptions,
      updatedSinceInMinutes,
      onHold,
    } = req.body;

    const payload = {};

    // ------------------------------------------
    // Basic filters
    // ------------------------------------------
    if (
      typeof displayOrderCode === "string" &&
      displayOrderCode.trim()
    ) {
      payload.displayOrderCode = displayOrderCode.trim();
    }

    if (typeof status === "string" && status.trim()) {
      payload.status = status.trim();
    }

    if (typeof channel === "string" && channel.trim()) {
      payload.channel = channel.trim();
    }

    if (
      typeof customerEmailOrMobile === "string" &&
      customerEmailOrMobile.trim()
    ) {
      payload.customerEmailOrMobile =
        customerEmailOrMobile.trim();
    }

    if (
      typeof customerName === "string" &&
      customerName.trim()
    ) {
      payload.customerName = customerName.trim();
    }

    // Preserve false because false is meaningful.
    if (typeof cashOnDelivery === "boolean") {
      payload.cashOnDelivery = cashOnDelivery;
    }

    if (typeof onHold === "boolean") {
      payload.onHold = onHold;
    }

    // ------------------------------------------
    // Date filters
    // ------------------------------------------
    if (typeof fromDate === "string" && fromDate.trim()) {
      payload.fromDate = fromDate.trim();
    }

    if (typeof toDate === "string" && toDate.trim()) {
      payload.toDate = toDate.trim();
    }

    if (typeof dateType === "string" && dateType.trim()) {
      const allowedDateTypes = [
        "CREATED",
        "UPDATED",
        "FULFILLMENT_TAT",
      ];

      const normalizedDateType = dateType.trim().toUpperCase();

      if (!allowedDateTypes.includes(normalizedDateType)) {
        return res.status(400).json({
          successful: false,
          message:
            "Invalid dateType. Allowed values: CREATED, UPDATED, FULFILLMENT_TAT.",
        });
      }

      payload.dateType = normalizedDateType;
    }

    // ------------------------------------------
    // Facility codes
    // ------------------------------------------
    if (Array.isArray(facilityCodes)) {
      const cleanedFacilities = facilityCodes
        .map((item) => String(item).trim())
        .filter(Boolean);

      if (cleanedFacilities.length > 0) {
        payload.facilityCodes = cleanedFacilities;
      }
    }

    // ------------------------------------------
    // Return statuses
    // ------------------------------------------
    if (Array.isArray(returnStatuses)) {
      const cleanedReturnStatuses = returnStatuses
        .map((item) => String(item).trim())
        .filter(Boolean);

      if (cleanedReturnStatuses.length > 0) {
        payload.returnStatuses = cleanedReturnStatuses;
      }
    }

    // ------------------------------------------
    // Updated since minutes
    // ------------------------------------------
    if (
      updatedSinceInMinutes !== undefined &&
      updatedSinceInMinutes !== null &&
      updatedSinceInMinutes !== ""
    ) {
      const minutes = Number(updatedSinceInMinutes);

      if (!Number.isInteger(minutes) || minutes < 0) {
        return res.status(400).json({
          successful: false,
          message:
            "updatedSinceInMinutes must be a non-negative integer.",
        });
      }

      payload.updatedSinceInMinutes = minutes;
    }

    // ------------------------------------------
    // Search options
    // ------------------------------------------
    if (
      searchOptions &&
      typeof searchOptions === "object" &&
      !Array.isArray(searchOptions)
    ) {
      const options = {};

      if (
        typeof searchOptions.searchKey === "string" &&
        searchOptions.searchKey.trim()
      ) {
        options.searchKey = searchOptions.searchKey.trim();
      }

      const integerFields = [
        "displayLength",
        "displayStart",
        "columns",
        "sortingCols",
        "sortColumnIndex",
      ];

      for (const field of integerFields) {
        if (
          searchOptions[field] !== undefined &&
          searchOptions[field] !== null &&
          searchOptions[field] !== ""
        ) {
          const value = Number(searchOptions[field]);

          if (!Number.isInteger(value) || value < 0) {
            return res.status(400).json({
              successful: false,
              message: `${field} must be a non-negative integer.`,
            });
          }

          options[field] = value;
        }
      }

      if (
        typeof searchOptions.sortDirection === "string" &&
        searchOptions.sortDirection.trim()
      ) {
        options.sortDirection =
          searchOptions.sortDirection.trim();
      }

      if (
        typeof searchOptions.columnNames === "string" &&
        searchOptions.columnNames.trim()
      ) {
        options.columnNames =
          searchOptions.columnNames.trim();
      }

      if (typeof searchOptions.getCount === "boolean") {
        options.getCount = searchOptions.getCount;
      }

      if (Object.keys(options).length > 0) {
        payload.searchOptions = options;
      }
    }

    // ------------------------------------------
    // Uniware API call
    // ------------------------------------------
    const response = await axios.post(
      `${UNIWARE_BASE_URL}/services/rest/v1/oms/saleOrder/search`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
        },
        timeout: 30000,
      }
    );

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error(
      "Uniware Search Sale Orders Error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json(
      error.response?.data || {
        successful: false,
        message:
          error.message || "Failed to search sale orders.",
      }
    );
  }
});

// ==========================================
// UNIWARE - UPDATE SALE ORDER ADDRESS
// ==========================================
app.post("/api/uniware/sale-orders/update", async (req, res) => {
  try {
    const { saleOrderAddress } = req.body;

    // ------------------------------------------
    // Validate root object
    // ------------------------------------------
    if (
      !saleOrderAddress ||
      typeof saleOrderAddress !== "object" ||
      Array.isArray(saleOrderAddress)
    ) {
      return res.status(400).json({
        successful: false,
        message: "saleOrderAddress is required.",
      });
    }

    // ------------------------------------------
    // Validate sale order code
    // ------------------------------------------
    if (
      !saleOrderAddress.saleOrderCode ||
      !String(saleOrderAddress.saleOrderCode).trim()
    ) {
      return res.status(400).json({
        successful: false,
        message: "Sale order code is required.",
      });
    }

    // ------------------------------------------
    // Validate addresses
    // ------------------------------------------
    if (!Array.isArray(saleOrderAddress.addresses)) {
      return res.status(400).json({
        successful: false,
        message: "addresses must be an array.",
      });
    }

    if (saleOrderAddress.addresses.length === 0) {
      return res.status(400).json({
        successful: false,
        message: "At least one address is required.",
      });
    }

    // ------------------------------------------
    // Validate each address
    // ------------------------------------------
    const cleanedAddresses =
      saleOrderAddress.addresses.map((address, index) => {
        if (!address || typeof address !== "object") {
          throw new Error(
            `Address at index ${index} must be an object.`
          );
        }

        const requiredFields = [
          "id",
          "name",
          "addressLine1",
          "city",
          "state",
          "phone",
        ];

        for (const field of requiredFields) {
          if (
            address[field] === undefined ||
            address[field] === null ||
            String(address[field]).trim() === ""
          ) {
            throw new Error(
              `${field} is required for address ${index + 1}.`
            );
          }
        }

        if (String(address.name).length > 100) {
          throw new Error(
            `Address ${index + 1}: name cannot exceed 100 characters.`
          );
        }

        if (String(address.addressLine1).length > 500) {
          throw new Error(
            `Address ${index + 1}: addressLine1 cannot exceed 500 characters.`
          );
        }

        if (String(address.city).length > 100) {
          throw new Error(
            `Address ${index + 1}: city cannot exceed 100 characters.`
          );
        }

        if (String(address.state).length > 45) {
          throw new Error(
            `Address ${index + 1}: state cannot exceed 45 characters.`
          );
        }

        if (
          address.pincode !== undefined &&
          address.pincode !== null &&
          String(address.pincode).trim()
        ) {
          const pincode = String(address.pincode).trim();

          if (pincode.length < 6) {
            throw new Error(
              `Address ${index + 1}: pincode must contain at least 6 digits.`
            );
          }
        }

        const cleaned = {
          id: String(address.id).trim(),
          name: String(address.name).trim(),
          addressLine1: String(address.addressLine1).trim(),
          city: String(address.city).trim(),
          state: String(address.state).trim(),
          phone: String(address.phone).trim(),
        };

        // Optional fields
        if (
          address.addressLine2 !== undefined &&
          address.addressLine2 !== null &&
          String(address.addressLine2).trim()
        ) {
          cleaned.addressLine2 =
            String(address.addressLine2).trim();
        }

        if (
          address.country !== undefined &&
          address.country !== null &&
          String(address.country).trim()
        ) {
          cleaned.country =
            String(address.country).trim();
        }

        if (
          address.pincode !== undefined &&
          address.pincode !== null &&
          String(address.pincode).trim()
        ) {
          cleaned.pincode =
            String(address.pincode).trim();
        }

        if (
          address.email !== undefined &&
          address.email !== null &&
          String(address.email).trim()
        ) {
          cleaned.email =
            String(address.email).trim();
        }

        return cleaned;
      });

    // ------------------------------------------
    // Build Uniware payload
    // ------------------------------------------
    const payload = {
      saleOrderAddress: {
        saleOrderCode:
          String(saleOrderAddress.saleOrderCode).trim(),

        addresses: cleanedAddresses,
      },
    };

    // ------------------------------------------
    // Billing address
    // ------------------------------------------
    if (
      saleOrderAddress.billingAddress &&
      typeof saleOrderAddress.billingAddress === "object" &&
      saleOrderAddress.billingAddress.referenceId
    ) {
      payload.saleOrderAddress.billingAddress = {
        referenceId: String(
          saleOrderAddress.billingAddress.referenceId
        ).trim(),
      };
    }

    // ------------------------------------------
    // Shipping address
    // ------------------------------------------
    if (
      saleOrderAddress.shippingAddress &&
      typeof saleOrderAddress.shippingAddress === "object" &&
      saleOrderAddress.shippingAddress.referenceId
    ) {
      payload.saleOrderAddress.shippingAddress = {
        referenceId: String(
          saleOrderAddress.shippingAddress.referenceId
        ).trim(),
      };
    }

    // ------------------------------------------
    // Item-level shipping addresses
    // ------------------------------------------
    if (
      Array.isArray(
        saleOrderAddress.saleOrderAddressItems
      ) &&
      saleOrderAddress.saleOrderAddressItems.length > 0
    ) {
      payload.saleOrderAddress.saleOrderAddressItems =
        saleOrderAddress.saleOrderAddressItems.map(
          (item, index) => {
            if (
              !item ||
              !item.saleOrderItemCode ||
              !item.shippingAddress ||
              !item.shippingAddress.referenceId
            ) {
              throw new Error(
                `Invalid saleOrderAddressItems entry at index ${index}.`
              );
            }

            return {
              saleOrderItemCode: String(
                item.saleOrderItemCode
              ).trim(),

              shippingAddress: {
                referenceId: String(
                  item.shippingAddress.referenceId
                ).trim(),
              },
            };
          }
        );
    }

    // ------------------------------------------
    // Call Uniware
    // ------------------------------------------
    const response = await axios.post(
      `${UNIWARE_BASE_URL}/services/rest/v1/oms/saleOrder/edit`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
        },
        timeout: 30000,
      }
    );

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error(
      "Uniware Update Sale Order Error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json(
      error.response?.data || {
        successful: false,
        message:
          error.message || "Failed to update sale order.",
      }
    );
  }
});

// ============================================================
// UNIWARE - UPDATE SALE ORDER METADATA
// POST /api/uniware/sale-orders/update-metadata
// ============================================================

app.post("/api/uniware/sale-orders/update-metadata", async (req, res) => {
  try {
    const {
      saleOrderCode,
      priority,
      customFieldValues,
    } = req.body || {};

    // -----------------------------
    // Validation
    // -----------------------------
    if (!saleOrderCode || !String(saleOrderCode).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Sale order code is required.",
        errors: [
          {
            fieldName: "saleOrderCode",
            message: "Sale order code is required.",
          },
        ],
        warnings: [],
      });
    }

    // Priority is optional, but if supplied it must be an integer.
    if (
      priority !== undefined &&
      priority !== null &&
      priority !== "" &&
      !Number.isInteger(Number(priority))
    ) {
      return res.status(400).json({
        successful: false,
        message: "Priority must be an integer.",
        errors: [
          {
            fieldName: "priority",
            message: "Priority must be an integer.",
          },
        ],
        warnings: [],
      });
    }

    // Validate custom fields if supplied
    if (customFieldValues !== undefined && customFieldValues !== null) {
      if (!Array.isArray(customFieldValues)) {
        return res.status(400).json({
          successful: false,
          message: "customFieldValues must be an array.",
          errors: [
            {
              fieldName: "customFieldValues",
              message: "customFieldValues must be an array.",
            },
          ],
          warnings: [],
        });
      }

      for (let i = 0; i < customFieldValues.length; i++) {
        const field = customFieldValues[i];

        if (!field || !String(field.name || "").trim()) {
          return res.status(400).json({
            successful: false,
            message: `Custom field name is required at index ${i}.`,
            errors: [
              {
                fieldName: `customFieldValues[${i}].name`,
                message: "Custom field name is required.",
              },
            ],
            warnings: [],
          });
        }
      }
    }

    // -----------------------------
    // Build Uniware payload
    // -----------------------------
    const payload = {
      saleOrderCode: String(saleOrderCode).trim(),
    };

    // Preserve priority = 0
    if (priority !== undefined && priority !== null && priority !== "") {
      payload.priority = Number(priority);
    }

    // Custom fields are optional
    if (Array.isArray(customFieldValues)) {
      payload.customFieldValues = customFieldValues
        .filter((field) => field && String(field.name || "").trim())
        .map((field) => {
          const customField = {
            name: String(field.name).trim(),
          };

          // Value is optional
          if (
            field.value !== undefined &&
            field.value !== null &&
            field.value !== ""
          ) {
            customField.value = String(field.value);
          }

          return customField;
        });
    }

    // -----------------------------
    // Call Uniware
    // Tenant-level API
    // NO Facility header
    // -----------------------------
    const response = await axios.post(
      `${UNIWARE_BASE_URL}/services/rest/v1/oms/saleOrder/editSaleOrderMetadata`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
        },
      }
    );

    return res.status(response.status || 200).json(response.data);
  } catch (error) {
    console.error(
      "Uniware Update Sale Order Metadata Error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json(
      error.response?.data || {
        successful: false,
        message: error.message || "Failed to update sale order metadata.",
        errors: [],
        warnings: [],
      }
    );
  }
});

// ============================================================
// UNIWARE - UPDATE SALE ORDER ITEM METADATA
// POST /api/uniware/sale-orders/update-item-metadata
// ============================================================

app.post(
  "/api/uniware/sale-orders/update-item-metadata",
  async (req, res) => {
    try {
      const {
        saleOrderCode,
        saleOrderItemCode,
        customFieldValues,
      } = req.body || {};

      // --------------------------------------------------------
      // Validate Sale Order Code
      // --------------------------------------------------------
      if (!saleOrderCode || !String(saleOrderCode).trim()) {
        return res.status(400).json({
          successful: false,
          message: "Sale order code is required.",
          errors: [
            {
              fieldName: "saleOrderCode",
              message: "Sale order code is required.",
            },
          ],
          warnings: [],
        });
      }

      // --------------------------------------------------------
      // Validate Sale Order Item Code
      // --------------------------------------------------------
      if (
        !saleOrderItemCode ||
        !String(saleOrderItemCode).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message: "Sale order item code is required.",
          errors: [
            {
              fieldName: "saleOrderItemCode",
              message: "Sale order item code is required.",
            },
          ],
          warnings: [],
        });
      }

      // --------------------------------------------------------
      // Validate Custom Fields
      // --------------------------------------------------------
      if (
        customFieldValues !== undefined &&
        customFieldValues !== null
      ) {
        if (!Array.isArray(customFieldValues)) {
          return res.status(400).json({
            successful: false,
            message: "customFieldValues must be an array.",
            errors: [
              {
                fieldName: "customFieldValues",
                message: "customFieldValues must be an array.",
              },
            ],
            warnings: [],
          });
        }

        for (let i = 0; i < customFieldValues.length; i++) {
          const field = customFieldValues[i];

          if (!field || !String(field.name || "").trim()) {
            return res.status(400).json({
              successful: false,
              message: `Custom field name is required at index ${i}.`,
              errors: [
                {
                  fieldName: `customFieldValues[${i}].name`,
                  message: "Custom field name is required.",
                },
              ],
              warnings: [],
            });
          }
        }
      }

      // --------------------------------------------------------
      // Build Uniware Payload
      // --------------------------------------------------------
      const payload = {
        saleOrderCode: String(saleOrderCode).trim(),
        saleOrderItemCode: String(saleOrderItemCode).trim(),
      };

      // Only send custom fields when supplied.
      if (Array.isArray(customFieldValues)) {
        payload.customFieldValues = customFieldValues
          .filter(
            (field) =>
              field &&
              String(field.name || "").trim()
          )
          .map((field) => {
            const customField = {
              name: String(field.name).trim(),
            };

            // Value is optional according to Uniware.
            if (
              field.value !== undefined &&
              field.value !== null &&
              field.value !== ""
            ) {
              customField.value = String(field.value);
            }

            return customField;
          });
      }

      // --------------------------------------------------------
      // Call Uniware
      // Tenant-level API
      // NO Facility header
      // --------------------------------------------------------
      const response = await axios.post(
        `${UNIWARE_BASE_URL}/services/rest/v1/oms/saleOrder/editSaleOrderItemMetadata`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
          },
        }
      );

      return res
        .status(response.status || 200)
        .json(response.data);
    } catch (error) {
      console.error(
        "Uniware Update Sale Order Item Metadata Error:",
        error.response?.data || error.message
      );

      return res
        .status(error.response?.status || 500)
        .json(
          error.response?.data || {
            successful: false,
            message:
              error.message ||
              "Failed to update sale order item metadata.",
            errors: [],
            warnings: [],
          }
        );
    }
  }
);
// ============================================================
// UNIWARE - HOLD SALE ORDER
// POST /api/uniware/sale-orders/hold
// ============================================================

app.post("/api/uniware/sale-orders/hold", async (req, res) => {
  try {
    const { saleOrderCode } = req.body || {};

    // --------------------------------------------------------
    // Validation
    // --------------------------------------------------------
    if (!saleOrderCode || !String(saleOrderCode).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Sale order code is required.",
        errors: [
          {
            fieldName: "saleOrderCode",
            message: "Sale order code is required.",
          },
        ],
        warnings: [],
      });
    }

    // --------------------------------------------------------
    // Build payload
    // --------------------------------------------------------
    const payload = {
      saleOrderCode: String(saleOrderCode).trim(),
    };

    // --------------------------------------------------------
    // Call Uniware
    // Tenant-level API
    // NO Facility header
    // --------------------------------------------------------
    const response = await axios.post(
      `${UNIWARE_BASE_URL}/services/rest/v1/oms/saleOrder/hold`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
        },
      }
    );

    return res
      .status(response.status || 200)
      .json(response.data);
  } catch (error) {
    console.error(
      "Uniware Hold Sale Order Error:",
      error.response?.data || error.message
    );

    return res
      .status(error.response?.status || 500)
      .json(
        error.response?.data || {
          successful: false,
          message:
            error.message ||
            "Failed to hold sale order.",
          errors: [],
          warnings: [],
        }
      );
  }
});
// ============================================================
// UNIWARE - UNHOLD SALE ORDER
// POST /api/uniware/sale-orders/unhold
// ============================================================

app.post("/api/uniware/sale-orders/unhold", async (req, res) => {
  try {
    const { saleOrderCode } = req.body || {};

    // --------------------------------------------------------
    // Validation
    // --------------------------------------------------------
    if (!saleOrderCode || !String(saleOrderCode).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Sale order code is required.",
        errors: [
          {
            fieldName: "saleOrderCode",
            message: "Sale order code is required.",
          },
        ],
        warnings: [],
      });
    }

    // --------------------------------------------------------
    // Uniware request payload
    // --------------------------------------------------------
    const payload = {
      saleOrderCode: String(saleOrderCode).trim(),
    };

    // --------------------------------------------------------
    // Call Uniware
    // Tenant-level API
    // NO Facility header
    // --------------------------------------------------------
    const response = await axios.post(
      `${UNIWARE_BASE_URL}/services/rest/v1/oms/saleOrder/unhold`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
        },
      }
    );

    return res
      .status(response.status || 200)
      .json(response.data);
  } catch (error) {
    console.error(
      "Uniware Unhold Sale Order Error:",
      error.response?.data || error.message
    );

    return res
      .status(error.response?.status || 500)
      .json(
        error.response?.data || {
          successful: false,
          message:
            error.message ||
            "Failed to unhold sale order.",
          errors: [],
          warnings: [],
        }
      );
  }
});
// Hold Sale Order Items
app.post("/api/uniware/sale-orders/hold-items", async (req, res) => {
  try {
    const { saleOrderCode, saleOrderItemCodes } = req.body || {};

    // Validate saleOrderCode
    if (!saleOrderCode || !String(saleOrderCode).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Sale order code is required.",
        errors: [
          {
            fieldName: "saleOrderCode",
            message: "Sale order code is required.",
          },
        ],
        warnings: [],
      });
    }

    // Validate saleOrderItemCodes
    if (
      !Array.isArray(saleOrderItemCodes) ||
      saleOrderItemCodes.length === 0
    ) {
      return res.status(400).json({
        successful: false,
        message: "At least one sale order item code is required.",
        errors: [
          {
            fieldName: "saleOrderItemCodes",
            message: "At least one sale order item code is required.",
          },
        ],
        warnings: [],
      });
    }

    const cleanedItemCodes = saleOrderItemCodes
      .map((code) => String(code || "").trim())
      .filter(Boolean);

    if (cleanedItemCodes.length === 0) {
      return res.status(400).json({
        successful: false,
        message: "At least one valid sale order item code is required.",
        errors: [
          {
            fieldName: "saleOrderItemCodes",
            message: "At least one valid sale order item code is required.",
          },
        ],
        warnings: [],
      });
    }

    const payload = {
      saleOrderCode: String(saleOrderCode).trim(),
      saleOrderItemCodes: cleanedItemCodes,
    };

    const response = await axios.post(
      `${UNIWARE_BASE_URL}/services/rest/v1/oms/saleOrder/holdSaleOrderItems`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
        },
      }
    );

    return res.status(response.status || 200).json(response.data);
  } catch (error) {
    console.error(
      "Uniware Hold Sale Order Items Error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json(
      error.response?.data || {
        successful: false,
        message: error.message || "Failed to hold sale order items.",
        errors: [],
        warnings: [],
      }
    );
  }
});
// Unhold Sale Order Items
app.post("/api/uniware/sale-orders/unhold-items", async (req, res) => {
  try {
    const { saleOrderCode, saleOrderItemCodes } = req.body || {};

    // Validate sale order code
    if (!saleOrderCode || !String(saleOrderCode).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Sale order code is required.",
        errors: [
          {
            fieldName: "saleOrderCode",
            message: "Sale order code is required.",
          },
        ],
        warnings: [],
      });
    }

    // Validate item codes
    if (
      !Array.isArray(saleOrderItemCodes) ||
      saleOrderItemCodes.length === 0
    ) {
      return res.status(400).json({
        successful: false,
        message: "At least one sale order item code is required.",
        errors: [
          {
            fieldName: "saleOrderItemCodes",
            message: "At least one sale order item code is required.",
          },
        ],
        warnings: [],
      });
    }

    const cleanedItemCodes = saleOrderItemCodes
      .map((code) => String(code || "").trim())
      .filter(Boolean);

    if (cleanedItemCodes.length === 0) {
      return res.status(400).json({
        successful: false,
        message: "At least one valid sale order item code is required.",
        errors: [
          {
            fieldName: "saleOrderItemCodes",
            message: "At least one valid sale order item code is required.",
          },
        ],
        warnings: [],
      });
    }

    const payload = {
      saleOrderCode: String(saleOrderCode).trim(),
      saleOrderItemCodes: cleanedItemCodes,
    };

    const response = await axios.post(
      `${UNIWARE_BASE_URL}/services/rest/v1/oms/saleOrder/unholdSaleOrderItems`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
        },
      }
    );

    return res.status(response.status || 200).json(response.data);
  } catch (error) {
    console.error(
      "Uniware Unhold Sale Order Items Error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json(
      error.response?.data || {
        successful: false,
        message:
          error.message || "Failed to unhold sale order items.",
        errors: [],
        warnings: [],
      }
    );
  }
});
// Cancel Sale Order
app.post("/api/uniware/sale-orders/cancel", async (req, res) => {
  try {
    const {
      saleOrderCode,
      saleOrderItemCodes,
      cancelPartially,
      cancelOnChannel,
      cancelledBySeller,
      cancellationReason,
    } = req.body || {};

    // Validate sale order code
    if (!saleOrderCode || !String(saleOrderCode).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Sale order code is required.",
        errors: [
          {
            fieldName: "saleOrderCode",
            message: "Sale order code is required.",
          },
        ],
        warnings: [],
      });
    }

    // Validate item codes when supplied
    let cleanedItemCodes;

    if (saleOrderItemCodes !== undefined) {
      if (!Array.isArray(saleOrderItemCodes)) {
        return res.status(400).json({
          successful: false,
          message: "Sale order item codes must be an array.",
          errors: [
            {
              fieldName: "saleOrderItemCodes",
              message: "Sale order item codes must be an array.",
            },
          ],
          warnings: [],
        });
      }

      cleanedItemCodes = saleOrderItemCodes
        .map((code) => String(code || "").trim())
        .filter(Boolean);

      if (cleanedItemCodes.length === 0) {
        return res.status(400).json({
          successful: false,
          message:
            "At least one valid sale order item code is required when item codes are supplied.",
          errors: [
            {
              fieldName: "saleOrderItemCodes",
              message:
                "At least one valid sale order item code is required.",
            },
          ],
          warnings: [],
        });
      }
    }

    // Validate cancellation reason length
    if (
      cancellationReason !== undefined &&
      cancellationReason !== null &&
      String(cancellationReason).length > 100
    ) {
      return res.status(400).json({
        successful: false,
        message: "Cancellation reason cannot exceed 100 characters.",
        errors: [
          {
            fieldName: "cancellationReason",
            message:
              "Cancellation reason cannot exceed 100 characters.",
          },
        ],
        warnings: [],
      });
    }

    // cancelOnChannel and cancelledBySeller are mutually exclusive
    if (
      cancelOnChannel === true &&
      cancelledBySeller === true
    ) {
      return res.status(400).json({
        successful: false,
        message:
          "Select either cancelOnChannel or cancelledBySeller, not both.",
        errors: [
          {
            fieldName: "cancelOnChannel",
            message:
              "cancelOnChannel and cancelledBySeller cannot both be true.",
          },
        ],
        warnings: [],
      });
    }

    const payload = {
      saleOrderCode: String(saleOrderCode).trim(),
    };

    // Optional item codes
    if (cleanedItemCodes !== undefined) {
      payload.saleOrderItemCodes = cleanedItemCodes;
    }

    // Preserve explicit boolean false
    if (typeof cancelPartially === "boolean") {
      payload.cancelPartially = cancelPartially;
    }

    if (typeof cancelOnChannel === "boolean") {
      payload.cancelOnChannel = cancelOnChannel;
    }

    if (typeof cancelledBySeller === "boolean") {
      payload.cancelledBySeller = cancelledBySeller;
    }

    // Optional cancellation reason
    if (
      cancellationReason !== undefined &&
      cancellationReason !== null &&
      String(cancellationReason).trim()
    ) {
      payload.cancellationReason =
        String(cancellationReason).trim();
    }

    const response = await axios.post(
      `${UNIWARE_BASE_URL}/services/rest/v1/oms/saleOrder/cancel`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
        },
      }
    );

    return res.status(response.status || 200).json(response.data);
  } catch (error) {
    console.error(
      "Uniware Cancel Sale Order Error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json(
      error.response?.data || {
        successful: false,
        message:
          error.message || "Failed to cancel sale order.",
        errors: [],
        warnings: [],
      }
    );
  }
});
// Switch Facility Sale Order Items
app.post(
  "/api/uniware/sale-orders/switch-facility",
  async (req, res) => {
    try {
      const {
        facility,
        facilityCode,
        saleOrderCode,
        saleOrderItemCodes,
      } = req.body || {};

      // Validate Facility header value
      if (!facility || !String(facility).trim()) {
        return res.status(400).json({
          successful: false,
          message:
            "Facility header value is required.",
          errors: [
            {
              fieldName: "facility",
              message:
                "Facility header value is required.",
            },
          ],
          warnings: [],
        });
      }

      // Validate destination facility
      if (
        !facilityCode ||
        !String(facilityCode).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "Destination facility code is required.",
          errors: [
            {
              fieldName: "facilityCode",
              message:
                "Destination facility code is required.",
            },
          ],
          warnings: [],
        });
      }

      // Validate sale order
      if (
        !saleOrderCode ||
        !String(saleOrderCode).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "Sale order code is required.",
          errors: [
            {
              fieldName: "saleOrderCode",
              message:
                "Sale order code is required.",
            },
          ],
          warnings: [],
        });
      }

      // Validate item codes
      if (
        !Array.isArray(saleOrderItemCodes) ||
        saleOrderItemCodes.length === 0
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "At least one sale order item code is required.",
          errors: [
            {
              fieldName:
                "saleOrderItemCodes",
              message:
                "At least one sale order item code is required.",
            },
          ],
          warnings: [],
        });
      }

      const cleanedItemCodes =
        saleOrderItemCodes
          .map((code) =>
            String(code || "").trim()
          )
          .filter(Boolean);

      if (cleanedItemCodes.length === 0) {
        return res.status(400).json({
          successful: false,
          message:
            "At least one valid sale order item code is required.",
          errors: [
            {
              fieldName:
                "saleOrderItemCodes",
              message:
                "At least one valid sale order item code is required.",
            },
          ],
          warnings: [],
        });
      }

      const payload = {
        facilityCode: String(
          facilityCode
        ).trim(),

        saleOrderCode: String(
          saleOrderCode
        ).trim(),

        saleOrderItemCodes:
          cleanedItemCodes,
      };

      const response = await axios.post(
        `${UNIWARE_BASE_URL}/services/rest/v1/oms/saleorder/facility/switch`,
        payload,
        {
          headers: {
            "Content-Type":
              "application/json",

            Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,

            Facility: String(
              facility
            ).trim(),
          },
        }
      );

      return res
        .status(response.status || 200)
        .json(response.data);
    } catch (error) {
      console.error(
        "Uniware Switch Facility Sale Order Items Error:",
        error.response?.data ||
          error.message
      );

      return res
        .status(
          error.response?.status || 500
        )
        .json(
          error.response?.data || {
            successful: false,
            message:
              error.message ||
              "Failed to switch sale order item facility.",
            errors: [],
            warnings: [],
          }
        );
    }
  }
);
// Add Item Details for Single Sale Order Item
app.post(
  "/api/uniware/sale-orders/item-details/add",
  async (req, res) => {
    try {
      const {
        saleOrderCode,
        saleOrderItemCode,
        itemDetails,
      } = req.body || {};

      // Validate sale order code
      if (
        !saleOrderCode ||
        !String(saleOrderCode).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message: "Sale order code is required.",
          errors: [
            {
              fieldName: "saleOrderCode",
              message:
                "Sale order code is required.",
            },
          ],
          warnings: [],
        });
      }

      // Validate sale order item code
      if (
        !saleOrderItemCode ||
        !String(saleOrderItemCode).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "Sale order item code is required.",
          errors: [
            {
              fieldName: "saleOrderItemCode",
              message:
                "Sale order item code is required.",
            },
          ],
          warnings: [],
        });
      }

      // Validate itemDetails
      if (
        !Array.isArray(itemDetails) ||
        itemDetails.length === 0
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "At least one item detail is required.",
          errors: [
            {
              fieldName: "itemDetails",
              message:
                "At least one item detail is required.",
            },
          ],
          warnings: [],
        });
      }

      // Validate and clean item details
      const cleanedItemDetails =
        itemDetails.map(
          (detail, index) => {
            if (
              !detail ||
              typeof detail !== "object"
            ) {
              throw new Error(
                `Item detail ${index + 1} must be an object.`
              );
            }

            const name = String(
              detail.name || ""
            ).trim();

            const value =
              detail.value === undefined ||
              detail.value === null
                ? ""
                : String(
                    detail.value
                  ).trim();

            if (!name) {
              throw new Error(
                `Item detail ${
                  index + 1
                } name is required.`
              );
            }

            if (!value) {
              throw new Error(
                `Item detail ${
                  index + 1
                } value is required.`
              );
            }

            return {
              name,
              value,
            };
          }
        );

      const payload = {
        saleOrderCode:
          String(
            saleOrderCode
          ).trim(),

        saleOrderItemCode:
          String(
            saleOrderItemCode
          ).trim(),

        itemDetails:
          cleanedItemDetails,
      };

      const response = await axios.post(
        `${UNIWARE_BASE_URL}/services/rest/v1/oms/inflow/saleOrderItem/detail/add`,
        payload,
        {
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
          },
        }
      );

      return res
        .status(response.status || 200)
        .json(response.data);
    } catch (error) {
      console.error(
        "Uniware Add Sale Order Item Details Error:",
        error.response?.data ||
          error.message
      );

      return res
        .status(
          error.response?.status || 500
        )
        .json(
          error.response?.data || {
            successful: false,
            message:
              error.message ||
              "Failed to add sale order item details.",
            errors: [],
            warnings: [],
          }
        );
    }
  }
);
// Add Item Details for Multiple Sale Order Items
app.post(
  "/api/uniware/sale-orders/item-details/add-bulk",
  async (req, res) => {
    try {
      const {
        saleOrderCode,
        saleOrderItemDetailDTOS,
      } = req.body || {};

      // Validate sale order code
      if (
        !saleOrderCode ||
        !String(saleOrderCode).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message: "Sale order code is required.",
          errors: [
            {
              fieldName: "saleOrderCode",
              message:
                "Sale order code is required.",
            },
          ],
          warnings: [],
        });
      }

      // Validate list
      if (
        !Array.isArray(
          saleOrderItemDetailDTOS
        ) ||
        saleOrderItemDetailDTOS.length === 0
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "At least one sale order item detail is required.",
          errors: [
            {
              fieldName:
                "saleOrderItemDetailDTOS",
              message:
                "At least one sale order item detail is required.",
            },
          ],
          warnings: [],
        });
      }

      // Validate and clean each SOI
      const cleanedItems =
        saleOrderItemDetailDTOS.map(
          (item, index) => {
            if (
              !item ||
              typeof item !== "object"
            ) {
              throw new Error(
                `Sale order item detail ${
                  index + 1
                } must be an object.`
              );
            }

            const saleOrderItemCode =
              String(
                item.saleOrderItemCode ||
                  ""
              ).trim();

            if (!saleOrderItemCode) {
              throw new Error(
                `Sale order item code is required for item ${
                  index + 1
                }.`
              );
            }

            if (
              !Array.isArray(
                item.itemDetails
              ) ||
              item.itemDetails.length === 0
            ) {
              throw new Error(
                `At least one item detail is required for sale order item ${saleOrderItemCode}.`
              );
            }

            const itemDetails =
              item.itemDetails.map(
                (detail, detailIndex) => {
                  if (
                    !detail ||
                    typeof detail !==
                      "object"
                  ) {
                    throw new Error(
                      `Item detail ${
                        detailIndex + 1
                      } for ${saleOrderItemCode} must be an object.`
                    );
                  }

                  const name =
                    String(
                      detail.name || ""
                    ).trim();

                  const value =
                    detail.value ===
                        undefined ||
                    detail.value === null
                      ? ""
                      : String(
                          detail.value
                        ).trim();

                  if (!name) {
                    throw new Error(
                      `Item detail ${
                        detailIndex + 1
                      } name is required for ${saleOrderItemCode}.`
                    );
                  }

                  if (!value) {
                    throw new Error(
                      `Item detail ${
                        detailIndex + 1
                      } value is required for ${saleOrderItemCode}.`
                    );
                  }

                  return {
                    name,
                    value,
                  };
                }
              );

            return {
              saleOrderItemCode,
              itemDetails,
            };
          }
        );

      const payload = {
        saleOrderCode:
          String(
            saleOrderCode
          ).trim(),

        saleOrderItemDetailDTOS:
          cleanedItems,
      };

      const response = await axios.post(
        `${UNIWARE_BASE_URL}/services/rest/v1/oms/inflow/saleOrderItem/detail/add/bulk`,
        payload,
        {
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
          },
        }
      );

      return res
        .status(response.status || 200)
        .json(response.data);
    } catch (error) {
      console.error(
        "Uniware Add Sale Order Item Details Bulk Error:",
        error.response?.data ||
          error.message
      );

      return res
        .status(
          error.response?.status || 500
        )
        .json(
          error.response?.data || {
            successful: false,
            message:
              error.message ||
              "Failed to add sale order item details.",
            errors: [],
            warnings: [],
          }
        );
    }
  }
);
// Create Shipping Package
app.post(
  "/api/uniware/shipping-packages/create",
  async (req, res) => {
    try {
      const {
        facility,
        saleOrderCode,
        saleOrderItemCodes,
      } = req.body || {};

      // Validate Facility
      if (
        !facility ||
        !String(facility).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message: "Facility is required.",
          errors: [
            {
              fieldName: "facility",
              message:
                "Facility is required.",
            },
          ],
          warnings: [],
        });
      }

      // Validate Sale Order Code
      if (
        !saleOrderCode ||
        !String(saleOrderCode).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "Sale order code is required.",
          errors: [
            {
              fieldName:
                "saleOrderCode",
              message:
                "Sale order code is required.",
            },
          ],
          warnings: [],
        });
      }

      // Validate SOI codes
      if (
        !Array.isArray(
          saleOrderItemCodes
        ) ||
        saleOrderItemCodes.length === 0
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "At least one sale order item code is required.",
          errors: [
            {
              fieldName:
                "saleOrderItemCodes",
              message:
                "At least one sale order item code is required.",
            },
          ],
          warnings: [],
        });
      }

      // Clean SOI codes
      const cleanedItemCodes =
        saleOrderItemCodes
          .map((code) =>
            String(code || "").trim()
          )
          .filter(Boolean);

      if (
        cleanedItemCodes.length === 0
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "At least one valid sale order item code is required.",
          errors: [
            {
              fieldName:
                "saleOrderItemCodes",
              message:
                "At least one valid sale order item code is required.",
            },
          ],
          warnings: [],
        });
      }

      const payload = {
        saleOrderCode:
          String(
            saleOrderCode
          ).trim(),

        saleOrderItemCodes:
          cleanedItemCodes,
      };

      const response = await axios.post(
        `${UNIWARE_BASE_URL}/services/rest/v1/oms/shippingPackage/create`,
        payload,
        {
          headers: {
            "Content-Type":
              "application/json",

            Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,

            Facility:
              String(
                facility
              ).trim(),
          },
        }
      );

      return res
        .status(response.status || 200)
        .json(response.data);
    } catch (error) {
      console.error(
        "Uniware Create Shipping Package Error:",
        error.response?.data ||
          error.message
      );

      return res
        .status(
          error.response?.status || 500
        )
        .json(
          error.response?.data || {
            successful: false,
            message:
              error.message ||
              "Failed to create shipping package.",
            errors: [],
            warnings: [],
          }
        );
    }
  }
);

////////////////////shipping fulfillment///////////////
// ============================================================
// Uniware - Search Shipping Package
// Uniware Endpoint:
// POST /services/rest/v1/oms/shippingPackage/search
// Level: Facility
// ============================================================

app.post("/api/uniware/shipping-packages/search", async (req, res) => {
  try {
    const {
      facility,
      shippingPackageCode,
      saleOrderCode,
      channelCode,
      statuses,
      createTime,
      dispatchTime,
      containsCancelledItems,
      onHold,
      shippingProvider,
      shippingMethod,
      trackingNumber,
      invoiceCode,
      cashOnDelivery,
      searchOptions,
      paymentReconciled,
      itemTypeSkuCode,
      updatedSinceInMinutes,
    } = req.body || {};

    // --------------------------------------------------------
    // Facility is mandatory because this is a Facility-level API
    // --------------------------------------------------------
    if (!facility || !String(facility).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Facility code is required.",
        errors: [
          {
            fieldName: "facility",
            message: "Facility code is required.",
          },
        ],
        warnings: [],
      });
    }

    // --------------------------------------------------------
    // At least one of shippingPackageCode / saleOrderCode required
    // --------------------------------------------------------
    const packageCode =
      shippingPackageCode !== undefined &&
      shippingPackageCode !== null
        ? String(shippingPackageCode).trim()
        : "";

    const orderCode =
      saleOrderCode !== undefined && saleOrderCode !== null
        ? String(saleOrderCode).trim()
        : "";

    if (!packageCode && !orderCode) {
      return res.status(400).json({
        successful: false,
        message:
          "Either shippingPackageCode or saleOrderCode is required.",
        errors: [
          {
            fieldName: "shippingPackageCode",
            message:
              "Provide shippingPackageCode or saleOrderCode.",
          },
        ],
        warnings: [],
      });
    }

    // --------------------------------------------------------
    // Helper functions
    // --------------------------------------------------------
    const hasValue = (value) =>
      value !== undefined &&
      value !== null &&
      !(typeof value === "string" && value.trim() === "");

    const cleanString = (value) => {
      if (!hasValue(value)) return undefined;
      return String(value).trim();
    };

    const cleanInteger = (value) => {
      if (!hasValue(value)) return undefined;

      const number = Number(value);

      if (!Number.isInteger(number)) {
        return undefined;
      }

      return number;
    };

    const cleanBoolean = (value) => {
      if (value === true || value === false) {
        return value;
      }

      return undefined;
    };

    const cleanDateRange = (range) => {
      if (!range || typeof range !== "object") {
        return undefined;
      }

      const result = {};

      if (hasValue(range.start)) {
        result.start = new Date(range.start).toISOString();
      }

      if (hasValue(range.end)) {
        result.end = new Date(range.end).toISOString();
      }

      if (hasValue(range.textRange)) {
        result.textRange = String(range.textRange).trim();
      }

      return Object.keys(result).length > 0 ? result : undefined;
    };

    // --------------------------------------------------------
    // Build payload dynamically
    // --------------------------------------------------------
    const payload = {};

    if (packageCode) {
      payload.shippingPackageCode = packageCode;
    }

    if (orderCode) {
      payload.saleOrderCode = orderCode;
    }

    const optionalStrings = {
      channelCode,
      shippingProvider,
      shippingMethod,
      trackingNumber,
      invoiceCode,
      itemTypeSkuCode,
    };

    Object.entries(optionalStrings).forEach(([key, value]) => {
      const cleaned = cleanString(value);

      if (cleaned !== undefined) {
        payload[key] = cleaned;
      }
    });

    // --------------------------------------------------------
    // Statuses
    // --------------------------------------------------------
    if (Array.isArray(statuses)) {
      const cleanedStatuses = statuses
        .map((status) => String(status).trim())
        .filter(Boolean);

      if (cleanedStatuses.length > 0) {
        payload.statuses = cleanedStatuses;
      }
    } else if (hasValue(statuses)) {
      const cleanedStatus = String(statuses).trim();

      if (cleanedStatus) {
        payload.statuses = [cleanedStatus];
      }
    }

    // --------------------------------------------------------
    // Create / Dispatch time
    // --------------------------------------------------------
    const cleanedCreateTime = cleanDateRange(createTime);

    if (cleanedCreateTime) {
      payload.createTime = cleanedCreateTime;
    }

    const cleanedDispatchTime = cleanDateRange(dispatchTime);

    if (cleanedDispatchTime) {
      payload.dispatchTime = cleanedDispatchTime;
    }

    // --------------------------------------------------------
    // Preserve explicit boolean false
    // --------------------------------------------------------
    const booleanFields = {
      containsCancelledItems,
      onHold,
      cashOnDelivery,
      paymentReconciled,
    };

    Object.entries(booleanFields).forEach(([key, value]) => {
      const cleaned = cleanBoolean(value);

      if (cleaned !== undefined) {
        payload[key] = cleaned;
      }
    });

    // --------------------------------------------------------
    // Search options
    // --------------------------------------------------------
    if (searchOptions && typeof searchOptions === "object") {
      const options = {};

      const searchKey = cleanString(searchOptions.searchKey);
      const sortDirection = cleanString(searchOptions.sortDirection);
      const columnNames = cleanString(searchOptions.columnNames);

      if (searchKey !== undefined) {
        options.searchKey = searchKey;
      }

      if (sortDirection !== undefined) {
        options.sortDirection = sortDirection;
      }

      if (columnNames !== undefined) {
        options.columnNames = columnNames;
      }

      const integerSearchFields = [
        "displayLength",
        "displayStart",
        "columns",
        "sortingCols",
        "sortColumnIndex",
      ];

      integerSearchFields.forEach((key) => {
        const value = cleanInteger(searchOptions[key]);

        if (value !== undefined) {
          options[key] = value;
        }
      });

      const getCount = cleanBoolean(searchOptions.getCount);

      if (getCount !== undefined) {
        options.getCount = getCount;
      }

      if (Object.keys(options).length > 0) {
        payload.searchOptions = options;
      }
    }

    // --------------------------------------------------------
    // updatedSinceInMinutes
    // --------------------------------------------------------
    const updatedMinutes = cleanInteger(updatedSinceInMinutes);

    if (updatedMinutes !== undefined) {
      if (updatedMinutes < 0) {
        return res.status(400).json({
          successful: false,
          message: "updatedSinceInMinutes cannot be negative.",
          errors: [
            {
              fieldName: "updatedSinceInMinutes",
              message: "Value must be zero or greater.",
            },
          ],
          warnings: [],
        });
      }

      payload.updatedSinceInMinutes = updatedMinutes;
    }

    // --------------------------------------------------------
    // Call Uniware
    // --------------------------------------------------------
    const response = await axios.post(
      `${UNIWARE_BASE_URL}/services/rest/v1/oms/shippingPackage/search`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
          Facility: String(facility).trim(),
        },
      }
    );

    return res.status(response.status || 200).json(response.data);
  } catch (error) {
    console.error(
      "Uniware Search Shipping Package Error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json(
      error.response?.data || {
        successful: false,
        message:
          error.message || "Failed to search shipping packages.",
        errors: [],
        warnings: [],
      }
    );
  }
});
// ============================================================
// Uniware - Search Shipping Package
// Uniware Endpoint:
// POST /services/rest/v1/oms/shippingPackage/search
// Level: Facility
// ============================================================

app.post("/api/uniware/shipping-packages/search", async (req, res) => {
  try {
    const {
      facility,
      shippingPackageCode,
      saleOrderCode,
      channelCode,
      statuses,
      createTime,
      dispatchTime,
      containsCancelledItems,
      onHold,
      shippingProvider,
      shippingMethod,
      trackingNumber,
      invoiceCode,
      cashOnDelivery,
      searchOptions,
      paymentReconciled,
      itemTypeSkuCode,
      updatedSinceInMinutes,
    } = req.body || {};

    // --------------------------------------------------------
    // Facility is mandatory because this is a Facility-level API
    // --------------------------------------------------------
    if (!facility || !String(facility).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Facility code is required.",
        errors: [
          {
            fieldName: "facility",
            message: "Facility code is required.",
          },
        ],
        warnings: [],
      });
    }

    // --------------------------------------------------------
    // At least one of shippingPackageCode / saleOrderCode required
    // --------------------------------------------------------
    const packageCode =
      shippingPackageCode !== undefined &&
      shippingPackageCode !== null
        ? String(shippingPackageCode).trim()
        : "";

    const orderCode =
      saleOrderCode !== undefined && saleOrderCode !== null
        ? String(saleOrderCode).trim()
        : "";

    if (!packageCode && !orderCode) {
      return res.status(400).json({
        successful: false,
        message:
          "Either shippingPackageCode or saleOrderCode is required.",
        errors: [
          {
            fieldName: "shippingPackageCode",
            message:
              "Provide shippingPackageCode or saleOrderCode.",
          },
        ],
        warnings: [],
      });
    }

    // --------------------------------------------------------
    // Helper functions
    // --------------------------------------------------------
    const hasValue = (value) =>
      value !== undefined &&
      value !== null &&
      !(typeof value === "string" && value.trim() === "");

    const cleanString = (value) => {
      if (!hasValue(value)) return undefined;
      return String(value).trim();
    };

    const cleanInteger = (value) => {
      if (!hasValue(value)) return undefined;

      const number = Number(value);

      if (!Number.isInteger(number)) {
        return undefined;
      }

      return number;
    };

    const cleanBoolean = (value) => {
      if (value === true || value === false) {
        return value;
      }

      return undefined;
    };

    const cleanDateRange = (range) => {
      if (!range || typeof range !== "object") {
        return undefined;
      }

      const result = {};

      if (hasValue(range.start)) {
        result.start = new Date(range.start).toISOString();
      }

      if (hasValue(range.end)) {
        result.end = new Date(range.end).toISOString();
      }

      if (hasValue(range.textRange)) {
        result.textRange = String(range.textRange).trim();
      }

      return Object.keys(result).length > 0 ? result : undefined;
    };

    // --------------------------------------------------------
    // Build payload dynamically
    // --------------------------------------------------------
    const payload = {};

    if (packageCode) {
      payload.shippingPackageCode = packageCode;
    }

    if (orderCode) {
      payload.saleOrderCode = orderCode;
    }

    const optionalStrings = {
      channelCode,
      shippingProvider,
      shippingMethod,
      trackingNumber,
      invoiceCode,
      itemTypeSkuCode,
    };

    Object.entries(optionalStrings).forEach(([key, value]) => {
      const cleaned = cleanString(value);

      if (cleaned !== undefined) {
        payload[key] = cleaned;
      }
    });

    // --------------------------------------------------------
    // Statuses
    // --------------------------------------------------------
    if (Array.isArray(statuses)) {
      const cleanedStatuses = statuses
        .map((status) => String(status).trim())
        .filter(Boolean);

      if (cleanedStatuses.length > 0) {
        payload.statuses = cleanedStatuses;
      }
    } else if (hasValue(statuses)) {
      const cleanedStatus = String(statuses).trim();

      if (cleanedStatus) {
        payload.statuses = [cleanedStatus];
      }
    }

    // --------------------------------------------------------
    // Create / Dispatch time
    // --------------------------------------------------------
    const cleanedCreateTime = cleanDateRange(createTime);

    if (cleanedCreateTime) {
      payload.createTime = cleanedCreateTime;
    }

    const cleanedDispatchTime = cleanDateRange(dispatchTime);

    if (cleanedDispatchTime) {
      payload.dispatchTime = cleanedDispatchTime;
    }

    // --------------------------------------------------------
    // Preserve explicit boolean false
    // --------------------------------------------------------
    const booleanFields = {
      containsCancelledItems,
      onHold,
      cashOnDelivery,
      paymentReconciled,
    };

    Object.entries(booleanFields).forEach(([key, value]) => {
      const cleaned = cleanBoolean(value);

      if (cleaned !== undefined) {
        payload[key] = cleaned;
      }
    });

    // --------------------------------------------------------
    // Search options
    // --------------------------------------------------------
    if (searchOptions && typeof searchOptions === "object") {
      const options = {};

      const searchKey = cleanString(searchOptions.searchKey);
      const sortDirection = cleanString(searchOptions.sortDirection);
      const columnNames = cleanString(searchOptions.columnNames);

      if (searchKey !== undefined) {
        options.searchKey = searchKey;
      }

      if (sortDirection !== undefined) {
        options.sortDirection = sortDirection;
      }

      if (columnNames !== undefined) {
        options.columnNames = columnNames;
      }

      const integerSearchFields = [
        "displayLength",
        "displayStart",
        "columns",
        "sortingCols",
        "sortColumnIndex",
      ];

      integerSearchFields.forEach((key) => {
        const value = cleanInteger(searchOptions[key]);

        if (value !== undefined) {
          options[key] = value;
        }
      });

      const getCount = cleanBoolean(searchOptions.getCount);

      if (getCount !== undefined) {
        options.getCount = getCount;
      }

      if (Object.keys(options).length > 0) {
        payload.searchOptions = options;
      }
    }

    // --------------------------------------------------------
    // updatedSinceInMinutes
    // --------------------------------------------------------
    const updatedMinutes = cleanInteger(updatedSinceInMinutes);

    if (updatedMinutes !== undefined) {
      if (updatedMinutes < 0) {
        return res.status(400).json({
          successful: false,
          message: "updatedSinceInMinutes cannot be negative.",
          errors: [
            {
              fieldName: "updatedSinceInMinutes",
              message: "Value must be zero or greater.",
            },
          ],
          warnings: [],
        });
      }

      payload.updatedSinceInMinutes = updatedMinutes;
    }

    // --------------------------------------------------------
    // Call Uniware
    // --------------------------------------------------------
    const response = await axios.post(
      `${UNIWARE_BASE_URL}/services/rest/v1/oms/shippingPackage/search`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
          Facility: String(facility).trim(),
        },
      }
    );

    return res.status(response.status || 200).json(response.data);
  } catch (error) {
    console.error(
      "Uniware Search Shipping Package Error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json(
      error.response?.data || {
        successful: false,
        message:
          error.message || "Failed to search shipping packages.",
        errors: [],
        warnings: [],
      }
    );
  }
});

// ============================================================
// Uniware - Update Shipping Package
// Uniware Endpoint:
// POST /services/rest/v1/oms/shippingPackage/edit
// Level: Facility
// ============================================================

app.post("/api/uniware/shipping-packages/update", async (req, res) => {
  try {
    const {
      facility,
      shippingPackageCode,
      shippingProviderCode,
      trackingNumber,
      shippingPackageTypeCode,
      forcedCancelOnCourier,
      actualWeight,
      shippingBox,
      noOfBoxes,
      customFieldValues,
    } = req.body || {};

    // --------------------------------------------------------
    // Facility validation
    // --------------------------------------------------------
    if (!facility || !String(facility).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Facility code is required.",
        errors: [
          {
            fieldName: "facility",
            message: "Facility code is required.",
          },
        ],
        warnings: [],
      });
    }

    // --------------------------------------------------------
    // Shipping package code is mandatory
    // --------------------------------------------------------
    if (
      !shippingPackageCode ||
      !String(shippingPackageCode).trim()
    ) {
      return res.status(400).json({
        successful: false,
        message: "Shipping package code is required.",
        errors: [
          {
            fieldName: "shippingPackageCode",
            message: "Shipping package code is required.",
          },
        ],
        warnings: [],
      });
    }

    // --------------------------------------------------------
    // Helpers
    // --------------------------------------------------------
    const hasValue = (value) =>
      value !== undefined &&
      value !== null &&
      !(typeof value === "string" && value.trim() === "");

    const cleanString = (value) => {
      if (!hasValue(value)) {
        return undefined;
      }

      return String(value).trim();
    };

    const cleanInteger = (value) => {
      if (!hasValue(value)) {
        return undefined;
      }

      const number = Number(value);

      if (!Number.isInteger(number)) {
        return undefined;
      }

      return number;
    };

    // --------------------------------------------------------
    // Build payload
    // --------------------------------------------------------
    const payload = {
      shippingPackageCode:
        String(shippingPackageCode).trim(),
    };

    // --------------------------------------------------------
    // Optional string fields
    // --------------------------------------------------------
    const optionalStrings = {
      shippingProviderCode,
      trackingNumber,
      shippingPackageTypeCode,
    };

    Object.entries(optionalStrings).forEach(
      ([key, value]) => {
        const cleaned = cleanString(value);

        if (cleaned !== undefined) {
          payload[key] = cleaned;
        }
      }
    );

    // --------------------------------------------------------
    // Optional boolean
    // Preserve false when explicitly supplied
    // --------------------------------------------------------
    if (
      forcedCancelOnCourier === true ||
      forcedCancelOnCourier === false
    ) {
      payload.forcedCancelOnCourier =
        forcedCancelOnCourier;
    }

    // --------------------------------------------------------
    // Actual weight
    // --------------------------------------------------------
    if (hasValue(actualWeight)) {
      const weight = cleanInteger(actualWeight);

      if (weight === undefined || weight < 0) {
        return res.status(400).json({
          successful: false,
          message:
            "actualWeight must be a non-negative integer.",
          errors: [
            {
              fieldName: "actualWeight",
              message:
                "Actual weight must be a non-negative integer.",
            },
          ],
          warnings: [],
        });
      }

      payload.actualWeight = weight;
    }

    // --------------------------------------------------------
    // Number of boxes
    // --------------------------------------------------------
    if (hasValue(noOfBoxes)) {
      const boxes = cleanInteger(noOfBoxes);

      if (boxes === undefined || boxes < 0) {
        return res.status(400).json({
          successful: false,
          message:
            "noOfBoxes must be a non-negative integer.",
          errors: [
            {
              fieldName: "noOfBoxes",
              message:
                "Number of boxes must be a non-negative integer.",
            },
          ],
          warnings: [],
        });
      }

      payload.noOfBoxes = boxes;
    }

    // --------------------------------------------------------
    // Shipping box
    // If supplied, length/width/height are mandatory
    // --------------------------------------------------------
    if (
      shippingBox !== undefined &&
      shippingBox !== null
    ) {
      if (
        typeof shippingBox !== "object" ||
        Array.isArray(shippingBox)
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "shippingBox must be an object.",
          errors: [
            {
              fieldName: "shippingBox",
              message:
                "Shipping box must be an object.",
            },
          ],
          warnings: [],
        });
      }

      const length = cleanInteger(
        shippingBox.length
      );

      const width = cleanInteger(
        shippingBox.width
      );

      const height = cleanInteger(
        shippingBox.height
      );

      if (
        length === undefined ||
        width === undefined ||
        height === undefined
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "shippingBox length, width and height are required.",
          errors: [
            {
              fieldName: "shippingBox",
              message:
                "Length, width and height are required.",
            },
          ],
          warnings: [],
        });
      }

      if (
        length < 0 ||
        width < 0 ||
        height < 0
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "Shipping box dimensions cannot be negative.",
          errors: [
            {
              fieldName: "shippingBox",
              message:
                "Length, width and height must be non-negative integers.",
            },
          ],
          warnings: [],
        });
      }

      payload.shippingBox = {
        length,
        width,
        height,
      };
    }

    // --------------------------------------------------------
    // Custom fields
    // --------------------------------------------------------
    if (Array.isArray(customFieldValues)) {
      const cleanedCustomFields = [];

      for (
        let index = 0;
        index < customFieldValues.length;
        index++
      ) {
        const field = customFieldValues[index];

        if (!field || typeof field !== "object") {
          return res.status(400).json({
            successful: false,
            message:
              `Invalid custom field at index ${index}.`,
            errors: [
              {
                fieldName: `customFieldValues[${index}]`,
                message:
                  "Custom field must be an object.",
              },
            ],
            warnings: [],
          });
        }

        const name = cleanString(field.name);

        if (!name) {
          return res.status(400).json({
            successful: false,
            message:
              `Custom field name is required at index ${index}.`,
            errors: [
              {
                fieldName: `customFieldValues[${index}].name`,
                message:
                  "Custom field name is required.",
              },
            ],
            warnings: [],
          });
        }

        const customField = {
          name,
        };

        // Value is optional according to Uniware docs.
        if (hasValue(field.value)) {
          customField.value = String(field.value);
        }

        cleanedCustomFields.push(customField);
      }

      if (cleanedCustomFields.length > 0) {
        payload.customFieldValues =
          cleanedCustomFields;
      }
    } else if (
      customFieldValues !== undefined &&
      customFieldValues !== null
    ) {
      return res.status(400).json({
        successful: false,
        message:
          "customFieldValues must be an array.",
        errors: [
          {
            fieldName: "customFieldValues",
            message:
              "Custom field values must be an array.",
          },
        ],
        warnings: [],
      });
    }

    // --------------------------------------------------------
    // Call Uniware
    // --------------------------------------------------------
    const response = await axios.post(
      `${UNIWARE_BASE_URL}/services/rest/v1/oms/shippingPackage/edit`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
          Facility: String(facility).trim(),
        },
      }
    );

    return res
      .status(response.status || 200)
      .json(response.data);
  } catch (error) {
    console.error(
      "Uniware Update Shipping Package Error:",
      error.response?.data || error.message
    );

    return res
      .status(error.response?.status || 500)
      .json(
        error.response?.data || {
          successful: false,
          message:
            error.message ||
            "Failed to update shipping package.",
          errors: [],
          warnings: [],
        }
      );
  }
});
// ============================================================
// UNIWARE - SPLIT SHIPPING PACKAGE
// POST /api/uniware/shipping-packages/split
// Uniware:
// POST /services/rest/v1/oms/shippingPackage/split
// Level: Facility
// ============================================================

app.post("/api/uniware/shipping-packages/split", async (req, res) => {
  try {
    const {
      facility,
      shippingPackageCode,
      splitPackages,
    } = req.body || {};

    // ----------------------------------------------------------
    // Validate Facility
    // ----------------------------------------------------------
    if (!facility || !String(facility).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Facility is required.",
        errors: [
          {
            fieldName: "facility",
            message: "Facility is required.",
          },
        ],
        warnings: [],
      });
    }

    // ----------------------------------------------------------
    // Validate Shipping Package Code
    // ----------------------------------------------------------
    if (
      !shippingPackageCode ||
      !String(shippingPackageCode).trim()
    ) {
      return res.status(400).json({
        successful: false,
        message: "Shipping package code is required.",
        errors: [
          {
            fieldName: "shippingPackageCode",
            message: "Shipping package code is required.",
          },
        ],
        warnings: [],
      });
    }

    // ----------------------------------------------------------
    // Validate Split Packages
    // ----------------------------------------------------------
    if (!Array.isArray(splitPackages) || splitPackages.length === 0) {
      return res.status(400).json({
        successful: false,
        message: "At least one split package is required.",
        errors: [
          {
            fieldName: "splitPackages",
            message: "At least one split package is required.",
          },
        ],
        warnings: [],
      });
    }

    // ----------------------------------------------------------
    // Build splitPackages
    // ----------------------------------------------------------
    const normalizedSplitPackages = [];

    for (let packageIndex = 0; packageIndex < splitPackages.length; packageIndex++) {
      const splitPackage = splitPackages[packageIndex] || {};

      const packetNumber =
        splitPackage.packetNumber !== undefined &&
        splitPackage.packetNumber !== null &&
        splitPackage.packetNumber !== ""
          ? Number(splitPackage.packetNumber)
          : undefined;

      if (
        packetNumber !== undefined &&
        (!Number.isInteger(packetNumber) || packetNumber < 0)
      ) {
        return res.status(400).json({
          successful: false,
          message: `Invalid packet number for split package ${packageIndex + 1}.`,
          errors: [
            {
              fieldName: `splitPackages[${packageIndex}].packetNumber`,
              message: "Packet number must be a non-negative integer.",
            },
          ],
          warnings: [],
        });
      }

      // --------------------------------------------------------
      // Items are optional according to Uniware documentation.
      // If supplied, they must be an array.
      // --------------------------------------------------------
      if (
        splitPackage.items !== undefined &&
        !Array.isArray(splitPackage.items)
      ) {
        return res.status(400).json({
          successful: false,
          message: `Items must be an array for split package ${packageIndex + 1}.`,
          errors: [
            {
              fieldName: `splitPackages[${packageIndex}].items`,
              message: "Items must be an array.",
            },
          ],
          warnings: [],
        });
      }

      const normalizedItems = [];

      if (Array.isArray(splitPackage.items)) {
        for (let itemIndex = 0; itemIndex < splitPackage.items.length; itemIndex++) {
          const item = splitPackage.items[itemIndex] || {};

          const normalizedItem = {};

          // ----------------------------------------------------
          // skuCode - optional according to documentation
          // ----------------------------------------------------
          if (
            item.skuCode !== undefined &&
            item.skuCode !== null &&
            String(item.skuCode).trim() !== ""
          ) {
            normalizedItem.skuCode = String(item.skuCode).trim();
          }

          // ----------------------------------------------------
          // quantity - optional according to documentation
          // ----------------------------------------------------
          if (
            item.quantity !== undefined &&
            item.quantity !== null &&
            item.quantity !== ""
          ) {
            const quantity = Number(item.quantity);

            if (!Number.isInteger(quantity) || quantity < 0) {
              return res.status(400).json({
                successful: false,
                message: `Invalid quantity for item ${itemIndex + 1} in split package ${packageIndex + 1}.`,
                errors: [
                  {
                    fieldName: `splitPackages[${packageIndex}].items[${itemIndex}].quantity`,
                    message: "Quantity must be a non-negative integer.",
                  },
                ],
                warnings: [],
              });
            }

            normalizedItem.quantity = quantity;
          }

          // ----------------------------------------------------
          // saleOrderItemCodes
          //
          // This is specifically used when splitting package
          // sale-order-item-wise.
          //
          // Uniware says that when SKU + quantity are used,
          // this can be passed as [].
          // ----------------------------------------------------
          if (item.saleOrderItemCodes !== undefined) {
            if (!Array.isArray(item.saleOrderItemCodes)) {
              return res.status(400).json({
                successful: false,
                message: `saleOrderItemCodes must be an array for item ${itemIndex + 1}.`,
                errors: [
                  {
                    fieldName: `splitPackages[${packageIndex}].items[${itemIndex}].saleOrderItemCodes`,
                    message: "saleOrderItemCodes must be an array.",
                  },
                ],
                warnings: [],
              });
            }

            normalizedItem.saleOrderItemCodes =
              item.saleOrderItemCodes
                .map((code) => String(code || "").trim())
                .filter(Boolean);
          }

          // ----------------------------------------------------
          // Avoid sending an empty item object
          // ----------------------------------------------------
          if (Object.keys(normalizedItem).length === 0) {
            return res.status(400).json({
              successful: false,
              message: `Item ${itemIndex + 1} in split package ${packageIndex + 1} is empty.`,
              errors: [
                {
                  fieldName: `splitPackages[${packageIndex}].items[${itemIndex}]`,
                  message:
                    "Provide skuCode, quantity, or saleOrderItemCodes.",
                },
              ],
              warnings: [],
            });
          }

          normalizedItems.push(normalizedItem);
        }
      }

      const normalizedPackage = {};

      if (packetNumber !== undefined) {
        normalizedPackage.packetNumber = packetNumber;
      }

      if (Array.isArray(splitPackage.items)) {
        normalizedPackage.items = normalizedItems;
      }

      normalizedSplitPackages.push(normalizedPackage);
    }

    // ----------------------------------------------------------
    // Uniware payload
    //
    // IMPORTANT:
    // facility is NOT part of the body.
    // It is sent as the Facility HTTP header.
    // ----------------------------------------------------------
    const payload = {
      shippingPackageCode: String(shippingPackageCode).trim(),
      splitPackages: normalizedSplitPackages,
    };

    // ----------------------------------------------------------
    // Call Uniware
    // ----------------------------------------------------------
    const response = await axios.post(
      `${UNIWARE_BASE_URL}/services/rest/v1/oms/shippingPackage/split`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
          Facility: String(facility).trim(),
        },
      }
    );

    return res
      .status(response.status || 200)
      .json(response.data);
  } catch (error) {
    console.error(
      "Uniware Split Shipping Package Error:",
      error.response?.data || error.message
    );

    return res
      .status(error.response?.status || 500)
      .json(
        error.response?.data || {
          successful: false,
          message:
            error.message || "Failed to split shipping package.",
          errors: [],
          warnings: [],
        }
      );
  }
});
// ============================================================
// UNIWARE - MODIFY SHIPPING PACKAGE
// POST /api/uniware/shipping-packages/modify
//
// Uniware:
// POST /services/rest/v1/oms/shippingPackage/modify
//
// Level: Tenant
// Facility Header: NOT REQUIRED
// ============================================================

app.post("/api/uniware/shipping-packages/modify", async (req, res) => {
  try {
    const {
      saleOrderCode,
      saleOrderItemCodes,
    } = req.body || {};

    // ----------------------------------------------------------
    // At least one of saleOrderCode or saleOrderItemCodes
    // should be provided.
    //
    // Uniware documentation marks both as optional.
    // An entirely empty request is not useful, so reject it
    // locally instead of sending an empty payload.
    // ----------------------------------------------------------
    const hasSaleOrderCode =
      saleOrderCode !== undefined &&
      saleOrderCode !== null &&
      String(saleOrderCode).trim() !== "";

    const hasSaleOrderItemCodes =
      Array.isArray(saleOrderItemCodes) &&
      saleOrderItemCodes.length > 0;

    if (!hasSaleOrderCode && !hasSaleOrderItemCodes) {
      return res.status(400).json({
        successful: false,
        message:
          "Provide saleOrderCode or saleOrderItemCodes.",
        errors: [
          {
            fieldName: "saleOrderCode",
            message:
              "At least one of saleOrderCode or saleOrderItemCodes is required.",
          },
        ],
        warnings: [],
      });
    }

    // ----------------------------------------------------------
    // Validate saleOrderCode
    // ----------------------------------------------------------
    if (
      saleOrderCode !== undefined &&
      saleOrderCode !== null &&
      typeof saleOrderCode !== "string"
    ) {
      return res.status(400).json({
        successful: false,
        message: "saleOrderCode must be a string.",
        errors: [
          {
            fieldName: "saleOrderCode",
            message: "saleOrderCode must be a string.",
          },
        ],
        warnings: [],
      });
    }

    // ----------------------------------------------------------
    // Validate saleOrderItemCodes
    // ----------------------------------------------------------
    if (
      saleOrderItemCodes !== undefined &&
      !Array.isArray(saleOrderItemCodes)
    ) {
      return res.status(400).json({
        successful: false,
        message: "saleOrderItemCodes must be an array.",
        errors: [
          {
            fieldName: "saleOrderItemCodes",
            message: "saleOrderItemCodes must be an array.",
          },
        ],
        warnings: [],
      });
    }

    let normalizedSaleOrderItemCodes = [];

    if (Array.isArray(saleOrderItemCodes)) {
      normalizedSaleOrderItemCodes =
        saleOrderItemCodes
          .map((code) => String(code || "").trim())
          .filter(Boolean);

      if (
        saleOrderItemCodes.length > 0 &&
        normalizedSaleOrderItemCodes.length === 0
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "saleOrderItemCodes must contain at least one valid item code.",
          errors: [
            {
              fieldName: "saleOrderItemCodes",
              message:
                "At least one non-empty sale order item code is required.",
            },
          ],
          warnings: [],
        });
      }
    }

    // ----------------------------------------------------------
    // Build Uniware payload dynamically.
    //
    // IMPORTANT:
    // No Facility field/header is sent because this API
    // is Tenant-level.
    // ----------------------------------------------------------
    const payload = {};

    if (hasSaleOrderCode) {
      payload.saleOrderCode =
        String(saleOrderCode).trim();
    }

    if (hasSaleOrderItemCodes) {
      payload.saleOrderItemCodes =
        normalizedSaleOrderItemCodes;
    }

    // ----------------------------------------------------------
    // Call Uniware
    // ----------------------------------------------------------
    const response = await axios.post(
      `${UNIWARE_BASE_URL}/services/rest/v1/oms/shippingPackage/modify`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
        },
      }
    );

    return res
      .status(response.status || 200)
      .json(response.data);
  } catch (error) {
    console.error(
      "Uniware Modify Shipping Package Error:",
      error.response?.data || error.message
    );

    return res
      .status(error.response?.status || 500)
      .json(
        error.response?.data || {
          successful: false,
          message:
            error.message ||
            "Failed to modify shipping package.",
          errors: [],
          warnings: [],
        }
      );
  }
});
// ============================================================
// UNIWARE - GET SHIPPING PACKAGES
// POST /api/uniware/shipping-packages/get
//
// Uniware:
// POST /services/rest/v1/oms/shippingPackage/getShippingPackages
//
// Level: Facility
// Facility Header: REQUIRED
// ============================================================

app.post("/api/uniware/shipping-packages/get", async (req, res) => {
  try {
    const {
      facility,
      statusCode,
    } = req.body || {};

    // ----------------------------------------------------------
    // Validate Facility
    // ----------------------------------------------------------
    if (!facility || !String(facility).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Facility is required.",
        errors: [
          {
            fieldName: "facility",
            message: "Facility is required.",
          },
        ],
        warnings: [],
      });
    }

    // ----------------------------------------------------------
    // Validate statusCode
    // ----------------------------------------------------------
    if (
      !statusCode ||
      !String(statusCode).trim()
    ) {
      return res.status(400).json({
        successful: false,
        message: "Shipping package status code is required.",
        errors: [
          {
            fieldName: "statusCode",
            message:
              "Shipping package status code is required.",
          },
        ],
        warnings: [],
      });
    }

    // ----------------------------------------------------------
    // Uniware payload
    //
    // IMPORTANT:
    // facility is NOT sent in the request body.
    // It is sent as the Facility HTTP header.
    // ----------------------------------------------------------
    const payload = {
      statusCode: String(statusCode).trim(),
    };

    // ----------------------------------------------------------
    // Call Uniware
    // ----------------------------------------------------------
    const response = await axios.post(
      `${UNIWARE_BASE_URL}/services/rest/v1/oms/shippingPackage/getShippingPackages`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
          Facility: String(facility).trim(),
        },
      }
    );

    return res
      .status(response.status || 200)
      .json(response.data);
  } catch (error) {
    console.error(
      "Uniware Get Shipping Packages Error:",
      error.response?.data || error.message
    );

    return res
      .status(error.response?.status || 500)
      .json(
        error.response?.data || {
          successful: false,
          message:
            error.message ||
            "Failed to get shipping packages.",
          errors: [],
          warnings: [],
          shippingPackages: [],
        }
      );
  }
});
// ============================================================
// UNIWARE - GET SHIPPING PACKAGE DETAILS
// POST /api/uniware/shipping-packages/details
//
// Uniware:
// POST /services/rest/v1/oms/shippingPackage/getShippingPackageDetails
//
// Level: Facility
// Facility Header: REQUIRED
// ============================================================

app.post(
  "/api/uniware/shipping-packages/details",
  async (req, res) => {
    try {
      const {
        facility,
        shippingPackageCode,
      } = req.body || {};

      // --------------------------------------------------------
      // Validate Facility
      // --------------------------------------------------------
      if (
        !facility ||
        !String(facility).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message: "Facility is required.",
          errors: [
            {
              fieldName: "facility",
              message: "Facility is required.",
            },
          ],
          warnings: [],
        });
      }

      // --------------------------------------------------------
      // Validate Shipping Package Code
      // --------------------------------------------------------
      if (
        !shippingPackageCode ||
        !String(shippingPackageCode).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "Shipping package code is required.",
          errors: [
            {
              fieldName:
                "shippingPackageCode",
              message:
                "Shipping package code is required.",
            },
          ],
          warnings: [],
        });
      }

      // --------------------------------------------------------
      // Uniware request body
      //
      // IMPORTANT:
      // facility is NOT part of the Uniware body.
      // It is sent through the Facility HTTP header.
      // --------------------------------------------------------
      const payload = {
        shippingPackageCode:
          String(
            shippingPackageCode
          ).trim(),
      };

      // --------------------------------------------------------
      // Call Uniware
      // --------------------------------------------------------
      const response = await axios.post(
        `${UNIWARE_BASE_URL}/services/rest/v1/oms/shippingPackage/getShippingPackageDetails`,
        payload,
        {
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
            Facility:
              String(facility).trim(),
          },
        }
      );

      return res
        .status(response.status || 200)
        .json(response.data);
    } catch (error) {
      console.error(
        "Uniware Get Shipping Package Details Error:",
        error.response?.data ||
          error.message
      );

      return res
        .status(
          error.response?.status || 500
        )
        .json(
          error.response?.data || {
            successful: false,
            message:
              error.message ||
              "Failed to get shipping package details.",
            errors: [],
            warnings: [],
            shippingPackageDetailDTO:
              null,
          }
        );
    }
  }
);
// ============================================================
// UNIWARE - CREATE INVOICE
// POST /api/uniware/shipping-packages/create-invoice
//
// Uniware:
// POST /services/rest/v1/oms/shippingPackage/createInvoice
//
// Level: Facility
// Facility Header: REQUIRED
// ============================================================

app.post(
  "/api/uniware/shipping-packages/create-invoice",
  async (req, res) => {
    try {
      const {
        facility,
        shippingPackageCode,
        commitBlockedInventory,
        invoiceCode,
        gstEinvoice,
        channelProductIdToTax,
        skipDetailing,
      } = req.body || {};

      // --------------------------------------------------------
      // Validate Facility
      // --------------------------------------------------------
      if (
        !facility ||
        !String(facility).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message: "Facility is required.",
          errors: [
            {
              fieldName: "facility",
              message: "Facility is required.",
            },
          ],
          warnings: [],
        });
      }

      // --------------------------------------------------------
      // Validate Shipping Package Code
      // --------------------------------------------------------
      if (
        !shippingPackageCode ||
        !String(shippingPackageCode).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "Shipping package code is required.",
          errors: [
            {
              fieldName:
                "shippingPackageCode",
              message:
                "Shipping package code is required.",
            },
          ],
          warnings: [],
        });
      }

      // --------------------------------------------------------
      // Build payload dynamically
      //
      // facility is NOT sent to Uniware body.
      // It is sent through the Facility header.
      // --------------------------------------------------------
      const payload = {
        shippingPackageCode:
          String(
            shippingPackageCode
          ).trim(),
      };

      // --------------------------------------------------------
      // Optional boolean
      // Preserve false when explicitly supplied.
      // --------------------------------------------------------
      if (
        typeof commitBlockedInventory ===
        "boolean"
      ) {
        payload.commitBlockedInventory =
          commitBlockedInventory;
      }

      // --------------------------------------------------------
      // Optional invoice code
      // --------------------------------------------------------
      if (
        invoiceCode !== undefined &&
        invoiceCode !== null &&
        String(invoiceCode).trim()
      ) {
        payload.invoiceCode =
          String(invoiceCode).trim();
      }

      // --------------------------------------------------------
      // GST E-Invoice
      // --------------------------------------------------------
      if (
        gstEinvoice &&
        typeof gstEinvoice ===
          "object"
      ) {
        const gst = {};

        const gstFields = [
          "irn",
          "ackNo",
          "ackDate",
          "signedInvoice",
          "signedQrCode",
        ];

        gstFields.forEach((field) => {
          if (
            gstEinvoice[field] !==
              undefined &&
            gstEinvoice[field] !==
              null &&
            String(
              gstEinvoice[field]
            ).trim()
          ) {
            gst[field] = String(
              gstEinvoice[field]
            ).trim();
          }
        });

        if (
          Object.keys(gst).length > 0
        ) {
          payload.gstEinvoice = gst;
        }
      }

      // --------------------------------------------------------
      // channelProductIdToTax
      //
      // Expected structure:
      //
      // {
      //   "CHANNEL-SKU": {
      //      channelProductId: "...",
      //      additionalInfo: "...",
      //      taxPercentage: 18,
      //      centralGst: 9,
      //      stateGst: 9,
      //      unionTerritoryGst: 0,
      //      integratedGst: 0,
      //      compensationCess: 0,
      //      customFieldValues: [...]
      //   }
      // }
      // --------------------------------------------------------
      if (
        channelProductIdToTax &&
        typeof channelProductIdToTax ===
          "object" &&
        !Array.isArray(
          channelProductIdToTax
        )
      ) {
        const taxMap = {};

        for (const [
          mapKey,
          taxDetails,
        ] of Object.entries(
          channelProductIdToTax
        )) {
          if (
            !taxDetails ||
            typeof taxDetails !==
              "object"
          ) {
            continue;
          }

          const channelProductId =
            String(
              taxDetails.channelProductId ||
                mapKey
            ).trim();

          if (!channelProductId) {
            continue;
          }

          const tax = {
            channelProductId,
          };

          // ----------------------------------------------
          // Optional string
          // ----------------------------------------------
          if (
            taxDetails.additionalInfo !==
              undefined &&
            taxDetails.additionalInfo !==
              null &&
            String(
              taxDetails.additionalInfo
            ).trim()
          ) {
            tax.additionalInfo =
              String(
                taxDetails.additionalInfo
              ).trim();
          }

          // ----------------------------------------------
          // Optional numeric tax fields
          // Preserve 0.
          // ----------------------------------------------
          const numericFields = [
            "taxPercentage",
            "centralGst",
            "stateGst",
            "unionTerritoryGst",
            "integratedGst",
            "compensationCess",
          ];

          numericFields.forEach(
            (field) => {
              if (
                taxDetails[field] !==
                  undefined &&
                taxDetails[field] !==
                  null &&
                taxDetails[field] !==
                  ""
              ) {
                const numberValue =
                  Number(
                    taxDetails[field]
                  );

                if (
                  Number.isFinite(
                    numberValue
                  )
                ) {
                  tax[field] =
                    numberValue;
                }
              }
            }
          );

          // ----------------------------------------------
          // Custom fields
          // ----------------------------------------------
          if (
            Array.isArray(
              taxDetails.customFieldValues
            )
          ) {
            const customFields =
              taxDetails.customFieldValues
                .map((field) => ({
                  name:
                    field?.name !==
                    undefined
                      ? String(
                          field.name
                        ).trim()
                      : "",
                  value:
                    field?.value !==
                    undefined &&
                    field?.value !== null
                      ? String(
                          field.value
                        )
                      : "",
                }))
                .filter(
                  (field) =>
                    field.name
                );

            if (
              customFields.length > 0
            ) {
              tax.customFieldValues =
                customFields;
            }
          }

          taxMap[mapKey] = tax;
        }

        if (
          Object.keys(taxMap).length >
          0
        ) {
          payload.channelProductIdToTax =
            taxMap;
        }
      }

      // --------------------------------------------------------
      // Optional skipDetailing
      // Preserve false.
      // --------------------------------------------------------
      if (
        typeof skipDetailing ===
        "boolean"
      ) {
        payload.skipDetailing =
          skipDetailing;
      }

      // --------------------------------------------------------
      // Call Uniware
      // --------------------------------------------------------
      const response = await axios.post(
        `${UNIWARE_BASE_URL}/services/rest/v1/oms/shippingPackage/createInvoice`,
        payload,
        {
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
            Facility:
              String(facility).trim(),
          },
        }
      );

      return res
        .status(response.status || 200)
        .json(response.data);
    } catch (error) {
      console.error(
        "Uniware Create Invoice Error:",
        error.response?.data ||
          error.message
      );

      return res
        .status(
          error.response?.status || 500
        )
        .json(
          error.response?.data || {
            successful: false,
            message:
              error.message ||
              "Failed to create invoice.",
            errors: [],
            warnings: [],
          }
        );
    }
  }
);
// ============================================================
// Uniware - Create Invoice With Sale Order Code
// POST /api/uniware/invoices/create-by-sale-order
// ============================================================

app.post("/api/uniware/invoices/create-by-sale-order", async (req, res) => {
  try {
    const {
      facility,
      saleOrderCode,
      saleOrderItemCodes,
      commitBlockedInventory,
      taxInformation,
    } = req.body || {};

    // ----------------------------------------------------------
    // Validate Facility
    // ----------------------------------------------------------
    if (!facility || !String(facility).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Facility code is required.",
        errors: [
          {
            fieldName: "facility",
            message: "Facility code is required.",
          },
        ],
        warnings: [],
      });
    }

    // ----------------------------------------------------------
    // Validate Sale Order Code
    // ----------------------------------------------------------
    if (!saleOrderCode || !String(saleOrderCode).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Sale order code is required.",
        errors: [
          {
            fieldName: "saleOrderCode",
            message: "Sale order code is required.",
          },
        ],
        warnings: [],
      });
    }

    // ----------------------------------------------------------
    // Validate Sale Order Item Codes
    // ----------------------------------------------------------
    if (!Array.isArray(saleOrderItemCodes)) {
      return res.status(400).json({
        successful: false,
        message: "saleOrderItemCodes must be an array.",
        errors: [
          {
            fieldName: "saleOrderItemCodes",
            message: "Sale order item codes must be an array.",
          },
        ],
        warnings: [],
      });
    }

    const cleanedSaleOrderItemCodes = saleOrderItemCodes
      .map((code) => String(code ?? "").trim())
      .filter(Boolean);

    if (cleanedSaleOrderItemCodes.length === 0) {
      return res.status(400).json({
        successful: false,
        message: "At least one sale order item code is required.",
        errors: [
          {
            fieldName: "saleOrderItemCodes",
            message: "At least one sale order item code is required.",
          },
        ],
        warnings: [],
      });
    }

    // ----------------------------------------------------------
    // Build payload
    // ----------------------------------------------------------
    const payload = {
      saleOrderCode: String(saleOrderCode).trim(),
      saleOrderItemCodes: cleanedSaleOrderItemCodes,
    };

    // Preserve explicit false.
    if (typeof commitBlockedInventory === "boolean") {
      payload.commitBlockedInventory = commitBlockedInventory;
    }

    // ----------------------------------------------------------
    // Tax Information
    // ----------------------------------------------------------
    if (
      taxInformation &&
      typeof taxInformation === "object" &&
      !Array.isArray(taxInformation)
    ) {
      if (Array.isArray(taxInformation.productTaxes)) {
        const productTaxes = [];

        for (const tax of taxInformation.productTaxes) {
          if (!tax || typeof tax !== "object") {
            continue;
          }

          const channelProductId = String(
            tax.channelProductId ?? ""
          ).trim();

          if (!channelProductId) {
            return res.status(400).json({
              successful: false,
              message:
                "channelProductId is required for every product tax entry.",
              errors: [
                {
                  fieldName: "taxInformation.productTaxes.channelProductId",
                  message:
                    "channelProductId is required for every product tax entry.",
                },
              ],
              warnings: [],
            });
          }

          const productTax = {
            channelProductId,
          };

          // Optional string
          if (
            tax.additionalInfo !== undefined &&
            tax.additionalInfo !== null &&
            String(tax.additionalInfo).trim() !== ""
          ) {
            productTax.additionalInfo = String(
              tax.additionalInfo
            ).trim();
          }

          // Optional numeric fields.
          const numericFields = [
            "taxPercentage",
            "centralGst",
            "stateGst",
            "unionTerritoryGst",
            "integratedGst",
            "compensationCess",
          ];

          for (const field of numericFields) {
            if (
              tax[field] !== undefined &&
              tax[field] !== null &&
              tax[field] !== ""
            ) {
              const value = Number(tax[field]);

              if (!Number.isFinite(value)) {
                return res.status(400).json({
                  successful: false,
                  message: `${field} must be a valid number.`,
                  errors: [
                    {
                      fieldName: `taxInformation.productTaxes.${field}`,
                      message: `${field} must be a valid number.`,
                    },
                  ],
                  warnings: [],
                });
              }

              productTax[field] = value;
            }
          }

          // Optional custom fields
          if (Array.isArray(tax.customFieldValues)) {
            const customFieldValues = [];

            for (const customField of tax.customFieldValues) {
              if (!customField || typeof customField !== "object") {
                continue;
              }

              const name = String(customField.name ?? "").trim();

              if (!name) {
                return res.status(400).json({
                  successful: false,
                  message:
                    "Custom field name is required for every tax custom field.",
                  errors: [
                    {
                      fieldName:
                        "taxInformation.productTaxes.customFieldValues.name",
                      message: "Custom field name is required.",
                    },
                  ],
                  warnings: [],
                });
              }

              const fieldValue =
                customField.value === undefined ||
                customField.value === null
                  ? ""
                  : String(customField.value);

              customFieldValues.push({
                name,
                value: fieldValue,
              });
            }

            if (customFieldValues.length > 0) {
              productTax.customFieldValues = customFieldValues;
            }
          }

          productTaxes.push(productTax);
        }

        if (productTaxes.length > 0) {
          payload.taxInformation = {
            productTaxes,
          };
        }
      }
    }

    // ----------------------------------------------------------
    // Call Uniware
    // ----------------------------------------------------------
    const response = await axios.post(
      `${UNIWARE_BASE_URL}/services/rest/v1/invoice/createInvoiceBySaleOrderCode`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
          Facility: String(facility).trim(),
        },
      }
    );

    return res.status(response.status || 200).json(response.data);
  } catch (error) {
    console.error(
      "Uniware Create Invoice By Sale Order Error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json(
      error.response?.data || {
        successful: false,
        message:
          error.message || "Failed to create invoice by sale order code.",
        errors: [],
        warnings: [],
      }
    );
  }
});
// ============================================================
// Uniware - Create Invoice and Generate Label
// POST /api/uniware/shipping-packages/create-invoice-label
// ============================================================

app.post(
  "/api/uniware/shipping-packages/create-invoice-label",
  async (req, res) => {
    try {
      const {
        facility,
        shippingPackageCode,
        generateUniwareShippingLabel,
      } = req.body || {};

      // --------------------------------------------------------
      // Validate Facility
      // --------------------------------------------------------
      if (!facility || !String(facility).trim()) {
        return res.status(400).json({
          successful: false,
          message: "Facility code is required.",
          errors: [
            {
              fieldName: "facility",
              message: "Facility code is required.",
            },
          ],
          warnings: [],
        });
      }

      // --------------------------------------------------------
      // Validate Shipping Package Code
      // --------------------------------------------------------
      if (
        !shippingPackageCode ||
        !String(shippingPackageCode).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message: "Shipping package code is required.",
          errors: [
            {
              fieldName: "shippingPackageCode",
              message:
                "Shipping package code is required.",
            },
          ],
          warnings: [],
        });
      }

      // --------------------------------------------------------
      // Validate generateUniwareShippingLabel
      // --------------------------------------------------------
      if (
        typeof generateUniwareShippingLabel !==
        "boolean"
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "generateUniwareShippingLabel must be a boolean.",
          errors: [
            {
              fieldName:
                "generateUniwareShippingLabel",
              message:
                "generateUniwareShippingLabel must be true or false.",
            },
          ],
          warnings: [],
        });
      }

      // --------------------------------------------------------
      // Uniware Payload
      // --------------------------------------------------------
      const payload = {
        shippingPackageCode:
          String(shippingPackageCode).trim(),
        generateUniwareShippingLabel,
      };

      // --------------------------------------------------------
      // Call Uniware
      // --------------------------------------------------------
      const response = await axios.post(
        `${UNIWARE_BASE_URL}/services/rest/v1/oms/shippingPackage/createInvoiceAndGenerateLabel`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
            Facility: String(facility).trim(),
          },
        }
      );

      return res
        .status(response.status || 200)
        .json(response.data);
    } catch (error) {
      console.error(
        "Uniware Create Invoice And Generate Label Error:",
        error.response?.data || error.message
      );

      return res.status(
        error.response?.status || 500
      ).json(
        error.response?.data || {
          successful: false,
          message:
            error.message ||
            "Failed to create invoice and generate shipping label.",
          errors: [],
          warnings: [],
        }
      );
    }
  }
);
// ============================================================
// Uniware - Create Invoice With Details
// POST /api/uniware/invoices/create-with-details
// ============================================================

app.post(
  "/api/uniware/invoices/create-with-details",
  async (req, res) => {
    try {
      const {
        facility,
        saleOrderCode,
        invoice,
        shippingProviderCode,
        trackingNumber,
      } = req.body || {};

      // --------------------------------------------------------
      // Validate Facility
      // --------------------------------------------------------
      if (!facility || !String(facility).trim()) {
        return res.status(400).json({
          successful: false,
          message: "Facility code is required.",
          errors: [
            {
              fieldName: "facility",
              message: "Facility code is required.",
            },
          ],
          warnings: [],
        });
      }

      // --------------------------------------------------------
      // Validate Sale Order Code
      // --------------------------------------------------------
      if (!saleOrderCode || !String(saleOrderCode).trim()) {
        return res.status(400).json({
          successful: false,
          message: "Sale order code is required.",
          errors: [
            {
              fieldName: "saleOrderCode",
              message: "Sale order code is required.",
            },
          ],
          warnings: [],
        });
      }

      // --------------------------------------------------------
      // invoice is optional according to the docs.
      // But when supplied, it must be an object.
      // --------------------------------------------------------
      if (
        invoice !== undefined &&
        invoice !== null &&
        (typeof invoice !== "object" ||
          Array.isArray(invoice))
      ) {
        return res.status(400).json({
          successful: false,
          message: "invoice must be an object.",
          errors: [
            {
              fieldName: "invoice",
              message: "invoice must be an object.",
            },
          ],
          warnings: [],
        });
      }

      // --------------------------------------------------------
      // Build invoice object
      // --------------------------------------------------------
      const buildInvoice = (source) => {
        if (!source) {
          return undefined;
        }

        const result = {};

        // String fields
        const stringFields = [
          "code",
          "displayCode",
          "channelCode",
          "fromPartyCode",
          "toPartyCode",
          "destinationStateCode",
          "destinationCountryCode",
          "url",
        ];

        for (const field of stringFields) {
          if (
            source[field] !== undefined &&
            source[field] !== null &&
            String(source[field]).trim() !== ""
          ) {
            result[field] = String(
              source[field]
            ).trim();
          }
        }

        // Date
        if (
          source.channelCreated !== undefined &&
          source.channelCreated !== null &&
          String(source.channelCreated).trim() !== ""
        ) {
          result.channelCreated =
            source.channelCreated;
        }

        // Enum fields
        const allowedSources = [
          "SHIPPING_PACKAGE",
          "PURCHASE_ORDER",
          "GATEPASS",
        ];

        if (
          source.source !== undefined &&
          source.source !== null &&
          String(source.source).trim() !== ""
        ) {
          const value = String(
            source.source
          ).trim();

          if (!allowedSources.includes(value)) {
            throw new Error(
              `Invalid invoice.source. Allowed values: ${allowedSources.join(
                ", "
              )}`
            );
          }

          result.source = value;
        }

        const allowedTypes = [
          "SALE",
          "PURCHASE",
          "GATEPASS",
          "SALE_RETURN",
          "PURCHASE_RETURN",
          "GATEPASS_RETURN",
          "DELIVERY_CHALLAN",
        ];

        if (
          source.type !== undefined &&
          source.type !== null &&
          String(source.type).trim() !== ""
        ) {
          const value = String(
            source.type
          ).trim();

          if (!allowedTypes.includes(value)) {
            throw new Error(
              `Invalid invoice.type. Allowed values: ${allowedTypes.join(
                ", "
              )}`
            );
          }

          result.type = value;
        }

        // Preserve explicit booleans
        const booleanFields = [
          "productManagementSwitchedOff",
          "taxExempted",
          "cformProvided",
        ];

        for (const field of booleanFields) {
          if (typeof source[field] === "boolean") {
            result[field] = source[field];
          }
        }

        // ------------------------------------------------------
        // GST e-invoice
        // ------------------------------------------------------
        if (
          source.gstEinvoice &&
          typeof source.gstEinvoice === "object" &&
          !Array.isArray(source.gstEinvoice)
        ) {
          const gstEinvoice = {};

          const gstFields = [
            "irn",
            "ackNo",
            "ackDate",
            "signedInvoice",
            "signedQrCode",
          ];

          for (const field of gstFields) {
            if (
              source.gstEinvoice[field] !==
                undefined &&
              source.gstEinvoice[field] !==
                null &&
              String(
                source.gstEinvoice[field]
              ).trim() !== ""
            ) {
              gstEinvoice[field] = String(
                source.gstEinvoice[field]
              );
            }
          }

          if (
            Object.keys(gstEinvoice).length > 0
          ) {
            result.gstEinvoice = gstEinvoice;
          }
        }

        // ------------------------------------------------------
        // Invoice Items
        // ------------------------------------------------------
        if (Array.isArray(source.invoiceItems)) {
          result.invoiceItems =
            source.invoiceItems.map(
              (item, itemIndex) => {
                if (
                  !item ||
                  typeof item !== "object" ||
                  Array.isArray(item)
                ) {
                  throw new Error(
                    `invoiceItems[${itemIndex}] must be an object.`
                  );
                }

                const invoiceItem = {};

                // String fields
                const itemStringFields = [
                  "skuCode",
                  "bundleSkuCode",
                  "channelProductId",
                  "sellerSkuCode",
                  "additionalInfo",
                  "itemDetails",
                ];

                for (const field of itemStringFields) {
                  if (
                    item[field] !==
                      undefined &&
                    item[field] !== null &&
                    String(
                      item[field]
                    ).trim() !== ""
                  ) {
                    invoiceItem[field] =
                      String(
                        item[field]
                      ).trim();
                  }
                }

                // Sale order item codes
                if (
                  item.saleOrderItemCodes !==
                  undefined
                ) {
                  if (
                    !Array.isArray(
                      item.saleOrderItemCodes
                    )
                  ) {
                    throw new Error(
                      `invoiceItems[${itemIndex}].saleOrderItemCodes must be an array.`
                    );
                  }

                  const codes =
                    item.saleOrderItemCodes
                      .map((code) =>
                        String(
                          code ?? ""
                        ).trim()
                      )
                      .filter(Boolean);

                  if (codes.length > 0) {
                    invoiceItem.saleOrderItemCodes =
                      codes;
                  }
                }

                // ------------------------------------------------
                // Sale Order Items
                // ------------------------------------------------
                if (
                  item.saleOrderItems !==
                  undefined
                ) {
                  if (
                    !Array.isArray(
                      item.saleOrderItems
                    )
                  ) {
                    throw new Error(
                      `invoiceItems[${itemIndex}].saleOrderItems must be an array.`
                    );
                  }

                  invoiceItem.saleOrderItems =
                    item.saleOrderItems.map(
                      (
                        saleOrderItem,
                        soiIndex
                      ) => {
                        if (
                          !saleOrderItem ||
                          typeof saleOrderItem !==
                            "object" ||
                          Array.isArray(
                            saleOrderItem
                          )
                        ) {
                          throw new Error(
                            `invoiceItems[${itemIndex}].saleOrderItems[${soiIndex}] must be an object.`
                          );
                        }

                        const soi = {};

                        // code is mandatory when
                        // saleOrderItems is supplied
                        if (
                          !saleOrderItem.code ||
                          !String(
                            saleOrderItem.code
                          ).trim()
                        ) {
                          throw new Error(
                            `invoiceItems[${itemIndex}].saleOrderItems[${soiIndex}].code is required.`
                          );
                        }

                        soi.code =
                          String(
                            saleOrderItem.code
                          ).trim();

                        const soiStringFields = [
                          "status",
                          "shelfCode",
                          "reason",
                        ];

                        for (const field of soiStringFields) {
                          if (
                            saleOrderItem[
                              field
                            ] !== undefined &&
                            saleOrderItem[
                              field
                            ] !== null &&
                            String(
                              saleOrderItem[
                                field
                              ]
                            ).trim() !== ""
                          ) {
                            soi[field] =
                              String(
                                saleOrderItem[
                                  field
                                ]
                              ).trim();
                          }
                        }

                        return soi;
                      }
                    );
                }

                // ------------------------------------------------
                // Numeric invoice item fields
                // ------------------------------------------------
                const numericFields = [
                  "unitPrice",
                  "subtotal",
                  "discount",
                  "shippingCharges",
                  "cashOnDeliveryCharges",
                  "shippingMethodCharges",
                  "total",
                  "prepaidAmount",
                  "voucherValue",
                  "serviceTax",
                  "additionalTax",
                  "giftWrapCharges",
                  "storeCredit",
                  "quantity",
                ];

                for (const field of numericFields) {
                  if (
                    item[field] !==
                      undefined &&
                    item[field] !== null &&
                    item[field] !== ""
                  ) {
                    const value = Number(
                      item[field]
                    );

                    if (
                      !Number.isFinite(value)
                    ) {
                      throw new Error(
                        `invoiceItems[${itemIndex}].${field} must be a valid number.`
                      );
                    }

                    invoiceItem[field] =
                      value;
                  }
                }

                // ------------------------------------------------
                // taxPercentageDetail
                // ------------------------------------------------
                if (
                  item.taxPercentageDetail &&
                  typeof item.taxPercentageDetail ===
                    "object" &&
                  !Array.isArray(
                    item.taxPercentageDetail
                  )
                ) {
                  const tax =
                    item.taxPercentageDetail;

                  const taxDetail = {};

                  if (
                    tax.taxTypeCode !==
                      undefined &&
                    tax.taxTypeCode !==
                      null &&
                    String(
                      tax.taxTypeCode
                    ).trim() !== ""
                  ) {
                    taxDetail.taxTypeCode =
                      String(
                        tax.taxTypeCode
                      ).trim();
                  }

                  const taxNumericFields = [
                    "vat",
                    "cst",
                    "cstFormc",
                    "taxPercentage",
                    "serviceTax",
                    "additionalTax",
                    "centralGst",
                    "stateGst",
                    "unionTerritoryGst",
                    "integratedGst",
                    "compensationCess",
                  ];

                  for (const field of taxNumericFields) {
                    if (
                      tax[field] !==
                        undefined &&
                      tax[field] !== null &&
                      tax[field] !== ""
                    ) {
                      const value = Number(
                        tax[field]
                      );

                      if (
                        !Number.isFinite(
                          value
                        )
                      ) {
                        throw new Error(
                          `invoiceItems[${itemIndex}].taxPercentageDetail.${field} must be a valid number.`
                        );
                      }

                      taxDetail[field] =
                        value;
                    }
                  }

                  if (
                    Object.keys(taxDetail)
                      .length > 0
                  ) {
                    invoiceItem.taxPercentageDetail =
                      taxDetail;
                  }
                }

                // ------------------------------------------------
                // Invoice item custom fields
                // ------------------------------------------------
                if (
                  Array.isArray(
                    item.customFieldValues
                  )
                ) {
                  const customFields = [];

                  for (
                    const field of item.customFieldValues
                  ) {
                    if (
                      !field ||
                      typeof field !==
                        "object"
                    ) {
                      continue;
                    }

                    const name = String(
                      field.name ?? ""
                    ).trim();

                    if (!name) {
                      throw new Error(
                        `invoiceItems[${itemIndex}].customFieldValues.name is required.`
                      );
                    }

                    customFields.push({
                      name,
                      value:
                        field.value ===
                          undefined ||
                        field.value === null
                          ? ""
                          : String(
                              field.value
                            ),
                    });
                  }

                  if (
                    customFields.length > 0
                  ) {
                    invoiceItem.customFieldValues =
                      customFields;
                  }
                }

                // ------------------------------------------------
                // total is mandatory
                // quantity is mandatory
                // ------------------------------------------------
                if (
                  item.total === undefined ||
                  item.total === null ||
                  item.total === ""
                ) {
                  throw new Error(
                    `invoiceItems[${itemIndex}].total is required.`
                  );
                }

                if (
                  item.quantity ===
                    undefined ||
                  item.quantity === null ||
                  item.quantity === ""
                ) {
                  throw new Error(
                    `invoiceItems[${itemIndex}].quantity is required.`
                  );
                }

                return invoiceItem;
              }
            );
        }

        return result;
      };

      let invoicePayload;

      try {
        invoicePayload =
          buildInvoice(invoice);
      } catch (validationError) {
        return res.status(400).json({
          successful: false,
          message:
            validationError.message,
          errors: [
            {
              fieldName: "invoice",
              message:
                validationError.message,
            },
          ],
          warnings: [],
        });
      }

      // --------------------------------------------------------
      // Final Uniware payload
      // --------------------------------------------------------
      const payload = {
        saleOrderCode:
          String(saleOrderCode).trim(),
      };

      if (invoicePayload) {
        payload.invoice = invoicePayload;
      }

      if (
        shippingProviderCode !==
          undefined &&
        shippingProviderCode !== null &&
        String(shippingProviderCode).trim() !==
          ""
      ) {
        payload.shippingProviderCode =
          String(
            shippingProviderCode
          ).trim();
      }

      if (
        trackingNumber !== undefined &&
        trackingNumber !== null &&
        String(trackingNumber).trim() !== ""
      ) {
        payload.trackingNumber =
          String(trackingNumber).trim();
      }

      // --------------------------------------------------------
      // Call Uniware
      // --------------------------------------------------------
      const response = await axios.post(
        `${UNIWARE_BASE_URL}/services/rest/v1/createInvoiceWithDetails`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
            Facility: String(facility).trim(),
          },
        }
      );

      return res
        .status(response.status || 200)
        .json(response.data);
    } catch (error) {
      console.error(
        "Uniware Create Invoice With Details Error:",
        error.response?.data ||
          error.message
      );

      return res
        .status(
          error.response?.status || 500
        )
        .json(
          error.response?.data || {
            successful: false,
            message:
              error.message ||
              "Failed to create invoice with details.",
            errors: [],
            warnings: [],
          }
        );
    }
  }
);
app.post("/api/uniware/invoices/create-by-sale-order", async (req, res) => {
  try {
    const {
      facility,
      saleOrderCode,
      saleOrderItemCodes,
      commitBlockedInventory,
      taxInformation,
    } = req.body || {};

    if (!facility || !String(facility).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Facility is required.",
        errors: [
          {
            fieldName: "facility",
            message: "Facility is required.",
          },
        ],
        warnings: [],
      });
    }

    if (!saleOrderCode || !String(saleOrderCode).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Sale order code is required.",
        errors: [
          {
            fieldName: "saleOrderCode",
            message: "Sale order code is required.",
          },
        ],
        warnings: [],
      });
    }

    if (
      !Array.isArray(saleOrderItemCodes) ||
      saleOrderItemCodes.length === 0
    ) {
      return res.status(400).json({
        successful: false,
        message: "At least one sale order item code is required.",
        errors: [
          {
            fieldName: "saleOrderItemCodes",
            message: "At least one sale order item code is required.",
          },
        ],
        warnings: [],
      });
    }

    const itemCodes = saleOrderItemCodes
      .map((code) => String(code || "").trim())
      .filter(Boolean);

    if (itemCodes.length === 0) {
      return res.status(400).json({
        successful: false,
        message: "At least one valid sale order item code is required.",
        errors: [
          {
            fieldName: "saleOrderItemCodes",
            message: "At least one valid sale order item code is required.",
          },
        ],
        warnings: [],
      });
    }

    const payload = {
      saleOrderCode: String(saleOrderCode).trim(),
      saleOrderItemCodes: itemCodes,
    };

    if (typeof commitBlockedInventory === "boolean") {
      payload.commitBlockedInventory = commitBlockedInventory;
    }

    if (taxInformation && typeof taxInformation === "object") {
      if (
        Array.isArray(taxInformation.productTaxes) &&
        taxInformation.productTaxes.length > 0
      ) {
        const productTaxes = taxInformation.productTaxes.map((tax) => {
          const item = {};

          if (tax.channelProductId !== undefined) {
            item.channelProductId = String(tax.channelProductId).trim();
          }

          if (tax.additionalInfo !== undefined && String(tax.additionalInfo).trim()) {
            item.additionalInfo = String(tax.additionalInfo).trim();
          }

          const numericFields = [
            "taxPercentage",
            "centralGst",
            "stateGst",
            "unionTerritoryGst",
            "integratedGst",
            "compensationCess",
          ];

          numericFields.forEach((field) => {
            if (
              tax[field] !== undefined &&
              tax[field] !== null &&
              tax[field] !== ""
            ) {
              const value = Number(tax[field]);

              if (Number.isFinite(value)) {
                item[field] = value;
              }
            }
          });

          if (Array.isArray(tax.customFieldValues)) {
            const customFields = tax.customFieldValues
              .map((field) => {
                if (!field?.name || !String(field.name).trim()) {
                  return null;
                }

                const result = {
                  name: String(field.name).trim(),
                };

                if (
                  field.value !== undefined &&
                  field.value !== null &&
                  String(field.value).trim() !== ""
                ) {
                  result.value = String(field.value);
                }

                return result;
              })
              .filter(Boolean);

            if (customFields.length > 0) {
              item.customFieldValues = customFields;
            }
          }

          return item;
        });

        payload.taxInformation = {
          productTaxes,
        };
      }
    }

    const response = await axios.post(
      `${UNIWARE_BASE_URL}/services/rest/v1/invoice/createInvoiceBySaleOrderCode`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
          Facility: String(facility).trim(),
        },
      }
    );

    return res.status(response.status || 200).json(response.data);
  } catch (error) {
    console.error(
      "Uniware Create Invoice By Sale Order Error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json(
      error.response?.data || {
        successful: false,
        message: error.message || "Failed to create invoice.",
        errors: [],
        warnings: [],
      }
    );
  }
});
app.post(
  "/api/uniware/shipping-packages/create-invoice-label",
  async (req, res) => {
    try {
      const {
        facility,
        shippingPackageCode,
        generateUniwareShippingLabel,
      } = req.body || {};

      if (!facility || !String(facility).trim()) {
        return res.status(400).json({
          successful: false,
          message: "Facility is required.",
          errors: [
            {
              fieldName: "facility",
              message: "Facility is required.",
            },
          ],
          warnings: [],
        });
      }

      if (
        !shippingPackageCode ||
        !String(shippingPackageCode).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message: "Shipping package code is required.",
          errors: [
            {
              fieldName: "shippingPackageCode",
              message: "Shipping package code is required.",
            },
          ],
          warnings: [],
        });
      }

      if (typeof generateUniwareShippingLabel !== "boolean") {
        return res.status(400).json({
          successful: false,
          message:
            "generateUniwareShippingLabel must be a boolean.",
          errors: [
            {
              fieldName: "generateUniwareShippingLabel",
              message:
                "generateUniwareShippingLabel must be a boolean.",
            },
          ],
          warnings: [],
        });
      }

      const payload = {
        shippingPackageCode: String(
          shippingPackageCode
        ).trim(),
        generateUniwareShippingLabel,
      };

      const response = await axios.post(
        `${UNIWARE_BASE_URL}/services/rest/v1/oms/shippingPackage/createInvoiceAndGenerateLabel`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
            Facility: String(facility).trim(),
          },
        }
      );

      return res.status(response.status || 200).json(response.data);
    } catch (error) {
      console.error(
        "Uniware Create Invoice And Label Error:",
        error.response?.data || error.message
      );

      return res.status(error.response?.status || 500).json(
        error.response?.data || {
          successful: false,
          message:
            error.message ||
            "Failed to create invoice and generate label.",
          errors: [],
          warnings: [],
        }
      );
    }
  }
);
app.get("/api/uniware/invoices/pdf", async (req, res) => {
  try {
    const { facility, invoiceCodes } = req.query;

    if (!facility || !String(facility).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Facility is required.",
        errors: [
          {
            fieldName: "facility",
            message: "Facility is required.",
          },
        ],
        warnings: [],
      });
    }

    if (!invoiceCodes || !String(invoiceCodes).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Invoice code is required.",
        errors: [
          {
            fieldName: "invoiceCodes",
            message: "Invoice code is required.",
          },
        ],
        warnings: [],
      });
    }

    const invoiceCode = String(invoiceCodes).trim();

    const response = await axios.get(
      `${UNIWARE_BASE_URL}/services/rest/v1/oms/invoice/show`,
      {
        params: {
          invoiceCodes: invoiceCode,
        },
        headers: {
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
          Facility: String(facility).trim(),
        },
        responseType: "arraybuffer",
      }
    );

    res.status(response.status || 200);

    res.set({
      "Content-Type":
        response.headers["content-type"] ||
        "application/pdf",
      "Content-Disposition": `inline; filename="${invoiceCode}.pdf"`,
    });

    return res.send(response.data);
  } catch (error) {
    console.error(
      "Uniware Get Invoice PDF Error:",
      error.response?.data || error.message
    );

    const statusCode = error.response?.status || 500;

    // Uniware errors may come back as JSON instead of PDF.
    if (error.response?.data) {
      try {
        const contentType =
          error.response.headers?.["content-type"] || "";

        if (contentType.includes("application/json")) {
          const errorText = Buffer.from(
            error.response.data
          ).toString("utf8");

          return res
            .status(statusCode)
            .type("application/json")
            .send(errorText);
        }
      } catch {
        // Fall through to generic error response.
      }
    }

    return res.status(statusCode).json({
      successful: false,
      message:
        error.message ||
        "Failed to fetch invoice PDF.",
      errors: [],
      warnings: [],
    });
  }
});
// ============================================================
// UNIWARE - GET INVOICE LABEL
// POST /services/rest/v1/oms/shippingPackage/getInvoiceLabel
// ============================================================

app.post("/api/uniware/shipping-packages/get-invoice-label", async (req, res) => {
  try {
    const { facility, shippingPackageCode } = req.body || {};

    if (!facility || !String(facility).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Facility code is required.",
      });
    }

    if (
      !shippingPackageCode ||
      !String(shippingPackageCode).trim()
    ) {
      return res.status(400).json({
        successful: false,
        message: "Shipping package code is required.",
      });
    }

    const payload = {
      shippingPackageCode: String(shippingPackageCode).trim(),
    };

    const response = await axios.post(
      `${UNIWARE_BASE_URL}/services/rest/v1/oms/shippingPackage/getInvoiceLabel`,
      payload,
      {
        headers: {
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          Facility: String(facility).trim(),
        },
      }
    );

    const data = response.data || {};

    return res.status(response.status || 200).json(data);
  } catch (error) {
    console.error(
      "Uniware Get Invoice Label Error:",
      error.response?.data || error.message
    );

    if (error.response) {
      return res.status(error.response.status || 500).json(
        error.response.data || {
          successful: false,
          message: "Uniware returned an error.",
        }
      );
    }

    return res.status(500).json({
      successful: false,
      message: error.message || "Failed to get invoice label.",
    });
  }
});
// ============================================================
// UNIWARE - GET SHIPPING LABEL PDF
// GET /services/rest/v1/oms/shipment/show
// ============================================================

app.get("/api/uniware/shipping-packages/shipping-label-pdf", async (req, res) => {
  try {
    const { facility, shippingPackageCodes } = req.query;

    if (!facility || !String(facility).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Facility code is required.",
      });
    }

    if (
      !shippingPackageCodes ||
      !String(shippingPackageCodes).trim()
    ) {
      return res.status(400).json({
        successful: false,
        message: "Shipping package code is required.",
      });
    }

    const shippingPackageCode = String(shippingPackageCodes).trim();

    const response = await axios.get(
      `${UNIWARE_BASE_URL}/services/rest/v1/oms/shipment/show`,
      {
        params: {
          shippingPackageCodes: shippingPackageCode,
        },
        headers: {
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          Facility: String(facility).trim(),
        },
        responseType: "arraybuffer",
      }
    );

    res.set({
      "Content-Type":
        response.headers["content-type"] || "application/pdf",
      "Content-Disposition": `inline; filename="${shippingPackageCode}-shipping-label.pdf"`,
    });

    return res.send(response.data);
  } catch (error) {
    console.error(
      "Uniware Get Shipping Label PDF Error:",
      error.response?.data || error.message
    );

    const contentType =
      error.response?.headers?.["content-type"] || "";

    // If Uniware returned JSON error data
    if (
      error.response?.data &&
      contentType.includes("application/json")
    ) {
      let errorData = error.response.data;

      try {
        if (Buffer.isBuffer(errorData)) {
          errorData = JSON.parse(errorData.toString("utf8"));
        } else if (typeof errorData === "string") {
          errorData = JSON.parse(errorData);
        }
      } catch {
        // Keep original errorData
      }

      return res.status(error.response.status || 500).json(
        errorData || {
          successful: false,
          message: "Uniware returned an error.",
        }
      );
    }

    return res.status(error.response?.status || 500).json({
      successful: false,
      message:
        error.message || "Failed to get shipping label PDF.",
    });
  }
});
// ============================================================
// UNIWARE - CHECK SERVICEABILITY
// POST /services/rest/v1/oms/saleOrder/getServiceability
// Level: Tenant
// ============================================================

app.post("/api/uniware/sale-orders/serviceability", async (req, res) => {
  try {
    const { pincode, cashOnDelivery } = req.body || {};

    // --------------------------------------------------------
    // Validate pincode
    // --------------------------------------------------------
    if (!pincode || !String(pincode).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Pincode is required.",
      });
    }

    const normalizedPincode = String(pincode).trim();

    if (!/^\d{6,}$/.test(normalizedPincode)) {
      return res.status(400).json({
        successful: false,
        message: "Pincode must contain at least 6 digits.",
      });
    }

    // --------------------------------------------------------
    // Validate cashOnDelivery
    // --------------------------------------------------------
    if (typeof cashOnDelivery !== "boolean") {
      return res.status(400).json({
        successful: false,
        message: "cashOnDelivery must be a boolean.",
      });
    }

    // --------------------------------------------------------
    // Uniware request payload
    // --------------------------------------------------------
    const payload = {
      pincode: normalizedPincode,
      cashOnDelivery,
    };

    const response = await axios.post(
      `${UNIWARE_BASE_URL}/services/rest/v1/oms/saleOrder/getServiceability`,
      payload,
      {
        headers: {
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(response.status || 200).json(
      response.data || {}
    );
  } catch (error) {
    console.error(
      "Uniware Check Serviceability Error:",
      error.response?.data || error.message
    );

    if (error.response) {
      return res.status(error.response.status || 500).json(
        error.response.data || {
          successful: false,
          message: "Uniware returned an error.",
        }
      );
    }

    return res.status(500).json({
      successful: false,
      message:
        error.message || "Failed to check serviceability.",
    });
  }
});
// ============================================================
// UNIWARE - CREATE INVOICE AND ALLOCATE SHIPPING PROVIDER
// POST /services/rest/v1/oms/shippingPackage/
//      createInvoiceAndAllocateShippingProvider
// ============================================================

app.post(
  "/api/uniware/shipping-packages/create-invoice-allocate-provider",
  async (req, res) => {
    try {
      const {
        shippingPackageCode,
        gstEinvoice,
        taxInformation,
        fetchInvoiceDetail,
      } = req.body || {};

      // --------------------------------------------------------
      // Validate shipping package code
      // --------------------------------------------------------
      if (
        !shippingPackageCode ||
        !String(shippingPackageCode).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message: "Shipping package code is required.",
        });
      }

      // --------------------------------------------------------
      // gstEinvoice is mandatory according to Uniware docs
      // --------------------------------------------------------
      if (
        !gstEinvoice ||
        typeof gstEinvoice !== "object" ||
        Array.isArray(gstEinvoice)
      ) {
        return res.status(400).json({
          successful: false,
          message: "gstEinvoice is required.",
        });
      }

      const requiredGstFields = [
        "irn",
        "ackNo",
        "ackDate",
        "signedInvoice",
        "signedQrCode",
      ];

      const missingGstFields = requiredGstFields.filter(
        (field) =>
          gstEinvoice[field] === undefined ||
          gstEinvoice[field] === null ||
          String(gstEinvoice[field]).trim() === ""
      );

      if (missingGstFields.length > 0) {
        return res.status(400).json({
          successful: false,
          message:
            "The following gstEinvoice fields are required.",
          missingFields: missingGstFields,
        });
      }

      // --------------------------------------------------------
      // Build GST e-invoice
      // --------------------------------------------------------
      const normalizedGstEinvoice = {
        irn: String(gstEinvoice.irn).trim(),
        ackNo: String(gstEinvoice.ackNo).trim(),
        ackDate: String(gstEinvoice.ackDate).trim(),
        signedInvoice: String(gstEinvoice.signedInvoice).trim(),
        signedQrCode: String(gstEinvoice.signedQrCode).trim(),
      };

      // --------------------------------------------------------
      // Build payload
      // --------------------------------------------------------
      const payload = {
        shippingPackageCode:
          String(shippingPackageCode).trim(),

        gstEinvoice: normalizedGstEinvoice,
      };

      // --------------------------------------------------------
      // Optional tax information
      // --------------------------------------------------------
      if (
        taxInformation &&
        typeof taxInformation === "object" &&
        !Array.isArray(taxInformation)
      ) {
        if (
          taxInformation.productTaxes !== undefined &&
          !Array.isArray(taxInformation.productTaxes)
        ) {
          return res.status(400).json({
            successful: false,
            message: "taxInformation.productTaxes must be an array.",
          });
        }

        payload.taxInformation = {
          productTaxes:
            Array.isArray(taxInformation.productTaxes)
              ? taxInformation.productTaxes.map((tax) => {
                  const normalizedTax = {};

                  if (
                    tax.channelProductId !== undefined &&
                    tax.channelProductId !== null &&
                    String(tax.channelProductId).trim() !== ""
                  ) {
                    normalizedTax.channelProductId =
                      String(tax.channelProductId).trim();
                  }

                  if (
                    tax.additionalInfo !== undefined &&
                    tax.additionalInfo !== null &&
                    String(tax.additionalInfo).trim() !== ""
                  ) {
                    normalizedTax.additionalInfo =
                      String(tax.additionalInfo).trim();
                  }

                  if (
                    tax.taxPercentage !== undefined &&
                    tax.taxPercentage !== null &&
                    tax.taxPercentage !== ""
                  ) {
                    normalizedTax.taxPercentage =
                      Number(tax.taxPercentage);
                  }

                  if (
                    tax.centralGst !== undefined &&
                    tax.centralGst !== null &&
                    tax.centralGst !== ""
                  ) {
                    normalizedTax.centralGst =
                      Number(tax.centralGst);
                  }

                  if (
                    tax.stateGst !== undefined &&
                    tax.stateGst !== null &&
                    tax.stateGst !== ""
                  ) {
                    normalizedTax.stateGst =
                      Number(tax.stateGst);
                  }

                  if (
                    tax.unionTerritoryGst !== undefined &&
                    tax.unionTerritoryGst !== null &&
                    tax.unionTerritoryGst !== ""
                  ) {
                    normalizedTax.unionTerritoryGst =
                      Number(tax.unionTerritoryGst);
                  }

                  if (
                    tax.integratedGst !== undefined &&
                    tax.integratedGst !== null &&
                    tax.integratedGst !== ""
                  ) {
                    normalizedTax.integratedGst =
                      Number(tax.integratedGst);
                  }

                  if (
                    tax.compensationCess !== undefined &&
                    tax.compensationCess !== null &&
                    tax.compensationCess !== ""
                  ) {
                    normalizedTax.compensationCess =
                      Number(tax.compensationCess);
                  }

                  if (Array.isArray(tax.customFieldValues)) {
                    normalizedTax.customFieldValues =
                      tax.customFieldValues
                        .filter(
                          (field) =>
                            field &&
                            field.name !== undefined &&
                            String(field.name).trim() !== ""
                        )
                        .map((field) => ({
                          name: String(field.name).trim(),
                          ...(field.value !== undefined &&
                          field.value !== null
                            ? {
                                value: String(field.value),
                              }
                            : {}),
                        }));
                  }

                  return normalizedTax;
                })
              : [],
        };
      }

      // --------------------------------------------------------
      // Optional fetchInvoiceDetail
      // Preserve explicit false.
      // --------------------------------------------------------
      if (typeof fetchInvoiceDetail === "boolean") {
        payload.fetchInvoiceDetail = fetchInvoiceDetail;
      }

      // --------------------------------------------------------
      // Call Uniware
      // --------------------------------------------------------
      const response = await axios.post(
        `${UNIWARE_BASE_URL}/services/rest/v1/oms/shippingPackage/createInvoiceAndAllocateShippingProvider`,
        payload,
        {
          headers: {
            Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      return res.status(response.status || 200).json(
        response.data || {}
      );
    } catch (error) {
      console.error(
        "Uniware Create Invoice & Allocate Shipping Provider Error:",
        error.response?.data || error.message
      );

      if (error.response) {
        return res
          .status(error.response.status || 500)
          .json(
            error.response.data || {
              successful: false,
              message: "Uniware returned an error.",
            }
          );
      }

      return res.status(500).json({
        successful: false,
        message:
          error.message ||
          "Failed to create invoice and allocate shipping provider.",
      });
    }
  }
);
// ============================================================
// Uniware - Allocate Shipping Provider
// POST /services/rest/v1/oms/shippingPackage/allocateShippingProvider
// Facility-level API
// ============================================================

app.post("/api/uniware/shipping-packages/allocate-provider", async (req, res) => {
  try {
    const {
      facility,
      shippingPackageCode,
      shippingLabelMandatory,
      shippingProviderCode,
      shippingCourier,
      trackingNumber,
      trackingLink,
      generateUniwareShippingLabel,
    } = req.body;

    // ----------------------------------------------------------
    // Validation
    // ----------------------------------------------------------
    if (!facility || !String(facility).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Facility is required.",
      });
    }

    if (
      !shippingPackageCode ||
      !String(shippingPackageCode).trim()
    ) {
      return res.status(400).json({
        successful: false,
        message: "Shipping Package Code is required.",
      });
    }

    // ----------------------------------------------------------
    // Build payload dynamically.
    // Do not send optional empty strings.
    // Preserve explicit false values.
    // ----------------------------------------------------------
    const payload = {
      shippingPackageCode: String(shippingPackageCode).trim(),
    };

    if (shippingLabelMandatory !== undefined && shippingLabelMandatory !== null) {
      payload.shippingLabelMandatory = Boolean(shippingLabelMandatory);
    }

    if (
      shippingProviderCode !== undefined &&
      shippingProviderCode !== null &&
      String(shippingProviderCode).trim()
    ) {
      payload.shippingProviderCode = String(shippingProviderCode).trim();
    }

    if (
      shippingCourier !== undefined &&
      shippingCourier !== null &&
      String(shippingCourier).trim()
    ) {
      payload.shippingCourier = String(shippingCourier).trim();
    }

    if (
      trackingNumber !== undefined &&
      trackingNumber !== null &&
      String(trackingNumber).trim()
    ) {
      payload.trackingNumber = String(trackingNumber).trim();
    }

    if (
      trackingLink !== undefined &&
      trackingLink !== null &&
      String(trackingLink).trim()
    ) {
      payload.trackingLink = String(trackingLink).trim();
    }

    if (
      generateUniwareShippingLabel !== undefined &&
      generateUniwareShippingLabel !== null
    ) {
      payload.generateUniwareShippingLabel = Boolean(
        generateUniwareShippingLabel
      );
    }

    // ----------------------------------------------------------
    // Uniware API call
    // ----------------------------------------------------------
    const response = await axios.post(
      `${UNIWARE_BASE_URL}/services/rest/v1/oms/shippingPackage/allocateShippingProvider`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
          Facility: String(facility).trim(),
        },
      }
    );

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error(
      "Uniware Allocate Shipping Provider Error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json(
      error.response?.data || {
        successful: false,
        message: error.message || "Failed to allocate shipping provider.",
      }
    );
  }
});
// ============================================================
// Uniware - Create Shipping Manifest
// POST /services/rest/v1/oms/shippingManifest/create
// Tenant-level API
// ============================================================

app.post("/api/uniware/shipping-manifests/create", async (req, res) => {
  try {
    const {
      channel,
      shippingProviderCode,
      shippingProviderName,
      shippingMethodCode,
      comments,
      thirdPartyShipping,
      customFieldValues,
      shippingProviderIsAggregator,
      shippingCourier,
    } = req.body;

    // ----------------------------------------------------------
    // Validation
    // ----------------------------------------------------------
    if (!channel || !String(channel).trim()) {
      return res.status(400).json({
        successful: false,
        message: "Channel is required.",
      });
    }

    if (thirdPartyShipping === undefined || thirdPartyShipping === null) {
      return res.status(400).json({
        successful: false,
        message: "thirdPartyShipping is required.",
      });
    }

    // ----------------------------------------------------------
    // Build Uniware payload
    // Optional empty values are omitted.
    // Explicit false values are preserved.
    // ----------------------------------------------------------
    const payload = {
      channel: String(channel).trim(),
      thirdPartyShipping: Boolean(thirdPartyShipping),
    };

    if (
      shippingProviderCode !== undefined &&
      shippingProviderCode !== null &&
      String(shippingProviderCode).trim()
    ) {
      payload.shippingProviderCode =
        String(shippingProviderCode).trim();
    }

    if (
      shippingProviderName !== undefined &&
      shippingProviderName !== null &&
      String(shippingProviderName).trim()
    ) {
      payload.shippingProviderName =
        String(shippingProviderName).trim();
    }

    if (
      shippingMethodCode !== undefined &&
      shippingMethodCode !== null &&
      String(shippingMethodCode).trim()
    ) {
      payload.shippingMethodCode =
        String(shippingMethodCode).trim();
    }

    if (
      comments !== undefined &&
      comments !== null &&
      String(comments).trim()
    ) {
      payload.comments = String(comments).trim();
    }

    // ----------------------------------------------------------
    // Custom fields
    // ----------------------------------------------------------
    if (Array.isArray(customFieldValues) && customFieldValues.length > 0) {
      const cleanedCustomFields = customFieldValues
        .filter(
          (field) =>
            field &&
            field.name !== undefined &&
            field.name !== null &&
            String(field.name).trim()
        )
        .map((field) => {
          const item = {
            name: String(field.name).trim(),
          };

          if (
            field.value !== undefined &&
            field.value !== null
          ) {
            item.value = String(field.value);
          }

          return item;
        });

      if (cleanedCustomFields.length > 0) {
        payload.customFieldValues = cleanedCustomFields;
      }
    }

    // ----------------------------------------------------------
    // Aggregator flag
    // ----------------------------------------------------------
    if (
      shippingProviderIsAggregator !== undefined &&
      shippingProviderIsAggregator !== null
    ) {
      payload.shippingProviderIsAggregator = Boolean(
        shippingProviderIsAggregator
      );
    }

    // ----------------------------------------------------------
    // Courier
    // Relevant when provider is an aggregator.
    // ----------------------------------------------------------
    if (
      shippingCourier !== undefined &&
      shippingCourier !== null &&
      String(shippingCourier).trim()
    ) {
      payload.shippingCourier =
        String(shippingCourier).trim();
    }

    // ----------------------------------------------------------
    // Uniware API
    // Tenant-level => NO Facility header
    // ----------------------------------------------------------
    const response = await axios.post(
      `${UNIWARE_BASE_URL}/services/rest/v1/oms/shippingManifest/create`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
        },
      }
    );

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error(
      "Uniware Create Shipping Manifest Error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json(
      error.response?.data || {
        successful: false,
        message:
          error.message ||
          "Failed to create shipping manifest.",
      }
    );
  }
});
// ============================================================
// Uniware - Add Shipping Package to Manifest
// POST /services/rest/v1/oms/shippingManifest/addShippingPackage
// Tenant-level API
// ============================================================

app.post(
  "/api/uniware/shipping-manifests/add-shipping-package",
  async (req, res) => {
    try {
      const {
        shippingManifestCode,
        shippingPackageCodes,
      } = req.body;

      // --------------------------------------------------------
      // Validation
      // --------------------------------------------------------
      if (
        !shippingManifestCode ||
        !String(shippingManifestCode).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message: "Shipping Manifest Code is required.",
        });
      }

      if (!Array.isArray(shippingPackageCodes)) {
        return res.status(400).json({
          successful: false,
          message: "shippingPackageCodes must be an array.",
        });
      }

      const cleanedShippingPackageCodes =
        shippingPackageCodes
          .filter(
            (code) =>
              code !== undefined &&
              code !== null &&
              String(code).trim()
          )
          .map((code) => String(code).trim());

      if (cleanedShippingPackageCodes.length === 0) {
        return res.status(400).json({
          successful: false,
          message:
            "At least one Shipping Package Code is required.",
        });
      }

      // --------------------------------------------------------
      // Uniware payload
      // --------------------------------------------------------
      const payload = {
        shippingManifestCode:
          String(shippingManifestCode).trim(),

        shippingPackageCodes:
          cleanedShippingPackageCodes,
      };

      // --------------------------------------------------------
      // Uniware API
      // Tenant-level => NO Facility header
      // --------------------------------------------------------
      const response = await axios.post(
        `${UNIWARE_BASE_URL}/services/rest/v1/oms/shippingManifest/addShippingPackage`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
          },
        }
      );

      return res.status(response.status).json(response.data);
    } catch (error) {
      console.error(
        "Uniware Add Shipping Package to Manifest Error:",
        error.response?.data || error.message
      );

      return res.status(error.response?.status || 500).json(
        error.response?.data || {
          successful: false,
          message:
            error.message ||
            "Failed to add shipping package(s) to manifest.",
        }
      );
    }
  }
);
// ============================================================
// Uniware - Create and Complete Shipping Manifest
// POST /services/rest/v1/oms/shippingManifest/createclose
// Facility-level API
// ============================================================

app.post(
  "/api/uniware/shipping-manifests/create-complete",
  async (req, res) => {
    try {
      const {
        facility,
        channel,
        shippingProviderCode,
        shippingProviderName,
        shippingMethodCode,
        comments,
        thirdPartyShipping,
        customFieldValues,
        shippingPackageCodes,
        shippingProviderIsAggregator,
        shippingCourier,
      } = req.body;

      // --------------------------------------------------------
      // Facility validation
      // --------------------------------------------------------
      if (!facility || !String(facility).trim()) {
        return res.status(400).json({
          successful: false,
          message: "Facility is required.",
        });
      }

      // --------------------------------------------------------
      // Channel is optional according to the API table
      // --------------------------------------------------------

      // --------------------------------------------------------
      // Shipping package codes
      // --------------------------------------------------------
      if (
        shippingPackageCodes !== undefined &&
        shippingPackageCodes !== null
      ) {
        if (!Array.isArray(shippingPackageCodes)) {
          return res.status(400).json({
            successful: false,
            message: "shippingPackageCodes must be an array.",
          });
        }
      }

      // --------------------------------------------------------
      // Clean package codes
      // --------------------------------------------------------
      const cleanedShippingPackageCodes =
        Array.isArray(shippingPackageCodes)
          ? shippingPackageCodes
              .filter(
                (code) =>
                  code !== undefined &&
                  code !== null &&
                  String(code).trim()
              )
              .map((code) => String(code).trim())
          : undefined;

      // --------------------------------------------------------
      // Build payload dynamically.
      // Do not send empty optional values.
      // Preserve explicit false values.
      // --------------------------------------------------------
      const payload = {};

      if (channel !== undefined && channel !== null) {
        const value = String(channel).trim();

        if (value) {
          payload.channel = value;
        }
      }

      if (
        shippingProviderCode !== undefined &&
        shippingProviderCode !== null
      ) {
        const value =
          String(shippingProviderCode).trim();

        if (value) {
          payload.shippingProviderCode = value;
        }
      }

      if (
        shippingProviderName !== undefined &&
        shippingProviderName !== null
      ) {
        const value =
          String(shippingProviderName).trim();

        if (value) {
          payload.shippingProviderName = value;
        }
      }

      if (
        shippingMethodCode !== undefined &&
        shippingMethodCode !== null
      ) {
        const value =
          String(shippingMethodCode).trim();

        if (value) {
          payload.shippingMethodCode = value;
        }
      }

      if (
        comments !== undefined &&
        comments !== null
      ) {
        const value = String(comments);

        if (value.trim()) {
          payload.comments = value;
        }
      }

      // Important:
      // false must NOT be removed.
      if (thirdPartyShipping !== undefined) {
        payload.thirdPartyShipping =
          Boolean(thirdPartyShipping);
      }

      if (Array.isArray(customFieldValues)) {
        const cleanedCustomFields =
          customFieldValues
            .filter(
              (field) =>
                field &&
                field.name !== undefined &&
                String(field.name).trim()
            )
            .map((field) => ({
              name: String(field.name).trim(),
              ...(field.value !== undefined &&
              field.value !== null
                ? {
                    value: String(field.value),
                  }
                : {}),
            }));

        if (cleanedCustomFields.length > 0) {
          payload.customFieldValues =
            cleanedCustomFields;
        }
      }

      if (
        Array.isArray(cleanedShippingPackageCodes) &&
        cleanedShippingPackageCodes.length > 0
      ) {
        payload.shippingPackageCodes =
          cleanedShippingPackageCodes;
      }

      // Important:
      // false must NOT be removed.
      if (
        shippingProviderIsAggregator !== undefined
      ) {
        payload.shippingProviderIsAggregator =
          Boolean(shippingProviderIsAggregator);
      }

      if (
        shippingCourier !== undefined &&
        shippingCourier !== null
      ) {
        const value =
          String(shippingCourier).trim();

        if (value) {
          payload.shippingCourier = value;
        }
      }

      // --------------------------------------------------------
      // Uniware API
      // --------------------------------------------------------
      const response = await axios.post(
        `${UNIWARE_BASE_URL}/services/rest/v1/oms/shippingManifest/createclose`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
            Facility: String(facility).trim(),
          },
        }
      );

      return res.status(response.status).json(
        response.data
      );
    } catch (error) {
      console.error(
        "Uniware Create and Complete Manifest Error:",
        error.response?.data || error.message
      );

      return res.status(
        error.response?.status || 500
      ).json(
        error.response?.data || {
          successful: false,
          message:
            error.message ||
            "Failed to create and complete shipping manifest.",
        }
      );
    }
  }
);
// ============================================================
// Uniware - Close Shipping Manifest
// POST /services/rest/v1/oms/shippingManifest/close
// Tenant-level API
// ============================================================

app.post(
  "/api/uniware/shipping-manifests/close",
  async (req, res) => {
    try {
      const { shippingManifestCode } =
        req.body;

      // --------------------------------------------------------
      // Validation
      // --------------------------------------------------------
      if (
        !shippingManifestCode ||
        !String(shippingManifestCode).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "shippingManifestCode is required.",
        });
      }

      const payload = {
        shippingManifestCode:
          String(shippingManifestCode).trim(),
      };

      // --------------------------------------------------------
      // Call Uniware
      // Tenant-level API:
      // NO Facility header
      // --------------------------------------------------------
      const response = await axios.post(
        `${UNIWARE_BASE_URL}/services/rest/v1/oms/shippingManifest/close`,
        payload,
        {
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
          },
        }
      );

      return res.status(response.status).json(
        response.data
      );
    } catch (error) {
      console.error(
        "Uniware Close Shipping Manifest Error:",
        error.response?.data ||
          error.message
      );

      return res.status(
        error.response?.status || 500
      ).json(
        error.response?.data || {
          successful: false,
          message:
            error.message ||
            "Failed to close shipping manifest.",
        }
      );
    }
  }
);
// ============================================================
// Uniware - Get Shipping Manifest
// POST /services/rest/v1/oms/shippingManifest/get
// Facility-level API
// ============================================================

app.post(
  "/api/uniware/shipping-manifests/get",
  async (req, res) => {
    try {
      const {
        facility,
        shippingManifestCode,
      } = req.body;

      // --------------------------------------------------------
      // Validate Facility
      // --------------------------------------------------------
      if (
        !facility ||
        !String(facility).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message: "Facility is required.",
        });
      }

      // --------------------------------------------------------
      // Validate Manifest Code
      // --------------------------------------------------------
      if (
        !shippingManifestCode ||
        !String(shippingManifestCode).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "shippingManifestCode is required.",
        });
      }

      const payload = {
        shippingManifestCode:
          String(
            shippingManifestCode
          ).trim(),
      };

      // --------------------------------------------------------
      // Uniware API
      // Facility header is required
      // --------------------------------------------------------
      const response = await axios.post(
        `${UNIWARE_BASE_URL}/services/rest/v1/oms/shippingManifest/get`,
        payload,
        {
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
            Facility:
              String(facility).trim(),
          },
        }
      );

      return res
        .status(response.status)
        .json(response.data);
    } catch (error) {
      console.error(
        "Uniware Get Shipping Manifest Error:",
        error.response?.data ||
          error.message
      );

      return res.status(
        error.response?.status || 500
      ).json(
        error.response?.data || {
          successful: false,
          message:
            error.message ||
            "Failed to get shipping manifest.",
        }
      );
    }
  }
);
// ============================================================
// Uniware - Mark Dispatched Shipping Package
// POST /services/rest/v1/oms/shippingPackage/dispatch
// Facility-level API
// ============================================================

app.post(
  "/api/uniware/shipping-packages/dispatch",
  async (req, res) => {
    try {
      const {
        facility,
        shippingPackageCode,
      } = req.body;

      // --------------------------------------------------------
      // Validate Facility
      // --------------------------------------------------------
      if (
        !facility ||
        !String(facility).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message: "Facility is required.",
        });
      }

      // --------------------------------------------------------
      // Validate Shipping Package Code
      // --------------------------------------------------------
      if (
        !shippingPackageCode ||
        !String(shippingPackageCode).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "shippingPackageCode is required.",
        });
      }

      // --------------------------------------------------------
      // Uniware request payload
      // --------------------------------------------------------
      const payload = {
        shippingPackageCode:
          String(
            shippingPackageCode
          ).trim(),
      };

      // --------------------------------------------------------
      // Call Uniware
      // --------------------------------------------------------
      const response = await axios.post(
        `${UNIWARE_BASE_URL}/services/rest/v1/oms/shippingPackage/dispatch`,
        payload,
        {
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
            Facility:
              String(facility).trim(),
          },
        }
      );

      return res
        .status(response.status)
        .json(response.data);
    } catch (error) {
      console.error(
        "Uniware Mark Dispatched Shipping Package Error:",
        error.response?.data ||
          error.message
      );

      return res.status(
        error.response?.status || 500
      ).json(
        error.response?.data || {
          successful: false,
          message:
            error.message ||
            "Failed to mark shipping package as dispatched.",
        }
      );
    }
  }
);
// ============================================================
// Uniware - Force Dispatch Shipping Package
// POST /services/rest/v1/oms/shippingPackage/forceDispatch
// Facility-level API
// ============================================================

app.post(
  "/api/uniware/shipping-packages/force-dispatch",
  async (req, res) => {
    try {
      const {
        facility,
        shippingPackageCode,
        shippingProviderCode,
        trackingNumber,
        skipDetailing,
        skipChannelInvoicing,
        invoiceCode,
        channelProductIdToTax,
      } = req.body;

      // --------------------------------------------------------
      // Validate Facility
      // --------------------------------------------------------

      if (
        !facility ||
        !String(facility).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message: "Facility is required.",
        });
      }

      // --------------------------------------------------------
      // Validate Shipping Package Code
      // --------------------------------------------------------

      if (
        !shippingPackageCode ||
        !String(shippingPackageCode).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "shippingPackageCode is required.",
        });
      }

      // --------------------------------------------------------
      // Build Uniware payload dynamically
      // --------------------------------------------------------

      const payload = {
        shippingPackageCode:
          String(
            shippingPackageCode
          ).trim(),
      };

      // Optional string fields
      if (
        shippingProviderCode !==
          undefined &&
        shippingProviderCode !==
          null &&
        String(
          shippingProviderCode
        ).trim()
      ) {
        payload.shippingProviderCode =
          String(
            shippingProviderCode
          ).trim();
      }

      if (
        trackingNumber !==
          undefined &&
        trackingNumber !== null &&
        String(trackingNumber).trim()
      ) {
        payload.trackingNumber =
          String(
            trackingNumber
          ).trim();
      }

      if (
        invoiceCode !== undefined &&
        invoiceCode !== null &&
        String(invoiceCode).trim()
      ) {
        payload.invoiceCode =
          String(
            invoiceCode
          ).trim();
      }

      // --------------------------------------------------------
      // Boolean fields
      //
      // Preserve explicit false.
      // --------------------------------------------------------

      if (
        skipDetailing !==
        undefined
      ) {
        payload.skipDetailing =
          Boolean(skipDetailing);
      }

      if (
        skipChannelInvoicing !==
        undefined
      ) {
        payload.skipChannelInvoicing =
          Boolean(
            skipChannelInvoicing
          );
      }

      // --------------------------------------------------------
      // Optional channelProductIdToTax
      // --------------------------------------------------------

      if (
        channelProductIdToTax !==
          undefined &&
        channelProductIdToTax !==
          null
      ) {
        if (
          typeof channelProductIdToTax !==
          "object"
        ) {
          return res.status(400).json({
            successful: false,
            message:
              "channelProductIdToTax must be an object.",
          });
        }

        payload.channelProductIdToTax =
          channelProductIdToTax;
      }

      // --------------------------------------------------------
      // Call Uniware
      // --------------------------------------------------------

      const response = await axios.post(
        `${UNIWARE_BASE_URL}/services/rest/v1/oms/shippingPackage/forceDispatch`,
        payload,
        {
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
            Facility:
              String(facility).trim(),
          },
        }
      );

      return res
        .status(response.status)
        .json(response.data);
    } catch (error) {
      console.error(
        "Uniware Force Dispatch Shipping Package Error:",
        error.response?.data ||
          error.message
      );

      return res.status(
        error.response?.status || 500
      ).json(
        error.response?.data || {
          successful: false,
          message:
            error.message ||
            "Failed to force dispatch shipping package.",
        }
      );
    }
  }
);
// ============================================================
// Uniware - Shipment Create and Mark Dispatched
// POST /services/rest/v1/oms/shippingPackage/
//      createAndDispatchBySaleOrderItemCode
// Facility-level API
// ============================================================

app.post(
  "/api/uniware/shipping-packages/create-and-dispatch",
  async (req, res) => {
    try {
      const {
        facility,
        saleOrderCode,
        saleOrderItemInfo,
        shippingPackageInfo,
        invoiceInfo,
      } = req.body;

      // --------------------------------------------------------
      // Validate Facility
      // --------------------------------------------------------

      if (
        !facility ||
        !String(facility).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message: "Facility is required.",
        });
      }

      // --------------------------------------------------------
      // Validate Sale Order Code
      // --------------------------------------------------------

      if (
        !saleOrderCode ||
        !String(saleOrderCode).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "saleOrderCode is required.",
        });
      }

      // --------------------------------------------------------
      // Validate Sale Order Item Info
      // --------------------------------------------------------

      if (
        !saleOrderItemInfo ||
        typeof saleOrderItemInfo !== "object"
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "saleOrderItemInfo is required.",
        });
      }

      if (
        !Array.isArray(
          saleOrderItemInfo.saleOrderItem
        ) ||
        saleOrderItemInfo.saleOrderItem
          .length === 0
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "At least one saleOrderItem is required.",
        });
      }

      // --------------------------------------------------------
      // Validate Sale Order Items
      // --------------------------------------------------------

      for (
        const item of
          saleOrderItemInfo.saleOrderItem
      ) {
        if (
          !item ||
          !item.code ||
          !String(item.code).trim()
        ) {
          return res.status(400).json({
            successful: false,
            message:
              "Every saleOrderItem must contain a code.",
          });
        }

        if (
          item.customFieldValues !==
            undefined &&
          !Array.isArray(
            item.customFieldValues
          )
        ) {
          return res.status(400).json({
            successful: false,
            message:
              `customFieldValues for sale order item ${item.code} must be an array.`,
          });
        }

        if (
          Array.isArray(
            item.customFieldValues
          )
        ) {
          for (
            const field of
              item.customFieldValues
          ) {
            if (
              !field ||
              !field.name ||
              !String(
                field.name
              ).trim()
            ) {
              return res.status(400).json({
                successful: false,
                message:
                  `Every custom field for sale order item ${item.code} must contain a name.`,
              });
            }
          }
        }
      }

      // --------------------------------------------------------
      // Build Sale Order Item Info
      // --------------------------------------------------------

      const cleanedSaleOrderItems =
        saleOrderItemInfo.saleOrderItem.map(
          (item) => {
            const cleaned = {
              code: String(
                item.code
              ).trim(),
            };

            if (
              Array.isArray(
                item.customFieldValues
              ) &&
              item.customFieldValues
                .length > 0
            ) {
              cleaned.customFieldValues =
                item.customFieldValues
                  .filter(
                    (field) =>
                      field &&
                      field.name &&
                      String(
                        field.name
                      ).trim()
                  )
                  .map((field) => ({
                    name: String(
                      field.name
                    ).trim(),
                    ...(field.value !==
                    undefined
                      ? {
                          value:
                            field.value,
                        }
                      : {}),
                  }));
            }

            return cleaned;
          }
        );

      // --------------------------------------------------------
      // Build final payload
      // --------------------------------------------------------

      const payload = {
        saleOrderCode:
          String(
            saleOrderCode
          ).trim(),

        saleOrderItemInfo: {
          saleOrderItem:
            cleanedSaleOrderItems,
        },
      };

      // ========================================================
      // Shipping Package Info
      // ========================================================

      if (
        shippingPackageInfo !==
          undefined &&
        shippingPackageInfo !== null
      ) {
        if (
          typeof shippingPackageInfo !==
            "object" ||
          Array.isArray(
            shippingPackageInfo
          )
        ) {
          return res.status(400).json({
            successful: false,
            message:
              "shippingPackageInfo must be an object.",
          });
        }

        const cleanedShippingPackage =
          {};

        if (
          shippingPackageInfo.trackingNumber !==
            undefined &&
          shippingPackageInfo.trackingNumber !==
            null &&
          String(
            shippingPackageInfo.trackingNumber
          ).trim()
        ) {
          cleanedShippingPackage.trackingNumber =
            String(
              shippingPackageInfo.trackingNumber
            ).trim();
        }

        if (
          shippingPackageInfo.shippingProviderCode !==
            undefined &&
          shippingPackageInfo.shippingProviderCode !==
            null &&
          String(
            shippingPackageInfo.shippingProviderCode
          ).trim()
        ) {
          cleanedShippingPackage.shippingProviderCode =
            String(
              shippingPackageInfo.shippingProviderCode
            ).trim();
        }

        if (
          shippingPackageInfo.shippingPackageCode !==
            undefined &&
          shippingPackageInfo.shippingPackageCode !==
            null &&
          String(
            shippingPackageInfo.shippingPackageCode
          ).trim()
        ) {
          cleanedShippingPackage.shippingPackageCode =
            String(
              shippingPackageInfo.shippingPackageCode
            ).trim();
        }

        // Preserve explicit false
        if (
          shippingPackageInfo.markDispatchedOnChannel !==
          undefined
        ) {
          cleanedShippingPackage.markDispatchedOnChannel =
            Boolean(
              shippingPackageInfo.markDispatchedOnChannel
            );
        }

        if (
          Array.isArray(
            shippingPackageInfo.customFieldValues
          ) &&
          shippingPackageInfo.customFieldValues
            .length > 0
        ) {
          for (
            const field of
              shippingPackageInfo.customFieldValues
          ) {
            if (
              !field ||
              !field.name ||
              !String(
                field.name
              ).trim()
            ) {
              return res.status(400).json({
                successful: false,
                message:
                  "Every shipping package custom field must contain a name.",
              });
            }
          }

          cleanedShippingPackage.customFieldValues =
            shippingPackageInfo.customFieldValues
              .filter(
                (field) =>
                  field &&
                  field.name &&
                  String(
                    field.name
                  ).trim()
              )
              .map((field) => ({
                name: String(
                  field.name
                ).trim(),
                ...(field.value !==
                undefined
                  ? {
                      value:
                        field.value,
                    }
                  : {}),
              }));
        }

        payload.shippingPackageInfo =
          cleanedShippingPackage;
      }

      // ========================================================
      // Invoice Info
      // ========================================================

      if (
        invoiceInfo !== undefined &&
        invoiceInfo !== null
      ) {
        if (
          typeof invoiceInfo !==
            "object" ||
          Array.isArray(invoiceInfo)
        ) {
          return res.status(400).json({
            successful: false,
            message:
              "invoiceInfo must be an object.",
          });
        }

        const cleanedInvoiceInfo =
          {};

        if (
          invoiceInfo.invoiceCode !==
            undefined &&
          invoiceInfo.invoiceCode !==
            null &&
          String(
            invoiceInfo.invoiceCode
          ).trim()
        ) {
          cleanedInvoiceInfo.invoiceCode =
            String(
              invoiceInfo.invoiceCode
            ).trim();
        }

        // ------------------------------------------------------
        // Tax Information
        // ------------------------------------------------------

        if (
          invoiceInfo.taxInformation !==
            undefined &&
          invoiceInfo.taxInformation !==
            null
        ) {
          if (
            typeof invoiceInfo.taxInformation !==
              "object" ||
            Array.isArray(
              invoiceInfo.taxInformation
            )
          ) {
            return res.status(400).json({
              successful: false,
              message:
                "taxInformation must be an object.",
            });
          }

          const productTaxes =
            invoiceInfo
              .taxInformation
              .productTaxes;

          if (
            !Array.isArray(
              productTaxes
            ) ||
            productTaxes.length === 0
          ) {
            return res.status(400).json({
              successful: false,
              message:
                "taxInformation.productTaxes must contain at least one product tax.",
            });
          }

          for (
            const tax of productTaxes
          ) {
            if (
              !tax ||
              !tax.channelProductId ||
              !String(
                tax.channelProductId
              ).trim()
            ) {
              return res.status(400).json({
                successful: false,
                message:
                  "Every product tax must contain channelProductId.",
              });
            }
          }

          cleanedInvoiceInfo.taxInformation =
            {
              productTaxes:
                productTaxes.map(
                  (tax) => {
                    const cleanedTax =
                      {
                        channelProductId:
                          String(
                            tax.channelProductId
                          ).trim(),
                      };

                    const numericFields = [
                      "taxPercentage",
                      "centralGst",
                      "stateGst",
                      "unionTerritoryGst",
                      "integratedGst",
                      "compensationCess",
                    ];

                    for (
                      const field of
                        numericFields
                    ) {
                      if (
                        tax[field] !==
                        undefined
                      ) {
                        const value =
                          Number(
                            tax[field]
                          );

                        if (
                          !Number.isFinite(
                            value
                          )
                        ) {
                          throw new Error(
                            `${field} must be a valid number.`
                          );
                        }

                        cleanedTax[
                          field
                        ] = value;
                      }
                    }

                    if (
                      tax.additionalInfo !==
                        undefined &&
                      tax.additionalInfo !==
                        null
                    ) {
                      cleanedTax.additionalInfo =
                        String(
                          tax.additionalInfo
                        );
                    }

                    if (
                      Array.isArray(
                        tax.customFieldValues
                      ) &&
                      tax.customFieldValues
                        .length > 0
                    ) {
                      cleanedTax.customFieldValues =
                        tax.customFieldValues
                          .filter(
                            (field) =>
                              field &&
                              field.name &&
                              String(
                                field.name
                              ).trim()
                          )
                          .map(
                            (field) => ({
                              name: String(
                                field.name
                              ).trim(),
                              ...(field.value !==
                              undefined
                                ? {
                                    value:
                                      field.value,
                                  }
                                : {}),
                            })
                          );
                    }

                    return cleanedTax;
                  }
                ),
            };
        }

        payload.invoiceInfo =
          cleanedInvoiceInfo;
      }

      // --------------------------------------------------------
      // Call Uniware
      // --------------------------------------------------------

      const response =
        await axios.post(
          `${UNIWARE_BASE_URL}/services/rest/v1/oms/shippingPackage/createAndDispatchBySaleOrderItemCode`,
          payload,
          {
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
              Facility:
                String(
                  facility
                ).trim(),
            },
          }
        );

      return res
        .status(response.status)
        .json(response.data);
    } catch (error) {
      console.error(
        "Uniware Shipment Create and Dispatch Error:",
        error.response?.data ||
          error.message
      );

      return res.status(
        error.response?.status || 500
      ).json(
        error.response?.data || {
          successful: false,
          message:
            error.message ||
            "Failed to create and dispatch shipping package.",
        }
      );
    }
  }
);
// ============================================================
// Uniware - Update Tracking Status
// POST /services/rest/v1/oms/updateShipmentTrackingStatus
// Facility-level API
// ============================================================

app.post(
  "/api/uniware/shipping-packages/update-tracking-status",
  async (req, res) => {
    try {
      const {
        facility,
        providerCode,
        trackingNumber,
        trackingStatus,
        statusDate,
        shipmentTrackingStatusName,
        rtoTrackingNumber,
        rtoReason,
      } = req.body;

      // --------------------------------------------------------
      // Validate Facility
      // --------------------------------------------------------

      if (
        !facility ||
        !String(facility).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message: "Facility is required.",
        });
      }

      // --------------------------------------------------------
      // Validate mandatory fields
      // --------------------------------------------------------

      if (
        !providerCode ||
        !String(providerCode).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "providerCode is required.",
        });
      }

      if (
        !trackingNumber ||
        !String(trackingNumber).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "trackingNumber is required.",
        });
      }

      if (
        !trackingStatus ||
        !String(trackingStatus).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "trackingStatus is required.",
        });
      }

      if (
        !shipmentTrackingStatusName ||
        !String(
          shipmentTrackingStatusName
        ).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "shipmentTrackingStatusName is required.",
        });
      }

      // --------------------------------------------------------
      // Build payload
      // --------------------------------------------------------

      const payload = {
        providerCode:
          String(providerCode).trim(),

        trackingNumber:
          String(trackingNumber).trim(),

        trackingStatus:
          String(trackingStatus).trim(),

        shipmentTrackingStatusName:
          String(
            shipmentTrackingStatusName
          ).trim(),
      };

      // --------------------------------------------------------
      // Optional status date
      // --------------------------------------------------------

      if (
        statusDate !== undefined &&
        statusDate !== null &&
        String(statusDate).trim()
      ) {
        const parsedDate =
          new Date(statusDate);

        if (
          Number.isNaN(
            parsedDate.getTime()
          )
        ) {
          return res.status(400).json({
            successful: false,
            message:
              "statusDate must be a valid date.",
          });
        }

        payload.statusDate =
          parsedDate.toISOString();
      }

      // --------------------------------------------------------
      // Optional RTO tracking number
      // --------------------------------------------------------

      if (
        rtoTrackingNumber !==
          undefined &&
        rtoTrackingNumber !== null &&
        String(
          rtoTrackingNumber
        ).trim()
      ) {
        payload.rtoTrackingNumber =
          String(
            rtoTrackingNumber
          ).trim();
      }

      // --------------------------------------------------------
      // Optional RTO reason
      // --------------------------------------------------------

      if (
        rtoReason !== undefined &&
        rtoReason !== null &&
        String(rtoReason).trim()
      ) {
        payload.rtoReason =
          String(rtoReason).trim();
      }

      // --------------------------------------------------------
      // Call Uniware
      // --------------------------------------------------------

      const response =
        await axios.post(
          `${UNIWARE_BASE_URL}/services/rest/v1/oms/updateShipmentTrackingStatus`,
          payload,
          {
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
              Facility:
                String(
                  facility
                ).trim(),
            },
          }
        );

      return res
        .status(response.status)
        .json(response.data);
    } catch (error) {
      console.error(
        "Uniware Update Tracking Status Error:",
        error.response?.data ||
          error.message
      );

      return res.status(
        error.response?.status || 500
      ).json(
        error.response?.data || {
          successful: false,
          message:
            error.message ||
            "Failed to update shipment tracking status.",
        }
      );
    }
  }
);
// ============================================================
// Uniware - Mark Sale Order Item(s) Delivered
// POST /services/rest/v1/saleOrderItem/markDelivered
// Facility-level API
// ============================================================

app.post(
  "/api/uniware/sale-orders/items/mark-delivered",
  async (req, res) => {
    try {
      const {
        facility,
        saleOrderCode,
        saleOrderItemCodes,
        podCode,
      } = req.body;

      // --------------------------------------------------------
      // Validate Facility
      // --------------------------------------------------------

      if (
        !facility ||
        !String(facility).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message: "Facility is required.",
        });
      }

      // --------------------------------------------------------
      // Validate Sale Order Code
      // --------------------------------------------------------

      if (
        !saleOrderCode ||
        !String(saleOrderCode).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "saleOrderCode is required.",
        });
      }

      // --------------------------------------------------------
      // Validate Sale Order Item Codes
      // --------------------------------------------------------

      if (
        !Array.isArray(
          saleOrderItemCodes
        ) ||
        saleOrderItemCodes.length === 0
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "At least one saleOrderItemCode is required.",
        });
      }

      const cleanedItemCodes =
        saleOrderItemCodes
          .map((code) =>
            String(code || "").trim()
          )
          .filter(Boolean);

      if (
        cleanedItemCodes.length === 0
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "At least one valid saleOrderItemCode is required.",
        });
      }

      // --------------------------------------------------------
      // Build Uniware payload
      // --------------------------------------------------------

      const payload = {
        saleOrderCode:
          String(
            saleOrderCode
          ).trim(),

        saleOrderItemCodes:
          cleanedItemCodes,
      };

      // --------------------------------------------------------
      // Optional POD code
      // --------------------------------------------------------

      if (
        podCode !== undefined &&
        podCode !== null &&
        String(podCode).trim()
      ) {
        payload.podCode =
          String(podCode).trim();
      }

      // --------------------------------------------------------
      // Call Uniware
      // --------------------------------------------------------

      const response =
        await axios.post(
          `${UNIWARE_BASE_URL}/services/rest/v1/saleOrderItem/markDelivered`,
          payload,
          {
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
              Facility:
                String(
                  facility
                ).trim(),
            },
          }
        );

      return res
        .status(response.status)
        .json(response.data);
    } catch (error) {
      console.error(
        "Uniware Mark Item Delivered Error:",
        error.response?.data ||
          error.message
      );

      return res.status(
        error.response?.status || 500
      ).json(
        error.response?.data || {
          successful: false,
          message:
            error.message ||
            "Failed to mark sale order item(s) as delivered.",
        }
      );
    }
  }
);
// ============================================================
// Uniware - Create Picklist
//
// Endpoint 1:
// /services/rest/v1/oms/picker/picklist/staging/manual/create
//
// Endpoint 2:
// /services/rest/v1/oms/picker/picklist/manual/create
//
// Both are Facility-level APIs.
// ============================================================

app.post(
  "/api/uniware/picklists/create",
  async (req, res) => {
    try {
      const {
        facility,
        shippingPackageCodes,
        destination,
      } = req.body;

      // --------------------------------------------------------
      // Validate Facility
      // --------------------------------------------------------

      if (
        !facility ||
        !String(facility).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message: "Facility is required.",
        });
      }

      // --------------------------------------------------------
      // Validate shipping package codes
      // --------------------------------------------------------

      if (
        !Array.isArray(
          shippingPackageCodes
        ) ||
        shippingPackageCodes.length === 0
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "At least one shippingPackageCode is required.",
        });
      }

      const cleanedPackageCodes =
        shippingPackageCodes
          .map((code) =>
            String(code || "").trim()
          )
          .filter(Boolean);

      if (
        cleanedPackageCodes.length === 0
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "At least one valid shippingPackageCode is required.",
        });
      }

      // --------------------------------------------------------
      // Determine endpoint
      //
      // destination supplied:
      //   Endpoint 2
      //
      // destination not supplied:
      //   Endpoint 1
      // --------------------------------------------------------

      let endpoint;
      let payload;

      if (
        destination !== undefined &&
        destination !== null &&
        String(destination).trim()
      ) {
        const normalizedDestination =
          String(
            destination
          )
            .trim()
            .toUpperCase();

        if (
          !["INVOICING", "STAGING"].includes(
            normalizedDestination
          )
        ) {
          return res.status(400).json({
            successful: false,
            message:
              "destination must be INVOICING or STAGING.",
          });
        }

        endpoint =
          "/services/rest/v1/oms/picker/picklist/manual/create";

        payload = {
          shippingPackageCodes:
            cleanedPackageCodes,
          destination:
            normalizedDestination,
        };
      } else {
        // ------------------------------------------------------
        // Endpoint 1
        // Staging → invoicing destination
        // ------------------------------------------------------

        endpoint =
          "/services/rest/v1/oms/picker/picklist/staging/manual/create";

        payload = {
          shippingPackageCodes:
            cleanedPackageCodes,
        };
      }

      // --------------------------------------------------------
      // Call Uniware
      // --------------------------------------------------------

      const response =
        await axios.post(
          `${UNIWARE_BASE_URL}${endpoint}`,
          payload,
          {
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
              Facility:
                String(
                  facility
                ).trim(),
            },
          }
        );

      return res
        .status(response.status)
        .json(response.data);
    } catch (error) {
      console.error(
        "Uniware Create Picklist Error:",
        error.response?.data ||
          error.message
      );

      return res.status(
        error.response?.status || 500
      ).json(
        error.response?.data || {
          successful: false,
          message:
            error.message ||
            "Failed to create picklist.",
        }
      );
    }
  }
);
// ============================================================
// Uniware - Enable Custom Reason Dropdown
//
// Endpoint:
// /services/rest/v1/uiCustomList/createOrUpdate
//
// Facility-level API
//
// Supports:
//   editSaleOrder:ReturnReason
//   editSaleOrder:CancelReason
// ============================================================

app.post(
  "/api/uniware/ui-custom-list/create-or-update",
  async (req, res) => {
    try {
      const {
        facility,
        name,
        reasons,
      } = req.body;

      // --------------------------------------------------------
      // Validate Facility
      // --------------------------------------------------------

      if (
        !facility ||
        !String(facility).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message: "Facility is required.",
        });
      }

      // --------------------------------------------------------
      // Validate name
      // --------------------------------------------------------

      const allowedNames = [
        "editSaleOrder:ReturnReason",
        "editSaleOrder:CancelReason",
      ];

      if (
        !name ||
        !allowedNames.includes(
          String(name).trim()
        )
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "name must be editSaleOrder:ReturnReason or editSaleOrder:CancelReason.",
        });
      }

      // --------------------------------------------------------
      // Validate reasons
      // --------------------------------------------------------

      if (
        !reasons ||
        typeof reasons !== "object" ||
        Array.isArray(reasons)
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "reasons must be a key-value object.",
        });
      }

      const cleanedReasons = {};

      for (
        const [key, value] of Object.entries(
          reasons
        )
      ) {
        const cleanKey =
          String(key).trim();

        const cleanValue =
          String(value ?? "").trim();

        if (!cleanKey) {
          return res.status(400).json({
            successful: false,
            message:
              "Reason keys cannot be empty.",
          });
        }

        if (!cleanValue) {
          return res.status(400).json({
            successful: false,
            message:
              `Reason value is required for "${cleanKey}".`,
          });
        }

        cleanedReasons[cleanKey] =
          cleanValue;
      }

      if (
        Object.keys(
          cleanedReasons
        ).length === 0
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "At least one reason is required.",
        });
      }

      // --------------------------------------------------------
      // Uniware expects value as a JSON STRING
      // --------------------------------------------------------

      const payload = {
        name: String(name).trim(),
        value: JSON.stringify(
          cleanedReasons
        ),
      };

      // --------------------------------------------------------
      // Call Uniware
      // --------------------------------------------------------

      const response =
        await axios.post(
          `${UNIWARE_BASE_URL}/services/rest/v1/uiCustomList/createOrUpdate`,
          payload,
          {
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `bearer ${UNIWARE_ACCESS_TOKEN}`,
              Facility:
                String(
                  facility
                ).trim(),
            },
          }
        );

      return res
        .status(response.status)
        .json(response.data);
    } catch (error) {
      console.error(
        "Uniware Custom Reason Dropdown Error:",
        error.response?.data ||
          error.message
      );

      return res.status(
        error.response?.status || 500
      ).json(
        error.response?.data || {
          successful: false,
          message:
            error.message ||
            "Failed to create or update custom reason dropdown.",
        }
      );
    }
  }
);
// ============================================================
// Uniware - Update Shipment Seal ID (Multiple)
//
// Uniware Endpoint:
// POST /services/rest/v1/package/updateMultiple
//
// Level: Tenant
// Facility header: REQUIRED according to Uniware documentation
// ============================================================

app.post(
  "/api/uniware/shipping-packages/update-seal-id-bulk",
  async (req, res) => {
    try {
      const {
        facility,
        packages,
      } = req.body;

      // --------------------------------------------------------
      // Validate Facility
      // --------------------------------------------------------

      if (!facility || !String(facility).trim()) {
        return res.status(400).json({
          successful: false,
          message: "Facility is required.",
        });
      }

      // --------------------------------------------------------
      // Validate packages
      // --------------------------------------------------------

      if (
        !Array.isArray(packages) ||
        packages.length === 0
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "At least one shipping package is required.",
        });
      }

      const cleanedPackages = [];

      const usedPackageCodes = new Set();
      const usedSealIds = new Set();

      for (let index = 0; index < packages.length; index++) {
        const item = packages[index] || {};

        const shippingPackageCode =
          String(
            item.shippingPackageCode || ""
          ).trim();

        const shippingPackageTypeCode =
          String(
            item.shippingPackageTypeCode || ""
          ).trim();

        const sptItemSealID =
          String(
            item.sptItemSealID || ""
          ).trim();

        // ------------------------------------------------------
        // Required fields
        // ------------------------------------------------------

        if (!shippingPackageCode) {
          return res.status(400).json({
            successful: false,
            message:
              `Package ${index + 1}: shippingPackageCode is required.`,
          });
        }

        if (!shippingPackageTypeCode) {
          return res.status(400).json({
            successful: false,
            message:
              `Package ${index + 1}: shippingPackageTypeCode is required.`,
          });
        }

        if (!sptItemSealID) {
          return res.status(400).json({
            successful: false,
            message:
              `Package ${index + 1}: sptItemSealID is required.`,
          });
        }

        // ------------------------------------------------------
        // Package code must be unique in bulk request
        // ------------------------------------------------------

        if (
          usedPackageCodes.has(
            shippingPackageCode
          )
        ) {
          return res.status(400).json({
            successful: false,
            message:
              `Duplicate shippingPackageCode found: ${shippingPackageCode}`,
          });
        }

        // ------------------------------------------------------
        // Seal ID must be unique for each shipping package
        // ------------------------------------------------------

        if (
          usedSealIds.has(
            sptItemSealID
          )
        ) {
          return res.status(400).json({
            successful: false,
            message:
              `Duplicate sptItemSealID found: ${sptItemSealID}`,
          });
        }

        usedPackageCodes.add(
          shippingPackageCode
        );

        usedSealIds.add(
          sptItemSealID
        );

        // ------------------------------------------------------
        // Build package payload
        // ------------------------------------------------------

        const packagePayload = {
          shippingPackageCode,
          shippingPackageTypeCode,
          sptItemSealID,
        };

        // ------------------------------------------------------
        // Optional boolean
        //
        // Preserve false.
        // Omit only when not supplied.
        // ------------------------------------------------------

        if (
          item.shipmentActualWeightCalculationRequired !==
          undefined &&
          item.shipmentActualWeightCalculationRequired !==
          null
        ) {
          if (
            typeof item.shipmentActualWeightCalculationRequired !==
            "boolean"
          ) {
            return res.status(400).json({
              successful: false,
              message:
                `Package ${index + 1}: shipmentActualWeightCalculationRequired must be boolean.`,
            });
          }

          packagePayload.shipmentActualWeightCalculationRequired =
            item.shipmentActualWeightCalculationRequired;
        }

        cleanedPackages.push(
          packagePayload
        );
      }

      // --------------------------------------------------------
      // Uniware payload
      // --------------------------------------------------------

      const payload = {
        packages: cleanedPackages,
      };

      // --------------------------------------------------------
      // Call Uniware
      // --------------------------------------------------------

      const response = await axios.post(
        `${UNIWARE_BASE_URL}/services/rest/v1/package/updateMultiple`,
        payload,
        {
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `bearer ${UNIWARE_ACCESS_TOKEN}`,
            Facility:
              String(facility).trim(),
          },
        }
      );

      return res
        .status(response.status)
        .json(response.data);
    } catch (error) {
      console.error(
        "Uniware Update Shipment Seal ID Bulk Error:",
        error.response?.data ||
          error.message
      );

      return res
        .status(
          error.response?.status || 500
        )
        .json(
          error.response?.data || {
            successful: false,
            message:
              error.message ||
              "Failed to update shipment seal IDs.",
          }
        );
    }
  }
);
// ============================================================
// Uniware - Update Shipment Seal ID (Single)
//
// Uniware Endpoint:
// POST /services/rest/v1/package/update
//
// Documentation Level: Tenant
// Facility header: REQUIRED according to documentation
// ============================================================

app.post(
  "/api/uniware/shipping-packages/update-seal-id",
  async (req, res) => {
    try {
      const {
        facility,
        shippingPackageCode,
        shippingPackageTypeCode,
        sptItemSealID,
        shipmentActualWeightCalculationRequired,
      } = req.body;

      // --------------------------------------------------------
      // Validate Facility
      // --------------------------------------------------------

      if (!facility || !String(facility).trim()) {
        return res.status(400).json({
          successful: false,
          message: "Facility is required.",
        });
      }

      // --------------------------------------------------------
      // Validate Shipping Package Code
      // --------------------------------------------------------

      if (
        !shippingPackageCode ||
        !String(shippingPackageCode).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "shippingPackageCode is required.",
        });
      }

      // --------------------------------------------------------
      // Validate Shipping Package Type Code
      // --------------------------------------------------------

      if (
        !shippingPackageTypeCode ||
        !String(shippingPackageTypeCode).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "shippingPackageTypeCode is required.",
        });
      }

      // --------------------------------------------------------
      // Validate Seal ID
      // --------------------------------------------------------

      if (
        !sptItemSealID ||
        !String(sptItemSealID).trim()
      ) {
        return res.status(400).json({
          successful: false,
          message:
            "sptItemSealID is required.",
        });
      }

      // --------------------------------------------------------
      // Build payload
      // --------------------------------------------------------

      const payload = {
        shippingPackageCode:
          String(
            shippingPackageCode
          ).trim(),

        shippingPackageTypeCode:
          String(
            shippingPackageTypeCode
          ).trim(),

        sptItemSealID:
          String(
            sptItemSealID
          ).trim(),
      };

      // --------------------------------------------------------
      // Optional boolean
      //
      // Preserve false.
      // Omit only when not supplied.
      // --------------------------------------------------------

      if (
        shipmentActualWeightCalculationRequired !==
          undefined &&
        shipmentActualWeightCalculationRequired !==
          null
      ) {
        if (
          typeof shipmentActualWeightCalculationRequired !==
          "boolean"
        ) {
          return res.status(400).json({
            successful: false,
            message:
              "shipmentActualWeightCalculationRequired must be boolean.",
          });
        }

        payload.shipmentActualWeightCalculationRequired =
          shipmentActualWeightCalculationRequired;
      }

      // --------------------------------------------------------
      // Call Uniware
      // --------------------------------------------------------

      const response = await axios.post(
        `${UNIWARE_BASE_URL}/services/rest/v1/package/update`,
        payload,
        {
          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `bearer ${UNIWARE_ACCESS_TOKEN}`,

            Facility:
              String(
                facility
              ).trim(),
          },
        }
      );

      return res
        .status(response.status)
        .json(response.data);
    } catch (error) {
      console.error(
        "Uniware Update Shipment Seal ID Error:",
        error.response?.data ||
          error.message
      );

      return res
        .status(
          error.response?.status || 500
        )
        .json(
          error.response?.data || {
            successful: false,
            message:
              error.message ||
              "Failed to update shipment seal ID.",
          }
        );
    }
  }
);
// ================= SERVER START =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Node API Server running on http://localhost:${PORT}`);
  console.log(`📡 Seller Portal API: http://localhost:${PORT}/api`);
  console.log(`🔗.NET API: ${DOTNET_API_URL}`);
  console.log(`✅ APIs: 40 Amazon + 16 Flipkart + 14 MyStore + Unified Seller-Customer`);
});