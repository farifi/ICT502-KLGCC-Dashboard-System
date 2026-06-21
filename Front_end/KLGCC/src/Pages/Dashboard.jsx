import { useState } from "react";
import Sidebar from "../Components/Sidebar.jsx";
import Header from "../Components/Header.jsx";
import StatsCards from "../Components/statsCards.jsx";
import LineChartComp from "../Components/Charts/LineCharts.jsx";
import BarChartComp from "../Components/Charts/BarChart.jsx";
import PieChartComp from "../Components/Charts/PieChart.jsx";
import GlassCard from "../Components/GlassCard.jsx";
import { useDashboard } from "../API Contexts Folder/DashboardContext.jsx";
import "./Pages CSS files/DefaultTheme.css";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const { dashboardData = {}, loading } = useDashboard();
  const {
    totalRentalRevenue = [],
    rentalTrend = [],
    averageRentalPricePerStaff = [],
    rentalCountByCarType = [],
    serviceFrequency = []
  } = dashboardData;

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="default-page">
      <div className="default">
        <div
          className={`sidebar-overlay ${isSidebarOpen ? "open" : ""}`}
          onClick={closeSidebar}
        ></div>
        <div className={`sidebar-wrapper ${isSidebarOpen ? "open" : ""}`}>
          <Sidebar closeSidebar={closeSidebar} />
        </div>

        <div className="default-main">
          <Header toggleSidebar={toggleSidebar} />
          <div className="default-content">
            <div className="dashboard-grid" style={{ minWidth: 0 }}>

              {/* 1. Total Rental Revenue by Car Type - Pie Chart */}
              <GlassCard className="dashboard-card dashboard-card--top1" style={{ minHeight: 300 }}>
                <PieChartComp
                  data={totalRentalRevenue}
                  nameKey="carType"
                  valueKey="revenue"
                  title="Total Rental Revenue by Car Type (RM)"
                  colors={["#2d9cdb", "#f5a623", "#27ae60", "#e74c3c", "#8e44ad"]}
                  description="Shows each car type's share of total rental revenue."
                />
              </GlassCard>

              {/* 2. Rentals Trend Over Time - Line Chart */}
              <GlassCard className="dashboard-card dashboard-card--top2" style={{ minHeight: 300 }}>
                <LineChartComp
                  data={rentalTrend}
                  xKey="date"
                  yKey="rentals"
                  title="Rentals Trend Over Time"
                  description="Displays rentals over time to spot trends and seasonality."
                />
              </GlassCard>

              {/* 3. Service Frequency by Car Type - Bar Chart */}
              <GlassCard className="dashboard-card dashboard-card--top3" style={{ minHeight: 300 }}>
                <BarChartComp
                  data={serviceFrequency}
                  xKey="carType"
                  yKey="services"
                  title="Service Frequency by Car Type"
                  barColor="#2ecc71"
                  isDecimal={false}
                  description="Shows how often each car type undergoes service."
                />
              </GlassCard>

              {/* 4. Average Rental Price per Staff - Bar Chart */}
              <GlassCard className="dashboard-card dashboard-card--main" style={{ minHeight: 320 }}>
                <BarChartComp
                  data={averageRentalPricePerStaff}
                  xKey="staff"
                  yKey="price"
                  title="Average Rental Price Handled per Staff (RM)"
                  barColor="#2d9cdb"
                  description="Average rental price handled per staff member."
                />
              </GlassCard>

              {/* 5. Rental Count by Car Type - Pie Chart */}
              <GlassCard className="dashboard-card dashboard-card--side1" style={{ minHeight: 320 }}>
                <PieChartComp
                  data={rentalCountByCarType}
                  nameKey="carType"
                  valueKey="count"
                  title="Rental Count by Car Type"
                  colors={["#2d9cdb", "#f5a623", "#27ae60", "#e74c3c", "#8e44ad"]}
                  description="Shows number of rentals per car type."
                />
              </GlassCard>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;