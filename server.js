require('dotenv').config();

const express = require("express");
const mongodb = require("mongodb");


//creating express app
const app = express();
const PORT = process.env.PORT || 3000;

//to parse JSON requests
app.use(express.json());

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

app.get('/getlessons', getAllLessons);

async function getAllLessons(req,res){
  const collection = database.collection("Lessons");
  const lessons = await collection.find({}).toArray();
  res.send({message:"Lessons Successfully Retrieved",data:posts});
}

//starting server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



