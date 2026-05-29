import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Search, 
  Filter, 
  Award, 
  BookOpen, 
  TrendingUp, 
  Users, 
  School as SchoolIcon, 
  UserCheck, 
  Calendar, 
  Compass, 
  Clock, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { StudentScore, School, Teacher, StudentAttendance, Lesson } from '../types';

interface ReportCenterProps {
  currentUserType: 'superadmin' | 'super_admin' | 'school' | 'teacher';
  schools: School[];
  scores: StudentScore[];
  studentAttendances: StudentAttendance[];
  teachers: Teacher[];
  allLessons: Lesson[];
  selectedSchoolName?: string; // Preselected for school coordinator or teacher
  selectedTeacherName?: string; // Preselected for teachers
}

type ReportType = 'grades' | 'classes' | 'teacher_perf' | 'school_perf' | 'achievement' | 'attendance';

export function ReportCenter({
  currentUserType,
  schools,
  scores,
  studentAttendances,
  teachers,
  allLessons,
  selectedSchoolName = '',
  selectedTeacherName = ''
}: ReportCenterProps) {
  const [activeReport, setActiveReport] = useState<ReportType>('grades');

  // --- فلاتر البحث والفرز العامة ---
  const [filterSchool, setFilterSchool] = useState<string>(
    ['school', 'teacher'].includes(currentUserType) ? selectedSchoolName : ''
  );
  const [filterClass, setFilterClass] = useState<string>('');
  const [filterLesson, setFilterLesson] = useState<string>('');
  const [filterStudent, setFilterStudent] = useState<string>('');
  const [filterTeacher, setFilterTeacher] = useState<string>(
    currentUserType === 'teacher' ? selectedTeacherName : ''
  );

  // --- تصفية المدارس والشعب المتاحة تبعا للمستخدم ---
  const availableSchools = useMemo(() => {
    if (['school', 'teacher'].includes(currentUserType)) {
      return schools.filter(s => s.name === selectedSchoolName);
    }
    return schools;
  }, [schools, currentUserType, selectedSchoolName]);

  const availableClasses = useMemo(() => {
    // جلب جميع الشعب الفريدة من كشوف الدرجات المتوفرة
    const classSet = new Set<string>();
    scores.forEach(s => {
      if (s.classGroup) classSet.add(s.classGroup);
    });
    studentAttendances.forEach(a => {
      if (a.classGroup) classSet.add(a.classGroup);
    });
    // إضافة شعب افتراضية في اليمن لو القائمة فارغة
    if (classSet.size === 0) {
      return ['الشعبة أ', 'الشعبة ب', 'الشعبة ج', 'الشعبة د'];
    }
    return Array.from(classSet);
  }, [scores, studentAttendances]);

  // --- تصفية درجات الطلاب بناءً على الفلاتر التفاعلية ---
  const filteredScores = useMemo(() => {
    return scores.filter(item => {
      if (filterSchool && item.school !== filterSchool) return false;
      if (filterClass && item.classGroup !== filterClass) return false;
      if (filterLesson && item.lessonId !== filterLesson) return false;
      if (filterStudent && !item.name.toLowerCase().includes(filterStudent.toLowerCase())) return false;
      return true;
    });
  }, [scores, filterSchool, filterClass, filterLesson, filterStudent]);

  // --- تصفية كشوفات الحضور لتقرير الحضور والغياب ---
  const filteredAttendances = useMemo(() => {
    return studentAttendances.filter(item => {
      if (filterSchool && item.school !== filterSchool) return false;
      if (filterClass && item.classGroup !== filterClass) return false;
      if (filterStudent && !item.studentName.toLowerCase().includes(filterStudent.toLowerCase())) return false;
      return true;
    });
  }, [studentAttendances, filterSchool, filterClass, filterStudent]);

  // ==========================================
  // 1. تقرير كشف درجات الطلاب الفريد (Grades Master Sheet)
  // ==========================================
  const gradesReportData = useMemo(() => {
    const totalCount = filteredScores.length;
    let sumScore = 0;
    let maxScore = 0;
    let passCount = 0;

    filteredScores.forEach(s => {
      const match = s.score.match(/^(\d+(\.\d+)?)\/(\d+)$/);
      if (match) {
        const value = parseFloat(match[1]);
        const max = parseFloat(match[3]);
        const pct = (value / max) * 5; // Normalize to 5 points
        sumScore += pct;
        if (pct > maxScore) maxScore = pct;
        if (value >= max * 0.6) passCount++; // 60% is passing
      } else {
        const val = parseFloat(s.score) || 0;
        sumScore += val;
        if (val > maxScore) maxScore = val;
        if (val >= 3) passCount++;
      }
    });

    const average = totalCount > 0 ? (sumScore / totalCount) : 0;
    const passRate = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;

    return {
      totalCount,
      average: average.toFixed(2),
      maxScore: maxScore.toFixed(1),
      passRate,
      list: filteredScores
    };
  }, [filteredScores]);

  // ==========================================
  // 2. تقرير كشف نتائج الشعبة (Class Performance Sheet)
  // ==========================================
  const classReportData = useMemo(() => {
    const classGroupStats: { [key: string]: { total: number, sum: number, studentScores: { [name: string]: number[] }, names: Set<string> } } = {};

    scores.forEach(s => {
      const cls = s.classGroup || 'غير مصنف';
      const sch = s.school;
      if (filterSchool && sch !== filterSchool) return;

      if (!classGroupStats[cls]) {
        classGroupStats[cls] = { total: 0, sum: 0, studentScores: {}, names: new Set() };
      }

      const match = s.score.match(/^(\d+(\.\d+)?)\/(\d+)$/);
      const val = match ? (parseFloat(match[1]) / parseFloat(match[3])) * 5 : (parseFloat(s.score) || 0);

      classGroupStats[cls].total++;
      classGroupStats[cls].sum += val;
      classGroupStats[cls].names.add(s.name);

      if (!classGroupStats[cls].studentScores[s.name]) {
        classGroupStats[cls].studentScores[s.name] = [];
      }
      classGroupStats[cls].studentScores[s.name].push(val);
    });

    return Object.entries(classGroupStats).map(([className, stat]) => {
      const avg = stat.total > 0 ? (stat.sum / stat.total) : 0;
      const studentAverages = Object.entries(stat.studentScores).map(([name, scList]) => {
        const sum = scList.reduce((a, b) => a + b, 0);
        return { name, avg: sum / scList.length };
      }).sort((a, b) => b.avg - a.avg);

      const topStudents = studentAverages.slice(0, 3).map(st => st.name);

      return {
        className,
        totalScores: stat.total,
        studentCount: stat.names.size,
        avgOutOf5: avg.toFixed(2),
        avgPercentage: Math.round((avg / 5) * 100),
        topStudents,
        allStudentsList: studentAverages
      };
    });
  }, [scores, filterSchool]);

  // ==========================================
  // 3. تقرير أداء المعلم الموجه (Teacher Performance)
  // ==========================================
  const teacherPerformanceData = useMemo(() => {
    // تجميع الإحصائيات للمعلمين
    return teachers.map(tea => {
      // لوحة تصفية المعلم لو المعلم مسجل
      if (filterTeacher && tea.name !== filterTeacher) return null;
      
      const teacherSchoolName = tea.schoolId; // schoolId mapped as schoolName locally representation
      // العثور على درجات الصرح التعليمي التابع له المعلم
      const teaScores = scores.filter(s => s.school === tea.schoolId);
      const studentNames = Array.from(new Set(teaScores.map(s => s.name)));
      
      let totalAssessed = teaScores.length;
      let sumGrades = 0;
      teaScores.forEach(s => {
        const match = s.score.match(/^(\d+(\.\d+)?)\/(\d+)$/);
        const val = match ? (parseFloat(match[1]) / parseFloat(match[3])) * 5 : (parseFloat(s.score) || 0);
        sumGrades += val;
      });

      const avgClassScore = totalAssessed > 0 ? (sumGrades / totalAssessed) : 0;

      // قياس تفاعل المعلم (مثلا حضور مسجل، أو فصول مضافة)
      const teaClasses = tea.myClasses || ['الشعبة أ', 'الشعبة ب'];
      const classCount = teaClasses.length;

      // نسبة التقدم في تدريس المنهج (مقدرة بعدد الواجبات والامتحانات على مدار الـ 18 فصلاً)
      const uniqueLessonTests = Array.from(new Set(teaScores.map(s => s.lessonId))).length;
      const curriculumProgress = Math.min(100, Math.round((uniqueLessonTests / 18) * 100));

      return {
        id: tea.id,
        name: tea.name,
        school: tea.schoolId || 'مدرسة عامة غير مصنفة',
        username: tea.username || 'لم يعين',
        classes: teaClasses.join('، '),
        classCount,
        studentCount: studentNames.length,
        totalAssessed,
        avgGrade: avgClassScore.toFixed(2),
        curriculumProgress,
        status: tea.status || 'active'
      };
    }).filter(Boolean);
  }, [teachers, scores, filterTeacher]);

  // ==========================================
  // 4. تقرير أداء المدرسة (School Quality Report)
  // ==========================================
  const schoolPerformanceData = useMemo(() => {
    return schools.map(sch => {
      if (filterSchool && sch.name !== filterSchool) return null;

      const schScores = scores.filter(s => s.school === sch.name);
      const schAttendance = studentAttendances.filter(a => a.school === sch.name);
      
      const uniqueStudents = Array.from(new Set(schScores.map(s => s.name)));
      
      let sumGrades = 0;
      schScores.forEach(s => {
        const match = s.score.match(/^(\d+(\.\d+)?)\/(\d+)$/);
        const val = match ? (parseFloat(match[1]) / parseFloat(match[3])) * 5 : (parseFloat(s.score) || 0);
        sumGrades += val;
      });

      const schoolAvg = schScores.length > 0 ? (sumGrades / schScores.length) : 0;

      // احتساب الحضور
      const presentCount = schAttendance.filter(a => a.status === 'present').length;
      const lateCount = schAttendance.filter(a => a.status === 'late').length;
      const totalAtt = schAttendance.length;
      // احتساب نسبي: الحاضرون 100%، المتأخرون 80%، الغائبون 0%
      const attendanceRate = totalAtt > 0 
        ? Math.round(((presentCount + lateCount * 0.8) / totalAtt) * 100) 
        : 100; // افتراضي في غياب البيانات

      // التقييم الجغرافي الفخري للأستاذ سياف
      let rank = 'متميز 🌿';
      if (schoolAvg >= 4.5) rank = 'صرح ذهبي متفوق 👑';
      else if (schoolAvg >= 3.8) rank = 'نموذجي من الفئة أ ✨';
      else if (schoolAvg >= 3.0) rank = 'جيد جداً قائم بالتطوير 🌟';
      else rank = 'تحت المتابعة الدورية 📝';

      return {
        id: sch.id,
        name: sch.name,
        studentCount: uniqueStudents.length,
        totalTests: schScores.length,
        avgGrade: schoolAvg.toFixed(2),
        avgPercentage: Math.round((schoolAvg / 5) * 100),
        attendanceRate,
        rank,
        plan: sch.plan || 'الترخيص المجاني'
      };
    }).filter(Boolean);
  }, [schools, scores, studentAttendances, filterSchool]);

  // ==========================================
  // 5. تقرير الإنجاز والمتابعة المنهجية (Student Progress Sheet)
  // ==========================================
  const studentProgressData = useMemo(() => {
    // تجميع الدرجات بالكامل لكل طالب بشكل فريد
    const studentStats: { [name: string]: { school: string, classGroup: string, attemptedLessons: Set<string>, totalScore: number, testCount: number } } = {};

    scores.forEach(s => {
      // تطبيق فلاتر المدرسة والصف
      if (filterSchool && s.school !== filterSchool) return;
      if (filterClass && s.classGroup !== filterClass) return;
      if (filterStudent && !s.name.toLowerCase().includes(filterStudent.toLowerCase())) return;

      if (!studentStats[s.name]) {
        studentStats[s.name] = {
          school: s.school,
          classGroup: s.classGroup || 'الشعبة أ',
          attemptedLessons: new Set(),
          totalScore: 0,
          testCount: 0
        };
      }

      const match = s.score.match(/^(\d+(\.\d+)?)\/(\d+)$/);
      const val = match ? (parseFloat(match[1]) / parseFloat(match[3])) * 5 : (parseFloat(s.score) || 0);

      studentStats[s.name].attemptedLessons.add(s.lessonId);
      studentStats[s.name].totalScore += val;
      studentStats[s.name].testCount++;
    });

    return Object.entries(studentStats).map(([name, stats]) => {
      const lessonsCount = stats.attemptedLessons.size;
      const progressPct = Math.round((lessonsCount / 18) * 100);
      const avgScore = stats.testCount > 0 ? (stats.totalScore / stats.testCount) : 0;

      // مستوى الإنجاع والتمكين العلمي
      let level = 'مكافح المبدأ 🛡️';
      if (progressPct >= 80 && avgScore >= 4.5) level = 'مفكر فيزيائي فذ 🏅';
      else if (progressPct >= 50 && avgScore >= 3.8) level = 'منارة علمية صاعدة 🚀';
      else if (avgScore >= 4.0) level = 'متميز التحصيل 📚';

      return {
        name,
        school: stats.school,
        classGroup: stats.classGroup,
        lessonsCount,
        progressPct,
        avgScore: avgScore.toFixed(2),
        level
      };
    }).sort((a, b) => b.progressPct - a.progressPct || parseFloat(b.avgScore) - parseFloat(a.avgScore));
  }, [scores, filterSchool, filterClass, filterStudent]);

  // ==========================================
  // 6. تقرير حضور وغياب الطلاب الموحد (Attendance Master Report)
  // ==========================================
  const attendanceReportData = useMemo(() => {
    const totalCount = filteredAttendances.length;
    const presentCount = filteredAttendances.filter(a => a.status === 'present').length;
    const absentCount = filteredAttendances.filter(a => a.status === 'absent').length;
    const lateCount = filteredAttendances.filter(a => a.status === 'late').length;

    const presentRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
    const absentRate = totalCount > 0 ? Math.round((absentCount / totalCount) * 100) : 0;
    const lateRate = totalCount > 0 ? Math.round((lateCount / totalCount) * 100) : 0;

    return {
      totalCount,
      presentCount,
      absentCount,
      lateCount,
      presentRate,
      absentRate,
      lateRate,
      list: filteredAttendances
    };
  }, [filteredAttendances]);

  // ==========================================
  // دوال التصدير والطباعة الإجرائية الفورية
  // ==========================================
  const handlePrint = () => {
    window.print();
  };

  const exportCSV = (reportName: string, headers: string[], rows: string[][]) => {
    // استخدام الـ Byte Order Mark لتمكين مايكروسوفت إكسيل من عرض شفرة اللغة العربية بصورة فائقة وواضحة
    const BOM = '\uFEFF';
    const csvContent = BOM + [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `تقرير_${reportName}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // معالجة تصدير التقارير النشطة لكل الصيغ
  const triggerExport = (format: 'Excel' | 'CSV') => {
    let reportTitle = '';
    let headers: string[] = [];
    let rows: string[][] = [];

    if (activeReport === 'grades') {
      reportTitle = 'درجات_الطلاب';
      headers = ['الاسم الكريم', 'الصرح التعليمي', 'الشعبة الصفية', 'المقرر/الدرس المختبر', 'الدرجة المرصودة', 'التاريخ والوقت'];
      rows = gradesReportData.list.map(s => [
        s.name,
        s.school,
        s.classGroup || 'الشعبة أ',
        s.lessonTitle,
        s.score,
        s.date
      ]);
    } else if (activeReport === 'classes') {
      reportTitle = 'نتائج_الشعب';
      headers = ['الشعبة الدراسية', 'عدد الطلاب المفحوصين', 'إجمالي الرصد القياسي', 'المعدل من 5', 'التحصيل النسبي %', 'أوائل الطلاب بالشعبة'];
      rows = classReportData.map(c => [
        c.className,
        c.studentCount.toString(),
        c.totalScores.toString(),
        c.avgOutOf5,
        `${c.avgPercentage}%`,
        c.topStudents.join(' | ')
      ]);
    } else if (activeReport === 'teacher_perf') {
      reportTitle = 'أداء_المعلمين';
      headers = ['اسم المعلم الموجه', 'الصرح الدراسي المرتبط', 'حساب الدخول بالوزارة', 'الشعب المكلف بها', 'إجمالي كشوف الطلاب', 'معدل درجات الطلاب', 'معدل التقدم بالمنهج %'];
      rows = teacherPerformanceData.map(t => t ? [
        t.name,
        t.school,
        t.username,
        t.classes,
        t.totalAssessed.toString(),
        t.avgGrade,
        `${t.curriculumProgress}%`
      ] : []);
    } else if (activeReport === 'school_perf') {
      reportTitle = 'أداء_المدارس';
      headers = ['اسم المدرسة الشريكة', 'عدد الطلاب المعينين', 'إجمالي المحاولات العلمية', 'المعدل العام للمدرسة/5', 'النجاح النسبي %', 'مؤشر حضور الطلاب %', 'التقييم الفخري والجودة', 'نوع الترخيص'];
      rows = schoolPerformanceData.map(s => s ? [
        s.name,
        s.studentCount.toString(),
        s.totalTests.toString(),
        s.avgGrade,
        `${s.avgPercentage}%`,
        `${s.attendanceRate}%`,
        s.rank,
        s.plan
      ] : []);
    } else if (activeReport === 'achievement') {
      reportTitle = 'إنجاز_وعباقرة_الفيزياء';
      headers = ['اسم الطالب المبدع', 'المدرسة المرتبطة', 'الشعبة الدراسية', 'الدروس المكتملة / 18', 'نسبة التقدم بالمنهج %', 'معدل الدرجات / 5', 'مرتبة التمكين والوسام الممنوح'];
      rows = studentProgressData.map(s => [
        s.name,
        s.school,
        s.classGroup,
        s.lessonsCount.toString(),
        `${s.progressPct}%`,
        s.avgScore,
        s.level
      ]);
    } else if (activeReport === 'attendance') {
      reportTitle = 'رصد_حضور_الطلاب';
      headers = ['اسم الطالب', 'الصرح المدرسي', 'الشعبة', 'حالة الحضور', 'تاريخ الرصد'];
      rows = attendanceReportData.list.map(a => [
        a.studentName,
        a.school,
        a.classGroup,
        a.status === 'present' ? 'حاضر 🟢' : a.status === 'late' ? 'متأخر 🟡' : 'غائب 🔴',
        a.date
      ]);
    }

    exportCSV(reportTitle, headers, rows);
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 p-4 md:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all" dir="rtl">
      
      {/* ستايل مخصص للطباعة يتيح تصفية العناصر التفاعلية وضغط التقرير في ورقة رسمية */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* إخفاء كل شيء بالمنصة عدا حاوية الطباعة الخاصة بمركز التقارير */
          body > div:not(#printable-report-area),
          header,
          footer,
          #staff-admin-toolbar,
          .no-print {
            display: none !important;
          }
          #printable-report-area {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            direction: rtl !important;
          }
          table {
            page-break-inside: auto;
            border-collapse: collapse !important;
            width: 100% !important;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
        }
      `}</style>

      {/* حاوية التقرير الكاملة القابلة للطباعة مباشرة */}
      <div id="printable-report-area" className="space-y-6">
        
        {/* أهلاً بالرأس الرسمي للجمهورية والوزارة في ترويسة الطباعة */}
        <div className="hidden print:block border-b-2 border-slate-905 pb-5 text-center">
          <div className="flex justify-between items-center text-xs font-black text-slate-800">
            <div className="text-right">
              <p>الجمهورية اليمنية</p>
              <p>وزارة التربية والتعليم</p>
              <p>قطاع التوجيه والتقويم التربوي</p>
              <p>مدرسة المستفيد: {filterSchool || selectedSchoolName || "الصروح اليمنية المتكاملة"}</p>
            </div>
            <div className="text-center">
              <span className="text-lg font-black block">⚛️ منصة المرجع الذكي للفيزياء العامة</span>
              <span className="text-[10px] bg-slate-100 rounded-lg px-2.5 py-1 block mt-1 font-mono">تاريخ التقرير: {new Date().toLocaleDateString('ar-YE')}</span>
            </div>
            <div className="text-left font-mono">
              <p>المشرف العام: أ. سياف الشباطي</p>
              <p>نظام رصد المدارس المعتمد</p>
              <p>النسخة v4.11</p>
            </div>
          </div>
          <h2 className="text-base font-black text-slate-900 mt-5 border border-slate-400 p-2 rounded-xl inline-block">
            {activeReport === 'grades' && "📃 كشف درجات وتحصيل الطلاب الدوري"}
            {activeReport === 'classes' && "🏫 التقرير الإحصائي لمخرجات ونتائج الشعب الدراسية"}
            {activeReport === 'teacher_perf' && "👨‍🏫 تقرير الكفاءة الفنية وأداء المعلم الموجه"}
            {activeReport === 'school_perf' && "🏢 تقرير ضمان الجودة والتقويم الشامل للمؤسسة البديلة"}
            {activeReport === 'achievement' && "🏆 كشف كبار عباقرة الفيزياء ومنجز المنهج المدرسي"}
            {activeReport === 'attendance' && "📅 التقرير التفصيلي لرصد حضور ومواظبة الطلاب"}
          </h2>
        </div>

        {/* رأس التبويبات التفاعلي (مخفي بالطباعة) */}
        <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-650 bg-indigo-50 dark:bg-indigo-950 dark:text-indigo-350 px-2.5 py-1 rounded-md">
              📊 مركز التقارير القياسي المتكامل (Unified Analytics Hub)
            </span>
            <h2 className="text-base font-black text-slate-800 dark:text-white mt-1">📡 منظومة الرصد واستخراج التقارير الرسمية المصنفة</h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-205 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
            >
              <Printer size={14} className="text-slate-600 dark:text-slate-350" />
              <span>🖨️ طباعة التقرير</span>
            </button>
            <button
              onClick={() => triggerExport('Excel')}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-250 font-extrabold rounded-xl text-xs transition-all cursor-pointer border border-emerald-200/50 dark:border-emerald-900/50 shadow-2xs hover:shadow-xs active:scale-95"
            >
              <Download size={14} className="text-emerald-700 dark:text-emerald-400" />
              <span>💾 تصدير كملف Excel / CSV</span>
            </button>
          </div>
        </div>

        {/* فلاتر البحث والفرز التفاعلية بالقسم العلوي (مخفي بالطباعة) */}
        <div className="no-print bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 md:shadow-2xs space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-750 dark:text-slate-300">
            <Filter size={14} className="text-indigo-600" />
            <span>خيارات الفرز والتصفية القياسية:</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            
            {/* مصفاة الصرح الدراسي */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-500 dark:text-slate-400">الصرح المصدّر / المدرسة:</label>
              <select
                value={filterSchool}
                onChange={(e) => setFilterSchool(e.target.value)}
                disabled={['school', 'teacher'].includes(currentUserType)}
                className="w-full bg-slate-5 hover:bg-slate-10 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none p-2 rounded-xl font-bold dark:text-white"
              >
                <option value="">-- جميع المدارس المسجلة --</option>
                {availableSchools.map(sch => (
                  <option key={sch.id} value={sch.name}>{sch.name}</option>
                ))}
              </select>
            </div>

            {/* شعب الفصل المنفصلة */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-500 dark:text-slate-400">شعبة الصف المراد دراسته:</label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full bg-slate-5 hover:bg-slate-10 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none p-2 rounded-xl font-bold dark:text-white"
              >
                <option value="">-- جميع شعب الثانوية --</option>
                {availableClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            {/* مصفاة الواجبات والامتحانات والدروس ال 18 */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-500 dark:text-slate-400">الوحدة المنهجية المختبرة:</label>
              <select
                value={filterLesson}
                onChange={(e) => setFilterLesson(e.target.value)}
                className="w-full bg-slate-5 hover:bg-slate-15 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none p-2 rounded-xl font-bold dark:text-white max-w-full"
              >
                <option value="">-- جميع اختبارات المنهج الـ 18 --</option>
                {allLessons.map(l => (
                  <option key={l.id} value={l.id}>{l.title} ({l.unit})</option>
                ))}
              </select>
            </div>

            {/* فلتر البحث المباشر باسم الطالب الكريم */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-500 dark:text-slate-400">البحث بالاسم الكريم للطالب:</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="اكتب اسم الطالب..."
                  value={filterStudent}
                  onChange={(e) => setFilterStudent(e.target.value)}
                  className="w-full bg-slate-5 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none pr-8 pl-3 py-2 rounded-xl font-bold dark:text-white"
                />
                <Search size={13} className="absolute right-3 top-3 text-slate-400" />
              </div>
            </div>

          </div>
        </div>

        {/* شريط تبويبات اختيار نوع التقرير الفخري بالرصد (مخفي بالطباعة) */}
        <div className="no-print flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          
          <button
            onClick={() => setActiveReport('grades')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeReport === 'grades' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <FileText size={14} />
            <span>📃 كشف درجات الطلاب</span>
          </button>

          <button
            onClick={() => setActiveReport('classes')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeReport === 'classes' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <Users size={14} />
            <span>🏫 كشف نتائج الشعبة</span>
          </button>

          <button
            onClick={() => setActiveReport('teacher_perf')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeReport === 'teacher_perf' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <UserCheck size={14} />
            <span>👨‍🏫 تقرير أداء المعلم</span>
          </button>

          <button
            onClick={() => setActiveReport('school_perf')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeReport === 'school_perf' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <SchoolIcon size={14} />
            <span>🏢 تقرير أداء المدرسة</span>
          </button>

          <button
            onClick={() => setActiveReport('achievement')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeReport === 'achievement' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <Award size={14} />
            <span>🏆 تقرير الإنجاز الدراسي</span>
          </button>

          <button
            onClick={() => setActiveReport('attendance')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeReport === 'attendance' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar size={14} />
            <span>📅 تقرير غياب وحضور الطلاب</span>
          </button>

        </div>

        {/* ========================================== */}
        {/* العرض البصري ومحتوى التقارير المختلفة */}
        {/* ========================================== */}
        
        {/* أ. لوحة استعراض كشف درجات الطلاب */}
        {activeReport === 'grades' && (
          <div className="space-y-4 animate-fade-in text-right">
            
            {/* ملخص احصاءات درجات الطلاب التفاعلية */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-right">
                <span className="text-[10px] text-slate-400 font-extrabold block">إجمالي كشوف الإجابات</span>
                <span className="text-xl font-black text-indigo-700 dark:text-indigo-400 font-mono mt-1 block">{gradesReportData.totalCount} اختبارات</span>
              </div>
              
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-right">
                <span className="text-[10px] text-slate-400 font-extrabold block">متوسط درجات الطلاب</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">{gradesReportData.average} / 5</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-right">
                <span className="text-[10px] text-slate-400 font-extrabold block">أعلى رصد قياسي فيزيائي</span>
                <span className="text-xl font-black text-amber-500 font-mono mt-1 block">{gradesReportData.maxScore} / 5</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-right">
                <span className="text-[10px] text-slate-400 font-extrabold block">معدل اجتياز الاختبارات</span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono mt-1 block">{gradesReportData.passRate}%</span>
              </div>
            </div>

            {/* كشف درجات الدروس كجدول رئيسي */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-2xs overflow-hidden">
              <div className="no-print bg-slate-50 dark:bg-slate-80/40 px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-extrabold text-slate-800 dark:text-white text-xs">📋 كشف تفصيلي بنتائج الأرصدة المعتمدة بالمنظومة:</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-505 dark:text-slate-350 border-b border-slate-100 dark:border-slate-820 font-black">
                      <th className="p-3 text-center">م</th>
                      <th className="p-3">اسم الطالب الكريم</th>
                      <th className="p-3">المدرسة الشريكة</th>
                      <th className="p-3">الشعبة</th>
                      <th className="p-3">المقرر / الدرس المختبر</th>
                      <th className="p-3 text-center">الدرجة التفصيلية</th>
                      <th className="p-3 text-left">تاريخ محاولة الرصد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-802">
                    {gradesReportData.list.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="p-3 text-center font-bold text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-3 font-extrabold text-slate-850 dark:text-white">{s.name}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300 font-semibold">{s.school}</td>
                        <td className="p-3 text-slate-650 dark:text-slate-320 font-bold">{s.classGroup || 'الشعبة أ'}</td>
                        <td className="p-3 text-indigo-700 dark:text-indigo-400 font-bold">{s.lessonTitle}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full font-black font-mono text-[10px] ${
                            s.score.includes('5/5') || s.score.includes('4/5')
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                              : 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {s.score}
                          </span>
                        </td>
                        <td className="p-3 text-left font-mono text-[10px] text-slate-400">{s.date}</td>
                      </tr>
                    ))}
                    {gradesReportData.list.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-400 dark:text-slate-505 italic font-semibold">
                          📭 لم يتم العثور على أي نتائج وفق فلاتر البحث الحالية.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ب. لوحة كشف نتائج ومخرجات الشعبة */}
        {activeReport === 'classes' && (
          <div className="space-y-6 animate-fade-in text-right">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {classReportData.map((cGroup, index) => (
                <div key={index} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-3xs">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white text-sm">🏫 {cGroup.className}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">مؤشرات الأداء الدراسي والتحصيلي الكلي</p>
                    </div>
                    <span className="bg-indigo-50 text-indigo-805 dark:bg-indigo-950 dark:text-indigo-305 text-[9px] font-black px-2.5 py-1 rounded-lg">
                      {cGroup.studentCount} طلاب مسجلين
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 dark:bg-slate-802 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-semibold block">إجمالي الرصد</span>
                      <strong className="text-slate-850 dark:text-white font-black font-mono mt-1 block">{cGroup.totalScores}</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-802 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-semibold block">المعدل من 5</span>
                      <strong className="text-emerald-700 dark:text-emerald-400 font-black font-mono mt-1 block">{cGroup.avgOutOf5}</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-802 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-semibold block">نسبة التحصيل</span>
                      <strong className="text-indigo-600 dark:text-indigo-400 font-black font-mono mt-1 block">{cGroup.avgPercentage}%</strong>
                    </div>
                  </div>

                  {/* شريط الإحصاء البياني للتحصيل بالشعبة */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 dark:text-slate-405">
                      <span>مستوى الفهم الشامل والاستيعاب للطلاب</span>
                      <span>{cGroup.avgPercentage}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600" 
                        style={{ width: `${cGroup.avgPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* أوائل الطلاب بالشعبة */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-amber-500 block">🏆 أوائل وطلائع الشعبة المتميزين:</span>
                    <div className="flex flex-wrap gap-2">
                      {cGroup.topStudents.map((name, i) => (
                        <span key={i} className="text-[10px] bg-amber-50 text-amber-805 dark:bg-amber-950/40 dark:text-amber-305 px-2.5 py-1 rounded-lg border border-amber-205 border-dashed flex items-center gap-1 font-semibold">
                          <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                          <span>{name}</span>
                        </span>
                      ))}
                      {cGroup.topStudents.length === 0 && (
                        <span className="text-[10px] text-slate-400 italic">لا يوجد كشوف رصد شعب بعد.</span>
                      )}
                    </div>
                  </div>

                </div>
              ))}
              {classReportData.length === 0 && (
                <div className="md:col-span-2 text-center py-12 text-slate-400 dark:text-slate-505 italic font-semibold">
                  📭 لا تتوافر أي كشوف تحصيلية شعبوية بالخيارات الحالية.
                </div>
              )}
            </div>

          </div>
        )}

        {/* ج. تقرير كفاءة وأداء المعلم الموجه */}
        {activeReport === 'teacher_perf' && (
          <div className="space-y-4 animate-fade-in text-right">
            
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-2xs overflow-hidden">
              <div className="no-print bg-slate-50 dark:bg-slate-81 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <span className="font-extrabold text-slate-800 dark:text-white text-xs">👨‍🏫 كشف كفاءة الأداء الفعلي لأقسام المعلمين الموجهين:</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-505 dark:text-slate-350 border-b border-slate-100 dark:border-slate-820 font-black">
                      <th className="p-3">اسم المعلم الموجه الكريم</th>
                      <th className="p-3">الصرح الدراسي للرصد</th>
                      <th className="p-3">حساب الدخول المعتمد</th>
                      <th className="p-3">شعب المراقبة والمتابعة</th>
                      <th className="p-3 text-center">إجمالي كشوفات الرصد</th>
                      <th className="p-3 text-center">متوسط درجات الفحص والامتحان</th>
                      <th className="p-3 text-left">أدوات الترشيح والنشاط المنهجي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-802">
                    {teacherPerformanceData.map((tea, idx) => tea && (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="p-3 font-extrabold text-slate-850 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <span>{tea.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-350 font-semibold">{tea.school}</td>
                        <td className="p-3 text-indigo-700 dark:text-indigo-400 font-mono font-semibold">{tea.username}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400 font-semibold text-[10px] max-w-[150px] truncate" title={tea.classes}>{tea.classes}</td>
                        <td className="p-3 text-center font-bold font-mono">{tea.totalAssessed} رصد مباشر</td>
                        <td className="p-3 text-center font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                          {tea.avgGrade} / 5
                        </td>
                        <td className="p-3 text-left">
                          <div className="inline-flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 block font-semibold">معدل تمكين المنهج:</span>
                            <span className="bg-indigo-50 text-indigo-805 dark:bg-indigo-950 dark:text-indigo-305 px-2 py-0.5 rounded-full font-black font-mono text-[10px]">
                              {tea.curriculumProgress}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {teacherPerformanceData.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-400 dark:text-slate-505 italic font-semibold">
                          📭 لا يوجد معلمين معتمدين للتقرير المذكور.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* د. تقرير أداء المدرسة العام الفخري القياسي */}
        {activeReport === 'school_perf' && (
          <div className="space-y-4 animate-fade-in text-right">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schoolPerformanceData.map((sch, idx) => sch && (
                <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-3xs">
                  <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="bg-indigo-650 hover:bg-slate-95 /1 w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-xs">{sch.name}</h3>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1">المعرف الرسمي للمنشأة بالجمهورية اليمنية: #{sch.id}</p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-black px-2 py-1 rounded-md">
                      {sch.plan}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                    <div className="bg-slate-50 dark:bg-slate-802 p-2 rounded-xl">
                      <span className="text-[9px] text-slate-400 block font-bold">المنتسبين</span>
                      <strong className="text-slate-800 dark:text-white font-mono font-black">{sch.studentCount} طلاب</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-802 p-2 rounded-xl">
                      <span className="text-[9px] text-slate-400 block font-bold">المحاولات الكلية</span>
                      <strong className="text-slate-800 dark:text-white font-mono font-black">{sch.totalTests} اختبار</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-802 p-2 rounded-xl">
                      <span className="text-[9px] text-slate-400 block font-bold">المعدل العام</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-black">{sch.avgGrade} / 5</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-802 p-2 rounded-xl">
                      <span className="text-[9px] text-slate-400 block font-bold">حضور الطلاب</span>
                      <strong className="text-blue-600 dark:text-blue-400 font-mono font-black">{sch.attendanceRate}%</strong>
                    </div>
                  </div>

                  {/* التقويم الشامل فائق الدقة والمستوى الممنوح للمدرسة */}
                  <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-205 dark:border-amber-900/30 p-2.5 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-705 dark:text-amber-250">
                    <span className="text-[10px]">مستوى جودة مخرجات التعليم المقيّمة:</span>
                    <span className="font-extrabold text-amber-705 dark:text-amber-400">{sch.rank}</span>
                  </div>

                </div>
              ))}
              {schoolPerformanceData.length === 0 && (
                <div className="md:col-span-2 text-center py-12 text-slate-400 dark:text-slate-505 italic font-semibold">
                  📭 لا يتاح أي تفاصيل للمؤسسات المفلترة حالياً.
                </div>
              )}
            </div>

          </div>
        )}

        {/* هـ. تقرير التمكين الأكاديمي وسجل الإنجاز والعباقرة */}
        {activeReport === 'achievement' && (
          <div className="space-y-4 animate-fade-in text-right">
            
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-2xs overflow-hidden">
              <div className="no-print bg-slate-50 dark:bg-slate-81 px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-extrabold text-slate-800 dark:text-white text-xs">🏆 طلائع الفيزياء والمتابعة الزمنية لإتمام الـ 18 فصلاً دراسياً بالمنصة:</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-505 dark:text-slate-350 border-b border-slate-100 dark:border-slate-820 font-black">
                      <th className="p-3 text-center">الترتيب الشرفي</th>
                      <th className="p-3">اسم الطالب المبدع</th>
                      <th className="p-3">الصرح التعليمي</th>
                      <th className="p-3">الشعبة</th>
                      <th className="p-3 text-center">الدروس المكتملة</th>
                      <th className="p-3 text-center">الشريط البياني للإنجاز</th>
                      <th className="p-3 text-center">متوسط الفهم والتمكين</th>
                      <th className="p-3 text-left">المرتبة الفدية الحالية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-802">
                    {studentProgressData.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="p-3 text-center">
                          <span className={`w-6 h-6 rounded-full font-mono font-black border flex items-center justify-center text-[10px] mx-auto ${
                            idx === 0 
                              ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300' 
                              : idx === 1 
                                ? 'bg-slate-100 border-slate-300 text-slate-705 dark:bg-slate-800'
                                : idx === 2
                                  ? 'bg-orange-50 border-orange-200 text-orange-705 dark:bg-amber-950'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="p-3 font-extrabold text-slate-850 dark:text-white">{s.name}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300 font-semibold">{s.school}</td>
                        <td className="p-3 text-slate-650 dark:text-slate-400 font-bold">{s.classGroup}</td>
                        <td className="p-3 text-center font-bold font-mono text-indigo-700 dark:text-indigo-400">{s.lessonsCount} / 18 دروساً</td>
                        <td className="p-3 max-w-[120px]">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full flex-1 overflow-hidden min-w-[60px]">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600" 
                                style={{ width: `${s.progressPct}%` }}
                              />
                            </div>
                            <span className="font-mono text-[9px] text-slate-405 font-bold">{s.progressPct}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-center font-black text-emerald-600 dark:text-emerald-400 font-mono">{s.avgScore} / 5</td>
                        <td className="p-3 text-left">
                          <span className="text-[10px] text-indigo-805 dark:text-indigo-305 font-black block">{s.level}</span>
                        </td>
                      </tr>
                    ))}
                    {studentProgressData.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-slate-400 dark:text-slate-505 italic font-semibold">
                          📭 لا يتاح أي كشوف تفاصيل إنجازات الطلاب حالياً.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* و. تقرير كشف رصد حضور وغياب الطلاب */}
        {activeReport === 'attendance' && (
          <div className="space-y-4 animate-fade-in text-right">
            
            {/* ملخص احصاءات الحضور والغياب */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-right">
                <span className="text-[10px] text-slate-400 font-extrabold block">إجمالي التسجيلات المرصودة</span>
                <span className="text-xl font-black text-slate-750 dark:text-white font-mono mt-1 block">{attendanceReportData.totalCount} لقاء تم تسجيله</span>
              </div>
              
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200/40 dark:border-emerald-900/20 text-right">
                <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-extrabold block">نسبة الحضور التام</span>
                <span className="text-xl font-black text-emerald-600 font-mono mt-1 block">{attendanceReportData.presentRate}% ({attendanceReportData.presentCount} طلاب)</span>
              </div>

              <div className="bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200/40 dark:border-amber-900/20 text-right">
                <span className="text-[10px] text-amber-800 dark:text-amber-400 font-extrabold block">نسبة تأخر حضور الحصة</span>
                <span className="text-xl font-black text-amber-500 font-mono mt-1 block">{attendanceReportData.lateRate}% ({attendanceReportData.lateCount} حالات)</span>
              </div>

              <div className="bg-rose-50/50 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-200/40 dark:border-rose-900/20 text-right">
                <span className="text-[10px] text-rose-800 dark:text-rose-400 font-extrabold block">معدل الغياب الإجمالي</span>
                <span className="text-xl font-black text-rose-600 font-mono mt-1 block">{attendanceReportData.absentRate}% ({attendanceReportData.absentCount} غيابات)</span>
              </div>
            </div>

            {/* تفاصيل الحضور اليومي الكلي */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-505 dark:text-slate-350 border-b border-slate-100 dark:border-slate-820 font-black">
                      <th className="p-3 text-center">م</th>
                      <th className="p-3">اسم الطالب الفاضل</th>
                      <th className="p-3">الصرح المدرسي الكلي</th>
                      <th className="p-3">الشعبة الصفية</th>
                      <th className="p-3 text-center">حالة الحضور برصد اليوم</th>
                      <th className="p-3 text-left">تاريخ الرصد اليومي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-802">
                    {attendanceReportData.list.map((a, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="p-3 text-center font-bold text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-3 font-extrabold text-slate-850 dark:text-white">{a.studentName}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-350 font-semibold">{a.school}</td>
                        <td className="p-3 text-slate-650 dark:text-slate-400 font-bold">{a.classGroup}</td>
                        <td className="p-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                            a.status === 'present' 
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                              : a.status === 'late'
                                ? 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {a.status === 'present' ? '🟢 حاضر تماماً' : a.status === 'late' ? '🟡 متأخر بالرصد' : '🔴 غياب تام'}
                          </span>
                        </td>
                        <td className="p-3 text-left font-mono text-slate-400">{a.date}</td>
                      </tr>
                    ))}
                    {attendanceReportData.list.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-400 dark:text-slate-505 italic font-semibold">
                          📭 لا يتاح أي تفاصيل تقارير حضور أو غياب للفئات المختارة حالياً.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* قسم تذييل الحساب والاعتمادات في وضع الطباعة فقط */}
      <div className="hidden print:block mt-16 text-xs text-right text-slate-500 max-w-2xl" style={{ float: 'left' }}>
        <p className="font-extrabold">توقيع المشرف العام المعتمد للمسار:</p>
        <p className="font-black text-slate-800 mt-2 text-sm">أ. سياف الشباطي</p>
        <div className="w-48 h-12 border-b border-dashed border-slate-400 mt-1" />
        <p className="text-[10px] mt-1">تاريخ توثيق وختم المستند: {new Date().toLocaleTimeString('ar-YE')}</p>
      </div>
      <div className="clear-both" />

    </div>
  );
}
