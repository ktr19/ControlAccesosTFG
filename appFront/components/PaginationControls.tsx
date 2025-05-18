import React from "react";
import "../styles/general.css";

interface Props {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (index: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PaginationControls: React.FC<Props> = ({
  pageIndex,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = Math.max(Math.ceil(totalCount / pageSize), 1);

  return (
    <div className="pagination-controls">
      <button
        onClick={() => onPageChange(0)}
        disabled={pageIndex === 0}
        className="pagination-button"
      >
        {"<<"}
      </button>
      <button
        onClick={() => onPageChange(pageIndex - 1)}
        disabled={pageIndex === 0}
        className="pagination-button"
      >
        {"<"}
      </button>

      <span>
        Página {pageIndex + 1} de {totalPages}
      </span>

      <button
        onClick={() => onPageChange(pageIndex + 1)}
        disabled={pageIndex + 1 >= totalPages}
        className="pagination-button"
      >
        {">"}
      </button>
      <button
        onClick={() => onPageChange(totalPages - 1)}
        disabled={pageIndex + 1 >= totalPages}
        className="pagination-button"
      >
        {">>"}
      </button>

      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="select-dropdown"
      >
        {[5, 10, 20, 50].map((size) => (
          <option key={size} value={size}>
            Mostrar {size}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PaginationControls;
