import test from 'node:test';
import assert from 'node:assert/strict';
import {selectSource} from '../../shared/source-selection.js';
import type {VideoSource} from '../../shared/types.js';
test('source choice never falls back to an unrelated provider',()=>{
 const sources:VideoSource[]=[{id:'a',provider:'A',type:'hls',label:'HLS',url:'https://example.com/a.m3u8'},{id:'b',provider:'B',type:'mp4',label:'MP4',url:'https://example.com/b.mp4'}];
 assert.equal(selectSource(sources,'B')?.id,'b');
 assert.equal(selectSource(sources,'Missing'),undefined);
 assert.equal(selectSource([],'A'),undefined);
});
