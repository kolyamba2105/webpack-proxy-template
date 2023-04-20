import express from "express";
import morgan from "morgan";
import path from "path";

const publicPath =
  process.env.NODE_ENV === "production"
    ? path.join(__dirname, "public")
    : path.join(__dirname, "..", "..", "public");

express()
  .use(morgan("dev"))
  .use(express.Router().use("/api", (_, res) => res.status(200).send({ value: 42 })))
  .use(express.static(publicPath))
  .get("/", (_, res) => res.sendFile(path.join(publicPath, "index.html")))
  .listen(8080, () => console.log("Listening on port 8080..."));
