// Download favicons for every search engine and site-specific key mapping.
import fs from "fs/promises"
import path from "path"
import url from "url"

import paths, { getPath, getSrcPath } from "../paths.js"

const { URL } = url

// Stub DOM globals so we can import config modules in Node.
const oldDocument = global.document
global.document = {
  createDocumentFragment: () => {},
  createElement: () => {},
  createElementNS: () => {},
  createTextNode: () => {},
  createTreeWalker: () => {},
  importNode: () => {},
}

const { default: searchEngines } = await import(
  getSrcPath(paths.sources.searchEngines)
)
const { default: keys } = await import(getSrcPath(paths.sources.keys))

global.document = oldDocument

const getFavicon = async ({ domain, favicon }) => {
  let data
  try {
    const res = await fetch(favicon, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) {
      throw new Error(`request to ${favicon} failed with code ${res.status}`)
    }
    data = Buffer.from(await res.arrayBuffer())
  } catch (e) {
    process.stdout.write(`no favicon found for ${favicon}: ${e.message}\n`)
    // transparent pixel
    data = Buffer.from(
      "AAABAAEAAQEAAAEAIAAwAAAAFgAAACgAAAABAAAAAgAAAAEAIAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAA==",
      "base64"
    )
  }
  return { domain, name: `${domain}.ico`, source: data }
}

const getDuckduckgoFaviconUrl = (domain) =>
  new URL(`https://icons.duckduckgo.com/ip3/${domain}.ico`)

// Wipe the favicons directory first.
await fs.rm(getPath(paths.favicons), { recursive: true, force: true })
await fs.mkdir(getPath(paths.favicons), { recursive: true })

const sites = []
  .concat(
    Object.entries(searchEngines).map(([, v]) => {
      const domain = new URL(
        v.domain ? `https://${v.domain}` : v.search
      ).hostname
      return {
        domain,
        favicon: v.favicon ?? getDuckduckgoFaviconUrl(domain),
      }
    }),
    Object.entries(keys.maps)
      .map(([key, maps]) => [key, maps.filter((map) => !map.hide)])
      .filter(([key, maps]) => key !== "global" && maps.length > 0)
      .map(([key]) => ({
        domain: key,
        favicon: getDuckduckgoFaviconUrl(
          new URL(`https://${key}`).hostname
        ),
      }))
  )
  .filter((e, i, arr) => i === arr.indexOf(e))

const favicons = (
  await Promise.all(sites.map((site) => getFavicon(site)))
).filter((e) => e !== undefined)

const manifest = favicons.reduce((acc, e) => {
  acc[e.domain] = e.name
  return acc
}, {})

await fs.writeFile(
  getPath(paths.favicons, paths.faviconsManifest),
  JSON.stringify(manifest)
)

for (const f of favicons) {
  await fs.writeFile(path.join(getPath(paths.favicons), f.name), f.source)
}

console.error(`fetched ${favicons.length} favicons into ${getPath(paths.favicons)}`)
