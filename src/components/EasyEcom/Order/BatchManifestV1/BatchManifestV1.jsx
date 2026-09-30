import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function BatchManifestV1() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBatchManifest = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    const payload = {
      status: true,
      manifest_id: "4753258",
      manifest_number: "20251114155815828107475764076998",
      manifest_document:
        "https://ee-uploaded-files-staging.s3.ap-south-1.amazonaws.com/manifests/Manifest3514212025111435943.pdf?request-content-type=application/force-download",
      marketplace_name: "Offline",
      courier_partner: "HandOver",
      total_shipments: 3,
      shipments: [
        {
          awb_number: "1290785163186334",
          order_number: "Offline-Maniffestt-31",
          invoice_number: "CUK1-2324-1958",
          quantity: 40
        },
        {
          awb_number: "1290785170070137",
          order_number: "Offline-Maniffestt-32",
          invoice_number: "CUK1-2324-1959",
          quantity: 40
        },
        {
          awb_number: "1291006013860805",
          order_number: "serialInInvoice001",
          invoice_number: "CUK1-2324-1969",
          quantity: 6
        }
      ],
      manifest_created_date: "2025-11-14 15:58:15",
      manifest_completed_date: "2025-11-14 15:59:42",
      manifest_completed_by: "Test_Parija "
    };

    try {
      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/webhook/batch-manifest-v1`,
        payload,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      setResponse(result.data);
    } catch (err) {
      console.error("Batch Manifest V1 Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Batch Manifest V1 failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>EasyEcom Batch Manifest V1</h2>

      <p>
        Endpoint:
        <strong>
          {" "}
          POST /api/easyecom/webhook/batch-manifest-v1
        </strong>
      </p>

      <button
        type="button"
        onClick={handleBatchManifest}
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Batch Manifest V1"}
      </button>

      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
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

export default BatchManifestV1;