import express from "express";
import { userController } from "#controllers";


const router = express.Router();

router.post("/signup",userController.signUpController);
router.post("/signin",userController.signInController);
router.get("/logout",userController.logoutController)

export default router;