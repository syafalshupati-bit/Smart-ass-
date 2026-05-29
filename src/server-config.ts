import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { generateLocalFallbackResponse } from "./src/ai-helper";

dotenv.config();

export function getLocalPhysicsResponse(message: string): string {
  if (!message) return "الرجاء كتابة سؤالك بوضوح لتتم الإجابة العلمية بدقة.";
  return generateLocalFallbackResponse(message);
}

/**
 * دالة التحقق من صحة مفتاح Gemini API
 * يتوجب أن يكون المفتاح سلسلة نصية غير فارغة، تبدأ بالرمز المميز لمفاتيح جوجل "AIzaSy"، وليست القيمة الافتراضية المؤقتة.
 */
export function isValidGeminiKey(key: any): boolean {
  if (!key || typeof key !== "string") return false;
  const trimmed = key.trim();
  if (
    trimmed === "" ||
    trimmed === "MY_GEMINI_API_KEY" ||
    trimmed === "YOUR_API_KEY" ||
    trimmed === "YOUR_GEMINI_API_KEY" ||
    trimmed.includes("PLACEHOLDER")
  ) {
    return false;
  }
  // مفاتيح جوجل للـ API الرسمية تبدأ بـ "AIza" ولكن لمراعاة أي بيئات اختبارات أو مفاتيح خاصة أو بروكسي، نتحقق من الطول وصحة النص فقط
  return trimmed.length >= 10;
}

/**
 * نظام إعادة المحاولة التلقائي (Retry with Exponential Backoff)
 * يقوم بإعادة تشغيل الطلب في حال فشله لزيادة الموثوقية وتجاوز أي انقطاع مؤقت بالشبكة.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1200
): Promise<T> {
  let lastError: any;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`[محاولة ${attempt} من أصل ${retries}] فشل في الاتصال بالذكاء الاصطناعي:`, error);
      if (attempt < retries) {
        // الانتظار مع زيادة المدة تدريجياً
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  throw lastError;
}

/**
 * دالة تهيئة واسترجاع عميل GoogleGenAI بشكل آمن
 */
export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!isValidGeminiKey(apiKey)) {
    throw new Error("API_KEY_INVALID");
  }

  return new GoogleGenAI({
    apiKey: apiKey!.trim(),
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}
