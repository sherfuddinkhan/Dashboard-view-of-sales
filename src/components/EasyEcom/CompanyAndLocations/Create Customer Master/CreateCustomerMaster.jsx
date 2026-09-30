import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const CreateCustomerMaster = () => {
  const [form, setForm] = useState({
    companyName: "test customer",
    email: "testcustomer12@easyecom.io",
    password: "test@1234",
    taxIdentificationNumber: "ABC1523EDR34",
    contactNumber: "9036512345",
    country: "India",

    billingStateId: "2",
    billingStreet: "kaikondrahalli,sarjapur road",
    billingCity: "bangalore",
    billingPostalCode: "560035",

    currency: "INR",
    description: "",

    dispatchStateId: "2",
    dispatchStreet: "kaikondrahalli,sarjapur road",
    dispatchCity: "bangalore",
    dispatchPostalCode: "560035",

    invoiceSeriesCode: "25727",
    pricingGroupCode: "180",
    no_copy_master: "1",

    salesChannel: "Salon",
    salesmanUserId: "17123",

    discount0to999: "17",
    discount1000to2999: "20",
    discount3000to5999: "23",
    discount6000to99999999: "25",

    paymentTermName: "30 Days",
    paymentTermValue: "30",

    deliveryTermName: "10-15 Days",
    deliveryTermValue: "15",
  });

  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const createCustomer = async () => {
    setLoading(true);
    setError("");
    setResponseData(null);

    try {
      const requiredFields = [
        ["companyName", "Company Name"],
        ["email", "Email"],
        ["password", "Password"],
        ["contactNumber", "Contact Number"],
        ["country", "Country"],
        ["billingStateId", "Billing State ID"],
        ["billingStreet", "Billing Street"],
        ["billingCity", "Billing City"],
        ["billingPostalCode", "Billing Postal Code"],
        ["dispatchStateId", "Dispatch State ID"],
        ["dispatchStreet", "Dispatch Street"],
        ["dispatchCity", "Dispatch City"],
        ["dispatchPostalCode", "Dispatch Postal Code"],
        ["invoiceSeriesCode", "Invoice Series Code"],
        ["pricingGroupCode", "Pricing Group Code"],
        ["salesmanUserId", "Salesman User ID"],
      ];

      for (const [field, label] of requiredFields) {
        if (!form[field].trim()) {
          throw new Error(`${label} is required`);
        }
      }

      const requestBody = {
        companyName: form.companyName,
        email: form.email,
        password: form.password,
        taxIdentificationNumber:
          form.taxIdentificationNumber,

        contactNumber: form.contactNumber,
        country: form.country,

        billingStateId: Number(form.billingStateId),
        billingStreet: form.billingStreet,
        billingCity: form.billingCity,
        billingPostalCode: form.billingPostalCode,

        currency: form.currency,
        description: form.description,

        dispatchStateId: Number(form.dispatchStateId),
        dispatchStreet: form.dispatchStreet,
        dispatchCity: form.dispatchCity,
        dispatchPostalCode: form.dispatchPostalCode,

        invoiceSeriesCode: Number(
          form.invoiceSeriesCode
        ),

        pricingGroupCode: Number(
          form.pricingGroupCode
        ),

        no_copy_master: Number(
          form.no_copy_master
        ),

        salesChannel: form.salesChannel,

        salesmanUserId: Number(
          form.salesmanUserId
        ),

        b2bDiscountScheme: {
          "0-999": Number(form.discount0to999),
          "1000-2999": Number(
            form.discount1000to2999
          ),
          "3000-5999": Number(
            form.discount3000to5999
          ),
          "6000-99999999": Number(
            form.discount6000to99999999
          ),
        },

        customerAttributes: {
          paymentTerm: {
            name: form.paymentTermName,
            value: form.paymentTermValue,
          },

          deliveryTerm: {
            name: form.deliveryTermName,
            value: form.deliveryTermValue,
          },
        },
      };

      const response = await fetch(
        `${SERVER_URL}/api/Wholesale/CreateCustomer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create customer"
        );
      }

      setResponseData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setForm({
      companyName: "",
      email: "",
      password: "",
      taxIdentificationNumber: "",
      contactNumber: "",
      country: "India",

      billingStateId: "",
      billingStreet: "",
      billingCity: "",
      billingPostalCode: "",

      currency: "INR",
      description: "",

      dispatchStateId: "",
      dispatchStreet: "",
      dispatchCity: "",
      dispatchPostalCode: "",

      invoiceSeriesCode: "",
      pricingGroupCode: "",
      no_copy_master: "1",

      salesChannel: "",
      salesmanUserId: "",

      discount0to999: "",
      discount1000to2999: "",
      discount3000to5999: "",
      discount6000to99999999: "",

      paymentTermName: "",
      paymentTermValue: "",

      deliveryTermName: "",
      deliveryTermValue: "",
    });

    setResponseData(null);
    setError("");
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    boxSizing: "border-box",
    border: "1px solid #ccc",
    borderRadius: "4px",
  };

  const fieldStyle = {
    marginBottom: "15px",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontWeight: "bold",
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "25px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Create Customer Master</h2>

      {/* Basic Information */}
      <h3>Basic Information</h3>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Company Name
        </label>
        <input
          name="companyName"
          value={form.companyName}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Email
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Password
        </label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Tax Identification Number
        </label>
        <input
          name="taxIdentificationNumber"
          value={form.taxIdentificationNumber}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Contact Number
        </label>
        <input
          name="contactNumber"
          value={form.contactNumber}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Country
        </label>
        <input
          name="country"
          value={form.country}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      {/* Billing */}
      <h3>Billing Address</h3>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Billing State ID
        </label>
        <input
          type="number"
          name="billingStateId"
          value={form.billingStateId}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Billing Street
        </label>
        <input
          name="billingStreet"
          value={form.billingStreet}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Billing City
        </label>
        <input
          name="billingCity"
          value={form.billingCity}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Billing Postal Code
        </label>
        <input
          name="billingPostalCode"
          value={form.billingPostalCode}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      {/* Other */}
      <h3>Customer Settings</h3>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Currency
        </label>
        <input
          name="currency"
          value={form.currency}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Description
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows="3"
          style={inputStyle}
        />
      </div>

      {/* Dispatch */}
      <h3>Dispatch Address</h3>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Dispatch State ID
        </label>
        <input
          type="number"
          name="dispatchStateId"
          value={form.dispatchStateId}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Dispatch Street
        </label>
        <input
          name="dispatchStreet"
          value={form.dispatchStreet}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Dispatch City
        </label>
        <input
          name="dispatchCity"
          value={form.dispatchCity}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Dispatch Postal Code
        </label>
        <input
          name="dispatchPostalCode"
          value={form.dispatchPostalCode}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      {/* Pricing */}
      <h3>Pricing</h3>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Invoice Series Code
        </label>
        <input
          type="number"
          name="invoiceSeriesCode"
          value={form.invoiceSeriesCode}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Pricing Group Code
        </label>
        <input
          type="number"
          name="pricingGroupCode"
          value={form.pricingGroupCode}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          No Copy Master
        </label>

        <select
          name="no_copy_master"
          value={form.no_copy_master}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="1">1 - Yes</option>
          <option value="0">0 - No</option>
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Sales Channel
        </label>
        <input
          name="salesChannel"
          value={form.salesChannel}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Salesman User ID
        </label>
        <input
          type="number"
          name="salesmanUserId"
          value={form.salesmanUserId}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      {/* B2B Discount */}
      <h3>B2B Discount Scheme</h3>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          0 - 999
        </label>
        <input
          type="number"
          name="discount0to999"
          value={form.discount0to999}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          1000 - 2999
        </label>
        <input
          type="number"
          name="discount1000to2999"
          value={form.discount1000to2999}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          3000 - 5999
        </label>
        <input
          type="number"
          name="discount3000to5999"
          value={form.discount3000to5999}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          6000 - 99999999
        </label>
        <input
          type="number"
          name="discount6000to99999999"
          value={form.discount6000to99999999}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      {/* Customer Attributes */}
      <h3>Customer Attributes</h3>

      <h4>Payment Term</h4>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Name
        </label>
        <input
          name="paymentTermName"
          value={form.paymentTermName}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Value
        </label>
        <input
          name="paymentTermValue"
          value={form.paymentTermValue}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <h4>Delivery Term</h4>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Name
        </label>
        <input
          name="deliveryTermName"
          value={form.deliveryTermName}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Value
        </label>
        <input
          name="deliveryTermValue"
          value={form.deliveryTermValue}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "25px",
        }}
      >
        <button
          onClick={createCustomer}
          disabled={loading}
          style={{
            padding: "10px 18px",
            backgroundColor: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: loading
              ? "not-allowed"
              : "pointer",
          }}
        >
          {loading
            ? "Creating..."
            : "Create Customer"}
        </button>

        <button
          onClick={clearForm}
          disabled={loading}
          style={{
            padding: "10px 18px",
            backgroundColor: "#777",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: loading
              ? "not-allowed"
              : "pointer",
          }}
        >
          Clear
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            backgroundColor: "#ffebee",
            color: "#c62828",
            border: "1px solid #ef9a9a",
            borderRadius: "4px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Response */}
      {responseData && (
        <div style={{ marginTop: "25px" }}>
          <h3>Response</h3>

          <pre
            style={{
              backgroundColor: "#f5f5f5",
              padding: "15px",
              borderRadius: "5px",
              overflowX: "auto",
              border: "1px solid #ddd",
            }}
          >
            {JSON.stringify(
              responseData,
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
};

export default CreateCustomerMaster;