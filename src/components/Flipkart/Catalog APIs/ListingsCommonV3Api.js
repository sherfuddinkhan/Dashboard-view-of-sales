import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const NODE_API = "http://localhost:5000/api";

/* ============================================================
   HELPERS
============================================================ */

const toNumber = (value, fallback = 0) => {
    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;
};

const getAvailableStock = (inventory = {}) => {
    const quantity = toNumber(inventory.quantity);
    const reservedQuantity = toNumber(inventory.reservedQuantity);
    const damagedQuantity = toNumber(inventory.damagedQuantity);

    return Math.max(
        0,
        quantity - reservedQuantity - damagedQuantity
    );
};

const getPrice = (
    prices = [],
    productId,
    priceType
) => {
    return (
        prices.find(
            item =>
                item.productId === productId &&
                item.priceType === priceType &&
                item.isActive
        ) ||
        prices.find(
            item =>
                item.productId === productId &&
                item.priceType === priceType
        ) ||
        null
    );
};

const getProductInventory = (
    inventories = [],
    productId
) => {
    return (
        inventories.find(
            item => item.productId === productId
        ) || {}
    );
};

/* ============================================================
   FLIPKART V3 PAYLOAD BUILDER
============================================================ */

const buildFlipkartPayload = (
    api,
    selectedProduct
) => {
    if (!api) {
        throw new Error("SellerCustomer API data is not loaded.");
    }

    if (!selectedProduct) {
        throw new Error("No product selected.");
    }

    const products = api.products || [];
    const inventories = api.inventories || [];
    const prices = api.prices || [];
    const warehouseLocations =
        api.warehouseLocations || [];
    const warehouses =
        api.warehouses || [];

    const product = selectedProduct;

    const productId = product.productId;

    /* --------------------------------------------------------
       INVENTORY
    -------------------------------------------------------- */

    const inventory = getProductInventory(
        inventories,
        productId
    );

    const availableStock =
        getAvailableStock(inventory);

    /* --------------------------------------------------------
       PRICES
    -------------------------------------------------------- */

    const offerPrice = getPrice(
        prices,
        productId,
        "OfferPrice"
    );

    const mrpPrice =
        getPrice(prices, productId, "Mrp") ||
        getPrice(prices, productId, "MRP");

    const currency =
        offerPrice?.currency ||
        mrpPrice?.currency ||
        "INR";

    /* --------------------------------------------------------
       PRODUCT DATA
    -------------------------------------------------------- */

    const packageData =
        product.packages?.[0] || {};

    const addressLabel =
        product.addressLabel || {};

    const sku =
        product.sku ||
        `PRODUCT-${productId}`;

    const externalProductId =
        product.externalProductId ||
        product.barcode ||
        productId?.toString();

    /* --------------------------------------------------------
       WAREHOUSE LOCATIONS
    -------------------------------------------------------- */

    const locations =
        warehouseLocations.map(
            warehouseLocation => {
                const locationInventory =
                    inventories.find(
                        inventoryItem =>
                            inventoryItem.productId ===
                                productId &&
                            inventoryItem.warehouseId ===
                                warehouseLocation.warehouseId &&
                            inventoryItem.locationId ===
                                warehouseLocation.locationId
                    );

                const warehouse =
                    warehouses.find(
                        warehouseItem =>
                            warehouseItem.warehouseId ===
                            warehouseLocation.warehouseId
                    );

                return {
                    id:
                        warehouseLocation.locationId != null
                            ? warehouseLocation.locationId.toString()
                            : null,

                    status:
                        warehouseLocation.isActive
                            ? "ENABLED"
                            : "DISABLED",

                    inventory:
                        locationInventory
                            ? getAvailableStock(
                                  locationInventory
                              )
                            : 0,

                    listing_status:
                        warehouseLocation.listingStatus ||
                        (product.isActive
                            ? "ACTIVE"
                            : "INACTIVE"),

                    warehouse_id:
                        warehouseLocation.warehouseId != null
                            ? warehouseLocation.warehouseId.toString()
                            : null,

                    warehouse_name:
                        warehouse?.warehouseName ||
                        null,

                    fulfillment_profile:
                        warehouseLocation.fulfillmentProfile ||
                        product.fulfillmentProfile ||
                        "NON_FBF"
                };
            }
        );

    /* --------------------------------------------------------
       PACKAGE
    -------------------------------------------------------- */

    const packagePayload = {
        name:
            packageData.name ||
            `${sku}-PKG-01`,

        dimensions: {
            length: toNumber(
                packageData.length ??
                    product.length
            ),

            breadth: toNumber(
                packageData.breadth ??
                    product.width
            ),

            height: toNumber(
                packageData.height ??
                    product.height
            )
        },

        weight: toNumber(
            packageData.weight ??
                product.weight
        ),

        description:
            packageData.description ||
            product.description ||
            product.productName ||
            null,

        package_type:
            packageData.packageType ||
            "DEFAULT",

        handling: {
            fragile:
                Boolean(packageData.isFragile),

            hazardous:
                Boolean(packageData.isHazardous)
        },

        notional_value: {
            amount: toNumber(
                mrpPrice?.price ??
                    offerPrice?.price
            ),

            unit: currency,

            currency: currency
        },

        defects: {
            count: toNumber(
                packageData.defectCount
            ),

            details:
                packageData.defectDetails
                    ? [packageData.defectDetails]
                    : []
        }
    };

    /* --------------------------------------------------------
       FINAL FLIPKART PAYLOAD
    -------------------------------------------------------- */

    return {
        [sku]: {
            sku_id: sku,

            product_id:
                externalProductId,

            price: {
                mrp:
                    mrpPrice?.price != null
                        ? toNumber(
                              mrpPrice.price
                          )
                        : null,

                selling_price:
                    toNumber(
                        offerPrice?.price
                    ),

                currency: currency
            },

            tax: {
                hsn:
                    product.hsnCode ||
                    null,

                tax_code:
                    product.taxCategory ||
                    null
            },

            listing_status:
                product.isActive
                    ? "ACTIVE"
                    : "INACTIVE",

            shipping_fees: {
                local: toNumber(
                    product.shippingChargeLocal
                ),

                zonal: toNumber(
                    product.shippingChargeRegional
                ),

                national: toNumber(
                    product.shippingChargeNational
                ),

                currency: currency
            },

            fulfillment_profile:
                product.fulfillmentProfile ||
                (
                    product.fulfillmentType ===
                    "SELF"
                        ? "NON_FBF"
                        : "FBF_LITE"
                ),

            fulfillment: {
                dispatch_sla:
                    toNumber(
                        product.readyToDispatchDays
                    ),

                procurement_sla:
                    product.procurementSla != null
                        ? toNumber(
                              product.procurementSla
                          )
                        : 2,

                shipping_provider:
                    product.shippingProvider ||
                    (
                        product.carrierType ===
                        "PARTNER"
                            ? "FLIPKART_SELLER"
                            : "SELLER"
                    ),

                procurement_type:
                    product.procurementType ||
                    "REGULAR"
            },

            packages: [
                packagePayload
            ],

            locations: locations,

            address_label: {
                manufacturer_details: [
                    addressLabel.manufacturerDetails ||
                        null
                ],

                importer_details: [
                    addressLabel.importerDetails ||
                        null
                ],

                packer_details: [
                    addressLabel.packerDetails ||
                        null
                ],

                countries_of_origin: [
                    addressLabel.countryOfOrigin ||
                        null
                ],

                quantity:
                    `${availableStock} ${
                        product.unitOfMeasure ||
                        "PCS"
                    }`,

                mrp:
                    mrpPrice?.price != null
                        ? `${mrpPrice.price} ${currency}`
                        : null
            },

            dating_label: {
                mfg_date:
                    addressLabel.mfgDateEpoch != null
                        ? addressLabel.mfgDateEpoch.toString()
                        : null,

                shelf_life:
                    addressLabel.shelfLifeSeconds != null
                        ? addressLabel.shelfLifeSeconds.toString()
                        : null,

                expiry_date:
                    addressLabel.expiryDateEpoch != null
                        ? addressLabel.expiryDateEpoch.toString()
                        : null
            }
        }
    };
};

