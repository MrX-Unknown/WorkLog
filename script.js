let previousTab = 1;
let logData = JSON.parse(localStorage.getItem("workLogs")) || [];
let editIndex = null;

window.onload = () => {
  showTab(1);
  refreshAllTabs();
  handleStatusChange();
};

// ------------------- Tabs -------------------
function showTab(n){
  if(n !== 4) previousTab = n;

  document.querySelectorAll(".tab").forEach(t=>t.style.display="none");
  document.getElementById("tab"+n).style.display="block";

  document.querySelectorAll(".tab-button").forEach(b=>b.classList.remove("active-tab-button"));
  if(n <= 3){
    document.querySelectorAll(".tab-button")[n-1].classList.add("active-tab-button");
  }

  // Toggle UI visibility for Tab 4
  const header = document.querySelector("h1");
  const tabs = document.querySelector(".tabs");
  const hamburger = document.querySelector(".hamburger-container");

  if(n === 4){
    header.style.display = "none";
    tabs.style.display = "none";
    hamburger.style.display = "none";
  } else {
    header.style.display = "block";
    tabs.style.display = "flex";
    hamburger.style.display = "block";
  }
}

// ------------------- Save / Enter -------------------
function saveLog(){
  const date = dateVal('date');
  const cem = textVal('cem');
  const lawyer = textVal('lawyer');
  const client = textVal('client');
  const activity = textVal('activity');
  const status = document.getElementById('status').value;
  const updateVal = textVal('update');

  if(!date||!cem||!lawyer||!client||!activity) return alert("Fill all fields");

  const newLog = {date,cem,lawyer,client,activity,status,update:updateVal};

  if(editIndex !== null){
    logData[editIndex] = newLog;
    editIndex = null;
  } else {
    logData.push(newLog);
  }

  localStorage.setItem("workLogs", JSON.stringify(logData));

  if(status==='done'){
    moveGroupToDone(cem, lawyer, client, activity);
  }

  refreshAllTabs();
  resetForm();
}

// ------------------- Helpers -------------------
function textVal(id){ return document.getElementById(id).value.trim(); }
function dateVal(id){ return document.getElementById(id).value; }

// ------------------- Reset -------------------
function resetForm(){
  ['date','cem','lawyer','client','activity','update'].forEach(i=>{
    if(document.getElementById(i)) document.getElementById(i).value='';
  });
  document.getElementById('status').value='new';
  handleStatusChange();
}

// ------------------- Tab 1 Table -------------------
function updateHistoryTable(){
  const tbody = document.querySelector("#history-table tbody");
  tbody.innerHTML='';

  logData.forEach((l,i)=>{
    const r = tbody.insertRow();
    Object.values(l).forEach(v=>r.insertCell().innerText=v);

    const act = r.insertCell();
    act.innerHTML = `
      <button onclick="editLog(${i})">Edit</button>
      <button onclick="deleteLog(${i})">Delete</button>
    `;
  });
}

// ------------------- Edit -------------------
function editLog(i){
  const l = logData[i];
  editIndex = i;

  Object.keys(l).forEach(k=>{
    if(document.getElementById(k)) document.getElementById(k).value = l[k];
  });

  handleStatusChange();
}

// ------------------- Delete -------------------
function deleteLog(i){
  if(confirm("Delete this record?")){
    logData.splice(i,1);
    localStorage.setItem("workLogs", JSON.stringify(logData));
    refreshAllTabs();
  }
}

// ------------------- Status UI -------------------
function handleStatusChange(){
  const box = document.getElementById('update-container');
  const status = document.getElementById('status').value;

  if(status==='ongoing'){
    box.style.display='block';
    box.classList.add('visible');
  } else {
    box.style.display='none';
    box.classList.remove('visible');
  }
}

// ------------------- Tab 1 Suggestions & Sequential Input -------------------
function suggest(id){
  const box = document.getElementById(id+'-suggestions');
  if(!box) return;

  if(!canTypeNext(id)) return box.innerHTML='';

  const input = textVal(id).toLowerCase();
  const values = getValidSuggestions(id);

  box.innerHTML='';
  values.filter(v=>v.toLowerCase().includes(input)).slice(0,5)
    .forEach(v=>{
      const d=document.createElement('div');
      d.innerText=v;
      d.onclick=()=>{
        document.getElementById(id).value=v;
        box.innerHTML='';
        checkDuplicateStatus();
      };
      box.appendChild(d);
    });
}

