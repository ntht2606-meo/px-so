# PX-SO v0.5.10

Chỉ sửa logic đếm số lần trúng cho DA/DV:
- Trước đó DA/DV dùng nhân chéo `countA * countB`, dễ bị x2/x4 vô lý.
- Nay tính đúng theo cặp:
  - 1 đài: `hit = min(countA, countB)`
  - 2 đài: `hit = min(A ở đài 1, B ở đài 2) + min(B ở đài 1, A ở đài 2)`
- Bên dò thưởng dùng hitCount này để nhân hệ số.
- Không đổi form/mẫu.
- Không đổi hệ số.
- Giữ khóa:
  - Tin gốc đầy đủ Ghi = 3340,8k.
  - `Tninh\n93.97.07.29dv1n` Ghi = 172,8k.
  - Block 3dmn riêng Ghi = 3168k.
  - Ô Số trúng không còn dòng `Tổng trúng`.
- Cache-bust `app.js?v=510`.
