class ReportsManager {
    static currentReport = 'members';
    static dateRange = {
        from: new Date(new Date().getFullYear(), 0, 1), // Đầu năm
        to: new Date() // Hôm nay
    };
    
    static async init() {
        this.initEventListeners();
        await this.loadReportData();
        this.initCharts();
    }
    
    static initEventListeners() {
        // Chuyển đổi loại báo cáo
        document.querySelectorAll('.report-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const reportType = e.target.dataset.report;
                if (reportType) {
                    this.switchReport(reportType);
                }
            });
        });
        
        // Thay đổi khoảng thời gian
        document.getElementById('reportDateFrom')?.addEventListener('change', (e) => {
            this.dateRange.from = new Date(e.target.value);
            this.loadReportData();
        });
        
        document.getElementById('reportDateTo')?.addEventListener('change', (e) => {
            this.dateRange.to = new Date(e.target.value);
            this.loadReportData();
        });
    }
    
    static switchReport(reportType) {
        this.currentReport = reportType;
        
        // Cập nhật active tab
        document.querySelectorAll('.report-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.report === reportType);
        });
        
        // Hiển thị nội dung tương ứng
        document.querySelectorAll('.report-content').forEach(content => {
            content.style.display = content.id === `${reportType}Report` ? 'block' : 'none';
        });
        
        this.loadReportData();
    }
    
    static async loadReportData() {
        try {
            switch (this.currentReport) {
                case 'members':
                    await this.loadMembersReport();
                    break;
                case 'documents':
                    await this.loadDocumentsReport();
                    break;
                case 'meetings':
                    await this.loadMeetingsReport();
                    break;
                case 'activities':
                    await this.loadActivitiesReport();
                    break;
            }
        } catch (error) {
            console.error('Lỗi tải báo cáo:', error);
            showToast('Lỗi tải dữ liệu báo cáo', 'error');
        }
    }
    
    static async loadMembersReport() {
        // Lấy thống kê tổng quan
        const stats = await apiService.getMemberStats();
        
        // Lấy dữ liệu phát triển theo năm
        const growthData = await apiService.getMemberGrowthData(10);
        
        // Lấy phân bố theo chi bộ
        const branchData = await apiService.getBranchDistribution();
        
        // Cập nhật UI
        this.updateMembersReportUI(stats, growthData, branchData);
        
        // Vẽ biểu đồ
        this.renderGrowthChart(growthData);
        this.renderBranchChart(branchData);
    }
    
    static updateMembersReportUI(stats, growthData, branchData) {
        // Tổng quan
        document.getElementById('reportTotalMembers').textContent = stats.total;
        document.getElementById('reportActiveMembers').textContent = stats.active;
        document.getElementById('reportRetiredMembers').textContent = stats.retired;
        document.getElementById('reportNewMembers').textContent = stats.newThisYear;
        
        // Phân bố giới tính
        const genderData = stats.byGender;
        document.getElementById('malePercentage').textContent = 
            `${((genderData.Nam / stats.total) * 100).toFixed(1)}%`;
        document.getElementById('femalePercentage').textContent = 
            `${((genderData.Nữ / stats.total) * 100).toFixed(1)}%`;
        
        // Chi bộ có nhiều đảng viên nhất
        let maxBranch = '';
        let maxCount = 0;
        Object.entries(branchData).forEach(([branch, count]) => {
            if (count > maxCount) {
                maxCount = count;
                maxBranch = branch;
            }
        });
        document.getElementById('largestBranch').textContent = 
            `${maxBranch} (${maxCount} đảng viên)`;
    }
    
    static renderGrowthChart(growthData) {
        const ctx = document.getElementById('growthChart');
        if (!ctx) return;
        
        const years = Object.keys(growthData);
        const counts = Object.values(growthData);
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'Tổng số đảng viên',
                    data: counts,
                    borderColor: '#C62828',
                    backgroundColor: 'rgba(198, 40, 40, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Phát triển đảng viên qua các năm'
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
    
    static renderBranchChart(branchData) {
        const ctx = document.getElementById('branchChart');
        if (!ctx) return;
        
        const branches = Object.keys(branchData);
        const counts = Object.values(branchData);
        const colors = branches.map(branch => {
            const branchConfig = AppConfig.BRANCHES.find(b => b.name === branch);
            return branchConfig ? branchConfig.color : '#666';
        });
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: branches,
                datasets: [{
                    data: counts,
                    backgroundColor: colors.map(c => c + '80'),
                    borderColor: colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    title: {
                        display: true,
                        text: 'Phân bố đảng viên theo chi bộ'
                    }
                }
            }
        });
    }
    
    static async generateReport(type = 'pdf') {
        try {
            showLoading('Đang tạo báo cáo...');
            
            // Thu thập dữ liệu
            const stats = await apiService.getMemberStats();
            const growthData = await apiService.getMemberGrowthData(5);
            const branchData = await apiService.getBranchDistribution();
            
            // Tạo nội dung báo cáo
            const reportContent = this.createReportContent(stats, growthData, branchData);
            
            // Xuất file
            if (type === 'pdf') {
                this.exportToPDF(reportContent);
            } else if (type === 'excel') {
                this.exportToExcel(stats, growthData, branchData);
            }
            
            hideLoading();
            showToast('Xuất báo cáo thành công', 'success');
            
        } catch (error) {
            hideLoading();
            showToast('Lỗi tạo báo cáo', 'error');
            console.error(error);
        }
    }
    
    static createReportContent(stats, growthData, branchData) {
        const now = new Date();
        const dateStr = Utils.formatDate(now, 'DD/MM/YYYY HH:mm');
        
        return `
            <div class="report-pdf">
                <h1 style="text-align: center; color: #C62828;">BÁO CÁO THỐNG KÊ ĐẢNG VIÊN</h1>
                <p style="text-align: center;">Thời điểm báo cáo: ${dateStr}</p>
                
                <h2>1. TỔNG QUAN</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px; width: 25%;">
                            <strong>Tổng số đảng viên:</strong><br>
                            ${stats.total}
                        </td>
                        <td style="border: 1px solid #ddd; padding: 8px; width: 25%;">
                            <strong>Đang sinh hoạt:</strong><br>
                            ${stats.active}
                        </td>
                        <td style="border: 1px solid #ddd; padding: 8px; width: 25%;">
                            <strong>Đã nghỉ hưu:</strong><br>
                            ${stats.retired}
                        </td>
                        <td style="border: 1px solid #ddd; padding: 8px; width: 25%;">
                            <strong>Kết nạp năm nay:</strong><br>
                            ${stats.newThisYear}
                        </td>
                    </tr>
                </table>
                
                <h2>2. PHÂN BỐ THEO CHI BỘ</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background: #f5f5f5;">
                            <th style="border: 1px solid #ddd; padding: 8px;">Chi bộ</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Số lượng</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Tỷ lệ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(branchData).map(([branch, count]) => `
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px;">${branch}</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${count}</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">
                                    ${((count / stats.total) * 100).toFixed(1)}%
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <h2>3. PHÁT TRIỂN QUA CÁC NĂM</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f5f5f5;">
                            <th style="border: 1px solid #ddd; padding: 8px;">Năm</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Tổng số</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Tăng/giảm</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(growthData).map(([year, count], index, arr) => {
                            const prevCount = index > 0 ? arr[index - 1][1] : 0;
                            const change = index > 0 ? count - prevCount : 0;
                            const changePercent = index > 0 ? ((change / prevCount) * 100).toFixed(1) : 0;
                            
                            return `
                                <tr>
                                    <td style="border: 1px solid #ddd; padding: 8px;">${year}</td>
                                    <td style="border: 1px solid #ddd; padding: 8px;">${count}</td>
                                    <td style="border: 1px solid #ddd; padding: 8px; color: ${change >= 0 ? 'green' : 'red'}">
                                        ${change >= 0 ? '+' : ''}${change} (${change >= 0 ? '+' : ''}${changePercent}%)
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                
                <div style="margin-top: 40px; text-align: right;">
                    <p><strong>Người lập báo cáo</strong></p>
                    <br><br>
                    <p>${apiService.getCurrentUser()?.fullName || 'Quản trị viên'}</p>
                </div>
            </div>
        `;
    }
    
    static exportToPDF(content) {
        // Sử dụng thư viện jsPDF hoặc in trình duyệt
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Báo cáo đảng viên</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; }
                    th { background: #f5f5f5; }
                    h1, h2 { color: #C62828; }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
    
    static exportToExcel(stats, growthData, branchData) {
        const data = [
            ['BÁO CÁO THỐNG KÊ ĐẢNG VIÊN'],
            ['Thời điểm báo cáo', new Date().toLocaleString()],
            [''],
            ['1. TỔNG QUAN'],
            ['Tổng số đảng viên', stats.total],
            ['Đang sinh hoạt', stats.active],
            ['Đã nghỉ hưu', stats.retired],
            ['Chuyển đi', stats.transferred],
            ['Tạm ngừng', stats.suspended],
            ['Kết nạp năm nay', stats.newThisYear],
            [''],
            ['2. PHÂN BỐ THEO CHI BỘ'],
            ['Chi bộ', 'Số lượng', 'Tỷ lệ'],
            ...Object.entries(branchData).map(([branch, count]) => [
                branch, 
                count, 
                `${((count / stats.total) * 100).toFixed(1)}%`
            ]),
            [''],
            ['3. PHÁT TRIỂN QUA CÁC NĂM'],
            ['Năm', 'Tổng số', 'Tăng/Giảm', 'Tỷ lệ'],
            ...Object.entries(growthData).map(([year, count], index, arr) => {
                const prevCount = index > 0 ? arr[index - 1][1] : 0;
                const change = index > 0 ? count - prevCount : 0;
                const changePercent = index > 0 ? ((change / prevCount) * 100).toFixed(1) : 0;
                return [year, count, change, `${changePercent}%`];
            })
        ];
        
        Utils.exportToExcel(data, `bao-cao-dang-vien-${new Date().toISOString().split('T')[0]}`);
    }
}