import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const express = require("express");

const Router = require("./routes.ts")

const app = express();

var cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(Router);

app.listen(5000, () => {
  console.log("Server is running at port 5000");
});