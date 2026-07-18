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

app.post("/api/catalog/search", async (req, res) => {

    try {

        const {
            accessToken,
            awsAccessKey,
            awsSecretKey,
            region = "us-east-1",
            serviceName = "execute-api",
            environment = "production",
            marketplaceIds = [],
            keywords = [],
            identifiers = [],
            identifiersType,
            includedData = [],
            locale = "en_US",
            pageSize = 20,
            pageToken

        } = req.body;

        if (!accessToken)
            return res.status(400).json({
                error: "Access Token is required"
            });

        if (!awsAccessKey || !awsSecretKey)
            return res.status(400).json({
                error: "AWS Credentials are required"
            });

        if (!marketplaceIds.length)
            return res.status(400).json({
                error: "Marketplace ID is required"
            });

        const host =
            environment === "production"
                ? "sellingpartnerapi-na.amazon.com"
                : "sandbox.sellingpartnerapi-na.amazon.com";

        const params = new URLSearchParams();

        // Required

        params.append("marketplaceIds",marketplaceIds.join(","));

        // Search by Keywords

        if (keywords.length) {
            params.append("keywords",keywords.join(","));
        }

        // Search by Identifier

        if (identifiers.length) {
            params.append( "identifiers",identifiers.join(","));
            params.append("identifiersType",identifiersType
            );
        }
        // Optional
        if (includedData.length) {
            params.append(
                "includedData",
                includedData.join(",")
            );
        }

        if (locale) {
            params.append("locale",locale);
        }
        if (pageSize) {
            params.append("pageSize", pageSize);
        }
        if (pageToken) {
            params.append(  "pageToken",pageToken);
        }

        const path =
            `/catalog/2022-04-01/items?${params.toString()}`;
         console.log("catlog items path",`https://${host}${path}`);
        const options = {
            host,
            path,
            service: serviceName,
            region,
            method: "GET",
            headers: {
                "x-amz-access-token": accessToken,
                "accept": "application/json",
                "user-agent":"AmazonSellerAnalytics/1.0"
            }
        };
        aws4.sign(
            options,
            {
                accessKeyId: awsAccessKey,
                secretAccessKey: awsSecretKey
            }
        );
        console.log( `https://${host}${path}`
        );
        const response = await axios.get(  `https://${host}${path}`,
            {
                headers: options.headers
            }
        );
        res.json(response.data);
    }
    catch (err) {
        console.error(
            err.response?.data || err.message
        );
        res.status(
            err.response?.status || 500
        ).json({

            success: false,

            error:
                err.response?.data ||
                err.message

        });

    }

});

app.post("/api/catalog-item", async (req, res) => {

    try {

        const {

            accessToken,
            awsAccessKey,
            awsSecretKey,

            region = "us-east-1",
            serviceName = "execute-api",
            environment = "production",

            asin,

            marketplaceIds = [],

            includedData = [],

            locale = "en_US"

        } = req.body;

        if (!accessToken)
            return res.status(400).json({
                error: "Access Token is required"
            });

        if (!awsAccessKey || !awsSecretKey)
            return res.status(400).json({
                error: "AWS Credentials are required"
            });

        if (!asin)
            return res.status(400).json({
                error: "ASIN is required"
            });

        if (!marketplaceIds.length)
            return res.status(400).json({
                error: "Marketplace ID is required"
            });

        const host =
            environment === "production"
                ? "sellingpartnerapi-na.amazon.com"
                : "sandbox.sellingpartnerapi-na.amazon.com";

        let path = `/catalog/2022-04-01/items/${encodeURIComponent(asin)}`;

        const params = new URLSearchParams();

        params.append(
            "marketplaceIds",
            marketplaceIds.join(",")
        );

        if (includedData.length) {

            params.append(
                "includedData",
                includedData.join(",")
            );

        }

        if (locale) {

            params.append(
                "locale",
                locale
            );

        }

        path += `?${params.toString()}`;

        const options = {

            host,

            path,

            service: serviceName,

            region,

            method: "GET",

            headers: {

                "x-amz-access-token": accessToken,

                "accept": "application/json",

                "user-agent": "AmazonSellerAnalytics/1.0"

            }

        };

        aws4.sign(
            options,
            {
                accessKeyId: awsAccessKey,
                secretAccessKey: awsSecretKey
            }
        );

        console.log(
            "Catalog Item URL:",
            `https://${host}${path}`
        );

        const response = await axios.get(

            `https://${host}${path}`,

            {

                headers: options.headers

            }

        );

        res.json(response.data);

    }

    catch (err) {

        console.error(
            err.response?.data || err.message
        );

        res.status(
            err.response?.status || 500
        ).json({

            success: false,

            error:
                err.response?.data ||
                err.message

        });

    }

});


// ==================== 4. LISTINGS APIs ====================
/*
=========================================================
Product Pricing API (India)
=========================================================
*/

