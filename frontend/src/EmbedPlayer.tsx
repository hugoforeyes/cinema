import {useState} from 'react';
import {parseEmbedUrl} from '../../shared/embed-url';
export default function EmbedPlayer(){
 const [input,setInput]=useState('');
 const [src,setSrc]=useState('');
 const [error,setError]=useState('');
 return <section style={{marginTop:16,padding:16,background:'#1d1d25',borderRadius:12,display:'grid',gap:10}}>
 <h2>Trình phát nhúng (iframe)</h2>
 <form style={{display:'grid',gap:10}} onSubmit={e=>{e.preventDefault();try{setSrc(parseEmbedUrl(input,window.location.origin));setError('')}catch(e){setSrc('');setError(e instanceof Error?e.message:'URL không hợp lệ.')}}}>
 <label>URL embed được phép sử dụng<input required type="url" value={input} onChange={e=>setInput(e.target.value)} style={{display:'block',width:'100%',padding:10,background:'#101014',borderRadius:8}} placeholder="https://example.com/embed/video"/></label>
 <button className="primary" type="submit">Mở trình phát nhúng</button>
 </form>
 {error&&<p role="alert" className="notice">{error}</p>}
 {src&&<><iframe key={src} src={src} title="Trình phát nhúng" style={{width:'100%',aspectRatio:'16 / 9',border:0,background:'#080809'}} sandbox="allow-scripts allow-presentation" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="no-referrer"/>
 <div className="choices"><button className="secondary" onClick={()=>setSrc('')}>Đóng trình phát</button><a className="secondary" href={src} target="_blank" rel="noopener noreferrer">Mở trang gốc</a></div></>}
 <small>Chỉ dùng URL nhúng được chủ nguồn cho phép. Trình duyệt có thể chặn iframe hoặc yêu cầu quyền bổ sung; Cinema không sửa header bảo mật. Iframe load không đồng nghĩa với video phát được. Phụ đề và tiến độ do trình phát nguồn quản lý.</small>
 </section>
}
