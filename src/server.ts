import { Server } from "http";
import app from "./app";
import config from "./config";

const port = config.port;

async function main() {
  const server: Server = app.listen(config.port, () => {
    console.log("Server is running on port", config.port);
  });
}

main();
