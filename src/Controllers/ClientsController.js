const express = require('express');
const {db} = require('../Database/database.js')

const Router = express.Router();

function checkCredentials(body) {
    if(body.name == undefined) {
        return false;
    }
    if(body.password == undefined) {
        return false;
    }
    return true;
}

Router.post('/register', async (req, res) => {
    
    const data = req.body;

    if(!checkCredentials(data)) {
        res.send("Name/Password are not sent");
        return;
    }
    const aux = await (await db.collection("clients").where('name', '==', data.name.toLowerCase()).get()).empty;
    if(aux) {
        db.collection("clients").add({
            name : data.name.toLowerCase(),
            password : data.password
        })
        res.send("Account was created");
    } else {
        res.send("Username is already taken");
    }
});


Router.post('/login', async (req, res) => {
    
    const data = req.body;

    res.send("da");
});

module.exports = Router;