const mongoose = require('mongoose');

const { Schema } = mongoose;

const scheduleSchema = new Schema({
    employeeId: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    shiftType: { type: String, enum: ["morning", "afternoon", "evening"], required: true }
});

const Schedule = mongoose.models('schedule', scheduleSchema);

module.exports = Schedule;