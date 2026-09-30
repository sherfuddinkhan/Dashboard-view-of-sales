import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const ConfirmOrderV2 = () => {
  const [form, setForm] = useState({
    invoice_id: "184068170",
    order_id: "150679024",
    reference_code: "Test345",
    location_key: "wo3484777024",
    warehouse_id: "59032",

    invoice_number: "CKA1-2324-39",

    customer_name: "Test",
    shipping_name: "Test",
    contact_num: "8899776654",

    sku: "Dip1011",
    quantity: "1",

    carrier_id: "28865",
    awb_number: "1840681708951088",
  });

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const payload = {
        invoice_id: Number(form.invoice_id),
        order_id: Number(form.order_id),

        reference_code: form.reference_code,

        location_key: form.location_key,

        warehouse_id: Number(form.warehouse_id),

        invoice_number: form.invoice_number,

        customer_name: form.customer_name,
        shipping_name: form.shipping_name,

        contact_num: form.contact_num,

        sku: form.sku,

        quantity: Number(form.quantity),

        carrier_id: Number(form.carrier_id),

        awb_number: form.awb_number,
      };

      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/confirm-order-v2`,
        payload
      );

      setResponse(result.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          JSON.stringify(err.response?.data) ||
          err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "30px auto" }}>
      <h2>EasyEcom Confirm Order V2</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="invoice_id"
          value={form.invoice_id}
          onChange={handleChange}
          placeholder="Invoice ID"
        />

        <input
          name="order_id"
          value={form.order_id}
          onChange={handleChange}
          placeholder="Order ID"
        />

        <input
          name="reference_code"
          value={form.reference_code}
          onChange={handleChange}
          placeholder="Reference Code"
        />

        <input
          name="location_key"
          value={form.location_key}
          onChange={handleChange}
          placeholder="Location Key"
        />

        <input
          name="warehouse_id"
          value={form.warehouse_id}
          onChange={handleChange}
          placeholder="Warehouse ID"
        />

        <input
          name="invoice_number"
          value={form.invoice_number}
          onChange={handleChange}
          placeholder="Invoice Number"
        />

        <input
          name="customer_name"
          value={form.customer_name}
          onChange={handleChange}
          placeholder="Customer Name"
        />

        <input
          name="shipping_name"
          value={form.shipping_name}
          onChange={handleChange}
          placeholder="Shipping Name"
        />

        <input
          name="contact_num"
          value={form.contact_num}
          onChange={handleChange}
          placeholder="Contact Number"
        />

        <input
          name="sku"
          value={form.sku}
          onChange={handleChange}
          placeholder="SKU"
        />

        <input
          name="quantity"
          value={form.quantity}
          onChange={handleChange}
          placeholder="Quantity"
        />

        <input
          name="carrier_id"
          value={form.carrier_id}
          onChange={handleChange}
          placeholder="Carrier ID"
        />

        <input
          name="awb_number"
          value={form.awb_number}
          onChange={handleChange}
          placeholder="AWB Number"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Confirming..." : "Confirm Order V2"}
        </button>
      </form>

      {error && (
        <pre style={{ color: "red", whiteSpace: "pre-wrap" }}>
          {error}
        </pre>
      )}

      {response && (
        <pre
          style={{
            marginTop: 20,
            background: "#f5f5f5",
            padding: 15,
          }}
        >
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ConfirmOrderV2;