import { isHumanPlayerPresent } from "./hearts.js";
import { not } from "./utilities.js";

var $log = null;
var context = null;
var hideRounds = false;
var  hideTricks = false;
var browser = false;





export function initialize (log, _browser = true) {
browser = _browser;
if (not(browser)) return;
$log = log;
context = $log;
} // initialize

export function clear () {
if (not(browser)) return;
$log.innerHTML = "";
context = $log;
} // clear

export function empty () {
    if (not(browser)) return;
return $log.innerHTML === "" //&& context === $log;
} // empty

export function roundStart (count) {
if (not(browser)) return;
$(".round.current")?.classList.remove("current");
logMessage(`<div class="current round">\n</div>\n`);
context = $(".current.round");
hideRounds? hidePreviousRounds() : showPreviousRounds();
} // roundStart

export function roundComplete (roundCount) {
if (not(browser)) return;
context = $log;
} // roundComplete

export function trickStart (trickCount) {
if (not(browser)) return;
$log.querySelectorAll("[data-error], [data-prompt]").forEach(x => x.remove());
$(".trick.current")?.classList.remove("current");
logMessage(`<div class="current trick"><hr class="trick-start"></div>\n`);
context = $(".current.trick");
hideTricks? hidePreviousTricks() : showPreviousTricks();
} // trickStart

export function trickComplete () {
if (not(browser)) return;
context = $(".current.round");
} // trickComplete

export function currentTrick (text) {
logMessage(text, $(".trick.current"));
} // currentTrick

export function refreshCurrentTrick () {
if (not(browser)) return;
refresh($(".current.round > .current.trick"));
} // refreshCurrentTrick

export function refreshScores () {
if (not(browser)) return;
refresh($(".current.round > .scores"));
} // refreshScores

export function refresh(container) {
const elements = [...container.children];
for (const element of elements) element.remove();
for (const element of elements.reverse()) container.insertAdjacentElement("afterBegin", element); // for
} // refresh

export function prompt (text) {
//console.debug("log.prompt: " + text);
if (isHumanPlayerPresent()) logMessage(`<p data-prompt>${text}</p>`);
} // prompt

export function errorMessage (text) {
logMessage(`<p data-error>${text}</p>`);
} // errorMessage

export function logMessage (html, $parent = context) {
if (not(html instanceof String) && typeof(html) !== "string") return;
html = html?.trim();
if (browser) {
if (html[0] !== "<") html = `<p>${html}</p>\n`;
$parent.insertAdjacentHTML("beforeEnd", html);
} else {
const func = $log instanceof Function? $log : (() => {});

func(stripHTML(html) + "\n");
} // if
} // logMessage

function stripHTML (text) {
return text.replace(/\<.+?\>/g, " ").trim();
} // stripHTML

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

if (isHumanPlayerPresent()) {
const tricks = $$(".current.round > .trick:not(.current)").slice(0,-1);
hide(tricks);

} else {
hide($$(".current.round > .trick"));
} // if

hideTricks = true;
} // hidePreviousTricks

export function showPreviousTricks () {
show($$(".trick"));
hideTricks = false;
} // showPreviousTricks

export function hide (elements) {
for (const element of elements) element.hidden = true;
} // hide

export function show (elements) {
//$log.removeAttribute("role");
for (const element of elements) element.hidden = false;
//$log.setAttribute("role", "log");
} // show

export function toggle (elements) {
for (const element of elements) element.hidden = not(element.hidden);
} // toggle


function $ (selector, context = $log) {
return context.querySelector(selector);
} // $

function $$ (selector, context = $log) {
return [...context.querySelectorAll(selector)];
} // $$
