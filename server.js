const express = require("express");
const cors = require("cors");
const axios = require("axios");
const aws4 = require("aws4");

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Home Route
app.get("/", (req, res) => {
  res.send("Amazon SP-API Backend Running...");
});

// ==================== 1. AUTHENTICATION ====================
// Generate Amazon Access Token
app.post("/api/token", async (req, res) => {
  try {
    const { clientId, clientSecret, refreshToken } = req.body;
    if (!clientId || !clientSecret || !refreshToken) {
      return res.status(400).json({ success: false, message: "Client ID, Client Secret and Refresh Token are required." });
    }

    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("client_id", clientId);
    params.append("client_secret", clientSecret);
    params.append("refresh_token", refreshToken);

    const response = await axios.post(
      "https://api.amazon.com/auth/o2/token",
      params.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Token Generation Error");
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== 2. SELLER APIs ====================
// Marketplace Participations
app.post("/api/marketplace", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, serviceName, environment } = req.body;
    if (!accessToken || !awsAccessKey || !awsSecretKey || !region) {
      return res.status(400).json({ success: false, message: "Missing required parameters." });
    }

    const host = environment === "production" ? "sellingpartnerapi-na.amazon.com" : "sandbox.sellingpartnerapi-na.amazon.com";
    const opts = {
      host,
      path: "/sellers/v1/marketplaceParticipations",
      service: serviceName || "execute-api",
      region: region || "us-east-1",
      method: "GET",
      headers: { "x-amz-access-token": accessToken, Accept: "application/json" }
    };

    aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
    const response = await axios({ method: "GET", url: `https://${host}/sellers/v1/marketplaceParticipations`, headers: opts.headers });
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Amazon API Error:");
    if (error.response) {
      return res.status(error.response.status).json({ success: false, amazonError: error.response.data });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== 3. CATALOG APIs ====================
// Get Catalog Item
app.post("/api/catalog", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, serviceName, environment, asin, marketplaceId } = req.body;
    const host = environment === "production" ? "sellingpartnerapi-na.amazon.com" : "sandbox.sellingpartnerapi-na.amazon.com";
    const path = `/catalog/2022-04-01/items/${asin}?marketplaceIds=${marketplaceId}`;

    const opts = {
      host, path, service: serviceName || "execute-api", region: region || "us-east-1", method: "GET",
      headers: { "x-amz-access-token": accessToken, Accept: "application/json" }
    };

    aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
    const response = await axios({ method: "GET", url: `https://${host}${path}`, headers: opts.headers });
    res.json(response.data);
  } catch (err) {
    res.status(500).json(err.response?.data || { error: err.message });
  }
});

// ==================== 4. LISTINGS APIs ====================
// Create Listing - PUT
app.post("/api/listings/create", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, serviceName, environment, sellerId, sku, marketplaceIds, productType, attributes } = req.body;
    const host = environment === "production" ? "sellingpartnerapi-na.amazon.com" : "sandbox.sellingpartnerapi-na.amazon.com";
    const path = `/listings/2021-08-01/items/${sellerId}/${sku}?marketplaceIds=${marketplaceIds.join(',')}`;

    const opts = {
      host, path, service: serviceName || "execute-api", region: region || "us-east-1", method: "PUT",
      headers: { "x-amz-access-token": accessToken, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ productType, attributes })
    };

    aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
    const response = await axios({ method: "PUT", url: `https://${host}${path}`, headers: opts.headers, data: { productType, attributes } });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// Get Listing - GET
app.post("/api/listings/get", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, serviceName, environment, sellerId, sku, marketplaceIds } = req.body;
    const host = environment === "production" ? "sellingpartnerapi-na.amazon.com" : "sandbox.sellingpartnerapi-na.amazon.com";
    const path = `/listings/2021-08-01/items/${sellerId}/${sku}?marketplaceIds=${marketplaceIds}`;

    const opts = {
      host, path, service: serviceName || "execute-api", region: region || "us-east-1", method: "GET",
      headers: { "x-amz-access-token": accessToken, Accept: "application/json" }
    };

    aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
    const response = await axios({ method: "GET", url: `https://${host}${path}`, headers: opts.headers });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// Update Listing - PATCH
app.post("/api/listings/update", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, serviceName, environment, sellerId, sku, patches } = req.body;
    const host = environment === "production" ? "sellingpartnerapi-na.amazon.com" : "sandbox.sellingpartnerapi-na.amazon.com";
    const path = `/listings/2021-08-01/items/${sellerId}/${sku}`;

    const opts = {
      host, path, service: serviceName || "execute-api", region: region || "us-east-1", method: "PATCH",
      headers: { "x-amz-access-token": accessToken, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(patches)
    };

    aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
    const response = await axios({ method: "PATCH", url: `https://${host}${path}`, headers: opts.headers, data: patches });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// Delete Listing - DELETE
app.post("/api/listings/delete", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, serviceName, environment, sellerId, sku, marketplaceIds } = req.body;
    const host = environment === "production" ? "sellingpartnerapi-na.amazon.com" : "sandbox.sellingpartnerapi-na.amazon.com";
    const path = `/listings/2021-08-01/items/${sellerId}/${sku}?marketplaceIds=${marketplaceIds}`;

    const opts = {
      host, path, service: serviceName || "execute-api", region: region || "us-east-1", method: "DELETE",
      headers: { "x-amz-access-token": accessToken, Accept: "application/json" }
    };

    aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
    const response = await axios({ method: "DELETE", url: `https://${host}${path}`, headers: opts.headers });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// Get Listing Submission
app.post("/api/listings/submission", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, serviceName, environment, sellerId, submissionId } = req.body;
    const host = environment === "production" ? "sellingpartnerapi-na.amazon.com" : "sandbox.sellingpartnerapi-na.amazon.com";
    const path = `/listings/2021-08-01/items/${sellerId}/submissions/${submissionId}`;

    const opts = {
      host, path, service: serviceName || "execute-api", region: region || "us-east-1", method: "GET",
      headers: { "x-amz-access-token": accessToken, Accept: "application/json" }
    };

    aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
    const response = await axios({ method: "GET", url: `https://${host}${path}`, headers: opts.headers });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// ==================== 5. ORDERS APIs ====================
// Get Orders
app.post("/api/orders", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, serviceName, environment, marketplaceIds, createdAfter, createdBefore } = req.body;
    const host = environment === "production" ? "sellingpartnerapi-na.amazon.com" : "sandbox.sellingpartnerapi-na.amazon.com";
    const query = new URLSearchParams({ MarketplaceIds: marketplaceIds });
    if (createdAfter) query.append('CreatedAfter', createdAfter);
    if (createdBefore) query.append('CreatedBefore', createdBefore);
    const path = `/orders/v0/orders?${query.toString()}`;

    const opts = {
      host, path, service: serviceName || "execute-api", region: region || "us-east-1", method: "GET",
      headers: { "x-amz-access-token": accessToken, Accept: "application/json" }
    };

    aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
    const response = await axios({ method: "GET", url: `https://${host}${path}`, headers: opts.headers });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// Get Order
app.post("/api/orders/get", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, serviceName, environment, orderId } = req.body;
    const host = environment === "production" ? "sellingpartnerapi-na.amazon.com" : "sandbox.sellingpartnerapi-na.amazon.com";
    const path = `/orders/v0/orders/${orderId}`;

    const opts = {
      host, path, service: serviceName || "execute-api", region: region || "us-east-1", method: "GET",
      headers: { "x-amz-access-token": accessToken, Accept: "application/json" }
    };

    aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
    const response = await axios({ method: "GET", url: `https://${host}${path}`, headers: opts.headers });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// Get Order Items
app.post("/api/orders/items", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, serviceName, environment, orderId } = req.body;
    const host = environment === "production" ? "sellingpartnerapi-na.amazon.com" : "sandbox.sellingpartnerapi-na.amazon.com";
    const path = `/orders/v0/orders/${orderId}/orderItems`;

    const opts = {
      host, path, service: serviceName || "execute-api", region: region || "us-east-1", method: "GET",
      headers: { "x-amz-access-token": accessToken, Accept: "application/json" }
    };

    aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
    const response = await axios({ method: "GET", url: `https://${host}${path}`, headers: opts.headers });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// ==================== 6. REPORTS APIs ====================
// Create Report
app.post("/api/reports/create", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, serviceName, environment, reportType, marketplaceIds } = req.body;
    const host = environment === "production" ? "sellingpartnerapi-na.amazon.com" : "sandbox.sellingpartnerapi-na.amazon.com";
    const path = `/reports/2021-06-30/reports`;

    const opts = {
      host, path, service: serviceName || "execute-api", region: region || "us-east-1", method: "POST",
      headers: { "x-amz-access-token": accessToken, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ reportType, marketplaceIds })
    };

    aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
    const response = await axios({ method: "POST", url: `https://${host}${path}`, headers: opts.headers, data: { reportType, marketplaceIds } });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// Get Report
app.post("/api/reports/get", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, serviceName, environment, reportId } = req.body;
    const host = environment === "production" ? "sellingpartnerapi-na.amazon.com" : "sandbox.sellingpartnerapi-na.amazon.com";
    const path = `/reports/2021-06-30/reports/${reportId}`;

    const opts = {
      host, path, service: serviceName || "execute-api", region: region || "us-east-1", method: "GET",
      headers: { "x-amz-access-token": accessToken, Accept: "application/json" }
    };

    aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
    const response = await axios({ method: "GET", url: `https://${host}${path}`, headers: opts.headers });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// Get Report Document
app.post("/api/reports/document", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, serviceName, environment, documentId } = req.body;
    const host = environment === "production" ? "sellingpartnerapi-na.amazon.com" : "sandbox.sellingpartnerapi-na.amazon.com";
    const path = `/reports/2021-06-30/documents/${documentId}`;

    const opts = {
      host, path, service: serviceName || "execute-api", region: region || "us-east-1", method: "GET",
      headers: { "x-amz-access-token": accessToken, Accept: "application/json" }
    };

    aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
    const response = await axios({ method: "GET", url: `https://${host}${path}`, headers: opts.headers });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// ==================== 7. PRICING APIs ====================
// Get Pricing
app.post("/api/pricing", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, serviceName, environment, asin, marketplaceId } = req.body;
    const host = environment === "production" ? "sellingpartnerapi-na.amazon.com" : "sandbox.sellingpartnerapi-na.amazon.com";
    const path = `/products/pricing/v0/items/${asin}/offers?MarketplaceId=${marketplaceId}&ItemCondition=New`;

    const opts = {
      host, path, service: serviceName || "execute-api", region: region || "us-east-1", method: "GET",
      headers: { "x-amz-access-token": accessToken, Accept: "application/json" }
    };

    aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
    const response = await axios({ method: "GET", url: `https://${host}${path}`, headers: opts.headers });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// ==================== 8. FEEDS APIs ====================
// Create Feed Document
app.post("/api/feeds/document", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, serviceName, environment, contentType } = req.body;
    const host = environment === "production" ? "sellingpartnerapi-na.amazon.com" : "sandbox.sellingpartnerapi-na.amazon.com";
    const path = `/feeds/2021-06-30/documents`;

    const opts = {
      host, path, service: serviceName || "execute-api", region: region || "us-east-1", method: "POST",
      headers: { "x-amz-access-token": accessToken, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ contentType: contentType || "text/xml; charset=UTF-8" })
    };

    aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
    const response = await axios({ method: "POST", url: `https://${host}${path}`, headers: opts.headers, data: { contentType: contentType || "text/xml; charset=UTF-8" } });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// Create Feed
