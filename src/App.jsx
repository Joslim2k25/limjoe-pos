import { useState, useEffect } from "react";

const SUPABASE_URL = "https://dyatndcvtqrvztvvwpkq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5YXRuZGN2dHFydnp0dnZ3cGtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NDUyOTMsImV4cCI6MjA5NjMyMTI5M30.bsahhMuiBaoe7EkOjimJ62L0xtpbN8aPoLzixj79wSw";
let lastSbError = null;
const sb = async (path, method = "GET", body = null, extraHeaders = {}) => {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      method,
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", "Prefer": method === "POST" ? "return=representation" : "", ...extraHeaders },
      body: body ? JSON.stringify(body) : null,
    });
    const text = await res.text();
    const parsed = text ? JSON.parse(text) : null;
    if (!res.ok) {
      lastSbError = `${res.status}: ${parsed?.message || parsed?.hint || text || "unknown error"}`;
      return null;
    }
    lastSbError = null;
    return parsed;
  } catch (e) { lastSbError = e.message; return null; }
};

const BRANCHES = [
  { id: 1, name: "Branch 1" }, { id: 2, name: "Branch 2" },
  { id: 3, name: "Branch 3" }, { id: 4, name: "Branch 4" },
];
const EMPLOYEES_SEED = [
  { id: 1, name: "Owner", pin: "0000", role: "owner", emoji: "👑", branchId: null },
  { id: 2, name: "Admin", pin: "1111", role: "admin", emoji: "🛡️", branchId: null },
  { id: 3, name: "Manager 1", pin: "2222", role: "manager", emoji: "👔", branchId: 1 },
  { id: 4, name: "Cashier 1", pin: "3333", role: "cashier", emoji: "👩‍💼", branchId: 1 },
  { id: 5, name: "Cashier 2", pin: "4444", role: "cashier", emoji: "👨‍💼", branchId: 1 },
];
const ROLE_LEVEL = { owner: 4, admin: 3, manager: 2, cashier: 1 };
const ROLE_COLOR = { owner: "#d97706", admin: "#7c3aed", manager: "#2563eb", cashier: "#16a34a" };

const PAYMENT_METHODS = [
  { key: "cash", label: "Cash", emoji: "💵", color: "#16a34a", type: "cash" },
  { key: "gcash", label: "GCash", emoji: "💚", color: "#2563eb", type: "cashless" },
  { key: "maya", label: "Maya", emoji: "💙", color: "#0284c7", type: "cashless" },
  { key: "gotyme", label: "GoTyme", emoji: "🏦", color: "#d97706", type: "cashless" },
  { key: "foodpanda", label: "FoodPanda", emoji: "🐼", color: "#db2777", type: "online" },
  { key: "grabfood", label: "GrabFood", emoji: "🚗", color: "#16a34a", type: "online" },
  { key: "sm", label: "SM Online", emoji: "🏪", color: "#1d4ed8", type: "online" },
];
const CATEGORIES = [
  { key: "JUICE", label: "JUICE", color: "#d97706" },
  { key: "MILKTEA", label: "MILKTEA", color: "#7c3aed" },
  { key: "CREAM CHEESE", label: "CREAM CHEESE", color: "#ea580c" },
  { key: "FRUIT TEA", label: "FRUIT TEA", color: "#16a34a" },
  { key: "YOGURT", label: "YOGURT", color: "#db2777" },
  { key: "SMOOTHIES", label: "SMOOTHIES", color: "#2563eb" },
  { key: "ADD-ONS", label: "ADD-ONS", color: "#64748b" },
];
const MENU = {
  JUICE: [
    { name: "Lemonade", medium: 75, large: 90, onlineMed: 90, onlineLge: 110 },
    { name: "Lemonade w/ Rainbow Jelly", medium: 90, large: 110, onlineMed: 110, onlineLge: 130 },
    { name: "Aloevera", medium: 90, large: 110, onlineMed: 110, onlineLge: 130 },
    { name: "Yakult", medium: 90, large: 110, onlineMed: 110, onlineLge: 130 },
    { name: "Orange", medium: null, large: 130, onlineMed: null, onlineLge: 150 },
    { name: "Power Trio", medium: null, large: 130, onlineMed: null, onlineLge: 150 },
    { name: "Calamansi", medium: 70, large: 90, onlineMed: 85, onlineLge: 110 },
    { name: "Grapefruit", medium: null, large: 130, onlineMed: null, onlineLge: 150 },
    { name: "Winter Lemonade", medium: 90, large: 110, onlineMed: 110, onlineLge: 130 },
    { name: "Green Apple Lemonade", medium: 90, large: 110, onlineMed: 110, onlineLge: 130 },
    { name: "Blueberry Lemonade", medium: 90, large: 110, onlineMed: 110, onlineLge: 130 },
    { name: "Calamansi Lemonade", medium: 90, large: 110, onlineMed: 110, onlineLge: 130 },
    { name: "Cucumber Lemonade", medium: 90, large: 110, onlineMed: 110, onlineLge: 130 },
    { name: "Honey Lemonade w/ Aloevera", medium: 100, large: 120, onlineMed: 120, onlineLge: 140 },
    { name: "Strawberry Mango w/ Popping Boba", medium: 90, large: 110, onlineMed: 110, onlineLge: 130 },
    { name: "Lime Lemon Tea", medium: 100, large: 120, onlineMed: 120, onlineLge: 140 },
    { name: "Matcha Kiwi w/ Aloevera", medium: 100, large: 120, onlineMed: 120, onlineLge: 140 },
  ],
  MILKTEA: [
    { name: "Original", medium: 80, large: 95, onlineMed: 95, onlineLge: 115 },
    { name: "Grass Jelly", medium: 110, large: 130, onlineMed: 130, onlineLge: 150 },
    { name: "Coffee Jelly", medium: 110, large: 130, onlineMed: 130, onlineLge: 150 },
    { name: "Brown Sugar", medium: 110, large: 130, onlineMed: 130, onlineLge: 150 },
    { name: "Thai Milktea", medium: 110, large: 130, onlineMed: 130, onlineLge: 150 },
    { name: "Red Velvet", medium: 110, large: 130, onlineMed: 130, onlineLge: 150 },
  ],
  "CREAM CHEESE": [
    { name: "Nutella Hazelnut", medium: 110, large: 125, onlineMed: 130, onlineLge: 145 },
    { name: "Taro", medium: 100, large: 125, onlineMed: 120, onlineLge: 145 },
    { name: "Matcha CC", medium: 110, large: 130, onlineMed: 130, onlineLge: 150 },
    { name: "Oreo", medium: 100, large: 125, onlineMed: 120, onlineLge: 145 },
    { name: "Dark Choco", medium: 100, large: 125, onlineMed: 120, onlineLge: 145 },
    { name: "Strawberry CC", medium: 110, large: 130, onlineMed: 130, onlineLge: 150 },
    { name: "Okinawa", medium: 110, large: 125, onlineMed: 130, onlineLge: 145 },
    { name: "Brown Sugar Boba w/ Fresh Milk", medium: 110, large: 130, onlineMed: 130, onlineLge: 150 },
    { name: "Matcha Latte", medium: 110, large: 130, onlineMed: 130, onlineLge: 150 },
    { name: "Wintermelon", medium: 110, large: 125, onlineMed: 130, onlineLge: 145 },
  ],
  "FRUIT TEA": [
    { name: "Lemon FT", medium: 90, large: 110, onlineMed: 110, onlineLge: 130 },
    { name: "Calamansi FT", medium: 90, large: 110, onlineMed: 110, onlineLge: 130 },
    { name: "Grapefruit FT", medium: 90, large: 140, onlineMed: 110, onlineLge: 160 },
    { name: "Strawberry FT", medium: 90, large: 110, onlineMed: 110, onlineLge: 130 },
    { name: "Lychee FT", medium: 90, large: 110, onlineMed: 110, onlineLge: 130 },
    { name: "Mango FT", medium: 90, large: 110, onlineMed: 110, onlineLge: 130 },
    { name: "Blueberry FT", medium: 90, large: 110, onlineMed: 110, onlineLge: 130 },
  ],
  YOGURT: [
    { name: "Lemon Yogurt", medium: 100, large: 120, onlineMed: 120, onlineLge: 140 },
    { name: "Calamansi Yogurt", medium: 100, large: 120, onlineMed: 120, onlineLge: 140 },
    { name: "Strawberry Yogurt", medium: 100, large: 120, onlineMed: 120, onlineLge: 140 },
    { name: "Mango Yogurt", medium: 100, large: 120, onlineMed: 120, onlineLge: 140 },
    { name: "Blueberry Yogurt", medium: 100, large: 120, onlineMed: 120, onlineLge: 140 },
  ],
  SMOOTHIES: [
    { name: "Lemon Smoothie", medium: 85, large: 95, onlineMed: 100, onlineLge: 115 },
    { name: "Strawberry Smoothie", medium: 85, large: 95, onlineMed: 100, onlineLge: 115 },
    { name: "Mango Smoothie", medium: 90, large: 100, onlineMed: 110, onlineLge: 120 },
    { name: "Blueberry Smoothie", medium: 90, large: 100, onlineMed: 110, onlineLge: 120 },
    { name: "Cookies and Cream", medium: 85, large: 95, onlineMed: 100, onlineLge: 115 },
  ],
  "ADD-ONS": [
    { name: "Nata", medium: 15, large: 20, onlineMed: 20, onlineLge: 25 },
    { name: "Chia Seed", medium: 15, large: 20, onlineMed: 20, onlineLge: 25 },
    { name: "Tapioca", medium: 15, large: 20, onlineMed: 20, onlineLge: 25 },
    { name: "Rainbow Jelly", medium: 20, large: 25, onlineMed: 25, onlineLge: 30 },
    { name: "Popping Boba", medium: 15, large: 20, onlineMed: 20, onlineLge: 25 },
  ],
};

const BORDER_COLORS = ["#d97706","#7c3aed","#db2777","#2563eb","#16a34a","#ea580c","#dc2626","#0284c7","#65a30d","#d97706"];
const todayStr = () => new Date().toISOString().split("T")[0];
const nowStr = () => new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const nowFull = () => new Date().toLocaleString("en-PH");
const applyDiscount = (p) => Math.round((p / 1.12) * 0.80 * 100) / 100;
const calcMins = (inTime, outTime) => {
  const [ih,im] = inTime.split(":").map(Number);
  const [oh,om] = outTime.split(":").map(Number);
  return (oh * 60 + om) - (ih * 60 + im);
};
const formatHrs = (mins) => `${Math.floor(mins/60)}h ${mins%60}m`;

const SALES_KEY = "limjoe-sales-v11";
const DTR_KEY = "limjoe-dtr-v11";
const EXP_KEY = "limjoe-exp-v11";

const printWin = (html) => {
  const w = window.open("", "_blank");
  w.document.write(`<html><head><title>Limjoe</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;font-size:12px;padding:12px;max-width:320px}.c{text-align:center}.brand{font-size:20px;font-weight:900;letter-spacing:5px}.dv{border-top:1px dashed #999;margin:8px 0}.row{display:flex;justify-content:space-between;padding:3px 0}.big{font-size:15px;font-weight:900}.grn{color:#16a34a}.sec{font-size:10px;font-weight:700;letter-spacing:1px;color:#666;margin:10px 0 4px}table{width:100%;border-collapse:collapse;font-size:11px}th{background:#f3f4f6;padding:4px 6px;text-align:left;font-size:10px}td{padding:4px 6px;border-bottom:1px solid #e5e7eb}@media print{.np{display:none}}</style></head><body>${html}<br/><button class="np" onclick="window.print();window.close()" style="width:100%;padding:12px;font-size:14px;cursor:pointer;margin-top:8px;background:#16a34a;color:#fff;border:none;border-radius:8px;font-weight:900">🖨️ I-PRINT</button></body></html>`);
  w.document.close();
};

// ── COLORS (WHITE THEME) ──────────────────────────────────────────────────
const C = {
  bg: "#f8fafc", bg2: "#ffffff", bg3: "#f1f5f9",
  border: "#e2e8f0", border2: "#cbd5e1",
  text: "#0f172a", text2: "#334155", text3: "#64748b",
  primary: "#16a34a", primaryDark: "#15803d",
  accent: "#7c3aed",
  danger: "#dc2626", dangerBg: "#fef2f2",
  warning: "#d97706", warningBg: "#fffbeb",
  info: "#2563eb", infoBg: "#eff6ff",
  success: "#16a34a", successBg: "#f0fdf4",
  card: "#ffffff", shadow: "0 1px 3px rgba(0,0,0,0.1)",
};

