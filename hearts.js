/// debugging flags
var queenAlert = false,
showHand = false,
showStrategy = false,
shootingHand = -1; // which player gets a shootable hand

import * as cards from "./cards.js";
import { not, sum, blockUntilEvent, dispatch } from "./utilities.js";
import { logMessage, errorMessage } from "./log.js";
import * as log from "./log.js";


/// variables global to module
const clubs = cards.clubs, spades = cards.spades, hearts = cards.hearts, diamonds = cards.diamonds;
const jack = cards.jack, queen = cards.queen, king = cards.king, ace = cards.ace;
const queenOfSpades = cards.createCard(queen, spades);

const deck = cards.createDeck();
export const players= [
{name: "player 1", hand: [], score: 0, tricks: [], strategy: null},
{name: "player 2", hand: [], score: 0, tricks: [], strategy: null},
{name: "player 3", hand: [], score: 0, tricks: [], strategy: null},
{name: "player 4", hand: [], score: 0, tricks: [], strategy: null}
]; // players
let heartsBroken = false;
let roundCount = 0;
let seenQueenThisRound = false;

export function startNewGame () {
//console.debug("starting game...");

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
await playRound ();
logMessage(`<h3>Scores</h3>
${displayScores(players)}
</h3>`);
} // while

logMessage(`<h2 class="winners">${displayWinners(players)}</h2>`);
} // playGame

async function playRound () {
await userStartsRound();
heartsBroken = false;
seenQueenThisRound = false;
//console.debug("starting round ", roundCount);
logMessage(`<h2>Starting round ${roundCount}.</h2>`);
dealNewRound(shootingHand);
dispatch("updateHand", {hand: players[0].hand});
if (queenAlert) logMessage(`${players.find(player => hasQueenOfSpades(player.hand)).name} has the queen!`);

const trickList = [];
for (const player of players) {
player.tricks = [];
player.strategy = null;
} // for

let trickWinner = null;
while (not(roundComplete())) {
//console.debug("hearts.trickStart...");
log.trickStart();
trickWinner = await playTrick(trickWinner?.player);

//console.debug("trickWinner: ", trickWinner);
log.currentTrick(`${trickWinner.player.name} took ${displayTrick(trickWinner.trick)}.`);
if (heartsBroken && heartsBroken !== "displayOnce") {
//console.debug("hearts.hearts broken...");
log.currentTrick("Hearts have been broken.");
heartsBroken = "displayOnce";
} // if

//console.debug("trick complete.");
log.trickComplete();
} // while roundNotComplete()

logMessage(`End of round ${roundCount}.`);
dispatch("roundComplete");
} // playRound


async function playTrick (startingPlayer) {
let isFirstTrickInRound = not(startingPlayer);
const playerOrder = trickOrder(isFirstTrickInRound? indexOfPlayerHoldingTwoOfClubs() : players.indexOf(startingPlayer));
//console.debug("trick order is ", playerOrder.map(p => p.name).join(", "));

let player = null, trick = [];
for (player of playerOrder) {
const card = await playTurn(player, trick, isFirstTrickInRound);
trick.push({player, card});
//console.debug(`hearts: player.name} played ${cards.displayCard(card)}.`);
log.currentTrick(`${player.name} played ${cards.displayCard(card)}.`);

isFirstTrickInRound = false;
if (isHumanPlayer(player)) dispatch("updateHand", {hand: player.hand});
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
//console.debug("first trick in round");
card = cards.nameToCard("2c");
} else {
card = isHumanPlayer(player)? await userCardPlayed()
: selectCard(player, suit, trick);
} // if
//console.debug(`player ${player.name} selected ${cards.displayCard(card)}`);

error = playCard(card, suit, player);
//console.debug("- card played: ", card, ", by ", player.name, ", error = ", error);

if (error) {
errorMessage(error);
if (not(isHumanPlayer(player))) {
console.debug(`AI error: ${error}`);
debugger;
} // if

} // if
} while (error && isHumanPlayer(player));

return card;
} // playTurn

export async function userCardPlayed (context) {
setTimeout(() => {
//console.debug("hearts.your turn");
log.prompt("Your turn.");
}, 400);
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
errorMessage("this should never be called with human player!");
//console.debug("this should never be called with human player: ", player);
debugger;
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
const onlyHearts = player.hand.every(card => card.suit === hearts);

if (card.suit === hearts && not(onlyHearts) && not(heartsBroken)) return "Hearts have not been broken; try again.";

} else {
// follow suit
const playerHasSuit = cards.findLowestCardInSuit(suit, player.hand);
if (playerHasSuit && card.suit !== suit) return `You must follow suit; ${cards.suitNames[suit]} is in play.`;
} // if
} // if

