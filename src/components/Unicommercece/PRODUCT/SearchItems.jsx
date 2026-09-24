import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "N/A";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const formatBoolean = (value) => {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "N/A";
};

const initialForm = {
  keyword: "", productCode: "", categoryCode: "", getInventorySnapshot: false,
  updatedSinceInHour: "", skuType: "", searchKey: "", displayLength: 20,
  displayStart: 0, columns: "", sortingCols: "", sortColumnIndex: "",
  sortDirection: "asc", columnNames: "", getCount: true,
};

const SearchItems = () => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({...prev, [name]: type === "checkbox"? checked : value }));
  };

  const buildPayload = () => {
    const payload = {};
    if (form.keyword.trim()) payload.keyword = form.keyword.trim();
    if (form.productCode.trim()) payload.productCode = form.productCode.trim();
    if (form.categoryCode.trim()) payload.categoryCode = form.categoryCode.trim();
    payload.getInventorySnapshot = form.getInventorySnapshot;
    if (form.updatedSinceInHour!== "") payload.updatedSinceInHour = Number(form.updatedSinceInHour);
    if (form.skuType.trim()) payload.skuType = form.skuType.trim();
    const searchOptions = {};
    if (form.searchKey.trim()) searchOptions.searchKey = form.searchKey.trim();
    if (form.displayLength!== "") searchOptions.displayLength = Number(form.displayLength);
    if (form.displayStart!== "") searchOptions.displayStart = Number(form.displayStart);
    if (form.columns!== "") searchOptions.columns = Number(form.columns);
    if (form.sortingCols!== "") searchOptions.sortingCols = Number(form.sortingCols);
    if (form.sortColumnIndex!== "") searchOptions.sortColumnIndex = Number(form.sortColumnIndex);
    if (form.sortDirection.trim()) searchOptions.sortDirection = form.sortDirection.trim();
    if (form.columnNames.trim()) searchOptions.columnNames = form.columnNames.trim();
    searchOptions.getCount = form.getCount;
    if (Object.keys(searchOptions).length > 0) payload.searchOptions = searchOptions;
    return payload;
  };

  const searchItems = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setResponse(null);
    try {
      const payload = buildPayload();
      const res = await axios.post(`${SERVER_URL}/api/uniware/items/search`, payload);
      setResponse(res.data);
    } catch (err) {
      const apiError = err.response?.data;
      setError(apiError?.message || apiError?.errors?.[0]?.message || err.message || "Failed to search items");
      if (apiError) setResponse(apiError);
    } finally { setLoading(false); }
  };

  const clearForm = () => { setForm(initialForm); setResponse(null); setError(""); };
  const elements = response?.elements || [];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Search Uniware Items</h1>
          <p style={styles.subtitle}>Search Uniware SKUs / Item Types using keyword, SKU, category, inventory and search filters.</p>
        </div>
        <form onSubmit={searchItems} style={styles.card}>
          <h2 style={styles.sectionTitle}>Item Search Filters</h2>
          <div style={styles.grid}>
            <Field label="Keyword" name="keyword" value={form.keyword} onChange={handleChange} placeholder="Enter keyword" />
            <Field label="Product SKU Code" name="productCode" value={form.productCode} onChange={handleChange} placeholder="Example: SKU001" />
            <Field label="Category Code" name="categoryCode" value={form.categoryCode} onChange={handleChange} placeholder="Example: ELECTRONICS" />
            <Field label="SKU Type" name="skuType" value={form.skuType} onChange={handleChange} placeholder="Example: SIMPLE" />
            <Field label="Updated Since (Hours)" name="updatedSinceInHour" type="number" value={form.updatedSinceInHour} onChange={handleChange} placeholder="Example: 24" />
            <Field label="Search Key" name="searchKey" value={form.searchKey} onChange={handleChange} placeholder="Search within results" />
          </div>
          <div style={styles.optionBox}>
            <label style={styles.checkboxLabel}><input type="checkbox" name="getInventorySnapshot" checked={form.getInventorySnapshot} onChange={handleChange} /><span>Get Inventory Snapshot</span></label>
          </div>
          <h2 style={styles.sectionTitle}>Search Options</h2>
          <div style={styles.grid}>
            <Field label="Display Length" name="displayLength" type="number" value={form.displayLength} onChange={handleChange} />
            <Field label="Display Start" name="displayStart" type="number" value={form.displayStart} onChange={handleChange} />
            <Field label="Columns" name="columns" type="number" value={form.columns} onChange={handleChange} placeholder="Optional" />
            <Field label="Sorting Columns" name="sortingCols" type="number" value={form.sortingCols} onChange={handleChange} placeholder="Optional" />
            <Field label="Sort Column Index" name="sortColumnIndex" type="number" value={form.sortColumnIndex} onChange={handleChange} placeholder="Optional" />
            <div><label style={styles.label}>Sort Direction</label><select name="sortDirection" value={form.sortDirection} onChange={handleChange} style={styles.input}><option value="">Select</option><option value="asc">Ascending</option><option value="desc">Descending</option></select></div>
            <Field label="Column Names" name="columnNames" value={form.columnNames} onChange={handleChange} placeholder="Optional" />
          </div>
          <div style={styles.optionBox}><label style={styles.checkboxLabel}><input type="checkbox" name="getCount" checked={form.getCount} onChange={handleChange} /><span>Get Total Record Count</span></label></div>
          <div style={styles.buttonRow}>
            <button type="submit" disabled={loading} style={styles.searchButton}>{loading? "Searching..." : "Search Items"}</button>
            <button type="button" onClick={clearForm} style={styles.clearButton}>Clear</button>
          </div>
        </form>
        {error && <div style={styles.errorBox}><strong>Error:</strong> {error}</div>}
        {response && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Search Response</h2>
            <div style={styles.summaryGrid}>
              <Info label="Successful" value={formatBoolean(response.successful)} />
              <Info label="Total Records" value={formatValue(response.totalRecords)} />
              <Info label="Message" value={formatValue(response.message)} />
            </div>
          </div>
        )}
        {response && (
          <div style={styles.card}>
            <div style={styles.resultsHeader}><div><h2 style={styles.sectionTitle}>Items</h2><span style={styles.recordText}>{elements.length} item(s) returned</span></div></div>
            {elements.length === 0? <div style={styles.empty}>No items found.</div> : (
              <div style={styles.tableWrapper}><table style={styles.table}><thead><tr><th style={styles.th}>#</th><th style={styles.th}>SKU</th><th style={styles.th}>Name</th><th style={styles.th}>Category</th><th style={styles.th}>Brand</th><th style={styles.th}>Color</th><th style={styles.th}>Size</th><th style={styles.th}>Price</th><th style={styles.th}>Base Price</th><th style={styles.th}>GST</th><th style={styles.th}>HSN</th><th style={styles.th}>SKU Type</th><th style={styles.th}>Enabled</th><th style={styles.th}>Expirable</th></tr></thead>
                <tbody>{elements.map((item, index) => (<tr key={`${item.skuCode}-${index}`}><td style={styles.td}>{index + 1}</td><td style={styles.td}><strong>{formatValue(item.skuCode)}</strong></td><td style={styles.td}>{formatValue(item.name)}</td><td style={styles.td}><div>{formatValue(item.categoryName)}</div><small>{formatValue(item.categoryCode)}</small></td><td style={styles.td}>{formatValue(item.brand)}</td><td style={styles.td}>{formatValue(item.color)}</td><td style={styles.td}>{formatValue(item.size)}</td><td style={styles.td}>{formatValue(item.price)}</td><td style={styles.td}>{formatValue(item.basePrice)}</td><td style={styles.td}>{formatValue(item.gstTaxTypeCode)}</td><td style={styles.td}>{formatValue(item.hsnCode)}</td><td style={styles.td}>{formatValue(item.skuType)}</td><td style={styles.td}><span style={item.enabled? styles.activeBadge : styles.inactiveBadge}>{item.enabled? "Enabled" : "Disabled"}</span></td><td style={styles.td}>{formatBoolean(item.expirable)}</td></tr>))}</tbody></table></div>
            )}
          </div>
        )}
        {elements.map((item, index) => (<ItemDetails key={`details-${item.skuCode}-${index}`} item={item} index={index} />))}
      </div>
    </div>
  );
};

