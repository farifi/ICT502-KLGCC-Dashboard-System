import { AuthProvider } from "./API Contexts Folder/AuthContext";
import { StaffProvider } from "./API Contexts Folder/StaffContext";
import { DashboardProvider } from "./API Contexts Folder/DashboardContext";
import { BookingProvider } from "./API Contexts Folder/BookingContext";
import { EquipmentProvider } from "./API Contexts Folder/EquipmentContext";
import { PaymentProvider } from "./API Contexts Folder/PaymentContext";
import { TeeTimeProvider } from "./API Contexts Folder/TeeTimeContext";
import { CartProvider } from "./API Contexts Folder/CartContext";
import { CustomerProvider } from "./API Contexts Folder/CustomerContext"; 

const Providers = ({ children }) => {
  return (
    <AuthProvider>
      <StaffProvider>
        <DashboardProvider>
          <BookingProvider>
            <EquipmentProvider>
               <PaymentProvider>
                <TeeTimeProvider>
                  <CartProvider>
                    <CustomerProvider>
                      {children}
                    </CustomerProvider>
                  </CartProvider>
                </TeeTimeProvider>
              </PaymentProvider>
            </EquipmentProvider>
          </BookingProvider>
        </DashboardProvider> 
      </StaffProvider>
    </AuthProvider>
  );
};

export default Providers;
