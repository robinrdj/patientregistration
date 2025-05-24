import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DBProvider } from "./context/DatabaseContext";
import RegistrationForm from "./components/RegistrationForm.tsx";
import AdvancedQuery from "./components/AdvancedQuery.tsx";
import PatientsTable from "./components/PatientsTable.tsx";
import Navbar from "./components/Navbar.tsx";
import Home from "./components/Home.tsx";
import RegistrationExcel from "./components/RegistrationExcel.tsx";
// import Footer from "./components/Footer.tsx";
function App() {
  return (
    <DBProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* <Route index element={<Home />} /> */}
              <Route path="/" element={<Home />} />
              <Route path="home" element={<Home />} />
              <Route path="register" element={<RegistrationForm />} />
              <Route path="advancedQuery" element={<AdvancedQuery />} />
              <Route path="table" element={<PatientsTable />} />
              <Route path="excel" element={<RegistrationExcel />} />
            </Routes>
          </main>
          {/* <Footer /> */}
        </div>
      </Router>
    </DBProvider>
  );
}

export default App;
