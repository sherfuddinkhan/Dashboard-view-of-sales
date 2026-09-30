import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const initialForm = {
  customerId: "26564",
  companyName: "demop",
  email: "demop@gmail.com",
  password: "abcd1234",
  taxIdentificationNumber: "ABX1234EDER",
  contactNumber: "8888899999",
  country: "India",
  currency: "INR",
  description: "demo company",

  billingStreet: "HSR,Sector1",
  billingCity: "Mumbai",
  billingState: "Maharashtra",
  billingPostalCode: "400067",

  dispatchStreet: "HSR,Sector1",
  dispatchCity: "Mumbai",
  dispatchPostalCode: "400067",
  dispatchState: "Maharashtra",
};

const UpdateCustomerMaster = () => {
  const [form, setForm] = useState(initialForm);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateCustomer = async () => {
    setLoading(true);
    setError("");
    setData(null);

    try {
      const requiredFields = [
        ["customerId", "Customer ID"],
        ["companyName", "Company name"],
        ["email", "Email"],
        ["password", "Password"],
        ["contactNumber", "Contact number"],
        ["country", "Country"],
        ["currency", "Currency"],
        ["billingStreet", "Billing street"],
        ["billingCity", "Billing city"],
        ["billingState", "Billing state"],
        ["billingPostalCode", "Billing postal code"],
        ["dispatchStreet", "Dispatch street"],
        ["dispatchCity", "Dispatch city"],
        ["dispatchPostalCode", "Dispatch postal code"],
        ["dispatchState", "Dispatch state"],
      ];

      for (const [field, label] of requiredFields) {
        if (!String(form[field] ?? "").trim()) {
          throw new Error(`${label} is required`);
        }
      }

      const payload = {
        customerId: Number(form.customerId),
        companyName: form.companyName.trim(),
        email: form.email.trim(),
        password: form.password,
        taxIdentificationNumber:
          form.taxIdentificationNumber,
        contactNumber: form.contactNumber.trim(),
        country: form.country.trim(),
        currency: form.currency.trim(),
        description: form.description,

        billingStreet: form.billingStreet.trim(),
        billingCity: form.billingCity.trim(),
        billingState: form.billingState.trim(),
        billingPostalCode:
          form.billingPostalCode,

        dispatchStreet:
          form.dispatchStreet.trim(),
        dispatchCity: form.dispatchCity.trim(),
        dispatchPostalCode:
          form.dispatchPostalCode,
        dispatchState:
          form.dispatchState.trim(),
      };

      const response = await fetch(
        `${SERVER_URL}/api/Wholesale/UpdateCustomer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to update customer master"
        );
      }

      setData(result);
    } catch (err) {
      console.error(
        "Update Customer Master Error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while updating customer"
      );
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setForm(initialForm);
    setData(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "30px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Update Customer Master</h2>

      <p style={{ color: "#666" }}>
        Update customer master information in EasyEcom.
      </p>

      {/* Basic Information */}
      <div style={sectionStyle}>
        <h3>Basic Information</h3>

        <div style={gridStyle}>
          <InputField
            label="Customer ID"
            name="customerId"
            type="number"
            value={form.customerId}
            onChange={handleChange}
            placeholder="26564"
          />

          <InputField
            label="Company Name"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            placeholder="demop"
          />

          <InputField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="demop@gmail.com"
          />

          <InputField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="abcd1234"
          />

          <InputField
            label="Tax Identification Number"
            name="taxIdentificationNumber"
            value={form.taxIdentificationNumber}
            onChange={handleChange}
            placeholder="ABX1234EDER"
          />

          <InputField
            label="Contact Number"
            name="contactNumber"
            value={form.contactNumber}
            onChange={handleChange}
            placeholder="8888899999"
          />

          <InputField
            label="Country"
            name="country"
            value={form.country}
            onChange={handleChange}
            placeholder="India"
          />

          <InputField
            label="Currency"
            name="currency"
            value={form.currency}
            onChange={handleChange}
            placeholder="INR"
          />

          <InputField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="demo company"
          />
        </div>
      </div>

      {/* Billing Address */}
      <div style={sectionStyle}>
        <h3>Billing Address</h3>

        <div style={gridStyle}>
          <InputField
            label="Billing Street"
            name="billingStreet"
            value={form.billingStreet}
            onChange={handleChange}
            placeholder="HSR,Sector1"
          />

          <InputField
            label="Billing City"
            name="billingCity"
            value={form.billingCity}
            onChange={handleChange}
            placeholder="Mumbai"
          />

          <InputField
            label="Billing State"
            name="billingState"
            value={form.billingState}
            onChange={handleChange}
            placeholder="Maharashtra"
          />

          <InputField
            label="Billing Postal Code"
            name="billingPostalCode"
            value={form.billingPostalCode}
            onChange={handleChange}
            placeholder="400067"
          />
        </div>
      </div>

      {/* Dispatch Address */}
      <div style={sectionStyle}>
        <h3>Dispatch Address</h3>

        <div style={gridStyle}>
          <InputField
            label="Dispatch Street"
            name="dispatchStreet"
            value={form.dispatchStreet}
            onChange={handleChange}
            placeholder="HSR,Sector1"
          />

          <InputField
            label="Dispatch City"
            name="dispatchCity"
            value={form.dispatchCity}
            onChange={handleChange}
            placeholder="Mumbai"
          />

          <InputField
            label="Dispatch State"
            name="dispatchState"
            value={form.dispatchState}
            onChange={handleChange}
            placeholder="Maharashtra"
          />

          <InputField
            label="Dispatch Postal Code"
            name="dispatchPostalCode"
            value={form.dispatchPostalCode}
            onChange={handleChange}
            placeholder="400067"
          />
        </div>
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <button
          type="button"
          onClick={updateCustomer}
          disabled={loading}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            background: "#1976d2",
            color: "#fff",
            cursor: loading
              ? "not-allowed"
              : "pointer",
          }}
        >
          {loading
            ? "Updating..."
            : "Update Customer"}
        </button>

        <button
          type="button"
          onClick={clearForm}
          disabled={loading}
          style={{
            padding: "10px 20px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "12px",
            marginBottom: "20px",
            background: "#fdecea",
            color: "#b71c1c",
            border: "1px solid #f5c6cb",
            borderRadius: "5px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Response */}
      {data && (
        <div>
          <h3>Response</h3>

          <pre
            style={{
              background: "#f5f5f5",
              padding: "15px",
              borderRadius: "5px",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
}) => {
  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: "6px",
          fontWeight: "500",
        }}
      >
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
};

const sectionStyle = {
  border: "1px solid #ddd",
  borderRadius: "6px",
  padding: "20px",
  marginBottom: "20px",
  background: "#fafafa",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: "15px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  fontSize: "14px",
};

export default UpdateCustomerMaster;