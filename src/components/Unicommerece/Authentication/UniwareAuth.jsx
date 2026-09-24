import React, { useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

const SERVER_URL = "http://localhost:5000";

const UniwareAuth = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const authenticateUniware = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.get(
        `${SERVER_URL}/api/uniware/auth/token`
      );

      setResult(response.data);
    } catch (err) {
      console.error("Uniware authentication error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to authenticate with Uniware"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h5">
            Uniware Authentication
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Authenticate with Uniware OAuth 2.0.
          </Typography>

          <Box>
            <Button
              variant="contained"
              onClick={authenticateUniware}
              disabled={loading}
            >
              {loading ? (
                <>
                  <CircularProgress
                    size={20}
                    sx={{ mr: 1 }}
                  />
                  Authenticating...
                </>
              ) : (
                "Connect Uniware"
              )}
            </Button>
          </Box>

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          {result && (
            <Alert severity="success">
              {result.message}
              <br />
              Token expires in approximately{" "}
              {result.expiresIn} seconds.
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default UniwareAuth;