const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    gender: { type: String, enum: ['Nam', 'Nữ'], default: 'Nam' },
    dob: { type: Date },
    chinhquyen: { type: String },
    dang: { type: String },
    congdoan: { type: String },
    doan: { type: String },
    branch: { type: String, required: true },
    partyDate: { type: Date },
    photo: { type: String }, // URL hoặc base64
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Member', memberSchema);
