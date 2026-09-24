import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function CancelReversePickup() {
  const [form, setForm] = useState({
    facility: "MAIN",
    reversePickupCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const updateField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const cancelReversePickup = async () => {
    setError("");
    setResult(null);

    // ----------------------------------------------------------
    // Validation
    // ----------------------------------------------------------

    if (!form.facility.trim()) {
      setError("Facility is required.");
      return;
    }

    if (!form.reversePickupCode.trim()) {
      setError(
        "Reverse pickup code is required."
      );
      return;
    }

    // ----------------------------------------------------------
    // Request payload
    // ----------------------------------------------------------

    const payload = {
      facility: form.facility.trim(),
      reversePickupCode:
        form.reversePickupCode.trim(),
    };

    try {
      setLoading(true);

      const response = await axios.post(
        `${SERVER_URL}/api/uniware/reverse-pickups/cancel`,
        payload
      );

      setResult(response.data);
    } catch (err) {
      setResult(err.response?.data || null);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to cancel reverse pickup."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      facility: "MAIN",
      reversePickupCode: "",
    });

    setResult(null);
    setError("");
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d0d5dd",
    borderRadius: 6,
    boxSizing: "border-box",
    fontSize: 14,
  };

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: 24,
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* ------------------------------------------------------
          Header
      ------------------------------------------------------- */}

      <div style={{ marginBottom: 24 }}>
        <h2
          style={{
            margin: 0,
            marginBottom: 8,
          }}
        >
          Cancel Reverse Pick-up
        </h2>

        <p
          style={{
            margin: 0,
            color: "#667085",
          }}
        >
          Cancel a complete reverse pick-up request
          in Uniware. Partial cancellation is not
          supported.
        </p>
      </div>

      {/* ------------------------------------------------------
          Form
      ------------------------------------------------------- */}

      <div
        style={{
          border: "1px solid #eaecf0",
          borderRadius: 10,
          padding: 20,
          background: "#fff",
        }}
      >
        {/* Facility */}

        <div style={{ marginBottom: 18 }}>
          <label
            style={{
              display: "block",
              fontWeight: 600,
              fontSize: 13,
              marginBottom: 6,
            }}
          >
            Facility *
          </label>

          <input
            type="text"
            value={form.facility}
            onChange={(e) =>
              updateField(
                "facility",
                e.target.value
              )
            }
            placeholder="MAIN"
            style={inputStyle}
          />

          <small
            style={{
              display: "block",
              marginTop: 5,
              color: "#667085",
            }}
          >
            Uniware facility code.
          </small>
        </div>

        {/* Reverse Pickup Code */}

        <div style={{ marginBottom: 18 }}>
          <label
            style={{
              display: "block",
              fontWeight: 600,
              fontSize: 13,
              marginBottom: 6,
            }}
          >
            Reverse Pickup Code *
          </label>

          <input
            type="text"
            value={
              form.reversePickupCode
            }
            onChange={(e) =>
              updateField(
                "reversePickupCode",
                e.target.value
              )
            }
            placeholder="RP0022"
            style={inputStyle}
          />

          <small
            style={{
              display: "block",
              marginTop: 5,
              color: "#667085",
            }}
          >
            Example: RP0022
          </small>
        </div>

        {/* Warning */}

        <div
          style={{
            padding: 12,
            borderRadius: 6,
            background: "#fffaeb",
            color: "#93370d",
            marginBottom: 18,
            fontSize: 14,
          }}
        >
          <strong>Important:</strong>{" "}
          Partial cancellation of a reverse pickup
          is not allowed. This action cancels the
          complete reverse pickup.
        </div>

        {/* Error */}

        {error && (
          <div
            style={{
              padding: 12,
              borderRadius: 6,
              background: "#fef3f2",
              color: "#b42318",
              marginBottom: 18,
            }}
          >
            {error}
          </div>
        )}

        {/* Buttons */}

        <div
          style={{
            display: "flex",
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={cancelReversePickup}
            disabled={loading}
            style={{
              padding: "11px 20px",
              border: 0,
              borderRadius: 6,
              background: "#d92d20",
              color: "#fff",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              fontWeight: 600,
            }}
          >
            {loading
              ? "Cancelling..."
              : "Cancel Reverse Pick-up"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            disabled={loading}
            style={{
              padding: "11px 20px",
              border: "1px solid #d0d5dd",
              borderRadius: 6,
              background: "#fff",
              color: "#344054",
              cursor: "pointer",
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------
          Response
      ------------------------------------------------------- */}

      {result && (
        <div
          style={{
            marginTop: 24,
            border: "1px solid #eaecf0",
            borderRadius: 10,
            padding: 20,
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            Uniware Response
          </h3>

          {/* Status */}

          <div
            style={{
              padding: 12,
              borderRadius: 6,
              marginBottom: 12,
              background: result.successful
                ? "#ecfdf3"
                : "#fef3f2",
              color: result.successful
                ? "#027a48"
                : "#b42318",
              fontWeight: 600,
            }}
          >
            {result.successful
              ? "Reverse pickup cancelled successfully."
              : "Reverse pickup cancellation failed."}
          </div>

          {/* Message */}

          {result.message && (
            <div
              style={{
                padding: 12,
                background: "#f9fafb",
                borderRadius: 6,
                marginBottom: 16,
              }}
            >
              <strong>Message:</strong>{" "}
              {result.message}
            </div>
          )}

          {/* Errors */}

          {Array.isArray(result.errors) &&
            result.errors.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <h4>Errors</h4>

                {result.errors.map(
                  (item, index) => (
                    <div
                      key={index}
                      style={{
                        padding: 12,
                        background: "#fef3f2",
                        borderRadius: 6,
                        marginBottom: 8,
                      }}
                    >
                      <div>
                        <strong>
                          {item.message ||
                            "Uniware Error"}
                        </strong>
                      </div>

                      {item.fieldName && (
                        <div>
                          Field:{" "}
                          {item.fieldName}
                        </div>
                      )}

                      {item.description && (
                        <div>
                          {item.description}
                        </div>
                      )}

                      {item.code !== undefined && (
                        <div>
                          Code: {item.code}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

          {/* Warnings */}

          {Array.isArray(result.warnings) &&
            result.warnings.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <h4>Warnings</h4>

                {result.warnings.map(
                  (item, index) => (
                    <div
                      key={index}
                      style={{
                        padding: 12,
                        background: "#fffaeb",
                        borderRadius: 6,
                        marginBottom: 8,
                      }}
                    >
                      <strong>
                        {item.message ||
                          "Uniware Warning"}
                      </strong>

                      {item.description && (
                        <div>
                          {item.description}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

          {/* Raw Response */}

          <details>
            <summary
              style={{
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Raw Response
            </summary>

            <pre
              style={{
                marginTop: 12,
                background: "#101828",
                color: "#f2f4f7",
                padding: 16,
                borderRadius: 8,
                overflowX: "auto",
                fontSize: 13,
              }}
            >
              {JSON.stringify(
                result,
                null,
                2
              )}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

export default CancelReversePickup;