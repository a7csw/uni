const express = require('express');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Replace with your actual MongoDB Atlas URI
const uri = 'mongodb+srv://abdulrahmanalfaiadi:zs6pYQBLbGzjgWmH@cluster0.zesisoe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

let participantsCollection;

async function startServer() {
  try {
    await client.connect();
    const db = client.db('festival');
    participantsCollection = db.collection('participants');
    console.log('✅ Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err);
  }
}

// Routes

app.get('/participants', async (req, res) => {
  try {
    const list = await participantsCollection.find().toArray();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

app.post('/register', async (req, res) => {
  const { name, surname, activity } = req.body;

  if (!name || !surname || !activity) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const entry = { name, surname, activity, createdAt: new Date() };
  try {
    const result = await participantsCollection.insertOne(entry);
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register' });
  }
});

app.delete('/participants/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await participantsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID format' });
  }
});

startServer();
