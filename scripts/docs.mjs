// Generate README.md from README.tmpl.md and the actual key/search-engine config.
import fs from "fs/promises"
import path from "path"
import url from "url"

import paths, { getPath, getSrcPath } from "../paths.js"

const { URL } = url
const copyrightYearOne = 2017

const escapeHTML = (text) =>
  String(text).replace(
    /[&<>"'`=/]/g,
    (s) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "/": "&#x2F;",
        "`": "&#96;",
        "=": "&#x3D;",
      }[s])
  )

const parseContributor = (contributor) => {
  let c = contributor
  if (typeof contributor === "string") {
    const m = contributor.match(
      /^(?<name>.*?)\s*(<(?<email>.*?)>)?\s*(\((?<url>.*?)\))?$/
    )
    if (!m) throw new Error(`couldn't parse contributor '${contributor}'`)
    c = m.groups
  } else if (typeof contributor !== "object") {
    throw new Error(
      `expected contributor to be of type 'string' or 'object', got '${typeof contributor}'`
    )
  }
  if (!c.name) return null
  return `${c.url ? `<a href="${c.url}">` : ""}${c.name}${c.url ? "</a>" : ""}`
}

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

const { default: searchEngines } = await import(getSrcPath(paths.sources.searchEngines))
const { default: conf } = await import(getSrcPath(paths.sources.conf))
const { default: keys } = await import(getSrcPath(paths.sources.keys))

global.document = oldDocument

let faviconsManifest = {}
try {
  faviconsManifest = JSON.parse(
    await fs.readFile(getPath(paths.favicons, paths.faviconsManifest), "utf8")
  )
} catch {
  // favicons manifest is optional
}

const pkg = JSON.parse(await fs.readFile(getPath(paths.pkgJson), "utf8"))

const screens = {}
let screenshotList = ""
for (const s of await fs.readdir(getPath(paths.screenshots))) {
  const name = path.basename(s, ".png").split("-")
  const alias = name[0]
  if (!screens[alias]) screens[alias] = []
  screens[alias].push(path.join(paths.screenshots, path.basename(s)))
}

let searchEnginesTable = Object.keys(searchEngines).sort((a, b) =>
  a < b ? -1 : a > b ? 1 : 0
)

searchEnginesTable = await searchEnginesTable.reduce(async (acc1p, k) => {
  const acc1 = await acc1p
  const c = searchEngines[k]
  const u = new URL(c.domain ? `https://${c.domain}` : c.search)
  const domain = u.hostname
  let s = ""
  if (screens[c.alias]) {
    screens[c.alias].forEach((ss, i) => {
      const num = i > 0 ? ` ${i + 1}` : ""
      s += `<a href="#${c.name.toLowerCase()}${num.replace(" ", "-")}">:framed_picture:</a>`
      screenshotList += `##### ${c.name}${num}\n`
      screenshotList += `![${c.name} screenshot](./${ss})\n\n`
    })
  }

  const favicon = faviconsManifest[domain]
    ? `<img src="./assets/favicons/${faviconsManifest[domain]}" width="16px"> `
    : ""
  const privNote = c.priv
    ? ' <a title="requires private API key" href="#optional-private-api-key-configuration">&#8727;</a>'
    : ""
  const localNote = c.local
    ? ' <a title="requires local web server" href="#running-the-local-web-server">&#8224;</a>'
    : ""

  return `${acc1}
  <tr>
    <td><a href="${u.protocol}//${domain}">${favicon}</a></td>
    <td><code>${c.alias}</code></td>
    <td>${c.name}${privNote}${localNote}</td>
    <td><a href="${u.protocol}//${domain}">${domain}</a></td>
    <td>${s}</td>
  </tr>`
}, Promise.resolve(""))

let keysTable = Object.entries(keys.maps)
  .map(([key, maps]) => [key, maps.filter((map) => !map.hide)])
  .filter(([, maps]) => maps.length > 0)
  .map(([key]) => key)
  .sort((a, b) => {
    if (a === "global") return -1
    if (b === "global") return 1
    return a < b ? -1 : a > b ? 1 : 0
  })

keysTable = await keysTable.reduce(async (acc1p, domain) => {
  const acc1 = await acc1p
  const header =
    "<tr><td><strong>Mapping</strong></td><td><strong>Description</strong></td></tr>"
  const c = keys.maps[domain]
  const maps = c.reduce((acc2, mapObj) => {
    let leader = ""
    if (typeof mapObj.leader !== "undefined") {
      leader = mapObj.leader
    } else if (domain === "global") {
      leader = ""
    } else {
      leader = conf.siteleader
    }
    const mapStr = escapeHTML(
      `${leader}${mapObj.alias}`.replace(" ", "<space>")
    )
    return `${acc2}<tr><td><code>${mapStr}</code></td><td>${mapObj.description}</td></tr>\n`
  }, "")
  let domainStr = "<strong>global</strong>"
  let favicon = ""
  if (domain !== "global") {
    favicon = faviconsManifest[domain]
      ? `<img src="./assets/favicons/${faviconsManifest[domain]}" width="16px"> `
      : ""
    domainStr = `<a href="//${domain}">${favicon}${domain}</a>`
  }
  return `${acc1}<tr><th colspan="2">${domainStr}</th></tr>${header}\n${maps}`
}, Promise.resolve(""))

const year = new Date().getFullYear()
const copyrightYears =
  copyrightYearOne !== year
    ? `${copyrightYearOne}-${year}`
    : `${copyrightYearOne}`
let copyright = `<p><h4>Author</h4>&copy; ${copyrightYears} ${parseContributor(pkg.author)}</p>`
if (Array.isArray(pkg.contributors) && pkg.contributors.length > 0) {
  copyright += "<p><h4>Contributors</h4><ul>"
  copyright += pkg.contributors.reduce(
    (acc, c) => `${acc}<li>${parseContributor(c)}</li>`,
    ""
  )
  copyright += "</ul></p>"
}
copyright += `<p><h4>License</h4>Released under the <a href="./LICENSE">${pkg.license} License</a></p>`

let readme = await fs.readFile(getPath(paths.readme), "utf8")
readme = readme
  .replace(
    "<!--{{NOTICE}}-->",
    "<!-- NOTICE: This file is auto-generated. Do not edit directly. -->"
  )
  .replace(
    "<!--{{SEARCH_ENGINES_COUNT}}-->",
    String(Object.keys(searchEngines).length)
  )
  .replace("<!--{{SEARCH_ENGINES_TABLE}}-->", searchEnginesTable)
  .replace(
    "<!--{{KEYS_MAPS_COUNT}}-->",
    String(Object.values(keys.maps).reduce((acc, m) => acc + m.length, 0))
  )
  .replace(
    "<!--{{KEYS_SITES_COUNT}}-->",
    String(Object.keys(keys.maps).length)
  )
  .replace("<!--{{KEYS_TABLE}}-->", keysTable)
  .replace("<!--{{SCREENSHOTS}}-->", screenshotList)
  .replace("<!--{{COPYRIGHT}}-->", copyright)

await fs.writeFile(getPath(paths.readmeOut), readme)
console.error(`wrote ${getPath(paths.readmeOut)}`)
