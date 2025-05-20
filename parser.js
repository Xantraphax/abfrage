// parser.js
let correctData = [];
let inputFields = [];
let distractorData = []; // ⬅️ neu!

export function parseXML(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");

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
      const solution = cell.getAttribute("solution");
      const distractors = Array.from(cell.getElementsByTagName("distractor")).map(d => d.textContent);

      if (isInput) {
        dataRow.push(solution || ""); // lösung als inhalt im datenarray
        inputRow.push(true);
        distractorRow.push(distractors);
      } else {
        dataRow.push(cell.textContent);
        inputRow.push(false);
        distractorRow.push([]);
      }
    });

    data.push(dataRow);
    inputMap.push(inputRow);
    distractorMap.push(distractorRow);
  });

  return { data, inputMap, distractorMap, mode: "table" };
}


export function parseJSON(jsonText) {
  const obj = JSON.parse(jsonText);
  return { data: obj.data, inputMap: obj.inputMap, mode: "table" };
}
