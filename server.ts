import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { isValidGeminiKey, retryWithBackoff, getGeminiClient, getLocalPhysicsResponse } from "../server-config";
import { analyzeMessage, MessageCategory } from "./ai-helper";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON requests
  app.use(express.json());

  // ==================== 1. المساعد المنهجي الذكي للفيزياء (Gemini API Proxy) ====================
  app.post("/api/chat", async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "الرجاء إدخال نص الرسالة الاستفسارية." });
    }

    // 1. التحقق من صحة المفتاح قبل إرسال أي طلب ومنع إرسال الطلب إذا كان فارغاً أو غير صالح
    const apiKey = process.env.GEMINI_API_KEY;

    console.log("=== [DEBUG] Gemini API Backend Context ===");
    console.log("- process.env.GEMINI_API_KEY exists?", !!apiKey);
    if (apiKey) {
      console.log("- Key Length:", apiKey.length);
      console.log("- Key Starts with:", apiKey.substring(0, Math.min(6, apiKey.length)));
      console.log("- isValidGeminiKey evaluation result:", isValidGeminiKey(apiKey));
    }
    console.log("- All filtered key variables in environment:");
    Object.keys(process.env).forEach(k => {
      if (k.toUpperCase().includes("GEMINI") || k.toUpperCase().includes("KEY") || k.toUpperCase().includes("API")) {
        console.log(`  * ${k}: length = ${process.env[k]?.length || 0}`);
      }
    });

    // إجراء تحليل مسبق محلياً لتصنيف السؤال ومستوى الثقة كدليل إرشادي ولرصد الجودة
    const localAnalysis = analyzeMessage(message);
    console.log(`- Local Context Analysis Result: Category = "${localAnalysis.category}", Confidence = ${localAnalysis.confidence}%`);
    console.log("==========================================");

    if (!isValidGeminiKey(apiKey)) {
      console.log("ℹ️ Platform fallback activated: Servicing request with high-grade local educational AI responder.");
      return res.status(200).json({
        text: getLocalPhysicsResponse(message)
      });
    }

    try {
      // 2. تهيئة عميل الذكاء الاصطناعي بشكل آمن ومحمي
      const ai = getGeminiClient();

      // توجيهات النظام الشاملة والذكية المنقحة والمحدثة لدعم فهم أسئلة الطلاب بدقة بالغة وتصنيفها
      const systemInstruction = 
        `أنت "المساعد المنهجي الذكي الفائق" لمنصة المرجع المطور، التي يشرف عليها الأستاذ القدير سياف الشباطي في اليمن.\n` +
        `أنت لست مجرد معالج للكلمات، بل أنت تحلل المعنى الكامل للجملة والسياق الحقيقي قبل الإجابة. اتبع التعليمات الصارمة التالية:\n\n` +
        
        `1. تصنيف وفهم نوع السؤال:\n` +
        `   - سؤال فيزياء (مواضيع الحركة، الجاذبية، القصور الذاتي، القوى، الموجات، الكهرباء والمغناطيس، إلخ).\n` +
        `   - سؤال رياضيات (التفاضل، التكامل، لغة الفواتير، المصفوفات، الجبر، العمليات والمسائل الحسابية).\n` +
        `   - سؤال عام (نصائح الدراسة والترتيب، كيمياء، أحياء، موضوعات تعليمية أخرى بالمنهج).\n` +
        `   - سؤال ترحيب (تحية، معرفة المنصة، الاستفسار عن الأستاذ سياف الشباطي).\n` +
        `   - سؤال خارج المنصة (أي استفسار لا علاقة له بالتعليم والدراسة مثل الطبخ، كبسة البيض، وصفات طعام، أخبار اليوم، كرة القدم وميسي ورونالدو، الألعاب، سياسة، إلخ).\n` +
        `   - سؤال غير مفهوم (رموز عشوائية، أحرف خالية من المعنى، كلام مبهم جداً).\n\n` +
        
        `2. شروط الإجابة والتصنيف الصارمة:\n` +
        `   - لا تجبر السؤال على الفيزياء أبداً إذا لم يكن متعلقاً بالفيزياء. أجب بشكل طبيعي جداً ومناسب للتصنيف.\n` +
        `   - إذا كان السؤال خارج اختصاص المنصة (سؤال خارج المنصة)، فلا تجب عليه ولا تذكر الفيزياء به طوعاً، بل رد حصرياً وبمنتهى اللطف والوقار بهذه العبارة الدقيقة دون غيرها:\n` +
        `     "أنا مساعد متخصص بالفيزياء والتعليم، يرجى كتابة سؤال متعلق بالدروس أو الدراسة."\n` +
        `   - إذا كان السؤال غير مفهوم تماماً، فلا تخترع أو تخمن إجابة عشوائية، بل اطلب من الطالب بلطف وبطريقة تربوية دافئة إعادة صياغة السؤال وتوضيحه ليسهل عليك قراءتها.\n\n` +
        
        `3. تحسين هيكلية الردود:\n` +
        `   - إذا كان سؤال الطالب طويلاً ومتشعباً (به تفاصيل كثيرة)، يجب عليك تلخيص المطلوب باختصار في سطر واحد ووضعه في الأعلى تحت عنوان مائل: "📌 **ملخص استفسارك:** [التلخيص هنا]" ثم باشر في سرد الإجابة المُنظمة.\n` +
        `   - رتب الإجابات على هيئة نقاط واضحة ومسلسلة ومفهومة تسهل الاستيعاب التام وبجداول أو معادلات ذات تنسيق رياضي دقيق.\n` +
        `   - تحدث دائماً بلسان علمي عربي دافئ وملهم، كمعلم ودود وناصح يسعى لبناء قيادات المستقبل العلمية ويدعم ذكاء الطلاب ويدفعهم للتفوق تحت رعاية وإشراف الأستاذ القدير سياف الشباطي.\n` +
        `   - عندما يكون السؤال علمياً أو كونياً، اربط الإجابة بلطافة وتدبر بعظمة الخالق العليم وبديع صنعه وإعجازه في هذا الكون الفسيح لترسيخ البعد العقدي والإيماني والتربوي الراقي للمنصة.\n\n` +
        `لا تكرر الردود الجاهزة، وأعط كل طالب إجابة مخصصة ومبهرة تتطابق وثقافته العلمية العالية بكل ثقة وإتقان.`;

      // صياغة محادثات للشركة والـ SDK الحديثة
      const contents: any[] = [];
      if (history && Array.isArray(history)) {
        history.forEach((msg: any) => {
          contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.text }]
          });
        });
      }
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      // 3. استدعاء النموذج الفلاشي الذكي مع نظام إعادة المحاولة تلقائياً عند فشل الطلب
      const response = await retryWithBackoff(async () => {
        return await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.6,
          }
        });
      }, 3, 1000);

      const textResponse = response.text || getLocalPhysicsResponse(message);
      return res.json({ text: textResponse });
    } catch (err: any) {
      // 4. تسجيل الأخطاء داخل Console أو Logs فقط وعدم إظهارها للطلاب
      console.error("Gemini Assistant Failure Details:", err);
      // إرجاع رد تفاعلي ذكي فوري كخط دفاع ثانٍ لضمان استمرارية الخدمة تلقائياً بنسبة 100%
      return res.status(200).json({
        text: getLocalPhysicsResponse(message)
      });
    }
  });

  // ==================== 2. تهيئة وتكامل خادم الـ Vite والبيئة المحيطة ====================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("⚡ Vite development middleware loaded successfully.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("📦 Serving production static folder from /dist");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Smart Physics Platform server initialized on: http://localhost:${PORT}`);
  });
}

startServer();
