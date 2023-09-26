import fs                from "node:fs"
import path              from "node:path"
import child_process     from "node:child_process"
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
    "no-minify": {
      type: "boolean",
    },
    help : {
      type: "boolean",
      short: "h",
    },
    source: {
      type: "string",
    },
    out: {
      type: "string",
    },
  },
  strict: true,
})

const usage = () => {
  console.log("Usage: build.js --source «dir» --out «dir» [options]")
  console.log()
  console.log("OPTIONS")
  console.log()
  console.log("  --help         - show this message")
  console.log("  --source «dir» - where the site's source files are (required)")
  console.log("  --out «dir»    - where to generate the site (required)")
  console.log()
}
if (values.help) {
  usage()
  process.exit(0)
}

if (!values.source) {
  console.error("--source is required")
  usage()
  process.exit(1)
}

if (!values.out) {
  console.error("--out is required")
  usage()
  process.exit(1)
}

const htmlDir = values.source
const siteDir = values.out

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
    if (fs.statSync(fullPath + "/" + file).isDirectory()) {
      if (file == "js") {
        if (!fs.existsSync(fullPath + "/" + file + "/index.js")) {
          throw `index.js doesn't exist`
        }
        const minifyFlag = values["no-minify"] ? "" : "--minify"
        const command = `npx esbuild ${minifyFlag} --define:VERSION='\"${semver.raw}\"' --sourcemap --bundle ${fullPath}/${file}/index.js --outfile=${sitePath}/main.js`
        console.log(`Running '${command}'`)
        const stdout = child_process.execSync(command)
        console.log(stdout)
      }
      else if (file == "css") {
        if (!fs.existsSync(fullPath + "/" + file + "/index.css")) {
          throw `index.js doesn't exist`
        }
        const minifyFlag = values["no-minify"] ? "" : "--minify"
        const command = `npx esbuild ${minifyFlag} --sourcemap --bundle ${fullPath}/${file}/index.css --outfile=${sitePath}/main.css`
        console.log(`Running '${command}'`)
        const stdout = child_process.execSync(command)
        console.log(stdout)
      }
      else {
        console.log(`Ignoring ${file} as it's a directory and not one we can process`)
        return
      }
    }
    else if (!file.startsWith("_")) {
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
