import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function UpdateReversePickup() {
  const [form, setForm] = useState({
    facility: "MAIN",
    reversePickupCode: "",
    pickupInstruction: "",
    trackingLink: "",
    shippingCourier: "",
    shippingProviderCode: "",
    trackingNumber: "",
    forcedCancelOnCourier: "",
  });

  const [includeAddress, setIncludeAddress] = useState(false);

  const [address, setAddress] = useState({
    id: "",
    name: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    phone: "",
    pincode: "",
    country: "",
    email: "",
  });

  const [includeDimension, setIncludeDimension] =
    useState(false);

  const [dimension, setDimension] = useState({
    boxLength: "",
    boxWidth: "",
    boxHeight: "",
    boxWeight: "",
  });

  const [customFields, setCustomFields] = useState([]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateAddress = (field, value) => {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateDimension = (field, value) => {
    setDimension((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addCustomField = () => {
    setCustomFields((prev) => [
      ...prev,
      {
        name: "",
        value: "",
      },
    ]);
  };

  const updateCustomField = (index, field, value) => {
    setCustomFields((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const removeCustomField = (index) => {
    setCustomFields((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    if (!form.facility.trim()) {
      setError("Facility is required.");
      return;
    }

    if (!form.reversePickupCode.trim()) {
      setError("Reverse Pickup Code is required.");
      return;
    }

    if (
      form.pickupInstruction.length > 500
    ) {
      setError(
        "Pickup instruction cannot exceed 500 characters."
      );
      return;
    }

    if (includeAddress) {
      if (!address.id.trim()) {
        setError("Pickup Address ID is required.");
        return;
      }

      if (!address.name.trim()) {
        setError("Pickup Address Name is required.");
        return;
      }

      if (!address.addressLine1.trim()) {
        setError("Pickup Address Line 1 is required.");
        return;
      }

      if (!address.city.trim()) {
        setError("Pickup Address City is required.");
        return;
      }

      if (!address.state.trim()) {
        setError("Pickup Address State is required.");
        return;
      }

      if (!address.phone.trim()) {
        setError("Pickup Address Phone is required.");
        return;
      }
    }

    const payload = {
      facility: form.facility.trim(),
      reversePickupCode:
        form.reversePickupCode.trim(),
    };

    if (form.pickupInstruction.trim()) {
      payload.pickupInstruction =
        form.pickupInstruction.trim();
    }

    if (form.trackingLink.trim()) {
      payload.trackingLink =
        form.trackingLink.trim();
    }

    if (form.shippingCourier.trim()) {
      payload.shippingCourier =
        form.shippingCourier.trim();
    }

    if (form.shippingProviderCode.trim()) {
      payload.shippingProviderCode =
        form.shippingProviderCode.trim();
    }

    if (form.trackingNumber.trim()) {
      payload.trackingNumber =
        form.trackingNumber.trim();
    }

    if (form.forcedCancelOnCourier !== "") {
      payload.forcedCancelOnCourier =
        form.forcedCancelOnCourier === "true";
    }

    if (includeAddress) {
      payload.pickUpAddress = {};

      Object.entries(address).forEach(([key, value]) => {
        if (String(value || "").trim()) {
          payload.pickUpAddress[key] =
            String(value).trim();
        }
      });
    }

    if (includeDimension) {
      const hasDimension = Object.values(dimension).some(
        (value) => value !== ""
      );

      if (hasDimension) {
        payload.dimension = {};

        Object.entries(dimension).forEach(([key, value]) => {
          if (value !== "") {
            payload.dimension[key] = Number(value);
          }
        });
      }
    }

    const validCustomFields = customFields
      .filter((field) => field.name.trim())
      .map((field) => ({
        name: field.name.trim(),
        value: field.value,
      }));

    if (validCustomFields.length > 0) {
      payload.customFields = validCustomFields;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${SERVER_URL}/api/uniware/reverse-pickups/update`,
        payload
      );

      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.message ||
          err.message ||
          "Failed to update reverse pickup."
      );

      setResult(err.response?.data || null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: 24,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Update Reverse Pick-up</h2>

      <p style={{ color: "#666" }}>
        Update reverse pickup courier, tracking, pickup
        address, dimensions and custom fields.
      </p>

      <form onSubmit={handleSubmit}>
        <Section title="Reverse Pickup">
          <div style={gridStyle}>
            <Field
              label="Facility *"
              value={form.facility}
              onChange={(e) =>
                updateForm("facility", e.target.value)
              }
              placeholder="MAIN"
            />

            <Field
              label="Reverse Pickup Code *"
              value={form.reversePickupCode}
              onChange={(e) =>
                updateForm(
                  "reversePickupCode",
                  e.target.value
                )
              }
              placeholder="RPC1008867"
            />

            <Field
              label="Shipping Courier"
              value={form.shippingCourier}
              onChange={(e) =>
                updateForm(
                  "shippingCourier",
                  e.target.value
                )
              }
            />

            <Field
              label="Shipping Provider Code"
              value={form.shippingProviderCode}
              onChange={(e) =>
                updateForm(
                  "shippingProviderCode",
                  e.target.value
                )
              }
            />

            <Field
              label="Tracking Number"
              value={form.trackingNumber}
              onChange={(e) =>
                updateForm(
                  "trackingNumber",
                  e.target.value
                )
              }
            />

            <Field
              label="Tracking Link"
              value={form.trackingLink}
              onChange={(e) =>
                updateForm(
                  "trackingLink",
                  e.target.value
                )
              }
            />

            <div>
              <label style={labelStyle}>
                Forced Cancel On Courier
              </label>

              <select
                value={form.forcedCancelOnCourier}
                onChange={(e) =>
                  updateForm(
                    "forcedCancelOnCourier",
                    e.target.value
                  )
                }
                style={inputStyle}
              >
                <option value="">Not specified</option>
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>
              Pickup Instruction
            </label>

            <textarea
              value={form.pickupInstruction}
              onChange={(e) =>
                updateForm(
                  "pickupInstruction",
                  e.target.value
                )
              }
              maxLength={500}
              rows={3}
              style={textareaStyle}
            />

            <small>
              {form.pickupInstruction.length}/500
            </small>
          </div>
        </Section>

        <Section title="Pickup Address">
          <label
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <input
              type="checkbox"
              checked={includeAddress}
              onChange={(e) =>
                setIncludeAddress(e.target.checked)
              }
            />

            Update Pickup Address
          </label>

          {includeAddress && (
            <div style={gridStyle}>
              {[
                ["id", "Address ID"],
                ["name", "Name"],
                ["addressLine1", "Address Line 1"],
                ["addressLine2", "Address Line 2"],
                ["city", "City"],
                ["state", "State"],
                ["phone", "Phone"],
                ["pincode", "Pincode"],
                ["country", "Country"],
                ["email", "Email"],
              ].map(([field, label]) => (
                <Field
                  key={field}
                  label={label}
                  value={address[field]}
                  onChange={(e) =>
                    updateAddress(
                      field,
                      e.target.value
                    )
                  }
                  type={
                    field === "email"
                      ? "email"
                      : "text"
                  }
                />
              ))}
            </div>
          )}
        </Section>

        <Section title="Package Dimension">
          <label
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <input
              type="checkbox"
              checked={includeDimension}
              onChange={(e) =>
                setIncludeDimension(e.target.checked)
              }
            />

            Update Package Dimension
          </label>

          {includeDimension && (
            <div style={gridStyle}>
              <Field
                label="Box Length (mm)"
                type="number"
                value={dimension.boxLength}
                onChange={(e) =>
                  updateDimension(
                    "boxLength",
                    e.target.value
                  )
                }
              />

              <Field
                label="Box Width (mm)"
                type="number"
                value={dimension.boxWidth}
                onChange={(e) =>
                  updateDimension(
                    "boxWidth",
                    e.target.value
                  )
                }
              />

              <Field
                label="Box Height (mm)"
                type="number"
                value={dimension.boxHeight}
                onChange={(e) =>
                  updateDimension(
                    "boxHeight",
                    e.target.value
                  )
                }
              />

              <Field
                label="Box Weight (kg)"
                type="number"
                value={dimension.boxWeight}
                onChange={(e) =>
                  updateDimension(
                    "boxWeight",
                    e.target.value
                  )
                }
              />
            </div>
          )}
        </Section>

        <Section title="Custom Fields">
          {customFields.map((field, index) => (
            <div
              key={index}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr auto",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <Field
                label={index === 0 ? "Name" : ""}
                value={field.name}
                onChange={(e) =>
                  updateCustomField(
                    index,
                    "name",
                    e.target.value
                  )
                }
              />

              <Field
                label={index === 0 ? "Value" : ""}
                value={field.value}
                onChange={(e) =>
                  updateCustomField(
                    index,
                    "value",
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                onClick={() =>
                  removeCustomField(index)
                }
                style={dangerButton}
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addCustomField}
            style={secondaryButton}
          >
            + Add Custom Field
          </button>
        </Section>

        <button
          type="submit"
          disabled={loading}
          style={primaryButton}
        >
          {loading
            ? "Updating..."
            : "Update Reverse Pick-up"}
        </button>
      </form>

      {error && (
        <div style={errorBox}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <Section title="Response">
          <div style={gridStyle}>
            <Stat
              label="Successful"
              value={String(result.successful ?? false)}
            />

            <Stat
              label="Message"
              value={result.message || "-"}
            />
          </div>

          {result.errors?.length > 0 && (
            <div style={errorBox}>
              <strong>Uniware Errors</strong>

              <ul>
                {result.errors.map((item, index) => (
                  <li key={index}>
                    {item.fieldName &&
                      `${item.fieldName}: `}
                    {item.message ||
                      item.description ||
                      "Unknown error"}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.warnings?.length > 0 && (
            <div style={warningBox}>
              <strong>Warnings</strong>

              <ul>
                {result.warnings.map((item, index) => (
                  <li key={index}>
                    {item.message ||
                      item.description ||
                      "Warning"}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <details style={{ marginTop: 16 }}>
            <summary>Raw Response</summary>

            <pre style={preStyle}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section
      style={{
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  disabled = false,
}) {
  return (
    <div>
      {label && (
        <label style={labelStyle}>{label}</label>
      )}

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          ...inputStyle,
          background: disabled ? "#eee" : "#fff",
        }}
      />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 14,
      }}
    >
      <div style={{ fontSize: 12, color: "#777" }}>
        {label}
      </div>

      <div
        style={{
          marginTop: 5,
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontSize: 13,
  fontWeight: 600,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1px solid #ccc",
  borderRadius: 6,
  fontSize: 14,
};

const textareaStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1px solid #ccc",
  borderRadius: 6,
  fontSize: 14,
  resize: "vertical",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(220px, 1fr))",
  gap: 16,
};

const primaryButton = {
  border: "none",
  borderRadius: 6,
  padding: "11px 20px",
  background: "#1976d2",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

const secondaryButton = {
  border: "1px solid #bbb",
  borderRadius: 6,
  padding: "10px 16px",
  background: "#fff",
  cursor: "pointer",
};

const dangerButton = {
  border: "1px solid #d32f2f",
  borderRadius: 6,
  padding: "8px 12px",
  background: "#fff",
  color: "#d32f2f",
  cursor: "pointer",
};

const errorBox = {
  marginTop: 16,
  padding: 14,
  borderRadius: 8,
  background: "#ffebee",
  border: "1px solid #ef9a9a",
  color: "#b71c1c",
};

const warningBox = {
  marginTop: 16,
  padding: 14,
  borderRadius: 8,
  background: "#fff8e1",
  border: "1px solid #f0d77a",
};

const preStyle = {
  background: "#111",
  color: "#eee",
  padding: 16,
  borderRadius: 8,
  overflow: "auto",
  fontSize: 12,
};

export default UpdateReversePickup;