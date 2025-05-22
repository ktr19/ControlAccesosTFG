import React from "react";


interface Props {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onSearch: () => void;
  filter: string;
  setFilter: (value: string) => void;
}

const SearchBar: React.FC<Props> = ({
  searchQuery,
  setSearchQuery,
  onSearch,
  filter,
  setFilter,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSearch();
  };

  return (
    <div className="search-controls">
      {/* Input de búsqueda */}
      <div className="input-container">
        <input
          type="text"
          placeholder="Buscar empleados por ID, nombre o email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="search-input"
        />
      </div>

      {/* Dropdown de filtro */}
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="select-dropdown"
      >
        <option value="">Todos</option>
        <option value="activo">Activos</option>
        <option value="inactivo">Inactivos</option>
      </select>

      {/* Botones */}
      <div className="button-group">
        <button onClick={onSearch} className="primary-button">
          Buscar
        </button>
        <button onClick={() => setSearchQuery("")} className="secondary-button">
          Limpiar
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
