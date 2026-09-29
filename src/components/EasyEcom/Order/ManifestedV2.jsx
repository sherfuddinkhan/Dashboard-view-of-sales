import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const ManifestedV2 = () => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const payload = [
    {
      invoice_id: 181770649,
      order_id: 148390611,
      blockSplit: 0,

      reference_code: "WEB_TEST",

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

      order_date: "2023-10-10 05:30:00",
      tat: "2023-10-10 00:00:10",

      available_after: null,

      invoice_date: "2023-10-23 00:00:00",

      import_date: "2023-10-10 18:39:39",

      last_update_date: "2023-10-23 16:55:04",

      manifest_date: "2023-10-23 16:55:53",

      manifest_no: "20231023045553_10_29396_639",

      invoice_number: "CWB2-2324-2",

      marketplace_invoice_num: "WEB_TEST",

      shipping_last_update_date: "2023-10-23 16:55:53",

      batch_id: null,
      batch_created_at: null,
      message: null,

      courier_aggregator_name: "HandOver",
      courier: "care@easyecom.io",

      carrier_id: 29396,

      awb_number: "1817706494371782",

      package_weight: 800,
      package_height: 3,
      package_length: 6,
      package_width: 6,

      order_status: "Shipped",
      order_status_id: 7,

      easyecom_order_history: [
        {
          status: "Assigned",
          status_id: 2,
          date_time: "2023-10-10 18:39:40"
        },
        {
          status: "Confirm new",
          status_id: 17,
          date_time: "2023-10-10 21:10:58"
        },
        {
          status: "Confirmed",
          status_id: 3,
          date_time: "2023-10-10 21:10:58"
        },
        {
          status: "Confirm start",
          status_id: 13,
          date_time: "2023-10-10 21:10:59"
        },
        {
          status: "Selfship Confirm",
          status_id: 38,
          date_time: "2023-10-10 21:11:00"
        },
        {
          status: "Confirm Success",
          status_id: 16,
          date_time: "2023-10-10 21:11:18"
        },
        {
          status: "Printed",
          status_id: 5,
          date_time: "2023-10-10 21:13:16"
        },
        {
          status: "Ready to dispatch",
          status_id: 6,
          date_time: "2023-10-23 16:55:04"
        },
        {
          status: "Shipped",
          status_id: 7,
          date_time: "2023-10-23 16:55:53"
        }
      ],

      shipping_status: "Shipment Created",
      shipping_status_id: 1,

      tracking_url: null,
      shipping_history: null,

      payment_mode: "PrePaid",
      payment_mode_id: 5,

      payment_gateway_transaction_number: null,
      payment_gateway_name: null,

      buyer_gst: "NA",

      customer_name: "Aish",
      shipping_name: "Aish",

      contact_num: "9875642240",

      address_line_1:
        "D 22/3, FIRST FLOOR, OKHLA PHASE 2 , NEAR BHAWANI MANDIR",

      address_line_2: null,

      city: "New Delhi",
      pin_code: "110020",

      state: "Delhi",
      state_code: "07",

      country: "India",
      country_code: 0,

      email: "test@gmail.com",

      latitude: null,
      longitude: null,

      billing_name: "Aish",

      billing_address_1:
        "D 22/3, FIRST FLOOR, OKHLA PHASE 2 , NEAR BHAWANI MANDIR",

      billing_address_2: null,

      billing_city: "New Delhi",
      billing_state: "Delhi",
      billing_state_code: "07",

      billing_pin_code: "110020",

      billing_country: "India",

      billing_mobile: "9875642240",

      order_quantity: 1,

      documents: {
        easyecom_invoice:
          "https://ee-uploaded-files-oregon.s3.us-west-2.amazonaws.com/Invoice/10/18177064988798.pdf?request-content-type=application/force-download",

        label:
          "https://ee-uploaded-files-oregon.s3.us-west-2.amazonaws.com/Labels/10/18177064988798.pdf?request-content-type=application/force-download",

        intaxform: null,
        outtaxform: null,
        marketplaceinvoice: null,
        marketplace_tax_invoice: null,
        marketplace_b2c_invoice: null
      },

      invoice_documents: null,

      collectable_amount: 0,

      total_amount: 1000,

      total_tax: 152.542,

      breakup_types: {
        "Item Amount Excluding Tax": 847.45759999999996,
        "Item Amount IGST": 152.54239999999999
      },

      tcs_rate: 0,
      tcs_amount: 0,

      customer_code: "NA",

      order_items: [
        {
          suborder_id: 229854910,

          suborder_num: "88798169694337998375959",

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

          selling_price: "1000",

          breakup_types: {
            "Item Amount Excluding Tax": 847.45759999999996,
            "Item Amount IGST": 152.54239999999999
          },

          station_scanned_quantity: 0,
          batch_scanned_quantity: 0,
          assigned_quantity: 1
        }
      ],

      location_key: "ht7885084804"
    }
  ];

  const sendManifestedV2 = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/webhook/manifested-v2`,
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
      console.error("Manifested V2 Error:", err);

      setError(
        err.response?.data ||
          err.message ||
          "Manifested V2 request failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <h2>EasyEcom Manifested V2</h2>

      <p>
        Invoice ID: <strong>181770649</strong>
      </p>

      <p>
        Order ID: <strong>148390611</strong>
      </p>

      <p>
        Manifest No:{" "}
        <strong>20231023045553_10_29396_639</strong>
      </p>

      <p>
        AWB: <strong>1817706494371782</strong>
      </p>

      <p>
        Order Status: <strong>Shipped</strong>
      </p>

      <button
        onClick={sendManifestedV2}
        disabled={loading}
        style={{
          padding: "10px 18px",
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Sending..." : "Test Manifested V2"}
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

export default ManifestedV2;