const express = require('express');
const {db} = require('../Database/database.js')
const jwt = require('../Security/jwt.js')
const pass = require('../Security/password.js')
const AuthorizationFilter = require('../Security/authoriziaztionFilter');

const userRoles = {
    HOUSEKEEPER : 'HOUSEKEEPER',
    CLIENT : 'CLIENT'
}

const Router = express.Router();

function checkCredentials(body) {
    if(body.username == undefined && body.username.length > 0) {
        return false;
    }
    if(body.password == undefined && body.password.length > 0) {
        return false;
    }
    if(body.role == undefined || (body.role != userRoles.CLIENT && body.role != userRoles.HOUSEKEEPER)) {
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
            if(data.role == userRoles.CLIENT) {
                db.collection("users").add({
                    username : data.username.toLowerCase(),
                    password : password,
                    role : data.role,
                    phone : data.phone,
                    name : data.name,
                    size : data.size
                })
            } else {
                db.collection("users").add({
                    username : data.username.toLowerCase(),
                    password : password,
                    role : data.role,
                    phone : data.phone,
                    name : data.name,
                    price : data.price
                })
            }
            res.send({
                token : await jwt.generateTokenAsync({role : data.role, username : data.username.toLowerCase()})
            });
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

Router.get('/housekeepers', AuthorizationFilter.authorizeRoles(userRoles.CLIENT) ,async (req, res) => {
    const aux = await (await db.collection("users").where('role', '==', userRoles.HOUSEKEEPER).get()).docs;
    const requests = await (await db.collection("requests").where('usernameClient', '==', req.user.payload.username).get()).docs;
    const sentRequest = [];
    requests.forEach(elem => {
        sentRequest.push(elem.data().usernameHousekeeper)
    })
    const result = [];
    aux.forEach(elem => 
        {
            let aux2 = elem.data();
            aux2.password = undefined;
            aux2.role = undefined;
            if(!sentRequest.includes(elem.data().username))
                result.push(aux2)
        });
    res.send(result)
});

Router.post('/housekeepers', AuthorizationFilter.authorizeRoles(userRoles.CLIENT) ,async (req, res) => {
    const data = req.body;
    const aux = await (await db.collection("users").where('role', '==', userRoles.HOUSEKEEPER).where('username', '==', data.username).get()).docs[0];
    const aux2 = await (await db.collection("requests").where('usernameHousekeeper', '==', data.username).where('usernameClient', '==', req.user.payload.username).get()).empty;
    if(aux != undefined && aux2) {
        await db.collection("requests").add({
            usernameClient : req.user.payload.username,
            usernameHousekeeper : aux.data().username
        })
        res.send("Request added with succes")
    } else {
        res.send("Incorrect housekeeper username")
    }
});

Router.get('/myProfile', AuthorizationFilter.authorizeRoles(userRoles.CLIENT, userRoles.HOUSEKEEPER) ,async (req, res) => {
    const aux = await (await db.collection("users").where('role', '==', req.user.payload.role).where('username', '==', req.user.payload.username).get()).docs[0];
    if(aux != undefined) {
        const result = aux.data();
        result.password = undefined;
        res.send(result)
    } else {
        res.send("Incorrect housekeeper username")
    }
});

Router.post('/myProfile', AuthorizationFilter.authorizeRoles(userRoles.CLIENT, userRoles.HOUSEKEEPER) ,async (req, res) => {
    const data = req.body;
    const aux = await (await db.collection("users").where('role', '==', req.user.payload.role).where('username', '==', req.user.payload.username).get()).docs[0];
    if(aux != undefined) {
        if(req.user.payload.role == userRoles.CLIENT) {
            const result = await db.collection("users").doc(aux.id).update({
                name : data.name,
                phone : data.phone,
                size : data.size
            })
            res.send("Account was updated")
        } else if(req.user.payload.role == userRoles.HOUSEKEEPER) {
            const result = await db.collection("users").doc(aux.id).update({
                name : data.name,
                phone : data.phone,
                price : data.price
            })
            res.send("Account was updated")
        } else {
            res.send("You must be logged on an account")
        }
    } else {
        res.send("Incorrect housekeeper username")
    }
});

Router.get('/myRequests', AuthorizationFilter.authorizeRoles(userRoles.CLIENT, userRoles.HOUSEKEEPER) ,async (req, res) => {
    if(req.user.payload.role == userRoles.CLIENT) {
        const aux = await (await db.collection("requests").where('usernameClient', '==', req.user.payload.username).get()).docs;
        const result = [];
        aux.forEach((elem)=>{
            result.push(elem.data());
        })
        res.send(result)
    } else if(req.user.payload.role == userRoles.HOUSEKEEPER) {
        const aux = await (await db.collection("requests").where('usernameHousekeeper', '==', req.user.payload.username).get()).docs;
        const result = [];
        aux.forEach((elem)=>{
            result.push(elem.data());
        })
        res.send(result)
    } else {
        res.send("You must be logged on an account")
    }
});

Router.post('/myRequests', AuthorizationFilter.authorizeRoles(userRoles.CLIENT, userRoles.HOUSEKEEPER) ,async (req, res) => {
    const data = req.body;
    if(data.response == "ACCEPT") {
        res.send("ACCEPT")
    } else if(data.response == "CANCEL") {
        if(req.user.payload.role == userRoles.CLIENT) {
            const aux = await (await db.collection("requests").where('usernameHousekeeper', '==', data.username).get()).docs[0];
            if(aux != undefined) {
                await db.collection("requests").doc(aux.id).delete()
                res.send("Request was deleted")
            } else {
                res.send("Request not found")
            }
        } else if(req.user.payload.role == userRoles.HOUSEKEEPER) {
            const aux = await (await db.collection("requests").where('usernameClient', '==', data.username).get()).docs[0];
            if(aux != undefined) {
                await db.collection("requests").doc(aux.id).delete()
                res.send("Request was deleted")
            } else {
                res.send("Request not found")
            }
        } else {
            res.send("You must be logged on an account")
        }
    } else {
        res.send("Not a correct message/token")
    }
});
module.exports = Router;