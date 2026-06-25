import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
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
    if (!res.ok) { lastSbError = `${res.status}: ${parsed?.message || parsed?.hint || text || "unknown error"}`; return null; }
    lastSbError = null; return parsed;
  } catch (e) { lastSbError = e.message; return null; }
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
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
const DEFAULT_CATEGORIES = [
  { key: "JUICE", label: "JUICE", color: "#d97706" },
  { key: "MILKTEA", label: "MILKTEA", color: "#7c3aed" },
  { key: "CREAM CHEESE", label: "CREAM CHEESE", color: "#ea580c" },
  { key: "FRUIT TEA", label: "FRUIT TEA", color: "#16a34a" },
  { key: "YOGURT", label: "YOGURT", color: "#db2777" },
  { key: "SMOOTHIES", label: "SMOOTHIES", color: "#2563eb" },
  { key: "ADD-ONS", label: "ADD-ONS", color: "#64748b" },
];
const BORDER_COLORS = ["#d97706","#7c3aed","#db2777","#2563eb","#16a34a","#ea580c","#dc2626","#0284c7","#65a30d","#d97706"];
const todayStr = () => new Date().toISOString().split("T")[0];
const nowStr = () => new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const nowFull = () => new Date().toLocaleString("en-PH");
const applyDiscount = (p) => Math.round((p / 1.12) * 0.80 * 100) / 100;
const calcMins = (inTime, outTime) => { const [ih,im]=inTime.split(":").map(Number); const [oh,om]=outTime.split(":").map(Number); return (oh*60+om)-(ih*60+im); };
const formatHrs = (mins) => `${Math.floor(mins/60)}h ${mins%60}m`;
const SALES_KEY = "limjoe-sales-v11"; const DTR_KEY = "limjoe-dtr-v11"; const EXP_KEY = "limjoe-exp-v11";

const C = {
  bg:"#f8fafc",bg2:"#ffffff",bg3:"#f1f5f9",border:"#e2e8f0",border2:"#cbd5e1",
  text:"#0f172a",text2:"#334155",text3:"#64748b",
  primary:"#16a34a",primaryDark:"#15803d",accent:"#7c3aed",
  danger:"#dc2626",dangerBg:"#fef2f2",warning:"#d97706",warningBg:"#fffbeb",
  info:"#2563eb",infoBg:"#eff6ff",success:"#16a34a",successBg:"#f0fdf4",
  card:"#ffffff",shadow:"0 1px 3px rgba(0,0,0,0.1)",
};

const printWin = (html) => {
  const w = window.open("", "_blank");
  w.document.write(`<html><head><title>Limjoe</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;font-size:12px;padding:12px;max-width:320px}.c{text-align:center}.brand{font-size:20px;font-weight:900;letter-spacing:5px}.dv{border-top:1px dashed #999;margin:8px 0}.row{display:flex;justify-content:space-between;padding:3px 0}.big{font-size:15px;font-weight:900}.grn{color:#16a34a}.sec{font-size:10px;font-weight:700;letter-spacing:1px;color:#666;margin:10px 0 4px}table{width:100%;border-collapse:collapse;font-size:11px}th{background:#f3f4f6;padding:4px 6px;text-align:left;font-size:10px}td{padding:4px 6px;border-bottom:1px solid #e5e7eb}@media print{.np{display:none}}</style></head><body>${html}<br/><button class="np" onclick="window.print();window.close()" style="width:100%;padding:12px;font-size:14px;cursor:pointer;margin-top:8px;background:#16a34a;color:#fff;border:none;border-radius:8px;font-weight:900">🖨️ I-PRINT</button></body></html>`);
  w.document.close();
};

// ─── EXCEL BULK UPLOAD HELPERS ────────────────────────────────────────────────
function parseSheetRows(workbook, sheetName) {
  const ws = workbook.Sheets[sheetName];
  if (!ws) return [];
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1 });
  if (raw.length < 3) return [];
  // Row 3 (index 2) = headers, Row 4 (index 3) = guide/example, Row 5+ = data
  const headers = raw[2].map(h => String(h||"").replace(/\*/g,"").replace(/\s*\(.*?\)/g,"").trim().toLowerCase().replace(/\s+/g,"_"));
  const rows = [];
  for (let i = 4; i < raw.length; i++) {
    const row = raw[i];
    if (!row || row.every(v => v===""||v===undefined||v===null)) continue;
    const obj = {};
    headers.forEach((h,idx) => { obj[h] = row[idx]!==undefined ? row[idx] : null; });
    rows.push(obj);
  }
  return rows;
}

