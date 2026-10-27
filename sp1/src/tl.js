// 用桩画布逐帧跑引擎，抓运行时错误（不出图）
const fs = require('fs'), vm = require('vm');
const path = process.argv[2] || 'web/engine.js';
const durs = process.argv[3] ? JSON.parse(fs.readFileSync(process.argv[3], 'utf8')) : {};
let font = '10px x';
const ctx = new Proxy({}, {
  get(o, k) {
    if (k === 'measureText') return s => ({ width: String(s).length * (parseFloat((font.match(/(\d+(\.\d+)?)px/) || [0, 10])[1])) * 0.6 });
    if (k === 'font') return font;
    if (k in o) return o[k];
    if (k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern') return () => ({ addColorStop() {} });
    if (k === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
    return () => {};
  },
  set(o, k, v) { if (k === 'font') font = v; else o[k] = v; return true; },
});
const canvas = { getContext: () => ctx, width: 1920, height: 1080 };
class Image { constructor() { this.width = 0; this.height = 0; } set src(v) { this._s = v; setTimeout(() => this.onload && this.onload(), 0); } }
const sandbox = { console, Math, JSON, Promise, setTimeout, performance: { now: () => 0 }, requestAnimationFrame: () => {}, Image,
  document: { getElementById: () => canvas, createElement: () => canvas, fonts: { load: async () => {}, ready: Promise.resolve() } },
  OffscreenCanvas: function () { return canvas; } };
sandbox.window = sandbox; sandbox.window.__EXPORT__ = true; sandbox.window.DUR = durs;
vm.createContext(sandbox);
try { vm.runInContext(fs.readFileSync(path, 'utf8'), sandbox, { filename: path }); } catch (e) { console.log('LOAD ERROR', e.stack.split('\n').slice(0, 4).join('\n')); process.exit(1); }
const TL = sandbox.TIMELINE; console.log('TOTAL', TL.total.toFixed(1), 'blocks', TL.blocks.length, 'sfx', TL.sfx.length);
const f = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
for (const b of TL.blocks) console.log(f(b.t0), b.b, b.t0.toFixed(2), b.t1.toFixed(2));
