import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import LandingPage from './Pages/LandingPage';
import Dashboard from './Pages/Dashboard';
import Staff from './Pages/Staff';
import Car from './Pages/Car';
import Service from './Pages/Service';
import TeeTime from './Pages/TeeTime';
import Payment from './Pages/Payment';
import Rental from './Pages/Rental';
import ProtectedRoute from './ProtectedRoute';
import Customer from './Pages/Customer';

function App() {
  return (
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/LandingPage" replace />} />
        <Route path="/LandingPage" element={<LandingPage />} />
        <Route path="/dashboard" element={ <ProtectedRoute> <Dashboard /> </ProtectedRoute> } />
        <Route path="/staff" element={ <ProtectedRoute> <Staff /> </ProtectedRoute> }/>
        <Route path="/car" element={ <ProtectedRoute> <Car /> </ProtectedRoute> }/> 
        <Route path="/service" element={ <ProtectedRoute> <Service /> </ProtectedRoute> }/> 
        <Route path="/tee-Time" element={ <ProtectedRoute> <TeeTime /> </ProtectedRoute> }/> 
        <Route path="/payment" element={ <ProtectedRoute> <Payment /> </ProtectedRoute> }/> 
        <Route path="/rental" element={ <ProtectedRoute> <Rental /> </ProtectedRoute> }/>
        <Route path="/customer" element={<ProtectedRoute> <Customer/> </ProtectedRoute>}/>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
