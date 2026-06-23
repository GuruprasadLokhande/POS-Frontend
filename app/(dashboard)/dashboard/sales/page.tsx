// SalesHistory.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  Download,
  Printer,
  Eye,
  RotateCcw,
  FileText,
  Users,
  CreditCard,
  Wallet,
  Smartphone,
  BookOpen,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Phone,
  Receipt,
  TrendingUp,
  BarChart3,
  PieChart,
  RefreshCw,
  FileDown,
  Mail,
  MessageCircle,
  MoreVertical,
  Copy,
  Share2,
  Edit,
  Trash2,
  DollarSign,
  CalendarDays,
  FilterX,
  Layers,
  ChevronLeft,
  ChevronRight,
  Package,
  Store,
  Building2,
} from "lucide-react";
import "./sales.css";

// --- Types ---
interface SaleItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  unit: string;
  total: number;
}

interface SaleRecord {
  id: string;
  invoiceNo: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  discountType: "flat" | "percent";
  tax: number;
  total: number;
  paymentMethod: "cash" | "upi" | "card" | "credit";
  paymentStatus: "paid" | "partial" | "pending";
  staffName: string;
  staffId: string;
  notes?: string;
  returnItems?: SaleItem[];
  returnDate?: string;
  returnAmount?: number;
  reconciled: boolean;
}

interface ReturnRecord {
  id: string;
  invoiceNo: string;
  date: string;
  customerName: string;
  items: SaleItem[];
  totalAmount: number;
  returnAmount: number;
  reason: string;
  status: "completed" | "pending" | "rejected";
  staffName: string;
}

interface StaffSales {
  staffId: string;
  staffName: string;
  totalSales: number;
  totalTransactions: number;
  averageTicket: number;
  topItems: { name: string; qty: number }[];
}

// --- Constants ---
const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", icon: <Wallet size={14} /> },
  { value: "upi", label: "UPI", icon: <Smartphone size={14} /> },
  { value: "card", label: "Card", icon: <CreditCard size={14} /> },
  { value: "credit", label: "Credit", icon: <BookOpen size={14} /> },
];

const STAFF_MEMBERS = [
  { id: "STAFF001", name: "Priya Sharma" },
  { id: "STAFF002", name: "Rahul Verma" },
  { id: "STAFF003", name: "Amit Kumar" },
  { id: "STAFF004", name: "Sneha Patel" },
];

// --- Mock Data ---
const generateMockSales = (): SaleRecord[] => {
  const now = new Date();
  const sales: SaleRecord[] = [];
  
  const items = [
    { name: "Tata Salt 1kg", price: 24, unit: "pcs" },
    { name: "Amul Butter 100g", price: 52, unit: "pcs" },
    { name: "Surf Excel 1kg", price: 190, unit: "pcs" },
    { name: "Aashirvaad Atta 5kg", price: 265, unit: "bag" },
    { name: "Fortune Oil 1L", price: 140, unit: "btl" },
    { name: "Parle-G Biscuit", price: 10, unit: "pcs" },
    { name: "Maggi 70g", price: 14, unit: "pcs" },
    { name: "Colgate 200g", price: 80, unit: "pcs" },
  ];

  for (let i = 0; i < 50; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    date.setHours(9 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));

    const numItems = 1 + Math.floor(Math.random() * 4);
    const saleItems: SaleItem[] = [];
    for (let j = 0; j < numItems; j++) {
      const item = items[Math.floor(Math.random() * items.length)];
      const qty = 1 + Math.floor(Math.random() * 3);
      saleItems.push({
        id: `item-${i}-${j}`,
        name: item.name,
        price: item.price,
        qty,
        unit: item.unit,
        total: item.price * qty,
      });
    }

    const subtotal = saleItems.reduce((sum, item) => sum + item.total, 0);
    const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 50) : 0;
    const tax = [0, 5, 12, 18][Math.floor(Math.random() * 4)];
    const total = subtotal - discount + (subtotal * tax) / 100;

    const staff = STAFF_MEMBERS[Math.floor(Math.random() * STAFF_MEMBERS.length)];
    const paymentMethods: ("cash" | "upi" | "card" | "credit")[] = ["cash", "upi", "card", "credit"];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

    sales.push({
      id: `sale-${i}`,
      invoiceNo: `INV-${String(10000 + i)}`,
      date: date.toISOString().split("T")[0],
      time: date.toTimeString().slice(0, 5),
      customerName: ["Ravi Kumar", "Sunita Sharma", "Amit Singh", "Priya Patel", "Rajesh Gupta", "Neha Reddy", "Vikram Singh", "Anjali Verma"][Math.floor(Math.random() * 8)],
      customerPhone: `+91 98${String(10000000 + Math.floor(Math.random() * 90000000))}`,
      items: saleItems,
      subtotal,
      discount,
      discountType: Math.random() > 0.5 ? "flat" : "percent",
      tax,
      total: Math.round(total * 100) / 100,
      paymentMethod,
      paymentStatus: Math.random() > 0.85 ? "partial" : "paid",
      staffName: staff.name,
      staffId: staff.id,
      notes: Math.random() > 0.9 ? "Special instruction: Pack carefully" : "",
      reconciled: Math.random() > 0.3,
    });
  }

  return sales.sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
};

