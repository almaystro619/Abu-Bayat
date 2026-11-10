require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
app.use(express.json({limit:"12mb"}));
app.use(express.static(path.join(__dirname,"public")));

app.post("/api/ai", async (req,res)=>{
  const {prompt, mode="شرح"} = req.body || {};
  if(!prompt || typeof prompt !== "string") return res.status(400).json({error:"اكتب سؤالك أولاً."});
  if(!process.env.AI_API_KEY) return res.json({demo:true, answer:
`وضع التجربة: لم يتم ربط مزود ذكاء اصطناعي بعد.\n\nطلبك: ${prompt}\n\nيمكنك تفعيل الإجابات الحقيقية بإضافة AI_API_KEY في ملف .env ثم إعادة تشغيل الموقع.\n\nاقتراح للمذاكرة:\n1. حدد الفكرة الأساسية.\n2. اكتب أهم النقاط.\n3. اختبر نفسك بثلاثة أسئلة.\n\nنوع المساعدة: ${mode}`});
  try{
    const base=(process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/,"");
    const r=await fetch(base+"/chat/completions",{method:"POST",headers:{
      "Content-Type":"application/json","Authorization":"Bearer "+process.env.AI_API_KEY
    },body:JSON.stringify({model:process.env.AI_MODEL || "gpt-4o-mini",messages:[
      {role:"system",content:"أنت مدرس عربي واضح ودقيق. اشرح للطالب بالعربية الفصحى المبسطة، ونظم الإجابة بعناوين وخطوات وأمثلة. لا تخترع معلومات."},
      {role:"user",content:"نوع المهمة: "+mode+"\n\n"+prompt}
    ],temperature:0.5})});
    const data=await r.json();
    if(!r.ok) return res.status(502).json({error:data.error?.message || "تعذر الاتصال بمزود الذكاء الاصطناعي."});
    res.json({answer:data.choices?.[0]?.message?.content || "لم تصل إجابة."});
  }catch(e){res.status(500).json({error:"حدث خطأ في الاتصال بالخدمة."});}
});
app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
const port=process.env.PORT || 3000;
app.listen(port,()=>console.log("Abu Bayan Study running on "+port));