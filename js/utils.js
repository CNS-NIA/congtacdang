// Utility functions
class Utils {
    // Format date
    static formatDate(date, format = 'DD/MM/YYYY') {
        if (!date) return '';
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        
        switch(format) {
            case 'DD/MM/YYYY':
                return `${day}/${month}/${year}`;
            case 'YYYY-MM-DD':
                return `${year}-${month}-${day}`;
            case 'DD/MM/YY':
                return `${day}/${month}/${year.toString().slice(-2)}`;
            default:
                return `${day}/${month}/${year}`;
        }
    }
    
    // Parse date từ string
    static parseDate(dateStr) {
        if (!dateStr) return null;
        // Format: DD/MM/YYYY hoặc YYYY-MM-DD
        if (dateStr.includes('/')) {
            const [day, month, year] = dateStr.split('/');
            return new Date(year, month - 1, day);
        } else if (dateStr.includes('-')) {
            return new Date(dateStr);
        }
        return new Date(dateStr);
    }
    
    // Tính tuổi từ ngày sinh
    static calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }
    
    // Tính thâm niên đảng
    static calculatePartySeniority(joinDate) {
        const today = new Date();
        const join = new Date(joinDate);
        let years = today.getFullYear() - join.getFullYear();
        let months = today.getMonth() - join.getMonth();
        
        if (months < 0) {
            years--;
            months += 12;
        }
        
        return { years, months };
    }
    
    // Format số điện thoại
    static formatPhoneNumber(phone) {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
        } else if (cleaned.length === 11) {
            return cleaned.replace(/(\d{4})(\d{4})(\d{3})/, '$1 $2 $3');
        }
        return phone;
    }
    
    // Validate email
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Validate phone
    static validatePhone(phone) {
        const re = /^[0-9]{10,11}$/;
        return re.test(phone.replace(/\D/g, ''));
    }
    
    // Generate ID
    static generateId(prefix = '') {
        return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
    
    // Deep clone object
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    
    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Throttle function
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
    
    // Upload file và đọc nội dung
    static readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }
    
    // Download file
    static downloadFile(content, fileName, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Export to CSV
    static exportToCSV(data, fileName) {
        if (!data || data.length === 0) {
            showToast('Không có dữ liệu để xuất', 'warning');
            return;
        }
        
        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const cell = row[header];
                const escaped = ('' + cell).replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(','))
        ];
        
        const csvString = csvRows.join('\n');
        this.downloadFile(csvString, `${fileName}.csv`, 'text/csv');
    }
    
    // Export to Excel (đơn giản)
    static exportToExcel(data, fileName, sheetName = 'Sheet1') {
        if (!data || data.length === 0) {
            showToast('Không có dữ liệu để xuất', 'warning');
            return;
        }
        
        // Tạo HTML table
        const headers = Object.keys(data[0]);
        let html = '<table>';
        
        // Header row
        html += '<tr>';
        headers.forEach(header => {
            html += `<th>${header}</th>`;
        });
        html += '</tr>';
        
        // Data rows
        data.forEach(row => {
            html += '<tr>';
            headers.forEach(header => {
                html += `<td>${row[header] || ''}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</table>';
        
        this.downloadFile(html, `${fileName}.xls`, 'application/vnd.ms-excel');
    }
    
    // Import từ Excel/CSV (đơn giản)
    static importFromFile(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('Không có file'));
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    const lines = content.split('\n');
                    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                    
                    const data = lines.slice(1)
                        .filter(line => line.trim())
                        .map(line => {
                            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
                            const row = {};
                            headers.forEach((header, index) => {
                                row[header] = values[index] || '';
                            });
                            return row;
                        });
                    
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = (e) => reject(e);
            
            if (file.name.endsWith('.csv')) {
                reader.readAsText(file);
            } else {
                reject(new Error('Chỉ hỗ trợ file CSV'));
            }
        });
    }
    
    // Format số với dấu phân cách
    static formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    
    // Lấy tên chi bộ từ ID
    static getBranchName(branchId) {
        const branch = AppConfig.BRANCHES.find(b => b.id === branchId);
        return branch ? branch.name : 'Không xác định';
    }
    
    // Lấy màu chi bộ
    static getBranchColor(branchId) {
        const branch = AppConfig.BRANCHES.find(b => b.id === branchId);
        return branch ? branch.color : '#666';
    }
    
    // Lấy tên trạng thái
    static getStatusName(statusId) {
        const status = AppConfig.MEMBER_STATUSES.find(s => s.id === statusId);
        return status ? status.name : 'Không xác định';
    }
    
    // Lấy màu trạng thái
    static getStatusColor(statusId) {
        const status = AppConfig.MEMBER_STATUSES.find(s => s.id === statusId);
        return status ? status.color : '#666';
    }
    
    // Tạo badge trạng thái
    static createStatusBadge(statusId) {
        const name = this.getStatusName(statusId);
        const color = this.getStatusColor(statusId);
        return `<span class="status-badge" style="background: ${color}20; color: ${color}; border-color: ${color};">${name}</span>`;
    }
    
    // Tạo avatar từ tên
    static createAvatar(name, size = 40) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Màu nền ngẫu nhiên
        const colors = ['#C62828', '#2E7D32', '#F57C00', '#0277BD', '#6A1B9A', '#4527A0', '#283593'];
        const color = colors[name.length % colors.length];
        
        // Vẽ nền
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, size, size);
        
        // Vẽ chữ
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${size/2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Lấy chữ cái đầu
        const initials = name.split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
        
        ctx.fillText(initials, size/2, size/2);
        
        return canvas.toDataURL();
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}