const generateMockReturns = (sales: SaleRecord[]): ReturnRecord[] => {
  const returns: ReturnRecord[] = [];
  const reasons = ["Damaged item", "Wrong product", "Expired", "Customer changed mind", "Quality issue"];

  for (let i = 0; i < 8; i++) {
    const sale = sales[Math.floor(Math.random() * sales.length)];
    const returnItems = sale.items.slice(0, Math.floor(Math.random() * sale.items.length) + 1);
    const returnAmount = returnItems.reduce((sum, item) => sum + item.total, 0) * 0.8;

    returns.push({
      id: `return-${i}`,
      invoiceNo: sale.invoiceNo,
      date: new Date(new Date(sale.date).getTime() + 24 * 60 * 60 * 1000 * (1 + Math.floor(Math.random() * 5))).toISOString().split("T")[0],
      customerName: sale.customerName,
      items: returnItems,
      totalAmount: sale.total,
      returnAmount: Math.round(returnAmount * 100) / 100,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      status: ["completed", "completed", "completed", "pending", "completed"][Math.floor(Math.random() * 5)] as any,
      staffName: sale.staffName,
    });
  }

  return returns;
};

// --- Components ---

// Date Range Picker
function DateRangePicker({ 
  startDate, 
  endDate, 
  onStartChange, 
  onEndChange, 
  onApply,
  onClear,
}: {
  startDate: string;
  endDate: string;
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
  onApply: () => void;
  onClear: () => void;
}) {
  return (
    <div className="sale-date-range">
      <div className="sale-date-range-inputs">
        <div className="sale-date-range-field">
          <label className="sale-date-range-label">From Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartChange(e.target.value)}
            className="sale-date-range-input"
          />
        </div>
        <div className="sale-date-range-field">
          <label className="sale-date-range-label">To Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndChange(e.target.value)}
            className="sale-date-range-input"
          />
        </div>
      </div>
      <div className="sale-date-range-actions">
        <button onClick={onApply} className="sale-date-range-apply">
          Apply
        </button>
        <button onClick={onClear} className="sale-date-range-clear">
          Clear
        </button>
      </div>
    </div>
  );
}

