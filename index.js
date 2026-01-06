const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://assignment010.vercel.app/"],
    credentials: true,
  })
);
app.use(express.json());

// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.5ylkwje.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Create a promise that resolves when the database is connected.
const dbConnectPromise = client
  .connect()
  .then((client) => {
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    client.db("admin").command({ ping: 1 });
    return client.db("model-db");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });

// Routes
app.get("/", (req, res) => {
  res.send("Hello Ritu World!");
});

app.get("/models", async (req, res) => {
  try {
    const db = await dbConnectPromise;
    const modelCollection = db.collection("models");
    const result = await modelCollection.find().toArray();
    res.send(result);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Server error fetching models", error: error.message });
  }
});

app.get("/models/:id", async (req, res) => {
  try {
    const db = await dbConnectPromise;
    const modelCollection = db.collection("models");
    const { id } = req.params;
    const objectId = new ObjectId(id);
    const result = await modelCollection.findOne({ _id: objectId });
    res.send({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).send({
      message: "Server error fetching model by id",
      error: error.message,
    });
  }
});

app.post("/models", async (req, res) => {
  try {
    const db = await dbConnectPromise;
    const modelCollection = db.collection("models");
    const data = req.body;
    const result = await modelCollection.insertOne(data);
    res.send({
      success: true,
      result,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Server error creating model", error: error.message });
  }
});

app.get("/search", async (req, res) => {
  try {
    const db = await dbConnectPromise;
    const modelCollection = db.collection("models");
    const category = req.query.search;
    const result = await modelCollection
      .find({ category: { $regex: category, $options: "i" } })
      .toArray();
    res.send(result);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Server error searching models", error: error.message });
  }
});

app.put("/models/:id", async (req, res) => {
  try {
    const db = await dbConnectPromise;
    const modelCollection = db.collection("models");
    const { id } = req.params;
    const data = req.body;
    const objectId = new ObjectId(id);
    const filter = { _id: objectId };
    const update = {
      $set: data,
    };
    const result = await modelCollection.updateOne(filter, update);
    res.send({
      success: true,
      result,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Server error updating model", error: error.message });
  }
});

app.get("/my-models", async (req, res) => {
  const { created_by } = req.query;
  if (!created_by) {
    return res
      .status(400)
      .send({ message: "Missing required query parameter: email" });
  }
  try {
    const db = await dbConnectPromise;
    const modelCollection = db.collection("models");
    const result = await modelCollection
      .find({ created_by: created_by })
      .toArray();
    res.send(result);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).send({
      message: "An error occurred while fetching models.",
      error: error.message,
    });
  }
});

app.post("/enrolls", async (req, res) => {
  try {
    const db = await dbConnectPromise;
    const enrollCollection = db.collection("enrolls");
    const data = req.body;
    const result = await enrollCollection.insertOne(data);
    res.send({
      success: true,
      message: "Enrollment successful.",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Enrollment POST failed:", error);
    if (error.code === 11000) {
      return res.status(409).send({
        success: false,
        message: "You are already enrolled in this course.",
      });
    }
    res.status(500).send({
      success: false,
      message: "Server failed to process enrollment.",
      error: error.message,
    });
  }
});

app.get("/my-enrolls", async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res
      .status(400)
      .send({ message: "Missing required query parameter: email" });
  }
  try {
    const db = await dbConnectPromise;
    const enrollCollection = db.collection("enrolls");
    const enrolledCourses = await enrollCollection
      .find({ userEmail: email })
      .toArray();
    res.send(enrolledCourses);
  } catch (error) {
    console.error("Database query error for /my-enrolls:", error);
    res.status(500).send({
      message: "An error occurred while fetching your enrolled courses.",
      error: error.message,
    });
  }
});

// Export the app for Vercel
module.exports = app;
