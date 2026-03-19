// Data Persistence
let clientHistory = JSON.parse(localStorage.getItem("clients")) || [];
let activityHistory = JSON.parse(localStorage.getItem("activities")) || {};
let logData = JSON.parse(localStorage.getItem("workLogs")) || [];
let cemHistory = JSON.parse(localStorage.getItem("cem")) || [];
let attorneyHistory = JSON.parse(localStorage.getItem("attorney")) || [];

// --------------------------- Tab Management ---------------------------
function showTab(n) {
  document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
  document.getElementById('tab' + n).style.display = 'block';

  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active-tab-button'));
  document.querySelectorAll('.tab-button')[n - 1].classList.add('active-tab-button');
}

// --------------------------- Auto-Suggest Functions ---------------------------

// CEM
function suggestCem() {
  const input = document.getElementById('cem').value;
  const box = document.getElementById('cem-suggestions');
  let suggestions = cemHistory.filter(c => c.toLowerCase().includes(input.toLowerCase()));
  box.innerHTML = suggestions.map(c => `<div onclick="selectCem('${c}')">${c}</div>`).join('');
  box.style.display = suggestions.length ? 'block' : 'none';
}

function selectCem(c) {
  document.getElementById('cem').value = c;
  document.getElementById('cem-suggestions').style.display = 'none';
}

// Attorney
function suggestAttorney() {
  const input = document.getElementById('attorney').value;
  const box = document.getElementById('attorney-suggestions');
  let suggestions = attorneyHistory.filter(a => a.toLowerCase().includes(input.toLowerCase()));
  box.innerHTML = suggestions.map(a => `<div onclick="selectAttorney('${a}')">${a}</div>`).join('');
  box.style.display = suggestions.length ? 'block' : 'none';
}

function selectAttorney(a) {
  document.getElementById('attorney').value = a;
  document.getElementById('attorney-suggestions').style.display = 'none';
}

// Client (only existing data)
function suggestClient() {
  const input = document.getElementById('client').value;
  const box = document.getElementById('client-suggestions');
  let suggestions = clientHistory.filter(c => c.toLowerCase().includes(input.toLowerCase()));
  box.innerHTML = suggestions.map(c => `<div onclick="selectClient('${c}')">${c}</div>`).join('');
  box.style.display = suggestions.length ? 'block' : 'none';
}

function selectClient(c) {
  document.getElementById('client').value = c;
  document.getElementById('client-suggestions').style.display = 'none';
}

// Activity (based on selected client)
function suggestActivity() {
  const client = document.getElementById('client').value;
  const input = document.getElementById('activity').value;
  const box = document.getElementById('activity-suggestions');

  if (!activityHistory[client]) return;

  let suggestions = activityHistory[client].filter(a => a.toLowerCase().includes(input.toLowerCase()));
  box.innerHTML = suggestions.map(a => `<div onclick="selectActivity('${a}')">${a}</div>`).join('');
  box.style.display = suggestions.length ? 'block' : 'none';
}

function selectActivity(a) {
  document.getElementById('activity').value = a;
  document.getElementById('activity-suggestions').style.display = 'none';
}

// --------------------------- Status Handling ---------------------------
function handleStatusChange() {
  const status = document.getElementById('status').value;
  const updateContainer = document.getElementById('update-container');
  updateContainer.style.display = status === 'ongoing' ? 'block' : 'none';

  if (status !== 'ongoing') {
    document.getElementById('update').value = '';
  }
}

// --------------------------- Save & Update Logs ---------------------------
function saveLog() {
  const date = document.getElementById('date').value;
  const cem = document.getElementById('cem').value.trim();
  const attorney = document.getElementById('attorney').value.trim();
  const client = document.getElementById('client').value.trim();
  const activity = document.getElementById('activity').value.trim();
  const status = document.getElementById('status').value;
  const update = document.getElementById('update').value.trim();

  if (!date || !client || !activity || !status) {
    alert('Please fill all required fields.');
    return;
  }

  if (!clientHistory.includes(client)) clientHistory.push(client);
  if (!cemHistory.includes(cem)) cemHistory.push(cem);
  if (!attorneyHistory.includes(attorney)) attorneyHistory.push(attorney);
  if (!activityHistory[client]) activityHistory[client] = [];
  if (!activityHistory[client].includes(activity)) activityHistory[client].push(activity);

  logData.push({ date, cem, attorney, client, activity, status, update });
  if (logData.length > 15) logData.shift();

  localStorage.setItem('clients', JSON.stringify(clientHistory));
  localStorage.setItem('cem', JSON.stringify(cemHistory));
  localStorage.setItem('attorney', JSON.stringify(attorneyHistory));
  localStorage.setItem('activities', JSON.stringify(activityHistory));
  localStorage.setItem('workLogs', JSON.stringify(logData));

  updateHistoryTable();
  renderClientDropdown();

  // Reset inputs
  ['date', 'cem', 'attorney', 'client', 'activity', 'update'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('status').value = 'new';
  document.getElementById('update-container').style.display = 'none';
}

// --------------------------- Tables ---------------------------
function updateHistoryTable() {
  const tbody = document.querySelector("#history-table tbody");
  tbody.innerHTML = "";

  logData.forEach((log, index) => {
    let row = tbody.insertRow();
    row.innerHTML = `
      <td>${log.date}</td>
      <td>${log.cem}</td>
      <td>${log.attorney}</td>
      <td>${log.client}</td>
      <td>${log.activity}</td>
      <td>${log.status}</td>
      <td>${log.update}</td>
      <td><button onclick="deleteLog(${index})">Delete</button></td>
    `;
  });
}

function deleteLog(index) {
  if (confirm("Are you sure you want to delete this log?")) {
    logData.splice(index, 1);
    localStorage.setItem('workLogs', JSON.stringify(logData));
    updateHistoryTable();
    renderClientDropdown();
  }
}

// Tab 2 dropdown
function renderClientDropdown() {
  const select = document.getElementById("client-select");
  select.innerHTML = clientHistory.map(c => `<option>${c}</option>`).join('');
}

// Tab 2 table
function renderClientActivity() {
  const client = document.getElementById("client-select").value;
  const tbody = document.querySelector("#client-activity-table tbody");
  tbody.innerHTML = "";

  const clientLogs = logData.filter(log => log.client === client);

  clientLogs.forEach(log => {
    let row = tbody.insertRow();
    row.innerHTML = `
      <td>${log.date}</td>
      <td>${log.cem}</td>
      <td>${log.attorney}</td>
      <td>${log.activity}</td>
      <td>${log.status}</td>
      <td>${log.update}</td>
    `;
  });
}
