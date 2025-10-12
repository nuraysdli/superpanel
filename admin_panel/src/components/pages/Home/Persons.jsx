import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../Redux/Features/AllUserSlice";
import "./Persons.css";

const Persons = () => {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.users);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Filter and search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(list);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = list.filter(
        (user) =>
          user.name?.toLowerCase().includes(term) ||
          user.surname?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term) ||
          user.phone?.toLowerCase().includes(term) ||
          user.id.toString().includes(term)
      );
      setFilteredUsers(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, list]);

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortBy] ?? "";
    const bValue = b[sortBy] ?? "";
    if (sortOrder === "asc") return aValue > bValue ? 1 : -1;
    return aValue < bValue ? 1 : -1;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return "↕️";
    return sortOrder === "asc" ? "↗️" : "↘️";
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="persons-container">
      {/* Controls */}
      <div className="persons-controls">
        <div className="search-section">
          <div className="search-input-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Ad, soyad, email, telefon və ya ID ilə axtar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="clear-search-btn">
                ❌
              </button>
            )}
          </div>
          {searchTerm && <div className="search-info">🎯 {filteredUsers.length} nəticə tapıldı</div>}
        </div>

        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-number">{list.length}</div>
            <div className="stat-label">Ümumi İstifadəçi</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{filteredUsers.length}</div>
            <div className="stat-label">Göstərilən</div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>İstifadəçilər yüklənir...</p>
        </div>
      )}

      {/* Error */}
      {error && <div className="error-state">⚠️ Xəta: {error}</div>}

      {/* Users Table */}
      {!loading && !error && (
        <>
          {currentUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>İstifadəçi tapılmadı</h3>
              <p>
                {searchTerm
                  ? `"${searchTerm}" axtarışına uyğun istifadəçi mövcud deyil`
                  : "Hələ heç bir istifadəçi yoxdur"}
              </p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort("id")} className="sortable">
                        🆔 ID {getSortIcon("id")}
                      </th>
                      <th onClick={() => handleSort("name")} className="sortable">
                        👤 Ad {getSortIcon("name")}
                      </th>
                      <th onClick={() => handleSort("surname")} className="sortable">
                        👤 Soyad {getSortIcon("surname")}
                      </th>
                      <th onClick={() => handleSort("email")} className="sortable">
                        📧 Email {getSortIcon("email")}
                      </th>
                      <th onClick={() => handleSort("phone")} className="sortable">
                        📞 Telefon {getSortIcon("phone")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className={`user-row ${index % 2 === 0 ? "even" : "odd"}`}
                      >
                        <td className="user-id">{user.id}</td>
                        <td className="user-name">{user.name || "-"}</td>
                        <td className="user-surname">{user.surname || "-"}</td>
                        <td className="user-email">{user.email || "-"}</td>
                        <td className="user-phone">{user.phone || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages >= 1 && (
                <div className="pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    ⬅️ Əvvəlki
                  </button>
                  <div className="pagination-numbers">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => paginate(i + 1)}
                        className={`pagination-number ${currentPage === i + 1 ? "active" : ""}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Növbəti ➡️
                  </button>
                </div>
              )}

              {/* Table Info */}
              <div className="table-info">
                <span>
                  {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, sortedUsers.length)} /{" "}
                  {sortedUsers.length} istifadəçi göstərilir
                </span>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Persons;
