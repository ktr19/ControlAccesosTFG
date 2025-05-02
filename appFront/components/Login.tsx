import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: username, password }),
      });

      if (response.ok) {
        const userData = await response.json();

        // Guardar datos del usuario
        localStorage.setItem("user", JSON.stringify(userData));

        // Redirigir
        navigate("/dashboard");
      } else {
        const resText = await response.text();
        setError("Credenciales inválidas. " + resText);
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="avatar"></div>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="input-container">
            <span className="icon">👤</span>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="input-container">
            <span className="icon">🔒</span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="options">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a href="#">Forgot Password?</a>
          </div>
          {error && <p className="error">{error}</p>}
          <button type="button" className="login-button" onClick={handleLogin}>
            LOGIN
          </button>
        </form>
      </div>
      <footer>Diseñado por Kevin © 2025</footer>
    </div>
  );
};

export default Login;
