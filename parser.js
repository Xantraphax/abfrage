import { getParam } from './utils.js';

export function parseXML(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");

  const rows = Array.from(xmlDoc.getElementsByTagName("row"));
  const data = [];
  const inputMap = [];
  const distractorMap = [];

  const useDropdown = getParam("inputType") === "dropdown";

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
        distractorRow.push(useDropdown ? distractors : []); // Nur verwenden, wenn dropdown aktiviert
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
    distractorMap: useDropdown ? distractorMap : [], // Nur zurückgeben, wenn sinnvoll
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
