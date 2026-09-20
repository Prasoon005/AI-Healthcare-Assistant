import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) {
        return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-[#09090b] text-white", children: "Loading..." }));
    }
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return _jsx(Outlet, {});
};
export default ProtectedRoute;
