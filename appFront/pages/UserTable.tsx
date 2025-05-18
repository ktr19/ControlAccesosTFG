import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/general.css";
import { fetchEmployees as fetchEmployeesAPI, deleteEmployee } from "../apiService/employeeApi";
import UserTableHeader from "../components/UserTableHeader";
import SearchBar from "../components/SearchBar";
import ColumnSelector from "../components/ColumnsSelector";
import EmployeeTable from "../components/EmployeeTable";
import PaginationControls from "../components/PaginationControls";

interface Employee {
  employee_id: number;
  company_id: number;
  office_id: number | null;
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

const UserTable: React.FC = () => {
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState<Employee[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string>("");

  const token = localStorage.getItem("token");

  // Definición de columnas que se usarán en EmployeeTable y ColumnSelector
  // (esto debe estar aquí para compartir entre ambos componentes)
  const allColumns = [
    "employee_id",
    "company_id",
    "office_id",
    "first_name",
    "last_name",
    "email",
    "role",
    "is_active",
    "is_locked",
    "last_login",
    "creation_date",
    "entry_date",
    "exit_date",
    "qr_code",
    "actions",
  ];

  // Estado para columnas visibles, por defecto algunas
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "employee_id",
    "first_name",
    "last_name",
    "email",
    "is_active",
    "actions",
  ]);

  const fetchEmployees = async (query = "") => {
    if (!token) {
      navigate("/");
      return;
    }
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        navigate("/");
        return;
      }
      const user = JSON.parse(storedUser);
      const companyId = user.company_id;

      const data = await fetchEmployeesAPI(token, companyId, query);
      setEmployeeData(data);
      setError("");
      setPageIndex(0);
    } catch (err: any) {
      setEmployeeData([]);
      setError(err.message || "Error en la búsqueda");
    }
  };

  const handleDelete = async (employeeId: number) => {
    if (!token) return;
    if (window.confirm("¿Estás seguro de que quieres eliminar este empleado?")) {
      try {
        await deleteEmployee(employeeId, token);
        setEmployeeData((prev) => prev.filter((emp) => emp.employee_id !== employeeId));
      } catch (err) {
        console.error("Error al eliminar el empleado", err);
      }
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && token) {
      const user = JSON.parse(storedUser);
      setUserName(user.email);
      fetchEmployees();
    } else {
      navigate("/");
    }
  }, [navigate, token]);

  const handleLogOut = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleAddColumn = (columnId: string) => {
    if (!visibleColumns.includes(columnId)) {
      setVisibleColumns((prev) => [...prev, columnId]);
    }
  };

  const handleRemoveColumn = (columnId: string) => {
    setVisibleColumns((prev) => prev.filter((col) => col !== columnId));
  };

return (
    <div className="main-container">
      <UserTableHeader userName={userName} onLogOut={handleLogOut} />
      <div className="management-container">
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={() => fetchEmployees(searchQuery)}
        />

        {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}

        <ColumnSelector
          allColumns={allColumns}
          visibleColumns={visibleColumns}
          onAddColumn={handleAddColumn}
          onRemoveColumn={handleRemoveColumn}
        />

        {/* Botón de crear usuario */}
        <div style={{ margin: "1rem 0" }}>
          <button onClick={() => navigate("/create")} className="create-button">
            Crear Usuario
          </button>
        </div>

        <PaginationControls
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalCount={employeeData.length}
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
        />
        <EmployeeTable
          employeeData={employeeData}
          visibleColumns={visibleColumns}
          pageSize={pageSize}
          pageIndex={pageIndex}
          setPageSize={setPageSize}
          setPageIndex={setPageIndex}
          onDelete={handleDelete}
        />


      </div>

      <footer className="footer">
        © 2025 Diseñado por Kevin. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default UserTable;
