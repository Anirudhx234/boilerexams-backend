const express = require('express');
const app = express();

const id_routes = require("./id_routes");
const name_routes = require("./name_routes");
const post_routes = require("./post_routes");
const ocr_routes = require("./ocr_routes");
const put_routes = require("./put_routes");
const delete_routes = require("./delete_routes");

const resources = require("./resources");
const users = require("./users");
const webhooks = require("./webhooks")

app.use(id_routes, name_routes, post_routes, ocr_routes, put_routes, delete_routes, resources, users, webhooks);

module.exports = app