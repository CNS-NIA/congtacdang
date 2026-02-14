// Mock API Service - Có thể thay thế bằng API thật
class ApiService {
    constructor() {
        this.initStorage();
    }
    
    // Khởi tạo storage
    initStorage() {
        // Kiểm tra và khởi tạo dữ liệu mẫu
        if (!localStorage.getItem(StorageKeys.MEMBERS_DATA)) {
            this.generateMockData();
        }
        
        if (!localStorage.getItem(StorageKeys.USERS_DATA)) {
            this.generateMockUsers();
        }
        
        if (!localStorage.getItem(StorageKeys.SETTINGS)) {
            this.initSettings();
        }
    }
    
    // Tạo dữ liệu mẫu
    generateMockData() {
        const mockMembers = this.createMockMembers(50);
        this.saveData(StorageKeys.MEMBERS_DATA, mockMembers);
        
        const mockDocuments = this.createMockDocuments(30);
        this.saveData(StorageKeys.DOCUMENTS_DATA, mockDocuments);
        
        const mockMeetings = this.createMockMeetings(20);
        this.saveData(StorageKeys.MEETINGS_DATA, mockMeetings);
        
        const mockActivities = this.createMockActivities(100);
        this.saveData(StorageKeys.ACTIVITIES_DATA, mockActivities);
    }
    
    // Tạo người dùng mẫu
    generateMockUsers() {
        const users = [
            {
                id: 'admin',
                username: 'admin',
                password: 'admin123', // Trong thực tế cần mã hóa
                fullName: 'Quản trị viên Hệ thống',
                email: 'admin@dang.vn',
                role: 'admin',
                branch: 'VP',
                avatar: 'https://ui-avatars.com/api/?name=Admin&background=C62828&color=fff&bold=true',
                createdAt: new Date().toISOString(),
                lastLogin: null
            },
            {
                id: 'user1',
                username: 'bithu_chi_bo_vp',
                password: '123456',
                fullName: 'Nguyễn Văn A',
                email: 'nguyenvana@example.com',
                role: 'manager',
                branch: 'VP',
                avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=2E7D32&color=fff',
                createdAt: new Date().toISOString(),
                lastLogin: null
            },
            {
                id: 'user2',
                username: 'dang_vien_bt',
                password: '123456',
                fullName: 'Trần Thị B',
                email: 'tranthib@example.com',
                role: 'user',
                branch: 'BT',
                avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=F57C00&color=fff',
                createdAt: new Date().toISOString(),
                lastLogin: null
            }
        ];
        
        this.saveData(StorageKeys.USERS_DATA, users);
    }
    
    // Khởi tạo cài đặt
    initSettings() {
        const settings = {
            theme: 'light',
            language: 'vi',
            pageSize: 20,
            notifications: true,
            autoBackup: false,
            backupInterval: 7, // ngày
            lastBackup: null
        };
        
        this.saveData(StorageKeys.SETTINGS, settings);
    }
    
