import React, {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";


const SERVER_URL =
    "http://localhost:5000";


const Locations = () => {

    const [locations, setLocations] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    const loadLocations =
        useCallback(async () => {

            setLoading(true);
            setError("");


            try {

                const response =
                    await fetch(
                        `${SERVER_URL}/api/easyecom/locations`
                    );


                const result =
                    await response.json();


                if (
                    response.status === 401
                ) {

                    throw new Error(
                        result.message ||
                        "EasyEcom authentication required"
                    );

                }


                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "Unable to load EasyEcom locations"
                    );

                }


                setLocations(
                    result.data || []
                );

            }
            catch (error) {

                console.error(
                    "EasyEcom Locations Error:",
                    error
                );


                setLocations([]);


                setError(
                    error.message ||
                    "Unable to load locations"
                );

            }
            finally {

                setLoading(false);

            }

        }, []);


    useEffect(() => {

        loadLocations();

    }, [loadLocations]);


    return (

        <Box sx={{ mt: 3 }}>

            <Card>

                <CardContent>

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            alignItems:
                                "center",
                            mb: 3
                        }}
                    >

                        <Box>

                            <Typography
                                variant="h5"
                                fontWeight={600}
                            >
                                EasyEcom Locations
                            </Typography>


                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Child locations,
                                warehouses and
                                fulfillment locations.
                            </Typography>

                        </Box>


                        <Button
                            variant="contained"
                            onClick={
                                loadLocations
                            }
                            disabled={loading}
                        >
                            Refresh
                        </Button>

                    </Box>


                    {error && (

                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                        >
                            {error}
                        </Alert>

                    )}


                    {loading ? (

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent:
                                    "center",
                                py: 5
                            }}
                        >

                            <CircularProgress />

                        </Box>

                    ) : (

                        <TableContainer
                            component={Paper}
                        >

                            <Table>

                                <TableHead>

                                    <TableRow>

                                        <TableCell>
                                            #
                                        </TableCell>

                                        <TableCell>
                                            Company Name
                                        </TableCell>

                                        <TableCell>
                                            Company Type ID
                                        </TableCell>

                                        <TableCell>
                                            Location Key
                                        </TableCell>

                                    </TableRow>

                                </TableHead>


                                <TableBody>

                                    {locations.length ===
                                    0 ? (

                                        <TableRow>

                                            <TableCell
                                                colSpan={4}
                                                align="center"
                                            >
                                                No locations
                                                found.
                                            </TableCell>

                                        </TableRow>

                                    ) : (

                                        locations.map(
                                            (
                                                location,
                                                index
                                            ) => (

                                                <TableRow
                                                    key={
                                                        location.location_key ||
                                                        index
                                                    }
                                                >

                                                    <TableCell>
                                                        {
                                                            index +
                                                            1
                                                        }
                                                    </TableCell>


                                                    <TableCell>
                                                        {
                                                            location.companyname
                                                        }
                                                    </TableCell>


                                                    <TableCell>
                                                        {
                                                            location.company_type_id
                                                        }
                                                    </TableCell>


                                                    <TableCell>
                                                        {
                                                            location.location_key
                                                        }
                                                    </TableCell>

                                                </TableRow>

                                            )
                                        )

                                    )}

                                </TableBody>

                            </Table>

                        </TableContainer>

                    )}

                </CardContent>

            </Card>

        </Box>

    );
};


export default Locations;