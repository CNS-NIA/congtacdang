class DocumentsManager {
    static currentPage = 1;
    static pageSize = 20;
    static currentFilters = {};
    
    static async init() {
        this.initEventListeners();
        await this.loadDocuments();
        this.initDocumentTypes();
    }
    
    static initEventListeners() {
        // Event listeners cho các nút thêm, tìm kiếm, lọc
        document.getElementById('addDocumentBtn')?.addEventListener('click', () => this.showAddForm());
        
        // Tìm kiếm văn bản
        const searchInput = document.getElementById('searchDocument');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.currentFilters.search = e.target.value;
                this.currentPage = 1;
                this.loadDocuments();
            }, 500));
        }
    }
    
    static initDocumentTypes() {
        // Khởi tạo loại văn bản
        this.documentTypes = [
            'Quyết định', 'Thông báo', 'Nghị quyết', 'Báo cáo', 
            'Kế hoạch', 'Công văn', 'Chỉ thị', 'Thông tri'
        ];
        
        this.documentStatuses = [
            { id: 'draft', name: 'Nháp', color: '#9E9E9E' },
            { id: 'pending', name: 'Chờ duyệt', color: '#FF9800' },
            { id: 'approved', name: 'Đã duyệt', color: '#4CAF50' },
            { id: 'rejected', name: 'Từ chối', color: '#F44336' },
            { id: 'archived', name: 'Lưu trữ', color: '#607D8B' }
        ];
    }
    
    static async loadDocuments() {
        try {
            const result = await apiService.getDocuments(
                this.currentPage, 
                this.pageSize, 
                this.currentFilters
            );
            
            this.renderDocumentsTable(result.data);
            this.renderPagination(result.pagination);
            
        } catch (error) {
            console.error('Lỗi tải văn bản:', error);
            showToast('Lỗi tải danh sách văn bản', 'error');
        }
    }
    
    static renderDocumentsTable(documents) {
        const container = document.getElementById('documentsTableBody');
        if (!container) return;
        
        if (documents.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i class="fas fa-file-alt"></i>
                        <p>Chưa có văn bản nào</p>
                        <button class="btn btn-primary btn-sm mt-2" onclick="DocumentsManager.showAddForm()">
                            <i class="fas fa-plus"></i> Thêm văn bản đầu tiên
                        </button>
                    </td>
                </tr>
            `;
            return;
        }
        
        let html = '';
        documents.forEach((doc, index) => {
            const stt = (this.currentPage - 1) * this.pageSize + index + 1;
            const status = this.documentStatuses.find(s => s.id === doc.trangThai);
            
            html += `
                <tr data-id="${doc.id}">
                    <td>${stt}</td>
                    <td>
                        <strong>${doc.soHieu}</strong>
                        <div class="text-muted">${doc.loaiVanBan}</div>
                    </td>
                    <td>
                        <div class="document-title">${doc.tenVanBan}</div>
                        <div class="text-muted small">${doc.trichYeu?.substring(0, 100)}...</div>
                    </td>
                    <td>${Utils.formatDate(doc.ngayBanHanh)}</td>
                    <td>${doc.nguoiKy}</td>
                    <td>
                        <span class="status-badge" style="background: ${status?.color}20; color: ${status?.color};">
                            ${status?.name || doc.trangThai}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-primary btn-sm" onclick="DocumentsManager.viewDocument('${doc.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-action btn-secondary btn-sm" onclick="DocumentsManager.editDocument('${doc.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            ${doc.fileDinhKem ? `
                            <a href="#" class="btn-action btn-info btn-sm" onclick="DocumentsManager.downloadFile('${doc.id}')">
                                <i class="fas fa-download"></i>
                            </a>
                            ` : ''}
                            <button class="btn-action btn-danger btn-sm" onclick="DocumentsManager.deleteDocument('${doc.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        container.innerHTML = html;
    }
    
    static async showAddForm() {
        const formHtml = `
            <div class="document-form-container">
                <form id="documentForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Loại văn bản *</label>
                            <select id="docType" class="form-control" required>
                                <option value="">Chọn loại văn bản</option>
                                ${this.documentTypes.map(type => 
                                    `<option value="${type}">${type}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Số hiệu *</label>
                            <input type="text" id="docNumber" class="form-control" required 
                                   placeholder="VD: QD-2024/01">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Tên văn bản *</label>
                        <input type="text" id="docTitle" class="form-control" required>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Ngày ban hành *</label>
                            <input type="date" id="docDate" class="form-control" required 
                                   value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        <div class="form-group">
                            <label>Người ký *</label>
                            <input type="text" id="docSigner" class="form-control" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Trích yếu</label>
                        <textarea id="docSummary" class="form-control" rows="3"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>File đính kèm</label>
                        <input type="file" id="docFile" class="form-control" 
                               accept=".pdf,.doc,.docx,.xls,.xlsx">
                        <small class="text-muted">Hỗ trợ PDF, Word, Excel (tối đa 10MB)</small>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Chi bộ</label>
                            <select id="docBranch" class="form-control">
                                <option value="">Tất cả chi bộ</option>
                                ${AppConfig.BRANCHES.map(b => 
                                    `<option value="${b.id}">${b.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Trạng thái</label>
                            <select id="docStatus" class="form-control">
                                ${this.documentStatuses.map(s => 
                                    `<option value="${s.id}">${s.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="ModalManager.closeCustomModal()">
                            Hủy
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Lưu văn bản
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        ModalManager.showCustomModal('Thêm văn bản mới', formHtml, 'modal-lg', () => {
            const form = document.getElementById('documentForm');
            form.addEventListener('submit', (e) => this.handleSubmitDocument(e));
        });
    }
    
    static async handleSubmitDocument(e) {
        e.preventDefault();
        
        const formData = {
            loaiVanBan: document.getElementById('docType').value,
            soHieu: document.getElementById('docNumber').value,
            tenVanBan: document.getElementById('docTitle').value,
            ngayBanHanh: document.getElementById('docDate').value,
            nguoiKy: document.getElementById('docSigner').value,
            trichYeu: document.getElementById('docSummary').value,
            chiBo: document.getElementById('docBranch').value || null,
            trangThai: document.getElementById('docStatus').value
        };
        
        try {
            // Xử lý file upload
            const fileInput = document.getElementById('docFile');
            if (fileInput.files[0]) {
                // Trong thực tế sẽ upload file lên server
                // Ở đây chỉ lưu tên file
                formData.fileDinhKem = fileInput.files[0].name;
                formData.fileSize = fileInput.files[0].size;
            }
            
            await apiService.createDocument(formData);
            showToast('Thêm văn bản thành công', 'success');
            ModalManager.closeCustomModal();
            await this.loadDocuments();
            
        } catch (error) {
            showToast('Lỗi thêm văn bản', 'error');
            console.error(error);
        }
    }
    
    static async viewDocument(id) {
        try {
            const docs = await apiService.getDocuments(1, 1, {});
            const doc = docs.data.find(d => d.id === id);
            
            if (!doc) {
                showToast('Không tìm thấy văn bản', 'warning');
                return;
            }
            
            const status = this.documentStatuses.find(s => s.id === doc.trangThai);
            
            const detailHtml = `
                <div class="document-detail">
                    <div class="document-header">
                        <div class="document-meta">
                            <span class="doc-type">${doc.loaiVanBan}</span>
                            <span class="doc-status" style="background: ${status?.color}20; color: ${status?.color}">
                                ${status?.name}
                            </span>
                        </div>
                        <h3>${doc.tenVanBan}</h3>
                        <div class="doc-number">${doc.soHieu}</div>
                    </div>
                    
                    <div class="document-info">
                        <div class="info-row">
                            <span class="info-label"><i class="fas fa-calendar"></i> Ngày ban hành:</span>
                            <span class="info-value">${Utils.formatDate(doc.ngayBanHanh)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label"><i class="fas fa-user-check"></i> Người ký:</span>
                            <span class="info-value">${doc.nguoiKy}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label"><i class="fas fa-building"></i> Nơi ban hành:</span>
                            <span class="info-value">${doc.noiBanHanh || 'Đảng ủy'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label"><i class="fas fa-sitemap"></i> Chi bộ:</span>
                            <span class="info-value">${doc.chiBo ? Utils.getBranchName(doc.chiBo) : 'Tất cả'}</span>
                        </div>
                    </div>
                    
                    <div class="document-summary">
                        <h4><i class="fas fa-align-left"></i> Trích yếu</h4>
                        <p>${doc.trichYeu || 'Không có trích yếu'}</p>
                    </div>
                    
                    ${doc.fileDinhKem ? `
                    <div class="document-attachment">
                        <h4><i class="fas fa-paperclip"></i> File đính kèm</h4>
                        <div class="attachment-file">
                            <i class="fas fa-file-pdf" style="color: #F44336;"></i>
                            <div>
                                <strong>${doc.fileDinhKem}</strong>
                                <small>PDF • ${Math.round(doc.fileSize / 1024) || 0} KB</small>
                            </div>
                            <button class="btn btn-primary btn-sm" onclick="DocumentsManager.downloadFile('${doc.id}')">
                                <i class="fas fa-download"></i> Tải xuống
                            </button>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="document-meta-footer">
                        <div class="meta-item">
                            <i class="fas fa-user"></i>
                            <span>Người tạo: ${doc.createdBy}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-clock"></i>
                            <span>Ngày tạo: ${Utils.formatDate(doc.createdAt, 'DD/MM/YYYY HH:mm')}</span>
                        </div>
                    </div>
                </div>
            `;
            
            ModalManager.showCustomModal('Chi tiết văn bản', detailHtml, 'modal-lg');
            
        } catch (error) {
            console.error('Lỗi xem văn bản:', error);
            showToast('Lỗi tải thông tin văn bản', 'error');
        }
    }
    
    static downloadFile(docId) {
        showToast('Tính năng download sẽ được triển khai với backend', 'info');
    }
    
    static async deleteDocument(id) {
        ModalManager.showConfirm(
            'Xác nhận xóa văn bản',
            'Bạn có chắc chắn muốn xóa văn bản này?',
            async () => {
                try {
                    // API delete sẽ được triển khai sau
                    showToast('Đã xóa văn bản', 'success');
                    await this.loadDocuments();
                } catch (error) {
                    showToast('Lỗi xóa văn bản', 'error');
                }
            }
        );
    }
}