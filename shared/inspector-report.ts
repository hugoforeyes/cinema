export type ObservedKind = 'HLS'|'MP4'|'DASH'|'IFRAME'|'VTT'|'SRT';
export interface ObservedSource { type: ObservedKind; url: string }
const kinds = new Set<string>(['HLS','MP4','DASH','IFRAME','VTT','SRT']);
export function parseInspectorReport(raw:string):ObservedSource[]{
 if(raw.length>1024*1024)throw new Error('Báo cáo quá lớn.');
 const value:unknown=JSON.parse(raw);
 if(!value||typeof value!=='object'||!('sources' in value)||!Array.isArray(value.sources)||value.sources.length>500)throw new Error('Báo cáo không hợp lệ.');
 const result:ObservedSource[]=[];const seen=new Set<string>();
 for(const item of value.sources){
  if(!item||typeof item!=='object'||typeof item.type!=='string'||!kinds.has(item.type)||typeof item.url!=='string'||item.url.length>16384)continue;
  try{
   const u=new URL(item.url);
   if(u.username||u.password||!['https:','http:'].includes(u.protocol))continue;
   const key=item.type+':'+u.href;
   if(!seen.has(key)){seen.add(key);result.push({type:item.type as ObservedKind,url:u.href})}
  }catch{/* Invalid URL. */}
 }
 return result;
}
export function isPlayableObservation(s:ObservedSource):boolean {
 const u=new URL(s.url);
 return (s.type==='HLS'||s.type==='MP4')&&(u.protocol==='https:'||(u.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(u.hostname)));
}
