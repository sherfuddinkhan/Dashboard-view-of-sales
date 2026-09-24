import React, { useMemo, useState } from "react";
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
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const SERVER_URL = "http://localhost:5000";

const PAYMENT_INSTRUMENTS = [
  "CASH",
  "CREDIT_CARD",
  "DEBIT_CARD",
  "NET_BANKING",
  "WALLET",
];

const initialAddress = () => ({
  id: "",
  name: "",
  addressLine1: "",
  addressLine2: "",
  latitude: "",
  longitude: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  phone: "",
  email: "",
});

const initialItem = () => ({
  code: "",
  itemSku: "",
  shippingMethodCode: "STD",
  packetNumber: 1,
  giftWrap: false,
  giftMessage: "",
  facilityCode: "",
  totalPrice: "",
  sellingPrice: "",
  prepaidAmount: "",
  discount: "",
  shippingCharges: "",
  storeCredit: "",
  giftWrapCharges: "",
});

const initialForm = {
  facility: "MAIN",

  code: "",
  displayOrderCode: "",
  displayOrderDateTime: "",

  customerCode: "",
  customerName: "",
  customerGSTIN: "",

  channel: "",
  notificationEmail: "",
  notificationMobile: "",

  cashOnDelivery: false,
  paymentInstrument: "CASH",

  additionalInfo: "",
  thirdPartyShipping: true,

  useVerifiedListings: true,

  billingReferenceId: "",
  shippingReferenceId: "",

  currencyCode: "INR",

  taxExempted: false,
  cformProvided: false,

  fulfillmentTat: "",
  channelProcessingTime: "",

  verificationRequired: true,
  priority: 0,

  totalDiscount: "",
  totalShippingCharges: "",
  totalCashOnDeliveryCharges: "",
  totalGiftWrapCharges: "",
  totalStoreCredit: "",
  totalPrepaidAmount: "",

  addresses: [initialAddress()],
  items: [initialItem()],
};

function toIsoOrUndefined(value) {
  if (!value) return undefined;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

function numberOrUndefined(value) {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
}

function cleanObject(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  );
}

function buildAddress(address) {
  return cleanObject({
    id: address.id.trim(),
    name: address.name.trim(),
    addressLine1: address.addressLine1.trim(),
    addressLine2: address.addressLine2.trim(),
    latitude: address.latitude.trim(),
    longitude: address.longitude.trim(),
    city: address.city.trim(),
    state: address.state.trim(),
    country: address.country.trim(),
    pincode: address.pincode.trim(),
    phone: address.phone.trim(),
    email: address.email.trim(),
  });
}

