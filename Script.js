let correctData = [];
let inputFields = [];

function parseXML(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  const rows = Array.from(xmlDoc.getElementsByTagName("row"));
  return rows.map(row => {
    return Array.from(row.getElementsByTagName("cell")).map(cell => cell.textContent);
  });
}

function parseJSON(jsonText) {
  return JSON.parse(jsonText);
}

function renderTable(data, inputFields) {
  const container = document.getElementById("tableContainer");
  container.innerHTML = "";

  const table = document.createElement("table");

  data.forEach((row, rowIndex) => {
    const tr = document.createElement("tr");
    row.forEach((cell, cellIndex) => {
      const td = document.createElement("td");
      if (inputFields[rowIndex][cellIndex]) {
        const input = document.createElement("input");
        input.type = "text";
        input.dataset.row = rowIndex;
        input.dataset.cell = cellIndex;
        td.appendChild(input);
      } else {
        td.textContent = cell;
      }
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  container.appendChild(table);
  document.getElementById("checkButton").classList.remove("hidden");
}

function checkInputs() {
  const inputs = document.querySelectorAll("input[type='text']");
  let allCorrect = true;

  inputs.forEach(input => {
    const row = parseInt(input.dataset.row);
    const cell = parseInt(input.dataset.cell);
    const value = input.value.trim();
    if (value !== correctData[row][cell]) {
      allCorrect = false;
    }
  });

  const feedback = document.getElementById("feedback");
  feedback.classList.remove("hidden", "success", "error");
  feedback.classList.add(allCorrect ? "success" : "error");
  feedback.textContent = allCorrect
    ? "Alle Eingaben sind korrekt!"
    : "Ein oder mehrere Eingaben sind falsch.";
}

// Event Listener

document.getElementById("loadButton").addEventListener("click", () => {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    let data;
    if (file.name.endsWith(".xml")) {
      data = parseXML(e.target.result);
    } else if (file.name.endsWith(".json")) {
      data = parseJSON(e.target.result);
    } else {
      alert("Nur .json oder .xml Dateien erlaubt.");
      return;
    }

    correctData = data;

    // Beispielhafte Definition der Eingabefelder: Alles false außer gezielte Zellen
    inputFields = data.map(row => row.map(() => false));
    if (data.length > 1 && data[1].length > 1) inputFields[1][1] = true; // Beispiel: Alter bei Anna
    if (data.length > 2 && data[2].length > 2) inputFields[2][2] = true; // Beispiel: Stadt bei Ben

    renderTable(data, inputFields);
  };

  reader.readAsText(file);
});

document.getElementById("checkButton").addEventListener("click", checkInputs);
