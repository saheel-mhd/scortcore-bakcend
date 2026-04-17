import { Router } from "express";

import addressRoutes from "./address.routes.js";
import adminDashboardRoutes from "./admin-dashboard.routes.js";
import authRoutes from "./auth.routes.js";
import complaintRoutes from "./complaint.routes.js";
import couponRoutes from "./coupon.routes.js";
import homepageRoutes from "./homepage.routes.js";
import homepageSectionRoutes from "./homepage-section.routes.js";
import inventoryRoutes from "./inventory.routes.js";
import orderRoutes from "./order.routes.js";
import paymentRoutes from "./payment.routes.js";
import productRoutes from "./product.routes.js";
import shopSectionRoutes from "./shop-section.routes.js";
import purchaseOrderRoutes from "./purchase-order.routes.js";
import themeRoutes from "./theme.routes.js";
import unitCategoryRoutes from "./unit-category.routes.js";
import unitRoutes from "./unit.routes.js";
import userRoutes from "./user.routes.js";
import wishlistRoutes from "./wishlist.routes.js";

const router = Router();

router.use("/addresses", addressRoutes);
router.use("/admin/dashboard", adminDashboardRoutes);
router.use("/auth", authRoutes);
router.use("/complaints", complaintRoutes);
router.use("/coupons", couponRoutes);
router.use("/homepage", homepageRoutes);
router.use("/homepage-sections", homepageSectionRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/products", productRoutes);
router.use("/shop-sections", shopSectionRoutes);
router.use("/purchase-orders", purchaseOrderRoutes);
router.use("/themes", themeRoutes);
router.use("/unit-categories", unitCategoryRoutes);
router.use("/units", unitRoutes);
router.use("/users", userRoutes);
router.use("/wishlist", wishlistRoutes);

export default router;
