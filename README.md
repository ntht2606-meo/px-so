# PX-SO v0.5.4

Chỉnh giao diện:
- Ẩn `Kết quả đã hiểu`.
- Ẩn `Bảng trung gian`.
- Hai phần này vẫn tồn tại trong DOM/code để app xử lý nội bộ, nhưng không hiện trên màn hình.
- Cache-bust cả `style.css?v=54` và `app.js?v=54` để tránh Safari/GitHub Pages giữ CSS cũ.
- Giữ các khóa đúng từ v0.5.3:
  - Ghi = 3168k với tin mẫu lớn có `681xc10n`.
  - CHẠY không tự chuẩn hóa kết quả.
  - Nút `Chuẩn hoá kết quả` mới chuẩn hóa kết quả.
  - Copy nhanh không bung/gom.
  - Bỏ nút Copy ghi / Copy trúng.
