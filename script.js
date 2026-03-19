// DATA & STORAGE
let clientHistory = JSON.parse(localStorage.getItem("clients")) || [];
let activityHistory = JSON.parse(localStorage.getItem("activities")) || {};
let logData = JSON.parse(localStorage.getItem("workLogs")) || [];
let lastSelectedClient = null;

// INIT
updateHistoryTable();
renderClientDropdown();
renderClientActivity();

// ---------------- TABS
function showTab(n){
  document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
  document.getElementById('tab'+n).style.display = 'block';
  document.querySelectorAll('.tab-button').forEach((btn,i)=>{
    btn.classList.remove('active-tab-button');
    if(i===n-1) btn.classList.add('active-tab-button');
  });
}

// ---------------- SUGGESTIONS
function suggestClient(){
  const input = document.getElementById('client').value.toLowerCase();
  const suggestions = clientHistory.filter(c => c.toLowerCase().includes(input));
  const box = document.getElementById('client-suggestions');
  box.innerHTML = suggestions.map(c => `<li onclick="selectClient('${c}')">${c}</li>`).join('');
  box.style.display = suggestions.length ? 'block' : 'none';
}

function selectClient(c){
  document.getElementById('client').value = c;
  document.getElementById('client-suggestions').style.display = 'none';
  suggestActivity();
}

function suggestActivity(){
  const client = document.getElementById('client').value;
  const input = document.getElementById('activity').value.toLowerCase();
  if(activityHistory[client]){
    const suggestions = activityHistory[client].filter(a => a.toLowerCase().includes(input));
    const box = document.getElementById('activity-suggestions');
    box.innerHTML = suggestions.map(a => `<li onclick="selectActivity('${a}')">${a}</li>`).join('');
    box.style.display = suggestions.length ? 'block' : 'none';
  }
}

function selectActivity(a){
  document.getElementById('activity').value = a;
  document.getElementById('activity-suggestions').style.display = 'none';
}

// ---------------- STATUS UPDATE
document.getElementById('status').addEventListener('change', ()=>{
  const uc = document.getElementById('update');
  uc.parentElement.style.display = document.getElementById('status').value === 'ongoing' ? 'block' : 'none';
  if(document.getElementById('status').value !== 'ongoing') document.getElementById('update').value = '';
});

// ---------------- SAVE LOG
function saveLog(){
  const date = document.getElementById('date').value;
  const client = document.getElementById('client').value.trim();
  const activity = document.getElementById('activity').value.trim();
  const status = document.getElementById('status').value;
  const update = document.getElementById('update').value.trim();

  if(!date || !client || !activity) { alert("Fill all fields"); return; }

  if(!clientHistory.includes(client)) clientHistory.push(client);
  if(!activityHistory[client]) activityHistory[client] = [];
  if(!activityHistory[client].includes(activity)) activityHistory[client].push(activity);

  logData.push({date, client, activity, status, update});
  if(logData.length>15) logData.shift();

  localStorage.setItem('workLogs', JSON.stringify(logData));
  localStorage.setItem('clients', JSON.stringify(clientHistory));
  localStorage.setItem('activities', JSON.stringify(activityHistory));

  updateHistoryTable();
  renderClientDropdown();

  document.getElementById('date').value = '';
  document.getElementById('client').value = '';
  document.getElementById('activity').value = '';
  document.getElementById('status').value = 'new';
  document.getElementById('update').value = '';
  document.getElementById('update').parentElement.style.display = 'none';
}

// ---------------- HISTORY TABLE
function updateHistoryTable(){
  const tbody = document.querySelector("#history-table tbody");
  tbody.innerHTML = '';
  logData.forEach((log,index)=>{
    const row = tbody.insertRow();
    row.insertCell(0).innerText = log.date;
    row.insertCell(1).innerText = log.client;
    row.insertCell(2).innerText = log.activity;
    row.insertCell(3).innerText = log.update;
    row.insertCell(4).innerText = log.status;

    const actions = row.insertCell(5);
    const editBtn = document.createElement('button');
    editBtn.innerText = 'Edit';
    editBtn.onclick = ()=>editLog(index);
    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = 'Delete';
    deleteBtn.onclick = ()=>deleteLog(index);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
  });
}

// ---------------- EDIT/DELETE
function editLog(index){
  const log = logData[index];
  document.getElementById('date').value = log.date;
  document.getElementById('client').value = log.client;
  document.getElementById('activity').value = log.activity;
  document.getElementById('status').value = log.status;
  if(log.status==='ongoing'){
    document.getElementById('update').parentElement.style.display='block';
    document.getElementById('update').value = log.update;
  }
  deleteLog(index);
}

function deleteLog(index){
  if(confirm("Are you sure?")){
    logData.splice(index,1);
    localStorage.setItem('workLogs', JSON.stringify(logData));
    updateHistoryTable();
    renderClientActivity();
  }
}

// ---------------- CLIENT ACTIVITY
function renderClientDropdown(){
  const select = document.getElementById('client-select');
  const prev = lastSelectedClient;
  select.innerHTML = clientHistory.map(c=>`<option value="${c}">${c}</option>`).join('');
  if(prev) select.value = prev;
}

function renderClientActivity(){
  const client = document.getElementById('client-select').value;
  lastSelectedClient = client;
  const tbody = document.querySelector("#client-activity-table tbody");
  tbody.innerHTML = '';
  const clientLogs = logData.filter(l=>l.client===client);
  clientLogs.forEach(l=>{
    const row = tbody.insertRow();
    row.insertCell(0).innerText = l.date;
    row.insertCell(1).innerText = l.activity;
    row.insertCell(2).innerText = l.update;
    row.insertCell(3).innerText = l.status;
    if(l.status==='new') row.style.fontWeight='bold';
  });
}
