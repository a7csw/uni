document.getElementById('registrationForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('firstName').value.trim();
  const surname = document.getElementById('surname').value.trim();
  const activity = document.getElementById('activity').value.trim();

  if (!name || !surname || !activity) return;

  try {
    const res = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, surname, activity })
    });

    const result = await res.json();
    if (res.ok) {
      loadParticipants();
      e.target.reset();
    } else {
      alert(result.error || 'Failed to register.');
    }
  } catch (error) {
    console.error('Submit error:', error);
    alert('Something went wrong.');
  }
});

async function loadParticipants() {
  try {
    const res = await fetch('/participants');
    const participants = await res.json();

    const list = document.getElementById('participantsList');
    list.innerHTML = '';

    participants.forEach(p => {
      const li = document.createElement('li');
      li.className = 'bg-gray-700 p-3 rounded flex justify-between items-center';

      li.innerHTML = `
        <span><strong>${p.name} ${p.surname}:</strong> ${p.activity}</span>
        <button onclick="deleteParticipant('${p._id}')" class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs">Delete</button>
      `;
      list.appendChild(li);
    });
  } catch (error) {
    console.error('Load error:', error);
  }
}

async function deleteParticipant(id) {
  if (!confirm('Are you sure you want to delete this entry?')) return;

  try {
    const res = await fetch(`/participants/${id}`, { method: 'DELETE' });
    const result = await res.json();

    if (res.ok && result.success) {
      loadParticipants();
    } else {
      alert(result.error || 'Failed to delete participant.');
    }
  } catch (error) {
    console.error('Delete error:', error);
  }
}

window.onload = loadParticipants;
