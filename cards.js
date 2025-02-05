function createDeck () {
return {
cards: createCards(),
order: range(0,51),
* dealer () {
for (let value of this.order.values()) {
yield this.cards[value];
} // for
return this;
} // iterator
}; // deck
} // createDeck

function shuffleDeck (deck) {
deck.order = new Array(52).fill(-1);

let slot = 0;
while (slot <= 51) {
const n = randomInteger(0,51);
if (deck.order.includes(n)) continue;
deck.order[slot] = n;
slot += 1;
} // for

return deck;
} // shuffleDeck

function createCards () {
const cards = [];
for (let suit = 0; suit <= 3; suit++) {
for (let rank = 2; rank <= 14; rank++) {
cards.push(createCard(rank, suit));
} // for rank
} // for suit

return cards;
} // createCards

function createCard (rank, suit) {
return {rank, suit};
} // createCard

function displayCard (card) {
const faceCards = ["jack", "queen", "king", "ace"];
const suitNames = ["clubs", "spades", "hearts", "diamonds"];

const rank = (card.rank <= 10? card.rank : faceCards[card.rank-11]).toString();
const suit = suitNames[card.suit];
return rank + " of " + suit;
} // displayCard

function range (_n1, _n2) {
const n1 = Math.min(_n1, _n2);
const n2 = Math.max(_n1, _n2);
const result = [];
for (let n = n1; n <= n2; n++) result.push(n);

return result;
} // range

function randomInteger (_n1, _n2) {
const n1 = Math.min(_n1, _n2);
const n2 = Math.max(_n1, _n2);
return Math.floor(Math.random() * (n2-n1 + 1) + n1);
} // randomInteger

function dealer (deck) {
return shuffleDeck(deck).dealer();
} // dealer

function dealCards (dealer, count = 1) {
const result = [];

while (count-- > 0) {
current = dealer.next();
if (current.done) break;
result.push(current.value);
console.log(count, ": ", current.done, ", ", current.value);
} // while

return result;
} // dealCards

function createHand (dealer, count) {
hand = [
[], // clubs
[], // spades
[], // hearts
[] // diamonds
];
const list = [];

for (card of dealCards(dealer, count)) hand[card.suit].push(card);

for (let suit of hand) {
suit = suit.sort(cardRank);
for (card of suit) list.push(displayCard(card));
} // suit

return list;

function cardRank (c1, c2) {
return c1.rank < c2.rank? 1 : -1;
} // cardRank
} // createHand

