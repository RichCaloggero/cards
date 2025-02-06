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

runGame();
} // startNewGame

function runGame () {
do {
dealNewRound();
trick = playRound(selectRoundStarter());
assignTrick(trick);
} while (highestScore() <= 100);

displayScores();
} // runGame

export function dealNewRound () {
const dealer = cards.dealer(deck);

for (const player of players) {
player.hand = cards.createHand(dealer, 13);
} // for

dispatch("newRound", {player: players[0]});
} // dealNewHand

export async function playRound (startIndex) {
let playerIndex = startIndex;
const trick = [];

do {
const player = players[playerIndex ];
//console.log(playerIndex , ": ", player.name);

const selection = playerIndex === 0? await userCardPlayed()
: selectCard(player);
//console.log("selection: ", selection);

const card = playCard(selection, player);
if (validCard(card)) {
//trick.push(card);
dispatch("cardPlayed", {hand: players[0].hand, card, player, playerIndex});

} else {
dispatch("error", {card});
} // if

playerIndex = (playerIndex+1) % players.length;
} while (playerIndex !== startIndex);
} // playRound

function selectCard (player) {
if (player.hand.length === 0) return -1;
return cards.randomInteger(0, player.hand.length-1);
} // selectCard

function playCard (index, player) {
if (trick.length === players.length) return "trick is full";
else if (player.hand.length === 0) return `${player.name} has no more cards`;
else if (index < 0 || index >= player.hand.length) return "invalid card; index out of bounds.";
else {
return player.hand.splice(index, 1)[0];
} // if
} // playCard

export async function userCardPlayed (context) {
dispatch("userMessage", {message: "Your turn."});
return new Promise((resolve) => {
document.addEventListener("userCardPlayed", e => resolve(e.index));
});
} // userPlayedCard 

function selectRoundStarter () {
return 2;
} // selectRoundStarter

function assignTrick (trick) {
} // assignTrick

function highestScore () {
return 101;
} // highestScore

function displayScores () {
dispatch("message", {message: "No scores available."});
} // displayScores

function validCard (card) {
return card instanceof Object && not(card instanceof Array) && not(card instanceof String);
} // validCard

export function dispatch (type, options) {
const event = Object.assign(new Event(type), options);
document.dispatchEvent(event);
} // dispatch

function not (x) {return !x;}