// ─── BULK UPLOAD MODAL ────────────────────────────────────────────────────────
function BulkUploadModal({ onClose, toast, onReloadProducts, onReloadInventory }) {
  const [activeType, setActiveType] = useState("products");
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState("pick");
  const fileRef = useRef();

  const TYPES = {
    products: { label: "Products & Prices", icon: "🛍️", color: C.accent, desc: "Update names, prices, categories", required: ["product_name","category","price","is_available"] },
    inventory: { label: "Raw Materials & Recipes", icon: "📦", color: C.info, desc: "Update stock, recipes, ingredients", required: ["material_name","category","unit","stock_qty","reorder_point"] },
  };
  const cfg = TYPES[activeType];

  async function handleFile(e) {
    const f = e.target.files[0]; if (!f) return;
    const data = await f.arrayBuffer();
    const wb = XLSX.read(data);
    let rows = [], recipeRows = [];
    if (activeType === "products") { rows = parseSheetRows(wb, "Products"); }
    else { rows = parseSheetRows(wb, "Raw Materials"); recipeRows = parseSheetRows(wb, "Recipes"); }
    const valid = [], invalid = [];
    rows.forEach((row, i) => {
      const missing = cfg.required.filter(f => row[f]===undefined||row[f]===null||row[f]==="");
      if (missing.length) invalid.push({ row: i+5, data: row, missing });
      else valid.push(row);
    });
    setPreview({ valid, invalid, recipeRows });
    setStep("preview");
  }

  async function handleUpload() {
    setUploading(true);
    const summary = { updated: 0, recipes: 0, errors: [] };
    try {
      if (activeType === "products") {
        for (const row of preview.valid) {
          const { error } = await sb("products", "POST",
            [{ name: String(row.product_name).trim(), category: String(row.category).trim(), price: parseFloat(row.price), description: row.description ? String(row.description).trim() : null, is_available: String(row.is_available).toUpperCase()==="TRUE" }],
            { "Prefer": "resolution=merge-duplicates,return=representation" }
          ) || {};
          if (lastSbError) summary.errors.push(`${row.product_name}: ${lastSbError}`);
          else summary.updated++;
        }
        onReloadProducts?.();
      } else {
        // Upsert raw_materials
        for (const row of preview.valid) {
          await sb("raw_materials", "POST",
            [{ name: String(row.material_name).trim(), category: String(row.category).trim(), unit: String(row.unit).trim(), stock_qty: parseFloat(row.stock_qty), reorder_pt: parseFloat(row.reorder_point), cost_per_unit: row.cost_per_unit ? parseFloat(row.cost_per_unit) : 0 }],
            { "Prefer": "resolution=merge-duplicates,return=representation" }
          );
          if (lastSbError) summary.errors.push(`${row.material_name}: ${lastSbError}`);
          else summary.updated++;
        }
        // Upsert recipes
        for (const row of preview.recipeRows || []) {
          if (!row.product_name || !row.material_name || !row.qty_per_unit) continue;
          const prod = await sb(`products?name=eq.${encodeURIComponent(String(row.product_name).trim())}&select=id`);
          const mat = await sb(`raw_materials?name=eq.${encodeURIComponent(String(row.material_name).trim())}&select=id`);
          if (!prod?.[0] || !mat?.[0]) { summary.errors.push(`Recipe skipped: "${row.product_name}" o "${row.material_name}" hindi makita.`); continue; }
          await sb("product_ingredients", "POST",
            [{ product_id: prod[0].id, material_id: mat[0].id, qty_per_unit: parseFloat(row.qty_per_unit) }],
            { "Prefer": "resolution=merge-duplicates,return=representation" }
          );
          if (lastSbError) summary.errors.push(`Recipe ${row.product_name}→${row.material_name}: ${lastSbError}`);
          else summary.recipes++;
        }
        onReloadInventory?.();
      }
    } catch (err) { summary.errors.push("Unexpected: " + err.message); }
    setResult(summary); setUploading(false); setStep("done");
  }

  function reset() { setPreview(null); setResult(null); setStep("pick"); if (fileRef.current) fileRef.current.value = ""; }

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16 }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"white",borderRadius:16,width:"min(640px,95vw)",maxHeight:"90vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.25)",fontFamily:"sans-serif" }}>
        <div style={{ padding:"20px 24px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div style={{ fontWeight:900,fontSize:18,color:C.text }}>📤 Bulk Upload</div>
          <button onClick={onClose} style={{ border:"none",background:C.bg3,borderRadius:8,width:34,height:34,cursor:"pointer",fontSize:16,color:C.text3 }}>✕</button>
        </div>
        <div style={{ padding:"20px 24px" }}>
          {/* Type tabs */}
          <div style={{ display:"flex",gap:8,marginBottom:20 }}>
            {Object.entries(TYPES).map(([key,t])=>(
              <div key={key} onClick={()=>{setActiveType(key);reset();}} style={{ flex:1,padding:"12px 14px",borderRadius:10,border:`2px solid ${activeType===key?t.color:C.border}`,cursor:"pointer",background:activeType===key?t.color+"10":C.bg }}>
                <div style={{ fontWeight:700,fontSize:13,color:activeType===key?t.color:C.text3 }}>{t.icon} {t.label}</div>
                <div style={{ fontSize:11,color:C.text3,marginTop:2 }}>{t.desc}</div>
              </div>
            ))}
          </div>

          {step==="pick"&&(
            <>
              <div onClick={()=>fileRef.current?.click()} style={{ border:`2px dashed ${C.border}`,borderRadius:12,padding:"36px 24px",textAlign:"center",cursor:"pointer",background:C.bg }}>
                <div style={{ fontSize:38 }}>📂</div>
                <div style={{ fontWeight:700,color:C.text,marginTop:8 }}>Click para pumili ng Excel file</div>
                <div style={{ fontSize:12,color:C.text3,marginTop:4 }}>.xlsx format lang · Max 10MB</div>
                <div style={{ display:"inline-block",marginTop:12,padding:"9px 22px",background:cfg.color,color:"white",borderRadius:8,fontWeight:700,fontSize:13 }}>Browse</div>
              </div>
              <input ref={fileRef} type="file" accept=".xlsx" style={{ display:"none" }} onChange={handleFile}/>
              <div style={{ marginTop:12,padding:"10px 14px",background:C.infoBg,borderRadius:8,fontSize:12,color:C.info }}>
                💡 I-download ang templates: <b>products_upload_template.xlsx</b> at <b>raw_materials_recipes_template.xlsx</b>
              </div>
            </>
          )}

          {step==="preview"&&preview&&(
            <>
              <div style={{ display:"flex",gap:10,marginBottom:14 }}>
                <div style={{ flex:1,padding:"12px",background:C.successBg,borderRadius:8,border:`1px solid #86efac`,textAlign:"center" }}>
                  <div style={{ fontSize:22,fontWeight:900,color:C.success }}>{preview.valid.length}</div>
                  <div style={{ fontSize:11,color:C.success }}>Valid rows</div>
                </div>
                <div style={{ flex:1,padding:"12px",background:C.dangerBg,borderRadius:8,border:`1px solid #fecaca`,textAlign:"center" }}>
                  <div style={{ fontSize:22,fontWeight:900,color:C.danger }}>{preview.invalid.length}</div>
                  <div style={{ fontSize:11,color:C.danger }}>May errors (skip)</div>
                </div>
                {activeType==="inventory"&&(
                  <div style={{ flex:1,padding:"12px",background:C.infoBg,borderRadius:8,border:`1px solid #bfdbfe`,textAlign:"center" }}>
                    <div style={{ fontSize:22,fontWeight:900,color:C.info }}>{preview.recipeRows?.length||0}</div>
                    <div style={{ fontSize:11,color:C.info }}>Recipe rows</div>
                  </div>
                )}
              </div>
              <div style={{ maxHeight:240,overflow:"auto",borderRadius:8,border:`1px solid ${C.border}`,marginBottom:14 }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                  <thead><tr style={{ background:C.bg3 }}><th style={TH}>Row</th><th style={TH}>{activeType==="products"?"Product":"Material"}</th><th style={TH}>{activeType==="products"?"Price":"Stock"}</th><th style={TH}>Status</th></tr></thead>
                  <tbody>
                    {preview.valid.slice(0,20).map((row,i)=>(
                      <tr key={i}><td style={TD}>{i+5}</td><td style={TD}>{row.product_name||row.material_name}</td><td style={TD}>{row.price!==undefined?`₱${row.price}`:`${row.stock_qty} ${row.unit}`}</td><td style={TD}><span style={{ background:C.successBg,color:C.success,padding:"2px 7px",borderRadius:20,fontSize:10,fontWeight:700 }}>✓ OK</span></td></tr>
                    ))}
                    {preview.invalid.map((item,i)=>(
                      <tr key={"e"+i} style={{ background:"#fff5f5" }}><td style={TD}>{item.row}</td><td style={TD}>{item.data.product_name||item.data.material_name||"—"}</td><td style={TD}>Missing: {item.missing.join(", ")}</td><td style={TD}><span style={{ background:C.dangerBg,color:C.danger,padding:"2px 7px",borderRadius:20,fontSize:10,fontWeight:700 }}>✗ Skip</span></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display:"flex",gap:8,justifyContent:"flex-end" }}>
                <button onClick={reset} style={SecBtn}>← Back</button>
                <button onClick={handleUpload} disabled={uploading||preview.valid.length===0} style={{ ...PriBtn(cfg.color), opacity:uploading?0.7:1 }}>
                  {uploading?"Uploading…":`Upload ${preview.valid.length} rows`}
                </button>
              </div>
            </>
          )}

          {step==="done"&&result&&(
            <>
              <div style={{ borderRadius:10,padding:"16px 18px",background:result.errors.length?C.warningBg:C.successBg,border:`1px solid ${result.errors.length?"#fed7aa":"#86efac"}`,marginBottom:14 }}>
                <div style={{ fontWeight:800,fontSize:16,color:result.errors.length?C.warning:C.success }}>
                  {result.errors.length?"⚠️ Done na may ilang issues":"✅ Upload successful!"}
                </div>
                <div style={{ fontSize:13,color:C.text,marginTop:6 }}>
                  <b>{result.updated}</b> records updated · <b>{result.recipes}</b> recipe links
                </div>
                {result.errors.length>0&&<ul style={{ marginTop:8,paddingLeft:18,fontSize:12,color:C.danger }}>{result.errors.map((e,i)=><li key={i}>{e}</li>)}</ul>}
              </div>
              <div style={{ display:"flex",gap:8,justifyContent:"flex-end" }}>
                <button onClick={reset} style={SecBtn}>Upload muli</button>
                <button onClick={onClose} style={PriBtn(cfg.color)}>Done</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCT EDITOR MODAL ─────────────────────────────────────────────────────
function ProductEditorModal({ onClose, toast, userRole, categories, onReloadProducts }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [searchProd, setSearchProd] = useState("");
  const [newProd, setNewProd] = useState({ name:"", category: categories[0]?.key||"", price:"", price_medium:"", price_large:"", price_online_medium:"", price_online_large:"", description:"", is_available: true });
  const isAdmin = ROLE_LEVEL[userRole] >= 3;

  useEffect(()=>{ loadProducts(); }, []);

  async function loadProducts() {
    setLoading(true);
    const data = await sb("products?select=*&order=sort_order.asc,name.asc");
    if (data) setProducts(data);
    setLoading(false);
  }

  async function saveEdit(id) {
    // Set price to the medium price for backward compatibility
    if (editData.price_medium) editData.price = editData.price_medium;
    const res = await sb(`products?id=eq.${id}`, "PATCH", editData, { "Prefer":"return=representation" });
    if (lastSbError) { toast("Hindi na-save: " + lastSbError, "err"); return; }
    toast("✅ Product updated!"); setEditId(null); loadProducts(); onReloadProducts?.();
  }

  async function addProduct() {
    if (!newProd.name.trim()||(!newProd.price_medium&&!newProd.price_large)) { toast("Lagyan ng name at kahit isang price!", "err"); return; }
    const res = await sb("products", "POST", [{ name: newProd.name.trim(), category: newProd.category, price: parseFloat(newProd.price_medium||newProd.price_large||0), price_medium: newProd.price_medium?parseFloat(newProd.price_medium):null, price_large: newProd.price_large?parseFloat(newProd.price_large):null, price_online_medium: newProd.price_online_medium?parseFloat(newProd.price_online_medium):null, price_online_large: newProd.price_online_large?parseFloat(newProd.price_online_large):null, description: newProd.description||null, is_available: newProd.is_available }]);
    if (lastSbError) { toast("Hindi na-add: "+lastSbError, "err"); return; }
    toast("✅ Product added!"); setNewProd({ name:"", category: categories[0]?.key||"", price:"", price_medium:"", price_large:"", price_online_medium:"", price_online_large:"", description:"", is_available:true }); setShowAdd(false); loadProducts(); onReloadProducts?.();
  }

  async function deleteProduct(id, name) {
    if (!isAdmin) { toast("Admin/Owner lang ang pwedeng mag-delete!", "err"); return; }
    if (!confirm(`Delete "${name}"? Hindi na mababalik!`)) return;
    await sb(`products?id=eq.${id}`, "DELETE");
    if (lastSbError) { toast("Hindi na-delete: "+lastSbError, "err"); return; }
    toast("Deleted: " + name); loadProducts(); onReloadProducts?.();
  }

  const filteredProds = searchProd.trim() ? products.filter(p=>p.name.toLowerCase().includes(searchProd.toLowerCase())||p.category.toLowerCase().includes(searchProd.toLowerCase())) : products;
  const grouped = filteredProds.reduce((acc, p) => { if (!acc[p.category]) acc[p.category]=[]; acc[p.category].push(p); return acc; }, {});

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16 }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"white",borderRadius:16,width:"min(680px,95vw)",maxHeight:"92vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.25)",fontFamily:"sans-serif" }}>
        <div style={{ padding:"18px 22px 12px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"white",zIndex:10 }}>
          <div style={{ fontWeight:900,fontSize:18,color:C.text }}>🛍️ Product Editor</div>
          <div style={{ display:"flex",gap:8 }}>
            {isAdmin&&<button onClick={()=>setShowAdd(s=>!s)} style={{ padding:"7px 14px",background:showAdd?C.dangerBg:C.primary,border:"none",borderRadius:8,color:"white",fontWeight:700,fontSize:12,cursor:"pointer" }}>{showAdd?"✕ Cancel":"+ Add Product"}</button>}
            <button onClick={onClose} style={{ border:"none",background:C.bg3,borderRadius:8,width:34,height:34,cursor:"pointer",fontSize:16,color:C.text3 }}>✕</button>
          </div>
        </div>
        <div style={{ padding:"10px 22px",borderBottom:`1px solid ${C.border}`,background:"white" }}>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:14,color:C.text3 }}>🔍</span>
            <input value={searchProd} onChange={e=>setSearchProd(e.target.value)} placeholder="Hanapin ang product..." style={{ ...InputStyle,width:"100%",boxSizing:"border-box",paddingLeft:32 }}/>
            {searchProd&&<button onClick={()=>setSearchProd("")} style={{ position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",border:"none",background:"transparent",cursor:"pointer",fontSize:14,color:C.text3 }}>✕</button>}
          </div>
          {searchProd&&<div style={{ fontSize:11,color:C.text3,marginTop:4 }}>{filteredProds.length===0?<span style={{ color:C.danger }}>❌ Walang nahanap na "{searchProd}"</span>:<span style={{ color:C.success }}>✅ {filteredProds.length} product(s) nahanap</span>}</div>}
        </div>

        <div style={{ padding:"16px 22px" }}>
          {/* Add product form */}
          {showAdd&&isAdmin&&(
            <div style={{ background:C.successBg,borderRadius:12,padding:16,marginBottom:16,border:`1px solid #86efac` }}>
              <div style={{ fontWeight:700,fontSize:12,color:C.success,marginBottom:10 }}>NEW PRODUCT</div>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:8 }}>
                <input value={newProd.name} onChange={e=>setNewProd(p=>({...p,name:e.target.value}))} placeholder="Product name*" style={{ ...InputStyle,flex:2,minWidth:160 }}/>
                <select value={newProd.category} onChange={e=>setNewProd(p=>({...p,category:e.target.value}))} style={{ ...InputStyle,flex:1,minWidth:120 }}>
                  {categories.map(c=><option key={c.key} value={c.key}>{c.key}</option>)}
                </select>
              </div>
              {/* Price fields */}
              <div style={{ background:"white",borderRadius:8,padding:"10px 12px",marginBottom:8,border:`1px solid #86efac` }}>
                <div style={{ fontSize:10,fontWeight:700,color:C.success,marginBottom:6 }}>💰 PRICES (in-store)</div>
                <div style={{ display:"flex",gap:8,marginBottom:8 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:10,color:C.text3,marginBottom:3 }}>Medium (₱)</div>
                    <input value={newProd.price_medium} onChange={e=>setNewProd(p=>({...p,price_medium:e.target.value}))} placeholder="₱ Med" type="number" style={{ ...InputStyle,width:"100%",boxSizing:"border-box" }}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:10,color:C.text3,marginBottom:3 }}>Large (₱)</div>
                    <input value={newProd.price_large} onChange={e=>setNewProd(p=>({...p,price_large:e.target.value}))} placeholder="₱ Large" type="number" style={{ ...InputStyle,width:"100%",boxSizing:"border-box" }}/>
                  </div>
                </div>
                <div style={{ fontSize:10,fontWeight:700,color:C.text3,marginBottom:6 }}>🛵 ONLINE PRICES</div>
                <div style={{ display:"flex",gap:8 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:10,color:C.text3,marginBottom:3 }}>Online Med (₱)</div>
                    <input value={newProd.price_online_medium} onChange={e=>setNewProd(p=>({...p,price_online_medium:e.target.value}))} placeholder="₱ O.Med" type="number" style={{ ...InputStyle,width:"100%",boxSizing:"border-box" }}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:10,color:C.text3,marginBottom:3 }}>Online Large (₱)</div>
                    <input value={newProd.price_online_large} onChange={e=>setNewProd(p=>({...p,price_online_large:e.target.value}))} placeholder="₱ O.Large" type="number" style={{ ...InputStyle,width:"100%",boxSizing:"border-box" }}/>
                  </div>
                </div>
              </div>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:8 }}>
                <input value={newProd.description} onChange={e=>setNewProd(p=>({...p,description:e.target.value}))} placeholder="Description (optional)" style={{ ...InputStyle,flex:1 }}/>
              </div>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <label style={{ display:"flex",alignItems:"center",gap:6,fontSize:13,color:C.text }}>
                  <input type="checkbox" checked={newProd.is_available} onChange={e=>setNewProd(p=>({...p,is_available:e.target.checked}))}/> Available in POS
                </label>
                <button onClick={addProduct} style={PriBtn(C.success)}>Save Product</button>
              </div>
            </div>
          )}

          {loading ? <div style={{ textAlign:"center",padding:30,color:C.text3 }}>Loading products...</div> :
            Object.entries(grouped).map(([cat, prods])=>(
              <div key={cat} style={{ marginBottom:18 }}>
                <div style={{ fontSize:11,fontWeight:700,color:C.text3,letterSpacing:1,marginBottom:8,padding:"4px 0",borderBottom:`2px solid ${C.border}` }}>{cat}</div>
                {prods.map(p=>(
                  <div key={p.id} style={{ background:editId===p.id?C.infoBg:"white",borderRadius:10,padding:"10px 12px",marginBottom:6,border:`1px solid ${editId===p.id?C.info:C.border}` }}>
                    {editId===p.id ? (
                      <div>
                        <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:8 }}>
                          <input defaultValue={p.name} onChange={e=>setEditData(d=>({...d,name:e.target.value}))} placeholder="Name" style={{ ...InputStyle,flex:2,minWidth:140 }}/>
                          <select defaultValue={p.category} onChange={e=>setEditData(d=>({...d,category:e.target.value}))} style={{ ...InputStyle,flex:1 }}>
                            {categories.map(c=><option key={c.key} value={c.key}>{c.key}</option>)}
                          </select>
                        </div>
                        {/* Price fields — Medium, Large, Online Med, Online Large */}
                        <div style={{ background:C.bg3,borderRadius:8,padding:"8px 10px",marginBottom:8 }}>
                          <div style={{ fontSize:10,color:C.text3,fontWeight:700,marginBottom:6 }}>💰 PRICES</div>
                          <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:6 }}>
                            <div style={{ flex:1,minWidth:80 }}>
                              <div style={{ fontSize:9,color:C.text3,marginBottom:2 }}>Medium (₱)</div>
                              <input defaultValue={p.price_medium||p.price||""} onChange={e=>setEditData(d=>({...d,price_medium:parseFloat(e.target.value)||null}))} type="number" placeholder="₱" style={{ ...InputStyle,width:"100%",boxSizing:"border-box" }}/>
                            </div>
                            <div style={{ flex:1,minWidth:80 }}>
                              <div style={{ fontSize:9,color:C.text3,marginBottom:2 }}>Large (₱)</div>
                              <input defaultValue={p.price_large||p.price||""} onChange={e=>setEditData(d=>({...d,price_large:parseFloat(e.target.value)||null}))} type="number" placeholder="₱" style={{ ...InputStyle,width:"100%",boxSizing:"border-box" }}/>
                            </div>
                            <div style={{ flex:1,minWidth:80 }}>
                              <div style={{ fontSize:9,color:C.text3,marginBottom:2 }}>Online Med (₱)</div>
                              <input defaultValue={p.price_online_medium||""} onChange={e=>setEditData(d=>({...d,price_online_medium:parseFloat(e.target.value)||null}))} type="number" placeholder="₱" style={{ ...InputStyle,width:"100%",boxSizing:"border-box" }}/>
                            </div>
                            <div style={{ flex:1,minWidth:80 }}>
                              <div style={{ fontSize:9,color:C.text3,marginBottom:2 }}>Online Large (₱)</div>
                              <input defaultValue={p.price_online_large||""} onChange={e=>setEditData(d=>({...d,price_online_large:parseFloat(e.target.value)||null}))} type="number" placeholder="₱" style={{ ...InputStyle,width:"100%",boxSizing:"border-box" }}/>
                            </div>
                          </div>
                        </div>
                        <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:8 }}>
                          <input defaultValue={p.description||""} onChange={e=>setEditData(d=>({...d,description:e.target.value}))} placeholder="Description (optional)" style={{ ...InputStyle,flex:1 }}/>
                        </div>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                          <label style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,color:C.text }}>
                            <input type="checkbox" defaultChecked={p.is_available} onChange={e=>setEditData(d=>({...d,is_available:e.target.checked}))}/> Available
                          </label>
                          <div style={{ display:"flex",gap:6 }}>
                            <button onClick={()=>setEditId(null)} style={SecBtn}>Cancel</button>
                            <button onClick={()=>saveEdit(p.id)} style={PriBtn(C.info)}>Save</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:700,fontSize:13,color:p.is_available?C.text:C.text3 }}>{p.name} {!p.is_available&&<span style={{ fontSize:10,color:C.danger }}>(hidden)</span>}</div>
                          <div style={{ fontSize:11,color:C.text3 }}>{p.description||""}</div>
                        </div>
                        <div style={{ fontWeight:900,fontSize:15,color:C.success }}>₱{parseFloat(p.price).toFixed(2)}</div>
                        <button onClick={()=>{ setEditId(p.id); setEditData({ name:p.name, category:p.category, price:p.price, description:p.description, is_available:p.is_available }); }} style={{ padding:"5px 12px",background:C.infoBg,border:`1px solid ${C.info}`,borderRadius:6,color:C.info,fontWeight:700,fontSize:11,cursor:"pointer" }}>Edit</button>
                        {isAdmin&&<button onClick={()=>deleteProduct(p.id, p.name)} style={{ padding:"5px 10px",background:C.dangerBg,border:`1px solid ${C.danger}`,borderRadius:6,color:C.danger,fontWeight:700,fontSize:11,cursor:"pointer" }}>Del</button>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

// ─── INVENTORY MODAL ─────────────────────────────────────────────────────────
function InventoryModal({ onClose, toast }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editQty, setEditQty] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchMat, setSearchMat] = useState("");

  useEffect(()=>{ loadMaterials(); }, []);

  async function loadMaterials() {
    setLoading(true);
    const data = await sb("raw_materials?select=*&order=sort_order.asc,name.asc");
    if (data) setMaterials(data);
    setLoading(false);
  }

  async function saveQty(id) {
    const qty = parseFloat(editQty);
    if (isNaN(qty)) { toast("Invalid qty!", "err"); return; }
    await sb(`raw_materials?id=eq.${id}`, "PATCH", { stock_qty: qty, updated_at: new Date().toISOString() });
    if (lastSbError) { toast("Error: "+lastSbError, "err"); return; }
    // Log the manual adjustment
    await sb("inventory_logs", "POST", [{ material_id: id, change_qty: qty, note: "Manual stock adjustment" }]);
    toast("✅ Stock updated!"); setEditId(null); loadMaterials();
  }

  const baseFiltered = filter==="all" ? materials : filter==="low" ? materials.filter(m=>m.stock_qty<=m.reorder_pt) : materials.filter(m=>m.category===filter);
  const filtered = searchMat.trim() ? baseFiltered.filter(m=>m.name.toLowerCase().includes(searchMat.toLowerCase())) : baseFiltered;
  const lowCount = materials.filter(m=>m.stock_qty<=m.reorder_pt).length;

  const catColors = { ingredient:"#16a34a", consumable:"#2563eb", packaging:"#d97706" };

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16 }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:"white",borderRadius:16,width:"min(680px,95vw)",maxHeight:"92vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.25)",fontFamily:"sans-serif" }}>
        <div style={{ padding:"18px 22px 12px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"white",zIndex:10 }}>
          <div>
            <div style={{ fontWeight:900,fontSize:18,color:C.text }}>📦 Raw Materials Inventory</div>
            {lowCount>0&&<div style={{ fontSize:11,color:C.danger,fontWeight:700 }}>⚠️ {lowCount} item(s) na mababa ang stock!</div>}
          </div>
          <button onClick={onClose} style={{ border:"none",background:C.bg3,borderRadius:8,width:34,height:34,cursor:"pointer",fontSize:16,color:C.text3 }}>✕</button>
        </div>

        <div style={{ padding:"10px 22px",borderBottom:`1px solid ${C.border}`,background:"white" }}>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:14,color:C.text3 }}>🔍</span>
            <input value={searchMat} onChange={e=>setSearchMat(e.target.value)} placeholder="Hanapin ang raw material..." style={{ ...InputStyle,width:"100%",boxSizing:"border-box",paddingLeft:32 }}/>
            {searchMat&&<button onClick={()=>setSearchMat("")} style={{ position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",border:"none",background:"transparent",cursor:"pointer",fontSize:14,color:C.text3 }}>✕</button>}
          </div>
          {searchMat&&<div style={{ fontSize:11,color:C.text3,marginTop:4 }}>{filtered.length===0?<span style={{ color:C.danger }}>❌ Walang nahanap na "{searchMat}"</span>:<span style={{ color:C.success }}>✅ {filtered.length} material(s) nahanap</span>}</div>}
        </div>
        <div style={{ padding:"12px 22px 6px",display:"flex",gap:6,flexWrap:"wrap",borderBottom:`1px solid ${C.border}` }}>
          {[{key:"all",label:"All"},lowCount>0?{key:"low",label:`⚠️ Low Stock (${lowCount})`}:null,{key:"ingredient",label:"Ingredients"},{key:"consumable",label:"Consumables"},{key:"packaging",label:"Packaging"}].filter(Boolean).map(f=>(
            <button key={f.key} onClick={()=>setFilter(f.key)} style={{ padding:"5px 12px",borderRadius:20,border:`1.5px solid ${filter===f.key?C.accent:C.border}`,background:filter===f.key?C.accent+"15":"white",color:filter===f.key?C.accent:C.text3,fontWeight:filter===f.key?700:500,fontSize:11,cursor:"pointer" }}>{f.label}</button>
          ))}
        </div>

        <div style={{ padding:"14px 22px" }}>
          {loading?<div style={{ textAlign:"center",padding:30,color:C.text3 }}>Loading...</div>:filtered.map(mat=>{
            const isLow = mat.stock_qty <= mat.reorder_pt;
            return (
              <div key={mat.id} style={{ borderRadius:10,padding:"11px 14px",marginBottom:8,border:`1px solid ${isLow?C.danger:C.border}`,background:isLow?C.dangerBg:"white" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                      <span style={{ fontWeight:700,fontSize:13,color:C.text }}>{mat.name}</span>
                      <span style={{ fontSize:10,padding:"1px 7px",borderRadius:20,background:catColors[mat.category]+"20",color:catColors[mat.category],fontWeight:700 }}>{mat.category}</span>
                      {isLow&&<span style={{ fontSize:10,color:C.danger,fontWeight:700 }}>⚠️ Low!</span>}
                    </div>
                    <div style={{ fontSize:11,color:C.text3,marginTop:2 }}>Reorder at: {mat.reorder_pt} {mat.unit}</div>
                  </div>
                  {editId===mat.id ? (
                    <div style={{ display:"flex",gap:6,alignItems:"center" }}>
                      <input type="number" value={editQty} onChange={e=>setEditQty(e.target.value)} style={{ width:80,padding:"5px 8px",fontSize:13,fontWeight:700,borderRadius:7,border:`1.5px solid ${C.info}`,textAlign:"center" }}/>
                      <span style={{ fontSize:11,color:C.text3 }}>{mat.unit}</span>
                      <button onClick={()=>saveQty(mat.id)} style={PriBtn(C.info)}>Save</button>
                      <button onClick={()=>setEditId(null)} style={SecBtn}>✕</button>
                    </div>
                  ) : (
                    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontWeight:900,fontSize:16,color:isLow?C.danger:C.success }}>{mat.stock_qty}</div>
                        <div style={{ fontSize:10,color:C.text3 }}>{mat.unit}</div>
                      </div>
                      <button onClick={()=>{ setEditId(mat.id); setEditQty(mat.stock_qty); }} style={{ padding:"5px 11px",background:C.infoBg,border:`1px solid ${C.info}`,borderRadius:6,color:C.info,fontWeight:700,fontSize:11,cursor:"pointer" }}>Adjust</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length===0&&<div style={{ textAlign:"center",color:C.text3,padding:"20px 0",fontSize:12 }}>Walang materials. I-upload muna via Bulk Upload.</div>}
        </div>
      </div>
    </div>
  );
}

// ─── SHARED MICRO-STYLES ──────────────────────────────────────────────────────
const TH = { background:"#f5f7fa",padding:"8px 10px",textAlign:"left",fontWeight:700,color:"#444",borderBottom:`1px solid #e5e7eb`,fontSize:12 };
const TD = { padding:"7px 10px",borderBottom:`1px solid #f0f0f0`,color:"#333",fontSize:12 };
const InputStyle = { padding:"8px 10px",fontSize:13,borderRadius:8,border:`1.5px solid #e2e8f0`,outline:"none",background:"white",color:"#0f172a" };
const SecBtn = { padding:"7px 16px",borderRadius:8,border:`1px solid #e2e8f0`,background:"white",cursor:"pointer",fontWeight:600,fontSize:12,color:"#555" };
const PriBtn = (color) => ({ padding:"7px 18px",borderRadius:8,border:"none",background:color,color:"white",fontWeight:700,fontSize:12,cursor:"pointer" });

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
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

  // POS products from Supabase (dynamic)
  const [dbProducts, setDbProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState(DEFAULT_CATEGORIES);

  // Modals
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showProductEditor, setShowProductEditor] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  // Auth
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinMode, setPinMode] = useState("");
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  // POS
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

  // Admin
  const [adminTab, setAdminTab] = useState("dashboard");
  const [reportDate, setReportDate] = useState(todayStr());
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0,7));
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
  const [cashOnHand, setCashOnHand] = useState({});
  const [cohInput, setCohInput] = useState({});
  const [payrollFrom, setPayrollFrom] = useState(()=>{ const d=new Date(); d.setDate(10); return d.toISOString().split("T")[0]; });
  const [payrollTo, setPayrollTo] = useState(()=>{ const d=new Date(); d.setDate(25); return d.toISOString().split("T")[0]; });
  const [depositLoading, setDepositLoading] = useState(false);

  useEffect(()=>{
    (async()=>{ await loadFromSupabase(); await loadProducts(); setLoading(false); })();
  },[]);

  // ── LOAD PRODUCTS FROM SUPABASE ───────────────────────────────────────────
  const loadProducts = async () => {
    const data = await sb("products?select=*&is_available=eq.true&order=sort_order.asc,name.asc");
    if (data && data.length > 0) {
      setDbProducts(data);
      // Build categories from DB products
      const cats = [...new Set(data.map(p=>p.category))].map((key,i)=>({
        key, label: key,
        color: DEFAULT_CATEGORIES.find(c=>c.key===key)?.color || BORDER_COLORS[i%BORDER_COLORS.length]
      }));
      if (cats.length > 0) setDbCategories(cats);
    }
  };

  // ── GET MENU: prefer Supabase, fallback to hardcoded MENU ────────────────
  const getMenuItems = (categoryKey) => {
    if (dbProducts.length > 0) {
      return dbProducts.filter(p=>p.category===categoryKey).map(p=>({
        id: p.id,
        name: p.name,
        medium: p.price_medium || p.price || null,
        large: p.price_large || p.price || null,
        onlineMed: p.price_online_medium || (p.price ? p.price*1.2 : null),
        onlineLge: p.price_online_large || (p.price ? p.price*1.2 : null),
      }));
    }
    return [];
  };

  const activeCategories = dbProducts.length > 0 ? dbCategories : DEFAULT_CATEGORIES;

  // ── LOAD SUPABASE DATA ────────────────────────────────────────────────────
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
      if (Array.isArray(emps) && emps.length > 0) {
        setEmployees(emps.map(e=>({ id:e.id, name:e.name, pin:e.pin, role:e.role, emoji:e.emoji||"👤", branchId:e.branch_id, active:e.active!==false })).filter(e=>e.active));
      } else {
        setEmployees(EMPLOYEES_SEED);
        sb("employees","POST",EMPLOYEES_SEED.map(e=>({ name:e.name, pin:e.pin, role:e.role, emoji:e.emoji, branch_id:e.branchId, active:true }))).catch(()=>{});
      }
      const ns={};
      if (Array.isArray(orders)) {
        const itemsByOrder={};
        (items||[]).forEach(i=>{ if(!itemsByOrder[i.order_id])itemsByOrder[i.order_id]=[]; itemsByOrder[i.order_id].push({ key:`${i.item_name}_${i.size}`, name:i.item_name, size:i.size, qty:i.qty, price:parseFloat(i.unit_price), finalPrice:parseFloat(i.final_price) }); });
        orders.forEach(o=>{ const bk=`${o.branch_id}_${o.order_date}`; if(!ns[bk])ns[bk]={orders:[]}; ns[bk].orders.push({ id:o.order_num, time:o.order_time?.slice(0,8)||"", date:o.order_date, branch:BRANCHES.find(b=>b.id===o.branch_id)?.name||"", branchId:o.branch_id, cashier:o.cashier_name, paymentMethod:o.payment_method, items:itemsByOrder[o.id]||[], subtotal:parseFloat(o.subtotal||0), discountType:o.discount_type, discountAmt:parseFloat(o.discount_amt||0), total:parseFloat(o.total||0), cash:parseFloat(o.cash_given||0), change:parseFloat(o.change_given||0) }); });
      }
      const ne={};
      (exps||[]).forEach(e=>{ const bk=`${e.branch_id}_${e.expense_date}`; if(!ne[bk])ne[bk]=[]; ne[bk].push({ desc:e.description, amount:parseFloat(e.amount), time:e.expense_time?.slice(0,8)||"", branch:BRANCHES.find(b=>b.id===e.branch_id)?.name||"" }); });
      const nd={};
      (dtrRows||[]).forEach(r=>{ const k=`${r.employee_id}_${r.branch_id}_${r.dtr_date}`; if(!nd[k])nd[k]=[]; nd[k].push({ in:r.time_in?.slice(0,8)||"", out:r.time_out?r.time_out.slice(0,8):null, name:r.employee_name }); });
      const coh={};
      (cohRows||[]).forEach(r=>{ coh[`${r.branch_id}_${r.record_date}`]=parseFloat(r.amount); });
      setCashOnHand(coh); setSalesData(ns); setExpenses(ne); setDtrData(nd);
      await persist(SALES_KEY,ns); await persist(EXP_KEY,ne); await persist(DTR_KEY,nd);
    } catch(e) {
      try {
        const s=localStorage.getItem(SALES_KEY); const d=localStorage.getItem(DTR_KEY); const e2=localStorage.getItem(EXP_KEY);
        setSalesData(s?JSON.parse(s):{}); setDtrData(d?JSON.parse(d):{}); setExpenses(e2?JSON.parse(e2):{});
        setEmployees(EMPLOYEES_SEED); toast("⚠️ Hindi maka-connect sa cloud — gamit muna local cache","err");
      } catch { setSalesData({}); setDtrData({}); setExpenses({}); setEmployees(EMPLOYEES_SEED); }
    }
  };

  const persist = async (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch {} };
  const toast = (msg, type="ok") => { setNotif({msg,type}); setTimeout(()=>setNotif(null),3500); };

  // ── DTR HELPERS ───────────────────────────────────────────────────────────
  const getEmpDTR = (empId, branchId, date) => dtrData[`${empId}_${branchId}_${date}`]||[];
  const isLoggedIn = (empId, branchId) => { const logs=getEmpDTR(empId,branchId,todayStr()); return logs.length>0&&!logs[logs.length-1].out; };
  const findActiveBranchFor = (empId) => { for (const b of BRANCHES) { if (isLoggedIn(empId,b.id)) return b; } return null; };
  const getEmpDTRAnyBranch = (empId, date) => { const ab=findActiveBranchFor(empId); if(ab)return{logs:getEmpDTR(empId,ab.id,date),branch:ab}; for(const b of BRANCHES){const logs=getEmpDTR(empId,b.id,date);if(logs.length>0)return{logs,branch:b};}return{logs:[],branch:null}; };
  const calcDTRHours = (logs) => { const mins=logs.filter(l=>l.out).reduce((s,l)=>s+calcMins(l.in,l.out),0); return{hrs:Math.floor(mins/60),mins:mins%60,totalMins:mins}; };

  // ── PIN HANDLER ───────────────────────────────────────────────────────────
  const handlePin = (d) => {
    if (locked) { toast("Locked! Hintayin ang 30 segundo.","err"); return; }
    if (pinInput.length>=4) return;
    const np=pinInput+d; setPinInput(np);
    if (np.length===4) setTimeout(()=>processPin(np),120);
  };
  const processPin = async (pin) => {
    const emp=employees.find(e=>e.pin===pin);
    if (!emp) { const a=loginAttempts+1; setLoginAttempts(a); setPinInput(""); if(a>=3){setLocked(true);setPinError("🔒 3 maling PIN! Locked ng 30 segundo.");setTimeout(()=>{setLocked(false);setLoginAttempts(0);setPinError("");},30000);}else setPinError(`Mali ang PIN. ${3-a} tries pa.`); return; }
    setLoginAttempts(0); setPinError(""); setPinInput("");
    if (pinMode==="dtr-in") { const eb=findActiveBranchFor(emp.id); if(eb){setPinError(`${emp.name} naka-login pa sa ${eb.name}!`);return;} const nd={...dtrData}; const k=`${emp.id}_${currentBranch.id}_${todayStr()}`; if(!nd[k])nd[k]=[]; nd[k].push({in:nowStr(),out:null,name:emp.name}); setDtrData(nd); await persist(DTR_KEY,nd); sb("dtr","POST",{employee_id:emp.id,employee_name:emp.name,branch_id:currentBranch.id,dtr_date:todayStr(),time_in:nowStr()}); toast(`🟢 TIME IN: ${emp.emoji} ${emp.name}`); setPinMode(""); return; }
    if (pinMode==="dtr-out") { const ab=findActiveBranchFor(emp.id); if(!ab){setPinError(`${emp.name} hindi naka-time in!`);return;} const nd={...dtrData}; const k=`${emp.id}_${ab.id}_${todayStr()}`; const entry=nd[k][nd[k].length-1]; entry.out=nowStr(); const tm=nd[k].filter(l=>l.out).reduce((s,l)=>s+calcMins(l.in,l.out),0); setDtrData(nd); await persist(DTR_KEY,nd); sb("dtr","POST",{employee_id:emp.id,employee_name:emp.name,branch_id:ab.id,dtr_date:todayStr(),time_in:entry.in,time_out:entry.out}); toast(`🔴 TIME OUT: ${emp.emoji} ${emp.name} | Total: ${formatHrs(tm)}`); setPinMode(""); return; }
    if (pinMode==="cashier-login") { if(ROLE_LEVEL[emp.role]>=3){setPinError("Admin/Owner — gamitin ang Admin Portal.");return;} if(emp.branchId&&emp.branchId!==currentBranch.id){setPinError(`${emp.name} ay nasa ${BRANCHES.find(b=>b.id===emp.branchId)?.name} lang.`);return;} setCurrentUser(emp); setCart([]); setActiveCat(activeCategories[0]?.key||"JUICE"); setDiscountType(null); setCashGiven(0); setPaymentMethod("cash"); setPosScreen("pos"); setEnv("cashier"); setPinMode(""); toast(`Welcome ${emp.emoji} ${emp.name}!`); return; }
    if (pinMode==="admin-login") { if(ROLE_LEVEL[emp.role]<3){setPinError("Owner/Admin lang.");return;} setCurrentUser(emp); setEnv("admin"); setAdminTab("dashboard"); setPinMode(""); toast(`Welcome ${emp.emoji} ${emp.name}!`); return; }
  };

  // ── CART & POS ────────────────────────────────────────────────────────────
  const isOnline = ["foodpanda","grabfood","sm"].includes(paymentMethod);
  const pm = PAYMENT_METHODS.find(p=>p.key===paymentMethod);
  const getPrice = (item, size) => { if(isOnline)return size==="M"?(item.onlineMed||item.medium):item.onlineLge; return size==="M"?item.medium:item.large; };
  const getFinalPrice = (price) => { if(discountType==="SNR"||discountType==="PWD")return applyDiscount(price); if(discountType==="5%")return price*0.95; if(discountType==="10%")return price*0.90; if(discountType==="20%")return price*0.80; return price; };
  const addToCart = (item, size) => { const price=getPrice(item,size); const key=`${item.name}_${size}`; setCart(prev=>{ const ex=prev.find(c=>c.key===key); if(ex)return prev.map(c=>c.key===key?{...c,qty:c.qty+1}:c); return[...prev,{key,name:item.name,size,qty:1,price,category:activeCat}]; }); setSizeModal(null); };
  const setQty = (key, qty) => { if(qty<=0)setCart(prev=>prev.filter(c=>c.key!==key)); else setCart(prev=>prev.map(c=>c.key===key?{...c,qty}:c)); };
  const subtotal = cart.reduce((s,c)=>s+c.price*c.qty,0);
  const discountAmt = cart.reduce((s,c)=>s+(c.price-getFinalPrice(c.price))*c.qty,0);
  const total = Math.round((subtotal-discountAmt)*100)/100;
  const change = cashGiven-total;
  const canCharge = cart.length>0&&(isOnline||["gcash","maya","gotyme"].includes(paymentMethod)||cashGiven>=total);

  // ── CHECKOUT WITH AUTO-DEDUCT ─────────────────────────────────────────────
  const doCheckout = async () => {
    if (!canCharge) { toast("Hindi pa ready!","err"); return; }
    const dk=todayStr(); const bk=`${currentBranch.id}_${dk}`;
    const itemsWithFinal=cart.map(c=>({...c,finalPrice:Math.round(getFinalPrice(c.price)*100)/100}));
    const order={ id:orderNum, time:nowStr(), date:dk, branch:currentBranch.name, branchId:currentBranch.id, cashier:currentUser.name, paymentMethod, items:itemsWithFinal, subtotal, discountType, discountAmt, total, cash:cashGiven||total, change:paymentMethod==="cash"?Math.max(0,change):0 };
    const ns={...salesData}; if(!ns[bk])ns[bk]={orders:[]}; ns[bk].orders.push(order);
    setSalesData(ns); await persist(SALES_KEY,ns);

    let savedToCloud=false; let errMsg=null;
    try {
      const result=await sb("orders","POST",{ order_num:orderNum, branch_id:currentBranch.id, cashier_name:currentUser.name, payment_method:paymentMethod, subtotal, discount_type:discountType, discount_amt:discountAmt, total, cash_given:cashGiven||total, change_given:paymentMethod==="cash"?Math.max(0,change):0, order_date:dk, order_time:nowStr() });
      const sbOrder=result&&result[0];
      if (sbOrder?.id) {
        const itemsResult=await sb("order_items","POST", itemsWithFinal.map(i=>({ order_id:sbOrder.id, item_name:i.name, size:i.size, qty:i.qty, unit_price:i.price, final_price:i.finalPrice, subtotal:Math.round(i.finalPrice*i.qty*100)/100 })));
        if (itemsResult) {
          savedToCloud=true;
          // ── AUTO-DEDUCT INVENTORY ──
          await sb("rpc/deduct_inventory_for_order", "POST", { p_order_id: sbOrder.id });
        } else errMsg="order_items insert failed: "+lastSbError;
      } else errMsg="orders insert failed: "+lastSbError;
    } catch(e) { errMsg="Exception: "+e.message; }
    setDebugError(errMsg);
    setLastReceipt(order); setOrderNum(n=>n+1);
    setCart([]); setCashGiven(0); setDiscountType(null); setPaymentMethod("cash");
    setPosScreen("receipt");
    if (savedToCloud) toast(`Order #${order.id} saved! ☁️`);
    else toast(`⚠️ Cloud save FAILED: ${lastSbError||"unknown"}`, "err");
  };

  const addExpense = async () => {
    if (!expDesc.trim()||!expAmt) { toast("Lagyan ng description at amount!","err"); return; }
    const dk=todayStr(); const bk=`${currentBranch.id}_${dk}`;
    const ne={...expenses}; if(!ne[bk])ne[bk]=[]; ne[bk].push({desc:expDesc.trim(),amount:parseFloat(expAmt),time:nowStr(),branch:currentBranch.name});
    setExpenses(ne); await persist(EXP_KEY,ne); setExpDesc(""); setExpAmt("");
    try { const r=await sb("expenses","POST",{branch_id:currentBranch.id,description:expDesc.trim(),amount:parseFloat(expAmt),expense_date:dk,expense_time:nowStr(),added_by:currentUser?.name}); if(r&&r[0])toast(`Expense ₱${parseFloat(expAmt).toLocaleString()} saved ☁️`); else toast("⚠️ Local only","err"); } catch {}
  };

  const createEmployee = async () => {
    if (!newEmpName.trim()) { toast("Lagyan ng pangalan!","err"); return; }
    if (!/^\d{4}$/.test(newEmpPin)) { toast("Ang PIN ay dapat 4 digits!","err"); return; }
    if (employees.some(e=>e.pin===newEmpPin)) { toast("Ginagamit na ang PIN na ito!","err"); return; }
    const branchId=newEmpRole==="owner"||newEmpRole==="admin"?null:newEmpBranch;
    try {
      const result=await sb("employees","POST",[{name:newEmpName.trim(),pin:newEmpPin,role:newEmpRole,emoji:newEmpRole==="manager"?"👔":"👤",branch_id:branchId,active:true}]);
      const created=result&&result[0];
      if (created) { setEmployees(prev=>[...prev,{id:created.id,name:created.name,pin:created.pin,role:created.role,emoji:created.emoji,branchId:created.branch_id,active:true}]); setNewEmpName("");setNewEmpPin("");setNewEmpRole("cashier");setNewEmpBranch(BRANCHES[0].id);setShowAddEmp(false); toast(`Employee added: ${newEmpName} ☁️`); }
      else toast(`⚠️ Hindi nai-save: ${lastSbError||"unknown"}`, "err");
    } catch(e) { toast("Error: "+e.message,"err"); }
  };

  const deactivateEmployee = async (emp) => {
    try { await sb(`employees?id=eq.${emp.id}`,"PATCH",{active:false}); setEmployees(prev=>prev.filter(e=>e.id!==emp.id)); toast(`${emp.name} deactivated`); }
    catch(e) { toast("Error: "+e.message,"err"); }
  };

  const saveCashOnHand = async (branchId, date, amount) => {
    const key=`${branchId}_${date}`; const nc={...cashOnHand,[key]:amount}; setCashOnHand(nc);
    try { const r=await sb("cash_on_hand","POST",[{branch_id:branchId,record_date:date,amount,recorded_by:currentUser?.name,updated_at:new Date().toISOString()}],{"Prefer":"resolution=merge-duplicates,return=representation"}); if(r)toast(`Cash on Hand saved ☁️`); else toast(`⚠️ ${lastSbError}`,"err"); } catch(e){toast("Error: "+e.message,"err");}
  };

  const getOrders = (date, branchId=null) => { if(branchId)return salesData[`${branchId}_${date}`]?.orders||[]; return BRANCHES.flatMap(b=>salesData[`${b.id}_${date}`]?.orders||[]); };
  const getExps = (date, branchId=null) => { if(branchId)return expenses[`${branchId}_${date}`]||[]; return BRANCHES.flatMap(b=>expenses[`${b.id}_${date}`]||[]); };
  const calcSum = (orders) => { let gross=0; const iM={},pmM={}; orders.forEach(o=>{ gross+=o.total; o.items?.forEach(i=>{const k=`${i.name} (${i.size})`;if(!iM[k])iM[k]={qty:0,sales:0};iM[k].qty+=i.qty;iM[k].sales+=(i.finalPrice||i.price)*i.qty;}); if(!pmM[o.paymentMethod])pmM[o.paymentMethod]={sales:0,count:0}; pmM[o.paymentMethod].sales+=o.total;pmM[o.paymentMethod].count++; }); return{gross,txns:orders.length,top8:Object.entries(iM).sort((a,b)=>b[1].qty-a[1].qty).slice(0,8),pmSales:pmM}; };

  const checkDeposit = () => {
    if (!depositAmt||isNaN(parseFloat(depositAmt))) { toast("Lagay ang deposit amount!","err"); return; }
    setDepositLoading(true);
    setTimeout(()=>{ try { const start=new Date(depositFrom),end=new Date(depositTo); let allOrders=[]; for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)){const dk=d.toISOString().split("T")[0];allOrders=[...allOrders,...getOrders(dk,selectedBranch==="all"?null:parseInt(selectedBranch))];} const cashSales=allOrders.filter(o=>o.paymentMethod==="cash").reduce((s,o)=>s+o.total,0); const totalSales=allOrders.reduce((s,o)=>s+o.total,0); const deposit=parseFloat(depositAmt); const diff=deposit-cashSales; setDepositResult({totalSales,cashSales,deposit,diff,matched:Math.abs(diff)<1,count:allOrders.length}); }catch(e){toast("Error sa deposit check: "+e.message,"err");} setDepositLoading(false); },300);
  };
  const clearDeposit = () => { setDepositResult(null); setDepositAmt(""); setDepositFrom(todayStr()); setDepositTo(todayStr()); };
  const bFilter = selectedBranch==="all"?null:parseInt(selectedBranch);

  // ── INVENTORY LOW STOCK BADGE ─────────────────────────────────────────────
  const [lowStockCount, setLowStockCount] = useState(0);
  useEffect(()=>{
    (async()=>{ const mats=await sb("raw_materials?select=id,stock_qty,reorder_pt"); if(mats) setLowStockCount(mats.filter(m=>m.stock_qty<=m.reorder_pt).length); })();
  },[showInventory]);

  // ── LOADING ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ background:C.bg,height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,fontFamily:"sans-serif" }}>
      <img src="https://i.ibb.co/v4Nnc2bz/limjoelogo.jpg" alt="Limjoe" style={{ width:100,height:100,borderRadius:"50%",objectFit:"cover" }}/>
      <div style={{ color:C.primary,fontWeight:800,fontSize:20 }}>Loading Limjoe POS...</div>
      <div style={{ color:C.text3 }}>Connecting to cloud ☁️</div>
    </div>
  );

  // ── MODALS ────────────────────────────────────────────────────────────────
  const modals = (
    <>
      {showBulkUpload&&<BulkUploadModal onClose={()=>setShowBulkUpload(false)} toast={toast} onReloadProducts={loadProducts} onReloadInventory={()=>setLowStockCount(p=>p)}/>}
      {showProductEditor&&<ProductEditorModal onClose={()=>setShowProductEditor(false)} toast={toast} userRole={currentUser?.role||"admin"} categories={activeCategories} onReloadProducts={loadProducts}/>}
      {showInventory&&<InventoryModal onClose={()=>setShowInventory(false)} toast={toast}/>}
    </>
  );

  // ══ HOME ══════════════════════════════════════════════════════════════════
  if (env==="home"&&pinMode==="") return (
    <div style={{ background:C.bg,minHeight:"100vh",fontFamily:"sans-serif",color:C.text,padding:16 }}>
      {notif&&<Toast notif={notif}/>} {modals}
      <div style={{ textAlign:"center",paddingTop:10,marginBottom:24 }}>
        <img src="https://i.ibb.co/v4Nnc2bz/limjoelogo.jpg" alt="Limjoe" style={{ width:70,height:70,borderRadius:"50%",objectFit:"cover",margin:"0 auto 8px",display:"block",border:"3px solid #d97706" }}/>
        <div style={{ fontSize:22,fontWeight:900,letterSpacing:4,color:C.primary }}>LIMJOE</div>
        <div style={{ color:C.text3,fontSize:11 }}>Lemony Juice Station · Cloud POS ☁️</div>
        <div style={{ color:C.text3,fontSize:10,marginTop:2 }}>{new Date().toLocaleDateString("en-PH",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
      </div>
      <div style={{ maxWidth:440,margin:"0 auto",display:"flex",flexDirection:"column",gap:12 }}>
        <div style={{ background:C.card,borderRadius:14,padding:14,border:`1px solid ${C.border}`,boxShadow:C.shadow }}>
          <div style={{ fontSize:11,color:C.text3,fontWeight:700,letterSpacing:1,marginBottom:10 }}>🏪 SELECT BRANCH</div>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>{BRANCHES.map(b=>(<button key={b.id} onClick={()=>setCurrentBranch(b)} style={{ padding:"8px 16px",background:currentBranch.id===b.id?C.primary:"white",border:`1.5px solid ${currentBranch.id===b.id?C.primary:C.border2}`,borderRadius:8,color:currentBranch.id===b.id?"white":C.text2,fontWeight:700,fontSize:13,cursor:"pointer" }}>{b.name}</button>))}</div>
        </div>
        <div style={{ background:C.card,borderRadius:14,padding:14,border:`1px solid ${C.border}`,boxShadow:C.shadow }}>
          <div style={{ fontSize:11,color:C.text3,fontWeight:700,letterSpacing:1,marginBottom:10 }}>⏱️ TIME RECORD — {currentBranch.name}</div>
          <div style={{ display:"flex",gap:10,marginBottom:12 }}>
            <button onClick={()=>setPinMode("dtr-in")} style={{ flex:1,padding:"14px",background:C.successBg,border:`2px solid ${C.success}`,borderRadius:12,color:C.success,fontWeight:900,fontSize:15,cursor:"pointer" }}>🟢 TIME IN</button>
            <button onClick={()=>setPinMode("dtr-out")} style={{ flex:1,padding:"14px",background:C.dangerBg,border:`2px solid ${C.danger}`,borderRadius:12,color:C.danger,fontWeight:900,fontSize:15,cursor:"pointer" }}>🔴 TIME OUT</button>
          </div>
          {employees.map(emp=>{ const{logs,branch:eb}=getEmpDTRAnyBranch(emp.id,todayStr()); const inside=eb?isLoggedIn(emp.id,eb.id):false; const{hrs,mins,totalMins}=calcDTRHours(logs); const last=logs[logs.length-1]; const atOther=eb&&eb.id!==currentBranch.id; return(<div key={emp.id} style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:`1px solid ${C.border}` }}><div style={{ width:8,height:8,borderRadius:"50%",background:inside?C.success:logs.length?C.text3:C.border2 }}/><span style={{ fontSize:14 }}>{emp.emoji}</span><div style={{ flex:1 }}><div style={{ fontWeight:700,fontSize:12,color:C.text }}>{emp.name}</div><div style={{ fontSize:9,color:C.text3 }}>{inside?`IN since ${last?.in}`:logs.length?`Out: ${last?.out}`:"No log today"}{atOther&&<span style={{ color:C.warning,fontWeight:700 }}> · 📍{eb.name}</span>}</div></div>{logs.length>0&&(<div style={{ textAlign:"right" }}><div style={{ fontWeight:800,fontSize:11,color:inside?C.success:C.text3 }}>{inside?`${hrs}h ${mins}m`:`Total: ${formatHrs(totalMins)}`}</div></div>)}</div>); })}
        </div>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={()=>setPinMode("cashier-login")} style={{ flex:1,padding:"20px 10px",background:C.primary,border:"none",borderRadius:14,color:"white",fontWeight:900,fontSize:15,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,boxShadow:`0 2px 8px ${C.primary}44` }}><span style={{ fontSize:28 }}>🧾</span><span>CASHIER POS</span><span style={{ fontSize:10,opacity:0.85 }}>Cashier / Manager</span></button>
          <button onClick={()=>setPinMode("admin-login")} style={{ flex:1,padding:"20px 10px",background:"white",border:`2px solid ${C.accent}`,borderRadius:14,color:C.accent,fontWeight:900,fontSize:15,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}><span style={{ fontSize:28 }}>🔐</span><span>ADMIN PORTAL</span><span style={{ fontSize:10,opacity:0.7 }}>Owner / Admin only</span></button>
        </div>
        <div style={{ textAlign:"center",fontSize:10,color:C.text3 }}>☁️ Supabase Cloud · {currentBranch.name}</div>
      </div>
    </div>
  );

  // ══ PIN SCREEN ════════════════════════════════════════════════════════════
  if (pinMode!=="") {
    const isAdmin=pinMode==="admin-login"; const isDTR=pinMode.startsWith("dtr");
    const title={"dtr-in":"TIME IN","dtr-out":"TIME OUT","cashier-login":"CASHIER POS LOGIN","admin-login":"ADMIN PORTAL LOGIN"}[pinMode];
    const emoji={"dtr-in":"🟢","dtr-out":"🔴","cashier-login":"🧾","admin-login":"🔐"}[pinMode];
    const accentColor=isAdmin?C.accent:isDTR?(pinMode==="dtr-in"?C.success:C.danger):C.primary;
    return (
      <div style={{ background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"sans-serif",padding:16 }}>
        {notif&&<Toast notif={notif}/>}
        <div style={{ background:C.card,borderRadius:22,padding:"24px 20px",width:"100%",maxWidth:340,border:`1px solid ${C.border}`,boxShadow:"0 4px 24px rgba(0,0,0,0.1)" }}>
          <button onClick={()=>{setPinMode("");setPinInput("");setPinError("");setLoginAttempts(0);setLocked(false);}} style={{ background:"transparent",border:"none",color:C.text3,fontSize:13,cursor:"pointer",marginBottom:12 }}>← Back</button>
          <div style={{ textAlign:"center",marginBottom:18 }}><div style={{ fontSize:38 }}>{emoji}</div><div style={{ fontSize:15,fontWeight:800,color:C.text,marginTop:6 }}>{title}</div><div style={{ fontSize:11,color:accentColor,marginTop:2 }}>📍 {currentBranch.name}</div></div>
          <div style={{ display:"flex",justifyContent:"center",gap:16,marginBottom:10 }}>{[0,1,2,3].map(i=>(<div key={i} style={{ width:18,height:18,borderRadius:"50%",background:pinInput.length>i?accentColor:"transparent",border:`3px solid ${pinInput.length>i?accentColor:C.border2}`,transition:"all 0.15s" }}/>))}</div>
          {pinError?<div style={{ color:C.danger,fontSize:12,textAlign:"center",marginBottom:6,fontWeight:600,background:C.dangerBg,padding:"6px 10px",borderRadius:8 }}>{pinError}</div>:<div style={{ color:C.text3,fontSize:11,textAlign:"center",marginBottom:6 }}>Ilagay ang 4-digit PIN</div>}
          {locked&&<div style={{ background:C.dangerBg,border:`1px solid ${C.danger}`,borderRadius:8,padding:"8px 12px",textAlign:"center",fontSize:12,color:C.danger,marginBottom:8 }}>🔒 Locked! Hintayin ang 30 segundo.</div>}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:8 }}>{[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((d,i)=>(<button key={i} style={{ padding:"15px",fontSize:20,fontWeight:700,background:d===""?"transparent":"white",border:d===""?"none":`1.5px solid ${C.border2}`,borderRadius:11,color:d==="⌫"?C.danger:C.text,cursor:locked||d===""?"not-allowed":"pointer",visibility:d===""?"hidden":"visible",opacity:locked?0.4:1 }} onClick={()=>d==="⌫"?setPinInput(p=>p.slice(0,-1)):d!==""&&handlePin(String(d))}>{d}</button>))}</div>
        </div>
      </div>
    );
  }

  // ══ CASHIER POS ═══════════════════════════════════════════════════════════
  if (env==="cashier") {
    const items = getMenuItems(activeCat);
    const cartCount=cart.reduce((s,c)=>s+c.qty,0);
    const branchOrders=getOrders(todayStr(),currentBranch.id);
    const branchSum=calcSum(branchOrders);
    const branchExp=getExps(todayStr(),currentBranch.id).reduce((s,e)=>s+parseFloat(e.amount),0);
    const canManageProducts = ROLE_LEVEL[currentUser?.role||"cashier"] >= 1; // cashier+
    const canAdmin = ROLE_LEVEL[currentUser?.role||"cashier"] >= 3; // admin+

    if (posScreen==="main") return (
      <div style={{ background:C.bg,minHeight:"100vh",fontFamily:"sans-serif",color:C.text,padding:16 }}>
        {notif&&<Toast notif={notif}/>} {modals}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
          <div><div style={{ fontSize:17,fontWeight:900,color:C.primary }}>LIMJOE · {currentBranch.name}</div><div style={{ fontSize:11,color:C.text3 }}>{currentUser?.emoji} {currentUser?.name} · {currentUser?.role}</div></div>
          <button onClick={()=>{setCurrentUser(null);setEnv("home");setPosScreen("main");}} style={{ padding:"7px 14px",background:C.dangerBg,border:`1px solid ${C.danger}`,borderRadius:8,color:C.danger,fontWeight:700,fontSize:12,cursor:"pointer" }}>🚪 Logout</button>
        </div>

        <div style={{ background:C.card,borderRadius:14,padding:14,border:`1px solid ${C.border}`,boxShadow:C.shadow,marginBottom:12 }}>
          <div style={{ fontSize:11,color:C.text3,fontWeight:700,marginBottom:10 }}>📊 TODAY — {todayStr()}</div>
          <div style={{ display:"flex",gap:8 }}>
            {[{label:"Gross Sales",val:`₱${branchSum.gross.toFixed(0)}`,color:C.success},{label:"Expenses",val:`₱${branchExp.toFixed(0)}`,color:C.danger},{label:"Net Sales",val:`₱${(branchSum.gross-branchExp).toFixed(0)}`,color:C.warning},{label:"Transactions",val:branchSum.txns,color:C.info}].map(s=>(<div key={s.label} style={{ flex:1,textAlign:"center",background:C.bg3,borderRadius:10,padding:"10px 4px" }}><div style={{ fontSize:16,fontWeight:900,color:s.color }}>{s.val}</div><div style={{ fontSize:9,color:C.text3,marginTop:2 }}>{s.label}</div></div>))}
          </div>
        </div>

        <button onClick={()=>setPosScreen("pos")} style={{ width:"100%",padding:"20px",background:C.primary,border:"none",borderRadius:14,color:"white",fontWeight:900,fontSize:18,cursor:"pointer",marginBottom:12,boxShadow:`0 2px 8px ${C.primary}44` }}>🧾 START PUNCHING</button>

        {/* Management buttons for cashier+ */}
        <div style={{ display:"flex",gap:8,marginBottom:12 }}>
          <button onClick={()=>setShowProductEditor(true)} style={{ flex:1,padding:"12px",background:"white",border:`2px solid ${C.info}`,borderRadius:12,color:C.info,fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3 }}>
            <span style={{ fontSize:20 }}>🛍️</span><span>Products</span><span style={{ fontSize:9,opacity:0.7 }}>{canAdmin?"Add/Edit/Delete":"Edit only"}</span>
          </button>
          <button onClick={()=>setShowInventory(true)} style={{ flex:1,padding:"12px",background:"white",border:`2px solid ${lowStockCount>0?C.danger:C.warning}`,borderRadius:12,color:lowStockCount>0?C.danger:C.warning,fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3 }}>
            <span style={{ fontSize:20 }}>📦</span><span>Inventory</span>
            {lowStockCount>0&&<span style={{ fontSize:9,background:C.danger,color:"white",padding:"1px 6px",borderRadius:20 }}>⚠️ {lowStockCount} low</span>}
          </button>
          {canAdmin&&<button onClick={()=>setShowBulkUpload(true)} style={{ flex:1,padding:"12px",background:"white",border:`2px solid ${C.accent}`,borderRadius:12,color:C.accent,fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3 }}>
            <span style={{ fontSize:20 }}>📤</span><span>Bulk Upload</span><span style={{ fontSize:9,opacity:0.7 }}>Excel</span>
          </button>}
        </div>

        {currentUser?.role==="manager"&&(<button onClick={()=>setPosScreen("monthly")} style={{ width:"100%",padding:"14px",background:"white",border:`2px solid ${C.accent}`,borderRadius:12,color:C.accent,fontWeight:800,fontSize:14,cursor:"pointer",marginBottom:12 }}>📅 Monthly Report — {currentBranch.name}</button>)}

        <div style={{ background:C.card,borderRadius:14,padding:14,border:`1px solid ${C.border}`,boxShadow:C.shadow }}>
          <div style={{ fontSize:11,color:C.text3,fontWeight:700,marginBottom:8 }}>📋 X READING — {currentBranch.name}</div>
          {branchSum.top8.length===0?<div style={{ color:C.text3,fontSize:12,textAlign:"center",padding:"10px 0" }}>Wala pang sales</div>:branchSum.top8.map(([n,d],i)=>(<div key={n} style={{ display:"flex",justifyContent:"space-between",fontSize:12,padding:"5px 0",borderBottom:`1px solid ${C.border}` }}><span style={{ color:i<3?["#d97706","#64748b","#92400e"][i]:C.text3,fontWeight:700 }}>#{i+1}</span><span style={{ flex:1,marginLeft:8,color:C.text }}>{n}</span><span style={{ color:C.text3 }}>×{d.qty}</span><span style={{ color:C.success,fontWeight:700,marginLeft:8 }}>₱{d.sales.toFixed(0)}</span></div>))}
        </div>
      </div>
    );

    if (posScreen==="receipt"&&lastReceipt) return (
      <div style={{ background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"sans-serif",padding:16 }}>
        {notif&&<Toast notif={notif}/>} {modals}
        {debugError&&<div style={{ position:"fixed",top:60,left:16,right:16,background:"#450a0a",border:"2px solid #ef4444",borderRadius:10,padding:"10px 14px",zIndex:9998,maxWidth:400,margin:"0 auto" }}><div style={{ color:"#fca5a5",fontWeight:900,fontSize:12,marginBottom:4 }}>⚠️ CLOUD SAVE ERROR:</div><div style={{ color:"#fecaca",fontSize:11,fontFamily:"monospace",wordBreak:"break-word" }}>{debugError}</div></div>}
        <div style={{ background:"white",borderRadius:18,padding:"20px 16px",width:"100%",maxWidth:300,fontFamily:"'Courier New',monospace",color:C.text,boxShadow:"0 4px 24px rgba(0,0,0,0.1)" }}>
          <div style={{ textAlign:"center" }}><img src="https://i.ibb.co/v4Nnc2bz/limjoelogo.jpg" alt="Limjoe" style={{ width:40,height:40,borderRadius:"50%",objectFit:"cover",margin:"0 auto 4px",display:"block" }}/><div style={{ fontSize:16,fontWeight:900,letterSpacing:5 }}>LIMJOE</div><div style={{ fontSize:9,color:C.text3 }}>{lastReceipt.branch}</div></div>
          <div style={{ borderTop:"1px dashed #cbd5e1",margin:"8px 0" }}/>
          <div style={{ textAlign:"center",fontSize:10,color:C.text3 }}>Order #{lastReceipt.id} · {lastReceipt.date} · {lastReceipt.time}<br/>{lastReceipt.cashier} · {pm?.emoji} {pm?.label}</div>
          <div style={{ borderTop:"1px dashed #cbd5e1",margin:"8px 0" }}/>
          {lastReceipt.items.map((i,idx)=>(<div key={idx} style={{ display:"flex",justifyContent:"space-between",fontSize:11,padding:"2px 0" }}><span>{i.name}({i.size}) ×{i.qty}</span><span>₱{(i.finalPrice*i.qty).toFixed(2)}</span></div>))}
          {lastReceipt.discountType&&<div style={{ display:"flex",justifyContent:"space-between",fontSize:10,color:C.text3 }}><span>Discount ({lastReceipt.discountType})</span><span>-₱{lastReceipt.discountAmt.toFixed(2)}</span></div>}
          <div style={{ borderTop:"1px dashed #cbd5e1",margin:"8px 0" }}/>
          <div style={{ display:"flex",justifyContent:"space-between",fontWeight:900,fontSize:14 }}><span>TOTAL</span><span>₱{lastReceipt.total.toFixed(2)}</span></div>
          {lastReceipt.paymentMethod==="cash"?<><div style={{ display:"flex",justifyContent:"space-between",fontSize:11,color:C.text3 }}><span>Cash</span><span>₱{lastReceipt.cash.toFixed(2)}</span></div><div style={{ display:"flex",justifyContent:"space-between",fontWeight:900,fontSize:18,color:C.success }}><span>SUKLI</span><span>₱{lastReceipt.change.toFixed(2)}</span></div></>:<div style={{ textAlign:"center",color:C.success,fontWeight:700,fontSize:13,marginTop:4 }}>✅ Paid via {pm?.label}</div>}
          <div style={{ borderTop:"1px dashed #cbd5e1",margin:"8px 0" }}/>
          <div style={{ textAlign:"center",fontSize:11,fontWeight:700,color:C.text2 }}>Salamat! 🍋</div>
          <div style={{ display:"flex",gap:8,marginTop:10 }}>
            <button onClick={()=>printWin(`<div class="c"><div class="brand">LIMJOE</div><div style="font-size:9px;color:#666">${lastReceipt.branch}</div></div><div class="dv"></div><div class="c" style="font-size:10px;color:#666">Order #${lastReceipt.id} · ${lastReceipt.date} · ${lastReceipt.time}<br>${lastReceipt.cashier} · ${pm?.emoji} ${pm?.label}</div><div class="dv"></div>${lastReceipt.items.map(i=>`<div class="row"><span>${i.name}(${i.size})×${i.qty}</span><span>₱${(i.finalPrice*i.qty).toFixed(2)}</span></div>`).join("")}${lastReceipt.discountType?`<div class="row" style="color:#666"><span>Discount(${lastReceipt.discountType})</span><span>-₱${lastReceipt.discountAmt.toFixed(2)}</span></div>`:""}<div class="dv"></div><div class="row big"><span>TOTAL</span><span>₱${lastReceipt.total.toFixed(2)}</span></div>${lastReceipt.paymentMethod==="cash"?`<div class="row" style="color:#666"><span>Cash</span><span>₱${lastReceipt.cash.toFixed(2)}</span></div><div class="row big grn"><span>SUKLI</span><span>₱${lastReceipt.change.toFixed(2)}</span></div>`:`<div class="c grn" style="font-weight:700">Paid via ${pm?.label}</div>`}<div class="dv"></div><div class="c" style="font-weight:700">Salamat! 🍋</div>`)} style={{ flex:1,padding:"10px",background:C.bg3,border:`1px solid ${C.border}`,borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer",color:C.text }}>🖨️ Print</button>
            <button onClick={()=>setPosScreen("pos")} style={{ flex:2,padding:"10px",background:C.primary,border:"none",borderRadius:8,fontWeight:900,fontSize:13,cursor:"pointer",color:"white" }}>+ New Order</button>
          </div>
          <button onClick={()=>setPosScreen("main")} style={{ width:"100%",marginTop:6,padding:"9px",background:"transparent",border:`1px solid ${C.border}`,borderRadius:8,color:C.text3,fontSize:11,cursor:"pointer" }}>← Back to Summary</button>
        </div>
      </div>
    );

    // ── POS GRID ────────────────────────────────────────────────────────────
    return (
      <div style={{ background:C.bg,height:"100vh",display:"flex",flexDirection:"column",fontFamily:"sans-serif",overflow:"hidden",color:C.text }}>
        {notif&&<Toast notif={notif}/>} {modals}

        {sizeModal&&(
          <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:20 }}>
            <div style={{ background:"white",borderRadius:18,padding:"20px 16px",width:"100%",maxWidth:320,border:`1px solid ${C.border}`,boxShadow:"0 8px 32px rgba(0,0,0,0.15)" }}>
              <div style={{ fontSize:15,fontWeight:900,color:C.text,marginBottom:3 }}>{sizeModal.name}</div>
              <div style={{ fontSize:10,color:C.text3,marginBottom:16 }}>{isOnline?"🛵 Online Price":"🏪 In-store Price"}{discountType?` · ${discountType}`:""}</div>
              <div style={{ display:"flex",gap:10 }}>
                {sizeModal.medium!==null&&(<button onClick={()=>addToCart(sizeModal,"M")} style={{ flex:1,padding:"16px 8px",background:C.successBg,border:`2px solid ${C.success}`,borderRadius:12,color:C.success,cursor:"pointer",textAlign:"center" }}><div style={{ fontWeight:900,fontSize:16 }}>MEDIUM</div><div style={{ fontSize:14,marginTop:3 }}>₱{getPrice(sizeModal,"M")}</div>{discountType&&<div style={{ fontSize:10,marginTop:2,color:C.success }}>₱{getFinalPrice(getPrice(sizeModal,"M")).toFixed(0)} w/{discountType}</div>}</button>)}
                <button onClick={()=>addToCart(sizeModal,"L")} style={{ flex:1,padding:"16px 8px",background:C.infoBg,border:`2px solid ${C.info}`,borderRadius:12,color:C.info,cursor:"pointer",textAlign:"center" }}><div style={{ fontWeight:900,fontSize:16 }}>LARGE</div><div style={{ fontSize:14,marginTop:3 }}>₱{getPrice(sizeModal,"L")}</div>{discountType&&<div style={{ fontSize:10,marginTop:2,color:C.info }}>₱{getFinalPrice(getPrice(sizeModal,"L")).toFixed(0)} w/{discountType}</div>}</button>
              </div>
              <button onClick={()=>setSizeModal(null)} style={{ width:"100%",marginTop:10,padding:"10px",background:"white",border:`1px solid ${C.border}`,borderRadius:9,color:C.text3,cursor:"pointer",fontWeight:700 }}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ background:"white",borderBottom:`1px solid ${C.border}`,padding:"0 12px",display:"flex",alignItems:"center",gap:8,height:48,flexShrink:0,boxShadow:C.shadow }}>
          <button onClick={()=>setPosScreen("main")} style={{ padding:"5px 9px",background:C.bg3,border:`1px solid ${C.border}`,borderRadius:6,color:C.text2,cursor:"pointer",fontSize:11,fontWeight:700 }}>←</button>
          <div style={{ flex:1 }}><div style={{ fontSize:13,fontWeight:900,color:C.primary }}>LIMJOE · {currentBranch.name}</div><div style={{ fontSize:9,color:C.text3 }}>{currentUser?.emoji} {currentUser?.name}</div></div>
          {cartCount>0&&<div style={{ background:C.primary,color:"white",borderRadius:20,padding:"3px 10px",fontWeight:900,fontSize:12 }}>{cartCount} items</div>}
          <button onClick={()=>setShowInventory(true)} style={{ padding:"5px 9px",background:lowStockCount>0?C.dangerBg:C.bg3,border:`1px solid ${lowStockCount>0?C.danger:C.border}`,borderRadius:6,color:lowStockCount>0?C.danger:C.text2,cursor:"pointer",fontSize:11,fontWeight:700 }}>📦{lowStockCount>0?` ${lowStockCount}!`:""}</button>
        </div>

        <div style={{ background:"white",borderBottom:`1px solid ${C.border}`,display:"flex",overflowX:"auto",scrollbarWidth:"none",flexShrink:0 }}>
          {activeCategories.map(c=>(<button key={c.key} onClick={()=>setActiveCat(c.key)} style={{ padding:"10px 13px",border:"none",background:"transparent",color:activeCat===c.key?c.color:C.text3,fontWeight:activeCat===c.key?900:600,fontSize:11,cursor:"pointer",whiteSpace:"nowrap",borderBottom:activeCat===c.key?`3px solid ${c.color}`:"3px solid transparent" }}>{c.label}</button>))}
        </div>

        <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
          <div style={{ flex:1,overflowY:"auto",padding:10,background:C.bg }}>
            {items.length===0?<div style={{ textAlign:"center",padding:"30px 0",color:C.text3,fontSize:13 }}>Walang products sa category na ito.<br/><span style={{ fontSize:11 }}>I-upload via Bulk Upload o mag-add sa Product Editor.</span></div>:
            <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8 }}>
              {items.map((item,idx)=>{ const mC=cart.find(c=>c.key===`${item.name}_M`); const lC=cart.find(c=>c.key===`${item.name}_L`); const inCart=mC||lC; const totalQty=(mC?.qty||0)+(lC?.qty||0); const bc=BORDER_COLORS[idx%BORDER_COLORS.length]; return(<button key={item.name} onClick={()=>setSizeModal(item)} style={{ background:inCart?"#f0fdf4":"white",border:`2px solid ${inCart?C.success:C.border}`,borderRadius:10,padding:"12px 6px",cursor:"pointer",textAlign:"center",position:"relative",display:"flex",flexDirection:"column",alignItems:"center",gap:3,minHeight:78,boxShadow:C.shadow }}>{inCart&&<div style={{ position:"absolute",top:4,right:4,background:C.success,color:"white",borderRadius:"50%",width:16,height:16,fontSize:9,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center" }}>{totalQty}</div>}<div style={{ fontSize:11,fontWeight:700,color:C.text,lineHeight:1.3 }}>{item.name}</div><div style={{ width:16,height:2,background:bc,borderRadius:1 }}/><div style={{ fontSize:9,color:C.text3 }}>₱{getPrice(item,"M")||""}{ item.medium?"-":""}₱{getPrice(item,"L")}</div></button>); })}
            </div>}
          </div>

          {cart.length>0&&(
            <div style={{ background:"white",borderTop:`1px solid ${C.border}`,maxHeight:110,overflowY:"auto" }}>
              {/* Cancel Order button */}
              <div style={{ display:"flex",justifyContent:"flex-end",padding:"4px 12px",borderBottom:`1px solid ${C.border}` }}>
                <button onClick={()=>{ if(window.confirm("Cancel lahat ng items sa order?")) setCart([]); }} style={{ padding:"3px 10px",background:C.dangerBg,border:`1px solid ${C.danger}`,borderRadius:6,color:C.danger,fontWeight:700,fontSize:11,cursor:"pointer" }}>🗑️ Cancel Order</button>
              </div>
              {cart.map(item=>(<div key={item.key} style={{ display:"flex",alignItems:"center",gap:6,padding:"4px 12px",borderBottom:`1px solid ${C.border}` }}>
                <div style={{ flex:1,fontSize:11,color:C.text }}>{item.name} <span style={{ color:C.text3 }}>({item.size})</span></div>
                <button onClick={()=>setQty(item.key,item.qty-1)} style={{ width:20,height:20,border:`1px solid ${C.border}`,background:C.bg3,color:C.text,borderRadius:4,cursor:"pointer",fontWeight:900,fontSize:12 }}>−</button>
                <span style={{ width:18,textAlign:"center",fontWeight:900,color:C.primary,fontSize:12 }}>{item.qty}</span>
                <button onClick={()=>setQty(item.key,item.qty+1)} style={{ width:20,height:20,border:`1px solid ${C.border}`,background:C.bg3,color:C.text,borderRadius:4,cursor:"pointer",fontWeight:900,fontSize:12 }}>+</button>
                <span style={{ fontWeight:700,fontSize:11,color:C.warning,minWidth:44,textAlign:"right" }}>₱{(getFinalPrice(item.price)*item.qty).toFixed(0)}</span>
                <button onClick={()=>{ setCart(prev=>prev.filter(c=>c.key!==item.key)); }} style={{ width:22,height:22,border:`1px solid ${C.danger}`,background:C.dangerBg,color:C.danger,borderRadius:4,cursor:"pointer",fontWeight:900,fontSize:12 }}>🗑️</button>
              </div>))}
            </div>
          )}

          <div style={{ background:"white",borderTop:`2px solid ${C.border}`,flexShrink:0 }}>
            <div style={{ display:"flex",borderBottom:`1px solid ${C.border}` }}>
              {[{key:"payment",label:"Payment"},{key:"discount",label:"Discount"},{key:"expense",label:"Expenses"}].map(t=>(<button key={t.key} onClick={()=>setPayTab(t.key)} style={{ flex:1,padding:"9px",border:"none",background:"transparent",color:payTab===t.key?C.primary:C.text3,fontWeight:payTab===t.key?800:600,fontSize:11,cursor:"pointer",borderBottom:payTab===t.key?`2px solid ${C.primary}`:"2px solid transparent" }}>{t.label}</button>))}
            </div>
            {payTab==="payment"&&(<div style={{ padding:"8px 12px" }}><div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:5 }}><button onClick={()=>setPaymentMethod("cash")} style={{ padding:"6px 10px",background:paymentMethod==="cash"?C.successBg:"white",border:`1.5px solid ${paymentMethod==="cash"?C.success:C.border}`,borderRadius:6,color:paymentMethod==="cash"?C.success:C.text2,fontWeight:800,fontSize:11,cursor:"pointer" }}>💵 Cash</button>{paymentMethod==="cash"&&[20,50,100,200,500,1000].map(b=>(<button key={b} onClick={()=>setCashGiven(b)} style={{ padding:"6px 9px",background:cashGiven===b?C.successBg:"white",border:`1.5px solid ${cashGiven===b?C.success:C.border}`,borderRadius:6,color:cashGiven===b?C.success:C.text2,fontWeight:800,fontSize:11,cursor:"pointer" }}>₱{b}</button>))}{paymentMethod==="cash"&&<input type="number" value={cashGiven||""} onChange={e=>setCashGiven(parseFloat(e.target.value)||0)} placeholder="₱" style={{ width:65,padding:"6px 7px",fontSize:12,fontWeight:700,borderRadius:6,border:`1.5px solid ${C.border}`,background:"white",color:C.warning,outline:"none" }}/>}</div><div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:4 }}>{PAYMENT_METHODS.filter(p=>p.type==="cashless").map(p=>(<button key={p.key} onClick={()=>{setPaymentMethod(p.key);setCashGiven(total);}} style={{ padding:"6px 10px",background:paymentMethod===p.key?p.color+"11":"white",border:`1.5px solid ${paymentMethod===p.key?p.color:C.border}`,borderRadius:6,color:paymentMethod===p.key?p.color:C.text2,fontWeight:800,fontSize:11,cursor:"pointer" }}>{p.emoji} {p.label}</button>))}</div><div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>{PAYMENT_METHODS.filter(p=>p.type==="online").map(p=>(<button key={p.key} onClick={()=>{setPaymentMethod(p.key);setCashGiven(total);}} style={{ padding:"6px 10px",background:paymentMethod===p.key?p.color+"11":"white",border:`1.5px solid ${paymentMethod===p.key?p.color:C.border}`,borderRadius:6,color:paymentMethod===p.key?p.color:C.text2,fontWeight:800,fontSize:11,cursor:"pointer" }}>{p.emoji} {p.label}</button>))}</div></div>)}
            {payTab==="discount"&&(<div style={{ padding:"8px 12px" }}><div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>{["5%","10%","20%"].map(d=><button key={d} onClick={()=>setDiscountType(discountType===d?null:d)} style={{ padding:"7px 12px",background:discountType===d?C.infoBg:"white",border:`1.5px solid ${discountType===d?C.info:C.border}`,borderRadius:7,color:discountType===d?C.info:C.text2,fontWeight:800,fontSize:12,cursor:"pointer" }}>{d}</button>)}{["SNR","PWD"].map(d=><button key={d} onClick={()=>setDiscountType(discountType===d?null:d)} style={{ padding:"7px 14px",background:discountType===d?C.successBg:"white",border:`1.5px solid ${discountType===d?C.success:C.border}`,borderRadius:7,color:discountType===d?C.success:C.text2,fontWeight:900,fontSize:13,cursor:"pointer" }}>{d}</button>)}{discountType&&<button onClick={()=>setDiscountType(null)} style={{ padding:"7px 10px",background:C.dangerBg,border:`1.5px solid ${C.danger}`,borderRadius:7,color:C.danger,fontWeight:800,fontSize:11,cursor:"pointer" }}>✕</button>}</div>{discountType&&<div style={{ fontSize:10,color:C.text3,marginTop:5 }}>{discountType==="SNR"||discountType==="PWD"?`Gross ÷ 1.12 × 80% | Save: ₱${discountAmt.toFixed(2)}`:`Discount: ₱${discountAmt.toFixed(2)}`}</div>}</div>)}
            {payTab==="expense"&&(<div style={{ padding:"8px 12px" }}><div style={{ display:"flex",gap:5,marginBottom:4 }}><input value={expDesc} onChange={e=>setExpDesc(e.target.value)} placeholder="Description" style={{ flex:2,padding:"7px 9px",fontSize:11,borderRadius:7,border:`1.5px solid ${C.border}`,background:"white",color:C.text,outline:"none" }}/><input type="number" value={expAmt} onChange={e=>setExpAmt(e.target.value)} placeholder="₱" style={{ flex:1,padding:"7px 7px",fontSize:11,borderRadius:7,border:`1.5px solid ${C.border}`,background:"white",color:C.warning,outline:"none" }}/><button onClick={addExpense} style={{ padding:"7px 11px",background:C.primary,border:"none",borderRadius:7,color:"white",fontWeight:900,cursor:"pointer",fontSize:13 }}>+</button></div><div style={{ fontSize:9,color:C.danger,fontWeight:700 }}>Today: ₱{getExps(todayStr(),currentBranch.id).reduce((s,e)=>s+parseFloat(e.amount),0).toFixed(2)}</div></div>)}

            <div style={{ padding:"8px 12px 10px",display:"flex",alignItems:"center",gap:10,borderTop:`1px solid ${C.border}` }}>
              <div style={{ flex:1 }}><div style={{ display:"flex",gap:12 }}><div><div style={{ fontSize:9,color:C.text3 }}>Total</div><div style={{ fontWeight:900,fontSize:16,color:C.primary }}>₱{total.toFixed(2)}</div>{discountType&&<div style={{ fontSize:8,color:C.warning }}>-₱{discountAmt.toFixed(2)}</div>}</div><div>{paymentMethod==="cash"&&cashGiven>=total&&cashGiven>0&&<><div style={{ fontSize:9,color:C.text3 }}>Sukli</div><div style={{ fontWeight:900,fontSize:16,color:C.warning }}>₱{change.toFixed(2)}</div></>}{paymentMethod!=="cash"&&<><div style={{ fontSize:9,color:C.text3 }}>Via</div><div style={{ fontSize:13,color:pm?.color,fontWeight:700 }}>{pm?.emoji} {pm?.label}</div></>}</div></div></div>
              <button onClick={doCheckout} disabled={!canCharge} style={{ padding:"13px 20px",background:canCharge?C.primary:C.bg3,border:`1px solid ${canCharge?C.primary:C.border}`,borderRadius:11,color:canCharge?"white":C.text3,fontWeight:900,fontSize:15,cursor:canCharge?"pointer":"not-allowed",minWidth:110 }}>{cart.length===0?"₱0":!canCharge?"Add Cash":"Charge ›"}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══ ADMIN PORTAL ══════════════════════════════════════════════════════════
  if (env==="admin") {
    const rOrders=getOrders(reportDate,bFilter); const rExps=getExps(reportDate,bFilter); const rSum=calcSum(rOrders); const rExpTotal=rExps.reduce((s,e)=>s+parseFloat(e.amount),0); const rNet=rSum.gross-rExpTotal;
    const todayOrders=getOrders(todayStr(),bFilter); const todaySum=calcSum(todayOrders); const todayExp=getExps(todayStr(),bFilter).reduce((s,e)=>s+parseFloat(e.amount),0);
    const monthRows=(()=>{ const[y,m]=reportMonth.split("-"); const days=new Date(parseInt(y),parseInt(m),0).getDate(); const rows=[]; for(let d=1;d<=days;d++){const dk=`${reportMonth}-${String(d).padStart(2,"0")}`; const ords=getOrders(dk,bFilter); const exps=getExps(dk,bFilter); const cohKey=bFilter?`${bFilter}_${dk}`:null; const cohVal=cohKey?parseFloat(cashOnHand[cohKey]??NaN):NaN; if(!ords.length&&!exps.length&&isNaN(cohVal))continue; const gross=ords.reduce((s,o)=>s+o.total,0); const exp=exps.reduce((s,e)=>s+parseFloat(e.amount),0); const byMethod={}; PAYMENT_METHODS.forEach(p=>{byMethod[p.key]=0;}); ords.forEach(o=>{if(byMethod[o.paymentMethod]!==undefined)byMethod[o.paymentMethod]+=o.total;}); const nonCash=(byMethod.grabfood||0)+(byMethod.foodpanda||0)+(byMethod.gcash||0)+(byMethod.maya||0)+(byMethod.gotyme||0)+(byMethod.sm||0); const net=gross-nonCash-exp; let remarks="—"; if(!isNaN(cohVal)){const diff=Math.round((cohVal-net)*100)/100;remarks=Math.abs(diff)<1?"MATCHED":diff>0?`OVER ₱${diff.toFixed(2)}`:`SHORT ₱${Math.abs(diff).toFixed(2)}`;} rows.push({date:dk,gross,...byMethod,expenses:exp,net,cashOnHand:isNaN(cohVal)?null:cohVal,remarks,txns:ords.length}); } return rows; })();
    const payrollRows=employees.map(emp=>{let totalMins=0;let workDays=0;const start=new Date(payrollFrom),end=new Date(payrollTo);for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)){const dk=d.toISOString().split("T")[0];let dayMins=0;BRANCHES.forEach(b=>{const logs=getEmpDTR(emp.id,b.id,dk);dayMins+=logs.filter(l=>l.out).reduce((s,l)=>s+calcMins(l.in,l.out),0);});if(dayMins>0){workDays++;totalMins+=dayMins;}}return{...emp,workDays,totalMins,totalHrs:formatHrs(totalMins)};});

    const TABS=[{key:"dashboard",label:"📊 Dashboard"},{key:"xreport",label:"📋 X Reading"},{key:"zreport",label:"🔒 Z Reading"},{key:"monthly",label:"📅 Monthly"},{key:"channels",label:"💳 Channels"},{key:"deposit",label:"🏦 Deposit"},{key:"dtr",label:"🕐 DTR"},{key:"payroll",label:"💰 Payroll"},{key:"employees",label:"👥 Employees"},{key:"products",label:"🛍️ Products"},{key:"inventory",label:"📦 Inventory"}];

    return (
      <div style={{ background:C.bg,height:"100vh",display:"flex",flexDirection:"column",fontFamily:"sans-serif",overflow:"hidden",color:C.text }}>
        {notif&&<Toast notif={notif}/>} {modals}
        <div style={{ background:"white",borderBottom:`2px solid ${C.accent}22`,padding:"0 12px",display:"flex",alignItems:"center",gap:8,height:50,flexShrink:0,boxShadow:C.shadow }}>
          <div style={{ width:34,height:34,borderRadius:"50%",background:`${C.accent}15`,border:`2px solid ${C.accent}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>🔐</div>
          <div style={{ flex:1 }}><div style={{ fontSize:13,fontWeight:900,color:C.accent }}>LIMJOE ADMIN PORTAL</div><div style={{ fontSize:9,color:C.text3 }}>{currentUser?.emoji} {currentUser?.name} · {currentUser?.role}</div></div>
          <select value={selectedBranch} onChange={e=>setSelectedBranch(e.target.value)} style={{ padding:"5px 8px",background:"white",border:`1px solid ${C.border}`,borderRadius:6,color:C.text2,fontSize:11,cursor:"pointer" }}><option value="all">All Branches</option>{BRANCHES.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select>
          <button onClick={()=>{setCurrentUser(null);setEnv("home");}} style={{ padding:"6px 12px",background:C.dangerBg,border:`1px solid ${C.danger}`,borderRadius:7,color:C.danger,cursor:"pointer",fontWeight:700,fontSize:11 }}>Logout</button>
        </div>

        <div style={{ background:"white",borderBottom:`1px solid ${C.border}`,display:"flex",overflowX:"auto",scrollbarWidth:"none",flexShrink:0 }}>
          {TABS.map(t=>(<button key={t.key} onClick={()=>setAdminTab(t.key)} style={{ padding:"10px 12px",border:"none",background:"transparent",color:adminTab===t.key?C.accent:C.text3,fontWeight:adminTab===t.key?800:600,fontSize:11,cursor:"pointer",whiteSpace:"nowrap",borderBottom:adminTab===t.key?`2px solid ${C.accent}`:"2px solid transparent",position:"relative" }}>
            {t.label}
            {t.key==="inventory"&&lowStockCount>0&&<span style={{ position:"absolute",top:6,right:4,background:C.danger,color:"white",borderRadius:"50%",width:14,height:14,fontSize:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900 }}>{lowStockCount}</span>}
          </button>))}
        </div>

        <div style={{ flex:1,overflowY:"auto",padding:14 }}>

          {/* ── PRODUCTS TAB ── */}
          {adminTab==="products"&&(
            <div>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
                <div style={PT}>🛍️ Product Management</div>
                <div style={{ display:"flex",gap:8 }}>
                  <button onClick={()=>setShowBulkUpload(true)} style={{ padding:"8px 14px",background:C.accent,border:"none",borderRadius:8,color:"white",fontWeight:700,fontSize:12,cursor:"pointer" }}>📤 Bulk Upload</button>
                  <button onClick={()=>setShowProductEditor(true)} style={{ padding:"8px 14px",background:C.primary,border:"none",borderRadius:8,color:"white",fontWeight:700,fontSize:12,cursor:"pointer" }}>+ Edit Products</button>
                </div>
              </div>
              <div style={{ background:C.infoBg,borderRadius:10,padding:"12px 14px",marginBottom:14,border:`1px solid ${C.info}` }}>
                <div style={{ fontSize:12,fontWeight:700,color:C.info }}>ℹ️ Product Management</div>
                <div style={{ fontSize:12,color:C.text2,marginTop:4 }}>
                  <b>Admin/Owner:</b> Pwedeng mag-add, edit, at delete ng products at prices.<br/>
                  <b>Cashier/Manager:</b> Pwedeng mag-edit ng products pero hindi pwedeng mag-delete.<br/>
                  <b>Bulk Upload:</b> I-upload ang Excel template para mag-update ng maraming products nang sabay-sabay.
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                <div onClick={()=>setShowProductEditor(true)} style={{ background:"white",borderRadius:12,padding:"18px",border:`2px solid ${C.info}`,cursor:"pointer",textAlign:"center" }}>
                  <div style={{ fontSize:32 }}>🛍️</div>
                  <div style={{ fontWeight:700,fontSize:14,color:C.info,marginTop:8 }}>Product Editor</div>
                  <div style={{ fontSize:11,color:C.text3,marginTop:4 }}>Add, edit, delete products at prices</div>
                </div>
                <div onClick={()=>setShowBulkUpload(true)} style={{ background:"white",borderRadius:12,padding:"18px",border:`2px solid ${C.accent}`,cursor:"pointer",textAlign:"center" }}>
                  <div style={{ fontSize:32 }}>📤</div>
                  <div style={{ fontWeight:700,fontSize:14,color:C.accent,marginTop:8 }}>Bulk Upload</div>
                  <div style={{ fontSize:11,color:C.text3,marginTop:4 }}>Excel upload para sa maraming products</div>
                </div>
              </div>
            </div>
          )}

          {/* ── INVENTORY TAB ── */}
          {adminTab==="inventory"&&(
            <div>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
                <div style={PT}>📦 Inventory Management</div>
                <div style={{ display:"flex",gap:8 }}>
                  <button onClick={()=>setShowBulkUpload(true)} style={{ padding:"8px 14px",background:C.info,border:"none",borderRadius:8,color:"white",fontWeight:700,fontSize:12,cursor:"pointer" }}>📤 Bulk Upload</button>
                  <button onClick={()=>setShowInventory(true)} style={{ padding:"8px 14px",background:C.warning,border:"none",borderRadius:8,color:"white",fontWeight:700,fontSize:12,cursor:"pointer" }}>📦 View Inventory</button>
                </div>
              </div>
              {lowStockCount>0&&<div style={{ background:C.dangerBg,borderRadius:10,padding:"12px 14px",marginBottom:14,border:`1px solid ${C.danger}` }}>
                <div style={{ fontSize:13,fontWeight:800,color:C.danger }}>⚠️ {lowStockCount} item(s) mababa na ang stock!</div>
                <button onClick={()=>setShowInventory(true)} style={{ marginTop:8,padding:"6px 14px",background:C.danger,border:"none",borderRadius:7,color:"white",fontWeight:700,fontSize:12,cursor:"pointer" }}>Tingnan ang Inventory →</button>
              </div>}
              <div style={{ background:C.infoBg,borderRadius:10,padding:"12px 14px",marginBottom:14,border:`1px solid ${C.info}` }}>
                <div style={{ fontSize:12,fontWeight:700,color:C.info }}>ℹ️ Paano gumagana ang inventory</div>
                <div style={{ fontSize:12,color:C.text2,marginTop:4 }}>
                  Kapag nag-punch ng order → automatic na bawas ang raw materials base sa recipe.<br/>
                  Mag-upload ng Raw Materials & Recipes Excel template para i-setup ang inventory.
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                <div onClick={()=>setShowInventory(true)} style={{ background:"white",borderRadius:12,padding:"18px",border:`2px solid ${C.warning}`,cursor:"pointer",textAlign:"center" }}>
                  <div style={{ fontSize:32 }}>📦</div>
                  <div style={{ fontWeight:700,fontSize:14,color:C.warning,marginTop:8 }}>View & Adjust Stock</div>
                  <div style={{ fontSize:11,color:C.text3,marginTop:4 }}>Manual stock adjustment at low stock alerts</div>
                </div>
                <div onClick={()=>setShowBulkUpload(true)} style={{ background:"white",borderRadius:12,padding:"18px",border:`2px solid ${C.info}`,cursor:"pointer",textAlign:"center" }}>
                  <div style={{ fontSize:32 }}>📤</div>
                  <div style={{ fontWeight:700,fontSize:14,color:C.info,marginTop:8 }}>Upload Materials & Recipes</div>
                  <div style={{ fontSize:11,color:C.text3,marginTop:4 }}>Excel upload para sa raw materials at recipes</div>
                </div>
              </div>
            </div>
          )}

          {/* ── DASHBOARD ── */}
          {adminTab==="dashboard"&&(
            <div>
              <div style={PT}>📊 Dashboard — {todayStr()}</div>
              <div style={SR}><SB label="Gross" val={`₱${todaySum.gross.toFixed(0)}`} color={C.success}/><SB label="Expenses" val={`₱${todayExp.toFixed(0)}`} color={C.danger}/><SB label="NET" val={`₱${(todaySum.gross-todayExp).toFixed(0)}`} color={C.warning}/><SB label="Txns" val={todaySum.txns} color={C.info}/></div>
              {lowStockCount>0&&<div style={{ background:C.dangerBg,borderRadius:10,padding:"10px 14px",marginBottom:12,border:`1px solid ${C.danger}`,display:"flex",justifyContent:"space-between",alignItems:"center" }}><div style={{ fontSize:12,color:C.danger,fontWeight:700 }}>⚠️ {lowStockCount} raw materials na mababa ang stock!</div><button onClick={()=>setAdminTab("inventory")} style={{ padding:"5px 12px",background:C.danger,border:"none",borderRadius:6,color:"white",fontWeight:700,fontSize:11,cursor:"pointer" }}>Tingnan →</button></div>}
              <div style={SEC}>SALES PER BRANCH TODAY</div>
              {BRANCHES.map(b=>{ const bOrds=getOrders(todayStr(),b.id); const bSum=calcSum(bOrds); const bExp=getExps(todayStr(),b.id).reduce((s,e)=>s+parseFloat(e.amount),0); return(<div key={b.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"white",borderRadius:10,marginBottom:8,border:`1px solid ${C.border}`,boxShadow:C.shadow }}><div style={{ flex:1 }}><div style={{ fontWeight:700,fontSize:13 }}>🏪 {b.name}</div><div style={{ fontSize:10,color:C.text3 }}>{bSum.txns} orders · Exp: ₱{bExp.toFixed(0)}</div></div><div style={{ textAlign:"right" }}><div style={{ fontWeight:900,fontSize:15,color:C.success }}>₱{bSum.gross.toFixed(0)}</div><div style={{ fontSize:10,color:C.warning }}>Net: ₱{(bSum.gross-bExp).toFixed(0)}</div></div></div>); })}
              <div style={SEC}>🏆 Top 8 Items Today</div>
              {todaySum.top8.length===0?<div style={EM}>Wala pang sales</div>:todaySum.top8.map(([n,d],i)=>(<div key={n} style={TR}><span style={{ color:i<3?["#d97706","#64748b","#92400e"][i]:C.text3,fontWeight:900,width:22 }}>#{i+1}</span><span style={{ flex:1,fontSize:12 }}>{n}</span><span style={{ color:C.text3,fontSize:11 }}>×{d.qty}</span><span style={{ color:C.success,fontWeight:700 }}>₱{d.sales.toFixed(0)}</span></div>))}
            </div>
          )}

          {adminTab==="xreport"&&(<div><div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8 }}><div style={PT}>📋 X Reading</div><div style={{ display:"flex",gap:8 }}><input type="date" value={reportDate} onChange={e=>setReportDate(e.target.value)} style={{ padding:"6px 10px",borderRadius:7,border:`1px solid ${C.border}`,background:"white",color:C.text,fontSize:11 }}/><button onClick={()=>printWin(`<div class="c"><div class="brand">LIMJOE</div><div style="font-size:9px;color:#666">X READING — ${reportDate}<br>Printed: ${nowFull()}</div></div><div class="dv"></div><div class="row big"><span>Gross</span><span>₱${rSum.gross.toFixed(2)}</span></div><div class="row"><span>Expenses</span><span>-₱${rExpTotal.toFixed(2)}</span></div><div class="row big"><span>NET</span><span>₱${rNet.toFixed(2)}</span></div><div class="row"><span>Txns</span><span>${rOrders.length}</span></div><div class="dv"></div><div class="sec">Top 8 Items</div>${rSum.top8.map(([n,d],i)=>`<div class="row"><span>#${i+1} ${n}</span><span>×${d.qty}=₱${d.sales.toFixed(2)}</span></div>`).join("")}<div class="dv"></div><div class="sec">Orders</div>${rOrders.map(o=>`<div class="row" style="font-size:10px"><span>#${o.id} ${o.time} ${o.cashier}</span><span>₱${o.total.toFixed(2)}</span></div>`).join("")}`)} style={{ padding:"6px 12px",background:C.accent,border:"none",borderRadius:7,color:"white",fontWeight:700,fontSize:11,cursor:"pointer" }}>🖨️ Print</button></div></div><div style={SR}><SB label="Gross" val={`₱${rSum.gross.toFixed(0)}`} color={C.success}/><SB label="Expenses" val={`-₱${rExpTotal.toFixed(0)}`} color={C.danger}/><SB label="NET" val={`₱${rNet.toFixed(0)}`} color={C.warning}/><SB label="Txns" val={rOrders.length} color={C.info}/></div><div style={SEC}>🏆 Top 8 Items</div>{rSum.top8.map(([n,d],i)=>(<div key={n} style={TR}><span style={{ color:i<3?["#d97706","#64748b","#92400e"][i]:C.text3,fontWeight:900,width:22 }}>#{i+1}</span><span style={{ flex:1,fontSize:12 }}>{n}</span><span style={{ color:C.text3 }}>×{d.qty}</span><span style={{ color:C.success,fontWeight:700 }}>₱{d.sales.toFixed(0)}</span></div>))}<div style={SEC}>Order Log</div>{rOrders.length===0?<div style={EM}>Walang orders</div>:rOrders.map(o=>{ const p=PAYMENT_METHODS.find(pm=>pm.key===o.paymentMethod); const canVoid=ROLE_LEVEL[currentUser?.role||"cashier"]>=2; return(<div key={o.id} style={{ background:"white",borderRadius:10,padding:"10px 12px",marginBottom:6,border:`1px solid ${o.voided?C.danger:C.border}`,opacity:o.voided?0.6:1 }}><div style={{ display:"flex",flexWrap:"wrap",fontSize:11,gap:8,alignItems:"center" }}><span style={{ color:C.warning,fontWeight:700 }}>#{o.id}</span><span style={{ color:C.text3 }}>{o.time}</span><span style={{ color:C.info }}>{o.cashier}</span><span style={{ color:C.text3 }}>{o.branch}</span><span style={{ color:p?.color }}>{p?.emoji}</span>{o.discountType&&<span style={{ color:C.warning }}>[{o.discountType}]</span>}<span style={{ color:C.success,fontWeight:700 }}>₱{o.total.toFixed(2)}</span>{o.voided&&<span style={{ background:C.dangerBg,color:C.danger,padding:"1px 7px",borderRadius:20,fontSize:10,fontWeight:700 }}>VOIDED</span>}{canVoid&&!o.voided&&(<button onClick={async()=>{ if(!window.confirm(`Void Order #${o.id} — ₱${o.total.toFixed(2)}?\nHindi na mababawi!`))return; const reason=window.prompt("Reason for void:"); if(!reason)return; await sb(`orders?order_num=eq.${o.id}&branch_id=eq.${o.branchId}&order_date=eq.${o.date}`,"PATCH",{is_voided:true,void_reason:reason,voided_by:currentUser?.name}); toast(`Order #${o.id} voided!`); await loadFromSupabase(); }} style={{ padding:"2px 8px",background:C.dangerBg,border:`1px solid ${C.danger}`,borderRadius:6,color:C.danger,fontWeight:700,fontSize:10,cursor:"pointer" }}>🚫 Void</button>)}</div><div style={{ marginTop:4,fontSize:10,color:C.text3 }}>{o.items?.map(i=>`${i.name}(${i.size})×${i.qty}`).join(" · ")}</div></div>); })}</div>)}

          {adminTab==="zreport"&&(<div><div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8 }}><div style={PT}>🔒 Z Reading — {reportDate}</div><div style={{ display:"flex",gap:8 }}><input type="date" value={reportDate} onChange={e=>setReportDate(e.target.value)} style={{ padding:"6px 10px",borderRadius:7,border:`1px solid ${C.border}`,background:"white",color:C.text,fontSize:11 }}/><button onClick={()=>printWin(`<div class="c"><div class="brand">LIMJOE</div><div style="font-size:9px;color:#666">Z READING — ${reportDate}<br>Printed: ${nowFull()}</div></div><div class="dv"></div><div class="row big"><span>GROSS</span><span>₱${rSum.gross.toFixed(2)}</span></div><div class="row"><span>EXPENSES</span><span>-₱${rExpTotal.toFixed(2)}</span></div><div class="row big"><span>NET</span><span>₱${rNet.toFixed(2)}</span></div><div class="dv"></div><div class="sec">Top 8 Items</div>${rSum.top8.map(([n,d],i)=>`<div class="row"><span>#${i+1} ${n}</span><span>×${d.qty}=₱${d.sales.toFixed(2)}</span></div>`).join("")}<div class="dv"></div><div class="c big">*** END OF DAY ***</div>`)} style={{ padding:"6px 12px",background:C.accent,border:"none",borderRadius:7,color:"white",fontWeight:700,fontSize:11,cursor:"pointer" }}>🖨️ Print</button></div></div><div style={SR}><SB label="GROSS" val={`₱${rSum.gross.toFixed(0)}`} color={C.success} big/><SB label="EXPENSES" val={`-₱${rExpTotal.toFixed(0)}`} color={C.danger} big/><SB label="NET" val={`₱${rNet.toFixed(0)}`} color={C.warning} big/></div><div style={SEC}>By Channel</div>{PAYMENT_METHODS.map(p=>{const d=rSum.pmSales[p.key];if(!d?.sales)return null;return(<div key={p.key} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"white",borderRadius:9,marginBottom:6,border:`1px solid ${C.border}`,boxShadow:C.shadow }}><span style={{ fontSize:18 }}>{p.emoji}</span><span style={{ flex:1,fontWeight:700,fontSize:13 }}>{p.label}</span><span style={{ color:C.text3,fontSize:11 }}>{d.count} orders</span><span style={{ color:p.color,fontWeight:900,fontSize:15 }}>₱{d.sales.toFixed(2)}</span></div>);})}<div style={SEC}>🏆 Top 8 Items</div>{rSum.top8.map(([n,d],i)=>(<div key={n} style={TR}><span style={{ color:i<3?["#d97706","#64748b","#92400e"][i]:C.text3,fontWeight:900,width:22 }}>#{i+1}</span><span style={{ flex:1 }}>{n}</span><span style={{ color:C.text3 }}>×{d.qty}</span><span style={{ color:C.success,fontWeight:700 }}>₱{d.sales.toFixed(0)}</span></div>))}</div>)}

          {adminTab==="monthly"&&(<div><div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8 }}><div style={PT}>📅 Monthly Report</div><div style={{ display:"flex",gap:8 }}><input type="month" value={reportMonth} onChange={e=>setReportMonth(e.target.value)} style={{ padding:"6px 10px",borderRadius:7,border:`1px solid ${C.border}`,background:"white",color:C.text,fontSize:11 }}/></div></div>{bFilter===null&&<div style={{ background:C.warningBg,borderRadius:10,padding:"10px 14px",marginBottom:14,border:`1px solid ${C.warning}` }}><div style={{ fontSize:11,color:C.warning,fontWeight:700 }}>ℹ️ Pumili ng specific branch para makita ang Cash on Hand</div></div>}{monthRows.length>0&&<div style={SR}><SB label="Monthly Gross" val={`₱${monthRows.reduce((s,r)=>s+r.gross,0).toFixed(0)}`} color={C.success}/><SB label="Expenses" val={`₱${monthRows.reduce((s,r)=>s+r.expenses,0).toFixed(0)}`} color={C.danger}/><SB label="NET" val={`₱${monthRows.reduce((s,r)=>s+r.net,0).toFixed(0)}`} color={C.warning}/><SB label="Txns" val={monthRows.reduce((s,r)=>s+r.txns,0)} color={C.info}/></div>}{monthRows.length===0?<div style={{...EM,padding:"20px"}}>Walang data sa buwan na ito</div>:monthRows.map(r=>{ const inputKey=`${bFilter}_${r.date}`; const isEditing=inputKey in cohInput; const remarksColor=r.remarks==="MATCHED"?C.success:r.remarks==="—"?C.text3:r.remarks.startsWith("OVER")?C.info:C.danger; return(<div key={r.date} style={{ background:"white",borderRadius:12,border:`1px solid ${C.border}`,boxShadow:C.shadow,marginBottom:10,padding:"12px 14px" }}><div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}><div style={{ fontWeight:800,fontSize:14,color:C.text }}>{r.date}</div><div style={{ fontWeight:900,fontSize:15,color:C.success }}>₱{r.gross.toFixed(2)}</div></div><div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8 }}>{PAYMENT_METHODS.filter(p=>p.key!=="cash").map(p=>(<div key={p.key} style={{ background:C.bg3,borderRadius:7,padding:"6px 8px",textAlign:"center" }}><div style={{ fontSize:11,fontWeight:800,color:p.color }}>₱{(r[p.key]||0).toFixed(0)}</div><div style={{ fontSize:8,color:C.text3 }}>{p.emoji} {p.label}</div></div>))}</div><div style={{ display:"flex",justifyContent:"space-between",fontSize:12,padding:"4px 0",borderTop:`1px solid ${C.border}` }}><span style={{ color:C.text3 }}>Expenses</span><span style={{ color:C.danger,fontWeight:700 }}>-₱{r.expenses.toFixed(2)}</span></div><div style={{ display:"flex",justifyContent:"space-between",fontSize:14,padding:"6px 0",borderTop:`1px solid ${C.border}`,fontWeight:900 }}><span style={{ color:C.text }}>NET SALES</span><span style={{ color:C.warning }}>₱{r.net.toFixed(2)}</span></div>{bFilter!==null&&(<div style={{ marginTop:8,paddingTop:8,borderTop:`1px dashed ${C.border}` }}><div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}><span style={{ fontSize:11,color:C.text3,minWidth:90 }}>Cash on Hand:</span><input type="number" value={isEditing?cohInput[inputKey]:(r.cashOnHand??"")} onChange={e=>setCohInput(prev=>({...prev,[inputKey]:e.target.value}))} placeholder="₱0.00" style={{ flex:1,minWidth:90,padding:"6px 9px",fontSize:13,fontWeight:700,borderRadius:7,border:`1.5px solid ${C.border}`,color:C.warning }}/><button onClick={()=>{ const val=parseFloat(isEditing?cohInput[inputKey]:r.cashOnHand); if(isNaN(val)){toast("Lagay ng valid amount!","err");return;} saveCashOnHand(bFilter,r.date,val); setCohInput(prev=>{const c={...prev};delete c[inputKey];return c;}); }} style={{ padding:"6px 14px",background:C.primary,border:"none",borderRadius:7,color:"white",fontWeight:700,fontSize:11,cursor:"pointer" }}>Save</button></div>{r.remarks!=="—"&&(<div style={{ marginTop:8,padding:"6px 10px",background:remarksColor+"15",borderRadius:7,fontSize:12,fontWeight:800,color:remarksColor,textAlign:"center" }}>{r.remarks==="MATCHED"?"✅ MATCHED":`⚠️ ${r.remarks}`}</div>)}</div>)}</div>); })}</div>)}

          {adminTab==="channels"&&(<div><div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8 }}><div style={PT}>💳 Sales Channels</div><input type="date" value={reportDate} onChange={e=>setReportDate(e.target.value)} style={{ padding:"6px 10px",borderRadius:7,border:`1px solid ${C.border}`,background:"white",color:C.text,fontSize:11 }}/></div><div style={SR}><SB label="Cash" val={`₱${Object.entries(rSum.pmSales).filter(([k])=>PAYMENT_METHODS.find(p=>p.key===k&&p.type==="cash")).reduce((s,[,d])=>s+d.sales,0).toFixed(0)}`} color={C.success}/><SB label="Cashless" val={`₱${Object.entries(rSum.pmSales).filter(([k])=>PAYMENT_METHODS.find(p=>p.key===k&&p.type==="cashless")).reduce((s,[,d])=>s+d.sales,0).toFixed(0)}`} color={C.info}/><SB label="Online" val={`₱${Object.entries(rSum.pmSales).filter(([k])=>PAYMENT_METHODS.find(p=>p.key===k&&p.type==="online")).reduce((s,[,d])=>s+d.sales,0).toFixed(0)}`} color="#db2777"/></div>{PAYMENT_METHODS.map(p=>{const d=rSum.pmSales[p.key];if(!d?.sales)return null;return(<div key={p.key} style={{ display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"white",borderRadius:10,marginBottom:8,border:`1px solid ${C.border}`,boxShadow:C.shadow }}><span style={{ fontSize:22 }}>{p.emoji}</span><div style={{ flex:1 }}><div style={{ fontWeight:700,fontSize:13 }}>{p.label}</div><div style={{ fontSize:10,color:C.text3 }}>{d.count} orders · {p.type}</div></div><div style={{ fontWeight:900,fontSize:18,color:p.color }}>₱{d.sales.toFixed(2)}</div></div>);})} {Object.keys(rSum.pmSales).length===0&&<div style={EM}>Walang sales</div>}</div>)}

          {adminTab==="deposit"&&(<div><div style={PT}>🏦 Bank Deposit Checker</div><div style={{ background:"white",borderRadius:14,padding:16,border:`1px solid ${C.border}`,boxShadow:C.shadow,marginBottom:16 }}><div style={{ fontSize:11,color:C.text3,fontWeight:700,marginBottom:12 }}>CHECK DEPOSIT VS ACTUAL CASH SALES</div><div style={{ display:"flex",gap:8,marginBottom:10,flexWrap:"wrap" }}><div style={{ flex:1 }}><div style={{ fontSize:10,color:C.text3,marginBottom:4 }}>Date From</div><input type="date" value={depositFrom} onChange={e=>setDepositFrom(e.target.value)} style={{ width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,background:"white",color:C.text,fontSize:12,boxSizing:"border-box" }}/></div><div style={{ flex:1 }}><div style={{ fontSize:10,color:C.text3,marginBottom:4 }}>Date To</div><input type="date" value={depositTo} onChange={e=>setDepositTo(e.target.value)} style={{ width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,background:"white",color:C.text,fontSize:12,boxSizing:"border-box" }}/></div></div><div style={{ marginBottom:14 }}><div style={{ fontSize:10,color:C.text3,marginBottom:4 }}>Deposit Amount</div><input type="number" value={depositAmt} onChange={e=>setDepositAmt(e.target.value)} placeholder="₱0.00" style={{ width:"100%",padding:"12px",fontSize:22,fontWeight:900,borderRadius:8,border:`2px solid ${C.border}`,background:"white",color:C.warning,outline:"none",boxSizing:"border-box" }}/></div><div style={{ display:"flex",gap:8 }}><button onClick={checkDeposit} disabled={depositLoading} style={{ flex:2,padding:"14px",background:depositLoading?C.bg3:C.accent,border:"none",borderRadius:10,color:depositLoading?C.text3:"white",fontWeight:900,fontSize:15,cursor:depositLoading?"not-allowed":"pointer" }}>{depositLoading?"🔍 Checking...":"🔍 Check Deposit"}</button>{depositResult&&<button onClick={clearDeposit} style={{ flex:1,padding:"14px",background:C.dangerBg,border:`1px solid ${C.danger}`,borderRadius:10,color:C.danger,fontWeight:900,fontSize:14,cursor:"pointer" }}>✕ Clear</button>}</div></div>{depositResult&&(<div style={{ background:depositResult.matched?C.successBg:C.dangerBg,borderRadius:14,padding:16,border:`2px solid ${depositResult.matched?C.success:C.danger}` }}><div style={{ fontSize:22 }}>{depositResult.matched?"✅":"❌"}</div><div style={{ fontSize:16,fontWeight:900,color:depositResult.matched?C.success:C.danger,marginTop:4 }}>{depositResult.matched?"DEPOSIT MATCHED!":"DEPOSIT MISMATCH!"}</div>{[{label:"Total Sales",val:`₱${depositResult.totalSales.toFixed(2)}`},{label:"Cash Sales Only",val:`₱${depositResult.cashSales.toFixed(2)}`},{label:"Amount Deposited",val:`₱${depositResult.deposit.toFixed(2)}`,bold:true}].map(r=>(<div key={r.label} style={{ display:"flex",justifyContent:"space-between",fontSize:13,padding:"7px 0",borderBottom:`1px solid ${depositResult.matched?C.success+"33":C.danger+"33"}` }}><span style={{ color:C.text2 }}>{r.label}</span><span style={{ fontWeight:r.bold?900:700,color:r.bold?C.warning:C.text }}>{r.val}</span></div>))}<div style={{ display:"flex",justifyContent:"space-between",fontSize:20,fontWeight:900,padding:"12px 0" }}><span>{depositResult.diff>=0?"SURPLUS":"SHORT"}</span><span style={{ color:depositResult.diff>=0?C.success:C.danger }}>{depositResult.diff>=0?"+":""}₱{depositResult.diff.toFixed(2)}</span></div></div>)}</div>)}

          {adminTab==="dtr"&&(<div><div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8 }}><div style={PT}>🕐 DTR — {reportDate}</div><div style={{ display:"flex",gap:8 }}><input type="date" value={reportDate} onChange={e=>setReportDate(e.target.value)} style={{ padding:"6px 10px",borderRadius:7,border:`1px solid ${C.border}`,background:"white",color:C.text,fontSize:11 }}/></div></div>{employees.map(emp=>BRANCHES.map(branch=>{ const logs=getEmpDTR(emp.id,branch.id,reportDate); if(!logs.length)return null; const{hrs,mins,totalMins}=calcDTRHours(logs); const isStillIn=!logs[logs.length-1].out; return(<div key={`${emp.id}_${branch.id}`} style={{ background:"white",borderRadius:10,padding:"12px 14px",marginBottom:8,border:`1px solid ${C.border}`,boxShadow:C.shadow }}><div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}><div><span style={{ fontWeight:700,fontSize:13,color:C.text }}>{emp.emoji} {emp.name}</span><span style={{ fontSize:10,color:C.text3,marginLeft:8 }}>📍 {branch.name}</span></div><div style={{ textAlign:"right" }}><div style={{ fontWeight:900,fontSize:14,color:isStillIn?C.warning:C.success }}>{isStillIn?`${hrs}h ${mins}m (ongoing)`:formatHrs(totalMins)}</div></div></div>{logs.map((l,i)=>{ const dur=l.out?formatHrs(calcMins(l.in,l.out)):"ongoing"; return(<div key={i} style={{ display:"flex",gap:12,fontSize:11,padding:"3px 0",borderTop:`1px solid ${C.border}` }}><span style={{ color:C.text3,minWidth:40 }}>{i===0?"AM":`Break ${i}`}</span><span style={{ color:C.success }}>🟢 <b>{l.in}</b></span><span style={{ color:l.out?C.danger:C.warning }}>{l.out?<>🔴 <b>{l.out}</b></>:"⏳ Still in"}</span><span style={{ color:C.text3 }}>{dur}</span></div>); })}</div>); }))}{employees.every(emp=>BRANCHES.every(b=>!getEmpDTR(emp.id,b.id,reportDate).length))&&<div style={EM}>Walang DTR records</div>}</div>)}

          {adminTab==="payroll"&&(<div><div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8 }}><div style={PT}>💰 Payroll Summary</div><div style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}><input type="date" value={payrollFrom} onChange={e=>setPayrollFrom(e.target.value)} style={{ padding:"6px 10px",borderRadius:7,border:`1px solid ${C.border}`,background:"white",color:C.text,fontSize:11 }}/><span style={{ fontSize:11,color:C.text3 }}>to</span><input type="date" value={payrollTo} onChange={e=>setPayrollTo(e.target.value)} style={{ padding:"6px 10px",borderRadius:7,border:`1px solid ${C.border}`,background:"white",color:C.text,fontSize:11 }}/></div></div>{payrollRows.map(emp=>(<div key={emp.id} style={{ background:"white",borderRadius:12,padding:"14px 16px",marginBottom:10,border:`1px solid ${C.border}`,boxShadow:C.shadow }}><div style={{ display:"flex",alignItems:"center",gap:10 }}><span style={{ fontSize:22 }}>{emp.emoji}</span><div style={{ flex:1 }}><div style={{ fontWeight:800,fontSize:14,color:C.text }}>{emp.name}</div><div style={{ fontSize:11,color:ROLE_COLOR[emp.role],fontWeight:700 }}>{emp.role.toUpperCase()}</div></div><div style={{ textAlign:"center",minWidth:70 }}><div style={{ fontWeight:900,fontSize:18,color:C.info }}>{emp.workDays}</div><div style={{ fontSize:9,color:C.text3 }}>Work Days</div></div><div style={{ textAlign:"center",minWidth:90 }}><div style={{ fontWeight:900,fontSize:16,color:C.success }}>{emp.totalHrs}</div><div style={{ fontSize:9,color:C.text3 }}>Total Hours</div></div></div></div>))}{payrollRows.length===0&&<div style={EM}>Walang employees</div>}</div>)}

          {adminTab==="employees"&&(<div><div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}><div style={PT}>👥 Employee Management</div><button onClick={()=>setShowAddEmp(s=>!s)} style={{ padding:"8px 16px",background:showAddEmp?C.bg3:C.primary,border:`1px solid ${showAddEmp?C.border:C.primary}`,borderRadius:8,color:showAddEmp?C.text2:"white",fontWeight:700,fontSize:12,cursor:"pointer" }}>{showAddEmp?"✕ Cancel":"+ Add Employee"}</button></div>{showAddEmp&&(<div style={{ background:"white",borderRadius:12,padding:"16px",marginBottom:16,border:`2px solid ${C.primary}33`,boxShadow:C.shadow }}><div style={{ display:"flex",gap:8,marginBottom:8,flexWrap:"wrap" }}><input value={newEmpName} onChange={e=>setNewEmpName(e.target.value)} placeholder="Pangalan" style={{ flex:2,minWidth:140,padding:"9px 11px",fontSize:13,borderRadius:8,border:`1.5px solid ${C.border}`,outline:"none" }}/><input value={newEmpPin} onChange={e=>setNewEmpPin(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="4-digit PIN" maxLength={4} style={{ flex:1,minWidth:100,padding:"9px 11px",fontSize:13,borderRadius:8,border:`1.5px solid ${C.border}`,outline:"none",fontFamily:"monospace",letterSpacing:2 }}/></div><div style={{ display:"flex",gap:8,marginBottom:12,flexWrap:"wrap" }}><select value={newEmpRole} onChange={e=>setNewEmpRole(e.target.value)} style={{ flex:1,minWidth:130,padding:"9px 11px",fontSize:13,borderRadius:8,border:`1.5px solid ${C.border}`,background:"white" }}><option value="cashier">Cashier</option><option value="manager">Manager</option><option value="admin">Admin</option></select>{newEmpRole!=="admin"&&(<select value={newEmpBranch} onChange={e=>setNewEmpBranch(parseInt(e.target.value))} style={{ flex:1,minWidth:130,padding:"9px 11px",fontSize:13,borderRadius:8,border:`1.5px solid ${C.border}`,background:"white" }}>{BRANCHES.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select>)}</div><button onClick={createEmployee} style={{ width:"100%",padding:"11px",background:C.primary,border:"none",borderRadius:8,color:"white",fontWeight:800,fontSize:13,cursor:"pointer" }}>Save Employee</button></div>)}{employees.map(emp=>(<div key={emp.id} style={{ background:"white",borderRadius:12,padding:"14px 16px",marginBottom:10,border:`1px solid ${C.border}`,boxShadow:C.shadow }}><div style={{ display:"flex",alignItems:"center",gap:10 }}><span style={{ fontSize:24 }}>{emp.emoji}</span><div style={{ flex:1 }}><div style={{ fontWeight:800,fontSize:14,color:C.text }}>{emp.name}</div><div style={{ fontSize:11,color:C.text3 }}><span style={{ color:ROLE_COLOR[emp.role],fontWeight:700 }}>{emp.role.toUpperCase()}</span>{emp.branchId?` · ${BRANCHES.find(b=>b.id===emp.branchId)?.name}`:" · All Branches"}</div></div><div style={{ background:C.bg3,borderRadius:8,padding:"6px 14px",fontFamily:"monospace",fontSize:18,fontWeight:900,color:C.warning,letterSpacing:4,border:`1px solid ${C.border}` }}>{emp.pin}</div>{emp.id!==currentUser?.id&&(<button onClick={()=>deactivateEmployee(emp)} style={{ padding:"7px 12px",background:C.dangerBg,border:`1px solid ${C.danger}`,borderRadius:8,color:C.danger,fontWeight:700,fontSize:11,cursor:"pointer" }}>Deactivate</button>)}</div></div>))}</div>)}

        </div>
      </div>
    );
  }

  return null;
}

// ── MICRO COMPONENTS ──────────────────────────────────────────────────────────
const Toast=({notif})=>(<div style={{ position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",padding:"10px 20px",borderRadius:30,fontWeight:700,fontSize:13,color:"white",zIndex:9999,background:notif.type==="err"?"#dc2626":"#16a34a",whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,0.2)" }}>{notif.msg}</div>);
const SB=({label,val,color,big})=>(<div style={{ background:"white",border:`1px solid #e2e8f0`,borderRadius:10,padding:big?"13px 14px":"9px 12px",textAlign:"center",flex:1,minWidth:70,boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}><div style={{ fontSize:big?19:14,fontWeight:900,color }}>{val}</div><div style={{ fontSize:9,color:"#64748b",marginTop:2 }}>{label}</div></div>);
const PT={fontSize:16,fontWeight:900,color:"#0f172a",marginBottom:12};
const SR={display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"};
const SEC={fontSize:10,color:"#64748b",letterSpacing:1,fontWeight:700,marginBottom:8,marginTop:14};
const TR={display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #f1f5f9",fontSize:12,gap:8};
const EM={textAlign:"center",color:"#94a3b8",padding:"18px 0",fontSize:12};