/* ============================================================
   MAPPING AUDIT
============================================================ */

const buildMappingAudit = () => {
    return {
        COMMON_SOURCE:
            "SellerCustomer API",

        MARKETPLACE:
            "Flipkart",

        API_ROUTE:
            "/api/SellerCustomer/{sellerId}/customers/{customerId}",

        DIRECT_MAPPINGS: [
            "sku_id ← Product.Sku",
            "product_id ← Product.ExternalProductId / Barcode / ProductId",
            "selling_price ← ProductPrice where PriceType = OfferPrice",
            "currency ← ProductPrice.Currency",
            "tax.hsn ← Product.HsnCode",
            "tax.tax_code ← Product.TaxCategory",
            "listing_status ← Product.IsActive",
            "fulfillment_profile ← Product.FulfillmentProfile"
        ],

        DATABASE_BINDINGS: [
            "price.mrp ← ProductPrice where PriceType = Mrp/MRP",
            "inventory ← ProductInventory",
            "warehouse_id ← WarehouseLocation.WarehouseId",
            "warehouse_name ← Warehouse.WarehouseName"
        ],

        CALCULATED_FIELDS: [
            "available stock = Quantity - ReservedQuantity - DamagedQuantity",
            "shipping_fees.local ← Product.ShippingChargeLocal",
            "shipping_fees.zonal ← Product.ShippingChargeRegional",
            "shipping_fees.national ← Product.ShippingChargeNational"
        ],

        DEFAULTS: [
            "currency = INR",
            "package_type = DEFAULT",
            "fulfillment_profile = NON_FBF / FBF_LITE",
            "procurement_type = REGULAR",
            "procurement_sla = 2"
        ]
    };
};

