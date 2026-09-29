import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function SalesOrderERPStatus() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    const payload = {
      items: [
        {
          invoice_id: 77930869,
          erp_status_id: 3,
          erp_transaction_id: 123432123,
          erp_response: "Successfull"
        },
        {
          invoice_id: 77948927,
          erp_status_id: 1,
          erp_transaction_id: 123432124,
          erp_response: "Successfull"
        }
      ]
    };

    try {
      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/erp/update-erp-status`,
        payload
      );

      setResponse(result.data);
    } catch (err) {
      console.error("Sales Order ERP Status Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Sales Order ERP status update failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>EasyEcom Sales Order ERP Status</h2>

      <p>
        POST{" "}
        <strong>/erp/update_erp_status</strong>
      </p>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Updating..." : "Update Sales Order ERP Status"}
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

export default SalesOrderERPStatus;