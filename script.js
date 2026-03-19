// ---------------- Data with persistence (add CEM and Lawyer)
let clientHistory = JSON.parse(localStorage.getItem("clients")) || [];
let activityHistory = JSON.parse(localStorage.getItem("activities")) || {};
let cemHistory = JSON.parse(localStorage.getItem("cem")) || [];  // Store CEM data
let lawyerHistory = JSON.parse(localStorage.getItem("lawyers")) || [];  // Store Lawyer data
let logData = JSON.parse(localStorage.getItem("workLogs")) || [];
let lastSelectedClient = null;

// ---------------- Default Tab
window.onload = () => {
  showTab(1); // Only show Tab 1 initially
  updateHistoryTable();
  renderClientDropdown();
  renderClientActivity();
};

// ---------------- Tab switching
function showTab(tabNumber) {
  document.querySelectorAll(".tab").forEach(t => t.style.display = "none");
  document.getElementById("tab" + tabNumber).style.display = "block";

  // Highlight active button
  document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active-tab-button"));
  document.querySelectorAll(".tab-button")[tabNumber-1].classList.add("active-tab-button");

  if(tabNumber === 2) renderClientDropdown(), renderClientActivity();
}

// ---------------- Client auto-suggest (only shows existing data)
function suggestClient() {
  const input = document.getElementById('client').value.toLowerCase();
  const suggestions = clientHistory.filter(c => c.toLowerCase().includes(input));
  const box = document.getElementById('client-suggestions');
  box.innerHTML = suggestions.map(c => `<div onclick="selectClient('${c}')">${c}</div>`).join('');
  box.style.display = suggestions.length ? 'block' : 'none';
}

function suggestCem() {
  const input = document.getElementById('cem').value.toLowerCase();
  const suggestions = cemHistory.filter(c => c.toLowerCase().includes(input));
  const box = document.getElementById('cem-suggestions');
  box.innerHTML = suggestions.map(c => `<div onclick="selectCem('${c}')">${c}</div>`).join('');
  box.style.display = suggestions.length ? 'block' : 'none';
}

function suggestLawyer() {
  const input = document.getElementById('lawyer').value.toLowerCase();
  const suggestions = lawyerHistory.filter(l => l.toLowerCase().includes(input));
  const box = document.getElementById('lawyer-suggestions');
  box.innerHTML = suggestions.map(l => `<div onclick="selectLawyer('${l}')">${l}</div>`).join('');
  box.style.display = suggestions.length ? 'block' : 'none';
}

// ---------------- Client select functions
function selectClient(client) {
  document.getElementById('client').value = client;
  document.getElementById('client-suggestions').style.display = 'none';
  suggestActivity();
}

function selectCem(cem) {
  document.getElementById('cem').value = cem;
  document.getElementById('cem-suggestions').style.display = 'none';
}

function selectLawyer(lawyer) {
  document.getElementById('lawyer').value = lawyer;
  document.getElementById('lawyer-suggestions').style.display = 'none';
}

// ---------------- Save log (with CEM and Lawyer handling)
function saveLog() {
  const date = document.getElementById('date').value;
  const client = document.getElementById('client').value.trim();
  const cem = document.getElementById('cem').value.trim();
  const lawyer = document.getElementById('lawyer').value.trim();
  const activity = document.getElementById('activity').value.trim();
  const status = document.getElementById('status').value;
  const updateVal = document.getElementById('update').value.trim();

  if(!date || !client || !activity) { alert("Please fill all fields"); return; }

  // Add to client history
  if(!clientHistory.includes(client)) clientHistory.push(client);
  // Add to CEM history
  if(cem && !cemHistory.includes(cem)) cemHistory.push(cem);
  // Add to Lawyer history
  if(lawyer && !lawyerHistory.includes(lawyer)) lawyerHistory.push(lawyer);

  // Add to activity history
  if(!activityHistory[client]) activityHistory[client] = [];
  if(!activityHistory[client].includes(activity)) activityHistory[client].push(activity);

  logData.push({ date, client, cem, lawyer, activity, status, update: updateVal });

  // Persist to localStorage if available
  if (isLocalStorageAvailable()) {
    localStorage.setItem("clients", JSON.stringify(clientHistory));
    localStorage.setItem("activities", JSON.stringify(activityHistory));
    localStorage.setItem("cem", JSON.stringify(cemHistory));  // Save CEM data
    localStorage.setItem("lawyers", JSON.stringify(lawyerHistory));  // Save Lawyer data
    localStorage.setItem("workLogs", JSON.stringify(logData));
  } else {
    alert("LocalStorage is not available. Data will not persist.");
  }

  updateHistoryTable();
  renderClientDropdown();
  renderClientActivity();

  // Reset fields
  document.getElementById('date').value = '';
  document.getElementById('client').value = '';
  document.getElementById('cem').value = '';
  document.getElementById('lawyer').value = '';
  document.getElementById('activity').value = '';
  document.getElementById('status').value = 'new';
  document.getElementById('update').value = '';
  document.getElementById('update-container').style.display = 'none';
}

// ---------------- Update history table (with CEM and Lawyer beside Date)
function updateHistoryTable() {
  const tbody = document.querySelector("#history-table tbody");
  tbody.innerHTML = '';
  logData.forEach((l, i) => {
    const row = tbody.insertRow();
    row.insertCell(0).innerText = l.date;
    row.insertCell(1).innerText = l.cem; // Show CEM right after Date
    row.insertCell(2).innerText = l.lawyer; // Show Lawyer right after Date
    row.insertCell(3).innerText = l.client;
    row.insertCell(4).innerText = l.activity;
    row.insertCell(5).innerText = l.update;
    row.insertCell(6).innerText = l.status;

    const actions = row.insertCell(7);
    const editBtn = document.createElement("button");
    editBtn.innerText = "Edit";
    editBtn.onclick = () => editLog(i);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Delete";
    deleteBtn.onclick = () => deleteLog(i);

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
  });
}

// ---------------- LocalStorage Check (Cross-browser compatibility)
function isLocalStorageAvailable() {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}
