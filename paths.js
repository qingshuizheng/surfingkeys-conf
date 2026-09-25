import os from "os"
import path from "path"
import { fileURLToPath } from "url"

// Cross-platform config-home resolution, matching the previous platform-folders
// getConfigHome() behavior without a native addon:
//   - Windows: %APPDATA% (Roaming)
//   - macOS:   ~/Library/Application Support
//   - Linux:   $XDG_CONFIG_HOME or ~/.config
function getConfigHome() {
  if (process.platform === "win32") {
    return process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming")
  }
  if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support")
  }
  return process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config")
}

const gulpfilePath = fileURLToPath(import.meta.url)

const paths = {
  assets: "assets",
  buildDir: "build/",
  confPrivExample: "src/conf.priv.example.js",
  dirname: path.dirname(gulpfilePath),
  favicons: "assets/favicons",
  faviconsManifest: "favicons.json",
  installDir: getConfigHome(),
  srcDir: "src",
  output: "surfingkeys.js",
  pkgJson: "package.json",
  readme: "README.tmpl.md",
  readmeOut: "README.md",
  screenshots: "assets/screenshots",

  sources: {
    api: "api.js",
    actions: "actions.js",
    conf: "conf.js",
    confPriv: "conf.priv.js",
    entrypoint: "index.js",
    keys: "keys.js",
    searchEngines: "search-engines.js",
    util: "util.js",
  },
}

export default paths

export const getPath = (...f) => path.join(paths.dirname, ...f)
export const getSrcPath = (...s) => getPath(paths.srcDir, ...s)
