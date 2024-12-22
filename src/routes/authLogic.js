const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); //env vars were not working serverside so this is the only fix that worked

const mongodb = require("mongodb")
const { mongoose, Schema, connection } = require("mongoose")
const AutoIncrement = require('mongoose-sequence')(mongoose);
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { Route } = require('react-router');
//const baseUrl = process.env.API_BASE_URL;
const connectionString = process.env.CONSTRING;
const secret1 = process.env.SUPERSECRETWORD;

const authLogic = async (req,res,next) => {
    console.log("authLogic triggered!")
    const token = req.cookies.token;
    console.log(token)
    if(!token){
        console.log("NO TOKEN!!!")
        return res.status(401).json({errorMessage:"fuck off"})
    }
    try{
        console.log("Attempting to verify token...");
        const decoded = jwt.verify(token, secret1);
        console.log(decoded)
        const user_id = decoded.user_id
        console.log("authentication successful: ",user_id)
        next();
    }
    catch(err){
        res.status(401).json({ err: 'Invalid token' });
    }
}

module.exports = authLogic;