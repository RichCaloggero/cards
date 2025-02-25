var $log = null;

export function initialize (domElement) {
$log = domElement;
} // initialize

export function clear () {
$log.innerHTML = "";
} // clear

export function trickStart () {
$log.querySelectorAll("#current-trick").forEach(x => x.removeAttribute("id"));
$log.querySelectorAll("[data-error]").forEach(x => x.remove());
$log.insertAdjacentHTML("beforeEnd", `<div id="current-trick">\n</div>\n`);
} // trickStart

export function trickComplete () {
} // trickComplete

export function currentTrick (text) {
const log = $log.querySelector("#current-trick");
if (log) userMessage(text);
else errorMessage("no current trick!");
} // currentTrick

export function refreshCurrentTrick () {
const log = $log.querySelector("#current-trick");
if (log) {
const html = log.innerHTML;
 log.innerHTML = "";
log.innerHTML = html;

} else {
errorMessage("no current trick!");
} // if
} // refreshCurrentTrick

export function prompt (text) {
$log.querySelectorAll("[data-prompt]").forEach(x => x.remove());
$log.insertAdjacentHTML("beforeEnd", `<p data-prompt>${text}</p>`);
} // prompt


export function errorMessage (text, data) {
$log.insertAdjacentHTML("beforeEnd", `<p data-error>${text}</p>`);
} // errorMessage

export function userMessage (text) {
$log.insertAdjacentHTML("beforeEnd", `<p>${text}</p>`);
} // userMessage


export function infoMessage (text) {return errorMessage(text);}

