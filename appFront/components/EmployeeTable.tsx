import React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";


interface Employee {
  employee_id: number;
  company_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
  is_locked: boolean;
  last_login: string | null;
  creation_date: string | null;
  entry_date: string | null;
  exit_date: string | null;
  qr_code: string | null;
}

type ColumnId =
  | "employee_id"
  | "company_id"
  | "first_name"
  | "last_name"
  | "email"
  | "role"
  | "is_active"
  | "is_locked"
  | "last_login"
  | "creation_date"
  | "entry_date"
  | "exit_date"
  | "qr_code"
  | "actions";

interface Props {
  employeeData: Employee[];
  visibleColumns: string[];
  pageSize: number;
  pageIndex: number;
  setPageSize: (size: number) => void;
  setPageIndex: (index: number) => void;
  onDelete: (id: number) => void;
}

const EmployeeTable: React.FC<Props> = ({
  employeeData,
  visibleColumns,
  pageSize,
  pageIndex,
  setPageSize,
  setPageIndex,
  onDelete,
}) => {
  const navigate = useNavigate();
  const columnHelper = createColumnHelper<Employee>();

  const allColumns = {
    employee_id: columnHelper.accessor("employee_id", {
      header: "ID",
      cell: (info) => info.getValue(),
    }),
    company_id: columnHelper.accessor("company_id", {
      header: "Company ID",
      cell: (info) => info.getValue(),
    }),
    first_name: columnHelper.accessor("first_name", {
      header: "Nombre",
      cell: (info) => info.getValue(),
    }),
    last_name: columnHelper.accessor("last_name", {
      header: "Apellido",
      cell: (info) => info.getValue(),
    }),
    email: columnHelper.accessor("email", {
      header: "Email",
      cell: (info) => info.getValue(),
    }),
    role: columnHelper.accessor("role", {
      header: "Rol",
      cell: (info) => info.getValue(),
    }),
    is_active: columnHelper.accessor("is_active", {
      header: "Activo",
     cell: (info) => (info.getValue() ? "✔️" : "❌"),

    }),
    is_locked: columnHelper.accessor("is_locked", {
      header: "Bloqueado",
      cell: (info) => (info.getValue() ? "✔️" : "❌"),

    }),
    last_login: columnHelper.accessor("last_login", {
      header: "Último Login",
      cell: (info) => info.getValue() || "-",
    }),
    creation_date: columnHelper.accessor("creation_date", {
      header: "Fecha Creación",
      cell: (info) => info.getValue() || "-",
    }),
    entry_date: columnHelper.accessor("entry_date", {
      header: "Fecha Entrada",
      cell: (info) => info.getValue() || "-",
    }),
    exit_date: columnHelper.accessor("exit_date", {
      header: "Fecha Salida",
      cell: (info) => info.getValue() || "-",
    }),
    qr_code: columnHelper.accessor("qr_code", {
      header: "QR Code",
      cell: (info) => info.getValue() || "-",
    }),
    actions: columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <div className="action-buttons">
            <button
              onClick={() => navigate(`/edit/${employee.employee_id}`)}
              className="modify-button"
            >
              Modificar
            </button>
            <button
              onClick={() => onDelete(employee.employee_id)}
              className="delete-button"
            >
              Eliminar
            </button>
          </div>
        );
      },
    }),
  };

const columns = [
  ...visibleColumns
    .filter((colId) => colId !== "actions")
    .map((colId) => allColumns[colId])
    .filter(Boolean),
  ...(visibleColumns.includes("actions") ? [allColumns.actions] : []),
];


  const table = useReactTable({
    data: employeeData,
    columns,
    pageCount: Math.ceil(employeeData.length / pageSize),
    state: { pagination: { pageIndex, pageSize } },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex, pageSize });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      } else {
        setPageIndex(updater.pageIndex);
        setPageSize(updater.pageSize);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (

      <table className="table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>No hay datos.</td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row, i) => (
              <tr key={row.id} className={i % 2 === 0 ? "row-even" : "row-odd"}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

  );
};

export default EmployeeTable;
