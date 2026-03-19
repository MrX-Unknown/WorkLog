// Data Persistence
let clientHistory = JSON.parse(localStorage.getItem("clients")) || [];
let activityHistory = JSON.parse(localStorage.getItem("activities")) || {};
let logData = JSON.parse(localStorage.getItem("workLogs")) || [];
let accomplishedLogs = JSON.parse(localStorage.getItem("accomplishedLogs")) || [];

// Tabs functionality
function showTab(tabNum) {
  document.querySelectorAll('.tab').forEach(tab => tab.style.display = 'none');
  document.getElementById('tab' + tabNum).style.display = 'block';
  document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active-tab-button'));
  document.querySelectorAll('.tab-button')[tabNum - 1].classList.add('active-tab-button');
}

// Save Log
function saveLog() {
  const date = document.getElementById('date').value;
  const cem = document.getElementById('cem').value.trim();
  const attorney = document.getElementById('attorney').value.trim();
  const client = document.getElementById('client').value.trim();
  const activity = document.getElementById('activity').value.trim();
  const status = document.getElementById('status').value;
  const update = document.getElementById('update').value.trim();

  if (!date || !cem || !attorney || !client || !activity || !status) {
    alert('Please fill all fields');
    return;
  }

  // If status is done, move to accomplished logs
  if (status === 'done') {
    accomplishedLogs.push({ date, cem, attorney, client, activity, status, update });
    localStorage.setItem("accomplishedLogs", JSON.stringify(accomplishedLogs));
    return; // Don't save in work logs if done
  }

  logData.push({ date, cem, attorney, client, activity, status, update });
  localStorage.setItem('workLogs', JSON.stringify(logData));

  // Persisting all changes
  localStorage.setItem('clients', JSON.stringify(clientHistory));
  localStorage.setItem('activities', JSON.stringify(activityHistory));

  renderHistory();
  resetForm();
}

// Render Log Data
function renderHistory() {
  const tbody = document.getElementById('history-table').getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';
  logData.forEach(log => {
    const row = tbody.insertRow();
    row.insertCell(0).innerText = log.date;
    row.insertCell(1).innerText = log.cem;
    row.insertCell(2).innerText = log.attorney;
    row.insertCell(3).innerText = log.client;
    row.insertCell(4).innerText = log.activity;
    row.insertCell(5).innerText = log.status;
    row.insertCell(6).innerText = log.update;
    const actionsCell = row.insertCell(7);
    const doneButton = document.createElement('button');
    doneButton.innerText = 'Done';
    doneButton.onclick = () => markAsDone(log);
    actionsCell.appendChild(doneButton);
  });
}

// Mark as Done (for Tab 1 and Tab 2)
function markAsDone(log) {
  log.status = 'done';
  accomplishedLogs.push(log); // Move to Tab 3
  localStorage.setItem("accomplishedLogs", JSON.stringify(accomplishedLogs));

  // Remove from current logs
  logData = logData.filter(l => l !== log);
  localStorage.setItem("workLogs", JSON.stringify(logData));
  renderHistory();
}

// Render Accomplished Logs in Tab 3
function renderAccomplishedLogs() {
  const tbody = document.getElementById('accomplished-activity-table').getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';
  accomplishedLogs.forEach(log => {
    const row = tbody.insertRow();
    row.insertCell(0).innerText = log.date;
    row.insertCell(1).innerText = log.cem;
    row.insertCell(2).innerText = log.attorney;
    row.insertCell(3).innerText = log.client;
    row.insertCell(4).innerText = log.activity;
    row.insertCell(5).innerText = log.status;
  });
}

// Call this to initialize when the page loads
function init() {
  renderHistory();
  renderAccomplishedLogs();
}

window.onload = init;
