const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
const MONGO_URI = "mongodb+srv://abdulrahmanalfaiadi:zs6pYQBLbGzjgWmH@cluster0.zesisoe.mongodb.net/festival?retryWrites=true&w=majority&appName=Cluster0&tls=true";
const client = new MongoClient(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tls: true,
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true
  }
});
let participantsCollection;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Connect to MongoDB and start the server
async function startServer() {
  try {
    await client.connect();
    const db = client.db("festival");
    participantsCollection = db.collection("participants");

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
}

// Routes

// Get all participants
app.get("/participants", async (req, res) => {
  const participants = await participantsCollection.find().toArray();
  res.json(participants);
});

// Register new participant
app.post("/register", async (req, res) => {
  const { name, surname, activity } = req.body;
  if (!name || !surname || !activity) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const newEntry = {
    name,
    surname,
    activity,
    createdAt: new Date(),
  };

  const result = await participantsCollection.insertOne(newEntry);
  res.status(201).json({ ...newEntry, id: result.insertedId });
});

// Delete participant
app.delete("/participants/:id", async (req, res) => {
  try {
    const idToDelete = req.params.id;
    const result = await participantsCollection.deleteOne({ _id: new ObjectId(idToDelete) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Participant not found" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

// Start the server
startServer();
