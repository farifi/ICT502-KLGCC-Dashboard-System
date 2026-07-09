import React from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const PieChartComp = ({
  data,
  nameKey,
  valueKey,
  title,
  colors = COLORS,
  description,
}) => {
  return (
    <div
      style={{
        width: "100%",
        height: 400,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3 style={{ marginBottom: 15 }}>{title}</h3>

      <div style={{ flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey={valueKey}
              nameKey={nameKey}
              cx="35%"
              cy="50%"
              outerRadius={85}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>

            <Tooltip />

            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="square"
              iconSize={12}
              width={120}
              wrapperStyle={{
                paddingLeft: "20px",
                fontSize: "14px",
                lineHeight: "22px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {description && (
        <p
          style={{
            textAlign: "center",
            color: "#888",
            marginTop: 10,
            fontSize: 14,
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default PieChartComp;