// view.js
import { getParam } from './utils.js';

export function renderTable(data, inputFields, correctData, distractorData = []) {
  const container = document.getElementById("tableContainer");
  container.innerHTML = "";

  const table = document.createElement("table");
  const inputType = getParam("inputType"); // "text" oder "dropdown"

  data.forEach((row, rowIndex) => {
    const tr = document.createElement("tr");

    row.forEach((cell, cellIndex) => {
      const td = document.createElement("td");

      if (inputFields[rowIndex][cellIndex]) {
        const correct = correctData[rowIndex][cellIndex];

        if (inputType === "dropdown") {
          const select = document.createElement("select");
          select.dataset.row = rowIndex;
          select.dataset.cell = cellIndex;

          const distractors = distractorData?.[rowIndex]?.[cellIndex] || [];
          const options = shuffleArray([correct, ...distractors]);

          options.forEach(opt => {
            const optionEl = document.createElement("option");
            optionEl.value = opt;
            optionEl.textContent = opt;
            select.appendChild(optionEl);
          });

          td.appendChild(select);
        } else {
          const input = document.createElement("input");
          input.type = "text";
          input.dataset.row = rowIndex;
          input.dataset.cell = cellIndex;
          td.appendChild(input);
        }
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

export function renderImageMode(xmlDoc, correctData, inputFields, distractorData = []) {
  const inputType = getParam("inputType"); // "text" oder "dropdown"
  const image = xmlDoc.getElementsByTagName("image")[0];
  const fields = Array.from(xmlDoc.getElementsByTagName("field"));

  const imageContainer = document.getElementById("imageContainer");
  const img = document.getElementById("taskImage");
  img.src = image.getAttribute("src");

  imageContainer.querySelectorAll("input, select").forEach(el => el.remove());

  fields.forEach((field, index) => {
    const x = field.getAttribute("x");
    const y = field.getAttribute("y");
    const width = field.getAttribute("width");
    const height = field.getAttribute("height");
    const solution = field.getAttribute("solution");

    correctData[index] = [solution];
    inputFields[index] = [true];

    let inputElement;

    if (inputType === "dropdown") {
      const distractors = Array.from(field.getElementsByTagName("distractor")).map(d => d.textContent.trim());
      const options = shuffleArray([solution, ...distractors]);

      const select = document.createElement("select");
      select.dataset.row = index;
      select.dataset.cell = 0;
      select.classList.add("image-input");

      options.forEach(opt => {
        const optionEl = document.createElement("option");
        optionEl.value = opt;
        optionEl.textContent = opt;
        select.appendChild(optionEl);
      });

      inputElement = select;
    } else {
      const input = document.createElement("input");
      input.type = "text";
      input.classList.add("image-input");
      input.dataset.row = index;
      input.dataset.cell = 0;
      inputElement = input;
    }

    // Style-Positionierung
    inputElement.style.left = x;
    inputElement.style.top = y;
    inputElement.style.width = width;
    inputElement.style.height = height;

    imageContainer.appendChild(inputElement);
  });

  imageContainer.classList.remove("hidden");
  document.getElementById("checkButton").classList.remove("hidden");
  document.getElementById("feedback").classList.add("hidden");
}

function shuffleArray(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}