app.get("/api/product-pricing", async (req, res) => {

    try {

        const asin = req.query.asin;
        const marketplaceId =
            req.query.marketplaceId || "A21TJRUUN4KGV";

        if (!asin) {

            return res.status(400).json({
                success: false,
                message: "ASIN is required."
            });

        }

        const path =
            `/products/pricing/v0/price?MarketplaceId=${marketplaceId}&ItemType=Asin&Asins=${asin}`;

        const options = {

            host: "sellingpartnerapi-na.amazon.com",

            path: path,

            service: "execute-api",

            region: process.env.AWS_REGION,

            method: "GET",

            headers: {

                "x-amz-access-token":
                    process.env.LWA_ACCESS_TOKEN,

                "content-type":
                    "application/json"

            }

        };

        aws4.sign(options, {

            accessKeyId:
                process.env.AWS_ACCESS_KEY_ID,

            secretAccessKey:
                process.env.AWS_SECRET_ACCESS_KEY

        });

        const response = await axios({

            method: "GET",

            url:
                `https://${options.host}${options.path}`,

            headers: options.headers

        });

        res.status(200).json({

            success: true,

            message: "Product Pricing Retrieved Successfully",

            data: response.data

        });

    }

    catch (error) {

        console.log(error.response?.data || error.message);

        res.status(500).json({

            success: false,

            error:
                error.response?.data || error.message

        });

    }

});


