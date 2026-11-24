import {useEffect,useRef,useState} from 'react';
import {defaultCrop,normalizeCrop,frameGeometry,type FrameCrop} from '../../shared/frame-crop';
import {parseEmbedUrl} from '../../shared/embed-url';
import {read,write} from './api';

export default function CroppedFrame({url,storageKey}:{url:string;storageKey:string}){
 const [crop,setCrop]=useState(()=>normalizeCrop({...defaultCrop,...read<Partial<FrameCrop>>('cinema:crop:'+storageKey,{})}));
 const [preview,setPreview]=useState(()=>!read<FrameCrop|null>('cinema:crop:'+storageKey,null));
 const [adjust,setAdjust]=useState(()=>!read<FrameCrop|null>('cinema:crop:'+storageKey,null));
 const [locked,setLocked]=useState(()=>!read<FrameCrop|null>('cinema:crop:'+storageKey,null));
 const [displayWidth,setDisplayWidth]=useState(390);
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{const el=ref.current;if(!el)return;const update=()=>setDisplayWidth(el.clientWidth||390);update();const observer=new ResizeObserver(update);observer.observe(el);return()=>observer.disconnect()},[]);
 useEffect(()=>{if(ref.current){ref.current.scrollTop=0;ref.current.scrollLeft=0}},[preview]);
 const g=frameGeometry(crop,displayWidth,preview);
 let src='';try{src=parseEmbedUrl(url,window.location.origin)}catch{}
 function change(key:keyof FrameCrop,value:number){setCrop(old=>normalizeCrop({...old,[key]:value}))}
 function save(){write('cinema:crop:'+storageKey,crop);setPreview(false);setAdjust(false);setLocked(false)}
 function reset(){setCrop(defaultCrop);write('cinema:crop:'+storageKey,null);setPreview(true);setAdjust(true);setLocked(true)}
 if(!src)return <p className="notice">URL nguồn không hợp lệ.</p>;
 return <section className="crop-player">
 <div ref={ref} className="crop-window" style={{height:g.height,overflow:preview?'auto':'hidden'}}>
 <div style={{position:'relative',width:displayWidth,height:preview?g.frameHeight*g.scale:g.height}}>
 <iframe title="Khung nguồn video" tabIndex={locked?-1:0} src={src} style={{position:'absolute',left:g.left,top:g.top,width:g.frameWidth,height:g.frameHeight,border:0,pointerEvents:locked?'none':'auto',transformOrigin:'top left',transform:'scale('+g.scale+')'}} sandbox="allow-scripts allow-presentation" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="no-referrer"/>
 {preview&&adjust&&<div aria-hidden="true" style={{position:'absolute',left:crop.x*g.scale,top:crop.y*g.scale,width:crop.width*g.scale,height:crop.height*g.scale,border:'2px solid #f07965',pointerEvents:'none',boxSizing:'border-box'}}/>}
 </div></div>
 <div className="crop-actions"><button className="secondary" onClick={()=>{setPreview(v=>!v);setAdjust(true)}}>{preview?'Xem vùng cắt':'Xem toàn trang'}</button><button className="secondary" onClick={()=>setAdjust(v=>!v)}>{adjust?'Ẩn căn chỉnh':'Căn chỉnh'}</button><button className="secondary" aria-pressed={locked} onClick={()=>setLocked(v=>!v)}>{locked?'Cho phép thao tác':'Khóa thao tác'}</button></div>
 {locked&&<small>Đã khóa thao tác trong iframe. Mở khóa khi cần bấm Play.</small>}
 {adjust&&<div className="crop-controls"><small>Căn vùng màu cam tới trình phát, rồi bấm Lưu vùng xem. Mở khóa thao tác khi cần dùng trình phát. Các thao tác bắt buộc của nguồn vẫn phải được thực hiện trong chế độ toàn trang.</small>
 {([
 ['viewportWidth','Rộng trang',320,1600],['viewportHeight','Cao trang',400,4000],['x','Vị trí ngang',0,Math.max(0,crop.viewportWidth-crop.width)],['y','Vị trí dọc',0,Math.max(0,crop.viewportHeight-crop.height)],['width','Rộng vùng cắt',120,crop.viewportWidth],['height','Cao vùng cắt',68,crop.viewportHeight]
 ] as [keyof FrameCrop,string,number,number][]).map(([key,label,min,max])=><label key={key}><span>{label} <small>{Math.round(crop[key])} px</small></span><input type="range" min={min} max={max} step={1} value={crop[key]} onChange={e=>change(key,Number(e.target.value))}/></label>)}
 <div className="crop-actions"><button className="primary" onClick={save}>Lưu vùng xem</button><button className="secondary" onClick={reset}>Đặt lại</button></div></div>}
 <small>Nếu trang chặn iframe hoặc cần thao tác ngoài vùng cắt, mở toàn trang hoặc <a className="crop-link" href={src} target="_blank" rel="noopener noreferrer">trang gốc</a>. Iframe chặn popup và chuyển hướng cửa sổ chính, nhưng không thể nhận diện hoặc loại bỏ quảng cáo bên trong trang. Chỉ dùng với nội dung được phép nhúng.</small>
 </section>
}
