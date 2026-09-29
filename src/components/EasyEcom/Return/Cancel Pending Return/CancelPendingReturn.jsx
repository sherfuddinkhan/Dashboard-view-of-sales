
import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const CancelPendingReturn = () => {
  const [creditNoteId, setCreditNoteId] = useState("2470098");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleCancel = async () => {
    setError("");
    setResponse(null);

    try {
      const res = await fetch(
        `${SERVER_URL}/api/easyecom/cancel-pending-return`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            creditNoteId: Number(creditNoteId),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error?.message ||
            data?.message ||
            "Failed to cancel pending return"
        );
      }

      setResponse(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "30px auto",
        padding: "20px",
      }}
    >
      <h2>Cancel Pending Return</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>Credit Note ID</label>

        <input
          type="number"
          value={creditNoteId}
          onChange={(e) => setCreditNoteId(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            marginTop: "5px",
          }}
        />
      </div>

      <button type="button" onClick={handleCancel}>
        Cancel Pending Return
      </button>

      {error && (
        <pre
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#ffe6e6",
            color: "red",
            whiteSpace: "pre-wrap",
          }}
        >
          {error}
        </pre>
      )}

      {response && (
        <pre
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f5f5f5",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default CancelPendingReturn;

