import React from "react";
import "../styles/general.css";

interface EmployeeEditFormProps {
  formData: {
    first_name: string;
    last_name: string;
    role: string;
    is_active: boolean;
    password?: string;  // agregado password opcional
  };
  onChange: (e: React.ChangeEvent<any>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const EmployeeEditForm: React.FC<EmployeeEditFormProps> = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <form onSubmit={onSubmit} className="form">
      <input
        type="text"
        name="first_name"
        placeholder="Nombre"
        value={formData.first_name}
        onChange={onChange}
        required
        className="input-field"
      />
      <input
        type="text"
        name="last_name"
        placeholder="Apellido"
        value={formData.last_name}
        onChange={onChange}
        required
        className="input-field"
      />
      <select
        name="role"
        value={formData.role}
        onChange={onChange}
        className="input-field"
      >
        <option value="employee">Empleado</option>
        <option value="admin">Administrador</option>
      </select>

      {/* Nuevo campo contraseña opcional */}
      <input
        type="password"
        name="password"
        placeholder="Contraseña (dejar vacío para no cambiar)"
        value={formData.password || ""}
        onChange={onChange}
        className="input-field"
        minLength={8}
      />

      <label>
        Activo:
        <input
          type="checkbox"
          name="is_active"
          checked={formData.is_active}
          onChange={onChange}
          className="input-field"
        />
      </label>

      <div className="button-group">
        <button type="submit" className="primary-button">
          Guardar Cambios
        </button>
        <button type="button" onClick={onCancel} className="secondary-button">
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default EmployeeEditForm;
