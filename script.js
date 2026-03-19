// ---------------- Tab 1 Data with persistence
let clientHistory = JSON.parse(localStorage.getItem("clients")) || [];
let activityHistory = JSON.parse(localStorage.getItem("activities")) || {};
let logData = JSON.parse(localStorage.getItem("workLogs")) || [];
let lastSelectedClient = null;

// Initialize the UI
updateHistoryTable();
renderClientDropdown();
renderClientActivity();
renderClientSuggestions();

// ---------------- Suggestions functions
function suggestClient() {
  const input = document.getElementById('client').value.toLowerCase();
  const box = document.getElementById('client-suggestions');

  const suggestions = clientHistory.filter(c => c.toLowerCase().includes(input));
  box.innerHTML = suggestions.map(c => `<div onclick="selectClient('${c}')">${c}</div>`).join('');
  box.style.display = suggestions.length ? 'block' : 'none';

  autoSelectStatus();
}

function selectClient(client) {
  document.getElementById('client').value = client;
  document.getElementById('client-suggestions').style.display = 'none';
  suggestActivity();
  autoSelectStatus();
}

function suggestActivity() {
  const input = document.getElementById('activity').value.toLowerCase();
  const client = document.getElementById('client').value;
  const box = document.getElementById('activity-suggestions');

  if (activityHistory[client]) {
    const suggestions = activityHistory[client].filter(a => a.toLowerCase().includes(input));
    box.innerHTML = suggestions.map(a => `<div onclick="selectActivity('${a}')">${a}</div>`).join('');
    box.style.display = suggestions.length ? 'block' : 'none';
  } else {
    box.style.display = 'none';
  }

  autoSelectStatus();
}

function selectActivity(activity) {
  document.getElementById('activity').value = activity;
  document.getElementById('activity-suggestions').style.display = 'none';
  autoSelectStatus();
}

// ---------------- Auto-select "On Going" if client + activity exists
function autoSelectStatus() {
  const client = document.getElementById('client').value.trim();
  const activity = document.getElementById('activity').value.trim();
  const statusInput = document.getElementById('status');
  const updateContainer = document.getElementById('update-container');

  const match = logData.find(log => log.client === client && log.activity === activity);

  if (match) {
    statusInput.value = 'ongoing';
    updateContainer.style.display = 'block';
    document.getElementById('update').value = match.update || '';
  } else {
    statusInput.value = 'new';
    updateContainer.style.display = 'none';
    document.getElementById('update').value = '';
  }
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

  localStorage.setItem('workLogs', JSON.stringify(logData));
  localStorage.setItem('clients', JSON.stringify(clientHistory));
  localStorage.setItem('activities', JSON.stringify(activityHistory));

  updateHistoryTable();
  renderClientDropdown();
  renderClientActivity();

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
    const editBtn = document.createElement('button');
    editBtn.innerText = 'Edit';
    editBtn.onclick = () => editLog(index);

    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = 'Delete';
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
  autoSelectStatus();
  deleteLog(index);
}

function deleteLog(index) {
  if (confirm('Are you sure?')) {
    logData.splice(index, 1);
    localStorage.setItem('workLogs', JSON.stringify(logData));
    updateHistoryTable();
    renderClientActivity();
    renderClientDropdown();
  }
}

// ---------------- Client Activity tab
function renderClientDropdown() {
  const select = document.getElementById('client-select');
  const prev = lastSelectedClient;
  const activeClients = [...new Set(logData.map(l => l.client))];
  select.innerHTML = activeClients.map(c => `<option value="${c}">${c}</option>`).join('');
  if (prev && activeClients.includes(prev)) select.value = prev;
  lastSelectedClient = select.value;
}

function renderClientActivity() {
  const client = document.getElementById('client-select').value;
  lastSelectedClient = client;
  const tbody = document.getElementById('client-activity-table').getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';
  const clientLogs = logData.filter(l => l.client === client);

  clientLogs.forEach(l => {
    const row = tbody.insertRow();
    row.insertCell(0).innerText = l.date;
    row.insertCell(1).innerText = l.activity;
    row.insertCell(2).innerText = l.update;
    row.insertCell(3).innerText = l.status;
    if (l.status === 'new') row.style.fontWeight = 'bold';
  });
}

// ---------------- Initialize client suggestions on load
function renderClientSuggestions() {
  const input = document.getElementById('client');
  const box = document.getElementById('client-suggestions');
  box.innerHTML = clientHistory.map(c => `<div onclick="selectClient('${c}')">${c}</div>`).join('');
  box.style.display = 'none';
}
