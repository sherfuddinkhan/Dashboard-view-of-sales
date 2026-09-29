import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function GenerateB2BInvoiceV3() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateInvoice = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    const payload = {
      "0": {
        location_key: "XXXXXX"
      },

      orders: {
        invoice_id: 671641326,
        order_id: 572527681,
        blockSplit: 0,
        reference_code: "182514/131202",

        company_name: "XXXXXX ",
        warehouse_id: 2548953,
        seller_gst: "XXXXXX",

        assigned_company_name: "XXXXXX ",
        assigned_warehouse_id: 2547852,
        assigned_company_gst: "XXXXXX",

        warehouse_contact: "",

        pickup_address: "XXXXXX",
        pickup_city: "Kolkata",
        pickup_state: "West Bengal",
        pickup_state_code: "19",
        pickup_pin_code: "711302",
        pickup_country: "India",

        invoice_currency_code: "INR",

        order_type: "B2B",
        order_type_key: "businessorder",

        replacement_order: 0,
        originalOrderId: null,

        suborder_history: {
          hold_datetime: null,
          unhold_datetime: null,
          inventory_assigned_datetime: "2026-07-13 11:12:16"
        },

        marketplace: "B2B",
        MarketCId: 64,
        marketplace_id: 64,
        market_shipped: 0,
        merchant_c_id: 256879,

        qcPassed: 1,
        salesmanUserId: 0,

        order_date: "2026-07-13 10:52:53",
        tat: "2026-07-14 10:52:54",
        available_after: "2026-07-13 00:00:00",
        invoice_date: "2026-07-13 00:00:00",
        import_date: "2026-07-13 10:52:54",
        last_update_date: "2026-07-13 12:25:15",

        manifest_date: null,
        manifest_no: null,

        invoice_number: "BWB12627-1199",
        marketplace_invoice_num: "182514/131202",

        shipping_last_update_date: null,

        batch_id: 6793527,
        batch_created_at: "2026-07-13 11:13:42",

        message: "",

        courier_aggregator_name: null,
        courier: "SelfShip",
        carrier_id: 23,
        awb_number: null,

        order_validity_date: null,

        Package_Weight: 48,
        Package_Height: 1,
        Package_Length: 1,
        Package_Width: 1,

        order_status: "Confirmed",
        order_status_id: 3,

        suborder_count: "NA",

        easyecom_order_history: [
          {
            status: "Assigned",
            status_id: 2,
            date_time: "2026-07-13 11:12:16"
          }
        ],

        shipping_status: null,
        shipping_status_id: null,
        tracking_url: null,
        shipping_history: [],

        payment_mode: "Online",
        payment_mode_id: 1,

        payment_gateway_transaction_number: null,

        buyer_gst: "19AACCM4684P1ZO",

        customer_name: "XXXXXX",
        shipping_name: "XXXXXX",

        contact_num: "1234567890",

        address_line_1: "XXXXXX",
        address_line_2: "West Bengal",
        city: "SONARPUR,",
        pin_code: "700099",
        state: "West Bengal",
        state_code: "19",
        country: "India",
        country_code: "IN",

        email: "testbiotique@gmail.com",

        latitude: null,
        longitude: null,

        billing_name: "XXXXXX",
        billing_address_1: "XXXXXX",
        billing_address_2: "West Bengal",
        billing_city: "SONARPUR,",
        billing_state: "West Bengal",
        billing_state_code: "19",
        billing_pin_code: "700099",
        billing_country: "India",
        billing_mobile: "1234567890",

        order_quantity: 48,

        meta: {
          queue_id: 179968748,
          weight: ""
        },

        documents: {
          easyecom_invoice:
            "https://ee-uploaded-files.s3.ap-south-1.amazonaws.com/EEInvoice/671641326/261939120260713122515.pdf?request-content-type=application/force-download"
        },

        invoice_documents: {
          easyecom_invoice:
            "https://ee-uploaded-files.s3.ap-south-1.amazonaws.com/EEInvoice/671641326/261939120260713122515.pdf?request-content-type=application/force-download"
        },

        collectable_amount: 0,

        total_amount: "17473.0008",
        total_tax: "1773.4368",

        breakup_types: {
          Item_Amount_Excluding_Tax: 15741.403199999992,
          Shipping_Excluding_Tax: 8.985599999999996,
          Promotion_Discount_Excluding_Tax: -50.82479999999993,
          Item_Amount_CGST: 889.2984000000006,
          Item_Amount_SGST: 889.2984000000006,
          Shipping_CGST: 0.5088000000000003,
          Shipping_SGST: 0.5088000000000003,
          Promotion_Discount_CGST: -3.0888,
          Promotion_Discount_SGST: -3.0888
        },

        tcs_rate: 0,
        tcs_amount: 0,

        checkout_id: null,
        discount_code: null,

        packing_material: [],

        customer_code: 256879,

        return_challan_number: "",

        fulfillable_status: 0,

        order_items: [
          {
            suborder_id: 879273650,
            suborder_num: "254620178392017475213737",
            suborder_reference_num:
              "254620178392017420343024",

            reference_code: "182514/131202",

            invoicecode: null,
            item_collectable_amount: 0,

            shipment_type: "SelfShip",

            suborder_quantity: 24,
            item_quantity: 24,
            returned_quantity: 0,
            cancelled_quantity: 0,
            shipped_quantity: 24,

            item_details: [
              {
                sku: "CC00028",
                batch_code: "B3404",
                expiry: "2029-05-28",
                quantity: 24,
                batch_mrp: 375,
                vendor_company_name: "BXXXXXX "
              }
            ],

            tax_type: "GST",

            product_id: 35689874,
            company_product_id: 194697293,

            sku: "FGCC00028",

            expiry_type: 1,
            sku_type: "Normal",
            sub_product_count: 1,

            marketplace_sku: "FGCC00028",

            listing_ref_number: "-",
            listing_id: "-",

            productName:
              "Bio Herbcolor 1N Natural Black 50 gm +110 ml (N24)",

            description:
              "Bio Herbcolor 1N Natural Black 50 gm +110 ml (N24)",

            category: "Color Cosmatic",
            brand: "biotique",
            brand_id: 7191326,

            model_no: "700002",

            product_tax_code: null,
            AccountingSku: null,
            accounting_unit: null,

            ean: null,
            size: null,

            cost: 1,
            mrp: 375,

            weight: 1,
            length: 1,
            width: 1,
            height: 1,

            scheme_applied: 0,

            custom_fields: [],

            serials: Array(24).fill(null),

            meta: null,

            tax_rate: 18,

            selling_price: "8972.13",

            listing_identifier: null,

            tagloop_required: false,

            breakup_types: {
              Item_Amount_Excluding_Tax: 7627.118399999998,
              Shipping_Excluding_Tax: 4.3488,
              Promotion_Discount_Excluding_Tax:
                -27.967199999999984,
              Item_Amount_CGST: 686.4408000000003,
              Item_Amount_SGST: 686.4408000000003,
              Shipping_CGST: 0.3911999999999999,
              Shipping_SGST: 0.3911999999999999,
              Promotion_Discount_CGST:
                -2.517599999999999,
              Promotion_Discount_SGST:
                -2.517599999999999
            },

            tax_value: 1368.63,
            taxable_value: 7603.5,

            igst: 0,
            cgst: 684.31,
            sgst: 684.31,
            utgst: 0,

            station_scanned_quantity: 0,
            batch_scanned_quantity: 24,
            assigned_quantity: 24
          },

          {
            suborder_id: 879273716,
            suborder_num: "254620178392018067623992",
            suborder_reference_num:
              "25462017839201802405184",

            reference_code: "182514/131202",

            invoicecode: null,
            item_collectable_amount: 0,

            shipment_type: "SelfShip",

            suborder_quantity: 24,
            item_quantity: 24,
            returned_quantity: 0,
            cancelled_quantity: 0,
            shipped_quantity: 24,

            item_details: [
              {
                sku: "FFG02024",
                batch_code: "B605702",
                expiry: "2029-05-02",
                quantity: 24,
                batch_mrp: 355,
                vendor_company_name: "BXXXXXX "
              }
            ],

            tax_type: "GST",

            product_id: 35690584,
            company_product_id: 194698003,

            sku: "FFG02024",

            sku_type: "Normal",
            sub_product_count: 1,

            marketplace_sku: "FFG02024",

            listing_ref_number: "-",
            listing_id: "-",

            productName: "XXXXXX)",
            description: "XXXXXX)",

            category: "FG Ayurveda",
            brand: "bique",
            brand_id: 7191326,

            model_no: "700203",

            product_tax_code: null,
            AccountingSku: null,
            accounting_unit: null,

            ean: null,
            size: null,

            cost: 1,
            mrp: 355,

            weight: 1,
            length: 1,
            width: 1,
            height: 1,

            scheme_applied: 0,

            custom_fields: [],

            serials: Array(24).fill(null),

            meta: null,

            tax_rate: 5,

            selling_price: "8500.87",

            listing_identifier: null,

            tagloop_required: false,

            breakup_types: {
              Item_Amount_Excluding_Tax: 8114.284799999996,
              Shipping_Excluding_Tax: 4.6368,
              Promotion_Discount_Excluding_Tax:
                -22.857600000000012,
              Item_Amount_CGST: 202.85760000000008,
              Item_Amount_SGST: 202.85760000000008,
              Shipping_CGST: 0.11760000000000002,
              Shipping_SGST: 0.11760000000000002,
              Promotion_Discount_CGST:
                -0.5711999999999999,
              Promotion_Discount_SGST:
                -0.5711999999999999
            },

            tax_value: 404.81,
            taxable_value: 8096.06,

            igst: 0,
            cgst: 202.4,
            sgst: 202.4,
            utgst: 0,

            station_scanned_quantity: 0,
            batch_scanned_quantity: 24,
            assigned_quantity: 24
          }
        ]
      }
    };

    try {
      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/webhook/generate-b2b-invoice-v3`,
        payload,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      setResponse(result.data);
    } catch (err) {
      console.error(
        "Generate B2B Invoice V3 Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Generate B2B Invoice V3 failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>EasyEcom Generate B2B Invoice V3</h2>

      <p>
        Endpoint:
        <strong>
          {" "}
          POST /api/easyecom/webhook/generate-b2b-invoice-v3
        </strong>
      </p>

      <button
        type="button"
        onClick={handleGenerateInvoice}
        disabled={loading}
      >
        {loading
          ? "Generating..."
          : "Generate B2B Invoice V3"}
      </button>

      {error && (
        <div
          style={{
            marginTop: "20px",
            color: "red"
          }}
        >
          <strong>Error:</strong>

          <pre>{error}</pre>
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

export default GenerateB2BInvoiceV3;