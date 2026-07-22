/*
  Phân tích dãy số v0.5.88 / cache5665
  PATCH: Khóa thứ tự output "Giữ nguyên" theo vùng dữ liệu.
  Thứ tự: D1, D2, D3, D4, ... rồi D1-2, D1-3, ...
  Chỉ đổi thứ tự block hiển thị; không đổi nội dung atomic, phân tách, đối chiếu hay trọng số.
*/
(function installKeepOutputZoneOrderPatch(global){
  "use strict";

  const originalBuildTach = global.buildTach;
  if(typeof originalBuildTach !== "function"){
    global.PX_KEEP_ZONE_ORDER_PATCH = {
      version:"0.5.88",
      cache:"5665",
      status:"BLOCKED_BUILD_TACH_NOT_FOUND"
    };
    return;
  }

  function uniqueInOrder(values){
    const seen = new Set();
    const out = [];
    for(const value of values || []){
      const key = String(value || "").trim();
      if(!key || seen.has(key)) continue;
      seen.add(key);
      out.push(key);
    }
    return out;
  }

  function sourceScopeDais(blocks){
    const out = [];
    for(const block of blocks || []){
      for(const dai of (block && block.dais) || []) out.push(dai);
    }
    return uniqueInOrder(out);
  }

  function fallbackDaisFromHeader(header){
    if(typeof global.getDaisFromName === "function"){
      const found = global.getDaisFromName(header);
      if(Array.isArray(found) && found.length && found[0] !== header) return found;
      if(Array.isArray(found) && found.length && /^[A-Za-zÀ-ỹ]+$/.test(String(header || ""))) return found;
    }
    const raw = String(header || "").trim();
    return raw ? [raw] : [];
  }

  function headerDais(header, scope){
    const raw = String(header || "").trim();
    const generic = raw.match(/^([234])d(?:mn|mt)$/i);
    if(generic){
      const count = Math.max(1, Math.min(Number(generic[1]) || 1, scope.length));
      return scope.slice(0, count);
    }
    return uniqueInOrder(fallbackDaisFromHeader(raw));
  }

  function zoneMetaForHeader(header, scope, originalIndex){
    const dais = headerDais(header, scope);
    const indices = uniqueInOrder(dais)
      .map(dai => scope.indexOf(dai))
      .filter(index => index >= 0)
      .map(index => index + 1)
      .sort((a,b) => a - b);

    if(!indices.length){
      return {
        known:false,
        width:999,
        indices:[9999],
        originalIndex
      };
    }

    return {
      known:true,
      width:indices.length,
      indices,
      originalIndex
    };
  }

  function compareZoneMeta(a, b){
    if(a.known !== b.known) return a.known ? -1 : 1;
    // Vùng đơn trước vùng ghép; sau đó các vùng rộng hơn.
    if(a.width !== b.width) return a.width - b.width;
    const len = Math.max(a.indices.length, b.indices.length);
    for(let i=0; i<len; i++){
      const av = a.indices[i] == null ? 9999 : a.indices[i];
      const bv = b.indices[i] == null ? 9999 : b.indices[i];
      if(av !== bv) return av - bv;
    }
    return a.originalIndex - b.originalIndex;
  }

  function splitOutputBlocks(text){
    const lines = String(text || "").replace(/\r/g, "").split("\n");
    const groups = [];
    let current = null;

    const flush = () => {
      if(!current) return;
      while(current.lines.length && current.lines[current.lines.length - 1] === "") current.lines.pop();
      groups.push(current);
      current = null;
    };

    for(const line of lines){
      const trimmed = line.trim();
      const isHeader = trimmed && !/^\d/.test(trimmed);
      if(isHeader){
        flush();
        current = {header:trimmed, lines:[trimmed], originalIndex:groups.length};
        continue;
      }
      if(!current){
        if(!trimmed) continue;
        current = {header:"", lines:[], originalIndex:groups.length};
      }
      current.lines.push(line);
    }
    flush();
    return groups;
  }

  function reorderKeepOutput(text, blocks){
    const groups = splitOutputBlocks(text);
    if(groups.length <= 1) return String(text || "").trim();

    const scope = sourceScopeDais(blocks);
    if(scope.length <= 1) return String(text || "").trim();

    groups.forEach((group, index) => {
      group.originalIndex = index;
      group.zoneMeta = zoneMetaForHeader(group.header, scope, index);
    });
    groups.sort((a,b) => compareZoneMeta(a.zoneMeta, b.zoneMeta));
    return groups.map(group => group.lines.join("\n").trim()).filter(Boolean).join("\n\n").trim();
  }

  function patchedBuildTach(blocks){
    const result = originalBuildTach.apply(this, arguments) || {};
    return {
      ...result,
      khong:reorderKeepOutput(result.khong, blocks)
    };
  }

  // Giữ tham chiếu để kiểm thử/audit, nhưng chỉ thay đúng điểm vào buildTach.
  patchedBuildTach.__original = originalBuildTach;
  patchedBuildTach.__patchVersion = "0.5.88-cache5665";
  global.buildTach = patchedBuildTach;
  global.PX_KEEP_ZONE_ORDER_PATCH = {
    version:"0.5.88",
    cache:"5665",
    status:"ACTIVE",
    reorderKeepOutput,
    sourceScopeDais,
    zoneMetaForHeader,
    compareZoneMeta
  };
})(typeof window !== "undefined" ? window : globalThis);
