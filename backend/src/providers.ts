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
function matches(movie:Movie, query:string) {
 const q=query.trim().toLowerCase(); return !q || [movie.title,movie.genre,String(movie.year)].join(' ').toLowerCase().includes(q);
}
const episode = {id:'feature',title:'Full movie'};
export const providers: MovieProvider[] = [
 {name:'Public MP4',
  async search(q){return catalog.filter(m=>matches(m,q)).map(publicMovie)},
  async getEpisodes(id){return catalog.some(m=>m.id===id)?[episode]:[]},
  async getVideoSources(id,ep){const m=catalog.find(m=>m.id===id);return m&&ep===episode.id?[{id:'mp4-'+id,provider:'Public MP4',label:'MP4',type:'mp4',url:base+m.file}]:[]}},
 {name:'Mux HLS demo',
  async search(q){return catalog.slice(0,1).filter(m=>matches(m,q)).map(publicMovie)},
  async getEpisodes(id){return id===catalog[0].id?[episode]:[]},
  async getVideoSources(id,ep){return id===catalog[0].id&&ep===episode.id?[{id:'hls-bunny',provider:'Mux HLS demo',label:'Adaptive HLS',type:'hls',url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'}]:[]}}
];
