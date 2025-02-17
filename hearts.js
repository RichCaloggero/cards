import * as cards from "./cards.js";
import { not, atLeast, userMessage, errorMessage, blockUntilEvent, dispatch } from "./utilities.js";


/// variables global to module

const deck = cards.createDeck();
export const players= [
{name: "player 1", hand: [], score: 0, tricks: [], strategy: null},
{name: "player 2", hand: [], score: 0, tricks: [], strategy: null},
{name: "player 3", hand: [], score: 0, tricks: [], strategy: null},
{name: "player 4", hand: [], score: 0, tricks: [], strategy: null}
]; // players
let heartsBroken = false;
let roundCount = 0;

export function startNewGame () {
console.log("starting game...");

for (const player of players) {
player.score = 0;
player.hand = [];
player.tricks = [];
} // for

playGame();
} // startNewGame

async function playGame () {
roundCount = 0;

while (not(gameComplete())) {
roundCount += 1;
await playRound (roundCount);
userMessage(displayScores(players));
} // while
} // playGame

async function playRound (roundCount) {
await userStartsRound();
heartsBroken = false;
console.log("starting round ", roundCount);
userMessage(`Starting round ${roundCount}.`);
dealNewRound();
dispatch("updateHand", {hand: players[0].hand});
const trickList = [];
players.forEach(player => player.strategy = null);

let trickWinner = null;
while (not(roundComplete())) {
trickWinner = await playTrick(trickWinner?.player);
//console.log("trickWinner: ", trickWinner);
userMessage(`${trickWinner.player.name} took ${displayTrick(trickWinner.trick)}.`);
if (heartsBroken) userMessage("Hearts have been broken.");
} // while roundNotComplete()

userMessage(`End of round ${roundCount}.`);
} // playRound


async function playTrick (startingPlayer) {
let isFirstTrickInRound = not(startingPlayer);
const playerOrder = trickOrder(isFirstTrickInRound? indexOfPlayerHoldingTwoOfClubs() : players.indexOf(startingPlayer));
console.log("trick order is ", playerOrder.map(p => p.name).join(", "));

let player = null, trick = [];
for (player of playerOrder) {
const card = await playTurn(player, trick, isFirstTrickInRound);
trick.push({player, card});
isFirstTrickInRound = false;
if (isHumanPlayer(player)) dispatch("updateHand", {hand: player.hand});

userMessage(`${player.name} played ${cards.displayCard(card)}.`);
} // while

const winner = assignTrick(trick);
return {trick, player: winner};
} // playTrick

async function playTurn (player, trick, isFirstTrickInRound) {
const isFirstCardInTrick = trick.length === 0;
const suit = not(isFirstCardInTrick)? trick[0].card.suit : -1;
let card = null;

let error = null;
do {
if (isFirstTrickInRound) {
//console.log("first trick in round");
card = cards.nameToCard("2c");
} else {
card = isHumanPlayer(player)? await userCardPlayed()
: selectCard(player, suit);
} // if
console.log(`player ${player.name} selected ${cards.displayCard(card)}`);

error = playCard(card, suit, player);
//console.log("- card played: ", card, ", by ", player.name, ", error = ", error);

if (error) {
errorMessage(error);
if (not(isHumanPlayer(player))) throw new Error(`AI error: ${error}`);
} // if
} while (error && isHumanPlayer(player));

return card;
} // playTurn

export async function userCardPlayed (context) {
userMessage("Your turn.");
const e = await blockUntilEvent("userCardPlayed");
return e.card;
} // userCardPlayed

function isHumanPlayer (player) {return player === players[0];}

function trickOrder (startIndex) {
return reorder(startIndex).map(index => players[index]);
} // trickOrder

function reorder (startIndex, length = 4) {
if (startIndex > length || startIndex < 0) throw new Error(`reorder: start index out of bounds; ${startIndex}`);
let index = startIndex;
const order = [];
do {
order.push(index);
index = (index+1) % length;
} while(index !== startIndex);

return order;
} // reorder

function selectCard (player, suit) {
if (isHumanPlayer(player)) {
userMessage("this should never be called with human player!");
console.log("this should never be called with human player: ", player);
return null;
} // if

const hand = player.hand;
const isFirstTrickInRound = hand.length === 13;

if (hand.length === 0) return "no cards left in hand; should never happen";

if (isFirstTrickInRound || player.strategy === null /* because player had two of clubs */) player.strategy = chooseStrategy(hand, suit);
return executeStrategy(player.strategy, hand, suit);
} // selectCard

function playCard (card, suit, player) {
const isFirstCardInTrick = suit < 0;
const hearts = cards.suitNames.indexOf("hearts");

if (player.hand.length === 0) return `${player.name} has no more cards`;

/// checks on human player
if (isHumanPlayer(player)) {
if (isFirstCardInTrick) {
if (card.suit === hearts && not(heartsBroken)) return "Hearts have not been broken; try again.";

} else {
// follow suit
const playerHasSuit = cards.findLowestCardInSuit(suit, player.hand);
if (playerHasSuit && card.suit !== suit) return `You must follow suit; ${cards.suitNames[suit]} is in play.`;
} // if
} // if

heartsBroken = heartsBroken || (card.suit === hearts);
const index = indexOfCardInHand(card, player.hand);
if (index >= 0) {
player.hand.splice(index, 1)[0];
return "";
} else {
return "error: card not found in hand; this should not happen";
} // if
} // playCard


