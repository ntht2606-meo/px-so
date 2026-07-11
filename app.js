// PX-SO v0.5.76 - generic mapping by current-day schedule only
// Input -> Bảng trung gian -> Tính tiền
// In: chuẩn tên đài, gom đồng giá, xuống dòng <=20 ký tự

const MN_MAP = {
  1:["Tpho","Dthap","Cmau"],
  2:["Btre","Vtau","Blieu"],
  3:["Dnai","Ctho","Strang"],
  4:["Tninh","Agiang","Bthuan"],
  5:["Vlong","Bduong","Tvinh"],
  6:["Tpho","Lan","Bphuoc","Hgiang"],
  0:["Tgiang","Kgiang","Dlat"]
};
const MT_MAP = {
  1:["Pyen","Hue"],
  2:["Dlac","Qnam"],
  3:["Dnang","Khoa"],
  4:["Bdinh","Qtri","Qbinh"],
  5:["Glai","Nthuan"],
  6:["Dnang","Qngai","Dnong"],
  0:["Ktum","Khoa","Hue"]
};

const KNOWN_DAI = [
  "Tninh","Agiang","Bthuan","Dnai","Ctho","Strang","Tpho","Dthap","Cmau",
  "Btre","Vtau","Blieu","Vlong","Bduong","Tvinh","Lan","Bphuoc","Hgiang",
  "Tgiang","Kgiang","Dlat","Pyen","Hue","Dlac","Qnam","Dnang","Khoa",
  "Bdinh","Qtri","Qbinh","Glai","Nthuan","Qngai","Dnong","Ktum","HN"
];

const NAME_MAP = {
  "tay ninh":"Tninh","tây ninh":"Tninh","tninh":"Tninh",
  "an giang":"Agiang","agiang":"Agiang",
  "binh thuan":"Bthuan","bình thuận":"Bthuan","bthuan":"Bthuan",
  "dong nai":"Dnai","đồng nai":"Dnai","dnai":"Dnai",
  "can tho":"Ctho","cần thơ":"Ctho","ctho":"Ctho",
  "soc trang":"Strang","sóc trăng":"Strang","strang":"Strang",
  "tp hcm":"Tpho","tp.hcm":"Tpho","tphcm":"Tpho","tpho":"Tpho",
  "dong thap":"Dthap","đồng tháp":"Dthap","dthap":"Dthap",
  "ca mau":"Cmau","cà mau":"Cmau","cmau":"Cmau",
  "ben tre":"Btre","bến tre":"Btre","btre":"Btre",
  "vung tau":"Vtau","vũng tàu":"Vtau","vtau":"Vtau",
  "bac lieu":"Blieu","bạc liêu":"Blieu","blieu":"Blieu",
  "vinh long":"Vlong","vĩnh long":"Vlong","vlong":"Vlong",
  "binh duong":"Bduong","bình dương":"Bduong","bduong":"Bduong",
  "tra vinh":"Tvinh","trà vinh":"Tvinh","tvinh":"Tvinh",
  "long an":"Lan","lan":"Lan",
  "binh phuoc":"Bphuoc","bình phước":"Bphuoc","bphuoc":"Bphuoc",
  "hau giang":"Hgiang","hậu giang":"Hgiang","hgiang":"Hgiang",
  "tien giang":"Tgiang","tiền giang":"Tgiang","tgiang":"Tgiang",
  "kien giang":"Kgiang","kiên giang":"Kgiang","kgiang":"Kgiang",
  "da lat":"Dlat","đà lạt":"Dlat","dlat":"Dlat","lam dong":"Dlat","lâm đồng":"Dlat",

  "phu yen":"Pyen","phú yên":"Pyen","pyen":"Pyen",
  "hue":"Hue","huế":"Hue",
  "dak lak":"Dlac","đắk lắk":"Dlac","dac lac":"Dlac","đắc lắc":"Dlac","dlac":"Dlac",
  "quang nam":"Qnam","quảng nam":"Qnam","qnam":"Qnam",
  "da nang":"Dnang","đà nẵng":"Dnang","dnang":"Dnang",
  "khanh hoa":"Khoa","khánh hòa":"Khoa","khoa":"Khoa",
  "binh dinh":"Bdinh","bình định":"Bdinh","bdinh":"Bdinh",
  "quang tri":"Qtri","quảng trị":"Qtri","qtri":"Qtri",
  "quang binh":"Qbinh","quảng bình":"Qbinh","qbinh":"Qbinh",
  "gia lai":"Glai","glai":"Glai",
  "ninh thuan":"Nthuan","ninh thuận":"Nthuan","nthuan":"Nthuan",
  "quang ngai":"Qngai","quảng ngãi":"Qngai","qngai":"Qngai",
  "dak nong":"Dnong","đắk nông":"Dnong","dnong":"Dnong",
  "kon tum":"Ktum","ktum":"Ktum",
  "ha noi":"HN","hà nội":"HN","hn":"HN","mb":"HN"
};

const TYPE_RE = "(bdao|xcdao|xcdau|xcduoi|duoi|dau|dd|dv|da|b|xc)";
const STORAGE_KEYS = {
  settings: "pxso.v0.saved.settings",
  xoa: "pxso.v0.saved.xoa",
  results: "pxso.v0.saved.results",
  dailyInputPrefix: "pxso.v0.dailyInput.",
  appTitle: "pxso.v0.5.58.appTitle",
  newWorkData: "pxso.v0.5.45.newWorkData",
  activeWorkspace: "pxso.v0.5.40.activeWorkspace",
  lastWorkRegion: "pxso.v0.5.40.lastWorkRegion",
  workspacePrefix: "pxso.v0.5.40.workspace."
};
const SETTINGS_IDS = ["rate","coefDa2","coefDa1","coefDaHN","coef2","coef3","coef4","max2","maxDa"];
let activeWorkspace = "MN";

function dayIndex(){ return new Date().getDay(); }
function dateKey(){
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}
function el(id){ return document.getElementById(id); }
function val(id){ return (el(id)?.value || ""); }
function setVal(id, v){ if(el(id)) el(id).value = v == null ? "" : String(v); }
function scrollTextTop(id){
  const x = el(id);
  if(x && typeof x.scrollTop === "number") x.scrollTop = 0;
}

function debounce(fn, delay=280){
  let t;
  return function(...args){
    clearTimeout(t);
    t = setTimeout(()=>fn.apply(this,args), delay);
  };
}

function workspaceKey(region=activeWorkspace){
  return STORAGE_KEYS.workspacePrefix + region;
}
function saveActiveWorkspaceInput(){
  if(!["MN","MT","HN"].includes(activeWorkspace)) return;
  try{
    localStorage.setItem(workspaceKey(activeWorkspace), val("inputData"));
  }catch(e){
    console.error(e);
  }
}
function loadWorkspaceInput(region){
  try{
    setVal("inputData", localStorage.getItem(workspaceKey(region)) || "");
  }catch(e){
    setVal("inputData", "");
  }
}
function regionUiName(region=activeWorkspace){
  if(region === "MT") return "Miền trung";
  if(region === "HN") return "Hà Nội";
  return "Miền nam";
}
function regionShortName(region=activeWorkspace){
  if(region === "MT") return "MT";
  if(region === "HN") return "HN";
  return "MN";
}
function regionRelatedIds(region=activeWorkspace){
  if(region === "MT") return {xoa:"xoaMt", result:"kqMt"};
  if(region === "HN") return {xoa:"xoaHn", result:"kqHn"};
  return {xoa:"xoaMn", result:"kqMn"};
}
function syncRegionRelatedPanel(){
  if(!["MN","MT","HN"].includes(activeWorkspace)) return;
  const ids = regionRelatedIds(activeWorkspace);
  const shortName = regionShortName(activeWorkspace);
  const uiName = regionUiName(activeWorkspace);
  const title = el("regionDataTitle");
  const xoaLabel = el("activeXoaLabel");
  const resultLabel = el("activeResultLabel");

  if(title) title.textContent = "Dữ liệu liên quan " + uiName;
  if(xoaLabel) xoaLabel.textContent = "Dãy xoá " + shortName;
  if(resultLabel) resultLabel.textContent = "Kết quả " + shortName;
  setVal("activeXoaData", val(ids.xoa));
  setVal("activeResultData", val(ids.result));
}
function toggleRegionDataBox(kind){
  openRegionDataPanel(kind);
}
function openRegionDataPanel(kind){
  syncRegionRelatedPanel();
  closeActionPanels();
  const panel = el(kind === "result" ? "panel-region-result" : "panel-region-xoa");
  if(panel) panel.hidden = false;
}
function saveRegionRelatedData(btn){
  if(!["MN","MT","HN"].includes(activeWorkspace)) return;
  const ids = regionRelatedIds(activeWorkspace);
  setVal(ids.xoa, val("activeXoaData"));
  setVal(ids.result, val("activeResultData"));
  writeStorage(STORAGE_KEYS.xoa, collectValues(["xoaMn","xoaMt","xoaHn"]));
  writeStorage(STORAGE_KEYS.results, collectValues(["kqMn","kqMt","kqHn"]));
  parseResultsOnly();
  runAll();
  if(btn) flashSaveButton(btn);
}
function clearRegionRelatedData(kind){
  if(!["MN","MT","HN"].includes(activeWorkspace)) return;
  const ids = regionRelatedIds(activeWorkspace);

  if(kind === "result"){
    setVal("activeResultData", "");
    setVal(ids.result, "");
    writeStorage(STORAGE_KEYS.results, collectValues(["kqMn","kqMt","kqHn"]));
    parseResultsOnly();
  }else{
    setVal("activeXoaData", "");
    setVal(ids.xoa, "");
    writeStorage(STORAGE_KEYS.xoa, collectValues(["xoaMn","xoaMt","xoaHn"]));
  }

  runAll();
}
function setActiveTab(tab){
  document.querySelectorAll(".tab-btn").forEach(btn=>{
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });
}
function saveAppTitle(){
  try{
    localStorage.setItem(STORAGE_KEYS.appTitle, val("appTitleInput"));
  }catch(e){
    console.error(e);
  }
}
function saveAppTitleNote(btn){
  saveAppTitle();
  flashActionButton(btn, "Đã lưu", "Lưu");
}
function loadAppTitle(){
  try{
    const title = localStorage.getItem(STORAGE_KEYS.appTitle);
    if(title) setVal("appTitleInput", title);
  }catch(e){
    console.error(e);
  }
}
function showMainApp(name){
  const isNew = name === "newwork";
  const pxso = el("main-pxso");
  const newwork = el("main-newwork");
  if(pxso) pxso.hidden = isNew;
  if(newwork) newwork.hidden = !isNew;
  document.querySelectorAll(".main-tab").forEach(btn=>{
    btn.classList.toggle("active", btn.dataset.main === (isNew ? "newwork" : "pxso"));
  });
}
function showNewWorkPanel(id){
  document.querySelectorAll(".newwork-section").forEach(panel=>{
    panel.hidden = panel.id !== id;
  });
  document.querySelectorAll(".newwork-tile").forEach(btn=>{
    btn.classList.toggle("active", btn.dataset.panel === id);
  });
}
function updateNewWorkPreview(){
  const text = val("newWorkData").trim();
  const lineCount = text ? text.split(/\n+/).filter(Boolean).length : 0;
  setVal("newWorkProcess", text ? `Dữ liệu thử đã nhận: ${lineCount} dòng\n\n${text}` : "");
  setVal("newWorkReport", text ? `Báo cáo thử\n- Trạng thái: đã có dữ liệu\n- Số dòng: ${lineCount}\n- Ghi chú: chưa gắn công thức thật.` : "");
}
function saveNewWorkData(){
  try{
    localStorage.setItem(STORAGE_KEYS.newWorkData, val("newWorkData"));
    updateNewWorkPreview();
    flashSaveButton(document.querySelector("#new-data .save-mini"));
  }catch(e){
    console.error(e);
  }
}
function clearNewWorkData(){
  setVal("newWorkData", "");
  setVal("newWorkProcess", "");
  setVal("newWorkReport", "");
  try{
    localStorage.removeItem(STORAGE_KEYS.newWorkData);
  }catch(e){
    console.error(e);
  }
}
function loadNewWorkData(){
  try{
    setVal("newWorkData", localStorage.getItem(STORAGE_KEYS.newWorkData) || "");
  }catch(e){
    setVal("newWorkData", "");
  }
  updateNewWorkPreview();
}
function closeActionPanels(){
  ["panel-copy","panel-split","panel-wins","panel-region-xoa","panel-region-result"].forEach(id=>{
    const panel = el(id);
    if(panel) panel.hidden = true;
  });
}
function toggleActionPanel(name){
  const panel = el("panel-" + name);
  if(!panel) return;
  const shouldOpen = panel.hidden;
  closeActionPanels();
  panel.hidden = !shouldOpen;
}
function closeSettingsPanels(){
  document.querySelectorAll(".setting-panel").forEach(panel=>panel.hidden = true);
  document.querySelectorAll(".setting-tile").forEach(btn=>btn.classList.remove("active"));
}
function toggleSettingsPanel(name){
  const panel = el("settings-" + name);
  if(!panel) return;
  const shouldOpen = panel.hidden;
  closeSettingsPanels();
  panel.hidden = !shouldOpen;
  const tile = Array.from(document.querySelectorAll(".setting-tile")).find(btn => btn.getAttribute("onclick") && btn.getAttribute("onclick").includes("'" + name + "'"));
  if(tile) tile.classList.toggle("active", shouldOpen);
}
function selectWorkspace(tab){
  saveActiveWorkspaceInput();
  const workScreen = el("workScreen");
  const settingsScreen = el("settingsScreen");
  activeWorkspace = tab === "SETTINGS" ? activeWorkspace : tab;

  try{
    localStorage.setItem(STORAGE_KEYS.activeWorkspace, tab);
    if(tab !== "SETTINGS") localStorage.setItem(STORAGE_KEYS.lastWorkRegion, tab);
  }catch(e){
    console.error(e);
  }

  setActiveTab(tab);
  if(tab === "SETTINGS"){
    if(workScreen) workScreen.hidden = true;
    if(settingsScreen) settingsScreen.hidden = false;
    closeActionPanels();
    return;
  }

  if(workScreen) workScreen.hidden = false;
  if(settingsScreen) settingsScreen.hidden = true;
  closeSettingsPanels();
  loadWorkspaceInput(tab);
  syncRegionRelatedPanel();
  if(val("inputData").trim()) runAll();
  else clearRun();
}


function getRate(){
  let s = val("rate").trim().replace(",",".").replace("%","");
  let n = parseFloat(s);
  if(isNaN(n)) n = 0.8;
  if(n > 1) n = n / 100;
  return n;
}
function getNum(id, fallback){
  let n = parseFloat(val(id).trim().replace(",","."));
  return isNaN(n) ? fallback : n;
}
function fmtN(n){
  const x = Math.round((Number(n)||0)*100)/100;
  return String(x).replace(".",",").replace(/,0$/,"");
}
function money(n){
  // Hiển thị đúng số lẻ 0,1k, không làm tròn lên.
  // Ví dụ: 595.2 -> 595,2k; 57.6 -> 57,6k; 16 -> 16k
  const x = Math.round((Number(n)||0)*10)/10;
  let s = String(x).replace(".",",");
  if(s.endsWith(",0")) s = s.slice(0,-2);
  return s + "k";
}
function cleanName(s){
  return (s||"")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9 ]/g," ")
    .replace(/\s+/g," ")
    .trim();
}
function normalizeLine(s){
  return (s||"").trim()
    .replace(/\s+/g,"")
    .replace(/kéo/gi,"keo")
    .replace(/đá/gi,"da")
    .replace(/đầu/gi,"dau")
    .replace(/đuôi|đui/gi,"duoi")
    .replace(/đđ/gi,"dd");
}
function parseAmount(s){
  return parseFloat(String(s||"0").replace(",",".")) || 0;
}

function orderDaisBySchedule(dais){
  const list = (dais || []).filter(Boolean);
  if(list.length <= 1) return list.slice();

  const candidates = [];
  [MN_MAP, MT_MAP].forEach(map=>{
    Object.values(map).forEach(arr=>{
      if(list.every(dai => arr.includes(dai))){
        candidates.push(arr);
      }
    });
  });
  if(!candidates.length) return list.slice();

  candidates.sort((a,b)=>{
    if(a.length !== b.length) return a.length - b.length;
    return 0;
  });
  const order = candidates[0];
  return list.slice().sort((a,b)=>{
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    if(ai !== bi) return ai - bi;
    return 0;
  });
}

function getDaisFromName(name){
  if(!name) return [];
  const raw = name.trim();
  const lower = raw.toLowerCase();
  if(lower==="hn" || lower==="mb") return ["HN"];
  const found = [];
  for(const d of KNOWN_DAI){
    if(d === "HN") continue;
    const idx = lower.indexOf(d.toLowerCase());
    if(idx >= 0) found.push({d, idx});
  }
  found.sort((a,b)=>{
    if(a.idx !== b.idx) return a.idx - b.idx;
    return b.d.length - a.d.length;
  });
  return found.length ? orderDaisBySchedule(found.map(item => item.d)) : [raw];
}
function detectRegionByDais(dais){
  if(dais.includes("HN")) return "HN";
  const mt = ["Pyen","Hue","Dlac","Qnam","Dnang","Khoa","Bdinh","Qtri","Qbinh","Glai","Nthuan","Qngai","Dnong","Ktum"];
  return dais.some(d => mt.includes(d)) ? "MT" : "MN";
}
function compactThreeDaiLabel(block){
  // Khóa thứ tự tên đài sau khi atomic được gom lại.
  // Không lấy thứ tự theo block xuất hiện trước trong input, mà luôn theo lịch đài.
  const dais = orderDaisBySchedule(getDaisFromName(block).filter(Boolean));
  const canonicalBlock = dais.length ? dais.join("") : block;
  if(dais.length !== 3) return canonicalBlock;
  const region = detectRegionByDais(dais);
  if(region === "HN") return canonicalBlock;
  const map = region === "MT" ? MT_MAP : MN_MAP;
  const key = region === "MT" ? "3dmt" : "3dmn";
  return Object.values(map).some(arr =>
    arr.length >= 3 && dais.every((dai, idx) => dai === arr[idx])
  ) ? key : canonicalBlock;
}
function isHeader(line){
  const l = normalizeLine(line).toLowerCase();
  if(/^(hn|mb|2dmn|3dmn|4dmn|2dmt|3dmt)$/.test(l)) return true;
  return !/\d/.test(line) && /^[a-zA-ZÀ-ỹ]+$/.test(line.trim());
}
function pickDayForGeneric(region, count, hintDais=[]){
  const map = region==="MT" ? MT_MAP : MN_MAP;
  const hints = (hintDais || []).filter(Boolean);
  if(hints.length){
    for(const [d, arr] of Object.entries(map)){
      if(arr.length >= count && hints.every(dai => arr.includes(dai))){
        return parseInt(d,10);
      }
    }
  }
  const today = dayIndex();
  if(map[today] && map[today].length >= count) return today;

  for(const [d, arr] of Object.entries(map)){
    if(arr.length >= count) return parseInt(d,10);
  }
  return today;
}
function resolveHeader(raw, hintDais=[]){
  const l = normalizeLine(raw).toLowerCase();
  let dais;
  if(l==="hn" || l==="mb") dais=["HN"];
  else if(l==="2dmn") dais=MN_MAP[pickDayForGeneric("MN",2,hintDais)].slice(0,2);
  else if(l==="3dmn") dais=MN_MAP[pickDayForGeneric("MN",3,hintDais)].slice(0,3);
  else if(l==="4dmn") dais=MN_MAP[pickDayForGeneric("MN",4,hintDais)].slice(0,4);
  else if(l==="2dmt") dais=MT_MAP[pickDayForGeneric("MT",2,hintDais)].slice(0,2);
  else if(l==="3dmt") dais=MT_MAP[pickDayForGeneric("MT",3,hintDais)].slice(0,3);
  else dais=getDaisFromName(raw.trim());
  const generic = /^(2dmn|3dmn|4dmn|2dmt|3dmt)$/i.test(l);
  return {raw:raw.trim(), name:dais.join(""), dais, region:detectRegionByDais(dais), mainDais:dais.slice(0,2), generic, lines:[]};
}
function splitBlocks(text){
  const lines = (text||"").split(/\n+/).map(x=>x.trim()).filter(Boolean);
  const blocks=[]; let cur=null; let lastExplicit=[];
  for(const raw of lines){
    if(isHeader(raw)){
      cur = resolveHeader(raw, lastExplicit);
      blocks.push(cur);
      if(!cur.generic) lastExplicit = cur.dais;
    }else{
      if(!cur){
        cur = {raw:"Không rõ đài", name:"Không rõ đài", dais:["Không rõ đài"], region:"MN", mainDais:["Không rõ đài"], generic:false, lines:[]};
        blocks.push(cur);
      }
      cur.lines.push(normalizeLine(raw));
    }
  }
  return blocks;
}

