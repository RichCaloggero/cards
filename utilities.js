export function userMessage (text) {
dispatch("userMessage", {message: text});
} // userMessage

export function errorMessage (text) {
dispatch("error", {message: text});
} // errorMessage

export function dispatch (type, options) {
const event = Object.assign(new Event(type), options);
document.dispatchEvent(event);
} // dispatch

export async function blockUntilEvent(event, target = document) {
return new Promise(resolve => target.addEventListener(event, e => resolve(e), {passive: true, once: true}));
} // blockUntilEvent

export async function amap(arr,fun) {
    return await Promise.all(arr.map(async v => await fun(v)))
}


export function not (x) {return !x;}
//alert("utilities module loaded");
