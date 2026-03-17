const multer = require("multer");
const path = require("path");
const fs = require("fs");

const createStorage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, `../uploads/${folder}`);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });

const fileFilter = (allowedTypes) => (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) cb(null, true);
  else cb(new Error(`Only ${allowedTypes.join(", ")} files allowed`), false);
};

exports.uploadThumbnail = multer({
  storage: createStorage("thumbnails"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter([".jpg", ".jpeg", ".png", ".webp"]),
});

exports.uploadVideo = multer({
  storage: createStorage("videos"),
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: fileFilter([".mp4", ".webm", ".mov"]),
});

exports.uploadPDF = multer({
  storage: createStorage("pdfs"),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: fileFilter([".pdf"]),
});

exports.uploadAssignment = multer({
  storage: createStorage("assignments"),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: fileFilter([".pdf", ".doc", ".docx", ".zip", ".jpg", ".png"]),
});
