// Inventory.tsx
"use client";

import { useState, useEffect, useRef, useMemo, Fragment } from "react";
import { useRouter } from "next/navigation";
// import JsBarcode from "jsbarcode"; // npm install jsbarcode
import {
  Plus,
  Minus,
  Search,
  Edit2,
  Trash2,
  ArrowLeft,
  Package,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  X,
  Upload,
  Download,
  Layers,
  TrendingUp,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  ScanLine,
  Tag,
  SlidersHorizontal,
  History,
  Wand2,
  Repeat,
  MapPin,
  Building2,
  Image as ImageIcon,
  Camera,
  CheckCheck,
  FileSpreadsheet,
  Send,
  Printer,
  ClipboardList,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import "./inventory.css";

/* ===========================================================================
   TYPES
=========================================================================== */

type AdjustmentReason = "damaged" | "expired" | "manual_correction" | "theft" | "other";
type MovementType = "purchase" | "sale" | "adjustment" | "return" | "transfer";
type TabKey = "basic" | "pricing" | "stock" | "batches" | "supplier" | "variants" | "locations";
type SortField = "name" | "sku" | "retailPrice" | "totalStock" | "category" | "margin";

interface Batch {
  id: string;
  batchNo: string;
  expiryDate: string; // yyyy-mm-dd
  quantity: number;
}

interface VariantItem {
  id: string;
  size: string;
  color: string;
  sku: string;
  stock: number;
  price: number;
}

interface LocationStock {
  locationId: string;
  locationName: string;
  stock: number;
}

interface Supplier {
  id: string;
  name: string;
  contact: string;
  email?: string;
}

interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: MovementType;
  reason?: AdjustmentReason;
  quantityChange: number;
  resultingStock: number;
  note?: string;
  locationName?: string;
  date: string; // ISO
}

interface PODraftItem {
  productId: string;
  productName: string;
  quantity: number;
  purchaseUnit: string;
}

interface PurchaseOrderDraft {
  id: string;
  supplierId: string;
  supplierName: string;
  items: PODraftItem[];
  status: "draft" | "sent";
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  barcode: string;
  sku: string;
  category: string;
  description: string;
  hsnCode: string;
  gstRate: number;
  cost: number;
  retailPrice: number;
  wholesalePrice: number;
  supplierId: string;
  supplierName: string;
  lastPurchasePrice: number;
  unit: string;
  purchaseUnit: string;
  conversionFactor: number;
  stock: number; // used directly when multi-location is off / no location rows exist
  minStock: number;
  reorderPoint: number;
  reorderQty: number;
  batches: Batch[];
  locations: LocationStock[];
  variants: VariantItem[];
  createdAt: string;
  updatedAt: string;
}

/* ===========================================================================
   CONSTANTS
=========================================================================== */

const UNITS = ["pcs", "kg", "g", "L", "mL", "bag", "box", "btl", "pack", "jar", "dozen"];
const PURCHASE_UNITS = ["Box", "Carton", "Case", "Dozen", "Pallet", "Bag", "Drum", "Same as sell unit"];
const CATEGORIES = [
  "Groceries",
  "Beverages",
  "Snacks",
  "Dairy",
  "Personal Care",
  "Household",
  "Stationery",
  "Electronics",
  "Clothing",
  "Other",
];
const GST_RATES = [0, 5, 12, 18, 28];
const NEAR_EXPIRY_DAYS = 30;

const ADJUSTMENT_REASONS: { value: AdjustmentReason; label: string }[] = [
  { value: "damaged", label: "Damaged" },
  { value: "expired", label: "Expired" },
  { value: "manual_correction", label: "Manual Correction" },
  { value: "theft", label: "Theft" },
  { value: "other", label: "Other" },
];

const TABS: { key: TabKey; label: string }[] = [
  { key: "basic", label: "Basic Info" },
  { key: "pricing", label: "Pricing & Tax" },
  { key: "stock", label: "Stock & Units" },
  { key: "batches", label: "Batches & Expiry" },
  { key: "supplier", label: "Supplier" },
  { key: "variants", label: "Variants" },
  { key: "locations", label: "Locations" },
];

const DEFAULT_LOCATIONS: { id: string; name: string }[] = [
  { id: "loc-main", name: "Main Store" },
  { id: "loc-wh", name: "Warehouse" },
];

const DEFAULT_SUPPLIERS: Supplier[] = [
  { id: "sup-1", name: "Bharat Distributors", contact: "+91 98765 43210", email: "orders@bharatdist.example" },
  { id: "sup-2", name: "Sunrise FMCG Traders", contact: "+91 91234 56789", email: "sales@sunrisefmcg.example" },
  { id: "sup-3", name: "Metro Wholesale Hub", contact: "+91 99887 66554", email: "hello@metrowholesale.example" },
];

/* ===========================================================================
   HELPERS
=========================================================================== */