heartsBroken = heartsBroken || (card.suit === hearts);
seenQueenThisRound = seenQueenThisRound || cards.isCard(card, queenOfSpades);
const index = indexOfCardInHand(card, player.hand);
if (index >= 0) {
player.hand.splice(index, 1)[0];
return "";
} else {
return "error: card ${displayCard(card)} not found in hand; this should not happen";
} // if
} // playCard


/// strategies

function chooseStrategy (hand, suit, trick) {
const player = players.find(p => p.hand === hand);
if (showHand) logMessage(`${player.name} has: ${displayCards(player.hand)}`);

if (hasChanceOfShootingTheMoon(hand)) {
if (showStrategy) logMessage(`${player.name} is attempting to shoot the moon.`);
return shootingStrategy;
/*} else if (hasQueenOfSpades(hand)) {
if (showStrategy) logMessage(`${player.name} is trying to get rid of the queen.`);
return getRidOfQueenStrategy;
*/
} else {
if (showStrategy) logMessage(`${player.name} is ducking...`);
return chooseDuckingStrategy();
} // if
} // chooseStrategy

function chooseDuckingStrategy (probability = 1) {
return Math.random() < probability? duckingStrategy1 : duckingStrategy2;
} // chooseDuckingStrategy

function executeStrategy (strategy, hand, suit, trick) {
try {
return strategy(hand, suit, trick);
} catch (e) {
//console.error(e);
debugger;
} // try
} // executeStrategy


function duckingStrategy1 (hand, suit, trick) {
const player = players.find(p => p.hand === hand);
const isFirstCardInTrick = trick.length === 0;
const isFirstTrickInRound = hand.length === 13;

// indexed by suit
const myHand = organizeBySuit(hand);
const [myClubs, mySpades, myHearts, myDiamonds] = myHand;
const myOtherSpades = mySpades.filter(card => card.rank !== queen);
const hasQueenOfSpades = mySpades.length !== myOtherSpades.length;

if (hand.length === 1 ) return hand[0];

if (isFirstCardInTrick) {
const list = hasQueenOfSpades? shortestList(myClubs, myDiamonds)
: seenQueenThisRound? shortestList(myClubs, myDiamonds, mySpades)
: cards.findLowestCardInList(mySpades)?.rank < queen? mySpades
: heartsBroken? myHearts
: hand.filter(card => card.suit !== hearts);

return (
hasQueenOfSpades? cards.findHighestCardInList(list) 
: list[0]?.[0]?.suit === hearts? cards.findLowestCardInList(list)
: cards.findLowestCardInList(list)
) || cards.findLowestCardInList(hand);

} else {
// try to follow suit

if (myHand[suit].length === 0)
return hasQueenOfSpades? queenOfSpades
: cards.rank(mySpades, king) > 0? cards.findHighestCardInList(mySpades)
: (cards.findHighestCardInList(myHearts) || cards.findHighestCardInList(hand));

if (suit !== spades)
return hasQueenOfSpades? cards.findHighestCardInSuit(suit,hand)
: cards.findLowestCardInSuit(suit, hand);

// dump queen if higher card already on trick
if (hasQueenOfSpades && cards.rank(cardsInTrick(trick), king).length > 0) return queenOfSpades;

return hasQueenOfSpades? (cards.findHighestCardInList(myOtherSpades) || queenOfSpades)
: cards.findLowestCardInList(mySpades);
} // if
} // duckingStrategy1

function duckingStrategy2 (hand, suit, trick) {
const isFirstCardInTrick = trick.length === 0;

if (isFirstCardInTrick) {

if (heartsBroken) {
if (cards.rank(cards.hasSuit(hearts, hand), 2, 4).length > 0) return cards.findLowestCardInSuit(hearts, hand);
} // if

return cards.findLowestCardInList(shortestSuitInList(hand.filter(card => card.suit !== hearts)))
|| cards.findLowestCardInList(hand);

} else {
return cards.findLowestCardInSuit(suit, hand)
|| cards.findHighestCardInSuit(hearts, hand)
|| cards.findLowestCardInList(hand);
} // if
} // duckingStrategy2


