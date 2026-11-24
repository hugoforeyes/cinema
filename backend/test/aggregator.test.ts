import test from 'node:test';
import assert from 'node:assert/strict';
import {Aggregator} from '../src/aggregator.js';
import {providers} from '../src/providers.js';
const a=new Aggregator(providers);
test('search merges canonical duplicates',async()=>{const r=await a.search('bunny');assert.equal(r.movies.length,1);assert.equal(r.movies[0].id,'big-buck-bunny')});
test('both authorized demo sources are returned',async()=>{const r=await a.sources('big-buck-bunny','feature');assert.equal(r.items.length,2);assert.deepEqual(r.items.map(s=>s.type).sort(),['hls','mp4'])});
test('one failed provider does not block search',async()=>{const x=new Aggregator([...providers,{name:'broken',async search(){throw Error('down')},async getEpisodes(){throw Error('down')},async getVideoSources(){throw Error('down')}}]);const r=await x.search('sintel');assert.equal(r.movies.length,1);assert.deepEqual(r.unavailableProviders,['broken'])});
test('unknown movie is missing',async()=>assert.equal(await a.detail('missing'),null));

test('Vietnamese accents, punctuation, and English aliases find official movie',async()=>{for(const q of ['Kéo Búa Mìn','keo bua min','Kéo, Búa, Mìn','Rock Paper Landmines','Jirai Glico','Ke\u0301o Bu\u0301a Mi\u0300n']){const r=await a.search(q);assert.equal(r.movies[0]?.id,'jirai-glico');assert.ok(r.movies[0]?.watchUrl?.startsWith('https://www.primevideo.com/'));}assert.equal((await a.sources('jirai-glico','feature')).items.length,0)});
