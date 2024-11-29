import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import PlayerComponent from "./components/PlayerComponent";
import { Player } from "./models/Player.tsx";
import "bootstrap-icons/font/bootstrap-icons.css";

function Board() {
  const { id } = useParams();

  const [playerHome, setPlayerHome] = useState<Player>({
    name: "",
    points: 0,
    sets: 0,
    timeOut: JSON.parse(localStorage.getItem("homeTimeOut") || "false"),
  });

  const [playerAway, setPlayerAway] = useState<Player>({
    name: "",
    points: 0,
    sets: 0,
    timeOut: JSON.parse(localStorage.getItem("awayTimeOut") || "false"),
  });
  const [playerHomeOnTheLeft, setPlayerHomeOnTheLeft] = useState(true);
  const [isFetchingPaused, setIsFetchingPaused] = useState(false);

  const { status, isLoading, isError, data, error } = useQuery({
    queryKey: ["matchData", id],
    queryFn: async () => {
      try {
        const response = await axios.get(`http://localhost:8080/${id}`);
        console.log("FETCHING");
        return response.data;
      } catch (err) {
        console.log("Error in queryFn:", err);
      }
    },
    refetchInterval: isFetchingPaused ? false : 3000,
  });

  useEffect(() => {
    if (data) {
      if (data.isNewSingleGame) {
        console.log("New single game!");
        console.log(data);
        setIsFetchingPaused(true);
        setTimeout(() => {
          setIsFetchingPaused(false);
        }, 15000);
        setPlayerHome({
          name: data.nameHome,
          points: data.pointsHome,
          sets: playerHome.sets,
          timeOut: playerHome.timeOut,
        });
        setPlayerAway({
          name: data.nameAway,
          points: data.pointsAway,
          sets: playerAway.sets,
          timeOut: playerAway.timeOut,
        });
      } else if (data.isNewSet) {
        console.log("New set!");
        console.log(data);
        setIsFetchingPaused(true);
        setTimeout(() => {
          setIsFetchingPaused(false);
        }, 10000);
        if (!isFetchingPaused) {
          handleLocalStorage(playerHomeOnTheLeft ? "right" : "left");
        }
        setPlayerHome({
          name: data.nameHome,
          points: data.pointsHome,
          sets: playerHome.sets,
          timeOut: playerHome.timeOut,
        });
        setPlayerAway({
          name: data.nameAway,
          points: data.pointsAway,
          sets: playerAway.sets,
          timeOut: playerAway.timeOut,
        });
      } else {
        setPlayerHome({
          name: data.nameHome,
          points: data.pointsHome,
          sets: data.setHome,
          timeOut: playerHome.timeOut,
        });
        setPlayerAway({
          name: data.nameAway,
          points: data.pointsAway,
          sets: data.setAway,
          timeOut: playerAway.timeOut,
        });
      }
    }
  }, [data]);

  const handleLocalStorage = (value: string) => {
    const currentValue = window.localStorage.getItem("sideHomePlayer");
    if (currentValue !== value) {
      window.localStorage.setItem("sideHomePlayer", value);
      window.dispatchEvent(new Event("storage"));
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const sideHomePlayer = window.localStorage.getItem("sideHomePlayer");
      if (sideHomePlayer === "left") {
        setPlayerHomeOnTheLeft(true);
      } else if (sideHomePlayer === "right") {
        setPlayerHomeOnTheLeft(false);
      }

      const homeTimeOut = JSON.parse(
        localStorage.getItem("homeTimeOut") || "false"
      );
      const awayTimeOut = JSON.parse(
        localStorage.getItem("awayTimeOut") || "false"
      );
      setPlayerHome((prev) => ({ ...prev, timeOut: homeTimeOut }));
      setPlayerAway((prev) => ({ ...prev, timeOut: awayTimeOut }));
    };

    window.addEventListener("storage", handleStorageChange);
    handleStorageChange();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleTimeOut = (side: string) => {
    if (side === "left") {
      if (playerHomeOnTheLeft) {
        setPlayerHome((prev) => {
          const newTimeOut = !prev.timeOut;
          localStorage.setItem("homeTimeOut", JSON.stringify(newTimeOut));
          return { ...prev, timeOut: newTimeOut };
        });
      } else {
        setPlayerAway((prev) => {
          const newTimeOut = !prev.timeOut;
          localStorage.setItem("awayTimeOut", JSON.stringify(newTimeOut));
          return { ...prev, timeOut: newTimeOut };
        });
      }
    } else {
      if (playerHomeOnTheLeft) {
        setPlayerAway((prev) => {
          const newTimeOut = !prev.timeOut;
          localStorage.setItem("awayTimeOut", JSON.stringify(newTimeOut));
          return { ...prev, timeOut: newTimeOut };
        });
      } else {
        setPlayerHome((prev) => {
          const newTimeOut = !prev.timeOut;
          localStorage.setItem("homeTimeOut", JSON.stringify(newTimeOut));
          return { ...prev, timeOut: newTimeOut };
        });
      }
    }
  };

  if (isLoading) return <span>Loading...</span>;

  if (isError) return <span>Error:</span>;

  return (
    <div className="container-fluid h-100 bg-light m-0 p-0 width-100">
      <div className="row width-100 h-100 m-0">
        <div className="col-6 p-0">
          {playerHomeOnTheLeft ? (
            <PlayerComponent player={playerHome} isHome={true} />
          ) : (
            <PlayerComponent player={playerAway} isHome={false} />
          )}
        </div>
        <div className="col-6 p-0">
          {playerHomeOnTheLeft ? (
            <PlayerComponent player={playerAway} isHome={false} />
          ) : (
            <PlayerComponent player={playerHome} isHome={true} />
          )}
        </div>
      </div>
      <div className="row m-0 bg-dark align-items-center">
        <div className="col text-right">
          <button
            className="btn btn-secondary"
            onClick={() => handleTimeOut("left")}
          >
            Time-Out
          </button>
        </div>
        <div className="col text-center p-0">
          <button
            className="btn btn-primary"
            onClick={() =>
              handleLocalStorage(playerHomeOnTheLeft ? "right" : "left")
            }
          >
            <i className="bi bi-arrow-repeat"></i>
          </button>
        </div>
        <div className="col text-left">
          <button
            className="btn btn-secondary"
            onClick={() => handleTimeOut("right")}
          >
            Time-Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default Board;
