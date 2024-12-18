import express from "express";

import { upload } from "../middleware/middleware.multer.js"
import { loginUser, logoutUser, refreshToken, registerUser } from "../controllers/user.controllers.js";

const router = express.Router();

//* Register User
router.post("/registerUser", upload.single("image"), registerUser);
router.post("/loginUser", loginUser);
router.post("/logoutUser", logoutUser);
router.post("/refreshToken", refreshToken);


export default router;