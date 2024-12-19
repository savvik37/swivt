const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); //env vars were not working serverside so this is the only fix that worked

const mongodb = require("mongodb")
const { mongoose, Schema, connection } = require("mongoose")
const AutoIncrement = require('mongoose-sequence')(mongoose);
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
//const baseUrl = process.env.API_BASE_URL;
const connectionString = process.env.CONSTRING;

const app = express()

const corsOptions = {
    origin:  ['http://localhost:3000', 'http://192.168.137.1:3000',  'http://192.168.0.27:3000'],  // Your frontend's URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  };
app.use(cors(corsOptions));
app.use(bodyParser.json())

mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true }); //NEED TO FIX THE CONNETION! NOTHING IS WORKING

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
})

const LocationsSchema = new mongoose.Schema({
    name: String,
    cord_x: Number,
    cord_y: Number
})

const UserModel = mongoose.model("users", UserSchema)
const LocationsModel = mongoose.model("locations", LocationsSchema)

app.get("/getAllLocations", async (req, res)=>{
    try{
        console.log("getAllLocations route accessed")
        const locations = await LocationsModel.find()
        if(!locations){
            console.log("there is a db error or no locations are avaliable")
            return res.status(404).json({message: "user not found"})
        }
        res.json(locations)
    }catch{
        res.status(400).json("getAllLocations error occured")
    }
})

app.post("/", async (req, res)=>{
    try{
        const locations = await LocationsModel.find()
        if(!locations){
            console.log("there is a db error")
            return res.status(404).json({message: "there is a db error"})
        }
        res.json(locations)
    }catch{
        res.status(400).json("error occured")
    }
})

app.post("/createLocation", async (req, res)=>{
    
})

app.listen(3001, '0.0.0.0', ()=>{
    console.log("listening!");
})