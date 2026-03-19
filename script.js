// ---------------- Initial Data with persistence ----------------
let clientHistory = JSON.parse(localStorage.getItem("clients")) || [];
let activityHistory = JSON.parse(localStorage.getItem("activities")) || {};
let logData = JSON.parse(localStorage.getItem("workLogs")) || [];
let lastSelectedClient = null;

// ---------------- Tabs ----------------
function showTab(n) {
  document.querySelectorAll(".tab").forEach(t => t.style.display = "none");
  document.getElementById("tab" + n).style.display = "block";

  document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active-tab-button"));
  document.querySelectorAll(".tab-button")[n - 1].classList.add("active-tab-button");
}

// Show Tab 1 by default
document.addEventListener("DOMContentLoaded", () => showTab(1));

// ---------------- Client Auto-Suggest ----------------
function suggestClient() {
  const input = document.getElementById('client').value.toLowerCase();
  const box = document.getElementById('client-suggestions');

  const suggestions = clientHistory.filter(c => c.toLowerCase().includes(input));
  box.innerHTML = suggestions.map(c => `<div onclick="selectClient('${c}')">${c}</div>`).join('');
  box.style.display = suggestions.length ? "block" : "none";
}

function selectClient(client) {
  document.getElementById('client').value = client;
  document.getElementById('client-suggestions').style.display = 'none';
  suggestActivity();
}

// ---------------- Activity Auto-Suggest ----------------
function suggestActivity() {
  const input = document.getElementById('activity').value.toLowerCase();
  const client = document.getElementById('client').value;

  if (!activityHistory[client]) return;

  const suggestions = activityHistory[client].filter(a => a.toLowerCase().includes(input));
  const box = document.getElementById('activity-suggestions');
  box.innerHTML = suggestions.map(a => `<div onclick="selectActivity('${a}')">${a}</div>`).join('');
  box.style.display = suggestions.length ? "block" : "none";
}

function selectActivity(activity) {
  document.getElementById('activity').value = activity;
  document.getElementById('activity-suggestions').style.display = 'none';
}

// ---------------- Status -> Show Update Box ----------------
document.getElementById('status').addEventListener('change', function() {
  const updateBox = document.getElementById('update-container');
  updateBox.style.display = (this.value === 'ongoing') ? 'block' : 'none';
  if (this.value !== 'ongoing') document.getElementById('update').value = '';
});

// ---------------- Save Log ----------------
function saveLog() {
  const date = document.getElementById('date').value;
  const client = document.getElementById('client').value.trim();
  const activity = document.getElementById('activity').value.trim();
  const status = document.getElementById('status').value;
  const updateVal = document.getElementById('update').value.trim();

  if (!date || !client || !activity || !status) {
    alert("Please fill all required fields.");
    return;
  }

  if (!clientHistory.includes(client)) clientHistory.push(client);
  if (!activityHistory[client]) activityHistory[client] = [];
  if (!activityHistory[client].includes(activity)) activityHistory[client].push(activity);

  logData.push({ date, client, activity, status, update: updateVal });

  localStorage.setItem("clients", JSON.stringify(clientHistory));
  localStorage.setItem("activities", JSON.stringify(activityHistory));
  localStorage.setItem("workLogs", JSON.stringify(logData));

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

// ---------------- Update History Table ----------------
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
    editBtn.classList.add('edit-button');
    editBtn.innerText = 'Edit';
    editBtn.onclick = () => editLog(i);

    const delBtn = document.createElement('button');
    delBtn.classList.add('delete-button');
    delBtn.innerText = 'Delete';
    delBtn.onclick = () => deleteLog(i);

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
  });
}

// ---------------- Edit / Delete ----------------
function editLog(i) {
  const log = logData[i];
  document.getElementById('date').value = log.date;
  document.getElementById('client').value = log.client;
  document.getElementById('activity').value = log.activity;
  document.getElementById('status').value = log.status;
  if (log.status === 'ongoing') {
    document.getElementById('update-container').style.display = 'block';
    document.getElementById('update').value = log.update;
  }
  deleteLog(i);
}

function deleteLog(i) {
  if (!confirm("Are you sure you want to delete this log?")) return;
  logData.splice(i, 1);
  localStorage.setItem("workLogs", JSON.stringify(logData));
  updateHistoryTable();
  renderClientActivity();
}

// ---------------- Client Log Tab ----------------
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
  const logs = logData.filter(l => l.client === client);
  logs.forEach(log => {
    const row = tbody.insertRow();
    row.insertCell(0).innerText = log.date;
    row.insertCell(1).innerText = log.activity;
    row.insertCell(2).innerText = log.update;
    row.insertCell(3).innerText = log.status;

    if (log.status === 'new') row.style.fontWeight = 'bold';
  });
}

// ---------------- Load Data on Start ----------------
document.addEventListener('DOMContentLoaded', () => {
  updateHistoryTable();
  renderClientDropdown();
  renderClientActivity();
});
