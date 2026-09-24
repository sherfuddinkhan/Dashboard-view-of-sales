import React, { useEffect, useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function GetShippingLabelPdf() {
  const [form, setForm] = useState({
    facility: "MAIN",
    shippingPackageCodes: "",
  });

  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfBlob, setPdfBlob] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearPdf = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }

    setPdfUrl("");
    setPdfBlob(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    clearPdf();

    const facility = form.facility.trim();
    const shippingPackageCodes =
      form.shippingPackageCodes.trim();

    if (!facility) {
      setError("Facility code is required.");
      return;
    }

    if (!shippingPackageCodes) {
      setError("Shipping package code is required.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(
        `${SERVER_URL}/api/uniware/shipping-packages/shipping-label-pdf`,
        {
          params: {
            facility,
            shippingPackageCodes,
          },
          responseType: "blob",
        }
      );

      const contentType =
        response.headers["content-type"] || "";

      if (!contentType.includes("application/pdf")) {
        /*
         * Uniware may return JSON when the request fails.
         * Because axios is using blob responseType, read the blob.
         */
        const text = await response.data.text();

        let message = "Uniware did not return a PDF.";

        try {
          const json = JSON.parse(text);

          message =
            json.message ||
            json.errors?.[0]?.message ||
            message;
        } catch {
          if (text) {
            message = text;
          }
        }

        throw new Error(message);
      }

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      setPdfBlob(blob);
      setPdfUrl(url);
    } catch (err) {
      let message =
        err.message || "Failed to get shipping label PDF.";

      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);

          message =
            json.message ||
            json.errors?.[0]?.message ||
            message;
        } catch {
          // Keep existing message
        }
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const openPdf = () => {
    if (!pdfUrl) return;

    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  const downloadPdf = () => {
    if (!pdfBlob || !pdfUrl) return;

    const packageCode =
      form.shippingPackageCodes.trim() || "shipping-label";

    const link = document.createElement("a");

    link.href = pdfUrl;
    link.download = `${packageCode}-shipping-label.pdf`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearForm = () => {
    clearPdf();

    setForm({
      facility: "MAIN",
      shippingPackageCodes: "",
    });

    setError("");
  };

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
          maxWidth: "1100px",
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
            Get Shipping Label PDF
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#6b7280",
            }}
          >
            Fetch the generated shipping label PDF from Uniware
            using a shipping package code.
          </p>
        </div>

        {/* Form */}
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
              {/* Facility */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  Facility Code *
                </label>

                <input
                  type="text"
                  name="facility"
                  value={form.facility}
                  onChange={handleChange}
                  placeholder="MAIN"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Shipping Package Code */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  Shipping Package Code *
                </label>

                <input
                  type="text"
                  name="shippingPackageCodes"
                  value={form.shippingPackageCodes}
                  onChange={handleChange}
                  placeholder="SHP-00001"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                  }}
                />

                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "12px",
                    color: "#6b7280",
                  }}
                >
                  Uniware parameter: shippingPackageCodes
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
                  color: "#991b1b",
                  border: "1px solid #fecaca",
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
                  ? "Fetching..."
                  : "Get Shipping Label"}
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

        {/* PDF Result */}
        {pdfUrl && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "25px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#1f2937",
                  }}
                >
                  Shipping Label PDF
                </h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#6b7280",
                  }}
                >
                  Package:{" "}
                  <strong>
                    {form.shippingPackageCodes}
                  </strong>
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={openPdf}
                  style={{
                    padding: "10px 18px",
                    border: "none",
                    borderRadius: "8px",
                    background: "#16a34a",
                    color: "#ffffff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Open PDF
                </button>

                <button
                  type="button"
                  onClick={downloadPdf}
                  style={{
                    padding: "10px 18px",
                    border: "none",
                    borderRadius: "8px",
                    background: "#7c3aed",
                    color: "#ffffff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Download PDF
                </button>
              </div>
            </div>

            {/* PDF Preview */}
            <div
              style={{
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                overflow: "hidden",
                background: "#e5e7eb",
              }}
            >
              <iframe
                src={pdfUrl}
                title="Uniware Shipping Label PDF"
                style={{
                  width: "100%",
                  height: "800px",
                  border: "none",
                  display: "block",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GetShippingLabelPdf;