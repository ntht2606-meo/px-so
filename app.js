// Xử lý dữ liệu chuỗi v0.5.98 — dữ liệu trong ngày độc lập theo Vùng A / B / C
// Đầu vào -> bảng trung gian -> quy đổi theo cấu hình
// Xuất: chuẩn tên nguồn, nhóm cùng cấu trúc, xuống dòng tối đa 20 ký tự

const REGION_A_SCHEDULE = {
  1:["Tpho","Dthap","Cmau"],
  2:["Btre","Vtau","Blieu"],
  3:["Dnai","Ctho","Strang"],
  4:["Tninh","Agiang","Bthuan"],
  5:["Vlong","Bduong","Tvinh"],
  6:["Tpho","Lan","Bphuoc","Hgiang"],
  0:["Tgiang","Kgiang","Dlat"]
};
const REGION_B_SCHEDULE = {
  1:["Pyen","Hue"],
  2:["Dlac","Qnam"],
  3:["Dnang","Khoa"],
  4:["Bdinh","Qtri","Qbinh"],
  5:["Glai","Nthuan"],
  6:["Dnang","Qngai","Dnong"],
  0:["Ktum","Khoa","Hue"]
};

const KNOWN_SOURCE_CODES = [
  "Tninh","Agiang","Bthuan","Dnai","Ctho","Strang","Tpho","Dthap","Cmau",
  "Btre","Vtau","Blieu","Vlong","Bduong","Tvinh","Lan","Bphuoc","Hgiang",
  "Tgiang","Kgiang","Dlat","Pyen","Hue","Dlac","Qnam","Dnang","Khoa",
  "Bdinh","Qtri","Qbinh","Glai","Nthuan","Qngai","Dnong","Ktum","HN"
];

