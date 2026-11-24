import test from 'node:test';
import assert from 'node:assert/strict';
import {parseEmbedUrl} from '../../shared/embed-url.js';
test('accepts HTTPS external embed URL',()=>assert.equal(parseEmbedUrl('https://example.com/embed/1','https://cinema.example'),'https://example.com/embed/1'));
test('rejects unsafe protocols, userinfo and same-origin input',()=>{
 for(const url of ['javascript:alert(1)','http://example.com','https://a:b@example.com','https://cinema.example/api','not a URL'])assert.throws(()=>parseEmbedUrl(url,'https://cinema.example'));
});