    // Tạo đảng viên mẫu
    createMockMembers(count) {
        const members = [];
        const firstNames = ['Nguyễn Văn', 'Trần Thị', 'Lê Văn', 'Phạm Thị', 'Hoàng Văn', 'Đặng Thị', 'Bùi Văn', 'Đỗ Thị'];
        const lastNames = ['An', 'Bình', 'Chung', 'Duyên', 'Em', 'Phúc', 'Giang', 'Hạnh', 'Khánh', 'Long'];
        const branches = AppConfig.BRANCHES.map(b => b.id);
        const positions = AppConfig.POSITIONS;
        const educationLevels = AppConfig.EDUCATION_LEVELS;
        
        for (let i = 1; i <= count; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const fullName = `${firstName} ${lastName}`;
            const branch = branches[Math.floor(Math.random() * branches.length)];
            const status = Math.random() > 0.7 ? 'retired' : 'active';
            
            // Ngày sinh từ 1950-2000
            const birthYear = 1950 + Math.floor(Math.random() * 50);
            const birthMonth = Math.floor(Math.random() * 12) + 1;
            const birthDay = Math.floor(Math.random() * 28) + 1;
            const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
            
            // Ngày vào Đảng (sau 18 tuổi)
            const minJoinYear = birthYear + 20;
            const joinYear = minJoinYear + Math.floor(Math.random() * (2024 - minJoinYear));
            const joinDate = new Date(joinYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
            
            members.push({
                id: `M${i.toString().padStart(4, '0')}`,
                soTheDangVien: `ĐV-${branch}-${i.toString().padStart(5, '0')}`,
                hoTen: fullName,
                ngaySinh: birthDate.toISOString().split('T')[0],
                gioiTinh: Math.random() > 0.5 ? 'Nam' : 'Nữ',
                danToc: 'Kinh',
                tonGiao: Math.random() > 0.8 ? 'Không' : 'Phật giáo',
                queQuan: 'Hà Nội',
                ngheNghiep: 'Cán bộ',
                trinhDo: educationLevels[Math.floor(Math.random() * educationLevels.length)],
                ngayVaoDang: joinDate.toISOString().split('T')[0],
                ngayChinhThuc: this.addMonths(joinDate, 12).toISOString().split('T')[0],
                chiBo: branch,
                chucVu: i % 10 === 0 ? positions[Math.floor(Math.random() * 4) + 1] : 'Đảng viên',
                trangThai: status,
                dienThoai: `09${Math.floor(Math.random() * 90000000 + 10000000)}`,
                email: `${fullName.toLowerCase().replace(/\s/g, '.')}@dang.vn`,
                diaChi: `${Math.floor(Math.random() * 200) + 1} Đường XYZ, Quận ABC, Hà Nội`,
                avatar: Utils.createAvatar(fullName),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'admin'
            });
        }
        
        return members;
    }
    
    // Tạo văn bản mẫu
    createMockDocuments(count) {
        const documents = [];
        const types = ['Quyết định', 'Thông báo', 'Nghị quyết', 'Báo cáo', 'Kế hoạch', 'Công văn'];
        const statuses = ['draft', 'pending', 'approved', 'rejected', 'archived'];
        
        for (let i = 1; i <= count; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 365));
            
            documents.push({
                id: `DOC${i.toString().padStart(4, '0')}`,
                soHieu: `${type.substring(0, 2)}-${date.getFullYear()}/${i.toString().padStart(3, '0')}`,
                tenVanBan: `${type} về công tác Đảng tháng ${date.getMonth() + 1}/${date.getFullYear()}`,
                loaiVanBan: type,
                ngayBanHanh: date.toISOString().split('T')[0],
                noiBanHanh: 'Đảng ủy',
                trichYeu: `Nội dung tóm tắt của ${type.toLowerCase()} số ${i}`,
                nguoiKy: 'Nguyễn Văn A',
                fileDinhKem: Math.random() > 0.5 ? 'document.pdf' : null,
                trangThai: statuses[Math.floor(Math.random() * statuses.length)],
                chiBo: AppConfig.BRANCHES[Math.floor(Math.random() * AppConfig.BRANCHES.length)].id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'admin'
            });
        }
        
