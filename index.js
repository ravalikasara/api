
require('dotenv').config();


const express=require('express')
const cors = require('cors')
const path = require('path')
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require('bcrypt')
const token = require('jsonwebtoken')
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


app.get("/categories", async (request, response) => {
  const dbQuery = `SELECT * FROM categories;`;
  const data = await db.all(dbQuery);

  response.json(data);
});

app.post('/login', async (request, response) => {
  const { username, password } = request.body;
  const dbQuery = `SELECT * FROM users WHERE username='${username}'`;
  const data = await db.get(dbQuery);

  if (data === undefined) {
    response.status(400).json({ message: "Invalid Username, please Register" });
  } else {
    const isPasswordCorrect = await bcrypt.compare(password, data.password);
    if (isPasswordCorrect) {
      const payload = { username: username };
      const jwtToken = token.sign(payload, "qwertty");
      response.status(200).json({jwtToken});
    } else {
      response.status(400).json({ message: "Invalid Password" });
    }
  }
});

app.post('/register', async (request, response) => {
  const { username, password, email } = request.body;
  const dbQuery = `SELECT * FROM users WHERE username='${username}'`;
  const data = await db.get(dbQuery);

  if (data !== undefined) {
    response.status(400)
    response.json({ message: "Username already exists" });
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    const insertQuery = `INSERT INTO users (username, password, email) VALUES('${username}', '${hashedPassword}', '${email}')`;
    await db.run(insertQuery);

      
    response.json({message:"Data inserted succesfully"});
  }
});

app.post('/user-info', async (request, response) => {
  let jwtToken;
  const authHeader = request.headers['authorization'];
  if(authHeader!==undefined){
    jwtToken=authHeader.split(" ")[1];

  }
  if(jwtToken===undefined){
    response.status(401)
    response.json({message:"Invalid JWT Token"})
  }
  else{
    token.verify(jwtToken,"qwertty",async(error,user)=>{
      if(error){
        response.status(401)
        response.json({message:"Invalid Access Token"})
      }
      else{
       
        const query = `SELECT * from users WHERE username='${user.username}'`;
        const data = await db.get(query)
        response.status(200)
        response.json({data})
      }
    })
  }

});

app.get('/add-cart', async (request, response) => {
  
  const {id,user_id,quantity}=request.query;
  console.log(quantity)
 
  const query = `SELECT * FROM items WHERE id=${id};`;
  const productDetails = await db.get(query);
 

  const cartQuery=`select * from Cart where product_id=${id} AND user_id=${user_id};`
  const cartData= await db.get(cartQuery)

 if(cartData===undefined){
   const insertQuery = `INSERT INTO Cart(user_id,product_id,category_id,name,price,image_url,quantity) VALUES(${user_id},${productDetails.id},${productDetails.category_id},'${productDetails.name}',${productDetails.price},'${productDetails.image_url}',${quantity});`
   await db.run(insertQuery)
 response.status(200)
 response.json({message:"Success"})
 }
  else{
   response.status(400)
 response.json({message:"already exits"})
  }


});

app.get('/cart',async(req,res)=>{
  const {user_id}=(req.query)

  const data = await db.all(`SELECT * FROM Cart WHERE user_id = ${user_id}`)

  res.json({data})
})


app.get('/remove-cart',async(req,res)=>{
  const {user_id,product_id}=req.query;
  try {
    console.log(user_id, product_id);
    await db.run(`DELETE FROM Cart WHERE user_id = ${user_id} AND product_id = ${product_id}`);
    res.send({message:"new"})
  } catch (error) {
    console.error("Error executing the query:", error);
  }
})

app.get('/add-quantity', async (req, res) => {
  const { id, user_id } = req.query;

  const cartQuery = `SELECT * FROM Cart WHERE product_id=${id} AND user_id=${user_id};`;
  const productDetails = await db.get(cartQuery);

  if (productDetails) {
    const newQuantity = productDetails.quantity + 1;

    const updateQuery = `
      UPDATE Cart
      SET quantity = ${newQuantity}
          
      WHERE user_id = ${user_id} AND product_id = ${id};
    `;

    await db.run(updateQuery);
    res.send({ message: "Quantity updated successfully" });
  } else {
    res.status(404).send({ message: "Product not found in the cart" });
  }
});


app.get('/remove-quantity', async (req, res) => {
  const { id, user_id } = req.query;

  const cartQuery = `SELECT * FROM Cart WHERE product_id=${id} AND user_id=${user_id};`;
  const productDetails = await db.get(cartQuery);

  if (productDetails) {
    const newQuantity = Math.max(1, productDetails.quantity - 1);

    console.log(newQuantity)

    const updateQuery = `
      UPDATE Cart
      SET quantity = ${newQuantity}
          
      WHERE user_id = ${user_id} AND product_id = ${id};

    `;

    await db.run(updateQuery);
    res.send({ message: "Quantity updated successfully" });
  } else {
    res.status(404).send({ message: "Product not found in the cart" });
  }
});

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
  
