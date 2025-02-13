const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const baseManifest = require("./chrome/manifest.json");
const WebpackExtensionManifestPlugin = require("webpack-extension-manifest-plugin");
const SentryCliPlugin = require('@sentry/webpack-plugin');

module.exports = (env, argv) => {
  // Use env.<YOUR VARIABLE> here:

  return {
    mode: argv.mode,
    devtool: argv.mode === "development" ? 'cheap-module-source-map' : 'source-map',
    entry: {
      app: path.join(__dirname, "./static/index.js"),
    },
    output: {
      path: path.resolve(__dirname, "./build"),
      filename: "[name].js"
    },
    resolve: {
      extensions: ["*", ".js"]
    },
    optimization: {
      minimize: argv.mode === 'production',
      concatenateModules: true,
    },
    plugins: [
      new SentryCliPlugin({
        include: '.',
        project: 'tabox',
        org: 'tabox',
        release: 'tabox-' + baseManifest.version,
        authToken: '4a797cec142141988c2056b53dd4a0bc599fea0502fd4f428f40d864a15292b4',
        ignore: ['node_modules', 'webpack.config.js'],
      }),
      new HtmlWebpackPlugin({
        title: "Tabox - Save and Share Tab Groups",
        meta: {
          charset: "utf-8",
          viewport: "width=device-width, initial-scale=1, shrink-to-fit=no",
          "theme-color": "#000000"
        },
        manifest: "manifest.json",
        filename: "index.html",
        template: "./static/index.html",
        hash: true
      }),
      new CopyPlugin({
          patterns: [
              { from: "chrome/icons", to: "icons" },
              { from: "static/images", to: "images" },
              { from: "static/globals.js", to: "[name][ext]" },
              { from: "static/deferedLoading.*", to: "[name][ext]" },
              { from: "chrome/*.js", to: "[name][ext]" },
              { from: "chrome/api-keys.json", to: "[name][ext]" },
              {
                from: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.*',
                to: "[name][ext]"
              }
          ]
      }),
      new WebpackExtensionManifestPlugin({
        config: {
          base: baseManifest
        }
      })
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ["babel-loader"]
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"]
        },
        {
          test: /\.(png|jpg|gif)$/i,
          type: 'asset/resource'
        }
      ]
    }
  };
};