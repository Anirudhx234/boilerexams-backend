const express = require("express");
const mongoose = require("mongoose");


const dotenv = require("dotenv");
dotenv.config();

const Router = require("./routes.js")

const app = express();

var cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(Router);

mongoose.connect(process.env.CONNECTION
).then(console.log("Connection successful"))
.catch((err) => console.log(err))

app.listen(5000, () => {
  console.log("Server is running at port 5000");
});