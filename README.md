# PX-SO v0.5.10 — rewrite từ v0.5.9

Viết lại từ bản trước v0.5.9 theo nhiệm vụ mới.

Chỉ sửa:
- Logic dò trúng DA/DV.
- DA/DV không còn nhân chéo `countA * countB`.
- Đá 1 đài: `hit = min(countA, countB)`.
- Đá 2 đài: `hit = min(A đài 1, B đài 2) + min(B đài 1, A đài 2)`.

Giữ nguyên:
- Không đổi mẫu/form.
- Vùng dán kết quả vẫn hiện để nhập kết quả thô MN/MT/HN.
- Nút `Chuẩn hoá kết quả` vẫn bỏ.
- `Kết quả đã hiểu` vẫn ẩn.
- `Bảng trung gian` vẫn ẩn.
- Ô `Số trúng` báo gọn, không có dòng `Tổng trúng`.
- Tổng tiền trúng nằm ở ô `Trúng`.
- Ghi DA/DV 1 đài MN/MT vẫn tính đúng.

Test khóa:
- Tin gốc đầy đủ = `3340,8k`.
- Block 3dmn riêng = `3168k`.
- `Tninh\n93.97.07.29dv1n` = `172,8k`.
- DA 2 đài basic `01.02da1n` = `550k`.
- DA 2 đài nhiều lần: hit = min, không nhân chéo.
- DA 1 đài nhiều lần: hit = min, không nhân chéo.
