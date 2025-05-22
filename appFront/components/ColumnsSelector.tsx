import React, { useState } from "react";


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
  const [open, setOpen] = useState(false);

  const columnLabels: Record<string, string> = {
    employee_id: "ID",
    company_id: "Company ID",
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

  const handleToggle = (colId: string) => {
    if (colId === "actions") return; // Evitar quitar "actions"
    if (visibleColumns.includes(colId)) {
      onRemoveColumn(colId);
    } else {
      onAddColumn(colId);
    }
  };

  return (
    <div className="column-selector-dropdown">
      <button className="dropdown-toggle" onClick={() => setOpen(!open)}>
        Seleccionar columnas ⬇️
      </button>
      {open && (
        <div className="dropdown-menu">
          {allColumns.map((colId) => (
            <label key={colId} className="dropdown-item">
              <input
                type="checkbox"
                checked={visibleColumns.includes(colId)}
                disabled={colId === "actions"}
                onChange={() => handleToggle(colId)}
              />
              {columnLabels[colId] || colId}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColumnSelector;
