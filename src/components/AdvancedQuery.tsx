import React, { useState } from "react";
import { useDBStatus } from "../context/DatabaseContext";
import { executeQuery } from "../Databases/DB";
import "./AdvancedQuery.css";
import { Copy, Download, Clipboard } from "lucide-react";
import * as XLSX from "xlsx";

const AdvancedQuery: React.FC = () => {
  const [isQuerying, setIsQuerying] = useState(false);
  const { ready } = useDBStatus();
  const [specificQuery, setSpecificQuery] = useState("SELECT * FROM patients");
  const [select, setSelect] = useState(false);
  const [queryResult, setQueryResult] = useState<{
    result: boolean;
    data: any[];
    err?: string;
  } | null>(null);

  const handleExampleSetting = (example: string) => {
    setSpecificQuery(example);
  };

  const handleChangesInQuery = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSpecificQuery(e.target.value);
  };

  const handleSpecificQuery = async () => {
    if (!specificQuery.trim()) return;
    setIsQuerying(true);
    try {
      const result = await executeQuery(specificQuery);
      setQueryResult({
        result: result.success,
        data: result.data || [],
        err: result.error || undefined,
      });
    } catch (err: any) {
      setQueryResult({
        result: false,
        data: [],
        err: err.message || "Some error occurred while querying",
      });
    } finally {
      setIsQuerying(false);
    }
  };

  const copyJson = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setSelect(true);
      setTimeout(() => setSelect(false), 2000);
    });
  };

  const downloadResultsCSV = () => {
    if (!queryResult?.data || queryResult.data.length === 0) return;
    const csvContent = [
      Object.keys(queryResult.data[0]).join(","),
      ...queryResult.data.map((row) =>
        Object.values(row)
          .map((value) => `"${value}"`)
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "query_results.csv";
    link.click();
  };

  const downloadResultsJSON = () => {
    if (!queryResult?.data || queryResult.data.length === 0) return;
    const jsonStr = JSON.stringify(queryResult.data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "query_results.json";
    link.click();
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return isoDate;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const downloadResultsExcel = () => {
    if (!queryResult?.data || queryResult.data.length === 0) return;

    const formattedData = queryResult.data.map((row) => {
      const newRow = { ...row };
      if (newRow.dob) {
        newRow.dob = formatDate(newRow.dob);
      }
      return newRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
    XLSX.writeFile(workbook, "query_results.xlsx");
  };

  return (
    <div className="query-container">
      <div className="query-controls">
        <h2>Query Patients</h2>
        <div className="textarea-wrapper">
          <textarea
            value={specificQuery}
            onChange={handleChangesInQuery}
            className="query-textarea"
            rows={5}
            disabled={!ready}
          />
        </div>
        <div className="query-buttons">
          <button
            onClick={() => handleExampleSetting("SELECT * FROM patients")}
          >
            Load Example
          </button>
          <button onClick={handleSpecificQuery} disabled={isQuerying}>
            {isQuerying ? "Running" : "Run Query"}
          </button>
        </div>
      </div>

      {queryResult && (
        <div className="results-section">
          <div className="results-header">
            <h3>Results</h3>
            <div
              className="results-icons"
              style={{ display: "flex", gap: "8px" }}
            >
              <button
                onClick={() =>
                  copyJson(JSON.stringify(queryResult.data, null, 2))
                }
                title="Copy JSON"
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                {select ? <Clipboard size={16} /> : <Copy size={16} />}
                <span style={{ fontSize: 12, marginLeft: 4 }}>Copy JSON</span>
              </button>
              <button
                onClick={downloadResultsJSON}
                title="Download JSON"
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Download size={16} />
                <span style={{ fontSize: 12, marginLeft: 4 }}>
                  Download JSON
                </span>
              </button>
              <button
                onClick={downloadResultsCSV}
                title="Download CSV"
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Download size={16} />
                <span style={{ fontSize: 12 }}>Download CSV</span>
              </button>
              <button
                onClick={downloadResultsExcel}
                title="Download Excel"
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Download size={16} />
                <span style={{ fontSize: 12, marginLeft: 4 }}>
                  Download XLSX
                </span>
              </button>
            </div>
          </div>
          {queryResult.result ? (
            <pre className="results-data">
              {JSON.stringify(queryResult.data, null, 2)}
            </pre>
          ) : (
            <div className="results-err">{queryResult.err}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedQuery;
