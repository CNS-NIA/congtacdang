// ======================
// CONSTANTS AND CONFIG
// ======================

// Hệ thống cấp bậc chức vụ
const POSITION_RANKS = {
    // LÃNH ĐẠO CẤP CAO
    'Bí thư Đảng ủy': 100,
    'Giám đốc': 99,
    'Phó Bí thư Đảng ủy': 98,
    'Phó Giám đốc': 97,
    'Đảng ủy viên': 96,
    
    // TRƯỞNG PHÒNG/BAN/ĐỘI
    'Trưởng phòng': 90,
    'Bí thư Chi bộ': 89,
    'Phó Trưởng phòng': 88,
    'Phó Bí thư Chi bộ': 87,
    'Đội trưởng': 86,
    'Chi ủy viên': 85,
    
    // CẤP PHÓ/TỔ TRƯỞNG
    'Phó Đội trưởng kiêm Tổ trưởng': 80,
    'Tổ trưởng': 78,
    'Tổ phó': 76,
    
    // CHỨC DANH CHUYÊN MÔN
    'Chuyên viên': 70,
    'Kỹ sư': 68,
    'Kỹ thuật viên': 66,
    
    // NHÂN VIÊN
    'Nhân viên': 60,
    
    // LAO ĐỘNG
    'Lao động phổ thông': 50,
    
    // HỢP ĐỒNG
    'Hợp đồng không xác định thời hạn': 40,
    'Hợp đồng thời vụ': 35,
    'Thử việc': 30,
    
    // CÔNG ĐOÀN
    'Chủ tịch Công đoàn': 85,
    'Phó Chủ tịch Công đoàn': 80,
    'Ủy viên Công đoàn': 75,
    'Tổ trưởng Công đoàn': 70,
    'Đoàn viên Công đoàn': 65,
    
    // ĐOÀN THANH NIÊN
    'Bí thư Đoàn thanh niên': 80,
    'Phó Bí thư Đoàn thanh niên': 75,
    'Đoàn viên': 70,
    
    // ĐẢNG VIÊN THÔNG THƯỜNG
    'Đảng viên': 60,
    
    // Mặc định
    '': 0,
    '---': 0
};

// Thứ tự sắp xếp chi bộ
const BRANCH_ORDER = {
    'VP': 1,  // Văn phòng Trung tâm
    'BT': 2,  // Đội Bảo trì Sân đường
    'MT': 3,  // Đội Môi trường Khu bay
    'CD': 4,  // Đội Thiết bị Cơ, Điện, Đèn
    'TT': 5   // Đội Thông tin Dẫn đường
};

// Tên chi bộ
const BRANCH_NAMES = {
    'VP': 'Văn phòng Trung tâm',
    'BT': 'Đội Bảo trì Sân đường',
    'MT': 'Đội Môi trường Khu bay',
    'CD': 'Đội Thiết bị Cơ, Điện, Đèn Sân bay',
    'TT': 'Đội Thiết bị Thông tin Dẫn đường'
};

// Biểu tượng chi bộ
const BRANCH_ICONS = {
    'VP': 'fa-building',
    'BT': 'fa-road',
    'MT': 'fa-leaf',
    'CD': 'fa-bolt',
    'TT': 'fa-satellite-dish'
};

// Màu sắc chi bộ
const BRANCH_COLORS = {
    'VP': '#8B0000',
    'BT': '#006400',
    'MT': '#008B8B',
    'CD': '#8B4513',
    'TT': '#4B0082'
};

