import React from "react";
import "../styles/general.css";

interface Props {
  userName: string;
  onLogOut: () => void;
}

const UserTableHeader: React.FC<Props> = ({ userName, onLogOut }) => (
  <div className="top-bar">
    <span>Usuario: {userName}</span>
    <button className="logout-button" onClick={onLogOut}>
      Logout
    </button>
  </div>
);

export default UserTableHeader;
