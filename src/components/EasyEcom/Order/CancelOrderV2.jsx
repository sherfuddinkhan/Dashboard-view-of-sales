import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function CancelOrderV2() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const payload = [
    {
      invoice_id: 167343415,
      order_id: 135172505,
      blockSplit: 0,
      reference_code: "Test",

      company_name: "Test Location 1",

      warehouse_id: 88798,

      seller_gst: "19ASSDFGCVGGHJJ",

      assigned_company_name: "Test Location 1",
      assigned_warehouse_id: 88798,
      assigned_company_gst: "19ASSDFGCVGGHJJ",

      warehouse_contact: null,

      pickup_address:
        "Jai mata di apartment 3rd floor near bandhu mahal, sapuipara, bally, howrah - 711227 ",
      pickup_city: "Howrah",
      pickup_state: "West Bengal",
      pickup_state_code: "19",
      pickup_pin_code: "711227",
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

      order_date: "2023-08-07 05:30:00",
      tat: "2023-08-08 14:32:23",

      available_after: null,

      invoice_date: "2023-08-07 00:00:00",
      import_date: "2023-08-07 14:32:23",
      last_update_date: "2023-10-23 16:58:48",

      manifest_date: null,
      manifest_no: null,

      invoice_number: "CWB2-2324-1",
      marketplace_invoice_num: "Test",

      shipping_last_update_date: null,

      batch_id: 1568288,
      batch_created_at: "2023-08-07 14:32:45",

      message: null,

      courier_aggregator_name: null,
      courier: "SelfShip",
      carrier_id: 23,
      awb_number: null,

      package_weight: "100",
      package_height: "10",
      package_length: "10",
      package_width: "10",

      order_status: "Cancelled",
      order_status_id: 9,

      easyecom_order_history: [
        {
          status: "Assigned",
          status_id: 2,
          date_time: "2023-08-07 14:32:24"
        },
        {
          status: "Confirm new",
          status_id: 17,
          date_time: "2023-08-07 14:34:09"
        },
        {
          status: "Confirmed",
          status_id: 3,
          date_time: "2023-08-07 14:34:09"
        },
        {
          status: "Confirm start",
          status_id: 13,
          date_time: "2023-08-07 14:34:10"
        },
        {
          status: "Confirm Fail",
          status_id: 18,
          date_time: "2023-08-07 14:34:10"
        },
        {
          status: "Cancelled",
          status_id: 9,
          date_time: "2023-10-23 16:58:48"
        }
      ],

      shipping_status: null,
      shipping_status_id: null,

      tracking_url: null,
      shipping_history: null,

      payment_mode: "Online",
      payment_mode_id: 1,

      payment_gateway_transaction_number: null,

      buyer_gst: "NA",

      customer_name: "Test",
      shipping_name: "Test",

      contact_num: "9999999999",

      address_line_1: "rww",
      address_line_2: null,

      city: "adef",
      pin_code: "445566",
      state: "Chandigarh",
      state_code: "04",
      country: "India",
      country_code: 0,

      email: "test@gmail.com",

      latitude: null,
      longitude: null,

      billing_name: "Test",
      billing_address_1: "rww",
      billing_address_2: null,

      billing_city: "adef",
      billing_state: "Chandigarh",
      billing_state_code: "04",
      billing_pin_code: "445566",
      billing_country: "India",
      billing_mobile: "9999999999",

      order_quantity: 1,

      documents: null,
      invoice_documents: null,

      collectable_amount: 0,

      total_amount: 0,
      total_tax: 0,

      breakup_types: {
        "Item Amount Excluding Tax": 0,
        "Item Amount IGST": 0
      },

      tcs_rate: 0,
      tcs_amount: 0,

      customer_code: "NA",

      order_items: [
        {
          suborder_id: 205525179,
          suborder_num: "887981691398851294719",

          invoicecode: null,

          item_collectable_amount: 0,

          shipment_type: "SelfShip",

          suborder_quantity: 1,
          item_quantity: 1,

          returned_quantity: 0,
          cancelled_quantity: 1,
          shipped_quantity: 0,

          tax_type: "GST",

          product_id: 18675081,
          company_product_id: 77606740,

          sku: "1001",

          expiry_type: 0,

          sku_type: "Normal",

          sub_product_count: 1,

          marketplace_sku: "1001",

          listing_ref_number: "-",
          listing_id: "-",

          productName: "Bwin Sport Watches 1022",

          description: null,

          category: "Watches",
          brand: "Bwin",
          brand_id: 7143044,

          model_no: "1022",

          product_tax_code: null,

          ean: "8981349877888",

          size: "12''",

          cost: 2500,
          mrp: 5000,

          weight: 800,
          length: 6,
          width: 6,
          height: 3,

          scheme_applied: 0,

          custom_fields: [],

          serials: [null],

          tax_rate: 18,

          selling_price: null,

          breakup_types: {
            "Item Amount Excluding Tax": 0,
            "Item Amount IGST": 0
          },

          station_scanned_quantity: 0,
          batch_scanned_quantity: 0,
          assigned_quantity: 1
        }
      ],

      location_key: "ht7885084804"
    }
  ];

  const handleCancelOrder = async () => {
    try {
      setLoading(true);
      setError("");
      setResponse(null);

      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/webhook/cancel-order-v2`,
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
        "Cancel Order V2 failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <h2>EasyEcom Cancel Order V2</h2>

      <p>
        <strong>Order ID:</strong>{" "}
        {payload[0].order_id}
      </p>

      <p>
        <strong>Reference Code:</strong>{" "}
        {payload[0].reference_code}
      </p>

      <p>
        <strong>Customer:</strong>{" "}
        {payload[0].customer_name}
      </p>

      <p>
        <strong>Status:</strong>{" "}
        {payload[0].order_status}
      </p>

      <p>
        <strong>Status ID:</strong>{" "}
        {payload[0].order_status_id}
      </p>

      <p>
        <strong>Total Amount:</strong>{" "}
        ₹{payload[0].total_amount}
      </p>

      <p>
        <strong>Items:</strong>{" "}
        {payload[0].order_items.length}
      </p>

      <button
        type="button"
        onClick={handleCancelOrder}
        disabled={loading}
      >
        {loading
          ? "Sending..."
          : "Send Cancel Order V2"}
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

export default CancelOrderV2;