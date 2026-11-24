import EpisodePlayer from './EpisodePlayer';
export default function MediaTools(){
 return <main><h1>Media tools</h1><p>Công cụ thử trình phát, độc lập với danh mục phim. Nhập báo cáo Local Inspector, video của bạn hoặc URL trình phát nhúng được phép.</p>
 <EpisodePlayer movieId="media-tools" count={1}/>
 <h2>Local Inspector</h2><p><small>Chạy các lệnh sau trong thư mục source code Cinema trên máy tính. Sau đó chọn file .cinema/sources.json trong ô nhập báo cáo.</small></p>
 <pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',background:'#1d1d25',padding:14,borderRadius:12}}>{'npm install\nnpx playwright install chromium\nnpm run inspect -- "https://example.com/watch"'}</pre>
 </main>;
}
