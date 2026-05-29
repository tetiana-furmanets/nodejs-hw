import { Router } from "express";
import { celebrate } from "celebrate";
import { authenticate } from '../middleware/authenticate.js';
import { updateUserAvatar } from '../controllers/userController.js';
import { avatarUpload } from '../middleware/multer.js';


const router = Router();

router.patch("/users/me/avatar", authenticate, avatarUpload.single("user-avatar"), updateUserAvatar);


export default router;