function expandKeoToken(token){
  const m = String(token||"").match(/^(\d+)keo(\d+)$/i);
  if(!m) return [token];
  const a=m[1], b=m[2];
  if(a.length !== b.length) return [token];
  const start=parseInt(a,10), end=parseInt(b,10);
  if(isNaN(start)||isNaN(end)||start>end) return [token];
  let step = 1;

  if(a.slice(0, -1) !== b.slice(0, -1)){
    let suffixLen = 0;
    for(let i=1; i<=a.length; i++){
      if(a.slice(-i) === b.slice(-i)) suffixLen = i;
      else break;
    }
    if(suffixLen > 0) step = Math.pow(10, suffixLen);
  }

  if(Math.floor((end - start) / step) > 200) return [token];
  const out=[];
  for(let i=start;i<=end;i+=step) out.push(String(i).padStart(a.length,"0"));
  return out;
}
function parseNums(numStr){
  return (numStr||"").split(".").filter(Boolean).flatMap(expandKeoToken);
}
function pairNumbers(nums){
  const out=[];
  for(let i=0;i<nums.length;i++){
    for(let j=i+1;j<nums.length;j++) out.push([nums[i], nums[j]]);
  }
  return out;
}
function pairDais(dais){
  const out=[];
  for(let i=0;i<dais.length;i++){
    for(let j=i+1;j<dais.length;j++) out.push([dais[i], dais[j]]);
  }
  return out;
}
function permCount(s){
  const arr = String(s||"").split("");
  const fact = n => n<=1 ? 1 : n*fact(n-1);
  const counts={};
  arr.forEach(c => counts[c]=(counts[c]||0)+1);
  let den=1;
  Object.values(counts).forEach(c => den *= fact(c));
  return fact(arr.length)/den;
}

function parseBetLine(line){
  const s = normalizeLine(line);

  const da = s.match(/^([0-9.]+)(da|dv)([\d,.]+)n$/i);
  if(da){
    return [{nums:parseNums(da[1]), type:da[2].toLowerCase(), n:parseAmount(da[3]), source:s}];
  }

  const baseMatch = s.match(/^((?:\d+keo\d+)|(?:\d+(?:\.\d+)*))(.*)$/i);
  if(!baseMatch) return null;

  const baseNums = parseNums(baseMatch[1]);
  const rest = baseMatch[2] || "";
  if(!rest) return null;

  const segRe = new RegExp("(?:^|\\.)" + TYPE_RE + "([\\d,.]+)n","ig");
  const parts=[];
  let lastEnd=0, m;
  while((m = segRe.exec(rest)) !== null){
    if(m.index !== lastEnd) return null;
    parts.push({nums:baseNums, type:m[1].toLowerCase(), n:parseAmount(m[2]), source:s});
    lastEnd = segRe.lastIndex;
  }
  if(!parts.length || lastEnd !== rest.length) return null;
  return parts;
}

