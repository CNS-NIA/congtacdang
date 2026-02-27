const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const multer = require('multer');
const path = require('path');

// Cấu hình multer để upload ảnh
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/members/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'member-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh'));
        }
    }
});

// Lấy tất cả đảng viên
router.get('/', async (req, res) => {
    try {
        const members = await Member.find().sort({ createdAt: -1 });
        res.json(members);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lấy đảng viên theo ID
router.get('/:id', async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        if (!member) return res.status(404).json({ error: 'Không tìm thấy' });
        res.json(member);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Thêm đảng viên mới
router.post('/', upload.single('photo'), async (req, res) => {
    try {
        const memberData = {
            ...req.body,
            photo: req.file ? `/uploads/members/${req.file.filename}` : null
        };
        const member = new Member(memberData);
        await member.save();
        res.status(201).json(member);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Cập nhật đảng viên
router.put('/:id', upload.single('photo'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.photo = `/uploads/members/${req.file.filename}`;
        }
        const member = await Member.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true }
        );
        if (!member) return res.status(404).json({ error: 'Không tìm thấy' });
        res.json(member);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Xóa đảng viên
router.delete('/:id', async (req, res) => {
    try {
        const member = await Member.findByIdAndDelete(req.params.id);
        if (!member) return res.status(404).json({ error: 'Không tìm thấy' });
        res.json({ message: 'Đã xóa thành công' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
