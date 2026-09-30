import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const CreateASN = () => {
  const [formData, setFormData] = useState({
    po_id: "370548",
    vendor_token: "wo9779627664",
    expected_delivery_date: "2025-10-25",
    awb_number: "AWB123676767",
    shipment_date: "2025-04-26",
    challan_no: "CH123787",
    challan_date: "2025-04-20",
    invoice_no: "INV989090",
    invoice_date: "2025-04-19",
    total_boxes: "10",
    courier_name: "DELHIVERY",
    vehicle_no: "AP31AB1121",
    eway_bill_no: "EWB11545454",
  });

  const [asnDetails, setAsnDetails] = useState([
    {
      sku: "FG020",
      quantity: 80,
      mrp: 10,
      batch_code: "batch01",
      mfg_date: "2025-01-01",
      expiry_date: "2029-02-01",
      box_id: 12,
    },
    {
      sku: "FG021",
      quantity: 2524,
      mrp: 10,
      batch_code: "batch01",
      mfg_date: "2025-01-01",
      expiry_date: "2029-02-01",
      box_id: 12,
    },
    {
      sku: "FG022",
      quantity: 2523,
      mrp: 10,
      batch_code: "batch01",
      mfg_date: "2025-01-01",
      expiry_date: "2029-02-01",
      box_id: 12,
    },
    {
      sku: "FG023",
      quantity: 252,
      mrp: 10,
      batch_code: "batch01",
      mfg_date: "2025-01-01",
      expiry_date: "2029-02-01",
      box_id: 12,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [responseData, setResponseData] = useState(null);

  // =====================================================
  // Main form change
  // =====================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // ASN item change
  // =====================================================
  const handleASNDetailChange = (index, e) => {
    const { name, value } = e.target;

    setAsnDetails((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [name]: value,
            }
          : item
      )
    );
  };

  // =====================================================
  // Add ASN item
  // =====================================================
  const addASNDetail = () => {
    setAsnDetails((prev) => [
      ...prev,
      {
        sku: "",
        quantity: 0,
        mrp: 0,
        batch_code: "",
        mfg_date: "",
        expiry_date: "",
        box_id: 0,
      },
    ]);
  };

  // =====================================================
  // Remove ASN item
  // =====================================================
  const removeASNDetail = (index) => {
    setAsnDetails((prev) =>
      prev.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  // =====================================================
  // Submit
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");
    setResponseData(null);

    try {
      const payload = {
        po_id: formData.po_id,
        vendor_token: formData.vendor_token,
        expected_delivery_date:
          formData.expected_delivery_date,
        awb_number: formData.awb_number,
        shipment_date: formData.shipment_date,
        challan_no: formData.challan_no,
        challan_date: formData.challan_date,
        invoice_no: formData.invoice_no,
        invoice_date: formData.invoice_date,
        total_boxes: formData.total_boxes,
        courier_name: formData.courier_name,
        vehicle_no: formData.vehicle_no,
        eway_bill_no: formData.eway_bill_no,

        asn_details: asnDetails.map((item) => ({
          sku: item.sku,
          quantity: Number(item.quantity),
          mrp: Number(item.mrp),
          batch_code: item.batch_code,
          mfg_date: item.mfg_date,
          expiry_date: item.expiry_date,
          box_id: Number(item.box_id),
        })),
      };

      const response = await fetch(
        `${SERVER_URL}/api/wms/createASNSummaryAndASNDetails`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message ||
            data?.message ||
            "Failed to create ASN"
        );
      }

      setMessage(
        data.message || "ASN created successfully"
      );

      setResponseData(data);
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Failed to create ASN"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // Clear
  // =====================================================
  const handleClear = () => {
    setFormData({
      po_id: "",
      vendor_token: "",
      expected_delivery_date: "",
      awb_number: "",
      shipment_date: "",
      challan_no: "",
      challan_date: "",
      invoice_no: "",
      invoice_date: "",
      total_boxes: "",
      courier_name: "",
      vehicle_no: "",
      eway_bill_no: "",
    });

    setAsnDetails([
      {
        sku: "",
        quantity: 0,
        mrp: 0,
        batch_code: "",
        mfg_date: "",
        expiry_date: "",
        box_id: 0,
      },
    ]);

    setMessage("");
    setError("");
    setResponseData(null);
  };

  return (
    <div
      style={{
        maxWidth: "1150px",
        margin: "30px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Create ASN</h2>

      <p>
        <strong>EasyEcom API:</strong>{" "}
        POST /wms/createASNSummaryAndASNDetails
      </p>

      <form onSubmit={handleSubmit}>
        {/* =====================================================
            ASN Summary
        ===================================================== */}

        <h3>ASN Summary</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "15px",
            marginBottom: "30px",
          }}
        >
          <InputField
            label="PO ID"
            name="po_id"
            value={formData.po_id}
            onChange={handleChange}
            required
          />

          <InputField
            label="Vendor Token"
            name="vendor_token"
            value={formData.vendor_token}
            onChange={handleChange}
            required
          />

          <InputField
            label="Expected Delivery Date"
            name="expected_delivery_date"
            type="date"
            value={formData.expected_delivery_date}
            onChange={handleChange}
          />

          <InputField
            label="AWB Number"
            name="awb_number"
            value={formData.awb_number}
            onChange={handleChange}
          />

          <InputField
            label="Shipment Date"
            name="shipment_date"
            type="date"
            value={formData.shipment_date}
            onChange={handleChange}
          />

          <InputField
            label="Challan Number"
            name="challan_no"
            value={formData.challan_no}
            onChange={handleChange}
          />

          <InputField
            label="Challan Date"
            name="challan_date"
            type="date"
            value={formData.challan_date}
            onChange={handleChange}
          />

          <InputField
            label="Invoice Number"
            name="invoice_no"
            value={formData.invoice_no}
            onChange={handleChange}
          />

          <InputField
            label="Invoice Date"
            name="invoice_date"
            type="date"
            value={formData.invoice_date}
            onChange={handleChange}
          />

          <InputField
            label="Total Boxes"
            name="total_boxes"
            type="number"
            value={formData.total_boxes}
            onChange={handleChange}
            min="0"
          />

          <InputField
            label="Courier Name"
            name="courier_name"
            value={formData.courier_name}
            onChange={handleChange}
          />

          <InputField
            label="Vehicle Number"
            name="vehicle_no"
            value={formData.vehicle_no}
            onChange={handleChange}
          />

          <InputField
            label="E-Way Bill Number"
            name="eway_bill_no"
            value={formData.eway_bill_no}
            onChange={handleChange}
          />
        </div>

        {/* =====================================================
            ASN Details
        ===================================================== */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h3>ASN Details</h3>

          <button
            type="button"
            onClick={addASNDetail}
            style={buttonStyle}
          >
            + Add Item
          </button>
        </div>

        {asnDetails.map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h4>ASN Item {index + 1}</h4>

              {asnDetails.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeASNDetail(index)}
                  style={{
                    ...buttonStyle,
                    backgroundColor: "#d32f2f",
                  }}
                >
                  Remove
                </button>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "15px",
              }}
            >
              <InputField
                label="SKU"
                name="sku"
                value={item.sku}
                onChange={(e) =>
                  handleASNDetailChange(index, e)
                }
                required
              />

              <InputField
                label="Quantity"
                name="quantity"
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  handleASNDetailChange(index, e)
                }
                min="0"
                required
              />

              <InputField
                label="MRP"
                name="mrp"
                type="number"
                value={item.mrp}
                onChange={(e) =>
                  handleASNDetailChange(index, e)
                }
                min="0"
                step="0.01"
              />

              <InputField
                label="Batch Code"
                name="batch_code"
                value={item.batch_code}
                onChange={(e) =>
                  handleASNDetailChange(index, e)
                }
              />

              <InputField
                label="Manufacturing Date"
                name="mfg_date"
                type="date"
                value={item.mfg_date}
                onChange={(e) =>
                  handleASNDetailChange(index, e)
                }
              />

              <InputField
                label="Expiry Date"
                name="expiry_date"
                type="date"
                value={item.expiry_date}
                onChange={(e) =>
                  handleASNDetailChange(index, e)
                }
              />

              <InputField
                label="Box ID"
                name="box_id"
                type="number"
                value={item.box_id}
                onChange={(e) =>
                  handleASNDetailChange(index, e)
                }
                min="0"
              />
            </div>
          </div>
        ))}

        {/* =====================================================
            Actions
        ===================================================== */}

        <div style={{ marginTop: "20px" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              marginRight: "10px",
            }}
          >
            {loading ? "Creating..." : "Create ASN"}
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            style={{
              ...buttonStyle,
              backgroundColor: "#757575",
            }}
          >
            Clear
          </button>
        </div>
      </form>

      {/* =====================================================
          Success
      ===================================================== */}

      {message && (
        <div
          style={{
            padding: "12px",
            marginTop: "20px",
            backgroundColor: "#e8f5e9",
            color: "#2e7d32",
            borderRadius: "4px",
          }}
        >
          {message}
        </div>
      )}

      {/* =====================================================
          Error
      ===================================================== */}

      {error && (
        <div
          style={{
            padding: "12px",
            marginTop: "20px",
            backgroundColor: "#ffebee",
            color: "#c62828",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}

      {/* =====================================================
          API Response
      ===================================================== */}

      {responseData && (
        <div style={{ marginTop: "25px" }}>
          <h3>API Response</h3>

          <pre
            style={{
              backgroundColor: "#f5f5f5",
              padding: "15px",
              borderRadius: "5px",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {JSON.stringify(responseData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

// =====================================================
// Reusable Input
// =====================================================

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  min,
  step,
}) => {
  return (
    <div>
      <label>
        {label}
        {required && " *"}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        step={step}
        style={inputStyle}
      />
    </div>
  );
};

// =====================================================
// Styles
// =====================================================

const inputStyle = {
  width: "100%",
  padding: "9px",
  marginTop: "5px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  boxSizing: "border-box",
};

const buttonStyle = {
  padding: "10px 18px",
  border: "none",
  borderRadius: "4px",
  backgroundColor: "#1976d2",
  color: "#fff",
  cursor: "pointer",
};

export default CreateASN;