// Create Listing - PUT
app.post("/api/listings/bulk-create", async (req, res) => {
  try {
    const {
      accessToken,
      awsAccessKey,
      awsSecretKey,
      region,
      serviceName,
      environment,
      sellerId,
      marketplaceIds,
      listings,
    } = req.body;

    const host =
      environment === "production"
        ? "sellingpartnerapi-na.amazon.com"
        : "sandbox.sellingpartnerapi-na.amazon.com";

    const results = [];

    for (const listing of listings) {
      try {
        const path =
          `/listings/2021-08-01/items/${sellerId}/${listing.sku}` +
          `?marketplaceIds=${marketplaceIds.join(",")}`;

        const opts = {
          host,
          path,
          service: serviceName || "execute-api",
          region: region || "us-east-1",
          method: "PUT",
          headers: {
            "x-amz-access-token": accessToken,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(listing.payload),
        };

        aws4.sign(opts, {
          accessKeyId: awsAccessKey,
          secretAccessKey: awsSecretKey,
        });

        const response = await axios({
          method: "PUT",
          url: `https://${host}${path}`,
          headers: opts.headers,
          data: listing.payload,
        });

        results.push({
          sku: listing.sku,
          success: true,
          response: response.data,
        });
      } catch (error) {
        results.push({
          sku: listing.sku,
          success: false,
          error:
            error.response?.data || {
              message: error.message,
            },
        });
      }
    }

    res.json({
      total: listings.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
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

    if (!accessToken || !awsAccessKey || !awsSecretKey || !sellerId || !sku || !patches) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const host = environment === "production" 
      ? "sellingpartnerapi-na.amazon.com" 
      : "sandbox.sellingpartnerapi-na.amazon.com";

    const path = `/listings/2021-08-01/items/${sellerId}/${sku}`;

    const opts = {
      host,
      path,
      service: serviceName || "execute-api",
      region: region || "us-east-1",
      method: "PATCH",
      headers: {
        "x-amz-access-token": accessToken,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(patches)
    };

    // Sign the request with aws4
    aws4.sign(opts, { 
      accessKeyId: awsAccessKey, 
      secretAccessKey: awsSecretKey 
    });

    const response = await axios({
      method: "PATCH",
      url: `https://${host}${path}`,
      headers: opts.headers,
      data: patches
    });

    res.json(response.data);
  } catch (err) {
    console.error("Update listing error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || { error: err.message }
    );
  }
});

// DELETE Listing
app.post("/api/listings/delete", async (req, res) => {
  try {
    const { 
      accessToken, 
      awsAccessKey, 
      awsSecretKey, 
      region, 
      serviceName, 
      environment, 
      sellerId, 
      sku, 
      marketplaceIds, 
    } = req.body;

    if (!accessToken || !awsAccessKey || !awsSecretKey || !sellerId || !sku) {
      return res.status(400).json({ error: "Missing required fields: accessToken, aws keys, sellerId, sku" });
    }

    const host = environment === "production" 
      ? "sellingpartnerapi-na.amazon.com" 
      : "sandbox.sellingpartnerapi-na.amazon.com";

    const path = `/listings/2021-08-01/items/${sellerId}/${sku}?marketplaceIds=${marketplaceIds}`;

    const opts = {
      host,
      path,
      service: serviceName || "execute-api",
      region: region || "us-east-1",
      method: "DELETE",
      headers: { 
        "x-amz-access-token": accessToken, 
        "Accept": "application/json" 
      }
    };

    require('aws4').sign(opts, { 
      accessKeyId: awsAccessKey, 
      secretAccessKey: awsSecretKey 
    });

    const response = await require('axios')({
      method: "DELETE",
      url: `https://${host}${path}`,
      headers: opts.headers
    });

    res.json(response.data);
  } catch (err) {
    console.error("Delete listing error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json(
      err.response?.data || { error: err.message }
    );
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

app.post("/api/get-orders", async (req, res) => {
  try {
    const {
      accessToken,
      awsAccessKey,
      awsSecretKey,
      region,
      serviceName,
      environment,
      marketplaceId,
      createdAfter,
      createdBefore,
      orderStatuses,
      maxResultsPerPage,
    } = req.body;

    // Validation
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: "Amazon Access Token is required",
      });
    }

    if (!awsAccessKey || !awsSecretKey) {
      return res.status(400).json({
        success: false,
        error: "AWS Access Key and Secret Key are required",
      });
    }

    if (!marketplaceId) {
      return res.status(400).json({
        success: false,
        error: "Marketplace ID is required",
      });
    }

    // SP-API Host
    const host =
      environment === "production"
        ? "sellingpartnerapi-na.amazon.com"
        : "sandbox.sellingpartnerapi-na.amazon.com";

    // Build Query Parameters
    const params = new URLSearchParams();

    params.append("MarketplaceIds", marketplaceId);

    if (createdAfter) {
      params.append("CreatedAfter", createdAfter);
    }

    if (createdBefore) {
      params.append("CreatedBefore", createdBefore);
    }

    if (orderStatuses) {
      params.append("OrderStatuses", orderStatuses);
    }

    if (maxResultsPerPage) {
      params.append("MaxResultsPerPage", maxResultsPerPage);
    }

    const path = `/orders/v0/orders?${params.toString()}`;

    // Request to sign
    const options = {
      host,
      path,
      service: serviceName || "execute-api",
      region: region || "us-east-1",
      method: "GET",
      headers: {
        host,
        "x-amz-access-token": accessToken,
        accept: "application/json",
        "content-type": "application/json",
      },
    };

    // AWS Signature V4
    aws4.sign(options, {
      accessKeyId: awsAccessKey,
      secretAccessKey: awsSecretKey,
    });

    console.log("Amazon Orders API URL:");
    console.log(`https://${host}${path}`);

    // Amazon API Call
    const response = await axios.get(
      `https://${host}${path}`,
      {
        headers: options.headers,
      }
    );

    res.status(200).json({
      success: true,
      data: response.data,
    });

  } catch (error) {
    console.error(
      "Orders API Error:",
      error.response?.data || error.message
    );

    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data || {
        message: error.message,
      },
    });
  }
});

app.post("/api/get-report-document", async (req, res) => {
  try {
    const {
      accessToken,
      awsAccessKey,
      awsSecretKey,
      region,
      serviceName,
      environment,
      reportDocumentId,
    } = req.body;

    // Validation
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: "Amazon Access Token is required",
      });
    }

    if (!awsAccessKey || !awsSecretKey) {
      return res.status(400).json({
        success: false,
        error: "AWS Access Key and Secret Key are required",
      });
    }

    if (!reportDocumentId) {
      return res.status(400).json({
        success: false,
        error: "Report Document ID is required",
      });
    }

    // Amazon SP-API Host
    const host =
      environment === "production"
        ? "sellingpartnerapi-na.amazon.com"
        : "sandbox.sellingpartnerapi-na.amazon.com";

    // Reports API Path
    const path = `/reports/2021-06-30/documents/${reportDocumentId}`;

    // Request options for AWS Signature V4
    const options = {
      host,
      path,
      service: serviceName || "execute-api",
      region: region || "us-east-1",
      method: "GET",
      headers: {
        host,
        "x-amz-access-token": accessToken,
        accept: "application/json",
        "content-type": "application/json",
      },
    };

    // Sign request
    aws4.sign(options, {
      accessKeyId: awsAccessKey,
      secretAccessKey: awsSecretKey,
    });

    console.log("Calling Amazon Report Document API:");
    console.log(`https://${host}${path}`);

    // Call Amazon SP-API
    const response = await axios.get(
      `https://${host}${path}`,
      {
        headers: options.headers,
      }
    );

    res.status(200).json({
      success: true,
      data: response.data,
    });

  } catch (error) {
    console.error(
      "Report Document API Error:",
      error.response?.data || error.message
    );

    res.status(error.response?.status || 500).json({
      success: false,
      error:
        error.response?.data || {
          message: error.message,
        },
    });
  }
});

