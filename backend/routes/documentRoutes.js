const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const { uploadDocument, getDocuments, getAllDocuments } = require("../controllers/documentController");

const uploadDir = path.resolve(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

router.get("/", getAllDocuments);
router.post("/upload", upload.single("document"), uploadDocument);
router.post("/", upload.single("document"), uploadDocument);
router.get("/:claimId", getDocuments);

module.exports = router;
