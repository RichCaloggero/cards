import { not } from "./utilities.js";
var $log = null;
var context = null;
var hideRounds = false;
var  hideTricks = false;





export function initialize (log, status = log) {
$log = log;
context = $log;
} // initialize

export function clear () {
$log.innerHTML = "";
context = $log;
} // clear

export function roundStart (count) {
$(".round-start.current")?.classList.remove("current");
logMessage(`<div class="current round">\n</div>\n`);
context = $(".current.round");
prompt("Press control+enter to continue.");
hideRounds? hidePreviousRounds() : showPreviousRounds();
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
hideTricks? hidePreviousTricks() : showPreviousTricks();
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
refresh($(".current.round > .scores"));
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
$log.removeAttribute("role");
for (const element of elements) element.hidden = false;
$log.setAttribute("role", "log");
} // show

export function toggle (elements) {
for (const element of elements) element.hidden = not(element.hidden);
} // toggle

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

export function hidePreviousRounds () {
hide($$(".round:not(.current)"));
hideRounds = true;
} // hidePreviousRounds

export function showPreviousRounds () {
show($$(".round:not(.current)"));
hideRounds = false;
} // showPreviousRounds

export function hidePreviousTricks () {
const oldTricks = $$(".round:not(.current) .trick");
hide(oldTricks);

const tricks = $$(".current.round > .trick:not(.current)").slice(0,-1);
hide(tricks);

hideTricks = true;
} // hidePreviousTricks

export function showPreviousTricks () {
show($$(".trick"));
hideTricks = false;
} // showPreviousTricks

function $ (selector, context = $log) {
return context.querySelector(selector);
} // $

function $$ (selector, context = $log) {
return [...context.querySelectorAll(selector)];
} // $$
