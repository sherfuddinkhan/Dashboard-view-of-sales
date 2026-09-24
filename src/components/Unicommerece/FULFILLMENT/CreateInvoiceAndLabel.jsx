import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function CreateInvoiceAndLabel() {
  const [form, setForm] = useState({
    facility: "MAIN",
    shippingPackageCode: "",
    generateUniwareShippingLabel: true,
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResponse(null);

    if (!form.facility.trim()) {
      setError("Facility code is required.");
      return;
    }

    if (!form.shippingPackageCode.trim()) {
      setError(
        "Shipping package code is required."
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        facility: form.facility.trim(),
        shippingPackageCode:
          form.shippingPackageCode.trim(),
        generateUniwareShippingLabel:
          form.generateUniwareShippingLabel,
      };

      const result = await axios.post(
        `${SERVER_URL}/api/uniware/shipping-packages/create-invoice-label`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setResponse(result.data);
    } catch (err) {
      setResponse(
        err.response?.data || {
          successful: false,
          message:
            err.message ||
            "Failed to create invoice and generate label.",
          errors: [],
          warnings: [],
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({
      facility: "MAIN",
      shippingPackageCode: "",
      generateUniwareShippingLabel: true,
    });

    setResponse(null);
    setError("");
  };

  const downloadLabelPdf = () => {
    if (!response?.label) {
      return;
    }

    try {
      const cleanBase64 = response.label.includes(",")
        ? response.label.split(",").pop()
        : response.label;

      const binaryString = window.atob(
        cleanBase64
      );

      const bytes = new Uint8Array(
        binaryString.length
      );

      for (
        let index = 0;
        index < binaryString.length;
        index++
      ) {
        bytes[index] =
          binaryString.charCodeAt(index);
      }

      const blob = new Blob([bytes], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `${response.shippingPackageCode || "shipping-label"}-label.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(
        "Unable to convert the returned label data into a PDF."
      );
    }
  };

  const isValidUrl = (value) => {
    if (!value || typeof value !== "string") {
      return false;
    }

    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ccc",
    borderRadius: 6,
    fontSize: 14,
    boxSizing: "border-box",
  };

  const buttonStyle = {
    padding: "10px 16px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
  };

  const resultValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "N/A";
    }

    return String(value);
  };

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "30px auto",
        padding: "0 20px 40px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      {/* ================================================== */}
      {/* Header */}
      {/* ================================================== */}

      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 28,
          }}
        >
          Create Invoice & Shipping Label
        </h1>

        <p
          style={{
            color: "#666",
            marginTop: 8,
          }}
        >
          Create the invoice and generate the
          Uniware shipping label for a shipping
          package.
        </p>
      </div>

      {/* ================================================== */}
      {/* Important Notice */}
      {/* ================================================== */}

      <div
        style={{
          padding: 15,
          marginBottom: 20,
          borderRadius: 8,
          background: "#fff3cd",
          color: "#664d03",
          border: "1px solid #ffecb5",
        }}
      >
        <strong>Important:</strong>{" "}
        This API can move the shipment toward
        Ready to Ship and generate the shipping
        label. Make sure the required shipping
        provider AWB generation is configured in
        Uniware.
      </div>

      {/* ================================================== */}
      {/* Form */}
      {/* ================================================== */}

      <form onSubmit={handleSubmit}>
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: 20,
            background: "#fff",
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: 20,
            }}
          >
            Shipping Package
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {/* Facility */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                Facility Code *
              </label>

              <input
                type="text"
                value={form.facility}
                onChange={(e) =>
                  handleChange(
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
                  color: "#777",
                }}
              >
                Sent as the Uniware Facility
                header.
              </small>
            </div>

            {/* Shipping Package */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                Shipping Package Code *
              </label>

              <input
                type="text"
                value={
                  form.shippingPackageCode
                }
                onChange={(e) =>
                  handleChange(
                    "shippingPackageCode",
                    e.target.value
                  )
                }
                placeholder="DSKS00002"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Generate Label */}
          <div
            style={{
              marginTop: 20,
              padding: 14,
              border: "1px solid #ddd",
              borderRadius: 8,
              background: "#f8f9fa",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={
                  form.generateUniwareShippingLabel
                }
                onChange={(e) =>
                  handleChange(
                    "generateUniwareShippingLabel",
                    e.target.checked
                  )
                }
              />

              <span>
                <strong>
                  Generate Uniware Shipping Label
                </strong>

                <br />

                <small
                  style={{
                    color: "#666",
                  }}
                >
                  Generate the label with the
                  invoice and move the shipment to
                  RTS.
                </small>
              </span>
            </label>
          </div>
        </div>

        {/* ================================================== */}
        {/* Actions */}
        {/* ================================================== */}

        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 25,
          }}
        >
          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              background: loading
                ? "#999"
                : "#198754",
              color: "#fff",
            }}
          >
            {loading
              ? "Creating Invoice & Label..."
              : "Create Invoice & Generate Label"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            style={{
              ...buttonStyle,
              background: "#6c757d",
              color: "#fff",
            }}
          >
            Reset
          </button>
        </div>
      </form>

      {/* ================================================== */}
      {/* Local Error */}
      {/* ================================================== */}

      {error && (
        <div
          style={{
            padding: 15,
            borderRadius: 8,
            background: "#f8d7da",
            color: "#842029",
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      {/* ================================================== */}
      {/* Response */}
      {/* ================================================== */}

      {response && (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: 20,
            background: "#fff",
          }}
        >
          <h2
            style={{
              marginTop: 0,
            }}
          >
            Invoice & Label Response
          </h2>

          {/* Success */}
          <div
            style={{
              padding: 15,
              borderRadius: 8,
              background: response.successful
                ? "#d1e7dd"
                : "#f8d7da",
              color: response.successful
                ? "#0f5132"
                : "#842029",
              marginBottom: 20,
            }}
          >
            <strong>
              {response.successful
                ? "Invoice and Label Generated Successfully"
                : "Invoice and Label Generation Failed"}
            </strong>

            {response.message && (
              <div style={{ marginTop: 6 }}>
                {response.message}
              </div>
            )}
          </div>

          {/* ================================================= */}
          {/* Main Response Details */}
          {/* ================================================= */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
              marginBottom: 20,
            }}
          >
            {[
              [
                "Invoice Code",
                response.invoiceCode,
              ],
              [
                "Invoice Display Code",
                response.invoiceDisplayCode,
              ],
              [
                "Shipping Package Code",
                response.shippingPackageCode,
              ],
              [
                "Shipping Provider",
                response.shippingProviderCode,
              ],
              [
                "Tracking / AWB",
                response.trackingNumber,
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    color: "#777",
                    fontSize: 12,
                    marginBottom: 5,
                  }}
                >
                  {label}
                </div>

                <strong>
                  {resultValue(value)}
                </strong>
              </div>
            ))}
          </div>

          {/* ================================================= */}
          {/* Shipping Label */}
          {/* ================================================= */}

          {response.label && (
            <div
              style={{
                border: "1px solid #198754",
                borderRadius: 8,
                padding: 18,
                marginBottom: 20,
                background: "#f0fff4",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  color: "#198754",
                }}
              >
                Shipping Label PDF
              </h3>

              <p
                style={{
                  color: "#555",
                }}
              >
                Uniware returned the shipping
                label as Base64 encoded data.
              </p>

              <button
                type="button"
                onClick={downloadLabelPdf}
                style={{
                  ...buttonStyle,
                  background: "#198754",
                  color: "#fff",
                }}
              >
                Download Label PDF
              </button>
            </div>
          )}

          {/* ================================================= */}
          {/* Shipping Label Link */}
          {/* ================================================= */}

          {isValidUrl(
            response.shippingLabelLink
          ) && (
            <div
              style={{
                marginBottom: 20,
                padding: 15,
                border: "1px solid #ddd",
                borderRadius: 8,
              }}
            >
              <strong>
                Shipping Label Link
              </strong>

              <div style={{ marginTop: 8 }}>
                <a
                  href={response.shippingLabelLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Shipping Label
                </a>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* Tracking Link */}
          {/* ================================================= */}

          {isValidUrl(response.trackingLink) && (
            <div
              style={{
                marginBottom: 20,
                padding: 15,
                border: "1px solid #ddd",
                borderRadius: 8,
              }}
            >
              <strong>
                Tracking Link
              </strong>

              <div style={{ marginTop: 8 }}>
                <a
                  href={response.trackingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Track Shipment
                </a>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* Errors */}
          {/* ================================================= */}

          {Array.isArray(response.errors) &&
            response.errors.length > 0 && (
              <div
                style={{
                  marginBottom: 20,
                }}
              >
                <h3
                  style={{
                    color: "#dc3545",
                  }}
                >
                  Errors
                </h3>

                {response.errors.map(
                  (item, index) => (
                    <div
                      key={index}
                      style={{
                        padding: 10,
                        marginBottom: 8,
                        background: "#f8d7da",
                        borderRadius: 6,
                      }}
                    >
                      <strong>
                        {item.fieldName ||
                          "Error"}
                      </strong>

                      <div>
                        {item.message ||
                          item.description ||
                          "Unknown error"}
                      </div>

                      {item.code !==
                        undefined && (
                        <small>
                          Code: {item.code}
                        </small>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

          {/* ================================================= */}
          {/* Warnings */}
          {/* ================================================= */}

          {Array.isArray(response.warnings) &&
            response.warnings.length > 0 && (
              <div
                style={{
                  marginBottom: 20,
                }}
              >
                <h3
                  style={{
                    color: "#856404",
                  }}
                >
                  Warnings
                </h3>

                {response.warnings.map(
                  (item, index) => (
                    <div
                      key={index}
                      style={{
                        padding: 10,
                        marginBottom: 8,
                        background: "#fff3cd",
                        borderRadius: 6,
                      }}
                    >
                      <strong>
                        {item.message ||
                          "Warning"}
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

          {/* ================================================= */}
          {/* Raw Response */}
          {/* ================================================= */}

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
                background: "#f6f8fa",
                padding: 15,
                borderRadius: 8,
                overflowX: "auto",
                marginTop: 10,
                fontSize: 12,
              }}
            >
              {JSON.stringify(
                response,
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

export default CreateInvoiceAndLabel;