function buildSaleOrder(form) {
  const saleOrderItems = form.items
    .filter(
      (item) =>
        item.code.trim() ||
        item.itemSku.trim()
    )
    .map((item) =>
      cleanObject({
        code: item.code.trim(),
        itemSku: item.itemSku.trim(),
        shippingMethodCode:
          item.shippingMethodCode.trim() || "STD",
        packetNumber: numberOrUndefined(item.packetNumber),
        giftWrap: Boolean(item.giftWrap),
        giftMessage: item.giftMessage.trim(),
        facilityCode: item.facilityCode.trim(),
        totalPrice: numberOrUndefined(item.totalPrice),
        sellingPrice: numberOrUndefined(item.sellingPrice),
        prepaidAmount: numberOrUndefined(item.prepaidAmount),
        discount: numberOrUndefined(item.discount),
        shippingCharges: numberOrUndefined(item.shippingCharges),
        giftWrapCharges: numberOrUndefined(item.giftWrapCharges),
        storeCredit: numberOrUndefined(item.storeCredit),
      })
    );

  const addresses = form.addresses
    .filter(
      (address) =>
        address.id.trim() ||
        address.name.trim() ||
        address.addressLine1.trim()
    )
    .map(buildAddress);

  const saleOrder = cleanObject({
    code: form.code.trim(),
    displayOrderCode: form.displayOrderCode.trim(),

    displayOrderDateTime: toIsoOrUndefined(
      form.displayOrderDateTime
    ),

    channelProcessingTime: toIsoOrUndefined(
      form.channelProcessingTime
    ),

    customerCode: form.customerCode.trim(),
    customerName: form.customerName.trim(),
    customerGSTIN: form.customerGSTIN.trim(),

    channel: form.channel.trim(),

    notificationEmail:
      form.notificationEmail.trim(),

    notificationMobile:
      form.notificationMobile.trim(),

    cashOnDelivery: Boolean(
      form.cashOnDelivery
    ),

    paymentInstrument:
      form.paymentInstrument,

    additionalInfo:
      form.additionalInfo.trim(),

    thirdPartyShipping:
      Boolean(form.thirdPartyShipping),

    currencyCode:
      form.currencyCode.trim() || "INR",

    taxExempted:
      Boolean(form.taxExempted),

    cformProvided:
      Boolean(form.cformProvided),

    fulfillmentTat: toIsoOrUndefined(
      form.fulfillmentTat
    ),

    verificationRequired:
      Boolean(form.verificationRequired),

    priority:
      numberOrUndefined(form.priority) ?? 0,

    totalDiscount:
      numberOrUndefined(form.totalDiscount),

    totalShippingCharges:
      numberOrUndefined(
        form.totalShippingCharges
      ),

    totalCashOnDeliveryCharges:
      numberOrUndefined(
        form.totalCashOnDeliveryCharges
      ),

    totalGiftWrapCharges:
      numberOrUndefined(
        form.totalGiftWrapCharges
      ),

    totalStoreCredit:
      numberOrUndefined(
        form.totalStoreCredit
      ),

    totalPrepaidAmount:
      numberOrUndefined(
        form.totalPrepaidAmount
      ),

    useVerifiedListings:
      Boolean(form.useVerifiedListings),

    addresses:
      addresses.length > 0
        ? addresses
        : undefined,

    billingAddress:
      form.billingReferenceId.trim()
        ? {
            referenceId:
              form.billingReferenceId.trim(),
          }
        : undefined,

    shippingAddress:
      form.shippingReferenceId.trim()
        ? {
            referenceId:
              form.shippingReferenceId.trim(),
          }
        : undefined,

    saleOrderItems:
      saleOrderItems.length > 0
        ? saleOrderItems
        : undefined,
  });

  return saleOrder;
}

function validateForm(form) {
  const errors = [];

  if (!form.facility.trim()) {
    errors.push("Facility is required.");
  }

  if (!form.code.trim()) {
    errors.push("Sale order code is required.");
  }

  if (form.code.length > 45) {
    errors.push(
      "Sale order code cannot exceed 45 characters."
    );
  }

  if (
    form.displayOrderCode.length > 45
  ) {
    errors.push(
      "Display order code cannot exceed 45 characters."
    );
  }

  if (
    form.customerName.length > 100
  ) {
    errors.push(
      "Customer name cannot exceed 100 characters."
    );
  }

  if (
    form.notificationEmail.length > 100
  ) {
    errors.push(
      "Notification email cannot exceed 100 characters."
    );
  }

  if (
    form.notificationMobile.length > 45
  ) {
    errors.push(
      "Notification mobile cannot exceed 45 characters."
    );
  }

  if (
    form.additionalInfo.length > 500
  ) {
    errors.push(
      "Additional information cannot exceed 500 characters."
    );
  }

  if (
    form.cashOnDelivery &&
    form.totalCashOnDeliveryCharges === ""
  ) {
    errors.push(
      "Total COD charges are required for COD orders."
    );
  }

  if (
    !form.cashOnDelivery &&
    form.totalPrepaidAmount === ""
  ) {
    errors.push(
      "Total prepaid amount is required for prepaid orders."
    );
  }

  form.addresses.forEach((address, index) => {
    const hasAddress =
      address.id.trim() ||
      address.name.trim() ||
      address.addressLine1.trim();

    if (!hasAddress) return;

    if (!address.id.trim()) {
      errors.push(
        `Address ${index + 1}: ID is required.`
      );
    }

    if (!address.name.trim()) {
      errors.push(
        `Address ${index + 1}: Name is required.`
      );
    }

    if (!address.addressLine1.trim()) {
      errors.push(
        `Address ${index + 1}: Address Line 1 is required.`
      );
    }

    if (!address.city.trim()) {
      errors.push(
        `Address ${index + 1}: City is required.`
      );
    }

    if (!address.state.trim()) {
      errors.push(
        `Address ${index + 1}: State is required.`
      );
    }

    if (!address.phone.trim()) {
      errors.push(
        `Address ${index + 1}: Phone is required.`
      );
    }

    if (
      address.pincode.trim() &&
      !/^\d{6,}$/.test(
        address.pincode.trim()
      )
    ) {
      errors.push(
        `Address ${index + 1}: Pincode must contain at least 6 digits.`
      );
    }
  });

  form.items.forEach((item, index) => {
    const hasItem =
      item.code.trim() ||
      item.itemSku.trim();

    if (!hasItem) return;

    if (!item.code.trim()) {
      errors.push(
        `Item ${index + 1}: Item code is required.`
      );
    }

    if (!item.itemSku.trim()) {
      errors.push(
        `Item ${index + 1}: SKU is required.`
      );
    }

    if (!item.shippingMethodCode.trim()) {
      errors.push(
        `Item ${index + 1}: Shipping method is required.`
      );
    }

    if (
      Number.isNaN(
        Number(item.sellingPrice)
      )
    ) {
      errors.push(
        `Item ${index + 1}: Selling price must be numeric.`
      );
    }

    if (
      Number.isNaN(
        Number(item.totalPrice)
      )
    ) {
      errors.push(
        `Item ${index + 1}: Total price must be numeric.`
      );
    }
  });

  return errors;
}

