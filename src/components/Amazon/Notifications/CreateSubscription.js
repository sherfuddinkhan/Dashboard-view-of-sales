import React from "react";

const CreateSubscription = ({
  destinationId,
  setDestinationId,
  notificationType,
  setNotificationType,
  createSubscription,
}) => {
  return (
    <>
      <h3>Step 2 : Create Subscription</h3>

      <input
        type="text"
        placeholder="Destination ID"
        value={destinationId}
        onChange={(e) => setDestinationId(e.target.value)}
        style={styles.input}
      />

      <select
        value={notificationType}
        onChange={(e) => setNotificationType(e.target.value)}
        style={styles.input}
      >
        <option value="ORDER_CHANGE">ORDER_CHANGE</option>
        <option value="LISTINGS_ITEM_STATUS_CHANGE">
          LISTINGS_ITEM_STATUS_CHANGE
        </option>
        <option value="FEED_PROCESSING_FINISHED">
          FEED_PROCESSING_FINISHED
        </option>
        <option value="REPORT_PROCESSING_FINISHED">
          REPORT_PROCESSING_FINISHED
        </option>
      </select>

      <button
        disabled={!destinationId}
        onClick={createSubscription}
        style={styles.button}
      >
        Subscribe
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

export default CreateSubscription;