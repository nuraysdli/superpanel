import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteBroadcast,
  fetchBroadcasts,
  sendBroadcast,
} from "../../Redux/Features/notificationSlice";
import "./Notification.css";

export const Notification = () => {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.notifications);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSendForm, setShowSendForm] = useState(false);

  useEffect(() => {
    console.log("📩 Notification List:", list);
  }, [list]);

  // Fetch all notifications on mount
  useEffect(() => {
    dispatch(fetchBroadcasts());
  }, [dispatch]);

  // Utility functions
  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleNotificationDetail = (notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Tarix məlum deyil";
    const date = new Date(dateString);
    return date.toLocaleDateString("az-AZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "SUCCESS":
        return "✅";
      case "WARNING":
        return "⚠️";
      case "ERROR":
        return "❌";
      case "INFO":
        return "ℹ️";
      default:
        return "📢";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "SUCCESS":
        return "#10b981";
      case "WARNING":
        return "#f59e0b";
      case "ERROR":
        return "#ef4444";
      case "INFO":
        return "#3b82f6";
      default:
        return "#8b5cf6";
    }
  };

  // Form submit
  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) {
      return alert("Başlıq və açıqlama doldurulmalıdır!");
    }

    try {
      const resultAction = await dispatch(
        sendBroadcast({ title, description: desc })
      );

      if (sendBroadcast.fulfilled.match(resultAction)) {
        // ✅ Yeni bildiriş artıq slice-də list-in əvvəlinə əlavə olunur
        setTitle("");
        setDesc("");
        setShowSendForm(false);
      } else {
        alert("Bildiriş göndərilə bilmədi!");
      }
    } catch (err) {
      alert("Xəta baş verdi: " + err.message);
    }
  };

  // Filter and sort notifications
  const filteredAndSortedNotifications = useMemo(() => {
    if (!Array.isArray(list)) return [];

    let filtered = list.filter((item) => {
      if (!item || !item.title) return false;

      const searchMatch =
        searchTerm === "" ||
        (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      return searchMatch;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || "";
      let bValue = b[sortBy] || "";

      if (sortBy === "date") {
        aValue = new Date(a.createdAt || a.date || 0);
        bValue = new Date(b.createdAt || b.date || 0);
      } else if (sortBy === "id") {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else {
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [list, searchTerm, sortBy, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    const notifications = Array.isArray(list)
      ? list.filter((item) => item && item.title)
      : [];
    return {
      total: notifications.length,
      today: notifications.filter((n) => {
        const date = new Date(n.createdAt || n.date);
        const today = new Date();
        return date.toDateString() === today.toDateString();
      }).length,
      thisWeek: notifications.filter((n) => {
        const date = new Date(n.createdAt || n.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= weekAgo;
      }).length,
      filtered: filteredAndSortedNotifications.length,
    };
  }, [list, filteredAndSortedNotifications]);

  const renderNotificationCard = (notification) => (
    <div
      key={notification.id || Math.random()}
      className="notification-card"
      onClick={() => handleNotificationDetail(notification)}
    >
      <div className="notification-header">
        <div
          className="notification-icon"
          style={{ backgroundColor: getNotificationColor(notification.type) }}
        >
          {getNotificationIcon(notification.type)}
        </div>
        <div className="notification-info">
          <h3 className="notification-title">{notification.title}</h3>
          <div className="notification-meta">
            <span className="notification-id">
              🆔 ID: {notification.id || "N/A"}
            </span>
            <span className="notification-date">
              📅 {formatDate(notification.createdAt || notification.date)}
            </span>
          </div>
        </div>
        <div className="notification-status">
          <div className="status-badge active">📢 Göndərildi</div>
          <button
            className="status-badge active"
            style={{
              color: "white",
            }}
            onClick={(e) => {
              e.stopPropagation(); // modal açılmasın
              if (window.confirm("Bildirişi silmək istədiyinizə əminsiniz?")) {
                dispatch(deleteBroadcast(notification.id));
              }
            }}
          >
            🗑️ Sil
          </button>
        </div>
      </div>

      <div className="notification-content">
        <p className="notification-description">
          {notification.description && notification.description.length > 100
            ? `${notification.description.substring(0, 100)}...`
            : notification.description || "Açıqlama yoxdur"}
        </p>
      </div>

      <div className="notification-actions-preview">
        <button
          className="btn-preview"
          onClick={(e) => {
            e.stopPropagation();
            handleNotificationDetail(notification);
          }}
        >
          👁️ Ətraflı Bax
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="notifications-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Bildirişlər yüklənir...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-container">
        <div className="error-state">
          ⚠️ Xəta baş verdi:{" "}
          {typeof error === "string" ? error : JSON.stringify(error)}
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      {/* Header */}
      <div className="notifications-header">
        <h1 className="notifications-title">📢 Bildiriş İdarəetməsi</h1>
        <p className="notifications-subtitle">
          Sistem bildirişlərini göndərin və bütün yayım bildirişlərini idarə
          edin
        </p>
        <button
          className="add-notification-btn"
          onClick={() => setShowSendForm(true)}
        >
          ➕ Yeni Bildiriş Göndər
        </button>
      </div>

      {/* Controls */}
      <div className="notifications-controls">
        <div className="search-sort-section">
          {/* Search */}
          <div className="search-input-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Başlıq və ya açıqlama ilə axtar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={handleClearSearch} className="clear-search-btn">
                ✖️
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="sort-controls">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="date">📅 Tarix</option>
              <option value="title">📝 Başlıq</option>
              <option value="id">🆔 ID</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className={`sort-order-btn ${sortOrder}`}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Ümumi</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.filtered}</div>
            <div className="stat-label">Filtrlənmiş</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.today}</div>
            <div className="stat-label">Bu gün</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.thisWeek}</div>
            <div className="stat-label">Bu həftə</div>
          </div>
        </div>
      </div>

      {/* Search Info */}
      {searchTerm && (
        <div className="search-info">
          🔍 "{searchTerm}" üçün {filteredAndSortedNotifications.length} nəticə
          tapıldı
        </div>
      )}

      {/* Notifications Display */}
      {filteredAndSortedNotifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📢</div>
          <h3>Bildiriş tapılmadı</h3>
          <p>
            Hələ heç bir bildiriş göndərilməyib və ya axtarış kriteriyalarınıza
            uyğun nəticə yoxdur
          </p>
          <button
            className="empty-action-btn"
            onClick={() => setShowSendForm(true)}
          >
            ➕ İlk Bildirişinizi Göndərin
          </button>
        </div>
      ) : (
        <div className="notifications-grid">
          {filteredAndSortedNotifications.map(renderNotificationCard)}
        </div>
      )}

      {/* Send Form Modal */}
      {showSendForm && (
        <div className="modal-overlay" onClick={() => setShowSendForm(false)}>
          <div className="send-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <h2>📢 Yeni Bildiriş Göndər</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowSendForm(false)}
                >
                  ❌
                </button>
              </div>
            </div>

            <form onSubmit={handleSend} className="send-form">
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  📝 Başlıq
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="Bildiriş başlığını daxil edin..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  📄 Açıqlama
                </label>
                <textarea
                  id="description"
                  placeholder="Bildiriş açıqlamasını daxil edin..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="form-textarea"
                  rows="4"
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowSendForm(false)}
                  className="btn btn-cancel"
                >
                  ❌ Ləğv Et
                </button>
                <button
                  type="submit"
                  className="btn btn-send"
                  disabled={!title.trim() || !desc.trim()}
                >
                  📤 Bildirişi Göndər
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Detail Modal */}
      {showDetailModal && selectedNotification && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="notification-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title">
                <h2>📢 {selectedNotification.title}</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowDetailModal(false)}
                >
                  ❌
                </button>
              </div>
              <div className="notification-badges-row">
                <div className="status-badge active">📢 Göndərildi</div>
                <div className="notification-id-badge">
                  ID: #{selectedNotification.id || "N/A"}
                </div>
              </div>
            </div>

            <div className="modal-content">
              {/* Notification Info */}
              <div className="notification-info-section">
                <h3>📋 Bildiriş Məlumatları</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>📝 Başlıq:</strong> {selectedNotification.title}
                  </div>
                  <div className="info-item">
                    <strong>📄 Açıqlama:</strong>{" "}
                    {selectedNotification.description || "Açıqlama yoxdur"}
                  </div>
                  <div className="info-item">
                    <strong>📅 Göndərilmə tarixi:</strong>{" "}
                    {formatDate(
                      selectedNotification.createdAt ||
                        selectedNotification.date
                    )}
                  </div>
                  <div className="info-item">
                    <strong>🆔 ID:</strong> {selectedNotification.id || "N/A"}
                  </div>
                  {selectedNotification.type && (
                    <div className="info-item">
                      <strong>🏷️ Növ:</strong> {selectedNotification.type}
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Details */}
              {(selectedNotification.recipients ||
                selectedNotification.channels) && (
                <div className="additional-info-section">
                  <h3>🎯 Göndərim Məlumatları</h3>
                  <div className="info-grid">
                    {selectedNotification.recipients && (
                      <div className="info-item">
                        <strong>👥 Alıcılar:</strong>{" "}
                        {selectedNotification.recipients}
                      </div>
                    )}
                    {selectedNotification.channels && (
                      <div className="info-item">
                        <strong>📡 Kanallar:</strong>{" "}
                        {selectedNotification.channels}
                      </div>
                    )}
                    {selectedNotification.priority && (
                      <div className="info-item">
                        <strong>⚡ Prioritet:</strong>{" "}
                        {selectedNotification.priority}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Full Description */}
              <div className="full-description-section">
                <h3>📝 Tam Açıqlama</h3>
                <div className="description-content">
                  {selectedNotification.description ||
                    "Açıqlama məlumatı mövcud deyil"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
