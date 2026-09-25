// Copy the built bundle to the SurfingKeys config directory.
import fs from "fs/promises"
import path from "path"
import paths, { getPath } from "../paths.js"

const src = getPath(paths.buildDir, paths.output)
const dest = path.join(paths.installDir, paths.output)

await fs.mkdir(paths.installDir, { recursive: true })
await fs.copyFile(src, dest)
console.error(`installed ${src} -> ${dest}`)
