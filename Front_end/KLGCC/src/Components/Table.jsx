import GlassCard from "./GlassCard";
import "./Components CSS files/Table.css";

const Table = ({ title, columns= [], data = [] }) => {
  return (
    <GlassCard className="table">
      {title && <h2>{title}</h2>}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map(col =>  (
                <th key={col.key}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
             {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center" }}>
                  No data
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={row.id || index}>
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
};

export default Table;
