// SPDX-License-Identifier: AGPL-3.0-or-later
// Combines the unmodified Decimen standalone engines into a Vietnamese launcher.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const dir=resolve(process.argv[2] || 'dist-standalone');
const input={send:'decimen-sender.html',receive:'decimen-receiver.html'};
const pages=Object.fromEntries(Object.entries(input).map(([key,name])=>{
  const html=readFileSync(resolve(dir,name),'utf8');
  if(!/^<!doctype html>/i.test(html.trim()) || !/Content-Security-Policy/i.test(html) || !/<script\b/i.test(html))
    throw Error('Standalone build invalid: '+name);
  return [key,html];
}));
// Escape HTML-significant characters in JSON; never interpolate raw child HTML
// into an outer script tag. TextDecoder preserves the original UTF-8 bytes.
const encoded=JSON.stringify(Object.fromEntries(Object.entries(pages).map(([k,v])=>[k,Buffer.from(v,'utf8').toString('base64')])));
const html='<!doctype html>\n'+
'<!-- Optical Transfer HTML: modified launcher, Decimen engine © 2026 Evan Crawley, AGPL-3.0-or-later. Source: https://github.com/vuanhphap/decimen-optical-transfer/tree/release/optical-html -->\n'+
`<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#101923"><title>Optical Transfer · HTML</title>
<style>
*{box-sizing:border-box}html,body{margin:0;background:#101923;color:#e8f0f7;font:16px system-ui,sans-serif}button,a{font:inherit}button{cursor:pointer;color:inherit}header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 20px;border-bottom:1px solid #344454}header strong{letter-spacing:.04em}main{max-width:720px;margin:auto;padding:32px 20px}h1{font-size:clamp(28px,6vw,44px);line-height:1.1;margin:16px 0}p{line-height:1.6;color:#b5c5d4}.tag{color:#62dfb9;font-size:13px;font-weight:700;letter-spacing:.12em}.choices{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:28px 0}.choice{background:#1b2a39;border:1px solid #426078;border-radius:16px;padding:24px;text-align:left;min-height:132px}.choice:hover,.choice:focus-visible{border-color:#62dfb9}.choice b{font-size:24px;display:block;margin-bottom:8px}.choice span{color:#b5c5d4}.notice{border:1px solid #526276;padding:14px 18px;border-radius:12px;margin:16px 0;color:#d7e3ee}.warn{border-color:#ac8042;color:#ffe0a7}.secondary{border:1px solid #526276;border-radius:9px;background:#1b2a39;padding:10px 14px;margin:4px 4px 4px 0}a{color:#8bd8fb}#workspace{height:100dvh;display:flex;flex-direction:column}#workspace[hidden],#home[hidden]{display:none}#mount{flex:1;min-height:0}iframe{border:0;width:100%;height:100%;display:block}small{color:#b5c5d4}footer{margin-top:24px;font-size:13px;color:#9bafbf}button:focus-visible,a:focus-visible{outline:3px solid #62dfb9;outline-offset:3px}
</style></head><body>
<div id="home"><header><strong>OPTICAL TRANSFER</strong><small>HTML · v3</small></header><main><span class="tag">TRUYỀN DỮ LIỆU QUANG HỌC</span><h1>Gửi và nhận file qua camera</h1><p>Mở cùng công cụ trên hai thiết bị. Một màn hình phát mã QR, camera thiết bị còn lại nhận dữ liệu.</p>
<div class="choices"><button class="choice" id="send"><b>↗ Gửi file</b><span>Chọn file hoặc văn bản để phát mã QR.</span></button><button class="choice" id="receive"><b>↙ Nhận file</b><span>Mở camera và quét màn hình thiết bị gửi.</span></button></div>
<div class="notice" id="compat" role="status"></div><div class="notice warn"><b>Lưu ý bảo mật:</b> Phiên bản này không mã hóa dữ liệu. Chỉ dùng dữ liệu được phép chia sẻ, tránh để người khác quay màn hình đang phát.</div>
<details><summary>Hướng dẫn sử dụng</summary><p>1. Máy gửi chọn Gửi file. Máy nhận chọn Nhận file và cấp quyền camera.<br>2. Đặt camera hướng thẳng vào QR; giữ hai máy ổn định.<br>3. Chờ máy nhận xác minh SHA-256 rồi lưu file. Nếu camera không khả dụng, mở trang qua HTTPS hoặc dùng bản PWA offline.</p><p>Động cơ Decimen giữ nguyên giới hạn file và các cài đặt QR gốc. Giao diện điều khiển bên trong dùng các ngôn ngữ có sẵn của Decimen.</p></details>
<p><button class="secondary" id="downloadSend">Lưu HTML gửi riêng</button><button class="secondary" id="downloadReceive">Lưu HTML nhận riêng</button></p>
<footer>Decimen engine © 2026 Evan Crawley (Bash Alarmist) · AGPL-3.0-or-later. <a href="https://github.com/vuanhphap/decimen-optical-transfer/tree/release/optical-html" target="_blank" rel="noopener noreferrer">Mã nguồn bản chỉnh sửa</a> · <a href="https://github.com/bashalarmistalt/decimen-optical-transfer" target="_blank" rel="noopener noreferrer">Dự án gốc</a></footer></main></div>
<div id="workspace" hidden><header><button class="secondary" id="back">← Trang chính</button><strong id="mode"></strong></header><div id="mount"></div></div>
<script id="payload" type="application/json">`+encoded+`</script>
<script>
'use strict';
const $=id=>document.getElementById(id);
const data=JSON.parse($('payload').textContent);
const page=k=>new TextDecoder().decode(Uint8Array.from(atob(data[k]),c=>c.charCodeAt(0)));
const camera=!!(window.isSecureContext&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia);
$('compat').textContent=location.protocol==='file:'?'Đang mở file cục bộ. Máy gửi có thể hoạt động; iPhone/Android thường không cho trang file:// dùng camera. Máy nhận nên mở qua HTTPS.':camera?'Trình duyệt có API camera. Quyền camera chỉ được hỏi khi bạn khởi động camera.':'Camera chưa khả dụng trong ngữ cảnh này. Mở bằng trình duyệt hiện đại qua HTTPS.';
function openMode(k){
  $('home').hidden=true;$('workspace').hidden=false;$('mode').textContent=k==='send'?'GỬI FILE':'NHẬN FILE';
  const frame=document.createElement('iframe');frame.title=k==='send'?'Decimen sender':'Decimen receiver';
  frame.setAttribute('allow','camera; fullscreen');frame.setAttribute('allowfullscreen','');
  frame.srcdoc=page(k);$('mount').replaceChildren(frame);
}
$('send').onclick=()=>openMode('send');
$('receive').onclick=()=>openMode('receive');
$('back').onclick=()=>{if(!confirm('Về trang chính sẽ dừng phiên hiện tại. Tiếp tục?'))return;$('mount').replaceChildren();$('workspace').hidden=true;$('home').hidden=false;};
function save(k){const url=URL.createObjectURL(new Blob([page(k)],{type:'text/html;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=k==='send'?'decimen-sender.html':'decimen-receiver.html';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
$('downloadSend').onclick=()=>save('send');$('downloadReceive').onclick=()=>save('receive');
</script></body></html>
`;
const out=resolve(dir,'optical-transfer.html');
writeFileSync(out,html,'utf8');
console.log('Built '+out+' ('+Buffer.byteLength(html)+' bytes)');
