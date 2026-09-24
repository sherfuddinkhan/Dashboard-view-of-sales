import React, { useMemo, useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const ITEM_TYPES = ["SIMPLE", "BUNDLE"];

const EXPIRY_OPTIONS = [
  "FROM_CATEGORY",
  "MANUFACTURING_DATE",
  "EXPIRY_DATE",
];

const TAX_CALCULATION_OPTIONS = [
  "PRICE_OF_COMPONENT_SKU",
  "PRICE_OF_BUNDLE_SKU",
];

const emptyComponent = {
  itemSku: "",
  quantity: 1,
  price: 0,
};

const emptyCustomField = {
  name: "",
  value: "",
};

const initialForm = {
  categoryCode: "",
  skuCode: "",
  name: "",
  type: "SIMPLE",

  scanType: "",
  description: "",
  scanIdentifier: "",

  length: "",
  width: "",
  height: "",
  weight: "",
  minOrderSize: "",

  color: "",
  size: "",
  brand: "",

  ean: "",
  upc: "",
  isbn: "",

  maxRetailPrice: "",
  basePrice: "",
  costPrice: "",

  taxTypeCode: "",
  gstTaxTypeCode: "",
  hsnCode: "",

  imageUrl: "",
  productPageUrl: "",
  features: "",

  tat: "",

  itemDetailFieldsText: "",

  requiresCustomization: false,
  shelfLife: "",
  expirable: false,
  enabled: true,

  determineExpiryFrom: "FROM_CATEGORY",
  dispatchExpiryTolerance: "",
  grnExpiryTolerance: "",
  returnExpiryTolerance: "",
  expirableFromCategory: false,

  expiryDate: "",

  taxCalculationType: "PRICE_OF_COMPONENT_SKU",

  batchGroupCode: "",

  tags: "",
};

function CreateOrUpdateItem() {
  const [form, setForm] = useState(initialForm);

  const [components, setComponents] = useState([
    { ...emptyComponent },
  ]);

  const [customFields, setCustomFields] = useState([
    { ...emptyCustomField },
  ]);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const isBundle = form.type === "BUNDLE";

  const skuValid = useMemo(() => {
    if (!form.skuCode.trim()) return false;

    return (
      /^[a-zA-Z0-9._/-]+$/.test(form.skuCode.trim()) &&
      form.skuCode.trim().length >= 3 &&
      form.skuCode.trim().length <= 45
    );
  }, [form.skuCode]);

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // -----------------------------
  // Component items
  // -----------------------------
  const addComponent = () => {
    setComponents((previous) => [
      ...previous,
      { ...emptyComponent },
    ]);
  };

  const removeComponent = (index) => {
    setComponents((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const updateComponent = (index, field, value) => {
    setComponents((previous) =>
      previous.map((component, itemIndex) =>
        itemIndex === index
          ? {
              ...component,
              [field]: value,
            }
          : component
      )
    );
  };

  // -----------------------------
  // Custom fields
  // -----------------------------
  const addCustomField = () => {
    setCustomFields((previous) => [
      ...previous,
      { ...emptyCustomField },
    ]);
  };

  const removeCustomField = (index) => {
    setCustomFields((previous) =>
      previous.filter((_, fieldIndex) => fieldIndex !== index)
    );
  };

  const updateCustomField = (index, field, value) => {
    setCustomFields((previous) =>
      previous.map((customField, fieldIndex) =>
        fieldIndex === index
          ? {
              ...customField,
              [field]: value,
            }
          : customField
      )
    );
  };

  // -----------------------------
  // Submit
  // -----------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResponse(null);

    const sku = form.skuCode.trim();

    if (!form.categoryCode.trim()) {
      setError("Category Code is required.");
      return;
    }

    if (!sku) {
      setError("SKU Code is required.");
      return;
    }

    if (!skuValid) {
      setError(
        "SKU must contain 3-45 characters and only letters, numbers, -, ., _, /. Spaces are not allowed."
      );
      return;
    }

    if (!form.name.trim()) {
      setError("Item Name is required.");
      return;
    }

    if (isBundle && components.length === 0) {
      setError(
        "At least one component item is required for a BUNDLE."
      );
      return;
    }

    for (const component of components) {
      if (!component.itemSku.trim()) {
        setError(
          "Every bundle component must have an Item SKU."
        );
        return;
      }

      if (
        component.quantity === "" ||
        Number(component.quantity) <= 0
      ) {
        setError(
          "Every bundle component must have a quantity greater than 0."
        );
        return;
      }

      if (
        component.price === "" ||
        Number(component.price) < 0
      ) {
        setError(
          "Every bundle component must have a valid price."
        );
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        categoryCode: form.categoryCode.trim(),
        skuCode: sku,
        name: form.name.trim(),

        type: form.type,

        scanType: form.scanType,
        description: form.description,
        scanIdentifier: form.scanIdentifier,

        length: form.length,
        width: form.width,
        height: form.height,
        weight: form.weight,
        minOrderSize: form.minOrderSize,

        color: form.color,
        size: form.size,
        brand: form.brand,

        ean: form.ean,
        upc: form.upc,
        isbn: form.isbn,

        maxRetailPrice: form.maxRetailPrice,
        basePrice: form.basePrice,
        costPrice: form.costPrice,

        taxTypeCode: form.taxTypeCode,
        gstTaxTypeCode: form.gstTaxTypeCode,
        hsnCode: form.hsnCode,

        imageUrl: form.imageUrl,
        productPageUrl: form.productPageUrl,
        features: form.features,

        tat: form.tat,

        itemDetailFieldsText:
          form.itemDetailFieldsText,

        requiresCustomization:
          form.requiresCustomization,

        shelfLife: form.shelfLife,

        expirable: form.expirable,
        enabled: form.enabled,

        determineExpiryFrom:
          form.determineExpiryFrom,

        dispatchExpiryTolerance:
          form.dispatchExpiryTolerance,

        grnExpiryTolerance:
          form.grnExpiryTolerance,

        returnExpiryTolerance:
          form.returnExpiryTolerance,

        expirableFromCategory:
          form.expirableFromCategory,

        expiryDate: form.expiryDate,

        taxCalculationType:
          isBundle
            ? form.taxCalculationType
            : undefined,

        tags: form.tags
          ? form.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],

        componentItemTypes: isBundle
          ? components.map((component) => ({
              itemSku: component.itemSku.trim(),
              quantity: Number(component.quantity),
              price: Number(component.price),
            }))
          : [],

        customFieldValues: customFields
          .filter((field) => field.name.trim())
          .map((field) => ({
            name: field.name.trim(),
            value: field.value,
          })),

        batchGroupCode: form.batchGroupCode,
      };

      const result = await axios.post(
        `${SERVER_URL}/api/uniware/items/create-or-edit`,
        payload
      );

      setResponse(result.data);
    } catch (err) {
      const data = err.response?.data;

      setError(
        data?.message ||
          data?.errors?.[0]?.message ||
          err.message ||
          "Failed to create or update item."
      );

      setResponse(data || null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setForm(initialForm);
    setComponents([{ ...emptyComponent }]);
    setCustomFields([{ ...emptyCustomField }]);
    setResponse(null);
    setError("");
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Create / Update Uniware Item
            </h1>

            <p style={styles.subtitle}>
              Create a new item or update an existing item
              using its SKU code.
            </p>
          </div>

          <div style={styles.tenantBadge}>
            Tenant Level
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* -------------------------------- */}
          {/* Basic Information */}
          {/* -------------------------------- */}
          <Section title="Basic Information">
            <div style={styles.grid}>
              <Field
                label="Category Code *"
                value={form.categoryCode}
                onChange={(value) =>
                  updateField("categoryCode", value)
                }
                placeholder="Example: ELECTRONICS"
              />

              <Field
                label="SKU Code *"
                value={form.skuCode}
                onChange={(value) =>
                  updateField("skuCode", value)
                }
                placeholder="Example: TN-WBH-001"
                error={
                  form.skuCode.length > 0 && !skuValid
                }
              />

              <Field
                label="Item Name *"
                value={form.name}
                onChange={(value) =>
                  updateField("name", value)
                }
                placeholder="Example: Wireless Bluetooth Headphones"
              />

              <SelectField
                label="Item Type"
                value={form.type}
                onChange={(value) =>
                  updateField("type", value)
                }
                options={ITEM_TYPES}
              />
            </div>

            <InfoBox>
              The Category Code must already exist in
              Uniware. SKU Code cannot contain spaces.
            </InfoBox>
          </Section>

          {/* -------------------------------- */}
          {/* Item Information */}
          {/* -------------------------------- */}
          <Section title="Item Information">
            <div style={styles.grid}>
              <Field
                label="Scan Type"
                value={form.scanType}
                onChange={(value) =>
                  updateField("scanType", value)
                }
              />

              <Field
                label="Scan Identifier"
                value={form.scanIdentifier}
                onChange={(value) =>
                  updateField("scanIdentifier", value)
                }
              />

              <Field
                label="Brand"
                value={form.brand}
                onChange={(value) =>
                  updateField("brand", value)
                }
              />

              <Field
                label="Color"
                value={form.color}
                onChange={(value) =>
                  updateField("color", value)
                }
              />

              <Field
                label="Size"
                value={form.size}
                onChange={(value) =>
                  updateField("size", value)
                }
                placeholder="60.00X40.00X2.00"
              />

              <Field
                label="EAN"
                value={form.ean}
                onChange={(value) =>
                  updateField("ean", value)
                }
              />

              <Field
                label="UPC"
                value={form.upc}
                onChange={(value) =>
                  updateField("upc", value)
                }
              />

              <Field
                label="ISBN"
                value={form.isbn}
                onChange={(value) =>
                  updateField("isbn", value)
                }
              />

              <Field
                label="HSN Code"
                value={form.hsnCode}
                onChange={(value) =>
                  updateField("hsnCode", value)
                }
              />

              <Field
                label="TAT"
                type="number"
                value={form.tat}
                onChange={(value) =>
                  updateField("tat", value)
                }
              />
            </div>

            <TextAreaField
              label="Description"
              value={form.description}
              onChange={(value) =>
                updateField("description", value)
              }
            />

            <TextAreaField
              label="Features"
              value={form.features}
              onChange={(value) =>
                updateField("features", value)
              }
            />

            <TextAreaField
              label="Item Detail Fields"
              value={form.itemDetailFieldsText}
              onChange={(value) =>
                updateField(
                  "itemDetailFieldsText",
                  value
                )
              }
              placeholder="imei, serialNumber"
            />
          </Section>

          {/* -------------------------------- */}
          {/* Dimensions */}
          {/* -------------------------------- */}
          <Section title="Dimensions & Weight">
            <div style={styles.grid}>
              <Field
                label="Length (mm)"
                type="number"
                value={form.length}
                onChange={(value) =>
                  updateField("length", value)
                }
              />

              <Field
                label="Width (mm)"
                type="number"
                value={form.width}
                onChange={(value) =>
                  updateField("width", value)
                }
              />

              <Field
                label="Height (mm)"
                type="number"
                value={form.height}
                onChange={(value) =>
                  updateField("height", value)
                }
              />

              <Field
                label="Weight (gm)"
                type="number"
                value={form.weight}
                onChange={(value) =>
                  updateField("weight", value)
                }
              />

              <Field
                label="Minimum Order Size"
                type="number"
                value={form.minOrderSize}
                onChange={(value) =>
                  updateField("minOrderSize", value)
                }
              />
            </div>
          </Section>

          {/* -------------------------------- */}
          {/* Pricing */}
          {/* -------------------------------- */}
          <Section title="Pricing">
            <div style={styles.grid}>
              <Field
                label="Maximum Retail Price"
                type="number"
                value={form.maxRetailPrice}
                onChange={(value) =>
                  updateField(
                    "maxRetailPrice",
                    value
                  )
                }
              />

              <Field
                label="Base Price"
                type="number"
                value={form.basePrice}
                onChange={(value) =>
                  updateField("basePrice", value)
                }
              />

              <Field
                label="Cost Price"
                type="number"
                value={form.costPrice}
                onChange={(value) =>
                  updateField("costPrice", value)
                }
              />

              <Field
                label="VAT Tax Type Code"
                value={form.taxTypeCode}
                onChange={(value) =>
                  updateField(
                    "taxTypeCode",
                    value
                  )
                }
              />

              <Field
                label="GST Tax Type Code"
                value={form.gstTaxTypeCode}
                onChange={(value) =>
                  updateField(
                    "gstTaxTypeCode",
                    value
                  )
                }
              />
            </div>
          </Section>

          {/* -------------------------------- */}
          {/* Marketplace */}
          {/* -------------------------------- */}
          <Section title="Marketplace">
            <div style={styles.grid}>
              <Field
                label="Image URL"
                value={form.imageUrl}
                onChange={(value) =>
                  updateField("imageUrl", value)
                }
              />

              <Field
                label="Product Page URL"
                value={form.productPageUrl}
                onChange={(value) =>
                  updateField(
                    "productPageUrl",
                    value
                  )
                }
              />

              <Field
                label="Tags"
                value={form.tags}
                onChange={(value) =>
                  updateField("tags", value)
                }
                placeholder="electronics, audio, bluetooth"
              />

              <Field
                label="Batch Group Code"
                value={form.batchGroupCode}
                onChange={(value) =>
                  updateField(
                    "batchGroupCode",
                    value
                  )
                }
              />
            </div>
          </Section>

          {/* -------------------------------- */}
          {/* Expiry */}
          {/* -------------------------------- */}
          <Section title="Expiry & Shelf Life">
            <div style={styles.grid}>
              <SelectField
                label="Determine Expiry From"
                value={form.determineExpiryFrom}
                onChange={(value) =>
                  updateField(
                    "determineExpiryFrom",
                    value
                  )
                }
                options={EXPIRY_OPTIONS}
              />

              <Field
                label="Shelf Life (days)"
                type="number"
                value={form.shelfLife}
                onChange={(value) =>
                  updateField("shelfLife", value)
                }
              />

              <Field
                label="Dispatch Expiry Tolerance (days)"
                type="number"
                value={form.dispatchExpiryTolerance}
                onChange={(value) =>
                  updateField(
                    "dispatchExpiryTolerance",
                    value
                  )
                }
              />

              <Field
                label="GRN Expiry Tolerance (days)"
                type="number"
                value={form.grnExpiryTolerance}
                onChange={(value) =>
                  updateField(
                    "grnExpiryTolerance",
                    value
                  )
                }
              />

              <Field
                label="Return Expiry Tolerance (days)"
                type="number"
                value={form.returnExpiryTolerance}
                onChange={(value) =>
                  updateField(
                    "returnExpiryTolerance",
                    value
                  )
                }
              />

              <Field
                label="Expiry Date"
                type="date"
                value={form.expiryDate}
                onChange={(value) =>
                  updateField("expiryDate", value)
                }
              />
            </div>

            <div style={styles.checkboxRow}>
              <Checkbox
                label="Expirable"
                checked={form.expirable}
                onChange={(value) =>
                  updateField("expirable", value)
                }
              />

              <Checkbox
                label="Expirable From Category"
                checked={form.expirableFromCategory}
                onChange={(value) =>
                  updateField(
                    "expirableFromCategory",
                    value
                  )
                }
              />
            </div>
          </Section>

          {/* -------------------------------- */}
          {/* Settings */}
          {/* -------------------------------- */}
          <Section title="Item Settings">
            <div style={styles.checkboxRow}>
              <Checkbox
                label="Enabled"
                checked={form.enabled}
                onChange={(value) =>
                  updateField("enabled", value)
                }
              />

              <Checkbox
                label="Requires Customization"
                checked={form.requiresCustomization}
                onChange={(value) =>
                  updateField(
                    "requiresCustomization",
                    value
                  )
                }
              />
            </div>
          </Section>

          {/* -------------------------------- */}
          {/* Bundle */}
          {/* -------------------------------- */}
          {isBundle && (
            <Section title="Bundle Components">
              <div style={styles.bundleHeader}>
                <div>
                  <strong>
                    Component Item Types
                  </strong>

                  <div style={styles.smallText}>
                    Every component requires an Item
                    SKU, quantity and price.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addComponent}
                  style={styles.secondaryButton}
                >
                  + Add Component
                </button>
              </div>

              {components.map((component, index) => (
                <div
                  key={index}
                  style={styles.repeatRow}
                >
                  <Field
                    label="Component SKU"
                    value={component.itemSku}
                    onChange={(value) =>
                      updateComponent(
                        index,
                        "itemSku",
                        value
                      )
                    }
                  />

                  <Field
                    label="Quantity"
                    type="number"
                    value={component.quantity}
                    onChange={(value) =>
                      updateComponent(
                        index,
                        "quantity",
                        value
                      )
                    }
                  />

                  <Field
                    label="Price"
                    type="number"
                    value={component.price}
                    onChange={(value) =>
                      updateComponent(
                        index,
                        "price",
                        value
                      )
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeComponent(index)
                    }
                    style={styles.removeButton}
                    disabled={components.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div style={styles.grid}>
                <SelectField
                  label="Bundle Tax Calculation"
                  value={form.taxCalculationType}
                  onChange={(value) =>
                    updateField(
                      "taxCalculationType",
                      value
                    )
                  }
                  options={TAX_CALCULATION_OPTIONS}
                />
              </div>
            </Section>
          )}

          {/* -------------------------------- */}
          {/* Custom Fields */}
          {/* -------------------------------- */}
          <Section title="Custom Fields">
            <div style={styles.bundleHeader}>
              <div>
                <strong>
                  Custom Field Values
                </strong>

                <div style={styles.smallText}>
                  Custom field name is required when a
                  field is sent.
                </div>
              </div>

              <button
                type="button"
                onClick={addCustomField}
                style={styles.secondaryButton}
              >
                + Add Custom Field
              </button>
            </div>

            {customFields.map((field, index) => (
              <div
                key={index}
                style={styles.repeatRow}
              >
                <Field
                  label="Field Name"
                  value={field.name}
                  onChange={(value) =>
                    updateCustomField(
                      index,
                      "name",
                      value
                    )
                  }
                />

                <Field
                  label="Value"
                  value={field.value}
                  onChange={(value) =>
                    updateCustomField(
                      index,
                      "value",
                      value
                    )
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    removeCustomField(index)
                  }
                  style={styles.removeButton}
                  disabled={customFields.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
          </Section>

          {/* -------------------------------- */}
          {/* Actions */}
          {/* -------------------------------- */}
          <div style={styles.actions}>
            <button
              type="button"
              onClick={handleClear}
              style={styles.clearButton}
              disabled={loading}
            >
              Clear
            </button>

            <button
              type="submit"
              style={styles.submitButton}
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : "Create / Update Item"}
            </button>
          </div>
        </form>

        {/* -------------------------------- */}
        {/* Error */}
        {/* -------------------------------- */}
        {error && (
          <div style={styles.errorBox}>
            <strong>Error</strong>
            <div>{error}</div>
          </div>
        )}

        {/* -------------------------------- */}
        {/* Response */}
        {/* -------------------------------- */}
        {response && (
          <ResponsePanel response={response} />
        )}
      </div>
    </div>
  );
}

// ======================================================
// Components
// ======================================================

function Section({ title, children }) {
  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  error = false,
}) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>

      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        style={{
          ...styles.input,
          ...(error ? styles.inputError : {}),
        }}
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder = "",
}) {
  return (
    <label style={styles.fieldFull}>
      <span style={styles.label}>{label}</span>

      <textarea
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        rows={4}
        style={styles.textarea}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        style={styles.input}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}) {
  return (
    <label style={styles.checkbox}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
      />

      <span>{label}</span>
    </label>
  );
}

function InfoBox({ children }) {
  return (
    <div style={styles.infoBox}>
      {children}
    </div>
  );
}

function ResponsePanel({ response }) {
  const item = response?.itemType;

  return (
    <div style={styles.responseSection}>
      <h2 style={styles.sectionTitle}>
        Uniware Response
      </h2>

      <div
        style={{
          ...styles.status,
          ...(response.successful
            ? styles.success
            : styles.failed),
        }}
      >
        <strong>
          {response.successful
            ? "SUCCESS"
            : "FAILED"}
        </strong>

        {response.message && (
          <span>{response.message}</span>
        )}
      </div>

      {item && (
        <div style={styles.itemCard}>
          <h3 style={styles.cardTitle}>
            Item Details
          </h3>

          <div style={styles.responseGrid}>
            <ResponseValue
              label="ID"
              value={item.id}
            />

            <ResponseValue
              label="SKU"
              value={item.skuCode}
            />

            <ResponseValue
              label="Name"
              value={item.name}
            />

            <ResponseValue
              label="Category"
              value={item.categoryCode}
            />

            <ResponseValue
              label="Type"
              value={item.type}
            />

            <ResponseValue
              label="Brand"
              value={item.brand}
            />

            <ResponseValue
              label="Color"
              value={item.color}
            />

            <ResponseValue
              label="Size"
              value={item.size}
            />

            <ResponseValue
              label="MRP"
              value={item.maxRetailPrice}
            />

            <ResponseValue
              label="Base Price"
              value={item.basePrice}
            />

            <ResponseValue
              label="Cost Price"
              value={item.costPrice}
            />

            <ResponseValue
              label="GST Tax Code"
              value={item.gstTaxTypeCode}
            />

            <ResponseValue
              label="HSN"
              value={item.hsnCode}
            />

            <ResponseValue
              label="Enabled"
              value={
                item.enabled === undefined
                  ? undefined
                  : item.enabled
                    ? "Yes"
                    : "No"
              }
            />

            <ResponseValue
              label="Expirable"
              value={
                item.expirable === undefined
                  ? undefined
                  : item.expirable
                    ? "Yes"
                    : "No"
              }
            />
          </div>
        </div>
      )}

      {response.errors?.length > 0 && (
        <div style={styles.errorBox}>
          <h3>Uniware Errors</h3>

          {response.errors.map((item, index) => (
            <div
              key={index}
              style={styles.responseError}
            >
              <strong>
                {item.fieldName || "Error"}
              </strong>

              <div>
                {item.message ||
                  item.description ||
                  "Unknown error"}
              </div>
            </div>
          ))}
        </div>
      )}

      {response.warnings?.length > 0 && (
        <div style={styles.warningBox}>
          <h3>Warnings</h3>

          {response.warnings.map(
            (warning, index) => (
              <div key={index}>
                <strong>
                  {warning.message ||
                    "Warning"}
                </strong>

                {warning.description && (
                  <div>
                    {warning.description}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}

      <details style={styles.rawDetails}>
        <summary>View Raw Response</summary>

        <pre style={styles.pre}>
          {JSON.stringify(response, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function ResponseValue({ label, value }) {
  return (
    <div style={styles.responseValue}>
      <div style={styles.responseLabel}>
        {label}
      </div>

      <div style={styles.responseText}>
        {value === undefined ||
        value === null ||
        value === ""
          ? "N/A"
          : String(value)}
      </div>
    </div>
  );
}

// ======================================================
// Styles
// ======================================================

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f8",
    padding: "30px 20px",
    fontFamily:
      "Arial, Helvetica, sans-serif",
  },

  container: {
    maxWidth: "1250px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    color: "#1f2937",
  },

  subtitle: {
    marginTop: "8px",
    color: "#6b7280",
  },

  tenantBadge: {
    padding: "8px 14px",
    borderRadius: "20px",
    background: "#e0f2fe",
    color: "#0369a1",
    fontWeight: 700,
    fontSize: "13px",
    whiteSpace: "nowrap",
  },

  section: {
    background: "#ffffff",
    borderRadius: "10px",
    padding: "22px",
    marginBottom: "18px",
    boxShadow:
      "0 1px 4px rgba(0,0,0,0.08)",
  },

  sectionTitle: {
    margin: "0 0 18px",
    fontSize: "19px",
    color: "#111827",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  fieldFull: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginTop: "16px",
  },

  label: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#374151",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    padding: "10px 11px",
    fontSize: "14px",
    outline: "none",
    background: "#fff",
  },

  inputError: {
    border: "1px solid #dc2626",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    padding: "10px 11px",
    fontSize: "14px",
    resize: "vertical",
  },

  infoBox: {
    marginTop: "16px",
    padding: "12px 14px",
    borderRadius: "6px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: "13px",
  },

  checkboxRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "25px",
  },

  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    cursor: "pointer",
  },

  bundleHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "15px",
  },

  smallText: {
    marginTop: "4px",
    fontSize: "12px",
    color: "#6b7280",
  },

  repeatRow: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    alignItems: "end",
    padding: "14px",
    marginBottom: "10px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "7px",
  },

  secondaryButton: {
    border: "none",
    borderRadius: "6px",
    padding: "9px 14px",
    background: "#374151",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },

  removeButton: {
    border: "1px solid #dc2626",
    borderRadius: "6px",
    padding: "9px 14px",
    background: "#fff",
    color: "#dc2626",
    cursor: "pointer",
    fontWeight: 600,
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginBottom: "20px",
  },

  clearButton: {
    border: "1px solid #9ca3af",
    borderRadius: "6px",
    padding: "11px 22px",
    background: "#fff",
    color: "#374151",
    cursor: "pointer",
    fontWeight: 700,
  },

  submitButton: {
    border: "none",
    borderRadius: "6px",
    padding: "11px 24px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },

  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "18px",
  },

  warningBox: {
    background: "#fffbeb",
    border: "1px solid #fde68a",
    color: "#92400e",
    borderRadius: "8px",
    padding: "15px",
    marginTop: "15px",
  },

  responseSection: {
    background: "#ffffff",
    borderRadius: "10px",
    padding: "22px",
    boxShadow:
      "0 1px 4px rgba(0,0,0,0.08)",
  },

  status: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    padding: "12px",
    borderRadius: "7px",
    marginBottom: "15px",
  },

  success: {
    background: "#ecfdf5",
    color: "#065f46",
  },

  failed: {
    background: "#fef2f2",
    color: "#991b1b",
  },

  itemCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "18px",
  },

  cardTitle: {
    margin: "0 0 15px",
    fontSize: "16px",
  },

  responseGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
  },

  responseValue: {
    padding: "10px",
    background: "#f9fafb",
    borderRadius: "6px",
  },

  responseLabel: {
    fontSize: "11px",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: "4px",
  },

  responseText: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#111827",
    wordBreak: "break-word",
  },

  responseError: {
    padding: "9px 0",
    borderBottom: "1px solid #fecaca",
  },

  rawDetails: {
    marginTop: "18px",
  },

  pre: {
    background: "#111827",
    color: "#e5e7eb",
    padding: "15px",
    borderRadius: "7px",
    overflow: "auto",
    fontSize: "12px",
    lineHeight: 1.5,
  },
};

export default CreateOrUpdateItem;