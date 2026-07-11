import React, { useState } from "react";
import axios from "axios";

const MarketplaceParticipations = () => {

    const [accessToken, setAccessToken] = useState("");
 const [awsAccessKey, setAwsAccessKey] = useState(
  process.env.REACT_APP_AWS_ACCESS_KEY_ID || ""
);

const [awsSecretKey, setAwsSecretKey] = useState(
  process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || ""
);

const [region, setRegion] = useState(
  process.env.REACT_APP_AWS_REGION || "us-east-1"
);

const [serviceName, setServiceName] = useState(
  process.env.REACT_APP_AWS_SERVICE_NAME || "execute-api"
);

const [environment, setEnvironment] = useState(
  process.env.REACT_APP_AMAZON_ENVIRONMENT || "sandbox"
);

    const [response, setResponse] = useState("");
    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);


    const getMarketplace = async () => {

        setLoading(true);
        setResponse("");
        setError("");

        try {

            const result = await axios.post(
                "http://localhost:5000/api/marketplace",
                {
                    accessToken,
                    awsAccessKey,
                    awsSecretKey,
                    region,
                    serviceName,
                    environment
                }
            );


            setResponse(
                JSON.stringify(result.data, null, 2)
            );


        } catch (err) {

            if (err.response) {
                setError(
                    JSON.stringify(
                        err.response.data,
                        null,
                        2
                    )
                );
            }
            else {
                setError(err.message);
            }

        }
        finally {
            setLoading(false);
        }

    };


    return (

        <div style={styles.container}>

            <h2>
                Amazon SP-API Marketplace Participations
            </h2>


            <label>
                Access Token
            </label>

            <textarea
                rows="5"
                value={accessToken}
                onChange={(e)=>setAccessToken(e.target.value)}
                style={styles.textarea}
            />


            <label>
                AWS Access Key
            </label>

            <input
                type="text"
                value={awsAccessKey}
                onChange={(e)=>setAwsAccessKey(e.target.value)}
                style={styles.input}
            />



            <label>
                AWS Secret Key
            </label>

            <input
                type="password"
                value={awsSecretKey}
                onChange={(e)=>setAwsSecretKey(e.target.value)}
                style={styles.input}
            />



            <label>
                Region
            </label>

            <input
                type="text"
                value={region}
                onChange={(e)=>setRegion(e.target.value)}
                style={styles.input}
            />



            <label>
                Service Name
            </label>

            <input
                type="text"
                value={serviceName}
                onChange={(e)=>setServiceName(e.target.value)}
                style={styles.input}
            />



            <label>
                Environment
            </label>

            <select
                value={environment}
                onChange={(e)=>setEnvironment(e.target.value)}
                style={styles.input}
            >

                <option value="sandbox">
                    Sandbox
                </option>

                <option value="production">
                    Production
                </option>

            </select>



            <button
                onClick={getMarketplace}
                disabled={loading}
                style={styles.button}
            >

                {
                    loading 
                    ? "Fetching..."
                    : "Get Marketplace Participations"
                }

            </button>



            {
                response &&
                <>

                    <h3>
                        Response
                    </h3>


                    <textarea
                        rows="15"
                        value={response}
                        readOnly
                        style={styles.textarea}
                    />


                    <button
                        onClick={() =>
                            navigator.clipboard.writeText(response)
                        }
                        style={styles.copyButton}
                    >
                        Copy Response
                    </button>

                </>
            }




            {
                error &&
                <>

                    <h3 style={{color:"red"}}>
                        Error
                    </h3>

                    <pre>
                        {error}
                    </pre>

                </>
            }


        </div>

    );

};



const styles = {


    container:{
        width:700,
        margin:"40px auto",
        padding:30,
        border:"1px solid #ddd",
        borderRadius:10,
        fontFamily:"Arial"
    },


    input:{
        width:"100%",
        padding:10,
        marginBottom:15,
        marginTop:5,
        fontSize:15
    },


    textarea:{
        width:"100%",
        padding:10,
        marginBottom:15,
        marginTop:5,
        fontSize:14
    },


    button:{
        background:"#146eb4",
        color:"#fff",
        border:"none",
        padding:"12px 25px",
        cursor:"pointer",
        fontSize:16,
        borderRadius:5
    },


    copyButton:{
        background:"green",
        color:"#fff",
        border:"none",
        padding:"10px 20px",
        cursor:"pointer",
        borderRadius:5
    }


};

const containerStyle = {
  maxWidth: "800px",
  margin: "20px auto",
  padding: "20px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  backgroundColor: "#fff",
};

export default MarketplaceParticipations;