// EmployeeManagement.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Plus,
  Filter,
  Users,
  User,
  UserPlus,
  UserCheck,
  UserX,
  Edit,
  Eye,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Award,
  TrendingUp,
  BarChart3,
  PieChart,
  RefreshCw,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  Settings,
  Shield,
  Key,
  Fingerprint,
  Smartphone,
  MessageCircle,
  Send,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Star,
  Target,
  DollarSign,
  CalendarDays,
  Building2,
  Store,
  BadgeCheck,
  Crown,
  UserCog,
  UsersRound,
  Clock8,
  Timer,
  Coffee,
  LogOut,
  LogIn,
  Activity,
  Gauge,
  Trophy,
  Medal,
  Flame,
  Zap,
  Repeat,
  Lock,
  Unlock,
  EyeOff,
  Eye as EyeIcon,
  FileText,
  Upload,
  Cloud,
  File,
  Image,
  CreditCard,
  GraduationCap,
  Home,
  BriefcaseBusiness,
  Stethoscope,
  Baby,
  Heart,
  ShieldCheck,
  Layers,
  Grid,
  List,
  SortAsc,
  SortDesc,
} from "lucide-react";
import "./employe.css";

// --- Types ---

interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  mobile: string;
  email: string;
  profilePhoto?: string;
  gender: "male" | "female" | "other";
  dateOfBirth: string;
  address: string;
  joiningDate: string;
  designation: string;
  role: "owner" | "manager" | "cashier" | "inventory" | "accountant" | "custom";
  branch: string;
  reportingManager: string;
  status: "active" | "inactive" | "suspended";
  
  // Login Credentials
  username: string;
  pin: string;
  passwordLastChanged: string;
  forcePasswordChange: boolean;
  
  // Attendance
  attendance: {
    present: number;
    absent: number;
    halfDay: number;
    lateEntry: number;
    lastAttendance: string;
  };
  
  // Performance
  performance: {
    todaySales: number;
    weeklySales: number;
    monthlySales: number;
    totalBills: number;
    averageBill: number;
    returnPercentage: number;
  };
  
  // Targets
  targets: {
    daily: number;
    weekly: number;
    monthly: number;
    dailyAchieved: number;
    weeklyAchieved: number;
    monthlyAchieved: number;
  };
  
  // Shift
  shift: "morning" | "afternoon" | "night" | "custom";
  shiftTiming: {
    start: string;
    end: string;
  };
  
  // Permissions
  permissions: {
    dashboard: { view: boolean; export: boolean };
    inventory: { view: boolean; add: boolean; edit: boolean; delete: boolean; stockAdjust: boolean };
    sales: { create: boolean; edit: boolean; cancel: boolean; return: boolean };
    customers: { view: boolean; add: boolean; edit: boolean };
    reports: { view: boolean; export: boolean };
    settings: { view: boolean; edit: boolean };
  };
  
  // Documents
  documents: {
    aadhaar?: string;
    pan?: string;
    drivingLicense?: string;
    joiningLetter?: string;
    agreements?: string[];
  };
  
  // Payroll
  salary: {
    basic: number;
    hra: number;
    allowance: number;
    bonus: number;
    deductions: number;
    total: number;
  };
  
  createdAt: string;
  updatedAt: string;
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: "present" | "absent" | "halfDay" | "late";
  breakStart?: string;
  breakEnd?: string;
  totalHours: number;
  overtime: number;
}

interface Shift {
  id: string;
  name: string;
  type: "morning" | "afternoon" | "night" | "custom";
  startTime: string;
  endTime: string;
  color: string;
}

interface AuditLog {
  id: string;
  employeeId: string;
  employeeName: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  device: string;
  ipAddress: string;
}

interface ActiveSession {
  id: string;
  employeeId: string;
  employeeName: string;
  device: string;
  browser: string;
  ipAddress: string;
  loginTime: string;
  lastActive: string;
}

type EmployeeFormData = {
  fullName: string;
  mobile: string;
  email: string;
  gender: Employee["gender"];
  dateOfBirth: string;
  address: string;
  joiningDate: string;
  designation: string;
  role: Employee["role"];
  branch: string;
  reportingManager: string;
  shift: Employee["shift"];
  shiftStart: string;
  shiftEnd: string;
  username: string;
  pin: string;
  forcePasswordChange: boolean;
  basicSalary: number;
  hra: number;
  allowance: number;
};

// --- Mock Data ---

