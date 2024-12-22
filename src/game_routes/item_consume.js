const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); //env vars were not working serverside so this is the only fix that worked

const mongodb = require("mongodb")
const { mongoose, Schema, connection } = require("mongoose")
const AutoIncrement = require('mongoose-sequence')(mongoose);
const express = require("express");
var router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { Route } = require('react-router');
//const baseUrl = process.env.API_BASE_URL;
const connectionString = process.env.CONSTRING;
const secret1 = process.env.SUPERSECRETWORD;
const authLogic = require('../routes/authLogic');

//ITEM CONSUME ROUTES
const healConsumeRoute = require('../game_routes/heal_consume');
//const poisonConsumeRoute = require('../game_routes/poison_consume');
//<---------->

router.use("/heal", authLogic, healConsumeRoute);
//router.use("/posion", poisonConsumeRoute);


module.exports = router;