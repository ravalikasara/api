
require('dotenv').config();


const express=require('express')
const cors = require('cors')
const path = require('path')
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express()
app.use(cors())

app.use(express.json())


const dbPath = path.join(__dirname, "Products.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  
     const port = process.env.PORT || 3001
    app.listen(port, () => {
      console.log(`Server Running at http://localhost at ${port}`);
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get('/',(req,res)=>{
    res.json({message:"home2 data"})
})

app.get('/login',(req,res)=>{
    res.json({message:"login2 data"})
})

app.get('/profile',(req,res)=>{
    res.json({message:"profile data"})
})
  
