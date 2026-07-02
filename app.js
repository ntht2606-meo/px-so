// PX-SO v0.2

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

function val(id){
  let s = document.getElementById(id).value.trim().replace(",",".").replace("%","");
  let n = parseFloat(s);
  if (id==="rate" && n>1) n=n/100;
  return isNaN(n)?0:n;
}
function money(n){
  const x = Math.round(n*10)/10;
  return String(x).replace(".",",")+"k";
}
function fmtN(n){ return String(Math.round(n*100)/100).replace(".",","); }
function dayIndex(){ return new Date().getDay(); }

function normalizeLine(s){
  return s.trim()
    .replace(/\s+/g,"")
    .replace(/đá/gi,"da")
    .replace(/đầu/gi,"dau")
    .replace(/đuôi|đui/gi,"duoi")
    .replace(/đđ/gi,"dd");
}
function isHeader(line){
  const l = normalizeLine(line).toLowerCase();
  return /^(hn|mb|2dmn|3dmn|4dmn|2dmt|3dmt|mn|mt)$/.test(l) || /^[a-zA-ZÀ-ỹ]+$/.test(line.trim());
}
function resolveHeader(raw){
  const l = normalizeLine(raw).toLowerCase();
  const d = dayIndex();
  if(l==="hn" || l==="mb") return {name:"HN", region:"HN", dai:1};
  if(l==="2dmn") {let a=MN_MAP[d].slice(0,2); return {name:a.join(""), region:"MN", dai:2};}
  if(l==="3dmn") {let a=MN_MAP[d].slice(0,3); return {name:a.join(""), region:"MN", dai:3};}
  if(l==="4dmn") {let a=MN_MAP[d].slice(0,4); return {name:a.join(""), region:"MN", dai:4};}
  if(l==="2dmt") {let a=MT_MAP[d].slice(0,2); return {name:a.join(""), region:"MT", dai:2};}
  if(l==="3dmt") {let a=MT_MAP[d].slice(0,3); return {name:a.join(""), region:"MT", dai:3};}
  return {name:raw.trim(), region:detectRegionByName(raw), dai:countDaiByName(raw)};
}
function detectRegionByName(name){
  const n = name.toLowerCase();
  if(n==="hn" || n==="mb") return "HN";
  const mt = ["pyen","hue","dlac","qnam","dnang","khoa","bdinh","qtri","qbinh","glai","nthuan","qngai","dnong","ktum"];
  if(mt.some(x=>n.includes(x.toLowerCase()))) return "MT";
  return "MN";
}
function countDaiByName(name){
  // Đếm tương đối theo chuỗi ghép tên đài đã biết
  const known = ["Tninh","Agiang","Bthuan","Dnai","Ctho","Strang","Tpho","Dthap","Cmau","Btre","Vtau","Blieu","Vlong","Bduong","Tvinh","Lan","Bphuoc","Hgiang","Tgiang","Kgiang","Dlat","Bdinh","Qtri","Qbinh","Dnang","Khoa","Pyen","Hue","Dlac","Qnam","Glai","Nthuan","Qngai","Dnong","Ktum"];
  let c=0;
  for(const k of known){ if(name.includes(k)) c++; }
  return c || 1;
}
function splitBlocks(text){
  const lines = text.split(/\n+/).map(x=>x.trim()).filter(Boolean);
  const blocks=[]; let cur=null;
  for(const raw of lines){
    if(isHeader(raw)){
      cur = resolveHeader(raw);
      cur.lines=[];
      blocks.push(cur);
    }else{
      if(!cur){cur={name:"Không rõ đài", region:"MN", dai:1, lines:[]}; blocks.push(cur);}
      cur.lines.push(normalizeLine(raw));
    }
  }
  return blocks;
}

function expandKeoToken(token){
  const m = token.match(/^(\d+?)keo(\d+)$/i);
  if(!m) return [token];
  const a=m[1], b=m[2];
  if(a.length!==b.length) return [token];
  const start=parseInt(a,10), end=parseInt(b,10);
  if(isNaN(start)||isNaN(end)||start>end) return [token];
  const out=[];
  for(let i=start;i<=end;i++) out.push(String(i).padStart(a.length,"0"));
  return out;
}

