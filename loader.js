// loader.js

import { parseXML, parseJSON } from './parser.js';
import { renderTable, renderImageMode } from './view.js';
import { getParam } from './utils.js';

let correctData = [];
let inputFields = [];
let distractorData = [];

function checkInputs() {
  const allInputs = document.querySelectorAll("input[type='text'], select");
  let allCorrect = true;

  const individualFeedback = getParam("feedback") === "individual";

  allInputs.forEach(input => {
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

    if (headlineText) {
      h1.textContent = decodeURIComponent(headlineText);
    }

    headlineEl.style.display = "block";
  }

  document.getElementById("loadButton")?.addEventListener("click", () => {
    const file = document.getElementById("fileInput").files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;
      let result;

      if (file.name.endsWith(".xml")) {
        result = parseXML(text);
      } else if (file.name.endsWith(".json")) {
        result = parseJSON(text);
      } else {
        alert("Nur .json oder .xml Dateien erlaubt.");
        return;
      }

      correctData = result.data;
      inputFields = result.inputMap;
      distractorData = result.distractorMap || [];

      if (result.mode === "bild") {
        renderImageMode(result.xmlDoc, correctData, inputFields);
      } else {
        renderTable(correctData, inputFields, correctData, distractorData);
      }
    };

    reader.readAsText(file);
  });

  document.getElementById("checkButton")?.addEventListener("click", checkInputs);

  const autoLoad = getParam("auto") === "true";
  const filePath = getParam("file");

  if (autoLoad && filePath) {
    fetch(filePath)
      .then(response => {
        if (!response.ok) throw new Error("Datei konnte nicht geladen werden.");
        return response.text();
      })
      .then(text => {
        let result;

        if (filePath.endsWith(".xml")) {
          result = parseXML(text);
        } else if (filePath.endsWith(".json")) {
          result = parseJSON(text);
        } else {
          throw new Error("Nur .json oder .xml wird unterstützt.");
        }

        correctData = result.data;
        inputFields = result.inputMap;
        distractorData = result.distractorMap || [];

        if (result.mode === "bild") {
          renderImageMode(result.xmlDoc, correctData, inputFields);
        } else {
          renderTable(correctData, inputFields, correctData, distractorData);
        }
      })
      .catch(err => {
        const container = document.getElementById("tableContainer");
        container.innerHTML = `<p style="color: red;">Fehler beim Laden: ${err.message}</p>`;
      });
  }
});
