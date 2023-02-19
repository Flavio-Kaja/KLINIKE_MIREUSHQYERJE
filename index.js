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

app.get("/", authenticate, function (req, res) {
  sql.connect(config, function (err) {
    const request = new sql.Request();
    request.query("SELECT * FROM DIETA", function (err, result) {
      if (err) {
        console.log("Error fetching nutrients from database:", err);
        res.status(500).send("Error fetching nutrients from database");
        return;
      }

      res.render("index", { nutrients: result.recordset });
    });
  });
});

app.get("/login", function (req, res) {
  res.render("login", { error: false });
});

app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  sql.connect(config, function (err) {
    if (err) console.log(err);

    const request = new sql.Request();
    request.query(
      `SELECT * FROM PUNONJESI WHERE Email = '${username}' AND Passwordi = '${password}'`,
      function (err, recordset) {
        if (err) console.log(err);

        if (recordset.recordset.length > 0) {
          const user = {
            username: username,
            role: recordset.recordset[0].role,
          };
          req.session.user = user;
          res.redirect("/");
        } else {
          // If username and password are not found in PUNONJESI table, query Klienti table
          request.query(
            `SELECT * FROM KLIENTI_SPECIFIKIME WHERE Email = '${username}' AND Passwordi = '${password}'`,
            function (err, recordset) {
              if (err) console.log(err);

              if (recordset.recordset.length > 0) {
                const user = {
                  username: username,
                  role: "klienti",
                };
                req.session.user = user;
                res.redirect("/");
              } else {
                res.render("login", { error: true });
              }
            }
          );
        }
      }
    );
  });
});


app.get("/logout", function (req, res) {
  req.session.user = null;
  res.redirect("/login");
});

function authenticate(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
}

app.get("/add", authenticate, function (req, res) {
  res.render("add");
});

