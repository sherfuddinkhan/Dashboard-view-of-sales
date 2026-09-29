import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const initialForm = {
  marketplaceId: 64,
  orderNumber: "NEWB2B_Order01",
  orderDate: "2024-12-02",
  remarks1: "changes",
  is_pricing_master: false,
  availableDate: "2024-12-03T18:20",
  paymentMode: 1,
  shippingCost: 10,
  queue: 1,
};

const initialItem = {
  Sku: "TESTSKU1",
  Quantity: 1,
  Price: 100,
  itemDiscount: 10,
};

const initialCustomer = {
  external_customer_code: "MODI001",
  companyName: "MODIWAY",
  email: "Modi@mody.com",
  password: "te1ts@1234",
  taxIdentificationNumber: "NA",
  contactNumber: "8574585696",
  country: "India",
  billingStateId: 12,
  billingStreet: "kaikondrahalli,sarjapur road",
  billingCity: "bangalore",
  billingPostalCode: "590010",
  currency: "INR",
  description: "",
  dispatchStateId: 12,
  dispatchStreet: "kaikondrahalli,sarjapur road",
  dispatchCity: "bangalore",
  dispatchPostalCode: "590010",
  dispatch_name: "Dispatch-API_CUSTOMER_200",
  billing_name: "Billing-API_CUSTOMER_200",
};

