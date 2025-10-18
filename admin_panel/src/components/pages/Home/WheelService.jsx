// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   fetchProfessionalPages,
//   fetchWheelServices,
//   fetchAutoWashServices,
// } from "../../Redux/Features/WheelSlice";
// import Pagination from "../../Pagination/Pagination";
// import "./WheelService.css";

// const WheelService = () => {
//   const dispatch = useDispatch();
//   const { professionalPages, wheelServices, autoWashServices, loading, error } =
//     useSelector((state) => state.wheelServices);

//   const [proPage, setProPage] = useState(1);
//   const [wheelPage, setWheelPage] = useState(1);
//   const [autoPage, setAutoPage] = useState(1);

//   const [imageUrls, setImageUrls] = useState({});

//   const BASE_URL = "http://194.163.173.179:3300";
//   const token = localStorage.getItem("token");

//   // Professional Pages
//   useEffect(() => {
//     dispatch(fetchProfessionalPages({ page: proPage - 1, size: 5 }));
//   }, [dispatch, proPage]);

//   // Wheel Services
//   useEffect(() => {
//     dispatch(fetchWheelServices({ page: wheelPage - 1, size: 5 }));
//   }, [dispatch, wheelPage]);

//   // Auto Wash Services
//   useEffect(() => {
//     dispatch(fetchAutoWashServices({ page: autoPage - 1, size: 5 }));
//   }, [dispatch, autoPage]);

//   // Şəkil fetch
//   useEffect(() => {
//     const allItems = [
//       ...(professionalPages?.content || []),
//       ...(wheelServices?.content || []),
//       ...(autoWashServices?.content || []),
//     ];

//     allItems.forEach((item) => {
//       const pictureUrl = item.profilePictureUrl || item.servicePictureUrl;
//       if (pictureUrl && !imageUrls[item.id]) {
//         fetch(`${BASE_URL}/api/files/download/${pictureUrl}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         })
//           .then((res) => {
//             if (!res.ok) throw new Error("Image not found");
//             return res.blob();
//           })
//           .then((blob) => {
//             const url = URL.createObjectURL(blob);
//             setImageUrls((prev) => ({ ...prev, [item.id]: url }));
//           })
//           .catch(() => {
//             setImageUrls((prev) => ({
//               ...prev,
//               [item.id]:
//                 "https://dummyimage.com/300x200/f0f0f0/999999.jpg&text=No+Image",
//             }));
//           });
//       }
//     });
//   }, [professionalPages, wheelServices, autoWashServices, token]);

//   const renderCard = (item, colorClass) => (
//     <div key={item.id} className={`service-card ${colorClass}`}>
//       <div className="card-image-container">
//         <img
//           src={
//             imageUrls[item.id] ||
//             "https://dummyimage.com/300x200/f0f0f0/999999.jpg&text=No+Image"
//           }
//           alt={item.name || item.serviceName}
//           className="card-image"
//         />
//         <div className="card-overlay"></div>
//       </div>

//       <div className="card-content">
//         <h3 className="card-title">
//           {item.name} {item.surname || item.serviceName}
//         </h3>

//         <div className="card-details">
//           {item.serviceName && (
//             <div className="detail-item service-name">
//               <span className="detail-icon">🔧</span>
//               <span>{item.serviceName}</span>
//             </div>
//           )}

//           {item.address && (
//             <div className="detail-item address">
//               <span className="detail-icon">📍</span>
//               <span>{item.address}</span>
//             </div>
//           )}

//           {item.phone && (
//             <div className="detail-item phone">
//               <span className="detail-icon">📞</span>
//               <span>{item.phone}</span>
//             </div>
//           )}

//           {item.averageRating && (
//             <div className="detail-item rating">
//               <div className="rating-stars">
//                 {Array.from({ length: 5 }, (_, i) => (
//                   <span
//                     key={i}
//                     className={`star ${
//                       i < Math.floor(item.averageRating) ? "filled" : ""
//                     }`}
//                   >
//                     ⭐
//                   </span>
//                 ))}
//               </div>
//               <span className="rating-value">{item.averageRating}</span>
//             </div>
//           )}

