// create the express server here
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { PORT = 3000 } = process.env;
const server = express();
const client = require("./db/client");
const apiRouter = require("./api");
const morgan = require("morgan");
client.connect();

server.use(express.json());

server.use(morgan("dev"));

server.use(cors());

server.use("/api", apiRouter);

server.get("/products/:id", (req, res, next) => {
    res.json({ msg: "This is CORS-enabled for all origins!" })
});

server.listen(PORT, () => {
    console.log(`CORS-enabled web server listening on port ${PORT}`);
});