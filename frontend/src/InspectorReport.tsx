import {useRef,useState} from 'react';
import {parseInspectorReport,isPlayableObservation,type ObservedSource} from '../../shared/inspector-report';
export default function InspectorReport({onSelect}:{onSelect:(s:ObservedSource)=>void}){
 const [sources,setSources]=useState<ObservedSource[]>([]);
 const [error,setError]=useState('');
 const [loaded,setLoaded]=useState(false);
 const version=useRef(0);
 async function load(file:File|undefined){
  const id=++version.current;setSources([]);setError('');setLoaded(false);
  if(!file)return;
  try{
   if(file.size>1024*1024)throw new Error('Báo cáo quá lớn.');
   const raw=await file.text();if(version.current!==id)return;
   setSources(parseInspectorReport(raw));setLoaded(true);
  }catch(e){if(version.current===id)setError(e instanceof Error?e.message:'Không đọc được báo cáo.')}
 }
 return <section style={{background:'#23232d',padding:14,borderRadius:12}}>
 <h3 style={{fontWeight:700}}>Nhập kết quả Local Inspector</h3>
 <p><small>Chọn báo cáo .cinema/sources.json. File được đọc tại thiết bị, không gửi về server. Chỉ chọn nguồn bạn có quyền sử dụng.</small></p>
 <input aria-label="Báo cáo Inspector" type="file" accept=".json,application/json" onChange={e=>void load(e.target.files?.[0])} style={{maxWidth:'100%',margin:'12px 0'}}/>
 {error&&<p className="notice" role="alert">{error}</p>}
 {loaded&&<><p><small>{sources.length} tài nguyên · {sources.filter(isPlayableObservation).length} nguồn video tương thích về định dạng</small></p>
 <div style={{display:'grid',gap:8,marginTop:8}}>{sources.map(s=>{
  const u=new URL(s.url);return <div key={s.type+':'+s.url} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,overflowWrap:'anywhere'}}>
  <small>{s.type} · {u.hostname}{u.pathname}{u.search?' [tham số ẩn]':''}</small>
  {isPlayableObservation(s)?<button type="button" className="secondary" onClick={()=>onSelect(s)}>Chọn</button>:<small>Chỉ thông tin</small>}</div>
 })}</div></>}
 <small>HLS/MP4 có thể không phát nếu nguồn giới hạn truy cập, thiếu CORS hoặc URL hết hạn. DASH và iframe không tự nhúng.</small>
 </section>;
}