// Invoice Detail Modal
function InvoiceDetailModal({
  sale,
  onClose,
  onPrint,
  onDownload,
  onReturn,
}: {
  sale: SaleRecord | null;
  onClose: () => void;
  onPrint: (sale: SaleRecord) => void;
  onDownload: (sale: SaleRecord) => void;
  onReturn: (sale: SaleRecord) => void;
}) {
  if (!sale) return null;

  const discountAmt = sale.discountType === "percent" 
    ? (sale.subtotal * sale.discount) / 100 
    : sale.discount;
  const taxAmt = ((sale.subtotal - discountAmt) * sale.tax) / 100;

  return (
    <div className="invoice-detail-overlay">
      <div className="invoice-detail-container">
        <div className="invoice-detail-header">
          <div className="invoice-detail-header-left">
            <h3 className="invoice-detail-title">
              <Receipt size={18} /> Invoice #{sale.invoiceNo}
            </h3>
            <span className={`invoice-detail-status invoice-detail-status-${sale.paymentStatus}`}>
              {sale.paymentStatus.toUpperCase()}
            </span>
          </div>
          <button onClick={onClose} className="invoice-detail-close">
            <X size={18} />
          </button>
        </div>

        <div className="invoice-detail-body">
          <div className="invoice-detail-info-grid">
            <div>
              <p className="invoice-detail-label">Date & Time</p>
              <p className="invoice-detail-value">{sale.date} {sale.time}</p>
            </div>
            <div>
              <p className="invoice-detail-label">Customer</p>
              <p className="invoice-detail-value">{sale.customerName}</p>
              <p className="invoice-detail-sub">{sale.customerPhone}</p>
            </div>
            <div>
              <p className="invoice-detail-label">Staff</p>
              <p className="invoice-detail-value">{sale.staffName}</p>
            </div>
            <div>
              <p className="invoice-detail-label">Payment</p>
              <p className="invoice-detail-value">{sale.paymentMethod.toUpperCase()}</p>
            </div>
          </div>

          <div className="invoice-detail-items">
            <table className="invoice-detail-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="invoice-detail-th-center">Qty</th>
                  <th className="invoice-detail-th-right">Rate</th>
                  <th className="invoice-detail-th-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td className="invoice-detail-td-center">{item.qty}</td>
                    <td className="invoice-detail-td-right">₹{item.price}</td>
                    <td className="invoice-detail-td-right">₹{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="invoice-detail-totals">
            <div className="invoice-detail-total-row">
              <span>Subtotal</span>
              <span>₹{sale.subtotal.toFixed(2)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="invoice-detail-total-row invoice-detail-discount">
                <span>Discount {sale.discountType === "percent" ? `(${sale.discount}%)` : ""}</span>
                <span>-₹{discountAmt.toFixed(2)}</span>
              </div>
            )}
            {sale.tax > 0 && (
              <div className="invoice-detail-total-row">
                <span>Tax ({sale.tax}%)</span>
                <span>+₹{taxAmt.toFixed(2)}</span>
              </div>
            )}
            <div className="invoice-detail-total-row invoice-detail-grand-total">
              <span>TOTAL</span>
              <span>₹{sale.total.toFixed(2)}</span>
            </div>
          </div>

          {sale.notes && (
            <div className="invoice-detail-notes">
              <p className="invoice-detail-label">Notes</p>
              <p className="invoice-detail-value">{sale.notes}</p>
            </div>
          )}
        </div>

        <div className="invoice-detail-actions">
          <button onClick={() => onPrint(sale)} className="invoice-detail-action-btn">
            <Printer size={16} /> Print
          </button>
          <button onClick={() => onDownload(sale)} className="invoice-detail-action-btn">
            <Download size={16} /> Download
          </button>
          <button onClick={() => onReturn(sale)} className="invoice-detail-action-btn invoice-detail-action-return">
            <RotateCcw size={16} /> Return
          </button>
        </div>
      </div>
    </div>
  );
}

