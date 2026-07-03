# PX-SO v0.5.13 — layout locked + auto-run

Bản này nối tiếp v0.5.12.

Điểm chính:
- Vùng nhập dữ liệu tự chạy khi gõ/dán, không cần bấm CHẠY.
- Nút CHẠY LẠI giữ lại để chạy dự phòng khi cần.
- Bố trí web/mobile đã khóa lại:
  1. Vùng nhập dữ liệu
  2. Copy nhanh
  3. Ghi / Trúng
  4. Số trúng
  5. Hệ số / cài đặt
  6. Số tách / Không tách
  7. Dãy xoá
  8. Vùng dán kết quả
- Sửa lỗi HTML lồng panel làm vị trí bị lệch.
- Dãy xoá và Vùng dán kết quả giữ dạng 3 cột MN/MT/HN.
- Số tách / Không tách giữ dạng 2 cột.
- Kết quả đã hiểu và Bảng trung gian vẫn ẩn.

Logic tính/dò giữ theo v0.5.12:
- Copy nhanh không bung dữ liệu trung gian.
- Dò đá DA/DV theo số lần trúng cặp bằng min(A,B), không nhân chéo.
