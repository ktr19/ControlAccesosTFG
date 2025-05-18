import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/general.css";
import { getEmployeeById, updateEmployee } from "../apiService/employeeApi";
import EmployeeEditForm from "../components/EmployeeEditForm";

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
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    getEmployeeById(Number(id), token)
      .then((employee) => {
        setFormData({
          first_name: employee.first_name,
          last_name: employee.last_name,
          is_active: employee.is_active,
          office_id: employee.office_id,
          role: employee.role,
        });
      })
      .catch((err) => console.error(err.message));
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Token no encontrado");
      return;
    }

    try {
      await updateEmployee(Number(id), formData, token);
      navigate("/dashboard");
    } catch (err) {
      alert((err as Error).message || "Error al actualizar empleado");
    }
  };

  return (
    <div className="form-page">
      <div className="form-container">
        <h1 className="form-title">Editar empleado</h1>
        <EmployeeEditForm
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/dashboard")}
        />
      </div>
    </div>
  );
};

export default EditEmployee;
