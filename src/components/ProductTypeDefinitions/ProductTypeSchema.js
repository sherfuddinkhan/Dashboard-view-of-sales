import React, { useState, useEffect } from "react";
import axios from "axios";

const ProductTypeSchema = () => {
  const [schema, setSchema] = useState(null);
    const [productType, setProductType] = useState("");

const [schemaType, setSchemaType] = useState("Definition");

useEffect(() => {

    const downloadedSchema = JSON.parse(
        localStorage.getItem("amazonProductSchema") || "null"
    );

    if (downloadedSchema) {

        setSchema(downloadedSchema);
        setProductType(downloadedSchema.productType || "");
        setSchemaType("Downloaded Schema");

    } else {

        const definition = JSON.parse(
            localStorage.getItem("amazonProductTypeDefinition") || "{}"
        );

        setSchema(definition);
        setProductType(definition.productType || "");
        setSchemaType("Product Type Definition");

    }

}, []);
const refreshSchema = () => {

    alert("Refresh Clicked");

    const downloadedSchema = JSON.parse(
        localStorage.getItem("amazonProductSchema") || "null"
    );

    console.log("Downloaded Schema:", downloadedSchema);

    if (downloadedSchema) {

        setSchema(downloadedSchema);
        setProductType(downloadedSchema.productType || "");
        setSchemaType("Downloaded Schema");
        return;
    }

    const definition = JSON.parse(
        localStorage.getItem("amazonProductTypeDefinition") || "{}"
    );

    console.log("Definition:", definition);

    setSchema(definition);
    setProductType(definition.productType || "");
    setSchemaType("Product Type Definition");
    loadSchema();
};

const downloadSchema = async () => {

    try {

        const definition = JSON.parse(
            localStorage.getItem("amazonProductTypeDefinition") || "{}"
        );

        const schemaUrl = definition.schema?.link?.resource;

        if (!schemaUrl) {

            alert("Schema URL not found.");

            return;

        }

        if (schemaUrl === "https://schema-url") {

            alert(
                "Sandbox returns a placeholder schema URL. Download will work automatically in Production."
            );

            return;

        }

        const response = await axios.post(
            "http://localhost:5000/api/product-types/schema",
            {
                accessToken: localStorage.getItem("amazonAccessToken"),
                awsAccessKey: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
                awsSecretKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
                region: process.env.REACT_APP_AWS_REGION,
                serviceName: process.env.REACT_APP_AWS_SERVICE_NAME,
                schemaUrl,
                environment: process.env.REACT_APP_AMAZON_ENVIRONMENT
            }
        );

        localStorage.setItem(
            "amazonProductSchema",
            JSON.stringify(response.data)
        );

        refreshSchema();

        alert("Schema downloaded successfully.");

    }

    catch (err) {

        alert(
            err.response
                ? JSON.stringify(err.response.data, null, 2)
                : err.message
        );

    }

};
const loadSchema = () => {

    const downloadedSchema = JSON.parse(
        localStorage.getItem("amazonProductSchema") || "null"
    );

    if (downloadedSchema) {

        setSchema(downloadedSchema);
        setProductType(downloadedSchema.productType || "");
        setSchemaType("Downloaded Schema");

        return;
    }

    const definition = JSON.parse(
        localStorage.getItem("amazonProductTypeDefinition") || "{}"
    );

    setSchema(definition);
    setProductType(definition.productType || "");
    setSchemaType("Product Type Definition");
};

  const [fields, setFields] = useState({
    required: [],
    optional: [],
  });

useEffect(() => {

    console.log("Schema Changed");
    console.log(schema);

    if (schema) {

        const parsed = parseSchema(schema);

        console.log("Parsed Fields");
        console.log(parsed);

        setFields(parsed);

    }

}, [schema]);


 const parseSchema = (schemaData) => {

    const required = [];
    const optional = [];

    if (!schemaData || !schemaData.propertyGroups) {
        return { required, optional };
    }

    Object.values(schemaData.propertyGroups).forEach((group) => {

        // --------------------------------------------
        // CASE 1 : Downloaded Product Schema
        // --------------------------------------------
        if (group.properties) {

            Object.entries(group.properties).forEach(([key, property]) => {

                const field = {

                    name: key,

                    displayName:
                        property.title ||
                        property.displayName ||
                        key,

                    type:
                        property.type ||
                        "string",

                    description:
                        property.description ||
                        "",

                    enum:
                        property.enum ||
                        [],

                    maxLength:
                        property.maxLength ||
                        null,

                    required:
                        property.required ||
                        schemaData.required?.includes(key) ||
                        false

                };

                if (field.required) {
                    required.push(field);
                } else {
                    optional.push(field);
                }

            });

        }

        // --------------------------------------------
        // CASE 2 : Product Type Definition
        // --------------------------------------------
        else if (group.propertyNames) {

            group.propertyNames.forEach((name) => {

                optional.push({

                    name,

                    displayName: name,

                    type: "string",

                    description: group.description || "",

                    enum: [],

                    maxLength: null,

                    required: false

                });

            });

        }

    });

    return {

        required,

        optional

    };

};

if (!schema) {
    return (
        <div style={{ padding: 20 }}>
            Loading schema...
        </div>
    );
}

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

    <strong>

        Source :

    </strong>

    {schemaType}

</p>


      <p>
        <strong>Product Type:</strong> {productType}
      </p>

<div
    style={{
        display: "flex",
        gap: 10,
        marginTop: 15,
        marginBottom: 20
    }}
>

    <button
        style={styles.button}
        onClick={downloadSchema}
    >
        Download Schema
    </button>

    <button
        style={{
            ...styles.button,
            background: "#16a34a"
        }}
        onClick={refreshSchema}
    >
        Refresh Schema
    </button>

</div>
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