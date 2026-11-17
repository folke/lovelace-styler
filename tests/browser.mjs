import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { createServer } from "node:http"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { build } from "vite"

// Bundle the fixture against the same Lit dependency as the regression harness.
const fixture = await build({
  configFile: false,
  logLevel: "silent",
  build: {
    write: false,
    lib: { entry: fileURLToPath(new URL("./browser.js", import.meta.url)), formats: ["es"] },
    rolldownOptions: { external: ["/dist/styler.js"] },
  },
})
const outputs = Array.isArray(fixture) ? fixture : [fixture]
const script = outputs
  .flatMap((result) => result.output)
  .find((output) => output.type === "chunk").code
const root = new URL("../", import.meta.url)
async function serve(request, response) {
  try {
    if (request.url === "/tests/browser.js") {
      response.setHeader("Content-Type", "text/javascript")
      response.end(script)
    } else if (["/tests/browser.html", "/dist/styler.js"].includes(request.url)) {
      response.setHeader(
        "Content-Type",
        request.url.endsWith(".js") ? "text/javascript" : "text/html"
      )
      response.end(await readFile(new URL(`.${request.url}`, root)))
    } else response.writeHead(404).end()
  } catch {
    response.writeHead(500).end()
  }
}
const server = createServer((request, response) => {
  void serve(request, response)
})
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
try {
  const output = await new Promise((resolve, reject) => {
    const browser = spawn(process.env.CHROME_BIN ?? "chromium", [
      "--headless",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--dump-dom",
      "--virtual-time-budget=5000",
      `http://127.0.0.1:${server.address().port}/tests/browser.html`,
    ])
    let stdout = "",
      stderr = ""
    const timer = setTimeout(() => {
      browser.kill("SIGKILL")
      reject(new Error("Browser test timed out"))
    }, 30_000)
    browser.stdout.on("data", (data) => {
      stdout += data
    })
    browser.stderr.on("data", (data) => {
      stderr += data
    })
    browser.on("error", (error) => {
      clearTimeout(timer)
      reject(error)
    })
    browser.on("exit", (code) => {
      clearTimeout(timer)
      if (code !== 0) reject(new Error(stderr))
      else resolve(stdout)
    })
  })
  assert.match(output, /<body data-status="passed">/, output)
  console.log(output.match(/Passed \d+ browser assertions/)?.[0])
} finally {
  server.close()
}
