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
        <>
          <h3>Result</h3>

          <pre style={styles.pre}>
            {result}
          </pre>
        </>
      )}
    </>
  );
};

const styles = {
  pre: {
    background: "#f1f5f9",
    padding: 15,
    borderRadius: 6,
    overflow: "auto",
    fontSize: 12,
  },
};

export default NotificationResult;