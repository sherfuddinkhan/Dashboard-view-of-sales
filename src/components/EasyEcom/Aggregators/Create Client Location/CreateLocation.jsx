import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const initialFormData = {
  phone: "",
  company_name: "",
  email: "",
  client_id: "",
  branding_user_id: "",
  password: "",
  companyLevelTaxRate: "",
  confirm_without_inventory: 0,
  copyMaster: 1,
  manageInventory: 1,

  shipping_address: {
    address_line_1: "",
    address_line_2: "",
    state_code: "",
    pin_code: "",
    country: "India",
  },

  billing_address: {
    address_line_1: "",
    address_line_2: "",
    state_code: "",
    pin_code: "",
    country: "India",
  },
};

const CreateLocation = () => {
  const [formData, setFormData] = useState(initialFormData);

  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (addressType, e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [addressType]: {
        ...prev[addressType],
        [name]: value,
      },
    }));
  };

  const createLocation = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResponseData(null);

    try {
      if (!formData.phone) {
        throw new Error("Phone is required");
      }

      if (!formData.company_name.trim()) {
        throw new Error("Company Name is required");
      }

      if (!formData.email.trim()) {
        throw new Error("Email is required");
      }

      if (!formData.client_id.trim()) {
        throw new Error("Client ID is required");
      }

      if (!formData.branding_user_id.trim()) {
        throw new Error("Branding User ID is required");
      }

      if (!formData.password) {
        throw new Error("Password is required");
      }

      const requestBody = {
        phone: Number(formData.phone),
        company_name: formData.company_name,
        email: formData.email,
        client_id: formData.client_id,
        branding_user_id: formData.branding_user_id,
        password: formData.password,

        companyLevelTaxRate:
          formData.companyLevelTaxRate !== ""
            ? Number(formData.companyLevelTaxRate)
            : undefined,

        confirm_without_inventory: Number(
          formData.confirm_without_inventory
        ),

        copyMaster: Number(formData.copyMaster),

        manageInventory: Number(
          formData.manageInventory
        ),

        shipping_address: {
          address_line_1:
            formData.shipping_address.address_line_1,
          address_line_2:
            formData.shipping_address.address_line_2,
          state_code:
            formData.shipping_address.state_code,
          pin_code:
            Number(formData.shipping_address.pin_code),
          country:
            formData.shipping_address.country,
        },

        billing_address: {
          address_line_1:
            formData.billing_address.address_line_1,
          address_line_2:
            formData.billing_address.address_line_2,
          state_code:
            formData.billing_address.state_code,
          pin_code:
            Number(formData.billing_address.pin_code),
          country:
            formData.billing_address.country,
        },
      };

      // Remove optional undefined property
      if (
        requestBody.companyLevelTaxRate === undefined
      ) {
        delete requestBody.companyLevelTaxRate;
      }

      const response = await fetch(
        `${SERVER_URL}/api/createLocation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to create location"
        );
      }

      setResponseData(data);
    } catch (err) {
      setError(
        err.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData(initialFormData);
    setResponseData(null);
    setError("");
  };

  const renderAddressSection = (
    title,
    addressType
  ) => {
    const address = formData[addressType];

    return (
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "6px",
          padding: "20px",
          marginTop: "25px",
        }}
      >
        <h3>{title}</h3>

        <div style={fieldStyle}>
          <label>Address Line 1 *</label>

          <input
            type="text"
            name="address_line_1"
            value={address.address_line_1}
            onChange={(e) =>
              handleAddressChange(
                addressType,
                e
              )
            }
            required
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label>Address Line 2</label>

          <input
            type="text"
            name="address_line_2"
            value={address.address_line_2}
            onChange={(e) =>
              handleAddressChange(
                addressType,
                e
              )
            }
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label>State Code *</label>

          <input
            type="text"
            name="state_code"
            value={address.state_code}
            onChange={(e) =>
              handleAddressChange(
                addressType,
                e
              )
            }
            placeholder="Example: UP"
            required
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label>PIN Code *</label>

          <input
            type="number"
            name="pin_code"
            value={address.pin_code}
            onChange={(e) =>
              handleAddressChange(
                addressType,
                e
              )
            }
            required
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label>Country *</label>

          <input
            type="text"
            name="country"
            value={address.country}
            onChange={(e) =>
              handleAddressChange(
                addressType,
                e
              )
            }
            required
            style={inputStyle}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "25px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Create Location</h2>

      <p style={{ color: "#555" }}>
        Create a location in EasyEcom.
      </p>

      <form onSubmit={createLocation}>
        <div style={fieldStyle}>
          <label>Phone *</label>

          <input
            type="number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label>Company Name *</label>

          <input
            type="text"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label>Email *</label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label>Client ID *</label>

          <input
            type="text"
            name="client_id"
            value={formData.client_id}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label>Branding User ID *</label>

          <input
            type="text"
            name="branding_user_id"
            value={formData.branding_user_id}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label>Password *</label>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label>Company Level Tax Rate</label>

          <select
            name="companyLevelTaxRate"
            value={formData.companyLevelTaxRate}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="">
              Select Tax Rate
            </option>
            <option value="0">0%</option>
            <option value="3">3%</option>
            <option value="5">5%</option>
            <option value="12">12%</option>
            <option value="18">18%</option>
            <option value="28">28%</option>
          </select>
        </div>

        <div style={fieldStyle}>
          <label>
            Confirm Without Inventory
          </label>

          <select
            name="confirm_without_inventory"
            value={
              formData.confirm_without_inventory
            }
            onChange={handleChange}
            style={inputStyle}
          >
            <option value={0}>
              0 - Inventory Management
            </option>

            <option value={1}>
              1 - Without Inventory Management
            </option>
          </select>
        </div>

        <div style={fieldStyle}>
          <label>Copy Master</label>

          <select
            name="copyMaster"
            value={formData.copyMaster}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value={1}>
              1 - Copy Master
            </option>

            <option value={0}>
              0 - Do Not Copy Master
            </option>
          </select>
        </div>

        <div style={fieldStyle}>
          <label>Manage Inventory</label>

          <select
            name="manageInventory"
            value={formData.manageInventory}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value={1}>
              1 - Manage Inventory
            </option>

            <option value={0}>
              0 - Do Not Manage Inventory
            </option>
          </select>
        </div>

        {renderAddressSection(
          "Shipping Address",
          "shipping_address"
        )}

        {renderAddressSection(
          "Billing Address",
          "billing_address"
        )}

        <div style={{ marginTop: "25px" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "11px 22px",
              backgroundColor: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              marginRight: "10px",
            }}
          >
            {loading
              ? "Creating..."
              : "Create Location"}
          </button>

          <button
            type="button"
            onClick={clearForm}
            style={{
              padding: "11px 22px",
              backgroundColor: "#777",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </div>
      </form>

      {error && (
        <div
          style={{
            marginTop: "25px",
            padding: "15px",
            backgroundColor: "#ffebee",
            color: "#c62828",
            borderRadius: "5px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {responseData && (
        <div style={{ marginTop: "25px" }}>
          <h3>Response</h3>

          <pre
            style={{
              backgroundColor: "#f5f5f5",
              padding: "20px",
              borderRadius: "5px",
              border: "1px solid #ddd",
              overflowX: "auto",
            }}
          >
            {JSON.stringify(
              responseData,
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
};

const fieldStyle = {
  marginBottom: "18px",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "6px",
  boxSizing: "border-box",
  border: "1px solid #ccc",
  borderRadius: "4px",
};

export default CreateLocation;