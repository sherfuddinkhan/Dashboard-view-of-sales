import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const ListCarriers = () => {
  const [form, setForm] = useState({
    invoice_id: 125051953,
    order_id: 97256310,
    reference_code: "ccc-1",

    company_name: "EasyEcom Test Company",
    warehouse_id: 59032,

    pickup_address: "Pathardi phata",
    pickup_city: "Nashik",
    pickup_state: "Maharashtra",
    pickup_state_code: "27",
    pickup_pin_code: "422010",
    pickup_country: "India",

    invoice_currency_code: "INR",

    order_type: "B2C",
    order_type_key: "retailorder",

    marketplace: "Offline",
    marketplace_id: 10,

    order_date: "2023-01-12 05:30:00",

    courier: "SelfShip",
    carrier_id: 23,

    package_weight: 200,
    package_height: 3,
    package_length: 3,
    package_width: 3,

    payment_mode: "Online",

    customer_name: "sdfgh",
    shipping_name: "sdfgh",
    contact_num: "9876543210",

    address_line_1: "hssr layout",
    city: "bangalore",
    pin_code: "625017",
    state: "Tamil Nadu",
    state_code: "33",
    country: "India",

    email: "sdfgbh@gmail.com",

    billing_name: "sdfgh",
    billing_address_1: "hssr layout",
    billing_city: "bangalore",
    billing_state: "Karnataka",
    billing_state_code: "29",
    billing_pin_code: "625017",
    billing_country: "India",
    billing_mobile: "9876543210",

    quantity: 1,
    collectable_amount: 0,
    total_amount: 20,
    total_tax: 3.0508,

    sku: "CCSKU23",
    product_name: "CCount",
    selling_price: "20",
    tax_rate: 18,
  });

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    token: "",
    account_no: "",
    service_type: "",
    eeApiToken: "",
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCredentialChange = (e) => {
    const { name, value } = e.target;

    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/list-carriers`,
        {
          order_data: buildOrderData(),
          credentials,
        }
      );

      setResponse(result.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to list carriers"
      );
    } finally {
      setLoading(false);
    }
  };

  const buildOrderData = () => ({
    invoice_id: Number(form.invoice_id),
    order_id: Number(form.order_id),

    blockSplit: 0,
    reference_code: form.reference_code,

    company_name: form.company_name,
    warehouse_id: Number(form.warehouse_id),

    seller_gst: "",

    assigned_company_name: form.company_name,
    assigned_warehouse_id: Number(form.warehouse_id),
    assigned_company_gst: "",
    warehouse_contact: "",

    pickup_address: form.pickup_address,
    pickup_city: form.pickup_city,
    pickup_state: form.pickup_state,
    pickup_state_code: form.pickup_state_code,
    pickup_pin_code: form.pickup_pin_code,
    pickup_country: form.pickup_country,

    invoice_currency_code: form.invoice_currency_code,

    order_type: form.order_type,
    order_type_key: form.order_type_key,

    replacement_order: 0,

    marketplace: form.marketplace,
    MarketCId: 123,
    marketplace_id: Number(form.marketplace_id),

    market_shipped: 0,
    merchant_c_id: 123,

    qcPassed: 1,
    salesmanUserId: 0,

    order_date: form.order_date,

    tat: "2023-01-13 17:30:17",

    available_after: null,
    invoice_date: "",

    import_date: "2023-01-12 17:30:17",
    last_update_date: "2023-01-12 17:30:18",

    manifest_date: null,
    manifest_no: null,
    invoice_number: null,

    marketplace_invoice_num: form.reference_code,

    shipping_last_update_date: null,

    batch_id: 1022237,
    batch_created_at: "2023-01-12 17:27:45",

    message: null,

    courier_aggregator_name: null,
    courier: form.courier,
    carrier_id: Number(form.carrier_id),

    awb_number: null,

    // IMPORTANT:
    // EasyEcom expects these exact property names.
    "Package Weight": Number(form.package_weight),
    "Package Height": Number(form.package_height),
    "Package Length": Number(form.package_length),
    "Package Width": Number(form.package_width),

    order_status: "Open",
    order_status_id: 2,

    easyecom_order_history: null,

    shipping_status: null,
    shipping_status_id: null,

    tracking_url: null,
    shipping_history: null,

    payment_mode: form.payment_mode,
    payment_mode_id: 1,

    payment_gateway_transaction_number: null,

    buyer_gst: "NA",

    customer_name: form.customer_name,
    shipping_name: form.shipping_name,

    contact_num: form.contact_num,

    address_line_1: form.address_line_1,
    address_line_2: null,

    city: form.city,
    pin_code: form.pin_code,

    state: form.state,
    state_code: form.state_code,

    country: form.country,
    country_code: 0,

    email: form.email,

    latitude: null,
    longitude: null,

    billing_name: form.billing_name,
    billing_address_1: form.billing_address_1,
    billing_address_2: null,

    billing_city: form.billing_city,
    billing_state: form.billing_state,
    billing_state_code: form.billing_state_code,

    billing_pin_code: form.billing_pin_code,
    billing_country: form.billing_country,
    billing_mobile: form.billing_mobile,

    order_quantity: Number(form.quantity),

    documents: null,
    invoice_documents: null,

    collectable_amount: Number(form.collectable_amount),
    total_amount: Number(form.total_amount),
    total_tax: Number(form.total_tax),

    breakup_types: {
      "Item Amount Excluding Tax": 16.9492,
      "Item Amount IGST": 3.0508,
    },

    tcs_rate: 0,
    tcs_amount: 0,

    customer_code: "NA",

    order_items: [
      {
        suborder_id: 146601869,
        suborder_num: "59032167352481783352367",

        invoicecode: null,

        item_collectable_amount: 0,

        shipment_type: "SelfShip",

        suborder_quantity: Number(form.quantity),
        item_quantity: Number(form.quantity),

        returned_quantity: 0,
        cancelled_quantity: 0,
        shipped_quantity: Number(form.quantity),

        tax_type: "GST",

        product_id: 19452180,
        company_product_id: 76120647,

        sku: form.sku,

        expiry_type: 0,
        sku_type: "Normal",

        sub_product_count: 1,

        marketplace_sku: form.sku,

        listing_ref_number: "-",
        listing_id: "-",

        productName: form.product_name,

        description: null,

        category: "CC5",
        brand: "CCC",
        brand_id: 7147017,

        model_no: "6513",

        product_tax_code: null,

        ean: "5",
        size: "NA",

        cost: 150,
        mrp: 200,

        weight: Number(form.package_weight),
        length: Number(form.package_length),
        width: Number(form.package_width),
        height: Number(form.package_height),

        scheme_applied: 0,

        custom_fields: [],

        serials: [null],

        tax_rate: Number(form.tax_rate),

        selling_price: form.selling_price,

        breakup_types: {
          "Item Amount Excluding Tax": 16.9492,
          "Item Amount IGST": 3.0508,
        },

        station_scanned_quantity: 0,
        batch_scanned_quantity: 0,

        assigned_quantity: Number(form.quantity),
      },
    ],
  });

  return (
    <div style={containerStyle}>
      <h2>EasyEcom List Carriers</h2>

      <form onSubmit={handleSubmit}>
        <h3>Order</h3>

        <Field
          label="Invoice ID"
          name="invoice_id"
          value={form.invoice_id}
          onChange={handleChange}
        />

        <Field
          label="Order ID"
          name="order_id"
          value={form.order_id}
          onChange={handleChange}
        />

        <Field
          label="Reference Code"
          name="reference_code"
          value={form.reference_code}
          onChange={handleChange}
        />

        <Field
          label="Warehouse ID"
          name="warehouse_id"
          value={form.warehouse_id}
          onChange={handleChange}
        />

        <h3>Pickup</h3>

        <Field
          label="Pickup Address"
          name="pickup_address"
          value={form.pickup_address}
          onChange={handleChange}
        />

        <Field
          label="Pickup City"
          name="pickup_city"
          value={form.pickup_city}
          onChange={handleChange}
        />

        <Field
          label="Pickup State"
          name="pickup_state"
          value={form.pickup_state}
          onChange={handleChange}
        />

        <Field
          label="Pickup PIN"
          name="pickup_pin_code"
          value={form.pickup_pin_code}
          onChange={handleChange}
        />

        <h3>Customer</h3>

        <Field
          label="Customer Name"
          name="customer_name"
          value={form.customer_name}
          onChange={handleChange}
        />

        <Field
          label="Contact"
          name="contact_num"
          value={form.contact_num}
          onChange={handleChange}
        />

        <Field
          label="Address"
          name="address_line_1"
          value={form.address_line_1}
          onChange={handleChange}
        />

        <Field
          label="City"
          name="city"
          value={form.city}
          onChange={handleChange}
        />

        <Field
          label="State"
          name="state"
          value={form.state}
          onChange={handleChange}
        />

        <Field
          label="PIN"
          name="pin_code"
          value={form.pin_code}
          onChange={handleChange}
        />

        <h3>Package</h3>

        <Field
          label="Weight"
          name="package_weight"
          value={form.package_weight}
          onChange={handleChange}
        />

        <Field
          label="Height"
          name="package_height"
          value={form.package_height}
          onChange={handleChange}
        />

        <Field
          label="Length"
          name="package_length"
          value={form.package_length}
          onChange={handleChange}
        />

        <Field
          label="Width"
          name="package_width"
          value={form.package_width}
          onChange={handleChange}
        />

        <h3>Carrier Credentials</h3>

        <Field
          label="Username"
          name="username"
          value={credentials.username}
          onChange={handleCredentialChange}
        />

        <Field
          label="Password"
          name="password"
          type="password"
          value={credentials.password}
          onChange={handleCredentialChange}
        />

        <Field
          label="Token"
          name="token"
          type="password"
          value={credentials.token}
          onChange={handleCredentialChange}
        />

        <Field
          label="Account No"
          name="account_no"
          value={credentials.account_no}
          onChange={handleCredentialChange}
        />

        <Field
          label="Service Type"
          name="service_type"
          value={credentials.service_type}
          onChange={handleCredentialChange}
        />

        <Field
          label="EasyEcom API Token"
          name="eeApiToken"
          type="password"
          value={credentials.eeApiToken}
          onChange={handleCredentialChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "List Carriers"}
        </button>
      </form>

      {error && (
        <div style={errorStyle}>
          <strong>Error:</strong>
          <pre>{error}</pre>
        </div>
      )}

      {response && (
        <div style={successStyle}>
          <h3>Carrier Response</h3>

          <pre>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

const Field = ({
  label,
  name,
  value,
  onChange,
  type = "text",
}) => (
  <div style={{ marginBottom: "15px" }}>
    <label>{label}</label>

    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      style={{
        display: "block",
        width: "100%",
        padding: "10px",
        marginTop: "5px",
        boxSizing: "border-box",
      }}
    />
  </div>
);

const containerStyle = {
  maxWidth: "800px",
  margin: "30px auto",
  padding: "25px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  background: "#fff",
};

const errorStyle = {
  marginTop: "20px",
  padding: "15px",
  background: "#ffe5e5",
};

const successStyle = {
  marginTop: "20px",
  padding: "15px",
  background: "#e8f5e9",
};

export default ListCarriers;