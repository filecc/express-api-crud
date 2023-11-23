const express = require("express")
const router = express.Router()
const apiController = require("../controllers/api")
const multer = require("multer")
const authMiddleware = require("../middleware/auth");
const errors = require("../middleware/errors");

const doubleMiddleware = [authMiddleware, multer({dest: "public/images"}).single("image")]


router.get("/posts", apiController.index)
router.post("/post", doubleMiddleware, apiController.store)
router.post("/delete", doubleMiddleware, apiController.destroy)
router.get("/post/:slug", apiController.show)
router.post("/edit", doubleMiddleware, apiController.edit)





module.exports = router