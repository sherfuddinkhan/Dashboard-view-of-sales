import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function CreateLocation() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateLocation = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    const payload = {
      phone: 9876543210,
      company_name: "Test api location",
      email: "testlocation@gmail.com",

      client_id: "abcdTest1234",
      branding_user_id: "ee31234",
      password: "Test@1234",

      companyLevelTaxRate: 5,
      confirm_without_inventory: 0,
      copyMaster: 1,
      manageInventory: 1,

      shipping_address: {
        address_line_1: "address_line_1",
        address_line_2: "address_line_2",
        state_code: "UP",
        pin_code: 400067,
        country: "India"
      },

      billing_address: {
        address_line_1: "address_line_1",
        address_line_2: "address_line_2",
        state_code: "UP",
        pin_code: 400067,
        country: "India"
      }
    };

    try {
      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/create-location`,
        payload
      );

      setResponse(result.data);
    } catch (err) {
      console.error("Create Location Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Create Location failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>EasyEcom Create Client Location</h2>

      <p>
        POST <strong>/createLocation</strong>
      </p>

      <button
        type="button"
        onClick={handleCreateLocation}
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Location"}
      </button>

      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
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

export default CreateLocation;