const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ MongoDB Atlas connection URI
const uri = 'mongodb+srv://abdulrahmanalfaiadi:zs6pYQBLbGzjgWmH@cluster0.zesisoe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let participantsCollection;

async function startServer() {
  try {
    await client.connect();
    const db = client.db('festival');
    participantsCollection = db.collection('participants');
    console.log('✅ Connected to MongoDB Atlas');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err);
  }
}

// Routes
app.get('/participants', async (req, res) => {
  const participants = await participantsCollection.find().toArray();
  res.json(participants);
});

app.post('/register', async (req, res) => {
  const { name, surname, activity } = req.body;
  if (!name || !surname || !activity) {
    return res.status(400).json({ error: 'All fields are required' });
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

app.delete('/participants/:id', async (req, res) => {
  try {
    const idToDelete = req.params.id;
    const result = await participantsCollection.deleteOne({ _id: new ObjectId(idToDelete) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID format' });
  }
});

// Start the server
startServer();
