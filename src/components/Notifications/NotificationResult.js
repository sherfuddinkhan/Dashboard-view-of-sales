import React from "react";
import ErrorDisplay from "../Common/ErrorDisplay";

const NotificationResult = ({
  result,
  error,
  setError,
}) => {
  return (
    <>
      <ErrorDisplay
        error={error}
        onClose={() => setError(null)}
      />

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
    </>
  );
};

const styles = {
  resultContainer: {
    marginTop: "20px",
    padding: "20px",
    backgroundColor: "#ffffff",
    border: "1px solid #dcdcdc",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },

  heading: {
    margin: "0 0 15px",
    color: "#333",
    fontSize: "20px",
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
};

export default NotificationResult;