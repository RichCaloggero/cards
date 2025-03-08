import { not } from "./utilities.js";
var $log = null;
var hideRounds = false;
var hideTricks = true;
var context = null;





export function initialize (log, status = log) {
$log = log;
context = $log;
} // initialize

export function clear () {
$log.innerHTML = "";
trickCount = roundCount = 0;
} // clear

export function roundStart (count) {
$(".round-start.current")?.classList.remove("current");
logMessage(`<div class="current round">\n</div>\n`);
context = $(".current.round");
prompt("Press control+enter to continue.");
} // roundStart

export function roundComplete (roundCount) {
logMessage(`End of round ${roundCount}.`);
context = $log;
} // roundComplete

export function trickStart (trickCount) {
$log.querySelectorAll("[data-error], [data-prompt]").forEach(x => x.remove());
$(".trick.current")?.classList.remove("current");
logMessage(`<div class="current trick"><hr class="trick-start"></div>\n`);
context = $(".current.trick");
} // trickStart

export function trickComplete () {
context = $(".current.round");
} // trickComplete

export function currentTrick (text) {
logMessage(text, $(".trick.current"));
} // currentTrick

export function refreshCurrentTrick () {
refresh($(".current.round > .current.trick"));
} // refreshCurrentTrick

export function refreshScores () {
refresh($$(".current.round > .scores > *"));
} // refreshScores

export function refresh(container) {
const elements = [...container.children];
for (const element of elements) element.remove();
for (const element of elements.reverse()) container.insertAdjacentElement("afterBegin", element); // for
} // refresh

export function hide (elements) {
for (const element of elements) element.hidden = true;
} // hide

export function show (elements) {
for (const element of elements) element.hidden = false;
} // show

export function toggle (elements) {
for (const element of elements) element.hidden = not(element.hidden);
} // toggle

function _refresh (index1, index2) {
const log = [...$log.children];
const elements = log.slice(index1, index2);
for (const element of elements) element.remove();
for (const element of elements) $log.appendChild(element);
} // refresh

export function prompt (text) {
//console.debug("log.prompt: " + text);
logMessage(`<p data-prompt>${text}</p>`);
} // prompt

export function errorMessage (text) {
logMessage(`<p data-error>${text}</p>`);
} // errorMessage

export function logMessage (html, $parent = context) {
html = html.trim();
if (html[0] !== "<") html = `<p>${html}</p>\n`;
$parent.insertAdjacentHTML("beforeEnd", html);
} // logMessage

export function setHideRounds (state) {
hideRounds = state;

const elements = find(".round-start", ".round-start", x => x.matches(".round-start,.scores"));

if (state) {
hide(elements);
} else {
$log.removeAttribute("role");
 show(elements);
$log.setAttribute("role", "status");
} // if
} // setHideRounds

export function setHideTricks (state) {
hideTricks = state;

if (not($log.querySelector(".round-start"))) return;

const roundCount = $$(".round-start").length;
const newTricks = find(".round-start", null, x => x.matches(".trick")).slice(0, -1);

const oldTricks = roundCount > 1?
find(".round-start", ".round-start", x => x.matches(".trick"))
: [];
debugger;


const elements = oldTricks.concat(newTricks.length >= 3? newTricks : [])
if (state) {
hide(elements);
} else {
$log.removeAttribute("role");
show(elements);
$log.setAttribute("role", "status");
} // if
} // setHideTricks

export function filter (selector) {
return [...$log.children].filter(x => x.matches(selector));
} // filter

function $ (selector, context = $log) {
return context.querySelector(selector);
} // $

function $$ (selector, context = $log) {
return [...context.querySelectorAll(selector)];
} // $$
