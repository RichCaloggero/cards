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
$log.querySelectorAll("[data-error], [data-prompt]").forEach(x => x.remove());
} // trickStart

export function trickComplete () {
logMessage("<hr>\n");
} // trickComplete

export function currentTrick (text) {
logMessage(text);
} // currentTrick

export function refreshCurrentTrick () {
const index = [...$log.children].findLastIndex(x => x.tagName === "HR" || x.tagName === "H2");
const elements = [...$log.children].slice(index+1);

for (const element of elements) element.remove();
for (const element of elements) $log.appendChild(element);

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

