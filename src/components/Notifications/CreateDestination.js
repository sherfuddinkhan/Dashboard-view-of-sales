import React from "react";

const CreateDestination = ({
  webhookUrl,
  setWebhookUrl,
  createDestination,
}) => {
  return (
    <>
      <h3>Step 1 : Create Destination</h3>

      <input
        type="text"
        placeholder="Webhook URL"
        value={webhookUrl}
        onChange={(e) => setWebhookUrl(e.target.value)}
        style={styles.input}
      />

      <button
        onClick={createDestination}
        style={styles.button}
      >
        Create Destination
      </button>
    </>
  );
};

const styles = {
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 15,
    border: "1px solid #cbd5e1",
    borderRadius: 6,
  },
  button: {
    background: "#146eb4",
    color: "#fff",
    border: "none",
    padding: "12px 25px",
    cursor: "pointer",
    borderRadius: 5,
    marginBottom: 20,
  },
};

export default CreateDestination;