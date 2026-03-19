// Data arrays
let clientHistory = JSON.parse(localStorage.getItem("clients")) || [];
let activityHistory = JSON.parse(localStorage.getItem("activities")) || {};
let logData = JSON.parse(localStorage.getItem("workLogs")) || [];
let cemHistory = JSON.parse(localStorage.getItem("cems")) || [];
let attyHistory = JSON.parse(localStorage.getItem("attys")) || [];
let lastSelectedClient = null;

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

// ------------------ History Table
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

// ------------------ Edit/Delete
function editLog(index) {
  const log = logData[index];
  ['date','client','activity','update','cem','atty'].forEach(id => document.getElementById(id).value=log[id]||'');
  document.getElementById('status').value = log.status;
  document.getElementById('update-container').style.display = log.status==='ongoing'?'block':'none';
  deleteLog(index);
}

function deleteLog(index) {
  logData.splice(index,1);
  localStorage.setItem('workLogs', JSON.stringify(logData));
  updateHistoryTable();
  renderClientActivity();
}

// ------------------ Status toggle
document.getElementById('status').addEventListener('change', function() {
  document.getElementById('update-container').style.display = this.value==='ongoing'?'block':'none';
  if (this.value!=='ongoing') document.getElementById('update').value='';
});

// ------------------ Client Activity Tab
function renderClientDropdown() {
  const select = document.getElementById('client-select');
  select.innerHTML = clientHistory.map(c=>`<option value="${c}">${c}</option>`).join('');
  if (lastSelectedClient) select.value = lastSelectedClient;
}

function renderClientActivity() {
  const client = document.getElementById('client-select').value;
  lastSelectedClient = client;
  const tbody = document.getElementById('client-activity-table').getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';
  logData.filter(l=>l.client===client).forEach(l=>{
    const row = tbody.insertRow();
    row.insertCell(0).innerText = l.date;
    row.insertCell(1).innerText = l.cem;
    row.insertCell(2).innerText = l.atty;
    row.insertCell(3).innerText = l.activity;
    row.insertCell(4).innerText = l.update;
    row.insertCell(5).innerText = l.status;
  });
}

// ------------------ Auto-suggest
function suggestClient() {
  const input = document.getElementById('client').value.toLowerCase();
  const box = document.getElementById('client-suggestions');
  const suggestions = clientHistory.filter(c=>c.toLowerCase().includes(input));
  box.innerHTML = suggestions.map(c=>`<div onclick="selectClient('${c}')">${c}</div>`).join('');
  box.style.display = suggestions.length?'block':'none';
}
function selectClient(c){document.getElementById('client').value=c;document.getElementById('client-suggestions').style.display='none'; suggestActivity();}
function suggestActivity() {
  const client = document.getElementById('client').value;
  const input = document.getElementById('activity').value.toLowerCase();
  const box = document.getElementById('activity-suggestions');
  if(!activityHistory[client]) return;
  const suggestions = activityHistory[client].filter(a=>a.toLowerCase().includes(input));
  box.innerHTML = suggestions.map(a=>`<div onclick="selectActivity('${a}')">${a}</div>`).join('');
  box.style.display = suggestions.length?'block':'none';
}
function selectActivity(a){document.getElementById('activity').value=a;document.getElementById('activity-suggestions').style.display='none';}

// Auto-suggest for CEM and Atty
function suggestCEM(){const input=document.getElementById('cem').value.toLowerCase();const box=document.getElementById('cem-suggestions');const suggestions=cemHistory.filter(c=>c.toLowerCase().includes(input));box.innerHTML=suggestions.map(c=>`<div onclick="selectCEM('${c}')">${c}</div>`).join('');box.style.display=suggestions.length?'block':'none';}
function selectCEM(c){document.getElementById('cem').value=c;document.getElementById('cem-suggestions').style.display='none';}
function suggestAtty(){const input=document.getElementById('atty').value.toLowerCase();const box=document.getElementById('atty-suggestions');const suggestions=attyHistory.filter(a=>a.toLowerCase().includes(input));box.innerHTML=suggestions.map(a=>`<div onclick="selectAtty('${a}')">${a}</div>`).join('');box.style.display=suggestions.length?'block':'none';}
function selectAtty(a){document.getElementById('atty').value=a;document.getElementById('atty-suggestions').style.display='none';}

// ------------------ Initialize
window.onload = function() {
  updateHistoryTable();
  renderClientDropdown();
  renderClientActivity();
  showTab(1);
}
