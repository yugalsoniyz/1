const bedrock=require("bedrock-protocol"),fs=require("fs"),path=require("path");
const settings=JSON.parse(fs.readFileSync(path.join(__dirname,"settings.json"),"utf8"));
let reconnectDelay=settings.reconnect.initialDelayMs,reconnectTimer=null,stopped=false;
function setStatus(p){Object.assign(global.botStatus,p)} function log(m){console.log(`[BOT] ${m}`)}
function scheduleReconnect(){if(stopped||!settings.reconnect.enabled||reconnectTimer)return;const d=reconnectDelay;log(`Reconnecting in ${Math.round(d/1000)}s...`);setStatus({status:"reconnecting",lastEvent:`Reconnecting in ${Math.round(d/1000)}s`});reconnectTimer=setTimeout(()=>{reconnectTimer=null;connect()},d);reconnectDelay=Math.min(Math.max(d*2,settings.reconnect.initialDelayMs),settings.reconnect.maxDelayMs)}
function connect(){
 setStatus({status:"connecting",auth:"waiting",lastError:null,lastEvent:"Creating Bedrock client"});
 log(`Connecting to ${settings.server.host}:${settings.server.port}`);
 let client;
 try{client=bedrock.createClient({host:settings.server.host,port:Number(settings.server.port),username:settings.bot.username,offline:false,profilesFolder:path.join(__dirname,".minecraft"),onMsaCode:data=>{
   setStatus({auth:"device-code",lastEvent:`Microsoft code: ${data.user_code||"check Railway logs"}`});
   console.log("\n========== MICROSOFT LOGIN ==========");console.log(`Open: ${data.verification_uri||data.verification_uri_complete||"the Microsoft verification URL shown above"}`);console.log(`Code: ${data.user_code||"not provided"}`);console.log("Complete the normal Microsoft sign-in.");console.log("=====================================\n");
 },conLog:null})}
 catch(err){setStatus({status:"error",lastError:err?.stack||String(err),lastEvent:"createClient failed"});console.error("[BOT] createClient failed:",err);return scheduleReconnect()}
 global.client=client;
 client.on("join",()=>{reconnectDelay=settings.reconnect.initialDelayMs;setStatus({status:"joined",auth:"authenticated",lastEvent:"Server join received"});log("Server join received.")});
 client.on("spawn",()=>{setStatus({status:"spawned",auth:"authenticated",lastEvent:"Player spawned"});log("Player spawned.")});
 client.on("text",p=>{const m=p?.message||p?.rawtext||JSON.stringify(p);setStatus({lastEvent:`Chat: ${String(m).slice(0,180)}`});console.log("[CHAT]",m)});
 client.on("move_player",p=>{const q=p?.position;if(!q)return;const x=Number(q.x),y=Number(q.y),z=Number(q.z);if(![x,y,z].every(Number.isFinite))return;setStatus({position:{x,y,z},blockPosition:{x:Math.floor(x),y:Math.floor(y-.001),z:Math.floor(z)}})});
 client.on("disconnect",packet=>{console.log("[BOT] DISCONNECT PACKET:",JSON.stringify(packet,null,2));setStatus({status:"kicked",lastEvent:"Disconnect packet received",lastError:JSON.stringify(packet)})});
 client.on("play_status",packet=>console.log("[BOT] PLAY_STATUS:",JSON.stringify(packet,null,2)));
 client.on("packet",packet=>{if(packet?.name){const n=String(packet.name).toLowerCase();if(n.includes("disconnect")||n.includes("play_status")||n.includes("login"))console.log("[PACKET]",packet.name,JSON.stringify(packet,null,2))}});
 client.on("kick",reason=>{const m=typeof reason==="string"?reason:(reason?.message||JSON.stringify(reason));setStatus({status:"kicked",lastEvent:`Kicked: ${String(m).slice(0,180)}`});console.log("[BOT] KICK:",m)});
 client.on("close",reason=>{const m=reason?String(reason):"connection closed";console.log("[BOT] ===== CONNECTION CLOSED =====");console.log("[BOT] Close argument:",reason);try{console.log("[BOT] Close argument JSON:",JSON.stringify(reason,null,2))}catch(_){}setStatus({status:"closed",lastEvent:m,lastError:reason?String(m):"No close reason supplied by client"});global.botStatus.reconnects++;log(`Connection closed: ${m}`);scheduleReconnect()});
 client.on("error",err=>{const m=err?.stack||err?.message||String(err);setStatus({status:"error",lastError:m,lastEvent:"Client error"});console.error("[BOT] ERROR:",err)});
}
process.on("uncaughtException",e=>{setStatus({status:"error",lastError:e?.stack||String(e),lastEvent:"Uncaught exception"});console.error("[PROCESS] Uncaught exception:",e)});
process.on("unhandledRejection",e=>{setStatus({status:"error",lastError:e?.stack||String(e),lastEvent:"Unhandled rejection"});console.error("[PROCESS] Unhandled rejection:",e)});
connect();
