import React, { useState } from "react";
import { useDBStatus } from "../context/DatabaseContext";
import { executeQuery } from "../Databases/DB";
import "./AdvancedQuery.css";
import { Copy, Download, Clipboard } from "lucide-react";
import * as XLSX from "xlsx";

const AdvancedQuery: React.FC = () => {
  // state variables
  const [isQuerying, setIsQuerying] = useState(false);
  const { ready } = useDBStatus();
  const [specificQuery, setSpecificQuery] = useState("SELECT * FROM patients");
  const [select, setSelect] = useState(false);
  const [queryResult, setQueryResult] = useState<{
    result: boolean;
    data: any[];
    err?: string;
  } | null>(null);

  // functions
  // handle functions
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
        err: err.message || "Some error occured while querying",
      });
    } finally {
      setIsQuerying(false);
    }
  };
  // copy json
  const copyJson = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setSelect(true);
      setTimeout(() => setSelect(false), 2000);
    });
  };

  // Download functions
  // Download csv file
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
  // Download JSON file
  const downloadResultsJSON = () => {
    if (!queryResult?.data || queryResult.data.length === 0) return;
    const jsonStr = JSON.stringify(queryResult.data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "query_results.json";
    link.click();
  };
  // Download Excel file
  const downloadResultsExcel = () => {
    if (!queryResult?.data || queryResult.data.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(queryResult.data);
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
            {isQuerying ? "Running" : "Run Example"}
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
              {/* Copy json button*/}
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

              {/* download buttons*/}
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
