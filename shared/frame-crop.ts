export interface FrameCrop {viewportWidth:number; viewportHeight:number; x:number; y:number; width:number; height:number}
export const defaultCrop:FrameCrop={viewportWidth:390,viewportHeight:1400,x:0,y:0,width:390,height:219.375};
const clamp=(n:number,min:number,max:number,fallback:number)=>Math.min(max,Math.max(min,Number.isFinite(n)?n:fallback));
export function normalizeCrop(value:FrameCrop):FrameCrop{
 const viewportWidth=clamp(value.viewportWidth,320,1600,390);
 const viewportHeight=clamp(value.viewportHeight,400,4000,1400);
 const width=clamp(value.width,120,viewportWidth,viewportWidth);
 const height=clamp(value.height,68,viewportHeight,219.375);
 return {viewportWidth,viewportHeight,width,height,x:clamp(value.x,0,viewportWidth-width,0),y:clamp(value.y,0,viewportHeight-height,0)};
}
export function frameGeometry(value:FrameCrop,displayWidth:number,preview=false){
 const c=normalizeCrop(value);
 const width=Number.isFinite(displayWidth)&&displayWidth>0?displayWidth:1;
 const scale=width/(preview?c.viewportWidth:c.width);
 return {scale,frameWidth:c.viewportWidth,frameHeight:c.viewportHeight,left:preview?0:-c.x*scale,top:preview?0:-c.y*scale,height:scale*(preview?Math.min(c.viewportHeight,800):c.height)};
}
