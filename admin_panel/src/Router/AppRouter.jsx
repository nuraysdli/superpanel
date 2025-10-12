import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Login from "../components/login/Login";
import Home from "../components/pages/Home/Home";
import { checkTokenExpiration, clearExpiredToken } from "../components/Redux/Features/Login";

// Protected Route komponenti
const ProtectedRoute = ({ children }) => {
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Token bitibse logout et
    if (token && checkTokenExpiration()) {
      dispatch(clearExpiredToken());
      navigate("/login");
    }
  }, [token, dispatch, navigate]);

  console.log('ProtectedRoute check:', { token: !!token, isAuthenticated, expired: checkTokenExpiration() });

  // Token yoxdursa vəya bitibse login səhifəsinə yönləndir
  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRouter = () => {
  const { token } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* Login route - yalnız token yoxdursa görünür */}
      <Route 
        path="/login" 
        element={
          token ? 
          <Navigate to="/admin" replace /> : 
          <Login />
        } 
      />
      
      {/* Protected admin route - bütün admin paneli buradadır */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } 
      />
      
      {/* Default route - token varsa admin-ə, yoxsa login-ə yönləndir */}
      <Route 
        path="/" 
        element={
          <Navigate to={token ? "/admin" : "/login"} replace />
        } 
      />
      
      {/* Digər bütün route-lar admin səhifəsinə yönləndirilir */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AppRouter;
