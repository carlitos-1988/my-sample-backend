"use strict";

const EmployeeModel = require("./models/employee");
const WorkScheduleModel = require("./models/workschedule");

const mongoose = require("mongoose");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const Data = {};
let cache = {};

Data.addItem = async (req, res, next) => {
  //console.log(req.body);
    try {
    const data = req.body;
    const item = new EmployeeModel(data);
    await item.save();
    res.status(200).json(item);
    } catch (e) {
    next(e);
    }
};

Data.getAllItems = async (req, res, next) => {
    try {
        const items = await EmployeeModel.find({});//email: req.user.email
        res.status(200).json(items);
    } catch (e) {
    next(e);
    }
};

Data.getOneItem = async (req, res, next) => {
    try {
    const id = req.params.id;
    const items = await EmployeeModel.find({ _id: id });
    res.status(200).json(items[0]);
    } catch (e) {
    next(e);
    }
};

Data.deleteEmployee = async (req, res, next) => {
    try {
        let dateTop = new Date(); 
        let yearTop = dateTop.getFullYear();
        let monthTop = new Intl.DateTimeFormat('en-US', {month: 'long'}).format(
        new Date(),)
        let dayTop = dateTop.getDate();
        let formatedDateTop = [dayTop, monthTop, yearTop].join(' ').concat('-generatedSchedules');
        let key = `${formatedDateTop}`

        const id = req.params.id;
        const result = await EmployeeModel.findByIdAndDelete(id);
        const updatedScedule = await generateScheduleHelper();
        cache[key] = {
            data: updatedScedule,
            timeStamp: Date.now()
        }

        res.status(200).json({ message: 'Employee deleted!', result });
    } catch (e) {
        next(e);
    }
};

Data.updateEmployee = async (req, res, next) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;
        // console.log("Updating employee with id:", id, "Data:", updatedData);
        const result = await EmployeeModel.findByIdAndUpdate(id, updatedData, { new: true });
        res.status(200).json({ message: 'Employee updated!', result });
    } catch (e) {
        next(e);
    }
};


Data.getSchedules = async (req, res, next) => {
    try {
    let myShcedules = await WorkScheduleModel.find({});
    res.status(200).json(myShcedules);
    } catch {
    next(e);
    }
};


Data.getEmpSchedules = async (req, res, next) => {
    try {
    let mySchedules = await WorkScheduleModel.find({});
    //console.log(mySchedules);

    helperShiftGenerator(mySchedules).then((refinedSchedule) => {
    //console.log(refinedSchedule);
    res.status(200).send(refinedSchedule);
    });
    } catch (e) {
    next(e);
    }
};


async function helperShiftGenerator(arr) {
  // iterate over each work schedule
    const schedulesWithEmployees = await Promise.all(
    arr.map(async (schedule) => {
      // fetch employee info for day shift
    const dayShiftEmployees = await Promise.all(
        schedule.dayShift.map(async (employeeId) => {
        const employee = await EmployeeModel.findById(employeeId);
        return {
            firstName: employee.firstName,
            lastName: employee.lastName,
            level: employee.level,
            };
        })
    );

      // fetch employee info for mid shift
    const midShiftEmployees = await Promise.all(
        schedule.midShift.map(async (employeeId) => {
        const employee = await EmployeeModel.findById(employeeId);
        return {
            firstName: employee.firstName,
            lastName: employee.lastName,
            level: employee.level,
        };
        })
    );

      // fetch employee info for night shift
    const nightShiftEmployees = await Promise.all(
        schedule.nightShift.map(async (employeeId) => {
        const employee = await EmployeeModel.findById(employeeId);
        return {
            firstName: employee.firstName,
            lastName: employee.lastName,
            level: employee.level,
        };
        })
    );

      // combine employee info for all shifts into a single object
    return {
        date: schedule.date,
        dayShift: dayShiftEmployees.map((employee) => ({
        ...employee,
        date: schedule.date,
        })),
        midShift: midShiftEmployees.map((employee) => ({
        ...employee,
        date: schedule.date,
        })),
        nightShift: nightShiftEmployees.map((employee) => ({
        ...employee,
        date: schedule.date,
        })),
    };
    })
);

  // return the final array of schedules with employee info
  return schedulesWithEmployees;
}

