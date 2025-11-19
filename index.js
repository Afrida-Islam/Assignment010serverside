const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello Ritu World!");
});
// console.log("======User====", process.env.DB_USERNAME);
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.5ylkwje.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("model-db");
    const modelCollection = db.collection("models");
    const enrollCollection = db.collection("enrolls");
    app.get("/models", async (req, res) => {
      const result = await modelCollection.find().toArray();
      res.send(result);
    });
    app.get("/models/:id", async (req, res) => {
      const { id } = req.params;
      const objectId = new ObjectId(id);

      const result = await modelCollection.findOne({ _id: objectId });

      res.send({
        success: true,
        result,
      });
    });

    app.post("/models", async (req, res) => {
      const data = req.body;

      const result = await modelCollection.insertOne(data);
      res.send({
        succenoss: true,
        result,
      });
    });

    app.get("/search", async (req, res) => {
      const category = req.query.search;
      const result = await modelCollection
        .find({ category: { $regex: category, $options: "i" } })
        .toArray();
      res.send(result);
    });

    app.put("/models/:id", async (req, res) => {
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
    });

    app.get("/my-models", async (req, res) => {
      const { created_by } = req.query;

      if (!created_by) {
        return res
          .status(400)
          .send({ message: "Missing required query parameter: email" });
      }

      try {
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

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
