const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    name: { type: String, required: true },
    number: { type: Number, required: true },
    childrenName: { type: String, required: true },
    comment: { type: String, required: true },
    rate: { type: Number, required: true, min: 1, max: 5 },
    exp: { type: String, required: true },
    createdAt: { 
        type: String, 
        default: () => new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }) 
    }, // Stores date & time
    ipAddress: { type: String, required: true } // Stores IP address
});

module.exports = mongoose.model("Review", reviewSchema);
