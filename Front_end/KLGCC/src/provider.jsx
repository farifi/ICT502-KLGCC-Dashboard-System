import { AuthProvider } from "./API Contexts Folder/AuthContext";
import { StaffProvider } from "./API Contexts Folder/StaffContext";
import { DashboardProvider } from "./API Contexts Folder/DashboardContext";
import { CarProvider } from "./API Contexts Folder/CarContext";
import { ServiceProvider } from "./API Contexts Folder/ServiceContext";
import { PaymentProvider } from "./API Contexts Folder/PaymentContext";
import { TeeTimeProvider } from "./API Contexts Folder/TeeTimeContext";
import { RentalProvider } from "./API Contexts Folder/RentalContext";
import { CustomerProvider } from "./API Contexts Folder/CustomerContext"; 

const Providers = ({ children }) => {
  return (
    <AuthProvider>
      <StaffProvider>
        <DashboardProvider>
          <CarProvider>
            <ServiceProvider>
               <PaymentProvider>
                <TeeTimeProvider>
                  <RentalProvider>
                    <CustomerProvider>
                      {children}
                    </CustomerProvider>
                  </RentalProvider>
                </TeeTimeProvider>
              </PaymentProvider>
            </ServiceProvider>
          </CarProvider>
        </DashboardProvider> 
      </StaffProvider>
    </AuthProvider>
  );
};

export default Providers;
