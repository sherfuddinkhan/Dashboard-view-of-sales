import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function GetSaleOrder() {
  const [code, setCode] = useState("");
  const [facilityCodes, setFacilityCodes] = useState("");
  const [paymentDetailRequired, setPaymentDetailRequired] = useState(false);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setResponse(null);
    setError("");

    try {
      if (!code.trim()) {
        throw new Error("Sale order code is required.");
      }

      const payload = {
        code: code.trim(),
        paymentDetailRequired,
      };

      const facilities = facilityCodes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (facilities.length > 0) {
        payload.facilityCodes = facilities;
      }

      const result = await axios.post(
        `${SERVER_URL}/api/uniware/sale-orders/get`,
        payload
      );

      setResponse(result.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.message ||
          err.message ||
          "Failed to fetch sale order."
      );
    } finally {
      setLoading(false);
    }
  };

  const saleOrder = response?.saleOrderDTO;

  return (
    <div>
      <h2>Get Sale Order</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Sale Order Code</label>
          <input
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="SO1016233"
          />
        </div>

        <div>
          <label>Facility Codes</label>
          <input
            type="text"
            value={facilityCodes}
            onChange={(event) => setFacilityCodes(event.target.value)}
            placeholder="MAIN, DELHI"
          />
          <small>Optional. Separate multiple codes with commas.</small>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={paymentDetailRequired}
              onChange={(event) =>
                setPaymentDetailRequired(event.target.checked)
              }
            />
            Payment Detail Required
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Get Sale Order"}
        </button>
      </form>

      {error && (
        <div>
          <strong>Error:</strong> {error}
        </div>
      )}

      {saleOrder && (
        <div>
          <h3>Sale Order Details</h3>

          <p>
            <strong>Code:</strong> {saleOrder.code || "N/A"}
          </p>

          <p>
            <strong>Display Order Code:</strong>{" "}
            {saleOrder.displayOrderCode || "N/A"}
          </p>

          <p>
            <strong>Channel:</strong> {saleOrder.channel || "N/A"}
          </p>

          <p>
            <strong>Status:</strong> {saleOrder.status || "N/A"}
          </p>

          <p>
            <strong>Customer:</strong> {saleOrder.customerCode || "N/A"}
          </p>

          <p>
            <strong>Currency:</strong> {saleOrder.currencyCode || "N/A"}
          </p>

          <p>
            <strong>COD:</strong> {saleOrder.cod ? "Yes" : "No"}
          </p>

          <h4>Billing Address</h4>

          <p>
            {saleOrder.billingAddress?.name || "N/A"}
            <br />
            {saleOrder.billingAddress?.addressLine1 || ""}
            <br />
            {saleOrder.billingAddress?.addressLine2 || ""}
            <br />
            {saleOrder.billingAddress?.city || ""}
            {saleOrder.billingAddress?.state
              ? `, ${saleOrder.billingAddress.state}`
              : ""}
            {saleOrder.billingAddress?.pincode
              ? ` - ${saleOrder.billingAddress.pincode}`
              : ""}
            <br />
            {saleOrder.billingAddress?.phone || ""}
            <br />
            {saleOrder.billingAddress?.email || ""}
          </p>

          <h4>Sale Order Items</h4>

          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>SKU</th>
                <th>Item Name</th>
                <th>Facility</th>
                <th>Quantity</th>
                <th>Selling Price</th>
                <th>Total Price</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {(saleOrder.saleOrderItems || []).map((item) => (
                <tr key={item.id || item.code}>
                  <td>{item.code || "N/A"}</td>
                  <td>{item.itemSku || "N/A"}</td>
                  <td>{item.itemName || "N/A"}</td>
                  <td>{item.facilityName || item.facilityCode || "N/A"}</td>
                  <td>{item.quantity || 1}</td>
                  <td>{item.sellingPrice ?? 0}</td>
                  <td>{item.totalPrice ?? 0}</td>
                  <td>{item.statusCode || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4>Payment</h4>

          <p>
            <strong>Payment Mode:</strong>{" "}
            {saleOrder.paymentDetail?.paymentMode || "N/A"}
          </p>

          <p>
            <strong>Transaction ID:</strong>{" "}
            {saleOrder.paymentDetail?.transactionId || "N/A"}
          </p>

          <p>
            <strong>Amount Paid:</strong>{" "}
            {saleOrder.paymentDetail?.amountPaid ?? 0}
          </p>

          <details>
            <summary>Raw Response</summary>
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}

export default GetSaleOrder;