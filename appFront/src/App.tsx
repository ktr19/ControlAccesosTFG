import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from '../pages/Login';
import CreateEmployee from '../pages/CreateEmployee'
import UserTable from '../pages/UserTable'
import EditEmployee from '../pages/EditEmployee'

import ProtectedRoute from "../components/ProtectedRoute";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
              <Login />
          
          }
        />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
              <UserTable />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create"
        element={
          <ProtectedRoute>
              <CreateEmployee />
          </ProtectedRoute>
        }
      />

      <Route
        path="/edit/:id"
        element={
          <ProtectedRoute>
              <EditEmployee />
          </ProtectedRoute>
        }
      />

      </Routes>
    </Router>
  );
};

export default App;