app.post("/api/feeds/create", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, serviceName, environment, feedType, marketplaceIds, inputFeedDocumentId } = req.body;
    const host = environment === "production" ? "sellingpartnerapi-na.amazon.com" : "sandbox.sellingpartnerapi-na.amazon.com";
    const path = `/feeds/2021-06-30/feeds`;

    const opts = {
      host, path, service: serviceName || "execute-api", region: region || "us-east-1", method: "POST",
      headers: { "x-amz-access-token": accessToken, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ feedType, marketplaceIds, inputFeedDocumentId })
    };

    aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
    const response = await axios({ method: "POST", url: `https://${host}${path}`, headers: opts.headers, data: { feedType, marketplaceIds, inputFeedDocumentId } });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// Get Feed
app.post("/api/feeds/get", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, serviceName, environment, feedId } = req.body;
    const host = environment === "production" ? "sellingpartnerapi-na.amazon.com" : "sandbox.sellingpartnerapi-na.amazon.com";
    const path = `/feeds/2021-06-30/feeds/${feedId}`;

    const opts = {
      host, path, service: serviceName || "execute-api", region: region || "us-east-1", method: "GET",
      headers: { "x-amz-access-token": accessToken, Accept: "application/json" }
    };

    aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
    const response = await axios({ method: "GET", url: `https://${host}${path}`, headers: opts.headers });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

