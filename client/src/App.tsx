import { useEffect } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AuthLayout from "./components/layouts/AuthLayout";
import Toasts from "./components/Toasts/Toasts";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import LandingPage from "./pages/LandingPage"; // <--- 1. Import LandingPage

import "react-toastify/dist/ReactToastify.css";

import PrivateRoute from "./PrivateRoute";
import MainLayout from "./components/layouts/MainLayout";
import EmailVerify from "./pages/EmailVerify";
import { WARNING } from "./types/constants";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";

// 1. Initialize Socket.io Connection
export const socket = io(
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
);

const App = () => {
  const user = useSelector((state: any) => state.auth?.user);

  useEffect(() => {
    if (user && user._id) {
      console.log("🔌 Socket joining as user:", user._id);
      socket.emit("join", user._id);
    }
  }, [user]);

  return (
    <div>
      <Toasts />
      <ToastContainer position="top-right" />

      <BrowserRouter>
        <Routes>
          {/* --- 2. Add Landing Page Route (Must be before the catch-all /*) --- */}
          <Route path="/" element={<LandingPage />} />

          {/* /password/recover/:token */}
          <Route path="reset-password/:token" element={<ResetPassword />} />

          {/* /forgot-password */}
          <Route path="forgot-password" element={<AuthLayout />}>
            <Route index element={<ForgotPassword />} />
          </Route>

          {/* /auth */}
          <Route path="auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            <Route
              path="*"
              element={<Navigate to="/auth/login" replace={true} />}
            />
          </Route>

          <Route
            path="/email/verify/:token"
            element={
              <PrivateRoute
                toast={{
                  kind: WARNING,
                  msg: "Please log in to Workflow before verifying your email address",
                }}
              >
                <EmailVerify />
              </PrivateRoute>
            }
          />

          {/* Catch-all for Main App (Dashboard, Boards, etc.) */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
