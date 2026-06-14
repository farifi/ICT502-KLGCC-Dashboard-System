const TransactionsList = ({ data = [] }) => {
  if (!data.length) {
    return <p style={{ fontSize: 14, color: "#888" }}>No transactions</p>;
  }

  return (
    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
      {data.map((tx) => (
        <div
          key={tx.id}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr",
            gap: "8px",
            alignItems: "center",
            fontSize: 14
          }}
        >
          <span>{tx.id}</span>
          <span>{tx.type}</span>
          <span>${tx.amount}</span>
          <span>{tx.date}</span>
          <span
            style={{
              color: tx.status === "Done" ? "#2ecc71" : "#f5a623"
            }}
          >
            {tx.status}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TransactionsList;
