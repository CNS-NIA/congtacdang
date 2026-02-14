class MeetingsManager {
    static currentPage = 1;
    static pageSize = 20;
    static currentFilters = {};
    
    static async init() {
        this.initEventListeners();
        this.initMeetingTypes();
        await this.loadMeetings();
        this.initCalendar();
    }
    
    static initEventListeners() {
        // Toggle view (list/calendar)
        document.getElementById('toggleViewBtn')?.addEventListener('click', () => this.toggleView());
        
        // Thêm cuộc họp
        document.getElementById('addMeetingBtn')?.addEventListener('click', () => this.showAddForm());
    }
    
    static initMeetingTypes() {
        this.meetingTypes = [
            'Sinh hoạt chi bộ', 'Họp Đảng ủy', 'Hội nghị', 
            'Tọa đàm', 'Gặp mặt', 'Họp chuyên đề'
        ];
        
        this.meetingStatuses = [
            { id: 'planned', name: 'Đã lên kế hoạch', color: '#2196F3' },
            { id: 'ongoing', name: 'Đang diễn ra', color: '#FF9800' },
            { id: 'completed', name: 'Đã kết thúc', color: '#4CAF50' },
            { id: 'cancelled', name: 'Đã hủy', color: '#F44336' }
        ];
    }
    
    static async loadMeetings() {
        try {
            const result = await apiService.getMeetings(
                this.currentPage, 
                this.pageSize, 
                this.currentFilters
            );
            
            this.renderMeetingsTable(result.data);
            this.renderPagination(result.pagination);
            this.updateCalendarEvents(result.data);
            
        } catch (error) {
            console.error('Lỗi tải cuộc họp:', error);
            showToast('Lỗi tải danh sách cuộc họp', 'error');
        }
    }
    
    static renderMeetingsTable(meetings) {
        const container = document.getElementById('meetingsTableBody');
        if (!container) return;
        
        if (meetings.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <i class="fas fa-calendar-times"></i>
                        <p>Chưa có cuộc họp nào</p>
                        <button class="btn btn-primary btn-sm mt-2" onclick="MeetingsManager.showAddForm()">
                            <i class="fas fa-plus"></i> Thêm cuộc họp đầu tiên
                        </button>
                    </td>
                </tr>
            `;
            return;
        }
        
        let html = '';
        meetings.forEach((meeting, index) => {
            const stt = (this.currentPage - 1) * this.pageSize + index + 1;
            const status = this.meetingStatuses.find(s => s.id === meeting.trangThai);
            const meetingDate = new Date(meeting.thoiGian);
            const timeStr = Utils.formatDate(meetingDate, 'DD/MM/YYYY HH:mm');
            
            html += `
                <tr data-id="${meeting.id}">
                    <td>${stt}</td>
                    <td>
                        <strong>${meeting.tenCuocHop}</strong>
                        <div class="text-muted">${meeting.loaiCuocHop}</div>
                    </td>
                    <td>
                        <div>${timeStr}</div>
                        <small class="text-muted">${meeting.thoiLuong} phút</small>
                    </td>
                    <td>${meeting.diaDiem}</td>
                    <td>${meeting.chuTri}</td>
                    <td>
                        <span class="status-badge" style="background: ${status?.color}20; color: ${status?.color};">
                            ${status?.name}
                        </span>
                    </td>
                    <td>${meeting.chiBo ? Utils.getBranchName(meeting.chiBo) : 'Tất cả'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-primary btn-sm" onclick="MeetingsManager.viewMeeting('${meeting.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-action btn-secondary btn-sm" onclick="MeetingsManager.editMeeting('${meeting.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-action btn-danger btn-sm" onclick="MeetingsManager.deleteMeeting('${meeting.id}')">
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
            <div class="meeting-form-container">
                <form id="meetingForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Loại cuộc họp *</label>
                            <select id="meetingType" class="form-control" required>
                                <option value="">Chọn loại cuộc họp</option>
                                ${this.meetingTypes.map(type => 
                                    `<option value="${type}">${type}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Tên cuộc họp *</label>
                            <input type="text" id="meetingTitle" class="form-control" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Thời gian *</label>
                            <input type="datetime-local" id="meetingTime" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label>Thời lượng (phút) *</label>
                            <input type="number" id="meetingDuration" class="form-control" 
                                   required min="30" max="480" value="60">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Địa điểm *</label>
                            <input type="text" id="meetingLocation" class="form-control" required 
                                   placeholder="Phòng họp...">
                        </div>
                        <div class="form-group">
                            <label>Trạng thái</label>
                            <select id="meetingStatus" class="form-control">
                                ${this.meetingStatuses.map(s => 
                                    `<option value="${s.id}">${s.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Chủ trì *</label>
                            <input type="text" id="meetingChair" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label>Thư ký</label>
                            <input type="text" id="meetingSecretary" class="form-control">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Thành phần tham dự</label>
                        <div id="participantsList" class="participants-container">
                            <div class="participant-input">
                                <input type="text" class="form-control" placeholder="Tên thành viên">
                                <button type="button" class="btn btn-sm btn-secondary" onclick="this.parentElement.remove()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                        <button type="button" class="btn btn-sm btn-secondary mt-2" onclick="MeetingsManager.addParticipant()">
                            <i class="fas fa-plus"></i> Thêm thành viên
                        </button>
                    </div>
                    
                    <div class="form-group">
                        <label>Nội dung chính</label>
                        <textarea id="meetingContent" class="form-control" rows="4"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Chi bộ</label>
                        <select id="meetingBranch" class="form-control">
                            <option value="">Tất cả chi bộ</option>
                            ${AppConfig.BRANCHES.map(b => 
                                `<option value="${b.id}">${b.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="ModalManager.closeCustomModal()">
                            Hủy
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Lưu cuộc họp
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        ModalManager.showCustomModal('Thêm cuộc họp mới', formHtml, 'modal-lg', () => {
            const form = document.getElementById('meetingForm');
            form.addEventListener('submit', (e) => this.handleSubmitMeeting(e));
            
            // Set default time to next hour
            const nextHour = new Date();
            nextHour.setHours(nextHour.getHours() + 1);
            nextHour.setMinutes(0);
            document.getElementById('meetingTime').value = 
                nextHour.toISOString().slice(0, 16);
        });
    }
    
    static addParticipant() {
        const container = document.getElementById('participantsList');
        if (!container) return;
        
        const div = document.createElement('div');
        div.className = 'participant-input';
        div.innerHTML = `
            <input type="text" class="form-control" placeholder="Tên thành viên">
            <button type="button" class="btn btn-sm btn-secondary" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(div);
    }
    
    static async handleSubmitMeeting(e) {
        e.preventDefault();
        
        const participants = [];
        document.querySelectorAll('.participant-input input').forEach(input => {
            if (input.value.trim()) participants.push(input.value.trim());
        });
        
        const meetingData = {
            tenCuocHop: document.getElementById('meetingTitle').value,
            loaiCuocHop: document.getElementById('meetingType').value,
            thoiGian: document.getElementById('meetingTime').value,
            thoiLuong: parseInt(document.getElementById('meetingDuration').value),
            diaDiem: document.getElementById('meetingLocation').value,
            chuTri: document.getElementById('meetingChair').value,
            thuKy: document.getElementById('meetingSecretary').value,
            thanhPhan: participants,
            noiDung: document.getElementById('meetingContent').value,
            chiBo: document.getElementById('meetingBranch').value || null,
            trangThai: document.getElementById('meetingStatus').value
        };
        
        try {
            await apiService.createMeeting(meetingData);
            showToast('Thêm cuộc họp thành công', 'success');
            ModalManager.closeCustomModal();
            await this.loadMeetings();
            
        } catch (error) {
            showToast('Lỗi thêm cuộc họp', 'error');
            console.error(error);
        }
    }
    
    static initCalendar() {
        // Khởi tạo calendar view sử dụng FullCalendar hoặc custom
        const calendarEl = document.getElementById('meetingsCalendar');
        if (!calendarEl) return;
        
        // Đơn giản hóa: hiển thị lịch cơ bản
        calendarEl.innerHTML = `
            <div class="calendar-header">
                <button class="btn btn-sm btn-secondary" onclick="MeetingsManager.prevMonth()">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <h4 id="currentMonth">Tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}</h4>
                <button class="btn btn-sm btn-secondary" onclick="MeetingsManager.nextMonth()">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            <div class="calendar-grid" id="calendarGrid"></div>
        `;
        
        this.renderCalendar();
    }
    
    static renderCalendar() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        
        document.getElementById('currentMonth').textContent = 
            `Tháng ${month + 1}/${year}`;
        
        // Lấy ngày đầu tiên và cuối cùng của tháng
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        // Tạo lịch
        let calendarHTML = '<div class="calendar-weekdays">';
        ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].forEach(day => {
            calendarHTML += `<div class="calendar-weekday">${day}</div>`;
        });
        calendarHTML += '</div><div class="calendar-days">';
        
        // Ngày rỗng đầu tiên
        const startDay = firstDay.getDay();
        for (let i = 0; i < startDay; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }
        
        // Các ngày trong tháng
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const hasMeetings = this.hasMeetingsOnDate(dateStr);
            
            calendarHTML += `
                <div class="calendar-day ${day === now.getDate() ? 'today' : ''} ${hasMeetings ? 'has-meetings' : ''}"
                     onclick="MeetingsManager.showDayMeetings('${dateStr}')">
                    <div class="day-number">${day}</div>
                    ${hasMeetings ? '<div class="meeting-dot"></div>' : ''}
                </div>
            `;
        }
        
        calendarHTML += '</div>';
        document.getElementById('calendarGrid').innerHTML = calendarHTML;
    }
    
    static hasMeetingsOnDate(dateStr) {
        // Kiểm tra xem có cuộc họp nào trong ngày này không
        // Thực tế sẽ query từ API
        return false;
    }
    
    static toggleView() {
        const listView = document.getElementById('meetingsListView');
        const calendarView = document.getElementById('meetingsCalendar');
        
        if (listView.style.display !== 'none') {
            listView.style.display = 'none';
            calendarView.style.display = 'block';
        } else {
            listView.style.display = 'block';
            calendarView.style.display = 'none';
        }
    }
}