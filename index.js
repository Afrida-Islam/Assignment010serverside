const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb"); // Import here

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

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
    await client.connect(); // 'client' is now defined and available
    const db = client.db("E-Learning");
    const dataCollection = db.collection("Learning");

    app.get("/", (req, res) => {
      res.send("Hello ritu World!");
    });

    app.get("/data", async (req, res) => {
      const result = await dataCollection.find().toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