const mockEmployees: Employee[] = [
  {
    id: "emp001",
    employeeId: "EMP001",
    fullName: "Priya Sharma",
    mobile: "+91 98765 43210",
    email: "priya.sharma@billease.com",
    gender: "female",
    dateOfBirth: "1990-05-15",
    address: "123, Andheri East, Mumbai - 400093",
    joiningDate: "2023-01-01",
    designation: "Store Manager",
    role: "manager",
    branch: "Mumbai - Andheri",
    reportingManager: "Rajesh Gupta (Owner)",
    status: "active",
    username: "priya.sharma",
    pin: "1234",
    passwordLastChanged: "2024-01-15",
    forcePasswordChange: false,
    attendance: {
      present: 22,
      absent: 1,
      halfDay: 0,
      lateEntry: 2,
      lastAttendance: "2024-01-30",
    },
    performance: {
      todaySales: 45000,
      weeklySales: 285000,
      monthlySales: 1120000,
      totalBills: 245,
      averageBill: 4571,
      returnPercentage: 2.5,
    },
    targets: {
      daily: 50000,
      weekly: 300000,
      monthly: 1200000,
      dailyAchieved: 90,
      weeklyAchieved: 95,
      monthlyAchieved: 93,
    },
    shift: "morning",
    shiftTiming: { start: "09:00", end: "18:00" },
    permissions: {
      dashboard: { view: true, export: true },
      inventory: { view: true, add: true, edit: true, delete: false, stockAdjust: true },
      sales: { create: true, edit: true, cancel: true, return: true },
      customers: { view: true, add: true, edit: true },
      reports: { view: true, export: true },
      settings: { view: true, edit: false },
    },
    documents: {
      aadhaar: "aadhaar_priya.pdf",
      pan: "pan_priya.pdf",
      drivingLicense: "dl_priya.pdf",
      joiningLetter: "joining_priya.pdf",
    },
    salary: {
      basic: 35000,
      hra: 14000,
      allowance: 5000,
      bonus: 2000,
      deductions: 1500,
      total: 54500,
    },
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2024-01-30T00:00:00Z",
  },
  {
    id: "emp002",
    employeeId: "EMP002",
    fullName: "Rahul Verma",
    mobile: "+91 87654 32109",
    email: "rahul.verma@billease.com",
    gender: "male",
    dateOfBirth: "1992-08-20",
    address: "456, Bandra West, Mumbai - 400050",
    joiningDate: "2023-03-15",
    designation: "Senior Cashier",
    role: "cashier",
    branch: "Mumbai - Bandra",
    reportingManager: "Priya Sharma",
    status: "active",
    username: "rahul.verma",
    pin: "5678",
    passwordLastChanged: "2024-01-10",
    forcePasswordChange: false,
    attendance: {
      present: 20,
      absent: 0,
      halfDay: 1,
      lateEntry: 3,
      lastAttendance: "2024-01-30",
    },
    performance: {
      todaySales: 32000,
      weeklySales: 195000,
      monthlySales: 780000,
      totalBills: 180,
      averageBill: 4333,
      returnPercentage: 1.8,
    },
    targets: {
      daily: 35000,
      weekly: 210000,
      monthly: 840000,
      dailyAchieved: 91,
      weeklyAchieved: 93,
      monthlyAchieved: 93,
    },
    shift: "afternoon",
    shiftTiming: { start: "13:00", end: "22:00" },
    permissions: {
      dashboard: { view: true, export: false },
      inventory: { view: true, add: false, edit: false, delete: false, stockAdjust: false },
      sales: { create: true, edit: false, cancel: false, return: false },
      customers: { view: true, add: true, edit: false },
      reports: { view: true, export: false },
      settings: { view: false, edit: false },
    },
    documents: {
      aadhaar: "aadhaar_rahul.pdf",
      pan: "pan_rahul.pdf",
      joiningLetter: "joining_rahul.pdf",
    },
    salary: {
      basic: 22000,
      hra: 8800,
      allowance: 3000,
      bonus: 1500,
      deductions: 1000,
      total: 34300,
    },
    createdAt: "2023-03-15T00:00:00Z",
    updatedAt: "2024-01-30T00:00:00Z",
  },
  {
    id: "emp003",
    employeeId: "EMP003",
    fullName: "Amit Kumar",
    mobile: "+91 76543 21098",
    email: "amit.kumar@billease.com",
    gender: "male",
    dateOfBirth: "1988-11-10",
    address: "789, Powai, Mumbai - 400076",
    joiningDate: "2023-02-01",
    designation: "Inventory Manager",
    role: "inventory",
    branch: "Mumbai - Powai",
    reportingManager: "Priya Sharma",
    status: "active",
    username: "amit.kumar",
    pin: "9012",
    passwordLastChanged: "2024-01-20",
    forcePasswordChange: false,
    attendance: {
      present: 23,
      absent: 0,
      halfDay: 0,
      lateEntry: 1,
      lastAttendance: "2024-01-30",
    },
    performance: {
      todaySales: 0,
      weeklySales: 0,
      monthlySales: 0,
      totalBills: 0,
      averageBill: 0,
      returnPercentage: 0,
    },
    targets: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      dailyAchieved: 0,
      weeklyAchieved: 0,
      monthlyAchieved: 0,
    },
    shift: "morning",
    shiftTiming: { start: "09:00", end: "18:00" },
    permissions: {
      dashboard: { view: true, export: false },
      inventory: { view: true, add: true, edit: true, delete: true, stockAdjust: true },
      sales: { create: false, edit: false, cancel: false, return: false },
      customers: { view: true, add: false, edit: false },
      reports: { view: true, export: true },
      settings: { view: false, edit: false },
    },
    documents: {
      aadhaar: "aadhaar_amit.pdf",
      pan: "pan_amit.pdf",
      drivingLicense: "dl_amit.pdf",
      joiningLetter: "joining_amit.pdf",
    },
    salary: {
      basic: 28000,
      hra: 11200,
      allowance: 4000,
      bonus: 1800,
      deductions: 1200,
      total: 43800,
    },
    createdAt: "2023-02-01T00:00:00Z",
    updatedAt: "2024-01-30T00:00:00Z",
  },
  {
    id: "emp004",
    employeeId: "EMP004",
    fullName: "Sneha Patel",
    mobile: "+91 65432 10987",
    email: "sneha.patel@billease.com",
    gender: "female",
    dateOfBirth: "1995-03-25",
    address: "321, Juhu, Mumbai - 400049",
    joiningDate: "2023-04-01",
    designation: "Junior Cashier",
    role: "cashier",
    branch: "Mumbai - Juhu",
    reportingManager: "Rahul Verma",
    status: "active",
    username: "sneha.patel",
    pin: "3456",
    passwordLastChanged: "2024-01-25",
    forcePasswordChange: true,
    attendance: {
      present: 18,
      absent: 2,
      halfDay: 1,
      lateEntry: 4,
      lastAttendance: "2024-01-29",
    },
    performance: {
      todaySales: 28000,
      weeklySales: 165000,
      monthlySales: 650000,
      totalBills: 150,
      averageBill: 4333,
      returnPercentage: 2.2,
    },
    targets: {
      daily: 30000,
      weekly: 180000,
      monthly: 720000,
      dailyAchieved: 93,
      weeklyAchieved: 92,
      monthlyAchieved: 90,
    },
    shift: "afternoon",
    shiftTiming: { start: "13:00", end: "22:00" },
    permissions: {
      dashboard: { view: true, export: false },
      inventory: { view: true, add: false, edit: false, delete: false, stockAdjust: false },
      sales: { create: true, edit: false, cancel: false, return: false },
      customers: { view: true, add: true, edit: false },
      reports: { view: false, export: false },
      settings: { view: false, edit: false },
    },
    documents: {
      aadhaar: "aadhaar_sneha.pdf",
      pan: "pan_sneha.pdf",
      joiningLetter: "joining_sneha.pdf",
    },
    salary: {
      basic: 18000,
      hra: 7200,
      allowance: 2000,
      bonus: 1000,
      deductions: 800,
      total: 27400,
    },
    createdAt: "2023-04-01T00:00:00Z",
    updatedAt: "2024-01-29T00:00:00Z",
  },
  {
    id: "emp005",
    employeeId: "EMP005",
    fullName: "Vikram Singh",
    mobile: "+91 54321 09876",
    email: "vikram.singh@billease.com",
    gender: "male",
    dateOfBirth: "1985-07-08",
    address: "654, Colaba, Mumbai - 400005",
    joiningDate: "2022-06-01",
    designation: "Accountant",
    role: "accountant",
    branch: "Mumbai - Colaba",
    reportingManager: "Rajesh Gupta (Owner)",
    status: "inactive",
    username: "vikram.singh",
    pin: "7890",
    passwordLastChanged: "2023-12-01",
    forcePasswordChange: false,
    attendance: {
      present: 0,
      absent: 0,
      halfDay: 0,
      lateEntry: 0,
      lastAttendance: "2023-12-15",
    },
    performance: {
      todaySales: 0,
      weeklySales: 0,
      monthlySales: 0,
      totalBills: 0,
      averageBill: 0,
      returnPercentage: 0,
    },
    targets: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      dailyAchieved: 0,
      weeklyAchieved: 0,
      monthlyAchieved: 0,
    },
    shift: "morning",
    shiftTiming: { start: "09:00", end: "18:00" },
    permissions: {
      dashboard: { view: true, export: true },
      inventory: { view: true, add: false, edit: false, delete: false, stockAdjust: false },
      sales: { create: false, edit: false, cancel: false, return: false },
      customers: { view: true, add: false, edit: false },
      reports: { view: true, export: true },
      settings: { view: true, edit: false },
    },
    documents: {
      aadhaar: "aadhaar_vikram.pdf",
      pan: "pan_vikram.pdf",
      joiningLetter: "joining_vikram.pdf",
    },
    salary: {
      basic: 30000,
      hra: 12000,
      allowance: 5000,
      bonus: 2000,
      deductions: 1500,
      total: 47500,
    },
    createdAt: "2022-06-01T00:00:00Z",
    updatedAt: "2023-12-15T00:00:00Z",
  },
];

