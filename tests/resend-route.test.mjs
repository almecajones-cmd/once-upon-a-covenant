import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source=ts.transpileModule(readFileSync(new URL('../app/api/admin/communications/resend/route.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
function route({authorized=true,claim={claimed:true,recipients:['one@example.com']},readError=null,sendOk=true}={}){
  const calls=[];const chain={select(){return this},eq(){return this},async maybeSingle(){return {data:{id:'a',confirmation_code:'OUC-TEST'},error:readError}}};
  const mocks={
    'next/server':{NextResponse:{json:(body,options={})=>({body,status:options.status||200})}},
    '@/lib/adminCommunications':{authorizedAdmin:async()=>authorized?{email:'admin@example.com'}:null},
    '@/lib/server':{serviceClient:()=>({from:()=>chain,rpc:async()=>{calls.push('claim');return {data:claim,error:null}}})},
    '@/lib/confirmationEmail':{confirmationEmail:()=>({subject:'Confirmation',text:'Current balance'})},
    '@/lib/emailAudit':{sendTrackedEmail:async args=>{calls.push(args);return {ok:sendOk,id:sendOk?'provider':null}},logAppEvent:async()=>{}},
  };const context={exports:{},require:name=>mocks[name],console,URL};vm.runInNewContext(source,context);return {post:context.exports.POST,calls};
}
const request=(overrides={})=>new Request('https://example.com/api/admin/communications/resend',{method:'POST',headers:{'content-type':'application/json',origin:'https://example.com',...overrides},body:JSON.stringify({registrationId:'11111111-1111-4111-8111-111111111111',requestId:'22222222-2222-4222-8222-222222222222'})});
test('unauthenticated requests never claim or send',async()=>{const r=route({authorized:false});assert.equal((await r.post(request())).status,401);assert.equal(r.calls.length,0)});
test('cross-origin requests never claim or send',async()=>{const r=route();assert.equal((await r.post(request({origin:'https://attacker.example'}))).status,403);assert.equal(r.calls.length,0)});
test('duplicate or blocked claims never reach email provider',async()=>{for(const reason of ['cooldown','already_processed','recipient_blocked']){const r=route({claim:{claimed:false,reason}});assert.equal((await r.post(request())).status,409);assert.deepEqual(r.calls,['claim']);}});
test('successful resend uses recipients from database claim and durable request ID',async()=>{const r=route();assert.equal((await r.post(request())).status,200);assert.equal(r.calls[1].to[0],'one@example.com');assert.equal(r.calls[1].auditId,'22222222-2222-4222-8222-222222222222')});
test('provider failure is not reported as success',async()=>{const r=route({sendOk:false});assert.equal((await r.post(request())).status,502)});
