import { Router } from "express";

import authRoutes from "./auth.routes.js";
import complaintRoutes from "./complaint.routes.js";
import couponRoutes from "./coupon.routes.js";
import homepageRoutes from "./homepage.routes.js";
import inventoryRoutes from "./inventory.routes.js";
import orderRoutes from "./order.routes.js";
import paymentRoutes from "./payment.routes.js";
import productRoutes from "./product.routes.js";
import purchaseOrderRoutes from "./purchase-order.routes.js";
import themeRoutes from "./theme.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/complaints", complaintRoutes);
router.use("/coupons", couponRoutes);
router.use("/homepage", homepageRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/products", productRoutes);
router.use("/purchase-orders", purchaseOrderRoutes);
router.use("/themes", themeRoutes);
router.use("/users", userRoutes);

export default router;
