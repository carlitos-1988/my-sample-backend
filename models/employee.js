'use strict';

const mongoose = require('mongoose');

const {Schema} = mongoose;

const employeeSchema = new Schema({
    firstName : {type: String, required: true},
    lastName : {type: String, required: true},
    employeeId: {type: Number, required: true},
    email:{type:String, required: true},
    level: {type: Number, required: true}
})


const Employee = mongoose.model('employee', employeeSchema);

module.exports = Employee;