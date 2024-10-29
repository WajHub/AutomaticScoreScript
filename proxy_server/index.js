import axios from "axios";
import express from "express";
import cors from "cors";
import xml2js from "xml2js";
import * as utils from "./utils.js";

const app = express();
const URL = "https://superliga.com.pl/matches_new.php?id=";
let prevNumberOfMatch = 1;
let numberOfMatch = 1;
let prevNumberOfSet = 1;
let numberOfSet = 1;

app.use(cors());

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});

app.get("/:id", async (req, res) => {
  const matchId = req.params.id;
  try {
    const result = await axios.get(`${URL}${matchId}`);
    const resultJson = await xml2js.parseStringPromise(result.data);
    console.log("Data loaded ------------------------------------");

    numberOfMatch = utils.getNumberOfMatch(resultJson);
    console.log("Game number: ", numberOfMatch);

    if (utils.matchIsStarted(resultJson, numberOfMatch)) {
      numberOfSet = utils.getNumberOfSet(resultJson, numberOfMatch);
      console.log("Set number: ", numberOfSet);

      const homePlayerName = utils.getHomePlayerName(resultJson, numberOfMatch);
      const awayPlayerName = utils.getAwayPlayerName(resultJson, numberOfMatch);
      const setsHome = utils.getSetsHome(resultJson, numberOfMatch);
      const setsGuest = utils.getSetsGuest(resultJson, numberOfMatch);
      const pointsHome = utils.getPointsHome(
        resultJson,
        numberOfMatch,
        numberOfSet
      );
      const pointsAway = utils.getPointsAway(
        resultJson,
        numberOfMatch,
        numberOfSet
      );

      console.log("Home player Name: ", homePlayerName);
      console.log("Away player Name: ", awayPlayerName);
      console.log("Home player sets: ", setsHome);
      console.log("Away player sets: ", setsGuest);
      console.log("Home player points: ", pointsHome);
      console.log("Away player points: ", pointsAway);

      let isFinishedMatch = false;
      let isFinishedSet = false;
      if (prevNumberOfMatch !== numberOfMatch) {
        isFinishedMatch = true;
        prevNumberOfMatch = numberOfMatch;
      } else if (prevNumberOfSet !== numberOfSet) {
        isFinishedSet = true;
        prevNumberOfSet = numberOfSet;
      }

      console.log("------------------------------------- \n");
      if (numberOfMatch === 0) {
        res.status(200).send({
          isNewSet: false,
          isNewSingleGame: false,
          nameHome: "home",
          nameAway: "away",
          setHome: 0,
          setAway: 0,
          pointsHome: 0,
          pointsAway: 0,
        });
      } else if (isFinishedMatch) {
        res.status(200).send({
          isNewSet: false,
          isNewSingleGame: true,
          nameHome: homePlayerName,
          nameAway: awayPlayerName,
          setHome: setsHome,
          setAway: setsGuest,
          pointsHome: utils.getPointsHome(
            resultJson,
            numberOfMatch - 1,
            prevNumberOfSet
          ),
          pointsAway: utils.getPointsAway(
            resultJson,
            numberOfMatch - 1,
            prevNumberOfSet
          ),
        });
        prevNumberOfSet = numberOfSet;
      } else if (isFinishedSet) {
        res.status(200).send({
          isNewSet: true,
          isNewSingleGame: false,
          nameHome: homePlayerName,
          nameAway: awayPlayerName,
          setHome: setsHome,
          setAway: setsGuest,
          pointsHome: utils.getPointsHome(
            resultJson,
            numberOfMatch,
            numberOfSet - 1
          ),
          pointsAway: utils.getPointsAway(
            resultJson,
            numberOfMatch,
            numberOfSet - 1
          ),
        });
      } else {
        res.status(200).send({
          isNewSet: isFinishedSet,
          isNewSingleGame: false,
          nameHome: homePlayerName,
          nameAway: awayPlayerName,
          setHome: setsHome,
          setAway: setsGuest,
          pointsHome: pointsHome,
          pointsAway: pointsAway,
        });
      }
    } else {
      res.status(400).send("Match is not started!");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data");
  }
});
