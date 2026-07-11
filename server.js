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

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});