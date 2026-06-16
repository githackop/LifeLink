import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';

import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';
import RoleRoute from './RoleRoute';

import HospitalDonors from '../pages/HospitalDonors';

import DashboardLayout from '../layouts/DashboardLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import ProfilePage from '../pages/ProfilePage';

import DonorAvailabilityPage from '../pages/DonorAvailabilityPage';
import SearchDonors from '../pages/SearchDonors';
import Requests from '../pages/Requests';
import DonationHistory from '../pages/DonationHistory';
import EmergencyRequests from '../pages/EmergencyRequests';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminDonors from '../pages/admin/AdminDonors';
import AdminHospitals from '../pages/admin/AdminHospitals';
import AdminBroadcasts from '../pages/admin/AdminBroadcasts';
import BloodRequestsFeed from '../pages/BloodRequestsFeed';

const AppRoutes = () => (
  <BrowserRouter>
    <AuthProvider>
      <SocketProvider>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="profile" element={<ProfilePage />} />

            <Route
              path="blood-requests"
              element={
                <RoleRoute roles={['user', 'donor', 'hospital', 'admin']}>
                  <BloodRequestsFeed />
                </RoleRoute>
              }
            />

            <Route
              path="search-donors"
              element={
                <RoleRoute roles={['user', 'hospital']}>
                  <SearchDonors />
                </RoleRoute>
              }
            />
            <Route
              path="my-requests"
              element={
                <RoleRoute roles={['user', 'hospital']}>
                  <Requests />
                </RoleRoute>
              }
            />

            <Route
              path="requests-received"
              element={
                <RoleRoute roles={['donor']}>
                  <Requests />
                </RoleRoute>
              }
            />

            <Route
              path="availability"
              element={
                <RoleRoute roles={['donor']}>
                  <DonorAvailabilityPage />
                </RoleRoute>
              }
            />

            <Route
              path="donation-history"
              element={
                <RoleRoute roles={['donor']}>
                  <DonationHistory />
                </RoleRoute>
              }
            />

            <Route
              path="emergency-requests"
              element={
                <RoleRoute roles={['hospital']}>
                  <EmergencyRequests />
                </RoleRoute>
              }
            />

            {/* ✅ CLEAN FINAL HOSPITAL DONOR MODULE */}
            <Route
              path="hospital-donors"
              element={
                <RoleRoute roles={['hospital']}>
                  <HospitalDonors />
                </RoleRoute>
              }
            />

            {/* ADMIN ROUTES */}
            <Route
              path="admin-dashboard"
              element={
                <RoleRoute roles={['admin']}>
                  <AdminDashboard />
                </RoleRoute>
              }
            />

            <Route
              path="users"
              element={
                <RoleRoute roles={['admin']}>
                  <AdminUsers />
                </RoleRoute>
              }
            />

            <Route
              path="donors"
              element={
                <RoleRoute roles={['admin']}>
                  <AdminDonors />
                </RoleRoute>
              }
            />

            <Route
              path="hospitals"
              element={
                <RoleRoute roles={['admin']}>
                  <AdminHospitals />
                </RoleRoute>
              }
            />

            <Route
              path="broadcasts"
              element={
                <RoleRoute roles={['admin']}>
                  <AdminBroadcasts />
                </RoleRoute>
              }
            />
          </Route>

          {/* AUTH ROUTES */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />

          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />

          <Route
            path="/forgot-password"
            element={
              <GuestRoute>
                <ForgotPassword />
              </GuestRoute>
            }
          />

          <Route
            path="/reset-password/:resetToken"
            element={<ResetPassword />}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default AppRoutes;