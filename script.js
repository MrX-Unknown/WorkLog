// ---------------- Data with persistence
let clientHistory = JSON.parse(localStorage.getItem("clients")) || [];
let activityHistory = JSON.parse(localStorage.getItem("activities")) || {};
let logData = JSON.parse(localStorage.getItem("workLogs")) || [];
let lastSelectedClient = null;

// ---------------- Default Tab
window.onload = () => {
  showTab(1); // Only show Tab 1 initially
  updateHistoryTable();
  renderClientDropdown();
  renderClientActivity();
};

// ---------------- Tab switching
function showTab(tabNumber) {
  document.querySelectorAll(".tab").forEach(t => t.style.display = "none");
  document.getElementById("tab" + tabNumber).style.display = "block";

  // Highlight active button
  document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active-tab-button"));
  document.querySelectorAll(".tab-button")[tabNumber-1].classList.add("active-tab-button");

  if(tabNumber === 2) renderClientDropdown(), renderClientActivity();
}

// ---------------- Client auto-suggest (only shows existing data)
function suggestClient() {
  const input = document.getElementById('client').value.toLowerCase();
  const suggestions = clientHistory.filter(c => c.toLowerCase().includes(input));
  const box = document.getElementById('client-suggestions');
  box.innerHTML = suggestions.map(c => `<div onclick="selectClient('${c}')">${c}</div>`).join('');
  box.style.display = suggestions.length ? 'block' : 'none';
}

function selectClient(client) {
  document.getElementById('client').value = client;
  document.getElementById('client-suggestions').style.display = 'none';
  suggestActivity();

  // Auto-select Status if client+activity exists
  const activityVal = document.getElementById('activity').value;
  if(logData.some(l => l.client === client && l.activity === activityVal)) {
    document.getElementById('status').value = 'ongoing';
    document.getElementById('update-container').style.display = 'block';
  }
}

// ---------------- Activity auto-suggest (only for selected client)
function suggestActivity() {
  const input = document.getElementById('activity').value.toLowerCase();
  const client = document.getElementById('client').value;
  const box = document.getElementById('activity-suggestions');
  if(activityHistory[client]) {
    const suggestions = activityHistory[client].filter(a => a.toLowerCase().includes(input));
    box.innerHTML = suggestions.map(a => `<div onclick="selectActivity('${a}')">${a}</div>`).join('');
    box.style.display = suggestions.length ? 'block' : 'none';
  } else {
    box.style.display = 'none';
  }
}

function selectActivity(activity) {
  document.getElementById('activity').value = activity;
  document.getElementById('activity-suggestions').style.display = 'none';

  // Auto-select Status if client+activity exists
  const clientVal = document.getElementById('client').value;
  if(logData.some(l => l.client === clientVal && l.activity === activity)) {
    document.getElementById('status').value = 'ongoing';
    document.getElementById('update-container').style.display = 'block';
  }
}

// ---------------- Status toggle
document.getElementById('status').addEventListener('change', function() {
  document.getElementById('update-container').style.display = this.value === 'ongoing' ? 'block' : 'none';
  if(this.value !== 'ongoing') document.getElementById('update').value = '';
});

// ---------------- Save log
function saveLog() {
  const date = document.getElementById('date').value;
  const client = document.getElementById('client').value.trim();
  const activity = document.getElementById('activity').value.trim();
  const status = document.getElementById('status').value;
  const updateVal = document.getElementById('update').value.trim();

  if(!date || !client || !activity) { alert("Please fill all fields"); return; }

  // Add to client history
  if(!clientHistory.includes(client)) clientHistory.push(client);

  // Add to activity history
  if(!activityHistory[client]) activityHistory[client] = [];
  if(!activityHistory[client].includes(activity)) activityHistory[client].push(activity);

  logData.push({ date, client, activity, status, update: updateVal });

  // Persist to localStorage if available
  if (isLocalStorageAvailable()) {
    localStorage.setItem("clients", JSON.stringify(clientHistory));
    localStorage.setItem("activities", JSON.stringify(activityHistory));
    localStorage.setItem("workLogs", JSON.stringify(logData));
  } else {
    alert("LocalStorage is not available. Data will not persist.");
  }

  updateHistoryTable();
  renderClientDropdown();
  renderClientActivity();

  // Reset fields
  document.getElementById('date').value = '';
  document.getElementById('client').value = '';
  document.getElementById('activity').value = '';
  document.getElementById('status').value = 'new';
  document.getElementById('update').value = '';
  document.getElementById('update-container').style.display = 'none';
}

// ---------------- Update history table (with Status and Update swapped)
function updateHistoryTable() {
  const tbody = document.querySelector("#history-table tbody");
  tbody.innerHTML = '';
  logData.forEach((l, i) => {
    const row = tbody.insertRow();
    row.insertCell(0).innerText = l.date;
    row.insertCell(1).innerText = l.client;
    row.insertCell(2).innerText = l.activity;
    row.insertCell(3).innerText = l.update;  // Updated to show Update before Status
    row.insertCell(4).innerText = l.status; // Updated to show Status after Update

    const actions = row.insertCell(5);
    const editBtn = document.createElement("button");
    editBtn.innerText = "Edit";
    editBtn.onclick = () => editLog(i);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Delete";
    deleteBtn.onclick = () => deleteLog(i);

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
  });
}

// ---------------- Edit/Delete
function editLog(i) {
  const log = logData[i];
  document.getElementById('date').value = log.date;
  document.getElementById('client').value = log.client;
  document.getElementById('activity').value = log.activity;
  document.getElementById('status').value = log.status;
  if(log.status === 'ongoing') {
    document.getElementById('update-container').style.display = 'block';
    document.getElementById('update').value = log.update;
  }
  deleteLog(i);
}

function deleteLog(i) {
  if (confirm("Are you sure you want to delete this log?")) {
    logData.splice(i, 1);

    // If no logs left, reset clientHistory and activityHistory
    if (logData.length === 0) {
      clientHistory = [];
      activityHistory = {};
      if (isLocalStorageAvailable()) {
        localStorage.setItem("clients", JSON.stringify(clientHistory));
        localStorage.setItem("activities", JSON.stringify(activityHistory));
        localStorage.setItem("workLogs", JSON.stringify(logData));
      }
    }

    // Remove client if no more logs exist
    clientHistory = [...new Set(logData.map(l => l.client))];
    activityHistory = {};
    logData.forEach(l => {
      if(!activityHistory[l.client]) activityHistory[l.client] = [];
      if(!activityHistory[l.client].includes(l.activity)) activityHistory[l.client].push(l.activity);
    });

    if (isLocalStorageAvailable()) {
      localStorage.setItem("clients", JSON.stringify(clientHistory));
      localStorage.setItem("activities", JSON.stringify(activityHistory));
      localStorage.setItem("workLogs", JSON.stringify(logData));
    }

    updateHistoryTable();
    renderClientDropdown();
    renderClientActivity();
  }
}

// ---------------- Tab 2 Client Dropdown
function renderClientDropdown() {
  const select = document.getElementById('client-select');
  const prev = lastSelectedClient;
  select.innerHTML = clientHistory.map(c => `<option value="${c}">${c}</option>`).join('');
  if(prev) select.value = prev;
}

// ---------------- Tab 2 Client Activity
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

    if(l.status === 'new') row.style.fontWeight = 'bold';
  });
}

// ---------------- Client-select change listener
document.getElementById('client-select').addEventListener('change', renderClientActivity);

// ---------------- LocalStorage Check (Cross-browser compatibility)
function isLocalStorageAvailable() {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}
