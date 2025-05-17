let correctData = [];
let inputFields = [];

function parseXML(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");

  // Bildmodus?
  if (xmlDoc.getElementsByTagName("imageTask").length > 0) {
    return { mode: "bild", xmlDoc };
  }

  // Tabellenmodus
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

  return { data, inputMap, mode: "table" };
}

function parseJSON(jsonText) {
  const obj = JSON.parse(jsonText);
  return { data: obj.data, inputMap: obj.inputMap, mode: "table" };
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
  document.getElementById("feedback").classList.add("hidden");
}

function renderImageMode(xmlDoc) {
  const image = xmlDoc.getElementsByTagName("image")[0];
  const fields = Array.from(xmlDoc.getElementsByTagName("field"));

  const imageContainer = document.getElementById("imageContainer");
  const img = document.getElementById("taskImage");
  img.src = image.getAttribute("src");

  // Alte Inputs löschen
  imageContainer.querySelectorAll("input").forEach(input => input.remove());

  correctData = [];
  inputFields = [];

  fields.forEach((field, index) => {
    const x = field.getAttribute("x");
    const y = field.getAttribute("y");
    const width = field.getAttribute("width");
    const height = field.getAttribute("height");
    const solution = field.getAttribute("solution");

    correctData[index] = [solution];
    inputFields[index] = [true];

    const input = document.createElement("input");
    input.type = "text";
    input.classList.add("image-input");
    input.dataset.row = index;
    input.dataset.cell = 0;

    input.style.left = x;
    input.style.top = y;
    input.style.width = width;
    input.style.height = height;

    imageContainer.appendChild(input);
  });

  imageContainer.classList.remove("hidden");
  document.getElementById("checkButton").classList.remove("hidden");
  document.getElementById("feedback").classList.add("hidden");
}

function checkInputs() {
  const inputs = document.querySelectorAll("input[type='text']");
  let allCorrect = true;

  const individualFeedback =
    new URLSearchParams(window.location.search).get("feedback") === "individual";

  inputs.forEach(input => {
    const row = parseInt(input.dataset.row);
    const cell = parseInt(input.dataset.cell);
    const value = input.value.trim();
    const correct = correctData[row][cell];
    const isCorrect = value === correct;

    if (!isCorrect) {
      allCorrect = false;
    }

    if (individualFeedback) {
      input.style.backgroundColor = isCorrect ? "#c8f7c5" : "#f7c5c5";
    } else {
      input.style.backgroundColor = "";
    }
  });

  const feedback = document.getElementById("feedback");
  feedback.classList.remove("hidden", "success", "error");
  feedback.classList.add(allCorrect ? "success" : "error");
  feedback.textContent = allCorrect
    ? "Alle Eingaben sind korrekt!"
    : "Ein oder mehrere Eingaben sind falsch.";
}

// === EVENT LISTENER ===

document.getElementById("loadButton").addEventListener("click", () => {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    let result;
    if (file.name.endsWith(".xml")) {
      result = parseXML(e.target.result);
      if (result.mode === "bild") {
        renderImageMode(result.xmlDoc);
      } else {
        correctData = result.data;
        inputFields = result.inputMap;
        renderTable(correctData, inputFields);
      }
    } else if (file.name.endsWith(".json")) {
      result = parseJSON(e.target.result);
      correctData = result.data;
      inputFields = result.inputMap;
      renderTable(correctData, inputFields);
    } else {
      alert("Nur .json oder .xml Dateien erlaubt.");
    }
  };

  reader.readAsText(file);
});

document.getElementById("checkButton").addEventListener("click", checkInputs);

// === AUTOMATISCHES LADEN ===

const urlParams = new URLSearchParams(window.location.search);
const autoLoad = urlParams.get("auto") === "true";
const filePath = urlParams.get("file");
const mode = urlParams.get("mode");

if (autoLoad && filePath) {
  fetch(filePath)
    .then(response => {
      if (!response.ok) throw new Error("Datei konnte nicht geladen werden.");
      return response.text();
    })
    .then(text => {
      if (filePath.endsWith(".xml")) {
        const result = parseXML(text);
        if (result.mode === "bild") {
          renderImageMode(result.xmlDoc);
        } else {
          correctData = result.data;
          inputFields = result.inputMap;
          renderTable(correctData, inputFields);
        }
      } else if (filePath.endsWith(".json")) {
        const result = parseJSON(text);
        correctData = result.data;
        inputFields = result.inputMap;
        renderTable(correctData, inputFields);
      } else {
        throw new Error("Nur .json oder .xml wird unterstützt.");
      }
    })
    .catch(err => {
      const container = document.getElementById("tableContainer");
      container.innerHTML = `<p style="color: red;">Fehler beim Laden: ${err.message}</p>`;
    });
}
