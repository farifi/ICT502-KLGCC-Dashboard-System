import { useState, useMemo } from "react";
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
    totalBookingsRevenue = [],
    bookingTrend = [],
    averageBookingPricePerStaff = [],
    bookingsByCourse = [],
    equipmentUsageCount = []
  } = dashboardData;

  // Format bookingTrend date for chart x-axis
  const formattedBookingTrend = useMemo(() => {
    return bookingTrend.map(item => {
      const date = new Date(item.date);
      const monthDay = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
      return { ...item, month: monthDay };
    });
  }, [bookingTrend]);

  // Top 6 courses for revenue chart
  const H1Revenue = useMemo(() => totalBookingsRevenue.slice(0, 6), [totalBookingsRevenue]);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="default-page">
      <div className="default">
        <div className={`sidebar-overlay ${isSidebarOpen ? "open" : ""}`} onClick={closeSidebar}></div>
        <div className={`sidebar-wrapper ${isSidebarOpen ? "open" : ""}`}>
          <Sidebar closeSidebar={closeSidebar} />
        </div>

        <div className="default-main">
          <Header toggleSidebar={toggleSidebar} />
          <div className="default-content">
            <div className="dashboard-grid" style={{ minWidth: 0 }}>
            {/* 1. Total Booking Revenue by Course - Pie Chart */}
              <GlassCard className="dashboard-card dashboard-card--top1" style={{ minHeight: 260 }}>
                <div className="chart-container">
                  <PieChartComp
                    data={totalBookingsRevenue}
                    nameKey="course"
                    valueKey="revenue"
                    title="Total Booking Revenue by Course (RM)"
                    colors={["#2d9cdb","#f5a623","#27ae60","#e74c3c","#8e44ad"]}
                    description={"Shows each course's share of total booking revenue — useful to spot top revenue contributors and concentration."}
                  />
                </div>
              </GlassCard>


              {/* 2. Bookings Trend Over Time - Line Chart */}
              <GlassCard className="dashboard-card dashboard-card--top2" style={{ minHeight: 260 }}>
                <LineChartComp
                  data={formattedBookingTrend}
                  xKey="month"
                  yKey="bookings"
                  title="Bookings Trend Over Time"
                  description={"Displays bookings over time (by month) to spot trends, spikes, and seasonality."}
                />
              </GlassCard>

              {/* 3. Equipment Usage Frequency - Bar Chart */}
              <GlassCard className="dashboard-card dashboard-card--top3" style={{ minHeight: 260 }}>
                <BarChartComp
                  data={equipmentUsageCount}
                  xKey="type"
                  yKey="rentals"
                  title="Equipment Usage Frequency"
                  barColor="#2ecc71"
                  isDecimal={false}
                  description={"Shows how often each equipment type is rented; helps track demand and maintenance scheduling."}
                />
              </GlassCard>

              {/* 4. Average Booking Price per Staff - Bar Chart */}
              <GlassCard className="dashboard-card dashboard-card--main" style={{ minHeight: 300 }}>
                <BarChartComp
                  data={averageBookingPricePerStaff}
                  xKey="staff"
                  yKey="price"
                  title="Average Booking Price per Staff (RM)"
                  barColor="#2d9cdb"
                  description={"Average booking price per staff; useful to compare revenue handled across staff members."}
                />
              </GlassCard>

              {/* 5. Booking Count by Course - Pie Chart */}
              <GlassCard className="dashboard-card dashboard-card--side1" style={{ minHeight: 260 }}>
                <PieChartComp
                  data={bookingsByCourse}
                  nameKey="course"
                  valueKey="count"
                  title="Booking Count by Course"
                  colors={["#2d9cdb","#f5a623","#27ae60","#e74c3c","#8e44ad"]}
                  description={"Shows number of bookings per course to identify the most popular courses."}
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
