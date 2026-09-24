import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const UpdateCustomer = () => {
  const [form, setForm] = useState({
    code: "",
    name: "",
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
    providesCform: false,
    dualCompanyRetail: false,

    billingAddress: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      stateCode: "",
      countryCode: "IN",
      partyCode: "",
      addressType: "",
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
      addressType: "",
      pincode: "",
      latitude: "",
      longitude: "",
      phone: "",
    },

    partyContacts: [
      {
        contactType: "",
        partyCode: "",
        name: "",
        email: "",
        phone: "",
        fax: "",
      },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleAddressChange = (
    type,
    event
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [type]: {
        ...previous[type],
        [name]: value,
      },
    }));
  };

  const handleContactChange = (
    index,
    event
  ) => {
    const { name, value } = event.target;

    setForm((previous) => {
      const contacts = [
        ...previous.partyContacts,
      ];

      contacts[index] = {
        ...contacts[index],
        [name]: value,
      };

      return {
        ...previous,
        partyContacts: contacts,
      };
    });
  };

  const addContact = () => {
    setForm((previous) => ({
      ...previous,
      partyContacts: [
        ...previous.partyContacts,
        {
          contactType: "",
          partyCode: "",
          name: "",
          email: "",
          phone: "",
          fax: "",
        },
      ],
    }));
  };

  const removeContact = (index) => {
    setForm((previous) => ({
      ...previous,
      partyContacts:
        previous.partyContacts.filter(
          (_, i) => i !== index
        ),
    }));
  };

  const updateCustomer = async () => {
    setError("");
    setResponse(null);

    if (!form.code.trim()) {
      setError(
        "Customer code is required."
      );
      return;
    }

    if (!/^[a-zA-Z0-9-_]+$/.test(form.code.trim())) {
      setError(
        "Customer code may contain only letters, numbers, hyphen and underscore."
      );
      return;
    }

    try {
      setLoading(true);

      const customer = {
        code: form.code.trim(),

        name:
          form.name.trim() || undefined,

        alternateCode:
          form.alternateCode.trim() ||
          undefined,

        pan:
          form.pan.trim() || undefined,

        tin:
          form.tin.trim() || undefined,

        cinNumber:
          form.cinNumber.trim() ||
          undefined,

        cstNumber:
          form.cstNumber.trim() ||
          undefined,

        stNumber:
          form.stNumber.trim() ||
          undefined,

        gstNumber:
          form.gstNumber.trim() ||
          undefined,

        enabled: form.enabled,

        taxExempted:
          form.taxExempted,

        website:
          form.website.trim() ||
          undefined,

        registeredDealer:
          form.registeredDealer,

        uniwareAccessUrl:
          form.uniwareAccessUrl.trim() ||
          undefined,

        uniwareApiUser:
          form.uniwareApiUser.trim() ||
          undefined,

        uniwareApiPassword:
          form.uniwareApiPassword.trim() ||
          undefined,

        billingAddress:
          cleanObject(form.billingAddress),

        shippingAddress:
          cleanObject(form.shippingAddress),

        partyContacts:
          form.partyContacts
            .filter(
              (contact) =>
                contact.name.trim() ||
                contact.email.trim() ||
                contact.contactType.trim()
            )
            .map((contact) =>
              cleanObject(contact)
            ),

        providesCform:
          form.providesCform,

        dualCompanyRetail:
          form.dualCompanyRetail,
      };

      const res = await axios.post(
        `${SERVER_URL}/api/uniware/customers/update`,
        {
          ...customer,
        }
      );

      setResponse(res.data);
    } catch (err) {
      setResponse(
        err.response?.data || {
          successful: false,
          message: err.message,
        }
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update customer."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "24px",
      }}
    >
      <h2>Update Uniware Customer</h2>

      <section style={sectionStyle}>
        <h3>Customer Details</h3>

        <div style={gridStyle}>
          {[
            ["code", "Customer Code *"],
            ["name", "Customer Name"],
            ["alternateCode", "Alternate Code"],
            ["pan", "PAN"],
            ["tin", "TIN"],
            ["cinNumber", "CIN Number"],
            ["cstNumber", "CST Number"],
            ["stNumber", "ST Number"],
            ["gstNumber", "GST Number"],
            ["website", "Website"],
            ["uniwareAccessUrl", "Uniware Access URL"],
            ["uniwareApiUser", "Uniware API User"],
            [
              "uniwareApiPassword",
              "Uniware API Password",
            ],
          ].map(([name, label]) => (
            <div key={name}>
              <label>{label}</label>

              <input
                type={
                  name ===
                  "uniwareApiPassword"
                    ? "password"
                    : "text"
                }
                name={name}
                value={form[name]}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
      </section>

      <AddressForm
        title="Billing Address"
        address={form.billingAddress}
        type="billingAddress"
        onChange={handleAddressChange}
      />

      <AddressForm
        title="Shipping Address"
        address={form.shippingAddress}
        type="shippingAddress"
        onChange={handleAddressChange}
      />

      <section style={sectionStyle}>
        <h3>Party Contacts</h3>

        {form.partyContacts.map(
          (contact, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "6px",
              }}
            >
              <div style={gridStyle}>
                {[
                  ["contactType", "Contact Type"],
                  ["partyCode", "Party Code"],
                  ["name", "Name"],
                  ["email", "Email"],
                  ["phone", "Phone"],
                  ["fax", "Fax"],
                ].map(([name, label]) => (
                  <div key={name}>
                    <label>{label}</label>

                    <input
                      type="text"
                      name={name}
                      value={contact[name]}
                      onChange={(e) =>
                        handleContactChange(
                          index,
                          e
                        )
                      }
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>

              {form.partyContacts.length >
                1 && (
                <button
                  type="button"
                  onClick={() =>
                    removeContact(index)
                  }
                  style={{
                    marginTop: "12px",
                  }}
                >
                  Remove Contact
                </button>
              )}
            </div>
          )
        )}

        <button
          type="button"
          onClick={addContact}
        >
          + Add Contact
        </button>
      </section>

      <section style={sectionStyle}>
        <h3>Options</h3>

        <Checkbox
          name="enabled"
          label="Enabled"
          checked={form.enabled}
          onChange={handleChange}
        />

        <Checkbox
          name="taxExempted"
          label="Tax Exempted"
          checked={form.taxExempted}
          onChange={handleChange}
        />

        <Checkbox
          name="registeredDealer"
          label="Registered Dealer"
          checked={form.registeredDealer}
          onChange={handleChange}
        />

        <Checkbox
          name="providesCform"
          label="Provides C Form"
          checked={form.providesCform}
          onChange={handleChange}
        />

        <Checkbox
          name="dualCompanyRetail"
          label="Dual Company Retail"
          checked={form.dualCompanyRetail}
          onChange={handleChange}
        />
      </section>

      <button
        onClick={updateCustomer}
        disabled={loading}
        style={primaryButton}
      >
        {loading
          ? "Updating..."
          : "Update Customer"}
      </button>

      {error && (
        <div style={errorBox}>
          {error}
        </div>
      )}

      {response && (
        <section style={sectionStyle}>
          <h3>Uniware Response</h3>

          <div
            style={{
              padding: "12px",
              background: response.successful
                ? "#e8f5e9"
                : "#ffebee",
            }}
          >
            <strong>
              {response.successful
                ? "Customer Updated Successfully"
                : "Customer Update Failed"}
            </strong>

            <div>
              {response.message || ""}
            </div>
          </div>

          {response.customer && (
            <pre style={preStyle}>
              {JSON.stringify(
                response.customer,
                null,
                2
              )}
            </pre>
          )}

          {response.errors?.length > 0 && (
            <pre style={preStyle}>
              {JSON.stringify(
                response.errors,
                null,
                2
              )}
            </pre>
          )}

          {response.warnings?.length > 0 && (
            <pre style={preStyle}>
              {JSON.stringify(
                response.warnings,
                null,
                2
              )}
            </pre>
          )}
        </section>
      )}
    </div>
  );
};


/* =========================================================
   ADDRESS
   ========================================================= */

const AddressForm = ({
  title,
  address,
  type,
  onChange,
}) => {
  const fields = [
    ["addressLine1", "Address Line 1"],
    ["addressLine2", "Address Line 2"],
    ["city", "City"],
    ["stateCode", "State Code"],
    ["countryCode", "Country Code"],
    ["partyCode", "Party Code"],
    ["addressType", "Address Type"],
    ["pincode", "Pincode"],
    ["latitude", "Latitude"],
    ["longitude", "Longitude"],
    ["phone", "Phone"],
  ];

  return (
    <section style={sectionStyle}>
      <h3>{title}</h3>

      <div style={gridStyle}>
        {fields.map(([name, label]) => (
          <div key={name}>
            <label>{label}</label>

            <input
              type="text"
              name={name}
              value={address[name]}
              onChange={(e) =>
                onChange(type, e)
              }
              style={inputStyle}
            />
          </div>
        ))}
      </div>
    </section>
  );
};


/* =========================================================
   HELPERS
   ========================================================= */

const cleanObject = (object) => {
  const result = {};

  Object.entries(object).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      ) {
        result[key] = String(value).trim();
      }
    }
  );

  return Object.keys(result).length
    ? result
    : undefined;
};

const Checkbox = ({
  name,
  label,
  checked,
  onChange,
}) => (
  <label
    style={{
      display: "block",
      marginBottom: "10px",
    }}
  >
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
    />

    {" "}

    {label}
  </label>
);


/* =========================================================
   STYLES
   ========================================================= */

const sectionStyle = {
  marginTop: "20px",
  padding: "20px",
  border: "1px solid #ddd",
  borderRadius: "8px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px",
  marginTop: "6px",
  border: "1px solid #ccc",
  borderRadius: "5px",
};

const primaryButton = {
  padding: "11px 18px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  marginTop: "20px",
};

const errorBox = {
  marginTop: "20px",
  padding: "12px",
  background: "#ffebee",
  color: "#b71c1c",
};

const preStyle = {
  padding: "15px",
  background: "#f5f5f5",
  overflowX: "auto",
};

export default UpdateCustomer;