var $log = null;
var $status = null;

export function initialize (log, status = log) {
$log = log;
$status = status;
} // initialize

export function clear () {
$log.innerHTML = "";
} // clear

export function trickStart () {
//$log.querySelectorAll("#current-trick").forEach(x => x.removeAttribute("id"));
$log.querySelectorAll("[data-error], [data-prompt]").forEach(x => x.remove());
//console.debug("log.trickStart:");
//$log.insertAdjacentHTML("beforeEnd", `<div id="current-trick">\n</div>\n`);
} // trickStart

export function trickComplete () {
$log.insertAdjacentHTML("beforeEnd", "<hr>\n");
} // trickComplete

export function currentTrick (text) {
//console.debug("log.currentTrick: ", text);
/*const log = $log.querySelector("#current-trick");
if (log) log.insertAdjacentHTML("beforeEnd", `<p>${text}</p>`);
else errorMessage("no current trick!");
*/
logMessage(text);
} // currentTrick

export function refreshCurrentTrick () {
return;
const log = $log.querySelector("#current-trick");
if (log) {
log.innerHTML = log.innerHTML;

} else {
errorMessage("no current trick!");
} // if
} // refreshCurrentTrick

export function prompt (text) {
//console.debug("log.prompt: " + text);
logMessage(`<p data-prompt>${text}</p>`);
} // prompt

export function errorMessage (text) {
logMessage(`<p data-error>${text}</p>`);
} // errorMessage

export function logMessage (html) {
html = html.trim();
if (html[0] !== "<") html = `<p>${html}</p>\n`;
$log.insertAdjacentHTML("beforeEnd", html);
} // logMessage


export function infoMessage (text) {return errorMessage(text);}