app.post("/api/get-report", async (req, res) => {
  try {
    const {
      accessToken,
      awsAccessKey,
      awsSecretKey,
      region,
      serviceName,
      environment,
      reportId,
    } = req.body;

    // Validation
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: "Amazon Access Token is required",
      });
    }

    if (!awsAccessKey || !awsSecretKey) {
      return res.status(400).json({
        success: false,
        error: "AWS Access Key and Secret Key are required",
      });
    }

    if (!reportId) {
      return res.status(400).json({
        success: false,
        error: "Report ID is required",
      });
    }

    // Amazon SP-API Host
    const host =
      environment === "production"
        ? "sellingpartnerapi-na.amazon.com"
        : "sandbox.sellingpartnerapi-na.amazon.com";

    // API Path
    const path = `/reports/2021-06-30/reports/${reportId}`;

    // AWS Signature V4 Request
    const options = {
      host,
      path,
      service: serviceName || "execute-api",
      region: region || "us-east-1",
      method: "GET",
      headers: {
        host,
        "x-amz-access-token": accessToken,
        accept: "application/json",
        "content-type": "application/json",
      },
    };

    // Sign the request
    aws4.sign(options, {
      accessKeyId: awsAccessKey,
      secretAccessKey: awsSecretKey,
    });

    console.log("Calling Amazon Get Report API:");
    console.log(`https://${host}${path}`);

    // Call Amazon SP-API
    const response = await axios.get(
      `https://${host}${path}`,
      {
        headers: options.headers,
      }
    );

    // Success
    res.status(200).json({
      success: true,
      data: response.data,
    });

  } catch (error) {
    console.error(
      "Get Report API Error:",
      error.response?.data || error.message
    );

    res.status(error.response?.status || 500).json({
      success: false,
      error:
        error.response?.data || {
          message: error.message,
        },
    });
  }
});

app.post("/api/get-order-items", async (req, res) => {
  try {
    const {
      accessToken,
      awsAccessKey,
      awsSecretKey,
      region,
      serviceName,
      environment,
      orderId,
    } = req.body;

    // ==========================
    // Validation
    // ==========================
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: "Amazon Access Token is required",
      });
    }

    if (!awsAccessKey || !awsSecretKey) {
      return res.status(400).json({
        success: false,
        error: "AWS Access Key and Secret Key are required",
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: "Amazon Order ID is required",
      });
    }

    // ==========================
    // Amazon SP-API Host
    // ==========================
    const host =
      environment === "production"
        ? "sellingpartnerapi-na.amazon.com"
        : "sandbox.sellingpartnerapi-na.amazon.com";

    // ==========================
    // API Path
    // ==========================
    const path = `/orders/v0/orders/${orderId}/orderItems`;

    // ==========================
    // AWS Signature V4 Request
    // ==========================
    const options = {
      host,
      path,
      service: serviceName || "execute-api",
      region: region || "us-east-1",
      method: "GET",
      headers: {
        host,
        "x-amz-access-token": accessToken,
        accept: "application/json",
        "content-type": "application/json",
      },
    };

    // ==========================
    // Sign Request
    // ==========================
    aws4.sign(options, {
      accessKeyId: awsAccessKey,
      secretAccessKey: awsSecretKey,
    });

    console.log("Calling Amazon Get Order Items API:");
    console.log(`https://${host}${path}`);

    // ==========================
    // Call Amazon SP-API
    // ==========================
    const response = await axios.get(
      `https://${host}${path}`,
      {
        headers: options.headers,
      }
    );

    // ==========================
    // Success Response
    // ==========================
    res.status(200).json({
      success: true,
      data: response.data,
    });

  } catch (error) {
    console.error(
      "Get Order Items API Error:",
      error.response?.data || error.message
    );

    res.status(error.response?.status || 500).json({
      success: false,
      error:
        error.response?.data || {
          message: error.message,
        },
    });
  }
});

