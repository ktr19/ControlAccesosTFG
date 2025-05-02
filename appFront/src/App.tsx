import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../components/Login";
import UserTable from "../components/UserTable";
import EditEmployee from "../components/EditEmployee"
import CreateEmployee from "../components/CreateEmployee"
import "../styles/login.css";
import "../styles/styles.css";
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<UserTable />} />
        <Route path="/create" element={<CreateEmployee />} /> {/* 👈 nueva ruta */}
        <Route path="/edit/:id" element={<EditEmployee />} /> {/* 👈 nueva ruta */}
      </Routes>
    </Router>
  );
};

export default App;
