import React, { useEffect, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { useNavigate } from "react-router-dom";

interface Employee {
  employee_id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
}

const columnHelper = createColumnHelper<Employee>();

const UserTable: React.FC = () => {
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState<Employee[]>([]);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name);
      const companyId = user.company_id;

      fetch(`http://localhost:5000/companies/${companyId}/employees`)
        .then((res) => res.json())
        .then((data) => setEmployeeData(data))
        .catch((err) => console.error("Error al obtener empleados:", err));
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleDelete = (employeeId: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este empleado?")) {
      fetch(`http://localhost:5000/employees/${employeeId}`, {
        method: "DELETE",
      })
        .then((res) => {
          if (res.ok) {
            setEmployeeData(prev => prev.filter(emp => emp.employee_id !== employeeId));
          } else {
            console.error("Error al eliminar el empleado");
          }
        })
        .catch((err) => console.error("Error en la petición:", err));
    }
  };

  const handleModify = (employeeId: number) => {
    navigate(`/edit/${employeeId}`);
  };

  const handleCreate = () => {
    navigate("/create");
  };

  const columns = [
    columnHelper.accessor("employee_id", {
      header: "ID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("first_name", {
      header: "Nombre",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("last_name", {
      header: "Apellido",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("email", {
      header: "Email",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("is_active", {
      header: "Activo",
      cell: (info) => (
        <span className={`indicator ${info.getValue() ? "indicator-active" : "indicator-inactive"}`} />
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: (info) => {
        const employeeId = info.row.original.employee_id;
        return (
          <div className="action-buttons">
            <button className="modify-button" onClick={() => handleModify(employeeId)}>Modificar</button>
            <button className="delete-button" onClick={() => handleDelete(employeeId)}>Eliminar</button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: employeeData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleLogOut = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="main-container">
      <div className="top-bar">
        <span>Usuario: {userName}</span>
        <button className="logout-button" onClick={handleLogOut}>Logout</button>
      </div>

      <div className="management-container">
        <div className="management-header">
          <h2>Gestión de Personal</h2>
          <button className="create-button" onClick={handleCreate}>Crear Usuario</button>
        </div>

        <div className="select-container">
          <label>Mostrar:</label>
          <select className="select-dropdown">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
        </div>

        <table className="table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index) => (
              <tr key={row.id} className={index % 2 === 0 ? "row-even" : "row-odd"}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="footer">© 2025 Diseñado por Kevin. Todos los derechos reservados.</footer>
    </div>
  );
};

export default UserTable;
