// PX-SO v0.5.10 - rebuild sạch
// Input -> Bảng trung gian -> Tính tiền
// Copy nhanh: chuẩn tên đài, gom đồng giá, xuống dòng <=24 ký tự

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
  results: "pxso.v0.saved.results"
};
const SETTINGS_IDS = ["rate","coefDa2","coefDa1","coefDaHN","coef2","coef3","coef4","max2","maxDa"];

function dayIndex(){ return new Date().getDay(); }
function el(id){ return document.getElementById(id); }
function val(id){ return (el(id)?.value || ""); }
function setVal(id, v){ if(el(id)) el(id).value = v == null ? "" : String(v); }

function debounce(fn, delay=280){
  let t;
  return function(...args){
    clearTimeout(t);
    t = setTimeout(()=>fn.apply(this,args), delay);
  };
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
    if(d !== "HN" && raw.includes(d)) found.push(d);
  }
  return found.length ? found : [raw];
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
  const today = dayIndex();
  const hints = (hintDais||[]).filter(Boolean);
  if(hints.length){
    for(const [d, arr] of Object.entries(map)){
      if(arr.length >= count && hints.some(h => arr.includes(h))) return parseInt(d,10);
    }
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
  if(isNaN(start)||isNaN(end)||start>end||end-start>200) return [token];
  const out=[];
  for(let i=start;i<=end;i++) out.push(String(i).padStart(a.length,"0"));
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

function buildIntermediate(blocks){
  const rows=[];
  for(const block of blocks){
    for(const rawLine of block.lines){
      const parts = parseBetLine(rawLine);
      if(!parts){
        rows.push({block:block.name, line:rawLine, type:"?", nums:[rawLine], n:0, region:block.region, calc:false, daiCount:1});
        continue;
      }
      for(const part of parts){
        const t=part.type;
        const nums=part.nums || [];
        if(t==="dv"){
          const numPairs = pairNumbers(nums);
          const daiPairs = block.dais.length>=2 ? pairDais(block.dais) : [[block.name]];
          for(const dp of daiPairs){
            const bname = dp.length===2 ? dp[0]+dp[1] : block.name;
            for(const np of numPairs){
              rows.push({block:bname, line:makeDaLine(np[0],np[1],part.n), type:"da", nums:np, n:part.n, region:block.region, calc:true, raw:rawLine, daiCount:(dp.length===2?2:1)});
            }
          }
        }else if(t==="da"){
          const daiPairs = block.dais.length>=2 ? pairDais(block.dais) : [[block.name]];
          for(const dp of daiPairs){
            const bname = dp.length===2 ? dp[0]+dp[1] : block.name;
            rows.push({block:bname, line:makeDaLine(nums[0],nums[1],part.n), type:"da", nums:nums.slice(0,2), n:part.n, region:block.region, calc:true, raw:rawLine, daiCount:(dp.length===2?2:1)});
          }
        }else{
          for(const dai of block.dais){
            for(const num of nums){
              rows.push({block:dai, line:makeLine(num,t,part.n), type:t, nums:[num], n:part.n, region:block.region, calc:true, raw:rawLine, daiCount:1});
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
    else if(len===4) base = region==="HN" ? 0 : 16;

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
    out.push(...lines);
    out.push("");
  }
  return out.join("\n").trim();
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

  for(const block of blocks){
    const mainPair = block.mainDais.length>=2 ? block.mainDais[0]+block.mainDais[1] : "";
    for(const rawLine of block.lines){
      const parts = parseBetLine(rawLine);
      if(!parts){
        add(khong, block.name, rawLine);
        continue;
      }
      let took=false;
      const remain=[];
      for(const part of parts){
        const nums=part.nums||[];
        if(part.type==="b" && mainPair && nums.every(n=>n.length===2)){
          const keepN = Math.min(part.n, max2);
          const overflowN = part.n - keepN;
          if(keepN > 0) add(tach, mainPair, makeLine(nums, "b", keepN));
          if(overflowN > 0) add(khong, mainPair, makeLine(nums, "b", overflowN));
          took=true;
        }else if(part.type==="da" && mainPair && nums.length>=2){
          const keepN = Math.min(part.n, maxDa);
          const overflowN = part.n - keepN;
          if(keepN > 0) add(tach, mainPair, makeDaLine(nums[0],nums[1],keepN));
          if(overflowN > 0) add(khong, mainPair, makeDaLine(nums[0],nums[1],overflowN));
          took=true;
        }else if(part.type==="dv" && mainPair && nums.length>=2){
          const keepN = Math.min(part.n, maxDa);
          const overflowN = part.n - keepN;
          for(const np of pairNumbers(nums)){
            if(keepN > 0) add(tach, mainPair, makeDaLine(np[0],np[1],keepN));
            if(overflowN > 0) add(khong, mainPair, makeDaLine(np[0],np[1],overflowN));
          }
          took=true;
        }else{
          remain.push(part);
        }
      }
      if(!took) add(khong, block.name, normalizeLine(rawLine));
      else if(remain.length) add(khong, block.name, rebuildParts(remain));
    }
  }
  return {tach:renderObj(tach), khong:renderObj(khong)};
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
function parseResultText(text){
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
    HN:parseResultText(val("kqHn"))
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
  const grouped = {};
  for(const w of items){
    if(!grouped[w.block]) grouped[w.block] = [];
    grouped[w.block].push(`${w.line} ${money(w.amount)}`);
  }
  const out = [];
  for(const [block, lines] of Object.entries(grouped)){
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

    // CHẠY không hiện chuẩn hóa kết quả. Chỉ dò ngầm nếu đã có dữ liệu kết quả.
    const resultObj = parseAllResults();
    const winPack = calcWinners(rows, resultObj);
    setVal("thuong", winPack.total ? money(winPack.total) : "0");
    setVal("soTrung", buildWinReport(winPack));
  }catch(err){
    console.error(err);
    setVal("ghi", "Lỗi chạy: " + (err && err.message ? err.message : err));
  }
}
function clearRun(){
  ["inputData","copyFast","ghi","thuong","soTach","soKhongTach","soTrung","parsedResults","detail"].forEach(id=>setVal(id,""));
  const tbody = document.querySelector("#interTable tbody");
  if(tbody) tbody.innerHTML = "";
  setVal("thuong","0");
}
async function copyText(id){
  const text = val(id);
  try{
    await navigator.clipboard.writeText(text);
    alert("Đã copy");
  }catch(e){
    alert("Không copy tự động được, anh bôi đen rồi copy thủ công nhé");
  }
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
  if(ok) flashSaveButton(document.querySelector(".xoa-panel .save-mini"));
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
    parseResultsOnly();
    runAll();
    flashSaveButton(document.querySelector(".result-input-panel-visible .save-mini"));
  }
}
function loadSavedData(){
  applyValues(readStorage(STORAGE_KEYS.settings));
  applyValues(readStorage(STORAGE_KEYS.xoa));
  applyValues(readStorage(STORAGE_KEYS.results));
}

window.addEventListener("DOMContentLoaded", ()=>{
  loadSavedData();

  const autoRun = debounce(runAll, 280);

  const input = el("inputData");
  if(input){
    input.addEventListener("input", autoRun);
    input.addEventListener("paste", ()=>setTimeout(runAll, 30));
    input.addEventListener("change", runAll);
  }

  // Dán kết quả MN/MT/HN cũng tự cập nhật dò/trúng.
  ["kqMn","kqMt","kqHn"].forEach(id=>{
    const x=el(id);
    if(x){
      x.addEventListener("input", ()=>{
        parseResultsOnly();
        autoRun();
      });
      x.addEventListener("paste", ()=>{
        setTimeout(()=>{
          parseResultsOnly();
          runAll();
        },50);
      });
      x.addEventListener("change", ()=>{
        parseResultsOnly();
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

  parseResultsOnly();
  if(val("inputData").trim()) runAll();
});
