import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const INITIAL_FORM = {
  name: "",
  code: "",
  alternateCode: "",
  pan: "",
  tin: "",
  cinNumber: "",
  cstNumber: "",
  stNumber: "",
  gstNumber: "",

  enabled: true,
  taxExempted: false,
  website: "",
  registeredDealer: true,

  uniwareAccessUrl: "",
  uniwareApiUser: "",
  uniwareApiPassword: "",

  billingAddress: {
    addressLine1: "",
    addressLine2: "",
    city: "",
    stateCode: "",
    countryCode: "IN",
    partyCode: "",
    addressType: "BILLING",
    pincode: "",
    latitude: "",
    longitude: "",
    phone: "",
  },

  shippingAddress: {
    addressLine1: "",
    addressLine2: "",
    city: "",
    stateCode: "",
    countryCode: "IN",
    partyCode: "",
    addressType: "SHIPPING",
    pincode: "",
    latitude: "",
    longitude: "",
    phone: "",
  },

  partyContacts: [
    {
      contactType: "PRIMARY",
      partyCode: "",
      name: "",
      email: "",
      phone: "",
      fax: "",
    },
  ],

  providesCform: false,
  dualCompanyRetail: false,
};

const CreateCustomer = () => {
  const [form, setForm] = useState(INITIAL_FORM);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  // ==========================================================
  // CUSTOMER FIELD
  // ==========================================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ==========================================================
  // ADDRESS FIELD
  // ==========================================================

  const handleAddressChange = (
    addressType,
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [addressType]: {
        ...prev[addressType],
        [field]: value,
      },
    }));
  };

  // ==========================================================
  // CONTACT FIELD
  // ==========================================================

  const handleContactChange = (
    index,
    field,
    value
  ) => {
    setForm((prev) => {
      const contacts = [...prev.partyContacts];

      contacts[index] = {
        ...contacts[index],
        [field]: value,
      };

      return {
        ...prev,
        partyContacts: contacts,
      };
    });
  };

  const addContact = () => {
    setForm((prev) => ({
      ...prev,
      partyContacts: [
        ...prev.partyContacts,
        {
          contactType: "PRIMARY",
          partyCode: prev.code,
          name: "",
          email: "",
          phone: "",
          fax: "",
        },
      ],
    }));
  };

  const removeContact = (index) => {
    setForm((prev) => ({
      ...prev,
      partyContacts: prev.partyContacts.filter(
        (_, i) => i !== index
      ),
    }));
  };

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validate = () => {
    if (!form.code.trim()) {
      return "Customer code is required.";
    }

    if (!/^[a-zA-Z0-9-_]+$/.test(form.code.trim())) {
      return "Customer code can contain only letters, numbers, hyphen and underscore.";
    }

    if (form.code.trim().length > 45) {
      return "Customer code cannot exceed 45 characters.";
    }

    if (form.name.length > 100) {
      return "Customer name cannot exceed 100 characters.";
    }

    if (
      form.alternateCode &&
      form.alternateCode.length > 45
    ) {
      return "Alternate code cannot exceed 45 characters.";
    }

    if (
      form.gstNumber &&
      form.gstNumber.length > 15
    ) {
      return "GST number cannot exceed 15 characters.";
    }

    if (form.billingAddress) {
      const address = form.billingAddress;

      if (!address.addressLine1.trim()) {
        return "Billing address line 1 is required.";
      }

      if (!address.city.trim()) {
        return "Billing city is required.";
      }

      if (!address.stateCode.trim()) {
        return "Billing state code is required.";
      }

      if (!address.partyCode.trim()) {
        return "Billing party code is required.";
      }

      if (!address.addressType.trim()) {
        return "Billing address type is required.";
      }

      if (!/^\d{6,}$/.test(address.pincode.trim())) {
        return "Billing pincode must contain at least 6 digits.";
      }

      if (!address.phone.trim()) {
        return "Billing phone is required.";
      }
    }

    if (form.shippingAddress) {
      const address = form.shippingAddress;

      if (!address.addressLine1.trim()) {
        return "Shipping address line 1 is required.";
      }

      if (!address.city.trim()) {
        return "Shipping city is required.";
      }

      if (!address.stateCode.trim()) {
        return "Shipping state code is required.";
      }

      if (!address.partyCode.trim()) {
        return "Shipping party code is required.";
      }

      if (!address.addressType.trim()) {
        return "Shipping address type is required.";
      }

      if (!/^\d{6,}$/.test(address.pincode.trim())) {
        return "Shipping pincode must contain at least 6 digits.";
      }

      if (!address.phone.trim()) {
        return "Shipping phone is required.";
      }
    }

    for (let i = 0; i < form.partyContacts.length; i++) {
      const contact = form.partyContacts[i];

      if (!contact.contactType.trim()) {
        return `Contact ${i + 1}: contact type is required.`;
      }

      if (!contact.partyCode.trim()) {
        return `Contact ${i + 1}: party code is required.`;
      }

      if (!contact.name.trim()) {
        return `Contact ${i + 1}: name is required.`;
      }

      if (!contact.email.trim()) {
        return `Contact ${i + 1}: email is required.`;
      }
    }

    return "";
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResponse(null);

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      customer: {
        ...form,
        code: form.code.trim(),
        name: form.name.trim(),

        billingAddress: {
          ...form.billingAddress,
          addressLine1:
            form.billingAddress.addressLine1.trim(),
          city: form.billingAddress.city.trim(),
          stateCode:
            form.billingAddress.stateCode.trim(),
          partyCode:
            form.billingAddress.partyCode.trim(),
          addressType:
            form.billingAddress.addressType.trim(),
          pincode:
            form.billingAddress.pincode.trim(),
          phone:
            form.billingAddress.phone.trim(),
        },

        shippingAddress: {
          ...form.shippingAddress,
          addressLine1:
            form.shippingAddress.addressLine1.trim(),
          city: form.shippingAddress.city.trim(),
          stateCode:
            form.shippingAddress.stateCode.trim(),
          partyCode:
            form.shippingAddress.partyCode.trim(),
          addressType:
            form.shippingAddress.addressType.trim(),
          pincode:
            form.shippingAddress.pincode.trim(),
          phone:
            form.shippingAddress.phone.trim(),
        },

        partyContacts:
          form.partyContacts.map((contact) => ({
            ...contact,
            contactType:
              contact.contactType.trim(),
            partyCode:
              contact.partyCode.trim(),
            name: contact.name.trim(),
            email: contact.email.trim(),
            phone: contact.phone.trim(),
            fax: contact.fax.trim(),
          })),
      },
    };

    try {
      setLoading(true);

      const res = await axios.post(
        `${SERVER_URL}/api/uniware/customers/create`,
        payload
      );

      setResponse(res.data);
    } catch (err) {
      console.error(
        "Create customer error:",
        err
      );

      const apiError = err.response?.data;

      setResponse(apiError || null);

      setError(
        apiError?.message ||
          apiError?.errors?.[0]?.message ||
          err.message ||
          "Failed to create customer."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // CLEAR
  // ==========================================================

  const handleClear = () => {
    setForm(INITIAL_FORM);
    setResponse(null);
    setError("");
  };

  return (
    <div style={pageStyle}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>
          Create Uniware Customer
        </h2>

        <p style={{ color: "#666" }}>
          Create a B2B customer in Uniware with billing,
          shipping and contact information.
        </p>
      </div>

      {/* ======================================================
          BASIC CUSTOMER DETAILS
      ====================================================== */}

      <Section title="Customer Details">
        <div style={gridStyle}>
          <Field
            label="Customer Name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <Field
            label="Customer Code *"
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="CUSTOMER_001"
          />

          <Field
            label="Alternate Code"
            name="alternateCode"
            value={form.alternateCode}
            onChange={handleChange}
          />

          <Field
            label="PAN"
            name="pan"
            value={form.pan}
            onChange={handleChange}
          />

          <Field
            label="TIN"
            name="tin"
            value={form.tin}
            onChange={handleChange}
          />

          <Field
            label="CIN Number"
            name="cinNumber"
            value={form.cinNumber}
            onChange={handleChange}
          />

          <Field
            label="CST Number"
            name="cstNumber"
            value={form.cstNumber}
            onChange={handleChange}
          />

          <Field
            label="ST Number"
            name="stNumber"
            value={form.stNumber}
            onChange={handleChange}
          />

          <Field
            label="GST Number"
            name="gstNumber"
            value={form.gstNumber}
            onChange={handleChange}
            maxLength={15}
          />

          <Field
            label="Website"
            name="website"
            value={form.website}
            onChange={handleChange}
          />

          <Field
            label="Uniware Access URL"
            name="uniwareAccessUrl"
            value={form.uniwareAccessUrl}
            onChange={handleChange}
          />

          <Field
            label="Uniware API User"
            name="uniwareApiUser"
            value={form.uniwareApiUser}
            onChange={handleChange}
          />

          <Field
            label="Uniware API Password"
            name="uniwareApiPassword"
            type="password"
            value={form.uniwareApiPassword}
            onChange={handleChange}
          />
        </div>

        <Checkbox
          label="Enabled"
          name="enabled"
          checked={form.enabled}
          onChange={handleChange}
        />

        <Checkbox
          label="Tax Exempted"
          name="taxExempted"
          checked={form.taxExempted}
          onChange={handleChange}
        />

        <Checkbox
          label="Registered Dealer"
          name="registeredDealer"
          checked={form.registeredDealer}
          onChange={handleChange}
        />

        <Checkbox
          label="Provides C Form"
          name="providesCform"
          checked={form.providesCform}
          onChange={handleChange}
        />

        <Checkbox
          label="Dual Company Retail"
          name="dualCompanyRetail"
          checked={form.dualCompanyRetail}
          onChange={handleChange}
        />
      </Section>

      {/* ======================================================
          BILLING ADDRESS
      ====================================================== */}

      <AddressSection
        title="Billing Address"
        address={form.billingAddress}
        addressType="billingAddress"
        onChange={handleAddressChange}
      />

      {/* ======================================================
          SHIPPING ADDRESS
      ====================================================== */}

      <AddressSection
        title="Shipping Address"
        address={form.shippingAddress}
        addressType="shippingAddress"
        onChange={handleAddressChange}
      />

      {/* ======================================================
          CONTACTS
      ====================================================== */}

      <Section title="Party Contacts">
        {form.partyContacts.map((contact, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <strong>
                Contact {index + 1}
              </strong>

              {form.partyContacts.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    removeContact(index)
                  }
                  style={dangerButton}
                >
                  Remove
                </button>
              )}
            </div>

            <div style={gridStyle}>
              <Field
                label="Contact Type *"
                value={contact.contactType}
                onChange={(e) =>
                  handleContactChange(
                    index,
                    "contactType",
                    e.target.value
                  )
                }
              />

              <Field
                label="Party Code *"
                value={contact.partyCode}
                onChange={(e) =>
                  handleContactChange(
                    index,
                    "partyCode",
                    e.target.value
                  )
                }
              />

              <Field
                label="Name *"
                value={contact.name}
                onChange={(e) =>
                  handleContactChange(
                    index,
                    "name",
                    e.target.value
                  )
                }
              />

              <Field
                label="Email *"
                type="email"
                value={contact.email}
                onChange={(e) =>
                  handleContactChange(
                    index,
                    "email",
                    e.target.value
                  )
                }
              />

              <Field
                label="Phone"
                value={contact.phone}
                onChange={(e) =>
                  handleContactChange(
                    index,
                    "phone",
                    e.target.value
                  )
                }
              />

              <Field
                label="Fax"
                value={contact.fax}
                onChange={(e) =>
                  handleContactChange(
                    index,
                    "fax",
                    e.target.value
                  )
                }
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addContact}
          style={secondaryButton}
        >
          + Add Contact
        </button>
      </Section>

      {/* ======================================================
          ACTIONS
      ====================================================== */}

      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          style={{
            ...primaryButton,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading
            ? "Creating..."
            : "Create Customer"}
        </button>

        <button
          type="button"
          onClick={handleClear}
          style={secondaryButton}
        >
          Clear
        </button>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div style={errorBox}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ======================================================
          SUCCESS / RESPONSE
      ====================================================== */}

      {response && (
        <div style={responseBox}>
          <h3 style={{ marginTop: 0 }}>
            Uniware Response
          </h3>

          <div style={{ marginBottom: 12 }}>
            <strong>Status: </strong>

            <span
              style={{
                color: response.successful
                  ? "#2e7d32"
                  : "#c62828",
                fontWeight: 700,
              }}
            >
              {response.successful
                ? "SUCCESSFUL"
                : "FAILED"}
            </span>
          </div>

          {response.message && (
            <div style={{ marginBottom: 15 }}>
              <strong>Message:</strong>{" "}
              {response.message}
            </div>
          )}

          {response.customer && (
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <h4>Created Customer</h4>

              <div style={gridStyle}>
                <Info
                  label="Name"
                  value={response.customer.name}
                />

                <Info
                  label="Code"
                  value={response.customer.code}
                />

                <Info
                  label="Alternate Code"
                  value={
                    response.customer.alternateCode
                  }
                />

                <Info
                  label="GST Number"
                  value={
                    response.customer.gstNumber
                  }
                />

                <Info
                  label="PAN"
                  value={response.customer.pan}
                />

                <Info
                  label="Enabled"
                  value={
                    response.customer.enabled
                      ? "Yes"
                      : "No"
                  }
                />
              </div>
            </div>
          )}

          {response.errors?.length > 0 && (
            <div style={errorBox}>
              <h4>Uniware Errors</h4>

              {response.errors.map(
                (item, index) => (
                  <div key={index}>
                    <strong>
                      {item.fieldName ||
                        "Error"}
                      :
                    </strong>{" "}
                    {item.message ||
                      item.description ||
                      "Unknown error"}
                  </div>
                )
              )}
            </div>
          )}

          {response.warnings?.length > 0 && (
            <div style={warningBox}>
              <h4>Warnings</h4>

              {response.warnings.map(
                (item, index) => (
                  <div key={index}>
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

          <details>
            <summary
              style={{
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              View Raw Response
            </summary>

            <pre style={rawStyle}>
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
};

// ============================================================
// ADDRESS SECTION
// ============================================================

const AddressSection = ({
  title,
  address,
  addressType,
  onChange,
}) => {
  return (
    <Section title={title}>
      <div style={gridStyle}>
        <Field
          label="Address Line 1 *"
          value={address.addressLine1}
          onChange={(e) =>
            onChange(
              addressType,
              "addressLine1",
              e.target.value
            )
          }
        />

        <Field
          label="Address Line 2"
          value={address.addressLine2}
          onChange={(e) =>
            onChange(
              addressType,
              "addressLine2",
              e.target.value
            )
          }
        />

        <Field
          label="City *"
          value={address.city}
          onChange={(e) =>
            onChange(
              addressType,
              "city",
              e.target.value
            )
          }
        />

        <Field
          label="State Code *"
          value={address.stateCode}
          onChange={(e) =>
            onChange(
              addressType,
              "stateCode",
              e.target.value
            )
          }
          placeholder="KA"
        />

        <Field
          label="Country Code"
          value={address.countryCode}
          onChange={(e) =>
            onChange(
              addressType,
              "countryCode",
              e.target.value
            )
          }
        />

        <Field
          label="Party Code *"
          value={address.partyCode}
          onChange={(e) =>
            onChange(
              addressType,
              "partyCode",
              e.target.value
            )
          }
        />

        <Field
          label="Address Type *"
          value={address.addressType}
          onChange={(e) =>
            onChange(
              addressType,
              "addressType",
              e.target.value
            )
          }
        />

        <Field
          label="Pincode *"
          value={address.pincode}
          onChange={(e) =>
            onChange(
              addressType,
              "pincode",
              e.target.value
            )
          }
        />

        <Field
          label="Phone *"
          value={address.phone}
          onChange={(e) =>
            onChange(
              addressType,
              "phone",
              e.target.value
            )
          }
        />

        <Field
          label="Latitude"
          value={address.latitude}
          onChange={(e) =>
            onChange(
              addressType,
              "latitude",
              e.target.value
            )
          }
        />

        <Field
          label="Longitude"
          value={address.longitude}
          onChange={(e) =>
            onChange(
              addressType,
              "longitude",
              e.target.value
            )
          }
        />
      </div>
    </Section>
  );
};

// ============================================================
// REUSABLE UI
// ============================================================

const Section = ({ title, children }) => (
  <section
    style={{
      background: "#fff",
      border: "1px solid #ddd",
      borderRadius: 8,
      padding: 20,
      marginBottom: 20,
    }}
  >
    <h3
      style={{
        marginTop: 0,
        marginBottom: 18,
      }}
    >
      {title}
    </h3>

    {children}
  </section>
);

const Field = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  maxLength,
}) => (
  <div>
    <label
      style={{
        display: "block",
        fontWeight: 600,
        marginBottom: 6,
        fontSize: 14,
      }}
    >
      {label}
    </label>

    <input
      type={type}
      name={name}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      style={inputStyle}
    />
  </div>
);

const Checkbox = ({
  label,
  name,
  checked,
  onChange,
}) => (
  <label
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      marginRight: 20,
      marginTop: 15,
      cursor: "pointer",
    }}
  >
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
    />

    {label}
  </label>
);

const Info = ({ label, value }) => (
  <div>
    <div
      style={{
        color: "#777",
        fontSize: 12,
        marginBottom: 4,
      }}
    >
      {label}
    </div>

    <div style={{ fontWeight: 600 }}>
      {value === undefined ||
      value === null ||
      value === ""
        ? "-"
        : String(value)}
    </div>
  </div>
);

// ============================================================
// STYLES
// ============================================================

const pageStyle = {
  padding: 24,
  maxWidth: 1500,
  margin: "0 auto",
  fontFamily: "Arial, Helvetica, sans-serif",
  background: "#f7f7f7",
  minHeight: "100vh",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1px solid #ccc",
  borderRadius: 5,
  fontSize: 14,
};

const primaryButton = {
  padding: "11px 20px",
  border: "none",
  borderRadius: 6,
  background: "#1976d2",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

const secondaryButton = {
  padding: "11px 20px",
  border: "1px solid #bbb",
  borderRadius: 6,
  background: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

const dangerButton = {
  padding: "7px 12px",
  border: "1px solid #d32f2f",
  borderRadius: 5,
  background: "#fff",
  color: "#d32f2f",
  cursor: "pointer",
};

const errorBox = {
  background: "#ffebee",
  border: "1px solid #ef9a9a",
  color: "#b71c1c",
  padding: 14,
  borderRadius: 6,
  marginBottom: 20,
};

const warningBox = {
  background: "#fff8e1",
  border: "1px solid #ffe082",
  color: "#795548",
  padding: 14,
  borderRadius: 6,
  marginBottom: 20,
};

const responseBox = {
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 20,
  marginBottom: 20,
};

const rawStyle = {
  marginTop: 12,
  background: "#1e1e1e",
  color: "#fff",
  padding: 16,
  borderRadius: 6,
  overflow: "auto",
  fontSize: 13,
};

export default CreateCustomer;