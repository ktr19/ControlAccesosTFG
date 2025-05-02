import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/CreateEmployee.css"; 
const EditEmployee: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    is_active: true,
    office_id: null,
    role: "employee",
  });

  useEffect(() => {
    fetch(`http://localhost:5000/employees`)
      .then((res) => res.json())
      .then((data) => {
        const employee = data.find((emp: any) => emp.employee_id === Number(id));
        if (employee) {
          setFormData({
            first_name: employee.first_name,
            last_name: employee.last_name,
            is_active: employee.is_active,
            office_id: employee.office_id,
            role: employee.role,
          });
        }
      })
      .catch((err) => console.error(err));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    fetch(`http://localhost:5000/employees/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (res.ok) {
          navigate("/dashboard");
        } else {
          alert("Error al actualizar empleado");
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="form-page">
    <div className="form-container">
    <h1 className="form-title">Editar empleado</h1>
    <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          name="first_name"
          placeholder="Nombre"
          value={formData.first_name}
          onChange={handleChange}
          required
          className="input-field"
        />
        <input
          type="text"
          name="last_name"
          placeholder="Apellido"
          value={formData.last_name}
          onChange={handleChange}
          required
          className="input-field"
        />
        <select name="role" value={formData.role} onChange={handleChange} className="input-field">
          <option value="employee">Empleado</option>
          <option value="admin">Administrador</option>
        </select>
        <label>
          Activo:
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="input-field"
          />
        </label>
        <button type="submit" className="primary-button">Guardar Cambios</button>
      </form>
      <button onClick={() => navigate("/dashboard")} className="secondary-button">Cancelar</button>
    </div>
    </div>
  );
};

export default EditEmployee;
