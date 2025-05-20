// view.js

export function renderTable(data, inputFields) {
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

export function renderImageMode(xmlDoc, correctData, inputFields) {
  const image = xmlDoc.getElementsByTagName("image")[0];
  const fields = Array.from(xmlDoc.getElementsByTagName("field"));

  const imageContainer = document.getElementById("imageContainer");
  const img = document.getElementById("taskImage");
  img.src = image.getAttribute("src");

  imageContainer.querySelectorAll("input").forEach(input => input.remove());

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
