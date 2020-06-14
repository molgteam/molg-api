const path = require("path");
const express = require("express");
const config = require("../webpack.config");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const compiler = webpack(config);
const app = express();

const { createLog } = require("../src/services/DBService");

app.set("trust proxy", 1);

// routes
const home = require("./routes/home");
const user = require("./routes/user");
const feed = require("./routes/feed");
const story = require("./routes/story");
const apiRoutes = require("./routes/api");

require("dotenv").config();

// 뷰엔진 셋업
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.disable("x-powered-by");
app.use(
  express.static(
    path.join(
      __dirname,
      process.env.NODE_ENV !== "production" ? "public" : "../dist"
    )
  )
); // 정적 파일 경로

// hot-module 셋업
// 정적소스 hmw랑 연결함. 정적 소스 저장할 때 마다 새로고침됨.
if (process.env.NODE_ENV !== "production") {
  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: config.output.publicPath,
      noInfo: true,
    })
  );
  app.use(webpackHotMiddleware(compiler));
}

// 페이지 라우팅
app.use("/", home);
app.use("/user", user);
app.use("/feed", feed);
app.use("/story", story);

// api 라우팅
app.use("/api/v1/feed", apiRoutes.feed);
app.use("/api/v1/story", apiRoutes.refreshStory);

// 없는 경로 진입시
app.use((req, res) => {
  res.send("Not Found");
});

// error handler
app.use(async function (err, req, res, next) {
  // set locals, only providing error in development
  await createLog(err.message);
  res.json({ status: error, msg: err });
});

module.exports = app;