const generateId = (prefix = "") =>
  `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const daysUntil = (dateStr: string) => {
  if (!dateStr) return null;
  const target = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const currency = (n: number) => `₹${(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const ean13CheckDigit = (digits12: string) => {
  const nums = digits12.split("").map(Number);
  const sum = nums.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
  const mod = sum % 10;
  return mod === 0 ? 0 : 10 - mod;
};

const generateBarcode = () => {
  let base = "890"; // India GS1 prefix
  for (let i = 0; i < 9; i++) base += Math.floor(Math.random() * 10);
  return base + ean13CheckDigit(base);
};

const generateSKU = (name: string) => {
  const clean = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const slug = clean.slice(0, 12) || "PROD";
  return `${slug}-${Date.now().toString().slice(-5)}`;
};

const getTotalStock = (p: Product) =>
  p.locations && p.locations.length > 0
    ? p.locations.reduce((sum, l) => sum + (l.stock || 0), 0)
    : p.stock;

const getMarginPercent = (p: Product) => {
  if (!p.retailPrice) return 0;
  return ((p.retailPrice - p.cost) / p.retailPrice) * 100;
};

const getNearExpiryBatches = (p: Product, days = NEAR_EXPIRY_DAYS) =>
  (p.batches || []).filter((b) => {
    const d = daysUntil(b.expiryDate);
    return d !== null && d >= 0 && d <= days;
  });

const getExpiredBatches = (p: Product) =>
  (p.batches || []).filter((b) => {
    const d = daysUntil(b.expiryDate);
    return d !== null && d < 0;
  });

const needsReorder = (p: Product) => getTotalStock(p) <= (p.reorderPoint || p.minStock);

const getSortValue = (p: Product, field: SortField): string | number => {
  switch (field) {
    case "totalStock":
      return getTotalStock(p);
    case "margin":
      return getMarginPercent(p);
    case "retailPrice":
      return p.retailPrice;
    case "sku":
      return p.sku.toLowerCase();
    case "category":
      return p.category.toLowerCase();
    case "name":
    default:
      return p.name.toLowerCase();
  }
};

const makeBlankProduct = (overrides: Partial<Product> = {}): Product => {
  const base: Product = {
    id: generateId("prod-"),
    name: "",
    imageUrl: "",
    barcode: "",
    sku: "",
    category: "",
    description: "",
    hsnCode: "",
    gstRate: 18,
    cost: 0,
    retailPrice: 0,
    wholesalePrice: 0,
    supplierId: "",
    supplierName: "",
    lastPurchasePrice: 0,
    unit: "pcs",
    purchaseUnit: "Box",
    conversionFactor: 1,
    stock: 0,
    minStock: 5,
    reorderPoint: 5,
    reorderQty: 20,
    batches: [],
    locations: [],
    variants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const merged = { ...base, ...overrides };
  return merged;
};

/* CSV helpers (no external dependency) */

const csvEscape = (val: string | number) => {
  const s = String(val ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const productsToCSV = (products: Product[]) => {
  const headers = [
    "name", "sku", "barcode", "category", "hsnCode", "gstRate", "cost",
    "retailPrice", "wholesalePrice", "stock", "unit", "minStock",
    "reorderPoint", "supplier", "lastPurchasePrice",
  ];
  const rows = products.map((p) =>
    [
      p.name, p.sku, p.barcode, p.category, p.hsnCode, p.gstRate, p.cost,
      p.retailPrice, p.wholesalePrice, getTotalStock(p), p.unit, p.minStock,
      p.reorderPoint, p.supplierName || "", p.lastPurchasePrice,
    ]
      .map(csvEscape)
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
};

const downloadFile = (filename: string, content: string, mime = "text/csv") => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Simple CSV parser supporting quoted fields with embedded commas/newlines.
const parseCSV = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && next === "\n") i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
};

/* ===========================================================================
   SEED DATA
=========================================================================== */

const buildInitialProducts = (): Product[] => {
  const inDays = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };
  const sup = (i: number) => DEFAULT_SUPPLIERS[i % DEFAULT_SUPPLIERS.length].id;

  return [
    makeBlankProduct({
      name: "Tata Salt 1kg", barcode: generateBarcode(), sku: "TATA-SALT-001",
      category: "Groceries", unit: "pcs", purchaseUnit: "Box", conversionFactor: 24,
      cost: 18, retailPrice: 24, wholesalePrice: 21, hsnCode: "2501", gstRate: 5,
      supplierId: sup(0), lastPurchasePrice: 17.5, minStock: 10, reorderPoint: 12, reorderQty: 48,
      description: "Premium iodized salt",
      locations: [
        { locationId: "loc-main", locationName: "Main Store", stock: 30 },
        { locationId: "loc-wh", locationName: "Warehouse", stock: 15 },
      ],
    }),
    makeBlankProduct({
      name: "Amul Butter 100g", barcode: generateBarcode(), sku: "AMUL-BUT-002",
      category: "Dairy", unit: "pcs", purchaseUnit: "Carton", conversionFactor: 48,
      cost: 38, retailPrice: 52, wholesalePrice: 47, hsnCode: "0405", gstRate: 12,
      supplierId: sup(1), lastPurchasePrice: 37, minStock: 8, reorderPoint: 10, reorderQty: 48,
      description: "Salted butter",
      locations: [
        { locationId: "loc-main", locationName: "Main Store", stock: 20 },
        { locationId: "loc-wh", locationName: "Warehouse", stock: 10 },
      ],
      batches: [
        { id: generateId("batch-"), batchNo: "AMUL-0625", expiryDate: inDays(9), quantity: 18 },
        { id: generateId("batch-"), batchNo: "AMUL-0712", expiryDate: inDays(48), quantity: 12 },
      ],
    }),
    makeBlankProduct({
      name: "Surf Excel", barcode: generateBarcode(), sku: "SURF-EXC-003",
      category: "Household", unit: "pcs", purchaseUnit: "Case", conversionFactor: 12,
      cost: 140, retailPrice: 190, wholesalePrice: 172, hsnCode: "3402", gstRate: 18,
      supplierId: sup(2), lastPurchasePrice: 136, minStock: 5, reorderPoint: 6, reorderQty: 24,
      description: "Detergent powder",
      locations: [
        { locationId: "loc-main", locationName: "Main Store", stock: 9 },
        { locationId: "loc-wh", locationName: "Warehouse", stock: 6 },
      ],
      variants: [
        { id: generateId("var-"), size: "500g", color: "", sku: "SURF-EXC-003-500G", stock: 10, price: 95 },
        { id: generateId("var-"), size: "1kg", color: "", sku: "SURF-EXC-003-1KG", stock: 15, price: 190 },
        { id: generateId("var-"), size: "2kg", color: "", sku: "SURF-EXC-003-2KG", stock: 5, price: 360 },
      ],
    }),
    makeBlankProduct({
      name: "Aashirvaad Atta 5kg", barcode: generateBarcode(), sku: "AASH-ATTA-004",
      category: "Groceries", unit: "bag", purchaseUnit: "Pallet", conversionFactor: 40,
      cost: 210, retailPrice: 265, wholesalePrice: 245, hsnCode: "1101", gstRate: 5,
      supplierId: sup(0), lastPurchasePrice: 205, minStock: 10, reorderPoint: 10, reorderQty: 40,
      description: "Whole wheat flour",
      locations: [
        { locationId: "loc-main", locationName: "Main Store", stock: 14 },
        { locationId: "loc-wh", locationName: "Warehouse", stock: 6 },
      ],
    }),
    makeBlankProduct({
      name: "Fortune Oil 1L", barcode: generateBarcode(), sku: "FORT-OIL-005",
      category: "Groceries", unit: "btl", purchaseUnit: "Case", conversionFactor: 15,
      cost: 105, retailPrice: 140, wholesalePrice: 128, hsnCode: "1507", gstRate: 5,
      supplierId: sup(1), lastPurchasePrice: 102, minStock: 8, reorderPoint: 9, reorderQty: 30,
      description: "Refined cooking oil",
      locations: [
        { locationId: "loc-main", locationName: "Main Store", stock: 18 },
        { locationId: "loc-wh", locationName: "Warehouse", stock: 7 },
      ],
    }),
    makeBlankProduct({
      name: "Parle-G Biscuit", barcode: generateBarcode(), sku: "PARLE-G-006",
      category: "Snacks", unit: "pcs", purchaseUnit: "Box", conversionFactor: 96,
      cost: 7, retailPrice: 10, wholesalePrice: 9, hsnCode: "1905", gstRate: 18,
      supplierId: sup(2), lastPurchasePrice: 6.6, minStock: 20, reorderPoint: 24, reorderQty: 192,
      description: "Glucose biscuits",
      locations: [
        { locationId: "loc-main", locationName: "Main Store", stock: 70 },
        { locationId: "loc-wh", locationName: "Warehouse", stock: 30 },
      ],
    }),
    makeBlankProduct({
      name: "Maggi 70g", barcode: generateBarcode(), sku: "MAGGI-007",
      category: "Snacks", unit: "pcs", purchaseUnit: "Box", conversionFactor: 48,
      cost: 10, retailPrice: 14, wholesalePrice: 12.5, hsnCode: "1902", gstRate: 12,
      supplierId: sup(1), lastPurchasePrice: 9.5, minStock: 15, reorderPoint: 18, reorderQty: 96,
      description: "Instant noodles",
      locations: [
        { locationId: "loc-main", locationName: "Main Store", stock: 55 },
        { locationId: "loc-wh", locationName: "Warehouse", stock: 25 },
      ],
      batches: [{ id: generateId("batch-"), batchNo: "MGI-2204", expiryDate: inDays(120), quantity: 80 }],
    }),
    makeBlankProduct({
      name: "Colgate 200g", barcode: generateBarcode(), sku: "COLGATE-008",
      category: "Personal Care", unit: "pcs", purchaseUnit: "Carton", conversionFactor: 36,
      cost: 55, retailPrice: 80, wholesalePrice: 72, hsnCode: "3306", gstRate: 18,
      supplierId: sup(0), lastPurchasePrice: 52, minStock: 10, reorderPoint: 12, reorderQty: 36,
      description: "Toothpaste",
      locations: [
        { locationId: "loc-main", locationName: "Main Store", stock: 25 },
        { locationId: "loc-wh", locationName: "Warehouse", stock: 10 },
      ],
      variants: [
        { id: generateId("var-"), size: "100g", color: "", sku: "COLGATE-008-100G", stock: 20, price: 45 },
        { id: generateId("var-"), size: "200g", color: "", sku: "COLGATE-008-200G", stock: 15, price: 80 },
      ],
    }),
    makeBlankProduct({
      name: "Lifebuoy Soap", barcode: generateBarcode(), sku: "LIFEBUOY-009",
      category: "Personal Care", unit: "pcs", purchaseUnit: "Carton", conversionFactor: 72,
      cost: 25, retailPrice: 35, wholesalePrice: 31, hsnCode: "3401", gstRate: 18,
      supplierId: sup(2), lastPurchasePrice: 23.5, minStock: 12, reorderPoint: 15, reorderQty: 72,
      description: "Bathing soap",
      locations: [
        { locationId: "loc-main", locationName: "Main Store", stock: 35 },
        { locationId: "loc-wh", locationName: "Warehouse", stock: 15 },
      ],
    }),
    makeBlankProduct({
      name: "Horlicks 500g", barcode: generateBarcode(), sku: "HORLICKS-010",
      category: "Beverages", unit: "jar", purchaseUnit: "Case", conversionFactor: 12,
      cost: 190, retailPrice: 245, wholesalePrice: 225, hsnCode: "1901", gstRate: 18,
      supplierId: sup(1), lastPurchasePrice: 184, minStock: 4, reorderPoint: 5, reorderQty: 24,
      description: "Health drink",
      locations: [
        { locationId: "loc-main", locationName: "Main Store", stock: 8 },
        { locationId: "loc-wh", locationName: "Warehouse", stock: 4 },
      ],
      batches: [{ id: generateId("batch-"), batchNo: "HOR-2118", expiryDate: inDays(-4), quantity: 3 }],
    }),
  ];
};

/* ===========================================================================
   MAIN PAGE COMPONENT
=========================================================================== */

export default function InventoryPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [suppliers] = useState<Supplier[]>(DEFAULT_SUPPLIERS);
  const [locations] = useState(DEFAULT_LOCATIONS);
  const [multiLocationEnabled, setMultiLocationEnabled] = useState(true);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [draftPOs, setDraftPOs] = useState<PurchaseOrderDraft[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showLowStock, setShowLowStock] = useState(false);
  const [showNearExpiry, setShowNearExpiry] = useState(false);
  const [showReorderOnly, setShowReorderOnly] = useState(false);

  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [printQueue, setPrintQueue] = useState<Product[]>([]);
  const [scannerCallback, setScannerCallback] = useState<{ fn: (code: string) => void } | null>(null);

  useEffect(() => {
    const seed = buildInitialProducts();
    setProducts(seed);
    setFilteredProducts(seed);
  }, []);

  useEffect(() => {
    let result = [...products];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term) ||
          p.barcode.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term) ||
          p.hsnCode.toLowerCase().includes(term) ||
          (p.supplierName || "").toLowerCase().includes(term)
      );
    }

    if (selectedCategory !== "All") result = result.filter((p) => p.category === selectedCategory);

    if (showLowStock) {
      result = result.filter((p) => {
        const s = getTotalStock(p);
        return s > 0 && s <= p.minStock;
      });
    }

    if (showNearExpiry) {
      result = result.filter((p) => getNearExpiryBatches(p).length > 0 || getExpiredBatches(p).length > 0);
    }

    if (showReorderOnly) result = result.filter(needsReorder);

    result.sort((a, b) => {
      const aVal = getSortValue(a, sortField);
      const bVal = getSortValue(b, sortField);
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredProducts(result);
  }, [products, searchTerm, selectedCategory, sortField, sortDirection, showLowStock, showNearExpiry, showReorderOnly]);

  // Close any open row action menu on outside click
  useEffect(() => {
    if (!openMenuId) return;
    const handler = () => setOpenMenuId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [openMenuId]);

  const logMovement = (
    product: Product,
    type: MovementType,
    reason: AdjustmentReason | undefined,
    quantityChange: number,
    resultingStock: number,
    note?: string,
    locationName?: string
  ) => {
    setStockMovements((prev) => [
      {
        id: generateId("mv-"),
        productId: product.id,
        productName: product.name,
        type,
        reason,
        quantityChange,
        resultingStock,
        note,
        locationName,
        date: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const handleAddProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
    const total = getTotalStock(product);
    if (total > 0) logMovement(product, "purchase", undefined, total, total, "Initial stock on product creation");
    setShowAddModal(false);
  };

  const handleEditProduct = (updated: Product) => {
    const original = products.find((p) => p.id === updated.id);
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (original) {
      const diff = getTotalStock(updated) - getTotalStock(original);
      if (diff !== 0) {
        logMovement(updated, "adjustment", "manual_correction", diff, getTotalStock(updated), "Updated via product edit form");
      }
    }
    setShowEditModal(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = () => {
    if (!selectedProduct) return;
    setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
    setShowDeleteModal(false);
    setSelectedProduct(null);
  };

  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) return;
    setProducts((prev) => prev.filter((p) => !selectedProducts.includes(p.id)));
    setSelectedProducts([]);
  };

  const handleAdjustStock = (data: {
    direction: "add" | "remove";
    quantity: number;
    reason: AdjustmentReason;
    note: string;
    locationId?: string;
  }) => {
    if (!selectedProduct) return;
    const change = data.direction === "add" ? data.quantity : -data.quantity;
    let updatedProduct: Product | null = null;
    let locName = "";

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== selectedProduct.id) return p;
        let next: Product;
        if (multiLocationEnabled && data.locationId) {
          locName = locations.find((l) => l.id === data.locationId)?.name || "";
          const existing = p.locations.find((l) => l.locationId === data.locationId);
          const newLocations = existing
            ? p.locations.map((l) =>
                l.locationId === data.locationId ? { ...l, stock: Math.max(0, l.stock + change) } : l
              )
            : [...p.locations, { locationId: data.locationId, locationName: locName, stock: Math.max(0, change) }];
          next = { ...p, locations: newLocations, updatedAt: new Date().toISOString() };
        } else {
          next = { ...p, stock: Math.max(0, p.stock + change), updatedAt: new Date().toISOString() };
        }
        updatedProduct = next;
        return next;
      })
    );

    if (updatedProduct) {
      logMovement(updatedProduct, "adjustment", data.reason, change, getTotalStock(updatedProduct), data.note, locName || undefined);
    }
    setShowAdjustModal(false);
    setSelectedProduct(null);
  };

  const handleImportProducts = (newProducts: Product[]) => {
    setProducts((prev) => [...newProducts, ...prev]);
    newProducts.forEach((p) => {
      const total = getTotalStock(p);
      if (total > 0) logMovement(p, "purchase", undefined, total, total, "Imported via CSV");
    });
    setShowImportModal(false);
  };

  const handleExportCSV = (list: Product[]) => {
    const today = new Date().toISOString().slice(0, 10);
    downloadFile(`inventory-export-${today}.csv`, productsToCSV(list));
  };

  const handleGenerateDraftPO = (supplierId: string, items: PODraftItem[]) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    setDraftPOs((prev) => [
      {
        id: generateId("po-"),
        supplierId,
        supplierName: supplier ? supplier.name : "Unassigned Supplier",
        items,
        status: "draft",
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleMarkPOSent = (id: string) => {
    setDraftPOs((prev) => prev.map((po) => (po.id === id ? { ...po, status: "sent" } : po)));
  };

  const handleDeleteDraftPO = (id: string) => {
    setDraftPOs((prev) => prev.filter((po) => po.id !== id));
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const toggleProductSelection = (id: string) => {
    setSelectedProducts((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === filteredProducts.length) setSelectedProducts([]);
    else setSelectedProducts(filteredProducts.map((p) => p.id));
  };

  const toggleExpand = (id: string) => {
    setExpandedRows((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const openScanner = (fn: (code: string) => void) => {
    setScannerCallback({ fn });
    setShowScanModal(true);
  };

  const handleScanDetect = (code: string) => {
    scannerCallback?.fn(code);
    setShowScanModal(false);
    setScannerCallback(null);
  };

  const getStockStatus = (product: Product) => {
    const stock = getTotalStock(product);
    if (stock <= 0) return { label: "Out of Stock", className: "stock-status-out" };
    if (stock <= product.minStock) return { label: "Low Stock", className: "stock-status-low" };
    if (stock <= product.minStock * 2) return { label: "Medium Stock", className: "stock-status-medium" };
    return { label: "In Stock", className: "stock-status-in" };
  };

  const getCategoryCount = (category: string) =>
    category === "All" ? products.length : products.filter((p) => p.category === category).length;

  const totalProducts = products.length;
  const lowStockCount = products.filter((p) => {
    const s = getTotalStock(p);
    return s > 0 && s <= p.minStock;
  }).length;
  const nearExpiryCount = products.reduce(
    (sum, p) => sum + getNearExpiryBatches(p).length + getExpiredBatches(p).length,
    0
  );
  const reorderCount = products.filter(needsReorder).length;
  const totalStockValue = products.reduce((sum, p) => sum + p.retailPrice * getTotalStock(p), 0);

  return (
    <div className="inventory-page">
      <div className="inventory-container">
        {/* Header */}
        <div className="inventory-header">
          <div className="inventory-header-left">
            <button onClick={() => router.back()} className="inventory-back-btn">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="inventory-header-title">Inventory Management</h1>
              <p className="inventory-header-subtitle">Manage your products, stock, suppliers & purchase orders</p>
            </div>
          </div>
          <div className="inventory-header-right">
            <button className="inventory-secondary-btn" onClick={() => openScanner((code) => setSearchTerm(code))}>
              <ScanLine size={16} /> Scan
            </button>
            <button className="inventory-secondary-btn" onClick={() => setShowImportModal(true)}>
              <Upload size={16} /> Import
            </button>
            <button className="inventory-secondary-btn" onClick={() => handleExportCSV(filteredProducts)}>
              <Download size={16} /> Export
            </button>
            <button
              className={`inventory-secondary-btn ${reorderCount > 0 ? "inventory-secondary-btn-active" : ""}`}
              onClick={() => setShowReorderModal(true)}
            >
              <ClipboardList size={16} /> Reorder{reorderCount > 0 ? ` (${reorderCount})` : ""}
            </button>
            <button onClick={() => setShowAddModal(true)} className="inventory-add-btn">
              <Plus size={18} /> Add Product
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="inventory-stats-grid">
          <div className="inventory-stat-card">
            <div className="inventory-stat-icon inventory-stat-icon-total">
              <Package size={20} />
            </div>
            <div>
              <p className="inventory-stat-label">Total Products</p>
              <p className="inventory-stat-value">{totalProducts}</p>
            </div>
          </div>
          <div className="inventory-stat-card inventory-stat-card-clickable" onClick={() => setShowLowStock((v) => !v)}>
            <div className="inventory-stat-icon inventory-stat-icon-low">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="inventory-stat-label">Low Stock</p>
              <p className="inventory-stat-value">{lowStockCount}</p>
            </div>
          </div>
          <div className="inventory-stat-card inventory-stat-card-clickable" onClick={() => setShowNearExpiry((v) => !v)}>
            <div className="inventory-stat-icon inventory-stat-icon-expiry">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="inventory-stat-label">Near Expiry</p>
              <p className="inventory-stat-value">{nearExpiryCount}</p>
            </div>
          </div>
          <div className="inventory-stat-card inventory-stat-card-clickable" onClick={() => setShowReorderModal(true)}>
            <div className="inventory-stat-icon inventory-stat-icon-reorder">
              <ClipboardList size={20} />
            </div>
            <div>
              <p className="inventory-stat-label">Reorder Needed</p>
              <p className="inventory-stat-value">{reorderCount}</p>
            </div>
          </div>
          <div className="inventory-stat-card">
            <div className="inventory-stat-icon inventory-stat-icon-value">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="inventory-stat-label">Stock Value</p>
              <p className="inventory-stat-value">{currency(totalStockValue)}</p>
            </div>
          </div>
          <div className="inventory-stat-card">
            <div className="inventory-stat-icon inventory-stat-icon-categories">
              <Layers size={20} />
            </div>
            <div>
              <p className="inventory-stat-label">Categories</p>
              <p className="inventory-stat-value">{CATEGORIES.length}</p>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="inventory-filters">
          <div className="inventory-search-wrapper">
            <Search size={18} className="inventory-search-icon" />
            <input
              type="text"
              placeholder="Search by name, SKU, barcode, HSN, or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="inventory-search-input"
            />
            <button className="inventory-search-scan-btn" title="Scan barcode" onClick={() => openScanner((code) => setSearchTerm(code))}>
              <ScanLine size={16} />
            </button>
          </div>

          <div className="inventory-filter-group">
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="inventory-filter-select">
              <option value="All">All Categories ({getCategoryCount("All")})</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} ({getCategoryCount(cat)})
                </option>
              ))}
            </select>

            <button onClick={() => setShowLowStock((v) => !v)} className={`inventory-filter-btn ${showLowStock ? "inventory-filter-btn-active" : ""}`}>
              <AlertCircle size={16} /> Low Stock
            </button>
            <button
              onClick={() => setShowNearExpiry((v) => !v)}
              className={`inventory-filter-btn ${showNearExpiry ? "inventory-filter-btn-active-rose" : ""}`}
            >
              <AlertTriangle size={16} /> Near Expiry
            </button>
            <button
              onClick={() => setShowReorderOnly((v) => !v)}
              className={`inventory-filter-btn ${showReorderOnly ? "inventory-filter-btn-active-violet" : ""}`}
            >
              <ClipboardList size={16} /> Needs Reorder
            </button>
            <button
              onClick={() => setMultiLocationEnabled((v) => !v)}
              className={`inventory-filter-btn ${multiLocationEnabled ? "inventory-filter-btn-active" : ""}`}
            >
              <Building2 size={16} /> Multi-Location {multiLocationEnabled ? "On" : "Off"}
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="inventory-bulk-actions">
            <div className="inventory-bulk-actions-info">
              <CheckCircle2 size={16} />
              <span>{selectedProducts.length} product(s) selected</span>
            </div>
            <div className="inventory-bulk-actions-buttons">
              <button
                className="inventory-bulk-print-btn"
                onClick={() => {
                  setPrintQueue(products.filter((p) => selectedProducts.includes(p.id)));
                  setShowPrintModal(true);
                }}
              >
                <Tag size={16} /> Print Labels
              </button>
              <button
                className="inventory-bulk-export-btn"
                onClick={() => handleExportCSV(products.filter((p) => selectedProducts.includes(p.id)))}
              >
                <Download size={16} /> Export
              </button>
              <button onClick={handleBulkDelete} className="inventory-bulk-delete-btn">
                <Trash2 size={16} /> Delete Selected
              </button>
              <button onClick={() => setSelectedProducts([])} className="inventory-bulk-clear-btn">
                <X size={16} /> Clear
              </button>
            </div>
          </div>
        )}

        {/* Product Table */}
        <div className="inventory-table-wrapper">
          {filteredProducts.length === 0 ? (
            <div className="inventory-empty-state">
              <div className="inventory-empty-state-icon">
                <Package size={48} />
              </div>
              <h3>No products found</h3>
              <p>{searchTerm ? "Try adjusting your search or filters" : "Start by adding your first product"}</p>
              {!searchTerm && (
                <button onClick={() => setShowAddModal(true)} className="inventory-empty-add-btn">
                  <Plus size={18} /> Add Product
                </button>
              )}
            </div>
          ) : (
            <div className="inventory-table-container">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th className="inventory-table-th-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                        onChange={selectAllProducts}
                        className="inventory-checkbox"
                      />
                    </th>
                    <th className="inventory-table-th-expand" />
                    <th className="inventory-table-th-name" onClick={() => handleSort("name")}>
                      <span className="inventory-th-content">
                        Product <span className="inventory-sort-icon">{getSortIcon("name")}</span>
                      </span>
                    </th>
                    <th className="inventory-table-th-sku" onClick={() => handleSort("sku")}>
                      <span className="inventory-th-content">
                        SKU <span className="inventory-sort-icon">{getSortIcon("sku")}</span>
                      </span>
                    </th>
                    <th className="inventory-table-th-price" onClick={() => handleSort("retailPrice")}>
                      <span className="inventory-th-content inventory-th-content-right">
                        Price <span className="inventory-sort-icon">{getSortIcon("retailPrice")}</span>
                      </span>
                    </th>
                    <th className="inventory-table-th-stock" onClick={() => handleSort("totalStock")}>
                      <span className="inventory-th-content inventory-th-content-center">
                        Stock <span className="inventory-sort-icon">{getSortIcon("totalStock")}</span>
                      </span>
                    </th>
                    <th className="inventory-table-th-category" onClick={() => handleSort("category")}>
                      <span className="inventory-th-content">
                        Category <span className="inventory-sort-icon">{getSortIcon("category")}</span>
                      </span>
                    </th>
                    <th className="inventory-table-th-actions">
                      <span className="inventory-th-content inventory-th-content-center">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product);
                    const totalStock = getTotalStock(product);
                    const margin = getMarginPercent(product);
                    const marginClass =
                      margin >= 30 ? "inventory-margin-good" : margin >= 15 ? "inventory-margin-ok" : "inventory-margin-bad";
                    const nearExpiry = getNearExpiryBatches(product);
                    const expired = getExpiredBatches(product);
                    const reorderFlag = needsReorder(product);
                    const isExpanded = expandedRows.includes(product.id);

                    return (
                      <Fragment key={product.id}>
                        <tr className={`inventory-table-row ${selectedProducts.includes(product.id) ? "inventory-table-row-selected" : ""}`}>
                          <td className="inventory-table-td-checkbox">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product.id)}
                              onChange={() => toggleProductSelection(product.id)}
                              className="inventory-checkbox"
                            />
                          </td>
                          <td className="inventory-table-td-expand">
                            <button
                              className={`inventory-expand-btn ${isExpanded ? "inventory-expand-btn-open" : ""}`}
                              onClick={() => toggleExpand(product.id)}
                              title="View details"
                            >
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                          </td>
                          <td className="inventory-table-td-name">
                            <div className="inventory-product-cell">
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="inventory-product-thumb" />
                              ) : (
                                <div className="inventory-product-thumb-placeholder">
                                  <ImageIcon size={18} />
                                </div>
                              )}
                              <div>
                                <div className="inventory-product-name">{product.name}</div>
                                <div className="inventory-product-unit">
                                  {product.unit}
                                  {product.batches.length > 0 ? ` · ${product.batches.length} batch${product.batches.length > 1 ? "es" : ""}` : ""}
                                  {product.variants.length > 0 ? ` · ${product.variants.length} variants` : ""}
                                </div>
                                <div className="inventory-product-barcode-num">{product.barcode}</div>
                              </div>
                            </div>
                          </td>
                          <td className="inventory-table-td-sku">
                            <span className="inventory-product-sku">{product.sku}</span>
                          </td>
                          <td className="inventory-table-td-price">
                            <div className="inventory-product-price">{currency(product.retailPrice)}</div>
                            {product.wholesalePrice > 0 && <div className="inventory-product-price-sub">Wholesale: {currency(product.wholesalePrice)}</div>}
                            <div className={`inventory-product-margin ${marginClass}`}>{margin.toFixed(0)}% margin</div>
                          </td>
                          <td className="inventory-table-td-stock">
                            <div className="inventory-stock-wrapper">
                              <span className="inventory-stock-value">
                                {totalStock} {product.unit}
                              </span>
                              <div className="inventory-stock-badges">
                                <span className={`inventory-stock-badge ${stockStatus.className}`}>{stockStatus.label}</span>
                                {reorderFlag && <span className="inventory-stock-badge inventory-badge-reorder">Reorder</span>}
                                {expired.length > 0 && <span className="inventory-stock-badge inventory-badge-expired">Expired</span>}
                                {expired.length === 0 && nearExpiry.length > 0 && (
                                  <span className="inventory-stock-badge inventory-badge-expiry">Expiring Soon</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="inventory-table-td-category">
                            <span className="inventory-product-category">{product.category}</span>
                          </td>
                          <td className="inventory-table-td-actions">
                            <div className="inventory-action-buttons">
                              <button
                                className="inventory-action-btn inventory-action-menu-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === product.id ? null : product.id);
                                }}
                                title="More actions"
                              >
                                <MoreVertical size={16} />
                              </button>
                              {openMenuId === product.id && (
                                <div className="inventory-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    className="inventory-dropdown-item"
                                    onClick={() => {
                                      openEditModal(product);
                                      setOpenMenuId(null);
                                    }}
                                  >
                                    <Edit2 size={14} /> Edit Product
                                  </button>
                                  <button
                                    className="inventory-dropdown-item"
                                    onClick={() => {
                                      setSelectedProduct(product);
                                      setShowAdjustModal(true);
                                      setOpenMenuId(null);
                                    }}
                                  >
                                    <SlidersHorizontal size={14} /> Adjust Stock
                                  </button>
                                  <button
                                    className="inventory-dropdown-item"
                                    onClick={() => {
                                      setSelectedProduct(product);
                                      setShowHistoryModal(true);
                                      setOpenMenuId(null);
                                    }}
                                  >
                                    <History size={14} /> Stock History
                                  </button>
                                  <button
                                    className="inventory-dropdown-item"
                                    onClick={() => {
                                      setPrintQueue([product]);
                                      setShowPrintModal(true);
                                      setOpenMenuId(null);
                                    }}
                                  >
                                    <Tag size={14} /> Print Barcode
                                  </button>
                                  <div className="inventory-dropdown-divider" />
                                  <button
                                    className="inventory-dropdown-item inventory-dropdown-item-danger"
                                    onClick={() => {
                                      openDeleteModal(product);
                                      setOpenMenuId(null);
                                    }}
                                  >
                                    <Trash2 size={14} /> Delete Product
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="inventory-detail-row">
                            <td colSpan={8}>
                              <div className="inventory-detail-panel">
                                <div className="inventory-detail-section">
                                  <h4>Tax & Identifiers</h4>
                                  <div className="inventory-detail-kv">
                                    <span>HSN Code</span>
                                    <strong>{product.hsnCode || "—"}</strong>
                                  </div>
                                  <div className="inventory-detail-kv">
                                    <span>GST Rate</span>
                                    <strong>{product.gstRate}%</strong>
                                  </div>
                                  <div className="inventory-detail-kv">
                                    <span>Barcode</span>
                                    <strong>{product.barcode}</strong>
                                  </div>
                                  <div className="inventory-detail-kv">
                                    <span>Cost Price</span>
                                    <strong>{currency(product.cost)}</strong>
                                  </div>
                                </div>

                                <div className="inventory-detail-section">
                                  <h4>Supplier</h4>
                                  {product.supplierName ? (
                                    <>
                                      <div className="inventory-detail-kv">
                                        <span>Vendor</span>
                                        <strong>{product.supplierName}</strong>
                                      </div>
                                      <div className="inventory-detail-kv">
                                        <span>Last Purchase Price</span>
                                        <strong>{currency(product.lastPurchasePrice)}</strong>
                                      </div>
                                    </>
                                  ) : (
                                    <p className="inventory-empty-mini">No supplier linked</p>
                                  )}
                                  <div className="inventory-conversion-note">
                                    1 {product.purchaseUnit} = {product.conversionFactor} {product.unit}
                                  </div>
                                </div>

                                <div className="inventory-detail-section">
                                  <h4>Batches & Expiry</h4>
                                  {product.batches.length === 0 ? (
                                    <p className="inventory-empty-mini">No batches tracked</p>
                                  ) : (
                                    <table className="inventory-mini-table">
                                      <thead>
                                        <tr>
                                          <th>Batch</th>
                                          <th>Expiry</th>
                                          <th>Qty</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {product.batches.map((b) => {
                                          const d = daysUntil(b.expiryDate);
                                          return (
                                            <tr key={b.id}>
                                              <td>{b.batchNo || "—"}</td>
                                              <td>
                                                {formatDate(b.expiryDate)}
                                                {d !== null && d < 0 && (
                                                  <span className="inventory-expiry-tag inventory-badge-expired" style={{ marginLeft: 6 }}>
                                                    Expired
                                                  </span>
                                                )}
                                                {d !== null && d >= 0 && d <= NEAR_EXPIRY_DAYS && (
                                                  <span className="inventory-expiry-tag inventory-badge-expiry" style={{ marginLeft: 6 }}>
                                                    {d}d left
                                                  </span>
                                                )}
                                              </td>
                                              <td>{b.quantity}</td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  )}
                                </div>

                                <div className="inventory-detail-section">
                                  <h4>Variants</h4>
                                  {product.variants.length === 0 ? (
                                    <p className="inventory-empty-mini">No size/color variants</p>
                                  ) : (
                                    <table className="inventory-mini-table">
                                      <thead>
                                        <tr>
                                          <th>Variant</th>
                                          <th>SKU</th>
                                          <th>Stock</th>
                                          <th>Price</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {product.variants.map((v) => (
                                          <tr key={v.id}>
                                            <td>{[v.size, v.color].filter(Boolean).join(" / ") || "—"}</td>
                                            <td>{v.sku}</td>
                                            <td>{v.stock}</td>
                                            <td>{currency(v.price)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  )}
                                </div>

                                {multiLocationEnabled && (
                                  <div className="inventory-detail-section">
                                    <h4>Stock by Location</h4>
                                    {product.locations.length === 0 ? (
                                      <p className="inventory-empty-mini">No location stock recorded yet</p>
                                    ) : (
                                      <table className="inventory-mini-table">
                                        <thead>
                                          <tr>
                                            <th>Location</th>
                                            <th>Stock</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {product.locations.map((l) => (
                                            <tr key={l.locationId}>
                                              <td>{l.locationName}</td>
                                              <td>
                                                {l.stock} {product.unit}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="inventory-footer">
          <p className="inventory-footer-text">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <ProductFormModal
          mode="add"
          initialProduct={makeBlankProduct()}
          categories={CATEGORIES}
          suppliers={suppliers}
          locations={locations}
          multiLocationEnabled={multiLocationEnabled}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddProduct}
          onOpenScanner={openScanner}
        />
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <ProductFormModal
          mode="edit"
          initialProduct={selectedProduct}
          categories={CATEGORIES}
          suppliers={suppliers}
          locations={locations}
          multiLocationEnabled={multiLocationEnabled}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
          onSave={handleEditProduct}
          onOpenScanner={openScanner}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="inventory-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="inventory-modal inventory-modal-delete" onClick={(e) => e.stopPropagation()}>
            <div className="inventory-modal-header">
              <div className="inventory-modal-delete-icon">
                <AlertCircle size={32} />
              </div>
              <button onClick={() => setShowDeleteModal(false)} className="inventory-modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="inventory-modal-body inventory-modal-delete-body">
              <h3 className="inventory-modal-delete-title">Delete Product</h3>
              <p className="inventory-modal-delete-text">
                Are you sure you want to delete <strong>&quot;{selectedProduct.name}&quot;</strong>? This action cannot be undone.
              </p>
              <div className="inventory-modal-delete-details">
                <p>SKU: {selectedProduct.sku}</p>
                <p>
                  Stock: {getTotalStock(selectedProduct)} {selectedProduct.unit}
                </p>
                <p>Price: {currency(selectedProduct.retailPrice)}</p>
              </div>
            </div>
            <div className="inventory-modal-footer">
              <button onClick={() => setShowDeleteModal(false)} className="inventory-modal-cancel">
                Cancel
              </button>
              <button onClick={handleDeleteProduct} className="inventory-modal-delete-btn">
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showAdjustModal && selectedProduct && (
        <StockAdjustModal
          product={selectedProduct}
          locations={locations}
          multiLocationEnabled={multiLocationEnabled}
          onClose={() => {
            setShowAdjustModal(false);
            setSelectedProduct(null);
          }}
          onSubmit={handleAdjustStock}
        />
      )}

      {/* Stock Movement History Modal */}
      {showHistoryModal && selectedProduct && (
        <StockHistoryModal
          product={selectedProduct}
          movements={stockMovements}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* Barcode Scan Modal */}
      {showScanModal && (
        <ScanModal
          onClose={() => {
            setShowScanModal(false);
            setScannerCallback(null);
          }}
          onDetect={handleScanDetect}
        />
      )}

      {/* Print Barcode Labels Modal */}
      {showPrintModal && printQueue.length > 0 && (
        <PrintLabelsModal
          products={printQueue}
          onClose={() => {
            setShowPrintModal(false);
            setPrintQueue([]);
          }}
        />
      )}

      {/* Bulk Import Modal */}
      {showImportModal && (
        <ImportModal categories={CATEGORIES} onClose={() => setShowImportModal(false)} onImport={handleImportProducts} />
      )}

      {/* Reorder / Draft PO Modal */}
      {showReorderModal && (
        <ReorderModal
          products={products}
          suppliers={suppliers}
          draftPOs={draftPOs}
          onClose={() => setShowReorderModal(false)}
          onGenerate={handleGenerateDraftPO}
          onMarkSent={handleMarkPOSent}
          onDeleteDraft={handleDeleteDraftPO}
        />
      )}
    </div>
  );
}

/* ===========================================================================
   PRODUCT FORM MODAL (Add / Edit, tabbed)
=========================================================================== */

function ProductFormModal({
  mode,
  initialProduct,
  categories,
  suppliers,
  locations,
  multiLocationEnabled,
  onClose,
  onSave,
  onOpenScanner,
}: {
  mode: "add" | "edit";
  initialProduct: Product;
  categories: string[];
  suppliers: Supplier[];
  locations: { id: string; name: string }[];
  multiLocationEnabled: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  onOpenScanner: (fn: (code: string) => void) => void;
}) {
  const [draft, setDraft] = useState<Product>(initialProduct);
  const [activeTab, setActiveTab] = useState<TabKey>("basic");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (patch: Partial<Product>) => setDraft((prev) => ({ ...prev, ...patch }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Please choose an image under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update({ imageUrl: String(reader.result || "") });
    reader.readAsDataURL(file);
  };

  // Batches
  const addBatch = () =>
    update({ batches: [...draft.batches, { id: generateId("batch-"), batchNo: "", expiryDate: "", quantity: 0 }] });
  const updateBatch = (id: string, patch: Partial<Batch>) =>
    update({ batches: draft.batches.map((b) => (b.id === id ? { ...b, ...patch } : b)) });
  const removeBatch = (id: string) => update({ batches: draft.batches.filter((b) => b.id !== id) });

  // Variants
  const addVariant = () =>
    update({
      variants: [
        ...draft.variants,
        {
          id: generateId("var-"),
          size: "",
          color: "",
          sku: `${draft.sku || "SKU"}-V${draft.variants.length + 1}`,
          stock: 0,
          price: draft.retailPrice || 0,
        },
      ],
    });
  const updateVariant = (id: string, patch: Partial<VariantItem>) =>
    update({ variants: draft.variants.map((v) => (v.id === id ? { ...v, ...patch } : v)) });
  const removeVariant = (id: string) => update({ variants: draft.variants.filter((v) => v.id !== id) });

  // Locations
  const updateLocationStock = (locationId: string, locationName: string, stock: number) => {
    const exists = draft.locations.find((l) => l.locationId === locationId);
    const next = exists
      ? draft.locations.map((l) => (l.locationId === locationId ? { ...l, stock } : l))
      : [...draft.locations, { locationId, locationName, stock }];
    update({ locations: next });
  };

  const totalStock = getTotalStock(draft);
  const margin = getMarginPercent(draft);
  const visibleTabs = TABS.filter((t) => t.key !== "locations" || multiLocationEnabled);
  const isValid = draft.name.trim() !== "" && draft.category !== "" && draft.retailPrice > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    const supplier = suppliers.find((s) => s.id === draft.supplierId);
    onSave({
      ...draft,
      sku: draft.sku.trim() || generateSKU(draft.name),
      barcode: draft.barcode.trim() || generateBarcode(),
      supplierName: supplier ? supplier.name : "",
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="inventory-modal-overlay" onClick={onClose}>
      <div className="inventory-modal inventory-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="inventory-modal-header">
          <div>
            <h2 className="inventory-modal-title">{mode === "add" ? "Add Product" : "Edit Product"}</h2>
            <p className="inventory-modal-subtitle">
              {mode === "add" ? "Enter full product details below" : `Editing ${initialProduct.name}`}
            </p>
          </div>
          <button onClick={onClose} className="inventory-modal-close">
            <X size={20} />
          </button>
        </div>

        <div className="inventory-tabs">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              className={`inventory-tab-btn ${activeTab === tab.key ? "inventory-tab-btn-active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="inventory-modal-body">
          {activeTab === "basic" && (
            <>
              <div className="inventory-image-upload">
                {draft.imageUrl ? (
                  <img src={draft.imageUrl} alt="" className="inventory-image-preview" />
                ) : (
                  <div className="inventory-image-placeholder">
                    <ImageIcon size={28} />
                  </div>
                )}
                <div className="inventory-image-actions">
                  <span className="inventory-mini-label">Product Photo</span>
                  <div className="inventory-image-actions-row">
                    <button type="button" className="inventory-upload-btn" onClick={() => fileInputRef.current?.click()}>
                      <Upload size={14} /> {draft.imageUrl ? "Replace" : "Upload"} Image
                    </button>
                    {draft.imageUrl && (
                      <button type="button" className="inventory-upload-btn inventory-upload-btn-danger" onClick={() => update({ imageUrl: "" })}>
                        <X size={14} /> Remove
                      </button>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
                </div>
              </div>

              <div className="inventory-form-grid">
                <div className="inventory-form-group inventory-form-group-full">
                  <label className="inventory-form-label">Product Name *</label>
                  <input
                    className="inventory-form-input"
                    placeholder="Enter product name"
                    value={draft.name}
                    onChange={(e) => update({ name: e.target.value })}
                  />
                </div>

                <div className="inventory-form-group">
                  <label className="inventory-form-label">SKU</label>
                  <input
                    className="inventory-form-input"
                    placeholder="Auto-generated if empty"
                    value={draft.sku}
                    onChange={(e) => update({ sku: e.target.value })}
                  />
                </div>

                <div className="inventory-form-group">
                  <label className="inventory-form-label">
                    Barcode
                    <button type="button" className="inventory-form-label-action" onClick={() => update({ barcode: generateBarcode() })}>
                      <Wand2 size={12} /> Generate
                    </button>
                  </label>
                  <div className="inventory-input-with-btn">
                    <input
                      className="inventory-form-input"
                      placeholder="Scan or enter barcode"
                      value={draft.barcode}
                      onChange={(e) => update({ barcode: e.target.value })}
                    />
                    <button
                      type="button"
                      className="inventory-icon-btn"
                      title="Scan barcode"
                      onClick={() => onOpenScanner((code) => update({ barcode: code }))}
                    >
                      <ScanLine size={16} />
                    </button>
                  </div>
                </div>

                <div className="inventory-form-group">
                  <label className="inventory-form-label">Category *</label>
                  <select className="inventory-form-select" value={draft.category} onChange={(e) => update({ category: e.target.value })}>
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="inventory-form-group inventory-form-group-full">
                  <label className="inventory-form-label">Description</label>
                  <textarea
                    className="inventory-form-textarea"
                    rows={3}
                    placeholder="Product description (optional)"
                    value={draft.description}
                    onChange={(e) => update({ description: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === "pricing" && (
            <div className="inventory-form-grid">
              <div className="inventory-form-group">
                <label className="inventory-form-label">Cost Price (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="inventory-form-input"
                  value={draft.cost || ""}
                  onChange={(e) => update({ cost: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="inventory-form-group">
                <label className="inventory-form-label">Retail Price (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="inventory-form-input"
                  value={draft.retailPrice || ""}
                  onChange={(e) => update({ retailPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="inventory-form-group">
                <label className="inventory-form-label">Wholesale Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="inventory-form-input"
                  placeholder="Optional bulk price"
                  value={draft.wholesalePrice || ""}
                  onChange={(e) => update({ wholesalePrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="inventory-form-group">
                <label className="inventory-form-label">Profit Margin</label>
                <div className="inventory-form-readonly-value">{margin.toFixed(1)}%</div>
              </div>
              <div className="inventory-form-group">
                <label className="inventory-form-label">HSN Code</label>
                <input className="inventory-form-input" placeholder="e.g. 2106" value={draft.hsnCode} onChange={(e) => update({ hsnCode: e.target.value })} />
              </div>
              <div className="inventory-form-group">
                <label className="inventory-form-label">GST Rate</label>
                <select className="inventory-form-select" value={draft.gstRate} onChange={(e) => update({ gstRate: parseFloat(e.target.value) })}>
                  {GST_RATES.map((r) => (
                    <option key={r} value={r}>
                      {r}%
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {activeTab === "stock" && (
            <div className="inventory-form-grid">
              <div className="inventory-form-group">
                <label className="inventory-form-label">Sell Unit *</label>
                <select className="inventory-form-select" value={draft.unit} onChange={(e) => update({ unit: e.target.value })}>
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <div className="inventory-form-group">
                <label className="inventory-form-label">Purchase Unit</label>
                <select className="inventory-form-select" value={draft.purchaseUnit} onChange={(e) => update({ purchaseUnit: e.target.value })}>
                  {PURCHASE_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div className="inventory-form-group inventory-form-group-full">
                <label className="inventory-form-label">Conversion Factor</label>
                <input
                  type="number"
                  min="1"
                  className="inventory-form-input"
                  value={draft.conversionFactor || ""}
                  onChange={(e) => update({ conversionFactor: parseInt(e.target.value) || 1 })}
                />
                <div className="inventory-conversion-summary">
                  <Repeat size={14} /> 1 {draft.purchaseUnit} = {draft.conversionFactor || 1} {draft.unit}
                </div>
              </div>

              {multiLocationEnabled ? (
                <div className="inventory-form-group inventory-form-group-full">
                  <label className="inventory-form-label">Current Stock</label>
                  <div className="inventory-conversion-summary">
                    <MapPin size={14} /> {totalStock} {draft.unit} total — set per-location amounts in the Locations tab
                  </div>
                </div>
              ) : (
                <div className="inventory-form-group">
                  <label className="inventory-form-label">Current Stock *</label>
                  <input
                    type="number"
                    min="0"
                    className="inventory-form-input"
                    value={draft.stock || ""}
                    onChange={(e) => update({ stock: parseInt(e.target.value) || 0 })}
                  />
                  {mode === "edit" && <span className="inventory-form-hint">Tip: use Adjust Stock from the table for a logged change</span>}
                </div>
              )}

              <div className="inventory-form-group">
                <label className="inventory-form-label">Minimum Stock Level</label>
                <input
                  type="number"
                  min="0"
                  className="inventory-form-input"
                  value={draft.minStock}
                  onChange={(e) => update({ minStock: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="inventory-form-group">
                <label className="inventory-form-label">Reorder Point</label>
                <input
                  type="number"
                  min="0"
                  className="inventory-form-input"
                  value={draft.reorderPoint}
                  onChange={(e) => update({ reorderPoint: parseInt(e.target.value) || 0 })}
                />
                <span className="inventory-form-hint">A draft Purchase Order is suggested once stock falls to this level</span>
              </div>
              <div className="inventory-form-group">
                <label className="inventory-form-label">Reorder Quantity</label>
                <input
                  type="number"
                  min="0"
                  className="inventory-form-input"
                  value={draft.reorderQty}
                  onChange={(e) => update({ reorderQty: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          )}

          {activeTab === "batches" && (
            <div className="inventory-repeat-section">
              {draft.batches.length === 0 && (
                <div className="inventory-repeat-empty">No batches added. Add a batch to track lot numbers and expiry dates.</div>
              )}
              {draft.batches.map((b) => {
                const d = b.expiryDate ? daysUntil(b.expiryDate) : null;
                return (
                  <div key={b.id} className="inventory-repeat-row">
                    <div>
                      <span className="inventory-mini-label">Batch / Lot No.</span>
                      <input className="inventory-form-input" value={b.batchNo} onChange={(e) => updateBatch(b.id, { batchNo: e.target.value })} placeholder="LOT-001" />
                    </div>
                    <div>
                      <span className="inventory-mini-label">Expiry Date</span>
                      <input type="date" className="inventory-form-input" value={b.expiryDate} onChange={(e) => updateBatch(b.id, { expiryDate: e.target.value })} />
                    </div>
                    <div>
                      <span className="inventory-mini-label">Quantity</span>
                      <input
                        type="number"
                        min="0"
                        className="inventory-form-input"
                        value={b.quantity || ""}
                        onChange={(e) => updateBatch(b.id, { quantity: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <button type="button" className="inventory-repeat-remove-btn" onClick={() => removeBatch(b.id)}>
                      <Trash2 size={16} />
                    </button>
                    {d !== null && (d < 0 || d <= NEAR_EXPIRY_DAYS) && (
                      <div style={{ gridColumn: "1 / -1" }}>
                        {d < 0 ? (
                          <span className="inventory-expiry-tag inventory-badge-expired">Expired {Math.abs(d)}d ago</span>
                        ) : (
                          <span className="inventory-expiry-tag inventory-badge-expiry">Expires in {d}d</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <button type="button" className="inventory-repeat-add-btn" onClick={addBatch}>
                <Plus size={16} /> Add Batch
              </button>
            </div>
          )}

          {activeTab === "supplier" && (
            <div className="inventory-form-grid">
              <div className="inventory-form-group inventory-form-group-full">
                <label className="inventory-form-label">Supplier / Vendor</label>
                <select className="inventory-form-select" value={draft.supplierId} onChange={(e) => update({ supplierId: e.target.value })}>
                  <option value="">No supplier linked</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="inventory-form-group inventory-form-group-full">
                <label className="inventory-form-label">Last Purchase Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="inventory-form-input"
                  placeholder="Price paid on the last purchase order"
                  value={draft.lastPurchasePrice || ""}
                  onChange={(e) => update({ lastPurchasePrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          )}

          {activeTab === "variants" && (
            <div className="inventory-repeat-section">
              {draft.variants.length === 0 && (
                <div className="inventory-repeat-empty">No variants yet. Add size/color variants under this parent SKU ({draft.sku || "auto-generated"}).</div>
              )}
              {draft.variants.map((v) => (
                <div key={v.id} className="inventory-repeat-row inventory-repeat-row-4">
                  <div>
                    <span className="inventory-mini-label">Size</span>
                    <input className="inventory-form-input" value={v.size} onChange={(e) => updateVariant(v.id, { size: e.target.value })} placeholder="M / L / 1kg" />
                  </div>
                  <div>
                    <span className="inventory-mini-label">Color</span>
                    <input className="inventory-form-input" value={v.color} onChange={(e) => updateVariant(v.id, { color: e.target.value })} placeholder="Red" />
                  </div>
                  <div>
                    <span className="inventory-mini-label">Stock</span>
                    <input
                      type="number"
                      min="0"
                      className="inventory-form-input"
                      value={v.stock || ""}
                      onChange={(e) => updateVariant(v.id, { stock: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <span className="inventory-mini-label">Price (₹)</span>
                    <input
                      type="number"
                      min="0"
                      className="inventory-form-input"
                      value={v.price || ""}
                      onChange={(e) => updateVariant(v.id, { price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <button type="button" className="inventory-repeat-remove-btn" onClick={() => removeVariant(v.id)}>
                    <Trash2 size={16} />
                  </button>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <span className="inventory-product-sku">{v.sku}</span>
                  </div>
                </div>
              ))}
              <button type="button" className="inventory-repeat-add-btn" onClick={addVariant}>
                <Plus size={16} /> Add Variant
              </button>
            </div>
          )}

          {activeTab === "locations" && multiLocationEnabled && (
            <div className="inventory-repeat-section">
              {locations.map((loc) => {
                const entry = draft.locations.find((l) => l.locationId === loc.id);
                return (
                  <div key={loc.id} className="inventory-repeat-row inventory-repeat-row-location">
                    <div className="inventory-toggle-label">{loc.name}</div>
                    <input
                      type="number"
                      min="0"
                      className="inventory-form-input"
                      value={entry?.stock ?? ""}
                      placeholder="0"
                      onChange={(e) => updateLocationStock(loc.id, loc.name, parseInt(e.target.value) || 0)}
                    />
                  </div>
                );
              })}
              <div className="inventory-conversion-summary">
                <MapPin size={14} /> Total stock across all locations: <strong>&nbsp;{totalStock}&nbsp;</strong> {draft.unit}
              </div>
            </div>
          )}
        </div>

        <div className="inventory-modal-footer">
          <button onClick={onClose} className="inventory-modal-cancel">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!isValid} className="inventory-modal-submit">
            {mode === "add" ? "Add Product" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===========================================================================
   STOCK ADJUSTMENT MODAL
=========================================================================== */

function StockAdjustModal({
  product,
  locations,
  multiLocationEnabled,
  onClose,
  onSubmit,
}: {
  product: Product;
  locations: { id: string; name: string }[];
  multiLocationEnabled: boolean;
  onClose: () => void;
  onSubmit: (data: { direction: "add" | "remove"; quantity: number; reason: AdjustmentReason; note: string; locationId?: string }) => void;
}) {
  const [direction, setDirection] = useState<"add" | "remove">("add");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState<AdjustmentReason>("manual_correction");
  const [note, setNote] = useState("");
  const [locationId, setLocationId] = useState(locations[0]?.id || "");

  const currentStock = multiLocationEnabled
    ? product.locations.find((l) => l.locationId === locationId)?.stock ?? 0
    : getTotalStock(product);

  const qtyNum = parseInt(quantity) || 0;
  const resulting = direction === "add" ? currentStock + qtyNum : currentStock - qtyNum;
  const isValid = qtyNum > 0 && resulting >= 0;

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit({ direction, quantity: qtyNum, reason, note, locationId: multiLocationEnabled ? locationId : undefined });
  };

  return (
    <div className="inventory-modal-overlay" onClick={onClose}>
      <div className="inventory-modal inventory-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="inventory-modal-header">
          <div>
            <h2 className="inventory-modal-title">
              <SlidersHorizontal size={18} /> Adjust Stock
            </h2>
            <p className="inventory-modal-subtitle">{product.name}</p>
          </div>
          <button onClick={onClose} className="inventory-modal-close">
            <X size={20} />
          </button>
        </div>

        <div className="inventory-modal-body">
          {multiLocationEnabled && (
            <div className="inventory-form-group" style={{ marginBottom: 14 }}>
              <label className="inventory-form-label">Location</label>
              <select className="inventory-form-select" value={locationId} onChange={(e) => setLocationId(e.target.value)}>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="inventory-adjust-current">
            <span className="inventory-adjust-current-label">Current Stock</span>
            <span className="inventory-adjust-current-value">
              {currentStock} {product.unit}
            </span>
          </div>

          <div className="inventory-adjust-direction">
            <button
              type="button"
              className={`inventory-adjust-direction-btn inventory-adjust-direction-btn-add ${direction === "add" ? "active" : ""}`}
              onClick={() => setDirection("add")}
            >
              <Plus size={14} /> Add Stock
            </button>
            <button
              type="button"
              className={`inventory-adjust-direction-btn inventory-adjust-direction-btn-remove ${direction === "remove" ? "active" : ""}`}
              onClick={() => setDirection("remove")}
            >
              <Minus size={14} /> Remove Stock
            </button>
          </div>

          <div className="inventory-form-grid">
            <div className="inventory-form-group">
              <label className="inventory-form-label">Quantity *</label>
              <input type="number" min="1" className="inventory-form-input" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" />
            </div>
            <div className="inventory-form-group">
              <label className="inventory-form-label">Reason *</label>
              <select className="inventory-form-select" value={reason} onChange={(e) => setReason(e.target.value as AdjustmentReason)}>
                {ADJUSTMENT_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="inventory-form-group inventory-form-group-full">
              <label className="inventory-form-label">Note</label>
              <textarea className="inventory-form-textarea" rows={2} placeholder="Optional details" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>

          {qtyNum > 0 && (
            <div className="inventory-adjust-preview">
              <span>Stock after adjustment</span>
              <span>{resulting < 0 ? "Not enough stock" : `${resulting} ${product.unit}`}</span>
            </div>
          )}
        </div>

        <div className="inventory-modal-footer">
          <button onClick={onClose} className="inventory-modal-cancel">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!isValid} className="inventory-modal-submit">
            Save Adjustment
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===========================================================================
   STOCK MOVEMENT HISTORY MODAL
=========================================================================== */

function StockHistoryModal({ product, movements, onClose }: { product: Product; movements: StockMovement[]; onClose: () => void }) {
  const productMovements = movements
    .filter((m) => m.productId === product.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="inventory-modal-overlay" onClick={onClose}>
      <div className="inventory-modal inventory-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="inventory-modal-header">
          <div>
            <h2 className="inventory-modal-title">
              <History size={18} /> Stock Movement History
            </h2>
            <p className="inventory-modal-subtitle">
              {product.name} · {product.sku}
            </p>
          </div>
          <button onClick={onClose} className="inventory-modal-close">
            <X size={20} />
          </button>
        </div>
        <div className="inventory-modal-body">
          {productMovements.length === 0 ? (
            <div className="inventory-empty-mini-section">No stock movements recorded yet for this product.</div>
          ) : (
            <div className="inventory-history-table-wrapper">
              <table className="inventory-history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Reason</th>
                    <th>Qty Change</th>
                    <th>Resulting Stock</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {productMovements.map((m) => (
                    <tr key={m.id}>
                      <td>{formatDateTime(m.date)}</td>
                      <td>
                        <span className={`inventory-history-type-badge history-type-${m.type}`}>{m.type}</span>
                      </td>
                      <td>{m.reason ? ADJUSTMENT_REASONS.find((r) => r.value === m.reason)?.label : "—"}</td>
                      <td className={m.quantityChange >= 0 ? "inventory-history-qty-pos" : "inventory-history-qty-neg"}>
                        {m.quantityChange >= 0 ? "+" : ""}
                        {m.quantityChange}
                      </td>
                      <td>{m.resultingStock}</td>
                      <td>{m.note || (m.locationName ? `Location: ${m.locationName}` : "—")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="inventory-modal-footer">
          <button onClick={onClose} className="inventory-modal-cancel">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===========================================================================
   BARCODE SCAN MODAL (camera via BarcodeDetector, with manual / keyboard-wedge fallback)
=========================================================================== */

function ScanModal({ onClose, onDetect }: { onClose: () => void; onDetect: (code: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [cameraSupported, setCameraSupported] = useState(true);
  const [status, setStatus] = useState("Starting camera…");
  const [manualCode, setManualCode] = useState("");

  useEffect(() => {
    let active = true;
    const hasDetector = typeof window !== "undefined" && "BarcodeDetector" in window;
    const hasCamera = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

    if (!hasDetector || !hasCamera) {
      setCameraSupported(false);
      setStatus("Camera scanning isn't supported on this device. Use a handheld scanner or enter the code below.");
      return;
    }

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus("Point the camera at a barcode");
        // @ts-ignore - BarcodeDetector is a browser API not always present in TS lib defs
        const detector = new window.BarcodeDetector({
          formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "qr_code"],
        });

        const loop = async () => {
          if (!active || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes && codes.length > 0 && active) {
              setStatus(`Detected ${codes[0].rawValue}`);
              onDetect(codes[0].rawValue);
              return;
            }
          } catch {
            // ignore single-frame detection errors and keep scanning
          }
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch {
        setCameraSupported(false);
        setStatus("Camera access was denied. Enter the code manually below.");
      }
    };

    start();

    return () => {
      active = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [onDetect]);

  const handleManualSubmit = () => {
    if (manualCode.trim()) onDetect(manualCode.trim());
  };

  return (
    <div className="inventory-modal-overlay" onClick={onClose}>
      <div className="inventory-modal inventory-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="inventory-modal-header">
          <div>
            <h2 className="inventory-modal-title">
              <Camera size={18} /> Scan Barcode
            </h2>
            <p className="inventory-modal-subtitle">Camera scan, or a keyboard-wedge handheld scanner</p>
          </div>
          <button onClick={onClose} className="inventory-modal-close">
            <X size={20} />
          </button>
        </div>
        <div className="inventory-modal-body">
          {cameraSupported ? (
            <div className="inventory-scan-video-wrapper">
              <video ref={videoRef} className="inventory-scan-video" muted playsInline />
              <div className="inventory-scan-frame" />
              <div className="inventory-scan-status">{status}</div>
            </div>
          ) : (
            <div className="inventory-scan-fallback">
              <Camera size={32} color="#94a3b8" />
              <p>{status}</p>
            </div>
          )}
          <span className="inventory-scan-manual-label">Or type / scan the code with a handheld scanner</span>
          <div className="inventory-input-with-btn">
            <input
              autoFocus
              className="inventory-form-input"
              placeholder="Barcode number"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleManualSubmit();
              }}
            />
            <button className="inventory-icon-btn" onClick={handleManualSubmit} title="Use this code">
              <CheckCheck size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===========================================================================
   PRINT BARCODE LABELS MODAL
=========================================================================== */

function PrintLabelsModal({ products, onClose }: { products: Product[]; onClose: () => void }) {
  const refs = useRef<Record<string, SVGSVGElement | null>>({});

  useEffect(() => {
    products.forEach((p) => {
      const el = refs.current[p.id];
      if (!el) return;
      try {
        JsBarcode(el, p.barcode || p.sku, {
          format: "CODE128",
          width: 1.6,
          height: 40,
          fontSize: 11,
          margin: 6,
          displayValue: true,
        });
      } catch {
        // barcode value has characters unsupported by CODE128 — label still shows name & price
      }
    });
  }, [products]);

  return (
    <div className="inventory-modal-overlay" onClick={onClose}>
      <div className="inventory-modal inventory-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="inventory-modal-header">
          <div>
            <h2 className="inventory-modal-title">
              <Tag size={18} /> Print Barcode Labels
            </h2>
            <p className="inventory-modal-subtitle">
              {products.length} label{products.length > 1 ? "s" : ""} ready to print
            </p>
          </div>
          <button onClick={onClose} className="inventory-modal-close">
            <X size={20} />
          </button>
        </div>
        <div className="inventory-modal-body">
          <div className="inventory-print-grid">
            {products.map((p) => (
              <div className="inventory-print-label-card" key={p.id}>
                <div className="inventory-print-label-name">{p.name}</div>
                <div className="inventory-print-label-price">₹{p.retailPrice}</div>
                <svg
                  className="inventory-print-label-svg"
                  ref={(el) => {
                    refs.current[p.id] = el;
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="inventory-modal-footer">
          <button onClick={onClose} className="inventory-modal-cancel">
            Close
          </button>
          <button onClick={() => window.print()} className="inventory-modal-submit">
            <Printer size={16} style={{ marginRight: 6, verticalAlign: "-3px" }} /> Print Labels
          </button>
        </div>
      </div>

      {/* Picked up by the @media print rules in inventory.css */}
      <div className="inventory-print-area">
        <div className="inventory-print-grid">
          {products.map((p) => (
            <div className="inventory-print-label-card" key={`print-${p.id}`}>
              <div className="inventory-print-label-name">{p.name}</div>
              <div className="inventory-print-label-price">₹{p.retailPrice}</div>
              <svg
                className="inventory-print-label-svg"
                ref={(el) => {
                  if (el) {
                    try {
                      JsBarcode(el, p.barcode || p.sku, { format: "CODE128", width: 1.6, height: 40, fontSize: 11, margin: 6, displayValue: true });
                    } catch {
                      // unsupported characters for CODE128
                    }
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===========================================================================
   BULK IMPORT MODAL (CSV)
=========================================================================== */

function ImportModal({ categories, onClose, onImport }: { categories: string[]; onClose: () => void; onImport: (products: Product[]) => void }) {
  const [rows, setRows] = useState<string[][] | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError("");
    setRows(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || "");
        const parsed = parseCSV(text).filter((r) => r.some((c) => c.trim() !== ""));
        if (parsed.length < 2) {
          setError("This file has no data rows.");
          return;
        }
        setRows(parsed);
        setFileName(file.name);
      } catch {
        setError("Couldn't read this file. Please upload a valid CSV exported from Excel or Sheets.");
      }
    };
    reader.readAsText(file);
  };

  const headerRow = (rows?.[0] || []).map((h) => h.trim().toLowerCase());
  const dataRows = rows?.slice(1) || [];

  const colIndex = (...names: string[]) => {
    for (const n of names) {
      const idx = headerRow.indexOf(n);
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const handleDownloadTemplate = () => {
    const headers = ["name", "sku", "barcode", "category", "hsnCode", "gstRate", "cost", "retailPrice", "wholesalePrice", "stock", "unit", "minStock"];
    const sample = ["Sample Product", "", "", categories[0] || "Other", "2106", "18", "50", "70", "65", "20", "pcs", "5"];
    downloadFile("inventory-import-template.csv", [headers.join(","), sample.join(",")].join("\n"));
  };

  const handleConfirmImport = () => {
    if (!rows) return;
    const nameIdx = colIndex("name", "product name", "product_name");
    if (nameIdx === -1) {
      setError('Your CSV needs a "name" column.');
      return;
    }

    const skuIdx = colIndex("sku");
    const barcodeIdx = colIndex("barcode");
    const categoryIdx = colIndex("category");
    const costIdx = colIndex("cost");
    const priceIdx = colIndex("retailprice", "price", "retail price");
    const wholesaleIdx = colIndex("wholesaleprice", "wholesale price");
    const stockIdx = colIndex("stock");
    const unitIdx = colIndex("unit");
    const minStockIdx = colIndex("minstock", "min stock");
    const hsnIdx = colIndex("hsncode", "hsn", "hsn code");
    const gstIdx = colIndex("gstrate", "gst", "gst rate", "gst%");

    const newProducts = dataRows
      .filter((r) => (r[nameIdx] || "").trim())
      .map((r) =>
        makeBlankProduct({
          name: r[nameIdx]?.trim() || "",
          sku: skuIdx !== -1 ? r[skuIdx]?.trim() : "",
          barcode: barcodeIdx !== -1 ? r[barcodeIdx]?.trim() : "",
          category: categoryIdx !== -1 ? r[categoryIdx]?.trim() || "Other" : "Other",
          cost: costIdx !== -1 ? parseFloat(r[costIdx]) || 0 : 0,
          retailPrice: priceIdx !== -1 ? parseFloat(r[priceIdx]) || 0 : 0,
          wholesalePrice: wholesaleIdx !== -1 ? parseFloat(r[wholesaleIdx]) || 0 : 0,
          stock: stockIdx !== -1 ? parseInt(r[stockIdx]) || 0 : 0,
          unit: unitIdx !== -1 ? r[unitIdx]?.trim() || "pcs" : "pcs",
          minStock: minStockIdx !== -1 ? parseInt(r[minStockIdx]) || 5 : 5,
          hsnCode: hsnIdx !== -1 ? r[hsnIdx]?.trim() || "" : "",
          gstRate: gstIdx !== -1 ? parseFloat(r[gstIdx]) || 0 : 0,
        })
      );

    if (newProducts.length === 0) {
      setError("No valid rows found to import.");
      return;
    }
    onImport(newProducts);
  };

  return (
    <div className="inventory-modal-overlay" onClick={onClose}>
      <div className="inventory-modal inventory-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="inventory-modal-header">
          <div>
            <h2 className="inventory-modal-title">
              <FileSpreadsheet size={18} /> Bulk Import Products
            </h2>
            <p className="inventory-modal-subtitle">Upload a CSV exported from Excel or Google Sheets</p>
          </div>
          <button onClick={onClose} className="inventory-modal-close">
            <X size={20} />
          </button>
        </div>
        <div className="inventory-modal-body">
          <div className="inventory-import-dropzone" onClick={() => fileInputRef.current?.click()}>
            <Upload size={28} color="#2563eb" />
            <p>
              <strong>Click to upload</strong> a .csv file
            </p>
            <p>
              Don&apos;t have one?{" "}
              <button
                type="button"
                className="inventory-import-template-link"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadTemplate();
                }}
              >
                Download a template
              </button>
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />

          {error && <div className="inventory-import-error">{error}</div>}

          {rows && (
            <div className="inventory-import-preview-wrapper">
              <div className="inventory-import-preview-header">
                <span>
                  {fileName} · {dataRows.length} row(s) detected
                </span>
                <CheckCircle2 size={16} />
              </div>
              <div className="inventory-import-preview-table-wrapper">
                <table className="inventory-import-preview-table">
                  <thead>
                    <tr>
                      {headerRow.map((h, i) => (
                        <th key={i}>{h || `col ${i + 1}`}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataRows.slice(0, 8).map((r, i) => (
                      <tr key={i}>
                        {r.map((c, j) => (
                          <td key={j}>{c}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <div className="inventory-modal-footer">
          <button onClick={onClose} className="inventory-modal-cancel">
            Cancel
          </button>
          <button onClick={handleConfirmImport} disabled={!rows} className="inventory-modal-submit">
            Import {dataRows.length > 0 ? `${dataRows.length} Products` : "Products"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===========================================================================
   REORDER / DRAFT PURCHASE ORDER MODAL
=========================================================================== */

function ReorderModal({
  products,
  suppliers,
  draftPOs,
  onClose,
  onGenerate,
  onMarkSent,
  onDeleteDraft,
}: {
  products: Product[];
  suppliers: Supplier[];
  draftPOs: PurchaseOrderDraft[];
  onClose: () => void;
  onGenerate: (supplierId: string, items: PODraftItem[]) => void;
  onMarkSent: (id: string) => void;
  onDeleteDraft: (id: string) => void;
}) {
  const reorderProducts = products.filter(needsReorder);

  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>();
    reorderProducts.forEach((p) => {
      const key = p.supplierId || "unassigned";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  return (
    <div className="inventory-modal-overlay" onClick={onClose}>
      <div className="inventory-modal inventory-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="inventory-modal-header">
          <div>
            <h2 className="inventory-modal-title">
              <ClipboardList size={18} /> Reorder & Draft Purchase Orders
            </h2>
            <p className="inventory-modal-subtitle">{reorderProducts.length} product(s) at or below reorder point</p>
          </div>
          <button onClick={onClose} className="inventory-modal-close">
            <X size={20} />
          </button>
        </div>
        <div className="inventory-modal-body">
          <p className="inventory-po-intro">
            Products are grouped by supplier. Generate a draft PO to suggest order quantities — review it before sending to your supplier.
          </p>

          {grouped.size === 0 ? (
            <div className="inventory-empty-mini-section">Nothing needs reordering right now.</div>
          ) : (
            Array.from(grouped.entries()).map(([supplierId, items]) => {
              const supplier = suppliers.find((s) => s.id === supplierId);
              return (
                <div className="inventory-po-group" key={supplierId}>
                  <div className="inventory-po-group-header">
                    <div>
                      <div className="inventory-po-supplier-name">{supplier ? supplier.name : "No supplier assigned"}</div>
                      {supplier && <div className="inventory-po-supplier-meta">{supplier.contact}</div>}
                    </div>
                    <button
                      className="inventory-po-generate-btn"
                      onClick={() =>
                        onGenerate(
                          supplierId,
                          items.map((p) => ({
                            productId: p.id,
                            productName: p.name,
                            quantity: p.reorderQty || Math.max(p.minStock * 2 - getTotalStock(p), p.minStock),
                            purchaseUnit: p.purchaseUnit,
                          }))
                        )
                      }
                    >
                      <Send size={14} /> Generate Draft PO
                    </button>
                  </div>
                  <div className="inventory-po-items">
                    {items.map((p) => (
                      <div className="inventory-po-item-row" key={p.id}>
                        <span className="inventory-po-item-name">{p.name}</span>
                        <span className="inventory-po-item-qty">
                          {getTotalStock(p)}/{p.reorderPoint || p.minStock} {p.unit} · suggest {p.reorderQty || p.minStock * 2} {p.purchaseUnit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}

          {draftPOs.length > 0 && (
            <>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "20px 0 12px" }}>Draft Purchase Orders</h4>
              {draftPOs.map((po) => (
                <div className="inventory-po-card" key={po.id}>
                  <div className="inventory-po-card-header">
                    <div>
                      <strong>{po.supplierName}</strong> <span className={`inventory-po-status inventory-po-status-${po.status}`}>{po.status}</span>
                    </div>
                    <div className="inventory-po-card-actions">
                      {po.status === "draft" && (
                        <button className="inventory-po-mark-sent-btn" onClick={() => onMarkSent(po.id)}>
                          Mark as Sent
                        </button>
                      )}
                      <button className="inventory-po-delete-btn" onClick={() => onDeleteDraft(po.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {po.items.map((it) => (
                    <div className="inventory-po-item-row" key={it.productId}>
                      <span className="inventory-po-item-name">{it.productName}</span>
                      <span className="inventory-po-item-qty">
                        {it.quantity} {it.purchaseUnit}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
        <div className="inventory-modal-footer">
          <button onClick={onClose} className="inventory-modal-cancel">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}