import type { Movie, Episode, VideoSource } from '../../shared/types.js';

export interface MovieProvider {
  name: string;
  search(query: string): Promise<Movie[]>;
  getEpisodes(movieId: string): Promise<Episode[]>;
  getVideoSources(movieId: string, episodeId: string): Promise<VideoSource[]>;
}
const base = 'https://storage.googleapis.com/gtv-videos-bucket/sample/';
const catalog: (Movie & { file: string })[] = [
 {id:'big-buck-bunny',title:'Big Buck Bunny',year:2008,genre:'Animation · Comedy',duration:'10 min',description:'A gentle giant rabbit turns the tables on three mischievous forest creatures.',artwork:base+'images/BigBuckBunny.jpg',credit:'Blender Foundation · CC BY',file:'BigBuckBunny.mp4'},
 {id:'sintel',title:'Sintel',year:2010,genre:'Fantasy · Adventure',duration:'15 min',description:'A young traveler searches for a dragon she once rescued.',artwork:base+'images/Sintel.jpg',credit:'Blender Foundation · CC BY',file:'Sintel.mp4'},
 {id:'elephants-dream',title:'Elephants Dream',year:2006,genre:'Animation · Sci-fi',duration:'11 min',description:'Two travelers explore a strange mechanical world.',artwork:base+'images/ElephantsDream.jpg',credit:'Blender Foundation · CC BY',file:'ElephantsDream.mp4'}
];
function publicMovie({file: _file,...movie}: typeof catalog[number]): Movie { return movie; }
export function normalizeSearch(value:string):string {
 return value.toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replace(/đ/g,'d').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
}
function matches(movie:Movie, query:string) {
 const q=normalizeSearch(query);
 const haystack=normalizeSearch([movie.title,movie.genre,String(movie.year),...(movie.aliases??[])].join(' '));
 return !q || q.split(' ').every(word=>haystack.includes(word));
}
const officialMovie:Movie = {
 id:'jirai-glico',title:'Kéo Búa Mìn',year:2026,genre:'Bí ẩn · Chính kịch · Nhật Bản',
 duration:'6 tập',description:'Một nữ sinh có tài chơi trò chơi đối đầu với những đối thủ trong các cuộc đấu trí đầy bất ngờ.',
 artwork:'/jirai-glico.svg',credit:'Prime Video · Nguồn phát chính thức',
 aliases:['Kéo, Búa, Mìn','Rock, Paper, Landmines','Rock, Paper, Landmine','Jirai Glico','地雷グリコ','Vietsub','phụ đề tiếng Việt'],
 watchUrl:'https://www.primevideo.com/detail/0H3KVJK9MTLRPQKPE8OUY64YJU',
 externalListings:[
  {name:'Đảo Phim',url:'https://daophim.lat/',language:'Vietsub',reportedEpisodes:6,episodePages:{'1':'https://daophim.lat/xem-phim/keo-bua-min/tap-01/nguonc?server=vietsub-1','3':'https://daophim.lat/xem-phim/keo-bua-min/tap-03/nguonc?server=vietsub-1'}},
  {name:'Motchill',url:'https://motchillti.mx/phim/keo-bua-min',language:'Vietsub',reportedEpisodes:6,episodePages:{'1':'https://motchillfv.help/xem-phim/keo-bua-min-tap-1/?sv=vietsub-1'}},
  {name:'RoPhim',url:'https://rophim.bar/phimmoi-keo-bua-min-22753.html',language:'Vietsub',reportedEpisodes:6},
  {name:'PhimSubViet',url:'https://phimsubviet.me/phim/keo-bua-min',language:'Vietsub',reportedEpisodes:6},
  {name:'Movina',url:'https://www.movina.tv/phim/keo-bua-min',language:'Vietsub',reportedEpisodes:6},
  {name:'PhimMoiGo',url:'https://phimmoigo.net/phim/keo-bua-min',language:'Vietsub',reportedEpisodes:6}
 ]
};
const episode = {id:'feature',title:'Full movie'};
export const providers: MovieProvider[] = [
 {name:'Public MP4',
  async search(q){return catalog.filter(m=>matches(m,q)).map(publicMovie)},
  async getEpisodes(id){return catalog.some(m=>m.id===id)?[episode]:[]},
  async getVideoSources(id,ep){const m=catalog.find(m=>m.id===id);return m&&ep===episode.id?[{id:'mp4-'+id,provider:'Public MP4',label:'MP4',type:'mp4',url:base+m.file}]:[]}},
 {name:'Mux HLS demo',
  async search(q){return catalog.slice(0,1).filter(m=>matches(m,q)).map(publicMovie)},
  async getEpisodes(id){return id===catalog[0].id?[episode]:[]},
  async getVideoSources(id,ep){return id===catalog[0].id&&ep===episode.id?[{id:'hls-bunny',provider:'Mux HLS demo',label:'Adaptive HLS',type:'hls',url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'}]:[]}},
 {name:'Official viewing links',async search(q){return matches(officialMovie,q)?[officialMovie]:[]},async getEpisodes(id){return id===officialMovie.id?Array.from({length:6},(_,i)=>({id:String(i+1),title:'Tập '+(i+1)})):[]},async getVideoSources(){return []}}
];
