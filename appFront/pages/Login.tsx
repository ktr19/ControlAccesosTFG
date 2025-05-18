import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBackgroundAnimation } from "../jscript/backgroundAnimation";
import "../styles/general.css";  // Importa estilos globales
import { login } from "../apiService/employeeApi";
import logo from "../public/logo.png"

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const cleanup = createBackgroundAnimation();
    return () => {
      if (typeof cleanup === "function") cleanup();
    };
  }, []);

  const handleLogin = async () => {
  setError("");

  try {
    const userData = await login({ email: username, password });

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userData.token);
    localStorage.setItem("userName", userData.first_name);

    navigate("/dashboard");
  } catch (err: any) {
    setError(err.message || "Error al iniciar sesión");
    console.error(err);
  }
};


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-container">
          <img src={logo} alt="Logo de la aplicación" className="app-logo" />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <span className="icon">👤</span>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-container">
            <span className="icon">🔒</span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="options">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a href="#">Forgot Password?</a>
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="login-button">
            LOGIN
          </button>
        </form>
      </div>
      <footer className="footer">Diseñado por Kevin © 2025</footer>
    </div>
  );
};

export default Login;
