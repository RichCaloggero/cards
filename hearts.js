import * as cards from "./cards.js";

const deck = cards.createDeck();
let trick = [];
export const players= [
{name: "player 1", hand: [], points: 0},
{name: "player 2", hand: [], points: 0},
{name: "player 3", hand: [], points: 0},
{name: "player 4", hand: [], points: 0}
]; // players

export function startNewGame (context = document) {
//if (not(context)) throw new Error("No context! Aborting...");

let trick = [];
for (const player of players) {
player.points = 0;
player.hand = [];
} // for

} // startNewGame

export function dealNewHand () {
trick = [];
const dealer = cards.dealer(deck);

for (const player of players) {
player.hand = cards.createHand(dealer, 13);
} // for


return players[0].hand;
} // dealNewHand

export function playCard (index, player = players[0]) {
if (trick.length === players.length) return "trick is full";
else if (player.hand.length === 0) return `${player.name} has no more cards`;
else {
player.hand.splice(index, 1);
return player.hand;
} // if
} // playCard
function not (x) {return !x;}
