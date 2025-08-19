const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "password",
  database: "telemedicines",
};

app.get("/", (req, res) => {
  res.send("started");
});

// POST endpoint to insert patient
app.post("/addPatient", async (req, res) => {
  const {
    pid,
    pname,
    gender,
    age,
    contactnum,
    gmail,
    address,
    bloodgroup,
    weight,
    height,
  } = req.body;

  if (
    !pname ||
    !pid ||
    !gender ||
    !age ||
    !contactnum ||
    !gmail ||
    !address ||
    !bloodgroup ||
    !weight ||
    !height
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const query =
      "INSERT INTO patient (pid, pname, gender, age, contactnum, gmail, address, bloodgroup, weight, height) VALUES (?, ?, ? ,? ,? ,? ,? ,? ,? ,?)";
    const values = [
      pid,
      pname,
      gender,
      age,
      contactnum,
      gmail,
      address,
      bloodgroup,
      weight,
      height,
    ];

    const [result] = await connection.execute(query, values);
    await connection.end();

    res.json({ message: "Patient added", insertId: result.insertId });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// READ - Get all patients
app.get("/patients", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT * FROM patient ORDER BY created_at DESC"
    );
    await connection.end();

    res.json({
      message: "Patients retrieved successfully",
      data: rows,
      count: rows.length,
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// READ - Get patient by PID
app.get("/patient/:pid", async (req, res) => {
  const { pid } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT * FROM patient WHERE pid = ?",
      [pid]
    );
    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json({
      message: "Patient retrieved successfully",
      data: rows[0],
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// UPDATE - Update patient by PID
app.put("/patient/:pid", async (req, res) => {
  const { pid } = req.params;
  const {
    pname,
    gender,
    age,
    contactnum,
    gmail,
    address,
    bloodgroup,
    weight,
    height,
  } = req.body;

  // Check if at least one field is provided
  if (
    !pname &&
    !gender &&
    !age &&
    !contactnum &&
    !gmail &&
    !address &&
    !bloodgroup &&
    !weight &&
    !height
  ) {
    return res
      .status(400)
      .json({ error: "At least one field is required for update" });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Check if patient exists
    const [existingPatient] = await connection.execute(
      "SELECT * FROM patient WHERE pid = ?",
      [pid]
    );
    if (existingPatient.length === 0) {
      await connection.end();
      return res.status(404).json({ error: "Patient not found" });
    }

    // Build dynamic update query
    const updateFields = [];
    const values = [];

    if (pname) {
      updateFields.push("pname = ?");
      values.push(pname);
    }
    if (gender) {
      updateFields.push("gender = ?");
      values.push(gender);
    }
    if (age) {
      updateFields.push("age = ?");
      values.push(age);
    }
    if (contactnum) {
      updateFields.push("contactnum = ?");
      values.push(contactnum);
    }
    if (gmail) {
      updateFields.push("gmail = ?");
      values.push(gmail);
    }
    if (address) {
      updateFields.push("address = ?");
      values.push(address);
    }
    if (bloodgroup) {
      updateFields.push("bloodgroup = ?");
      values.push(bloodgroup);
    }
    if (weight) {
      updateFields.push("weight = ?");
      values.push(weight);
    }
    if (height) {
      updateFields.push("height = ?");
      values.push(height);
    }

    values.push(pid); // Add pid for WHERE clause

    const query = `UPDATE patient SET ${updateFields.join(", ")} WHERE pid = ?`;
    const [result] = await connection.execute(query, values);
    await connection.end();

    res.json({
      message: "Patient updated successfully",
      affectedRows: result.affectedRows,
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// DELETE - Delete patient by PID
app.delete("/patient/:pid", async (req, res) => {
  const { pid } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Check if patient exists
    const [existingPatient] = await connection.execute(
      "SELECT * FROM patient WHERE pid = ?",
      [pid]
    );
    if (existingPatient.length === 0) {
      await connection.end();
      return res.status(404).json({ error: "Patient not found" });
    }

    const [result] = await connection.execute(
      "DELETE FROM patient WHERE pid = ?",
      [pid]
    );
    await connection.end();

    res.json({
      message: "Patient deleted successfully",
      deletedPatient: existingPatient[0],
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// SEARCH - Search patients by name
app.get("/search/patients", async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: "Name parameter is required" });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT * FROM patient WHERE pname LIKE ? ORDER BY pname ASC",
      [`%${name}%`]
    );
    await connection.end();

    res.json({
      message: "Search completed",
      data: rows,
      count: rows.length,
      searchTerm: name,
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(8000, () => {
  console.log("listening to the song monica");
});
