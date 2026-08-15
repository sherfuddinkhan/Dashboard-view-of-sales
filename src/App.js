import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LandingPage from "./components/LandingPage";
import Sidebar from "./components/Sidebar";
import SellerCustomerList from "./components/sellerandcustomer/SellerCustomerList";

const App = () => {
  return (
    <BrowserRouter>

      <Routes>

        {/* LOGIN */}
        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={<LandingPage />}
        />

        {/* AFTER LOGIN */}
        <Route
          path="/dashboard"
          element={
            <div style={layoutStyles}>
              <Sidebar />

              <main style={layoutStyles.content}>
                <SellerCustomerList />
              </main>
            </div>
          }
        />

        {/* DEFAULT */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
};

const layoutStyles = {
  display: "flex",
  minHeight: "100vh",
};

layoutStyles.content = {
  flex: 1,
  marginLeft: "260px",
  minHeight: "100vh",
};

export default App;