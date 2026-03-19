// Data arrays
let clientHistory = JSON.parse(localStorage.getItem("clients")) || [];
let activityHistory = JSON.parse(localStorage.getItem("activities")) || {};
let logData = JSON.parse(localStorage.getItem("workLogs")) || [];
let cemHistory = JSON.parse(localStorage.getItem("cems")) || [];
let attyHistory = JSON.parse(localStorage.getItem("attys")) || [];
let lastSelectedClient = null;
let accomplishedLogs = JSON.parse(localStorage.getItem("accomplishedLogs")) || [];  // New array for accomplished logs

// ------------------ Tabs
function showTab(n) {
  document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
  document.getElementById('tab'+n).style.display = 'block';
  document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active-tab-button'));
  document.querySelectorAll('.tab-button')[n-1].classList.add('active-tab-button');
}

// ------------------ Save Log
function saveLog() {
  const date = document.getElementById('date').value;
  const client = document.getElementById('client').value.trim();
  const activity = document.getElementById('activity').value.trim();
  const status = document.getElementById('status').value;
  const updateValue = document.getElementById('update').value.trim();
  const cem = document.getElementById('cem').value.trim();
  const atty = document.getElementById('atty').value.trim();

  if (!date || !client || !activity || !status) {
    alert("Please fill all required fields");
    return;
  }

  // Add to history arrays
  if (!clientHistory.includes(client)) clientHistory.push(client);
  if (!activityHistory[client]) activityHistory[client] = [];
  if (!activityHistory[client].includes(activity)) activityHistory[client].push(activity);
  if (cem && !cemHistory.includes(cem)) cemHistory.push(cem);
  if (atty && !attyHistory.includes(atty)) attyHistory.push(atty);

  // Add to log
  logData.push({ date, client, activity, status, update: updateValue, cem, atty });
  if (logData.length > 15) logData.shift();

  // Save all
  localStorage.setItem('workLogs', JSON.stringify(logData));
  localStorage.setItem('clients', JSON.stringify(clientHistory));
  localStorage.setItem('activities', JSON.stringify(activityHistory));
  localStorage.setItem('cems', JSON.stringify(cemHistory));
  localStorage.setItem('attys', JSON.stringify(attyHistory));

  updateHistoryTable();
  renderClientDropdown();
  renderClientActivity();

  // Reset form
  ['date','client','activity','update','cem','atty'].forEach(id => document.getElementById(id).value='');
  document.getElementById('status').value = 'new';
  document.getElementById('update-container').style.display='none';
}

// ------------------ Update History Table (Tab 1)
function updateHistoryTable() {
  const tbody = document.getElementById('history-table').getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';
  logData.forEach((log, index) => {
    const row = tbody.insertRow();
    row.insertCell(0).innerText = log.date;
    row.insertCell(1).innerText = log.cem;
    row.insertCell(2).innerText = log.atty;
    row.insertCell(3).innerText = log.client;
    row.insertCell(4).innerText = log.activity;
    row.insertCell(5).innerText = log.status;
    row.insertCell(6).innerText = log.update;

    const actions = row.insertCell(7);
    const editBtn = document.createElement('button');
    editBtn.innerText='Edit';
    editBtn.onclick = ()=>editLog(index);
    const deleteBtn = document.createElement('button');
    deleteBtn.innerText='Delete';
    deleteBtn.onclick = ()=>deleteLog(index);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
  });
}

// ------------------ Move to Accomplished Log (Tab 3)
function moveToAccomplished(index) {
  const log = logData[index];
  if (log.status !== 'done') {
    alert('Only activities with status "Done" can be moved to Accomplished.');
    return;
  }

  // Remove log from logData and add it to accomplishedLogs
  accomplishedLogs.push(log);
  logData.splice(index, 1);

  // Persist changes
  localStorage.setItem('workLogs', JSON.stringify(logData));
  localStorage.setItem('accomplishedLogs', JSON.stringify(accomplishedLogs));

  updateHistoryTable();
  renderClientDropdown();
  renderClientActivity();
  renderAccomplishedLogs();
}

// ------------------ Render Accomplished Logs in Tab 3
function renderAccomplishedLogs() {
  const tbody = document.getElementById('accomplished-table').getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';
  accomplishedLogs.forEach((log, index) => {
    const row = tbody.insertRow();
    row.insertCell(0).innerText = log.date;
    row.insertCell(1).innerText = log.cem;
    row.insertCell(2).innerText = log.atty;
    row.insertCell(3).innerText = log.client;
    row.insertCell(4).innerText = log.activity;
    row.insertCell(5).innerText = log.status;
    row.insertCell(6).innerText = log.update;

    const actions = row.insertCell(7);
    actions.innerHTML = `<button onclick="deleteAccomplishedLog(${index})">Delete</button>`;
  });
}

// ------------------ Delete Accomplished Log
function deleteAccomplishedLog(index) {
  if (confirm('Are you sure you want to delete this accomplished log?')) {
    accomplishedLogs.splice(index, 1);
    localStorage.setItem('accomplishedLogs', JSON.stringify(accomplishedLogs));
    renderAccomplishedLogs();
  }
}

// ------------------ Client Activity Tab (Tab 2)
function renderClientActivity() {
  const client = document.getElementById('client-select').value;
  lastSelectedClient = client;
  const tbody = document.getElementById('client-activity-table').getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';
  logData.filter(l => l.client === client).forEach(l => {
    const row = tbody.insertRow();
    row.insertCell(0).innerText = l.date;
    row.insertCell(1).innerText = l.cem;
    row.insertCell(2).innerText = l.atty;
    row.insertCell(3).innerText = l.activity;
    row.insertCell(4).innerText = l.update;
    row.insertCell(5).innerText = l.status;

    if (l.status === 'done') {
      row.style.backgroundColor = '#d3ffd3';  // Mark Done rows with a different background color
    }
  });
}

// ------------------ Status toggle (for Update input visibility)
document.getElementById('status').addEventListener('change', function() {
  document.getElementById('update-container').style.display = this.value === 'ongoing' ? 'block' : 'none';
  if (this.value !== 'ongoing') document.getElementById('update').value = '';
});

// ------------------ Initialize
window.onload = function () {
  updateHistoryTable();
  renderClientDropdown();
  renderClientActivity();
  renderAccomplishedLogs();
  showTab(1);
}
