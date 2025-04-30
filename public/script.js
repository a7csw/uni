const form = document.getElementById("registerForm");
const list = document.getElementById("participantList");

const API_BASE = "http://localhost:3000";

async function loadParticipants() {
  const res = await fetch(`${API_BASE}/participants`);
  const data = await res.json();
  list.innerHTML = "";
  data.forEach(addToList);
}

function addToList({ id, name, surname, activity }) {
  const li = document.createElement("li");
  li.className = "p-3 bg-gray-800 rounded animate__animated animate__fadeIn transition hover:bg-green-700 cursor-pointer flex justify-between items-center";

  const info = document.createElement("span");
  info.innerHTML = `<strong>${name} ${surname}</strong>: ${activity}`;
  li.appendChild(info);

  const savedIds = JSON.parse(localStorage.getItem("mySubmissions") || "[]");
  if (savedIds.includes(id)) {
    const delBtn = document.createElement("button");
    delBtn.innerText = "🗑️";
    delBtn.className = "ml-4 text-red-400 hover:text-red-600";
    delBtn.onclick = async () => {
      await fetch(`${API_BASE}/participants/${id}`, { method: "DELETE" });
      li.remove();
    };
    li.title = "Click trash icon to delete";
    li.appendChild(delBtn);
  }

  list.appendChild(li);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const surname = document.getElementById("surname").value;
  const activity = document.getElementById("activity").value;

  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, surname, activity }),
  });

  if (res.ok) {
    const newParticipant = await res.json();
    const saved = JSON.parse(localStorage.getItem("mySubmissions") || "[]");
    saved.push(newParticipant.id);
    localStorage.setItem("mySubmissions", JSON.stringify(saved));
    addToList(newParticipant);
    form.reset();
  }
});

loadParticipants();
