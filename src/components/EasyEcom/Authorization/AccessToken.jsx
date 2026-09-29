import React from "react";

const SERVER_URL = "http://localhost:5000";

/**
 * Calls the Node server to authenticate with EasyEcom.
 *
 * Node endpoint:
 * POST /api/easyecom/access-token
 *
 * Node then calls:
 * POST https://api.easyecom.io/access/token
 */
const AccessToken = async ({
    email,
    password,
    location_key
}) => {

    const response = await fetch(
        `${SERVER_URL}/api/easyecom/access-token`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password,
                location_key
            })
        }
    );


    const result = await response.json();


    if (!response.ok) {

        throw new Error(
            result.message ||
            "EasyEcom authentication failed"
        );

    }


    return result;
};


export default AccessToken;