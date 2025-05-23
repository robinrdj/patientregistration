import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DBProvider } from "./context/DatabaseContext";
import RegistrationForm from "./components/RegistrationForm.tsx";

function App() {
  return (
    <DBProvider>
      <Router>
        <Routes>
          <Route index element={<RegistrationForm />} />
          <Route path="register" element={<RegistrationForm />} />
        </Routes>
      </Router>
    </DBProvider>
  );
}

export default App;
