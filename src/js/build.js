import fs                from "node:fs"
import path              from "node:path"
import { fileURLToPath } from "url"
import ejs               from "ejs"
import { parseArgs }     from "node:util"
import process           from "node:process"
import semver            from "semver"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const {
  values,
  positionals
} = parseArgs({
  options: {
    help : {
      type: "boolean",
      short: "h",
    }
  },
  strict: true,
})
if (values.help) {
  console.log("Usage: build.js [options]")
  console.log()
  console.log("OPTIONS")
  console.log()
  console.log("  --help                         - show this message")
  console.log()
  process.exit(0)
}

const htmlDir = `${__dirname}/../site`
const siteDir = `${__dirname}/../../docs`

const nonDirs = []
const dirNames = []
fs.readdirSync(htmlDir).forEach((file) => {
  const fullPath = `${htmlDir}/${file}`
  if (!fs.statSync(fullPath).isDirectory()) {
    nonDirs.push(fullPath)
  }
  else {
    dirNames.push(file)
  }
})
if (nonDirs.length > 0) {
  console.log(`${htmlDir} must only contain directories`)
  process.exit(1)
}

const dirs = {}

dirNames.forEach((dir) => {
  const semverObject = semver.parse(dir)
  if (semverObject) {
    dirs[dir] = {
      semver: semverObject,
      fullPath: `${htmlDir}/${dir}`,
    }
  }
  else {
    console.log(`${htmlDir}/${dir} cannot be parsed as semver`)
  }
})

fs.rmSync(siteDir, { recursive: true, force: true })
fs.mkdirSync(siteDir)

const versions = []
Object.entries(dirs).forEach( ( [dir, { semver, fullPath }] ) => {
  const sitePath = `${siteDir}/${dir}`
  versions.push(semver)
  fs.mkdirSync(sitePath)
  fs.readdirSync(fullPath).forEach((file) => {
    if (!file.startsWith("_")) {
      const source = `${fullPath}/${file}`
      const siteFile = `${sitePath}/${file}`
      if (path.extname(file) == ".html") {
        console.log(`Rendering ${source} to ${siteFile}`)
        ejs.renderFile(
          source,
          {
            semver: semver,
          },
          (err, str) => {
            if (err)  {
              throw err
            }
            const fd = fs.openSync(siteFile,"w")
            fs.writeFileSync(fd, str)
            fs.closeSync(fd)
          }
        )
      }
      else {
        console.log(`Copying ${source} to ${siteFile}`)
        fs.copyFileSync(source, siteFile)
      }
    }
  })
})
const sorted = semver.rsort(versions)
const latest = sorted[0]

ejs.renderFile(
  dirs[latest.raw].fullPath + "/index.html",
  {
    semver: latest,
    versions: versions,
    mainIndex: true,
  },
  (err, str) => {
    if (err)  {
      throw err
    }
    const fd = fs.openSync(`${siteDir}/index.html`,"w")
    fs.writeFileSync(fd, str)
    fs.closeSync(fd)
  }
)
