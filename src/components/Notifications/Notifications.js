import React, { useState } from "react";
import axios from "axios";
import AmazonTokenGenerator from "../Authentication/AmazonTokenGenerator";
import CreateDestination from "./CreateDestination";
import CreateSubscription from "./CreateSubscription";
import NotificationResult from "./NotificationResult";

const Notifications = ({
  accessToken,
  setAccessToken,
  awsAccessKey,
  setAwsAccessKey,
  awsSecretKey,
  setAwsSecretKey,
  region,
  setRegion,
  environment,
  setEnvironment,
}) => {
  const [destinationId, setDestinationId] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("https://yourdomain.com/webhook");
  const [notificationType, setNotificationType] = useState("ORDER_CHANGE");
  const [result, setResult] = useState("");
  const [error, setError] = useState(null);

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

    <AmazonTokenGenerator
      accessToken={accessToken}
      setAccessToken={setAccessToken}
      awsAccessKey={awsAccessKey}
      setAwsAccessKey={setAwsAccessKey}
      awsSecretKey={awsSecretKey}
      setAwsSecretKey={setAwsSecretKey}
      region={region}
      setRegion={setRegion}
      environment={environment}
      setEnvironment={setEnvironment}
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
    width: "100%",
  },
};

export default Notifications;