// Dữ liệu mẫu đảng viên
const SAMPLE_MEMBERS = [
    { id: 1, branch: 'VP', fullName: 'Vũ Nam Thắng', dob: '31.08.73', gender: 'Nam', ethnicity: 'Kinh', 
      position: 'Giám đốc', partyJoinDate: '13.07.2004', joinYear: 2004, photo: null },
    
    { id: 2, branch: 'VP', fullName: 'Hồ Xuân Hoà', dob: '29.05.67', gender: 'Nam', ethnicity: 'Kinh', 
      position: 'Phó Giám đốc', partyJoinDate: '11.08.1997', joinYear: 1997, photo: null },
    
    { id: 3, branch: 'VP', fullName: 'Vũ Kỳ Phượng', dob: '29.10.1971', gender: 'Nữ', ethnicity: 'Kinh', 
      position: 'Trưởng phòng Tổ chức', partyJoinDate: '09.10.2002', joinYear: 2002, photo: null },
    
    { id: 4, branch: 'VP', fullName: 'Nguyễn Hồng Phú', dob: '24.11.67', gender: 'Nam', ethnicity: 'Kinh', 
      position: 'Chuyên viên', partyJoinDate: '03.02.2000', joinYear: 2000, photo: null },
    
    { id: 5, branch: 'BT', fullName: 'Nguyễn Tiến Dũng', dob: '15.05.1976', gender: 'Nam', ethnicity: 'Kinh', 
      position: 'Đội trưởng', partyJoinDate: '31.12.2008', joinYear: 2008, photo: null },
    
    { id: 6, branch: 'BT', fullName: 'Nguyễn Đức Thành', dob: '14.09.1981', gender: 'Nam', ethnicity: 'Kinh', 
      position: 'Kỹ sư', partyJoinDate: '07.11.2014', joinYear: 2014, photo: null },
    
    { id: 7, branch: 'MT', fullName: 'Nguyễn Mai Phong', dob: '05.05.1964', gender: 'Nam', ethnicity: 'Kinh', 
      position: 'Bí thư Chi bộ', partyJoinDate: '11.7.1985', joinYear: 1985, photo: null },
    
    { id: 8, branch: 'CD', fullName: 'Nguyễn Trung Dũng', dob: '16.09.68', gender: 'Nam', ethnicity: 'Kinh', 
      position: 'Phó Đội trưởng kiêm Tổ trưởng', partyJoinDate: '15.05.1988', joinYear: 1988, photo: null },
    
    { id: 9, branch: 'TT', fullName: 'Trần Đỗ Hải', dob: '27.12.1971', gender: 'Nam', ethnicity: 'Kinh', 
      position: 'Đội trưởng', partyJoinDate: '27.10.2004', joinYear: 2004, photo: null },
    
    { id: 10, branch: 'TT', fullName: 'Nguyễn Tuấn Anh', dob: '23.09.72', gender: 'Nam', ethnicity: 'Kinh', 
      position: 'Tổ trưởng', partyJoinDate: '03.02.2004', joinYear: 2004, photo: null },
    
    { id: 11, branch: 'VP', fullName: 'Lê Văn Cường', dob: '12.03.1980', gender: 'Nam', ethnicity: 'Kinh', 
      position: 'Nhân viên', partyJoinDate: '15.06.2010', joinYear: 2010, photo: null },
    
    { id: 12, branch: 'BT', fullName: 'Phạm Thị Hằng', dob: '20.11.1985', gender: 'Nữ', ethnicity: 'Kinh', 
      position: 'Kỹ thuật viên', partyJoinDate: '10.09.2015', joinYear: 2015, photo: null },
    
    { id: 13, branch: 'VP', fullName: 'Trần Văn Bí thư', dob: '15.03.1975', gender: 'Nam', ethnicity: 'Kinh', 
      position: 'Bí thư Đảng ủy', partyJoinDate: '20.05.2000', joinYear: 2000, photo: null },
    
    { id: 14, branch: 'MT', fullName: 'Nguyễn Thị Hồng', dob: '22.07.1982', gender: 'Nữ', ethnicity: 'Kinh', 
      position: 'Chủ tịch Công đoàn', partyJoinDate: '18.11.2012', joinYear: 2012, photo: null },
    
    { id: 15, branch: 'CD', fullName: 'Phạm Văn Đoàn', dob: '10.04.1990', gender: 'Nam', ethnicity: 'Kinh', 
      position: 'Bí thư Đoàn thanh niên', partyJoinDate: '25.12.2018', joinYear: 2018, photo: null }
];

// Tài khoản người dùng (CHỈ DÙNG CHO DEMO - Production cần backend)
const USER_ACCOUNTS = {
    'admin': { 
        password: 'admin123', 
        role: 'admin', 
        name: 'Nguyễn Văn Admin', 
        branch: 'all',
        permissions: {
            viewAllBranches: true,
            editAllBranches: true,
            viewAllDocuments: true,
            editAllDocuments: true,
            viewPublicDocuments: true,
            editPublicDocuments: true
        }
    },
    'bithu_VP': { 
        password: 'bithu123', 
        role: 'bithu', 
        name: 'Trần Văn Bí thư VP', 
        branch: 'VP',
        permissions: {
            viewAllBranches: false,
            editAllBranches: false,
            viewAllDocuments: false,
            editAllDocuments: false,
            viewPublicDocuments: true,
            editPublicDocuments: false,
            viewOwnBranch: true,
            editOwnBranch: true,
            viewOwnBranchDocuments: true,
            editOwnBranchDocuments: true
        }
    },
    'bithu_BT': { 
        password: 'bithu123', 
        role: 'bithu', 
        name: 'Lê Thị Bí thư BT', 
        branch: 'BT',
        permissions: {
            viewAllBranches: false,
            editAllBranches: false,
            viewAllDocuments: false,
            editAllDocuments: false,
            viewPublicDocuments: true,
            editPublicDocuments: false,
            viewOwnBranch: true,
            editOwnBranch: true,
            viewOwnBranchDocuments: true,
            editOwnBranchDocuments: true
        }
    },
    'bithu_TT': { 
        password: 'bithu123', 
        role: 'bithu', 
        name: 'Nguyễn Thị Bí thư TT', 
        branch: 'TT',
        permissions: {
            viewAllBranches: false,
            editAllBranches: false,
            viewAllDocuments: false,
            editAllDocuments: false,
            viewPublicDocuments: true,
            editPublicDocuments: false,
            viewOwnBranch: true,
            editOwnBranch: true,
            viewOwnBranchDocuments: true,
            editOwnBranchDocuments: true
        }
    },
    'guest': { 
        password: 'guest123', 
        role: 'guest', 
        name: 'Khách Tham Quan', 
        branch: 'all',
        permissions: {
            viewAllBranches: false,
            editAllBranches: false,
            viewAllDocuments: false,
            editAllDocuments: false,
            viewPublicDocuments: true,
            editPublicDocuments: false,
            viewOwnBranch: false,
            editOwnBranch: false
        }
    }
};

// Cấu hình phân trang
const ITEMS_PER_PAGE = 10;

// Biến toàn cục sẽ được định nghĩa trong app.js
let currentUser = null;
let membersData = [];
let currentEditId = null;
let currentBranch = 'all';
let currentPage = 1;
let filteredData = [];
let currentPhotoData = null;