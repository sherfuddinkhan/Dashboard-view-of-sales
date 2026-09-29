import React, { useState } from "react";

import {
    Alert,
    Button,
    CircularProgress
} from "@mui/material";


const SERVER_URL =
    "http://localhost:5000";


const Logout = ({
    onLogout
}) => {

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    const handleLogout = async () => {

        setLoading(true);
        setError("");


        try {

            const response =
                await fetch(
                    `${SERVER_URL}/api/easyecom/logout`,
                    {
                        method: "POST"
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "EasyEcom logout failed"
                );

            }


            if (onLogout) {

                onLogout();

            }

        }
        catch (error) {

            console.error(
                "EasyEcom Logout Error:",
                error
            );


            setError(
                error.message ||
                "Unable to logout from EasyEcom"
            );

        }
        finally {

            setLoading(false);

        }

    };


    return (

        <>
            {error && (

                <Alert
                    severity="error"
                    sx={{ mb: 1 }}
                >
                    {error}
                </Alert>

            )}


            <Button
                variant="outlined"
                color="error"
                onClick={handleLogout}
                disabled={loading}
            >

                {loading ? (

                    <CircularProgress
                        size={20}
                        color="inherit"
                    />

                ) : (

                    "Logout"

                )}

            </Button>

        </>

    );
};


export default Logout;