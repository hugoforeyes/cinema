import test from 'node:test';
import assert from 'node:assert/strict';
import {episodePage} from '../../shared/episode-page.js';
const listing={name:'Example',url:'https://example.com/movie',language:'Vietsub',reportedEpisodes:6,episodePages:{'1':'https://example.com/watch/1','2':'https://example.com/watch/2','3':'https://example.com/movie','4':'javascript:alert(1)'}};
test('episode lookup returns only exact mapped page, never title fallback',()=>{
 assert.equal(episodePage(listing,'1'),'https://example.com/watch/1');
 assert.equal(episodePage(listing,'2'),'https://example.com/watch/2');
 for(const id of ['3','4','5','6'])assert.equal(episodePage(listing,id),undefined);
 assert.equal(episodePage(undefined,'1'),undefined);
});
