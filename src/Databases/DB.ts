import { PGliteWorker } from "@electric-sql/pglite/worker";
var db: PGliteWorker | null = null;

// database
export const patDatabase = async (): Promise<PGliteWorker> => {
  if (!db) {
    try {
      const workerInstance = new Worker(
        new URL("/my-worker.js", import.meta.url),
        {
          type: "module",
        }
      );
      db = new PGliteWorker(workerInstance);
      await patSchema(db);
    } catch (error) {
      throw error;
    }
  }
  return db;
};

// schema
const patSchema = async (database: PGliteWorker) => {
  await database.query(`
    CREATE TABLE IF NOT EXISTS patients (
      id SERIAL PRIMARY KEY,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      dob TEXT NOT NULL,
      gender TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      medicalHistory TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await database.query(`
    CREATE INDEX IF NOT EXISTS idx_patient_name ON patients (lastName, firstName);
  `);
  console.log("patient Schema is working");
};

// CRUD  operations on Patients
// ReadPatients
export const getPatients = async (): Promise<any[]> => {
  const database = await patDatabase();
  try {
    const res = await database.query("SELECT * FROM patients");
    return res.rows || [];
  } catch (error) {
    console.error("following error occured", error);
    throw error;
  }
};
// QueryPatient
export const executeQuery = async (
  sqlQuery: string,
  params: any[] = []
): Promise<any> => {
  try {
    const database = await patDatabase();
    const res = await database.query(sqlQuery, params);
    return { success: true, data: res.rows || [], error: null };
  } catch (error: any) {
    console.error("following error occured", error);
    return {
      success: false,
      data: [],
      error: error.message || "there are some errors",
    };
  }
};
//ReadAnIndividualPatient
export const searchPatientsByName = async (
  searchTerm: string
): Promise<any[]> => {
  const database = await patDatabase();
  try {
    const res = await database.query(
      `SELECT * FROM patients
       WHERE firstName ILIKE $1 OR lastName ILIKE $2`,
      [`%${searchTerm}%`, `%${searchTerm}%`]
    );
    return res.rows || [];
  } catch (error) {
    console.error("following error occured", error);
    throw error;
  }
};
// CreatePatient
export const addPatient = async (patientData: any): Promise<any> => {
  const database = await patDatabase();
  const {
    firstName,
    lastName,
    dob,
    gender,
    email,
    phone,
    address,
    medicalHistory,
  } = patientData;
  console.log(patientData);
  const res = await database.query(
    `INSERT INTO patients 
      (firstName, lastName, dob, gender, email, phone, address, medicalHistory) 
     VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      firstName,
      lastName,
      dob,
      gender,
      email || null,
      phone || null,
      address || null,
      medicalHistory || null,
    ]
  );
  return res.rows?.[0];
};
// UpdatePatient
export const updatePatient = async (
  id: number,
  updatedData: {
    firstName?: string;
    lastName?: string;
    dob?: string;
    gender?: string;
    email?: string;
    phone?: string;
    address?: string;
    medicalHistory?: string;
  }
): Promise<any> => {
  const database = await patDatabase();
  const fields = Object.keys(updatedData);
  const values = Object.values(updatedData);
  if (fields.length === 0) {
    throw new Error("No fields to update.");
  }
  const setClause = fields.map((key, idx) => `${key} = $${idx + 1}`).join(", ");
  const query = `
    UPDATE patients
    SET ${setClause}
    WHERE id = $${fields.length + 1}
    RETURNING *;
  `;
  const res = await database.query(query, [...values, id]);
  return res.rows?.[0];
};
// DeletePatient
export const deletePatient = async (id: number): Promise<number | null> => {
  const database = await patDatabase();
  const res = await database.query(
    `SELECT COUNT(*) as count FROM patients WHERE id = $1`,
    [id]
  );
  const count = Number((res.rows?.[0] as { count: string }).count);
  if (count !== 1) return null;
  await database.query(`DELETE FROM patients WHERE id = $1`, [id]);
  return id;
};
