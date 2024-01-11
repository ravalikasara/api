
require('dotenv').config()


const express=require('express')
const cors = require('cors')
const app = express()
app.use(cors())



app.get('/',(req,res)=>{
    res.json({message:"home data"})
})

app.get('/login',(req,res)=>{
    res.json({message:"login data"})
})

app.get('/profile',(req,res)=>{
    res.json({message:"profile data"})
})
  
app.listen(process.env.PORT,()=>{
    console.log(`apps running at port`)
})