function AddressSection({
  title,
  address,
  index,
  onChange,
  onRemove,
}) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">
            {title}
          </Typography>

          {onRemove && (
            <Button
              color="error"
              size="small"
              onClick={() => onRemove(index)}
            >
              Remove
            </Button>
          )}
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Address ID *"
              value={address.id}
              onChange={(e) =>
                onChange(index, "id", e.target.value)
              }
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Buyer / Contact Name *"
              value={address.name}
              onChange={(e) =>
                onChange(index, "name", e.target.value)
              }
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Address Line 1 *"
              value={address.addressLine1}
              onChange={(e) =>
                onChange(
                  index,
                  "addressLine1",
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address Line 2"
              value={address.addressLine2}
              onChange={(e) =>
                onChange(
                  index,
                  "addressLine2",
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="City *"
              value={address.city}
              onChange={(e) =>
                onChange(
                  index,
                  "city",
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="State *"
              value={address.state}
              onChange={(e) =>
                onChange(
                  index,
                  "state",
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Country"
              value={address.country}
              onChange={(e) =>
                onChange(
                  index,
                  "country",
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Pincode"
              value={address.pincode}
              onChange={(e) =>
                onChange(
                  index,
                  "pincode",
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Phone *"
              value={address.phone}
              onChange={(e) =>
                onChange(
                  index,
                  "phone",
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Email"
              value={address.email}
              onChange={(e) =>
                onChange(
                  index,
                  "email",
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Latitude"
              value={address.latitude}
              onChange={(e) =>
                onChange(
                  index,
                  "latitude",
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Longitude"
              value={address.longitude}
              onChange={(e) =>
                onChange(
                  index,
                  "longitude",
                  e.target.value
                )
              }
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

function ItemSection({
  item,
  index,
  onChange,
  onRemove,
}) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">
            Item {index + 1}
          </Typography>

          <Button
            color="error"
            size="small"
            onClick={() => onRemove(index)}
          >
            Remove
          </Button>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Item Code *"
              value={item.code}
              onChange={(e) =>
                onChange(
                  index,
                  "code",
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Item SKU *"
              value={item.itemSku}
              onChange={(e) =>
                onChange(
                  index,
                  "itemSku",
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label="Shipping Method"
              value={
                item.shippingMethodCode
              }
              onChange={(e) =>
                onChange(
                  index,
                  "shippingMethodCode",
                  e.target.value
                )
              }
            >
              <MenuItem value="STD">
                STD
              </MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="number"
              label="Packet Number"
              value={item.packetNumber}
              onChange={(e) =>
                onChange(
                  index,
                  "packetNumber",
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Facility Code"
              placeholder="Leave blank when using header"
              value={item.facilityCode}
              onChange={(e) =>
                onChange(
                  index,
                  "facilityCode",
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="number"
              label="Selling Price *"
              value={item.sellingPrice}
              onChange={(e) =>
                onChange(
                  index,
                  "sellingPrice",
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="number"
              label="Total Price *"
              value={item.totalPrice}
              onChange={(e) =>
                onChange(
                  index,
                  "totalPrice",
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="number"
              label="Prepaid Amount"
              value={item.prepaidAmount}
              onChange={(e) =>
                onChange(
                  index,
                  "prepaidAmount",
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="number"
              label="Discount"
              value={item.discount}
              onChange={(e) =>
                onChange(
                  index,
                  "discount",
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="number"
              label="Shipping Charges"
              value={item.shippingCharges}
              onChange={(e) =>
                onChange(
                  index,
                  "shippingCharges",
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="number"
              label="Gift Wrap Charges"
              value={item.giftWrapCharges}
              onChange={(e) =>
                onChange(
                  index,
                  "giftWrapCharges",
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="number"
              label="Store Credit"
              value={item.storeCredit}
              onChange={(e) =>
                onChange(
                  index,
                  "storeCredit",
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Gift Message"
              value={item.giftMessage}
              onChange={(e) =>
                onChange(
                  index,
                  "giftMessage",
                  e.target.value
                )
              }
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(
                    item.giftWrap
                  )}
                  onChange={(e) =>
                    onChange(
                      index,
                      "giftWrap",
                      e.target.checked
                    )
                  }
                />
              }
              label="Gift Wrap"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default function CreateSaleOrder() {
  const [form, setForm] = useState(
    initialForm
  );

  const [loading, setLoading] =
    useState(false);

  const [errors, setErrors] =
    useState([]);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [responseData, setResponseData] =
    useState(null);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateAddress = (
    index,
    field,
    value
  ) => {
    setForm((prev) => {
      const addresses = [
        ...prev.addresses,
      ];

      addresses[index] = {
        ...addresses[index],
        [field]: value,
      };

      return {
        ...prev,
        addresses,
      };
    });
  };

  const addAddress = () => {
    setForm((prev) => ({
      ...prev,
      addresses: [
        ...prev.addresses,
        initialAddress(),
      ],
    }));
  };

  const removeAddress = (index) => {
    setForm((prev) => ({
      ...prev,
      addresses: prev.addresses.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const updateItem = (
    index,
    field,
    value
  ) => {
    setForm((prev) => {
      const items = [...prev.items];

      items[index] = {
        ...items[index],
        [field]: value,
      };

      return {
        ...prev,
        items,
      };
    });
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        initialItem(),
      ],
    }));
  };

  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const payloadPreview = useMemo(() => {
    return {
      facility: form.facility,
      saleOrder: buildSaleOrder(form),
    };
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors([]);
    setSuccessMessage("");
    setResponseData(null);

    const validationErrors =
      validateForm(form);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        facility: form.facility.trim(),
        saleOrder: buildSaleOrder(form),
      };

      const response = await axios.post(
        `${SERVER_URL}/api/uniware/sale-orders/create`,
        payload,
        {
          headers: {
            "Content-Type":
              "application/json",
          },
          timeout: 30000,
        }
      );

      const data = response.data;

      setResponseData(data);

      if (data?.successful) {
        setSuccessMessage(
          data.message ||
            "Sale order created successfully."
        );
      } else {
        setErrors(
          data?.errors?.map(
            (error) =>
              error.message ||
              error.description ||
              "Uniware returned an error."
          ) || [
            data?.message ||
              "Sale order creation failed.",
          ]
        );
      }
    } catch (error) {
      const data =
        error.response?.data;

      setResponseData(data || null);

      if (data?.errors?.length) {
        setErrors(
          data.errors.map(
            (item) =>
              item.message ||
              item.description ||
              "Uniware error"
          )
        );
      } else {
        setErrors([
          data?.message ||
            error.message ||
            "Unable to create sale order.",
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setForm(initialForm);
    setErrors([]);
    setSuccessMessage("");
    setResponseData(null);
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        maxWidth: 1500,
        mx: "auto",
      }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Create Sale Order
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            mt={0.5}
          >
            Create a sale order in Uniware using the
            OMS Sale Order Create API.
          </Typography>
        </Box>

        {successMessage && (
          <Alert severity="success">
            {successMessage}
          </Alert>
        )}

        {errors.length > 0 && (
          <Alert severity="error">
            <Typography
              variant="subtitle2"
              fontWeight={700}
              mb={1}
            >
              Please fix the following:
            </Typography>

            <Box component="ul" sx={{ m: 0 }}>
              {errors.map(
                (error, index) => (
                  <li key={index}>
                    {error}
                  </li>
                )
              )}
            </Box>
          </Alert>
        )}

        <Card>
          <CardContent>
            <Typography
              variant="h6"
              fontWeight={700}
              mb={2}
            >
              Order Information
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Facility *"
                  value={form.facility}
                  onChange={(e) =>
                    updateField(
                      "facility",
                      e.target.value
                    )
                  }
                  helperText="Sent as Uniware Facility header"
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Sale Order Code *"
                  value={form.code}
                  onChange={(e) =>
                    updateField(
                      "code",
                      e.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Display Order Code"
                  value={
                    form.displayOrderCode
                  }
                  onChange={(e) =>
                    updateField(
                      "displayOrderCode",
                      e.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Display Order Date/Time"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={
                    form.displayOrderDateTime
                  }
                  onChange={(e) =>
                    updateField(
                      "displayOrderDateTime",
                      e.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Customer Code"
                  value={
                    form.customerCode
                  }
                  onChange={(e) =>
                    updateField(
                      "customerCode",
                      e.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  value={
                    form.customerName
                  }
                  onChange={(e) =>
                    updateField(
                      "customerName",
                      e.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Customer GSTIN"
                  value={
                    form.customerGSTIN
                  }
                  onChange={(e) =>
                    updateField(
                      "customerGSTIN",
                      e.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Channel"
                  placeholder="AMAZON / FLIPKART / CUSTOM"
                  value={form.channel}
                  onChange={(e) =>
                    updateField(
                      "channel",
                      e.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Notification Email"
                  value={
                    form.notificationEmail
                  }
                  onChange={(e) =>
                    updateField(
                      "notificationEmail",
                      e.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Notification Mobile"
                  value={
                    form.notificationMobile
                  }
                  onChange={(e) =>
                    updateField(
                      "notificationMobile",
                      e.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Currency Code"
                  value={
                    form.currencyCode
                  }
                  onChange={(e) =>
                    updateField(
                      "currencyCode",
                      e.target.value.toUpperCase()
                    )
                  }
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography
              variant="h6"
              fontWeight={700}
              mb={2}
            >
              Payment & Order Settings
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        form.cashOnDelivery
                      }
                      onChange={(e) =>
                        updateField(
                          "cashOnDelivery",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Cash On Delivery"
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Payment Instrument"
                  value={
                    form.paymentInstrument
                  }
                  onChange={(e) =>
                    updateField(
                      "paymentInstrument",
                      e.target.value
                    )
                  }
                >
                  {PAYMENT_INSTRUMENTS.map(
                    (item) => (
                      <MenuItem
                        key={item}
                        value={item}
                      >
                        {item}
                      </MenuItem>
                    )
                  )}
                </TextField>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        form.thirdPartyShipping
                      }
                      onChange={(e) =>
                        updateField(
                          "thirdPartyShipping",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Third Party Shipping"
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        form.verificationRequired
                      }
                      onChange={(e) =>
                        updateField(
                          "verificationRequired",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Verification Required"
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Priority"
                  value={form.priority}
                  onChange={(e) =>
                    updateField(
                      "priority",
                      e.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        form.taxExempted
                      }
                      onChange={(e) =>
                        updateField(
                          "taxExempted",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Tax Exempted"
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        form.cformProvided
                      }
                      onChange={(e) =>
                        updateField(
                          "cformProvided",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="C-Form Provided"
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        form.useVerifiedListings
                      }
                      onChange={(e) =>
                        updateField(
                          "useVerifiedListings",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Use Verified Listings"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Billing Address Reference ID"
                  value={
                    form.billingReferenceId
                  }
                  onChange={(e) =>
                    updateField(
                      "billingReferenceId",
                      e.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Shipping Address Reference ID"
                  value={
                    form.shippingReferenceId
                  }
                  onChange={(e) =>
                    updateField(
                      "shippingReferenceId",
                      e.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Channel Processing Time"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={
                    form.channelProcessingTime
                  }
                  onChange={(e) =>
                    updateField(
                      "channelProcessingTime",
                      e.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Fulfillment TAT"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={
                    form.fulfillmentTat
                  }
                  onChange={(e) =>
                    updateField(
                      "fulfillmentTat",
                      e.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Additional Information"
                  value={
                    form.additionalInfo
                  }
                  onChange={(e) =>
                    updateField(
                      "additionalInfo",
                      e.target.value
                    )
                  }
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography
                variant="h6"
                fontWeight={700}
              >
                Addresses
              </Typography>

              <Button
                variant="outlined"
                onClick={addAddress}
              >
                + Add Address
              </Button>
            </Stack>

            <Stack spacing={2}>
              {form.addresses.map(
                (address, index) => (
                  <AddressSection
                    key={index}
                    title={`Address ${
                      index + 1
                    }`}
                    address={address}
                    index={index}
                    onChange={
                      updateAddress
                    }
                    onRemove={
                      form.addresses.length >
                      1
                        ? removeAddress
                        : null
                    }
                  />
                )
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography
                variant="h6"
                fontWeight={700}
              >
                Sale Order Items
              </Typography>

              <Button
                variant="outlined"
                onClick={addItem}
              >
                + Add Item
              </Button>
            </Stack>

            <Stack spacing={2}>
              {form.items.map(
                (item, index) => (
                  <ItemSection
                    key={index}
                    item={item}
                    index={index}
                    onChange={
                      updateItem
                    }
                    onRemove={
                      removeItem
                    }
                  />
                )
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography
              variant="h6"
              fontWeight={700}
              mb={2}
            >
              Order Totals
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Total Discount"
                  value={
                    form.totalDiscount
                  }
                  onChange={(e) =>
                    updateField(
                      "totalDiscount",
                      e.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Total Shipping Charges"
                  value={
                    form.totalShippingCharges
                  }
                  onChange={(e) =>
                    updateField(
                      "totalShippingCharges",
                      e.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Total COD Charges"
                  value={
                    form.totalCashOnDeliveryCharges
                  }
                  onChange={(e) =>
                    updateField(
                      "totalCashOnDeliveryCharges",
                      e.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Total Gift Wrap Charges"
                  value={
                    form.totalGiftWrapCharges
                  }
                  onChange={(e) =>
                    updateField(
                      "totalGiftWrapCharges",
                      e.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Total Store Credit"
                  value={
                    form.totalStoreCredit
                  }
                  onChange={(e) =>
                    updateField(
                      "totalStoreCredit",
                      e.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Total Prepaid Amount"
                  value={
                    form.totalPrepaidAmount
                  }
                  onChange={(e) =>
                    updateField(
                      "totalPrepaidAmount",
                      e.target.value
                    )
                  }
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Paper
          variant="outlined"
          sx={{ p: 2 }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            mb={1}
          >
            Request Preview
          </Typography>

          <Box
            component="pre"
            sx={{
              m: 0,
              p: 2,
              overflow: "auto",
              maxHeight: 400,
              backgroundColor: "#f5f5f5",
              borderRadius: 1,
              fontSize: 12,
            }}
          >
            {JSON.stringify(
              payloadPreview,
              null,
              2
            )}
          </Box>
        </Paper>

        {responseData && (
          <Paper
            variant="outlined"
            sx={{ p: 2 }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
              mb={1}
            >
              Uniware Response
            </Typography>

            <Box
              component="pre"
              sx={{
                m: 0,
                p: 2,
                overflow: "auto",
                maxHeight: 500,
                backgroundColor: "#f5f5f5",
                borderRadius: 1,
                fontSize: 12,
              }}
            >
              {JSON.stringify(
                responseData,
                null,
                2
              )}
            </Box>
          </Paper>
        )}

        <Divider />

        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-end"
        >
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleClear}
            disabled={loading}
          >
            Clear
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Create Sale Order"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}