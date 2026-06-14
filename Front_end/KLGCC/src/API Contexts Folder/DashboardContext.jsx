import { createContext, useContext, useState, useEffect } from "react";
import API from "../Api";
import { useAuth } from "./AuthContext";

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {

  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalBookingsRevenue: [],
    bookingTrend: [],
    averageBookingPricePerStaff: [],
    bookingsByCourse: [],
    equipmentUsageCount: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        const [
          totalBookingsRevenueRes,
          bookingTrendRes,
          averageBookingPricePerStaffRes,
          bookingsByCourseRes,
          equipmentUsageRes
        ] = await Promise.all([
          API.get("/api/dashboard/total-bookings-revenue"),
          API.get("/api/dashboard/booking-trends"),
          API.get("/api/dashboard/average-booking-price-per-staff"),
          API.get("/api/dashboard/bookings-by-course"),
          API.get("/api/dashboard/equipment-usage-count")
        ]);

        // Normalize backend keys to frontend chart keys
        setDashboardData({
          totalBookingsRevenue: (totalBookingsRevenueRes.data.totalBookingsRevenue || []).map(item => ({
            course: item.COURSE_NAME,
            revenue: parseFloat(item.TOTAL_REVENUE)
          })),
          bookingTrend: (bookingTrendRes.data.bookingTrend || []).map(item => ({
            date: item.BOOKING_DATE,
            bookings: parseInt(item.TOTAL_BOOKINGS, 10)
          })),
          averageBookingPricePerStaff: (averageBookingPricePerStaffRes.data.averageBookingPricePerStaff || []).map(item => ({
            staff: item.STAFF_NAME,
            price: parseFloat(item.AVG_BOOKING_PRICE)
          })),
          bookingsByCourse: (bookingsByCourseRes.data.bookingCountByCourse || []).map(item => ({
            course: item.COURSE_NAME,
            count: parseInt(item.TOTAL_BOOKINGS, 10)
          })),
          equipmentUsageCount: (equipmentUsageRes.data.equipmentUsage || []).map(item => ({
            type: item.EQUIPMENT_TYPE,
            rentals: parseInt(item.USAGE_COUNT, 10)
          }))
        });

      } catch (err) {
        console.error("Dashboard API error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <DashboardContext.Provider value={{ dashboardData, loading }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
