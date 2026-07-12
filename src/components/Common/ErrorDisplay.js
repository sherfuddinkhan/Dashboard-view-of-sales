import React from "react";

const ErrorDisplay = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div
      style={{
        background: "#fee2e2",
        border: "1px solid #ef4444",
        color: "#991b1b",
        padding: "15px",
        borderRadius: "6px",
        marginBottom: "20px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>Error</strong>

        <button
          onClick={onClose}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: "18px",
            color: "#991b1b",
          }}
        >
          ×
        </button>
      </div>

      <pre
        style={{
          marginTop: "10px",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontSize: "13px",
        }}
      >
        {error.response?.data
          ? JSON.stringify(error.response.data, null, 2)
          : error.message || String(error)}
      </pre>
    </div>
  );
};

export default ErrorDisplay;