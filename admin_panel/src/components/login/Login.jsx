import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginAdmin } from "../Redux/Features/Login";
import "./Login.css";

const Login = () => {
  const dispatch = useDispatch();
  const { loading, error, user, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [time, setTime] = useState(new Date());

  // Saat və saniyə, dəqiqə real vaxt üçün
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Greeting funksiyası
  const getGreeting = () => {
    const hour = time.getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    dispatch(loginAdmin({ email, password }));
  };

  return (
    <div className="body">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="neu-icon">
              <div className="icon-inner">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>
            <h2>Welcome Admin</h2>
            <p>
              {isAuthenticated
                ? `${getGreeting()} - ${time
                    .getHours()
                    .toString()
                    .padStart(2, "0")}:${time
                    .getMinutes()
                    .toString()
                    .padStart(2, "0")}:${time
                    .getSeconds()
                    .toString()
                    .padStart(2, "0")}`
                : "Please sign in to continue"}
            </p>
          </div>

          {!isAuthenticated && (
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <div className="input-group neu-input">
                  <input
                    type="email"
                    placeholder=" Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <div className="input-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="input-group neu-input password-group">
                  <input
                    type="password"
                    placeholder="Password "
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <div className="input-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </div>
                </div>
              </div>

              {error && <p className="error-message show">{error}</p>}

              <button
                type="submit"
                className={`neu-button login-btn ${loading ? "loading" : ""}`}
              >
                Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
