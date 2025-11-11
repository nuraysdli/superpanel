import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchRoles,
  addRole,
  updateRole,
  deleteRole,
} from "../../Redux/Features/AllRole";
import "./Role.css";

const permissions = [
  { key: "superAdmin", label: "Super Admin", icon: "👑" },
  { key: "admin", label: "Admin", icon: "🛡️" },
  { key: "person", label: "Person", icon: "👤" },
  { key: "professional", label: "Professional", icon: "💼" },
  { key: "business", label: "Business", icon: "🏢" },
  { key: "businessAdmin", label: "Business Admin", icon: "🏪" },
  { key: "driverAdmin", label: "Driver Admin", icon: "🚗" },
];

const Role = () => {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.roles);

  const [editRole, setEditRole] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    superAdmin: 0,
    admin: 0,
    person: 0,
    professional: 0,
    business: 0,
    businessAdmin: 0,
    driverAdmin: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRoles, setFilteredRoles] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRoles(list);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredRoles(
        list.filter(
          (r) =>
            r.name.toLowerCase().includes(term) ||
            r.description.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, list]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRoles = filteredRoles.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first and last
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  const handleToggleEdit = (perm) => {
    setEditRole({ ...editRole, [perm]: editRole[perm] ? 0 : 1 });
  };

  const handleToggleNew = (perm) => {
    setNewRole({ ...newRole, [perm]: newRole[perm] ? 0 : 1 });
  };

  const handleUpdate = () => {
    if (!editRole.name.trim()) {
      alert("Rol adı boş ola bilməz");
      return;
    }
    dispatch(updateRole(editRole)).then(() => setEditRole(null));
  };

  const handleAdd = () => {
    if (!newRole.name.trim()) {
      alert("Rol adı boş ola bilməz");
      return;
    }
    dispatch(addRole(newRole)).then(() => {
      setNewRole({
        name: "",
        description: "",
        superAdmin: 0,
        admin: 0,
        person: 0,
        professional: 0,
        business: 0,
        businessAdmin: 0,
        driverAdmin: 0,
      });
      setShowAddForm(false);
    });
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`"${name}" rolunu silməkdə əminsiniz?`)) {
      dispatch(deleteRole(id));
    }
  };

  const resetNewRole = () => {
    setNewRole({
      name: "",
      description: "",
      superAdmin: 0,
      admin: 0,
      person: 0,
      professional: 0,
      business: 0,
      businessAdmin: 0,
      driverAdmin: 0,
    });
    setShowAddForm(false);
  };

  return (
    <div className="role-container">
      {/* Controls */}
      <div className="role-controls">
        <div className="search-section">
          <div className="search-input-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Rol adı və ya təsvir üzrə axtar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="clear-search-btn"
              >
                ❌
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="search-info">
              🎯 {filteredRoles.length} nəticə tapıldı
            </div>
          )}
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary add-role-btn"
        >
          {showAddForm ? "❌ Bağla" : "✨ Yeni Rol"}
        </button>
      </div>

      {/* Add New Role Form */}
      {showAddForm && (
        <div className="add-role-form">
          <div className="form-header">
            <h3>🆕 Yeni Rol Əlavə Et</h3>
          </div>
          <div className="form-content">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">📛 Rol Adı</label>
                <input
                  type="text"
                  placeholder="Məsələn: Moderator, Manager..."
                  value={newRole.name}
                  onChange={(e) =>
                    setNewRole({ ...newRole, name: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label className="form-label">📝 Təsvir</label>
                <input
                  type="text"
                  placeholder="Bu rolun təsvirini yazın..."
                  value={newRole.description}
                  onChange={(e) =>
                    setNewRole({ ...newRole, description: e.target.value })
                  }
                  className="input-field"
                />
              </div>
            </div>

            <div className="permissions-section">
              <label className="form-label">🔐 İcazələr</label>
              <div className="permissions-grid">
                {permissions.map((perm) => (
                  <div
                    key={perm.key}
                    className={`permission-card ${
                      newRole[perm.key] ? "active" : ""
                    }`}
                    onClick={() => handleToggleNew(perm.key)}
                  >
                    <div className="permission-icon">{perm.icon}</div>
                    <div className="permission-label">{perm.label}</div>
                    <div className="permission-status">
                      {newRole[perm.key] ? "✅" : "❌"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button onClick={handleAdd} className="btn btn-success">
                ✨ Rol Əlavə Et
              </button>
              <button onClick={resetNewRole} className="btn btn-secondary">
                ❌ Ləğv Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Rollar yüklənir...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="error-state">
          ⚠️ Xəta: {typeof error === "string" ? error : JSON.stringify(error)}
        </div>
      )}

      {/* Roles List */}
      {!loading && !error && (
        <>
          {filteredRoles.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛡️</div>
              <h3>Heç bir rol tapılmadı</h3>
              <p>
                {searchTerm
                  ? `"${searchTerm}" axtarışına uyğun rol mövcud deyil`
                  : "Hələ heç bir rol yoxdur. Yuxarıdakı formu istifadə edərək ilk rolunuzu əlavə edin"}
              </p>
            </div>
          ) : (
            <>
              <div className="roles-grid">
                {currentRoles.map((role) => (
                  <div key={role.id} className="role-card">
                    {editRole?.id === role.id ? (
                      <div className="role-edit-form">
                        {/* Rolların düzəliş hissəsi */}
                        <div className="edit-header">
                          <h3>✏️ Rol Düzəliş Et</h3>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">📛 Rol Adı</label>
                            <input
                              type="text"
                              value={editRole.name}
                              onChange={(e) =>
                                setEditRole({
                                  ...editRole,
                                  name: e.target.value,
                                })
                              }
                              className="input-field"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">📝 Təsvir</label>
                            <input
                              type="text"
                              value={editRole.description}
                              onChange={(e) =>
                                setEditRole({
                                  ...editRole,
                                  description: e.target.value,
                                })
                              }
                              className="input-field"
                            />
                          </div>
                        </div>

                        <div className="permissions-section">
                          <label className="form-label">🔐 İcazələr</label>
                          <div className="permissions-grid">
                            {permissions.map((perm) => (
                              <div
                                key={perm.key}
                                className={`permission-card ${
                                  editRole[perm.key] ? "active" : ""
                                }`}
                                onClick={() => handleToggleEdit(perm.key)}
                              >
                                <div className="permission-icon">
                                  {perm.icon}
                                </div>
                                <div className="permission-label">
                                  {perm.label}
                                </div>
                                <div className="permission-status">
                                  {editRole[perm.key] ? "✅" : "❌"}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="edit-actions">
                          <button
                            onClick={handleUpdate}
                            className="btn btn-success"
                          >
                            ✅ Yadda Saxla
                          </button>
                          <button
                            onClick={() => setEditRole(null)}
                            className="btn btn-secondary"
                          >
                            ❌ Ləğv Et
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="role-view">
                        <div className="role-info">
                          <div className="role-main-info">
                            <h3 className="role-name">🏷️ {role.name}</h3>
                            <p className="role-description">
                              {role.description || "Təsvir əlavə edilməyib"}
                            </p>
                            <div className="role-id">🆔 ID: {role.id}</div>
                          </div>
                        </div>

                        <div className="role-permissions">
                          <h4 className="permissions-title">🔐 İcazələr</h4>
                          <div className="permissions-list">
                            {permissions.map((perm) => (
                              <div
                                key={perm.key}
                                className={`permission-item ${
                                  role[perm.key] ? "granted" : "denied"
                                }`}
                              >
                                <span className="permission-icon">
                                  {perm.icon}
                                </span>
                                <span className="permission-name">
                                  {perm.label}
                                </span>
                                <span className="permission-status">
                                  {role[perm.key] ? "✅" : "❌"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="role-actions">
                          <button
                            onClick={() => setEditRole(role)}
                            className="btn btn-primary"
                          >
                            ✏️ Düzəliş Et
                          </button>
                          <button
                            onClick={() => handleDelete(role.id, role.name)}
                            className="btn btn-danger"
                          >
                            🗑️ Sil
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="pagination">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className="page-btn"
                  disabled={currentPage === 1}
                >
                  ◀
                </button>

                {getPageNumbers().map((p, idx) =>
                  p === "..." ? (
                    <span key={idx} className="page-ellipsis">
                      ...
                    </span>
                  ) : (
                    <button
                      key={idx}
                      className={`page-btn ${
                        currentPage === p ? "active" : ""
                      }`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className="page-btn"
                  disabled={currentPage === totalPages}
                >
                  ▶
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Role;
