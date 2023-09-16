import fs from "fs";
import express from "express";
import path from "path";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const app = express();

app.set("view engine", "ejs"); // merge viw folder
app.use(express.static(path.join(path.resolve(), "public"))); // merge public folder
app.use(express.urlencoded({ extended: true }));
// ----------------DataBase----------------
mongoose
  .connect("mongodb://localhost:27017", {
    dbName: "loginProject",
  })
  .then(() => {
    console.log("database connected");
  })
  .catch((error) => {
    console.log("database error");
  });
const schema = new mongoose.Schema({
  naam: String,
  email: String,
  password: String,
});
const user = mongoose.model("users", schema);
//--------------------------------------------------

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let e = await user.findOne({ email });

  if (!e) {
    return res.render("register");
  }

  // const isMatch = e.password === password;
  const isMatch = await bcrypt.compare(password, e.password);

  if (isMatch) {
    const token = jwt.sign({ _id: e._id }, "secret");
    res.cookie("token", token, {
      httpOnly: true,
    });
    // console.log(token);
    res.render("logout", { name: e.naam });
  } else {
    res.render("login", { email, message: "incorrect password" });
  }
});

app.post("/register", async (req, res) => {
  const { naam, email, password } = req.body;
  const hashPass = await bcrypt.hash(password, 10);

  await user.create({ naam, email, password: hashPass });
  res.render("login");
});

app.post("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.render("login");
});

app.get("/", (req, res) => {
  res.render("login");
});

app.listen(5000, () => {
  console.log("server is working");
});