export default function App() {
  const [env, setEnv] = useState("home");
  const [currentUser, setCurrentUser] = useState(null);
  const [currentBranch, setCurrentBranch] = useState(BRANCHES[0]);
  const [employees, setEmployees] = useState(EMPLOYEES_SEED);
  const [salesData, setSalesData] = useState({});
  const [dtrData, setDtrData] = useState({});
  const [expenses, setExpenses] = useState({});
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState(null);

  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinMode, setPinMode] = useState("");
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  const [posScreen, setPosScreen] = useState("main");
  const [activeCat, setActiveCat] = useState("JUICE");
  const [cart, setCart] = useState([]);
  const [sizeModal, setSizeModal] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [payTab, setPayTab] = useState("payment");
  const [cashGiven, setCashGiven] = useState(0);
  const [discountType, setDiscountType] = useState(null);
  const [orderNum, setOrderNum] = useState(1001);
  const [lastReceipt, setLastReceipt] = useState(null);
  const [expDesc, setExpDesc] = useState("");
  const [expAmt, setExpAmt] = useState("");
  const [debugError, setDebugError] = useState(null);

  const [adminTab, setAdminTab] = useState("dashboard");
  const [reportDate, setReportDate] = useState(todayStr());
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [depositAmt, setDepositAmt] = useState("");
  const [depositFrom, setDepositFrom] = useState(todayStr());
  const [depositTo, setDepositTo] = useState(todayStr());
  const [depositResult, setDepositResult] = useState(null);
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpPin, setNewEmpPin] = useState("");
  const [newEmpRole, setNewEmpRole] = useState("cashier");
  const [newEmpBranch, setNewEmpBranch] = useState(BRANCHES[0].id);
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [cashOnHand, setCashOnHand] = useState({}); // { `${branchId}_${date}`: amount }
  const [cohInput, setCohInput] = useState({}); // local input buffer per date key while editing
  const [payrollFrom, setPayrollFrom] = useState(() => {
    const d = new Date(); d.setDate(10);
    return d.toISOString().split("T")[0];
  });
  const [payrollTo, setPayrollTo] = useState(() => {
    const d = new Date(); d.setDate(25);
    return d.toISOString().split("T")[0];
  });
  const [depositLoading, setDepositLoading] = useState(false);

  useEffect(() => {
    (async () => {
      await loadFromSupabase();
      setLoading(false);
    })();
  }, []);

  // Pulls all orders/order_items/expenses/dtr from Supabase and rebuilds
  // the local salesData / expenses / dtrData shapes the UI expects.
  const loadFromSupabase = async () => {
    try {
      const [orders, items, exps, dtrRows, emps, cohRows] = await Promise.all([
        sb("orders?select=*&order=order_date.desc,order_time.desc"),
        sb("order_items?select=*"),
        sb("expenses?select=*&order=expense_date.desc"),
        sb("dtr?select=*&order=dtr_date.desc,id.asc"),
        sb("employees?select=*&order=id.asc"),
        sb("cash_on_hand?select=*"),
      ]);

      // Employees: use Supabase rows if present, otherwise seed the table
      // with the default 5 accounts so the table isn't permanently empty.
      if (Array.isArray(emps) && emps.length > 0) {
        setEmployees(emps.map(e => ({
          id: e.id, name: e.name, pin: e.pin, role: e.role,
          emoji: e.emoji || "👤", branchId: e.branch_id, active: e.active !== false,
        })).filter(e => e.active));
      } else {
        setEmployees(EMPLOYEES_SEED);
        // Best-effort seed — ignore failure (e.g. table not reachable yet)
        sb("employees", "POST", EMPLOYEES_SEED.map(e => ({
          name: e.name, pin: e.pin, role: e.role, emoji: e.emoji, branch_id: e.branchId, active: true,
        }))).catch(() => {});
      }

      // Rebuild salesData[`${branchId}_${date}`] = { orders: [...] }
      const ns = {};
      if (Array.isArray(orders)) {
        const itemsByOrder = {};
        (items || []).forEach(i => {
          if (!itemsByOrder[i.order_id]) itemsByOrder[i.order_id] = [];
          itemsByOrder[i.order_id].push({
            key: `${i.item_name}_${i.size}`,
            name: i.item_name, size: i.size, qty: i.qty,
            price: parseFloat(i.unit_price), finalPrice: parseFloat(i.final_price),
          });
        });
        orders.forEach(o => {
          const bk = `${o.branch_id}_${o.order_date}`;
          if (!ns[bk]) ns[bk] = { orders: [] };
          ns[bk].orders.push({
            id: o.order_num, time: o.order_time?.slice(0,8) || "", date: o.order_date,
            branch: BRANCHES.find(b => b.id === o.branch_id)?.name || "", branchId: o.branch_id,
            cashier: o.cashier_name, paymentMethod: o.payment_method,
            items: itemsByOrder[o.id] || [],
            subtotal: parseFloat(o.subtotal || 0), discountType: o.discount_type,
            discountAmt: parseFloat(o.discount_amt || 0), total: parseFloat(o.total || 0),
            cash: parseFloat(o.cash_given || 0), change: parseFloat(o.change_given || 0),
          });
        });
      }

      // Rebuild expenses[`${branchId}_${date}`] = [...]
      const ne = {};
      (exps || []).forEach(e => {
        const bk = `${e.branch_id}_${e.expense_date}`;
        if (!ne[bk]) ne[bk] = [];
        ne[bk].push({ desc: e.description, amount: parseFloat(e.amount), time: e.expense_time?.slice(0,8) || "", branch: BRANCHES.find(b => b.id === e.branch_id)?.name || "" });
      });

      // Rebuild dtrData[`${empId}_${branchId}_${date}`] = [{in,out,name}]
      const nd = {};
      (dtrRows || []).forEach(r => {
        const k = `${r.employee_id}_${r.branch_id}_${r.dtr_date}`;
        if (!nd[k]) nd[k] = [];
        nd[k].push({ in: r.time_in?.slice(0,8) || "", out: r.time_out ? r.time_out.slice(0,8) : null, name: r.employee_name });
      });

      // Rebuild cashOnHand[`${branchId}_${date}`] = amount
      const coh = {};
      (cohRows || []).forEach(r => { coh[`${r.branch_id}_${r.record_date}`] = parseFloat(r.amount); });
      setCashOnHand(coh);

      setSalesData(ns); setExpenses(ne); setDtrData(nd);
      // Keep a local cache as a fallback only
      await persist(SALES_KEY, ns); await persist(EXP_KEY, ne); await persist(DTR_KEY, nd);
    } catch (e) {
      // Supabase unreachable (e.g. project paused/waking up) — fall back to last local cache
      try {
        const s = localStorage.getItem(SALES_KEY);
        const d = localStorage.getItem(DTR_KEY);
        const e2 = localStorage.getItem(EXP_KEY);
        setSalesData(s ? JSON.parse(s) : {});
        setDtrData(d ? JSON.parse(d) : {});
        setExpenses(e2 ? JSON.parse(e2) : {});
        setEmployees(EMPLOYEES_SEED);
        toast("⚠️ Hindi maka-connect sa cloud — gamit muna local cache", "err");
      } catch { setSalesData({}); setDtrData({}); setExpenses({}); setEmployees(EMPLOYEES_SEED); }
    }
  };

  const persist = async (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch {} };
  const toast = (msg, type = "ok") => { setNotif({ msg, type }); setTimeout(() => setNotif(null), 3000); };

  const getEmpDTR = (empId, branchId, date) => dtrData[`${empId}_${branchId}_${date}`] || [];
  const isLoggedIn = (empId, branchId) => {
    const logs = getEmpDTR(empId, branchId, todayStr());
    return logs.length > 0 && !logs[logs.length - 1].out;
  };
  // Find which branch (if any) an employee is currently clocked into today,
  // regardless of which branch this tablet is currently set to.
  const findActiveBranchFor = (empId) => {
    for (const b of BRANCHES) {
      if (isLoggedIn(empId, b.id)) return b;
    }
    return null;
  };
  // Today's DTR logs for an employee — prioritizes the branch they're
  // currently clocked into; if not active anywhere, falls back to the
  // first branch (in BRANCHES order) that has any log for today.
  const getEmpDTRAnyBranch = (empId, date) => {
    const activeBranch = findActiveBranchFor(empId);
    if (activeBranch) return { logs: getEmpDTR(empId, activeBranch.id, date), branch: activeBranch };
    for (const b of BRANCHES) {
      const logs = getEmpDTR(empId, b.id, date);
      if (logs.length > 0) return { logs, branch: b };
    }
    return { logs: [], branch: null };
  };
  const calcDTRHours = (logs) => {
    const mins = logs.filter(l => l.out).reduce((s, l) => s + calcMins(l.in, l.out), 0);
    return { hrs: Math.floor(mins / 60), mins: mins % 60, totalMins: mins };
  };

  // ── PIN HANDLER ─────────────────────────────────────────────────────
  const handlePin = (d) => {
    if (locked) { toast("Locked! Hintayin ang 30 segundo.", "err"); return; }
    if (pinInput.length >= 4) return;
    const np = pinInput + d;
    setPinInput(np);
    if (np.length === 4) setTimeout(() => processPin(np), 120);
  };

  const processPin = async (pin) => {
    const emp = employees.find(e => e.pin === pin);
    if (!emp) {
      const a = loginAttempts + 1;
      setLoginAttempts(a); setPinInput("");
      if (a >= 3) {
        setLocked(true);
        setPinError("🔒 3 maling PIN! Locked ng 30 segundo.");
        setTimeout(() => { setLocked(false); setLoginAttempts(0); setPinError(""); }, 30000);
      } else setPinError(`Mali ang PIN. ${3-a} tries pa.`);
      return;
    }
    setLoginAttempts(0); setPinError(""); setPinInput("");

    // DTR IN
    if (pinMode === "dtr-in") {
      // Check if already logged in — at ANY branch, not just the current tablet's branch
      const existingBranch = findActiveBranchFor(emp.id);
      if (existingBranch) {
        setPinError(`${emp.name} ay naka-login pa sa ${existingBranch.name}! Mag-Time Out muna.`);
        return;
      }
      const nd = { ...dtrData };
      const k = `${emp.id}_${currentBranch.id}_${todayStr()}`;
      if (!nd[k]) nd[k] = [];
      nd[k].push({ in: nowStr(), out: null, name: emp.name });
      setDtrData(nd); await persist(DTR_KEY, nd);
      sb("dtr", "POST", { employee_id: emp.id, employee_name: emp.name, branch_id: currentBranch.id, dtr_date: todayStr(), time_in: nowStr() });
      toast(`🟢 TIME IN: ${emp.emoji} ${emp.name} — ${nowStr()}`);
      setPinMode(""); return;
    }

    // DTR OUT
    if (pinMode === "dtr-out") {
      // Find the branch where this employee is actually clocked in (may not be the current tablet's branch)
      const activeBranch = findActiveBranchFor(emp.id);
      if (!activeBranch) {
        setPinError(`${emp.name} hindi naka-time in!`); return;
      }
      const nd = { ...dtrData };
      const k = `${emp.id}_${activeBranch.id}_${todayStr()}`;
      const entry = nd[k][nd[k].length - 1];
      entry.out = nowStr();
      const totalMins = nd[k].filter(l => l.out).reduce((s, l) => s + calcMins(l.in, l.out), 0);
      setDtrData(nd); await persist(DTR_KEY, nd);
      sb("dtr", "POST", { employee_id: emp.id, employee_name: emp.name, branch_id: activeBranch.id, dtr_date: todayStr(), time_in: entry.in, time_out: entry.out });
      toast(`🔴 TIME OUT: ${emp.emoji} ${emp.name} | Total: ${formatHrs(totalMins)}`);
      setPinMode(""); return;
    }

    // CASHIER LOGIN
    if (pinMode === "cashier-login") {
      if (ROLE_LEVEL[emp.role] >= 3) { setPinError("Admin/Owner — gamitin ang Admin Portal."); return; }
      if (emp.branchId && emp.branchId !== currentBranch.id) {
        setPinError(`${emp.name} ay nasa ${BRANCHES.find(b=>b.id===emp.branchId)?.name} lang.`); return;
      }
      // Check if already logged in to POS
      if (isLoggedIn(emp.id, currentBranch.id)) {
        setPinError(`${emp.name} ay naka-time in pa! I-Time Out muna bago mag-shift change.`); return;
      }
      setCurrentUser(emp);
      setCart([]); setActiveCat("JUICE"); setDiscountType(null); setCashGiven(0); setPaymentMethod("cash");
      setPosScreen("pos"); setEnv("cashier"); setPinMode("");
      toast(`Welcome ${emp.emoji} ${emp.name}!`); return;
    }

    // ADMIN LOGIN
    if (pinMode === "admin-login") {
      if (ROLE_LEVEL[emp.role] < 3) { setPinError("Owner/Admin lang ang may access dito."); return; }
      setCurrentUser(emp);
      setEnv("admin"); setAdminTab("dashboard"); setPinMode("");
      toast(`Welcome ${emp.emoji} ${emp.name}!`); return;
    }
  };

  // ── CART & POS ──────────────────────────────────────────────────────
  const isOnline = ["foodpanda","grabfood","sm"].includes(paymentMethod);
  const pm = PAYMENT_METHODS.find(p => p.key === paymentMethod);

  const getPrice = (item, size) => {
    if (isOnline) return size === "M" ? (item.onlineMed || item.medium) : item.onlineLge;
    return size === "M" ? item.medium : item.large;
  };

  const getFinalPrice = (price) => {
    if (discountType === "SNR" || discountType === "PWD") return applyDiscount(price);
    if (discountType === "5%") return price * 0.95;
    if (discountType === "10%") return price * 0.90;
    if (discountType === "20%") return price * 0.80;
    return price;
  };

  const addToCart = (item, size) => {
    const price = getPrice(item, size);
    const key = `${item.name}_${size}`;
    setCart(prev => {
      const ex = prev.find(c => c.key === key);
      if (ex) return prev.map(c => c.key === key ? { ...c, qty: c.qty+1 } : c);
      return [...prev, { key, name: item.name, size, qty: 1, price, category: activeCat }];
    });
    setSizeModal(null);
  };

  const setQty = (key, qty) => {
    if (qty <= 0) setCart(prev => prev.filter(c => c.key !== key));
    else setCart(prev => prev.map(c => c.key === key ? { ...c, qty } : c));
  };

  const subtotal = cart.reduce((s,c) => s+c.price*c.qty, 0);
  const discountAmt = cart.reduce((s,c) => s+(c.price-getFinalPrice(c.price))*c.qty, 0);
  const total = Math.round((subtotal-discountAmt)*100)/100;
  const change = cashGiven - total;
  const canCharge = cart.length > 0 && (isOnline || ["gcash","maya","gotyme"].includes(paymentMethod) || cashGiven >= total);

  const doCheckout = async () => {
    if (!canCharge) { toast("Hindi pa ready!", "err"); return; }
    const dk = todayStr();
    const bk = `${currentBranch.id}_${dk}`;
    const itemsWithFinal = cart.map(c => ({ ...c, finalPrice: Math.round(getFinalPrice(c.price)*100)/100 }));
    const order = {
      id: orderNum, time: nowStr(), date: dk,
      branch: currentBranch.name, branchId: currentBranch.id,
      cashier: currentUser.name, paymentMethod,
      items: itemsWithFinal, subtotal, discountType, discountAmt, total,
      cash: cashGiven||total, change: paymentMethod==="cash"?Math.max(0,change):0,
    };
    const ns = { ...salesData };
    if (!ns[bk]) ns[bk] = { orders: [] };
    ns[bk].orders.push(order);
    setSalesData(ns); await persist(SALES_KEY, ns);

    let savedToCloud = false;
    let errMsg = null;
    try {
      const result = await sb("orders","POST",{ order_num:orderNum, branch_id:currentBranch.id, cashier_name:currentUser.name, payment_method:paymentMethod, subtotal, discount_type:discountType, discount_amt:discountAmt, total, cash_given:cashGiven||total, change_given:paymentMethod==="cash"?Math.max(0,change):0, order_date:dk, order_time:nowStr() });
      const sbOrder = result && result[0];
      if (sbOrder?.id) {
        const itemsResult = await sb("order_items","POST", itemsWithFinal.map(i => ({ order_id:sbOrder.id, item_name:i.name, size:i.size, qty:i.qty, unit_price:i.price, final_price:i.finalPrice, subtotal:Math.round(i.finalPrice*i.qty*100)/100 })));
        if (itemsResult) savedToCloud = true;
        else errMsg = "order_items insert failed: " + lastSbError;
      } else {
        errMsg = "orders insert failed: " + lastSbError;
      }
    } catch (e) { errMsg = "Exception: " + e.message; }
    setDebugError(errMsg);

    setLastReceipt(order);
    setOrderNum(n=>n+1);
    setCart([]); setCashGiven(0); setDiscountType(null); setPaymentMethod("cash");
    setPosScreen("receipt");
    if (savedToCloud) toast(`Order #${order.id} saved! ☁️`);
    else toast(`⚠️ Cloud save FAILED: ${lastSbError || "unknown"}`, "err");
  };

  const addExpense = async () => {
    if (!expDesc.trim()||!expAmt) { toast("Lagyan ng description at amount!","err"); return; }
    const dk = todayStr(); const bk = `${currentBranch.id}_${dk}`;
    const ne = {...expenses};
    if (!ne[bk]) ne[bk] = [];
    ne[bk].push({ desc:expDesc.trim(), amount:parseFloat(expAmt), time:nowStr(), branch:currentBranch.name });
    setExpenses(ne); await persist(EXP_KEY,ne);
    setExpDesc(""); setExpAmt("");
    let saved = false;
    try {
      const result = await sb("expenses","POST",{ branch_id:currentBranch.id, description:expDesc.trim(), amount:parseFloat(expAmt), expense_date:dk, expense_time:nowStr(), added_by:currentUser?.name });
      if (result && result[0]) saved = true;
    } catch {}
    if (saved) toast(`Expense added: ₱${parseFloat(expAmt).toLocaleString()} ☁️`);
    else toast(`⚠️ Expense saved locally only — walang cloud connection`, "err");
  };

  const createEmployee = async () => {
    if (!newEmpName.trim()) { toast("Lagyan ng pangalan!", "err"); return; }
    if (!/^\d{4}$/.test(newEmpPin)) { toast("Ang PIN ay dapat 4 digits!", "err"); return; }
    if (employees.some(e => e.pin === newEmpPin)) { toast("Ginagamit na ang PIN na ito!", "err"); return; }
    const branchId = newEmpRole === "owner" || newEmpRole === "admin" ? null : newEmpBranch;
    const emoji = newEmpRole === "manager" ? "👔" : "👤";
    try {
      const result = await sb("employees", "POST", [{ name: newEmpName.trim(), pin: newEmpPin, role: newEmpRole, emoji, branch_id: branchId, active: true }]);
      const created = result && result[0];
      if (created) {
        setEmployees(prev => [...prev, { id: created.id, name: created.name, pin: created.pin, role: created.role, emoji: created.emoji, branchId: created.branch_id, active: true }]);
        setNewEmpName(""); setNewEmpPin(""); setNewEmpRole("cashier"); setNewEmpBranch(BRANCHES[0].id); setShowAddEmp(false);
        toast(`Employee added: ${newEmpName} ☁️`);
      } else {
        toast(`⚠️ Hindi nai-save sa cloud: ${lastSbError || "unknown error"}`, "err");
      }
    } catch (e) { toast("Error: " + e.message, "err"); }
  };

  const deactivateEmployee = async (emp) => {
    try {
      const result = await sb(`employees?id=eq.${emp.id}`, "PATCH", { active: false });
      // PostgREST PATCH without Prefer header may return null on success; treat no-throw as success
      setEmployees(prev => prev.filter(e => e.id !== emp.id));
      toast(`${emp.name} ay na-deactivate na`);
    } catch (e) { toast("Error: " + e.message, "err"); }
  };

  const saveCashOnHand = async (branchId, date, amount) => {
    const key = `${branchId}_${date}`;
    const nc = { ...cashOnHand, [key]: amount };
    setCashOnHand(nc);
    try {
      const result = await sb("cash_on_hand", "POST",
        [{ branch_id: branchId, record_date: date, amount, recorded_by: currentUser?.name, updated_at: new Date().toISOString() }],
        { "Prefer": "resolution=merge-duplicates,return=representation" }
      );
      if (result) toast(`Cash on Hand saved: ₱${parseFloat(amount).toLocaleString()} ☁️`);
      else toast(`⚠️ Hindi nai-save sa cloud: ${lastSbError || "unknown"}`, "err");
    } catch (e) { toast("Error: " + e.message, "err"); }
  };

  const getOrders = (date, branchId=null) => {
    if (branchId) return salesData[`${branchId}_${date}`]?.orders||[];
    return BRANCHES.flatMap(b => salesData[`${b.id}_${date}`]?.orders||[]);
  };
  const getExps = (date, branchId=null) => {
    if (branchId) return expenses[`${branchId}_${date}`]||[];
    return BRANCHES.flatMap(b => expenses[`${b.id}_${date}`]||[]);
  };
  const calcSum = (orders) => {
    let gross=0; const iM={},pmM={};
    orders.forEach(o => {
      gross+=o.total;
      o.items?.forEach(i => { const k=`${i.name} (${i.size})`; if(!iM[k])iM[k]={qty:0,sales:0}; iM[k].qty+=i.qty; iM[k].sales+=(i.finalPrice||i.price)*i.qty; });
      if(!pmM[o.paymentMethod])pmM[o.paymentMethod]={sales:0,count:0};
      pmM[o.paymentMethod].sales+=o.total; pmM[o.paymentMethod].count++;
    });
    return { gross, txns:orders.length, top8:Object.entries(iM).sort((a,b)=>b[1].qty-a[1].qty).slice(0,8), pmSales:pmM };
  };

  const checkDeposit = () => {
    if (!depositAmt||isNaN(parseFloat(depositAmt))) { toast("Lagay ang deposit amount!","err"); return; }
    setDepositLoading(true);
    setTimeout(() => {
      try {
        const start=new Date(depositFrom), end=new Date(depositTo);
        let allOrders=[];
        for (let d=new Date(start); d<=end; d.setDate(d.getDate()+1)) {
          const dk=d.toISOString().split("T")[0];
          allOrders=[...allOrders,...getOrders(dk,selectedBranch==="all"?null:parseInt(selectedBranch))];
        }
        const cashSales=allOrders.filter(o=>o.paymentMethod==="cash").reduce((s,o)=>s+o.total,0);
        const totalSales=allOrders.reduce((s,o)=>s+o.total,0);
        const deposit=parseFloat(depositAmt);
        const diff=deposit-cashSales;
        setDepositResult({ totalSales, cashSales, deposit, diff, matched:Math.abs(diff)<1, count:allOrders.length });
      } catch (e) { toast("Error sa deposit check: "+e.message,"err"); }
      setDepositLoading(false);
    }, 300);
  };

  const clearDeposit = () => { setDepositResult(null); setDepositAmt(""); setDepositFrom(todayStr()); setDepositTo(todayStr()); };

  const bFilter = selectedBranch==="all"?null:parseInt(selectedBranch);

  if (loading) return (
    <div style={{ background: C.bg, height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14, fontFamily:"sans-serif" }}>
      <div style={{ fontSize:60 }}>🍋</div>
      <div style={{ color:C.primary, fontWeight:800, fontSize:20 }}>Loading Limjoe POS...</div>
      <div style={{ color:C.text3 }}>Connecting to cloud ☁️</div>
    </div>
  );

  // ══ HOME ════════════════════════════════════════════════════════════════
  if (env==="home" && pinMode==="") {
    return (
      <div style={{ background:C.bg, minHeight:"100vh", fontFamily:"sans-serif", color:C.text, padding:16 }}>
        {notif && <Toast notif={notif}/>}
        <div style={{ textAlign:"center", paddingTop:10, marginBottom:24 }}>
          <div style={{ width:70, height:70, borderRadius:"50%", background:"#fef9c3", border:`3px solid #d97706`, margin:"0 auto 8px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:34 }}>🍋</div>
          <div style={{ fontSize:22, fontWeight:900, letterSpacing:4, color:C.primary }}>LIMJOE</div>
          <div style={{ color:C.text3, fontSize:11 }}>Lemony Juice Station · Cloud POS ☁️</div>
          <div style={{ color:C.text3, fontSize:10, marginTop:2 }}>{new Date().toLocaleDateString("en-PH",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
        </div>

        <div style={{ maxWidth:440, margin:"0 auto", display:"flex", flexDirection:"column", gap:12 }}>
          {/* Branch */}
          <div style={{ background:C.card, borderRadius:14, padding:14, border:`1px solid ${C.border}`, boxShadow:C.shadow }}>
            <div style={{ fontSize:11, color:C.text3, fontWeight:700, letterSpacing:1, marginBottom:10 }}>🏪 SELECT BRANCH</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {BRANCHES.map(b => (
                <button key={b.id} onClick={()=>setCurrentBranch(b)}
                  style={{ padding:"8px 16px", background:currentBranch.id===b.id?C.primary:"white", border:`1.5px solid ${currentBranch.id===b.id?C.primary:C.border2}`, borderRadius:8, color:currentBranch.id===b.id?"white":C.text2, fontWeight:700, fontSize:13, cursor:"pointer" }}>
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* DTR */}
          <div style={{ background:C.card, borderRadius:14, padding:14, border:`1px solid ${C.border}`, boxShadow:C.shadow }}>
            <div style={{ fontSize:11, color:C.text3, fontWeight:700, letterSpacing:1, marginBottom:10 }}>⏱️ TIME RECORD — {currentBranch.name}</div>
            <div style={{ display:"flex", gap:10, marginBottom:12 }}>
              <button onClick={()=>setPinMode("dtr-in")}
                style={{ flex:1, padding:"14px", background:C.successBg, border:`2px solid ${C.success}`, borderRadius:12, color:C.success, fontWeight:900, fontSize:15, cursor:"pointer" }}>🟢 TIME IN</button>
              <button onClick={()=>setPinMode("dtr-out")}
                style={{ flex:1, padding:"14px", background:C.dangerBg, border:`2px solid ${C.danger}`, borderRadius:12, color:C.danger, fontWeight:900, fontSize:15, cursor:"pointer" }}>🔴 TIME OUT</button>
            </div>
            {employees.map(emp=>{
              const { logs, branch: empBranch } = getEmpDTRAnyBranch(emp.id, todayStr());
              const inside = empBranch ? isLoggedIn(emp.id, empBranch.id) : false;
              const {hrs, mins, totalMins}=calcDTRHours(logs);
              const last=logs[logs.length-1];
              const atOtherBranch = empBranch && empBranch.id !== currentBranch.id;
              return (
                <div key={emp.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 0", borderBottom:`1px solid ${C.border}` }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:inside?C.success:logs.length?C.text3:C.border2 }}/>
                  <span style={{ fontSize:14 }}>{emp.emoji}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:12, color:C.text }}>{emp.name}</div>
                    <div style={{ fontSize:9, color:C.text3 }}>
                      {inside?`IN since ${last?.in}`:logs.length?`Out: ${last?.out}`:"No log today"}
                      {atOtherBranch && <span style={{ color:C.warning, fontWeight:700 }}> · 📍{empBranch.name}</span>}
                    </div>
                  </div>
                  {logs.length>0 && (
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontWeight:800, fontSize:11, color:inside?C.success:C.text3 }}>{inside?`${hrs}h ${mins}m`:`Total: ${formatHrs(totalMins)}`}</div>
                      {!inside && totalMins>0 && <div style={{ fontSize:9, color:C.text3 }}>✅ Completed</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 2 Environment buttons */}
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={()=>setPinMode("cashier-login")}
              style={{ flex:1, padding:"20px 10px", background:C.primary, border:"none", borderRadius:14, color:"white", fontWeight:900, fontSize:15, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4, boxShadow:`0 2px 8px ${C.primary}44` }}>
              <span style={{ fontSize:28 }}>🧾</span>
              <span>CASHIER POS</span>
              <span style={{ fontSize:10, opacity:0.85 }}>Cashier / Manager</span>
            </button>
            <button onClick={()=>setPinMode("admin-login")}
              style={{ flex:1, padding:"20px 10px", background:"white", border:`2px solid ${C.accent}`, borderRadius:14, color:C.accent, fontWeight:900, fontSize:15, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <span style={{ fontSize:28 }}>🔐</span>
              <span>ADMIN PORTAL</span>
              <span style={{ fontSize:10, opacity:0.7 }}>Owner / Admin only</span>
            </button>
          </div>
          <div style={{ textAlign:"center", fontSize:10, color:C.text3 }}>☁️ Supabase Cloud · {currentBranch.name}</div>
        </div>
      </div>
    );
  }

  // ══ PIN SCREEN ═══════════════════════════════════════════════════════
  if (pinMode !== "") {
    const isAdmin = pinMode==="admin-login";
    const isDTR = pinMode.startsWith("dtr");
    const title = {
      "dtr-in":"TIME IN","dtr-out":"TIME OUT",
      "cashier-login":"CASHIER POS LOGIN","admin-login":"ADMIN PORTAL LOGIN"
    }[pinMode];
    const emoji = {"dtr-in":"🟢","dtr-out":"🔴","cashier-login":"🧾","admin-login":"🔐"}[pinMode];
    const accentColor = isAdmin ? C.accent : isDTR ? (pinMode==="dtr-in"?C.success:C.danger) : C.primary;

    return (
      <div style={{ background:C.bg, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"sans-serif", padding:16 }}>
        {notif && <Toast notif={notif}/>}
        <div style={{ background:C.card, borderRadius:22, padding:"24px 20px", width:"100%", maxWidth:340, border:`1px solid ${C.border}`, boxShadow:"0 4px 24px rgba(0,0,0,0.1)" }}>
          <button onClick={()=>{setPinMode("");setPinInput("");setPinError("");setLoginAttempts(0);setLocked(false);}}
            style={{ background:"transparent", border:"none", color:C.text3, fontSize:13, cursor:"pointer", marginBottom:12 }}>← Back</button>
          <div style={{ textAlign:"center", marginBottom:18 }}>
            <div style={{ fontSize:38 }}>{emoji}</div>
            <div style={{ fontSize:15, fontWeight:800, color:C.text, marginTop:6 }}>{title}</div>
            <div style={{ fontSize:11, color:accentColor, marginTop:2 }}>📍 {currentBranch.name}</div>
          </div>
          <div style={{ display:"flex", justifyContent:"center", gap:16, marginBottom:10 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ width:18, height:18, borderRadius:"50%", background:pinInput.length>i?accentColor:"transparent", border:`3px solid ${pinInput.length>i?accentColor:C.border2}`, transition:"all 0.15s" }}/>
            ))}
          </div>
          {pinError
            ? <div style={{ color:C.danger, fontSize:12, textAlign:"center", marginBottom:6, fontWeight:600, background:C.dangerBg, padding:"6px 10px", borderRadius:8 }}>{pinError}</div>
            : <div style={{ color:C.text3, fontSize:11, textAlign:"center", marginBottom:6 }}>Ilagay ang 4-digit PIN</div>}
          {locked && <div style={{ background:C.dangerBg, border:`1px solid ${C.danger}`, borderRadius:8, padding:"8px 12px", textAlign:"center", fontSize:12, color:C.danger, marginBottom:8 }}>🔒 Locked! Hintayin ang 30 segundo.</div>}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginTop:8 }}>
            {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((d,i) => (
              <button key={i}
                style={{ padding:"15px", fontSize:20, fontWeight:700, background:d===""?"transparent":"white", border:d===""?"none":`1.5px solid ${C.border2}`, borderRadius:11, color:d==="⌫"?C.danger:C.text, cursor:locked||d===""?"not-allowed":"pointer", visibility:d===""?"hidden":"visible", opacity:locked?0.4:1 }}
                onClick={()=>d==="⌫"?setPinInput(p=>p.slice(0,-1)):d!==""&&handlePin(String(d))}>
                {d}
              </button>
            ))}
          </div>
          <div style={{ marginTop:14, paddingTop:10, borderTop:`1px solid ${C.border}`, textAlign:"center", fontSize:10, color:C.text3 }}>
            🔐 PIN is confidential — contact your admin if forgotten
          </div>
        </div>
      </div>
    );
  }

  // ══ CASHIER POS ══════════════════════════════════════════════════════
  if (env==="cashier") {
    const items = MENU[activeCat]||[];
    const cat = CATEGORIES.find(c=>c.key===activeCat);
    const cartCount = cart.reduce((s,c)=>s+c.qty,0);
    const branchOrders = getOrders(todayStr(), currentBranch.id);
    const branchSum = calcSum(branchOrders);
    const branchExp = getExps(todayStr(), currentBranch.id).reduce((s,e)=>s+parseFloat(e.amount),0);

    if (posScreen==="main") return (
      <div style={{ background:C.bg, minHeight:"100vh", fontFamily:"sans-serif", color:C.text, padding:16 }}>
        {notif && <Toast notif={notif}/>}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <div style={{ fontSize:17, fontWeight:900, color:C.primary }}>LIMJOE · {currentBranch.name}</div>
            <div style={{ fontSize:11, color:C.text3 }}>{currentUser?.emoji} {currentUser?.name} · {currentUser?.role}</div>
          </div>
          <button onClick={()=>{setCurrentUser(null);setEnv("home");setPosScreen("main");}}
            style={{ padding:"7px 14px", background:C.dangerBg, border:`1px solid ${C.danger}`, borderRadius:8, color:C.danger, fontWeight:700, fontSize:12, cursor:"pointer" }}>🚪 Logout</button>
        </div>

        {/* Today summary */}
        <div style={{ background:C.card, borderRadius:14, padding:14, border:`1px solid ${C.border}`, boxShadow:C.shadow, marginBottom:12 }}>
          <div style={{ fontSize:11, color:C.text3, fontWeight:700, marginBottom:10 }}>📊 TODAY — {todayStr()}</div>
          <div style={{ display:"flex", gap:8 }}>
            {[
              {label:"Gross Sales",val:`₱${branchSum.gross.toFixed(0)}`,color:C.success},
              {label:"Expenses",val:`₱${branchExp.toFixed(0)}`,color:C.danger},
              {label:"Net Sales",val:`₱${(branchSum.gross-branchExp).toFixed(0)}`,color:C.warning},
              {label:"Transactions",val:branchSum.txns,color:C.info},
            ].map(s=>(
              <div key={s.label} style={{ flex:1, textAlign:"center", background:C.bg3, borderRadius:10, padding:"10px 4px" }}>
                <div style={{ fontSize:16, fontWeight:900, color:s.color }}>{s.val}</div>
                <div style={{ fontSize:9, color:C.text3, marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={()=>setPosScreen("pos")}
          style={{ width:"100%", padding:"20px", background:C.primary, border:"none", borderRadius:14, color:"white", fontWeight:900, fontSize:18, cursor:"pointer", marginBottom:12, boxShadow:`0 2px 8px ${C.primary}44` }}>
          🧾 START PUNCHING
        </button>

        {currentUser?.role === "manager" && (
          <button onClick={()=>setPosScreen("monthly")}
            style={{ width:"100%", padding:"14px", background:"white", border:`2px solid ${C.accent}`, borderRadius:12, color:C.accent, fontWeight:800, fontSize:14, cursor:"pointer", marginBottom:12 }}>
            📅 Monthly Report — {currentBranch.name}
          </button>
        )}

        {/* X Reading */}
        <div style={{ background:C.card, borderRadius:14, padding:14, border:`1px solid ${C.border}`, boxShadow:C.shadow }}>
          <div style={{ fontSize:11, color:C.text3, fontWeight:700, marginBottom:8 }}>📋 X READING — {currentBranch.name}</div>
          {branchSum.top8.length===0
            ? <div style={{ color:C.text3, fontSize:12, textAlign:"center", padding:"10px 0" }}>Wala pang sales</div>
            : branchSum.top8.map(([n,d],i)=>(
              <div key={n} style={{ display:"flex", justifyContent:"space-between", fontSize:12, padding:"5px 0", borderBottom:`1px solid ${C.border}` }}>
                <span style={{ color:i<3?["#d97706","#64748b","#92400e"][i]:C.text3, fontWeight:700 }}>#{i+1}</span>
                <span style={{ flex:1, marginLeft:8, color:C.text }}>{n}</span>
                <span style={{ color:C.text3 }}>×{d.qty}</span>
                <span style={{ color:C.success, fontWeight:700, marginLeft:8 }}>₱{d.sales.toFixed(0)}</span>
              </div>
            ))}
        </div>
      </div>
    );

    if (posScreen==="monthly") {
      const mOrders = (()=>{
        const [y,m]=reportMonth.split("-");
        const days=new Date(parseInt(y),parseInt(m),0).getDate();
        const rows=[];
        for(let d=1;d<=days;d++){
          const dk=`${reportMonth}-${String(d).padStart(2,"0")}`;
          const ords=getOrders(dk,currentBranch.id);
          const exps=getExps(dk,currentBranch.id);
          const cohKey=`${currentBranch.id}_${dk}`;
          const cohVal=parseFloat(cashOnHand[cohKey] ?? NaN);
          if(!ords.length&&!exps.length&&isNaN(cohVal))continue;
          const gross=ords.reduce((s,o)=>s+o.total,0);
          const exp=exps.reduce((s,e)=>s+parseFloat(e.amount),0);
          const byMethod={};
          PAYMENT_METHODS.forEach(p=>{ byMethod[p.key]=0; });
          ords.forEach(o=>{ if(byMethod[o.paymentMethod]!==undefined) byMethod[o.paymentMethod]+=o.total; });
          const nonCashDeduction=(byMethod.grabfood||0)+(byMethod.foodpanda||0)+(byMethod.gcash||0)+(byMethod.maya||0)+(byMethod.gotyme||0)+(byMethod.sm||0);
          const net=gross-nonCashDeduction-exp;
          let remarks="—";
          if(!isNaN(cohVal)){
            const diff=Math.round((cohVal-net)*100)/100;
            remarks=Math.abs(diff)<1?"MATCHED":diff>0?`OVER ₱${diff.toFixed(2)}`:`SHORT ₱${Math.abs(diff).toFixed(2)}`;
          }
          rows.push({date:dk,gross,...byMethod,expenses:exp,net,cashOnHand:isNaN(cohVal)?null:cohVal,remarks,txns:ords.length});
        }
        return rows;
      })();

      return (
        <div style={{ background:C.bg, minHeight:"100vh", fontFamily:"sans-serif", color:C.text, padding:16 }}>
          {notif && <Toast notif={notif}/>}
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8 }}>
            <button onClick={()=>setPosScreen("main")} style={{ padding:"6px 12px",background:C.bg3,border:`1px solid ${C.border}`,borderRadius:8,color:C.text2,cursor:"pointer",fontWeight:700,fontSize:12 }}>← Back</button>
            <div style={{ fontSize:15,fontWeight:900,color:C.accent }}>📅 Monthly — {currentBranch.name}</div>
            <input type="month" value={reportMonth} onChange={e=>setReportMonth(e.target.value)} style={{ padding:"6px 10px",borderRadius:7,border:`1px solid ${C.border}`,background:"white",color:C.text,fontSize:11 }}/>
          </div>

          {mOrders.length===0?<div style={EM}>Walang data sa buwan na ito</div>:mOrders.map(r=>{
            const inputKey=`${currentBranch.id}_${r.date}`;
            const isEditing=inputKey in cohInput;
            const remarksColor=r.remarks==="MATCHED"?C.success:r.remarks==="—"?C.text3:r.remarks.startsWith("OVER")?C.info:C.danger;
            return (
              <div key={r.date} style={{ background:"white",borderRadius:12,border:`1px solid ${C.border}`,boxShadow:C.shadow,marginBottom:10,padding:"12px 14px" }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                  <div style={{ fontWeight:800,fontSize:14,color:C.text }}>{r.date}</div>
                  <div style={{ fontWeight:900,fontSize:15,color:C.success }}>₱{r.gross.toFixed(2)}</div>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8 }}>
                  {PAYMENT_METHODS.filter(p=>p.key!=="cash").map(p=>(
                    <div key={p.key} style={{ background:C.bg3,borderRadius:7,padding:"6px 8px",textAlign:"center" }}>
                      <div style={{ fontSize:11,fontWeight:800,color:p.color }}>₱{(r[p.key]||0).toFixed(0)}</div>
                      <div style={{ fontSize:8,color:C.text3 }}>{p.emoji} {p.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,padding:"4px 0",borderTop:`1px solid ${C.border}` }}>
                  <span style={{ color:C.text3 }}>Expenses</span><span style={{ color:C.danger,fontWeight:700 }}>-₱{r.expenses.toFixed(2)}</span>
                </div>
                <div style={{ display:"flex",justifyContent:"space-between",fontSize:14,padding:"6px 0",borderTop:`1px solid ${C.border}`,fontWeight:900 }}>
                  <span style={{ color:C.text }}>NET SALES</span><span style={{ color:C.warning }}>₱{r.net.toFixed(2)}</span>
                </div>
                <div style={{ marginTop:8,paddingTop:8,borderTop:`1px dashed ${C.border}` }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}>
                    <span style={{ fontSize:11,color:C.text3,minWidth:90 }}>Cash on Hand:</span>
                    <input type="number"
                      value={isEditing ? cohInput[inputKey] : (r.cashOnHand ?? "")}
                      onChange={e=>setCohInput(prev=>({...prev,[inputKey]:e.target.value}))}
                      placeholder="₱0.00"
                      style={{ flex:1,minWidth:90,padding:"6px 9px",fontSize:13,fontWeight:700,borderRadius:7,border:`1.5px solid ${C.border}`,color:C.warning }}/>
                    <button onClick={()=>{
                        const val=parseFloat(isEditing?cohInput[inputKey]:r.cashOnHand);
                        if(isNaN(val)){ toast("Lagay ng valid amount!","err"); return; }
                        saveCashOnHand(currentBranch.id, r.date, val);
                        setCohInput(prev=>{ const c={...prev}; delete c[inputKey]; return c; });
                      }}
                      style={{ padding:"6px 14px",background:C.primary,border:"none",borderRadius:7,color:"white",fontWeight:700,fontSize:11,cursor:"pointer" }}>Save</button>
                  </div>
                  {r.remarks!=="—" && (
                    <div style={{ marginTop:8,padding:"6px 10px",background:remarksColor+"15",borderRadius:7,fontSize:12,fontWeight:800,color:remarksColor,textAlign:"center" }}>
                      {r.remarks==="MATCHED" ? "✅ MATCHED" : `⚠️ ${r.remarks}`}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (posScreen==="receipt"&&lastReceipt) return (
      <div style={{ background:C.bg, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"sans-serif", padding:16 }}>
        {notif && <Toast notif={notif}/>}
        {debugError && (
          <div style={{ position:"fixed", top:60, left:16, right:16, background:"#450a0a", border:"2px solid #ef4444", borderRadius:10, padding:"10px 14px", zIndex:9998, maxWidth:400, margin:"0 auto" }}>
            <div style={{ color:"#fca5a5", fontWeight:900, fontSize:12, marginBottom:4 }}>⚠️ CLOUD SAVE ERROR (debug):</div>
            <div style={{ color:"#fecaca", fontSize:11, fontFamily:"monospace", wordBreak:"break-word" }}>{debugError}</div>
          </div>
        )}
        <div style={{ background:"white", borderRadius:18, padding:"20px 16px", width:"100%", maxWidth:300, fontFamily:"'Courier New',monospace", color:C.text, boxShadow:"0 4px 24px rgba(0,0,0,0.1)" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:28 }}>🍋</div>
            <div style={{ fontSize:16, fontWeight:900, letterSpacing:5 }}>LIMJOE</div>
            <div style={{ fontSize:9, color:C.text3 }}>{lastReceipt.branch}</div>
          </div>
          <div style={{ borderTop:"1px dashed #cbd5e1", margin:"8px 0" }}/>
          <div style={{ textAlign:"center", fontSize:10, color:C.text3 }}>Order #{lastReceipt.id} · {lastReceipt.date} · {lastReceipt.time}<br/>{lastReceipt.cashier} · {pm?.emoji} {pm?.label}</div>
          <div style={{ borderTop:"1px dashed #cbd5e1", margin:"8px 0" }}/>
          {lastReceipt.items.map((i,idx)=>(
            <div key={idx} style={{ display:"flex", justifyContent:"space-between", fontSize:11, padding:"2px 0" }}>
              <span>{i.name}({i.size}) ×{i.qty}</span><span>₱{(i.finalPrice*i.qty).toFixed(2)}</span>
            </div>
          ))}
          {lastReceipt.discountType&&<div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:C.text3 }}><span>Discount ({lastReceipt.discountType})</span><span>-₱{lastReceipt.discountAmt.toFixed(2)}</span></div>}
          <div style={{ borderTop:"1px dashed #cbd5e1", margin:"8px 0" }}/>
          <div style={{ display:"flex", justifyContent:"space-between", fontWeight:900, fontSize:14 }}><span>TOTAL</span><span>₱{lastReceipt.total.toFixed(2)}</span></div>
          {lastReceipt.paymentMethod==="cash"
            ? <><div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:C.text3 }}><span>Cash</span><span>₱{lastReceipt.cash.toFixed(2)}</span></div>
                <div style={{ display:"flex", justifyContent:"space-between", fontWeight:900, fontSize:18, color:C.success }}><span>SUKLI</span><span>₱{lastReceipt.change.toFixed(2)}</span></div></>
            : <div style={{ textAlign:"center", color:C.success, fontWeight:700, fontSize:13, marginTop:4 }}>✅ Paid via {pm?.label}</div>}
          <div style={{ borderTop:"1px dashed #cbd5e1", margin:"8px 0" }}/>
          <div style={{ textAlign:"center", fontSize:11, fontWeight:700, color:C.text2 }}>Salamat! 🍋</div>
          <div style={{ display:"flex", gap:8, marginTop:10 }}>
            <button onClick={()=>printWin(`<div class="c"><div class="brand">LIMJOE</div><div style="font-size:9px;color:#666">${lastReceipt.branch}</div></div><div class="dv"></div><div class="c" style="font-size:10px;color:#666">Order #${lastReceipt.id} · ${lastReceipt.date} · ${lastReceipt.time}<br>${lastReceipt.cashier} · ${pm?.emoji} ${pm?.label}</div><div class="dv"></div>${lastReceipt.items.map(i=>`<div class="row"><span>${i.name}(${i.size})×${i.qty}</span><span>₱${(i.finalPrice*i.qty).toFixed(2)}</span></div>`).join("")}${lastReceipt.discountType?`<div class="row" style="color:#666"><span>Discount(${lastReceipt.discountType})</span><span>-₱${lastReceipt.discountAmt.toFixed(2)}</span></div>`:""}<div class="dv"></div><div class="row big"><span>TOTAL</span><span>₱${lastReceipt.total.toFixed(2)}</span></div>${lastReceipt.paymentMethod==="cash"?`<div class="row" style="color:#666"><span>Cash</span><span>₱${lastReceipt.cash.toFixed(2)}</span></div><div class="row big grn"><span>SUKLI</span><span>₱${lastReceipt.change.toFixed(2)}</span></div>`:`<div class="c grn" style="font-weight:700">Paid via ${pm?.label}</div>`}<div class="dv"></div><div class="c" style="font-weight:700">Salamat! 🍋</div>`)}
              style={{ flex:1, padding:"10px", background:C.bg3, border:`1px solid ${C.border}`, borderRadius:8, fontWeight:700, fontSize:12, cursor:"pointer", color:C.text }}>🖨️ Print</button>
            <button onClick={()=>setPosScreen("pos")}
              style={{ flex:2, padding:"10px", background:C.primary, border:"none", borderRadius:8, fontWeight:900, fontSize:13, cursor:"pointer", color:"white" }}>+ New Order</button>
          </div>
          <button onClick={()=>setPosScreen("main")} style={{ width:"100%", marginTop:6, padding:"9px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:8, color:C.text3, fontSize:11, cursor:"pointer" }}>← Back to Summary</button>
        </div>
      </div>
    );

    // POS GRID
    return (
      <div style={{ background:C.bg, height:"100vh", display:"flex", flexDirection:"column", fontFamily:"sans-serif", overflow:"hidden", color:C.text }}>
        {notif && <Toast notif={notif}/>}

        {/* SIZE MODAL */}
        {sizeModal && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, padding:20 }}>
            <div style={{ background:"white", borderRadius:18, padding:"20px 16px", width:"100%", maxWidth:320, border:`1px solid ${C.border}`, boxShadow:"0 8px 32px rgba(0,0,0,0.15)" }}>
              <div style={{ fontSize:15, fontWeight:900, color:C.text, marginBottom:3 }}>{sizeModal.name}</div>
              <div style={{ fontSize:10, color:C.text3, marginBottom:16 }}>{isOnline?"🛵 Online Price":"🏪 In-store Price"}{discountType?` · ${discountType}`:""}</div>
              <div style={{ display:"flex", gap:10 }}>
                {sizeModal.medium!==null&&(
                  <button onClick={()=>addToCart(sizeModal,"M")}
                    style={{ flex:1, padding:"16px 8px", background:C.successBg, border:`2px solid ${C.success}`, borderRadius:12, color:C.success, cursor:"pointer", textAlign:"center" }}>
                    <div style={{ fontWeight:900, fontSize:16 }}>MEDIUM</div>
                    <div style={{ fontSize:14, marginTop:3 }}>₱{getPrice(sizeModal,"M")}</div>
                    {discountType&&<div style={{ fontSize:10, marginTop:2, color:C.success }}>₱{getFinalPrice(getPrice(sizeModal,"M")).toFixed(0)} w/{discountType}</div>}
                  </button>
                )}
                <button onClick={()=>addToCart(sizeModal,"L")}
                  style={{ flex:1, padding:"16px 8px", background:C.infoBg, border:`2px solid ${C.info}`, borderRadius:12, color:C.info, cursor:"pointer", textAlign:"center" }}>
                  <div style={{ fontWeight:900, fontSize:16 }}>LARGE</div>
                  <div style={{ fontSize:14, marginTop:3 }}>₱{getPrice(sizeModal,"L")}</div>
                  {discountType&&<div style={{ fontSize:10, marginTop:2, color:C.info }}>₱{getFinalPrice(getPrice(sizeModal,"L")).toFixed(0)} w/{discountType}</div>}
                </button>
              </div>
              <button onClick={()=>setSizeModal(null)} style={{ width:"100%", marginTop:10, padding:"10px", background:"white", border:`1px solid ${C.border}`, borderRadius:9, color:C.text3, cursor:"pointer", fontWeight:700 }}>Cancel</button>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div style={{ background:"white", borderBottom:`1px solid ${C.border}`, padding:"0 12px", display:"flex", alignItems:"center", gap:8, height:48, flexShrink:0, boxShadow:C.shadow }}>
          <button onClick={()=>setPosScreen("main")} style={{ padding:"5px 9px", background:C.bg3, border:`1px solid ${C.border}`, borderRadius:6, color:C.text2, cursor:"pointer", fontSize:11, fontWeight:700 }}>←</button>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:900, color:C.primary }}>LIMJOE · {currentBranch.name}</div>
            <div style={{ fontSize:9, color:C.text3 }}>{currentUser?.emoji} {currentUser?.name}</div>
          </div>
          {cartCount>0&&<div style={{ background:C.primary, color:"white", borderRadius:20, padding:"3px 10px", fontWeight:900, fontSize:12 }}>{cartCount} items</div>}
        </div>

        {/* CATEGORY TABS */}
        <div style={{ background:"white", borderBottom:`1px solid ${C.border}`, display:"flex", overflowX:"auto", scrollbarWidth:"none", flexShrink:0 }}>
          {CATEGORIES.map(c=>(
            <button key={c.key} onClick={()=>setActiveCat(c.key)}
              style={{ padding:"10px 13px", border:"none", background:"transparent", color:activeCat===c.key?c.color:C.text3, fontWeight:activeCat===c.key?900:600, fontSize:11, cursor:"pointer", whiteSpace:"nowrap", borderBottom:activeCat===c.key?`3px solid ${c.color}`:"3px solid transparent" }}>
              {c.label}
            </button>
          ))}
        </div>

        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {/* GRID */}
          <div style={{ flex:1, overflowY:"auto", padding:10, background:C.bg }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
              {items.map((item,idx)=>{
                const mC=cart.find(c=>c.key===`${item.name}_M`);
                const lC=cart.find(c=>c.key===`${item.name}_L`);
                const inCart=mC||lC;
                const totalQty=(mC?.qty||0)+(lC?.qty||0);
                const bc=BORDER_COLORS[idx%BORDER_COLORS.length];
                return (
                  <button key={item.name} onClick={()=>setSizeModal(item)}
                    style={{ background:inCart?"#f0fdf4":"white", border:`2px solid ${inCart?C.success:C.border}`, borderRadius:10, padding:"12px 6px", cursor:"pointer", textAlign:"center", position:"relative", display:"flex", flexDirection:"column", alignItems:"center", gap:3, minHeight:78, boxShadow:C.shadow }}>
                    {inCart&&<div style={{ position:"absolute", top:4, right:4, background:C.success, color:"white", borderRadius:"50%", width:16, height:16, fontSize:9, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center" }}>{totalQty}</div>}
                    <div style={{ fontSize:11, fontWeight:700, color:C.text, lineHeight:1.3 }}>{item.name}</div>
                    <div style={{ width:16, height:2, background:bc, borderRadius:1 }}/>
                    <div style={{ fontSize:9, color:C.text3 }}>₱{getPrice(item,"M")||""}{item.medium?"-":""}₱{getPrice(item,"L")}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MINI CART */}
          {cart.length>0&&(
            <div style={{ background:"white", borderTop:`1px solid ${C.border}`, maxHeight:85, overflowY:"auto" }}>
              {cart.map(item=>(
                <div key={item.key} style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 12px", borderBottom:`1px solid ${C.border}` }}>
                  <div style={{ flex:1, fontSize:11, color:C.text }}>{item.name} <span style={{ color:C.text3 }}>({item.size})</span></div>
                  <button onClick={()=>setQty(item.key,item.qty-1)} style={{ width:20,height:20,border:`1px solid ${C.border}`,background:C.bg3,color:C.text,borderRadius:4,cursor:"pointer",fontWeight:900,fontSize:12 }}>−</button>
                  <span style={{ width:18,textAlign:"center",fontWeight:900,color:C.primary,fontSize:12 }}>{item.qty}</span>
                  <button onClick={()=>setQty(item.key,item.qty+1)} style={{ width:20,height:20,border:`1px solid ${C.border}`,background:C.bg3,color:C.text,borderRadius:4,cursor:"pointer",fontWeight:900,fontSize:12 }}>+</button>
                  <span style={{ fontWeight:700,fontSize:11,color:C.warning,minWidth:44,textAlign:"right" }}>₱{(getFinalPrice(item.price)*item.qty).toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}

          {/* PAYMENT PANEL */}
          <div style={{ background:"white", borderTop:`2px solid ${C.border}`, flexShrink:0 }}>
            <div style={{ display:"flex", borderBottom:`1px solid ${C.border}` }}>
              {[{key:"payment",label:"Payment"},{key:"discount",label:"Discount"},{key:"expense",label:"Expenses"}].map(t=>(
                <button key={t.key} onClick={()=>setPayTab(t.key)}
                  style={{ flex:1,padding:"9px",border:"none",background:"transparent",color:payTab===t.key?C.primary:C.text3,fontWeight:payTab===t.key?800:600,fontSize:11,cursor:"pointer",borderBottom:payTab===t.key?`2px solid ${C.primary}`:"2px solid transparent" }}>
                  {t.label}
                </button>
              ))}
            </div>

            {payTab==="payment"&&(
              <div style={{ padding:"8px 12px" }}>
                <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:5 }}>
                  <button onClick={()=>setPaymentMethod("cash")} style={{ padding:"6px 10px",background:paymentMethod==="cash"?C.successBg:"white",border:`1.5px solid ${paymentMethod==="cash"?C.success:C.border}`,borderRadius:6,color:paymentMethod==="cash"?C.success:C.text2,fontWeight:800,fontSize:11,cursor:"pointer" }}>💵 Cash</button>
                  {paymentMethod==="cash"&&[20,50,100,200,500,1000].map(b=>(
                    <button key={b} onClick={()=>setCashGiven(b)} style={{ padding:"6px 9px",background:cashGiven===b?C.successBg:"white",border:`1.5px solid ${cashGiven===b?C.success:C.border}`,borderRadius:6,color:cashGiven===b?C.success:C.text2,fontWeight:800,fontSize:11,cursor:"pointer" }}>₱{b}</button>
                  ))}
                  {paymentMethod==="cash"&&<input type="number" value={cashGiven||""} onChange={e=>setCashGiven(parseFloat(e.target.value)||0)} placeholder="₱" style={{ width:65,padding:"6px 7px",fontSize:12,fontWeight:700,borderRadius:6,border:`1.5px solid ${C.border}`,background:"white",color:C.warning,outline:"none" }}/>}
                </div>
                <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:4 }}>
                  {PAYMENT_METHODS.filter(p=>p.type==="cashless").map(p=>(
                    <button key={p.key} onClick={()=>{setPaymentMethod(p.key);setCashGiven(total);}} style={{ padding:"6px 10px",background:paymentMethod===p.key?p.color+"11":"white",border:`1.5px solid ${paymentMethod===p.key?p.color:C.border}`,borderRadius:6,color:paymentMethod===p.key?p.color:C.text2,fontWeight:800,fontSize:11,cursor:"pointer" }}>{p.emoji} {p.label}</button>
                  ))}
                </div>
                <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
                  {PAYMENT_METHODS.filter(p=>p.type==="online").map(p=>(
                    <button key={p.key} onClick={()=>{setPaymentMethod(p.key);setCashGiven(total);}} style={{ padding:"6px 10px",background:paymentMethod===p.key?p.color+"11":"white",border:`1.5px solid ${paymentMethod===p.key?p.color:C.border}`,borderRadius:6,color:paymentMethod===p.key?p.color:C.text2,fontWeight:800,fontSize:11,cursor:"pointer" }}>{p.emoji} {p.label}</button>
                  ))}
                </div>
              </div>
            )}

            {payTab==="discount"&&(
              <div style={{ padding:"8px 12px" }}>
                <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
                  {["5%","10%","20%"].map(d=><button key={d} onClick={()=>setDiscountType(discountType===d?null:d)} style={{ padding:"7px 12px",background:discountType===d?C.infoBg:"white",border:`1.5px solid ${discountType===d?C.info:C.border}`,borderRadius:7,color:discountType===d?C.info:C.text2,fontWeight:800,fontSize:12,cursor:"pointer" }}>{d}</button>)}
                  {["SNR","PWD"].map(d=><button key={d} onClick={()=>setDiscountType(discountType===d?null:d)} style={{ padding:"7px 14px",background:discountType===d?C.successBg:"white",border:`1.5px solid ${discountType===d?C.success:C.border}`,borderRadius:7,color:discountType===d?C.success:C.text2,fontWeight:900,fontSize:13,cursor:"pointer" }}>{d}</button>)}
                  {discountType&&<button onClick={()=>setDiscountType(null)} style={{ padding:"7px 10px",background:C.dangerBg,border:`1.5px solid ${C.danger}`,borderRadius:7,color:C.danger,fontWeight:800,fontSize:11,cursor:"pointer" }}>✕</button>}
                </div>
                {discountType&&<div style={{ fontSize:10,color:C.text3,marginTop:5 }}>{discountType==="SNR"||discountType==="PWD"?`Gross ÷ 1.12 × 80% | Save: ₱${discountAmt.toFixed(2)}`:`Discount: ₱${discountAmt.toFixed(2)}`}</div>}
              </div>
            )}

            {payTab==="expense"&&(
              <div style={{ padding:"8px 12px" }}>
                <div style={{ display:"flex",gap:5,marginBottom:4 }}>
                  <input value={expDesc} onChange={e=>setExpDesc(e.target.value)} placeholder="Description" style={{ flex:2,padding:"7px 9px",fontSize:11,borderRadius:7,border:`1.5px solid ${C.border}`,background:"white",color:C.text,outline:"none" }}/>
                  <input type="number" value={expAmt} onChange={e=>setExpAmt(e.target.value)} placeholder="₱" style={{ flex:1,padding:"7px 7px",fontSize:11,borderRadius:7,border:`1.5px solid ${C.border}`,background:"white",color:C.warning,outline:"none" }}/>
                  <button onClick={addExpense} style={{ padding:"7px 11px",background:C.primary,border:"none",borderRadius:7,color:"white",fontWeight:900,cursor:"pointer",fontSize:13 }}>+</button>
                </div>
                <div style={{ fontSize:9,color:C.danger,fontWeight:700 }}>Today: ₱{getExps(todayStr(),currentBranch.id).reduce((s,e)=>s+parseFloat(e.amount),0).toFixed(2)}</div>
              </div>
            )}

            <div style={{ padding:"8px 12px 10px",display:"flex",alignItems:"center",gap:10,borderTop:`1px solid ${C.border}` }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex",gap:12 }}>
                  <div>
                    <div style={{ fontSize:9,color:C.text3 }}>Total</div>
                    <div style={{ fontWeight:900,fontSize:16,color:C.primary }}>₱{total.toFixed(2)}</div>
                    {discountType&&<div style={{ fontSize:8,color:C.warning }}>-₱{discountAmt.toFixed(2)}</div>}
                  </div>
                  <div>
                    {paymentMethod==="cash"&&cashGiven>=total&&cashGiven>0&&<>
                      <div style={{ fontSize:9,color:C.text3 }}>Sukli</div>
                      <div style={{ fontWeight:900,fontSize:16,color:C.warning }}>₱{change.toFixed(2)}</div>
                    </>}
                    {paymentMethod!=="cash"&&<>
                      <div style={{ fontSize:9,color:C.text3 }}>Via</div>
                      <div style={{ fontSize:13,color:pm?.color,fontWeight:700 }}>{pm?.emoji} {pm?.label}</div>
                    </>}
                  </div>
                </div>
              </div>
              <button onClick={doCheckout} disabled={!canCharge}
                style={{ padding:"13px 20px",background:canCharge?C.primary:C.bg3,border:`1px solid ${canCharge?C.primary:C.border}`,borderRadius:11,color:canCharge?"white":C.text3,fontWeight:900,fontSize:15,cursor:canCharge?"pointer":"not-allowed",minWidth:110 }}>
                {cart.length===0?"₱0":!canCharge?"Add Cash":"Charge ›"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══ ADMIN PORTAL ══════════════════════════════════════════════════════
  if (env==="admin") {
    const rOrders=getOrders(reportDate,bFilter);
    const rExps=getExps(reportDate,bFilter);
    const rSum=calcSum(rOrders);
    const rExpTotal=rExps.reduce((s,e)=>s+parseFloat(e.amount),0);
    const rNet=rSum.gross-rExpTotal;
    const todayOrders=getOrders(todayStr(),bFilter);
    const todaySum=calcSum(todayOrders);
    const todayExp=getExps(todayStr(),bFilter).reduce((s,e)=>s+parseFloat(e.amount),0);

    const monthRows=(()=>{
      const [y,m]=reportMonth.split("-");
      const days=new Date(parseInt(y),parseInt(m),0).getDate();
      const rows=[];
      for(let d=1;d<=days;d++){
        const dk=`${reportMonth}-${String(d).padStart(2,"0")}`;
        const ords=getOrders(dk,bFilter);
        const exps=getExps(dk,bFilter);
        const cohKey = bFilter ? `${bFilter}_${dk}` : null;
        const cohVal = cohKey ? parseFloat(cashOnHand[cohKey] ?? NaN) : NaN;
        if(!ords.length&&!exps.length&&isNaN(cohVal))continue;
        const gross=ords.reduce((s,o)=>s+o.total,0);
        const exp=exps.reduce((s,e)=>s+parseFloat(e.amount),0);
        const byMethod={};
        PAYMENT_METHODS.forEach(p=>{ byMethod[p.key]=0; });
        ords.forEach(o=>{ if(byMethod[o.paymentMethod]!==undefined) byMethod[o.paymentMethod]+=o.total; });
        const nonCashDeduction = (byMethod.grabfood||0)+(byMethod.foodpanda||0)+(byMethod.gcash||0)+(byMethod.maya||0)+(byMethod.gotyme||0)+(byMethod.sm||0);
        const net = gross - nonCashDeduction - exp;
        let remarks = "—";
        if (!isNaN(cohVal)) {
          const diff = Math.round((cohVal - net) * 100) / 100;
          remarks = Math.abs(diff) < 1 ? "MATCHED" : diff > 0 ? `OVER ₱${diff.toFixed(2)}` : `SHORT ₱${Math.abs(diff).toFixed(2)}`;
        }
        rows.push({date:dk,gross,...byMethod,expenses:exp,net,cashOnHand:isNaN(cohVal)?null:cohVal,remarks,txns:ords.length});
      }
      return rows;
    })();

    // Payroll summary — total work days + total hours per employee within a custom date range
    const payrollRows = employees.map(emp => {
      let totalMins = 0;
      let workDays = 0;
      const start = new Date(payrollFrom), end = new Date(payrollTo);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dk = d.toISOString().split("T")[0];
        let dayMins = 0;
        BRANCHES.forEach(b => {
          const logs = getEmpDTR(emp.id, b.id, dk);
          dayMins += logs.filter(l => l.out).reduce((s, l) => s + calcMins(l.in, l.out), 0);
        });
        if (dayMins > 0) { workDays++; totalMins += dayMins; }
      }
      return { ...emp, workDays, totalMins, totalHrs: formatHrs(totalMins) };
    });

    const TABS=[
      {key:"dashboard",label:"📊 Dashboard"},
      {key:"xreport",label:"📋 X Reading"},
      {key:"zreport",label:"🔒 Z Reading"},
      {key:"monthly",label:"📅 Monthly"},
      {key:"channels",label:"💳 Channels"},
      {key:"deposit",label:"🏦 Deposit"},
      {key:"dtr",label:"🕐 DTR"},
      {key:"payroll",label:"💰 Payroll"},
      {key:"employees",label:"👥 Employees"},
    ];

    return (
      <div style={{ background:C.bg, height:"100vh", display:"flex", flexDirection:"column", fontFamily:"sans-serif", overflow:"hidden", color:C.text }}>
        {notif && <Toast notif={notif}/>}

        {/* Admin Header */}
        <div style={{ background:"white", borderBottom:`2px solid ${C.accent}22`, padding:"0 12px", display:"flex", alignItems:"center", gap:8, height:50, flexShrink:0, boxShadow:C.shadow }}>
          <div style={{ width:34,height:34,borderRadius:"50%",background:`${C.accent}15`,border:`2px solid ${C.accent}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>🔐</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13,fontWeight:900,color:C.accent }}>LIMJOE ADMIN PORTAL</div>
            <div style={{ fontSize:9,color:C.text3 }}>{currentUser?.emoji} {currentUser?.name} · {currentUser?.role}</div>
          </div>
          <select value={selectedBranch} onChange={e=>setSelectedBranch(e.target.value)}
            style={{ padding:"5px 8px",background:"white",border:`1px solid ${C.border}`,borderRadius:6,color:C.text2,fontSize:11,cursor:"pointer" }}>
            <option value="all">All Branches</option>
            {BRANCHES.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <button onClick={()=>{setCurrentUser(null);setEnv("home");}} style={{ padding:"6px 12px",background:C.dangerBg,border:`1px solid ${C.danger}`,borderRadius:7,color:C.danger,cursor:"pointer",fontWeight:700,fontSize:11 }}>Logout</button>
        </div>

        {/* Tabs */}
        <div style={{ background:"white", borderBottom:`1px solid ${C.border}`, display:"flex", overflowX:"auto", scrollbarWidth:"none", flexShrink:0 }}>
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>setAdminTab(t.key)}
              style={{ padding:"10px 12px",border:"none",background:"transparent",color:adminTab===t.key?C.accent:C.text3,fontWeight:adminTab===t.key?800:600,fontSize:11,cursor:"pointer",whiteSpace:"nowrap",borderBottom:adminTab===t.key?`2px solid ${C.accent}`:"2px solid transparent" }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:14 }}>

          {adminTab==="dashboard"&&(
            <div>
              <div style={PT}>📊 Dashboard — {todayStr()}</div>
              <div style={SR}>
                <SB label="Gross" val={`₱${todaySum.gross.toFixed(0)}`} color={C.success}/>
                <SB label="Expenses" val={`₱${todayExp.toFixed(0)}`} color={C.danger}/>
                <SB label="NET" val={`₱${(todaySum.gross-todayExp).toFixed(0)}`} color={C.warning}/>
                <SB label="Txns" val={todaySum.txns} color={C.info}/>
              </div>
              <div style={SEC}>SALES PER BRANCH TODAY</div>
              {BRANCHES.map(b=>{
                const bOrds=getOrders(todayStr(),b.id);
                const bSum=calcSum(bOrds);
                const bExp=getExps(todayStr(),b.id).reduce((s,e)=>s+parseFloat(e.amount),0);
                return (
                  <div key={b.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"white",borderRadius:10,marginBottom:8,border:`1px solid ${C.border}`,boxShadow:C.shadow }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700,fontSize:13 }}>🏪 {b.name}</div>
                      <div style={{ fontSize:10,color:C.text3 }}>{bSum.txns} orders · Exp: ₱{bExp.toFixed(0)}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontWeight:900,fontSize:15,color:C.success }}>₱{bSum.gross.toFixed(0)}</div>
                      <div style={{ fontSize:10,color:C.warning }}>Net: ₱{(bSum.gross-bExp).toFixed(0)}</div>
                    </div>
                  </div>
                );
              })}
              <div style={SEC}>🏆 Top 8 Items Today</div>
              {todaySum.top8.length===0?<div style={EM}>Wala pang sales</div>:todaySum.top8.map(([n,d],i)=>(
                <div key={n} style={TR}>
                  <span style={{ color:i<3?["#d97706","#64748b","#92400e"][i]:C.text3,fontWeight:900,width:22 }}>#{i+1}</span>
                  <span style={{ flex:1,fontSize:12 }}>{n}</span>
                  <span style={{ color:C.text3,fontSize:11 }}>×{d.qty}</span>
                  <span style={{ color:C.success,fontWeight:700 }}>₱{d.sales.toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}

          {adminTab==="xreport"&&(
            <div>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8 }}>
                <div style={PT}>📋 X Reading</div>
                <div style={{ display:"flex",gap:8 }}>
                  <input type="date" value={reportDate} onChange={e=>setReportDate(e.target.value)} style={{ padding:"6px 10px",borderRadius:7,border:`1px solid ${C.border}`,background:"white",color:C.text,fontSize:11 }}/>
                  <button onClick={()=>printWin(`<div class="c"><div class="brand">LIMJOE</div><div style="font-size:9px;color:#666">X READING — ${reportDate}<br>Printed: ${nowFull()}</div></div><div class="dv"></div><div class="row big"><span>Gross</span><span>₱${rSum.gross.toFixed(2)}</span></div><div class="row"><span>Expenses</span><span>-₱${rExpTotal.toFixed(2)}</span></div><div class="row big"><span>NET</span><span>₱${rNet.toFixed(2)}</span></div><div class="row"><span>Txns</span><span>${rOrders.length}</span></div><div class="dv"></div><div class="sec">Top 8 Items</div>${rSum.top8.map(([n,d],i)=>`<div class="row"><span>#${i+1} ${n}</span><span>×${d.qty}=₱${d.sales.toFixed(2)}</span></div>`).join("")}<div class="dv"></div><div class="sec">Orders</div>${rOrders.map(o=>`<div class="row" style="font-size:10px"><span>#${o.id} ${o.time} ${o.cashier}</span><span>₱${o.total.toFixed(2)}</span></div>`).join("")}`)}
                    style={{ padding:"6px 12px",background:C.accent,border:"none",borderRadius:7,color:"white",fontWeight:700,fontSize:11,cursor:"pointer" }}>🖨️ Print</button>
                </div>
              </div>
              <div style={SR}>
                <SB label="Gross" val={`₱${rSum.gross.toFixed(0)}`} color={C.success}/>
                <SB label="Expenses" val={`-₱${rExpTotal.toFixed(0)}`} color={C.danger}/>
                <SB label="NET" val={`₱${rNet.toFixed(0)}`} color={C.warning}/>
                <SB label="Txns" val={rOrders.length} color={C.info}/>
              </div>
              <div style={SEC}>🏆 Top 8 Items</div>
              {rSum.top8.map(([n,d],i)=>(
                <div key={n} style={TR}>
                  <span style={{ color:i<3?["#d97706","#64748b","#92400e"][i]:C.text3,fontWeight:900,width:22 }}>#{i+1}</span>
                  <span style={{ flex:1,fontSize:12 }}>{n}</span>
                  <span style={{ color:C.text3 }}>×{d.qty}</span>
                  <span style={{ color:C.success,fontWeight:700 }}>₱{d.sales.toFixed(0)}</span>
                </div>
              ))}
              <div style={SEC}>Order Log</div>
              {rOrders.length===0?<div style={EM}>Walang orders</div>:rOrders.map(o=>{
                const p=PAYMENT_METHODS.find(pm=>pm.key===o.paymentMethod);
                return (
                  <div key={o.id} style={{ ...TR,flexWrap:"wrap",fontSize:11 }}>
                    <span style={{ color:C.warning,fontWeight:700 }}>#{o.id}</span>
                    <span style={{ color:C.text3 }}>{o.time}</span>
                    <span style={{ color:C.info }}>{o.cashier}</span>
                    <span style={{ color:C.text3 }}>{o.branch}</span>
                    <span style={{ color:p?.color }}>{p?.emoji}</span>
                    {o.discountType&&<span style={{ color:C.warning }}>[{o.discountType}]</span>}
                    <span style={{ color:C.success,fontWeight:700 }}>₱{o.total.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          )}

          {adminTab==="zreport"&&(
            <div>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8 }}>
                <div style={PT}>🔒 Z Reading — {reportDate}</div>
                <div style={{ display:"flex",gap:8 }}>
                  <input type="date" value={reportDate} onChange={e=>setReportDate(e.target.value)} style={{ padding:"6px 10px",borderRadius:7,border:`1px solid ${C.border}`,background:"white",color:C.text,fontSize:11 }}/>
                  <button onClick={()=>printWin(`<div class="c"><div class="brand">LIMJOE</div><div style="font-size:9px;color:#666">Z READING — ${reportDate}<br>Printed: ${nowFull()}</div></div><div class="dv"></div><div class="row big"><span>GROSS</span><span>₱${rSum.gross.toFixed(2)}</span></div><div class="row"><span>EXPENSES</span><span>-₱${rExpTotal.toFixed(2)}</span></div><div class="row big"><span>NET</span><span>₱${rNet.toFixed(2)}</span></div><div class="dv"></div><div class="sec">Top 8 Items</div>${rSum.top8.map(([n,d],i)=>`<div class="row"><span>#${i+1} ${n}</span><span>×${d.qty}=₱${d.sales.toFixed(2)}</span></div>`).join("")}<div class="dv"></div><div class="c big">*** END OF DAY ***</div>`)}
                    style={{ padding:"6px 12px",background:C.accent,border:"none",borderRadius:7,color:"white",fontWeight:700,fontSize:11,cursor:"pointer" }}>🖨️ Print</button>
                </div>
              </div>
              <div style={SR}>
                <SB label="GROSS" val={`₱${rSum.gross.toFixed(0)}`} color={C.success} big/>
                <SB label="EXPENSES" val={`-₱${rExpTotal.toFixed(0)}`} color={C.danger} big/>
                <SB label="NET" val={`₱${rNet.toFixed(0)}`} color={C.warning} big/>
              </div>
              <div style={SEC}>By Channel</div>
              {PAYMENT_METHODS.map(p=>{const d=rSum.pmSales[p.key];if(!d?.sales)return null;return(
                <div key={p.key} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"white",borderRadius:9,marginBottom:6,border:`1px solid ${C.border}`,boxShadow:C.shadow }}>
                  <span style={{ fontSize:18 }}>{p.emoji}</span>
                  <span style={{ flex:1,fontWeight:700,fontSize:13 }}>{p.label}</span>
                  <span style={{ color:C.text3,fontSize:11 }}>{d.count} orders</span>
                  <span style={{ color:p.color,fontWeight:900,fontSize:15 }}>₱{d.sales.toFixed(2)}</span>
                </div>
              );})}
              <div style={SEC}>🏆 Top 8 Items</div>
              {rSum.top8.map(([n,d],i)=>(
                <div key={n} style={TR}>
                  <span style={{ color:i<3?["#d97706","#64748b","#92400e"][i]:C.text3,fontWeight:900,width:22 }}>#{i+1}</span>
                  <span style={{ flex:1 }}>{n}</span>
                  <span style={{ color:C.text3 }}>×{d.qty}</span>
                  <span style={{ color:C.success,fontWeight:700 }}>₱{d.sales.toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}

          {adminTab==="monthly"&&(
            <div>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8 }}>
                <div style={PT}>📅 Monthly Report</div>
                <div style={{ display:"flex",gap:8 }}>
                  <input type="month" value={reportMonth} onChange={e=>setReportMonth(e.target.value)} style={{ padding:"6px 10px",borderRadius:7,border:`1px solid ${C.border}`,background:"white",color:C.text,fontSize:11 }}/>
                  <button onClick={()=>printWin(`<div class="c"><div class="brand">LIMJOE</div><div style="font-size:9px;color:#666">MONTHLY — ${reportMonth}</div></div><div class="dv"></div><div class="row big"><span>TOTAL GROSS</span><span>₱${monthRows.reduce((s,r)=>s+r.gross,0).toFixed(2)}</span></div><div class="row"><span>EXPENSES</span><span>-₱${monthRows.reduce((s,r)=>s+r.expenses,0).toFixed(2)}</span></div><div class="row big"><span>NET SALES</span><span>₱${monthRows.reduce((s,r)=>s+r.net,0).toFixed(2)}</span></div><div class="dv"></div><table><tr><th>Date</th><th>Gross</th><th>GrabFood</th><th>FoodPanda</th><th>GCash</th><th>Maya</th><th>GoTyme</th><th>Exp</th><th>Net</th><th>Cash on Hand</th><th>Remarks</th></tr>${monthRows.map(r=>`<tr><td>${r.date.slice(5)}</td><td>₱${r.gross.toFixed(0)}</td><td>₱${(r.grabfood||0).toFixed(0)}</td><td>₱${(r.foodpanda||0).toFixed(0)}</td><td>₱${(r.gcash||0).toFixed(0)}</td><td>₱${(r.maya||0).toFixed(0)}</td><td>₱${(r.gotyme||0).toFixed(0)}</td><td>₱${r.expenses.toFixed(0)}</td><td>₱${r.net.toFixed(0)}</td><td>${r.cashOnHand!==null?'₱'+r.cashOnHand.toFixed(0):'—'}</td><td>${r.remarks}</td></tr>`).join("")}</table>`)}
                    style={{ padding:"6px 12px",background:C.accent,border:"none",borderRadius:7,color:"white",fontWeight:700,fontSize:11,cursor:"pointer" }}>🖨️ Print</button>
                </div>
              </div>

              {bFilter===null && (
                <div style={{ background:C.warningBg,borderRadius:10,padding:"10px 14px",marginBottom:14,border:`1px solid ${C.warning}` }}>
                  <div style={{ fontSize:11,color:C.warning,fontWeight:700 }}>ℹ️ Pumili ng specific branch</div>
                  <div style={{ fontSize:11,color:C.text2,marginTop:4 }}>Ang Cash on Hand input at Remarks ay makikita lang kapag pumili ng isang branch (hindi "All Branches") sa itaas.</div>
                </div>
              )}

              {monthRows.length>0&&<div style={SR}>
                <SB label="Monthly Gross" val={`₱${monthRows.reduce((s,r)=>s+r.gross,0).toFixed(0)}`} color={C.success}/>
                <SB label="Expenses" val={`₱${monthRows.reduce((s,r)=>s+r.expenses,0).toFixed(0)}`} color={C.danger}/>
                <SB label="NET" val={`₱${monthRows.reduce((s,r)=>s+r.net,0).toFixed(0)}`} color={C.warning}/>
                <SB label="Txns" val={monthRows.reduce((s,r)=>s+r.txns,0)} color={C.info}/>
              </div>}

              {monthRows.length===0?<div style={{...EM,padding:"20px"}}>Walang data sa buwan na ito</div>:monthRows.map(r=>{
                const inputKey = `${bFilter}_${r.date}`;
                const isEditing = inputKey in cohInput;
                const remarksColor = r.remarks==="MATCHED"?C.success : r.remarks==="—"?C.text3 : r.remarks.startsWith("OVER")?C.info : C.danger;
                return (
                  <div key={r.date} style={{ background:"white",borderRadius:12,border:`1px solid ${C.border}`,boxShadow:C.shadow,marginBottom:10,padding:"12px 14px" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                      <div style={{ fontWeight:800,fontSize:14,color:C.text }}>{r.date}</div>
                      <div style={{ fontWeight:900,fontSize:15,color:C.success }}>₱{r.gross.toFixed(2)}</div>
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8 }}>
                      {PAYMENT_METHODS.filter(p=>p.key!=="cash").map(p=>(
                        <div key={p.key} style={{ background:C.bg3,borderRadius:7,padding:"6px 8px",textAlign:"center" }}>
                          <div style={{ fontSize:11,fontWeight:800,color:p.color }}>₱{(r[p.key]||0).toFixed(0)}</div>
                          <div style={{ fontSize:8,color:C.text3 }}>{p.emoji} {p.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,padding:"4px 0",borderTop:`1px solid ${C.border}` }}>
                      <span style={{ color:C.text3 }}>Expenses</span><span style={{ color:C.danger,fontWeight:700 }}>-₱{r.expenses.toFixed(2)}</span>
                    </div>
                    <div style={{ display:"flex",justifyContent:"space-between",fontSize:14,padding:"6px 0",borderTop:`1px solid ${C.border}`,fontWeight:900 }}>
                      <span style={{ color:C.text }}>NET SALES</span><span style={{ color:C.warning }}>₱{r.net.toFixed(2)}</span>
                    </div>

                    {bFilter!==null && (
                      <div style={{ marginTop:8,paddingTop:8,borderTop:`1px dashed ${C.border}` }}>
                        <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}>
                          <span style={{ fontSize:11,color:C.text3,minWidth:90 }}>Cash on Hand:</span>
                          <input type="number"
                            value={isEditing ? cohInput[inputKey] : (r.cashOnHand ?? "")}
                            onChange={e=>setCohInput(prev=>({...prev,[inputKey]:e.target.value}))}
                            placeholder="₱0.00"
                            style={{ flex:1,minWidth:90,padding:"6px 9px",fontSize:13,fontWeight:700,borderRadius:7,border:`1.5px solid ${C.border}`,color:C.warning }}/>
                          <button onClick={()=>{
                              const val = parseFloat(isEditing ? cohInput[inputKey] : r.cashOnHand);
                              if (isNaN(val)) { toast("Lagay ng valid amount!","err"); return; }
                              saveCashOnHand(bFilter, r.date, val);
                              setCohInput(prev=>{ const c={...prev}; delete c[inputKey]; return c; });
                            }}
                            style={{ padding:"6px 14px",background:C.primary,border:"none",borderRadius:7,color:"white",fontWeight:700,fontSize:11,cursor:"pointer" }}>Save</button>
                        </div>
                        {r.remarks!=="—" && (
                          <div style={{ marginTop:8,padding:"6px 10px",background:remarksColor+"15",borderRadius:7,fontSize:12,fontWeight:800,color:remarksColor,textAlign:"center" }}>
                            {r.remarks==="MATCHED" ? "✅ MATCHED" : `⚠️ ${r.remarks}`}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {adminTab==="channels"&&(
            <div>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8 }}>
                <div style={PT}>💳 Sales Channels</div>
                <input type="date" value={reportDate} onChange={e=>setReportDate(e.target.value)} style={{ padding:"6px 10px",borderRadius:7,border:`1px solid ${C.border}`,background:"white",color:C.text,fontSize:11 }}/>
              </div>
              <div style={SR}>
                <SB label="Cash" val={`₱${Object.entries(rSum.pmSales).filter(([k])=>PAYMENT_METHODS.find(p=>p.key===k&&p.type==="cash")).reduce((s,[,d])=>s+d.sales,0).toFixed(0)}`} color={C.success}/>
                <SB label="Cashless" val={`₱${Object.entries(rSum.pmSales).filter(([k])=>PAYMENT_METHODS.find(p=>p.key===k&&p.type==="cashless")).reduce((s,[,d])=>s+d.sales,0).toFixed(0)}`} color={C.info}/>
                <SB label="Online" val={`₱${Object.entries(rSum.pmSales).filter(([k])=>PAYMENT_METHODS.find(p=>p.key===k&&p.type==="online")).reduce((s,[,d])=>s+d.sales,0).toFixed(0)}`} color="#db2777"/>
              </div>
              {PAYMENT_METHODS.map(p=>{const d=rSum.pmSales[p.key];if(!d?.sales)return null;return(
                <div key={p.key} style={{ display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"white",borderRadius:10,marginBottom:8,border:`1px solid ${C.border}`,boxShadow:C.shadow }}>
                  <span style={{ fontSize:22 }}>{p.emoji}</span>
                  <div style={{ flex:1 }}><div style={{ fontWeight:700,fontSize:13 }}>{p.label}</div><div style={{ fontSize:10,color:C.text3 }}>{d.count} orders · {p.type}</div></div>
                  <div style={{ fontWeight:900,fontSize:18,color:p.color }}>₱{d.sales.toFixed(2)}</div>
                </div>
              );})}
              {Object.keys(rSum.pmSales).length===0&&<div style={EM}>Walang sales</div>}
            </div>
          )}

          {adminTab==="deposit"&&(
            <div>
              <div style={PT}>🏦 Bank Deposit Checker</div>
              <div style={{ background:"white",borderRadius:14,padding:16,border:`1px solid ${C.border}`,boxShadow:C.shadow,marginBottom:16 }}>
                <div style={{ fontSize:11,color:C.text3,fontWeight:700,marginBottom:12 }}>CHECK DEPOSIT VS ACTUAL CASH SALES</div>
                <div style={{ display:"flex",gap:8,marginBottom:10,flexWrap:"wrap" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:10,color:C.text3,marginBottom:4 }}>Date From</div>
                    <input type="date" value={depositFrom} onChange={e=>setDepositFrom(e.target.value)} style={{ width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,background:"white",color:C.text,fontSize:12,boxSizing:"border-box" }}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:10,color:C.text3,marginBottom:4 }}>Date To</div>
                    <input type="date" value={depositTo} onChange={e=>setDepositTo(e.target.value)} style={{ width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,background:"white",color:C.text,fontSize:12,boxSizing:"border-box" }}/>
                  </div>
                </div>
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:10,color:C.text3,marginBottom:4 }}>Deposit Amount (Cash lang)</div>
                  <input type="number" value={depositAmt} onChange={e=>setDepositAmt(e.target.value)} placeholder="₱0.00"
                    style={{ width:"100%",padding:"12px",fontSize:22,fontWeight:900,borderRadius:8,border:`2px solid ${C.border}`,background:"white",color:C.warning,outline:"none",boxSizing:"border-box" }}/>
                </div>
                <div style={{ display:"flex",gap:8 }}>
                  <button onClick={checkDeposit} disabled={depositLoading}
                    style={{ flex:2,padding:"14px",background:depositLoading?C.bg3:C.accent,border:"none",borderRadius:10,color:depositLoading?C.text3:"white",fontWeight:900,fontSize:15,cursor:depositLoading?"not-allowed":"pointer" }}>
                    {depositLoading?"🔍 Checking...":"🔍 Check Deposit"}
                  </button>
                  {depositResult&&(
                    <button onClick={clearDeposit}
                      style={{ flex:1,padding:"14px",background:C.dangerBg,border:`1px solid ${C.danger}`,borderRadius:10,color:C.danger,fontWeight:900,fontSize:14,cursor:"pointer" }}>
                      ✕ Clear
                    </button>
                  )}
                </div>
              </div>

              {/* DEPOSIT RESULT — with clear button */}
              {depositResult&&(
                <div style={{ background:depositResult.matched?C.successBg:C.dangerBg,borderRadius:14,padding:16,border:`2px solid ${depositResult.matched?C.success:C.danger}` }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
                    <div>
                      <div style={{ fontSize:22 }}>{depositResult.matched?"✅":"❌"}</div>
                      <div style={{ fontSize:16,fontWeight:900,color:depositResult.matched?C.success:C.danger,marginTop:4 }}>
                        {depositResult.matched?"DEPOSIT MATCHED!":"DEPOSIT MISMATCH!"}
                      </div>
                    </div>
                    <button onClick={clearDeposit}
                      style={{ padding:"6px 12px",background:"white",border:`1px solid ${C.border}`,borderRadius:8,color:C.text2,fontWeight:700,fontSize:12,cursor:"pointer" }}>
                      ✕ Close
                    </button>
                  </div>
                  {[
                    {label:"Total Sales (All)",val:`₱${depositResult.totalSales.toFixed(2)}`},
                    {label:"Cash Sales Only",val:`₱${depositResult.cashSales.toFixed(2)}`},
                    {label:"Amount Deposited",val:`₱${depositResult.deposit.toFixed(2)}`,bold:true},
                  ].map(r=>(
                    <div key={r.label} style={{ display:"flex",justifyContent:"space-between",fontSize:13,padding:"7px 0",borderBottom:`1px solid ${depositResult.matched?C.success+"33":C.danger+"33"}` }}>
                      <span style={{ color:C.text2 }}>{r.label}</span>
                      <span style={{ fontWeight:r.bold?900:700,color:r.bold?C.warning:C.text }}>{r.val}</span>
                    </div>
                  ))}
                  <div style={{ display:"flex",justifyContent:"space-between",fontSize:20,fontWeight:900,padding:"12px 0" }}>
                    <span>{depositResult.diff>=0?"SURPLUS":"SHORT"}</span>
                    <span style={{ color:depositResult.diff>=0?C.success:C.danger }}>{depositResult.diff>=0?"+":""}₱{depositResult.diff.toFixed(2)}</span>
                  </div>
                  <div style={{ fontSize:10,color:C.text3 }}>{depositFrom} to {depositTo} · {depositResult.count} transactions</div>
                </div>
              )}
            </div>
          )}

          {adminTab==="dtr"&&(
            <div>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8 }}>
                <div style={PT}>🕐 DTR — {reportDate}</div>
                <div style={{ display:"flex",gap:8 }}>
                  <input type="date" value={reportDate} onChange={e=>setReportDate(e.target.value)} style={{ padding:"6px 10px",borderRadius:7,border:`1px solid ${C.border}`,background:"white",color:C.text,fontSize:11 }}/>
                  <button onClick={()=>printWin(`<div class="c"><div class="brand">LIMJOE</div><div style="font-size:9px;color:#666">DTR — ${reportDate}</div></div>${employees.flatMap(emp=>BRANCHES.map(b=>{const logs=getEmpDTR(emp.id,b.id,reportDate);if(!logs.length)return"";const{hrs,mins,totalMins}=calcDTRHours(logs);return`<div class="dv"></div><div class="sec">${emp.name} — ${b.name}</div><table><tr><th>Type</th><th>In</th><th>Out</th><th>Hrs</th></tr>${logs.map((l,i)=>{let h="—";if(l.out){const dm=calcMins(l.in,l.out);h=`${Math.floor(dm/60)}h${dm%60}m`;}return`<tr><td>${i===0?"AM":`B${i}`}</td><td>${l.in}</td><td>${l.out||"—"}</td><td>${h}</td></tr>`}).join("")}<tr><td colspan="3"><b>TOTAL HOURS</b></td><td><b>${formatHrs(totalMins)}</b></td></tr></table>`;}).filter(Boolean)).join("")}<div class="dv"></div><div class="c">*** END OF DTR ***</div>`)}
                    style={{ padding:"6px 12px",background:C.accent,border:"none",borderRadius:7,color:"white",fontWeight:700,fontSize:11,cursor:"pointer" }}>🖨️ Print</button>
                </div>
              </div>
              {employees.map(emp=>BRANCHES.map(branch=>{
                const logs=getEmpDTR(emp.id,branch.id,reportDate);
                if(!logs.length)return null;
                const {hrs,mins,totalMins}=calcDTRHours(logs);
                const isStillIn=!logs[logs.length-1].out;
                return (
                  <div key={`${emp.id}_${branch.id}`} style={{ background:"white",borderRadius:10,padding:"12px 14px",marginBottom:8,border:`1px solid ${C.border}`,boxShadow:C.shadow }}>
                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
                      <div>
                        <span style={{ fontWeight:700,fontSize:13,color:C.text }}>{emp.emoji} {emp.name}</span>
                        <span style={{ fontSize:10,color:C.text3,marginLeft:8 }}>📍 {branch.name}</span>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontWeight:900,fontSize:14,color:isStillIn?C.warning:C.success }}>
                          {isStillIn?`${hrs}h ${mins}m (ongoing)`:formatHrs(totalMins)}
                        </div>
                        {!isStillIn&&<div style={{ fontSize:9,color:C.text3 }}>✅ Completed</div>}
                      </div>
                    </div>
                    {logs.map((l,i)=>{
                      const dur=l.out?formatHrs(calcMins(l.in,l.out)):"ongoing";
                      return (
                        <div key={i} style={{ display:"flex",gap:12,fontSize:11,padding:"3px 0",borderTop:`1px solid ${C.border}` }}>
                          <span style={{ color:C.text3,minWidth:40 }}>{i===0?"AM":`Break ${i}`}</span>
                          <span style={{ color:C.success }}>🟢 <b>{l.in}</b></span>
                          <span style={{ color:l.out?C.danger:C.warning }}>{l.out?<>🔴 <b>{l.out}</b></>:"⏳ Still in"}</span>
                          <span style={{ color:C.text3 }}>{dur}</span>
                        </div>
                      );
                    })}
                    {!isStillIn&&totalMins>0&&(
                      <div style={{ marginTop:6,padding:"6px 8px",background:C.successBg,borderRadius:6,fontSize:11,color:C.success,fontWeight:700,textAlign:"center" }}>
                        Total Hours Worked: {formatHrs(totalMins)}
                      </div>
                    )}
                  </div>
                );
              }))}
              {employees.every(emp=>BRANCHES.every(b=>!getEmpDTR(emp.id,b.id,reportDate).length))&&<div style={EM}>Walang DTR records</div>}
            </div>
          )}

          {adminTab==="payroll"&&(
            <div>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8 }}>
                <div style={PT}>💰 Payroll Summary</div>
                <div style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
                  <input type="date" value={payrollFrom} onChange={e=>setPayrollFrom(e.target.value)} style={{ padding:"6px 10px",borderRadius:7,border:`1px solid ${C.border}`,background:"white",color:C.text,fontSize:11 }}/>
                  <span style={{ fontSize:11,color:C.text3 }}>to</span>
                  <input type="date" value={payrollTo} onChange={e=>setPayrollTo(e.target.value)} style={{ padding:"6px 10px",borderRadius:7,border:`1px solid ${C.border}`,background:"white",color:C.text,fontSize:11 }}/>
                  <button onClick={()=>printWin(`<div class="c"><div class="brand">LIMJOE</div><div style="font-size:9px;color:#666">PAYROLL SUMMARY<br>${payrollFrom} to ${payrollTo}</div></div><div class="dv"></div><table><tr><th>Employee</th><th>Role</th><th>Work Days</th><th>Total Hours</th></tr>${payrollRows.map(r=>`<tr><td>${r.name}</td><td>${r.role}</td><td>${r.workDays}</td><td>${r.totalHrs}</td></tr>`).join("")}</table>`)}
                    style={{ padding:"6px 12px",background:C.accent,border:"none",borderRadius:7,color:"white",fontWeight:700,fontSize:11,cursor:"pointer" }}>🖨️ Print</button>
                </div>
              </div>
              <div style={{ background:C.infoBg,borderRadius:10,padding:"10px 14px",marginBottom:14,border:`1px solid ${C.info}` }}>
                <div style={{ fontSize:11,color:C.info,fontWeight:700 }}>ℹ️ Cutoff: 10th at 25th ng buwan</div>
                <div style={{ fontSize:11,color:C.text2,marginTop:4 }}>Hindi kasama ang oras ng break sa Total Hours — kinakaltas na ito automatic.</div>
              </div>
              {payrollRows.map(emp=>(
                <div key={emp.id} style={{ background:"white",borderRadius:12,padding:"14px 16px",marginBottom:10,border:`1px solid ${C.border}`,boxShadow:C.shadow }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <span style={{ fontSize:22 }}>{emp.emoji}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:800,fontSize:14,color:C.text }}>{emp.name}</div>
                      <div style={{ fontSize:11,color:ROLE_COLOR[emp.role],fontWeight:700 }}>{emp.role.toUpperCase()}</div>
                    </div>
                    <div style={{ textAlign:"center",minWidth:70 }}>
                      <div style={{ fontWeight:900,fontSize:18,color:C.info }}>{emp.workDays}</div>
                      <div style={{ fontSize:9,color:C.text3 }}>Work Days</div>
                    </div>
                    <div style={{ textAlign:"center",minWidth:90 }}>
                      <div style={{ fontWeight:900,fontSize:16,color:C.success }}>{emp.totalHrs}</div>
                      <div style={{ fontSize:9,color:C.text3 }}>Total Hours</div>
                    </div>
                  </div>
                </div>
              ))}
              {payrollRows.length===0 && <div style={EM}>Walang employees</div>}
            </div>
          )}

          {adminTab==="employees"&&(
            <div>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
                <div style={PT}>👥 Employee Management</div>
                <button onClick={()=>setShowAddEmp(s=>!s)}
                  style={{ padding:"8px 16px",background:showAddEmp?C.bg3:C.primary,border:`1px solid ${showAddEmp?C.border:C.primary}`,borderRadius:8,color:showAddEmp?C.text2:"white",fontWeight:700,fontSize:12,cursor:"pointer" }}>
                  {showAddEmp ? "✕ Cancel" : "+ Add Employee"}
                </button>
              </div>

              <div style={{ background:C.infoBg,borderRadius:10,padding:"10px 14px",marginBottom:14,border:`1px solid ${C.info}` }}>
                <div style={{ fontSize:11,color:C.info,fontWeight:700 }}>🔐 Security Note</div>
                <div style={{ fontSize:11,color:C.text2,marginTop:4 }}>PINs are only visible to Owner and Admin. Managers and Cashiers cannot see PINs.</div>
              </div>

              {showAddEmp && (
                <div style={{ background:"white",borderRadius:12,padding:"16px",marginBottom:16,border:`2px solid ${C.primary}33`,boxShadow:C.shadow }}>
                  <div style={{ fontSize:12,color:C.text3,fontWeight:700,marginBottom:10 }}>NEW EMPLOYEE</div>
                  <div style={{ display:"flex",gap:8,marginBottom:8,flexWrap:"wrap" }}>
                    <input value={newEmpName} onChange={e=>setNewEmpName(e.target.value)} placeholder="Pangalan"
                      style={{ flex:2,minWidth:140,padding:"9px 11px",fontSize:13,borderRadius:8,border:`1.5px solid ${C.border}`,outline:"none" }}/>
                    <input value={newEmpPin} onChange={e=>setNewEmpPin(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="4-digit PIN" maxLength={4}
                      style={{ flex:1,minWidth:100,padding:"9px 11px",fontSize:13,borderRadius:8,border:`1.5px solid ${C.border}`,outline:"none",fontFamily:"monospace",letterSpacing:2 }}/>
                  </div>
                  <div style={{ display:"flex",gap:8,marginBottom:12,flexWrap:"wrap" }}>
                    <select value={newEmpRole} onChange={e=>setNewEmpRole(e.target.value)}
                      style={{ flex:1,minWidth:130,padding:"9px 11px",fontSize:13,borderRadius:8,border:`1.5px solid ${C.border}`,background:"white" }}>
                      <option value="cashier">Cashier</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                    {newEmpRole !== "admin" && (
                      <select value={newEmpBranch} onChange={e=>setNewEmpBranch(parseInt(e.target.value))}
                        style={{ flex:1,minWidth:130,padding:"9px 11px",fontSize:13,borderRadius:8,border:`1.5px solid ${C.border}`,background:"white" }}>
                        {BRANCHES.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    )}
                  </div>
                  <button onClick={createEmployee}
                    style={{ width:"100%",padding:"11px",background:C.primary,border:"none",borderRadius:8,color:"white",fontWeight:800,fontSize:13,cursor:"pointer" }}>
                    Save Employee
                  </button>
                </div>
              )}

              {employees.map(emp=>(
                <div key={emp.id} style={{ background:"white",borderRadius:12,padding:"14px 16px",marginBottom:10,border:`1px solid ${C.border}`,boxShadow:C.shadow }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <span style={{ fontSize:24 }}>{emp.emoji}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:800,fontSize:14,color:C.text }}>{emp.name}</div>
                      <div style={{ fontSize:11,color:C.text3 }}>
                        <span style={{ color:ROLE_COLOR[emp.role],fontWeight:700 }}>{emp.role.toUpperCase()}</span>
                        {emp.branchId?` · ${BRANCHES.find(b=>b.id===emp.branchId)?.name}`:" · All Branches"}
                      </div>
                    </div>
                    <div style={{ background:C.bg3,borderRadius:8,padding:"6px 14px",fontFamily:"monospace",fontSize:18,fontWeight:900,color:C.warning,letterSpacing:4,border:`1px solid ${C.border}` }}>
                      {emp.pin}
                    </div>
                    {emp.id !== currentUser?.id && (
                      <button onClick={()=>deactivateEmployee(emp)}
                        style={{ padding:"7px 12px",background:C.dangerBg,border:`1px solid ${C.danger}`,borderRadius:8,color:C.danger,fontWeight:700,fontSize:11,cursor:"pointer" }}>
                        Deactivate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

const Toast=({notif})=>(
  <div style={{ position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",padding:"10px 20px",borderRadius:30,fontWeight:700,fontSize:13,color:"white",zIndex:9999,background:notif.type==="err"?"#dc2626":"#16a34a",whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,0.2)" }}>
    {notif.msg}
  </div>
);
const SB=({label,val,color,big})=>(
  <div style={{ background:"white",border:`1px solid #e2e8f0`,borderRadius:10,padding:big?"13px 14px":"9px 12px",textAlign:"center",flex:1,minWidth:70,boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
    <div style={{ fontSize:big?19:14,fontWeight:900,color }}>{val}</div>
    <div style={{ fontSize:9,color:"#64748b",marginTop:2 }}>{label}</div>
  </div>
);
const PT={fontSize:16,fontWeight:900,color:"#0f172a",marginBottom:12};
const SR={display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"};
const SEC={fontSize:10,color:"#64748b",letterSpacing:1,fontWeight:700,marginBottom:8,marginTop:14};
const TR={display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #f1f5f9",fontSize:12,gap:8};
const EM={textAlign:"center",color:"#94a3b8",padding:"18px 0",fontSize:12};