function parseLineToParts(line){
  // Hỗ trợ: 93dau10n.duoi15n, 00keo09dd5n, 681b1n, 93.97.07.29dv1n
  const clean = normalizeLine(line);
  const segments = clean.split(".");
  let first = segments[0];
  let m = first.match(/^([0-9.]+?)(bdao|xcdao|xcdau|xcduoi|duoi|dau|dd|b|xc|da|dv)([\d,.]+)n$/i);
  if(!m) return null;

  let baseNums = m[1].split(".").filter(Boolean).flatMap(expandKeoToken);
  const parts = [{nums:baseNums, type:m[2].toLowerCase(), n:parseFloat(m[3].replace(",","."))||0, raw:first}];

  // Nếu dòng có dạng 93dau10n.duoi15n thì phần sau không có số, dùng lại baseNums
  for(let i=1;i<segments.length;i++){
    const seg = segments[i];
    if(!seg) continue;
    let m2 = seg.match(/^(bdao|xcdao|xcdau|xcduoi|duoi|dau|dd|b|xc|da|dv)([\d,.]+)n$/i);
    if(m2){
      parts.push({nums:baseNums, type:m2[1].toLowerCase(), n:parseFloat(m2[2].replace(",","."))||0, raw:seg});
      continue;
    }
    // Nếu là đá/dv có dấu chấm số thì parseLine cũ đã bị split, nên fallback ở dưới
    return parseSimpleLine(clean);
  }
  return {raw:clean, parts};
}
function parseSimpleLine(line){
  const m = line.match(/^([0-9.]+)(bdao|xcdao|xcdau|xcduoi|duoi|dau|dd|b|xc|da|dv)([\d,.]+)n$/i);
  if(!m) return null;
  return {raw:line, parts:[{nums:m[1].split(".").filter(Boolean).flatMap(expandKeoToken), type:m[2].toLowerCase(), n:parseFloat(m[3].replace(",","."))||0, raw:line}]};
}
function parseBet(line){
  // Quan trọng: da/dv có nhiều số như 93.97.07.29dv1n phải parse nguyên, không split compound
  const simple = line.match(/^([0-9.]+)(da|dv)([\d,.]+)n$/i);
  if(simple){
    return {raw:line, parts:[{nums:simple[1].split(".").filter(Boolean), type:simple[2].toLowerCase(), n:parseFloat(simple[3].replace(",","."))||0, raw:line}]};
  }
  return parseLineToParts(line);
}
function permCount(s){
  const arr = String(s).split("");
  const fact = n => n<=1?1:n*fact(n-1);
  const counts={}; arr.forEach(c=>counts[c]=(counts[c]||0)+1);
  let den=1; Object.values(counts).forEach(c=>den*=fact(c));
  return fact(arr.length)/den;
}
function pairCount(nums){ return nums.length<2?0:(nums.length*(nums.length-1))/2; }

function calcPart(part, block){
  const r = val("rate");
  const region = block.region;
  const dai = region==="HN" ? 1 : block.dai;
  const t = part.type;
  const countNums = part.nums.length;
  let base = 0, qty = 1;

  if(t==="da") {
    base = region==="HN" ? 54 : 36;
    qty = 1;
  } else if(t==="dv") {
    base = region==="HN" ? 54 : 36;
    qty = pairCount(part.nums);
  } else if(t==="b") {
    const len = part.nums[0]?.length || 2;
    base = region==="HN" ? (len===2?27:len===3?23:0) : (len===2?18:len===3?17:16);
    qty = countNums;
  } else if(t==="bdao") {
    const len = part.nums[0]?.length || 3;
    base = region==="HN" ? (len===3?23:0) : (len===3?17:16);
    qty = part.nums.reduce((a,n)=>a+permCount(n),0);
  } else if(t==="xc" || t==="xcdau" || t==="xcduoi") {
    base = region==="HN" ? 4 : 2;
    qty = countNums;
  } else if(t==="xcdao") {
    base = region==="HN" ? 4 : 2;
    qty = part.nums.reduce((a,n)=>a+permCount(n),0);
  } else if(t==="dau") {
    base = region==="HN" ? 4 : 1;
    qty = countNums;
  } else if(t==="duoi") {
    base = 1;
    qty = countNums;
  } else if(t==="dd") {
    base = region==="HN" ? 5 : 2;
    qty = countNums;
  } else return 0;

  return base * qty * part.n * dai * r;
}
function calcBet(parsed, block){
  return parsed.parts.reduce((sum,p)=>sum+calcPart(p, block),0);
}

