import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const ManifestedV1 = () => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const payload = {
    orders: [
      {
        invoice_id: 184073228,
        order_id: 150683877,
        queue_message: null,
        queue_status: 3,
        order_priority: 0,
        blockSplit: 0,
        reference_code: "Test345_12",
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
        invoice_currency_code: "INR",

        order_type: "B2C",
        order_type_key: "retailorder",
        replacement_order: 0,

        marketplace: "Offline",
        marketplace_id: 10,

        qcPassed: 1,
        salesmanUserId: 0,

        order_date: "2023-10-19 05:30:00",
        tat: "2023-10-20 16:39:26",
        available_after: null,
        invoice_date: "2023-10-19 00:00:00",
        import_date: "2023-10-19 16:39:26",
        last_update_date: "2023-10-19 18:45:16",

        manifest_date: "2023-10-19 18:46:49",
        manifest_no: "20231019064649_10_28865_990",

        invoice_number: "CKA1-2324-41",
        marketplace_invoice_num: null,

        shipping_last_update_date: "2023-10-19 18:46:49",

        batch_id: null,
        batch_created_at: null,
        message: null,

        courier_aggregator_name: "HandOver",
        courier: "deepak.vr@easyecom.in",
        carrier_id: 28865,
        awb_number: "1840732288757856",

        order_status: "Shipped",
        order_status_id: 7,

        shipping_status: "Shipment Created",
        shipping_status_id: 1,
        shipping_history: null,

        payment_mode: "PrePaid",
        payment_mode_id: 5,

        payment_gateway_transaction_number: null,
        payment_gateway_name: null,

        buyer_gst: "NA",

        customer_name: "Test",
        contact_num: "8899776654",

        address_line_1: "H15",
        address_line_2: null,
        city: "Delhi",
        pin_code: "887654",
        state: "Delhi",
        state_code: null,
        country: "India",
        email: "test@gmail.com",

        latitude: null,
        longitude: null,

        billing_name: "Test",
        billing_address_1: "H15",
        billing_address_2: null,
        billing_city: "Delhi",
        billing_state: "Delhi",
        billing_state_code: null,
        billing_pin_code: "887654",
        billing_country: "India",
        billing_mobile: "8899776654",

        order_quantity: 1,

        meta: null,

        documents: {
          easyecom_invoice:
            "https://ee-uploaded-files-oregon.s3.us-west-2.amazonaws.com/Invoice/10/18407322859032.pdf?request-content-type=application/force-download",

          label:
            "https://ee-uploaded-files-oregon.s3.us-west-2.amazonaws.com/Labels/10/18407322859032.pdf?request-content-type=application/force-download",

          intaxform: null,
          outtaxform: null,
          marketplaceinvoice: null,
          marketplace_tax_invoice: null,
          marketplace_b2c_invoice: null
        },

        total_amount: 0,
        total_tax: 0,
        total_shipping_charge: 0,
        total_discount: 0,
        collectable_amount: 0,

        tcs_rate: 0,
        tcs_amount: 0,

        customer_code: "NA",

        suborders: [
          {
            suborder_id: 234097687,
            suborder_num: "5903216977137668438512",

            item_status: "Shipped",
            shipment_type: "SelfShip",

            suborder_quantity: 1,
            item_quantity: 1,

            returned_quantity: 0,
            cancelled_quantity: 0,
            shipped_quantity: 1,

            batch_codes: null,
            serial_nums: "NA",
            batchcode_serial: "NA",
            batchcode_expiry: "NA",

            tax_type: "GST",

            suborder_history: {
              qc_pass_datetime: "2023-10-19 16:39:26",
              confirm_datetime: "2023-10-19 18:43:06",
              print_datetime: "2023-10-19 18:45:06",
              manifest_datetime: "2023-10-19 18:46:49"
            },

            meta: null,

            selling_price: null,
            total_shipping_charge: null,
            total_miscellaneous: null,

            tax_rate: 18,
            tax: 0,

            product_id: 19842847,
            company_product_id: 77827976,

            sku: "Dip1011",
            sku_type: "Normal",

            sub_product_count: 1,

            marketplace_sku: "Dip1011",

            productName: "Dip1011",
            description: null,

            category: "CC5",
            brand: "Test",
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

            custom_fields: []
          }
        ]
      }
    ],

    nextUrl: null
  };

  const sendManifestedV1 = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/webhook/manifested-v1`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",

            // EasyEcom sends this header.
            // For manual testing replace with your webhook token.
            "Access-Token": "YOUR_WEBHOOK_TOKEN"
          }
        }
      );

      setResponse(result.data);
    } catch (err) {
      console.error("Manifested V1 Error:", err);

      setError(
        err.response?.data ||
          err.message ||
          "Manifested V1 request failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <h2>EasyEcom Manifested V1</h2>

      <p>
        Invoice ID: <strong>184073228</strong>
      </p>

      <p>
        Order ID: <strong>150683877</strong>
      </p>

      <p>
        Manifest No:{" "}
        <strong>20231019064649_10_28865_990</strong>
      </p>

      <p>
        AWB: <strong>1840732288757856</strong>
      </p>

      <button
        onClick={sendManifestedV1}
        disabled={loading}
        style={{
          padding: "10px 18px",
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Sending..." : "Test Manifested V1"}
      </button>

      {response && (
        <pre
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f5f5f5",
            overflow: "auto"
          }}
        >
          {JSON.stringify(response, null, 2)}
        </pre>
      )}

      {error && (
        <pre
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#ffe5e5",
            color: "red",
            overflow: "auto"
          }}
        >
          {JSON.stringify(error, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ManifestedV1;