import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../Redux/Features/Login";
import "./Login.css";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error: authError, user, token } = useSelector((state) => state.auth);

  const [email, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (email && password) {
      try {
        const response = await dispatch(loginAdmin({
          email: email,
          password: password
        }));
        
        if (response.meta.requestStatus === 'fulfilled') {
          console.log('Login successful:', response.payload);
          setSuccess('Giriş uğurludur! Yönləndirilirsiniz...');
          setTimeout(() => {
            navigate('/admin');
          }, 1500);
        } else {
          console.error('Login failed:', response.error);
          setError('İstifadəçi adı və ya şifrə yanlışdır');
        }
      } catch (err) {
        console.error('Login error:', err);
        setError('Giriş zamanı xəta baş verdi');
      }
    } else {
      setError('Bütün sahələri doldurun');
    }
  };  // Login uğurlu olduqda admin panelinə yönləndir
  useEffect(() => {
    if (token) {
      navigate("/admin");
    }
  }, [token, navigate]);

  useEffect(() => {
    if (user) {
      console.log("Admin logged in:", user);
      navigate("/admin");
    }
  }, [user, navigate]);

  const formatTime = (date) => {
    return date.toLocaleTimeString('az-AZ', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('az-AZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return "Sabahınız xeyir";
    if (hour >= 12 && hour < 17) return "Günortanız xeyir";
    if (hour >= 17 && hour < 22) return "Axşamınız xeyir";
    return "Gecəniz xeyir";
  };



  return (
    <div className="login-container">
      {/* Background Animation */}
      <div className="login-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
      </div>

      {/* Login Card */}
      <div className="login-card">
        {/* Header Section */}
        <div className="login-header">
          <div className="logo-section">
            <div className="logo-icon">🛡️</div>
            <h1 className="login-title">Admin Panel</h1>
            <p className="login-subtitle">Super Admin İdarəetmə Sistemi</p>
          </div>
          
          <div className="time-display">
            <div className="current-time">{formatTime(currentTime)}</div>
            <div className="current-date">{formatDate(currentTime)}</div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="welcome-section">
          <h2 className="welcome-title">{getGreeting()}</h2>
          <p className="welcome-message">
            Admin panelinə daxil olmaq üçün məlumatlarınızı daxil edin
          </p>
        </div>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="login-username" className="form-label">
              � İstifadəçi adı
            </label>
            <div className="input-container">
              <span className="input-icon">�</span>
              <input
                id="login-username"
                type="text"
                placeholder="İstifadəçi adınızı daxil edin"
                value={email}
                onChange={(e) => setUsername(e.target.value)}
                className={`form-input ${email ? 'has-value' : ''}`}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              🔒 Şifrə
            </label>
            <div className="input-container">
              <span className="input-icon">🔑</span>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Şifrənizi daxil edin..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`form-input ${password ? 'has-value' : ''}`}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Submit Button */}
            <button
              type="submit"
              className="login-button valid"
              disabled={loading}
            >
              <div className="button-content">
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    <span>Giriş edilir...</span>
                  </>
                ) : (
                  <>
                    <span className="button-icon">🚀</span>
                    <span>Admin Panelə Daxil Ol</span>
                  </>
                )}
              </div>
            </button>          {/* Error Display */}
          {(error || authError) && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error || authError}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="success-message">
              <span className="success-icon">✅</span>
              <span className="success-text">{success}</span>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="login-footer">
          <div className="security-info">
            <span className="security-icon">🔐</span>
            <span>Təhlükəsiz bağlantı</span>
          </div>
          <div className="version-info">
            <span>v2.0.1</span>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="status-indicators">
        <div className="status-item">
          <div className="status-dot online"></div>
          <span>Server Online</span>
        </div>
        <div className="status-item">
          <div className="status-dot secure"></div>
          <span>SSL Secure</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
