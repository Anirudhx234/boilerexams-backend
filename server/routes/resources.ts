const express = require('express');
const app = express();
const multer = require('multer')
const {
    getResource,
    createImageResource,
    createCodeResource,
    updateCodeResource,
    deleteResource
} = require("../controllers/resourceController")
const asyncWrapper = require("../middleware/wrappers/asyncWrapper")

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(new multer.MulterError('File type must be JPEG or PNG'))
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 500 * 1024
    }
});

app.get("/resources/:resourceId", asyncWrapper(getResource))

app.post("/resources/images", upload.single('image'), asyncWrapper(createImageResource))

app.post("/resources/codes", asyncWrapper(createCodeResource))

app.put("/resources/:resourceId/code", asyncWrapper(updateCodeResource))

app.delete("/resources/:resourceId", asyncWrapper(deleteResource))

module.exports = app
export { }