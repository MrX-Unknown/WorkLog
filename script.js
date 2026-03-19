// Data Persistence
let clientHistory = JSON.parse(localStorage.getItem("clients")) || [];
let activityHistory = JSON.parse(localStorage.getItem("activities")) || {};
let logData = JSON.parse(localStorage.getItem("workLogs")) || [];
let cemHistory = JSON.parse(localStorage.getItem("cem")) || [];
let attorneyHistory = JSON.parse(localStorage.getItem("attorney")) || [];

// Function to show/hide tabs
function showTab(n) {
  document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
  document.getElementById('tab' + n).style.display = 'block';

  // Update active tab button style
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active-tab-button');
  });
  document.querySelectorAll('.tab-button')[n - 1].classList.add('active-tab-button');
}

// --------------------------- Color Scheme Switch ---------------------------

// Function to change color scheme
function setColorScheme(scheme) {
  document.body.className = scheme;
  localStorage.setItem('colorScheme', scheme);
}

// Initialize color scheme from localStorage
const savedColorScheme = localStorage.getItem('colorScheme') || 'pastel';
setColorScheme(savedColorScheme);

// --------------------------- Client Auto-Suggest ---------------------------

// Suggest CEM
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

// Suggest Attorney
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

// Suggest Client (in Tab 1)
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

// --------------------------- Activity Auto-Suggest ---------------------------

// Suggest Activity (based on Client selected)
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

// --------------------------- Status Change Handling ---------------------------

// Function to handle the display of update input based on status
function handleStatusChange() {
  const status = document.getElementById('status').value;
  const updateContainer = document.getElementById('update-container');
  updateContainer.style.display = status === 'ongoing' ? 'block' : 'none';

  if (status !== 'ongoing') {
    document.getElementById('update').value = ''; // Reset update field if not "Ongoing"
  }
}

// --------------------------- Save Data and Update Tables ---------------------------

// Save work log
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
  if (logData.length > 15) logData.shift(); // Keep only the last 15 entries

  // Save to localStorage
  localStorage.setItem('clients', JSON.stringify(clientHistory));
  localStorage.setItem('cem', JSON.stringify(cemHistory));
  localStorage.setItem('attorney', JSON.stringify(attorneyHistory));
  localStorage.setItem('activities', JSON.stringify(activityHistory));
  localStorage.setItem('workLogs', JSON.stringify(logData));

  updateHistoryTable();
  renderClientDropdown();

  // Reset form fields
  document.getElementById('date').value = '';
  document.getElementById('cem').value = '';
  document.getElementById('attorney').value = '';
  document.getElementById('client').value = '';
  document.getElementById('activity').value = '';
  document.getElementById('status').value = 'new';
  document.getElementById('update').value = '';
  document.getElementById('update-container').style.display = 'none';
}

// Update history table on Tab 1
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

// --------------------------- Delete Log ---------------------------
function deleteLog(index) {
  if (confirm("Are you sure you want to delete this log?")) {
    logData.splice(index, 1);
    localStorage.setItem('workLogs', JSON.stringify(logData));
    updateHistoryTable();
    renderClientDropdown();
  }
}

// --------------------------- Render Client Dropdown in Tab 2 ---------------------------

// Render client dropdown based on the client history
function renderClientDropdown() {
  const select = document.getElementById("client-select");
  select.innerHTML = clientHistory.map(c => `<option>${c}</option>`).join('');
}

// --------------------------- Render Client Activity ---------------------------

// Render client activities in Tab 2
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

// --------------------------- Move Done Logs to Tab 3 ---------------------------

// Move logs marked as "done" to Tab 3 and remove them from Tab 1 and Tab 2
function moveDoneLogs() {
  const doneLogs = logData.filter(log => log.status === 'done');
  const tbody = document.querySelector("#accomplished-activity-table tbody");
  tbody.innerHTML = "";

  doneLogs.forEach(log => {
    let row = tbody.insertRow();
    row.inner
