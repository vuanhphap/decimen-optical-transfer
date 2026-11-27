# Optical Transfer HTML – bản đóng gói thử nghiệm

Dựa trên Decimen v0.5.3 (wire format v3), giữ nguyên mã hóa fountain LT, bộ tạo QR, giải mã WebAssembly và kiểm SHA-256 của dự án gốc. Phần mới là trình chọn chế độ tiếng Việt, tích hợp hai trang standalone và cảnh báo tương thích. Các màn hình điều khiển gốc chưa được Việt hóa.

## Build

Yêu cầu Node theo `.nvmrc`. Từ thư mục repo:

```sh
npm ci
npm test
npm run build:optical-html
```

Đầu ra trong `dist-standalone/`:
- `optical-transfer.html`: trình chọn Gửi/Nhận, nhúng hai trang bằng base64.
- `decimen-sender.html`: trang gửi độc lập.
- `decimen-receiver.html`: trang nhận độc lập.

GitHub Actions workflow Optical HTML kiểm tra byte của hai payload nhúng, chạy test của repo, tạo SHA256SUMS.txt và upload artifact. Fork có thể cần bật Actions thủ công trước khi chạy.

## Sử dụng và giới hạn

- Trên máy gửi: mở file HTML trong trình duyệt, chọn Gửi file.
- Trên máy nhận: dùng HTTPS để có quyền camera; nếu trình duyệt không cấp quyền trong iframe, dùng trang receiver riêng ở HTTPS. iOS/Android thường không cấp camera cho file://.
- Chọn dữ liệu thử nghiệm không nhạy cảm và được phép chia sẻ.
- Không mã hóa nội dung, không ghép nối; SHA-256 chỉ kiểm toàn vẹn, không xác thực người gửi. Không hỗ trợ tiếp tục phiên sau khi tải lại trang.
- Cần kiểm thử camera thật trên từng trình duyệt; chưa xác nhận hiệu năng của trình ghép.
- Nguồn và giấy phép: giữ nguyên LICENSE, NOTICE và ghi công Decimen; mã nguồn bản chỉnh sửa ở nhánh này.

