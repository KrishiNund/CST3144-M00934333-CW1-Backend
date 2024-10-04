require('dotenv').config();

const express = require("express");
const mongodb = require("mongodb");
const cors = require('cors');



//creating express app
const app = express();
const PORT = process.env.PORT || 3000;

//to parse JSON requests
app.use(express.json());

app.use(cors({
  origin:'http://127.0.0.1:5500'
}));

//creating client instance
const client = new mongodb.MongoClient(process.env.MONGODB_URI, { 
  serverApi: {
    version: mongodb.ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
});

//creating mongodb connect function
async function connectToMongoDB() {
    try {
      await client.connect();
      console.log("Sucessfully connected to MongoDB");
      return client;
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      return null;
    }
}
  
//try to establish connection to mongodb
connectToMongoDB();

//sepcifying default database
const database = client.db("After_School_Classes");

//api routes
app.get('/api/lessons', getAllLessons);

async function getAllLessons(req,res){
  const collection = database.collection("Lessons");
  const lessons = await collection.find({}).toArray();
  res.send({message:"Lessons Successfully Retrieved",data:lessons});
  //console.log(lessons);
}

app.post('/api/orders', postOrder);

async function postOrder(req,res){
  const collection = database.collection("Orders");
  try{
    
    const result = await collection.insertOne(req.body); 

    res.status(201).send({message:"Order Created Successfully", data: result});
    //console.log(result);
  } catch (err){
    res.status(500).send({message:"Internal Server error"});
  } 
}

app.put('/api/updatelesson',updateLesson);

async function updateLesson(req,res){
  const collection = database.collection("Lessons");
  try{
    const result = collection.updateOne(
      {subject:req.body.subject},
      {
        $set:{
          [req.body.attribute]:req.body.value
        }
      }
    )
    res.status(201).send({message:"Lesson Updated Successfully", data: result});
  } catch(err){
    res.status(500).send({message:"Internal Server error"});
  }
}

//dynamic search 
app.get('/api/search', searchLesson);

async function searchLesson(req,res){
  
}



//starting server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



