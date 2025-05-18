import React from "react";
import "../styles/general.css";

interface Props {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onSearch: () => void;
}

const SearchBar: React.FC<Props> = ({ searchQuery, setSearchQuery, onSearch }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSearch();
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Buscar empleados por ID, nombre o email"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="search-input"
      />
      <button onClick={onSearch} className="primary-button">
        Buscar
      </button>
    </div>
  );
};

export default SearchBar;
