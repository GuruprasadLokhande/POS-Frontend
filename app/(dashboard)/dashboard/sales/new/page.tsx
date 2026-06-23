// NewSale.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Search,
  User,
  Phone,
  Printer,
  Download,
  MessageCircle,
  CheckCircle2,
  X,
  ShoppingCart,
  Tag,
  IndianRupee,
  ArrowLeft,
  Receipt,
  Wallet,
  Smartphone,
  CreditCard,
  BookOpen,
  Percent,
  Barcode,
  Pause,
  Play,
  RefreshCw,
  Undo2,
  Gift,
  QrCode,
  Banknote,
  Split,
  Scan,
  Clock,
  Save,
  RotateCcw,
  CircleDollarSign,
} from "lucide-react";
import "./newsale.css";

// --- Types ---
interface SaleItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  qty: number;
  discount?: number;
  discountType?: DiscountType;
}

type PaymentMethod = "cash" | "upi" | "card" | "credit";
type DiscountType = "flat" | "percent";
type TaxType = "cgst_sgst" | "igst";

interface SplitPayment {
  method: PaymentMethod;
  amount: number;
}

interface HeldBill {
  id: string;
  items: SaleItem[];
  customerName: string;
  customerPhone: string;
  subtotal: number;
  discount: number;
  discountType: DiscountType;
  tax: number;
  total: number;
  heldAt: string;
}

// --- Constants ---
const INVENTORY = [
  { name: "Tata Salt 1kg", price: 24, unit: "pcs", barcode: "8901030780011" },
  { name: "Amul Butter 100g", price: 52, unit: "pcs", barcode: "8901030780020" },
  { name: "Surf Excel 1kg", price: 190, unit: "pcs", barcode: "8901030780030" },
  { name: "Aashirvaad Atta 5kg", price: 265, unit: "bag", barcode: "8901030780040" },
  { name: "Fortune Oil 1L", price: 140, unit: "btl", barcode: "8901030780050" },
  { name: "Parle-G Biscuit", price: 10, unit: "pcs", barcode: "8901030780060" },
  { name: "Maggi 70g", price: 14, unit: "pcs", barcode: "8901030780070" },
  { name: "Colgate 200g", price: 80, unit: "pcs", barcode: "8901030780080" },
  { name: "Lifebuoy Soap", price: 35, unit: "pcs", barcode: "8901030780090" },
  { name: "Horlicks 500g", price: 245, unit: "jar", barcode: "8901030780100" },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: "cash", label: "Cash", icon: <Wallet size={16} /> },
  { value: "upi", label: "UPI", icon: <Smartphone size={16} /> },
  { value: "card", label: "Card", icon: <CreditCard size={16} /> },
  { value: "credit", label: "Credit", icon: <BookOpen size={16} /> },
];

const TAX_RATES = [
  { label: "0%", value: "0" },
  { label: "5%", value: "5" },
  { label: "12%", value: "12" },
  { label: "18%", value: "18" },
  { label: "28%", value: "28" },
];

// --- Utility Functions ---
const generateInvoiceNo = () => `INV-${Date.now().toString().slice(-6)}`;
const generateBillId = () => `HLD-${Date.now().toString().slice(-6)}`;

// --- Barcode Scanner Hook ---
const useBarcodeScanner = (onScan: (barcode: string) => void) => {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && isScanning) {
        e.preventDefault();
        if (barcodeInput.length > 0) {
          onScan(barcodeInput);
          setBarcodeInput("");
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [barcodeInput, isScanning, onScan]);

  return { barcodeInput, setBarcodeInput, isScanning, setIsScanning, inputRef };
};

