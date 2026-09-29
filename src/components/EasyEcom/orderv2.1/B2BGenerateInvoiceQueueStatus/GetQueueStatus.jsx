import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const GetQueueStatus = () => {
  const [queueId, setQueueId] = useState("64912950");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getQueueStatus = async () => {
    try {
      setLoading(true);
      setError("");
      setResponse(null);

      const params = new URLSearchParams({
        queueId,
      });

      const res = await fetch(
        `${SERVER_URL}/api/easyecom/queue-status?${params.toString()}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to get queue status"
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
    <div style={{ padding: "20px" }}>
      <h2>Get Queue Status</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>Queue ID</label>
        <br />

        <input
          type="number"
          value={queueId}
          onChange={(e) => setQueueId(e.target.value)}
          placeholder="64912950"
          style={{
            width: "300px",
            padding: "8px",
          }}
        />
      </div>

      <button
        onClick={getQueueStatus}
        disabled={loading}
      >
        {loading ? "Loading..." : "Get Queue Status"}
      </button>

      {error && (
        <div
          style={{
            color: "red",
            marginTop: "20px",
          }}
        >
          {error}
        </div>
      )}

      {response && (
        <pre
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f5f5f5",
            overflow: "auto",
          }}
        >
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default GetQueueStatus;

