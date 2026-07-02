// PX-SO v0.4.1 - rebuild sạch
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
  "ha noi":"HN","hà nội":"HN","hn":"HN","mb":"HN"
};

const TYPE_RE = "(bdao|xcdao|xcdau|xcduoi|duoi|dau|dd|b|xc)";

function dayIndex(){ return new Date().getDay(); }
function el(id){ return document.getElementById(id); }
function val(id){ return (el(id)?.value || ""); }
function setVal(id, v){ if(el(id)) el(id).value = v == null ? "" : String(v); }

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
  const x = Math.round((Number(n)||0)*10)/10;
  return String(x).replace(".",",")+"k";
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
        rows.push({block:block.name, line:rawLine, type:"?", nums:[rawLine], n:0, region:block.region, calc:false});
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
              rows.push({block:bname, line:makeDaLine(np[0],np[1],part.n), type:"da", nums:np, n:part.n, region:block.region, calc:true, raw:rawLine});
            }
          }
        }else if(t==="da"){
          const daiPairs = block.dais.length>=2 ? pairDais(block.dais) : [[block.name]];
          for(const dp of daiPairs){
            const bname = dp.length===2 ? dp[0]+dp[1] : block.name;
            rows.push({block:bname, line:makeDaLine(nums[0],nums[1],part.n), type:"da", nums:nums.slice(0,2), n:part.n, region:block.region, calc:true, raw:rawLine});
          }
        }else{
          for(const dai of block.dais){
            for(const num of nums){
              rows.push({block:dai, line:makeLine(num,t,part.n), type:t, nums:[num], n:part.n, region:block.region, calc:true, raw:rawLine});
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

  // QUAN TRỌNG:
  // Bảng trung gian đã bung:
  // - Bao/DD/Đầu/Đuôi/XC/BDAO đã bung về từng đài.
  // - Đá/DV đã bung về từng cặp đài.
  // Vì vậy khi tính Ghi KHÔNG được nhân thêm số đài lần nữa.
  if(t==="da"){
    base = region==="HN" ? 54 : 36;
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
    lines.push([row.block,row.line,row.type,(row.nums||[]).join("."),fmtN(row.n),money(calcRow(row))].join("\t"));
  }
  setVal("detail", lines.join("\n"));
}

function totalMoney(rows){
  return rows.reduce((s,row)=>s+calcRow(row),0);
}

// COPY NHANH: gom đồng giá trong mỗi block, tự xuống dòng <= 24 ký tự.
function splitMaxNums(nums, suffix, maxLen=24){
  const out=[]; let cur=[];
  for(const n of nums){
    const test = cur.concat([n]).join(".") + suffix;
    if(cur.length && test.length > maxLen){
      out.push(cur.join(".") + suffix);
      cur=[n];
    }else{
      cur.push(n);
    }
  }
  if(cur.length) out.push(cur.join(".") + suffix);
  return out;
}
function buildCopyFast(blocks){
  const out=[];
  for(const block of blocks){
    out.push(block.name);
    const groups = {};
    const order = [];
    const direct = [];

    for(const rawLine of block.lines){
      const parts = parseBetLine(rawLine);
      if(!parts){
        direct.push(rawLine);
        continue;
      }
      for(const part of parts){
        if(part.type==="da" || part.type==="dv"){
          direct.push(normalizeLine(rawLine));
          continue;
        }
        const suffix = part.type + fmtN(part.n) + "n";
        if(!groups[suffix]){
          groups[suffix]=[];
          order.push(suffix);
        }
        groups[suffix].push(...(part.nums||[]));
      }
    }

    for(const suffix of order){
      out.push(...splitMaxNums(groups[suffix], suffix, 24));
    }
    out.push(...direct);
    out.push("");
  }
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
          add(tach, mainPair, makeLine(nums, "b", Math.min(part.n,max2)));
          took=true;
        }else if(part.type==="da" && mainPair && nums.length>=2){
          add(tach, mainPair, makeDaLine(nums[0],nums[1],Math.min(part.n,maxDa)));
          took=true;
        }else if(part.type==="dv" && mainPair && nums.length>=2){
          for(const np of pairNumbers(nums)){
            add(tach, mainPair, makeDaLine(np[0],np[1],Math.min(part.n,maxDa)));
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
function parseResultText(text){
  const lines=(text||"").split(/\n+/).map(x=>x.trim()).filter(Boolean);
  const out={}; let cur=null;
  for(const line of lines){
    const dai=mapDaiName(line);
    if(dai){ cur=dai; if(!out[cur]) out[cur]=[]; continue; }
    const nums=line.match(/\d+/g);
    if(nums && cur) nums.forEach(n=>{ if(n.length>=2) out[cur].push(n); });
  }
  const shaped={};
  for(const [dai, nums] of Object.entries(out)){
    shaped[dai]={
      full:nums,
      all2:nums.map(n=>n.slice(-2)),
      all3:nums.filter(n=>n.length>=3).map(n=>n.slice(-3)),
      all4:nums.filter(n=>n.length>=4).map(n=>n.slice(-4)),
      dau2:nums.length?[nums[0].slice(-2)]:[],
      duoi2:nums.length?[nums[nums.length-1].slice(-2)]:[]
    };
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
      lines.push("full: "+r.full.join("."));
      lines.push("all2: "+r.all2.join("."));
      lines.push("all3: "+r.all3.join("."));
      lines.push("all4: "+r.all4.join("."));
      lines.push("dau: "+r.dau2.join("."));
      lines.push("duoi: "+r.duoi2.join("."));
      lines.push("");
    }
  }
  setVal("parsedResults", lines.join("\n").trim());
}
function parseResultsOnly(){
  renderParsedResults(parseAllResults());
}

function runAll(){
  try{
    const blocks = splitBlocks(val("inputData"));
    const rows = buildIntermediate(blocks);

    renderIntermediate(rows);

    setVal("copyFast", buildCopyFast(blocks));

    const total = totalMoney(rows);
    setVal("ghi", "Ghi: " + money(total));

    const tk = buildTach(blocks);
    setVal("soTach", tk.tach);
    setVal("soKhongTach", tk.khong);

    renderParsedResults(parseAllResults());
    setVal("thuong", "0");
    setVal("soTrung", "");
  }catch(err){
    console.error(err);
    setVal("ghi", "Lỗi chạy: " + (err && err.message ? err.message : err));
  }
}
function clearRun(){
  ["copyFast","ghi","thuong","soTach","soKhongTach","soTrung","parsedResults","detail"].forEach(id=>setVal(id,""));
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

window.addEventListener("DOMContentLoaded", ()=>{
  ["kqMn","kqMt","kqHn"].forEach(id=>{
    const x=el(id);
    if(x){
      x.addEventListener("input", parseResultsOnly);
      x.addEventListener("paste", ()=>setTimeout(parseResultsOnly,50));
    }
  });
});
