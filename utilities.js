export function sum (a) {
return a.reduce((a,x) => a += x, 0);
} // sum

export function userMessage (text, options) {
dispatch("userMessage", {message: text, options});
} // userMessage

export function errorMessage (text) {
dispatch("error", {message: text, options: ["info"]});
} // errorMessage

export function infoMessage (text) {return errorMessage(text);}

export function dispatch (type, options) {
const event = Object.assign(new Event(type), options);
document.dispatchEvent(event);
} // dispatch

export async function blockUntilEvent(event, target = document) {
return new Promise(resolve => target.addEventListener(event, e => resolve(e), {passive: true, once: true}));
} // blockUntilEvent

export async function amap(arr,fun) {
    return await Promise.all(arr.map(async v => await fun(v)))
} // amap


export function atLeast (n, ... conditions) {
if (n <= 0) return false;
if (conditions.length < n) return false;
const count = conditions.reduce((n, q) => n = q? n+1 : n);
return count >= n;
} // atLeast

export function not (x) {return !x;}
//alert("utilities module loaded");
