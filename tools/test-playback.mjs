import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {chromium, webkit} from 'playwright';

// Generate our own short film. No requests go to commercial media sites.
const clip = execFileSync('ffmpeg', ['-loglevel','error','-f','lavfi','-i',
  'testsrc2=size=240x136:rate=12','-t','8','-c:v','libx264','-pix_fmt','yuv420p',
  '-movflags','frag_keyframe+empty_moov','-f','mp4','pipe:1']).toString('base64');
const subtitles = encodeURIComponent('WEBVTT\n\n00:00:00.000 --> 00:00:07.900\nPhụ đề thử nghiệm\n');
const engine = process.argv[2] || 'chromium';
const browser = await ({chromium,webkit}[engine]).launch({
  executablePath:process.env.BROWSER_EXECUTABLE || undefined
});
try {
  const context = await browser.newContext({viewport:{width:390,height:844},hasTouch:true,serviceWorkers:'block'});
  const page = await context.newPage();
  const base = process.env.CINEMA_URL || 'http://localhost:8080';
  const fixture = 'https://cinema-fixture.test';
  await page.route('**/api/movies/jirai-glico', async route => {
    const response = await route.fetch();
    const movie = await response.json();
    movie.externalListings = [{name:'Nguồn thử',url:fixture+'/series',language:'Vietsub',
      reportedEpisodes:6,episodePages:{1:fixture+'/1',2:fixture+'/2',4:fixture+'/blocked'}}];
    await route.fulfill({response,json:movie});
  });
  await page.route(fixture+'/**', route => {
    const path = new URL(route.request().url()).pathname;
    if(path==='/blocked') return route.fulfill({contentType:'text/html',
      headers:{'Content-Security-Policy':"frame-ancestors 'none'"},body:'<button>Forbidden player</button>'});
    return route.fulfill({contentType:'text/html',body:`<style>*{margin:0}main{margin-top:80px}video{width:240px;display:block}</style><main>
      <video muted playsinline src="data:video/mp4;base64,${clip}"><track default kind="subtitles" srclang="vi" src="data:text/vtt,${subtitles}"></video>
      <button onclick="v.play()">Play ${path}</button><button onclick="v.pause()">Pause</button>
      <button onclick="v.currentTime=4">Seek</button><button onclick="probe()">Probe</button>
      <output></output><script>const v=document.querySelector('video');function probe(){
        const popup=window.open('about:blank');let blocked=false;
        try{top.location.href='https://cinema-fixture.test/escaped'}catch{blocked=true}
        document.querySelector('output').textContent=String(!popup && blocked)}
      </script></main>`});
  });
  await page.goto(base);
  const search = page.getByRole('textbox',{name:'Tìm phim'});
  await search.dispatchEvent('compositionstart');
  await search.fill('Kéo Búa Mìn');
  await search.dispatchEvent('compositionend');
  await page.locator('a[href="/watch/jirai-glico"]').first().click();
  await page.getByRole('button',{name:'Nguồn thử'}).click();
  const frame = page.frameLocator('iframe');
  const play = frame.getByRole('button',{name:'Play /1',exact:true});
  await play.tap(); // preview overlay must allow touches
  const video = frame.locator('video');
  await video.evaluate(v=>new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(Error('no video progress or Vietnamese cue')),8000);
    function check(){if(v.currentTime>.25 && v.textTracks[0]?.activeCues?.[0]?.text==='Phụ đề thử nghiệm'){
      clearTimeout(timeout);v.removeEventListener('timeupdate',check);resolve();}}
    v.addEventListener('timeupdate',check);check();
  }));
  await frame.getByText('Pause',{exact:true}).tap();
  assert(await video.evaluate(v=>v.paused));
  await frame.getByText('Seek',{exact:true}).tap();
  assert(Math.abs(await video.evaluate(v=>v.currentTime)-4)<.1);
  const vertical = page.getByRole('slider',{name:/Vị trí dọc/});
  for(let i=0;i<80;i++) await vertical.press('ArrowRight');
  await page.getByText('Lưu vùng xem').click();
  for(const width of [390,768]){
    await page.setViewportSize({width,height:844});
    await page.waitForFunction(()=>{
      const box=document.querySelector('.crop-window').getBoundingClientRect();
      const frame=document.querySelector('iframe').getBoundingClientRect();
      return Math.abs(frame.y+80*frame.width/390-box.y)<3 &&
        Math.abs(frame.width-box.width)<4;
    });
    await frame.getByText('Probe').tap();
    assert.equal(await frame.locator('output').textContent(),'true');
    assert.equal(context.pages().length,1);
    assert.equal(new URL(page.url()).pathname,'/watch/jirai-glico');
  }
  await page.getByText('Khóa thao tác',{exact:true}).click();
  const bounds=await play.boundingBox();
  await page.touchscreen.tap(bounds.x+bounds.width/2,bounds.y+bounds.height/2);
  assert(await video.evaluate(v=>v.paused));
  await page.getByText('Cho phép thao tác',{exact:true}).click();
  await play.tap();
  assert.equal(await video.evaluate(v=>v.paused),false);
  const previous=page.frames().find(f=>f.url()===fixture+'/1');
  await page.getByText('Tập 2',{exact:true}).click();
  await frame.getByText('Play /2').waitFor();
  assert(previous.isDetached());
  assert(await page.getByText('Xem toàn trang',{exact:true}).isVisible());
  await page.reload();
  await page.getByRole('button',{name:'Nguồn thử'}).click();
  await play.waitFor();
  assert(await page.getByText('Xem toàn trang',{exact:true}).isVisible());
  await page.getByText('Tập 3',{exact:true}).click();
  await page.getByText('Chưa có link Tập 3',{exact:true}).waitFor();
  assert.equal(await page.locator('iframe').count(),0);
  await page.getByText('Tập 4',{exact:true}).click();
  await page.locator('iframe[src$="/blocked"]').waitFor();
  await page.waitForLoadState('networkidle');
  assert.equal(await frame.getByText('Forbidden player').count(),0);
  console.log(engine+' PASS: touch, timed Vietnamese cue, transport, sandbox, crop, persistence, episode switching and missing mapping.');
} finally {
  await browser.close();
}
