const {db} = require('./Database/database.js')
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const routes = require('./Controllers/index.js');
var cors = require('cors')

const app = express();

app.use(helmet());
app.use(morgan(':remote-addr - :remote-user [:date[web]] ":method :url HTTP/:http-version" :status :res[content-length]'));
app.use(express.json());
app.use(cors())
app.use('/',routes);

app.get('/', (req, res) => res.send("da"));

app.listen(process.env.PORT || 3000);

// db.collection("clients").add({
//     name : "Andrei",
//     password : "$3Cret2"
// })