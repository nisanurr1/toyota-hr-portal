import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LeaveRequest from "./pages/LeaveRequest";
import Notifications from "./pages/Notifications";
import UpdateRequests from "./pages/UpdateRequests";
import Layout from "./components/Layout"; //  Dosya ağacına tam uygun import yolu
import ManagerDashboard from "./pages/ManagerDashboard";
import HrDashboard from "./pages/HrDashboard";
import VehicleRequest from "./pages/VehicleRequest";
import VehicleManagement from "./pages/VehicleManagement";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Layout>{children}</Layout>;
};

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={["EMPLOYEE", "MANAGER", "HR", "ADMIN"]}>
                    <Dashboard />
                </ProtectedRoute>
            } />

            <Route path="/leave-requests" element={
                <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                    <LeaveRequest />
                </ProtectedRoute>
            } />

            <Route path="/update-requests" element={
                <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                    <UpdateRequests />
                </ProtectedRoute>
            } />

            <Route path="/notifications" element={
                <ProtectedRoute allowedRoles={["EMPLOYEE", "MANAGER", "HR", "ADMIN"]}>
                    <Notifications />
                </ProtectedRoute>
            } />

            <Route path="/manager" element={
                <ProtectedRoute allowedRoles={["MANAGER"]}>
                    <ManagerDashboard />
                </ProtectedRoute>
            } />

            <Route path="/hr" element={
                <ProtectedRoute allowedRoles={["HR", "ADMIN"]}>
                    <HrDashboard />
                </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            
            <Route 
                path="/vehicle-requests" 
                element={
                    <Layout>
                        <VehicleRequest />
                    </Layout>
                } 
            />
            <Route path="/vehicle-management" element={<Layout><VehicleManagement /></Layout>} />
        
        </Routes>
    );
}

export default App;