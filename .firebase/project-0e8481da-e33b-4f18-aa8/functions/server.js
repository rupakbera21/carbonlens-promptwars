const { onRequest } = require("firebase-functions/v2/https");
const server = import("firebase-frameworks");
exports.ssrproject0e8481dae33b4 = onRequest({ region: "us-central1" }, (req, res) =>
  server.then((it) => it.handle(req, res)),
);
