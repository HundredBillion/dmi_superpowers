import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const home=fs.mkdtempSync(path.join(os.tmpdir(),'dmi-codex-package-'));
fs.writeFileSync(path.join(home,'config.toml'),'[features]\nhooks = true\n');
let child;
async function server() {
 child=spawn(process.env.CODEX_BIN || 'codex',['app-server','--stdio'],{env:{...process.env,CODEX_HOME:home},stdio:['pipe','pipe','pipe']});
 let sequence=0;const pending=new Map();let stderr='';
 child.stderr.on('data',bytes=>{stderr+=bytes;});
 readline.createInterface({input:child.stdout}).on('line',line=>{
  let message;try{message=JSON.parse(line);}catch{return;}
  const item=pending.get(message.id);if(!item)return;
  clearTimeout(item.timer);pending.delete(message.id);
  message.error?item.reject(Error(JSON.stringify(message.error))):item.resolve(message.result);
 });
 const request=(method,params)=>new Promise((resolve,reject)=>{
  const id=++sequence;
  const timer=setTimeout(()=>{pending.delete(id);reject(Error('Timed out: '+method+' '+stderr.slice(-1500)));},30000);
  pending.set(id,{resolve,reject,timer});child.stdin.write(JSON.stringify({id,method,params})+'\n');
 });
 await request('initialize',{clientInfo:{name:'dmi_package_verification',version:'0.1.0'},capabilities:{experimentalApi:true}});
 child.stdin.write(JSON.stringify({method:'initialized'})+'\n');
 return request;
}
const stop=async()=>{
 if(!child)return;
 child.stdin.end();
 await new Promise(resolve=>{const timer=setTimeout(()=>child.kill('SIGTERM'),3000);child.once('exit',()=>{clearTimeout(timer);resolve();});});
};
const hooks=async request=>{
 const response=await request('hooks/list',{cwds:[repo]});
 return response.data.flatMap(entry=>entry.hooks).filter(hook=>hook.pluginId==='dmi-superpowers@dmi-marketplace');
};
try {
 let request=await server();
 console.log('Marketplace:',JSON.stringify(await request('marketplace/add',{source:repo})));
 console.log('Install:',JSON.stringify(await request('plugin/install',{marketplacePath:path.join(repo,'.agents/plugins/marketplace.json'),pluginName:'dmi-superpowers'})));
 let listed=await hooks(request);
 console.log('After install:',JSON.stringify(listed.map(h=>({event:h.eventName,trust:h.trustStatus,hash:h.currentHash}))));
 assert.equal(listed.length,3);
 assert(listed.every(h=>h.trustStatus==='untrusted'),'A fresh package must require initial review');
 assert(listed.every(h=>h.currentHash.split('/').length===2),
  'This check requires plugin-content fingerprints (tested with Codex 0.164.0); set CODEX_BIN to that executable');
 // Simulate the saved user approval only in this disposable test profile.
 for (const hook of listed) {
  const [definition,content]=hook.currentHash.split('/');
  fs.appendFileSync(path.join(home,'config.toml'),'\n[hooks.state.'+JSON.stringify(hook.key)+']\ntrusted_hash = '+JSON.stringify(definition)+'\ntrusted_content_hash = '+JSON.stringify(content)+'\n');
 }
 const hashes=listed.map(h=>h.currentHash);
 const installed=path.dirname(path.dirname(listed[0].sourcePath));
 assert(!fs.existsSync(path.join(installed,'.git')));
 await stop();request=await server();listed=await hooks(request);
 assert.deepEqual(listed.map(h=>h.currentHash),hashes);
 assert(listed.every(h=>h.trustStatus==='trusted'));
 console.log('Cold restart: all three hooks remain trusted');
 fs.appendFileSync(path.join(installed,'hooks/session-start-codex'),'\n');
 listed=await hooks(request);
 assert(listed.every(h=>h.trustStatus==='modified'),'Real code changes must invalidate trust');
 console.log('Real hook modification: trust invalidated');
} finally {await stop();fs.rmSync(home,{recursive:true,force:true});}