// ==================== 9. UPLOADS APIs ====================
// Create Upload Destination
app.post("/api/uploads/destination", async (req, res) => {
  try {
    const { accessToken, awsAccessKey, awsSecretKey, region, serviceName, environment, resource, contentMD5, contentType } = req.body;
    const host = environment === "production" ? "sellingpartnerapi-na.amazon.com" : "sandbox.sellingpartnerapi-na.amazon.com";
    const path = `/uploads/2020-11-01/uploadDestinations/${resource}`;

    const opts = {
      host, path, service: serviceName || "execute-api", region: region || "us-east-1", method: "POST",
      headers: { "x-amz-access-token": accessToken, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ contentMD5, contentType })
    };

    aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
    const response = await axios({ method: "POST", url: `https://${host}${path}`, headers: opts.headers, data: { contentMD5, contentType } });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

//////////////////////////////


// ===== FINANCES =====
app.post("/api/finances/events", async (req, res) => {
  const { accessToken, awsAccessKey, awsSecretKey, region, environment, postedAfter } = req.body;
  const host = environment === "production" ? "sellingpartnerapi-na.amazon.com" : "sandbox.sellingpartnerapi-na.amazon.com";
  const path = `/finances/v0/financialEvents${postedAfter ? `?PostedAfter=${postedAfter}` : ''}`;
  const opts = { host, path, service: "execute-api", region, method: "GET", headers: { "x-amz-access-token": accessToken } };
  aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
  try {
    const response = await axios({ method: "GET", url: `https://${host}${path}`, headers: opts.headers });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});

// ===== NOTIFICATIONS =====
app.post("/api/notifications/destination", async (req, res) => {
  const { accessToken, awsAccessKey, awsSecretKey, region, environment, webhookUrl } = req.body;
  const host = environment === "production" ? "sellingpartnerapi-na.amazon.com" : "sandbox.sellingpartnerapi-na.amazon.com";
  const path = "/notifications/v1/destinations";
  const opts = { host, path, service: "execute-api", region, method: "POST", headers: { "x-amz-access-token": accessToken, "Content-Type": "application/json" } };
  aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
  try {
    const response = await axios({ method: "POST", url: `https://${host}${path}`, headers: opts.headers, data: { name: "MyAppWebhook", resource: { sqs: { arn: webhookUrl } } } });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});

app.post("/api/notifications/subscription", async (req, res) => {
  const { accessToken, awsAccessKey, awsSecretKey, region, environment, destinationId, notificationType } = req.body;
  const host = environment === "production" ? "sellingpartnerapi-na.amazon.com" : "sandbox.sellingpartnerapi-na.amazon.com";
  const path = "/notifications/v1/subscriptions/" + notificationType;
  const opts = { host, path, service: "execute-api", region, method: "POST", headers: { "x-amz-access-token": accessToken, "Content-Type": "application/json" } };
  aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
  try {
    const response = await axios({ method: "POST", url: `https://${host}${path}`, headers: opts.headers, data: { destinationId } });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});

// ===== SHIPPING =====
app.post("/api/shipping/rates", async (req, res) => {
  const { accessToken, awsAccessKey, awsSecretKey, region, environment, orderId, weight, dimensions } = req.body;
  const host = environment === "production" ? "sellingpartnerapi-na.amazon.com" : "sandbox.sellingpartnerapi-na.amazon.com";
  const path = "/shipping/v1/shipments/rates";
  const opts = { host, path, service: "execute-api", region, method: "POST", headers: { "x-amz-access-token": accessToken, "Content-Type": "application/json" } };
  aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
  try {
    const response = await axios({ method: "POST", url: `https://${host}${path}`, headers: opts.headers, data: { shipTo: {}, packages: [{ weight: { value: weight, unit: "pound" }, dimensions }] } });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});

// ===== MESSAGING =====
app.post("/api/messaging/send", async (req, res) => {
  const { accessToken, awsAccessKey, awsSecretKey, region, environment, orderId, messageText } = req.body;
  const host = environment === "production" ? "sellingpartnerapi-na.amazon.com" : "sandbox.sellingpartnerapi-na.amazon.com";
  const path = `/messaging/v1/orders/${orderId}/messages`;
  const opts = { host, path, service: "execute-api", region, method: "POST", headers: { "x-amz-access-token": accessToken, "Content-Type": "application/json" } };
  aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
  try {
    const response = await axios({ method: "POST", url: `https://${host}${path}`, headers: opts.headers, data: { messageType: "OrderConfirmation", text: messageText } });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});

// ===== PRODUCT TYPES =====
app.post("/api/product-types/search", async (req, res) => {
  const { accessToken, awsAccessKey, awsSecretKey, region, environment, marketplaceIds } = req.body;
  const host = environment === "production" ? "sellingpartnerapi-na.amazon.com" : "sandbox.sellingpartnerapi-na.amazon.com";
  const path = `/definitions/2020-09-01/productTypes?marketplaceIds=${marketplaceIds}`;
  const opts = { host, path, service: "execute-api", region, method: "GET", headers: { "x-amz-access-token": accessToken } };
  aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
  try {
    const response = await axios({ method: "GET", url: `https://${host}${path}`, headers: opts.headers });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});

app.post("/api/product-types/definition", async (req, res) => {
  const { accessToken, awsAccessKey, awsSecretKey, region, environment, marketplaceIds, productType } = req.body;
  const host = environment === "production" ? "sellingpartnerapi-na.amazon.com" : "sandbox.sellingpartnerapi-na.amazon.com";
  const path = `/definitions/2020-09-01/productTypes/${productType}?marketplaceIds=${marketplaceIds}`;
  const opts = { host, path, service: "execute-api", region, method: "GET", headers: { "x-amz-access-token": accessToken } };
  aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
  try {
    const response = await axios({ method: "GET", url: `https://${host}${path}`, headers: opts.headers });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});
// product Type Definition
  // Helper: Sign request with AWS SigV4
const signRequest = (method, path, region, awsAccessKey, awsSecretKey, accessToken) => {
  const opts = {
    host: 'sellingpartnerapi-na.amazon.com',
    path: path,
    method: method,
    service: 'execute-api',
    region: region,
    headers: {
      'host': 'sellingpartnerapi-na.amazon.com',
      'x-amz-access-token': accessToken,
      'content-type': 'application/json'
    }
  };
  return aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });
};

// POST /api/product-types/search
app.post('/search', async (req, res) => {
  const { accessToken, awsAccessKey, awsSecretKey, region, environment, marketplaceIds, keywords } = req.body;
  
  try {
    const baseUrl = environment === 'sandbox' 
     ? 'https://sandbox.sellingpartnerapi-na.amazon.com' 
      : 'https://sellingpartnerapi-na.amazon.com';
    
    const path = `/definitions/2020-09-01/productTypes/search?keywords=${encodeURIComponent(keywords)}&marketplaceIds=${marketplaceIds}`;
    const signed = signRequest('GET', path, region, awsAccessKey, awsSecretKey, accessToken);
    
    const response = await axios.get(`${baseUrl}${path}`, {
      headers: signed.headers
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// POST /api/product-types/definition
app.post('/definition', async (req, res) => {
  const { accessToken, awsAccessKey, awsSecretKey, region, environment, marketplaceIds, productType } = req.body;
  
  try {
    const baseUrl = environment === 'sandbox' 
     ? 'https://sandbox.sellingpartnerapi-na.amazon.com' 
      : 'https://sellingpartnerapi-na.amazon.com';
    
    const path = `/definitions/2020-09-01/productTypes/${productType}?marketplaceIds=${marketplaceIds}&requirements=LISTING&locale=en_IN`;
    const signed = signRequest('GET', path, region, awsAccessKey, awsSecretKey, accessToken);
    
    const response = await axios.get(`${baseUrl}${path}`, {
      headers: signed.headers
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

//module.exports = router;
//     Messaging 

app.post("/messaging/actions", async (req, res) => {
  try {
    const {
      accessToken,
      awsAccessKey,
      awsSecretKey,
      region,
      amazonOrderId,
      environment
    } = req.body;

    const host =
      environment === "production"
        ? "sellingpartnerapi-na.amazon.com"
        : "sandbox.sellingpartnerapi-na.amazon.com";

    const path = `/messaging/v1/orders/${amazonOrderId}`;

    const opts = {
      host,
      path,
      service: "execute-api",
      region,
      method: "GET",
      headers: {
        "x-amz-access-token": accessToken
      }
    };

    aws4.sign(opts, {
      accessKeyId: awsAccessKey,
      secretAccessKey: awsSecretKey
    });

    const response = await axios({
      method: "GET",
      url: `https://${host}${path}`,
      headers: opts.headers
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json(err.response?.data || err.message);
  }
});


app.post("/api/messaging/templates", async (req, res) => {
  try {
    const {
      accessToken,
      awsAccessKey,
      awsSecretKey,
      region,
      amazonOrderId,
      environment,
    } = req.body;

    const host =
      environment === "production"
        ? "sellingpartnerapi-na.amazon.com"
        : "sandbox.sellingpartnerapi-na.amazon.com";

    const path = `/messaging/v1/orders/${amazonOrderId}/attributes`;

    const opts = {
      host,
      path,
      service: "execute-api",
      region,
      method: "GET",
      headers: {
        "x-amz-access-token": accessToken,
      },
    };

    aws4.sign(opts, {
      accessKeyId: awsAccessKey,
      secretAccessKey: awsSecretKey,
    });

    const response = await axios({
      method: "GET",
      url: `https://${host}${path}`,
      headers: opts.headers,
    });

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);

    res.status(500).json({
      success: false,
      error: err.response?.data || err.message,
    });
  }
});

app.post("/messaging/send", async (req, res) => {
  try {
    const {
      accessToken,
      awsAccessKey,
      awsSecretKey,
      region,
      amazonOrderId,
      environment,
      text,
    } = req.body;

    const host =
      environment === "production"
        ? "sellingpartnerapi-na.amazon.com"
        : "sandbox.sellingpartnerapi-na.amazon.com";

    const path = `/messaging/v1/orders/${amazonOrderId}/messages/confirmCustomizationDetails`;

    const payload = {
      text,
    };

    const opts = {
      host,
      path,
      service: "execute-api",
      region,
      method: "POST",
      headers: {
        "x-amz-access-token": accessToken,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    };

    aws4.sign(opts, {
      accessKeyId: awsAccessKey,
      secretAccessKey: awsSecretKey,
    });

    const response = await axios({
      method: "POST",
      url: `https://${host}${path}`,
      headers: opts.headers,
      data: payload,
    });

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);

    res.status(500).json({
      success: false,
      error: err.response?.data || err.message,
    });
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});