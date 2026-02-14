// js/app.js - Phiên bản fix lỗi đăng nhập

// Biến toàn cục
let currentUser = null;
let currentPage = 'login';
let currentMembers = [];

/**
 * Khởi tạo ứng dụng
 */
function initializeApp() {
    console.log('🚀 Khởi tạo ứng dụng...');
    
    // Kiểm tra các module đã load
    console.log('constants.js loaded:', typeof SAMPLE_MEMBERS !== 'undefined');
    console.log('utils.js loaded:', typeof showLoading !== 'undefined');
    console.log('auth.js loaded:', typeof handleLogin !== 'undefined');
    
    // Kiểm tra trạng thái đăng nhập
    checkLoginStatus();
    
    console.log('✅ App initialized');
}

/**
 * Kiểm tra trạng thái đăng nhập
 */
function checkLoginStatus() {
    const savedUser = sessionStorage.getItem('currentUser');
    
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            console.log('👤 Người dùng đã đăng nhập:', currentUser.username);
            showDashboard();
        } catch (error) {
            console.error('Lỗi parse user:', error);
            sessionStorage.removeItem('currentUser');
            showLoginPage();
        }
    } else {
        showLoginPage();
    }
}

/**
 * Hiển thị trang đăng nhập
 */
function showLoginPage() {
    console.log('📱 Hiển thị trang đăng nhập');
    
    const appContainer = document.getElementById('app-container');
    if (!appContainer) {
        console.error('❌ Không tìm thấy #app-container');
        return;
    }
    
    appContainer.innerHTML = `
        <div class="login-page">
            <div class="login-container">
                <div class="login-header">
                    <div class="logo">
                        <i class="fas fa-landmark fa-3x" style="color: #8B0000;"></i>
                    </div>
                    <h1>HỆ THỐNG QUẢN LÝ ĐẢNG VIÊN</h1>
                    <p>ĐẢNG BỘ KHỐI CHÍNH QUYỀN</p>
                </div>
                
                <div class="login-form-container">
                    <form id="loginForm">
                        <div class="form-group">
                            <label for="username">
                                <i class="fas fa-user"></i> Tên đăng nhập
                            </label>
                            <input 
                                type="text" 
                                id="username" 
                                placeholder="Nhập tên đăng nhập"
                                required
                                autocomplete="username"
                            >
                        </div>
                        
                        <div class="form-group">
                            <label for="password">
                                <i class="fas fa-lock"></i> Mật khẩu
                            </label>
                            <input 
                                type="password" 
                                id="password" 
                                placeholder="Nhập mật khẩu"
                                required
                                autocomplete="current-password"
                            >
                        </div>
                        
                        <button type="submit" class="btn-login">
                            <i class="fas fa-sign-in-alt"></i> ĐĂNG NHẬP
                        </button>
                        
                        <div class="demo-accounts">
                            <h3><i class="fas fa-info-circle"></i> Tài khoản demo:</h3>
                            <div class="account-list">
                                <div class="account-item">
                                    <strong>Admin:</strong> admin / admin123
                                </div>
                                <div class="account-item">
                                    <strong>Bí thư:</strong> bithu_VP / bithu123
                                </div>
                                <div class="account-item">
                                    <strong>Cán bộ:</strong> canbo / canbo123
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                
                <div class="login-footer">
                    <p>© 2026 - Hệ thống Quản lý Công tác Đảng</p>
                    <p>Phiên bản 2.0</p>
                </div>
            </div>
        </div>
    `;
    
    // Thêm event listener cho form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            console.log('Đang đăng nhập với:', username);
            
            // Gọi hàm đăng nhập từ auth.js
            if (typeof handleLogin === 'function') {
                handleLogin(username, password);
            } else {
                // Fallback nếu auth.js chưa load
                fallbackLogin(username, password);
            }
        });
    }
    
    // Focus vào ô username
    setTimeout(() => {
        const usernameInput = document.getElementById('username');
        if (usernameInput) usernameInput.focus();
    }, 100);
}

/**
 * Fallback login nếu auth.js chưa load
 */
