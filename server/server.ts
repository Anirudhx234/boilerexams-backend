const express2 = require("express");

const router = express2();
var cors = require('cors');

const Router = require("./routes.ts");
router.use(cors());
router.use(express2.json());
router.use(Router);

router.get("/", (req, res) => {
  res.send("Working");
});

const PORT = process.env.PORT || 8080;
router.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});

module.exports = router;