// src/layouts/LoginLayout.tsx
import React from "react";
const LoginLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="login-layout">
      {/* Aquí puedes mantener tu fondo animado o canvas */}
      <canvas id="background-canvas"></canvas>
      {children}
    </div>
  );
};

export default LoginLayout;