function NewB2BWithoutCustomer() {
  const [form, setForm] = useState(initialForm);
  const [items, setItems] = useState([
    { ...initialItem },
  ]);
  const [customer, setCustomer] = useState({
    ...initialCustomer,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ============================================================
  // FORM
  // ============================================================

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ============================================================
  // CUSTOMER
  // ============================================================

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;

    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // ITEMS
  // ============================================================

  const handleItemChange = (
    index,
    field,
    value
  ) => {
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

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        Sku: "",
        Quantity: 1,
        Price: 0,
        itemDiscount: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      return;
    }

    setItems((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (!form.orderNumber.trim()) {
        throw new Error(
          "Order Number is required."
        );
      }

      if (!form.orderDate) {
        throw new Error(
          "Order Date is required."
        );
      }

      if (!customer.companyName.trim()) {
        throw new Error(
          "Company Name is required."
        );
      }

      if (items.length === 0) {
        throw new Error(
          "At least one item is required."
        );
      }

      const payload = {
        orderType: "businessorder",

        marketplaceId: Number(
          form.marketplaceId
        ),

        orderNumber:
          form.orderNumber.trim(),

        orderDate:
          form.orderDate,

        remarks1:
          form.remarks1,

        is_pricing_master:
          Boolean(
            form.is_pricing_master
          ),

        availableDate:
          convertDateTime(
            form.availableDate
          ),

        items: items.map(
          (item) => ({
            Sku:
              item.Sku.trim(),

            Quantity: Number(
              item.Quantity
            ),

            Price: Number(
              item.Price
            ),

            itemDiscount: Number(
              item.itemDiscount
            ),
          })
        ),

        paymentMode: Number(
          form.paymentMode
        ),

        shippingCost: Number(
          form.shippingCost
        ),

        customer: {
          ...customer,

          billingStateId:
            Number(
              customer.billingStateId
            ),

          dispatchStateId:
            Number(
              customer.dispatchStateId
            ),
        },

        queue: Number(
          form.queue
        ),
      };

      console.log(
        "New B2B Without Customer Master Payload:",
        payload
      );

      const token =
        localStorage.getItem(
          "accessToken"
        ) ||
        localStorage.getItem(
          "token"
        );

      const response =
        await fetch(
          `${SERVER_URL}/api/easy-ecom/orders/business-without-customer`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {}),
            },

            body: JSON.stringify(
              payload
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to create New B2B order."
        );
      }

      setMessage(
        "New B2B order created successfully."
      );

      console.log(
        "EasyEcom Response:",
        data
      );
    } catch (err) {
      console.error(
        "New B2B Error:",
        err
      );

      setError(
        err.message ||
          "Failed to create New B2B order."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RESET
  // ============================================================

  const handleReset = () => {
    setForm({
      ...initialForm,
    });

    setItems([
      {
        ...initialItem,
      },
    ]);

    setCustomer({
      ...initialCustomer,
    });

    setMessage("");
    setError("");
  };

  return (
    <div style={pageStyle}>
      <h2>
        EasyEcom New B2B Order
        <br />
        Without Customer Master
      </h2>

      {message && (
        <div style={successStyle}>
          {message}
        </div>
      )}

      {error && (
        <div style={errorStyle}>
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
      >
        {/* ================================================== */}
        {/* ORDER INFORMATION */}
        {/* ================================================== */}

        <section>
          <h3>
            Order Information
          </h3>

          <div style={gridStyle}>
            <Input
              label="Marketplace ID"
              name="marketplaceId"
              type="number"
              value={
                form.marketplaceId
              }
              onChange={
                handleFormChange
              }
              required
            />

            <Input
              label="Order Number"
              name="orderNumber"
              value={
                form.orderNumber
              }
              onChange={
                handleFormChange
              }
              required
            />

            <Input
              label="Order Date"
              name="orderDate"
              type="date"
              value={
                form.orderDate
              }
              onChange={
                handleFormChange
              }
              required
            />

            <Input
              label="Available Date"
              name="availableDate"
              type="datetime-local"
              value={
                form.availableDate
              }
              onChange={
                handleFormChange
              }
            />

            <Input
              label="Remarks 1"
              name="remarks1"
              value={
                form.remarks1
              }
              onChange={
                handleFormChange
              }
            />

            <Input
              label="Payment Mode"
              name="paymentMode"
              type="number"
              value={
                form.paymentMode
              }
              onChange={
                handleFormChange
              }
            />

            <Input
              label="Shipping Cost"
              name="shippingCost"
              type="number"
              step="0.01"
              value={
                form.shippingCost
              }
              onChange={
                handleFormChange
              }
            />

            <Input
              label="Queue"
              name="queue"
              type="number"
              value={
                form.queue
              }
              onChange={
                handleFormChange
              }
            />
          </div>

          <label
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <input
              type="checkbox"
              name="is_pricing_master"
              checked={
                form.is_pricing_master
              }
              onChange={
                handleFormChange
              }
            />

            Is Pricing Master
          </label>
        </section>

        <hr />

        {/* ================================================== */}
        {/* ITEMS */}
        {/* ================================================== */}

        <section>
          <div
            style={headerStyle}
          >
            <h3>Items</h3>

            <button
              type="button"
              onClick={addItem}
            >
              + Add Item
            </button>
          </div>

          {items.map(
            (item, index) => (
              <div
                key={index}
                style={cardStyle}
              >
                <div
                  style={headerStyle}
                >
                  <h4>
                    Item {index + 1}
                  </h4>

                  <button
                    type="button"
                    onClick={() =>
                      removeItem(
                        index
                      )
                    }
                    disabled={
                      items.length ===
                      1
                    }
                  >
                    Remove
                  </button>
                </div>

                <div style={gridStyle}>
                  <Input
                    label="SKU"
                    value={
                      item.Sku
                    }
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "Sku",
                        e.target.value
                      )
                    }
                    required
                  />

                  <Input
                    label="Quantity"
                    type="number"
                    min="1"
                    value={
                      item.Quantity
                    }
                    onChange={(e) =>
                      handleItemChange(
                        index,
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
                    value={
                      item.Price
                    }
                    onChange={(e) =>
                      handleItemChange(
                        index,
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
                    value={
                      item.itemDiscount
                    }
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "itemDiscount",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            )
          )}
        </section>

        <hr />

        {/* ================================================== */}
        {/* CUSTOMER WITHOUT CUSTOMER MASTER */}
        {/* ================================================== */}

        <section>
          <h3>
            Customer
            <small
              style={{
                marginLeft: "10px",
                fontWeight: "normal",
              }}
            >
              (Created without Customer Master)
            </small>
          </h3>

          <div style={gridStyle}>
            {Object.entries(
              customer
            ).map(
              ([field, value]) => (
                <Input
                  key={field}
                  label={formatLabel(
                    field
                  )}
                  type={
                    field ===
                    "password"
                      ? "password"
                      : field.includes(
                          "StateId"
                        )
                      ? "number"
                      : "text"
                  }
                  value={
                    value ?? ""
                  }
                  onChange={
                    handleCustomerChange
                  }
                  name={field}
                />
              )
            )}
          </div>
        </section>

        <hr />

        {/* ================================================== */}
        {/* ACTIONS */}
        {/* ================================================== */}

        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <button
            type="submit"
            disabled={loading}
            style={
              submitButtonStyle
            }
          >
            {loading
              ? "Creating..."
              : "Create New B2B"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================================
// INPUT
// ============================================================

function Input({
  label,
  ...props
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
      </label>

      <input
        {...props}
        style={inputStyle}
      />
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================

function convertDateTime(value) {
  if (!value) {
    return "";
  }

  return value.includes("T")
    ? value.replace("T", " ") +
        ":00"
    : value;
}

function formatLabel(value) {
  return value
    .replace(
      /([A-Z])/g,
      " $1"
    )
    .replace(
      /_/g,
      " "
    )
    .replace(
      /^./,
      (str) =>
        str.toUpperCase()
    );
}

// ============================================================
// STYLES
// ============================================================

const pageStyle = {
  maxWidth: "1200px",
  margin: "30px auto",
  padding: "20px",
  fontFamily:
    "Arial, sans-serif",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "15px",
  marginBottom: "20px",
};

const cardStyle = {
  border:
    "1px solid #ddd",
  borderRadius: "6px",
  padding: "20px",
  marginBottom: "20px",
};

const headerStyle = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  marginBottom: "15px",
};

const labelStyle = {
  display: "block",
  fontWeight: "600",
  marginBottom: "5px",
};

const inputStyle = {
  width: "100%",
  padding: "9px",
  boxSizing:
    "border-box",
  border:
    "1px solid #ccc",
  borderRadius: "4px",
};

const submitButtonStyle = {
  padding: "10px 20px",
  cursor: "pointer",
  fontWeight: "bold",
};

const successStyle = {
  padding: "12px",
  marginBottom: "15px",
  background:
    "#e8f5e9",
  color: "#2e7d32",
};

const errorStyle = {
  padding: "12px",
  marginBottom: "15px",
  background:
    "#ffebee",
  color: "#c62828",
};

export default NewB2BWithoutCustomer;