const mockShifts: Shift[] = [
  { id: "shift1", name: "Morning Shift", type: "morning", startTime: "09:00", endTime: "18:00", color: "#22c55e" },
  { id: "shift2", name: "Afternoon Shift", type: "afternoon", startTime: "13:00", endTime: "22:00", color: "#eab308" },
  { id: "shift3", name: "Night Shift", type: "night", startTime: "22:00", endTime: "06:00", color: "#3b82f6" },
  { id: "shift4", name: "Custom Shift", type: "custom", startTime: "10:00", endTime: "19:00", color: "#8b5cf6" },
];

const mockAttendance: AttendanceRecord[] = [
  {
    id: "att1",
    employeeId: "EMP001",
    employeeName: "Priya Sharma",
    date: "2024-01-30",
    checkIn: "09:05",
    checkOut: "18:15",
    status: "present",
    breakStart: "13:00",
    breakEnd: "13:30",
    totalHours: 9.17,
    overtime: 0.17,
  },
  {
    id: "att2",
    employeeId: "EMP002",
    employeeName: "Rahul Verma",
    date: "2024-01-30",
    checkIn: "13:10",
    checkOut: "22:20",
    status: "late",
    breakStart: "17:00",
    breakEnd: "17:30",
    totalHours: 9.17,
    overtime: 0.17,
  },
  {
    id: "att3",
    employeeId: "EMP003",
    employeeName: "Amit Kumar",
    date: "2024-01-30",
    checkIn: "09:00",
    checkOut: "18:00",
    status: "present",
    breakStart: "13:00",
    breakEnd: "13:30",
    totalHours: 9.0,
    overtime: 0,
  },
];

const mockAuditLogs: AuditLog[] = [
  {
    id: "log1",
    employeeId: "EMP001",
    employeeName: "Priya Sharma",
    action: "Login",
    module: "System",
    details: "User logged in from Chrome browser",
    timestamp: "2024-01-30 09:00:00",
    device: "Chrome - Windows 11",
    ipAddress: "192.168.1.100",
  },
  {
    id: "log2",
    employeeId: "EMP001",
    employeeName: "Priya Sharma",
    action: "Sale Created",
    module: "Sales",
    details: "Invoice #INV-12345 created for ₹4,500",
    timestamp: "2024-01-30 09:30:00",
    device: "Chrome - Windows 11",
    ipAddress: "192.168.1.100",
  },
  {
    id: "log3",
    employeeId: "EMP002",
    employeeName: "Rahul Verma",
    action: "Stock Adjustment",
    module: "Inventory",
    details: "Adjusted stock for Tata Salt 1kg: -5 units",
    timestamp: "2024-01-30 14:15:00",
    device: "Firefox - Windows 10",
    ipAddress: "192.168.1.101",
  },
];

const mockSessions: ActiveSession[] = [
  {
    id: "sess1",
    employeeId: "EMP001",
    employeeName: "Priya Sharma",
    device: "Chrome - Windows 11",
    browser: "Chrome 120",
    ipAddress: "192.168.1.100",
    loginTime: "2024-01-30 09:00:00",
    lastActive: "2024-01-30 15:30:00",
  },
  {
    id: "sess2",
    employeeId: "EMP002",
    employeeName: "Rahul Verma",
    device: "Firefox - Windows 10",
    browser: "Firefox 115",
    ipAddress: "192.168.1.101",
    loginTime: "2024-01-30 13:00:00",
    lastActive: "2024-01-30 15:45:00",
  },
];

// --- Components ---

