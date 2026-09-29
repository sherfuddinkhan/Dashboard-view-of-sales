import React, {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    Alert,
    CircularProgress,
    Box
} from "@mui/material";


const SERVER_URL =
    "http://localhost:5000";


const TokenStatus = ({
    onStatusChange
}) => {

    const [loading, setLoading] =
        useState(true);

    const [authenticated, setAuthenticated] =
        useState(false);

    const [error, setError] =
        useState("");


    const checkTokenStatus =
        useCallback(async () => {

            setLoading(true);
            setError("");


            try {

                const response =
                    await fetch(
                        `${SERVER_URL}/api/easyecom/token-status`
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "Unable to check token status"
                    );

                }


                const status =
                    result.authenticated === true;


                setAuthenticated(status);


                if (onStatusChange) {

                    onStatusChange(status);

                }

            }
            catch (error) {

                console.error(
                    "EasyEcom Token Status Error:",
                    error
                );


                setAuthenticated(false);


                setError(
                    error.message ||
                    "Unable to check EasyEcom token status"
                );


                if (onStatusChange) {

                    onStatusChange(false);

                }

            }
            finally {

                setLoading(false);

            }

        }, [onStatusChange]);


    useEffect(() => {

        checkTokenStatus();

    }, [checkTokenStatus]);


    if (loading) {

        return (

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                }}
            >

                <CircularProgress
                    size={18}
                />

                Checking EasyEcom
                authentication...

            </Box>

        );

    }


    if (error) {

        return (

            <Alert
                severity="error"
                sx={{ width: "100%" }}
            >
                {error}
            </Alert>

        );

    }


    return (

        <Alert
            severity={
                authenticated
                    ? "success"
                    : "warning"
            }
        >

            {authenticated
                ? "EasyEcom authenticated"
                : "EasyEcom authentication required"}

        </Alert>

    );
};


export default TokenStatus;