function getRidOfQueenStrategy (hand, suit, trick) {
/* Strategy
- never lead a spade unless it's the only suit
- only lead the queen if it's the only card you have left
- dump queen if you have no members of the lead suit
- dump queen if a higher spade has already been played on current trick
- throw away cards in your shortest suit in order to create a way to dump the queen
- prefer to keep higher cards in order to lead tricks so you have more control over what cards you play
*/

const firstCardInTrick = trick.length === 0;
const theQueen = cards.nameToCard("qs");

//console.debug("getRidOfQueenStrategy:");
const player = players.find(p => p.hand === hand);
if (not(hasQueenOfSpades(hand))) {
player.strategy = chooseDuckingStrategy();
return player.strategy(hand, suit, trick);
} // if
if (hand.length === 1 && cards.isCard(hand[0], theQueen)) return theQueen;

const myHand = organizeBySuit(hand);
const mySuits = shortestList(...myHand);
const [myClubs, mySpades, myHearts, myDiamonds] = myHand;
const myOtherSpades = mySpades.filter(card => card.rank !== queen);
const onlyHearts = hand.every(card => card.suit === hearts);
const onlySpades = hand.every(card => card.suit === spades);


if (firstCardInTrick) {
//console.debug("- firstCardInTrick");
if (onlySpades) return cards.findHighestCardInList(myOtherSpades);
if (heartsBroken) return cards.findHighestCardInList(shortestList(myHearts, myClubs, myDiamonds)[0]);
if (myClubs.length > 0 || myDiamonds.length > 0) return cards.findHighestCardInList(shortestList(myClubs, myDiamonds)[0]);

// hearts not broken and only hearts and spades left
if (myOtherSpades.length > 0) return cards.findHighestCardInList(myOtherSpades);

// no other choice
return theQueen;


} else {
// follow suit
let list = myHand[suit];

if (list.length === 0) return theQueen;
else if (suit === clubs || suit === diamonds) return cards.findHighestCardInList(list);
else if (suit === hearts) return cards.findLowestCardInList(list);

// suit is spades
//console.debug("- follow suit in spades");

let card;
// dump queen if someone already played a higher spade
list = cardsInTrick(trick).filter(card => card.rank > queen && card.suit === spades);
if (list.length > 0) return theQueen;
if (myOtherSpades.length > 0) return cards.findHighestCardInList(myOtherSpades);
else return theQueen;
} // if

//console.debug("getRidOfQueen: fall through - this should never happen");
debugger;
} // getRidOfQueenStrategy

function createShootingHand () {
console.debug("createShootingHand:");
const hand = cards.cardList(
"ac kc as ks qs 6s ah kh qh 8h 3c 5s jd".split(" ")
);
console.debug(`- hand: ${displayCards(hand)}`);

deck.takeCards(hand);
console.debug(`deck length: ${deck.cards.length}`);

return hand;
} // createShootingHand

function shootingStrategy (hand, suit, trick) {
/* Shooting the moon
- must have high cards (hopefully ace, king, queen) in 2 or hopefully 3 suits (best if one of them is hearts)
- get rid of low cards first while hearts probably won't be thrown
- try to keep the lead as much as possible and push suits you know you can win
- take tricks in long suits first to break hearts
- take as many hearts as you can
- having the queen in your hand at the start is preferable / easier
*/

const player = players.find(p => p.hand === hand);
// if someone other than you took a trick this round, abandon shooting strategy
const allPoints = players.filter(p => p !== player && calculatePointsThisRound(p));
if (allPoints.length > 1) {
player.strategy = hasQueenOfSpades(hand)? getRidOfQueenStrategy : duckingStrategy;
return player.strategy(hand, suit, trick);
} // if

const myHand = organizeBySuit(hand);
const mySuits = shortestList(...myHand).reverse();
const [myClubs, mySpades, myHearts, myDiamonds] = myHand;
const firstTrickInRound = hand.length === 13;
const firstCardInTrick = trick.length === 0;

if (firstTrickInRound && firstCardInTrick) {
console.error("both firstTrickInRound and firstCardInTrick cannot be true");
debugger;
} // if

if (not(heartsBroken) && mySuits[0].suit === hearts) {
mySuits.shift();
mySuits.push(hearts);
} // if

if (firstCardInTrick) {
if (heartsBroken) {
if (myHearts.length > 0) return cards.findHighestCardInList(myHearts);
} // if

return cards.findHighestCardInList(hand.filter(card => card.suit !== hearts));

} else {
const list = myHand[suit].length > 0? myHand[suit] : mySuits[0];
return cards.findHighestCardInList(list);
} // if
} // shootingStrategy

