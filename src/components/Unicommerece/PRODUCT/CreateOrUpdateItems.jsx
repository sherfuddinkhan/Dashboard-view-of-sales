import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const createEmptyItem = () => ({
  categoryCode: "",
  skuCode: "",
  name: "",
  type: "SIMPLE",

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

  tags: "",

  itemDetailFieldsText: "",

  requiresCustomization: false,
  shelfLife: "",
  expirable: false,
  enabled: true,

  taxCalculationType:
    "PRICE_OF_COMPONENT_SKU",

  componentItemTypes: [
    {
      itemSku: "",
      quantity: 1,
      price: 0,
    },
  ],

  customFieldValues: [
    {
      name: "",
      value: "",
    },
  ],
});

const CreateOrUpdateItems = () => {
  const [items, setItems] = useState([
    createEmptyItem(),
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState(null);

  // ==========================================================
  // Item operations
  // ==========================================================

  const addItem = () => {
    setItems((previous) => [
      ...previous,
      createEmptyItem(),
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      return;
    }

    setItems((previous) =>
      previous.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  };

  const updateItem = (
    itemIndex,
    field,
    value
  ) => {
    setItems((previous) =>
      previous.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  // ==========================================================
  // Component operations
  // ==========================================================

  const addComponent = (itemIndex) => {
    setItems((previous) =>
      previous.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              componentItemTypes: [
                ...item.componentItemTypes,
                {
                  itemSku: "",
                  quantity: 1,
                  price: 0,
                },
              ],
            }
          : item
      )
    );
  };

  const removeComponent = (
    itemIndex,
    componentIndex
  ) => {
    setItems((previous) =>
      previous.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              componentItemTypes:
                item.componentItemTypes.filter(
                  (_, index) =>
                    index !== componentIndex
                ),
            }
          : item
      )
    );
  };

  const updateComponent = (
    itemIndex,
    componentIndex,
    field,
    value
  ) => {
    setItems((previous) =>
      previous.map((item, index) => {
        if (index !== itemIndex) {
          return item;
        }

        return {
          ...item,
          componentItemTypes:
            item.componentItemTypes.map(
              (component, index) =>
                index === componentIndex
                  ? {
                      ...component,
                      [field]: value,
                    }
                  : component
            ),
        };
      })
    );
  };

  // ==========================================================
  // Custom fields
  // ==========================================================

  const addCustomField = (itemIndex) => {
    setItems((previous) =>
      previous.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              customFieldValues: [
                ...item.customFieldValues,
                {
                  name: "",
                  value: "",
                },
              ],
            }
          : item
      )
    );
  };

  const removeCustomField = (
    itemIndex,
    fieldIndex
  ) => {
    setItems((previous) =>
      previous.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              customFieldValues:
                item.customFieldValues.filter(
                  (_, index) =>
                    index !== fieldIndex
                ),
            }
          : item
      )
    );
  };

  const updateCustomField = (
    itemIndex,
    fieldIndex,
    field,
    value
  ) => {
    setItems((previous) =>
      previous.map((item, index) => {
        if (index !== itemIndex) {
          return item;
        }

        return {
          ...item,
          customFieldValues:
            item.customFieldValues.map(
              (customField, index) =>
                index === fieldIndex
                  ? {
                      ...customField,
                      [field]: value,
                    }
                  : customField
            ),
        };
      })
    );
  };

  // ==========================================================
  // Validate
  // ==========================================================

  const validateItems = () => {
    for (
      let index = 0;
      index < items.length;
      index++
    ) {
      const item = items[index];

      if (!item.categoryCode.trim()) {
        return `Item ${index + 1}: Category Code is required.`;
      }

      if (!item.skuCode.trim()) {
        return `Item ${index + 1}: SKU Code is required.`;
      }

      const sku = item.skuCode.trim();

      if (
        sku.length < 3 ||
        sku.length > 45
      ) {
        return `Item ${
          index + 1
        }: SKU must be between 3 and 45 characters.`;
      }

      if (!/^[a-zA-Z0-9._/-]+$/.test(sku)) {
        return `Item ${
          index + 1
        }: SKU contains invalid characters. Spaces are not allowed.`;
      }

      if (!item.name.trim()) {
        return `Item ${index + 1}: Item Name is required.`;
      }

      if (item.name.trim().length > 200) {
        return `Item ${index + 1}: Item Name cannot exceed 200 characters.`;
      }

      if (item.type === "BUNDLE") {
        if (
          !item.componentItemTypes ||
          item.componentItemTypes.length === 0
        ) {
          return `Item ${
            index + 1
          }: Add at least one bundle component.`;
        }

        for (
          let componentIndex = 0;
          componentIndex <
          item.componentItemTypes.length;
          componentIndex++
        ) {
          const component =
            item.componentItemTypes[
              componentIndex
            ];

          if (!component.itemSku.trim()) {
            return (
              `Item ${index + 1}, component ` +
              `${componentIndex + 1}: Component SKU is required.`
            );
          }

          if (
            !component.quantity ||
            Number(component.quantity) <= 0
          ) {
            return (
              `Item ${index + 1}, component ` +
              `${componentIndex + 1}: Quantity must be greater than 0.`
            );
          }
        }
      }
    }

    return null;
  };

  // ==========================================================
  // Submit
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResponse(null);

    const validationError =
      validateItems();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        itemTypes: items.map((item) => {
          const result = {
            categoryCode:
              item.categoryCode.trim(),

            skuCode:
              item.skuCode.trim(),

            name:
              item.name.trim(),

            type: item.type,

            description:
              item.description,

            scanIdentifier:
              item.scanIdentifier,

            length:
              item.length === ""
                ? undefined
                : Number(item.length),

            width:
              item.width === ""
                ? undefined
                : Number(item.width),

            height:
              item.height === ""
                ? undefined
                : Number(item.height),

            weight:
              item.weight === ""
                ? undefined
                : Number(item.weight),

            minOrderSize:
              item.minOrderSize === ""
                ? undefined
                : Number(item.minOrderSize),

            color: item.color,
            size: item.size,
            brand: item.brand,

            ean: item.ean,
            upc: item.upc,
            isbn: item.isbn,

            maxRetailPrice:
              item.maxRetailPrice === ""
                ? undefined
                : Number(
                    item.maxRetailPrice
                  ),

            basePrice:
              item.basePrice === ""
                ? undefined
                : Number(item.basePrice),

            costPrice:
              item.costPrice === ""
                ? undefined
                : Number(item.costPrice),

            taxTypeCode:
              item.taxTypeCode,

            gstTaxTypeCode:
              item.gstTaxTypeCode,

            hsnCode:
              item.hsnCode,

            imageUrl:
              item.imageUrl,

            productPageUrl:
              item.productPageUrl,

            features:
              item.features,

            tat:
              item.tat === ""
                ? undefined
                : Number(item.tat),

            tags: item.tags
              ? item.tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean)
              : [],

            itemDetailFieldsText:
              item.itemDetailFieldsText,

            requiresCustomization:
              item.requiresCustomization,

            shelfLife:
              item.shelfLife === ""
                ? undefined
                : Number(item.shelfLife),

            expirable:
              item.expirable,

            enabled:
              item.enabled,

            taxCalculationType:
              item.type === "BUNDLE"
                ? item.taxCalculationType
                : undefined,

            componentItemTypes:
              item.type === "BUNDLE"
                ? item.componentItemTypes.map(
                    (component) => ({
                      itemSku:
                        component.itemSku.trim(),

                      quantity:
                        Number(
                          component.quantity
                        ),

                      price:
                        Number(
                          component.price
                        ),
                    })
                  )
                : [],

            customFieldValues:
              item.customFieldValues
                .filter(
                  (field) =>
                    field.name.trim()
                )
                .map((field) => ({
                  name:
                    field.name.trim(),
                  value:
                    field.value,
                })),
          };

          return result;
        }),
      };

      const result = await axios.post(
        `${SERVER_URL}/api/uniware/items/bulk-create-or-edit`,
        payload
      );

      setResponse(result.data);
    } catch (err) {
      const data = err.response?.data;

      setError(
        data?.message ||
          data?.errors?.[0]?.message ||
          err.message ||
          "Failed to create or update items."
      );

      setResponse(data || null);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // Clear
  // ==========================================================

  const handleClear = () => {
    setItems([createEmptyItem()]);
    setError("");
    setResponse(null);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Create / Update Items
            </h1>

            <p style={styles.subtitle}>
              Create or update multiple Uniware
              items in a single API request.
            </p>
          </div>

          <div style={styles.badge}>
            TENANT LEVEL
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {items.map((item, itemIndex) => (
            <ItemCard
              key={itemIndex}
              item={item}
              itemIndex={itemIndex}
              itemCount={items.length}
              updateItem={updateItem}
              removeItem={removeItem}
              addComponent={addComponent}
              removeComponent={
                removeComponent
              }
              updateComponent={
                updateComponent
              }
              addCustomField={
                addCustomField
              }
              removeCustomField={
                removeCustomField
              }
              updateCustomField={
                updateCustomField
              }
            />
          ))}

          <div style={styles.bottomActions}>
            <button
              type="button"
              onClick={addItem}
              style={styles.addItemButton}
            >
              + Add Another Item
            </button>

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
                ? "Submitting..."
                : `Create / Update ${items.length} Item${
                    items.length > 1
                      ? "s"
                      : ""
                  }`}
            </button>
          </div>
        </form>

        {error && (
          <div style={styles.errorBox}>
            <strong>Error</strong>
            <div>{error}</div>
          </div>
        )}

        {response && (
          <ResponsePanel
            response={response}
          />
        )}
      </div>
    </div>
  );
};

