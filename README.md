# PX-SO v0.5.6

Chỉ sửa phần dò trúng / báo trúng:
- Không đổi mẫu/form đang ổn.
- Không hiện lại vùng chuẩn hóa/kết quả đã hiểu/bảng trung gian.
- Khi có dữ liệu kết quả, CHẠY sẽ dò ngầm và báo vào:
  - `Số trúng`
  - ô `Trúng`
- Format báo trúng:
  `VlongBduong`
  `01.02da1n 550k`
- Tiền trúng = n x ô hệ số tương ứng x số lần trúng.
- Giữ các khóa đúng:
  - Ghi mẫu lớn có `681xc10n` = `3168k`.
  - Copy nhanh không bung/gom.
  - Không có kết quả thì Trúng = `0`, Số trúng rỗng.
- index.html dùng `app.js?v=56` để tránh cache JS.
