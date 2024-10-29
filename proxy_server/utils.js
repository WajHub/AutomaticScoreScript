export function getNumberOfMatch(data) {
  if (data.tenis_stolowy.wynik[0].duze_punkty_gosp[0] === "") return 0;
  return (
    Number(data.tenis_stolowy.wynik[0].duze_punkty_gosp[0]) +
    Number(data.tenis_stolowy.wynik[0].duze_punkty_gosc[0]) +
    1
  );
}
export function getNumberOfSet(data, numberOfMatch) {
  const temp = "mecz" + numberOfMatch;
  try {
    return (
      Number(data.tenis_stolowy[temp][0].wynik[0].split(":")[0]) +
      Number(data.tenis_stolowy[temp][0].wynik[0].split(":")[1]) +
      1
    );
  } catch (e) {
    return 0;
  }
}

export function getHomePlayerName(data, numberOfMatch) {
  const temp = "mecz" + numberOfMatch;
  return data.tenis_stolowy[temp][0].nazwisko_gosp;
}

export function getAwayPlayerName(data, numberOfMatch) {
  const temp = "mecz" + numberOfMatch;
  return data.tenis_stolowy[temp][0].nazwisko_gosc;
}

export function getSetsHome(data, numberOfMatch) {
  const temp = "mecz" + numberOfMatch;
  return data.tenis_stolowy[temp][0].wynik[0].split(":")[0];
}

export function getSetsGuest(data, numberOfMatch) {
  const temp = "mecz" + numberOfMatch;
  return data.tenis_stolowy[temp][0].wynik[0].split(":")[1];
}

export function getPointsHome(data, numberOfMatch, numberOfSet) {
  const temp = "mecz" + numberOfMatch;
  return data.tenis_stolowy[temp][0].gosp_punkty[0].split(" ")[numberOfSet - 1];
}

export function getPointsAway(data, numberOfMatch, numberOfSet) {
  const temp = "mecz" + numberOfMatch;
  return data.tenis_stolowy[temp][0].gosc_punkty[0].split(" ")[numberOfSet - 1];
}

export function matchIsStarted(data, numberOfMatch) {
  const temp = "mecz" + numberOfMatch;
  return data.tenis_stolowy[temp] != undefined;
}
