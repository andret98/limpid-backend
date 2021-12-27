const express = require('express');
const {db} = require('../Database/database.js')
const jwt = require('../Security/jwt.js')
const pass = require('../Security/password.js')

const Router = express.Router();

function checkCredentials(body) {
    if(body.username == undefined) {
        return false;
    }
    if(body.password == undefined) {
        return false;
    }
    if(body.role == undefined || (body.role != 'CLIENT' && body.role != 'HOUSEKEEPER')) {
        return false;
    }
    return true;
}

Router.post('/register', async (req, res) => {
    
    const data = req.body;

    if(!checkCredentials(data)) {
        res.send("Name/Password are not sent");
        return;
    } else {
        const aux = await (await db.collection("users").where('username', '==', data.username.toLowerCase()).get()).empty;
        if(aux) {
            const password = await pass.hashPassword(data.password)
            db.collection("users").add({
                username : data.username.toLowerCase(),
                password : password,
                role : data.role
            })
            res.send("Account was created");
        } else {
            res.send("Username is already taken");
        }
    }
});

Router.post('/login', async (req, res) => {
    
    const data = req.body;
    try {
        const aux = await (await db.collection("users").where('username', '==', data.username.toLowerCase()).get()).docs[0];
        const checkPass = await pass.comparePlainTextToHashedPassword(data.password, aux.data().password)
        if(checkPass) {
            res.send({
                token : await jwt.generateTokenAsync({role : aux.data().role, username : data.username.toLowerCase()})
            });
        } else {
            res.send("Incorrect username/password")
        }
    } catch(e) {
        res.send("Incorrect username/password")
    }
});

Router.get('/housekeepers', async (req, res) => {
    const aux = await (await db.collection("users").where('role', '==', 'HOUSEKEEPER').get()).docs;
    const result = [];
    aux.forEach(elem => 
        {
            let aux2 = elem.data();
            aux2.password = undefined;
            aux2.role = undefined;
            result.push(aux2)
        });
    res.send(result)
});

module.exports = Router;