app.post("/api/get-order", async (req, res) => {
  try {
    const {
      accessToken,
      awsAccessKey,
      awsSecretKey,
      region,
      serviceName,
      environment,
      orderId,
    } = req.body;

    // ==========================
    // Validation
    // ==========================
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: "Amazon Access Token is required",
      });
    }

    if (!awsAccessKey || !awsSecretKey) {
      return res.status(400).json({
        success: false,
        error: "AWS Access Key and Secret Key are required",
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: "Amazon Order ID is required",
      });
    }

    // ==========================
    // Amazon SP-API Host
    // ==========================
    const host =
      environment === "production"
        ? "sellingpartnerapi-na.amazon.com"
        : "sandbox.sellingpartnerapi-na.amazon.com";

    // ==========================
    // Orders API Path
    // GET /orders/v0/orders/{orderId}
    // ==========================
    const path = `/orders/v0/orders/${orderId}`;

    // ==========================
    // AWS Signature V4 Options
    // ==========================
    const options = {
      host,
      path,
      service: serviceName || "execute-api",
      region: region || "us-east-1",
      method: "GET",
      headers: {
        host,
        "x-amz-access-token": accessToken,
        accept: "application/json",
        "content-type": "application/json",
      },
    };

    // ==========================
    // Sign Request
    // ==========================
    aws4.sign(options, {
      accessKeyId: awsAccessKey,
      secretAccessKey: awsSecretKey,
    });

    console.log("Calling Amazon Get Order API:");
    console.log(`https://${host}${path}`);

    // ==========================
    // Call Amazon SP-API
    // ==========================
    const response = await axios.get(
      `https://${host}${path}`,
      {
        headers: options.headers,
      }
    );

    // ==========================
    // Success Response
    // ==========================
    res.status(200).json({
      success: true,
      data: response.data,
    });

  } catch (error) {
    console.error(
      "Get Order API Error:",
      error.response?.data || error.message
    );

    res.status(error.response?.status || 500).json({
      success: false,
      error:
        error.response?.data || {
          message: error.message,
        },
    });
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
    const {
      accessToken,
      awsAccessKey,
      awsSecretKey,
      region = "us-east-1",
      serviceName = "execute-api",
      environment = "sandbox",        // Changed default to sandbox for testing
      sku,
      asin,
      marketplaceId,
      itemCondition = "New",
      customerType = "Consumer"       // Added common parameter
    } = req.body;

    // Validation
    if (!accessToken) return res.status(400).json({ error: "Access Token is required" });
    if (!awsAccessKey || !awsSecretKey) return res.status(400).json({ error: "AWS Access Key and Secret Key are required" });
    if (!marketplaceId) return res.status(400).json({ error: "Marketplace ID is required" });
    if (!sku && !asin) return res.status(400).json({ error: "Either SKU or ASIN is required" });

    const host = environment === "production"
      ? "sellingpartnerapi-na.amazon.com"
      : "sandbox.sellingpartnerapi-na.amazon.com";

    const identifier = sku || asin;
    // Build query parameters properly
    const params = new URLSearchParams({
      MarketplaceId: marketplaceId,
      ItemCondition: itemCondition,
      CustomerType: customerType
    });

    if (sku) {
      params.append("SellerSKU", sku);
    }

    const path = `/products/pricing/v0/items/${identifier}/offers?${params.toString()}`;

    const opts = {
      host,
      path,
      service: serviceName,
      region,
      method: "GET",
      headers: {
        "x-amz-access-token": accessToken,
        "accept": "application/json",
        "user-agent": "MyApp/1.0 (Language=Node.js)"
      }
    };

    aws4.sign(opts, {
      accessKeyId: awsAccessKey,
      secretAccessKey: awsSecretKey
    });

    console.log(`Calling Pricing API: https://${host}${path}`);

    const response = await axios.get(`https://${host}${path}`, {
      headers: opts.headers
    });

    res.json(response.data);

  } catch (err) {
    console.error("Pricing API Error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      success: false,
      error: err.response?.data || { message: err.message }
    });
  }
});

/*
=====================================================
FBA Inventory API
=====================================================
*/

