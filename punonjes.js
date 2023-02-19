const express = require("express");
const bodyParser = require("body-parser");
const sql = require("mssql/msnodesqlv8");
const config = {
  userName: "",
  password: "",
  server: "(LocalDb)\\MSSQLLocalDB",
  database: "KLINIKE_MIREUSHQYERJE",
  driver: "msnodesqlv8",
  options: {
    trustedConnection: true,
  },
};
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const session = require("express-session");
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/punonjesi/add", (req, res) => {
  res.render("add-punonjesi");
});

app.post("/punonjesi/add", (req, res) => {
  const {
    E_id,
    Emri,
    Mbiemri,
    Roli,
    Adresa,
    Nr_telefoni,
    Email,
    Paga,
    Passwordi,
  } = req.body;
  const insertQuery = `INSERT INTO PUNONJESI (E_id, Emri, Mbiemri, Roli, Adresa, Nr_telefoni, Email, Paga, Passwordi) 
                       VALUES ('${E_id}', '${Emri}', '${Mbiemri}', '${Roli}', '${Adresa}', '${Nr_telefoni}', '${Email}', '${Paga}', '${Passwordi}')`;

  db.run(insertQuery, (err) => {
    if (err) {
      console.error(err);
      return res.sendStatus(500);
    }
    res.redirect("/punonjesi");
  });
});
