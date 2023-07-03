const express = require("express");

const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

const id_routes = require("./routes/id_routes");
const name_routes = require("./routes/name_routes");
const post_routes = require("./routes/post_routes");
const ocr_routes = require("./routes/ocr_routes");
const put_routes = require("./routes/put_routes");
const delete_routes = require("./routes/delete_routes")
const s3 = require("./routes/s3.ts")
app.use(id_routes, name_routes, post_routes, ocr_routes, put_routes, delete_routes, s3);

app.get("/", (req, res) => {
  res.send("Working")
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});

module.exports = app;
export {}