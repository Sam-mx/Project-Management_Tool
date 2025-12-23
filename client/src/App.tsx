import { useEffect } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AuthLayout from "./components/layouts/AuthLayout";
import Toasts from "./components/Toasts/Toasts";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import "react-toastify/dist/ReactToastify.css";

import PrivateRoute from "./PrivateRoute";
import MainLayout from "./components/layouts/MainLayout";
import EmailVerify from "./pages/EmailVerify";
import { WARNING } from "./types/constants";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";

// 1. Initialize Socket.io Connection
// IMPORTANT: Make sure this port matches your SERVER port (8000 or 8001)
export const socket = io("http://localhost:8000");

const App = () => {
  // 2. Get the logged-in user from Redux
  // (Assuming your auth slice is named 'auth' and has a 'user' object)
  // Add ": any" to state
  const user = useSelector((state: any) => state.auth?.user);

  // 3. Join the socket room when user logs in
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
          {/* /password/recover/:token password - new password page */}
          <Route path="reset-password/:token" element={<ResetPassword />} />

          {/* /reset-password put email here */}
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

          {/* /* */}
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
