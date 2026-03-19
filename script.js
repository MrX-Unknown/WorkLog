let clientHistory = JSON.parse(localStorage.getItem("clients")) || [];
let activityHistory = JSON.parse(localStorage.getItem("activities")) || {};
let logData = JSON.parse(localStorage.getItem("workLogs")) || [];

// Function to show the appropriate tab
function showTab(n) {
  document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
  document.getElementById('tab' + n).style.display = 'block';
}

// Save the log data
function saveLog() {
  const date = document.getElementById('date').value;
  const client = document.getElementById('client').value.trim();
  const activity = document.getElementById('activity').value.trim();
  const status = document.getElementById('status').value;
  const updateValue = document.getElementById('update').value.trim();

  if (!date || !client || !activity || !status) {
    alert('Please fill all fields');
    return;
  }

  if (!clientHistory.includes(client)) clientHistory.push(client);
  if (!activityHistory[client]) activityHistory[client] = [];
  if (!activityHistory[client].includes(activity)) activityHistory[client].push(activity);

  logData.push({ date, client, activity, status, update: updateValue });
  if (logData.length > 15) logData.shift(); // Keep last 15 logs

  // Persist data
  localStorage.setItem('workLogs', JSON.stringify(logData));
  localStorage.setItem('clients', JSON.stringify(clientHistory));
  localStorage.setItem('activities', JSON.stringify(activityHistory));

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

// Update the history table with saved logs
function updateHistoryTable() {
  const tbody = document.querySelector("#history-table tbody");
  tbody.innerHTML = "";

  logData.forEach((l, i) => {
    let row = tbody.insertRow();
    row.innerHTML = `
      <td>${l.date}</td>
      <td>${l.client}</td>
      <td>${l.activity}</td>
      <td>${l.status}</td>
      <td>${l.update}</td>
      <td><button onclick="deleteLog(${i})">Delete</button></td>
    `;
  });
}

// Delete log
function deleteLog(i) {
  logData.splice(i, 1);
  localStorage.setItem("workLogs", JSON.stringify(logData));
  updateHistoryTable();
}

// Client auto-suggestions
function suggestClient() {
  const input = document.getElementById('client').value;
  const box = document.getElementById('client-suggestions');
  
  let suggestions = clientHistory.filter(c => c.toLowerCase().includes(input.toLowerCase()));

  box.innerHTML = suggestions.map(c => `<div onclick="selectClient('${c}')">${c}</div>`).join('');
  box.style.display = suggestions.length ? 'block' : 'none';
}

function selectClient(client) {
  document.getElementById('client').value = client;
  document.getElementById('client-suggestions').style.display = 'none';
  suggestActivity();
}

// Activity auto-suggestions
function suggestActivity() {
  const input = document.getElementById('activity').value;
  const client = document.getElementById('client').value;
  
  if (!activityHistory[client]) return;

  const box = document.getElementById('activity-suggestions');
  const suggestions = activityHistory[client].filter(a => a.toLowerCase().includes(input.toLowerCase()));

  box.innerHTML = suggestions.map(a => `<div onclick="selectActivity('${a}')">${a}</div>`).join('');
  box.style.display = suggestions.length ? 'block' : 'none';
}

function selectActivity(activity) {
  document.getElementById('activity').value = activity;
  document.getElementById('activity-suggestions').style.display = 'none';
}

// Render Client dropdown in Tab 2
function renderClientDropdown() {
  const select = document.getElementById("client-select");
  select.innerHTML = clientHistory.map(c => `<option>${c}</option>`).join("");
}

// Render Client activity for Tab 2
function renderClientActivity() {
  const client = document.getElementById("client-select").value;
  const tbody = document.querySelector("#client-activity-table tbody");
  tbody.innerHTML = "";

  logData.filter(l => l.client === client).forEach(l => {
    let row = tbody.insertRow();
    row.innerHTML = `
      <td>${l.date}</td>
      <td>${l.activity}</td>
      <td>${l.update}</td>
      <td>${l.status}</td>
    `;
  });
}

// On page load
window.onload = () => {
  showTab(1);  // Show Tab 1 by default
  renderClientDropdown();
};
