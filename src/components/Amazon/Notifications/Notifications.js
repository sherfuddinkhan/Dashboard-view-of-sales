import React, { useState,useEffect } from "react";
import axios from "axios";
import AmazonTokenGenerator from "../Authentication/AmazonTokenGenerator";
import CreateDestination from "./CreateDestination";
import CreateSubscription from "./CreateSubscription";
import NotificationResult from "./NotificationResult";

const Notifications = () => {
  const [accessToken, setAccessToken] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("https://yourdomain.com/webhook");
  const [notificationType, setNotificationType] = useState("ORDER_CHANGE");
  const [result, setResult] = useState("");
  const [error, setError] = useState(null);
  const [awsAccessKey, setAwsAccessKey] = useState(process.env.REACT_APP_AWS_ACCESS_KEY_ID || "");
  const [awsSecretKey, setAwsSecretKey] = useState(process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || "");
  const [region, setRegion] = useState(process.env.REACT_APP_AWS_REGION || "us-east-1");
  const [environment, setEnvironment] = useState(process.env.REACT_APP_AMAZON_ENVIRONMENT || "sandbox");
    
     useEffect(() => {
               const token = localStorage.getItem("amazonAccessToken");
               if (token) {
                   setAccessToken(token);
               }
           }, []);

  const createDestination = async () => {
    setError(null);
    setResult("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/notifications/destination",
        {
          accessToken,
          awsAccessKey,
          awsSecretKey,
          region,
          environment,
          webhookUrl,
        }
      );

      setDestinationId(res.data.payload.destinationId);
      setResult(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setError(err);
    }
  };

  const createSubscription = async () => {
    setError(null);
    setResult("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/notifications/subscription",
        {
          accessToken,
          awsAccessKey,
          awsSecretKey,
          region,
          environment,
          destinationId,
          notificationType,
        }
      );

      setResult(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setError(err);
    }
  };

return (
  <div style={styles.container}>
    <h2>Notifications API</h2>
 <label>Access Token</label>
      <textarea
        rows={4}
        value={accessToken}
        onChange={(e) => setAccessToken(e.target.value)}
        style={styles.textarea}
      />

    <CreateDestination
      webhookUrl={webhookUrl}
      setWebhookUrl={setWebhookUrl}
      createDestination={createDestination}
    />

    <CreateSubscription
      destinationId={destinationId}
      setDestinationId={setDestinationId}
      notificationType={notificationType}
      setNotificationType={setNotificationType}
      createSubscription={createSubscription}
    />

    <NotificationResult
      result={result}
      error={error}
      setError={setError}
    />
  </div>
);
};

const styles = {
  container: {
    maxWidth: "850px",
    margin: "20px auto",
    padding: "25px",
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },

  title: {
    textAlign: "center",
    marginBottom: "20px",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    minHeight: "120px",
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    resize: "vertical",
    boxSizing: "border-box",
  },

  button: {
    padding: "12px 25px",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },

  response: {
    marginTop: "20px",
    padding: "15px",
    background: "#f5f5f5",
    borderRadius: "5px",
  },

  error: {
    marginTop: "20px",
    padding: "15px",
    background: "#ffebee",
    color: "#b71c1c",
    borderRadius: "5px",
  },
};

export default Notifications;