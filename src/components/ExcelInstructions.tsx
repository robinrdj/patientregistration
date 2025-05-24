import React from "react";
import instructionImg from "../assets/sampleExcelImg.png";
import * as XLSX from "xlsx";

const downloadSampleExcel = () => {
  const headers = [
    "firstname",
    "lastname",
    "dob",
    "gender",
    "email",
    "phone",
    "address",
    "medicalhistory",
  ];

  const sampleData = [
    {
      firstname: "Robin",
      lastname: "Rajadurai J",
      dob: "5/9/1998",
      gender: "Male",
      email: "robinrajaduraij@gmail.com",
      phone: "6381907383",
      address: "5A, EKR Street, Anthiyur",
      medicalhistory: "Nothing",
    },
    {
      firstname: "Krishna",
      lastname: "Veni M",
      dob: "25/7/1999",
      gender: "Female",
      email: "krishnavenim@gmail.com",
      phone: "9940997382",
      address: "Bhavani Main Road, Erode",
      medicalhistory: "Nothing",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Patients");
  XLSX.writeFile(wb, "sample_patient_data.xlsx");
};

const ExcelInstructions: React.FC = () => (
  <div className="instruction-section">
    <img
      src={instructionImg}
      alt="Excel format example"
      className="instruction-image"
    />
    <p className="instruction-text">
      ⚠️ The Excel file must follow the exact header naming convention:
      <br />
      <strong>
        firstname, lastname, dob, gender, email, phone, address, medicalhistory
      </strong>
      <br />
      All data, including <strong>dob</strong> and <strong>phone</strong> must
      be <strong>strings</strong>.
      <br />
      dob should be in <strong>dd/mm/yyyy</strong> format
      <br />
      You can download a sample Excel by clicking the button below and edit it
      with your own data before uploading.
      <br />
    </p>
    <button className="download-btn" onClick={downloadSampleExcel}>
      📥 Download Sample Excel
    </button>
    <p>if you face errors of any kind, kindly use register via form option.</p>
  </div>
);

export default ExcelInstructions;
