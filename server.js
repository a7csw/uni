const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data.json");

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

function readData() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get("/participants", (req, res) => {
  const participants = readData();
  res.json(participants);
});

app.post("/register", (req, res) => {
  const { name, surname, activity } = req.body;
  if (!name || !surname || !activity) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const participants = readData();
  const newEntry = {
    id: Date.now().toString(), // Unique ID
    name,
    surname,
    activity
  };
  participants.push(newEntry);
  writeData(participants);
  res.status(201).json(newEntry);
});

app.delete("/participants/:id", (req, res) => {
  const idToDelete = req.params.id;
  let participants = readData();
  const initialLength = participants.length;
  participants = participants.filter(p => p.id !== idToDelete);
  if (participants.length === initialLength) {
    return res.status(404).json({ error: "Not found" });
  }
  writeData(participants);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
