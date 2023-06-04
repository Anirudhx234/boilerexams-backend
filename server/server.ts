const express_server = require("express");

const router = express_server();
var cors = require('cors');

const Router = require("./routes.ts");
router.use(cors());
router.use(express_server.json());
router.use(Router);

const PORT = process.env.PORT || 8080;
router.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});

module.exports = router;