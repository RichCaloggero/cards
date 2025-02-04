function createDeck () {
return {
cards: createCards(),
order: range(0,51),
[Symbol.iterator]:  function* () {
for (let value of this.order.values()) {
yield this.cards[value];
} // for
} // iterator
}; // deck
} // createDeck

function shuffleDeck (deck) {
deck.order = new Array(52).fill(-1);

let slot = 0;
while (slot <= 51) {
const n = randomInteger(0,51);
console.log(slot, ": ", n);
if (deck.order.includes(n)) continue;
deck.order[slot] = n;
slot += 1;
} // for

return deck;
} // shuffleDeck

function createCards () {
const cards = [];
for (let suit = 0; suit <= 3; suit++) {
for (let n = 2; n <= 14; n++) {
cards.push(createCard(n, suit));
} // for n
} // for suit

return cards;
} // createCards

function createCard (rank, suit) {
return {rank, suit};
} // createCard

function displayCard (card) {
const rank = (card.rank <= 10? card.rank : ["jack", "queen", "king", "ace"][card.rank-10]).toString();
const suit = ["clubs", "spades", "hearts", "diamonds"][card.suit];
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