// Z-Report Modal
function ZReportModal({
  sales,
  onClose,
  date,
}: {
  sales: SaleRecord[];
  onClose: () => void;
  date: string;
}) {
  const filteredSales = sales.filter(s => s.date === date && s.reconciled === false);
  
  const totalSales = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const totalTransactions = filteredSales.length;
  const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;
  
  const paymentBreakdown = filteredSales.reduce((acc, s) => {
    acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + s.total;
    return acc;
  }, {} as Record<string, number>);

  const topItems = filteredSales
    .flatMap(s => s.items)
    .reduce((acc, item) => {
      acc[item.name] = (acc[item.name] || 0) + item.qty;
      return acc;
    }, {} as Record<string, number>);

  const sortedItems = Object.entries(topItems)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = [
      "═══════════════════════════════════════",
      "           Z-REPORT — EOD SUMMARY",
      "═══════════════════════════════════════",
      `Date: ${date}`,
      `Generated: ${new Date().toLocaleString()}`,
      "───────────────────────────────────────",
      "",
      "SALES SUMMARY",
      `Total Sales: ₹${totalSales.toFixed(2)}`,
      `Transactions: ${totalTransactions}`,
      `Average Ticket: ₹${averageTicket.toFixed(2)}`,
      "",
      "PAYMENT BREAKDOWN",
      ...Object.entries(paymentBreakdown).map(([method, amount]) => 
        `  ${method.toUpperCase()}: ₹${amount.toFixed(2)}`
      ),
      "",
      "TOP SELLING ITEMS",
      ...sortedItems.map(([name, qty], i) => 
        `  ${i + 1}. ${name} — ${qty} units`
      ),
      "",
      "───────────────────────────────────────",
      "    End of Report",
      "═══════════════════════════════════════",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Z-Report-${date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="zreport-overlay">
      <div className="zreport-container">
        <div className="zreport-header">
          <h3 className="zreport-title">
            <FileText size={18} /> Z-Report — End of Day
          </h3>
          <button onClick={onClose} className="zreport-close">
            <X size={18} />
          </button>
        </div>

        <div className="zreport-body" id="zreport-content">
          <div className="zreport-shop">
            <h2 className="zreport-shop-name">BillEase POS</h2>
            <p className="zreport-shop-address">Sharma General Store · Mumbai</p>
            <p className="zreport-shop-gst">GST: 27AABCS1429B1ZB</p>
          </div>

          <div className="zreport-date">
            <span>Date: {date}</span>
            <span>Generated: {new Date().toLocaleString()}</span>
          </div>

          <div className="zreport-section">
            <h4 className="zreport-section-title">Sales Summary</h4>
            <div className="zreport-stats">
              <div className="zreport-stat">
                <span className="zreport-stat-label">Total Sales</span>
                <span className="zreport-stat-value">₹{totalSales.toFixed(2)}</span>
              </div>
              <div className="zreport-stat">
                <span className="zreport-stat-label">Transactions</span>
                <span className="zreport-stat-value">{totalTransactions}</span>
              </div>
              <div className="zreport-stat">
                <span className="zreport-stat-label">Average Ticket</span>
                <span className="zreport-stat-value">₹{averageTicket.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="zreport-section">
            <h4 className="zreport-section-title">Payment Breakdown</h4>
            <div className="zreport-payment-breakdown">
              {Object.entries(paymentBreakdown).map(([method, amount]) => (
                <div key={method} className="zreport-payment-item">
                  <span className="zreport-payment-label">{method.toUpperCase()}</span>
                  <div className="zreport-payment-bar-wrapper">
                    <div 
                      className="zreport-payment-bar" 
                      style={{ width: `${(amount / totalSales) * 100}%` }}
                    />
                  </div>
                  <span className="zreport-payment-amount">₹{amount.toFixed(2)}</span>
                  <span className="zreport-payment-percent">
                    {((amount / totalSales) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="zreport-section">
            <h4 className="zreport-section-title">Top Selling Items</h4>
            <div className="zreport-top-items">
              {sortedItems.map(([name, qty], i) => (
                <div key={name} className="zreport-top-item">
                  <span className="zreport-top-item-rank">#{i + 1}</span>
                  <span className="zreport-top-item-name">{name}</span>
                  <span className="zreport-top-item-qty">{qty} units</span>
                </div>
              ))}
              {sortedItems.length === 0 && (
                <p className="zreport-no-data">No items sold today</p>
              )}
            </div>
          </div>

          <div className="zreport-footer">
            <p>Thank you for using BillEase POS</p>
          </div>
        </div>

        <div className="zreport-actions">
          <button onClick={handlePrint} className="zreport-action-btn">
            <Printer size={16} /> Print
          </button>
          <button onClick={handleDownload} className="zreport-action-btn">
            <Download size={16} /> Download
          </button>
        </div>
      </div>
    </div>
  );
}

// Staff Sales Modal
function StaffSalesModal({
  staffSales,
  onClose,
}: {
  staffSales: StaffSales[];
  onClose: () => void;
}) {
  const totalSales = staffSales.reduce((sum, s) => sum + s.totalSales, 0);
  const totalTransactions = staffSales.reduce((sum, s) => sum + s.totalTransactions, 0);

  return (
    <div className="staff-sales-overlay">
      <div className="staff-sales-container">
        <div className="staff-sales-header">
          <h3 className="staff-sales-title">
            <Users size={18} /> Staff Sales Performance
          </h3>
          <button onClick={onClose} className="staff-sales-close">
            <X size={18} />
          </button>
        </div>

        <div className="staff-sales-body">
          <div className="staff-sales-stats">
            <div className="staff-sales-stat">
              <span className="staff-sales-stat-label">Total Sales</span>
              <span className="staff-sales-stat-value">₹{totalSales.toFixed(2)}</span>
            </div>
            <div className="staff-sales-stat">
              <span className="staff-sales-stat-label">Total Transactions</span>
              <span className="staff-sales-stat-value">{totalTransactions}</span>
            </div>
          </div>

          <div className="staff-sales-list">
            {staffSales.map((staff) => {
              const percentage = totalSales > 0 ? (staff.totalSales / totalSales) * 100 : 0;
              return (
                <div key={staff.staffId} className="staff-sales-item">
                  <div className="staff-sales-item-header">
                    <div className="staff-sales-item-info">
                      <div className="staff-sales-item-avatar">
                        {staff.staffName.charAt(0)}
                      </div>
                      <div>
                        <p className="staff-sales-item-name">{staff.staffName}</p>
                        <p className="staff-sales-item-id">ID: {staff.staffId}</p>
                      </div>
                    </div>
                    <div className="staff-sales-item-total">
                      <span className="staff-sales-item-amount">₹{staff.totalSales.toFixed(2)}</span>
                      <span className="staff-sales-item-percent">{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="staff-sales-bar-wrapper">
                    <div 
                      className="staff-sales-bar" 
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                  <div className="staff-sales-item-details">
                    <span>{staff.totalTransactions} transactions</span>
                    <span>Avg: ₹{staff.averageTicket.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Returns Log Modal
function ReturnsLogModal({
  returns,
  onClose,
}: {
  returns: ReturnRecord[];
  onClose: () => void;
}) {
  const [filter, setFilter] = useState<"all" | "completed" | "pending" | "rejected">("all");
  
  const filteredReturns = returns.filter(r => filter === "all" ? true : r.status === filter);
  const totalReturnAmount = filteredReturns.reduce((sum, r) => sum + r.returnAmount, 0);

  return (
    <div className="returns-log-overlay">
      <div className="returns-log-container">
        <div className="returns-log-header">
          <h3 className="returns-log-title">
            <RotateCcw size={18} /> Returns & Refunds Log
          </h3>
          <button onClick={onClose} className="returns-log-close">
            <X size={18} />
          </button>
        </div>

        <div className="returns-log-filters">
          <div className="returns-log-filter-group">
            {["all", "completed", "pending", "rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`returns-log-filter-btn ${
                  filter === status ? "returns-log-filter-btn-active" : ""
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <div className="returns-log-total">
            <span>Total Returns: ₹{totalReturnAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="returns-log-list">
          {filteredReturns.length === 0 ? (
            <div className="returns-log-empty">
              <RotateCcw size={32} />
              <p>No returns found</p>
            </div>
          ) : (
            filteredReturns.map((ret) => (
              <div key={ret.id} className="returns-log-item">
                <div className="returns-log-item-header">
                  <div>
                    <span className="returns-log-item-invoice">#{ret.invoiceNo}</span>
                    <span className="returns-log-item-date">{ret.date}</span>
                  </div>
                  <span className={`returns-log-item-status returns-log-item-status-${ret.status}`}>
                    {ret.status}
                  </span>
                </div>
                <div className="returns-log-item-body">
                  <p className="returns-log-item-customer">{ret.customerName}</p>
                  <p className="returns-log-item-reason">{ret.reason}</p>
                  <div className="returns-log-item-items">
                    {ret.items.map((item, i) => (
                      <span key={i} className="returns-log-item-tag">
                        {item.name} ×{item.qty}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="returns-log-item-footer">
                  <span>Staff: {ret.staffName}</span>
                  <span className="returns-log-item-amount">
                    -₹{ret.returnAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function SalesHistoryPage() {
  const router = useRouter();

  // State
  const [allSales, setAllSales] = useState<SaleRecord[]>([]);
  const [allReturns, setAllReturns] = useState<ReturnRecord[]>([]);
  const [filteredSales, setFilteredSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [staffFilter, setStaffFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null);
  const [showZReport, setShowZReport] = useState(false);
  const [showStaffSales, setShowStaffSales] = useState(false);
  const [showReturnsLog, setShowReturnsLog] = useState(false);
  const [zReportDate, setZReportDate] = useState(new Date().toISOString().split("T")[0]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const sales = generateMockSales();
      const returns = generateMockReturns(sales);
      setAllSales(sales);
      setAllReturns(returns);
      setFilteredSales(sales);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...allSales];

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        s =>
          s.invoiceNo.toLowerCase().includes(term) ||
          s.customerName.toLowerCase().includes(term) ||
          s.customerPhone.includes(term)
      );
    }

    // Date range
    if (dateRange.start) {
      filtered = filtered.filter(s => s.date >= dateRange.start);
    }
    if (dateRange.end) {
      filtered = filtered.filter(s => s.date <= dateRange.end);
    }

    // Payment method
    if (paymentFilter !== "all") {
      filtered = filtered.filter(s => s.paymentMethod === paymentFilter);
    }

    // Staff
    if (staffFilter !== "all") {
      filtered = filtered.filter(s => s.staffId === staffFilter);
    }

    // Status
    if (statusFilter !== "all") {
      filtered = filtered.filter(s => s.paymentStatus === statusFilter);
    }

    setFilteredSales(filtered);
    setCurrentPage(1);
  }, [allSales, searchTerm, dateRange, paymentFilter, staffFilter, statusFilter]);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setDateRange({ start: "", end: "" });
    setPaymentFilter("all");
    setStaffFilter("all");
    setStatusFilter("all");
  };

  // Pagination
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Actions
  const handleViewInvoice = (sale: SaleRecord) => {
    setSelectedSale(sale);
  };

  const handlePrintInvoice = (sale: SaleRecord) => {
    alert(`Printing invoice ${sale.invoiceNo}`);
  };

  const handleDownloadInvoice = (sale: SaleRecord) => {
    alert(`Downloading invoice ${sale.invoiceNo}`);
  };

  const handleReturnInvoice = (sale: SaleRecord) => {
    alert(`Processing return for ${sale.invoiceNo}`);
    setSelectedSale(null);
  };

  const handleSendWhatsApp = (sale: SaleRecord) => {
    const msg = `Invoice #${sale.invoiceNo}\nTotal: ₹${sale.total.toFixed(2)}\nThank you!`;
    const phone = sale.customerPhone.replace(/\D/g, "");
    const dest = phone.startsWith("91") ? phone : `91${phone}`;
    window.open(`https://wa.me/${dest}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const getStaffSales = (): StaffSales[] => {
    const staffMap = new Map<string, StaffSales>();
    
    allSales.forEach(sale => {
      if (!staffMap.has(sale.staffId)) {
        staffMap.set(sale.staffId, {
          staffId: sale.staffId,
          staffName: sale.staffName,
          totalSales: 0,
          totalTransactions: 0,
          averageTicket: 0,
          topItems: [],
        });
      }
      
      const staff = staffMap.get(sale.staffId)!;
      staff.totalSales += sale.total;
      staff.totalTransactions += 1;
      
      sale.items.forEach(item => {
        const existing = staff.topItems.find(t => t.name === item.name);
        if (existing) {
          existing.qty += item.qty;
        } else {
          staff.topItems.push({ name: item.name, qty: item.qty });
        }
      });
    });

    return Array.from(staffMap.values()).map(staff => ({
      ...staff,
      averageTicket: staff.totalTransactions > 0 
        ? staff.totalSales / staff.totalTransactions 
        : 0,
      topItems: staff.topItems.sort((a, b) => b.qty - a.qty).slice(0, 5),
    }));
  };

  const handleReconcile = () => {
    const today = new Date().toISOString().split("T")[0];
    const updatedSales = allSales.map(s => 
      s.date === today ? { ...s, reconciled: true } : s
    );
    setAllSales(updatedSales);
    alert("Day reconciled successfully!");
  };

  if (loading) {
    return (
      <div className="sale-history-loading">
        <RefreshCw size={32} className="sale-history-spinner" />
        <p>Loading sales data...</p>
      </div>
    );
  }

  return (
    <div className="sale-history-page">
      <div className="sale-history-container">
        {/* Header */}
        <div className="sale-history-header">
          <div className="sale-history-header-left">
            <button onClick={() => router.back()} className="sale-history-back-btn">
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="sale-history-title">Sales History</h1>
              <p className="sale-history-subtitle">
                {filteredSales.length} sales found · {allReturns.length} returns
              </p>
            </div>
          </div>
          <div className="sale-history-header-actions">
            <button 
              onClick={() => setShowZReport(true)} 
              className="sale-history-action-btn sale-history-action-zreport"
            >
              <FileText size={16} /> Z-Report
            </button>
            <button 
              onClick={() => setShowStaffSales(true)} 
              className="sale-history-action-btn sale-history-action-staff"
            >
              <Users size={16} /> Staff
            </button>
            <button 
              onClick={() => setShowReturnsLog(true)} 
              className="sale-history-action-btn sale-history-action-returns"
            >
              <RotateCcw size={16} /> Returns
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="sale-history-stats">
          <div className="sale-history-stat">
            <span className="sale-history-stat-icon">💰</span>
            <div>
              <p className="sale-history-stat-label">Total Revenue</p>
              <p className="sale-history-stat-value">
                ₹{filteredSales.reduce((sum, s) => sum + s.total, 0).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="sale-history-stat">
            <span className="sale-history-stat-icon">📊</span>
            <div>
              <p className="sale-history-stat-label">Transactions</p>
              <p className="sale-history-stat-value">{filteredSales.length}</p>
            </div>
          </div>
          <div className="sale-history-stat">
            <span className="sale-history-stat-icon">🎫</span>
            <div>
              <p className="sale-history-stat-label">Average Ticket</p>
              <p className="sale-history-stat-value">
                ₹{(filteredSales.reduce((sum, s) => sum + s.total, 0) / (filteredSales.length || 1)).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="sale-history-stat">
            <span className="sale-history-stat-icon">🔄</span>
            <div>
              <p className="sale-history-stat-label">Returns</p>
              <p className="sale-history-stat-value">
                ₹{allReturns.reduce((sum, r) => sum + r.returnAmount, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="sale-history-filters">
          <div className="sale-history-filters-row">
            <div className="sale-history-search">
              <Search size={16} className="sale-history-search-icon" />
              <input
                type="text"
                placeholder="Search invoice, customer, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="sale-history-search-input"
              />
              {searchTerm && (
                <button 
                  className="sale-history-search-clear"
                  onClick={() => setSearchTerm("")}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`sale-history-filter-toggle ${showFilters ? "sale-history-filter-toggle-active" : ""}`}
            >
              <Filter size={16} />
              <span className="sale-history-filter-toggle-label">Filters</span>
              <ChevronDown size={14} className={`sale-history-filter-toggle-chevron ${showFilters ? "sale-history-filter-toggle-chevron-open" : ""}`} />
            </button>
            {(searchTerm || dateRange.start || dateRange.end || paymentFilter !== "all" || staffFilter !== "all" || statusFilter !== "all") && (
              <button onClick={clearFilters} className="sale-history-clear-filters">
                <FilterX size={14} /> Clear
              </button>
            )}
          </div>

          {showFilters && (
            <div className="sale-history-filters-expanded">
              <DateRangePicker
                startDate={dateRange.start}
                endDate={dateRange.end}
                onStartChange={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                onEndChange={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                onApply={() => {}}
                onClear={() => setDateRange({ start: "", end: "" })}
              />

              <div className="sale-history-filter-group">
                <label className="sale-history-filter-label">Payment Method</label>
                <div className="sale-history-filter-options">
                  <button
                    onClick={() => setPaymentFilter("all")}
                    className={`sale-history-filter-option ${paymentFilter === "all" ? "sale-history-filter-option-active" : ""}`}
                  >
                    All
                  </button>
                  {PAYMENT_METHODS.map(({ value, label, icon }) => (
                    <button
                      key={value}
                      onClick={() => setPaymentFilter(value)}
                      className={`sale-history-filter-option ${paymentFilter === value ? "sale-history-filter-option-active" : ""}`}
                    >
                      {icon} {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sale-history-filter-group">
                <label className="sale-history-filter-label">Staff Member</label>
                <div className="sale-history-filter-options">
                  <button
                    onClick={() => setStaffFilter("all")}
                    className={`sale-history-filter-option ${staffFilter === "all" ? "sale-history-filter-option-active" : ""}`}
                  >
                    All
                  </button>
                  {STAFF_MEMBERS.map(({ id, name }) => (
                    <button
                      key={id}
                      onClick={() => setStaffFilter(id)}
                      className={`sale-history-filter-option ${staffFilter === id ? "sale-history-filter-option-active" : ""}`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sale-history-filter-group">
                <label className="sale-history-filter-label">Payment Status</label>
                <div className="sale-history-filter-options">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`sale-history-filter-option ${statusFilter === "all" ? "sale-history-filter-option-active" : ""}`}
                  >
                    All
                  </button>
                  {["paid", "partial", "pending"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`sale-history-filter-option ${statusFilter === status ? "sale-history-filter-option-active" : ""}`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sales Table */}
        <div className="sale-history-table-wrapper">
          <table className="sale-history-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Date & Time</th>
                <th>Customer</th>
                <th className="sale-history-th-center">Items</th>
                <th className="sale-history-th-right">Amount</th>
                <th className="sale-history-th-center">Payment</th>
                <th className="sale-history-th-center">Status</th>
                <th className="sale-history-th-center">Staff</th>
                <th className="sale-history-th-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="sale-history-empty">
                    <div className="sale-history-empty-content">
                      <Receipt size={32} />
                      <p>No sales found</p>
                      <p className="sale-history-empty-sub">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedSales.map((sale) => (
                  <tr key={sale.id} className="sale-history-row">
                    <td>
                      <span className="sale-history-invoice">{sale.invoiceNo}</span>
                    </td>
                    <td>
                      <div className="sale-history-date-time">
                        <span>{sale.date}</span>
                        <span className="sale-history-time">{sale.time}</span>
                      </div>
                    </td>
                    <td>
                      <div className="sale-history-customer">
                        <span className="sale-history-customer-name">{sale.customerName}</span>
                        <span className="sale-history-customer-phone">{sale.customerPhone}</span>
                      </div>
                    </td>
                    <td className="sale-history-td-center">
                      <span className="sale-history-items-count">
                        {sale.items.reduce((sum, i) => sum + i.qty, 0)}
                      </span>
                    </td>
                    <td className="sale-history-td-right">
                      <span className="sale-history-amount">₹{sale.total.toFixed(2)}</span>
                    </td>
                    <td className="sale-history-td-center">
                      <span className="sale-history-payment-method">
                        {sale.paymentMethod.toUpperCase()}
                      </span>
                    </td>
                    <td className="sale-history-td-center">
                      <span className={`sale-history-status sale-history-status-${sale.paymentStatus}`}>
                        {sale.paymentStatus.charAt(0).toUpperCase() + sale.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="sale-history-td-center">
                      <span className="sale-history-staff">{sale.staffName}</span>
                    </td>
                    <td className="sale-history-td-right">
                      <div className="sale-history-actions">
                        <button 
                          onClick={() => handleViewInvoice(sale)} 
                          className="sale-history-action-icon"
                          title="View"
                        >
                          <Eye size={15} />
                        </button>
                        <button 
                          onClick={() => handlePrintInvoice(sale)} 
                          className="sale-history-action-icon"
                          title="Print"
                        >
                          <Printer size={15} />
                        </button>
                        <button 
                          onClick={() => handleSendWhatsApp(sale)} 
                          className="sale-history-action-icon"
                          title="WhatsApp"
                        >
                          <MessageCircle size={15} />
                        </button>
                        <button className="sale-history-action-icon sale-history-action-more">
                          <MoreVertical size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="sale-history-pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="sale-history-pagination-btn"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="sale-history-pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="sale-history-pagination-btn"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Reconciliation */}
        <div className="sale-history-reconcile">
          <button onClick={handleReconcile} className="sale-history-reconcile-btn">
            <CheckCircle2 size={16} /> Mark Today's Sales as Reconciled
          </button>
        </div>
      </div>

      {/* Modals */}
      {selectedSale && (
        <InvoiceDetailModal
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
          onPrint={handlePrintInvoice}
          onDownload={handleDownloadInvoice}
          onReturn={handleReturnInvoice}
        />
      )}

      {showZReport && (
        <ZReportModal
          sales={allSales}
          date={zReportDate}
          onClose={() => setShowZReport(false)}
        />
      )}

      {showStaffSales && (
        <StaffSalesModal
          staffSales={getStaffSales()}
          onClose={() => setShowStaffSales(false)}
        />
      )}

      {showReturnsLog && (
        <ReturnsLogModal
          returns={allReturns}
          onClose={() => setShowReturnsLog(false)}
        />
      )}
    </div>
  );
}