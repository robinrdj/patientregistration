import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DBProvider } from "./context/DatabaseContext";
import RegistrationForm from "./components/RegistrationForm.tsx";
import AdvancedQuery from "./components/AdvancedQuery.tsx";
import PatientsTable from "./components/PatientsTable.tsx";
import Navbar from "./components/Navbar.tsx";
function App() {
  return (
    <DBProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route index element={<RegistrationForm />} />
          <Route path="register" element={<RegistrationForm />} />
          <Route path="advancedQuery" element={<AdvancedQuery />} />
          <Route path="table" element={<PatientsTable />} />
        </Routes>
      </Router>
    </DBProvider>
  );
}

export default App;
