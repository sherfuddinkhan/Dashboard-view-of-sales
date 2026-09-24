import React, {
  useMemo,
  useState,
} from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const createEmptyItem = () => ({
  saleOrderItemCode: "",
  reason: "",
  customerImageUrl: "",
  useAlternate: false,
  reversePickupAlternate: {
    itemSKU: "",
    totalPrice: "",
    sellingPrice: "",
    discount: "",
    shippingCharges: "",
    prepaidAmount: "",
  },
});

const createEmptyAddress = () => ({
  id: "",
  name: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  latitude: "",
  longitude: "",
  phone: "",
  email: "",
});

const createEmptyCustomField = () => ({
  name: "",
  value: "",
});

function CreateReversePickup() {
  const [facility, setFacility] =
    useState("MAIN");

  const [saleOrderCode, setSaleOrderCode] =
    useState("");

  const [items, setItems] =
    useState([createEmptyItem()]);

  const [shippingAddress, setShippingAddress] =
    useState(createEmptyAddress());

  const [pickupAddress, setPickupAddress] =
    useState(createEmptyAddress());

  const [sameAddress, setSameAddress] =
    useState(false);

  const [reversePickupCode, setReversePickupCode] =
    useState("");

  const [pickupInstruction, setPickupInstruction] =
    useState("");

  const [trackingNumber, setTrackingNumber] =
    useState("");

  const [shippingProviderCode, setShippingProviderCode] =
    useState("");

  const [returnFacilityCode, setReturnFacilityCode] =
    useState("");

  const [dimension, setDimension] =
    useState({
      boxLength: "",
      boxWidth: "",
      boxHeight: "",
      boxWeight: "",
    });

  const [customFieldValues, setCustomFieldValues] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  // --------------------------------------------------
  // Address helper
  // --------------------------------------------------
  const updateAddress = (
    type,
    field,
    value
  ) => {
    if (type === "shipping") {
      setShippingAddress((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else {
      setPickupAddress((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // --------------------------------------------------
  // Same address
  // --------------------------------------------------
  const handleSameAddress = (
    checked
  ) => {
    setSameAddress(checked);

    if (checked) {
      setPickupAddress({
        ...shippingAddress,
      });
    }
  };

  // --------------------------------------------------
  // Item operations
  // --------------------------------------------------
  const updateItem = (
    index,
    field,
    value
  ) => {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const updateAlternate = (
    index,
    field,
    value
  ) => {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              reversePickupAlternate: {
                ...item.reversePickupAlternate,
                [field]: value,
              },
            }
          : item
      )
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      createEmptyItem(),
    ]);
  };

  const removeItem = (
    index
  ) => {
    setItems((prev) =>
      prev.length === 1
        ? prev
        : prev.filter(
            (_, itemIndex) =>
              itemIndex !== index
          )
    );
  };

  // --------------------------------------------------
  // Custom fields
  // --------------------------------------------------
  const addCustomField = () => {
    setCustomFieldValues(
      (prev) => [
        ...prev,
        createEmptyCustomField(),
      ]
    );
  };

  const updateCustomField = (
    index,
    field,
    value
  ) => {
    setCustomFieldValues(
      (prev) =>
        prev.map(
          (
            item,
            itemIndex
          ) =>
            itemIndex === index
              ? {
                  ...item,
                  [field]:
                    value,
                }
              : item
        )
    );
  };

  const removeCustomField = (
    index
  ) => {
    setCustomFieldValues(
      (prev) =>
        prev.filter(
          (_, itemIndex) =>
            itemIndex !== index
        )
    );
  };

  // --------------------------------------------------
  // Request payload
  // --------------------------------------------------
  const requestPayload =
    useMemo(() => {
      const payload = {
        facility,
        saleOrderCode,
        reversePickItems:
          items.map((item) => {
            const reverseItem = {
              saleOrderItemCode:
                item.saleOrderItemCode,

              reason:
                item.reason,
            };

            if (
              item.customerImageUrl.trim()
            ) {
              reverseItem.customerImageUrl =
                item.customerImageUrl;
            }

            if (
              item.useAlternate
            ) {
              const alternate =
                item.reversePickupAlternate;

              const alternatePayload = {
                itemSKU:
                  alternate.itemSKU,
                totalPrice:
                  alternate.totalPrice,
                sellingPrice:
                  alternate.sellingPrice,
              };

              if (
                alternate.discount !==
                  "" &&
                alternate.discount !==
                  null
              ) {
                alternatePayload.discount =
                  Number(
                    alternate.discount
                  );
              }

              if (
                alternate.shippingCharges !==
                  "" &&
                alternate.shippingCharges !==
                  null
              ) {
                alternatePayload.shippingCharges =
                  Number(
                    alternate.shippingCharges
                  );
              }

              if (
                alternate.prepaidAmount !==
                  "" &&
                alternate.prepaidAmount !==
                  null
              ) {
                alternatePayload.prepaidAmount =
                  Number(
                    alternate.prepaidAmount
                  );
              }

              reverseItem.reversePickupAlternate =
                alternatePayload;
            }

            return reverseItem;
          }),

        actionCode: "WAC",
      };

      const cleanAddress = (
        address
      ) => {
        const cleaned = {};

        Object.entries(address).forEach(
          ([key, value]) => {
            if (
              value !== undefined &&
              value !== null &&
              String(value).trim()
            ) {
              cleaned[key] =
                String(value).trim();
            }
          }
        );

        return cleaned;
      };

      const shipping =
        cleanAddress(
          shippingAddress
        );

      const pickup =
        cleanAddress(
          sameAddress
            ? shippingAddress
            : pickupAddress
        );

      if (
        Object.keys(shipping)
          .length > 0
      ) {
        payload.shippingAddress =
          shipping;
      }

      if (
        Object.keys(pickup)
          .length > 0
      ) {
        payload.pickupAddress =
          pickup;
      }

      if (
        reversePickupCode.trim()
      ) {
        payload.reversePickupCode =
          reversePickupCode.trim();
      }

      if (
        pickupInstruction.trim()
      ) {
        payload.pickupInstruction =
          pickupInstruction.trim();
      }

      if (
        trackingNumber.trim()
      ) {
        payload.trackingNumber =
          trackingNumber.trim();
      }

      if (
        shippingProviderCode.trim()
      ) {
        payload.shippingProviderCode =
          shippingProviderCode.trim();
      }

      if (
        returnFacilityCode.trim()
      ) {
        payload.returnFacilityCode =
          returnFacilityCode.trim();
      }

      const dimensionPayload = {};

      Object.entries(dimension).forEach(
        ([key, value]) => {
          if (
            value !== "" &&
            value !== null &&
            value !== undefined
          ) {
            dimensionPayload[key] =
              Number(value);
          }
        }
      );

      if (
        Object.keys(
          dimensionPayload
        ).length > 0
      ) {
        payload.dimension =
          dimensionPayload;
      }

      const fields =
        customFieldValues
          .filter(
            (field) =>
              field.name.trim()
          )
          .map((field) => ({
            name:
              field.name.trim(),
            ...(field.value !==
              undefined
              ? {
                  value:
                    field.value,
                }
              : {}),
          }));

      if (fields.length > 0) {
        payload.customFieldValues =
          fields;
      }

      return payload;
    }, [
      facility,
      saleOrderCode,
      items,
      shippingAddress,
      pickupAddress,
      sameAddress,
      reversePickupCode,
      pickupInstruction,
      trackingNumber,
      shippingProviderCode,
      returnFacilityCode,
      dimension,
      customFieldValues,
    ]);

  // --------------------------------------------------
  // Submit
  // --------------------------------------------------
  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setResult(null);

    if (!facility.trim()) {
      setError(
        "Facility is required."
      );
      return;
    }

    if (!saleOrderCode.trim()) {
      setError(
        "Sale Order Code is required."
      );
      return;
    }

    if (
      !items.length
    ) {
      setError(
        "At least one returned item is required."
      );
      return;
    }

    for (
      let index = 0;
      index < items.length;
      index++
    ) {
      const item = items[index];

      if (
        !item.saleOrderItemCode.trim()
      ) {
        setError(
          `Item ${index + 1}: Sale Order Item Code is required.`
        );
        return;
      }

      if (!item.reason.trim()) {
        setError(
          `Item ${index + 1}: Return reason is required.`
        );
        return;
      }

      if (
        item.reason.length > 500
      ) {
        setError(
          `Item ${index + 1}: Return reason cannot exceed 500 characters.`
        );
        return;
      }

      if (
        item.customerImageUrl.length >
        2000
      ) {
        setError(
          `Item ${index + 1}: Customer image URL cannot exceed 2000 characters.`
        );
        return;
      }

      if (
        item.useAlternate
      ) {
        const alternate =
          item.reversePickupAlternate;

        if (
          !alternate.itemSKU.trim()
        ) {
          setError(
            `Item ${index + 1}: Alternate Item SKU is required.`
          );
          return;
        }

        if (
          alternate.totalPrice ===
            "" ||
          !Number.isFinite(
            Number(
              alternate.totalPrice
            )
          )
        ) {
          setError(
            `Item ${index + 1}: Alternate Total Price is required and must be numeric.`
          );
          return;
        }

        if (
          alternate.sellingPrice ===
            "" ||
          !Number.isFinite(
            Number(
              alternate.sellingPrice
            )
          )
        ) {
          setError(
            `Item ${index + 1}: Alternate Selling Price is required and must be numeric.`
          );
          return;
        }
      }
    }

    // ------------------------------------------------
    // Validate shipping address if used
    // ------------------------------------------------
    const validateAddress = (
      address,
      label
    ) => {
      const required = [
        "id",
        "name",
        "addressLine1",
        "city",
        "state",
        "phone",
      ];

      for (
        const field of required
      ) {
        if (
          !address[field].trim()
        ) {
          return `${label}: ${field} is required.`;
        }
      }

      if (
        address.name.length >
        100
      ) {
        return `${label}: name cannot exceed 100 characters.`;
      }

      if (
        address.addressLine1
          .length > 500
      ) {
        return `${label}: addressLine1 cannot exceed 500 characters.`;
      }

      if (
        address.addressLine2
          .length > 500
      ) {
        return `${label}: addressLine2 cannot exceed 500 characters.`;
      }

      if (
        address.city.length >
        100
      ) {
        return `${label}: city cannot exceed 100 characters.`;
      }

      if (
        address.state.length >
        45
      ) {
        return `${label}: state cannot exceed 45 characters.`;
      }

      if (
        address.phone.length >
        50
      ) {
        return `${label}: phone cannot exceed 50 characters.`;
      }

      if (
        address.pincode &&
        !/^\d{6,}$/.test(
          address.pincode
        )
      ) {
        return `${label}: pincode must contain at least 6 digits.`;
      }

      if (
        address.email &&
        address.email.length >
          100
      ) {
        return `${label}: email cannot exceed 100 characters.`;
      }

      return null;
    };

    const shippingError =
      validateAddress(
        shippingAddress,
        "Shipping Address"
      );

    if (shippingError) {
      setError(shippingError);
      return;
    }

    const pickupError =
      validateAddress(
        sameAddress
          ? shippingAddress
          : pickupAddress,
        "Pickup Address"
      );

    if (pickupError) {
      setError(pickupError);
      return;
    }

    // ------------------------------------------------
    // Validate dimensions
    // ------------------------------------------------
    for (
      const [key, value] of Object.entries(
        dimension
      )
    ) {
      if (
        value !== "" &&
        (
          !Number.isInteger(
            Number(value)
          ) ||
          Number(value) < 0
        )
      ) {
        setError(
          `${key} must be a non-negative integer.`
        );
        return;
      }
    }

    try {
      setLoading(true);

      const response =
        await axios.post(
          `${SERVER_URL}/api/uniware/returns/reverse-pickup/create`,
          requestPayload,
          {
            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );

      setResult(response.data);
    } catch (err) {
      const apiError =
        err.response?.data;

      setResult(
        apiError || null
      );

      setError(
        apiError?.message ||
          err.message ||
          "Failed to create reverse pick-up."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Reset
  // --------------------------------------------------
  const handleReset = () => {
    setFacility("MAIN");
    setSaleOrderCode("");
    setItems([
      createEmptyItem(),
    ]);
    setShippingAddress(
      createEmptyAddress()
    );
    setPickupAddress(
      createEmptyAddress()
    );
    setSameAddress(false);
    setReversePickupCode("");
    setPickupInstruction("");
    setTrackingNumber("");
    setShippingProviderCode("");
    setReturnFacilityCode("");
    setDimension({
      boxLength: "",
      boxWidth: "",
      boxHeight: "",
      boxWeight: "",
    });
    setCustomFieldValues([]);
    setResult(null);
    setError("");
  };

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------
  const formatValue = (
    value,
    fallback = "N/A"
  ) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return fallback;
    }

    return String(value);
  };

  const styles = {
    page: {
      maxWidth: 1450,
      margin: "0 auto",
      padding: 24,
      fontFamily:
        "Arial, Helvetica, sans-serif",
      background: "#f7f8fa",
      minHeight: "100vh",
    },

    title: {
      fontSize: 28,
      fontWeight: 700,
      marginBottom: 6,
    },

    subtitle: {
      color: "#666",
      marginBottom: 22,
    },

    card: {
      background: "#fff",
      border: "1px solid #ddd",
      borderRadius: 10,
      padding: 20,
      marginBottom: 20,
      boxShadow:
        "0 2px 8px rgba(0,0,0,0.04)",
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: 700,
      marginBottom: 16,
    },

    grid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(220px, 1fr))",
      gap: 15,
    },

    field: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
    },

    label: {
      fontSize: 13,
      fontWeight: 600,
      color: "#444",
    },

    input: {
      boxSizing: "border-box",
      width: "100%",
      padding: "10px 12px",
      border:
        "1px solid #ccc",
      borderRadius: 6,
      fontSize: 14,
      background: "#fff",
    },

    textarea: {
      boxSizing: "border-box",
      width: "100%",
      minHeight: 80,
      padding: "10px 12px",
      border:
        "1px solid #ccc",
      borderRadius: 6,
      fontSize: 14,
      resize: "vertical",
    },

    select: {
      boxSizing: "border-box",
      width: "100%",
      padding: "10px 12px",
      border:
        "1px solid #ccc",
      borderRadius: 6,
      fontSize: 14,
      background: "#fff",
    },

    button: {
      border: "none",
      borderRadius: 6,
      padding: "10px 17px",
      cursor: "pointer",
      fontWeight: 600,
    },

    primary: {
      background: "#1976d2",
      color: "#fff",
    },

    secondary: {
      background: "#fff",
      color: "#333",
      border:
        "1px solid #aaa",
    },

    danger: {
      background: "#fff",
      color: "#c62828",
      border:
        "1px solid #e57373",
    },

    itemCard: {
      border:
        "1px solid #ddd",
      borderRadius: 8,
      padding: 16,
      marginBottom: 14,
      background: "#fafafa",
    },

    error: {
      padding: 14,
      borderRadius: 7,
      background: "#ffebee",
      border:
        "1px solid #ef9a9a",
      color: "#b71c1c",
      marginBottom: 20,
    },

    success: {
      padding: 14,
      borderRadius: 7,
      background: "#e8f5e9",
      border:
        "1px solid #a5d6a7",
      color: "#1b5e20",
      marginBottom: 20,
    },

    tableWrapper: {
      overflowX: "auto",
    },

    table: {
      width: "100%",
      borderCollapse:
        "collapse",
    },

    th: {
      border:
        "1px solid #ddd",
      padding: 10,
      textAlign: "left",
      background: "#f5f5f5",
      fontSize: 13,
    },

    td: {
      border:
        "1px solid #ddd",
      padding: 10,
      fontSize: 13,
    },

    pre: {
      background: "#111",
      color: "#eee",
      padding: 16,
      borderRadius: 8,
      overflow: "auto",
      fontSize: 13,
    },

    row: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      marginTop: 12,
    },

    checkboxRow: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginTop: 12,
    },
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>
        Create Reverse Pick-up
      </h1>

      <div style={styles.subtitle}>
        Create a Uniware reverse pick-up for
        one or more returned sale-order items.
      </div>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {result?.successful && (
        <div style={styles.success}>
          <strong>
            Reverse pick-up created successfully.
          </strong>

          <br />

          {result.message && (
            <>
              {result.message}
              <br />
            </>
          )}

          Reverse Pickup Code:{" "}
          <strong>
            {formatValue(
              result.reversePickupCode
            )}
          </strong>
        </div>
      )}

      {/* ================================================== */}
      {/* Basic Details */}
      {/* ================================================== */}

      <div style={styles.card}>
        <div
          style={styles.sectionTitle}
        >
          Reverse Pick-up Details
        </div>

        <div style={styles.grid}>
          <div style={styles.field}>
            <label style={styles.label}>
              Facility *
            </label>

            <input
              style={styles.input}
              value={facility}
              onChange={(event) =>
                setFacility(
                  event.target.value
                )
              }
              placeholder="MAIN"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Sale Order Code *
            </label>

            <input
              style={styles.input}
              value={saleOrderCode}
              onChange={(event) =>
                setSaleOrderCode(
                  event.target.value
                )
              }
              placeholder="SO00159"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Action Code
            </label>

            <input
              style={{
                ...styles.input,
                background:
                  "#f3f3f3",
              }}
              value="WAC"
              readOnly
            />

            <small>
              Fixed by Uniware:
              Wait for return and
              Cancel.
            </small>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Reverse Pickup Code
            </label>

            <input
              style={styles.input}
              value={
                reversePickupCode
              }
              onChange={(event) =>
                setReversePickupCode(
                  event.target.value
                )
              }
              placeholder="NG009"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Tracking Number
            </label>

            <input
              style={styles.input}
              value={
                trackingNumber
              }
              onChange={(event) =>
                setTrackingNumber(
                  event.target.value
                )
              }
              placeholder="Reverse tracking number"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Shipping Provider Code
            </label>

            <input
              style={styles.input}
              value={
                shippingProviderCode
              }
              onChange={(event) =>
                setShippingProviderCode(
                  event.target.value
                )
              }
              placeholder="DELHIVERY"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Return Facility Code
            </label>

            <input
              style={styles.input}
              value={
                returnFacilityCode
              }
              onChange={(event) =>
                setReturnFacilityCode(
                  event.target.value
                )
              }
              placeholder="varad"
            />
          </div>
        </div>

        <div
          style={{
            ...styles.field,
            marginTop: 16,
          }}
        >
          <label style={styles.label}>
            Pickup Instruction
          </label>

          <textarea
            style={styles.textarea}
            value={
              pickupInstruction
            }
            onChange={(event) =>
              setPickupInstruction(
                event.target.value
              )
            }
            placeholder="Instructions for the pickup person"
          />
        </div>
      </div>

      {/* ================================================== */}
      {/* Returned Items */}
      {/* ================================================== */}

      <div style={styles.card}>
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div
            style={styles.sectionTitle}
          >
            Returned Items
          </div>

          <button
            type="button"
            style={{
              ...styles.button,
              ...styles.primary,
            }}
            onClick={addItem}
          >
            + Add Item
          </button>
        </div>

        {items.map(
          (item, index) => (
            <div
              key={index}
              style={styles.itemCard}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <strong>
                  Item {index + 1}
                </strong>

                {items.length > 1 && (
                  <button
                    type="button"
                    style={{
                      ...styles.button,
                      ...styles.danger,
                    }}
                    onClick={() =>
                      removeItem(
                        index
                      )
                    }
                  >
                    Remove
                  </button>
                )}
              </div>

              <div
                style={styles.grid}
              >
                <div
                  style={styles.field}
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Sale Order Item Code *
                  </label>

                  <input
                    style={
                      styles.input
                    }
                    value={
                      item.saleOrderItemCode
                    }
                    onChange={(
                      event
                    ) =>
                      updateItem(
                        index,
                        "saleOrderItemCode",
                        event.target
                          .value
                      )
                    }
                    placeholder="W-04-0"
                  />
                </div>

                <div
                  style={styles.field}
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Customer Image URL
                  </label>

                  <input
                    style={
                      styles.input
                    }
                    value={
                      item.customerImageUrl
                    }
                    onChange={(
                      event
                    ) =>
                      updateItem(
                        index,
                        "customerImageUrl",
                        event.target
                          .value
                      )
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div
                style={{
                  ...styles.field,
                  marginTop: 14,
                }}
              >
                <label
                  style={
                    styles.label
                  }
                >
                  Return Reason *
                </label>

                <textarea
                  style={
                    styles.textarea
                  }
                  value={
                    item.reason
                  }
                  onChange={(
                    event
                  ) =>
                    updateItem(
                      index,
                      "reason",
                      event.target
                        .value
                    )
                  }
                  placeholder="Not Good Item"
                />
              </div>

              <div
                style={
                  styles.checkboxRow
                }
              >
                <input
                  type="checkbox"
                  checked={
                    item.useAlternate
                  }
                  onChange={(
                    event
                  ) =>
                    updateItem(
                      index,
                      "useAlternate",
                      event.target
                        .checked
                    )
                  }
                />

                <label>
                  Include Reverse Pickup
                  Alternate Item
                </label>
              </div>

              {item.useAlternate && (
                <div
                  style={{
                    marginTop: 14,
                    padding: 14,
                    border:
                      "1px solid #ddd",
                    borderRadius: 7,
                    background:
                      "#fff",
                  }}
                >
                  <strong>
                    Reverse Pickup
                    Alternate
                  </strong>

                  <div
                    style={{
                      ...styles.grid,
                      marginTop: 12,
                    }}
                  >
                    <div
                      style={
                        styles.field
                      }
                    >
                      <label
                        style={
                          styles.label
                        }
                      >
                        Item SKU *
                      </label>

                      <input
                        style={
                          styles.input
                        }
                        value={
                          item
                            .reversePickupAlternate
                            .itemSKU
                        }
                        onChange={(
                          event
                        ) =>
                          updateAlternate(
                            index,
                            "itemSKU",
                            event.target
                              .value
                          )
                        }
                        placeholder="Bharat4"
                      />
                    </div>

                    <div
                      style={
                        styles.field
                      }
                    >
                      <label
                        style={
                          styles.label
                        }
                      >
                        Total Price *
                      </label>

                      <input
                        type="number"
                        style={
                          styles.input
                        }
                        value={
                          item
                            .reversePickupAlternate
                            .totalPrice
                        }
                        onChange={(
                          event
                        ) =>
                          updateAlternate(
                            index,
                            "totalPrice",
                            event.target
                              .value
                          )
                        }
                      />
                    </div>

                    <div
                      style={
                        styles.field
                      }
                    >
                      <label
                        style={
                          styles.label
                        }
                      >
                        Selling Price *
                      </label>

                      <input
                        type="number"
                        style={
                          styles.input
                        }
                        value={
                          item
                            .reversePickupAlternate
                            .sellingPrice
                        }
                        onChange={(
                          event
                        ) =>
                          updateAlternate(
                            index,
                            "sellingPrice",
                            event.target
                              .value
                          )
                        }
                      />
                    </div>

                    <div
                      style={
                        styles.field
                      }
                    >
                      <label
                        style={
                          styles.label
                        }
                      >
                        Discount
                      </label>

                      <input
                        type="number"
                        style={
                          styles.input
                        }
                        value={
                          item
                            .reversePickupAlternate
                            .discount
                        }
                        onChange={(
                          event
                        ) =>
                          updateAlternate(
                            index,
                            "discount",
                            event.target
                              .value
                          )
                        }
                      />
                    </div>

                    <div
                      style={
                        styles.field
                      }
                    >
                      <label
                        style={
                          styles.label
                        }
                      >
                        Shipping Charges
                      </label>

                      <input
                        type="number"
                        style={
                          styles.input
                        }
                        value={
                          item
                            .reversePickupAlternate
                            .shippingCharges
                        }
                        onChange={(
                          event
                        ) =>
                          updateAlternate(
                            index,
                            "shippingCharges",
                            event.target
                              .value
                          )
                        }
                      />
                    </div>

                    <div
                      style={
                        styles.field
                      }
                    >
                      <label
                        style={
                          styles.label
                        }
                      >
                        Prepaid Amount
                      </label>

                      <input
                        type="number"
                        style={
                          styles.input
                        }
                        value={
                          item
                            .reversePickupAlternate
                            .prepaidAmount
                        }
                        onChange={(
                          event
                        ) =>
                          updateAlternate(
                            index,
                            "prepaidAmount",
                            event.target
                              .value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* ================================================== */}
      {/* Shipping Address */}
      {/* ================================================== */}

      <div style={styles.card}>
        <div
          style={styles.sectionTitle}
        >
          Shipping Address
        </div>

        <AddressForm
          address={
            shippingAddress
          }
          onChange={(
            field,
            value
          ) =>
            updateAddress(
              "shipping",
              field,
              value
            )
          }
        />
      </div>

      {/* ================================================== */}
      {/* Pickup Address */}
      {/* ================================================== */}

      <div style={styles.card}>
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div
            style={styles.sectionTitle}
          >
            Pickup Address
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontSize: 14,
            }}
          >
            <input
              type="checkbox"
              checked={sameAddress}
              onChange={(
                event
              ) =>
                handleSameAddress(
                  event.target
                    .checked
                )
              }
            />

            Same as Shipping Address
          </label>
        </div>

        {!sameAddress && (
          <AddressForm
            address={
              pickupAddress
            }
            onChange={(
              field,
              value
            ) =>
              updateAddress(
                "pickup",
                field,
                value
              )
            }
          />
        )}

        {sameAddress && (
          <div
            style={{
              padding: 14,
              background:
                "#f5f5f5",
              borderRadius: 6,
              color: "#555",
            }}
          >
            Pickup address will use
            the shipping address.
          </div>
        )}
      </div>

      {/* ================================================== */}
      {/* Dimensions */}
      {/* ================================================== */}

      <div style={styles.card}>
        <div
          style={styles.sectionTitle}
        >
          Shipment Dimensions
        </div>

        <div style={styles.grid}>
          {[
            [
              "boxLength",
              "Box Length (mm)",
            ],
            [
              "boxWidth",
              "Box Width (mm)",
            ],
            [
              "boxHeight",
              "Box Height (mm)",
            ],
            [
              "boxWeight",
              "Box Weight (kg)",
            ],
          ].map(
            ([field, label]) => (
              <div
                key={field}
                style={styles.field}
              >
                <label
                  style={styles.label}
                >
                  {label}
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  style={
                    styles.input
                  }
                  value={
                    dimension[
                      field
                    ]
                  }
                  onChange={(
                    event
                  ) =>
                    setDimension(
                      (prev) => ({
                        ...prev,
                        [field]:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                />
              </div>
            )
          )}
        </div>
      </div>

      {/* ================================================== */}
      {/* Custom Fields */}
      {/* ================================================== */}

      <div style={styles.card}>
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div
            style={styles.sectionTitle}
          >
            Custom Fields
          </div>

          <button
            type="button"
            style={{
              ...styles.button,
              ...styles.secondary,
            }}
            onClick={
              addCustomField
            }
          >
            + Add Custom Field
          </button>
        </div>

        {customFieldValues.length ===
          0 && (
          <div
            style={{
              color: "#777",
            }}
          >
            No custom fields added.
          </div>
        )}

        {customFieldValues.map(
          (
            field,
            index
          ) => (
            <div
              key={index}
              style={{
                ...styles.grid,
                marginBottom: 12,
              }}
            >
              <div
                style={
                  styles.field
                }
              >
                <label
                  style={
                    styles.label
                  }
                >
                  Name *
                </label>

                <input
                  style={
                    styles.input
                  }
                  value={
                    field.name
                  }
                  onChange={(
                    event
                  ) =>
                    updateCustomField(
                      index,
                      "name",
                      event.target
                        .value
                    )
                  }
                />
              </div>

              <div
                style={
                  styles.field
                }
              >
                <label
                  style={
                    styles.label
                  }
                >
                  Value
                </label>

                <input
                  style={
                    styles.input
                  }
                  value={
                    field.value
                  }
                  onChange={(
                    event
                  ) =>
                    updateCustomField(
                      index,
                      "value",
                      event.target
                        .value
                    )
                  }
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems:
                    "flex-end",
                }}
              >
                <button
                  type="button"
                  style={{
                    ...styles.button,
                    ...styles.danger,
                  }}
                  onClick={() =>
                    removeCustomField(
                      index
                    )
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {/* ================================================== */}
      {/* Actions */}
      {/* ================================================== */}

      <div style={styles.card}>
        <div style={styles.row}>
          <button
            type="button"
            disabled={loading}
            style={{
              ...styles.button,
              ...styles.primary,
              opacity: loading
                ? 0.7
                : 1,
            }}
            onClick={
              handleSubmit
            }
          >
            {loading
              ? "Creating..."
              : "Create Reverse Pick-up"}
          </button>

          <button
            type="button"
            style={{
              ...styles.button,
              ...styles.secondary,
            }}
            onClick={
              handleReset
            }
          >
            Reset
          </button>
        </div>
      </div>

      {/* ================================================== */}
      {/* Response */}
      {/* ================================================== */}

      {result && (
        <div style={styles.card}>
          <div
            style={styles.sectionTitle}
          >
            Response
          </div>

          <div style={styles.grid}>
            <div>
              <strong>
                Successful
              </strong>
              <br />
              {formatValue(
                result.successful
              )}
            </div>

            <div>
              <strong>
                Message
              </strong>
              <br />
              {formatValue(
                result.message
              )}
            </div>

            <div>
              <strong>
                Reverse Pickup Code
              </strong>
              <br />
              {formatValue(
                result.reversePickupCode
              )}
            </div>

            <div>
              <strong>
                Sale Order Item Codes
              </strong>
              <br />
              {Array.isArray(
                result.saleOrderItemCodes
              )
                ? result.saleOrderItemCodes.join(
                    ", "
                  )
                : "N/A"}
            </div>
          </div>

          {result.returnAddressDetails && (
            <div
              style={{
                marginTop: 20,
              }}
            >
              <h3>
                Return Address
              </h3>

              <div
                style={
                  styles.tableWrapper
                }
              >
                <table
                  style={
                    styles.table
                  }
                >
                  <tbody>
                    {Object.entries(
                      result.returnAddressDetails
                    ).map(
                      (
                        [key, value]
                      ) => (
                        <tr
                          key={key}
                        >
                          <th
                            style={
                              styles.th
                            }
                          >
                            {key}
                          </th>

                          <td
                            style={
                              styles.td
                            }
                          >
                            {formatValue(
                              value
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {Array.isArray(
            result.errors
          ) &&
            result.errors.length >
              0 && (
              <div
                style={{
                  ...styles.error,
                  marginTop: 20,
                }}
              >
                <strong>
                  Uniware Errors
                </strong>

                <ul>
                  {result.errors.map(
                    (
                      item,
                      index
                    ) => (
                      <li
                        key={index}
                      >
                        {item.message ||
                          item.description ||
                          JSON.stringify(
                            item
                          )}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

          {Array.isArray(
            result.warnings
          ) &&
            result.warnings.length >
              0 && (
              <div
                style={{
                  marginTop: 20,
                  padding: 14,
                  background:
                    "#fff8e1",
                  border:
                    "1px solid #ffe082",
                  borderRadius: 7,
                }}
              >
                <strong>
                  Uniware Warnings
                </strong>

                <ul>
                  {result.warnings.map(
                    (
                      item,
                      index
                    ) => (
                      <li
                        key={index}
                      >
                        {item.message ||
                          item.description ||
                          JSON.stringify(
                            item
                          )}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
        </div>
      )}

      {/* ================================================== */}
      {/* Request Preview */}
      {/* ================================================== */}

      <div style={styles.card}>
        <div
          style={styles.sectionTitle}
        >
          Request Preview
        </div>

        <pre style={styles.pre}>
          {JSON.stringify(
            requestPayload,
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}

// ============================================================
// Address Form
// ============================================================

function AddressForm({
  address,
  onChange,
}) {
  const fields = [
    [
      "id",
      "Address ID *",
    ],
    [
      "name",
      "Name *",
    ],
    [
      "addressLine1",
      "Address Line 1 *",
    ],
    [
      "addressLine2",
      "Address Line 2",
    ],
    [
      "city",
      "City *",
    ],
    [
      "state",
      "State *",
    ],
    [
      "country",
      "Country",
    ],
    [
      "pincode",
      "Pincode",
    ],
    [
      "latitude",
      "Latitude",
    ],
    [
      "longitude",
      "Longitude",
    ],
    [
      "phone",
      "Phone *",
    ],
    [
      "email",
      "Email",
    ],
  ];

  const isLargeField =
    [
      "addressLine1",
      "addressLine2",
    ].includes(
      fields[0]?.[0]
    );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 15,
      }}
    >
      {fields.map(
        ([field, label]) => (
          <div
            key={field}
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: 6,
              gridColumn:
                field ===
                  "addressLine1" ||
                field ===
                  "addressLine2"
                  ? "span 2"
                  : undefined,
            }}
          >
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#444",
              }}
            >
              {label}
            </label>

            {field ===
              "addressLine1" ||
            field ===
              "addressLine2" ? (
              <textarea
                value={
                  address[field]
                }
                onChange={(
                  event
                ) =>
                  onChange(
                    field,
                    event.target
                      .value
                  )
                }
                style={{
                  width: "100%",
                  boxSizing:
                    "border-box",
                  minHeight: 70,
                  padding:
                    "10px 12px",
                  border:
                    "1px solid #ccc",
                  borderRadius: 6,
                  resize:
                    "vertical",
                  fontSize: 14,
                }}
              />
            ) : (
              <input
                type={
                  field ===
                  "email"
                    ? "email"
                    : "text"
                }
                value={
                  address[field]
                }
                onChange={(
                  event
                ) =>
                  onChange(
                    field,
                    event.target
                      .value
                  )
                }
                style={{
                  width: "100%",
                  boxSizing:
                    "border-box",
                  padding:
                    "10px 12px",
                  border:
                    "1px solid #ccc",
                  borderRadius: 6,
                  fontSize: 14,
                }}
              />
            )}
          </div>
        )
      )}
    </div>
  );
}

export default CreateReversePickup;