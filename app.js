// PX-SO v0.3.8
// Luồng mới: Input thô -> Vùng trung gian đã bung -> Tính ghi / Tách / Không tách

const MN_MAP = {
  1:["Tpho","Dthap","Cmau"], 2:["Btre","Vtau","Blieu"], 3:["Dnai","Ctho","Strang"],
  4:["Tninh","Agiang","Bthuan"], 5:["Vlong","Bduong","Tvinh"],
  6:["Tpho","Lan","Bphuoc","Hgiang"], 0:["Tgiang","Kgiang","Dlat"]
};
const MT_MAP = {
  1:["Pyen","Hue"], 2:["Dlac","Qnam"], 3:["Dnang","Khoa"],
  4:["Bdinh","Qtri","Qbinh"], 5:["Glai","Nthuan"],
  6:["Dnang","Qngai","Dnong"], 0:["Ktum","Khoa","Hue"]
};

const KNOWN_DAI = [
  "Tninh","Agiang","Bthuan","Dnai","Ctho","Strang","Tpho","Dthap","Cmau","Btre","Vtau","Blieu",
  "Vlong","Bduong","Tvinh","Lan","Bphuoc","Hgiang","Tgiang","Kgiang","Dlat",
  "Bdinh","Qtri","Qbinh","Dnang","Khoa","Pyen","Hue","Dlac","Qnam","Glai","Nthuan","Qngai","Dnong","Ktum","HN"
];

const NAME_MAP = {
  "tây ninh":"Tninh","tay ninh":"Tninh","tninh":"Tninh",
  "an giang":"Agiang","agiang":"Agiang",
  "bình thuận":"Bthuan","binh thuan":"Bthuan","bthuan":"Bthuan",
  "đồng nai":"Dnai","dong nai":"Dnai","dnai":"Dnai",
  "cần thơ":"Ctho","can tho":"Ctho","ctho":"Ctho",
  "sóc trăng":"Strang","soc trang":"Strang","strang":"Strang",
  "tp.hcm":"Tpho","tp hcm":"Tpho","thành phố":"Tpho","tphcm":"Tpho","tpho":"Tpho",
  "đồng tháp":"Dthap","dong thap":"Dthap","dthap":"Dthap",
  "cà mau":"Cmau","ca mau":"Cmau","cmau":"Cmau",
  "bến tre":"Btre","ben tre":"Btre","btre":"Btre",
  "vũng tàu":"Vtau","vung tau":"Vtau","vtau":"Vtau",
  "bạc liêu":"Blieu","bac lieu":"Blieu","blieu":"Blieu",
  "hà nội":"HN","ha noi":"HN","hn":"HN","mb":"HN"
};