app.post("/add", authenticate, function (req, res) {
  const id = req.body.id;
  const time = req.body.time;
  const name = req.body.name;
  const calories = req.body.calories;
  const carbs = req.body.carbs;
  const fiber = req.body.fiber;
  const protein = req.body.protein;
  const fat = req.body.fat;

  sql.connect(config, function (err) {
    if (err) console.log(err);

    const request = new sql.Request();
    request.query(
      `INSERT INTO DIETA VALUES ('${id}', '${time}', '${name}', ${calories}, ${carbs}, ${fiber}, ${protein}, ${fat})`,
      function (err) {
        if (err) console.log(err);

        res.redirect("/");
      }
    );
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});

app.get("/edit/:id", authenticate, function (req, res) {
  const id = req.params.id;
  sql.connect(config, function (err) {
    if (err) console.log(err);

    const request = new sql.Request();
    request.query(
      `SELECT * FROM DIETA WHERE Id_dieta = '${id}'`,
      function (err, recordset) {
        if (err) console.log(err);

        res.render("dieta-edit", { dieta: recordset.recordset[0] });
      }
    );
  });
});

app.post("/edit/:id", authenticate, function (req, res) {
  const id = req.body.Id_dieta;
  const time = req.body.Vakti;
  const name = req.body.Emri;
  const calories = req.body.Kalori;
  const carbs = req.body.Karbohidrate;
  const fiber = req.body.Fibra;
  const protein = req.body.Proteina;
  const fat = req.body.Yndyrna;

  sql.connect(config, function (err) {
    if (err) console.log(err);

    const request = new sql.Request();
    request.query(
      `UPDATE DIETA SET Vakti = '${time}', Emri = '${name}', Kalori = ${calories}, Karbohidrate = ${carbs}, Fibra = ${fiber}, Proteina = ${protein}, Yndyrna = ${fat} WHERE Id_dieta = '${id}'`,
      function (err) {
        if (err) console.log(err);

        res.redirect("/");
      }
    );
  });
});

app.get("/delete/:E_id", authenticate, (req, res) => {
  const E_id = req.params.E_id;
  sql.connect(config, function (err) {
    if (err) console.log(err);

    const request = new sql.Request();
    request.query(
      `SELECT * FROM DIETA WHERE Id_dieta = '${E_id}'`,
      (error, results) => {
        if (error) throw error;
        res.render("dieta-delete", { dieta: results.recordset[0] });
      }
    );
  });
});

app.post("/delete/:id", authenticate, function (req, res) {
  // Delete PUNONJESI record with the given ID from the database
  const E_id = req.params.id;
  sql.connect(config, function (err) {
    if (err) console.log(err);

    const request = new sql.Request();
    request.query(
      `DELETE FROM DIETA WHERE Id_dieta = '${E_id}'`,
      (error, results) => {
        if (error) {
          // Handle error
          console.error(error);
          res
            .status(500)
            .send("An error occurred while deleting the PUNONJESI record.");
        } else {
          res.redirect("/");
        }
      }
    );
  });
});

app.get("/punonjesi/add", authenticate, (req, res) => {
  res.render("punonjesi-add");
});

app.post("/punonjesi/add", authenticate, (req, res) => {
  const {
    e_id,
    emri,
    mbiemri,
    roli,
    adresa,
    nr_telefoni,
    email,
    paga,
    passwordi,
  } = req.body;
  console.log(req.body);
  debugger;
  sql.connect(config, function (err) {
    if (err) console.log(err);

    const request = new sql.Request();
    const insertQuery = `INSERT INTO PUNONJESI (E_id, Emri, Mbiemri, Roli, Adresa, Nr_telefoni, Email, Paga, Passwordi) 
                       VALUES ('${e_id}', '${emri}', '${mbiemri}', '${roli}', '${adresa}', '${nr_telefoni}', '${email}', '${paga}', '${passwordi}')`;

    request.query(insertQuery, (err) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      res.redirect("/punonjesi");
    });
  });
});

app.get("/punonjesi", authenticate, (req, res) => {
  sql.connect(config, function (err) {
    if (err) console.log(err);

    const request = new sql.Request();
    request.query(
      "SELECT E_id,Emri, Mbiemri, Roli, Adresa, Nr_telefoni, Email, Paga FROM PUNONJESI",
      (err, punonjesit) => {
        console.log(punonjesit);
        if (err) {
          console.error(err);
          return res.sendStatus(500);
        }
        res.render("punonjesit", { punonjesit: punonjesit.recordset });
      }
    );
  });
});

app.get("/punonjesi/edit/:E_id", authenticate, (req, res) => {
  const E_id = req.params.E_id;
  sql.connect(config, function (err) {
    if (err) console.log(err);

    const request = new sql.Request();
    request.query(
      `SELECT * FROM PUNONJESI WHERE E_id = '${E_id}'`,
      (error, results) => {
        if (error) throw error;
        res.render("punonjesi-edit", { punonjesi: results.recordset[0] });
      }
    );
  });
});
//edit post
app.post("/punonjesi/edit/:id", authenticate, function (req, res) {
  var id = req.params.id;
  var newEmri = req.body.emri;
  var newMbiemri = req.body.mbiemri;
  var newRoli = req.body.roli;
  var newAdresa = req.body.adresa;
  var newNr_telefoni = req.body.nr_telefoni;
  var newEmail = req.body.email;
  var newPaga = req.body.paga;
  var passwordi = req.body.passwordi;
  sql.connect(config, function (err) {
    if (err) console.log(err);

    const request = new sql.Request();
    request.query(
      `UPDATE PUNONJESI SET Emri = '${newEmri}', Mbiemri = '${newMbiemri}', Roli = '${newRoli}', Adresa = '${newAdresa}', Nr_telefoni = '${newNr_telefoni}', Email = '${newEmail}', Paga = '${newPaga}', Passwordi = '${passwordi}' WHERE E_id = '${id}'`,
      function (err) {
        if (err) {
          console.log(err.message);
          res.status(500).send("Internal server error");
          return;
        }
        res.redirect("/punonjesi");
      }
    );
  });
});

app.get("/punonjesi/delete/:E_id", authenticate, (req, res) => {
  const E_id = req.params.E_id;
  sql.connect(config, function (err) {
    if (err) console.log(err);

    const request = new sql.Request();
    request.query(
      `SELECT * FROM PUNONJESI WHERE E_id = '${E_id}'`,
      (error, results) => {
        if (error) throw error;
        res.render("punonjesi-delete", { punonjesi: results.recordset[0] });
      }
    );
  });
});

app.post("/punonjesi/delete/:id", authenticate, function (req, res) {
  // Delete PUNONJESI record with the given ID from the database
  const E_id = req.params.id;
  sql.connect(config, function (err) {
    if (err) console.log(err);

    const request = new sql.Request();
    request.query(
      `DELETE FROM PUNONJESI WHERE E_id = '${E_id}'`,
      (error, results) => {
        if (error) {
          // Handle error
          console.error(error);
          res
            .status(500)
            .send("An error occurred while deleting the PUNONJESI record.");
        } else {
          // Redirect to the PUNONJESI list page after successful deletion
          res.redirect("/punonjesi");
        }
      }
    );
  });
});

//klienti
// GET request to render the form for adding a new client
app.get("/klienti/add", (req, res) => {
  res.render("klienti-add");
});

// POST request to handle the submission of the new client form
app.post("/klienti/add", (req, res) => {
  const {
    k_id,
    emer,
    mbiemer,
    gjinia,
    ditelindja,
    adresa,
    nr_telefoni,
    email,
    passwordi,
    gjatesia,
    pesha,
    kondicioni_fizik,
    aktiviteti,
    kalori_ditore,
  } = req.body;

  sql.connect(config, function (err) {
    if (err) console.log(err);

    const request = new sql.Request();
    const insertQuery = `INSERT INTO KLIENTI_SPECIFIKIME (K_id, Emer, Mbiemer, Gjinia, Ditelindja, Adresa, Nr_telefoni, Email, Passwordi, Gjatesia, Pesha, Kondicioni_fizik, Aktiviteti, Kalori_ditore)
                         VALUES ('${k_id}', '${emer}', '${mbiemer}', '${gjinia}', '${ditelindja}', '${adresa}', '${nr_telefoni}', '${email}', '${passwordi}', '${gjatesia}', '${pesha}', '${kondicioni_fizik}', '${aktiviteti}', '${kalori_ditore}')`;

    request.query(insertQuery, (err) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      res.redirect("/klientet");
    });
  });
});

