// src/layouts/DashboardLayout.tsx
import React from "react";

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="dashboard-layout">
      {/* Aquí puedes incluir una navbar, sidebar, etc. */}
      {children}
    </div>
  );
};

export default DashboardLayout;
