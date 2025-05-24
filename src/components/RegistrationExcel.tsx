import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { addPatient } from "../Databases/DB";
import "./RegistrationExcel.css";
import ExcelInstructions from "./ExcelInstructions";

interface FormData {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  medicalHistory: string;
}

const formatDate = (input: any): string => {
  if (typeof input === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const date = new Date(excelEpoch.getTime() + input * 86400000);
    return date.toISOString().split("T")[0];
  }

  if (typeof input === "string") {
    const parts = input.split(/[\/\-]/);
    if (parts.length === 3) {
      const [d, m, y] = parts.map(Number);
      const date = new Date(Date.UTC(y, m - 1, d));
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }
    }
  }

  const date = new Date(input);
  return !isNaN(date.getTime()) ? date.toISOString().split("T")[0] : "";
};

const normalizeRow = (raw: any): FormData => ({
  firstName: (raw.firstName || raw.firstname || "").trim(),
  lastName: (raw.lastName || raw.lastname || "").trim(),
  dob: formatDate(raw.dob || raw.DOB || ""),
  gender: (raw.gender || "").trim().toLowerCase(),
  email: (raw.email || "").trim(),
  phone: (raw.phone || "").toString().trim(),
  address: (raw.address || "").trim(),
  medicalHistory: (raw.medicalHistory || raw.medicalhistory || "").trim(),
});

const RegistrationExcel: React.FC = () => {
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawJson = XLSX.utils.sheet_to_json(sheet);

        let successCount = 0;
        let skippedCount = 0;

        for (const raw of rawJson) {
          const normalized = normalizeRow(raw);

          if (
            !normalized.firstName ||
            !normalized.lastName ||
            !normalized.dob ||
            !normalized.gender
          ) {
            skippedCount++;
            continue;
          }

          await addPatient(normalized);
          successCount++;
        }

        const successMessage = `✅ Registered ${successCount} patients. Skipped ${skippedCount} invalid rows.`;
        setMessage(successMessage);
        alert(successMessage);
      } catch (error) {
        console.error("Error processing file:", error);
        setMessage("❌ Error processing file.");
        alert("❌ Error processing file. Please check your Excel format.");
      } finally {
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="excel-container">
      <h2>Bulk Patient Registration</h2>
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileUpload}
        ref={fileInputRef}
      />
      {message && <p className="excel-message">{message}</p>}
      <ExcelInstructions />
    </div>
  );
};

export default RegistrationExcel;