function getValidSuggestions(id){
  if(logData.length===0) return [];
  if(id==='cem') return [...new Set(logData.map(l=>l.cem))];
  if(id==='lawyer') return [...new Set(logData.map(l=>l.lawyer))];
  if(id==='client') return [...new Set(logData.map(l=>l.client))];
  if(id==='activity') return [...new Set(logData.map(l=>l.activity))];
  return [];
}

function canTypeNext(id){
  if(id==='cem') return textVal('date') !== '';
  if(id==='lawyer') return textVal('cem') !== '';
  if(id==='client') return textVal('lawyer') !== '';
  if(id==='activity') return textVal('client') !== '';
  return true;
}

['cem','lawyer','client','activity'].forEach(id=>{
  const el = document.getElementById(id);
  el.addEventListener('focus', ()=>{
    if(!canTypeNext(id)){
      const prev = getPreviousField(id);
      alert(`Please fill ${prev} first.`);
      document.getElementById(prev).focus();
      return;
    }
    suggest(id);
  });
  el.addEventListener('input', ()=>{suggest(id); checkDuplicateStatus();});
});

function getPreviousField(id){
  if(id==='cem') return 'date';
  if(id==='lawyer') return 'cem';
  if(id==='client') return 'lawyer';
  if(id==='activity') return 'client';
  return '';
}

// ------------------- Auto-Set Status to 'On Going' if Duplicate -------------------
function checkDuplicateStatus(){
  const normalize = v => v.toLowerCase().trim();

  const cem = textVal('cem');
  const lawyer = textVal('lawyer');
  const client = textVal('client');
  const activity = textVal('activity');

  if(!cem || !lawyer || !client || !activity) return;

  const dup = logData.some(l =>
    normalize(l.cem) === normalize(cem) &&
    normalize(l.lawyer) === normalize(lawyer) &&
    normalize(l.client) === normalize(client) &&
    normalize(l.activity) === normalize(activity)
  );

  if(dup){
    document.getElementById('status').value = 'ongoing';
    handleStatusChange();
  } else {
    document.getElementById('status').value = 'new';
    handleStatusChange();
  }
}

// ------------------- Move group to Done -------------------
function moveGroupToDone(cem, lawyer, client, activity){
  logData.forEach(l => {
    if(l.cem===cem && l.lawyer===lawyer && l.client===client && l.activity===activity){
      if(l.status !== 'done') l._prevStatus = l.status;
      l.status='done';
    }
  });
  localStorage.setItem("workLogs", JSON.stringify(logData));
}

// ------------------- UPDATED Tab 2: Single table, aligned, 1-row spacing -------------------
// ------------------- Tab 2 (Client Activity) -------------------
function refreshTab2(){
  updateClientDropdown();
  updateClientActivityTable();
}

function updateClientDropdown(){
  const clientSelect = document.getElementById('client-select');
  const clients = [...new Set(logData.map(l=>l.client).filter(c=>{
    return logData.some(lg=>lg.client===c && (lg.status==='new'||lg.status==='ongoing'));
  }))];

  clientSelect.innerHTML = '<option value="">-- Select Client --</option>';
  clients.forEach(c=>{
    const opt = document.createElement('option');
    opt.value = c;
    opt.innerText = c;
    clientSelect.appendChild(opt);
  });
}

// ------------------- UPDATED Tab 2: Single table, aligned, 1-row spacing -------------------
function updateClientActivityTable(){
  const client = document.getElementById('client-select').value;
  const tbody = document.querySelector("#client-activity-table tbody");
  tbody.innerHTML = '';

  if(!client) return;

  const filteredLogs = logData.filter(l => l.client === client && (l.status==='new'||l.status==='ongoing'));

  // Group by CEM-Lawyer-Client-Activity
  const grouped = {};
  filteredLogs.forEach(l => {
    const key = [l.cem,l.lawyer,l.client,l.activity].join('|');
    if(!grouped[key]) grouped[key] = [];
    grouped[key].push(l);
  });

  Object.values(grouped).forEach(group => {
    group.forEach(l => {
      const r = tbody.insertRow();
      r.insertCell().innerText = l.date;
      r.insertCell().innerText = l.cem;
      r.insertCell().innerText = l.lawyer;
      r.insertCell().innerText = l.client;
      r.insertCell().innerText = l.activity;
      r.insertCell().innerText = l.update;
      const statusCell = r.insertCell();
      statusCell.innerText = l.status;
      r.style.fontWeight = (l.status==='new') ? '700' : '400';
    });
    // Insert 1-row spacing after each group
    const spacer = tbody.insertRow();
    const cell = spacer.insertCell();
    cell.colSpan = 7; // spans all table columns
    cell.style.height = '4px';
    cell.style.background = 'transparent';
  });
}

