import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function CheckCompany() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckCompany = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const result = await axios.get(
        `${SERVER_URL}/api/easyecom/company/check-company`,
        {
          params: {
            branding_user_id:
              "testapicompany@gmail.com",

            client_id:
              "abcdTest1234"
          }
        }
      );

      setResponse(result.data);
    } catch (err) {
      console.error("Check Company Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Check Company failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>EasyEcom Check Company</h2>

      <p>
        GET{" "}
        <strong>
          /company/checkCompany
        </strong>
      </p>

      <button
        type="button"
        onClick={handleCheckCompany}
        disabled={loading}
      >
        {loading
          ? "Checking..."
          : "Check Company"}
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

export default CheckCompany;