// ============================================================
// Item Card
// ============================================================

function ItemCard({
  item,
  itemIndex,
  itemCount,
  updateItem,
  removeItem,
  addComponent,
  removeComponent,
  updateComponent,
  addCustomField,
  removeCustomField,
  updateCustomField,
}) {
  const isBundle =
    item.type === "BUNDLE";

  return (
    <section style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <h2 style={styles.cardTitle}>
            Item {itemIndex + 1}
          </h2>

          <span style={styles.cardSubtitle}>
            {item.skuCode ||
              "New Uniware Item"}
          </span>
        </div>

        {itemCount > 1 && (
          <button
            type="button"
            onClick={() =>
              removeItem(itemIndex)
            }
            style={styles.removeItemButton}
          >
            Remove Item
          </button>
        )}
      </div>

      {/* Basic */}
      <Section title="Basic Information">
        <div style={styles.grid}>
          <Field
            label="Category Code *"
            value={item.categoryCode}
            onChange={(value) =>
              updateItem(
                itemIndex,
                "categoryCode",
                value
              )
            }
            placeholder="ELECTRONICS"
          />

          <Field
            label="SKU Code *"
            value={item.skuCode}
            onChange={(value) =>
              updateItem(
                itemIndex,
                "skuCode",
                value
              )
            }
            placeholder="TN-WBH-001"
          />

          <Field
            label="Item Name *"
            value={item.name}
            onChange={(value) =>
              updateItem(
                itemIndex,
                "name",
                value
              )
            }
            placeholder="Wireless Bluetooth Headphones"
          />

          <SelectField
            label="Item Type"
            value={item.type}
            onChange={(value) =>
              updateItem(
                itemIndex,
                "type",
                value
              )
            }
            options={[
              "SIMPLE",
              "BUNDLE",
            ]}
          />
        </div>
      </Section>

      {/* Product */}
      <Section title="Product Information">
        <div style={styles.grid}>
          <Field
            label="Brand"
            value={item.brand}
            onChange={(value) =>
              updateItem(
                itemIndex,
                "brand",
                value
              )
            }
          />

          <Field
            label="Color"
            value={item.color}
            onChange={(value) =>
              updateItem(
                itemIndex,
                "color",
                value
              )
            }
          />

          <Field
            label="Size"
            value={item.size}
            onChange={(value) =>
              updateItem(
                itemIndex,
                "size",
                value
              )
            }
            placeholder="60.00X40.00X2.00"
          />

          <Field
            label="EAN"
            value={item.ean}
            onChange={(value) =>
              updateItem(
                itemIndex,
                "ean",
                value
              )
            }
          />

          <Field
            label="UPC"
            value={item.upc}
            onChange={(value) =>
              updateItem(
                itemIndex,
                "upc",
                value
              )
            }
          />

          <Field
            label="ISBN"
            value={item.isbn}
            onChange={(value) =>
              updateItem(
                itemIndex,
                "isbn",
                value
              )
            }
          />

          <Field
            label="HSN Code"
            value={item.hsnCode}
            onChange={(value) =>
              updateItem(
                itemIndex,
                "hsnCode",
                value
              )
            }
          />

          <Field
            label="Scan Identifier"
            value={item.scanIdentifier}
            onChange={(value) =>
              updateItem(
                itemIndex,
                "scanIdentifier",
                value
              )
            }
          />
        </div>

        <TextArea
          label="Description"
          value={item.description}
          onChange={(value) =>
            updateItem(
              itemIndex,
              "description",
              value
            )
          }
        />

        <TextArea
          label="Features"
          value={item.features}
          onChange={(value) =>
            updateItem(
              itemIndex,
              "features",
              value
            )
          }
        />

        <TextArea
          label="Item Detail Fields"
          value={
            item.itemDetailFieldsText
          }
          onChange={(value) =>
            updateItem(
              itemIndex,
              "itemDetailFieldsText",
              value
            )
          }
          placeholder="imei, serialNumber"
        />
      </Section>

      {/* Dimensions */}
      <Section title="Dimensions & Weight">
        <div style={styles.grid}>
          <NumberField
            label="Length (mm)"
            value={item.length}
            onChange={(value) =>
              updateItem(
                itemIndex,
                "length",
                value
              )
            }
          />

          <NumberField
            label="Width (mm)"
            value={item.width}
            onChange={(value) =>
              updateItem(
                itemIndex,
                "width",
                value
              )
            }
          />

          <NumberField
            label="Height (mm)"
            value={item.height}
            onChange={(value) =>
              updateItem(
                itemIndex,
                "height",
                value
              )
            }
          />

          <NumberField
            label="Weight (gm)"
            value={item.weight}
            onChange={(value) =>
              updateItem(
                itemIndex,
                "weight",
                value
              )
            }
          />

          <NumberField
            label="Minimum Order Size"
            value={item.minOrderSize}
            onChange={(value) =>
              updateItem(
                itemIndex,
                "minOrderSize",
                value
              )
            }
          />

          <NumberField
            label="TAT"
            value={item.tat}
            onChange={(value) =>
              updateItem(
                itemIndex,
                "tat",
                value
              )
            }
          />
        </div>
      </Section>

      {/* Pricing */}
      <Section title="Pricing & Tax">
        <div style={styles.grid}>
          <NumberField
            label="Maximum Retail Price"
            value={
              item.maxRetailPrice
            }
            onChange={(value) =>
              updateItem(
                itemIndex,
                "maxRetailPrice",
                value
              )
            }
          />

          <NumberField
            label="Base Price"
            value={item.basePrice}
            onChange={(value) =>
              updateItem(
                itemIndex,
                "basePrice",
                value
              )
            }
          />

          <NumberField
            label="Cost Price"
            value={item.costPrice}
            onChange={(value) =>
              updateItem(
                itemIndex,
                "costPrice",
                value
              )
            }
          />

          <Field
            label="VAT Tax Type Code"
            value={item.taxTypeCode}
            onChange={(value) =>
              updateItem(
                itemIndex,
                "taxTypeCode",
                value
              )
            }
          />

          <Field
            label="GST Tax Type Code"
            value={
              item.gstTaxTypeCode
            }
            onChange={(value) =>
              updateItem(
                itemIndex,
                "gstTaxTypeCode",
                value
              )
            }
          />
        </div>
      </Section>

      {/* Marketplace */}
      <Section title="Marketplace">
        <div style={styles.grid}>
          <Field
            label="Image URL"
            value={item.imageUrl}
            onChange={(value) =>
              updateItem(
                itemIndex,
                "imageUrl",
                value
              )
            }
          />

          <Field
            label="Product Page URL"
            value={
              item.productPageUrl
            }
            onChange={(value) =>
              updateItem(
                itemIndex,
                "productPageUrl",
                value
              )
            }
          />

          <Field
            label="Tags"
            value={item.tags}
            onChange={(value) =>
              updateItem(
                itemIndex,
                "tags",
                value
              )
            }
            placeholder="audio, bluetooth, electronics"
          />

          <NumberField
            label="Shelf Life (days)"
            value={item.shelfLife}
            onChange={(value) =>
              updateItem(
                itemIndex,
                "shelfLife",
                value
              )
            }
          />
        </div>
      </Section>

      {/* Settings */}
      <Section title="Settings">
        <div style={styles.checkboxRow}>
          <Checkbox
            label="Enabled"
            checked={item.enabled}
            onChange={(value) =>
              updateItem(
                itemIndex,
                "enabled",
                value
              )
            }
          />

          <Checkbox
            label="Expirable"
            checked={item.expirable}
            onChange={(value) =>
              updateItem(
                itemIndex,
                "expirable",
                value
              )
            }
          />

          <Checkbox
            label="Requires Customization"
            checked={
              item.requiresCustomization
            }
            onChange={(value) =>
              updateItem(
                itemIndex,
                "requiresCustomization",
                value
              )
            }
          />
        </div>
      </Section>

      {/* Bundle */}
      {isBundle && (
        <Section title="Bundle Components">
          <div style={styles.sectionToolbar}>
            <div>
              <strong>
                Component Items
              </strong>

              <p style={styles.helper}>
                Each component requires SKU,
                quantity and price.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                addComponent(itemIndex)
              }
              style={styles.secondaryButton}
            >
              + Add Component
            </button>
          </div>

          {item.componentItemTypes.map(
            (component, componentIndex) => (
              <div
                key={componentIndex}
                style={styles.repeatRow}
              >
                <Field
                  label="Component SKU"
                  value={
                    component.itemSku
                  }
                  onChange={(value) =>
                    updateComponent(
                      itemIndex,
                      componentIndex,
                      "itemSku",
                      value
                    )
                  }
                />

                <NumberField
                  label="Quantity"
                  value={
                    component.quantity
                  }
                  onChange={(value) =>
                    updateComponent(
                      itemIndex,
                      componentIndex,
                      "quantity",
                      value
                    )
                  }
                />

                <NumberField
                  label="Price"
                  value={
                    component.price
                  }
                  onChange={(value) =>
                    updateComponent(
                      itemIndex,
                      componentIndex,
                      "price",
                      value
                    )
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    removeComponent(
                      itemIndex,
                      componentIndex
                    )
                  }
                  style={
                    styles.removeButton
                  }
                  disabled={
                    item
                      .componentItemTypes
                      .length === 1
                  }
                >
                  Remove
                </button>
              </div>
            )
          )}

          <SelectField
            label="Tax Calculation Type"
            value={
              item.taxCalculationType
            }
            onChange={(value) =>
              updateItem(
                itemIndex,
                "taxCalculationType",
                value
              )
            }
            options={[
              "PRICE_OF_COMPONENT_SKU",
              "PRICE_OF_BUNDLE_SKU",
            ]}
          />
        </Section>
      )}

      {/* Custom fields */}
      <Section title="Custom Fields">
        <div style={styles.sectionToolbar}>
          <div>
            <strong>
              Custom Field Values
            </strong>

            <p style={styles.helper}>
              Field name is required when a
              custom field is submitted.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              addCustomField(itemIndex)
            }
            style={styles.secondaryButton}
          >
            + Add Custom Field
          </button>
        </div>

        {item.customFieldValues.map(
          (field, fieldIndex) => (
            <div
              key={fieldIndex}
              style={styles.repeatRow}
            >
              <Field
                label="Field Name"
                value={field.name}
                onChange={(value) =>
                  updateCustomField(
                    itemIndex,
                    fieldIndex,
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
                    itemIndex,
                    fieldIndex,
                    "value",
                    value
                  )
                }
              />

              <button
                type="button"
                onClick={() =>
                  removeCustomField(
                    itemIndex,
                    fieldIndex
                  )
                }
                style={
                  styles.removeButton
                }
                disabled={
                  item
                    .customFieldValues
                    .length === 1
                }
              >
                Remove
              </button>
            </div>
          )
        )}
      </Section>
    </section>
  );
}

