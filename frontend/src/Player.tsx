import {useEffect,useRef,useState} from 'react';
import Hls from 'hls.js';
import type {VideoSource} from '../../shared/types';
import {read,write} from './api';
export default function Player({source,progressKey,subtitleUrl}:{source:VideoSource;progressKey:string;subtitleUrl?:string}){
 const ref=useRef<HTMLVideoElement>(null);
 const [error,setError]=useState('');
 useEffect(()=>{
  const video=ref.current!; let hls:Hls|undefined; setError('');
  const start=read<number>(progressKey,0);
  const restore=()=>{if(start>0&&Number.isFinite(video.duration)&&start<video.duration-5)video.currentTime=start;};
  const fail=()=>setError('Không thể phát nguồn này. Hãy thử nguồn khác.');
  const save=()=>{if(video.currentTime>0)write(progressKey,video.currentTime)};
  video.addEventListener('loadedmetadata',restore);
  video.addEventListener('error',fail);
  video.addEventListener('pause',save);
  video.addEventListener('timeupdate',save);
  if(source.type==='hls'&&!video.canPlayType('application/vnd.apple.mpegurl')){
   if(Hls.isSupported()){hls=new Hls();hls.loadSource(source.url);hls.attachMedia(video);hls.on(Hls.Events.ERROR,(_,data)=>{if(data.fatal)fail()})}
   else fail();
  }else video.src=source.url;
  return ()=>{save();video.removeEventListener('loadedmetadata',restore);video.removeEventListener('error',fail);video.removeEventListener('pause',save);video.removeEventListener('timeupdate',save);hls?.destroy();video.pause();video.removeAttribute('src');video.load()};
 },[source.url,source.type,progressKey]);
 return <div className="player"><video ref={ref} controls playsInline preload="metadata">{subtitleUrl&&<track key={subtitleUrl} kind="subtitles" srcLang="vi" label="Tiếng Việt" src={subtitleUrl} default/>}</video>{error&&<p role="alert" className="notice">{error}</p>}</div>;
}
