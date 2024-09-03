const multer = require('multer');
const path = require('path');

// Configuration de multer pour stocker les fichiers dans le dossier uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads')); // Dossier de destination des fichiers
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname); // Renomme le fichier pour éviter les conflits
    }
});

const upload = multer({ storage: storage });

module.exports = upload;