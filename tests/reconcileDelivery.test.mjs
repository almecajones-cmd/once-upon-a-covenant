import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import * as status from '../lib/communicationStatus.ts';
const source=ts.transpileModule(readFileSync(new URL('../lib/reconcileDelivery.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const context={exports:{},require:()=>status,Date,Set};
vm.runInNewContext(source,context);
const reconcile=context.exports.reconcileDelivery;
const now=Date.parse('2026-10-13T03:00:00Z');
const row=(overrides={})=>({id:'message',provider_email_id:'provider',delivery_status:'sent',send_status:'sent',created_at:'2026-10-11T01:00:00Z',updated_at:'2026-10-11T01:00:00Z',metadata:{confirmationCode:'OUC-TEST'},...overrides});
test('provider delivery updates status and audit metadata without sending',async()=>{
  const rows=[row()];let saved;
  const result=await reconcile(rows,[],{lookup:async id=>({id,last_event:'delivered'}),save:async(r,p)=>(saved=p,true),pause:async()=>{}},now);
  assert.equal(result.updated,1);assert.equal(rows[0].delivery_status,'delivered');assert.equal(saved.metadata.confirmationCode,'OUC-TEST');assert.equal(saved.metadata.provider_checked_at,new Date(now).toISOString());
});
test('suppressed provider result remains an actionable exception',async()=>{
  const rows=[row()];await reconcile(rows,[],{lookup:async id=>({id,last_event:'suppressed'}),save:async()=>true,pause:async()=>{}},now);
  assert.equal(rows[0].delivery_status,'suppressed');
});
test('lookup errors leave sent status unchanged and report tracking failure',async()=>{
  const rows=[row()];let saves=0;
  const result=await reconcile(rows,[],{lookup:async()=>{throw new Error('403')},save:async()=>{saves++;return true},pause:async()=>{}},now);
  assert.equal(result.errors,1);assert.equal(rows[0].delivery_status,'sent');assert.equal(saves,0);
});
test('message ID mismatch cannot corrupt another communication',async()=>{
  let saves=0;const result=await reconcile([row()],[],{lookup:async()=>({id:'different',last_event:'delivered'}),save:async()=>{saves++;return true},pause:async()=>{}},now);
  assert.equal(result.errors,1);assert.equal(saves,0);
});
test('terminal evidence and recently checked records do not query provider',async()=>{
  let lookups=0;await reconcile([row({delivery_status:'delivered'}),row({delivery_status:'suppressed'}),row({metadata:{provider_checked_at:new Date(now-60_000).toISOString()}})],[],{lookup:async()=>{lookups++;return {id:'provider',last_event:'sent'}},save:async()=>true,pause:async()=>{}},now);
  assert.equal(lookups,0);
});
test('successful event evidence avoids unnecessary provider lookup',async()=>{
  let lookups=0;await reconcile([row()],[{provider_email_id:'provider',event_type:'email.delivered',event_at:'2026-10-11T01:01:00Z'}],{lookup:async()=>{lookups++;return {id:'provider',last_event:'sent'}},save:async()=>true,pause:async()=>{}},now);
  assert.equal(lookups,0);
});
test('each refresh caps work and spaces requests',async()=>{
  let pauses=0;const result=await reconcile(Array.from({length:12},(_,i)=>row({id:String(i),provider_email_id:String(i)})),[],{lookup:async id=>({id,last_event:'delivered'}),save:async()=>true,pause:async()=>{pauses++}},now);
  assert.equal(result.checked,10);assert.equal(result.remaining,2);assert.equal(pauses,9);
});
test('optimistic concurrency prevents stale local delivery claims',async()=>{
  const rows=[row()];const result=await reconcile(rows,[],{lookup:async id=>({id,last_event:'delivered'}),save:async()=>false,pause:async()=>{}},now);
  assert.equal(result.updated,0);assert.equal(rows[0].delivery_status,'sent');
});
