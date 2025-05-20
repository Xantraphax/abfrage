// loader.js

import { parseXML, parseJSON } from './parser.js';
import { renderTable, renderImageMode } from './view.js';

let correctData = [];
let inputFields = [];

function getParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function checkInputs() {
  const inputs = document.querySelectorAll("input[type='text']");
  let allCorrect = true;
  const individualFeedback = getParam("feedback") === "individual";

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

document.addEventListener("DOMContentLoaded", () => {
  if (getParam("upload") === "true") {
    document.getElementById("uploadSection").style.display = "block";
  }

  const showHeadline = getParam("headline") === "true";
  const headlineText = getParam("headlineText");
  if (showHeadline) {
    const headlineEl = document.getElementById("headline");
    const h1 = headlineEl.querySelector("h1");
  
    // Setze Text, wenn headlineText vorhanden ist
    if (headlineText) {
      h1.textContent = decodeURIComponent(headlineText);
    }
  
    headlineEl.style.display = "block";
  }

  document.getElementById("loadButton").addEventListener("click", () => {
    const file = document.getElementById("fileInput").files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      let result;
      if (file.name.endsWith(".xml")) {
        result = parseXML(e.target.result);
        if (result.mode === "bild") {
          renderImageMode(result.xmlDoc, correctData, inputFields);
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

  const autoLoad = getParam("auto") === "true";
  const filePath = getParam("file");

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
            renderImageMode(result.xmlDoc, correctData, inputFields);
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
});
