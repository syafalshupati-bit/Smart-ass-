import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Check, Sparkles, MoveRight, HelpCircle, ArrowUpRight, Beaker } from 'lucide-react';

// ==================== 1. مختبر أجهزة القياس ====================
export function MeasurementLab() {
  const [selectedObj, setSelectedObj] = useState<number | null>(null);
  const [selectedTool, setSelectedTool] = useState<string>('ruler');
  const [userGuess, setUserGuess] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [savedRecords, setSavedRecords] = useState<any[]>([]);

  const objects = [
    { id: 1, name: 'جسم معدني أزرق', trueVal: 50.0, label: 'مسطرة/ورنية (٥٠ مم)' },
    { id: 2, name: 'سلك نحاسي رقيق', trueVal: 12.5, label: 'ميكرومتر الدقيق (١٢.٥ مم)' },
    { id: 3, name: 'عملة معدنية كروية', trueVal: 20.0, label: 'قدمة ذات ورنية (٢٠ مم)' },
  ];

  const handleVerify = () => {
    if (selectedObj === null) {
      setFeedback('⚠️ الرجاء اختيار جسم أولاً لغرض قياسه!');
      return;
    }
    const current = objects.find(o => o.id === selectedObj);
    if (!current) return;

    const guessNum = parseFloat(userGuess);
    if (isNaN(guessNum)) {
      setFeedback('⚠️ الرجاء إدخال رقم صحيح لقراءة القياس!');
      return;
    }

    const diff = Math.abs(guessNum - current.trueVal);
    const isCorrect = diff < 0.2;

    const newFeedback = isCorrect 
      ? `🎉 قياس صحيح وممتاز! القيمة الحقيقية هي ${current.trueVal} مم.`
      : `❌ القياس غير دقيق. القراءة الصحيحة هي ${current.trueVal} مم. حاول مجدداً!`;
    
    setFeedback(newFeedback);

    setSavedRecords(prev => [
      {
        tool: selectedTool === 'ruler' ? '📏 المسطرة' : selectedTool === 'caliper' ? '📐 القدمة الورنية' : '🔩 الميكرومتر',
        object: current.name,
        guess: guessNum,
        trueVal: current.trueVal,
        status: isCorrect ? 'correct' : 'wrong'
      },
      ...prev
    ]);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm">
      <div className="text-center bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 rounded-xl">
        <h4 className="font-bold text-lg">🧪 مختبر أدوات القياس الفوري</h4>
        <p className="text-xs text-blue-100 mt-1">اختر أداة وجسماً وقم بقياسه بدقة متناهية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* الأجسام */}
        <div className="bg-slate-50 p-4 rounded-xl space-y-3">
          <h5 className="font-semibold text-slate-800 text-sm">📦 الخطوة ١: اختر الجسم المراد قياسه</h5>
          <div className="space-y-2">
            {objects.map(obj => (
              <button
                key={obj.id}
                onClick={() => { setSelectedObj(obj.id); setFeedback(''); }}
                className={`w-full text-right p-3 rounded-lg border-2 text-sm transition-all flex items-center justify-between ${
                  selectedObj === obj.id 
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold' 
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <span>{obj.name}</span>
                <span className="text-xs text-slate-400">{obj.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* الأدوات */}
        <div className="bg-slate-50 p-4 rounded-xl space-y-3">
          <h5 className="font-semibold text-slate-800 text-sm">🛠️ الخطوة ٢: اختر أداة القياس المعيارية</h5>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'ruler', name: '📏 مسطرة', desc: 'للأطوال العادية' },
              { id: 'caliper', name: '📐 ورنية', desc: 'للأعماق والأقطار' },
              { id: 'micrometer', name: '🔩 ميكرومتر', desc: 'للسمك الدقيق جداً' }
            ].map(tool => (
              <button
                key={tool.id}
                onClick={() => { setSelectedTool(tool.id); setFeedback(''); }}
                className={`p-3 rounded-lg border-2 text-center text-xs transition-all flex flex-col items-center justify-center space-y-1 ${
                  selectedTool === tool.id 
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold' 
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <span className="text-base font-bold">{tool.name.split(' ')[0]}</span>
                <span className="font-semibold mt-1">{tool.name.split(' ')[1]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* شاشة الأداة التفاعلية */}
      <div className="border border-slate-200 rounded-xl p-4 bg-slate-900 text-white min-h-[160px] flex flex-col justify-between">
        <div className="text-xs text-slate-400 flex items-center justify-between">
          <span>شاشة العرض الافتراضية للأداة والعدسة المكبرة</span>
          <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px]">بدقة 0.1 مم</span>
        </div>

        {/* عرض تفاعلي للقياس حسب الأداة */}
        <div className="my-4 flex flex-col items-center justify-center space-y-3">
          {selectedObj === null ? (
            <p className="text-sm text-slate-400 animate-pulse">يرجى تحديد جسم في الخطوة ١ للبدء بالمعايرة والقياس...</p>
          ) : (
            <div className="w-full max-w-sm space-y-4">
              <p className="text-xs text-center text-indigo-300">
                الجسم المختار: <strong className="text-white font-bold">{objects.find(o => o.id === selectedObj)?.name}</strong>
              </p>
              
              {selectedTool === 'ruler' && (
                <div className="relative w-full h-8 bg-amber-100 rounded border border-amber-300 flex items-center justify-start px-2 text-slate-800 font-mono text-[10px] select-none">
                  <div className="absolute right-0 h-full border-r-2 border-red-500 bg-indigo-500/20" style={{ width: selectedObj === 1 ? '150px' : selectedObj === 2 ? '37px' : '60px' }}></div>
                  <span>| 0 مم | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 |</span>
                </div>
              )}

              {selectedTool === 'caliper' && (
                <div className="relative w-full h-10 bg-slate-200 rounded border border-slate-400 flex items-center justify-start text-slate-800 font-mono text-[9px] select-none overflow-hidden">
                  <div className="bg-slate-400 h-full w-10 flex items-center justify-center text-white border-l border-slate-500">الفك الثابت</div>
                  <div className="bg-slate-300 h-full border-r border-slate-500 flex items-center justify-center flex-1 relative">
                    <span className="absolute text-slate-400">0.05mm الورنية المعيارية</span>
                    <div className="absolute top-0 bottom-0 w-1 bg-red-600" style={{ right: selectedObj === 1 ? '70%' : selectedObj === 2 ? '20%' : '35%' }}></div>
                  </div>
                </div>
              )}

              {selectedTool === 'micrometer' && (
                <div className="flex justify-center space-x-2">
                  <div className="bg-slate-800 p-2 rounded border border-slate-700 text-center w-24">
                    <div className="text-[10px] text-slate-400">التدريج الرئيسي</div>
                    <div className="text-sm font-bold text-amber-400 font-mono">{selectedObj === 1 ? '50.0' : selectedObj === 2 ? '12.5' : '20.0'} مم</div>
                  </div>
                  <div className="bg-slate-800 p-2 rounded border border-slate-700 text-center w-24">
                    <div className="text-[10px] text-slate-400">التدريج الكسري</div>
                    <div className="text-sm font-bold text-teal-400 font-mono">0.00 مم</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* إدخال قراءتك */}
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <input
            type="number"
            step="0.1"
            value={userGuess}
            onChange={(e) => setUserGuess(e.target.value)}
            placeholder="أدخل قراءتك للأداة بالمليمتر (مم)..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white text-sm outline-none text-center font-mono placeholder:text-slate-500"
          />
          <button
            onClick={handleVerify}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg px-4 py-2 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Check size={16} />
            <span>تحقق وسجل القراءة</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-3 rounded-lg text-xs font-bold text-center ${
          feedback.includes('🎉') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {feedback}
        </div>
      )}

      {/* سجل المحاولات */}
      {savedRecords.length > 0 && (
        <div className="space-y-2">
          <h6 className="font-bold text-slate-700 text-xs text-right">📋 جدول قراءاتك المسجلة:</h6>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-100">
                  <th className="p-2 font-bold">الأداة</th>
                  <th className="p-2 font-bold">الجسم</th>
                  <th className="p-2 font-bold">قراءتك</th>
                  <th className="p-2 font-bold">الحقيقية</th>
                  <th className="p-2 font-bold text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {savedRecords.map((rec, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-2 text-slate-700">{rec.tool}</td>
                    <td className="p-2 text-slate-600">{rec.object}</td>
                    <td className="p-2 font-mono text-slate-800">{rec.guess} مم</td>
                    <td className="p-2 font-mono text-indigo-700 font-bold">{rec.trueVal} مم</td>
                    <td className="p-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.status === 'correct' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {rec.status === 'correct' ? 'دقيق ✅' : 'غير دقيق ❌'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== 2. مصنف الكميات الفيزيائية ====================
export function QuantityClassifier() {
  const allQuantities = [
    { name: 'الكتلة (m)', isVector: false, unit: 'كيلوجرام (kg)' },
    { name: 'الإزاحة (d)', isVector: true, unit: 'متر (m) مع اتجاه' },
    { name: 'الزمن (t)', isVector: false, unit: 'ثانية (s)' },
    { name: 'القوة (F)', isVector: true, unit: 'نيوتن (N)' },
    { name: 'الكثافة (ρ)', isVector: false, unit: 'كجم/م³' },
    { name: 'السرعة المتجهة (v)', isVector: true, unit: 'م/ث مع اتجاه' },
    { name: 'درجة الحرارة (T)', isVector: false, unit: 'كلفن (K)' },
    { name: 'التسارع (a)', isVector: true, unit: 'م/ث²' },
    { name: 'الشغل (W)', isVector: false, unit: 'جول (J)' },
    { name: 'كمية التحرك (p)', isVector: true, unit: 'كجم·م/ث' }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [complete, setComplete] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const handleGuess = (guessIsVector: boolean) => {
    if (complete) return;

    const currentItem = allQuantities[currentIndex];
    const isCorrect = currentItem.isVector === guessIsVector;

    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    setTotal(prev => prev + 1);

    setHistory(prev => [
      {
        name: currentItem.name,
        type: currentItem.isVector ? 'متجهة 🧭' : 'قياسية 📏',
        unit: currentItem.unit,
        isCorrect
      },
      ...prev
    ]);

    if (currentIndex < allQuantities.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setComplete(true);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setScore(0);
    setTotal(0);
    setComplete(false);
    setHistory([]);
  };

  const currentItem = allQuantities[currentIndex];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5 shadow-sm">
      <div className="text-center bg-gradient-to-r from-teal-700 to-emerald-800 text-white p-4 rounded-xl">
        <h4 className="font-bold text-lg">🧭 تحدي تصنيف الكميات السريع</h4>
        <p className="text-xs text-teal-100 mt-1">هل الكمية المعروضة أمامك قياسية أم متجهة؟ صنف بأقصى سرعة!</p>
      </div>

      {!complete ? (
        <div className="border-2 border-dashed border-teal-200 rounded-xl p-6 bg-teal-50/20 text-center flex flex-col items-center justify-center space-y-4 min-h-[160px]">
          <span className="text-xs bg-teal-100 text-teal-800 font-bold px-3 py-1 rounded-full">الكمية {currentIndex + 1} من {allQuantities.length}</span>
          <h5 className="text-2xl font-bold text-slate-800">{currentItem.name}</h5>
          <p className="text-xs text-slate-500">الوحدة المقترحة: {currentItem.unit}</p>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xs pt-2">
            <button
              onClick={() => handleGuess(false)}
              className="py-3 bg-white hover:bg-amber-50 border-2 border-amber-300 text-amber-900 font-bold text-sm rounded-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
            >
              📏 قياسية (مقدار فقط)
            </button>
            <button
              onClick={() => handleGuess(true)}
              className="py-3 bg-white hover:bg-sky-50 border-2 border-sky-300 text-sky-900 font-bold text-sm rounded-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
            >
              🧭 متجهة (مقدار واتجاه)
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-6 text-center space-y-4">
          <h5 className="text-xl font-bold text-emerald-900">🏁 انتهى تحدي التصنيف!</h5>
          <div className="text-3xl font-extrabold text-emerald-800">
            {score} / {total}
          </div>
          <p className="text-xs text-emerald-700 font-semibold">
            {score === total ? '🥇 مذهل للغاية! علامة كاملة وفهم فيزيائي رصين!' : '👍 أداء طيب! استمر وراجع التوضيح أدناه لتعزيز فكرك.'}
          </p>
          <button
            onClick={handleReset}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <RotateCcw size={14} />
            <span>إعادة التحدي للقمة</span>
          </button>
        </div>
      )}

      {/* العداد الجانبي الفوري */}
      <div className="flex justify-between items-center text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
        <span className="font-semibold text-slate-600">النقاط الحالية: <strong className="text-teal-700">{score}</strong></span>
        <span className="font-semibold text-slate-600 flex items-center gap-1">
          <Sparkles size={12} className="text-yellow-500 animate-spin" />
          <span>المعدل الفوري: {total > 0 ? Math.round((score / total) * 100) : 0}%</span>
        </span>
      </div>

      {/* تفاصيل المحاولات */}
      {history.length > 0 && (
        <div className="space-y-2">
          <h6 className="font-bold text-slate-700 text-xs text-right">📊 تحليل سريع للإجابات السابقة:</h6>
          <div className="max-h-[140px] overflow-y-auto space-y-1.5 divide-y divide-slate-50">
            {history.map((h, i) => (
              <div key={i} className="flex justify-between items-center text-xs py-2 px-1">
                <span className="font-bold text-slate-700">{h.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">({h.unit})</span>
                  <span className="font-semibold text-slate-600">{h.type}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    h.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {h.isCorrect ? 'صحيح' : 'خطأ'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== 3. مختبر الإزاحة ضد المسافة ====================
export function DisplacementCarLab() {
  const [carX, setCarX] = useState(160);
  const [carY, setCarY] = useState(160);
  const [path, setPath] = useState<{ x: number, y: number }[]>([{ x: 160, y: 160 }]);
  const [userDist, setUserDist] = useState('');
  const [userDisp, setUserDisp] = useState('');
  const [feedback, setFeedback] = useState('');

  const gridStep = 40;
  const startX = 160;
  const startY = 160;

  useEffect(() => {
    drawGrid();
  }, [carX, carY, path]);

  const drawGrid = () => {
    const canvas = document.getElementById('displacementCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 320, 320);

    // شبكة الإحداثيات
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 320; i += gridStep) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 320); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(320, i); ctx.stroke();
    }

    // نقطة البداية (منزل الطالب)
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.arc(startX, startY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '8px Arial';
    ctx.fillText('أ', startX - 2, startY + 3);

    // رسم المسار الفعلي (المسافة) باللون الأزرق المتصل بخاصية ذكية
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();

    // رسم متجه الإزاحة الأخضر المتقطع (أقصر خط مستقيم)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(carX, carY);
    ctx.stroke();
    ctx.setLineDash([]); // استعادة الوضع العادي

    // رسم سيارة كروية حمراء
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(carX, carY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '8px Arial';
    ctx.fillText('ب', carX - 2, carY + 3);
  };

  const handleMove = (dx: number, dy: number) => {
    const nextX = Math.max(0, Math.min(320, carX + dx));
    const nextY = Math.max(0, Math.min(320, carY + dy));
    setCarX(nextX);
    setCarY(nextY);
    setPath(prev => [...prev, { x: nextX, y: nextY }]);
    setFeedback('');
  };

  const handleReset = () => {
    setCarX(startX);
    setCarY(startY);
    setPath([{ x: startX, y: startY }]);
    setUserDist('');
    setUserDisp('');
    setFeedback('');
  };

  const checkCalculations = () => {
    // حساب المسافة الكلية الفعلية بالوحدات الافتراضية (كل 40 بكسل = 10 أمتار)
    let actualDistPx = 0;
    for (let i = 1; i < path.length; i++) {
      const dX = path[i].x - path[i - 1].x;
      const dY = path[i].y - path[i - 1].y;
      actualDistPx += Math.sqrt(dX * dX + dY * dY);
    }
    const actualDist = (actualDistPx / gridStep) * 10;

    // حساب الإزاحة المستقيمة
    const dispXPx = carX - startX;
    const dispYPx = carY - startY;
    const actualDisp = (Math.sqrt(dispXPx * dispXPx + dispYPx * dispYPx) / gridStep) * 10;

    const uD = parseFloat(userDist);
    const uSp = parseFloat(userDisp);

    if (isNaN(uD) || !uSp) {
      setFeedback('⚠️ الرجاء ملء الفراغات لإجراء تدقيق فيزيائي لصحة حلولك!');
      return;
    }

    const dDiff = Math.abs(uD - actualDist) < 1;
    const sDiff = Math.abs(uSp - actualDisp) < 1;

    if (dDiff && sDiff) {
      setFeedback(`✅ رائع كعادتك! حساباتك صحيحة ودقيقة: المسافة = ${actualDist.toFixed(1)} متر، الإزاحة = ${actualDisp.toFixed(1)} متر.`);
    } else {
      setFeedback(`❌ الإجابة غير مطابقة للمقاييس. القيم الفعلية للرحلة: المسافة المقطوعة = ${actualDist.toFixed(1)} م، الإزاحة الفعلية = ${actualDisp.toFixed(1)} م.`);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm">
      <div className="text-center bg-gradient-to-r from-indigo-700 to-blue-800 text-white p-4 rounded-xl">
        <h4 className="font-bold text-lg">🚗 تجربة إثبات الفرق بين المسافة والإزاحة</h4>
        <p className="text-xs text-indigo-100 mt-1">حرك السيارة (الكرة الحمراء ب) لتخط مساراً وحساب الفروق المعيارية!</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-center">
        {/* ساحة الرسم */}
        <div className="relative">
          <canvas
            id="displacementCanvas"
            width={320}
            height={320}
            className="border-2 border-slate-700 bg-white rounded-xl shadow-inner max-w-full"
          />
          <span className="absolute bottom-2 left-2 text-[10px] text-slate-500 bg-white/80 px-2 py-0.5 rounded font-bold font-mono">
            كل مربع = ١٠ أمتار
          </span>
        </div>

        {/* أدوات التحكم والأسئلة */}
        <div className="flex-1 w-full space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl space-y-3">
            <h5 className="font-bold text-slate-800 text-xs text-right">🎮 تحريك المركبة:</h5>
            <div className="grid grid-cols-3 gap-2 w-48 mx-auto text-center" dir="ltr">
              <div></div>
              <button onClick={() => handleMove(0, -gridStep)} className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow active:scale-95 text-xs">⬆️ شمال</button>
              <div></div>
              <button onClick={() => handleMove(-gridStep, 0)} className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow active:scale-95 text-xs">⬅️ غرب</button>
              <button onClick={handleReset} className="py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow active:scale-95 text-xs">🔄 إعادة</button>
              <button onClick={() => handleMove(gridStep, 0)} className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow active:scale-95 text-xs">➡️ شرق</button>
              <div></div>
              <button onClick={() => handleMove(0, gridStep)} className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow active:scale-95 text-xs">⬇️ جنوب</button>
              <div></div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl space-y-3">
            <h5 className="font-bold text-slate-800 text-xs">🧮 احسب واكتب النتيجة للتحقق:</h5>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-600 font-semibold">المسافة الفعلية المقطوعة (متر):</label>
                <input
                  type="number"
                  value={userDist}
                  onChange={(e) => setUserDist(e.target.value)}
                  placeholder="مثال: ٣٠..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-center text-sm font-mono outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-600 font-semibold">الإزاحة المستقيمة (متر):</label>
                <input
                  type="number"
                  value={userDisp}
                  onChange={(e) => setUserDisp(e.target.value)}
                  placeholder="أقصر بعد..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-center text-sm font-mono outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              onClick={checkCalculations}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
            >
              📊 تحقق وتأكد من الفروق الفيزيائية
            </button>
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`p-3.5 rounded-lg text-xs font-semibold ${
          feedback.includes('✅') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
        }`}>
          {feedback}
        </div>
      )}
    </div>
  );
}

// ==================== 4. مختبر المقذوفات في بعدين (جديد!) ====================
export function ProjectileLab() {
  const [angle, setAngle] = useState(45);
  const [velocity, setVelocity] = useState(20);
  const [g, setG] = useState(9.8);
  const [trail, setTrail] = useState<{ x: number, y: number }[]>([]);
  const [firing, setFiring] = useState(false);

  // إحصاءات الإطلاق المصاحبة
  const [flightTime, setFlightTime] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);
  const [range, setRange] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    drawBackground();
  }, [trail, angle, velocity]);

  const drawBackground = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 500, 250);

    // سماء وعشب
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 500, 220);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(0, 220, 500, 30);

    // رسم منصة الإطلاق (المدفع)
    ctx.save();
    ctx.translate(30, 220);
    const rad = (angle * Math.PI) / 180;
    ctx.rotate(-rad);
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, -6, 25, 12);
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // رسم خط الأثر والمقذوف
    if (trail.length > 0) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      for (const pt of trail) {
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      // الكرة الحالية
      const current = trail[trail.length - 1];
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(current.x, current.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const handleLaunch = () => {
    if (firing) return;
    setFiring(true);
    setTrail([]);

    // حساب المعادلات التأسيسية
    const rad = (angle * Math.PI) / 180;
    const v0x = velocity * Math.cos(rad);
    const v0y = velocity * Math.sin(rad);

    // حساب القيم الفيزيائية مسبقاً
    const duration = (2 * v0y) / g;
    const hMax = (v0y * v0y) / (2 * g);
    const maxRange = (velocity * velocity * Math.sin(2 * rad)) / g;

    setFlightTime(duration);
    setMaxHeight(hMax);
    setRange(maxRange);

    let t = 0;
    const step = 0.05;
    const parentContainerScale = 4.5; // Scale pixels to meters

    const interval = setInterval(() => {
      t += step;
      // معادلة موقع المقذوف
      const posX = 30 + v0x * t * parentContainerScale;
      const posY = 220 - (v0y * t - 0.5 * g * t * t) * parentContainerScale;

      if (posY > 220 || posX > 500 || t >= duration) {
        // الارتطام
        clearInterval(interval);
        setFiring(false);
      } else {
        setTrail(prev => [...prev, { x: posX, y: posY }]);
      }
    }, 25);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm">
      <div className="text-center bg-gradient-to-r from-rose-700 to-amber-800 text-white p-4 rounded-xl">
        <h4 className="font-bold text-lg">🚀 مختبر مسار حركة المقذوفات التفاعلي</h4>
        <p className="text-xs text-rose-100 mt-1">اضبط الزاوية والسرعة الابتدائية ولاحظ المسارات والتحولات الخطية!</p>
      </div>

      <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
        <canvas
          ref={canvasRef}
          width={500}
          height={250}
          className="w-full block"
        />
        {/* ورقة إحصائيات فوق اللوحة */}
        <div className="absolute top-3 right-3 bg-white/90 p-3 rounded-lg border border-rose-100 space-y-1 text-[11px] shadow-sm font-semibold text-slate-700">
          <div>📏 المدى الأفقي الكلي: <span className="text-rose-700 font-bold">{range.toFixed(2)} متر</span></div>
          <div>📈 أقصى ارتفاع رأسي: <span className="text-amber-700 font-bold">{maxHeight.toFixed(2)} متر</span></div>
          <div>⏱️ زمن التحليق في الهواء: <span className="text-blue-700 font-bold">{flightTime.toFixed(2)} ثانية</span></div>
        </div>
      </div>

      {/* المنزلقات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-50 p-4 rounded-xl text-xs">
        <div className="space-y-1">
          <label className="block text-slate-600 font-bold flex justify-between">
            <span>📐 زاوية المقذوف ع الأفق:</span>
            <span className="text-rose-700 font-mono font-bold">{angle}°</span>
          </label>
          <input
            type="range"
            min="0"
            max="90"
            value={angle}
            onChange={(e) => setAngle(parseInt(e.target.value))}
            className="w-full accent-rose-700 cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-slate-600 font-bold flex justify-between">
            <span>⚡ السرعة الابتدائية ع₀:</span>
            <span className="text-rose-700 font-mono font-bold">{velocity} م/ث</span>
          </label>
          <input
            type="range"
            min="5"
            max="40"
            value={velocity}
            onChange={(e) => setVelocity(parseInt(e.target.value))}
            className="w-full accent-rose-700 cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-slate-600 font-bold flex justify-between">
            <span>🌍 الجاذبية المطبقة:</span>
            <span className="text-rose-700 font-mono font-bold">{g} م/ث²</span>
          </label>
          <input
            type="range"
            min="1"
            max="20"
            step="0.1"
            value={g}
            onChange={(e) => setG(parseFloat(e.target.value))}
            className="w-full accent-rose-700 cursor-pointer"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleLaunch}
          disabled={firing}
          className="flex-1 py-3 bg-rose-700 hover:bg-rose-600 disabled:bg-rose-300 text-white font-bold text-sm rounded-xl shadow-sm transition-transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1.5"
        >
          <Play size={16} />
          <span>أطلق المقذوف الآن 🎯</span>
        </button>
        <button
          onClick={() => { setTrail([]); setRange(0); setMaxHeight(0); setFlightTime(0); }}
          className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-sm transition-colors"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}

// ==================== 5. مختبر طاقة سقوط الأجسام ورسم المبيانات ====================
export function EnergyConservationLab() {
  const [height, setHeight] = useState(10); // initial height list
  const [mass, setMass] = useState(2); // mass
  const [g] = useState(9.8);
  const [currentHeight, setCurrentHeight] = useState(10);
  const [animating, setAnimating] = useState(false);

  // Live Energy Metrics
  const [pe, setPe] = useState(0);
  const [ke, setKe] = useState(0);
  const [velocity, setVelocity] = useState(0);

  useEffect(() => {
    // طاقة الوضع الابتدائية
    setPe(mass * g * height);
    setKe(0);
    setVelocity(0);
    setCurrentHeight(height);
  }, [height, mass]);

  const startDrop = () => {
    if (animating) return;
    setAnimating(true);

    const initialHeight = height;
    const initialPE = mass * g * initialHeight;
    let t = 0;
    const step = 0.05;

    const interval = setInterval(() => {
      t += step;
      // السقوط الحر
      const fallDistance = 0.5 * g * t * t;
      const hNow = Math.max(0, initialHeight - fallDistance);
      setCurrentHeight(hNow);

      const computedPE = mass * g * hNow;
      const computedKE = Math.max(0, initialPE - computedPE);
      const computedV = Math.sqrt((2 * computedKE) / mass);

      setPe(computedPE);
      setKe(computedKE);
      setVelocity(computedV);

      if (hNow <= 0) {
        clearInterval(interval);
        setAnimating(false);
      }
    }, 25);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm">
      <div className="text-center bg-gradient-to-r from-emerald-700 to-cyan-800 text-white p-4 rounded-xl">
        <h4 className="font-bold text-lg">🔋 التبادل المنظم لطاقة الوضع والحركة</h4>
        <p className="text-xs text-emerald-100 mt-1">مختبر السقوط الميكانيكي واختبار قانون حفظ الطاقة المكتسبة!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* منصة المحاكاة الرسمية */}
        <div className="relative border border-slate-200 bg-slate-50 rounded-xl h-[240px] overflow-hidden flex items-end">
          {/* عمود الارتفاع المرجعي */}
          <div className="absolute left-6 top-4 bottom-8 w-2 bg-slate-300 rounded">
            <span className="absolute -top-4 -left-2 text-[10px] text-slate-500 font-bold">10م</span>
            <span className="absolute -bottom-4 -left-1 text-[10px] text-slate-500 font-bold">0م</span>
          </div>

          {/* الكرة أو الصندوق الذي يسقط */}
          <div
            className="absolute left-4 bg-emerald-600 border-2 border-white rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow transition-all duration-75"
            style={{
              bottom: `${(currentHeight / 10) * 160 + 32}px`,
              width: `${24 + mass * 3}px`,
              height: `${24 + mass * 3}px`,
            }}
          >
            {mass}كج
          </div>

          {/* أرض المحاكاة */}
          <div className="w-full bg-slate-800 h-8 flex items-center justify-center text-[10px] text-slate-300 font-bold">
            خط إسناد مستوى الأرض (طاقة وضع صفرية)
          </div>
        </div>

        {/* المخططات والمقاييس المستمرة المباشرة */}
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl space-y-3">
            <h5 className="font-bold text-slate-800 text-xs">📊 تحولات الطاقة الميكانيكية الحية:</h5>
            <div className="space-y-2 text-[11px] font-bold">
              {/* طاقة الوضع */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>🔋 طاقة الوضع الجاذبية (PE):</span>
                  <span>{pe.toFixed(1)} جول</span>
                </div>
                <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full transition-all" style={{ width: `${Math.min(100, (pe / (mass * g * height)) * 100)}%` }} />
                </div>
              </div>

              {/* طاقة الحركة */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>⚡ طاقة الحركة الحالية (KE):</span>
                  <span>{ke.toFixed(1)} جول</span>
                </div>
                <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-600 h-full transition-all" style={{ width: `${Math.min(100, (ke / (mass * g * height)) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center text-xs">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="block text-slate-400 text-[10px]">الارتفاع اللحظي:</span>
              <span className="font-bold text-slate-700 text-sm font-mono">{currentHeight.toFixed(2)} م</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="block text-slate-400 text-[10px]">السرعة المكتسبة:</span>
              <span className="font-bold text-slate-700 text-sm font-mono">{velocity.toFixed(1)} م/ث</span>
            </div>
          </div>
        </div>
      </div>

      {/* منزلقات التحكم الفوري بالمدخلات */}
      <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl text-xs">
        <div className="space-y-1">
          <label className="block text-slate-600 font-bold flex justify-between">
            <span>📦 كتلة المقذوف المسقط:</span>
            <span>{mass} كجم</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={mass}
            onChange={(e) => setMass(parseInt(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-slate-600 font-bold flex justify-between">
            <span>📏 الارتفاع الأصلي للبدء:</span>
            <span>{height} أمتار</span>
          </label>
          <input
            type="range"
            min="2"
            max="10"
            value={height}
            onChange={(e) => setHeight(parseInt(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={startDrop}
          disabled={animating}
          className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-600 disabled:bg-emerald-400 text-white font-bold text-sm rounded-xl transition-all"
        >
          {animating ? 'شغال السقوط...' : '🎮 ابدأ السقوط الحر وجلب الأثر'}
        </button>
        <button
          onClick={() => {
            setCurrentHeight(height);
            setPe(mass * g * height);
            setKe(0);
            setVelocity(0);
          }}
          className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-sm"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}

// ==================== 6. مختبر قوانين نيوتن وقانون الجذب العام ====================
export function GravityLawLab() {
  const [m1, setM1] = useState(1); // planet 1
  const [m2, setM2] = useState(1); // planet 2
  const [distance, setDistance] = useState(5); // distance
  const G = 6.674e-11;

  // Compute gravitational force (scaled up enormously for visualization clarity)
  // Real formula is G * m * M / r^2
  // We'll show the actual scientific notation and a normalized visual force vector
  const rawForce = (G * m1 * 5.97e24 * m2 * 7.34e22) / Math.pow(distance * 1e7, 2);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm">
      <div className="text-center bg-gradient-to-r from-teal-800 to-indigo-900 text-white p-4 rounded-xl">
        <h4 className="font-bold text-lg">🌌 مختبر الجاذبية الكونية وقوانين الجذب لنيوتن</h4>
        <p className="text-xs text-teal-100 mt-1">غيّر أحجام الكواكب والمسافات واختبر تضخم قوى الجذب في الكون!</p>
      </div>

      {/* لوحة العرض التفاعلية للكوكبين والارتباط المتبادل */}
      <div className="relative border border-slate-800 bg-slate-950 rounded-xl h-[160px] flex items-center justify-between px-16 overflow-hidden">
        {/* كوكب ١ */}
        <div className="flex flex-col items-center z-10">
          <div
            className="bg-sky-500 border border-sky-400 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg shadow-sky-500/20"
            style={{ width: `${30 + m1 * 4}px`, height: `${30 + m1 * 4}px` }}
          />
          <span className="text-[10px] text-sky-200 bg-sky-950/80 px-2 py-0.5 mt-2 rounded">
            الكوكب الأول (×١٠²⁴ كج)
          </span>
        </div>

        {/* سهم تراكب الجذب المزدوج */}
        <div className="absolute inset-x-24 top-1/2 -translate-y-1/2 flex items-center justify-around text-indigo-400 pointer-events-none">
          <MoveRight size={28} className="animate-pulse" style={{ transform: 'rotate(180deg)' }} />
          <span className="text-teal-400 font-mono text-center font-bold text-xs">
            قوة تبادل الجذب المتبادلة
          </span>
          <MoveRight size={28} className="animate-pulse" />
        </div>

        {/* كوكب ٢ */}
        <div className="flex flex-col items-center z-10">
          <div
            className="bg-amber-500 border border-amber-400 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg shadow-amber-500/20"
            style={{ width: `${24 + m2 * 4}px`, height: `${24 + m2 * 4}px` }}
          />
          <span className="text-[10px] text-amber-200 bg-amber-950/80 px-2 py-0.5 mt-2 rounded">
            الكوكب الثاني (×١٠²² كج)
          </span>
        </div>
      </div>

      {/* بطاقة النتائج العلمية */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center space-y-1 text-center">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">حساب القوة المباشرة:</span>
        <span className="text-xl font-black text-indigo-900 font-mono">
          {rawForce.toExponential(3)} نيوتن
        </span>
        <span className="text-[10px] text-slate-500 max-w-sm">
          تزداد القوة طردياً مع الكتل وعكسياً مع مربع المسافة طبقاً للمعادلة: <strong className="text-indigo-700">F = G.(m1.m2)/r²</strong>
        </span>
      </div>

      {/* المنزلقات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl text-xs font-bold text-slate-600">
        <div className="space-y-1">
          <label className="block flex justify-between">
            <span>🌏 كتلة الكوكب ١:</span>
            <span>{m1} كتل أرضية</span>
          </label>
          <input
            type="range"
            min="1"
            max="12"
            value={m1}
            onChange={(e) => setM1(parseInt(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <label className="block flex justify-between">
            <span>🌕 كتلة الكوكب ٢:</span>
            <span>{m2} كتل قمرية</span>
          </label>
          <input
            type="range"
            min="1"
            max="12"
            value={m2}
            onChange={(e) => setM2(parseInt(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <label className="block flex justify-between">
            <span>📏 المسافة والبعد r:</span>
            <span>{distance} كيلومتر (×١٠⁴)</span>
          </label>
          <input
            type="range"
            min="2"
            max="10"
            value={distance}
            onChange={(e) => setDistance(parseInt(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

// ==================== 7. قاعدة محاكاة PhET العالمية المدمجة ====================
export interface PhetSimInfo {
  url: string;
  title: string;
  desc: string;
  steps: string[];
}

export const PHET_SIMULATIONS: { [lessonId: string]: PhetSimInfo } = {
  "lesson_2_measurement": {
    url: "https://phet.colorado.edu/sims/html/estimation/latest/estimation_all.html?locale=ar",
    title: "مختبر التقدير والقياس الفيزيائي",
    desc: "محاكاة تفاعلية للتدرب على تقدير وقياس الأطوال، المساحات، والأحجام باستخدام المسطرة وأدوات القياس المختلفة لتدبر فوارق دقة القياس.",
    steps: [
      "اختر قسم 'الطول' (Length) من شاشة المحاكاة البدئية.",
      "استخدم المسطرة الافتراضية المرفقة لقياس طول الخطوط العشوائية بدقة ممتازة.",
      "قارن بين تقديرك الذري وبين قراءة المسطرة الدقيقة لملاحظة نسبة الخطأ المئوية للتجربة.",
      "انتقل إلى خياري 'المساحة' و'الحجم' لبناء فكرة فيزيائية عن الأبعاد المركبة."
    ]
  },
  "lesson_3_quantities": {
    url: "https://phet.colorado.edu/sims/html/vector-addition/latest/vector-addition_all.html?locale=ar",
    title: "مختبر تمثيل وجمع المتجهات ثلاثي الأبعاد",
    desc: "طريقة تفاعلية ممتازة لتجسيد الفرق بين الكمية القياسية والكمية المتجهة وتراكب القوى والمتجهات بيزداد وضوحاً.",
    steps: [
      "اختر بيئة 'البعد الواحد' (1D) أو 'المستوى ثنائي الأبعاد' (Explore 2D).",
      "اسحب المتجه (سهم أزرق) وضعه في فضاء العمل الديكارتي.",
      "لاحظ في الترويسة العلوية تغير القيمة القياسية (المقدار) والاتجاه (الزاوية θ) فور تغيير الطول.",
      "قم بتفعيل خيار 'المحصلة' (Sum) لملاحظة كيف تتراكب الإزاحات والمتجهات ميكانيكياً."
    ]
  },
  "lesson_4_conversions": {
    url: "https://phet.colorado.edu/sims/html/estimation/latest/estimation_all.html?locale=ar",
    title: "مختبر النسبة والوحدات المعيارية",
    desc: "مختبر تفاعلي للتحويل بين المقاييس والتقدير المنهجي للوحدات والبادئات الفيزيائية.",
    steps: [
      "اضبط إعدادات القياس وحاول تقدير الطول بالسنتيمتر مقارنة بالأمتار.",
      "غيّر حجم الجسم الافتراضي وقس نسبة التكبير والبادئة المناسبة له.",
      "لاحظ الوحدات العالمية وطبق قانون التحويل بين البادئات يدوياً وراقب دقة النتائج."
    ]
  },
  "lesson_5_dimensional": {
    url: "https://phet.colorado.edu/sims/html/density/latest/density_all.html?locale=ar",
    title: "مختبر معادلة الأبعاد والكثافة",
    desc: "تأكد من تجانس الكميات وصيغة الأبعاد وملاحظة تغير الكتل والحد الأقصى للأحجام المأهولة.",
    steps: [
      "افتح قسم 'الكثافة' لمعرفة العلاقة الصارمة بين الكتلة والحجم (صيغة الأبعاد: M.L⁻³).",
      "قم بغمر الكتل في السائل وقس حجم الماء المزاح بدقة.",
      "احسب صيغة الأبعاد المناسبة واستخرج الثوابت والبدائل لتجانس المعادلات الميكانيكية."
    ]
  },
  "lesson_6_vectors_lab": {
    url: "https://phet.colorado.edu/sims/html/vector-addition/latest/vector-addition_all.html?locale=ar",
    title: "مختبر تحليل وتركيب المتجهات الفيزيائية",
    desc: "ادرس المتجهات المتعامدة، والتحليل لمركبتين أفقية ورأسية (Ax, Ay) رياضياً وحركياً.",
    steps: [
      "ادخل إلى شاشة 'المعادلات' (Equations) بالبرنامج.",
      "اسحب متجهاً جديداً وقم بتدويره بزاوية معينة.",
      "قم بتفعيل خيار 'المركبات الأفقية والشاقولية' (Components) من القائمة الجانبية.",
      "راقب كيف يتم تفكيك المتجه الأصلي إلى مركبة سينية Ax ومركبة صادية Ay بدقة جيب وجيب تمام الزاوية."
    ]
  },
  "lesson_7_displacement": {
    url: "https://phet.colorado.edu/sims/html/vector-addition/latest/vector-addition_all.html?locale=ar",
    title: "مختبر المسافة مقابل الإزاحة المترية",
    desc: "تحقق أن المسافة هي الطول الفعلي للمسار بينما الإزاحة هي أقصر مسار مستقيم باتجاه محدد.",
    steps: [
      "اسحب المتجه الأول ليمثل المسار من النقطة أ إلى ب.",
      "اسحب متجهاً ثانياً متصلاً برأس الأول ليمثل الحركة من ب إلى جـ.",
      "قم بتفعيل 'المحصلة' (Sum) ولاحظ المتجه الناتج؛ هذه هي إزاحتك الإجمالية الصافية!",
      "احسب مجموع أطوال الأسهم (المسافة الفردية) وقارنها بطول سهم المحصلة (مقدار الإزاحة)."
    ]
  },
  "lesson_8_speed": {
    url: "https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html?locale=ar",
    title: "مختبر الحركة: رصد السرعة المتوسطة واللحظية",
    desc: "ادرس العلاقة بين التغير في الإزاحة والزمن المنقضي وتأثير ذلك على عداد السرعة اللحظي لسيارة المحاكاة.",
    steps: [
      "اختر شاشة 'الحركة' (Motion) من الخيارات التفاعلية.",
      "طبق قوة مستمرة ثابتة على الصندوق الخشبي وتابع مؤشر السرعة (Speed) الدائري.",
      "لاحظ كيف تتزايد السرعة اللحظية باستمرار وبانتطام بتأثير القوة.",
      "احسب السرعة المتوسطة بقسمة المسافة الإجمالية المقطوعة على الزمن الكلي ولاحظ فوارق القراءات."
    ]
  },
  "lesson_9_acceleration": {
    url: "https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html?locale=ar",
    title: "مختبر التسارع الميكانيكي ومفهوم العجلة",
    desc: "مختبر رائع لإثبات كيفية نشوء العجلة (التسارع) بتأثير محصلة القوى الخارجية المؤثرة على الكتلة.",
    steps: [
      "انتقل إلى شاشة 'التسارع' (Acceleration) المتقدمة.",
      "قم بتشغيل خانة 'التسارع والسرعة والقيم' لكشف المؤشرات البيانية بالوقت الفعلي.",
      "طبق قوة دفع ثابتة ولاحظ تسارع الجسم (متر / ثانية²).",
      "زد من كتلة الجسم (أضف أوزاناً إضافية) وراقب الانخفاض اللحظي للتسارع نتيجة قصوره الذاتي وعلاقة التناسب العكسي."
    ]
  },
  "lesson_10_kinematics": {
    url: "https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html?locale=ar",
    title: "مختبر معادلات الحركة بتسارع منتظم",
    desc: "محاكاة لربط قوانين معادلات الحركة الكلاسيكية الثلاثة بدلالة السرعة الابتدائية والزمن والمسافة المقطوعة.",
    steps: [
      "استخدم قوى دفع منتظمة خالية من الاحتكاك لإنشاء تسارع ثابت تماماً.",
      "سجل الزمن المستغرق للوصول لسرعة معينة واحسب تسارعك المستمر بالنظام.",
      "طبق قانون الحركة الثاني ورتب المجاهيل لتجزم بمقدار المسافة وقارنها بقراءة المحاكاة الحقيقية."
    ]
  },
  "lesson_11_projectiles": {
    url: "https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_all.html?locale=ar",
    title: "مختبر مسار حركة المقذوفات في بعدين",
    desc: "المختبر الرسمي الكلاسيكي لدراسة حركة المقذوفات تحت تأثير الجاذبية الأرضية وإهمال مقاومة الهواء.",
    steps: [
      "اختر شاشة 'المقدمة' (Intro) لسهولة التعامل.",
      "اضبط ارتفاع فوهة المدفع عشبياً، وزاويته، وسرعته البدائية.",
      "اضغط على زر الإطلاق الأحمر لمشاهدة التحليق والأثر المنحني الفريد.",
      "اسحب أداة القياس السريعة (رمز الهدف وعلامة الزائد) وضعها على أية نقطة بالمسار لمعرفة الزمن والارتفاع والمدى الفوري لتلك اللحظة."
    ]
  },
  "lesson_12_circular": {
    url: "https://phet.colorado.edu/sims/html/gravity-and-orbits/latest/gravity-and-orbits_all.html?locale=ar",
    title: "مختبر القوة المركزية والمسارات المدارية",
    desc: "لاحظ بوضوح اتجاه متجهات السرعة المماسية والقوة الجاذبة المركزية التي تجبر الكواكب على الدوران المداري الممنهج.",
    steps: [
      "اختر 'القسم الأساسي' للمحاكاة المدارية لكوكب الأرض والقمر.",
      "قم بتفعيل خيار 'المتجهات والمقاييس' من لوحة الإعدادات الجانبية.",
      "لاحظ متجه القوة الحمراء (القوة المركزية) المتجه دائماً لمركز الدوران (الشمس).",
      "أوقف قوى الجاذبية فجأة ولاحظ اندفاع الكوكب بخط مستقيم مماس للمدار تطبقاً لقانون القصور الذاتي."
    ]
  },
  "lesson_13_newton_laws": {
    url: "https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html?locale=ar",
    title: "مختبر القوانين الفيزيائية لنيوتن والاحتكاك ميكانيكياً",
    desc: "تفاعل مع قوانين الحركة الثلاث: القصور الذاتي، العلاقة الحركية F = ma، ورد الفعل المعاكس بيئياً.",
    steps: [
      "ادخل لقسم 'الاحتكاك' (Friction) لتوضيح مقاومة التلامس الحقيقية للأرضية.",
      "طبق قوة تدريجية وراقب نشوء قوة الاحتكاك الساكن المعاكسة تماماً لقوتك.",
      "استمر بزيادة القوة وتجاوز الحد الأقصى للانزلاق لدخول حالة الاحتكاك الحركي، مع مراقبة القوة الصافية الناتجة.",
      "تحقق من تطابق التسارع الحاصل مع علاقة حساب الكتلة والقوة الكلية."
    ]
  },
  "lesson_14_gravity": {
    url: "https://phet.colorado.edu/sims/html/gravity-force-lab-basics/latest/gravity-force-lab-basics_all.html?locale=ar",
    title: "مختبر التجاذب الكوني وقوة قانون الجذب لنيوتن",
    desc: "أثبت بالتجربة الرياضية والعملية تضاعف قوة الجذب عند زيادة كتل الأجسام وتقلصها بشدة عند تباعد الأبعاد.",
    steps: [
      "حرك الكتل الكروية يميناً ويساراً لتغيير البعد البيني الفاصل r.",
      "زد قيم كتل الكرتين (m1, m2) مستخدماً مفاتيح الزيادة والنقص المعيارية.",
      "راقب مؤشرات القوة في الأعلى وهي معروضة بوحدة النيوتن الدقيقة.",
      "لاحظ ميكانيكياً تساوي القوتين (الفعل ورد الفعل) في المقدار والتعاكس المباشر بالاتجاه."
    ]
  },
  "lesson_15_work": {
    url: "https://phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics_all.html?locale=ar",
    title: "مختبر الشغل وطاقة حديقة المتزلج الافتراضية",
    desc: "دراسة ميكانيكية متقدمة لقياس الشغل المبذول وتقدير الكفاءة الحركية وارتفاعات الصعود والهبوط.",
    steps: [
      "ضع المتزلج على أعلى نقطة في مسار الارتفاع المنحني.",
      "فعل مخطط 'الأعمدة البيانية الملونة' (Bar Graph) على يسار الشاشة.",
      "لاحظ كيف يمثل أقصى ارتفاع قمة طاقة الوضع الميكانيكية للجاذبية.",
      "تابع تحول كامل هذه الطاقة إلى طاقة حركة بمجرد وصول المتزلج لأسفل نقطة موازية."
    ]
  },
  "lesson_16_energy": {
    url: "https://phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics_all.html?locale=ar",
    title: "مختبر حفظ الطاقة وتجاوز مقاومة الاحتكاك المفتوح",
    desc: "تحقق أن الطاقة الإجمالية للنظام الميكانيكي المعزول تظل ثابتة تماماً وتحولات PE و KE و Thermal تثبت ذلك.",
    steps: [
      "حدد خيار 'الاحتكاك المفعّل الحركي' لمراقبة ضياع الطاقة الميكانيكية.",
      "أطلق المتزلج وراقب زيادة العمود الأحمر الحراري (Thermal Energy) باستمرار.",
      "لاحظ انخفاض ارتفاع الصعود تدريجياً تزامناً مع تحول الطاقة الحركية لشرايين طاقة حرارية مفقودة.",
      "تأكد ميكانيكياً أن المجموع الكلي للطاقة (Total) يظل مستقراً ولا يتلاشى أبداً."
    ]
  },
  "lesson_17_waves": {
    url: "https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string_all.html?locale=ar",
    title: "مختبر انتشار وخصائص الأمواج في الأوتار والسرعات",
    desc: "مختبر تفاعلي لدراسة طول الموجة، التردد، السعة، وتأثير شد الحبل على سرعة نفاذ ونقل النبضات الموجية.",
    steps: [
      "غيّر نمط الإدخال من يدوية إلى 'تذبذب مستمر' (Oscillate) لإنشاء أمواج مكررة.",
      "قم بتفعيل خيار 'نهاية حبل حرة' أو 'بلا نهاية' لمراقبة تلاشي الموجات العائدة والمنعكسة.",
      "تلاعب بالمنزلقات الخاصة بـ'التردد' (Frequency) و'السعة' (Amplitude) وراقب قمم وقيعان الموجة.",
      "اضبط 'الشد والارتخاء' (Tension) ولاحظ تغير سرعة نفوذ نبضات الجيب."
    ]
  },
  "lesson_18_sound": {
    url: "https://phet.colorado.edu/sims/html/waves-intro/latest/waves-intro_all.html?locale=ar",
    title: "مختبر الأمواج التفاعلية: الصوت والضغط الهوائي",
    desc: "أبرز أسرار الضغط وتخلخل طبقات الهواء أثناء مرور الموجات الصوتية والعلاقة بتردد نبرة الصوت المسموعة.",
    steps: [
      "اختر أيقونة 'مكالمة الصوت' (Sound) لبدء المحاكاة الترددية للمكالمات الهاتفية والمكبرات.",
      "اضغط على زر تشغيل الصوت لتردد نبرة مسموعة حية (يمكنك تفعيل مكبر الصوت بجهازك).",
      "انتقل للعرض بوضعية 'الموجات' أو 'الجسيمات' لرؤية اضطراب طبقات الغاز الحركية.",
      "لاحظ تقارب وتباعد جزيئات الوسط الناقل تجسيداً للتضاغطات والتخلخلات المعبرة عن الموجات الصوتية."
    ]
  },
  "lesson_15_hookes_law": {
    url: "https://phet.colorado.edu/sims/html/hookes-law/latest/hookes-law_all.html?locale=ar",
    title: "مختبر قانون هوك والزنبرك المرن التفاعلي",
    desc: "محاكاة واقعية من جامعة PhET Colorado لدراسة العلاقة الطردية بين قوة الشد والضغط المستمر واستطالة النابض مع رصد حد المرونة وتحديد ثابت النابض.",
    steps: [
      "اختر قسم 'الزنبرك المفرد' (Intro) من شاشة المحاكاة المفتوحة.",
      "قم بتفعيل خيارات الرصد من التبويبات العلوية: القوة المطبقة (Applied Force)، وقوة الإرجاع (Spring Force)، والإزاحة (Displacement)، والقيم (Values).",
      "اسحب منزلق القوة المطبقة لمراقبة استطالة الزنبرك طردياً مع القوة في الاتجاهين.",
      "استخدم القوة (ق) وقسمتها على الاستطالة (Δل) للتأكد يدوياً وبطريقة علمية من ثبات المقدار هـ لعدة قراءات متتالية."
    ]
  },
  "lesson_19_buoyancy": {
    url: "https://phet.colorado.edu/sims/html/buoyancy/latest/buoyancy_all.html?locale=ar",
    title: "مختبر قانون الطفو وقاعدة أرخميدس التفاعلي",
    desc: "دراسة وتجربة حركة طفو وغوص الكتل المختلفة واكتشاف قوة الدفع وحجم السائل المزاح بدقة متوازنة.",
    steps: [
      "اختر خيار 'مقدمة الطفو' (Buoyancy Intro) أو 'المعمل المتقدم' من شاشة التجريب المفتوحة.",
      "تلاعب بالمواد الحركية المتوفرة (خشب، ألومنيوم، حديد، طين مخصص) وتحكم بقيم كتلها وأحجامها بالتزامن.",
      "اغمر الكتل المتمايزة بالكامل في السائل وقم برصد القراءة والعداد الفوري لوزن السائل المزاح وقوة الطفو الصاعدة.",
      "قارن قوة الطفو دائماً بوزن السائل المزاح لتأكيد الفرضيات الرياضية لمبدأ العالم أرخميدس."
    ]
  }
};

export function PhetSimulator({ lessonId }: { lessonId: string }) {
  const sim = PHET_SIMULATIONS[lessonId];
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    setIframeLoaded(false);
  }, [lessonId]);

  if (!sim) {
    return (
      <div className="bg-slate-50 rounded-2xl p-6 text-center text-slate-500 border border-dashed border-slate-300">
        <HelpCircle className="mx-auto text-slate-400 mb-2 animate-bounce" size={28} />
        <h5 className="font-bold text-slate-850 text-xs">مختبر PhET التفاعلي العالمي</h5>
        <p className="text-[10px] text-slate-400 mt-1">تتوفر محاكاة PhET التفاعلية للدروس التجريبية والأساسية في مقرر الفيزياء.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-6 shadow-sm">
      <div className="bg-gradient-to-r from-teal-700 via-sky-800 to-indigo-900 text-white p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-right space-y-1">
          <span className="bg-teal-500/20 text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
            بوابة PhET للتعليم والفيزياء
          </span>
          <h4 className="font-bold text-base flex items-center gap-1.5 text-white">
            <Sparkles size={16} className="text-white animate-pulse" />
            <span>{sim.title}</span>
          </h4>
          <p className="text-xs text-sky-100 font-medium leading-relaxed max-w-2xl">
            {sim.desc}
          </p>
        </div>
        <a 
          href={sim.url} 
          target="_blank" 
          rel="noreferrer"
          className="bg-white/10 hover:bg-white/20 hover:scale-[1.02] border border-white/25 text-white text-[11px] font-bold px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95"
        >
          <span>ملء الشاشة ↗</span>
          <ArrowUpRight size={14} />
        </a>
      </div>

      {/* تنبيه اتصال إنترنت */}
      <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-xl text-yellow-800 text-[10px] font-semibold text-right leading-relaxed">
        ⚠️ يتطلب هذا الجزء اتصالاً مستقرًا بالإنترنت لتحميل المحاورة المباشرة من خوادم جامعة كولورادو الأمريكية، إذا واجهت بطئًا أو شاشة بيضاء يمكنك تفقد الرابط الخارجي بملء الشاشة أو استخدام المعمل المحلي المبسط.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* خطوات التجربة الممنهجة */}
        <div className="lg:col-span-4 bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3 text-right">
          <h5 className="font-black text-xs text-slate-800 flex items-center gap-1.5">
            <Beaker size={14} className="text-teal-600" />
            <span>خطوات التجربة الفيزيائية المقترحة:</span>
          </h5>
          <ol className="space-y-2.5 text-[11px] text-slate-650 list-decimal list-inside leading-relaxed font-medium">
            {sim.steps.map((step, idx) => (
              <li key={idx} className="marker:text-teal-600 marker:font-bold">
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* فضاء المحاكاة التفاعلية (Iframe) */}
        <div className="lg:col-span-8 relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-100 shadow-inner h-[380px] md:h-[450px]">
          {!iframeLoaded && (
            <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center gap-3 space-x-2 z-20">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <span className="text-xs text-slate-500 font-bold font-sans animate-pulse">جاري جلب مختبر PhET التفاعلي باللغة العربية...</span>
            </div>
          )}
          <iframe 
            src={sim.url}
            scrolling="no"
            allowFullScreen
            onLoad={() => setIframeLoaded(true)}
            className="w-full h-full border-none bg-white relative z-10"
            title={sim.title}
          />
        </div>
      </div>
    </div>
  );
}
