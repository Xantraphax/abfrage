// parser.js

export function parseXML(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");

  if (xmlDoc.getElementsByTagName("imageTask").length > 0) {
    return { mode: "bild", xmlDoc };
  }

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

export function parseJSON(jsonText) {
  const obj = JSON.parse(jsonText);
  return { data: obj.data, inputMap: obj.inputMap, mode: "table" };
}
