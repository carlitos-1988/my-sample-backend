'use strict';

//Imports
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const mongoose = require('mongoose');
//bring in employee model to this page to be used
const Employee = require('./models/employee')


const app = express();
app.use(cors());
//important will not get .body in response without this
app.use(express.json());


//NOTE: Connect server to DB
mongoose.connect(process.env.DB_URL);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Mongoose is connected');
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Good listening on PORT: ${PORT}`));

app.get('/test', (request, response) => {
  response.send('test request received')
})

app.get('/', (req, res)=>{
    res.send('The server is working');
})

app.post('/postemployee',postEmployee)

async function postEmployee(request, response, next){

    //console.log(request);
    try{
        let employeeData = request.body;
        let createdEmployee = await Employee.create(employeeData);

        response.status(200).send(createdEmployee);

    }catch(e){
        next(e);
        //console.log(e);
    }
}










app.get('*', (request, response) => {
    response.status(404).send('Not available');
  });
  
  // ERROR
  app.use((error, request, response, next) => {
    console.log(error.message);
    response.status(500).send(error. message) ;
  });