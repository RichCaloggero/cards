// cheats
var queenAlert = true;

import * as cards from "./cards.js";
import { not, atLeast, userMessage, errorMessage, blockUntilEvent, dispatch } from "./utilities.js";


/// variables global to module
const clubs = cards.clubs, spades = cards.spades, hearts = cards.hearts, diamonds = cards.diamonds;
const jack = cards.jack, queen = cards.queen, king = cards.king, ace = cards.ace;

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
if (queenAlert) userMessage(`${players.find(player => hasQueenOfSpades(player.hand)).name} has the queen!`);

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
: selectCard(player, suit, trick);
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

function selectCard (player, suit, trick) {
if (isHumanPlayer(player)) {
userMessage("this should never be called with human player!");
console.log("this should never be called with human player: ", player);
return null;
} // if

const hand = player.hand;
const isFirstTrickInRound = hand.length === 13;

if (hand.length === 0) return "no cards left in hand; should never happen";

if (isFirstTrickInRound || player.strategy === null /* because player had two of clubs */) player.strategy = chooseStrategy(hand, suit);
return executeStrategy(player.strategy, hand, suit, trick);
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

function chooseStrategy (hand, suit, trick) {
if (hasChanceOfShootingTheMoon(hand)) {
userMessage("I don't know how to shoot the moon yet, so ducking instead.");
return duckingStrategy;
} else if (hasQueenOfSpades(hand)) {
return getRidOfQueenStrategy;
} else return duckingStrategy;
} // chooseStrategy

function executeStrategy (strategy, hand, suit, trick) {
try {
return strategy(hand, suit, trick);
} catch (e) {
console.error(e);
debugger;
} // try
} // executeStrategy

function duckingStrategy (hand, suit, trick) {
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

function getRidOfQueenStrategy (hand, suit, trick) {
if (not(hasQueenOfSpades(hand))) return duckingStrategy(hand, suit, trick);


const firstCardInTrick = suit < 0;
const theQueen = cards.nameToCard("qs");

if (firstCardInTrick) {
const shortSuits = heartsBroken?
hasShortSuit(hand).filter(suit => suit !== spades)
: hasShortSuit(hand).filter(suit => suit !== hearts && suit !== spades);

const card = shortSuits.length > 0?
cards.findLowestCardInSuit(shortSuits[0], hand)
: cards.findLowestCardInList(
hand.filter(card => card.suit !== spades)
.filter(card => heartsBroken? card : card.suit !== hearts)
);

return card? card : cards.findLowestCardInList(hand);

} else {
// follow suit

if (suit === spades ) {
let card;
const myOtherSpades = cards.hasSuit(spades, hand).filter(card => not(cards.isCard(card, theQueen)));
if (cards.hasSuit(spades, cardsInTrick(trick)).filter(card => card.rank > queen)) return theQueen;
else card = cards.findLowestCardInList(cards.hasSuit(spades, myOtherSpades));
return card? card : theQueen;

} else {
const mySuit = cards.hasSuit(suit, hand);
return mySuit.length > 0? cards.findLowestCardInList(mySuit)
: theQueen;
} // if
} // if
} // getRidOfQueenStrategy

function shootingStrategy (hand, suit, trick) {
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

function hasShortSuit (hand, maxSize = 2) {
return [0,1,2,3].filter(suit => cards.hasSuitSize(suit, maxSize, hand)).sort();
} // hasShortSuit


function hasChanceOfShootingTheMoon (hand) {

return cards.hasRank(9, 14, cards.hasSuit(hearts, hand))
&& hand.filter(card => card.suit !== hearts && card.rank > 9) >= 4
&& hasQueenOfSpades(hand);
} // hasChanceOfShootingTheMoon


//alert("hearts module loaded");
