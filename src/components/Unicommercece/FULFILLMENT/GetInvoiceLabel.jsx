import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function GetInvoiceLabel() {
  const [form, setForm] = useState({
    facility: "MAIN",
    shippingPackageCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfBlob, setPdfBlob] = useState(null);

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
    setResult(null);
    clearPdf();

    const facility = form.facility.trim();
    const shippingPackageCode = form.shippingPackageCode.trim();

    if (!facility) {
      setError("Facility code is required.");
      return;
    }

    if (!shippingPackageCode) {
      setError("Shipping package code is required.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${SERVER_URL}/api/uniware/shipping-packages/get-invoice-label`,
        {
          facility,
          shippingPackageCode,
        }
      );

      const data = response.data || {};

      setResult(data);

      if (data.successful === false) {
        setError(data.message || "Uniware could not generate the invoice label.");
        return;
      }

      /*
       * Uniware returns the invoice print in:
       * data.label
       *
       * The label is Base64 encoded PDF.
       */
      if (data.label) {
        try {
          const cleanBase64 = String(data.label).includes(",")
            ? String(data.label).split(",").pop()
            : String(data.label);

          const binaryString = window.atob(cleanBase64);
          const length = binaryString.length;

          const bytes = new Uint8Array(length);

          for (let i = 0; i < length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const blob = new Blob([bytes], {
            type: "application/pdf",
          });

          const url = URL.createObjectURL(blob);

          setPdfBlob(blob);
          setPdfUrl(url);
        } catch (pdfError) {
          console.error("Invoice label PDF conversion error:", pdfError);

          setError(
            "Invoice label was returned, but the Base64 PDF could not be converted."
          );
        }
      }
    } catch (err) {
      const responseData = err.response?.data;

      setError(
        responseData?.message ||
          err.message ||
          "Failed to get invoice label."
      );

      setResult(responseData || null);
    } finally {
      setLoading(false);
    }
  };

  const openPdf = () => {
    if (!pdfUrl) return;

    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  const downloadPdf = () => {
    if (!pdfBlob) return;

    const invoiceCode =
      result?.invoiceCode ||
      form.shippingPackageCode.trim() ||
      "invoice";

    const link = document.createElement("a");

    link.href = pdfUrl;
    link.download = `${invoiceCode}.pdf`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearForm = () => {
    clearPdf();

    setForm({
      facility: "MAIN",
      shippingPackageCode: "",
    });

    setResult(null);
    setError("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
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
            Get Invoice Label
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#6b7280",
            }}
          >
            Fetch the generated invoice print from Uniware using a shipping
            package code.
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

              {/* Shipping Package */}
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
                  name="shippingPackageCode"
                  value={form.shippingPackageCode}
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
              </div>
            </div>

            {error && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "14px",
                  borderRadius: "8px",
                  background: "#fee2e2",
                  color: "#991b1b",
                }}
              >
                {error}
              </div>
            )}

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
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: 600,
                }}
              >
                {loading ? "Fetching..." : "Get Invoice Label"}
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
              marginBottom: "25px",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: "#1f2937",
              }}
            >
              Invoice Result
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              <div>
                <strong>Status:</strong>{" "}
                {result.successful ? "Successful" : "Failed"}
              </div>

              <div>
                <strong>Message:</strong>{" "}
                {result.message || "N/A"}
              </div>

              <div>
                <strong>Invoice Code:</strong>{" "}
                {result.invoiceCode || "N/A"}
              </div>

              <div>
                <strong>Invoice Display Code:</strong>{" "}
                {result.invoiceDisplayCode || "N/A"}
              </div>
            </div>

            {result.errors?.length > 0 && (
              <div
                style={{
                  background: "#fee2e2",
                  padding: "15px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                }}
              >
                <strong>Errors</strong>

                <ul>
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

            {result.warnings?.length > 0 && (
              <div
                style={{
                  background: "#fef3c7",
                  padding: "15px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                }}
              >
                <strong>Warnings</strong>

                <ul>
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

            {pdfUrl && (
              <div>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginBottom: "20px",
                  }}
                >
                  <button
                    type="button"
                    onClick={openPdf}
                    style={{
                      padding: "11px 18px",
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
                      padding: "11px 18px",
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
                    title="Uniware Invoice Label"
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

            {!pdfUrl && result.successful && !result.label && (
              <div
                style={{
                  padding: "15px",
                  background: "#f3f4f6",
                  borderRadius: "8px",
                }}
              >
                Uniware returned a successful response, but no invoice label
                was included.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default GetInvoiceLabel;