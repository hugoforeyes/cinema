import {useEffect,useRef,useState} from 'react';
import {Link,Route,Routes,useParams,useSearchParams} from 'react-router-dom';
import {Film,Search,Bookmark,Play,ArrowLeft} from 'lucide-react';
import type {Movie,MovieDetail,SearchResult,VideoSource} from '../../shared/types';
import {api,read} from './api';
import Player from './Player';
import {selectSource} from '../../shared/source-selection';
import MediaTools from './MediaTools';
import CroppedFrame from './CroppedFrame';
import {episodePage} from '../../shared/episode-page';

function Poster({movie}:{movie:Movie}){return <Link className="poster" to={'/watch/'+movie.id}><div className="art"><img src={movie.artwork} alt="" loading="lazy"/><span className="playbadge"><Play size={20} fill="currentColor"/></span></div><strong>{movie.title}</strong><small>{movie.year} · {movie.duration}</small></Link>}
function Home({library=false}:{library?:boolean}){
 const [params]=useSearchParams();const [q,setQuery]=useState(()=>params.get('q')??'');const composing=useRef(false);
 const [movies,setMovies]=useState<Movie[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState('');
 useEffect(()=>{const c=new AbortController();setLoading(true);setError('');const timer=setTimeout(()=>{api<SearchResult>('/movies?q='+encodeURIComponent(q),c.signal).then(r=>{setMovies(r.movies);if(r.unavailableProviders.length)setError('Một số nguồn hiện không khả dụng.')}).catch(e=>{if(!c.signal.aborted)setError(String(e))}).finally(()=>{if(!c.signal.aborted)setLoading(false)})},200);return()=>{clearTimeout(timer);c.abort()}},[q]);
 const favorites=read<string[]>('cinema:favorites',[]);
 const list=library?movies.filter(m=>favorites.includes(m.id)):movies;
 const hero=!library&&!q?list[0]:undefined;
 return <main>
 {!library&&<label className="search"><Search size={19}/><input aria-label="Tìm phim" placeholder="Tìm tên phim, thể loại..." lang="vi" enterKeyHint="search" defaultValue={q} onCompositionStart={()=>{composing.current=true}} onCompositionEnd={e=>{composing.current=false;setQuery(e.currentTarget.value)}} onChange={e=>{if(!composing.current&&!(e.nativeEvent as InputEvent).isComposing)setQuery(e.currentTarget.value)}}/></label>}
 {hero&&<section className="hero" style={{backgroundImage:'linear-gradient(90deg,#111116 5%,#11111666 65%),url("'+hero.artwork+'")'}}><span className="eyebrow">CINEMA COLLECTION / 01</span><h1>{hero.title}</h1><p>{hero.description}</p><Link className="primary" to={'/watch/'+hero.id}><Play size={18} fill="currentColor"/> Xem ngay</Link></section>}
 <div className="sectionhead"><h2>{library?'Danh sách của tôi':q?'Kết quả tìm kiếm':'Khám phá'}</h2><small>{list.length} phim</small></div>
 {loading&&<p>Đang tải…</p>}{error&&<p role="alert" className="notice">{error}</p>}
 {!loading&&!list.length&&<p>Chưa có phim phù hợp.</p>}
 <div className="posters">{list.map(movie=><Poster key={movie.id} movie={movie}/>)}</div>
 </main>;
}
function Watch(){
 const {id=''}=useParams();
 const [movie,setMovie]=useState<MovieDetail|null>(null);
 const [error,setError]=useState('');
 useEffect(()=>{
  const c=new AbortController();setMovie(null);setError('');
  api<MovieDetail>('/movies/'+encodeURIComponent(id),c.signal).then(m=>{if(!c.signal.aborted)setMovie(m)}).catch(e=>{if(!c.signal.aborted)setError(String(e))});
  return()=>c.abort();
 },[id]);
 if(!movie||movie.id!==id)return <main><Link className="back" to="/"><ArrowLeft size={18}/> Trang chủ</Link><p role={error?'alert':undefined}>{error||'Đang tải phim…'}</p></main>;
 return <main className="simple-watch"><Link className="back" to="/"><ArrowLeft size={18}/> Trang chủ</Link>
 <h1 className="watchtitle">{movie.title}</h1>
 {movie.externalListings?.length?<CropWatch key={movie.id} movie={movie}/>:<NativeWatch key={movie.id} movie={movie}/>}
 </main>;
}
function CropWatch({movie}:{movie:MovieDetail}){
 const [name,setName]=useState('');
 const [episode,setEpisode]=useState(movie.episodes[0]?.id??'');
 const listing=movie.externalListings?.find(x=>x.name===name);
 const url=episodePage(listing,episode);
 const label=movie.episodes.find(e=>e.id===episode)?.title??'';
 return <>
 <h2>Chọn tập</h2>
 <div className="choices episode-grid">{movie.episodes.map(e=><button key={e.id} aria-pressed={episode===e.id} className={episode===e.id?'active':''} onClick={()=>setEpisode(e.id)}>{e.title}</button>)}</div>
 <h2>Chọn nguồn</h2>
 <div className="choices source-grid">{movie.externalListings?.map(item=><button key={item.name} aria-pressed={item.name===name} className={item.name===name?'active':''} onClick={()=>setName(item.name)}>{item.name}{!episodePage(item,episode)&&<small>Chưa có link tập</small>}</button>)}</div>
 <section aria-label="Khung xem phim" style={{marginTop:16}}>
 {url&&listing?<CroppedFrame key={url} url={url} storageKey={listing.url}/>:<div className="player empty video-status" role="status"><div><Film size={30}/><strong>{listing?'Chưa có link '+label:'Chọn nguồn để xem '+label}</strong><small>{listing?'Không mở trang giới thiệu thay cho tập phim.':'Chọn tập và website.'}</small></div></div>}
 </section>
 <small style={{display:'block',marginTop:12}}>Cinema chỉ mở đường dẫn riêng đã cấu hình cho từng tập. Khả năng nhúng và phát phụ thuộc website nguồn.</small>
 </>;
}
function NativeWatch({movie}:{movie:MovieDetail}){
 const [episode,setEpisode]=useState(movie.episodes[0]?.id??'');
 const [sources,setSources]=useState<VideoSource[]>([]);
 const [provider,setProvider]=useState('');
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(true);
 useEffect(()=>{
  if(!episode){setLoading(false);return;}
  const c=new AbortController();setSources([]);setLoading(true);setError('');
  api<{sources:VideoSource[];unavailableProviders:string[]}>('/movies/'+encodeURIComponent(movie.id)+'/episodes/'+encodeURIComponent(episode)+'/sources',c.signal)
   .then(r=>{if(c.signal.aborted)return;setSources(r.sources);if(r.unavailableProviders.length)setError('Một số nguồn hiện không khả dụng.')})
   .catch(()=>{if(!c.signal.aborted)setError('Không tải được nguồn phát.')})
   .finally(()=>{if(!c.signal.aborted)setLoading(false)});
  return()=>c.abort();
 },[movie.id,episode]);
 const names=[...new Set(sources.map(x=>x.provider))];
 const activeProvider=names.includes(provider)?provider:names[0]??'';
 const source=selectSource(sources,activeProvider);
 return <>
 {source?.type==='embed'?<div className="player"><iframe title="Video" src={source.url} className="video-frame" sandbox="allow-scripts allow-presentation" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="no-referrer"/></div>:source?<Player key={episode+':'+source.id} source={source} progressKey={'cinema:progress:'+movie.id+':'+episode}/>:<div className="player empty video-status" role="status"><div><Film size={30}/><strong>{loading?'Đang tải nguồn phát…':'Chưa có video khả dụng'}</strong><small>{error}</small></div></div>}
 <h2>Chọn tập</h2><div className="choices episode-grid">{movie.episodes.map(e=><button key={e.id} aria-pressed={episode===e.id} className={episode===e.id?'active':''} onClick={()=>{if(e.id!==episode){setLoading(true);setSources([]);setEpisode(e.id)}}}>{e.title}</button>)}</div>
 <h2>Chọn nguồn</h2><div className="choices source-grid">{names.map(name=><button key={name} aria-pressed={activeProvider===name} className={activeProvider===name?'active':''} onClick={()=>setProvider(name)}>{name}</button>)}</div>
 </>;
}
export default function App(){return <><header><Link className="brand" to="/"><Film size={24}/> cinema<span>.</span></Link><nav><Link to="/">Khám phá</Link><Link to="/library"><Bookmark size={17}/> Thư viện</Link></nav></header><Routes><Route path="/" element={<Home/>}/><Route path="/library" element={<Home key="library" library/>}/><Route path="/watch/:id" element={<Watch/>}/><Route path="/tools/media" element={<MediaTools/>}/><Route path="*" element={<main><h1>Không tìm thấy trang</h1><Link to="/">Trang chủ</Link></main>}/></Routes><footer>Cinema · v0.1.12 · Phim mẫu và danh mục liên kết bên ngoài.</footer></>}
