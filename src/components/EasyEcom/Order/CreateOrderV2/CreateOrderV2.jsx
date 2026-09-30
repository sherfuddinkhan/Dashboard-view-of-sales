import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const CreateOrderV2 = () => {
  const [form, setForm] = useState({
    invoice_id: 184073228,
    order_id: 150683877,
    reference_code: "Test345_12",

    company_name: "EasyEcom Test Company",
    warehouse_id: 59032,

    pickup_address: "Pathardi phata ",
    pickup_city: "Nashik",
    pickup_state: "Maharashtra",
    pickup_state_code: "27",
    pickup_pin_code: "422010",

    customer_name: "Test",
    shipping_name: "Test",
    contact_num: "8899776654",

    address_line_1: "H15",
    city: "Delhi",
    pin_code: "887654",
    state: "Delhi",
    state_code: "07",

    email: "test@gmail.com",

    sku: "Dip1011",
    productName: "Dip1011",

    quantity: 1,
    package_weight: 1,
    package_height: 1,
    package_length: 1,
    package_width: 1,

    total_amount: 0,
    total_tax: 0,
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
    return [
      {
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
        pickup_country: "India",

        invoice_currency_code: "INR",

        picker: "NA",
        packer: "NA",

        order_type: "B2C",
        order_type_key: "retailorder",

        replacement_order: 0,

        marketplace: "Offline",
        MarketCId: 123,
        marketplace_id: 10,

        market_shipped: 0,
        merchant_c_id: 123,

        qcPassed: 1,
        salesmanUserId: 0,

        order_date: "2023-10-19 05:30:00",
        tat: "2023-10-20 16:39:26",

        available_after: null,
        invoice_date: "",

        import_date: "2023-10-19 16:39:26",
        last_update_date: "2023-10-19 16:39:28",

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

        package_weight: Number(form.package_weight),
        package_height: Number(form.package_height),
        package_length: Number(form.package_length),
        package_width: Number(form.package_width),

        order_status: "Pending",
        order_status_id: 1,

        easyecom_order_history: [
          {
            status: "Assigned",
            status_id: 2,
            date_time: "2023-10-19 16:39:28",
          },
        ],

        shipping_status: null,
        shipping_status_id: null,

        tracking_url: null,
        shipping_history: null,

        payment_mode: "PrePaid",
        payment_mode_id: 5,

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

        country: "India",
        country_code: 0,

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

        order_quantity: Number(form.quantity),

        documents: null,
        invoice_documents: null,

        collectable_amount: 0,

        total_amount: Number(form.total_amount),
        total_tax: Number(form.total_tax),

        breakup_types: {
          "Item Amount Excluding Tax": 0,
          "Item Amount IGST": 0,
        },

        tcs_rate: 0,
        tcs_amount: 0,

        customer_code: "NA",

        order_items: [
          {
            suborder_id: 234097687,
            suborder_num: "5903216977137668438512",

            invoicecode: null,

            item_collectable_amount: 0,

            shipment_type: "SelfShip",

            suborder_quantity: Number(form.quantity),
            item_quantity: Number(form.quantity),

            returned_quantity: 0,
            cancelled_quantity: 0,
            shipped_quantity: Number(form.quantity),

            tax_type: "GST",

            product_id: 19842847,
            company_product_id: 77827976,

            sku: form.sku,

            expiry_type: 0,

            sku_type: "Normal",
            sub_product_count: 1,

            marketplace_sku: form.sku,

            listing_ref_number: "-",
            listing_id: "-",

            productName: form.productName,

            description: null,

            category: "CC5",
            brand: "Test",
            brand_id: 7070022,

            model_no: "1234567890",

            product_tax_code: null,

            ean: "NA",
            size: "1",

            cost: 1,
            mrp: 1,

            weight: 1,
            length: 1,
            width: 1,
            height: 1,

            scheme_applied: 0,

            custom_fields: [],

            serials: [null],

            tax_rate: 18,

            selling_price: null,

            breakup_types: {
              "Item Amount Excluding Tax": 0,
              "Item Amount IGST": 0,
            },

            station_scanned_quantity: 0,
            batch_scanned_quantity: 0,
            assigned_quantity: Number(form.quantity),
          },
        ],

        location_key: "wo3484777024",
      },
    ];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setResponse(null);
    setError("");

    try {
      const payload = buildPayload();

      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/create-order-v2`,
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
      <h2>EasyEcom Create Order V2</h2>

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
          name="warehouse_id"
          value={form.warehouse_id}
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
          name="package_weight"
          value={form.package_weight}
          onChange={handleChange}
          placeholder="Package Weight"
        />

        <input
          name="package_height"
          value={form.package_height}
          onChange={handleChange}
          placeholder="Package Height"
        />

        <input
          name="package_length"
          value={form.package_length}
          onChange={handleChange}
          placeholder="Package Length"
        />

        <input
          name="package_width"
          value={form.package_width}
          onChange={handleChange}
          placeholder="Package Width"
        />

        <button type="submit">
          Create Order V2
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

export default CreateOrderV2;