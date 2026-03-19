// ------------------ Tab & Data Initialization ------------------
let logData = JSON.parse(localStorage.getItem("workLogs")) || [];
let lastSelectedClient = null;

// On page load
window.onload = () => {
  showTab(1);               // Show Tab 1 by default
  updateHistoryTable();
  renderClientDropdown();
  renderClientActivity();
};

// ------------------ Tab Functionality ------------------
function showTab(tabNumber) {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach((tab, i) => tab.style.display = (i === tabNumber - 1) ? 'block' : 'none');

  const buttons = document.querySelectorAll('.tab-button');
  buttons.forEach((btn, i) => btn.classList.toggle('active-tab-button', i === tabNumber - 1));
}

// ------------------ Client Auto-Suggest ------------------
function suggestClient() {
  const input = document.getElementById('client').value.toLowerCase();
  const box = document.getElementById('client-suggestions');

  // Only clients in logData
  const currentClients = [...new Set(logData.map(l => l.client))];

  const suggestions = currentClients.filter(c => c.toLowerCase().includes(input));
  box.innerHTML = suggestions.map(c => `<div onclick="selectClient('${c}')">${c}</div>`).join('');
  box.style.display = suggestions.length ? 'block' : 'none';
}

function selectClient(client) {
  document.getElementById('client').value = client;
  document.getElementById('client-suggestions').style.display = 'none';
  suggestActivity();
  autoSelectStatus();
}

// ------------------ Activity Auto-Suggest ------------------
function suggestActivity() {
  const input = document.getElementById('activity').value.toLowerCase();
  const client = document.getElementById('client').value;
  const box = document.getElementById('activity-suggestions');

  if (!client) return;

  // Activities only for this client
  const clientActivities = logData
    .filter(l => l.client === client)
    .map(l => l.activity);

  const suggestions = [...new Set(clientActivities)]
    .filter(a => a.toLowerCase().includes(input));

  box.innerHTML = suggestions.map(a => `<div onclick="selectActivity('${a}')">${a}</div>`).join('');
  box.style.display = suggestions.length ? 'block' : 'none';
}

function selectActivity(activity) {
  document.getElementById('activity').value = activity;
  document.getElementById('activity-suggestions').style.display = 'none';
  autoSelectStatus();
}

// ------------------ Status Auto-Select ------------------
function autoSelectStatus() {
  const client = document.getElementById('client').value;
  const activity = document.getElementById('activity').value;
  const statusInput = document.getElementById('status');
  const updateContainer = document.getElementById('update-container');

  const existing = logData.find(l => l.client === client && l.activity === activity);
  if (existing) {
    statusInput.value = 'ongoing';
    updateContainer.style.display = 'block';
  } else {
    statusInput.value = 'new';
    updateContainer.style.display = 'none';
    document.getElementById('update').value = '';
  }
}

// ------------------ Status Change Listener ------------------
document.getElementById('status').addEventListener('change', function () {
  const uc = document.getElementById('update-container');
  uc.style.display = this.value === 'ongoing' ? 'block' : 'none';
  if (this.value !== 'ongoing') document.getElementById('update').value = '';
});

// ------------------ Save Log ------------------
function saveLog() {
  const date = document.getElementById('date').value;
  const client = document.getElementById('client').value.trim();
  const activity = document.getElementById('activity').value.trim();
  const status = document.getElementById('status').value;
  const updateValue = document.getElementById('update').value.trim();

  if (!date || !client || !activity || !status) {
    alert("Please fill all required fields");
    return;
  }

  logData.push({ date, client, activity, status, update: updateValue });

  // Keep last 50 logs max
  if (logData.length > 50) logData.shift();

  // Persist
  localStorage.setItem('workLogs', JSON.stringify(logData));

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

// ------------------ Update History Table ------------------
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

// ------------------ Edit/Delete Functions ------------------
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

  deleteLog(index); // remove before editing
}

function deleteLog(index) {
  if (confirm("Are you sure?")) {
    logData.splice(index, 1);
    localStorage.setItem('workLogs', JSON.stringify(logData));
    updateHistoryTable();
    renderClientDropdown();
    renderClientActivity();
  }
}

// ------------------ Client Log Tab ------------------
function renderClientDropdown() {
  const select = document.getElementById('client-select');
  const prev = lastSelectedClient;

  const clientsInData = [...new Set(logData.map(l => l.client))];

  select.innerHTML = clientsInData.map(c => `<option value="${c}">${c}</option>`).join('');
  if (prev && clientsInData.includes(prev)) select.value = prev;
}

function renderClientActivity() {
  const clientSelect = document.getElementById('client-select');
  if (!clientSelect.value) return;

  const client = clientSelect.value;
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

// ------------------ Client-select change ------------------
document.getElementById('client-select').addEventListener('change', renderClientActivity);
