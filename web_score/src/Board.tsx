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
    timeOut: false,
  });

  const [playerAway, setPlayerAway] = useState<Player>({
    name: "",
    points: 0,
    sets: 0,
    timeOut: false,
  });

  const [isFetchingPaused, setIsFetchingPaused] = useState(false);

  const { status, isLoading, isError, data, error } = useQuery({
    queryKey: ["matchData", id],
    queryFn: async () => {
      try {
        const response = await axios.get(`http://localhost:8080/${id}`);
        return response.data;
      } catch (err) {
        console.log("Error in queryFn:", err);
      }
    },
    refetchInterval: isFetchingPaused ? false : 3000,
  });

  useEffect(() => {
    if (data) {
      if (data.isNewSet == true) {
        console.log("New set!");
        console.log(data);
        setIsFetchingPaused(true);
        setTimeout(() => {
          setIsFetchingPaused(false);
        }, 10000);
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
    window.localStorage.setItem("klucz", value);
    console.log("Local storage changed!", value);
    window.dispatchEvent(new Event("storage"));
  };

  window.addEventListener("storage", () => {
    console.log("Change to local storage!");
    // ...
  });
  handleLocalStorage("left");
  const testFunction = () => {
    handleLocalStorage("right");
  };

  if (isLoading) return <span>Loading...</span>;

  if (isError) return <span>Error:</span>;

  return (
    <div className="container-fluid h-100 bg-light m-0 p-0 width-100 ">
      <div className="row width-100 custom-height-85">
        <div className="col-6">
          <PlayerComponent player={playerHome} />
        </div>
        <div className="col-6">
          <PlayerComponent player={playerAway} />
        </div>
      </div>
      <div className="row custom-height-15">
        <div className="col">
          <button className="btn btn-primary">
            <i className="bi bi-arrow-repeat"></i>
          </button>{" "}
        </div>
      </div>
    </div>
  );
}

export default Board;
