// ---------------- Work Log Data (with persistence)
let clientHistory = JSON.parse(localStorage.getItem("clients")) || [];
let activityHistory = JSON.parse(localStorage.getItem("activities")) || {};
let logData = JSON.parse(localStorage.getItem("workLogs")) || [];
let lastSelectedClient = null;

// ---------------- DOM Elements
const dateInput = document.getElementById("date");
const clientInput = document.getElementById("client");
const activityInput = document.getElementById("activity");
const statusInput = document.getElementById("status");
const updateInput = document.getElementById("update");
const updateContainer = document.getElementById("update-container");

// ---------------- Tab Switching
function showTab(tabNumber) {
  document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
  document.getElementById('tab' + tabNumber).style.display = 'block';
  document.querySelectorAll('.tab-button').forEach((btn, idx) => {
    btn.classList.toggle('active-tab-button', idx === tabNumber - 1);
  });
}

// Ensure default tab is Tab 1
window.onload = function() {
  showTab(1);
  updateHistoryTable();
  renderClientDropdown();
  renderClientActivity();
};

// ---------------- Auto-suggest Client
function suggestClient() {
  const input = clientInput.value.trim().toLowerCase();
  const suggestions = clientHistory.filter(c => c.toLowerCase().includes(input));
  const box = document.getElementById("client-suggestions");
  box.innerHTML = suggestions.map(c => `<div onclick="selectClient('${c}')">${c}</div>`).join('');
  box.style.display = suggestions.length ? 'block' : 'none';
}

function selectClient(client) {
  clientInput.value = client;
  document.getElementById("client-suggestions").style.display = 'none';
  suggestActivity(); // Show relevant activity suggestions
}

// ---------------- Auto-suggest Activity (per selected client)
function suggestActivity() {
  const input = activityInput.value.trim().toLowerCase();
  const client = clientInput.value.trim();
  if (!activityHistory[client]) return;

  const suggestions = activityHistory[client].filter(a => a.toLowerCase().includes(input));
  const box = document.getElementById("activity-suggestions");
  box.innerHTML = suggestions.map(a => `<div onclick="selectActivity('${a}')">${a}</div>`).join('');
  box.style.display = suggestions.length ? 'block' : 'none';
}

function selectActivity(activity) {
  activityInput.value = activity;
  document.getElementById("activity-suggestions").style.display = 'none';
}

// ---------------- Status toggle (show Update only if "On Going")
statusInput.addEventListener("change", function() {
  updateContainer.style.display = this.value === "ongoing" ? "block" : "none";
  if (this.value !== "ongoing") updateInput.value = "";
});

// ---------------- Save Log
function saveLog() {
  const date = dateInput.value;
  const client = clientInput.value.trim();
  const activity = activityInput.value.trim();
  const status = statusInput.value;
  const updateValue = updateInput.value.trim();

  if (!date || !client || !activity || !status) {
    alert("Please fill all required fields");
    return;
  }

  // Only add client if it already exists in data
  if (!clientHistory.includes(client)) clientHistory.push(client);

  // Add activity to client's activityHistory
  if (!activityHistory[client]) activityHistory[client] = [];
  if (!activityHistory[client].includes(activity)) activityHistory[client].push(activity);

  logData.push({ date, client, activity, status, update: updateValue });
  if (logData.length > 50) logData.shift(); // Optional limit for logs

  // Persist data
  localStorage.setItem("workLogs", JSON.stringify(logData));
  localStorage.setItem("clients", JSON.stringify(clientHistory));
  localStorage.setItem("activities", JSON.stringify(activityHistory));

  // Refresh tables/dropdowns
  updateHistoryTable();
  renderClientDropdown();
  renderClientActivity();

  // Reset form
  dateInput.value = "";
  clientInput.value = "";
  activityInput.value = "";
  statusInput.value = "new";
  updateInput.value = "";
  updateContainer.style.display = "none";
}

// ---------------- Update History Table (Tab 1)
function updateHistoryTable() {
  const tbody = document.querySelector("#history-table tbody");
  tbody.innerHTML = "";

  logData.forEach((log, index) => {
    const row = tbody.insertRow();
    row.insertCell(0).innerText = log.date;
    row.insertCell(1).innerText = log.client;
    row.insertCell(2).innerText = log.activity;
    row.insertCell(3).innerText = log.status;
    row.insertCell(4).innerText = log.update;

    // Actions
    const actions = row.insertCell(5);
    const editBtn = document.createElement("button");
    editBtn.innerText = "Edit";
    editBtn.onclick = () => editLog(index);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Delete";
    deleteBtn.onclick = () => deleteLog(index);

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
  });
}

// ---------------- Edit/Delete Log
function editLog(index) {
  const log = logData[index];
  dateInput.value = log.date;
  clientInput.value = log.client;
  activityInput.value = log.activity;
  statusInput.value = log.status;

  if (log.status === "ongoing") {
    updateContainer.style.display = "block";
    updateInput.value = log.update;
  }

  deleteLog(index); // remove before editing
}

function deleteLog(index) {
  if (confirm("Are you sure you want to delete this log?")) {
    logData.splice(index, 1);
    localStorage.setItem("workLogs", JSON.stringify(logData));
    updateHistoryTable();
    renderClientActivity();
  }
}

// ---------------- Render Client Dropdown (Tab 2)
function renderClientDropdown() {
  const select = document.getElementById("client-select");
  const prev = lastSelectedClient;

  // Only show clients that exist in the logData
  const activeClients = [...new Set(logData.map(l => l.client))];
  select.innerHTML = activeClients.map(c => `<option value="${c}">${c}</option>`).join('');

  if (prev && activeClients.includes(prev)) select.value = prev;
}

// ---------------- Render Client Activity Table (Tab 2)
function renderClientActivity() {
  const client = document.getElementById("client-select")?.value;
  if (!client) return;
  lastSelectedClient = client;

  const tbody = document.querySelector("#client-activity-table tbody");
  tbody.innerHTML = "";

  const clientLogs = logData.filter(l => l.client === client);
  clientLogs.forEach(l => {
    const row = tbody.insertRow();
    row.insertCell(0).innerText = l.date;
    row.insertCell(1).innerText = l.activity;
    row.insertCell(2).innerText = l.update;
    row.insertCell(3).innerText = l.status;

    if (l.status === "new") row.style.fontWeight = "bold";
  });
}