app.get("/api/inventory", async (req, res) => {

    try {

        const marketplaceId =
            req.query.marketplaceId || "A21TJRUUN4KGV";

        const details =
            req.query.details || true;

        const query =

            `/fba/inventory/v1/summaries` +

            `?details=${details}` +

            `&granularityType=Marketplace` +

            `&granularityId=${marketplaceId}` +

            `&marketplaceIds=${marketplaceId}`;

        const options = {

            host: "sellingpartnerapi-na.amazon.com",

            service: "execute-api",

            region: process.env.AWS_REGION,

            method: "GET",

            path: query,

            headers: {

                "x-amz-access-token":
                    process.env.LWA_ACCESS_TOKEN,

                "content-type":
                    "application/json"

            }

        };

        aws4.sign(options, {

            accessKeyId:
                process.env.AWS_ACCESS_KEY_ID,

            secretAccessKey:
                process.env.AWS_SECRET_ACCESS_KEY

        });

        const response = await axios({

            method: "GET",

            url:
                `https://${options.host}${options.path}`,

            headers: options.headers

        });

        const payload =
            response.data.payload;

        const inventorySummaries =
            payload.inventorySummaries || [];

        let totalAvailable = 0;
        let totalReserved = 0;
        let totalInbound = 0;
        let totalResearching = 0;
        let totalUnfulfillable = 0;

        const inventory = inventorySummaries.map(item => {

            const available =
                item.fulfillableQuantity || 0;

            const reserved =
                item.reservedQuantity?.totalReservedQuantity || 0;

            const inbound =

                (item.inboundWorkingQuantity || 0) +

                (item.inboundShippedQuantity || 0) +

                (item.inboundReceivingQuantity || 0);

            const researching =
                item.researchingQuantity?.totalResearchingQuantity || 0;

            const unfulfillable =
                item.unfulfillableQuantity?.totalUnfulfillableQuantity || 0;

            totalAvailable += available;
            totalReserved += reserved;
            totalInbound += inbound;
            totalResearching += researching;
            totalUnfulfillable += unfulfillable;

            return {

                asin:
                    item.asin,

                sku:
                    item.sellerSku,

                condition:
                    item.condition,

                available,

                reserved,

                inbound,

                researching,

                unfulfillable

            };

        });

        res.json({

            summary: {

                available:
                    totalAvailable,

                reserved:
                    totalReserved,

                inbound:
                    totalInbound,

                researching:
                    totalResearching,

                unfulfillable:
                    totalUnfulfillable

            },

            inventory

        });

    }
  catch (error) {

    console.error(error);

    console.error(error.stack);

    res.status(500).json({
        success: false,
        message: error.message,
        stack: error.stack
    });

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


// ===== FINANCES =====
app.post("/api/finances/events", async (req, res) => {
  const { accessToken, awsAccessKey, awsSecretKey, region, environment, postedAfter } = req.body;

  const isSandbox = environment !== "production";
  const host = isSandbox 
    ? "sandbox.sellingpartnerapi-na.amazon.com" 
    : "sellingpartnerapi-na.amazon.com";

  // Base path without query parameters
  let basePath = "/finances/v0/financialEvents";
  let queryParams = {};

  // Amazon Sandbox pattern-matcher breaks on dynamic parameters.
  // Only append PostedAfter if we are in Production OR using a supported sandbox mock date.
  if (postedAfter && !isSandbox) {
    queryParams["PostedAfter"] = postedAfter;
  } else if (isSandbox) {
    // Optional: Standard Static Sandbox mock date if you absolutely want to pass a date parameter
    // queryParams["PostedAfter"] = "2020-03-01T00:00:00Z"; 
  }

  // Construct the query string properly
  const queryString = Object.keys(queryParams).length > 0
    ? '?' + Object.entries(queryParams)
        .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
        .join('&')
    : '';

  const fullPath = `${basePath}${queryString}`;

  const opts = { 
    host, 
    path: fullPath, // Must match the exact path + query sent via axios
    service: "execute-api", 
    region, 
    method: "GET", 
    headers: { 
      "x-amz-access-token": accessToken,
      "accept": "application/json"
    } 
  };

  // Sign the request structure using aws4
  aws4.sign(opts, { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey });

  // Deep clone headers and clean up any payload headers that trigger API Gateway 400s on GET requests
  const cleanHeaders = { ...opts.headers };
  const headersToDestroy = ['content-type', 'content-length', 'accept-encoding', 'connection'];
  
  Object.keys(cleanHeaders).forEach(key => {
    if (headersToDestroy.includes(key.toLowerCase())) {
      delete cleanHeaders[key];
    }
  });

  try {
    const response = await axios({ 
      method: "GET", 
      url: `https://${host}${fullPath}`, 
      headers: cleanHeaders 
    });
    
    res.json(response.data);
  } catch (error) {
    // Send back Amazon's detailed error payload instead of a generic axios status
    const errorData = error.response?.data || { error: error.message };
    res.status(error.response?.status || 500).json(errorData);
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

app.post("/shipping/tracking", async (req, res) => {
  try {
    const {
      accessToken,
      awsAccessKey,
      awsSecretKey,
      region,
      environment,
      trackingId,
    } = req.body;

    const host =
      environment === "production"
        ? "sellingpartnerapi-na.amazon.com"
        : "sandbox.sellingpartnerapi-na.amazon.com";

    const path = `/shipping/v2/tracking/${trackingId}`;

    const opts = {
      host,
      path,
      service: "execute-api",
      region,
      method: "GET",
      headers: {
        "x-amz-access-token": accessToken,
        "content-type": "application/json",
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

// ===== PRODUCT TYPES =====
// ======================================================
// Product Types API - Search Product Types
// ======================================================
app.post("/api/product-types/search", async (req, res) => {
  try {
    const {
      accessToken,
      awsAccessKey,
      awsSecretKey,
      region,
      environment,
      marketplaceIds,
    } = req.body;

    // Validate required parameters
    if (
      !accessToken ||
      !awsAccessKey ||
      !awsSecretKey ||
      !region ||
      !marketplaceIds
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters.",
      });
    }

    // Select Amazon SP-API Host
    const host =
      environment === "production"
        ? "sellingpartnerapi-na.amazon.com"
        : "sandbox.sellingpartnerapi-na.amazon.com";

    // API Endpoint
    const path = `/definitions/2020-09-01/productTypes?marketplaceIds=${marketplaceIds}`;

    // AWS Signature V4 Request Options
    const options = {
      host,
      path,
      service: "execute-api",
      region,
      method: "GET",
      headers: {
        "x-amz-access-token": accessToken,
        Accept: "application/json",
      },
    };

    // Sign the request
    aws4.sign(options, {
      accessKeyId: awsAccessKey,
      secretAccessKey: awsSecretKey,
    });

    // Call Amazon SP-API
    const response = await axios({
      method: "GET",
      url: `https://${host}${path}`,
      headers: options.headers,
    });

    // Success Response
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Product Type Search Error:", error.response?.data || error.message);

    return res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
});

app.post("/api/product-types/definition", async (req, res) => {
  const {
    accessToken,
    awsAccessKey,
    awsSecretKey,
    region,
    environment,
    marketplaceIds,
    productType
  } = req.body;

  const host =
    environment === "production"
      ? "sellingpartnerapi-na.amazon.com"
      : "sandbox.sellingpartnerapi-na.amazon.com";

  const path = `/definitions/2020-09-01/productTypes/${productType}?marketplaceIds=${marketplaceIds}`;

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

  try {
    const response = await axios({
      method: "GET",
      url: `https://${host}${path}`,
      headers: opts.headers
    });

    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(
      error.response?.data || { error: error.message }
    );
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

app.post("/api/product-types/schema", async (req, res) => {
  try {
    const {
      accessToken,
      awsAccessKey,
      awsSecretKey,
      region,
      serviceName,
      schemaUrl
    } = req.body;

    if (!schemaUrl) {
      return res.status(400).json({
        error: "schemaUrl is required."
      });
    }

    const url = new URL(schemaUrl);

    const opts = {
      host: url.host,
      path: url.pathname + url.search,
      method: "GET",
      service: serviceName,
      region,
      headers: {
        "x-amz-access-token": accessToken,
        host: url.host
      }
    };

    aws4.sign(opts, {
      accessKeyId: awsAccessKey,
      secretAccessKey: awsSecretKey
    });

    const response = await axios({
      method: "GET",
      url: url.href,
      headers: opts.headers
    });

    res.json(response.data);

  } catch (err) {

    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(500).json({
        error: err.message
      });
    }

  }
});

//     Messaging 

// POST /api/feedback/topics
app.post('/api/feedback/topics', async (req, res) => {
  const {
    accessToken,
    awsAccessKey,     // Available here if you are implementing custom AWS SigV4 signing
    awsSecretKey,     // Available here if you are implementing custom AWS SigV4 signing
    region,
    serviceName,
    environment,
    asin,
    marketplaceId,
    sortBy
  } = req.body;

  // 1. Basic Parameter Validation
  if (!asin || !marketplaceId || !sortBy) {
    return res.status(400).json({ 
      error: 'Missing required feedback criteria: asin, marketplaceId, or sortBy are mandatory.' 
    });
  }

  if (!accessToken) {
    return res.status(401).json({ 
      error: 'Missing Amazon SP-API Access Token.' 
    });
  }

  // 2. Resolve Environment Endpoint URL
  // Default to North America Sandbox/Production endpoints. Modify matching patterns if targeting EU/FE regions.
  const baseUrl = environment === 'production' 
    ? 'https://sellingpartnerapi-na.amazon.com' 
    : 'https://sandbox.sellingpartnerapi-na.amazon.com';

  const targetPath = `/customerFeedback/2024-06-01/items/${asin}/reviews/topics`;
  const endpointUrl = `${baseUrl}${targetPath}`;

  try {
    // 3. Dispatch direct request to Amazon Selling Partner API
    const response = await axios.get(endpointUrl, {
      params: { 
        marketplaceId, 
        sortBy 
      },
      headers: {
        'X-Amz-Access-Token': accessToken,
        'Accept': 'application/json'
      }
    });

    // 4. Handle Empty Content States cleanly
    if (response.status === 204) {
      return res.status(200).json({
        message: 'No feedback topics data available for this ASIN.',
        positiveTopics: [],
        negativeTopics: []
      });
    }

    // Return the functional object mapping back to the client
    return res.status(200).json(response.data);

  } catch (error) {
    console.error('SP-API Error Context:', error.response?.data || error.message);
    
    const statusCode = error.response?.status || 500;
    const errorPayload = error.response?.data || { 
      errors: [{ message: error.message || 'Internal Server communication failure.' }] 
    };

    return res.status(statusCode).json(errorPayload);
  }
});

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

// ==================== 9. UPLOADS APIs ====================
app.post("/api/create-upload-destination", async (req, res) => {
  try {
    const {
      accessToken,
      awsAccessKey,
      awsSecretKey,
      region,
      environment,
    } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "Access Token is required.",
      });
    }

    const host =
      environment === "production"
        ? "sellingpartnerapi-na.amazon.com"
        : "sandbox.sellingpartnerapi-na.amazon.com";

    const path = "/uploads/2020-11-01/uploadDestinations";

    const body = JSON.stringify({
      contentType: "text/xml; charset=UTF-8",
    });

    const options = {
      host,
      path,
      service: "execute-api",
      region,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-amz-access-token": accessToken,
      },
      body,
    };

    aws4.sign(options, {
      accessKeyId: awsAccessKey,
      secretAccessKey: awsSecretKey,
    });

    const response = await axios({
      method: "POST",
      url: `https://${host}${path}`,
      headers: options.headers,
      data: JSON.parse(body),
    });

    res.json({
      success: true,
      payload: response.data,
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
});

///////////// shipment////////////////////////
// Mock Data Database Store
// In-Memory Database Store for Testing Engine
let scheduledPackages = [
  {
    amazonOrderId: "403-1234567-1234567",
    marketplaceId: "ATVPDKIKX0DER",
    packageStatus: "Scheduled",
    scheduledSlot: {
      slotId: "slot-2026-07-20-morning",
      startTime: "2026-07-20T09:00:00Z",
      endTime: "2026-07-20T13:00:00Z"
    },
    packageDimensions: { length: 20, width: 15, height: 10, unit: "cm" },
    packageWeight: { value: 1.5, unit: "kg" }
  }
];

// ====================================================================
// API 1: Find Handover Slots
// Route: POST -> http://localhost:5000/easyShip/2022-03-23/timeSlot
// ====================================================================
app.post('/easyShip/2022-03-23/timeSlot', (req, res) => {
  const { accessToken, amazonOrderId, marketplaceId, packageDimensions, packageWeight } = req.body;

  if (!accessToken) {
    return res.status(401).json({
      errors: [{ code: "Unauthorized", message: "Missing Access Token credentials." }]
    });
  }

  if (!amazonOrderId || !marketplaceId || !packageDimensions || !packageWeight) {
    return res.status(400).json({
      errors: [{ code: "InvalidInput", message: "Missing order or package dimensions configurations." }]
    });
  }

  // Generate dynamic mockup pickup slots based on July 2026 timeframe
  const timeSlots = [
    { 
      slotId: "slot-2026-07-20-morning", 
      startTime: "2026-07-20T09:00:00Z", 
      endTime: "2026-07-20T13:00:00Z" 
    },
    { 
      slotId: "slot-2026-07-20-afternoon", 
      startTime: "2026-07-20T14:00:00Z", 
      endTime: "2026-07-20T18:00:00Z" 
    },
    { 
      slotId: "slot-2026-07-21-morning", 
      startTime: "2026-07-21T09:00:00Z", 
      endTime: "2026-07-21T13:00:00Z" 
    }
  ];

  res.status(200).json({ timeSlots });
});

// ====================================================================
// API 2: Check Package Status
// Route: GET -> http://localhost:5000/easyShip/2022-03-23/package
// ====================================================================
app.get('/easyShip/2022-03-23/package', (req, res) => {
  const { amazonOrderId, marketplaceId } = req.query;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      errors: [{ code: "Unauthorized", message: "Access Token missing from Authorization header." }]
    });
  }

  if (!amazonOrderId || !marketplaceId) {
    return res.status(400).json({
      errors: [{ code: "InvalidParameter", message: "amazonOrderId and marketplaceId are mandatory parameters." }]
    });
  }

  const foundPackage = scheduledPackages.find(
    p => p.amazonOrderId === amazonOrderId && p.marketplaceId === marketplaceId
  );

  if (!foundPackage) {
    return res.status(404).json({
      errors: [{ code: "NotFound", message: "No scheduled package record found for this Order ID." }]
    });
  }

  res.status(200).json(foundPackage);
});

// ====================================================================
// API 3: Schedule Package Handover
// Route: POST -> http://localhost:5000/easyShip/2022-03-23/package
// ====================================================================
app.post('/easyShip/2022-03-23/package', (req, res) => {
  const { 
    accessToken, 
    amazonOrderId, 
    marketplaceId, 
    packageDimensions, 
    packageWeight, 
    handOverTimeSlot 
  } = req.body;

  if (!accessToken) {
    return res.status(401).json({
      errors: [{ code: "Unauthorized", message: "Missing Access Token." }]
    });
  }

  if (!amazonOrderId || !marketplaceId || !handOverTimeSlot?.slotId) {
    return res.status(400).json({
      errors: [{ code: "InvalidInput", message: "Missing scheduling context parameters." }]
    });
  }

  const newPackageRegistration = {
    amazonOrderId,
    marketplaceId,
    packageStatus: "Scheduled",
    scheduledSlot: handOverTimeSlot,
    packageDimensions,
    packageWeight
  };

  scheduledPackages.push(newPackageRegistration);
  res.status(200).json(newPackageRegistration);
});

// ====================================================================
// API 4: Reschedule / Update Package Settings
// Route: PATCH -> http://localhost:5000/easyShip/2022-03-23/package
// ====================================================================
app.patch('/easyShip/2022-03-23/package', (req, res) => {
  const { accessToken, amazonOrderId, marketplaceId, handOverTimeSlot } = req.body;

  if (!accessToken) {
    return res.status(401).json({
      errors: [{ code: "Unauthorized", message: "Missing Access Token authentication parameters." }]
    });
  }

  const recordIndex = scheduledPackages.findIndex(
    p => p.amazonOrderId === amazonOrderId && p.marketplaceId === marketplaceId
  );

  if (recordIndex === -1) {
    return res.status(404).json({
      errors: [{ code: "NotFound", message: "The requested scheduled package does not exist." }]
    });
  }

  // Update existing package parameters
  scheduledPackages[recordIndex].scheduledSlot = handOverTimeSlot;
  scheduledPackages[recordIndex].packageStatus = "Rescheduled";

  res.status(200).json(scheduledPackages[recordIndex]);
});


// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});