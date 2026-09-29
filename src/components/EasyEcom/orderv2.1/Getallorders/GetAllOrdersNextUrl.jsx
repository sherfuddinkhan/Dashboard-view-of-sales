import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const GetAllOrdersNextUrl = () => {
  const [cursor, setCursor] = useState("");
  const [startDate, setStartDate] = useState(
    "2021-12-01 00:00:00"
  );
  const [endDate, setEndDate] = useState(
    "2022-01-30 00:00:00"
  );

  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getNextOrders = async () => {
    try {
      setLoading(true);
      setError("");
      setResponseData(null);

      const params = new URLSearchParams({
        cursor: cursor,
        start_date: startDate,
        end_date: endDate,
      });

      const response = await fetch(
        `${SERVER_URL}/api/easyecom/orders/next-url?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to get next orders"
        );
      }

      setResponseData(data);

      // Get next cursor from EasyEcom response
      if (data?.data?.nextUrl) {
        const nextUrl = new URL(data.data.nextUrl);

        const nextCursor =
          nextUrl.searchParams.get("cursor");

        if (nextCursor) {
          setCursor(nextCursor);
        }
      }
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <h2>Get All Orders - Next URL</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>Cursor</label>

        <br />

        <textarea
          value={cursor}
          onChange={(e) =>
            setCursor(e.target.value)
          }
          placeholder="Paste cursor from data.nextUrl"
          rows={6}
          style={{
            width: "100%",
            maxWidth: "900px",
            marginTop: "5px",
            padding: "10px",
          }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Start Date</label>

        <br />

        <input
          type="text"
          value={startDate}
          onChange={(e) =>
            setStartDate(e.target.value)
          }
          style={{
            padding: "8px",
            width: "300px",
          }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>End Date</label>

        <br />

        <input
          type="text"
          value={endDate}
          onChange={(e) =>
            setEndDate(e.target.value)
          }
          style={{
            padding: "8px",
            width: "300px",
          }}
        />
      </div>

      <button
        onClick={getNextOrders}
        disabled={loading || !cursor}
        style={{
          padding: "10px 20px",
        }}
      >
        {loading
          ? "Loading..."
          : "Get Next Orders"}
      </button>

      {error && (
        <div
          style={{
            marginTop: "20px",
            color: "red",
          }}
        >
          {error}
        </div>
      )}

      {responseData && (
        <div style={{ marginTop: "25px" }}>
          <h3>Response</h3>

          <pre
            style={{
              background: "#f5f5f5",
              padding: "15px",
              overflow: "auto",
            }}
          >
            {JSON.stringify(
              responseData,
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
};

export default GetAllOrdersNextUrl;