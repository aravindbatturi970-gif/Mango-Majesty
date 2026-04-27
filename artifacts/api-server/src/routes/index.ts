import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import reviewsRouter from "./reviews";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import subscriptionsRouter from "./subscriptions";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(categoriesRouter);
router.use(reviewsRouter);
router.use(cartRouter);
router.use(ordersRouter);
router.use(subscriptionsRouter);
router.use(statsRouter);

export default router;
