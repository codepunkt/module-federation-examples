const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");

const readRemoteHost = (name) =>
  `promise new Promise((resolve, reject) => {
    if (typeof ${name} !== "undefined") return resolve();
    if (typeof window.__webpack_federation_remote_hosts__ === undefined) return reject(new Error("remote not defined"));
    const remoteHost = __webpack_federation_remote_hosts__['${name}'];
    if (typeof remoteHost === undefined) return reject(new Error("remote not defined"));
    const remoteEntry = remoteHost + "/remoteEntry.js";
    __webpack_require__.l(remoteEntry, (event) => {
      if (typeof ${name} !== "undefined") return resolve();
      reject(new Error('Loading remoteEntry failed: "' + remoteEntry + '"'));
    }, "${name}");
  }).then(() => ${name})`;

module.exports = {
  entry: "./src/index",
  mode: "development",
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    port: 3001,
  },
  output: {
    publicPath: "http://localhost:3001/",
  },
  module: {
    rules: [
      {
        test: /bootstrap\.js$/,
        loader: "bundle-loader",
        options: {
          lazy: true,
        },
      },
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          presets: ["@babel/preset-react"],
        },
      },
    ],
  },
  //http://localhost:3002/remoteEntry.js
  plugins: [
    new ModuleFederationPlugin({
      name: "app1",
      remotes: {
        app2: readRemoteHost("app2"),
      },
      shared: { react: { singleton: true }, "react-dom": { singleton: true } },
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "./public/remoteHosts.js",
        },
      ],
    }),
  ],
};
