const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8080;

function getContentType(path) {
  const extension = /^.+\.([a-zA-Z]+)$/.exec(path)[1] || "unknown";
  switch (extension) {
    case "json":
      return "application/json";
    case "html":
      return "text/html";
    case "wasm":
      return "application/wasm";
    case "js":
      return "application/javascript";
    default:
      return "text/plain";
  }
}

http
  .createServer((req, res) => {
    const requestedUrl = req.url == "/" ? "/index.html" : req.url;

    fs.readFile(
      path.join(__dirname, "../client/public", requestedUrl),
      (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end(JSON.stringify(err));
          return;
        }

        res.setHeader("Content-Type", getContentType(requestedUrl));
        res.writeHead(200);
        res.end(data);
      }
    );
  })
  .listen(PORT, () => {
    console.log(`Server running @ http://localhost:${PORT}`);
  });
