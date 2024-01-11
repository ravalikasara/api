
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
    res.json({message:"home3 data"})
})

app.get('/login',(req,res)=>{
    res.json({message:"login2 data"})
})

app.get('/profile',(req,res)=>{
    res.json({message:"profile data"})
})

app.get("/items", async (request, response) => {
  const {
    sort_by = "id",
    search_q = "",
    order = "ASC",
    category_id = "",
  } = request.query;

  let dbQuery = `SELECT * FROM Items WHERE name LIKE '%${search_q}%' ORDER BY ${sort_by} ${order}`;
  if (category_id !== "") {
    dbQuery = `SELECT * FROM Items WHERE category_id=${category_id} AND name LIKE '%${search_q}%' ORDER BY ${sort_by} ${order}`;
  }
  const data = await db.all(dbQuery);

  response.json(data);
});
  
