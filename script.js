// ---------------- Tab 1 Data with persistence
let clientHistory = JSON.parse(localStorage.getItem("clients")) || [];
let activityHistory = JSON.parse(localStorage.getItem("activities")) || {};
let logData = JSON.parse(localStorage.getItem("workLogs")) || [];
let lastSelectedClient = null;

// Initialize UI
showTab(1); // Default: Tab 1 visible
updateHistoryTable();
renderClientDropdown();
renderClientActivity();

// ---------------- Tabs toggle
function showTab(n) {
  document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
  document.getElementById('tab' + n).style.display = 'block';

  document.querySelectorAll('.tab-button').forEach((btn, i) => {
    btn.classList.remove('active-tab-button');
    if (i === n - 1) btn.classList.add('active-tab-button');
  });

  if (n === 2) renderClientDropdown();
  if (n === 2) renderClientActivity();
}

// ---------------- Suggestions
function suggestClient() {
  const input = document.getElementById('client').value.toLowerCase();
  const box = document.getElementById('client-suggestions');

  // Only suggest clients that exist in logs
  const activeClients = [...new Set(logData.map(log => log.client))];
  const suggestions = activeClients.filter(c => c.toLowerCase().includes(input));

  box.innerHTML = suggestions.map(c => `<div onclick="selectClient('${c}')">${c}</div>`).join('');
  box.style.display = suggestions.length ? 'block' : 'none';
}

function selectClient(client) {
  document.getElementById('client').value = client;
  document.getElementById('client-suggestions').style.display = 'none';
  suggestActivity();
}

function suggestActivity() {
  const input = document.getElementById('activity').value.toLowerCase();
  const client = document.getElementById('client').value;

  if (activityHistory[client]) {
    const suggestions = activityHistory[client].filter(a => a.toLowerCase().includes(input));
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
    alert('Please fill all required fields');
    return;
  }

  // Add client and activity to history
  if (!clientHistory.includes(client)) clientHistory.push(client);
  if (!activityHistory[client]) activityHistory[client] = [];
  if (!activityHistory[client].includes(activity)) activityHistory[client].push(activity);

  // Add log
  logData.push({ date, client, activity, status, update: updateValue });
  if (logData.length > 15) logData.shift(); // Keep last 15 logs

  // Persist
  localStorage.setItem('workLogs', JSON.stringify(logData));
  localStorage.setItem('clients', JSON.stringify(clientHistory));
  localStorage.setItem('activities', JSON.stringify(activityHistory));

  // Update UI
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
  document.getElementById('status').value = log.status;
  if (log.status === 'ongoing') {
    document.getElementById('update-container').style.display = 'block';
    document.getElementById('update').value = log.update;
  }
  deleteLog(index);
}

function deleteLog(index) {
  if (confirm('Are you sure you want to delete this log?')) {
    logData.splice(index, 1);
    localStorage.setItem('workLogs', JSON.stringify(logData));
    updateHistoryTable();
    renderClientDropdown();
    renderClientActivity();
  }
}

// ---------------- Client Activity Tab
function renderClientDropdown() {
  const select = document.getElementById('client-select');
  const prev = lastSelectedClient;

  // Only include clients that exist in logs
  const activeClients = [...new Set(logData.map(log => log.client))];

  select.innerHTML = activeClients.map(c => `<option value="${c}">${c}</option>`).join('');
  if (prev && activeClients.includes(prev)) {
    select.value = prev;
  } else if (activeClients.length > 0) {
    select.value = activeClients[0];
    lastSelectedClient = activeClients[0];
  } else {
    select.innerHTML = '';
    lastSelectedClient = null;
  }
}

function renderClientActivity() {
  if (!lastSelectedClient) return;
  const client = lastSelectedClient;
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
