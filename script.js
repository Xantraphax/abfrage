let correctData = [];
let inputFields = [];

function parseXML(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  const rows = Array.from(xmlDoc.getElementsByTagName("row"));

  const data = [];
  const inputMap = [];

  rows.forEach(row => {
    const cells = Array.from(row.getElementsByTagName("cell"));
    const dataRow = [];
    const inputRow = [];

    cells.forEach(cell => {
      dataRow.push(cell.textContent);
      inputRow.push(cell.getAttribute("input") === "true");
    });

    data.push(dataRow);
    inputMap.push(inputRow);
  });

  return { data, inputMap };
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
    if (file.name.endsWith(".xml")) {
      const result = parseXML(e.target.result);
      correctData = result.data;
      inputFields = result.inputMap;
    } else if (file.name.endsWith(".json")) {
      const result = parseJSON(e.target.result);
      correctData = result.data;
      inputFields = result.inputMap;
    } else {
      alert("Nur .json oder .xml Dateien erlaubt.");
      return;
    }

    renderTable(correctData, inputFields);
  };

  reader.readAsText(file);
});

document.getElementById("checkButton").addEventListener("click", checkInputs);
