import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const LineChartComp = ({ data, xKey, yKey, title, lineColor = "#f5a623", description }) => (
  <div style={{ width: "100%", height: 260, display: 'flex', flexDirection: 'column' }}>
    <h3 style={{ marginBottom: 12 }}>{title}</h3>
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey={xKey} stroke="#555555" tick={{ fill: "#555555", fontSize: 12 }} />
          <YAxis stroke="#555555" tick={{ fill: "#555555", fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey={yKey} stroke={lineColor} strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
    {description && <p className="chart-description" style={{ marginTop: 8 }}>{description}</p>}
  </div> 
);

export default LineChartComp;