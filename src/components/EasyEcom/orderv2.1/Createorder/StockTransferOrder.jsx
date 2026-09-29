import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const emptyItem = {
  OrderItemId: "",
  Sku: "",
  ean: "",
  AccountingSku: "",
  productName: "",
  Quantity: 1,
  Price: 0,
  itemDiscount: 0,
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
  latitude: "",
  longitude: "",
};

function StockTransferOrder() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    orderType: "stocktransferorder",
    orderNumber: "",
    orderDate: "",
    expDeliveryDate: "",
    remarks1: "",
    remarks2: "",
    shippingCost: 20,
    discount: 20,
    walletDiscount: 5,
    promoCodeDiscount: 5,
    prepaidDiscount: 5,
    paymentMode: 5,
    paymentGateway: "PayU",
    shippingMethod: 1,
    packageWeight: 100,
    packageHeight: 10,
    packageWidth: 10,
    packageLength: 10,
    paymentTransactionNumber: "",
  });

  const [items, setItems] = useState([
    { ...emptyItem },
  ]);

  const [customer, setCustomer] = useState({
    customerId: 97815,
    billing: { ...emptyAddress },
    shipping: { ...emptyAddress },
  });

  // ============================================================
  // ORDER
  // ============================================================

  const handleOrderChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
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
      orderType: "stocktransferorder",
      orderNumber: "",
      orderDate: "",
      expDeliveryDate: "",
      remarks1: "",
      remarks2: "",
      shippingCost: 20,
      discount: 20,
      walletDiscount: 5,
      promoCodeDiscount: 5,
      prepaidDiscount: 5,
      paymentMode: 5,
      paymentGateway: "PayU",
      shippingMethod: 1,
      packageWeight: 100,
      packageHeight: 10,
      packageWidth: 10,
      packageLength: 10,
      paymentTransactionNumber: "",
    });

    setItems([
      { ...emptyItem },
    ]);

    setCustomer({
      customerId: 97815,
      billing: { ...emptyAddress },
      shipping: { ...emptyAddress },
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

      // --------------------------------------------------------
      // Build EasyEcom STN payload
      // --------------------------------------------------------

      const payload = {
        orderType: "stocktransferorder",

        orderNumber:
          form.orderNumber,

        orderDate:
          convertDateTime(
            form.orderDate
          ),

        expDeliveryDate:
          form.expDeliveryDate
            ? convertDateTime(
                form.expDeliveryDate
              )
            : undefined,

        remarks1:
          form.remarks1,

        remarks2:
          form.remarks2,

        shippingCost:
          Number(
            form.shippingCost
          ),

        discount:
          Number(
            form.discount
          ),

        walletDiscount:
          Number(
            form.walletDiscount
          ),

        promoCodeDiscount:
          Number(
            form.promoCodeDiscount
          ),

        prepaidDiscount:
          Number(
            form.prepaidDiscount
          ),

        paymentMode:
          Number(
            form.paymentMode
          ),

        paymentGateway:
          form.paymentGateway,

        shippingMethod:
          Number(
            form.shippingMethod
          ),

        packageWeight:
          Number(
            form.packageWeight
          ),

        packageHeight:
          Number(
            form.packageHeight
          ),

        packageWidth:
          Number(
            form.packageWidth
          ),

        packageLength:
          Number(
            form.packageLength
          ),

        paymentTransactionNumber:
          form.paymentTransactionNumber
            ? Number(
                form.paymentTransactionNumber
              )
            : "",

        items: items.map(
          (item) => {
            const result = {
              OrderItemId:
                item.OrderItemId,

              productName:
                item.productName,

              Quantity:
                Number(
                  item.Quantity
                ),

              Price:
                Number(
                  item.Price
                ),

              itemDiscount:
                Number(
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
          }
        ),

        customer: [
          {
            customerId:
              Number(
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
      };

      // Remove undefined fields
      Object.keys(payload).forEach(
        (key) => {
          if (
            payload[key] ===
            undefined
          ) {
            delete payload[key];
          }
        }
      );

      console.log(
        "STN Payload:",
        payload
      );

      // --------------------------------------------------------
      // Send to Node
      // --------------------------------------------------------

      const token =
        localStorage.getItem(
          "accessToken"
        ) ||
        localStorage.getItem(
          "token"
        );

      const response =
        await fetch(
          `${SERVER_URL}/api/easy-ecom/orders/stock-transfer`,
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
            "Failed to create Stock Transfer Note."
        );
      }

      setMessage(
        "Stock Transfer Note created successfully."
      );

      console.log(
        "EasyEcom STN Response:",
        data
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to create Stock Transfer Note."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div style={pageStyle}>
      <h2>
        EasyEcom Stock Transfer Note (STN)
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

        {/* =====================================================
            ORDER INFORMATION
        ====================================================== */}

        <section>
          <h3>Order Information</h3>

          <div style={gridStyle}>

            <Input
              label="Order Number"
              name="orderNumber"
              value={
                form.orderNumber
              }
              onChange={
                handleOrderChange
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
                handleOrderChange
              }
              required
            />

            <Input
              label="Expected Delivery Date"
              name="expDeliveryDate"
              type="datetime-local"
              value={
                form.expDeliveryDate
              }
              onChange={
                handleOrderChange
              }
            />

            <Input
              label="Remarks 1"
              name="remarks1"
              value={
                form.remarks1
              }
              onChange={
                handleOrderChange
              }
            />

            <Input
              label="Remarks 2"
              name="remarks2"
              value={
                form.remarks2
              }
              onChange={
                handleOrderChange
              }
            />

          </div>
        </section>

        <hr />

        {/* =====================================================
            PAYMENT
        ====================================================== */}

        <section>
          <h3>
            Payment & Charges
          </h3>

          <div style={gridStyle}>

            <Input
              label="Shipping Cost"
              name="shippingCost"
              type="number"
              step="0.01"
              value={
                form.shippingCost
              }
              onChange={
                handleOrderChange
              }
            />

            <Input
              label="Discount"
              name="discount"
              type="number"
              step="0.01"
              value={
                form.discount
              }
              onChange={
                handleOrderChange
              }
            />

            <Input
              label="Wallet Discount"
              name="walletDiscount"
              type="number"
              step="0.01"
              value={
                form.walletDiscount
              }
              onChange={
                handleOrderChange
              }
            />

            <Input
              label="Promo Code Discount"
              name="promoCodeDiscount"
              type="number"
              step="0.01"
              value={
                form.promoCodeDiscount
              }
              onChange={
                handleOrderChange
              }
            />

            <Input
              label="Prepaid Discount"
              name="prepaidDiscount"
              type="number"
              step="0.01"
              value={
                form.prepaidDiscount
              }
              onChange={
                handleOrderChange
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
                handleOrderChange
              }
            />

            <Input
              label="Payment Gateway"
              name="paymentGateway"
              value={
                form.paymentGateway
              }
              onChange={
                handleOrderChange
              }
            />

            <Input
              label="Shipping Method"
              name="shippingMethod"
              type="number"
              value={
                form.shippingMethod
              }
              onChange={
                handleOrderChange
              }
            />

            <Input
              label="Payment Transaction Number"
              name="paymentTransactionNumber"
              type="number"
              value={
                form.paymentTransactionNumber
              }
              onChange={
                handleOrderChange
              }
            />

          </div>
        </section>

        <hr />

        {/* =====================================================
            PACKAGE
        ====================================================== */}

        <section>
          <h3>
            Package Details
          </h3>

          <div style={gridStyle}>

            <Input
              label="Package Weight"
              name="packageWeight"
              type="number"
              value={
                form.packageWeight
              }
              onChange={
                handleOrderChange
              }
            />

            <Input
              label="Package Height"
              name="packageHeight"
              type="number"
              value={
                form.packageHeight
              }
              onChange={
                handleOrderChange
              }
            />

            <Input
              label="Package Width"
              name="packageWidth"
              type="number"
              value={
                form.packageWidth
              }
              onChange={
                handleOrderChange
              }
            />

            <Input
              label="Package Length"
              name="packageLength"
              type="number"
              value={
                form.packageLength
              }
              onChange={
                handleOrderChange
              }
            />

          </div>
        </section>

        <hr />

        {/* =====================================================
            ITEMS
        ====================================================== */}

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
                    label="Order Item ID"
                    value={
                      item.OrderItemId
                    }
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "OrderItemId",
                        e.target.value
                      )
                    }
                    required
                  />

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
                    label="Product Name"
                    value={
                      item.productName
                    }
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "productName",
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

        {/* =====================================================
            CUSTOMER
        ====================================================== */}

        <section>

          <h3>Customer</h3>

          <Input
            label="EasyEcom Customer ID"
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
              : "Create Stock Transfer Note"}
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
// DATE
// ============================================================

function convertDateTime(value) {
  if (!value) return "";

  if (value.includes("T")) {
    return (
      value.replace("T", " ") +
      ":00"
    );
  }

  return value;
}

// ============================================================
// LABEL
// ============================================================

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

export default StockTransferOrder;