// --- Invoice Modal ---
function InvoiceModal({
  items,
  subtotal,
  discount,
  discountType,
  tax,
  total,
  customerName,
  customerPhone,
  paymentMethod,
  splitPayments,
  invoiceNo,
  onClose,
  onPrint,
  onWhatsApp,
  onDownload,
  onReturn,
}: {
  items: SaleItem[];
  subtotal: number;
  discount: number;
  discountType: DiscountType;
  tax: number;
  total: number;
  customerName: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
  splitPayments?: SplitPayment[];
  invoiceNo: string;
  onClose: () => void;
  onPrint: () => void;
  onWhatsApp: () => void;
  onDownload: () => void;
  onReturn: () => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);
  const discountAmt = discountType === "percent" ? (subtotal * discount) / 100 : discount;
  const taxAmt = ((subtotal - discountAmt) * tax) / 100;
  const [showReturn, setShowReturn] = useState(false);
  const [returnItems, setReturnItems] = useState<{ [key: string]: number }>({});

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank", "width=420,height=680");
    if (!win) return;
    win.document.write(`<html><head><title>Invoice #${invoiceNo}</title>
      <style>body{font-family:monospace;font-size:12px;padding:20px;max-width:380px;margin:0 auto}
      table{width:100%;border-collapse:collapse}td,th{padding:4px 2px}
      .right{text-align:right}.center{text-align:center}.bold{font-weight:bold}
      .border-b{border-bottom:1px dashed #ccc}hr{border:none;border-top:1px dashed #ccc;margin:8px 0}
      </style></head><body>${content}</body></html>`);
    win.document.close();
    win.print();
    win.close();
  };

  const handleWhatsApp = () => {
    const lines = items
      .map((i) => `• ${i.name} ×${i.qty} = ₹${(i.price * i.qty).toFixed(2)}`)
      .join("\n");
    const msg = [
      `🧾 *BillEase Invoice #${invoiceNo}*`,
      `📅 ${new Date().toLocaleDateString("en-IN")}`,
      ``,
      lines,
      ``,
      `Subtotal : ₹${subtotal.toFixed(2)}`,
      discountAmt > 0 ? `Discount : -₹${discountAmt.toFixed(2)}` : null,
      tax > 0 ? `Tax (${tax}%): +₹${taxAmt.toFixed(2)}` : null,
      `*Total   : ₹${total.toFixed(2)}*`,
      `Payment  : ${paymentMethod.toUpperCase()}`,
      splitPayments?.length ? `Split: ${splitPayments.map(p => `${p.method} ₹${p.amount}`).join(', ')}` : null,
      ``,
      `Thank you!`,
    ]
      .filter(Boolean)
      .join("\n");
    const phone = customerPhone.replace(/\D/g, "");
    const dest = phone ? (phone.startsWith("91") ? phone : `91${phone}`) : "";
    window.open(`https://wa.me/${dest}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleDownload = () => {
    const sep = "─".repeat(48);
    const lines = items
      .map(
        (i) =>
          `${i.name.padEnd(22)} ${i.qty} × ₹${i.price} = ₹${(i.price * i.qty).toFixed(2)}`
      )
      .join("\n");
    const body = [
      sep,
      "        BILLEASE POS — Sharma General Store",
      sep,
      `Invoice : #${invoiceNo}`,
      `Date    : ${new Date().toLocaleDateString("en-IN")}`,
      `Customer: ${customerName || "Walk-in"}`,
      customerPhone ? `Phone   : ${customerPhone}` : "",
      sep,
      lines,
      sep,
      `Subtotal : ₹${subtotal.toFixed(2)}`,
      discountAmt > 0 ? `Discount : -₹${discountAmt.toFixed(2)}` : "",
      tax > 0 ? `Tax      : +₹${taxAmt.toFixed(2)}` : "",
      `TOTAL    : ₹${total.toFixed(2)}`,
      `Payment  : ${paymentMethod.toUpperCase()}`,
      sep,
      "     Thank you for your business!",
      sep,
    ]
      .filter((l) => l !== "")
      .join("\n");

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/plain;charset=utf-8" }));
    a.download = `Invoice-${invoiceNo}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleReturn = () => {
    const itemsToReturn = items.filter((item) => returnItems[item.id] && returnItems[item.id] > 0);
    if (itemsToReturn.length === 0) return;
    // Here you would process the return
    alert(`Return processed for ${itemsToReturn.length} items`);
    setShowReturn(false);
    onReturn();
  };

  return (
    <div className="invoice-modal-overlay">
      <div className="invoice-modal-container">
        <div className="invoice-modal">
          <div className="invoice-modal-header">
            <div className="invoice-modal-header-left">
              <div className="invoice-modal-header-icon">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p className="invoice-modal-header-title">Sale Recorded!</p>
                <p className="invoice-modal-header-subtitle">Invoice #{invoiceNo}</p>
              </div>
            </div>
            <button onClick={onClose} className="invoice-modal-close-btn">
              <X size={13} />
            </button>
          </div>

          <div className="invoice-modal-scroll">
            <div ref={printRef} className="invoice-content">
              <div className="invoice-shop">
                <div className="invoice-shop-icon">
                  <Receipt size={22} />
                </div>
                <p className="invoice-shop-name">BillEase POS</p>
                <p className="invoice-shop-address">Sharma General Store · Mumbai</p>
                <p className="invoice-shop-gst">GST: 27AABCS1429B1ZB</p>
              </div>

              <div className="invoice-bill-to">
                <div>
                  <p className="invoice-bill-to-label">Bill To</p>
                  <p className="invoice-bill-to-name">{customerName || "Walk-in Customer"}</p>
                  {customerPhone && <p className="invoice-bill-to-phone">{customerPhone}</p>}
                </div>
                <div className="invoice-bill-to-right">
                  <p className="invoice-bill-to-label">Invoice</p>
                  <p className="invoice-bill-to-invoice">#{invoiceNo}</p>
                  <p className="invoice-bill-to-date">{new Date().toLocaleDateString("en-IN")}</p>
                </div>
              </div>

              <table className="invoice-items-table">
                <thead>
                  <tr>
                    <th className="invoice-items-th-left">Item</th>
                    <th className="invoice-items-th-center">Qty</th>
                    <th className="invoice-items-th-right">Rate</th>
                    <th className="invoice-items-th-right">Amt</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="invoice-items-td-name">{item.name}</td>
                      <td className="invoice-items-td-center">{item.qty}</td>
                      <td className="invoice-items-td-right">₹{item.price}</td>
                      <td className="invoice-items-td-amount">
                        ₹{(item.price * item.qty).toFixed(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {showReturn && (
                <div className="invoice-return-section">
                  <p className="invoice-return-title">Select items to return</p>
                  {items.map((item) => (
                    <div key={item.id} className="invoice-return-row">
                      <span>{item.name}</span>
                      <input
                        type="number"
                        min={0}
                        max={item.qty}
                        value={returnItems[item.id] || 0}
                        onChange={(e) =>
                          setReturnItems((prev) => ({
                            ...prev,
                            [item.id]: Math.min(parseInt(e.target.value) || 0, item.qty),
                          }))
                        }
                        className="sale-input"
                        style={{ width: "60px", padding: "4px 8px" }}
                      />
                    </div>
                  ))}
                  <button onClick={handleReturn} className="invoice-return-btn">
                    Process Return
                  </button>
                </div>
              )}

              <div className="invoice-totals">
                <div className="invoice-totals-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discountAmt > 0 && (
                  <div className="invoice-totals-discount">
                    <span>Discount {discountType === "percent" ? `(${discount}%)` : ""}</span>
                    <span>-₹{discountAmt.toFixed(2)}</span>
                  </div>
                )}
                {tax > 0 && (
                  <div className="invoice-totals-row">
                    <span>Tax ({tax}%)</span>
                    <span>+₹{taxAmt.toFixed(2)}</span>
                  </div>
                )}
                <div className="invoice-totals-total">
                  <span>TOTAL</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="invoice-totals-payment">
                  <span>Payment</span>
                  <span>
                    {splitPayments?.length
                      ? splitPayments.map((p) => `${p.method} ₹${p.amount}`).join(" + ")
                      : paymentMethod}
                  </span>
                </div>
              </div>

              <p className="invoice-footer">
                Thank you for shopping! · Powered by BillEase POS
              </p>
            </div>
          </div>

          <div className="invoice-actions">
            <div className="invoice-actions-grid">
              <button onClick={handlePrint} className="invoice-action-btn invoice-action-print">
                <Printer size={18} /> Print
              </button>
              <button onClick={handleDownload} className="invoice-action-btn invoice-action-download">
                <Download size={18} /> Download
              </button>
              <button onClick={handleWhatsApp} className="invoice-action-btn invoice-action-whatsapp">
                <MessageCircle size={18} /> WhatsApp
              </button>
            </div>
            <div className="invoice-actions-secondary">
              <button onClick={() => setShowReturn(!showReturn)} className="invoice-action-return-btn">
                <Undo2 size={16} /> Return
              </button>
              <button onClick={onClose} className="invoice-new-sale-btn">
                + New Sale
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function NewSalePage() {
  const router = useRouter();

  // State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [items, setItems] = useState<SaleItem[]>([]);
  const [itemSearch, setItemSearch] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("flat");
  const [tax, setTax] = useState("0");
  const [notes, setNotes] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceNo] = useState(generateInvoiceNo());
  const [heldBills, setHeldBills] = useState<HeldBill[]>([]);
  const [isHolding, setIsHolding] = useState(false);
  const [splitPayments, setSplitPayments] = useState<SplitPayment[]>([]);
  const [showSplitPayment, setShowSplitPayment] = useState(false);
  const [splitAmount, setSplitAmount] = useState("");
  const [splitMethod, setSplitMethod] = useState<PaymentMethod>("cash");
  const [showUPIQr, setShowUPIQr] = useState(false);
  const [appliedLoyalty, setAppliedLoyalty] = useState(0);
  const [loyaltyPoints, setLoyaltyPoints] = useState(50);
  const [taxType, setTaxType] = useState<TaxType>("cgst_sgst");
  const [taxAmounts, setTaxAmounts] = useState({ cgst: 0, sgst: 0, igst: 0 });

  // Barcode Scanner
  const { barcodeInput, setBarcodeInput, isScanning, setIsScanning, inputRef } = useBarcodeScanner(
    (barcode: string) => {
      const product = INVENTORY.find((p) => p.barcode === barcode);
      if (product) {
        addItem(product);
        setBarcodeInput("");
      } else {
        alert(`Product with barcode ${barcode} not found`);
      }
    }
  );

  // Computed values
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const discountNum = parseFloat(discount) || 0;
  const taxNum = parseFloat(tax) || 0;
  const discountAmt = discountType === "percent" ? (subtotal * discountNum) / 100 : discountNum;
  const taxableAmount = subtotal - discountAmt;
  const taxAmt = (taxableAmount * taxNum) / 100;

  // CGST/SGST split (50-50)
  const cgstAmt = taxType === "cgst_sgst" ? taxAmt / 2 : 0;
  const sgstAmt = taxType === "cgst_sgst" ? taxAmt / 2 : 0;
  const igstAmt = taxType === "igst" ? taxAmt : 0;

  const total = subtotal - discountAmt + taxAmt - appliedLoyalty;

  const suggestions = INVENTORY.filter(
    (s) => s.name.toLowerCase().includes(itemSearch.toLowerCase()) && itemSearch.length > 0
  );

  // --- Functions ---
  const addItem = (s: (typeof INVENTORY)[0]) => {
    setItems((prev) => {
      const ex = prev.find((i) => i.name === s.name);
      return ex
        ? prev.map((i) => (i.name === s.name ? { ...i, qty: i.qty + 1 } : i))
        : [...prev, { id: `${Date.now()}-${Math.random()}`, ...s, qty: 1 }];
    });
    setItemSearch("");
    setShowDrop(false);
  };

  const addManual = () => {
    if (!itemSearch.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        name: itemSearch.trim(),
        qty: 1,
        price: 0,
        unit: "pcs",
      },
    ]);
    setItemSearch("");
    setShowDrop(false);
  };

  const updateItem = (id: string, field: keyof SaleItem, val: string | number) =>
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, [field]: field === "qty" || field === "price" ? Number(val) : val } : i
      )
    );

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const resetSale = () => {
    setItems([]);
    setCustomerName("");
    setCustomerPhone("");
    setDiscount("");
    setTax("0");
    setNotes("");
    setShowInvoice(false);
    setSplitPayments([]);
    setAppliedLoyalty(0);
  };

  const holdBill = () => {
    if (items.length === 0) return;
    const newBill: HeldBill = {
      id: generateBillId(),
      items: [...items],
      customerName,
      customerPhone,
      subtotal,
      discount: discountNum,
      discountType,
      tax: taxNum,
      total,
      heldAt: new Date().toLocaleString(),
    };
    setHeldBills((prev) => [...prev, newBill]);
    resetSale();
    setIsHolding(false);
  };

  const resumeBill = (bill: HeldBill) => {
    setItems(bill.items);
    setCustomerName(bill.customerName);
    setCustomerPhone(bill.customerPhone);
    setDiscount(String(bill.discount));
    setDiscountType(bill.discountType);
    setTax(String(bill.tax));
    setHeldBills((prev) => prev.filter((b) => b.id !== bill.id));
  };

  const deleteHeldBill = (id: string) => {
    setHeldBills((prev) => prev.filter((b) => b.id !== id));
  };

  const addSplitPayment = () => {
    const amount = parseFloat(splitAmount);
    if (isNaN(amount) || amount <= 0 || amount > total - getSplitTotal()) return;
    setSplitPayments((prev) => [...prev, { method: splitMethod, amount }]);
    setSplitAmount("");
  };

  const getSplitTotal = () => {
    return splitPayments.reduce((sum, p) => sum + p.amount, 0);
  };

  const removeSplitPayment = (index: number) => {
    setSplitPayments((prev) => prev.filter((_, i) => i !== index));
  };

  const applyLoyaltyPoints = () => {
    const maxPoints = Math.floor(total / 10); // 1 point = ₹10
    if (loyaltyPoints > 0) {
      const pointsToUse = Math.min(loyaltyPoints, maxPoints);
      const discountAmount = pointsToUse * 1; // 1 point = ₹1
      setAppliedLoyalty(discountAmount);
      setLoyaltyPoints((prev) => prev - pointsToUse);
    }
  };

  const handleReturn = () => {
    // Return handled in invoice modal
  };

  const generateUPIQr = () => {
    setShowUPIQr(true);
    // In real app, generate QR code here
  };

  const handleRecordSale = () => {
    if (items.length === 0) return;

    // Check split payment
    if (showSplitPayment && getSplitTotal() < total) {
      alert(`Please add split payments totaling ₹${total.toFixed(2)}`);
      return;
    }

    setShowInvoice(true);
  };

  // --- Render ---
  return (
    <div className="sale-page">
      <div className="sale-page-container">
        {/* Header */}
        <div className="sale-header">
          <button onClick={() => router.back()} className="sale-back-btn">
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="sale-header-title">New Sale</h1>
            <p className="sale-header-subtitle">Add items and bill the customer</p>
          </div>
          <div className="sale-header-actions">
            <button
              onClick={() => setIsHolding(!isHolding)}
              className="sale-header-btn"
              title="Hold/Park Bill"
            >
              <Pause size={16} />
              <span className="sale-header-btn-label">Hold</span>
            </button>
            {heldBills.length > 0 && (
              <div className="sale-held-bills-indicator">
                <Clock size={14} />
                <span>{heldBills.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Held Bills */}
        {isHolding && (
          <div className="sale-held-bills">
            <div className="sale-held-bills-header">
              <span className="sale-held-bills-title">
                <Clock size={14} /> Parked Bills ({heldBills.length})
              </span>
              <button onClick={() => setIsHolding(false)} className="sale-held-bills-close">
                <X size={14} />
              </button>
            </div>
            {heldBills.length === 0 ? (
              <p className="sale-held-bills-empty">No parked bills</p>
            ) : (
              <div className="sale-held-bills-list">
                {heldBills.map((bill) => (
                  <div key={bill.id} className="sale-held-bill-item">
                    <div className="sale-held-bill-info">
                      <span className="sale-held-bill-id">{bill.id}</span>
                      <span className="sale-held-bill-customer">
                        {bill.customerName || "Walk-in"}
                      </span>
                      <span className="sale-held-bill-total">₹{bill.total.toFixed(2)}</span>
                      <span className="sale-held-bill-time">{bill.heldAt}</span>
                    </div>
                    <div className="sale-held-bill-actions">
                      <button onClick={() => resumeBill(bill)} className="sale-held-bill-resume">
                        <Play size={14} /> Resume
                      </button>
                      <button onClick={() => deleteHeldBill(bill.id)} className="sale-held-bill-delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main grid */}
        <div className="sale-grid">
          {/* LEFT COLUMN */}
          <div className="sale-left-col">
            {/* Customer Section */}
            <div className="sale-card">
              <p className="sale-card-title">
                <User size={14} /> Customer Details
                <span className="sale-card-title-optional">(optional)</span>
              </p>
              <div className="sale-customer-grid">
                <div className="sale-input-icon-wrapper">
                  <User size={14} className="sale-input-icon" />
                  <input
                    type="text"
                    placeholder="Customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="sale-input sale-input-pl-34"
                  />
                </div>
                <div className="sale-input-icon-wrapper">
                  <Phone size={14} className="sale-input-icon" />
                  <input
                    type="tel"
                    placeholder="Mobile number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="sale-input sale-input-pl-34"
                  />
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="sale-card sale-items-card">
              <p className="sale-card-title">
                <ShoppingCart size={14} /> Items
                {items.length > 0 && (
                  <span className="sale-item-count-badge">{items.length}</span>
                )}
              </p>

              {/* Barcode Scanner */}
              <div className="sale-barcode-section">
                <div className="sale-barcode-input-wrapper">
                  <Scan size={14} className="sale-barcode-icon" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Scan barcode..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onFocus={() => setIsScanning(true)}
                    onBlur={() => setIsScanning(false)}
                    className="sale-input sale-input-pl-34"
                  />
                </div>
                <button
                  onClick={() => setIsScanning(!isScanning)}
                  className={`sale-scan-btn ${isScanning ? "sale-scan-btn-active" : ""}`}
                >
                  {isScanning ? <CheckCircle2 size={14} /> : <Barcode size={14} />}
                </button>
              </div>

              {/* Search */}
              <div className="sale-search-wrapper">
                <Search size={14} className="sale-search-icon" />
                <input
                  type="text"
                  placeholder="Search item or type to add manually..."
                  value={itemSearch}
                  onChange={(e) => {
                    setItemSearch(e.target.value);
                    setShowDrop(true);
                  }}
                  onFocus={() => setShowDrop(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addManual();
                    if (e.key === "Escape") setShowDrop(false);
                  }}
                  className="sale-input sale-input-pl-34"
                />
                {showDrop && (suggestions.length > 0 || itemSearch.length > 1) && (
                  <div className="sale-dropdown">
                    {suggestions.map((s) => (
                      <button
                        key={s.name}
                        onMouseDown={() => addItem(s)}
                        className="sale-dropdown-item"
                      >
                        <span className="sale-dropdown-item-name">{s.name}</span>
                        <span className="sale-dropdown-item-price">₹{s.price}</span>
                      </button>
                    ))}
                    {itemSearch.trim() &&
                      !suggestions.find((s) => s.name.toLowerCase() === itemSearch.toLowerCase()) && (
                        <button onMouseDown={addManual} className="sale-dropdown-manual">
                          <Plus size={13} /> Add "{itemSearch}" manually
                        </button>
                      )}
                  </div>
                )}
              </div>

              {/* Quick Add Products */}
              <div className="sale-quick-add">
                <p className="sale-quick-add-title">Quick Add Products</p>
                <div className="sale-quick-add-grid">
                  {INVENTORY.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => addItem(s)}
                      className="sale-quick-add-btn"
                    >
                      <span className="sale-quick-add-btn-name">{s.name}</span>
                      <span className="sale-quick-add-btn-price">₹{s.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Items list */}
              {items.length === 0 ? (
                <div className="sale-empty-items">
                  <div className="sale-empty-items-icon">
                    <ShoppingCart size={24} />
                  </div>
                  <p className="sale-empty-items-title">No items added yet</p>
                  <p className="sale-empty-items-subtitle">Search above or click a product to add</p>
                </div>
              ) : (
                <div className="sale-items-list">
                  {items.map((item) => (
                    <div key={item.id} className="sale-item-row">
                      <div className="sale-item-info">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, "name", e.target.value)}
                          className="sale-item-name-input"
                        />
                        <p className="sale-item-unit">{item.unit}</p>
                      </div>
                      <div className="sale-item-qty">
                        <button
                          onClick={() => updateItem(item.id, "qty", Math.max(1, item.qty - 1))}
                          className="sale-qty-btn"
                        >
                          −
                        </button>
                        <span className="sale-qty-value">{item.qty}</span>
                        <button
                          onClick={() => updateItem(item.id, "qty", item.qty + 1)}
                          className="sale-qty-btn"
                        >
                          +
                        </button>
                      </div>
                      <div className="sale-item-price-wrapper">
                        <span className="sale-price-currency">₹</span>
                        <input
                          type="number"
                          min={0}
                          value={item.price}
                          onChange={(e) =>
                            updateItem(item.id, "price", parseFloat(e.target.value) || 0)
                          }
                          className="sale-item-price-input"
                        />
                      </div>
                      <p className="sale-item-total">₹{(item.price * item.qty).toFixed(0)}</p>
                      <button onClick={() => removeItem(item.id)} className="sale-item-delete">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="sale-card">
              <p className="sale-notes-title">Notes (optional)</p>
              <textarea
                placeholder="Special instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="sale-textarea"
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="sale-right-col">
            {/* Payment method */}
            <div className="sale-card">
              <p className="sale-card-title">
                <IndianRupee size={14} /> Payment Method
              </p>
              <div className="sale-payment-grid">
                {PAYMENT_METHODS.map(({ value, label, icon }) => {
                  const active = paymentMethod === value;
                  return (
                    <button
                      key={value}
                      onClick={() => setPaymentMethod(value)}
                      className={`sale-payment-btn ${active ? "sale-payment-btn-active" : ""}`}
                    >
                      {icon} {label}
                    </button>
                  );
                })}
              </div>

              {/* Split Payment Toggle */}
              <div className="sale-split-toggle">
                <button
                  onClick={() => setShowSplitPayment(!showSplitPayment)}
                  className={`sale-split-btn ${showSplitPayment ? "sale-split-btn-active" : ""}`}
                >
                  <Split size={14} /> Split Payment
                </button>
              </div>

              {/* Split Payment UI */}
              {showSplitPayment && (
                <div className="sale-split-payment">
                  <div className="sale-split-payment-row">
                    <select
                      value={splitMethod}
                      onChange={(e) => setSplitMethod(e.target.value as PaymentMethod)}
                      className="sale-input"
                      style={{ width: "auto", flex: 1 }}
                    >
                      {PAYMENT_METHODS.map(({ value, label }) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <div style={{ position: "relative", flex: 1 }}>
                      <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>₹</span>
                      <input
                        type="number"
                        placeholder="Amount"
                        value={splitAmount}
                        onChange={(e) => setSplitAmount(e.target.value)}
                        className="sale-input"
                        style={{ paddingLeft: 24 }}
                      />
                    </div>
                    <button onClick={addSplitPayment} className="sale-split-add-btn">
                      <Plus size={14} />
                    </button>
                  </div>
                  {splitPayments.length > 0 && (
                    <div className="sale-split-list">
                      {splitPayments.map((p, i) => (
                        <div key={i} className="sale-split-item">
                          <span>{p.method}</span>
                          <span>₹{p.amount.toFixed(2)}</span>
                          <button onClick={() => removeSplitPayment(i)} className="sale-split-remove">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      <div className="sale-split-total">
                        <span>Total Split</span>
                        <span>₹{getSplitTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* UPI QR */}
              <div className="sale-upi-qr">
                <button onClick={generateUPIQr} className="sale-upi-qr-btn">
                  <QrCode size={14} /> Generate UPI QR
                </button>
                {showUPIQr && (
                  <div className="sale-upi-qr-display">
                    <div className="sale-upi-qr-placeholder">
                      <QrCode size={48} />
                      <p>UPI QR Code</p>
                      <p className="sale-upi-qr-amount">₹{total.toFixed(2)}</p>
                    </div>
                    <button onClick={() => setShowUPIQr(false)} className="sale-upi-qr-close">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Discount & Tax */}
            <div className="sale-card">
              <p className="sale-card-title">
                <Tag size={14} /> Discount & Tax
              </p>
              <div className="sale-discount-tax">
                <div>
                  <p className="sale-section-label">Discount</p>
                  <div className="sale-discount-input-group">
                    <div className="sale-discount-input-wrapper">
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        className="sale-input sale-discount-input"
                      />
                      <span className="sale-discount-symbol">
                        {discountType === "percent" ? "%" : "₹"}
                      </span>
                    </div>
                    <button
                      onClick={() => setDiscountType((dt) => (dt === "flat" ? "percent" : "flat"))}
                      className="sale-discount-type-btn"
                    >
                      {discountType === "flat" ? "₹ Flat" : "% Off"}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="sale-section-label">GST / Tax Rate</p>
                  <div className="sale-tax-grid">
                    {TAX_RATES.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setTax(t.value)}
                        className={`sale-tax-btn ${tax === t.value ? "sale-tax-btn-active" : ""}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <div className="sale-tax-type">
                    <button
                      onClick={() => setTaxType("cgst_sgst")}
                      className={`sale-tax-type-btn ${taxType === "cgst_sgst" ? "sale-tax-type-btn-active" : ""}`}
                    >
                      CGST+SGST
                    </button>
                    <button
                      onClick={() => setTaxType("igst")}
                      className={`sale-tax-type-btn ${taxType === "igst" ? "sale-tax-type-btn-active" : ""}`}
                    >
                      IGST
                    </button>
                  </div>
                  {taxNum > 0 && taxType === "cgst_sgst" && (
                    <div className="sale-tax-breakdown">
                      <span>CGST: ₹{cgstAmt.toFixed(2)}</span>
                      <span>SGST: ₹{sgstAmt.toFixed(2)}</span>
                    </div>
                  )}
                  {taxNum > 0 && taxType === "igst" && (
                    <div className="sale-tax-breakdown">
                      <span>IGST: ₹{igstAmt.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Loyalty Points */}
              <div className="sale-loyalty">
                <button onClick={applyLoyaltyPoints} className="sale-loyalty-btn">
                  <Gift size={14} /> Apply Loyalty Points ({loyaltyPoints} pts)
                </button>
                {appliedLoyalty > 0 && (
                  <span className="sale-loyalty-applied">-₹{appliedLoyalty.toFixed(2)}</span>
                )}
              </div>
            </div>

            {/* Bill Summary */}
            <div className="sale-summary">
              <p className="sale-summary-title">Bill Summary</p>
              <div className="sale-summary-details">
                <div className="sale-summary-row">
                  <span>
                    Subtotal <span className="sale-summary-item-count">
                      ({items.length} item{items.length !== 1 ? "s" : ""})
                    </span>
                  </span>
                  <span className="sale-summary-value">₹{subtotal.toFixed(2)}</span>
                </div>
                {discountAmt > 0 && (
                  <div className="sale-summary-discount">
                    <span>Discount</span>
                    <span>-₹{discountAmt.toFixed(2)}</span>
                  </div>
                )}
                {taxNum > 0 && (
                  <div className="sale-summary-row">
                    <span>Tax ({taxNum}%)</span>
                    <span>+₹{taxAmt.toFixed(2)}</span>
                  </div>
                )}
                {appliedLoyalty > 0 && (
                  <div className="sale-summary-discount">
                    <span>Loyalty Points</span>
                    <span>-₹{appliedLoyalty.toFixed(2)}</span>
                  </div>
                )}
                <div className="sale-summary-total">
                  <span className="sale-summary-total-label">TOTAL</span>
                  <span className="sale-summary-total-value">₹{total.toFixed(2)}</span>
                </div>
                <div className="sale-summary-payment">
                  <span>Via</span>
                  <span className="sale-summary-payment-method">
                    {splitPayments.length
                      ? splitPayments.map((p) => p.method).join(" + ")
                      : paymentMethod}
                  </span>
                </div>
              </div>

              <div className="sale-summary-actions">
                <button
                  onClick={holdBill}
                  disabled={items.length === 0}
                  className={`sale-hold-btn ${items.length === 0 ? "sale-hold-btn-disabled" : ""}`}
                >
                  <Pause size={14} /> Hold Bill
                </button>
                <button
                  onClick={handleRecordSale}
                  disabled={items.length === 0}
                  className={`sale-record-btn ${items.length === 0 ? "sale-record-btn-disabled" : ""}`}
                >
                  {items.length === 0 ? "Add items to continue" : `Record Sale · ₹${total.toFixed(2)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showInvoice && (
        <InvoiceModal
          items={items}
          subtotal={subtotal}
          discount={discountNum}
          discountType={discountType}
          tax={taxNum}
          total={total}
          customerName={customerName}
          customerPhone={customerPhone}
          paymentMethod={paymentMethod}
          splitPayments={splitPayments}
          invoiceNo={invoiceNo}
          onClose={resetSale}
          onPrint={() => {}}
          onWhatsApp={() => {}}
          onDownload={() => {}}
          onReturn={handleReturn}
        />
      )}
    </div>
  );
}