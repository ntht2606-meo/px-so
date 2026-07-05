// PX-SO v0.5.58 - compact UI and DV grouping
// Input -> Bảng trung gian -> Tính tiền
// In: chuẩn tên đài, gom đồng giá, xuống dòng <=24 ký tự

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
  return found.length ? found.map(item => item.d) : [raw];
}
function detectRegionByDais(dais){
  if(dais.includes("HN")) return "HN";
  const mt = ["Pyen","Hue","Dlac","Qnam","Dnang","Khoa","Bdinh","Qtri","Qbinh","Glai","Nthuan","Qngai","Dnong","Ktum"];
  return dais.some(d => mt.includes(d)) ? "MT" : "MN";
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
function splitCopyLineOriginal(rawLine, maxLen=24){
  const s = normalizeLine(rawLine);
  if(!s || s.length <= maxLen) return s ? [s] : [];

  // Chỉ tách các dòng có sẵn danh sách số bằng dấu chấm.
  // Không bung keo/kéo, không gom dòng, không mở parseNums.
  const m = s.match(/^(\d+(?:\.\d+)+)([a-z]+[\d,.]+n(?:\.[a-z]+[\d,.]+n)*)$/i);
  if(!m) return [s];

  const nums = m[1].split(".").filter(Boolean);
  const suffix = m[2];
  if(nums.length < 2) return [s];

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
function buildCopyFast(blocks, total){
  const out=[todayLabel(), ""];
  for(const block of blocks){
    out.push(block.name);
    for(const rawLine of block.lines){
      out.push(...splitCopyLineOriginal(rawLine, 24));
    }
    out.push("");
  }
  out.push(roundedMoney(total));
  return out.join("\n").trim();
}

function renderObj(obj){
  const out=[];
  for(const [block, lines] of Object.entries(obj)){
    if(!lines.length) continue;
    out.push(block);
    for(const line of lines){
      out.push(...splitTachDisplayLine(line, 15));
    }
    out.push("");
  }
  return out.join("\n").trim();
}

function splitTachDisplayLine(line, maxNums=15){
  const m = String(line||"").match(/^([0-9.]+)(bdao|xcdao|xcdau|xcduoi|duoi|dau|dd|dv|b|xc)([\d,.]+)n$/i);
  if(!m) return line ? [line] : [];

  const nums = m[1].split(".").filter(Boolean);
  if(nums.length <= maxNums) return [line];

  const type = m[2];
  const amount = m[3];
  const out=[];
  for(let i=0; i<nums.length; i+=maxNums){
    out.push(nums.slice(i, i + maxNums).join(".") + type + amount + "n");
  }
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
  const tach={}, khong={};
  const max2=getNum("max2",10), maxDa=getNum("maxDa",1);
  const add=(obj, block, line)=>{
    if(!block || !line) return;
    if(!obj[block]) obj[block]=[];
    obj[block].push(line);
  };
  const rebuildParts=(parts)=>{
    if(!parts.length) return "";
    let s = makeLine(parts[0].nums, parts[0].type, parts[0].n);
    for(let i=1;i<parts.length;i++){
      s += "." + parts[i].type + fmtN(parts[i].n) + "n";
    }
    return s;
  };
  const addSplitAmount=(blockName, type, nums, n, maxN, isTach)=>{
    const keepN = Math.min(n, maxN);
    const overflowN = n - keepN;
    if(isTach && keepN > 0) add(tach, blockName, type==="da" ? makeDaLine(nums[0],nums[1],keepN) : makeLine(nums, type, keepN));
    if(isTach && overflowN > 0) add(khong, blockName, type==="da" ? makeDaLine(nums[0],nums[1],overflowN) : makeLine(nums, type, overflowN));
    if(!isTach) add(khong, blockName, type==="da" ? makeDaLine(nums[0],nums[1],n) : makeLine(nums, type, n));
  };
  const scheduledMainDaisForRow=(row)=>{
    if(!row || row.region==="HN") return ["HN"];
    return regionZonesForRow(row).mainDais;
  };
  // Vùng xanh để giữ tin tách:
  // bao 2 số chỉ lấy Đài 1 / Đài 2; đá chéo chỉ lấy Đài 1-2.
  const isTachBaoRow=(row)=>{
    const num = row.nums && row.nums[0] ? row.nums[0] : "";
    return row.type==="b" && String(num).length===2 && scheduledMainDaisForRow(row).includes(row.block);
  };
  const isTachDaRow=(row)=>{
    if(row.type!=="da") return false;
    const mainDais = scheduledMainDaisForRow(row);
    if(mainDais.length < 2) return "";
    return row.block === mainDais[0] + mainDais[1];
  };
  const isDaKeepScope=(row, xoaSet)=>{
    if(row.type!=="da") return false;

    // HN chỉ có một vùng đài, nên đá HN thuộc phạm vi giữ.
    if(row.region==="HN") return true;

    // Miền Trung giữ đá ở Số không tách; Số tách chỉ lấy bao 2 số theo dãy xoá.
    if(row.region==="MT") return false;

    // MN luôn phải qua ô điều kiện: chỉ cặp Đài 1-2 mới được áp max đá.
    // Dãy xoá trống chỉ có nghĩa là chưa lọc số, không mở rộng sang cặp phụ.
    return isTachDaRow(row);
  };
  const parseBaoLine=(line)=>{
    const m = String(line||"").match(/^(\d{2})b([\d,.]+)n$/i);
    if(!m) return null;
    return {num:m[1], n:parseAmount(m[2])};
  };
  const addAmount=(obj, block, num, n)=>{
    if(!obj[block]) obj[block]={};
    obj[block][num]=(obj[block][num]||0)+n;
  };
  const getMainPairs=(rows)=>{
    const seen=new Set(), out=[];
    for(const row of rows){
      const main = scheduledMainDaisForRow(row);
      if(main.length < 2) continue;
      const key = row.region + ":" + main[0] + ":" + main[1];
      if(seen.has(key)) continue;
      seen.add(key);
      out.push({region:row.region, a:main[0], b:main[1], pair:main[0]+main[1]});
    }
    return out;
  };
  const compactMainPairBao=(obj, rows, overflowObj, maxN)=>{
    const bao={}, other={};
    for(const [block, lines] of Object.entries(obj)){
      for(const line of lines){
        const parsed = parseBaoLine(line);
        if(parsed) addAmount(bao, block, parsed.num, parsed.n);
        else add(other, block, line);
      }
    }

    const ordered={};
    const setOut=(block, line)=>{
      if(!ordered[block]) ordered[block]=[];
      ordered[block].push(line);
    };

    for(const info of getMainPairs(rows)){
      const aMap = bao[info.a] || {};
      const bMap = bao[info.b] || {};
      const nums = sortNumsAsc(Array.from(new Set(Object.keys(aMap).concat(Object.keys(bMap)))));
      for(const num of nums){
        const common = Math.min(aMap[num] || 0, bMap[num] || 0);
        if(common > 0){
          const keep = Math.min(common, maxN);
          const overflow = common - keep;
          if(keep > 0) setOut(info.pair, makeLine(num, "b", keep));
          if(overflow > 0) add(overflowObj, info.pair, makeLine(num, "b", overflow));
          aMap[num] -= common;
          bMap[num] -= common;
        }
      }
    }

    for(const [block, numMap] of Object.entries(bao)){
      for(const num of sortNumsAsc(Object.keys(numMap))){
        const n = numMap[num] || 0;
        if(n > 0){
          const keep = Math.min(n, maxN);
          const overflow = n - keep;
          if(keep > 0) setOut(block, makeLine(num, "b", keep));
          if(overflow > 0) add(overflowObj, block, makeLine(num, "b", overflow));
        }
      }
    }
    for(const [block, lines] of Object.entries(other)){
      if(!ordered[block]) ordered[block]=[];
      ordered[block].push(...lines);
    }
    return ordered;
  };
  const compactKhongByPrice=(obj)=>{
    const ordered={};
    const setOut=(block, line)=>{
      if(!ordered[block]) ordered[block]=[];
      ordered[block].push(line);
    };
    const groupableTypes = new Set(["b","bdao","xc","xcdao","xcdau","xcduoi","dd","dau","duoi"]);
    const parseGroupableLine=(line)=>{
      const m = String(line||"").match(/^([0-9.]+)(bdao|xcdao|xcdau|xcduoi|duoi|dau|dd|b|xc)([\d,.]+)n$/i);
      if(!m) return null;
      const type = m[2].toLowerCase();
      if(!groupableTypes.has(type)) return null;
      return {nums:m[1].split(".").filter(Boolean), type, n:parseAmount(m[3])};
    };
    const parseSameNumberChain=(line)=>{
      const s = String(line || "");
      const m = s.match(/^(\d+)((?:bdao|xcdao|xcdau|xcduoi|duoi|dau|dd|b|xc)[\d,.]+n(?:\.(?:bdao|xcdao|xcdau|xcduoi|duoi|dau|dd|b|xc)[\d,.]+n)+)$/i);
      if(!m) return null;
      const num = m[1];
      const suffix = m[2];
      const parts = [];
      const re = /(bdao|xcdao|xcdau|xcduoi|duoi|dau|dd|b|xc)([\d,.]+)n/ig;
      let part;
      while((part = re.exec(suffix)) !== null){
        const type = part[1].toLowerCase();
        if(!groupableTypes.has(type)) return null;
        parts.push({type, n:parseAmount(part[2])});
      }
      if(parts.length < 2) return null;
      const key = String(num).length + "|" + parts.map(item => item.type + ":" + fmtN(item.n)).join("|");
      return {num, key, parts};
    };
    const renderSameNumberChain=(nums, parts)=>{
      const suffix = parts.map(item => item.type + fmtN(item.n) + "n").join(".");
      return nums.join(".") + suffix;
    };

    for(const [block, lines] of Object.entries(obj)){
      const groups={}, order=[], chainGroups={}, chainOrder=[], other=[];
      for(const line of lines){
        const parsed = parseGroupableLine(line);
        if(parsed){
          const shape = Array.from(new Set(parsed.nums.map(num => String(num).length))).sort().join(",");
          const key = parsed.type + "|" + fmtN(parsed.n) + "|" + shape;
          if(!groups[key]){
            groups[key]={type:parsed.type, n:parsed.n, numMap:{}, numOrder:[]};
            order.push(key);
          }
          parsed.nums.forEach(num=>{
            if(groups[key].numMap[num] == null) groups[key].numOrder.push(num);
            groups[key].numMap[num] = (groups[key].numMap[num] || 0) + parsed.n;
          });
        }else{
          const chained = parseSameNumberChain(line);
          if(chained){
            if(!chainGroups[chained.key]){
              chainGroups[chained.key]={parts:chained.parts, nums:[], numMap:{}};
              chainOrder.push(chained.key);
            }
            if(!chainGroups[chained.key].numMap[chained.num]){
              chainGroups[chained.key].numMap[chained.num] = true;
              chainGroups[chained.key].nums.push(chained.num);
            }
          }else{
            other.push(line);
          }
        }
      }

      chainOrder.forEach(key=>{
        const group = chainGroups[key];
        if(group.nums.length) setOut(block, renderSameNumberChain(group.nums, group.parts));
      });
      for(const key of order){
        const g = groups[key];
        const byAmount = {};
        for(const [num, amount] of Object.entries(g.numMap)){
          const amountKey = fmtN(amount);
          if(!byAmount[amountKey]) byAmount[amountKey] = [];
          byAmount[amountKey].push(num);
        }
        for(const amountKey of Object.keys(byAmount).sort((a,b)=>parseAmount(a)-parseAmount(b))){
          const keep = new Set(byAmount[amountKey]);
          const nums = g.numOrder.filter(num => keep.has(num));
          if(nums.length) setOut(block, makeLine(nums, g.type, parseAmount(amountKey)));
        }
      }
      other.forEach(line => setOut(block, line));
    }
    return ordered;
  };
  const compactKhongBao2ByDai=(obj, rows)=>{
    const rank={};
    let rankIndex=0;
    for(const row of rows){
      (row.sourceDais || []).forEach(dai=>{
        if(rank[dai] == null) rank[dai] = rankIndex++;
      });
    }
    KNOWN_DAI.forEach(dai=>{
      if(rank[dai] == null) rank[dai] = rankIndex++;
    });
    const sortDais=(dais)=>dais.slice().sort((a,b)=>{
      const ra = rank[a] == null ? 9999 : rank[a];
      const rb = rank[b] == null ? 9999 : rank[b];
      if(ra !== rb) return ra - rb;
      return String(a).localeCompare(String(b));
    });
    const singleKnownDai=(block)=>{
      const dais = getDaisFromName(block).filter(d => d && d !== "HN");
      return dais.length === 1 ? dais[0] : "";
    };
    const parseBao2Line=(line)=>{
      const m = String(line || "").match(/^([0-9.]+)b([\d,.]+)n$/i);
      if(!m) return null;
      const nums = m[1].split(".").filter(Boolean);
      if(!nums.length || !nums.every(num => String(num).length === 2)) return null;
      return {nums, n:parseAmount(m[2])};
    };

    const groups={}, order=[], passthrough=[];
    const addGroup=(region, num, dai, n)=>{
      const key = region + "|" + num;
      if(!groups[key]){
        groups[key]={region, num, amounts:{}};
        order.push(key);
      }
      groups[key].amounts[dai] = (groups[key].amounts[dai] || 0) + n;
    };

    for(const [block, lines] of Object.entries(obj)){
      const dai = singleKnownDai(block);
      for(const line of lines){
        const parsed = parseBao2Line(line);
        if(!dai || !parsed){
          passthrough.push({block, line});
          continue;
        }
        const region = detectRegionByDais([dai]);
        if(region === "HN"){
          passthrough.push({block, line});
          continue;
        }
        parsed.nums.forEach(num => addGroup(region, num, dai, parsed.n));
      }
    }

    const out={};
    const setOut=(block, line)=>{
      if(!out[block]) out[block]=[];
      out[block].push(line);
    };

    for(const key of order){
      const group = groups[key];
      const amounts = {...group.amounts};
      while(true){
        const dais = Object.keys(amounts).filter(dai => amounts[dai] > 0);
        if(dais.length < 2) break;
        const common = Math.min(...dais.map(dai => amounts[dai]));
        const block = sortDais(dais).join("");
        setOut(block, makeLine(group.num, "b", common));
        dais.forEach(dai=>{
          amounts[dai] = Math.round((amounts[dai] - common) * 100) / 100;
        });
      }
      Object.keys(amounts)
        .filter(dai => amounts[dai] > 0)
        .sort((a,b)=>(rank[a] || 9999) - (rank[b] || 9999))
        .forEach(dai => setOut(dai, makeLine(group.num, "b", amounts[dai])));
    }

    passthrough.forEach(item => setOut(item.block, item.line));
    return out;
  };
  const groupableKhongTypes = new Set(["b","bdao","xc","xcdao","xcdau","xcduoi","dd","dau","duoi"]);
  const parseKhongGroupableLine=(line)=>{
    const m = String(line||"").match(/^([0-9.]+)(bdao|xcdao|xcdau|xcduoi|duoi|dau|dd|b|xc)([\d,.]+)n$/i);
    if(!m) return null;
    const type = m[2].toLowerCase();
    if(!groupableKhongTypes.has(type)) return null;
    return {nums:m[1].split(".").filter(Boolean), type, n:parseAmount(m[3])};
  };
  const compactByNumber=(obj)=>{
    const out={};
    const setOut=(block, line)=>{
      if(!out[block]) out[block]=[];
      out[block].push(line);
    };
    const typeOrder = ["b","bdao","xc","xcdao","xcdau","xcduoi","dd","dau","duoi"];
    const typeRank = {};
    typeOrder.forEach((type, idx)=>{ typeRank[type] = idx; });

    for(const [block, lines] of Object.entries(obj)){
      const groups={}, numOrder=[], passthrough=[];
      for(const line of lines){
        const parsed = parseKhongGroupableLine(line);
        if(!parsed){
          passthrough.push(line);
          continue;
        }
        for(const num of parsed.nums){
          if(!groups[num]){
            groups[num]={types:{}, typeOrder:[]};
            numOrder.push(num);
          }
          if(groups[num].types[parsed.type] == null){
            groups[num].types[parsed.type]=0;
            groups[num].typeOrder.push(parsed.type);
          }
          groups[num].types[parsed.type] += parsed.n;
        }
      }

      for(const num of numOrder){
        const group = groups[num];
        const types = group.typeOrder.slice().sort((a,b)=>(typeRank[a] ?? 999) - (typeRank[b] ?? 999));
        const parts = types.map((type, idx)=>{
          const line = makeLine(num, type, group.types[type]);
          return idx === 0 ? line : line.replace(String(num), "");
        });
        if(parts.length) setOut(block, parts.join("."));
      }
      passthrough.forEach(line => setOut(block, line));
    }
    return out;
  };
  const blockToDais=(block)=>{
    const dais = getDaisFromName(block).filter(Boolean);
    if(dais.length) return dais;
    return [block];
  };
  const makeDaiRank=(rows)=>{
    const rank={};
    let i=0;
    for(const row of rows){
      (row.sourceDais || []).forEach(dai=>{
        if(rank[dai] == null) rank[dai] = i++;
      });
    }
    KNOWN_DAI.forEach(dai=>{
      if(rank[dai] == null) rank[dai] = i++;
    });
    return rank;
  };
  const sortDaisByRank=(dais, rank)=>{
    return (dais || []).slice().sort((a,b)=>{
      const ra = rank[a] == null ? 9999 : rank[a];
      const rb = rank[b] == null ? 9999 : rank[b];
      if(ra !== rb) return ra - rb;
      return String(a).localeCompare(String(b));
    });
  };
  const compactKhongByDai=(obj, rows)=>{
    const rank = makeDaiRank(rows);
    const mainPairByKey = {};
    for(const row of rows || []){
      const num = row.nums && row.nums[0] ? row.nums[0] : "";
      if(!num || !groupableKhongTypes.has(row.type)) continue;
      if(!row.sourceDais || row.sourceDais.length < 2) continue;
      const key = [row.type, num, String(num).length].join("|");
      if(!mainPairByKey[key]) mainPairByKey[key] = row.sourceDais.slice(0, 2);
    }
    const grouped={}, groupOrder=[], fixed=[];
    const addGroup=(key, block, num, type, n)=>{
      if(!grouped[key]){
        grouped[key]={num, type, amounts:{}, mainPair:mainPairByKey[key] || []};
        groupOrder.push(key);
      }
      grouped[key].amounts[block] = (grouped[key].amounts[block] || 0) + n;
    };

    for(const [block, lines] of Object.entries(obj)){
      const dais = blockToDais(block);
      for(const line of lines){
        const parsed = parseKhongGroupableLine(line);
        if(!parsed || dais.length !== 1){
          fixed.push({block, line});
          continue;
        }
        for(const num of parsed.nums){
          const key = [parsed.type, num, String(num).length].join("|");
          addGroup(key, block, num, parsed.type, parsed.n);
        }
      }
    }

    const out={};
    const setOut=(block, line)=>{
      if(!out[block]) out[block]=[];
      out[block].push(line);
    };

    for(const key of groupOrder){
      const group = grouped[key];
      const amounts = {...group.amounts};

      const mainPair = (group.mainPair || []).filter(block => amounts[block] > 0);
      if(mainPair.length >= 2){
        const a = mainPair[0];
        const b = mainPair[1];
        const common = Math.min(amounts[a] || 0, amounts[b] || 0);
        if(common > 0){
          setOut(group.mainPair.join(""), makeLine(group.num, group.type, common));
          amounts[a] = Math.round((amounts[a] - common) * 100) / 100;
          amounts[b] = Math.round((amounts[b] - common) * 100) / 100;
        }
      }

      while(true){
        const blocks = Object.keys(amounts).filter(block => amounts[block] > 0);
        if(blocks.length < 2) break;
        const pair = blocks.sort((a,b)=>{
          const da = sortDaisByRank(blockToDais(a), rank)[0] || a;
          const db = sortDaisByRank(blockToDais(b), rank)[0] || b;
          return (rank[da] || 9999) - (rank[db] || 9999);
        }).slice(0,2);
        const common = Math.min(...pair.map(block => amounts[block]));
        const dais = sortDaisByRank(pair.flatMap(blockToDais), rank);
        const combinedBlock = dais.join("");
        setOut(combinedBlock, makeLine(group.num, group.type, common));
        pair.forEach(block=>{
          amounts[block] = Math.round((amounts[block] - common) * 100) / 100;
        });
      }
      Object.keys(amounts)
        .filter(block => amounts[block] > 0)
        .sort((a,b)=>{
          const da = sortDaisByRank(blockToDais(a), rank)[0] || a;
          const db = sortDaisByRank(blockToDais(b), rank)[0] || b;
          return (rank[da] || 9999) - (rank[db] || 9999);
        })
        .forEach(block => setOut(block, makeLine(group.num, group.type, amounts[block])));
    }

    fixed.forEach(item => setOut(item.block, item.line));
    return out;
  };
  const compactDaPairsToDv=(obj)=>{
    const out={};
    const setOut=(block, line)=>{
      if(!out[block]) out[block]=[];
      out[block].push(line);
    };
    const parseDaLine=(line)=>{
      const m = String(line||"").match(/^(\d+)\.(\d+)da([\d,.]+)n$/i);
      if(!m) return null;
      const pair = sortPair(m[1], m[2]);
      return {a:pair[0], b:pair[1], n:parseAmount(m[3])};
    };
    const comboCount=(n)=>n*(n-1)/2;

    for(const [block, lines] of Object.entries(obj)){
      const groups={}, order=[], passthrough=[];
      for(const line of lines){
        const parsed = parseDaLine(line);
        if(!parsed){
          passthrough.push(line);
          continue;
        }
        const key = fmtN(parsed.n);
        if(!groups[key]){
          groups[key]={n:parsed.n, pairMap:{}, pairOrder:[]};
          order.push(key);
        }
        const pairKey = parsed.a + "." + parsed.b;
        if(!groups[key].pairMap[pairKey]){
          groups[key].pairOrder.push(pairKey);
          groups[key].pairMap[pairKey]={a:parsed.a, b:parsed.b};
        }else{
          passthrough.push(line);
        }
      }

      for(const key of order){
        const group = groups[key];
        const nums = sortNumsAsc(Array.from(new Set(Object.values(group.pairMap).flatMap(pair => [pair.a, pair.b]))));
        const expected = comboCount(nums.length);
        const hasFullDv = nums.length >= 3 && Object.keys(group.pairMap).length === expected;
        if(hasFullDv){
          setOut(block, makeLine(nums, "dv", group.n));
        }else{
          group.pairOrder.forEach(pairKey=>{
            const pair = group.pairMap[pairKey];
            setOut(block, makeDaLine(pair.a, pair.b, group.n));
          });
        }
      }
      passthrough.forEach(line => setOut(block, line));
    }
    return out;
  };

  const rows = buildIntermediate(blocks);
  const usedBaoRows = new Set();
  const baoMainGroups = new Map();

  // Nhiệm vụ 2: bao 2 số phải tách trung gian trước rồi mới gom giao Đài 1 / Đài 2.
  // Nếu cùng số có ở Đài 1 và Đài 2, phần giao lên block Đài 1-2; phần dư mới ở đài riêng.
  for(const [idx, row] of rows.entries()){
    if(!isTachBaoRow(row)) continue;
    usedBaoRows.add(idx);

    const num = row.nums[0];
    const xoaSet = readXoaSet(row.region);
    if(numInXoa(num, xoaSet)){
      add(khong, row.block, row.line);
      continue;
    }

    const mainDais = scheduledMainDaisForRow(row);
    if(mainDais.length < 2){
      addSplitAmount(row.block, "b", num, row.n, max2, true);
      continue;
    }

    const key = [row.region, mainDais[0], mainDais[1], num].join("|");
    if(!baoMainGroups.has(key)){
      baoMainGroups.set(key, {
        region: row.region,
        mainDais,
        num,
        amountByDai: {}
      });
    }

    const group = baoMainGroups.get(key);
    group.amountByDai[row.block] = (group.amountByDai[row.block] || 0) + row.n;
  }

  for(const group of baoMainGroups.values()){
    const a = group.mainDais[0];
    const b = group.mainDais[1];
    const pairBlock = a + b;
    let aN = group.amountByDai[a] || 0;
    let bN = group.amountByDai[b] || 0;
    const common = Math.min(aN, bN);

    if(common > 0){
      addSplitAmount(pairBlock, "b", group.num, common, max2, true);
      aN = Math.round((aN - common) * 100) / 100;
      bN = Math.round((bN - common) * 100) / 100;
    }

    if(aN > 0) addSplitAmount(a, "b", group.num, aN, max2, true);
    if(bN > 0) addSplitAmount(b, "b", group.num, bN, max2, true);
  }

  // Nhiệm vụ 3: đá chéo Đài 1-2 phải gom theo đúng cặp số trước rồi mới áp max đá.
  // Nếu xử lý từng dòng riêng, nhiều dòng cùng cặp có thể vượt maxDa mà vẫn lọt vào Tin tách.
  const usedDaRows = new Set();
  const daMainGroups = new Map();

  for(const [idx, row] of rows.entries()){
    if(usedBaoRows.has(idx)) continue;
    if(!isDaKeepScope(row)) continue;

    usedDaRows.add(idx);
    const pair = sortPair(row.nums[0], row.nums[1]);
    const xoaSet = readXoaSet(row.region);

    if(xoaSet.size > 0 && pair.some(n=>numInXoa(n, xoaSet))){
      add(khong, row.block, row.line);
      continue;
    }

    const key = [row.region, row.block, pair[0], pair[1]].join("|");
    if(!daMainGroups.has(key)){
      daMainGroups.set(key, {
        block: row.block,
        pair,
        n: 0
      });
    }
    const group = daMainGroups.get(key);
    group.n += row.n;
  }

  for(const group of daMainGroups.values()){
    addSplitAmount(group.block, "da", group.pair, group.n, maxDa, true);
  }

  for(const [idx, row] of rows.entries()){
    if(usedBaoRows.has(idx) || usedDaRows.has(idx)) continue;
    add(khong, row.block, row.line);
  }
  return {
    tach:renderObj(compactDaPairsToDv(compactKhongByPrice(compactByNumber(compactMainPairBao(tach, rows, khong, max2))))),
    khong:renderObj(compactDaPairsToDv(compactKhongByPrice(compactByNumber(compactKhongByDai(khong, rows)))))
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
function parseResultText(text, fallbackDai=""){
  const lines=(text||"").split(/\n+/).map(x=>x.trim()).filter(Boolean);
  const out={}; let cur=null;

  for(const line of lines){
    const dai=findDaiInLine(line);
    if(dai){
      cur=dai;
      if(!out[cur]) out[cur]=[];
      const nums=line.match(/\d+/g);
      if(nums) nums.forEach(n=>{ if(n.length>=2) out[cur].push(n); });
      continue;
    }

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
    const nums = numsRaw.filter(Boolean);
    const first = nums.length ? nums[0] : "";
    const last = nums.length ? nums[nums.length-1] : "";

    shaped[dai]={
      full: nums,

      // Bao = toàn bộ giải theo độ dài cần dò.
      bao2: nums.map(n=>n.slice(-2)),
      bao3: nums.filter(n=>n.length>=3).map(n=>n.slice(-3)),
      bao4: nums.filter(n=>n.length>=4).map(n=>n.slice(-4)),

      // Đầu/Đuôi = vị trí kết quả, dùng để dò dd/dau/duoi và xc/xcdau/xcduoi.
      dau2: first ? [first.slice(-2)] : [],
      duoi2: last ? [last.slice(-2)] : [],
      dau3: first && first.length>=3 ? [first.slice(-3)] : [],
      duoi3: last && last.length>=3 ? [last.slice(-3)] : [],
      dau4: first && first.length>=4 ? [first.slice(-4)] : [],
      duoi4: last && last.length>=4 ? [last.slice(-4)] : []
    };

    // Alias cũ để không làm gãy các phần đang đúng.
    shaped[dai].all2 = shaped[dai].bao2;
    shaped[dai].all3 = shaped[dai].bao3;
    shaped[dai].all4 = shaped[dai].bao4;
  }
  return shaped;
}
function parseAllResults(){
  return {
    MN:parseResultText(val("kqMn")),
    MT:parseResultText(val("kqMt")),
    HN:parseResultText(val("kqHn"), "HN")
  };
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
    if(len === 3) return getNum("coef3",650);
    if(len === 4) return getNum("coef4",5500);
  }
  if(t === "dd" || t === "dau" || t === "duoi") return getNum("coef2",75);
  if(t === "xc" || t === "xcdau" || t === "xcduoi" || t === "xcdao") return getNum("coef3",650);
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
      hit = countExact(r.dau3, num) + countExact(r.duoi3, num);

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
    const resultObj = parseAllResults();
    const winPack = calcWinners(rows, resultObj);
    setVal("thuong", winPack.total ? money(winPack.total) : "0");
    setVal("tong", money(total - winPack.total));
    setVal("soTrung", buildWinReport(winPack));
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
  if(val("inputData").trim()) runAll();
  const ok = await copyText("copyFast");
  if(ok) flashActionButton(btn, "Đã copy", "In");
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
