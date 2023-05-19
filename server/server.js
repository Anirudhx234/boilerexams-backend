const express = require("express");
const {Client} = require("pg");

const dotenv = require("dotenv");
dotenv.config();

const Router = require("./routes.js")

const app = express();

var cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(Router);

app.listen(5000, () => {
  console.log("Server is running at port 5000");
});

const config = {
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.NAME,
  port: 5432,
  host: '127.0.0.1',
};
const client = new Client(config);

client.connect((err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Connected to the database!');
});