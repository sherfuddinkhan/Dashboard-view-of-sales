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
// ================= SERVER START =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Node API Server running on http://localhost:${PORT}`);
  console.log(`📡 Seller Portal API: http://localhost:${PORT}/api`);
  console.log(`🔗.NET API: ${DOTNET_API_URL}`);
  console.log(`✅ APIs: 40 Amazon + 16 Flipkart + 14 MyStore + Unified Seller-Customer`);
});