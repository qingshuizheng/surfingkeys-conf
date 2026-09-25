// Initialize src/conf.priv.js from the example if it does not yet exist.
import fs from "fs/promises"
import paths, { getPath, getSrcPath } from "../paths.js"

try {
  await fs.stat(getSrcPath(paths.sources.confPriv))
} catch {
  console.error(
    `Notice: Initializing ${paths.sources.confPriv}. Configure your API keys here.`
  )
  await fs.copyFile(
    getPath(paths.confPrivExample),
    getSrcPath(paths.sources.confPriv),
    fs.constants.COPYFILE_EXCL
  )
}