// GET endpoint to display the edit form for a KLIENTI_SPECIFIKIME record
app.get("/klienti/edit/:kId", authenticate, (req, res) => {
  const kId = req.params.kId;

  sql.connect(config, function (err) {
    if (err) console.log(err);

    const request = new sql.Request();
    const selectQuery = `SELECT * FROM KLIENTI_SPECIFIKIME WHERE K_id = '${kId}'`;

    request.query(selectQuery, (err, result) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      res.render("klienti-edit", { klienti: result.recordset[0] });
    });
  });
});

// POST endpoint to update a KLIENTI_SPECIFIKIME record
app.post("/klienti/edit/:kId", authenticate, (req, res) => {
  const kId = req.params.kId;
  const {
    emer,
    mbiemer,
    gjinia,
    ditelindja,
    adresa,
    nr_telefoni,
    email,
    passwordi,
    gjatesia,
    pesha,
    kondicioni_fizik,
    aktiviteti,
    kalori_ditore,
  } = req.body;

  sql.connect(config, function (err) {
    if (err) console.log(err);

    const request = new sql.Request();
    const updateQuery = `UPDATE KLIENTI_SPECIFIKIME SET 
                         Emer = '${emer}', 
                         Mbiemer = '${mbiemer}', 
                         Gjinia = '${gjinia}', 
                         Ditelindja = '${ditelindja}', 
                         Adresa = '${adresa}', 
                         Nr_telefoni = '${nr_telefoni}', 
                         Email = '${email}', 
                         Passwordi = '${passwordi}', 
                         Gjatesia = '${gjatesia}', 
                         Pesha = '${pesha}', 
                         Kondicioni_fizik = '${kondicioni_fizik}', 
                         Aktiviteti = '${aktiviteti}', 
                         Kalori_ditore = '${kalori_ditore}' 
                       WHERE K_id = '${kId}'`;

    request.query(updateQuery, (err) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      res.redirect("/klientet");
    });
  });
});

// Delete KLIENTI_SPECIFIKIME by K_id
app.get("/klienti/delete/:id", authenticate, (req, res) => {
  const k_id = req.params.id;

  sql.connect(config, function (err) {
    if (err) console.log(err);

    const request = new sql.Request();
    const deleteQuery = `DELETE FROM KLIENTI_SPECIFIKIME WHERE K_id='${k_id}'`;

    request.query(deleteQuery, (err, result) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }

      if (result.rowsAffected.length === 0) {
        return res.sendStatus(404);
      }

      res.redirect("/klientet");
    });
  });
});

