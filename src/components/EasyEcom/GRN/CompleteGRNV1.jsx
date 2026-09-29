import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function CompleteGRNV1() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCompleteGRN = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    const payload = {
      buyerCompanyName: "Test Location 1",
      location_key: "ht7885084804",
      buyerCity: "Howrah",
      buyerCountry: "India",
      buyerStreet:
        "Jai mata di apartment 3rd floor near bandhu mahal, sapuipara, bally, howrah - 711227 ",
      buyerPincode: "711227",
      buyerState: "West Bengal",

      vendorCode: null,
      vendorName: "Test Location 1",
      vendor_gstn: "19ASSDFGCVGGHJJ",
      vendorCity: "Howrah",
      vendorCountry: "India",
      vendorStreet:
        "Jai mata di apartment 3rd floor near bandhu mahal, sapuipara, bally, howrah - 711227 ",
      vendorPincode: "711227",
      vendorState: "West Bengal",

      grnId: 462220,
      grnInvoiceNumber: "AutoGrn",
      grnInvoiceDate: "2023-10-10",
      grnCreatedAt: "2023-10-10 20:53:25",
      grnStatus: "Completed",

      poRefNum: "Auto PO",
      poNumber: 476834,
      poStatus: "Completed",
      poCreateDate: "2023-10-10 20:53:25",

      poOrderId: null,

      items: [
        {
          sku: "1001",

          lineItemNo: null,

          cpId: 77606740,

          mrp: 5000,

          accounting_sku: null,
          vendor_sku: null,
          accounting_unit: null,

          product_unique_code:
            "8981349877888",

          description: null,

          product_name:
            "Bwin Sport Watches 1022",

          received_quantity: 100,

          poQuantity: "100",

          poItemPrice: 9.9847,

          grnPrice: 10,

          colour: "BROWN",

          size: "12''",

          CGST: 0.0077,
          SGST: 0.0077,
          IGST: 0,

          TAX: 0.0154,

          tax_percentage: 18,

          totalTaxableValue: 998.47,

          grnTotalValue: 1000,

          totalTaxValue: 1.54,

          totalCGSTValue: 0.77,

          totalSGSTValue: 0.77,

          totalIGSTValue: 0
        }
      ]
    };

    try {
      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/webhook/complete-grn-v1`,
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
        "Complete GRN V1 Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Complete GRN V1 failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>EasyEcom Complete GRN V1</h2>

      <p>
        Endpoint:
        <strong>
          {" "}
          POST /api/easyecom/webhook/complete-grn-v1
        </strong>
      </p>

      <button
        type="button"
        onClick={handleCompleteGRN}
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Complete GRN V1"}
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

export default CompleteGRNV1;