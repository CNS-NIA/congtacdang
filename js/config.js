// Cấu hình hệ thống
const AppConfig = {
    APP_NAME: "Hệ thống Quản lý Công tác Đảng",
    VERSION: "2.0.0",
    API_BASE_URL: "http://localhost:3000/api", // Nếu có backend thật
    USE_MOCK_API: true, // Sử dụng mock data
    DEFAULT_PAGE_SIZE: 20,
    DATE_FORMAT: "DD/MM/YYYY",
    SUPPORTED_LANGUAGES: ['vi', 'en'],
    THEMES: ['light', 'dark', 'blue'],
    
    // Cấu hình chi bộ
    BRANCHES: [
        { id: 'VP', name: 'Văn phòng Trung tâm', color: '#C62828' },
        { id: 'BT', name: 'Đội Bảo trì Sân đường', color: '#2E7D32' },
        { id: 'MT', name: 'Đội Môi trường Khu bay', color: '#F57C00' },
        { id: 'CD', name: 'Đội Thiết bị Cơ, Điện, Đèn', color: '#0277BD' },
        { id: 'TT', name: 'Đội Thiết bị Thông tin Dẫn đường', color: '#6A1B9A' }
    ],
    
    // Trạng thái đảng viên
    MEMBER_STATUSES: [
        { id: 'active', name: 'Đang sinh hoạt', color: '#4CAF50' },
        { id: 'retired', name: 'Đã nghỉ hưu', color: '#FF9800' },
        { id: 'transferred', name: 'Chuyển đi', color: '#2196F3' },
        { id: 'suspended', name: 'Tạm ngừng sinh hoạt', color: '#F44336' }
    ],
    
    // Chức vụ
    POSITIONS: [
        'Đảng viên', 'Bí thư', 'Phó bí thư', 'Ủy viên BCH', 'Chi ủy viên',
        'Tổ trưởng', 'Tổ phó', 'Đảng ủy viên'
    ],
    
    // Trình độ học vấn
    EDUCATION_LEVELS: [
        'THPT', 'Trung cấp', 'Cao đẳng', 'Đại học', 
        'Thạc sĩ', 'Tiến sĩ', 'Phó giáo sư', 'Giáo sư'
    ]
};

// Khởi tạo storage keys
const StorageKeys = {
    CURRENT_USER: 'dang_current_user',
    MEMBERS_DATA: 'dang_members_data',
    DOCUMENTS_DATA: 'dang_documents_data',
    MEETINGS_DATA: 'dang_meetings_data',
    USERS_DATA: 'dang_users_data',
    ACTIVITIES_DATA: 'dang_activities_data',
    SETTINGS: 'dang_app_settings'
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AppConfig, StorageKeys };
}