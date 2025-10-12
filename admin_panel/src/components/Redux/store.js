import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./Features/Login";
import usersSlice from "./Features/AllUserSlice";
import businessSlice from "./Features/Businesses";
import roleSlice from "./Features/AllRole";
import adsSlice from "./Features/AdsSlice";
import categorySlice from "./Features/CategorySlice";
import productSlice from "./Features/ProductSlice";
import profileSlice from "./Features/ProfessionalProfile";
// import serviceCatalogSlice from "./Features/ServiceCatalog";
import reportTransactionsSlice from "./Features/reportSlice";
import notificationsSlice from "./Features/notificationSlice";
import wheelServicesSlice from "./Features/WheelSlice";
import logsSlice from "./Features/LogSlice";
import refreshSlice from "./Features/RefreshSlice"

const store = configureStore({
  reducer: {
    auth: authSlice,
    businesses: businessSlice,
    users: usersSlice,
    roles: roleSlice,
    ads: adsSlice,
    categories: categorySlice,
    products: productSlice,
    profiles: profileSlice,
    // serviceCatalog: serviceCatalogSlice,
    reports: reportTransactionsSlice,
    notifications: notificationsSlice,
    wheelServices: wheelServicesSlice,
    logs: logsSlice,
    refresh:refreshSlice
  },
});

export default store;