const Field = ({ label, name, value, onChange, type = "text", placeholder = "" }) => (<div><label style={styles.label}>{label}</label><input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} style={styles.input} /></div>);
const Info = ({ label, value }) => (<div style={styles.infoBox}><div style={styles.infoLabel}>{label}</div><div style={styles.infoValue}>{value}</div></div>);

const ItemDetails = ({ item, index }) => {
  return (
    <div style={styles.card}>
      <div style={styles.itemHeader}><div><h2 style={styles.sectionTitle}>{index + 1}. {formatValue(item.name)}</h2><div style={styles.skuText}>SKU: {formatValue(item.skuCode)}</div></div><div><span style={item.enabled? styles.activeBadge : styles.inactiveBadge}>{item.enabled? "Enabled" : "Disabled"}</span></div></div>
      <div style={styles.detailGrid}>
        <Info label="SKU Code" value={formatValue(item.skuCode)} /><Info label="Name" value={formatValue(item.name)} /><Info label="Description" value={formatValue(item.description)} />
        <Info label="Category Name" value={formatValue(item.categoryName)} /><Info label="Category Code" value={formatValue(item.categoryCode)} />
        <Info label="Brand" value={formatValue(item.brand)} /><Info label="Color" value={formatValue(item.color)} /><Info label="Size" value={formatValue(item.size)} />
        <Info label="Price" value={formatValue(item.price)} /><Info label="Base Price" value={formatValue(item.basePrice)} />
        <Info label="Tax Type" value={formatValue(item.taxTypeCode)} /><Info label="GST Tax Type" value={formatValue(item.gstTaxTypeCode)} /><Info label="HSN Code" value={formatValue(item.hsnCode)} />
        <Info label="Length (mm)" value={formatValue(item.length)} /><Info label="Width (mm)" value={formatValue(item.width)} /><Info label="Height (mm)" value={formatValue(item.height)} /><Info label="Weight (gm)" value={formatValue(item.weight)} />
        <Info label="Shelf Life" value={formatValue(item.shelfLife)} /><Info label="SKU Type" value={formatValue(item.skuType)} />
        <Info label="Enabled" value={formatBoolean(item.enabled)} /><Info label="Expirable" value={formatBoolean(item.expirable)} />
      </div>
      {item.imageUrl && <div style={styles.mediaSection}><h3 style={styles.subTitle}>Product Image</h3><img src={item.imageUrl} alt={item.name} style={styles.productImage} /></div>}
    </div>
  );
};

