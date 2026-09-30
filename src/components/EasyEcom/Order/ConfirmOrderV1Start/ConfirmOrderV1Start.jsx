import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const ConfirmOrderV1Start = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const payload = {
    orders: [
      {
        invoice_id: 180464000,
        order_id: 147087023,
        queue_message: null,
        queue_status: 2,
        order_priority: 0,
        blockSplit: 0,

        reference_code: "test_order_webhook_57",

        company_name: "EasyEcom Test Company",
        location_key: "wo3484777024",
        warehouseId: 59032,

        seller_gst: "",

        import_warehouse_id: 59032,
        import_warehouse_name: "EasyEcom Test Company",

        pickup_address: "Pathardi phata ",
        pickup_city: "Nashik",
        pickup_state: "Maharashtra",
        pickup_state_code: "27",
        pickup_pin_code: "422010",
        pickup_country: "India",

        order_type: "B2C",
        order_type_key: "retailorder",

        replacement_order: 0,

        marketplace: "Offline",
        marketplace_id: 10,

        qcPassed: 1,
        salesmanUserId: 0,

        order_date: "2023-10-06 05:30:00",
        tat: "2023-10-07 12:21:48",

        available_after: null,

        invoice_date: "2023-10-06 00:00:00",
        import_date: "2023-10-06 12:21:48",
        last_update_date: "2023-10-06 12:28:15",

        manifest_date: null,
        manifest_no: null,

        invoice_number: "CKA1-2324-30",
        marketplace_invoice_num: "test_order_webhook_57",

        shipping_last_update_date: "2023-10-06 12:28:15",

        batch_id: null,
        batch_created_at: null,
        message: null,

        courier_aggregator_name: "HandOver",
        courier: "deepak.vr@easyecom.in",

        carrier_id: 28865,
        awb_number: "1804640009559138",

        order_status: "Confirmed",
        order_status_id: 3,

        shipping_status: "Shipment Created",
        shipping_status_id: 1,

        shipping_history: null,

        payment_mode: "COD",
        payment_mode_id: 2,

        payment_gateway_transaction_number: null,
        payment_gateway_name: null,

        buyer_gst: "NA",

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

        latitude: null,
        longitude: null,

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

        meta: null,
        documents: null,

        total_amount: 700,
        total_tax: 106.78,
        total_shipping_charge: 27.000200986862183,
        total_discount: -16,

        collectable_amount: 700,

        tcs_rate: 0,
        tcs_amount: 0,

        customer_code: "NA",

        suborders: [
          {
            suborder_id: 227582967,
            suborder_num: "59032169657510836822366",

            item_status: "Confirmed",
            shipment_type: "SelfShip",

            suborder_quantity: 8,
            item_quantity: 8,

            returned_quantity: 0,
            cancelled_quantity: 0,
            shipped_quantity: 8,

            batch_codes: null,
            serial_nums: "NA",
            batchcode_serial: "NA",
            batchcode_expiry: "NA",

            tax_type: "GST",

            suborder_history: {
              qc_pass_datetime: "2023-10-06 12:21:48",
              confirm_datetime: "2023-10-06 12:28:14",
              print_datetime: null,
              manifest_datetime: null
            },

            meta: null,

            selling_price: "391.08469539376",

            total_shipping_charge: 15.084800720214844,
            total_miscellaneous: -16,

            tax_rate: 18,
            tax: 59.656799999999997,

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

            custom_fields: [
              {
                field_name: "Custom_field_1",
                field_value: "test_custom_value_1",
                field_id: 18819
              }
            ]
          },

          {
            suborder_id: 227582973,
            suborder_num: "59032169657510921761515",

            item_status: "Confirmed",
            shipment_type: "SelfShip",

            suborder_quantity: 3,
            item_quantity: 3,

            returned_quantity: 0,
            cancelled_quantity: 0,
            shipped_quantity: 3,

            batch_codes: null,
            serial_nums: "NA",
            batchcode_serial: "NA",
            batchcode_expiry: "NA",

            tax_type: "GST",

            suborder_history: {
              qc_pass_datetime: "2023-10-06 12:21:49",
              confirm_datetime: "2023-10-06 12:28:14",
              print_datetime: null,
              manifest_datetime: null
            },

            meta: null,

            selling_price: "308.91530460624",

            total_shipping_charge: 11.915400266647339,
            total_miscellaneous: null,

            tax_rate: 18,
            tax: 47.122799999999998,

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

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/webhook/confirm-order-v1-start`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Token": "YOUR_WEBHOOK_TOKEN"
          }
        }
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
    <div style={{ padding: 30 }}>
      <h2>EasyEcom Confirm Order V1 Start</h2>

      <button
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading
          ? "Sending..."
          : "Test Confirm Order V1 Start"}
      </button>

      {error && (
        <pre
          style={{
            color: "red",
            marginTop: 20,
            whiteSpace: "pre-wrap"
          }}
        >
          {error}
        </pre>
      )}

      {response && (
        <pre
          style={{
            marginTop: 20,
            background: "#f5f5f5",
            padding: 15,
            whiteSpace: "pre-wrap"
          }}
        >
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ConfirmOrderV1Start;