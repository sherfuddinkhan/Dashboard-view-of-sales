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

const VendorItemType = () => {
  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [form, setForm] = useState({
    vendorCode: "",
    itemTypeSkuCode: "",
    vendorSkuCode: "",
    inventory: 0,
    unitPrice: "",
    priority: 1,
    enabled: true,

    customFieldValues: [
      {
        name: "",
        value: "",
      },
    ],
  });

  // ==========================================================
  // NORMAL FIELD CHANGE
  // ==========================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================================
  // CHECKBOX
  // ==========================================================

  const handleCheckboxChange = (
    event
  ) => {
    const {
      name,
      checked,
    } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // ==========================================================
  // CUSTOM FIELD
  // ==========================================================

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

  // ==========================================================
  // SAVE
  // ==========================================================

  const saveVendorItemType =
    async () => {
      setLoading(true);
      setMessage("");
      setError("");

      try {
        const payload = {
          vendorItemType: {
            vendorCode:
              form.vendorCode.trim(),

            itemTypeSkuCode:
              form.itemTypeSkuCode.trim(),

            vendorSkuCode:
              form.vendorSkuCode.trim(),

            inventory:
              Number(form.inventory),

            unitPrice:
              Number(form.unitPrice),

            priority:
              Number(form.priority),

            enabled:
              form.enabled,

            customFieldValues:
              form.customFieldValues,
          },
        };

        const response =
          await axios.post(
            `${SERVER_URL}/api/uniware/vendor-item-types`,
            payload
          );

        const data =
          response.data;

        if (
          data.successful === true
        ) {
          setMessage(
            data.message ||
              "Vendor item type created/updated successfully."
          );
        } else {
          setError(
            data.message ||
              "Uniware rejected the request."
          );
        }
      } catch (err) {
        console.error(
          "Vendor item type error:",
          err
        );

        const serverMessage =
          err.response?.data?.message;

        setError(
          typeof serverMessage ===
            "string"
            ? serverMessage
            : "Unable to create/update vendor item type."
        );
      } finally {
        setLoading(false);
      }
    };

  // ==========================================================
  // RESET
  // ==========================================================

  const resetForm = () => {
    setForm({
      vendorCode: "",
      itemTypeSkuCode: "",
      vendorSkuCode: "",
      inventory: 0,
      unitPrice: "",
      priority: 1,
      enabled: true,

      customFieldValues: [
        {
          name: "",
          value: "",
        },
      ],
    });

    setMessage("");
    setError("");
  };

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: 1000,
        mx: "auto",
      }}
    >
      <Card>
        <CardContent>
          {/* ==================================================
              HEADER
          ================================================== */}

          <Typography
            variant="h4"
            sx={{ mb: 1 }}
          >
            Vendor Item Type
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Create or update a vendor item
            type in Uniware.
          </Typography>

          {/* ==================================================
              MESSAGES
          ================================================== */}

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

          {/* ==================================================
              VENDOR ITEM TYPE
          ================================================== */}

          <Typography
            variant="h6"
            sx={{ mb: 2 }}
          >
            Item Details
          </Typography>

          <Grid
            container
            spacing={2}
          >
            {/* Vendor Code */}

            <Grid
              item
              xs={12}
              md={6}
            >
              <TextField
                fullWidth
                required
                label="Vendor Code"
                name="vendorCode"
                value={
                  form.vendorCode
                }
                onChange={
                  handleChange
                }
                placeholder="ABC"
              />
            </Grid>

            {/* Item Type SKU */}

            <Grid
              item
              xs={12}
              md={6}
            >
              <TextField
                fullWidth
                required
                label="Item Type SKU Code"
                name="itemTypeSkuCode"
                value={
                  form.itemTypeSkuCode
                }
                onChange={
                  handleChange
                }
                placeholder="UCSKU_Yellow_XL"
              />
            </Grid>

            {/* Vendor SKU */}

            <Grid
              item
              xs={12}
              md={6}
            >
              <TextField
                fullWidth
                label="Vendor SKU Code"
                name="vendorSkuCode"
                value={
                  form.vendorSkuCode
                }
                onChange={
                  handleChange
                }
                placeholder="VSKU_Yellow_XL"
              />
            </Grid>

            {/* Inventory */}

            <Grid
              item
              xs={12}
              md={6}
            >
              <TextField
                fullWidth
                type="number"
                label="Inventory"
                name="inventory"
                value={
                  form.inventory
                }
                onChange={
                  handleChange
                }
                inputProps={{
                  min: 0,
                }}
              />
            </Grid>

            {/* Unit Price */}

            <Grid
              item
              xs={12}
              md={6}
            >
              <TextField
                fullWidth
                required
                type="number"
                label="Unit Price"
                name="unitPrice"
                value={
                  form.unitPrice
                }
                onChange={
                  handleChange
                }
                inputProps={{
                  min: 0,
                  step: "0.01",
                }}
              />
            </Grid>

            {/* Priority */}

            <Grid
              item
              xs={12}
              md={6}
            >
              <TextField
                fullWidth
                type="number"
                label="Priority"
                name="priority"
                value={
                  form.priority
                }
                onChange={
                  handleChange
                }
                inputProps={{
                  min: 1,
                }}
              />
            </Grid>
          </Grid>

          {/* ==================================================
              ENABLED
          ================================================== */}

          <FormControlLabel
            sx={{ mt: 2 }}
            control={
              <Checkbox
                name="enabled"
                checked={
                  form.enabled
                }
                onChange={
                  handleCheckboxChange
                }
              />
            }
            label="Enabled"
          />

          <Divider
            sx={{ my: 3 }}
          />

          {/* ==================================================
              CUSTOM FIELD
          ================================================== */}

          <Typography
            variant="h6"
            sx={{ mb: 2 }}
          >
            Custom Field
          </Typography>

          <Grid
            container
            spacing={2}
          >
            <Grid
              item
              xs={12}
              md={6}
            >
              <TextField
                fullWidth
                label="Custom Field Name"
                value={
                  form
                    .customFieldValues[0]
                    .name
                }
                onChange={(event) =>
                  handleCustomFieldChange(
                    "name",
                    event.target.value
                  )
                }
                placeholder="Brand"
              />
            </Grid>

            <Grid
              item
              xs={12}
              md={6}
            >
              <TextField
                fullWidth
                label="Custom Field Value"
                value={
                  form
                    .customFieldValues[0]
                    .value
                }
                onChange={(event) =>
                  handleCustomFieldChange(
                    "value",
                    event.target.value
                  )
                }
                placeholder="ABC Brand"
              />
            </Grid>
          </Grid>

          {/* ==================================================
              BUTTONS
          ================================================== */}

          <Stack
            direction="row"
            spacing={2}
            justifyContent="flex-end"
            sx={{ mt: 4 }}
          >
            <Button
              variant="outlined"
              onClick={
                resetForm
              }
              disabled={loading}
            >
              Reset
            </Button>

            <Button
              variant="contained"
              onClick={
                saveVendorItemType
              }
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : "Create / Update"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VendorItemType;