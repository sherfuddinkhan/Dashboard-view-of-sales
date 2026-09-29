import React, { useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    TextField,
    Typography
} from "@mui/material";

import AccessToken from "./AccessToken";


const Login = ({
    onLoginSuccess
}) => {

    const [email, setEmail] = useState("");

    const [password, setPassword] =
        useState("");

    const [locationKey, setLocationKey] =
        useState("");


    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setLoading(true);


        try {

            const result =
                await AccessToken({
                    email,
                    password,
                    location_key: locationKey
                });


            console.log(
                "EasyEcom Login Success:",
                result
            );


            if (onLoginSuccess) {

                onLoginSuccess(
                    result.data
                );

            }

        }
        catch (error) {

            console.error(
                "EasyEcom Login Error:",
                error
            );


            setError(
                error.message ||
                "EasyEcom login failed"
            );

        }
        finally {

            setLoading(false);

        }

    };


    return (

        <Box
            sx={{
                minHeight: "70vh",

                display: "flex",

                justifyContent:
                    "center",

                alignItems:
                    "center"
            }}
        >

            <Card
                sx={{
                    width: 450,
                    maxWidth: "100%"
                }}
            >

                <CardContent
                    sx={{ p: 4 }}
                >

                    <Typography
                        variant="h5"
                        fontWeight={600}
                        sx={{ mb: 1 }}
                    >
                        EasyEcom Login
                    </Typography>


                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                    >
                        Login to your EasyEcom
                        account.
                    </Typography>


                    {error && (

                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                        >
                            {error}
                        </Alert>

                    )}


                    <form
                        onSubmit={
                            handleSubmit
                        }
                    >

                        <TextField
                            fullWidth
                            required
                            type="email"
                            label="Email"
                            value={email}
                            onChange={(event) =>
                                setEmail(
                                    event.target.value
                                )
                            }
                            margin="normal"
                        />


                        <TextField
                            fullWidth
                            required
                            type="password"
                            label="Password"
                            value={password}
                            onChange={(event) =>
                                setPassword(
                                    event.target.value
                                )
                            }
                            margin="normal"
                        />


                        <TextField
                            fullWidth
                            required
                            label="Location Key"
                            placeholder="ht3485485444"
                            value={locationKey}
                            onChange={(event) =>
                                setLocationKey(
                                    event.target.value
                                )
                            }
                            margin="normal"
                        />


                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ mt: 3 }}
                        >

                            {loading ? (

                                <CircularProgress
                                    size={24}
                                    color="inherit"
                                />

                            ) : (

                                "Login"

                            )}

                        </Button>

                    </form>

                </CardContent>

            </Card>

        </Box>
    );
};


export default Login;