const styles = {
  page: { minHeight: "100vh", background: "#f5f6f8", padding: "30px", fontFamily: "Arial, Helvetica, sans-serif", color: "#222" },
  container: { maxWidth: "1500px", margin: "0 auto" },
  header: { marginBottom: "25px" }, title: { margin: 0, fontSize: "30px" }, subtitle: { marginTop: "8px", color: "#666" },
  card: { background: "#fff", borderRadius: "10px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" },
  sectionTitle: { marginTop: 0, marginBottom: "18px", fontSize: "21px" }, subTitle: { marginTop: 0, marginBottom: "12px", fontSize: "17px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" },
  label: { display: "block", fontWeight: 600, marginBottom: "7px" },
  input: { width: "100%", boxSizing: "border-box", padding: "11px 12px", border: "1px solid #ccc", borderRadius: "6px", fontSize: "14px", background: "#fff" },
  optionBox: { marginTop: "18px", marginBottom: "24px", padding: "13px", background: "#f7f7f7", borderRadius: "6px" },
  checkboxLabel: { display: "flex", alignItems: "center", gap: "9px", cursor: "pointer", fontWeight: 600 },
  buttonRow: { display: "flex", gap: "12px", marginTop: "24px" },
  searchButton: { border: "none", borderRadius: "6px", padding: "12px 22px", background: "#1976d2", color: "#fff", cursor: "pointer", fontWeight: 600 },
  clearButton: { border: "1px solid #bbb", borderRadius: "6px", padding: "12px 22px", background: "#fff", cursor: "pointer", fontWeight: 600 },
  errorBox: { background: "#fff0f0", border: "1px solid #e0a0a0", color: "#a00000", padding: "15px", borderRadius: "7px", marginBottom: "20px" },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px" },
  infoBox: { border: "1px solid #e0e0e0", borderRadius: "7px", padding: "13px", background: "#fafafa" },
  infoLabel: { fontSize: "12px", color: "#777", marginBottom: "5px", fontWeight: 600 },
  infoValue: { fontSize: "14px", wordBreak: "break-word" },
  resultsHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  recordText: { color: "#777", fontSize: "13px" },
  tableWrapper: { overflowX: "auto", width: "100%" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "1200px" },
  th: { textAlign: "left", padding: "11px", background: "#f0f2f5", borderBottom: "1px solid #ddd", whiteSpace: "nowrap", fontSize: "13px" },
  td: { padding: "11px", borderBottom: "1px solid #eee", verticalAlign: "top", fontSize: "13px" },
  activeBadge: { display: "inline-block", padding: "5px 9px", borderRadius: "20px", background: "#e7f6ec", color: "#187a3d", fontSize: "12px", fontWeight: 600 },
  inactiveBadge: { display: "inline-block", padding: "5px 9px", borderRadius: "20px", background: "#fbeaea", color: "#a12626", fontSize: "12px", fontWeight: 600 },
  empty: { textAlign: "center", padding: "40px", color: "#777" },
  itemHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", marginBottom: "20px" },
  skuText: { color: "#666", fontSize: "14px" },
  detailGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" },
  mediaSection: { marginTop: "24px" },
  productImage: { width: "180px", height: "180px", objectFit: "contain", border: "1px solid #ddd", borderRadius: "6px", padding: "5px" },
};

export default SearchItems;