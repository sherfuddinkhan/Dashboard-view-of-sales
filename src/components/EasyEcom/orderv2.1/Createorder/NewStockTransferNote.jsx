import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const emptyItem = {
  Sku: "",
  ean: "",
  AccountingSku: "",
  Quantity: 1,
  Price: 100,
  itemDiscount: 10,
};

const emptyAddress = {
  name: "",
  addressLine1: "",
  addressLine2: "",
  postalCode: "",
  city: "",
  state: "",
  country: "India",
  contact: "",
  email: "",
};

function NewStockTransferNote() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    orderNumber: "TEST_NEW_STN_PRICE_API_2",
    orderDate: "2024-09-12T10:00",
    remarks1: "changes",
    is_pricing_master: false,
    paymentMode: 1,
    shippingCost: 10,
    queue: 1,
  });

  const [items, setItems] = useState([
    {
      Sku: "SKU_WITH_EAN",
      ean: "",
      AccountingSku: "",
      Quantity: 1,
      Price: 100,
      itemDiscount: 10,
    },
    {
      Sku: "",
      ean: "9972291020",
      AccountingSku: "",
      Quantity: 1,
      Price: 100,
      itemDiscount: 10,
    },
    {
      Sku: "",
      ean: "",
      AccountingSku: "SKU_WITH_EAN1",
      Quantity: 1,
      Price: 100,
      itemDiscount: 10,
    },
  ]);

  const [customer, setCustomer] = useState({
    customerId: 189333,

    billing: {
      ...emptyAddress,
      name: "Test_Company1",
      addressLine1: "HSR",
      addressLine2: "H.NO",
      postalCode: "440022",
      city: "Bangalore",
      state: "Maharashtra",
      contact: "9611624902",
      email: "testcompany@gmail.com",
    },

    shipping: {
      ...emptyAddress,
      name: "Test_Company1",
      addressLine1: "HSR",
      addressLine2: "H.NO",
      postalCode: "590012",
      city: "Bangalore",
      state: "Gujarat",
      contact: "9611624902",
      email: "testcompany@gmail.com",
    },
  });

  // ============================================================
  // ORDER
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
    setCustomer((prev) => ({
      ...prev,
      customerId: e.target.value,
    }));
  };

  const handleAddressChange = (
    type,
    field,
    value
  ) => {
    setCustomer((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  // ============================================================
  // ITEMS
  // ============================================================

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { ...emptyItem },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;

    setItems((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

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

  // ============================================================
  // RESET
  // ============================================================

  const resetForm = () => {
    setForm({
      orderNumber: "",
      orderDate: "",
      remarks1: "",
      is_pricing_master: false,
      paymentMode: 1,
      shippingCost: 10,
      queue: 1,
    });

    setItems([
      { ...emptyItem },
    ]);

    setCustomer({
      customerId: "",
      billing: {
        ...emptyAddress,
      },
      shipping: {
        ...emptyAddress,
      },
    });

    setMessage("");
    setError("");
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

      if (!customer.customerId) {
        throw new Error(
          "Customer ID is required."
        );
      }

      if (items.length === 0) {
        throw new Error(
          "At least one item is required."
        );
      }

      const payload = {
        orderType:
          "stocktransferorder",

        orderNumber:
          form.orderNumber.trim(),

        orderDate:
          convertDateTime(
            form.orderDate
          ),

        remarks1:
          form.remarks1,

        is_pricing_master:
          Boolean(
            form.is_pricing_master
          ),

        items: items.map((item) => {
          const result = {
            Quantity: Number(
              item.Quantity
            ),

            Price: Number(
              item.Price
            ),

            itemDiscount: Number(
              item.itemDiscount
            ),
          };

          if (
            item.Sku.trim()
          ) {
            result.Sku =
              item.Sku.trim();
          }

          if (
            item.ean.trim()
          ) {
            result.ean =
              item.ean.trim();
          }

          if (
            item.AccountingSku.trim()
          ) {
            result.AccountingSku =
              item.AccountingSku.trim();
          }

          return result;
        }),

        paymentMode: Number(
          form.paymentMode
        ),

        shippingCost: Number(
          form.shippingCost
        ),

        customer: [
          {
            customerId: Number(
              customer.customerId
            ),

            billing: {
              ...customer.billing,
            },

            shipping: {
              ...customer.shipping,
            },
          },
        ],

        queue: Number(
          form.queue
        ),
      };

      console.log(
        "New STN Payload:",
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
          `${SERVER_URL}/api/easy-ecom/orders/stock-transfer-new`,
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
            "Failed to create New STN."
        );
      }

      setMessage(
        "New Stock Transfer Note created successfully."
      );

      console.log(
        "EasyEcom New STN Response:",
        data
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to create New STN."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <h2>
        EasyEcom Stock Transfer Note
        (New STN)
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

      <form onSubmit={handleSubmit}>

        {/* ORDER */}

        <section>
          <h3>
            STN Information
          </h3>

          <div style={gridStyle}>
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
              type="datetime-local"
              value={
                form.orderDate
              }
              onChange={
                handleFormChange
              }
              required
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

            <label
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: "8px",
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
          </div>
        </section>

        <hr />

        {/* ITEMS */}

        <section>
          <div
            style={
              sectionHeaderStyle
            }
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
                  style={
                    sectionHeaderStyle
                  }
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
                  />

                  <Input
                    label="EAN"
                    value={
                      item.ean
                    }
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "ean",
                        e.target.value
                      )
                    }
                  />

                  <Input
                    label="Accounting SKU"
                    value={
                      item.AccountingSku
                    }
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "AccountingSku",
                        e.target.value
                      )
                    }
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

        {/* CUSTOMER */}

        <section>
          <h3>Customer</h3>

          <Input
            label="Customer ID"
            type="number"
            value={
              customer.customerId
            }
            onChange={
              handleCustomerChange
            }
            required
          />

          <h4>
            Billing Address
          </h4>

          <div style={gridStyle}>
            {Object.entries(
              customer.billing
            ).map(
              ([field, value]) => (
                <Input
                  key={field}
                  label={formatLabel(
                    field
                  )}
                  value={value}
                  onChange={(e) =>
                    handleAddressChange(
                      "billing",
                      field,
                      e.target.value
                    )
                  }
                />
              )
            )}
          </div>

          <h4>
            Shipping Address
          </h4>

          <div style={gridStyle}>
            {Object.entries(
              customer.shipping
            ).map(
              ([field, value]) => (
                <Input
                  key={field}
                  label={formatLabel(
                    field
                  )}
                  value={value}
                  onChange={(e) =>
                    handleAddressChange(
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
              : "Create New STN"}
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

function convertDateTime(value) {
  if (!value) return "";

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
      /^./,
      (str) =>
        str.toUpperCase()
    );
}

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

const sectionHeaderStyle = {
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

export default NewStockTransferNote;





