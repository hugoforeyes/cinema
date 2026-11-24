import type {ExternalListing} from './types.js';
export function episodePage(listing:ExternalListing|undefined,episodeId:string):string|undefined{
 const value=listing?.episodePages?.[episodeId];
 if(!value||!listing)return undefined;
 try{const url=new URL(value);const detail=new URL(listing.url);if(url.protocol!=='https:'||url.username||url.password||url.href===detail.href)return undefined;return url.href}catch{return undefined}
}
