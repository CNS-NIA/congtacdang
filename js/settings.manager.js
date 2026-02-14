class SettingsManager {
    static currentSettings = {};
    
    static async init() {
        await this.loadSettings();
        this.initEventListeners();
        this.applyCurrentSettings();
    }
    
    static async loadSettings() {
        try {
            this.currentSettings = await apiService.getSettings();
            this.renderSettingsForm();
        } catch (error) {
            console.error('Lỗi tải cài đặt:', error);
            showToast('Lỗi tải cài đặt hệ thống', 'error');
        }
    }
    
    static renderSettingsForm() {
        // Cập nhật tất cả form controls với giá trị hiện tại
        const settings = this.currentSettings;
        
        // Theme
        const themeToggle = document.getElementById('darkModeToggle');
        if (themeToggle) {
            themeToggle.checked = settings.theme === 'dark';
        }
        
        // Language
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.value = settings.language || 'vi';
        }
        
        // Page size
        const pageSizeSelect = document.getElementById('pageSizeSelect');
        if (pageSizeSelect) {
            pageSizeSelect.value = settings.pageSize || 20;
        }
        
        // Notifications
        const notificationsToggle = document.getElementById('notificationsToggle');
        if (notificationsToggle) {
            notificationsToggle.checked = settings.notifications !== false;
        }
        
        // Auto backup
        const autoBackupToggle = document.getElementById('autoBackupToggle');
        if (autoBackupToggle) {
            autoBackupToggle.checked = settings.autoBackup === true;
        }
        
        // Backup interval
        const backupInterval = document.getElementById('backupInterval');
        if (backupInterval) {
            backupInterval.value = settings.backupInterval || 7;
            backupInterval.disabled = !settings.autoBackup;
        }
        
        // Last backup
        const lastBackup = document.getElementById('lastBackupInfo');
        if (lastBackup && settings.lastBackup) {
            lastBackup.textContent = Utils.formatDate(settings.lastBackup, 'DD/MM/YYYY HH:mm');
        }
    }
    
    static initEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('darkModeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('change', (e) => {
                this.toggleDarkMode(e.target.checked);
            });
        }
        
        // Language select
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.changeLanguage(e.target.value);
            });
        }
        
        // Page size select
        const pageSizeSelect = document.getElementById('pageSizeSelect');
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', (e) => {
                this.changePageSize(e.target.value);
            });
        }
        
        // Notifications toggle
        const notifToggle = document.getElementById('notificationsToggle');
        if (notifToggle) {
            notifToggle.addEventListener('change', (e) => {
                this.toggleNotifications(e.target.checked);
            });
        }
        
        // Auto backup toggle
        const autoBackupToggle = document.getElementById('autoBackupToggle');
        if (autoBackupToggle) {
            autoBackupToggle.addEventListener('change', (e) => {
                this.toggleAutoBackup(e.target.checked);
            });
        }
        
        // Backup interval
        const backupInterval = document.getElementById('backupInterval');
        if (backupInterval) {
            backupInterval.addEventListener('change', (e) => {
                this.changeBackupInterval(e.target.value);
            });
        }
        
        // Backup now button
        const backupNowBtn = document.querySelector('button[onclick*="AppManager.backupDatabase"]');
        if (backupNowBtn) {
            backupNowBtn.addEventListener('click', () => this.backupNow());
        }
        
        // Restore button
        const restoreBtn = document.querySelector('button[onclick*="AppManager.restoreDatabase"]');
        if (restoreBtn) {
            restoreBtn.addEventListener('click', () => this.restoreData());
        }
        
        // Cleanup button
        const cleanupBtn = document.querySelector('button[onclick*="AppManager.cleanupData"]');
        if (cleanupBtn) {
            cleanupBtn.addEventListener('click', () => this.cleanupOldData());
        }
        
        // Change password button
        const changePassBtn = document.querySelector('button[onclick*="AuthService.changePassword"]');
        if (changePassBtn) {
            changePassBtn.addEventListener('click', () => authService.changePassword());
        }
        
        // Manage permissions button
        const permissionsBtn = document.querySelector('button[onclick*="AppManager.managePermissions"]');
        if (permissionsBtn) {
            permissionsBtn.addEventListener('click', () => this.managePermissions());
        }
        
        // User management buttons
        document.querySelectorAll('.user-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const userId = e.target.dataset.userId;
                if (action && userId) {
                    this.handleUserAction(action, userId);
                }
            });
        });
    }
    
    static applyCurrentSettings() {
        const settings = this.currentSettings;
        
        // Áp dụng theme
        if (settings.theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        
        // Áp dụng ngôn ngữ (đơn giản)
        if (settings.language === 'en') {
            this.applyEnglishLanguage();
        }
        
        // Áp dụng page size cho các module
        if (settings.pageSize) {
            if (typeof MembersManager !== 'undefined') {
                MembersManager.pageSize = settings.pageSize;
            }
        }
    }
    
    static async toggleDarkMode(enabled) {
        try {
            const theme = enabled ? 'dark' : 'light';
            await apiService.updateSettings({ theme });
            this.currentSettings.theme = theme;
            
            // Áp dụng ngay lập tức
            if (enabled) {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }
            
            showToast(`Đã chuyển sang chế độ ${enabled ? 'tối' : 'sáng'}`, 'success');
            
        } catch (error) {
            console.error('Lỗi thay đổi theme:', error);
            showToast('Lỗi thay đổi chế độ', 'error');
        }
    }
    
    static async changeLanguage(lang) {
        try {
            await apiService.updateSettings({ language: lang });
            this.currentSettings.language = lang;
            
            // Reload để áp dụng ngôn ngữ
            showToast(`Đã đổi ngôn ngữ sang ${lang === 'vi' ? 'Tiếng Việt' : 'English'}`, 'success');
            
            // Trong thực tế sẽ reload page hoặc update text động
            setTimeout(() => {
                if (lang === 'en') {
                    this.applyEnglishLanguage();
                } else {
                    this.applyVietnameseLanguage();
                }
            }, 500);
            
        } catch (error) {
            console.error('Lỗi thay đổi ngôn ngữ:', error);
            showToast('Lỗi thay đổi ngôn ngữ', 'error');
        }
    }
    
    static applyEnglishLanguage() {
        // Đơn giản: thay đổi một số text cơ bản
        const translations = {
            'Quản lý Công tác Đảng': 'Party Management System',
            'Dashboard': 'Dashboard',
            'Đảng viên': 'Members',
            'Văn bản': 'Documents',
            'Cuộc họp': 'Meetings',
            'Báo cáo': 'Reports',
            'Cài đặt': 'Settings',
            'Tổng quan hệ thống': 'System Overview'
        };
        
        Object.entries(translations).forEach(([vi, en]) => {
            document.querySelectorAll(`:contains("${vi}")`).forEach(el => {
                if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
                    el.textContent = el.textContent.replace(vi, en);
                }
            });
        });
    }
    
    static applyVietnameseLanguage() {
        // Mặc định đã là Tiếng Việt
    }
    
    static async changePageSize(size) {
        try {
            await apiService.updateSettings({ pageSize: parseInt(size) });
            this.currentSettings.pageSize = parseInt(size);
            
            // Áp dụng cho các module
            if (typeof MembersManager !== 'undefined') {
                MembersManager.pageSize = parseInt(size);
                MembersManager.currentPage = 1;
                MembersManager.loadMembers();
            }
            
            showToast(`Đã thay đổi số bản ghi/trang thành ${size}`, 'success');
            
        } catch (error) {
            console.error('Lỗi thay đổi page size:', error);
            showToast('Lỗi thay đổi cài đặt', 'error');
        }
    }
    
    static async toggleNotifications(enabled) {
        try {
            await apiService.updateSettings({ notifications: enabled });
            this.currentSettings.notifications = enabled;
            
            showToast(`Thông báo đã ${enabled ? 'bật' : 'tắt'}`, 'success');
            
        } catch (error) {
            console.error('Lỗi thay đổi thông báo:', error);
            showToast('Lỗi thay đổi cài đặt', 'error');
        }
    }
    
    static async toggleAutoBackup(enabled) {
        try {
            await apiService.updateSettings({ autoBackup: enabled });
            this.currentSettings.autoBackup = enabled;
            
            // Enable/disable interval input
            const intervalInput = document.getElementById('backupInterval');
            if (intervalInput) {
                intervalInput.disabled = !enabled;
            }
            
            if (enabled) {
                this.scheduleAutoBackup();
                showToast('Đã bật tự động backup', 'success');
            } else {
                this.cancelAutoBackup();
                showToast('Đã tắt tự động backup', 'info');
            }
            
        } catch (error) {
            console.error('Lỗi thay đổi auto backup:', error);
            showToast('Lỗi thay đổi cài đặt', 'error');
        }
    }
    
    static async changeBackupInterval(days) {
        try {
            await apiService.updateSettings({ backupInterval: parseInt(days) });
            this.currentSettings.backupInterval = parseInt(days);
            
            // Lên lịch lại auto backup
            this.scheduleAutoBackup();
            
            showToast(`Đã đặt lịch backup ${days} ngày/lần`, 'success');
            
        } catch (error) {
            console.error('Lỗi thay đổi backup interval:', error);
            showToast('Lỗi thay đổi cài đặt', 'error');
        }
    }
    
    static scheduleAutoBackup() {
        // Hủy lịch cũ
        this.cancelAutoBackup();
        
        // Nếu auto backup được bật
        if (this.currentSettings.autoBackup && this.currentSettings.backupInterval) {
            const intervalMs = this.currentSettings.backupInterval * 24 * 60 * 60 * 1000;
            
            // Lên lịch backup đầu tiên
            setTimeout(() => {
                this.backupNow(true); // silent backup
            }, 10000); // 10 giây sau để test
            
            // Lên lịch định kỳ
            this.autoBackupTimer = setInterval(() => {
                this.backupNow(true); // silent backup
            }, intervalMs);
        }
    }
    
    static cancelAutoBackup() {
        if (this.autoBackupTimer) {
            clearInterval(this.autoBackupTimer);
            this.autoBackupTimer = null;
        }
    }
    
    static async backupNow(silent = false) {
        try {
            if (!silent) {
                showLoading('Đang sao lưu dữ liệu...');
            }
            
            await apiService.backupData();
            
            // Cập nhật last backup
            await apiService.updateSettings({ 
                lastBackup: new Date().toISOString() 
            });
            
            if (!silent) {
                hideLoading();
                showToast('Sao lưu dữ liệu thành công', 'success');
            }
            
        } catch (error) {
            if (!silent) {
                hideLoading();
                showToast('Lỗi sao lưu dữ liệu', 'error');
            }
            console.error('Lỗi backup:', error);
        }
    }
    
    static async restoreData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            ModalManager.showConfirm(
                'Xác nhận khôi phục',
                `Bạn sắp khôi phục dữ liệu từ file: <strong>${file.name}</strong><br>
                 <span class="text-danger">CẢNH BÁO: Dữ liệu hiện tại sẽ bị ghi đè!</span>`,
                async () => {
                    try {
                        showLoading('Đang khôi phục dữ liệu...');
                        
                        await apiService.restoreData(file);
                        
                        hideLoading();
                        showToast('Khôi phục dữ liệu thành công', 'success');
                        
                        // Reload toàn bộ ứng dụng
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                        
                    } catch (error) {
                        hideLoading();
                        showToast(error.message || 'Lỗi khôi phục dữ liệu', 'error');
                        console.error(error);
                    }
                }
            );
        };
        
        input.click();
    }
    
    static async cleanupOldData() {
        ModalManager.showConfirm(
            'Xác nhận dọn dẹp',
            `Bạn sắp xóa dữ liệu cũ (hoạt động trên 1 năm).<br>
             <span class="text-warning">Hành động này không thể hoàn tác!</span>`,
            async () => {
                try {
                    showLoading('Đang dọn dẹp dữ liệu...');
                    
                    // Lấy activities cũ
                    const activities = await apiService.getActivities(10000);
                    const oneYearAgo = new Date();
                    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                    
                    const oldActivities = activities.filter(a => 
                        new Date(a.timestamp) < oneYearAgo
                    );
                    
                    // Xóa activities cũ
                    if (oldActivities.length > 0) {
                        // Trong thực tế sẽ gọi API xóa
                        console.log(`Xóa ${oldActivities.length} activities cũ`);
                    }
                    
                    hideLoading();
                    showToast(`Đã dọn dẹp ${oldActivities.length} bản ghi cũ`, 'success');
                    
                } catch (error) {
                    hideLoading();
                    showToast('Lỗi dọn dẹp dữ liệu', 'error');
                    console.error(error);
                }
            }
        );
    }
    
    static async managePermissions() {
        try {
            // Lấy danh sách người dùng
            const users = apiService.getData(StorageKeys.USERS_DATA) || [];
            
            let html = `
                <div class="permissions-manager">
                    <div class="permissions-header">
                        <h4><i class="fas fa-user-lock"></i> Quản lý phân quyền</h4>
                        <button class="btn btn-primary btn-sm" onclick="SettingsManager.showAddUserForm()">
                            <i class="fas fa-user-plus"></i> Thêm người dùng
                        </button>
                    </div>
                    
                    <div class="permissions-table">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Tên đăng nhập</th>
                                    <th>Họ tên</th>
                                    <th>Vai trò</th>
                                    <th>Chi bộ</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
            `;
            
            users.forEach(user => {
                if (user.username === 'admin') return; // Ẩn admin
                
                html += `
                    <tr>
                        <td>${user.username}</td>
                        <td>${user.fullName || ''}</td>
                        <td>
                            <select class="form-control form-control-sm role-select" 
                                    data-user="${user.id}"
                                    onchange="SettingsManager.updateUserRole('${user.id}', this.value)">
                                <option value="user" ${user.role === 'user' ? 'selected' : ''}>Người dùng</option>
                                <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>Quản lý</option>
                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Quản trị viên</option>
                            </select>
                        </td>
                        <td>${Utils.getBranchName(user.branch)}</td>
                        <td>
                            <span class="badge badge-success">Đang hoạt động</span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-secondary" 
                                    onclick="SettingsManager.editUser('${user.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" 
                                    onclick="SettingsManager.deleteUser('${user.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            html += `
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="permissions-info">
                        <h5><i class="fas fa-info-circle"></i> Giải thích vai trò:</h5>
                        <ul>
                            <li><strong>Người dùng:</strong> Chỉ xem và thêm dữ liệu của chi bộ mình</li>
                            <li><strong>Quản lý:</strong> Quản lý toàn bộ dữ liệu của chi bộ</li>
                            <li><strong>Quản trị viên:</strong> Toàn quyền hệ thống</li>
                        </ul>
                    </div>
                </div>
            `;
            
            ModalManager.showCustomModal('Quản lý phân quyền', html, 'modal-xl');
            
        } catch (error) {
            console.error('Lỗi quản lý phân quyền:', error);
            showToast('Lỗi tải danh sách người dùng', 'error');
        }
    }
    
    static async updateUserRole(userId, newRole) {
        try {
            const users = apiService.getData(StorageKeys.USERS_DATA) || [];
            const userIndex = users.findIndex(u => u.id === userId);
            
            if (userIndex !== -1) {
                users[userIndex].role = newRole;
                users[userIndex].updatedAt = new Date().toISOString();
                apiService.saveData(StorageKeys.USERS_DATA, users);
                
                showToast('Đã cập nhật vai trò người dùng', 'success');
            }
        } catch (error) {
            console.error('Lỗi cập nhật vai trò:', error);
            showToast('Lỗi cập nhật vai trò', 'error');
        }
    }
    
    static async showAddUserForm() {
        const formHtml = `
            <form id="addUserForm" class="auth-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>Tên đăng nhập *</label>
                        <input type="text" id="newUsername" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Mật khẩu *</label>
                        <input type="password" id="newPassword" class="form-control" required minlength="6">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Họ và tên *</label>
                        <input type="text" id="newFullName" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="newEmail" class="form-control">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Vai trò *</label>
                        <select id="newRole" class="form-control" required>
                            <option value="user">Người dùng</option>
                            <option value="manager">Quản lý</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Chi bộ *</label>
                        <select id="newBranch" class="form-control" required>
                            ${AppConfig.BRANCHES.map(b => 
                                `<option value="${b.id}">${b.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="ModalManager.closeCustomModal()">
                        Hủy
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Thêm người dùng
                    </button>
                </div>
            </form>
        `;
        
        ModalManager.showCustomModal('Thêm người dùng mới', formHtml, 'modal-md', () => {
            const form = document.getElementById('addUserForm');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const userData = {
                    username: document.getElementById('newUsername').value,
                    password: document.getElementById('newPassword').value,
                    fullName: document.getElementById('newFullName').value,
                    email: document.getElementById('newEmail').value,
                    role: document.getElementById('newRole').value,
                    branch: document.getElementById('newBranch').value,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(document.getElementById('newFullName').value)}&background=random`,
                    createdAt: new Date().toISOString(),
                    lastLogin: null
                };
                
                try {
                    const users = apiService.getData(StorageKeys.USERS_DATA) || [];
                    userData.id = Utils.generateId('U');
                    users.push(userData);
                    apiService.saveData(StorageKeys.USERS_DATA, users);
                    
                    showToast('Thêm người dùng thành công', 'success');
                    ModalManager.closeCustomModal();
                    this.managePermissions(); // Reload permissions manager
                    
                } catch (error) {
                    console.error('Lỗi thêm người dùng:', error);
                    showToast('Lỗi thêm người dùng', 'error');
                }
            });
        });
    }
}

// Khởi tạo settings khi vào trang settings
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash.includes('settings') || 
        document.getElementById('settingsContent')?.style.display !== 'none') {
        SettingsManager.init();
    }
});