/// strategies

function chooseStrategy (hand, suit) {
if (hasChanceOfShootingTheMoon(hand)) {
userMessage("I don't know how to shoot the moon yet, so ducking instead.");
return duckingStrategy;
} else if (hasQueenOfSpades(hand)) {
userMessage("I don't know how to get rid of the queen yet, so ducking instead.");
return duckingStrategy;
} else return duckingStrategy;
} // chooseStrategy

function executeStrategy (strategy, hand, suit) {
try {
return strategy(hand, suit);
} catch (e) {
userMessage(e);
debugger;
} // try
} // executeStrategy

function duckingStrategy (hand, suit) {
const isFirstCardInTrick = suit < 0;
const hearts = cards.suitNames.indexOf("hearts");
let card = null;

if (isFirstCardInTrick) {
if (heartsBroken) card = cards.findLowestCardInList(hand);
else card =
cards.findLowestCardInList(hand.filter(c => c.suit !== hearts))
|| cards.findLowestCardInList(hand);

} else {
card = cards.findLowestCardInSuit(suit, hand)
|| cards.findLowestCardInSuit(hearts, hand)
|| cards.findLowestCardInList(hand);
} // if

return card;
} // duckingStrategy

function getRidOfQueenStrategy (hand, suit) {
userMessage("I don't know how to get rid of the queen yet.");
} // shootingStrategy

function shootingStrategy (hand, suit) {
userMessage("I don't know how to shoot the moon yet.");
} // shootingStrategy

export function dealNewRound () {
const dealer = cards.dealer(deck);

for (const player of players) {
player.hand = cards.createHand(dealer, 13);
} // for
} // dealNewHand

function roundNotComplete() {
return players[0].hand.length > 0;
} // roundNotComplete

function indexOfCardInHand (card, hand) {
return hand.findIndex(c => cards.isCard(card, c));
} // indexOfCardInHand


function indexOfPlayerHoldingTwoOfClubs () {
return players.findIndex(player => hasTwoOfClubs(player.hand));
} // selectPlayerHoldingTwoOfClubs

function assignTrick (trick) {
const suit = trick[0].card.suit;
trick = trick.sort(trickHighCardFirst );
const item = trick.find(item => item.card.suit === suit);
const player = item.player;
player.tricks.push(trick);

const cards = cardsInTrick(trick);
player.score += trickScore(cards);
return player;
} // assignTrick

function trickScore (cards) {
return cards.reduce((score, card) => score + cardScore(card), 0);
} // trickScore

function cardScore (card) {
const hearts = cards.suitNames.indexOf("hearts");

if (card.suit === hearts) return 1;
if (cards.isCard(card, cards.nameToCard("qs"))) return 13;
return 0;
} // cardScore

function displayTrick (trick) {
return cardsInTrick(trick).map(cards.displayCard).join(", ").slice(0, -1);
} // displayTrick


export function displayCards (cardList) {
return cardList.map(cards.displayCard).join(", ");
} // displayCards

function trickHighCardFirst (x1, x2) {
return cards.highCardFirst(x1.card, x2.card);
} // trickHighCardFirst 

function highestCardInTrick(trick) {
return sortTrickHighestCardFirst (trick)[0].card;
} // highestCardInTrick

function cardsInTrick (trick) {
return trick.map(x => x.card);
} // cardsInTrick

function gameComplete () {
return highestScore() >= 100;
} // gameComplete

function roundComplete () {
return players[0].hand.length === 0;
} // roundComplete

function highestScore () {
return players.map(p => p.score)
.reduce((score, player) => score = player.score > score? player.score : score, 0)
} // highestScore

function displayScores (players) {
return "<pre>\n"
+ players.map(p => `${p.name}: ${p.score}`).join("\n")
+ "</pre>\n";
} // displayScores



export async function userStartsRound () {
setTimeout(() => userMessage("Press control+enter to start a new round."), 200);
let e;
while (e = await blockUntilEvent("userCommand")) {
console.log(e);
if (e.command === "newRound") return;
} // while
} // userStartsRound

function hasQueenOfSpades (hand) {
return cards.has(cards.nameToCard("qs"), hand);
} // hasQueenOfSpades

function hasTwoOfClubs (hand) {
return cards.has(cards.nameToCard("2c"), hand);
} // hasTwoOfClubs

function hasChanceOfShootingTheMoon (hand) {
const has = cards.has;
const is = cards.nameToCard;

return atLeast(5, // of the following conditions met
has(is("ah"), hand),
has(is("kh"), hand),
has(is("qh"), hand),
has(is("jh"), hand),
has(is("10h"), hand),
has(is("9h"), hand),
has(is("8h"), hand))
&& hasQueenOfSpades(hand);
} // hasChanceOfShootingTheMoon


//alert("hearts module loaded");
