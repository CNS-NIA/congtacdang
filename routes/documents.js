const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads nếu chưa có
const uploadDir = 'uploads/documents/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình multer cho upload file văn bản
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|xls|xlsx|jpg|jpeg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype.split('/')[1]);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Không hỗ trợ định dạng file này'));
        }
    }
});

// Lấy tất cả văn bản
router.get('/', async (req, res) => {
    try {
        const { loai } = req.query;
        let query = {};
        if (loai) query.loai = loai;
        
        const documents = await Document.find(query).sort({ ngaybanhanh: -1 });
        res.json(documents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lấy văn bản theo ID
router.get('/:id', async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) return res.status(404).json({ error: 'Không tìm thấy' });
        res.json(document);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Thêm văn bản mới
router.post('/', upload.array('files', 10), async (req, res) => {
    try {
        const fileData = req.files ? req.files.map(file => ({
            name: file.originalname,
            size: file.size,
            type: path.extname(file.originalname).toLowerCase().substring(1),
            path: file.path,
            url: `/uploads/documents/${file.filename}`
        })) : [];

        const documentData = {
            ...req.body,
            files: fileData,
            ngaybanhanh: req.body.ngaybanhanh || Date.now()
        };

        const document = new Document(documentData);
        await document.save();
        res.status(201).json(document);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Cập nhật văn bản
router.put('/:id', upload.array('files', 10), async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) return res.status(404).json({ error: 'Không tìm thấy' });

        const updateData = { ...req.body };
        
        // Xử lý file mới
        if (req.files && req.files.length > 0) {
            const newFiles = req.files.map(file => ({
                name: file.originalname,
                size: file.size,
                type: path.extname(file.originalname).toLowerCase().substring(1),
                path: file.path,
                url: `/uploads/documents/${file.filename}`
            }));
            
            // Giữ lại files cũ nếu có
            const existingFiles = document.files || [];
            updateData.files = [...existingFiles, ...newFiles];
        }

        const updatedDoc = await Document.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        
        res.json(updatedDoc);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Xóa văn bản
router.delete('/:id', async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) return res.status(404).json({ error: 'Không tìm thấy' });

        // Xóa files vật lý
        if (document.files && document.files.length > 0) {
            document.files.forEach(file => {
                if (file.path && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }

        await Document.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xóa thành công' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Tải file
router.get('/download/:filename', (req, res) => {
    const filePath = path.join(__dirname, '../uploads/documents/', req.params.filename);
    res.download(filePath);
});

module.exports = router;
