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
//const baseUrl = process.env.API_BASE_URL;
const connectionString = process.env.CONSTRING;
const secret1 = process.env.SUPERSECRETWORD;

console.log(process.env.ENV_1)

console.log(secret1)

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

const app = express()

const corsOptions = {
    origin: ['http://localhost:3000', 'http://192.168.137.1:3000', 'http://192.168.0.27:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie'],  
  };

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json())

mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true }); //NEED TO FIX THE CONNETION! NOTHING IS WORKING

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
})

const PlayerSchema = new mongoose.Schema({
    user_id:[
        {type: Schema.Types.ObjectId, ref: "Users"}
    ],
    xp: Number,
    cash: Number,
    tech: Number,
    gather_speed: Number,
    travel_speed: Number,
    location_id:[
        {type: Schema.Types.ObjectId, ref: 'Locations'}
      ]
})

const ItemSchema = new mongoose.Schema({
    
})

const GlobalInventorySchema = new mongoose.Schema({
    owner:[
        {type: Schema.Types.ObjectId, ref: "Users"}
    ],
    item_id: [
        {type: Schema.Types.ObjectId, ref: "Items"}
    ],
    tradeable: Boolean,
})

const LocationsSchema = new mongoose.Schema({
    name: String,
    cord_x: Number,
    cord_y: Number
})

const ActionsSchema = new mongoose.Schema({
    action_name: String,
    action_route: String,
    remaining: Number,
    location_id:[
      {type: Schema.Types.ObjectId, ref: 'Locations'}
    ]
})

const UserModel = mongoose.model("users", UserSchema)
const PlayerModel = mongoose.model("players", PlayerSchema)
const ItemModel = mongoose.model("items", ItemSchema)
const GlobalInventoryModel = mongoose.model("globalinventory", GlobalInventorySchema)
const LocationsModel = mongoose.model("locations", LocationsSchema)
const ActionsModel = mongoose.model("actions", ActionsSchema)

app.post("/createuser", async (req,res)=>{
    try{
        const { username, email, password } = req.body
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await UserModel.create({ username, email, password: hashedPassword })
        console.log(newUser)
        res.status(200).json("user created")
    }
    catch(err){
        res.status(400).json(err)
    }
})

app.post("/signin", async (req,res)=>{
    try{
        console.log("sign in route .env check -> ", secret1)
        const reqemail = req.body.email
        const reqpass = req.body.password
        const hashedQuery = await UserModel.findOne({email: reqemail}, "password")
        const hashedPassword = hashedQuery.password.toString();
        console.log("hashedPassword: ",hashedPassword, "and text pass: ", reqpass)
        
        const checkPass = await bcrypt.compare(reqpass, hashedPassword);
        if(!checkPass){
            return res.status(401).json({ error: 'Authentication failed' });
        }
        const queryUser = await UserModel.findOne({email: reqemail, password: hashedPassword}, "_id username password")
        console.log("queryUser._id: ", queryUser._id.toString())
        const strUser_id = queryUser._id.toString();
        const resUser = queryUser.username
        console.log(resUser)
        const token = jwt.sign({ user_id: strUser_id }, secret1, { expiresIn: "1h" });
        console.log("jsonwebtoken: ", token);

        //const token = "foo";

        res.cookie('token', token, {
            httpOnly: true,           // Prevents JavaScript access
            secure: false,
            sameSite: 'strict',       // Protects against CSRF
            maxAge: 3600000          // 1 hour in milliseconds
        });
        
          
        res.status(200).json(resUser)
    }
    catch(err){
        res.status(400).json(err)
    }
})

app.get("/getAllLocations", authLogic, async (req, res)=>{
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

app.post("/getactions", async (req, res)=>{
    try{
        console.log("getactions route accessed")
        const loid = req.body.location_id
        const actions = await ActionsModel.find({location_id: loid}, "action_name action_route remaining")
        if(!actions){
            console.log("there is a db error or no actions are avaliable")
            return res.status(404).json({message: "actions not found"})
        }
        res.json(actions)
    }catch{
        res.status(400).json("getAllLocations error occured")
    }
})

//createaction route - for creating actions for locations
app.post("/createaction", async (req, res)=>{
    try{
        const newAction = req.body
        console.log(newAction)
        await ActionsModel.create(newAction);
        console.log("new action created!") 
        res.json(newAction)
    }catch(err){
        res.status(400).json(err)
    }
})

//gathersomething route - for gathering something
//      **CLIENT STRUCTURE CONCEPT**
//  
//  location_id: {db ObjectId of location},
//  user_id: {db ObjectId of user} <-- not implemented yet!
//  gather_speed: INT,
//  ...more to come
//
app.post("/gathersomething", async (req, res)=>{
    try{
        const loid = req.body.location_id
        const gather_speed = req.body.gather_speed
        const current = await ActionsModel.findOne({action_route: "gathersomething"}, "action_name remaining")
        console.log("Checking Action Exists: ", current)
        const newCurrent = current.remaining - gather_speed
        console.log("new current remaining: ", newCurrent)
        const query = { location_id: loid }
        const response = await ActionsModel.findOneAndUpdate(query, { remaining: newCurrent })
        res.status(200).json(response)
    }catch(err){
        res.status(400).json(err)
    }
})

//boiler plate action route
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