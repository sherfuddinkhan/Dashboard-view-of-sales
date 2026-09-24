import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function GetInvoicePdf() {
  const [form, setForm] = useState({
    facility: "MAIN",
    invoiceCodes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfBlob, setPdfBlob] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl("");
    }

    setPdfBlob(null);

    try {
      if (!form.facility.trim()) {
        throw new Error("Facility is required.");
      }

      if (!form.invoiceCodes.trim()) {
        throw new Error("Invoice code is required.");
      }

      const response = await axios.get(
        `${SERVER_URL}/api/uniware/invoices/pdf`,
        {
          params: {
            facility: form.facility.trim(),
            invoiceCodes: form.invoiceCodes.trim(),
          },
          responseType: "blob",
        }
      );

      const contentType =
        response.headers["content-type"] || "";

      // If Node/Uniware returned JSON error data,
      // convert the blob back to text and show the message.
      if (contentType.includes("application/json")) {
        const text = await response.data.text();

        try {
          const json = JSON.parse(text);

          throw new Error(
            json.message ||
              "Uniware failed to generate invoice PDF."
          );
        } catch (parseError) {
          if (
            parseError instanceof Error &&
            parseError.message !== text
          ) {
            throw parseError;
          }

          throw new Error(
            text || "Failed to fetch invoice PDF."
          );
        }
      }

      if (!contentType.includes("pdf")) {
        throw new Error(
          "Uniware did not return a PDF document."
        );
      }

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      setPdfBlob(blob);
      setPdfUrl(url);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch invoice PDF."
      );
    } finally {
      setLoading(false);
    }
  };

  const openPdf = () => {
    if (!pdfUrl) {
      return;
    }

    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  const downloadPdf = () => {
    if (!pdfUrl) {
      return;
    }

    const invoiceCode =
      form.invoiceCodes.trim() || "invoice";

    const link = document.createElement("a");

    link.href = pdfUrl;
    link.download = `${invoiceCode}.pdf`;

    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const clearPdf = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }

    setPdfUrl("");
    setPdfBlob(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "30px auto",
        padding: 24,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Get Invoice PDF</h2>

      <p style={{ color: "#666" }}>
        Fetch the printable invoice PDF from Uniware using
        the invoice code.
      </p>

      <div
        style={{
          padding: 12,
          marginBottom: 20,
          background: "#fff8e1",
          border: "1px solid #f0d98c",
          borderRadius: 8,
        }}
      >
        <strong>Uniware API:</strong>{" "}
        <code>
          /services/rest/v1/oms/invoice/show
        </code>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <label style={labelStyle}>
          Facility Code *
        </label>

        <input
          style={inputStyle}
          value={form.facility}
          onChange={(e) =>
            setForm({
              ...form,
              facility: e.target.value,
            })
          }
          placeholder="MAIN"
        />

        <label style={labelStyle}>
          Invoice Code *
        </label>

        <input
          style={inputStyle}
          value={form.invoiceCodes}
          onChange={(e) =>
            setForm({
              ...form,
              invoiceCodes: e.target.value,
            })
          }
          placeholder="INV0054"
        />

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button
            type="submit"
            disabled={loading}
            style={primaryButtonStyle}
          >
            {loading
              ? "Fetching PDF..."
              : "Get Invoice PDF"}
          </button>

          {pdfUrl && (
            <>
              <button
                type="button"
                onClick={openPdf}
                style={buttonStyle}
              >
                Open PDF
              </button>

              <button
                type="button"
                onClick={downloadPdf}
                style={buttonStyle}
              >
                Download PDF
              </button>

              <button
                type="button"
                onClick={clearPdf}
                style={buttonStyle}
              >
                Clear
              </button>
            </>
          )}
        </div>
      </form>

      {error && (
        <div style={errorStyle}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {pdfUrl && (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            overflow: "hidden",
            background: "#f5f5f5",
          }}
        >
          <div
            style={{
              padding: 14,
              borderBottom: "1px solid #ddd",
              background: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <strong>
              Invoice: {form.invoiceCodes}
            </strong>

            <span style={{ color: "#198754" }}>
              PDF loaded successfully
            </span>
          </div>

          <iframe
            title="Uniware Invoice PDF"
            src={pdfUrl}
            style={{
              width: "100%",
              height: "850px",
              border: "none",
              display: "block",
            }}
          />
        </div>
      )}

      {pdfBlob && (
        <div
          style={{
            marginTop: 15,
            color: "#666",
            fontSize: 13,
          }}
        >
          PDF size:{" "}
          {(pdfBlob.size / 1024).toFixed(2)} KB
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontWeight: 600,
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  marginBottom: 16,
  border: "1px solid #ccc",
  borderRadius: 6,
};

const primaryButtonStyle = {
  padding: "10px 18px",
  cursor: "pointer",
  border: "none",
  borderRadius: 6,
};

const buttonStyle = {
  padding: "10px 18px",
  cursor: "pointer",
  border: "1px solid #ccc",
  borderRadius: 6,
  background: "#fff",
};

const errorStyle = {
  padding: 15,
  marginBottom: 20,
  background: "#fee",
  border: "1px solid #f00",
  borderRadius: 8,
};

export default GetInvoicePdf;