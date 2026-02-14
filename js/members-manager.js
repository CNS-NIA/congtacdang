// Members Management Module
class MembersManager {
    static currentPage = 1;
    static pageSize = 20;
    static currentFilters = {};
    static currentMember = null;
    static membersData = [];
    
    static async init() {
        this.initEventListeners();
        await this.loadMembers();
        this.updateStats();
    }
    
    static initEventListeners() {
        // Search input
        const searchInput = document.getElementById('searchMember');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.currentFilters.search = e.target.value;
                this.currentPage = 1;
                this.loadMembers();
            }, 500));
        }
        
        // Filter inputs
        const branchFilter = document.getElementById('branchFilter');
        if (branchFilter) {
            branchFilter.addEventListener('change', (e) => {
                this.currentFilters.branch = e.target.value || null;
                this.currentPage = 1;
                this.loadMembers();
            });
        }
        
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentFilters.status = e.target.value || null;
                this.currentPage = 1;
                this.loadMembers();
            });
        }
        
        const dateFilter = document.getElementById('dateFilter');
        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.currentFilters.dateFrom = e.target.value || null;
                this.currentPage = 1;
                this.loadMembers();
            });
        }
        
        // Member form
        const memberForm = document.getElementById('memberForm');
        if (memberForm) {
            memberForm.addEventListener('submit', (e) => this.handleSubmitMember(e));
        }
        
        // Apply filters button
        const applyFiltersBtn = document.querySelector('.filter-bar .btn-primary');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                this.applyFilters();
            });
        }
        
        // Reset filters button
        const resetFiltersBtn = document.querySelector('.filter-bar .btn-secondary');
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }
    }
    
    static async loadMembers() {
        try {
            const tableBody = document.getElementById('membersTableBody');
            if (!tableBody) return;
            
            // Hiển thị loading
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-state">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Đang tải dữ liệu đảng viên...</p>
                    </td>
                </tr>
            `;
            
            // Gọi API lấy dữ liệu
            const result = await apiService.getMembers(this.currentPage, this.pageSize, this.currentFilters);
            this.membersData = result.data;
            
            if (this.membersData.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="9" class="empty-state">
                            <i class="fas fa-users-slash"></i>
                            <p>Không tìm thấy đảng viên nào</p>
                            <button class="btn btn-primary btn-sm mt-2" onclick="MembersManager.showAddForm()">
                                <i class="fas fa-user-plus"></i> Thêm đảng viên đầu tiên
                            </button>
                        </td>
                    </tr>
                `;
                this.renderPagination(result.pagination);
                return;
            }
            
            // Render table
            let html = '';
            this.membersData.forEach((member, index) => {
                const stt = (this.currentPage - 1) * this.pageSize + index + 1;
                const age = Utils.calculateAge(member.ngaySinh);
                const seniority = Utils.calculatePartySeniority(member.ngayVaoDang);
                const branchName = Utils.getBranchName(member.chiBo);
                
                html += `
                    <tr data-id="${member.id}">
                        <td>${stt}</td>
                        <td><strong>${member.soTheDangVien}</strong></td>
                        <td>
                            <div class="member-info">
                                <img src="${member.avatar || Utils.createAvatar(member.hoTen, 32)}" 
                                     alt="Avatar" class="member-avatar">
                                <div>
                                    <strong>${member.hoTen}</strong>
                                    <div class="member-meta">
                                        <span>${member.gioiTinh} • ${age} tuổi</span>
                                        ${member.dienThoai ? `<br><small><i class="fas fa-phone"></i> ${Utils.formatPhoneNumber(member.dienThoai)}</small>` : ''}
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td>${Utils.formatDate(member.ngaySinh)}</td>
                        <td>
                            <span class="branch-badge" style="background: ${Utils.getBranchColor(member.chiBo)}20; color: ${Utils.getBranchColor(member.chiBo)};">
                                ${branchName}
                            </span>
                        </td>
                        <td>${member.chucVu}</td>
                        <td>${Utils.createStatusBadge(member.trangThai)}</td>
                        <td>
                            ${Utils.formatDate(member.ngayVaoDang)}
                            <br><small>${seniority.years} năm ${seniority.months} tháng</small>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-action btn-primary btn-sm" 
                                        onclick="MembersManager.viewMember('${member.id}')"
                                        title="Xem chi tiết">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn-action btn-secondary btn-sm" 
                                        onclick="MembersManager.editMember('${member.id}')"
                                        title="Chỉnh sửa">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-action btn-danger btn-sm" 
                                        onclick="MembersManager.deleteMember('${member.id}')"
                                        title="Xóa">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            
            tableBody.innerHTML = html;
            this.renderPagination(result.pagination);
            
        } catch (error) {
            console.error('Lỗi tải danh sách đảng viên:', error);
            showToast('Lỗi tải dữ liệu đảng viên', 'error');
        }
    }
    
    static renderPagination(pagination) {
        const container = document.getElementById('paginationContainer');
        if (!container) return;
        
        if (pagination.totalPages <= 1) {
            container.innerHTML = `
                <div class="pagination-info">
                    Hiển thị ${pagination.total} đảng viên
                </div>
            `;
            return;
        }
        
        let html = `
            <div class="pagination-info">
                Hiển thị ${((pagination.page - 1) * pagination.pageSize) + 1}-${Math.min(pagination.page * pagination.pageSize, pagination.total)} 
                trong tổng số ${pagination.total} đảng viên
            </div>
            
            <div class="pagination-controls">
                <button class="btn btn-secondary btn-sm ${pagination.page === 1 ? 'disabled' : ''}" 
                        onclick="MembersManager.changePage(${pagination.page - 1})" 
                        ${pagination.page === 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i> Trước
                </button>
                
                <div class="page-numbers">`;
        
        // Hiển thị tối đa 5 trang
        let startPage = Math.max(1, pagination.page - 2);
        let endPage = Math.min(pagination.totalPages, startPage + 4);
        
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            html += `
                <button class="btn btn-sm ${i === pagination.page ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="MembersManager.changePage(${i})">
                    ${i}
                </button>
            `;
        }
        
        html += `
                </div>
                
                <button class="btn btn-secondary btn-sm ${pagination.page === pagination.totalPages ? 'disabled' : ''}" 
                        onclick="MembersManager.changePage(${pagination.page + 1})" 
                        ${pagination.page === pagination.totalPages ? 'disabled' : ''}>
                    Sau <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    static changePage(page) {
        this.currentPage = page;
        this.loadMembers();
        // Cuộn lên đầu bảng
        const table = document.querySelector('.members-table-container');
        if (table) {
            table.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    static async updateStats() {
        try {
            const stats = await apiService.getMemberStats();
            
            // Dashboard stats
            const totalStat = document.getElementById('totalMembersStat');
            const activeStat = document.getElementById('activeMembersStat');
            const retiredStat = document.getElementById('retiredMembersStat');
            
            if (totalStat) totalStat.textContent = stats.total;
            if (activeStat) activeStat.textContent = stats.active;
            if (retiredStat) retiredStat.textContent = stats.retired;
            
            // Members page stats
            const totalMembers = document.getElementById('totalMembers');
            const activeMembers = document.getElementById('activeMembers');
            const retiredMembers = document.getElementById('retiredMembers');
            const newThisYear = document.getElementById('newThisYear');
            
            if (totalMembers) totalMembers.textContent = stats.total;
            if (activeMembers) activeMembers.textContent = stats.active;
            if (retiredMembers) retiredMembers.textContent = stats.retired;
            if (newThisYear) newThisYear.textContent = stats.newThisYear;
            
        } catch (error) {
            console.error('Lỗi cập nhật thống kê:', error);
        }
    }
    
    static showAddForm() {
        this.currentMember = null;
        const formTitle = document.getElementById('formTitle');
        if (formTitle) {
            formTitle.textContent = 'Thêm đảng viên mới';
        }
        
        // Reset form
        const form = document.getElementById('memberForm');
        if (form) {
            form.reset();
            
            // Set default values
            document.getElementById('danToc').value = 'Kinh';
            document.getElementById('tonGiao').value = 'Không';
            document.getElementById('trinhDo').value = 'Đại học';
            document.getElementById('trangThai').value = 'active';
            
            // Set today's date for ngayVaoDang
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('ngayVaoDang').value = today;
            
            // Set ngayChinhThuc to 1 year from today
            const nextYear = new Date();
            nextYear.setFullYear(nextYear.getFullYear() + 1);
            document.getElementById('ngayChinhThuc').value = nextYear.toISOString().split('T')[0];
        }
        
        // Show modal
        const modal = document.getElementById('memberFormModal');
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    static async viewMember(id) {
        try {
            const member = await apiService.getMemberById(id);
            if (!member) {
                showToast('Không tìm thấy thông tin đảng viên', 'warning');
                return;
            }
            
            this.currentMember = member;
            this.renderMemberDetail(member);
            
            // Show modal
            const modal = document.getElementById('memberDetailModal');
            if (modal) {
                modal.classList.add('active');
            }
            
        } catch (error) {
            console.error('Lỗi xem chi tiết đảng viên:', error);
            showToast('Lỗi tải thông tin đảng viên', 'error');
        }
    }
    
    static renderMemberDetail(member) {
        const container = document.getElementById('memberDetailContent');
        if (!container) return;
        
        const age = Utils.calculateAge(member.ngaySinh);
        const seniority = Utils.calculatePartySeniority(member.ngayVaoDang);
        const branchName = Utils.getBranchName(member.chiBo);
        const branchColor = Utils.getBranchColor(member.chiBo);
        
        const html = `
            <div class="member-detail-container">
                <div class="member-header">
                    <img src="${member.avatar || Utils.createAvatar(member.hoTen, 80)}" 
                         alt="Avatar" class="detail-avatar">
                    <div class="member-title">
                        <h3>${member.hoTen}</h3>
                        <p class="member-id">${member.soTheDangVien}</p>
                        <div class="member-tags">
                            <span class="badge" style="background: ${branchColor}20; color: ${branchColor};">
                                <i class="fas fa-building"></i> ${branchName}
                            </span>
                            ${Utils.createStatusBadge(member.trangThai)}
                            <span class="badge badge-info">
                                <i class="fas fa-venus-mars"></i> ${member.gioiTinh}
                            </span>
                            <span class="badge badge-secondary">
                                <i class="fas fa-birthday-cake"></i> ${age} tuổi
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-sections">
                    <div class="detail-section">
                        <h4><i class="fas fa-id-card"></i> Thông tin cá nhân</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="detail-label">Ngày sinh:</span>
                                <span class="detail-value">${Utils.formatDate(member.ngaySinh)}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Dân tộc:</span>
                                <span class="detail-value">${member.danToc}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Tôn giáo:</span>
                                <span class="detail-value">${member.tonGiao}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Trình độ:</span>
                                <span class="detail-value">${member.trinhDo}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Nghề nghiệp:</span>
                                <span class="detail-value">${member.ngheNghiep}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Quê quán:</span>
                                <span class="detail-value">${member.queQuan || 'Chưa cập nhật'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4><i class="fas fa-landmark"></i> Thông tin Đảng</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="detail-label">Ngày vào Đảng:</span>
                                <span class="detail-value">
                                    ${Utils.formatDate(member.ngayVaoDang)}
                                    <small class="text-muted"> (${seniority.years} năm ${seniority.months} tháng)</small>
                                </span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Ngày chính thức:</span>
                                <span class="detail-value">${Utils.formatDate(member.ngayChinhThuc)}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Chức vụ:</span>
                                <span class="detail-value">${member.chucVu}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Chi bộ:</span>
                                <span class="detail-value">${branchName}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4><i class="fas fa-address-book"></i> Thông tin liên hệ</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="detail-label">Điện thoại:</span>
                                <span class="detail-value">${Utils.formatPhoneNumber(member.dienThoai) || 'Chưa cập nhật'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Email:</span>
                                <span class="detail-value">${member.email || 'Chưa cập nhật'}</span>
                            </div>
                            <div class="detail-item full-width">
                                <span class="detail-label">Địa chỉ:</span>
                                <span class="detail-value">${member.diaChi || 'Chưa cập nhật'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4><i class="fas fa-history"></i> Thông tin hệ thống</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="detail-label">Ngày tạo:</span>
                                <span class="detail-value">${Utils.formatDate(member.createdAt, 'DD/MM/YYYY HH:mm')}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Ngày cập nhật:</span>
                                <span class="detail-value">${Utils.formatDate(member.updatedAt, 'DD/MM/YYYY HH:mm')}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Người tạo:</span>
                                <span class="detail-value">${member.createdBy}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    static async editMember(id) {
        try {
            const member = await apiService.getMemberById(id);
            if (!member) {
                showToast('Không tìm thấy đảng viên', 'warning');
                return;
            }
            
            this.currentMember = member;
            this.showEditForm(member);
            
        } catch (error) {
            console.error('Lỗi chỉnh sửa đảng viên:', error);
            showToast('Lỗi tải thông tin đảng viên', 'error');
        }
    }
    
    static showEditForm(member) {
        const formTitle = document.getElementById('formTitle');
        if (formTitle) {
            formTitle.textContent = 'Chỉnh sửa thông tin đảng viên';
        }
        
        // Fill form with member data
        const form = document.getElementById('memberForm');
        if (!form) return;
        
        // Reset form
        form.reset();
        
        // Fill values
        Object.keys(member).forEach(key => {
            const input = document.getElementById(key);
            if (input && member[key]) {
                if (input.type === 'date') {
                    input.value = member[key].split('T')[0];
                } else {
                    input.value = member[key];
                }
            }
        });
        
        // Show modal
        const modal = document.getElementById('memberFormModal');
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    static async handleSubmitMember(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const memberData = {};
        
        // Collect form data
        for (const [key, value] of formData.entries()) {
            memberData[key] = value.trim();
        }
        
        // Validate required fields
        const requiredFields = ['hoTen', 'soTheDangVien', 'ngaySinh', 'ngayVaoDang', 'chiBo'];
        for (const field of requiredFields) {
            if (!memberData[field]) {
                showToast(`Vui lòng nhập ${field === 'hoTen' ? 'họ tên' : field}`, 'warning');
                return;
            }
        }
        
        // Validate dates
        const birthDate = new Date(memberData.ngaySinh);
        const joinDate = new Date(memberData.ngayVaoDang);
        const today = new Date();
        
        if (birthDate >= today) {
            showToast('Ngày sinh phải trước ngày hiện tại', 'warning');
            return;
        }
        
        if (joinDate < birthDate) {
            showToast('Ngày vào Đảng phải sau ngày sinh', 'warning');
            return;
        }
        
        if (memberData.ngayChinhThuc && new Date(memberData.ngayChinhThuc) < joinDate) {
            showToast('Ngày chính thức phải sau ngày vào Đảng', 'warning');
            return;
        }
        
        // Validate age >= 18 when joining party
        const ageAtJoin = Utils.calculateAge(memberData.ngaySinh, memberData.ngayVaoDang);
        if (ageAtJoin < 18) {
            showToast('Tuổi vào Đảng phải từ 18 tuổi trở lên', 'warning');
            return;
        }
        
        // Disable submit button
        const submitBtn = document.getElementById('submitMemberBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
        
        try {
            let result;
            
            if (this.currentMember) {
                // Update existing member
                result = await apiService.updateMember(this.currentMember.id, memberData);
                showToast('Cập nhật thông tin đảng viên thành công', 'success');
            } else {
                // Add new member
                result = await apiService.createMember(memberData);
                showToast('Thêm đảng viên mới thành công', 'success');
            }
            
            if (result) {
                // Close modal
                this.closeFormModal();
                
                // Reload members list
                await this.loadMembers();
                
                // Update stats
                await this.updateStats();
                
                // Update dashboard if needed
                if (typeof Dashboard !== 'undefined') {
                    Dashboard.updateStats();
                }
            }
            
        } catch (error) {
            console.error('Lỗi lưu thông tin đảng viên:', error);
            showToast('Lỗi lưu thông tin đảng viên', 'error');
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
    
    static async deleteMember(id) {
        try {
            const member = await apiService.getMemberById(id);
            if (!member) return;
            
            ModalManager.showConfirm(
                'Xác nhận xóa đảng viên',
                `Bạn có chắc chắn muốn xóa đảng viên <strong>${member.hoTen}</strong> (${member.soTheDangVien})?<br>
                 <small class="text-muted">Hành động này không thể hoàn tác.</small>`,
                async () => {
                    try {
                        await apiService.deleteMember(id);
                        showToast('Đã xóa đảng viên thành công', 'success');
                        
                        // Reload members list
                        await this.loadMembers();
                        
                        // Update stats
                        await this.updateStats();
                        
                        // Update dashboard if needed
                        if (typeof Dashboard !== 'undefined') {
                            Dashboard.updateStats();
                        }
                        
                    } catch (error) {
                        showToast('Lỗi xóa đảng viên', 'error');
                        console.error(error);
                    }
                }
            );
            
        } catch (error) {
            console.error('Lỗi xóa đảng viên:', error);
            showToast('Lỗi xóa đảng viên', 'error');
        }
    }
    
    static editCurrentMember() {
        if (this.currentMember) {
            this.closeModal();
            setTimeout(() => {
                this.editMember(this.currentMember.id);
            }, 300);
        }
    }
    
    static closeModal() {
        const modal = document.getElementById('memberDetailModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.currentMember = null;
    }
    
    static closeFormModal() {
        const modal = document.getElementById('memberFormModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.currentMember = null;
    }
    
    static applyFilters() {
        // Get all filter values
        const branch = document.getElementById('branchFilter').value;
        const status = document.getElementById('statusFilter').value;
        const date = document.getElementById('dateFilter').value;
        
        this.currentFilters = {
            branch: branch || null,
            status: status || null,
            dateFrom: date || null
        };
        
        this.currentPage = 1;
        this.loadMembers();
    }
    
    static resetFilters() {
        // Reset filter inputs
        document.getElementById('branchFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('dateFilter').value = '';
        document.getElementById('searchMember').value = '';
        
        this.currentFilters = {};
        this.currentPage = 1;
        this.loadMembers();
    }
    
    static async exportToExcel() {
        try {
            // Get all members (without pagination)
            const result = await apiService.getMembers(1, 1000000, this.currentFilters);
            
            if (result.data.length === 0) {
                showToast('Không có dữ liệu để xuất', 'warning');
                return;
            }
            
            // Format data for export
            const exportData = result.data.map(member => ({
                'Số thẻ đảng viên': member.soTheDangVien,
                'Họ và tên': member.hoTen,
                'Ngày sinh': Utils.formatDate(member.ngaySinh),
                'Giới tính': member.gioiTinh,
                'Dân tộc': member.danToc,
                'Chi bộ': Utils.getBranchName(member.chiBo),
                'Chức vụ': member.chucVu,
                'Trạng thái': Utils.getStatusName(member.trangThai),
                'Ngày vào Đảng': Utils.formatDate(member.ngayVaoDang),
                'Ngày chính thức': Utils.formatDate(member.ngayChinhThuc),
                'Điện thoại': member.dienThoai,
                'Email': member.email,
                'Địa chỉ': member.diaChi,
                'Trình độ': member.trinhDo,
                'Nghề nghiệp': member.ngheNghiep
            }));
            
            // Export to Excel
            const dateStr = new Date().toISOString().split('T')[0];
            Utils.exportToExcel(exportData, `danh-sach-dang-vien-${dateStr}`);
            
            showToast('Xuất Excel thành công', 'success');
            
        } catch (error) {
            console.error('Lỗi xuất Excel:', error);
            showToast('Lỗi xuất dữ liệu', 'error');
        }
    }
    
    static async importFromExcel() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.xlsx,.xls';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                showLoading('Đang import dữ liệu...');
                
                // Đọc file
                const data = await Utils.importFromFile(file);
                
                if (!data || data.length === 0) {
                    throw new Error('File không có dữ liệu');
                }
                
                // Chuyển đổi dữ liệu
                const membersToImport = data.map(row => {
                    // Map từ CSV columns sang member fields
                    return {
                        soTheDangVien: row['Số thẻ đảng viên'] || row['soTheDangVien'] || '',
                        hoTen: row['Họ và tên'] || row['hoTen'] || '',
                        ngaySinh: row['Ngày sinh'] || row['ngaySinh'] || '',
                        gioiTinh: row['Giới tính'] || row['gioiTinh'] || 'Nam',
                        danToc: row['Dân tộc'] || row['danToc'] || 'Kinh',
                        chiBo: this.mapBranchName(row['Chi bộ'] || row['chiBo'] || 'VP'),
                        chucVu: row['Chức vụ'] || row['chucVu'] || 'Đảng viên',
                        trangThai: this.mapStatusName(row['Trạng thái'] || row['trangThai'] || 'active'),
                        ngayVaoDang: row['Ngày vào Đảng'] || row['ngayVaoDang'] || '',
                        ngayChinhThuc: row['Ngày chính thức'] || row['ngayChinhThuc'] || '',
                        dienThoai: row['Điện thoại'] || row['dienThoai'] || '',
                        email: row['Email'] || row['email'] || '',
                        diaChi: row['Địa chỉ'] || row['diaChi'] || '',
                        trinhDo: row['Trình độ'] || row['trinhDo'] || 'Đại học',
                        ngheNghiep: row['Nghề nghiệp'] || row['ngheNghiep'] || ''
                    };
                }).filter(member => member.hoTen && member.soTheDangVien); // Lọc bỏ hàng trống
                
                if (membersToImport.length === 0) {
                    throw new Error('Không có dữ liệu hợp lệ để import');
                }
                
                // Xác nhận import
                ModalManager.showConfirm(
                    'Xác nhận Import',
                    `Bạn sắp import <strong>${membersToImport.length}</strong> đảng viên.<br>
                     <small class="text-muted">Dữ liệu cũ sẽ được giữ nguyên, chỉ thêm mới.</small>`,
                    async () => {
                        try {
                            let successCount = 0;
                            let errorCount = 0;
                            
                            // Import từng member
                            for (const memberData of membersToImport) {
                                try {
                                    await apiService.createMember(memberData);
                                    successCount++;
                                } catch (error) {
                                    errorCount++;
                                    console.error(`Lỗi import member ${memberData.hoTen}:`, error);
                                }
                            }
                            
                            hideLoading();
                            
                            if (successCount > 0) {
                                showToast(`Import thành công ${successCount} đảng viên${errorCount > 0 ? `, ${errorCount} lỗi` : ''}`, 'success');
                                
                                // Reload data
                                await this.loadMembers();
                                await this.updateStats();
                                
                                if (typeof Dashboard !== 'undefined') {
                                    Dashboard.updateStats();
                                }
                            } else {
                                showToast('Import thất bại', 'error');
                            }
                            
                        } catch (error) {
                            hideLoading();
                            showToast('Lỗi import dữ liệu', 'error');
                            console.error(error);
                        }
                    }
                );
                
            } catch (error) {
                hideLoading();
                showToast(error.message || 'Lỗi đọc file', 'error');
                console.error(error);
            }
        };
        
        input.click();
    }
    
    static mapBranchName(branchName) {
        // Map từ tên chi bộ sang ID
        const branch = AppConfig.BRANCHES.find(b => 
            b.name === branchName || b.id === branchName
        );
        return branch ? branch.id : 'VP';
    }
    
    static mapStatusName(statusName) {
        // Map từ tên trạng thái sang ID
        const status = AppConfig.MEMBER_STATUSES.find(s => 
            s.name === statusName || s.id === statusName
        );
        return status ? status.id : 'active';
    }
    
    static async backupData() {
        try {
            await apiService.backupData();
        } catch (error) {
            showToast('Lỗi backup dữ liệu', 'error');
            console.error(error);
        }
    }
    
    static printList() {
        const printContent = document.querySelector('.members-table-container').innerHTML;
        const originalContent = document.body.innerHTML;
        
        document.body.innerHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Danh sách Đảng viên</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { text-align: center; color: #C62828; }
                    .print-header { text-align: center; margin-bottom: 20px; }
                    .print-info { text-align: right; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th { background: #f5f5f5; padding: 8px; border: 1px solid #ddd; }
                    td { padding: 6px; border: 1px solid #ddd; }
                    .text-center { text-align: center; }
                    .signature { margin-top: 50px; }
                    .signature div { width: 200px; float: right; text-align: center; }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>DANH SÁCH ĐẢNG VIÊN</h1>
                    <p>Hệ thống Quản lý Công tác Đảng</p>
                </div>
                
                <div class="print-info">
                    <p>Ngày in: ${Utils.formatDate(new Date(), 'DD/MM/YYYY HH:mm')}</p>
                    <p>Tổng số: ${this.membersData.length} đảng viên</p>
                </div>
                
                ${printContent}
                
                <div class="signature">
                    <div>
                        <p>Người lập danh sách</p>
                        <br><br><br>
                        <p><strong>${apiService.getCurrentUser()?.fullName || 'Quản trị viên'}</strong></p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload(); // Reload để khôi phục event listeners
    }
    
    static async refreshMembers() {
        await this.loadMembers();
        showToast('Đã làm mới danh sách đảng viên', 'success');
    }
    
    static updatePageSize(size) {
        this.pageSize = parseInt(size);
        this.currentPage = 1;
        this.loadMembers();
    }
}

// Khởi tạo khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    if (authService.api.getCurrentUser()) {
        MembersManager.init();
    }
});

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MembersManager;
}