import Fastify from 'fastify';
import staticPlugin from '@fastify/static';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { Aggregator } from './aggregator.js';
import { providers } from './providers.js';
const app=Fastify({logger:true});
const aggregator=new Aggregator(providers);
app.get('/api/health',async()=>({status:'ok'}));
app.get<{Querystring:{q?:string}}>('/api/movies',{schema:{querystring:{type:'object',properties:{q:{type:'string',maxLength:150}}}}},async req=>aggregator.search(req.query.q??''));
app.get<{Params:{id:string}}>('/api/movies/:id',async(req,reply)=>{
 const movie=await aggregator.detail(req.params.id);
 return movie??reply.code(404).send({error:'Movie not found'});
});
app.get<{Params:{id:string;episode:string}}>('/api/movies/:id/episodes/:episode/sources',async(req,reply)=>{
 const r=await aggregator.sources(req.params.id,req.params.episode);
 if(!r.items.length && !r.unavailableProviders.length)return reply.code(404).send({error:'No sources found'});
 return {sources:r.items,unavailableProviders:r.unavailableProviders};
});
const root=resolve('dist/web');
if(existsSync(root)){
 await app.register(staticPlugin,{root,setHeaders(res,path){if(path.endsWith('index.html')||path.endsWith('sw.js'))res.setHeader('Cache-Control','no-store');}});
 app.setNotFoundHandler((req,reply)=>{
  if(req.method==='GET'&&!req.url.startsWith('/api/')&&req.headers.accept?.includes('text/html'))return reply.header('Cache-Control','no-store').sendFile('index.html');
  return reply.code(404).send({error:'Not found'});
 });
}
await app.listen({host:'0.0.0.0',port:Number(process.env.PORT??8080)});
