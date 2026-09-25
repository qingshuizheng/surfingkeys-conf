// Remove build artifacts and caches.
import fs from "fs/promises"
import { getPath } from "../paths.js"

for (const target of [getPath("build"), getPath(".cache")]) {
  await fs.rm(target, { recursive: true, force: true })
  console.error(`cleaned ${target}`)
}
