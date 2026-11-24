import {useEffect,useState} from 'react';
import Player from './Player';
import InspectorReport from './InspectorReport';
import EmbedPlayer from './EmbedPlayer';
import type {VideoSource,ExternalListing} from '../../shared/types';
function useObjectUrl(file:Blob|null){
 const [url,setUrl]=useState('');
 useEffect(()=>{if(!file){setUrl('');return}const u=URL.createObjectURL(file);setUrl(u);return()=>URL.revokeObjectURL(u)},[file]);
 return url;
}
export default function EpisodePlayer({movieId,count,pageLinks=[]}:{movieId:string;count:number;pageLinks?:ExternalListing[]}){
 const [episode,setEpisode]=useState(1);
 return <section style={{marginBottom:24}} aria-label="Trình phát Cinema">
 <h2>Danh sách tập</h2><div className="choices">{Array.from({length:count},(_,i)=>i+1).map(n=><button key={n} aria-pressed={episode===n} className={episode===n?'active':''} onClick={()=>setEpisode(n)}>Tập {n}</button>)}</div>
 <EpisodeSource key={episode} progressKey={'cinema:personal:'+movieId+':'+episode} episode={episode} pageLinks={pageLinks}/>
 </section>;
}
function EpisodeSource({episode,progressKey,pageLinks}:{episode:number;progressKey:string;pageLinks:ExternalListing[]}){
 const [file,setFile]=useState<File|null>(null);
 const [sub,setSub]=useState<File|null>(null);
 const [url,setUrl]=useState('');
 const [remote,setRemote]=useState<VideoSource|null>(null);
 const [kind,setKind]=useState<'mp4'|'hls'>('mp4');
 const [error,setError]=useState('');
 const videoUrl=useObjectUrl(file),subtitleUrl=useObjectUrl(sub);
 const source:VideoSource|null=file?(videoUrl?{id:'local',provider:'Thiết bị',label:file.name,type:'mp4',url:videoUrl}:null):remote;
 return <>
 <h2>Trình phát Cinema · Tập {episode}</h2>
 {source?<Player source={source} progressKey={progressKey} subtitleUrl={subtitleUrl||undefined}/>:<div className="player empty" style={{textAlign:'center',padding:20}}><div><strong>Chưa có video cho tập {episode}</strong><p><small>Chọn video từ thiết bị hoặc nhập URL video được phép sử dụng.</small></p></div></div>}
 <div style={{padding:16,background:'#1d1d25',borderRadius:12,marginTop:12,display:'grid',gap:12}}>
 <label>Video trên thiết bị<input style={{display:'block',maxWidth:'100%'}} type="file" accept="video/*,.mp4,.webm,.mov" onChange={e=>{setFile(e.target.files?.[0]??null);setRemote(null);setError('')}}/></label>
 <label>Phụ đề tiếng Việt (.vtt)<input style={{display:'block',maxWidth:'100%'}} type="file" accept=".vtt,text/vtt" onChange={e=>{setSub(e.target.files?.[0]??null)}}/></label>
 <form style={{display:'grid',gap:10}} onSubmit={e=>{e.preventDefault();try{const u=new URL(url.trim());if(u.protocol!=='https:'||u.username||u.password)throw Error();setFile(null);setRemote({id:'remote',provider:'Nguồn của bạn',label:kind.toUpperCase(),url:u.href,type:kind});setError('')}catch{setError('Nhập URL HTTPS hợp lệ cho luồng video trực tiếp.')}}}>
 <label>URL video được phép phát<input style={{display:'block',width:'100%',padding:10,background:'#101014',borderRadius:8}} type="url" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://…/episode.mp4" required/></label>
 <label>Định dạng <select style={{background:'#101014',padding:8}} value={kind} onChange={e=>setKind(e.target.value==='hls'?'hls':'mp4')}><option value="mp4">MP4 / video trực tiếp</option><option value="hls">HLS (.m3u8)</option></select></label>
 <button className="primary" type="submit">Phát video</button>
 </form>
 {error&&<p role="alert" className="notice">{error}</p>}
 <InspectorReport onSelect={item=>{const type=item.type==='HLS'?'hls':'mp4';setFile(null);setUrl(item.url);setKind(type);setRemote({id:'inspected',provider:'Local Inspector',label:type.toUpperCase(),type,url:item.url});setError('')}}/>
 <small>File chỉ được đọc trên thiết bị, không tải lên Render. URL trang xem phim không phải URL video. Nguồn từ xa phải cho phép trình duyệt phát; Cinema không vượt DRM hoặc hạn chế của nguồn.</small>
 </div><EmbedPlayer pageLinks={pageLinks}/></>;
}