document.getElementById('client-select').addEventListener('change', updateClientActivityTable);

// ------------------- Tab 3 (Accomplished Log) -------------------
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
}

function updateAccomplishedTable(){
  const tbody = document.querySelector("#accomplished-table tbody");
  tbody.innerHTML='';

  const doneLogs = logData.filter(l => l.status==='done');
  const grouped = {};
  doneLogs.forEach(l=>{
    const key = [l.cem,l.lawyer,l.client,l.activity].join('|');
    if(!grouped[key]) grouped[key] = [];
    grouped[key].push(l);
  });

  Object.entries(grouped).forEach(([key, group])=>{
    const groupColor = stringToColor(key);
    group.forEach((l,i)=>{
      const r = tbody.insertRow();
      r.insertCell().innerText = l.date;
      r.insertCell().innerText = l.cem;
      r.insertCell().innerText = l.lawyer;
      r.insertCell().innerText = l.client;
      r.insertCell().innerText = l.activity;
      r.insertCell().innerText = l.update;
      const statusCell = r.insertCell();
      statusCell.innerText = l.status;
      r.style.fontWeight = '700';
      r.style.backgroundColor = groupColor + '33';
      const actionCell = r.insertCell();
      actionCell.innerHTML = `<button onclick="revertDoneGroup('${group[0].cem}','${group[0].lawyer}','${group[0].client}','${group[0].activity}')">Edit</button>`;
    });
  });
}

// ------------------- Revert Done Group -------------------
function revertDoneGroup(cem, lawyer, client, activity){
  if(confirm("Revert this group back to previous status?")){
    logData = logData.filter(l => {
      if(l.cem===cem && l.lawyer===lawyer && l.client===client && l.activity===activity){
        if(l.status==='done' && l._prevStatus){
          l.status = l._prevStatus;
          delete l._prevStatus;
          return true;
        }
        return l.status!=='done';
      }
      return true;
    });
    localStorage.setItem("workLogs", JSON.stringify(logData));
    refreshAllTabs();
  }
}

// ------------------- Refresh All Tabs -------------------
function refreshAllTabs(){
  updateHistoryTable();
  refreshTab2();
  updateAccomplishedTable();
}

// Existing code remains here (all your original JS) ...

// ------------------- Hamburger Button to Tab 4 -------------------
document.getElementById('hamburger-btn').addEventListener('click', () => {
  showTab(4);
});

// ------------------- back Button to Tab 4 -------------------
document.getElementById('back-btn').addEventListener('click', () => {
  showTab(previousTab);
});

// ------------------- Tab 2 (Client Activity) Updated -------------------
function refreshTab2(){
  updateClientDropdown();
  updateClientActivityTable();
}

function updateClientDropdown(){
  const clientSelect = document.getElementById('client-select');

  const clients = [...new Set(
    logData.map(l=>l.client).filter(c=>{
      return logData.some(lg=>lg.client===c && (lg.status==='new'||lg.status==='ongoing'));
    })
  )];

  clientSelect.innerHTML = '<option value="">-- Select Client --</option>';

  clients.forEach(c=>{
    const opt = document.createElement('option');
    opt.value = c;
    opt.innerText = c;
    clientSelect.appendChild(opt);
  });
}

function updateClientActivityTable(){
  const client = document.getElementById('client-select').value;
  const tbody = document.querySelector("#client-activity-table tbody");
  tbody.innerHTML = '';

  if(!client) return;

  const filteredLogs = logData.filter(l => 
    l.client === client && (l.status==='new'||l.status==='ongoing')
  );

  const grouped = {};

  filteredLogs.forEach(l => {
    const key = [l.cem,l.lawyer,l.client,l.activity].join('|');
    if(!grouped[key]) grouped[key] = [];
    grouped[key].push(l);
  });

  Object.values(grouped).forEach(group=>{
    group.forEach(l=>{
      const r = tbody.insertRow();

      r.insertCell().innerText = l.date;
      r.insertCell().innerText = l.cem;
      r.insertCell().innerText = l.lawyer;
      r.insertCell().innerText = l.client;
      r.insertCell().innerText = l.activity;
      r.insertCell().innerText = l.update;

      const statusCell = r.insertCell();
      statusCell.innerText = l.status;

      r.style.fontWeight = (l.status==='new') ? '700' : '400';
    });
  });
}

document.getElementById('client-select').addEventListener('change', updateClientActivityTable);
