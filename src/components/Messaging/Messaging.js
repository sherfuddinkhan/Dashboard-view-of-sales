import React, { useState } from "react";
import axios from "axios";
import ApiCredentials from "../Common/ApiCredentials";
import ErrorDisplay from "../Common/ErrorDisplay";

const Messaging = ({ 
  accessToken, setAccessToken, 
  awsAccessKey, setAwsAccessKey, 
  awsSecretKey, setAwsSecretKey, 
  region, setRegion, 
  environment, setEnvironment 
}) => {
  const [orderId, setOrderId] = useState("");
  const [messageText, setMessageText] = useState("Thanks for your order! It will ship soon.");
  const [result, setResult] = useState("");
  const [error, setError] = useState(null);

  const sendMessage = async () => {
    setError(null); setResult("");
    try {
      const res = await axios.post("http://localhost:5000/api/messaging/send", {
        accessToken, awsAccessKey, awsSecretKey, region, environment, orderId, messageText
      });
      setResult(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Messaging API</h2>
      <p>Send buyer-seller messages. Only for order-related communication.</p>
      
      <ApiCredentials 
        accessToken={accessToken} setAccessToken={setAccessToken}
        awsAccessKey={awsAccessKey} setAwsAccessKey={setAwsAccessKey}
        awsSecretKey={awsSecretKey} setAwsSecretKey={setAwsSecretKey}
        region={region} setRegion={setRegion}
        environment={environment} setEnvironment={setEnvironment}
      />
      
      <input type="text" placeholder="Amazon Order ID" value={orderId} onChange={e => setOrderId(e.target.value)} style={styles.input} />
      <textarea placeholder="Message Text" value={messageText} onChange={e => setMessageText(e.target.value)} style={styles.textarea} rows={4} />
      <button onClick={sendMessage} style={styles.button}>Send Message</button>

      <ErrorDisplay error={error} onClose={() => setError(null)} />
      {result && <><h3>Result</h3><pre style={styles.pre}>{result}</pre></>}
    </div>
  );
};

const styles = {
  container: { width: '100%' },
  input: { width: "100%", marginBottom: 15, padding: 10, fontSize: 15, border: '1px solid #cbd5e1', borderRadius: 6 },
  textarea: { width: "100%", marginBottom: 15, padding: 10, fontSize: 15, fontFamily: "Arial", border: '1px solid #cbd5e1', borderRadius: 6 },
  button: { background: "#146eb4", color: "#fff", border: "none", padding: "12px 25px", cursor: "pointer", fontSize: 16, borderRadius: 5 },
  pre: { background: '#f1f5f9', padding: 15, borderRadius: 6, overflow: 'auto', fontSize: 12 }
};

export default Messaging;