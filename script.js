// ---------------- DATA ----------------
let logData = JSON.parse(localStorage.getItem("workLogs")) || [];
let lastSelectedClient = null;

// DOM Elements
const statusBox = document.getElementById('status');
const updateContainer = document.getElementById('update-container');
const updateInput = document.getElementById('update');

// ---------------- INITIALIZE ----------------
updateHistoryTable();
renderClientDropdown();
renderClientActivity();

// ---------------- TABS ----------------
function showTab(n){
  document.querySelectorAll('.tab').forEach(t=>t.style.display='none');
  document.getElementById('tab'+n).style.display='block';

  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active-tab-button'));
  document.querySelectorAll('.tab-button')[n-1].classList.add('active-tab-button');
}

// ---------------- CLIENT SUGGEST ----------------
function getClientsInData() {
  const clients = [...new Set(logData.map(l=>l.client))];
  return clients;
}

function suggestClient() {
  const input = document.getElementById('client').value.toLowerCase();
  const box = document.getElementById('client-suggestions');
  const suggestions = getClientsInData().filter(c => c.toLowerCase().includes(input));
  box.innerHTML = suggestions.map(c => `<div onclick="selectClient('${c}')">${c}</div>`).join('');
  box.style.display = suggestions.length ? 'block' : 'none';
}

function selectClient(c){
  document.getElementById('client').value = c;
  document.getElementById('client-suggestions').style.display = 'none';
  suggestActivity();
}

// ---------------- ACTIVITY SUGGEST ----------------
function suggestActivity() {
  const input = document.getElementById('activity').value.toLowerCase();
  const client = document.getElementById('client').value;
  const box = document.getElementById('activity-suggestions');

  const activities = logData.filter(l=>l.client===client).map(l=>l.activity);
  const suggestions = [...new Set(activities)].filter(a => a.toLowerCase().includes(input));
  
  box.innerHTML = suggestions.map(a => `<div onclick="selectActivity('${a}')">${a}</div>`).join('');
  box.style.display = suggestions.length ? 'block' : 'none';
}

function selectActivity(a){
  document.getElementById('activity').value = a;
  document.getElementById('activity-suggestions').style.display = 'none';
}

// ---------------- STATUS UPDATE ----------------
statusBox.addEventListener('change', () => {
  if (statusBox.value === 'ongoing') {
    updateContainer.style.display = 'block';
  } else {
    updateContainer.style.display = 'none';
    updateInput.value = '';
  }
});
if(statusBox.value !== 'ongoing') updateContainer.style.display = 'none';

// ---------------- SAVE LOG ----------------
function saveLog(){
  const date = document.getElementById('date').value;
  const client = document.getElementById('client').value.trim();
  const activity = document.getElementById('activity').value.trim();
  const status = document.getElementById('status').value;
  const update = updateInput.value.trim();

  if(!date || !client || !activity || !status){
    alert("Please fill all fields");
    return;
  }

  logData.push({date, client, activity, status, update});
  if(logData.length>15) logData.shift();

  localStorage.setItem("workLogs", JSON.stringify(logData));

  updateHistoryTable();
  renderClientDropdown();

  // Reset
  document.getElementById('date').value = '';
  document.getElementById('client').value = '';
  document.getElementById('activity').value = '';
  document.getElementById('status').value = 'new';
  updateInput.value = '';
  updateContainer.style.display = 'none';
}

// ---------------- HISTORY TABLE ----------------
function updateHistoryTable(){
  const tbody = document.getElementById('history-table').getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';
  logData.forEach((log, idx)=>{
    const row = tbody.insertRow();
    row.insertCell(0).innerText = log.date;
    row.insertCell(1).innerText = log.client;
    row.insertCell(2).innerText = log.activity;
    row.insertCell(3).innerText = log.status;
    row.insertCell(4).innerText = log.update;

    const actions = row.insertCell(5);
    const editBtn = document.createElement('button');
    editBtn.innerText = 'Edit';
    editBtn.className = 'edit-button';
    editBtn.onclick = ()=>editLog(idx);

    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = 'Delete';
    deleteBtn.className = 'delete-button';
    deleteBtn.onclick = ()=>deleteLog(idx);

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
  });
}

// ---------------- EDIT / DELETE ----------------
function editLog(idx){
  const log = logData[idx];
  document.getElementById('date').value = log.date;
  document.getElementById('client').value = log.client;
  document.getElementById('activity').value = log.activity;
  document.getElementById('status').value = log.status;

  if(log.status==='ongoing'){
    updateContainer.style.display='block';
    updateInput.value = log.update;
  }

  deleteLog(idx);
}

function deleteLog(idx){
  if(confirm("Are you sure?")){
    logData.splice(idx,1);
    localStorage.setItem("workLogs", JSON.stringify(logData));
    updateHistoryTable();
    renderClientActivity();
  }
}

// ---------------- CLIENT ACTIVITY ----------------
function renderClientDropdown(){
  const select = document.getElementById('client-select');
  const prev = lastSelectedClient;
  const clientsInData = [...new Set(logData.map(l=>l.client))];
  select.innerHTML = clientsInData.map(c=>`<option value="${c}">${c}</option>`).join('');
  if(prev) select.value = prev;
}

function renderClientActivity(){
  const client = document.getElementById('client-select').value;
  lastSelectedClient = client;
  const tbody = document.getElementById('client-activity-table').getElementsByTagName('tbody')[0];
  tbody.innerHTML='';
  logData.filter(l=>l.client===client).forEach(l=>{
    const row = tbody.insertRow();
    row.insertCell(0).innerText = l.date;
    row.insertCell(1).innerText = l.activity;
    row.insertCell(2).innerText = l.update;
    row.insertCell(3).innerText = l.status;
    if(l.status==='new') row.style.fontWeight='bold';
  });
}
