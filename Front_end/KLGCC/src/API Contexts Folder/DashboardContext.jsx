import { createContext, useContext, useState, useEffect } from "react";
import API from "../Api";
import { useAuth } from "./AuthContext";

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const { user, authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalRentalRevenue: [],
    rentalTrend: [],
    averageRentalPricePerStaff: [],
    rentalCountByCarType: [],
    serviceFrequency: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }

    const fetchDashboardData = async () => {
      try {
        const [
          totalRentalRevenueRes,
          rentalTrendRes,
          avgRentalPriceRes,
          rentalByCarTypeRes,
          serviceFreqRes
        ] = await Promise.all([
          API.get("/api/dashboard/total-rental-revenue"),
          API.get("/api/dashboard/rental-trends"),
          API.get("/api/dashboard/average-rental-price-per-staff"),
          API.get("/api/dashboard/rentals-by-car-type"),
          API.get("/api/dashboard/service-frequency")
        ]);

        setDashboardData({
          totalRentalRevenue: (totalRentalRevenueRes.data.totalRentalRevenue || []).map(item => ({
            carType: item.CARTYPE,
            revenue: parseFloat(item.TOTAL_REVENUE)
          })),
          rentalTrend: (rentalTrendRes.data.rentalTrend || []).map(item => ({
            date: item.RENTAL_DATE,   // already formatted string from Oracle
            rentals: parseInt(item.TOTAL_RENTALS, 10)
          })),
          averageRentalPricePerStaff: (avgRentalPriceRes.data.averageRentalPricePerStaff || []).map(item => ({
            staff: item.STAFFNAME,    // confirmed column name
            price: parseFloat(item.AVG_RENTAL_PRICE)
          })),
          rentalCountByCarType: (rentalByCarTypeRes.data.rentalCountByCarType || []).map(item => ({
            carType: item.CARTYPE,
            count: parseInt(item.TOTAL_RENTALS, 10)
          })),
          serviceFrequency: (serviceFreqRes.data.serviceFrequency || []).map(item => ({
            carType: item.CARTYPE,
            services: parseInt(item.SERVICE_COUNT, 10)
          }))
        });

      } catch (err) {
        console.error("Dashboard API error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, authLoading]);

  return (
    <DashboardContext.Provider value={{ dashboardData, loading }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);