function dayIndex(){ return new Date().getDay(); }
function getRate(){
  let s = (document.getElementById("rate")?.value || "0.8").trim().replace(",",".").replace("%","");
  let n = parseFloat(s);
  if(isNaN(n)) n = 0.8;
  if(n > 1) n = n / 100;
  return n;
}
function getNum(id, fallback){
  let s = (document.getElementById(id)?.value || "").trim().replace(",",".");
  let n = parseFloat(s);
  return isNaN(n) ? fallback : n;
}
function money(n){
  const x = Math.round(n*10)/10;
  return String(x).replace(".",",")+"k";
}
function fmtN(n){
  const x = Math.round(n*100)/100;
  return String(x).replace(".",",").replace(/,0$/,"");
}
function normalizeLine(s){
  return (s||"").trim()
    .replace(/\s+/g,"")
    .replace(/đá/gi,"da")
    .replace(/đầu/gi,"dau")
    .replace(/đuôi|đui/gi,"duoi")
    .replace(/đđ/gi,"dd");
}
function cleanName(s){
  return (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
}
function detectRegionByDais(dais){
  if(dais.includes("HN")) return "HN";
  const mt = ["Pyen","Hue","Dlac","Qnam","Dnang","Khoa","Bdinh","Qtri","Qbinh","Glai","Nthuan","Qngai","Dnong","Ktum"];
  return dais.some(d=>mt.includes(d)) ? "MT" : "MN";
}
function getDaisFromName(name){
  if(!name) return [];
  const raw = name.trim();
  if(raw === "HN" || raw.toLowerCase()==="hn" || raw.toLowerCase()==="mb") return ["HN"];
  let found = [];
  for(const d of KNOWN_DAI){
    if(d !== "HN" && raw.includes(d)) found.push(d);
  }
  return found.length ? found : [raw];
}
function isHeader(line){
  const l = normalizeLine(line).toLowerCase();
  if(/^(hn|mb|2dmn|3dmn|4dmn|2dmt|3dmt)$/.test(l)) return true;
  // Header là dòng chữ không có số và không có hậu tố cách đánh
  return !/\d/.test(line) && /^[a-zA-ZÀ-ỹ]+$/.test(line.trim());
}
function pickDayForGeneric(region, count, hintDais=[]){
  const map = region === "MT" ? MT_MAP : MN_MAP;
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
  if(l==="hn" || l==="mb") dais = ["HN"];
  else if(l==="2dmn") dais = MN_MAP[pickDayForGeneric("MN",2,hintDais)].slice(0,2);
  else if(l==="3dmn") dais = MN_MAP[pickDayForGeneric("MN",3,hintDais)].slice(0,3);
  else if(l==="4dmn") dais = MN_MAP[pickDayForGeneric("MN",4,hintDais)].slice(0,4);
  else if(l==="2dmt") dais = MT_MAP[pickDayForGeneric("MT",2,hintDais)].slice(0,2);
  else if(l==="3dmt") dais = MT_MAP[pickDayForGeneric("MT",3,hintDais)].slice(0,3);
  else dais = getDaisFromName(raw.trim());
  const generic = /^(2dmn|3dmn|4dmn|2dmt|3dmt)$/i.test(l);
  return { raw: raw.trim(), name: dais.join(""), dais, region: detectRegionByDais(dais), mainDais: dais.slice(0,2), lines: [], generic };
}
function splitBlocks(text){
  const lines = (text||"").split(/\n+/).map(x=>x.trim()).filter(Boolean);
  const blocks=[]; let cur=null; let lastExplicitDais=[];
  for(const raw of lines){
    if(isHeader(raw)){
      cur = resolveHeader(raw, lastExplicitDais);
      blocks.push(cur);
      if(!cur.generic) lastExplicitDais = cur.dais;
    }else{
      if(!cur){
        cur = {raw:"Không rõ đài", name:"Không rõ đài", dais:["Không rõ đài"], region:"MN", mainDais:["Không rõ đài"], lines:[], generic:false};
        blocks.push(cur);
      }
      cur.lines.push(normalizeLine(raw));
    }
  }
  return blocks;
}

function expandKeoToken(token){
  const m = token.match(/^(\d+)keo(\d+)$/i);
  if(!m) return [token];
  const a=m[1], b=m[2];
  if(a.length !== b.length) return [token];
  const start = parseInt(a,10), end = parseInt(b,10);
  if(isNaN(start) || isNaN(end) || start>end || end-start>200) return [token];
  const out=[];
  for(let i=start;i<=end;i++) out.push(String(i).padStart(a.length,"0"));
  return out;
}
function parseNums(numStr){
  return (numStr||"").split(".").filter(Boolean).flatMap(expandKeoToken);
}
function parseAmount(x){
  return parseFloat(String(x||"0").replace(",",".")) || 0;
}

function parseBetLine(line){
  const clean = normalizeLine(line);
  const direct = clean.match(/^([0-9.]+)(da|dv)([\d,.]+)n$/i);
  if(direct){
    return [{nums:parseNums(direct[1]), type:direct[2].toLowerCase(), n:parseAmount(direct[3]), source:clean}];
  }

  const m = clean.match(/^([0-9.]+(?:keo[0-9]+)?)(bdao|xcdao|xcdau|xcduoi|duoi|dau|dd|b|xc)([\d,.]+)n((?:\.(?:bdao|xcdao|xcdau|xcduoi|duoi|dau|dd|b|xc)[\d,.]+n)*)$/i);
  if(!m) return null;

  const baseNums = parseNums(m[1]);
  const parts = [{nums:baseNums, type:m[2].toLowerCase(), n:parseAmount(m[3]), source:clean}];

  const rest = m[4] || "";
  const re = /\.(bdao|xcdao|xcdau|xcduoi|duoi|dau|dd|b|xc)([\d,.]+)n/ig;
  let x;
  while((x = re.exec(rest)) !== null){
    parts.push({nums:baseNums, type:x[1].toLowerCase(), n:parseAmount(x[2]), source:clean});
  }
  return parts;
}

function pairNumbers(nums){
  const out=[];
  for(let i=0;i<nums.length;i++){
    for(let j=i+1;j<nums.length;j++){
      out.push([nums[i], nums[j]]);
    }
  }
  return out;
}
function pairDais(dais){
  const out=[];
  for(let i=0;i<dais.length;i++){
    for(let j=i+1;j<dais.length;j++){
      out.push([dais[i], dais[j]]);
    }
  }
  return out;
}
function lineFromPart(num, type, n){
  return `${num}${type}${fmtN(n)}n`;
}
function daLine(a,b,n){
  return `${a}.${b}da${fmtN(n)}n`;
}

function expandIntermediate(blocks){
  const entries = [];
  for(const block of blocks){
    const mainPairName = block.mainDais.length>=2 ? block.mainDais[0]+block.mainDais[1] : "";
    for(const rawLine of block.lines){
      const parts = parseBetLine(rawLine);
      if(!parts){
        entries.push({block:block.name, line:rawLine, region:block.region, raw:rawLine, calc:false, tachEligible:false});
        continue;
      }
      for(const part of parts){
        const t = part.type;
        if(t === "dv"){
          const numPairs = pairNumbers(part.nums);
          if(block.dais.length >= 2){
            for(const dp of pairDais(block.dais)){
              const bname = dp[0]+dp[1];
              for(const np of numPairs){
                entries.push({
                  block:bname, line:daLine(np[0],np[1],part.n), type:"da", nums:np, n:part.n,
                  region:block.region, raw:rawLine, calc:true,
                  tachEligible:(bname===mainPairName)
                });
              }
            }
          }else{
            for(const np of numPairs){
              entries.push({
                block:block.name, line:daLine(np[0],np[1],part.n), type:"da", nums:np, n:part.n,
                region:block.region, raw:rawLine, calc:true, tachEligible:false
              });
            }
          }
        } else if(t === "da"){
          if(block.dais.length >= 2){
            for(const dp of pairDais(block.dais)){
              const bname = dp[0]+dp[1];
              entries.push({
                block:bname, line:daLine(part.nums[0],part.nums[1],part.n), type:"da", nums:part.nums.slice(0,2), n:part.n,
                region:block.region, raw:rawLine, calc:true,
                tachEligible:(bname===mainPairName)
              });
            }
          }else{
            entries.push({
              block:block.name, line:daLine(part.nums[0],part.nums[1],part.n), type:"da", nums:part.nums.slice(0,2), n:part.n,
              region:block.region, raw:rawLine, calc:true, tachEligible:false
            });
          }
        } else {
          for(const dai of block.dais){
            for(const num of part.nums){
              const outLine = lineFromPart(num, t, part.n);
              const isB2 = (t==="b" && num.length===2);
              entries.push({
                block:dai, line:outLine, type:t, nums:[num], n:part.n,
                region:block.region, raw:rawLine, calc:true,
                tachEligible:(block.dais.length>=2 && block.mainDais.includes(dai) && isB2)
              });
            }
          }
        }
      }
    }
  }
  return entries;
}

function renderEntries(entries){
  const groups = {};
  for(const e of entries){
    if(!groups[e.block]) groups[e.block] = [];
    groups[e.block].push(e.line);
  }
  const out=[];
  for(const [block, lines] of Object.entries(groups)){
    out.push(block);
    out.push(...lines);
    out.push("");
  }
  return out.join("\n").trim();
}


const COPY_MAX = 22;
function wrapCopyLine(line, maxLen=COPY_MAX){
  const s = normalizeLine(line);
  if(!s || s.length <= maxLen) return [s];

  const m = s.match(/^([0-9.]+)((?:bdao|xcdao|xcdau|xcduoi|duoi|dau|dd|b|xc)[\d,.]+n(?:\.(?:duoi|dau|dd|b|xc)[\d,.]+n)*)$/i);
  if(!m) return [s];

  const nums = m[1].split(".").filter(Boolean);
  const suffix = m[2];
  if(nums.length <= 1) return [s];

  const out=[]; let cur=[];
  for(const num of nums){
    const test = cur.concat([num]).join(".") + suffix;
    if(cur.length && test.length > maxLen){
      out.push(cur.join(".") + suffix);
      cur=[num];
    } else {
      cur.push(num);
    }
  }
  if(cur.length) out.push(cur.join(".") + suffix);
  return out;
}
function renderCopyFastBlocks(blocks){
  const out=[];
  for(const block of blocks){
    out.push(block.name || block.raw);
    for(const line of block.lines) out.push(...wrapCopyLine(line, COPY_MAX));
    out.push("");
  }
  return out.join("\n").trim();
}

function permCount(s){
  const arr = String(s).split("");
  const fact = n => n<=1?1:n*fact(n-1);
  const counts={}; arr.forEach(c=>counts[c]=(counts[c]||0)+1);
  let den=1; Object.values(counts).forEach(c=>den*=fact(c));
  return fact(arr.length)/den;
}
function daiCountForCalc(blockName, region, type){
  if(region === "HN") return 1;
  if(type === "da") return Math.max(1, getDaisFromName(blockName).length);
  return 1; // đã bung bao/xc/dd/dau/duoi về từng đài riêng
}
function calcEntry(e){
  if(!e.calc) return 0;
  const r = getRate();
  const region = e.region || "MN";
  const t = e.type;
  const dai = daiCountForCalc(e.block, region, t);
  let base=0, qty=1;
  const num = e.nums && e.nums[0] ? e.nums[0] : "";

  if(t==="da") { base = region==="HN" ? 54 : 36; qty = 1; }
  else if(t==="b") {
    const len = num.length;
    base = region==="HN" ? (len===2?27:len===3?23:0) : (len===2?18:len===3?17:16);
  }
  else if(t==="bdao") {
    const len = num.length;
    base = region==="HN" ? (len===3?23:0) : (len===3?17:16);
    qty = permCount(num);
  }
  else if(t==="xc" || t==="xcdau" || t==="xcduoi") { base = region==="HN" ? 4 : 2; }
  else if(t==="xcdao") { base = region==="HN" ? 4 : 2; qty = permCount(num); }
  else if(t==="dau") { base = region==="HN" ? 4 : 1; }
  else if(t==="duoi") { base = 1; }
  else if(t==="dd") { base = region==="HN" ? 5 : 2; }
  else return 0;
  return base * qty * e.n * dai * r;
}
function totalMoney(entries){
  return entries.reduce((s,e)=>s+calcEntry(e),0);
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
function buildTachGopCuoi(blocks){
  const tach = {};
  const khong = {};
  const max2 = getNum("max2",10);
  const maxDa = getNum("maxDa",1);

  const add = (obj, block, line) => {
    if(!block || !line) return;
    if(!obj[block]) obj[block]=[];
    obj[block].push(line);
  };

  const rebuildParts = (parts) => {
    if(!parts || !parts.length) return "";
    const base = (parts[0].nums || []).join(".");
    let s = base + parts[0].type + fmtN(parts[0].n) + "n";
    for(let i=1;i<parts.length;i++){
      s += "." + parts[i].type + fmtN(parts[i].n) + "n";
    }
    return s;
  };

  for(const block of blocks){
    const mainPair = block.mainDais.length >= 2 ? block.mainDais[0] + block.mainDais[1] : "";
    const hasMainPair = !!mainPair;

    for(const rawLine of block.lines){
      const parts = parseBetLine(rawLine);
      if(!parts){
        add(khong, block.name, rawLine);
        continue;
      }

      let took = false;
      const remain=[];

      for(const part of parts){
        const t=part.type;
        const nums=part.nums || [];

        // Bao 2 số: gộp cuối về block 2 đài chính, không tách riêng từng đài.
        if(t==="b" && hasMainPair && nums.every(n=>n.length===2)){
          add(tach, mainPair, `${nums.join(".")}b${fmtN(Math.min(part.n,max2))}n`);
          took = true;
          continue;
        }

        // Đá trong block nhiều đài: lấy cặp 2 đài chính vào tách.
        // Phần cặp đài phụ giữ ở không tách để không mất dữ liệu.
        if(t==="da" && hasMainPair && nums.length>=2){
          const line = `${nums[0]}.${nums[1]}da${fmtN(Math.min(part.n,maxDa))}n`;
          add(tach, mainPair, line);
          if(block.dais.length>2){
            for(const dp of pairDais(block.dais)){
              const pairName = dp[0]+dp[1];
              if(pairName !== mainPair) add(khong, pairName, line);
            }
          }
          took = true;
          continue;
        }

        // DV: bung thành đá, sau đó cũng gộp cuối về cặp 2 đài chính.
        if(t==="dv" && hasMainPair && nums.length>=2){
          for(const np of pairNumbers(nums)){
            const line = `${np[0]}.${np[1]}da${fmtN(Math.min(part.n,maxDa))}n`;
            add(tach, mainPair, line);
            if(block.dais.length>2){
              for(const dp of pairDais(block.dais)){
                const pairName = dp[0]+dp[1];
                if(pairName !== mainPair) add(khong, pairName, line);
              }
            }
          }
          took = true;
          continue;
        }

        // Phần không tách được giữ theo cấu trúc copy nhanh, không bung keo/dd/dau/duoi.
        remain.push(part);
      }

      if(!took){
        add(khong, block.name, rawLine);
      }else if(remain.length){
        add(khong, block.name, rebuildParts(remain) || rawLine);
      }
    }
  }

  return {tach: renderObj(tach), khong: renderObj(khong)};
}

function runAll(){
  const blocks = splitBlocks(document.getElementById("inputData").value);
  const entries = expandIntermediate(blocks);

  const intermediateText = renderEntries(entries);
  document.getElementById("detail").value = intermediateText;

  const total = totalMoney(entries);
  document.getElementById("ghi").value = "Ghi: " + money(total);

  // Copy nhanh: chỉ làm nhiệm vụ soạn lại tin và tự ngắt dòng <= 24 ký tự.
  // Không dùng vùng trung gian đã bung để tránh quá dài khi copy/in.
  document.getElementById("copyFast").value = renderCopyFastBlocks(blocks);

  const tk = buildTachGopCuoi(blocks);
  document.getElementById("soTach").value = tk.tach;
  document.getElementById("soKhongTach").value = tk.khong;

  const resultObj = parseAllResults();
  renderParsedResults(resultObj);
  document.getElementById("thuong").value = "0";
  document.getElementById("soTrung").value = "";
}

function parseAllResults(){
  return {
    MN: parseResultText(document.getElementById("kqMn").value),
    MT: parseResultText(document.getElementById("kqMt").value),
    HN: parseResultText(document.getElementById("kqHn").value)
  };
}
function mapDaiName(line){
  const c = cleanName(line);
  for(const [k,v] of Object.entries(NAME_MAP)){
    if(cleanName(k)===c) return v;
  }
  return null;
}
function parseResultText(text){
  const lines = (text||"").split(/\n+/).map(x=>x.trim()).filter(Boolean);
  const out = {};
  let cur = null;
  for(const line of lines){
    const dai = mapDaiName(line);
    if(dai){ cur=dai; if(!out[cur]) out[cur]=[]; continue; }
    const nums = line.match(/\d+/g);
    if(nums && cur){
      for(const n of nums){
        if(n.length>=2) out[cur].push(n);
      }
    }
  }
  const shaped = {};
  for(const [dai, nums] of Object.entries(out)){
    shaped[dai] = {
      full: nums,
      all2: nums.map(n=>n.slice(-2)),
      all3: nums.filter(n=>n.length>=3).map(n=>n.slice(-3)),
      all4: nums.filter(n=>n.length>=4).map(n=>n.slice(-4)),
      dau2: nums.length ? [nums[0].slice(-2)] : [],
      duoi2: nums.length ? [nums[nums.length-1].slice(-2)] : [],
      xc3: nums.length ? [nums[nums.length-1].slice(-3)] : [],
      xc4: nums.length ? [nums[nums.length-1].slice(-4)] : []
    };
  }
  return shaped;
}
function renderParsedResults(obj){
  let lines=[];
  for(const region of ["MN","MT","HN"]){
    const data = obj[region];
    if(!data || !Object.keys(data).length) continue;
    lines.push(region);
    for(const [dai, r] of Object.entries(data)){
      lines.push(dai);
      lines.push("full: " + r.full.join("."));
      lines.push("all2: " + r.all2.join("."));
      lines.push("all3: " + r.all3.join("."));
      lines.push("all4: " + r.all4.join("."));
      lines.push("");
    }
  }
  document.getElementById("parsedResults").value = lines.join("\n").trim();
}
function parseResultsOnly(){
  renderParsedResults(parseAllResults());
}

async function copyText(id){
  const t=document.getElementById(id).value;
  try {
    await navigator.clipboard.writeText(t);
    alert("Đã copy");
  } catch(e) {
    alert("Không copy tự động được, anh bôi đen rồi copy thủ công nhé");
  }
}
function clearRun(){
  ["copyFast","ghi","thuong","detail","soTrung","soTach","soKhongTach","parsedResults"].forEach(id=>document.getElementById(id).value="");
  document.getElementById("thuong").value="0";
}

// Auto chuẩn hoá kết quả khi dán/gõ, không cần click
window.addEventListener("DOMContentLoaded", () => {
  ["kqMn","kqMt","kqHn"].forEach(id => {
    const el = document.getElementById(id);
    if(el){
      el.addEventListener("input", () => parseResultsOnly());
      el.addEventListener("paste", () => setTimeout(parseResultsOnly, 50));
    }
  });
});
