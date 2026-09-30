import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function OrderTrackingV1() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const payload = [
    {
      last_status_update: "2025-08-04 17:14:42",
      suborder_id: 593386965,
      suborder_company_id: 82013,
      master_carrier_id: 52380,
      tier: 1,
      carrier_id: 52532,
      status_id: 7,
      shipping_status_id: 19,

      reference_code: "SonicTest06",
      awbNumber: "1001967",

      invoiceId: 433004681,
      orderId: 358545888,

      invoiceAmount: 45497,
      tax: 6940.2200000000003,

      shippingHistory: null,
      currentShippingStatus: "Out For Pickup",

      expectedDeliveryDate: "2025-08-05 18:00:41",

      carrierName: "Sonic",

      orderDate: "2025-08-04 13:30:33",
      invoiceDate: "2025-08-04",

      orderStatus: "Shipped",

      companyName: "Gugris",
      companyLogo: null,

      city: "Delhi",
      state: "Maharashtra",
      pin_code: "400001",

      awb_generation_type: 5,

      expectedDeliveryDateStart: null,
      expectedDeliveryDateEnd: null,

      items: [
        "Test Group of product (Test GOP) X 1",
        "MSI GT77 Titan (Laptop1) X 1",
        "DLV-KIT1 (DLV-KIT1) X 1"
      ],

      last_status: null,

      edd_month: "August",
      edd_year: "2025",
      edd_day: "05",

      notes: [],

      location_key: "en6726132169"
    }
  ];

  const handleOrderTracking = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/webhook/order-tracking-v1`,
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
        "Order Tracking V1 failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>EasyEcom Order Tracking V1</h2>

      <button
        onClick={handleOrderTracking}
        disabled={loading}
      >
        {loading
          ? "Processing..."
          : "Send Order Tracking V1"}
      </button>

      {error && (
        <pre
          style={{
            color: "red",
            marginTop: "20px"
          }}
        >
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

export default OrderTrackingV1;