// -------------------- Data Persistence --------------------
let logData = JSON.parse(localStorage.getItem("workLogs")) || [];
let activityHistory = JSON.parse(localStorage.getItem("activities")) || {};
let lastSelectedClient = null;

// -------------------- Tab Control --------------------
function showTab(tabNumber) {
  document.querySelectorAll(".tab").forEach(tab => tab.style.display = "none");
  document.getElementById("tab" + tabNumber).style.display = "block";

  document.querySelectorAll(".tab-button").forEach((btn, idx) => {
    btn.classList.toggle("active-tab-button", idx === tabNumber - 1);
  });

  if(tabNumber === 2) {
    renderClientDropdown();
    renderClientActivity();
  }
}

// -------------------- Suggestion Functions --------------------
function suggestClient() {
  const input = document.getElementById('client').value.toLowerCase();
  const box = document.getElementById('client-suggestions');

  // Only clients currently in logData
  const existingClients = [...new Set(logData.map(l => l.client))];

  const suggestions = existingClients.filter(c => c.toLowerCase().includes(input));

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
  const input = document.getElementById('activity').value.toLowerCase();
  const client = document.getElementById('client').value;
  const box = document.getElementById('activity-suggestions');

  if(!activityHistory[client]) {
    box.style.display = 'none';
    return;
  }

  const suggestions = activityHistory[client]
                        .filter(a => a.toLowerCase().includes(input));

  box.innerHTML = suggestions.map(a => `<div onclick="selectActivity('${a}')">${a}</div>`).join('');
  box.style.display = suggestions.length ? 'block' : 'none';
}

function selectActivity(activity) {
  document.getElementById('activity').value = activity;
  document.getElementById('activity-suggestions').style.display = 'none';
  checkStatusAutoSelect();
}

// -------------------- Status & Update --------------------
document.getElementById('status').addEventListener('change', function() {
  const uc = document.getElementById('update-container');
  uc.style.display = this.value === 'ongoing' ? 'block' : 'none';
  if (this.value !== 'ongoing') document.getElementById('update').value = '';
});

function checkStatusAutoSelect() {
  const client = document.getElementById('client').value;
  const activity = document.getElementById('activity').value;
  const statusInput = document.getElementById('status');
  const updateContainer = document.getElementById('update-container');

  // Auto-select On Going if Client+Activity exists in logData
  const exists = logData.some(l => l.client === client && l.activity === activity);

  if(exists) {
    statusInput.value = 'ongoing';
    updateContainer.style.display = 'block';
  } else {
    statusInput.value = 'new';
    updateContainer.style.display = 'none';
  }
}

// -------------------- Save Log --------------------
function saveLog() {
  const date = document.getElementById('date').value;
  const client = document.getElementById('client').value.trim();
  const activity = document.getElementById('activity').value.trim();
  const status = document.getElementById('status').value;
  const updateValue = document.getElementById('update').value.trim();

  if(!date || !client || !activity || !status) {
    alert("Please fill all required fields");
    return;
  }

  // Update activityHistory
  if(!activityHistory[client]) activityHistory[client] = [];
  if(!activityHistory[client].includes(activity)) activityHistory[client].push(activity);

  // Save log
  logData.push({ date, client, activity, status, update: updateValue });
  if(logData.length > 15) logData.shift(); // Keep last 15 logs

  // Persist
  localStorage.setItem("workLogs", JSON.stringify(logData));
  localStorage.setItem("activities", JSON.stringify(activityHistory));

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

// -------------------- Update History Table --------------------
function updateHistoryTable() {
  const tbody = document.getElementById('history-table').getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';

  logData.forEach((log, idx) => {
    const row = tbody.insertRow();
    row.insertCell(0).innerText = log.date;
    row.insertCell(1).innerText = log.client;
    row.insertCell(2).innerText = log.activity;
    row.insertCell(3).innerText = log.status;
    row.insertCell(4).innerText = log.update;

    const actions = row.insertCell(5);

    const editBtn = document.createElement('button');
    editBtn.innerText = 'Edit';
    editBtn.onclick = () => editLog(idx);

    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = 'Delete';
    deleteBtn.onclick = () => deleteLog(idx);

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
  });
}

// -------------------- Edit/Delete Log --------------------
function editLog(idx) {
  const log = logData[idx];
  document.getElementById('date').value = log.date;
  document.getElementById('client').value = log.client;
  document.getElementById('activity').value = log.activity;
  document.getElementById('status').value = log.status;

  if(log.status === 'ongoing') {
    document.getElementById('update-container').style.display = 'block';
    document.getElementById('update').value = log.update;
  } else {
    document.getElementById('update-container').style.display = 'none';
    document.getElementById('update').value = '';
  }

  deleteLog(idx); // remove before editing
}

function deleteLog(idx) {
  if(confirm("Are you sure?")) {
    logData.splice(idx, 1);
    localStorage.setItem("workLogs", JSON.stringify(logData));
    updateHistoryTable();
    renderClientDropdown();
    renderClientActivity();
  }
}

// -------------------- Client Dropdown & Tab 2 --------------------
function renderClientDropdown() {
  const select = document.getElementById('client-select');
  const prev = lastSelectedClient;

  // Only clients in logData
  const clients = [...new Set(logData.map(l => l.client))];
  select.innerHTML = clients.map(c => `<option value="${c}">${c}</option>`).join('');

  if(prev && clients.includes(prev)) select.value = prev;
}

function renderClientActivity() {
  const client = document.getElementById('client-select').value;
  lastSelectedClient = client;

  const tbody = document.getElementById('client-activity-table').getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';

  logData.filter(l => l.client === client).forEach(l => {
    const row = tbody.insertRow();
    row.insertCell(0).innerText = l.date;
    row.insertCell(1).innerText = l.activity;
    row.insertCell(2).innerText = l.update;
    row.insertCell(3).innerText = l.status;

    if(l.status === 'new') row.style.fontWeight = 'bold';
  });
}

// -------------------- Initialize --------------------
window.onload = function() {
  showTab(1); // default Tab 1 visible
  updateHistoryTable();
  renderClientDropdown();
  renderClientActivity();
};