export function dealNewRound (playerIndex = -1) {
const cheater = playerIndex >= 0 && playerIndex <= 3? players[playerIndex] : null;
if (cheater) cheater.hand = createShootingHand(cards.createDeck(deck));
const dealer = cards.dealer(deck);

for (const player of players) {
if (player === cheater) continue;
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
//console.debug("assignTrick: ", trick);
const suit = trick[0].card.suit;
const player = trick.sort(trickHighCardFirst ).filter(item => item.card.suit === suit)[0].player;
player.tricks.push(trick);
//console.debug(`- ${player.name} took trick `, trick, " with suit ", suit);

const points = calculatePoints(cardsInTrick(trick));
player.score += points;
//console.debug(`- ${points} added to ${player.name}`);
return player;
} // assignTrick

function calculatePoints (cards) {
return cards.reduce((score, card) => score + cardScore(card), 0);
} // calculatePoints

function cardScore (card) {
if (card.suit === hearts) return 1;
if (cards.isCard(card, queenOfSpades)) return 13;
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

function findHighestCardInTrick(trick) {
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
return Math.max(...players.map(p => p.score));
} // highestScore

function displayScores (players) {
return `<div class="scores"><pre>
${players.map(p => `${p.name}: ${p.score}`).join("\n")}
</pre></div>
`;
} // displayScores

function displayWinners (players) {
const all = players.sort((p1,p2) => p1.score < p2.score? -1 : 1);
const winners = all.filter(p => p.score === all[0].score);
return `${winners.map(p => p.name).join(", and ")} won with score ${winners[0].score}.`;
} // displayWinners

export async function userStartsRound () {
//console.debug("userStartsRound:");
//setTimeout(() => 
log.prompt("Press control+enter to start a new round.")
//, 200);
let e;
while (e = await blockUntilEvent("userCommand")) {
//console.debug(e);
if (e.command === "newRound") return;
} // while
} // userStartsRound

function organizeBySuit (list) {
return [0,1,2,3].map(suit => list.filter(card => card.suit === suit));
} // organizeBySuit

function orderBySuit (suits, order = shortestSuitFirst) {
return suits.map((list, suit) => ({suit, list}))
.sort(order);
} // orderBySuit

function shortestSuitInList (list) {
return organizeBySuit(list)
.filter(list => list.length > 0)
.sort((l1, l2) => l1.length < l2.length? -1 : 1)
[0];
} // shortestSuitInList

function shortestList (...lists) {
return orderLists(...lists)[0] || [];
} // shortestList

function orderLists (...lists) {
return lists.sort((l1, l2) => l1.length <= l2.length? -1 : 1)
.filter(l => l.length > 0);
} // orderLists

function shortestSuitFirst (s1, s2) {
return s1.list.length <= s2.list.length? -1 : 1;
} // shortestSuitFirst

function longestSuitFirst (s1, s2) {
return s1.list.length >= s2.list.length? -1 : 1;
} // longestSuitFirst

function findHighCardStraights (hand) {
return [0,1,2,3].map(suit => highCardStraight(suit, hand));
} // findHighCardStraights

function findHighCardStraight (suit, hand) {
const all = cards.hasSuit(suit, hand).sort(cards.highCardFirst);
if (all.length > 0 && all[0].rank === ace || all[0].rank === king) {
let rank = all[0].rank;
return all.filter(card => card.rank === rank--);
} // if

return [];
} // findHighCardStraight

function calculatePointsThisRound (player) {
const points = player.tricks.map(trick => calculatePoints(cardsInTrick(trick)));

// if someone shot the moon, increase everyone else's score by 26
const moonIndex = points.findIndex(p => p === 26);
if (moonIndex >= 0) points = points.map((p, i) => i === moonIndex? p : p+26);

return sum(points);
} // calculatePointsThisRound


function hasQueenOfSpades (hand) {
return cards.has(cards.nameToCard("qs"), hand);
} // hasQueenOfSpades

function hasTwoOfClubs (hand) {
return cards.has(cards.createCard(2, clubs), hand);
} // hasTwoOfClubs


function hasChanceOfShootingTheMoon (hand) {
return cards.rank(hand, jack).length >= 8 && cards.rank(cards.hasSuit(hearts, hand), queen).length === 3;
} // hasChanceOfShootingTheMoon 

function _hasChanceOfShootingTheMoon (hand) {
return cards.hasRank(jack, ace, cards.hasSuit(hearts, hand)).length === 4
&& cards.hasRank(queen, ace, cards.hasSuit(spades, hand)).length === 3
&& (cards.hasRank(queen, ace, cards.hasSuit(clubs, hand)).length === 3
|| cards.hasRank(queen, ace, cards.hasSuit(diamonds, hand)).length === 3 
);
} // _hasChanceOfShootingTheMoon


//alert("hearts module loaded");
