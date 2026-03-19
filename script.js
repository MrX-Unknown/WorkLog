// ----------------- Data
let clientHistory = JSON.parse(localStorage.getItem("clients")) || [];
let activityHistory = JSON.parse(localStorage.getItem("activities")) || {};
let logData = JSON.parse(localStorage.getItem("workLogs")) || [];

// ----------------- Tabs
function showTab(n) {
  document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
  document.getElementById('tab'+n).style.display = 'block';
  document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active-tab-button'));
  document.querySelectorAll('.tab-button')[n-1].classList.add('active-tab-button');
}

// ----------------- Auto Suggest
function suggestClient() {
  const input = document.getElementById('client').value.toLowerCase();
  const box = document.getElementById('client-suggestions');
  const suggestions = clientHistory.filter(c => c.toLowerCase().includes(input));
  box.innerHTML = suggestions.map(c => `<div onclick="selectClient('${c}')">${c}</div>`).join('');
  box.style.display = suggestions.length ? 'block':'none';
}

function selectClient(c) {
  document.getElementById('client').value = c;
  document.getElementById('client-suggestions').style.display = 'none';
  suggestActivity();
}

function suggestActivity() {
  const input = document.getElementById('activity').value.toLowerCase();
  const client = document.getElementById('client').value;
  const box = document.getElementById('activity-suggestions');
  if(activityHistory[client]) {
    const suggestions = activityHistory[client].filter(a => a.toLowerCase().includes(input));
    box.innerHTML = suggestions.map(a => `<div onclick="selectActivity('${a}')">${a}</div>`).join('');
    box.style.display = suggestions.length ? 'block':'none';
  } else {
    box.style.display = 'none';
  }
}

function selectActivity(a) {
  document.getElementById('activity').value = a;
  document.getElementById('activity-suggestions').style.display = 'none';
}

// ----------------- Status toggle
document.getElementById('status').addEventListener('change', () => {
  const uc = document.getElementById('update-container');
  uc.style.display = document.getElementById('status').value === 'ongoing' ? 'block' : 'none';
  if (document.getElementById('status').value !== 'ongoing') document.getElementById('update').value = '';
});

// ----------------- Save log
function saveLog() {
  const date = document.getElementById('date').value;
  const client = document.getElementById('client').value.trim();
  const activity = document.getElementById('activity').value.trim();
  const status = document.getElementById('status').value;
  const updateValue = document.getElementById('update').value.trim();

  if(!date || !client || !activity || !status) {
    alert("Please fill all fields");
    return;
  }

  if(!clientHistory.includes(client)) clientHistory.push(client);
  if(!activityHistory[client]) activityHistory[client] = [];
  if(!activityHistory[client].includes(activity)) activityHistory[client].push(activity);

  logData.push({date, client, activity, status, update: updateValue});

  localStorage.setItem("workLogs", JSON.stringify(logData));
  localStorage.setItem("clients", JSON.stringify(clientHistory));
  localStorage.setItem("activities", JSON.stringify(activityHistory));

  updateHistoryTable();
  renderClientDropdown();
  renderClientActivity();

  document.getElementById('date').value = '';
  document.getElementById('client').value = '';
  document.getElementById('activity').value = '';
  document.getElementById('status').value = 'new';
  document.getElementById('update').value = '';
  document.getElementById('update-container').style.display = 'none';
}

// ----------------- History Table
function updateHistoryTable() {
  const tbody = document.querySelector("#history-table tbody");
  tbody.innerHTML = '';
  logData.forEach((log, index) => {
    const row = tbody.insertRow();
    row.insertCell(0).innerText = log.date;
    row.insertCell(1).innerText = log.client;
    row.insertCell(2).innerText = log.activity;
    row.insertCell(3).innerText = log.status;
    row.insertCell(4).innerText = log.update;

    const actions = row.insertCell(5);
    const delBtn = document.createElement('button');
    delBtn.innerText = 'Delete';
    delBtn.onclick = () => deleteLog(index);
    actions.appendChild(delBtn);
  });
}

function deleteLog(index) {
  if(confirm('Are you sure?')) {
    logData.splice(index,1);
    localStorage.setItem("workLogs", JSON.stringify(logData));
    updateHistoryTable();
    renderClientActivity();
    renderClientDropdown();
  }
}

// ----------------- Tab 2
function renderClientDropdown() {
  const select = document.getElementById('client-select');
  select.innerHTML = clientHistory.map(c => `<option>${c}</option>`).join('');
}

function renderClientActivity() {
  const client = document.getElementById('client-select').value;
  const tbody = document.querySelector("#client-activity-table tbody");
  tbody.innerHTML = '';
  logData.filter(l => l.client === client).forEach(l => {
    const row = tbody.insertRow();
    row.insertCell(0).innerText = l.date;
    row.insertCell(1).innerText = l.activity;
    row.insertCell(2).innerText = l.update;
    row.insertCell(3).innerText = l.status;
  });
}

// ----------------- Initialize
updateHistoryTable();
renderClientDropdown();
if(clientHistory.length>0) renderClientActivity();
