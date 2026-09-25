// Run webpack in watch mode and the local config server concurrently.
import { spawn } from "child_process"
import path from "path"
import { fileURLToPath } from "url"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const webpackBin = path.join(root, "node_modules/.bin/webpack")

const children = []
const run = (cmd, args, label) => {
  const child = spawn(cmd, args, { cwd: root, stdio: "inherit" })
  children.push(child)
  child.on("exit", (code) => {
    console.error(`[dev] ${label} exited with code ${code}`)
    shutdown()
  })
  return child
}

const shutdown = () => {
  for (const c of children) {
    if (!c.killed) c.kill("SIGTERM")
  }
  process.exit(0)
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)

run(webpackBin, ["--watch"], "webpack")
run(process.execPath, ["server/index.js"], "server")
