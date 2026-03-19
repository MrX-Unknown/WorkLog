// ---------------- DOM Elements ----------------
const dateInput = document.getElementById("date");
const clientInput = document.getElementById("client");
const activityInput = document.getElementById("activity");
const statusInput = document.getElementById("status");
const updateInput = document.getElementById("update");
const updateContainer = document.getElementById("update-container");

let logData = JSON.parse(localStorage.getItem("workLogs")) || [];
let activityHistory = JSON.parse(localStorage.getItem("activities")) || {};
let lastSelectedClient = null;

// ---------------- Tabs ----------------
function showTab(tabNumber) {
  const tabs = document.querySelectorAll(".tab");
  const buttons = document.querySelectorAll(".tab-button");

  tabs.forEach((tab) => (tab.style.display = "none"));
  buttons.forEach((btn) => btn.classList.remove("active-tab-button"));

  document.getElementById("tab" + tabNumber).style.display = "block";
  buttons[tabNumber - 1].classList.add("active-tab-button");
}

// Default: show Tab 1
showTab(1);

// ---------------- Client Auto-suggest ----------------
function suggestClient() {
  const input = clientInput.value.trim().toLowerCase();

  // Only clients in current logs
  const existingClients = [...new Set(logData.map((l) => l.client))];

  const suggestions = existingClients.filter((c) =>
    c.toLowerCase().includes(input)
  );
  const box = document.getElementById("client-suggestions");
  box.innerHTML = suggestions
    .map((c) => `<div onclick="selectClient('${c}')">${c}</div>`)
    .join("");
  box.style.display = suggestions.length ? "block" : "none";
}

function selectClient(client) {
  clientInput.value = client;
  document.getElementById("client-suggestions").style.display = "none";
  suggestActivity();
}

// ---------------- Activity Auto-suggest ----------------
function suggestActivity() {
  const input = activityInput.value.trim().toLowerCase();
  const client = clientInput.value.trim();

  if (!activityHistory[client]) return;

  const suggestions = activityHistory[client].filter((a) =>
    a.toLowerCase().includes(input)
  );

  const box = document.getElementById("activity-suggestions");
  box.innerHTML = suggestions
    .map((a) => `<div onclick="selectActivity('${a}')">${a}</div>`)
    .join("");
  box.style.display = suggestions.length ? "block" : "none";
}

function selectActivity(activity) {
  activityInput.value = activity;
  document.getElementById("activity-suggestions").style.display = "none";
}

// ---------------- Status toggle ----------------
statusInput.addEventListener("change", () => {
  if (statusInput.value === "ongoing") {
    updateContainer.style.display = "block";
  } else {
    updateContainer.style.display = "none";
    updateInput.value = "";
  }
});

// ---------------- Save log ----------------
function saveLog() {
  const date = dateInput.value.trim();
  const client = clientInput.value.trim();
  const activity = activityInput.value.trim();
  const status = statusInput.value;
  const updateValue = updateInput.value.trim();

  if (!date || !client || !activity || !status) {
    alert("Please fill all required fields");
    return;
  }

  // Save activity for the client
  if (!activityHistory[client]) activityHistory[client] = [];
  if (!activityHistory[client].includes(activity))
    activityHistory[client].push(activity);

  logData.push({ date, client, activity, status, update: updateValue });

  // Keep last 15 logs
  if (logData.length > 15) logData.shift();

  // Persist
  localStorage.setItem("workLogs", JSON.stringify(logData));
  localStorage.setItem("activities", JSON.stringify(activityHistory));

  // Update UI
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

// ---------------- Update history table ----------------
function updateHistoryTable() {
  const tbody = document
    .getElementById("history-table")
    .getElementsByTagName("tbody")[0];
  tbody.innerHTML = "";

  logData.forEach((log, index) => {
    const row = tbody.insertRow();
    row.insertCell(0).innerText = log.date;
    row.insertCell(1).innerText = log.client;
    row.insertCell(2).innerText = log.activity;
    row.insertCell(3).innerText = log.status;
    row.insertCell(4).innerText = log.update;

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

// ---------------- Edit / Delete ----------------
function editLog(index) {
  const log = logData[index];

  dateInput.value = log.date;
  clientInput.value = log.client;
  activityInput.value = log.activity;
  statusInput.value = log.status;

  if (log.status === "ongoing") {
    updateContainer.style.display = "block";
    updateInput.value = log.update;
  } else {
    updateContainer.style.display = "none";
    updateInput.value = "";
  }

  deleteLog(index);
}

function deleteLog(index) {
  if (confirm("Are you sure?")) {
    logData.splice(index, 1);
    localStorage.setItem("workLogs", JSON.stringify(logData));
    updateHistoryTable();
    renderClientActivity();
  }
}

// ---------------- Client Log Tab ----------------
function renderClientDropdown() {
  const select = document.getElementById("client-select");

  // Only clients with logs
  const activeClients = [...new Set(logData.map((l) => l.client))];
  select.innerHTML = activeClients
    .map((c) => `<option value="${c}">${c}</option>`)
    .join("");

  if (lastSelectedClient && activeClients.includes(lastSelectedClient))
    select.value = lastSelectedClient;
}

function renderClientActivity() {
  const client = document.getElementById("client-select").value;
  lastSelectedClient = client;

  const tbody = document
    .getElementById("client-activity-table")
    .getElementsByTagName("tbody")[0];
  tbody.innerHTML = "";

  const clientLogs = logData.filter((l) => l.client === client);

  clientLogs.forEach((l) => {
    const row = tbody.insertRow();
    row.insertCell(0).innerText = l.date;
    row.insertCell(1).innerText = l.activity;
    row.insertCell(2).innerText = l.update;
    row.insertCell(3).innerText = l.status;

    if (l.status === "new") row.style.fontWeight = "bold";
  });
}

// ---------------- Initial UI ----------------
updateHistoryTable();
renderClientDropdown();
renderClientActivity();
