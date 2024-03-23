const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

/** @type {import('webpack').Configuration} */
const config = {
  mode: "production",
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },

  entry: "./src/index.js",

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    clean: true,
  },

  resolve: {
    extensions: [".js", ".json"],
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [["@babel/preset-env"]],
            },
          },
        ],
      },
      {
        test: /\.(handlebars|hbs)$/,
        loader: "handlebars-loader",
        options: {
          knownHelpersOnly: false,
          preventIndent: true,
          helperDirs: [path.join(__dirname, "./src/shared/")], // 你的helpers文件夹的路径
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },

  optimization: {
    minimize: true, // 开启最小化
    minimizer: [
      new TerserJSPlugin({
        terserOptions: {
          format: {
            comments: false, // 移除注释
          },
          compress: {
            drop_console: true, // 移除console
          },
        },
        extractComments: false, // 不将注释提取到单独的文件中
      }),
      new CssMinimizerPlugin({}),
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "public/index.html",
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css", // 输出的CSS文件名
    }),
  ],
};

module.exports = config;
