(() => {
  "use strict";

  const APP_PREFIX = "GENERIC_ATOMIC_RESET_V1";
  const WORKSPACE = "NHOM_CHUNG";

  const el = {
    maxValue: document.getElementById("maxValue"),
    inputData: document.getElementById("inputData"),
    splitOutput: document.getElementById("splitOutput"),
    keptOutput: document.getElementById("keptOutput"),
    status: document.getElementById("status"),
    splitBtn: document.getElementById("splitBtn"),
    copyBtn: document.getElementById("copyBtn"),
    clearBtn: document.getElementById("clearBtn"),
    sample1Btn: document.getElementById("sample1Btn"),
    sample2Btn: document.getElementById("sample2Btn")
  };

  let runtimeState = emptyState();
  let atomicIndex = new Map();
  let renderCache = "";

  function emptyState() {
    return {
      version: 1,
      acceptedRecords: []
    };
  }

  function localDayKey() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function storageKey() {
    return `${APP_PREFIX}:${localDayKey()}:${WORKSPACE}`;
  }

  function canonicalPair(a, b) {
    return [a.trim(), b.trim()].sort((x, y) => x.localeCompare(y, "vi")).join(".");
  }

  function parseSourceLine(line) {
    const m = line.trim().match(/^([A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)+)#(\d+)$/);
    if (!m) {
      throw new Error(`Dòng không hợp lệ: "${line}"`);
    }

    const items = m[1].split(".").map(x => x.trim()).filter(Boolean);
    const amount = Number(m[2]);

    if (items.length < 2) {
      throw new Error(`Dòng cần ít nhất 2 mục: "${line}"`);
    }
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new Error(`Mức phải là số nguyên dương: "${line}"`);
    }

    const atomicDeltas = new Map();

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const key = `${canonicalPair(items[i], items[j])}#${amount}`;
        atomicDeltas.set(key, (atomicDeltas.get(key) || 0) + 1);
      }
    }

    return { original: line.trim(), atomicDeltas };
  }

  function parseInput(text) {
    const lines = text.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
    const records = [];
    let currentGroup = "NHOM_CHUNG";

    for (const line of lines) {
      if (/^NHOM_[A-Za-z0-9_-]+$/i.test(line)) {
        currentGroup = line.toUpperCase();
        continue;
      }
      records.push({ group: currentGroup, ...parseSourceLine(line) });
    }

    return records;
  }

  function rebuildAtomicIndex() {
    atomicIndex = new Map();

    for (const record of runtimeState.acceptedRecords) {
      for (const [key, delta] of Object.entries(record.atomicDeltas)) {
        atomicIndex.set(key, (atomicIndex.get(key) || 0) + Number(delta));
      }
    }
  }

  function loadState() {
    const raw = localStorage.getItem(storageKey());
    if (!raw) {
      runtimeState = emptyState();
      rebuildAtomicIndex();
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      runtimeState = {
        version: 1,
        acceptedRecords: Array.isArray(parsed.acceptedRecords) ? parsed.acceptedRecords : []
      };
    } catch {
      runtimeState = emptyState();
    }

    rebuildAtomicIndex();
  }

  function saveState() {
    localStorage.setItem(storageKey(), JSON.stringify(runtimeState));
  }

  function groupRecords(records) {
    const grouped = new Map();
    for (const record of records) {
      if (!grouped.has(record.group)) grouped.set(record.group, []);
      grouped.get(record.group).push(record.original);
    }
    return grouped;
  }

  function formatRecords(records) {
    const grouped = groupRecords(records);
    const blocks = [];

    for (const [group, lines] of grouped.entries()) {
      blocks.push([group, ...lines].join("\n"));
    }

    return blocks.join("\n\n");
  }

  function render() {
    renderCache = formatRecords(runtimeState.acceptedRecords);
    el.splitOutput.value = renderCache;
  }

  function processCurrentInput() {
    const max = Number(el.maxValue.value);
    if (!Number.isInteger(max) || max < 1) {
      setStatus("LỖI: Mức tối đa phải là số nguyên từ 1 trở lên.");
      return;
    }

    let incoming;
    try {
      incoming = parseInput(el.inputData.value);
    } catch (error) {
      setStatus(`LỖI: ${error.message}`);
      return;
    }

    const kept = [];
    const acceptedNow = [];

    for (const record of incoming) {
      let exceeds = false;

      for (const [key, delta] of record.atomicDeltas.entries()) {
        const oldCount = atomicIndex.get(key) || 0;
        if (oldCount + delta > max) {
          exceeds = true;
          break;
        }
      }

      if (exceeds) {
        kept.push(record);
        continue;
      }

      const serializable = {
        group: record.group,
        original: record.original,
        atomicDeltas: Object.fromEntries(record.atomicDeltas.entries())
      };

      runtimeState.acceptedRecords.push(serializable);
      acceptedNow.push(serializable);

      for (const [key, delta] of record.atomicDeltas.entries()) {
        atomicIndex.set(key, (atomicIndex.get(key) || 0) + delta);
      }
    }

    saveState();
    render();
    el.keptOutput.value = formatRecords(kept);

    setStatus([
      `ĐÃ XỬ LÝ`,
      `Được thêm vào vùng Đã tách: ${acceptedNow.length} dòng`,
      `Chuyển sang Giữ nguyên: ${kept.length} dòng`,
      `Tổng atomic đang ghi nhớ: ${atomicIndex.size}`,
      `Khóa lưu: ${storageKey()}`
    ].join("\n"));
  }

  function clearProcessedState() {
    const key = storageKey();

    // 1) Xóa dữ liệu lưu lâu dài
    localStorage.removeItem(key);

    // 2) Xóa toàn bộ trạng thái đang chạy
    runtimeState = emptyState();
    atomicIndex = new Map();
    renderCache = "";

    // 3) Xóa dữ liệu hiển thị
    el.splitOutput.value = "";
    el.keptOutput.value = "";

    // 4) Xác minh đã xóa thật
    const persisted = localStorage.getItem(key);
    if (persisted !== null) {
      setStatus("LỖI: Không xóa được bộ nhớ lưu. Trạng thái chưa được đặt về 0.");
      return;
    }

    setStatus([
      "ĐÃ XÓA HOÀN TOÀN",
      "Vùng Đã tách: rỗng",
      "Bộ nhớ atomic: 0",
      "Bộ nhớ đang chạy: 0",
      "Lần bấm Tách tiếp theo chỉ xét đầu vào hiện tại"
    ].join("\n"));
  }

  async function copySplitOutput() {
    const text = el.splitOutput.value;
    if (!text) {
      setStatus("Không có dữ liệu trong vùng Đã tách để sao chép.");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setStatus("Đã sao chép nội dung vùng Đã tách.");
    } catch {
      el.splitOutput.focus();
      el.splitOutput.select();
      document.execCommand("copy");
      setStatus("Đã sao chép nội dung vùng Đã tách.");
    }
  }

  function setStatus(message) {
    el.status.textContent = message;
  }

  function runSelfTest() {
    const fakeIndex = new Map();

    const first = parseSourceLine("A.B#1");
    for (const [key, delta] of first.atomicDeltas) {
      fakeIndex.set(key, (fakeIndex.get(key) || 0) + delta);
    }

    const second = parseSourceLine("A.B.C#1");
    const shouldReject = [...second.atomicDeltas.entries()]
      .some(([key, delta]) => (fakeIndex.get(key) || 0) + delta > 1);

    fakeIndex.clear();

    const afterClearCanAccept = [...first.atomicDeltas.entries()]
      .every(([key, delta]) => (fakeIndex.get(key) || 0) + delta <= 1);

    return shouldReject && afterClearCanAccept;
  }

  el.sample1Btn.addEventListener("click", () => {
    el.inputData.value = "NHOM_A\nA.B#1";
  });

  el.sample2Btn.addEventListener("click", () => {
    el.inputData.value = "NHOM_A\nA.B.C#1";
  });

  el.splitBtn.addEventListener("click", processCurrentInput);
  el.clearBtn.addEventListener("click", clearProcessedState);
  el.copyBtn.addEventListener("click", copySplitOutput);

  loadState();
  render();

  setStatus(
    runSelfTest()
      ? "Kiểm thử nội bộ: ĐẠT\nBấm Nạp mẫu 1 → Tách → Nạp mẫu 2 → Tách → Xóa → Nạp mẫu 1 → Tách."
      : "Kiểm thử nội bộ: KHÔNG ĐẠT"
  );
})();