Data.email = async (req, res, next) => {
    try {
        let mySchedules = await WorkScheduleModel.find({});
        
        mySchedules.forEach(await function(item ,key){
            item.dayShift.forEach(async function(employee, key){//only running day shift
                let retrievedEmployee = await EmployeeModel.findById(employee);
                if(retrievedEmployee === null || retrievedEmployee.email === null){
                    
                } else{
                    let email = retrievedEmployee.email.trim();
                    //console.log(typeof email);
                    const msg = {
                        to: `${email}`, // Change to your recipient
                        from: "juan.c.olmedo@icloud.com", // Change to your verified sender
                        subject: "Your Work Schedule has been Posted",
                        text: "Please review your Schedule",
                        html: "<strong>You have been scheduled for a day shift<br> Please login to view Changes <br><a href='https://medicalendar.netlify.app/displayCalendar'> Your Calendar</a></strong>",
                        templateId : 'd-1fa152b2d77c45ec959c98f8cfeeecd0'
                        };
                    sgMail
                    .send(msg)
                    .then(() => {
                        console.log("Email sent")
                    })
                        .catch((error) => {
                            console.error(error, retrievedEmployee.email);
                    });   
                }
            })
        })

        mySchedules.forEach(await function(item ,key){
            item.midShift.forEach(async function(employee, key){//only running day shift
                let retrievedEmployee = await EmployeeModel.findById(employee);
                if(retrievedEmployee === null || retrievedEmployee.email === null){
                    
                } else{
                    let email = retrievedEmployee.email.trim();
                    //console.log(typeof email);
                    const msg = {
                        to: `${email}`, // Change to your recipient
                        from: "juan.c.olmedo@icloud.com", // Change to your verified sender
                        subject: "Your Work Schedule has been Posted",
                        text: "Please review your Schedule",
                        html: "<strong>You have been scheduled for a mid shift<br> Please login to view Changes<br><a href='https://medicalendar.netlify.app/displayCalendar'> Your Calendar</a> </strong>",
                        };
                    sgMail
                    .send(msg)
                    .then(() => {
                        console.log("Email sent")
                    })
                        .catch((error) => {
                            console.error(error, retrievedEmployee.email);
                    });   
                }
            })
        })

        mySchedules.forEach(await function(item ,key){
            item.nightShift.forEach(async function(employee, key){//only running day shift
                let retrievedEmployee = await EmployeeModel.findById(employee);
                if(retrievedEmployee === null || retrievedEmployee.email === null){
                    
                } else{
                    let email = retrievedEmployee.email.trim();
                    //console.log(typeof email);
                    const msg = {
                        to: `${email}`, // Change to your recipient
                        from: "juan.c.olmedo@icloud.com", // Change to your verified sender
                        subject: "Your Work Schedule has been Posted",
                        text: "Please review your Schedule",
                        html: "<strong>You have been scheduled for a Night Shift <br> Please login to view Changes<br><a href='https://medicalendar.netlify.app/displayCalendar'> Your Calendar</a> </strong>"
                        };
                    sgMail
                    .send(msg)
                    .then(() => {
                        console.log("Email sent")
                    })
                        .catch((error) => {
                            console.error(error, retrievedEmployee.email);
                    });   
                }
            })
        })

    

    res.status(200).send('all emails sent');


    } catch (e) {
    next(e);
    }
};

async function helperEmpModifier(employee){
    
    try {
        const id = employee._id;
        const employeToUpdate = await EmployeeModel.find({ _id: id });
        //console.log(typeof employeToUpdate.daysWorked);
        let dataToUpdate = employeToUpdate.daysWorked  === undefined ? 1: employeToUpdate.daysWorked +1;
        //console.log('data to update', dataToUpdate);
        const updateData = {daysWorked : dataToUpdate};
        await EmployeeModel.findByIdAndUpdate(id, updateData, { new: true });
        //res.status(200).json({ message: 'Employee updated!', updatedEmployee });
        //console.log('updated employee', updatedEmployee);
    } catch (e) {
        console.log(e);
    }
  
}



