import React from "react";
import ErrorDisplay from "../Common/ErrorDisplay";

const NotificationResult = ({ result, error, setError, loading }) => {
  // Safely extract Amazon's nested error structure if it exists
  const normalizedError = error?.errors?.[0]
    ? { message: `${error.errors[0].code}: ${error.errors[0].message}` }
    : error;

  return (
    <div style={{ marginTop: "20px" }}>
      {/* Error banner */}
      <ErrorDisplay
        error={normalizedError}
        onClose={() => setError(null)}
      />

      {/* Case 1: Data exists successfully */}
      {result && (
        <div style={styles.resultContainer}>
          <h3 style={styles.heading}>Result</h3>
          <pre style={styles.pre}>
            {typeof result === "string"
              ? result
              : JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* Case 2: Loading State */}
      {loading && (
        <div style={styles.emptyState}>
          <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>⏳</span>
          <p style={{ margin: 0, color: "#2b6cb0", fontWeight: "600" }}>
            Contacting the Amazon API Proxy server...
          </p>
        </div>
      )}

      {/* Case 3: Idle / Waiting State */}
      {!result && !error && !loading && (
        <div style={styles.emptyState}>
          <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>👆</span>
          <p style={{ margin: 0, color: "#666", fontWeight: "500" }}>
            No statement loaded. Click the blue <strong style={{color: "#2563eb"}}>"Load Financial Statements"</strong> button above to pull data.
          </p>
        </div>
      )}
    </div>
  );
};

const styles = {
  resultContainer: {
    marginTop: "10px",
    padding: "20px",
    backgroundColor: "#ffffff",
    border: "1px solid #dcdcdc",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },
  heading: {
    margin: "0 0 15px",
    color: "#333",
    fontSize: "18px",
    fontWeight: "600",
  },
  pre: {
    margin: 0,
    padding: "15px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #ddd",
    borderRadius: "6px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowX: "auto",
    maxHeight: "450px",
    overflowY: "auto",
    fontSize: "14px",
    lineHeight: "1.5",
    fontFamily: "Consolas, Monaco, monospace",
  },
  emptyState: {
    padding: "40px 20px",
    textAlign: "center",
    backgroundColor: "#fff",
    border: "2px dashed #e2e8f0",
    borderRadius: "12px",
    fontSize: "14px",
  }
};

export default NotificationResult;