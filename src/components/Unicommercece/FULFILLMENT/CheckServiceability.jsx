import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function CheckServiceability() {
  const [form, setForm] = useState({
    pincode: "",
    cashOnDelivery: true,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "cashOnDelivery"
          ? value === "true"
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    const pincode = form.pincode.trim();

    if (!pincode) {
      setError("Pincode is required.");
      setLoading(false);
      return;
    }

    if (!/^\d{6,}$/.test(pincode)) {
      setError("Pincode must contain at least 6 digits.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${SERVER_URL}/api/uniware/sale-orders/serviceability`,
        {
          pincode,
          cashOnDelivery: form.cashOnDelivery,
        }
      );

      setResult(response.data || {});
    } catch (err) {
      const responseData = err.response?.data;

      setResult(responseData || null);

      setError(
        responseData?.message ||
          responseData?.errors?.[0]?.message ||
          err.message ||
          "Failed to check serviceability."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setForm({
      pincode: "",
      cashOnDelivery: true,
    });

    setResult(null);
    setError("");
  };

  const isSuccessful = result?.successful === true;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "30px",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "25px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              color: "#1f2937",
            }}
          >
            Check Serviceability
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#6b7280",
            }}
          >
            Check pincode serviceability and COD feasibility
            configured in Uniware.
          </p>
        </div>

        {/* Form Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "25px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            marginBottom: "25px",
          }}
        >
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              {/* Pincode */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  Pincode *
                </label>

                <input
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="110020"
                  maxLength={10}
                  inputMode="numeric"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                    fontSize: "14px",
                  }}
                />

                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "12px",
                    color: "#6b7280",
                  }}
                >
                  Minimum 6 digits
                </div>
              </div>

              {/* COD */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  Payment Mode *
                </label>

                <select
                  name="cashOnDelivery"
                  value={String(form.cashOnDelivery)}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                    background: "#ffffff",
                    fontSize: "14px",
                  }}
                >
                  <option value="true">
                    Cash on Delivery (COD)
                  </option>

                  <option value="false">
                    Prepaid
                  </option>
                </select>

                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "12px",
                    color: "#6b7280",
                  }}
                >
                  Select whether COD should be checked.
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "14px",
                  borderRadius: "8px",
                  background: "#fee2e2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                }}
              >
                {error}
              </div>
            )}

            {/* Buttons */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "25px",
              }}
            >
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "12px 22px",
                  border: "none",
                  borderRadius: "8px",
                  background: loading ? "#9ca3af" : "#2563eb",
                  color: "#ffffff",
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                  fontWeight: 600,
                }}
              >
                {loading
                  ? "Checking..."
                  : "Check Serviceability"}
              </button>

              <button
                type="button"
                onClick={clearForm}
                style={{
                  padding: "12px 22px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  background: "#ffffff",
                  color: "#374151",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Result */}
        {result && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "25px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "20px",
                color: "#1f2937",
              }}
            >
              Serviceability Result
            </h2>

            {/* Status */}
            <div
              style={{
                padding: "18px",
                borderRadius: "10px",
                background: isSuccessful
                  ? "#ecfdf5"
                  : "#fef2f2",
                border: `1px solid ${
                  isSuccessful
                    ? "#a7f3d0"
                    : "#fecaca"
                }`,
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: isSuccessful
                    ? "#047857"
                    : "#b91c1c",
                }}
              >
                {isSuccessful
                  ? "Serviceability Check Successful"
                  : "Serviceability Check Failed"}
              </div>

              {result.message && (
                <div
                  style={{
                    marginTop: "6px",
                    color: "#374151",
                  }}
                >
                  {result.message}
                </div>
              )}
            </div>

            {/* Request Summary */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
                marginBottom: "25px",
              }}
            >
              <div
                style={{
                  padding: "15px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginBottom: "5px",
                  }}
                >
                  Pincode
                </div>

                <strong>{form.pincode}</strong>
              </div>

              <div
                style={{
                  padding: "15px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginBottom: "5px",
                  }}
                >
                  Payment Mode
                </div>

                <strong>
                  {form.cashOnDelivery
                    ? "Cash on Delivery"
                    : "Prepaid"}
                </strong>
              </div>
            </div>

            {/* Facilities */}
            {Array.isArray(result.facilityCodes) && (
              <div>
                <h3
                  style={{
                    marginBottom: "12px",
                    color: "#374151",
                  }}
                >
                  Serviceable Facilities
                </h3>

                {result.facilityCodes.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    {result.facilityCodes.map(
                      (facilityCode, index) => (
                        <span
                          key={`${facilityCode}-${index}`}
                          style={{
                            padding: "8px 14px",
                            background: "#eff6ff",
                            border: "1px solid #bfdbfe",
                            borderRadius: "20px",
                            color: "#1d4ed8",
                            fontWeight: 600,
                            fontSize: "13px",
                          }}
                        >
                          {facilityCode}
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "14px",
                      background: "#f9fafb",
                      borderRadius: "8px",
                      color: "#6b7280",
                    }}
                  >
                    No facility codes were returned.
                  </div>
                )}
              </div>
            )}

            {/* Errors */}
            {result.errors?.length > 0 && (
              <div
                style={{
                  marginTop: "25px",
                  padding: "15px",
                  background: "#fee2e2",
                  borderRadius: "8px",
                  color: "#991b1b",
                }}
              >
                <strong>Errors</strong>

                <ul style={{ marginBottom: 0 }}>
                  {result.errors.map((item, index) => (
                    <li key={index}>
                      {item.message ||
                        item.description ||
                        "Unknown error"}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {result.warnings?.length > 0 && (
              <div
                style={{
                  marginTop: "15px",
                  padding: "15px",
                  background: "#fef3c7",
                  borderRadius: "8px",
                  color: "#92400e",
                }}
              >
                <strong>Warnings</strong>

                <ul style={{ marginBottom: 0 }}>
                  {result.warnings.map((item, index) => (
                    <li key={index}>
                      {item.message ||
                        item.description ||
                        "Unknown warning"}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Raw Response */}
            <details
              style={{
                marginTop: "25px",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                View Raw Response
              </summary>

              <pre
                style={{
                  marginTop: "12px",
                  padding: "15px",
                  background: "#111827",
                  color: "#e5e7eb",
                  borderRadius: "8px",
                  overflowX: "auto",
                  fontSize: "12px",
                }}
              >
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckServiceability;