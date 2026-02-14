-- Thêm dữ liệu chi bộ
INSERT INTO branches (code, name) VALUES
('VP', 'Văn phòng Trung tâm'),
('BT', 'Đội Bảo trì Sân đường'),
('MT', 'Đội Môi trường Khu bay'),
('CD', 'Đội Thiết bị Cơ, Điện, Đèn Sân bay'),
('TT', 'Đội Thiết bị Thông tin Dẫn đường');

-- Thêm người dùng
INSERT INTO users (username, password, full_name, role, branch_id) VALUES
('admin', MD5('admin123'), 'Nguyễn Văn Admin', 'admin', 1),
('bithu_VP', MD5('bithu123'), 'Trần Văn Bí thư VP', 'bithu', 1),
('bithu_BT', MD5('bithu123'), 'Lê Thị Bí thư BT', 'bithu', 2),
('guest', MD5('guest123'), 'Khách Tham Quan', 'guest', NULL);
