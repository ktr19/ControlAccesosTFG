import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CreateEmployee.css"; // 👈 Importa tu CSS aquí

const CreateEmployee: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "employee",
    office_id: "",
    entry_date: "",
    exit_date: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const body = {
      ...formData,
      company_id: user.company_id,
      office_id: formData.office_id || null,
      entry_date: formData.entry_date || null,
      exit_date: formData.exit_date || null,
    };

    fetch("http://localhost:5000/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (res.ok) {
          navigate("/dashboard");
        } else {
          alert("Error al crear empleado");
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="form-page">
      <div className="form-container">
        <h1 className="form-title">Crear Nuevo Empleado</h1>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-grid">
            <div>
              <label>Nombre</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label>Apellido</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className="input-field" />
            </div>
          </div>
          <label>Correo Electrónico</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-field" />

          <label>Contraseña</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required className="input-field" />

          <div className="form-grid">
            <div>
              <label>Rol</label>
              <select name="role" value={formData.role} onChange={handleChange} className="input-field">
                <option value="employee">Empleado</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div>
              <label>ID Oficina (opcional)</label>
              <input type="text" name="office_id" value={formData.office_id} onChange={handleChange} className="input-field" />
            </div>
          </div>

          <div className="form-grid">
            <div>
              <label>Fecha de Entrada</label>
              <input type="date" name="entry_date" value={formData.entry_date} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label>Fecha de Salida</label>
              <input type="date" name="exit_date" value={formData.exit_date} onChange={handleChange} className="input-field" />
            </div>
          </div>

          <div className="button-group">
            <button type="submit" className="primary-button">Crear</button>
            <button type="button" onClick={() => navigate("/dashboard")} className="secondary-button">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEmployee;
