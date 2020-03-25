const functions = require('firebase-functions');

const express = require('express')
const bodyParser = require("body-parser")
const pdf = require("html-pdf")
const cors = require("cors")
const fs = require("fs")
const path = require('path');


let employeeTemplate = require("./documents/employee")
let companyTemplate = require("./documents/company")


let app = express()





app.use(cors())
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

let data;

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers",  "Content-Type");
    next();
});




app.get('/hello', (req, res) => {
    res.send("HELLO")
})

app.get("/helloworld", (req, res) => {
    res.send("HELLO WORLD DEAR USER, your firebase hosting works perfectlly")
})

app.post("/getCompanies", (req, res) => {
    //read the companies json file data
    fs.readFile(`./companies.json`, 'utf8', (err, jsonString) => {
        if (err) {
            console.log("Error reading file from disk:", err)
            res.send(Promise.reject())
        }
        try {
            data = JSON.parse(jsonString)
            console.log("Data:", data)
            if(req.body) {
                res.send(Promise.resolve()) 
            }
        } catch(err) {
                console.log('Error parsing JSON string:', err)
                res.send(Promise.reject())
            }
        })
})

app.get("/getData", (req, res) => {
    res.send(data)
})

app.post('/updateCompanies', (req, res) => {

    function containsObject(obj, list) {
        var i;
        for (i = 0; i < list.length; i++) {
            if (list[i] === obj) {
                return true;
            }
        }
    
        return false;
    }
    const newData = JSON.stringify(req.body.body)
    fs.readFile(`./companies.json`, 'utf8', (err, jsonString) => {
        if (err) {
            console.log("File read failed:", err)
        } else {
            let json = JSON.parse(jsonString)
            json=[...new Set(json),req.body.body]
            if(!containsObject(req.body.body, jsonString)) {
                fs.writeFile(`./companies.json`, JSON.stringify(json), (err) => {
                    if (err) console.log('Error writing file:', err)
                })
                res.send(Promise.resolve())
            } 
        }
    })
    
})



app.post("/recent", (req, res) => {
    function containsObject(obj, list) {
        var i;
        for (i = 0; i < list.length; i++) {
            if (list[i] === obj) {
                return true;
            }
        }
    
        return false;
    }
    const newData = JSON.stringify(req.body.body)
    fs.readFile(`./recent.json`, 'utf8', (err, jsonString) => {
        if (err) {
            console.log("File read failed:", err)
        } else {
            let json = JSON.parse(jsonString)
            json=[...new Set(json),req.body.body]
            if(json.length > 8) {
                json = json.slice(1, 9)
            }
            if(!containsObject(req.body.body, jsonString)) {
                fs.writeFile(`./recent.json`, JSON.stringify(json), (err) => {
                    if (err) console.log('Error writing file:', err)
                })
                res.send(Promise.resolve())
            } 
        }
    })
})

app.get("/recent", (req, res) => {
    fs.readFile('./recent.json', 'utf8', (err, jsonString) => {
        if (err) {
            console.log("File read failed:", err)
        } else {
            let json = JSON.parse(jsonString)
            res.send(json)
        }
    })
})



// POST -> PDF generation and fetching of the data
app.post('/create-employee-pdf', (req, res) => {
        pdf.create(employeeTemplate(req.body), {}).toFile(`./results.pdf`, (err, response) => {
            if(err) res.send(Promise.reject())
            else {
               if(response) res.send(Promise.resolve())
            }
        })
})

app.post('/create-company-pdf', (req, res) => {
    pdf.create(companyTemplate(req.body), {}).toFile(`./result.pdf`, (err, response) => {
        if(err) res.send(Promise.reject())
        else {
            if(response) res.send(Promise.resolve())
        }
    })
})

// GET -> Send the generated pdf to the client
app.get("/fetch-pdf", (req, res) => {
    res.sendFile(__dirname + '/results.pdf');
})


exports.app = functions.https.onRequest(app);
