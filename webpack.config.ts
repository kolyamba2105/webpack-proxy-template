import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import CssMinimizerWebpackPlugin from "css-minimizer-webpack-plugin";
import EslintWebpackPlugin from "eslint-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import * as path from "path";
import * as webpack from "webpack";
import "webpack-dev-server";
import WebpackNodeExternals from "webpack-node-externals";

const modes = ["development", "production"] as const;

type Mode = typeof modes[number];

function isValidMode(value: string): value is Mode {
  return (modes as ReadonlyArray<string>).includes(value);
}

const mode =
  process.env.NODE_ENV && isValidMode(process.env.NODE_ENV) ? process.env.NODE_ENV : "production";

function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

function compact<T>(values: Array<T>): Array<NonNullable<T>> {
  return values.filter(isNonNullable);
}

/**
 * style-loader must be fist in the list
 */
const cssLoaders: webpack.RuleSetUse = [
  mode === "production" ? MiniCssExtractPlugin.loader : "style-loader",
  "css-loader",
  {
    loader: "postcss-loader",
    options: {
      postcssOptions: {
        plugins: [require("tailwindcss"), require("autoprefixer")],
      },
    },
  },
];

const client: webpack.Configuration = {
  devServer: {
    client: { overlay: { errors: true, warnings: false } },
    open: false,
    port: 3000,
    proxy: {
      "/api": {
        logLevel: "debug",
        router: () => "http://localhost:8080",
        target: "http://localhost:3000",
      },
    },
  },
  devtool: mode === "development" ? "source-map" : false,
  entry: path.resolve(__dirname, "src/index.tsx"),
  mode,
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/,
        type: "asset/resource",
      },
      {
        test: /\.css$/,
        use: cssLoaders,
      },
      {
        test: /\.scss$/,
        use: [...cssLoaders, "sass-loader"],
      },
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
    ],
  },
  optimization: {
    minimize: mode === "production",
    minimizer: [new CssMinimizerWebpackPlugin(), "..."],
    splitChunks: {
      cacheGroups: {
        defaultVendors: {
          chunks: "all",
          name: "vendors",
          priority: -10,
          reuseExistingChunk: true,
          test: /[\\/]node_modules[\\/]/,
        },
      },
      chunks: "async",
    },
  },
  output: {
    clean: true,
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "build/public"),
  },
  plugins: compact([
    new ForkTsCheckerWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "public/index.html",
    }),
    mode === "production" ? new CleanWebpackPlugin() : null,
    mode === "production" ? new MiniCssExtractPlugin() : null,
    mode === "production"
      ? new CopyWebpackPlugin({
          patterns: [{ from: "public", filter: (path) => !path.endsWith("index.html") }],
        })
      : null,
    mode === "development" ? new ReactRefreshWebpackPlugin({ overlay: true }) : null,
    mode === "development"
      ? new EslintWebpackPlugin({ extensions: ["ts", "tsx"], failOnError: false, files: "./src" })
      : null,
  ]),
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
  },
  stats: {
    preset: "errors-warnings",
  },
};

const server: webpack.Configuration = {
  devtool: mode === "development" ? "source-map" : false,
  entry: path.resolve(__dirname, "src/server.ts"),
  externals: [WebpackNodeExternals()],
  mode,
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/,
        type: "asset/resource",
      },
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
    ],
  },
  optimization: {
    minimize: mode === "production",
    splitChunks: {
      cacheGroups: {
        defaultVendors: {
          chunks: "all",
          name: "vendors",
          priority: -10,
          reuseExistingChunk: true,
          test: /[\\/]node_modules[\\/]/,
        },
      },
      chunks: "async",
    },
  },
  output: {
    clean: true,
    filename: "server.js",
    path: path.resolve(__dirname, "build"),
  },
  plugins: compact([
    mode === "production" ? new CleanWebpackPlugin() : null,
    mode === "production" ? new ForkTsCheckerWebpackPlugin() : null,
  ]),
  resolve: {
    extensions: [".js", ".ts"],
  },
  stats: {
    preset: "errors-warnings",
  },
  target: "node",
};

export default mode === "production" ? [client, server] : client;
