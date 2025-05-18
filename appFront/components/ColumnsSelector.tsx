import React from "react";
import "../styles/general.css";

interface Props {
  allColumns: string[];
  visibleColumns: string[];
  onAddColumn: (colId: string) => void;
  onRemoveColumn: (colId: string) => void;
}

const ColumnSelector: React.FC<Props> = ({
  allColumns,
  visibleColumns,
  onAddColumn,
  onRemoveColumn,
}) => {
  const hiddenColumns = allColumns.filter((col) => !visibleColumns.includes(col));

  const columnLabels: Record<string, string> = {
    employee_id: "ID",
    company_id: "Company ID",
    office_id: "Office ID",
    first_name: "Nombre",
    last_name: "Apellido",
    email: "Email",
    role: "Rol",
    is_active: "Activo",
    is_locked: "Bloqueado",
    last_login: "Último Login",
    creation_date: "Fecha Creación",
    entry_date: "Fecha Entrada",
    exit_date: "Fecha Salida",
    qr_code: "QR Code",
    actions: "Acciones",
  };

  return (
    <div className="column-selector">
      <label htmlFor="add-column-select" className="column-selector-label">
        Añadir columna:
      </label>
      <select
        id="add-column-select"
        onChange={(e) => {
          if (e.target.value) {
            onAddColumn(e.target.value);
            e.target.value = "";
          }
        }}
        defaultValue=""
        className="column-selector-select"
      >
        <option value="" disabled>
          Selecciona una columna
        </option>
        {hiddenColumns.map((col) => (
          <option key={col} value={col}>
            {columnLabels[col] || col}
          </option>
        ))}
      </select>

      <div className="visible-columns">
        <strong>Columnas visibles:</strong>
        {visibleColumns.map((col) => (
          <span
            key={col}
            className={`visible-column ${
              col === "actions" ? "non-removable" : "removable"
            }`}
            onClick={() => col !== "actions" && onRemoveColumn(col)}
            title={
              col === "actions"
                ? "No se puede eliminar esta columna"
                : "Haz clic para ocultar"
            }
          >
            {columnLabels[col] || col}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ColumnSelector;
