class Dashboard {
    static charts = {};
    static autoRefreshInterval = null;
    static refreshRate = 300000; // 5 phút
    
    static async init() {
        await this.loadDashboardData();
        this.initCharts();
        this.initEventListeners();
        this.startAutoRefresh();
        this.loadActivities();
        this.loadNotifications();
    }
    
    static async loadDashboardData() {
        try {
            showLoading('Đang tải dữ liệu dashboard...');
            
            // Load tất cả dữ liệu song song
            const [stats, growthData, branchData, activities, meetings] = await Promise.all([
                apiService.getDashboardStats(),
                apiService.getMemberGrowthData(5),
                apiService.getBranchDistribution(),
                apiService.getActivities(10),
                apiService.getMeetings(1, 5, {
                    dateFrom: new Date().toISOString().split('T')[0]
                })
            ]);
            
            // Cập nhật UI
            this.updateStats(stats);
            this.updateUpcomingMeetings(meetings.data);
            this.updateActivities(activities);
            
            // Lưu dữ liệu cho biểu đồ
            this.chartData = {
                growth: growthData,
                branches: branchData
            };
            
            hideLoading();
            
        } catch (error) {
            console.error('Lỗi tải dashboard:', error);
            showToast('Lỗi tải dữ liệu dashboard', 'error');
            hideLoading();
        }
    }
    
    static updateStats(stats) {
        // Cập nhật số liệu thống kê
        document.getElementById('totalMembersStat').textContent = 
            Utils.formatNumber(stats.totalMembers);
        document.getElementById('activeMembersStat').textContent = 
            Utils.formatNumber(stats.activeMembers);
        document.getElementById('retiredMembersStat').textContent = 
            Utils.formatNumber(stats.retiredMembers);
        document.getElementById('meetingsThisMonth').textContent = 
            Utils.formatNumber(stats.meetingsThisMonth);
        
        // Cập nhật connection status
        this.updateConnectionStatus();
        
        // Cập nhật data count
        const dataCount = document.getElementById('dataCount');
        if (dataCount) {
            dataCount.textContent = `${stats.totalMembers} đảng viên`;
        }
    }
    
    static updateConnectionStatus() {
        const statusEl = document.getElementById('connectionStatus');
        if (!statusEl) return;
        
        if (navigator.onLine) {
            statusEl.innerHTML = '<i class="fas fa-wifi" style="color: #4CAF50;"></i> Đang kết nối';
            statusEl.style.color = '#4CAF50';
        } else {
            statusEl.innerHTML = '<i class="fas fa-wifi-slash" style="color: #F44336;"></i> Mất kết nối';
            statusEl.style.color = '#F44336';
        }
    }
    
    static initCharts() {
        // Khởi tạo tất cả biểu đồ
        this.initGrowthChart();
        this.initBranchChart();
        this.initMonthlyStatsChart();
        this.initStatusChart();
    }
    
