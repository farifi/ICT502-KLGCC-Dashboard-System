import React from "react";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const PieChartComp = ({ data, nameKey, valueKey, title, colors = COLORS, description }) => (
  <div style={{ width: "100%", height: 300, display: 'flex', flexDirection: 'column' }}>
    <h3 style={{ marginBottom: 12 }}>{title}</h3>
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            nameKey={nameKey}
            dataKey={valueKey}
            label
            >
            {data.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
    {description && <p className="chart-description" style={{ marginTop: 8 }}>{description}</p>}
  </div> 
);

export default PieChartComp;