const SOURCE_ALIAS_MAP = {
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

// Các mã ngắn dưới đây chỉ được giữ để đọc dữ liệu cũ; logic nội bộ và giao diện dùng thuật ngữ trung tính.
const LEGACY_TYPE_TOKEN_RE = "(bdao|xcdao|xcdau|xcduoi|duoi|dau|dd|dv|da|b|xc)";
const STORAGE_KEYS = {
  settings: "sequence.v1.saved.settings",
  exclusions: "sequence.v1.saved.exclusions",
  references: "sequence.v1.saved.references",
  dailyInputPrefix: "sequence.v1.dailyInput.",
  appTitle: "sequence.v1.appTitle",
  newWorkData: "sequence.v1.newWorkData",
  activeWorkspace: "sequence.v1.activeWorkspace",
  lastWorkRegion: "sequence.v1.lastWorkRegion",
  workspacePrefix: "sequence.v1.workspace."
};
// Chỉ dùng để đọc dữ liệu đã lưu bởi bản cũ; mọi lần ghi mới dùng khóa trung tính ở trên.
const LEGACY_STORAGE_KEYS = {
  settings: "pxso.v0.saved.settings",
  exclusions: "pxso.v0.saved.xoa",
  references: "pxso.v0.saved.results",
  dailyInputPrefix: "pxso.v0.dailyInput.",
  appTitle: "pxso.v0.5.58.appTitle",
  newWorkData: "pxso.v0.5.45.newWorkData",
  activeWorkspace: "pxso.v0.5.40.activeWorkspace",
  lastWorkRegion: "pxso.v0.5.40.lastWorkRegion",
  workspacePrefix: "pxso.v0.5.40.workspace."
};
const WEIGHT_SETTING_IDS = ["scaleFactor","weightPair2Sources","weightPair1Source","weightPairRegionC","weightLength2","weightLength3","weightLength4","limitLength2","limitPair"];
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
    setVal("inputData", readTextWithLegacy(workspaceKey(region), LEGACY_STORAGE_KEYS.workspacePrefix + region));
  }catch(e){
    setVal("inputData", "");
  }
}
function regionUiName(region=activeWorkspace){
  if(region === "MT") return "Vùng B";
  if(region === "HN") return "Vùng C";
  return "Vùng A";
}
function regionShortName(region=activeWorkspace){
  if(region === "MT") return "B";
  if(region === "HN") return "C";
  return "A";
}
function regionDisplayCode(region){
  return regionShortName(region);
}
function regionRelatedIds(region=activeWorkspace){
  if(region === "MT") return {exclusion:"excludeB", reference:"referenceB"};
  if(region === "HN") return {exclusion:"excludeC", reference:"referenceC"};
  return {exclusion:"excludeA", reference:"referenceA"};
}
function syncRegionRelatedPanel(){
  if(!["MN","MT","HN"].includes(activeWorkspace)) return;
  const ids = regionRelatedIds(activeWorkspace);
  const shortName = regionShortName(activeWorkspace);
  const uiName = regionUiName(activeWorkspace);
  const title = el("regionDataTitle");
  const exclusionLabel = el("activeExclusionLabel");
  const referenceLabel = el("activeReferenceLabel");

  if(title) title.textContent = "Dữ liệu liên quan " + uiName;
  if(exclusionLabel) exclusionLabel.textContent = "Loại trừ " + shortName;
  if(referenceLabel) referenceLabel.textContent = "Tham chiếu " + shortName;
  const dailyShortcut = el("dailyRegionShortcutBtn");
  if(dailyShortcut) dailyShortcut.textContent = "Ngày " + shortName;
  setVal("activeExclusionData", val(ids.exclusion));
  setVal("activeReferenceData", val(ids.reference));
}
function toggleRegionDataBox(kind){
  openRegionDataPanel(kind);
}
function openRegionDataPanel(kind){
  syncRegionRelatedPanel();
  closeActionPanels();
  const panel = el(kind === "reference" ? "panel-region-reference" : "panel-region-exclusion");
  if(panel) panel.hidden = false;
}
function saveRegionRelatedData(btn){
  if(!["MN","MT","HN"].includes(activeWorkspace)) return;
  const ids = regionRelatedIds(activeWorkspace);
  setVal(ids.exclusion, val("activeExclusionData"));
  setVal(ids.reference, val("activeReferenceData"));
  writeStorage(STORAGE_KEYS.exclusions, collectValues(["excludeA","excludeB","excludeC"]));
  writeStorage(STORAGE_KEYS.references, collectValues(["referenceA","referenceB","referenceC"]));
  parseReferencesOnly();
  runAll();
  if(btn) flashSaveButton(btn);
}
function clearRegionRelatedData(kind){
  if(!["MN","MT","HN"].includes(activeWorkspace)) return;
  const ids = regionRelatedIds(activeWorkspace);

  if(kind === "reference"){
    setVal("activeReferenceData", "");
    setVal(ids.reference, "");
    writeStorage(STORAGE_KEYS.references, collectValues(["referenceA","referenceB","referenceC"]));
    parseReferencesOnly();
  }else{
    setVal("activeExclusionData", "");
    setVal(ids.exclusion, "");
    writeStorage(STORAGE_KEYS.exclusions, collectValues(["excludeA","excludeB","excludeC"]));
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
    const title = readTextWithLegacy(STORAGE_KEYS.appTitle, LEGACY_STORAGE_KEYS.appTitle);
    if(title) setVal("appTitleInput", title);
  }catch(e){
    console.error(e);
  }
}
function showMainWorkspace(name){
  const isNew = name === "newwork";
  const sequenceWorkspace = el("main-sequence");
  const newwork = el("main-newwork");
  if(sequenceWorkspace) sequenceWorkspace.hidden = isNew;
  if(newwork) newwork.hidden = !isNew;
  document.querySelectorAll(".main-tab").forEach(btn=>{
    btn.classList.toggle("active", btn.dataset.main === (isNew ? "newwork" : "sequence"));
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
    setVal("newWorkData", readTextWithLegacy(STORAGE_KEYS.newWorkData, LEGACY_STORAGE_KEYS.newWorkData));
  }catch(e){
    setVal("newWorkData", "");
  }
  updateNewWorkPreview();
}
function closeActionPanels(){
  ["panel-copy","panel-split","panel-matches","panel-region-exclusion","panel-region-reference","panel-daily-region"].forEach(id=>{
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
  let s = val("scaleFactor").trim().replace(",",".").replace("%","");
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
    .replace(/ghép cặp/gi,"da")
    .replace(/đầu/gi,"dau")
    .replace(/đuôi|đui/gi,"duoi")
    .replace(/đđ/gi,"dd");
}
function parseAmount(s){
  return parseFloat(String(s||"0").replace(",",".")) || 0;
}

function orderSourcesBySchedule(sources){
  const list = (sources || []).filter(Boolean);
  if(list.length <= 1) return list.slice();

  const candidates = [];
  [REGION_A_SCHEDULE, REGION_B_SCHEDULE].forEach(map=>{
    Object.values(map).forEach(arr=>{
      if(list.every(source => arr.includes(source))){
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

function getSourcesFromName(name){
  if(!name) return [];
  const raw = name.trim();
  const lower = raw.toLowerCase();
  if(lower==="hn" || lower==="mb") return ["HN"];
  const found = [];
  for(const d of KNOWN_SOURCE_CODES){
    if(d === "HN") continue;
    const idx = lower.indexOf(d.toLowerCase());
    if(idx >= 0) found.push({d, idx});
  }
  found.sort((a,b)=>{
    if(a.idx !== b.idx) return a.idx - b.idx;
    return b.d.length - a.d.length;
  });
  return found.length ? orderSourcesBySchedule(found.map(item => item.d)) : [raw];
}
function detectRegionBySources(sources){
  if(sources.includes("HN")) return "HN";
  const mt = ["Pyen","Hue","Dlac","Qnam","Dnang","Khoa","Bdinh","Qtri","Qbinh","Glai","Nthuan","Qngai","Dnong","Ktum"];
  return sources.some(d => mt.includes(d)) ? "MT" : "MN";
}
function compactMultiSourceLabel(block){
  // Khóa thứ tự tên nguồn sau khi atomic được gom lại.
  // Không lấy thứ tự block xuất hiện trong input, mà luôn theo thứ tự nguồn chuẩn.
  const sources = orderSourcesBySchedule(getSourcesFromName(block).filter(Boolean));
  const canonicalBlock = sources.length ? sources.join("") : block;
  const region = detectRegionBySources(sources);
  if(region === "HN") return canonicalBlock;

  // Chỉ rút thành ký hiệu nhóm khi block là đúng dải đầu của lịch NGÀY HIỆN TẠI.
  // Ví dụ thứ Bảy:
  // TphoLanBphuoc -> 3dmn
  // TphoLanHgiang -> giữ nguyên, vì bỏ mất vùng thứ 3 là Bphuoc.
  const count = sources.length;
  if(count !== 3 && !(region === "MN" && count === 4)) return canonicalBlock;

  const todaySchedule = region === "MT"
    ? (REGION_B_SCHEDULE[dayIndex()] || [])
    : (REGION_A_SCHEDULE[dayIndex()] || []);
  const key = region === "MT" ? "3dmt" : `${count}dmn`;
  const matchesTodayPrefix = todaySchedule.length >= count &&
    sources.every((source, idx) => source === todaySchedule[idx]);
  return matchesTodayPrefix ? key : canonicalBlock;
}
function isHeader(line){
  const l = normalizeLine(line).toLowerCase();
  if(/^(hn|mb|2dmn|3dmn|4dmn|2dmt|3dmt)$/.test(l)) return true;
  return !/\d/.test(line) && /^[a-zA-ZÀ-ỹ]+$/.test(line.trim());
}
function pickDayForGeneric(region, count, sourceHints=[]){
  const map = region==="MT" ? REGION_B_SCHEDULE : REGION_A_SCHEDULE;
  const hints = (sourceHints || []).filter(Boolean);
  if(hints.length){
    for(const [d, arr] of Object.entries(map)){
      if(arr.length >= count && hints.every(source => arr.includes(source))){
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
function resolveHeader(raw, sourceHints=[]){
  const l = normalizeLine(raw).toLowerCase();
  let sources;
  if(l==="hn" || l==="mb") sources=["HN"];
  else if(l==="2dmn") sources=REGION_A_SCHEDULE[pickDayForGeneric("MN",2,sourceHints)].slice(0,2);
  else if(l==="3dmn") sources=REGION_A_SCHEDULE[pickDayForGeneric("MN",3,sourceHints)].slice(0,3);
  else if(l==="4dmn") sources=REGION_A_SCHEDULE[pickDayForGeneric("MN",4,sourceHints)].slice(0,4);
  else if(l==="2dmt") sources=REGION_B_SCHEDULE[pickDayForGeneric("MT",2,sourceHints)].slice(0,2);
  else if(l==="3dmt") sources=REGION_B_SCHEDULE[pickDayForGeneric("MT",3,sourceHints)].slice(0,3);
  else sources=getSourcesFromName(raw.trim());
  const generic = /^(2dmn|3dmn|4dmn|2dmt|3dmt)$/i.test(l);
  return {raw:raw.trim(), name:sources.join(""), sources, region:detectRegionBySources(sources), primarySources:sources.slice(0,2), generic, lines:[]};
}
function splitBlocks(text){
  const lines = (text||"").split(/\n+/).map(x=>x.trim()).filter(Boolean);
  const blocks=[]; let cur=null; let lastExplicit=[];
  for(const raw of lines){
    if(isHeader(raw)){
      cur = resolveHeader(raw, lastExplicit);
      blocks.push(cur);
      if(!cur.generic) lastExplicit = cur.sources;
    }else{
      if(!cur){
        cur = {raw:"Không rõ vùng", name:"Không rõ vùng", sources:["Không rõ vùng"], region:"MN", primarySources:["Không rõ vùng"], generic:false, lines:[]};
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
function pairSources(sources){
  const out=[];
  for(let i=0;i<sources.length;i++){
    for(let j=i+1;j<sources.length;j++) out.push([sources[i], sources[j]]);
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

function parseDataLine(line){
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

  const segRe = new RegExp("(?:^|\\.)" + LEGACY_TYPE_TOKEN_RE + "([\\d,.]+)n","ig");
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
function makePairLine(a,b,n){
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
    originSources:(block.sources||[]).slice(),
    sourceGeneric:!!block.generic
  });
  for(const block of blocks){
    for(const rawLine of block.lines){
      const parts = parseDataLine(rawLine);
      if(!parts){
        rows.push({block:block.name, line:rawLine, type:"?", nums:[rawLine], n:0, region:block.region, calc:false, sourceCount:1, ...meta(block)});
        continue;
      }
      for(const part of parts){
        const t=part.type;
        const nums=part.nums || [];
        if(t==="dv"){
          const numPairs = uniquePairs(pairNumbers(nums));
          const sourcePairs = block.sources.length>=2 ? pairSources(block.sources) : [[block.name]];
          for(const dp of sourcePairs){
            const bname = dp.length===2 ? dp[0]+dp[1] : block.name;
            for(const np of numPairs){
              const pair = sortPair(np[0], np[1]);
              rows.push({block:bname, line:makePairLine(pair[0],pair[1],part.n), type:"da", nums:pair, n:part.n, region:block.region, calc:true, raw:rawLine, sourceCount:(dp.length===2?2:1), ...meta(block)});
            }
          }
        }else if(t==="da"){
          const pair = sortPair(nums[0], nums[1]);
          const sourcePairs = block.sources.length>=2 ? pairSources(block.sources) : [[block.name]];
          for(const dp of sourcePairs){
            const bname = dp.length===2 ? dp[0]+dp[1] : block.name;
            rows.push({block:bname, line:makePairLine(pair[0],pair[1],part.n), type:"da", nums:pair, n:part.n, region:block.region, calc:true, raw:rawLine, sourceCount:(dp.length===2?2:1), ...meta(block)});
          }
        }else{
          for(const source of block.sources){
            for(const num of nums){
              rows.push({block:source, line:makeLine(num,t,part.n), type:t, nums:[num], n:part.n, region:block.region, calc:true, raw:rawLine, sourceCount:1, ...meta(block)});
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
    // Lấy số nguồn từ bảng trung gian đã bung, không đoán lại bằng tên block.
    // MN/MT ghép cặp 1 vùng: 36 x 1 x n x 0.8 = 28,8k cho 1n.
    // MN/MT ghép cặp 2 vùng: 36 x 2 x n x 0.8 = 57,6k cho 1n.
    const sourceCount = row.sourceCount || 1;
    base = region==="HN" ? 54 : 36 * sourceCount;

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
  const tbody = document.querySelector("#intermediateTable tbody");
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
        String(row.sourceCount || 1),
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
    lines.push([row.block,row.line,row.type,(row.nums||[]).join("."),fmtN(row.n),String(row.sourceCount||1),money(calcRow(row))].join("\t"));
  }
  setVal("auditDetail", lines.join("\n"));
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
// Chỉ đổi header tổng quát thành tên nguồn thật và chỉ ngắt dòng khi dãy số gốc quá dài.
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

function scheduledSourcesForRegion(region, sourceHints=[]){
  if(region === "HN") return ["HN"];
  const map = region === "MT" ? REGION_B_SCHEDULE : REGION_A_SCHEDULE;
  const maxCount = region === "MT" ? 3 : 4;
  const hints = (sourceHints || []).filter(Boolean);
  const count = Math.min(maxCount, Math.max(1, hints.length || maxCount));
  const day = pickDayForGeneric(region, count, hints);
  const arr = map[day] || hints;
  return arr.slice(0, maxCount);
}

function buildRegionZones(region, sourceHints=[]){
  const sources = scheduledSourcesForRegion(region, sourceHints);
  if(region === "HN"){
    return {
      region,
      sources:["HN"],
      singles:[{key:"D1", block:"HN", sources:["HN"]}],
      pairs:[],
      all:[{key:"D1", block:"HN", sources:["HN"]}],
      primarySources:["HN"],
      mainPair:""
    };
  }

  const singles = sources.map((source, idx)=>({
    key:"D" + (idx + 1),
    block:source,
    sources:[source]
  }));
  const pairs = [];
  for(let i=0; i<sources.length; i++){
    for(let j=i+1; j<sources.length; j++){
      pairs.push({
        key:"D" + (i + 1) + "-" + (j + 1),
        block:sources[i] + sources[j],
        sources:[sources[i], sources[j]]
      });
    }
  }

  return {
    region,
    sources,
    singles,
    pairs,
    all:singles.concat(pairs),
    primarySources:sources.slice(0,2),
    mainPair:sources.length >= 2 ? sources[0] + sources[1] : ""
  };
}

function regionZonesForRow(row){
  return buildRegionZones(row.region || "MN", row.originSources || []);
}

function twoDigit(n){
  return String(n == null ? "" : n).replace(/\D/g, "").slice(-2).padStart(2, "0");
}
function readExclusionSet(region){
  const id = region==="MT" ? "excludeB" : region==="HN" ? "excludeC" : "excludeA";
  const nums = val(id).match(/\d+/g) || [];
  return new Set(nums.map(twoDigit).filter(x => x.length===2));
}
function valueInExclusion(num, exclusionSet){
  return exclusionSet.has(twoDigit(num));
}

function buildTach(blocks){
  const limitLength2=getNum("limitLength2",10), limitPair=getNum("limitPair",1);
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
  const primarySourcesForRow = row => {
    if(row.region === "HN") return ["HN"];
    return regionZonesForRow(row).primarySources || [];
  };
  const primaryPairForRow = row => row.region === "HN" ? "" : (regionZonesForRow(row).mainPair || "");
  const hasExclusion = row => {
    const exclusionSet = readExclusionSet(row.region);
    return exclusionSet.size > 0 && (row.nums || []).some(num => valueInExclusion(num, exclusionSet));
  };
  const isSuffix2Scope = row => {
    const num = row.nums && row.nums[0] ? row.nums[0] : "";
    return row.type === "b" && String(num).length === 2 && primarySourcesForRow(row).includes(row.block);
  };
  const isPairScope = row => {
    if(row.type !== "da") return false;
    if(row.region === "HN") return true;
    return row.block === primaryPairForRow(row);
  };
  const blockSources = block => {
    const found = getSourcesFromName(block).filter(Boolean);
    return found.length ? found : [block];
  };
  const makeRank = rows => {
    const rank={};
    let i=0;
    // Khóa thứ tự hiển thị theo lịch của ngày hiện tại trước mọi thứ tự phát sinh
    // từ input, object/group hoặc quá trình tách rồi ráp atomic.
    // Ví dụ thứ Bảy luôn: Tpho -> Lan -> Bphuoc -> Hgiang.
    const today = dayIndex();
    [...(REGION_A_SCHEDULE[today] || []), ...(REGION_B_SCHEDULE[today] || []), "HN"].forEach(source=>{
      if(rank[source] == null) rank[source] = i++;
    });
    for(const block of blocks){
      (block.sources || []).forEach(source=>{
        if(rank[source] == null) rank[source] = i++;
      });
    }
    for(const row of rows || []){
      (row.originSources || []).forEach(source=>{
        if(rank[source] == null) rank[source] = i++;
      });
    }
    KNOWN_SOURCE_CODES.forEach(source=>{
      if(rank[source] == null) rank[source] = i++;
    });
    return rank;
  };
  const sortSourcesByRank = (sources, rank) => (sources || []).slice().sort((a,b)=>{
    const ra = rank[a] == null ? 9999 : rank[a];
    const rb = rank[b] == null ? 9999 : rank[b];
    if(ra !== rb) return ra - rb;
    return String(a).localeCompare(String(b));
  });
  const combineBlocks = (blockList, rank) => {
    const set = new Set();
    blockList.forEach(block => blockSources(block).forEach(source => set.add(source)));
    // Tên block ghép phải theo lịch chuẩn, không theo rank phát sinh từ thứ tự input.
    // Ví dụ hôm T6: Vlong trước Bduong, dù block Bduong xuất hiện trước trong tin.
    return orderSourcesBySchedule(Array.from(set)).join("");
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
    const addAtomic = (block, sourceBlock, originSources, region, nums, type, n, rawLine) => {
      rows.push({
        block,
        sourceBlock,
        originSources:(originSources || []).slice(),
        nums:(nums || []).slice(),
        type,
        n,
        region,
        raw:rawLine
      });
    };

    for(const block of blocks){
      for(const rawLine of block.lines){
        const parts = parseDataLine(rawLine);
        if(!parts) continue;
        for(const part of parts){
          const type = part.type;
          const nums = part.nums || [];
          if(type === "dv"){
            const numPairs = uniquePairs(pairNumbers(nums));
            const sourcePairs = block.sources.length >= 2 ? pairSources(block.sources) : [[block.name]];
            for(const dp of sourcePairs){
              const bname = dp.length === 2 ? dp[0] + dp[1] : block.name;
              for(const np of numPairs){
                addAtomic(bname, block.name, block.sources, block.region, sortPair(np[0], np[1]), "da", part.n, rawLine);
              }
            }
          }else if(type === "da"){
            const pair = sortPair(nums[0], nums[1]);
            const sourcePairs = block.sources.length >= 2 ? pairSources(block.sources) : [[block.name]];
            for(const dp of sourcePairs){
              const bname = dp.length === 2 ? dp[0] + dp[1] : block.name;
              addAtomic(bname, block.name, block.sources, block.region, pair, "da", part.n, rawLine);
            }
          }else{
            const outTypes = type === "dd" ? ["dau","duoi"] : [type];
            for(const source of block.sources){
              for(const num of nums){
                outTypes.forEach(outType=>{
                  addAtomic(source, block.name, block.sources, block.region, [num], outType, part.n, rawLine);
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
  const suffix2Groups = new Map();
  const pairGroups = new Map();

  // Quan trọng: nhóm cuối 2 ký tự phải tổng theo atomic nguồn thật trước khi xét max.
  // Không được đưa từng dòng gốc vào Tin tách rồi mới gom, vì sẽ lọt case:
  // Dnai 68b5n + DnaiCtho 68b11n => Dnai 68b16n vượt max.
  const addSuffix2Atomic = row => {
    const main = primarySourcesForRow(row);
    if(!main.includes(row.block)) return false;
    const key = [row.region, main.join("+"), row.nums[0]].join("|");
    if(!suffix2Groups.has(key)){
      suffix2Groups.set(key, {
        main:main.slice(),
        amountBySource:{},
        sampleBySource:{},
        sample:row
      });
    }
    const group = suffix2Groups.get(key);
    group.amountBySource[row.block] = Math.round(((group.amountBySource[row.block] || 0) + row.n) * 100) / 100;
    if(!group.sampleBySource[row.block]) group.sampleBySource[row.block] = row;
    return true;
  };

  for(const [idx, row] of atomicRows.entries()){
    if(hasExclusion(row)){
      used.add(idx);
      pushRow(khong, row);
      continue;
    }

    if(isSuffix2Scope(row)){
      used.add(idx);
      addSuffix2Atomic(row);
      continue;
    }

    if(isPairScope(row)){
      used.add(idx);
      const pair = sortPair(row.nums[0], row.nums[1]);
      const key = [row.region, row.block, pair[0], pair[1]].join("|");
      if(!pairGroups.has(key)){
        pairGroups.set(key, {...row, nums:pair, n:0});
      }
      pairGroups.get(key).n = Math.round((pairGroups.get(key).n + row.n) * 100) / 100;
    }
  }

  for(const group of suffix2Groups.values()){
    for(const source of group.main){
      const total = Math.round((group.amountBySource[source] || 0) * 100) / 100;
      if(!(total > 0)) continue;
      const sample = group.sampleBySource[source] || group.sample;
      pushSplit({...sample, block:source}, total, limitLength2, source);
    }
  }

  for(const group of pairGroups.values()){
    pushSplit(group, group.n, limitPair);
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
      const sourceSet = new Set();
      for(const block of item.blocks){
        const sources = blockSources(block);
        if(sources.length !== 2) return false;
        const pair = sortSourcesByRank(sources, rank);
        pairSet.add(pair.join("|"));
        pair.forEach(source => sourceSet.add(source));
      }

      const unionSources = sortSourcesByRank(Array.from(sourceSet), rank);
      if(unionSources.length <= 2) return true;
      return pairSources(unionSources).every(pair => pairSet.has(pair.join("|")));
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
    const compactPairsToSet = (pairs, amount) => {
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
        .forEach(pair => lines.push(makePairLine(pair[0], pair[1], amount)));
      return lines;
    };
    const renderPairLines = (items, block) => {
      const byAmount = {};
      items.forEach(item => {
        const key = fmtN(item.n);
        if(!byAmount[key]) byAmount[key] = [];
        byAmount[key].push(sortPair(item.nums[0], item.nums[1]));
      });
      const lines=[];
      Object.keys(byAmount).sort((a,b)=>parseAmount(a)-parseAmount(b)).forEach(key=>{
        const pairs = uniquePairs(byAmount[key]);
        lines.push(...compactPairsToSet(pairs, parseAmount(key)));
      });
      return lines;
    };
    const mergePairWithSameValueLines = lines => {
      const pairByValues = new Map();
      lines.forEach((line, idx) => {
        const m = String(line || "").match(/^([0-9]+(?:\.[0-9]+)+)da[\d,.]+n$/i);
        if(m) pairByValues.set(m[1], { line, idx });
      });

      const consumed = new Set();
      const merged = [];
      lines.forEach((line, idx) => {
        if(consumed.has(idx)) return;
        const m = String(line || "").match(/^([0-9]+(?:\.[0-9]+)+)([a-z].*)$/i);
        if(m){
          const suffix = m[2].toLowerCase();
          const da = pairByValues.get(m[1]);
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
      const ad = blockSources(a), bd = blockSources(b);
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
      const pairItems = [];
      items.forEach(item => {
        if(item.type === "da") pairItems.push(item);
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
      const pairLines = renderPairLines(pairItems, block);
      if(block === "HN"){
        lines.push(...pairLines);
      }else{
        lines.push(...pairLines.sort((a,b)=>{
        const pa = (a.match(/^(\d+)\.(\d+)/) || []).slice(1).map(numSortValue);
        const pb = (b.match(/^(\d+)\.(\d+)/) || []).slice(1).map(numSortValue);
        if((pa[0] || 0) !== (pb[0] || 0)) return (pa[0] || 0) - (pb[0] || 0);
        return (pa[1] || 0) - (pb[1] || 0);
        }));
      }

      if(!lines.length) continue;
      out.push(compactMultiSourceLabel(block));
      mergePairWithSameValueLines(groupDuplicateSuffixLines(lines)).forEach(line => out.push(...splitTachDisplayLine(line, 20)));
      out.push("");
    }
    return out.join("\n").trim();
  };

  return {
    tach:renderRows(tach),
    khong:renderRows(khong)
  };
}

function mapSourceName(line){
  const c = cleanName(line);
  for(const [k,v] of Object.entries(SOURCE_ALIAS_MAP)){
    if(cleanName(k)===c) return v;
  }
  return null;
}
function findSourceInLine(line){
  const exact = mapSourceName(line);
  if(exact) return exact;

  const c = " " + cleanName(line) + " ";
  const entries = Object.entries(SOURCE_ALIAS_MAP).sort((a,b)=>cleanName(b[0]).length-cleanName(a[0]).length);
  for(const [k,v] of entries){
    const kk = " " + cleanName(k) + " ";
    if(c.includes(kk)) return v;
  }
  return null;
}
function normalizeReferenceValueBySection(n, section, region){
  let x = String(n || "").replace(/\D/g, "");
  if(!x) return "";

  // Khi copy tham chiếu, các số có 0 đầu thường bị rút gọn.
  // Chuẩn hóa lại đúng độ dài theo nhóm để tạo vùng đối chiếu chính xác.
  if(region === "HN"){
    if(section === "g6" && x.length < 3) x = x.padStart(3, "0");
    if(section === "g7" && x.length < 2) x = x.padStart(2, "0");
  }else{
    if(section === "g8" && x.length < 2) x = x.padStart(2, "0");
    if(section === "g7" && x.length < 3) x = x.padStart(3, "0");
  }
  return x;
}

function detectLegacyGroupSection(line){
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

    // Cắt nhãn nhóm ở đầu dòng và giữ phần dữ liệu phía sau.
    // Không dựa vào \b unicode để tránh lỗi với dấu tiếng Việt.
    // Lớp tương thích: nhận các nhãn nhóm của dữ liệu cũ, sau đó chuyển sang vùng trung tính.
    const m = raw.match(/^\s*(?:giải|giai|g)?\s*(?:đb|db|đặc\s*biệt|dac\s*biet|nhất|nhat|nhì|nhi|ba|tư|tu|năm|nam|sáu|sau|bảy|bay|tám|tam|[1-8])\s*[\.\:\-\t ]*/i);
    const rest = m ? raw.slice(m[0].length) : raw;
    return {section:name, rest};
  }
  return {section:"", rest:raw};
}

function isReferenceMetaLine(line){
  const s = String(line || "").trim();
  if(!s) return true;
  if(/^kết\s*quả/i.test(s) || /^ket\s*qua/i.test(s)) return true;
  if(/^hà\s*nội$/i.test(s) || /^ha\s*noi$/i.test(s) || /^hn$/i.test(s)) return true;
  // Không đưa ngày/giờ hoặc dòng mã kỳ vào atomic tham chiếu.
  if(/\b\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?\b/.test(s)) return true;
  if(/\b\d{1,2}\.\d{1,2}\.\d{2,4}\b/.test(s)) return true;
  if(/\b\d{1,2}:\d{2}(?::\d{2})?\b/.test(s)) return true;
  return false;
}

function shapeReferenceRecord(source, numsRaw, position={}){
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

    // Nhóm cuối = toàn bộ giá trị theo độ dài cần xét.
    suffix2: nums.map(n=>n.slice(-2)),
    suffix3: nums.filter(n=>n.length>=3).map(n=>n.slice(-3)),
    suffix4: nums.filter(n=>n.length>=4).map(n=>n.slice(-4)),

    // Mặc định khi chưa có nhãn nhóm rõ ràng.
    leading2: first2 ? [first2.slice(-2)] : [],
    trailing2: last2 ? [last2.slice(-2)] : [],
    leading3: first3 ? [first3.slice(-3)] : [],
    trailing3: last3 ? [last3.slice(-3)] : [],
    leading4: first4 ? [first4.slice(-4)] : [],
    trailing4: last4 ? [last4.slice(-4)] : []
  };

  // Khi parser đã biết vị trí nhóm, dùng đúng vùng đó để đối chiếu.
  if(position.leading2) rec.leading2 = position.leading2.slice();
  if(position.trailing2) rec.trailing2 = position.trailing2.slice();
  if(position.leading3) rec.leading3 = position.leading3.slice();
  if(position.trailing3) rec.trailing3 = position.trailing3.slice();
  if(position.leading4) rec.leading4 = position.leading4.slice();
  if(position.trailing4) rec.trailing4 = position.trailing4.slice();

  // Vùng vùng 3 ký tự riêng. Không xét XC bằng suffix3 chung.
  rec.edge3 = position.edge3 ? position.edge3.slice() : rec.leading3.concat(rec.trailing3);

  // Alias cũ để không làm gãy các phần đang đúng.
  rec.all2 = rec.suffix2;
  rec.all3 = rec.suffix3;
  rec.all4 = rec.suffix4;
  return rec;
}

function buildReferenceZonesFromSections(sections, region, sectionOrder=[]){
  const db = (sections.db || [])[0] || "";
  const db2 = db ? [db.slice(-2)] : [];
  const db3 = db ? [db.slice(-3)] : [];
  const db4 = db ? [db.slice(-4)] : [];

  if(region === "HN"){
    const group3BeforeLeading2 = (sections.g6 || []).slice(0,3).map(value=>String(value).padStart(3,"0").slice(-3));
    const leading2Group = (sections.g7 || []).map(value=>String(value).padStart(2,"0").slice(-2));
    const g6Index = sectionOrder.lastIndexOf("g6");
    const g7Index = sectionOrder.indexOf("g7", g6Index + 1);
    const labelsAreAdjacent = g6Index >= 0 && g7Index === g6Index + 1;
    const hasAdjacentPair = labelsAreAdjacent && group3BeforeLeading2.length === 3 && leading2Group.length > 0;
    const leading3Group = hasAdjacentPair ? group3BeforeLeading2 : [];
    return {
      // Vùng C: nhóm đầu 3 ký tự chỉ hợp lệ khi có đúng 3 phần tử
      // và nằm sát ngay trước nhóm đầu 2 ký tự trong cấu trúc tham chiếu.
      leading2:hasAdjacentPair ? leading2Group : [],
      trailing2:db2,
      leading3:leading3Group,
      trailing3:db3,
      leading4:db4,
      trailing4:db4,
      edge3:leading3Group.concat(db3)
    };
  }

  const g8 = (sections.g8 || []).map(n=>String(n).slice(-2));
  const g7 = (sections.g7 || []).map(n=>String(n).slice(-3));
  return {
    // Vùng A/B: nhóm đầu 2 ký tự lấy từ nhóm cuối cùng; nhóm cuối chuẩn lấy từ nhóm đặc biệt.
    leading2:g8,
    trailing2:db2,
    // Vùng A/B: nhóm đầu 3 ký tự lấy từ nhóm liền trước; nhóm cuối chuẩn lấy 3 ký tự cuối của nhóm đặc biệt.
    leading3:g7,
    trailing3:db3,
    leading4:db4,
    trailing4:db4,
    edge3:g7.concat(db3)
  };
}

function collectLooseReferenceValues(text){
  const out = [];
  const lines = (text || "").split(/\n+/).map(x=>x.trim()).filter(Boolean);
  for(const raw of lines){
    if(isReferenceMetaLine(raw)) continue;
    if(findSourceInLine(raw)) continue;
    const detected = detectLegacyGroupSection(raw);
    const line = detected && detected.section ? detected.rest : raw;
    const nums = line.match(/\d+/g) || [];
    nums.forEach(n=>{
      const x = String(n || "").replace(/\D/g, "");
      if(x) out.push(x);
    });
  }
  return out;
}

function resolveRegionCAdjacentZonesFromLooseOrder(valuesRaw){
  const values = (valuesRaw || []).map(value=>String(value || "").replace(/\D/g, "")).filter(Boolean);
  if(values.length < 4) return null;

  // Vùng đầu 2 ký tự là nhóm 1–4 phần tử 1/2 chữ số ở cuối dữ liệu.
  // Vùng đầu 3 ký tự phải là đúng 3 phần tử đứng sát ngay trước nhóm đó.
  let leading2Start = -1;
  const scanFrom = Math.max(3, values.length - 7);
  for(let index=scanFrom; index<values.length; index++){
    const suffix = values.slice(index);
    if(suffix.length < 1 || suffix.length > 4) continue;
    if(suffix.every(value=>value.length <= 2)){
      leading2Start = index;
      break;
    }
  }
  if(leading2Start < 3) return null;

  const leading3Raw = values.slice(leading2Start - 3, leading2Start);
  const leading2Raw = values.slice(leading2Start);
  if(leading3Raw.length !== 3 || !leading2Raw.length) return null;

  return {
    leading3:leading3Raw.map(value=>value.padStart(3, "0").slice(-3)),
    leading2:leading2Raw.map(value=>value.padStart(2, "0").slice(-2)),
    leading2Start
  };
}

function shapeRegionCLooseReferenceByOrder(valuesRaw){
  const raw = (valuesRaw || []).map(value=>String(value || "").replace(/\D/g, "")).filter(Boolean);
  if(!raw.length) return {};

  const adjacent = resolveRegionCAdjacentZonesFromLooseOrder(raw);
  if(adjacent){
    const normalized = raw.map((value,index)=>{
      if(index >= adjacent.leading2Start) return value.padStart(2, "0").slice(-2);
      if(index >= adjacent.leading2Start - 3) return value.padStart(3, "0").slice(-3);
      return value;
    });
    const special = normalized[0] || "";
    const position = {
      leading2:adjacent.leading2,
      trailing2:special ? [special.slice(-2)] : [],
      leading3:adjacent.leading3,
      trailing3:special ? [special.slice(-3)] : [],
      leading4:special ? [special.slice(-4)] : [],
      trailing4:special ? [special.slice(-4)] : [],
      edge3:adjacent.leading3.concat(special ? [special.slice(-3)] : [])
    };
    return { HN: shapeReferenceRecord("HN", normalized, position) };
  }

  // Không có cặp nhóm liền kề rõ ràng thì chỉ tạo vùng hậu tố chung,
  // không tự suy đoán vùng đầu 3 ký tự để tránh đối chiếu sai.
  const cleaned = raw.filter(value => value.length >= 2);
  if(!cleaned.length) return {};
  return { HN: shapeReferenceRecord("HN", cleaned, {leading3:[], leading2:[], edge3:[]}) };
}

function parseRegionCReferenceText(text){
  const parsed = parseStructuredReferenceText(text, "HN", "HN");
  if(parsed && parsed.HN && parsed.HN.full && parsed.HN.full.length) return parsed;

  // Nếu Vùng C chỉ có dữ liệu rời, xác định vùng theo thứ tự nhóm chuẩn.
  // Lỗi cũ: fallback lấy xcdau = số 3 chữ số đầu tiên và xcduoi = số 3 chữ số cuối,
  // nên một phần tử thuộc nhóm đầu 3 ký tự có thể bị bỏ sót khỏi vùng đối chiếu.
  const nums = collectLooseReferenceValues(text);
  return shapeRegionCLooseReferenceByOrder(nums);
}

function parseStructuredReferenceText(text, region, fallbackSource=""){
  const lines=(text||"").split(/\n+/).map(x=>x.trim()).filter(Boolean);
  const out={};
  const sectionsBySource={};
  const sectionCurrentBySource={};
  const sectionOrderBySource={};
  let cur = fallbackSource || null;
  let sawPrizeLabel=false;

  const ensure = source => {
    if(!source) return;
    if(!out[source]) out[source]=[];
    if(!sectionsBySource[source]) sectionsBySource[source]={db:[],g1:[],g2:[],g3:[],g4:[],g5:[],g6:[],g7:[],g8:[]};
    if(!sectionOrderBySource[source]) sectionOrderBySource[source]=[];
  };

  if(cur) ensure(cur);

  for(const raw of lines){
    if(isReferenceMetaLine(raw)) continue;

    const source = findSourceInLine(raw);
    if(source){
      cur = source;
      ensure(cur);
      // Dòng tên nguồn chỉ đổi vùng vùng, không lấy số ngày/giờ/mã trong dòng này.
      continue;
    }

    if(!cur) continue;
    ensure(cur);

    const detected = detectLegacyGroupSection(raw);
    let line = raw;
    let section = "";
    if(detected.section){
      section = detected.section;
      sectionCurrentBySource[cur] = section;
      const order = sectionOrderBySource[cur] || (sectionOrderBySource[cur] = []);
      if(order[order.length - 1] !== section) order.push(section);
      sawPrizeLabel = true;
      line = detected.rest;
    }else{
      section = sectionCurrentBySource[cur] || "";
    }

    const nums = line.match(/\d+/g) || [];
    if(!nums.length) continue;

    if(section){
      nums.forEach(n=>{
        const x = normalizeReferenceValueBySection(n, section, region);
        if(!x || x.length < 2) return;
        sectionsBySource[cur][section].push(x);
        out[cur].push(x);
      });
    }else{
      nums.forEach(n=>{ if(n.length>=2) out[cur].push(n); });
    }
  }

  if(!sawPrizeLabel) return null;

  const shaped={};
  for(const [source, numsRaw] of Object.entries(out)){
    shaped[source] = shapeReferenceRecord(source, numsRaw, buildReferenceZonesFromSections(
      sectionsBySource[source] || {}, region, sectionOrderBySource[source] || []
    ));
  }
  return shaped;
}

function parseReferenceText(text, fallbackSource="", regionHint=""){
  const region = regionHint || (fallbackSource === "HN" ? "HN" : "MN");

  if(fallbackSource === "HN"){
    const hn = parseRegionCReferenceText(text);
    if(hn && hn.HN && hn.HN.full && hn.HN.full.length) return hn;
  }

  const structured = parseStructuredReferenceText(text, region, fallbackSource);
  if(structured && Object.keys(structured).length) return structured;

  const lines=(text||"").split(/\n+/).map(x=>x.trim()).filter(Boolean);
  const out={}; let cur=null;

  for(const line of lines){
    const source=findSourceInLine(line);
    if(source){
      cur=source;
      if(!out[cur]) out[cur]=[];
      continue;
    }

    if(isReferenceMetaLine(line)) continue;

    const nums=line.match(/\d+/g);
    if(nums && cur){
      nums.forEach(n=>{ if(n.length>=2) out[cur].push(n); });
    }
  }

  if(!Object.keys(out).length && fallbackSource){
    const nums = (text || "").match(/\d+/g) || [];
    const cleaned = nums.filter(n => n.length >= 2);
    if(cleaned.length) out[fallbackSource] = cleaned;
  }

  const shaped={};
  for(const [source, numsRaw] of Object.entries(out)){
    shaped[source] = shapeReferenceRecord(source, numsRaw);
  }
  return shaped;
}
function syncActiveRegionDataBuffer(){
  // Lỗi cũ: app chỉ đọc referenceA/referenceB/referenceC, còn ô đang dán trên overlay là activeReferenceData.
  // Nếu chưa kịp bấm Lưu hoặc debounce chưa chạy, runAll sẽ xét bằng vùng tham chiếu rỗng.
  if(!["MN","MT","HN"].includes(activeWorkspace)) return;
  const ids = regionRelatedIds(activeWorkspace);
  const activeReference = val("activeReferenceData");
  const activeExclusion = val("activeExclusionData");
  if(activeReference.trim()) setVal(ids.reference, activeReference);
  if(activeExclusion.trim()) setVal(ids.exclusion, activeExclusion);
}
function referenceRegionHasData(obj, region){
  return !!(obj && obj[region] && Object.keys(obj[region]).length);
}
function parseAllReferences(rows){
  syncActiveRegionDataBuffer();

  const obj = {
    MN:parseReferenceText(val("referenceA"), "", "MN"),
    MT:parseReferenceText(val("referenceB"), "", "MT"),
    HN:parseReferenceText(val("referenceC"), "HN", "HN")
  };

  // Fallback theo atomic đang xét: nếu tin là HN nhưng referenceC rỗng,
  // lấy ngay dữ liệu đang nằm trong ô Tham chiếu đang mở để tạo vùng HN.
  const activeText = val("activeReferenceData").trim();
  const needRegions = new Set((rows || []).map(r => r.region).filter(Boolean));
  if(activeText){
    for(const region of needRegions){
      if(referenceRegionHasData(obj, region)) continue;
      const fallbackSource = region === "HN" ? "HN" : "";
      const parsed = parseReferenceText(activeText, fallbackSource, region);
      if(parsed && Object.keys(parsed).length) obj[region] = parsed;
    }
  }
  return obj;
}
function renderParsedReferences(obj){
  const lines=[];
  for(const region of ["MN","MT","HN"]){
    const data=obj[region];
    if(!data || !Object.keys(data).length) continue;
    lines.push("Vùng " + regionDisplayCode(region));
    for(const [source,r] of Object.entries(data)){
      lines.push(source);
      lines.push("Toàn bộ: "+r.full.join("."));
      lines.push("Nhóm cuối 2 ký tự: "+r.suffix2.join("."));
      lines.push("Nhóm đầu 2 ký tự: "+r.leading2.join("."));
      lines.push("Nhóm cuối chuẩn 2 ký tự: "+r.trailing2.join("."));
      lines.push("Nhóm cuối 3 ký tự: "+r.suffix3.join("."));
      lines.push("Nhóm đầu 3 ký tự: "+r.leading3.join("."));
      lines.push("Nhóm cuối chuẩn 3 ký tự: "+r.trailing3.join("."));
      lines.push("Nhóm biên 3 ký tự: "+(r.edge3 || []).join("."));
      lines.push("Nhóm cuối 4 ký tự: "+r.suffix4.join("."));
      lines.push("Nhóm đầu 4 ký tự: "+r.leading4.join("."));
      lines.push("Nhóm cuối chuẩn 4 ký tự: "+r.trailing4.join("."));
      lines.push("");
    }
  }
  setVal("parsedReference", lines.join("\n").trim());
}
function parseReferencesOnly(){
  renderParsedReferences(parseAllReferences());
}


function hasAnyReferences(references){
  return ["MN","MT","HN"].some(region => references && references[region] && Object.keys(references[region]).length);
}
function referenceFor(references, region, source){
  if(!references || !source) return null;
  const r = region || "MN";
  if(references[r] && references[r][source]) return references[r][source];
  if(references.MN && references.MN[source]) return references.MN[source];
  if(references.MT && references.MT[source]) return references.MT[source];
  if(references.HN && references.HN[source]) return references.HN[source];
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
function matchWeightForRow(row){
  const t = row.type;
  const num = row.nums && row.nums[0] ? String(row.nums[0]) : "";
  const len = num.length;
  if(t === "da"){
    const dc = row.sourceCount || 1;
    if((row.region || "MN") === "HN") return getNum("weightPairRegionC",650);
    return dc >= 2 ? getNum("weightPair2Sources",550) : getNum("weightPair1Source",750);
  }
  if(t === "b" || t === "bdao"){
    if(len === 2) return getNum("weightLength2",75);
    if(len === 3) return getNum("weightLength3",630);
    if(len === 4) return getNum("weightLength4",5500);
  }
  if(t === "dd" || t === "dau" || t === "duoi") return getNum("weightLength2",75);
  if(t === "xc" || t === "xcdau" || t === "xcduoi" || t === "xcdao") return getNum("weightLength3",630);
  return 0;
}
function evaluateRowMatch(row, references){
  if(!row || !row.calc || !hasAnyReferences(references)) return null;

  const t = row.type;
  const nums = row.nums || [];
  const n = Number(row.n || 0);
  const region = row.region || "MN";
  const sources = getSourcesFromName(row.block);
  let hit = 0;

  if(t === "da"){
    if(nums.length < 2) return null;
    const a = nums[0], b = nums[1];

    if((row.sourceCount || 1) >= 2 && sources.length >= 2){
      const r1 = referenceFor(references, region, sources[0]);
      const r2 = referenceFor(references, region, sources[1]);
      if(!r1 || !r2) return null;

      // DA/DV tính theo cặp, không nhân chéo.
      // Hit 2 vùng = min(A vùng 1, B vùng 2) + min(B vùng 1, A vùng 2).
      const c1a = countExact(r1.suffix2, a);
      const c2b = countExact(r2.suffix2, b);
      const c1b = countExact(r1.suffix2, b);
      const c2a = countExact(r2.suffix2, a);
      const ab = Math.min(c1a, c2b);
      const ba = (a === b) ? 0 : Math.min(c1b, c2a);
      hit = ab + ba;
    }else{
      const r = referenceFor(references, region, sources[0]);
      if(!r) return null;
      const ca = countExact(r.suffix2, a);
      const cb = countExact(r.suffix2, b);

      // DA/DV 1 vùng = min(A,B), không A*B.
      hit = (a === b) ? Math.floor(ca / 2) : Math.min(ca, cb);
    }

  }else{
    const source = sources[0];
    const r = referenceFor(references, region, source);
    if(!r) return null;

    const num = nums[0] || "";
    const len = String(num).length;

    if(t === "b"){
      if(len === 2) hit = countExact(r.suffix2, num);
      else if(len === 3) hit = countExact(r.suffix3, num);
      else if(len === 4) hit = countExact(r.suffix4, num);

    }else if(t === "bdao"){
      if(len === 3) hit = countPerm(r.suffix3, num);
      else if(len === 4) hit = countPerm(r.suffix4, num);

    }else if(t === "dd"){
      hit = countExact(r.leading2, num) + countExact(r.trailing2, num);

    }else if(t === "dau"){
      hit = countExact(r.leading2, num);

    }else if(t === "duoi"){
      hit = countExact(r.trailing2, num);

    }else if(t === "xc"){
      hit = r.edge3 ? countExact(r.edge3, num) : (countExact(r.leading3, num) + countExact(r.trailing3, num));

    }else if(t === "xcdau"){
      hit = countExact(r.leading3, num);

    }else if(t === "xcduoi"){
      hit = countExact(r.trailing3, num);

    }else if(t === "xcdao"){
      hit = countPerm(r.leading3, num) + countPerm(r.trailing3, num);
    }
  }

  const coef = matchWeightForRow(row);
  if(!hit || !coef || !n) return null;
  return {
    block: row.block,
    line: row.line,
    amount: n * coef * hit,
    hit,
    coef
  };
}
function evaluateMatches(rows, references){
  const items = [];
  let total = 0;
  for(const row of rows || []){
    const w = evaluateRowMatch(row, references);
    if(w && w.amount > 0){
      items.push(w);
      total += w.amount;
    }
  }
  return {items,total};
}
function buildMatchReport(pack){
  const items = pack && pack.items ? pack.items : [];
  if(!items.length) return "";
  const blockGroups = {};
  const blockOrder = [];
  const groupableTypes = new Set(["b","bdao","xc","xcdao","xcdau","xcduoi","dd","dau","duoi"]);
  const parseMatchLine = (line)=>{
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
      blockGroups[block] = {normal:{}, normalOrder:[], da:{}, pairOrder:[], other:[]};
      blockOrder.push(block);
    }
    return blockGroups[block];
  };

  for(const w of items){
    const group = addBlockGroup(w.block);
    const parsed = parseMatchLine(w.line);
    if(!parsed){
      group.other.push(`${w.line} ${money(w.amount)}`);
      continue;
    }

    if(parsed.kind === "da"){
      const key = parsed.nums.join(".");
      if(!group.da[key]){
        group.da[key] = {nums:parsed.nums, n:0, amount:0};
        group.pairOrder.push(key);
      }
      group.da[key].n += parsed.n;
      group.da[key].amount += w.amount;
      continue;
    }

    // Dòng phù hợp từ bảng trung gian thường đã là 1 số/dòng. Nếu gặp nhiều số
    // trong cùng dòng thì chia giá trị đều để vẫn gom được mà không lệch tổng.
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

    for(const key of group.pairOrder){
      const item = group.da[key];
      lines.push(`${makePairLine(item.nums[0], item.nums[1], item.n)} ${money(item.amount)}`);
    }

    lines.push(...group.other);
    if(!lines.length) continue;
    out.push(block);
    out.push(...lines);
    out.push("");
  }
  return out.join("\n").trim();
}


// V0.5.63 - Atomic condition engine: tham chiếu -> vùng tham chiếu -> atomic -> PHÙ HỢP / KHÔNG PHÙ HỢP.
// Không dùng nhánh gom công thức cũ để quyết định phù hợp. Gom chỉ được làm sau khi atomic đã phân vùng đúng.
function evaluateAtomicMatchRow(row, references){
  if(!row || !row.calc || !hasAnyReferences(references)) return null;

  const t = row.type;
  const nums = row.nums || [];
  const n = Number(row.n || 0);
  const region = row.region || "MN";
  const sources = getSourcesFromName(row.block);
  const coef = matchWeightForRow(row);
  let hit = 0;
  let zone = "";

  if(!n || !coef){
    return {row, hit:0, amount:0, coef, zone:"không tính"};
  }

  if(t === "da"){
    if(nums.length < 2) return {row, hit:0, amount:0, coef, zone:"da"};
    const a = nums[0], b = nums[1];
    if((row.sourceCount || 1) >= 2 && sources.length >= 2){
      const r1 = referenceFor(references, region, sources[0]);
      const r2 = referenceFor(references, region, sources[1]);
      zone = "ghép cặp 2 vùng / suffix2 chéo";
      if(!r1 || !r2) return {row, hit:0, amount:0, coef, zone};
      const ab = Math.min(countExact(r1.suffix2, a), countExact(r2.suffix2, b));
      const ba = (a === b) ? 0 : Math.min(countExact(r1.suffix2, b), countExact(r2.suffix2, a));
      hit = ab + ba;
    }else{
      const r = referenceFor(references, region, sources[0]);
      zone = "ghép cặp 1 vùng / suffix2";
      if(!r) return {row, hit:0, amount:0, coef, zone};
      const ca = countExact(r.suffix2, a);
      const cb = countExact(r.suffix2, b);
      hit = (a === b) ? Math.floor(ca / 2) : Math.min(ca, cb);
    }
  }else{
    const source = sources[0];
    const r = referenceFor(references, region, source);
    const num = nums[0] || "";
    const len = String(num).length;
    if(!r) return {row, hit:0, amount:0, coef, zone:"thiếu tham chiếu"};

    if(t === "b"){
      if(len === 2){ hit = countExact(r.suffix2, num); zone = "suffix2"; }
      else if(len === 3){ hit = countExact(r.suffix3, num); zone = "suffix3"; }
      else if(len === 4){ hit = countExact(r.suffix4, num); zone = "suffix4"; }
    }else if(t === "bdao"){
      if(len === 3){ hit = countPerm(r.suffix3, num); zone = "suffix3 đảo"; }
      else if(len === 4){ hit = countPerm(r.suffix4, num); zone = "suffix4 đảo"; }
    }else if(t === "dd"){
      hit = countExact(r.leading2, num) + countExact(r.trailing2, num);
      zone = "đầu2 + đuôi2";
    }else if(t === "dau"){
      hit = countExact(r.leading2, num);
      zone = "đầu2";
    }else if(t === "duoi"){
      hit = countExact(r.trailing2, num);
      zone = "đuôi2";
    }else if(t === "xc"){
      hit = countExact(r.edge3 || [], num);
      zone = "xc = xcdau + xcduoi";
    }else if(t === "xcdau"){
      hit = countExact(r.leading3, num);
      zone = "xcdau";
    }else if(t === "xcduoi"){
      hit = countExact(r.trailing3, num);
      zone = "xcduoi";
    }else if(t === "xcdao"){
      hit = countPerm(r.leading3, num) + countPerm(r.trailing3, num);
      zone = "xc đảo";
    }
  }

  const amount = hit > 0 ? n * coef * hit : 0;
  return {row, block:row.block, line:row.line, hit, coef, amount, zone};
}

function evaluateMatches(rows, references){
  const items = [];
  const misses = [];
  let total = 0;
  if(!hasAnyReferences(references)) return {items, misses, total};

  for(const row of rows || []){
    const ev = evaluateAtomicMatchRow(row, references);
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
    const block = item.block || (item.row && item.row.block) || "Không rõ vùng";
    if(!groups[block]){ groups[block] = []; order.push(block); }
    groups[block].push(item);
  }

  for(const block of order){
    out.push(block);
    for(const item of groups[block]){
      if(showMoney){
        const meta = item.zone ? ` [${item.zone}; lượt khớp=${item.hit}]` : "";
        out.push(`${item.line} ${money(item.amount)}${meta}`);
      }else{
        const meta = item.zone ? ` [${item.zone}; lượt khớp=0]` : "";
        out.push(`${item.line}${meta}`);
      }
    }
    out.push("");
  }
  return out.join("\n").trim();
}

function buildMatchReport(pack){
  const items = pack && pack.items ? pack.items : [];
  const misses = pack && pack.misses ? pack.misses : [];
  if(!items.length && !misses.length) return "";
  return [
    buildAtomicSection("PHÙ HỢP", items, true),
    "",
    buildAtomicSection("KHÔNG PHÙ HỢP", misses, false)
  ].join("\n").trim();
}

function buildMatchStepTrace(rows, references, pack){
  const lines = [];
  lines.push("KIỂM TRA ĐIỀU KIỆN TỪNG PHẦN TỬ");
  lines.push("");
  lines.push("B1. Dữ liệu đầu vào đã tách:");
  (rows || []).forEach(r=>{
    if(!r.calc) return;
    lines.push(`${r.region || ""} | ${r.block} | ${r.line} | type=${r.type} | n=${r.n}`);
  });
  lines.push("");
  lines.push("B2. Vùng tham chiếu:");
  ["MN","MT","HN"].forEach(region=>{
    const data = references && references[region];
    if(!data || !Object.keys(data).length) return;
    lines.push("Vùng " + regionDisplayCode(region));
    Object.entries(data).forEach(([source,r])=>{
      lines.push(`${source} suffix3=${(r.suffix3||[]).join(".")}`);
      lines.push(`${source} xcdau=${(r.leading3||[]).join(".")}`);
      lines.push(`${source} xcduoi=${(r.trailing3||[]).join(".")}`);
      lines.push(`${source} xc=${(r.edge3||[]).join(".")}`);
    });
  });
  lines.push("");
  lines.push("B3. Tham chiếu từng phần tử:");
  const all = []
    .concat((pack && pack.items) || [])
    .concat((pack && pack.misses) || []);
  all.forEach(item=>{
    const status = item.hit > 0 ? "PHÙ HỢP" : "KHÔNG";
    const amount = item.amount ? ` | giá trị=${money(item.amount)}` : "";
    lines.push(`${status} | ${item.block} | ${item.line} | vùng=${item.zone || ""} | lượt khớp=${item.hit}${amount}`);
  });
  lines.push("");
  lines.push(`Giá trị phù hợp=${money((pack && pack.total) || 0)}`);
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
    setVal("printOutput", buildCopyFast(blocks, total));
    setVal("inputValue", money(total));

    const tk = buildTach(blocks);
    setVal("processedOutput", tk.tach);
    setVal("unchangedOutput", tk.khong);
    scrollTextTop("processedOutput");
    scrollTextTop("unchangedOutput");

    // CHẠY không hiện chuẩn hóa tham chiếu. Chỉ xét ngầm nếu đã có dữ liệu tham chiếu.
    const referencePack = parseAllReferences(rows);
    const matchPack = evaluateMatches(rows, referencePack);
    setVal("matchedValue", matchPack.total ? money(matchPack.total) : "0");
    setVal("remainingValue", money(total - matchPack.total));
    setVal("matchedOutput", buildMatchReport(matchPack));
    setVal("auditDetail", buildMatchStepTrace(rows, referencePack, matchPack));
    scrollTextTop("matchedOutput");
  }catch(err){
    console.error(err);
    setVal("inputValue", "Lỗi chạy: " + (err && err.message ? err.message : err));
  }
}
function clearRun(){
  ["inputData","printOutput","inputValue","remainingValue","matchedValue","processedOutput","unchangedOutput","matchedOutput","parsedReference","auditDetail"].forEach(id=>setVal(id,""));
  const tbody = document.querySelector("#intermediateTable tbody");
  if(tbody) tbody.innerHTML = "";
  setVal("matchedValue","0");
  saveActiveWorkspaceInput();
}
async function copyText(id){
  const text = val(id);
  try{
    await navigator.clipboard.writeText(text);
    return true;
  }catch(e){
    alert("Không sao chép tự động được, anh chọn nội dung rồi sao chép thủ công nhé");
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
  const text = val("printOutput").trim();
  if(!text){
    alert("Chưa có dữ liệu để in");
    return;
  }

  const ok = await copyText("printOutput");
  if(ok) flashActionButton(btn, "Đã sao chép", "In");
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
  if(!amount) amount = val("inputValue").trim();

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
  const text = val("printOutput").trim();
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
    alert("Chưa có dữ liệu để sao chép");
    return;
  }
  try{
    await navigator.clipboard.writeText(text);
    flashActionButton(btn, "Đã sao chép", "Sao chép");
  }catch(e){
    alert("Không sao chép tự động được, anh chọn nội dung rồi sao chép thủ công nhé");
  }
}

function wrapPrintLine(line, ctx, maxWidth){
  const s = String(line || "");
  if(!s) return [""];
  if(ctx.measureText(s).width <= maxWidth) return [s];

  const dataLineMatch = s.match(/^([0-9.]+)([a-z][a-z0-9,.]*(?:n)(?:\.[a-z][a-z0-9,.]*(?:n))*)$/i);
  if(dataLineMatch){
    const nums = dataLineMatch[1].split(".").filter(Boolean);
    const suffix = dataLineMatch[2];
    const firstType = (suffix.match(/^([a-z]+)/i) || [,""])[1].toLowerCase();
    const isLongPair = firstType === "da" || firstType === "dv";
    const out = [];
    let i = 0;
    while(i < nums.length){
      let best = i;
      for(let j = i; j < nums.length; j++){
        const finalLine = j === nums.length - 1;
        const candidate = nums.slice(i, j + 1).join(".") + (isLongPair ? (finalLine ? suffix : ".") : suffix);
        if(ctx.measureText(candidate).width <= maxWidth) best = j;
        else break;
      }
      const finalLine = best === nums.length - 1;
      out.push(nums.slice(i, best + 1).join(".") + (isLongPair ? (finalLine ? suffix : ".") : suffix));
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
  return new File([blob], `sequence-output-${dateKey()}.png`, {type:"image/png"});
}

async function sharePrintImage(file){
  if(navigator.canShare && navigator.share && navigator.canShare({files:[file]})){
    await navigator.share({
      files:[file],
      title:"Xử lý dữ liệu chuỗi — in ảnh",
      text:"Ảnh dữ liệu chuỗi"
    });
    return true;
  }
  return false;
}

function downloadFile(file){
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name || "sequence-output.png";
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
function readStorageWithLegacy(primaryKey, legacyKey){
  const primary = readStorage(primaryKey);
  if(primary && Object.keys(primary).length) return primary;
  return legacyKey ? readStorage(legacyKey) : {};
}
function readTextWithLegacy(primaryKey, legacyKey){
  try{
    const current = localStorage.getItem(primaryKey);
    if(current != null && current !== "") return current;
    return legacyKey ? (localStorage.getItem(legacyKey) || "") : "";
  }catch(e){
    return "";
  }
}
function migrateLegacySettingIds(data){
  const map = {
    rate:"scaleFactor", coefDa2:"weightPair2Sources", coefDa1:"weightPair1Source",
    coefDaHN:"weightPairRegionC", coef2:"weightLength2", coef3:"weightLength3",
    coef4:"weightLength4", max2:"limitLength2", maxDa:"limitPair"
  };
  const out = {...(data || {})};
  Object.entries(map).forEach(([oldId,newId])=>{
    if(out[newId] == null && out[oldId] != null) out[newId] = out[oldId];
  });
  return out;
}
function migrateLegacyRegionIds(data){
  const map = {
    xoaMn:"excludeA", xoaMt:"excludeB", xoaHn:"excludeC",
    kqMn:"referenceA", kqMt:"referenceB", kqHn:"referenceC"
  };
  const out = {...(data || {})};
  Object.entries(map).forEach(([oldId,newId])=>{
    if(out[newId] == null && out[oldId] != null) out[newId] = out[oldId];
  });
  return out;
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
function saveExclusionData(){
  const ok = writeStorage(STORAGE_KEYS.exclusions, collectValues(["excludeA","excludeB","excludeC"]));
  if(ok){
    syncRegionRelatedPanel();
    flashSaveButton(document.querySelector(".exclusions-panel .save-mini"));
  }
}
function clearExclusionData(){
  ["excludeA","excludeB","excludeC"].forEach(id=>setVal(id,""));
  syncRegionRelatedPanel();
  try{
    localStorage.removeItem(STORAGE_KEYS.exclusions);
  }catch(e){
    console.error(e);
  }
  runAll();
}
function saveSettingsData(){
  const ok = writeStorage(STORAGE_KEYS.settings, collectValues(WEIGHT_SETTING_IDS));
  if(ok){
    runAll();
    flashSaveButton(document.querySelector(".settings-panel .save-mini"));
  }
}
function saveReferenceData(){
  const ok = writeStorage(STORAGE_KEYS.references, collectValues(["referenceA","referenceB","referenceC"]));
  if(ok){
    syncRegionRelatedPanel();
    parseReferencesOnly();
    runAll();
    flashSaveButton(document.querySelector(".result-input-panel-visible .save-mini"));
  }
}
function clearReferenceData(){
  ["referenceA","referenceB","referenceC","parsedReference","matchedOutput"].forEach(id=>setVal(id,""));
  syncRegionRelatedPanel();
  try{
    localStorage.removeItem(STORAGE_KEYS.references);
  }catch(e){
    console.error(e);
  }
  setVal("matchedValue","0");
  parseReferencesOnly();
  runAll();
}
function saveDailyInputBackup(){
  const text = val("inputData").trim();
  if(!text) return "empty";
  try{
    const old = readTextWithLegacy(dailyInputKey(), LEGACY_STORAGE_KEYS.dailyInputPrefix + dateKey());
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
    setVal("savedInputToday", readTextWithLegacy(dailyInputKey(), LEGACY_STORAGE_KEYS.dailyInputPrefix + dateKey()));
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
  const settings = migrateLegacySettingIds(readStorageWithLegacy(STORAGE_KEYS.settings, LEGACY_STORAGE_KEYS.settings));
  const exclusions = migrateLegacyRegionIds(readStorageWithLegacy(STORAGE_KEYS.exclusions, LEGACY_STORAGE_KEYS.exclusions));
  const references = migrateLegacyRegionIds(readStorageWithLegacy(STORAGE_KEYS.references, LEGACY_STORAGE_KEYS.references));
  applyValues(settings);
  applyValues(exclusions);
  applyValues(references);
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

  ["activeExclusionData","activeReferenceData"].forEach(id=>{
    const x=el(id);
    if(x){
      x.addEventListener("input", regionRelatedAutoSave);
      x.addEventListener("paste", ()=>setTimeout(saveRegionRelatedData, 50));
      x.addEventListener("change", saveRegionRelatedData);
    }
  });

  // Dán tham chiếu MN/MT/HN cũng tự cập nhật xét/phù hợp.
  ["referenceA","referenceB","referenceC"].forEach(id=>{
    const x=el(id);
    if(x){
      x.addEventListener("input", ()=>{
        parseReferencesOnly();
        syncRegionRelatedPanel();
        autoRun();
      });
      x.addEventListener("paste", ()=>{
        setTimeout(()=>{
          parseReferencesOnly();
          syncRegionRelatedPanel();
          runAll();
        },50);
      });
      x.addEventListener("change", ()=>{
        parseReferencesOnly();
        syncRegionRelatedPanel();
        runAll();
      });
    }
  });

  // Thay đổi hệ số/cài đặt thì tự tính lại nếu đang có dữ liệu.
  WEIGHT_SETTING_IDS.forEach(id=>{
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

  parseReferencesOnly();
  let savedTab = "MN";
  try{
    savedTab = readTextWithLegacy(STORAGE_KEYS.activeWorkspace, LEGACY_STORAGE_KEYS.activeWorkspace) || "MN";
  }catch(e){
    savedTab = "MN";
  }
  if(!["MN","MT","HN","SETTINGS"].includes(savedTab)) savedTab = "MN";
  if(savedTab === "SETTINGS"){
    try{
      activeWorkspace = readTextWithLegacy(STORAGE_KEYS.lastWorkRegion, LEGACY_STORAGE_KEYS.lastWorkRegion) || "MN";
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
   Xóa nhánh báo giá trị phù hợp điều kiện khỏi panel Dữ liệu phù hợp.
   Panel này chỉ còn: vùng tham chiếu -> atomic dữ liệu đầu vào -> phù hợp/không phù hợp từng con.
*/
const SEQ_DATA_TRACE_BUILD = "Xử lý dữ liệu chuỗi v0.5.66 — theo dõi vùng dữ liệu — bộ nhớ đệm 5643";

function traceJoin(arr){
  return (arr || []).length ? (arr || []).join(".") : "Trống";
}
function rowAtomicNumber(row){
  return row && row.nums && row.nums.length ? String(row.nums[0]) : "";
}
function matchZoneForAtomic(row, references){
  if(!row || !row.calc) return null;
  const t = row.type;
  const region = row.region || "MN";
  const sources = getSourcesFromName(row.block);
  const nums = row.nums || [];
  const num = nums[0] || "";
  const len = String(num).length;

  if(t === "da"){
    if(nums.length < 2) return {row, zone:"ghép cặp", values:[], hit:0, note:"thiếu cặp số"};
    const a = nums[0], b = nums[1];
    if((row.sourceCount || 1) >= 2 && sources.length >= 2){
      const r1 = referenceFor(references, region, sources[0]);
      const r2 = referenceFor(references, region, sources[1]);
      const v1 = r1 ? (r1.suffix2 || []) : [];
      const v2 = r2 ? (r2.suffix2 || []) : [];
      const ab = Math.min(countExact(v1, a), countExact(v2, b));
      const ba = (a === b) ? 0 : Math.min(countExact(v1, b), countExact(v2, a));
      return {row, zone:`ghép cặp 2 vùng: ${sources[0]}.suffix2 + ${sources[1]}.suffix2`, values:[`${sources[0]}=${traceJoin(v1)}`, `${sources[1]}=${traceJoin(v2)}`], hit:ab+ba, note:`${a}.${b}`};
    }
    const r = referenceFor(references, region, sources[0]);
    const values = r ? (r.suffix2 || []) : [];
    const ca = countExact(values, a);
    const cb = countExact(values, b);
    const hit = (a === b) ? Math.floor(ca / 2) : Math.min(ca, cb);
    return {row, zone:`${sources[0] || row.block}.suffix2`, values, hit, note:`${a}.${b}`};
  }

  const source = sources[0] || row.block;
  const r = referenceFor(references, region, source);
  if(!r) return {row, zone:`${source}.thiếu_kết_quả`, values:[], hit:0, note:num};

  let zone = "";
  let values = [];
  let hit = 0;
  if(t === "b"){
    if(len === 2){ zone = `${source}.suffix2`; values = r.suffix2 || []; hit = countExact(values, num); }
    else if(len === 3){ zone = `${source}.suffix3`; values = r.suffix3 || []; hit = countExact(values, num); }
    else if(len === 4){ zone = `${source}.suffix4`; values = r.suffix4 || []; hit = countExact(values, num); }
  }else if(t === "bdao"){
    if(len === 3){ zone = `${source}.suffix3 đảo`; values = r.suffix3 || []; hit = countPerm(values, num); }
    else if(len === 4){ zone = `${source}.suffix4 đảo`; values = r.suffix4 || []; hit = countPerm(values, num); }
  }else if(t === "dd"){
    zone = `${source}.leading2 + ${source}.trailing2`;
    values = [`leading2=${traceJoin(r.leading2 || [])}`, `trailing2=${traceJoin(r.trailing2 || [])}`];
    hit = countExact(r.leading2 || [], num) + countExact(r.trailing2 || [], num);
  }else if(t === "dau"){
    zone = `${source}.leading2`;
    values = r.leading2 || [];
    hit = countExact(values, num);
  }else if(t === "duoi"){
    zone = `${source}.trailing2`;
    values = r.trailing2 || [];
    hit = countExact(values, num);
  }else if(t === "xc"){
    zone = `${source}.xc = xcdau + xcduoi`;
    values = r.edge3 || [];
    hit = countExact(values, num);
  }else if(t === "xcdau"){
    zone = `${source}.xcdau`;
    values = r.leading3 || [];
    hit = countExact(values, num);
  }else if(t === "xcduoi"){
    zone = `${source}.xcduoi`;
    values = r.trailing3 || [];
    hit = countExact(values, num);
  }else if(t === "xcdao"){
    zone = `${source}.xc đảo = xcdau + xcduoi đảo`;
    values = [`xcdau=${traceJoin(r.leading3 || [])}`, `xcduoi=${traceJoin(r.trailing3 || [])}`];
    hit = countPerm(r.leading3 || [], num) + countPerm(r.trailing3 || [], num);
  }else{
    zone = `${source}.không_rõ_loại`;
  }
  return {row, zone, values, hit, note:num};
}
function evaluateMatches(rows, references){
  const items = [];
  const misses = [];
  let hitCount = 0;
  if(!hasAnyReferences(references)) return {items, misses, total:0, hitCount:0, traceOnly:true};
  for(const row of rows || []){
    const ev = matchZoneForAtomic(row, references);
    if(!ev) continue;
    hitCount += Number(ev.hit || 0);
    const item = {block:row.block, line:row.line, row, zone:ev.zone, values:ev.values || [], hit:ev.hit || 0, note:ev.note || ""};
    if((ev.hit || 0) > 0) items.push(item);
    else misses.push(item);
  }
  return {items, misses, total:0, hitCount, traceOnly:true};
}
function buildResultZoneBlock(references){
  const out = [];
  out.push("A. VÙNG THAM CHIẾU ĐÃ TẠO");
  let any = false;
  for(const region of ["MN","MT","HN"]){
    const data = references && references[region];
    if(!data || !Object.keys(data).length) continue;
    any = true;
    out.push("");
    out.push(`[${region}]`);
    for(const [source,r] of Object.entries(data)){
      out.push(source);
      out.push(`full=${traceJoin(r.full || [])}`);
      out.push(`suffix2=${traceJoin(r.suffix2 || [])}`);
      out.push(`leading2=${traceJoin(r.leading2 || [])}`);
      out.push(`trailing2=${traceJoin(r.trailing2 || [])}`);
      out.push(`suffix3=${traceJoin(r.suffix3 || [])}`);
      out.push(`xcdau=${traceJoin(r.leading3 || [])}`);
      out.push(`xcduoi=${traceJoin(r.trailing3 || [])}`);
      out.push(`xc=${traceJoin(r.edge3 || [])}`);
      out.push(`suffix4=${traceJoin(r.suffix4 || [])}`);
      out.push("");
    }
  }
  if(!any) out.push("Chưa có vùng tham chiếu hoặc hệ thống chưa đọc được dữ liệu tham chiếu.");
  return out.join("\n").trim();
}
function buildAtomicInputBlock(rows){
  const out = [];
  out.push("B. DỮ LIỆU ĐẦU VÀO ĐÃ TÁCH");
  let count = 0;
  for(const row of rows || []){
    if(!row.calc) continue;
    count++;
    out.push(`${count}. ${row.region || ""} | ${row.block} | ${row.line} | số=${(row.nums || []).join(".")} | loại=${row.type} | n=${fmtN(row.n)} | vùng=${row.sourceCount || 1}`);
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
    out.push(`${idx+1}. ${item.row.region || ""} | ${item.block} | ${item.line} | số=${nums} | xét=${item.zone} | lượt khớp=${item.hit}`);
    out.push(`   vùng=${traceJoin(item.values || [])}`);
  });
  return out.join("\n").trim();
}
function buildMatchReport(pack, references, rows){
  const out = [];
  out.push(SEQ_DATA_TRACE_BUILD);
  out.push("CHẾ ĐỘ: PHÂN TÍCH DỮ LIỆU, KHÔNG NHÂN GIÁ TRỊ, KHÔNG GOM");
  out.push(`Tổng phần tử phù hợp: ${((pack && pack.items) || []).length} dòng | Không phù hợp: ${((pack && pack.misses) || []).length} dòng`);
  out.push("");
  out.push(buildResultZoneBlock(references));
  out.push("");
  out.push(buildAtomicInputBlock(rows));
  out.push("");
  out.push(buildAtomicDecisionSection("C. PHÙ HỢP — TÁCH RIÊNG TỪNG CON", (pack && pack.items) || []));
  out.push("");
  out.push(buildAtomicDecisionSection("D. KHÔNG PHÙ HỢP — TÁCH RIÊNG TỪNG CON", (pack && pack.misses) || []));
  return out.join("\n").trim();
}
function buildMatchStepTrace(rows, references, pack){
  return buildMatchReport(pack, references, rows);
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
    setVal("printOutput", buildCopyFast(blocks, total));
    setVal("inputValue", money(total));

    const tk = buildTach(blocks);
    setVal("processedOutput", tk.tach);
    setVal("unchangedOutput", tk.khong);
    scrollTextTop("processedOutput");
    scrollTextTop("unchangedOutput");

    const referencePack = parseAllReferences(rows);
    const pack = evaluateMatches(rows, referencePack);

    // Chế độ trace: không dùng ô Phù hợp tổng để đếm hit nữa, tránh hiểu nhầm 1 con/2 con.
    // Nguồn kiểm đúng là bảng matchedOutput bên dưới: vùng tham chiếu + atomic + phù hợp/không phù hợp.
    setVal("matchedValue", "Xem bảng");
    setVal("remainingValue", money(total));
    setVal("matchedOutput", buildMatchReport(pack, referencePack, rows));
    setVal("auditDetail", buildMatchStepTrace(rows, referencePack, pack));
    scrollTextTop("matchedOutput");
  }catch(err){
    console.error(err);
    setVal("inputValue", "Lỗi chạy: " + (err && err.message ? err.message : err));
  }
}

/* V0.5.67 - ATOMIC CONDITION VALUE ENGINE
   Khóa lỗi: 707b1n.xc5n phải tách thành 707b1n + 707xc5n.
   Xét theo vùng atomic, phù hợp tách riêng từng con, sau đó mới nhân hệ số từng dòng.
*/
const SEQ_ATOMIC_MATCH_BUILD = "Xử lý dữ liệu chuỗi v0.5.67 — xử lý giá trị theo từng phần tử — bộ nhớ đệm 5644";

function parseDataLine(line){
  const s = normalizeLine(line);
  if(!s) return null;

  // Dạng ghép cặp trực tiếp vẫn đọc thẳng.
  const pairOnly = s.match(/^([0-9.]+)(da|dv)([\d,.]+)n$/i);
  if(pairOnly){
    return [{nums:parseNums(pairOnly[1]), type:pairOnly[2].toLowerCase(), n:parseAmount(pairOnly[3]), source:s}];
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

function atomicMatchValue(row, hit){
  const coef = matchWeightForRow(row);
  const n = Number(row && row.n || 0);
  return {coef, n, amount: hit > 0 ? hit * n * coef : 0};
}

function evaluateMatches(rows, references){
  const items = [];
  const misses = [];
  let total = 0;
  let hitCount = 0;

  if(!hasAnyReferences(references)) return {items, misses, total:0, hitCount:0, traceOnly:false};

  for(const row of rows || []){
    if(!row || !row.calc) continue;
    const ev = matchZoneForAtomic(row, references);
    if(!ev) continue;

    const hit = Number(ev.hit || 0);
    const calc = atomicMatchValue(row, hit);
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

function buildMatchValueSection(items){
  const out = [];
  out.push("PHÙ HỢP — TÁCH RIÊNG TỪNG CON");
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
  out.push("KHÔNG PHÙ HỢP — TÁCH RIÊNG TỪNG CON");
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
    out.push(`${item.line} | xét=${item.zone || ""} | lượt khớp=0`);
  }
  return out.join("\n").trim();
}

function buildAtomicAuditBlock(rows, pack){
  const out = [];
  out.push("KIỂM TỪNG PHẦN TỬ");
  out.push(buildAtomicInputBlock(rows));
  out.push("");
  out.push(buildAtomicDecisionSection("ĐỐI CHIẾU PHÙ HỢP", (pack && pack.items) || []));
  out.push("");
  out.push(buildAtomicDecisionSection("ĐỐI CHIẾU KHÔNG PHÙ HỢP", (pack && pack.misses) || []));
  return out.join("\n").trim();
}

function buildMatchReport(pack, references, rows){
  const out = [];
  out.push(SEQ_ATOMIC_MATCH_BUILD);
  out.push("CHẾ ĐỘ: TÁCH TỪNG PHẦN TỬ → XÉT THEO VÙNG → TÍNH GIÁ TRỊ TỪNG PHẦN, KHÔNG GỘP NHÓM TƯƠNG THÍCH");
  out.push(`Tổng phần tử phù hợp: ${((pack && pack.items) || []).length} dòng | Tổng lượt khớp: ${(pack && pack.hitCount) || 0} | Tổng giá trị phù hợp: ${money((pack && pack.total) || 0)}`);
  out.push("");
  out.push(buildMatchValueSection((pack && pack.items) || []));
  out.push("");
  out.push(buildMissSection((pack && pack.misses) || []));
  out.push("");
  out.push(buildResultZoneBlock(references));
  out.push("");
  out.push(buildAtomicAuditBlock(rows, pack));
  return out.join("\n").trim();
}

function buildMatchStepTrace(rows, references, pack){
  return buildMatchReport(pack, references, rows);
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
    setVal("printOutput", buildCopyFast(blocks, total));
    setVal("inputValue", money(total));

    const tk = buildTach(blocks);
    setVal("processedOutput", tk.tach);
    setVal("unchangedOutput", tk.khong);
    scrollTextTop("processedOutput");
    scrollTextTop("unchangedOutput");

    const referencePack = parseAllReferences(rows);
    const pack = evaluateMatches(rows, referencePack);

    setVal("matchedValue", money(pack.total || 0));
    setVal("remainingValue", money(total - (pack.total || 0)));
    setVal("matchedOutput", buildMatchReport(pack, referencePack, rows));
    setVal("auditDetail", buildMatchStepTrace(rows, referencePack, pack));
    scrollTextTop("matchedOutput");
  }catch(err){
    console.error(err);
    setVal("inputValue", "Lỗi chạy: " + (err && err.message ? err.message : err));
  }
}


/* V0.5.68 - ATOMIC ZONE OUTPUT ONLY
   Khóa lại đúng yêu cầu hiện tại: chưa gắn công thức giá trị ở vùng xét tham chiếu.
   Luồng: input -> atomic -> vùng tham chiếu -> output phù hợp/không phù hợp từng con.
   707b1n.xc5n phải ra output phù hợp 2 dòng: 707b1n và 707xc5n.
*/
const SEQ_ATOMIC_OUTPUT_BUILD = "Xử lý dữ liệu chuỗi v0.5.68 — xuất dữ liệu theo từng phần tử — bộ nhớ đệm 5645";

function evaluateMatches(rows, references){
  const items = [];
  const misses = [];
  let hitCount = 0;
  if(!hasAnyReferences(references)) return {items, misses, total:0, hitCount:0, traceOnly:true};

  for(const row of rows || []){
    if(!row || !row.calc) continue;
    const ev = matchZoneForAtomic(row, references);
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
  out.push("KIỂM TỪNG PHẦN TỬ");
  out.push(buildAtomicInputBlock(rows));
  out.push("");
  out.push(buildAtomicDecisionSection("ĐỐI CHIẾU PHÙ HỢP", (pack && pack.items) || []));
  out.push("");
  out.push(buildAtomicDecisionSection("ĐỐI CHIẾU KHÔNG PHÙ HỢP", (pack && pack.misses) || []));
  return out.join("\n").trim();
}

function buildMatchReport(pack, references, rows){
  const out = [];
  out.push(SEQ_ATOMIC_OUTPUT_BUILD);
  out.push("CHẾ ĐỘ: KIỂM TỪNG PHẦN TỬ, KHÔNG TÍNH GIÁ TRỊ, KHÔNG GOM");
  out.push(`Tổng phần tử phù hợp: ${((pack && pack.items) || []).length} dòng | Không phù hợp: ${((pack && pack.misses) || []).length} dòng`);
  out.push("");
  out.push(buildAtomicPlainOutput("DỮ LIỆU PHÙ HỢP", (pack && pack.items) || []));
  out.push("");
  out.push(buildAtomicPlainOutput("DỮ LIỆU KHÔNG PHÙ HỢP", (pack && pack.misses) || []));
  out.push("");
  out.push(buildResultZoneBlock(references));
  out.push("");
  out.push(buildAtomicAuditShort(rows, pack));
  return out.join("\n").trim();
}

function buildMatchStepTrace(rows, references, pack){
  return buildMatchReport(pack, references, rows);
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
    setVal("printOutput", buildCopyFast(blocks, total));
    setVal("inputValue", money(total));

    const tk = buildTach(blocks);
    setVal("processedOutput", tk.tach);
    setVal("unchangedOutput", tk.khong);
    scrollTextTop("processedOutput");
    scrollTextTop("unchangedOutput");

    const referencePack = parseAllReferences(rows);
    const pack = evaluateMatches(rows, referencePack);

    // Không hiển thị giá trị phù hợp ở bước kiểm vùng xét. Nguồn kiểm là DỮ LIỆU PHÙ HỢP trong matchedOutput.
    setVal("matchedValue", "Xem dữ liệu");
    setVal("remainingValue", money(total));
    setVal("matchedOutput", buildMatchReport(pack, referencePack, rows));
    setVal("auditDetail", buildMatchStepTrace(rows, referencePack, pack));
    scrollTextTop("matchedOutput");
  }catch(err){
    console.error(err);
    setVal("inputValue", "Lỗi chạy: " + (err && err.message ? err.message : err));
  }
}

/* V0.5.69 - FINAL OUTPUT DISPLAY ONLY
   Panel Dữ liệu phù hợp chỉ hiển thị tham chiếu phù hợp/không phù hợp theo atomic.
   Không in vùng tham chiếu, không in bảng audit, không tính giá trị tại panel này.
*/
const SEQ_ATOMIC_DISPLAY_BUILD = "Xử lý dữ liệu chuỗi v0.5.70 — sửa thứ tự tham chiếu HN — bộ nhớ đệm 5647";

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

function buildAtomicDebugOnly(rows, references, pack){
  const out = [];
  out.push(SEQ_ATOMIC_DISPLAY_BUILD);
  out.push("");
  out.push(buildAtomicInputBlock(rows));
  out.push("");
  out.push(buildAtomicDecisionSection("ĐỐI CHIẾU PHÙ HỢP", (pack && pack.items) || []));
  out.push("");
  out.push(buildAtomicDecisionSection("ĐỐI CHIẾU KHÔNG PHÙ HỢP", (pack && pack.misses) || []));
  out.push("");
  out.push(buildResultZoneBlock(references));
  return out.join("\n").trim();
}

function buildMatchReport(pack){
  return [
    buildAtomicOutputOnly("PHÙ HỢP", (pack && pack.items) || []),
    "",
    buildAtomicOutputOnly("KHÔNG PHÙ HỢP", (pack && pack.misses) || [])
  ].join("\n").trim();
}

function buildMatchStepTrace(rows, references, pack){
  return buildAtomicDebugOnly(rows, references, pack);
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
    setVal("printOutput", buildCopyFast(blocks, total));
    setVal("inputValue", money(total));

    const tk = buildTach(blocks);
    setVal("processedOutput", tk.tach);
    setVal("unchangedOutput", tk.khong);
    scrollTextTop("processedOutput");
    scrollTextTop("unchangedOutput");

    const referencePack = parseAllReferences(rows);
    const pack = evaluateMatches(rows, referencePack);

    setVal("matchedValue", "Xem dữ liệu");
    setVal("remainingValue", money(total));
    setVal("matchedOutput", buildMatchReport(pack));
    setVal("auditDetail", buildMatchStepTrace(rows, referencePack, pack));
    scrollTextTop("matchedOutput");
  }catch(err){
    console.error(err);
    setVal("inputValue", "Lỗi chạy: " + (err && err.message ? err.message : err));
  }
}



/* V0.5.72 - ATOMIC CONDITION VALUE DISPLAY NO HEADER
   Nguồn đúng đã khóa: vùng PHÙ HỢP atomic.
   Panel Dữ liệu phù hợp chỉ hiện các dòng phù hợp theo block, không hiện tiêu đề PHÙ HỢP, không hiện KHÔNG PHÙ HỢP.
   Sau khi atomic phù hợp, đếm hit của số trong vùng xét rồi nhân n và hệ số tương ứng.
   Các nhóm tương thích được giữ riêng từng dòng, không gộp chung.
*/
const SEQ_ATOMIC_MATCH_DISPLAY_BUILD = "Xử lý dữ liệu chuỗi v0.5.72 — hiển thị giá trị phù hợp theo từng phần tử — bộ nhớ đệm 5649";

function atomicValueForMatchItem(row, hit){
  const coef = matchWeightForRow(row);
  const n = Number(row && row.n || 0);
  const amount = hit > 0 ? hit * n * coef : 0;
  return {coef, n, amount};
}

function evaluateMatches(rows, references){
  const items = [];
  const misses = [];
  let total = 0;
  let hitCount = 0;

  if(!hasAnyReferences(references)) return {items, misses, total:0, hitCount:0};

  for(const row of rows || []){
    if(!row || !row.calc) continue;
    const ev = matchZoneForAtomic(row, references);
    if(!ev) continue;

    const hit = Number(ev.hit || 0);
    const calc = atomicValueForMatchItem(row, hit);
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

function buildMatchValueOutputOnly(pack){
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
  out.push(`Giá trị phù hợp=${money((pack && pack.total) || 0)}`);
  return out.join("\n").trim();
}

function buildMatchValueDebug(rows, references, pack){
  const out = [];
  out.push(SEQ_ATOMIC_MATCH_DISPLAY_BUILD);
  out.push("");
  out.push("A. DỮ LIỆU PHÙ HỢP ĐANG HIỂN THỊ");
  out.push(buildMatchValueOutputOnly(pack));
  out.push("");
  out.push("B. DỮ LIỆU ĐẦU VÀO ĐÃ TÁCH");
  out.push(buildAtomicInputBlock(rows));
  out.push("");
  out.push("C. ĐỐI CHIẾU PHÙ HỢP + GIÁ TRỊ");
  const items = (pack && pack.items) || [];
  if(!items.length){
    out.push("Trống");
  }else{
    items.forEach((item, idx)=>{
      const nums = item.row && item.row.nums ? item.row.nums.join(".") : "";
      out.push(`${idx+1}. ${item.row.region || ""} | ${item.block} | ${item.line} | số=${nums} | xét=${item.zone} | lượt khớp=${item.hit} | n=${fmtN(item.n)} | hệ số quy đổi=${item.coef} | giá trị=${money(item.amount)}`);
      out.push(`   vùng=${traceJoin(item.values || [])}`);
    });
  }
  out.push("");
  out.push(buildResultZoneBlock(references));
  return out.join("\n").trim();
}

function buildMatchReport(pack){
  return buildMatchValueOutputOnly(pack);
}

function buildMatchStepTrace(rows, references, pack){
  return buildMatchValueDebug(rows, references, pack);
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
    setVal("printOutput", buildCopyFast(blocks, total));
    setVal("inputValue", money(total));

    const tk = buildTach(blocks);
    setVal("processedOutput", tk.tach);
    setVal("unchangedOutput", tk.khong);
    scrollTextTop("processedOutput");
    scrollTextTop("unchangedOutput");

    const referencePack = parseAllReferences(rows);
    const pack = evaluateMatches(rows, referencePack);

    setVal("matchedValue", money(pack.total || 0));
    setVal("remainingValue", money(total - (pack.total || 0)));
    setVal("matchedOutput", buildMatchReport(pack));
    setVal("auditDetail", buildMatchStepTrace(rows, referencePack, pack));
    scrollTextTop("matchedOutput");
  }catch(err){
    console.error(err);
    setVal("inputValue", "Lỗi chạy: " + (err && err.message ? err.message : err));
  }
}


/* V0.5.73 - MN/MT DA/DV JOINT ZONE MIN HIT
   Khóa rule mới:
   - Với ghép cặp/DV MN, MT trên block nhiều vùng: tạo vùng suffix2 CHUNG của toàn bộ vùng trong block.
   - Hit cặp = min(countA trong vùng chung, countB trong vùng chung).
   - Không xét chéo từng hướng vùng 1/vùng 2 nữa.
   - Áp dụng cho MN và MT. HN giữ rule cũ theo từng vùng HN.
*/
const SEQ_PAIR_JOINT_ZONE_BUILD = "Xử lý dữ liệu chuỗi v0.5.75 — giữ đủ tên nguồn ghép khi in — bộ nhớ đệm 5652";

function jointSuffix2ForSources(references, region, sources){
  const values = [];
  const labels = [];
  for(const source of (sources || [])){
    const r = referenceFor(references, region, source);
    const arr = r ? (r.suffix2 || []) : [];
    values.push(...arr);
    labels.push(`${source}=${traceJoin(arr)}`);
  }
  return {values, labels};
}

function isJointPairRow(row, region, sources){
  return row && row.type === "da" && region !== "HN" && (row.sourceCount || 1) >= 2 && (sources || []).length >= 2;
}

function calcPairHitByJointZone(row, references, region, sources){
  const nums = row.nums || [];
  if(nums.length < 2){
    return {hit:0, zone:"ghép cặp", values:[], note:"thiếu cặp số"};
  }
  const a = nums[0], b = nums[1];
  const joint = jointSuffix2ForSources(references, region, sources);
  const ca = countExact(joint.values, a);
  const cb = countExact(joint.values, b);
  const hit = (a === b) ? Math.floor(ca / 2) : Math.min(ca, cb);
  return {
    hit,
    zone:`${(sources || []).join("")}.suffix2 chung MN/MT`,
    values:joint.labels,
    note:`${a}.${b} | ${a}=${ca}, ${b}=${cb}, min=${hit}`
  };
}

function calcPairHitByLegacyDirection(row, references, region, sources){
  const nums = row.nums || [];
  if(nums.length < 2){
    return {hit:0, zone:"ghép cặp", values:[], note:"thiếu cặp số"};
  }
  const a = nums[0], b = nums[1];
  if((row.sourceCount || 1) >= 2 && sources.length >= 2){
    const r1 = referenceFor(references, region, sources[0]);
    const r2 = referenceFor(references, region, sources[1]);
    const v1 = r1 ? (r1.suffix2 || []) : [];
    const v2 = r2 ? (r2.suffix2 || []) : [];
    const ab = Math.min(countExact(v1, a), countExact(v2, b));
    const ba = (a === b) ? 0 : Math.min(countExact(v1, b), countExact(v2, a));
    return {hit:ab + ba, zone:`ghép cặp 2 vùng: ${sources[0]}.suffix2 + ${sources[1]}.suffix2`, values:[`${sources[0]}=${traceJoin(v1)}`, `${sources[1]}=${traceJoin(v2)}`], note:`${a}.${b}`};
  }
  const r = referenceFor(references, region, sources[0]);
  const values = r ? (r.suffix2 || []) : [];
  const ca = countExact(values, a);
  const cb = countExact(values, b);
  const hit = (a === b) ? Math.floor(ca / 2) : Math.min(ca, cb);
  return {hit, zone:`${sources[0] || row.block}.suffix2`, values, note:`${a}.${b}`};
}

function matchZoneForAtomic(row, references){
  if(!row || !row.calc) return null;
  const t = row.type;
  const region = row.region || "MN";
  const sources = getSourcesFromName(row.block);
  const nums = row.nums || [];
  const num = nums[0] || "";
  const len = String(num).length;

  if(t === "da"){
    const ev = isJointPairRow(row, region, sources)
      ? calcPairHitByJointZone(row, references, region, sources)
      : calcPairHitByLegacyDirection(row, references, region, sources);
    return {row, zone:ev.zone, values:ev.values || [], hit:ev.hit || 0, note:ev.note || ""};
  }

  const source = sources[0] || row.block;
  const r = referenceFor(references, region, source);
  if(!r) return {row, zone:`${source}.thiếu_kết_quả`, values:[], hit:0, note:num};

  let zone = "";
  let values = [];
  let hit = 0;
  if(t === "b"){
    if(len === 2){ zone = `${source}.suffix2`; values = r.suffix2 || []; hit = countExact(values, num); }
    else if(len === 3){ zone = `${source}.suffix3`; values = r.suffix3 || []; hit = countExact(values, num); }
    else if(len === 4){ zone = `${source}.suffix4`; values = r.suffix4 || []; hit = countExact(values, num); }
  }else if(t === "bdao"){
    if(len === 3){ zone = `${source}.suffix3 đảo`; values = r.suffix3 || []; hit = countPerm(values, num); }
    else if(len === 4){ zone = `${source}.suffix4 đảo`; values = r.suffix4 || []; hit = countPerm(values, num); }
  }else if(t === "dd"){
    zone = `${source}.leading2 + ${source}.trailing2`;
    values = [`leading2=${traceJoin(r.leading2 || [])}`, `trailing2=${traceJoin(r.trailing2 || [])}`];
    hit = countExact(r.leading2 || [], num) + countExact(r.trailing2 || [], num);
  }else if(t === "dau"){
    zone = `${source}.leading2`;
    values = r.leading2 || [];
    hit = countExact(values, num);
  }else if(t === "duoi"){
    zone = `${source}.trailing2`;
    values = r.trailing2 || [];
    hit = countExact(values, num);
  }else if(t === "xc"){
    zone = `${source}.xc = xcdau + xcduoi`;
    values = r.edge3 || [];
    hit = countExact(values, num);
  }else if(t === "xcdau"){
    zone = `${source}.xcdau`;
    values = r.leading3 || [];
    hit = countExact(values, num);
  }else if(t === "xcduoi"){
    zone = `${source}.xcduoi`;
    values = r.trailing3 || [];
    hit = countExact(values, num);
  }else if(t === "xcdao"){
    zone = `${source}.xc đảo = xcdau + xcduoi đảo`;
    values = [`xcdau=${traceJoin(r.leading3 || [])}`, `xcduoi=${traceJoin(r.trailing3 || [])}`];
    hit = countPerm(r.leading3 || [], num) + countPerm(r.trailing3 || [], num);
  }else{
    zone = `${source}.không_rõ_loại`;
  }
  return {row, zone, values, hit, note:num};
}

function evaluateRowMatch(row, references){
  if(!row || !row.calc || !hasAnyReferences(references)) return null;
  const ev = matchZoneForAtomic(row, references);
  if(!ev) return null;
  const coef = matchWeightForRow(row);
  const n = Number(row.n || 0);
  const hit = Number(ev.hit || 0);
  return {hit, coef, amount: hit > 0 ? hit * n * coef : 0, zone:ev.zone, values:ev.values || []};
}

function buildMatchValueDebug(rows, references, pack){
  const out = [];
  out.push(SEQ_PAIR_JOINT_ZONE_BUILD);
  out.push("");
  out.push("A. DỮ LIỆU PHÙ HỢP ĐANG HIỂN THỊ");
  out.push(buildMatchValueOutputOnly(pack));
  out.push("");
  out.push("B. DỮ LIỆU ĐẦU VÀO ĐÃ TÁCH");
  out.push(buildAtomicInputBlock(rows));
  out.push("");
  out.push("C. ĐỐI CHIẾU PHÙ HỢP + GIÁ TRỊ");
  const items = (pack && pack.items) || [];
  if(!items.length){
    out.push("Trống");
  }else{
    items.forEach((item, idx)=>{
      const nums = item.row && item.row.nums ? item.row.nums.join(".") : "";
      out.push(`${idx+1}. ${item.row.region || ""} | ${item.block} | ${item.line} | số=${nums} | xét=${item.zone} | lượt khớp=${item.hit} | n=${fmtN(item.n)} | hệ số quy đổi=${item.coef} | giá trị=${money(item.amount)}`);
      if(item.note) out.push(`   note=${item.note}`);
      out.push(`   vùng=${traceJoin(item.values || [])}`);
    });
  }
  out.push("");
  out.push(buildResultZoneBlock(references));
  return out.join("\n").trim();
}


/* V0.5.73b - GENERIC MÃ VÙNG TỔNG QUÁT — GỢI Ý THAM CHIẾU
   Khi input dùng 2dmn/3dmn/2dmt/3dmt và vùng tham chiếu đã dán có tên nguồn,
   ưu tiên suy ra ngày/vùng theo vùng tham chiếu đó trước khi rơi về ngày hiện tại.
*/
function collectReferenceSourceHintsForRegion(region){
  const ids = regionRelatedIds(region);
  const texts = [];
  const saved = val(ids.reference || "");
  if(saved && saved.trim()) texts.push(saved);
  const active = val("activeReferenceData");
  if(active && active.trim() && activeWorkspace === region) texts.push(active);
  const seen = new Set();
  const out = [];
  for(const text of texts){
    const lines = String(text || "").split(/\n+/).map(x=>x.trim()).filter(Boolean);
    for(const line of lines){
      const source = findSourceInLine(line);
      if(source && !seen.has(source)){
        seen.add(source);
        out.push(source);
      }
    }
  }
  return out;
}

function genericSourceHintsForHeader(raw, lastExplicit){
  const l = normalizeLine(raw).toLowerCase();
  if(lastExplicit && lastExplicit.length) return lastExplicit;
  if(/^[234]dmn$/.test(l)) return collectReferenceSourceHintsForRegion("MN");
  if(/^[23]dmt$/.test(l)) return collectReferenceSourceHintsForRegion("MT");
  return lastExplicit || [];
}

function splitBlocks(text){
  const lines = (text||"").split(/\n+/).map(x=>x.trim()).filter(Boolean);
  const blocks=[]; let cur=null; let lastExplicit=[];
  for(const raw of lines){
    if(isHeader(raw)){
      const hints = genericSourceHintsForHeader(raw, lastExplicit);
      cur = resolveHeader(raw, hints);
      blocks.push(cur);
      if(!cur.generic) lastExplicit = cur.sources;
    }else{
      if(!cur){
        cur = {raw:"Không rõ vùng", name:"Không rõ vùng", sources:["Không rõ vùng"], region:"MN", primarySources:["Không rõ vùng"], generic:false, lines:[]};
        blocks.push(cur);
      }
      cur.lines.push(normalizeLine(raw));
    }
  }
  return blocks;
}


/* V0.5.75 - PRESERVE FULL MULTI-STATION NAME IN PRINT OUTPUT
   Lỗi đã khóa:
   - Header explicit ghép nhiều vùng như LanBphuoc không được rơi mất vùng khi tạo printOutput/In.
   - Tên in phải lấy đủ danh sách vùng từ header gốc, rồi sắp theo thứ tự lịch chuẩn.
   - Giữ nguyên fix v0.5.74: tên block sau atomic cũng theo thứ tự lịch chuẩn.
*/
const SEQ_PRINT_MULTI_SOURCE_BUILD = "Xử lý dữ liệu chuỗi v0.5.75 — giữ đủ tên nguồn ghép khi in — bộ nhớ đệm 5652";

function scanCanonicalSourcesLeftToRight(name){
  const compact = cleanName(name).replace(/\s+/g, "");
  if(!compact) return [];
  const tokens = KNOWN_SOURCE_CODES
    .filter(source => source !== "HN")
    .slice()
    .sort((a,b)=>b.length - a.length);
  const out = [];
  let pos = 0;
  while(pos < compact.length){
    let matched = "";
    for(const source of tokens){
      const key = source.toLowerCase();
      if(compact.startsWith(key, pos)){
        matched = source;
        break;
      }
    }
    if(!matched) return [];
    out.push(matched);
    pos += matched.length;
  }
  return orderSourcesBySchedule(Array.from(new Set(out)));
}

function getSourcesFromName(name){
  if(!name) return [];
  const raw = String(name).trim();
  const lower = raw.toLowerCase();
  if(lower === "hn" || lower === "mb") return ["HN"];

  const mapped = mapSourceName(raw);
  if(mapped) return [mapped];

  const exact = scanCanonicalSourcesLeftToRight(raw);
  if(exact.length) return exact;

  const found = [];
  for(const d of KNOWN_SOURCE_CODES){
    if(d === "HN") continue;
    const idx = lower.indexOf(d.toLowerCase());
    if(idx >= 0) found.push({d, idx});
  }
  found.sort((a,b)=>{
    if(a.idx !== b.idx) return a.idx - b.idx;
    return b.d.length - a.d.length;
  });
  return found.length
    ? orderSourcesBySchedule(Array.from(new Set(found.map(item => item.d))))
    : [raw];
}

function canonicalPrintBlockName(block){
  if(!block) return "";
  const rawSources = scanCanonicalSourcesLeftToRight(block.raw || "");
  const sources = rawSources.length
    ? rawSources
    : orderSourcesBySchedule((block.sources || getSourcesFromName(block.name || "")).filter(Boolean));
  return sources.length ? sources.join("") : (block.name || block.raw || "");
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
   - 2dmn/3dmn/4dmn và 2dmt/3dmt không được kế thừa vùng explicit đứng trước.
   - Không dùng dữ liệu tham chiếu cũ để suy ra ngày cho header generic.
   - Mapping generic luôn lấy đúng lịch của ngày hiện tại trên thiết bị.
   Ví dụ thứ Bảy: 2dmn = TphoLan, dù block trước là Tpho.
*/
const SEQ_GENERIC_TODAY_BUILD = "Xử lý dữ liệu chuỗi v0.5.76 — ánh xạ theo lịch ngày hiện tại — bộ nhớ đệm 5653";

function resolveHeader(raw, sourceHints=[]){
  const l = normalizeLine(raw).toLowerCase();
  let sources;
  const today = dayIndex();

  if(l === "hn" || l === "mb") sources = ["HN"];
  else if(l === "2dmn") sources = (REGION_A_SCHEDULE[today] || []).slice(0,2);
  else if(l === "3dmn") sources = (REGION_A_SCHEDULE[today] || []).slice(0,3);
  else if(l === "4dmn") sources = (REGION_A_SCHEDULE[today] || []).slice(0,4);
  else if(l === "2dmt") sources = (REGION_B_SCHEDULE[today] || []).slice(0,2);
  else if(l === "3dmt") sources = (REGION_B_SCHEDULE[today] || []).slice(0,3);
  else sources = getSourcesFromName(raw.trim());

  const generic = /^(2dmn|3dmn|4dmn|2dmt|3dmt)$/i.test(l);
  return {
    raw: raw.trim(),
    name: sources.join(""),
    sources,
    region: detectRegionBySources(sources),
    primarySources: sources.slice(0,2),
    generic,
    lines: []
  };
}


/* V0.5.77 - COMPACT EXACT FOUR-STATION MN BLOCK
   Lỗi đã khóa:
   - Khi atomic regroup tạo đúng block đủ 4 vùng MN theo lịch, tiêu đề Dữ liệu đã xử lý/Không tách phải rút thành 4dmn.
   - Ví dụ thứ Bảy: TphoLanBphuocHgiang -> 4dmn.
   - Không đổi các block ghép không đúng đủ lịch chuẩn.
*/
const SEQ_COMPACT_PREFIX_BUILD = "Xử lý dữ liệu chuỗi v0.5.78 — rút gọn tiền tố vùng theo lịch ngày — bộ nhớ đệm 5655";


// v0.5.96: giữ nguyên logic xử lý theo vùng; chỉ chuẩn hóa toàn bộ nhãn hiển thị.

/* v0.5.96 / cache5671 — chuẩn hóa nhãn giao diện; giữ nguyên logic xử lý đã kiểm thử. */
/*
  Xử lý dữ liệu chuỗi v0.5.96 / cache5671
  Quy trình khóa:
  1) Tách mỗi block input thành từng atomic theo vùng.
  2) Bung dd -> dau + duoi; xc -> xcdau + xcduoi.
  3) Xét từng atomic với đúng dữ liệu tham chiếu của vùng tương ứng.
  4) Tách thành nhóm PHÙ HỢP / KHÔNG PHÙ HỢP.
  5) Chỉ gom lại dd hoặc xc khi hai atomic cùng trạng thái, cùng số, cùng mức và cùng vùng.
  6) Sau khi gom mới tách dòng tại ranh giới hậu tố hoàn chỉnh, tối đa 20 ký tự.
*/
(function installAtomicZonePatch(global){
  "use strict";

  const VERSION = "0.5.94";
  const CACHE = "5671";
  const MAX_LINE_LENGTH = 20;
  // Các mã ngắn dưới đây chỉ được giữ để đọc dữ liệu cũ; logic nội bộ và giao diện dùng thuật ngữ trung tính.
const LEGACY_TYPE_TOKEN_RE = "(bdao|xcdao|xcdau|xcduoi|duoi|dau|dd|dv|da|b|xc)";

  function atomicChildren(type){
    if(type === "dd") return ["dau", "duoi"];
    if(type === "xc") return ["xcdau", "xcduoi"];
    return [type];
  }

  function atomicWeight(type, region){
    const isRegionC = String(region || "MN") === "HN";
    if(type === "xcdau") return isRegionC ? 3 : 1;
    if(type === "xcduoi") return 1;
    if(type === "xc") return isRegionC ? 4 : 2;
    return null;
  }

  function cloneAtomicRow(row, type, groupKey, parentType){
    const nums = (row.nums || []).slice();
    const n = Number(row.n || 0);
    const line = typeof global.makeLine === "function"
      ? global.makeLine(nums.length === 1 ? nums[0] : nums, type, n)
      : `${nums.join(".")}${type}${String(n).replace(".",",")}n`;
    return {
      ...row,
      type,
      line,
      nums,
      atomicParentType: parentType,
      atomicGroupKey: groupKey,
      atomicExpanded: true
    };
  }

  function expandRowsByZone(rows){
    const out = [];
    (rows || []).forEach((row, index) => {
      if(!row || !row.calc){ out.push(row); return; }
      const children = atomicChildren(row.type);
      if(children.length === 1){ out.push(row); return; }
      const groupKey = [index, row.block, (row.nums || []).join("."), row.type, row.n, row.raw || ""].join("|");
      children.forEach(type => out.push(cloneAtomicRow(row, type, groupKey, row.type)));
    });
    return out;
  }

  function pairSpec(parentType){
    if(parentType === "dd") return ["dau", "duoi"];
    if(parentType === "xc") return ["xcdau", "xcduoi"];
    return null;
  }

  function mergePair(a, b, parentType){
    const base = a || b;
    const rowA = a && a.row ? a.row : null;
    const rowB = b && b.row ? b.row : null;
    const row = rowA || rowB || {};
    const nums = (row.nums || []).slice();
    const n = Number(row.n || 0);
    const line = typeof global.makeLine === "function"
      ? global.makeLine(nums.length === 1 ? nums[0] : nums, parentType, n)
      : `${nums.join(".")}${parentType}${String(n).replace(".",",")}n`;
    const mergedRow = {...row, type:parentType, line, nums, atomicCompacted:true};
    return {
      ...base,
      row: mergedRow,
      block: mergedRow.block || base.block,
      line,
      hit: Number((a && a.hit) || 0) + Number((b && b.hit) || 0),
      amount: Number((a && a.amount) || 0) + Number((b && b.amount) || 0),
      zone: parentType === "xc" ? "xcdau + xcduoi" : "dau + duoi",
      values: [].concat((a && a.values) || [], (b && b.values) || []),
      atomicCompacted: true
    };
  }

  function compactConditionItems(items){
    const out = [];
    const groups = new Map();
    (items || []).forEach((item, index) => {
      const row = item && item.row;
      if(!row || !row.atomicGroupKey || !row.atomicParentType){
        out.push({index, item});
        return;
      }
      const key = row.atomicGroupKey;
      if(!groups.has(key)) groups.set(key, {index, parentType:row.atomicParentType, byType:{}});
      const group = groups.get(key);
      group.index = Math.min(group.index, index);
      group.byType[row.type] = item;
    });

    for(const group of groups.values()){
      const spec = pairSpec(group.parentType);
      if(!spec){
        Object.values(group.byType).forEach(item => out.push({index:group.index, item}));
        continue;
      }
      const a = group.byType[spec[0]];
      const b = group.byType[spec[1]];
      if(a && b){
        out.push({index:group.index, item:mergePair(a,b,group.parentType)});
      }else{
        if(a) out.push({index:group.index, item:a});
        if(b) out.push({index:group.index, item:b});
      }
    }
    return out.sort((x,y)=>x.index-y.index).map(x=>x.item);
  }

  function compactPack(pack){
    const source = pack || {};
    const items = compactConditionItems(source.items || []);
    const misses = compactConditionItems(source.misses || []);
    const total = items.reduce((sum,item)=>sum + Number(item.amount || 0), 0);
    const hitCount = items.reduce((sum,item)=>sum + Number(item.hit || 0), 0);
    return {...source, items, misses, total: source.traceOnly ? 0 : total, hitCount};
  }

  function parseCompositeLine(line){
    const source = String(line || "").trim();
    const firstType = new RegExp("^([0-9.]+?)(" + LEGACY_TYPE_TOKEN_RE.slice(1,-1) + ")", "i");
    const head = source.match(firstType);
    if(!head) return null;
    const numberPrefix = head[1].replace(/\.$/, "");
    const suffixPart = source.slice(head[1].length);
    const tokenRe = new RegExp("\\.?(" + LEGACY_TYPE_TOKEN_RE.slice(1,-1) + ")([\\d,.]+)n", "gi");
    const tokens = [];
    let match, consumed = "";
    while((match = tokenRe.exec(suffixPart))){
      tokens.push({type:String(match[1]).toLowerCase(), amount:match[2], raw:String(match[1]).toLowerCase()+match[2]+"n"});
      consumed += match[0];
    }
    if(!tokens.length || consumed.replace(/^\./,"") !== suffixPart.replace(/^\./,"")) return null;
    return {numberPrefix, tokens, source};
  }

  function buildCompositeLine(numberPrefix, tokens){
    return numberPrefix + (tokens || []).map((t,i)=>(i?".":"")+t.raw).join("");
  }

  function preferredSegments(tokens){
    const used = new Set(), segments = [];
    const take = types => {
      const items=[];
      tokens.forEach((t,i)=>{ if(!used.has(i) && types.includes(t.type)){ used.add(i); items.push(t); } });
      if(items.length) segments.push(items);
    };
    take(["b","bdao"]);
    take(["xc","xcdao"]);
    tokens.forEach((t,i)=>{ if(!used.has(i)) segments.push([t]); });
    return segments;
  }

  function splitCompositeLine(line, maxLen=MAX_LINE_LENGTH){
    const parsed = parseCompositeLine(line);
    if(!parsed || parsed.source.length <= maxLen) return [String(line || "")];
    const segments=[];
    preferredSegments(parsed.tokens).forEach(segment=>{
      if(buildCompositeLine(parsed.numberPrefix,segment).length <= maxLen){ segments.push(segment); return; }
      let cur=[];
      segment.forEach(token=>{
        const next=cur.concat(token);
        if(cur.length && buildCompositeLine(parsed.numberPrefix,next).length > maxLen){ segments.push(cur); cur=[token]; }
        else cur=next;
      });
      if(cur.length) segments.push(cur);
    });
    const packed=[]; let cur=[];
    segments.forEach(segment=>{
      const next=cur.concat(segment);
      if(cur.length && buildCompositeLine(parsed.numberPrefix,next).length > maxLen){ packed.push(cur); cur=segment.slice(); }
      else cur=next;
    });
    if(cur.length) packed.push(cur);
    return packed.map(tokens=>buildCompositeLine(parsed.numberPrefix,tokens));
  }

  function splitCompositeText(text, maxLen=MAX_LINE_LENGTH){
    const out=[];
    String(text || "").replace(/\r/g,"").split("\n").forEach(raw=>{
      const trimmed=raw.trim();
      if(/^\d/.test(trimmed)) out.push(...splitCompositeLine(trimmed,maxLen));
      else out.push(raw);
    });
    return out.join("\n").trim();
  }

  const baseBuildIntermediate = global.buildIntermediate;
  if(typeof baseBuildIntermediate === "function"){
    global.buildIntermediate = function(){ return expandRowsByZone(baseBuildIntermediate.apply(this,arguments)); };
  }

  const baseCalcRow = global.calcRow;
  if(typeof baseCalcRow === "function"){
    global.calcRow = function(row){
      const weight = row && row.calc ? atomicWeight(row.type,row.region) : null;
      if(weight != null){
        const scaleFactor = typeof global.getRate === "function" ? Number(global.getRate()) : 0.8;
        return weight * Number(row.n || 0) * scaleFactor;
      }
      return baseCalcRow.apply(this,arguments);
    };
  }

  const baseEvaluateMatches = global.evaluateMatches;
  if(typeof baseEvaluateMatches === "function"){
    global.evaluateMatches = function(){ return compactPack(baseEvaluateMatches.apply(this,arguments)); };
  }

  const baseBuildTach = global.buildTach;
  if(typeof baseBuildTach === "function"){
    global.buildTach = function(){
      const result = baseBuildTach.apply(this,arguments) || {};
      return {...result, tach:splitCompositeText(result.tach), khong:splitCompositeText(result.khong)};
    };
  }

  global.SEQUENCE_NEUTRAL_ENGINE_V0595 = {
    version:VERSION, cache:CACHE, status:"BẢN LƯU VÙNG ĐÃ XỬ LÝ VÀ GHÉP DỮ LIỆU ĐÃ KIỂM THỬ",
    atomicChildren, atomicWeight, expandRowsByZone, compactConditionItems, compactPack,
    splitCompositeLine, splitCompositeText, maxLineLength:MAX_LINE_LENGTH
  };
})(typeof window !== "undefined" ? window : globalThis);




/* v0.5.96 - LƯU PHẦN ĐÃ XỬ LÝ KHI BẤM TÁCH
   - Bấm Tách: chạy lại dữ liệu hiện tại, lưu phần bị tách vào ô Đã xử lý rồi mở bảng.
   - Phần Đã xử lý được lưu riêng trong trình duyệt và có nút Xóa.
*/
const PROCESSED_SPLIT_STORAGE_KEY = "sequence.v1.saved.processedSplit";

function saveProcessedSplitOutput(){
  const text = val("processedOutput");
  try{
    localStorage.setItem(PROCESSED_SPLIT_STORAGE_KEY, text);
    return true;
  }catch(e){
    console.error(e);
    return false;
  }
}

function loadProcessedSplitOutput(){
  try{
    const saved = localStorage.getItem(PROCESSED_SPLIT_STORAGE_KEY);
    if(saved !== null) setVal("processedOutput", saved);
  }catch(e){
    console.error(e);
  }
}

function openSplitPanelAndSave(){
  // Luôn chạy lại để phần lưu khớp chính xác dữ liệu đang nằm trong ô đầu vào.
  if(val("inputData").trim()) runAll();
  saveProcessedSplitOutput();
  toggleActionPanel("split");
  scrollTextTop("processedOutput");
  scrollTextTop("unchangedOutput");
}

function clearProcessedSplitOutput(btn){
  setVal("processedOutput", "");
  try{
    localStorage.removeItem(PROCESSED_SPLIT_STORAGE_KEY);
  }catch(e){
    console.error(e);
  }
  if(btn) flashActionButton(btn, "Đã xóa", "Xóa");
}

window.addEventListener("DOMContentLoaded", loadProcessedSplitOutput);




/* v0.5.96 - VÙNG ĐÃ XỬ LÝ ĐỘC LẬP VÀ GHÉP VỚI DỮ LIỆU MỚI
   Quy tắc trạng thái:
   1) Dữ liệu xét = vùng đã xử lý đã lưu + dữ liệu hiện có trong ô đầu vào.
   2) Bấm Tách: xét trên dữ liệu ghép, lưu phần Đã xử lý và đưa phần Giữ nguyên về ô đầu vào.
   3) Xóa ô đầu vào không làm mất vùng Đã xử lý.
   4) Xóa vùng Đã xử lý xóa cả hiển thị lẫn localStorage; không còn dữ liệu ẩn.
*/
function normalizeStoredDataText(text){
  return String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

function readProcessedSplitStorage(){
  try{
    return normalizeStoredDataText(localStorage.getItem(PROCESSED_SPLIT_STORAGE_KEY) || "");
  }catch(e){
    console.error(e);
    return "";
  }
}

function writeProcessedSplitStorage(text){
  const normalized = normalizeStoredDataText(text);
  try{
    if(normalized){
      localStorage.setItem(PROCESSED_SPLIT_STORAGE_KEY, normalized);
    }else{
      localStorage.removeItem(PROCESSED_SPLIT_STORAGE_KEY);
    }
  }catch(e){
    console.error(e);
  }
  setVal("processedOutput", normalized);
  return normalized;
}

function joinProcessedAndCurrentInput(processedText, currentText){
  const parts = [normalizeStoredDataText(processedText), normalizeStoredDataText(currentText)].filter(Boolean);
  return parts.join("\n\n").trim();
}

function effectiveInputData(){
  return joinProcessedAndCurrentInput(readProcessedSplitStorage(), val("inputData"));
}

function clearCalculatedViewsKeepProcessed(){
  ["printOutput","inputValue","remainingValue","matchedValue","unchangedOutput","matchedOutput","parsedReference","auditDetail"].forEach(id=>setVal(id,""));
  const tbody = document.querySelector("#intermediateTable tbody");
  if(tbody) tbody.innerHTML = "";
  setVal("matchedValue", "0");
  setVal("processedOutput", readProcessedSplitStorage());
}

function saveProcessedSplitOutput(){
  return !!writeProcessedSplitStorage(val("processedOutput"));
}

function loadProcessedSplitOutput(){
  setVal("processedOutput", readProcessedSplitStorage());
}

function runAll(){
  try{
    const effectiveText = effectiveInputData();
    if(!effectiveText){
      clearCalculatedViewsKeepProcessed();
      return;
    }

    const blocks = splitBlocks(effectiveText);
    const rows = buildIntermediate(blocks);
    renderIntermediate(rows);

    const total = totalMoney(rows);
    setVal("printOutput", buildCopyFast(blocks, total));
    setVal("inputValue", money(total));

    const tk = buildTach(blocks);
    // Vùng Đã xử lý luôn phản ánh dữ liệu thật trong localStorage, không dùng kết quả tạm.
    setVal("processedOutput", readProcessedSplitStorage());
    setVal("unchangedOutput", tk.khong);
    scrollTextTop("processedOutput");
    scrollTextTop("unchangedOutput");

    const referencePack = parseAllReferences(rows);
    const pack = evaluateMatches(rows, referencePack);
    setVal("matchedValue", money(pack.total || 0));
    setVal("remainingValue", money(total - (pack.total || 0)));
    setVal("matchedOutput", buildMatchReport(pack));
    setVal("auditDetail", buildMatchStepTrace(rows, referencePack, pack));
    scrollTextTop("matchedOutput");
  }catch(err){
    console.error(err);
    setVal("inputValue", "Lỗi chạy: " + (err && err.message ? err.message : err));
  }
}

function openSplitPanelAndSave(){
  try{
    const effectiveText = effectiveInputData();
    if(effectiveText){
      const blocks = splitBlocks(effectiveText);
      const tk = buildTach(blocks);
      const processed = writeProcessedSplitStorage(tk.tach);
      const unchanged = normalizeStoredDataText(tk.khong);

      // Phần đã xử lý được chuyển hẳn sang vùng lưu; ô đầu vào chỉ giữ phần còn lại.
      setVal("inputData", unchanged);
      setVal("processedOutput", processed);
      setVal("unchangedOutput", unchanged);
      saveActiveWorkspaceInput();
      runAll();
      // Giữ đúng kết quả của lần bấm Tách trong bảng vừa mở.
      setVal("processedOutput", processed);
      setVal("unchangedOutput", unchanged);
    }else{
      writeProcessedSplitStorage("");
      setVal("unchangedOutput", "");
      clearCalculatedViewsKeepProcessed();
    }
  }catch(err){
    console.error(err);
    setVal("inputValue", "Lỗi tách: " + (err && err.message ? err.message : err));
  }
  toggleActionPanel("split");
  scrollTextTop("processedOutput");
  scrollTextTop("unchangedOutput");
}

function clearProcessedSplitOutput(btn){
  // Xóa thật: loại bỏ khóa lưu và cập nhật phép xét ngay lập tức.
  writeProcessedSplitStorage("");
  runAll();
  if(btn) flashActionButton(btn, "Đã xóa", "Xóa");
}

function clearRun(){
  // Nút Xóa chính chỉ xóa dữ liệu đang nhập; vùng Đã xử lý vẫn là dữ liệu độc lập.
  setVal("inputData", "");
  saveActiveWorkspaceInput();
  runAll();
}

window.addEventListener("DOMContentLoaded", ()=>{
  loadProcessedSplitOutput();
  setTimeout(runAll, 0);
});

window.SEQUENCE_NEUTRAL_ENGINE_V0595 = Object.assign(
  {},
  window.SEQUENCE_NEUTRAL_ENGINE_V0595 || {},
  {
    version:"0.5.95",
    status:"VÙNG ĐÃ XỬ LÝ LƯU ĐỘC LẬP; DỮ LIỆU XÉT = ĐÃ XỬ LÝ + ĐẦU VÀO",
    effectiveInputData,
    readProcessedSplitStorage,
    writeProcessedSplitStorage
  }
);

// Dấu xác nhận dùng cho kiểm tra tải mã trên trình duyệt.
window.SEQUENCE_APP_LOADED = true;

/* v0.5.96 / cache5671 — TÁCH NGUỒN TÍNH TOÁN VÀ NGUỒN XÉT ĐIỀU KIỆN
   - currentInputData(): chỉ dữ liệu mới trong ô đầu vào; dùng cho bảng và mọi giá trị tính toán.
   - splitConditionInputData(): vùng Đã xử lý + dữ liệu mới; chỉ dùng cho buildTach/xét điều kiện.
   - Không đưa vùng Đã xử lý vào inputValue, printOutput, matchedValue hoặc remainingValue.
*/
function currentInputData(){
  return normalizeStoredDataText(val("inputData"));
}

function splitConditionInputData(){
  return joinProcessedAndCurrentInput(readProcessedSplitStorage(), currentInputData());
}

function runAll(){
  try{
    const currentText = currentInputData();
    if(!currentText){
      clearCalculatedViewsKeepProcessed();
      return;
    }

    // Mọi phép tính chỉ dùng dữ liệu mới trong ô đầu vào.
    const currentBlocks = splitBlocks(currentText);
    const rows = buildIntermediate(currentBlocks);
    renderIntermediate(rows);

    const total = totalMoney(rows);
    setVal("printOutput", buildCopyFast(currentBlocks, total));
    setVal("inputValue", money(total));

    // Chỉ riêng việc xét Tách mới dùng dữ liệu đã xử lý + dữ liệu mới.
    const conditionText = splitConditionInputData();
    const conditionBlocks = conditionText ? splitBlocks(conditionText) : [];
    const tk = buildTach(conditionBlocks);
    setVal("processedOutput", readProcessedSplitStorage());
    setVal("unchangedOutput", tk.khong);
    scrollTextTop("processedOutput");
    scrollTextTop("unchangedOutput");

    const referencePack = parseAllReferences(rows);
    const pack = evaluateMatches(rows, referencePack);
    setVal("matchedValue", money(pack.total || 0));
    setVal("remainingValue", money(total - (pack.total || 0)));
    setVal("matchedOutput", buildMatchReport(pack));
    setVal("auditDetail", buildMatchStepTrace(rows, referencePack, pack));
    scrollTextTop("matchedOutput");
  }catch(err){
    console.error(err);
    setVal("inputValue", "Lỗi chạy: " + (err && err.message ? err.message : err));
  }
}

window.SEQUENCE_NEUTRAL_ENGINE_V0596 = Object.assign(
  {},
  window.SEQUENCE_NEUTRAL_ENGINE_V0595 || {},
  {
    version:"0.5.96",
    cache:"5671",
    status:"TÍNH TOÁN CHỈ DÙNG DỮ LIỆU MỚI; XÉT TÁCH DÙNG ĐÃ XỬ LÝ + DỮ LIỆU MỚI",
    currentInputData,
    splitConditionInputData,
    effectiveInputData:splitConditionInputData,
    readProcessedSplitStorage,
    writeProcessedSplitStorage
  }
);

window.SEQUENCE_APP_LOADED = true;

/* v0.5.97 / cache5672 — BẤM TÁCH ĐỒNG THỜI LƯU DỮ LIỆU MỚI TRONG NGÀY
   - Bỏ nút Lưu ở thanh thao tác chính.
   - Khi bấm Tách, chỉ phần dữ liệu mới đang có trong ô đầu vào được lưu vào Dữ liệu trong ngày.
   - Vùng Đã xử lý chỉ tham gia xét điều kiện; không được ghi lặp vào Dữ liệu trong ngày.
   - Việc lưu diễn ra sau khi buildTach thành công và trước khi ô đầu vào bị thay bằng phần Giữ nguyên.
*/
let lastSplitDailySaveStatus = "not-run";

function openSplitPanelAndSave(){
  try{
    const currentText = currentInputData();
    const conditionText = splitConditionInputData();

    if(conditionText){
      const blocks = splitBlocks(conditionText);
      const tk = buildTach(blocks);

      // Gọi đúng nhiệm vụ của nút Lưu cũ khi dữ liệu đầu vào mới còn nguyên vẹn.
      // saveDailyInputBackup() chỉ đọc inputData, vì vậy vùng Đã xử lý không bị lưu kèm.
      lastSplitDailySaveStatus = currentText ? saveDailyInputBackup() : "empty";

      const processed = writeProcessedSplitStorage(tk.tach);
      const unchanged = normalizeStoredDataText(tk.khong);

      setVal("inputData", unchanged);
      setVal("processedOutput", processed);
      setVal("unchangedOutput", unchanged);
      saveActiveWorkspaceInput();
      runAll();

      // Giữ đúng kết quả của lần bấm Tách trong bảng vừa mở.
      setVal("processedOutput", processed);
      setVal("unchangedOutput", unchanged);
    }else{
      lastSplitDailySaveStatus = "empty";
      writeProcessedSplitStorage("");
      setVal("unchangedOutput", "");
      clearCalculatedViewsKeepProcessed();
    }
  }catch(err){
    console.error(err);
    lastSplitDailySaveStatus = "error";
    setVal("inputValue", "Lỗi tách: " + (err && err.message ? err.message : err));
  }

  toggleActionPanel("split");
  scrollTextTop("processedOutput");
  scrollTextTop("unchangedOutput");
}

window.SEQUENCE_NEUTRAL_ENGINE_V0597 = Object.assign(
  {},
  window.SEQUENCE_NEUTRAL_ENGINE_V0596 || {},
  {
    version:"0.5.97",
    cache:"5672",
    status:"BẤM TÁCH LƯU DỮ LIỆU MỚI TRONG NGÀY; KHÔNG LƯU LẶP VÙNG ĐÃ XỬ LÝ",
    getLastSplitDailySaveStatus:()=>lastSplitDailySaveStatus
  }
);

window.SEQUENCE_APP_LOADED = true;

/* v0.5.99 / cache5674 — MỘT NÚT NGÀY THEO VÙNG ĐANG CHỌN
   - Vùng A chỉ hiện Ngày A; Vùng B chỉ hiện Ngày B; Vùng C chỉ hiện Ngày C.
   - Ba kho dữ liệu ngày vẫn độc lập; chỉ thay cách hiển thị nút.
*/
window.SEQUENCE_NEUTRAL_ENGINE_V0599 = Object.assign(
  {},
  window.SEQUENCE_NEUTRAL_ENGINE_V0598 || window.SEQUENCE_NEUTRAL_ENGINE_V0596 || {},
  {
    version:"0.5.99",
    cache:"5674",
    status:"MỘT NÚT NGÀY ĐỘNG THEO VÙNG ĐANG CHỌN"
  }
);

/* v0.5.98 / cache5673 — DỮ LIỆU TRONG NGÀY ĐỘC LẬP THEO VÙNG A / B / C
   - Mỗi vùng ghi vào một khóa riêng theo ngày.
   - Bấm Tách ở vùng nào chỉ lưu dữ liệu mới vào nhật ký ngày của vùng đó.
   - Cửa sổ Ngày A / B / C có Sao chép và Xóa riêng; xóa một vùng không ảnh hưởng vùng khác.
   - Dữ liệu chung của v0.5.97 trở về trước được giữ ở mục Chưa phân vùng; không tự gán sai vùng.
   - Mục Dữ liệu trong ngày đã được loại khỏi Cài đặt.
*/
const DAILY_REGION_STORAGE_PREFIX_V0598 = "sequence.v1.dailyInput.region.";
let selectedDailyRegionV0598 = "MN";

function normalizeDailyRegionV0598(region){
  return ["MN","MT","HN"].includes(region) ? region : "MN";
}

function dailyRegionInputKeyV0598(region=activeWorkspace){
  return DAILY_REGION_STORAGE_PREFIX_V0598 + normalizeDailyRegionV0598(region) + "." + dateKey();
}

function readDailyRegionInputV0598(region=activeWorkspace){
  try{
    return normalizeStoredDataText(localStorage.getItem(dailyRegionInputKeyV0598(region)) || "");
  }catch(e){
    console.error(e);
    return "";
  }
}

function readLegacyUnassignedDailyInputV0598(){
  try{
    // Khóa sequence.v1.dailyInput.<ngày> là kho dùng chung của v0.5.97 trở về trước.
    return normalizeStoredDataText(
      readTextWithLegacy(dailyInputKey(), LEGACY_STORAGE_KEYS.dailyInputPrefix + dateKey()) || ""
    );
  }catch(e){
    console.error(e);
    return "";
  }
}

function appendDailyEntryV0598(oldText, newText){
  const old = normalizeStoredDataText(oldText);
  const text = normalizeStoredDataText(newText);
  if(!text) return {status:"empty", text:old};

  const entries = old ? old.split(/\n\n---\n\n/) : [];
  const last = entries.length ? entries[entries.length - 1].replace(/^#\d+\n/, "").trim() : "";
  if(last === text) return {status:"duplicate", text:old};

  const entry = `#${entries.length + 1}\n${text}`;
  return {status:"saved", text:old ? old + "\n\n---\n\n" + entry : entry};
}

function saveDailyRegionInputBackupV0598(region=activeWorkspace, text=currentInputData()){
  const targetRegion = normalizeDailyRegionV0598(region);
  const result = appendDailyEntryV0598(readDailyRegionInputV0598(targetRegion), text);
  if(result.status === "empty" || result.status === "duplicate"){
    if(selectedDailyRegionV0598 === targetRegion) setVal("dailyRegionOutput", result.text);
    return result.status;
  }
  try{
    localStorage.setItem(dailyRegionInputKeyV0598(targetRegion), result.text);
    if(selectedDailyRegionV0598 === targetRegion) setVal("dailyRegionOutput", result.text);
    return "saved";
  }catch(e){
    console.error(e);
    return "error";
  }
}

// Ghi đè nhiệm vụ Lưu cũ: từ v0.5.98 chỉ lưu vào vùng đang làm việc.
function saveDailyInputBackup(){
  return saveDailyRegionInputBackupV0598(activeWorkspace, currentInputData());
}

function updateLegacyDailySectionV0598(){
  const legacyText = readLegacyUnassignedDailyInputV0598();
  setVal("legacyDailyUnassignedOutput", legacyText);
  const section = el("legacy-daily-unassigned");
  if(section) section.hidden = !legacyText;
}

function refreshDailyRegionPanelV0598(){
  const region = normalizeDailyRegionV0598(selectedDailyRegionV0598);
  const title = el("dailyRegionPanelTitle");
  if(title) title.textContent = "Dữ liệu trong ngày — " + regionUiName(region);
  setVal("dailyRegionOutput", readDailyRegionInputV0598(region));
  updateLegacyDailySectionV0598();
  scrollTextTop("dailyRegionOutput");
}

function openDailyRegionPanel(region){
  selectedDailyRegionV0598 = normalizeDailyRegionV0598(region);
  closeActionPanels();
  refreshDailyRegionPanelV0598();
  const panel = el("panel-daily-region");
  if(panel) panel.hidden = false;
}

function clearSelectedDailyRegionV0598(btn){
  const region = normalizeDailyRegionV0598(selectedDailyRegionV0598);
  try{
    localStorage.removeItem(dailyRegionInputKeyV0598(region));
  }catch(e){
    console.error(e);
  }
  setVal("dailyRegionOutput", "");
  if(btn) flashActionButton(btn, "Đã xóa", "Xóa");
}

function clearLegacyUnassignedDailyInputV0598(btn){
  try{
    localStorage.removeItem(dailyInputKey());
    localStorage.removeItem(LEGACY_STORAGE_KEYS.dailyInputPrefix + dateKey());
  }catch(e){
    console.error(e);
  }
  updateLegacyDailySectionV0598();
  if(btn) flashActionButton(btn, "Đã xóa", "Xóa");
}

// Không còn ô dữ liệu ngày chung trong Cài đặt; hàm load cũ chỉ đồng bộ panel nếu đang tồn tại.
function loadDailyInputBackup(){
  if(el("panel-daily-region")) refreshDailyRegionPanelV0598();
}

function clearDailyInputBackup(){
  clearSelectedDailyRegionV0598();
}

// Giữ toàn bộ logic Tách v0.5.97, chỉ đổi đích lưu dữ liệu mới sang vùng đang hoạt động.
function openSplitPanelAndSave(){
  try{
    const currentText = currentInputData();
    const conditionText = splitConditionInputData();

    if(conditionText){
      const blocks = splitBlocks(conditionText);
      const tk = buildTach(blocks);

      lastSplitDailySaveStatus = currentText
        ? saveDailyRegionInputBackupV0598(activeWorkspace, currentText)
        : "empty";

      const processed = writeProcessedSplitStorage(tk.tach);
      const unchanged = normalizeStoredDataText(tk.khong);

      setVal("inputData", unchanged);
      setVal("processedOutput", processed);
      setVal("unchangedOutput", unchanged);
      saveActiveWorkspaceInput();
      runAll();

      setVal("processedOutput", processed);
      setVal("unchangedOutput", unchanged);
    }else{
      lastSplitDailySaveStatus = "empty";
      writeProcessedSplitStorage("");
      setVal("unchangedOutput", "");
      clearCalculatedViewsKeepProcessed();
    }
  }catch(err){
    console.error(err);
    lastSplitDailySaveStatus = "error";
    setVal("inputValue", "Lỗi tách: " + (err && err.message ? err.message : err));
  }

  toggleActionPanel("split");
  scrollTextTop("processedOutput");
  scrollTextTop("unchangedOutput");
}

window.SEQUENCE_NEUTRAL_ENGINE_V0598 = Object.assign(
  {},
  window.SEQUENCE_NEUTRAL_ENGINE_V0597 || {},
  {
    version:"0.5.99",
    cache:"5674",
    status:"DỮ LIỆU TRONG NGÀY ĐỘC LẬP THEO VÙNG A/B/C; DỮ LIỆU CŨ GIỮ CHƯA PHÂN VÙNG",
    dailyRegionInputKey:dailyRegionInputKeyV0598,
    readDailyRegionInput:readDailyRegionInputV0598,
    saveDailyRegionInput:saveDailyRegionInputBackupV0598,
    readLegacyUnassignedDailyInput:readLegacyUnassignedDailyInputV0598,
    openDailyRegionPanel
  }
);

window.SEQUENCE_APP_LOADED = true;

/* v0.6.00 / cache5675 — TRẠNG THÁI ĐÃ XỬ LÝ RIÊNG THEO VÙNG + RESET INPUT SẠCH
   1) Kho Đã xử lý tách độc lập cho Vùng A / B / C.
   2) Dữ liệu Đã xử lý dùng chung từ bản cũ được chuyển sang Vùng A đúng một lần.
   3) Dữ liệu cũ chưa phân vùng bị xóa hẳn sau khi người dùng đã sao lưu.
   4) Bấm Làm việc mới sẽ xóa input A/B/C và dữ liệu thử; không xóa dữ liệu ngày, Đã xử lý hoặc Cài đặt.
*/
const PROCESSED_SPLIT_REGION_PREFIX_V0600 = "sequence.v1.saved.processedSplit.region.";
const PROCESSED_SPLIT_MIGRATION_MARKER_V0600 = "sequence.v1.migration.processedSplit.region.v0600";

function normalizeProcessedRegionV0600(region=activeWorkspace){
  return ["MN","MT","HN"].includes(region) ? region : "MN";
}

function processedSplitRegionKeyV0600(region=activeWorkspace){
  return PROCESSED_SPLIT_REGION_PREFIX_V0600 + normalizeProcessedRegionV0600(region);
}

function migrateSharedProcessedToRegionAV0600(){
  try{
    if(localStorage.getItem(PROCESSED_SPLIT_MIGRATION_MARKER_V0600) === "done"){
      localStorage.removeItem(PROCESSED_SPLIT_STORAGE_KEY);
      return;
    }

    const shared = normalizeStoredDataText(localStorage.getItem(PROCESSED_SPLIT_STORAGE_KEY) || "");
    const keyA = processedSplitRegionKeyV0600("MN");
    const currentA = normalizeStoredDataText(localStorage.getItem(keyA) || "");

    const mergedA = !currentA
      ? shared
      : (!shared || currentA === shared ? currentA : joinProcessedAndCurrentInput(currentA, shared));
    if(mergedA) localStorage.setItem(keyA, mergedA);
    localStorage.removeItem(PROCESSED_SPLIT_STORAGE_KEY);
    localStorage.setItem(PROCESSED_SPLIT_MIGRATION_MARKER_V0600, "done");
  }catch(e){
    console.error(e);
  }
}

function readProcessedSplitStorage(region=activeWorkspace){
  try{
    return normalizeStoredDataText(
      localStorage.getItem(processedSplitRegionKeyV0600(region)) || ""
    );
  }catch(e){
    console.error(e);
    return "";
  }
}

function writeProcessedSplitStorage(text, region=activeWorkspace){
  const targetRegion = normalizeProcessedRegionV0600(region);
  const normalized = normalizeStoredDataText(text);
  try{
    const key = processedSplitRegionKeyV0600(targetRegion);
    if(normalized) localStorage.setItem(key, normalized);
    else localStorage.removeItem(key);
  }catch(e){
    console.error(e);
  }
  if(targetRegion === activeWorkspace) setVal("processedOutput", normalized);
  return normalized;
}

function loadProcessedSplitOutput(){
  setVal("processedOutput", readProcessedSplitStorage(activeWorkspace));
}

function effectiveInputData(){
  return joinProcessedAndCurrentInput(readProcessedSplitStorage(activeWorkspace), val("inputData"));
}

function splitConditionInputData(){
  return joinProcessedAndCurrentInput(readProcessedSplitStorage(activeWorkspace), currentInputData());
}

function clearCalculatedViewsKeepProcessed(){
  ["printOutput","inputValue","remainingValue","matchedValue","unchangedOutput","matchedOutput","parsedReference","auditDetail"].forEach(id=>setVal(id,""));
  const tbody = document.querySelector("#intermediateTable tbody");
  if(tbody) tbody.innerHTML = "";
  setVal("matchedValue", "0");
  setVal("processedOutput", readProcessedSplitStorage(activeWorkspace));
}

function saveProcessedSplitOutput(){
  return !!writeProcessedSplitStorage(val("processedOutput"), activeWorkspace);
}

function clearProcessedSplitOutput(btn){
  writeProcessedSplitStorage("", activeWorkspace);
  runAll();
  if(btn) flashActionButton(btn, "Đã xóa", "Xóa");
}

function refreshDailyRegionPanelV0598(){
  const region = normalizeDailyRegionV0598(selectedDailyRegionV0598);
  const title = el("dailyRegionPanelTitle");
  if(title) title.textContent = "Dữ liệu trong ngày — " + regionUiName(region);
  setVal("dailyRegionOutput", readDailyRegionInputV0598(region));
  scrollTextTop("dailyRegionOutput");
}

function removeLegacyUnassignedDailyDataV0600(){
  try{
    const keys = [];
    for(let i = 0; i < localStorage.length; i++){
      const key = localStorage.key(i);
      if(key) keys.push(key);
    }
    keys.forEach(key=>{
      const isCurrentShared = key.startsWith(STORAGE_KEYS.dailyInputPrefix)
        && !key.startsWith(DAILY_REGION_STORAGE_PREFIX_V0598);
      const isLegacyShared = key.startsWith(LEGACY_STORAGE_KEYS.dailyInputPrefix);
      if(isCurrentShared || isLegacyShared) localStorage.removeItem(key);
    });
  }catch(e){
    console.error(e);
  }
  const legacySection = el("legacy-daily-unassigned");
  if(legacySection) legacySection.remove();
}

function clearWorkspaceInputStorageV0600(region){
  const targetRegion = normalizeProcessedRegionV0600(region);
  try{
    localStorage.removeItem(workspaceKey(targetRegion));
    localStorage.removeItem(LEGACY_STORAGE_KEYS.workspacePrefix + targetRegion);
  }catch(e){
    console.error(e);
  }
}

function resetSequenceInputsV0600(){
  ["MN","MT","HN"].forEach(clearWorkspaceInputStorageV0600);
  try{
    localStorage.removeItem(STORAGE_KEYS.newWorkData);
    localStorage.removeItem(LEGACY_STORAGE_KEYS.newWorkData);
  }catch(e){
    console.error(e);
  }

  setVal("inputData", "");
  setVal("newWorkData", "");
  setVal("newWorkProcess", "");
  setVal("newWorkReport", "");
  clearCalculatedViewsKeepProcessed();
}

function showMainWorkspace(name){
  const isNew = name === "newwork";
  if(isNew) resetSequenceInputsV0600();

  const sequenceWorkspace = el("main-sequence");
  const newwork = el("main-newwork");
  if(sequenceWorkspace) sequenceWorkspace.hidden = isNew;
  if(newwork) newwork.hidden = !isNew;
  document.querySelectorAll(".main-tab").forEach(btn=>{
    btn.classList.toggle("active", btn.dataset.main === (isNew ? "newwork" : "sequence"));
  });
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
  loadProcessedSplitOutput();
  if(val("inputData").trim()) runAll();
  else clearCalculatedViewsKeepProcessed();
}

function openSplitPanelAndSave(){
  try{
    const region = normalizeProcessedRegionV0600(activeWorkspace);
    const currentText = currentInputData();
    const conditionText = splitConditionInputData();

    if(conditionText){
      const blocks = splitBlocks(conditionText);
      const tk = buildTach(blocks);

      lastSplitDailySaveStatus = currentText
        ? saveDailyRegionInputBackupV0598(region, currentText)
        : "empty";

      const processed = writeProcessedSplitStorage(tk.tach, region);
      const unchanged = normalizeStoredDataText(tk.khong);

      setVal("inputData", unchanged);
      setVal("processedOutput", processed);
      setVal("unchangedOutput", unchanged);
      saveActiveWorkspaceInput();
      runAll();

      setVal("processedOutput", processed);
      setVal("unchangedOutput", unchanged);
    }else{
      lastSplitDailySaveStatus = "empty";
      writeProcessedSplitStorage("", region);
      setVal("unchangedOutput", "");
      clearCalculatedViewsKeepProcessed();
    }
  }catch(err){
    console.error(err);
    lastSplitDailySaveStatus = "error";
    setVal("inputValue", "Lỗi tách: " + (err && err.message ? err.message : err));
  }

  toggleActionPanel("split");
  scrollTextTop("processedOutput");
  scrollTextTop("unchangedOutput");
}

window.addEventListener("DOMContentLoaded", ()=>{
  migrateSharedProcessedToRegionAV0600();
  removeLegacyUnassignedDailyDataV0600();
  loadProcessedSplitOutput();
  if(val("inputData").trim()) runAll();
  else clearCalculatedViewsKeepProcessed();
});

window.SEQUENCE_NEUTRAL_ENGINE_V0600 = Object.assign(
  {},
  window.SEQUENCE_NEUTRAL_ENGINE_V0599 || window.SEQUENCE_NEUTRAL_ENGINE_V0598 || {},
  {
    version:"0.6.00",
    cache:"5675",
    status:"ĐÃ XỬ LÝ RIÊNG THEO VÙNG A/B/C; RESET INPUT SẠCH; ĐÃ XÓA DỮ LIỆU CŨ CHƯA PHÂN VÙNG",
    processedSplitRegionKey:processedSplitRegionKeyV0600,
    readProcessedSplitStorage,
    writeProcessedSplitStorage,
    resetSequenceInputs:resetSequenceInputsV0600
  }
);

window.SEQUENCE_APP_LOADED = true;

