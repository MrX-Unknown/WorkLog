// ---------------- Tab 1 Data with persistence
let clientHistory = JSON.parse(localStorage.getItem("clients")) || [];
let activityHistory = JSON.parse(localStorage.getItem("activities")) || {};
let logData = JSON.parse(localStorage.getItem("workLogs")) || [];
let lastSelectedClient = null;

// Initialize the UI with persisted data
updateHistoryTable();
renderClientDropdown();
renderClientActivity();

// ---------------- Suggestions functions
function suggestClient() {
  const input = document.getElementById('client').value;
  const suggestions = clientHistory.filter(c => c.toLowerCase().includes(input.toLowerCase()));
  const box = document.getElementById('client-suggestions');
  box.innerHTML = suggestions.map(c => `<div onclick="selectClient('${c}')">${c}</div>`).join('');
  box.style.display = suggestions.length ? 'block' : 'none';
}

function selectClient(client) {
  document.getElementById('client').value = client;
  document.getElementById('client-suggestions').style.display = 'none';
  suggestActivity(); // Show relevant activity suggestions
}

function suggestActivity() {
  const input = document.getElementById('activity').value;
  const client = document.getElementById('client').value;
  if (activityHistory[client]) {
    const suggestions = activityHistory[client].filter(a => a.toLowerCase().includes(input.toLowerCase()));
    const box = document.getElementById('activity-suggestions');
    box.innerHTML = suggestions.map(a => `<div onclick="selectActivity('${a}')">${a}</div>`).join('');
    box.style.display = suggestions.length ? 'block' : 'none';
  }
}

function selectActivity(activity) {
  document.getElementById('activity').value = activity;
  document.getElementById('activity-suggestions').style.display = 'none';
}

// ---------------- Status toggle
document.getElementById('status').addEventListener('change', function() {
  const uc = document.getElementById('update-container');
  uc.style.display = this.value === 'ongoing' ? 'block' : 'none';
  if (this.value !== 'ongoing') document.getElementById('update').value = '';
});

// ---------------- Save log
function saveLog() {
  const date = document.getElementById('date').value;
  const client = document.getElementById('client').value.trim();
  const activity = document.getElementById('activity').value.trim();
  const status = document.getElementById('status').value;
  const updateValue = document.getElementById('update').value.trim();

  if (!date || !client || !activity || !status) {
    alert('Please fill all fields');
    return;
  }

  if (!clientHistory.includes(client)) clientHistory.push(client);
  if (!activityHistory[client]) activityHistory[client] = [];
  if (!activityHistory[client].includes(activity)) activityHistory[client].push(activity);

  logData.push({ date, client, activity, status, update: updateValue });
  if (logData.length > 15) logData.shift(); // Keep last 15 logs

  // Persist everything
  localStorage.setItem('workLogs', JSON.stringify(logData));
  localStorage.setItem('clients', JSON.stringify(clientHistory));
  localStorage.setItem('activities', JSON.stringify(activityHistory));

  updateHistoryTable();
  renderClientDropdown();

  // Reset form
  document.getElementById('date').value = '';
  document.getElementById('client').value = '';
  document.getElementById('activity').value = '';
  document.getElementById('status').value = 'new';
  document.getElementById('update').value = '';
  document.getElementById('update-container').style.display = 'none';
}

// ---------------- Update history table
function updateHistoryTable() {
  const tbody = document.getElementById('history-table').getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';
  logData.forEach((log, index) => {
    const row = tbody.insertRow();
    row.insertCell(0).innerText = log.date;
    row.insertCell(1).innerText = log.client;
    row.insertCell(2).innerText = log.activity;
    row.insertCell(3).innerText = log.status;
    row.insertCell(4).innerText = log.update;

    const actions = row.insertCell(5);
    actions.classList.add('action-buttons');

    const editBtn = document.createElement('button');
    editBtn.innerText = 'Edit';
    editBtn.classList.add('edit-button');
    editBtn.onclick = () => editLog(index);

    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = 'Delete';
    deleteBtn.classList.add('delete-button');
    deleteBtn.onclick = () => deleteLog(index);

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
  });
}

// ---------------- Edit/Delete
function editLog(index) {
  const log = logData[index];
  document.getElementById('date').value = log.date;
  document.getElementById('client').value = log.client;
  document.getElementById('activity').value = log.activity;
  document.getElementById('status').value = log.status;

  if (log.status === 'ongoing') {
    document.getElementById('update-container').style.display = 'block';
    document.getElementById('update').value = log.update;
  }

  deleteLog(index); // Remove before editing
}

function deleteLog(index) {
  if (confirm('Are you sure?')) {
    logData.splice(index, 1);
    // Persist after deletion
    localStorage.setItem('workLogs', JSON.stringify(logData));
    updateHistoryTable();
    renderClientActivity();
  }
}

// ---------------- Client Activity tab
function renderClientDropdown() {
  const select = document.getElementById('client-select');
  const prev = lastSelectedClient;
  select.innerHTML = clientHistory.map(c => `<option value="${c}">${c}</option>`).join('');
  if (prev) select.value = prev;
}

function renderClientActivity() {
  const client = document.getElementById('client-select').value;
  lastSelectedClient = client;
  const tbody = document.getElementById('client-activity-table').getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';
  const clientLogs = logData.filter(l => l.client === client);

  const grouped = {};
  clientLogs.forEach(l => {
    if (!grouped[l.activity]) grouped[l.activity] = [];
    grouped[l.activity].push(l);
  });

  Object.keys(grouped).forEach(act => {
    grouped[act].forEach(l => {
      const row = tbody.insertRow();
      row.insertCell(0).innerText = l.date;
      row.insertCell(1).innerText = l.activity;
      row.insertCell(2).innerText = l.update;
      row.insertCell(3).innerText = l.status;

      if (l.status === 'new') row.style.fontWeight = 'bold';
    });
  });
}

// ---------------- Tabs toggle
let lastTap = 0;
function toggleTab() {
  const tab1 = document.getElementById('tab1');
  const tab2 = document.getElementById('tab2');
  if (tab1.style.display !== 'none') {
    tab1.style.display = 'none';
    tab2.style.display = 'block';
    renderClientDropdown();
    renderClientActivity();
  } else {
    tab1.style.display = 'block';
    tab2.style.display = 'none';
  }
}
document.addEventListener('dblclick', toggleTab);
document.addEventListener('pointerdown', e => {
  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTap;
  if (tapLength < 1000 && tapLength > 0) {
    toggleTab();
    e.preventDefault();
  }
  lastTap = currentTime;
});

// ---------------- Add client manually
function addClient() {
  const clientInput = document.getElementById('client');
  const clientName = clientInput.value.trim();
  if (clientName && !clientHistory.includes(clientName)) {
    clientHistory.push(clientName);
    localStorage.setItem('clients', JSON.stringify(clientHistory));
    suggestClient(); 
    clientInput.value = '';
  } else {
    alert("Client is either empty or already added!");
  }
}