/* ============================================================
   COMPONENT
============================================================ */

const ListingsCommonV3Api = () => {
    const {
        sellerId,
        customerId
    } = useParams();

    const navigate = useNavigate();

    const [
        accessToken,
        setAccessToken
    ] = useState("");

    const [
        apiData,
        setApiData
    ] = useState(null);

    const [
        selectedProductId,
        setSelectedProductId
    ] = useState("");

    const [
        response,
        setResponse
    ] = useState("");

    const [
        flipkartPayload,
        setFlipkartPayload
    ] = useState("");

    const [
        mappingAudit,
        setMappingAudit
    ] = useState("");

    const [
        loading,
        setLoading
    ] = useState(false);

    const [
        error,
        setError
    ] = useState("");

    /* ========================================================
       LOAD TOKEN
    ======================================================== */

    useEffect(() => {
        const token =
            localStorage.getItem(
                "flipkartAccessToken"
            );

        if (token) {
            setAccessToken(token);
        }
    }, []);

    /* ========================================================
       PRODUCTS
    ======================================================== */

    const products = useMemo(
        () => apiData?.products || [],
        [apiData]
    );

    /* ========================================================
       LOAD SELLER CUSTOMER DATA
    ======================================================== */

    const searchCatalog = useCallback(
        async () => {
            if (!sellerId || !customerId) {
                setError(
                    "SellerId/CustomerId missing. Go to Sellers → Click View."
                );

                return;
            }

            setLoading(true);

            setResponse("");
            setFlipkartPayload("");
            setMappingAudit("");
            setError("");
            setApiData(null);
            setSelectedProductId("");

            try {
                const result =
                    await axios.get(
                        `${NODE_API}/SellerCustomer/${sellerId}/customers/${customerId}`,
                        {
                            headers: {
                                accept: "*/*"
                            }
                        }
                    );

                const api =
                    result.data;

                setApiData(api);

                setResponse(
                    JSON.stringify(
                        api,
                        null,
                        2
                    )
                );

                const firstProduct =
                    api.products?.[0];

                if (!firstProduct) {
                    throw new Error(
                        "No product found for this seller/customer."
                    );
                }

                const firstProductId =
                    firstProduct.productId?.toString();

                setSelectedProductId(
                    firstProductId
                );

                const payload =
                    buildFlipkartPayload(
                        api,
                        firstProduct
                    );

                setFlipkartPayload(
                    JSON.stringify(
                        payload,
                        null,
                        2
                    )
                );

                setMappingAudit(
                    JSON.stringify(
                        buildMappingAudit(),
                        null,
                        2
                    )
                );
            } catch (err) {
                const message =
                    err.response
                        ? JSON.stringify(
                              err.response.data,
                              null,
                              2
                          )
                        : err.message;

                setError(message);
            } finally {
                setLoading(false);
            }
        },
        [
            sellerId,
            customerId
        ]
    );

    /* ========================================================
       AUTO LOAD
    ======================================================== */

    useEffect(() => {
        if (
            sellerId &&
            customerId
        ) {
            searchCatalog();
        }
    }, [
        sellerId,
        customerId,
        searchCatalog
    ]);

    /* ========================================================
       PRODUCT CHANGE
    ======================================================== */

    const handleProductChange = event => {
        const productId =
            event.target.value;

        setSelectedProductId(
            productId
        );

        setError("");

        const product =
            products.find(
                item =>
                    item.productId?.toString() ===
                    productId
            );

        if (!product) {
            setFlipkartPayload("");
            return;
        }

        try {
            const payload =
                buildFlipkartPayload(
                    apiData,
                    product
                );

            setFlipkartPayload(
                JSON.stringify(
                    payload,
                    null,
                    2
                )
            );
        } catch (err) {
            setError(
                err.message
            );
        }
    };

    /* ========================================================
       MISSING URL PARAMETERS
    ======================================================== */

    if (
        !sellerId ||
        !customerId
    ) {
        return (
            <div style={styles.container}>
                <button
                    onClick={() =>
                        navigate(
                            "/marketplaces/flipkart/sellers"
                        )
                    }
                    style={
                        styles.backButton
                    }
                >
                    ← Back to Sellers
                </button>

                <p>
                    No SellerId/CustomerId.
                    Please go to Flipkart
                    Sellers and click View.
                </p>
            </div>
        );
    }

    /* ========================================================
       UI
    ======================================================== */

    return (
        <div
            style={
                styles.container
            }
        >
            <button
                onClick={() =>
                    navigate(
                        "/marketplaces/flipkart/sellers"
                    )
                }
                style={
                    styles.backButton
                }
            >
                ← Back to Sellers
            </button>

            <h2>
                Flipkart V3 Listings
            </h2>

            <p
                style={
                    styles.subtitle
                }
            >
                Seller {sellerId} /
                Customer {customerId}
            </p>

            {/* SELLER / CUSTOMER */}

            <div
                style={
                    styles.identityBox
                }
            >
                <strong>
                    Seller ID:
                </strong>{" "}
                {sellerId}

                {" | "}

                <strong>
                    Customer ID:
                </strong>{" "}
                {customerId}

                <span
                    style={
                        styles.success
                    }
                >
                    {" "}
                    (From SellerCustomers)
                </span>
            </div>

            {/* TOKEN */}

            <label
                style={
                    styles.label
                }
            >
                Flipkart Access Token
            </label>

            <textarea
                rows={3}
                value={accessToken}
                onChange={event =>
                    setAccessToken(
                        event.target.value
                    )
                }
                style={
                    styles.textArea
                }
                placeholder="Flipkart access token"
            />

            {/* LOAD */}

            <button
                onClick={
                    searchCatalog
                }
                disabled={loading}
                style={
                    styles.button
                }
            >
                {loading
                    ? "Loading..."
                    : `Load Data for ${sellerId}/${customerId}`}
            </button>

            {/* PRODUCT */}

            {products.length > 0 && (
                <div
                    style={
                        styles.section
                    }
                >
                    <h3>
                        Select Product
                    </h3>

                    <select
                        value={
                            selectedProductId
                        }
                        onChange={
                            handleProductChange
                        }
                        style={
                            styles.input
                        }
                    >
                        {products.map(
                            product => (
                                <option
                                    key={
                                        product.productId
                                    }
                                    value={
                                        product.productId
                                    }
                                >
                                    {product.productName ||
                                        product.sku ||
                                        `Product ${product.productId}`}
                                    {" - "}
                                    {product.sku}
                                </option>
                            )
                        )}
                    </select>
                </div>
            )}

            {/* SOURCE API */}

            {response && (
                <>
                    <h3>
                        SellerCustomer API
                    </h3>

                    <textarea
                        rows={15}
                        readOnly
                        value={
                            response
                        }
                        style={
                            styles.textArea
                        }
                    />
                </>
            )}

            {/* MAPPING AUDIT */}

            {mappingAudit && (
                <>
                    <h3
                        style={
                            styles.successTitle
                        }
                    >
                        Flipkart Mapping Audit
                    </h3>

                    <textarea
                        rows={20}
                        readOnly
                        value={
                            mappingAudit
                        }
                        style={
                            styles.textArea
                        }
                    />
                </>
            )}

            {/* FLIPKART PAYLOAD */}

            {flipkartPayload && (
                <>
                    <h3>
                        Flipkart V3 Payload
                    </h3>

                    <textarea
                        rows={40}
                        readOnly
                        value={
                            flipkartPayload
                        }
                        style={
                            styles.payloadTextArea
                        }
                    />
                </>
            )}

            {/* ERROR */}

            {error && (
                <>
                    <h3
                        style={
                            styles.errorTitle
                        }
                    >
                        Error
                    </h3>

                    <textarea
                        rows={10}
                        readOnly
                        value={
                            error
                        }
                        style={
                            styles.errorTextArea
                        }
                    />
                </>
            )}
        </div>
    );
};

