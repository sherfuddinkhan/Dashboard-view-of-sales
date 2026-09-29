import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const CreateOrderV1 = () => {
  const [form, setForm] = useState({
    invoice_id: 184092699,
    order_id: 150703222,
    reference_code: "ccc-2_23",
    company_name: "EasyEcom Test Company",
    location_key: "wo3484777024",
    warehouseId: 59032,

    pickup_address: "Pathardi phata ",
    pickup_city: "Nashik",
    pickup_state: "Maharashtra",
    pickup_state_code: "27",
    pickup_pin_code: "422010",

    customer_name: "indi",
    contact_num: "9876543210",
    address_line_1: "hssr layout",
    city: "bangalore",
    pin_code: "625017",
    state: "Tamil Nadu",
    state_code: "33",
    email: "indi@gmail.com",

    order_quantity: 2,
    total_amount: 38,
    total_tax: 5.7966,

    sku: "CCSKU23",
    productName: "CCount",
    quantity: 2,
    selling_price: "38",
  });

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const buildPayload = () => {
    return {
      orders: [
        {
          invoice_id: Number(form.invoice_id),
          order_id: Number(form.order_id),

          queue_message: null,
          queue_status: 8,
          order_priority: 0,
          blockSplit: 0,

          reference_code: form.reference_code,
          company_name: form.company_name,
          location_key: form.location_key,

          warehouseId: Number(form.warehouseId),

          seller_gst: "",

          import_warehouse_id: Number(form.warehouseId),
          import_warehouse_name: form.company_name,

          pickup_address: form.pickup_address,
          pickup_city: form.pickup_city,
          pickup_state: form.pickup_state,
          pickup_state_code: form.pickup_state_code,
          pickup_pin_code: form.pickup_pin_code,
          pickup_country: "India",

          invoice_currency_code: "INR",

          order_type: "B2C",
          order_type_key: "retailorder",
          replacement_order: 0,

          marketplace: "Offline",
          marketplace_id: 10,

          qcPassed: 1,
          salesmanUserId: 0,

          order_date: "2023-10-19 05:30:00",
          tat: "2023-10-20 18:38:55",

          available_after: null,
          invoice_date: "",
          import_date: "2023-10-19 18:38:55",
          last_update_date: "2023-10-19 18:38:55",

          manifest_date: null,
          manifest_no: null,
          invoice_number: null,
          marketplace_invoice_num: null,
          shipping_last_update_date: null,

          batch_id: null,
          batch_created_at: null,

          message: null,
          courier_aggregator_name: null,

          courier: "SelfShip",
          carrier_id: 23,
          awb_number: null,

          order_status: "Pending",
          order_status_id: 1,

          shipping_status: null,
          shipping_status_id: null,
          shipping_history: null,

          payment_mode: "Online",
          payment_mode_id: 1,

          payment_gateway_transaction_number: null,
          payment_gateway_name: null,

          buyer_gst: "NA",

          customer_name: form.customer_name,
          contact_num: form.contact_num,

          address_line_1: form.address_line_1,
          address_line_2: null,

          city: form.city,
          pin_code: form.pin_code,
          state: form.state,
          state_code: form.state_code,

          country: "India",

          email: form.email,

          latitude: null,
          longitude: null,

          billing_name: form.customer_name,
          billing_address_1: form.address_line_1,
          billing_address_2: null,
          billing_city: form.city,
          billing_state: form.state,
          billing_state_code: form.state_code,
          billing_pin_code: form.pin_code,
          billing_country: "India",
          billing_mobile: form.contact_num,

          order_quantity: Number(form.order_quantity),

          meta: null,
          documents: null,

          total_amount: Number(form.total_amount),
          total_tax: Number(form.total_tax),

          total_shipping_charge: 0,
          total_discount: 0,
          collectable_amount: 0,

          tcs_rate: 0,
          tcs_amount: 0,

          customer_code: "NA",

          suborders: [
            {
              suborder_id: 234140239,
              suborder_num: "59032169772093589688388",

              item_status: "Pending",
              shipment_type: "SelfShip",

              suborder_quantity: Number(form.quantity),
              item_quantity: Number(form.quantity),

              returned_quantity: 0,
              cancelled_quantity: 0,
              shipped_quantity: Number(form.quantity),

              batch_codes: null,

              serial_nums: "NA",
              batchcode_serial: "NA",
              batchcode_expiry: "NA",

              tax_type: "GST",

              suborder_history: {
                qc_pass_datetime: "2023-10-19 18:38:55",
                confirm_datetime: null,
                print_datetime: null,
                manifest_datetime: null,
              },

              meta: null,

              selling_price: form.selling_price,

              total_shipping_charge: null,
              total_miscellaneous: null,

              tax_rate: 18,
              tax: Number(form.total_tax),

              product_id: 19452180,
              company_product_id: 76120647,

              sku: form.sku,
              sku_type: "Normal",
              sub_product_count: 1,

              marketplace_sku: form.sku,

              productName: form.productName,

              description: null,
              category: "CC5",
              brand: "CCC",
              model_no: "6513",

              product_tax_code: null,
              ean: "5",
              size: "NA",

              cost: 150,
              mrp: 200,

              weight: 200,
              length: 3,
              width: 3,
              height: 3,

              scheme_applied: 0,
              custom_fields: [],
            },
          ],
        },
      ],

      nextUrl: null,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setResponse(null);
    setError("");

    try {
      const payload = buildPayload();

      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/create-order-v1`,
        payload
      );

      setResponse(result.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          err.message
      );
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "30px auto" }}>
      <h2>EasyEcom Create Order V1</h2>

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
          name="company_name"
          value={form.company_name}
          onChange={handleChange}
          placeholder="Company Name"
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
          name="address_line_1"
          value={form.address_line_1}
          onChange={handleChange}
          placeholder="Address"
        />

        <input
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder="City"
        />

        <input
          name="state"
          value={form.state}
          onChange={handleChange}
          placeholder="State"
        />

        <input
          name="pin_code"
          value={form.pin_code}
          onChange={handleChange}
          placeholder="PIN Code"
        />

        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
        />

        <input
          name="sku"
          value={form.sku}
          onChange={handleChange}
          placeholder="SKU"
        />

        <input
          name="productName"
          value={form.productName}
          onChange={handleChange}
          placeholder="Product Name"
        />

        <input
          name="quantity"
          value={form.quantity}
          onChange={handleChange}
          placeholder="Quantity"
        />

        <input
          name="selling_price"
          value={form.selling_price}
          onChange={handleChange}
          placeholder="Selling Price"
        />

        <button type="submit">
          Create Order V1
        </button>
      </form>

      {error && (
        <pre style={{ color: "red" }}>
          {error}
        </pre>
      )}

      {response && (
        <pre>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default CreateOrderV1;