Data.combo = async (req, res, next) => {
    try {
        let dateTop = new Date(); 
        let yearTop = dateTop.getFullYear();
        let monthTop = new Intl.DateTimeFormat('en-US', {month: 'long'}).format(
        new Date(),)
        let dayTop = dateTop.getDate();
        let formatedDateTop = [dayTop, monthTop, yearTop].join(' ').concat('-generatedSchedules');
        let key = `${formatedDateTop}`;
  
        if(cache[key] && (Date.now() - cache[key].timeStamp < 1.44e+7)){
            console.log('cache was hit', cache);
            res.status(200).send(cache[key].data)
        }else{
        let allSchedules = await generateScheduleHelper();
        //console.log(allSchedules);
        console.log('cache was missed');
        cache[key] = {
                data: allSchedules,
                timeStamp: Date.now()
            }
        res.status(200).send(allSchedules);
        }
  
    } catch (e) {
    next(e);
    }
  };

async function generateScheduleHelper(){
        let myUsers = await EmployeeModel.find({});
        let numDays = 1;
  
        //Date Stuff
        let date = new Date(); //possible location to pass current date back here
        let year = date.getFullYear();
        let month = new Intl.DateTimeFormat('en-US', {month: 'long'}).format(
        new Date(),)
        let day = date.getDate();
  
        let formatedDate = [day, month, year].join(' ');
  
        let globalSchedules = [];
        let chosenStatus = 'even';
  
        for (let i = 0; i <= numDays; i++) {
  
            let insideDate = [parseInt(formatedDate[0])+i, month, year].join(' ');
            let stringDate = insideDate.toString();
            let assignedStatus = chosenStatus.includes('even')? 'odd': 'even';
  
            let workscheduleA = {
            date: stringDate,
            status: assignedStatus,
            dayShift: [],
            midShift: [],
            nightShift: [],
            };
  
            let randomEmployees = shuffleArray(myUsers);
  
            let daylevel5Found = false;
            let daylevel4Found = false;
            let midlevel5Found = false;
            let midlevel4Found = false;
            let nightlevel5Found = false;
            let nightlevel4Found = false;
  
            do{
                
                for (let j = 0; j < randomEmployees.length; j++) {
            
                let employee = randomEmployees[j];
  
                if (employee.level === 5 && !daylevel5Found) {
                    workscheduleA.dayShift.push(employee);
                    daylevel5Found = true;
                    await helperEmpModifier(employee)
                } else if (employee.level === 4 && !daylevel4Found) {
                    workscheduleA.dayShift.push(employee);
                    daylevel4Found = true;
                    await helperEmpModifier(employee)
                }else if (employee.level === 5 && !midlevel5Found) {
                    workscheduleA.midShift.push(employee);
                    midlevel5Found = true;  
                    await helperEmpModifier(employee)
                } else if (employee.level === 4 && !midlevel4Found) {
                    workscheduleA.midShift.push(employee);
                    midlevel4Found = true;
                    await helperEmpModifier(employee)
                }else if (employee.level === 5 && !nightlevel5Found) {
                    workscheduleA.nightShift.push(employee);
                    nightlevel5Found = true;
                    await helperEmpModifier(employee)  
                } else if (employee.level === 4 && !nightlevel4Found) {
                    workscheduleA.nightShift.push(employee);
                    nightlevel4Found = true;
                    await helperEmpModifier(employee)
                } else if (employee.level >= 1 && employee.level <= 3) {
                    if (workscheduleA.dayShift.length < 3) {
                        workscheduleA.dayShift.push(employee);
                        await helperEmpModifier(employee)
                    } else if (workscheduleA.midShift.length < 3) {
                        workscheduleA.midShift.push(employee);
                        await helperEmpModifier(employee)
                    } else if(workscheduleA.nightShift.length<3) {
                        workscheduleA.nightShift.push(employee);
                        await helperEmpModifier(employee)
                    }else{
                        //console.log('no place to put', employee);
                    }
                    
                }
                
            }
            }while(workscheduleA.dayShift.length < 5 && workscheduleA.midShift <5 && workscheduleA.nightShift < 5);
            
            chosenStatus = 'odd'
            const newWorkSchedule = new WorkScheduleModel(workscheduleA);
            globalSchedules.push(newWorkSchedule)
            await newWorkSchedule.save();
            
        }
        
        return globalSchedules;
}



//to be used for the data.combo
function shuffleArray(array) {
  //console.log('made it to the shuffle section');
    let currentIndex = array.length;
    let tempValue;
    let randomIndex;

    while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    tempValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = tempValue;
    }

    return array;
}

module.exports = Data;
