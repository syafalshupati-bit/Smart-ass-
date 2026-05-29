import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Award, 
  TrendingUp, 
  FileText, 
  Printer, 
  Download, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  FileSpreadsheet,
  Building,
  User,
  Layers,
  Sparkles,
  Percent,
  X,
  FileBarChart2,
  Trash2
} from 'lucide-react';
import { ReportCenter } from './ReportCenter';
import { StudentScore, School, Teacher, StudentAttendance, Lesson, SmartAlert } from '../types';

interface TeacherDashboardProps {
  studentName: string;
  studentSchool: string;
  scores: StudentScore[];
  schools: School[];
  teachers: Teacher[];
  studentAttendances: StudentAttendance[];
  allLessons: Lesson[];
  saveScoresToStorage: (updated: StudentScore[]) => void;
  setSmartAlerts: React.Dispatch<React.SetStateAction<SmartAlert[]>>;
}

export function TeacherDashboard({
  studentName,
  studentSchool,
  scores,
  schools,
  teachers,
  studentAttendances,
  allLessons,
  saveScoresToStorage,
  setSmartAlerts
}: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'results' | 'reports'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [printSectionFilter, setPrintSectionFilter] = useState('all');
  
  const [activeBarHover, setActiveBarHover] = useState<string | null>(null);
  const [activeSegmentHover, setActiveSegmentHover] = useState<string | null>(null);
  const [showAppraisalModal, setShowAppraisalModal] = useState(false);

  const teacherActiveSchool = studentSchool || 'ثانوية جمال عبد الناصر للمتفوقين - صنعاء';

  const schoolScores = useMemo(() => {
    return scores.filter(s => s.school === teacherActiveSchool);
  }, [scores, teacherActiveSchool]);

  const schoolStudentsList = useMemo(() => {
    const uniqueNames = Array.from(new Set(schoolScores.map(s => s.name)));
    return uniqueNames.map(name => {
      const studentRecords = schoolScores.filter(s => s.name === name);
      const firstRecord = studentRecords[0];
      const classGroup = firstRecord?.classGroup || 'الشعبة أ';
      const secretCode = firstRecord?.code || 'ST_CODE_N_A';

      let totalEarned = 0;
      let totalPoints = 0;
      studentRecords.forEach(r => {
        const parts = r.score.split('/');
        totalEarned += parseFloat(parts[0]) || 0;
        totalPoints += parseFloat(parts[1]) || 5;
      });

      const avgOutOf5 = studentRecords.length > 0 ? Number(((totalEarned / totalPoints) * 5).toFixed(2)) : 0;
      const avgPct = studentRecords.length > 0 ? Math.round((totalEarned / totalPoints) * 100) : 0;
      
      const attemptedLessonIds = Array.from(new Set(studentRecords.map(r => r.lessonId)));
      const completionRate = Math.min(100, Math.round((attemptedLessonIds.length / 18) * 100));

      return {
        name,
        code: secretCode,
        classGroup,
        avgOutOf5,
        avgPct,
        completionRate,
        testCount: studentRecords.length
      };
    });
  }, [schoolScores]);

  const teacherClassesList = useMemo(() => {
    const classes = Array.from(new Set(schoolStudentsList.map(s => s.classGroup)));
    return classes.length > 0 ? classes : ['الشعبة أ', 'الشعبة ب', 'الشعبة ج'];
  }, [schoolStudentsList]);

  const activeStudentsCount = schoolStudentsList.length;

  const schoolAverageOutOf5 = useMemo(() => {
    if (schoolStudentsList.length === 0) return 0;
    const sum = schoolStudentsList.reduce((acc, s) => acc + s.avgOutOf5, 0);
    return Number((sum / schoolStudentsList.length).toFixed(2));
  }, [schoolStudentsList]);

  const schoolAveragePct = Math.round((schoolAverageOutOf5 / 5) * 100);

  const successRate = useMemo(() => {
    if (schoolScores.length === 0) return 100;
    const passingScoresCount = schoolScores.filter(s => {
      const value = parseFloat(s.score.split('/')[0]) || 0;
      return value >= 3;
    }).length;
    return Math.round((passingScoresCount / schoolScores.length) * 100);
  }, [schoolScores]);

  const strugglingStudentsCount = useMemo(() => {
    return schoolStudentsList.filter(s => s.avgPct < 60).length;
  }, [schoolStudentsList]);

  const classesStats = useMemo(() => {
    return teacherClassesList.map(className => {
      const classStudents = schoolStudentsList.filter(s => s.classGroup === className);
      const count = classStudents.length;
      
      if (count === 0) return { className, count, avgScore: 0, avgProgress: 0 };
      
      const avgScore = Number((classStudents.reduce((sum, s) => sum + s.avgOutOf5, 0) / count).toFixed(2));
      const avgProgress = Math.round(classStudents.reduce((sum, s) => sum + s.completionRate, 0) / count);
      
      return { className, count, avgScore, avgProgress };
    }).filter(c => c.count > 0);
  }, [teacherClassesList, schoolStudentsList]);

  const sortedClassesForPerformance = useMemo(() => {
    return [...classesStats].sort((a, b) => b.avgScore - a.avgScore);
  }, [classesStats]);

  const bestPerformingSection = sortedClassesForPerformance.length > 0 
    ? `${sortedClassesForPerformance[0].className} (معدل: ${sortedClassesForPerformance[0].avgScore}/5)` 
    : 'لا يوجد شعب نشطة';

  const worstPerformingSection = sortedClassesForPerformance.length > 0 
    ? `${sortedClassesForPerformance[sortedClassesForPerformance.length - 1].className} (معدل: ${sortedClassesForPerformance[sortedClassesForPerformance.length - 1].avgScore}/5)` 
    : 'لا يوجد شعب نشطة';

  const nationalTop10Students = useMemo(() => {
    const globalNames = Array.from(new Set(scores.map(s => s.name)));
    const globalList = globalNames.map(name => {
      const stdScores = scores.filter(s => s.name === name);
      const firstRecord = stdScores[0];
      const classGroup = firstRecord?.classGroup || 'الشعبة أ';
      const schoolName = firstRecord?.school || 'صرح تعليمي';
      
      let totalEarned = 0;
      let totalPoints = 0;
      stdScores.forEach(r => {
        const parts = r.score.split('/');
        totalEarned += parseFloat(parts[0]) || 0;
        totalPoints += parseFloat(parts[1]) || 5;
      });

      const avgOutOf5 = stdScores.length > 0 ? Number(((totalEarned / totalPoints) * 5).toFixed(2)) : 0;
      const avgPct = stdScores.length > 0 ? Math.round((totalEarned / totalPoints) * 100) : 0;
      
      const attemptedLessonIds = Array.from(new Set(stdScores.map(r => r.lessonId)));
      const completionRate = Math.min(100, Math.round((attemptedLessonIds.length / 18) * 100));

      return {
        name,
        school: schoolName,
        classGroup,
        avgOutOf5,
        avgPct,
        completionRate,
        testCount: stdScores.length
      };
    });

    return [...globalList]
      .sort((a, b) => b.avgOutOf5 - a.avgOutOf5 || b.completionRate - a.completionRate || b.testCount - a.testCount)
      .slice(0, 10);
  }, [scores]);

  const searchableFilteredStudents = useMemo(() => {
    return schoolStudentsList.filter(s => {
      const query = searchQuery.toLowerCase().trim();
      const matchClass = classFilter === 'all' ? true : s.classGroup === classFilter;
      
      if (!query) return matchClass;

      const matchName = s.name.toLowerCase().includes(query);
      const matchCode = s.code.toLowerCase().includes(query);
      const matchSection = s.classGroup.toLowerCase().includes(query);
      
      return matchClass && (matchName || matchCode || matchSection);
    });
  }, [schoolStudentsList, searchQuery, classFilter]);

  const performanceTiers = useMemo(() => {
    const total = schoolStudentsList.length || 1;
    const excellent = schoolStudentsList.filter(s => s.avgPct >= 95).length;
    const superior = schoolStudentsList.filter(s => s.avgPct >= 80 && s.avgPct < 95).length;
    const passing = schoolStudentsList.filter(s => s.avgPct >= 60 && s.avgPct < 80).length;
    const struggling = schoolStudentsList.filter(s => s.avgPct < 60).length;

    return {
      excellent: { count: excellent, pct: Math.round((excellent / total) * 100), label: 'التميز المتألق (95%-100%)' },
      superior: { count: superior, pct: Math.round((superior / total) * 100), label: 'جيد جداً متميز (80%-94%)' },
      passing: { count: passing, pct: Math.round((passing / total) * 100), label: 'مقبول مستوفٍ (60%-79%)' },
      struggling: { count: struggling, pct: Math.round((struggling / total) * 100), label: 'متعثر داعم (< 60%)' }
    };
  }, [schoolStudentsList]);

  const handleUpdateStudentScoreInline = (studentNameString: string, lessonIdString: string, newScoreValue: string) => {
    const parsed = parseFloat(newScoreValue);
    if (isNaN(parsed) || parsed < 0 || parsed > 5) {
      alert("⚠️ التقييم يجب أن يكون درجة صحيحة موازية بين 0 و 5!");
      return;
    }

    const updatedScores = scores.map(src => {
      if (src.name === studentNameString && src.lessonId === lessonIdString && src.school === teacherActiveSchool) {
        return { ...src, score: `${parsed}/5` };
      }
      return src;
    });

    saveScoresToStorage(updatedScores);

    if (parsed < 3) {
      const alertTitle = `تنبيه تدني الدرجة التعليمية للطالب: ${studentNameString} ⚠️`;
      const alertMsg = `رصد المعلم الموجه درجة حرجة (${parsed}/5) للطالب ${studentNameString} في درس فيزياء بمدرستكم. تفضلوا بالدعم والتدخل التربوي.`;
      const newAlert: SmartAlert = {
        id: `alert_dyn_${Date.now()}`,
        type: 'danger',
        title: alertTitle,
        message: alertMsg,
        userType: 'all',
        studentName: studentNameString,
        school: teacherActiveSchool,
        date: 'اليوم',
        alertType: 'grades'
      };
      setSmartAlerts(prev => [newAlert, ...prev]);
    }

    alert("🟢 تم تعديل ورصد العلامة بنجاح بالمنظومة!");
  };

  const handleDeleteStudentScoreRecord = (studentNameString: string, lessonIdString: string) => {
    if (confirm(`هل أنت متأكد من لزوم إتلاف رصد فحص درس الطالب (${studentNameString})؟`)) {
      const updatedScores = scores.filter(src => !(src.name === studentNameString && src.lessonId === lessonIdString && src.school === teacherActiveSchool));
      saveScoresToStorage(updatedScores);
      alert("🗑️ تم حذف وثيقة الرصد بنجاح.");
    }
  };

  const handleExportCSV = () => {
    let csvContent = "\uFEFF";
    csvContent += "م,اسم الطالب,الرقم السري,الشعبة,عدد الاختبارات المؤداة,متوسط التحصيل الصفي,درجة المخرجات (أصل 5),نسبة إكمال الـ18 درساً,الحالة التربوية\n";
    
    const printTarget = printSectionFilter === 'all' 
      ? schoolStudentsList 
      : schoolStudentsList.filter(s => s.classGroup === printSectionFilter);

    if (printTarget.length === 0) {
      alert("⚠️ لا توجد نتائج لتصديرها للشعبة المحددة!");
      return;
    }

    printTarget.forEach((s, idx) => {
      const rating = s.avgPct >= 95 ? "ممتاز فائق" : s.avgPct >= 80 ? "جيد جداً متميز" : s.avgPct >= 60 ? "مقبول مستوف" : "متعثر داعم";
      csvContent += `${idx + 1},"${s.name}","${s.code}","${s.classGroup}",${s.testCount},"${s.avgPct}%","${s.avgOutOf5}","${s.completionRate}%","${rating}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", url);
    downloadLink.setAttribute("download", `نتائج_${printSectionFilter === 'all' ? 'جميع_الشعب' : printSectionFilter}_مدرسة_${teacherActiveSchool.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handlePrintDoc = () => {
    window.print();
  };

  return (
    <div className="relative w-full space-y-6 text-right" dir="rtl">
      
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-[0.015] dark:opacity-[0.006] z-0 grid grid-cols-2 md:grid-cols-4 grid-rows-8 gap-y-24 gap-x-12 text-center text-slate-900 dark:text-white font-extrabold text-[10px] leading-relaxed uppercase rotate-12">
        {Array.from({ length: 32 }).map((_, i) => (
          <div key={i} className="-rotate-12 whitespace-nowrap">
            المرجع الذكي للفيزياء • {teacherActiveSchool} • {studentName} • غير مصرح للتصدير 🔒
          </div>
        ))}
      </div>

      <div className="relative z-10 bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-900 text-white p-6 rounded-3xl border border-amber-500/20 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="absolute top-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1.5">
          <span className="inline-flex bg-amber-500/10 text-amber-400 border border-amber-500/20 font-extrabold text-[9px] px-3 py-1 rounded-full uppercase tracking-wider gap-1 items-center">
            <Sparkles size={10} className="text-amber-400" />
            بوابة المعلم الفني والتوجيه والتحليل الإحصائي المقارن
          </span>
          <h2 className="text-xl md:text-2xl font-black mt-1">أهلاً بك، الأستاذ {studentName || 'المعلم الموجه'} 👋</h2>
          <p className="text-xs text-slate-300 font-semibold leading-relaxed">
            الصرح الأكاديمي الشريك: <span className="text-amber-400 font-extrabold">{teacherActiveSchool}</span> | ترخيص النظام مؤمن وموثق 🟢
          </p>
        </div>
        
        <div className="flex gap-2.5">
          <button 
            onClick={() => setShowAppraisalModal(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black px-4.5 py-2.5 rounded-xl text-xs cursor-pointer shadow-md transition-all active:scale-95 border border-yellow-400/20"
          >
            🏢 استخراج تقرير الأداء الموثق
          </button>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2.5xl p-4 transition-all hover:shadow-sm flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-[10px] font-black leading-tight">الطلاب النشطين بالمنصة</span>
            <span className="p-1 px-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400"><Users size={12} /></span>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-indigo-950 dark:text-indigo-100 font-mono">{activeStudentsCount}</span>
            <span className="text-[9px] text-slate-400 block font-semibold">طالب مسجل بالدرجات</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2.5xl p-4 transition-all hover:shadow-sm flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-[10px] font-black leading-tight">متوسط أداء الصرح</span>
            <span className="p-1 px-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-750 dark:text-amber-400"><TrendingUp size={12} /></span>
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-850 dark:text-slate-100 font-mono">{schoolAverageOutOf5}</span>
              <span className="text-xs text-slate-400 font-mono">/ 5</span>
            </div>
            <span className="text-[9px] text-amber-700 dark:text-amber-400 block font-bold">معدل نسبي {schoolAveragePct}%</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2.5xl p-4 transition-all hover:shadow-sm flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-[10px] font-black leading-tight">نسبة النجاح العامة</span>
            <span className="p-1 px-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"><Percent size={12} /></span>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{successRate}%</span>
            <span className="text-[9px] text-slate-400 block font-semibold">تأهيل الفحص &gt;= 3/5</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2.5xl p-4 transition-all hover:shadow-sm flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-[10px] font-black leading-tight">الطلاب المتعثرين</span>
            <span className="p-1 px-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400"><AlertTriangle size={12} /></span>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">{strugglingStudentsCount}</span>
            <span className="text-[9px] text-rose-500 block font-bold">بمعدل تحصيل تحت 60%</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2.5xl p-4 transition-all hover:shadow-sm flex flex-col justify-between min-h-[110px] col-span-1">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-[10px] font-black leading-tight">الشعبة الأعلى كفاءة</span>
            <span className="p-1 px-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400"><Award size={12} /></span>
          </div>
          <div className="mt-2.5">
            <span className="text-[11px] font-black text-slate-800 dark:text-white leading-tight block truncate" title={bestPerformingSection}>{bestPerformingSection}</span>
            <span className="text-[9px] text-yellow-600 block font-semibold">بأعلى متوسط درجات صفي</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2.5xl p-4 transition-all hover:shadow-sm flex flex-col justify-between min-h-[110px] col-span-1">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-[10px] font-black leading-tight">الشعبة الأقل أداءً</span>
            <span className="p-1 px-1.5 rounded-lg bg-slate-100 dark:bg-slate-855 text-slate-600 dark:text-slate-400"><Layers size={12} /></span>
          </div>
          <div className="mt-2.5">
            <span className="text-[11px] font-black text-slate-800 dark:text-white leading-tight block truncate" title={worstPerformingSection}>{worstPerformingSection}</span>
            <span className="text-[9px] text-slate-500 block font-semibold">تستدعي مضاعفة تمارين الدعم</span>
          </div>
        </div>

      </div>

      <div className="relative z-10 flex border-b border-slate-200 dark:border-slate-800 no-print">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 md:flex-initial flex items-center justify-center gap-2 pb-3.5 px-6 font-black text-xs transition-all border-b-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-750 dark:text-indigo-400 font-extrabold'
              : 'border-transparent text-slate-450 dark:text-slate-500 hover:text-slate-655'
          }`}
        >
          📈 لوحة التحليلات والإحصاء وأداء الشعب
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`flex-1 md:flex-initial flex items-center justify-center gap-2 pb-3.5 px-6 font-black text-xs transition-all border-b-2 cursor-pointer ${
            activeTab === 'results'
              ? 'border-indigo-600 text-indigo-750 dark:text-indigo-400 font-extrabold'
              : 'border-transparent text-slate-450 dark:text-slate-500 hover:text-slate-655'
          }`}
        >
          🏆 كشف النتائج التنافسي للطلاب
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 md:flex-initial flex items-center justify-center gap-2 pb-3.5 px-6 font-black text-xs transition-all border-b-2 cursor-pointer ${
            activeTab === 'reports'
              ? 'border-indigo-600 text-indigo-750 dark:text-indigo-400 font-extrabold'
              : 'border-transparent text-slate-450 dark:text-slate-500 hover:text-slate-655'
          }`}
        >
          📋 مركز التقارير ومسير المنهج المتكامل
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in no-print">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-rose-50/50 dark:border-slate-800 pb-2.5">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-650" />
                  ⚖️ أداء ومقارنة الشعب المدرسية الفعلي (متوسط الأداء من 5)
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold">مرر الماوس للتكبير والتفاصيل</span>
              </div>

              {classesStats.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-slate-400 text-xs italic font-bold">
                  لا توجد نتائج مسجلة لتعبئة الرسوم البيانية الاسترشادية بعد.
                </div>
              ) : (
                <div className="relative">
                  <svg viewBox="0 0 450 200" className="w-full h-auto overflow-visible select-none">
                    <line x1="40" y1="20" x2="430" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="2" />
                    <line x1="40" y1="70" x2="430" y2="70" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="2" />
                    <line x1="40" y1="120" x2="430" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="2" />
                    <line x1="40" y1="160" x2="430" y2="160" stroke="#e2e8f0" strokeWidth="2" />
                    
                    <text x="30" y="24" className="text-[9px] font-bold fill-slate-400" textAnchor="end">5.0</text>
                    <text x="30" y="74" className="text-[9px] font-bold fill-slate-400" textAnchor="end">3.0</text>
                    <text x="30" y="124" className="text-[9px] font-bold fill-slate-400" textAnchor="end">1.5</text>
                    <text x="30" y="164" className="text-[9px] font-bold fill-slate-400" textAnchor="end">0.0</text>

                    {classesStats.map((c, idx) => {
                      const totalBars = classesStats.length || 1;
                      const spanX = 360 / totalBars;
                      const x = 55 + idx * spanX;
                      const barHeight = (c.avgScore / 5) * 130;
                      const y = 160 - barHeight;
                      const width = Math.min(60, spanX - 25);
                      
                      const isHovered = activeBarHover === c.className;

                      return (
                        <g key={idx} 
                           onMouseEnter={() => setActiveBarHover(c.className)}
                           onMouseLeave={() => setActiveBarHover(null)}
                           className="cursor-pointer"
                        >
                          <rect
                            x={x}
                            y={y}
                            width={width}
                            height={barHeight}
                            rx="6"
                            className={`transition-all duration-300 ${
                              isHovered 
                                ? 'fill-indigo-600 shadow-lg filter saturate-150' 
                                : 'fill-indigo-950 dark:fill-indigo-505 opacity-85 hover:opacity-100'
                            }`}
                          />
                          
                          <text 
                            x={x + width / 2} 
                            y={y - 7} 
                            className={`text-[10px] font-extrabold text-center transition-all ${isHovered ? 'fill-indigo-750 font-black scale-110' : 'fill-indigo-950 dark:fill-slate-300'}`}
                            textAnchor="middle"
                          >
                            {c.avgScore}
                          </text>

                          <text
                            x={x + width / 2}
                            y="180"
                            className="text-[10px] font-black fill-slate-600 dark:fill-slate-400"
                            textAnchor="middle"
                          >
                            {c.className}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                  
                  {activeBarHover && (() => {
                    const activeC = classesStats.find(c => c.className === activeBarHover);
                    if (!activeC) return null;
                    return (
                      <div className="absolute top-4 left-4 bg-slate-900 border border-rose-50/15 text-white p-3 rounded-2xl shadow-xl text-right text-[10px] space-y-1 animate-fade-in z-20">
                        <p className="font-extrabold text-amber-300">{activeC.className}</p>
                        <p className="font-semibold text-slate-200">الطلاب النشطين: <span className="font-mono font-bold text-white">{activeC.count} طالب</span></p>
                        <p className="font-semibold text-slate-200">متوسط الدرجات: <span className="font-mono font-bold text-emerald-400">{activeC.avgScore} / 5</span></p>
                        <p className="font-semibold text-slate-200">نسبة إنجاز المنهج: <span className="font-mono font-bold text-sky-400">{activeC.avgProgress}%</span></p>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-rose-50/50 dark:border-slate-800 pb-2.5">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  🏆 مسرح نسب التوزيع المعرفي لمستويات طلاب مدرستكم
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold">تحليل تراكمي نسبي مدرج</span>
              </div>

              {schoolStudentsList.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-slate-400 text-xs italic font-bold">
                  لا توجد كشوف تقييم لرسم مؤشر الهرم التحصيلي المتدرج.
                </div>
              ) : (
                <div className="flex flex-col justify-between h-[150px] md:h-[180px] py-2 relative">
                  
                  <div className="space-y-3.5">
                    <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                      يبرز التوزيع التالي نسبة طلاب الصرح المستفيدين الموزعين على فئات التميز والتعثر. مرر للوقف والتدقيق:
                    </p>
                    
                    <div className="w-full bg-slate-100 dark:bg-slate-850 h-7 rounded-2xl overflow-hidden shadow-xs flex select-none">
                      
                      {performanceTiers.excellent.pct > 0 && (
                        <div 
                          style={{ width: `${performanceTiers.excellent.pct}%` }}
                          onMouseEnter={() => setActiveSegmentHover('excellent')}
                          onMouseLeave={() => setActiveSegmentHover(null)}
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-90 transition-all cursor-pointer flex items-center justify-center font-mono font-black text-[10px] text-slate-950"
                          title={performanceTiers.excellent.label}
                        >
                          {performanceTiers.excellent.pct}%
                        </div>
                      )}
                      
                      {performanceTiers.superior.pct > 0 && (
                        <div 
                          style={{ width: `${performanceTiers.superior.pct}%` }}
                          onMouseEnter={() => setActiveSegmentHover('superior')}
                          onMouseLeave={() => setActiveSegmentHover(null)}
                          className="h-full bg-gradient-to-r from-indigo-850 to-indigo-950 hover:opacity-90 transition-all cursor-pointer flex items-center justify-center font-mono font-black text-[10px] text-indigo-50"
                          title={performanceTiers.superior.label}
                        >
                          {performanceTiers.superior.pct}%
                        </div>
                      )}

                      {performanceTiers.passing.pct > 0 && (
                        <div 
                          style={{ width: `${performanceTiers.passing.pct}%` }}
                          onMouseEnter={() => setActiveSegmentHover('passing')}
                          onMouseLeave={() => setActiveSegmentHover(null)}
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:opacity-90 transition-all cursor-pointer flex items-center justify-center font-mono font-black text-[10px] text-white"
                          title={performanceTiers.passing.label}
                        >
                          {performanceTiers.passing.pct}%
                        </div>
                      )}

                      {performanceTiers.struggling.pct > 0 && (
                        <div 
                          style={{ width: `${performanceTiers.struggling.pct}%` }}
                          onMouseEnter={() => setActiveSegmentHover('struggling')}
                          onMouseLeave={() => setActiveSegmentHover(null)}
                          className="h-full bg-gradient-to-r from-rose-500 to-rose-600 hover:opacity-90 transition-all cursor-pointer flex items-center justify-center font-mono font-black text-[10px] text-white"
                          title={performanceTiers.struggling.label}
                        >
                          {performanceTiers.struggling.pct}%
                        </div>
                      )}

                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-4 text-[10px] font-black">
                    <div className="flex items-center gap-1.5 justify-start">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-slate-700 dark:text-slate-300">ممتاز فائق ({performanceTiers.excellent.count} ط)</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-start">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-950" />
                      <span className="text-slate-700 dark:text-slate-300">جيد جداً ({performanceTiers.superior.count} ط)</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-start">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-slate-700 dark:text-slate-300">مقبول مستوف ({performanceTiers.passing.count} ط)</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-start">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span className="text-slate-700 dark:text-slate-300">متعثر داعم ({performanceTiers.struggling.count} ط)</span>
                    </div>
                  </div>

                  {activeSegmentHover && (() => {
                    const seg = performanceTiers[activeSegmentHover as keyof typeof performanceTiers];
                    return (
                      <div className="absolute top-1 left-1 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-[10px] transition-all animate-fade-in z-20 shadow-lg border border-slate-755">
                        💡 <strong className="text-amber-400">{seg.label}</strong>: يمثل <span className="font-mono text-white text-xs">{seg.count} طالب</span>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-2xs space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm border-b border-rose-50/50 dark:border-slate-800 pb-2.5 flex items-center gap-1.5">
              ⚖️ حصر نسب التقدم المنهجي ومقارنة أداء شعب الصرح الدراسي
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {classesStats.map((cls, idx) => (
                <div key={idx} className="bg-slate-50/55 dark:bg-slate-850/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5 text-right transition-transform hover:-translate-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-xs text-indigo-950 dark:text-indigo-300">{cls.className}</span>
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 block font-black px-2 py-0.5 rounded-md">{cls.count} طلاب نشطين</span>
                  </div>
                  
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    <span>تحصيل الشعبة: <strong className="text-indigo-700 dark:text-indigo-400">{cls.avgScore} / 5</strong></span>
                    <span>نسبة التقدم وإكمال المنهج: <strong className="text-amber-600 dark:text-amber-400">{cls.avgProgress}%</strong></span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${cls.avgProgress >= 80 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : cls.avgProgress >= 50 ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-rose-500'}`}
                      style={{ width: `${cls.avgProgress}%` }}
                    />
                  </div>
                </div>
              ))}
              {classesStats.length === 0 && (
                <p className="col-span-3 text-center text-slate-400 italic font-semibold py-8 text-xs">لا يوجد شعب مدرسة نشطة مسجلة درجات حالياً.</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm border-b border-rose-50/50 dark:border-slate-800 pb-2.5 text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <span>⚠️ كشف الطلاب المتعثرين المستحقين للرعاية التربوية والعلاج في الصرح</span>
              <span className="bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 text-[10px] font-black px-2.5 py-0.5 rounded-full">{strugglingStudentsCount} طالب متعثر</span>
            </h3>
            <p className="text-[10px] text-slate-450 dark:text-slate-400 leading-relaxed font-semibold">
              يستلزم مسير التقويم رعاية الطلاب المدرجة أسماؤهم أدناه فوراً والذين يمتلكون تحصيل دون نسبة (60%) التراكمية في مقرر المرجع الذكي للفيزياء، لمكافحة الفجوات الصفية.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[250px] overflow-y-auto pr-1">
              {schoolStudentsList
                .filter(s => s.avgPct < 60)
                .map((std, idx) => (
                  <div key={idx} className="bg-rose-50/20 dark:bg-rose-950/10 p-3.5 rounded-2xl border border-rose-100/40 dark:border-rose-950/30 flex justify-between items-center text-right">
                    <div className="space-y-0.5">
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">{std.name}</h4>
                      <p className="text-[10px] text-slate-450 dark:text-slate-400 font-semibold">
                        {std.classGroup} | المعدل: <strong className="text-rose-600 dark:text-rose-400 font-black">{std.avgOutOf5} / 5 ({std.avgPct}%)</strong>
                      </p>
                    </div>
                    <span className="text-[9px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-450 px-2.5 py-1 rounded-lg border border-rose-100/30">تحت التقويم</span>
                  </div>
                ))}
              {schoolStudentsList.filter(s => s.avgPct < 60).length === 0 && (
                <div className="col-span-3 text-center py-10 italic font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                  🕊️ رائع! الصرح التعليمي خالٍ تماماً من المتعثرين التراكميين حالياً.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'results' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl border border-amber-500/20 shadow-md space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-3">
              <div className="space-y-0.5">
                <h3 className="font-black text-amber-400 text-sm flex items-center gap-1.5 md:text-base">
                  🏆 لوحة الشرف الكبرى ونخبة الـ 10 الأوائل في المنصة
                </h3>
                <p className="text-[10px] text-slate-300 font-medium">الترتيب التلقائي المعتمد حسب المعدل الأعلى، ونقاط الإكمال، وعدد الاختبارات.</p>
              </div>
              <span className="bg-amber-500/10 text-amber-300 border border-amber-400/20 text-[9px] font-black px-3 py-1 rounded-full">تحديث فوري 🟢</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right border-collapse select-none">
                <thead>
                  <tr className="border-b border-white/5 text-amber-300/80 font-black">
                    <th className="p-3 text-center w-12">الترتيب</th>
                    <th className="p-3">اسم الطالب الكريم</th>
                    <th className="p-3">المدرسة الشريكة</th>
                    <th className="p-3 text-center">الشعبة</th>
                    <th className="p-3 text-center">متوسط الأداء</th>
                    <th className="p-3 text-center">نسبة الإنجاز (18 د)</th>
                    <th className="p-3 text-left">وسام النخبة</th>
                   </>
                </thead>
                <tbody>
                  {nationalTop10Students.map((std, idx) => {
                    const classesRank = idx === 0 
                      ? 'bg-amber-500/25 text-amber-300 border border-amber-400/30' 
                      : idx === 1 
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/20' 
                        : idx === 2 
                          ? 'bg-orange-500/15 text-orange-400 border border-orange-405/20' 
                          : 'bg-white/5 text-slate-300 border border-white/5';

                    const medalElement = idx === 0 
                      ? '🥇 وسام درع الصدارة الوطنية' 
                      : idx === 1 
                        ? '🥈 وسام الفخر والجودة الفائقة' 
                        : idx === 2 
                          ? '🥉 وسام الاجتهاد والتميز الصفي' 
                          : '🎖️ وسام النخبة المعرفية';

                    const isOwnSchool = std.school === teacherActiveSchool;

                    return (
                      <tr key={idx} className={`border-b border-white/5 hover:bg-white/5 transition-colors font-bold ${isOwnSchool ? 'bg-indigo-500/5 border-r-2 border-r-amber-500' : ''}`}>
                        <td className="p-3 text-center">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-[10px] mx-auto ${classesRank}`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-100 flex items-center gap-1.5">
                          <span>{std.name}</span>
                          {isOwnSchool && <span className="bg-amber-400/15 text-amber-400 text-[8px] px-1.5 py-0.2 rounded-md font-black">طالبك 👨‍🏫</span>}
                        </td>
                        <td className="p-3 text-slate-300 font-semibold">{std.school}</td>
                        <td className="p-3 text-center text-slate-300">{std.classGroup}</td>
                        <td className="p-3 text-center font-mono text-emerald-400 font-extrabold">{std.avgOutOf5} / 5 ({std.avgPct}%)</td>
                        <td className="p-3 text-center font-mono text-sky-305 font-bold">{std.completionRate}%</td>
                        <td className="p-3 text-left font-semibold text-[10px] text-amber-350">{medalElement}</td>
                      </tr>
                    );
                  })}
                  {nationalTop10Students.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-10 italic text-slate-400">لا توجد سجلات كافية بالمنصة لحساب لول الشرف حالياً.</td>
                    </table>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-xs space-y-4 no-print">
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-800 pb-3">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">📋 جرد كشف الدرجات التنافسي المعتمد لطلاب الصرح</h3>
                <p className="text-[10px] text-slate-450 dark:text-slate-400 leading-relaxed font-semibold">
                  تحكم، تفتيش، وبحث مغلق تماماً لبيانات مدرسة <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">({teacherActiveSchool})</span> فحسب.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                
                <select 
                  value={printSectionFilter}
                  onChange={(e) => setPrintSectionFilter(e.target.value)}
                  className="bg-slate-5 hover:bg-slate-10 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 outline-none text-xs font-bold text-slate-800 dark:text-white"
                >
                  <option value="all">كل شعب الصرح</option>
                  {teacherClassesList.map(clsName => (
                    <option key={clsName} value={clsName}>{clsName}</option>
                  ))}
                </select>

                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-850 font-extrabold px-3 py-2 rounded-xl text-xs cursor-pointer select-none transition-transform active:scale-95"
                  title="تصدير كشف الشعبة إلى Excel"
                >
                  <FileSpreadsheet size={13} />
                  <span>تصدير Excel</span>
                </button>

                <button
                  onClick={handlePrintDoc}
                  className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-850 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-850 font-extrabold px-3.5 py-2 rounded-xl text-xs cursor-pointer select-none transition-transform active:scale-95"
                  title="طباعة كشف درجات الشعبة بشكل مستقل"
                >
                  <Printer size={13} />
                  <span>طباعة الشعبة المستقلة</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
              <Search size={14} className="text-indigo-600 dark:text-indigo-400" />
              <input 
                type="text"
                placeholder="🔍 ابحث عن طالب بالاقتصار الفني على: (اسم الطالب الكريم، الرقم السري للطالب، أو الشعبة الدراسية)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs w-full outline-none font-bold text-slate-800 dark:text-white"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-205">
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-extrabold">
                    <th className="p-3 text-center w-12">م</th>
                    <th className="p-3">اسم الطالب الكريم</th>
                    <th className="p-3 text-center">الرقم السري</th>
                    <th className="p-3 text-center">الشعبة</th>
                    <th className="p-3 text-center">الامتحانات المؤداة</th>
                    <th className="p-3 text-center">متوسط التحصيل التراكمي</th>
                    <th className="p-3 text-center">حالة إكمال الـ 18 درساً</th>
                    <th className="p-3 text-center">رأفة وتقويم مستوفٍ</th>
                   </>
                </thead>
                <tbody>
                  {searchableFilteredStudents
                    .filter(s => printSectionFilter === 'all' ? true : s.classGroup === printSectionFilter)
                    .map((s, idx) => {
                      const rating = s.avgPct >= 95 
                        ? { text: "ممتاز فائق 🏆", color: "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border border-amber-200" } 
                        : s.avgPct >= 80 
                          ? { text: "جيد جداً متميز ⭐", color: "bg-indigo-105 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-400 border border-indigo-200" } 
                          : s.avgPct >= 60 
                            ? { text: "مقبول مستوف ✅", color: "bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-405 border border-emerald-100" } 
                            : { text: "متعثر داعم ⚠️", color: "bg-rose-50 dark:bg-rose-955 text-rose-800 dark:text-rose-450 border border-rose-100" };

                      return (
                        <tr key={idx} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/45 dark:hover:bg-slate-850/40 transition-colors font-semibold">
                          <td className="p-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                          <td className="p-3 font-extrabold text-slate-800 dark:text-slate-150">{s.name}</td>
                          <td className="p-3 text-center font-mono font-bold text-slate-500 dark:text-slate-400">{s.code}</td>
                          <td className="p-3 text-center text-indigo-700 dark:text-indigo-400 font-extrabold">{s.classGroup}</td>
                          <td className="p-3 text-center font-mono text-slate-600 dark:text-slate-400">{s.testCount} اختبار</td>
                          <td className="p-3 text-center font-mono font-black text-indigo-950 dark:text-white text-sm">{s.avgOutOf5} / 5 ({s.avgPct}%)</td>
                          <td className="p-3 text-center">
                            <div className="flex items-center gap-2 justify-center">
                              <span className="w-10 text-right font-mono text-[10px] block font-bold dark:text-slate-305">{s.completionRate}%</span>
                              <div className="w-14 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-gradient-to-r from-indigo-605 to-indigo-700 h-full" style={{ width: `${s.completionRate}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-lg text-[9px] font-black ${rating.color}`}>
                              {rating.text}
                            </span>
                          </td>
                        </table>
                      );
                    })}
                  {searchableFilteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-10 italic font-semibold text-slate-405 dark:text-slate-500">لا توجد سجلات مطابقة جرد شعب المعلم في الصرح حالياً.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-2xs space-y-4 no-print">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-50 dark:border-slate-800 pb-3">
              <div className="space-y-0.5 text-right">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-101 text-sm">🏅 مدونة رصد وسجل العلامات الفردية التفصيلية للاختبارات</h3>
                <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">مراجعة سريعة لأوراق الامتحانات والقدرة التدخلية للمعلم للتعديل أو الإتلاف.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-extrabold">
                    <th className="p-3">اسم الطالب</th>
                    <th className="p-3 text-center">الشعبة</th>
                    <th className="p-3">اسم الدرس المنسق</th>
                    <th className="p-3 text-center">العلامة</th>
                    <th className="p-3 text-center">تأريخ الرصد</th>
                    <th className="p-3 text-left">التعديل التربوي السريع</th>
                   </>
                </thead>
                <tbody>
                  {schoolScores
                    .filter(s => {
                      const query = searchQuery.toLowerCase().trim();
                      const matchClass = classFilter === 'all' ? true : s.classGroup === classFilter;
                      if (!query) return matchClass;
                      
                      const matchName = s.name.toLowerCase().includes(query);
                      const matchCode = s.code.toLowerCase().includes(query);
                      const matchSection = (s.classGroup || '').toLowerCase().includes(query);
                      return matchClass && (matchName || matchCode || matchSection);
                    })
                    .filter(s => printSectionFilter === 'all' ? true : s.classGroup === printSectionFilter)
                    .map((s, idx) => (
                      <tr key={idx} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/40 dark:hover:bg-slate-850/40 transition-colors font-semibold">
                        <td className="p-3 font-extrabold text-slate-800 dark:text-slate-200">{s.name}</td>
                        <td className="p-3 text-center text-indigo-700 dark:text-indigo-400 font-black">{s.classGroup || 'الشعبة أ'}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-350">{s.lessonTitle}</td>
                        <td className="p-3 text-center font-mono text-indigo-950 dark:text-indigo-400 font-black text-sm">{s.score}</td>
                        <td className="p-3 text-center font-mono text-slate-400 text-[10px]">{s.date}</td>
                        <td className="p-3 text-left">
                          <div className="flex justify-end gap-1.5 no-print">
                            <button
                              onClick={() => {
                                const currentEarned = s.score.split('/')[0];
                                const newVal = prompt(`أدخل التعديل لعلامة الطالب (${s.name}) في درس (${s.lessonTitle}) من 5:`, currentEarned);
                                if (newVal !== null) {
                                  handleUpdateStudentScoreInline(s.name, s.lessonId, newVal);
                                }
                              }}
                              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-805 dark:bg-indigo-950 dark:hover:bg-indigo-905 font-bold px-2.5 py-1 rounded-lg text-[9px] cursor-pointer"
                            >
                              ✏️ تعديل درجة
                            </button>
                            <button
                              onClick={() => handleDeleteStudentScoreRecord(s.name, s.lessonId)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-450 font-bold px-2.5 py-1 rounded-lg text-[9px] cursor-pointer"
                              title="إتلاف وثيقة العلامة"
                            >
                              ✕ إتلاف
                            </button>
                          </div>
                        </td>
                      </table>
                    ))}
                  {schoolScores.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 italic font-semibold text-slate-400">لا توجد علامات فردية مسجلة بعد.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="hidden print:block text-right w-full bg-white p-8" dir="rtl">
            
            <div className="flex justify-between items-center border-b-2 border-indigo-950 pb-4 mb-6">
              <div className="text-right">
                <h3 className="font-extrabold text-[#0a122c] text-sm">الجمهورية اليمنية</h3>
                <h4 className="font-bold text-slate-800 text-xs">وزارة التربية والتعليم</h4>
                <h4 className="font-semibold text-slate-700 text-xs">مكتب التربية والتعليم بالأمانة</h4>
                <h4 className="font-black text-indigo-900 text-xs">مقرر: المرجع الذكي للفيزياء</h4>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-1 border-2 border-amber-500 rounded-full flex items-center justify-center font-serif text-lg text-amber-500 font-extrabold">🏆</div>
                <span className="text-[10px] text-indigo-900 border border-indigo-900 px-3 py-0.5 rounded-full uppercase font-black tracking-wider block">كشف المخرجات التنافسي</span>
              </div>
              <div className="text-left text-xs text-slate-800 space-y-0.5">
                <h4>الصرح: <strong className="font-black text-[#0a122c]">{teacherActiveSchool}</strong></h4>
                <h4>المعلم: <strong className="font-bold">{studentName}</strong></h4>
                <h4>الشعبة المفحوصة: <strong className="font-bold text-indigo-800">{printSectionFilter === 'all' ? 'جميع جرد الشعب' : printSectionFilter}</strong></h4>
                <h4>تأريخ الإصدار: <strong className="font-mono font-bold text-slate-500">{new Date().toLocaleDateString('ar-YE')}</strong></h4>
              </div>
            </div>

            <h2 className="text-center text-sm font-black text-indigo-950 mb-5 tracking-wide bg-slate-100 py-2 rounded-xl dark:text-slate-900">
              كشف تقويم نتائج الطلاب {printSectionFilter !== 'all' ? `لـ (${printSectionFilter})` : 'لكافة شعب المدرسة الشريكة'}
            </h2>

            <table className="w-full text-xs text-right border-collapse border border-slate-350 select-none">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-extrabold border border-slate-300">
                  <th className="border border-slate-300 p-2.5 text-center w-12">م</th>
                  <th className="border border-slate-300 p-2.5">اسم الطالب الكريم</th>
                  <th className="border border-slate-300 p-2.5 text-center w-24">الشعبة</th>
                  <th className="border border-slate-300 p-2.5 text-center">الرقم السري</th>
                  <th className="border border-slate-300 p-2.5 text-center">متوسط التحصيل التراكمي</th>
                  <th className="border border-slate-300 p-2.5 text-center">درجة المخرجات (أصل 5)</th>
                  <th className="border border-slate-300 p-2.5 text-center">نسبة إكمال الـ 18 درساً</th>
                  <th className="border border-slate-300 p-2.5 text-center">التقييم الفني والمسلكي</th>
                 </>
              </thead>
              <tbody>
                {schoolStudentsList
                  .filter(s => printSectionFilter === 'all' ? true : s.classGroup === printSectionFilter)
                  .map((s, idx) => (
                    <tr key={idx} className="border border-slate-300">
                      <td className="border border-slate-300 p-2.5 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-300 p-2.5 font-black text-slate-800">{s.name}</td>
                      <td className="border border-slate-300 p-2.5 text-center font-bold">{s.classGroup}</td>
                      <td className="border border-slate-300 p-2.5 text-center font-mono text-slate-500 font-bold">{s.code}</td>
                      <td className="border border-slate-300 p-2.5 text-center font-mono font-extrabold text-slate-850">{s.avgPct}%</td>
                      <td className="border border-slate-300 p-2.5 text-center font-mono font-black text-indigo-950">{s.avgOutOf5} / 5</td>
                      <td className="border border-slate-300 p-2.5 text-center font-mono">{s.completionRate}%</td>
                      <td className="border border-slate-300 p-2.5 text-center font-semibold text-slate-805">
                        {s.avgPct >= 95 ? 'ممتاز فائق 🏆' : s.avgPct >= 80 ? 'جيد جداً متميز ⭐' : s.avgPct >= 60 ? 'مستوف ومجتهد ✅' : 'بحاجة لدعم ومتابعة ⚠️'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            <div className="grid grid-cols-3 gap-8 mt-16 text-center text-xs font-bold pt-6 border-t border-slate-300 select-none">
              <div>
                <h4 className="text-slate-500 mb-9 font-semibold">توقيع المعلم الموجه:</h4>
                <p className="border-b border-dashed border-slate-400 w-32 mx-auto"></p>
                <p className="mt-1 text-slate-900">الأستاذ/ {studentName}</p>
              </div>
              <div>
                <h4 className="text-slate-500 mb-9 font-semibold">توقيع منسق المدرسة:</h4>
                <p className="border-b border-dashed border-slate-400 w-32 mx-auto"></p>
                <p className="mt-1 text-slate-900">إدارة مدرسة/ {teacherActiveSchool}</p>
              </div>
              <div>
                <h4 className="text-slate-500 mb-9 font-semibold">ختم وتوقيع الإدارة المدرسية:</h4>
                <p className="border-b border-dashed border-slate-400 w-32 mx-auto"></p>
                <span className="text-[9px] text-slate-350 block mt-2">(التوقيع والختم المعتمد)</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6 animate-fade-in no-print">
          <ReportCenter 
            currentUserType="teacher"
            schools={schools}
            scores={scores}
            studentAttendances={studentAttendances}
            teachers={teachers}
            allLessons={allLessons}
            selectedSchoolName={studentSchool || ''}
            selectedTeacherName={studentName}
          />
        </div>
      )}

      {showAppraisalModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 w-full max-w-4xl p-6 rounded-3xl shadow-2xl relative text-right space-y-6" dir="rtl">
            
            <button 
              onClick={() => setShowAppraisalModal(false)}
              className="absolute top-4 left-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>

            <div id="school-appraisal-report" className="h-[550px] overflow-y-auto p-4 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-5 bg-stone-50/20 dark:bg-slate-900 font-serif">
              
              <div className="flex justify-between items-center border-b border-double border-slate-400 pb-3">
                <div className="text-xs font-bold leading-tight">
                  <p>الجمهورية اليمنية</p>
                  <p>وزارة التربية والتعليم</p>
                  <p>مكتب الأمانة للتقويم والامتحانات</p>
                </div>
                <div className="text-center">
                  <span className="font-serif font-black text-sm uppercase text-slate-900 dark:text-white">📄 شهادة تقويم الصرح المنهجي الفني</span>
                </div>
                <div className="text-left text-xs font-mono font-semibold">
                  <p>المدرسة: {teacherActiveSchool}</p>
                  <p>بإشراف المعلم: {studentName}</p>
                  <p>تأريخ الإصدار: {new Date().toLocaleDateString('ar-YE')}</p>
                </div>
              </div>

              <h2 className="text-center text-sm font-black text-slate-850 dark:text-slate-100 tracking-wide border-b border-dashed border-slate-205 py-2">
                تقرير شامل على مخرجات ومعدلات تحصيل تحصيل مدرجة بالفيزياء للعام ٢٠٢٦م
              </h2>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                بناءً على الصلاحيات الممنوحة لنا كمعلم تربوي موجه في صرح <strong>{teacherActiveSchool}</strong>، قمنا بجرد وتحليل نتائج وأوراق الرصد التراكمية في حزمة (المرجع الذكي للفيزياء) المعيارية والمكونة من ١٨ درساً متكاملاً، وتبين لنا المعالجة والنتائج المرفقة طيه:
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-100/60 dark:bg-slate-850 rounded-2xl text-xs font-bold border border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="text-slate-450 block">حصر قوة الصرح:</span>
                  <span className="font-mono text-slate-900 dark:text-white font-black">{activeStudentsCount} طلاب فاعلين</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-450 block">المتوسط العام التحصيلي:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">{schoolAverageOutOf5} من 5 ({schoolAveragePct}%)</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-450 block">معدل عبور فحص الدرجة:</span>
                  <span className="font-mono text-indigo-700 dark:text-indigo-400 font-black">{successRate}% نسبة نجاح</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-450 block">النسبة التقديرية للتعثر:</span>
                  <span className="font-mono text-rose-600 block">{strugglingStudentsCount} طالب مدعومين</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <h4 className="font-black text-indigo-950 dark:text-indigo-300">🔎 الملاحظات الفنية للمهارات والشعب بالتفصيل:</h4>
                <ul className="list-disc list-inside space-y-1 pr-3 text-slate-700 dark:text-slate-350">
                  <li>تكتسح <strong className="text-slate-900 dark:text-white">({bestPerformingSection})</strong> قائمة صدارة الشعب بمتوسط فائق ومشرّف، مما يعود لسرعة حل الواجبات.</li>
                  <li>تواجه <strong className="text-slate-900 dark:text-white">({worstPerformingSection})</strong> فجوات تحصيل صفي، ويوصى بجدولة حصص التثبيت.</li>
                  <li>نسبة النجاح الإجمالية المقدرة بـ <strong className="text-indigo-700 dark:text-indigo-400">{successRate}%</strong> هي مؤشر قوة منهجية عالية ومطابقة لضوابط القياس الوطنية.</li>
                </ul>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold italic">
                * تم تصدير واستخراج هذا التقرير التقييمي الأكاديمي المنهجي ليكون مرجعاً موثقاً لمكتب الإشراف التربوي، حفاظاً على جودة التقويم الشامل.
              </div>

              <div className="grid grid-cols-2 gap-8 mt-12 text-center text-xs font-bold pt-6 border-t border-slate-200">
                <div>
                  <h4 className="text-slate-400 mb-8 font-semibold">توقيع المعلم الموجه:</h4>
                  <p className="border-b border-dashed border-slate-300 w-24 mx-auto"></p>
                  <p className="mt-1 text-slate-800 dark:text-slate-200">الأستاذ/ {studentName}</p>
                </div>
                <div>
                  <h4 className="text-slate-400 mb-8 font-semibold">توقيع منسق المدرسة والإدارة:</h4>
                  <p className="border-b border-dashed border-slate-300 w-24 mx-auto"></p>
                  <p className="mt-1 text-slate-800 dark:text-slate-200">إدارة مدرسة/ {teacherActiveSchool}</p>
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-2 text-xs font-black">
              <button
                onClick={() => {
                  window.print();
                }}
                className="bg-indigo-700 hover:bg-indigo-650 text-white px-5 py-2.5 rounded-xl cursor-pointer"
              >
                🖨️ طباعة التقرير فوراً
              </button>
              <button
                onClick={() => setShowAppraisalModal(false)}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white px-5 py-2.5 rounded-xl cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
