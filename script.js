// ---------------- Data with persistence
let clientHistory = JSON.parse(localStorage.getItem("clients")) || [];
let activityHistory = JSON.parse(localStorage.getItem("activities")) || {};
let logData = JSON.parse(localStorage.getItem("workLogs")) || [];
let lastSelectedClient = null;

// ---------------- Initialize
function init() {
  showTab(1); // Only Tab 1 visible on load
  updateHistoryTable();
  renderClientDropdown();
  renderClientActivity();
  checkStatusAutoSelect();
}
window.addEventListener('DOMContentLoaded', init);

// ---------------- Tabs
function showTab(tabNumber) {
  const tabs = document.querySelectorAll('.tab');
  const tabButtons = document.querySelectorAll('.tab-button');

  tabs.forEach((t, i) => t.style.display = i === tabNumber - 1 ? 'block' : 'none');
  tabButtons.forEach((btn, i) => btn.classList.toggle('active-tab-button', i === tabNumber - 1));
}

// ---------------- Suggestions
function suggestClient() {
  const input = document.getElementById('client').value.toLowerCase();
  const box = document.getElementById('client-suggestions');
  const suggestions = clientHistory.filter(c => c.toLowerCase().includes(input));
  box.innerHTML = suggestions.map(c => `<div onclick="selectClient('${c}')">${c}</div>`).join('');
  box.style.display = suggestions.length ? 'block' : 'none';
}

function selectClient(client) {
  document.getElementById('client').value = client;
  document.getElementById('client-suggestions').style.display = 'none';
  suggestActivity();
  checkStatusAutoSelect();
}

function suggestActivity() {
  const client = document.getElementById('client').value;
  const input = document.getElementById('activity').value.toLowerCase();
  const box = document.getElementById('activity-suggestions');
  if (activityHistory[client]) {
    const suggestions = activityHistory[client].filter(a => a.toLowerCase().includes(input));
    box.innerHTML = suggestions.map(a => `<div onclick="selectActivity('${a}')">${a}</div>`).join('');
    box.style.display = suggestions.length ? 'block' : 'none';
  } else {
    box.innerHTML = '';
    box.style.display = 'none';
  }
}

function selectActivity(activity) {
  document.getElementById('activity').value = activity;
  document.getElementById('activity-suggestions').style.display = 'none';
  checkStatusAutoSelect();
}

// ---------------- Status toggle
const statusInput = document.getElementById('status');
statusInput.addEventListener('change', () => {
  const uc = document.getElementById('update-container');
  uc.style.display = statusInput.value === 'ongoing' ? 'block' : 'none';
  if (statusInput.value !== 'ongoing') document.getElementById('update').value = '';
});

// ---------------- Save log
function saveLog() {
  const date = document.getElementById('date').value;
  const client = document.getElementById('client').value.trim();
  const activity = document.getElementById('activity').value.trim();
  const status = statusInput.value;
  const updateValue = document.getElementById('update').value.trim();

  if (!date || !client || !activity) { alert('Please fill all fields'); return; }

  if (!clientHistory.includes(client)) clientHistory.push(client);
  if (!activityHistory[client]) activityHistory[client] = [];
  if (!activityHistory[client].includes(activity)) activityHistory[client].push(activity);

  logData.push({ date, client, activity, status, update: updateValue });

  // Persist
  localStorage.setItem('workLogs', JSON.stringify(logData));
  localStorage.setItem('clients', JSON.stringify(clientHistory));
  localStorage.setItem('activities', JSON.stringify(activityHistory));

  updateHistoryTable();
  renderClientDropdown();
  renderClientActivity();

  document.getElementById('date').value = '';
  document.getElementById('client').value = '';
  document.getElementById('activity').value = '';
  statusInput.value = 'new';
  document.getElementById('update').value = '';
  document.getElementById('update-container').style.display = 'none';
}

// ---------------- Update history table
function updateHistoryTable() {
  const tbody = document.querySelector("#history-table tbody");
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
    const delBtn = document.createElement('button');
    delBtn.innerText = 'Delete';
    delBtn.onclick = () => deleteLog(index);

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
  });
}

// ---------------- Edit/Delete
function editLog(index) {
  const log = logData[index];
  document.getElementById('date').value = log.date;
  document.getElementById('client').value = log.client;
  document.getElementById('activity').value = log.activity;
  statusInput.value = log.status;
  statusInput.dispatchEvent(new Event('change'));
  document.getElementById('update').value = log.update;
  logData.splice(index, 1);
  updateHistoryTable();
  renderClientActivity();
}

function deleteLog(index) {
  if (!confirm('Are you sure?')) return;
  logData.splice(index, 1);
  localStorage.setItem('workLogs', JSON.stringify(logData));
  updateHistoryTable();
  renderClientActivity();
}

// ---------------- Client Activity Tab
function renderClientDropdown() {
  const select = document.getElementById('client-select');
  const prev = lastSelectedClient;
  const clientsInData = [...new Set(logData.map(l => l.client))];
  select.innerHTML = clientsInData.map(c => `<option value="${c}">${c}</option>`).join('');
  if (prev && clientsInData.includes(prev)) select.value = prev;
}

function renderClientActivity() {
  const client = document.getElementById('client-select').value;
  lastSelectedClient = client;
  const tbody = document.querySelector("#client-activity-table tbody");
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

// ---------------- Status auto-select if client+activity exists
function checkStatusAutoSelect() {
  const client = document.getElementById('client').value.trim();
  const activity = document.getElementById('activity').value.trim();
  const status = logData.find(l => l.client === client && l.activity === activity);
  if (status) {
    statusInput.value = 'ongoing';
    statusInput.dispatchEvent(new Event('change'));
  } else {
    statusInput.value = 'new';
    statusInput.dispatchEvent(new Event('change'));
  }
}
