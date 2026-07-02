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
function dayIndex(){
  // JS: 0 CN, 1 T2...
  return new Date().getDay();
}
function normalizeLine(s){
  return s.trim()
    .replace(/\s+/g,"")
    .replace(/đá/gi,"da")
    .replace(/đầu/gi,"dau")
    .replace(/đuôi|đui/gi,"duoi")
    .replace(/đđ/gi,"dd")
    .replace(/,/g,",");
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
  // tạm tính: block ghép không có dấu cách thì khó đếm, mặc định 1; các mapping tổng quát đã xử lý riêng.
  return 1;
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
function parseBet(line){
  const m = line.match(/^([0-9.]+)(bdao|xcdao|xcdau|xcduoi|duoi|dau|dd|b|xc|da|dv)([\d,.]+)n$/i);
  if(!m) return null;
  return {nums:m[1].split(".").filter(Boolean), type:m[2].toLowerCase(), n:parseFloat(m[3].replace(",","."))||0, raw:line};
}
function permCount(s){
  const arr = String(s).split("");
  const fact = n => n<=1?1:n*fact(n-1);
  const counts={}; arr.forEach(c=>counts[c]=(counts[c]||0)+1);
  let den=1; Object.values(counts).forEach(c=>den*=fact(c));
  return fact(arr.length)/den;
}
function pairCount(nums){
  return nums.length<2?0:(nums.length*(nums.length-1))/2;
}
function calcLine(bet, block){
  const r = val("rate");
  const region = block.region;
  const dai = region==="HN" ? 1 : block.dai;
  const t = bet.type;
  const countNums = bet.nums.length;
  let base = 0, qty = 1;

  if(t==="da") {
    base = region==="HN" ? val("dahn") : (dai>=2 ? val("da2") : val("da1"));
    qty = 1;
  } else if(t==="dv") {
    base = region==="HN" ? val("dahn") : (dai>=2 ? val("da2") : val("da1"));
    qty = pairCount(bet.nums);
  } else if(t==="b") {
    const len = bet.nums[0]?.length || 2;
    base = len===2 ? val("so2") : len===3 ? val("so3") : val("so4");
    qty = countNums;
  } else if(t==="bdao") {
    const len = bet.nums[0]?.length || 3;
    base = len===3 ? val("so3") : val("so4");
    qty = bet.nums.reduce((a,n)=>a+permCount(n),0);
  } else if(t==="xc" || t==="xcdau" || t==="xcduoi") {
    base = region==="HN" ? 4 : 2;
    qty = countNums;
  } else if(t==="xcdao") {
    base = region==="HN" ? 4 : 2;
    qty = bet.nums.reduce((a,n)=>a+permCount(n),0);
  } else if(t==="dau" || t==="duoi") {
    base = region==="HN" ? (t==="dau"?4:1) : 1;
    qty = countNums;
  } else if(t==="dd") {
    base = region==="HN" ? 5 : 2;
    qty = countNums;
  } else return 0;

  return base * qty * bet.n * dai * r;
}
function runAll(){
  const blocks = splitBlocks(document.getElementById("inputData").value);
  let out=[], total=0;
  let tach=[], khong=[];
  const hasKq = ["kqMn","kqMt","kqHn"].some(id=>document.getElementById(id).value.trim());
  for(const block of blocks){
    let blockMoney=0;
    let linesOut=[];
    for(const line of block.lines){
      const bet=parseBet(line);
      if(!bet){ linesOut.push(line+" = lỗi đọc"); khong.push(line); continue; }
      const m=calcLine(bet, block);
      blockMoney += m;
      linesOut.push(`${line} = ${money(m)}`);
      classifyTach(line, bet, block, tach, khong);
    }
    total += blockMoney;
    out.push(block.name);
    out.push(...linesOut);
    out.push("Tổng = "+money(blockMoney));
    out.push("");
  }
  document.getElementById("ghi").value = out.join("\n").trim() + "\n\nGhi: " + money(total);
  document.getElementById("thuong").value = hasKq ? "Đang chờ gắn dò thưởng" : "0";
  document.getElementById("soTrung").value = hasKq ? "Bản v0.1 chưa dò chi tiết" : "";
  document.getElementById("soTach").value = tach.join("\n");
  document.getElementById("soKhongTach").value = khong.join("\n");
}
function classifyTach(line, bet, block, tach, khong){
  // v0.1: nếu chưa có dãy xoá thì mặc định tách bao 2 số và đá/DV, áp max
  const xoaId = block.region==="HN" ? "xoaHn" : block.region==="MT" ? "xoaMt" : "xoaMn";
  const hasXoa = document.getElementById(xoaId).value.trim().length>0;
  const max2 = val("max2") || 10;
  const maxDa = val("maxDa") || 1;

  if(!hasXoa){
    if(bet.type==="b" && bet.nums.every(n=>n.length===2)){
      bet.nums.forEach(n=>{
        const nn = Math.min(bet.n, max2);
        tach.push(`${n}b${fmtN(nn)}n`);
      });
    } else if(bet.type==="da"){
      tach.push(`${bet.nums.join(".")}da${fmtN(Math.min(bet.n,maxDa))}n`);
    } else if(bet.type==="dv"){
      for(let i=0;i<bet.nums.length;i++){
        for(let j=i+1;j<bet.nums.length;j++){
          tach.push(`${bet.nums[i]}.${bet.nums[j]}da${fmtN(Math.min(bet.n,maxDa))}n`);
        }
      }
    } else {
      khong.push(line);
    }
    return;
  }

  // v0.1 tách theo dãy xoá: có số nằm trong dãy xoá thì đưa số tách, còn lại không tách
  const set = new Set(document.getElementById(xoaId).value.match(/\d{2}/g) || []);
  if(bet.nums.some(n=>set.has(n.slice(-2)))) tach.push(line); else khong.push(line);
}
function fmtN(n){
  return String(Math.round(n*100)/100).replace(".",",");
}
async function copyText(id){
  const t=document.getElementById(id).value;
  await navigator.clipboard.writeText(t);
  alert("Đã copy");
}
function clearAll(){
  ["inputData","ghi","thuong","soTrung","soTach","soKhongTach"].forEach(id=>document.getElementById(id).value="");
  document.getElementById("thuong").value="0";
}
