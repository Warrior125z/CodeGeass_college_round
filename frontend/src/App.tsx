
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
// import Workspace from './pages/Workspace';
// import Websites from './pages/Websites';
// import CRM from './pages/CRM';
// import Webinars from './pages/Webinars';
// import Analytics from './pages/Analytics';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* <Route
          path="/app/workspace"
          element={
            <ProtectedRoute>
              <Workspace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/websites"
          element={
            <ProtectedRoute>
              <Websites />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/crm"
          element={
            <ProtectedRoute>
              <CRM />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/webinars"
          element={
            <ProtectedRoute>
              <Webinars />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        /> */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