function makeLine(nums, type, n){
  return `${Array.isArray(nums)?nums.join("."):nums}${type}${fmtN(n)}n`;
}
function makeDaLine(a,b,n){
  return `${a}.${b}da${fmtN(n)}n`;
}
function sortNumsAsc(nums){
  return (nums||[]).slice().sort((a,b)=>{
    const aa=parseInt(a,10), bb=parseInt(b,10);
    if(aa!==bb) return aa-bb;
    return String(a).localeCompare(String(b));
  });
}
function sortPair(a,b){
  return sortNumsAsc([a,b]);
}
function uniquePairs(pairs){
  const seen=new Set(), out=[];
  for(const pair of pairs){
    const p=sortPair(pair[0], pair[1]);
    const key=p.join(".");
    if(seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out.sort((x,y)=>{
    const a0=parseInt(x[0],10), y0=parseInt(y[0],10);
    if(a0!==y0) return a0-y0;
    return parseInt(x[1],10)-parseInt(y[1],10);
  });
}

function buildIntermediate(blocks){
  const rows=[];
  const meta = block => ({
    sourceBlock:block.name,
    sourceDais:(block.dais||[]).slice(),
    sourceGeneric:!!block.generic
  });
  for(const block of blocks){
    for(const rawLine of block.lines){
      const parts = parseBetLine(rawLine);
      if(!parts){
        rows.push({block:block.name, line:rawLine, type:"?", nums:[rawLine], n:0, region:block.region, calc:false, daiCount:1, ...meta(block)});
        continue;
      }
      for(const part of parts){
        const t=part.type;
        const nums=part.nums || [];
        if(t==="dv"){
          const numPairs = uniquePairs(pairNumbers(nums));
          const daiPairs = block.dais.length>=2 ? pairDais(block.dais) : [[block.name]];
          for(const dp of daiPairs){
            const bname = dp.length===2 ? dp[0]+dp[1] : block.name;
            for(const np of numPairs){
              const pair = sortPair(np[0], np[1]);
              rows.push({block:bname, line:makeDaLine(pair[0],pair[1],part.n), type:"da", nums:pair, n:part.n, region:block.region, calc:true, raw:rawLine, daiCount:(dp.length===2?2:1), ...meta(block)});
            }
          }
        }else if(t==="da"){
          const pair = sortPair(nums[0], nums[1]);
          const daiPairs = block.dais.length>=2 ? pairDais(block.dais) : [[block.name]];
          for(const dp of daiPairs){
            const bname = dp.length===2 ? dp[0]+dp[1] : block.name;
            rows.push({block:bname, line:makeDaLine(pair[0],pair[1],part.n), type:"da", nums:pair, n:part.n, region:block.region, calc:true, raw:rawLine, daiCount:(dp.length===2?2:1), ...meta(block)});
          }
        }else{
          for(const dai of block.dais){
            for(const num of nums){
              rows.push({block:dai, line:makeLine(num,t,part.n), type:t, nums:[num], n:part.n, region:block.region, calc:true, raw:rawLine, daiCount:1, ...meta(block)});
            }
          }
        }
      }
    }
  }
  return rows;
}

function calcRow(row){
  if(!row.calc) return 0;
  const r = getRate();
  const region = row.region || "MN";
  const t = row.type;
  const num = row.nums && row.nums[0] ? row.nums[0] : "";
  let base=0, qty=1;

  if(t==="da"){
    // Lấy số đài từ bảng trung gian đã bung, không đoán lại bằng tên block.
    // MN/MT đá 1 đài: 36 x 1 x n x 0.8 = 28,8k cho 1n.
    // MN/MT đá 2 đài: 36 x 2 x n x 0.8 = 57,6k cho 1n.
    const daiCount = row.daiCount || 1;
    base = region==="HN" ? 54 : 36 * daiCount;

  }else if(t==="b"){
    const len = num.length;
    if(len===2) base = region==="HN" ? 27 : 18;
    else if(len===3) base = region==="HN" ? 23 : 17;
    else if(len===4) base = region==="HN" ? 20 : 16;

  }else if(t==="bdao"){
    const len = num.length;
    if(len===3) base = region==="HN" ? 23 : 17;
    else if(len===4) base = region==="HN" ? 0 : 16;
    qty = permCount(num);

  }else if(t==="xc" || t==="xcdau" || t==="xcduoi"){
    base = region==="HN" ? 4 : 2;

  }else if(t==="xcdao"){
    base = region==="HN" ? 4 : 2;
    qty = permCount(num);

  }else if(t==="dd"){
    base = region==="HN" ? 5 : 2;

  }else if(t==="dau"){
    base = region==="HN" ? 4 : 1;

  }else if(t==="duoi"){
    base = 1;
  }

  return base * qty * row.n * r;
}

function renderIntermediate(rows){
  const tbody = document.querySelector("#interTable tbody");
  if(tbody){
    tbody.innerHTML = "";
    for(const row of rows){
      const tr = document.createElement("tr");
      const cells = [
        row.block,
        row.line,
        row.type,
        (row.nums||[]).join("."),
        fmtN(row.n),
        String(row.daiCount || 1),
        money(calcRow(row))
      ];
      for(const c of cells){
        const td = document.createElement("td");
        td.textContent = c;
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
  }
  const lines=[];
  for(const row of rows){
    lines.push([row.block,row.line,row.type,(row.nums||[]).join("."),fmtN(row.n),String(row.daiCount||1),money(calcRow(row))].join("\t"));
  }
  setVal("detail", lines.join("\n"));
}

function totalMoney(rows){
  return rows.reduce((s,row)=>s+calcRow(row),0);
}
function todayLabel(){
  const d = new Date();
  return `Ngày ${d.getDate()}/${d.getMonth() + 1}`;
}
function roundedMoney(n){
  return String(Math.ceil(Number(n) || 0)) + "k";
}

// COPY NHANH: giữ cấu trúc tin gốc, KHÔNG bung dữ liệu trung gian.
// Chỉ đổi header tổng quát thành tên đài thật và chỉ ngắt dòng khi dãy số gốc quá dài.
function splitCopyLineOriginal(rawLine, maxLen=20){
  const s = normalizeLine(rawLine);
  if(!s || s.length <= maxLen) return s ? [s] : [];

  // Chỉ tách các dòng có sẵn danh sách số bằng dấu chấm.
  // Không bung keo/kéo, không gom dòng, không mở parseNums.
  const m = s.match(/^(\d+(?:\.\d+)+)([a-z]+[\d,.]+n(?:\.[a-z]+[\d,.]+n)*)$/i);
  if(!m) return [s];

  const nums = m[1].split(".").filter(Boolean);
  const suffix = m[2];
  if(nums.length < 2) return [s];

  const dvSuffix = suffix.match(/^dv[\d,.]+n$/i);
  if(dvSuffix){
    const chunks=[];
    let cur=[];
    for(let i=0; i<nums.length; i++){
      const num = nums[i];
      const isLastNum = i === nums.length - 1;
      const nextNums = cur.concat([num]);
      const test = nextNums.join(".") + (isLastNum ? suffix : ".");
      if(cur.length && test.length > maxLen){
        chunks.push(cur);
        cur=[num];
      }else{
        cur.push(num);
      }
    }
    if(cur.length) chunks.push(cur);
    const last = chunks.length - 1;
    if(last > 0 && chunks[last].length === 1 && chunks[last - 1].length > 1){
      chunks[last].unshift(chunks[last - 1].pop());
    }
    return chunks.map((chunk, idx) => chunk.join(".") + (idx === chunks.length - 1 ? suffix : "."));
  }

  const out=[];
  let cur=[];
  for(const num of nums){
    const test = cur.concat([num]).join(".") + suffix;
    if(cur.length && test.length > maxLen){
      out.push(cur.join(".") + suffix);
      cur=[num];
    }else{
      cur.push(num);
    }
  }
  if(cur.length) out.push(cur.join(".") + suffix);
  return out;
}
function groupDuplicateSuffixLines(lines){
  const out=[];
  const groups={};
  (lines || []).forEach(rawLine => {
    const line = normalizeLine(rawLine);
    const m = line.match(/^(\d+(?:\.\d+)*)([a-z]+[\d,.]+n(?:\.[a-z]+[\d,.]+n)*)$/i);
    if(!m){
      if(line) out.push(line);
      return;
    }
    const nums = m[1].split(".").filter(Boolean);
    const suffix = m[2];
    const firstType = (suffix.match(/^([a-z]+)/i) || [,""])[1].toLowerCase();
    const lens = new Set(nums.map(num => String(num).length));
    if(firstType === "da" || firstType === "dv" || lens.size !== 1){
      out.push(line);
      return;
    }
    const key = [nums[0].length, suffix.toLowerCase()].join("|");
    if(!groups[key]){
      groups[key] = { index:out.length, suffix, nums:[] };
      out.push(null);
    }
    groups[key].nums.push(...nums);
  });
  Object.values(groups).forEach(group => {
    const nums = group.nums.slice().sort((a,b)=>{
      const na=parseInt(a,10), nb=parseInt(b,10);
      if(na !== nb) return na - nb;
      return String(a).localeCompare(String(b));
    });
    out[group.index] = nums.join(".") + group.suffix;
  });
  return out.filter(Boolean);
}
function buildCopyFast(blocks, total){
  const out=[todayLabel() + " " + roundedMoney(total), ""];
  for(const block of blocks){
    out.push(block.name);
    for(const rawLine of groupDuplicateSuffixLines(block.lines)){
      out.push(...splitCopyLineOriginal(rawLine, 20));
    }
    out.push("");
  }
  return out.join("\n").trim();
}

function renderObj(obj){
  const out=[];
  for(const [block, lines] of Object.entries(obj)){
    if(!lines.length) continue;
    out.push(block);
    for(const line of groupDuplicateSuffixLines(lines)){
      out.push(...splitTachDisplayLine(line, 20));
    }
    out.push("");
  }
  return out.join("\n").trim();
}

function splitTachDisplayLine(line, maxLen=20){
  const m = String(line||"").match(/^([0-9.]+)(bdao|xcdao|xcdau|xcduoi|duoi|dau|dd|dv|b|xc)([\d,.]+)n$/i);
  if(!m) return line ? [line] : [];

  const nums = m[1].split(".").filter(Boolean);
  if(String(line).length <= maxLen) return [line];

  const type = m[2];
  const amount = m[3];
  const suffix = type + amount + "n";
  const isDv = type.toLowerCase() === "dv";
  if(isDv){
    const chunks=[];
    let cur=[];
    for(let i=0; i<nums.length; i++){
      const num = nums[i];
      const isLastNum = i === nums.length - 1;
      const next = cur.concat([num]);
      const test = next.join(".") + (isLastNum ? suffix : ".");
      if(cur.length && test.length > maxLen){
        chunks.push(cur);
        cur=[num];
      }else{
        cur.push(num);
      }
    }
    if(cur.length) chunks.push(cur);
    const last = chunks.length - 1;
    if(last > 0 && chunks[last].length === 1 && chunks[last - 1].length > 1){
      chunks[last].unshift(chunks[last - 1].pop());
    }
    return chunks.map((chunk, idx) => chunk.join(".") + (idx === chunks.length - 1 ? suffix : "."));
  }

  const out=[];
  let cur=[];
  for(const num of nums){
    const next = cur.concat([num]);
    const test = next.join(".") + suffix;
    if(cur.length && test.length > maxLen){
      out.push(cur.join(".") + suffix);
      cur=[num];
    }else{
      cur.push(num);
    }
  }
  if(cur.length) out.push(cur.join(".") + suffix);
  return out;
}

function scheduledDaisForRegion(region, hintDais=[]){
  if(region === "HN") return ["HN"];
  const map = region === "MT" ? MT_MAP : MN_MAP;
  const maxCount = region === "MT" ? 3 : 4;
  const hints = (hintDais || []).filter(Boolean);
  const count = Math.min(maxCount, Math.max(1, hints.length || maxCount));
  const day = pickDayForGeneric(region, count, hints);
  const arr = map[day] || hints;
  return arr.slice(0, maxCount);
}

function buildRegionZones(region, hintDais=[]){
  const dais = scheduledDaisForRegion(region, hintDais);
  if(region === "HN"){
    return {
      region,
      dais:["HN"],
      singles:[{key:"D1", block:"HN", dais:["HN"]}],
      pairs:[],
      all:[{key:"D1", block:"HN", dais:["HN"]}],
      mainDais:["HN"],
      mainPair:""
    };
  }

  const singles = dais.map((dai, idx)=>({
    key:"D" + (idx + 1),
    block:dai,
    dais:[dai]
  }));
  const pairs = [];
  for(let i=0; i<dais.length; i++){
    for(let j=i+1; j<dais.length; j++){
      pairs.push({
        key:"D" + (i + 1) + "-" + (j + 1),
        block:dais[i] + dais[j],
        dais:[dais[i], dais[j]]
      });
    }
  }

  return {
    region,
    dais,
    singles,
    pairs,
    all:singles.concat(pairs),
    mainDais:dais.slice(0,2),
    mainPair:dais.length >= 2 ? dais[0] + dais[1] : ""
  };
}

function regionZonesForRow(row){
  return buildRegionZones(row.region || "MN", row.sourceDais || []);
}

function twoDigit(n){
  return String(n == null ? "" : n).replace(/\D/g, "").slice(-2).padStart(2, "0");
}
function readXoaSet(region){
  const id = region==="MT" ? "xoaMt" : region==="HN" ? "xoaHn" : "xoaMn";
  const nums = val(id).match(/\d+/g) || [];
  return new Set(nums.map(twoDigit).filter(x => x.length===2));
}
function numInXoa(num, xoaSet){
  return xoaSet.has(twoDigit(num));
}

function buildTach(blocks){
  const max2=getNum("max2",10), maxDa=getNum("maxDa",1);
  const tach=[], khong=[];
  const typeOrder = ["b","bdao","xc","xcdao","dd","dau","duoi","xcdau","xcduoi"];
  const typeRank = {};
  typeOrder.forEach((type, idx)=>{ typeRank[type] = idx; });

  const rowNumKey = row => (row.nums || []).join(".");
  const cloneRow = (row, n, block=row.block)=>({
    ...row,
    block,
    n,
    nums:(row.nums || []).slice()
  });
  const pushRow = (list, row, n=row.n, block=row.block)=>{
    if(!row || !block || !(n > 0)) return;
    list.push(cloneRow(row, Math.round(n * 100) / 100, block));
  };
  const pushSplit = (row, n, maxN, block=row.block)=>{
    const keep = Math.min(n, maxN);
    const overflow = Math.round((n - keep) * 100) / 100;
    if(keep > 0) pushRow(tach, row, keep, block);
    if(overflow > 0) pushRow(khong, row, overflow, block);
  };
  const mainDaisForRow = row => {
    if(row.region === "HN") return ["HN"];
    return regionZonesForRow(row).mainDais || [];
  };
  const mainPairForRow = row => row.region === "HN" ? "" : (regionZonesForRow(row).mainPair || "");
  const hasXoa = row => {
    const xoaSet = readXoaSet(row.region);
    return xoaSet.size > 0 && (row.nums || []).some(num => numInXoa(num, xoaSet));
  };
  const isBao2Scope = row => {
    const num = row.nums && row.nums[0] ? row.nums[0] : "";
    return row.type === "b" && String(num).length === 2 && mainDaisForRow(row).includes(row.block);
  };
  const isDaScope = row => {
    if(row.type !== "da") return false;
    if(row.region === "HN") return true;
    return row.block === mainPairForRow(row);
  };
  const blockDais = block => {
    const found = getDaisFromName(block).filter(Boolean);
    return found.length ? found : [block];
  };
  const makeRank = rows => {
    const rank={};
    let i=0;
    for(const block of blocks){
      (block.dais || []).forEach(dai=>{
        if(rank[dai] == null) rank[dai] = i++;
      });
    }
    for(const row of rows || []){
      (row.sourceDais || []).forEach(dai=>{
        if(rank[dai] == null) rank[dai] = i++;
      });
    }
    KNOWN_DAI.forEach(dai=>{
      if(rank[dai] == null) rank[dai] = i++;
    });
    return rank;
  };
  const sortDaisByRank = (dais, rank) => (dais || []).slice().sort((a,b)=>{
    const ra = rank[a] == null ? 9999 : rank[a];
    const rb = rank[b] == null ? 9999 : rank[b];
    if(ra !== rb) return ra - rb;
    return String(a).localeCompare(String(b));
  });
  const combineBlocks = (blockList, rank) => {
    const set = new Set();
    blockList.forEach(block => blockDais(block).forEach(dai => set.add(dai)));
    // Tên block ghép phải theo lịch chuẩn, không theo rank phát sinh từ thứ tự input.
    // Ví dụ hôm T6: Vlong trước Bduong, dù block Bduong xuất hiện trước trong tin.
    return orderDaisBySchedule(Array.from(set)).join("");
  };
  const numSortValue = num => parseInt(String(num || "").replace(/\D/g,""), 10) || 0;
  const compareNum = (a,b) => {
    const la = String(a || "").replace(/\D/g,"").length;
    const lb = String(b || "").replace(/\D/g,"").length;
    if(la !== lb) return la - lb;
    const na = numSortValue(a), nb = numSortValue(b);
    if(na !== nb) return na - nb;
    return String(a).localeCompare(String(b));
  };
  const buildAtomicRows = () => {
    const rows=[];
    const addAtomic = (block, sourceBlock, sourceDais, region, nums, type, n, rawLine) => {
      rows.push({
        block,
        sourceBlock,
        sourceDais:(sourceDais || []).slice(),
        nums:(nums || []).slice(),
        type,
        n,
        region,
        raw:rawLine
      });
    };

    for(const block of blocks){
      for(const rawLine of block.lines){
        const parts = parseBetLine(rawLine);
        if(!parts) continue;
        for(const part of parts){
          const type = part.type;
          const nums = part.nums || [];
          if(type === "dv"){
            const numPairs = uniquePairs(pairNumbers(nums));
            const daiPairs = block.dais.length >= 2 ? pairDais(block.dais) : [[block.name]];
            for(const dp of daiPairs){
              const bname = dp.length === 2 ? dp[0] + dp[1] : block.name;
              for(const np of numPairs){
                addAtomic(bname, block.name, block.dais, block.region, sortPair(np[0], np[1]), "da", part.n, rawLine);
              }
            }
          }else if(type === "da"){
            const pair = sortPair(nums[0], nums[1]);
            const daiPairs = block.dais.length >= 2 ? pairDais(block.dais) : [[block.name]];
            for(const dp of daiPairs){
              const bname = dp.length === 2 ? dp[0] + dp[1] : block.name;
              addAtomic(bname, block.name, block.dais, block.region, pair, "da", part.n, rawLine);
            }
          }else{
            const outTypes = type === "dd" ? ["dau","duoi"] : [type];
            for(const dai of block.dais){
              for(const num of nums){
                outTypes.forEach(outType=>{
                  addAtomic(dai, block.name, block.dais, block.region, [num], outType, part.n, rawLine);
                });
              }
            }
          }
        }
      }
    }
    return rows;
  };

  const atomicRows = buildAtomicRows();
  const used = new Set();
  const baoGroups = new Map();
  const daGroups = new Map();

  // Quan trọng: bao 2 số phải tổng theo atomic đài thật trước khi xét max.
  // Không được đưa từng dòng gốc vào Tin tách rồi mới gom, vì sẽ lọt case:
  // Dnai 68b5n + DnaiCtho 68b11n => Dnai 68b16n vượt max.
  const addBaoAtomic = row => {
    const main = mainDaisForRow(row);
    if(!main.includes(row.block)) return false;
    const key = [row.region, main.join("+"), row.nums[0]].join("|");
    if(!baoGroups.has(key)){
      baoGroups.set(key, {
        main:main.slice(),
        amountByDai:{},
        sampleByDai:{},
        sample:row
      });
    }
    const group = baoGroups.get(key);
    group.amountByDai[row.block] = Math.round(((group.amountByDai[row.block] || 0) + row.n) * 100) / 100;
    if(!group.sampleByDai[row.block]) group.sampleByDai[row.block] = row;
    return true;
  };

  for(const [idx, row] of atomicRows.entries()){
    if(hasXoa(row)){
      used.add(idx);
      pushRow(khong, row);
      continue;
    }

    if(isBao2Scope(row)){
      used.add(idx);
      addBaoAtomic(row);
      continue;
    }

    if(isDaScope(row)){
      used.add(idx);
      const pair = sortPair(row.nums[0], row.nums[1]);
      const key = [row.region, row.block, pair[0], pair[1]].join("|");
      if(!daGroups.has(key)){
        daGroups.set(key, {...row, nums:pair, n:0});
      }
      daGroups.get(key).n = Math.round((daGroups.get(key).n + row.n) * 100) / 100;
    }
  }

  for(const group of baoGroups.values()){
    for(const dai of group.main){
      const total = Math.round((group.amountByDai[dai] || 0) * 100) / 100;
      if(!(total > 0)) continue;
      const sample = group.sampleByDai[dai] || group.sample;
      pushSplit({...sample, block:dai}, total, max2, dai);
    }
  }

  for(const group of daGroups.values()){
    pushSplit(group, group.n, maxDa);
  }

  for(const [idx, row] of atomicRows.entries()){
    if(!used.has(idx)) pushRow(khong, row);
  }

  const renderRows = rows => {
    const rank = makeRank(rows);
    const agg = new Map();
    for(const row of rows){
      const key = [row.block, rowNumKey(row), row.type].join("|");
      if(!agg.has(key)){
        agg.set(key, {
          block:row.block,
          nums:(row.nums || []).slice(),
          type:row.type,
          n:0
        });
      }
      agg.get(key).n += row.n;
    }

    const compactPairSuffixRows = items => {
      const out = [];
      const buckets = new Map();
      const pairTypes = new Set(["dau","duoi","xcdau","xcduoi"]);
      const makeBucketKey = row => [row.block, rowNumKey(row)].join("|");

      for(const row of items){
        if(pairTypes.has(row.type) && (row.nums || []).length === 1){
          const key = makeBucketKey(row);
          if(!buckets.has(key)){
            buckets.set(key, {
              block:row.block,
              nums:(row.nums || []).slice(),
              rows:{}
            });
          }
          buckets.get(key).rows[row.type] = {...row, nums:(row.nums || []).slice()};
        }else{
          out.push(row);
        }
      }

      const consumePair = (bucket, aType, bType, outType) => {
        const a = bucket.rows[aType];
        const b = bucket.rows[bType];
        if(!a || !b) return;
        if(fmtN(a.n) === fmtN(b.n) && a.n > 0){
          out.push({
            ...a,
            type:outType,
            n:Math.round(a.n * 100) / 100,
            nums:(a.nums || []).slice()
          });
          a.n = 0;
          b.n = 0;
        }
      };

      for(const bucket of buckets.values()){
        consumePair(bucket, "dau", "duoi", "dd");
        consumePair(bucket, "xcdau", "xcduoi", "xc");
        Object.values(bucket.rows).forEach(row => {
          if(row.n > 0) out.push(row);
        });
      }

      return out;
    };

    const compactedRows = compactPairSuffixRows(Array.from(agg.values()));

    const bySignature = new Map();
    for(const row of compactedRows){
      row.n = Math.round(row.n * 100) / 100;
      const key = [rowNumKey(row), row.type, fmtN(row.n)].join("|");
      if(!bySignature.has(key)){
        bySignature.set(key, {
          nums:row.nums,
          type:row.type,
          n:row.n,
          blocks:[]
        });
      }
      bySignature.get(key).blocks.push(row.block);
    }

    const groupedByBlock = {};
    const addOut = (block, item) => {
      if(!groupedByBlock[block]) groupedByBlock[block] = [];
      groupedByBlock[block].push(item);
    };

    const canCombineSignatureBlocks = item => {
      if(item.type !== "da" || item.blocks.length <= 1) return true;

      const pairSet = new Set();
      const daiSet = new Set();
      for(const block of item.blocks){
        const dais = blockDais(block);
        if(dais.length !== 2) return false;
        const pair = sortDaisByRank(dais, rank);
        pairSet.add(pair.join("|"));
        pair.forEach(dai => daiSet.add(dai));
      }

      const unionDais = sortDaisByRank(Array.from(daiSet), rank);
      if(unionDais.length <= 2) return true;
      return pairDais(unionDais).every(pair => pairSet.has(pair.join("|")));
    };

    for(const item of bySignature.values()){
      if(canCombineSignatureBlocks(item)){
        const block = combineBlocks(item.blocks, rank);
        addOut(block, item);
      }else{
        item.blocks.forEach(block => addOut(block, {...item, blocks:[block]}));
      }
    }

    const renderNormalLine = items => {
      const sorted = items.slice().sort((a,b)=>(typeRank[a.type] ?? 999) - (typeRank[b.type] ?? 999));
      if(!sorted.length) return "";
      const num = sorted[0].nums[0];
      let line = makeLine(num, sorted[0].type, sorted[0].n);
      for(let i=1; i<sorted.length; i++){
        line += "." + sorted[i].type + fmtN(sorted[i].n) + "n";
      }
      return line;
    };
    const compactDaPairsToDv = (pairs, amount) => {
      const remaining = new Map();
      const pairKey = pair => sortPair(pair[0], pair[1]).join(".");
      uniquePairs(pairs).forEach(pair => remaining.set(pairKey(pair), sortPair(pair[0], pair[1])));
      const lines=[];
      const hasPair = (a,b) => remaining.has(pairKey([a,b]));
      const isComplete = nums => pairNumbers(nums).every(pair => hasPair(pair[0], pair[1]));
      const removeClique = nums => {
        pairNumbers(nums).forEach(pair => remaining.delete(pairKey(pair)));
      };

      const findComponents = () => {
        const adj = new Map();
        const addNode = n => {
          if(!adj.has(n)) adj.set(n, new Set());
        };
        for(const pair of remaining.values()){
          addNode(pair[0]);
          addNode(pair[1]);
          adj.get(pair[0]).add(pair[1]);
          adj.get(pair[1]).add(pair[0]);
        }

        const seen = new Set();
        const comps = [];
        for(const n of sortNumsAsc(Array.from(adj.keys()))){
          if(seen.has(n)) continue;
          const stack=[n], comp=[];
          seen.add(n);
          while(stack.length){
            const cur=stack.pop();
            comp.push(cur);
            for(const next of adj.get(cur) || []){
              if(!seen.has(next)){
                seen.add(next);
                stack.push(next);
              }
            }
          }
          comps.push(sortNumsAsc(comp));
        }
        return comps;
      };

      const findCliqueInSmallComponent = nums => {
        for(let size=nums.length; size>=3; size--){
          let found=null;
          const picked=[];
          const walk = start => {
            if(found) return;
            if(picked.length === size){
              if(isComplete(picked)) found = picked.slice();
              return;
            }
            for(let i=start; i<nums.length; i++){
              picked.push(nums[i]);
              walk(i + 1);
              picked.pop();
              if(found) return;
            }
          };
          walk(0);
          if(found) return found;
        }
        return null;
      };

      const findTriangleInLargeComponent = nums => {
        for(let i=0; i<nums.length; i++){
          for(let j=i+1; j<nums.length; j++){
            if(!hasPair(nums[i], nums[j])) continue;
            for(let k=j+1; k<nums.length; k++){
              if(hasPair(nums[i], nums[k]) && hasPair(nums[j], nums[k])){
                return [nums[i], nums[j], nums[k]];
              }
            }
          }
        }
        return null;
      };

      const findFullDvNums = () => {
        const comps = findComponents()
          .filter(comp => comp.length >= 3)
          .sort((a,b) => b.length - a.length || compareNum(a[0], b[0]));

        for(const nums of comps){
          if(isComplete(nums)) return nums;
          if(nums.length <= 9){
            const clique = findCliqueInSmallComponent(nums);
            if(clique) return clique;
          }else{
            const triangle = findTriangleInLargeComponent(nums);
            if(triangle) return triangle;
          }
        }
        return null;
      };

      while(true){
        const combo = findFullDvNums();
        if(!combo) break;
        lines.push(makeLine(combo, "dv", amount));
        removeClique(combo);
      }

      Array.from(remaining.values())
        .sort((a,b)=>{
          const a0=numSortValue(a[0]), b0=numSortValue(b[0]);
          if(a0 !== b0) return a0 - b0;
          return numSortValue(a[1]) - numSortValue(b[1]);
        })
        .forEach(pair => lines.push(makeDaLine(pair[0], pair[1], amount)));
      return lines;
    };
    const renderDaLines = (items, block) => {
      const byAmount = {};
      items.forEach(item => {
        const key = fmtN(item.n);
        if(!byAmount[key]) byAmount[key] = [];
        byAmount[key].push(sortPair(item.nums[0], item.nums[1]));
      });
      const lines=[];
      Object.keys(byAmount).sort((a,b)=>parseAmount(a)-parseAmount(b)).forEach(key=>{
        const pairs = uniquePairs(byAmount[key]);
        lines.push(...compactDaPairsToDv(pairs, parseAmount(key)));
      });
      return lines;
    };
    const mergeDaWithSameNumLines = lines => {
      const daByNums = new Map();
      lines.forEach((line, idx) => {
        const m = String(line || "").match(/^([0-9]+(?:\.[0-9]+)+)da[\d,.]+n$/i);
        if(m) daByNums.set(m[1], { line, idx });
      });

      const consumed = new Set();
      const merged = [];
      lines.forEach((line, idx) => {
        if(consumed.has(idx)) return;
        const m = String(line || "").match(/^([0-9]+(?:\.[0-9]+)+)([a-z].*)$/i);
        if(m){
          const suffix = m[2].toLowerCase();
          const da = daByNums.get(m[1]);
          if(da && da.idx !== idx && !suffix.startsWith("da") && !suffix.startsWith("dv")){
            merged.push(da.line + "." + m[2]);
            consumed.add(da.idx);
            return;
          }
        }
        merged.push(line);
      });
      return merged;
    };

    const blockNames = Object.keys(groupedByBlock).sort((a,b)=>{
      const ad = blockDais(a), bd = blockDais(b);
      if(ad.length !== bd.length) return ad.length - bd.length;
      const len = Math.max(ad.length, bd.length);
      for(let i=0; i<len; i++){
        const ar = rank[ad[i]] ?? 9999;
        const br = rank[bd[i]] ?? 9999;
        if(ar !== br) return ar - br;
      }
      return a.localeCompare(b);
    });

    const out=[];
    for(const block of blockNames){
      const items = groupedByBlock[block];
      const normalGroups = {};
      const daItems = [];
      items.forEach(item => {
        if(item.type === "da") daItems.push(item);
        else{
          const key = item.nums[0];
          if(!normalGroups[key]) normalGroups[key] = [];
          normalGroups[key].push(item);
        }
      });

      const lines=[];
      const normalLineItems = [];
      const singleShapeGroups = {};
      Object.keys(normalGroups).forEach(num => {
        const groupItems = normalGroups[num];
        if(groupItems.length > 1){
          const line = renderNormalLine(groupItems);
          if(line) normalLineItems.push({line, num});
          return;
        }
        const item = groupItems[0];
        const key = [item.type, fmtN(item.n), String(item.nums[0]).length].join("|");
        if(!singleShapeGroups[key]){
          singleShapeGroups[key] = {
            type:item.type,
            n:item.n,
            nums:[]
          };
        }
        singleShapeGroups[key].nums.push(item.nums[0]);
      });

      Object.values(singleShapeGroups).forEach(group => {
        const nums = group.nums.slice().sort(compareNum);
        if(nums.length){
          normalLineItems.push({
            line:makeLine(nums, group.type, group.n),
            num:nums[0]
          });
        }
      });
      normalLineItems
        .sort((a,b)=>compareNum(a.num, b.num))
        .forEach(item => lines.push(item.line));
      const daLines = renderDaLines(daItems, block);
      if(block === "HN"){
        lines.push(...daLines);
      }else{
        lines.push(...daLines.sort((a,b)=>{
        const pa = (a.match(/^(\d+)\.(\d+)/) || []).slice(1).map(numSortValue);
        const pb = (b.match(/^(\d+)\.(\d+)/) || []).slice(1).map(numSortValue);
        if((pa[0] || 0) !== (pb[0] || 0)) return (pa[0] || 0) - (pb[0] || 0);
        return (pa[1] || 0) - (pb[1] || 0);
        }));
      }

      if(!lines.length) continue;
      out.push(compactThreeDaiLabel(block));
      mergeDaWithSameNumLines(groupDuplicateSuffixLines(lines)).forEach(line => out.push(...splitTachDisplayLine(line, 20)));
      out.push("");
    }
    return out.join("\n").trim();
  };

  return {
    tach:renderRows(tach),
    khong:renderRows(khong)
  };
}

function mapDaiName(line){
  const c = cleanName(line);
  for(const [k,v] of Object.entries(NAME_MAP)){
    if(cleanName(k)===c) return v;
  }
  return null;
}
function findDaiInLine(line){
  const exact = mapDaiName(line);
  if(exact) return exact;

  const c = " " + cleanName(line) + " ";
  const entries = Object.entries(NAME_MAP).sort((a,b)=>cleanName(b[0]).length-cleanName(a[0]).length);
  for(const [k,v] of entries){
    const kk = " " + cleanName(k) + " ";
    if(c.includes(kk)) return v;
  }
  return null;
}
function normalizeResultNumBySection(n, section, region){
  let x = String(n || "").replace(/\D/g, "");
  if(!x) return "";

  // Khi copy kết quả, các số có 0 đầu thường bị rút gọn.
  // Chuẩn hóa lại đúng độ dài theo giải để tạo vùng XC/DD chính xác.
  if(region === "HN"){
    if(section === "g6" && x.length < 3) x = x.padStart(3, "0");
    if(section === "g7" && x.length < 2) x = x.padStart(2, "0");
  }else{
    if(section === "g8" && x.length < 2) x = x.padStart(2, "0");
    if(section === "g7" && x.length < 3) x = x.padStart(3, "0");
  }
  return x;
}

function detectPrizeSection(line){
  const raw = String(line || "");
  const norm = raw.toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const patterns = [
    ["db", /^(?:giai\s*)?(?:db|dac\s*biet)\b/],
    ["g1", /^(?:giai|g)\s*(?:nhat|1)\b/],
    ["g2", /^(?:giai|g)\s*(?:nhi|2)\b/],
    ["g3", /^(?:giai|g)\s*(?:ba|3)\b/],
    ["g4", /^(?:giai|g)\s*(?:tu|4)\b/],
    ["g5", /^(?:giai|g)\s*(?:nam|5)\b/],
    ["g6", /^(?:giai|g)\s*(?:sau|6)\b/],
    ["g7", /^(?:giai|g)\s*(?:bay|7)\b/],
    ["g8", /^(?:giai|g)\s*(?:tam|8)\b/]
  ];

  for(const [name, re] of patterns){
    if(!re.test(norm)) continue;

    // Cắt phần nhãn giải ở đầu dòng, giữ lại phần số phía sau.
    // Không dựa vào \b unicode để tránh lỗi với dấu tiếng Việt.
    const m = raw.match(/^\s*(?:giải|giai|g)?\s*(?:đb|db|đặc\s*biệt|dac\s*biet|nhất|nhat|nhì|nhi|ba|tư|tu|năm|nam|sáu|sau|bảy|bay|tám|tam|[1-8])\s*[\.\:\-\t ]*/i);
    const rest = m ? raw.slice(m[0].length) : raw;
    return {section:name, rest};
  }
  return {section:"", rest:raw};
}

function isResultMetaLine(line){
  const s = String(line || "").trim();
  if(!s) return true;
  if(/^kết\s*quả/i.test(s) || /^ket\s*qua/i.test(s)) return true;
  if(/^hà\s*nội$/i.test(s) || /^ha\s*noi$/i.test(s) || /^hn$/i.test(s)) return true;
  // Không đưa ngày/giờ hoặc dòng mã kỳ vào atomic kết quả.
  if(/\b\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?\b/.test(s)) return true;
  if(/\b\d{1,2}\.\d{1,2}\.\d{2,4}\b/.test(s)) return true;
  if(/\b\d{1,2}:\d{2}(?::\d{2})?\b/.test(s)) return true;
  return false;
}

function shapeResultRecord(dai, numsRaw, position={}){
  const nums = (numsRaw || []).filter(Boolean).map(x=>String(x));
  const firstByLen = len => nums.find(n => String(n).length >= len) || "";
  const lastByLen = len => nums.slice().reverse().find(n => String(n).length >= len) || "";
  const first2 = firstByLen(2);
  const last2 = lastByLen(2);
  const first3 = firstByLen(3);
  const last3 = lastByLen(3);
  const first4 = firstByLen(4);
  const last4 = lastByLen(4);

  const rec = {
    full: nums,

    // Bao = toàn bộ giải theo độ dài cần dò.
    bao2: nums.map(n=>n.slice(-2)),
    bao3: nums.filter(n=>n.length>=3).map(n=>n.slice(-3)),
    bao4: nums.filter(n=>n.length>=4).map(n=>n.slice(-4)),

    // Mặc định khi chưa có nhãn giải rõ ràng.
    dau2: first2 ? [first2.slice(-2)] : [],
    duoi2: last2 ? [last2.slice(-2)] : [],
    dau3: first3 ? [first3.slice(-3)] : [],
    duoi3: last3 ? [last3.slice(-3)] : [],
    dau4: first4 ? [first4.slice(-4)] : [],
    duoi4: last4 ? [last4.slice(-4)] : []
  };

  // Nếu parser đã biết vị trí giải thật thì dùng vị trí đó để dò dau/duoi/xc.
  if(position.dau2) rec.dau2 = position.dau2.slice();
  if(position.duoi2) rec.duoi2 = position.duoi2.slice();
  if(position.dau3) rec.dau3 = position.dau3.slice();
  if(position.duoi3) rec.duoi3 = position.duoi3.slice();
  if(position.dau4) rec.dau4 = position.dau4.slice();
  if(position.duoi4) rec.duoi4 = position.duoi4.slice();

  // Vùng xỉu chủ riêng. Không dò XC bằng bao3 chung.
  rec.xc3 = position.xc3 ? position.xc3.slice() : rec.dau3.concat(rec.duoi3);

  // Alias cũ để không làm gãy các phần đang đúng.
  rec.all2 = rec.bao2;
  rec.all3 = rec.bao3;
  rec.all4 = rec.bao4;
  return rec;
}

function buildPositionFromSections(sections, region){
  const db = (sections.db || [])[0] || "";
  const db2 = db ? [db.slice(-2)] : [];
  const db3 = db ? [db.slice(-3)] : [];
  const db4 = db ? [db.slice(-4)] : [];

  if(region === "HN"){
    const g6 = (sections.g6 || []).map(n=>String(n).slice(-3));
    const g7 = (sections.g7 || []).map(n=>String(n).slice(-2));
    return {
      // HN: đầu 2 số = giải bảy; đuôi 2 số = 2 số cuối ĐB.
      dau2:g7,
      duoi2:db2,
      // HN: xcdau = giải sáu; xcduoi = 3 số cuối ĐB.
      dau3:g6,
      duoi3:db3,
      dau4:db4,
      duoi4:db4,
      xc3:g6.concat(db3)
    };
  }

  const g8 = (sections.g8 || []).map(n=>String(n).slice(-2));
  const g7 = (sections.g7 || []).map(n=>String(n).slice(-3));
  return {
    // MN/MT: đầu 2 số = giải tám; đuôi 2 số = 2 số cuối ĐB.
    dau2:g8,
    duoi2:db2,
    // MN/MT: xcdau = giải bảy; xcduoi = 3 số cuối ĐB.
    dau3:g7,
    duoi3:db3,
    dau4:db4,
    duoi4:db4,
    xc3:g7.concat(db3)
  };
}

function collectLooseResultNums(text){
  const out = [];
  const lines = (text || "").split(/\n+/).map(x=>x.trim()).filter(Boolean);
  for(const raw of lines){
    if(isResultMetaLine(raw)) continue;
    if(findDaiInLine(raw)) continue;
    const detected = detectPrizeSection(raw);
    const line = detected && detected.section ? detected.rest : raw;
    const nums = line.match(/\d+/g) || [];
    nums.forEach(n=>{
      const x = String(n || "").replace(/\D/g, "");
      if(x) out.push(x);
    });
  }
  return out;
}

function shapeHnLooseResultByOrder(numsRaw){
  const raw = (numsRaw || []).map(n=>String(n || "").replace(/\D/g, "")).filter(Boolean);
  if(!raw.length) return {};

  // HN không nhãn giải nhưng dán đủ theo thứ tự chuẩn:
  // ĐB(1), G1(1), G2(2), G3(6), G4(4), G5(6), G6(3), G7(4).
  // XC đầu HN phải lấy G6; XC đuôi lấy 3 số cuối ĐB.
  if(raw.length >= 23){
    const sec = {db:[],g1:[],g2:[],g3:[],g4:[],g5:[],g6:[],g7:[],g8:[]};
    sec.db = raw.slice(0,1).map(n=>normalizeResultNumBySection(n,"db","HN"));
    sec.g1 = raw.slice(1,2).map(n=>normalizeResultNumBySection(n,"g1","HN"));
    sec.g2 = raw.slice(2,4).map(n=>normalizeResultNumBySection(n,"g2","HN"));
    sec.g3 = raw.slice(4,10).map(n=>normalizeResultNumBySection(n,"g3","HN"));
    sec.g4 = raw.slice(10,14).map(n=>normalizeResultNumBySection(n,"g4","HN"));
    sec.g5 = raw.slice(14,20).map(n=>normalizeResultNumBySection(n,"g5","HN"));
    sec.g6 = raw.slice(20,23).map(n=>normalizeResultNumBySection(n,"g6","HN"));
    sec.g7 = raw.slice(23,27).map(n=>normalizeResultNumBySection(n,"g7","HN"));
    const ordered = [].concat(sec.db, sec.g1, sec.g2, sec.g3, sec.g4, sec.g5, sec.g6, sec.g7).filter(Boolean);
    return { HN: shapeResultRecord("HN", ordered, buildPositionFromSections(sec, "HN")) };
  }

  // Fallback cuối cùng: không đủ cấu trúc thì vẫn tạo bao theo dữ liệu thô, nhưng không được dùng để kết luận sai XC.
  const cleaned = raw.filter(n => n.length >= 2);
  if(!cleaned.length) return {};
  return { HN: shapeResultRecord("HN", cleaned) };
}

function parseHnResultText(text){
  const parsed = parseStructuredResultText(text, "HN", "HN");
  if(parsed && parsed.HN && parsed.HN.full && parsed.HN.full.length) return parsed;

  // Nếu HN dán dạng chỉ có số, suy luận vị trí theo thứ tự giải HN chuẩn.
  // Lỗi cũ: fallback lấy xcdau = số 3 chữ số đầu tiên và xcduoi = số 3 chữ số cuối,
  // nên 707 ở Giải 6 bị rơi khỏi vùng XC dù bao3 vẫn có 707.
  const nums = collectLooseResultNums(text);
  return shapeHnLooseResultByOrder(nums);
}

function parseStructuredResultText(text, region, fallbackDai=""){
  const lines=(text||"").split(/\n+/).map(x=>x.trim()).filter(Boolean);
  const out={};
  const sectionsByDai={};
  const sectionCurByDai={};
  let cur = fallbackDai || null;
  let sawPrizeLabel=false;

  const ensure = dai => {
    if(!dai) return;
    if(!out[dai]) out[dai]=[];
    if(!sectionsByDai[dai]) sectionsByDai[dai]={db:[],g1:[],g2:[],g3:[],g4:[],g5:[],g6:[],g7:[],g8:[]};
  };

  if(cur) ensure(cur);

  for(const raw of lines){
    if(isResultMetaLine(raw)) continue;

    const dai = findDaiInLine(raw);
    if(dai){
      cur = dai;
      ensure(cur);
      // Dòng tên đài chỉ đổi vùng đài, không lấy số ngày/giờ/mã trong dòng này.
      continue;
    }

    if(!cur) continue;
    ensure(cur);

    const detected = detectPrizeSection(raw);
    let line = raw;
    let section = "";
    if(detected.section){
      section = detected.section;
      sectionCurByDai[cur] = section;
      sawPrizeLabel = true;
      line = detected.rest;
    }else{
      section = sectionCurByDai[cur] || "";
    }

    const nums = line.match(/\d+/g) || [];
    if(!nums.length) continue;

    if(section){
      nums.forEach(n=>{
        const x = normalizeResultNumBySection(n, section, region);
        if(!x || x.length < 2) return;
        sectionsByDai[cur][section].push(x);
        out[cur].push(x);
      });
    }else{
      nums.forEach(n=>{ if(n.length>=2) out[cur].push(n); });
    }
  }

  if(!sawPrizeLabel) return null;

  const shaped={};
  for(const [dai, numsRaw] of Object.entries(out)){
    shaped[dai] = shapeResultRecord(dai, numsRaw, buildPositionFromSections(sectionsByDai[dai] || {}, region));
  }
  return shaped;
}

function parseResultText(text, fallbackDai="", regionHint=""){
  const region = regionHint || (fallbackDai === "HN" ? "HN" : "MN");

  if(fallbackDai === "HN"){
    const hn = parseHnResultText(text);
    if(hn && hn.HN && hn.HN.full && hn.HN.full.length) return hn;
  }

  const structured = parseStructuredResultText(text, region, fallbackDai);
  if(structured && Object.keys(structured).length) return structured;

  const lines=(text||"").split(/\n+/).map(x=>x.trim()).filter(Boolean);
  const out={}; let cur=null;

  for(const line of lines){
    const dai=findDaiInLine(line);
    if(dai){
      cur=dai;
      if(!out[cur]) out[cur]=[];
      continue;
    }

    if(isResultMetaLine(line)) continue;

    const nums=line.match(/\d+/g);
    if(nums && cur){
      nums.forEach(n=>{ if(n.length>=2) out[cur].push(n); });
    }
  }

  if(!Object.keys(out).length && fallbackDai){
    const nums = (text || "").match(/\d+/g) || [];
    const cleaned = nums.filter(n => n.length >= 2);
    if(cleaned.length) out[fallbackDai] = cleaned;
  }

  const shaped={};
  for(const [dai, numsRaw] of Object.entries(out)){
    shaped[dai] = shapeResultRecord(dai, numsRaw);
  }
  return shaped;
}
function syncActiveRegionDataBuffer(){
  // Lỗi cũ: app chỉ đọc kqMn/kqMt/kqHn, còn ô đang dán trên overlay là activeResultData.
  // Nếu chưa kịp bấm Lưu hoặc debounce chưa chạy, runAll sẽ dò bằng vùng kết quả rỗng.
  if(!["MN","MT","HN"].includes(activeWorkspace)) return;
  const ids = regionRelatedIds(activeWorkspace);
  const activeResult = val("activeResultData");
  const activeXoa = val("activeXoaData");
  if(activeResult.trim()) setVal(ids.result, activeResult);
  if(activeXoa.trim()) setVal(ids.xoa, activeXoa);
}
function resultRegionHasData(obj, region){
  return !!(obj && obj[region] && Object.keys(obj[region]).length);
}
function parseAllResults(rows){
  syncActiveRegionDataBuffer();

  const obj = {
    MN:parseResultText(val("kqMn"), "", "MN"),
    MT:parseResultText(val("kqMt"), "", "MT"),
    HN:parseResultText(val("kqHn"), "HN", "HN")
  };

  // Fallback theo atomic đang dò: nếu tin là HN nhưng kqHn rỗng,
  // lấy ngay dữ liệu đang nằm trong ô Kết quả đang mở để tạo vùng HN.
  const activeText = val("activeResultData").trim();
  const needRegions = new Set((rows || []).map(r => r.region).filter(Boolean));
  if(activeText){
    for(const region of needRegions){
      if(resultRegionHasData(obj, region)) continue;
      const fallbackDai = region === "HN" ? "HN" : "";
      const parsed = parseResultText(activeText, fallbackDai, region);
      if(parsed && Object.keys(parsed).length) obj[region] = parsed;
    }
  }
  return obj;
}
function renderParsedResults(obj){
  const lines=[];
  for(const region of ["MN","MT","HN"]){
    const data=obj[region];
    if(!data || !Object.keys(data).length) continue;
    lines.push(region);
    for(const [dai,r] of Object.entries(data)){
      lines.push(dai);
      lines.push("Full: "+r.full.join("."));
      lines.push("Bao 2 số: "+r.bao2.join("."));
      lines.push("Đầu 2 số: "+r.dau2.join("."));
      lines.push("Đuôi 2 số: "+r.duoi2.join("."));
      lines.push("Bao 3 số: "+r.bao3.join("."));
      lines.push("Đầu 3 số: "+r.dau3.join("."));
      lines.push("Đuôi 3 số: "+r.duoi3.join("."));
      lines.push("XC 3 số: "+(r.xc3 || []).join("."));
      lines.push("Bao 4 số: "+r.bao4.join("."));
      lines.push("Đầu 4 số: "+r.dau4.join("."));
      lines.push("Đuôi 4 số: "+r.duoi4.join("."));
      lines.push("");
    }
  }
  setVal("parsedResults", lines.join("\n").trim());
}
function parseResultsOnly(){
  renderParsedResults(parseAllResults());
}


function hasAnyResults(results){
  return ["MN","MT","HN"].some(region => results && results[region] && Object.keys(results[region]).length);
}
function resultFor(results, region, dai){
  if(!results || !dai) return null;
  const r = region || "MN";
  if(results[r] && results[r][dai]) return results[r][dai];
  if(results.MN && results.MN[dai]) return results.MN[dai];
  if(results.MT && results.MT[dai]) return results.MT[dai];
  if(results.HN && results.HN[dai]) return results.HN[dai];
  return null;
}
function countExact(arr, num){
  const s = String(num || "");
  return (arr || []).filter(x => String(x) === s).length;
}
function isPermOf(a,b){
  a = String(a || "");
  b = String(b || "");
  if(a.length !== b.length) return false;
  return a.split("").sort().join("") === b.split("").sort().join("");
}
function countPerm(arr, num){
  const s = String(num || "");
  return (arr || []).filter(x => isPermOf(x,s)).length;
}
function winCoefForRow(row){
  const t = row.type;
  const num = row.nums && row.nums[0] ? String(row.nums[0]) : "";
  const len = num.length;
  if(t === "da"){
    const dc = row.daiCount || 1;
    if((row.region || "MN") === "HN") return getNum("coefDaHN",650);
    return dc >= 2 ? getNum("coefDa2",550) : getNum("coefDa1",750);
  }
  if(t === "b" || t === "bdao"){
    if(len === 2) return getNum("coef2",75);
    if(len === 3) return getNum("coef3",630);
    if(len === 4) return getNum("coef4",5500);
  }
  if(t === "dd" || t === "dau" || t === "duoi") return getNum("coef2",75);
  if(t === "xc" || t === "xcdau" || t === "xcduoi" || t === "xcdao") return getNum("coef3",630);
  return 0;
}
function calcWinRow(row, results){
  if(!row || !row.calc || !hasAnyResults(results)) return null;

  const t = row.type;
  const nums = row.nums || [];
  const n = Number(row.n || 0);
  const region = row.region || "MN";
  const dais = getDaisFromName(row.block);
  let hit = 0;

  if(t === "da"){
    if(nums.length < 2) return null;
    const a = nums[0], b = nums[1];

    if((row.daiCount || 1) >= 2 && dais.length >= 2){
      const r1 = resultFor(results, region, dais[0]);
      const r2 = resultFor(results, region, dais[1]);
      if(!r1 || !r2) return null;

      // DA/DV tính theo cặp, không nhân chéo.
      // Hit 2 đài = min(A đài 1, B đài 2) + min(B đài 1, A đài 2).
      const c1a = countExact(r1.bao2, a);
      const c2b = countExact(r2.bao2, b);
      const c1b = countExact(r1.bao2, b);
      const c2a = countExact(r2.bao2, a);
      const ab = Math.min(c1a, c2b);
      const ba = (a === b) ? 0 : Math.min(c1b, c2a);
      hit = ab + ba;
    }else{
      const r = resultFor(results, region, dais[0]);
      if(!r) return null;
      const ca = countExact(r.bao2, a);
      const cb = countExact(r.bao2, b);

      // DA/DV 1 đài = min(A,B), không A*B.
      hit = (a === b) ? Math.floor(ca / 2) : Math.min(ca, cb);
    }

  }else{
    const dai = dais[0];
    const r = resultFor(results, region, dai);
    if(!r) return null;

    const num = nums[0] || "";
    const len = String(num).length;

    if(t === "b"){
      if(len === 2) hit = countExact(r.bao2, num);
      else if(len === 3) hit = countExact(r.bao3, num);
      else if(len === 4) hit = countExact(r.bao4, num);

    }else if(t === "bdao"){
      if(len === 3) hit = countPerm(r.bao3, num);
      else if(len === 4) hit = countPerm(r.bao4, num);

    }else if(t === "dd"){
      hit = countExact(r.dau2, num) + countExact(r.duoi2, num);

    }else if(t === "dau"){
      hit = countExact(r.dau2, num);

    }else if(t === "duoi"){
      hit = countExact(r.duoi2, num);

    }else if(t === "xc"){
      hit = r.xc3 ? countExact(r.xc3, num) : (countExact(r.dau3, num) + countExact(r.duoi3, num));

    }else if(t === "xcdau"){
      hit = countExact(r.dau3, num);

    }else if(t === "xcduoi"){
      hit = countExact(r.duoi3, num);

    }else if(t === "xcdao"){
      hit = countPerm(r.dau3, num) + countPerm(r.duoi3, num);
    }
  }

  const coef = winCoefForRow(row);
  if(!hit || !coef || !n) return null;
  return {
    block: row.block,
    line: row.line,
    amount: n * coef * hit,
    hit,
    coef
  };
}
function calcWinners(rows, results){
  const items = [];
  let total = 0;
  for(const row of rows || []){
    const w = calcWinRow(row, results);
    if(w && w.amount > 0){
      items.push(w);
      total += w.amount;
    }
  }
  return {items,total};
}
function buildWinReport(pack){
  const items = pack && pack.items ? pack.items : [];
  if(!items.length) return "";
  const blockGroups = {};
  const blockOrder = [];
  const groupableTypes = new Set(["b","bdao","xc","xcdao","xcdau","xcduoi","dd","dau","duoi"]);
  const parseWinLine = (line)=>{
    const s = String(line || "");
    const da = s.match(/^(\d+)\.(\d+)da([\d,.]+)n$/i);
    if(da){
      const pair = sortPair(da[1], da[2]);
      return {kind:"da", nums:pair, type:"da", n:parseAmount(da[3])};
    }

    const normal = s.match(/^([0-9.]+)(bdao|xcdao|xcdau|xcduoi|duoi|dau|dd|b|xc)([\d,.]+)n$/i);
    if(!normal) return null;
    const nums = normal[1].split(".").filter(Boolean);
    if(!nums.length) return null;
    return {kind:"normal", nums, type:normal[2].toLowerCase(), n:parseAmount(normal[3])};
  };
  const addBlockGroup = (block)=>{
    if(!blockGroups[block]){
      blockGroups[block] = {normal:{}, normalOrder:[], da:{}, daOrder:[], other:[]};
      blockOrder.push(block);
    }
    return blockGroups[block];
  };

  for(const w of items){
    const group = addBlockGroup(w.block);
    const parsed = parseWinLine(w.line);
    if(!parsed){
      group.other.push(`${w.line} ${money(w.amount)}`);
      continue;
    }

    if(parsed.kind === "da"){
      const key = parsed.nums.join(".");
      if(!group.da[key]){
        group.da[key] = {nums:parsed.nums, n:0, amount:0};
        group.daOrder.push(key);
      }
      group.da[key].n += parsed.n;
      group.da[key].amount += w.amount;
      continue;
    }

    // Dòng thắng từ bảng trung gian thường đã là 1 số/dòng. Nếu gặp nhiều số
    // trong cùng dòng thì chia tiền đều để vẫn gom được mà không lệch tổng.
    const perNumAmount = w.amount / parsed.nums.length;
    for(const num of parsed.nums){
      const key = parsed.type + "|" + num;
      if(!group.normal[key]){
        group.normal[key] = {num, type:parsed.type, n:0, amount:0};
        group.normalOrder.push(key);
      }
      group.normal[key].n += parsed.n;
      group.normal[key].amount += perNumAmount;
    }
  }

  const out = [];
  for(const block of blockOrder){
    const group = blockGroups[block];
    const lines = [];
    const byShape = {};
    const shapeOrder = [];

    for(const key of group.normalOrder){
      const item = group.normal[key];
      const shape = item.type + "|" + fmtN(item.n) + "|" + money(item.amount);
      if(groupableTypes.has(item.type)){
        if(!byShape[shape]){
          byShape[shape] = {type:item.type, n:item.n, amount:0, nums:[]};
          shapeOrder.push(shape);
        }
        byShape[shape].nums.push(item.num);
        byShape[shape].amount += item.amount;
      }else{
        lines.push(`${makeLine(item.num, item.type, item.n)} ${money(item.amount)}`);
      }
    }

    for(const shape of shapeOrder){
      const item = byShape[shape];
      const nums = sortNumsAsc(item.nums);
      lines.push(`${makeLine(nums, item.type, item.n)} ${money(item.amount)}`);
    }

    for(const key of group.daOrder){
      const item = group.da[key];
      lines.push(`${makeDaLine(item.nums[0], item.nums[1], item.n)} ${money(item.amount)}`);
    }

    lines.push(...group.other);
    if(!lines.length) continue;
    out.push(block);
    out.push(...lines);
    out.push("");
  }
  return out.join("\n").trim();
}


// V0.5.63 - Atomic win engine: kết quả -> vùng kết quả -> atomic -> TRÚNG / KHÔNG TRÚNG.
// Không dùng nhánh gom công thức cũ để quyết định trúng. Gom chỉ được làm sau khi atomic đã phân vùng đúng.
function atomicWinEvaluateRow(row, results){
  if(!row || !row.calc || !hasAnyResults(results)) return null;

  const t = row.type;
  const nums = row.nums || [];
  const n = Number(row.n || 0);
  const region = row.region || "MN";
  const dais = getDaisFromName(row.block);
  const coef = winCoefForRow(row);
  let hit = 0;
  let zone = "";

  if(!n || !coef){
    return {row, hit:0, amount:0, coef, zone:"không tính"};
  }

  if(t === "da"){
    if(nums.length < 2) return {row, hit:0, amount:0, coef, zone:"da"};
    const a = nums[0], b = nums[1];
    if((row.daiCount || 1) >= 2 && dais.length >= 2){
      const r1 = resultFor(results, region, dais[0]);
      const r2 = resultFor(results, region, dais[1]);
      zone = "đá 2 đài / bao2 chéo";
      if(!r1 || !r2) return {row, hit:0, amount:0, coef, zone};
      const ab = Math.min(countExact(r1.bao2, a), countExact(r2.bao2, b));
      const ba = (a === b) ? 0 : Math.min(countExact(r1.bao2, b), countExact(r2.bao2, a));
      hit = ab + ba;
    }else{
      const r = resultFor(results, region, dais[0]);
      zone = "đá 1 đài / bao2";
      if(!r) return {row, hit:0, amount:0, coef, zone};
      const ca = countExact(r.bao2, a);
      const cb = countExact(r.bao2, b);
      hit = (a === b) ? Math.floor(ca / 2) : Math.min(ca, cb);
    }
  }else{
    const dai = dais[0];
    const r = resultFor(results, region, dai);
    const num = nums[0] || "";
    const len = String(num).length;
    if(!r) return {row, hit:0, amount:0, coef, zone:"thiếu kết quả"};

    if(t === "b"){
      if(len === 2){ hit = countExact(r.bao2, num); zone = "bao2"; }
      else if(len === 3){ hit = countExact(r.bao3, num); zone = "bao3"; }
      else if(len === 4){ hit = countExact(r.bao4, num); zone = "bao4"; }
    }else if(t === "bdao"){
      if(len === 3){ hit = countPerm(r.bao3, num); zone = "bao3 đảo"; }
      else if(len === 4){ hit = countPerm(r.bao4, num); zone = "bao4 đảo"; }
    }else if(t === "dd"){
      hit = countExact(r.dau2, num) + countExact(r.duoi2, num);
      zone = "đầu2 + đuôi2";
    }else if(t === "dau"){
      hit = countExact(r.dau2, num);
      zone = "đầu2";
    }else if(t === "duoi"){
      hit = countExact(r.duoi2, num);
      zone = "đuôi2";
    }else if(t === "xc"){
      hit = countExact(r.xc3 || [], num);
      zone = "xc = xcdau + xcduoi";
    }else if(t === "xcdau"){
      hit = countExact(r.dau3, num);
      zone = "xcdau";
    }else if(t === "xcduoi"){
      hit = countExact(r.duoi3, num);
      zone = "xcduoi";
    }else if(t === "xcdao"){
      hit = countPerm(r.dau3, num) + countPerm(r.duoi3, num);
      zone = "xc đảo";
    }
  }

  const amount = hit > 0 ? n * coef * hit : 0;
  return {row, block:row.block, line:row.line, hit, coef, amount, zone};
}

function calcWinners(rows, results){
  const items = [];
  const misses = [];
  let total = 0;
  if(!hasAnyResults(results)) return {items, misses, total};

  for(const row of rows || []){
    const ev = atomicWinEvaluateRow(row, results);
    if(!ev) continue;
    if(ev.hit > 0 && ev.amount > 0){
      items.push({block:ev.block, line:ev.line, amount:ev.amount, hit:ev.hit, coef:ev.coef, zone:ev.zone, row:ev.row});
      total += ev.amount;
    }else{
      misses.push({block:row.block, line:row.line, hit:0, coef:ev.coef, zone:ev.zone, row});
    }
  }
  return {items, misses, total};
}

function buildAtomicSection(title, rows, showMoney){
  const out = [title, ""];
  if(!rows || !rows.length){
    out.push("Trống");
    return out.join("\n").trim();
  }

  const groups = {};
  const order = [];
  for(const item of rows){
    const block = item.block || (item.row && item.row.block) || "Không rõ đài";
    if(!groups[block]){ groups[block] = []; order.push(block); }
    groups[block].push(item);
  }

  for(const block of order){
    out.push(block);
    for(const item of groups[block]){
      if(showMoney){
        const meta = item.zone ? ` [${item.zone}; hit=${item.hit}]` : "";
        out.push(`${item.line} ${money(item.amount)}${meta}`);
      }else{
        const meta = item.zone ? ` [${item.zone}; hit=0]` : "";
        out.push(`${item.line}${meta}`);
      }
    }
    out.push("");
  }
  return out.join("\n").trim();
}

function buildWinReport(pack){
  const items = pack && pack.items ? pack.items : [];
  const misses = pack && pack.misses ? pack.misses : [];
  if(!items.length && !misses.length) return "";
  return [
    buildAtomicSection("TRÚNG", items, true),
    "",
    buildAtomicSection("KHÔNG TRÚNG", misses, false)
  ].join("\n").trim();
}

function buildWinStepTrace(rows, results, pack){
  const lines = [];
  lines.push("DEBUG DÒ TRÚNG ATOMIC");
  lines.push("");
  lines.push("B1. Atomic tin ghi:");
  (rows || []).forEach(r=>{
    if(!r.calc) return;
    lines.push(`${r.region || ""} | ${r.block} | ${r.line} | type=${r.type} | n=${r.n}`);
  });
  lines.push("");
  lines.push("B2. Vùng kết quả:");
  ["MN","MT","HN"].forEach(region=>{
    const data = results && results[region];
    if(!data || !Object.keys(data).length) return;
    lines.push(region);
    Object.entries(data).forEach(([dai,r])=>{
      lines.push(`${dai} bao3=${(r.bao3||[]).join(".")}`);
      lines.push(`${dai} xcdau=${(r.dau3||[]).join(".")}`);
      lines.push(`${dai} xcduoi=${(r.duoi3||[]).join(".")}`);
      lines.push(`${dai} xc=${(r.xc3||[]).join(".")}`);
    });
  });
  lines.push("");
  lines.push("B3. Kết quả từng atomic:");
  const all = []
    .concat((pack && pack.items) || [])
    .concat((pack && pack.misses) || []);
  all.forEach(item=>{
    const status = item.hit > 0 ? "TRÚNG" : "KHÔNG";
    const amount = item.amount ? ` | tiền=${money(item.amount)}` : "";
    lines.push(`${status} | ${item.block} | ${item.line} | vùng=${item.zone || ""} | hit=${item.hit}${amount}`);
  });
  lines.push("");
  lines.push(`Tổng trúng=${money((pack && pack.total) || 0)}`);
  return lines.join("\n").trim();
}

function runAll(){
  try{
    if(!val("inputData").trim()){
      clearRun();
      return;
    }
    const blocks = splitBlocks(val("inputData"));
    const rows = buildIntermediate(blocks);

    renderIntermediate(rows);

    const total = totalMoney(rows);
    setVal("copyFast", buildCopyFast(blocks, total));
    setVal("ghi", money(total));

    const tk = buildTach(blocks);
    setVal("soTach", tk.tach);
    setVal("soKhongTach", tk.khong);
    scrollTextTop("soTach");
    scrollTextTop("soKhongTach");

    // CHẠY không hiện chuẩn hóa kết quả. Chỉ dò ngầm nếu đã có dữ liệu kết quả.
    const resultObj = parseAllResults(rows);
    const winPack = calcWinners(rows, resultObj);
    setVal("thuong", winPack.total ? money(winPack.total) : "0");
    setVal("tong", money(total - winPack.total));
    setVal("soTrung", buildWinReport(winPack));
    setVal("detail", buildWinStepTrace(rows, resultObj, winPack));
    scrollTextTop("soTrung");
  }catch(err){
    console.error(err);
    setVal("ghi", "Lỗi chạy: " + (err && err.message ? err.message : err));
  }
}
function clearRun(){
  ["inputData","copyFast","ghi","tong","thuong","soTach","soKhongTach","soTrung","parsedResults","detail"].forEach(id=>setVal(id,""));
  const tbody = document.querySelector("#interTable tbody");
  if(tbody) tbody.innerHTML = "";
  setVal("thuong","0");
  saveActiveWorkspaceInput();
}
async function copyText(id){
  const text = val(id);
  try{
    await navigator.clipboard.writeText(text);
    return true;
  }catch(e){
    alert("Không copy tự động được, anh bôi đen rồi copy thủ công nhé");
    return false;
  }
}
function flashActionButton(btn, text, fallback){
  if(!btn) return;
  const old = btn.textContent || fallback || "";
  btn.textContent = text;
  btn.classList.add("saved");
  setTimeout(()=>{
    btn.textContent = old || fallback || "";
    btn.classList.remove("saved");
  }, 900);
}
async function copyPrintFast(btn){
  if(document.activeElement && document.activeElement.blur) document.activeElement.blur();
  if(val("inputData").trim()) runAll();
  const text = val("copyFast").trim();
  if(!text){
    alert("Chưa có dữ liệu để in");
    return;
  }

  const ok = await copyText("copyFast");
  if(ok) flashActionButton(btn, "Đã copy", "In");
}
function splitPrintOverlayText(text){
  const lines = String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const moneyLine = s => /^-?[\d.,]+k$/i.test(String(s || "").trim());
  let amount = "";

  let last = lines.length - 1;
  while(last >= 0 && !lines[last].trim()) last--;
  if(last >= 0 && moneyLine(lines[last])){
    amount = lines[last].trim();
    lines.splice(last, 1);
    while(lines.length && !lines[lines.length - 1].trim()) lines.pop();
  }

  let date = "";
  let first = 0;
  while(first < lines.length && !lines[first].trim()) first++;
  if(first < lines.length && /^ngày\b/i.test(lines[first].trim())){
    const firstLine = lines[first].trim();
    const headAmount = firstLine.match(/^(.*?)(?:\s+)(-?[\d.,]+k)$/i);
    if(headAmount){
      date = headAmount[1].trim();
      if(!amount) amount = headAmount[2].trim();
    }else{
      date = firstLine;
    }
    lines.splice(first, 1);
  }
  if(!amount) amount = val("ghi").trim();

  while(lines.length && !lines[0].trim()) lines.shift();
  while(lines.length && !lines[lines.length - 1].trim()) lines.pop();
  return {
    date,
    body:lines.join("\n"),
    amount
  };
}
function openPrintOverlay(btn){
  if(document.activeElement && document.activeElement.blur) document.activeElement.blur();
  if(val("inputData").trim()) runAll();
  const text = val("copyFast").trim();
  if(!text){
    alert("Chưa có dữ liệu để in");
    return;
  }
  const output = el("printOverlayText");
  const date = el("printOverlayDate");
  const amount = el("printOverlayAmount");
  const head = el("printOverlayHead");
  const overlay = el("printOverlay");
  const view = splitPrintOverlayText(text);
  if(date) date.textContent = view.date;
  if(output) output.textContent = view.body;
  if(amount){
    amount.textContent = view.amount;
    amount.hidden = !view.amount;
  }
  if(head) head.hidden = !(view.date || view.amount);
  if(overlay){
    overlay.dataset.copyText = text;
    overlay.hidden = false;
    overlay.scrollTop = 0;
  }
  if(btn) flashActionButton(btn, "Đã mở", "In");
}
function closePrintOverlay(){
  const overlay = el("printOverlay");
  if(overlay) overlay.hidden = true;
}
async function copyPrintOverlay(btn){
  const text = (el("printOverlay")?.dataset.copyText || el("printOverlayText")?.textContent || "").trim();
  if(!text){
    alert("Chưa có dữ liệu để copy");
    return;
  }
  try{
    await navigator.clipboard.writeText(text);
    flashActionButton(btn, "Đã copy", "Copy");
  }catch(e){
    alert("Không copy tự động được, anh bôi đen rồi copy thủ công nhé");
  }
}

function wrapPrintLine(line, ctx, maxWidth){
  const s = String(line || "");
  if(!s) return [""];
  if(ctx.measureText(s).width <= maxWidth) return [s];

  const bet = s.match(/^([0-9.]+)([a-z][a-z0-9,.]*(?:n)(?:\.[a-z][a-z0-9,.]*(?:n))*)$/i);
  if(bet){
    const nums = bet[1].split(".").filter(Boolean);
    const suffix = bet[2];
    const firstType = (suffix.match(/^([a-z]+)/i) || [,""])[1].toLowerCase();
    const isLongDa = firstType === "da" || firstType === "dv";
    const out = [];
    let i = 0;
    while(i < nums.length){
      let best = i;
      for(let j = i; j < nums.length; j++){
        const finalLine = j === nums.length - 1;
        const candidate = nums.slice(i, j + 1).join(".") + (isLongDa ? (finalLine ? suffix : ".") : suffix);
        if(ctx.measureText(candidate).width <= maxWidth) best = j;
        else break;
      }
      const finalLine = best === nums.length - 1;
      out.push(nums.slice(i, best + 1).join(".") + (isLongDa ? (finalLine ? suffix : ".") : suffix));
      i = best + 1;
    }
    return out;
  }

  const out = [];
  let cur = "";
  for(const ch of s){
    const next = cur + ch;
    if(cur && ctx.measureText(next).width > maxWidth){
      out.push(cur);
      cur = ch;
    }else{
      cur = next;
    }
  }
  if(cur) out.push(cur);
  return out;
}

function printImageLines(text, ctx, maxWidth){
  const rawLines = String(text || "").split(/\n/);
  const out = [];
  rawLines.forEach(line=>{
    const wrapped = wrapPrintLine(line.trimEnd(), ctx, maxWidth);
    out.push(...wrapped);
  });
  return out;
}

function makePrintImageDataUrl(text){
  const width = 384;
  const marginX = 12;
  const marginY = 12;
  const fontSize = 33;
  const lineHeight = 40;
  const probe = document.createElement("canvas");
  const pctx = probe.getContext("2d");
  if(!pctx) throw new Error("Không tạo được canvas đo chữ");
  pctx.font = `${fontSize}px Arial, sans-serif`;
  const lines = printImageLines(text, pctx, width - marginX * 2);
  const height = Math.max(80, marginY * 2 + lines.length * lineHeight);

  const canvas = document.createElement("canvas");
  const scale = Math.max(2, Math.ceil(window.devicePixelRatio || 1));
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext("2d");
  if(!ctx) throw new Error("Không tạo được canvas ảnh");
  ctx.scale(scale, scale);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#000";
  ctx.font = `${fontSize}px Arial, sans-serif`;
  ctx.textBaseline = "top";

  lines.forEach((line, idx)=>{
    ctx.fillText(line, marginX, marginY + idx * lineHeight);
  });

  return canvas.toDataURL("image/png");
}

function canvasToBlob(canvas){
  return new Promise((resolve, reject)=>{
    canvas.toBlob(blob=>{
      if(blob) resolve(blob);
      else reject(new Error("Không tạo được ảnh in"));
    }, "image/png");
  });
}

async function makePrintImageFile(text){
  const width = 384;
  const marginX = 12;
  const marginY = 12;
  const fontSize = 33;
  const lineHeight = 40;
  const probe = document.createElement("canvas");
  const pctx = probe.getContext("2d");
  pctx.font = `${fontSize}px Arial, sans-serif`;
  const lines = printImageLines(text, pctx, width - marginX * 2);
  const height = Math.max(80, marginY * 2 + lines.length * lineHeight);

  const canvas = document.createElement("canvas");
  const scale = Math.max(2, Math.ceil(window.devicePixelRatio || 1));
  canvas.width = width * scale;
  canvas.height = height * scale;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";

  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#000";
  ctx.font = `${fontSize}px Arial, sans-serif`;
  ctx.textBaseline = "top";

  lines.forEach((line, idx)=>{
    ctx.fillText(line, marginX, marginY + idx * lineHeight);
  });

  const blob = await canvasToBlob(canvas);
  return new File([blob], `pxso-in-${dateKey()}.png`, {type:"image/png"});
}

async function sharePrintImage(file){
  if(navigator.canShare && navigator.share && navigator.canShare({files:[file]})){
    await navigator.share({
      files:[file],
      title:"PX-SO in ảnh",
      text:"Ảnh in PX-SO"
    });
    return true;
  }
  return false;
}

function downloadFile(file){
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name || "pxso-in.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 2000);
}

function readStorage(key){
  try{
    return JSON.parse(localStorage.getItem(key) || "{}");
  }catch(e){
    return {};
  }
}
function writeStorage(key, data){
  try{
    localStorage.setItem(key, JSON.stringify(data || {}));
    return true;
  }catch(e){
    console.error(e);
    return false;
  }
}
function collectValues(ids){
  const out = {};
  ids.forEach(id => out[id] = val(id));
  return out;
}
function applyValues(data){
  Object.entries(data || {}).forEach(([id, value]) => setVal(id, value));
}
function dailyInputKey(){
  return STORAGE_KEYS.dailyInputPrefix + dateKey();
}
function flashSaveButton(btn){
  if(!btn) return;
  const old = btn.textContent;
  btn.textContent = "Đã lưu";
  btn.classList.add("saved");
  setTimeout(()=>{
    btn.textContent = old || "Lưu";
    btn.classList.remove("saved");
  }, 900);
}
function saveXoaData(){
  const ok = writeStorage(STORAGE_KEYS.xoa, collectValues(["xoaMn","xoaMt","xoaHn"]));
  if(ok){
    syncRegionRelatedPanel();
    flashSaveButton(document.querySelector(".xoa-panel .save-mini"));
  }
}
function clearXoaData(){
  ["xoaMn","xoaMt","xoaHn"].forEach(id=>setVal(id,""));
  syncRegionRelatedPanel();
  try{
    localStorage.removeItem(STORAGE_KEYS.xoa);
  }catch(e){
    console.error(e);
  }
  runAll();
}
function saveSettingsData(){
  const ok = writeStorage(STORAGE_KEYS.settings, collectValues(SETTINGS_IDS));
  if(ok){
    runAll();
    flashSaveButton(document.querySelector(".settings-panel .save-mini"));
  }
}
function saveResultData(){
  const ok = writeStorage(STORAGE_KEYS.results, collectValues(["kqMn","kqMt","kqHn"]));
  if(ok){
    syncRegionRelatedPanel();
    parseResultsOnly();
    runAll();
    flashSaveButton(document.querySelector(".result-input-panel-visible .save-mini"));
  }
}
function clearResultData(){
  ["kqMn","kqMt","kqHn","parsedResults","soTrung"].forEach(id=>setVal(id,""));
  syncRegionRelatedPanel();
  try{
    localStorage.removeItem(STORAGE_KEYS.results);
  }catch(e){
    console.error(e);
  }
  setVal("thuong","0");
  parseResultsOnly();
  runAll();
}
function saveDailyInputBackup(){
  const text = val("inputData").trim();
  if(!text) return "empty";
  try{
    const old = localStorage.getItem(dailyInputKey()) || "";
    const entries = old.trim() ? old.trim().split(/\n\n---\n\n/) : [];
    const last = entries.length ? entries[entries.length - 1].replace(/^#\d+\n/, "").trim() : "";
    if(last === text){
      setVal("savedInputToday", old);
      return "duplicate";
    }

    const nextIndex = old.trim() ? old.split(/\n\n---\n\n/).length + 1 : 1;
    const entry = `#${nextIndex}\n${text}`;
    const next = old.trim() ? old.trim() + "\n\n---\n\n" + entry : entry;
    localStorage.setItem(dailyInputKey(), next);
    setVal("savedInputToday", next);
    return "saved";
  }catch(e){
    console.error(e);
    return "error";
  }
}
function loadDailyInputBackup(){
  try{
    setVal("savedInputToday", localStorage.getItem(dailyInputKey()) || "");
  }catch(e){
    setVal("savedInputToday", "");
  }
}
function saveDayAndRun(btn){
  if(!val("inputData").trim()){
    clearRun();
    alert("Chưa có dữ liệu để lưu ngày");
    return;
  }
  const saveStatus = saveDailyInputBackup();
  runAll();
  flashActionButton(btn, saveStatus === "duplicate" ? "Đã lưu rồi" : "Đã lưu", "Lưu");
}
function clearDailyInputBackup(){
  try{
    localStorage.removeItem(dailyInputKey());
  }catch(e){
    console.error(e);
  }
  setVal("savedInputToday", "");
}
function loadSavedData(){
  applyValues(readStorage(STORAGE_KEYS.settings));
  applyValues(readStorage(STORAGE_KEYS.xoa));
  applyValues(readStorage(STORAGE_KEYS.results));
  loadDailyInputBackup();
}

window.addEventListener("DOMContentLoaded", ()=>{
  loadAppTitle();
  loadSavedData();
  loadNewWorkData();

  const autoRun = debounce(runAll, 280);
  const regionRelatedAutoSave = debounce(saveRegionRelatedData, 280);
  const newWorkAutoSave = debounce(saveNewWorkData, 280);

  const input = el("inputData");
  if(input){
    input.addEventListener("input", ()=>{
      saveActiveWorkspaceInput();
      autoRun();
    });
    input.addEventListener("paste", ()=>setTimeout(()=>{
      saveActiveWorkspaceInput();
      runAll();
    }, 30));
    input.addEventListener("change", ()=>{
      saveActiveWorkspaceInput();
      runAll();
    });
  }

  ["activeXoaData","activeResultData"].forEach(id=>{
    const x=el(id);
    if(x){
      x.addEventListener("input", regionRelatedAutoSave);
      x.addEventListener("paste", ()=>setTimeout(saveRegionRelatedData, 50));
      x.addEventListener("change", saveRegionRelatedData);
    }
  });

  // Dán kết quả MN/MT/HN cũng tự cập nhật dò/trúng.
  ["kqMn","kqMt","kqHn"].forEach(id=>{
    const x=el(id);
    if(x){
      x.addEventListener("input", ()=>{
        parseResultsOnly();
        syncRegionRelatedPanel();
        autoRun();
      });
      x.addEventListener("paste", ()=>{
        setTimeout(()=>{
          parseResultsOnly();
          syncRegionRelatedPanel();
          runAll();
        },50);
      });
      x.addEventListener("change", ()=>{
        parseResultsOnly();
        syncRegionRelatedPanel();
        runAll();
      });
    }
  });

  // Thay đổi hệ số/cài đặt thì tự tính lại nếu đang có dữ liệu.
  SETTINGS_IDS.forEach(id=>{
    const x=el(id);
    if(x){
      x.addEventListener("input", autoRun);
      x.addEventListener("change", runAll);
    }
  });

  const newWorkInput = el("newWorkData");
  if(newWorkInput){
    newWorkInput.addEventListener("input", ()=>{
      updateNewWorkPreview();
      newWorkAutoSave();
    });
    newWorkInput.addEventListener("paste", ()=>setTimeout(()=>{
      updateNewWorkPreview();
      saveNewWorkData();
    }, 30));
  }

  parseResultsOnly();
  let savedTab = "MN";
  try{
    savedTab = localStorage.getItem(STORAGE_KEYS.activeWorkspace) || "MN";
  }catch(e){
    savedTab = "MN";
  }
  if(!["MN","MT","HN","SETTINGS"].includes(savedTab)) savedTab = "MN";
  if(savedTab === "SETTINGS"){
    try{
      activeWorkspace = localStorage.getItem(STORAGE_KEYS.lastWorkRegion) || "MN";
    }catch(e){
      activeWorkspace = "MN";
    }
    if(!["MN","MT","HN"].includes(activeWorkspace)) activeWorkspace = "MN";
    loadWorkspaceInput(activeWorkspace);
    setActiveTab("SETTINGS");
    if(el("workScreen")) el("workScreen").hidden = true;
    if(el("settingsScreen")) el("settingsScreen").hidden = false;
  }else{
    activeWorkspace = savedTab;
    setActiveTab(savedTab);
    if(el("workScreen")) el("workScreen").hidden = false;
    if(el("settingsScreen")) el("settingsScreen").hidden = true;
    loadWorkspaceInput(savedTab);
  }
  syncRegionRelatedPanel();
  if(val("inputData").trim()) runAll();
});

/* V0.5.65 - DATA ZONE TRACE ONLY
   Xóa nhánh báo tiền trúng khỏi panel Số trúng.
   Panel này chỉ còn: vùng kết quả -> atomic tin ghi -> trúng/không trúng từng con.
*/
const PX_DATA_TRACE_BUILD = "PX-SO v0.5.66 — data-zone trace only, no top hit count — cache v=5643";

function traceJoin(arr){
  return (arr || []).length ? (arr || []).join(".") : "Trống";
}
function rowAtomicNumber(row){
  return row && row.nums && row.nums.length ? String(row.nums[0]) : "";
}
function zoneForAtomic(row, results){
  if(!row || !row.calc) return null;
  const t = row.type;
  const region = row.region || "MN";
  const dais = getDaisFromName(row.block);
  const nums = row.nums || [];
  const num = nums[0] || "";
  const len = String(num).length;

  if(t === "da"){
    if(nums.length < 2) return {row, zone:"đá", values:[], hit:0, note:"thiếu cặp số"};
    const a = nums[0], b = nums[1];
    if((row.daiCount || 1) >= 2 && dais.length >= 2){
      const r1 = resultFor(results, region, dais[0]);
      const r2 = resultFor(results, region, dais[1]);
      const v1 = r1 ? (r1.bao2 || []) : [];
      const v2 = r2 ? (r2.bao2 || []) : [];
      const ab = Math.min(countExact(v1, a), countExact(v2, b));
      const ba = (a === b) ? 0 : Math.min(countExact(v1, b), countExact(v2, a));
      return {row, zone:`đá 2 đài: ${dais[0]}.bao2 + ${dais[1]}.bao2`, values:[`${dais[0]}=${traceJoin(v1)}`, `${dais[1]}=${traceJoin(v2)}`], hit:ab+ba, note:`${a}.${b}`};
    }
    const r = resultFor(results, region, dais[0]);
    const values = r ? (r.bao2 || []) : [];
    const ca = countExact(values, a);
    const cb = countExact(values, b);
    const hit = (a === b) ? Math.floor(ca / 2) : Math.min(ca, cb);
    return {row, zone:`${dais[0] || row.block}.bao2`, values, hit, note:`${a}.${b}`};
  }

  const dai = dais[0] || row.block;
  const r = resultFor(results, region, dai);
  if(!r) return {row, zone:`${dai}.thiếu_kết_quả`, values:[], hit:0, note:num};

  let zone = "";
  let values = [];
  let hit = 0;
  if(t === "b"){
    if(len === 2){ zone = `${dai}.bao2`; values = r.bao2 || []; hit = countExact(values, num); }
    else if(len === 3){ zone = `${dai}.bao3`; values = r.bao3 || []; hit = countExact(values, num); }
    else if(len === 4){ zone = `${dai}.bao4`; values = r.bao4 || []; hit = countExact(values, num); }
  }else if(t === "bdao"){
    if(len === 3){ zone = `${dai}.bao3 đảo`; values = r.bao3 || []; hit = countPerm(values, num); }
    else if(len === 4){ zone = `${dai}.bao4 đảo`; values = r.bao4 || []; hit = countPerm(values, num); }
  }else if(t === "dd"){
    zone = `${dai}.dau2 + ${dai}.duoi2`;
    values = [`dau2=${traceJoin(r.dau2 || [])}`, `duoi2=${traceJoin(r.duoi2 || [])}`];
    hit = countExact(r.dau2 || [], num) + countExact(r.duoi2 || [], num);
  }else if(t === "dau"){
    zone = `${dai}.dau2`;
    values = r.dau2 || [];
    hit = countExact(values, num);
  }else if(t === "duoi"){
    zone = `${dai}.duoi2`;
    values = r.duoi2 || [];
    hit = countExact(values, num);
  }else if(t === "xc"){
    zone = `${dai}.xc = xcdau + xcduoi`;
    values = r.xc3 || [];
    hit = countExact(values, num);
  }else if(t === "xcdau"){
    zone = `${dai}.xcdau`;
    values = r.dau3 || [];
    hit = countExact(values, num);
  }else if(t === "xcduoi"){
    zone = `${dai}.xcduoi`;
    values = r.duoi3 || [];
    hit = countExact(values, num);
  }else if(t === "xcdao"){
    zone = `${dai}.xc đảo = xcdau + xcduoi đảo`;
    values = [`xcdau=${traceJoin(r.dau3 || [])}`, `xcduoi=${traceJoin(r.duoi3 || [])}`];
    hit = countPerm(r.dau3 || [], num) + countPerm(r.duoi3 || [], num);
  }else{
    zone = `${dai}.không_rõ_loại`;
  }
  return {row, zone, values, hit, note:num};
}
function calcWinners(rows, results){
  const items = [];
  const misses = [];
  let hitCount = 0;
  if(!hasAnyResults(results)) return {items, misses, total:0, hitCount:0, traceOnly:true};
  for(const row of rows || []){
    const ev = zoneForAtomic(row, results);
    if(!ev) continue;
    hitCount += Number(ev.hit || 0);
    const item = {block:row.block, line:row.line, row, zone:ev.zone, values:ev.values || [], hit:ev.hit || 0, note:ev.note || ""};
    if((ev.hit || 0) > 0) items.push(item);
    else misses.push(item);
  }
  return {items, misses, total:0, hitCount, traceOnly:true};
}
function buildResultZoneBlock(results){
  const out = [];
  out.push("A. VÙNG KẾT QUẢ WEB ĐÃ TẠO");
  let any = false;
  for(const region of ["MN","MT","HN"]){
    const data = results && results[region];
    if(!data || !Object.keys(data).length) continue;
    any = true;
    out.push("");
    out.push(`[${region}]`);
    for(const [dai,r] of Object.entries(data)){
      out.push(dai);
      out.push(`full=${traceJoin(r.full || [])}`);
      out.push(`bao2=${traceJoin(r.bao2 || [])}`);
      out.push(`dau2=${traceJoin(r.dau2 || [])}`);
      out.push(`duoi2=${traceJoin(r.duoi2 || [])}`);
      out.push(`bao3=${traceJoin(r.bao3 || [])}`);
      out.push(`xcdau=${traceJoin(r.dau3 || [])}`);
      out.push(`xcduoi=${traceJoin(r.duoi3 || [])}`);
      out.push(`xc=${traceJoin(r.xc3 || [])}`);
      out.push(`bao4=${traceJoin(r.bao4 || [])}`);
      out.push("");
    }
  }
  if(!any) out.push("Chưa có vùng kết quả / app chưa đọc được kết quả.");
  return out.join("\n").trim();
}
function buildAtomicInputBlock(rows){
  const out = [];
  out.push("B. ATOMIC TIN GHI WEB ĐÃ TÁCH");
  let count = 0;
  for(const row of rows || []){
    if(!row.calc) continue;
    count++;
    out.push(`${count}. ${row.region || ""} | ${row.block} | ${row.line} | số=${(row.nums || []).join(".")} | loại=${row.type} | n=${fmtN(row.n)} | đài=${row.daiCount || 1}`);
  }
  if(!count) out.push("Trống");
  return out.join("\n").trim();
}
function buildAtomicDecisionSection(title, items){
  const out = [];
  out.push(title);
  if(!items || !items.length){
    out.push("Trống");
    return out.join("\n");
  }
  items.forEach((item, idx)=>{
    const nums = item.row && item.row.nums ? item.row.nums.join(".") : "";
    out.push(`${idx+1}. ${item.row.region || ""} | ${item.block} | ${item.line} | số=${nums} | dò=${item.zone} | hit=${item.hit}`);
    out.push(`   vùng=${traceJoin(item.values || [])}`);
  });
  return out.join("\n").trim();
}
function buildWinReport(pack, results, rows){
  const out = [];
  out.push(PX_DATA_TRACE_BUILD);
  out.push("CHẾ ĐỘ: PHÂN TÍCH DỮ LIỆU, KHÔNG NHÂN TIỀN, KHÔNG GOM");
  out.push(`Tổng atomic trúng: ${((pack && pack.items) || []).length} dòng | Không trúng: ${((pack && pack.misses) || []).length} dòng`);
  out.push("");
  out.push(buildResultZoneBlock(results));
  out.push("");
  out.push(buildAtomicInputBlock(rows));
  out.push("");
  out.push(buildAtomicDecisionSection("C. TRÚNG — TÁCH RIÊNG TỪNG CON", (pack && pack.items) || []));
  out.push("");
  out.push(buildAtomicDecisionSection("D. KHÔNG TRÚNG — TÁCH RIÊNG TỪNG CON", (pack && pack.misses) || []));
  return out.join("\n").trim();
}
function buildWinStepTrace(rows, results, pack){
  return buildWinReport(pack, results, rows);
}
function runAll(){
  try{
    if(!val("inputData").trim()){
      clearRun();
      return;
    }
    const blocks = splitBlocks(val("inputData"));
    const rows = buildIntermediate(blocks);
    renderIntermediate(rows);

    const total = totalMoney(rows);
    setVal("copyFast", buildCopyFast(blocks, total));
    setVal("ghi", money(total));

    const tk = buildTach(blocks);
    setVal("soTach", tk.tach);
    setVal("soKhongTach", tk.khong);
    scrollTextTop("soTach");
    scrollTextTop("soKhongTach");

    const resultObj = parseAllResults(rows);
    const pack = calcWinners(rows, resultObj);

    // Chế độ trace: không dùng ô Trúng tổng để đếm hit nữa, tránh hiểu nhầm 1 con/2 con.
    // Nguồn kiểm đúng là bảng soTrung bên dưới: vùng kết quả + atomic + trúng/không trúng.
    setVal("thuong", "Xem bảng");
    setVal("tong", money(total));
    setVal("soTrung", buildWinReport(pack, resultObj, rows));
    setVal("detail", buildWinStepTrace(rows, resultObj, pack));
    scrollTextTop("soTrung");
  }catch(err){
    console.error(err);
    setVal("ghi", "Lỗi chạy: " + (err && err.message ? err.message : err));
  }
}

/* V0.5.67 - ATOMIC WIN MONEY ENGINE
   Khóa lỗi: 707b1n.xc5n phải tách thành 707b1n + 707xc5n.
   Dò theo vùng atomic, trúng tách riêng từng con, sau đó mới nhân hệ số từng dòng.
*/
const PX_ATOMIC_WIN_BUILD = "PX-SO v0.5.67 — atomic split win money — cache v=5644";

function parseBetLine(line){
  const s = normalizeLine(line);
  if(!s) return null;

  // Dạng đá trực tiếp vẫn đọc thẳng.
  const daOnly = s.match(/^([0-9.]+)(da|dv)([\d,.]+)n$/i);
  if(daOnly){
    return [{nums:parseNums(daOnly[1]), type:daOnly[2].toLowerCase(), n:parseAmount(daOnly[3]), source:s}];
  }

  // Parser atomic có kế thừa số phía trước.
  // Ví dụ: 707b1n.xc5n -> 707b1n + 707xc5n.
  const parts = [];
  let pos = 0;
  let lastNums = null;
  const typeRe = /^(bdao|xcdao|xcdau|xcduoi|duoi|dau|dd|dv|da|b|xc)([\d,.]+)n/i;

  while(pos < s.length){
    if(s[pos] === ".") pos++;
    if(pos >= s.length) break;

    let nums = null;
    const numMatch = s.slice(pos).match(/^(?:\d+keo\d+|\d+(?:\.\d+)*)/i);
    if(numMatch){
      const afterNum = s.slice(pos + numMatch[0].length);
      if(typeRe.test(afterNum)){
        nums = parseNums(numMatch[0]);
        lastNums = nums.slice();
        pos += numMatch[0].length;
      }
    }

    const typeMatch = s.slice(pos).match(typeRe);
    if(!typeMatch){
      return null;
    }

    if(!nums){
      if(!lastNums || !lastNums.length) return null;
      nums = lastNums.slice();
    }

    parts.push({nums, type:typeMatch[1].toLowerCase(), n:parseAmount(typeMatch[2]), source:s});
    pos += typeMatch[0].length;
  }

  return parts.length ? parts : null;
}

function atomicWinAmount(row, hit){
  const coef = winCoefForRow(row);
  const n = Number(row && row.n || 0);
  return {coef, n, amount: hit > 0 ? hit * n * coef : 0};
}

function calcWinners(rows, results){
  const items = [];
  const misses = [];
  let total = 0;
  let hitCount = 0;

  if(!hasAnyResults(results)) return {items, misses, total:0, hitCount:0, traceOnly:false};

  for(const row of rows || []){
    if(!row || !row.calc) continue;
    const ev = zoneForAtomic(row, results);
    if(!ev) continue;

    const hit = Number(ev.hit || 0);
    const calc = atomicWinAmount(row, hit);
    const item = {
      block:row.block,
      line:row.line,
      row,
      zone:ev.zone,
      values:ev.values || [],
      hit,
      coef:calc.coef,
      n:calc.n,
      amount:calc.amount,
      note:ev.note || ""
    };

    if(hit > 0){
      hitCount += hit;
      total += calc.amount;
      items.push(item);
    }else{
      misses.push(item);
    }
  }
  return {items, misses, total, hitCount, traceOnly:false};
}

function buildWinMoneySection(items){
  const out = [];
  out.push("TRÚNG — TÁCH RIÊNG TỪNG CON");
  if(!items || !items.length){
    out.push("Trống");
    return out.join("\n");
  }

  let curBlock = "";
  for(const item of items){
    const block = item.block || (item.row && item.row.block) || "";
    if(block !== curBlock){
      if(curBlock) out.push("");
      out.push(block);
      curBlock = block;
    }
    out.push(`${item.line} = ${item.hit} x ${fmtN(item.n)}n x ${item.coef} = ${money(item.amount)}`);
  }
  return out.join("\n").trim();
}

function buildMissSection(items){
  const out = [];
  out.push("KHÔNG TRÚNG — TÁCH RIÊNG TỪNG CON");
  if(!items || !items.length){
    out.push("Trống");
    return out.join("\n");
  }

  let curBlock = "";
  for(const item of items){
    const block = item.block || (item.row && item.row.block) || "";
    if(block !== curBlock){
      if(curBlock) out.push("");
      out.push(block);
      curBlock = block;
    }
    out.push(`${item.line} | dò=${item.zone || ""} | hit=0`);
  }
  return out.join("\n").trim();
}

function buildAtomicAuditBlock(rows, pack){
  const out = [];
  out.push("KIỂM ATOMIC");
  out.push(buildAtomicInputBlock(rows));
  out.push("");
  out.push(buildAtomicDecisionSection("ĐỐI CHIẾU TRÚNG", (pack && pack.items) || []));
  out.push("");
  out.push(buildAtomicDecisionSection("ĐỐI CHIẾU KHÔNG TRÚNG", (pack && pack.misses) || []));
  return out.join("\n").trim();
}

function buildWinReport(pack, results, rows){
  const out = [];
  out.push(PX_ATOMIC_WIN_BUILD);
  out.push("CHẾ ĐỘ: ATOMIC → DÒ VÙNG → TÍNH TIỀN TỪNG CON, KHÔNG GOM BAO/XC");
  out.push(`Tổng atomic trúng: ${((pack && pack.items) || []).length} dòng | Tổng hit: ${(pack && pack.hitCount) || 0} | Tổng thưởng: ${money((pack && pack.total) || 0)}`);
  out.push("");
  out.push(buildWinMoneySection((pack && pack.items) || []));
  out.push("");
  out.push(buildMissSection((pack && pack.misses) || []));
  out.push("");
  out.push(buildResultZoneBlock(results));
  out.push("");
  out.push(buildAtomicAuditBlock(rows, pack));
  return out.join("\n").trim();
}

function buildWinStepTrace(rows, results, pack){
  return buildWinReport(pack, results, rows);
}

function runAll(){
  try{
    if(!val("inputData").trim()){
      clearRun();
      return;
    }
    const blocks = splitBlocks(val("inputData"));
    const rows = buildIntermediate(blocks);
    renderIntermediate(rows);

    const total = totalMoney(rows);
    setVal("copyFast", buildCopyFast(blocks, total));
    setVal("ghi", money(total));

    const tk = buildTach(blocks);
    setVal("soTach", tk.tach);
    setVal("soKhongTach", tk.khong);
    scrollTextTop("soTach");
    scrollTextTop("soKhongTach");

    const resultObj = parseAllResults(rows);
    const pack = calcWinners(rows, resultObj);

    setVal("thuong", money(pack.total || 0));
    setVal("tong", money(total - (pack.total || 0)));
    setVal("soTrung", buildWinReport(pack, resultObj, rows));
    setVal("detail", buildWinStepTrace(rows, resultObj, pack));
    scrollTextTop("soTrung");
  }catch(err){
    console.error(err);
    setVal("ghi", "Lỗi chạy: " + (err && err.message ? err.message : err));
  }
}


/* V0.5.68 - ATOMIC ZONE OUTPUT ONLY
   Khóa lại đúng yêu cầu hiện tại: chưa gắn công thức tiền ở vùng dò kết quả.
   Luồng: input -> atomic -> vùng kết quả -> output trúng/không trúng từng con.
   707b1n.xc5n phải ra output trúng 2 dòng: 707b1n và 707xc5n.
*/
const PX_ATOMIC_OUTPUT_BUILD = "PX-SO v0.5.68 — atomic zone output only — cache v=5645";

function calcWinners(rows, results){
  const items = [];
  const misses = [];
  let hitCount = 0;
  if(!hasAnyResults(results)) return {items, misses, total:0, hitCount:0, traceOnly:true};

  for(const row of rows || []){
    if(!row || !row.calc) continue;
    const ev = zoneForAtomic(row, results);
    if(!ev) continue;
    const hit = Number(ev.hit || 0);
    const item = {
      block: row.block,
      line: row.line,
      row,
      zone: ev.zone,
      values: ev.values || [],
      hit,
      note: ev.note || ""
    };
    if(hit > 0){
      hitCount += hit;
      items.push(item);
    }else{
      misses.push(item);
    }
  }
  return {items, misses, total:0, hitCount, traceOnly:true};
}

function displayBlockNameForOutput(block){
  const b = String(block || "").trim();
  return b === "HN" ? "Hn" : b;
}

function buildAtomicPlainOutput(title, items){
  const out = [];
  out.push(title);
  if(!items || !items.length){
    out.push("Trống");
    return out.join("\n").trim();
  }
  let cur = "";
  for(const item of items){
    const block = item.block || (item.row && item.row.block) || "";
    if(block !== cur){
      if(cur) out.push("");
      out.push(displayBlockNameForOutput(block));
      cur = block;
    }
    out.push(item.line);
  }
  return out.join("\n").trim();
}

function buildAtomicAuditShort(rows, pack){
  const out = [];
  out.push("KIỂM ATOMIC");
  out.push(buildAtomicInputBlock(rows));
  out.push("");
  out.push(buildAtomicDecisionSection("ĐỐI CHIẾU TRÚNG", (pack && pack.items) || []));
  out.push("");
  out.push(buildAtomicDecisionSection("ĐỐI CHIẾU KHÔNG TRÚNG", (pack && pack.misses) || []));
  return out.join("\n").trim();
}

function buildWinReport(pack, results, rows){
  const out = [];
  out.push(PX_ATOMIC_OUTPUT_BUILD);
  out.push("CHẾ ĐỘ: KIỂM ATOMIC, KHÔNG TÍNH TIỀN, KHÔNG GOM");
  out.push(`Tổng atomic trúng: ${((pack && pack.items) || []).length} dòng | Không trúng: ${((pack && pack.misses) || []).length} dòng`);
  out.push("");
  out.push(buildAtomicPlainOutput("OUTPUT TRÚNG", (pack && pack.items) || []));
  out.push("");
  out.push(buildAtomicPlainOutput("OUTPUT KHÔNG TRÚNG", (pack && pack.misses) || []));
  out.push("");
  out.push(buildResultZoneBlock(results));
  out.push("");
  out.push(buildAtomicAuditShort(rows, pack));
  return out.join("\n").trim();
}

function buildWinStepTrace(rows, results, pack){
  return buildWinReport(pack, results, rows);
}

function runAll(){
  try{
    if(!val("inputData").trim()){
      clearRun();
      return;
    }
    const blocks = splitBlocks(val("inputData"));
    const rows = buildIntermediate(blocks);
    renderIntermediate(rows);

    const total = totalMoney(rows);
    setVal("copyFast", buildCopyFast(blocks, total));
    setVal("ghi", money(total));

    const tk = buildTach(blocks);
    setVal("soTach", tk.tach);
    setVal("soKhongTach", tk.khong);
    scrollTextTop("soTach");
    scrollTextTop("soKhongTach");

    const resultObj = parseAllResults(rows);
    const pack = calcWinners(rows, resultObj);

    // Không hiển thị tiền thưởng ở bước kiểm vùng dò. Nguồn kiểm là OUTPUT TRÚNG trong soTrung.
    setVal("thuong", "Xem output");
    setVal("tong", money(total));
    setVal("soTrung", buildWinReport(pack, resultObj, rows));
    setVal("detail", buildWinStepTrace(rows, resultObj, pack));
    scrollTextTop("soTrung");
  }catch(err){
    console.error(err);
    setVal("ghi", "Lỗi chạy: " + (err && err.message ? err.message : err));
  }
}

/* V0.5.69 - FINAL OUTPUT DISPLAY ONLY
   Panel Số trúng chỉ hiển thị kết quả trúng/không trúng theo atomic.
   Không in vùng kết quả, không in bảng audit, không tính tiền tại panel này.
*/
const PX_ATOMIC_DISPLAY_BUILD = "PX-SO v0.5.70 — HN loose result XC order fix — cache v=5647";

function buildAtomicOutputOnly(title, items){
  const out = [title];
  if(!items || !items.length){
    out.push("Trống");
    return out.join("\n").trim();
  }
  let curBlock = "";
  for(const item of items){
    const block = item.block || (item.row && item.row.block) || "";
    if(block !== curBlock){
      if(curBlock) out.push("");
      out.push(displayBlockNameForOutput(block));
      curBlock = block;
    }
    out.push(item.line);
  }
  return out.join("\n").trim();
}

function buildAtomicDebugOnly(rows, results, pack){
  const out = [];
  out.push(PX_ATOMIC_DISPLAY_BUILD);
  out.push("");
  out.push(buildAtomicInputBlock(rows));
  out.push("");
  out.push(buildAtomicDecisionSection("ĐỐI CHIẾU TRÚNG", (pack && pack.items) || []));
  out.push("");
  out.push(buildAtomicDecisionSection("ĐỐI CHIẾU KHÔNG TRÚNG", (pack && pack.misses) || []));
  out.push("");
  out.push(buildResultZoneBlock(results));
  return out.join("\n").trim();
}

function buildWinReport(pack){
  return [
    buildAtomicOutputOnly("TRÚNG", (pack && pack.items) || []),
    "",
    buildAtomicOutputOnly("KHÔNG TRÚNG", (pack && pack.misses) || [])
  ].join("\n").trim();
}

function buildWinStepTrace(rows, results, pack){
  return buildAtomicDebugOnly(rows, results, pack);
}

function runAll(){
  try{
    if(!val("inputData").trim()){
      clearRun();
      return;
    }
    const blocks = splitBlocks(val("inputData"));
    const rows = buildIntermediate(blocks);
    renderIntermediate(rows);

    const total = totalMoney(rows);
    setVal("copyFast", buildCopyFast(blocks, total));
    setVal("ghi", money(total));

    const tk = buildTach(blocks);
    setVal("soTach", tk.tach);
    setVal("soKhongTach", tk.khong);
    scrollTextTop("soTach");
    scrollTextTop("soKhongTach");

    const resultObj = parseAllResults(rows);
    const pack = calcWinners(rows, resultObj);

    setVal("thuong", "Xem output");
    setVal("tong", money(total));
    setVal("soTrung", buildWinReport(pack));
    setVal("detail", buildWinStepTrace(rows, resultObj, pack));
    scrollTextTop("soTrung");
  }catch(err){
    console.error(err);
    setVal("ghi", "Lỗi chạy: " + (err && err.message ? err.message : err));
  }
}



/* V0.5.72 - ATOMIC WIN MONEY DISPLAY NO HEADER
   Nguồn đúng đã khóa: vùng TRÚNG atomic.
   Panel Số trúng chỉ hiện các dòng trúng theo block, không hiện tiêu đề TRÚNG, không hiện KHÔNG TRÚNG.
   Sau khi atomic trúng, đếm hit của số trong vùng dò rồi nhân n và hệ số tương ứng.
   Bao và XC giữ tách riêng từng dòng, không gom chung.
*/
const PX_ATOMIC_WIN_DISPLAY_BUILD = "PX-SO v0.5.72 — atomic win money display no header — cache v=5649";

function atomicMoneyForWinItem(row, hit){
  const coef = winCoefForRow(row);
  const n = Number(row && row.n || 0);
  const amount = hit > 0 ? hit * n * coef : 0;
  return {coef, n, amount};
}

function calcWinners(rows, results){
  const items = [];
  const misses = [];
  let total = 0;
  let hitCount = 0;

  if(!hasAnyResults(results)) return {items, misses, total:0, hitCount:0};

  for(const row of rows || []){
    if(!row || !row.calc) continue;
    const ev = zoneForAtomic(row, results);
    if(!ev) continue;

    const hit = Number(ev.hit || 0);
    const calc = atomicMoneyForWinItem(row, hit);
    const item = {
      block: row.block,
      line: row.line,
      row,
      zone: ev.zone,
      values: ev.values || [],
      hit,
      coef: calc.coef,
      n: calc.n,
      amount: calc.amount,
      note: ev.note || ""
    };

    if(hit > 0 && calc.amount > 0){
      hitCount += hit;
      total += calc.amount;
      items.push(item);
    }else{
      misses.push(item);
    }
  }

  return {items, misses, total, hitCount};
}

function buildWinMoneyOutputOnly(pack){
  const items = (pack && pack.items) || [];
  const out = [];
  if(!items.length){
    out.push("Trống");
    return out.join("\n").trim();
  }

  let curBlock = "";
  for(const item of items){
    const block = item.block || (item.row && item.row.block) || "";
    if(block !== curBlock){
      if(curBlock) out.push("");
      out.push(displayBlockNameForOutput(block));
      curBlock = block;
    }
    out.push(`${item.line} = ${money(item.amount)}`);
  }

  out.push("");
  out.push(`Tổng trúng=${money((pack && pack.total) || 0)}`);
  return out.join("\n").trim();
}

function buildWinMoneyDebug(rows, results, pack){
  const out = [];
  out.push(PX_ATOMIC_WIN_DISPLAY_BUILD);
  out.push("");
  out.push("A. OUTPUT TRÚNG ĐANG HIỂN THỊ");
  out.push(buildWinMoneyOutputOnly(pack));
  out.push("");
  out.push("B. ATOMIC TIN GHI");
  out.push(buildAtomicInputBlock(rows));
  out.push("");
  out.push("C. ĐỐI CHIẾU TRÚNG + TIỀN");
  const items = (pack && pack.items) || [];
  if(!items.length){
    out.push("Trống");
  }else{
    items.forEach((item, idx)=>{
      const nums = item.row && item.row.nums ? item.row.nums.join(".") : "";
      out.push(`${idx+1}. ${item.row.region || ""} | ${item.block} | ${item.line} | số=${nums} | dò=${item.zone} | hit=${item.hit} | n=${fmtN(item.n)} | hệ số=${item.coef} | tiền=${money(item.amount)}`);
      out.push(`   vùng=${traceJoin(item.values || [])}`);
    });
  }
  out.push("");
  out.push(buildResultZoneBlock(results));
  return out.join("\n").trim();
}

function buildWinReport(pack){
  return buildWinMoneyOutputOnly(pack);
}

function buildWinStepTrace(rows, results, pack){
  return buildWinMoneyDebug(rows, results, pack);
}

function runAll(){
  try{
    if(!val("inputData").trim()){
      clearRun();
      return;
    }
    const blocks = splitBlocks(val("inputData"));
    const rows = buildIntermediate(blocks);
    renderIntermediate(rows);

    const total = totalMoney(rows);
    setVal("copyFast", buildCopyFast(blocks, total));
    setVal("ghi", money(total));

    const tk = buildTach(blocks);
    setVal("soTach", tk.tach);
    setVal("soKhongTach", tk.khong);
    scrollTextTop("soTach");
    scrollTextTop("soKhongTach");

    const resultObj = parseAllResults(rows);
    const pack = calcWinners(rows, resultObj);

    setVal("thuong", money(pack.total || 0));
    setVal("tong", money(total - (pack.total || 0)));
    setVal("soTrung", buildWinReport(pack));
    setVal("detail", buildWinStepTrace(rows, resultObj, pack));
    scrollTextTop("soTrung");
  }catch(err){
    console.error(err);
    setVal("ghi", "Lỗi chạy: " + (err && err.message ? err.message : err));
  }
}


/* V0.5.73 - MN/MT DA/DV JOINT ZONE MIN HIT
   Khóa rule mới:
   - Với đá/DV MN, MT trên block nhiều đài: tạo vùng bao2 CHUNG của toàn bộ đài trong block.
   - Hit cặp = min(countA trong vùng chung, countB trong vùng chung).
   - Không dò chéo từng hướng đài 1/đài 2 nữa.
   - Áp dụng cho MN và MT. HN giữ rule cũ theo từng vùng HN.
*/
const PX_DA_JOINT_ZONE_BUILD = "PX-SO v0.5.75 — preserve full multi-station name in print output — cache v=5652";

function jointBao2ForDais(results, region, dais){
  const values = [];
  const labels = [];
  for(const dai of (dais || [])){
    const r = resultFor(results, region, dai);
    const arr = r ? (r.bao2 || []) : [];
    values.push(...arr);
    labels.push(`${dai}=${traceJoin(arr)}`);
  }
  return {values, labels};
}

function isMnMtJointDaRow(row, region, dais){
  return row && row.type === "da" && region !== "HN" && (row.daiCount || 1) >= 2 && (dais || []).length >= 2;
}

function calcDaHitByJointZone(row, results, region, dais){
  const nums = row.nums || [];
  if(nums.length < 2){
    return {hit:0, zone:"đá", values:[], note:"thiếu cặp số"};
  }
  const a = nums[0], b = nums[1];
  const joint = jointBao2ForDais(results, region, dais);
  const ca = countExact(joint.values, a);
  const cb = countExact(joint.values, b);
  const hit = (a === b) ? Math.floor(ca / 2) : Math.min(ca, cb);
  return {
    hit,
    zone:`${(dais || []).join("")}.bao2 chung MN/MT`,
    values:joint.labels,
    note:`${a}.${b} | ${a}=${ca}, ${b}=${cb}, min=${hit}`
  };
}

function calcDaHitOldDirection(row, results, region, dais){
  const nums = row.nums || [];
  if(nums.length < 2){
    return {hit:0, zone:"đá", values:[], note:"thiếu cặp số"};
  }
  const a = nums[0], b = nums[1];
  if((row.daiCount || 1) >= 2 && dais.length >= 2){
    const r1 = resultFor(results, region, dais[0]);
    const r2 = resultFor(results, region, dais[1]);
    const v1 = r1 ? (r1.bao2 || []) : [];
    const v2 = r2 ? (r2.bao2 || []) : [];
    const ab = Math.min(countExact(v1, a), countExact(v2, b));
    const ba = (a === b) ? 0 : Math.min(countExact(v1, b), countExact(v2, a));
    return {hit:ab + ba, zone:`đá 2 đài: ${dais[0]}.bao2 + ${dais[1]}.bao2`, values:[`${dais[0]}=${traceJoin(v1)}`, `${dais[1]}=${traceJoin(v2)}`], note:`${a}.${b}`};
  }
  const r = resultFor(results, region, dais[0]);
  const values = r ? (r.bao2 || []) : [];
  const ca = countExact(values, a);
  const cb = countExact(values, b);
  const hit = (a === b) ? Math.floor(ca / 2) : Math.min(ca, cb);
  return {hit, zone:`${dais[0] || row.block}.bao2`, values, note:`${a}.${b}`};
}

function zoneForAtomic(row, results){
  if(!row || !row.calc) return null;
  const t = row.type;
  const region = row.region || "MN";
  const dais = getDaisFromName(row.block);
  const nums = row.nums || [];
  const num = nums[0] || "";
  const len = String(num).length;

  if(t === "da"){
    const ev = isMnMtJointDaRow(row, region, dais)
      ? calcDaHitByJointZone(row, results, region, dais)
      : calcDaHitOldDirection(row, results, region, dais);
    return {row, zone:ev.zone, values:ev.values || [], hit:ev.hit || 0, note:ev.note || ""};
  }

  const dai = dais[0] || row.block;
  const r = resultFor(results, region, dai);
  if(!r) return {row, zone:`${dai}.thiếu_kết_quả`, values:[], hit:0, note:num};

  let zone = "";
  let values = [];
  let hit = 0;
  if(t === "b"){
    if(len === 2){ zone = `${dai}.bao2`; values = r.bao2 || []; hit = countExact(values, num); }
    else if(len === 3){ zone = `${dai}.bao3`; values = r.bao3 || []; hit = countExact(values, num); }
    else if(len === 4){ zone = `${dai}.bao4`; values = r.bao4 || []; hit = countExact(values, num); }
  }else if(t === "bdao"){
    if(len === 3){ zone = `${dai}.bao3 đảo`; values = r.bao3 || []; hit = countPerm(values, num); }
    else if(len === 4){ zone = `${dai}.bao4 đảo`; values = r.bao4 || []; hit = countPerm(values, num); }
  }else if(t === "dd"){
    zone = `${dai}.dau2 + ${dai}.duoi2`;
    values = [`dau2=${traceJoin(r.dau2 || [])}`, `duoi2=${traceJoin(r.duoi2 || [])}`];
    hit = countExact(r.dau2 || [], num) + countExact(r.duoi2 || [], num);
  }else if(t === "dau"){
    zone = `${dai}.dau2`;
    values = r.dau2 || [];
    hit = countExact(values, num);
  }else if(t === "duoi"){
    zone = `${dai}.duoi2`;
    values = r.duoi2 || [];
    hit = countExact(values, num);
  }else if(t === "xc"){
    zone = `${dai}.xc = xcdau + xcduoi`;
    values = r.xc3 || [];
    hit = countExact(values, num);
  }else if(t === "xcdau"){
    zone = `${dai}.xcdau`;
    values = r.dau3 || [];
    hit = countExact(values, num);
  }else if(t === "xcduoi"){
    zone = `${dai}.xcduoi`;
    values = r.duoi3 || [];
    hit = countExact(values, num);
  }else if(t === "xcdao"){
    zone = `${dai}.xc đảo = xcdau + xcduoi đảo`;
    values = [`xcdau=${traceJoin(r.dau3 || [])}`, `xcduoi=${traceJoin(r.duoi3 || [])}`];
    hit = countPerm(r.dau3 || [], num) + countPerm(r.duoi3 || [], num);
  }else{
    zone = `${dai}.không_rõ_loại`;
  }
  return {row, zone, values, hit, note:num};
}

function calcWinRow(row, results){
  if(!row || !row.calc || !hasAnyResults(results)) return null;
  const ev = zoneForAtomic(row, results);
  if(!ev) return null;
  const coef = winCoefForRow(row);
  const n = Number(row.n || 0);
  const hit = Number(ev.hit || 0);
  return {hit, coef, amount: hit > 0 ? hit * n * coef : 0, zone:ev.zone, values:ev.values || []};
}

function buildWinMoneyDebug(rows, results, pack){
  const out = [];
  out.push(PX_DA_JOINT_ZONE_BUILD);
  out.push("");
  out.push("A. OUTPUT TRÚNG ĐANG HIỂN THỊ");
  out.push(buildWinMoneyOutputOnly(pack));
  out.push("");
  out.push("B. ATOMIC TIN GHI");
  out.push(buildAtomicInputBlock(rows));
  out.push("");
  out.push("C. ĐỐI CHIẾU TRÚNG + TIỀN");
  const items = (pack && pack.items) || [];
  if(!items.length){
    out.push("Trống");
  }else{
    items.forEach((item, idx)=>{
      const nums = item.row && item.row.nums ? item.row.nums.join(".") : "";
      out.push(`${idx+1}. ${item.row.region || ""} | ${item.block} | ${item.line} | số=${nums} | dò=${item.zone} | hit=${item.hit} | n=${fmtN(item.n)} | hệ số=${item.coef} | tiền=${money(item.amount)}`);
      if(item.note) out.push(`   note=${item.note}`);
      out.push(`   vùng=${traceJoin(item.values || [])}`);
    });
  }
  out.push("");
  out.push(buildResultZoneBlock(results));
  return out.join("\n").trim();
}


/* V0.5.73b - GENERIC 2DMN/2DMT RESULT HINT
   Khi input dùng 2dmn/3dmn/2dmt/3dmt và vùng kết quả đã dán có tên đài,
   ưu tiên suy ra ngày/đài theo vùng kết quả đó trước khi rơi về ngày hiện tại.
*/
function collectResultHintDaisForRegion(region){
  const ids = regionRelatedIds(region);
  const texts = [];
  const saved = val(ids.result || "");
  if(saved && saved.trim()) texts.push(saved);
  const active = val("activeResultData");
  if(active && active.trim() && activeWorkspace === region) texts.push(active);
  const seen = new Set();
  const out = [];
  for(const text of texts){
    const lines = String(text || "").split(/\n+/).map(x=>x.trim()).filter(Boolean);
    for(const line of lines){
      const dai = findDaiInLine(line);
      if(dai && !seen.has(dai)){
        seen.add(dai);
        out.push(dai);
      }
    }
  }
  return out;
}

function genericHintDaisForHeader(raw, lastExplicit){
  const l = normalizeLine(raw).toLowerCase();
  if(lastExplicit && lastExplicit.length) return lastExplicit;
  if(/^[234]dmn$/.test(l)) return collectResultHintDaisForRegion("MN");
  if(/^[23]dmt$/.test(l)) return collectResultHintDaisForRegion("MT");
  return lastExplicit || [];
}

function splitBlocks(text){
  const lines = (text||"").split(/\n+/).map(x=>x.trim()).filter(Boolean);
  const blocks=[]; let cur=null; let lastExplicit=[];
  for(const raw of lines){
    if(isHeader(raw)){
      const hints = genericHintDaisForHeader(raw, lastExplicit);
      cur = resolveHeader(raw, hints);
      blocks.push(cur);
      if(!cur.generic) lastExplicit = cur.dais;
    }else{
      if(!cur){
        cur = {raw:"Không rõ đài", name:"Không rõ đài", dais:["Không rõ đài"], region:"MN", mainDais:["Không rõ đài"], generic:false, lines:[]};
        blocks.push(cur);
      }
      cur.lines.push(normalizeLine(raw));
    }
  }
  return blocks;
}


/* V0.5.75 - PRESERVE FULL MULTI-STATION NAME IN PRINT OUTPUT
   Lỗi đã khóa:
   - Header explicit ghép nhiều đài như LanBphuoc không được rơi mất đài khi tạo copyFast/In.
   - Tên in phải lấy đủ danh sách đài từ header gốc, rồi sắp theo thứ tự lịch chuẩn.
   - Giữ nguyên fix v0.5.74: tên block sau atomic cũng theo thứ tự lịch chuẩn.
*/
const PX_PRINT_MULTI_DAI_BUILD = "PX-SO v0.5.75 — preserve full multi-station name in print output — cache v=5652";

function scanCanonicalDaisLeftToRight(name){
  const compact = cleanName(name).replace(/\s+/g, "");
  if(!compact) return [];
  const tokens = KNOWN_DAI
    .filter(dai => dai !== "HN")
    .slice()
    .sort((a,b)=>b.length - a.length);
  const out = [];
  let pos = 0;
  while(pos < compact.length){
    let matched = "";
    for(const dai of tokens){
      const key = dai.toLowerCase();
      if(compact.startsWith(key, pos)){
        matched = dai;
        break;
      }
    }
    if(!matched) return [];
    out.push(matched);
    pos += matched.length;
  }
  return orderDaisBySchedule(Array.from(new Set(out)));
}

function getDaisFromName(name){
  if(!name) return [];
  const raw = String(name).trim();
  const lower = raw.toLowerCase();
  if(lower === "hn" || lower === "mb") return ["HN"];

  const mapped = mapDaiName(raw);
  if(mapped) return [mapped];

  const exact = scanCanonicalDaisLeftToRight(raw);
  if(exact.length) return exact;

  const found = [];
  for(const d of KNOWN_DAI){
    if(d === "HN") continue;
    const idx = lower.indexOf(d.toLowerCase());
    if(idx >= 0) found.push({d, idx});
  }
  found.sort((a,b)=>{
    if(a.idx !== b.idx) return a.idx - b.idx;
    return b.d.length - a.d.length;
  });
  return found.length
    ? orderDaisBySchedule(Array.from(new Set(found.map(item => item.d))))
    : [raw];
}

function canonicalPrintBlockName(block){
  if(!block) return "";
  const rawDais = scanCanonicalDaisLeftToRight(block.raw || "");
  const dais = rawDais.length
    ? rawDais
    : orderDaisBySchedule((block.dais || getDaisFromName(block.name || "")).filter(Boolean));
  return dais.length ? dais.join("") : (block.name || block.raw || "");
}

function buildCopyFast(blocks, total){
  const out=[todayLabel() + " " + roundedMoney(total), ""];
  for(const block of (blocks || [])){
    out.push(canonicalPrintBlockName(block));
    for(const rawLine of groupDuplicateSuffixLines(block.lines || [])){
      out.push(...splitCopyLineOriginal(rawLine, 20));
    }
    out.push("");
  }
  return out.join("\n").trim();
}

/* V0.5.76 - GENERIC HEADER USES CURRENT-DAY SCHEDULE ONLY
   Lỗi đã khóa:
   - 2dmn/3dmn/4dmn và 2dmt/3dmt không được kế thừa đài explicit đứng trước.
   - Không dùng dữ liệu kết quả cũ để suy ra ngày cho header generic.
   - Mapping generic luôn lấy đúng lịch của ngày hiện tại trên thiết bị.
   Ví dụ thứ Bảy: 2dmn = TphoLan, dù block trước là Tpho.
*/
const PX_GENERIC_TODAY_BUILD = "PX-SO v0.5.76 — generic mapping by current-day schedule only — cache v=5653";

function resolveHeader(raw, hintDais=[]){
  const l = normalizeLine(raw).toLowerCase();
  let dais;
  const today = dayIndex();

  if(l === "hn" || l === "mb") dais = ["HN"];
  else if(l === "2dmn") dais = (MN_MAP[today] || []).slice(0,2);
  else if(l === "3dmn") dais = (MN_MAP[today] || []).slice(0,3);
  else if(l === "4dmn") dais = (MN_MAP[today] || []).slice(0,4);
  else if(l === "2dmt") dais = (MT_MAP[today] || []).slice(0,2);
  else if(l === "3dmt") dais = (MT_MAP[today] || []).slice(0,3);
  else dais = getDaisFromName(raw.trim());

  const generic = /^(2dmn|3dmn|4dmn|2dmt|3dmt)$/i.test(l);
  return {
    raw: raw.trim(),
    name: dais.join(""),
    dais,
    region: detectRegionByDais(dais),
    mainDais: dais.slice(0,2),
    generic,
    lines: []
  };
}
