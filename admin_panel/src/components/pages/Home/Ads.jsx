import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAds,
  addAd,
  uploadAdImage,
  deleteAd,
  downloadFile,
  updateAd,
} from "../../Redux/Features/AdsSlice";
import "./Ads.css";

const AdsList = () => {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.ads);
  console.log(list);

  const { token, user } = useSelector((state) => state.auth);

  const [newAd, setNewAd] = useState({ link: "", userId: user?.id || 1 });
  const [files, setFiles] = useState({});
  const [locales, setLocales] = useState({});
  const [editedAds, setEditedAds] = useState({});

  const BASE_URL = "http://194.163.173.179:3300";

  // Ads yüklə
  useEffect(() => {
    if (token) dispatch(fetchAds());
  }, [token]);

  // Yeni reklam əlavə et
  const handleAddAd = () => {
    if (!newAd.link.trim()) return alert("Link daxil edin!");
    dispatch(addAd({ ...newAd, userId: user?.id, isActive: 1 }));
    setNewAd({ link: "", userId: user?.id || 1 });
  };

  // Şəkil yüklə
  const handleUploadImage = (id) => {
    if (!files[id]) return alert("Fayl seçin!");
    const locale = locales[id] || "AZ";

    dispatch(uploadAdImage({ id, file: files[id], locale }))
      .unwrap()
      .then((res) => {
        alert("Şəkil uğurla yükləndi!");
      })
      .catch(console.error);
  };

  // Faylı endir
  const handleDownload = (filename) => {
    dispatch(downloadFile(filename));
  };

  // Dəyişiklikləri state-də saxla
  const handleEditField = (id, field, value) => {
    setEditedAds((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  // Redaktə et
  const handleUpdateAd = (ad) => {
    const updatedFields = editedAds[ad.id];
    if (!updatedFields) return alert("Heç bir dəyişiklik yoxdur!");
    dispatch(updateAd({ id: ad.id, updatedFields }))
      .unwrap()
      .then(() => {
        setEditedAds((prev) => {
          const copy = { ...prev };
          delete copy[ad.id];
          return copy;
        });
      });
  };

  return (
    <div className="ads-container">
      <div className="add-ad-form">
        <div className="form-group">
          <div className="form-input">
            <input
              type="url"
              placeholder="https://example.com"
              value={newAd.link}
              onChange={(e) => setNewAd({ ...newAd, link: e.target.value })}
              className="input-field"
            />
          </div>
          <button
            onClick={handleAddAd}
            className="btn btn-primary"
            disabled={loading}
          >
            ✨ Reklam Əlavə Et
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Reklamlar yüklənir...</p>
        </div>
      )}

      {error && <div className="error-state">⚠️ Xəta: {error}</div>}

      {!loading && !error && (
        <>
          {list.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <h3>Hələ heç bir reklam yoxdur</h3>
              <p>
                Yuxarıdakı formu istifadə edərək ilk reklamınızı əlavə edin.
              </p>
            </div>
          ) : (
            <ul className="ads-list">
              {list.map((ad) => (
                <li key={ad.id} className="ad-card">
                  <div className="ad-header-info">
                    <div className="ad-link">
                      <h3>🌐 Reklam Linki</h3>
                      <input
                        type="url"
                        value={editedAds[ad.id]?.link ?? ad.link}
                        onChange={(e) =>
                          handleEditField(ad.id, "link", e.target.value)
                        }
                        className="input-field"
                      />
                    </div>
                    <div className="ad-status">
                      <select
                        value={editedAds[ad.id]?.isActive ?? ad.isActive}
                        onChange={(e) =>
                          handleEditField(
                            ad.id,
                            "isActive",
                            Number(e.target.value)
                          )
                        }
                        className="locale-select"
                      >
                        <option value={1}>🟢 Aktiv</option>
                        <option value={0}>🔴 Deaktiv</option>
                      </select>
                    </div>
                  </div>

                  <div className="ad-image-section">
                    <div className="ad-image-preview">
                      {ad.pictureUrl ? (
                        <>
                          <img
                            src={
                              ad.pictureUrl.startsWith("http")
                                ? ad.pictureUrl
                                : `${BASE_URL}/api/files/download/${ad.pictureUrl}`
                            }
                            alt="Reklam şəkli"
                            className="ad-image"
                          />
                          <button
                            onClick={() => handleDownload(ad.pictureUrl)}
                            className="btn btn-success"
                          >
                            📥 Şəkli Endir
                          </button>
                        </>
                      ) : (
                        <div className="image-upload-area">
                          <div className="no-image">🖼️</div>
                          <p className="image-upload-text">Şəkil yüklənməyib</p>
                        </div>
                      )}
                    </div>

                    <div className="upload-controls">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setFiles((prev) => ({
                            ...prev,
                            [ad.id]: e.target.files[0],
                          }))
                        }
                        className="file-input"
                      />
                      <select
                        value={locales[ad.id] || "AZ"}
                        onChange={(e) =>
                          setLocales((prev) => ({
                            ...prev,
                            [ad.id]: e.target.value,
                          }))
                        }
                        className="locale-select"
                      >
                        <option value="AZ">🇦🇿 AZ</option>
                        <option value="EN">🇺🇸 EN</option>
                        <option value="RU">🇷🇺 RU</option>
                      </select>
                      <button
                        onClick={() => handleUploadImage(ad.id)}
                        className="btn btn-primary"
                        disabled={!files[ad.id]}
                      >
                        📤 Şəkil Yüklə
                      </button>
                    </div>
                  </div>

                  <div className="ad-actions">
                    <button
                      onClick={() => handleUpdateAd(ad)}
                      className="btn btn-warning"
                    >
                      ✏️ Redaktə Et
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Bu reklamı silməkdə əminsiniz?")) {
                          dispatch(deleteAd(ad.id));
                        }
                      }}
                      className="btn btn-danger"
                    >
                      🗑️ Sil
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default AdsList;