function fallbackLogin(username, password) {
    console.log('⚠️ Sử dụng fallback login');
    
    // Kiểm tra tài khoản đơn giản
    const validAccounts = {
        'admin': { password: 'admin123', name: 'Quản trị viên', role: 'admin' },
        'bithu_VP': { password: 'bithu123', name: 'Bí thư Văn phòng', role: 'secretary' },
        'canbo': { password: 'canbo123', name: 'Cán bộ', role: 'staff' }
    };
    
    if (validAccounts[username] && validAccounts[username].password === password) {
        const user = {
            username: username,
            name: validAccounts[username].name,
            role: validAccounts[username].role
        };
        
        currentUser = user;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        
        showToast('Đăng nhập thành công!', 'success');
        showDashboard();
    } else {
        showToast('Tên đăng nhập hoặc mật khẩu không đúng!', 'error');
    }
}

/**
 * Hiển thị Dashboard
 */
function showDashboard() {
    console.log('📊 Hiển thị Dashboard');
    
    const appContainer = document.getElementById('app-container');
    if (!appContainer) return;
    
    appContainer.innerHTML = `
        <div class="dashboard-page">
            <div class="header">
                <div class="header-left">
                    <h1><i class="fas fa-tachometer-alt"></i> BẢNG ĐIỀU KHIỂN</h1>
                </div>
                <div class="header-right">
                    <div class="user-info">
                        <i class="fas fa-user-circle fa-2x"></i>
                        <div>
                            <div class="user-name">${currentUser.name}</div>
                            <div class="user-role">${currentUser.role === 'admin' ? 'Quản trị viên' : 
                                                   currentUser.role === 'secretary' ? 'Bí thư chi bộ' : 'Cán bộ'}</div>
                        </div>
                    </div>
                    <button class="btn-logout" onclick="logout()">
                        <i class="fas fa-sign-out-alt"></i> Đăng xuất
                    </button>
                </div>
            </div>
            
            <div class="sidebar">
                <div class="menu-section">
                    <div class="menu-title">MENU CHÍNH</div>
                    <ul class="menu-list">
                        <li>
                            <a href="#" class="menu-item active" onclick="showDashboard()">
                                <i class="fas fa-tachometer-alt"></i> Dashboard
                            </a>
                        </li>
                        <li>
                            <a href="#" class="menu-item" onclick="showMembersPage()">
                                <i class="fas fa-users"></i> Quản lý Đảng viên
                            </a>
                        </li>
                        <li>
                            <a href="#" class="menu-item">
                                <i class="fas fa-file-alt"></i> Văn bản Nghị quyết
                            </a>
                        </li>
                        <li>
                            <a href="#" class="menu-item">
                                <i class="fas fa-calendar-check"></i> Sinh hoạt Đảng
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            
            <div class="main-content">
                <div class="welcome-card">
                    <h2>Chào mừng ${currentUser.name}!</h2>
                    <p>Hệ thống Quản lý Công tác Đảng - Phiên bản 2.0</p>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon" style="background: #8B0000;">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="stat-info">
                                <h3>0</h3>
                                <p>Tổng số đảng viên</p>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon" style="background: #006400;">
                                <i class="fas fa-user-plus"></i>
                            </div>
                            <div class="stat-info">
                                <h3>0</h3>
                                <p>Đảng viên mới</p>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon" style="background: #1E90FF;">
                                <i class="fas fa-file-alt"></i>
                            </div>
                            <div class="stat-info">
                                <h3>0</h3>
                                <p>Văn bản chờ xử lý</p>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon" style="background: #FF8C00;">
                                <i class="fas fa-calendar-day"></i>
                            </div>
                            <div class="stat-info">
                                <h3>0</h3>
                                <p>Sự kiện sắp tới</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="quick-actions">
                        <button class="btn-action" onclick="showMembersPage()">
                            <i class="fas fa-plus"></i> Thêm đảng viên mới
                        </button>
                        <button class="btn-action">
                            <i class="fas fa-file-import"></i> Nhập dữ liệu
                        </button>
                        <button class="btn-action">
                            <i class="fas fa-chart-bar"></i> Báo cáo thống kê
                        </button>
                    </div>
                </div>
                
                <div class="recent-activities">
                    <h3><i class="fas fa-history"></i> Hoạt động gần đây</h3>
                    <div class="activities-list">
                        <div class="activity-item">
                            <i class="fas fa-info-circle"></i>
                            <div>
                                <p>Chưa có hoạt động nào</p>
                                <span class="activity-time">--</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p>© 2026 - Hệ thống Quản lý Công tác Đảng. Phiên bản 2.0</p>
            </div>
        </div>
    `;
}

