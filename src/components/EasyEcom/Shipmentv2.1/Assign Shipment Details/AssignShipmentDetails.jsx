import React, { useState } from "react";

const AssignShipmentDetails = () => {
  const [formData, setFormData] = useState({
    invoiceId: "62288140",
    courier: "Handover",
    awbNum: "89078766787",
    companyCarrierId: "4714",
    shippingLabelUrl:
      "https://s3-us-west-2.amazonaws.com/ee-uploaded-files-oregon/Labels/31/53768436.pdf",
    invoiceUrl:
      "https://s3-us-west-2.amazonaws.com/ee-uploaded-files-oregon/NewMarketplaceInvoice/8/62838396.pdf?request-content-type=application/force-download",
    origin_code: "65489",
    destination_code: "165489",
  });

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const payload = {
        ...formData,
        companyCarrierId: Number(formData.companyCarrierId),
      };

      const res = await fetch(
        "http://localhost:5000/api/easyecom/carrier/assign-awb",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Assign Shipment Details failed"
        );
      }

      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "30px auto",
        padding: "20px",
      }}
    >
      <h2>Assign Shipment Details</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Invoice ID</label>
          <input
            type="text"
            name="invoiceId"
            value={formData.invoiceId}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Courier</label>
          <input
            type="text"
            name="courier"
            value={formData.courier}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>AWB Number</label>
          <input
            type="text"
            name="awbNum"
            value={formData.awbNum}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Company Carrier ID</label>
          <input
            type="number"
            name="companyCarrierId"
            value={formData.companyCarrierId}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Shipping Label URL</label>
          <input
            type="url"
            name="shippingLabelUrl"
            value={formData.shippingLabelUrl}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Invoice URL</label>
          <input
            type="url"
            name="invoiceUrl"
            value={formData.invoiceUrl}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Origin Code</label>
          <input
            type="text"
            name="origin_code"
            value={formData.origin_code}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Destination Code</label>
          <input
            type="text"
            name="destination_code"
            value={formData.destination_code}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Assigning..." : "Assign Shipment Details"}
        </button>
      </form>

      {error && (
        <div
          style={{
            marginTop: "20px",
            color: "red",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div style={{ marginTop: "20px" }}>
          <h3>Response</h3>

          <pre
            style={{
              background: "#f5f5f5",
              padding: "15px",
              overflowX: "auto",
            }}
          >
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AssignShipmentDetails;

