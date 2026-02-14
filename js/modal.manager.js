class ModalManager {
    static currentModal = null;
    
    static showConfirm(title, content, onConfirm, onCancel = null) {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmContent').innerHTML = content;
        
        const modal = document.getElementById('confirmModal');
        const confirmBtn = document.getElementById('confirmActionBtn');
        
        // Set up confirm action
        confirmBtn.onclick = () => {
            this.closeConfirm();
            if (onConfirm) onConfirm();
        };
        
        // Show modal
        modal.classList.add('active');
        this.currentModal = modal;
    }
    
    static closeConfirm() {
        const modal = document.getElementById('confirmModal');
        modal.classList.remove('active');
        this.currentModal = null;
    }
    
    static showCustomModal(title, content, size = 'modal-md', onOpen = null) {
        // Tạo modal động nếu chưa có
        let modal = document.getElementById('customModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'customModal';
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content ${size}">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="btn-action btn-secondary close-modal" onclick="ModalManager.closeCustomModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body" id="customModalContent"></div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        // Cập nhật nội dung
        document.getElementById('customModalContent').innerHTML = content;
        document.querySelector('#customModal .modal-header h3').textContent = title;
        document.querySelector('#customModal .modal-content').className = `modal-content ${size}`;
        
        // Hiển thị modal
        modal.classList.add('active');
        this.currentModal = modal;
        
        // Gọi callback onOpen
        if (onOpen) onOpen();
    }
    
    static closeCustomModal() {
        const modal = document.getElementById('customModal');
        if (modal) {
            modal.classList.remove('active');
            this.currentModal = null;
        }
    }
    
    static closeAll() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
        this.currentModal = null;
    }
}

// Close modal khi click bên ngoài
document.addEventListener('click', (e) => {
    if (ModalManager.currentModal && 
        e.target.classList.contains('modal-overlay')) {
        ModalManager.closeAll();
    }
});

// Close modal với Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && ModalManager.currentModal) {
        ModalManager.closeAll();
    }
});