function runAll(){
  const blocks = splitBlocks(document.getElementById("inputData").value);
  const resultObj = parseAllResults();
  renderParsedResults(resultObj);

  let fast=[], detail=[], total=0;
  let tachBlocks = {};
  let khongBlocks = {};
  const hasKq = ["kqMn","kqMt","kqHn"].some(id=>document.getElementById(id).value.trim());

  for(const block of blocks){
    let blockMoney=0;
    let detailLines=[];
    fast.push(block.name);

    for(const line of block.lines){
      const parsed=parseBet(line);
      fast.push(line);

      if(!parsed){
        detailLines.push(line+" = lỗi đọc");
        addBlockLine(khongBlocks, block.name, line);
        continue;
      }

      const m=calcBet(parsed, block);
      blockMoney += m;
      detailLines.push(`${line} = ${money(m)}`);
      classifyTach(line, parsed, block, tachBlocks, khongBlocks);
    }

    total += blockMoney;
    fast.push("");
    detail.push(block.name);
    detail.push(...detailLines);
    detail.push("Tổng = "+money(blockMoney));
    detail.push("");
  }

  fast.push("Ghi: " + money(total));
  document.getElementById("copyFast").value = fast.join("\n").replace(/\n{3,}/g,"\n\n").trim();
  document.getElementById("ghi").value = "Ghi: " + money(total);
  document.getElementById("detail").value = detail.join("\n").trim() + "\n\nGhi: " + money(total);
  document.getElementById("thuong").value = hasKq ? "0  (v0.2 mới chuẩn hoá kết quả, dò thưởng sẽ gắn bước sau)" : "0";
  document.getElementById("soTrung").value = "";
  document.getElementById("soTach").value = renderBlockText(tachBlocks);
  document.getElementById("soKhongTach").value = renderBlockText(khongBlocks);
}

function addBlockLine(obj, blockName, line){
  if(!obj[blockName]) obj[blockName] = [];
  obj[blockName].push(line);
}
function renderBlockText(obj){
  const out = [];
  for(const [block, lines] of Object.entries(obj)){
    if(!lines.length) continue;
    out.push(block);
    out.push(...lines);
    out.push("");
  }
  return out.join("\n").trim();
}

function classifyTach(line, parsed, block, tachBlocks, khongBlocks){
  const xoaId = block.region==="HN" ? "xoaHn" : block.region==="MT" ? "xoaMt" : "xoaMn";
  const hasXoa = document.getElementById(xoaId).value.trim().length>0;
  const max2 = val("max2") || 10;
  const maxDa = val("maxDa") || 1;

  // Bản tách này chỉ lấy phần đủ điều kiện:
  // - Bao 2 số: bung từng con, áp max 2 số.
  // - Đá/ĐV: bung cặp đá, áp max đá.
  // - Các loại khác giữ nguyên ở Số không tách, kèm đúng tên đài/block gốc.
  if(!hasXoa){
    let taken = false;

    for(const part of parsed.parts){
      if(part.type==="b" && part.nums.every(n=>n.length===2)){
        part.nums.forEach(n=>{
          addBlockLine(tachBlocks, block.name, `${n}b${fmtN(Math.min(part.n,max2))}n`);
        });
        taken = true;
      } else if(part.type==="da"){
        addBlockLine(tachBlocks, block.name, `${part.nums.join(".")}da${fmtN(Math.min(part.n,maxDa))}n`);
        taken = true;
      } else if(part.type==="dv"){
        for(let i=0;i<part.nums.length;i++){
          for(let j=i+1;j<part.nums.length;j++){
            addBlockLine(tachBlocks, block.name, `${part.nums[i]}.${part.nums[j]}da${fmtN(Math.min(part.n,maxDa))}n`);
          }
        }
        taken = true;
      } else {
        // Phần không thuộc bao 2 số / đá thì giữ lại ở không tách
        // Nếu dòng ghép có một phần được tách và một phần không tách, tạm giữ nguyên dòng gốc để không mất dữ liệu.
      }
    }

    if(!taken){
      addBlockLine(khongBlocks, block.name, line);
    } else {
      const hasUntaken = parsed.parts.some(p=>{
        return !(p.type==="b" && p.nums.every(n=>n.length===2)) && p.type!=="da" && p.type!=="dv";
      });
      if(hasUntaken) addBlockLine(khongBlocks, block.name, line);
    }
    return;
  }

  const set = new Set(document.getElementById(xoaId).value.match(/\d{2}/g) || []);
  const nums = parsed.parts.flatMap(p=>p.nums.map(n=>n.slice(-2)));
  if(nums.some(n=>set.has(n))) addBlockLine(tachBlocks, block.name, line);
  else addBlockLine(khongBlocks, block.name, line);
}

function parseAllResults(){
  return {
    MN: parseResultText(document.getElementById("kqMn").value),
    MT: parseResultText(document.getElementById("kqMt").value),
    HN: parseResultText(document.getElementById("kqHn").value)
  };
}
function cleanName(s){
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
}
function mapDaiName(line){
  const raw = line.trim();
  const c = cleanName(raw);
  for(const [k,v] of Object.entries(NAME_MAP)){
    if(cleanName(k)===c) return v;
  }
  return null;
}
function parseResultText(text){
  const lines = text.split(/\n+/).map(x=>x.trim()).filter(Boolean);
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
      // Tạm quy ước: giữ full để sau gắn đúng giải; tạo thêm lớp đuôi để dò từng loại
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
  const obj = parseAllResults();
  renderParsedResults(obj);
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
