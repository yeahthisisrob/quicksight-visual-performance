import path from "path";
import { fileURLToPath } from "url";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import webpack from "webpack";

// Resolve __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: {
    popup: "./src/popup.tsx",
    viewer: "./src/viewerIndex.tsx",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@emotion/react": path.resolve(__dirname, "node_modules/@emotion/react"),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[path][name].[ext]",
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "popup.html",
      template: "./src/popup.html",
      chunks: ["popup"],
    }),
    new HtmlWebpackPlugin({
      filename: "viewer.html",
      template: "./src/viewer.html",
      chunks: ["viewer"],
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/manifest.json", to: "manifest.json" },
        { from: "src/icon.png", to: "icon.png" },
        { from: "src/background.js", to: "background.js" },
      ],
    }),
    new webpack.ProgressPlugin(),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    compress: true,
    port: 9000,
    open: true, // Automatically open the browser
  },
};
