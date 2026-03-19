import { BrowserRouter, Routes, Route } from "react-router-dom";
import BiodataPage from "./pages/BiodataPage";
import RestaurantPage from "./pages/RestaurantPage";
import MenuPage from "./pages/MenuPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";

import AdminOrderPage from "./pages/Admin/OrderPage";
import AdminLoginPage from "./pages/Admin/AdminLoginPage";
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminRestaurantPage from "./pages/Admin/RestaurantPage";
import AdminMenuPage from "./pages/Admin/MenuPage";

import AdminRoute from "./routes/AdminRoute";
import AdminLayout from "./components/AdminLayout";

import "antd/dist/reset.css";
import "./index.css";
import Footer from "./components/Footer";

function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <main className="main-content">
          <Routes>
            {/* USER */}
            <Route path="/" element={<BiodataPage />} />
            <Route path="/restaurants" element={<RestaurantPage />} />
            <Route path="/restaurants/:id" element={<MenuPage />} />
            <Route path="/order-success/:id" element={<OrderSuccessPage />} />

            {/* ADMIN */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminLoginPage />} />

            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </AdminRoute>
              }
            />

            <Route
              path="/admin/restaurants"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminRestaurantPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />

            <Route
              path="/admin/menus"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminMenuPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />

            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminOrderPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />
          </Routes>
        </main>
        {/* <Footer /> */}
      </div>
    </BrowserRouter>
  );
}

export default App;
