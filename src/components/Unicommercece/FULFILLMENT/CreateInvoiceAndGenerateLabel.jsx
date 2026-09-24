import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function CreateInvoiceAndGenerateLabel() {
  const [form, setForm] = useState({
    facility: "MAIN",
    shippingPackageCode: "",
    generateUniwareShippingLabel: true,
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      if (!form.facility.trim()) {
        throw new Error("Facility is required.");
      }

      if (!form.shippingPackageCode.trim()) {
        throw new Error("Shipping package code is required.");
      }

      const result = await axios.post(
        `${SERVER_URL}/api/uniware/shipping-packages/create-invoice-label`,
        {
          facility: form.facility.trim(),
          shippingPackageCode:
            form.shippingPackageCode.trim(),
          generateUniwareShippingLabel:
            form.generateUniwareShippingLabel,
        }
      );

      setResponse(result.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create invoice and label."
      );

      setResponse(err.response?.data || null);
    } finally {
      setLoading(false);
    }
  };

  const downloadLabelPdf = () => {
    if (!response?.label) {
      return;
    }

    try {
      const byteCharacters = atob(response.label);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      const blob = new Blob([byteArray], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download =
        `${response.invoiceDisplayCode || "invoice"}-label.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Unable to convert label Base64 into PDF.");
    }
  };

  return (
    <div
      style={{
        maxWidth: 850,
        margin: "30px auto",
        padding: 24,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Create Invoice & Generate Shipping Label</h2>

      <p style={{ color: "#666" }}>
        Creates the invoice for a shipping package and generates
        the shipping label.
      </p>

      <form onSubmit={handleSubmit} style={sectionStyle}>
        <label style={labelStyle}>Facility Code *</label>

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
          Shipping Package Code *
        </label>

        <input
          style={inputStyle}
          value={form.shippingPackageCode}
          onChange={(e) =>
            setForm({
              ...form,
              shippingPackageCode: e.target.value,
            })
          }
          placeholder="DSKS00002"
        />

        <label style={checkboxStyle}>
          <input
            type="checkbox"
            checked={form.generateUniwareShippingLabel}
            onChange={(e) =>
              setForm({
                ...form,
                generateUniwareShippingLabel:
                  e.target.checked,
              })
            }
          />
          Generate Uniware Shipping Label
        </label>

        <button
          type="submit"
          disabled={loading}
          style={buttonStyle}
        >
          {loading
            ? "Creating Invoice..."
            : "Create Invoice & Label"}
        </button>
      </form>

      {error && (
        <div style={errorStyle}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div style={sectionStyle}>
          <h3>Result</h3>

          <div style={gridStyle}>
            <Result
              label="Successful"
              value={response.successful}
            />
            <Result
              label="Message"
              value={response.message}
            />
            <Result
              label="Invoice Code"
              value={response.invoiceCode}
            />
            <Result
              label="Invoice Display Code"
              value={response.invoiceDisplayCode}
            />
            <Result
              label="Shipping Package"
              value={response.shippingPackageCode}
            />
            <Result
              label="Shipping Provider"
              value={response.shippingProviderCode}
            />
            <Result
              label="Tracking Number / AWB"
              value={response.trackingNumber}
            />
          </div>

          {response.shippingLabelLink && (
            <p>
              <a
                href={response.shippingLabelLink}
                target="_blank"
                rel="noreferrer"
              >
                Open Shipping Label
              </a>
            </p>
          )}

          {response.trackingLink && (
            <p>
              <a
                href={response.trackingLink}
                target="_blank"
                rel="noreferrer"
              >
                Open Tracking Link
              </a>
            </p>
          )}

          {response.label && (
            <button
              type="button"
              onClick={downloadLabelPdf}
              style={buttonStyle}
            >
              Download Label PDF
            </button>
          )}

          <ErrorWarningList
            title="Errors"
            items={response.errors}
          />

          <ErrorWarningList
            title="Warnings"
            items={response.warnings}
          />

          <details style={{ marginTop: 20 }}>
            <summary>Raw Response</summary>

            <pre style={preStyle}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

function Result({ label, value }) {
  return (
    <div>
      <strong>{label}</strong>
      <div>{value ?? "N/A"}</div>
    </div>
  );
}

function ErrorWarningList({ title, items }) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h4>{title}</h4>

      {items.map((item, index) => (
        <div key={index} style={{ marginBottom: 8 }}>
          <strong>
            {item.message || "Message"}
          </strong>

          {item.description && (
            <div>{item.description}</div>
          )}

          {item.fieldName && (
            <div>
              Field: {item.fieldName}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const sectionStyle = {
  border: "1px solid #ddd",
  borderRadius: 10,
  padding: 20,
  marginBottom: 20,
};

const labelStyle = {
  display: "block",
  fontWeight: 600,
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  marginBottom: 15,
  border: "1px solid #ccc",
  borderRadius: 6,
};

const checkboxStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 20,
};

const buttonStyle = {
  padding: "10px 18px",
  cursor: "pointer",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 20,
};

const errorStyle = {
  padding: 15,
  marginBottom: 20,
  border: "1px solid #f00",
  background: "#fee",
  borderRadius: 8,
};

const preStyle = {
  background: "#111",
  color: "#fff",
  padding: 15,
  overflow: "auto",
};

export default CreateInvoiceAndGenerateLabel;