import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function MarkReturnV1() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const payload = {
    credit_notes: [
      {
        credit_note_id: 11235368,
        invoice_id: 184073228,
        order_id: 150683877,
        reference_code: "Test345_12",
        company_name: "EasyEcom Test Company",
        location_key: "wo3484777024",
        warehouseId: 59032,
        seller_gst: "",
        forward_shipment_pickup_address: "Pathardi phata ",
        forward_shipment_pickup_city: "Nashik",
        forward_shipment_pickup_state: "Maharashtra",
        forward_shipment_pickup_state_code: "27",
        forward_shipment_pickup_pin_code: "422010",
        forward_shipment_pickup_country: "India",
        order_type: "B2C",
        order_type_key: "retailorder",
        replacement_order: 0,
        marketplace: "Offline",
        marketplace_id: 10,
        salesmanUserId: 0,
        order_date: "2023-10-19 05:30:00",
        invoice_date: "2023-10-19 00:00:00",
        import_date: "2023-10-19 16:39:26",
        last_update_date: "2023-10-19 19:09:43",
        manifest_date: "2023-10-19 18:46:49",
        credit_note_date: "2023-10-19 00:00:00",
        return_date: "2023-10-19",
        manifest_no: "20231019064649_10_28865_990",
        invoice_number: "CKA1-2324-41",
        credit_note_number: "RCKA1-2324-36",
        marketplace_credit_note_num: null,
        marketplace_invoice_num: null,
        batch_id: null,
        batch_created_at: null,
        payment_mode: "PrePaid",
        payment_mode_id: 5,
        credit_note_documents: null,
        credit_note_amount: 0,
        credit_note_tax_amount: 0,
        return_awb_number: null,
        return_type: null,
        buyer_gst: "NA",

        forward_shipment_customer_name: "Test",
        forward_shipment_customer_contact_num: "8899776654",
        forward_shipment_customer_address_line_1: "H15",
        forward_shipment_customer_address_line_2: null,
        forward_shipment_customer_city: "Delhi",
        forward_shipment_customer_pin_code: "887654",
        forward_shipment_customer_state: "Delhi",
        forward_shipment_customer_state_code: "07",
        forward_shipment_customer_country: "India",
        forward_shipment_customer_email: "test@gmail.com",

        forward_shipment_billing_name: "Test",
        forward_shipment_billing_address_1: "H15",
        forward_shipment_billing_address_2: null,
        forward_shipment_billing_city: "Delhi",
        forward_shipment_billing_state: "Delhi",
        forward_shipment_billing_state_code: "07",
        forward_shipment_billing_pin_code: "887654",
        forward_shipment_billing_country: "India",
        forward_shipment_billing_mobile: "8899776654",

        order_quantity: 1,
        total_invoice_amount: 0,
        total_invoice_tax: 0,
        invoice_collectable_amount: 0,

        items: [
          {
            company_product_id: 77827976,
            product_id: 19842847,
            suborder_id: 234097687,
            suborder_num: "5903216977137668438512",
            return_reason: "Complaint - Unknown",
            inventory_status: "QC Pass",
            shipment_type: "SelfShip",
            suborder_quantity: 1,
            returned_item_quantity: 1,
            tax_type: "GST",
            total_item_selling_price: null,
            credit_note_total_item_shipping_charge: null,
            credit_note_total_item_miscellaneous: null,
            item_tax_rate: 18,
            credit_note_total_item_tax: 0,
            credit_note_total_item_excluding_tax: 0,
            sku: "Dip1011",
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
            item_type: "simple_product",
            parent_sku: null,
            gatepass_number: "",
            meta: null
          }
        ]
      }
    ],
    nextUrl: null
  };

  const handleMarkReturn = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/webhook/mark-return-v1`,
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
        "Mark Return V1 failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>EasyEcom Mark Return V1</h2>

      <button onClick={handleMarkReturn} disabled={loading}>
        {loading ? "Processing..." : "Mark Return V1"}
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

export default MarkReturnV1;