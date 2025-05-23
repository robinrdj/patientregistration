import React, { useEffect, useState } from "react";
import {
  getPatients,
  searchPatientsByName,
  deletePatient,
} from "../Databases/DB";
import { useDBStatus } from "../context/DatabaseContext";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import "./PatientsTable.css";
import SortIcon from "../assets/sort-arrows-svgrepo-com.png";

interface Patient {
  id: number;
  firstname: string;
  lastname: string;
  dob: string;
  gender: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  medicalhistory: string | null;
  created_at: string;
}

const PatientsTable: React.FC = () => {
  const { ready } = useDBStatus();
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeSortKey, setActiveSortKey] = useState<keyof Patient>("lastname");
  const [sortOrder, setSortOrder] = useState<
    "ascendingorder" | "descendingorder"
  >("ascendingorder");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchMode, setSearchMode] = useState(false);

  useEffect(() => {
    if (ready) populateTable();
  }, [ready]);

  useEffect(() => {
    if (!searchMode) {
      populateTable();
      setSearch("");
    }
  }, [searchMode]);

  const populateTable = async () => {
    setIsLoading(true);
    try {
      const data = await getPatients();
      const loaded = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.data)
        ? (data as any).data
        : [];
      setPatients(loaded);
    } catch {
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) return populateTable();
    setIsLoading(true);
    try {
      const results = await searchPatientsByName(search);
      const found = Array.isArray(results)
        ? results
        : Array.isArray((results as any)?.data)
        ? (results as any).data
        : [];
      setPatients(found);
    } catch {
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this patient?"))
      return;
    try {
      const deletedId = await deletePatient(id);
      if (deletedId !== null) {
        setPatients(patients.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete patient:", err);
    }
  };

  const changeSortOrder = (key: keyof Patient) => {
    if (key === activeSortKey) {
      setSortOrder((prev) =>
        prev === "ascendingorder" ? "descendingorder" : "ascendingorder"
      );
    } else {
      setActiveSortKey(key);
      setSortOrder("ascendingorder");
    }
  };

  const customCompare = (a: any, b: any): number => {
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    if (typeof a === "string" && typeof b === "string")
      return a.localeCompare(b);
    return Number(a) - Number(b);
  };

  const sortedPatients = [...patients].sort((a, b) => {
    const aVal = a[activeSortKey];
    const bVal = b[activeSortKey];
    const comparison = customCompare(aVal, bVal);
    return sortOrder === "ascendingorder" ? comparison : -comparison;
  });

  const downloadPatientDataJson = () => {
    const jsonStr = JSON.stringify(patients, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "patient_data.json";
    link.click();
  };

  const downloadPatientDataExcel = () => {
    const formatted = patients.map(({ id, ...rest }) => ({
      ...rest,
      dob: new Date(rest.dob).toLocaleDateString(),
      created_at: new Date(rest.created_at).toLocaleDateString(),
    }));
    const sheet = XLSX.utils.json_to_sheet(formatted);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Patients");
    XLSX.writeFile(book, "patient_data.xlsx");
  };

  if (!ready) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="patient-list-page">
      <header className="header">
        <h1 className="title">Patients Table</h1>
      </header>

      <div className="search-container">
        {searchMode && (
          <>
            <input
              type="text"
              className="search-input"
              placeholder="Enter the name to search for patient"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button onClick={handleSearch} className="search-button">
              Search
            </button>
          </>
        )}
      </div>

      <div className="table-top">
        <button
          onClick={() => setSearchMode(!searchMode)}
          className="toggle-button"
        >
          {searchMode ? "Search Mode off" : "Search Mode on"}
        </button>

        <div className="export-buttons">
          <button
            onClick={downloadPatientDataJson}
            disabled={patients.length === 0}
          >
            <Download size={16} /> Export JSON
          </button>
          <button
            onClick={downloadPatientDataExcel}
            disabled={patients.length === 0}
          >
            <Download size={16} /> Export Excel
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      ) : patients.length === 0 ? (
        <div className="no-patient-msg">
          {search ? (
            <>
              <h3>No patients match your search criteria.</h3>
              <p>
                Kindly switch off the search mode to get all data in the table.
              </p>
            </>
          ) : (
            <p>
              There are no patients at this moment. Get started by adding a new
              patient.
            </p>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="patient-table">
            <thead>
              <tr>
                {[
                  { label: "Name", field: "lastname" },
                  { label: "Gender", field: "gender" },
                  { label: "Date of Birth", field: "dob" },
                  { label: "Phone", field: "phone", hideOnMobile: true },
                  {
                    label: "Registration Date",
                    field: "created_at",
                    hideOnMobile: true,
                  },
                ].map(({ label, field, hideOnMobile }) => (
                  <th
                    key={field}
                    onClick={() => changeSortOrder(field as keyof Patient)}
                    className={`sortable-header ${
                      hideOnMobile ? "phone-column-hide" : ""
                    }`}
                  >
                    <div className="sortable-column">
                      {label}{" "}
                      <img src={SortIcon} alt="sort" className="sort-img" />
                    </div>
                  </th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    {patient.firstname} {patient.lastname}
                  </td>
                  <td className="capitalize">{patient.gender}</td>
                  <td>{new Date(patient.dob).toLocaleDateString()}</td>
                  <td className="phone-column-hide">{patient.phone || "--"}</td>
                  <td className="phone-column-hide">
                    {new Date(patient.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(patient.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PatientsTable;
