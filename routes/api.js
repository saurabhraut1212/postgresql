import { Router } from "express";
import Authcontroller from "../controllers/Authcontroller.js";
import authMiddleware from "../middleware/Authenticate.js";
import Profilecontroller from "../controllers/Profilecontroller.js";
import Newcontroller from "../controllers/Newscontroller.js";

const router = Router();

router.post('/auth/register', Authcontroller.register);
router.post('/auth/login', Authcontroller.login);
router.get('/sendemail', Authcontroller.sendEmailMessage);

//profile routes
router.get("/profile", authMiddleware, Profilecontroller.index);
router.put("/profile/:id", authMiddleware, Profilecontroller.update);

//news routes
router.get("/news", Newcontroller.index);
router.post("/news", authMiddleware, Newcontroller.store);
router.get("/news/:id", Newcontroller.show);
router.put("/news/:id", Newcontroller.update);
router.delete("/news/:id", Newcontroller.destroy);

export default router;