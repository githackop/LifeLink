import { lazy, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';

const UserDashboard = lazy(() => import('./UserDashboard'));
const DonorDashboard = lazy(() => import('./DonorDashboard'));
const HospitalDashboard = lazy(() => import('./HospitalDashboard'));
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));

const Home = () => {
  const { user } = useAuth();

  let Dashboard;
  switch (user?.role) {
    case 'donor':
      Dashboard = DonorDashboard;
      break;
    case 'hospital':
      Dashboard = HospitalDashboard;
      break;
    case 'admin':
      Dashboard = AdminDashboard;
      break;
    default:
      Dashboard = UserDashboard;
  }

  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <Dashboard />
    </Suspense>
  );
};

export default Home;
