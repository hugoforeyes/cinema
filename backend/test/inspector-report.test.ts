import test from 'node:test';
import assert from 'node:assert/strict';
import {parseInspectorReport,isPlayableObservation} from '../../shared/inspector-report.js';
test('validates, deduplicates and preserves report observations',()=>{
 const item={type:'HLS',url:'https://example.com/stream.m3u8?token=private'};
 const values=parseInspectorReport(JSON.stringify({sources:[item,item,{type:'VTT',url:'https://example.com/sub.vtt'},{type:'MP4',url:'javascript:alert(1)'},{type:'MP4',url:'https://user:pass@example.com/a.mp4'},{type:'UNKNOWN',url:'https://example.com/a'}]}));
 assert.deepEqual(values,[item,{type:'VTT',url:'https://example.com/sub.vtt'}]);
 assert.equal(values.filter(isPlayableObservation).length,1);
});
test('rejects malformed and oversized reports',()=>{
 assert.throws(()=>parseInspectorReport('{}'));
 assert.throws(()=>parseInspectorReport('x'.repeat(1024*1024+1)));
});
test('only native supported video kinds can be selected',()=>{
 const report=parseInspectorReport(JSON.stringify({sources:[{type:'IFRAME',url:'https://example.com/embed'},{type:'DASH',url:'https://example.com/media.mpd'},{type:'MP4',url:'http://example.com/video.mp4'},{type:'MP4',url:'http://127.0.0.1:8080/video.mp4'}]}));
 assert.equal(report.filter(isPlayableObservation).length,1);
});
