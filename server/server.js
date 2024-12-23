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

//GENERIC ROUTE IMPORTS
const authLogic = require('../src/routes/authLogic');
//<------------>

//GAME ROUTE IMPORTS
const itemConsumeRoutes = require('../src/game_routes/item_consume');
//<------------>

const app = express()

const corsOptions = {
    origin: ['http://localhost:3000', 'http://192.168.137.1:3000', 'http://192.168.0.27:3000', 'http://192.168.1.198:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie'],  
  };

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json())

//GAME ROUTES
app.use("game/item_consume", itemConsumeRoutes)
//<------------>

mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
})

const PlayerSchema = new mongoose.Schema({
    user_id:[
        {type: Schema.Types.ObjectId, ref: "Users"}
    ],
    health: Number,
    xp: Number,
    cash: Number,
    tech: Number,
    gather_speed: Number,
    travel_speed: Number,
    location_id:[
        {type: Schema.Types.ObjectId, ref: 'Locations'}
      ]
})

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
        {type: Schema.Types.ObjectId, ref: "users"}
    ],
    item_id: [
        {type: Schema.Types.ObjectId, ref: "items"}
    ],
    amount: Number,
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
      {type: Schema.Types.ObjectId, ref: 'locations'}
    ]
})

const UserModel = mongoose.model("users", UserSchema)
const PlayerModel = mongoose.model("players", PlayerSchema)
const ItemModel = mongoose.model("items", ItemSchema)
const GlobalInventoryModel = mongoose.model("globalinventories", GlobalInventorySchema)
const LocationsModel = mongoose.model("locations", LocationsSchema)
const ActionsModel = mongoose.model("actions", ActionsSchema)

app.post("/createuser", async (req,res)=>{
    try{
        const { username, email, password } = req.body
        const dupeCheck = await UserModel.findOne({email: email})
        if(dupeCheck){
            res.status(400).json("use different email")
        }
        if(!dupeCheck){
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await UserModel.create({ username, email, password: hashedPassword })
            console.log(newUser)
            res.status(200).json("user created")
        }
    }
    catch(err){
        res.status(400).json(err)
    }
})

app.post("/user", authLogic, async (req,res)=>{
    
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

app.post("/createitem", async (req,res)=>{
    try{
        const item = req.body
        const newItem = await ItemModel.create(item)
        res.status(200).json(newItem)
    }
    catch(err){
        res.status(400).json({"err": err})
    }
})

//adding to inventory structure example
//<--------->
//      "owner": "6765a31f18a303b6ce57d97a",
//      "item_id": "67688f4a23b24b204db1f4a9",
//      "amount": 2
//      "tradeable": true
//<--------->
app.post("/inventory/add", async (req,res)=>{
    try{
        console.log("add item to player inv route accessed")
        const item = req.body
        const stackCheck = await GlobalInventoryModel.findOne({owner: item.owner, item_id: item.item_id}, "_id item_id amount")
        console.log("stackCheck item_id: ", stackCheck.item_id)
        console.log("req item_id: ", item.item_id)
        if(stackCheck.item_id.toString() === item.item_id){
            console.log("loop activated")
            console.log("stackCheck item_id: ",stackCheck.item_id)
            const newStack = stackCheck.amount + item.amount
            //const addToStack = await GlobalInventoryModel.findOneAndUpdate({owner: item.owner, item_id: item.item_id}, {})
            const addToStack = await GlobalInventoryModel.findOneAndUpdate({ _id: stackCheck._id }, { amount:  newStack })
            console.log("added ", item.amount, " to stack!", addToStack)
            return res.json(addToStack)
        }
        console.log(item)
        const newItem = await GlobalInventoryModel.create(item)
        console.log("new item: ", newItem)
        res.json({"item created -> ": newItem})
    }
    catch(err){
        res.status(400).json({"error adding item :(": err})
    }
})

const inventoryAddHandler = async (req, res) => {
    try{
        console.log("add item to player inv route accessed")
        const item = req.body
        const stackCheck = await GlobalInventoryModel.findOne({owner: item.owner, item_id: item.item_id}, "_id item_id amount")
        if(stackCheck){
            //console.log("stackCheck item_id: ", stackCheck.item_id)
            //console.log("req item_id: ", item.item_id)
            if(stackCheck.item_id.toString() === item.item_id){
                console.log("loop activated")
                console.log("stackCheck item_id: ",stackCheck.item_id)
                const newStack = stackCheck.amount + item.amount
                //const addToStack = await GlobalInventoryModel.findOneAndUpdate({owner: item.owner, item_id: item.item_id}, {})
                const addToStack = await GlobalInventoryModel.findOneAndUpdate({ _id: stackCheck._id }, { amount:  newStack })
                console.log("added ", item.amount, " to stack!", addToStack)
                return res.json(addToStack)
            }
        }
        console.log("No existing stack found, creating new item entry");
        console.log(item)
        const newItem = await GlobalInventoryModel.create(item)
        console.log("new item: ", newItem)
        res.json({"item created -> ": newItem})
    }
    catch(err){
        res.status(400).json({"error adding item :(": err})
    }
}

//get inventory for a specific player - user id comes from authLogic
app.get("/inventory", authLogic, async (req,res)=>{
    try{
        console.log("gathered by user_id -> : ", req.passed_user_id)
        const owner = req.passed_user_id
        //const player_name = req.body.name
        const inventory = await GlobalInventoryModel.find({owner: owner}).populate("item_id")
        console.log("inventory fetched for player: ", owner)
        console.log("inventory -> ", inventory[2])
        res.json(inventory)
    }
    catch(err){
        res.status(400).json({err: "something went wrong with fetching inventory"})
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
        const query = { action_route: "gathersomething" }
        const response = await ActionsModel.findOneAndUpdate(query, { remaining: newCurrent })
        res.status(200).json(response)
    }catch(err){
        res.status(400).json(err)
    }
})

app.post("/gathersomethingelse", authLogic, async (req, res, next)=>{
    try{
        const loid = req.body.location_id
        console.log("gathered by user_id -> : ", req.passed_user_id)
        const gather_speed = req.body.gather_speed
        const current = await ActionsModel.findOne({action_route: "gathersomethingelse"}, "action_name remaining")
        console.log("Checking Action Exists: ", current)
        const newCurrent = current.remaining - gather_speed
        console.log("new current remaining: ", newCurrent)

        const query = { action_route: "gathersomethingelse" }
        await ActionsModel.findOneAndUpdate(query, { remaining: newCurrent })
        
        req.body = {
            owner: req.passed_user_id,
            item_id: "6768af2a8b5914b7bee3da44",
            amount: gather_speed,
            tradeable: true,
        };

        next()
        //res.redirect(307, "/inventory/add");
        //res.status(200).json(response)
    }catch(err){
        res.status(400).json(err)
    }
}, inventoryAddHandler)

//boiler plate action route
app.post("/fooooo", async (req, res)=>{
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