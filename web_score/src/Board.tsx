import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import PlayerComponent from "./components/PlayerComponent";
import { Player } from "./models/Player.tsx";

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

  // const handleLocalStorage = (value: string) => {
  //   window.localStorage.setItem("klucz", value);
  //   console.log("Local storage changed!", value);
  //   window.dispatchEvent(new Event("storage"));
  // };

  // window.addEventListener("storage", () => {
  //   console.log("Change to local storage!");
  //   // ...
  // });
  // handleLocalStorage("left");
  // const testFunction = () => {
  //   handleLocalStorage("right");
  // };

  if (error) {
    console.log("Error:", error);
    return <span>Error:</span>;
  }

  if (isError) {
    console.log("Error:", error);
    return <span>Error:</span>;
  }

  return (
    <div>
      Wynik meczu:
      <PlayerComponent player={playerHome} />
      <PlayerComponent player={playerAway} />
      <button className="btn btn-primary">TEST</button>
    </div>
  );
}

export default Board;
