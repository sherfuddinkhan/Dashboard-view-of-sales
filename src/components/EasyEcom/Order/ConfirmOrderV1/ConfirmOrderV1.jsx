import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const ConfirmOrderV1 = () => {
  const [form, setForm] = useState({
    invoice_id: "184073228",
    order_id: "150683877",
    reference_code: "Test345_12",
    location_key: "wo3484777024",
    warehouseId: "59032",
    invoice_number: "CKA1-2324-41",
    customer_name: "Test",
    contact_num: "8899776654",
    sku: "Dip1011",
    quantity: "1",
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
        warehouseId: Number(form.warehouseId),
        invoice_number: form.invoice_number,
        customer_name: form.customer_name,
        contact_num: form.contact_num,
        sku: form.sku,
        quantity: Number(form.quantity),
      };

      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/confirm-order-v1`,
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
      <h2>EasyEcom Confirm Order V1</h2>

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
          name="warehouseId"
          value={form.warehouseId}
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

        <button type="submit" disabled={loading}>
          {loading ? "Confirming..." : "Confirm Order V1"}
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

export default ConfirmOrderV1;