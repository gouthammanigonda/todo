const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;
const initializeDBAndServer = () => {
  try {
    open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log(`Server Running At http://localhost:3000/`)
    );
  } catch (e) {
    console.log(`DBError:${e.message}`);
  }
};
initializeDBAndServer();
