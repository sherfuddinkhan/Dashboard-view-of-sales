import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const UpdateManifestDocument = () => {
  const [manifestNumber, setManifestNumber] = useState(
    "20251114155815828107475764076998"
  );

  const [manifestUrl, setManifestUrl] = useState(
    "https://ee-uploaded-files-oregon-staging.s3.us-west-2.amazonaws.com/Labels/1077/27521995576070.pdf?request-content-type=application/force-download"
  );

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setResponse(null);
    setError("");

    try {
      const payload = {
        manifest_number: manifestNumber,
        manifest_url: manifestUrl,
      };

      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/manifest/update-document`,
        payload
      );

      setResponse(result.data);
    } catch (err) {
      setError(
        err.response?.data
          ? JSON.stringify(err.response.data, null, 2)
          : err.message
      );
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h2>Update Manifest Document</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Manifest Number</label>

          <input
            type="text"
            value={manifestNumber}
            onChange={(e) => setManifestNumber(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Manifest URL</label>

          <input
            type="text"
            value={manifestUrl}
            onChange={(e) => setManifestUrl(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          />
        </div>

        <button type="submit">
          Update Manifest Document
        </button>
      </form>

      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
          <h3>Error</h3>
          <pre>{error}</pre>
        </div>
      )}

      {response && (
        <div style={{ marginTop: "20px" }}>
          <h3>Response</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default UpdateManifestDocument;

