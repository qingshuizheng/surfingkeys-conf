import path from "path"
import { fileURLToPath } from "url"
import TerserPlugin from "terser-webpack-plugin"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
  mode: "production",
  entry: path.resolve(__dirname, "src/index.js"),
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "surfingkeys.js",
    clean: true,
  },
  devtool: false,
  module: {
    rules: [
      {
        test: /\.json$/i,
        type: "asset/source",
      },
    ],
  },
  optimization: {
    // Disable terser's default behavior of creating a separate surfingkeys.js.LICENSE.txt file
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          format: {
            comments: false,
          },
        },
      }),
    ],
  },
  experiments: {
    topLevelAwait: true,
  },
}
