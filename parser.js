import { getParam } from './utils.js';

export function parseXML(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");

  const useDropdown = getParam("inputType") === "dropdown";
  const isImageMode = xmlDoc.getElementsByTagName("image").length > 0;

  if (isImageMode) {
    const fields = Array.from(xmlDoc.getElementsByTagName("field"));
    const data = [];
    const inputMap = [];
    const distractorMap = [];

    fields.forEach((field, index) => {
      const solution = field.getAttribute("solution")?.trim() || "";
      const distractors = Array.from(field.getElementsByTagName("distractor")).map(d => d.textContent.trim());

      data.push([solution]);
      inputMap.push([true]);
      distractorMap.push([useDropdown ? distractors : []]);
    });

    return {
      data,
      inputMap,
      distractorMap: useDropdown ? distractorMap : [],
      mode: "bild",
      xmlDoc
    };
  }

  // Fallback: Tabellen-Modus
  const rows = Array.from(xmlDoc.getElementsByTagName("row"));
  const data = [];
  const inputMap = [];
  const distractorMap = [];

  rows.forEach((row, rowIndex) => {
    const cells = Array.from(row.getElementsByTagName("cell"));
    const dataRow = [];
    const inputRow = [];
    const distractorRow = [];

    cells.forEach(cell => {
      const isInput = cell.getAttribute("input") === "true";
      const solution = cell.getAttribute("solution")?.trim() || "";
      const distractors = Array.from(cell.getElementsByTagName("distractor")).map(d => d.textContent.trim());

      if (isInput) {
        dataRow.push(solution);
        inputRow.push(true);
        distractorRow.push(useDropdown ? distractors : []);
      } else {
        dataRow.push(cell.textContent.trim());
        inputRow.push(false);
        distractorRow.push([]);
      }
    });

    data.push(dataRow);
    inputMap.push(inputRow);
    distractorMap.push(distractorRow);
  });

  return {
    data,
    inputMap,
    distractorMap: useDropdown ? distractorMap : [],
    mode: "table"
  };
}

export function parseJSON(jsonText) {
  const obj = JSON.parse(jsonText);
  return {
    data: obj.data,
    inputMap: obj.inputMap,
    distractorMap: obj.distractorMap || [],
    mode: "table"
  };
}
