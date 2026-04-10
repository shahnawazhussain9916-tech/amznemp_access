import React, { useState, useEffect, useRef } from "react";
import "./First.css";

function First() {

  const accessColumns = [
    { emp: "EMP_C-RET(SUB)", log: "LOG_C-RET(SUB)", badge: "BADGE_C-RET(SUB)", name: "C-RET SUB" },
    { emp: "EMP_RECEIVE_EACH", log: "LOG_RECEIVE_EACH", badge: "BADGE_RECEIVE_EACH", name: "RECEIVE EACH" },
    { emp: "EMP_CUBIC _SCAN", log: "LOG_CUBIC _SCAN", badge: "BADGE_CUBIC_SCAN", name: "CUBIC SCAN" },
    { emp: "EMP_RECEIVE_PALLET", log: "LOG_RECEIVE_PALLET", badge: "BADGE_RECEIVE_PALLET", name: "RECEIVE PALLET" },
    { emp: "EMP_C-RET_STOW", log: "LOG_C-RET_STOW", badge: "BADGE_C-RET_STOW", name: "C-RET STOW" },
    { emp: "EMP_PACK_MANUAL_SLAM", log: "LOG_PACK_MANUAL_SLAM", badge: "BADGE_PACK_MANUAL_SLAM", name: "PACK MANUAL SLAM" },
    { emp: "EMP_ICQA", log: "LOG_ICQA", badge: "BADGE_ICQA", name: "ICQA" },
    { emp: "EMP_V-RET_PACK", log: "LOG_V-RET_PACK", badge: "BADGE_V-RET_PACK", name: "V-RET PACK" },
    { emp: "EMP_STOW", log: "LOG_STOW", badge: "BADGE_STOW", name: "STOW" },
    { emp: "EMP_PICK", log: "LOG_PICK", badge: "BADGE_PICK", name: "PICK" },
    { emp: "EMP_PACK_SLAM", log: "LOG_PACK_SLAM", badge: "BADGE_PACK_SLAM", name: "PACK SLAM" },
    { emp: "EMP_PACK MULTIS", log: "LOG_PACK_MULTIS", badge: "BADGE_PACK_MULTIS", name: "PACK MULTIS" },
    { emp: "EMP_REBIN", log: "LOG_REBIN", badge: "BADGE_REBIN", name: "REBIN" },
    { emp: "EMP_TOTE WRANGLER", log: "LOG_TOTE WRANGLER", badge: "BADGE_TOTE_WRANGLER", name: "TOTE WRANGLER" },
  ];

  const [employees, setEmployees] = useState([]);
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [notFound, setNotFound] = useState([]); // 🟥 NEW
  const [selectedAccess, setSelectedAccess] = useState("");
  const [loading, setLoading] = useState(false);

  const inputRef = useRef();

  // ✅ FILE UPLOAD
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result;
      const delimiter = text.includes(";") ? ";" : ",";

      const rows = text
        .split(/\r?\n/)
        .map(row => row.split(delimiter).map(cell => cell.trim()));

      const headers = rows[0].map(h => h.trim());

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

  // ✅ PROCESS DATA
  const processData = (rawData) => {
    let temp = {};

    rawData.forEach(row => {
      accessColumns.forEach(col => {
        let employeeId = row[col.emp]?.trim().toLowerCase();
        let logId = row[col.log]?.trim().toLowerCase();
        let badgeId = row[col.badge]?.trim().toLowerCase();

        if (!employeeId || !logId || !badgeId) return;

        const key = `${employeeId}_${logId}_${badgeId}`;

        if (!temp[key]) {
          temp[key] = {
            employeeId,
            logId,
            badgeId,
            access: new Set()
          };
        }

        temp[key].access.add(col.name);
      });
    });

    const finalData = Object.values(temp).map(item => ({
      employeeId: item.employeeId,
      logId: item.logId,
      badgeId: item.badgeId,
      access: Array.from(item.access).sort().join(", ")
    }));

    setEmployees(finalData);
  };

  // ✅ SEARCH + NOT FOUND
  const handleSearch = () => {
    if (!input.trim()) return;

    const values = input
      .toLowerCase()
      .split(/[\s,]+/)
      .filter(Boolean);

    let foundItems = [];
    let notFoundItems = [];

    values.forEach(val => {
      const match = employees.find(emp =>
        emp.employeeId === val ||
        emp.logId === val ||
        emp.badgeId === val
      );

      if (match) {
        foundItems.push(match);
      } else {
        notFoundItems.push(val);
      }
    });

    // ✅ ADD FOUND (NO DUPLICATES)
    setResults(prev => {
      const combined = [...prev];

      foundItems.forEach(f => {
        const exists = combined.some(
          e =>
            e.employeeId === f.employeeId &&
            e.logId === f.logId &&
            e.badgeId === f.badgeId
        );

        if (!exists) combined.push(f);
      });

      return combined;
    });

    // 🟥 ADD NOT FOUND (NO DUPLICATES)
    setNotFound(prev => {
      const combined = [...prev];

      notFoundItems.forEach(n => {
        if (!combined.includes(n)) {
          combined.push(n);
        }
      });

      return combined;
    });

    setInput("");
  };

  // ✅ ENTER KEY
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // ✅ AUTO FOCUS
  useEffect(() => {
    inputRef.current?.focus();
  }, [results]);

  // ✅ FILTER
  const filteredResults = selectedAccess
    ? results.filter(emp => emp.access.includes(selectedAccess))
    : results;

  const uniqueAccess = [...new Set(accessColumns.map(a => a.name))];

  // ✅ CLEAR
  const clearSearch = () => {
    setInput("");
    setResults([]);
    setNotFound([]); // 🟥 CLEAR ALSO
  };

  // ✅ HIGHLIGHT
  const highlight = (text) => {
    if (!input) return text;
    const regex = new RegExp(`(${input})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? <mark key={i}>{part}</mark> : part
    );
  };

  return (
    <div className="dashboard-card">
      <h2 className="dashboard-title">Employee Access</h2>

      <div className="controls">
        <input type="file" onChange={handleFileUpload} className="input" />

        <input
          ref={inputRef}
          className="input"
          type="text"
          placeholder="BG ID / Emp ID / Log ID "
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button className="button" onClick={handleSearch}>
          Add
        </button>

        <button className="button" onClick={clearSearch}>
          Clear
        </button>

        <select
          className="select"
          value={selectedAccess}
          onChange={(e) => setSelectedAccess(e.target.value)}
        >
          <option value="">All Access</option>
          {uniqueAccess.map((a, i) => (
            <option key={i} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <div className="total-row">
        Total Count: {filteredResults.length}
      </div>

      {loading && <div className="loading">Loading CSV data... ⏳</div>}

      {/* 🟥 NOT FOUND DISPLAY */}
      {notFound.length > 0 && (
        <div className="not-found-box">
          <strong>Not Found Data:</strong>
          <div className="not-found-list">
            {notFound.join(", ")}
          </div>
        </div>
      )}

      {filteredResults.length > 0 && (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Log ID</th>
              <th>Badge ID</th>
              <th>Access</th>
            </tr>
          </thead>

          <tbody>
            {filteredResults.map((emp, index) => (
              <tr key={index}>
                <td>{highlight(emp.employeeId)}</td>
                <td>{highlight(emp.logId)}</td>
                <td>{highlight(emp.badgeId)}</td>
                <td>{emp.access}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default First;