const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    name: String,
    size: Number,
    type: String,
    path: String,
    url: String
});

const documentSchema = new mongoose.Schema({
    sohieu: { type: String, required: true, unique: true },
    tieude: { type: String, required: true },
    loai: { type: String, enum: ['dinhky', 'chuyende', 'quytrinh', 'luutru'], required: true },
    ngaybanhanh: { type: Date },
    nguoiky: { type: String },
    noidung: { type: String },
    noidungchitiet: { type: String },
    files: [fileSchema],
    trangthai: { type: String, enum: ['banhanh', 'chopheduyet', 'dangxuly', 'luutru'], default: 'banhanh' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', documentSchema);
