// src/api/employeeAPI.ts

export const fetchEmployees = async (token: string, companyId: number, query = "") => {
  let url = "";

  if (query.trim() === "") {
    url = `http://localhost:5000/companies/${companyId}/employees`;
  } else {
    url = `http://localhost:5000/employees/search?query=${encodeURIComponent(query)}`;
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Error al obtener empleados");
  }

  return await res.json();
};

export const deleteEmployee = async (employeeId: number, token: string) => {
  const res = await fetch(`http://localhost:5000/employees/${employeeId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error al eliminar el empleado");
  }

  return true;
};

export const getEmployeeById = async (id: number, token: string) => {
  const res = await fetch(`http://localhost:5000/employees`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error al obtener la lista de empleados");
  }

  const data = await res.json();
  const employee = data.find((emp: any) => emp.employee_id === id);

  if (!employee) {
    throw new Error("Empleado no encontrado");
  }

  return employee;
};

export const updateEmployee = async (id: number, formData: any, token: string) => {
  const res = await fetch(`http://localhost:5000/employees/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    throw new Error("Error al actualizar el empleado");
  }

  return await res.json();
};

export const createEmployee = async (formData: any, token: string) => {
  if (!token) {
    throw new Error("Token no proporcionado");
  }

  const res = await fetch("http://localhost:5000/employees", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Error al crear empleado");
  }

  return res.json();
};


// services/authService.ts

export interface LoginCredentials {
  email: string;
  password: string;
}

export const login = async (credentials: LoginCredentials) => {
  const response = await fetch("http://localhost:5000/dashboard-login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("Credenciales inválidas.");
  }

  const userData = await response.json();

  if (!userData.token) {
    throw new Error("No se recibió un token válido.");
  }

  return userData;
};
