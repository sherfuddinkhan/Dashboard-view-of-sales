import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const initialForm = {
  code: "",
  name: "",
  taxTypeCode: "",
  itemDetailFieldsText: "",
  hsnCode: "",
  gstTaxTypeCode: "",
  grnExpiryTolerance: "",
  dispatchExpiryTolerance: "",
  returnExpiryTolerance: "",
  expirable: false,
  shelfLife: "",
};

const CreateOrUpdateCategory = () => {
  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const clearForm = () => {
    setForm(initialForm);
    setError("");
    setResponse(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResponse(null);

    if (!form.code.trim()) {
      setError("Category code is required.");
      return;
    }

    if (form.code.trim().length > 45) {
      setError(
        "Category code cannot exceed 45 characters."
      );
      return;
    }

    if (!form.name.trim()) {
      setError("Category name is required.");
      return;
    }

    if (form.name.trim().length > 200) {
      setError(
        "Category name cannot exceed 200 characters."
      );
      return;
    }

    if (!form.gstTaxTypeCode.trim()) {
      setError("GST Tax Type Code is required.");
      return;
    }

    const payload = {
      category: {
        code: form.code.trim(),
        name: form.name.trim(),
        gstTaxTypeCode:
          form.gstTaxTypeCode.trim(),
        expirable: form.expirable,
      },
    };

    // Optional fields
    if (form.taxTypeCode.trim()) {
      payload.category.taxTypeCode =
        form.taxTypeCode.trim();
    }

    if (form.itemDetailFieldsText.trim()) {
      payload.category.itemDetailFieldsText =
        form.itemDetailFieldsText.trim();
    }

    if (form.hsnCode.trim()) {
      payload.category.hsnCode =
        form.hsnCode.trim();
    }

    if (form.grnExpiryTolerance !== "") {
      payload.category.grnExpiryTolerance =
        Number(form.grnExpiryTolerance);
    }

    if (form.dispatchExpiryTolerance !== "") {
      payload.category.dispatchExpiryTolerance =
        Number(form.dispatchExpiryTolerance);
    }

    if (form.returnExpiryTolerance !== "") {
      payload.category.returnExpiryTolerance =
        Number(form.returnExpiryTolerance);
    }

    if (form.shelfLife !== "") {
      payload.category.shelfLife =
        Number(form.shelfLife);
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${SERVER_URL}/api/uniware/categories/add-or-edit`,
        payload
      );

      setResponse(res.data);

      if (res.data?.successful === false) {
        setError(
          res.data?.message ||
            "Uniware could not save the category."
        );
      }
    } catch (err) {
      const data = err.response?.data;

      setError(
        data?.message ||
          data?.error ||
          err.message ||
          "Failed to save category."
      );

      setResponse(data || null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            Create / Update Category
          </h1>

          <p style={styles.subtitle}>
            Create a new Uniware product category or
            update an existing category using its
            unique category code.
          </p>
        </div>

        {/* Form */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>
            Category Details
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              {/* Code */}
              <div>
                <label style={styles.label}>
                  Category Code *
                </label>

                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  maxLength={45}
                  placeholder="Example: ELECTRONICS"
                  style={styles.input}
                />

                <div style={styles.helpText}>
                  Maximum 45 characters. Must be
                  unique in Uniware.
                </div>
              </div>

              {/* Name */}
              <div>
                <label style={styles.label}>
                  Category Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={200}
                  placeholder="Example: Electronics"
                  style={styles.input}
                />

                <div style={styles.helpText}>
                  Maximum 200 characters.
                </div>
              </div>

              {/* GST */}
              <div>
                <label style={styles.label}>
                  GST Tax Type Code *
                </label>

                <input
                  type="text"
                  name="gstTaxTypeCode"
                  value={form.gstTaxTypeCode}
                  onChange={handleChange}
                  placeholder="Example: GST_18"
                  style={styles.input}
                />

                <div style={styles.helpText}>
                  This must already be defined in
                  Uniware.
                </div>
              </div>

              {/* HSN */}
              <div>
                <label style={styles.label}>
                  HSN Code
                </label>

                <input
                  type="text"
                  name="hsnCode"
                  value={form.hsnCode}
                  onChange={handleChange}
                  placeholder="Example: 851830"
                  style={styles.input}
                />
              </div>

              {/* Tax Type */}
              <div>
                <label style={styles.label}>
                  Tax Type Code
                </label>

                <input
                  type="text"
                  name="taxTypeCode"
                  value={form.taxTypeCode}
                  onChange={handleChange}
                  placeholder="Optional"
                  style={styles.input}
                />
              </div>

              {/* GRN tolerance */}
              <div>
                <label style={styles.label}>
                  GRN Expiry Tolerance
                </label>

                <input
                  type="number"
                  name="grnExpiryTolerance"
                  value={form.grnExpiryTolerance}
                  onChange={handleChange}
                  min="0"
                  placeholder="Example: 30"
                  style={styles.input}
                />
              </div>

              {/* Dispatch tolerance */}
              <div>
                <label style={styles.label}>
                  Dispatch Expiry Tolerance
                </label>

                <input
                  type="number"
                  name="dispatchExpiryTolerance"
                  value={
                    form.dispatchExpiryTolerance
                  }
                  onChange={handleChange}
                  min="0"
                  placeholder="Example: 15"
                  style={styles.input}
                />
              </div>

              {/* Return tolerance */}
              <div>
                <label style={styles.label}>
                  Return Expiry Tolerance
                </label>

                <input
                  type="number"
                  name="returnExpiryTolerance"
                  value={
                    form.returnExpiryTolerance
                  }
                  onChange={handleChange}
                  min="0"
                  placeholder="Example: 15"
                  style={styles.input}
                />
              </div>

              {/* Shelf life */}
              <div>
                <label style={styles.label}>
                  Shelf Life
                </label>

                <input
                  type="number"
                  name="shelfLife"
                  value={form.shelfLife}
                  onChange={handleChange}
                  min="0"
                  placeholder="Example: 365"
                  style={styles.input}
                />

                <div style={styles.helpText}>
                  Duration for which the item remains
                  in good condition while storing.
                </div>
              </div>

              {/* Expirable */}
              <div style={styles.checkboxContainer}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="expirable"
                    checked={form.expirable}
                    onChange={handleChange}
                  />

                  <span>
                    Product is Expirable
                  </span>
                </label>
              </div>
            </div>

            {/* Item details */}
            <div style={styles.fullWidth}>
              <label style={styles.label}>
                Item Detail Fields
              </label>

              <textarea
                name="itemDetailFieldsText"
                value={form.itemDetailFieldsText}
                onChange={handleChange}
                rows={4}
                placeholder="Enter item detail information"
                style={{
                  ...styles.input,
                  resize: "vertical",
                }}
              />
            </div>

            {error && (
              <div style={styles.errorBox}>
                {error}
              </div>
            )}

            <div style={styles.buttonRow}>
              <button
                type="submit"
                disabled={loading}
                style={styles.primaryButton}
              >
                {loading
                  ? "Saving..."
                  : "Create / Update Category"}
              </button>

              <button
                type="button"
                onClick={clearForm}
                disabled={loading}
                style={styles.secondaryButton}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Response */}
        {response && (
          <>
            <div
              style={{
                ...styles.responseCard,
                background: response.successful
                  ? "#f0fdf4"
                  : "#fef2f2",
                borderColor: response.successful
                  ? "#bbf7d0"
                  : "#fecaca",
              }}
            >
              <div>
                <div style={styles.responseLabel}>
                  Status
                </div>

                <span
                  style={{
                    ...styles.status,
                    background:
                      response.successful
                        ? "#dcfce7"
                        : "#fee2e2",
                    color:
                      response.successful
                        ? "#166534"
                        : "#991b1b",
                  }}
                >
                  {response.successful
                    ? "SUCCESS"
                    : "FAILED"}
                </span>
              </div>

              <div>
                <div style={styles.responseLabel}>
                  Message
                </div>

                <div style={styles.responseMessage}>
                  {response.message ||
                    "No message returned"}
                </div>
              </div>
            </div>

            {/* Errors */}
            {response.errors?.length > 0 && (
              <div style={styles.errorCard}>
                <h2 style={styles.errorTitle}>
                  Errors
                </h2>

                {response.errors.map(
                  (item, index) => (
                    <div
                      key={index}
                      style={styles.errorItem}
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

            {/* Warnings */}
            {response.warnings?.length > 0 && (
              <div style={styles.warningCard}>
                <h2 style={styles.warningTitle}>
                  Warnings
                </h2>

                {response.warnings.map(
                  (item, index) => (
                    <div
                      key={index}
                      style={styles.warningItem}
                    >
                      <strong>
                        {item.code !== undefined
                          ? `Code ${item.code}: `
                          : ""}
                      </strong>

                      {item.message ||
                        item.description ||
                        "Warning"}
                    </div>
                  )
                )}
              </div>
            )}

            {/* Raw response */}
            <div style={styles.card}>
              <details>
                <summary
                  style={styles.rawSummary}
                >
                  View Raw Uniware Response
                </summary>

                <pre style={styles.rawResponse}>
                  {JSON.stringify(
                    response,
                    null,
                    2
                  )}
                </pre>
              </details>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: "30px",
    boxSizing: "border-box",
    fontFamily:
      "Arial, Helvetica, sans-serif",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  header: {
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    fontWeight: 700,
    color: "#172033",
  },

  subtitle: {
    marginTop: "8px",
    color: "#64748b",
    fontSize: "15px",
  },

  card: {
    background: "#ffffff",
    borderRadius: "10px",
    padding: "25px",
    marginBottom: "20px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.06)",
  },

  sectionTitle: {
    margin: "0 0 22px",
    fontSize: "20px",
    color: "#172033",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },

  fullWidth: {
    marginTop: "20px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    fontWeight: 600,
    fontSize: "14px",
    color: "#334155",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 13px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    fontSize: "14px",
    background: "#ffffff",
    outline: "none",
  },

  helpText: {
    marginTop: "5px",
    fontSize: "12px",
    color: "#64748b",
  },

  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    paddingTop: "25px",
  },

  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    cursor: "pointer",
    fontWeight: 600,
    color: "#334155",
  },

  buttonRow: {
    display: "flex",
    gap: "10px",
    marginTop: "25px",
  },

  primaryButton: {
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "12px 22px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: 600,
  },

  secondaryButton: {
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#334155",
    padding: "12px 22px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: 600,
  },

  errorBox: {
    marginTop: "20px",
    padding: "13px",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: "7px",
  },

  responseCard: {
    display: "grid",
    gridTemplateColumns:
      "180px 1fr",
    gap: "20px",
    padding: "20px",
    border: "1px solid",
    borderRadius: "10px",
    marginBottom: "20px",
  },

  responseLabel: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: 600,
    marginBottom: "6px",
  },

  responseMessage: {
    color: "#172033",
    fontSize: "15px",
  },

  status: {
    display: "inline-block",
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 700,
  },

  errorCard: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
  },

  errorTitle: {
    marginTop: 0,
    color: "#991b1b",
  },

  errorItem: {
    padding: "10px 0",
    color: "#7f1d1d",
    borderBottom:
      "1px solid #fecaca",
  },

  warningCard: {
    background: "#fffbeb",
    border: "1px solid #fde68a",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
  },

  warningTitle: {
    marginTop: 0,
    color: "#92400e",
  },

  warningItem: {
    padding: "8px 0",
    color: "#78350f",
  },

  rawSummary: {
    cursor: "pointer",
    fontWeight: 600,
    color: "#334155",
  },

  rawResponse: {
    marginTop: "15px",
    padding: "15px",
    background: "#0f172a",
    color: "#e2e8f0",
    borderRadius: "8px",
    overflowX: "auto",
    fontSize: "12px",
    lineHeight: 1.5,
  },
};

export default CreateOrUpdateCategory;