    static initGrowthChart() {
        const ctx = document.getElementById('membersGrowthChart');
        if (!ctx) return;
        
        // Hủy chart cũ nếu có
        if (this.charts.growth) {
            this.charts.growth.destroy();
        }
        
        const data = this.chartData?.growth || {};
        const years = Object.keys(data);
        const counts = Object.values(data);
        
        // Tính phần trăm tăng trưởng
        const growthRates = counts.map((count, index) => {
            if (index === 0) return 0;
            const prev = counts[index - 1];
            return ((count - prev) / prev * 100).toFixed(1);
        });
        
        this.charts.growth = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'Tổng số đảng viên',
                    data: counts,
                    borderColor: '#C62828',
                    backgroundColor: 'rgba(198, 40, 40, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                }, {
                    label: 'Tăng trưởng (%)',
                    data: growthRates,
                    borderColor: '#2E7D32',
                    backgroundColor: 'rgba(46, 125, 50, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                stacked: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Phát triển đảng viên qua các năm'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.datasetIndex === 0) {
                                    label += Utils.formatNumber(context.parsed.y) + ' đảng viên';
                                } else {
                                    label += context.parsed.y + '%';
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Số lượng'
                        },
                        ticks: {
                            callback: function(value) {
                                return Utils.formatNumber(value);
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Tăng trưởng (%)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }
    
    static initBranchChart() {
        const ctx = document.getElementById('branchDistributionChart');
        if (!ctx) return;
        
        if (this.charts.branch) {
            this.charts.branch.destroy();
        }
        
        const data = this.chartData?.branches || {};
        const labels = Object.keys(data);
        const values = Object.values(data);
        
        // Tạo màu sắc từ config
        const backgroundColors = labels.map(label => {
            const branch = AppConfig.BRANCHES.find(b => b.name === label);
            return branch ? branch.color + '80' : '#66666680';
        });
        
        const borderColors = labels.map(label => {
            const branch = AppConfig.BRANCHES.find(b => b.name === label);
            return branch ? branch.color : '#666';
        });
        
        this.charts.branch = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 2,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Phân bố đảng viên theo chi bộ'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = values.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${Utils.formatNumber(context.parsed)} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }
    
    static initMonthlyStatsChart() {
        // Tạo chart container động nếu chưa có
        let container = document.getElementById('monthlyStatsChartContainer');
        if (!container) {
            container = document.createElement('div');
            container.className = 'chart-container';
            container.innerHTML = `
                <div class="chart-header">
                    <h4><i class="fas fa-chart-bar"></i> Hoạt động hàng tháng</h4>
                    <select class="form-control form-control-sm" onchange="Dashboard.updateMonthlyChart(this.value)">
                        <option value="meetings">Cuộc họp</option>
                        <option value="documents">Văn bản</option>
                        <option value="members">Kết nạp đảng viên</option>
                    </select>
                </div>
                <canvas id="monthlyStatsChart"></canvas>
            `;
            document.querySelector('.dashboard-charts').appendChild(container);
        }
        
        // Tạo chart
        const ctx = document.getElementById('monthlyStatsChart');
        if (!ctx) return;
        
        if (this.charts.monthly) {
            this.charts.monthly.destroy();
        }
        
        // Dữ liệu mẫu cho 12 tháng
        const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        const meetingsData = [12, 19, 8, 15, 12, 18, 14, 16, 10, 13, 15, 17];
        
        this.charts.monthly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Số cuộc họp',
                    data: meetingsData,
                    backgroundColor: 'rgba(2, 119, 189, 0.7)',
                    borderColor: '#0277BD',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Số cuộc họp hàng tháng'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Số lượng'
                        }
                    }
                }
            }
        });
    }
    
    static initStatusChart() {
        // Widget thống kê trạng thái
        let widget = document.getElementById('statusChartWidget');
        if (!widget) {
            widget = document.createElement('div');
            widget.id = 'statusChartWidget';
            widget.className = 'chart-widget';
            widget.innerHTML = `
                <div class="widget-header">
                    <h4><i class="fas fa-chart-pie"></i> Trạng thái đảng viên</h4>
                </div>
                <div class="widget-content">
                    <canvas id="statusChart" height="200"></canvas>
                </div>
            `;
            document.querySelector('.dashboard-stats').parentNode.appendChild(widget);
        }
        
        const ctx = document.getElementById('statusChart');
        if (!ctx) return;
        
        // Lấy dữ liệu từ API
        apiService.getMemberStats().then(stats => {
            const statusData = [
                stats.active,
                stats.retired,
                stats.transferred,
                stats.suspended
            ];
            
            const statusLabels = ['Đang sinh hoạt', 'Đã nghỉ hưu', 'Chuyển đi', 'Tạm ngừng'];
            const statusColors = ['#4CAF50', '#FF9800', '#2196F3', '#F44336'];
            
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: statusLabels,
                    datasets: [{
                        data: statusData,
                        backgroundColor: statusColors,
                        borderColor: statusColors.map(c => c + 'CC'),
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const total = statusData.reduce((a, b) => a + b, 0);
                                    const percentage = ((context.parsed / total) * 100).toFixed(1);
                                    return `${context.label}: ${Utils.formatNumber(context.parsed)} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        });
    }
    
    static async loadActivities() {
        try {
            const activities = await apiService.getActivities(15);
            this.updateActivities(activities);
        } catch (error) {
            console.error('Lỗi tải hoạt động:', error);
        }
    }
    
    static updateActivities(activities) {
        const container = document.getElementById('activitiesList');
        if (!container) return;
        
        if (!activities || activities.length === 0) {
            container.innerHTML = `
                <div class="empty-activities">
                    <i class="fas fa-history"></i>
                    <p>Chưa có hoạt động nào</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        activities.forEach(activity => {
            const timeAgo = this.getTimeAgo(activity.timestamp);
            const icon = this.getActivityIcon(activity.action);
            
            html += `
                <div class="activity-item">
                    <div class="activity-icon">
                        ${icon}
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">
                            <strong>${activity.description}</strong>
                            <span class="activity-time">${timeAgo}</span>
                        </div>
                        <div class="activity-details">
                            <span class="activity-user">
                                <i class="fas fa-user"></i> ${activity.userName}
                            </span>
                            <span class="activity-module">
                                <i class="fas fa-folder"></i> ${activity.module}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    static getTimeAgo(timestamp) {
        const now = new Date();
        const past = new Date(timestamp);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return Utils.formatDate(past, 'DD/MM/YYYY');
    }
    
    static getActivityIcon(action) {
        const icons = {
            'Thêm mới': 'fas fa-plus-circle',
            'Cập nhật': 'fas fa-edit',
            'Xóa': 'fas fa-trash',
            'Đăng nhập': 'fas fa-sign-in-alt',
            'Đăng xuất': 'fas fa-sign-out-alt',
            'Xuất báo cáo': 'fas fa-file-export',
            'Import': 'fas fa-file-import',
            'Backup': 'fas fa-database',
            'Khởi động': 'fas fa-power-off'
        };
        
        const iconClass = icons[action] || 'fas fa-circle';
        return `<i class="${iconClass}"></i>`;
    }
    
    static async loadNotifications() {
        try {
            // Giả lập notifications
            const notifications = [
                {
                    id: 1,
                    title: 'Cuộc họp chi bộ',
                    message: 'Cuộc họp chi bộ VP vào lúc 14:00 ngày mai',
                    type: 'meeting',
                    time: new Date(Date.now() + 86400000).toISOString(),
                    read: false
                },
                {
                    id: 2,
                    title: 'Văn bản mới',
                    message: 'Quyết định số 15/QĐ-ĐU đã được ban hành',
                    type: 'document',
                    time: new Date().toISOString(),
                    read: false
                },
                {
                    id: 3,
                    title: 'Sinh nhật đảng viên',
                    message: 'Nguyễn Văn A có sinh nhật vào ngày mai',
                    type: 'birthday',
                    time: new Date(Date.now() + 86400000).toISOString(),
                    read: true
                }
            ];
            
            this.updateNotificationBadge(notifications.filter(n => !n.read).length);
            this.updateNotificationDropdown(notifications);
            
        } catch (error) {
            console.error('Lỗi tải thông báo:', error);
        }
    }
    
    static updateNotificationBadge(count) {
        const badge = document.getElementById('notificationCount');
        if (!badge) return;
        
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
    
    static updateNotificationDropdown(notifications) {
        const dropdown = document.querySelector('.notifications-dropdown');
        if (!dropdown) return;
        
        let html = `
            <div class="notifications-header">
                <h4>Thông báo</h4>
                <button class="btn btn-sm btn-secondary" onclick="Dashboard.markAllAsRead()">
                    Đánh dấu đã đọc
                </button>
            </div>
            <div class="notifications-list">
        `;
        
        if (notifications.length === 0) {
            html += `
                <div class="empty-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <p>Không có thông báo</p>
                </div>
            `;
        } else {
            notifications.forEach(notif => {
                const timeAgo = this.getTimeAgo(notif.time);
                const icon = this.getNotificationIcon(notif.type);
                
                html += `
                    <div class="notification-item ${notif.read ? 'read' : 'unread'}">
                        <div class="notification-icon">${icon}</div>
                        <div class="notification-content">
                            <div class="notification-title">${notif.title}</div>
                            <div class="notification-message">${notif.message}</div>
                            <div class="notification-time">${timeAgo}</div>
                        </div>
                        ${!notif.read ? '<div class="notification-dot"></div>' : ''}
                    </div>
                `;
            });
        }
        
        html += `
            </div>
            <div class="notifications-footer">
                <a href="#" onclick="Dashboard.showAllNotifications()">Xem tất cả</a>
            </div>
        `;
        
        dropdown.innerHTML = html;
    }
    
    static getNotificationIcon(type) {
        const icons = {
            'meeting': 'fas fa-calendar-alt',
            'document': 'fas fa-file-alt',
            'birthday': 'fas fa-birthday-cake',
            'system': 'fas fa-cog',
            'warning': 'fas fa-exclamation-triangle'
        };
        
        const iconClass = icons[type] || 'fas fa-bell';
        return `<i class="${iconClass}"></i>`;
    }
    
    static updateUpcomingMeetings(meetings) {
        const container = document.getElementById('upcomingMeetings');
        if (!container) {
            // Tạo widget nếu chưa có
            const widget = document.createElement('div');
            widget.className = 'dashboard-widget';
            widget.innerHTML = `
                <div class="widget-header">
                    <h4><i class="fas fa-calendar-check"></i> Cuộc họp sắp tới</h4>
                    <button class="btn btn-sm btn-secondary" onclick="MeetingsManager.showAddForm()">
                        <i class="fas fa-plus"></i> Thêm
                    </button>
                </div>
                <div class="widget-content">
                    <div id="upcomingMeetings"></div>
                </div>
            `;
            document.querySelector('.recent-activities').parentNode.appendChild(widget);
            return;
        }
        
        if (!meetings || meetings.length === 0) {
            container.innerHTML = `
                <div class="empty-meetings">
                    <i class="fas fa-calendar-times"></i>
                    <p>Không có cuộc họp sắp tới</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        meetings.forEach(meeting => {
            const meetingDate = new Date(meeting.thoiGian);
            const timeStr = Utils.formatDate(meetingDate, 'DD/MM HH:mm');
            const fromNow = this.getTimeUntil(meetingDate);
            
            html += `
                <div class="meeting-item">
                    <div class="meeting-time">
                        <div class="meeting-date">${timeStr}</div>
                        <div class="meeting-from-now">${fromNow}</div>
                    </div>
                    <div class="meeting-details">
                        <div class="meeting-title">${meeting.tenCuocHop}</div>
                        <div class="meeting-meta">
                            <span><i class="fas fa-map-marker-alt"></i> ${meeting.diaDiem}</span>
                            <span><i class="fas fa-user-tie"></i> ${meeting.chuTri}</span>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-primary" onclick="MeetingsManager.viewMeeting('${meeting.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    static getTimeUntil(date) {
        const now = new Date();
        const diffMs = date - now;
        const diffDays = Math.floor(diffMs / 86400000);
        const diffHours = Math.floor((diffMs % 86400000) / 3600000);
        
        if (diffDays > 0) return `${diffDays} ngày nữa`;
        if (diffHours > 0) return `${diffHours} giờ nữa`;
        return 'Sắp diễn ra';
    }
    
    static initEventListeners() {
        // Refresh button
        const refreshBtn = document.querySelector('button[onclick*="Dashboard.refresh"]');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }
        
        // Export button
        const exportBtn = document.querySelector('button[onclick*="Dashboard.exportDashboard"]');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportDashboard());
        }
        
        // Notifications button
        const notifBtn = document.getElementById('notificationsBtn');
        if (notifBtn) {
            notifBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleNotifications();
            });
        }
        
        // Global search
        const globalSearch = document.getElementById('globalSearch');
        if (globalSearch) {
            globalSearch.addEventListener('input', Utils.debounce((e) => {
                this.globalSearch(e.target.value);
            }, 300));
        }
        
        // Online/offline detection
        window.addEventListener('online', () => {
            this.updateConnectionStatus();
            showToast('Đã khôi phục kết nối', 'success');
            this.refresh();
        });
        
        window.addEventListener('offline', () => {
            this.updateConnectionStatus();
            showToast('Mất kết nối mạng', 'warning');
        });
    }
    
    static toggleNotifications() {
        const dropdown = document.querySelector('.notifications-dropdown');
        if (!dropdown) {
            // Tạo dropdown
            const notifContainer = document.querySelector('.notifications');
            const dropdown = document.createElement('div');
            dropdown.className = 'notifications-dropdown';
            notifContainer.appendChild(dropdown);
            this.loadNotifications();
        }
        
        dropdown.classList.toggle('show');
        
        // Đóng khi click bên ngoài
        document.addEventListener('click', function closeDropdown(e) {
            if (!notifBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
                document.removeEventListener('click', closeDropdown);
            }
        });
    }
    
    static globalSearch(query) {
        if (!query.trim()) return;
        
        // Tìm kiếm toàn hệ thống
        Promise.all([
            apiService.searchMembers(query),
            // Thêm các module khác sau
        ]).then(results => {
            const [members] = results;
            this.showSearchResults(query, members);
        });
    }
    
    static showSearchResults(query, results) {
        if (results.length === 0) {
            showToast(`Không tìm thấy kết quả cho "${query}"`, 'info');
            return;
        }
        
        let html = `
            <div class="search-results">
                <div class="search-header">
                    <h4>Kết quả tìm kiếm: "${query}"</h4>
                    <small>${results.length} kết quả</small>
                </div>
                <div class="search-list">
        `;
        
        results.slice(0, 10).forEach(item => {
            html += `
                <div class="search-item" onclick="MembersManager.viewMember('${item.id}')">
                    <i class="fas fa-user"></i>
                    <div>
                        <strong>${item.hoTen}</strong>
                        <small>${item.soTheDangVien} • ${Utils.getBranchName(item.chiBo)}</small>
                    </div>
                </div>
            `;
        });
        
        if (results.length > 10) {
            html += `
                <div class="search-more">
                    <a href="#" onclick="MembersManager.resetFilters(); showPage('members')">
                        Xem thêm ${results.length - 10} kết quả...
                    </a>
                </div>
            `;
        }
        
        html += `
                </div>
            </div>
        `;
        
        ModalManager.showCustomModal('Tìm kiếm', html, 'modal-md');
    }
    
    static async refresh() {
        await this.loadDashboardData();
        
        // Refresh charts
        this.initGrowthChart();
        this.initBranchChart();
        
        showToast('Đã cập nhật dữ liệu', 'success');
    }
    
    static startAutoRefresh() {
        // Dừng interval cũ nếu có
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
        
        // Bắt đầu auto-refresh
        this.autoRefreshInterval = setInterval(() => {
            if (navigator.onLine && document.visibilityState === 'visible') {
                this.refreshSilently();
            }
        }, this.refreshRate);
    }
    
    static refreshSilently() {
        // Refresh không hiển thị thông báo
        this.loadDashboardData().then(() => {
            console.log('Auto-refresh completed');
        });
    }
    
    static async exportDashboard() {
        try {
            // Thu thập dữ liệu
            const [stats, growthData, branchData] = await Promise.all([
                apiService.getDashboardStats(),
                apiService.getMemberGrowthData(5),
                apiService.getBranchDistribution()
            ]);
            
            // Tạo nội dung HTML để in
            const printContent = this.createExportContent(stats, growthData, branchData);
            
            // Mở cửa sổ in
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Báo cáo Dashboard - ${new Date().toLocaleDateString()}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .print-header { text-align: center; margin-bottom: 30px; }
                        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
                        .stat-box { border: 1px solid #ddd; padding: 20px; text-align: center; }
                        .stat-number { font-size: 24px; font-weight: bold; color: #C62828; }
                        .chart-placeholder { height: 300px; border: 1px dashed #ddd; margin: 20px 0; display: flex; align-items: center; justify-content: center; }
                        .signature { margin-top: 50px; text-align: right; }
                        @media print {
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    ${printContent}
                    <div class="no-print" style="margin-top: 20px; text-align: center;">
                        <button onclick="window.print()" style="padding: 10px 20px; background: #C62828; color: white; border: none; cursor: pointer;">
                            <i class="fas fa-print"></i> In báo cáo
                        </button>
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            
        } catch (error) {
            console.error('Lỗi xuất báo cáo:', error);
            showToast('Lỗi xuất báo cáo', 'error');
        }
    }
    
    static createExportContent(stats, growthData, branchData) {
        const now = new Date();
        return `
            <div class="print-header">
                <h1>BÁO CÁO DASHBOARD HỆ THỐNG QUẢN LÝ ĐẢNG</h1>
                <p>Thời điểm xuất báo cáo: ${Utils.formatDate(now, 'DD/MM/YYYY HH:mm')}</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-box">
                    <div class="stat-number">${Utils.formatNumber(stats.totalMembers)}</div>
                    <div>Tổng số đảng viên</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">${Utils.formatNumber(stats.activeMembers)}</div>
                    <div>Đang sinh hoạt</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">${Utils.formatNumber(stats.retiredMembers)}</div>
                    <div>Đã nghỉ hưu</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">${Utils.formatNumber(stats.meetingsThisMonth)}</div>
                    <div>Cuộc họp tháng này</div>
                </div>
            </div>
            
            <h2>Phát triển đảng viên (5 năm gần nhất)</h2>
            <table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background: #f5f5f5;">
                        <th>Năm</th>
                        <th>Tổng số</th>
                        <th>Tăng/Giảm</th>
                        <th>Tỷ lệ</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(growthData).map(([year, count], index, arr) => {
                        const prevCount = index > 0 ? arr[index - 1][1] : 0;
                        const change = index > 0 ? count - prevCount : 0;
                        const changePercent = index > 0 ? ((change / prevCount) * 100).toFixed(1) : 0;
                        
                        return `
                            <tr>
                                <td>${year}</td>
                                <td>${Utils.formatNumber(count)}</td>
                                <td style="color: ${change >= 0 ? 'green' : 'red'}">
                                    ${change >= 0 ? '+' : ''}${Utils.formatNumber(change)}
                                </td>
                                <td>${changePercent}%</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            
            <h2>Phân bố theo chi bộ</h2>
            <table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background: #f5f5f5;">
                        <th>Chi bộ</th>
                        <th>Số lượng</th>
                        <th>Tỷ lệ</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(branchData).map(([branch, count]) => `
                        <tr>
                            <td>${branch}</td>
                            <td>${Utils.formatNumber(count)}</td>
                            <td>${((count / stats.totalMembers) * 100).toFixed(1)}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="signature">
                <p><strong>Người lập báo cáo</strong></p>
                <br><br>
                <p>${apiService.getCurrentUser()?.fullName || 'Quản trị viên'}</p>
            </div>
        `;
    }
    
    static markAllAsRead() {
        showToast('Đã đánh dấu tất cả là đã đọc', 'success');
        // Cập nhật UI
        document.querySelectorAll('.notification-item.unread').forEach(item => {
            item.classList.remove('unread');
            item.classList.add('read');
            item.querySelector('.notification-dot')?.remove();
        });
        this.updateNotificationBadge(0);
    }
    
    static showAllNotifications() {
        showToast('Tính năng đang phát triển', 'info');
    }
}

// Khởi tạo dashboard khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    if (authService.api.getCurrentUser() && showPage.name === 'dashboard') {
        Dashboard.init();
    }
});