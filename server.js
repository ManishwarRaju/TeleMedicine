const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Mass',
  database: 'telemedicines'
};

app.get("/", (req, res) => {
  res.send("started");
});

// POST endpoint to insert patient
app.post("/addPatient", async (req, res) => {
  const { pid, pname, gender , age,contactnum,gmail,address, bloodgroup,weight,height} = req.body;

  if (!pname || !pid || !gender|| ! age|| !contactnum|| !gmail|| !address|| ! bloodgroup|| !weight|| !height) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = "INSERT INTO patient (pid, pname, gender, age, contactnum, gmail, address, bloodgroup, weight, height) VALUES (?, ?, ? ,? ,? ,? ,? ,? ,? ,?)";
    const values = [pid, pname, gender, age, contactnum, gmail, address, bloodgroup, weight, height];
    
    const [result] = await connection.execute(query, values);
    await connection.end();

    res.json({ message: "Patient added", insertId: result.insertId });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(8000, () => {
  console.log("listening to the song monica");
});
