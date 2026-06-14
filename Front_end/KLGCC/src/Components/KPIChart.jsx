import GlassCard from "./GlassCard";
import "./Components CSS files/KPIChart.css";

const data = [
  { label: "Sales", value: 75 },
  { label: "Marketing", value: 60 },
  { label: "Development", value: 90 },
  { label: "Support", value: 45 },
];

const KPIChart = () => {
  return (
    <GlassCard className="kpi-card">
      <h2>Department Performance</h2>

      <div className="kpi-bars">
        {data.map(item => (
          <div key={item.label} className="kpi-row">
            <span>{item.label}</span>

            <div className="kpi-bar">
              <div
                className="kpi-fill"
                style={{ width: `${item.value}%` }}
              />
            </div>

            <span className="kpi-value">{item.value}%</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default KPIChart;
