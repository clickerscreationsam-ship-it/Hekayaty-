import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import contentRouter from "./content";
import userRouter from "./user";
import commerceRouter from "./commerce";
import searchRouter from "./search";
import editorialRouter from "./editorial";
import adminRouter from "./admin";
import uploadRouter from "./upload";
import eventsRouter, { adminEventsRouter } from "./events";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/events", eventsRouter);
router.use("/admin/events", adminEventsRouter);
router.use("/", contentRouter);
router.use("/user", userRouter);
router.use("/", commerceRouter);
router.use("/", searchRouter);
router.use("/", editorialRouter);
router.use("/admin", adminRouter);
router.use("/", uploadRouter);

export default router;
