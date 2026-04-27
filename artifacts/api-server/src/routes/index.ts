import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import reviewsRouter from "./reviews";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import subscriptionsRouter from "./subscriptions";
import statsRouter from "./stats";
import adminAuthRouter from "./admin-auth";
import adminProductsRouter from "./admin-products";
import adminOrdersRouter from "./admin-orders";
import adminCustomersRouter from "./admin-customers";
import adminCouponsRouter from "./admin-coupons";
import adminAnalyticsRouter from "./admin-analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(categoriesRouter);
router.use(reviewsRouter);
router.use(cartRouter);
router.use(ordersRouter);
router.use(subscriptionsRouter);
router.use(statsRouter);
router.use(adminAuthRouter);
router.use(adminProductsRouter);
router.use(adminOrdersRouter);
router.use(adminCustomersRouter);
router.use(adminCouponsRouter);
router.use(adminAnalyticsRouter);

export default router;
