import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllBusinesses,
  fetchBusinessById,
  fetchApprovedBusinesses,
  fetchPendingBusinesses,
  blockBusiness,
  unblockBusiness,
  approveBusiness,
  rejectBusiness,
  acceptTIN,
  rejectTIN,
  searchApprovedBusinesses,
  searchPendingBusinesses,
} from "../../Redux/Features/Businesses";
import "./Businesses.css";

const Businesses = () => {
  const dispatch = useDispatch();
  const {
    all: businesses,
    approved,
    pending,
    single: business,
    loading,
    error,
    searchLoading,
    tinAccepting,
    tinRejecting,
  } = useSelector((state) => state.businesses);

  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [tinRejectReason, setTinRejectReason] = useState("");
  const [approvedSearchTerm, setApprovedSearchTerm] = useState("");
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showDetailModal, setShowDetailModal] = useState(false);

  // İlk yükleme
  useEffect(() => {
    dispatch(fetchAllBusinesses());
    dispatch(fetchApprovedBusinesses());
    dispatch(fetchPendingBusinesses());
  }, []);

  // Search funksiyaları
  const handleSearchApproved = () => {
    if (!approvedSearchTerm.trim()) return;
    dispatch(searchApprovedBusinesses(approvedSearchTerm));
  };
  const handleSearchPending = () => {
    if (!pendingSearchTerm.trim()) return;
    dispatch(searchPendingBusinesses(pendingSearchTerm));
  };

  const handleSelectBusiness = (id) => {
    dispatch(fetchBusinessById(id));
    setSelectedBusiness(id);
    setShowDetailModal(true);
  };

  // Status və TIN əməliyyatları
  const handleApprove = (id) => dispatch(approveBusiness(id));
  const handleReject = (id) => {
    if (!rejectReason.trim()) return alert("Rədd səbəbini daxil et!");
    dispatch(rejectBusiness({ companyId: id, reason: rejectReason }));
    setRejectReason("");
  };
  const handleBlock = (id) => {
    if (!blockReason.trim()) return alert("Blok səbəbini daxil et!");
    dispatch(blockBusiness({ companyId: id, reason: blockReason }));
    setBlockReason("");
  };
  const handleUnblock = (id) => dispatch(unblockBusiness(id));

  const handleAcceptTIN = (id) => dispatch(acceptTIN(id));
  const handleRejectTIN = (id) => {
    if (!tinRejectReason.trim()) return alert("TIN rədd səbəbini daxil et!");
    dispatch(rejectTIN({ id, reason: tinRejectReason }));
    setTinRejectReason("");
  };

  // Hər ikisini birlikdə etmək üçün
  const handleApproveAndAcceptTIN = async (id) => {
    await dispatch(approveBusiness(id));
    await dispatch(acceptTIN(id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "#10b981";
      case "INACTIVE":
        return "#ef4444";
      case "APPROVED":
        return "#3b82f6";
      case "PENDING":
        return "#f59e0b";
      case "REJECTED":
        return "#dc2626";
      case "BLOCKED":
        return "#6b7280";
      default:
        return "#64748b";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "ACTIVE":
        return "✅";
      case "INACTIVE":
        return "❌";
      case "APPROVED":
        return "👍";
      case "PENDING":
        return "⏳";
      case "REJECTED":
        return "🚫";
      case "BLOCKED":
        return "🔒";
      default:
        return "❓";
    }
  };

  const getTinStatusIcon = (status) => {
    switch (status) {
      case "ACCEPTED":
        return "✅";
      case "REJECTED":
        return "❌";
      case "PENDING":
        return "⏳";
      default:
        return "❓";
    }
  };

  const renderBusinessCard = (business) => (
    <div
      key={business.id}
      className="business-card"
      onClick={() => handleSelectBusiness(business.id)}
    >
      <div className="business-header">
        <div className="business-info">
          <h3 className="business-name">{business.shopName}</h3>
          <p className="business-tagline">{business.tagline}</p>
          <div className="business-id">🆔 ID: {business.id}</div>
        </div>
        <div className="business-badges">
          <div
            className="status-badge"
            style={{ backgroundColor: getStatusColor(business.status) }}
          >
            {getStatusIcon(business.status)} {business.status}
          </div>
          {business.tinStatus && (
            <div
              className="tin-badge"
              style={{ backgroundColor: getStatusColor(business.tinStatus) }}
            >
              {getTinStatusIcon(business.tinStatus)} TIN: {business.tinStatus}
            </div>
          )}
        </div>
      </div>

      <div className="business-details">
        <div className="detail-item">
          <span className="detail-icon">🏢</span>
          <span className="detail-text">
            Kod: {business.businessCode || "N/A"}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-icon">📋</span>
          <span className="detail-text">TIN: {business.tin || "N/A"}</span>
        </div>
        {business.branches && business.branches.length > 0 && (
          <div className="detail-item">
            <span className="detail-icon">📍</span>
            <span className="detail-text">
              {business.branches.length} filial
            </span>
          </div>
        )}
      </div>

      <div className="business-actions-preview">
        <button
          className="btn-preview"
          onClick={(e) => {
            e.stopPropagation();
            handleSelectBusiness(business.id);
          }}
        >
          👁️ Ətraflı Bax
        </button>
      </div>
    </div>
  );

  const renderBusinessList = (list) => (
    <div className="businesses-grid">
      {Array.isArray(list) && list.length > 0 ? (
        list.map(renderBusinessCard)
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🏢</div>
          <h3>Biznes tapılmadı</h3>
          <p>Bu kateqoriyada hələ heç bir biznes mövcud deyil</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="businesses-container">
      {/* Header */}
      {/* <div className="businesses-header">
        <h1 className="businesses-title">
          🏢 Biznes İdarəetməsi
        </h1>
        <p className="businesses-subtitle">
          Biznesləri idarə edin, statuslarını dəyişin və TIN təsdiqləmələrini həyata keçirin
        </p>
      </div> */}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          🏢 Bütün Bizneslər ({businesses?.length || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === "approved" ? "active" : ""}`}
          onClick={() => setActiveTab("approved")}
        >
          ✅ Təsdiqlənmiş ({approved?.length || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          ⏳ Gözləmədə ({pending?.length || 0})
        </button>
      </div>

      {/* Search Section */}
      {(activeTab === "approved" || activeTab === "pending") && (
        <div className="search-section">
          <div className="search-input-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder={`${
                activeTab === "approved" ? "Təsdiqlənmiş" : "Gözləmədə olan"
              } bizneslərdə axtar...`}
              value={
                activeTab === "approved"
                  ? approvedSearchTerm
                  : pendingSearchTerm
              }
              onChange={(e) =>
                activeTab === "approved"
                  ? setApprovedSearchTerm(e.target.value)
                  : setPendingSearchTerm(e.target.value)
              }
              className="search-input"
            />
            <button
              onClick={
                activeTab === "approved"
                  ? handleSearchApproved
                  : handleSearchPending
              }
              className="search-btn"
              disabled={
                !(activeTab === "approved"
                  ? approvedSearchTerm.trim()
                  : pendingSearchTerm.trim())
              }
            >
              🔍 Axtar
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {(loading || searchLoading) && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Bizneslər yüklənir...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          ⚠️ Xəta: {typeof error === "string" ? error : JSON.stringify(error)}
        </div>
      )}

      {/* Business Lists */}
      {!loading && !searchLoading && !error && (
        <div className="businesses-content">
          {activeTab === "all" && renderBusinessList(businesses)}
          {activeTab === "approved" && renderBusinessList(approved)}
          {activeTab === "pending" && renderBusinessList(pending)}
        </div>
      )}

      {/* Business Detail Modal */}
      {showDetailModal && business && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="business-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title">
                <h2>🏢 {business.shopName}</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowDetailModal(false)}
                >
                  ❌
                </button>
              </div>
              <div className="business-status-row">
                <div
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(business.status) }}
                >
                  {getStatusIcon(business.status)} {business.status}
                </div>
                {business.tinStatus && (
                  <div
                    className="tin-badge"
                    style={{
                      backgroundColor: getStatusColor(business.tinStatus),
                    }}
                  >
                    {getTinStatusIcon(business.tinStatus)} TIN:{" "}
                    {business.tinStatus}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-content">
              {/* Business Info */}
              <div className="business-info-section">
                <h3>📋 Əsas Məlumatlar</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>🏷️ Tagline:</strong> {business.tagline || "N/A"}
                  </div>
                  <div className="info-item">
                    <strong>📋 TIN:</strong> {business.tin || "N/A"}
                  </div>
                  <div className="info-item">
                    <strong>🏢 Kod:</strong> {business.businessCode || "N/A"}
                  </div>
                  <div className="info-item">
                    <strong>📝 Təsvir:</strong> {business.description || "N/A"}
                  </div>
                </div>
              </div>

              {/* Action Forms */}
              <div className="action-forms">
                <div className="reason-inputs">
                  <input
                    type="text"
                    placeholder="Rədd səbəbi..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="reason-input"
                  />
                  <input
                    type="text"
                    placeholder="Blok səbəbi..."
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="reason-input"
                  />
                  <input
                    type="text"
                    placeholder="TIN rədd səbəbi..."
                    value={tinRejectReason}
                    onChange={(e) => setTinRejectReason(e.target.value)}
                    className="reason-input"
                  />
                </div>

                <div className="action-buttons">
                  {/* <button onClick={() => handleApprove(business.id)} className="btn btn-success">
                    ✅ Təsdiqləmə
                  </button>
                  <button onClick={() => handleReject(business.id)} className="btn btn-danger">
                    ❌ Rədd Et
                  </button> */}
                  <button
                    onClick={() => handleBlock(business.id)}
                    className="btn btn-warning"
                  >
                    � Blokla
                  </button>
                  <button
                    onClick={() => handleUnblock(business.id)}
                    className="btn btn-info"
                  >
                    🔓 Blokdan Çıxar
                  </button>
                  <button
                    onClick={() => handleAcceptTIN(business.id)}
                    className="btn btn-primary"
                    disabled={tinAccepting}
                  >
                    ✔️ TIN Qəbul
                  </button>
                  <button
                    onClick={() => handleRejectTIN(business.id)}
                    className="btn btn-secondary"
                    disabled={tinRejecting}
                  >
                    ❌ TIN Rədd
                  </button>
                  {/* <button
                    onClick={() => handleApproveAndAcceptTIN(business.id)}
                    className="btn btn-gradient"
                  >
                    ✅ Təsdiq + TIN
                  </button> */}
                </div>
              </div>

              {/* Branches */}
              {business.branches && business.branches.length > 0 && (
                <div className="branches-section">
                  <h3>📍 Filiallar ({business.branches.length})</h3>
                  <div className="branches-grid">
                    {business.branches.map((branch) => (
                      <div key={branch.id} className="branch-card">
                        <div className="branch-header">
                          <h4>🏪 {branch.name}</h4>
                          <div className="branch-rating">
                            ⭐ {branch.averageRating || "N/A"}
                          </div>
                        </div>
                        <div className="branch-info">
                          <p>
                            <strong>📍 Ünvan:</strong>{" "}
                            {branch.location?.address || "N/A"}
                          </p>
                          <p>
                            <strong>📞 Telefon:</strong> {branch.phone || "N/A"}
                          </p>
                          <p>
                            <strong>📝 Açıqlama:</strong>{" "}
                            {branch.description || "N/A"}
                          </p>
                        </div>

                        {/* Services */}
                        {branch.businessPages &&
                          branch.businessPages[0]?.servicePrices?.length >
                            0 && (
                            <div className="services-section">
                              <h5>🧰 Xidmətlər</h5>
                              <div className="services-list">
                                {branch.businessPages[0].servicePrices.map(
                                  (service) => (
                                    <div
                                      key={service.id}
                                      className="service-card"
                                    >
                                      <div className="service-header">
                                        <span className="service-name">
                                          {service.serviceName}
                                        </span>
                                        <span className="service-price">
                                          {service.price} ₼
                                        </span>
                                      </div>
                                      <div className="service-details">
                                        <span>
                                          ⭐ {service.averageRating || "N/A"}
                                        </span>
                                        <span>
                                          📊 Say: {service.count || 0}
                                        </span>
                                      </div>

                                      {/* Reviews */}
                                      {service.reviews &&
                                        service.reviews.length > 0 && (
                                          <div className="reviews-section">
                                            <h6>
                                              💬 Rəylər (
                                              {service.reviews.length})
                                            </h6>
                                            <div className="reviews-list">
                                              {service.reviews
                                                .slice(0, 3)
                                                .map((review) => (
                                                  <div
                                                    key={review.id}
                                                    className="review-item"
                                                  >
                                                    <div className="review-header">
                                                      <span className="reviewer-name">
                                                        {review.name}{" "}
                                                        {review.surname}
                                                      </span>
                                                      <span className="review-rating">
                                                        ⭐ {review.rating}
                                                      </span>
                                                    </div>
                                                    <p className="review-comment">
                                                      "{review.comment}"
                                                    </p>
                                                  </div>
                                                ))}
                                              {service.reviews.length > 3 && (
                                                <p className="more-reviews">
                                                  ... və{" "}
                                                  {service.reviews.length - 3}{" "}
                                                  rəy daha
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Businesses;
