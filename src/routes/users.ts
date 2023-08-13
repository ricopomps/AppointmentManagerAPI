import express from "express";
import * as UserController from "../controller/userController";
import { verifyJWT } from "../middleware/verifyJWT";
const router = express.Router();

router.get("/", verifyJWT, UserController.getAuthenticatedUser);
router.get("/all", verifyJWT, UserController.getAllUsers);
router.patch("/:userId", verifyJWT, UserController.updateUser);
router.post("/signup", UserController.signUp);
router.post("/login", UserController.login);
router.post("/logout", verifyJWT, UserController.logout);
router.get("/dentists", UserController.getDentists);

export default router;
