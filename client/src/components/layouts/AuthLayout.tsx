import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, Link } from "react-router-dom"; // 1. Import Link
import { MdOutlineTimeline } from "react-icons/md"; // 2. Import Logo Icon
import { RootState } from "../../redux/app";

const AuthLayout = () => {
  const { accessToken, refreshToken } = useSelector(
    (state: RootState) => state.auth
  );

  // Redirect to dashboard if already logged in
  if (accessToken || refreshToken) {
    return <Navigate to="/dashboard" replace={true} />;
  }

  return (
    // Added 'relative' so we can position the logo absolutely
    <div className="auth w-screen h-screen overflow-y-auto flex items-center justify-center bg-slate-50 relative">
      {/* --- NEW: Logo that links to Landing Page --- */}
      <Link
        to="/"
        className="absolute top-8 left-8 flex items-center gap-2 group"
      >
        <div className="group-hover:scale-110 transition-transform duration-200">
          <MdOutlineTimeline size={32} />
        </div>
        <span className="text-2xl font-bold tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors">
          Samwise
        </span>
      </Link>

      <Outlet />
    </div>
  );
};

export default AuthLayout;
