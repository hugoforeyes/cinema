import {useEffect,useRef,useState} from 'react';
import {Link,Route,Routes,useParams,useSearchParams} from 'react-router-dom';
import {Film,Search,Bookmark,Play,ArrowLeft} from 'lucide-react';
import type {Movie,MovieDetail,SearchResult,VideoSource} from '../../shared/types';
import {api,read} from './api';
import Player from './Player';
import {selectSource} from '../../shared/source-selection';
import MediaTools from './MediaTools';

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
 const [episode,setEpisode]=useState('');
 const [sources,setSources]=useState<VideoSource[]>([]);
 const [provider,setProvider]=useState('');
 const [error,setError]=useState('');
 const [sourceError,setSourceError]=useState('');
 const [loading,setLoading]=useState(true);
 useEffect(()=>{
  const c=new AbortController();setMovie(null);setEpisode('');setProvider('');setSources([]);setError('');
  api<MovieDetail>('/movies/'+encodeURIComponent(id),c.signal).then(m=>{if(c.signal.aborted)return;setMovie(m);setEpisode(m.episodes[0]?.id??'');setProvider(m.externalListings?.[0]?.name??'')}).catch(e=>{if(!c.signal.aborted)setError(String(e))});
  return()=>c.abort();
 },[id]);
 useEffect(()=>{
  if(!episode)return;
  const c=new AbortController();setSources([]);setLoading(true);setSourceError('');
  api<{sources:VideoSource[];unavailableProviders:string[]}>('/movies/'+encodeURIComponent(id)+'/episodes/'+encodeURIComponent(episode)+'/sources',c.signal)
   .then(r=>{if(c.signal.aborted)return;setSources(r.sources);if(r.unavailableProviders.length)setSourceError('Một số nguồn hiện không khả dụng.')})
   .catch(()=>{if(!c.signal.aborted)setSourceError('Không tải được nguồn phát.')})
   .finally(()=>{if(!c.signal.aborted)setLoading(false)});
  return()=>c.abort();
 },[id,episode]);
 if(!movie)return <main><Link className="back" to="/"><ArrowLeft size={18}/> Trang chủ</Link><p role={error?'alert':undefined}>{error||'Đang tải phim…'}</p></main>;
 const names=[...new Set([...(movie.externalListings??[]).map(x=>x.name),...sources.map(x=>x.provider)])];
 const activeProvider=names.includes(provider)?provider:names[0]??'';
 const source=selectSource(sources,activeProvider);
 const current=movie.episodes.find(e=>e.id===episode);
 return <main className="simple-watch"><Link className="back" to="/"><ArrowLeft size={18}/> Trang chủ</Link>
 <h1 className="watchtitle">{movie.title}</h1>
 <section aria-label="Trình phát video">
 {source?.type==='embed'?<div className="player"><iframe title="Video" src={source.url} className="video-frame" sandbox="allow-scripts allow-presentation" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="no-referrer"/></div>:source?<Player key={episode+':'+source.id} source={source} progressKey={'cinema:progress:'+id+':'+episode}/>:<div className="player empty video-status" role="status"><div><Film size={30}/><strong>{loading&&episode?'Đang tải nguồn phát…':'Chưa có video khả dụng'}</strong><small>{sourceError||[current?.title,activeProvider].filter(Boolean).join(' · ')}</small>{!loading&&<small>Chưa có nguồn video được xác minh cho lựa chọn này.</small>}</div></div>}
 </section>
 <h2>Chọn tập</h2>
 <div className="choices episode-grid">{movie.episodes.map(e=><button key={e.id} aria-pressed={episode===e.id} className={episode===e.id?'active':''} onClick={()=>{if(e.id!==episode){setLoading(true);setSources([]);setEpisode(e.id)}}}>{e.title}</button>)}</div>
 <h2>Chọn nguồn</h2>
 <div className="choices source-grid">{names.map(name=><button key={name} aria-pressed={activeProvider===name} className={activeProvider===name?'active':''} onClick={()=>setProvider(name)}>{name}{!loading&&!sources.some(s=>s.provider===name)&&<small>Chưa có video</small>}</button>)}</div>
 {!names.length&&<small>Chưa có nguồn phát trong Cinema.</small>}
 </main>;
}
export default function App(){return <><header><Link className="brand" to="/"><Film size={24}/> cinema<span>.</span></Link><nav><Link to="/tools/media">Media tools</Link><Link to="/">Khám phá</Link><Link to="/library"><Bookmark size={17}/> Thư viện</Link></nav></header><Routes><Route path="/" element={<Home/>}/><Route path="/library" element={<Home key="library" library/>}/><Route path="/watch/:id" element={<Watch/>}/><Route path="/tools/media" element={<MediaTools/>}/><Route path="*" element={<main><h1>Không tìm thấy trang</h1><Link to="/">Trang chủ</Link></main>}/></Routes><footer>Cinema · v0.1.10 · Phim mẫu và danh mục liên kết bên ngoài.</footer></>}
