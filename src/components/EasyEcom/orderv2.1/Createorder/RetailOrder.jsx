import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const initialItem = {
  OrderItemId: "",
  Sku: "",
  ean: "",
  AccountingSku: "",
  productName: "",
  Quantity: 1,
  Price: 0,
  itemDiscount: 0,
  custom_fields: [],
};

const initialCustomField = {
  id: "",
  value: "",
};

function RetailOrder() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    orderType: "retailorder",
    marketplaceId: 10,
    orderNumber: "",
    orderDate: "",
    expDeliveryDate: "",
    remarks1: "",
    remarks2: "",
    shippingCost: 0,
    discount: 0,
    walletDiscount: 0,
    promoCodeDiscount: 0,
    prepaidDiscount: 0,
    paymentMode: 2,
    paymentGateway: "",
    shippingMethod: 1,
    is_market_shipped: 0,
    company_carrier_id: 6691,
    packageWeight: 0,
    packageHeight: 0,
    packageWidth: 0,
    packageLength: 0,
    paymentTransactionNumber: "",
  });

  const [items, setItems] = useState([
    {
      ...initialItem,
      custom_fields: [],
    },
  ]);

  const [customer, setCustomer] = useState({
    gst_number: "",
    billing: {
      name: "",
      addressLine1: "",
      addressLine2: "",
      postalCode: "",
      city: "",
      state: "",
      country: "India",
      contact: "",
      email: "",
    },
    shipping: {
      name: "",
      addressLine1: "",
      addressLine2: "",
      postalCode: "",
      city: "",
      state: "",
      country: "India",
      contact: "",
      email: "",
      latitude: "",
      longitude: "",
    },
  });

  // -----------------------------
  // Order fields
  // -----------------------------
  const handleOrderChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // -----------------------------
  // Customer fields
  // -----------------------------
  const handleCustomerChange = (section, field, value) => {
    setCustomer((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleGstChange = (value) => {
    setCustomer((prev) => ({
      ...prev,
      gst_number: value,
    }));
  };

  // -----------------------------
  // Items
  // -----------------------------
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        ...initialItem,
        custom_fields: [],
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      return;
    }

    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
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

  // -----------------------------
  // Custom fields
  // -----------------------------
  const addCustomField = (itemIndex) => {
    setItems((prev) =>
      prev.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              custom_fields: [
                ...item.custom_fields,
                { ...initialCustomField },
              ],
            }
          : item
      )
    );
  };

  const removeCustomField = (itemIndex, fieldIndex) => {
    setItems((prev) =>
      prev.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              custom_fields: item.custom_fields.filter(
                (_, i) => i !== fieldIndex
              ),
            }
          : item
      )
    );
  };

  const handleCustomFieldChange = (
    itemIndex,
    fieldIndex,
    field,
    value
  ) => {
    setItems((prev) =>
      prev.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              custom_fields: item.custom_fields.map(
                (customField, i) =>
                  i === fieldIndex
                    ? {
                        ...customField,
                        [field]: value,
                      }
                    : customField
              ),
            }
          : item
      )
    );
  };

  // -----------------------------
  // Reset
  // -----------------------------
  const resetForm = () => {
    setForm({
      orderType: "retailorder",
      marketplaceId: 10,
      orderNumber: "",
      orderDate: "",
      expDeliveryDate: "",
      remarks1: "",
      remarks2: "",
      shippingCost: 0,
      discount: 0,
      walletDiscount: 0,
      promoCodeDiscount: 0,
      prepaidDiscount: 0,
      paymentMode: 2,
      paymentGateway: "",
      shippingMethod: 1,
      is_market_shipped: 0,
      company_carrier_id: 6691,
      packageWeight: 0,
      packageHeight: 0,
      packageWidth: 0,
      packageLength: 0,
      paymentTransactionNumber: "",
    });

    setItems([
      {
        ...initialItem,
        custom_fields: [],
      },
    ]);

    setCustomer({
      gst_number: "",
      billing: {
        name: "",
        addressLine1: "",
        addressLine2: "",
        postalCode: "",
        city: "",
        state: "",
        country: "India",
        contact: "",
        email: "",
      },
      shipping: {
        name: "",
        addressLine1: "",
        addressLine2: "",
        postalCode: "",
        city: "",
        state: "",
        country: "India",
        contact: "",
        email: "",
        latitude: "",
        longitude: "",
      },
    });

    setMessage("");
    setError("");
  };

  // -----------------------------
  // Submit
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        ...form,

        marketplaceId: Number(form.marketplaceId),
        shippingCost: Number(form.shippingCost),
        discount: Number(form.discount),
        walletDiscount: Number(form.walletDiscount),
        promoCodeDiscount: Number(form.promoCodeDiscount),
        prepaidDiscount: Number(form.prepaidDiscount),
        paymentMode: Number(form.paymentMode),
        shippingMethod: Number(form.shippingMethod),
        is_market_shipped: Number(form.is_market_shipped),
        company_carrier_id: Number(form.company_carrier_id),
        packageWeight: Number(form.packageWeight),
        packageHeight: Number(form.packageHeight),
        packageWidth: Number(form.packageWidth),
        packageLength: Number(form.packageLength),

        paymentTransactionNumber:
          form.paymentTransactionNumber === ""
            ? ""
            : Number(form.paymentTransactionNumber),

        items: items.map((item) => {
          const cleanItem = {
            OrderItemId: item.OrderItemId,
            productName: item.productName,
            Quantity: Number(item.Quantity),
            Price: Number(item.Price),
            itemDiscount: Number(item.itemDiscount),
          };

          // Send only the product identifier that was supplied.
          if (item.Sku.trim()) {
            cleanItem.Sku = item.Sku.trim();
          } else if (item.ean.trim()) {
            cleanItem.ean = item.ean.trim();
          } else if (item.AccountingSku.trim()) {
            cleanItem.AccountingSku = item.AccountingSku.trim();
          }

          if (item.custom_fields.length > 0) {
            cleanItem.custom_fields = item.custom_fields.map(
              (field) => ({
                id: Number(field.id),
                value: field.value,
              })
            );
          }

          return cleanItem;
        }),

        customer: [
          {
            gst_number: customer.gst_number,

            billing: {
              ...customer.billing,
            },

            shipping: {
              ...customer.shipping,
            },
          },
        ],
      };

      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token");

      const response = await fetch(
        `${SERVER_URL}/api/easy-ecom/orders/retail`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to create retail order."
        );
      }

      setMessage("Retail order created successfully.");

      console.log("EasyEcom Retail Order Response:", data);
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Unable to create retail order."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "30px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>EasyEcom Retail Order (B2C)</h2>

      {message && (
        <div
          style={{
            padding: "12px",
            marginBottom: "15px",
            background: "#e8f5e9",
            color: "#2e7d32",
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "12px",
            marginBottom: "15px",
            background: "#ffebee",
            color: "#c62828",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* =========================================
            ORDER INFORMATION
        ========================================= */}
        <section>
          <h3>Order Information</h3>

          <div style={gridStyle}>
            <Input
              label="Order Number"
              name="orderNumber"
              value={form.orderNumber}
              onChange={handleOrderChange}
              required
            />

            <Input
              label="Marketplace ID"
              name="marketplaceId"
              type="number"
              value={form.marketplaceId}
              onChange={handleOrderChange}
            />

            <Input
              label="Order Date"
              name="orderDate"
              type="datetime-local"
              value={form.orderDate}
              onChange={handleOrderChange}
              required
            />

            <Input
              label="Expected Delivery Date"
              name="expDeliveryDate"
              type="datetime-local"
              value={form.expDeliveryDate}
              onChange={handleOrderChange}
            />
          </div>

          <div style={gridStyle}>
            <Input
              label="Remarks 1"
              name="remarks1"
              value={form.remarks1}
              onChange={handleOrderChange}
            />

            <Input
              label="Remarks 2"
              name="remarks2"
              value={form.remarks2}
              onChange={handleOrderChange}
            />

            <Input
              label="Shipping Cost"
              name="shippingCost"
              type="number"
              value={form.shippingCost}
              onChange={handleOrderChange}
            />

            <Input
              label="Discount"
              name="discount"
              type="number"
              value={form.discount}
              onChange={handleOrderChange}
            />

            <Input
              label="Wallet Discount"
              name="walletDiscount"
              type="number"
              value={form.walletDiscount}
              onChange={handleOrderChange}
            />

            <Input
              label="Promo Code Discount"
              name="promoCodeDiscount"
              type="number"
              value={form.promoCodeDiscount}
              onChange={handleOrderChange}
            />

            <Input
              label="Prepaid Discount"
              name="prepaidDiscount"
              type="number"
              value={form.prepaidDiscount}
              onChange={handleOrderChange}
            />

            <Input
              label="Payment Mode"
              name="paymentMode"
              type="number"
              value={form.paymentMode}
              onChange={handleOrderChange}
            />

            <Input
              label="Payment Gateway"
              name="paymentGateway"
              value={form.paymentGateway}
              onChange={handleOrderChange}
            />

            <Input
              label="Shipping Method"
              name="shippingMethod"
              type="number"
              value={form.shippingMethod}
              onChange={handleOrderChange}
            />

            <Input
              label="Company Carrier ID"
              name="company_carrier_id"
              type="number"
              value={form.company_carrier_id}
              onChange={handleOrderChange}
            />

            <Input
              label="Payment Transaction Number"
              name="paymentTransactionNumber"
              type="number"
              value={form.paymentTransactionNumber}
              onChange={handleOrderChange}
            />
          </div>
        </section>

        <hr />

        {/* =========================================
            PACKAGE
        ========================================= */}
        <section>
          <h3>Package Details</h3>

          <div style={gridStyle}>
            <Input
              label="Weight"
              name="packageWeight"
              type="number"
              value={form.packageWeight}
              onChange={handleOrderChange}
            />

            <Input
              label="Height"
              name="packageHeight"
              type="number"
              value={form.packageHeight}
              onChange={handleOrderChange}
            />

            <Input
              label="Width"
              name="packageWidth"
              type="number"
              value={form.packageWidth}
              onChange={handleOrderChange}
            />

            <Input
              label="Length"
              name="packageLength"
              type="number"
              value={form.packageLength}
              onChange={handleOrderChange}
            />

            <Input
              label="Is Market Shipped"
              name="is_market_shipped"
              type="number"
              value={form.is_market_shipped}
              onChange={handleOrderChange}
            />
          </div>
        </section>

        <hr />

        {/* =========================================
            ITEMS
        ========================================= */}
        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3>Order Items</h3>

            <button
              type="button"
              onClick={addItem}
              style={buttonStyle}
            >
              + Add Item
            </button>
          </div>

          {items.map((item, itemIndex) => (
            <div
              key={itemIndex}
              style={cardStyle}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <h4>Item {itemIndex + 1}</h4>

                <button
                  type="button"
                  onClick={() => removeItem(itemIndex)}
                  disabled={items.length === 1}
                  style={deleteButtonStyle}
                >
                  Remove
                </button>
              </div>

              <div style={gridStyle}>
                <Input
                  label="Order Item ID"
                  value={item.OrderItemId}
                  onChange={(e) =>
                    handleItemChange(
                      itemIndex,
                      "OrderItemId",
                      e.target.value
                    )
                  }
                  required
                />

                <Input
                  label="SKU"
                  value={item.Sku}
                  onChange={(e) =>
                    handleItemChange(
                      itemIndex,
                      "Sku",
                      e.target.value
                    )
                  }
                />

                <Input
                  label="EAN"
                  value={item.ean}
                  onChange={(e) =>
                    handleItemChange(
                      itemIndex,
                      "ean",
                      e.target.value
                    )
                  }
                />

                <Input
                  label="Accounting SKU"
                  value={item.AccountingSku}
                  onChange={(e) =>
                    handleItemChange(
                      itemIndex,
                      "AccountingSku",
                      e.target.value
                    )
                  }
                />

                <Input
                  label="Product Name"
                  value={item.productName}
                  onChange={(e) =>
                    handleItemChange(
                      itemIndex,
                      "productName",
                      e.target.value
                    )
                  }
                  required
                />

                <Input
                  label="Quantity"
                  type="number"
                  value={item.Quantity}
                  onChange={(e) =>
                    handleItemChange(
                      itemIndex,
                      "Quantity",
                      e.target.value
                    )
                  }
                  required
                />

                <Input
                  label="Price"
                  type="number"
                  step="0.01"
                  value={item.Price}
                  onChange={(e) =>
                    handleItemChange(
                      itemIndex,
                      "Price",
                      e.target.value
                    )
                  }
                  required
                />

                <Input
                  label="Item Discount"
                  type="number"
                  step="0.01"
                  value={item.itemDiscount}
                  onChange={(e) =>
                    handleItemChange(
                      itemIndex,
                      "itemDiscount",
                      e.target.value
                    )
                  }
                />
              </div>

              <div style={{ marginTop: "15px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <strong>Custom Fields</strong>

                  <button
                    type="button"
                    onClick={() =>
                      addCustomField(itemIndex)
                    }
                  >
                    + Add Custom Field
                  </button>
                </div>

                {item.custom_fields.map(
                  (field, fieldIndex) => (
                    <div
                      key={fieldIndex}
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "10px",
                      }}
                    >
                      <Input
                        label="ID"
                        type="number"
                        value={field.id}
                        onChange={(e) =>
                          handleCustomFieldChange(
                            itemIndex,
                            fieldIndex,
                            "id",
                            e.target.value
                          )
                        }
                      />

                      <Input
                        label="Value"
                        value={field.value}
                        onChange={(e) =>
                          handleCustomFieldChange(
                            itemIndex,
                            fieldIndex,
                            "value",
                            e.target.value
                          )
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeCustomField(
                            itemIndex,
                            fieldIndex
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </section>

        <hr />

        {/* =========================================
            CUSTOMER
        ========================================= */}
        <section>
          <h3>Customer</h3>

          <Input
            label="GST Number"
            value={customer.gst_number}
            onChange={(e) =>
              handleGstChange(e.target.value)
            }
          />

          <h4>Billing Address</h4>

          <div style={gridStyle}>
            {Object.entries(customer.billing).map(
              ([field, value]) => (
                <Input
                  key={field}
                  label={formatLabel(field)}
                  value={value}
                  onChange={(e) =>
                    handleCustomerChange(
                      "billing",
                      field,
                      e.target.value
                    )
                  }
                />
              )
            )}
          </div>

          <h4>Shipping Address</h4>

          <div style={gridStyle}>
            {Object.entries(customer.shipping).map(
              ([field, value]) => (
                <Input
                  key={field}
                  label={formatLabel(field)}
                  value={value}
                  onChange={(e) =>
                    handleCustomerChange(
                      "shipping",
                      field,
                      e.target.value
                    )
                  }
                />
              )
            )}
          </div>
        </section>

        <hr />

        {/* =========================================
            ACTIONS
        ========================================= */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <button
            type="submit"
            disabled={loading}
            style={submitButtonStyle}
          >
            {loading
              ? "Creating..."
              : "Create Retail Order"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            disabled={loading}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

// =============================================
// Reusable Input
// =============================================
function Input({
  label,
  ...props
}) {
  return (
    <div style={{ width: "100%" }}>
      <label
        style={{
          display: "block",
          marginBottom: "5px",
          fontWeight: "600",
        }}
      >
        {label}
      </label>

      <input
        {...props}
        style={{
          width: "100%",
          padding: "9px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function formatLabel(value) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

// =============================================
// Styles
// =============================================
const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "15px",
  marginBottom: "20px",
};

const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: "6px",
  padding: "20px",
  marginBottom: "20px",
};

const buttonStyle = {
  padding: "8px 15px",
  cursor: "pointer",
};

const deleteButtonStyle = {
  padding: "6px 12px",
  cursor: "pointer",
};

const submitButtonStyle = {
  padding: "10px 20px",
  cursor: "pointer",
  fontWeight: "bold",
};

export default RetailOrder;

