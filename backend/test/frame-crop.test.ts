import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultCrop,normalizeCrop,frameGeometry} from '../../shared/frame-crop.js';
test('crop stays within the iframe viewport',()=>{
 const c=normalizeCrop({...defaultCrop,width:200,height:100,x:999,y:-10});
 assert.equal(c.x,190);assert.equal(c.y,0);
});
test('crop geometry scales and offsets only the outer frame',()=>{
 const g=frameGeometry({...defaultCrop,width:200,height:100,x:50,y:300},400);
 assert.equal(g.scale,2);assert.equal(g.left,-100);assert.equal(g.top,-600);assert.equal(g.height,200);
 assert.equal(g.frameWidth,390);assert.equal(g.frameHeight,1400);
});
test('full preview restores zero offsets and viewport width',()=>{
 const g=frameGeometry({...defaultCrop,x:20,y:300,width:300},390,true);
 assert.equal(g.scale,1);assert.equal(g.left,0);assert.equal(g.top,0);assert.equal(g.height,800);
});
