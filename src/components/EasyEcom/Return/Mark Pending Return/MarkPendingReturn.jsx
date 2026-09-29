import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const MarkPendingReturn = () => {
  const [request, setRequest] = useState([
    {
      reference_code: "US-11",
      suborder_number: "OD1100000022345",
      parent_sku: "cello01",
      child_sku: "cello01",
      initiated_return_date: "2022-06-22",
      return_reason: "Damaged",
      return_quantity: 1,
      return_awb: "3458",
      return_carrier_name: "abcd",
      return_type: "Customer return",
      mpRefId: "98765",
    },
    {
      reference_code: "US-12",
      suborder_number: "",
      parent_sku: "cello01",
      child_sku: "cello01",
      initiated_return_date: "2022-06-23",
      return_reason: "Lost",
      return_quantity: 1,
      return_awb: "3458",
      return_carrier_name: "abcd",
      return_type: "Courier return",
      mpRefId: "abc124",
    },
  ]);

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (index, field, value) => {
    setRequest((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]:
                field === "return_quantity"
                  ? Number(value)
                  : value,
            }
          : item
      )
    );
  };

  const addReturn = () => {
    setRequest((prev) => [
      ...prev,
      {
        reference_code: "",
        suborder_number: "",
        parent_sku: "",
        child_sku: "",
        initiated_return_date: "",
        return_reason: "",
        return_quantity: 1,
        return_awb: "",
        return_carrier_name: "",
        return_type: "",
        mpRefId: "",
      },
    ]);
  };

  const removeReturn = (index) => {
    setRequest((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setResponse(null);
    setError("");
    setLoading(true);

    try {
      const payload = {
        request,
      };

      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/mark-pending-return`,
        payload
      );

      setResponse(result.data);
    } catch (err) {
      setError(
        err.response?.data
          ? JSON.stringify(err.response.data, null, 2)
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    ["reference_code", "Reference Code"],
    ["suborder_number", "Suborder Number"],
    ["parent_sku", "Parent SKU"],
    ["child_sku", "Child SKU"],
    ["initiated_return_date", "Initiated Return Date"],
    ["return_reason", "Return Reason"],
    ["return_quantity", "Return Quantity"],
    ["return_awb", "Return AWB"],
    ["return_carrier_name", "Return Carrier Name"],
    ["return_type", "Return Type"],
    ["mpRefId", "MP Ref ID"],
  ];

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1000px",
        margin: "auto",
      }}
    >
      <h2>Mark Pending Return</h2>

      <form onSubmit={handleSubmit}>
        {request.map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              marginBottom: "20px",
              borderRadius: "8px",
            }}
          >
            <h3>Return #{index + 1}</h3>

            {fields.map(([field, label]) => (
              <div
                key={field}
                style={{ marginBottom: "12px" }}
              >
                <label>{label}</label>

                <input
                  type={
                    field === "return_quantity"
                      ? "number"
                      : field === "initiated_return_date"
                      ? "date"
                      : "text"
                  }
                  value={item[field]}
                  onChange={(e) =>
                    handleChange(
                      index,
                      field,
                      e.target.value
                    )
                  }
                  required={
                    field !== "suborder_number"
                  }
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px",
                    marginTop: "5px",
                  }}
                />
              </div>
            ))}

            {request.length > 1 && (
              <button
                type="button"
                onClick={() => removeReturn(index)}
              >
                Remove Return
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addReturn}
          style={{ marginRight: "10px" }}
        >
          + Add Return
        </button>

        <button type="submit" disabled={loading}>
          {loading
            ? "Submitting..."
            : "Mark Pending Return"}
        </button>
      </form>

      {error && (
        <div
          style={{
            marginTop: "20px",
            color: "red",
          }}
        >
          <h3>Error</h3>
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
};

export default MarkPendingReturn;