        return documents;
    }
    
    // Tạo cuộc họp mẫu
    createMockMeetings(count) {
        const meetings = [];
        const types = ['Sinh hoạt chi bộ', 'Họp Đảng ủy', 'Hội nghị', 'Tọa đàm', 'Gặp mặt'];
        const statuses = ['planned', 'ongoing', 'completed', 'cancelled'];
        
        for (let i = 1; i <= count; i++) {
            const date = new Date();
            date.setDate(date.getDate() + Math.floor(Math.random() * 30) - 15); // +/- 15 ngày
            const duration = [60, 90, 120, 180][Math.floor(Math.random() * 4)];
            
            meetings.push({
                id: `MTG${i.toString().padStart(4, '0')}`,
                tenCuocHop: `${types[Math.floor(Math.random() * types.length)]} tháng ${date.getMonth() + 1}`,
                loaiCuocHop: types[Math.floor(Math.random() * types.length)],
                thoiGian: date.toISOString(),
                thoiLuong: duration,
                diaDiem: 'Phòng họp Đảng ủy',
                chuTri: 'Nguyễn Văn A',
                thuKy: 'Trần Thị B',
                thanhPhan: ['admin', 'user1', 'user2'],
                noiDung: `Nội dung cuộc họp về công tác Đảng tháng ${date.getMonth() + 1}`,
                trangThai: statuses[Math.floor(Math.random() * statuses.length)],
                chiBo: AppConfig.BRANCHES[Math.floor(Math.random() * AppConfig.BRANCHES.length)].id,
                bienBan: Math.random() > 0.7 ? 'minutes.pdf' : null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'admin'
            });
        }
        
        return meetings;
    }
    
    // Tạo hoạt động mẫu
    createMockActivities(count) {
        const activities = [];
        const actions = ['Thêm mới', 'Cập nhật', 'Xóa', 'Đăng nhập', 'Xuất báo cáo', 'Import dữ liệu'];
        const modules = ['Đảng viên', 'Văn bản', 'Cuộc họp', 'Hệ thống', 'Báo cáo'];
        
        for (let i = 1; i <= count; i++) {
            const date = new Date();
            date.setHours(date.getHours() - Math.floor(Math.random() * 168)); // 7 ngày gần đây
            
            activities.push({
                id: `ACT${i.toString().padStart(4, '0')}`,
                action: actions[Math.floor(Math.random() * actions.length)],
                module: modules[Math.floor(Math.random() * modules.length)],
                description: `${actions[Math.floor(Math.random() * actions.length)]} ${modules[Math.floor(Math.random() * modules.length)].toLowerCase()}`,
                userId: 'admin',
                userName: 'Quản trị viên',
                timestamp: date.toISOString(),
                ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
                details: JSON.stringify({ sample: 'data' })
            });
        }
        
        // Sắp xếp theo thời gian mới nhất
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        return activities.slice(0, count);
    }
    
    // Helper: thêm tháng
    addMonths(date, months) {
        const newDate = new Date(date);
        newDate.setMonth(newDate.getMonth() + months);
        return newDate;
    }
    
    // ==================== CRUD OPERATIONS ====================
    
    // Lưu dữ liệu
    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Lỗi lưu dữ liệu:', error);
            return false;
        }
    }
    
    // Lấy dữ liệu
    getData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Lỗi đọc dữ liệu:', error);
            return null;
        }
    }
    
    // ==================== MEMBERS API ====================
    
    async getMembers(page = 1, pageSize = 20, filters = {}) {
        let members = this.getData(StorageKeys.MEMBERS_DATA) || [];
        
        // Áp dụng filters
        members = this.applyFilters(members, filters);
        
        // Phân trang
        const total = members.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginated = members.slice(start, end);
        
        return {
            data: paginated,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize)
            }
        };
    }
    
    async getMemberById(id) {
        const members = this.getData(StorageKeys.MEMBERS_DATA) || [];
        return members.find(m => m.id === id) || null;
    }
    
    async createMember(memberData) {
        const members = this.getData(StorageKeys.MEMBERS_DATA) || [];
        const newMember = {
            ...memberData,
            id: Utils.generateId('M'),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: this.getCurrentUser()?.username || 'system'
        };
        
        members.unshift(newMember);
        this.saveData(StorageKeys.MEMBERS_DATA, members);
        
        // Ghi log activity
        this.logActivity('Thêm mới', 'Đảng viên', `Thêm đảng viên: ${memberData.hoTen}`);
        
        return newMember;
    }
    
    async updateMember(id, memberData) {
        const members = this.getData(StorageKeys.MEMBERS_DATA) || [];
        const index = members.findIndex(m => m.id === id);
        
        if (index === -1) return null;
        
        members[index] = {
            ...members[index],
            ...memberData,
            updatedAt: new Date().toISOString()
        };
        
        this.saveData(StorageKeys.MEMBERS_DATA, members);
        
        // Ghi log activity
        this.logActivity('Cập nhật', 'Đảng viên', `Cập nhật đảng viên: ${memberData.hoTen || members[index].hoTen}`);
        
        return members[index];
    }
    
    async deleteMember(id) {
        const members = this.getData(StorageKeys.MEMBERS_DATA) || [];
        const member = members.find(m => m.id === id);
        const filtered = members.filter(m => m.id !== id);
        
        this.saveData(StorageKeys.MEMBERS_DATA, filtered);
        
        // Ghi log activity
        if (member) {
            this.logActivity('Xóa', 'Đảng viên', `Xóa đảng viên: ${member.hoTen}`);
        }
        
        return true;
    }
    
    async searchMembers(query, filters = {}) {
        let members = this.getData(StorageKeys.MEMBERS_DATA) || [];
        
        // Áp dụng filters
        members = this.applyFilters(members, filters);
        
        // Tìm kiếm
        if (query) {
            const lowerQuery = query.toLowerCase();
            members = members.filter(m => 
                m.hoTen.toLowerCase().includes(lowerQuery) ||
                m.soTheDangVien.toLowerCase().includes(lowerQuery) ||
                m.dienThoai.includes(query) ||
                m.email.toLowerCase().includes(lowerQuery)
            );
        }
        
        return members;
    }
    
    async getMemberStats() {
        const members = this.getData(StorageKeys.MEMBERS_DATA) || [];
        const currentYear = new Date().getFullYear();
        
        const stats = {
            total: members.length,
            active: members.filter(m => m.trangThai === 'active').length,
            retired: members.filter(m => m.trangThai === 'retired').length,
            transferred: members.filter(m => m.trangThai === 'transferred').length,
            suspended: members.filter(m => m.trangThai === 'suspended').length,
            newThisYear: members.filter(m => {
                const joinYear = new Date(m.ngayVaoDang).getFullYear();
                return joinYear === currentYear;
            }).length,
            byBranch: {},
            byGender: {
                Nam: members.filter(m => m.gioiTinh === 'Nam').length,
                Nữ: members.filter(m => m.gioiTinh === 'Nữ').length,
                Khác: members.filter(m => m.gioiTinh === 'Khác').length
            }
        };
        
        // Thống kê theo chi bộ
        AppConfig.BRANCHES.forEach(branch => {
            stats.byBranch[branch.id] = members.filter(m => m.chiBo === branch.id).length;
        });
        
        return stats;
    }
    
    // ==================== DOCUMENTS API ====================
    
    async getDocuments(page = 1, pageSize = 20, filters = {}) {
        let documents = this.getData(StorageKeys.DOCUMENTS_DATA) || [];
        
        // Áp dụng filters
        if (filters.type) {
            documents = documents.filter(d => d.loaiVanBan === filters.type);
        }
        if (filters.status) {
            documents = documents.filter(d => d.trangThai === filters.status);
        }
        if (filters.branch) {
            documents = documents.filter(d => d.chiBo === filters.branch);
        }
        
        // Sắp xếp theo ngày ban hành (mới nhất trước)
        documents.sort((a, b) => new Date(b.ngayBanHanh) - new Date(a.ngayBanHanh));
        
        // Phân trang
        const total = documents.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginated = documents.slice(start, end);
        
        return {
            data: paginated,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize)
            }
        };
    }
    
    async createDocument(documentData) {
        const documents = this.getData(StorageKeys.DOCUMENTS_DATA) || [];
        const newDoc = {
            ...documentData,
            id: Utils.generateId('DOC'),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: this.getCurrentUser()?.username || 'system'
        };
        
        documents.unshift(newDoc);
        this.saveData(StorageKeys.DOCUMENTS_DATA, documents);
        
        this.logActivity('Thêm mới', 'Văn bản', `Thêm văn bản: ${documentData.tenVanBan}`);
        
        return newDoc;
    }
    
    // ==================== MEETINGS API ====================
    
    async getMeetings(page = 1, pageSize = 20, filters = {}) {
        let meetings = this.getData(StorageKeys.MEETINGS_DATA) || [];
        
        // Áp dụng filters
        if (filters.type) {
            meetings = meetings.filter(m => m.loaiCuocHop === filters.type);
        }
        if (filters.status) {
            meetings = meetings.filter(m => m.trangThai === filters.status);
        }
        if (filters.branch) {
            meetings = meetings.filter(m => m.chiBo === filters.branch);
        }
        if (filters.dateFrom) {
            const from = new Date(filters.dateFrom);
            meetings = meetings.filter(m => new Date(m.thoiGian) >= from);
        }
        if (filters.dateTo) {
            const to = new Date(filters.dateTo);
            meetings = meetings.filter(m => new Date(m.thoiGian) <= to);
        }
        
        // Sắp xếp theo thời gian (sắp tới trước)
        meetings.sort((a, b) => new Date(a.thoiGian) - new Date(b.thoiGian));
        
        // Phân trang
        const total = meetings.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginated = meetings.slice(start, end);
        
        return {
            data: paginated,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize)
            }
        };
    }
    
    async createMeeting(meetingData) {
        const meetings = this.getData(StorageKeys.MEETINGS_DATA) || [];
        const newMeeting = {
            ...meetingData,
            id: Utils.generateId('MTG'),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: this.getCurrentUser()?.username || 'system'
        };
        
        meetings.unshift(newMeeting);
        this.saveData(StorageKeys.MEETINGS_DATA, meetings);
        
        this.logActivity('Thêm mới', 'Cuộc họp', `Thêm cuộc họp: ${meetingData.tenCuocHop}`);
        
        return newMeeting;
    }
    
    // ==================== ACTIVITIES API ====================
    
    async getActivities(limit = 50) {
        const activities = this.getData(StorageKeys.ACTIVITIES_DATA) || [];
        return activities.slice(0, limit);
    }
    
    async logActivity(action, module, description, details = {}) {
        const activities = this.getData(StorageKeys.ACTIVITIES_DATA) || [];
        const user = this.getCurrentUser();
        
        const activity = {
            id: Utils.generateId('ACT'),
            action,
            module,
            description,
            userId: user?.username || 'system',
            userName: user?.fullName || 'Hệ thống',
            timestamp: new Date().toISOString(),
            ipAddress: 'localhost',
            details: JSON.stringify(details)
        };
        
        activities.unshift(activity);
        
        // Giữ tối đa 1000 bản ghi
        if (activities.length > 1000) {
            activities.length = 1000;
        }
        
        this.saveData(StorageKeys.ACTIVITIES_DATA, activities);
        return activity;
    }
    
    // ==================== USERS API ====================
    
    async login(username, password) {
        const users = this.getData(StorageKeys.USERS_DATA) || [];
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            // Cập nhật last login
            user.lastLogin = new Date().toISOString();
            this.saveData(StorageKeys.USERS_DATA, users);
            
            // Lưu session
            const sessionUser = { ...user };
            delete sessionUser.password; // Không lưu password
            localStorage.setItem(StorageKeys.CURRENT_USER, JSON.stringify(sessionUser));
            
            this.logActivity('Đăng nhập', 'Hệ thống', `Đăng nhập hệ thống`);
            
            return sessionUser;
        }
        
        return null;
    }
    
    async logout() {
        this.logActivity('Đăng xuất', 'Hệ thống', `Đăng xuất hệ thống`);
        localStorage.removeItem(StorageKeys.CURRENT_USER);
        return true;
    }
    
    getCurrentUser() {
        const user = localStorage.getItem(StorageKeys.CURRENT_USER);
        return user ? JSON.parse(user) : null;
    }
    
    async updateProfile(userData) {
        const users = this.getData(StorageKeys.USERS_DATA) || [];
        const currentUser = this.getCurrentUser();
        const index = users.findIndex(u => u.id === currentUser?.id);
        
        if (index === -1) return null;
        
        users[index] = {
            ...users[index],
            ...userData,
            updatedAt: new Date().toISOString()
        };
        
        this.saveData(StorageKeys.USERS_DATA, users);
        
        // Cập nhật current user
        const updatedUser = { ...users[index] };
        delete updatedUser.password;
        localStorage.setItem(StorageKeys.CURRENT_USER, JSON.stringify(updatedUser));
        
        return updatedUser;
    }
    
    async changePassword(oldPassword, newPassword) {
        const users = this.getData(StorageKeys.USERS_DATA) || [];
        const currentUser = this.getCurrentUser();
        const user = users.find(u => u.id === currentUser?.id);
        
        if (!user || user.password !== oldPassword) {
            throw new Error('Mật khẩu cũ không chính xác');
        }
        
        user.password = newPassword;
        user.updatedAt = new Date().toISOString();
        this.saveData(StorageKeys.USERS_DATA, users);
        
        this.logActivity('Đổi mật khẩu', 'Hệ thống', `Thay đổi mật khẩu tài khoản`);
        
        return true;
    }
    
    // ==================== SETTINGS API ====================
    
    async getSettings() {
        const settings = this.getData(StorageKeys.SETTINGS) || this.initSettings();
        return settings;
    }
    
    async updateSettings(newSettings) {
        const current = await this.getSettings();
        const updated = { ...current, ...newSettings, updatedAt: new Date().toISOString() };
        this.saveData(StorageKeys.SETTINGS, updated);
        return updated;
    }
    
    // ==================== BACKUP/RESTORE ====================
    
    async backupData() {
        const backup = {
            version: AppConfig.VERSION,
            timestamp: new Date().toISOString(),
            data: {
                members: this.getData(StorageKeys.MEMBERS_DATA),
                documents: this.getData(StorageKeys.DOCUMENTS_DATA),
                meetings: this.getData(StorageKeys.MEETINGS_DATA),
                users: this.getData(StorageKeys.USERS_DATA),
                activities: this.getData(StorageKeys.ACTIVITIES_DATA),
                settings: this.getData(StorageKeys.SETTINGS)
            }
        };
        
        const backupStr = JSON.stringify(backup, null, 2);
        Utils.downloadFile(backupStr, `backup-dang-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
        
        // Cập nhật last backup
        const settings = await this.getSettings();
        settings.lastBackup = new Date().toISOString();
        this.saveData(StorageKeys.SETTINGS, settings);
        
        this.logActivity('Backup', 'Hệ thống', `Sao lưu dữ liệu hệ thống`);
        
        return backup;
    }
    
    async restoreData(backupFile) {
        try {
            const content = await Utils.readFileAsText(backupFile);
            const backup = JSON.parse(content);
            
            // Validate backup
            if (!backup.version || !backup.data) {
                throw new Error('File backup không hợp lệ');
            }
            
            // Restore từng phần
            if (backup.data.members) {
                this.saveData(StorageKeys.MEMBERS_DATA, backup.data.members);
            }
            if (backup.data.documents) {
                this.saveData(StorageKeys.DOCUMENTS_DATA, backup.data.documents);
            }
            if (backup.data.meetings) {
                this.saveData(StorageKeys.MEETINGS_DATA, backup.data.meetings);
            }
            if (backup.data.users) {
                this.saveData(StorageKeys.USERS_DATA, backup.data.users);
            }
            if (backup.data.activities) {
                this.saveData(StorageKeys.ACTIVITIES_DATA, backup.data.activities);
            }
            if (backup.data.settings) {
                this.saveData(StorageKeys.SETTINGS, backup.data.settings);
            }
            
            this.logActivity('Restore', 'Hệ thống', `Khôi phục dữ liệu từ backup`);
            
            return true;
        } catch (error) {
            console.error('Lỗi restore:', error);
            throw error;
        }
    }
    
    // ==================== HELPER METHODS ====================
    
    applyFilters(data, filters) {
        let filtered = [...data];
        
        if (filters.branch) {
            filtered = filtered.filter(item => item.chiBo === filters.branch);
        }
        if (filters.status) {
            filtered = filtered.filter(item => item.trangThai === filters.status);
        }
        if (filters.dateFrom) {
            filtered = filtered.filter(item => new Date(item.ngayVaoDang) >= new Date(filters.dateFrom));
        }
        if (filters.dateTo) {
            filtered = filtered.filter(item => new Date(item.ngayVaoDang) <= new Date(filters.dateTo));
        }
        if (filters.gender) {
            filtered = filtered.filter(item => item.gioiTinh === filters.gender);
        }
        if (filters.position) {
            filtered = filtered.filter(item => item.chucVu === filters.position);
        }
        
        return filtered;
    }
    
    async getDashboardStats() {
        const members = this.getData(StorageKeys.MEMBERS_DATA) || [];
        const meetings = this.getData(StorageKeys.MEETINGS_DATA) || [];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return {
            totalMembers: members.length,
            activeMembers: members.filter(m => m.trangThai === 'active').length,
            retiredMembers: members.filter(m => m.trangThai === 'retired').length,
            meetingsThisMonth: meetings.filter(m => {
                const date = new Date(m.thoiGian);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            }).length,
            documentsPending: (this.getData(StorageKeys.DOCUMENTS_DATA) || [])
                .filter(d => d.trangThai === 'pending').length,
            recentActivities: await this.getActivities(10)
        };
    }
    
    async getMemberGrowthData(years = 5) {
        const members = this.getData(StorageKeys.MEMBERS_DATA) || [];
        const currentYear = new Date().getFullYear();
        const result = {};
        
        for (let i = years - 1; i >= 0; i--) {
            const year = currentYear - i;
            const count = members.filter(m => {
                const joinYear = new Date(m.ngayVaoDang).getFullYear();
                return joinYear <= year;
            }).length;
            result[year] = count;
        }
        
        return result;
    }
    
    async getBranchDistribution() {
        const members = this.getData(StorageKeys.MEMBERS_DATA) || [];
        const distribution = {};
        
        AppConfig.BRANCHES.forEach(branch => {
            distribution[branch.name] = members.filter(m => m.chiBo === branch.id).length;
        });
        
        return distribution;
    }
}

// Khởi tạo instance
const apiService = new ApiService();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = apiService;
}