// ============================================================
// UI Components
// ============================================================

function Section({ title, children }) {
  return (
    <div style={styles.subSection}>
      <h3 style={styles.subTitle}>
        {title}
      </h3>

      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder = "",
}) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>
        {label}
      </span>

      <input
        type="text"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        style={styles.input}
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>
        {label}
      </span>

      <input
        type="number"
        value={value ?? ""}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        style={styles.input}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder = "",
}) {
  return (
    <label style={styles.fullField}>
      <span style={styles.label}>
        {label}
      </span>

      <textarea
        value={value ?? ""}
        placeholder={placeholder}
        rows={3}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
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
      <span style={styles.label}>
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        style={styles.input}
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
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
          onChange(
            event.target.checked
          )
        }
      />

      <span>{label}</span>
    </label>
  );
}

// ============================================================
// Response
// ============================================================

function ResponsePanel({ response }) {
  const item = response?.itemType;

  return (
    <div style={styles.responseCard}>
      <h2 style={styles.responseTitle}>
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

        <span>
          {response.message ||
            "No message returned."}
        </span>
      </div>

      {item && (
        <div style={styles.itemResult}>
          <h3>Item Result</h3>

          <div style={styles.resultGrid}>
            <Result
              label="ID"
              value={item.id}
            />

            <Result
              label="SKU"
              value={item.skuCode}
            />

            <Result
              label="Name"
              value={item.name}
            />

            <Result
              label="Category"
              value={item.categoryCode}
            />

            <Result
              label="Type"
              value={item.type}
            />

            <Result
              label="Brand"
              value={item.brand}
            />

            <Result
              label="MRP"
              value={
                item.maxRetailPrice
              }
            />

            <Result
              label="Base Price"
              value={item.basePrice}
            />

            <Result
              label="Cost Price"
              value={item.costPrice}
            />

            <Result
              label="GST"
              value={
                item.gstTaxTypeCode
              }
            />

            <Result
              label="HSN"
              value={item.hsnCode}
            />

            <Result
              label="Enabled"
              value={
                item.enabled ===
                undefined
                  ? undefined
                  : item.enabled
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

          {response.errors.map(
            (error, index) => (
              <div
                key={index}
                style={
                  styles.errorItem
                }
              >
                <strong>
                  {error.fieldName ||
                    "Error"}
                </strong>

                <div>
                  {error.message ||
                    error.description ||
                    "Unknown error"}
                </div>
              </div>
            )
          )}
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
                    {
                      warning.description
                    }
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}

      <details style={styles.raw}>
        <summary>
          View Raw Uniware Response
        </summary>

        <pre style={styles.pre}>
          {JSON.stringify(
            response,
            null,
            2
          )}
        </pre>
      </details>
    </div>
  );
}

function Result({ label, value }) {
  return (
    <div style={styles.result}>
      <div style={styles.resultLabel}>
        {label}
      </div>

      <div style={styles.resultValue}>
        {value === undefined ||
        value === null ||
        value === ""
          ? "N/A"
          : String(value)}
      </div>
    </div>
  );
}

// ============================================================
// Styles
// ============================================================

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    padding: "30px 20px",
    fontFamily:
      "Arial, Helvetica, sans-serif",
  },

  container: {
    maxWidth: "1300px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    color: "#111827",
  },

  subtitle: {
    color: "#6b7280",
    marginTop: "7px",
  },

  badge: {
    background: "#e0f2fe",
    color: "#0369a1",
    padding: "8px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 700,
  },

  card: {
    background: "#fff",
    borderRadius: "10px",
    marginBottom: "20px",
    boxShadow:
      "0 1px 5px rgba(0,0,0,.08)",
    overflow: "hidden",
  },

  cardHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    padding: "18px 22px",
    background: "#f9fafb",
    borderBottom:
      "1px solid #e5e7eb",
  },

  cardTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#111827",
  },

  cardSubtitle: {
    display: "block",
    marginTop: "4px",
    color: "#6b7280",
    fontSize: "13px",
  },

  subSection: {
    padding: "20px 22px",
    borderBottom:
      "1px solid #f0f0f0",
  },

  subTitle: {
    margin:
      "0 0 15px",
    fontSize: "17px",
    color: "#1f2937",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "15px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  fullField: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginTop: "15px",
  },

  label: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#374151",
  },

  input: {
    boxSizing: "border-box",
    width: "100%",
    padding: "10px 11px",
    border:
      "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    background: "#fff",
  },

  textarea: {
    boxSizing: "border-box",
    width: "100%",
    padding: "10px 11px",
    border:
      "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    resize: "vertical",
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
  },

  sectionToolbar: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "15px",
  },

  helper: {
    margin:
      "4px 0 0",
    color: "#6b7280",
    fontSize: "12px",
  },

  repeatRow: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    alignItems: "end",
    padding: "13px",
    marginBottom: "10px",
    background: "#f9fafb",
    border:
      "1px solid #e5e7eb",
    borderRadius: "7px",
  },

  secondaryButton: {
    border: "none",
    background: "#374151",
    color: "#fff",
    padding: "9px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 700,
  },

  removeButton: {
    border:
      "1px solid #dc2626",
    background: "#fff",
    color: "#dc2626",
    padding: "9px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 700,
  },

  removeItemButton: {
    border: "none",
    background: "#dc2626",
    color: "#fff",
    padding: "9px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 700,
  },

  bottomActions: {
    display: "flex",
    justifyContent:
      "flex-end",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "20px",
  },

  addItemButton: {
    border:
      "1px solid #2563eb",
    background: "#fff",
    color: "#2563eb",
    padding: "11px 18px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 700,
  },

  clearButton: {
    border:
      "1px solid #9ca3af",
    background: "#fff",
    color: "#374151",
    padding: "11px 22px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 700,
  },

  submitButton: {
    border: "none",
    background: "#2563eb",
    color: "#fff",
    padding: "11px 22px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 700,
  },

  errorBox: {
    background: "#fef2f2",
    border:
      "1px solid #fecaca",
    color: "#991b1b",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "18px",
  },

  warningBox: {
    background: "#fffbeb",
    border:
      "1px solid #fde68a",
    color: "#92400e",
    padding: "15px",
    borderRadius: "8px",
    marginTop: "15px",
  },

  errorItem: {
    padding: "8px 0",
    borderBottom:
      "1px solid #fecaca",
  },

  responseCard: {
    background: "#fff",
    padding: "22px",
    borderRadius: "10px",
    boxShadow:
      "0 1px 5px rgba(0,0,0,.08)",
  },

  responseTitle: {
    margin:
      "0 0 16px",
    fontSize: "20px",
  },

  status: {
    display: "flex",
    gap: "12px",
    padding: "12px",
    borderRadius: "7px",
  },

  success: {
    background: "#ecfdf5",
    color: "#065f46",
  },

  failed: {
    background: "#fef2f2",
    color: "#991b1b",
  },

  itemResult: {
    marginTop: "18px",
    padding: "18px",
    border:
      "1px solid #e5e7eb",
    borderRadius: "8px",
  },

  resultGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
  },

  result: {
    padding: "10px",
    background: "#f9fafb",
    borderRadius: "6px",
  },

  resultLabel: {
    fontSize: "11px",
    color: "#6b7280",
    textTransform: "uppercase",
  },

  resultValue: {
    marginTop: "4px",
    fontWeight: 600,
    fontSize: "14px",
    wordBreak: "break-word",
  },

  raw: {
    marginTop: "18px",
  },

  pre: {
    marginTop: "10px",
    background: "#111827",
    color: "#e5e7eb",
    padding: "15px",
    borderRadius: "7px",
    overflow: "auto",
    fontSize: "12px",
    lineHeight: 1.5,
  },
};

export default CreateOrUpdateItems;