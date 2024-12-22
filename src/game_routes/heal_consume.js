const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); //env vars were not working serverside so this is the only fix that worked

const mongodb = require("mongodb")
const { mongoose, Schema, connection } = require("mongoose")
const AutoIncrement = require('mongoose-sequence')(mongoose);
const express = require("express");
const route = express.Router()
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

var router = express.Router();

mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

//  ITEM ARCHITECTURE
//  Item type must be name of route to execute respective function e.g.
//  a health restore consumable would call a generic route such as "heal_consume"
//  SECURITY NOTE: will need to check at every item function if player is using/referencing item in the correct context
const ItemSchema = new mongoose.Schema({
    item_name: String,
    item_desc: String,
    item_func: {
        route: String,
        //the rest of the parameters will be determined by the route/function of the item
    }
})

const GlobalInventorySchema = new mongoose.Schema({
    owner:[
        {type: Schema.Types.ObjectId, ref: "Users"}
    ],
    item_id: [
        {type: Schema.Types.ObjectId, ref: "Items"}
    ],
    amount: Number,
    tradeable: Boolean,
})

//heal potion route
router.post("/", async (req, res)=>{
    try{
        //foo healing logic
        res.json("player healed")
    }catch{
        res.status(400).json("error occured")
    }
})

module.exports = router;