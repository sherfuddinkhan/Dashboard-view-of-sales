import React, { useState } from "react";
import axios from "axios";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const SERVER_URL = "http://localhost:5000";

const Vendor = () => {
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    code: "",
    name: "",
    pan: "",
    tin: "",
    cstNumber: "",
    stNumber: "",
    gstNumber: "",
    website: "",
    purchaseExpiryPeriod: 0,

    acceptsCForm: false,
    taxExempted: false,
    enabled: true,
    registeredDealer: true,

    billingAddress: {
      addressLine1: "",
      addressLine2: "",
      countryCode: "IN",
      pincode: "",
      latitude: "",
      longitude: "",
      stateCode: "",
      city: "",
      phone: "",
    },

    shippingAddress: {
      addressLine1: "",
      addressLine2: "",
      countryCode: "IN",
      pincode: "",
      latitude: "",
      longitude: "",
      stateCode: "",
      city: "",
      phone: "",
    },

    partyContacts: [
      {
        contactType: "PRIMARY",
        name: "",
        email: "",
        phone: "",
      },
    ],

    customFieldValues: [
      {
        name: "",
        value: "",
      },
    ],
  });

  // ======================================================
  // BASIC FIELD CHANGE
  // ======================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ======================================================
  // CHECKBOX CHANGE
  // ======================================================

  const handleCheckbox = (event) => {
    const { name, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // ======================================================
  // ADDRESS CHANGE
  // ======================================================

  const handleAddressChange = (
    addressType,
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,

      [addressType]: {
        ...prev[addressType],
        [field]: value,
      },
    }));
  };

  // ======================================================
  // CONTACT CHANGE
  // ======================================================

  const handleContactChange = (
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,

      partyContacts: [
        {
          ...prev.partyContacts[0],
          [field]: value,
        },
      ],
    }));
  };

  // ======================================================
  // CUSTOM FIELD CHANGE
  // ======================================================

  const handleCustomFieldChange = (
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,

      customFieldValues: [
        {
          ...prev.customFieldValues[0],
          [field]: value,
        },
      ],
    }));
  };

  // ======================================================
  // CREATE VENDOR
  // ======================================================

  const createVendor = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        vendor: {
          ...form,

          purchaseExpiryPeriod:
            Number(form.purchaseExpiryPeriod),
        },
      };

      const response = await axios.post(
        `${SERVER_URL}/api/uniware/vendors`,
        payload
      );

      const data = response.data;

      if (data.successful) {
        setMessage(
          data.message ||
            "Vendor created successfully"
        );
      } else {
        setError(
          data.message ||
            "Uniware rejected the vendor"
        );
      }
    } catch (err) {
      console.error(
        "Create vendor error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to create vendor"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // ADDRESS COMPONENT
  // ======================================================

  const renderAddress = (
    title,
    addressType
  ) => {
    const address = form[addressType];

    return (
      <Box sx={{ mt: 3 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2 }}
        >
          {title}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address Line 1"
              value={address.addressLine1}
              onChange={(e) =>
                handleAddressChange(
                  addressType,
                  "addressLine1",
                  e.target.value
                )
              }
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address Line 2"
              value={address.addressLine2}
              onChange={(e) =>
                handleAddressChange(
                  addressType,
                  "addressLine2",
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="City"
              value={address.city}
              onChange={(e) =>
                handleAddressChange(
                  addressType,
                  "city",
                  e.target.value
                )
              }
              required
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="State Code"
              placeholder="TG"
              value={address.stateCode}
              onChange={(e) =>
                handleAddressChange(
                  addressType,
                  "stateCode",
                  e.target.value
                )
              }
              required
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Country Code"
              value={address.countryCode}
              onChange={(e) =>
                handleAddressChange(
                  addressType,
                  "countryCode",
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Pincode"
              value={address.pincode}
              onChange={(e) =>
                handleAddressChange(
                  addressType,
                  "pincode",
                  e.target.value
                )
              }
              required
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Phone"
              value={address.phone}
              onChange={(e) =>
                handleAddressChange(
                  addressType,
                  "phone",
                  e.target.value
                )
              }
              required
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Latitude"
              value={address.latitude}
              onChange={(e) =>
                handleAddressChange(
                  addressType,
                  "latitude",
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Longitude"
              value={address.longitude}
              onChange={(e) =>
                handleAddressChange(
                  addressType,
                  "longitude",
                  e.target.value
                )
              }
            />
          </Grid>
        </Grid>
      </Box>
    );
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: 1200,
        mx: "auto",
      }}
    >
      <Card>
        <CardContent>
          <Typography
            variant="h4"
            sx={{ mb: 1 }}
          >
            Create Uniware Vendor
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Create a vendor in Uniware.
          </Typography>

          {message && (
            <Alert
              severity="success"
              sx={{ mb: 2 }}
            >
              {message}
            </Alert>
          )}

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          )}

          {/* ==========================================
              VENDOR DETAILS
          ========================================== */}

          <Typography
            variant="h6"
            sx={{ mb: 2 }}
          >
            Vendor Details
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vendor Code"
                name="code"
                value={form.code}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vendor Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="PAN"
                name="pan"
                value={form.pan}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="GST Number"
                name="gstNumber"
                value={form.gstNumber}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="TIN"
                name="tin"
                value={form.tin}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CST Number"
                name="cstNumber"
                value={form.cstNumber}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ST Number"
                name="stNumber"
                value={form.stNumber}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Website"
                name="website"
                value={form.website}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Purchase Expiry Period"
                name="purchaseExpiryPeriod"
                value={
                  form.purchaseExpiryPeriod
                }
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          {/* ==========================================
              FLAGS
          ========================================== */}

          <Stack
            direction="row"
            spacing={2}
            flexWrap="wrap"
            sx={{ mt: 2 }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.acceptsCForm}
                  name="acceptsCForm"
                  onChange={handleCheckbox}
                />
              }
              label="Accepts C Form"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={form.taxExempted}
                  name="taxExempted"
                  onChange={handleCheckbox}
                />
              }
              label="Tax Exempted"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={form.enabled}
                  name="enabled"
                  onChange={handleCheckbox}
                />
              }
              label="Enabled"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={form.registeredDealer}
                  name="registeredDealer"
                  onChange={handleCheckbox}
                />
              }
              label="Registered Dealer"
            />
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* ==========================================
              BILLING ADDRESS
          ========================================== */}

          {renderAddress(
            "Billing Address",
            "billingAddress"
          )}

          <Divider sx={{ my: 3 }} />

          {/* ==========================================
              SHIPPING ADDRESS
          ========================================== */}

          {renderAddress(
            "Shipping Address",
            "shippingAddress"
          )}

          <Divider sx={{ my: 3 }} />

          {/* ==========================================
              CONTACT
          ========================================== */}

          <Typography
            variant="h6"
            sx={{ mb: 2 }}
          >
            Primary Contact
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Name"
                value={
                  form.partyContacts[0].name
                }
                onChange={(e) =>
                  handleContactChange(
                    "name",
                    e.target.value
                  )
                }
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={
                  form.partyContacts[0].email
                }
                onChange={(e) =>
                  handleContactChange(
                    "email",
                    e.target.value
                  )
                }
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={
                  form.partyContacts[0].phone
                }
                onChange={(e) =>
                  handleContactChange(
                    "phone",
                    e.target.value
                  )
                }
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* ==========================================
              CUSTOM FIELD
          ========================================== */}

          <Typography
            variant="h6"
            sx={{ mb: 2 }}
          >
            Custom Field
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Field Name"
                value={
                  form.customFieldValues[0].name
                }
                onChange={(e) =>
                  handleCustomFieldChange(
                    "name",
                    e.target.value
                  )
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Field Value"
                value={
                  form.customFieldValues[0].value
                }
                onChange={(e) =>
                  handleCustomFieldChange(
                    "value",
                    e.target.value
                  )
                }
              />
            </Grid>
          </Grid>

          {/* ==========================================
              SAVE
          ========================================== */}

          <Stack
            direction="row"
            justifyContent="flex-end"
            sx={{ mt: 4 }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={createVendor}
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create Vendor"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Vendor;