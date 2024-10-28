import React from "react";
import { Player } from "../models/Player";

interface PlayerComponentProps {
  player: Player;
}

function PlayerComponent({ player }: PlayerComponentProps) {
  return (
    <div>
      Player name: {player.name}
      Points: {player.points}
      Sets; {player.sets}
    </div>
  );
}

export default PlayerComponent;
