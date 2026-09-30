import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function CancelOrderV1() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const payload = {
    orders: [
      {
        invoice_id: 180463405,
        order_id: 147086702,
        reference_code: "test_order_webhook",
        company_name: "EasyEcom Test Company",
        location_key: "wo3484777024",
        warehouseId: 59032,

        pickup_address: "Pathardi phata ",
        pickup_city: "Nashik",
        pickup_state: "Maharashtra",
        pickup_state_code: "27",
        pickup_pin_code: "422010",
        pickup_country: "India",

        order_type: "B2C",
        order_type_key: "retailorder",

        marketplace: "Offline",
        marketplace_id: 10,

        order_date: "2023-10-06 05:30:00",
        invoice_date: "2023-10-06 00:00:00",

        courier: "SelfShip",
        carrier_id: 23,
        awb_number: null,

        order_status: "Cancelled",
        order_status_id: 9,

        payment_mode: "COD",
        payment_mode_id: 2,

        customer_name: "defgh",
        contact_num: "9611624901",

        address_line_1: "fghjk",
        address_line_2: null,
        city: "rftgyuj",
        pin_code: "590012",
        state: "Karnataka",
        state_code: null,
        country: "India",

        email: "sdrg@gmail.com",

        billing_name: "defgh",
        billing_address_1: "fghjk",
        billing_address_2: null,
        billing_city: "rftgyuj",
        billing_state: "Karnataka",
        billing_state_code: null,
        billing_pin_code: "590012",
        billing_country: "India",
        billing_mobile: "9611624901",

        order_quantity: 11,

        total_amount: 713,
        total_tax: 108.764,
        total_shipping_charge: 29.000201225280762,
        total_discount: -5,
        collectable_amount: 713,

        tcs_rate: 0,
        tcs_amount: 0,

        customer_code: "NA",

        suborders: [
          {
            suborder_id: 227582376,
            suborder_num: "5903216965749839763621",

            item_status: "Cancelled",
            shipment_type: "SelfShip",

            suborder_quantity: 8,
            item_quantity: 8,
            returned_quantity: 0,
            cancelled_quantity: 8,
            shipped_quantity: 0,

            tax_type: "GST",

            selling_price: "403.40789473684",
            total_shipping_charge: 16.408000946044922,
            total_miscellaneous: -5,

            tax_rate: 18,
            tax: 61.537599999999998,

            product_id: 19842860,
            company_product_id: 77827995,

            sku: "Dip1033",
            sku_type: "Normal",
            sub_product_count: 1,
            marketplace_sku: "Dip1033",

            productName: "Dip1033",
            description: null,
            category: "CC5",
            brand: "Test",
            model_no: "1234567890-",

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
            custom_fields: []
          },
          {
            suborder_id: 227582386,
            suborder_num: "59032169657498628009823",

            item_status: "Cancelled",
            shipment_type: "SelfShip",

            suborder_quantity: 3,
            item_quantity: 3,
            returned_quantity: 0,
            cancelled_quantity: 3,
            shipped_quantity: 0,

            tax_type: "GST",

            selling_price: "309.59210526316",
            total_shipping_charge: 12.59220027923584,
            total_miscellaneous: null,

            tax_rate: 18,
            tax: 47.225999999999999,

            product_id: 19842864,
            company_product_id: 77828000,

            sku: "Dip1055",
            sku_type: "Normal",
            sub_product_count: 1,
            marketplace_sku: "Dip1055",

            productName: "Dip1055",
            description: null,
            category: "CC5",
            brand: "Test",
            model_no: "1234567890-",

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
            custom_fields: []
          }
        ]
      }
    ],

    nextUrl: null
  };

  const handleCancelOrder = async () => {
    try {
      setLoading(true);
      setError("");
      setResponse(null);

      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/webhook/cancel-order-v1`,
        payload,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      setResponse(result.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Cancel Order V1 failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <h2>EasyEcom Cancel Order V1</h2>

      <p>
        <strong>Order ID:</strong>{" "}
        {payload.orders[0].order_id}
      </p>

      <p>
        <strong>Reference Code:</strong>{" "}
        {payload.orders[0].reference_code}
      </p>

      <p>
        <strong>Customer:</strong>{" "}
        {payload.orders[0].customer_name}
      </p>

      <p>
        <strong>Status:</strong>{" "}
        {payload.orders[0].order_status}
      </p>

      <p>
        <strong>Status ID:</strong>{" "}
        {payload.orders[0].order_status_id}
      </p>

      <p>
        <strong>Total Amount:</strong>{" "}
        ₹{payload.orders[0].total_amount}
      </p>

      <button
        type="button"
        onClick={handleCancelOrder}
        disabled={loading}
      >
        {loading
          ? "Sending..."
          : "Send Cancel Order V1"}
      </button>

      {error && (
        <div style={{ marginTop: "20px" }}>
          <h3>Error</h3>
          <pre style={{ color: "red" }}>
            {error}
          </pre>
        </div>
      )}

      {response && (
        <div style={{ marginTop: "20px" }}>
          <h3>Response</h3>
          <pre>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default CancelOrderV1;