'use strict';

//Imports
require('dotenv').config();
const express = require('express');
const cors = require('cors');
// local database
const mongoose = require('mongoose');
//bring in employee model to this page to be used
const Employee = require('./models/employee')
// email API
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


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





app.get('/test', sendEmail)

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

//testing email API
function sendEmail(req,res,next){
    const msg = {
        to: 'doubleparked88@gmail.com', // Change to your recipient
        from: 'juan.c.olmedo@icloud.com', // Change to your verified sender
        subject: 'Sending with SendGrid is Fun',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
      }
    
      sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent')
      })
      .catch((error) => {
        console.error(error)
      })
}








app.get('*', (request, response) => {
    response.status(404).send('Not available');
  });
  
  // ERROR
  app.use((error, request, response, next) => {
    console.log(error.message);
    response.status(500).send(error. message) ;
  });