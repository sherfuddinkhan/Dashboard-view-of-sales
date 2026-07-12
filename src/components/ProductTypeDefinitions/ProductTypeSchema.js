import React, { useState, useEffect } from "react";

const ProductTypeSchema = ({ schema, productType }) => {
  const [parsedSchema, setParsedSchema] = useState({ required: [], optional: [] });

  useEffect(() => {
    if (!schema) return;
    const parsed = parseSchema(schema);
    setParsedSchema(parsed);
  }, [schema]);

  const parseSchema = (schemaResponse) => {
    const required = [];
    const optional = [];
    
    if (!schemaResponse.propertyGroups) return { required, optional };

    for (const groupName in schemaResponse.propertyGroups) {
      const group = schemaResponse.propertyGroups[groupName];
      
      for (const propName in group.properties) {
        const prop = group.properties[propName];
        
        const field = {
          name: propName,
          displayName: prop.title || propName,
          type: prop.type || 'string',
          required: prop.required || false,
          description: prop.description || '',
          enum: prop.enum || null,
          maxLength: prop.maxLength || null
        };
        
        if (field.required || schemaResponse.required?.includes(propName)) {
          required.push({...field, required: true});
        } else {
          optional.push(field);
        }
      }
    }
    return { required, optional };
  };

  if (!schema) return null;

  return (
    <div style={styles.container}>
      <h3>Schema for {productType}</h3>
      
      <div style={styles.section}>
        <h4 style={styles.reqTitle}>Required Fields ({parsedSchema.required.length})</h4>
        {parsedSchema.required.map(field => (
          <div key={field.name} style={styles.field}>
            <strong>{field.displayName}*</strong>
            <span style={styles.type}>{field.type}</span>
            {field.enum && <div style={styles.enum}>Options: {field.enum.join(', ')}</div>}
            {field.description && <div style={styles.desc}>{field.description}</div>}
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <h4 style={styles.optTitle}>Optional Fields ({parsedSchema.optional.length})</h4>
        {parsedSchema.optional.slice(0, 10).map(field => (
          <div key={field.name} style={styles.field}>
            <strong>{field.displayName}</strong>
            <span style={styles.type}>{field.type}</span>
            {field.description && <div style={styles.desc}>{field.description}</div>}
          </div>
        ))}
        {parsedSchema.optional.length > 10 && <div>...{parsedSchema.optional.length - 10} more</div>}
      </div>
    </div>
  );
};

const styles = {
  container: { marginTop: 20, border: '1px solid #e2e8f0', padding: 20, borderRadius: 8 },
  section: { marginBottom: 25 },
  reqTitle: { color: '#dc2626', marginBottom: 15 },
  optTitle: { color: '#64748b', marginBottom: 15 },
  field: { padding: 12, background: '#f8fafc', marginBottom: 10, borderRadius: 6 },
  type: { marginLeft: 10, fontSize: 12, color: '#64748b', background: '#e2e8f0', padding: '2px 6px', borderRadius: 4 },
  enum: { fontSize: 12, color: '#059669', marginTop: 5 },
  desc: { fontSize: 13, color: '#475569', marginTop: 5 }
};

export default ProductTypeSchema;