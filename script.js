// ---------------- DATA AND STORAGE ----------------
let clientHistory = JSON.parse(localStorage.getItem("clients")) || [];
let activityHistory = JSON.parse(localStorage.getItem("activities")) || {};
let logData = JSON.parse(localStorage.getItem("workLogs")) || [];
let lastSelectedClient = null;

// ---------------- INITIALIZE UI ----------------
window.onload = () => {
  // Show only Tab 1 initially
  document.querySelectorAll('.tab').forEach((tab, i) => {
    tab.style.display = (i === 0) ? 'block' : 'none';
  });

  // Highlight first tab button
  document.querySelectorAll('.tab-button').forEach((btn, i) => {
    btn.classList.toggle('active-tab-button', i === 0);
  });

  updateHistoryTable();
  renderClientDropdown();
  renderClientActivity();
};

// ---------------- TAB SWITCH ----------------
function showTab(tabNumber) {
  document.querySelectorAll('.tab').forEach((tab, i) => {
    tab.style.display = (i === tabNumber - 1) ? 'block' : 'none';
  });

  document.querySelectorAll('.tab-button').forEach((btn, i) => {
    btn.classList.toggle('active-tab-button', i === tabNumber - 1);
  });

  if (tabNumber === 2) renderClientActivity();
}

// ---------------- CLIENT SUGGESTIONS ----------------
function suggestClient() {
  const input = document.getElementById('client').value.trim();
  const box = document.getElementById('client-suggestions');
  if (!input) {
    box.style.display = 'none';
    return;
  }

  const suggestions = clientHistory.filter(c => c.toLowerCase().includes(input.toLowerCase()));
  box.innerHTML = suggestions.map(c => `<div onclick="selectClient('${c}')">${c}</div>`).join('');
  box.style.display = suggestions.length ? 'block' : 'none';
}

function selectClient(client) {
  document.getElementById('client').value = client;
  document.getElementById('client-suggestions').style.display = 'none';
  suggestActivity(); // update activity suggestions for selected client
}

// ---------------- ACTIVITY SUGGESTIONS ----------------
function suggestActivity() {
  const input = document.getElementById('activity').value.trim();
  const client = document.getElementById('client').value.trim();
  const box = document.getElementById('activity-suggestions');

  if (!client || !activityHistory[client]) {
    box.style.display = 'none';
    return;
  }

  const suggestions = activityHistory[client].filter(a => a.toLowerCase().includes(input.toLowerCase()));
  box.innerHTML = suggestions.map(a => `<div onclick="selectActivity('${a}')">${a}</div>`).join('');
  box.style.display = suggestions.length ? 'block' : 'none';
}

function selectActivity(activity) {
  document.getElementById('activity').value = activity;
  document.getElementById('activity-suggestions').style.display = 'none';
}

// ---------------- STATUS / UPDATE BOX ----------------
document.getElementById('status').addEventListener('change', () => {
  const uc = document.getElementById('update-container');
  const status = document.getElementById('status').value;
  uc.style.display = (status === 'ongoing') ? 'block' : 'none';
  if (status !== 'ongoing') document.getElementById('update').value = '';
});

// ---------------- SAVE LOG ----------------
function saveLog() {
  const date = document.getElementById('date').value;
  const client = document.getElementById('client').value.trim();
  const activity = document.getElementById('activity').value.trim();
  const status = document.getElementById('status').value;
  const updateVal = document.getElementById('update').value.trim();

  if (!date || !client || !activity || !status) {
    alert('Please fill all required fields.');
    return;
  }

  // Add client and activity to history
  if (!clientHistory.includes(client)) clientHistory.push(client);
  if (!activityHistory[client]) activityHistory[client] = [];
  if (!activityHistory[client].includes(activity)) activityHistory[client].push(activity);

  // Save log
  logData.push({ date, client, activity, status, update: updateVal });
  if (logData.length > 15) logData.shift(); // Keep only last 15 logs

  persistData();
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

// ---------------- HISTORY TABLE ----------------
function updateHistoryTable() {
  const tbody = document.getElementById('history-table').getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';

  logData.forEach((log, i) => {
    const row = tbody.insertRow();
    row.insertCell(0).innerText = log.date;
    row.insertCell(1).innerText = log.client;
    row.insertCell(2).innerText = log.activity;
    row.insertCell(3).innerText = log.status;
    row.insertCell(4).innerText = log.update;

    const actions = row.insertCell(5);
    const editBtn = document.createElement('button');
    editBtn.innerText = 'Edit';
    editBtn.onclick = () => editLog(i);
    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = 'Delete';
    deleteBtn.onclick = () => deleteLog(i);

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
  });
}

// ---------------- EDIT / DELETE ----------------
function editLog(index) {
  const log = logData[index];
  document.getElementById('date').value = log.date;
  document.getElementById('client').value = log.client;
  document.getElementById('activity').value = log.activity;
  document.getElementById('status').value = log.status;
  if (log.status === 'ongoing') {
    document.getElementById('update-container').style.display = 'block';
    document.getElementById('update').value = log.update;
  } else {
    document.getElementById('update-container').style.display = 'none';
    document.getElementById('update').value = '';
  }
  deleteLog(index); // Remove before editing
}

function deleteLog(index) {
  if (!confirm('Are you sure you want to delete this log?')) return;
  logData.splice(index, 1);
  persistData();
  updateHistoryTable();
  renderClientActivity();
}

// ---------------- CLIENT LOG TAB ----------------
function renderClientDropdown() {
  const select = document.getElementById('client-select');
  const prev = lastSelectedClient;
  // Only show clients that exist in logData
  const activeClients = [...new Set(logData.map(l => l.client))];
  select.innerHTML = activeClients.map(c => `<option value="${c}">${c}</option>`).join('');
  if (prev && activeClients.includes(prev)) select.value = prev;
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

// ---------------- PERSIST DATA ----------------
function persistData() {
  localStorage.setItem('workLogs', JSON.stringify(logData));
  localStorage.setItem('clients', JSON.stringify(clientHistory));
  localStorage.setItem('activities', JSON.stringify(activityHistory));
}
