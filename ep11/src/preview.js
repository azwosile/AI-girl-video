// 本地预览：node-canvas 真画布渲染指定时间点 → jpg（缺的立绘用灰块占位）
let cvSame;
const fs = require('fs'), vm = require('vm');
const { createCanvas, loadImage } = require('/home/user/ep11w/node_modules/canvas');
const [,, path, durPath, outPrefix, ...times] = process.argv;
const durs = JSON.parse(fs.readFileSync(durPath, 'utf8'));
const canvas = createCanvas(1920, 1080);
const pending = [];
class Image { constructor() { this.width = 0; this.height = 0; }
  set src(v) { const n = v.split('/').pop().replace('.webp', ''); const f = '/tmp/spr/' + n + '.png';
    const p = (fs.existsSync(f) && (!process.env.ONLY || process.env.ONLY.split(',').includes(n)) ? loadImage(f) : Promise.resolve(null)).then(im => {
      if (!im) { const c = createCanvas(600, 1100), x = c.getContext('2d'); x.fillStyle = 'rgba(150,150,170,0.85)'; x.fillRect(0, 0, 600, 1100); x.fillStyle = '#000'; x.font = '60px sans-serif'; x.fillText(n, 30, 200); im = c; }
      this._im = im; this.width = im.width; this.height = im.height; this.onload && this.onload(); });
    pending.push(p); } }
const sandbox = { console, Math, JSON, Promise, setTimeout, performance: { now: () => 0 }, requestAnimationFrame: () => {}, Image,
  document: { getElementById: () => canvas, createElement: () => createCanvas(10, 10), fonts: { load: async () => {}, ready: Promise.resolve() } } };
sandbox.window = sandbox; sandbox.window.__EXPORT__ = true; sandbox.window.DUR = durs;
vm.createContext(sandbox);
// drawImage 需要真实 Image：包装一层
const ctx = canvas.getContext('2d'); const di = ctx.drawImage.bind(ctx);
ctx.drawImage = (im, ...a) => { if (process.env.NODI) return; try { di(im && im._im ? im._im : im, ...a); } catch (e) { console.log('DI ERR', e.message, a.map(v => Math.round(v))); } };
// cairo：scale(0) 会让上下文永久进入错误状态（浏览器不会），这里夹一下
const sc0 = ctx.scale.bind(ctx); ctx.scale = (a, b) => sc0(Math.abs(a) < 1e-4 ? (a < 0 ? -1e-4 : 1e-4) : a, Math.abs(b) < 1e-4 ? (b < 0 ? -1e-4 : 1e-4) : b);
vm.runInContext(fs.readFileSync(path, 'utf8'), sandbox, { filename: path });
(async () => { await new Promise(r => setTimeout(r, 50)); await Promise.all(pending);
  const TL = sandbox.TIMELINE; const U = sandbox.eval ? null : null;
  for (const ts of times) { let t = parseFloat(ts);
    if (ts.includes('@')) { const [id, f] = ts.split('@'); const u = vm.runInContext(`U['${id}']`, sandbox); t = u.vo + u.dur * parseFloat(f); }
    ctx.setTransform(1, 0, 0, 1, 0, 0); console.log(vm.runInContext('[TOTAL, BLOCKS.length, typeof drawFrame]', sandbox)); try { sandbox.renderAt(t); } catch (e) { console.log('ERR', e.message, e.stack.split('\n')[1]); } console.log(ts, t, [...ctx.getImageData(1500, 400, 1, 1).data], cvSame = (sandbox.document.getElementById() === canvas)); fs.writeFileSync(`${outPrefix}_${ts.replace('@', '-')}.jpg`, canvas.toBuffer('image/jpeg', { quality: 0.7 })); }
  console.log('rendered', times.length, 'total', TL.total.toFixed(1)); })();
