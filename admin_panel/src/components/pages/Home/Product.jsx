import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, fetchProductById } from "../../Redux/Features/ProductSlice";
import Pagination from "../../Pagination/Pagination";
import "./Product.css";

export const Product = () => {
  const dispatch = useDispatch();
  const { list, loading, error, single, page } = useSelector(state => state.products);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    dispatch(fetchProducts(currentPage - 1));
  }, [dispatch, currentPage]);

  const handleProductClick = (id) => {
    dispatch(fetchProductById(id));
    setSelectedProduct(id);
    setShowDetailModal(true);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedProduct(null);
  };

  // Filter products based on search term
  const filteredProducts = list.content?.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toString().includes(searchTerm)
  ) || [];

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aValue = a[sortBy] || "";
    const bValue = b[sortBy] || "";
    
    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return "↕️";
    return sortOrder === "asc" ? "↗️" : "↘️";
  };

  const formatPrice = (price) => {
    return price ? `${price.toLocaleString()} ₼` : 'Qiymət yoxdur';
  };

  const renderProductCard = (product) => (
    <div 
      key={product.id} 
      className="product-card"
      onClick={() => handleProductClick(product.id)}
    >
      <div className="product-header">
        <div className="product-info">
          <h3 className="product-name">{product.name || 'Məhsul adı yoxdur'}</h3>
          <div className="product-id">🆔 ID: {product.id}</div>
        </div>
        <div className="product-price">
          {formatPrice(product.price)}
        </div>
      </div>
      
      <div className="product-details">
        {product.description && (
          <div className="product-description">
            📝 {product.description.length > 100 
              ? `${product.description.substring(0, 100)}...` 
              : product.description}
          </div>
        )}
        {product.category && (
          <div className="product-category">
            🏷️ Kateqoriya: {product.category}
          </div>
        )}
        {product.stock !== undefined && (
          <div className="product-stock">
            📦 Stok: {product.stock}
          </div>
        )}
      </div>
      
      <div className="product-actions-preview">
        <button 
          className="btn-preview" 
          onClick={(e) => { 
            e.stopPropagation(); 
            handleProductClick(product.id); 
          }}
        >
          👁️ Ətraflı Bax
        </button>
      </div>
    </div>
  );

  const renderProductList = (product) => (
    <div 
      key={product.id} 
      className="product-list-item"
      onClick={() => handleProductClick(product.id)}
    >
      <div className="product-list-info">
        <div className="product-list-main">
          <h4 className="product-list-name">{product.name || 'Məhsul adı yoxdur'}</h4>
          <span className="product-list-id">ID: {product.id}</span>
        </div>
        <div className="product-list-price">
          {formatPrice(product.price)}
        </div>
      </div>
      <div className="product-list-details">
        {product.description && (
          <span className="product-list-description">
            {product.description.length > 150 
              ? `${product.description.substring(0, 150)}...` 
              : product.description}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="products-container">
      {/* Header */}
      {/* <div className="products-header">
        <h1 className="products-title">
          🛍️ Məhsul İdarəetməsi
        </h1>
        <p className="products-subtitle">
          Bütün məhsulları idarə edin, məlumatlarını görün və inventar sistemini idarə edin
        </p>
      </div> */}

      {/* Controls */}
      <div className="products-controls">
        <div className="search-sort-section">
          <div className="search-input-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Məhsul adı və ya ID ilə axtar..."
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

          <div className="sort-controls">
            <button 
              className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`}
              onClick={() => handleSort('name')}
            >
              📛 Ad {getSortIcon('name')}
            </button>
            <button 
              className={`sort-btn ${sortBy === 'price' ? 'active' : ''}`}
              onClick={() => handleSort('price')}
            >
              💰 Qiymət {getSortIcon('price')}
            </button>
            <button 
              className={`sort-btn ${sortBy === 'id' ? 'active' : ''}`}
              onClick={() => handleSort('id')}
            >
              🆔 ID {getSortIcon('id')}
            </button>
          </div>
        </div>

        <div className="view-stats-section">
          <div className="view-controls">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid görünüşü"
            >
              ⊞ Grid
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List görünüşü"
            >
              ☰ List
            </button>
          </div>

          <div className="stats-section">
            <div className="stat-card">
              <div className="stat-number">{list.content?.length || 0}</div>
              <div className="stat-label">Bu Səhifədə</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{sortedProducts.length}</div>
              <div className="stat-label">Filtrlənmiş</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{page?.totalElements || 0}</div>
              <div className="stat-label">Ümumi</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Info */}
      {searchTerm && (
        <div className="search-info">
          🎯 "{searchTerm}" üçün {sortedProducts.length} nəticə tapıldı
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Məhsullar yüklənir...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          ⚠️ Xəta: {error}
        </div>
      )}

      {/* Products List */}
      {!loading && !error && (
        <>
          {sortedProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛍️</div>
              <h3>Məhsul tapılmadı</h3>
              <p>
                {searchTerm 
                  ? `"${searchTerm}" axtarışına uyğun məhsul mövcud deyil`
                  : 'Hələ heç bir məhsul yoxdur'
                }
              </p>
            </div>
          ) : (
            <div className={`products-content ${viewMode}`}>
              {viewMode === 'grid' ? (
                <div className="products-grid">
                  {sortedProducts.map(renderProductCard)}
                </div>
              ) : (
                <div className="products-list">
                  {sortedProducts.map(renderProductList)}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {page && page.totalPages > 1 && (
        <div className="pagination-wrapper">
          <Pagination
            currentPage={currentPage}
            lastPage={page.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Product Detail Modal */}
      {showDetailModal && single && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="product-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <h2>🛍️ {single.name || 'Məhsul Detalları'}</h2>
                <button className="close-btn" onClick={handleCloseModal}>❌</button>
              </div>
              <div className="product-id-badge">
                🆔 ID: {single.id}
              </div>
            </div>

            <div className="modal-content">
              {/* Product Info */}
              <div className="product-info-section">
                <h3>📋 Əsas Məlumatlar</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>📛 Ad:</strong> {single.name || 'N/A'}
                  </div>
                  <div className="info-item">
                    <strong>💰 Qiymət:</strong> {formatPrice(single.price)}
                  </div>
                  {single.category && (
                    <div className="info-item">
                      <strong>🏷️ Kateqoriya:</strong> {single.category}
                    </div>
                  )}
                  {single.stock !== undefined && (
                    <div className="info-item">
                      <strong>📦 Stok:</strong> {single.stock}
                    </div>
                  )}
                  {single.brand && (
                    <div className="info-item">
                      <strong>🏢 Marka:</strong> {single.brand}
                    </div>
                  )}
                  {single.sku && (
                    <div className="info-item">
                      <strong>🔖 SKU:</strong> {single.sku}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Description */}
              {single.description && (
                <div className="product-description-section">
                  <h3>📝 Təsvir</h3>
                  <div className="description-content">
                    {single.description}
                  </div>
                </div>
              )}

              {/* Product Images */}
              {single.images && single.images.length > 0 && (
                <div className="product-images-section">
                  <h3>🖼️ Şəkillər ({single.images.length})</h3>
                  <div className="images-grid">
                    {single.images.map((image, index) => (
                      <div key={index} className="image-card">
                        <img src={image.url} alt={`${single.name} ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Specifications */}
              {single.specifications && Object.keys(single.specifications).length > 0 && (
                <div className="product-specs-section">
                  <h3>⚙️ Spesifikasiyalar</h3>
                  <div className="specs-grid">
                    {Object.entries(single.specifications).map(([key, value]) => (
                      <div key={key} className="spec-item">
                        <strong>{key}:</strong> {value}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="additional-info">
                {single.createdDate && (
                  <div className="info-item">
                    <strong>📅 Yaradılma tarixi:</strong> {new Date(single.createdDate).toLocaleDateString('az-AZ')}
                  </div>
                )}
                {single.updatedDate && (
                  <div className="info-item">
                    <strong>🔄 Yenilənmə tarixi:</strong> {new Date(single.updatedDate).toLocaleDateString('az-AZ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
