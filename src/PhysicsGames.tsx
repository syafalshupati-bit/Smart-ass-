import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Check, 
  Sparkles, 
  MoveRight, 
  HelpCircle, 
  ArrowUpRight, 
  Beaker, 
  TrendingUp, 
  Award, 
  Flame, 
  Activity, 
  Scale, 
  Compass, 
  CheckCircle, 
  XCircle, 
  Zap,
  Users,
  Target,
  Maximize2,
  Minimize2
} from 'lucide-react';

export interface LabProps {
  onComplete?: (xp: number, labId: string) => void;
  studentName?: string;
  studentSchool?: string;
}

// ==========================================
// 1. مختبر التحويلات الفيزيائية (الدرس الرابع)
// ==========================================
export function ConversionLab({ onComplete }: LabProps) {
  const [answers, setAnswers] = useState<{ [key: string]: { op: string; val: string } }>({
    conv1: { op: '', val: '' },
    conv2: { op: '', val: '' },
    conv3: { op: '', val: '' },
    conv4: { op: '', val: '' },
    conv5: { op: '', val: '' },
    conv6: { op: '', val: '' },
  });

  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string>('');

  const correctAnswers = {
    conv1: { op: '×', val: '1000' }, // كم إلى م
    conv2: { op: '×', val: '100' },  // م إلى سم
    conv3: { op: '×', val: '60' },   // س إلى دقيقة
    conv4: { op: '×', val: '1000' }, // كجم إلى ج
    conv5: { op: '×', val: '1000' }, // طن إلى كجم
    conv6: { op: '÷', val: '1000' }, // ملم إلى م
  };

  const handleOpChange = (key: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [key]: { ...prev[key], op: value }
    }));
  };

  const handleValChange = (key: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [key]: { ...prev[key], val: value.trim() }
    }));
  };

  const checkAnswers = () => {
    let correctCount = 0;
    Object.keys(correctAnswers).forEach(key => {
      const userAns = answers[key];
      const correctAns = correctAnswers[key as keyof typeof correctAnswers];
      if (userAns.op === correctAns.op && parseFloat(userAns.val) === parseFloat(correctAns.val)) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setSubmitted(true);

    if (correctCount === 6) {
      setFeedback('🎉 إجابات كاملة وصحيحة 100%! بارك الله في ذكائك المنهجي. لقد أحرزت نقاط التفوق.');
      if (onComplete) onComplete(40, 'lab_conversions_full');
    } else {
      setFeedback(`⚠️ رصدنا بعض الأخطاء. لقد حققت ${correctCount} من أصل 6 مستويات. راجع جدول البادئات والتحويلات وأعد المحاولة!`);
    }
  };

  const resetLab = () => {
    setAnswers({
      conv1: { op: '', val: '' },
      conv2: { op: '', val: '' },
      conv3: { op: '', val: '' },
      conv4: { op: '', val: '' },
      conv5: { op: '', val: '' },
      conv6: { op: '', val: '' },
    });
    setSubmitted(false);
    setScore(0);
    setFeedback('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm text-right" dir="rtl">
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-xl shadow-xs">
        <h4 className="font-bold text-base flex items-center gap-2">
          <Scale size={18} />
          <span>🔢 مختبر التدريب العملي على التحويلات والبادئات الفيزيائية</span>
        </h4>
        <p className="text-xs text-amber-550 mt-1">تغلب على تحدي الأعداد الضخمة والصغيرة بتعلم كيفية التحويل واشتقاق البادئات المنهجية اليمنية</p>
      </div>

      <div className="bg-amber-50 border-r-4 border-amber-500 p-3.5 rounded-l-xl text-amber-900 text-xs leading-relaxed font-semibold">
        💡 <b>إستراتيجية الحل الذهبي:</b> عند التحويل من وحدة <b>كبيرة إلى صغيرة</b> نستخدم الضرب (×)، وعند التحويل من وحدة <b>صغيرة إلى كبيرة</b> نستخدم القسمة (÷). جرب الآن واختبر مهاراتك الرياضية!
      </div>

      <div className="overflow-x-auto border border-slate-100 rounded-xl">
        <table className="w-full text-xs text-slate-700 table-auto border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-900 font-extrabold border-b border-slate-100">
              <th className="p-3 text-right">تحويل من</th>
              <th className="p-3 text-right">تحويل إلى</th>
              <th className="p-3 text-center">العملية الرياضية</th>
              <th className="p-3 text-right">المعامل أو القيمة</th>
              <th className="p-3 text-center">الحالة</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              { id: 'conv1', from: 'كيلومتر (km)', to: 'متر (m)', hint: 'ألف متر' },
              { id: 'conv2', from: 'متر (m)', to: 'سنتيمتر (cm)', hint: 'مئة جزء' },
              { id: 'conv3', from: 'ساعة (hr)', to: 'دقيقة (min)', hint: '٦٠ دقيقة' },
              { id: 'conv4', from: 'كيلوجرام (kg)', to: 'جرام (g)', hint: 'ألف جرام' },
              { id: 'conv5', from: 'طن (ton)', to: 'كيلوجرام (kg)', hint: 'ألف كجم' },
              { id: 'conv6', from: 'مليمتر (mm)', to: 'متر (m)', hint: 'جزء من الألف' },
            ].map(row => {
              const userAns = answers[row.id];
              const correctAns = correctAnswers[row.id as keyof typeof correctAnswers];
              const isEachCorrect = submitted && userAns.op === correctAns.op && parseFloat(userAns.val) === parseFloat(correctAns.val);

              return (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-bold text-slate-800">{row.from}</td>
                  <td className="p-3 text-slate-600 font-medium">{row.to}</td>
                  <td className="p-3">
                    <div className="flex justify-center">
                      <select
                        value={userAns.op}
                        onChange={(e) => handleOpChange(row.id, e.target.value)}
                        disabled={submitted}
                        className="p-1 px-2.5 rounded-lg border border-slate-200 bg-white font-bold text-center focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      >
                        <option value="">اختر</option>
                        <option value="×">✖ ضرب</option>
                        <option value="÷">➗ قسمة</option>
                      </select>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder={row.hint}
                        value={userAns.val}
                        onChange={(e) => handleValChange(row.id, e.target.value)}
                        disabled={submitted}
                        className="w-24 p-1.5 px-2 rounded-lg border border-slate-200 text-center font-mono font-bold focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    {submitted ? (
                      isEachCorrect ? (
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block">✅ صح</span>
                      ) : (
                        <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full inline-block">❌ خطأ (الحل: {correctAns.op} {correctAns.val})</span>
                      )
                    ) : (
                      <span className="text-slate-400 font-medium">قيد الإجابة</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-bold leading-relaxed border ${
          score === 6 ? 'bg-emerald-50 border-emerald-100 text-emerald-850' : 'bg-rose-50 border-rose-100 text-rose-850'
        }`}>
          {feedback}
        </div>
      )}

      <div className="flex justify-center gap-3">
        <button
          onClick={checkAnswers}
          disabled={submitted}
          className="bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:shadow-md disabled:opacity-50"
        >
          <CheckCircle size={15} />
          <span>تحقق من جميع الإجابات</span>
        </button>
        <button
          onClick={resetLab}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-6 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
        >
          <RotateCcw size={15} />
          <span>إعادة تعيين</span>
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 2. مختبر التحليل البعدي (الدرس الخامس)
// ==========================================
export function DimensionalAnalysisLab({ onComplete }: LabProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [lhsInput, setLhsInput] = useState('');
  const [rhsInput, setRhsInput] = useState('');
  const [isConsistent, setIsConsistent] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);

  const equations = [
    {
      eq: "ع = ع₀ + ج ز",
      desc: "سيارة تتسارع. ع (السرعة النهائية)، ع₀ (السرعة الابتدائية)، ج (العجلة)، ز (الزمن).",
      lhsCorrect: "L T^-1",
      rhsCorrect: "L T^-1",
      correctConsistency: true,
      explain: "✅ معادلة صحيحة بعدياً! أبعاد الطرف الأيسر [ع] = L T⁻¹، وأبعاد الطرف الأيمن: [ع₀] = L T⁻¹، و[ج ز] = (L T⁻²) × T = L T⁻¹."
    },
    {
      eq: "ف = ج ز²",
      desc: "مسافة سقوط حر. ف (المسافة)، ج (العجلة تسارع الجاذبية)، ز (الزمن البعدي).",
      lhsCorrect: "L",
      rhsCorrect: "L",
      correctConsistency: true,
      explain: "✅ معادلة صحيحة بعدياً! أبعاد الطرف الأيسر [ف] = L، والطرف الأيمن [ج ز²] = (L T⁻²) × T² = L. (ملاحظة: الثوابت العددية لا أبعاد لها لذا تتفق الصيغتان بعدياً)."
    },
    {
      eq: "ف = ع₀ ز² + ج ز",
      desc: "علاقة تجريبية مفترضة لقياس الحركة الثنائية.",
      lhsCorrect: "L",
      rhsCorrect: "L T", // ع₀ ز² = LT^-1 * T^2 = LT (أو ج ز = LT^-1) فهي غير متجانسة لأن الحدود غير متجانسة
      correctConsistency: false,
      explain: "❌ خطأ وغير متجانسة! أبعاد الطرف الأيسر [ف] = L. أبعاد أطراف الأيمن: [ع₀ ز²] = L T⁻¹ × T² = L T، و[ج ز] = L T⁻² × T = L T⁻¹. الحدود اليمينية مختلفة بالتالي لا يمكن جمعها أصلاً والسرعتان فاشلتان علمياً."
    }
  ];

  const currentEq = equations[currentIdx];

  const handleVerify = () => {
    if (lhsInput.trim() === '' || rhsInput.trim() === '' || isConsistent === null) {
      setFeedback('⚠️ عذراً يا ذكي! الرجاء كتابة صيغ الأبعاد لكلا الطرفين وتحديد التجانس أولاً.');
      return;
    }

    // تنظيف المدخلات لتقليل الأخطاء الإملائية والمسافات
    const cleanLHS = lhsInput.trim().replace(/\s+/g, '').toLowerCase();
    const cleanTrueLHS = currentEq.lhsCorrect.replace(/\s+/g, '').toLowerCase();
    const cleanRHS = rhsInput.trim().replace(/\s+/g, '').toLowerCase();
    const cleanTrueRHS = currentEq.rhsCorrect.replace(/\s+/g, '').toLowerCase();

    const isLhsOk = cleanLHS === cleanTrueLHS;
    const isRhsOk = cleanRHS === cleanTrueRHS;
    const isChoiceOk = isConsistent === currentEq.correctConsistency;

    setSubmitted(true);

    if (isLhsOk && isRhsOk && isChoiceOk) {
      setScore(prev => prev + 1);
      setFeedback(`🎉 قياس عبقري وصحيح! ${currentEq.explain}`);
      if (currentIdx === equations.length - 1 && onComplete) {
        onComplete(40, 'lab_dimensional_full');
      }
    } else {
      let errStr = "⚠️ بعض الرصود خاطئة! ";
      if (!isLhsOk) errStr += `صيغة الطرف الأيسر غير دقيقة (الصحيحة: ${currentEq.lhsCorrect}). `;
      if (!isRhsOk) errStr += `صيغة الطرف الأيمن غير دقيقة (الصحيحة: ${currentEq.rhsCorrect}). `;
      if (!isChoiceOk) errStr += `اختيار تجانس المعادلة خطأ. `;
      errStr += `\n📌 الشرح العلمي: ${currentEq.explain}`;
      setFeedback(errStr);
    }
  };

  const nextEquation = () => {
    if (currentIdx < equations.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setLhsInput('');
      setRhsInput('');
      setIsConsistent(null);
      setSubmitted(false);
      setFeedback('');
    } else {
      setFeedback(`🏆 أحسنت الصنع بإنهاء التدريب كامل! نتيجتك الإجمالية: ${score} من أصل ${equations.length}.`);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm text-right" dir="rtl">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 rounded-xl shadow-xs">
        <h4 className="font-bold text-base flex items-center gap-2">
          <Beaker size={18} />
          <span>🔬 مختبر التحليل البعدي واختبار تجانس القوانين</span>
        </h4>
        <p className="text-xs text-indigo-100 mt-1">تأكد من سلامة وصحة أي قانون فيزيائي بمطابقة وحدات أبعاده الأساسية بقوى [L] و [M] و [T]</p>
      </div>

      <div className="bg-indigo-50 border-r-4 border-indigo-600 p-3.5 rounded-l-xl text-indigo-950 text-[11px] leading-relaxed">
        ✏️ <b>إسهامات دقيقة وصيغ القياس المنهجي:</b><br />
        • الطول أو المسافة ◄ <b>[L]</b> | الكتلة ◄ <b>[M]</b> | الزمن دقيقة أو ثانية ◄ <b>[T]</b><br />
        • السرعة [ع] ◄ <b>L T^-1</b> | العجلة [ج] ◄ <b>L T^-2</b><br />
        • اكتب الصيغ مستخدماً الأحرف الكبيرة وإشارة القوة (مثال: <b>L T^-1</b> أو <b>L T^-2</b>)
      </div>

      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center space-y-3">
        <span className="text-[10px] font-bold text-slate-400">العلاقة الفيزيائية المراد فحصها ({currentIdx + 1} / {equations.length})</span>
        <h3 className="text-xl font-bold font-sans text-indigo-950 block select-all">{currentEq.eq}</h3>
        <p className="text-xs text-slate-600 leading-normal">{currentEq.desc}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
        <div className="space-y-1.5 text-right">
          <label className="block text-slate-700">صيغة أبعاد الطرف الأيسر [LHS]:</label>
          <input
            type="text"
            placeholder="مثال: L T^-1"
            value={lhsInput}
            onChange={(e) => setLhsInput(e.target.value)}
            disabled={submitted}
            className="w-full p-2.5 rounded-xl border border-slate-200 text-center font-mono font-bold focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          />
        </div>
        <div className="space-y-1.5 text-right">
          <label className="block text-slate-700">صيغة أبعاد أطراف الأيمن [RHS]:</label>
          <input
            type="text"
            placeholder="مثال: L T^-2"
            value={rhsInput}
            onChange={(e) => setRhsInput(e.target.value)}
            disabled={submitted}
            className="w-full p-2.5 rounded-xl border border-slate-200 text-center font-mono font-bold focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          />
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center space-y-2.5">
        <span className="text-[11px] font-bold text-slate-700 block text-right">الاستنتاج المنهجي: هل المعادلة متجانسة بعدياً؟</span>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setIsConsistent(true)}
            disabled={submitted}
            className={`px-6 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isConsistent === true
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white hover:bg-slate-100 border-slate-250 text-slate-705'
            }`}
          >
            ✅ متجانسة (ممكنة علمياً)
          </button>
          <button
            onClick={() => setIsConsistent(false)}
            disabled={submitted}
            className={`px-6 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isConsistent === false
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : 'bg-white hover:bg-slate-100 border-slate-250 text-slate-705'
            }`}
          >
            ❌ غير متجانسة (خاطئة حتماً)
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-bold leading-relaxed border whitespace-pre-line ${
          feedback.includes('🎉') ? 'bg-emerald-50 border-emerald-100 text-emerald-850' : 'bg-red-50 border-red-100 text-red-850'
        }`}>
          {feedback}
        </div>
      )}

      <div className="flex justify-center gap-3">
        <button
          onClick={handleVerify}
          disabled={submitted}
          className="bg-indigo-700 hover:bg-indigo-800 active:scale-95 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:shadow-md disabled:opacity-50"
        >
          <CheckCircle size={15} />
          <span>تحقق من الحل ونقاط الرصد</span>
        </button>
        {(submitted || currentIdx < equations.length - 1) && (
          <button
            onClick={nextEquation}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <span>المعادلة التالية</span>
            <MoveRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 3. مختبر المتجهات (الدرس السادس)
// ==========================================
export function VectorsLab({ onComplete }: LabProps) {
  const [row1R, setRow1R] = useState('');
  const [row2R, setRow2R] = useState('');
  const [row3R, setRow3R] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');

  const checkVectorsTable = () => {
    const val1 = parseFloat(row1R);
    const val2 = parseFloat(row2R);
    const val3 = parseFloat(row3R);

    if (isNaN(val1) || isNaN(val2) || isNaN(val3)) {
      setFeedback('⚠️ الرجاء ملء جميع خانات المحصلات R في جدول رصد تجارب المتجهات لتصحيحها.');
      return;
    }

    const is1Correct = Math.abs(val1 - 10) < 0.1;
    const is2Correct = Math.abs(val2 - 10) < 0.1;
    const is3Correct = Math.abs(val3 - 4) < 0.1;

    setSubmitted(true);

    if (is1Correct && is2Correct && is3Correct) {
      setFeedback('🎉 قياسات ممتازة ودقيقة للمحصلة! لقد تحققت من قوانين جمع المتجهات في أبعادها الصفرية والمتعامدة والمعاكسة بدقة بالغة.');
      if (onComplete) onComplete(30, 'lab_vectors_full');
    } else {
      setFeedback(`❌ نأسف! هناك أخطاء في قياس بعض المحصلات:\n` +
                 `• الحالة الأولى: المحصلة R هي A + B = 5 + 5 = 10.\n` +
                 `• الحالة الثانية (متعامدان): R = √(6² + 8²) = √(36+64) = √100 = 10.\n` +
                 `• الحالة الثالثة (متعاكسان): R = |A - B| = |10 - 6| = 4.`);
    }
  };

  const resetTable = () => {
    setRow1R('');
    setRow2R('');
    setRow3R('');
    setSubmitted(false);
    setFeedback('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm text-right" dir="rtl">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-xl shadow-xs">
        <h4 className="font-bold text-base flex items-center gap-2">
          <Compass size={18} />
          <span>📐 مختبر تحليل المتجهات وحساب المحصلات (R)</span>
        </h4>
        <p className="text-xs text-emerald-100 mt-1">تفاعل مع معمل PhET الافتراضي لقياس قوى وحساب محصلة متجهين بزاوية مختلفة</p>
      </div>

      {/* تعليمات المعمل */}
      <div className="bg-emerald-50 border-r-4 border-emerald-600 p-4 rounded-l-xl space-y-2 text-emerald-950 text-xs">
        <h5 className="font-bold flex items-center gap-1">
          <Sparkles size={14} className="text-emerald-700" />
          <span>خطوات التجربة التفاعلية المنهجية:</span>
        </h5>
        <ol className="list-decimal list-inside space-y-1 text-[11px] font-medium leading-relaxed">
          <li>افتح المحاورة التفاعلية لجامعة كولورادو بالأسفل (أو عايرها خارجياً).</li>
          <li>اسحب المتجه (A) و (B) واضبط أطوالهما في ساحة التجريب بالدرجات المذكورة بالجدول.</li>
          <li>فعّل خيار <b>المحصلة (SUM)</b> وقم بقراءة قيمة المحصلة وادخلها في الجدول فوراً للمطابقة الحية.</li>
        </ol>
      </div>

      <div className="border border-slate-150 rounded-2xl overflow-hidden h-[420px] bg-slate-900 relative">
        <iframe 
          src="https://phet.colorado.edu/sims/html/vector-addition/latest/vector-addition_all.html?locale=ar&screens=1,2"
          allowFullScreen
          className="w-full h-full border-none relative z-10"
          title="معمل المتجهات الافتراضي PhET"
        />
      </div>

      <div className="space-y-3.5">
        <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1">
          <Activity size={15} className="text-emerald-600" />
          <span>📊 جدول رصد وتحليل المتجهات (التصحيح والرصد الفوري)</span>
        </h4>

        <div className="overflow-x-auto border border-slate-100 rounded-xl bg-white">
          <table className="w-full text-xs text-slate-700 table-auto border-collapse text-right">
            <thead>
              <tr className="bg-slate-50 text-slate-900 font-extrabold border-b border-slate-150">
                <th className="p-3">المقدار A</th>
                <th className="p-3">المقدار B</th>
                <th className="p-3">الزاوية θ</th>
                <th className="p-3">الموقع التحليلي</th>
                <th className="p-3 text-center">المحصلة العددية R</th>
                <th className="p-3 text-center">الحالة رصداً</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-mono font-bold">5 وحدات</td>
                <td className="p-3 font-mono font-bold">5 وحدات</td>
                <td className="p-3 font-mono text-emerald-700 font-bold">0° (بنفس الاتجاه)</td>
                <td className="p-3 text-slate-500 font-medium">على المحور السيني الموجب</td>
                <td className="p-3">
                  <div className="flex justify-center">
                    <input
                      type="number"
                      placeholder="?"
                      value={row1R}
                      onChange={(e) => setRow1R(e.target.value)}
                      disabled={submitted}
                      className="w-16 p-1.5 rounded-lg border border-slate-200 text-center font-mono font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </td>
                <td className="p-3 text-center">
                  {submitted ? (
                    Math.abs(parseFloat(row1R) - 10) < 0.1 ? (
                      <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block">✅ صح (10)</span>
                    ) : (
                      <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full inline-block">❌ خطأ (10)</span>
                    )
                  ) : <span className="text-slate-400">قيد الرصد</span>}
                </td>
              </tr>

              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-mono font-bold">6 وحدات</td>
                <td className="p-3 font-mono font-bold">8 وحدات</td>
                <td className="p-3 font-mono text-indigo-700 font-bold">90° (متعامدان)</td>
                <td className="p-3 text-slate-500 font-medium">زاوية قائمة فيثاغورية</td>
                <td className="p-3">
                  <div className="flex justify-center">
                    <input
                      type="number"
                      placeholder="?"
                      value={row2R}
                      onChange={(e) => setRow2R(e.target.value)}
                      disabled={submitted}
                      className="w-16 p-1.5 rounded-lg border border-slate-200 text-center font-mono font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </td>
                <td className="p-3 text-center">
                  {submitted ? (
                    Math.abs(parseFloat(row2R) - 10) < 0.1 ? (
                      <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block">✅ صح (10)</span>
                    ) : (
                      <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full inline-block">❌ خطأ (10)</span>
                    )
                  ) : <span className="text-slate-400">قيد الرصد</span>}
                </td>
              </tr>

              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-mono font-bold">10 وحدات</td>
                <td className="p-3 font-mono font-bold">6 وحدات</td>
                <td className="p-3 font-mono text-amber-700 font-bold">180° (متعاكسان)</td>
                <td className="p-3 text-slate-500 font-medium">على طول خط مستقيم عكسياً</td>
                <td className="p-3">
                  <div className="flex justify-center">
                    <input
                      type="number"
                      placeholder="?"
                      value={row3R}
                      onChange={(e) => setRow3R(e.target.value)}
                      disabled={submitted}
                      className="w-16 p-1.5 rounded-lg border border-slate-200 text-center font-mono font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </td>
                <td className="p-3 text-center">
                  {submitted ? (
                    Math.abs(parseFloat(row3R) - 4) < 0.1 ? (
                      <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block">✅ صح (4)</span>
                    ) : (
                      <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full inline-block">❌ خطأ (4)</span>
                    )
                  ) : <span className="text-slate-400">قيد الرصد</span>}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-bold leading-relaxed border whitespace-pre-line ${
          feedback.includes('🎉') ? 'bg-emerald-50 border-emerald-100 text-emerald-850' : 'bg-rose-50 border-rose-100 text-rose-850'
        }`}>
          {feedback}
        </div>
      )}

      <div className="flex justify-center gap-3">
        <button
          onClick={checkVectorsTable}
          disabled={submitted}
          className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:shadow-md disabled:opacity-50"
        >
          <CheckCircle size={15} />
          <span>تحقق من قراءات جدول الرصد</span>
        </button>
        <button
          onClick={resetTable}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
        >
          <RotateCcw size={15} />
          <span>إعادة تعيين القراءات</span>
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 4. مختبر حساب متوسط السرعة (الدرس الثامن)
// ==========================================
export function SpeedLab({ onComplete }: LabProps) {
  const [speed, setSpeed] = useState(30); // م/ث
  const [runs, setRuns] = useState<{ id: number; speed: number; distance: number; time: number }[]>([]);
  const [carPosition, setCarPosition] = useState(0); // نسبة مئوية
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [avgSpeed, setAvgSpeed] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');

  const runTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (runTimerRef.current) clearInterval(runTimerRef.current);
    };
  }, []);

  const changeSpeed = (delta: number) => {
    if (isRunning) return;
    setSpeed(prev => Math.max(10, Math.min(100, prev + delta)));
  };

  const startRun = () => {
    if (isRunning) return;
    setCarPosition(0);
    setElapsedTime(0);
    setIsRunning(true);
    setAvgSpeed(null);
    setFeedback('');

    const targetDistance = 100; // مئة متر عيارياً
    // الزمن المطلوب لقطع المسافة = المسافة ÷ السرعة
    const totalDurationSeconds = targetDistance / speed; 
    const stepMs = 50;
    const progressPerStep = (stepMs / 1000) * (speed / targetDistance) * 100;

    let localPos = 0;
    let localTime = 0;

    runTimerRef.current = window.setInterval(() => {
      localPos += progressPerStep;
      localTime += stepMs / 1000;

      if (localPos >= 100) {
        localPos = 100;
        localTime = targetDistance / speed; // حساب زمني مثالي رياضي دقيق
        if (runTimerRef.current) clearInterval(runTimerRef.current);
        setIsRunning(false);

        // إضافة المحاولة بشكل نهائي لجدول الرصد المنهجي
        const newRun = {
          id: Date.now(),
          speed: speed,
          distance: targetDistance,
          time: parseFloat(localTime.toFixed(2))
        };
        setRuns(prev => [newRun, ...prev].slice(0, 5)); // الاحتفاظ بآخر 5 محاولات
        setFeedback(`✅ رصد مكتمل! قطعت السيارة مسافة ${targetDistance}م بسرعة ${speed}م/ث في زمن قدره ${localTime.toFixed(2)} ثانية.`);
      }

      setCarPosition(localPos);
      setElapsedTime(parseFloat(localTime.toFixed(2)));
    }, stepMs);
  };

  const calculateTotalAverage = () => {
    if (runs.length === 0) {
      setFeedback('⚠️ عذراً! يرجى تنفيذ تجربة ومحاولة جري واحدة على الأقل قبل حساب متوسط السرعة.');
      return;
    }

    // الحسم الرياضي الفعلي: متوسط السرعة = مجموع المسافات ÷ مجموع الأزمنة الكلية
    const totalDistance = runs.reduce((acc, curr) => acc + curr.distance, 0);
    const totalTime = runs.reduce((acc, curr) => acc + curr.time, 0);
    const average = totalDistance / totalTime;

    setAvgSpeed(parseFloat(average.toFixed(2)));
    setFeedback(`🏆 تم التقييد بنجاح! متوسط السرعة لكافة المحاولات الحقيقية هو ${average.toFixed(2)} م/ث.\n` +
                 `مجموع المسافات لرحلتك: ${totalDistance}م ، مجموع الأزمنة: ${totalTime.toFixed(2)}ث.`);
    
    if (runs.length >= 3 && onComplete) {
      onComplete(35, 'lab_speed_average_full');
    }
  };

  const clearRuns = () => {
    setRuns([]);
    setCarPosition(0);
    setIsRunning(false);
    setElapsedTime(0);
    setAvgSpeed(null);
    setFeedback('');
    if (runTimerRef.current) clearInterval(runTimerRef.current);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm text-right" dir="rtl">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 rounded-xl shadow-xs">
        <h4 className="font-bold text-base flex items-center gap-2">
          <TrendingUp size={18} />
          <span>🚗 مختبر حساب متوسط السرعة ورصد الزمن الحركي</span>
        </h4>
        <p className="text-xs text-blue-100 mt-1">اضبط سرعة انطلاق سيارتك، شغل المعايرة، واحسب متوسط السرعة الإجمالي لمختلف المحاولات بدقة علمية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* وحدة التحكم وسرعة العداد */}
        <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-4">
          <span className="text-[10px] font-bold text-slate-400 block text-right">لوحة التحكم والمؤشرات الرقمية</span>
          
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => changeSpeed(-10)}
              disabled={isRunning || speed <= 10}
              className="w-10 h-10 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold flex items-center justify-center text-lg active:scale-90 cursor-pointer disabled:opacity-40"
            >
              ➖
            </button>
            
            <div className="text-center bg-white p-3.5 rounded-xl border border-slate-200 min-w-40 shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold block mb-1">السرعة المحددة لرحلتك</span>
              <strong className="text-3xl font-black font-sans text-indigo-900 leading-none">{speed}</strong>
              <span className="text-[10px] text-slate-400 font-bold block mt-1">متر / ثانية (m/s)</span>
            </div>

            <button
              onClick={() => changeSpeed(10)}
              disabled={isRunning || speed >= 100}
              className="w-10 h-10 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold flex items-center justify-center text-lg active:scale-90 cursor-pointer disabled:opacity-40"
            >
              ➕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-150">
              <span className="text-[10px] text-slate-450 font-bold block">المسافة العيارية ف</span>
              <strong className="text-sm text-indigo-950 font-bold font-mono">100 متر (m)</strong>
            </div>
            <div className="bg-teal-50/60 p-2.5 rounded-lg border border-teal-150">
              <span className="text-[10px] text-slate-450 font-bold block">الزمن المرصود ز</span>
              <strong className="text-sm text-teal-950 font-bold font-mono">{elapsedTime} ثانية (s)</strong>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={startRun}
              disabled={isRunning}
              className="flex-1 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 inline-flex items-center justify-center gap-1.5 text-white font-extrabold text-xs p-3 rounded-xl active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              <Play size={14} />
              <span>انطلق في التجربة</span>
            </button>
            <button
              onClick={calculateTotalAverage}
              className="bg-emerald-600 hover:bg-emerald-700 inline-flex items-center justify-center gap-1.5 text-white font-extrabold text-xs px-4 rounded-xl active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              <Award size={14} />
              <span>احسب المتوسط</span>
            </button>
          </div>
        </div>

        {/* مسار الانطلاق التشبيهي */}
        <div className="bg-slate-900 rounded-2xl p-5 text-white flex flex-col justify-between min-h-[180px] border border-slate-950 relative overflow-hidden">
          <span className="text-[10px] text-slate-450 font-bold">بوابة رصد ومتابعة السيارة على الطريق العلمي</span>
          
          <div className="h-6 w-full bg-slate-800 rounded border border-slate-750 relative flex items-center my-6">
            {/* خطوط الطريق المتقطعة */}
            <div className="absolute inset-x-0 h-0.5 border-t border-dashed border-slate-400 opacity-30"></div>
            {/* خط البداية والنهاية */}
            <span className="absolute right-1 text-[8px] bg-indigo-600 px-1 py-0.2 rounded text-white z-10">البداية 0م</span>
            <span className="absolute left-1 text-[8px] bg-red-650 px-1 py-0.2 rounded text-white z-10">النهاية 100م</span>
            
            {/* السيارة المتحركة الفائقة */}
            <div 
              className="absolute text-xl transition-all duration-75 ease-linear"
              style={{ right: `calc(${carPosition}% - 14px)` }}
            >
              🚗
            </div>
          </div>

          <div className="h-0.5 bg-slate-850 w-full mb-1"></div>
          <p className="text-[10px] text-indigo-250 italic text-center font-medium animate-pulse">سيارة الأستاذ سياف الشباطي للتعليم المتكامل والديناميكا الحية</p>
        </div>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-xs font-bold leading-normal text-emerald-850 whitespace-pre-line">
          {feedback}
        </div>
      )}

      {/* جدول رصد محاولات الصانع الفيزيائي */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1">
            <Activity size={15} className="text-indigo-600" />
            <span>📊 سجل رصد محاولات السرعة الحركية (آخر 5 تجارب)</span>
          </h4>
          <button 
            onClick={clearRuns} 
            className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg hover:bg-rose-100 cursor-pointer"
          >
            مسح السجل
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-xl bg-white">
          <table className="w-full text-xs text-slate-700 table-auto border-collapse text-right">
            <thead>
              <tr className="bg-slate-50 text-slate-900 font-extrabold border-b border-slate-150">
                <th className="p-3">رقم المحاولة</th>
                <th className="p-3">السرعة المهروسة v</th>
                <th className="p-3">المسافة ف</th>
                <th className="p-3">الزمن المستهلك t</th>
                <th className="p-3">الحالة رياضيًا</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono font-bold text-slate-800">
              {runs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-400 font-medium">لا يوجد محاولات منجزة بعد. انقر على 'انطلق في التجربة' للبدء.</td>
                </tr>
              ) : (
                runs.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="p-3 text-slate-400">محاولة {runs.length - idx}</td>
                    <td className="p-3 text-indigo-800">{r.speed} م/ث</td>
                    <td className="p-3 text-emerald-800">{r.distance} م</td>
                    <td className="p-3 text-teal-800">{r.time} ثانية</td>
                    <td className="p-3 text-right">
                      <span className="text-[10px] font-sans font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full inline-block">✅ رصد ناجح</span>
                     </td>
                   </tr>
                ))
              )}
            </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. مختبر رصد العجلة المتسارعة (الدرس التاسع)
// ==========================================
export function AccelerationLab({ onComplete }: LabProps) {
  const [accelType, setAccelType] = useState<'positive' | 'negative' | 'zero'>('positive');
  
  // New Physical Slider States
  const [v0, setV0] = useState(10); // m/s
  const [accel, setAccel] = useState(5.0); // m/s²
  const [duration, setDuration] = useState(8.0); // s

  // Simulation Running State
  const [isRunning, setIsRunning] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentDisplacement, setCurrentDisplacement] = useState(0);

  // Time-series data recorded during active run
  const [currentRunData, setCurrentRunData] = useState<{ t: number; v: number; d: number }[]>([]);

  // Historical / Saved runs for comparison
  const [savedRuns, setSavedRuns] = useState<any[]>([]);
  const [runsColors] = useState(['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']);

  // Quiz States (Original)
  const [userAnswer, setUserAnswer] = useState('');
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState('');
  const [feedback, setFeedback] = useState('');

  const animRef = useRef<number | null>(null);
  const trackCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const vtCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const dtCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Quick Preset Selection (Bridges sliders with original preset IDs)
  const selectPreset = (type: 'positive' | 'negative' | 'zero') => {
    setAccelType(type);
    setFeedback('');
    if (type === 'positive') {
      setV0(10);
      setAccel(5.0);
      setDuration(8.0);
    } else if (type === 'negative') {
      setV0(50);
      setAccel(-6.0);
      setDuration(8.0);
    } else {
      setV0(30);
      setAccel(0.0);
      setDuration(8.0);
    }

    // Reset current active run
    setCurrentTime(0);
    setCurrentSpeed(0);
    setCurrentDisplacement(0);
    setCurrentRunData([]);
  };

  const startSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setFeedback('');
    
    // Clear and put initial state
    const points: { t: number; v: number; d: number }[] = [];
    points.push({ t: 0, v: v0, d: 0 });
    setCurrentRunData(points);
    setCurrentTime(0);
    setCurrentSpeed(v0);
    setCurrentDisplacement(0);

    const stepSeconds = 0.05;
    const intervalMs = 50;
    let t = 0;

    // If brakes are applied (accel < 0), calculate exact time of coming to stop
    const stoppingTime = accel < 0 ? -v0 / accel : Infinity;

    animRef.current = window.setInterval(() => {
      t += stepSeconds;
      if (t > duration) t = duration;

      let v = v0 + accel * t;
      let d = v0 * t + 0.5 * accel * t * t;

      // Handle full stop if negative acceleration stops motion
      if (accel < 0 && t >= stoppingTime) {
        v = 0;
        const tStop = stoppingTime;
        d = v0 * tStop + 0.5 * accel * tStop * tStop;
      }

      const cleanV = parseFloat(v.toFixed(2));
      const cleanT = parseFloat(t.toFixed(2));
      const cleanD = parseFloat(d.toFixed(2));

      setCurrentSpeed(cleanV);
      setCurrentTime(cleanT);
      setCurrentDisplacement(cleanD);

      points.push({ t: cleanT, v: cleanV, d: cleanD });
      setCurrentRunData([...points]);

      if (t >= duration) {
        if (animRef.current) clearInterval(animRef.current);
        setIsRunning(false);
      }
    }, intervalMs);
  };

  const saveCurrentRun = () => {
    if (currentRunData.length === 0) {
      setFeedback('⚠️ الرجاء تشغيل المحاكاة أولاً لتسجيل ورصد حركة التجربة!');
      return;
    }
    const runId = Date.now();
    const index = savedRuns.length % runsColors.length;
    
    const newRun = {
      id: runId,
      name: `تجربة #${savedRuns.length + 1} (سرعة=${v0} م/ث، عجلة=${accel}، زمن=${duration}ث)`,
      v0,
      accel,
      duration,
      finalV: currentSpeed,
      finalD: currentDisplacement,
      color: runsColors[index],
      data: [...currentRunData],
      showOnGraph: true
    };

    setSavedRuns(prev => [...prev, newRun]);
    setFeedback(`📥 تم حفظ التجربة رقم #${savedRuns.length + 1} بنجاح! تم قيدها في جدول مقارنة التجارب وتظليلها على الرسم البياني.`);
  };

  const deleteSavedRun = (id: number) => {
    setSavedRuns(prev => prev.filter(r => r.id !== id));
  };

  const toggleRunVisibility = (id: number) => {
    setSavedRuns(prev => prev.map(r => r.id === id ? { ...r, showOnGraph: !r.showOnGraph } : r));
  };

  const clearComparisons = () => {
    setSavedRuns([]);
    setFeedback('🗑️ تم إفراغ سجل المقارنات الحركية بالكامل.');
  };

  const checkQuiz = () => {
    if (!userAnswer) {
      setQuizFeedback('⚠️ الرجاء اختيار خيار للإجابة على تحدي العجلة أولاً.');
      return;
    }
    setQuizSubmitted(true);
    if (userAnswer === 'a2') {
      setQuizFeedback('🎉 إجابة مذهلة وصحيحة! العجلة سالبة (تباطؤ) وقيمتها = (ع - ع₀) / ز = (0 - 20) / 5 = -4 م/ث².');
      if (onComplete) onComplete(30, 'lab_acceleration_quiz');
    } else {
      setQuizFeedback('❌ الإجابة غير صحيحة. القيمة الرياضية هي -4 م/ث² لأن السيارة تباطأت حتى توقفت (السرعة النهائية ع=0 والابتدائية ع₀=20).');
    }
  };

  // Graph and track auto-scales calculations
  const findMaxT = () => {
    let list = [duration];
    savedRuns.forEach(r => { if (runNeedsPlotting(r)) list.push(r.duration); });
    return Math.max(...list);
  };

  const findMaxV = () => {
    let list = [v0, Math.abs(v0 + accel * duration)];
    savedRuns.forEach(r => {
      if (runNeedsPlotting(r)) {
        list.push(r.v0);
        list.push(Math.abs(r.v0 + r.accel * r.duration));
      }
    });
    return Math.max(40, ...list);
  };

  const findMaxD = () => {
    const currentEndD = v0 * duration + 0.5 * accel * duration * duration;
    let list = [currentEndD];
    savedRuns.forEach(r => {
      if (runNeedsPlotting(r)) {
        list.push(r.finalD);
      }
    });
    return Math.max(100, ...list);
  };

  const runNeedsPlotting = (run: any) => {
    return run.showOnGraph && run.data && run.data.length > 0;
  };

  // Real-time Canvas Renderer Effects
  useEffect(() => {
    // 1) Render Roadway Simulation Track
    const drawTrack = () => {
      const canvas = trackCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Asphalt roadway background
      ctx.fillStyle = '#1e293b'; 
      ctx.fillRect(0, 20, W, 40);

      // Yellow dashed lane lines
      ctx.strokeStyle = '#eab308'; 
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(0, 40); ctx.lineTo(W, 40);
      ctx.stroke();
      ctx.setLineDash([]); 

      // Road shoulder railings
      ctx.strokeStyle = '#64748b'; 
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 20); ctx.lineTo(W, 20);
      ctx.moveTo(0, 60); ctx.lineTo(W, 60);
      ctx.stroke();

      const activeMaxD = findMaxD();
      const maxTrackD = Math.max(100, activeMaxD);

      // Distance labels on the shoulder and ticks
      ctx.fillStyle = '#94a3b8'; 
      ctx.font = 'bold 8px sans-serif';
      const stepsCount = 10;
      const stepDist = Math.ceil(maxTrackD / stepsCount / 10) * 10 || 10;
      for (let dMark = 0; dMark <= maxTrackD; dMark += stepDist) {
        const xMark = 30 + (dMark / maxTrackD) * (W - 60);
        ctx.strokeStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(xMark, 16); ctx.lineTo(xMark, 20);
        ctx.stroke();
        ctx.fillText(`${dMark}م`, xMark - 7, 12);
      }

      // Draw final position markers of saved Runs!
      savedRuns.forEach(run => {
        if (runNeedsPlotting(run)) {
          const runX = 30 + (run.finalD / maxTrackD) * (W - 60);
          ctx.strokeStyle = run.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(runX, 20); ctx.lineTo(runX, 55);
          ctx.stroke();

          ctx.fillStyle = run.color;
          ctx.fillRect(runX, 20, 14, 10);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 6px sans-serif';
          ctx.fillText(`ت${savedRuns.indexOf(run) + 1}`, runX + 2, 28);
        }
      });

      // Draw active car emoji at mapped position
      const carPosPercent = currentDisplacement / maxTrackD;
      const carX = 30 + carPosPercent * (W - 60);
      ctx.font = '20px Arial';
      ctx.fillText('🚗', carX - 10, 48);

      // Sparkles and status indicator on track
      if (isRunning) {
        ctx.fillStyle = accel > 0 ? '#10b981' : accel < 0 ? '#ef4444' : '#60a5fa';
        ctx.font = 'bold 7px sans-serif';
        ctx.fillText(accel > 0 ? '⟫⟫ تزايد' : accel < 0 ? '⟪⟪ تباطؤ' : 'منتظم', carX - 15, 69);
      }
    };

    // 2) Render Velocity-Time (v-t) Graph
    const drawVtGraph = () => {
      const canvas = vtCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Tech Slate Background
      ctx.fillStyle = '#0f172a'; 
      ctx.fillRect(0, 0, W, H);

      const margin = 30;
      const graphW = W - 2 * margin;
      const graphH = H - 2 * margin;

      const maxT = findMaxT();
      const maxV = findMaxV();

      // Draw Grid Lines & text values
      ctx.strokeStyle = '#1e293b'; 
      ctx.lineWidth = 0.5;
      ctx.fillStyle = '#64748b'; 
      ctx.font = '7px monospace';

      for (let vStep = 0; vStep <= maxV; vStep += Math.max(5, Math.ceil(maxV / 5))) {
        const y = H - margin - (vStep / maxV) * graphH;
        ctx.beginPath(); ctx.moveTo(margin, y); ctx.lineTo(W - margin, y); ctx.stroke();
        ctx.fillText(`${vStep}`, 6, y + 3);
      }

      for (let tStep = 0; tStep <= maxT; tStep += Math.max(1, Math.ceil(maxT / 5))) {
        const x = margin + (tStep / maxT) * graphW;
        ctx.beginPath(); ctx.moveTo(x, margin); ctx.lineTo(x, H - margin); ctx.stroke();
        ctx.fillText(`${tStep}ث`, x - 5, H - margin + 12);
      }

      // Main Axes
      ctx.strokeStyle = '#94a3b8'; 
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(margin, margin); ctx.lineTo(margin, H - margin);
      ctx.lineTo(W - margin, H - margin);
      ctx.stroke();

      // Axis Labels
      ctx.fillStyle = '#cbd5e1'; 
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('السرعة ع (m/s)', margin - 15, margin - 10);
      ctx.fillText('الزمن ز (s)', W - margin - 35, H - margin + 12);

      // Plot overlay compared runs (dashed lines)
      savedRuns.forEach((run, idx) => {
        if (runNeedsPlotting(run)) {
          ctx.strokeStyle = run.color;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          run.data.forEach((pt: any, pIdx: number) => {
            const x = margin + (pt.t / maxT) * graphW;
            const y = H - margin - (pt.v / maxV) * graphH;
            if (pIdx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();
        }
      });
      ctx.setLineDash([]); 

      // Plot active run line
      if (currentRunData.length > 0) {
        ctx.strokeStyle = '#6366f1'; 
        ctx.lineWidth = 3;
        ctx.beginPath();
        currentRunData.forEach((pt, pIdx) => {
          const x = margin + (pt.t / maxT) * graphW;
          const y = H - margin - (pt.v / maxV) * graphH;
          if (pIdx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }
    };

    // 3) Render Displacement-Time (d-t) Graph
    const drawDtGraph = () => {
      const canvas = dtCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);

      const margin = 30;
      const graphW = W - 2 * margin;
      const graphH = H - 2 * margin;

      const maxT = findMaxT();
      const maxD = findMaxD();

      // Draw Grid Lines & text values
      ctx.strokeStyle = '#1e293b'; 
      ctx.lineWidth = 0.5;
      ctx.fillStyle = '#64748b'; 
      ctx.font = '7px monospace';

      for (let dStep = 0; dStep <= maxD; dStep += Math.max(10, Math.ceil(maxD / 5))) {
        const y = H - margin - (dStep / maxD) * graphH;
        ctx.beginPath(); ctx.moveTo(margin, y); ctx.lineTo(W - margin, y); ctx.stroke();
        ctx.fillText(`${dStep}`, 6, y + 3);
      }

      for (let tStep = 0; tStep <= maxT; tStep += Math.max(1, Math.ceil(maxT / 5))) {
        const x = margin + (tStep / maxT) * graphW;
        ctx.beginPath(); ctx.moveTo(x, margin); ctx.lineTo(x, H - margin); ctx.stroke();
        ctx.fillText(`${tStep}ث`, x - 5, H - margin + 12);
      }

      // Draw Main Axes
      ctx.strokeStyle = '#94a3b8'; 
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(margin, margin); ctx.lineTo(margin, H - margin);
      ctx.lineTo(W - margin, H - margin);
      ctx.stroke();

      // Axis Labels
      ctx.fillStyle = '#cbd5e1'; 
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('الإزاحة ف (m)', margin - 15, margin - 10);
      ctx.fillText('الزمن ز (s)', W - margin - 35, H - margin + 12);

      // Plot overlay compared runs 
      savedRuns.forEach(run => {
        if (runNeedsPlotting(run)) {
          ctx.strokeStyle = run.color;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          run.data.forEach((pt: any, pIdx: number) => {
            const x = margin + (pt.t / maxT) * graphW;
            const y = H - margin - (pt.d / maxD) * graphH;
            if (pIdx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();
        }
      });
      ctx.setLineDash([]); 

      // Plot active run line (quadratic curve)
      if (currentRunData.length > 0) {
        ctx.strokeStyle = '#10b981'; 
        ctx.lineWidth = 3;
        ctx.beginPath();
        currentRunData.forEach((pt, pIdx) => {
          const x = margin + (pt.t / maxT) * graphW;
          const y = H - margin - (pt.d / maxD) * graphH;
          if (pIdx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }
    };

    drawTrack();
    drawVtGraph();
    drawDtGraph();
  }, [currentRunData, savedRuns, currentTime, v0, accel, duration, currentDisplacement]);

  useEffect(() => {
    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm text-right" dir="rtl">
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white p-4 rounded-xl shadow-xs">
        <h4 className="font-bold text-base flex items-center gap-2">
          <Flame size={18} />
          <span>🚀 علم العجلة والتسارع ورسم المنحنيات البيانية حركياً</span>
        </h4>
        <p className="text-xs text-indigo-150 mt-1">قم بتصميم وتجربة حركة سيارة تحت عواطف العجلة (الموجبة والسالبة والمنعدمة) ورؤية انحناء المبيانات لحظياً!</p>
      </div>

      <div className="bg-indigo-50 border-r-4 border-indigo-650 p-3 text-indigo-950 text-xs leading-relaxed font-semibold">
        🏷️ <b>مفهوم رائد:</b> العجلة المنتظمة هي مقدار التغير الثابت المنحدر لسرعة مركبتك في كل ثانية حتمية. العجلة الصفرية تعني سيارة تسير بسرعة ثابتة دون زيادة أو نقصان ترفاً.
      </div>

      {/* Preset selections */}
      <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 block text-right mb-1">تحديد سريع لنوع العجلة المعيارية للدرس:</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { id: 'positive', label: '🚀 موجب (عجلة تزايدية)', color: 'border-emerald-600 bg-emerald-50/30 font-extrabold text-emerald-900' },
            { id: 'negative', label: '🛑 سالب (عجلة تباطؤية)', color: 'border-rose-600 bg-rose-50/30 font-extrabold text-rose-900' },
            { id: 'zero', label: '➡️ صفر (عجلة منعدمة)', color: 'border-blue-600 bg-blue-50/30 font-extrabold text-blue-900' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => selectPreset(item.id as any)}
              disabled={isRunning}
              className={`p-3 rounded-xl border text-center text-xs transition-all active:scale-95 cursor-pointer flex justify-center items-center ${
                accelType === item.id 
                  ? item.color
                  : 'border-slate-250 bg-white text-slate-705 font-semibold hover:border-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Physics Sliders Panel */}
      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs space-y-4">
        <span className="text-[10px] font-bold text-slate-400 block">اضبط العوامل الفيزيائية للحركة المخصصة:</span>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-200">
            <label className="font-bold text-slate-700 flex justify-between">
              <span>⚡ السرعة الابتدائية ع₀:</span>
              <span className="font-mono text-indigo-700 font-extrabold">{v0} م/ث</span>
            </label>
            <input
              type="range"
              min="0"
              max="50"
              step="2"
              value={v0}
              onChange={(e) => { setV0(parseInt(e.target.value)); setFeedback(''); }}
              disabled={isRunning}
              className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-indigo-650"
            />
          </div>

          <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-200">
            <label className="font-bold text-slate-700 flex justify-between">
              <span>🌍 العجلة المطبقة حـ:</span>
              <span className="font-mono text-emerald-700 font-extrabold">{accel} م/ث²</span>
            </label>
            <input
              type="range"
              min="-10"
              max="10"
              step="0.5"
              value={accel}
              onChange={(e) => { setAccel(parseFloat(e.target.value)); setFeedback(''); }}
              disabled={isRunning}
              className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-emerald-600"
            />
          </div>

          <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-200">
            <label className="font-bold text-slate-700 flex justify-between">
              <span>⏱️ مدة التجربة الكلية ز:</span>
              <span className="font-mono text-teal-700 font-extrabold">{duration} ثوانٍ</span>
            </label>
            <input
              type="range"
              min="2"
              max="15"
              step="0.5"
              value={duration}
              onChange={(e) => { setDuration(parseFloat(e.target.value)); setFeedback(''); }}
              disabled={isRunning}
              className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-teal-600"
            />
          </div>
        </div>
      </div>

      {/* Interactive Canvases Group */}
      <div className="space-y-4">
        {/* Track simulation screen */}
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-900 relative">
          <div className="flex justify-between items-center text-[10px] text-slate-400 mb-2">
            <span>🛣️ محاكاة واقعية لحركة المركبة على الطريق المعياري</span>
            <div className="flex gap-2">
              <span className="bg-slate-900 px-2 py-0.5 rounded text-indigo-400 font-bold font-mono">الزمن: {currentTime} ث</span>
              <span className="bg-slate-900 px-2 py-0.5 rounded text-emerald-400 font-bold font-mono">الإزاحة: {currentDisplacement} م</span>
            </div>
          </div>
          <canvas
            ref={trackCanvasRef}
            width={580}
            height={75}
            className="w-full h-auto bg-slate-900 block rounded-xl"
          />
        </div>

        {/* Side-by-side Velocity and Displacement graphs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-900">
            <span className="text-[10px] text-slate-400 block mb-1">📈 منحنى السرعة والزمن (v-t Curve):</span>
            <canvas
              ref={vtCanvasRef}
              width={280}
              height={160}
              className="w-full h-auto bg-slate-900 block rounded-xl border border-slate-900"
            />
          </div>
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-900">
            <span className="text-[10px] text-slate-400 block mb-1">📈 منحنى الإزاحة والزمن (d-t Curve):</span>
            <canvas
              ref={dtCanvasRef}
              width={280}
              height={160}
              className="w-full h-auto bg-slate-900 block rounded-xl border border-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Simulation Controls & Automatic Math Calculations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
        {/* Action button center */}
        <div className="bg-slate-50 p-4 rounded-xl flex flex-col justify-center space-y-2 border border-slate-100">
          <button
            onClick={startSimulation}
            disabled={isRunning}
            className="w-full bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white font-extrabold p-3 rounded-xl transition-all active:scale-95 cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
          >
            <Play size={14} />
            <span>{isRunning ? '⏳ محاكاة حية...' : '▶ انطلق وجدد الرصد'}</span>
          </button>
          
          <button
            onClick={saveCurrentRun}
            disabled={isRunning || currentRunData.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold p-3 rounded-xl transition-all active:scale-95 cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>📥 حفظ التجربة للمقارنة</span>
          </button>
        </div>

        {/* Live Metrics readout */}
        <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 block mb-1">الرصد الرقمي التلقائي:</span>
          <div className="space-y-1 text-slate-700 leading-normal">
            <div>💡 السرعة الابتدائية ع₀: <strong className="text-indigo-900 font-mono">{v0} م/ث</strong></div>
            <div>💡 السرعة اللحظية ع: <strong className="text-amber-700 font-mono">{currentSpeed} م/ث</strong></div>
            <div>💡 الحركة المنقضية ز: <strong className="text-teal-700 font-mono">{currentTime} ث</strong></div>
            <div>💡 الإزاحة الكلية ف: <strong className="text-emerald-700 font-mono">{currentDisplacement} م</strong></div>
          </div>
        </div>

        {/* Automatic calculation formula block */}
        <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 flex flex-col justify-between">
          <span className="text-[10px] text-emerald-900 block mb-1">⚙️ معادلة حساب العجلة تلقائياً:</span>
          <div className="space-y-1 text-emerald-950 font-serif" dir="ltr">
            <div className="text-center font-bold text-sm text-emerald-850">
              a = (v<sub>f</sub> - v<sub>i</sub>) / t
            </div>
            <div className="text-center text-[11px] font-mono mt-1 text-slate-750">
              a = ({currentSpeed} - {v0}) / {currentTime || '...'}
            </div>
            <div className="text-center text-xs font-bold text-emerald-900 font-mono mt-1" dir="rtl">
              العجلة المحسوبة = {currentTime > 0 ? ((currentSpeed - v0) / currentTime).toFixed(2) : '...'} م/ث²
            </div>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-xs font-bold leading-normal text-emerald-850 whitespace-pre-line text-right">
          {feedback}
        </div>
      )}

      {/* Comparisons Panel Section (Compare more than one experiment) */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h5 className="font-extrabold text-slate-800 text-xs flex items-center gap-1">
            <Activity size={14} className="text-indigo-600 animate-pulse" />
            <span>📊 جناح مقارنة التجارب الحركية المتعددة (تراكب المبيانات)</span>
          </h5>
          {savedRuns.length > 0 && (
            <button 
              onClick={clearComparisons} 
              className="text-[9px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded hover:bg-rose-100 cursor-pointer"
            >
              مسح كافة المقارنات
            </button>
          )}
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-xl bg-slate-50">
          <table className="w-full text-[10.5px] table-auto border-collapse text-right">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-extrabold border-b border-slate-200">
                <th className="p-2 border-l border-slate-200 text-center">تظليل ع المخطط</th>
                <th className="p-2">التجربة</th>
                <th className="p-2">السرعة البدئية</th>
                <th className="p-2">العجلة</th>
                <th className="p-2">الزمن الكلي</th>
                <th className="p-2">مجموع الإزاحة</th>
                <th className="p-2">السرعة النهائية</th>
                <th className="p-2 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 font-bold text-slate-800">
              {savedRuns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-slate-450 font-medium bg-white">سجل المقارنات فارغ. انطلق بالسيارة ثم اضغط على 'حفظ التجربة للمقارنة' لتراكب مبياناتها المائلة.</td>
                </tr>
              ) : (
                savedRuns.map((run, index) => (
                  <tr key={run.id} className="hover:bg-slate-50/50 bg-white" style={{ borderLeft: `5px solid ${run.color}` }}>
                    <td className="p-2 text-center border-l border-slate-200">
                      <input 
                        type="checkbox"
                        checked={run.showOnGraph}
                        onChange={() => toggleRunVisibility(run.id)}
                        className="rounded text-indigo-650 focus:ring-0 cursor-pointer w-3.5 h-3.5"
                      />
                    </td>
                    <td className="p-2" style={{ color: run.color }}>{run.name}</td>
                    <td className="p-2 font-mono">{run.v0} م/ث</td>
                    <td className="p-2 font-mono">{run.accel >= 0 ? `+${run.accel}` : run.accel} م/ث²</td>
                    <td className="p-2 font-mono">{run.duration} ث</td>
                    <td className="p-2 font-mono text-emerald-800">{run.finalD} م</td>
                    <td className="p-2 font-mono text-amber-800">{run.finalV} م/ث</td>
                    <td className="p-2 text-center">
                      <button 
                        onClick={() => deleteSavedRun(run.id)}
                        className="text-[9px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded hover:bg-rose-100 cursor-pointer"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Challenge / Quiz (Original preserved exactly) */}
      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-4">
        <h5 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5 border-b border-indigo-100 pb-2">
          <Target size={14} className="text-indigo-600" />
          <span>تحدي الفهم ومنهجية الحسبة المنهجية (مثال 30 للثانوي):</span>
        </h5>
        <p className="text-xs font-bold text-slate-700 leading-normal">
          تضغط سيارة عائلية على الفرامل لتتبخر سرعتها من 20 م/ث من السكون تدريجياً حتى السكون التام والوقف في 5 ثوانٍ كاملة. فما ميزة التسارع المحتم؟
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-right">
          {[
            { id: 'a1', label: 'عجلة موجبة بقيمة +4 م/ث²' },
            { id: 'a2', label: 'عجلة سالبة بقيمة -4 م/ث²' },
            { id: 'a3', label: 'عجلة منعدمة بقيمة صفر م/ث²' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => { if (!quizSubmitted) setUserAnswer(opt.id); }}
              disabled={quizSubmitted}
              className={`p-3 rounded-xl border text-right transition-all font-semibold cursor-pointer ${
                userAnswer === opt.id 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {quizFeedback && (
          <div className={`p-4 rounded-xl text-xs font-bold leading-relaxed border ${
            userAnswer === 'a2' ? 'bg-emerald-50 border-emerald-100 text-emerald-850' : 'bg-rose-50 border-rose-100 text-rose-850'
          }`}>
            {quizFeedback}
          </div>
        )}

        {!quizSubmitted && (
          <div className="flex justify-center">
            <button
              onClick={checkQuiz}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
            >
              إرسال الحل والتحقق
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 6. مختبر معادلات الحركة المنهجي (الدرس العاشر)
// ==========================================
export function KinematicsLab({ onComplete }: LabProps) {
  const [currentTab, setCurrentTab] = useState<'match' | 'equation' | 'comp'>('match');

  // 1. لعبة مطابقة الرموز بالرموز الفيزيائية
  const quantities = [
    { name: "الزمن الكلي للرصد", correctSymbol: "ز" },
    { name: "المسافة الكلية المقطوعة", correctSymbol: "ف" },
    { name: "السرعة الابتدائية المنطلقة", correctSymbol: "ع₀" },
    { name: "العجلة المتولدة", correctSymbol: "ج" },
    { name: "السرعة النهائية للحركة", correctSymbol: "ع" }
  ];

  const symbols = ["ز", "ف", "ع₀", "ج", "ع"];

  const [matches, setMatches] = useState<{ [qName: string]: string }>({});
  const [selectedQty, setSelectedQty] = useState<string | null>(null);
  const [matchDone, setMatchDone] = useState(false);
  const [matchFeedback, setMatchFeedback] = useState('');

  const handleQtySelect = (qtyName: string) => {
    if (matchDone) return;
    setSelectedQty(qtyName);
    setMatchFeedback('');
  };

  const handleSymbolSelect = (symbol: string) => {
    if (!selectedQty || matchDone) return;
    setMatches(prev => ({
      ...prev,
      [selectedQty]: symbol
    }));
    setSelectedQty(null);
  };

  const verifyMatches = () => {
    let wrongCount = 0;
    quantities.forEach(q => {
      const userSymbol = matches[q.name];
      if (userSymbol !== q.correctSymbol) {
        wrongCount++;
      }
    });

    setMatchDone(true);

    if (wrongCount === 0) {
      setMatchFeedback('🎉 مطابقة ناجحة وإبداع منقطع النظير! لقد طابقت الرموز المنهجية بكفاءة 100%.');
      if (onComplete) onComplete(20, 'kinematics_symbols_match');
    } else {
      setMatchFeedback(`❌ رصدنا أخطاء! هناك ${wrongCount} رموز طوبقت بشكل غير سليم. انقر على إعادة المحاولة لإتقانها.`);
    }
  };

  const resetMatches = () => {
    setMatches({});
    setSelectedQty(null);
    setMatchDone(false);
    setMatchFeedback('');
  };

  // 2. تحدي اختيار المعادلة الملائمة
  const [eqProblemIdx, setEqProblemIdx] = useState(0);
  const [eqAnswer, setEqAnswer] = useState<string | null>(null);
  const [eqSubmitted, setEqSubmitted] = useState(false);
  const [eqFeedback, setEqFeedback] = useState('');

  const physicsProblems = [
    {
      problem: "ينطلق فهد من السكون بعجلة 2م/ث² لمدة 10 ثوانٍ. ما هي المسافة التي يقطعها؟",
      eqs: [
        { id: "eq1", formula: "ع = ع₀ + ج ز (الأولى)", desc: "تصل السرعة بالزمن دون مسافة" },
        { id: "eq2", formula: "ف = ع₀ ز + ½ ج ز² (الثانية)", desc: "ترص الإزاحة بالزمن بدقة" },
        { id: "eq3", formula: "ع² = ع₀² + 2 ج ف (الثالثة)", desc: "تدرس السرعة والمسافة دون زمن" }
      ],
      correctEq: "eq2",
      explain: "✅ نعم، المعادلة الثانية هي المطلوبة! حيث لدينا الزمن والمطلوب الإزاحة والسرعة الابتدائية صفر."
    },
    {
      problem: "تتباطأ حافلة مدرسية من سرعة 20 م/ث حتى تقف تماماً بقطع مسافة 40 متراً مساوياً. عين مقدار التراجع؟",
      eqs: [
        { id: "eq1", formula: "ع = ع₀ + ج ز (الأولى)", desc: "هذا يلزم معرفة زمن الرصد" },
        { id: "eq2", formula: "ف = ع₀ ز + ½ ج ز² (الثانية)", desc: "هذا يتطلب معرفة زمن الرصد" },
        { id: "eq3", formula: "ع² = ع₀² + 2 ج ف (الثالثة)", desc: "مستقلة عن الزمن وتجمع السرعة والمسافة" }
      ],
      correctEq: "eq3",
      explain: "✅ مثير للدهشة! نختار المعادلة الثالثة نظراً لأن الزمن معزول ومجهول تماماً في المسألة المنهجية."
    }
  ];

  const currentProb = physicsProblems[eqProblemIdx];

  const checkEqChoice = (choice: string) => {
    if (eqSubmitted) return;
    setEqAnswer(choice);
    setEqSubmitted(true);
    if (choice === currentProb.correctEq) {
      setEqFeedback(`🎉 أصبت كبد الحقيقة! ${currentProb.explain}`);
      if (onComplete) onComplete(25, `kinematics_eq_selection_${eqProblemIdx}`);
    } else {
      setEqFeedback(`❌ اختيار غير موافق. المعادلة الفعالة هي: ${currentProb.eqs.find(e => e.id === currentProb.correctEq)?.formula}. السبب: ${currentProb.explain}`);
    }
  };

  const nextProb = () => {
    if (eqProblemIdx < physicsProblems.length - 1) {
      setEqProblemIdx(prev => prev + 1);
      setEqAnswer(null);
      setEqSubmitted(false);
      setEqFeedback('');
    } else {
      setEqFeedback('🏆 رائع! لقد أنهيت بنجاح مهارة اختيار القوانين الفيزيائية السلوكية للحساب.');
    }
  };

  // 3. مسابقة الفريقين (الأحمر 🆚 الأزرق) في 4 أسئلة بالتناوب
  const compQuestions = [
    { q: "ما هو رمز السرعة الابتدائية؟", options: ["ع", "ع₀", "ف", "ج"], correct: "ع₀" },
    { q: "السرعة النهائية للارتطام من السكون تماماً تعني ع₀ تساوي؟", options: ["0", "9.8", "10", "لا شيء"], correct: "0" },
    { q: "وحدة قياس العجلة دولياً هي؟", options: ["م/ث", "م/ث²", "م/ث³", "كم/س"], correct: "م/ث²" },
    { q: "إذا تسارع جسم من السكون بعجلة 1 م/ث² في 5 ثوانٍ، فكم سرعته النهائية؟", options: ["1 م/ث", "5 م/ث", "10 م/ث", "0.5 م/ث"], correct: "5 م/ث" }
  ];

  const [compActive, setCompActive] = useState(false);
  const [compStep, setCompStep] = useState(0); // 0 to 3
  const [redScore, setRedScore] = useState(0);
  const [blueScore, setBlueScore] = useState(0);
  const [compFeedback, setCompFeedback] = useState('');
  const [compEnded, setCompEnded] = useState(false);

  const startComp = () => {
    setCompActive(true);
    setCompStep(0);
    setRedScore(0);
    setBlueScore(0);
    setCompFeedback('🛡️ بدأت الحرب الفكرية! السؤال الأول للأحمر 🔴');
    setCompEnded(false);
  };

  const handleCompAnswer = (selectedOpt: string) => {
    if (compEnded) return;

    const currentQ = compQuestions[compStep];
    const isRedTurn = compStep % 2 === 0;
    const isCorrect = selectedOpt === currentQ.correct;

    if (isCorrect) {
      if (isRedTurn) {
        setRedScore(prev => prev + 1);
      } else {
        setBlueScore(prev => prev + 1);
      }
    }

    let nextStepFeedback = '';
    const currentTeamName = isRedTurn ? '🔴 الفريق الأحمر' : '🔵 الفريق الأزرق';
    const nextTeamName = !isRedTurn ? '🔴 الفريق الأحمر' : '🔵 الفريق الأزرق';

    if (isCorrect) {
      nextStepFeedback = `✅ أصاب ${currentTeamName} الجبهة الصحيحة وحصد نقطة! `;
    } else {
      nextStepFeedback = `❌ تعثر ${currentTeamName} وكانت الإجابة الصحيحة هي: ${currentQ.correct}. `;
    }

    if (compStep < compQuestions.length - 1) {
      setCompStep(prev => prev + 1);
      setCompFeedback(nextStepFeedback + `دوران السجال لـ ${nextTeamName}.`);
    } else {
      setCompEnded(true);
      const finalMsg = redScore === blueScore 
        ? `🏁 تعادل الفريقان بصبر وحسم: ${redScore} - ${blueScore}!`
        : redScore > blueScore 
          ? `🏆 فاز اليمانيون الأحمر 🔴 بقيمة متميزة: ${redScore} مقابل ${blueScore} للأزرق!`
          : `🏆 ظفر الفريق الأزرق 🔵 بنتيجة متميزة: ${blueScore} مقابل ${redScore} للأحمر!`;
      setCompFeedback(nextStepFeedback + '\n' + finalMsg);
      if (onComplete) onComplete(30, 'kinematics_team_competition');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm text-right" dir="rtl">
      <div className="bg-gradient-to-r from-teal-700 via-indigo-800 to-indigo-950 text-white p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-base flex items-center gap-1.5 text-white">
            <Award size={18} />
            <span>📖 كراس أنشطة وتطوير معادلات الحركة العجائبية الثلاث</span>
          </h4>
          <p className="text-xs text-slate-100 mt-0.5 font-medium">مهارات وألعاب عملية مطابقة ميثودولوجياً للمنهج الدراسي اليمني مع الأستاذ سياف الشباطي</p>
        </div>
        
        {/* مبدّل التبويبات الكراسي */}
        <div className="flex bg-slate-900/30 p-1 rounded-xl gap-1 text-[10px] font-bold border border-white/10 shadow-inner">
          {[
            { id: 'match', label: '🧩 مطابقة الرموز' },
            { id: 'equation', label: '🧠 اختيار القانون' },
            { id: 'comp', label: '⚔️ مسابقة الفريقين' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as any)}
              className={`p-2 px-3.5 rounded-lg border-none active:scale-95 duration-75 cursor-pointer ${
                currentTab === tab.id 
                  ? 'bg-white text-indigo-950 shadow-xs' 
                  : 'text-white/80 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* التبويب الأول: مطابقة الرموز */}
      {currentTab === 'match' && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-indigo-50 p-4 rounded-xl space-y-1.5 text-right">
            <h5 className="font-extrabold text-indigo-950 text-xs">🎮 الخطوة 1: طابق الكمية الفيزيائية برمزها الرياضي المقنن</h5>
            <p className="text-[10px] text-slate-500 font-medium">طريقة اللعب: انقر على الكمية الفيزيائية باليمين أولاً، ثم انقر على رمزها المناسب باليسار لتنصيب الوصلة الحية.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* قائمة الكميات */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] text-slate-400 font-bold block mb-1">الكميات المنهجية</span>
              {quantities.map(q => {
                const matchedSymbol = matches[q.name];
                return (
                  <button
                    key={q.name}
                    onClick={() => handleQtySelect(q.name)}
                    disabled={matchDone}
                    className={`w-full text-right p-3 rounded-xl border transition-all text-xs font-bold flex items-center justify-between cursor-pointer active:scale-98 ${
                      selectedQty === q.name 
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900' 
                        : matchedSymbol 
                          ? 'border-emerald-250 bg-emerald-50/20 text-emerald-950' 
                          : 'border-slate-150 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>{q.name}</span>
                    {matchedSymbol ? (
                      <span className="font-mono bg-emerald-600 text-white px-2.5 py-1 rounded-lg text-xs leading-none">
                        الرمز المطابق: {matchedSymbol}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-normal">غير محدد</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* أزرار الرموز الكونية */}
            <div className="space-y-3">
              <span className="text-[10px] text-slate-400 font-bold block">الرموز المتاحة للتركيب والربط</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs font-black">
                {symbols.map(sym => {
                  const isAssigned = Object.values(matches).includes(sym);
                  return (
                    <button
                      key={sym}
                      onClick={() => handleSymbolSelect(sym)}
                      disabled={isAssigned || matchDone}
                      className={`p-4 rounded-xl border text-base font-extrabold font-mono transition-all cursor-pointer active:scale-90 ${
                        isAssigned 
                          ? 'bg-slate-100 text-slate-350 border-slate-200' 
                          : 'bg-white hover:border-indigo-500 text-indigo-700 border-slate-200 hover:shadow-xs'
                      }`}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {matchFeedback && (
            <div className={`p-4 rounded-xl text-xs font-bold border ${
              matchFeedback.includes('🎉') ? 'bg-emerald-50 border-emerald-100 text-emerald-850' : 'bg-rose-50 border-rose-100 text-rose-850'
            }`}>
              {matchFeedback}
            </div>
          )}

          <div className="flex justify-center gap-2">
            <button
              onClick={verifyMatches}
              disabled={matchDone || Object.keys(matches).length < 5}
              className="bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              طابق وتحقق من الصحة
            </button>
            <button
              onClick={resetMatches}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer active:scale-95"
            >
              🔄 إعادة تصفير المحطة
            </button>
          </div>
        </div>
      )}

      {/* التبويب الثاني: اختيار القانون */}
      {currentTab === 'equation' && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-amber-50 p-4 rounded-xl space-y-1 text-right">
            <h5 className="font-extrabold text-amber-950 text-xs">🎮 الخطوة 2: اختبار ذكاء اختيار المعادلات الملائمة</h5>
            <p className="text-[10px] text-slate-500 font-medium">سياقات المسألة اللفظية تستدعي تفكيرك لاختيار المعادلة الأبسط والملائمة لتجاوز الأبعاد غير المرغوبة.</p>
          </div>

          <div className="bg-amber-100/40 border border-amber-200 rounded-2xl p-5 text-right space-y-3 shadow-xs">
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full uppercase">المعضلة اللفظية الموجهة</span>
            <p className="text-xs font-black text-slate-800 leading-relaxed font-sans select-all">{currentProb.problem}</p>
          </div>

          <div className="space-y-2.5 text-xs text-right">
            <span className="text-[10px] text-slate-400 font-bold block">القوانين المتاحة للاختيار البرمجي:</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {currentProb.eqs.map(eq => {
                const isUserChoice = eqAnswer === eq.id;
                return (
                  <button
                    key={eq.id}
                    onClick={() => checkEqChoice(eq.id)}
                    disabled={eqSubmitted}
                    className={`p-4 rounded-2xl border text-right transition-all cursor-pointer active:scale-98 hover:shadow-xs group ${
                      isUserChoice 
                        ? eqAnswer === currentProb.correctEq
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                          : 'bg-rose-600 text-white border-rose-600 font-bold'
                        : 'bg-white hover:border-slate-350 text-slate-700 border-slate-200'
                    }`}
                  >
                    <strong className="font-sans font-bold text-sm block mb-1 group-hover:text-amber-700 transition-colors">{eq.formula}</strong>
                    <span className="text-[10px] text-slate-400 font-medium leading-normal block">{eq.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {eqFeedback && (
            <div className={`p-4 rounded-xl text-xs font-bold border leading-relaxed ${
              eqFeedback.includes('🎉') ? 'bg-emerald-50 border-emerald-100 text-emerald-850' : 'bg-rose-50 border-rose-100 text-rose-850'
            }`}>
              {eqFeedback}
            </div>
          )}

          {eqSubmitted && eqProblemIdx < physicsProblems.length - 1 && (
            <div className="flex justify-center">
              <button
                onClick={nextProb}
                className="bg-indigo-750 hover:bg-indigo-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
              >
                المعضلة التالية ◄
              </button>
            </div>
          )}
        </div>
      )}

      {/* التبويب الثالث: مسابقة الفريقين */}
      {currentTab === 'comp' && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-right space-y-1">
            <h5 className="font-extrabold text-slate-900 text-xs text-indigo-950">🎮 الخطوة 3: معركة الرموز والمفاهيم (الأحمر 🆚 الأزرق)</h5>
            <p className="text-[10px] text-slate-500 font-medium">مسابقة سريعة من 4 أسئلة لحسم تفوق فريق الأحمر أو الأزرق وإرسال المحاولة للرصد النهائي.</p>
          </div>

          {!compActive ? (
            <div className="text-center p-8 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
              <Users size={32} className="mx-auto text-indigo-600 animate-pulse" />
              <h5 className="font-bold text-slate-800 text-xs">مسابقة الفريقين (فيزياء ومعادلات)</h5>
              <p className="text-[10px] text-slate-400 max-w-sm mx-auto leading-normal">يتم الإجابة عن أربعة معضلات بالتناوب للفريقين لتعزيز روح المنافسة والابتسام الفكري داخل المجموعات الدراسية اليمنية.</p>
              <button
                onClick={startComp}
                className="bg-indigo-700 hover:bg-indigo-800 active:scale-95 text-white text-xs font-extrabold px-8 py-3 rounded-xl cursor-pointer shadow-xs transition-all"
              >
                ⚔️ بدء مسابقة الغمار الفكري
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* لوحة النتائج */}
              <div className="flex justify-center items-center gap-6">
                <div className="bg-rose-50 border-2 border-rose-550 p-4 rounded-xl text-center min-w-32 shadow-xs">
                  <span className="text-[10px] text-rose-700 font-extrabold block mb-1">🔴 الفريق الأحمر</span>
                  <strong className="text-3xl font-black font-mono text-rose-800">{redScore}</strong>
                </div>
                <div className="text-slate-450 font-black text-xl font-sans">VS</div>
                <div className="bg-blue-50 border-2 border-blue-550 p-4 rounded-xl text-center min-w-32 shadow-xs">
                  <span className="text-[10px] text-blue-700 font-extrabold block mb-1">🔵 الفريق الأزرق</span>
                  <strong className="text-3xl font-black font-mono text-blue-800">{blueScore}</strong>
                </div>
              </div>

              {/* السؤال الفعال وسجاله */}
              {!compEnded && (
                <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-4 border border-slate-950">
                  <span className="bg-indigo-950 text-indigo-400 px-3 py-1 rounded-full font-bold text-[10px]">
                    دور السجال: {compStep % 2 === 0 ? '🔴 الفريق الأحمر' : '🔵 الفريق الأزرق'}
                  </span>
                  <h4 className="text-sm font-bold leading-relaxed">{compQuestions[compStep].q}</h4>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-800">
                    {compQuestions[compStep].options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => handleCompAnswer(opt)}
                        className="bg-white hover:bg-slate-100 p-3 rounded-xl border-none transition-all cursor-pointer font-bold active:scale-95 text-center"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {compFeedback && (
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-xs font-bold leading-normal text-indigo-850 whitespace-pre-line text-center">
                  {compFeedback}
                </div>
              )}

              {compEnded && (
                <div className="flex justify-center">
                  <button
                    onClick={startComp}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-8 py-2.5 rounded-xl cursor-pointer leading-tight active:scale-95"
                  >
                    🔄 خوض مسابقة جديدة
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 7. مختبر السقوط الحر والحركة الرأسية (الدرس الحادي عشر)
// ==========================================
export function FreeFallLab({ onComplete }: LabProps) {
  const [currentTab, setCurrentTab] = useState<'freefall' | 'vertical'>('freefall');

  // 1. معمل السقوط الحر (الحجر والريشة)
  const [height, setHeight] = useState<number>(30); // 10 to 100 meters
  const [medium, setMedium] = useState<'vacuum' | 'air'>('vacuum');
  const [isFalling, setIsFalling] = useState<boolean>(false);
  
  const [stonePos, setStonePos] = useState<number>(0); 
  const [featherPos, setFeatherPos] = useState<number>(0); 
  
  const [stoneTime, setStoneTime] = useState<number>(0);
  const [featherTime, setFeatherTime] = useState<number>(0);
  
  const [stoneSpeed, setStoneSpeed] = useState<number>(0);
  const [featherSpeed, setFeatherSpeed] = useState<number>(0);

  const [attempts, setAttempts] = useState<{
    id: number;
    height: number;
    medium: string;
    stoneTime: number;
    featherTime: number;
    stoneSpeed: number;
  }[]>([]);

  // 2. معمل القذف الرأسي (كرة السلة)
  const [v0, setV0] = useState<number>(15); // 5 to 30 m/s
  const [gravityType, setGravityType] = useState<'earth' | 'moon' | 'mars'>('earth');
  const [isLaunching, setIsLaunching] = useState<boolean>(false);
  const [ballHeight, setBallHeight] = useState<number>(0); 
  const [ballSpeed, setBallSpeed] = useState<number>(0); 
  const [launchTime, setLaunchTime] = useState<number>(0);
  const [maxHeightReached, setMaxHeightReached] = useState<number>(0);
  const [timeToPeak, setTimeToPeak] = useState<number>(0);

  const gravityValues = {
    earth: 9.8,
    moon: 1.62,
    mars: 3.7
  };

  const gravityLabels = {
    earth: "الجاذبية الأرضية (9.8 م/ث²)",
    moon: "جاذبية القمر (1.62 م/ث²)",
    mars: "جاذبية المريخ (3.7 م/ث²)"
  };

  const startFall = () => {
    if (isFalling) return;
    setIsFalling(true);
    setStonePos(0);
    setFeatherPos(0);
    setStoneTime(0);
    setFeatherTime(0);
    setStoneSpeed(0);
    setFeatherSpeed(0);

    const g = 9.8;
    const realStoneTime = Math.sqrt((2 * height) / g);
    const realFeatherTime = medium === 'vacuum' ? realStoneTime : realStoneTime * 2.8;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      
      // تحديث الحجر
      if (elapsed <= realStoneTime) {
        setStoneTime(elapsed);
        const currentSpeed = g * elapsed;
        setStoneSpeed(currentSpeed);
        const currentS = 0.5 * g * elapsed * elapsed;
        const percent = Math.min((currentS / height) * 100, 100);
        setStonePos(percent);
      } else {
        setStoneTime(realStoneTime);
        setStoneSpeed(g * realStoneTime);
        setStonePos(100);
      }

      // تحديث الريشة
      if (elapsed <= realFeatherTime) {
        setFeatherTime(elapsed);
        const currentG = medium === 'vacuum' ? g : g / (2.8 * 2.8);
        const currentSpeed = currentG * elapsed;
        setFeatherSpeed(currentSpeed);
        const currentS = 0.5 * currentG * elapsed * elapsed;
        const percent = Math.min((currentS / height) * 100, 100);
        setFeatherPos(percent);
      } else {
        setFeatherTime(realFeatherTime);
        const currentG = medium === 'vacuum' ? g : g / (2.8 * 2.8);
        setFeatherSpeed(currentG * realFeatherTime);
        setFeatherPos(100);
      }

      if (elapsed >= realStoneTime && elapsed >= realFeatherTime) {
        clearInterval(interval);
        setIsFalling(false);
        setAttempts(prev => {
          const newAtt = [
            ...prev,
            {
              id: prev.length + 1,
              height: height,
              medium: medium === 'vacuum' ? 'فراغ تام 🌌' : 'مقاومة الهواء 💨',
              stoneTime: parseFloat(realStoneTime.toFixed(2)),
              featherTime: parseFloat(realFeatherTime.toFixed(2)),
              stoneSpeed: parseFloat((g * realStoneTime).toFixed(1))
            }
          ];
          if (newAtt.length >= 4 && onComplete) {
            onComplete(25, 'freefall_four_attempts');
          }
          return newAtt;
        });
      }
    }, 25);
  };

  const startLaunch = () => {
    if (isLaunching) return;
    setIsLaunching(true);
    setBallHeight(0);
    setBallSpeed(v0);
    setLaunchTime(0);

    const g = gravityValues[gravityType];
    const peakTime = v0 / g;
    const maxH = (v0 * v0) / (2 * g);
    const totalTime = peakTime * 2;

    setTimeToPeak(parseFloat(peakTime.toFixed(2)));
    setMaxHeightReached(parseFloat(maxH.toFixed(2)));

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;

      if (elapsed < totalTime) {
        setLaunchTime(elapsed);
        const currentSpeed = v0 - g * elapsed;
        setBallSpeed(currentSpeed);
        const currentH = v0 * elapsed - 0.5 * g * elapsed * elapsed;
        setBallHeight(Math.max(currentH, 0));
      } else {
        clearInterval(interval);
        setLaunchTime(totalTime);
        setBallHeight(0);
        setBallSpeed(-v0);
        setIsLaunching(false);
        
        if (onComplete) {
          onComplete(15, `vertical_launch_${gravityType}_${v0}`);
        }
      }
    }, 25);
  };

  const removeAttempt = (id: number) => {
    setAttempts(prev => prev.filter(att => att.id !== id));
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-6 text-right w-full" dir="rtl">
      {/* رأس المختبر وأيقونته */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-550 to-indigo-750 text-white rounded-2xl shadow-sm">
            <Beaker size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-xs">🧪 مختبر السقوط الحر والحركة الرأسية المتطور</h4>
            <p className="text-[10px] text-slate-500 font-medium">تجربة عملية في غزارة السقوط بالتفريغ وجاذبيات العوالم الفضائية المتعاقبة.</p>
          </div>
        </div>
        <div className="flex border border-slate-150 p-1 bg-slate-50 rounded-xl gap-1 w-full sm:w-auto">
          <button
            onClick={() => setCurrentTab('freefall')}
            className={`flex-1 sm:flex-none py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
              currentTab === 'freefall' ? 'bg-indigo-650 text-white shadow' : 'text-slate-650 hover:bg-slate-200/50'
            }`}
          >
            🪶 السقوط الحر بالفراغ
          </button>
          <button
            onClick={() => setCurrentTab('vertical')}
            className={`flex-1 sm:flex-none py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
              currentTab === 'vertical' ? 'bg-indigo-650 text-white shadow' : 'text-slate-650 hover:bg-slate-200/50'
            }`}
          >
            🏀 القذف الرأسي لأعلى
          </button>
        </div>
      </div>

      {/* التبويب الأول: السقوط الحر (الحجر والريشة) */}
      {currentTab === 'freefall' && (
        <div className="space-y-6">
          <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl space-y-2">
            <h5 className="font-extrabold text-indigo-950 text-xs flex items-center gap-1.5">
              <Sparkles size={14} className="text-indigo-600" />
              <span>المحاكاة الأولى: تجربة جاليليو جاليلي في السقوط المقارن</span>
            </h5>
            <p className="text-[10px] text-indigo-850 leading-relaxed font-semibold">
              اختر ارتفاع السقوط الحر وشاهد الفرق الرهيب بين سرعة الحجر والريشة عند السقوط في الهواء العادي مقابل السقوط في الغرفة المفرغة من الهواء تماماً (محاكاة مثالية).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* اللوحة التحكمية اليسرى */}
            <div className="lg:col-span-4 space-y-4">
              {/* شريط الارتفاع */}
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">الارتفاع المبدئي (متر):</span>
                  <span className="text-xs font-black font-mono text-indigo-750 bg-indigo-50 px-2.5 py-0.5 rounded-md">{height} م</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={height}
                  disabled={isFalling}
                  onChange={(e) => setHeight(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer disabled:opacity-50"
                />
                <div className="flex justify-between text-[8px] text-slate-400 font-bold">
                  <span>10م</span>
                  <span>50م</span>
                  <span>100م</span>
                </div>
              </div>

              {/* وسط السقوط */}
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-800 block">وسط التجربة:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setMedium('vacuum')}
                    disabled={isFalling}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      medium === 'vacuum'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    🌌 فراغ تام (مثالي)
                  </button>
                  <button
                    onClick={() => setMedium('air')}
                    disabled={isFalling}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      medium === 'air'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    💨 مقاومة الهواء
                  </button>
                </div>
              </div>

              {/* زر التشغيل والعداد الفوري */}
              <button
                onClick={startFall}
                disabled={isFalling}
                className={`w-full py-3 text-xs font-black text-white rounded-xl shadow transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 ${
                  isFalling ? 'bg-indigo-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-indigo-850 hover:from-indigo-500 hover:to-indigo-750'
                }`}
              >
                {isFalling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>يجري رصد السقوط الحر...</span>
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    <span>ابدأ محاكاة السقوط الحر فجأة 🚀</span>
                  </>
                )}
              </button>

              {/* بطاقات البيانات الديناميكية */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-2xl text-center space-y-1">
                  <span className="text-[9px] font-bold text-slate-550 block">زمن سقوط الحجر:</span>
                  <strong className="text-lg font-black font-mono text-indigo-900">{stoneTime.toFixed(2)} ث</strong>
                </div>
                <div className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-2xl text-center space-y-1">
                  <span className="text-[9px] font-bold text-slate-550 block">سرعة ارتطام الحجر:</span>
                  <strong className="text-lg font-black font-mono text-indigo-900">{stoneSpeed.toFixed(1)} م/ث</strong>
                </div>
                <div className="p-3 bg-teal-50/40 border border-teal-100 rounded-2xl text-center space-y-1">
                  <span className="text-[9px] font-bold text-slate-550 block">زمن سقوط الريشة:</span>
                  <strong className="text-lg font-black font-mono text-teal-900">{featherTime.toFixed(2)} ث</strong>
                </div>
                <div className="p-3 bg-teal-50/40 border border-teal-100 rounded-2xl text-center space-y-1">
                  <span className="text-[9px] font-bold text-slate-550 block">سرعة ارتطام الريشة:</span>
                  <strong className="text-lg font-black font-mono text-teal-900">{featherSpeed.toFixed(1)} م/ث</strong>
                </div>
              </div>
            </div>

            {/* اللوحة البصرية للتجريب */}
            <div className="lg:col-span-8 bg-slate-900 text-white rounded-2xl p-5 border border-slate-950 relative overflow-hidden h-96 flex flex-col justify-between">
              {/* خلفية جمالية مفرغة أو سماء حسب الوسط */}
              <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-indigo-950/20 to-transparent pointer-events-none"></div>
              {medium === 'vacuum' && (
                <div className="absolute top-3 right-3 bg-indigo-900/60 text-indigo-300 border border-indigo-850 px-2 py-0.5 rounded-full text-[8px] font-bold animate-pulse">
                  🌌 محاكاة التفريغ الهوائي المثالي
                </div>
              )}

              {/* خطوط الارتفاع المنهجية */}
              <div className="absolute left-6 top-8 bottom-8 border-r border-dashed border-slate-700 flex flex-col justify-between text-[8px] text-slate-500 font-mono">
                <span>{height}م</span>
                <span>{(height / 2).toFixed(0)}م</span>
                <span>0م (الأرض)</span>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-4 relative py-4">
                {/* عمود الحجر */}
                <div className="flex flex-col items-center justify-start h-full relative">
                  <span className="text-[9px] text-slate-450 font-bold mb-1.5 mt-2">عمود الحجر 🪨</span>
                  <div className="w-1 bg-slate-800 h-full absolute top-12 bottom-0 pointer-events-none opacity-50"></div>
                  
                  {/* الصخرة الساقطة */}
                  <div 
                    style={{ transform: `translateY(${stonePos * 2.3}px)` }}
                    className="absolute w-8 h-8 bg-slate-700 border-2 border-slate-500 rounded-full flex items-center justify-center text-sm shadow-xl transition-all duration-75"
                  >
                    🪨
                  </div>
                </div>

                {/* عمود الريشة */}
                <div className="flex flex-col items-center justify-start h-full relative">
                  <span className="text-[9px] text-slate-450 font-bold mb-1.5 mt-2">عمود الريشة 🪶</span>
                  <div className="w-1 bg-slate-800 h-full absolute top-12 bottom-0 pointer-events-none opacity-50"></div>

                  {/* الريشة الساقطة */}
                  <div 
                    style={{ transform: `translateY(${featherPos * 2.3}px)` }}
                    className="absolute w-8 h-8 bg-teal-800 border-2 border-teal-500 rounded-full flex items-center justify-center text-sm shadow-xl transition-all duration-75"
                  >
                    🪶
                  </div>
                </div>
              </div>

              {/* الأرض العيارية */}
              <div className="h-4 bg-gradient-to-r from-slate-950 to-slate-850 border-t-2 border-slate-700 rounded-xl relative">
                <div className="absolute inset-0 flex items-center justify-center gap-1.5 text-[8px] text-slate-400 font-black">
                  <span>سطح المختبر المعياري</span>
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>
          </div>

          {/* جدول المحاولات الأربعة للتثبت المعملي */}
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-150">
              <h5 className="font-extrabold text-slate-800 text-xs">📊 جدول رصد المحاولات المخبرية للتثبت:</h5>
              <span className="text-[10px] text-indigo-750 font-extrabold bg-indigo-550/10 px-3 py-1 rounded-full">
                {attempts.length >= 4 ? '🎉 تم استحقاق الـ 25 XP والمكالمة مخبرياً بنجاح!' : `أكمل ${4 - attempts.length} محاولات مختلفة لربح (25 XP)`}
              </span>
            </div>

            <div className="overflow-x-auto select-none rounded-xl border border-slate-150">
              <table className="w-full text-xs text-right text-slate-650 min-w-[500px]">
                <thead className="bg-slate-100 text-[10px] text-slate-750 font-bold uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-3 border-l border-slate-200">المحاولة</th>
                    <th scope="col" className="px-4 py-3">ارتفاع السقوط</th>
                    <th scope="col" className="px-4 py-3">وسط التفريغ المعياري</th>
                    <th scope="col" className="px-4 py-3">زمن الحجر (ث)</th>
                    <th scope="col" className="px-4 py-3">زمن الريشة (ث)</th>
                    <th scope="col" className="px-4 py-3">سرعة ارتطام الحجر (م/ث)</th>
                    <th scope="col" className="px-4 py-3 text-center">التحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {attempts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-slate-400 italic font-bold">
                        لم يتم رصد أي محاولات بعد. اضبط الارتفاع واضغط على "ابدأ محاكاة السقوط الحر فجأة" لتسجيل رصدك.
                      </td>
                    </tr>
                  ) : (
                    attempts.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50 font-medium">
                        <td className="px-4 py-3 font-bold text-slate-800 border-l border-slate-200">محاولة #{att.id}</td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{att.height} م</td>
                        <td className="px-4 py-3 font-extrabold">{att.medium}</td>
                        <td className="px-4 py-3 font-mono text-indigo-700 font-bold">{att.stoneTime} ث</td>
                        <td className="px-4 py-3 font-mono text-teal-700 font-bold">{att.featherTime} ث</td>
                        <td className="px-4 py-3 font-mono font-bold">{att.stoneSpeed} م/ث</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeAttempt(att.id)}
                            className="text-rose-600 hover:text-rose-800 font-extrabold text-[10px] bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded cursor-pointer"
                          >
                            حذف الرصد 🗑️
                          </button>
                         </td>
                       </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* التبويب الثاني: القذف الرأسي (كرة السلة) */}
      {currentTab === 'vertical' && (
        <div className="space-y-6">
          <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl space-y-2">
            <h5 className="font-extrabold text-emerald-950 text-xs flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-600" />
              <span>المحاكاة الثانية: قذف الأجسام رأسياً لأعلى وبلوغ أوج الصعود</span>
            </h5>
            <p className="text-[10px] text-emerald-850 leading-relaxed font-semibold">
              قم بقذف كرة السلة رأسيّاً مع تحديد السرعة الابتدائية واستكشف مدى فاعلية وتأثير عجلة الجاذبية في كواكب وعوالم فضائية متباينة لرصد أقصى ارتفاع وزمن صعود.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* اللوحة التحكمية لليسار */}
            <div className="lg:col-span-4 space-y-4">
              {/* اختيار الكوكب والجاذبية */}
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-800 block">مجال الجاذبية الفضائي:</span>
                <select
                  disabled={isLaunching}
                  value={gravityType}
                  onChange={(e) => setGravityType(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:ring-1 focus:ring-indigo-500 text-slate-850 outline-none"
                >
                  <option value="earth">🌍 الأرض (د = 9.8 م/ث²)</option>
                  <option value="mars">🔴 المريخ (د = 3.7 م/ث²)</option>
                  <option value="moon">🌑 القمر (د = 1.62 م/ث²)</option>
                </select>
              </div>

              {/* السرعة الابتدائية */}
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">السرعة الابتدائية (ع₀):</span>
                  <span className="text-xs font-black font-mono text-emerald-750 bg-emerald-50 px-2.5 py-0.5 rounded-md">{v0} م/ث</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={v0}
                  disabled={isLaunching}
                  onChange={(e) => setV0(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer disabled:opacity-50"
                />
                <div className="flex justify-between text-[8px] text-slate-400 font-bold">
                  <span>5 م/ث</span>
                  <span>15 م/ث</span>
                  <span>30 م/ث</span>
                </div>
              </div>

              {/* تشغيل القذف */}
              <button
                onClick={startLaunch}
                disabled={isLaunching}
                className={`w-full py-3 text-xs font-black text-white rounded-xl shadow transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 ${
                  isLaunching ? 'bg-emerald-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-650'
                }`}
              >
                {isLaunching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>عملية رصد المسار جارية...</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight size={14} />
                    <span>اقذف كرة السلة لأعلى رأسياً 🏀</span>
                  </>
                )}
              </button>

              {/* بطاقة التوقعات المنهجية */}
              <div className="p-4 bg-indigo-50 border border-indigo-150 rounded-2xl space-y-2.5">
                <span className="text-xs font-black text-slate-800 block">📊 التنبؤات والقياسات الحقيقية لأقصى أوج:</span>
                <div className="space-y-1.5 text-xs text-slate-700 font-bold leading-relaxed">
                  <div className="flex justify-between items-center bg-white p-2 rounded-lg">
                    <span>زمن الصعود لأقصى ارتفاع:</span>
                    <span className="text-indigo-800 font-extrabold">{isLaunching ? timeToPeak : (v0 / gravityValues[gravityType]).toFixed(2)} ثانية</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded-lg">
                    <span>أقصى ارتفاع يصله (أوج):</span>
                    <span className="text-indigo-800 font-extrabold">{(v0 * v0 / (2 * gravityValues[gravityType])).toFixed(1)} متر</span>
                  </div>
                </div>
              </div>
            </div>

            {/* اللوح البصري للقذف الرأسي */}
            <div className="lg:col-span-8 bg-slate-900 text-white rounded-2xl p-5 border border-slate-950 relative overflow-hidden h-96 flex flex-col justify-between">
              {/* وسم الكوكب النشط ورسمته المائية */}
              <div className="absolute top-3 left-3 bg-indigo-950/70 border border-indigo-850 px-3 py-1 rounded-full text-[9px] font-black animate-pulse">
                👽 المختبر الفضائي: {gravityLabels[gravityType]}
              </div>

              {/* العدادات الفورية الهابطة */}
              <div className="absolute left-4 top-14 flex flex-col gap-2 font-mono text-[9px] bg-slate-950/50 p-3 rounded-xl border border-slate-800 z-10 w-44">
                <div className="flex justify-between text-slate-400">
                  <span>الزمن الجاري:</span>
                  <span className="text-white font-bold">{launchTime.toFixed(2)} ث</span>
                </div>
                <div className="flex justify-between text-slate-400 border-t border-slate-800/80 pt-1.5">
                  <span className="flex items-center gap-1">السرعة اللحظية:</span>
                  <span className={`font-bold ${ballSpeed >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {ballSpeed.toFixed(1)} م/ث
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 border-t border-slate-800/80 pt-1.5">
                  <span>الارتفاع الراهن:</span>
                  <span className="text-teal-400 font-bold">{ballHeight.toFixed(1)} م</span>
                </div>
              </div>

              {/* علامة أقصى ارتفاع نظري */}
              {isLaunching && (
                <div 
                  style={{ bottom: `${Math.min((maxHeightReached / (v0 * v0 / (2 * 1.62))) * 100, 80) + 12}%` }}
                  className="absolute right-12 border-b border-rose-500 border-dashed w-3/4 flex justify-end text-[8px] text-rose-500 font-black"
                >
                  ◄ أوج الارتفاع المتوقع: {maxHeightReached}م
                </div>
              )}

              {/* عمود صعود الكرة الفعلي وبصرياته */}
              <div className="flex-1 w-full flex items-end justify-center relative pb-2 select-none">
                <div className="w-1 bg-gradient-to-t from-slate-800 via-slate-700 to-transparent h-full absolute bottom-4 pointer-events-none opacity-40"></div>
                
                {/* شبكة ومقعد السلة الجمالي */}
                <div className="absolute top-1/3 text-4xl opacity-15 select-none pointer-events-none">🕸️</div>

                {/* كرة السلة التفاعلية */}
                <div 
                  style={{ 
                    transform: `translateY(${-Math.min((ballHeight / (v0 * v0 / (2 * 1.62))) * 280, 280)}px)` 
                  }}
                  className="w-10 h-10 bg-orange-600 rounded-full border-2 border-orange-400 shadow-2xl flex items-center justify-center text-xl transition-all duration-75 relative"
                >
                  🏀
                  {/* سهم اتجاه السرعة التفاعلي */}
                  {isLaunching && (
                    <div className={`absolute -top-6 text-[10px] font-black ${ballSpeed >= 0 ? 'text-emerald-400' : 'text-rose-400 animate-bounce'}`}>
                      {ballSpeed >= 0 ? '▲' : '▼'}
                    </div>
                  )}
                </div>
              </div>

              {/* أرض الملعب المعيارية */}
              <div className="h-4 bg-gradient-to-r from-amber-950 to-orange-950 border-t-2 border-orange-600 rounded-xl relative">
                <div className="absolute inset-0 flex items-center justify-center text-[8px] text-orange-200 font-black">
                  مستوى الإطلاق الرأسي المنهجي
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 8. مختبر قوانين نيوتن والجاذبية الكونية (الدرس الثاني عشر)
// ==========================================
export function NewtonLawsLab({ onComplete }: LabProps) {
  const [currentTab, setCurrentTab] = useState<'cart' | 'cannon' | 'massweight'>('cart');

  // 1. مختبر العربة والسطل (نيوتن الثاني)
  const [force, setForce] = useState<number>(5); // 1 to 20 Newtons
  const [hiddenMass, setHiddenMass] = useState<number>(2.5); // عشوائي لحساب الطالب
  const [isSimulatingCart, setIsSimulatingCart] = useState<boolean>(false);
  const [cartX, setCartX] = useState<number>(0); // 0% to 100%
  const [bucketY, setBucketY] = useState<number>(0); // 0% to 100%
  const [cartAcceleration, setCartAcceleration] = useState<number>(0);
  const [cartTime, setCartTime] = useState<number>(0);
  const [cartAttempts, setCartAttempts] = useState<{
    id: number;
    force: number;
    acceleration: number;
    time: number;
    hint: string;
  }[]>([]);

  // 2. مختبر ارتداد المدفع (نيوتن الثالث)
  const [cannonMass, setCannonMass] = useState<number>(120); // 50 to 250 kg
  const [bulletMass, setBulletMass] = useState<number>(2); // 0.5 to 5 kg
  const [isFiring, setIsFiring] = useState<boolean>(false);
  const [cannonRecoilX, setCannonRecoilX] = useState<number>(0); // displacement left
  const [bulletX, setBulletX] = useState<number>(0); // displacement right
  const [recoilVelocity, setRecoilVelocity] = useState<number>(0);
  const [bulletVelocity, setBulletVelocity] = useState<number>(0);

  // 3. مختبر الكتلة والوزن (الجاذبية الكونية)
  const [selectedMass, setSelectedMass] = useState<number>(35); // 1 to 100 kg
  const [selectedPlanet, setSelectedPlanet] = useState<'earth' | 'moon' | 'mars' | 'jupiter'>('earth');

  const planetData = {
    earth: { name: 'الأرض', g: 9.8, emoji: '🌍', bg: 'from-blue-600 to-emerald-600' },
    moon: { name: 'القمر', g: 1.62, emoji: '🌑', bg: 'from-slate-500 to-slate-700' },
    mars: { name: 'المريخ', g: 3.7, emoji: '🔴', bg: 'from-red-600 to-amber-700' },
    jupiter: { name: 'المشتري', g: 24.8, emoji: '🪐', bg: 'from-amber-600 to-orange-850' }
  };

  // توليد كتلة عشوائية مخفية للعربة عند التحميل
  useEffect(() => {
    generateNewHiddenMass();
  }, []);

  const generateNewHiddenMass = () => {
    const randomM = parseFloat((Math.random() * 3 + 1.5).toFixed(2)); // 1.5 to 4.5 kg
    setHiddenMass(randomM);
    setCartX(0);
    setBucketY(0);
    setCartAcceleration(0);
    setCartTime(0);
  };

  const startCartSimulation = () => {
    if (isSimulatingCart) return;
    setIsSimulatingCart(true);
    setCartX(0);
    setBucketY(0);
    setCartTime(0);

    // التسارع طبقاً لقانون نيوتن الثاني: جـ = ق / ك
    const acceleration = force / hiddenMass;
    setCartAcceleration(parseFloat(acceleration.toFixed(2)));

    const distance = 1.0; // 1 meter track
    const totalSimTime = Math.sqrt((2 * distance) / acceleration); // t = sqrt(2d/a)

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;

      if (elapsed <= totalSimTime) {
        setCartTime(elapsed);
        const currentD = 0.5 * acceleration * elapsed * elapsed;
        const progressPercent = Math.min((currentD / distance) * 100, 100);
        setCartX(progressPercent);
        setBucketY(progressPercent);
      } else {
        clearInterval(interval);
        setCartTime(totalSimTime);
        setCartX(100);
        setBucketY(100);
        setIsSimulatingCart(false);

        // إضافة الرصد للجدول
        setCartAttempts(prev => {
          const newAttempts = [
            ...prev,
            {
              id: prev.length + 1,
              force: force,
              acceleration: parseFloat(acceleration.toFixed(2)),
              time: parseFloat(totalSimTime.toFixed(2)),
              hint: `قسمة القوة (${force}N) على العجلة (${acceleration.toFixed(2)} م/ث²) تعطى كتلة العربة = ${hiddenMass} كجم.`
            }
          ];
          if (newAttempts.length >= 4 && onComplete) {
            onComplete(25, 'newton_cart_four_attempts');
          }
          return newAttempts;
        });
      }
    }, 25);
  };

  const fireCannon = () => {
    if (isFiring) return;
    setIsFiring(true);
    setCannonRecoilX(0);
    setBulletX(0);

    // دفع القذيفة بقوة انفجارية ثابتة (فلو إفترضنا ق = 450N تؤثر لزمن تلامس 0.1 ث)
    const explosionForce = 600; // Newtons
    const actVel = explosionForce / bulletMass * 0.1; // v = a * t = (F/m) * t
    const recVel = explosionForce / cannonMass * 0.1; // v_recoil = (F/M) * t

    setBulletVelocity(parseFloat(actVel.toFixed(1)));
    setRecoilVelocity(parseFloat(recVel.toFixed(2)));

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;

      if (elapsed <= 1.2) {
        // حركة المقذوف للأمام بسرعة ثابتة
        const bulletDisp = actVel * elapsed * 25; // معامل تكبير الحجم لرؤية المسار
        setBulletX(Math.min(bulletDisp, 350));

        // حركة ارتداد المدفع للخلف
        const recoilDisp = recVel * elapsed * 20;
        setCannonRecoilX(Math.min(recoilDisp, 60));
      } else {
        clearInterval(interval);
        setIsFiring(false);
        if (onComplete) {
          onComplete(15, `newton_third_fire_mC${cannonMass}_mB${bulletMass}`);
        }
      }
    }, 30);
  };

  const currentPlanetInfo = planetData[selectedPlanet];
  const calculatedWeight = parseFloat((selectedMass * currentPlanetInfo.g).toFixed(2));

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-6 text-right w-full" dir="rtl">
      {/* هيدر المختبر */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-550 to-indigo-750 text-white rounded-2xl shadow-sm">
            <Scale size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-xs">🧪 مختبر قوانين نيوتن والجاذبية الكونية المتطور</h4>
            <p className="text-[10px] text-slate-500 font-medium font-semibold">استكشف العلاقة الحركية بين القوى والتجربيات الميكانيكية المتقنة لنيوتن وجاليليو.</p>
          </div>
        </div>
        <div className="flex border border-slate-150 p-1 bg-slate-50 rounded-xl gap-1 w-full sm:w-auto">
          <button
            onClick={() => setCurrentTab('cart')}
            className={`flex-1 sm:flex-none py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'cart' ? 'bg-indigo-650 text-white shadow' : 'text-slate-650 hover:bg-slate-200/50'
            }`}
          >
            🛒 العربة والسطل (نيوتن الثاني)
          </button>
          <button
            onClick={() => setCurrentTab('cannon')}
            className={`flex-1 sm:flex-none py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'cannon' ? 'bg-indigo-650 text-white shadow' : 'text-slate-650 hover:bg-slate-200/50'
            }`}
          >
            💣 ارتداد المدفع (نيوتن الثالث)
          </button>
          <button
            onClick={() => setCurrentTab('massweight')}
            className={`flex-1 sm:flex-none py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'massweight' ? 'bg-indigo-650 text-white shadow' : 'text-slate-650 hover:bg-slate-200/50'
            }`}
          >
            🌌 الكتلة والوزن (الجاذبية)
          </button>
        </div>
      </div>

      {/* التبويب الأول: العربة والسطل (نيوتن الثاني) */}
      {currentTab === 'cart' && (
        <div className="space-y-6">
          <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl space-y-2">
            <h5 className="font-extrabold text-indigo-950 text-xs flex items-center gap-1.5">
              <Sparkles size={14} className="text-indigo-600" />
              <span>تجربة التحقيق من قانون نيوتن الثاني ورصد الكتلة المجهولة</span>
            </h5>
            <p className="text-[10px] text-indigo-850 leading-relaxed font-semibold">
              يقوم السطل المعلق بسحب العربة على مسار بطول 1 متر كامل. كتلة العربة <b>مخفية مجهولة</b> وعليك الكشف عنها وحسابها رياضياً عبر رصد قيمة العجلة والتسارع الناتج مع كل قوة محصلة تختارها!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* القوة والتحكم */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">قوة السحب المؤثرة (نيوتن):</span>
                  <span className="text-xs font-black font-mono text-indigo-755 bg-indigo-50 px-2.5 py-0.5 rounded-md">{force} N</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="0.5"
                  value={force}
                  disabled={isSimulatingCart}
                  onChange={(e) => setForce(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer disabled:opacity-50"
                />
                <div className="flex justify-between text-[8px] text-slate-400 font-bold">
                  <span>2 نيوتن</span>
                  <span>11 نيوتن</span>
                  <span>20 نيوتن</span>
                </div>
              </div>

              {/* تحذير وتجديد الكتلة */}
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                <span className="text-[9px] text-amber-900 font-bold">هل ترغب بتغيير كتلة العربة فجأة؟</span>
                <button
                  type="button"
                  disabled={isSimulatingCart}
                  onClick={generateNewHiddenMass}
                  className="px-2.5 py-1 text-[9px] font-extrabold bg-amber-600 text-white rounded cursor-pointer hover:bg-amber-700 disabled:opacity-50"
                >
                  توليد كتلة جديدة 🎲
                </button>
              </div>

              {/* زر بدء السحب */}
              <button
                onClick={startCartSimulation}
                disabled={isSimulatingCart}
                className={`w-full py-3 text-xs font-black text-white rounded-xl shadow transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 ${
                  isSimulatingCart ? 'bg-indigo-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-indigo-850 hover:from-indigo-500 hover:to-indigo-750'
                }`}
              >
                {isSimulatingCart ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>العربة تسير تحت وطأة القوة...</span>
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    <span>ابدأ رصد الحركة والسحب المعياري ▶️</span>
                  </>
                )}
              </button>

              {/* عدادات السرعة والتسارع الفورية */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-2xl text-center space-y-1">
                  <span className="text-[9px] font-bold text-slate-550 block">العجلة المكتسبة (جـ):</span>
                  <strong className="text-base font-black font-mono text-indigo-900">{cartAcceleration.toFixed(2)} م/ث²</strong>
                </div>
                <div className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-2xl text-center space-y-1">
                  <span className="text-[9px] font-bold text-slate-550 block">زمن قطع المسار (ز):</span>
                  <strong className="text-base font-black font-mono text-indigo-900">{cartTime.toFixed(2)} ثانية</strong>
                </div>
              </div>
            </div>

            {/* عمود الرسم المتحرك للعربة والسطل المعلق */}
            <div className="lg:col-span-8 bg-slate-900 text-white rounded-2xl p-5 border border-slate-950 relative overflow-hidden h-72 flex flex-col justify-between select-none">
              <div className="absolute top-2.5 right-2.5 bg-slate-950/60 text-slate-400 px-3 py-1 rounded-full text-[8px] font-bold">
                ⚠️ احسب الكتلة: ك = ق / جـ
              </div>

              {/* منضدة المختبر */}
              <div className="flex-1 w-full relative pt-12">
                {/* طاولة مستوية */}
                <div className="w-full h-2.5 bg-slate-750 absolute top-24 left-0 rounded"></div>
                {/* بكرة في الطرف الأيسر */}
                <div className="w-5 h-5 rounded-full bg-indigo-500 border border-indigo-300 absolute top-21.5 left-20 flex items-center justify-center text-[8px] animate-spin font-black text-white">⚙️</div>

                {/* العربة الحركية */}
                <div 
                  style={{ left: `calc(100px + ${cartX * 0.7}%)` }}
                  className="absolute top-12 w-16 h-11 bg-indigo-600 rounded-lg border-2 border-indigo-400 shadow-xl flex flex-col items-center justify-center transition-all duration-75 text-[10px] font-black"
                >
                  <span className="text-xs text-white">🛒 العربة</span>
                  <span className="text-[8px] text-indigo-200">الكتلة: ؟ كجم</span>
                </div>

                {/* الحبل المتصل */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {/* خط حبل من العربة للبكرة */}
                  <line 
                    x1={`calc(100px + ${cartX * 0.7}% + 8px)`} 
                    y1="67" 
                    x2="110" 
                    y2="97" 
                    stroke="#fff" 
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                  />
                  {/* خط حبل هابط من البكرة للسطل */}
                  <line 
                    x1="110" 
                    y1="97" 
                    x2="110" 
                    y2={`calc(100px + ${bucketY * 1.1}px)`} 
                    stroke="#fff" 
                    strokeWidth="1.5"
                  />
                </svg>

                {/* السطل المعلق */}
                <div 
                  style={{ top: `calc(100px + ${bucketY * 1.1}px)`, left: '100px' }}
                  className="absolute w-6 h-8 bg-amber-500 border-2 border-amber-400 rounded-b-md flex items-center justify-center text-xs shadow-xl transition-all duration-75"
                >
                  🪣
                </div>
              </div>

              <div className="h-4 bg-slate-950 text-slate-400 text-[8px] flex items-center justify-center rounded">
                منضدة نيوتن اللزجة المعمارية بطول 1.0 متر كامل
              </div>
            </div>
          </div>

          {/* محاولات الطالب لحساب كتلة العربة */}
          <div className="space-y-3">
            <h5 className="font-extrabold text-slate-800 text-xs text-slate-800">📊 جدول محاولات العربة المرصودة:</h5>
            <div className="overflow-x-auto rounded-xl border border-slate-150">
              <table className="w-full text-xs text-right text-slate-650 min-w-[500px]">
                <thead className="bg-slate-550/5 text-slate-755 font-bold uppercase">
                  <tr>
                    <th className="px-4 py-2 border-l border-slate-200"># المحاولة</th>
                    <th className="px-4 py-2">قوة السحب (ق)</th>
                    <th className="px-4 py-2">العجلة المكتشفة (جـ)</th>
                    <th className="px-4 py-2">زمن المسار الحركي</th>
                    <th className="px-4 py-2">دليل الإرشاد والتحقيق من الكتلة (ك)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {cartAttempts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-400 italic font-bold">
                        ابدأ بتسيير العربة لتسجيل أول حركة ورصد النتائج في الجدول فوراً.
                      </td>
                    </tr>
                  ) : (
                    cartAttempts.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50 font-semibold text-slate-850">
                        <td className="px-4 py-2 border-l border-slate-205">رصد {att.id}#</td>
                        <td className="px-4 py-2 font-mono text-indigo-700 font-black">{att.force} نيوتن</td>
                        <td className="px-4 py-2 font-mono text-teal-700 font-black">{att.acceleration} م/ث²</td>
                        <td className="px-4 py-2 font-mono">{att.time} ثانية</td>
                        <td className="px-4 py-2 text-indigo-900 bg-indigo-50/20 text-[10px]">{att.hint}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* التبويب الثاني: بمباردة ارتداد المدفع (نيوتن الثالث) */}
      {currentTab === 'cannon' && (
        <div className="space-y-6">
          <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl space-y-2">
            <h5 className="font-extrabold text-emerald-950 text-xs flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-650" />
              <span>المحاكاة الثانية: قانون نيوتن الثالث (الفعل ورد الفعل)</span>
            </h5>
            <p className="text-[10px] text-emerald-850 leading-relaxed font-semibold">
              اضبط كتلة المدفع وكتلة القذيفة من شريط التمرير وشاهد كيف تؤثر قوة الانفجار الداخلية على كلاهما فترتد كتلة المدفع الثقيلة للوراء ببطء (رد الفعل) وتنطلق القذيفة الخفيفة للأمام بسرعة خاطفة تامة (الفعل).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4 space-y-4">
              {/* كتلة المدفع */}
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">كتلة المدفع (كـ_مدفع):</span>
                  <span className="text-xs font-black font-mono text-emerald-755 bg-emerald-50 px-2.5 py-0.5 rounded-md">{cannonMass} كجم</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="255"
                  step="5"
                  value={cannonMass}
                  disabled={isFiring}
                  onChange={(e) => setCannonMass(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer disabled:opacity-50"
                />
              </div>

              {/* كتلة القذيفة */}
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">كتلة القذيفة (كـ_مقذوف):</span>
                  <span className="text-xs font-black font-mono text-emerald-755 bg-emerald-50 px-2.5 py-0.5 rounded-md">{bulletMass} كجم</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={bulletMass}
                  disabled={isFiring}
                  onChange={(e) => setBulletMass(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer disabled:opacity-50"
                />
              </div>

              {/* زر الإطلاق الأسطوري */}
              <button
                onClick={fireCannon}
                disabled={isFiring}
                className={`w-full py-3 text-xs font-black text-white rounded-xl shadow transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 ${
                  isFiring ? 'bg-emerald-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-650'
                }`}
              >
                {isFiring ? (
                  <span>💥 لحظة الإنفجار وارتداد الفعل...</span>
                ) : (
                  <>
                    <Flame size={14} className="animate-pulse" />
                    <span>فجّر المقذوف واكشف رد الفعل 💥</span>
                  </>
                )}
              </button>

              {/* سرعات الارتداد */}
              {recoilVelocity > 0 && (
                <div className="p-4 bg-rose-50 border border-rose-150 rounded-xl space-y-2 text-xs">
                  <span className="font-extrabold text-rose-950 block">📊 نتائج رد الفعل وميكانيكا السرعات:</span>
                  <div className="text-[10px] text-slate-700 font-semibold space-y-1">
                    <p>• سرعة انطلاق القذيفة للأمام: <strong className="text-emerald-700 font-mono font-black">{bulletVelocity} م/ث</strong></p>
                    <p>• سرعة ارتداد المدفع للخلف: <strong className="text-rose-700 font-mono font-black">{recoilVelocity} م/ث</strong></p>
                    <p className="text-[9px] text-slate-500 mt-2 bg-white/60 p-1.5 rounded-lg">قانون حفظ الزخم (كمية التحرك): ك₁ ع₁ = ك₂ ع₂ ويجعل السرعات متشاكسة.</p>
                  </div>
                </div>
              )}
            </div>

            {/* اللوح البصري للمدفع */}
            <div className="lg:col-span-8 bg-slate-950 rounded-2xl p-5 relative overflow-hidden h-72 flex flex-col justify-end border border-slate-900">
              {/* متجهات القوة للفعل ورد الفعل */}
              {isFiring && (
                <>
                  <div className="absolute top-1/3 left-1/3 text-emerald-400 flex flex-col items-center">
                    <span className="text-[9px] font-black bg-emerald-950/85 px-2 py-0.5 rounded">قوة الفعل للأمام ➔</span>
                  </div>
                  <div className="absolute top-1/3 right-1/3 text-rose-400 flex flex-col items-center">
                    <span className="text-[9px] font-black bg-rose-955/85 px-2 py-0.5 rounded">← قوة رد الفعل للخلف</span>
                  </div>
                </>
              )}

              {/* الطاولة أو المسند */}
              <div className="w-full relative h-24 flex items-end">
                {/* المقذوف الطائر */}
                <div 
                  style={{ transform: `translateX(${bulletX}px)` }}
                  className="absolute bottom-5 left-1/2 w-4 h-4 rounded-full bg-red-500 border border-amber-400 shadow-md flex items-center justify-center text-[8px] transition-all duration-75"
                >
                  💣
                </div>

                {/* المدفع التفاعلي */}
                <div 
                  style={{ transform: `translateX(${-cannonRecoilX}px)` }}
                  className="absolute bottom-1 left-28 w-28 h-14 bg-gradient-to-t from-slate-800 to-slate-650 rounded-t-xl border-l-4 border-slate-500 transition-all duration-75 flex items-center justify-center text-xs font-bold text-white shadow"
                >
                  ⚙️ مدفع {cannonMass} كجم
                </div>
              </div>

              {/* عجلات المدفع الزخرفية */}
              <div className="w-full h-2.5 bg-gradient-to-r from-teal-900 to-emerald-900 rounded relative">
                <span className="absolute inset-0 flex items-center justify-center text-[8px] text-emerald-200">المرص المرتحل لنيوتن الثالث</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* التبويب الثالث: تجربة الكتلة والوزن (الجاذبية الكونية) */}
      {currentTab === 'massweight' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 text-white p-4 rounded-2xl space-y-2 border border-indigo-850 shadow-md">
            <h5 className="font-extrabold text-amber-400 text-xs flex items-center gap-1.5">
              <Scale size={14} className="text-amber-400" />
              <span>المحاكاة الثالثة: استكشاف الفارق الدائم بين الكتلة (كجم) والوزن (نيوتن)</span>
            </h5>
            <p className="text-[10px] text-indigo-200 leading-relaxed font-semibold">
              اختر كتلة الجسم من المنزلق، ثم تنقّل بين الأجرام السماوية في المجموعة الشمسية لمشاهدة كيف تبدو الكتلة ثابتة ومستقلة بينما الوزن يجترع التغير طويلاً بتغير تسارع الجاذبية في الكواكب!
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">كتلة الجسم المختارة:</span>
                <span className="text-xs font-black font-mono text-indigo-755 bg-indigo-50 px-2.5 py-0.5 rounded-md">{selectedMass} كجم</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={selectedMass}
                onChange={(e) => setSelectedMass(parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[8px] text-slate-400 font-bold">
                <span>1 كجم</span>
                <span>50 كجم</span>
                <span>100 كجم</span>
              </div>
            </div>

            {/* الكواكب والاجرام السماوية */}
            <h5 className="font-bold text-xs text-slate-800">🪐 اختر موقعك الجغرافي بالكون الجوهري:</h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-right">
              {Object.entries(planetData).map(([key, planet]) => (
                <button
                  key={key}
                  onClick={() => setSelectedPlanet(key as any)}
                  className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                    selectedPlanet === key
                      ? 'bg-gradient-to-r ' + planet.bg + ' text-white shadow-lg scale-95 border-transparent'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="text-3xl block mb-1">{planet.emoji}</span>
                  <strong className="text-xs block">{planet.name}</strong>
                  <span className="text-[9px] font-mono opacity-80 block mt-1">د = {planet.g} م/ث²</span>
                </button>
              ))}
            </div>

            {/* بطاقتي المقارنة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* بطاقة الكتلة */}
              <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl border border-slate-800 text-center space-y-2 shadow-sm relative overflow-hidden">
                <div className="absolute top-1.5 left-2 bg-slate-800 px-2 py-0.5 rounded text-[8px] text-slate-400">كمية قِياسية</div>
                <span className="text-xs font-bold text-slate-400">🧊 كتلة المادة المقاسة</span>
                <strong className="text-3xl font-black font-mono text-amber-400 block">{selectedMass} كجم</strong>
                <p className="text-[9px] text-slate-350 leading-relaxed font-semibold">
                  قيمة ثابتة لا تتغير في أي كوكب بالكون لكونها تعبر عن مقدار ما يحتويه الجسم الحقيقي من ذرات المادة.
                </p>
              </div>

              {/* بطاقة الوزن */}
              <div className="p-5 bg-gradient-to-br from-indigo-950 to-indigo-900 text-white rounded-2xl border border-indigo-850 text-center space-y-2 shadow-sm relative overflow-hidden">
                <div className="absolute top-1.5 left-2 bg-indigo-800 px-2 py-0.5 rounded text-[8px] text-indigo-300">قوة مُتجهة</div>
                <span className="text-xs font-bold text-indigo-300">⚖️ الوزن المحسوب (ق_جذب)</span>
                <strong className="text-3xl font-black font-mono text-emerald-400 block">{calculatedWeight} نيوتن</strong>
                <p className="text-[9px] text-indigo-200 leading-relaxed font-semibold text-right">
                  الوزن = ... <br />
                  <b>التجربة الكونية:</b> يتضاعف وزنك على المشتري بـ 2.5 مرة مقارنة بالأرض بينما تنعدم تماماً في الفضاء!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 9. مختبر قوى الاحتكاك والفيزياء التجريبية (الدرس الثالث عشر)
// ==========================================
export function FrictionLab({ onComplete }: LabProps) {
  const [currentTab, setCurrentTab] = useState<'experiment' | 'calculator'>('experiment');
  const [isIframeFullscreen, setIsIframeFullscreen] = useState(false);

  // بيانات جدول تجربة الاحتكاك
  const [fapp2, setFapp2] = useState<string>('');
  const [ffric2, setFfric2] = useState<string>('');
  const [fnet2, setFnet2] = useState<string>('');
  const [acc2, setAcc2] = useState<string>('');
  const [state2, setState2] = useState<'pending' | 'correct' | 'wrong'>('pending');

  const [fapp3, setFapp3] = useState<string>('');
  const [ffric3, setFfric3] = useState<string>('');
  const [fnet3, setFnet3] = useState<string>('');
  const [acc3, setAcc3] = useState<string>('');
  const [state3, setState3] = useState<'pending' | 'correct' | 'wrong'>('pending');

  const [tableFeedback, setTableFeedback] = useState<string>('');
  const [tableFeedbackType, setTableFeedbackType] = useState<'success' | 'warning' | ''>('');

  // آلة حاسبة الاحتكاك الفورية
  const [calcMass, setCalcMass] = useState<number>(50);
  const [calcFapp, setCalcFapp] = useState<number>(200);
  const [calcMus, setCalcMus] = useState<number>(0.4);
  const [calcMuk, setCalcMuk] = useState<number>(0.3);

  // حساب القيم للآلة الحاسبة بشكل فوري
  const g = 9.8;
  const normalForce = calcMass * g;
  const maxStaticFriction = calcMus * normalForce;
  
  let actualFriction = 0;
  let netForce = 0;
  let acceleration = 0;
  let motionState = 'ساكن';

  if (calcFapp <= maxStaticFriction) {
    actualFriction = calcFapp;
    netForce = 0;
    acceleration = 0;
    motionState = 'ساكن 🛑 (القوة المطبقة لم تتغلب بعد على الاحتكاك السكوني الأقصى)';
  } else {
    actualFriction = calcMuk * normalForce;
    netForce = calcFapp - actualFriction;
    acceleration = netForce / calcMass;
    motionState = 'متحرك 🏃‍♂️ (تم التغلب على الاحتكاك السكوني، والجسم يتسارع حالياً)';
  }

  const checkTable = () => {
    const vFapp2 = parseFloat(fapp2);
    const vFfric2 = parseFloat(ffric2);
    const vFnet2 = parseFloat(fnet2);
    const vAcc2 = parseFloat(acc2);

    const isRow2Correct = 
      !isNaN(vFapp2) && Math.abs(vFapp2 - 200) < 5 &&
      !isNaN(vFfric2) && Math.abs(vFfric2 - 147) < 3 &&
      !isNaN(vFnet2) && Math.abs(vFnet2 - 53) < 4 &&
      !isNaN(vAcc2) && Math.abs(vAcc2 - 1.06) < 0.15;

    setState2(isRow2Correct ? 'correct' : 'wrong');

    const vFapp3 = parseFloat(fapp3);
    const vFfric3 = parseFloat(ffric3);
    const vFnet3 = parseFloat(fnet3);
    const vAcc3 = parseFloat(acc3);

    const isRow3Correct = 
      !isNaN(vFapp3) && Math.abs(vFapp3 - 250) < 5 &&
      !isNaN(vFfric3) && Math.abs(vFfric3 - 147) < 3 &&
      !isNaN(vFnet3) && Math.abs(vFnet3 - 103) < 4 &&
      !isNaN(vAcc3) && Math.abs(vAcc3 - 2.06) < 0.15;

    setState3(isRow3Correct ? 'correct' : 'wrong');

    if (isRow2Correct && isRow3Correct) {
      setTableFeedback('🎉 رائع جداً! جميع البيانات المسجلة بالجدول مطابقة لحسابات الاحتكاك الفيزيائية بنسبة 100%. تم احتساب التقدم بنجاح.');
      setTableFeedbackType('success');
      if (onComplete) {
        onComplete(25, 'friction_phet_experiment');
      }
    } else {
      setTableFeedback('⚠️ تنبيه: بعض القيم المدخلة غير متطابقة علمياً مع نواتج التجربة. يرجى مراجعة الحسابات أو الاستعانة بالآلة الحاسبة في تبويب المحاكاة الفوري.');
      setTableFeedbackType('warning');
    }
  };

  const resetTable = () => {
    setFapp2('');
    setFfric2('');
    setFnet2('');
    setAcc2('');
    setState2('pending');

    setFapp3('');
    setFfric3('');
    setFnet3('');
    setAcc3('');
    setState3('pending');

    setTableFeedback('');
    setTableFeedbackType('');
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-6 text-right w-full" dir="rtl">
      {/* هيدر المختبر */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-550 to-indigo-750 text-white rounded-2xl shadow-sm">
            <Scale size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-xs">🧪 مختبر قوى الاحتكاك والفيزياء التجريبية المتطور</h4>
            <p className="text-[10px] text-slate-500 font-medium font-semibold">استكشف السلوكيات والخصائص الفيزيائية لقوى الاحتكاك السكونية والحركية للأجسام.</p>
          </div>
        </div>
        <div className="flex border border-slate-150 p-1 bg-slate-50 rounded-xl gap-1 w-full sm:w-auto">
          <button
            onClick={() => setCurrentTab('experiment')}
            className={`flex-1 sm:flex-none py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'experiment' ? 'bg-indigo-650 text-white shadow' : 'text-slate-650 hover:bg-slate-200/50'
            }`}
          >
            📊 تجربة PhET وجدول الأرصاد
          </button>
          <button
            onClick={() => setCurrentTab('calculator')}
            className={`flex-1 sm:flex-none py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'calculator' ? 'bg-indigo-650 text-white shadow' : 'text-slate-650 hover:bg-slate-200/50'
            }`}
          >
            🔢 آلة حاسبة الاحتكاك الفورية
          </button>
        </div>
      </div>

      {currentTab === 'experiment' && (
        <div className="space-y-6">
          {/* تأملات إيمانية ودليل العمل */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-2xl space-y-2">
              <h5 className="font-extrabold text-emerald-950 text-xs flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-600" />
                <span>🕌 تأملات إيمانية في سنّة وقوة الاحتكاك</span>
              </h5>
              <p className="text-[10px] text-emerald-850 leading-relaxed font-semibold">
                📖 قال الله تعالى: <b>﴿وَجَعَلْنَا فِي الْأَرْضِ رَوَاسِيَ أَن تَمِيدَ بِهِمْ﴾</b> (الأنبياء: 31). <br />
                لولا نعمة الله تعالى بإيجاد الاحتكاك بين أقدامنا والتراب، وبين إطارات وسائل النقل والطرق، لما تيسر ثبات أو سير في أمن واستقرار. وهي سنّة مادية تماثل تجرع العقبات بالصبر الذي يزيد رسوخ المؤمن وثباته أمام عواصف الفتن!
              </p>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl space-y-1.5">
              <h5 className="font-extrabold text-amber-950 text-xs">📋 دليل استقصاء تجارب الاحتكاك في PhET:</h5>
              <ol className="list-decimal list-inside space-y-1 text-[10px] text-amber-900 font-semibold leading-relaxed">
                <li>افتح محاكاة PhET التفاعلية الموجودة بالأسفل.</li>
                <li>اختر تبويب <b>"الاحتكاك"</b> وفعّل خياري <b>(القيم)</b> و<b>(مخطط القوة الحر)</b>.</li>
                <li>اختر الصندوق المعياري بوزن <b>50 كجم</b> واجعل معامل الاحتكاك متوسطاً.</li>
                <li>طبق قوة تدرجية ببطء ورصّد متى يتغلب جسمك على الاحتكاك الأقصى وباشر تعبئة الجدول.</li>
              </ol>
            </div>
          </div>

          {/* محاكاة PhET مدمجة */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 shadow-sm relative h-[450px]">
            <div className="absolute top-3 left-3 z-10">
              <button
                type="button"
                onClick={() => setIsIframeFullscreen(true)}
                className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-white text-[11px] font-bold py-1.5 px-3.5 rounded-xl shadow-lg border border-slate-700 transition hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Maximize2 size={13} className="text-indigo-400" />
                <span>ملء الشاشة 📺</span>
              </button>
            </div>
            <iframe 
              src="https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html?locale=ar"
              className="w-full h-full border-0"
              title="PhET Friction Simulation"
              allowFullScreen
            ></iframe>
          </div>

          {/* محاكاة بملء الشاشة إذا تم الضغط على زر التكبير */}
          {isIframeFullscreen && (
            <div className="fixed inset-0 bg-slate-950/95 z-[9999] flex flex-col p-4 space-y-3 animate-in fade-in duration-200" dir="rtl">
              {/* شريط التحكم العلوي بوضع ملء الشاشة */}
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3.5 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-650 text-white rounded-xl">
                    <Scale size={16} />
                  </div>
                  <div className="text-right">
                    <h5 className="text-white text-xs font-black font-sans">مختبر PhET لقوى الاحتكاك التفاعلي (ملء الشاشة)</h5>
                    <p className="text-[10px] text-slate-400 font-medium">قم بإجراء التجربة ثم أغلق لتعبئة جدول النتائج بالأسفل</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsIframeFullscreen(false)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl transition hover:scale-105 active:scale-95 shadow cursor-pointer"
                >
                  <Minimize2 size={14} />
                  <span>إغلاق وملء جدول النتائج 🛑</span>
                </button>
              </div>

              {/* محاكاة الفضاء ب ملء الشاشة */}
              <div className="flex-1 rounded-2xl border border-slate-800 overflow-hidden bg-slate-900 relative">
                <iframe 
                  src="https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html?locale=ar"
                  className="w-full h-full border-0"
                  title="PhET Friction Simulation Fullscreen"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          {/* جدول رصد البيانات التفاعلي */}
          <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h5 className="font-extrabold text-slate-800 text-xs">📊 سجل رصد الأرصاد المعملية وقارنها علمياً:</h5>
              <button 
                onClick={resetTable}
                className="px-2.5 py-1 text-[9px] font-extrabold bg-slate-200 text-slate-700 hover:bg-slate-300 rounded cursor-pointer"
              >
                🔄 إعادة تصفير الجدول
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-xs text-right text-slate-650 min-w-[600px]">
                <thead className="bg-slate-100 text-[9px] text-slate-700 font-black">
                  <tr>
                    <th scope="col" className="px-3 py-2 border-l border-slate-200 text-center">التجربة</th>
                    <th scope="col" className="px-3 py-2 text-center">الكتلة (كجم)</th>
                    <th scope="col" className="px-3 py-2 text-center">معامل الاحتكاك (μ_ح)</th>
                    <th scope="col" className="px-3 py-2 text-center">القوة المطبقة (نيوتن)</th>
                    <th scope="col" className="px-3 py-2 text-center">قوة الاحتكاك (نيوتن)</th>
                    <th scope="col" className="px-3 py-2 text-center">القوة المحصلة (نيوتن)</th>
                    <th scope="col" className="px-3 py-2 text-center">العجلة (م/ث²)</th>
                    <th scope="col" className="px-3 py-2 text-center">حالة الحركة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-center font-semibold">
                  <tr className="bg-slate-50/50">
                    <td className="px-3 py-3 font-bold border-l border-slate-200 text-slate-800">1 (مثال مرجعي)</td>
                    <td className="px-3 py-3 font-mono">50 كجم</td>
                    <td className="px-3 py-3 font-mono">0.3</td>
                    <td className="px-3 py-3 font-mono text-slate-500">147 N</td>
                    <td className="px-3 py-3 font-mono text-slate-500">147 N</td>
                    <td className="px-3 py-3 font-mono text-slate-500">0 N</td>
                    <td className="px-3 py-3 font-mono text-slate-500">0.00</td>
                    <td className="px-3 py-3"><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px]">ساكن 🛑</span></td>
                  </tr>

                  <tr>
                    <td className="px-3 py-3 font-bold border-l border-slate-200 text-slate-800">التجربة الثانية</td>
                    <td className="px-3 py-3 font-mono">50 كجم</td>
                    <td className="px-3 py-3 font-mono">0.3</td>
                    <td className="px-3 py-3">
                      <input 
                        type="number" 
                        value={fapp2}
                        onChange={(e) => setFapp2(e.target.value)}
                        placeholder="أدخل مثلاً 200"
                        className={`w-24 p-1 rounded border text-center font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                          state2 === 'correct' ? 'border-emerald-500 bg-emerald-50' : state2 === 'wrong' ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                        }`}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input 
                        type="number" 
                        value={ffric2}
                        onChange={(e) => setFfric2(e.target.value)}
                        placeholder="أدخل مثلاً 147"
                        className={`w-24 p-1 rounded border text-center font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                          state2 === 'correct' ? 'border-emerald-500 bg-emerald-50' : state2 === 'wrong' ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                        }`}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input 
                        type="number" 
                        value={fnet2}
                        onChange={(e) => setFnet2(e.target.value)}
                        placeholder="أدخل مثلاً 53"
                        className={`w-24 p-1 rounded border text-center font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                          state2 === 'correct' ? 'border-emerald-500 bg-emerald-50' : state2 === 'wrong' ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                        }`}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input 
                        type="number" 
                        value={acc2}
                        onChange={(e) => setAcc2(e.target.value)}
                        placeholder="أدخل مثلاً 1.06"
                        className={`w-24 p-1 rounded border text-center font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                          state2 === 'correct' ? 'border-emerald-500 bg-emerald-50' : state2 === 'wrong' ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                        }`}
                      />
                    </td>
                    <td className="px-3 py-3">
                      {state2 === 'correct' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">متحرك 🏃‍♂️</span>
                      ) : state2 === 'wrong' ? (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px]">خاطئ ❌</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px]">قيد الرصد ⏳</span>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="px-3 py-3 font-bold border-l border-slate-200 text-slate-800">التجربة الثالثة</td>
                    <td className="px-3 py-3 font-mono">50 كجم</td>
                    <td className="px-3 py-3 font-mono">0.3</td>
                    <td className="px-3 py-3">
                      <input 
                        type="number" 
                        value={fapp3}
                        onChange={(e) => setFapp3(e.target.value)}
                        placeholder="أدخل مثلاً 250"
                        className={`w-24 p-1 rounded border text-center font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                          state3 === 'correct' ? 'border-emerald-500 bg-emerald-50' : state3 === 'wrong' ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                        }`}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input 
                        type="number" 
                        value={ffric3}
                        onChange={(e) => setFfric3(e.target.value)}
                        placeholder="أدخل مثلاً 147"
                        className={`w-24 p-1 rounded border text-center font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                          state3 === 'correct' ? 'border-emerald-500 bg-emerald-50' : state3 === 'wrong' ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                        }`}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input 
                        type="number" 
                        value={fnet3}
                        onChange={(e) => setFnet3(e.target.value)}
                        placeholder="أدخل مثلاً 103"
                        className={`w-24 p-1 rounded border text-center font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                          state3 === 'correct' ? 'border-emerald-500 bg-emerald-50' : state3 === 'wrong' ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                        }`}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input 
                        type="number" 
                        value={acc3}
                        onChange={(e) => setAcc3(e.target.value)}
                        placeholder="أدخل مثلاً 2.06"
                        className={`w-24 p-1 rounded border text-center font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                          state3 === 'correct' ? 'border-emerald-500 bg-emerald-50' : state3 === 'wrong' ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                        }`}
                      />
                    </td>
                    <td className="px-3 py-3">
                      {state3 === 'correct' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">متحرك 🏃‍♂️</span>
                      ) : state3 === 'wrong' ? (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px]">خاطئ ❌</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px]">قيد الرصد ⏳</span>
                      )}
                    </td>
                  </table>
                </tbody>
              </table>
            </div>

            <button 
              onClick={checkTable}
              className="w-full py-3 text-xs bg-indigo-600 text-white font-black hover:bg-indigo-500 rounded-xl transition-all cursor-pointer shadow active:scale-95"
            >
              📊 تحقق من صحة ومطابقة الأرصاد المدخلة علمياً
            </button>

            {tableFeedback && (
              <div className={`p-3.5 rounded-xl border text-xs font-bold ${
                tableFeedbackType === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-950' : 'bg-amber-50 border-amber-100 text-amber-950'
              }`}>
                {tableFeedback}
              </div>
            )}
          </div>
        </div>
      )}

      {currentTab === 'calculator' && (
        <div className="space-y-6">
          <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl space-y-2">
            <h5 className="font-extrabold text-indigo-950 text-xs flex items-center gap-1.5">
              <Sparkles size={14} className="text-indigo-600" />
              <span>الآلة الحاسبة الفورية لقوانين وطوابع الاحتكاك الفيزيائية</span>
            </h5>
            <p className="text-[10px] text-indigo-850 leading-relaxed font-semibold">
              أدخل كتلة الجسم والقوة الخارجية المطبقة عليه مع معاملي الاحتكاك السكوني والحركي لمشاهدة التحليل الديناميكي الفوري لحالة الأجسام وقوة الاحتكاك الفعالة المؤثرة بالواقع وقيمة التسارع الناتج.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* اللوحة التحكمية */}
            <div className="lg:col-span-4 space-y-4">
              {/* كتلة الجسم */}
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">كتلة الجسم (كجم):</span>
                  <span className="text-xs font-black font-mono text-indigo-750 bg-indigo-50 px-2.5 py-0.5 rounded-md">{calcMass} كجم</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={calcMass}
                  onChange={(e) => setCalcMass(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* القوة المطبقة */}
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">القوة المطبقة (نيوتن):</span>
                  <span className="text-xs font-black font-mono text-indigo-750 bg-indigo-50 px-2.5 py-0.5 rounded-md">{calcFapp} N</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={calcFapp}
                  onChange={(e) => setCalcFapp(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* معامل الاحتكاك السكوني */}
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">معامل الاحتكاك السكوني (μ_س):</span>
                  <span className="text-xs font-black font-mono text-indigo-750 bg-indigo-50 px-2.5 py-0.5 rounded-md">{calcMus.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={calcMus}
                  onChange={(e) => setCalcMus(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* معامل الاحتكاك الحركي */}
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">معامل الاحتكاك الحركي (μ_ح):</span>
                  <span className="text-xs font-black font-mono text-indigo-750 bg-indigo-50 px-2.5 py-0.5 rounded-md">{calcMuk.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.9"
                  step="0.05"
                  value={calcMuk}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setCalcMuk(Math.min(val, calcMus)); // الحركي أقل من السكوني
                  }}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            {/* اللوح المعملي للنتائج والتحليل */}
            <div className="lg:col-span-8 space-y-4">
              {/* الرسوم التخطيطية الهندسية */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-950 relative h-64 flex flex-col justify-between">
                <div className="absolute top-2.5 left-2.5 bg-slate-950/60 px-2.5 py-1 rounded text-[8px] text-slate-400 font-bold">
                  مخطط الجسم الحر في الهواء الطلق
                </div>

                <div className="flex-1 flex items-center justify-center relative py-6">
                  {/* الأرض */}
                  <div className="w-5/6 h-2 bg-slate-700 absolute bottom-10 rounded"></div>

                  {/* الصندوق */}
                  <div className="w-28 h-20 bg-indigo-600 border-2 border-indigo-400 rounded-lg flex flex-col items-center justify-center text-xs text-white z-15 absolute bottom-11 shadow-2xl">
                    <span className="font-bold">ك = {calcMass} كجم</span>
                    <span className="text-[8px] text-indigo-200">الوزن = {normalForce.toFixed(0)} نيوتن</span>
                  </div>

                  {/* الأسهم المتجهة بالقوة */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                    {/* سهم القوة الخارجية (لليمين) */}
                    {calcFapp > 0 && (
                      <>
                        <line x1="100" y1="120" x2="35" y2="120" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrow)" />
                        <text x="50" y="110" fill="#10b981" className="text-[10px] font-bold">القوة المطبقة (ق) = {calcFapp}N</text>
                      </>
                    )}
                    {/* سهم قوة الاحتكاك (لليسار) */}
                    {actualFriction > 0 && (
                      <>
                        <line x1="280" y1="120" x2="345" y2="120" stroke="#f43f5e" strokeWidth="3" markerEnd="url(#arrow)" />
                        <text x="290" y="110" fill="#f43f5e" className="text-[10px] font-bold">قوة الاحتكاك = {actualFriction.toFixed(1)}N</text>
                      </>
                    )}
                  </svg>
                </div>

                <div className="h-4 bg-slate-950 text-slate-500 text-[8px] flex items-center justify-center rounded">
                  الجاذبية المعيارية بالمعادلة مستقرة بالقرب من سطح الأرض د = 9.8 م/ث²
                </div>
              </div>

              {/* بطاقات النتائج الفورية وتحليل القوى */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                  <span className="text-[9px] text-slate-500 font-bold block">القوة العمودية (ق_ر):</span>
                  <strong className="text-lg font-black font-mono text-slate-900">{normalForce.toFixed(1)} نيوتن</strong>
                </div>
                <div className="p-3.5 bg-amber-55/10 rounded-2xl border border-amber-100 text-center space-y-1">
                  <span className="text-[9px] text-amber-800 font-bold block">أقصى احتكاك سكوني:</span>
                  <strong className="text-lg font-black font-mono text-amber-900">{maxStaticFriction.toFixed(1)} نيوتن</strong>
                </div>
                <div className="p-3.5 bg-emerald-55/10 rounded-2xl border border-emerald-100 text-center space-y-1">
                  <span className="text-[9px] text-emerald-800 font-bold block">العجلة الناتجة (جـ):</span>
                  <strong className="text-lg font-black font-mono text-emerald-900">{acceleration.toFixed(2)} م/ث²</strong>
                </div>
              </div>

              {/* الحالة الحركية التفصيلية */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-150 rounded-2xl space-y-2 text-xs">
                <span className="font-extrabold text-indigo-950 block">🏷️ الحالة والتحليل الميكانيكي الراهن للجسم:</span>
                <p className="font-bold text-slate-800 leading-relaxed text-right">{motionState}</p>
                <div className="text-[10px] text-indigo-900 space-y-1 leading-relaxed">
                  <p>• القوة المطبقة: <strong className="font-mono">{calcFapp} N</strong> | قوة الاحتكاك السكونية اللحظية: <strong className="font-mono">{actualFriction.toFixed(1)} N</strong></p>
                  <p>• القوة المحصلة الناتجة خلف الفجوة: <strong className="font-mono text-indigo-950">{netForce.toFixed(1)} N</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =======================================================
// 10. مختبر النظرية الحركية الجزيئية وحالات المادة (الدرس 14)
// =======================================================
export function KineticMolecularTheoryLab({ onComplete }: LabProps) {
  const [currentTab, setCurrentTab] = useState<'simulation' | 'activities' | 'calculator'>('simulation');
  const [activeElement, setActiveElement] = useState<'neon' | 'argon' | 'water'>('neon');
  const [activeState, setActiveState] = useState<'solid' | 'liquid' | 'gas'>('solid');
  
  // درجة الحرارة بالكلفن
  const [temp, setTemp] = useState<number>(24);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // ورقة الملاحظات وأسئلة المختبر
  const [obs1, setObs1] = useState<string>('');
  const [obs2, setObs2] = useState<string>('');
  const [obs3, setObs3] = useState<string>('');
  const [activityStatus, setActivityStatus] = useState<'pending' | 'correct' | 'wrong'>('pending');
  const [activityFeedback, setActivityFeedback] = useState<string>('');

  // آلة حاسبة مستقلة
  const [calcTemp, setCalcTemp] = useState<number>(300);

  // تحديث درجة الحرارة تلقائياً بناء على تحديد الحالة لتطابق المادة مجهرياً
  useEffect(() => {
    if (activeState === 'solid') {
      setTemp(activeElement === 'neon' ? 14 : activeElement === 'argon' ? 40 : 150);
    } else if (activeState === 'liquid') {
      setTemp(activeElement === 'neon' ? 26 : activeElement === 'argon' ? 85 : 320);
    } else {
      setTemp(activeElement === 'neon' ? 120 : activeElement === 'argon' ? 220 : 500);
    }
  }, [activeState, activeElement]);

  // محاكاة فيزياء الجسيمات على الكانفاس ثنائي الأبعاد
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const width = canvas.width;
    const height = canvas.height;

    // تهيئة الجسيمات
    const particleCount = 48;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      gridX: number;
      gridY: number;
      radius: number;
    }> = [];

    // اختيار الألوان والخصائص
    const particleRadius = activeElement === 'neon' ? 6 : activeElement === 'argon' ? 8 : 7;
    const color = activeElement === 'neon' ? '#f43f5e' : activeElement === 'argon' ? '#a855f7' : '#0ea5e9';

    // توزيع الجسيمات في شبكة للحالة الصلبة
    const cols = 8;
    const rows = Math.ceil(particleCount / cols);
    const gridSpacing = particleRadius * 2.3;
    const startX = (width - cols * gridSpacing) / 2 + particleRadius;
    const startY = height - (rows * gridSpacing) - 15;

    for (let i = 0; i < particleCount; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const gx = startX + c * gridSpacing + (r % 2 === 0 ? gridSpacing / 3 : 0);
      const gy = startY + r * gridSpacing;

      particles.push({
        x: gx,
        y: gy,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        gridX: gx,
        gridY: gy,
        radius: particleRadius
      });
    }

    // حلقة الحركة التفاعلية
    const updatePhysics = () => {
      ctx.clearRect(0, 0, width, height);

      // رسم الحاوية
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, width, height);

      // معامل السرعة المتأثر بالحرارة الكلفنية
      const speedMultiplier = Math.sqrt(temp) * 0.25;

      particles.forEach((p, idx) => {
        if (activeState === 'solid') {
          // جزيئات الصلب تهتز فقط حول مواقعها الثابتة
          const vibrationAmp = Math.min(6, temp * 0.15);
          p.x = p.gridX + (Math.random() - 0.5) * vibrationAmp;
          p.y = p.gridY + (Math.random() - 0.5) * vibrationAmp;
        } else if (activeState === 'liquid') {
          // جزيئات السائل تتجمع وتنزلق في قاع الإناء
          p.vy += 0.25; // جاذبية ضعيفة لتكثيف الماء في الأسفل
          p.x += p.vx * speedMultiplier * 0.35;
          p.y += p.vy * speedMultiplier * 0.35;

          // احتكاك لتبديد الطاقة الزائدة
          p.vx *= 0.96;
          p.vy *= 0.96;

          // تصادم مع الجدران
          if (p.x < p.radius) { p.x = p.radius; p.vx *= -0.6; }
          if (p.x > width - p.radius) { p.x = width - p.radius; p.vx *= -0.6; }
          if (p.y < p.radius) { p.y = p.radius; p.vy *= -0.6; }
          if (p.y > height - p.radius) { p.y = height - p.radius; p.vy *= -0.6; }

          // تماسك جزيئي وجذب لتقريب جزيئات السائل
          particles.forEach((other, oIdx) => {
            if (idx === oIdx) return;
            const dx = other.x - p.x;
            const dy = other.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = p.radius + other.radius + 1.2;
            if (dist < minDist) {
              const overlap = minDist - dist;
              const nx = dx / (dist || 1);
              const ny = dy / (dist || 1);
              p.x -= nx * overlap * 0.5;
              p.y -= ny * overlap * 0.5;
              p.vx -= nx * 0.08 * speedMultiplier;
              p.vy -= ny * 0.08 * speedMultiplier;
            }
          });
        } else {
          // الغاز: حركة عشوائية تامة ومستمرة في كامل الوعاء
          p.x += p.vx * speedMultiplier * 0.45;
          p.y += p.vy * speedMultiplier * 0.45;

          // الحدود والجدران (ارتداد تام المرونة)
          if (p.x < p.radius) { p.x = p.radius; p.vx *= -1; }
          if (p.x > width - p.radius) { p.x = width - p.radius; p.vx *= -1; }
          if (p.y < p.radius) { p.y = p.radius; p.vy *= -1; }
          if (p.y > height - p.radius) { p.y = height - p.radius; p.vy *= -1; }

          // تصادم مرن بين الجزيئات
          particles.forEach((other, oIdx) => {
            if (idx === oIdx) return;
            const dx = other.x - p.x;
            const dy = other.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = p.radius + other.radius;
            if (dist < minDist) {
              const overlap = minDist - dist;
              const nx = dx / (dist || 1);
              const ny = dy / (dist || 1);
              p.x -= nx * overlap * 0.5;
              p.y -= ny * overlap * 0.5;

              // تبادل كمية الحركة
              const kx = p.vx - other.vx;
              const ky = p.vy - other.vy;
              const pX = nx * kx + ny * ky;
              p.vx -= nx * pX;
              p.vy -= ny * pX;
              other.vx += nx * pX;
              other.vy += ny * pX;
            }
          });
        }

        // رسم الجسيم وتأثيره البلوري
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#ffffffaa';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    updatePhysics();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [temp, activeElement, activeState]);

  // حساب الضغط التقريبي بناء على معادلة الغاز المثالي PV = nRT مع تذبذب مجهري طفيف للواقعية
  const pressureBase = activeState === 'gas' ? (temp * 0.012) : activeState === 'liquid' ? (temp * 0.003) : 0;
  const pressureFluctuation = activeState === 'gas' ? (Math.random() - 0.5) * 0.04 : 0;
  const displayPressure = Math.max(0, pressureBase + pressureFluctuation);

  // التحقق من إجابات ورقة عمل التجربة
  const checkActivities = () => {
    if (obs1 === 'اهتزازية' && obs2 === 'تزيد' && obs3 === 'مسافات') {
      setActivityStatus('correct');
      setActivityFeedback('✅ رائع جداً! إجاباتك صحيحة ومطابقة تماماً لملاحظات التجربة العلمية. تم منحك 30 نقطة علمية مضافة لمحفظتك الاستقصائية!');
      if (onComplete) onComplete(30, 'kinetic_theory_experiment');
    } else {
      setActivityStatus('wrong');
      setActivityFeedback('❌ بعض الملاحظات غير دقيقة علمياً. أعد فحص سلوك وحركة الجسيمات في الكانفاس ثم صحح اختياراتك.');
    }
  };

  // ثوابت الحسابات الديناميكية الحرارية للآلة الحاسبة
  // R = 8.314, kB = 1.38e-23
  const molarMasses = { neon: 0.02018, argon: 0.03995, water: 0.018015 };
  const namesAr = { neon: 'غاز النيون', argon: 'غاز الأرجون', water: 'بخار الماء' };

  const calcSpeedRMS = (massKg: number, tK: number) => {
    return Math.sqrt((3 * 8.314 * tK) / massKg);
  };

  const calcAvgEnergy = (tK: number) => {
    // KE = 1.5 * kB * T
    return 1.5 * 1.38e-23 * tK;
  };

  return (
    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 space-y-5" id="kinetic-molecular-lab">
      <div className="flex flex-col md:flex-row justify-between items-center bg-indigo-900 text-white p-4 rounded-2xl gap-3">
        <div className="space-y-1 text-right">
          <div className="flex items-center gap-2">
            <Beaker className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-extrabold">مختبر النظرية الحركية الجزيئية وحالات المادة (محاكاة PhET المحلية)</h3>
          </div>
          <p className="text-[10px] text-indigo-200">صممت هذه الواجهة لدراسة العلاقات المجهرية وسلوك الذرات بدعم من الأستاذ سياف الشباطي</p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setCurrentTab('simulation')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${currentTab === 'simulation' ? 'bg-amber-500 text-white shadow-md' : 'bg-indigo-800 text-indigo-150 hover:bg-indigo-700'}`}
          >
            🧪 المحاكاة التفاعلية
          </button>
          <button
            onClick={() => setCurrentTab('activities')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${currentTab === 'activities' ? 'bg-amber-500 text-white shadow-md' : 'bg-indigo-800 text-indigo-150 hover:bg-indigo-700'}`}
          >
            📝 كتاب الأرصاد والأنشطة
          </button>
          <button
            onClick={() => setCurrentTab('calculator')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${currentTab === 'calculator' ? 'bg-amber-500 text-white shadow-md' : 'bg-indigo-800 text-indigo-150 hover:bg-indigo-700'}`}
          >
            🧮 حاسبة السرعات الجزيئية
          </button>
        </div>
      </div>

      {/* 1. تبويب المحاكاة التفاعلية */}
      {currentTab === 'simulation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* لوحة الرسم */}
          <div className="lg:col-span-8 flex flex-col items-center bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <div className="w-full flex justify-between items-center text-xs font-bold">
              <span className="text-slate-500">مجهر تصوير حركة الذرات والجزيئات</span>
              <div className="flex gap-4">
                <span className="text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                  🌡️ الحرارة: {temp} كلفن ({ (temp - 273.15).toFixed(1) } °C)
                </span>
                <span className="text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                  💨 الضغط التقريبي: {displayPressure.toFixed(2)} atm
                </span>
              </div>
            </div>

            <canvas
              ref={canvasRef}
              width={480}
              height={280}
              className="max-w-full bg-slate-950 rounded-xl shadow-inner border-2 border-slate-300"
            />

            {/* أداة التسخين والتبريد اللمسية */}
            <div className="w-full max-w-md bg-amber-50/50 border border-amber-100 rounded-2xl p-3 flex justify-between items-center gap-4">
              <span className="text-xs font-extrabold text-amber-900">🎛️ موقد الحرارة العام:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setTemp(t => Math.max(5, t - 15))}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-xl text-sm flex items-center gap-1"
                >
                  ❄️ مبرد ثلج (-15K)
                </button>
                <button
                  onClick={() => setTemp(t => Math.min(1200, t + 20))}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl text-sm flex items-center gap-1"
                >
                  <Flame className="w-4 h-4" /> لهب نار (+20K)
                </button>
                <button
                  onClick={() => {
                    if (activeState === 'solid') setTemp(activeElement === 'neon' ? 14 : activeElement === 'argon' ? 40 : 150);
                    else if (activeState === 'liquid') setTemp(activeElement === 'neon' ? 26 : activeElement === 'argon' ? 85 : 320);
                    else setTemp(activeElement === 'neon' ? 120 : activeElement === 'argon' ? 220 : 500);
                  }}
                  className="p-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-700"
                  title="إعادة ضبط حرارة الحالة"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* لوحة التحكم الجانبية */}
          <div className="lg:col-span-4 space-y-4">
            {/* بطاقة اختيار نوع العنصر */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
              <span className="font-extrabold text-xs text-indigo-950 block">🔵 اختر المادة / العنصر الكوني:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setActiveElement('neon')}
                  className={`py-2 text-xs font-extrabold rounded-xl border transition-all ${activeElement === 'neon' ? 'bg-rose-50 border-rose-450 text-rose-700 font-black shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'}`}
                >
                  نيون (Neon)<br /><span className="text-[9px] text-slate-500 block mt-0.5">20 g/mol</span>
                </button>
                <button
                  onClick={() => setActiveElement('argon')}
                  className={`py-2 text-xs font-extrabold rounded-xl border transition-all ${activeElement === 'argon' ? 'bg-purple-50 border-purple-450 text-purple-700 font-black shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'}`}
                >
                  أرجون (Argon)<br /><span className="text-[9px] text-slate-500 block mt-0.5">40 g/mol</span>
                </button>
                <button
                  onClick={() => setActiveElement('water')}
                  className={`py-2 text-xs font-extrabold rounded-xl border transition-all ${activeElement === 'water' ? 'bg-sky-50 border-sky-450 text-sky-700 font-black shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'}`}
                >
                  ماء (H₂O)<br /><span className="text-[9px] text-slate-500 block mt-0.5">18 g/mol</span>
                </button>
              </div>
            </div>

            {/* بطاقة اختيار حالة المادة */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
              <span className="font-extrabold text-xs text-indigo-950 block">📦 اختر حالة المادة مجهرياً:</span>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveState('solid')}
                  className={`w-full py-2.5 px-3 rounded-xl border text-right text-xs font-bold transition-all flex justify-between items-center ${activeState === 'solid' ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-extrabold' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'}`}
                >
                  <span>❄️ صلب (Solid)</span>
                  <span className="text-[10px] text-slate-500 font-sans">تراص منتظم بلوري وهتز موضعي</span>
                </button>
                <button
                  onClick={() => setActiveState('liquid')}
                  className={`w-full py-2.5 px-3 rounded-xl border text-right text-xs font-bold transition-all flex justify-between items-center ${activeState === 'liquid' ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-extrabold' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'}`}
                >
                  <span>💧 سائل (Liquid)</span>
                  <span className="text-[10px] text-slate-500 font-sans">جريان منقاد وقريب مع انزلاق</span>
                </button>
                <button
                  onClick={() => setActiveState('gas')}
                  className={`w-full py-2.5 px-3 rounded-xl border text-right text-xs font-bold transition-all flex justify-between items-center ${activeState === 'gas' ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-extrabold' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'}`}
                >
                  <span>💨 غاز (Gas)</span>
                  <span className="text-[10px] text-slate-500 font-sans">فوران منتشر حركي وتصادم تام</span>
                </button>
              </div>
            </div>

            {/* تلميح وتفسير مجهري فوري */}
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-150 rounded-2xl text-[11px] text-indigo-950 leading-relaxed font-semibold">
              <span className="block font-black text-xs text-indigo-950 mb-1">💡 تفسير الحالة الحالية:</span>
              {activeState === 'solid' && (
                <p>لاحظ ترابط ذرات وجزيئات <b>{activeElement === 'neon' ? 'النيون' : activeElement === 'argon' ? 'الأرجون' : 'الماء'}</b> بشكل رصين. إنها قريبة جداً وقوى التجالب تمنعها من الانفلات، فقط تملك اهتزازات موضعية بسيطة تشتد طردياً برفع الحرارة.</p>
              )}
              {activeState === 'liquid' && (
                <p>تحررت الجزيئات جزئياً بفعل الطاقة الحرارية وتنزلق وتتدحرج عشوائياً بأسفل الوعاء متخذة شكل قراره، مع بقائها في تماسك متقارب نسبي يمنعها من الانتشار المطلق.</p>
              )}
              {activeState === 'gas' && (
                <p>تطاير حر فائق! تلاشت قوى التماسك تماماً، والمسافات البينية شاسعة جداً. لاحظ كيف تنضغط جزيئات الغاز بالوعاء وتصطدم بالجدران لتعكس قانون الضغط الميكانيكي العام.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. كتاب الأرصاد والأنشطة (ورقة العمل التقييمية) */}
      {currentTab === 'activities' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-6">
          <div className="text-center space-y-1">
            <h4 className="text-sm font-black text-indigo-900">📝 كتاب ومفرزة الأرصاد العملية - النظرية الحركية</h4>
            <p className="text-xs text-slate-500 leading-relaxed">أثبت قدرتك البحثية المجهرية وسجل أرصادك الدقيقة حول ما رصدته في لوحة المحاكاة لإرسال التقرير للمعلم وكسب 30 نقطة علمية.</p>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            {/* السؤال الأول */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <span className="block text-indigo-950">السؤال الأول 📝: ما هو السلوك الحركي والترتيبي العام للجزيئات في الحالة الصلبة (نيون عند 14 كلفن)؟</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <input type="radio" name="obs1" value="اهتزازية" checked={obs1 === 'اهتزازية'} onChange={(e) => setObs1(e.target.value)} />
                  <span>أ) اهتزازية مقيدة في مواضعها الثابتة</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <input type="radio" name="obs1" value="حرة" checked={obs1 === 'حرة'} onChange={(e) => setObs1(e.target.value)} />
                  <span>ب) حرة سريعة جداً تملأ الوعاء تلقائياً</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <input type="radio" name="obs1" value="منحلة" checked={obs1 === 'منحلة'} onChange={(e) => setObs1(e.target.value)} />
                  <span>ج) سريعة الانحلال ودائمة الانضغاط والتبخر</span>
                </label>
              </div>
            </div>

            {/* السؤال الثاني */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <span className="block text-indigo-950">السؤال الثاني 📝: كيف تؤثر عملية التسخين المستمر والتزويد بالطاقة الحرارية في سرعة جسيمات غاز الأرجون وضغط الإناء؟</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <input type="radio" name="obs2" value="تقلل" checked={obs2 === 'تقلل'} onChange={(e) => setObs2(e.target.value)} />
                  <span>أ) تقلل السرعة وتخفض وتيرة التصادم والضغط</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <input type="radio" name="obs2" value="تزيد" checked={obs2 === 'تزيد'} onChange={(e) => setObs2(e.target.value)} />
                  <span>ب) تزيد من متوسط سرعة جزيئاتها ووتيرة وقوة التصادم والضغط المولد</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <input type="radio" name="obs2" value="لا_تؤثر" checked={obs2 === 'لا_تؤثر'} onChange={(e) => setObs2(e.target.value)} />
                  <span>ج) تظل السرعة والاهتزازات والضغط ثوابت دون تأثر</span>
                </label>
              </div>
            </div>

            {/* السؤال الثالث */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <span className="block text-indigo-950">السؤال الثالث 📝: لِمَ تتميز المواد الغازية بقابلية كبرى وشديدة للانضغاط مقارنة بالصلبة والسوائل مجهرياً؟</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <input type="radio" name="obs3" value="تراص" checked={obs3 === 'تراص'} onChange={(e) => setObs3(e.target.value)} />
                  <span>أ) لأن ذراتها متراصة بلورياً وهندسياً بقوى شديدة</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <input type="radio" name="obs3" value="مسافات" checked={obs3 === 'مسافات'} onChange={(e) => setObs3(e.target.value)} />
                  <span>ب) لوجود مسافات بينية شاسعة جداً تفصل ذرات الغاز المبتعدة بملء الفراغ</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <input type="radio" name="obs3" value="مرونة" checked={obs3 === 'مرونة'} onChange={(e) => setObs3(e.target.value)} />
                  <span>ج) لأن الجسيمات تملك أحجاماً لينة تتمدد وتنكمش بالحرارة</span>
                </label>
              </div>
            </div>

            {activityFeedback && (
              <div className={`p-4 rounded-xl text-xs font-bold leading-relaxed ${activityStatus === 'correct' ? 'bg-emerald-50 border border-emerald-150 text-emerald-800' : 'bg-rose-50 border border-rose-150 text-rose-800'}`}>
                {activityFeedback}
              </div>
            )}

            <button
              onClick={checkActivities}
              disabled={activityStatus === 'correct'}
              className={`w-full py-3 rounded-xl font-bold flex justify-center items-center gap-2 text-xs text-white transition-all shadow-md ${activityStatus === 'correct' ? 'bg-emerald-600 cursor-not-allowed shadow-none' : 'bg-indigo-900 hover:bg-indigo-800 active:scale-95'}`}
            >
              <CheckCircle className="w-4 h-4" /> تسجيل الأرصاد ومطابقة التقرير العملي
            </button>
          </div>
        </div>
      )}

      {/* 3. آلة السرعات الجزيئية والديناميكا الحرارية كلكولتير */}
      {currentTab === 'calculator' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-6">
          <div className="text-center space-y-1">
            <h4 className="text-sm font-black text-indigo-900">🧮 حاسبة متوسط السرعة الجزيئية RMS للغازات المثالية</h4>
            <p className="text-xs text-slate-500 leading-relaxed">توقع سرعة ترحال جسيمات غازات الكون واحسب طاقة حركتها علمياً بتبديل دراجات السخونة الكونية المطلقة.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 leading-relaxed text-xs">
            {/* اللوح الأيسر: الإعداد الفوري والمتحكم الفوري */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <span className="font-extrabold text-xs text-indigo-950 block">🎛️ متحكم تجربة الحاسبة الحرارية:</span>
              <div className="space-y-2">
                <div className="flex justify-between font-bold text-[11px]">
                  <span>درجة الحرارة المستهدفة T:</span>
                  <span className="text-indigo-900">{calcTemp} كلفن ({(calcTemp - 273.15).toFixed(1)}°C)</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="1000"
                  value={calcTemp}
                  onChange={(e) => setCalcTemp(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* القوانين المطبقة علمياً */}
              <div className="p-3.5 bg-indigo-50/50 rounded-xl space-y-2 text-[10px] text-slate-700 font-semibold">
                <p className="font-bold text-indigo-900">🔬 القوانين الفيزيائية المطبقة بالحاسبة:</p>
                <p>1. السرعة جذر متوسط التربيع (RMS Speed):<br />
                  <strong className="font-mono text-[11px] block mt-0.5 text-center bg-white p-1 rounded border">v_rms = √ ( 3 · R · T / M )</strong>
                </p>
                <p>2. متوسط طاقة الحركة للجسيم المنفرد (K.E avg):<br />
                  <strong className="font-mono text-[11px] block mt-0.5 text-center bg-white p-1 rounded border">K.E_avg = (3 / 2) · k_B · T</strong>
                </p>
                <div className="text-[9px] text-slate-500 space-y-0.5 mt-2">
                  <p>• R (ثابت الغازات العام) = 8.314 J/(mol·K)</p>
                  <p>• M (الكتلة المولية بالكجم)</p>
                  <p>• k_B (ثابت بولتزمان) = 1.38 × 10⁻²³ J/K</p>
                </div>
              </div>
            </div>

            {/* اللوح الأيمن: بطاقة النتائج الفورية لشتى الغازات */}
            <div className="space-y-3">
              <span className="font-extrabold text-xs text-slate-500 block">📊 جدول الرصد الميكانيكي المستنتج للغازات الثلاثة:</span>
              
              {Object.entries(molarMasses).map(([elemKey, massKg]) => {
                const vel = calcSpeedRMS(massKg, calcTemp);
                const isWater = elemKey === 'water';
                const isArgon = elemKey === 'argon';
                const elColor = isWater ? 'bg-sky-50 border-sky-200 text-sky-950' : isArgon ? 'bg-purple-50 border-purple-200 text-purple-950' : 'bg-rose-50 border-rose-200 text-rose-950';
                return (
                  <div key={elemKey} className={`p-4 rounded-xl border ${elColor} space-y-2`}>
                    <div className="flex justify-between items-center font-bold">
                      <span>🧪 {namesAr[elemKey as 'neon' | 'argon' | 'water']} ({elemKey.toUpperCase()})</span>
                      <span className="font-mono text-[10px] text-slate-500">M = {(massKg * 1000).toFixed(2)} g/mol</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="block text-slate-500">سرعة الجزيئات المقدرة (v_rms):</span>
                        <strong className="font-mono text-xs">{vel.toFixed(1)} م/ث</strong>
                      </div>
                      <div>
                        <span className="block text-slate-500">متوسط طاقة الحركة للهياكل:</span>
                        <strong className="font-mono text-xs">{(calcAvgEnergy(calcTemp) * 1e21).toFixed(3)} × 10⁻²¹ J</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 11. مختبر قانون هوك والزنبرك المرن (الدرس الخامس عشر)
// ==========================================
export function HookesLawLab({ onComplete }: LabProps) {
  const [currentTab, setCurrentTab] = useState<'simulator' | 'table' | 'calculator'>('simulator');
  const [force, setForce] = useState<number>(40); // 0 to 100 N
  const [kConstant, setKConstant] = useState<number>(250); // 100 to 1000 N/m
  
  // Calculate elongation: Δl = F / k (m)
  const elongation = kConstant > 0 ? force / kConstant : 0;
  // Elastic potential energy: PE = 0.5 * k * x^2 (J)
  const energy = 0.5 * kConstant * Math.pow(elongation, 2);

  const materials = [
    { label: "🎗️ نحاس أصفر مرن", value: 150 },
    { label: "⛓️ سلك برونزي متزن", value: 300 },
    { label: "⚙️ سلك حديد صلب", value: 500 },
    { label: "💎 فولاذ كربوني صلد", value: 800 }
  ];

  // Table trials for data collection
  const [trials, setTrials] = useState<Array<{
    id: number;
    force: string;
    elongation: string;
    kUser: string;
    isCorrect: boolean | null;
  }>>([
    { id: 1, force: '20.0', elongation: '0.100', kUser: '', isCorrect: null },
    { id: 2, force: '50.0', elongation: '0.200', kUser: '', isCorrect: null },
    { id: 3, force: '80.0', elongation: '0.400', kUser: '', isCorrect: null },
    { id: 4, force: '100.0', elongation: '0.500', kUser: '', isCorrect: null },
  ]);

  const [activeTrialRow, setActiveTrialRow] = useState<number>(1);
  const [tableSubmitted, setTableSubmitted] = useState<boolean>(false);
  const [tableFeedback, setTableFeedback] = useState<string>('');

  // Formula solver state
  const [calcTarget, setCalcTarget] = useState<'force' | 'k' | 'elongation'>('force');
  const [inputForce, setInputForce] = useState<string>('50');
  const [inputK, setInputK] = useState<string>('250');
  const [inputElongation, setInputElongation] = useState<string>('0.2');
  const [calcResult, setCalcResult] = useState<string>('');

  // Dynamically calculate formulas
  useEffect(() => {
    const fVal = parseFloat(inputForce);
    const kVal = parseFloat(inputK);
    const eVal = parseFloat(inputElongation);

    if (calcTarget === 'force') {
      if (!isNaN(kVal) && !isNaN(eVal)) {
        setCalcResult((kVal * eVal).toFixed(2));
      } else {
        setCalcResult('---');
      }
    } else if (calcTarget === 'k') {
      if (!isNaN(fVal) && !isNaN(eVal) && eVal !== 0) {
        setCalcResult((fVal / eVal).toFixed(2));
      } else {
        setCalcResult('---');
      }
    } else if (calcTarget === 'elongation') {
      if (!isNaN(fVal) && !isNaN(kVal) && kVal !== 0) {
        setCalcResult((fVal / kVal).toFixed(3));
      } else {
        setCalcResult('---');
      }
    }
  }, [calcTarget, inputForce, inputK, inputElongation]);

  // Spring SVG Path generator
  const generateSpringPath = (lengthPx: number) => {
    const startX = 40;
    const endX = startX + lengthPx;
    const coils = 16;
    const coilHeight = 18;
    const step = (endX - 20 - startX) / coils;
    
    // Left boundary L interface
    let d = `M 15 80 L ${startX} 80`;
    
    for (let i = 0; i < coils; i++) {
      const currX = startX + i * step;
      const nextX = startX + (i + 1) * step;
      const midX = currX + step / 2;
      const y = i % 2 === 0 ? 80 - coilHeight : 80 + coilHeight;
      d += ` L ${midX} ${y} L ${nextX} 80`;
    }
    d += ` L ${endX} 80`;
    return d;
  };

  // Record current simulator readings into designated row
  const recordCurrentReading = () => {
    setTrials(prev => prev.map(t => {
      if (t.id === activeTrialRow) {
        return {
          ...t,
          force: force.toFixed(1),
          elongation: elongation.toFixed(3),
          kUser: '', // Force them to calculate k = F / x
          isCorrect: null
        };
      }
      return t;
    }));
    
    // Automatically move to the next row for a nice user experience
    if (activeTrialRow < 4) {
      setActiveTrialRow(prev => prev + 1);
    }
  };

  // Validate student calculations
  const checkTableAnswers = () => {
    let allOk = true;
    const updatedTrials = trials.map(t => {
      const fNum = parseFloat(t.force);
      const eNum = parseFloat(t.elongation);
      const kUserNum = parseFloat(t.kUser);

      if (isNaN(fNum) || isNaN(eNum) || isNaN(kUserNum) || eNum === 0) {
        allOk = false;
        return { ...t, isCorrect: false };
      }

      const kExact = fNum / eNum;
      // Allow +/- 5% error margin for rounding deviations
      const errorMargin = Math.abs(kUserNum - kExact) / kExact;
      const isRowCorrect = errorMargin <= 0.05;

      if (!isRowCorrect) allOk = false;
      return { ...t, isCorrect: isRowCorrect };
    });

    setTrials(updatedTrials);
    setTableSubmitted(true);

    if (allOk) {
      setTableFeedback('🎉 رائع جداً وممتاز ميكانيكياً! كافة الحسابات لثابت النابض دقيقة 100%. لقد أثبت قانون هوك بالتجربة والبرهان والتحليل وجار رصد الـ XP!');
      if (onComplete) onComplete(40, 'lab_hookes_law_success');
    } else {
      setTableFeedback('⚠️ بعض خلايا ثابت النابض هـ غير منضبطة. تأكد من قسمة القوة (ق) على الاستطالة الإزاحية (Δل). راجع الإجابات المظللة بالبرتقالي وأعد المحاورة!');
    }
  };

  const resetTable = () => {
    setTrials([
      { id: 1, force: '20.0', elongation: '0.100', kUser: '', isCorrect: null },
      { id: 2, force: '50.0', elongation: '0.200', kUser: '', isCorrect: null },
      { id: 3, force: '80.0', elongation: '0.400', kUser: '', isCorrect: null },
      { id: 4, force: '100.0', elongation: '0.500', kUser: '', isCorrect: null },
    ]);
    setActiveTrialRow(1);
    setTableSubmitted(false);
    setTableFeedback('');
  };

  // Base unstretched length of the spring in dry pixels is 110px. Max stretched length is 240px.
  const visualLength = 100 + elongation * 150;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* رأس المختبر والمطالعة البدئية */}
      <div className="bg-gradient-to-l from-indigo-700 to-slate-900 text-white p-5 rounded-3xl shadow-md space-y-2">
        <div className="flex items-center gap-2 justify-start">
          <Beaker className="text-indigo-300 stroke-[2.5] w-6 h-6" />
          <h3 className="text-base md:text-lg font-black">🔬 المعمل التجريبي لخواص تمدد المواد الصلبة وقانون هوك</h3>
        </div>
        <p className="text-xs text-indigo-150 leading-relaxed font-semibold">
          استكشف مظهر قوة مرونة الذرات، وقم بتمرير قوى بأثقال مختلفة لتقصي العلاقة البيانية الفذة وصياغة حسابات ثابت النابض هـ.
        </p>
      </div>

      {/* شريط تبويبات ميزان العمل */}
      <div className="flex border-b border-slate-200 gap-1.5 font-extrabold text-xs">
        <button
          onClick={() => setCurrentTab('simulator')}
          className={`pb-2.5 px-4 rounded-t-xl transition-all cursor-pointer ${
            currentTab === 'simulator'
              ? 'border-b-3 border-indigo-700 text-indigo-800 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          🎛️ لوح المحاكاة التفاعلية
        </button>
        <button
          onClick={() => setCurrentTab('table')}
          className={`pb-2.5 px-4 rounded-t-xl transition-all cursor-pointer ${
            currentTab === 'table'
              ? 'border-b-3 border-indigo-700 text-indigo-800 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          📋 سجل ورقة القراءات
        </button>
        <button
          onClick={() => setCurrentTab('calculator')}
          className={`pb-2.5 px-4 rounded-t-xl transition-all cursor-pointer ${
            currentTab === 'calculator'
              ? 'border-b-3 border-indigo-700 text-indigo-800 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          🧮 حاسبة الميكانيكا الذكية
        </button>
      </div>

      {/* ١. كروت التبويب الأول: لوح المحاكاة */}
      {currentTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 leading-normal text-xs">
          
          {/* الجانب الأيمن: التحكم الميكانيكي */}
          <div className="lg:col-span-4 p-5 bg-white border border-slate-250/80 rounded-3xl shadow-sm space-y-5">
            <span className="font-extrabold text-xs text-slate-800 block border-b pb-2">🎚️ لوحة التحكم بقوى الزنبرك:</span>
            
            {/* خامات النوابض */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 block">선 أثقال النوابض ومقاومات الفولاذ والبرونز:</label>
              <div className="grid grid-cols-2 gap-1.5 font-bold text-[10px]">
                {materials.map((mat) => (
                  <button
                    key={mat.value}
                    onClick={() => setKConstant(mat.value)}
                    className={`py-1.5 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                      kConstant === mat.value
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-800 font-black shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {mat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* منزلق ثابت النابض هـ */}
            <div className="space-y-2">
              <div className="flex justify-between font-bold text-[11px]">
                <span>ثابت النابض (هـ - صلابة النابض):</span>
                <span className="text-indigo-700 font-black font-mono">{kConstant} نيوتن/م</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="25"
                value={kConstant}
                onChange={(e) => setKConstant(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-indigo-650"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                <span>100 ن/م (مرن جداً)</span>
                <span>1000 ن/م (شديد الصلابة)</span>
              </div>
            </div>

            {/* منزلق القوة ق */}
            <div className="space-y-2">
              <div className="flex justify-between font-bold text-[11px]">
                <span>القوة المؤثرة لشد النابض (ق):</span>
                <span className="text-emerald-700 font-black font-mono">{force} نيوتن</span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                step="5"
                value={force}
                onChange={(e) => setForce(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-emerald-650"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                <span>0 نيوتن (صفرية)</span>
                <span>120 نيوتن (شد هائل)</span>
              </div>
            </div>

            {/* تسجيل البيانات الفوري لورقة العمل */}
            <div className="pt-3 border-t">
              <button
                onClick={recordCurrentReading}
                className="w-full py-2.5 px-4 bg-indigo-700 hover:bg-indigo-805 text-white rounded-2xl font-black text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={13} className="animate-spin text-indigo-150" />
                <span>رصد القراءة الحالية بجدول البيانات ➔</span>
              </button>
              <div className="flex justify-between items-center text-[9px] text-slate-500 font-semibold mt-2 px-1">
                <span>المحاولة المستهدفة بالرصد:</span>
                <select
                  value={activeTrialRow}
                  onChange={(e) => setActiveTrialRow(parseInt(e.target.value))}
                  className="bg-slate-100 border rounded p-0.5 font-bold text-slate-700 text-[10px]"
                >
                  <option value={1}>المحاولة الأولى ❶</option>
                  <option value={2}>المحاولة الثانية ❷</option>
                  <option value={3}>المحاولة الثالثة ❸</option>
                  <option value={4}>المحاولة الرابعة ❹</option>
                </select>
              </div>
            </div>

          </div>

          {/* الجانب الأيسر: تمثيل فيزياء النابض */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* بطاقة الرسوم والتجسيم الميكانيكي */}
            <div className="p-6 bg-slate-900 border border-slate-950 rounded-3xl text-right relative overflow-hidden shadow-inner h-80 flex flex-col justify-between">
              
              {/* لوحة المؤشرات العلوية */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 leading-none text-white font-mono text-[9px] relative z-10 select-none">
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 flex flex-col justify-between space-y-1">
                  <span className="text-slate-400 font-sans font-bold">القوة المطبقة (ق)</span>
                  <strong className="text-emerald-400 text-xs font-black">{force.toFixed(1)} N</strong>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 flex flex-col justify-between space-y-1">
                  <span className="text-slate-400 font-sans font-bold">ثابت النابض (هـ)</span>
                  <strong className="text-indigo-400 text-xs font-black">{kConstant} N/m</strong>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 flex flex-col justify-between space-y-1">
                  <span className="text-slate-400 font-sans font-bold">الاستطالة (Δل)</span>
                  <strong className="text-amber-400 text-xs font-black">{elongation.toFixed(3)} m</strong>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 flex flex-col justify-between space-y-1">
                  <span className="text-slate-400 font-sans font-bold">طاقة الوضع (PE_e)</span>
                  <strong className="text-rose-400 text-xs font-black">{energy.toFixed(3)} J</strong>
                </div>
              </div>

              {/* الكانفاس الرسومي SVG للنابض والأثقال */}
              <div className="w-full flex-1 flex items-center justify-center relative my-2">
                <svg className="w-full h-full max-h-[160px] overflow-visible" viewBox="0 0 460 160">
                  
                  {/* خط الصفر المرجعي للاتزان (Equilibrium line) */}
                  <line x1="140" y1="0" x2="140" y2="150" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="5,4" opacity="0.4" />
                  <text x="145" y="15" fill="#f43f5e" fontSize="8" fontWeight="bold" opacity="0.6">موضع الصفر الطبيعي</text>

                  {/* منطقة الجدار الأيسر المصمت */}
                  <line x1="15" y1="20" x2="15" y2="140" stroke="#cbd5e1" strokeWidth="5" />
                  <path d="M 12 10 L 12 150 M 9 15 L 9 145 M 6 20 L 6 140" stroke="#475569" strokeWidth="2" opacity="0.4" />

                  {/* النابض المرن مجهرياً */}
                  <path
                    d={generateSpringPath(visualLength)}
                    fill="none"
                    stroke="#a5b4fc"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-75"
                  />

                  {/* ثقل الحمل المشدود (Cargo Body) */}
                  <g transform={`translate(${15 + visualLength}, 50)`} className="transition-all duration-75">
                    {/* الصندوق الثقيل */}
                    <rect x="0" y="0" width="60" height="60" rx="6" fill="#f97316" stroke="#ea580c" strokeWidth="2" />
                    {/* تفاصيل الحاوية */}
                    <line x1="5" y1="5" x2="55" y2="55" stroke="#ea580c" strokeWidth="1.5" opacity="0.3" />
                    <line x1="55" y1="5" x2="5" y2="55" stroke="#ea580c" strokeWidth="1.5" opacity="0.3" />
                    
                    <text x="30" y="35" textAnchor="middle" fill="#ffffff" fontWeight="bold" fontSize="9">
                      {force > 0 ? "شد ميكانيكي" : "ثابت"}
                    </text>
                    
                    {/* سهم ناقل القوة للشد (ق المؤثرة - لليمين) */}
                    {force > 0 && (
                      <g transform={`translate(62, 30)`}>
                        <line x1="0" y1="0" x2={Math.min(100, force * 0.8)} y2="0" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrow)" />
                        <path d={`M ${Math.min(100, force * 0.8) - 5} -5 L ${Math.min(100, force * 0.8)} 0 L ${Math.min(100, force * 0.8) - 5} 5`} fill="none" stroke="#10b981" strokeWidth="3" />
                        <text x="10" y="-8" fill="#10b981" fontWeight="bold" fontSize="8">قوة المؤثر (ق)➔</text>
                      </g>
                    )}

                    {/* سهم متجهة قوة العودة الكهروستاتيكية للزنبرك (لليسار) */}
                    {force > 0 && (
                      <g transform={`translate(-2, 30)`}>
                        <line x1="0" y1="0" x2={-Math.min(100, force * 0.8)} y2="0" stroke="#3b82f6" strokeWidth="3" />
                        <path d={`M ${-Math.min(100, force * 0.8) + 5} -5 L ${-Math.min(100, force * 0.8)} 0 L ${-Math.min(100, force * 0.8) + 5} 5`} fill="none" stroke="#3b82f6" strokeWidth="3" />
                        <text x={-20} y="-8" textAnchor="end" fill="#3b82f6" fontWeight="bold" fontSize="8">⬅ قوة الإرجاع (ق_ز)</text>
                      </g>
                    )}
                  </g>

                </svg>
              </div>

              {/* المسطرة ومستوى الترقيم */}
              <div className="bg-slate-800 p-2.5 rounded-2xl border border-slate-700/60 leading-none">
                <div className="flex justify-between font-mono text-[9px] text-amber-500 font-bold mb-1">
                  <span>أبعاد الرصد الميكانيكي:</span>
                  <span>خطوة المسطرة الحالية = 0.10 م ورادفة</span>
                </div>
                {/* تمثيل المسطرة الفني */}
                <div className="h-6 w-full border border-slate-600 bg-amber-50/10 rounded overflow-hidden flex items-end select-none">
                  {Array.from({ length: 11 }).map((_, i) => {
                    const meterVal = i * 0.1;
                    return (
                      <div key={i} className="flex-1 flex flex-col justify-end items-center h-full border-r border-slate-600/60 font-mono text-[7px] text-slate-300">
                        <div className="h-2 w-px bg-slate-400"></div>
                        <span className="mb-0.5">{meterVal.toFixed(1)}m</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* بطاقة الشرح والمعادلة التفاعلية */}
            <div className="bg-amber-55/15 border border-amber-200 p-4 rounded-2xl space-y-1.5 leading-relaxed">
              <span className="font-extrabold text-[#9a3412] flex items-center gap-1">
                <Zap size={13} className="animate-bounce" />
                <span>الربط الفيزيائي الجوهري للبيانات:</span>
              </span>
              <p className="text-[11px] text-[#7c2d12] font-semibold">
                عند سحب منزلق القوة ➔ تتزايد المسافة طردياً. ونسبة قسمتهما بانتظام تثبت أن ثابت النابض هـ يظل ثابتاً لنفس المادة طالما كنا تحت سقف حد المرونة. إذا أردت تثبيت قراءات مختلفة بنجاح، اختر رصد القراءة الفورية في ورقة السجل بالتبويب لملئ حقل التجربة وتكامل أركان التعلم!
              </p>
            </div>

          </div>

        </div>
      )}

      {/* ٢. كروت التبويب الثاني: ورقة الأنشطة وسجل البيانات */}
      {currentTab === 'table' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-5">
          <div className="text-center space-y-0.5 max-w-lg mx-auto">
            <h4 className="font-extrabold text-slate-900 text-sm">📋 سجل البيانات الحسابية وورقة معمل المرونة الفردي</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              سجل قراءات القوة (ق) والاستطالة (Δل) من المحاكاة. احسب قيمة ثابت النابض المقابلة <strong className="text-indigo-800">هـ = ق/Δل</strong> لكل محاولة، واملأ الخلايا المبرمجة لتصحيح النتيجة.
            </p>
          </div>

          {/* جدول البيانات المنهجي */}
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs font-semibold select-text min-w-[500px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b">
                  <th className="p-3">المحاولة</th>
                  <th className="p-3">القوة المؤثرة ق (نيوتن)</th>
                  <th className="p-3">الاستطالة الكونية Δل (متر)</th>
                  <th className="p-3">حساب ثابت النابض هـ = ق / Δل (نيوتن/م)</th>
                  <th className="p-3">حالة الرصد</th>
                </tr>
              </thead>
              <tbody>
                {trials.map((trial) => {
                  const isActive = trial.id === activeTrialRow;
                  return (
                    <tr
                      key={trial.id}
                      onClick={() => setActiveTrialRow(trial.id)}
                      className={`border-b transition-all cursor-pointer ${
                        isActive
                          ? 'bg-indigo-50/50 hover:bg-indigo-50/80 border-r-4 border-r-indigo-600'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-3.5 font-bold">
                        {trial.id === 1 ? '❶ الأولى' : trial.id === 2 ? '❷ الثانية' : trial.id === 3 ? '❸ الثالثة' : '❹ الرابعة'}
                        {isActive && <span className="block text-[8px] text-indigo-600">نشط للرصد</span>}
                      </td>
                      <td className="p-3.5">
                        <input
                          type="text"
                          value={trial.force}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTrials(prev => prev.map(t => t.id === trial.id ? { ...t, force: val, isCorrect: null } : t));
                          }}
                          className="w-16 text-center border p-1 rounded font-mono font-bold bg-white"
                        />
                      </td>
                      <td className="p-3.5">
                        <input
                          type="text"
                          value={trial.elongation}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTrials(prev => prev.map(t => t.id === trial.id ? { ...t, elongation: val, isCorrect: null } : t));
                          }}
                          className="w-20 text-center border p-1 rounded font-mono font-bold bg-white"
                        />
                      </td>
                      <td className="p-3.5">
                        <input
                          type="text"
                          placeholder="مثال: 200"
                          value={trial.kUser}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTrials(prev => prev.map(t => t.id === trial.id ? { ...t, kUser: val, isCorrect: null } : t));
                          }}
                          className={`w-24 text-center border p-1 rounded font-mono font-black ${
                            trial.isCorrect === true
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                              : trial.isCorrect === false
                              ? 'bg-orange-50 border-orange-400 text-orange-850'
                              : 'bg-indigo-50/20 border-indigo-200'
                          }`}
                        />
                      </td>
                      <td className="p-3.5 font-bold">
                        {trial.isCorrect === true ? (
                          <span className="text-emerald-700 flex items-center gap-1 justify-center">
                            <CheckCircle size={13} />
                            <span>متقن ومؤكد</span>
                          </span>
                        ) : trial.isCorrect === false ? (
                          <span className="text-[#ea580c] flex items-center gap-1 justify-center">
                            <XCircle size={13} />
                            <span>خلل ميكانيكي</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">قيد الحساب</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* لوحة التحكم والتحقق للجدول */}
          <div className="flex gap-4 justify-end pt-3 leading-none">
            <button
              onClick={resetTable}
              className="py-2.5 px-5 bg-slate-100 border border-slate-300 hover:bg-slate-200 font-extrabold text-slate-700 rounded-2xl transition-all cursor-pointer"
            >
              🔄 تصفير السجل
            </button>
            <button
              onClick={checkTableAnswers}
              className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-705 text-white font-black rounded-2xl transition-all shadow-sm cursor-pointer"
            >
              ✅ تحقق من حسابات ثابت النابض هـ
            </button>
          </div>

          {/* صندوق الردود والتنبيه المنهجي */}
          {tableFeedback && (
            <div className={`p-4 rounded-2xl text-xs font-semibold leading-relaxed border ${
              tableSubmitted && trials.every(t => t.isCorrect === true)
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-orange-50 text-orange-900 border-orange-200'
            }`}>
              {tableFeedback}
            </div>
          )}

        </div>
      )}

      {/* ٣. كروت التبويب الثالث: آلة حاسبة مستقلة */}
      {currentTab === 'calculator' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-6">
          <div className="text-center space-y-0.5 max-w-md mx-auto">
            <h4 className="font-extrabold text-indigo-900 text-sm">🧮 حاسبة قانون هوك الميكانيكية الشاملة</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              اختر المتطلب الميكانيكي المناسب للاحتساب من القائمة، وأدخل المعطيات، لمطابقة الحل وتأكيد الخطوات.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 leading-normal text-xs font-semibold">
            
            {/* إعدادات القوى والمعامِلات */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-4">
              <span className="font-extrabold text-xs text-slate-800 block border-b pb-2">🎛️ مدخلات التجربة الحاسوبية:</span>
              
              {/* الاختيار الفعلي للعماد المستهدف */}
              <div className="space-y-1.5">
                <label className="text-slate-500 text-[11px] block">🔍 حدد العنصر المراد حسابه من علاقة هوك:</label>
                <select
                  value={calcTarget}
                  onChange={(e) => setCalcTarget(e.target.value as any)}
                  className="w-full bg-white border border-slate-350 p-2.5 rounded-xl font-bold text-slate-800 block"
                >
                  <option value="force">المتطلب: حساب القوة المؤثرة (ق = هـ × Δل)</option>
                  <option value="k">المتطلب: حساب ثابت النابض (هـ = ق / Δل)</option>
                  <option value="elongation">المتطلب: حساب طول الاستطالة الحادثة (Δل = ق / هـ)</option>
                </select>
              </div>

              {/* الخلايا المتاحة للإدخال بناء على الاختيار */}
              {calcTarget !== 'force' && (
                <div className="space-y-1">
                  <span className="text-slate-600 font-bold block">القوة ق المؤثرة (نيوتن):</span>
                  <input
                    type="number"
                    value={inputForce}
                    onChange={(e) => setInputForce(e.target.value)}
                    className="w-full p-2 border rounded-xl font-mono font-bold bg-white"
                  />
                </div>
              )}

              {calcTarget !== 'k' && (
                <div className="space-y-1">
                  <span className="text-slate-600 font-bold block">ثابت النابض هـ المعياري (نيوتن/م):</span>
                  <input
                    type="number"
                    value={inputK}
                    onChange={(e) => setInputK(e.target.value)}
                    className="w-full p-2 border rounded-xl font-mono font-bold bg-white"
                  />
                </div>
              )}

              {calcTarget !== 'elongation' && (
                <div className="space-y-1">
                  <span className="text-slate-600 font-bold block">مقدار الاستطالة الإزاحية Δل (متر):</span>
                  <input
                    type="number"
                    value={inputElongation}
                    onChange={(e) => setInputElongation(e.target.value)}
                    className="w-full p-2 border rounded-xl font-mono font-bold bg-white"
                  />
                </div>
              )}

            </div>

            {/* تفاصيل المخرج والحل المتوقع */}
            <div className="p-5 bg-indigo-55/10 border border-indigo-100 rounded-3xl flex flex-col justify-between space-y-4">
              <span className="font-extrabold text-xs text-indigo-950 block border-b pb-2">🎯 بطاقة الخطوات والمطالعة المنهجية:</span>
              
              <div className="space-y-2 flex-grow flex flex-col justify-center text-center">
                <span className="text-xs text-slate-500 font-semibold block">المخرجات والقيمة المحصودة علمياً:</span>
                <strong className="text-2xl md:text-3xl font-mono text-indigo-700 block font-black border-y border-dashed py-3 my-2">
                  {calcResult} {calcTarget === 'force' ? 'N (نيوتن)' : calcTarget === 'k' ? 'N/m (ن/م)' : 'm (متر)'}
                </strong>
                
                {/* شرح مظهر الصيغة العلمية المطبقة */}
                <div className="p-3 bg-white border rounded-2xl text-[10px] text-slate-600 font-bold space-y-1 text-right">
                  <span className="text-indigo-900 block font-black">⚙️ المعادلة والتحليل الميكانيكي المستعمل:</span>
                  {calcTarget === 'force' ? (
                    <p>المعادلة: ق = هـ × Δل<br />نعرف القوة بضرب صلابة النابض {inputK} ن/م في نسبة زحفه {inputElongation} م.</p>
                  ) : calcTarget === 'k' ? (
                    <p>المعادلة: هـ = ق / Δل<br />نعرف الصلابة بقسمة قوة الشد {inputForce} ن على تمدد السلك {inputElongation} م.</p>
                  ) : (
                    <p>المعادلة: Δل = ق / هـ<br />نعرف الاستطالة بقسمة قوة الثقل {inputForce} ن على ثبات الجسم {inputK} ن/م.</p>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// ==========================================
// 12. مختبر خواص المرونة للأجسام الصلبة (الدرس السادس عشر)
// ==========================================
export function ElasticityLab({ onComplete }: LabProps) {
  const [currentTab, setCurrentTab] = useState<'simulator' | 'table' | 'calculator'>('simulator');
  const [mass, setMass] = useState<number>(10); // 0 to 200 kg
  const [material, setMaterial] = useState<'steel' | 'copper' | 'aluminum' | 'rubber' | 'custom'>('steel');
  const [customY, setCustomY] = useState<string>('200000000000'); // Custom Young's modulus in Pa
  const [originalLength, setOriginalLength] = useState<number>(2.0); // 0.5 to 5.0 meters
  const [area, setArea] = useState<number>(1e-6); // Cross-sectional area in m^2 (1 mm^2 default)
  
  const g = 9.81; // standard gravity

  // Material properties database
  const materialProps = {
    steel: { label: "⚙️ فولاذ كربوني صهر", y: 2e11, color: "bg-slate-400" },
    copper: { label: "🎗️ نحاس أحمر نقي", y: 1.1e11, color: "bg-amber-600" },
    aluminum: { label: "⛓️ ألومنيوم مرن", y: 7e10, color: "bg-indigo-300" },
    rubber: { label: "🪵 مطاط فلكني", y: 5e6, color: "bg-orange-800" },
    custom: { label: "🔮 مادة مخصصة عشوائية", y: 2e11, color: "bg-emerald-600" }
  };

  const getYoungValue = () => {
    if (material === 'custom') {
      const parsed = parseFloat(customY);
      return isNaN(parsed) || parsed <= 0 ? 2e11 : parsed;
    }
    return materialProps[material].y;
  };

  const youngModulus = getYoungValue();
  const force = mass * g; // Tension Force in Newtons
  const stress = area > 0 ? force / area : 0; // σ = F / A
  const strain = youngModulus > 0 ? stress / youngModulus : 0; // ε = σ / Y
  const elongation = originalLength * strain; // ΔL = L * ε
  const newLength = originalLength + elongation;

  // Table trials for student validation
  const [trials, setTrials] = useState<Array<{
    id: number;
    force: string;
    area: string;
    yVal: string;
    origLen: string;
    userElongation: string;
    isCorrect: boolean | null;
  }>>([
    { id: 1, force: '98.1', area: '1.0e-6', yVal: '2.0e11', origLen: '2.0', userElongation: '', isCorrect: null },
    { id: 2, force: '196.2', area: '1.0e-6', yVal: '1.1e11', origLen: '1.5', userElongation: '', isCorrect: null },
    { id: 3, force: '49.0', area: '2.0e-6', yVal: '7.0e10', origLen: '3.0', userElongation: '', isCorrect: null },
  ]);

  const [activeTrialRow, setActiveTrialRow] = useState<number>(1);
  const [tableSubmitted, setTableSubmitted] = useState<boolean>(false);
  const [tableFeedback, setTableFeedback] = useState<string>('');

  // Physics calculator solver states
  const [calcTarget, setCalcTarget] = useState<'stress' | 'strain' | 'young' | 'elongation'>('stress');
  const [inputForce, setInputForce] = useState<string>('100');
  const [inputArea, setInputArea] = useState<string>('1.0e-6');
  const [inputElongation, setInputElongation] = useState<string>('0.001');
  const [inputOrigLength, setInputOrigLength] = useState<string>('2.0');
  const [calcResult, setCalcResult] = useState<string>('');

  useEffect(() => {
    const f = parseFloat(inputForce);
    const a = parseFloat(inputArea);
    const dl = parseFloat(inputElongation);
    const l = parseFloat(inputOrigLength);

    if (calcTarget === 'stress') {
      if (!isNaN(f) && !isNaN(a) && a > 0) {
        setCalcResult((f / a).toExponential(3));
      } else {
        setCalcResult('---');
      }
    } else if (calcTarget === 'strain') {
      if (!isNaN(dl) && !isNaN(l) && l > 0) {
        setCalcResult((dl / l).toExponential(3));
      } else {
        setCalcResult('---');
      }
    } else if (calcTarget === 'young') {
      if (!isNaN(f) && !isNaN(a) && !isNaN(dl) && !isNaN(l) && a > 0 && dl > 0) {
        const calculatedStress = f / a;
        const calculatedStrain = dl / l;
        setCalcResult((calculatedStress / calculatedStrain).toExponential(3));
      } else {
        setCalcResult('---');
      }
    } else if (calcTarget === 'elongation') {
      const parsedY = material === 'custom' ? parseFloat(customY) : materialProps[material].y;
      if (!isNaN(f) && !isNaN(l) && !isNaN(a) && a > 0 && parsedY > 0) {
        setCalcResult(((f * l) / (a * parsedY)).toExponential(4));
      } else {
        setCalcResult('---');
      }
    }
  }, [calcTarget, inputForce, inputArea, inputElongation, inputOrigLength, material, customY]);

  const handleCheckTrial = (id: number) => {
    const row = trials.find(t => t.id === id);
    if (!row) return;

    const f = parseFloat(row.force);
    const a = parseFloat(row.area);
    const yVal = parseFloat(row.yVal);
    const origL = parseFloat(row.origLen);
    const userVal = parseFloat(row.userElongation);

    // ΔL = (F * L) / (A * Y)
    const exactElongation = (f * origL) / (a * yVal);
    
    // Check with 5% margin of error
    const diff = Math.abs(exactElongation - userVal) / exactElongation;
    const isCorrect = !isNaN(userVal) && diff < 0.05;

    setTrials(prev => prev.map(t => t.id === id ? { ...t, isCorrect } : t));

    if (isCorrect) {
      if (id < trials.length) {
        setActiveTrialRow(id + 1);
        setTableFeedback(`✅ رائع! القيمة المدونة للصف ${id} صحيحة ومقنعة للغاية ميكانيكياً.`);
      } else {
        setTableSubmitted(true);
        setTableFeedback("🎉 مبروك! قمت بالتحقق الكامل من كافة قيم الاستطالة ميكانيكياً ورسم بنية اتزان المرونة بالمنصة!");
        if (onComplete) onComplete(100, "lesson_16_elasticity");
      }
    } else {
      setTableFeedback("❌ القيمة المحسوبة غير متسقة! تذكر المعادلة: الاستطالة Δل = (القوة × الطول الأصلي) ÷ (المساحة × معامل يونج).");
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-right p-3 md:p-6 space-y-6 select-none font-sans">
      
      {/* الهيدر والعنوان الأنيق للمختبر */}
      <div className="bg-gradient-to-r from-teal-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 bg-white/5 w-60 h-60 rounded-full blur-2xl transform -translate-x-12 -translate-y-12"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5Packed">
            <span className="bg-teal-400/20 text-teal-300 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-teal-400/20 inline-block">
              🧪 مختبر محاكاة الفيزياء الطولية
            </span>
            <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
              <Beaker className="text-teal-400" size={24} />
              <span>مختبر خواص المرونة: الإجهاد، الانفعال، ومعامل يونج</span>
            </h1>
            <p className="text-xs text-indigo-200/90 max-w-xl font-medium leading-relaxed leading-medium">
              محاكي متقدم لتقدير سلوك الأسلاك الصلبة تحت تأثير قوى الشد المرتكزة، وفك شيفرة معامل يونج الهندسي للمواد.
            </p>
          </div>
          <div className="flex gap-2">
            {onComplete && (
              <button
                onClick={() => onComplete(100, "lesson_16_elasticity")}
                className="bg-emerald-55 bg-emerald-600 hover:bg-emerald-205 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <CheckCircle size={15} />
                <span>إثبات وإنهاء رصيد المختبر</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* تبويبات الانتقال بين الشاشات للمختبر */}
      <div className="bg-white rounded-2xl p-1.5 flex gap-1 shadow-sm border border-slate-100 max-w-md">
        <button
          onClick={() => setCurrentTab('simulator')}
          className={`flex-1 text-center py-2 px-3 rounded-xl font-bold text-xs cursor-pointer transition-all ${
            currentTab === 'simulator' 
              ? 'bg-indigo-950 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🎮 المحاكي التفاعلي
        </button>
        <button
          onClick={() => setCurrentTab('table')}
          className={`flex-1 text-center py-2 px-3 rounded-xl font-bold text-xs cursor-pointer transition-all ${
            currentTab === 'table' 
              ? 'bg-indigo-950 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📊 رصد وتحليل البيانات
        </button>
        <button
          onClick={() => setCurrentTab('calculator')}
          className={`flex-1 text-center py-2 px-3 rounded-xl font-bold text-xs cursor-pointer transition-all ${
            currentTab === 'calculator' 
              ? 'bg-indigo-950 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🧮 حاسبة المرونة المباشرة
        </button>
      </div>

      {/* 1. التبويب الأول: المحاكي التفاعلي */}
      {currentTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* العمود الأول: تمثيل السلك البصري تحت الشد الميكانيكي */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-150 p-5 shadow-sm flex flex-col items-center justify-between space-y-4">
            <div className="w-full border-b pb-2 text-center">
              <span className="font-extrabold text-slate-800 text-xs flex justify-center items-center gap-1">
                <Target className="text-indigo-650" size={15} />
                <span>الرسم التخطيطي للسلك والآثار الحاصلة:</span>
              </span>
            </div>

            {/* سياق التثبيت */}
            <div className="w-full max-w-[180px] bg-slate-50 border rounded-2xl p-4 flex flex-col items-center">
              <div className="w-full h-8 bg-slate-800 rounded-t-xl text-center text-white font-extrabold text-[10px] leading-8">
                سقف تثبيت صب
              </div>
              
              {/* السلك التفاعلي */}
              <div className="relative w-12 bg-slate-150 flex flex-col items-center justify-start border-x border-slate-300" style={{ height: '240px' }}>
                {/* السلك النحيف */}
                <div 
                  className={`w-1.5 transition-all duration-300 ${materialProps[material].color}`}
                  style={{ 
                    height: `${Math.min(95 * (1 + strain * 50), 220)}px`,
                    opacity: 0.95
                  }}
                ></div>
                {/* خطاف التعليق */}
                <div className="w-6 h-6 border-4 border-slate-600 rounded-full flex items-center justify-center bg-white transform -translate-y-1 shadow-sm">
                  <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                </div>
                {/* الكتلة المعلقة */}
                {mass > 0 && (
                  <div 
                    className="w-24 bg-slate-900 border-2 border-slate-700 text-center text-white rounded-2xl py-2 px-1 text-[11px] font-mono font-bold shadow-md animate-pulse shrink-0 transform -translate-y-2"
                  >
                    <span className="block text-amber-400 font-extrabold text-[10px]">{mass.toFixed(1)} كجم</span>
                    <span className="block text-[9px] text-slate-300 opacity-90">({force.toFixed(1)} N)</span>
                  </div>
                )}
              </div>
            </div>

            {/* منزلقات وأزرار تحريك الكتل لزيادة إجهاد السلك */}
            <div className="w-full space-y-3 pt-3 border-t">
              <div className="flex justify-between items-center text-xs text-slate-700 font-bold">
                <span>🪨 تغيير كتلة الثقل المعلق:</span>
                <span className="text-indigo-800 font-mono font-black">{mass.toFixed(1)} كجم</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMass(prev => Math.max(0, prev - 10))}
                  className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black rounded-xl cursor-pointer text-lg transition-all"
                >
                  -
                </button>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={mass}
                  onChange={(e) => setMass(parseFloat(e.target.value))}
                  className="flex-1 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setMass(prev => Math.min(200, prev + 10))}
                  className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black rounded-xl cursor-pointer text-lg transition-all"
                >
                  +
                </button>
              </div>
            </div>

          </div>

          {/* العمود الثاني: لوحة الإعداد والتحكم والنتائج الرياضية الدقيقة للرصد */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-150 p-5 shadow-sm space-y-5">
            <span className="font-extrabold text-slate-850 text-xs block border-b pb-2 text-indigo-950">
              ⚙️ لوحة المعلمات المتكاملة وحسابات المرونة المستمرة:
            </span>

            {/* صف التهيئة والبيانات الفنية الفولاذية والفيزيائية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* معامل يونغ مادة السلك */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-655 font-bold block">🛡️ معدن مادة السلك المرن:</label>
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold font-semibold"
                >
                  {Object.entries(materialProps).map(([key, item]) => (
                    <option key={key} value={key}>{item.label}</option>
                  ))}
                </select>
              </div>

              {/* معامل يونغ مخصص */}
              {material === 'custom' && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-xs text-slate-655 font-bold block">🔮 قيمة معامل يونج المخصصة (Pa):</label>
                  <input
                    type="text"
                    value={customY}
                    onChange={(e) => setCustomY(e.target.value)}
                    placeholder="2.0e11"
                    className="w-full p-2.5 border rounded-xl font-mono text-xs font-bold bg-slate-50 border-slate-200"
                  />
                </div>
              )}

              {/* الطول الأصلي للسلك */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-655 font-bold block">📏 الطول الأصلي للسلك (متر):</label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.5"
                    value={originalLength}
                    onChange={(e) => setOriginalLength(parseFloat(e.target.value))}
                    className="flex-1 cursor-pointer"
                  />
                  <span className="font-mono text-xs font-extrabold text-indigo-950 shrink-0 w-12 text-left">{originalLength.toFixed(1)} م</span>
                </div>
              </div>

              {/* مساحة مقطع السلك */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-655 font-bold block">📐 مساحة المقطع العرضي للسلك (م²):</label>
                <select
                  value={area}
                  onChange={(e) => setArea(parseFloat(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold"
                >
                  <option value="5e-7">سلك رفيع مقطع (0.5 مم²) = 5×10⁻⁷ م²</option>
                  <option value="1e-6">سلك معياري مقطع (1.0 مم²) = 1×10⁻⁶ م²</option>
                  <option value="2e-6">سلك غليظ مقطع (2.0 مم²) = 2×10⁻⁶ م²</option>
                  <option value="5e-6">كابل قوي مقطع (5.0 مم²) = 5×10⁻⁶ م²</option>
                </select>
              </div>

            </div>

            {/* سياق لوحة النتائج المعروضة للرصد الفوقي والدراسات */}
            <div className="p-5 bg-slate-900 text-white rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-700">
              
              <div className="space-y-1 text-right">
                <span className="text-[10px] text-slate-400 block font-bold">قوة الشد الناتجة عن الوزن (F):</span>
                <strong className="text-lg font-mono text-amber-400 font-extrabold block">{force.toFixed(2)} N (نيوتن)</strong>
                <span className="text-[9px] text-slate-400 block font-semibold leading-relaxed">المعادلة: الوزن = الكتلة ({mass.toFixed(1)} كجم) × الجاذبية ({g.toFixed(2)})</span>
              </div>

              <div className="space-y-1 text-right">
                <span className="text-[10px] text-slate-400 block font-bold">الإجهاد الميكانيكي الحاصل لساق السلك (σ):</span>
                <strong className="text-lg font-mono text-teal-400 font-extrabold block">{stress.toExponential(3)} Pa (باسكال)</strong>
                <span className="text-[9px] text-slate-400 block font-semibold leading-relaxed">المعادلة: الإجهاد = القوة ÷ مساحة المقطع ({area.toExponential(1)} م²)</span>
              </div>

              <div className="space-y-1 text-right border-t border-slate-800 pt-3">
                <span className="text-[10px] text-slate-400 block font-bold">الانفعال المتولد نسبيّاً (ε):</span>
                <strong className="text-lg font-mono text-indigo-300 font-extrabold block">{strain.toExponential(4)}</strong>
                <span className="text-[9px] text-slate-400 block font-semibold leading-relaxed">الانفعال = الإجهاد ÷ معامل المرونة (بلا وحدة)</span>
              </div>

              <div className="space-y-1 text-right border-t border-slate-800 pt-3">
                <span className="text-[10px] text-slate-400 block font-bold">الاستطالة الطولية التشوهية المحدثة (Δل):</span>
                <strong className="text-lg font-mono text-rose-400 font-extrabold block">{elongation.toExponential(4)} م</strong>
                <span className="text-[9px] text-slate-400 block font-semibold leading-relaxed">الاستطالة = الطول الأصلي ({originalLength.toFixed(1)}م) × الانفعال</span>
              </div>

              <div className="col-span-1 md:col-span-2 bg-slate-800/80 p-3 rounded-2xl text-center border border-slate-700/50 mt-1">
                <span className="text-[10px] text-slate-300 block font-extrabold mb-1">📏 الطول الإجمالي الجديد بعد تأثير قوة الشد:</span>
                <strong className="text-xl font-mono text-emerald-400 tracking-wider font-extrabold">{newLength.toFixed(4)} متر</strong>
              </div>

            </div>

            {/* بطاقة الملاحظات العلمية المنطقية */}
            <div className="bg-amber-50 border-r-4 border-amber-600 rounded-2xl p-4 space-y-1 text-xs text-amber-950 font-bold leading-relaxed shadow-sm">
              <span className="text-amber-900 block font-black">💡 مبرهنات هامة من الأستاذ سياف:</span>
              <ul className="list-disc list-inside space-y-1 font-semibold text-[11px] leading-relaxed leading-medium">
                <li>معامل يونج هو مقياس ثبات وبنية الذرات للمادة الصلبة؛ كلما زادت الروابط الذرية تماسكاً ارتفع العامل.</li>
                <li>المطاط فلكني يملك معامل يونج متدني للغاية لأنه ذو سلاسل مرنة تتشوه بنسب طائلة بإشعال إجهاد بسيط.</li>
                <li>تظل قوانين هوك قائمة بانتساب طردي خطي حصراً ما دامت قوة الشد المؤثرة مخترقة لحدود منطقة المرونة الآمنة.</li>
              </ul>
            </div>

          </div>

        </div>
      )}

      {/* 2. التبويب الثاني: جدول رصد وتحقق البيانات وتحصيل النتائج */}
      {currentTab === 'table' && (
        <div className="bg-white rounded-3xl border border-slate-150 p-5 shadow-sm space-y-6">
          <div className="border-b pb-3 text-right">
            <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
              <Activity className="text-indigo-650 animate-pulse" size={16} />
              <span>جدول البيانات التجريبية - رصد استطالة الأسلاك المعدنية:</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              قم بحساب قيمة الاستطالة المتولدة (Δل) في كل حالة مستعيناً بالبيانات والأبعاد المعطاة أدناه، ودون الإجابة للتحقق.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-indigo-950 text-white font-bold text-[10px] md:text-xs">
                  <th className="p-3">رقم الفحص</th>
                  <th className="p-3">قوة السحب الشد (N)</th>
                  <th className="p-3">مساحة المقطع (م²)</th>
                  <th className="p-3">معامل يونج (Pa)</th>
                  <th className="p-3">الطول الأصلي (م)</th>
                  <th className="p-3">الاستطالة المتوقعة (Δل) م</th>
                  <th className="p-3">التحقق</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold">
                {trials.map((trial) => {
                  const isActive = activeTrialRow === trial.id && !tableSubmitted;
                  return (
                    <tr 
                      key={trial.id} 
                      className={`border-b transition-all ${
                        isActive 
                          ? 'bg-amber-50/70 shadow-sm border-amber-200' 
                          : trial.isCorrect === true 
                            ? 'bg-emerald-50/20' 
                            : 'bg-white'
                      }`}
                    >
                      <td className="p-3 font-bold text-slate-650">{trial.id}</td>
                      <td className="p-3 font-mono font-bold text-slate-800">{trial.force} N</td>
                      <td className="p-3 font-mono text-slate-500">{trial.area}</td>
                      <td className="p-3 font-mono text-indigo-900 font-bold">{trial.yVal}</td>
                      <td className="p-3 font-mono text-slate-650">{trial.origLen} م</td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={trial.userElongation}
                          disabled={!isActive || tableSubmitted}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTrials(prev => prev.map(t => t.id === trial.id ? { ...t, userElongation: val } : t));
                          }}
                          placeholder="مثال: 0.00098"
                          className="w-full max-w-[150px] p-2 border rounded-xl text-center font-mono text-xs font-bold bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </td>
                      <td className="p-3 flex justify-center items-center gap-1.5">
                        {trial.isCorrect === true ? (
                          <span className="text-emerald-600 font-black text-xs flex items-center gap-1">
                            <Check size={14} /> مقبولة
                          </span>
                        ) : trial.isCorrect === false ? (
                          <span className="text-rose-600 font-black text-xs">⚠️ أعد الحساب</span>
                        ) : (
                          <button
                            type="button"
                            disabled={!isActive || tableSubmitted}
                            onClick={() => handleCheckTrial(trial.id)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-[10px] cursor-pointer shadow-sm transition-all ${
                              isActive 
                                ? 'bg-indigo-900 hover:bg-slate-900 text-white' 
                                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                            }`}
                          >
                            تثبيت الحساب
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* التغذية الراجعة لمتابعة حل الجدول */}
          {tableFeedback && (
            <div className={`p-4 rounded-2xl text-xs font-extrabold text-right border ${
              tableSubmitted 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm' 
                : 'bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}>
              {tableFeedback}
            </div>
          )}

          {/* الملحوظة الرياضية لكيفية استقصاء الحل للطلاب */}
          <div className="p-4 bg-slate-950 text-emerald-400 rounded-3xl font-mono text-[9px] md:text-xs">
            <span className="text-slate-200 block font-semibold mb-1">📐 كيفية استقصاء وتتبع حل المتغيرات بالمعادلة:</span>
            <p>1- لحساب الاستطالة (Δل) نطبق قانون المرونة: Δل = (القوة × الطول الأصلي) ÷ (المساحة × معامل يونج).</p>
            <p>2- في الصف الأول للجدول: Δل = (98.1 × 2.0) ÷ (10⁻⁶ × 2×10¹¹) = 196.2 ÷ 200,000 = 0.000981 م.</p>
          </div>

        </div>
      )}

      {/* 3. التبويب الثالث: الآلة الحاسبة الفيزيائية لتشوه الأسلاك */}
      {currentTab === 'calculator' && (
        <div className="bg-white rounded-3xl border border-slate-150 p-5 shadow-sm space-y-6">
          <div className="border-b pb-3 text-right">
            <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
              <Zap className="text-indigo-650" size={16} />
              <span>الحاسبة والبرهان الرياضي الفوري لخلاصة السلك والضغط الطولي:</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              اختر المخرج الفيزيائي ليتولى المحاكي حساب القانون تلقائيّاً وعرض التغذية المفهمومية لخطوات البرهان.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* واجهة إدخال المعطيات */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-750 font-bold block">🎯 حساب المستهدف:</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    onClick={() => setCalcTarget('stress')}
                    className={`py-2 px-3 border-2 text-[10px] md:text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      calcTarget === 'stress' 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-extrabold shadow-sm' 
                        : 'border-slate-100 hover:border-slate-200 text-slate-600 bg-white'
                    }`}
                  >
                    الإجهاد (σ)
                  </button>
                  <button
                    onClick={() => setCalcTarget('strain')}
                    className={`py-2 px-3 border-2 text-[10px] md:text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      calcTarget === 'strain' 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-extrabold shadow-sm' 
                        : 'border-slate-100 hover:border-slate-200 text-slate-600 bg-white'
                    }`}
                  >
                    الانفعال (ε)
                  </button>
                  <button
                    onClick={() => setCalcTarget('young')}
                    className={`py-2 px-3 border-2 text-[10px] md:text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      calcTarget === 'young' 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-extrabold shadow-sm' 
                        : 'border-slate-100 hover:border-slate-200 text-slate-600 bg-white'
                    }`}
                  >
                    معامل يونج (Y)
                  </button>
                  <button
                    onClick={() => setCalcTarget('elongation')}
                    className={`py-2 px-3 border-2 text-[10px] md:text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      calcTarget === 'elongation' 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-extrabold shadow-sm' 
                        : 'border-slate-100 hover:border-slate-200 text-slate-600 bg-white'
                    }`}
                  >
                    الاستطالة (Δل)
                  </button>
                </div>
              </div>

              {/* صفوف الإدخال المتعددة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {calcTarget !== 'strain' && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-600 font-bold block">القوة المؤثرة العمودية (F) N:</label>
                    <input
                      type="number"
                      value={inputForce}
                      onChange={(e) => setInputForce(e.target.value)}
                      className="w-full p-2.5 border rounded-xl font-mono text-xs font-bold bg-white"
                    />
                  </div>
                )}

                {calcTarget !== 'strain' && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-600 font-bold block">مساحة مقطع السلك (A) م²:</label>
                    <input
                      type="text"
                      value={inputArea}
                      onChange={(e) => setInputArea(e.target.value)}
                      className="w-full p-2.5 border rounded-xl font-mono text-xs font-bold bg-white"
                    />
                  </div>
                )}

                {calcTarget !== 'stress' && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-600 font-bold block">الاستطالة الحاصلة (ΔL) متر:</label>
                    <input
                      type="text"
                      value={inputElongation}
                      onChange={(e) => setInputElongation(e.target.value)}
                      className="w-full p-2.5 border rounded-xl font-mono text-xs font-bold bg-white"
                    />
                  </div>
                )}

                {calcTarget !== 'stress' && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-600 font-bold block">الطول الأصلي للسلك (L) متر:</label>
                    <input
                      type="number"
                      value={inputOrigLength}
                      onChange={(e) => setInputOrigLength(e.target.value)}
                      className="w-full p-2.5 border rounded-xl font-mono text-xs font-bold bg-white"
                    />
                  </div>
                )}

              </div>
            </div>

            {/* بطاقة عرض النتائج والتحاليل المفاهيمية */}
            <div className="lg:col-span-5 bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100 flex flex-col justify-between space-y-4">
              <span className="font-extrabold text-xs text-indigo-950 block border-b pb-2">🎯 بطاقة الخطوات والتحليل المهني الممنهج:</span>
              
              <div className="space-y-2 flex-grow flex flex-col justify-center text-center">
                <span className="text-xs text-slate-500 font-bold block">القيمة المحسوبة فوريّاً:</span>
                <strong className="text-xl md:text-2xl font-mono text-indigo-700 block font-black border-y border-dashed py-3 my-2 bg-white rounded-2xl shadow-sm">
                  {calcResult} {calcTarget === 'stress' || calcTarget === 'young' ? 'Pa (باسكال)' : calcTarget === 'elongation' ? 'm (متر)' : '(بلا وحدة)'}
                </strong>
                
                {/* تفاصيل الصيغة العلمية المستغلة كصرح علمي مبرهن بمفاهيم دقيقة */}
                <div className="p-3 bg-white border border-slate-100 rounded-2xl text-[10px] text-slate-650 font-bold space-y-1.5 text-right">
                  <span className="text-indigo-950 block font-black">⚙️ المعادلة الحسابية المنقحة:</span>
                  {calcTarget === 'stress' ? (
                    <p>صيغة الإجهاد: الإجهاد = القوة ÷ مساحة المقطع<br />حيث تم قسمة القوة {inputForce}N على مساحة السلك {inputArea}م² لتكوين الإجهاد بالباسكال.</p>
                  ) : calcTarget === 'strain' ? (
                    <p>صيغة الانفعال: الانفعال = الاستطالة ÷ الطول الأصلي<br />حيث يتم تتبع التشوه المحدث بقسمة {inputElongation}م على طول السلك الأصلي {inputOrigLength}م.</p>
                  ) : calcTarget === 'young' ? (
                    <p>معادلة المرونة: معامل يونج = الإجهاد / الانفعال = (F×L) / (A×ΔL)<br />فتم تقدير النسبة الكلية لجسيمات المعدن باستغلال المتغيرات المودعة.</p>
                  ) : (
                    <p>استقصاء الاستطالة: Δل = (F×L) ÷ (A×Y)<br />فتبعت الاستطالة مباشرة باستثمار الأبعاد ونسبة صلابة ونوعية مادة المعدن.</p>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// ==========================================
// 13. مختبر الخاصية الشعرية وتأثير التماسك والتلاصق (الدرس السابع عشر)
// ==========================================
export function CapillaryLab({ onComplete }: LabProps) {
  const [currentTab, setCurrentTab] = useState<'simulator' | 'table' | 'calculator'>('simulator');
  const [liquid, setLiquid] = useState<'water' | 'mercury' | 'ethanol' | 'custom'>('water');
  
  // Fluid states
  const [customRho, setCustomRho] = useState<string>('1000');
  const [customGamma, setCustomGamma] = useState<string>('0.073');
  const [customAngle, setCustomAngle] = useState<string>('0');
  const [radius, setRadius] = useState<number>(0.5); // 0.1 to 5.0 mm

  const g = 9.81;

  // Fluid profiles
  const liquidsConfig = {
    water: { label: "💧 سائل ماء نقي (زجاجي مقعر)", rho: 1000, gamma: 0.073, angle: 0, color: "#2563eb" },
    mercury: { label: "🏐 زئبق فضي (زجاجي محدب)", rho: 13546, gamma: 0.465, angle: 140, color: "#64748b" },
    ethanol: { label: "🧪 كحول إيثيلي (زجاجي مقعر)", rho: 789, gamma: 0.022, angle: 0, color: "#0d9488" },
    custom: { label: "🔮 مائع مخصص إضافي", rho: 1000, gamma: 0.073, angle: 0, color: "#7c3aed" }
  };

  const getFluidParams = () => {
    if (liquid === 'custom') {
      const rho = parseFloat(customRho) || 1000;
      const gamma = parseFloat(customGamma) || 0.073;
      const angle = parseFloat(customAngle) || 0;
      return { rho, gamma, angle, color: liquidsConfig.custom.color };
    }
    return liquidsConfig[liquid];
  };

  const { rho, gamma, angle, color } = getFluidParams();
  const radMeter = (radius / 1000); // converting mm to m
  const cosTheta = Math.cos((angle * Math.PI) / 180);
  
  // Height in meters: h = (2 * gamma * cos(theta)) / (rho * g * r)
  const height = (rho > 0 && radMeter > 0) ? (2 * gamma * cosTheta) / (rho * g * radMeter) : 0;

  // Custom recorded scatter points
  const [points, setPoints] = useState<Array<{ r: number; h: number }>>([]);

  const addCurrentPoint = () => {
    // Avoid duplicate points
    if (points.some(p => Math.abs(p.r - radius) < 1e-4 && Math.abs(p.h - height) < 1e-6)) return;
    setPoints(prev => [...prev, { r: radius, h: height }].sort((a, b) => a.r - b.r));
  };

  const clearGraphPoints = () => {
    setPoints([]);
  };

  // Student trials for validation tab
  const [trials, setTrials] = useState<Array<{
    id: number;
    liquidLabel: string;
    rho: number;
    gamma: number;
    angle: number;
    r_mm: number;
    userHeight: string;
    isCorrect: boolean | null;
  }>>([
    { id: 1, liquidLabel: "الماء النقي (نق = 0.5 مم)", rho: 1000, gamma: 0.073, angle: 0, r_mm: 0.5, userHeight: '', isCorrect: null },
    { id: 2, liquidLabel: "الزئبق الفضي (نق = 1.0 مم)", rho: 13546, gamma: 0.465, angle: 140, r_mm: 1.0, userHeight: '', isCorrect: null },
    { id: 3, liquidLabel: "الكحول الإيثيلي (نق = 0.2 مم)", rho: 789, gamma: 0.022, angle: 0, r_mm: 0.2, userHeight: '', isCorrect: null },
  ]);

  const [activeTrialId, setActiveTrialId] = useState<number>(1);
  const [tableCompleted, setTableCompleted] = useState<boolean>(false);
  const [tableFeedback, setTableFeedback] = useState<string>('');

  const handleVerifyTrial = (id: number) => {
    const trial = trials.find(t => t.id === id);
    if (!trial) return;

    const r_meters = trial.r_mm / 1000;
    const cosVal = Math.cos((trial.angle * Math.PI) / 180);
    const exactH = (2 * trial.gamma * cosVal) / (trial.rho * g * r_meters);
    
    const userVal = parseFloat(trial.userHeight);
    
    // Validate with a 5% margin of error
    const relativeDiff = Math.abs(exactH - userVal) / Math.abs(exactH);
    const correct = !isNaN(userVal) && (relativeDiff < 0.05 || Math.abs(exactH - userVal) < 1e-4);

    setTrials(prev => prev.map(t => t.id === id ? { ...t, isCorrect: correct } : t));

    if (correct) {
      if (id < trials.length) {
        setActiveTrialId(id + 1);
        setTableFeedback(`✅ رائع جداً! إجابتك للصف ${id} صحيحة ومطابقة للنموذج الفيزيائي تماماً.`);
      } else {
        setTableCompleted(true);
        setTableFeedback("🎉 مبارك! لقد تمكنت من حل وتحقق كافة تحديات جرد الموائع والخواص الشعرية بنجاح واكتسبت 100XP!");
        if (onComplete) onComplete(100, "lesson_17_capillary");
      }
    } else {
      setTableFeedback("❌ القيمة المدونة تخالف الحساب الدقيق! تأكد من قانون الارتفاع: ل = (2 × γ × جتا θ) ÷ (ρ × د × نق) مع مراعاة الإشارة السالبة لعمود الزئبق المنخفض.");
    }
  };

  // Solver Tab states
  const [solverTarget, setSolverTarget] = useState<'h' | 'gamma' | 'theta' | 'r'>('h');
  const [solveRho, setSolveRho] = useState<string>('1000');
  const [solveGamma, setSolveGamma] = useState<string>('0.073');
  const [solveAngle, setSolveAngle] = useState<string>('0');
  const [solveRadius, setSolveRadius] = useState<string>('0.5'); // in mm
  const [solveHeight, setSolveHeight] = useState<string>('0.0298'); // in m
  const [solveResult, setSolveResult] = useState<string>('');

  useEffect(() => {
    const sRho = parseFloat(solveRho);
    const sG = parseFloat(solveGamma);
    const sA = parseFloat(solveAngle);
    const sR = (parseFloat(solveRadius) || 0) / 1000; // to meters
    const sH = parseFloat(solveHeight);

    if (isNaN(sRho) || sRho <= 0) {
      setSolveResult('---');
      return;
    }

    if (solverTarget === 'h') {
      if (!isNaN(sG) && !isNaN(sA) && sR > 0) {
        const cosVal = Math.cos((sA * Math.PI) / 180);
        const res = (2 * sG * cosVal) / (sRho * g * sR);
        setSolveResult(res.toFixed(5) + " متر");
      } else {
        setSolveResult('---');
      }
    } else if (solverTarget === 'gamma') {
      if (!isNaN(sH) && !isNaN(sA) && sR > 0) {
        const cosVal = Math.cos((sA * Math.PI) / 180);
        if (Math.abs(cosVal) > 1e-5) {
          const res = (sH * sRho * g * sR) / (2 * cosVal);
          setSolveResult(res.toExponential(4) + " نيوتن/متر");
        } else {
          setSolveResult('تعذر القسمة (جتا 90)');
        }
      } else {
        setSolveResult('---');
      }
    } else if (solverTarget === 'theta') {
      if (!isNaN(sG) && !isNaN(sH) && sR > 0 && sG > 0) {
        const cosVal = (sH * sRho * g * sR) / (2 * sG);
        if (cosVal >= -1 && cosVal <= 1) {
          const resRad = Math.acos(cosVal);
          const resDeg = (resRad * 180) / Math.PI;
          setSolveResult(resDeg.toFixed(2) + " درجة");
        } else {
          setSolveResult('خارج المدى المرن (-1, 1)');
        }
      } else {
        setSolveResult('---');
      }
    } else if (solverTarget === 'r') {
      if (!isNaN(sG) && !isNaN(sA) && Math.abs(sH) > 1e-7) {
        const cosVal = Math.cos((sA * Math.PI) / 180);
        const resMeter = (2 * sG * cosVal) / (sRho * g * sH);
        const resMm = resMeter * 1000;
        setSolveResult(resMm.toFixed(4) + " ملم");
      } else {
        setSolveResult('---');
      }
    }
  }, [solverTarget, solveRho, solveGamma, solveAngle, solveRadius, solveHeight]);

  return (
    <div className="bg-slate-50 min-h-screen text-right p-3 md:p-6 space-y-6 select-none font-sans">
      
      {/* هيدر المختبر */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 bg-white/5 w-60 h-60 rounded-full blur-2xl transform -translate-x-12 -translate-y-12"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 animate-fadeIn font-semibold text-right">
            <span className="bg-blue-400/20 text-blue-300 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-blue-400/20 inline-block">
              🧪 مختبر ميكانيكا الموائع الساكنة
            </span>
            <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center justify-start gap-2">
              <Beaker className="text-blue-400" size={24} />
              <span>مختبر الخاصية الشعرية: قوى التماسك والتلاصق</span>
            </h1>
            <p className="text-xs text-indigo-200/90 max-w-xl font-medium leading-relaxed">
              استكشف سلوك تسلق السوائل العجيب داخل الأنابيب النحيفة بفعل توترها السطحي وزوايا التماس الجزيئية الكامنة.
            </p>
          </div>
          <div className="flex gap-2">
            {onComplete && (
              <button
                onClick={() => onComplete(100, "lesson_17_capillary")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <CheckCircle size={15} />
                <span>إثبات وإنهاء رصيد المختبر</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* تبويبات الانتقال */}
      <div className="bg-white rounded-2xl p-1.5 flex gap-1 shadow-sm border border-slate-100 max-w-md">
        <button
          onClick={() => setCurrentTab('simulator')}
          className={`flex-1 text-center py-2 px-3 rounded-xl font-bold text-xs cursor-pointer transition-all ${
            currentTab === 'simulator' 
              ? 'bg-indigo-950 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🎮 المحاكي الميكانيكي
        </button>
        <button
          onClick={() => setCurrentTab('table')}
          className={`flex-1 text-center py-2 px-3 rounded-xl font-bold text-xs cursor-pointer transition-all ${
            currentTab === 'table' 
              ? 'bg-indigo-950 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📊 رصد وتسجيل البيانات
        </button>
        <button
          onClick={() => setCurrentTab('calculator')}
          className={`flex-1 text-center py-2 px-3 rounded-xl font-bold text-xs cursor-pointer transition-all ${
            currentTab === 'calculator' 
              ? 'bg-indigo-950 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🧮 حاسبة الخاصية الشعرية
        </button>
      </div>

      {/* 1. تبويب المحاكي الميكانيكي */}
      {currentTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* تمثيل الأنبوب الشعري تفاعلياً بالسائل */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-150 p-5 shadow-sm flex flex-col items-center justify-between space-y-4">
            <div className="w-full border-b pb-2 text-center">
              <span className="font-extrabold text-slate-800 text-xs flex justify-center items-center gap-1">
                <Target className="text-blue-650 animate-pulse" size={15} />
                <span>التمثيل البصري الديناميكي للأنبوبة المتوازنة:</span>
              </span>
            </div>

            {/* وعاء خارجي به سائل وأنبوبة شعرية منتصبة */}
            <div className="w-full max-w-[260px] bg-slate-50 border rounded-2xl p-4 flex flex-col items-center relative h-[380px] justify-end">
              
              {/* رسم الأنابيب والأشواط الفيزيائية باستخدام SVG عالية المتانة بدلاً من الرسومات الجامدة */}
              <svg width="220" height="340" className="overflow-visible">
                {/* خلفية الوعاء */}
                <rect x="20" y="240" width="180" height="80" rx="10" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
                
                {/* السائل الأساسي بداخل حوض الوعاء */}
                <rect x="22" y="250" width="176" height="68" rx="8" fill={color} opacity="0.6" />
                
                {/* الأنبوب الشعري الزجاجي المتوضع بالوسط */}
                {/* يتراوح مكانه من x=95 وعرضه يتناسب مع نصف القطر radius (رسمياً من 4px إلى 40px) */}
                {(() => {
                  const tubeWidth = Math.min(Math.max(radius * 12, 6), 48);
                  const tubeX = 110 - (tubeWidth / 2);
                  
                  // حساب موضع ارتفاع السائل البصري
                  // ل = الارتفاع الفعلي بالمتر
                  // مقياس العرض البصري: 1 سم يعادل 40px تقريباً
                  // الارتفاع المترجم للبكسل: h * 100 * 40
                  // ليكن الحد الأقصى للصعود والهبوط 180px
                  const visualHeightPixel = Math.min(Math.max(height * 2000, -100), 180);
                  const liquidTopY = 250 - visualHeightPixel;

                  return (
                    <>
                      {/* السائل داخل الأنبوب المرتفع أو المنخفض */}
                      {visualHeightPixel >= 0 ? (
                        // حالة الارتفاع (الماء مثلاً) مقعرة الملمس
                        <rect 
                          x={tubeX + 2} 
                          y={liquidTopY} 
                          width={tubeWidth - 4} 
                          height={251 - liquidTopY} 
                          fill={color} 
                          opacity="0.95" 
                        />
                      ) : (
                        // حالة الانخفاض (الزئبق مثلاً) محدبة الملمس
                        <rect 
                          x={tubeX + 2} 
                          y="250" 
                          width={tubeWidth - 4} 
                          height={-visualHeightPixel} 
                          fill={color} 
                          opacity="0.95" 
                        />
                      )}

                      {/* رسم شكل التقوس السطحي (Meniscus) للتقنيين */}
                      {visualHeightPixel >= 0 ? (
                        // مقعر الشد: منحنى لأسفل
                        <path 
                          d={`M ${tubeX + 2} ${liquidTopY} Q 110 ${liquidTopY + Math.min(10, tubeWidth / 3)} ${tubeX + tubeWidth - 2} ${liquidTopY}`}
                          fill="none" 
                          stroke="#ffffff" 
                          strokeWidth="2" 
                        />
                      ) : (
                        // محدب الشد: منحنى لأعلى
                        <path 
                          d={`M ${tubeX + 2} ${liquidTopY} Q 110 ${liquidTopY - Math.min(10, tubeWidth / 3)} ${tubeX + tubeWidth - 2} ${liquidTopY}`}
                          fill="none" 
                          stroke="#ffffff" 
                          strokeWidth="2" 
                        />
                      )}

                      {/* جدران الأنبوب الأيمن والأيسر */}
                      <line x1={tubeX} y1="30" x2={tubeX} y2="300" stroke="#475569" strokeWidth="2.5" />
                      <line x1={tubeX + tubeWidth} y1="30" x2={tubeX + tubeWidth} y2="300" stroke="#475569" strokeWidth="2.5" />

                      {/* مؤشر خط الارتفاع الشعري التوجيهي */}
                      <line x1="10" y1={liquidTopY} x2="210" y2={liquidTopY} stroke="#e11d48" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="12" y={Math.max(liquidTopY - 6, 20)} fill="#e11d48" fontSize="9" fontWeight="bold" textAnchor="start">
                        {height >= 0 ? `ل = +${(height * 100).toFixed(2)} سم` : `ل = ${(height * 100).toFixed(2)} سم`}
                      </text>
                    </>
                  );
                })()}

                {/* سطح السائل بالوعاء */}
                <line x1="22" y1="250" x2="198" y2="250" stroke="#1d4ed8" strokeWidth="2" opacity="0.3" />
              </svg>

            </div>

            {/* التحكم بنصف القطر ميكانيكياً */}
            <div className="w-full space-y-3 pt-3 border-t">
              <div className="flex justify-between items-center text-xs text-slate-700 font-bold">
                <span>📐 تعديل زاوية ونصف قطر الأنبوب (نق):</span>
                <span className="text-blue-900 font-mono font-black">{radius.toFixed(2)} ملم</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRadius(prev => Math.max(0.1, prev - 0.1))}
                  className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black rounded-xl text-lg cursor-pointer animate-none"
                >
                  -
                </button>
                <input
                  type="range"
                  min="0.10"
                  max="5.00"
                  step="0.05"
                  value={radius}
                  onChange={(e) => setRadius(parseFloat(e.target.value))}
                  className="flex-1 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setRadius(prev => Math.min(5.00, prev + 0.1))}
                  className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black rounded-xl text-lg cursor-pointer animate-none"
                >
                  +
                </button>
              </div>

              {/* زر لإضافة نقطة للرسم التفاعلي */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={addCurrentPoint}
                  className="flex-1 bg-blue-600 hover:bg-slate-900 text-white font-extrabold text-[11px] py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Sparkles size={13} />
                  <span>تسجيل النقطة بالرسم البياني</span>
                </button>
                <button
                  onClick={clearGraphPoints}
                  className="bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 font-bold text-[11px] py-2 px-3 rounded-xl transition-all cursor-pointer"
                >
                  مسح المنحنى
                </button>
              </div>
            </div>

          </div>

          {/* لوحة المعطيات والنتائج الفيزيائية الكبرى للرصد */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-150 p-5 shadow-sm space-y-5 text-right">
            <span className="font-extrabold text-slate-850 text-xs block border-b pb-2 text-indigo-950">
              ⚙️ لوحة المعلمات المتكاملة وحسابات صعود المائع:
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* السائل المفحوص */}
              <div className="space-y-1.5 flex flex-col justify-start">
                <label className="text-xs text-slate-655 font-bold block">💧 فحص نوع السائل:</label>
                <select
                  value={liquid}
                  onChange={(e) => setLiquid(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold"
                >
                  <option value="water">💧 ماء نقي (تماسك ضعيف وتلاصق قوي)</option>
                  <option value="mercury">🏐 زئبق فضي (تماسك عالي جداً وتلاصق معدوم)</option>
                  <option value="ethanol">🧪 كحول إيثيلي للتحليلات (متوسط اللزوجة)</option>
                  <option value="custom">🔮 مائع مخصص بالمدخلات عشوائياً</option>
                </select>
              </div>

              {/* مدخلات السائل المخصص */}
              {liquid === 'custom' && (
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-indigo-50/40 rounded-2xl border border-dashed border-indigo-200 animate-fadeIn text-right">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-600 font-bold">الكثافة (ρ) كجم/م³:</label>
                    <input 
                      type="number" 
                      value={customRho} 
                      onChange={(e) => setCustomRho(e.target.value)}
                      className="p-2 border rounded-xl font-mono text-xs w-full text-center bg-white" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-600 font-bold">التوتر السطحي (γ) نيوتن/م:</label>
                    <input 
                      type="text" 
                      value={customGamma} 
                      onChange={(e) => setCustomGamma(e.target.value)}
                      className="p-2 border rounded-xl font-mono text-xs w-full text-center bg-white" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-600 font-bold">زاوية التماس (θ) درجة:</label>
                    <input 
                      type="number" 
                      value={customAngle} 
                      onChange={(e) => setCustomAngle(e.target.value)}
                      className="p-2 border rounded-xl font-mono text-xs w-full text-center bg-white" 
                    />
                  </div>
                </div>
              )}
            </div>

            {/* سياق لوحة الرصد الرقمية للمختبر */}
            <div className="p-4 bg-slate-900 text-white rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-700 text-right">
              
              <div className="space-y-1 text-right">
                <span className="text-[10px] text-slate-400 block font-bold">زاوية التماس الجزيئية (θ):</span>
                <strong className="text-lg font-mono text-indigo-300 font-extrabold block">{angle}° درجات</strong>
                <span className="text-[9px] text-slate-400 block font-semibold leading-relaxed">جتا(θ) = {cosTheta.toFixed(4)}</span>
              </div>

              <div className="space-y-1 text-right">
                <span className="text-[10px] text-slate-400 block font-bold">معامل التوتر السطحي للسائل (γ):</span>
                <strong className="text-lg font-mono text-teal-400 font-extrabold block">{gamma} N/m (نيوتن/م)</strong>
                <span className="text-[9px] text-slate-400 block font-semibold">بصمة جزيئية وثيقة بنوع المادة</span>
              </div>

              <div className="space-y-1 text-right border-t border-slate-800 pt-3">
                <span className="text-[10px] text-slate-400 block font-bold">كثافة السائل الفعلية (ρ):</span>
                <strong className="text-lg font-mono text-amber-400 font-extrabold block">{rho} kg/m³ (كجم/م³)</strong>
              </div>

              <div className="space-y-1 text-right border-t border-slate-800 pt-3">
                <span className="text-[10px] text-slate-400 block font-bold">ارتفاع السائل الشعري المستهدف (ل):</span>
                <strong className={`text-lg font-mono font-black block ${height >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {(height * 100).toFixed(3)} سم ({height.toExponential(3)} متر)
                </strong>
                <span className="text-[9px] text-slate-400 block font-medium">الرمز الموجب = ارتفاع، السالب = انخفاض</span>
              </div>

            </div>

            {/* رسم بياني مدمج من نوع SVG لعرض قانون يورين (الارتفاع مقابل نصف القطر) */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-right">
              <span className="text-[11px] text-slate-800 block font-extrabold text-right flex items-center justify-start gap-1">
                <TrendingUp size={14} className="text-blue-600" />
                <span>رسم بياني حي لعلاقة يورين (الارتفاع مقابل تضييق القطر):</span>
              </span>
              
              <div className="h-40 w-full bg-white rounded-xl border p-2 flex items-center justify-center relative">
                {points.length === 0 ? (
                  <div className="text-center text-[10px] text-slate-400 font-medium font-sans">
                    انقر فوق "تسجيل النقطة بالرسم البياني" لتشاهد وبناء شكل منحنى مقلوب العلاقة العكسية.
                  </div>
                ) : (
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120">
                    {/* المحاور */}
                    <line x1="20" y1="10" x2="20" y2="105" stroke="#94a3b8" strokeWidth="1" />
                    <line x1="20" y1="105" x2="290" y2="105" stroke="#94a3b8" strokeWidth="1" />
                    
                    {/* خطوط شبكة تدريج */}
                    <line x1="20" y1="58" x2="290" y2="58" stroke="#f1f5f9" strokeWidth="1" />
                    <text x="15" y="108" fill="#64748b" fontSize="7" textAnchor="end">0</text>
                    <text x="15" y="15" fill="#64748b" fontSize="7" textAnchor="end">+3سم</text>
                    <text x="15" y="102" fill="#64748b" fontSize="7" textAnchor="end">-3سم</text>

                    {/* المنحنى التجريبي المرصود */}
                    <path 
                      d={`M ${points.map((p, idx) => {
                        // خريطة الإحداثيات: نصف القطر ملم من 0.1 إلى 5.0 لخرط x من 30 إلى 280
                        // الارتفاع من -0.04 إلى 0.04 لخرط y من 105 إلى 15
                        const x = 20 + ((p.r - 0.1) / 4.9) * 260;
                        const y = 58 - (p.h / 0.04) * 43;
                        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}`}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="1.5"
                    />

                    {/* النقاط الفعلية */}
                    {points.map((p, idx) => {
                      const x = 20 + ((p.r - 0.1) / 4.9) * 260;
                      const y = 58 - (p.h / 0.04) * 43;
                      return (
                        <g key={idx}>
                          <circle cx={x} cy={y} r="3.5" fill="#1d4ed8" className="cursor-pointer hover:scale-150 transition-all text-right" />
                          <text x={x} y={y - 6} fill="#1e293b" fontSize="6" fontWeight="bold" textAnchor="middle">
                            {p.r}mm
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 2. تبويب جدول رصد وتسجيل البيانات */}
      {currentTab === 'table' && (
        <div className="bg-white rounded-3xl border border-slate-150 p-5 shadow-sm space-y-6 text-right">
          <div className="border-b pb-3 text-right">
            <h3 className="font-extrabold text-slate-900 text-xs flex items-center justify-start gap-2">
              <Activity className="text-indigo-650 animate-pulse" size={16} />
              <span>جدول صعود وهبوط السوائل بالأنابيب الضيقة المستنتج:</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              احسب مقدار الارتفاع الفعلي لعمود السوائل (ل) مقدراً بالمتر لفك المعميات والمجاهيل الفولاذية، ودون الإجابة للتثبيت.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-indigo-950 text-white font-bold text-[10px] md:text-xs">
                  <th className="p-3">رقم التجربة</th>
                  <th className="p-3">المائع ومحدداته</th>
                  <th className="p-3">الكثافة (ρ) كجم/م³</th>
                  <th className="p-3">التوتر السطحي (N/m)</th>
                  <th className="p-3">زاوية التماس (θ)</th>
                  <th className="p-3">القطر (نق) بالمتر</th>
                  <th className="p-3">الحساب المستحق لـ (ل) بالمتر</th>
                  <th className="p-3">الإرسال والتحقق</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold">
                {trials.map((trial) => {
                  const isActive = activeTrialId === trial.id && !tableCompleted;
                  return (
                    <tr 
                      key={trial.id} 
                      className={`border-b transition-all ${
                        isActive 
                          ? 'bg-amber-50/70 shadow-sm border-amber-200' 
                          : trial.isCorrect === true 
                            ? 'bg-emerald-50/20' 
                            : 'bg-white'
                      }`}
                    >
                      <td className="p-3 font-bold text-slate-600">{trial.id}</td>
                      <td className="p-3 font-bold text-slate-800">{trial.liquidLabel}</td>
                      <td className="p-3 font-mono text-slate-650">{trial.rho}</td>
                      <td className="p-3 font-mono text-slate-650">{trial.gamma}</td>
                      <td className="p-3 font-mono text-slate-650">{trial.angle}°</td>