// Handle delete KLIENTI_SPECIFIKIME form submission
app.post("/klienti/delete/:id", authenticate, (req, res) => {
  const k_id = req.params.id;

  sql.connect(config, function (err) {
    if (err) console.log(err);

    const request = new sql.Request();
    const deleteQuery = `DELETE FROM KLIENTI_SPECIFIKIME WHERE K_id='${k_id}'`;

    request.query(deleteQuery, (err, result) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }

      if (result.rowsAffected.length === 0) {
        return res.sendStatus(404);
      }

      res.redirect("/klientet");
    });
  });
});

// GET endpoint for listing all KLIENTI_SPECIFIKIME records
app.get("/klientet", authenticate, (req, res) => {
  sql.connect(config, function (err) {
    if (err) console.log(err);

    const request = new sql.Request();
    const selectQuery =
      "SELECT TOP (1000) [K_id],[Emer],[Mbiemer],[Gjinia], Cast(CAST([Ditelindja] AS DATE) As VARCHAR) Ditelindja,[Adresa],[Nr_telefoni],[Email],[Passwordi],[Gjatesia],[Pesha],[Kondicioni_fizik],[Aktiviteti],[Kalori_ditore] FROM KLIENTI_SPECIFIKIME";

    request.query(selectQuery, (err, result) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      res.render("klienti", {
        klienti_specifikime: result.recordset,
      });
    });
  });
});

// POST endpoint for listing all KLIENTI_SPECIFIKIME records
app.post("/klientet", authenticate, (req, res) => {
  sql.connect(config, function (err) {
    if (err) console.log(err);

    const { Emer } = req.body;
    const request = new sql.Request();
    const selectQuery = `SELECT * FROM KLIENTI_SPECIFIKIME WHERE Emer LIKE '%${Emer}%'`;

    request.query(selectQuery, (err, result) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      res.render("klienti", {
        klienti_specifikime: result.recordset,
      });
    });
  });
});
app.get("/abonim-add", (req, res) => {
  sql.connect(config, function (err) {
    if (err) console.log(err);

    const request = new sql.Request();
    const query = `SELECT TOP (1000) [K_id]
      ,[Emer]
      ,[Mbiemer] 
  FROM [KLIENTI_SPECIFIKIME]`;

    request.query(query, function (err, recordset) {
      if (err) console.log(err);
      +res.render("abonim-add", {
        klientiSpecifikime: recordset.recordset,
      });
    });
  });
});
app.post("/abonimi-add", (req, res) => {
  const { abonim_id, kategoria, k_id, date_fillimi, date_mbarimi } = req.body;

  sql.connect(config, function (err) {
    if (err) console.log(err);

    const request = new sql.Request();
    const insertQuery = `INSERT INTO ABONIMI (Abonim_id, Kategoria, K_id, Date_fillimi, Date_mbarimi)
                         VALUES ('${abonim_id}', '${kategoria}', '${k_id}', '${date_fillimi}', '${date_mbarimi}')`;

    request.query(insertQuery, (err) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      res.redirect("/abonimet");
    });
  });
});

app.get("/abonimet", (req, res) => {
  sql.connect(config, function (err) {
    if (err) console.log(err);

    const request = new sql.Request();
    const selectQuery =
      "SELECT a.[Abonim_id], a.[Kategoria], k.[Emer], k.[Mbiemer], Cast(CAST(a.[Date_fillimi] AS DATE) As VARCHAR) Date_fillimi, Cast(CAST(a.[Date_mbarimi] AS DATE) As VARCHAR) Date_mbarimi FROM ABONIMI a INNER JOIN KLIENTI_SPECIFIKIME k ON a.[K_id] = k.[K_id]";

    request.query(selectQuery, (err, result) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      res.render("abonimet", {
        abonimet: result.recordset,
      });
    });
  });
});

app.post("/abonimet/delete/:abonim_id", (req, res) => {
  const abonim_id = req.params.abonim_id;

  sql.connect(config, function (err) {
    if (err) console.log(err);

    const request = new sql.Request();
    const deleteQuery = `DELETE FROM ABONIMI WHERE Abonim_id = '${abonim_id}'`;

    request.query(deleteQuery, (err, result) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      res.redirect("/abonimet");
    });
  });
});
