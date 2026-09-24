import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function UpdateSaleOrder() {
  const [formData, setFormData] = useState({
    saleOrderCode: "",
    billingReferenceId: "",
    shippingReferenceId: "",
  });

  const [addresses, setAddresses] = useState([
    {
      id: "1",
      name: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
      phone: "",
      email: "",
    },
  ]);

  const [addressItems, setAddressItems] = useState([]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // ==========================================
  // BASIC FIELD CHANGE
  // ==========================================
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // ADDRESS CHANGE
  // ==========================================
  const handleAddressChange = (index, field, value) => {
    setAddresses((prev) =>
      prev.map((address, addressIndex) =>
        addressIndex === index
          ? {
              ...address,
              [field]: value,
            }
          : address
      )
    );
  };

  // ==========================================
  // ADD ADDRESS
  // ==========================================
  const addAddress = () => {
    setAddresses((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        name: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        country: "India",
        pincode: "",
        phone: "",
        email: "",
      },
    ]);
  };

  // ==========================================
  // REMOVE ADDRESS
  // ==========================================
  const removeAddress = (index) => {
    setAddresses((prev) =>
      prev.filter((_, addressIndex) => addressIndex !== index)
    );
  };

  // ==========================================
  // ITEM ADDRESS CHANGE
  // ==========================================
  const handleItemAddressChange = (
    index,
    field,
    value
  ) => {
    setAddressItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  // ==========================================
  // ADD ITEM ADDRESS
  // ==========================================
  const addItemAddress = () => {
    setAddressItems((prev) => [
      ...prev,
      {
        saleOrderItemCode: "",
        referenceId: "",
      },
    ]);
  };

  // ==========================================
  // REMOVE ITEM ADDRESS
  // ==========================================
  const removeItemAddress = (index) => {
    setAddressItems((prev) =>
      prev.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  // ==========================================
  // VALIDATION
  // ==========================================
  const validateForm = () => {
    if (!formData.saleOrderCode.trim()) {
      return "Sale order code is required.";
    }

    if (addresses.length === 0) {
      return "At least one address is required.";
    }

    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];

      if (!address.id.trim()) {
        return `Address ${i + 1}: ID is required.`;
      }

      if (!address.name.trim()) {
        return `Address ${i + 1}: name is required.`;
      }

      if (!address.addressLine1.trim()) {
        return `Address ${i + 1}: address line 1 is required.`;
      }

      if (!address.city.trim()) {
        return `Address ${i + 1}: city is required.`;
      }

      if (!address.state.trim()) {
        return `Address ${i + 1}: state is required.`;
      }

      if (!address.phone.trim()) {
        return `Address ${i + 1}: phone is required.`;
      }

      if (
        address.pincode.trim() &&
        address.pincode.trim().length < 6
      ) {
        return `Address ${i + 1}: pincode must contain at least 6 characters.`;
      }
    }

    for (let i = 0; i < addressItems.length; i++) {
      const item = addressItems[i];

      if (!item.saleOrderItemCode.trim()) {
        return `Item address ${i + 1}: sale order item code is required.`;
      }

      if (!item.referenceId.trim()) {
        return `Item address ${i + 1}: shipping reference ID is required.`;
      }
    }

    return "";
  };

  // ==========================================
  // BUILD PAYLOAD
  // ==========================================
  const buildPayload = () => {
    const payload = {
      saleOrderAddress: {
        saleOrderCode: formData.saleOrderCode.trim(),

        addresses: addresses.map((address) => {
          const item = {
            id: address.id.trim(),
            name: address.name.trim(),
            addressLine1: address.addressLine1.trim(),
            city: address.city.trim(),
            state: address.state.trim(),
            phone: address.phone.trim(),
          };

          if (address.addressLine2.trim()) {
            item.addressLine2 =
              address.addressLine2.trim();
          }

          if (address.country.trim()) {
            item.country = address.country.trim();
          }

          if (address.pincode.trim()) {
            item.pincode = address.pincode.trim();
          }

          if (address.email.trim()) {
            item.email = address.email.trim();
          }

          return item;
        }),
      },
    };

    if (formData.billingReferenceId.trim()) {
      payload.saleOrderAddress.billingAddress = {
        referenceId:
          formData.billingReferenceId.trim(),
      };
    }

    if (formData.shippingReferenceId.trim()) {
      payload.saleOrderAddress.shippingAddress = {
        referenceId:
          formData.shippingReferenceId.trim(),
      };
    }

    if (addressItems.length > 0) {
      payload.saleOrderAddress.saleOrderAddressItems =
        addressItems.map((item) => ({
          saleOrderItemCode:
            item.saleOrderItemCode.trim(),

          shippingAddress: {
            referenceId: item.referenceId.trim(),
          },
        }));
    }

    return payload;
  };

  // ==========================================
  // SUBMIT
  // ==========================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = buildPayload();

      const response = await axios.post(
        `${SERVER_URL}/api/uniware/sale-orders/update`,
        payload
      );

      setResult(response.data);
    } catch (err) {
      const apiError = err.response?.data;

      setError(
        apiError?.message ||
          err.message ||
          "Failed to update sale order."
      );

      setResult(apiError || null);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RESET
  // ==========================================
  const handleReset = () => {
    setFormData({
      saleOrderCode: "",
      billingReferenceId: "",
      shippingReferenceId: "",
    });

    setAddresses([
      {
        id: "1",
        name: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        country: "India",
        pincode: "",
        phone: "",
        email: "",
      },
    ]);

    setAddressItems([]);
    setResult(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "30px auto",
        padding: "24px",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      <h2>Update Sale Order</h2>

      <p style={{ color: "#666" }}>
        Update billing, shipping and receiver address
        information for an existing Uniware sale order.
      </p>

      {/* ======================================
          SALE ORDER
      ======================================= */}
      <section style={sectionStyle}>
        <h3>Sale Order</h3>

        <Field
          label="Sale Order Code *"
          value={formData.saleOrderCode}
          onChange={(event) =>
            handleChange({
              target: {
                name: "saleOrderCode",
                value: event.target.value,
              },
            })
          }
          placeholder="SO123456"
        />
      </section>

      {/* ======================================
          BILLING / SHIPPING
      ======================================= */}
      <section style={sectionStyle}>
        <h3>Billing & Shipping References</h3>

        <div style={gridStyle}>
          <Field
            label="Billing Reference ID"
            value={formData.billingReferenceId}
            onChange={(event) =>
              handleChange({
                target: {
                  name: "billingReferenceId",
                  value: event.target.value,
                },
              })
            }
            placeholder="BILL-001"
          />

          <Field
            label="Shipping Reference ID"
            value={formData.shippingReferenceId}
            onChange={(event) =>
              handleChange({
                target: {
                  name: "shippingReferenceId",
                  value: event.target.value,
                },
              })
            }
            placeholder="SHIP-001"
          />
        </div>
      </section>

      {/* ======================================
          ADDRESSES
      ======================================= */}
      <section style={sectionStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3>Addresses *</h3>

          <button
            type="button"
            onClick={addAddress}
            style={secondaryButtonStyle}
          >
            + Add Address
          </button>
        </div>

        {addresses.map((address, index) => (
          <div
            key={index}
            style={{
              marginTop: "18px",
              padding: "18px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h4>Address {index + 1}</h4>

              {addresses.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    removeAddress(index)
                  }
                  style={dangerButtonStyle}
                >
                  Remove
                </button>
              )}
            </div>

            <div style={gridStyle}>
              <AddressField
                label="ID *"
                value={address.id}
                onChange={(value) =>
                  handleAddressChange(
                    index,
                    "id",
                    value
                  )
                }
              />

              <AddressField
                label="Buyer Name *"
                value={address.name}
                onChange={(value) =>
                  handleAddressChange(
                    index,
                    "name",
                    value
                  )
                }
              />

              <AddressField
                label="Address Line 1 *"
                value={address.addressLine1}
                onChange={(value) =>
                  handleAddressChange(
                    index,
                    "addressLine1",
                    value
                  )
                }
              />

              <AddressField
                label="Address Line 2"
                value={address.addressLine2}
                onChange={(value) =>
                  handleAddressChange(
                    index,
                    "addressLine2",
                    value
                  )
                }
              />

              <AddressField
                label="City *"
                value={address.city}
                onChange={(value) =>
                  handleAddressChange(
                    index,
                    "city",
                    value
                  )
                }
              />

              <AddressField
                label="State *"
                value={address.state}
                onChange={(value) =>
                  handleAddressChange(
                    index,
                    "state",
                    value
                  )
                }
              />

              <AddressField
                label="Country"
                value={address.country}
                onChange={(value) =>
                  handleAddressChange(
                    index,
                    "country",
                    value
                  )
                }
              />

              <AddressField
                label="Pincode"
                value={address.pincode}
                onChange={(value) =>
                  handleAddressChange(
                    index,
                    "pincode",
                    value
                  )
                }
              />

              <AddressField
                label="Phone *"
                value={address.phone}
                onChange={(value) =>
                  handleAddressChange(
                    index,
                    "phone",
                    value
                  )
                }
              />

              <AddressField
                label="Email"
                value={address.email}
                onChange={(value) =>
                  handleAddressChange(
                    index,
                    "email",
                    value
                  )
                }
              />
            </div>
          </div>
        ))}
      </section>

      {/* ======================================
          ITEM SHIPPING ADDRESSES
      ======================================= */}
      <section style={sectionStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3>Sale Order Item Shipping Addresses</h3>

          <button
            type="button"
            onClick={addItemAddress}
            style={secondaryButtonStyle}
          >
            + Add Item Address
          </button>
        </div>

        {addressItems.length === 0 && (
          <p style={{ color: "#777" }}>
            No item-level shipping address mappings added.
          </p>
        )}

        {addressItems.map((item, index) => (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr auto",
              gap: "12px",
              alignItems: "end",
              marginTop: "12px",
              padding: "14px",
              border: "1px solid #ddd",
              borderRadius: "6px",
            }}
          >
            <AddressField
              label="Sale Order Item Code *"
              value={item.saleOrderItemCode}
              onChange={(value) =>
                handleItemAddressChange(
                  index,
                  "saleOrderItemCode",
                  value
                )
              }
            />

            <AddressField
              label="Shipping Reference ID *"
              value={item.referenceId}
              onChange={(value) =>
                handleItemAddressChange(
                  index,
                  "referenceId",
                  value
                )
              }
            />

            <button
              type="button"
              onClick={() =>
                removeItemAddress(index)
              }
              style={dangerButtonStyle}
            >
              Remove
            </button>
          </div>
        ))}
      </section>

      {/* ======================================
          ACTIONS
      ======================================= */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "25px",
        }}
      >
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          style={primaryButtonStyle}
        >
          {loading
            ? "Updating..."
            : "Update Sale Order"}
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          style={secondaryButtonStyle}
        >
          Reset
        </button>
      </div>

      {/* ======================================
          ERROR
      ======================================= */}
      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            background: "#ffebee",
            color: "#c62828",
            borderRadius: "6px",
          }}
        >
          {error}
        </div>
      )}

      {/* ======================================
          RESULT
      ======================================= */}
      {result && (
        <div style={{ marginTop: "30px" }}>
          <h3>Response</h3>

          <div
            style={{
              padding: "15px",
              background: result.successful
                ? "#e8f5e9"
                : "#ffebee",
              color: result.successful
                ? "#2e7d32"
                : "#c62828",
              borderRadius: "6px",
            }}
          >
            <strong>
              {result.successful
                ? "Sale Order Updated Successfully"
                : "Sale Order Update Failed"}
            </strong>

            {result.message && (
              <div style={{ marginTop: "5px" }}>
                {result.message}
              </div>
            )}
          </div>

          {/* Errors */}
          {Array.isArray(result.errors) &&
            result.errors.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <h4>Errors</h4>

                {result.errors.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "10px",
                      marginBottom: "8px",
                      background: "#ffebee",
                      borderRadius: "5px",
                    }}
                  >
                    <strong>
                      {item.fieldName || "Error"}
                    </strong>

                    <div>
                      {item.message ||
                        item.description ||
                        "Unknown error"}
                    </div>

                    {item.code !== undefined && (
                      <small>
                        Code: {item.code}
                      </small>
                    )}
                  </div>
                ))}
              </div>
            )}

          {/* Warnings */}
          {Array.isArray(result.warnings) &&
            result.warnings.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <h4>Warnings</h4>

                {result.warnings.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "10px",
                      marginBottom: "8px",
                      background: "#fff8e1",
                      borderRadius: "5px",
                    }}
                  >
                    {item.message ||
                      item.description ||
                      "Warning"}
                  </div>
                ))}
              </div>
            )}

          <details style={{ marginTop: "20px" }}>
            <summary
              style={{
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Raw Response
            </summary>

            <pre
              style={{
                marginTop: "10px",
                padding: "15px",
                background: "#f5f5f5",
                borderRadius: "6px",
                overflowX: "auto",
              }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

// ==========================================
// REUSABLE FIELD
// ==========================================
function Field({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

function AddressField({
  label,
  value,
  onChange,
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        style={inputStyle}
      />
    </div>
  );
}

// ==========================================
// STYLES
// ==========================================
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

const labelStyle = {
  display: "block",
  fontWeight: "600",
  marginBottom: "6px",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "14px",
  boxSizing: "border-box",
};

const primaryButtonStyle = {
  padding: "11px 20px",
  border: "none",
  borderRadius: "6px",
  background: "#1976d2",
  color: "#fff",
  cursor: "pointer",
  fontSize: "14px",
};

const secondaryButtonStyle = {
  padding: "10px 16px",
  border: "none",
  borderRadius: "6px",
  background: "#757575",
  color: "#fff",
  cursor: "pointer",
  fontSize: "14px",
};

const dangerButtonStyle = {
  padding: "8px 14px",
  border: "none",
  borderRadius: "5px",
  background: "#d32f2f",
  color: "#fff",
  cursor: "pointer",
  fontSize: "13px",
};

export default UpdateSaleOrder;