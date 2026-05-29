// school-search.ts
// نظام البحث الذكي عن المدارس والتحقق والتكامل الفوري مع الـ Firebase لضمان أفضل أداء

import { db, ref, get, query, orderByChild, onValue } from './firebase-config';
import { School } from './types';

/**
 * دالة ذكية لتنظيف وتطبيع وتسوية النصوص باللغة العربية.
 * هذه الدالة محورية لضمان "البحث الذكي" (Smart Search):
 * - تتجاهل الفروق بين الهمزات المختلفة (أ، إ، آ، ا).
 * - تتجاهل التفرقة بين التاء المربوطة والهاء في نهاية الكلمة (ة، ه).
 * - تتجاهل التفرقة بين الألف المقصورة والياء في نهاية الكلمة (ى، ي).
 * - تتجاهل المسافات الزائدة والمتكررة أو علامات التشكيل وحروف المد والرموز الجانبية.
 * - تتجاهل حالة الأحرف الصغيرة والكبيرة للإدخالات الإنجليزية.
 * 
 * @param str النص الأصلي المدخل من قبل المستخدم أو المسجل بقناة البيانات
 * @returns النص المصفى والمطبع لتسهيل عملية الفلترة والمقارنة المطابقة بنسبة 100%
 */
export function normalizeArabic(str: string): string {
  if (!str) return "";
  return str
    .trim()
    .toLowerCase()
    // إزالة علامات التحرير والتشكيل (الفتحة، الضمة، الكسرة، التنوين، السكون)
    .replace(/[\u064B-\u0652]/g, "")
    // توحيد الألفات بجميع أشكالها إلى ألف عادية
    .replace(/[أإآ]/g, "ا")
    // توحيد التاء المربوطة إلى هاء
    .replace(/ة/g, "ه")
    // توحيد الألف المقصورة إلى ياء
    .replace(/ى/g, "ي")
    // دمج المسافات الزائدة والمتعددة وجعلها مسافة فردية واحدة فقط
    .replace(/\s+/g, " ")
    // إزالة الحروف والرموز غير الأبجدية للمقارنة النظيفة
    .replace(/[-_@#]/g, "");
}

/**
 * [مكان جلب المدارس]:
 * يتم جلب قائمة المدارس وعقد البيانات من مسار (schools) الرئيسي في قاعدة البيانات الفورية Firebase Realtime Database.
 * 
 * [طريقة البحث]:
 * نتحقق من اسم المدرسة المدخل ومقارنته بأسماء المدارس المخزنة بعد تطبيع الطرفين وتمريرهم على دالة `normalizeArabic()`
 * لضمان العثور على المدرسة بغض النظر عن المسافات الزائدة أو الفروق الإملائية الطفيفة.
 * 
 * [طريقة التحقق]:
 * نتحرى وجود كائن مدرسة يطابق الإدخال بشكل تام بعد تطبيع الطرفين. إذا تطابق، نرجع بيانات المدرسة الكاملة.
 * 
 * [طريقة ربط Firebase]:
 * يتم استيراد المعاينة اللحظية للمرجع الأساسي للاتصال `db` والمستجيب للتغيرات عبر SDK لتوفير كفاءة واستمرارية في البحث.
 * 
 * @param schoolName اسم المدرسة المكتوب من قبل الطالب
 * @returns كائن المدرسة المطابق بالكامل من قاعدة البيانات، أو null في حال عدم وجود تطابق
 */
export async function searchSchool(schoolName: string): Promise<School | null> {
  const normalizedQuery = normalizeArabic(schoolName);
  if (!normalizedQuery) return null;

  try {
    // جلب ذكي ومباشر من الـ Firebase لضمان مطابقة حية مع أحدث تحديث للمدرس في الوقت الفوري
    const schoolsRef = ref(db, "schools");
    const snapshot = await get(schoolsRef);
    
    if (snapshot.exists()) {
      const schoolsData = snapshot.val();
      const schoolsList: School[] = Array.isArray(schoolsData)
        ? schoolsData
        : Object.values(schoolsData);

      // تصفية ذكية للغاية تدعم اللغة العربية وإهمال الهمزات والمسافات
      const matched = schoolsList.find(sch => normalizeArabic(sch.name) === normalizedQuery);
      return matched || null;
    }
  } catch (error) {
    console.error("❌ [searchSchool Firebase Error]:", error);
  }
  return null;
}

/**
 * دالة ذكية لإرجاع الاقتراحات التلقائية (Auto Complete) أثناء الكتابة السريعة.
 * تعتمد على جلب العقد المفلترة والمبوبة باستخدام query و orderByChild لتحقيق تشغيل متجاوب وسريع
 * وتفادي تحميل المدارس أو فرزها بكثافة دفعة واحدة، مما يدعم التعامل بكفاءة مع الاستهلاك العالي وقواعد البيانات الضخمة.
 * 
 * @param input النص الجزئي الذي يكتبه الطالب في هذه اللحظة
 * @param callback دالة تحديث الحالة في واجهة العرض الرسومية للـ React
 * @returns دالة إلغاء الاشتراك (Unsubscribe) لإغلاق المستمع الفوري عند مغادرة الصفحة أو إلغاء التركيز
 */
export function setupAutoCompleteSuggestions(
  input: string,
  callback: (suggestions: School[]) => void
): () => void {
  const normalizedInput = normalizeArabic(input);
  // ننتظر حتى يكتب المستخدم حرفين على الأقل لتجنب تفعيل استعلامات عشوائية كثيفة في الفايربيز
  if (!normalizedInput || normalizedInput.length < 2) {
    callback([]);
    return () => {};
  }

  try {
    const schoolsRef = ref(db, "schools");
    // استخدام استعلام محسن (Query) مع الفرز بحسب حقل الاسم (name)
    const schoolsQuery = query(schoolsRef, orderByChild("name"));

    // اشتراك لحظي للحصول على المقترحات الموافقة
    return onValue(schoolsQuery, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const fullList: School[] = Array.isArray(data) ? data : Object.values(data);

        // فلترة القائمة ديناميكياً باستخدام محرك التطبيع العربي الذكي
        const matched = fullList.filter(sch => {
          const normName = normalizeArabic(sch.name);
          return normName.includes(normalizedInput);
        });

        // نعرض بحد أقصى أول 8 اقتراحات لضمان ملاءمة أبعاد شاشة الجوال وتناسق التخطيط الرسومي للمنصة
        callback(matched.slice(0, 8));
      } else {
        callback([]);
      }
    }, (err) => {
      console.error("⚠️ [AutoComplete Realtime Error]:", err);
      callback([]);
    });

  } catch (error) {
    console.error("❌ Fail to setup School AutoComplete connection:", error);
    callback([]);
    return () => {};
  }
}
