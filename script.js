// Global arrays to store history and client data
let historyData = [];
let clientData = [];  // Store unique clients
let activityData = {};  // Store activities per client

// Function to save data and display it in the Activity History section
function saveData() {
  const date = document.getElementById("date").value;
  const client = document.getElementById("client").value;
  const activity = document.getElementById("activity").value;
  const status = document.getElementById("status").value;

  if (date && client && activity && status) {
    const newEntry = { date, client, activity, status };

    // Add the new entry to history data
    historyData.push(newEntry);

    // Update client data and activity data for suggestions
    if (!clientData.includes(client)) clientData.push(client);
    if (!activityData[client]) activityData[client] = [];
    if (!activityData[client].includes(activity)) activityData[client].push(activity);

    // Display the updated Activity History table
    displayHistoryTable();

    // Clear the input fields
    clearInputs();
  } else {
    alert("Please fill in all fields.");
  }
}

// Function to clear input fields after saving the data
function clearInputs() {
  document.getElementById("date").value = '';
  document.getElementById("activity").value = '';
  document.getElementById("status").value = 'Ongoing';
  document.getElementById("client").value = '';
  document.getElementById("client-suggestions").innerHTML = '';
  document.getElementById("activity-suggestions").innerHTML = '';
}

// Function to display the history table with saved data (max 15 rows)
function displayHistoryTable() {
  const tableBody = document.querySelector("#history-table tbody");
  tableBody.innerHTML = ''; // Clear previous rows

  // Limit to 15 rows
  const rowsToDisplay = historyData.slice(-15);

  // Loop through the data and add rows
  rowsToDisplay.forEach(entry => {
    const row = document.createElement("tr");
    row.classList.add(entry.status === 'New' ? 'new-activity' : ''); // Bold "New" activities

    row.innerHTML = `
      <td>${entry.date}</td>
      <td>${entry.activity}</td>
      <td>${entry.status}</td>
      <td>${entry.client}</td>
    `;
    tableBody.appendChild(row);
  });
}

// Function to show client suggestions as user types
function showClientSuggestions() {
  const clientInput = document.getElementById("client").value;
  const suggestionsList = document.getElementById("client-suggestions");
  suggestionsList.innerHTML = '';

  // Filter and display suggestions
  const filteredClients = clientData.filter(client => client.toLowerCase().startsWith(clientInput.toLowerCase()));
  
  filteredClients.forEach(client => {
    const li = document.createElement("li");
    li.textContent = client;
    li.onclick = () => {
      document.getElementById("client").value = client;
      suggestionsList.innerHTML = '';
      showActivitySuggestions();  // Show activity suggestions for the selected client
    };
    suggestionsList.appendChild(li);
  });
}

// Function to show activity suggestions based on selected client
function showActivitySuggestions() {
  const activityInput = document.getElementById("activity").value;
  const client = document.getElementById("client").value;
  const suggestionsList = document.getElementById("activity-suggestions");
  suggestionsList.innerHTML = '';

  // If client is selected, show activity suggestions
  if (client && activityData[client]) {
    const filteredActivities = activityData[client].filter(activity => activity.toLowerCase().startsWith(activityInput.toLowerCase()));

    filteredActivities.forEach(activity => {
      const li = document.createElement("li");
      li.textContent = activity;
      li.onclick = () => {
        document.getElementById("activity").value = activity;
        suggestionsList.innerHTML = '';
      };
      suggestionsList.appendChild(li);
    });
  }
}

// Function to switch between Work Log and Client Activity tabs
function switchTab(tab) {
  if (tab === 'work-log') {
    document.getElementById("work-log-section").style.display = "block";
    document.getElementById("client-activity-tab").style.display = "none";
  } else if (tab === 'client-activity') {
    document.getElementById("work-log-section").style.display = "none";
    document.getElementById("client-activity-tab").style.display = "block";
    displayClientActivities();
  }
}

// Function to filter client activities based on selected client
function filterClientActivities() {
  const selectedClient = document.getElementById("select-client").value;
  const filteredData = historyData.filter(entry => entry.client === selectedClient);

  const tableBody = document.querySelector("#client-activity-table tbody");
  tableBody.innerHTML = ''; // Clear previous rows

  // Loop through the filtered data and add rows
  filteredData.forEach(entry => {
    const row = document.createElement("tr");
    row.classList.add(entry.status === 'New' ? 'new-activity' : ''); // Bold "New" activities

    row.innerHTML = `
      <td>${entry.date}</td>
      <td>${entry.activity}</td>
      <td>${entry.status}</td>
    `;
    tableBody.appendChild(row);
  });
}