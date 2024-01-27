require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const router = require("./routes/routes");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH", "OPTIONS"],
    credentials: true,
    origin: process.env.ORIGIN,
  })
);

app.use("/api", router);

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);