const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    name: { type: String, required: true, default: "Not Given" },
    number: { type: Number, required: true, default: "0" },
    childrenName: { type: String, required: true, default: "Not Given" },
    comment: { type: String, required: true, default: "Not Given" },
    rate: { type: Number, required: true, min: 1, max: 5, default: "0" },
    exp: { type: String, required: true, default: "Not Given" },
    submitedAt: { 
        type: String, 
        default: () => new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }) 
    },
    ipAddress: { type: String, required: true }
});

module.exports = mongoose.model("Review", reviewSchema);
