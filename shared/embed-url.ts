export function parseEmbedUrl(input:string, origin:string):string {
 const url=new URL(input.trim());
 if(url.protocol!=='https:'||url.username||url.password||url.origin===origin) throw new Error('Cần URL HTTPS của trình phát nhúng bên ngoài được phép sử dụng.');
 return url.href;
}
