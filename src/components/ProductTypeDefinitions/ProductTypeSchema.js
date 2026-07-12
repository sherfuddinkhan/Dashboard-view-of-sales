import React, { useState, useEffect } from "react";

const ProductTypeSchema = ({ schema, productType }) => {
  const [fields, setFields] = useState({
    required: [],
    optional: [],
  });

  useEffect(() => {
    if (schema) {
      setFields(parseSchema(schema));
    }
  }, [schema]);

  const parseSchema = (schemaData) => {
    const required = [];
    const optional = [];

    if (!schemaData?.propertyGroups) {
      return { required, optional };
    }

    Object.values(schemaData.propertyGroups).forEach((group) => {
      Object.entries(group.properties || {}).forEach(([key, property]) => {
        const field = {
          name: key,
          displayName: property.title || key,
          type: property.type || "string",
          description: property.description || "",
          enum: property.enum || [],
          maxLength: property.maxLength || null,
          required:
            property.required ||
            schemaData.required?.includes(key) ||
            false,
        };

        if (field.required) {
          required.push(field);
        } else {
          optional.push(field);
        }
      });
    });

    return { required, optional };
  };

  if (!schema) return null;

  const renderField = (field, isRequired = false) => (
    <div key={field.name} style={styles.field}>
      <div style={styles.header}>
        <strong>
          {field.displayName}
          {isRequired && " *"}
        </strong>

        <span style={styles.type}>{field.type}</span>
      </div>

      {field.enum.length > 0 && (
        <div style={styles.enum}>
          <strong>Allowed Values:</strong> {field.enum.join(", ")}
        </div>
      )}

      {field.description && (
        <div style={styles.description}>
          {field.description}
        </div>
      )}
    </div>
  );

  return (
    <div style={styles.container}>
      <h2>Product Type Schema</h2>

      <p>
        <strong>Product Type:</strong> {productType}
      </p>

      <div style={styles.section}>
        <h3 style={styles.requiredTitle}>
          Required Fields ({fields.required.length})
        </h3>

        {fields.required.length ? (
          fields.required.map((field) =>
            renderField(field, true)
          )
        ) : (
          <p>No required fields found.</p>
        )}
      </div>

      <div style={styles.section}>
        <h3 style={styles.optionalTitle}>
          Optional Fields ({fields.optional.length})
        </h3>

        {fields.optional.length ? (
          <>
            {fields.optional
              .slice(0, 10)
              .map((field) => renderField(field))}

            {fields.optional.length > 10 && (
              <p>
                ...and {fields.optional.length - 10} more fields.
              </p>
            )}
          </>
        ) : (
          <p>No optional fields found.</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginTop: 20,
    padding: 20,
    border: "1px solid #ddd",
    borderRadius: 8,
    background: "#fff",
  },

  section: {
    marginTop: 25,
  },

  requiredTitle: {
    color: "#dc2626",
    marginBottom: 15,
  },

  optionalTitle: {
    color: "#2563eb",
    marginBottom: 15,
  },

  field: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },

  type: {
    fontSize: 12,
    color: "#475569",
    background: "#e2e8f0",
    padding: "2px 8px",
    borderRadius: 4,
  },

  enum: {
    fontSize: 13,
    color: "#059669",
    marginTop: 5,
  },

  description: {
    fontSize: 13,
    color: "#475569",
    marginTop: 5,
    lineHeight: 1.5,
  },
};

export default ProductTypeSchema;