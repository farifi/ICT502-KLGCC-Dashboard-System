import GlassCard from "./GlassCard";
import "./Components CSS files/StatsCards.css";

const stats = [
  { label: "Total Employees", value: "49,229" },
  { label: "Total Projects", value: "12,340" },
  { label: "Job Applicants", value: "3,210" },
];

const StatsCards = () => {
  return (
    <GlassCard className="stats-cards-wrapper">
      <div className="stats-cards">
        {stats.map((stat, index) => (
          <div key={stat.label} className="stat-item">
            <div className="stat-icon-placeholder">
               {/* Placeholder for icon */}
               <div className="icon-circle"></div>
            </div>
            <div className="stat-content">
              <p className="stat-label">{stat.label}</p>
              <p className="stat-value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default StatsCards;
