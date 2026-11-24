export async function api<T>(path:string,signal?:AbortSignal):Promise<T> {
 const r=await fetch('/api'+path,{signal});
 if(!r.ok)throw new Error('Request failed ('+r.status+')');
 return r.json() as Promise<T>;
}
export function read<T>(key:string,fallback:T):T {try {return JSON.parse(localStorage.getItem(key)??'null')??fallback}catch{return fallback}}
export function write<T>(key:string,value:T){try{localStorage.setItem(key,JSON.stringify(value))}catch{/* private browsing or quota */}}
