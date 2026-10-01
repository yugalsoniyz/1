const http=require("http"),fs=require("fs"),path=require("path");
const PORT=Number(process.env.PORT||3000);
const settings=JSON.parse(fs.readFileSync(path.join(__dirname,"settings.json"),"utf8"));
global.botStatus={status:"starting",username:settings.bot.username,server:`${settings.server.host}:${settings.server.port}`,position:null,blockPosition:null,blockName:"Unavailable",blockDisplayName:"Unavailable",uptimeSeconds:0,reconnects:0,lastEvent:"Starting",lastError:null,auth:"waiting"};
const startedAt=Date.now();
setInterval(()=>global.botStatus.uptimeSeconds=Math.floor((Date.now()-startedAt)/1000),1000);
function json(res,d){res.writeHead(200,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","Access-Control-Allow-Origin":"*"});res.end(JSON.stringify(d))}
http.createServer((req,res)=>{
 if(req.url==="/api/status")return json(res,global.botStatus);
 if(req.url==="/health")return json(res,{ok:true,status:global.botStatus.status});
 if(req.url==="/"||req.url==="/index.html"){res.writeHead(200,{"Content-Type":"text/html; charset=utf-8"});return res.end(fs.readFileSync(path.join(__dirname,"public/index.html")))}
 res.writeHead(404);res.end("Not found");
}).listen(PORT,"0.0.0.0",()=>{console.log(`[WEB] Dashboard listening on port ${PORT}`);require("./bot.js")});
