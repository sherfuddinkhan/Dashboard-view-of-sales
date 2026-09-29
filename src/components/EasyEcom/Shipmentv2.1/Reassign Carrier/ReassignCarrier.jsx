import React, { useState } from "react";

const ReassignCarrier = () => {
  const [companyCarrierId, setCompanyCarrierId] =
    useState("6691");

  const [referenceCode, setReferenceCode] = useState(
    "ODTESTRTDPOD05_95_45_10"
  );

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const params = new URLSearchParams({
        company_carrier_id: companyCarrierId,
        reference_code: referenceCode,
      });

      const res = await fetch(
        `http://localhost:5000/api/easyecom/orders/reassign-carrier?${params.toString()}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Reassign Carrier failed"
        );
      }

      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "30px auto" }}>
      <h2>Reassign Carrier</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Company Carrier ID</label>

          <input
            type="number"
            value={companyCarrierId}
            onChange={(e) =>
              setCompanyCarrierId(e.target.value)
            }
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Reference Code</label>

          <input
            type="text"
            value={referenceCode}
            onChange={(e) =>
              setReferenceCode(e.target.value)
            }
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Reassigning..." : "Reassign Carrier"}
        </button>
      </form>

      {error && (
        <div
          style={{
            marginTop: "20px",
            color: "red",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div style={{ marginTop: "20px" }}>
          <h3>Response</h3>

          <pre
            style={{
              background: "#f5f5f5",
              padding: "15px",
              overflowX: "auto",
            }}
          >
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ReassignCarrier;

