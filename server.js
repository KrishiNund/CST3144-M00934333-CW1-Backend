require("dotenv").config();

const express = require("express");
const mongodb = require("mongodb");
const cors = require("cors");
const morgan = require("morgan");

//creating express app
const app = express();
const PORT = process.env.PORT || 3000;

//to parse JSON requests
app.use(express.json());

//allow request from any origin
app.use(cors());

// Use Morgan for logging
app.use(morgan("short"));

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

//establishing connection to mongodb
connectToMongoDB();

//specifying default database
const database = client.db("After_School_Classes");

//SECTION: initializing and defining api routes

//retrieve all lessons from database
app.get("/api/lessons", getAllLessons);

async function getAllLessons(req, res) {
  const collection = database.collection("Lessons");
  const lessons = await collection.find({}).toArray();
  res.send({ message: "Lessons Successfully Retrieved", data: lessons });
}

//insert orders in database
app.post("/api/orders", postOrder);

async function postOrder(req, res) {
  const collection = database.collection("Orders");
  try {
    const result = await collection.insertOne(req.body);

    res
      .status(201)
      .send({ message: "Order Created Successfully", data: result });
  } catch (err) {
    res.status(500).send({ message: "Internal Server error" });
  }
}

//update value of attribute specified for lesson
app.put("/api/updateLesson", updateLesson);

async function updateLesson(req, res) {
  const collection = database.collection("Lessons");
  try {
    const result = collection.updateOne(
      { subject: req.body.subject },
      {
        $set: {
          [req.body.attribute]: req.body.value,
        },
      }
    );
    res
      .status(201)
      .send({ message: "Lesson Updated Successfully", data: result });
  } catch (err) {
    res.status(500).send({ message: "Internal Server error" });
  }
}

//dynamic search, filter lessons according to search query typed
app.get("/api/search", searchLesson);

async function searchLesson(req, res) {
  try {
    const collection = database.collection("Lessons");
    const lessons = await collection.find({}).toArray();

    const query = req.query.query || "";

    const filteredLessons = lessons.filter(
      (lesson) =>
        lesson.subject.toLowerCase().includes(query.toLowerCase()) ||
        lesson.location.toLowerCase().includes(query.toLowerCase()) ||
        lesson.price.toString().includes(query) ||
        lesson.spaces.toString().includes(query)
    );

    res.send({
      message: "Lessons Successfully Filtered",
      data: filteredLessons,
    });
  } catch (err) {
    res.status(500).send({ message: "Filter Unsuccessful" });
  }
}

//starting server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
