import type { Movie, Episode, VideoSource, SearchResult } from '../../shared/types.js';
import type { MovieProvider } from './providers.js';
function unique<T extends {id:string}>(items:T[]):T[] { return [...new Map(items.map(i=>[i.id,i])).values()]; }
async function timed<T>(fn:()=>Promise<T>, ms=4000):Promise<T> {
 let timer: ReturnType<typeof setTimeout> | undefined;
 try { return await Promise.race([Promise.resolve().then(fn),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('Provider timeout')),ms)})]); }
 finally { if(timer)clearTimeout(timer); }
}
export class Aggregator {
 constructor(private providers:MovieProvider[]) {}
 private async collect<T extends {id:string}>(fn:(p:MovieProvider)=>Promise<T[]>) {
  const settled=await Promise.allSettled(this.providers.map(p=>timed(()=>fn(p))));
  return {items:unique(settled.flatMap(r=>r.status==='fulfilled'?r.value:[])),unavailableProviders:settled.flatMap((r,i)=>r.status==='rejected'?[this.providers[i].name]:[])};
 }
 async search(q:string):Promise<SearchResult> {const r=await this.collect<Movie>(p=>p.search(q));return {movies:r.items,unavailableProviders:r.unavailableProviders};}
 async detail(id:string) {const {movies}=await this.search('');const movie=movies.find(m=>m.id===id);if(!movie)return null;const {items}=await this.collect<Episode>(p=>p.getEpisodes(id));return {...movie,episodes:items};}
 async sources(id:string,ep:string) {return this.collect<VideoSource>(p=>p.getVideoSources(id,ep));}
}
