# PX-SO v0.5.14 — compact font + saved history

Bản này nối tiếp v0.5.13.

Điểm chính:
- Vùng nhập dữ liệu tự chạy khi gõ/dán, không cần bấm CHẠY.
- Nút CHẠY LẠI giữ lại để chạy dự phòng khi cần.
- Giảm cỡ chữ toàn web để gọn hơn trên mobile.
- Thêm nút Lưu ở góc phải khung Dãy xoá.
- Thêm nút Lưu ở góc phải khung Vùng dán kết quả.
- Dữ liệu đã lưu giữ lại sau khi refresh/reset trang, miễn không xoá lịch sử/cache dữ liệu web của trình duyệt.
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

Ghi chú lưu dữ liệu:
- Nút Lưu trong Dãy xoá lưu cả MN/MT/HN vào localStorage của trình duyệt.
- Nút Lưu trong Vùng dán kết quả lưu cả MN/MT/HN vào localStorage của trình duyệt.
- Dữ liệu này không ghi ngược vào code GitHub; máy/trình duyệt khác sẽ không tự có dữ liệu đã lưu trên máy hiện tại.
