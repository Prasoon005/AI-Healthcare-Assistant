import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: "40px" }}>
      <h1>Welcome, {user?.name || "User"}</h1>

      <button
        onClick={logout}
        style={{
          padding: "10px 20px",
          borderRadius: "8px",
          backgroundColor: "#dc2626",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
          marginTop: "16px",
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;