import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const GetQueueStatus = () => {
  const [queueId, setQueueId] = useState("51011820");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setResponse(null);
    setError("");

    try {
      if (!queueId.trim()) {
        throw new Error("Queue ID is required.");
      }

      const params = new URLSearchParams({
        queueId: queueId.trim(),
      });

      const res = await fetch(
        `${SERVER_URL}/api/getQueueStatus?${params.toString()}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error?.message ||
            data?.message ||
            "Failed to get queue status."
        );
      }

      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQueueId("51011820");
    setResponse(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "30px auto",
        padding: "25px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Get Queue Status</h2>

      <p>
        Check the processing status of an EasyEcom queue.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginTop: "20px" }}>
          <label
            htmlFor="queueId"
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "bold",
            }}
          >
            Queue ID
          </label>

          <input
            id="queueId"
            name="queueId"
            type="text"
            value={queueId}
            onChange={(e) => setQueueId(e.target.value)}
            placeholder="51011820"
            style={{
              width: "100%",
              maxWidth: "400px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginTop: "20px" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 18px",
              marginRight: "10px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Loading..." : "Get Queue Status"}
          </button>

          <button
            type="button"
            onClick={handleClear}
            style={{
              padding: "10px 18px",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </div>
      </form>

      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            background: "#ffe5e5",
            border: "1px solid #ff9999",
            borderRadius: "5px",
            color: "#b00000",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div style={{ marginTop: "25px" }}>
          <h3>Response</h3>

          <pre
            style={{
              background: "#f5f5f5",
              padding: "15px",
              borderRadius: "5px",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default GetQueueStatus;