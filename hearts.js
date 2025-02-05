import * as cards from "./cards.js";

const deck = cards.createDeck();
let trick = [];
export const players= [
{name: "player 1", hand: [], points: 0},
{name: "player 2", hand: [], points: 0},
{name: "player 3", hand: [], points: 0},
{name: "player 4", hand: [], points: 0}
]; // players

let context = null;
export function startNewGame (_context = document) {
if (not(_context)) throw new Error("No context! Aborting...");
context = _context;

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

export async function playTurn (startIndex) {
let index = startIndex;
do {
const player = players[index];
//console.log(index, ": ", player);

if (index === 0) {
await userPlayedCard();
} else {
const player = players[index];
const selection = playCard(selectCard(player), player);
} // if

index = (index+1) % players.length;
console.log("new index: ", index);
} while (index !== startIndex);
} // playTurn

function selectCard (player) {
if (player.hand.length === 0) return -1;
const index = cards.randomInteger(0, player.hand.length);
return index;
} // selectCard

export function playCard (index, player = players[0]) {
if (trick.length === players.length) return "trick is full";
else if (player.hand.length === 0) return `${player.name} has no more cards`;
else if (index < 0 || index >= player.hand.length) return "invalid card; index out of bounds.";
else {
player.hand.splice(index, 1);
return player.hand;
} // if
} // playCard

export async function userPlayedCard (context) {
return new Promise((resolve) => {
displayMessage("Your turn.");

document.addEventListener("cardPlayed", e => resolve(e.target.selectedIndex));
});
} // userPlayedCard 


export function displayMessage (text) {
//setTimeout(() => {
document.querySelector("#status").textContent = text
//}, 200);
} // displayMessage


function not (x) {return !x;}
