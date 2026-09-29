import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function MarkReturnV2() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const payload = [
    [
      {
        credit_note_id: 20300783,
        invoice_id: 149456297,
        order_id: 119119260,
        reference_code: "2775",
        company_name: "Sanket_EasyEcom",
        location_key: "en2842275969",
        warehouseId: 53313,
        seller_gst: "2354D",

        forward_shipment_pickup_address: "Bangalore",
        forward_shipment_pickup_city: "Bengalore",
        forward_shipment_pickup_state: "Karnataka",
        forward_shipment_pickup_state_code: "29",
        forward_shipment_pickup_pin_code: "560102",
        forward_shipment_pickup_country: "India",

        order_type: "B2C",
        order_type_key: "retailorder",
        replacement_order: 0,

        marketplace: "Shopify",
        marketplace_id: 26,
        salesmanUserId: 0,

        order_date: "2023-05-11 13:38:31",
        invoice_date: "2023-06-16 00:00:00",
        import_date: "2023-05-11 13:53:33",
        last_update_date: "2023-06-16 11:31:35",
        manifest_date: "2024-01-31 11:08:24",

        credit_note_date: "2024-04-17 00:00:00",
        return_date: "2024-04-17",

        manifest_no: "20240131110831",
        invoice_number: "CMH1-2324-908",
        credit_note_number: "RCKA1-2425-5",

        marketplace_credit_note_num: null,
        marketplace_invoice_num: null,

        batch_id: 1427390,
        batch_created_at: null,

        payment_mode: "COD",
        payment_mode_id: 2,

        credit_note_documents: null,
        credit_note_amount: 740.81299999999999,
        credit_note_tax_amount: 21.577200000000001,

        return_awb_number: null,
        reverse_carrier_name: null,
        return_type: null,

        buyer_gst: "NA",

        forward_shipment_customer_name: "a_xyz xyz",
        forward_shipment_customer_contact_num: "9876543212",
        forward_shipment_customer_address_line_1: "XYZ Road",
        forward_shipment_customer_address_line_2: "123",
        forward_shipment_customer_city: "Pune",
        forward_shipment_customer_pin_code: "421302",
        forward_shipment_customer_state: "Maharashtra",
        forward_shipment_customer_state_code: "27",
        forward_shipment_customer_country: "India",
        forward_shipment_customer_email: "asdf05@gmail.com",

        forward_shipment_billing_name: "a_xyz xyz",
        forward_shipment_billing_address_1: "XYZ Road",
        forward_shipment_billing_address_2: "123",
        forward_shipment_billing_city: "Pune",
        forward_shipment_billing_state: "Maharashtra",
        forward_shipment_billing_state_code: "27",
        forward_shipment_billing_pin_code: "421302",
        forward_shipment_billing_country: "India",
        forward_shipment_billing_mobile: "9876543212",

        order_quantity: 1,
        total_invoice_amount: 1050,
        total_invoice_tax: 30.582799999999999,
        invoice_collectable_amount: 1050,

        order_items: [
          {
            company_product_id: 84517008,
            product_id: 21616249,
            suborder_id: 179250755,
            suborder_num: "12395247435842",

            return_reason: "Complaint - Wrong Price",
            inventory_status: "QC Pass",
            shipment_type: "SelfShip",

            suborder_quantity: 1,
            returned_item_quantity: 1,

            tax_type: "GST",

            total_item_selling_price: "740.8127",
            credit_note_total_item_shipping_charge: 141.81300354003906,
            credit_note_total_item_miscellaneous: null,

            item_tax_rate: 3,
            credit_note_total_item_tax: 21.577200000000001,
            credit_note_total_item_excluding_tax: 719.23580000000004,

            sku: "nav01",
            productName: "nav01",
            description: null,
            category: "nav01",
            brand: "NAV01",
            model_no: "nav01",
            product_tax_code: null,
            AccountingSku: "nav01",
            ean: "NA",
            size: "m",

            cost: 100,
            mrp: 100,
            weight: 10,
            length: 10,
            width: 10,
            height: 10,

            item_type: "simple_product",
            parent_sku: null,
            gatepass_number: "",
            meta: null,

            breakup_types: {
              Item_Amount_Excluding_Tax: 581.55340000000001,
              Shipping_Excluding_Tax: 137.6824,
              Item_Amount_CGST: 8.7233000000000001,
              Shipping_CGST: 2.0653000000000001,
              Item_Amount_SGST: 8.7233000000000001,
              Shipping_SGST: 2.0653000000000001
            }
          }
        ]
      }
    ]
  ];

  const handleMarkReturn = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/webhook/mark-return-v2`,
        payload,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      setResponse(result.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Mark Return V2 failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>EasyEcom Mark Return V2</h2>

      <button onClick={handleMarkReturn} disabled={loading}>
        {loading ? "Processing..." : "Mark Return V2"}
      </button>

      {error && (
        <pre style={{ color: "red", marginTop: "20px" }}>
          {error}
        </pre>
      )}

      {response && (
        <pre style={{ marginTop: "20px" }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default MarkReturnV2;