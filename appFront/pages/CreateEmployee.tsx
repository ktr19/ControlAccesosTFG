import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/general.css";
import { createEmployee } from "../apiService/employeeApi";
import EmployeeForm from "../components/EmployeeForm";

const CreateEmployee: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "employee",
    office_id: "",

  });

  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const isFormValid = (): boolean => {
    return (
      formData.first_name.trim() !== "" &&
      formData.last_name.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.password.trim() !== ""
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      setError(
        "Por favor, completa todos los campos obligatorios (*) antes de continuar."
      );
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");

    if (!token) {
      alert("No estás autenticado. Inicia sesión nuevamente.");
      navigate("/");
      return;
    }

    const body = {
      ...formData,
      company_id: user.company_id,
      office_id: formData.office_id || null,

    };

    try {
      await createEmployee(body, token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert((err as Error).message || "Error al crear empleado");
    }
  };

  return (
    <div className="form-page">
      <div className="form-container">
        <h1 className="form-title">Crear Nuevo Empleado</h1>
        <EmployeeForm
          formData={formData}
          error={error}
          onChange={handleChange}
          onSubmit={handleSubmit}
          isFormValid={isFormValid}
          onCancel={() => navigate("/dashboard")}
        />
      </div>
    </div>
  );
};

export default CreateEmployee;
