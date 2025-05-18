import React from "react";
import "../styles/general.css";

interface EmployeeFormProps {
  formData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role: string;
    office_id: string;

  };
  error: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isFormValid: () => boolean;
  onCancel: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  formData,
  error,
  onChange,
  onSubmit,
  isFormValid,
  onCancel,
}) => {
  return (
    <form onSubmit={onSubmit} className="form">
      <div className="form-grid">
        <div>
          <label>
            Nombre <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={onChange}
            className="input-field"
          />
        </div>
        <div>
          <label>
            Apellido <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={onChange}
            className="input-field"
          />
        </div>
      </div>

      <label>
        Correo Electrónico <span style={{ color: "red" }}>*</span>
      </label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={onChange}
        className="input-field"
      />

      <label>
        Contraseña <span style={{ color: "red" }}>*</span>
      </label>
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={onChange}
        className="input-field"
      />

      <div className="form-grid">
        <div>
          <label>Rol</label>
          <select
            name="role"
            value={formData.role}
            onChange={onChange}
            className="input-field"
          >
            <option value="employee">Empleado</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div>
          <label>ID Oficina (opcional)</label>
          <input
            type="text"
            name="office_id"
            value={formData.office_id}
            onChange={onChange}
            className="input-field"
          />
        </div>
      </div>


      {error && <div className="error-notification">{error}</div>}

      <div className="button-group">
        <button
          type="submit"
          className="primary-button"
          disabled={!isFormValid()}
        >
          Crear
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="secondary-button"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;