//           {item.price && (
//             <div className="price-tag">
//               <span className="price-amount">{item.price}</span>
//               <span className="price-currency">₼</span>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="wheel-service-container">
//       <div className="wheel-service-header">
//         <h1 className="wheel-service-title">🚗 Service Catalog</h1>
//         <p className="wheel-service-subtitle">
//           Discover professional automotive services with our comprehensive
//           catalog
//         </p>
//       </div>

//       {loading && (
//         <div className="loading-container">
//           <div className="loading-spinner"></div>
//           <p className="loading-text">Yüklənir...</p>
//         </div>
//       )}

//       {error && (
//         <div className="error-container">
//           <div className="error-icon">⚠️</div>
//           <p className="error-text">{error}</p>
//         </div>
//       )}

//       {!loading && !error && (
//         <div className="services-sections">
//           {/* Professional Pages */}
//           <section className="service-section professional-section">
//             <div className="section-header">
//               <div className="section-title-container">
//                 <h2 className="section-title">
//                   <span className="section-icon">👨‍💼</span> Professional Pages
//                 </h2>
//                 <div className="section-divider"></div>
//               </div>
//               <div className="section-counter">
//                 {professionalPages?.content?.length || 0} nəticə
//               </div>
//             </div>

//             {professionalPages?.content?.length > 0 ? (
//               <div className="services-grid">
//                 {professionalPages.content.map((item) =>
//                   renderCard(item, "professional-card")
//                 )}
//               </div>
//             ) : (
//               <div className="empty-state">
//                 <div className="empty-icon">🔍</div>
//                 <p className="empty-text">Professional Pages tapılmadı.</p>
//               </div>
//             )}

//             <Pagination
//               currentPage={proPage}
//               lastPage={professionalPages?.page?.totalPages || 1}
//               onPageChange={setProPage}
//             />
//           </section>

//           {/* Wheel Services */}
//           <section className="service-section wheel-section">
//             <div className="section-header">
//               <div className="section-title-container">
//                 <h2 className="section-title">
//                   <span className="section-icon">🛞</span> Wheel Services
//                 </h2>
//                 <div className="section-divider"></div>
//               </div>
//               <div className="section-counter">
//                 {wheelServices?.content?.length || 0} nəticə
//               </div>
//             </div>

//             {wheelServices?.content?.length > 0 ? (
//               <div className="services-grid">
//                 {wheelServices.content.map((item) =>
//                   renderCard(item, "wheel-card")
//                 )}
//               </div>
//             ) : (
//               <div className="empty-state">
//                 <div className="empty-icon">🔍</div>
//                 <p className="empty-text">Wheel Services tapılmadı.</p>
//               </div>
//             )}

//             <Pagination
//               currentPage={wheelPage}
//               lastPage={wheelServices?.page?.totalPages || 1}
//               onPageChange={setWheelPage}
//             />
//           </section>

//           {/* Auto Wash Services */}
//           <section className="service-section autowash-section">
//             <div className="section-header">
//               <div className="section-title-container">
//                 <h2 className="section-title">
//                   <span className="section-icon">🧽</span> Auto Wash Services
//                 </h2>
//                 <div className="section-divider"></div>
//               </div>
//               <div className="section-counter">
//                 {autoWashServices?.content?.length || 0} nəticə
//               </div>
//             </div>

//             {autoWashServices?.content?.length > 0 ? (
//               <div className="services-grid">
//                 {autoWashServices.content.map((item) =>
//                   renderCard(item, "autowash-card")
//                 )}
//               </div>
//             ) : (
//               <div className="empty-state">
//                 <div className="empty-icon">🔍</div>
//                 <p className="empty-text">Auto Wash Services tapılmadı.</p>
//               </div>
//             )}

//             <Pagination
//               currentPage={autoPage}
//               lastPage={autoWashServices?.page?.totalPages || 1}
//               onPageChange={setAutoPage}
//             />
//           </section>
//         </div>
//       )}
//     </div>
//   );
// };

// export default WheelService;
