import React, { useState } from "react";
import "./First.css";

function First() {
  const accessColumns = [
    { badge: "PACK", log: "LOG_1", name: "PACK" },
    { badge: "REBIN", log: "LOG_2", name: "REBIN" },
    { badge: "TOTE WRANGLER", log: "LOG_3", name: "TOTE WRANGLER" },
    { badge: "ICQA", log: "LOG_4", name: "ICQA" },
    { badge: "STOW", log: "LOG_5", name: "STOW" },
    { badge: "PICK", log: "LOG_6", name: "PICK" },
    { badge: "PACK SLAM ", log: "LOG_7", name: "PACK SLAM" },
  ];

  const [employees, setEmployees] = useState([]);
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [selectedAccess, setSelectedAccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const delimiter = text.includes(";") ? ";" : ",";
      const rows = text
        .split("\n")
        .map(row => row.split(delimiter).map(cell => cell.trim()));
      const headers = rows[0];
      const data = rows.slice(1).map(row => {
        let obj = {};
        headers.forEach((h, i) => {
          obj[h] = row[i] || "";
        });
        return obj;
      });
      processData(data);
      setLoading(false);
    };
    reader.readAsText(file);
  };

  const processData = (rawData) => {
    let temp = {};
    rawData.forEach(row => {
      accessColumns.forEach(col => {
        let badgeId = row[col.badge]?.trim();
        let logId = row[col.log]?.trim();
        if (!badgeId || !logId || badgeId === "0" || logId === "0") return;
        if (!temp[badgeId]) {
          temp[badgeId] = {
            badgeId,
            logIds: new Set(),
            access: new Set()
          };
        }
        temp[badgeId].logIds.add(logId);
        temp[badgeId].access.add(col.name);
      });
    });

    const finalData = Object.values(temp).map(emp => ({
      badgeId: emp.badgeId,
      logIds: [...emp.logIds],
      access: [...emp.access]
    }));
    setEmployees(finalData);
  };

  const handleSearch = () => {
    const list = input
      .split(/[\s,]+/)
      .map(i => i.trim())
      .filter(Boolean);

    const found = employees.filter(emp =>
      list.includes(emp.badgeId) ||
      emp.logIds.some(log => list.includes(log))
    );
    setResults(found);
  };

  const filteredResults = selectedAccess
    ? results.filter(emp => emp.access.includes(selectedAccess))
    : results;

  const uniqueAccess = [...new Set(accessColumns.map(a => a.name))];

  const copyTable = () => {
    const text = filteredResults
      .flatMap(emp => emp.logIds)
      .join("\n");
    navigator.clipboard.writeText(text);
    alert("Log IDs copied ✅");
  };

  return (
    <div className="dashboard-card">
      <h2 className="dashboard-title">Employee Access</h2>

      <div className="controls">
        <input type="file" onChange={handleFileUpload} className="input" />
        <input
          className="input"
          type="text"
          placeholder="Search Badge or Log IDs"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="button" onClick={handleSearch}>Search</button>
        <select
          className="select"
          value={selectedAccess}
          onChange={(e) => setSelectedAccess(e.target.value)}
        >
          <option value="">All Access</option>
          {uniqueAccess.map((a,i) => <option key={i} value={a}>{a}</option>)}
        </select>
        {filteredResults.length > 0 && (
          <button className="button" onClick={copyTable}>Copy Log IDs</button>
        )}
      </div>
       <tr className="total-row">
              <td colSpan={3}>Total People: {filteredResults.length}</td>
            </tr>


      {loading && <div className="loading">Loading CSV data... ⏳</div>}

      {filteredResults.length === 0 && results.length > 0 && (
        <div className="no-result">No matching access ❌</div>
      )}

      {filteredResults.length > 0 && (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Log IDs</th>
              <th>Badge ID</th>
              <th>Access</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((emp, index) => (
              <tr key={index}>
                <td>{emp.logIds.join(", ")}</td>
                <td>{emp.badgeId}</td>
                <td>{emp.access.join(", ")}</td>
              </tr>
            ))}
            {/* <tr className="total-row">
              <td colSpan={3}>Total People: {filteredResults.length}</td>
            </tr> */}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default First;