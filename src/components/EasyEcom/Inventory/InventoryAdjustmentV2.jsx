import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function InventoryAdjustmentV2() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInventoryAdjustment = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    const payload = {
      companyName: "testLOTnon-serial",
      locationKey: "ee31777697169",
      adjustmentBatchCode: "1",

      cycleCountId: null,
      bin: null,
      ccCreationDate: null,
      ccStartedAt: null,
      ccCompletionDate: null,
      ccModeType: null,
      ccStatus: null,
      createdBy: null,
      floorStaff: null,

      items: [
        {
          sku: "child001",
          serial: null,
          cpId: 161520900,

          accounting_sku: null,
          vendor_sku: "",
          accounting_unit: null,
          product_unique_code: null,

          product_name: "child001",

          mrp: 344,
          size: "M",
          color: "red",

          batchCode: "BH01",

          oldStatus: "Available",
          newStatus: "Available",

          oldBin: "A001",
          newBin: "A002",

          old_bin_zone: "bulk01",
          new_bin_zone: "bulk01",

          quantity: 1,

          Participating_CCIds: null,

          adjustmentTime: "2025-09-15 18:39:46",
          adjustmentAddedBy: "boy02 Test",

          adjustmentType: "Bin to Bin"
        }
      ]
    };

    try {
      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/webhook/inventory-adjustment-v2`,
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
        "Inventory Adjustment V2 Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Inventory Adjustment V2 failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>EasyEcom Inventory Adjustment V2</h2>

      <p>
        Endpoint:
        <strong>
          {" "}
          POST /api/easyecom/webhook/inventory-adjustment-v2
        </strong>
      </p>

      <button
        type="button"
        onClick={handleInventoryAdjustment}
        disabled={loading}
      >
        {loading
          ? "Sending..."
          : "Send Inventory Adjustment V2"}
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

export default InventoryAdjustmentV2;