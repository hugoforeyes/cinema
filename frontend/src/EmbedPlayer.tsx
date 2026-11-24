import {useState} from 'react';
import {parseEmbedUrl} from '../../shared/embed-url';
type PageLink={name:string;url:string};
export default function EmbedPlayer({pageLinks=[]}:{pageLinks?:PageLink[]}){
 const [input,setInput]=useState('');
 const [src,setSrc]=useState('');
 const [error,setError]=useState('');
 function open(value:string){try{setSrc(parseEmbedUrl(value,window.location.origin));setInput(value);setError('')}catch(e){setSrc('');setError(e instanceof Error?e.message:'URL không hợp lệ.')}}
 return <section style={{marginTop:16,padding:16,background:'#1d1d25',borderRadius:12,display:'grid',gap:10}}>
 <h2 style={{margin:0}}>Trình phát nhúng</h2>
 {!src&&<div className="player empty" style={{textAlign:"center",padding:20}}><div><strong>Chọn nguồn bên dưới</strong><p><small>Chưa có nguồn video được xác minh.</small></p></div></div>}
 {pageLinks.length>0&&<><strong>Chọn trang nguồn</strong><div className="choices">{pageLinks.map(item=><button type="button" key={item.url} aria-pressed={src===item.url} className={src===item.url?'active':'secondary'} onClick={()=>open(item.url)}>{item.name}</button>)}</div></>}
 <details><summary style={{cursor:"pointer",padding:"8px 0"}}>Nhập URL embed khác</summary><form style={{display:'grid',gap:10}} onSubmit={e=>{e.preventDefault();open(input)}}>
 <label>URL embed được phép sử dụng<input required type="url" value={input} onChange={e=>setInput(e.target.value)} style={{display:'block',width:'100%',padding:10,background:'#101014',borderRadius:8}} placeholder="https://example.com/embed/video"/></label>
 <button className="primary" type="submit">Mở trình phát nhúng</button>
 </form></details>
 {pageLinks.length>0&&<small>Đây là các trang phim, không phải URL video đã xác minh. Chọn tập tại trang nguồn nếu trang cho phép nhúng.</small>}
 {error&&<p role="alert" className="notice">{error}</p>}
 {src&&<><iframe key={src} src={src} title="Trình phát nhúng" style={{width:'100%',aspectRatio:'16 / 9',border:0,background:'#080809'}} sandbox="allow-scripts allow-presentation" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="no-referrer"/>
 <div className="choices"><button className="secondary" onClick={()=>setSrc('')}>Đóng trình phát</button><a className="secondary" href={src} target="_blank" rel="noopener noreferrer">Mở trang gốc</a></div></>}
 <small>Chỉ phát nội dung được phép sử dụng. Trang nguồn được hiển thị nguyên trạng, nếu chính sách nhúng cho phép. Trình duyệt có thể chặn iframe hoặc yêu cầu quyền bổ sung; Cinema không sửa header bảo mật. Iframe load không đồng nghĩa với video phát được. Phụ đề và tiến độ do trình phát nguồn quản lý.</small>
 </section>
}
