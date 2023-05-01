'use strict';

const EmployeeModel = require('./models/employee');

const mongoose = require('mongoose');

const Data = {};

Data.addItem = async(req, res, next)=>{
    //console.log(req.body);
    try{
        const data = req.body;
        const item = new EmployeeModel(data);
        await item.save();
        res.status(200).json(item);
    }catch(e){
        next(e)
    }
}

Data.getAllItems = async(req,res, next) => {
    try{
        const items = await EmployeeModel.find({});
        res.status(200).json(items);
    }catch(e){
        next(e);
    }
}

Data.getOneItem = async(req,res,next)=>{
    try{
        const id = req.params.id;
        const items = await EmployeeModel.find({_id:id});
        res.status(200).json(items[0]);
    }catch(e){
        next(e);
    }

}

Data.delete = async(req,res,next) =>{
    try{
        let id = req.params.id;
        await EmployeeModel.findByIdAndDelete(id);
        res.status(200).send('Item Deleted');
    }catch(e){
        next(e)
    }
}

module.exports = Data;