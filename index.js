const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello Ritu World!");
});

const uri =
  "mongodb+srv://AfridaIslam0627:M6pmQD3kIOdCIy90@cluster0.5ylkwje.mongodb.net/?appName=Cluster0";

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
      // 1. Destructure and sanitize the email from the query parameters
      const { created_by } = req.query;

      // 2. Input validation: Check if the email parameter is provided
      if (!created_by) {
        return res
          .status(400)
          .send({ message: "Missing required query parameter: email" });
      }

      try {
        // 3. Database Query: Changed field name to 'created_by'
        const result = await modelCollection
          .find({ created_by: created_by })
          .toArray();

        // 4. Send the result back to the client
        res.send(result);
      } catch (error) {
        console.error("Database query error:", error);
        // 5. Handle potential database or server errors
        res.status(500).send({
          message: "An error occurred while fetching models.",
          error: error.message,
        });
      }
    });

    app.post("/enrolls", async (req, res) => {
      try {
        // 1. CORRECTION: Get the data from the request object (req)
        const data = req.body;

        // 2. Perform the database insert
        const result = await enrollCollection.insertOne(data);

        // 3. Send a clean success response back to the client
        // This structure matches what your client-side code expects (data.success)
        res.send({
          success: true,
          message: "Enrollment successful.",
          insertedId: result.insertedId,
        });
      } catch (error) {
        // 4. Implement robust error handling
        console.error("Enrollment POST failed:", error);

        // Check for specific MongoDB errors like duplicate keys (code 11000)
        if (error.code === 11000) {
          return res.status(409).send({
            success: false,
            message: "You are already enrolled in this course.",
          });
        }

        // Send a generic 500 error for all other issues
        res.status(500).send({
          success: false,
          message: "Server failed to process enrollment.",
          error: error.message,
        });
      }
    });

    app.get("/my-enrolls", async (req, res) => {
      // 1. Extract the user's email from the query parameter.
      // We expect the client to send the email as a query, e.g., /my-enrolls?email=user@example.com
      const { email } = req.query;

      // 2. Input validation: Ensure the email parameter is provided.
      if (!email) {
        return res
          .status(400)
          .send({ message: "Missing required query parameter: email" });
      }

      try {
        // 3. Database Query: Find all enrollment documents where 'userEmail' matches the provided email.
        const enrolledCourses = await enrollCollection
          .find({ userEmail: email })
          .toArray();

        // 4. Send the array of found courses back to the client.
        res.send(enrolledCourses);
      } catch (error) {
        // 5. Error Handling: Log the error and send a 500 status response.
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
