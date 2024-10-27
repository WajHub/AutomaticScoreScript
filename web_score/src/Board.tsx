import { useParams } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import PlayerComponent from "./components/PlayerComponent";
import { Player } from "./models/Player.tsx";

function getNumberOfMatch(data: any): number {
  if (data.tenis_stolowy.wynik[0].duze_punkty_gosp[0] === "") return 0;
  return (
    Number(data.tenis_stolowy.wynik[0].duze_punkty_gosp[0]) +
    Number(data.tenis_stolowy.wynik[0].duze_punkty_gosc[0]) +
    1
  );
}

function getPlayer(numberOfMatch: number, data: any, kind: string): Player {
  if (numberOfMatch == 0)
    return { name: "", points: 0, sets: 0, timeOut: false };
  if (kind == "gosp") {
    console.log(data.gosp_punkty[0].split(" "));
    return {
      name: data.nazwisko_gosp,
      points: 0,
      sets: 0,
      timeOut: false,
    };
  } else
    return {
      name: data.nazwisko_gosc,
      points: 0,
      sets: 0,
      timeOut: false,
    };
}

function Board() {
  const { id } = useParams();
  const [numberOfMatch, setNumberOfMatch] = useState<number>(0);
  const [playerHome, setPlayerHome] = useState<Player>({
    name: "",
    points: 0,
    sets: 0,
    timeOut: false,
  });
  const [playerGuest, setPlayerGuest] = useState<Player>({
    name: "",
    points: 0,
    sets: 0,
    timeOut: false,
  });

  const { isLoading, error } = useQuery({
    queryKey: ["matchData", id],
    queryFn: async () =>
      await axios.get(`http://localhost:8080/${id}`).then((res) => {
        console.log(res.data);
        setNumberOfMatch(getNumberOfMatch(res.data));
        const temp = "mecz" + numberOfMatch;
        const match = res.data.tenis_stolowy[temp][0];
        console.log(match);
        setPlayerHome(getPlayer(numberOfMatch, match, "gosp"));
        setPlayerGuest(getPlayer(numberOfMatch, match, "gosc"));
        return res.data;
      }),
    refetchInterval: 10000,
  });

  if (isLoading) return "Loading...";
  if (error) return "An error occurred while fetching the user data. " + error;

  return (
    <div>
      Wynik meczu:
      <PlayerComponent player={playerHome} />
      <PlayerComponent player={playerGuest} />
    </div>
  );
}

export default Board;
