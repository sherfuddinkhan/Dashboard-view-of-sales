import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const TERMINAL_STATUSES = [
  "SUCCESSFUL",
  "FAILED",
  "ERROR",
  "CANCELLED",
];

function GetExportJobStatus() {
  const [jobCode, setJobCode] = useState("");

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [pollInterval, setPollInterval] = useState(5000);

  const intervalRef = useRef(null);

  // ------------------------------------------------------------
  // Styles
  // ------------------------------------------------------------

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f5f7fb",
      padding: "30px",
      fontFamily:
        "Arial, Helvetica, sans-serif",
    },

    container: {
      maxWidth: "1000px",
      margin: "0 auto",
    },

    header: {
      background: "#fff",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "20px",
      boxShadow:
        "0 2px 10px rgba(0,0,0,0.06)",
    },

    title: {
      margin: 0,
      fontSize: "26px",
      color: "#172033",
    },

    subtitle: {
      marginTop: "8px",
      color: "#667085",
      fontSize: "14px",
      lineHeight: 1.5,
    },

    card: {
      background: "#fff",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "20px",
      boxShadow:
        "0 2px 10px rgba(0,0,0,0.06)",
    },

    label: {
      display: "block",
      marginBottom: "7px",
      fontSize: "13px",
      fontWeight: 600,
      color: "#344054",
    },

    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "12px",
      border: "1px solid #d0d5dd",
      borderRadius: "8px",
      fontSize: "14px",
      outline: "none",
    },

    select: {
      width: "100%",
      boxSizing: "border-box",
      padding: "12px",
      border: "1px solid #d0d5dd",
      borderRadius: "8px",
      fontSize: "14px",
      background: "#fff",
    },

    buttonRow: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      marginTop: "18px",
    },

    primaryButton: {
      border: 0,
      borderRadius: "8px",
      padding: "12px 20px",
      background: "#2563eb",
      color: "#fff",
      fontWeight: 600,
      cursor: "pointer",
    },

    secondaryButton: {
      border: "1px solid #d0d5dd",
      borderRadius: "8px",
      padding: "11px 18px",
      background: "#fff",
      color: "#344054",
      fontWeight: 600,
      cursor: "pointer",
    },

    successBox: {
      padding: "16px",
      borderRadius: "8px",
      background: "#ecfdf3",
      border: "1px solid #abefc6",
      color: "#067647",
      marginBottom: "16px",
    },

    processingBox: {
      padding: "16px",
      borderRadius: "8px",
      background: "#fffaeb",
      border: "1px solid #fedf89",
      color: "#b54708",
      marginBottom: "16px",
    },

    failedBox: {
      padding: "16px",
      borderRadius: "8px",
      background: "#fef3f2",
      border: "1px solid #fecdca",
      color: "#b42318",
      marginBottom: "16px",
    },

    errorBox: {
      padding: "14px 16px",
      borderRadius: "8px",
      background: "#fef3f2",
      border: "1px solid #fecdca",
      color: "#b42318",
      marginBottom: "16px",
    },

    result: {
      background: "#0f172a",
      color: "#e2e8f0",
      borderRadius: "10px",
      padding: "18px",
      overflow: "auto",
      fontSize: "13px",
      lineHeight: 1.5,
    },

    downloadButton: {
      display: "inline-block",
      textDecoration: "none",
      borderRadius: "8px",
      padding: "12px 18px",
      background: "#16a34a",
      color: "#fff",
      fontWeight: 600,
      marginTop: "10px",
    },
  };

  // ------------------------------------------------------------
  // Stop polling
  // ------------------------------------------------------------

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setAutoRefresh(false);
  };

  // ------------------------------------------------------------
  // Check status
  // ------------------------------------------------------------

  const checkStatus = async (
    showLoading = true
  ) => {
    if (!jobCode.trim()) {
      setError("Job Code is required.");
      return null;
    }

    setError("");

    if (showLoading) {
      setLoading(true);
    }

    try {
      const response = await axios.post(
        `${SERVER_URL}/api/uniware/export-jobs/status`,
        {
          jobCode: jobCode.trim(),
        }
      );

      const data = response.data;

      setResult(data);

      const status = String(
        data?.status || ""
      ).toUpperCase();

      // --------------------------------------------------------
      // Stop automatic polling when job is complete
      // --------------------------------------------------------

      if (
        TERMINAL_STATUSES.includes(status)
      ) {
        stopPolling();
      }

      return data;
    } catch (err) {
      const responseData =
        err.response?.data;

      setError(
        responseData?.message ||
          responseData?.error ||
          err.message ||
          "Failed to get export job status."
      );

      setResult(
        responseData || null
      );

      stopPolling();

      return null;
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // ------------------------------------------------------------
  // Start polling
  // ------------------------------------------------------------

  const startPolling = async () => {
    if (!jobCode.trim()) {
      setError("Job Code is required.");
      return;
    }

    stopPolling();

    setError("");

    const firstResult =
      await checkStatus(true);

    if (!firstResult) {
      return;
    }

    const firstStatus = String(
      firstResult?.status || ""
    ).toUpperCase();

    if (
      TERMINAL_STATUSES.includes(
        firstStatus
      )
    ) {
      return;
    }

    setAutoRefresh(true);

    intervalRef.current = setInterval(
      async () => {
        const data =
          await checkStatus(false);

        if (!data) {
          return;
        }

        const status = String(
          data?.status || ""
        ).toUpperCase();

        if (
          TERMINAL_STATUSES.includes(
            status
          )
        ) {
          stopPolling();
        }
      },
      pollInterval
    );
  };

  // ------------------------------------------------------------
  // Cleanup
  // ------------------------------------------------------------

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(
          intervalRef.current
        );
      }
    };
  }, []);

  // ------------------------------------------------------------
  // Status
  // ------------------------------------------------------------

  const status = String(
    result?.status || ""
  ).toUpperCase();

  const isSuccessful =
    status === "SUCCESSFUL";

  const isProcessing =
    status &&
    !TERMINAL_STATUSES.includes(
      status
    );

  const isFailed =
    status === "FAILED" ||
    status === "ERROR" ||
    status === "CANCELLED";

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            Get Export Job Status
          </h1>

          <p style={styles.subtitle}>
            Check the status of a Uniware
            asynchronous export job and obtain
            the CSV report path when the job
            becomes SUCCESSFUL.
          </p>
        </div>

        {/* -------------------------------------------------- */}
        {/* Search */}
        {/* -------------------------------------------------- */}

        <div style={styles.card}>
          <label style={styles.label}>
            Job Code *
          </label>

          <input
            style={styles.input}
            value={jobCode}
            onChange={(e) =>
              setJobCode(e.target.value)
            }
            placeholder="EXP-000001"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                checkStatus();
              }
            }}
          />

          <div
            style={{
              marginTop: "8px",
              color: "#667085",
              fontSize: "13px",
            }}
          >
            Enter the jobCode returned by
            Create Export Job.
          </div>

          <div style={styles.buttonRow}>
            <button
              type="button"
              style={styles.primaryButton}
              onClick={() =>
                checkStatus(true)
              }
              disabled={loading}
            >
              {loading
                ? "Checking..."
                : "Check Status"}
            </button>

            <button
              type="button"
              style={
                styles.secondaryButton
              }
              onClick={startPolling}
              disabled={autoRefresh}
            >
              {autoRefresh
                ? "Auto Refreshing..."
                : "Auto Refresh"}
            </button>

            <button
              type="button"
              style={
                styles.secondaryButton
              }
              onClick={stopPolling}
            >
              Stop Refresh
            </button>
          </div>
        </div>

        {/* -------------------------------------------------- */}
        {/* Polling options */}
        {/* -------------------------------------------------- */}

        <div style={styles.card}>
          <label style={styles.label}>
            Auto Refresh Interval
          </label>

          <select
            style={styles.select}
            value={pollInterval}
            onChange={(e) =>
              setPollInterval(
                Number(e.target.value)
              )
            }
            disabled={autoRefresh}
          >
            <option value={3000}>
              Every 3 seconds
            </option>

            <option value={5000}>
              Every 5 seconds
            </option>

            <option value={10000}>
              Every 10 seconds
            </option>

            <option value={15000}>
              Every 15 seconds
            </option>

            <option value={30000}>
              Every 30 seconds
            </option>
          </select>

          <div
            style={{
              marginTop: "8px",
              color: "#667085",
              fontSize: "13px",
            }}
          >
            Polling automatically stops when
            Uniware returns a terminal status.
          </div>
        </div>

        {/* -------------------------------------------------- */}
        {/* Error */}
        {/* -------------------------------------------------- */}

        {error && (
          <div style={styles.errorBox}>
            <strong>Error:</strong>{" "}
            {error}
          </div>
        )}

        {/* -------------------------------------------------- */}
        {/* Status */}
        {/* -------------------------------------------------- */}

        {result && (
          <div style={styles.card}>
            {isSuccessful && (
              <div style={styles.successBox}>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                  }}
                >
                  Export Completed
                </div>

                <div
                  style={{
                    marginTop: "8px",
                  }}
                >
                  Job Code:{" "}
                  <strong>
                    {jobCode}
                  </strong>
                </div>

                {result.filePath && (
                  <div
                    style={{
                      marginTop: "12px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                      }}
                    >
                      CSV Report:
                    </div>

                    <a
                      href={result.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={
                        styles.downloadButton
                      }
                    >
                      Download CSV Report
                    </a>
                  </div>
                )}
              </div>
            )}

            {isProcessing && (
              <div
                style={styles.processingBox}
              >
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                  }}
                >
                  Export In Progress
                </div>

                <div
                  style={{
                    marginTop: "7px",
                  }}
                >
                  Current Status:{" "}
                  <strong>
                    {result.status ||
                      "PROCESSING"}
                  </strong>
                </div>

                {autoRefresh && (
                  <div
                    style={{
                      marginTop: "7px",
                    }}
                  >
                    Automatically checking
                    every{" "}
                    {pollInterval / 1000}{" "}
                    seconds...
                  </div>
                )}
              </div>
            )}

            {isFailed && (
              <div style={styles.failedBox}>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                  }}
                >
                  Export Job Failed
                </div>

                <div
                  style={{
                    marginTop: "7px",
                  }}
                >
                  Status:{" "}
                  <strong>
                    {result.status}
                  </strong>
                </div>
              </div>
            )}

            <h2
              style={{
                marginTop: 0,
                fontSize: "18px",
                color: "#172033",
              }}
            >
              Export Job Response
            </h2>

            <pre style={styles.result}>
              {JSON.stringify(
                result,
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default GetExportJobStatus;