// Employee List Component
function EmployeeListComponent({
  employees,
  onView,
  onEdit,
  onToggleStatus,
}: {
  employees: Employee[];
  onView: (emp: Employee) => void;
  onEdit: (emp: Employee) => void;
  onToggleStatus: (emp: Employee) => void;
}) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [sortBy, setSortBy] = useState<"name" | "role" | "joiningDate">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const branches = Array.from(new Set(employees.map(e => e.branch)));
  const roles = Array.from(new Set(employees.map(e => e.role)));

  const filtered = employees.filter(emp => {
    const searchMatch = emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
                       emp.employeeId.toLowerCase().includes(search.toLowerCase()) ||
                       emp.mobile.includes(search);
    const roleMatch = roleFilter === "all" || emp.role === roleFilter;
    const branchMatch = branchFilter === "all" || emp.branch === branchFilter;
    const statusMatch = statusFilter === "all" || emp.status === statusFilter;
    return searchMatch && roleMatch && branchMatch && statusMatch;
  });

  const sorted = [...filtered].sort((a, b) => {
    let compare = 0;
    if (sortBy === "name") compare = a.fullName.localeCompare(b.fullName);
    else if (sortBy === "role") compare = a.role.localeCompare(b.role);
    else if (sortBy === "joiningDate") compare = a.joiningDate.localeCompare(b.joiningDate);
    return sortOrder === "asc" ? compare : -compare;
  });

  const getRoleBadgeClass = (role: string) => {
    const classes = {
      owner: "role-badge-owner",
      manager: "role-badge-manager",
      cashier: "role-badge-cashier",
      inventory: "role-badge-inventory",
      accountant: "role-badge-accountant",
      custom: "role-badge-custom",
    };
    return classes[role as keyof typeof classes] || "role-badge-custom";
  };

  const getStatusBadgeClass = (status: string) => {
    const classes = {
      active: "status-badge-active",
      inactive: "status-badge-inactive",
      suspended: "status-badge-suspended",
    };
    return classes[status as keyof typeof classes] || "status-badge-inactive";
  };

  return (
    <div className="employee-list-container">
      {/* Filters */}
      <div className="employee-list-filters">
        <div className="employee-search-wrapper">
          <Search size={16} className="employee-search-icon" />
          <input
            type="text"
            placeholder="Search by name, ID, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="employee-search-input"
          />
          {search && (
            <button className="employee-search-clear" onClick={() => setSearch("")}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="employee-filter-controls">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="employee-filter-select"
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
            ))}
          </select>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="employee-filter-select"
          >
            <option value="all">All Branches</option>
            {branches.map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="employee-filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          <div className="employee-view-toggle">
            <button
              onClick={() => setViewMode("grid")}
              className={`employee-view-btn ${viewMode === "grid" ? "active" : ""}`}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`employee-view-btn ${viewMode === "list" ? "active" : ""}`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="employee-results-count">
        <span>{sorted.length} employee{sorted.length !== 1 ? "s" : ""}</span>
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="employee-sort-toggle"
        >
          {sortOrder === "asc" ? <SortAsc size={14} /> : <SortDesc size={14} />}
          Sort by {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
        </button>
      </div>

      {/* Grid/List View */}
      {viewMode === "grid" ? (
        <div className="employee-grid">
          {sorted.map(emp => (
            <div key={emp.id} className="employee-grid-card">
              <div className="employee-grid-avatar">
                {emp.profilePhoto ? (
                  <img src={emp.profilePhoto} alt={emp.fullName} />
                ) : (
                  <span>{emp.fullName.charAt(0)}</span>
                )}
                <span className={`employee-grid-status ${getStatusBadgeClass(emp.status)}`} />
              </div>
              <div className="employee-grid-info">
                <h4 className="employee-grid-name">{emp.fullName}</h4>
                <p className="employee-grid-id">{emp.employeeId}</p>
                <span className={`employee-grid-role ${getRoleBadgeClass(emp.role)}`}>
                  {emp.role.charAt(0).toUpperCase() + emp.role.slice(1)}
                </span>
              </div>
              <div className="employee-grid-details">
                <p><Phone size={12} /> {emp.mobile}</p>
                <p><Mail size={12} /> {emp.email}</p>
                <p><Building2 size={12} /> {emp.branch}</p>
              </div>
              <div className="employee-grid-actions">
                <button onClick={() => onView(emp)} className="employee-grid-action-btn view">
                  <Eye size={14} />
                </button>
                <button onClick={() => onEdit(emp)} className="employee-grid-action-btn edit">
                  <Edit size={14} />
                </button>
                <button onClick={() => onToggleStatus(emp)} className={`employee-grid-action-btn ${emp.status === "active" ? "disable" : "enable"}`}>
                  {emp.status === "active" ? <UserX size={14} /> : <UserCheck size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="employee-table-wrapper">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>ID</th>
                <th>Role</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Performance</th>
                <th className="employee-table-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div className="employee-table-name">
                      <div className="employee-table-avatar">
                        {emp.profilePhoto ? (
                          <img src={emp.profilePhoto} alt={emp.fullName} />
                        ) : (
                          <span>{emp.fullName.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <div className="employee-table-fullname">{emp.fullName}</div>
                        <div className="employee-table-email">{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="employee-table-id">{emp.employeeId}</span></td>
                  <td><span className={`employee-table-role ${getRoleBadgeClass(emp.role)}`}>
                    {emp.role.charAt(0).toUpperCase() + emp.role.slice(1)}
                  </span></td>
                  <td>{emp.branch}</td>
                  <td><span className={`employee-table-status ${getStatusBadgeClass(emp.status)}`}>
                    {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                  </span></td>
                  <td>
                    {emp.role !== "inventory" && emp.role !== "accountant" ? (
                      <div className="employee-table-performance">
                        <span className="performance-today">₹{emp.performance.todaySales.toLocaleString()}</span>
                        <span className="performance-target">{emp.targets.dailyAchieved}%</span>
                      </div>
                    ) : (
                      <span className="employee-table-na">N/A</span>
                    )}
                  </td>
                  <td className="employee-table-actions">
                    <button onClick={() => onView(emp)} className="employee-table-action-btn" title="View">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => onEdit(emp)} className="employee-table-action-btn" title="Edit">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => onToggleStatus(emp)} className="employee-table-action-btn" title={emp.status === "active" ? "Disable" : "Enable"}>
                      {emp.status === "active" ? <UserX size={14} /> : <UserCheck size={14} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sorted.length === 0 && (
        <div className="employee-empty-state">
          <Users size={48} />
          <p>No employees found</p>
          <span>Try adjusting your filters</span>
        </div>
      )}
    </div>
  );
}

// Employee Profile Modal
function EmployeeProfileModal({
  employee,
  onClose,
  onEdit,
}: {
  employee: Employee | null;
  onClose: () => void;
  onEdit: (emp: Employee) => void;
}) {
  if (!employee) return null;

  const [activeTab, setActiveTab] = useState<"profile" | "attendance" | "performance" | "permissions" | "documents" | "payroll">("profile");

  const getRoleBadgeClass = (role: string) => {
    const classes = {
      owner: "role-badge-owner",
      manager: "role-badge-manager",
      cashier: "role-badge-cashier",
      inventory: "role-badge-inventory",
      accountant: "role-badge-accountant",
      custom: "role-badge-custom",
    };
    return classes[role as keyof typeof classes] || "role-badge-custom";
  };

  return (
    <div className="employee-profile-overlay">
      <div className="employee-profile-container">
        {/* Header */}
        <div className="employee-profile-header">
          <div className="employee-profile-header-left">
            <div className="employee-profile-avatar-large">
              {employee.profilePhoto ? (
                <img src={employee.profilePhoto} alt={employee.fullName} />
              ) : (
                <span>{employee.fullName.charAt(0)}</span>
              )}
            </div>
            <div>
              <h2 className="employee-profile-name">{employee.fullName}</h2>
              <p className="employee-profile-id">{employee.employeeId}</p>
              <div className="employee-profile-badges">
                <span className={`employee-profile-role ${getRoleBadgeClass(employee.role)}`}>
                  {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                </span>
                <span className={`employee-profile-status ${employee.status === "active" ? "status-active" : "status-inactive"}`}>
                  {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
          <div className="employee-profile-header-actions">
            <button onClick={() => onEdit(employee)} className="employee-profile-edit-btn">
              <Edit size={16} /> Edit
            </button>
            <button onClick={onClose} className="employee-profile-close-btn">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="employee-profile-tabs">
          {["profile", "attendance", "performance", "permissions", "documents", "payroll"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`employee-profile-tab ${activeTab === tab ? "active" : ""}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="employee-profile-content">
          {activeTab === "profile" && (
            <div className="employee-profile-section">
              <div className="employee-profile-grid">
                <div className="employee-profile-field">
                  <label>Full Name</label>
                  <p>{employee.fullName}</p>
                </div>
                <div className="employee-profile-field">
                  <label>Employee ID</label>
                  <p>{employee.employeeId}</p>
                </div>
                <div className="employee-profile-field">
                  <label>Mobile Number</label>
                  <p>{employee.mobile}</p>
                </div>
                <div className="employee-profile-field">
                  <label>Email</label>
                  <p>{employee.email}</p>
                </div>
                <div className="employee-profile-field">
                  <label>Gender</label>
                  <p>{employee.gender.charAt(0).toUpperCase() + employee.gender.slice(1)}</p>
                </div>
                <div className="employee-profile-field">
                  <label>Date of Birth</label>
                  <p>{new Date(employee.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div className="employee-profile-field">
                  <label>Address</label>
                  <p>{employee.address}</p>
                </div>
                <div className="employee-profile-field">
                  <label>Joining Date</label>
                  <p>{new Date(employee.joiningDate).toLocaleDateString()}</p>
                </div>
                <div className="employee-profile-field">
                  <label>Designation</label>
                  <p>{employee.designation}</p>
                </div>
                <div className="employee-profile-field">
                  <label>Branch</label>
                  <p>{employee.branch}</p>
                </div>
                <div className="employee-profile-field">
                  <label>Reporting Manager</label>
                  <p>{employee.reportingManager}</p>
                </div>
                <div className="employee-profile-field">
                  <label>Shift</label>
                  <p>{employee.shift.charAt(0).toUpperCase() + employee.shift.slice(1)} ({employee.shiftTiming.start} - {employee.shiftTiming.end})</p>
                </div>
              </div>

              <div className="employee-profile-credentials">
                <h4>Login Credentials</h4>
                <div className="employee-profile-cred-grid">
                  <div>
                    <label>Username</label>
                    <p>{employee.username}</p>
                  </div>
                  <div>
                    <label>PIN</label>
                    <p>••••</p>
                  </div>
                  <div>
                    <label>Password Last Changed</label>
                    <p>{new Date(employee.passwordLastChanged).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label>Force Password Change</label>
                    <p>{employee.forcePasswordChange ? "Yes" : "No"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="employee-profile-section">
              <div className="employee-attendance-stats">
                <div className="employee-attendance-stat">
                  <span className="stat-label">Present</span>
                  <span className="stat-value present">{employee.attendance.present}</span>
                </div>
                <div className="employee-attendance-stat">
                  <span className="stat-label">Absent</span>
                  <span className="stat-value absent">{employee.attendance.absent}</span>
                </div>
                <div className="employee-attendance-stat">
                  <span className="stat-label">Half Day</span>
                  <span className="stat-value halfday">{employee.attendance.halfDay}</span>
                </div>
                <div className="employee-attendance-stat">
                  <span className="stat-label">Late Entry</span>
                  <span className="stat-value late">{employee.attendance.lateEntry}</span>
                </div>
              </div>

              <div className="employee-attendance-table-wrapper">
                <table className="employee-attendance-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Status</th>
                      <th>Total Hours</th>
                      <th>Overtime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockAttendance.filter(a => a.employeeId === employee.employeeId).map(att => (
                      <tr key={att.id}>
                        <td>{att.date}</td>
                        <td>{att.checkIn}</td>
                        <td>{att.checkOut}</td>
                        <td>
                          <span className={`attendance-status-${att.status}`}>
                            {att.status.charAt(0).toUpperCase() + att.status.slice(1)}
                          </span>
                        </td>
                        <td>{att.totalHours.toFixed(2)}h</td>
                        <td>{att.overtime > 0 ? `${att.overtime.toFixed(2)}h` : "-"}</td>
                      </tr>
                    ))}
                    {mockAttendance.filter(a => a.employeeId === employee.employeeId).length === 0 && (
                      <tr>
                        <td colSpan={6} className="employee-empty-cell">No attendance records found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "performance" && (
            <div className="employee-profile-section">
              <div className="employee-performance-stats">
                <div className="employee-performance-stat">
                  <span className="stat-label">Today's Sales</span>
                  <span className="stat-value">₹{employee.performance.todaySales.toLocaleString()}</span>
                </div>
                <div className="employee-performance-stat">
                  <span className="stat-label">Weekly Sales</span>
                  <span className="stat-value">₹{employee.performance.weeklySales.toLocaleString()}</span>
                </div>
                <div className="employee-performance-stat">
                  <span className="stat-label">Monthly Sales</span>
                  <span className="stat-value">₹{employee.performance.monthlySales.toLocaleString()}</span>
                </div>
                <div className="employee-performance-stat">
                  <span className="stat-label">Total Bills</span>
                  <span className="stat-value">{employee.performance.totalBills}</span>
                </div>
                <div className="employee-performance-stat">
                  <span className="stat-label">Average Bill</span>
                  <span className="stat-value">₹{employee.performance.averageBill.toLocaleString()}</span>
                </div>
                <div className="employee-performance-stat">
                  <span className="stat-label">Return %</span>
                  <span className="stat-value">{employee.performance.returnPercentage}%</span>
                </div>
              </div>

              <div className="employee-targets-section">
                <h4>Targets & Achievement</h4>
                <div className="employee-targets-grid">
                  <div className="employee-target-item">
                    <div className="target-label">Daily Target</div>
                    <div className="target-bar">
                      <div className="target-fill" style={{ width: `${employee.targets.dailyAchieved}%` }} />
                    </div>
                    <div className="target-stats">
                      <span>₹{employee.targets.daily.toLocaleString()}</span>
                      <span>{employee.targets.dailyAchieved}% achieved</span>
                    </div>
                  </div>
                  <div className="employee-target-item">
                    <div className="target-label">Weekly Target</div>
                    <div className="target-bar">
                      <div className="target-fill" style={{ width: `${employee.targets.weeklyAchieved}%` }} />
                    </div>
                    <div className="target-stats">
                      <span>₹{employee.targets.weekly.toLocaleString()}</span>
                      <span>{employee.targets.weeklyAchieved}% achieved</span>
                    </div>
                  </div>
                  <div className="employee-target-item">
                    <div className="target-label">Monthly Target</div>
                    <div className="target-bar">
                      <div className="target-fill" style={{ width: `${employee.targets.monthlyAchieved}%` }} />
                    </div>
                    <div className="target-stats">
                      <span>₹{employee.targets.monthly.toLocaleString()}</span>
                      <span>{employee.targets.monthlyAchieved}% achieved</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "permissions" && (
            <div className="employee-profile-section">
              <div className="employee-permissions-grid">
                {Object.entries(employee.permissions).map(([module, perms]) => (
                  <div key={module} className="employee-permission-module">
                    <h5>{module.charAt(0).toUpperCase() + module.slice(1)}</h5>
                    <div className="employee-permission-items">
                      {Object.entries(perms).map(([key, value]) => (
                        <div key={key} className="employee-permission-item">
                          <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                          {value ? (
                            <CheckCircle2 size={14} className="permission-allowed" />
                          ) : (
                            <X size={14} className="permission-denied" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="employee-profile-section">
              <div className="employee-documents-grid">
                {Object.entries(employee.documents).map(([key, value]) => {
                  if (!value) return null;
                  const docName = key.charAt(0).toUpperCase() + key.slice(1);
                  return (
                    <div key={key} className="employee-document-item">
                      <File size={24} />
                      <div>
                        <p className="doc-name">{docName}</p>
                        <p className="doc-file">{typeof value === "string" ? value : value.join(", ")}</p>
                      </div>
                      <div className="employee-document-actions">
                        <button className="doc-action-btn" title="Download">
                          <Download size={14} />
                        </button>
                        <button className="doc-action-btn" title="View">
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {Object.values(employee.documents).every(v => !v) && (
                  <p className="employee-empty-docs">No documents uploaded</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "payroll" && (
            <div className="employee-profile-section">
              <div className="employee-payroll-summary">
                <div className="employee-payroll-stat">
                  <span className="stat-label">Basic Salary</span>
                  <span className="stat-value">₹{employee.salary.basic.toLocaleString()}</span>
                </div>
                <div className="employee-payroll-stat">
                  <span className="stat-label">HRA</span>
                  <span className="stat-value">₹{employee.salary.hra.toLocaleString()}</span>
                </div>
                <div className="employee-payroll-stat">
                  <span className="stat-label">Allowance</span>
                  <span className="stat-value">₹{employee.salary.allowance.toLocaleString()}</span>
                </div>
                <div className="employee-payroll-stat">
                  <span className="stat-label">Bonus</span>
                  <span className="stat-value">₹{employee.salary.bonus.toLocaleString()}</span>
                </div>
                <div className="employee-payroll-stat">
                  <span className="stat-label">Deductions</span>
                  <span className="stat-value">-₹{employee.salary.deductions.toLocaleString()}</span>
                </div>
                <div className="employee-payroll-stat total">
                  <span className="stat-label">Total Salary</span>
                  <span className="stat-value">₹{employee.salary.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Add/Edit Employee Modal
function EmployeeFormModal({
  employee,
  onClose,
  onSave,
}: {
  employee?: Employee;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [formData, setFormData] = useState<any>(employee || {
    fullName: "",
    mobile: "",
    email: "",
    gender: "male",
    dateOfBirth: "",
    address: "",
    joiningDate: "",
    designation: "",
    role: "cashier",
    branch: "",
    reportingManager: "",
    shift: "morning",
    shiftStart: "09:00",
    shiftEnd: "18:00",
    username: "",
    pin: "",
    forcePasswordChange: true,
    basicSalary: 20000,
    hra: 8000,
    allowance: 2000,
  });

  const roles = ["owner", "manager", "cashier", "inventory", "accountant", "custom"];
  const shifts = ["morning", "afternoon", "night", "custom"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="employee-form-overlay">
      <div className="employee-form-container">
        <div className="employee-form-header">
          <h3>{employee ? "Edit Employee" : "Add New Employee"}</h3>
          <button onClick={onClose} className="employee-form-close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="employee-form">
          <div className="employee-form-scroll">
            {/* Basic Information */}
            <div className="employee-form-section">
              <h4>Basic Information</h4>
              <div className="employee-form-grid">
                <div className="employee-form-field full">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    className="employee-form-input"
                  />
                </div>
                <div className="employee-form-field">
                  <label>Mobile Number *</label>
                  <input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    required
                    className="employee-form-input"
                  />
                </div>
                <div className="employee-form-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="employee-form-input"
                  />
                </div>
                <div className="employee-form-field">
                  <label>Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="employee-form-select"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="employee-form-field">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="employee-form-input"
                  />
                </div>
                <div className="employee-form-field full">
                  <label>Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="employee-form-textarea"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div className="employee-form-section">
              <h4>Work Information</h4>
              <div className="employee-form-grid">
                <div className="employee-form-field">
                  <label>Joining Date *</label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    required
                    className="employee-form-input"
                  />
                </div>
                <div className="employee-form-field">
                  <label>Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="employee-form-input"
                  />
                </div>
                <div className="employee-form-field">
                  <label>Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                    className="employee-form-select"
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="employee-form-field">
                  <label>Branch *</label>
                  <input
                    type="text"
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    required
                    className="employee-form-input"
                  />
                </div>
                <div className="employee-form-field full">
                  <label>Reporting Manager</label>
                  <input
                    type="text"
                    value={formData.reportingManager}
                    onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })}
                    className="employee-form-input"
                  />
                </div>
              </div>
            </div>

            {/* Shift Information */}
            <div className="employee-form-section">
              <h4>Shift Information</h4>
              <div className="employee-form-grid">
                <div className="employee-form-field">
                  <label>Shift</label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    className="employee-form-select"
                  >
                    {shifts.map(shift => (
                      <option key={shift} value={shift}>
                        {shift.charAt(0).toUpperCase() + shift.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="employee-form-field">
                  <label>Shift Start</label>
                  <input
                    type="time"
                    value={formData.shiftStart}
                    onChange={(e) => setFormData({ ...formData, shiftStart: e.target.value })}
                    className="employee-form-input"
                  />
                </div>
                <div className="employee-form-field">
                  <label>Shift End</label>
                  <input
                    type="time"
                    value={formData.shiftEnd}
                    onChange={(e) => setFormData({ ...formData, shiftEnd: e.target.value })}
                    className="employee-form-input"
                  />
                </div>
              </div>
            </div>

            {/* Login Credentials */}
            <div className="employee-form-section">
              <h4>Login Credentials</h4>
              <div className="employee-form-grid">
                <div className="employee-form-field">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="employee-form-input"
                  />
                </div>
                <div className="employee-form-field">
                  <label>PIN *</label>
                  <input
                    type="text"
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                    required
                    maxLength={6}
                    className="employee-form-input"
                  />
                </div>
                <div className="employee-form-field">
                  <label>Force Password Change</label>
                  <select
                    value={formData.forcePasswordChange ? "yes" : "no"}
                    onChange={(e) => setFormData({ ...formData, forcePasswordChange: e.target.value === "yes" })}
                    className="employee-form-select"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Salary Information */}
            <div className="employee-form-section">
              <h4>Salary Information</h4>
              <div className="employee-form-grid">
                <div className="employee-form-field">
                  <label>Basic Salary</label>
                  <input
                    type="number"
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({ ...formData, basicSalary: parseFloat(e.target.value) || 0 })}
                    className="employee-form-input"
                  />
                </div>
                <div className="employee-form-field">
                  <label>HRA</label>
                  <input
                    type="number"
                    value={formData.hra}
                    onChange={(e) => setFormData({ ...formData, hra: parseFloat(e.target.value) || 0 })}
                    className="employee-form-input"
                  />
                </div>
                <div className="employee-form-field">
                  <label>Allowance</label>
                  <input
                    type="number"
                    value={formData.allowance}
                    onChange={(e) => setFormData({ ...formData, allowance: parseFloat(e.target.value) || 0 })}
                    className="employee-form-input"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="employee-form-actions">
            <button type="button" onClick={onClose} className="employee-form-cancel">
              Cancel
            </button>
            <button type="submit" className="employee-form-submit">
              {employee ? "Update Employee" : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Audit Log Modal
function AuditLogModal({
  logs,
  onClose,
}: {
  logs: AuditLog[];
  onClose: () => void;
}) {
  return (
    <div className="audit-log-overlay">
      <div className="audit-log-container">
        <div className="audit-log-header">
          <h3><Shield size={18} /> Audit Log</h3>
          <button onClick={onClose} className="audit-log-close">
            <X size={18} />
          </button>
        </div>
        <div className="audit-log-body">
          <div className="audit-log-filters">
            <input
              type="text"
              placeholder="Search logs..."
              className="audit-log-search"
            />
          </div>
          <div className="audit-log-list">
            {logs.map(log => (
              <div key={log.id} className="audit-log-item">
                <div className="audit-log-item-header">
                  <span className="audit-log-employee">{log.employeeName}</span>
                  <span className="audit-log-action">{log.action}</span>
                  <span className="audit-log-module">{log.module}</span>
                  <span className="audit-log-time">{log.timestamp}</span>
                </div>
                <div className="audit-log-item-details">
                  <p>{log.details}</p>
                  <div className="audit-log-item-meta">
                    <span><Smartphone size={12} /> {log.device}</span>
                    {/* <span><Globe size={12} /> {log.ipAddress}</span> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Active Sessions Modal
function SessionsModal({
  sessions,
  onClose,
}: {
  sessions: ActiveSession[];
  onClose: () => void;
}) {
  return (
    <div className="sessions-overlay">
      <div className="sessions-container">
        <div className="sessions-header">
          <h3><Users size={18} /> Active Sessions</h3>
          <button onClick={onClose} className="sessions-close">
            <X size={18} />
          </button>
        </div>
        <div className="sessions-body">
          {sessions.map(session => (
            <div key={session.id} className="session-item">
              <div className="session-item-info">
                <div className="session-user">
                  <strong>{session.employeeName}</strong>
                  <span className="session-id">{session.employeeId}</span>
                </div>
                <div className="session-device">
                  <span>{session.device}</span>
                  <span className="session-ip">{session.ipAddress}</span>
                </div>
                <div className="session-times">
                  <span>Login: {session.loginTime}</span>
                  <span>Last Active: {session.lastActive}</span>
                </div>
              </div>
              <button className="session-force-logout">
                <LogOut size={14} /> Force Logout
              </button>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="sessions-empty">
              <Users size={32} />
              <p>No active sessions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function EmployeeManagementPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>();
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [activeTab, setActiveTab] = useState<"employees" | "attendance" | "shifts" | "targets" | "roles">("employees");

  const handleView = (emp: Employee) => {
    setSelectedEmployee(emp);
    setShowProfile(true);
  };

  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingEmployee(undefined);
    setShowForm(true);
  };

  const handleToggleStatus = (emp: Employee) => {
    const updated: Employee[] = employees.map(e => {
      if (e.id === emp.id) {
        return {
          ...e,
          status: (e.status === "active" ? "inactive" : "active") as Employee["status"],
        } as Employee;
      }
      return e;
    });
    setEmployees(updated);
  };

  const handleSave = (data: EmployeeFormData) => {
    if (editingEmployee) {
      const updated = employees.map((e): Employee => {
        if (e.id === editingEmployee.id) {
          return {
            ...e,
            ...data,
            updatedAt: new Date().toISOString(),
          } as Employee;
        }
        return e;
      });
      setEmployees(updated);
    } else {
      const newEmp: Employee = {
        id: `emp${Date.now()}`,
        employeeId: `EMP${String(employees.length + 1).padStart(3, "0")}`,
        fullName: data.fullName,
        mobile: data.mobile,
        email: data.email,
        profilePhoto: "",
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
        joiningDate: data.joiningDate,
        designation: data.designation,
        role: data.role,
        branch: data.branch,
        reportingManager: data.reportingManager,
        status: "active",
        username: data.username,
        pin: data.pin,
        passwordLastChanged: new Date().toISOString(),
        forcePasswordChange: data.forcePasswordChange,
        attendance: { present: 0, absent: 0, halfDay: 0, lateEntry: 0, lastAttendance: "" },
        performance: { todaySales: 0, weeklySales: 0, monthlySales: 0, totalBills: 0, averageBill: 0, returnPercentage: 0 },
        targets: { daily: 0, weekly: 0, monthly: 0, dailyAchieved: 0, weeklyAchieved: 0, monthlyAchieved: 0 },
        shift: data.shift,
        shiftTiming: { start: data.shiftStart || "09:00", end: data.shiftEnd || "18:00" },
        permissions: {
          dashboard: { view: true, export: false },
          inventory: { view: false, add: false, edit: false, delete: false, stockAdjust: false },
          sales: { create: true, edit: false, cancel: false, return: false },
          customers: { view: true, add: false, edit: false },
          reports: { view: false, export: false },
          settings: { view: false, edit: false },
        },
        documents: {},
        salary: {
          basic: data.basicSalary || 0,
          hra: data.hra || 0,
          allowance: data.allowance || 0,
          bonus: 0,
          deductions: 0,
          total: (data.basicSalary || 0) + (data.hra || 0) + (data.allowance || 0),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setEmployees([...employees, newEmp]);
    }
    setShowForm(false);
    setEditingEmployee(undefined);
  };

  return (
    <div className="employee-page">
      <div className="employee-page-container">
        {/* Header */}
        <div className="employee-header">
          <div className="employee-header-left">
            <button onClick={() => router.back()} className="employee-back-btn">
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="employee-title">Employee Management</h1>
              <p className="employee-subtitle">
                {employees.filter(e => e.status === "active").length} active employees · {employees.length} total
              </p>
            </div>
          </div>
          <div className="employee-header-actions">
            <button onClick={() => setShowAuditLog(true)} className="employee-action-btn audit">
              <Shield size={16} /> Audit Log
            </button>
            <button onClick={() => setShowSessions(true)} className="employee-action-btn sessions">
              <Users size={16} /> Sessions
            </button>
            <button onClick={handleAdd} className="employee-action-btn primary">
              <Plus size={16} /> Add Employee
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="employee-tabs">
          {["employees", "attendance", "shifts", "targets", "roles"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`employee-tab ${activeTab === tab ? "active" : ""}`}
            >
              {tab === "employees" && <Users size={16} />}
              {tab === "attendance" && <Clock size={16} />}
              {tab === "shifts" && <Calendar size={16} />}
              {tab === "targets" && <Target size={16} />}
              {tab === "roles" && <Shield size={16} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="employee-content">
          {activeTab === "employees" && (
            <EmployeeListComponent
              employees={employees}
              onView={handleView}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
            />
          )}

          {activeTab === "attendance" && (
            <div className="employee-attendance-tab">
              <div className="employee-attendance-summary">
                <div className="attendance-summary-card">
                  <span className="summary-label">Today's Present</span>
                  <span className="summary-value">12</span>
                </div>
                <div className="attendance-summary-card">
                  <span className="summary-label">Today's Absent</span>
                  <span className="summary-value">3</span>
                </div>
                <div className="attendance-summary-card">
                  <span className="summary-label">Late Entry</span>
                  <span className="summary-value">2</span>
                </div>
                <div className="attendance-summary-card">
                  <span className="summary-label">Half Day</span>
                  <span className="summary-value">1</span>
                </div>
              </div>
              <div className="employee-attendance-table-wrapper">
                <table className="employee-attendance-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Status</th>
                      <th>Total Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockAttendance.map(att => (
                      <tr key={att.id}>
                        <td>{att.employeeName}</td>
                        <td>{att.date}</td>
                        <td>{att.checkIn}</td>
                        <td>{att.checkOut}</td>
                        <td>
                          <span className={`attendance-status-${att.status}`}>
                            {att.status.charAt(0).toUpperCase() + att.status.slice(1)}
                          </span>
                        </td>
                        <td>{att.totalHours.toFixed(2)}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "shifts" && (
            <div className="employee-shifts-tab">
              <div className="employee-shifts-grid">
                {mockShifts.map(shift => (
                  <div key={shift.id} className="employee-shift-card" style={{ borderColor: shift.color }}>
                    <div className="shift-card-header" style={{ backgroundColor: shift.color + "20" }}>
                      <span className="shift-color-dot" style={{ backgroundColor: shift.color }} />
                      <h4>{shift.name}</h4>
                    </div>
                    <div className="shift-card-body">
                      <p><Clock size={14} /> {shift.startTime} - {shift.endTime}</p>
                      <p><Users size={14} /> 3 employees assigned</p>
                    </div>
                    <div className="shift-card-actions">
                      <button className="shift-action-btn">Edit</button>
                      <button className="shift-action-btn">Assign</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "targets" && (
            <div className="employee-targets-tab">
              <div className="employee-targets-summary">
                <div className="targets-summary-card">
                  <span className="summary-label">Overall Daily Target</span>
                  <span className="summary-value">₹1,50,000</span>
                  <span className="summary-sub">85% achieved</span>
                </div>
                <div className="targets-summary-card">
                  <span className="summary-label">Overall Weekly Target</span>
                  <span className="summary-value">₹9,00,000</span>
                  <span className="summary-sub">82% achieved</span>
                </div>
                <div className="targets-summary-card">
                  <span className="summary-label">Overall Monthly Target</span>
                  <span className="summary-value">₹36,00,000</span>
                  <span className="summary-sub">78% achieved</span>
                </div>
              </div>
              <div className="employee-target-leaderboard">
                <h4>🏆 Top Performers</h4>
                {employees
                  .filter(e => e.role !== "inventory" && e.role !== "accountant")
                  .sort((a, b) => b.performance.monthlySales - a.performance.monthlySales)
                  .slice(0, 5)
                  .map((emp, index) => (
                    <div key={emp.id} className="leaderboard-item">
                      <span className="leaderboard-rank">#{index + 1}</span>
                      <span className="leaderboard-name">{emp.fullName}</span>
                      <span className="leaderboard-role">{emp.role}</span>
                      <span className="leaderboard-sales">₹{emp.performance.monthlySales.toLocaleString()}</span>
                      <span className="leaderboard-target">{emp.targets.monthlyAchieved}%</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === "roles" && (
            <div className="employee-roles-tab">
              <div className="employee-roles-grid">
                {["owner", "manager", "cashier", "inventory", "accountant", "custom"].map(role => {
                  const count = employees.filter(e => e.role === role).length;
                  return (
                    <div key={role} className="employee-role-card">
                      <div className="role-card-icon">
                        {role === "owner" && <Crown size={24} />}
                        {role === "manager" && <UserCog size={24} />}
                        {role === "cashier" && <User size={24} />}
                        {/* {role === "inventory" && <Package size={24} />} */}
                        {role === "accountant" && <DollarSign size={24} />}
                        {role === "custom" && <UsersRound size={24} />}
                      </div>
                      <h4>{role.charAt(0).toUpperCase() + role.slice(1)}</h4>
                      <p>{count} employee{count !== 1 ? "s" : ""}</p>
                      <button className="role-card-btn">Manage Permissions</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showProfile && selectedEmployee && (
        <EmployeeProfileModal
          employee={selectedEmployee}
          onClose={() => { setShowProfile(false); setSelectedEmployee(null); }}
          onEdit={handleEdit}
        />
      )}

      {showForm && (
        <EmployeeFormModal
          employee={editingEmployee}
          onClose={() => { setShowForm(false); setEditingEmployee(undefined); }}
          onSave={handleSave}
        />
      )}

      {showAuditLog && (
        <AuditLogModal
          logs={mockAuditLogs}
          onClose={() => setShowAuditLog(false)}
        />
      )}

      {showSessions && (
        <SessionsModal
          sessions={mockSessions}
          onClose={() => setShowSessions(false)}
        />
      )}
    </div>
  );
}