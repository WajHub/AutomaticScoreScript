import axios from "axios";
import express from "express";
import cors from "cors";
import xml2js from "xml2js";

const app = express();
const URL = "https://superliga.com.pl/matches_new.php?id=";

app.use(cors());
app.listen(8080, () => {
  console.log("Server is running on port 8080");
});

app.get("/:id", async (req, res) => {
  const matchId = req.params.id;
  try {
    const result = await axios.get(`${URL}${matchId}`);

    const resultJson = await xml2js.parseStringPromise(result.data);
    console.log(resultJson);
    res.send(resultJson);
  } catch (error) {
    console.error(error); // Log any errors
    res.status(500).send("Error fetching data"); // Send a proper error response
  }
});