/**
 * Hiển thị trang quản lý đảng viên
 */
function showMembersPage() {
    console.log('👥 Hiển thị trang đảng viên');
    
    const appContainer = document.getElementById('app-container');
    if (!appContainer) return;
    
    appContainer.innerHTML = `
        <div class="members-page">
            <div class="header">
                <div class="header-left">
                    <h1><i class="fas fa-users"></i> QUẢN LÝ ĐẢNG VIÊN</h1>
                </div>
                <div class="header-right">
                    <div class="user-info">
                        <i class="fas fa-user-circle fa-2x"></i>
                        <div>
                            <div class="user-name">${currentUser.name}</div>
                            <div class="user-role">${currentUser.role === 'admin' ? 'Quản trị viên' : 
                                                   currentUser.role === 'secretary' ? 'Bí thư chi bộ' : 'Cán bộ'}</div>
                        </div>
                    </div>
                    <button class="btn-logout" onclick="logout()">
                        <i class="fas fa-sign-out-alt"></i> Đăng xuất
                    </button>
                </div>
            </div>
            
            <div class="sidebar">
                <div class="menu-section">
                    <div class="menu-title">MENU CHÍNH</div>
                    <ul class="menu-list">
                        <li>
                            <a href="#" class="menu-item" onclick="showDashboard()">
                                <i class="fas fa-tachometer-alt"></i> Dashboard
                            </a>
                        </li>
                        <li>
                            <a href="#" class="menu-item active" onclick="showMembersPage()">
                                <i class="fas fa-users"></i> Quản lý Đảng viên
                            </a>
                        </li>
                        <li>
                            <a href="#" class="menu-item">
                                <i class="fas fa-file-alt"></i> Văn bản Nghị quyết
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            
            <div class="main-content">
                <div class="page-controls">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" placeholder="Tìm kiếm đảng viên...">
                    </div>
                    <button class="btn-primary" onclick="addNewMember()">
                        <i class="fas fa-plus"></i> Thêm đảng viên mới
                    </button>
                </div>
                
                <div class="members-table-container">
                    <table class="members-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Họ và tên</th>
                                <th>Chi bộ</th>
                                <th>Chức vụ</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="6" style="text-align: center; padding: 40px;">
                                    <i class="fas fa-users fa-2x" style="color: #ccc; margin-bottom: 10px;"></i>
                                    <p>Chưa có dữ liệu đảng viên</p>
                                    <button class="btn-primary" onclick="addNewMember()" style="margin-top: 10px;">
                                        <i class="fas fa-plus"></i> Thêm đảng viên đầu tiên
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

/**
 * Thêm đảng viên mới
 */
function addNewMember() {
    alert('Chức năng thêm đảng viên mới đang được phát triển');
}

/**
 * Đăng xuất
 */
function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        currentUser = null;
        sessionStorage.removeItem('currentUser');
        showToast('Đã đăng xuất thành công', 'success');
        showLoginPage();
    }
}

/**
 * Hiển thị thông báo
 */
function showToast(message, type = 'info') {
    // Sử dụng fallback từ index.html hoặc tạo mới
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        // Fallback đơn giản
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                             type === 'error' ? 'exclamation-circle' : 
                             type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 3000);
    }
}

// Khởi tạo app khi DOM ready
document.addEventListener('DOMContentLoaded', initializeApp);

// Xuất hàm ra global
window.showDashboard = showDashboard;
window.showMembersPage = showMembersPage;
window.showLoginPage = showLoginPage;
window.logout = logout;
window.addNewMember = addNewMember;