import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const ConfirmOrderV2Start = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const payload = [
    {
      invoice_id: 184898057,
      order_id: 151478500,

      blockSplit: 0,

      reference_code: "WEB_TEST1_58",

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
      packer: "ashish@easyecom.io_del",

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

      order_date: "2023-10-23 05:30:00",
      tat: "2023-10-24 16:47:41",

      available_after: null,

      invoice_date: "2023-10-23 00:00:00",
      import_date: "2023-10-23 16:47:41",
      last_update_date: "2023-10-23 16:51:29",

      manifest_date: null,
      manifest_no: null,

      invoice_number: "CWB2-2324-5",
      marketplace_invoice_num: null,

      shipping_last_update_date: "2023-10-23 16:49:20",

      batch_id: null,
      batch_created_at: null,
      message: null,

      courier_aggregator_name: "HandOver",
      courier: "care@easyecom.io",

      carrier_id: 29396,

      awb_number: "1848980576067981",

      package_weight: 800,
      package_height: 3,
      package_length: 6,
      package_width: 6,

      order_status: "Ready to dispatch",
      order_status_id: 6,

      easyecom_order_history: [
        {
          status: "Assigned",
          status_id: 2,
          date_time: "2023-10-23 16:47:42"
        },
        {
          status: "Confirm new",
          status_id: 17,
          date_time: "2023-10-23 16:49:19"
        },
        {
          status: "Confirmed",
          status_id: 3,
          date_time: "2023-10-23 16:49:19"
        },
        {
          status: "Confirm start",
          status_id: 13,
          date_time: "2023-10-23 16:49:19"
        },
        {
          status: "Selfship Confirm",
          status_id: 38,
          date_time: "2023-10-23 16:49:20"
        },
        {
          status: "Confirm Success",
          status_id: 16,
          date_time: "2023-10-23 16:49:35"
        },
        {
          status: "Printed",
          status_id: 5,
          date_time: "2023-10-23 16:51:30"
        }
      ],

      shipping_status: "Shipment Created",
      shipping_status_id: 1,

      tracking_url: null,
      shipping_history: null,

      payment_mode: "PrePaid",
      payment_mode_id: 5,

      payment_gateway_transaction_number: null,

      buyer_gst: "NA",

      customer_name: "Test",
      shipping_name: "Test",

      contact_num: "9876543767",

      address_line_1:
        "Oriana Business Park, office number 404, 405, Nehru nagar rd no:22 Waghle estate Thane West",

      address_line_2: null,

      city: "Bangalore",
      pin_code: "560102",

      state: "Karnataka",
      state_code: "29",

      country: "India",
      country_code: 0,

      email: "test@gmail.com",

      latitude: null,
      longitude: null,

      billing_name: "Test",

      billing_address_1:
        "Oriana Business Park, office number 404, 405, Nehru nagar rd no:22 Waghle estate Thane West",

      billing_address_2: null,

      billing_city: "Bangalore",
      billing_state: "Karnataka",
      billing_state_code: "29",

      billing_pin_code: "560102",

      billing_country: "India",
      billing_mobile: "9876543767",

      order_quantity: 1,

      documents: {
        easyecom_invoice:
          "https://ee-uploaded-files-oregon.s3.us-west-2.amazonaws.com/Invoice/10/18489805788798.pdf?request-content-type=application/force-download",

        label:
          "https://ee-uploaded-files-oregon.s3.us-west-2.amazonaws.com/Labels/10/18489805788798.pdf?request-content-type=application/force-download",

        intaxform: null,
        outtaxform: null,
        marketplaceinvoice: null,
        marketplace_tax_invoice: null,
        marketplace_b2c_invoice: null
      },

      invoice_documents: null,

      collectable_amount: 0,

      total_amount: 2000,
      total_tax: 305.08499999999998,

      breakup_types: {
        "Item Amount Excluding Tax": 1694.9152999999999,
        "Item Amount IGST": 305.0847
      },

      tcs_rate: 0,
      tcs_amount: 0,

      customer_code: "NA",

      order_items: [
        {
          suborder_id: 235684307,

          suborder_num:
            "88798169805986189394600",

          invoicecode: null,

          item_collectable_amount: 0,

          shipment_type: "SelfShip",

          suborder_quantity: 1,
          item_quantity: 1,

          returned_quantity: 0,
          cancelled_quantity: 0,
          shipped_quantity: 1,

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

          selling_price: "2000",

          breakup_types: {
            "Item Amount Excluding Tax": 1694.9152999999999,
            "Item Amount IGST": 305.0847
          },

          station_scanned_quantity: 0,
          batch_scanned_quantity: 0,
          assigned_quantity: 1
        }
      ],

      location_key: "ht7885084804"
    }
  ];

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/webhook/confirm-order-v2-start`,
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
      <h2>EasyEcom Confirm Order Start - V2</h2>

      <button
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading
          ? "Sending..."
          : "Test Confirm Order Start V2"}
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

export default ConfirmOrderV2Start;