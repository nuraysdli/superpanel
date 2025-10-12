import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfiles, fetchProfileById } from "../../Redux/Features/ProfessionalProfile";
import Pagination from "../../Pagination/Pagination";
import "./Profiles.css";

const Profiles = () => {
  const dispatch = useDispatch();
  const { list, single, loading, error } = useSelector((state) => state.profiles);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  console.log(list);

  useEffect(() => {
    const fetchData = async () => {
      const action = await dispatch(fetchProfiles(currentPage - 1));
      if (action.payload?.page?.totalPages) {
        setTotalPages(action.payload.page.totalPages);
      }
    };
    fetchData();
  }, [dispatch, currentPage]);

  // Utility functions
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleProfileDetail = (profile) => {
    setSelectedProfile(profile);
    setShowDetailModal(true);
    dispatch(fetchProfileById(profile.id));
  };

  const getProfileInitials = (name, surname) => {
    const firstInitial = name ? name.charAt(0).toUpperCase() : '';
    const lastInitial = surname ? surname.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  };

  const getProfileColor = (id) => {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
      '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
    ];
    return colors[id % colors.length];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter and sort profiles
  const filteredAndSortedProfiles = useMemo(() => {
    if (!list?.content) return [];
    
    let filtered = list.content.filter(profile => {
      const searchMatch = searchTerm === '' || 
        (profile.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (profile.surname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (profile.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (profile.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      return searchMatch;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      
      if (sortBy === 'name') {
        aValue = `${a.name || ''} ${a.surname || ''}`.toLowerCase();
        bValue = `${b.name || ''} ${b.surname || ''}`.toLowerCase();
      } else if (sortBy === 'id') {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else {
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [list, searchTerm, sortBy, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    const profiles = list?.content || [];
    return {
      total: profiles.length,
      active: profiles.filter(p => p.isActive).length,
      verified: profiles.filter(p => p.isVerified).length,
      filtered: filteredAndSortedProfiles.length
    };
  }, [list, filteredAndSortedProfiles]);

  const renderProfileCard = (profile) => (
    <div key={profile.id} className="profile-card" onClick={() => handleProfileDetail(profile)}>
      <div className="profile-header">
        <div className="profile-avatar" style={{ backgroundColor: getProfileColor(profile.id) }}>
          {profile.profileImage ? (
            <img src={profile.profileImage} alt={`${profile.name} ${profile.surname}`} />
          ) : (
            <span className="profile-initials">{getProfileInitials(profile.name, profile.surname)}</span>
          )}
        </div>
        <div className="profile-status-badges">
          {profile.isActive && <div className="status-badge active">🟢 Aktiv</div>}
          {profile.isVerified && <div className="status-badge verified">✅ Təsdiqli</div>}
        </div>
      </div>
      
      <div className="profile-info">
        <h3 className="profile-name">{profile.name} {profile.surname}</h3>
        <div className="profile-username">@{profile.username}</div>
        <div className="profile-id">🆔 ID: {profile.id}</div>
      </div>
      
      <div className="profile-details">
        <div className="detail-item">
          <span className="detail-icon">📧</span>
          <span className="detail-text">{profile.email || 'Email yoxdur'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-icon">📞</span>
          <span className="detail-text">{profile.phone || 'Telefon yoxdur'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-icon">📅</span>
          <span className="detail-text">Qeydiyyat: {formatDate(profile.createdAt)}</span>
        </div>
      </div>
      
      <div className="profile-actions-preview">
        <button className="btn-preview" onClick={(e) => { e.stopPropagation(); handleProfileDetail(profile); }}>
          👁️ Ətraflı Bax
        </button>
      </div>
    </div>
  );

  const renderProfileListItem = (profile) => (
    <div key={profile.id} className="profile-list-item" onClick={() => handleProfileDetail(profile)}>
      <div className="profile-list-info">
        <div className="profile-list-main">
          <div className="profile-avatar-small" style={{ backgroundColor: getProfileColor(profile.id) }}>
            {profile.profileImage ? (
              <img src={profile.profileImage} alt={`${profile.name} ${profile.surname}`} />
            ) : (
              <span className="profile-initials-small">{getProfileInitials(profile.name, profile.surname)}</span>
            )}
          </div>
          <div className="profile-list-details">
            <div className="profile-list-name">{profile.name} {profile.surname}</div>
            <div className="profile-list-username">@{profile.username}</div>
          </div>
        </div>
        <div className="profile-list-meta">
          <div className="profile-list-id">ID: #{profile.id}</div>
          <div className="profile-list-email">{profile.email || 'Email yoxdur'}</div>
        </div>
        <div className="profile-list-badges">
          {profile.isActive && <div className="status-badge-small active">🟢</div>}
          {profile.isVerified && <div className="status-badge-small verified">✅</div>}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="profiles-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Profil məlumatları yüklənir...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profiles-container">
        <div className="error-state">
          ⚠️ Xəta baş verdi: {typeof error === 'string' ? error : JSON.stringify(error)}
        </div>
      </div>
    );
  }

  return (
    <div className="profiles-container">
      {/* Header */}
      {/* <div className="profiles-header">
        <h1 className="profiles-title">
          👤 Profil İdarəetməsi
        </h1>
        <p className="profiles-subtitle">
          İstifadəçi profilləri və professional məlumatları idarə edin
        </p>
      </div> */}

      {/* Controls */}
      <div className="profiles-controls">
        <div className="search-sort-section">
          {/* Search */}
          <div className="search-input-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Ad, soyad, istifadəçi adı və ya email ilə axtar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={handleClearSearch} className="clear-search-btn">✖️</button>
            )}
          </div>

          {/* Sort */}
          <div className="sort-controls">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="name">👤 Ad</option>
              <option value="username">📝 İstifadəçi adı</option>
              <option value="email">📧 Email</option>
              <option value="id">🆔 ID</option>
            </select>
            <button 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className={`sort-order-btn ${sortOrder}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        <div className="view-stats-section">
          {/* View Mode */}
          <div className="view-controls">
            <button 
              onClick={() => setViewMode('grid')}
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            >
              🔲 Grid
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            >
              📋 List
            </button>
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
              <div className="stat-number">{stats.active}</div>
              <div className="stat-label">Aktiv</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.verified}</div>
              <div className="stat-label">Təsdiqli</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Info */}
      {searchTerm && (
        <div className="search-info">
          🔍 "{searchTerm}" üçün {filteredAndSortedProfiles.length} nəticə tapıldı
        </div>
      )}

      {/* Profiles Display */}
      {filteredAndSortedProfiles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <h3>Profil tapılmadı</h3>
          <p>Axtarış kriteriyalarınızı dəyişdirərək yenidən cəhd edin</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="profiles-grid">
              {filteredAndSortedProfiles.map(renderProfileCard)}
            </div>
          ) : (
            <div className="profiles-list">
              {filteredAndSortedProfiles.map(renderProfileListItem)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-wrapper">
              <Pagination
                currentPage={currentPage}
                lastPage={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </>
      )}

      {/* Profile Detail Modal */}
      {showDetailModal && selectedProfile && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="profile-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <h2>👤 {selectedProfile.name} {selectedProfile.surname}</h2>
                <button className="close-btn" onClick={() => setShowDetailModal(false)}>❌</button>
              </div>
              <div className="profile-badges-row">
                {selectedProfile.isActive && <div className="status-badge active">🟢 Aktiv</div>}
                {selectedProfile.isVerified && <div className="status-badge verified">✅ Təsdiqli</div>}
                <div className="profile-id-badge">ID: #{selectedProfile.id}</div>
              </div>
            </div>

            <div className="modal-content">
              {/* Profile Avatar Section */}
              <div className="profile-avatar-section">
                <div className="profile-avatar-large" style={{ backgroundColor: getProfileColor(selectedProfile.id) }}>
                  {selectedProfile.profileImage ? (
                    <img src={selectedProfile.profileImage} alt={`${selectedProfile.name} ${selectedProfile.surname}`} />
                  ) : (
                    <span className="profile-initials-large">{getProfileInitials(selectedProfile.name, selectedProfile.surname)}</span>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="profile-info-section">
                <h3>📋 Əsas Məlumatlar</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>👤 Ad:</strong> {selectedProfile.name}
                  </div>
                  <div className="info-item">
                    <strong>👤 Soyad:</strong> {selectedProfile.surname}
                  </div>
                  <div className="info-item">
                    <strong>📝 İstifadəçi adı:</strong> @{selectedProfile.username}
                  </div>
                  <div className="info-item">
                    <strong>📧 Email:</strong> {selectedProfile.email || 'Məlumat yoxdur'}
                  </div>
                  <div className="info-item">
                    <strong>📞 Telefon:</strong> {selectedProfile.phone || 'Məlumat yoxdur'}
                  </div>
                  <div className="info-item">
                    <strong>📅 Qeydiyyat tarixi:</strong> {formatDate(selectedProfile.createdAt)}
                  </div>
                </div>
              </div>

              {/* Professional Info */}
              {single && (
                <div className="professional-info-section">
                  <h3>🔧 Professional Məlumatlar</h3>
                  <div className="info-grid">
                    {single.profession && (
                      <div className="info-item">
                        <strong>💼 Peşə:</strong> {single.profession}
                      </div>
                    )}
                    {single.experience && (
                      <div className="info-item">
                        <strong>⭐ Təcrübə:</strong> {single.experience}
                      </div>
                    )}
                    {single.skills && (
                      <div className="info-item">
                        <strong>🛠️ Bacarıqlar:</strong> {single.skills}
                      </div>
                    )}
                    {single.portfolio && (
                      <div className="info-item">
                        <strong>📁 Portfolio:</strong> 
                        <a href={single.portfolio} target="_blank" rel="noopener noreferrer">
                          {single.portfolio}
                        </a>
                      </div>
                    )}
                    {single.rating && (
                      <div className="info-item">
                        <strong>⭐ Reytinq:</strong> {single.rating}/5
                      </div>
                    )}
                    {single.completedJobs && (
                      <div className="info-item">
                        <strong>✅ Tamamlanmış işlər:</strong> {single.completedJobs}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {(selectedProfile.bio || single?.description) && (
                <div className="profile-description-section">
                  <h3>📝 Təsvir</h3>
                  <div className="description-content">
                    {selectedProfile.bio || single?.description}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="additional-info-section">
                <h3>🔧 Əlavə Məlumatlar</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>🔒 Status:</strong> {selectedProfile.isActive ? 'Aktiv' : 'Qeyri-aktiv'}
                  </div>
                  <div className="info-item">
                    <strong>✅ Təsdiq statusu:</strong> {selectedProfile.isVerified ? 'Təsdiqlənmiş' : 'Təsdiqlənməmiş'}
                  </div>
                  {selectedProfile.lastLoginAt && (
                    <div className="info-item">
                      <strong>🕐 Son giriş:</strong> {formatDate(selectedProfile.lastLoginAt)}
                    </div>
                  )}
                  {selectedProfile.location && (
                    <div className="info-item">
                      <strong>📍 Məkan:</strong> {selectedProfile.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profiles;