/* ============================================================
   STYLES
============================================================ */

const styles = {
    container: {
        width: 900,
        maxWidth: "95%",
        margin: "30px auto",
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 8,
        background: "#fff"
    },

    subtitle: {
        color: "#666",
        marginBottom: 25
    },

    identityBox: {
        background: "#f1f5f9",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16
    },

    success: {
        color: "green"
    },

    successTitle: {
        color: "green"
    },

    errorTitle: {
        color: "red"
    },

    label: {
        display: "block",
        fontWeight: 600,
        marginBottom: 6
    },

    section: {
        marginTop: 20,
        marginBottom: 20
    },

    input: {
        width: "100%",
        padding: 10,
        marginTop: 5,
        marginBottom: 15,
        boxSizing: "border-box",
        border: "1px solid #ccc",
        borderRadius: 4
    },

    textArea: {
        width: "100%",
        padding: 10,
        marginBottom: 20,
        boxSizing: "border-box",
        fontFamily: "monospace",
        fontSize: 13,
        border: "1px solid #ccc",
        borderRadius: 4
    },

    payloadTextArea: {
        width: "100%",
        padding: 10,
        marginBottom: 20,
        boxSizing: "border-box",
        fontFamily: "monospace",
        fontSize: 13,
        minHeight: 700,
        border: "1px solid #ccc",
        borderRadius: 4
    },

    errorTextArea: {
        width: "100%",
        padding: 10,
        boxSizing: "border-box",
        fontFamily: "monospace",
        fontSize: 13,
        border: "1px solid red",
        borderRadius: 4
    },

    button: {
        background: "#146eb4",
        color: "#fff",
        border: "none",
        padding: "12px 25px",
        cursor: "pointer",
        borderRadius: 5,
        marginBottom: 20
    },

    backButton: {
        marginBottom: 12,
        padding: "6px 12px",
        borderRadius: 6,
        border: "1px solid #ddd",
        cursor: "pointer",
        background: "#fff"
    }
};

export default ListingsCommonV3Api;
