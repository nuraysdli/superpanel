import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  logoutAdmin,
  checkTokenExpiration,
  clearExpiredToken,
} from "../../Redux/Features/Login";
import "./AdminPanel.css";

// Səhifə Komponentləri
import Ads from "./Ads";
import Category from "./Category";
import Role from "./Role";
import Persons from "./Persons";
import Businesses from "./Businesses";
import { Product } from "./Product";
import { Notification } from "./Notification";
import Profiles from "./Profiles";
import Report from "./Report";
import Log from "./Log";

// Redux Fetch Funksiyaları
import { fetchUsers } from "../../Redux/Features/AllUserSlice";
import { fetchAllBusinesses } from "../../Redux/Features/Businesses";
import { fetchProducts } from "../../Redux/Features/ProductSlice";
import { fetchAds } from "../../Redux/Features/AdsSlice";
// Refresh token funksiyaları tələb olunmadığı üçün istifadə edilmir

// ===========================================
// 🔹 Əsas Komponent: Home (Admin Panel)
// ===========================================

const Home = () => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Token expiration yoxlaması səhifə yüklənəndə
  useEffect(() => {
    if (!token) return;

    if (checkTokenExpiration()) {
      dispatch(clearExpiredToken());
      alert("Sessiya müddəti bitdi. Yenidən daxil olun.");
      window.location.href = "/login";
    }
  }, [dispatch, token]);

  const handleLogout = useCallback(() => {
    if (window.confirm("Çıxış etmək istədiyinizə əminsiniz?")) {
      dispatch(logoutAdmin());
    }
  }, [dispatch]);

  const menuItems = useMemo(
    () => [
      { id: "dashboard", label: "Dashboard", icon: "📊" },
      { id: "ads", label: "Reklamlar", icon: "📢" },
      { id: "category", label: "Kateqoriyalar", icon: "📋" },
      { id: "roles", label: "Rollar", icon: "👥" },
      { id: "persons", label: "Şəxslər", icon: "👤" },
      { id: "businesses", label: "Bizneslər", icon: "🏢" },
      { id: "products", label: "Məhsullar", icon: "📦" },
      { id: "notification", label: "Bildirişlər", icon: "🔔" },
      { id: "profiles", label: "Xidmət göstərənlər", icon: "🛠️" }, // İkonu dəyişdim
      { id: "report", label: "Hesabatlar", icon: "📈" },
      // { id: "wheel", label: "Təkər Xidməti", icon: "⚙️" },
      { id: "logs", label: "Loglar", icon: "📝" },
    ],
    []
  );

  const renderContent = () => {
    switch (activePage) {
      case "ads":
        return <Ads />;
      case "category":
        return <Category />;
      case "roles":
        return <Role />;
      case "persons":
        return <Persons />;
      case "businesses":
        return <Businesses />;
      case "products":
        return <Product />;
      case "notification":
        return <Notification />;
      case "profiles":
        return <Profiles />;
      case "report":
        return <Report />;
      // case "wheel":
      //   return <WheelService />;
      case "logs":
        return <Log />;
      default:
        return <DashboardHome setActivePage={setActivePage} />;
    }
  };

  // CSS-də istifadə etmək üçün sidebar state-ini class-a əlavə edirik
  const sidebarClass = sidebarCollapsed ? "sidebar collapsed" : "sidebar";
  const mainContentClass = sidebarCollapsed
    ? "main-content expanded"
    : "main-content";

  const currentPageTitle =
    menuItems.find((item) => item.id === activePage)?.label || "Dashboard";

  return (
    <div className="admin-container">
      <div className={sidebarClass}>
        <div className="sidebar-header">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="toggle-button"
            title={sidebarCollapsed ? "Genişləndir" : "Yığışdır"}
          >
            {sidebarCollapsed ? "≫" : "≪"}
          </button>
          {!sidebarCollapsed && <h2 className="logo">Admin Panel</h2>}
        </div>

        <nav className="nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`menu-item ${activePage === item.id ? "active" : ""}`}
              title={item.label}
            >
              <span className="menu-icon">{item.icon}</span>
              {!sidebarCollapsed && (
                <span className="menu-label">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <span className="menu-icon">🚪</span>
            {!sidebarCollapsed && <span>Çıxış</span>}
          </button>
        </div>
      </div>

      <div className={mainContentClass}>
        <div className="header">
          <h1 className="page-title">{currentPageTitle}</h1>
          <div className="user-info">
            <span className="welcome-text">
              Xoş gəlmisiniz, <strong>{user?.name || "Admin"}</strong>
            </span>
            <button onClick={handleLogout} className="header-logout-button">
              Çıxış
            </button>
          </div>
        </div>

        <div className="content">{renderContent()}</div>
      </div>
    </div>
  );
};

// ===========================================
// 🔹 Dashboard Home Komponenti (Daha Səliqəli)
// ===========================================

const DashboardHome = ({ setActivePage }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Redux datalarını çıxarmaq
  const users = useSelector((state) => state.users.list || []);
  const businesses = useSelector((state) => state.businesses.all || []);
  const products = useSelector((state) => state.products.list || {});
  const ads = useSelector((state) => state.ads.list || []);

  // Datadan sayları çıxarmaq
  const userNumber = Array.isArray(users)
    ? users.length
    : users.content?.length || 0;
  const businessLength = Array.isArray(businesses)
    ? businesses.length
    : businesses.content?.length || 0;
  const productLength = Array.isArray(products)
    ? products.length
    : products.content?.length || 0;
  const allAdsLength = Array.isArray(ads)
    ? ads.length
    : ads.content?.length || 0;

  const [currentTime, setCurrentTime] = useState(new Date());
  const [loginTime] = useState(new Date());

  // Data fetch
  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchAllBusinesses());
    dispatch(fetchProducts());
    dispatch(fetchAds());
  }, [dispatch]);

  // Saat yenilənməsi
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString("az-AZ", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  const formatDate = (date) =>
    date.toLocaleDateString("az-AZ", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const getGreeting = () => {
    const hour = loginTime.getHours();
    if (hour >= 5 && hour < 12) return "Sabahınız xeyir";
    if (hour >= 12 && hour < 17) return "Günortanız xeyir";
    if (hour >= 17 && hour < 22) return "Axşamınız xeyir";
    return "Gecəniz xeyir";
  };

  const getWelcomeMessage = () => {
    const hour = loginTime.getHours();
    const minute = loginTime.getMinutes();
    const timeStr = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;

    if (hour >= 5 && hour < 9)
      return `Admin panelinizə ${timeStr}-da daxil oldunuz. Səhər işlərinizə uğurlar diləyirik!`;
    if (hour >= 9 && hour < 12)
      return `Səhər saatlarında daxil oldunuz. Sistemdə hər şey qaydasındadır.`;
    if (hour >= 12 && hour < 17)
      return `Günortadan sonra da aktiv iş gününüz davam edir!`;
    if (hour >= 17 && hour < 22)
      return `Axşam saatlarında sisteminizdə hər şey nəzarətdədir.`;
    return `Gecə keç saatlarda da aktivsiniz, əla!`;
  };

  const metrics = [
    {
      id: "users",
      label: "Ümumi İstifadəçi",
      value: userNumber,
      color: "#3b82f6",
      icon: "👥",
      trend: "Aktiv sistem",
    },
    {
      id: "businesses",
      label: "Təsdiqlənmiş Biznes",
      value: businessLength,
      color: "#10b981",
      icon: "🏢",
      trend: businessLength > 0 ? "Aktiv bazada" : "Məlumat yoxdur",
    },
    {
      id: "products",
      label: "Məhsul Sayı",
      value: productLength,
      color: "#f59e0b",
      icon: "📦",
      trend: productLength > 0 ? "Məhsul bazası aktivdir" : "Məlumat yoxdur",
    },
    {
      id: "ads",
      label: "Reklam Sayı",
      value: allAdsLength,
      color: "#ef4444",
      icon: "📢",
      trend: allAdsLength > 0 ? "Aktiv reklamlar" : "Reklam yoxdur",
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="welcome-info">
            <h1 className="hero-title">
              {getGreeting()}, {user?.name || "Admin"}! 👋
            </h1>
            <p className="hero-subtitle">{getWelcomeMessage()}</p>
            <div className="user-details">
              <div className="user-detail-item">
                <span className="detail-icon">👤</span>
                <span>
                  {user?.name} {user?.surname}
                </span>
              </div>
              <div className="user-detail-item">
                <span className="detail-icon">📧</span>
                <span>{user?.email}</span>
              </div>
              <div className="user-detail-item">
                <span className="detail-icon">📞</span>
                <span>{user?.phone || "Məlumat yoxdur"}</span>
              </div>
            </div>
          </div>
          <div className="time-info">
            <div className="current-time">{formatTime(currentTime)}</div>
            <div className="current-date">{formatDate(currentTime)}</div>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className={`metric-card ${metric.id}`}
            style={{ "--metric-color": metric.color }}
          >
            <div className="metric-icon">{metric.icon}</div>
            <div className="metric-info">
              <div className="metric-value">{metric.value}</div>
              <div className="metric-label">{metric.label}</div>
              <div
                className="metric-trend"
                style={{
                  background: `color-mix(in srgb, ${metric.color} 20%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${metric.color} 50%, transparent)`,
                  color: metric.color,
                }}
              >
                {metric.trend}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
