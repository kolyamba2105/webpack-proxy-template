import express from "express";
import morgan from "morgan";
import path from "path";

function api(app: express.Express) {
  return app
    .use(morgan("dev"))
    .use(express.Router().use("/api", (_, res) => res.status(200).send({ value: 42 })));
}

function client(app: express.Express) {
  const publicPath = process.env.NODE_ENV === "production" && path.join(__dirname, "public");

  if (publicPath) {
    return app
      .use(express.static(publicPath))
      .get("/", (_, res) => res.sendFile(path.join(publicPath, "index.html")));
  }

  return app.get("/", (_, res) => res.redirect("http://localhost:3000"));
}

client(api(express())).listen(8080, () => console.log("Listening on port 8080..."));
