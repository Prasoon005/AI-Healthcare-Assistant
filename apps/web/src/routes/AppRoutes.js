import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/dashboard/Dashboard";
import HealthProfile from "../pages/profile/HealthProfile";
import HealthAnalysis from "../pages/analysis/HealthAnalysis";
import Reports from "../pages/reports/Reports";
import Settings from "../pages/settings/Settings";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";
const AppRoutes = () => {
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/register", element: _jsx(Register, {}) }), _jsx(Route, { element: _jsx(ProtectedRoute, {}), children: _jsxs(Route, { element: _jsx(DashboardLayout, {}), children: [_jsx(Route, { path: "/dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/profile", element: _jsx(HealthProfile, {}) }), _jsx(Route, { path: "/analysis", element: _jsx(HealthAnalysis, {}) }), _jsx(Route, { path: "/reports", element: _jsx(Reports, {}) }), _jsx(Route, { path: "/settings", element: _jsx(Settings, {}) })] }) }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] }) }));
};
export default AppRoutes;
