import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function ApproveReversePickup() {
  const [facility, setFacility] =
    useState("MAIN");

  const [codes, setCodes] = useState([
    "",
  ]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [result, setResult] =
    useState(null);

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d0d5dd",
    borderRadius: 6,
    boxSizing: "border-box",
  };

  const updateCode = (index, value) => {
    setCodes((prev) =>
      prev.map((code, i) =>
        i === index ? value : code
      )
    );
  };

  const addCode = () => {
    setCodes((prev) => [
      ...prev,
      "",
    ]);
  };

  const removeCode = (index) => {
    if (codes.length === 1) return;

    setCodes((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const approve = async () => {
    setError("");
    setResult(null);

    if (!facility.trim()) {
      setError("Facility is required.");
      return;
    }

    const reversePickupCodes = [
      ...new Set(
        codes
          .map((code) => code.trim())
          .filter(Boolean)
      ),
    ];

    if (!reversePickupCodes.length) {
      setError(
        "Enter at least one reverse pickup code."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${SERVER_URL}/api/uniware/reverse-pickups/approve`,
        {
          facility: facility.trim(),
          reversePickupCodes,
        }
      );

      setResult(response.data);
    } catch (err) {
      setResult(err.response?.data || null);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to approve reverse pickups."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: 24,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Approve Reverse Pickup</h2>

      <p style={{ color: "#667085" }}>
        Approve one or more reverse pickup requests.
      </p>

      <section
        style={{
          border: "1px solid #eaecf0",
          borderRadius: 10,
          padding: 20,
        }}
      >
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>
            Facility *
          </label>

          <input
            style={inputStyle}
            value={facility}
            onChange={(e) =>
              setFacility(e.target.value)
            }
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <h3 style={{ margin: 0 }}>
            Reverse Pickup Codes
          </h3>

          <button
            onClick={addCode}
            style={secondaryButton}
          >
            + Add Code
          </button>
        </div>

        {codes.map((code, index) => (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr auto",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <input
              style={inputStyle}
              placeholder="RP2731"
              value={code}
              onChange={(e) =>
                updateCode(
                  index,
                  e.target.value
                )
              }
            />

            <button
              onClick={() =>
                removeCode(index)
              }
              style={{
                ...secondaryButton,
                color: "#b42318",
              }}
            >
              Remove
            </button>
          </div>
        ))}

        {error && (
          <div
            style={{
              marginTop: 15,
              padding: 12,
              background: "#fef3f2",
              color: "#b42318",
              borderRadius: 6,
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={approve}
          disabled={loading}
          style={{
            marginTop: 18,
            padding: "11px 20px",
            border: 0,
            borderRadius: 6,
            background: "#155eef",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {loading
            ? "Approving..."
            : "Approve Reverse Pickups"}
        </button>
      </section>

      {result && (
        <section
          style={{
            border: "1px solid #eaecf0",
            borderRadius: 10,
            padding: 20,
            marginTop: 20,
          }}
        >
          <h3>Response</h3>

          <p>
            <strong>Status:</strong>{" "}
            {result.successful
              ? "Successful"
              : "Failed"}
          </p>

          {result.message && (
            <p>
              <strong>Message:</strong>{" "}
              {result.message}
            </p>
          )}

          {(result.errors || []).length >
            0 && (
            <div>
              <h4>Errors</h4>

              {result.errors.map(
                (item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: 10,
                      background:
                        "#fef3f2",
                      color: "#b42318",
                      marginBottom: 8,
                      borderRadius: 6,
                    }}
                  >
                    {item.message ||
                      item.description}
                  </div>
                )
              )}
            </div>
          )}

          {(result.warnings || []).length >
            0 && (
            <div>
              <h4>Warnings</h4>

              {result.warnings.map(
                (item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: 10,
                      background:
                        "#fffaeb",
                      marginBottom: 8,
                      borderRadius: 6,
                    }}
                  >
                    {item.message ||
                      item.description}
                  </div>
                )
              )}
            </div>
          )}

          <details>
            <summary>Raw Response</summary>

            <pre
              style={{
                background: "#101828",
                color: "#fff",
                padding: 16,
                overflowX: "auto",
              }}
            >
              {JSON.stringify(
                result,
                null,
                2
              )}
            </pre>
          </details>
        </section>
      )}
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontWeight: 600,
  fontSize: 13,
  marginBottom: 6,
};

const secondaryButton = {
  padding: "8px 12px",
  border: "1px solid #d0d5dd",
  borderRadius: 6,
  background: "#fff",
  cursor: "pointer",
};

export default ApproveReversePickup;