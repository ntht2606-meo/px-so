# PX-SO v0.5.18

Bản sửa lỗi mất phần dư sau khi áp max trên nền v0.5.17 REBUILD.

Đã sửa:
- `b20n` với `Max 2 số = 10` sẽ tách thành:
  - Số tách: `b10n`
  - Số không tách: `b10n`
- `da/dv` vượt `Max đá` cũng giữ phần dư ở Số không tách.
- Không còn mất dữ liệu khi dòng hợp lệ được chia một phần sang Số tách.

Không sửa:
- Không đổi logic tính tiền.
- Không đổi logic dò trúng.
- Không đổi vị trí Copy nhanh / Vùng nhập dữ liệu.
- Không đổi lưu Hệ số / Dãy xoá / Vùng dán kết quả.
