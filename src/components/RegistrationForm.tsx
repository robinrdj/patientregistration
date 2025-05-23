import React, { useState } from "react";
import { addPatient } from "../Databases/DB";
import { useDBStatus } from "../context/DatabaseContext";
import "./RegistrationForm.css";

const RegistrationForm: React.FC = () => {
  //default form data
  const defaultData: FormData = {
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    email: "",
    phone: "",
    address: "",
    medicalHistory: "",
  };
  //form interface
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

  //state declarations
  const [registered, setRegistered] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { ready } = useDBStatus();
  const [formData, setFormData] = useState<FormData>(defaultData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );

  //   functions
  //   validations
  const CheckForm = (): boolean => {
    const err: Partial<Record<keyof FormData, string>> = {};
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      err.email = "email pattern is wrong";
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      err.phone = "phone number must be exactly 10 digits";
    }
    if (!formData.gender) err.gender = "Gender is missing";
    if (!formData.dob.trim()) err.dob = "dob is missing";
    if (!formData.firstName.trim()) err.firstName = "first name is missing";
    if (!formData.lastName.trim()) err.lastName = "last name is missing";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // handlingFunctions
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name as keyof FormData];
        return updated;
      });
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!CheckForm()) return;
    setRegistered(true);
    try {
      await addPatient(formData);
      setSubmitted(true);
      setFormData(defaultData);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error("following error occured", error);
    } finally {
      setRegistered(false);
    }
  };
  if (!ready) {
    return (
      <div className="centered">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <header>
        <h1>Register New Patient</h1>
      </header>

      {submitted && (
        <div className="success-box">
          <p>Patient registered successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-box" noValidate>
        <fieldset>
          <legend>Basic Information</legend>
          <label>
            First Name*:
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
            {errors.firstName && (
              <span className="error">{errors.firstName}</span>
            )}
          </label>

          <label>
            Last Name*:
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
            {errors.lastName && (
              <span className="error">{errors.lastName}</span>
            )}
          </label>

          <label>
            Date of Birth*:
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
            />
            {errors.dob && <span className="error">{errors.dob}</span>}
          </label>

          <label>
            Gender*:
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">--Select--</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="don't mention">Don't Mention</option>
            </select>
            {errors.gender && <span className="error">{errors.gender}</span>}
          </label>
        </fieldset>

        <fieldset>
          <legend>Contact Details</legend>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </label>

          <label>
            Phone:
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </label>

          <label>
            Address:
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
            />
          </label>
        </fieldset>

        <fieldset className="medical-history">
          <legend>Medical Records</legend>
          <label>
            Medical History:
            <textarea
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              rows={3}
            />
          </label>
        </fieldset>
        <div className="form-buttons">
          <button type="button" onClick={() => setFormData(defaultData)}>
            Clear Form
          </button>
          <button type="submit" disabled={registered}>
            {registered ? "Registering" : "Register Patient"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
