import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function GRNDetailV1() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGRNDetail = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    const payload = {
      buyerCompanyName: "Test Location 1",
      location_key: "ht7885084804",
      buyerCity: "Howrah",
      buyerCountry: "India",
      buyerStreet:
        "Jai mata di apartment 3rd floor near bandhu mahal, sapuipara, bally, howrah - 711227 ",
      buyerPincode: "711227",
      buyerState: "West Bengal",

      vendorCode: null,
      vendorName: "Test Location 1",
      vendor_gstn: "19ASSDFGCVGGHJJ",
      vendorCity: "Howrah",
      vendorCountry: "India",
      vendorStreet:
        "Jai mata di apartment 3rd floor near bandhu mahal, sapuipara, bally, howrah - 711227 ",
      vendorPincode: "711227",
      vendorState: "West Bengal",

      grnId: 469544,
      grnInvoiceNumber: "AutoGrn",
      grnInvoiceDate: "2023-10-19",
      grnCreatedAt: "2023-10-19 22:17:07",
      grnStatus: "QC Complete",

      poRefNum: "Auto PO",
      grnPrice: 10,
      poNumber: 484788,
      poStatus: "Completed",
      poCreateDate: "2023-10-19 22:17:07",

      sku: "1001",
      received_quantity: 100,
      poQuantity: 100,

      product_unique_code: "8981349877888",

      mrp: 5000,

      batchCode: null,
      totalGrn: null,

      currentGrnItemdate: "2023-10-19 22:17:07",

      lineItemNo: null
    };

    try {
      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/webhook/grn-detail-v1`,
        payload,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      setResponse(result.data);
    } catch (err) {
      console.error("GRN Detail V1 Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "GRN Detail V1 failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>EasyEcom GRN Detail V1</h2>

      <p>
        Endpoint:
        <strong>
          {" "}
          POST /api/easyecom/webhook/grn-detail-v1
        </strong>
      </p>

      <button
        type="button"
        onClick={handleGRNDetail}
        disabled={loading}
      >
        {loading ? "Sending..." : "Send GRN Detail V1"}
      </button>

      {error && (
        <div
          style={{
            marginTop: "20px",
            color: "red"
          }}
        >
          <strong>Error:</strong>
          <pre>{error}</pre>
        </div>
      )}

      {response && (
        <div style={{ marginTop: "20px" }}>
          <h3>Response</h3>

          <pre>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default GRNDetailV1;