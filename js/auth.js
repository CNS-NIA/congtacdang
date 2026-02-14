// Authentication Service
class AuthService {
    constructor() {
        this.api = apiService;
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        // Remember me
        const rememberMe = document.getElementById('rememberMe');
        if (rememberMe) {
            const savedUsername = localStorage.getItem('remembered_username');
            if (savedUsername) {
                document.getElementById('username').value = savedUsername;
                rememberMe.checked = true;
            }
        }
    }
    
    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        const loginBtn = document.getElementById('loginBtn');
        
        // Validate
        if (!username || !password) {
            showToast('Vui lòng nhập đầy đủ thông tin', 'warning');
            return;
        }
        
        // Disable button và hiển thị loading
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xác thực...';
        
        try {
            // Giả lập delay cho thực tế
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Gọi API login
            const user = await this.api.login(username, password);
            
            if (user) {
                // Lưu remember me
                if (rememberMe) {
                    localStorage.setItem('remembered_username', username);
                } else {
                    localStorage.removeItem('remembered_username');
                }
                
                // Hiển thị thông báo thành công
                showToast('Đăng nhập thành công!', 'success');
                
                // Delay trước khi chuyển trang
                setTimeout(() => {
                    this.hideLoginModal();
                    this.initializeApp(user);
                }, 500);
                
            } else {
                throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
            }
            
        } catch (error) {
            showToast(error.message || 'Đăng nhập thất bại', 'error');
            console.error('Login error:', error);
        } finally {
            // Khôi phục button
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Đăng nhập';
        }
    }
    
    hideLoginModal() {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.classList.remove('active');
            setTimeout(() => {
                loginModal.style.display = 'none';
            }, 300);
        }
    }
    
    initializeApp(user) {
        // Cập nhật thông tin người dùng
        this.updateUserInfo(user);
        
        // Hiển thị app
        const appContainer = document.getElementById('appContainer');
        if (appContainer) {
            appContainer.style.display = 'block';
        }
        
        // Ẩn loading
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        }
        
        // Khởi tạo dashboard
        if (typeof Dashboard !== 'undefined') {
            Dashboard.init();
        }
        
        // Load members nếu đang ở trang members
        if (typeof MembersManager !== 'undefined') {
            MembersManager.init();
        }
        
        // Cập nhật last sync
        this.updateLastSync();
        
        // Log activity
        this.api.logActivity('Khởi động', 'Hệ thống', 'Khởi động ứng dụng');
    }
    
    updateUserInfo(user) {
        // Avatar
        const avatar = document.querySelector('.user-avatar');
        if (avatar && user.avatar) {
            avatar.src = user.avatar;
        }
        
        // Tên người dùng
        const userName = document.getElementById('currentUserName');
        if (userName) {
            userName.textContent = user.fullName || user.username;
        }
        
        // Chi bộ
        const branchName = Utils.getBranchName(user.branch);
        const userInfo = document.querySelector('.user-info');
        if (userInfo && branchName) {
            const branchSpan = document.createElement('span');
            branchSpan.className = 'user-branch';
            branchSpan.textContent = branchName;
            branchSpan.style.fontSize = '12px';
            branchSpan.style.opacity = '0.8';
            userInfo.appendChild(branchSpan);
        }
    }
    
    updateLastSync() {
        const lastSync = document.getElementById('lastSync');
        if (lastSync) {
            const now = new Date();
            lastSync.textContent = `Đồng bộ: ${Utils.formatDate(now, 'DD/MM/YY HH:mm')}`;
        }
    }
    
    async logout() {
        try {
            // Xác nhận đăng xuất
            ModalManager.showConfirm(
                'Xác nhận đăng xuất',
                'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
                async () => {
                    await this.api.logout();
                    
                    // Hiển thị lại login modal
                    const loginModal = document.getElementById('loginModal');
                    if (loginModal) {
                        loginModal.style.display = 'block';
                        setTimeout(() => {
                            loginModal.classList.add('active');
                        }, 10);
                    }
                    
                    // Ẩn app
                    const appContainer = document.getElementById('appContainer');
                    if (appContainer) {
                        appContainer.style.display = 'none';
                    }
                    
                    showToast('Đã đăng xuất thành công', 'success');
                }
            );
        } catch (error) {
            showToast('Lỗi khi đăng xuất', 'error');
            console.error('Logout error:', error);
        }
    }
    
    async showProfile() {
        const user = this.api.getCurrentUser();
        if (!user) return;
        
        const profileHtml = `
            <div class="profile-container">
                <div class="profile-header">
                    <img src="${user.avatar || 'https://ui-avatars.com/api/?name=' + user.username}" 
                         alt="Avatar" class="profile-avatar">
                    <div class="profile-info">
                        <h3>${user.fullName || user.username}</h3>
                        <p class="text-muted">${user.username}</p>
                        <span class="badge badge-primary">${user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</span>
                    </div>
                </div>
                
                <div class="profile-details">
                    <div class="detail-row">
                        <span class="detail-label"><i class="fas fa-envelope"></i> Email</span>
                        <span class="detail-value">${user.email || 'Chưa cập nhật'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label"><i class="fas fa-building"></i> Chi bộ</span>
                        <span class="detail-value">${Utils.getBranchName(user.branch)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label"><i class="fas fa-calendar-alt"></i> Ngày tạo</span>
                        <span class="detail-value">${Utils.formatDate(user.createdAt)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label"><i class="fas fa-sign-in-alt"></i> Đăng nhập cuối</span>
                        <span class="detail-value">${user.lastLogin ? Utils.formatDate(user.lastLogin, 'DD/MM/YY HH:mm') : 'Chưa đăng nhập'}</span>
                    </div>
                </div>
                
                <div class="profile-actions">
                    <button class="btn btn-secondary btn-sm" onclick="AuthService.editProfile()">
                        <i class="fas fa-edit"></i> Chỉnh sửa
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="AuthService.changePassword()">
                        <i class="fas fa-key"></i> Đổi mật khẩu
                    </button>
                </div>
            </div>
        `;
        
        ModalManager.showCustomModal('Hồ sơ cá nhân', profileHtml, 'modal-lg');
    }
    
    async editProfile() {
        const user = this.api.getCurrentUser();
        if (!user) return;
        
        const formHtml = `
            <form id="profileForm" class="auth-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="editFullName"><i class="fas fa-user"></i> Họ và tên</label>
                        <input type="text" id="editFullName" class="form-control" 
                               value="${user.fullName || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="editEmail"><i class="fas fa-envelope"></i> Email</label>
                        <input type="email" id="editEmail" class="form-control" 
                               value="${user.email || ''}">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="editAvatar"><i class="fas fa-image"></i> Avatar URL</label>
                    <input type="url" id="editAvatar" class="form-control" 
                           value="${user.avatar || ''}" 
                           placeholder="https://example.com/avatar.jpg">
                    <small class="text-muted">Để trống để sử dụng avatar mặc định</small>
                </div>
                
                <div class="form-group">
                    <label for="editBranch"><i class="fas fa-building"></i> Chi bộ</label>
                    <select id="editBranch" class="form-control">
                        ${AppConfig.BRANCHES.map(b => 
                            `<option value="${b.id}" ${b.id === user.branch ? 'selected' : ''}>${b.name}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="ModalManager.closeCustomModal()">
                        Hủy
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Lưu thay đổi
                    </button>
                </div>
            </form>
        `;
        
        ModalManager.showCustomModal('Chỉnh sửa hồ sơ', formHtml, 'modal-md', () => {
            const form = document.getElementById('profileForm');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const updatedData = {
                        fullName: document.getElementById('editFullName').value,
                        email: document.getElementById('editEmail').value,
                        avatar: document.getElementById('editAvatar').value || null,
                        branch: document.getElementById('editBranch').value
                    };
                    
                    try {
                        const updatedUser = await this.api.updateProfile(updatedData);
                        if (updatedUser) {
                            this.updateUserInfo(updatedUser);
                            showToast('Cập nhật hồ sơ thành công', 'success');
                            ModalManager.closeCustomModal();
                        }
                    } catch (error) {
                        showToast('Lỗi cập nhật hồ sơ', 'error');
                        console.error(error);
                    }
                });
            }
        });
    }
    
    async changePassword() {
        const formHtml = `
            <form id="changePasswordForm" class="auth-form">
                <div class="form-group">
                    <label for="oldPassword"><i class="fas fa-lock"></i> Mật khẩu hiện tại</label>
                    <input type="password" id="oldPassword" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label for="newPassword"><i class="fas fa-key"></i> Mật khẩu mới</label>
                    <input type="password" id="newPassword" class="form-control" required minlength="6">
                    <small class="text-muted">Ít nhất 6 ký tự</small>
                </div>
                
                <div class="form-group">
                    <label for="confirmPassword"><i class="fas fa-check-circle"></i> Xác nhận mật khẩu</label>
                    <input type="password" id="confirmPassword" class="form-control" required>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="ModalManager.closeCustomModal()">
                        Hủy
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Đổi mật khẩu
                    </button>
                </div>
            </form>
        `;
        
        ModalManager.showCustomModal('Đổi mật khẩu', formHtml, 'modal-sm', () => {
            const form = document.getElementById('changePasswordForm');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const oldPassword = document.getElementById('oldPassword').value;
                    const newPassword = document.getElementById('newPassword').value;
                    const confirmPassword = document.getElementById('confirmPassword').value;
                    
                    if (newPassword !== confirmPassword) {
                        showToast('Mật khẩu xác nhận không khớp', 'warning');
                        return;
                    }
                    
                    if (newPassword.length < 6) {
                        showToast('Mật khẩu phải có ít nhất 6 ký tự', 'warning');
                        return;
                    }
                    
                    try {
                        await this.api.changePassword(oldPassword, newPassword);
                        showToast('Đổi mật khẩu thành công', 'success');
                        ModalManager.closeCustomModal();
                    } catch (error) {
                        showToast(error.message || 'Đổi mật khẩu thất bại', 'error');
                    }
                });
            }
        });
    }
    
    checkAuth() {
        const user = this.api.getCurrentUser();
        if (user) {
            this.initializeApp(user);
        } else {
            // Hiển thị login modal
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.style.display = 'block';
                setTimeout(() => {
                    loginModal.classList.add('active');
                }, 10);
            }
        }
    }
}

// Khởi tạo auth service
const authService = new AuthService();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
}