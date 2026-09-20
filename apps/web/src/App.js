import { jsx as _jsx } from "react/jsx-runtime";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
function App() {
    return (_jsx(AuthProvider, { children: _jsx(AppRoutes, {}) }));
}
export default App;
