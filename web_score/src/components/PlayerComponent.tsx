import { Player } from "../models/Player";

interface PlayerComponentProps {
  player: Player;
  isHome: boolean;
}

function PlayerComponent({ player, isHome }: PlayerComponentProps) {
  return (
    <div
      className={
        "" +
        (isHome ? "playerHome" : "playerAway") +
        " h-100 w-100 p-0 m-0 text-white font-weight-bold"
      }
    >
      <div className="container">
        <div className="row ">
          <div className="col display-4 text-center pt-3">{player.name}</div>
        </div>
      </div>
      <div className="container">
        <div className="row ">
          <div
            className="col display-1 pt-3 text-center"
            style={{ fontSize: "20rem" }}
          >
            {player.points}
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row ">
          <div
            className="col display-1 pt-3 text-center"
            style={{ fontSize: "5rem" }}
          >
            {player.sets}
          </div>
        </div>
      </div>
      {player.timeOut ? (
        <div className="container">
          <div className="row ">
            <div className="col display-1 pt-3 text-center time_out">
              TIME-OUT
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default PlayerComponent;
