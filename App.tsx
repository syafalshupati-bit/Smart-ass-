import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Beaker, 
  Trophy, 
  User, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  LogOut, 
  Lock, 
  Search, 
  Trash2, 
  Download, 
  Plus, 
  Compass, 
  ShieldAlert,
  Menu,
  X,
  Sparkles,
  Send,
  Cpu,
  AlertCircle,
  LifeBuoy,
  Home,
  Eye,
  EyeOff
} from 'lucide-react';
import { allLessons } from './lessons';
import { db, ref, onValue, set, get, child, query, orderByChild, equalTo } from './firebase-config';
import { normalizeArabic, searchSchool, setupAutoCompleteSuggestions } from './school-search';
import { ReportCenter } from './components/ReportCenter';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AccountsManagement } from './components/AccountsManagement';
import { 
  MeasurementLab, 
  QuantityClassifier, 
  DisplacementCarLab, 
  ProjectileLab, 
  EnergyConservationLab, 
  GravityLawLab,
  PhetSimulator
} from './components/Labs';
import { 
  ConversionLab, 
  DimensionalAnalysisLab,
  VectorsLab,
  SpeedLab,
  AccelerationLab,
  KinematicsLab,
  FreeFallLab,
  NewtonLawsLab,
  FrictionLab,
  KineticMolecularTheoryLab,
  HookesLawLab,
  ElasticityLab,
  CapillaryLab,
  PressureLab,
  BuoyancyLab
} from './PhysicsGames';
import { ActivationCode, StudentScore, School, Teacher, Question, LMSMessage, StudentAttendance, SmartAlert, StudentAccount, SchoolManager, ActivityLog, Lesson } from './types';

// ==================== 1. نظام محاكاة وقواعد بيانات مدمج فوري ====================
// لضمان استمرارية المنصة عند عدم توفر تهيئة الـ Firebase في المتصفح بشكل تلقائي،
// نقوم بدمج آلية إدارة ذكية تعتمد بشكل مشترك على نظام التخزين المحلي والـ Firebase.
const FALLBACK_CODES: ActivationCode[] = [
  { code: "SAYYAF_PHYSICS_2026", status: "used", school: "مدرسة المتفوقين النموذجية", usedBy: "عبد المجيد صالح الشباطي", createdAt: "2026-05-01", expireAt: "2027-05-01", deviceLimit: 1, devicesUsed: ["عبد المجيد صالح الشباطي"] },
  { code: "YEMEN_PHYS_100", status: "used", school: "مجمع الثورة التربوي", usedBy: "فؤاد مطهر الحمادي", createdAt: "2026-05-01", expireAt: "2027-05-01", deviceLimit: 1, devicesUsed: ["فؤاد مطهر الحمادي"] },
  { code: "STUDENT_FREE_PASS", status: "used", school: "مدرسة المتفوقين النموذجية", usedBy: "إياد محمد عبد الله", createdAt: "2026-05-01", expireAt: "2027-05-01", deviceLimit: 5, devicesUsed: ["إياد محمد عبد الله"] },
  { code: "SAYYAF-982103", status: "used", school: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء", usedBy: "أحمد محمد الحيمي", createdAt: "2026-05-01", expireAt: "2027-05-01", deviceLimit: 1, devicesUsed: ["أحمد محمد الحيمي"] },
  { code: "SAYYAF-884192", status: "used", school: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء", usedBy: "رياض عبد الرحمن اليماني", createdAt: "2026-05-01", expireAt: "2027-05-01", deviceLimit: 1, devicesUsed: ["رياض عبد الرحمن اليماني"] },
  { code: "SAYYAF-749210", status: "used", school: "مدرسة ثانوية عبد الناصر", usedBy: "أمجد نبيل الجبلي", createdAt: "2026-05-01", expireAt: "2027-05-01", deviceLimit: 1, devicesUsed: ["أمجد نبيل الجبلي"] },
  { code: "SAYYAF-655220", status: "active", school: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء", createdAt: "2026-05-25", expireAt: "2027-05-25", deviceLimit: 1, devicesUsed: [] },
  { code: "SAYYAF-441235", status: "active", school: "مدرسة ثانوية عبد الناصر", createdAt: "2026-05-25", expireAt: "2027-05-25", deviceLimit: 1, devicesUsed: [] },
  { code: "SAYYAF-302199", status: "active", school: "مجمع الثورة التربوي", createdAt: "2026-05-25", expireAt: "2027-05-25", deviceLimit: 1, devicesUsed: [] }
];

// دالة مساعدة لضمان قراءة البيانات كصفوف (Arrays) بشكل آمن ومنع حدوث أخطاء map is not a function
function safeParseArray<T>(stored: string | null, defaultValue: T[]): T[] {
  if (!stored) return defaultValue;
  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') {
      return Object.values(parsed) as T[];
    }
  } catch (e) {
    console.error("Error parsing stored array:", e);
  }
  return defaultValue;
}

function convertToSafeArray<T>(data: any, defaultValue: T[] = []): T[] {
  if (!data) return defaultValue;
  if (Array.isArray(data)) return data;
  if (typeof data === 'object') {
    return Object.values(data) as T[];
  }
  return defaultValue;
}

export default function App() {
  const [lessonsList, setLessonsList] = useState<Lesson[]>(allLessons);
  // --- حالات الإعدادات العامة والمنظومة الشمولية ---
  const [platformSettings, setPlatformSettings] = useState(() => {
    const stored = localStorage.getItem('sayyaf_platform_settings');
    if (stored) return JSON.parse(stored);
    return {
      appName: "منصة المرجع الذكي في الفيزياء",
      subTitle: "تحت إشراف الأستاذ سياف الشباطي – اليمن 🇾🇪",
      chatSystemActive: true,
      adaptiveTestsActive: true,
      watermarkActive: true,
      managerPassword: "SAYYAF_ADMIN_2026",
      superAdminPassword: "SAYYAF_SUPER_2026",
      xpMultiplier: 1
    };
  });

  const savePlatformSettings = (updated: typeof platformSettings) => {
    setPlatformSettings(updated);
    localStorage.setItem('sayyaf_platform_settings', JSON.stringify(updated));
  };

  // --- حالات تسجيل الدخول والترخيص ---
  const [currentUserType, setCurrentUserType] = useState<'guest' | 'student' | 'school' | 'teacher' | 'superadmin' | 'super_admin'>('guest');
  const [studentName, setStudentName] = useState('');
  const [studentSchool, setStudentSchool] = useState(() => {
    return localStorage.getItem('sayyaf_selected_school_name') || '';
  });
  const [schoolInputText, setSchoolInputText] = useState(() => {
    return localStorage.getItem('sayyaf_selected_school_name') || '';
  });
  const [isSearchingSchool, setIsSearchingSchool] = useState(false);
  const [schoolSearchingError, setSchoolSearchingError] = useState('');
  const [schoolSuggestions, setSchoolSuggestions] = useState<School[]>([]);
  const [showSchoolSuggestions, setShowSchoolSuggestions] = useState(false);
  const [selectedSchoolDetails, setSelectedSchoolDetails] = useState<School | null>(null);
  const [schoolLogo, setSchoolLogo] = useState<string>('');
  const [studentClass, setStudentClass] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [activationCodeInput, setActivationCodeInput] = useState('');

  // --- حالات حفظ سجل تصفح صفحات كوف المعلم ومدير المدرسة للرجوع ---
  const [teacherTabHistory, setTeacherTabHistory] = useState<string[]>(['overview']);
  const [schoolTabHistory, setSchoolTabHistory] = useState<string[]>(['overview']);

  // --- لوحة المعلم والرسائل والتحضير المطورة ---
  const [teacherActiveDashboardTab, setTeacherActiveDashboardTab] = useState<'overview' | 'students' | 'scores' | 'attendance' | 'activities' | 'messages' | 'setup' | 'reports'>('overview');
  const [teacherClasses, setTeacherClasses] = useState<string[]>(() => {
    const stored = localStorage.getItem('sayyaf_teacher_classes');
    return safeParseArray<string>(stored, ['الشعبة أ', 'الشعبة ب', 'الشعبة ج']);
  });

  const [lmsMessages, setLmsMessages] = useState<LMSMessage[]>(() => {
    const stored = localStorage.getItem('sayyaf_lms_messages');
    return safeParseArray<LMSMessage>(stored, [
      {
        id: "msg_1",
        senderName: "الأستاذ سياف الشباطي",
        senderRole: "superadmin" as const,
        targetType: "all" as const,
        content: "أهلاً ومرحباً بكم جميعاً في منصة المرجع الذكي للفيزياء! كثفوا جهودكم في استكشاف قوانين السقوط والجاذبية الأرضية واستعدوا للامتحانات.",
        date: "2026-05-25 09:00 ص"
      }
    ]);
  });

  const [studentAttendances, setStudentAttendances] = useState<StudentAttendance[]>(() => {
    const stored = localStorage.getItem('sayyaf_lms_attendance');
    return safeParseArray<StudentAttendance>(stored, [
      { id: "att_1", studentName: "جمال مأمون الفارس", school: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء", classGroup: "الشعبة أ", status: "present" as const, date: "2026-05-26" },
      { id: "att_2", studentName: "أحمد بن علي اليماني", school: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء", classGroup: "الشعبة أ", status: "late" as const, date: "2026-05-26" },
      { id: "att_3", studentName: "صالح العزي", school: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء", classGroup: "الشعبة ب", status: "absent" as const, date: "2026-05-26" }
    ]);
  });

  // حالات كتابة الرسائل
  const [msgTargetType, setMsgTargetType] = useState<'student' | 'class' | 'all'>('all');
  const [msgTargetStudentName, setMsgTargetStudentName] = useState('');
  const [msgTargetClass, setMsgTargetClass] = useState('الشعبة أ');
  const [msgContent, setMsgContent] = useState('');

  const saveLmsMessages = (updated: LMSMessage[]) => {
    setLmsMessages(updated);
    localStorage.setItem('sayyaf_lms_messages', JSON.stringify(updated));
    set(ref(db, 'lmsMessages'), updated).catch(e => console.error(e));
  };

  const saveStudentAttendances = (updated: StudentAttendance[]) => {
    setStudentAttendances(updated);
    localStorage.setItem('sayyaf_lms_attendance', JSON.stringify(updated));
    set(ref(db, 'studentAttendances'), updated).catch(e => console.error(e));
  };

  const saveTeacherClasses = (updated: string[]) => {
    setTeacherClasses(updated);
    localStorage.setItem('sayyaf_teacher_classes', JSON.stringify(updated));
  };

  // --- شفرات واشتراكات البحث والمزامنة المدرسية الذكية للمنظومة ---
  const schoolSubscribesRef = useRef<(() => void)[]>([]);

  const clearSchoolSubscriptions = () => {
    schoolSubscribesRef.current.forEach(unsub => {
      try {
        unsub();
      } catch (e) {
        console.warn("⚠️ Error clearing school sub:", e);
      }
    });
    schoolSubscribesRef.current = [];
  };

  // دالة جلب وتفعيل المزامنة اللحظية الحية لبيانات المدرسة المحددة فقط تلبية للطلب #6 و #7 و #10
  const handleSchoolSelected = (schoolName: string) => {
    if (!schoolName) {
      clearSchoolSubscriptions();
      setSelectedSchoolDetails(null);
      setSchoolLogo('');
      setStudentSchool('');
      return;
    }

    clearSchoolSubscriptions();
    setSchoolSearchingError('');

    // حفظ اسم المدرسة مؤقتاً في localStorage تلبية للطلب #14
    localStorage.setItem('sayyaf_selected_school_name', schoolName);
    setStudentSchool(schoolName);

    console.log(`📡 [Firebase] Syncing database specifically for school name: ${schoolName}`);

    // ا- جلب تفاصيل المدرسة الحالية وشعارها الفريد
    const schoolQuery = query(ref(db, "schools"), orderByChild("name"), equalTo(schoolName));
    const unsubSchool = onValue(schoolQuery, (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        const schoolListObj = Array.isArray(val) ? val : Object.values(val);
        const activeSch = schoolListObj[0] as School;
        if (activeSch) {
          setSelectedSchoolDetails(activeSch);
          // تصميم وتوليد شعار مخصص واحترافي لاسم هذه المدرسة
          setSchoolLogo(`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(activeSch.name)}&backgroundColor=4f46e5,06b6d4,10b981,e11d48,d97706&textColor=ffffff&bold=true`);
          
          // جلب المعلمين المرتبطين برمز هذه المدرسة تلقائياً
          const teachersQuery = query(ref(db, "teachers"), orderByChild("schoolId"), equalTo(activeSch.id));
          const unsubTeachers = onValue(teachersQuery, (tSnap) => {
            if (tSnap.exists()) {
              const teachersData = tSnap.val();
              const teachersList: Teacher[] = Array.isArray(teachersData) ? teachersData : Object.values(teachersData);
              setTeachers(teachersList);
              localStorage.setItem('sayyaf_teachers', JSON.stringify(teachersList));
            } else {
              setTeachers([]);
            }
          });
          schoolSubscribesRef.current.push(unsubTeachers);
        }
      } else {
        setSelectedSchoolDetails(null);
        setSchoolLogo('');
      }
    });

    // ب- جلب الأرقام السرية وتراخيص التفعيل للطلاب لهذه المدرسة فقط
    const codesQuery = query(ref(db, "activationCodes"), orderByChild("school"), equalTo(schoolName));
    const unsubCodes = onValue(codesQuery, (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        const list: ActivationCode[] = Array.isArray(val) ? val : Object.values(val);
        const mapped = list.map(c => ({
          ...c,
          createdAt: c.createdAt || '2026-05-27',
          expireAt: c.expireAt || '2027-05-27',
          deviceLimit: c.deviceLimit || 1,
          devicesUsed: c.devicesUsed || (c.status === 'used' && c.usedBy ? [c.usedBy] : [])
        }));
        setActivationCodes(mapped);
        localStorage.setItem('sayyaf_activation_codes', JSON.stringify(mapped));
      } else {
        setActivationCodes([]);
      }
    });

    // ج- جلب نتائج ودرجات الطلاب المسندة للمقررات والمسائل لهذه المدرسة فقط
    const scoresQuery = query(ref(db, "scores"), orderByChild("school"), equalTo(schoolName));
    const unsubScores = onValue(scoresQuery, (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        const list: StudentScore[] = Array.isArray(val) ? val : Object.values(val);
        setScores(list);
        localStorage.setItem('sayyaf_student_scores', JSON.stringify(list));
      } else {
        setScores([]);
      }
    });

    // د- جلب أسماء وبيانات المنسقين والمدراء المعتمدين لهذه المدرسة فقط
    const studentQuery = query(ref(db, "studentAccounts"), orderByChild("schoolName"), equalTo(schoolName));
    const unsubStudents = onValue(studentQuery, (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        const list: StudentAccount[] = Array.isArray(val) ? val : Object.values(val);
        setStudentAccounts(list);
        localStorage.setItem('sayyaf_students_accounts', JSON.stringify(list));
      } else {
        setStudentAccounts([]);
      }
    });

    const managersQuery = query(ref(db, "schoolManagers"), orderByChild("schoolName"), equalTo(schoolName));
    const unsubManagers = onValue(managersQuery, (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        const list: SchoolManager[] = Array.isArray(val) ? val : Object.values(val);
        setSchoolManagers(list);
        localStorage.setItem('sayyaf_school_managers', JSON.stringify(list));
      } else {
        setSchoolManagers([]);
      }
    });

    schoolSubscribesRef.current.push(unsubSchool, unsubCodes, unsubScores, unsubStudents, unsubManagers);
  };

  // دالة جلب كافة قواعد البيانات فوراً عند تسجيل دخول الكوادر والمالك العام للتحكم الكلي
  const loadAllDataForAdmin = () => {
    clearSchoolSubscriptions();
    console.log("👑 [Firebase] Loaded administrative view for schools database.");

    const unsubSchools = onValue(ref(db, "schools"), (snap) => {
      const data = snap.val();
      if (data) {
        const arr = convertToSafeArray<School>(data);
        setSchools(arr);
        localStorage.setItem('sayyaf_schools', JSON.stringify(arr));
      }
    });

    const unsubTeachers = onValue(ref(db, "teachers"), (snap) => {
      const data = snap.val();
      if (data) {
        const arr = convertToSafeArray<Teacher>(data);
        setTeachers(arr);
        localStorage.setItem('sayyaf_teachers', JSON.stringify(arr));
      }
    });

    const unsubStudents = onValue(ref(db, "studentAccounts"), (snap) => {
      const data = snap.val();
      if (data) {
        const arr = convertToSafeArray<StudentAccount>(data);
        setStudentAccounts(arr);
        localStorage.setItem('sayyaf_students_accounts', JSON.stringify(arr));
      }
    });

    const unsubManagers = onValue(ref(db, "schoolManagers"), (snap) => {
      const data = snap.val();
      if (data) {
        const arr = convertToSafeArray<SchoolManager>(data);
        setSchoolManagers(arr);
        localStorage.setItem('sayyaf_school_managers', JSON.stringify(arr));
      }
    });

    const unsubCodes = onValue(ref(db, "activationCodes"), (snap) => {
      const data = snap.val();
      if (data) {
        const arr = convertToSafeArray<any>(data);
        const mapped = arr.map((c: any) => ({
          ...c,
          createdAt: c.createdAt || '2026-05-27',
          expireAt: c.expireAt || '2027-05-27',
          deviceLimit: c.deviceLimit || 1,
          devicesUsed: c.devicesUsed || (c.status === 'used' && c.usedBy ? [c.usedBy] : [])
        }));
        setActivationCodes(mapped);
        localStorage.setItem('sayyaf_activation_codes', JSON.stringify(mapped));
      }
    });

    const unsubScores = onValue(ref(db, "scores"), (snap) => {
      const data = snap.val();
      if (data) {
        const arr = convertToSafeArray<StudentScore>(data);
        setScores(arr);
        localStorage.setItem('sayyaf_student_scores', JSON.stringify(arr));
      }
    });

    schoolSubscribesRef.current.push(unsubSchools, unsubTeachers, unsubStudents, unsubManagers, unsubCodes, unsubScores);
  };

  const selectSchoolSuggestion = (sch: School) => {
    setSchoolInputText(sch.name);
    setStudentSchool(sch.name);
    setSelectedSchoolDetails(sch);
    setSchoolSearchingError('');
    setShowSchoolSuggestions(false);
    handleSchoolSelected(sch.name);
  };

  const validateAndSelectSchoolInput = async (): Promise<boolean> => {
    if (!schoolInputText.trim()) {
      setSchoolSearchingError('⚠️ الرجاء كتابة اسم المدرسة');
      return false;
    }
    
    setIsSearchingSchool(true);
    const matched = await searchSchool(schoolInputText);
    setIsSearchingSchool(false);

    if (matched) {
      setStudentSchool(matched.name);
      setSelectedSchoolDetails(matched);
      setSchoolSearchingError('');
      handleSchoolSelected(matched.name);
      return true;
    } else {
      setSchoolSearchingError('❌ المدرسة غير موجودة');
      setStudentSchool('');
      setSelectedSchoolDetails(null);
      return false;
    }
  };

  // --- نظام التنبيهات الذكي والمستدام ---
  const [smartAlerts, setSmartAlerts] = useState<SmartAlert[]>(() => {
    const stored = localStorage.getItem('sayyaf_smart_alerts');
    if (stored) return JSON.parse(stored);
    return [
      {
        id: "alert_1",
        type: "danger",
        title: "انخفاض درجات الطالب التراكمية ⚠️",
        message: "حذارِ: الطالب 'صالح العزي' يواجه تراجعاً علمياً حاداً حيث وصل متوسط درجاته إلى 55% في آخر اختباراته.",
        userType: "all",
        studentName: "صالح العزي",
        school: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء",
        classGroup: "الشعبة ب",
        date: "2026-05-26 10:15 ص",
        alertType: "grades"
      },
      {
        id: "alert_2",
        type: "warning",
        title: "تأخر المعلم في متابعة الشعبة ⏳",
        message: "تنبيه تشغيلي: مضى أكثر من 4 أيام دون قيام معلم الشعبة ج برصد الحضور اليومي أو توجيه رسائل مساندة.",
        userType: "all",
        school: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء",
        classGroup: "الشعبة ج",
        date: "2026-05-27 08:30 ص",
        alertType: "teacher_delay"
      },
      {
        id: "alert_3",
        type: "danger",
        title: "الغياب الصفي المتكرر 🚨",
        message: "تنبيه: تغيب الطالب 'أحمد بن علي اليماني' لـ 3 حصص متتالية دون عذر مسبق، مما يضع استمراره في المنظومة في خطر.",
        userType: "all",
        studentName: "أحمد بن علي اليماني",
        school: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء",
        classGroup: "الشعبة أ",
        date: "2026-05-27 11:00 ص",
        alertType: "absences"
      },
      {
        id: "alert_4",
        type: "info",
        title: "تأخر إنجاز المنهج الدراسي 📉",
        message: "تحليل زمني: متوسط نسبة إكمال المنهج وتخطي عقبات الاختبارات التكيفية للشعبة ج منخفض عن المعدل العام الموصى به.",
        userType: "all",
        school: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء",
        classGroup: "الشعبة ج",
        date: "2026-05-27 11:30 ص",
        alertType: "curriculum_delay"
      }
    ];
  });

  const saveSmartAlerts = (updated: SmartAlert[]) => {
    setSmartAlerts(updated);
    localStorage.setItem('sayyaf_smart_alerts', JSON.stringify(updated));
    set(ref(db, 'smartAlerts'), updated).catch(e => console.error(e));
  };

  const addSmartAlert = (newAlert: Omit<SmartAlert, 'id' | 'date'>) => {
    const formattedDate = new Date().toLocaleString('ar-YE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    const alertId = "alert_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    const alertItem: SmartAlert = {
      ...newAlert,
      id: alertId,
      date: formattedDate
    };

    setSmartAlerts(prev => {
      const isDuplicate = prev.some(a => a.alertType === alertItem.alertType && a.studentName === alertItem.studentName && a.classGroup === alertItem.classGroup && a.title === alertItem.title);
      if (isDuplicate) return prev;
      const updated = [alertItem, ...prev];
      localStorage.setItem('sayyaf_smart_alerts', JSON.stringify(updated));
      set(ref(db, 'smartAlerts'), updated).catch(e => console.error(e));
      return updated;
    });
  };

  const handleMarkAttendanceByTeacher = (studentName: string, status: 'present' | 'absent' | 'late') => {
    const activeSchool = studentSchool || 'ثانوية جمال عبد الناصر للمتفوقين - صنعاء';
    const updated = [...studentAttendances];
    const itemIndex = updated.findIndex(
      a => a.studentName === studentName && a.date === attDate && a.school === activeSchool
    );
    if (itemIndex >= 0) {
      updated[itemIndex].status = status;
    } else {
      updated.push({
        id: "att_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        studentName,
        school: activeSchool,
        classGroup: attSelectedClass,
        status,
        date: attDate
      });
    }
    saveStudentAttendances(updated);

    if (status === 'absent') {
      const studentAbsencesCount = updated.filter(a => a.studentName === studentName && a.status === 'absent').length;
      if (studentAbsencesCount >= 2) {
        addSmartAlert({
          type: 'danger',
          title: '🚨 غياب صفي متكرر للطالب',
          message: `غياب متكرر: تم رصد غياب الطالب '${studentName}' في تسجيلات التحضير لـ ${studentAbsencesCount} أيام متكررة ومسجلة بشعبته.`,
          userType: 'all',
          studentName,
          school: activeSchool,
          classGroup: attSelectedClass,
          alertType: 'absences'
        });
      }
    }
  };

  
  // شاشات التحكم والإدارة
  const [schoolActiveDashboardTab, setSchoolActiveDashboardTab] = useState<'overview' | 'classes' | 'students' | 'teachers' | 'alerts' | 'reports'>('overview');
  const [schoolSearchTerm, setSchoolSearchTerm] = useState('');
  const [selectedPrintClass, setSelectedPrintClass] = useState('');
  const [attSelectedClass, setAttSelectedClass] = useState('الشعبة أ');
  const [attDate, setAttDate] = useState('2026-05-26');
  const [selectedSchoolAdmin, setSelectedSchoolAdmin] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [schoolPasswordInput, setSchoolPasswordInput] = useState('');
  const [teacherPasswordInput, setTeacherPasswordInput] = useState('');
  const [showSchoolPassword, setShowSchoolPassword] = useState(false);
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  
  // --- تصفح الدروس والمختبرات ---
  const [activeTab, setActiveTab ] = useState<'lessons' | 'labs' | 'leaderboard' | 'adaptive_quiz' | 'portfolio' | 'chatbot' | 'super_admin_panel' | 'reports' | 'accounts_management'>('lessons');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null);
  
  // --- حالة الدروس النشطة والأكورديون والامتحان التفاعلي ---
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({});
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: string]: string }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState<{ [qId: string]: boolean }>({});
  const [lessonSubTab, setLessonSubTab] = useState<'content' | 'lab' | 'quiz'>('content');
  const [labMode, setLabMode] = useState<'local' | 'phet'>('local');

  // --- لوحة التحكم وقواعد البيانات الفورية ---
  const [schools, setSchools] = useState<School[]>(() => {
    const stored = localStorage.getItem('sayyaf_schools');
    const loaded = safeParseArray<School>(stored, [
      { id: "s1", name: "مدرسة ثانوية عبد الناصر", plan: "gold", expireDate: "2027-12-31", capacity: 150, password: "NASR_ADMIN_2026" },
      { id: "s2", name: "مجمع الثورة التربوي", plan: "silver", expireDate: "2026-12-31", capacity: 80, password: "THAWRA_ADMIN_2026" },
      { id: "s3", name: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء", plan: "gold", expireDate: "2027-08-30", capacity: 200, password: "JAMAL_ADMIN_2026" },
      { id: "s4", name: "مدرسة المتفوقين النموذجية", plan: "free", expireDate: "2026-06-30", capacity: 30, password: "MOTAF_ADMIN_2026" }
    ]);
    
    // تأكيد تعيين رقم سري لكل مدرسة لو فُقد
    let updatedNeeded = false;
    const mapped = loaded.map((sch, index) => {
      if (!sch.password) {
        updatedNeeded = true;
        const defaultPasswords = ["NASR_ADMIN_2026", "THAWRA_ADMIN_2026", "JAMAL_ADMIN_2026", "MOTAF_ADMIN_2026"];
        return {
          ...sch,
          password: defaultPasswords[index] || `SCH_${Math.floor(100000 + Math.random() * 900000)}`
        };
      }
      return sch;
    });
    
    if (updatedNeeded || !stored) {
      localStorage.setItem('sayyaf_schools', JSON.stringify(mapped));
    }
    return mapped;
  });

  const saveSchoolsToStorage = (updated: School[]) => {
    setSchools(updated);
    localStorage.setItem('sayyaf_schools', JSON.stringify(updated));
    set(ref(db, 'schools'), updated).catch(e => console.error(e));
  };

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const stored = localStorage.getItem('sayyaf_teachers');
    return safeParseArray<Teacher>(stored, [
      { id: "t1", name: "أ. صالح اليماني", schoolId: "s3", username: "saleh_yamani", status: "active" },
      { id: "t2", name: "أ. محمد عبد الله الشباطي", schoolId: "s4", username: "mohammad_sayyaf", status: "active" },
      { id: "t3", name: "أ. يحيى الرعيني", schoolId: "s2", username: "yahya_raimi", status: "active" }
    ]);
  });

  const saveTeachersToStorage = (updated: Teacher[]) => {
    setTeachers(updated);
    localStorage.setItem('sayyaf_teachers', JSON.stringify(updated));
    set(ref(db, 'teachers'), updated).catch(e => console.error(e));
  };

  const [studentAccounts, setStudentAccounts] = useState<StudentAccount[]>(() => {
    const stored = localStorage.getItem('sayyaf_students_accounts');
    return safeParseArray<StudentAccount>(stored, [
      { id: "st_1", name: "أحمد بن محمد الحاشدي", classGroup: "الشعبة أ", schoolName: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء", username: "ahmed_hashidi", password: "ST_PASS_774", status: "active", expireDate: "2027-06-15" },
      { id: "st_2", name: "معاذ بن نجيب الرعيني", classGroup: "الشعبة ب", schoolName: "مجمع الثورة التربوي", username: "moadh_raimi", password: "ST_PASS_352", status: "active", expireDate: "2026-10-30" },
      { id: "st_3", name: "بلال بن علي الشباطي", classGroup: "الشعبة أ", schoolName: "مدرسة ثانوية عبد الناصر", username: "belal_syaff", password: "ST_PASS_991", status: "suspended", expireDate: "2026-05-01" }
    ]);
  });

  const saveStudentAccountsToStorage = (updated: StudentAccount[]) => {
    setStudentAccounts(updated);
    localStorage.setItem('sayyaf_students_accounts', JSON.stringify(updated));
    set(ref(db, 'studentAccounts'), updated).catch(e => console.error(e));
  };

  const [schoolManagers, setSchoolManagers] = useState<SchoolManager[]>(() => {
    const stored = localStorage.getItem('sayyaf_school_managers');
    return safeParseArray<SchoolManager>(stored, [
      { id: "mgr_1", name: "د. عبد الكريم الشباطي", schoolName: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء", username: "karim_school", password: "MGR_PASS_112", permissions: "all", status: "active" },
      { id: "mgr_2", name: "أ. عبد الخالق الحاشدي", schoolName: "مجمع الثورة التربوي", username: "khaliq_mgr", password: "MGR_PASS_456", permissions: "all", status: "active" },
      { id: "mgr_3", name: "د. نجيب اليماني", schoolName: "مدرسة المتفوقين النموذجية", username: "najib_yemen", password: "MGR_PASS_111", permissions: "restricted", status: "suspended" }
    ]);
  });

  const saveSchoolManagersToStorage = (updated: SchoolManager[]) => {
    setSchoolManagers(updated);
    localStorage.setItem('sayyaf_school_managers', JSON.stringify(updated));
    set(ref(db, 'schoolManagers'), updated).catch(e => console.error(e));
  };

  const [activationCodes, setActivationCodes] = useState<ActivationCode[]>([]);
  const [scores, setScores] = useState<StudentScore[]>(() => {
    const stored = localStorage.getItem('sayyaf_student_scores');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 2) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    const seedScores = [
      { name: "أحمد محمد الحيمي", school: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء", code: "SAYYAF-982103", lessonId: "l1", lessonTitle: "علم القياس والبادئات الفيزيائية", score: "5 / 5", date: "2026-05-20, 09:30 ص" },
      { name: "هشام يحيى الرعيني", school: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء", code: "SAYYAF-982103", lessonId: "l2", lessonTitle: "المتجهات وحساب المحصلة بقانون جيب التمام", score: "4 / 5", date: "2026-05-21, 10:15 ص" },
      { name: "عبد المجيد صالح الشباطي", school: "مدرسة المتفوقين النموذجية", code: "SAYYAF_PHYSICS_2026", lessonId: "l1", lessonTitle: "علم القياس والبادئات الفيزيائية", score: "4 / 5", date: "2026-05-22, 11:00 ص" },
      { name: "إياد محمد عبد الله", school: "مدرسة المتفوقين النموذجية", code: "STUDENT_FREE_PASS", lessonId: "l3", lessonTitle: "الإزاحة والمسافة ومحاكاة سيارة المسار", score: "5 / 5", date: "2026-05-23, 11:45 ص" },
      { name: "أسامة عبده صالح", school: "مجمع الثورة التربوي", code: "SAYYAF-302199", lessonId: "l1", lessonTitle: "علم القياس والبادئات الفيزيائية", score: "3 / 5", date: "2026-05-24, 08:30 ص" },
      { name: "رياض عبد الرحمن اليماني", school: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء", code: "SAYYAF-884192", lessonId: "l3", lessonTitle: "الإزاحة والمسافة ومحاكاة سيارة المسار", score: "4 / 5", date: "2026-05-24, 02:40 م" },
      { name: "فؤاد مطهر الحمادي", school: "مجمع الثورة التربوي", code: "YEMEN_PHYS_100", lessonId: "l2", lessonTitle: "المتجهات وحساب المحصلة بقانون جيب التمام", score: "5 / 5", date: "2026-05-24, 03:10 م" },
      { name: "صلاح يوسف الرداعي", school: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء", code: "SAYYAF-884192", lessonId: "l4", lessonTitle: "السرعة المتوسطة والبيانات اللحظية", score: "3 / 5", date: "2026-05-25, 01:20 م" },
      { name: "أمجد نبيل الجبلي", school: "مدرسة ثانوية عبد الناصر", code: "SAYYAF-749210", lessonId: "l1", lessonTitle: "علم القياس والبادئات الفيزيائية", score: "4 / 5", date: "2026-05-25, 04:50 م" },
      { name: "عمار مختار الصلوي", school: "مدرسة ثانوية عبد الناصر", code: "SAYYAF-749210", lessonId: "l2", lessonTitle: "المتجهات وحساب المحصلة بقانون جيب التمام", score: "2 / 5", date: "2026-05-25, 05:12 م" },
      { name: "جمال صدام الوهبي", school: "مدرسة المتفوقين النموذجية", code: "SAYYAF_PHYSICS_2026", lessonId: "l2", lessonTitle: "المتجهات وحساب المحصلة بقانون جيب التمام", score: "3 / 5", date: "2026-05-25, 06:05 م" },
      { name: "وليد توفيق الحاشدي", school: "مدرسة ثانوية عبد الناصر", code: "SAYYAF-749210", lessonId: "l3", lessonTitle: "الإزاحة والمسافة ومحاكاة سيارة المسار", score: "5 / 5", date: "2026-05-25, 07:15 م" }
    ];
    localStorage.setItem('sayyaf_student_scores', JSON.stringify(seedScores));
    return seedScores;
  });

  const [hoveredOwnerMetric, setHoveredOwnerMetric] = useState<{
    school: string;
    label: string;
    value: string | number;
    x: number;
    y: number;
  } | null>(null);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newCodeSchool, setNewCodeSchool] = useState('');
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  const [teacherSelectedSchool, setTeacherSelectedSchool] = useState('');

  // States to enrich the Teacher Dashboard
  const [teacherStudentFilter, setTeacherStudentFilter] = useState<'all' | 'struggling' | 'outstanding'>('all');
  const [teacherClassFilter, setTeacherClassFilter] = useState<string>('all');
  const [teacherExpandedStudentName, setTeacherExpandedStudentName] = useState<string | null>(null);
  const [teacherLessonFilter, setTeacherLessonFilter] = useState<string>('all');
  const [teacherSelectedPrintClass, setTeacherSelectedPrintClass] = useState<string>('all');
  const [teacherActiveChartHover, setTeacherActiveChartHover] = useState<string | null>(null);
  const [showOfficialAppraisalModal, setShowOfficialAppraisalModal] = useState<boolean>(false);

  // حالات ونماذج إدخال الإدارة لـ Super Admin
  const [adminTeacherName, setAdminTeacherName] = useState('');
  const [adminTeacherSchoolId, setAdminTeacherSchoolId] = useState('');
  const [adminTeacherUsername, setAdminTeacherUsername] = useState('');
  const [adminTeacherPassword, setAdminTeacherPassword] = useState('');
  
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const [editingSchoolPlan, setEditingSchoolPlan] = useState('');
  const [editingSchoolCapacity, setEditingSchoolCapacity] = useState(100);
  const [editingSchoolExpiry, setEditingSchoolExpiry] = useState('');
  const [editingSchoolPassword, setEditingSchoolPassword] = useState('');

  // حالات ونماذج الكود لتطوير نظام تفعيل الأكواد الاحترافي للأستاذ سياف (المالك العام)
  const [editingCode, setEditingCode] = useState<ActivationCode | null>(null);
  const [editCodeExpire, setEditCodeExpire] = useState('');
  const [editCodeDeviceLimit, setEditCodeDeviceLimit] = useState(1);
  const [editCodeSchool, setEditCodeSchool] = useState('');
  const [editCodeStatus, setEditCodeStatus] = useState<'active' | 'used' | 'stopped'>('active');

  const [codeGenCustom, setCodeGenCustom] = useState('');
  const [codeGenExpire, setCodeGenExpire] = useState('2027-05-27');
  const [codeGenDeviceLimit, setCodeGenDeviceLimit] = useState(1);
  
  const [codesSearchTerm, setCodesSearchTerm] = useState('');
  const [codesSchoolFilter, setCodesSchoolFilter] = useState('all');
  const [codesStatusFilter, setCodesStatusFilter] = useState('all');

  // --- سجل النشاطات والعمليات السيادي ---
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const stored = localStorage.getItem('system_activity_logs');
      return stored ? JSON.parse(stored) : [
        { id: "log_init", timestamp: new Date().toLocaleString('ar-YE', { timeZone: 'Asia/Aden' }), username: "النظام المطور", userType: "System", action: "تم تشغيل وتأمين قاعدة بيانات المنظومة والنشاطات بنجاح 🇾🇪" }
      ];
    } catch {
      return [];
    }
  });

  const saveActivityLogs = (updated: ActivityLog[]) => {
    setActivityLogs(updated);
    localStorage.setItem('system_activity_logs', JSON.stringify(updated.slice(0, 1000)));
  };

  const logActivity = (username: string, userType: string, action: string) => {
    const newLog: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleString('ar-YE', { timeZone: 'Asia/Aden' }),
      username: username || "مستخدم غير معروف",
      userType: userType || "Guest",
      action: action || "إجراء عملية بالنظام"
    };
    saveActivityLogs([newLog, ...activityLogs]);
  };

  // ==================== الحالات الجديدة لثمرات تطوير 2026 ====================
  // 1. المساعد المنهجي الذكي للحوار
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: 'أهلاً بك يا غالي في محراب الفيزياء والعلوم المنهجية المطور! أنا المساعد الفيزيائي الخاص بك بتوجيهات الأستاذ القدير سياف الشباطي.\nكيف يمكنني إثراء عقلك الفضولي اليوم؟ يمكنك سؤالي عن أي مفهوم فيزيائي، أو استخدام الأزرار السريعة التفاعلية بالأسفل لبدء شرح مفهوم، أو حل مسألة، أو اقتراح تجربة منزلية آمنة!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [floatingChatOpen, setFloatingChatOpen] = useState(false);

  // 2. الاختبار التكيفي التفاعلي
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [adaptiveCount, setAdaptiveCount] = useState<number>(5);
  const [adaptiveQuestions, setAdaptiveQuestions] = useState<Question[]>([]);
  const [adaptiveCurrentIndex, setAdaptiveCurrentIndex] = useState<number>(0);
  const [adaptiveAnswers, setAdaptiveAnswers] = useState<{ [qId: string]: string }>({});
  const [adaptiveSubmitted, setAdaptiveSubmitted] = useState<boolean>(false);
  const [adaptiveScore, setAdaptiveScore] = useState<number>(0);
  const [adaptiveWrongAnswersReport, setAdaptiveWrongAnswersReport] = useState<{ question: Question; studentAnswer: string; explain: string }[]>([]);

  // 3. ملف الإنجاز العلمي
  const [xpPoints, setXpPoints] = useState<number>(120); // نقاط افتراضية لبدء التحصيل
  const [completedLabs, setCompletedLabs] = useState<string[]>([]);
  const [incorrectQuestionsLog, setIncorrectQuestionsLog] = useState<{ question: Question; studentAnswer: string; lessonTitle: string }[]>([]);
  const [completedQuestsToday, setCompletedQuestsToday] = useState<string[]>([]);
  
  const handleLabComplete = (xpEarned: number, labId: string) => {
    if (completedLabs.includes(labId)) return;
    const newLabs = [...completedLabs, labId];
    const newXp = xpPoints + xpEarned;
    setCompletedLabs(newLabs);
    setXpPoints(newXp);
    localStorage.setItem('sayyaf_student_portfolio', JSON.stringify({
      xpPoints: newXp,
      completedLabs: newLabs,
      incorrectQuestionsLog,
      completedQuestsToday
    }));
  };
  
  // --- العلامة المائية العائمة الذكية لدواعي الأمان والسرقة ---
  const [watermarkPos, setWatermarkPos] = useState({ top: '30%', left: '20%' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- جلب وحفظ البيانات عند بدء التشغيل التفاعلي ---
  useEffect(() => {
    // 1. Initialize databases if empty in Firebase
    const initializeDatabase = async () => {
      try {
        const snapshot = await get(ref(db, "schools"));
        if (!snapshot.exists() || !snapshot.val() || snapshot.val().length === 0) {
          console.log("⚡ [Firebase] Seeding database with original JSON parameters...");
          const initialSchools = [
            { id: "s1", name: "مدرسة ثانوية عبد الناصر", plan: "gold", expireDate: "2027-12-31", capacity: 150, password: "NASR_ADMIN_2026" },
            { id: "s2", name: "مجمع الثورة التربوي", plan: "silver", expireDate: "2026-12-31", capacity: 80, password: "THAWRA_ADMIN_2026" },
            { id: "s3", name: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء", plan: "gold", expireDate: "2027-08-30", capacity: 200, password: "JAMAL_ADMIN_2026" },
            { id: "s4", name: "مدرسة المتفوقين النموذجية", plan: "free", expireDate: "2026-06-30", capacity: 30, password: "MOTAF_ADMIN_2026" }
          ];
          const initialTeachers = [
            { id: "t1", name: "أ. صالح اليماني", schoolId: "s3", username: "saleh_yamani", status: "active" },
            { id: "t2", name: "أ. محمد عبد الله الشباطي", schoolId: "s4", username: "mohammad_sayyaf", status: "active" },
            { id: "t3", name: "أ. يحيى الرعيني", schoolId: "s2", username: "yahya_raimi", status: "active" }
          ];
          const initialStudents = [
            { id: "st_1", name: "أحمد بن محمد الحاشدي", classGroup: "الشعبة أ", schoolName: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء", username: "ahmed_hashidi", password: "ST_PASS_774", status: "active", expireDate: "2027-06-15" },
            { id: "st_2", name: "معاذ بن نجيب الرعيني", classGroup: "الشعبة ب", schoolName: "مجمع الثورة التربوي", username: "moadh_raimi", password: "ST_PASS_352", status: "active", expireDate: "2026-10-30" },
            { id: "st_3", name: "بلال بن علي الشباطي", classGroup: "الشعبة أ", schoolName: "مدرسة ثانوية عبد الناصر", username: "belal_syaff", password: "ST_PASS_991", status: "suspended", expireDate: "2026-05-01" }
          ];
          const initialManagers = [
            { id: "mgr_1", name: "د. عبد الكريم الشباطي", schoolName: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء", username: "karim_school", password: "MGR_PASS_112", permissions: "all", status: "active" },
            { id: "mgr_2", name: "أ. عبد الخالق الحاشدي", schoolName: "مجمع الثورة التربوي", username: "khaliq_mgr", password: "MGR_PASS_456", permissions: "all", status: "active" },
            { id: "mgr_3", name: "د. نجيب اليماني", schoolName: "مدرسة المتفوقين النموذجية", username: "najib_yemen", password: "MGR_PASS_111", permissions: "restricted", status: "suspended" }
          ];
          const seedScores = [
            { name: "أحمد محمد الحيمي", school: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء", code: "SAYYAF-982103", lessonId: "l1", lessonTitle: "علم القياس والبادئات الفيزيائية", score: "5 / 5", date: "2026-05-20, 09:30 ص" },
            { name: "هشام يحيى الرعيني", school: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء", code: "SAYYAF-982103", lessonId: "l2", lessonTitle: "المتجهات وحساب المحصلة بقانون جيب التمام", score: "4 / 5", date: "2026-05-21, 10:15 ص" },
            { name: "عبد المجيد صالح الشباطي", school: "مدرسة المتفوقين النموذجية", code: "SAYYAF_PHYSICS_2026", lessonId: "l1", lessonTitle: "علم القياس والبادئات الفيزيائية", score: "4 / 5", date: "2026-05-22, 11:00 ص" },
            { name: "إياد محمد عبد الله", school: "مدرسة المتفوقين النموذجية", code: "STUDENT_FREE_PASS", lessonId: "l3", lessonTitle: "الإزاحة والمسافة ومحاكاة سيارة المسار", score: "5 / 5", date: "2026-05-23, 11:45 ص" },
            { name: "أسامة عبده صالح", school: "مجمع الثورة التربوي", code: "SAYYAF-302199", lessonId: "l1", lessonTitle: "علم القياس والبادئات الفيزيائية", score: "3 / 5", date: "2026-05-24, 08:30 ص" },
            { name: "رياض عبد الرحمن اليماني", school: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء", code: "SAYYAF-884192", lessonId: "l3", lessonTitle: "الإزاحة والمسافة ومحاكاة سيارة المسار", score: "4 / 5", date: "2026-05-24, 02:40 م" },
            { name: "فؤاد مطهر الحمادي", school: "مجمع الثورة التربوي", code: "YEMEN_PHYS_100", lessonId: "l2", lessonTitle: "المتجهات وحساب المحصلة بقانون جيب التمام", score: "5 / 5", date: "2026-05-24, 03:10 م" },
            { name: "صلاح يوسف الرداعي", school: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء", code: "SAYYAF-884192", lessonId: "l4", lessonTitle: "السرعة المتوسطة والبيانات اللحظية", score: "3 / 5", date: "2026-05-25, 01:20 م" },
            { name: "أمجد نبيل الجبلي", school: "مدرسة ثانوية عبد الناصر", code: "SAYYAF-749210", lessonId: "l1", lessonTitle: "علم القياس والبادئات الفيزيائية", score: "4 / 5", date: "2026-05-25, 04:50 م" },
            { name: "عمار مختار الصلوي", school: "مدرسة ثانوية عبد الناصر", code: "SAYYAF-749210", lessonId: "l2", lessonTitle: "المتجهات وحساب المحصلة بقانون جيب التمام", score: "2 / 5", date: "2026-05-25, 05:12 م" },
            { name: "جمال صدام الوهبي", school: "مدرسة المتفوقين النموذجية", code: "SAYYAF_PHYSICS_2026", lessonId: "l2", lessonTitle: "المتجهات وحساب المحصلة بقانون جيب التمام", score: "3 / 5", date: "2026-05-25, 06:05 م" },
            { name: "وليد توفيق الحاشدي", school: "مدرسة ثانوية عبد الناصر", code: "SAYYAF-749210", lessonId: "l3", lessonTitle: "الإزاحة والمسافة ومحاكاة سيارة المسار", score: "5 / 5", date: "2026-05-25, 07:15 م" }
          ];
          const initialMessages = [
            {
              id: "msg_1",
              senderName: "الأستاذ سياف الشباطي",
              senderRole: "superadmin" as const,
              targetType: "all" as const,
              content: "أهلاً ومرحباً بكم جميعاً في منصة المرجع الذكي للفيزياء! كثفوا جهودكم في استكشاف قوانين السقوط والجاذبية الأرضية واستعدوا للامتحانات.",
              date: "2026-05-25 09:00 ص"
            }
          ];
          const initialAttendance = [
            { id: "att_1", studentName: "جمال مأمون الفارس", school: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء", classGroup: "الشعبة أ", status: "present" as const, date: "2026-05-26" },
            { id: "att_2", studentName: "أحمد بن علي اليماني", school: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء", classGroup: "الشعبة أ", status: "late" as const, date: "2026-05-26" },
            { id: "att_3", studentName: "صالح العزي", school: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء", classGroup: "الشعبة ب", status: "absent" as const, date: "2026-05-26" }
          ];
          const initialAlerts = [
            {
              id: "alert_1",
              type: "danger" as const,
              title: "انخفاض درجات الطالب التراكمية ⚠️",
              message: "حذارِ: الطالب 'صالح العزي' يواجه تراجعاً علمياً حاداً حيث وصل متوسط درجاته إلى 55% في آخر اختباراته.",
              userType: "all" as const,
              studentName: "صالح العزي",
              school: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء",
              classGroup: "الشعبة ب",
              date: "2026-05-26 10:15 ص",
              alertType: "grades"
            },
            {
              id: "alert_2",
              type: "warning" as const,
              title: "تأخر المعلم في متابعة الشعبة ⏳",
              message: "تنبيه تشغيلي: مضى أكثر من 4 أيام دون قيام معلم الشعبة ج برصد الحضور اليومي أو توجيه رسائل مساندة.",
              userType: "all" as const,
              school: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء",
              classGroup: "الشعبة ج",
              date: "2026-05-27 08:30 ص",
              alertType: "teacher_delay"
            },
            {
              id: "alert_3",
              type: "danger" as const,
              title: "الغياب الصفي المتكرر 🚨",
              message: "تنبيه: تغيب الطالب 'أحمد بن علي اليماني' لـ 3 حصص متتالية دون عذر مسبق، مما يضع استمراره في المنظومة في خطر.",
              userType: "all" as const,
              studentName: "أحمد بن علي اليماني",
              school: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء",
              classGroup: "الشعبة أ",
              date: "2026-05-27 11:00 ص",
              alertType: "absences"
            },
            {
              id: "alert_4",
              type: "info" as const,
              title: "تأخر إنجاز المنهج الدراسي 📉",
              message: "تحليل زمني: متوسط نسبة إكمال المنهج وتخطي عقبات الاختبارات التكيفية للشعبة ج منخفض عن المعدل العام الموصى به.",
              userType: "all" as const,
              school: "ثانوية جمال عبد الناصر للمتفوقين - صنعاء",
              classGroup: "الشعبة ج",
              date: "2026-05-27 11:30 ص",
              alertType: "curriculum_delay"
            }
          ];

          await Promise.all([
            set(ref(db, "schools"), initialSchools),
            set(ref(db, "teachers"), initialTeachers),
            set(ref(db, "studentAccounts"), initialStudents),
            set(ref(db, "schoolManagers"), initialManagers),
            set(ref(db, "activationCodes"), FALLBACK_CODES),
            set(ref(db, "scores"), seedScores),
            set(ref(db, "lmsMessages"), initialMessages),
            set(ref(db, "studentAttendances"), initialAttendance),
            set(ref(db, "smartAlerts"), initialAlerts),
            set(ref(db, "lessons"), allLessons)
          ]);
          console.log("🟢 [Firebase] Seeding completed!");
        }
      } catch (e) {
        console.warn("⚠️ [Firebase Init Seeding Failed]:", e);
      }
    };

    initializeDatabase();

    const unsubscribes = [
      onValue(ref(db, "lmsMessages"), (snap) => {
        const data = snap.val();
        if (snap.exists() && data) {
          const arr = convertToSafeArray<LMSMessage>(data);
          setLmsMessages(arr);
          localStorage.setItem('sayyaf_lms_messages', JSON.stringify(arr));
        }
      }, (err) => console.error("Permission denied on lmsMessages read:", err)),

      onValue(ref(db, "studentAttendances"), (snap) => {
        const data = snap.val();
        if (snap.exists() && data) {
          const arr = convertToSafeArray<StudentAttendance>(data);
          setStudentAttendances(arr);
          localStorage.setItem('sayyaf_lms_attendance', JSON.stringify(arr));
        }
      }, (err) => console.error("Permission denied on attendance read:", err)),

      onValue(ref(db, "smartAlerts"), (snap) => {
        const data = snap.val();
        if (snap.exists() && data) {
          const arr = convertToSafeArray<SmartAlert>(data);
          setSmartAlerts(arr);
          localStorage.setItem('sayyaf_smart_alerts', JSON.stringify(arr));
        }
      }, (err) => console.error("Permission denied on alerts read:", err)),

      onValue(ref(db, "lessons"), (snap) => {
        const data = snap.val();
        if (snap.exists() && data) {
          const arr = convertToSafeArray<Lesson>(data);
          setLessonsList(arr);
        }
      }, (err) => console.error("Permission denied on lessons read:", err))
    ];

    // تحميل ملف الإنجاز والنشاطات للطالب
    const storedPortfolio = localStorage.getItem('sayyaf_student_portfolio');
    if (storedPortfolio) {
      const parsed = JSON.parse(storedPortfolio);
      if (parsed.xpPoints !== undefined) setXpPoints(parsed.xpPoints);
      if (parsed.completedLabs) setCompletedLabs(parsed.completedLabs);
      if (parsed.incorrectQuestionsLog) setIncorrectQuestionsLog(parsed.incorrectQuestionsLog);
      if (parsed.completedQuestsToday) setCompletedQuestsToday(parsed.completedQuestsToday);
    }

    // التحقق من حالة تسجيل دخول الطالب السابقة أو المدرسة الدورية المخزنة تلبية للأداء
    const cachedStudent = localStorage.getItem('sayyaf_current_student');
    const savedSchool = localStorage.getItem('sayyaf_selected_school_name');
    if (cachedStudent) {
      const parsed = JSON.parse(cachedStudent);
      setStudentName(parsed.name);
      setStudentSchool(parsed.school);
      setSchoolInputText(parsed.school);
      setStudentCode(parsed.code);
      setStudentClass(parsed.classGroup || 'الشعبة أ');
      setCurrentUserType('student');
      handleSchoolSelected(parsed.school);
    } else if (savedSchool) {
      setSchoolInputText(savedSchool);
      handleSchoolSelected(savedSchool);
    }

    // تدوير العلامة المائية عشوائياً لمنع برامج تصوير الشاشة
    const interval = setInterval(() => {
      const topRandom = Math.floor(Math.random() * 70) + 15;
      const leftRandom = Math.floor(Math.random() * 60) + 10;
      setWatermarkPos({ top: `${topRandom}%`, left: `${leftRandom}%` });
    }, 6000);

    return () => {
      clearInterval(interval);
      unsubscribes.forEach(unsub => {
        try {
          unsub();
        } catch (e) {
          console.warn(e);
        }
      });
    };
  }, []);

  // تأثير المراقبة والبحث التلقائي الذكي لاسم المدرسة أثناء الكتابة المباشرة تلبية للطلب #4 و #5 و #11 و #12 و #15
  useEffect(() => {
    const cleanInput = schoolInputText.trim();
    if (!cleanInput || cleanInput.length < 2) {
      setSchoolSuggestions([]);
      setSchoolSearchingError('');
      return;
    }

    setIsSearchingSchool(true);
    setSchoolSearchingError('');

    // تفعيل دالة جلب الاقتراحات التلقائية اللحظية تلبية للطلب #11
    const unsub = setupAutoCompleteSuggestions(cleanInput, (suggestions) => {
      setSchoolSuggestions(suggestions);
      setIsSearchingSchool(false);
      
      // إذا كان الإدخال طويلاً ومع ذلك لا وجود لأي تطابق تلقائي مع المدارس
      const normalizedQuery = normalizeArabic(cleanInput);
      const exactFound = suggestions.some(s => normalizeArabic(s.name) === normalizedQuery);
      if (suggestions.length === 0 && cleanInput.length >= 4 && !exactFound) {
        setSchoolSearchingError('❌ المدرسة غير موجودة');
      }
    });

    return () => unsub();
  }, [schoolInputText]);

  // --- تتبع الهستوري للتنقل بالزر الخلفي للمدير والمعلم ---
  useEffect(() => {
    if (currentUserType === 'teacher') {
      setTeacherTabHistory(prev => {
        if (prev[prev.length - 1] !== teacherActiveDashboardTab) {
          return [...prev, teacherActiveDashboardTab];
        }
        return prev;
      });
    }
  }, [teacherActiveDashboardTab, currentUserType]);

  useEffect(() => {
    if (currentUserType === 'school') {
      setSchoolTabHistory(prev => {
        if (prev[prev.length - 1] !== schoolActiveDashboardTab) {
          return [...prev, schoolActiveDashboardTab];
        }
        return prev;
      });
    }
  }, [schoolActiveDashboardTab, currentUserType]);

  // إضافة كود جديد للتحكم المحلي وقواعد البيانات
  const saveCodesToStorage = (updated: ActivationCode[]) => {
    setActivationCodes(updated);
    localStorage.setItem('sayyaf_activation_codes', JSON.stringify(updated));
    set(ref(db, 'activationCodes'), updated).catch(e => console.error(e));
  };

  const saveScoresToStorage = (updated: StudentScore[]) => {
    setScores(updated);
    localStorage.setItem('sayyaf_student_scores', JSON.stringify(updated));
    set(ref(db, 'scores'), updated).catch(e => console.error(e));
  };

  // --- دوال التسجيل والدخول والتحقق من التراخيص ---
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      alert("⚠️ الرجاء إدخال اسمك الكريم كاملاً!");
      return;
    }

    const isValid = await validateAndSelectSchoolInput();
    if (!isValid) {
      alert("❌ المدرسة المكتوبة غير موجودة! يرجى اختيار أو كتابة مدرسة صحيحة ومسجلة في النظام للمتابعة.");
      return;
    }

    // التحقق من كود التفعيل وملازمته، أو مطابقة حساب طالب مسبق التثبيت
    const matchedCode = activationCodes.find(
      c => c.code.trim().toUpperCase() === activationCodeInput.trim().toUpperCase()
    );

    const matchedStudentAcc = studentAccounts.find(
      acc => acc.schoolName === studentSchool && 
      (acc.username.trim().toUpperCase() === activationCodeInput.trim().toUpperCase() || 
       (acc.password && acc.password.trim().toUpperCase() === activationCodeInput.trim().toUpperCase()))
    );

    if (!matchedCode && !matchedStudentAcc) {
      alert("❌ كود التفعيل أو اسم المستخدم/المرور الموحد غير صحيح! يرجى الحصول على ترخيص نشط من الأستاذ سياف الشباطي.");
      return;
    }

    if (matchedStudentAcc) {
      if (matchedStudentAcc.status === 'suspended') {
        alert("⚠️ تم إيقاف حساب هذا الطالب من قبل الأستاذ سياف الشباطي (المالك الموجه)! يرجى مراجعته فوراً.");
        return;
      }
      const today = new Date().toISOString().split('T')[0];
      if (matchedStudentAcc.expireDate && matchedStudentAcc.expireDate < today) {
        alert(`❌ لقد انتهى اشتراكك كطالب بالمنظومة بتاريخ [${matchedStudentAcc.expireDate}]! يرجى تمديد اشتراكك.`);
        return;
      }

      // تسجيل دخول فوري ناجح وحفظ التفاصيل بالكوكيز/التخزين المحلي
      setStudentCode(matchedStudentAcc.username);
      setCurrentUserType('student');

      const defClass = studentClass || matchedStudentAcc.classGroup || "الشعبة أ";
      const studentInfo = { name: studentName, school: studentSchool, code: matchedStudentAcc.username, classGroup: defClass };
      localStorage.setItem('sayyaf_current_student', JSON.stringify(studentInfo));
      logActivity(studentName, 'Student', `تسجيل دخول ناجح بالحساب المدرسي: ${matchedStudentAcc.username} شعبة ${defClass}`);
      return;
    }

    if (matchedCode.status === 'stopped') {
      alert("⚠️ كود التفعيل هذا موقوف حالياً من قبل الأستاذ سياف الشباطي (المالك)! يرجى مراجعته للحصول على ترخيص نشط.");
      return;
    }

    // التحقق من تاريخ انتهاء صلاحية الكود
    const todayStrInYMD = new Date().toISOString().split('T')[0];
    if (matchedCode.expireAt && matchedCode.expireAt < todayStrInYMD) {
      alert(`❌ كود التفعيل هذا قد انتهت صلاحيته بتاريخ [${matchedCode.expireAt}]! يرجى مراجعة الأستاذ سياف الشباطي للترقية.`);
      return;
    }

    // التحقق من حد الأجهزة المسجلة
    const devicesList = matchedCode.devicesUsed || [];
    const limitMax = matchedCode.deviceLimit || 1;
    if (devicesList.length >= limitMax && !devicesList.includes(studentName.trim())) {
      alert(`❌ عفواً! هذا الكود وصل للحد الأقصى للأجهزة المسموح بها (${limitMax} جهاز/أجهزة). لا يمكن تسجيل جهاز جديد.`);
      return;
    }

    // تسجيل الدخول بنجاح
    setStudentCode(matchedCode.code);
    setCurrentUserType('student');
    
    const defClass = studentClass || "الشعبة أ";
    const studentInfo = { name: studentName, school: studentSchool, code: matchedCode.code, classGroup: defClass };
    localStorage.setItem('sayyaf_current_student', JSON.stringify(studentInfo));

    // تحديث كود التفعيل مع رصد معلومات الأجهزة
    const nextDevices = [...devicesList];
    if (!nextDevices.includes(studentName.trim())) {
      nextDevices.push(studentName.trim());
    }
    const nextStatus = nextDevices.length >= limitMax ? 'used' as const : 'active' as const;

    const updatedCodes = activationCodes.map(c => 
      c.code === matchedCode.code ? { 
        ...c, 
        status: nextStatus, 
        usedBy: studentName.trim(),
        devicesUsed: nextDevices
      } : c
    );
    saveCodesToStorage(updatedCodes);
    logActivity(studentName, 'Student', `تفعيل ترخيص فريد بنجاح ودخول المنصة بالكود: ${matchedCode.code} شعبة ${defClass}`);
  };

  const handleAdminLogin = (role: 'school' | 'teacher' | 'superadmin') => {
    if (role === 'superadmin') {
      if (adminPasswordInput === platformSettings.superAdminPassword) {
        setCurrentUserType('super_admin');
        setStudentName('المالك العام (Super Admin)');
        setStudentSchool('إدارة النظام الكبرى');
        setAdminPasswordInput('');
        loadAllDataForAdmin();
        setActiveTab('super_admin_panel');
        logActivity('المالك العام (Super Admin)', 'Super_Admin', 'سجل المالك العام الدخول إلى النظام المحوري للتحكم الشامل 👑');
      } else if (adminPasswordInput === platformSettings.managerPassword) {
        setCurrentUserType('superadmin');
        setStudentName('المدير العام (الأستاذ سياف)');
        setStudentSchool('إدارة المنصة الكبرى');
        setAdminPasswordInput('');
        loadAllDataForAdmin();
        setActiveTab('leaderboard');
        logActivity('المدير العام (الأستاذ سياف)', 'Superadmin', 'سجل دخول المدير العام لمتابعة التحصيل العلمي والنتائج بالجمهورية 📋');
      } else {
        alert("❌ كلمة المرور المدخلة غير صحيحة مطلقاً!");
      }
    } else if (role === 'school') {
      if (!selectedSchoolAdmin) {
        alert("⚠️ يرجى تحديد مدرسة أولاً!");
        return;
      }
      
      const matchedSchool = schools.find(s => s.name === selectedSchoolAdmin);
      const isSchoolPasswordMatch = matchedSchool && matchedSchool.password === schoolPasswordInput;

      const matchedMgr = schoolManagers.find(
        m => m.schoolName === selectedSchoolAdmin && 
        (m.username === schoolPasswordInput || m.password === schoolPasswordInput)
      );

      if (schoolPasswordInput === 'SCHOOL_SECURE' || isSchoolPasswordMatch || matchedMgr) {
        if (matchedMgr && matchedMgr.status === 'suspended') {
          alert("⚠️ تم إيقاف حساب هذا المدير من قبل المالك العام (الأستاذ سياف الشباطي)!");
          return;
        }
        const managerName = matchedMgr ? matchedMgr.name : `منسق مدرسة ${selectedSchoolAdmin}`;
        setStudentSchool(selectedSchoolAdmin);
        setStudentName(managerName);
        setCurrentUserType('school');
        setSchoolPasswordInput('');
        loadAllDataForAdmin();
        setActiveTab('leaderboard');
        logActivity(managerName, 'School', `سجل دخول منسق/مدير مدرسة لثانوية ${selectedSchoolAdmin} بنجاح`);
      } else {
        alert("❌ اسم المستخدم أو كلمة المرور الخاصة بالمنسق المدرسي غير صحيحة!");
      }
    } else if (role === 'teacher') {
      // التحقق مما إذا كان المدخل يطابق الباسورد الافتراضي أو أي معلم مخصص
      const matchedTeacher = teachers.find(
        t => t.username === teacherPasswordInput || 
        t.name === teacherPasswordInput || 
        (t.password && t.password === teacherPasswordInput)
      );
      
      if (teacherPasswordInput === 'TEACHER_SECURE') {
        setCurrentUserType('teacher');
        setStudentName('المعلم الموجه');
        setStudentSchool('وزارة التربية والتعليم');
        setTeacherPasswordInput('');
        loadAllDataForAdmin();
        setActiveTab('leaderboard');
        logActivity('المعلم الموجه الافتراضي', 'Teacher', 'سجل دخول معلم موجه لمراجعة وتقييم الشُعب الدراسية');
      } else if (matchedTeacher) {
        if (matchedTeacher.status === 'suspended') {
          alert("⚠️ تم إيقاف حساب هذا المعلم الموجه من قبل الأستاذ سياف (المالك العام)!");
          return;
        }
        setCurrentUserType('teacher');
        setStudentName(matchedTeacher.name);
        const sch = schools.find(s => s.id === matchedTeacher.schoolId);
        const schName = sch ? sch.name : 'مجلس الموجهين الكافي';
        setStudentSchool(schName);
        setTeacherPasswordInput('');
        loadAllDataForAdmin();
        setActiveTab('leaderboard');
        logActivity(matchedTeacher.name, 'Teacher', `سجل دخول المعلم الموجه لـ ${schName} لمتابعة الطلاب ورصد الدرجات`);
      } else {
        alert("❌ الرقم السري أو اسم المستخدم الموجه للمعلم غير صحيح!");
      }
    }
  };

  const handleLogout = () => {
    logActivity(studentName || 'مستخدم', currentUserType, 'سجل خروج من المنظومة وأنهى الجلسة النشطة');
    clearSchoolSubscriptions();
    if (currentUserType === 'student') {
      localStorage.removeItem('sayyaf_current_student');
    }
    setCurrentUserType('guest');
    setSelectedLessonId(null);
    setActiveTab('lessons');
    setTeacherTabHistory(['overview']);
    setSchoolTabHistory(['overview']);
  };

  const handleTeacherBack = () => {
    if (selectedLessonId !== null) {
      setSelectedLessonId(null);
      return;
    }
    if (teacherTabHistory.length > 1) {
      const nextHistory = [...teacherTabHistory];
      nextHistory.pop(); // Remove the current tab
      const previousTab = nextHistory[nextHistory.length - 1];
      setTeacherTabHistory(nextHistory);
      setTeacherActiveDashboardTab(previousTab as any);
    } else {
      setTeacherActiveDashboardTab('overview');
    }
  };

  const handleSchoolBack = () => {
    if (selectedLessonId !== null) {
      setSelectedLessonId(null);
      return;
    }
    if (schoolTabHistory.length > 1) {
      const nextHistory = [...schoolTabHistory];
      nextHistory.pop(); // Remove the current tab
      const previousTab = nextHistory[nextHistory.length - 1];
      setSchoolTabHistory(nextHistory);
      setSchoolActiveDashboardTab(previousTab as any);
    } else {
      setSchoolActiveDashboardTab('overview');
    }
  };

  // --- تصفح ومطالعة وتدقيق الدروس الثانوية المعتمدة ---
  const filteredLessons = lessonsList.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lesson.accordionData.some(a => a.title.includes(searchTerm) || a.content.includes(searchTerm));
    const matchesUnit = selectedUnit === 'all' || lesson.unit === selectedUnit;
    return matchesSearch && matchesUnit;
  });

  const selectedLesson = lessonsList.find(l => l.id === selectedLessonId);

  const toggleAccordion = (title: string) => {
    setOpenAccordions(prev => ({ ...prev, [title]: !prev[title] }));
  };

  // --- معالج نظام الامتحانات وتأكيد النتائج الفوري ---
  const handleAnswerSelect = (qId: string, option: string) => {
    setQuizAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleQuizSubmit = (lessonId: string) => {
    if (!selectedLesson) return;
    
    // حساب كمية الإجابات وسرعة الدقة
    let scoreCount = 0;
    selectedLesson.questions.forEach(q => {
      const isCorrect = q.type === 'tf' 
        ? quizAnswers[q.id] === q.correct
        : quizAnswers[q.id] === q.correct;
      if (isCorrect) scoreCount++;
    });

    setQuizScore(scoreCount);
    setQuizSubmitted(true);

    // رفع النتيجة إلى لوحة الشرف الفورية وحفظها محلياً
    const newScore: StudentScore = {
      name: studentName || "زائر للمنصة",
      school: studentSchool || "التعليم المباشر الثانوي",
      code: studentCode || "زائر مجاني",
      lessonId: lessonId,
      lessonTitle: selectedLesson.title,
      score: `${scoreCount} / ${selectedLesson.questions.length}`,
      date: new Date().toLocaleString('ar-YE', { hour12: true }),
      classGroup: studentClass || "الشعبة أ"
    };

    const updatedScores = [newScore, ...scores];
    saveScoresToStorage(updatedScores);

    // تحديث نقاط الـ XP والتحليل الدراسي علمياً (+20 XP عن كل إجابة صحيحة)
    const earnedXp = scoreCount * 20;
    const newXp = xpPoints + earnedXp;

    // تجميع الأخطاء وإضافتها لسجل المتابعة
    const newLogs = [...incorrectQuestionsLog];
    selectedLesson.questions.forEach(q => {
      const studentAns = quizAnswers[q.id] || "لم يحل";
      const isCorrect = q.correct === studentAns;
      if (!isCorrect) {
        if (!newLogs.some(log => log.question.id === q.id)) {
          newLogs.push({
            question: q,
            studentAnswer: studentAns,
            lessonTitle: selectedLesson.title
          });
        }
      }
    });

    setXpPoints(newXp);
    setIncorrectQuestionsLog(newLogs);
    localStorage.setItem('sayyaf_student_portfolio', JSON.stringify({
      xpPoints: newXp,
      completedLabs,
      incorrectQuestionsLog: newLogs,
      completedQuestsToday
    }));
  };

  // ==================== حزمة الذكاء الاصطناعي والمساعد الفيزيائي المنهجي 2026 ====================
  const handleChatSend = async (customMsg?: string) => {
    const textToSend = customMsg || chatInput;
    if (!textToSend.trim()) return;

    const userMsg = { role: 'user' as const, text: textToSend };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: chatMessages.slice(-6).map(m => ({
            role: m.role,
            text: m.text
          }))
        })
      });

      const data = await response.json();
      if (response.ok) {
        setChatMessages(prev => [...prev, { role: 'model', text: data.text || "تعذر الاتصال بالمساعد الذكي حالياً، يرجى المحاولة لاحقاً." }]);
      } else {
        console.error("API Response Not OK", data);
        setChatMessages(prev => [...prev, { role: 'model', text: "تعذر الاتصال بالمساعد الذكي حالياً، يرجى المحاولة لاحقاً." }]);
      }
    } catch (err: any) {
      console.error("Network Failure calling Assistant:", err);
      setChatMessages(prev => [...prev, { role: 'model', text: "تعذر الاتصال بالمساعد الذكي حالياً، يرجى المحاولة لاحقاً." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // ==================== محاكي ومحرك الاختبارات التكيفية المخصصة ====================
  const generateAdaptiveQuiz = () => {
    let pool: Question[] = [];
    lessonsList.forEach(l => {
      if (l.questions && Array.isArray(l.questions)) {
        l.questions.forEach(q => {
          pool.push({
            ...q,
            id: `adaptive_${l.id}_${q.id}`,
            text: `[${l.title}] ${q.text}`
          });
        });
      }
    });

    let filtered = pool.filter(q => {
      if (adaptiveDifficulty === 'easy') {
        return q.type === 'tf';
      } else if (adaptiveDifficulty === 'medium') {
        return q.type === 'mc' && !q.text.includes('احسب') && !q.text.includes('عجلة') && !q.text.includes('قوة');
      } else {
        return q.type === 'mc' && (q.text.includes('احسب') || q.text.includes('مسافة') || q.text.includes('عجلة') || q.text.includes('سرعة'));
      }
    });

    if (filtered.length < adaptiveCount) {
      filtered = pool;
    }

    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, adaptiveCount);

    setAdaptiveQuestions(selected);
    setAdaptiveCurrentIndex(0);
    setAdaptiveAnswers({});
    setAdaptiveSubmitted(false);
    setAdaptiveScore(0);
    setAdaptiveWrongAnswersReport([]);
  };

  const handleAdaptiveAnswerSelect = (qId: string, option: string) => {
    setAdaptiveAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleAdaptiveQuizSubmit = () => {
    if (adaptiveQuestions.length === 0) return;

    let scoreCount = 0;
    const report: any[] = [];
    const newLogs = [...incorrectQuestionsLog];

    adaptiveQuestions.forEach(q => {
      const studentAns = adaptiveAnswers[q.id] || "لم يحل";
      const isCorrect = q.correct.trim() === studentAns.trim();
      if (isCorrect) {
        scoreCount++;
      } else {
        report.push({
          question: q,
          studentAnswer: studentAns,
          explain: q.explain || 'الحل يعتمد على الفهم المفاهيمي ومعادلات الحركة والقياس.'
        });

        if (!newLogs.some(log => log.question.id === q.id)) {
          newLogs.push({
            question: q,
            studentAnswer: studentAns,
            lessonTitle: 'من الاختبار التكيفي'
          });
        }
      }
    });

    setAdaptiveScore(scoreCount);
    setAdaptiveWrongAnswersReport(report);
    setAdaptiveSubmitted(true);

    const difficultyBonus = adaptiveDifficulty === 'hard' ? 100 : adaptiveDifficulty === 'medium' ? 50 : 20;
    const earnedXp = 50 + (scoreCount * 25) + (scoreCount === adaptiveQuestions.length ? difficultyBonus : 0);
    const newXp = xpPoints + earnedXp;

    setXpPoints(newXp);
    setIncorrectQuestionsLog(newLogs);
    localStorage.setItem('sayyaf_student_portfolio', JSON.stringify({
      xpPoints: newXp,
      completedLabs,
      incorrectQuestionsLog: newLogs,
      completedQuestsToday
    }));

    const newScore: StudentScore = {
      name: studentName || "زائر للمنصة",
      school: studentSchool || "التعليم المباشر الثانوي",
      code: studentCode || "زائر مجاني",
      lessonId: `adaptive_${adaptiveDifficulty}`,
      lessonTitle: `🧠 اختبار تكيفي (${adaptiveDifficulty === 'easy' ? 'سهل' : adaptiveDifficulty === 'medium' ? 'متوسط' : 'صعب'})`,
      score: `${scoreCount} / ${adaptiveQuestions.length}`,
      date: new Date().toLocaleString('ar-YE', { hour12: true }),
      classGroup: studentClass || "الشعبة أ"
    };
    saveScoresToStorage([newScore, ...scores]);
  };

  // --- توليد وإدارة الأكواد والمدارس التفاعلية ---
  const handleAddSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;
    const newS: School = {
      id: `s_${Date.now()}`,
      name: newSchoolName.trim()
    };
    setSchools(prev => [...prev, newS]);
    setNewSchoolName('');
    alert("✅ تمت إضافة المدرسة للشعبة بنجاح!");
  };

  const handleGenerateCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodeSchool) {
      alert("⚠️ يرجى تحديد مدرسة لإلحاق كود الترخيص بها.");
      return;
    }
    const finalCode = codeGenCustom.trim() 
      ? codeGenCustom.trim().toUpperCase() 
      : "SAYYAF-" + Math.floor(100000 + Math.random() * 900000);

    if (activationCodes.some(c => c.code === finalCode)) {
      alert("❌ خطأ: هذا الرقم السري مرتبط بمستخدم آخر!");
      return;
    }

    const newC: ActivationCode = {
      code: finalCode,
      status: 'active',
      school: newCodeSchool,
      createdAt: new Date().toISOString().split('T')[0],
      expireAt: codeGenExpire || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      deviceLimit: Number(codeGenDeviceLimit) || 1,
      devicesUsed: []
    };
    saveCodesToStorage([newC, ...activationCodes]);
    setCodeGenCustom('');
    logActivity('المالك العام', 'Super_Admin', `تم إنشاء كود تفعيل مفرد وثابت [${finalCode}] مدرج تحت ${newCodeSchool}`);
    alert(`🔑 تم توليد ترخيص تفعيل فريد بنجاح: ${finalCode}`);
  };

  const handleToggleCodeStatus = (codeString: string) => {
    const updated = activationCodes.map(c => {
      if (c.code === codeString) {
        const nextStatus = c.status === 'stopped' ? 'active' : 'stopped';
        return { ...c, status: nextStatus as any };
      }
      return c;
    });
    saveCodesToStorage(updated);
  };

  const handleDeleteCode = (codeString: string) => {
    if (confirm("🚨 هل أنت متأكد من لزوم حذف كود الترخيص هذا نهائياً من قاعدة البيانات؟")) {
      const updated = activationCodes.filter(c => c.code !== codeString);
      saveCodesToStorage(updated);
    }
  };

  const handleSaveCodeEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCode) return;
    const updated = activationCodes.map(c => {
      if (c.code === editingCode.code) {
        return {
          ...c,
          school: editCodeSchool,
          expireAt: editCodeExpire,
          deviceLimit: Number(editCodeDeviceLimit),
          status: editCodeStatus,
          devicesUsed: editingCode.devicesUsed || []
        };
      }
      return c;
    });
    saveCodesToStorage(updated);
    setEditingCode(null);
    alert("🎉 تم تحديث كود التفعيل بنجاح!");
  };

  const handleDeleteScore = (index: number) => {
    if (confirm("🚨 هل أنت متأكد من لزوم حذف هذا التقرير العلمي للطالب؟")) {
      const updated = scores.filter((_, idx) => idx !== index);
      saveScoresToStorage(updated);
    }
  };

  // --- دمج وإدارة خيارات الإدارة الكبرى لـ Super Admin الفائقة ---
  const [superAdminSubTab, setSuperAdminSubTab] = useState<'overview' | 'schools' | 'teachers' | 'codes' | 'search' | 'logs' | 'settings'>('overview');
  const [unifiedSearchQuery, setUnifiedSearchQuery] = useState('');
  const [batchCountInput, setBatchCountInput] = useState(10);

  const handleAddSchoolSuper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;
    const newS: School = {
      id: `s_${Date.now()}`,
      name: newSchoolName.trim(),
      plan: 'free',
      expireDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 steps trial
      capacity: 50,
      password: `SCH_${Math.floor(100000 + Math.random() * 900000)}`
    };
    const updated = [...schools, newS];
    saveSchoolsToStorage(updated);
    setNewSchoolName('');
    alert("✅ تمت إضافة مدرسة جديدة بنجاح في سجل المرجع!");
  };

  const handleDeleteSchoolSuper = (id: string, name: string) => {
    if (confirm(`⚠️ تحذير خطير: هل أنت متأكد من لزوم إزالة مدرسة "${name}" نهائياً من قاعدة البيانات المحلية؟ سيؤدي هذا لقطع ارتباط كشوفات وتحقق طلاب هذه المدرسة!`)) {
      const updated = schools.filter(s => s.id !== id);
      saveSchoolsToStorage(updated);
      alert("🚨 تمت إزالة المدرسة بنجاح من الشعبة.");
    }
  };

  const handleSaveSchoolSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchoolId) return;
    const updated = schools.map(s => {
      if (s.id === editingSchoolId) {
        return {
          ...s,
          plan: editingSchoolPlan,
          capacity: Number(editingSchoolCapacity),
          expireDate: editingSchoolExpiry,
          password: editingSchoolPassword
        };
      }
      return s;
    });
    saveSchoolsToStorage(updated);
    setEditingSchoolId(null);
    alert("🎉 تم تحديث ترخيص المدرسة والاشتراك بنجاح تام!");
  };

  const handleAddTeacherSuper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminTeacherName.trim() || !adminTeacherUsername.trim() || !adminTeacherSchoolId) {
      alert("⚠️ يرجى ملء كافة تفاصيل المعلم الموجه بدقة!");
      return;
    }
    // فحص المعرف ليكون فريداً
    if (teachers.some(t => t.username === adminTeacherUsername.trim().toLowerCase())) {
      alert("⚠️ معرف المعلم هذا مستخدم مسبقاً! يرجى اختيار معرف فريد.");
      return;
    }
    const newT: Teacher = {
      id: `t_${Date.now()}`,
      name: adminTeacherName.trim(),
      schoolId: adminTeacherSchoolId,
      username: adminTeacherUsername.trim().toLowerCase(),
      status: 'active'
    };
    const updated = [...teachers, newT];
    saveTeachersToStorage(updated);
    setAdminTeacherName('');
    setAdminTeacherUsername('');
    setAdminTeacherSchoolId('');
    alert("✅ تم إدراج المعلم الجديد بالمجلس وتخصيص كلمة دخول وتفعيل حسابه!");
  };

  const handleToggleTeacherStatusSuper = (id: string) => {
    const updated = teachers.map(t => {
      if (t.id === id) {
        const next = t.status === 'suspended' ? 'active' : 'suspended';
        return { ...t, status: next as any };
      }
      return t;
    });
    saveTeachersToStorage(updated);
  };

  const handleDeleteTeacherSuper = (id: string, name: string) => {
    if (confirm(`🚨 هل أنت متأكد من لزوم عزل المعلم الموجه "${name}" نهائياً؟`)) {
      const updated = teachers.filter(t => t.id !== id);
      saveTeachersToStorage(updated);
      alert("❌ تم عزل المعلم من الشعبة.");
    }
  };

  const handleBatchGenerateCodesSuper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodeSchool) {
      alert("⚠️ يرجى أولاً إقران الأكواد بمدرسة مرخصة لتأمين رصد البيانات!");
      return;
    }
    const count = Number(batchCountInput);
    if (isNaN(count) || count < 1 || count > 500) {
      alert("⚠️ يرجى تحديد كمية توليد منطقية ومتاحة (بين 1 و 500 أقصى حد للتصدير).");
      return;
    }
    const newGenerated: ActivationCode[] = [];
    const existing = new Set(activationCodes.map(c => c.code));
    for (let i = 0; i < count; i++) {
      let randCode = "";
      do {
        randCode = "SAYYAF-" + Math.floor(100000 + Math.random() * 900000);
      } while (existing.has(randCode));
      existing.add(randCode);
      newGenerated.push({
        code: randCode,
        status: 'active',
        school: newCodeSchool,
        createdAt: new Date().toISOString().split('T')[0],
        expireAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        deviceLimit: 1,
        devicesUsed: []
      });
    }
    saveCodesToStorage([...newGenerated, ...activationCodes]);
    logActivity('المالك العام', 'Super_Admin', `توليد حزمة سرية جماعية مكونة من ${count} كود ترخيص لثانوية ${newCodeSchool}`);
    alert(`🔑 مبروك! تم توليد حزمة تراخيص كبرى مكونة من ${count} كود لمدرسة [${newCodeSchool}] بنجاح!`);
  };

  const handleClearAllCodesSuper = () => {
    if (confirm("🚨🚨 تحذير سيادي مدمر أستاذ سياف: هل أنت متأكد من جرف وإزالة كافة أكواد ترخيص المنصة كلياً؟ سيتم قطع الخدمة عن جميع الطلاب!")) {
      saveCodesToStorage([]);
      alert("💥 تم جرف قاعدة بيانات الأكواد وتصفيرها بالكامل.");
    }
  };

  const handleClearAllScoresSuper = () => {
    if (confirm("🚨🚨 تحذير مدمر للغاية: هل أنت متأكد من رغبتك في جرف وتصفير كشوف علامات ودروس الطلاب بالجمهورية؟")) {
      saveScoresToStorage([]);
      alert("💥 تم تصفير سجلات الإحصاء العلمي بكافة الشعب والمحافظات.");
    }
  };

  return (
    <div className="min-h-screen font-sans bg-slate-50 relative pb-12 overflow-x-hidden selection:bg-indigo-600 selection:text-white">
      
      {/* 🛡️ الطبقة الأمنية لحجب تصوير الشاشة والعلامة المائية العائمة */}
      {currentUserType === 'student' && (
        <div 
          className="fixed pointer-events-none select-none text-slate-450/15 text-xs font-mono font-bold z-50 p-2 border border-slate-300/10 rounded-lg bg-slate-100/5 backdrop-blur-[0.5px] transition-all duration-1000 ease-in-out"
          style={{ 
            top: watermarkPos.top, 
            left: watermarkPos.left,
            transform: 'rotate(-12deg)'
          }}
        >
          👤 الطالب: {studentName} <br />
          🏫 المدرسة: {studentSchool} <br />
          🔑 الكود النشط: {studentCode} <br />
          📅 الخصوصية مكفولة © المرجع الذكي
        </div>
      )}

      {/* ==================== راس المنصة والتحاور المباشر ==================== */}
      <header className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl sticky top-0 z-40 border-b border-indigo-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <Compass className="text-blue-950 stroke-[2.5]" size={22} />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight">منصة المرجع الذكي في الفيزياء</h1>
              <p className="text-[10px] text-yellow-300 font-semibold">تحت إشراف الأستاذ سياف الشباطي – اليمن 🇾🇪</p>
            </div>
          </div>

          {/* تصفح محمول وقوائم منسدلة */}
          <div className="hidden md:flex items-center gap-3">
            {currentUserType !== 'guest' && (
              <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                {['super_admin', 'superadmin'].includes(currentUserType) && (
                  <button 
                    onClick={() => setActiveTab('super_admin_panel')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'super_admin_panel' ? 'bg-amber-500 text-blue-950 shadow-md font-black' : 'text-slate-250 hover:bg-white/10'}`}
                  >
                    👑 لوحة المالك والتحكم الكبرى
                  </button>
                )}
                {currentUserType !== 'school' && (
                  <>
                    <button 
                      onClick={() => { setActiveTab('lessons'); setSelectedLessonId(null); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'lessons' ? 'bg-amber-500 text-blue-950 shadow-md font-black' : 'text-slate-250 hover:bg-white/10'}`}
                    >
                      📖 الدروس الـ١٨
                    </button>
                    <button 
                      onClick={() => setActiveTab('labs')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'labs' ? 'bg-amber-500 text-blue-950 shadow-md font-black' : 'text-slate-250 hover:bg-white/10'}`}
                    >
                      🧪 المختبرات
                    </button>
                    <button 
                      onClick={() => { setActiveTab('adaptive_quiz'); generateAdaptiveQuiz(); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'adaptive_quiz' ? 'bg-amber-500 text-blue-950 shadow-md font-black' : 'text-slate-250 hover:bg-white/10'}`}
                    >
                      🧠 اختبار تكيفي
                    </button>
                    <button 
                      onClick={() => setActiveTab('portfolio')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'portfolio' ? 'bg-amber-500 text-blue-950 shadow-md font-black' : 'text-slate-250 hover:bg-white/10'}`}
                    >
                      🎖️ ملف الإنجاز
                    </button>
                    <button 
                      onClick={() => setActiveTab('chatbot')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'chatbot' ? 'bg-amber-500 text-blue-950 shadow-md font-black' : 'text-slate-250 hover:bg-white/10'}`}
                    >
                      💬 مساعد سياف AI
                    </button>
                    <button 
                      onClick={() => setActiveTab('leaderboard')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'leaderboard' ? 'bg-amber-500 text-blue-950 shadow-md font-black' : 'text-slate-250 hover:bg-white/10'}`}
                    >
                      🏆 لوحة الشرف
                    </button>
                    <button 
                      onClick={() => setActiveTab('notifications')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'notifications' ? 'bg-amber-500 text-blue-950 shadow-md font-black' : 'text-slate-250 hover:bg-white/10'}`}
                    >
                      🔔 الإشعارات الذكية
                    </button>
                  </>
                )}
                {currentUserType === 'school' && (
                  <button 
                    onClick={() => { setActiveTab('leaderboard'); }}
                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-black shadow-md flex items-center gap-1 cursor-pointer transition-all"
                  >
                    📊 لوحة القيادة التنافسية والتحليلات المدرسية
                  </button>
                )}
                 {['superadmin', 'super_admin'].includes(currentUserType) && (
                  <button 
                    onClick={() => setActiveTab('accounts_management')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'accounts_management' ? 'bg-amber-500 text-blue-950 shadow-md font-black' : 'bg-gradient-to-r from-teal-500/10 to-emerald-500/10 text-emerald-300 hover:from-teal-550/20 hover:to-emerald-550/20 border border-emerald-500/25'}`}
                  >
                    🔐 إدارة الحسابات والسرية
                  </button>
                )}
                {['superadmin', 'super_admin', 'school', 'teacher'].includes(currentUserType) && (
                  <button 
                    onClick={() => setActiveTab('reports')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'reports' ? 'bg-amber-500 text-blue-950 shadow-md font-black' : 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/25 border border-rose-500/25'}`}
                  >
                    📊 مركز التقارير
                  </button>
                )}
              </div>
            )}

            {currentUserType !== 'guest' ? (
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-1.5 pl-3">
                <div className="w-[45px] h-7 rounded-lg bg-indigo-650/45 border border-indigo-400 flex items-center justify-center text-[10px] font-extrabold px-1">
                  {currentUserType === 'super_admin' ? 'المالك' : currentUserType === 'superadmin' ? 'مدير' : currentUserType === 'school' ? 'مدرسة' : currentUserType === 'teacher' ? 'معلم' : 'طالب'}
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold leading-tight max-w-[120px] truncate">{studentName || 'الإدارة الكبرى'}</div>
                  <div className="text-[9px] text-indigo-300">{studentSchool || 'صلاحيات كاملة'}</div>
                </div>
                {currentUserType === 'student' && (
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-1 bg-amber-550 hover:bg-amber-500 text-slate-900 px-2 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer transition-colors active:scale-95 shadow-sm"
                    title="العودة إلى بوابة المنصة"
                  >
                    <Home size={11} className="stroke-[2.5]" />
                    <span>بوابة المنصة 🏠</span>
                  </button>
                )}
                <button 
                  onClick={handleLogout}
                  title="تسجيل الخروج الآمن"
                  className="p-1.5 text-rose-450 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <span className="text-[11px] font-bold text-yellow-300">🎓 سجل دخولك لتفعيل الحزمة الكاملة والدروس الـ١٨</span>
            )}
          </div>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* 🧭 شريط الإبحار والتحكم السريع للكوادر الإدارية والتعليمية */}
      {['superadmin', 'super_admin', 'school', 'teacher'].includes(currentUserType) && (
        <div id="staff-admin-toolbar" className="sticky top-[64px] z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all" dir="rtl">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
            
            {/* جهة اليمين: معلومات ومؤشر الحساب */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              {currentUserType === 'superadmin' && (
                <span className="text-xs font-extrabold text-blue-900 dark:text-blue-300">
                  👑 المدير العام (الأستاذ سياف) | لوحة القيادة العليا
                </span>
              )}
              {currentUserType === 'super_admin' && (
                <span className="text-xs font-extrabold text-purple-900 dark:text-purple-300">
                  👑 المالك العام (Super Admin) | التحكم السيادي للبرنامج
                </span>
              )}
              {currentUserType === 'school' && (
                <span className="text-xs font-extrabold text-emerald-950 dark:text-emerald-300">
                  🏫 منسق مدرسة: <strong className="font-black text-emerald-600">{studentSchool}</strong>
                </span>
              )}
              {currentUserType === 'teacher' && (
                <span className="text-xs font-extrabold text-amber-950 dark:text-amber-300">
                  👨‍🏫 المعلم الموجه: <strong className="font-black text-amber-600">{studentName}</strong>
                </span>
              )}
            </div>

            {/* جهة اليسار: أزرار التحكم والرجوع المخصصة */}
            <div className="flex items-center gap-3">
              {/* زر الرجوع التكيفي - يظهر للمعلمين والمنسقين فقط */}
              {['school', 'teacher'].includes(currentUserType) && (
                <button
                  id="admin-btn-back"
                  onClick={currentUserType === 'school' ? handleSchoolBack : handleTeacherBack}
                  className="flex items-center gap-1.5 px-4.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-800 dark:text-slate-100 font-extrabold rounded-xl border border-slate-200 dark:border-slate-700 transition-all text-xs cursor-pointer active:scale-95 select-none shadow-2xs hover:shadow-xs"
                  title="العودة خطوة للخلف"
                >
                  <span>⬅ رجوع</span>
                </button>
              )}

              {/* زر الصفحة الرئيسية للمنصة - يظهر لجميع الكوادر المذكورة */}
              <button
                id="admin-btn-home"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-750 text-white font-black rounded-xl shadow-xs transition-all text-xs cursor-pointer active:scale-95 select-none border border-indigo-600/30"
                title="تسجيل الخروج والعودة لبوابة المنصة"
              >
                <span>🏠 الصفحة الرئيسية</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* القائمة المحمولة المنسدلة للطلاب على الهواتف */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-indigo-900 text-white px-4 py-3 space-y-2 z-35 relative" dir="rtl">
          {currentUserType !== 'guest' && (
            <div className="flex flex-col gap-1.5">
              {['super_admin', 'superadmin'].includes(currentUserType) && (
                <button 
                  onClick={() => { setActiveTab('super_admin_panel'); setMobileMenuOpen(false); }}
                  className={`text-right px-3 py-2 text-xs font-bold rounded-lg ${activeTab === 'super_admin_panel' ? 'bg-amber-500 text-blue-950 font-black' : 'hover:bg-white/5'}`}
                >
                  👑 لوحة التحكم الكبرى للمالك والمدير
                </button>
              )}
              {currentUserType !== 'school' && (
                <>
                  <button 
                    onClick={() => { setActiveTab('lessons'); setSelectedLessonId(null); setMobileMenuOpen(false); }}
                    className={`text-right px-3 py-2 text-xs font-bold rounded-lg ${activeTab === 'lessons' ? 'bg-amber-500 text-blue-950 font-black' : 'hover:bg-white/5'}`}
                  >
                    📖 الدروس المنهجية الـ١٨
                  </button>
                  <button 
                    onClick={() => { setActiveTab('labs'); setMobileMenuOpen(false); }}
                    className={`text-right px-3 py-2 text-xs font-bold rounded-lg ${activeTab === 'labs' ? 'bg-amber-500 text-blue-950 font-black' : 'hover:bg-white/5'}`}
                  >
                    🧪 المختبرات التفاعلية الستة
                  </button>
                  <button 
                    onClick={() => { setActiveTab('adaptive_quiz'); generateAdaptiveQuiz(); setMobileMenuOpen(false); }}
                    className={`text-right px-3 py-2 text-xs font-bold rounded-lg ${activeTab === 'adaptive_quiz' ? 'bg-amber-500 text-blue-950 font-black' : 'hover:bg-white/5'}`}
                  >
                    🧠 الاختبار التكيفي الذكي
                  </button>
                  <button 
                    onClick={() => { setActiveTab('portfolio'); setMobileMenuOpen(false); }}
                    className={`text-right px-3 py-2 text-xs font-bold rounded-lg ${activeTab === 'portfolio' ? 'bg-amber-500 text-blue-950 font-black' : 'hover:bg-white/5'}`}
                  >
                    🎖️ ملف الإنجاز الشامل
                  </button>
                  <button 
                    onClick={() => { setActiveTab('chatbot'); setMobileMenuOpen(false); }}
                    className={`text-right px-3 py-2 text-xs font-bold rounded-lg ${activeTab === 'chatbot' ? 'bg-amber-500 text-blue-950 font-black' : 'hover:bg-white/5'}`}
                  >
                    💬 المساعد المنهجي سياف AI
                  </button>
                  <button 
                    onClick={() => { setActiveTab('leaderboard'); setMobileMenuOpen(false); }}
                    className={`text-right px-3 py-2 text-xs font-bold rounded-lg ${activeTab === 'leaderboard' ? 'bg-amber-500 text-blue-950 font-black' : 'hover:bg-white/5'}`}
                  >
                    🏆 لوحة الصدارة والشرف
                  </button>
                  <button 
                    onClick={() => { setActiveTab('notifications'); setMobileMenuOpen(false); }}
                    className={`text-right px-3 py-2 text-xs font-bold rounded-lg ${activeTab === 'notifications' ? 'bg-amber-500 text-blue-950 font-black' : 'hover:bg-white/5'}`}
                  >
                    🔔 مركز الإشعارات الذكية
                  </button>
                </>
              )}
              {currentUserType === 'school' && (
                <button 
                  onClick={() => { setActiveTab('leaderboard'); setMobileMenuOpen(false); }}
                  className="text-right px-3 py-2 text-xs font-black rounded-lg bg-emerald-500 text-slate-950 font-black shadow-sm"
                >
                  📊 لوحة تحكم المنسق والتحليلات
                </button>
              )}
               {['superadmin', 'super_admin'].includes(currentUserType) && (
                <button 
                  onClick={() => { setActiveTab('accounts_management'); setMobileMenuOpen(false); }}
                  className={`text-right px-3 py-2 text-xs font-bold rounded-lg ${activeTab === 'accounts_management' ? 'bg-amber-500 text-blue-950 font-black' : 'text-emerald-300 hover:bg-white/5 bg-emerald-500/5 hover:text-white'}`}
                >
                  🔐 إدارة الحسابات والسرية
                </button>
              )}
              {['superadmin', 'super_admin', 'school', 'teacher'].includes(currentUserType) && (
                <button 
                  onClick={() => { setActiveTab('reports'); setMobileMenuOpen(false); }}
                  className={`text-right px-3 py-2 text-xs font-bold rounded-lg ${activeTab === 'reports' ? 'bg-amber-500 text-blue-950 font-black' : 'text-rose-300 hover:bg-white/5 bg-rose-500/5 hover:text-white'}`}
                >
                  📊 مركز التقارير المتكامل
                </button>
              )}
              <div className="border-t border-slate-800 my-1 pt-2 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold">{studentName || 'الإدارة'}</div>
                  <div className="text-[10px] text-slate-400">{studentSchool}</div>
                </div>
                <button 
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }} 
                  className="flex items-center gap-1 bg-amber-500 text-blue-950 hover:bg-amber-450 hover:scale-[1.02] p-2 rounded-xl text-xs font-black cursor-pointer transition-all active:scale-95 shadow-sm"
                >
                  <Home size={12} className="stroke-[2.5]" />
                  <span>بوابة المنصة 🏠</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== محتوى الصفحة الرئيسي ==================== */}
      <main className="max-w-7xl mx-auto px-4 mt-6">

        {/* ==================== بوابات الدخول الأربع (للوافد الجديد) ==================== */}
        {currentUserType === 'guest' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start mt-6 animate-fade-in">
            
            {/* بوابة الطالب اليمني المحورية */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500" />
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <User size={18} />
                </div>
                <h3 className="font-black text-slate-900 text-base">🎓 بوابة دخول الطالب الثانوية العليا</h3>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">
                مرحباً بك يا غالي في حزمة الفيزياء المتكاملة! يرجى إدخال اسمك الحقيقي، واختيار مدرستك وكود التفعيل الخاص بك للدخول إلى ١٠ دروس مع امتحانات وسحب النتائج.
              </p>

              <form onSubmit={handleStudentLogin} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">👤 الاسم الكامل للطالب (رباعي):</label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="مثال: يوسف مأمون بن محمد الشباطي"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none rounded-xl p-3 text-sm text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1 relative">
                    <label className="block text-xs font-bold text-slate-700">🏫 اسم المدرسة:</label>
                    <div className="relative">
                      {schoolLogo ? (
                        <img 
                          src={schoolLogo} 
                          alt="School Logo" 
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg shadow-sm border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">🏫</span>
                      )}
                      <input
                        type="text"
                        required
                        value={schoolInputText}
                        onChange={(e) => {
                          setSchoolInputText(e.target.value);
                          setShowSchoolSuggestions(true);
                        }}
                        onFocus={() => setShowSchoolSuggestions(true)}
                        onBlur={() => {
                          setTimeout(() => setShowSchoolSuggestions(false), 200);
                        }}
                        placeholder="اكتب اسم مدرستك هنا..."
                        className={`w-full bg-slate-50 border ${schoolSearchingError ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'} outline-none rounded-xl py-3 pl-3 ${schoolLogo ? 'pr-11' : 'pr-9'} text-xs text-slate-800 focus:ring-2 focus:bg-white transition-all`}
                      />

                      {isSearchingSchool && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}

                      {!isSearchingSchool && studentSchool && !schoolSearchingError && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 pointer-events-none">
                          ✓ معتمد
                        </div>
                      )}
                    </div>

                    {schoolSearchingError && (
                      <p className="text-[10px] font-bold text-rose-600 mt-1">
                        ⚠️ {schoolSearchingError}
                      </p>
                    )}

                    {showSchoolSuggestions && schoolSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-slate-150 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-slate-50 text-right left-0">
                        {schoolSuggestions.map((sch) => (
                          <button
                            key={sch.id}
                            type="button"
                            onMouseDown={() => selectSchoolSuggestion(sch)}
                            className="w-full px-3 py-2.5 hover:bg-indigo-50/50 text-xs text-slate-700 flex items-center justify-between text-right transition-all group"
                          >
                            <div className="flex items-center gap-2">
                              <img 
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(sch.name)}&backgroundColor=4f46e5,06b6d4,10b981&textColor=ffffff&bold=true`} 
                                alt="logo" 
                                className="w-5 h-5 rounded"
                              />
                              <span className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{sch.name}</span>
                            </div>
                            <span className="text-[9px] bg-slate-100 group-hover:bg-indigo-100 group-hover:text-indigo-600 text-slate-500 px-1.5 py-0.5 rounded transition-colors uppercase font-mono">{sch.plan || 'silver'}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">🏫 الشعبة الدراسية:</label>
                    <select
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none rounded-xl p-3 text-xs text-slate-700"
                    >
                      <option value="">-- اختر الشعبة --</option>
                      <option value="الشعبة أ">الشعبة أ</option>
                      <option value="الشعبة ب">الشعبة ب</option>
                      <option value="الشعبة ج">الشعبة ج</option>
                      <option value="الشعبة د">الشعبة د</option>
                      <option value="شعبة الدمج العام">شعبة الدمج العام</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">🔑 كود التفعيل المستلم:</label>
                    <input
                      type="text"
                      required
                      value={activationCodeInput}
                      onChange={(e) => setActivationCodeInput(e.target.value)}
                      placeholder="SAYYAF_PHYS_XXXX"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none rounded-xl p-3 text-sm font-mono text-center text-indigo-900 font-bold tracking-wider placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-500/10 cursor-pointer active:scale-95 transition-transform"
                >
                  تأكيد التفعيل والدخول الآمن للمقرر 🚀
                </button>
              </form>
            </div>

            {/* بوابات الكوادر والمنسقين والإدارة */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* تم حذف دليل رموز الدخول والتعليمات للتأمين الكلي وحماية المنصة حسب رغبة المالك العام */}

              {/* بوابات المشرفين والمعلمين */}
              <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-lg space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-amber-500" />
                  <h4 className="font-bold text-slate-800 text-sm">🏫 بوابات تسجيل مدارس ومعلمي الجمهورية</h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* المدارس */}
                  <div className="p-4 rounded-2xl bg-slate-50 space-y-2 border border-slate-100 flex flex-col justify-between">
                    <div>
                      <span className="font-extrabold text-indigo-900 block">منسق المدرسة الثانوية</span>
                      <p className="text-[10px] text-slate-500 mb-2">مراجعة كشوفات طلاب مدرستك الثانوية مباشرة وبدقة.</p>
                      <select
                        value={selectedSchoolAdmin}
                        onChange={(e) => setSelectedSchoolAdmin(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs mb-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                      >
                        <option value="">-- اختر المدرسة --</option>
                        {schools.map(sch => (
                          <option key={sch.id} value={sch.name}>{sch.name}</option>
                        ))}
                      </select>
                      <div className="relative">
                        <input
                          type={showSchoolPassword ? "text" : "password"}
                          placeholder="🔑 رمز مرور المنسق..."
                          value={schoolPasswordInput}
                          onChange={(e) => setSchoolPasswordInput(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-indigo-500 outline-none rounded-lg p-2 pl-9 text-xs text-center font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSchoolPassword(!showSchoolPassword)}
                          className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                          title={showSchoolPassword ? "إخفاء رمز المرور" : "إظهار رمز المرور"}
                        >
                          {showSchoolPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAdminLogin('school')}
                      className="w-full py-2 bg-indigo-700 hover:bg-indigo-650 text-white rounded-lg font-bold block text-center mt-2 cursor-pointer transition-colors"
                    >
                      دخول منسق المدرسة
                    </button>
                  </div>

                  {/* المعلم */}
                  <div className="p-4 rounded-2xl bg-amber-50/50 space-y-2 border border-amber-100 flex flex-col justify-between">
                    <div>
                      <span className="font-extrabold text-amber-900 block">👨‍🏫 مجلس التوجيه والمعلمين</span>
                      <p className="text-[10px] text-slate-500 mb-2">معاينة رصد العلامات العامة وتصحيح التخطيط الصفي.</p>
                      <div className="relative">
                        <input
                          type={showTeacherPassword ? "text" : "password"}
                          placeholder="🔑 كلمة مرور المعلم..."
                          value={teacherPasswordInput}
                          onChange={(e) => setTeacherPasswordInput(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-amber-500 outline-none rounded-lg p-2 pl-9 text-xs text-center font-bold mb-1"
                        />
                        <button
                          type="button"
                          onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                          className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                          title={showTeacherPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                        >
                          {showTeacherPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAdminLogin('teacher')}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-505 text-white rounded-lg font-bold cursor-pointer block text-center mt-2 transition-colors"
                    >
                      بوابة المعلم الفورية
                    </button>
                  </div>
                </div>
              </div>

              {/* بوابة الإدارة العليا والمالك للأستاذ سياف الشباطي */}
              <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-xl space-y-3 relative overflow-hidden">
                <div className="absolute -top-10 -left-10 w-24 h-24 bg-indigo-505/10 rounded-full" />
                <div className="flex items-center gap-2">
                  <Settings size={16} className="text-yellow-400" />
                  <h4 className="font-bold text-sm text-yellow-300">⚙️ بوابة الإدارة العليا للاختبارات والمزامنة</h4>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  توليد أكواد الترخيص الأكاديمية وصيانة المدارس ومراجعة التقارير المالية لليمن.
                </p>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <input
                      type={showAdminPassword ? "text" : "password"}
                      placeholder="رمز المرور الكلي للإدارة والمكتب..."
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 pl-9 text-xs text-white outline-none focus:border-yellow-450"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute left-2.5 top-2.5 text-slate-450 hover:text-slate-200 transition-colors"
                      title={showAdminPassword ? "إخفاء رمز المرور" : "إظهار رمز المرور"}
                    >
                      {showAdminPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleAdminLogin('superadmin')}
                    className="p-2 px-4 bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-black rounded-lg text-xs"
                  >
                    دخول المالك الرئيسي
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== الشاشة والواجهات الداخلية للتطبيق النشط ==================== */}
        {currentUserType !== 'guest' && (
          <div className="space-y-6">

            {/* الأقسام لغير المتصفح العادي */}
            {currentUserType !== 'school' && (
              <div className="flex md:hidden bg-white rounded-xl border border-slate-100 p-1 shadow-sm gap-1 overflow-x-auto whitespace-nowrap scrollbar-none text-xs font-bold" dir="rtl">
                <button 
                  onClick={() => { setActiveTab('lessons'); setSelectedLessonId(null); }}
                  className={`px-3.5 py-2 rounded-lg flex-shrink-0 ${activeTab === 'lessons' ? 'bg-indigo-600 text-white' : 'text-slate-650 hover:bg-slate-50'}`}
                >
                  📖 الدروس
                </button>
                <button 
                  onClick={() => setActiveTab('labs')}
                  className={`px-3.5 py-2 rounded-lg flex-shrink-0 ${activeTab === 'labs' ? 'bg-indigo-600 text-white' : 'text-slate-650 hover:bg-slate-50'}`}
                >
                  🧪 المختبرات
                </button>
                <button 
                  onClick={() => { setActiveTab('adaptive_quiz'); generateAdaptiveQuiz(); }}
                  className={`px-3.5 py-2 rounded-lg flex-shrink-0 ${activeTab === 'adaptive_quiz' ? 'bg-indigo-600 text-white' : 'text-slate-650 hover:bg-slate-50'}`}
                >
                  🧠 تكيفي
                </button>
                <button 
                  onClick={() => setActiveTab('portfolio')}
                  className={`px-3.5 py-2 rounded-lg flex-shrink-0 ${activeTab === 'portfolio' ? 'bg-indigo-600 text-white' : 'text-slate-650 hover:bg-slate-50'}`}
                >
                  🎖️ الإنجاز
                </button>
                <button 
                  onClick={() => setActiveTab('chatbot')}
                  className={`px-3.5 py-2 rounded-lg flex-shrink-0 ${activeTab === 'chatbot' ? 'bg-indigo-600 text-white' : 'text-slate-650 hover:bg-slate-50'}`}
                >
                  💬 ذكي AI
                </button>
                <button 
                  onClick={() => setActiveTab('leaderboard')}
                  className={`px-3.5 py-2 rounded-lg flex-shrink-0 ${activeTab === 'leaderboard' ? 'bg-indigo-600 text-white' : 'text-slate-650 hover:bg-slate-50'}`}
                >
                  🏆 الشرف
                </button>
                <button 
                  onClick={() => setActiveTab('notifications')}
                  className={`px-3.5 py-2 rounded-lg flex-shrink-0 ${activeTab === 'notifications' ? 'bg-indigo-600 text-white' : 'text-slate-650 hover:bg-slate-50'}`}
                >
                  🔔 الإشعارات
                </button>
              </div>
            )}

            {/* ==================== شاشة الدرس التفصيلية (الأولوية الأولى) ==================== */}
            {activeTab === 'lessons' && (
              <div className="space-y-6">
                
                {/* 1. مصفوفة الدروس والوحدات (الوضع الرئيسي للبدء) */}
                {selectedLessonId === null ? (
                  <div className="space-y-8 animate-fade-in" dir="rtl">
                    
                    {/* لوحة ترحيبية وإرشادية مميزة لطالب الفيزياء */}
                    <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-800">
                      <div className="absolute top-0 left-0 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl translate-x-12 -translate-y-12" />
                      <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl translate-x-24 translate-y-24" />
                      
                      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-3 text-right">
                          <div className="inline-flex items-center gap-1.5 bg-yellow-400/20 text-yellow-300 text-xs px-3 py-1 rounded-full font-bold">
                            <Sparkles size={12} />
                            <span>نظام محاكاة معزز بالكامل وملخصات علمية</span>
                          </div>
                          <h3 className="text-xl md:text-2xl font-black leading-tight">مصفوفة الفيزياء الوطنية في جيبك 🇾🇪</h3>
                          <p className="text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
                            يا أهلاً بك يا بطل! اختر الدرس المطلوب لتدخل بيئة الدراسة المتكاملة حيث يمكنك مطالعة الشرح المنهجي، ودمج تجارب المختبر الافتراضي، واختبار فهمك فوراً.
                          </p>
                          {currentUserType === 'student' && (
                            <div className="pt-2">
                              <button 
                                onClick={handleLogout}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-blue-950 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 text-right w-full sm:w-auto justify-center"
                              >
                                <Home size={14} className="stroke-[2.5]" />
                                <span>العودة إلى بوابة المنصة 🏠</span>
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-4">
                          <div className="p-4 bg-white/10 rounded-2xl text-center border border-white/10 min-w-[100px]">
                            <span className="block text-xl font-bold text-yellow-300">١٨</span>
                            <span className="text-[10px] text-slate-300 font-bold">درساً معتمداً</span>
                          </div>
                          <div className="p-4 bg-white/10 rounded-2xl text-center border border-white/10 min-w-[100px]">
                            <span className="block text-xl font-bold text-teal-300">٦</span>
                            <span className="text-[10px] text-slate-300 font-bold">مختبرات تفاعلية</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* محرك بحث وتصفية للوصول السريع للمصفوفة */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                      <div className="relative w-full md:w-96">
                        <Search className="absolute right-3.5 top-3.5 text-slate-400" size={16} />
                        <input
                          type="text"
                          placeholder="ابحث بمحتوى أو عنوان للوصول السريع..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white transition-colors outline-none rounded-xl pr-10 pl-4 py-3 text-xs text-slate-700 font-medium placeholder:text-slate-400"
                        />
                      </div>
                      <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1" dir="rtl">
                        {[
                          { id: 'all', label: 'كافة الوحدات' },
                          { id: 'unit1', label: 'وحدة ١: أساسيات' },
                          { id: 'unit2', label: 'وحدة ٢: حركة خطية' },
                          { id: 'unit3', label: 'وحدة ٣: خواص الموائع الساكنة' },
                          { id: 'unit4', label: 'وحدة ٤: شغل وطاقة وموجات' }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setSelectedUnit(tab.id)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                              selectedUnit === tab.id 
                                ? 'bg-indigo-650 text-white shadow shadow-indigo-500/10' 
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* مصفوفة الكروت والوحدات كلياً */}
                    <div className="flex flex-col gap-4 w-full">
                      {[
                        { 
                          id: 'unit1', 
                          title: 'الوحدة الأولى: أساسيات علم الفيزياء وتطبيقاتها', 
                          color: 'from-blue-600 to-indigo-700', 
                          borderColor: 'border-blue-100',
                          bgCol: 'bg-blue-50/10'
                        },
                        { 
                          id: 'unit2', 
                          title: 'الوحدة الثانية: الحركة في خط مستقيم والسرعات', 
                          color: 'from-cyan-600 to-sky-700', 
                          borderColor: 'border-cyan-100',
                          bgCol: 'bg-cyan-50/10'
                        },
                        { 
                          id: 'unit3', 
                          title: 'الوحدة الثالثة: خواص الموائع الساكنة', 
                          color: 'from-rose-600 to-amber-700', 
                          borderColor: 'border-rose-100',
                          bgCol: 'bg-rose-50/10'
                        },
                        { 
                          id: 'unit4', 
                          title: 'الوحدة الرابعة: الشغل، الطاقة الميكانيكية والموجات', 
                          color: 'from-emerald-600 to-teal-700', 
                          borderColor: 'border-emerald-100',
                          bgCol: 'bg-emerald-50/10'
                        }
                      ].filter(u => selectedUnit === 'all' || u.id === selectedUnit).map(unitObj => {
                        const unitLessons = lessonsList.filter(l => l.unit === unitObj.id && (
                          l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.accordionData.some(a => a.title.includes(searchTerm) || a.content.includes(searchTerm))
                        ));

                        if (unitLessons.length === 0) return null;

                        const isOpen = expandedUnitId === unitObj.id;

                        return (
                          <div 
                            key={unitObj.id} 
                            className={`bg-white rounded-3xl border ${unitObj.borderColor} overflow-hidden shadow-xs transition-all duration-300 w-full ${isOpen ? 'ring-2 ring-indigo-500/10 shadow-md translate-y-[-2px]' : 'hover:shadow-sm'}`}
                          >
                            {/* زر الأكورديون (رأس الوحدة المنسدلة) */}
                            <button
                              onClick={() => setExpandedUnitId(isOpen ? null : unitObj.id)}
                              className="w-full text-right p-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none transition-colors hover:bg-slate-50/50"
                            >
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                {/* رقم الوحدة داخل شارة ملونة واضحة */}
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${unitObj.color} text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm`}>
                                  {unitObj.id === 'unit1' ? '١' : unitObj.id === 'unit2' ? '٢' : unitObj.id === 'unit3' ? '٣' : '٤'}
                                </div>
                                
                                {/* اسم الوحدة بخط عريض وعدد الدروس */}
                                <div className="space-y-1 text-right flex-1 min-w-0">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">مقرر الفيزياء الحكومي للجمهورية</span>
                                  <h4 className="font-extrabold text-slate-900 text-sm md:text-base leading-tight">
                                    {unitObj.title}
                                  </h4>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 shrink-0">
                                {/* عداد الدروس بجانب اسم الوحدة */}
                                <span className="bg-slate-100 text-slate-600 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                                  ({unitLessons.length} دروس)
                                </span>
                                
                                {/* سهم يتغير عند فتح الغلق */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                                  {isOpen ? <ChevronUp size={16} className="stroke-[3]" /> : <ChevronDown size={16} className="stroke-[3]" />}
                                </div>
                              </div>
                            </button>

                            {/* قائمة الدروس المنسدلة مع حركة فتح وسلسة */}
                            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                              <div className="overflow-hidden">
                                <div className="p-5 pt-0 border-t border-slate-100 bg-slate-50/[0.1] space-y-3">
                                  <div className="grid grid-cols-1 gap-3 mt-4">
                                    {unitLessons.map((l) => {
                                      const hasCustomLab = [
                                        "lesson_2_measurement", "lesson_3_quantities", "lesson_4_conversions",
                                        "lesson_5_dimensional", "lesson_6_vectors_lab", "lesson_7_displacement",
                                        "lesson_8_speed", "lesson_9_acceleration", "lesson_10_kinematics",
                                        "lesson_11_projectiles", "lesson_12_circular", "lesson_13_newton_laws",
                                        "lesson_14_gravity", "lesson_15_work", "lesson_15_hookes_law", "lesson_16_energy",
                                        "lesson_16_elasticity", "lesson_17_capillary", "lesson_18_pressure", "lesson_17_waves", "lesson_18_sound",
                                        "lesson_19_buoyancy"
                                      ].includes(l.id);

                                      const labName = 
                                        l.id === "lesson_2_measurement" || l.id === "lesson_4_conversions" || l.id === "lesson_5_dimensional" ? "مختبر أجهزة القياس" :
                                        l.id === "lesson_3_quantities" ? "تحدي تصنيف الكميات" :
                                        ["lesson_6_vectors_lab", "lesson_7_displacement", "lesson_8_speed", "lesson_9_acceleration", "lesson_10_kinematics"].includes(l.id) ? "مختبر المسافة والإزاحة" :
                                        l.id === "lesson_11_projectiles" ? "مختبر المقذوفات في بعدين" :
                                        ["lesson_12_circular", "lesson_13_newton_laws", "lesson_14_gravity"].includes(l.id) ? "مختبر الجاذبية الكونية" : 
                                        l.id === "lesson_15_hookes_law" ? "مختبر قانون هوك والزنبرك" : 
                                        l.id === "lesson_16_elasticity" ? "مختبر خواص ميكانيكا المرونة" : 
                                        l.id === "lesson_17_capillary" ? "مختبر الخاصية الشعرية" : 
                                        l.id === "lesson_18_pressure" ? "مختبر ضغط السوائل والبارومترات" : 
                                        l.id === "lesson_19_buoyancy" ? "مختبر دفع السوائل وقانون أرخميدس" : "مختبر حفظ الطاقة والحركة";

                                      return (
                                        <div
                                          key={l.id}
                                          className="w-full text-right p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-150 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 group"
                                        >
                                          <div className="space-y-1 flex-1 text-right min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                              <span className="text-[10px] text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md font-bold block">الدرس {l.order}:</span>
                                              
                                              {/* ترويسة المعمل المدمج */}
                                              {hasCustomLab && (
                                                <span className="inline-flex items-center gap-1 text-[9px] text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md font-bold shadow-xs">
                                                  <Beaker size={10} className="stroke-[2.5]" />
                                                  <span>مختبر مدمج: {labName}</span>
                                                </span>
                                              )}
                                            </div>
                                            
                                            <h5 className="font-bold text-slate-800 text-xs md:text-sm leading-normal group-hover:text-indigo-950 transition-colors">
                                              {l.title.split(': ')[1] || l.title}
                                            </h5>
                                          </div>
                                          
                                          {/* زر الدخول إلى الدرس */}
                                          <button
                                            onClick={() => {
                                              setSelectedLessonId(l.id);
                                              setLessonSubTab('content');
                                              setQuizAnswers({});
                                              setQuizSubmitted(false);
                                            }}
                                            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 self-end sm:self-center"
                                          >
                                            <span>الدخول إلى الدرس</span>
                                            <BookOpen size={11} className="#stroke-[2.5]" />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                ) : (
                  
                  // 2. بيئة عمل الشرح المنهجي والمختبر والامتحان معاً (عند الدخول لدرس معين)
                  <div className="space-y-6" dir="rtl">
                    
                    {/* شريط الإجراءات والتحويل العلوي المدمج */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                      
                      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        <button
                          onClick={() => setSelectedLessonId(null)}
                          className="w-full sm:w-auto px-4 py-2.5 hover:bg-rose-50 text-rose-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-rose-50/50 border border-rose-100 active:scale-95 animate-fade-in"
                        >
                          <span>◀ العودة لمصفوفة الوحدات والدروس الكبرى</span>
                        </button>
                        {currentUserType === 'student' && (
                          <button
                            onClick={handleLogout}
                            className="w-full sm:w-auto px-4 py-2.5 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-slate-50 border border-slate-200 active:scale-95 animate-fade-in"
                          >
                            <Home size={13} className="text-slate-500 stroke-[2.5]" />
                            <span>بوابة المنصة 🏠</span>
                          </button>
                        )}
                      </div>

                      {/* التبويبات الثلاثة التفاعلية الفخمة */}
                      <div className="flex bg-slate-50 border border-slate-200 rounded-2xl p-1 gap-1 text-center font-bold text-xs w-full md:w-auto" dir="rtl">
                        <button
                          onClick={() => setLessonSubTab('content')}
                          className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                            lessonSubTab === 'content' 
                              ? 'bg-indigo-700 text-white shadow-md font-black' 
                              : 'text-slate-600 hover:bg-slate-150'
                          }`}
                        >
                          📖 الشرح والبيان
                        </button>
                        <button
                          onClick={() => setLessonSubTab('lab')}
                          className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            lessonSubTab === 'lab' 
                              ? 'bg-indigo-700 text-white shadow-md font-black' 
                              : 'text-slate-600 hover:bg-slate-150'
                          }`}
                        >
                          <Beaker size={13} className="stroke-[2.5]" />
                          <span>🔬 المختبر الفيزيائي</span>
                        </button>
                        <button
                          onClick={() => setLessonSubTab('quiz')}
                          className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                            lessonSubTab === 'quiz' 
                              ? 'bg-indigo-700 text-white shadow-md font-black' 
                              : 'text-slate-600 hover:bg-slate-150'
                          }`}
                        >
                          ✍️ اختبار الفهم
                        </button>
                      </div>

                    </div>

                    {/* لوحة العرض النشطة تتبع الفرع المحدد */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
                      
                      <div className="border-b border-indigo-100 pb-4 text-right">
                        <span className="text-[10px] font-black tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full uppercase">
                          {selectedLesson.unitTitle} – الفئة {selectedLesson.order}
                        </span>
                        <h2 className="text-base md:text-lg font-black text-slate-900 mt-2">
                          {selectedLesson.title}
                        </h2>
                      </div>

                      {/* التبويب الأول: الشرح والبيان */}
                      {lessonSubTab === 'content' && (
                        <div className="space-y-6 text-right">
                          <div className="space-y-3">
                            <h4 className="font-extrabold text-xs text-slate-500">📖 الأقسام والمطالعات المنهجية المعتمدة للدرس:</h4>
                            {selectedLesson.accordionData.map((data, index) => (
                              <div key={index} className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                                <button
                                  onClick={() => toggleAccordion(data.title)}
                                  className="w-full text-right p-4 bg-slate-50/50 hover:bg-slate-50 font-bold text-slate-800 text-sm flex items-center justify-between"
                                >
                                  <span>{data.title}</span>
                                  {openAccordions[data.title] ? <ChevronUp size={16} className="text-indigo-600" /> : <ChevronDown size={16} className="text-slate-400" />}
                                </button>
                                {openAccordions[data.title] && (
                                  <div 
                                    className="p-4 bg-white text-xs text-slate-650 leading-relaxed border-t border-slate-100 whitespace-pre-line font-medium select-text"
                                    dangerouslySetInnerHTML={{ __html: data.content }}
                                  />
                                )}
                              </div>
                            ))}
                          </div>

                          {/* الوقفات والتدبرات الإيمانية لربط العلم بالإيمان لطلاب الثانوي اليمنيين */}
                          {selectedLesson.islamicReflections && selectedLesson.islamicReflections.length > 0 && (
                            <div className="bg-gradient-to-r from-teal-50 to-emerald-50/30 border border-teal-100 p-5 rounded-2xl space-y-3 shadow-inner">
                              <h5 className="font-extrabold text-teal-900 text-xs flex items-center gap-1.5">
                                <Sparkles size={14} className="text-teal-600 animate-pulse" />
                                <span>وقفة تفكر إيمانية بكون الله وحفْظِ موازينه:</span>
                              </h5>
                              {selectedLesson.islamicReflections.map((refStr, idx) => (
                                <p key={idx} className="text-xs text-teal-850 italic leading-relaxed">
                                  {refStr}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* التبويب الثاني: المختبر الفيزيائي التفاعلي المدمج مباشرة بالدرس */}
                      {lessonSubTab === 'lab' && (
                        <div className="space-y-6">
                          <div className="bg-teal-50 border border-teal-100 p-4 rounded-2xl flex items-center justify-between gap-4 text-right">
                            <div>
                              <h4 className="font-extrabold text-teal-900 text-xs flex items-center gap-1.5">
                                <Beaker size={14} className="text-teal-700 stroke-[2.5]" />
                                <span>المختبر الفيزيائي التفاعلي المساعد</span>
                              </h4>
                              <p className="text-[10px] text-teal-650 mt-1 font-semibold">بإمكانك الاختيار بين نموذج المحاكاة المحلي الخفيف لإجراء الحسابات السريعة، أو المحاكاة المعملية الفاخرة من PhET.</p>
                            </div>
                            <span className="hidden sm:inline bg-teal-100 text-teal-800 text-[9px] font-bold px-2 py-0.5 rounded-full">
                              مزامنة مع الكراس المفتوح
                            </span>
                          </div>

                          {/* مفتاح وضع المختبر الذكي */}
                          <div className="flex bg-slate-100/80 p-1 rounded-2xl gap-1.5 font-bold text-xs max-w-sm mx-auto justify-center border border-slate-200/60 shadow-inner" dir="rtl">
                            <button
                              onClick={() => setLabMode('local')}
                              className={`flex-1 py-2 px-3.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                labMode === 'local'
                                  ? 'bg-teal-700 text-white shadow font-black'
                                  : 'text-slate-600 hover:bg-slate-200/80'
                              }`}
                            >
                              <span>📱 المعمل المحلي السريع</span>
                            </button>
                            <button
                              onClick={() => setLabMode('phet')}
                              className={`flex-1 py-2 px-3.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                labMode === 'phet'
                                  ? 'bg-indigo-700 text-white shadow font-black'
                                  : 'text-slate-600 hover:bg-slate-200/80'
                              }`}
                            >
                              <span>🌐 معمل PhET العالمي</span>
                            </button>
                          </div>

                          {/* جلب واستدعاء مختبر الدرس حسب الاختيار النشط */}
                          {labMode === 'phet' ? (
                            <PhetSimulator lessonId={selectedLesson.id} />
                          ) : (
                            <div className="border border-slate-100 rounded-3xl p-1 bg-slate-50 shadow-inner">
                              {(() => {
                                const lessonId = selectedLesson.id;
                                if (lessonId === "lesson_2_measurement") {
                                  return <MeasurementLab />;
                                } else if (lessonId === "lesson_4_conversions") {
                                  return <ConversionLab onComplete={handleLabComplete} />;
                                } else if (lessonId === "lesson_5_dimensional") {
                                  return <DimensionalAnalysisLab onComplete={handleLabComplete} />;
                                } else if (lessonId === "lesson_3_quantities") {
                                  return <QuantityClassifier />;
                                } else if (lessonId === "lesson_6_vectors_lab") {
                                  return <VectorsLab onComplete={handleLabComplete} />;
                                } else if (lessonId === "lesson_8_speed") {
                                  return <SpeedLab onComplete={handleLabComplete} />;
                                } else if (lessonId === "lesson_9_acceleration") {
                                  return <AccelerationLab onComplete={handleLabComplete} />;
                                } else if (lessonId === "lesson_10_kinematics") {
                                  return <KinematicsLab onComplete={handleLabComplete} />;
                                } else if (lessonId === "lesson_11_freefall") {
                                  return <FreeFallLab onComplete={handleLabComplete} />;
                                } else if (lessonId === "lesson_12_newton") {
                                  return <NewtonLawsLab onComplete={handleLabComplete} />;
                                } else if (lessonId === "lesson_13_friction") {
                                  return <FrictionLab onComplete={handleLabComplete} />;
                                } else if (lessonId === "lesson_14_kinetic") {
                                  return <KineticMolecularTheoryLab onComplete={handleLabComplete} />;
                                } else if (lessonId === "lesson_15_hookes_law") {
                                  return <HookesLawLab onComplete={handleLabComplete} />;
                                } else if (lessonId === "lesson_16_elasticity") {
                                  return <ElasticityLab onComplete={handleLabComplete} />;
                                } else if (lessonId === "lesson_17_capillary") {
                                  return <CapillaryLab onComplete={handleLabComplete} />;
                                } else if (lessonId === "lesson_18_pressure") {
                                  return <PressureLab onComplete={handleLabComplete} />;
                                } else if (lessonId === "lesson_19_buoyancy") {
                                  return <BuoyancyLab onComplete={handleLabComplete} />;
                                } else if (
                                  lessonId === "lesson_7_displacement"
                                ) {
                                  return <DisplacementCarLab />;
                                } else if (lessonId === "lesson_11_projectiles") {
                                  return <ProjectileLab />;
                                } else if (lessonId === "lesson_12_circular" || lessonId === "lesson_13_newton_laws" || lessonId === "lesson_14_gravity") {
                                  return <GravityLawLab />;
                                } else {
                                  return <EnergyConservationLab />;
                                }
                              })()}
                            </div>
                          )}
                        </div>
                      )}

                      {/* التبويب الثالث: الامتحان الفوري والاختبار المنهجي الذكي */}
                      {lessonSubTab === 'quiz' && (
                        <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-150 pb-3 text-right">
                            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                              <Award size={15} className="text-amber-500" />
                              <span>امتحان فوري لقياس الفهم وتقييد التراكم العلمي بالرصد:</span>
                            </h4>
                            <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">
                              النتيجة ترسل للوحة الشرف التنافسية فوراً
                            </span>
                          </div>

                          <div className="space-y-4 text-right">
                            {selectedLesson.questions.map((q, idx) => (
                              <div key={q.id} className="p-4 bg-white rounded-2xl border border-slate-100 space-y-2">
                                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50/65 px-2.5 py-0.5 rounded-md">السؤال {idx + 1}</span>
                                <p className="text-xs font-bold text-slate-800 leading-relaxed">{q.text}</p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                                  {q.type === 'tf' ? (
                                    <>
                                      {[
                                        { val: 'true', label: '✅ صحيح / نعم' },
                                        { val: 'false', label: '❌ خاطئ / لا' }
                                      ].map(opt => (
                                        <button
                                          key={opt.val}
                                          onClick={() => handleAnswerSelect(q.id, opt.val)}
                                          disabled={quizSubmitted}
                                          className={`p-2.5 rounded-xl border text-right font-bold transition-all cursor-pointer ${
                                            quizAnswers[q.id] === opt.val
                                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                                          }`}
                                        >
                                          {opt.label}
                                        </button>
                                      ))}
                                    </>
                                  ) : (
                                    <>
                                      {q.options?.map(opt => (
                                        <button
                                          key={opt}
                                          onClick={() => handleAnswerSelect(q.id, opt)}
                                          disabled={quizSubmitted}
                                          className={`p-2.5 rounded-xl border text-right font-semibold transition-all cursor-pointer ${
                                            quizAnswers[q.id] === opt
                                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                                          }`}
                                        >
                                          {opt}
                                        </button>
                                      ))}
                                    </>
                                  )}
                                </div>

                                {quizSubmitted && (
                                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-[11px]">
                                    {quizAnswers[q.id] === q.correct ? (
                                      <span className="text-emerald-700 font-bold block">🎉 إجابة متميزة وصحيحة!</span>
                                    ) : (
                                      <span className="text-rose-700 font-bold block">❌ الإجابة المحددة خاطئة. الإجابة الصحيحة هي: <strong className="font-extrabold">{q.correct}</strong></span>
                                    )}
                                    <p className="text-slate-500 mt-1 italic font-semibold bg-slate-50/50 p-2 rounded-lg leading-relaxed">{q.explain}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {!quizSubmitted ? (
                            <button
                              onClick={() => handleQuizSubmit(selectedLesson.id)}
                              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-sm rounded-xl transition-all cursor-pointer active:scale-95"
                            >
                              احسب درجتي وارسل تقرير النتيجة للوحة الشرف التنافسية 🏆
                            </button>
                          ) : (
                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-center space-y-2">
                              <span className="text-xs text-indigo-800 font-bold">علامتك النهائية بالامتحان:</span>
                              <div className="text-2xl font-black text-indigo-900 leading-none font-mono">
                                {quizScore} / {selectedLesson.questions.length} ({Math.round((quizScore / selectedLesson.questions.length) * 100)}%)
                              </div>
                              <button
                                onClick={() => {
                                  setQuizAnswers({});
                                  setQuizSubmitted(false);
                                }}
                                className="py-1.5 px-4 bg-white border border-indigo-200 text-indigo-900 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                              >
                                إعادة المحاولة لتحسين الدرجة
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                    </div>

                  </div>
                )}

              </div>
            )}

            {/* ==================== شاشة المختبرات التفاعلية الستة ==================== */}
            {activeTab === 'labs' && (
              <div className="space-y-6">
                <div className="border bg-white rounded-2xl p-5 border-slate-100 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">🧪 المختبرات التفاعلية المعيارية</h3>
                    <p className="text-xs text-slate-450 mt-1">طاقم محاكاة متطور لإجراء التجارب وقياس التغيرات والتحفيز الفيزيائي فوراً.</p>
                  </div>
                  <div className="bg-amber-50 text-amber-900 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-200 animate-pulse">
                    مختبرات ممتازة ومطابقة للمناهج
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                  {/* ١. أجهزة القياس */}
                  <MeasurementLab />

                  {/* ٢. تصنيف الكميات */}
                  <QuantityClassifier />

                  {/* ٣. الحركة والإزاحة */}
                  <DisplacementCarLab />

                  {/* ٤. حركة المقذوفات */}
                  <ProjectileLab />

                  {/* ٥. طاقة السقوط وحفظ الطاقة */}
                  <EnergyConservationLab />

                  {/* ٦. الجذب الكوني لنيوتن */}
                  <GravityLawLab />
                </div>
              </div>
            )}

            {/* ==================== 1. واجهة المساعد الفيزيائي المنهجي سياف AI ==================== */}
            {activeTab === 'chatbot' && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-6 space-y-6 animate-fade-in" dir="rtl">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-blue-950 shadow-md shrink-0">
                      <Sparkles size={22} className="animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">💬 المساعد الفيزيائي المنهجي الذكي</h2>
                      <p className="text-xs text-slate-500 mt-0.5">تمت تهيئته بدقة للتوافق مع منهج الثانوية العامة وتوجيهات الأستاذ سياف الشباطي</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start md:self-auto text-[11px] sm:text-xs bg-amber-50 text-amber-850 px-3 py-1.5 rounded-xl font-bold">
                    <span>💡 يستند للبعد الإيماني والفيزياء الكونية</span>
                  </div>
                </div>

                {/* لوحة المحادثة التفاعلية */}
                <div className="border border-slate-100 rounded-2xl bg-slate-50/50 p-3 sm:p-4 h-[400px] sm:h-[450px] overflow-y-auto flex flex-col gap-4 scrollbar-thin">
                  {chatMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex w-full ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div 
                        className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed transition-all duration-300 shadow-xs ${
                          msg.role === 'user' 
                            ? 'bg-indigo-650 text-white rounded-tr-none font-medium text-right' 
                            : 'bg-white text-slate-800 rounded-tl-none border border-slate-100 text-right'
                        }`}
                      >
                        <div className="font-extrabold mb-1.5 opacity-80 text-[10px] sm:text-xs">
                          {msg.role === 'user' ? '💭 استفسارك الفيزيائي' : '🎓 إجابة المساعد الذكي'}
                        </div>
                        <div className="whitespace-pre-line text-xs sm:text-sm font-medium">
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex w-full justify-end">
                      <div className="bg-white text-slate-850 rounded-2xl rounded-tl-none border border-slate-100 shadow-xs max-w-[85%] p-4 flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span className="text-[10px] sm:text-xs text-slate-450 font-bold">المساعد يفكر ويعد الصياغة المنهجية...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* الأزرار الكبسة الفورية لبدء نقاش فيزيائي */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-extrabold block">📌 استفسارات فيزيائية مرجعية فائقة الأهمية:</span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button 
                      onClick={() => handleChatSend("شرح مفهوم القصور الذاتي الفيزيائي في نقاط مبسطة")}
                      disabled={chatLoading}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50 text-right"
                    >
                      💡 شرح القصور الذاتي
                    </button>
                    <button 
                      onClick={() => handleChatSend("حل مسألة: تحركت مركبة من السكون بعجلة منتظمة قدرها 4m/s² لمدة 6 ثوانٍ، احسب سرعتها النهائية والمسافة المقطوعة.")}
                      disabled={chatLoading}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50 text-right"
                    >
                      ✏️ حل مسألة حركة بتسارع
                    </button>
                    <button 
                      onClick={() => handleChatSend("اقترح تجربة علمية منزلية بسيطة وآمنة توضح تداخل الموجات أو الطاقة الكامنة")}
                      disabled={chatLoading}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50 text-right"
                    >
                      🧪 تجربة فيزيائية منزلية
                    </button>
                    <button 
                      onClick={() => handleChatSend("ما الحكمة العقدية والبعد الإيماني وراء مرونة قوانين حفظ الطاقة الميكانيكية بالكون؟")}
                      disabled={chatLoading}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/50 font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50 text-right"
                    >
                      🌌 التأمل العقدي الإيماني
                    </button>
                  </div>
                </div>

                {/* حقل الإدخال والإرسال */}
                <div className="flex flex-col sm:flex-row gap-2.5 mt-2">
                  <input 
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleChatSend(); }}
                    placeholder="اكتب استفسارك الرياضي أو الفيزيائي هنا (مثال: اشرح لي السقوط الحر)..."
                    disabled={chatLoading}
                    className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white p-3 rounded-xl outline-none text-xs sm:text-sm text-slate-800 text-right dir-rtl"
                  />
                  <button 
                    onClick={() => handleChatSend()}
                    disabled={chatLoading || !chatInput.trim()}
                    className="px-5 sm:px-6 py-2.5 sm:py-3 bg-indigo-700 hover:bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all text-xs sm:text-sm cursor-pointer shadow-md disabled:opacity-50 w-full sm:w-auto shrink-0"
                  >
                    <span>إرسال</span>
                    <Send size={14} className="rtl:rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* ==================== 2. واجهة الاختبار التكيفي التفاعلي ==================== */}
            {activeTab === 'adaptive_quiz' && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6 animate-fade-in" dir="rtl">
                
                {/* 2.1 شاشة إعداد وتجهيز الامتحان */}
                {!adaptiveSubmitted && adaptiveQuestions.length === 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                        <Cpu size={22} className="animate-spin" style={{ animationDuration: '4s' }} />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-slate-900">🧠 اختبار الرصد والمواءمة التكيفي</h2>
                        <p className="text-xs text-slate-500">يقيس محرك التكيف مستواك العلمي من الـ 18 درساً، وينتج لك اختباراً مخصصاً لرفع مستواك تلقائياً!</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* الصعوبة التكيفية */}
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
                        <span className="font-extrabold text-xs text-slate-800 block">🎯 حدد مستوى الصعوبة التكليفية المستهدفة:</span>
                        <div className="grid grid-cols-3 gap-2">
                          <button 
                            onClick={() => setAdaptiveDifficulty('easy')}
                            className={`py-3.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              adaptiveDifficulty === 'easy' 
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            🟢 سهل (مفاهيم)
                          </button>
                          <button 
                            onClick={() => setAdaptiveDifficulty('medium')}
                            className={`py-3.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              adaptiveDifficulty === 'medium' 
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-800 shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            🔵 متوسط (قياسي)
                          </button>
                          <button 
                            onClick={() => setAdaptiveDifficulty('hard')}
                            className={`py-3.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              adaptiveDifficulty === 'hard' 
                                ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            🔴 صعب (مسائل)
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                          {adaptiveDifficulty === 'easy' && 'يقوم بفلترة وتدشين أسئلة الصح والخطأ التي تختبر التعاريف الأساسية والرموز الأولية.'}
                          {adaptiveDifficulty === 'medium' && 'يقوم باستخراج أسئلة الاختيار الأكاديمية العادية لتغطية شاملة لعلاقات الحركة والطاقة.'}
                          {adaptiveDifficulty === 'hard' && 'مرتفع الأهمية! يعزل ويجمع كافة المسائل الحسابية والقوانين الرياضية لرفع طاقة الكفاءة والذكاء الاستباقي.'}
                        </p>
                      </div>

                      {/* عدد الأسئلة المطلوبة */}
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
                        <span className="font-extrabold text-xs text-slate-800 block">📊 حدد عدد الأسئلة المطلوبة بالاختبار:</span>
                        <div className="grid grid-cols-3 gap-2">
                          {[3, 5, 10].map(cnt => (
                            <button 
                              key={cnt}
                              onClick={() => setAdaptiveCount(cnt)}
                              className={`py-3.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                                adaptiveCount === cnt 
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {cnt} أسئلة
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                          نوصي باختيار 5 أسئلة في المرة الواحدة لضمان أقصى درجات التركيز الذهني والتحليل التربوي الدقيق.
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={generateAdaptiveQuiz}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-transform hover:scale-[1.01]"
                    >
                      ⚡ توليد وبدء الاختبار المخصص الآن
                    </button>
                  </div>
                )}

                {/* 2.2 شاشة الأسئلة النشطة والحل الفعلي */}
                {!adaptiveSubmitted && adaptiveQuestions.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <span className="font-extrabold text-[11px] text-indigo-850 bg-indigo-50 px-3 py-1 rounded-full">
                        🧩 التحدي التكيفي: {adaptiveDifficulty === 'easy' ? 'سهل' : adaptiveDifficulty === 'medium' ? 'متوسط' : 'صعب'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold font-mono">
                        سؤال {adaptiveCurrentIndex + 1} من أصل {adaptiveQuestions.length}
                      </span>
                    </div>

                    {/* نص السؤال */}
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 font-bold text-sm leading-relaxed">
                      {adaptiveQuestions[adaptiveCurrentIndex].text}
                    </div>

                    {/* الخيارات كبلاطات تفاعلية */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {adaptiveQuestions[adaptiveCurrentIndex].type === 'tf' ? (
                        ['صح', 'خطأ'].map((opt) => (
                          <button 
                            key={opt}
                            onClick={() => handleAdaptiveAnswerSelect(adaptiveQuestions[adaptiveCurrentIndex].id, opt)}
                            className={`p-4 rounded-xl text-right text-xs font-bold border transition-all cursor-pointer flex justify-between items-center ${
                              adaptiveAnswers[adaptiveQuestions[adaptiveCurrentIndex].id] === opt 
                                ? 'bg-indigo-600 border-indigo-650 text-white shadow-md font-black' 
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{opt}</span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              adaptiveAnswers[adaptiveQuestions[adaptiveCurrentIndex].id] === opt 
                                ? 'border-white bg-white/20' 
                                : 'border-slate-300 bg-transparent'
                            }`}>
                              {adaptiveAnswers[adaptiveQuestions[adaptiveCurrentIndex].id] === opt && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </button>
                        ))
                      ) : (
                        adaptiveQuestions[adaptiveCurrentIndex].options?.map((opt) => (
                          <button 
                            key={opt}
                            onClick={() => handleAdaptiveAnswerSelect(adaptiveQuestions[adaptiveCurrentIndex].id, opt)}
                            className={`p-4 rounded-xl text-right text-xs font-semibold border transition-all cursor-pointer flex justify-between items-center ${
                              adaptiveAnswers[adaptiveQuestions[adaptiveCurrentIndex].id] === opt 
                                ? 'bg-indigo-650 border-indigo-700 text-white shadow-md font-extrabold' 
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{opt}</span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              adaptiveAnswers[adaptiveQuestions[adaptiveCurrentIndex].id] === opt 
                                ? 'border-white bg-white/20' 
                                : 'border-slate-300 bg-transparent'
                            }`}>
                              {adaptiveAnswers[adaptiveQuestions[adaptiveCurrentIndex].id] === opt && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </button>
                        ))
                      )}
                    </div>

                    {/* أدوات التحكم */}
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                      <button 
                        disabled={adaptiveCurrentIndex === 0}
                        onClick={() => setAdaptiveCurrentIndex(prev => prev - 1)}
                        className="px-5 py-2 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
                      >
                        السابق
                      </button>
                      
                      {adaptiveCurrentIndex < adaptiveQuestions.length - 1 ? (
                        <button 
                          onClick={() => setAdaptiveCurrentIndex(prev => prev + 1)}
                          className="px-5 py-2 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                        >
                          التالي
                        </button>
                      ) : (
                        <button 
                          onClick={handleAdaptiveQuizSubmit}
                          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-md"
                        >
                          🚀 تسليم الإجابات وتقييم الأداء العلمي
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 2.3 شاشة النتيجة والتغذية الراجعة التكيفية */}
                {adaptiveSubmitted && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-center space-y-4">
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <Trophy size={32} />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-800">الحمد لله! لقد أنهيت الاختبار التكيفي بنجاح</h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">تم رصد أدائك في لوحة صدارة المنصة بنجاح لمضاهاة تفوق الزملاء.</p>
                      </div>

                      <div className="flex justify-center gap-8 items-center py-2 max-w-sm mx-auto">
                        <div className="text-center">
                          <span className="text-2xl font-black font-mono text-indigo-900 block">{adaptiveScore} / {adaptiveQuestions.length}</span>
                          <span className="text-[10px] text-slate-400 font-bold block">الدرجة النهائية للرصد</span>
                        </div>
                        <div className="h-8 w-px bg-slate-200" />
                        <div className="text-center">
                          <span className="text-2xl font-black font-mono text-emerald-600 block">+{50 + (adaptiveScore * 25)} XP</span>
                          <span className="text-[10px] text-slate-400 font-bold block">مكافأة التحصيل المكتسبة</span>
                        </div>
                      </div>
                    </div>

                    {/* تقرير تحليل الأخطاء والتفسير المنهجي */}
                    {adaptiveWrongAnswersReport.length > 0 ? (
                      <div className="space-y-3">
                        <span className="font-extrabold text-xs text-slate-800 block flex items-center gap-1">
                          <AlertCircle size={14} className="text-amber-500" />
                          <span>📚 التغذية الراجعة وتوجيهات الأخطاء لتصحيح المفاهيم:</span>
                        </span>

                        <div className="space-y-3 text-xs leading-relaxed">
                          {adaptiveWrongAnswersReport.map((rep, idx) => (
                            <div key={idx} className="bg-amber-50/40 border border-amber-100 rounded-2xl p-4 space-y-2">
                              <p className="font-bold text-slate-800">السؤال: {rep.question.text}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-semibold">
                                <span className="text-rose-700">إجابتك المسلمة: {rep.studentAnswer}</span>
                                <span className="text-emerald-800">الإجابة الصحيحة الأكاديمية: {rep.question.correct}</span>
                              </div>
                              <div className="border-t border-amber-200/40 pt-2 text-[11px] text-amber-900">
                                <span className="font-bold">📘 التفسير المنهجي:</span> {rep.explain}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl text-center text-emerald-800 text-xs font-bold leading-relaxed">
                        🎉 مدهش بحق! لم تسجل أي أخطاء في هذا التحدي التكيفي. أنت مشروع عالم فيزياء فذ ومتميز!
                      </div>
                    )}

                    <button 
                      onClick={() => { setAdaptiveQuestions([]); setAdaptiveSubmitted(false); }}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      🔄 تجهيز وإعداد اختبار تكيفي آخر
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ==================== 3. واجهة ملف الإنجاز الشامل والمكافآت ==================== */}
            {activeTab === 'portfolio' && (
              <div className="space-y-6 animate-fade-in" dir="rtl">
                
                {/* 3.1 بطاقة بانتو لفرز بيانات المنجزات */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* إجمالي الـ XP */}
                  <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs relative overflow-hidden flex items-center gap-4">
                    <div className="absolute top-0 right-0 w-8 h-8 rounded-bl-full bg-gradient-to-tr from-yellow-300 to-amber-500" />
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg font-bold">
                      ⚔️
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold text-[10px] block">إجمالي نقاط المجد العلمي:</span>
                      <span className="text-xl font-black font-mono text-indigo-900 leading-tight">{xpPoints} XP</span>
                    </div>
                  </div>

                  {/* الرتبة الفيزيائية */}
                  <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg font-bold">
                      ⭐
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold text-[10px] block">رتبتك العلمية كطالب:</span>
                      <span className="text-xs font-extrabold text-indigo-850 truncate max-w-[130px] block leading-tight">
                        {xpPoints < 200 ? '🎓 فيزيائي مبتدئ' : xpPoints < 500 ? '⚡ فيزيائي متمرس' : '🌟 عالم الكوزموس القدير'}
                      </span>
                    </div>
                  </div>

                  {/* المختبرات المكتملة */}
                  <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center text-lg font-bold">
                      🔬
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold text-[10px] block">المخططات والبحوث المخبرية:</span>
                      <span className="text-xs font-extrabold text-slate-800 leading-tight block">تم تفتيش وحل المختبرات التفاعلية بنجاح.</span>
                    </div>
                  </div>

                  {/* الأخطاء المرصودة قيد التصفية */}
                  <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg font-bold">
                      🛠️
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold text-[10px] block">ثغرات علمية قيد المراجعة:</span>
                      <span className="text-xs font-black font-mono text-rose-700 leading-tight block">{incorrectQuestionsLog.length} مغالطات خطئية</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* الشريحة اليمين: الأوسمة والشارات العلمية الفاخرة */}
                  <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                    <span className="font-extrabold text-slate-800 text-sm block border-b border-slate-50 pb-2.5">
                      🎖️ معرض الأوسمة والأبعاد التنافسية للطلاب:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                      {/* الوسام الأول */}
                      <div className={`rounded-2xl border p-4 text-center transition-all duration-500 scale-95 hover:scale-100 ${
                        scores.some(s => s.score.startsWith('5')) 
                          ? 'bg-amber-50/50 border-amber-300 text-amber-900 shadow-sm' 
                          : 'bg-slate-50/20 border-slate-250 text-slate-400 filter grayscale opacity-60'
                      }`}>
                        <div className="text-2xl mb-2">🧠</div>
                        <h4 className="text-[11px] font-black">العبقرية المخيفة</h4>
                        <p className="text-[9px] mt-1 text-slate-500">حقق الدرجة الكاملة في أي اختبار درسى لمنهج سياف.</p>
                        <span className="text-[9px] font-bold block mt-2 bg-white/60 rounded-full py-0.5">
                          {scores.some(s => s.score.startsWith('5')) ? '✅ مفعل ومحرز' : '🔒 معلق بالتفوق'}
                        </span>
                      </div>

                      {/* الوسام الثاني */}
                      <div className={`rounded-2xl border p-4 text-center transition-all duration-500 scale-95 hover:scale-100 ${
                        completedLabs.length >= 1 || scores.length >= 1
                          ? 'bg-blue-50/50 border-blue-300 text-blue-900 shadow-sm' 
                          : 'bg-slate-50/20 border-slate-250 text-slate-400 filter grayscale opacity-60'
                      }`}>
                        <div className="text-2xl mb-2">🔬</div>
                        <h4 className="text-[11px] font-black">المهندس التجريبي</h4>
                        <p className="text-[9px] mt-1 text-slate-500">اصطدم الميكانيك بالمختبر الافتراضي وعاين النتائج.</p>
                        <span className="text-[9px] font-bold block mt-2 bg-white/60 rounded-full py-0.5">
                          {completedLabs.length >= 1 || scores.length >= 1 ? '✅ مفعل ومحرز' : '🔒 معلق بزيارة المختبر'}
                        </span>
                      </div>

                      {/* الوسام الثالث */}
                      <div className={`rounded-2xl border p-4 text-center transition-all duration-500 scale-95 hover:scale-100 ${
                        adaptiveDifficulty === 'hard' && adaptiveSubmitted 
                          ? 'bg-rose-50/50 border-rose-300 text-rose-900 shadow-sm' 
                          : 'bg-slate-50/20 border-slate-250 text-slate-400 filter grayscale opacity-60'
                      }`}>
                        <div className="text-2xl mb-2">⚡</div>
                        <h4 className="text-[11px] font-black">بطل الحركة العظيم</h4>
                        <p className="text-[9px] mt-1 text-slate-500">تمكن من ملاحقة وإنهاء اختبار تكيفي بالمستوى الصعب.</p>
                        <span className="text-[9px] font-bold block mt-2 bg-white/60 rounded-full py-0.5">
                          {adaptiveDifficulty === 'hard' && adaptiveSubmitted ? '✅ مفعل ومحرز' : '🔒 معلق بالامتحان الصعب'}
                        </span>
                      </div>

                      {/* الوسام الرابع */}
                      <div className={`rounded-2xl border p-4 text-center transition-all duration-500 scale-95 hover:scale-100 ${
                        xpPoints >= 300 
                          ? 'bg-violet-50/50 border-violet-300 text-violet-900 shadow-sm' 
                          : 'bg-slate-50/20 border-slate-250 text-slate-400 filter grayscale opacity-60'
                      }`}>
                        <div className="text-2xl mb-2">🪐</div>
                        <h4 className="text-[11px] font-black">أستاذ الأبعاد والكميات</h4>
                        <p className="text-[9px] mt-1 text-slate-500">احصد مجموع 300 نقطة خبرة لتكتشف أسرار النسبية سياف.</p>
                        <span className="text-[9px] font-bold block mt-2 bg-white/60 rounded-full py-0.5">
                          {xpPoints >= 300 ? '✅ مفعل ومحرز' : '🔒 تحصيل المستويات'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* الشريحة اليسار: الأهداف والمهام اليومية السريعة */}
                  <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                    <span className="font-extrabold text-slate-800 text-xs block border-b border-slate-50 pb-2">
                      ⚔️ مسارك ومهامك اليومية المقترحة لليوم:
                    </span>

                    <div className="space-y-3.5 text-xs">
                      {/* المهمة الأولى */}
                      <div className="flex items-center gap-3 bg-slate-55 p-2.5 rounded-xl border border-slate-100">
                        <input type="checkbox" checked={scores.length >= 1} readOnly className="rounded text-indigo-600 focus:ring-0 w-4 h-4 cursor-not-allowed" />
                        <div className="leading-tight">
                          <span className="font-bold block text-slate-800">أنهِ اختباراً واحداً اليوم (+50 XP)</span>
                          <span className="text-[10px] text-slate-400">قدم حلاً لأسئلة الدروس الـ ١٨ ليرى رصدك.</span>
                        </div>
                      </div>

                      {/* المهمة الثانية */}
                      <div className="flex items-center gap-3 bg-slate-55 p-2.5 rounded-xl border border-slate-100">
                        <input type="checkbox" checked={adaptiveSubmitted} readOnly className="rounded text-indigo-600 focus:ring-0 w-4 h-4 cursor-not-allowed" />
                        <div className="leading-tight">
                          <span className="font-bold block text-slate-800">أجرِ اختباراً تكيفياً معقداً (+100 XP)</span>
                          <span className="text-[10px] text-slate-400">تدرب مع الذكاء الاصطناعي لرصد الأخطاء.</span>
                        </div>
                      </div>

                      {/* المهمة الثالثة */}
                      <div className="flex items-center gap-3 bg-slate-55 p-2.5 rounded-xl border border-slate-100">
                        <input type="checkbox" checked={chatMessages.length >= 3} readOnly className="rounded text-indigo-600 focus:ring-0 w-4 h-4 cursor-not-allowed" />
                        <div className="leading-tight">
                          <span className="font-bold block text-slate-800">استشِر المساعد الذكي سياف (+50 XP)</span>
                          <span className="text-[10px] text-slate-400">تبادل الحوار لتسليط الضوء على حل أو تجربة.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3.2 سجل تحليل أخطائي الذكي (سلسلة تحليل الصعوبات العلمية) */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                  <div className="border-b border-slate-50 pb-3">
                    <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                      <LifeBuoy size={16} className="text-rose-500 animate-spin" style={{ animationDuration: '6s' }} />
                      <span>سجل أخطائي الفردي الذكي وموجه تصحيح المفاهيم الرياضية ({incorrectQuestionsLog.length})</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      هنا يعزل البرنامج كافة العقبات والأخطاء التي سقطت فيها للاستذكار وحلها مع الأستاذ حتى تستمر كطالب فيزيائي من الدرجة الأولى!
                    </p>
                  </div>

                  {incorrectQuestionsLog.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {incorrectQuestionsLog.map((log, idx) => (
                        <div key={idx} className="bg-rose-50/20 hover:bg-rose-50/45 transition-all p-4.5 rounded-2xl border border-rose-100/70 space-y-2 text-right relative overflow-hidden">
                          <div className="absolute top-0 right-0 max-w-[120px] truncate bg-rose-50/80 text-[9px] text-rose-800 font-bold px-2.5 py-1 rounded-bl-xl border-l border-b border-rose-100">
                            {log.lessonTitle}
                          </div>
                          
                          <div className="font-extrabold text-slate-800 pr-1 border-r-2 border-rose-400">
                            {log.question.text}
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold pt-1">
                            <span className="text-rose-600 block bg-rose-50 px-2 py-1 rounded-md text-center">أنت اخترت: {log.studentAnswer}</span>
                            <span className="text-emerald-800 block bg-emerald-50 px-2 py-1 rounded-md text-center">الإجابة المصوبة: {log.question.correct}</span>
                          </div>

                          <p className="text-[10px] text-slate-400 border-t border-slate-100 pt-1.5 leading-relaxed font-semibold">
                            💡 شرح وتفسير: {log.question.explain || 'يتطلب القانون تطبيقاً صارماً لوحدات القياس والعلاقة الطردية أو العكسية لعجلة قياس وتحديد الأجسام وسقوطها الحر بمجال الجاذبية.'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 font-semibold italic">
                      🕊️ لا توجد أخطاء في سجلك الخاص حتى الآن! استمر بالمذاكرة وحافظ على رداء النقاء العلمي وعقلك النير!
                    </div>
                  )}
                </div>

                {/* 3.3 صندوق الإخطارات والرسائل التوجيهية الواردة من المعلم والإدارة */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                  <div className="border-b border-slate-50 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                        <span>📬 صندوق الرسائل والتوجيهات الأكاديمية الصادرة إليك ({lmsMessages.filter(msg => {
                          if (msg.targetType === 'all') {
                            if (msg.senderRole === 'superadmin') return true;
                            if (msg.targetSchool === studentSchool) return true;
                          }
                          if (msg.targetType === 'class' && msg.targetSchool === studentSchool && msg.targetClass === studentClass) return true;
                          if (msg.targetType === 'student' && msg.targetSchool === studentSchool && msg.targetStudentName === studentName) return true;
                          return false;
                        }).length})</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        هنا تستقبل الرسائل والتوجيهات الفردية والخاصة بصفك وشعبتك من قبل معلم المادة أو إدارة مدرستك للرقي بتحصيلك العلمي في علم ميكانيكا وحركة الأجسام.
                      </p>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="صندوق رسائل نشط" />
                  </div>

                  {lmsMessages.filter(msg => {
                    if (msg.targetType === 'all') {
                      if (msg.senderRole === 'superadmin') return true;
                      if (msg.targetSchool === studentSchool) return true;
                    }
                    if (msg.targetType === 'class' && msg.targetSchool === studentSchool && msg.targetClass === studentClass) return true;
                    if (msg.targetType === 'student' && msg.targetSchool === studentSchool && msg.targetStudentName === studentName) return true;
                    return false;
                  }).length > 0 ? (
                    <div className="space-y-3.5">
                      {lmsMessages.filter(msg => {
                        if (msg.targetType === 'all') {
                          if (msg.senderRole === 'superadmin') return true;
                          if (msg.targetSchool === studentSchool) return true;
                        }
                        if (msg.targetType === 'class' && msg.targetSchool === studentSchool && msg.targetClass === studentClass) return true;
                        if (msg.targetType === 'student' && msg.targetSchool === studentSchool && msg.targetStudentName === studentName) return true;
                        return false;
                      }).map((msg) => (
                        <div key={msg.id} className="bg-slate-50/50 hover:bg-slate-50 transition-all p-4.5 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-black text-slate-800">
                                👨‍🏫 {msg.senderName}
                              </span>
                              <span className="text-[9px] bg-indigo-50 text-indigo-750 font-extrabold px-2 py-0.5 rounded-md">
                                {msg.senderRole === 'superadmin' ? 'الإدارة الكبرى للمنصة' : msg.senderRole === 'teacher' ? 'معلم المادة' : 'إدارة المدرسة'}
                              </span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                                msg.targetType === 'student' ? 'bg-rose-50 text-rose-600' : msg.targetType === 'class' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                              }`}>
                                {msg.targetType === 'student' ? '📩 توجيه شخصي سري للغاية' : msg.targetType === 'class' ? `👥 رسالة لشعبتك (${studentClass})` : '📢 تنبيه عام لكافة الأطراف'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-semibold pt-1">
                              {msg.content}
                            </p>
                          </div>
                          <div className="text-left md:text-right shrink-0">
                            <span className="text-[10px] text-slate-400 font-bold block">{msg.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400 italic font-medium">📭 لا تتوفر أي توجيهات أفقية أو تعاميم خاصة بشعبتك حالياً.</div>
                  )}
                </div>

              </div>
            )}

            {/* ==================== 🏆 لوحة الصدارة والشرف (Leaderboard View) ==================== */}
            {activeTab === 'leaderboard' && (() => {
              // Calculate leaderboard from scores and attendance
              const activeSchool = studentSchool || 'ثانوية جمال عبد الناصر للمتفوقين - صنعاء';
              const schoolScores = scores.filter(s => s.school === activeSchool);
              const uniqueSts = Array.from(new Set(schoolScores.map(s => s.name))) as string[];

              const calculatedLeaderboard = uniqueSts.map(name => {
                const stdScores = schoolScores.filter(s => s.name === name);
                const currentClass = stdScores[0]?.classGroup || 'الشعبة أ';
                
                let totalGot = 0;
                let totalMax = 0;
                stdScores.forEach(s => {
                  const parts = s.score.split('/');
                  totalGot += (parseFloat(parts[0]) || 0);
                  totalMax += (parseFloat(parts[1]) || 5);
                });

                const avgPct = stdScores.length > 0 ? Math.round((totalGot / totalMax) * 100) : 0;
                const avgOutOf5 = stdScores.length > 0 ? Number(((totalGot / totalMax) * 5).toFixed(1)) : 0;
                const completedCount = stdScores.length;
                
                // XP calculations
                const calculatedXp = (completedCount * 55) + (avgPct >= 90 ? 150 : avgPct >= 75 ? 50 : 0);

                return {
                  name,
                  classGroup: currentClass,
                  avgPct,
                  avgOutOf5,
                  completedCount,
                  xp: calculatedXp,
                  rankBadge: calculatedXp >= 400 ? '👑 فيزيائي خارق' : calculatedXp >= 200 ? '⚡ متمرس' : '🎓 فيزيائي ناشئ'
                };
              }).sort((a, b) => b.xp - a.xp);

              return (
                <div className="space-y-6 animate-fade-in" dir="rtl">
                  
                  {/* ترويسة لوحة الشرف */}
                  <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-3xl p-6 text-white shadow-md relative overflow-hidden text-right">
                    <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl" />
                    <h2 className="text-lg md:text-xl font-black">🏆 لوحة الصدارة والتميز الأكاديمي الصفي</h2>
                    <p className="text-xs text-indigo-100 mt-1 font-semibold">استعرض صدارة المجتهدين والفيزيائيين الأوائل لشعبة النخبة في مدرستكم الموقرة.</p>
                  </div>

                  {/* كروت التميز الثلاثية الأولى */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {calculatedLeaderboard.slice(0, 3).map((std, idx) => {
                      const icons = ['🥇', '🥈', '🥉'];
                      const borderColors = ['border-amber-300 shadow-amber-100', 'border-slate-300 shadow-slate-100', 'border-amber-600/30 shadow-amber-50'];
                      return (
                        <div key={idx} className={`border rounded-3xl p-5 text-center flex flex-col items-center justify-center space-y-2 relative overflow-hidden bg-white shadow-xs ${borderColors[idx]}`}>
                          <span className="text-4xl">{icons[idx]}</span>
                          <span className="text-[10px] font-bold text-slate-400 block">الترتيب {idx + 1} للشعبة</span>
                          <h4 className="font-black text-slate-800 text-sm">{std.name}</h4>
                          <span className="text-xs bg-indigo-50 text-indigo-800 px-3 py-1 rounded-full font-black block font-mono">{std.xp} XP</span>
                          <span className="text-[10px] text-slate-500 font-bold block">{std.classGroup} | متوسط {std.avgOutOf5}/5</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* الكشف العام للأشخاص */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                    <h3 className="font-extrabold text-slate-800 text-xs block border-b border-slate-50 pb-2">📋 لائحة الشرف والصدارة التنافسية للطلاب:</h3>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-right border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-black">
                            <th className="p-3 text-center">الترتيب</th>
                            <th className="p-3">اسم الطالب المتفوق</th>
                            <th className="p-3 text-center">الشعبة الصفية</th>
                            <th className="p-3 text-center">المستوى المنجز</th>
                            <th className="p-3 text-center">متوسط الفهم</th>
                            <th className="p-3 text-center">الرتبة العلمية</th>
                            <th className="p-3 text-center">مجموع النقاط</th>
                          </tr>
                        </thead>
                        <tbody>
                          {calculatedLeaderboard.map((std, idx) => (
                            <tr key={idx} className={`border-b border-slate-55 hover:bg-slate-50/45 transition-all font-semibold ${std.name === studentName ? 'bg-indigo-50/40 font-bold' : ''}`}>
                              <td className="p-3 text-center font-bold font-mono">
                                {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : idx + 1}
                              </td>
                              <td className="p-3 font-extrabold text-slate-850 flex items-center gap-2">
                                {std.name}
                                {std.name === studentName && <span className="bg-amber-500 text-blue-950 font-black px-1.5 py-0.5 rounded-md text-[8px]">أنت</span>}
                              </td>
                              <td className="p-3 text-center text-indigo-700 font-bold">{std.classGroup}</td>
                              <td className="p-3 text-center font-mono">{std.completedCount} واجب/امتحان</td>
                              <td className="p-3 text-center font-mono font-bold text-slate-700">{std.avgPct}% ({std.avgOutOf5}/5)</td>
                              <td className="p-3 text-center">
                                <span className="px-2 py-0.5 text-[9px] bg-slate-100 border border-slate-200 text-slate-650 rounded-full">{std.rankBadge}</span>
                              </td>
                              <td className="p-3 text-center font-mono text-base font-black text-indigo-950">{std.xp} XP</td>
                            </tr>
                          ))}
                          {calculatedLeaderboard.length === 0 && (
                            <tr>
                              <td colSpan={7} className="text-center py-10 italic font-bold text-slate-400">لا يوجد كشوف طلاب مسجلة بالمسابقات بعد لمدرستكم.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ==================== 🔔 مركز التنبيهات الذكي ودعم التحصيل (Notifications View) ==================== */}
            {activeTab === 'notifications' && (() => {
              const activeSchool = studentSchool || 'ثانوية جمال عبد الناصر للمتفوقين - صنعاء';
              
              // 1. Calculate student's own attendance rates
              const studentAtts = studentAttendances.filter(a => a.studentName === studentName && a.school === activeSchool);
              const studentPresent = studentAtts.filter(a => a.status === 'present').length;
              const studentLate = studentAtts.filter(a => a.status === 'late').length;
              const studentAttRate = studentAtts.length > 0 ? Math.round(((studentPresent + (studentLate * 0.5)) / studentAtts.length) * 100) : 100;
              
              // 2. Calculate average grade
              const studentScoresList = scores.filter(s => s.name === studentName && s.school === activeSchool);
              let totalG = 0;
              let totalM = 0;
              studentScoresList.forEach(s => {
                const parts = s.score.split('/');
                totalG += (parseFloat(parts[0]) || 0);
                totalM += (parseFloat(parts[1]) || 5);
              });
              const studentAveragePct = totalM > 0 ? Math.round((totalG / totalM) * 100) : 100;
              const studentAverageOutOf5 = totalM > 0 ? Number(((totalG / totalM) * 5).toFixed(1)) : 5;

              // Compile alerts
              let calculatedAlerts: Array<{ id: string; type: 'danger' | 'warning' | 'info' | 'success'; title: string; message: string; date: string; alertType: string }> = [];

              // Grade Alert
              if (studentScoresList.length > 0 && studentAveragePct < 60) {
                calculatedAlerts.push({
                  id: "dyn_grade",
                  type: "danger",
                  title: "تراجع حاد في درجات التحصيل التراكمي ⚠️",
                  message: `حذارِ، لقد انخفض متوسط أدائك الإجمالي بالمنظومة ليصل إلى ${studentAveragePct}% (${studentAverageOutOf5}/5). ننصحك بمراجعة معلم المادة فوراً وحل أسئلة الدعم العلمي.`,
                  date: "اليوم",
                  alertType: "grades"
                });
              }

              // Attendance Alert
              if (studentAtts.length > 0 && studentAttRate < 80) {
                calculatedAlerts.push({
                  id: "dyn_abs",
                  type: "danger",
                  title: "إنذار قانون الغياب الصفي المتكرر 🚨",
                  message: `انتباه: نسبة حضورك المسجلة بلغت ${studentAttRate}%، وهو أقل من الحد القانوني المسموح به (80%). استمرارك بالغياب يعرض رتبتك وحظر حسابك للتفعيل.`,
                  date: "اليوم",
                  alertType: "absences"
                });
              }

              // Homework Alert (if low progress)
              const studentAttempted = Array.from(new Set(studentScoresList.map(s => s.lessonId))).length;
              const studentCompletionRate = Math.min(100, Math.round((studentAttempted / 18) * 100));
              if (studentCompletionRate < 35) {
                calculatedAlerts.push({
                  id: "dyn_hw",
                  type: "warning",
                  title: "تأخر ملحوظ في تسليمات التمارين والواجبات المنهجية 📚",
                  message: `رصد آلي: إنجازك للمنهج الحالي منخفض للغاية (${studentCompletionRate}%). يجب عليك إكمال اختبارات الدروس الـ 18 لدعم سجل تقدمك الدراسي.`,
                  date: "اليوم",
                  alertType: "homework"
                });
              }

              // Combine with global broadcasts and static smartAlerts meant for student/all and matches current school/student
              const customSmartAlerts = smartAlerts.filter(a => 
                (a.userType === 'student' || a.userType === 'all') && 
                (!a.school || a.school === activeSchool) && 
                (!a.studentName || a.studentName === studentName)
              ).map(a => ({
                id: a.id,
                type: a.type,
                title: a.title,
                message: a.message,
                date: a.date,
                alertType: a.alertType
              }));

              const allStudentAlerts = [...calculatedAlerts, ...customSmartAlerts];

              return (
                <div className="space-y-6 animate-fade-in text-right" dir="rtl">
                  
                  {/* ترويسة مركز الإشعارات الذكي المعولم */}
                  <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-lg border border-rose-500/25 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl" />
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-lg md:text-xl font-black">🔔 مركز الرقابة والتنبيهات المنهجية الذكية</h2>
                        <p className="text-xs text-rose-100 font-semibold mt-1">نظام إنذار وتحليل فوري لرصد درجاتك، حضورك الصفي، التزام المعلمين، والتعاميم الطارئة المقررة.</p>
                      </div>
                      <span className="text-xs font-mono font-black bg-rose-600 px-3 py-1 text-white rounded-full">{allStudentAlerts.length} إنذارات نشطة</span>
                    </div>
                  </div>

                  {/* فرز خلاصة الإنذارات */}
                  <div className="space-y-4">
                    {allStudentAlerts.map((alt) => {
                      let colorClasses = 'border-amber-250 bg-amber-50/20 text-amber-900';
                      let icon = '⚠️';
                      if (alt.type === 'danger') {
                        colorClasses = 'border-rose-200 bg-rose-50/25 text-rose-900';
                        icon = '🚨';
                      } else if (alt.type === 'success') {
                        colorClasses = 'border-emerald-250 bg-emerald-50/20 text-emerald-900';
                        icon = '✅';
                      } else if (alt.type === 'info') {
                        colorClasses = 'border-blue-200 bg-blue-50/20 text-blue-900';
                        icon = 'ℹ️';
                      }

                      return (
                        <div key={alt.id} className={`border rounded-3xl p-5 shadow-xs transition-all flex items-start gap-4 ${colorClasses}`}>
                          <span className="text-2xl mt-1 shrink-0">{icon}</span>
                          <div className="space-y-1 w-full text-right">
                            <div className="flex items-center justify-between">
                              <h4 className="font-extrabold text-xs md:text-sm">{alt.title}</h4>
                              <span className="text-[9px] text-slate-400 font-mono font-bold shrink-0">{alt.date}</span>
                            </div>
                            <p className="text-[11px] md:text-xs leading-relaxed font-semibold pr-1 opacity-90">{alt.message}</p>
                            
                            {/* زر إجراء تسوية */}
                            <div className="flex justify-end gap-1.5 pt-2">
                              <span className="text-[9px] bg-white/70 border border-current px-2.5 py-0.5 rounded-full font-bold cursor-default select-none">
                                نوع الرصد: {alt.alertType}
                              </span>
                              <button 
                                onClick={() => {
                                  alert("✔️ تم تسجيل العلم بالإنذار، والعمل جارٍ للاستجابة التربوية الدقيقة بالاتصال بالمعلمين.");
                                }}
                                className="bg-white/80 hover:bg-white text-slate-800 font-bold px-3 py-1 rounded-xl text-[10px] border border-slate-200 transition-colors cursor-pointer"
                              >
                                علم وعمل بذلك 👍
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {allStudentAlerts.length === 0 && (
                      <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-xs flex flex-col items-center justify-center space-y-2">
                        <span className="text-4xl">🕊️</span>
                        <h4 className="font-extrabold text-slate-850 text-sm">أنت في مأمن أكاديمي طاهر وكامل!</h4>
                        <p className="text-xs text-slate-400 italic">لا توجد أي تنبيهات أو إنذارات أو غيابات غير عادية مرصودة على حسابك الدراسي اليوم.</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* ==================== 📊 مركز التقارير المتكامل (Report Center) ==================== */}
            {activeTab === 'reports' && ['superadmin', 'super_admin', 'school', 'teacher'].includes(currentUserType) && (
              <ReportCenter 
                currentUserType={currentUserType as any}
                schools={schools}
                scores={scores}
                studentAttendances={studentAttendances}
                teachers={teachers}
                allLessons={lessonsList}
                selectedSchoolName={currentUserType === 'school' ? studentSchool : ''}
                selectedTeacherName={currentUserType === 'teacher' ? studentName : ''}
              />
            )}

            {/* ==================== 🔐 إدارة الحسابات والأرقام السرية (Accounts Management) ==================== */}
            {activeTab === 'accounts_management' && ['superadmin', 'super_admin'].includes(currentUserType) && (
              <AccountsManagement 
                currentUserType={currentUserType as any}
                schools={schools}
                teachers={teachers}
                onUpdateTeachers={saveTeachersToStorage}
                studentAccounts={studentAccounts}
                onUpdateStudentAccounts={saveStudentAccountsToStorage}
                schoolManagers={schoolManagers}
                onUpdateSchoolManagers={saveSchoolManagersToStorage}
              />
            )}

            {/* ==================== 👑 لوحة المالك العام والتحكم الشامل (Super Admin Panel) ==================== */}
            {activeTab === 'super_admin_panel' && ['super_admin', 'superadmin'].includes(currentUserType) && (
              <div className="space-y-6 animate-fade-in text-right" dir="rtl">
                
                {/* ترويسة رئيسية احترافية ملونة عريضة */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-amber-500/30">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-[10px] px-3 py-1 rounded-full font-extrabold uppercase">
                        👑 نظام التشغيل السيادي للمالك العام (الأستاذ سياف)
                      </span>
                      <h2 className="text-xl md:text-2xl font-black">لوحة التحكم التامة والرقابة والاشتراكات الكبرى 🇾🇪</h2>
                      <p className="text-slate-300 text-xs max-w-2xl font-semibold leading-relaxed">
                        مرحباً بك يا أستاذ سياف في المركز المحوري لعمليات الـ LMS والترخيص. يمكنك تعديل باقات المدارس، منح تراخيص السعة، إدارة المعلمين الموجهين بالجمهورية، تفعيل الميزات وإيقافها بكبسة زر واحدة.
                      </p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/5 text-center min-w-[130px] shadow-inner">
                      <span className="block text-[10px] text-teal-300 font-extrabold">حالة المزامنة</span>
                      <span className="block text-sm font-black font-mono text-white mt-1">● قاعدة نشطة</span>
                    </div>
                  </div>
                </div>

                {/* كروت المؤشرات الفورية الكبرى (KPIs) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50/50 text-indigo-600 flex items-center justify-center text-xl font-bold">🏫</div>
                    <div>
                      <span className="text-slate-400 font-bold text-[10px] block">المدارس والمديريات:</span>
                      <span className="text-lg font-black text-slate-800 leading-tight">{schools.length} مرخصة</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-teal-50/50 text-teal-600 flex items-center justify-center text-xl font-bold">👨‍🏫</div>
                    <div>
                      <span className="text-slate-400 font-bold text-[10px] block">توجيه ومعلمي النظام:</span>
                      <span className="text-lg font-black text-slate-800 leading-tight">{teachers.length} معلم فعال</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-amber-50/50 text-amber-600 flex items-center justify-center text-xl font-bold">👥</div>
                    <div>
                      <span className="text-slate-400 font-bold text-[10px] block">مسجلين (امتياز الأكواد):</span>
                      <span className="text-lg font-black text-slate-800 leading-tight">
                        {Array.from(new Set(scores.map(s => s.name))).length} طلاب
                      </span>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-rose-50/50 text-rose-600 flex items-center justify-center text-xl font-bold">🔑</div>
                    <div>
                      <span className="text-slate-400 font-bold text-[10px] block">مستعمل / إجمالي التراخيص:</span>
                      <span className="text-lg font-black text-slate-800 leading-tight">
                        {activationCodes.filter(c => c.status === 'used').length} / {activationCodes.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* أزار التبديل السلس المحورية للتحكم السوبر */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-2 max-w-full mx-auto overflow-x-auto border border-slate-200">
                  {[
                    { id: 'overview', label: '📊 اللوحة المركزية المقارنة' },
                    { id: 'schools', label: '🏫 رصد المدارس والاشتراكات' },
                    { id: 'teachers', label: '👨‍🏫 مجلس المعلمين والموجهين' },
                    { id: 'codes', label: '🔑 أكواد ترخيص الطلاب' },
                    { id: 'search', label: '🔍 البحث الذكي الموحد والأكواد' },
                    { id: 'logs', label: '📜 سجل النشاطات الفوري' },
                    { id: 'settings', label: '⚙️ إعدادات المنصة الكبرى' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSuperAdminSubTab(tab.id as any)}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                        superAdminSubTab === tab.id
                          ? 'bg-indigo-700 text-white shadow-md font-black hover:bg-indigo-650'
                          : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* المحتوى التفصيلي للتبويبات */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
                  
                  {/* أ. اللوحة المركزية المقارنة للمالك العام */}
                  {superAdminSubTab === 'overview' && (() => {
                    const uniqueStsCount = Array.from(new Set(scores.map(s => s.name))).length;
                    const usedCodesCount = activationCodes.filter(c => c.status === 'used').length;
                    
                    const schoolsOverview = schools.map(sch => {
                      const schoolScores = scores.filter(s => s.school === sch.name);
                      const schoolCodes = activationCodes.filter(c => c.school === sch.name);
                      
                      const usedCodes = schoolCodes.filter(c => c.status === 'used').length;
                      const studentsCount = Array.from(new Set(schoolScores.map(s => s.name))).length;
                      const testAttempts = schoolScores.length;
                      
                      const totalScoreSum = schoolScores.reduce((sum, s) => sum + (parseInt(s.score) || 0), 0);
                      const avgScore = testAttempts > 0 ? Number((totalScoreSum / testAttempts).toFixed(2)) : 0;
                      
                      const capacity = sch.capacity || 50;
                      const interactionRate = Math.min(100, Math.round((usedCodes / capacity) * 100));
                      
                      const uniqueLessonsAttempted = Array.from(new Set(schoolScores.map(s => s.lessonId))).length;
                      const curriculumCompletionRate = Math.round((uniqueLessonsAttempted / 18) * 100);

                      return {
                        ...sch,
                        capacity,
                        usedCodes,
                        totalCodes: schoolCodes.length,
                        studentsCount,
                        testAttempts,
                        avgScore,
                        interactionRate,
                        curriculumCompletionRate
                      };
                    });

                    // Rank schools by average score
                    const rankedSchools = [...schoolsOverview].sort((a, b) => b.avgScore - a.avgScore);
                    
                    // Overall completion rate (average completion rate across all active schools)
                    const sumCompletion = schoolsOverview.reduce((sum, s) => sum + s.curriculumCompletionRate, 0);
                    const avgPlatformCompletion = schoolsOverview.length > 0 ? Math.round(sumCompletion / schoolsOverview.length) : 0;

                    return (
                      <div className="space-y-8 text-right animate-fade-in" dir="rtl">
                        {/* ترويسة فرعية */}
                        <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-black text-slate-900 text-base">📊 اللوحة المركزية المفصلة ومؤشرات قياس ذكاء الأعمال (BI)</h3>
                            <p className="text-[11px] text-slate-500 mt-0.5 font-bold">بين يديك رصد حي وشامل لمقارنة أداء مدارس الجمهورية، معدلات التحصيل، تفاعل الأكواد وتغطية المنهج الدراسي.</p>
                          </div>
                          <div className="flex gap-2 text-xs">
                            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl text-[10px] font-bold border border-emerald-150 flex items-center gap-1 animate-pulse">
                              ● محدث الآن (تلقائي)
                            </span>
                          </div>
                        </div>

                        {/* الكروت السداسية التنافسية الكبرى */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/30 border border-indigo-100 p-4 rounded-2xl shadow-xs">
                            <span className="block text-slate-500 text-[10px] font-black">🏢 عدد المدارس:</span>
                            <span className="block text-xl font-black text-indigo-950 mt-1">{schools.length} <span className="text-[11px] text-slate-550 font-semibold">مؤسسة</span></span>
                          </div>
                          <div className="bg-gradient-to-br from-teal-50 to-teal-100/30 border border-teal-100 p-4 rounded-2xl shadow-xs">
                            <span className="block text-slate-500 text-[10px] font-black">👨‍🏫 عدد المعلمين:</span>
                            <span className="block text-xl font-black text-teal-950 mt-1">{teachers.length} <span className="text-[11px] text-slate-550 font-semibold">موجه</span></span>
                          </div>
                          <div className="bg-gradient-to-br from-sky-50 to-sky-100/30 border border-sky-100 p-4 rounded-2xl shadow-xs">
                            <span className="block text-slate-500 text-[10px] font-black">👥 عدد الطلاب الفاعلين:</span>
                            <span className="block text-xl font-black text-sky-950 mt-1">{uniqueStsCount} <span className="text-[11px] text-slate-550 font-semibold">طالب</span></span>
                          </div>
                          <div className="bg-gradient-to-br from-rose-50 to-rose-100/30 border border-rose-100 p-4 rounded-2xl shadow-xs">
                            <span className="block text-slate-500 text-[10px] font-black">📝 إجمالي الاختبارات:</span>
                            <span className="block text-xl font-black text-rose-950 mt-1">{scores.length} <span className="text-[11px] text-slate-550 font-semibold">محاولة</span></span>
                          </div>
                          <div className="bg-gradient-to-br from-amber-50 to-amber-100/30 border border-amber-100 p-4 rounded-2xl shadow-xs">
                            <span className="block text-slate-500 text-[10px] font-black">🔑 الأكواد المستخدمة:</span>
                            <span className="block text-xl font-black text-amber-950 mt-1">{usedCodesCount} <span className="text-[11px] text-slate-550 font-semibold">كود نشط</span></span>
                          </div>
                          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/30 border border-emerald-100 p-4 rounded-2xl shadow-xs">
                            <span className="block text-slate-500 text-[10px] font-black">⚡ نسبة إنجاز المنصة:</span>
                            <span className="block text-xl font-black text-emerald-950 mt-1">{avgPlatformCompletion}% <span className="text-[10px] text-slate-550 font-semibold">إجمالي</span></span>
                          </div>
                        </div>

                        {/* الرسوم البيانية التفاعلية الذكية */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
                          
                          {/* الرسم البياني الأول: بار تشارت */}
                          <div className="bg-slate-50 rounded-2xl border border-slate-150 p-5 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2 border-slate-200">
                              <span className="font-extrabold text-slate-900 text-xs">📊 تفاعل المدارس ومعدل إنجاز المنهج لطلاب اليمن</span>
                              <div className="flex gap-2 text-[9px] font-semibold text-slate-505">
                                <span className="flex items-center gap-1">
                                  <span className="w-2.5 h-2.5 bg-indigo-600 rounded-sm" /> نسبة التفاعل
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm" /> نسبة إكمال المنهج
                                </span>
                              </div>
                            </div>

                            {/* الحاوية الرسومية */}
                            <div className="relative pt-2 h-64 flex flex-col justify-between">
                              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                {[100, 75, 50, 25, 0].map((val, i) => (
                                  <div key={i} className="w-full flex items-center gap-2">
                                    <span className="text-[9px] text-slate-400 font-mono w-6 text-left">{val}%</span>
                                    <div className="flex-1 border-t border-dashed border-slate-200" />
                                  </div>
                                ))}
                              </div>

                              {/* الأعمدة الممثلة للمدارس */}
                              <div className="relative z-10 h-48 flex items-end justify-around px-8">
                                {schoolsOverview.map((sch, i) => {
                                  const interactionHeight = `${sch.interactionRate}%`;
                                  const curriculumHeight = `${sch.curriculumCompletionRate}%`;

                                  return (
                                    <div key={sch.id} className="flex flex-col items-center gap-1.5 w-1/4 group relative">
                                      <div className="flex items-end gap-1.5 h-44 w-full justify-center">
                                        {/* عمود التفاعل */}
                                        <div 
                                          className="w-4 bg-indigo-600 rounded-t-sm hover:bg-indigo-500 transition-all cursor-pointer relative shadow-sm"
                                          style={{ height: interactionHeight }}
                                          onMouseEnter={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const parentRect = e.currentTarget.parentElement?.parentElement?.parentElement?.getBoundingClientRect();
                                            setHoveredOwnerMetric({
                                              school: sch.name,
                                              label: "معدل تفاعل الأكواد",
                                              value: `${sch.interactionRate}% (مستعمل ${sch.usedCodes} من ${sch.capacity})`,
                                              x: rect.left - (parentRect?.left || 0) + rect.width / 2,
                                              y: rect.top - (parentRect?.top || 0) - 45
                                            });
                                          }}
                                          onMouseLeave={() => setHoveredOwnerMetric(null)}
                                        />
                                        {/* عمود التغطية المنهجية */}
                                        <div 
                                          className="w-4 bg-amber-500 rounded-t-sm hover:bg-amber-400 transition-all cursor-pointer relative shadow-sm"
                                          style={{ height: curriculumHeight }}
                                          onMouseEnter={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const parentRect = e.currentTarget.parentElement?.parentElement?.parentElement?.getBoundingClientRect();
                                            setHoveredOwnerMetric({
                                              school: sch.name,
                                              label: "نسبة إكمال المنهج",
                                              value: `${sch.curriculumCompletionRate}% (أكمل ${Array.from(new Set(scores.filter(s => s.school === sch.name).map(s => s.lessonId))).length} من 18 درس)`,
                                              x: rect.left - (parentRect?.left || 0) + rect.width / 2,
                                              y: rect.top - (parentRect?.top || 0) - 45
                                            });
                                          }}
                                          onMouseLeave={() => setHoveredOwnerMetric(null)}
                                        />
                                      </div>
                                      {/* اسم المدرسة مصغر */}
                                      <span className="text-[9px] font-black text-slate-650 truncate max-w-[90px] text-center" title={sch.name}>
                                        {sch.name}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* الرسم البياني الثاني: لاين تشارت (متوسط العلامات) */}
                          <div className="bg-slate-50 rounded-2xl border border-slate-150 p-5 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2 border-slate-200">
                              <span className="font-extrabold text-slate-900 text-xs">📈 متوسط علامات ومعدل جودة التحصيل بنظام 5 درجات</span>
                              <span className="text-[10px] text-indigo-650 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">مقارنة علمية قياسية</span>
                            </div>

                            <div className="relative pt-2 h-64 flex flex-col justify-between">
                              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                {[5, 4, 3, 2, 1, 0].map((val, i) => (
                                  <div key={i} className="w-full flex items-center gap-2">
                                    <span className="text-[9px] text-slate-400 font-mono w-4 text-left">{val}.0</span>
                                    <div className="flex-1 border-t border-dashed border-slate-150/60" />
                                  </div>
                                ))}
                              </div>

                              {/* حاوية المنحنى والمؤشرات النقطية */}
                              <div className="relative z-10 h-48 flex items-end justify-around px-8">
                                <svg className="absolute inset-x-8 bottom-0 h-44 w-[calc(100%-4rem)] overflow-visible pointer-events-auto">
                                  {(() => {
                                    const points = schoolsOverview.map((sch, i) => {
                                      const x = (i / (schoolsOverview.length - 1 || 1)) * 100; // percent
                                      const heightPct = 100 - (sch.avgScore / 5) * 100;
                                      return { x, y: heightPct, ...sch };
                                    });

                                    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x}% ${p.y}%`).join(' ');

                                    return (
                                      <>
                                        {points.length > 0 && (
                                          <path
                                            d={`${pathD} L ${points[points.length-1].x}% 100% L 0% 100% Z`}
                                            className="fill-indigo-600/5 stroke-none"
                                          />
                                        )}
                                        <path
                                          d={pathD}
                                          fill="none"
                                          className="stroke-indigo-600 stroke-2"
                                        />
                                        {points.map((p, i) => (
                                          <circle
                                            key={i}
                                            cx={`${p.x}%`}
                                            cy={`${p.y}%`}
                                            r="5"
                                            className="fill-white stroke-indigo-600 stroke-[3px] hover:r-7 hover:fill-indigo-600 transition-all cursor-pointer"
                                            onMouseEnter={(e) => {
                                              const rect = e.currentTarget.getBoundingClientRect();
                                              const parentRect = e.currentTarget.parentElement?.parentElement?.getBoundingClientRect();
                                              setHoveredOwnerMetric({
                                                school: p.name,
                                                label: "متوسط علامات الطلاب",
                                                value: `${p.avgScore} من 5 درجات (برصد ${p.testAttempts} امتحان)`,
                                                x: rect.left - (parentRect?.left || 0) + rect.width / 2,
                                                y: rect.top - (parentRect?.top || 0) - 50
                                              });
                                            }}
                                            onMouseLeave={() => setHoveredOwnerMetric(null)}
                                          />
                                        ))}
                                      </>
                                    );
                                  })()}
                                </svg>
                                
                                {schoolsOverview.map((sch, i) => (
                                  <div key={sch.id} className="flex flex-col items-center w-1/4 pt-1">
                                    <span className="text-[9px] font-black text-slate-500 truncate max-w-[90px] text-center">
                                      {sch.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* التول تيب العائم والمقيد لخطط الرسوم */}
                          {hoveredOwnerMetric && (
                            <div 
                              className="absolute z-45 bg-slate-950 text-white p-3 rounded-xl shadow-2xl text-right text-[10.5px] border border-amber-500/40 pointer-events-none transform -translate-x-1/2 -translate-y-full min-w-[210px] space-y-1 animate-fade-in"
                              style={{ 
                                left: hoveredOwnerMetric.x, 
                                top: hoveredOwnerMetric.y 
                              }}
                            >
                              <div className="font-extrabold text-amber-300 border-b border-white/10 pb-1 mb-1">{hoveredOwnerMetric.school}</div>
                              <div className="text-slate-300 font-semibold">{hoveredOwnerMetric.label}:</div>
                              <div className="font-mono text-xs font-black text-white">{hoveredOwnerMetric.value}</div>
                            </div>
                          )}

                        </div>

                        {/* ترتيب المدارس حسب النتائج وجدول المقارنة */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          
                          {/* كشف الترتيب الصداري */}
                          <div className="md:col-span-1 bg-gradient-to-br from-amber-50/20 to-yellow-100/10 border border-amber-200/50 p-5 rounded-2xl space-y-4">
                            <span className="font-extrabold text-amber-900 text-xs block border-b pb-2 flex items-center gap-1.5 leading-none">
                              <Trophy size={14} className="text-amber-600" />
                              <span>🏆 ترتيب المدارس حسب النتائج:</span>
                            </span>

                            <div className="space-y-2.5">
                              {rankedSchools.map((sch, index) => {
                                let medal = "🏆";
                                if (index === 0) medal = "🥇";
                                else if (index === 1) medal = "🥈";
                                else if (index === 2) medal = "🥉";
                                else medal = "🛡️";

                                return (
                                  <div key={sch.id} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100 shadow-xs">
                                    <div className="flex items-center gap-2">
                                      <span className="text-base">{medal}</span>
                                      <div className="text-right">
                                        <span className="block text-xs font-black text-slate-800 truncate max-w-[140px]">{sch.name}</span>
                                        <span className="block text-[9px] text-slate-400 font-bold">{sch.studentsCount} طلاب مفحوصين</span>
                                      </div>
                                    </div>
                                    <div className="text-left font-mono">
                                      <span className="text-xs font-black text-indigo-950 block">{sch.avgScore} <span className="text-[9px] font-semibold text-slate-400">/5</span></span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* المقارنة التفصيلية الكاملة */}
                          <div className="md:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-xs">
                            <span className="font-extrabold text-slate-800 text-xs block border-b pb-2">📋 كشف المقارنة التفصيلية للمدارس:</span>
                            
                            <div className="overflow-x-auto">
                              <table className="w-full text-[11px] text-right border-collapse">
                                <thead>
                                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-extrabold">
                                    <th className="p-2.5">المدرسة الثانوية</th>
                                    <th className="p-2.5 text-center">أكواد مستعملة</th>
                                    <th className="p-2.5 text-center">نسبة التفاعل</th>
                                    <th className="p-2.5 text-center">نسبة إكمال المنهج</th>
                                    <th className="p-2.5 text-center">الامتحانات</th>
                                    <th className="p-2.5 text-center">متوسط المعدل</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {schoolsOverview.map(sch => (
                                    <tr key={sch.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all font-semibold text-slate-700">
                                      <td className="p-2.5 font-bold text-slate-900">{sch.name}</td>
                                      <td className="p-2.5 text-center font-mono font-bold text-indigo-700">{sch.usedCodes} / {sch.capacity}</td>
                                      <td className="p-2.5 text-center">
                                        <div className="flex items-center lg:justify-start justify-center gap-1.5">
                                          <span className="inline-block w-9 text-right font-mono font-bold text-slate-800">{sch.interactionRate}%</span>
                                          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                                            <div className="bg-indigo-600 h-full" style={{ width: `${sch.interactionRate}%` }} />
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-2.5 text-center">
                                        <div className="flex items-center lg:justify-start justify-center gap-1.5">
                                          <span className="inline-block w-9 text-right font-mono font-bold text-slate-850">{sch.curriculumCompletionRate}%</span>
                                          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                                            <div className="bg-amber-500 h-full" style={{ width: `${sch.curriculumCompletionRate}%` }} />
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-2.5 text-center font-mono font-bold text-slate-850">{sch.testAttempts}</td>
                                      <td className="p-2.5 text-center">
                                        <span className="bg-emerald-50 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded-full text-[10px]">
                                          {sch.avgScore} / 5
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })()}

                  {/* أ. المدارس والاشتراكات */}
                  {superAdminSubTab === 'schools' && (
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 border-slate-100 gap-4">
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm">🏫 إدارة الاشتراكات ومنظومة القبول الصفي للمحافظات والألوية</h3>
                          <p className="text-[10.5px] text-slate-500 mt-1 font-semibold">اضبط كفاءة المدرسة وقم بترقية الباقات للتراخيص الكلية للطلاب.</p>
                        </div>
                      </div>

                      {/* نموذج منسق واشتراكات المدرسة */}
                      {editingSchoolId && (
                        <div className="bg-slate-50 border border-indigo-100 rounded-2xl p-5 space-y-3 shadow-inner">
                          <h4 className="font-extrabold text-indigo-900 text-xs text-right">🛠️ تحرير باقة مدرسة: [ {schools.find(s=>s.id===editingSchoolId)?.name} ]</h4>
                          <form onSubmit={handleSaveSchoolSubscription} className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
                            <div className="space-y-1">
                              <label className="block font-bold text-slate-700">باقة الاشتراك المخصصة:</label>
                              <select
                                value={editingSchoolPlan}
                                onChange={(e)=>setEditingSchoolPlan(e.target.value)}
                                className="w-full bg-white border border-slate-200 outline-none p-2 rounded-lg"
                              >
                                <option value="free">🆓 مجاني تجريبي (Free Trial)</option>
                                <option value="silver">🥈 فضي موجه (Standard Silver)</option>
                                <option value="gold">🥇 ذهبي ممتاز (Premium Gold Partner)</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="block font-bold text-slate-700">سعة تسجيل الطلاب القصوى:</label>
                              <input
                                type="number"
                                required
                                value={editingSchoolCapacity}
                                onChange={(e)=>setEditingSchoolCapacity(Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 outline-none p-2 rounded-lg font-bold text-center"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block font-bold text-slate-700">رقم سري لدخول المدرسة 🔑:</label>
                              <input
                                type="text"
                                required
                                value={editingSchoolPassword}
                                onChange={(e)=>setEditingSchoolPassword(e.target.value)}
                                className="w-full bg-white border border-slate-200 outline-none p-2 rounded-lg font-bold text-center text-indigo-900 font-mono tracking-wider"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block font-bold text-slate-700">تاريخ انتهاء الترخيص:</label>
                              <input
                                type="date"
                                required
                                value={editingSchoolExpiry}
                                onChange={(e)=>setEditingSchoolExpiry(e.target.value)}
                                className="w-full bg-white border border-slate-200 outline-none p-2 rounded-lg font-mono text-center"
                              />
                            </div>
                            <div className="flex items-end gap-2">
                              <button type="submit" className="flex-1 py-2 bg-indigo-700 hover:bg-indigo-600 text-white font-extrabold rounded-lg cursor-pointer">حفظ 💾</button>
                              <button type="button" onClick={()=>setEditingSchoolId(null)} className="py-2 px-3 bg-slate-300 hover:bg-slate-250 text-slate-800 rounded-lg cursor-pointer">إلغاء</button>
                            </div>
                          </form>
                        </div>
                      )}

                      <div className="overflow-x-auto rounded-2xl border border-slate-100">
                        <table className="w-full text-xs text-right border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-extrabold">
                              <th className="p-3">المدرسة / الشعبة</th>
                              <th className="p-3 text-center">نوع الباقة</th>
                              <th className="p-3 text-center">الرقم السري للمدرسة 🔑</th>
                              <th className="p-3 text-center">سعة الأكواد</th>
                              <th className="p-3 text-center">الأكواد المنشأة</th>
                              <th className="p-3 text-center">الطلاب المسجلين</th>
                              <th className="p-3 text-center">تاريخ الصلاحية</th>
                              <th className="p-3 text-center">إجراءات المالك</th>
                            </tr>
                          </thead>
                          <tbody>
                            {schools.map(sch => {
                              const createdCodes = activationCodes.filter(c => c.school === sch.name);
                              const registeredCount = createdCodes.filter(c => c.status === 'used').length;
                              return (
                                <tr key={sch.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors font-semibold text-slate-700">
                                  <td className="p-3 font-extrabold text-slate-900">{sch.name}</td>
                                  <td className="p-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                      sch.plan === 'gold' ? 'bg-amber-100 text-amber-800' :
                                      sch.plan === 'silver' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                      {sch.plan === 'gold' ? '🏆 ذهبي شريك' : sch.plan === 'silver' ? '⭐ فضي معياري' : '🆓 تجريبي مجاني'}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className="bg-indigo-50/70 border border-indigo-100 text-indigo-950 font-mono font-black px-2.5 py-1 rounded-xl text-xs tracking-wide">
                                      {sch.password || "غير معين"}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center font-mono font-bold">{sch.capacity || 50} طالب</td>
                                  <td className="p-3 text-center font-mono text-indigo-700 font-bold">{createdCodes.length} كود</td>
                                  <td className="p-3 text-center font-mono text-teal-700 font-bold">{registeredCount} طالب نشط</td>
                                  <td className="p-3 text-center font-mono text-xs">{sch.expireDate || "2026-06-30"}</td>
                                  <td className="p-3 text-center space-x-1.5 space-x-reverse">
                                    <button
                                      onClick={() => {
                                        setEditingSchoolId(sch.id);
                                        setEditingSchoolPlan(sch.plan || 'free');
                                        setEditingSchoolCapacity(sch.capacity || 50);
                                        setEditingSchoolExpiry(sch.expireDate || '2026-06-30');
                                        setEditingSchoolPassword(sch.password || '');
                                      }}
                                      className="py-1 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold cursor-pointer"
                                    >
                                      🖊️ ترقية الترخيص
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSchoolSuper(sch.id, sch.name)}
                                      className="py-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-bold cursor-pointer"
                                    >
                                      🗑️ إرساء الحذف
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* إضافة مدرسة جديدة */}
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                        <span className="font-extrabold text-slate-800 text-xs block mb-3">🏫 إلحاق وتسجيل مدرسة ثانوية أو شعبة جديدة للجمهورية:</span>
                        <form onSubmit={handleAddSchoolSuper} className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="text"
                            required
                            placeholder="مثال: ثانوية جمال دغار النموذجية بقسم الفيزياء..."
                            value={newSchoolName}
                            onChange={(e) => setNewSchoolName(e.target.value)}
                            className="bg-white border border-slate-200 outline-none rounded-xl p-3 text-xs flex-1 text-slate-800 font-bold"
                          />
                          <button
                            type="submit"
                            className="p-3 px-6 bg-indigo-700 hover:bg-indigo-650 text-white font-extrabold text-xs  rounded-xl shadow-lg cursor-pointer active:scale-95 transition-transform"
                          >
                            ➕ إيجاز وإلحاق المدرسة بالشعبة
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* ب. الكادر والمعلمين */}
                  {superAdminSubTab === 'teachers' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">👨‍🏫 كادر مجلس الموجهين ومعلمي العلوم المتكامل</h3>
                        <p className="text-[10.5px] text-slate-500 mt-1 font-semibold">بإمكانك توظيف معلمين منسقين للمدارس، تعليق صلاحيات التوجيه، أو رصد تقاريرهم الخاصة بلمسة واحدة.</p>
                      </div>

                      <div className="overflow-x-auto rounded-2xl border border-slate-100">
                        <table className="w-full text-xs text-right border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-extrabold">
                              <th className="p-3">اسم المعلم الموجه</th>
                              <th className="p-3">المدرسة الثانوية المرتبط بها</th>
                              <th className="p-3 text-center">اسم المستخدم لديه (للدخول)</th>
                              <th className="p-3 text-center">الرتبة التعليمية</th>
                              <th className="p-3 text-center">حالة الحساب</th>
                              <th className="p-3 text-center">الإجراءات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {teachers.map(teacher => {
                              const associatedSchool = schools.find(s => s.id === teacher.schoolId)?.name || 'عام بالمنصة';
                              return (
                                <tr key={teacher.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors font-semibold text-slate-700">
                                  <td className="p-3 font-extrabold text-slate-900">{teacher.name}</td>
                                  <td className="p-3">{associatedSchool}</td>
                                  <td className="p-3 text-center font-mono font-bold bg-slate-50 text-indigo-900 rounded">{teacher.username}</td>
                                  <td className="p-3 text-center text-[10px] font-bold text-amber-700">👨‍🏫 مشرف موجه وطني</td>
                                  <td className="p-3 text-center">
                                    <button
                                      onClick={() => handleToggleTeacherStatusSuper(teacher.id)}
                                      className={`px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer ${
                                        teacher.status === 'suspended' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                                      }`}
                                    >
                                      {teacher.status === 'suspended' ? '🚫 معلق وموقوف للطلب' : '🟢 نشط ومصرح له'}
                                    </button>
                                  </td>
                                  <td className="p-3 text-center">
                                    <button
                                      onClick={() => handleDeleteTeacherSuper(teacher.id, teacher.name)}
                                      className="py-1 px-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-bold cursor-pointer"
                                    >
                                      🗑️ عزل التربوي
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* إضافة معلم جديد لوظيفة الموجه */}
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                        <span className="font-extrabold text-slate-800 text-xs block border-b pb-2">👨‍🏫 تفويض وتوظيف معلم موجه جديد للمنظومة:</span>
                        <form onSubmit={handleAddTeacherSuper} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                          <div className="space-y-1">
                            <label className="block font-bold text-slate-700">أولاً: الاسم الثلاثي واللقب للمعلم:</label>
                            <input
                              type="text"
                              required
                              placeholder="أ. سياف محمد عبد الله..."
                              value={adminTeacherName}
                              onChange={(e)=>setAdminTeacherName(e.target.value)}
                              className="w-full bg-white border border-slate-200 outline-none p-2.5 rounded-lg text-slate-800 font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block font-bold text-slate-700">ثانياً: المدرسة التثقيفية الملحق بها:</label>
                            <select
                              required
                              value={adminTeacherSchoolId}
                              onChange={(e) => setAdminTeacherSchoolId(e.target.value)}
                              className="w-full bg-white border border-slate-200 outline-none p-2.5 rounded-lg font-bold text-slate-800"
                            >
                              <option value="">-- اختر مدرسة --</option>
                              {schools.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="block font-bold text-slate-700">ثالثاً: اسم المستخدم لدخول المعلم:</label>
                            <input
                              type="text"
                              required
                              placeholder="مثال: master_sayyaf..."
                              value={adminTeacherUsername}
                              onChange={(e)=>setAdminTeacherUsername(e.target.value)}
                              className="w-full bg-white border border-slate-200 outline-none p-2.5 rounded-lg text-slate-800 font-bold"
                            />
                          </div>

                          <div className="flex items-end gap-2">
                            <button type="submit" className="w-full py-2.5 bg-indigo-700 hover:bg-indigo-650 text-white font-extrabold rounded-lg cursor-pointer text-xs">➕ تفويض المعلم</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* ج. إدارة نظام تراخيص تفعيل الطلاب المتقدم (المالك العام) */}
                  {superAdminSubTab === 'codes' && (() => {
                    const filteredCodes = activationCodes.filter(c => {
                      const matchSearch = c.code.toLowerCase().includes(codesSearchTerm.toLowerCase()) || 
                                          c.school.toLowerCase().includes(codesSearchTerm.toLowerCase());
                      const matchSchool = codesSchoolFilter === 'all' || c.school === codesSchoolFilter;
                      const matchStatus = codesStatusFilter === 'all' || c.status === codesStatusFilter;
                      return matchSearch && matchSchool && matchStatus;
                    });

                    return (
                      <div className="space-y-6 animate-fade-in text-right" dir="rtl">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 border-slate-100 gap-4">
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                              <span className="text-xl">🔑</span>
                              <span>نظام رموز تفعيل الطلاب وقبول صرح التراخيص السيادي</span>
                            </h3>
                            <p className="text-[10.5px] text-slate-500 mt-1 font-semibold">بصفتك المالك العام (الأستاذ سياف)، يرجى إدارة تراخيص الانتساب للمقررات، تعديل فتراتها، أو تعطيلها وحذفها.</p>
                          </div>
                        </div>

                        {/* أدوات توليد عتاد التراخيص: كود فردي أم باقة جماعية */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          
                          {/* 1. التوليد الفردي والتحكم */}
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
                            <span className="block text-xs font-black text-indigo-900 border-b border-indigo-100/40 pb-1.5 flex items-center gap-1.5">
                              <span>✨ توليد ترخيص فردي مخصص:</span>
                            </span>
                            <form onSubmit={handleGenerateCode} className="space-y-3.5 text-xs">
                              <div className="space-y-1">
                                <label className="block text-slate-600 font-bold">ربط الكود بمدرسة:</label>
                                <select
                                  value={newCodeSchool}
                                  onChange={(e) => setNewCodeSchool(e.target.value)}
                                  required
                                  className="w-full bg-white border border-slate-250 p-2 rounded-lg outline-none font-bold"
                                >
                                  <option value="">-- حدد المدرسة --</option>
                                  {schools.map(sch => (
                                    <option key={sch.id} value={sch.name}>{sch.name}</option>
                                  ))}
                                  <option value="التعليم الذاتي والثانوية الخارجية">التعليم الذاتي والثانوية الخارجية</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="block text-slate-600 font-bold">اسم الكود مخصص (اختياري - اتركه لتوليد تلقائي):</label>
                                <input
                                  type="text"
                                  placeholder="مثال: SAYYAF_PASS_992"
                                  value={codeGenCustom}
                                  onChange={(e) => setCodeGenCustom(e.target.value)}
                                  className="w-full bg-white border border-slate-250 p-2 rounded-lg outline-none text-center font-bold font-mono tracking-wider"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="block text-slate-600 font-bold">حد الأجهزة الأقصى:</label>
                                  <input
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={codeGenDeviceLimit}
                                    onChange={(e) => setCodeGenDeviceLimit(Number(e.target.value))}
                                    className="w-full bg-white border border-slate-250 p-1.5 rounded-lg text-center font-black"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="block text-slate-600 font-bold">تاريخ الانتهاء:</label>
                                  <input
                                    type="date"
                                    value={codeGenExpire}
                                    onChange={(e) => setCodeGenExpire(e.target.value)}
                                    className="w-full bg-white border border-slate-250 p-1.5 rounded-lg text-center font-mono font-bold"
                                  />
                                </div>
                              </div>

                              <button
                                type="submit"
                                className="w-full py-2.5 bg-indigo-700 hover:bg-indigo-650 text-white rounded-xl font-bold shadow-md cursor-pointer transition-all"
                              >
                                توليد كود مخصص فريد 🔑
                              </button>
                            </form>
                          </div>

                          {/* 2. التوليد الكمي (Batch Generate) */}
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm lg:col-span-2">
                            <span className="block text-xs font-black text-indigo-900 border-b border-indigo-100/40 pb-1.5">
                              🚀 توليد كمي وتصدير حزم التراخيص المباشرة (Batch):
                            </span>
                            <form onSubmit={handleBatchGenerateCodesSuper} className="space-y-3 text-xs">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="block text-slate-600 font-bold">المدرسة الحاضنة لتوليد الحزمة:</label>
                                  <select
                                    value={newCodeSchool}
                                    onChange={(e) => setNewCodeSchool(e.target.value)}
                                    required
                                    className="w-full bg-white border border-slate-250 p-2.5 rounded-lg outline-none font-bold"
                                  >
                                    <option value="">-- حدد المدرسة --</option>
                                    {schools.map(sch => (
                                      <option key={sch.id} value={sch.name}>{sch.name}</option>
                                    ))}
                                    <option value="التعليم الذاتي والثانوية الخارجية">التعليم الذاتي والثانوية الخارجية</option>
                                  </select>
                                </div>

                                <div className="space-y-1">
                                  <label className="block text-slate-600 font-bold">الكمية المراد توليدها دفعة واحدة:</label>
                                  <input
                                    type="number"
                                    required
                                    min={1}
                                    max={200}
                                    placeholder="بين 1 و 200 كود..."
                                    value={batchCountInput}
                                    onChange={(e) => setBatchCountInput(e.target.value)}
                                    className="w-full bg-white border border-slate-250 p-2.5 rounded-lg outline-none font-black text-center"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="block text-slate-600 font-bold">الحد الأقصى للأجهزة (لكل كود بالحزمة):</label>
                                  <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={codeGenDeviceLimit}
                                    onChange={(e) => setCodeGenDeviceLimit(Number(e.target.value))}
                                    className="w-full bg-white border border-slate-250 p-2 rounded-lg text-center font-black"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="block text-slate-600 font-bold">تاريخ صلاحية انتهاء الحزمة الكلي:</label>
                                  <input
                                    type="date"
                                    value={codeGenExpire}
                                    onChange={(e) => setCodeGenExpire(e.target.value)}
                                    className="w-full bg-white border border-slate-250 p-2 rounded-lg text-center font-mono font-bold"
                                  />
                                </div>
                              </div>

                              <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200">
                                <span className="block text-[10.5px] leading-relaxed text-amber-900 font-bold">
                                  ⚠️ تنبيه ترخيص: سيمتلك الطلاب المولدة أكوادهم نفس الصلاحيات لرفع كفاءة تتبع المناهج. تضمن آلية التوليد عدم تكرار الأكواد في الصروح محلياً.
                                </span>
                              </div>

                              <button
                                type="submit"
                                className="w-full py-2.5 bg-indigo-950 hover:bg-slate-900 border border-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow"
                              >
                                تشغيل معالج التوليد الكمي وتخزين الحزمة ⚡
                              </button>
                            </form>
                          </div>

                        </div>

                        {/* أدوات البحث والفلاتر والطباعة الجماعية */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-4">
                          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                            <span className="font-extrabold text-xs text-indigo-950">🔍 فلاتر كشف التراخيص والأكواد:</span>
                            <button
                              type="button"
                              onClick={() => {
                                const printWindow = window.open('', '_blank');
                                if (printWindow) {
                                  printWindow.document.write(`
                                    <html>
                                      <head>
                                        <title>جميع أكواد تفعيل وتراخيص الطلاب للطباعة</title>
                                        <style>
                                          body { font-family: system-ui, sans-serif; text-align: center; direction: rtl; padding: 20px; }
                                          .grid-container { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; }
                                          .card { border: 2px dashed #312e81; border-radius: 16px; padding: 15px; text-align: center; background: #fff; }
                                          .title { font-size: 14px; font-weight: bold; color: #1e1b4b; }
                                          .code-val { font-size: 20px; font-weight: 900; background: #f3f4f6; padding: 6px; margin: 10px 0; font-family: monospace; border-radius: 8px; letter-spacing: 1.5px; }
                                          img { width: 110px; height: 110px; margin: 5px auto; display: block; }
                                          .meta-p { font-size: 10.5px; color: #4b5563; margin: 3px 0; }
                                          .noprint { background: #312e81; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-bottom: 20px; }
                                          @media print { .noprint { display: none; } }
                                        </style>
                                      </head>
                                      <body>
                                        <button class="noprint" onclick="window.print()">طباعة كافة الأكواد المفلترة دفعة واحدة 🖨️</button>
                                        <div class="grid-container">
                                          ${filteredCodes.map(c => `
                                            <div class="card">
                                              <div class="title">منصة الأستاذ سياف الشباطي للفيزياء 🌌</div>
                                              <div class="code-val">${c.code}</div>
                                              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(c.code)}" alt="QR" />
                                              <div class="meta-p">🏫 <b>المدرسة:</b> ${c.school}</div>
                                              <div class="meta-p">📱 <b>الحد الأقصى للأجهزة:</b> ${c.deviceLimit} أجهزة</div>
                                              <div class="meta-p">⏳ <b>تاريخ الانتهاء:</b> ${c.expireAt}</div>
                                            </div>
                                          `).join('')}
                                        </div>
                                      </body>
                                    </html>
                                  `);
                                  printWindow.document.close();
                                }
                              }}
                              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>🖨️ طباعة كافة الأكواد المفلترة حالياً ({filteredCodes.length} كود)</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input
                              type="text"
                              value={codesSearchTerm}
                              onChange={(e) => setCodesSearchTerm(e.target.value)}
                              placeholder="🔍 ابحث في الكود أو المدرسة..."
                              className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-xs"
                            />

                            <select
                              value={codesSchoolFilter}
                              onChange={(e) => setCodesSchoolFilter(e.target.value)}
                              className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-700 text-xs font-bold"
                            >
                              <option value="all">🏫 جميع المدارس والشعب</option>
                              {Array.from(new Set(activationCodes.map(c => c.school))).map((sch, i) => (
                                <option key={i} value={sch}>{sch}</option>
                              ))}
                            </select>

                            <select
                              value={codesStatusFilter}
                              onChange={(e) => setCodesStatusFilter(e.target.value)}
                              className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-700 text-xs font-bold"
                            >
                              <option value="all">📶 جميع الحالات للترخيص</option>
                              <option value="active">🟢 أكواد فعالة / نشطة</option>
                              <option value="used">👤 أكواد تم تفعيلها واستعمالها</option>
                              <option value="stopped">⏸️ أكواد موقوفة مؤقتاً</option>
                            </select>
                          </div>
                        </div>

                        {/* جدول الأكواد الاحترافي الفائق */}
                        <div className="overflow-x-auto rounded-2xl border border-slate-100">
                          <table className="w-full text-right border-collapse text-xs">
                            <thead>
                              <tr className="bg-indigo-950 text-white border-b border-indigo-900 font-extrabold">
                                <th className="p-3 text-center">م</th>
                                <th className="p-3 text-right">الكود الفريد للترخيص</th>
                                <th className="p-3 text-center">رمز QR</th>
                                <th className="p-3 text-right">المدرسة الثانوية المرتبطة</th>
                                <th className="p-3 text-center">حد الأجهزة الأقصى</th>
                                <th className="p-3 text-center font-bold">الأجهزة المسجلة</th>
                                <th className="p-3 text-center">تاريخ الإنشاء / الانتهاء</th>
                                <th className="p-3 text-center">حالة الترخيص</th>
                                <th className="p-3 text-center">إجراءات المالك العام</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredCodes.map((c, index) => {
                                const activeDevicesUsed = c.devicesUsed || [];
                                const totalLimitDevice = c.deviceLimit || 1;
                                const qrUrlThumb = `https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(c.code)}`;
                                
                                return (
                                  <tr key={index} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors font-semibold text-slate-750">
                                    <td className="p-3 text-center font-bold text-slate-450">{index + 1}</td>
                                    <td className="p-3 text-right">
                                      <span className="font-mono font-black text-indigo-950 tracking-wider bg-indigo-50 px-2.2 py-0.8 rounded text-xs select-all">
                                        {c.code}
                                      </span>
                                    </td>
                                    <td className="p-2 text-center">
                                      <div className="relative group inline-block">
                                        <img
                                          src={qrUrlThumb}
                                          alt="QR"
                                          className="w-10 h-10 mx-auto rounded border border-slate-200 bg-white p-0.5 pointer-events-none"
                                        />
                                        <div className="absolute hidden group-hover:block bottom-12 left-1/2 transform -translate-x-1/2 bg-white p-2.5 rounded-2xl border border-indigo-100 shadow-2xl z-45">
                                          <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(c.code)}`}
                                            alt="Large QR"
                                            className="w-28 h-28"
                                          />
                                          <span className="block text-[9px] text-indigo-900 font-bold mt-1 text-center">رابط تفعيل فوري</span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-3 text-right font-extrabold text-slate-900">{c.school}</td>
                                    <td className="p-3 text-center font-mono font-black text-slate-800">{totalLimitDevice} حد</td>
                                    <td className="p-3 text-center">
                                      <div className="flex flex-col items-center">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black ${
                                          activeDevicesUsed.length >= totalLimitDevice 
                                            ? 'bg-rose-100 text-rose-800' 
                                            : activeDevicesUsed.length > 0 
                                              ? 'bg-amber-100 text-amber-800' 
                                              : 'bg-slate-100 text-slate-500'
                                        }`}>
                                          {activeDevicesUsed.length} / {totalLimitDevice} مسجل
                                        </span>
                                      </div>
                                    </td>
                                    <td className="p-3 text-center leading-relaxed">
                                      <div className="font-mono text-[10px] text-slate-400">إنشاء: {c.createdAt}</div>
                                      <div className="font-mono text-[10.5px] font-bold text-rose-600">انتهاء: {c.expireAt}</div>
                                    </td>
                                    <td className="p-3 text-center">
                                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                                        c.status === 'active' 
                                          ? 'bg-emerald-100 text-emerald-850' 
                                          : c.status === 'stopped'
                                            ? 'bg-rose-100 text-rose-800'
                                            : 'bg-indigo-100 text-indigo-850'
                                      }`}>
                                        {c.status === 'active' ? '🟢 فعال / نشط' : c.status === 'stopped' ? '⏸️ موقوف مؤقتاً' : `👤 مستعمل`}
                                      </span>
                                    </td>
                                    <td className="p-3 text-center">
                                      <div className="inline-flex gap-1.5 justify-center">
                                        {/* زر الطباعة الفردية */}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const printWindow = window.open('', '_blank');
                                            if (printWindow) {
                                              const bigQr = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(c.code)}`;
                                              printWindow.document.write(`
                                                <html>
                                                  <head>
                                                    <title>بطاقة تفعيل للطباعة - ${c.code}</title>
                                                    <style>
                                                      body { font-family: system-ui, sans-serif; text-align: center; direction: rtl; padding: 40px; }
                                                      .card { border: 4px dashed #4f46e5; border-radius: 24px; padding: 30px; max-width: 420px; margin: 0 auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                                                      h1 { font-size: 19px; color: #1e1b4b; margin-bottom: 2px; }
                                                      .sub { color: #6b7280; font-size: 12px; margin-bottom: 20px; }
                                                      .code-txt { font-size: 24px; font-weight: 900; color: #4f46e5; background: #e0e7ff; padding: 10px; border-radius: 12px; font-family: monospace; letter-spacing: 2px; }
                                                      img { width: 180px; height: 180px; margin: 15px auto; display: block; border-radius: 12px; }
                                                      .info-grid { border-top: 1px solid #f3f4f6; padding-top: 15px; margin-top: 15px; text-align: right; font-size: 12px; color: #374151; }
                                                      .btn { background: #4f46e5; color: white; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; border: none; margin-top: 20px; }
                                                      @media print { .btn { display: none; } }
                                                    </style>
                                                  </head>
                                                  <body>
                                                    <div class="card">
                                                      <h1>بطاقة ترخيص الانتساب للمقرر 🔬</h1>
                                                      <div class="sub">تحت إشراف الأستاذ القدير: سياف الشباطي للفيزياء المطور 2026</div>
                                                      <div class="code-txt">${c.code}</div>
                                                      <img src="${bigQr}" alt="QR" />
                                                      <div class="info-grid">
                                                        <div style="margin: 5px 0;">🏫 <b>المدرسة الحاضنة:</b> ${c.school}</div>
                                                        <div style="margin: 5px 0;">📱 <b>سعة التمكين:</b> ${totalLimitDevice} جهاز / طالب</div>
                                                        <div style="margin: 5px 0;">⏳ <b>صالح لغاية تاريخ:</b> ${c.expireAt}</div>
                                                      </div>
                                                      <button class="btn" onclick="window.print()">طباعة البطاقة الملونة 🖨️</button>
                                                    </div>
                                                  </body>
                                                </html>
                                              `);
                                              printWindow.document.close();
                                            }
                                          }}
                                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-black cursor-pointer text-[10px]"
                                          title="طباعة بطاقة الترخيص"
                                        >
                                          🖨️ طباعة
                                        </button>

                                        {/* زر تحرير وتعديل معطيات الكود */}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingCode(c);
                                            setEditCodeSchool(c.school);
                                            setEditCodeDeviceLimit(totalLimitDevice);
                                            setEditCodeExpire(c.expireAt);
                                            setEditCodeStatus(c.status);
                                          }}
                                          className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded font-black cursor-pointer text-[10px]"
                                        >
                                          🖊️ تعديل
                                        </button>

                                        {/* إيقاف وتوقيف الترخيص */}
                                        <button
                                          type="button"
                                          onClick={() => handleToggleCodeStatus(c.code)}
                                          className={`px-2 py-1 rounded font-black cursor-pointer text-[10px] ${
                                            c.status === 'stopped' 
                                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                              : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                                          }`}
                                          title={c.status === 'stopped' ? "تنشيط الكود" : "تعطيل الكود"}
                                        >
                                          {c.status === 'stopped' ? '▶️ تشغيل' : '⏸️ تعطيل'}
                                        </button>

                                        {/* حذف الترخيص نهائياً كود فريد */}
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteCode(c.code)}
                                          className="p-1 px-2.2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-250 rounded font-bold cursor-pointer text-[10px]"
                                          title="إزالة وإقصاء الترخيص"
                                        >
                                          🗑️
                                        </button>
                                       </div>
                                    </td>
                                  </tr>
                                );
                              })}
                              {filteredCodes.length === 0 && (
                                <tr>
                                  <td colSpan={9} className="p-8 text-center text-slate-400 italic font-bold">📭 لم نعثر على أي تراخيص مطابقة لمعطيات الرصد والتصفية الحالية.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                      </div>
                    );
                  })()}

                  {/* د. إعدادات المنصة الكبرى للمالك العام */}
                  {superAdminSubTab === 'settings' && (
                    <div className="space-y-6 animate-fade-in text-right">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">⚙️ محيط ضبط السيادة وإعدادات المنصة الكبرى</h3>
                        <p className="text-[10.5px] text-slate-500 mt-1 font-semibold">بإمكانك تغيير كلمات المرور السيادية وضبط عتاد الحفظ والأمان العام للأنظمة.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* تعديل الأمان وكلمات المرور السيادية */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                          <span className="font-black text-xs text-indigo-950 block border-b pb-2">🔑 تعديل كلمة المرور الخاصة بالمالك العام:</span>
                          <div className="space-y-3.5 text-xs">
                            <div className="space-y-1">
                              <label className="block text-slate-600 font-bold">كلمة المرور الحالية أو كلمة المرور المطورة المقترحة:</label>
                              <input
                                type="text"
                                value={platformSettings.superAdminPassword}
                                onChange={(e) => setPlatformSettings(prev => ({ ...prev, superAdminPassword: e.target.value }))}
                                className="w-full bg-white border border-slate-250 p-2.5 rounded-xl font-mono font-black text-center text-indigo-900 tracking-wider text-sm"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                alert("🔒 تم تحديث وحماية كلمة مرور المالك بنجاح!");
                              }}
                              className="w-full py-2.5 bg-indigo-700 hover:bg-indigo-650 text-white rounded-xl font-bold cursor-pointer"
                            >
                              تأكيد تحديث كلمة مرور المالك 💾
                            </button>
                          </div>
                        </div>

                        {/* ضبط معايير الاشتراك السياسية */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                          <span className="font-black text-xs text-indigo-950 block border-b pb-2">📂 إحصائيات عامة وضوابط المنظومة العامة:</span>
                          <div className="space-y-3 text-xs text-slate-700">
                            <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100">
                              <span className="font-bold">إجمالي المدارس المقترنة:</span>
                              <span className="font-black text-indigo-900 font-mono text-xs">{schools.length} صروح مسجلة</span>
                            </div>
                            <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100">
                              <span className="font-bold">إجمالي التراخيص المصدرة:</span>
                              <span className="font-black text-indigo-900 font-mono text-xs">{activationCodes.length} رخصة طلاب</span>
                            </div>
                            <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100">
                              <span className="font-bold">إجمالي رصد كشوفات الطلاب:</span>
                              <span className="font-black text-indigo-900 font-mono text-xs">{scores.length} كشف امتحاني</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("⚠️ تنبيه خطير للغاية! هل أنت متأكد من لزوم فرمتة جميع التراخيص وإرجاع المنصة للإصدار الأصلي؟")) {
                                  localStorage.removeItem('sayyaf_activation_codes');
                                  window.location.reload();
                                }
                              }}
                              className="w-full py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl font-bold font-black text-[10px] text-center cursor-pointer"
                            >
                              🚨 تهيئة وتصفير الأكواد وإرجاع البيانات الافتراضية الأصلية
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* هـ. شاشة البحث الذكي الموحد ومستكشف الأرقام السرية */}
                  {superAdminSubTab === 'search' && (() => {
                    const query = unifiedSearchQuery.trim().toLowerCase();

                    // 1. تصفية المدارس
                    const filteredSchools = query 
                      ? schools.filter(s => s.name.toLowerCase().includes(query) || (s.plan && s.plan.toLowerCase().includes(query)))
                      : [];

                    // 2. تصفية المعلمين
                    const filteredTeachers = query
                      ? teachers.filter(t => t.name.toLowerCase().includes(query) || (t.username && t.username.toLowerCase().includes(query)) || (t.phone && t.phone.includes(query)))
                      : [];

                    // 3. تصفية الطلاب والحسابات المباشرة
                    const filteredSts = query
                      ? studentAccounts.filter(s => s.name.toLowerCase().includes(query) || s.username.toLowerCase().includes(query))
                      : [];

                    // 4. تصفية الأكواد التنشيطية والأرقام السرية
                    const filteredCodes = query
                      ? activationCodes.filter(c => c.code.toLowerCase().includes(query) || (c.usedBy && c.usedBy.toLowerCase().includes(query)) || c.school.toLowerCase().includes(query))
                      : [];

                    // 5. تصفية الشعب من خلال الدروس المشتركة
                    const allUniqueClasses = Array.from(new Set(scores.map(s => JSON.stringify({ school: s.school, class: s.classGroup || "الشعبة أ" }))))
                      .map((json: string) => JSON.parse(json) as { school: string; class: string });
                    
                    const filteredClasses = query
                      ? allUniqueClasses.filter(c => c.class.toLowerCase().includes(query) || c.school.toLowerCase().includes(query))
                      : [];

                    const hasResults = filteredSchools.length > 0 || filteredTeachers.length > 0 || filteredSts.length > 0 || filteredCodes.length > 0 || filteredClasses.length > 0;

                    return (
                      <div className="space-y-6 animate-fade-in text-right" dir="rtl">
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                            🔍 Complex Smart Search Engine | محرك البحث الشامل ومستكشف الأرقام السرية 🇾🇪
                          </h3>
                          <p className="text-[10.5px] text-slate-500 mt-1 font-semibold">
                            ابحث باسم الطالب، المعلم، الشعبة، صرح المدرسة، أو اكتب أي <strong>رقم سري / كود تفعيل</strong> لتعقب حالته، المستخدم المرتبط به، الصلاحيات ونوع الحساب على الفور.
                          </p>
                        </div>

                        {/* شريط الإدخال الرئيسي */}
                        <div className="relative">
                          <input 
                            type="text"
                            placeholder="اكتب كلمة البحث هنا (SAYYAF-، ثانوية، أحمد، الشعبة ب)..."
                            value={unifiedSearchQuery}
                            onChange={(e) => setUnifiedSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-200 text-slate-850 pr-10 pl-4 py-3 rounded-2xl text-xs font-black outline-hidden focus:border-indigo-505 bg-white transition-all shadow-inner"
                          />
                          <div className="absolute top-1/2 right-3.5 -translate-y-1/2 text-slate-400">
                            🔍
                          </div>
                        </div>

                        {query ? (
                          hasResults ? (
                            <div className="space-y-6">

                              {/* نتائج الأكواد والأرقام السرية */}
                              {filteredCodes.length > 0 && (
                                <div className="space-y-3">
                                  <h4 className="text-xs font-black text-amber-600 border-r-4 border-amber-500 pr-2">🔑 أرقام التراخيص والأكواد السرية المطابقة ({filteredCodes.length}):</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredCodes.map((c, i) => {
                                      const statusText = c.status === 'used' ? 'مستعمل مفعّل' : c.status === 'stopped' ? 'معطل وموقوف' : 'نشط (غير مستخدم مسبقاً)';
                                      return (
                                        <div key={i} className="bg-gradient-to-l from-slate-900 via-slate-950 to-indigo-950 text-white rounded-2xl p-4.5 border border-amber-500/30 shadow-sm relative overflow-hidden">
                                          <div className="absolute top-2 left-2 bg-amber-500/10 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded-full font-black border border-amber-500/20">
                                            ترخيص المنفذ
                                          </div>
                                          <div className="space-y-2 mt-2 font-sans text-right">
                                            <span className="block text-sm font-black text-amber-400 font-mono tracking-wider">{c.code}</span>
                                            <div className="grid grid-cols-2 gap-2 text-[10.5px] text-slate-300">
                                              <div>
                                                <strong className="text-slate-400">نوع الحساب:</strong> كود تفعيل طالب
                                              </div>
                                              <div>
                                                <strong className="text-slate-400">المدرسة:</strong> {c.school}
                                              </div>
                                              <div>
                                                <strong className="text-slate-400">تاريخ الإصدار:</strong> {c.createdAt}
                                              </div>
                                              <div>
                                                <strong className="text-slate-400">انتهاء الصلاحية:</strong> {c.expireAt}
                                              </div>
                                            </div>
                                            <div className="border-t border-slate-850 pt-2 flex items-center justify-between text-[11px]">
                                              <span className={`inline-flex items-center gap-1 font-bold ${c.status === 'used' ? 'text-emerald-400' : c.status === 'stopped' ? 'text-rose-400' : 'text-cyan-400'}`}>
                                                ● {statusText}
                                              </span>
                                              <span className="text-xs font-black text-slate-100">
                                                المستخدم: <strong className="text-teal-300 font-black">{c.usedBy || 'شاغر / متاح للتسجيل'}</strong>
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* نتائج الطلاب وحساباتهم */}
                              {filteredSts.length > 0 && (
                                <div className="space-y-3">
                                  <h4 className="text-xs font-black text-indigo-900 border-r-4 border-indigo-700 pr-2">👥 الطلاب والحسابات المدرسية المباشرة ({filteredSts.length}):</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredSts.map((s, i) => (
                                      <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                                        <div className="flex justify-between items-center pb-2 border-b">
                                          <span className="font-extrabold text-slate-900 text-xs">{s.name}</span>
                                          <span className="bg-indigo-100 text-indigo-850 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold">{s.classGroup}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1.5 text-[10.5px] text-slate-600">
                                          <div><strong>اسم المستخدم:</strong> <span className="font-mono font-bold text-indigo-950">{s.username}</span></div>
                                          <div><strong>الرقم السري:</strong> <span className="font-mono text-indigo-700 font-black">{s.password || 'غير محدد'}</span></div>
                                          <div className="col-span-2"><strong>المدرسة:</strong> {s.schoolName}</div>
                                          <div className="col-span-2"><strong>حالة الاشتراك:</strong> <span className={s.status === 'active' ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold'}>{s.status === 'active' ? 'نشط فعال' : 'معلق / موقوف'}</span></div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* نتائج المعلمين */}
                              {filteredTeachers.length > 0 && (
                                <div className="space-y-3">
                                  <h4 className="text-xs font-black text-emerald-850 border-r-4 border-emerald-600 pr-2">👨‍🏫 كادر المعلمين والموجهين المطابق ({filteredTeachers.length}):</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredTeachers.map((t, i) => {
                                      const sch = schools.find(s => s.id === t.schoolId);
                                      return (
                                        <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                                          <div className="flex justify-between items-center pb-2 border-b">
                                            <span className="font-extrabold text-slate-900 text-xs">{t.name}</span>
                                            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold">{t.subject || 'الفيزياء المنهجية'}</span>
                                          </div>
                                          <div className="grid grid-cols-2 gap-1.5 text-[10.5px] text-slate-600">
                                            <div><strong>اسم المستخدم (المرور):</strong> <span className="font-mono text-indigo-700 font-black">{t.username || t.password}</span></div>
                                            <div><strong>حالة العمل:</strong> <span className={t.status === 'suspended' ? 'text-rose-600' : 'text-emerald-600 font-bold'}>{t.status === 'suspended' ? 'معلق ومجمد' : 'نشط وفعال بالميدان'}</span></div>
                                            <div className="col-span-2"><strong>المدرسة المقترن بها:</strong> {sch ? sch.name : 'إدارة الوزارة الكبرى'}</div>
                                            {t.phone && <div className="col-span-2"><strong>رقم الهاتف:</strong> <span className="font-mono">{t.phone}</span></div>}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* نتائج المدارس */}
                              {filteredSchools.length > 0 && (
                                <div className="space-y-3">
                                  <h4 className="text-xs font-black text-cyan-800 border-r-4 border-cyan-300 pr-2">🏫 المدارس المترشحة والمطابقة ({filteredSchools.length}):</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredSchools.map((s, i) => {
                                      const schoolScores = scores.filter(sc => sc.school === s.name);
                                      return (
                                        <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                                          <div className="flex justify-between items-center pb-2 border-b">
                                            <span className="font-extrabold text-indigo-950 text-xs">{s.name}</span>
                                            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase">{s.plan || 'silver'}</span>
                                          </div>
                                          <div className="grid grid-cols-2 gap-1.5 text-[10.5px] text-slate-600">
                                            <div><strong>سعة الترخيص:</strong> {s.capacity || 50} طالب</div>
                                            <div><strong>الامتحانات المصححة:</strong> {schoolScores.length} امتحان</div>
                                            <div><strong>باسوورد المنسق الكلي:</strong> <span className="font-mono text-amber-600 font-bold">{s.password || 'SCHOOL_SECURE'}</span></div>
                                            <div><strong>انتهاء الترخيص:</strong> <span className="font-mono">{s.expireDate || '2027-12-31'}</span></div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* نتائج الشعب */}
                              {filteredClasses.length > 0 && (
                                <div className="space-y-3">
                                  <h4 className="text-xs font-black text-rose-800 border-r-4 border-rose-600 pr-2">📢 الشُعب والفصول المكتشفة ({filteredClasses.length}):</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredClasses.map((c, i) => {
                                      const classScores = scores.filter(s => s.school === c.school && (s.classGroup || "الشعبة أ") === c.class);
                                      const classSts = Array.from(new Set(classScores.map(sc => sc.name)));
                                      const totalScoreSum = classScores.reduce((sum, s) => sum + (parseInt(s.score) || 0), 0);
                                      const avg = classScores.length > 0 ? (totalScoreSum / classScores.length).toFixed(1) : "0.0";
                                      return (
                                        <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1.5 text-xs">
                                          <div className="flex justify-between items-center pb-1.5 border-b">
                                            <span className="font-extrabold text-slate-900">{c.class}</span>
                                            <span className="text-indigo-600 font-black">المعدل: {avg} / 5</span>
                                          </div>
                                          <div className="text-[10.5px] text-slate-500 space-y-1 text-right">
                                            <p className="truncate"><strong>الصرح التعليمي:</strong> {c.school}</p>
                                            <div className="flex justify-between">
                                              <span>👥 الطلاب الممتحنين: {classSts.length} طالب</span>
                                              <span>📄 الأوراق: {classScores.length}</span>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                            </div>
                          ) : (
                            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-250 text-slate-400">
                              <span className="block text-2xl mb-2">🔍</span>
                              <p className="text-xs font-bold text-slate-600">عذرًا، لم يتم العثور على أي كود تفعيل أو طالب أو مدرسة مطابقة لهذه العبارة.</p>
                              <p className="text-[10px] text-slate-400 mt-1">تأكد من كتابة الرقم السري بدقة أو التهجئة الصحيحة للاسم.</p>
                            </div>
                          )
                        ) : (
                          <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-450">
                            <span className="block text-3xl mb-3">🏷️</span>
                            <p className="text-xs font-extrabold leading-relaxed text-indigo-950">أدخل أي كلمة بحث أو كود تفعيل في الحقل بالأعلى للبدء في تعقبه فوريًا.</p>
                            <p className="text-[10px] text-slate-400 mt-1">يبحث المحرك الموحد الذكي في {schools.length} مدارس، {teachers.length} معلمين، {activationCodes.length} أكواد تفعيل، و {scores.length} كشوف علامات ومستندات سرية.</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* و. سجل نشاطات وعمليات المنظومة الفورية */}
                  {superAdminSubTab === 'logs' && (
                    <div className="space-y-6 animate-fade-in text-right">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                            📜 السجل السيادي لنشاط المنظومة (Operations & Security Audit Log)
                          </h3>
                          <p className="text-[10.5px] text-slate-500 mt-1 font-semibold">
                            رصد حي وموثّق لعمليات تسجيل الدخول، إصدار تراخيص الأستاذ سياف، تعديل الخطط وبطاقتي المعلم والتعلم الفعالة بالثواني.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => {
                              if (confirm("هل أنت متأكد من تصفير سجلات حماية الحركة نهائياً؟")) {
                                saveActivityLogs([
                                  { id: "log_clear", timestamp: new Date().toLocaleString('ar-YE', { timeZone: 'Asia/Aden' }), username: "النظام المطور", userType: "System", action: "تم تفريغ وإعادة تأمين سجل النشاطات والعمليات السيادي بالنظام" }
                                ]);
                              }
                            }}
                            className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-extrabold text-[10px] px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
                          >
                            🧹 تصفير السجل
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-950 text-slate-100 p-5 rounded-2xl border border-slate-850 font-mono text-xs max-h-[500px] overflow-y-auto space-y-3 shadow-inner" dir="rtl">
                        <div className="flex justify-between border-b border-white/10 pb-2 text-slate-400 font-extrabold text-[10px]">
                          <span>⏱️ التوقيت الرسمي (صنعاء)</span>
                          <span>👥 المستخدم والصفة</span>
                          <span className="w-1/2 text-left">📂 الإجراء والعملية المنفذة</span>
                        </div>
                        {activityLogs.length > 0 ? (
                          activityLogs.map((log) => (
                            <div key={log.id} className="flex justify-between items-start py-2.5 border-b border-white/5 last:border-0 font-mono text-[11px] hover:bg-white/5 px-1.5 rounded-md transition-all text-right">
                              <span className="text-amber-400 shrink-0 font-sans">{log.timestamp}</span>
                              <span className="text-cyan-300 font-sans mx-4 shrink-0 font-black bg-white/5 py-0.5 px-1.5 rounded-md text-[9px]">
                                {log.username} | <span className="text-slate-400 font-normal">{log.userType === 'super_admin' ? 'المالك' : log.userType === 'superadmin' ? 'المدير' : log.userType === 'school' ? 'مدرسة' : log.userType === 'teacher' ? 'معلم' : log.userType === 'student' ? 'طالب' : 'زائر'}</span>
                              </span>
                              <span className="text-emerald-300 text-left w-1/2 font-sans font-black text-xs leading-relaxed">{log.action}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-slate-500 italic">لم ترصد أي عمليات تسجيل جارية حالياً.</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* مودال تعديل تفاصيل الكود */}
                  {editingCode && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" dir="rtl">
                      <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b pb-3">
                          <h3 className="font-extrabold text-indigo-900 text-sm">🖊️ تعديل بيانات الترخيص: {editingCode.code}</h3>
                          <button type="button" onClick={() => setEditingCode(null)} className="text-slate-400 hover:text-slate-600 font-extrabold">✕</button>
                        </div>
                        <form onSubmit={handleSaveCodeEdit} className="space-y-4 text-xs">
                          <div className="space-y-1">
                            <label className="block text-slate-600 font-bold">المدرسة المرتبطة للرصد والتقارير:</label>
                            <select
                              value={editCodeSchool}
                              onChange={(e) => setEditCodeSchool(e.target.value)}
                              required
                              className="w-full bg-slate-50 border border-slate-200 outline-none p-2.5 rounded-xl font-bold"
                            >
                              <option value="">-- حدد المدرسة --</option>
                              {schools.map(sch => (
                                <option key={sch.id} value={sch.name}>{sch.name}</option>
                              ))}
                              <option value="التعليم الذاتي والثانوية الخارجية">التعليم الذاتي والثانوية الخارجية</option>
                            </select>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="block text-slate-600 font-bold">الحد الأقصى للأجهزة:</label>
                              <input
                                type="number"
                                min={1}
                                max={50}
                                value={editCodeDeviceLimit}
                                onChange={(e) => setEditCodeDeviceLimit(Number(e.target.value))}
                                required
                                className="w-full bg-slate-50 border border-slate-200 outline-none p-2.5 rounded-xl text-center font-black"
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <label className="block text-slate-600 font-bold">حالة الكود الأمنية:</label>
                              <select
                                value={editCodeStatus}
                                onChange={(e) => setEditCodeStatus(e.target.value as any)}
                                required
                                className="w-full bg-slate-50 border border-slate-200 outline-none p-2.5 rounded-xl text-center font-bold"
                              >
                                <option value="active">🟢 فعال / نشط</option>
                                <option value="used">👤 مستعمل (مكتمل)</option>
                                <option value="stopped">⏸️ موقوف مؤقتاً</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-slate-600 font-bold">تاريخ انتهاء صلاحية الترخيص:</label>
                            <input
                              type="date"
                              value={editCodeExpire}
                              onChange={(e) => setEditCodeExpire(e.target.value)}
                              required
                              className="w-full bg-slate-50 border border-slate-200 outline-none p-2.5 rounded-xl text-center font-mono font-bold"
                            />
                          </div>

                          {editingCode.devicesUsed && editingCode.devicesUsed.length > 0 && (
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                              <span className="block font-black text-[10px] text-slate-500">📱 الأجهزة المسجلة حالياً ({editingCode.devicesUsed.length} من {editCodeDeviceLimit}):</span>
                              <div className="max-h-[80px] overflow-y-auto text-[10px] font-mono text-slate-700 space-y-1">
                                {editingCode.devicesUsed.map((usr, i) => (
                                  <div key={i} className="flex justify-between items-center bg-white p-1 rounded px-2 border border-slate-100">
                                    <span className="font-bold">{usr}</span>
                                    <button 
                                      type="button" 
                                      onClick={() => {
                                        const updatedDevs = editingCode.devicesUsed?.filter(d => d !== usr) || [];
                                        setEditingCode({
                                          ...editingCode,
                                          devicesUsed: updatedDevs,
                                          status: updatedDevs.length > 0 ? 'used' as const : 'active' as const
                                        });
                                      }}
                                      className="text-rose-500 font-bold hover:underline cursor-pointer"
                                    >حذف كرت الجهاز</button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2.5 pt-2">
                            <button
                              type="submit"
                              className="flex-1 py-3 bg-indigo-700 hover:bg-indigo-650 text-white font-extrabold rounded-xl cursor-pointer"
                            >
                              حفظ التعديلات 💾
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCode(null)}
                              className="px-5 py-3 bg-slate-150 hover:bg-slate-200 text-slate-800 font-bold rounded-xl cursor-pointer"
                            >
                              إلغاء
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* ========================================== */}
            {/* 👨‍🏫 بوابة المعلم الموجه والتحكم التربوي */}
            {/* ========================================== */}
            {currentUserType === 'teacher' && (
              <TeacherDashboard
                studentName={studentName}
                studentSchool={studentSchool}
                scores={scores}
                schools={schools}
                teachers={teachers}
                studentAttendances={studentAttendances}
                allLessons={lessonsList}
                saveScoresToStorage={saveScoresToStorage}
                setSmartAlerts={setSmartAlerts}
              />
            )}
            {false && (() => {
              if (currentUserType === 'teacher') {
                const handleSendMessageByTeacher = (e: any) => {};
                const handleDeleteMessage = (id: any) => {};
                const handleToggleClassSetup = (cls: any) => {};
                
                const teacherActiveSchool = studentSchool || 'ثانوية جمال عبد الناصر للمتفوقين - صنعاء';
              const classScores = scores.filter(s => s.school === teacherActiveSchool);
              const uniqueSts = Array.from(new Set(classScores.map(s => s.name))) as string[];

              const studentList = uniqueSts.map(name => {
                const stdScores = classScores.filter(s => s.name === name);
                const currentClass = stdScores[0]?.classGroup || 'الشعبة أ';
                
                const atts = studentAttendances.filter(a => a.studentName === name && a.school === teacherActiveSchool);
                const presentCount = atts.filter(a => a.status === 'present').length;
                const lateCount = atts.filter(a => a.status === 'late').length;
                const attRate = atts.length > 0 ? Math.round(((presentCount + (lateCount * 0.5)) / atts.length) * 100) : 100;

                let totalGot = 0;
                let totalMax = 0;
                stdScores.forEach(s => {
                  const parts = s.score.split('/');
                  totalGot += (parseFloat(parts[0]) || 0);
                  totalMax += (parseFloat(parts[1]) || 5);
                });

                const avgOutOf5 = stdScores.length > 0 ? Number(((totalGot / totalMax) * 5).toFixed(1)) : 0;
                const avgPct = stdScores.length > 0 ? Math.round((totalGot / totalMax) * 100) : 0;
                const attemptedCount = Array.from(new Set(stdScores.map(s => s.lessonId))).length;
                const completionRate = Math.min(100, Math.round((attemptedCount / 18) * 105));

                return {
                  name,
                  classGroup: currentClass,
                  attRate,
                  testCount: stdScores.length,
                  avgOutOf5,
                  avgPct,
                  completionRate
                };
              });

              // تصفية الكشوف بناءً على مدخلات البحث
              const teacherSearchedStudents = studentList.filter(std => {
                const matchSearch = std.name.toLowerCase().includes(teacherSearchTerm.toLowerCase());
                const matchClass = teacherClassFilter === 'all' ? true : std.classGroup === teacherClassFilter;
                
                if (teacherStudentFilter === 'struggling') {
                  return matchSearch && matchClass && (std.avgPct < 60 || std.attRate < 75);
                }
                if (teacherStudentFilter === 'outstanding') {
                  return matchSearch && matchClass && std.avgPct >= 90;
                }
                return matchSearch && matchClass;
              });

              const strugglingStudents = studentList.filter(s => s.avgPct < 60 || s.attRate < 75);
              const outstandingStudents = studentList.filter(s => s.avgPct >= 90);

              const avgTotalScorePct = studentList.length > 0 ? Math.round(studentList.reduce((sum, s) => sum + s.avgPct, 0) / studentList.length) : 0;
              const avgTotalAttendancePct = studentList.length > 0 ? Math.round(studentList.reduce((sum, s) => sum + s.attRate, 0) / studentList.length) : 100;

              const classesStats = teacherClasses.map(clsName => {
                const classStudents = studentList.filter(s => s.classGroup === clsName);
                const count = classStudents.length;
                const avgScore = count > 0 ? Number((classStudents.reduce((sum, s) => sum + s.avgOutOf5, 0) / count).toFixed(1)) : 0;
                const avgProgress = count > 0 ? Math.round(classStudents.reduce((sum, s) => sum + s.completionRate, 0) / count) : 0;
                return {
                  className: clsName,
                  count,
                  avgScore,
                  avgProgress
                };
              }).filter(c => c.count > 0);

              const timelineCombined = classScores.map(sc => ({
                id: sc.id || String(Math.random()),
                studentName: sc.name,
                classGroup: sc.classGroup,
                description: `حل اختبار مقرر: ${sc.lessonTitle}`,
                meta: `الدرجة: ${sc.score}`,
                date: sc.date || 'اليوم'
              })).concat(
                studentAttendances.filter(a => a.school === teacherActiveSchool).map(at => ({
                  id: at.id || String(Math.random()),
                  studentName: at.studentName,
                  classGroup: at.classGroup || 'الشعبة أ',
                  description: at.status === 'present' ? 'سجل حضور' : at.status === 'late' ? 'سجل تأخر صفي' : 'سجل غياب صفي',
                  meta: at.status === 'present' ? 'حاضر 🟢' : at.status === 'late' ? 'متأخر 🟡' : 'غائب 🔴',
                  date: at.date || 'اليوم'
                }))
              ).sort((a, b) => b.date.localeCompare(a.date));

              const handleTriggerSendMessage = (studentName: string) => {
                setTeacherActiveDashboardTab('messages');
                setMsgTargetType('student');
                setMsgTargetStudentName(studentName);
              };

              // Removals in progress...

              return (
                <div className="space-y-6 w-full animate-fade-in" dir="rtl">
                  
                  {/* ترويسة تمنح القوة المنهجية */}
                  <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white p-6 rounded-3xl shadow-sm border border-indigo-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-right overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                    <div className="relative z-10 flex-1">
                      <span className="bg-white/10 text-amber-300 font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                            👨‍🏫 بوابة المعلم الموجه والتحكم التربوي
                          </span>
                          <h2 className="text-lg md:text-xl font-black mt-1">أهلاً بك، {studentName || 'المعلم الفاضل'} 👋</h2>
                          <p className="text-xs text-slate-305 font-semibold">
                            المدرسة الشريكة: <span className="text-amber-350 font-extrabold">{teacherActiveSchool}</span> | ترخيص التحكم نشط ومؤمن 🟢
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => window.print()}
                            className="bg-white/10 hover:bg-white/20 text-white font-extrabold px-4 py-2 border border-white/20 rounded-xl transition-all text-xs cursor-pointer"
                          >
                            🖨️ طباعة السجل الأكاديمي الحالي
                          </button>
                        </div>
                      </div>

                      {/* كروت المؤشرات الفورية السريعة لتبسيط الرصد */}
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-right">
                          <span className="text-slate-300 text-[9px] block font-bold">الشعب الدراسية التابعة:</span>
                          <span className="text-base font-black font-mono text-amber-350 block mt-0.5">{teacherClasses.length} شعبة</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-right">
                          <span className="text-slate-300 text-[9px] block font-bold">إجمالي طلاب كشوفك:</span>
                          <span className="text-base font-black font-mono text-emerald-350 block mt-0.5">{studentList.length} طالب</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-right">
                          <span className="text-slate-300 text-[9px] block font-bold">أوراق رصد التحصيل:</span>
                          <span className="text-base font-black font-mono text-sky-305 block mt-0.5">{classScores.length} ورقة</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-right">
                          <span className="text-slate-300 text-[9px] block font-bold">متوسط التحصيل الصفي:</span>
                          <span className="text-base font-black font-mono text-pink-350 block mt-0.5">{avgTotalScorePct}%</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-right">
                          <span className="text-slate-300 text-[9px] block font-bold">متوسط الحضور التراكمي:</span>
                          <span className="text-base font-black font-mono text-indigo-305 block mt-0.5">{avgTotalAttendancePct}%</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-right">
                          <span className="text-slate-300 text-[9px] block font-bold">تنبيهات التدخل المعلق:</span>
                          <span className="text-base font-black font-mono text-rose-400 block mt-0.5">{strugglingStudents.length} طلاب</span>
                        </div>
                      </div>

                      {/* قائمة التصفح الداخلية للوحة المعلم */}
                      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
                      <button
                        onClick={() => setTeacherActiveDashboardTab('overview')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${teacherActiveDashboardTab === 'overview' ? 'bg-indigo-650 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50'}`}
                      >
                        📊 نظرة عامة وتنبيهات الأداء
                      </button>
                      <button
                        onClick={() => setTeacherActiveDashboardTab('students')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${teacherActiveDashboardTab === 'students' ? 'bg-indigo-650 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50'}`}
                      >
                        👥 كشف الطلاب وحصيلتهم
                      </button>
                      <button
                        onClick={() => setTeacherActiveDashboardTab('scores')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${teacherActiveDashboardTab === 'scores' ? 'bg-indigo-650 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50'}`}
                      >
                        🏅 نتائج وعلامات الاختبارات
                      </button>
                      <button
                        onClick={() => setTeacherActiveDashboardTab('attendance')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${teacherActiveDashboardTab === 'attendance' ? 'bg-indigo-650 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50'}`}
                      >
                        📝 رصد وتحضير الحضور اليومي
                      </button>
                      <button
                        onClick={() => setTeacherActiveDashboardTab('activities')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${teacherActiveDashboardTab === 'activities' ? 'bg-indigo-650 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50'}`}
                      >
                        ⚡ خط الأنشطة والفعالية ({timelineCombined.length})
                      </button>
                      <button
                        onClick={() => setTeacherActiveDashboardTab('messages')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${teacherActiveDashboardTab === 'messages' ? 'bg-indigo-650 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50'}`}
                      >
                        ✉️ التواصل والمراسلات والتعاميم
                      </button>
                      <button
                        onClick={() => setTeacherActiveDashboardTab('setup')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${teacherActiveDashboardTab === 'setup' ? 'bg-indigo-650 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50'}`}
                      >
                        ⚙️ تخصيص صُفوفي التابعة ({teacherClasses.length})
                      </button>
                      <button
                        onClick={() => setTeacherActiveDashboardTab('reports')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${teacherActiveDashboardTab === 'reports' ? 'bg-indigo-650 text-white shadow-xs animate-pulse-subtle' : 'bg-rose-50 border border-slate-200 text-rose-700 hover:bg-rose-100/50'}`}
                      >
                        📈 مركز التقارير المتكامل
                      </button>
                    </div>

                    {/* محتوى قنوات لوحة المعلم */}
                    {teacherActiveDashboardTab === 'overview' && (
                      <div className="space-y-6 animate-fade-in text-right">
                        
                        {/* شبكة مقارنة أداء الشعب المدرسية للفيزياء */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                            <h3 className="font-extrabold text-slate-800 text-xs block border-b border-rose-50 pb-2">⚖️ مقارنة أداء وتحصيل الشعب والصفوف:</h3>
                            
                            <div className="space-y-3">
                              {classesStats.map((cls, idx) => (
                                <div key={idx} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3 text-right">
                                  <div className="flex justify-between items-center">
                                    <span className="font-extrabold text-xs text-indigo-900">{cls.className}</span>
                                    <span className="text-[10px] text-slate-400 block font-bold">{cls.count} طلاب نشطين</span>
                                  </div>
                                  
                                  {/* التجاوز والدرجة */}
                                  <div className="flex justify-between text-[11px] font-bold text-slate-600">
                                    <span>متوسط التحصيل: <strong className="text-emerald-700 underline">{cls.avgScore} / 5</strong></span>
                                    <span>إكمال المنهج: <strong className="text-amber-600">{cls.avgProgress}%</strong></span>
                                  </div>

                                  {/* بار مرئي */}
                                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                    <div 
                                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                                      style={{ width: `${cls.avgProgress}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                              {classesStats.length === 0 && (
                                <p className="text-center font-semibold italic text-slate-400 py-6 text-xs">لا يوجد بيانات أداء متاحة بعد.</p>
                              )}
                            </div>
                          </div>

                          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                            <h3 className="font-extrabold text-slate-800 text-xs block border-b border-rose-50 pb-2">🚨 تنبيهات التدخل والمتابعة لدعم تحصيل فئاتك:</h3>
                            <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                              قائمة الطلاب الذين يواجهون تحديات علمية (متوسط درجتهم أقل من 60% في المفحوصات)، ينصح بتوجيه إشعارات تنبيه لهم فوراً.
                            </p>
                            
                            <div className="space-y-2 max-h-[250px] overflow-y-auto">
                              {strugglingStudents.map((std, idx) => (
                                <div key={idx} className="bg-rose-50/40 p-3 rounded-2xl border border-rose-100/70 flex justify-between items-center text-right">
                                  <div>
                                    <h4 className="font-extrabold text-slate-800 text-xs">{std.name}</h4>
                                    <p className="text-[10px] text-slate-450 font-semibold">{std.classGroup} | التحصيل التراكمي: <strong className="text-rose-600 font-black">{std.avgOutOf5} / 5</strong></p>
                                  </div>
                                  <button
                                    onClick={() => handleTriggerSendMessage(std.name)}
                                    className="bg-white hover:bg-rose-50 text-rose-750 border border-rose-205 font-bold px-3 py-1 rounded-xl text-[10px] transition-colors cursor-pointer"
                                  >
                                    ✉️ توجيه خاص
                                  </button>
                                </div>
                              ))}
                              {strugglingStudents.length === 0 && (
                                <p className="text-center italic font-semibold text-emerald-600 py-10 text-xs">🕊️ رائع! لا يوجد طلاب يواجهون تعثرات علمية في شعبك النشطة حالياً.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* لوحة ترتيب الأوائل والمتفوقين في فئاتك */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                          <h3 className="font-extrabold text-slate-800 text-xs block border-b border-slate-50 pb-2">🏆 لوحة التفوق العلمي والتميز لشعب الموجه ({outstandingStudents.length}):</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {outstandingStudents.map((std, idx) => (
                              <div key={idx} className="bg-gradient-to-br from-amber-50/20 to-indigo-50/10 p-3.5 rounded-2xl border border-amber-200/50 flex items-center gap-3 text-right">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 font-extrabold text-sm flex items-center justify-center">👑</div>
                                <div>
                                  <h4 className="font-extrabold text-slate-800 text-xs">{std.name}</h4>
                                  <span className="text-[10px] text-slate-400 font-bold block">{std.classGroup} | المعدل: <strong className="text-emerald-700 font-black">{std.avgOutOf5} / 5 ({std.avgPct}%)</strong></span>
                                </div>
                              </div>
                            ))}
                            {outstandingStudents.length === 0 && (
                              <p className="col-span-3 text-center text-slate-400 italic font-semibold text-xs py-10">استمر بمتابعة وتحفيز الطلاب لحصد الأوسمة وباقات الـ XP العالية!</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {teacherActiveDashboardTab === 'students' && (
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4 animate-fade-in text-right">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-50 pb-3">
                          <div>
                            <h3 className="font-extrabold text-slate-800 text-sm">👥 كشف الحصر الشامل والدرجات والتقدم لطلابك</h3>
                            <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">تتبع مستمر للدرجات وحالة رصد الحصائل التراكمية.</p>
                          </div>
                          
                          <input 
                            type="text"
                            value={teacherSearchTerm}
                            onChange={(e) => setTeacherSearchTerm(e.target.value)}
                            placeholder="🔍 ابحث عن اسم طالب..."
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-indigo-600 text-xs w-full sm:w-[220px] text-right"
                          />
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-right border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-black">
                                <th className="p-3">اسم الطالب</th>
                                <th className="p-3">الشعبة</th>
                                <th className="p-3">حضور الطالب التراكمي</th>
                                <th className="p-3">الامتحانات المنجزة</th>
                                <th className="p-3">متوسط الأداء الحالي</th>
                                <th className="p-3">نسبة إكمال المنهج</th>
                                <th className="p-3 text-left">مراسلة فورية</th>
                              </tr>
                            </thead>
                            <tbody>
                              {teacherSearchedStudents.map((std, idx) => (
                                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
                                  <td className="p-3 font-extrabold text-slate-850">{std.name}</td>
                                  <td className="p-3 font-semibold text-indigo-700">{std.classGroup}</td>
                                  <td className="p-3 font-bold">
                                    <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] ${std.attRate >= 80 ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                                      {std.attRate}%
                                    </span>
                                  </td>
                                  <td className="p-3 font-mono font-extrabold text-slate-550">{std.testCount} محاولة رصد</td>
                                  <td className="p-3 font-extrabold">
                                    <span className={`px-2 py-0.5 rounded-lg ${std.avgPct >= 80 ? 'bg-amber-50 text-amber-900 font-extraboldValue' : std.avgPct >= 60 ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                                      {std.avgOutOf5} / 5 ({std.avgPct}%)
                                    </span>
                                  </td>
                                  <td className="p-3 font-semibold text-slate-500">
                                    <div className="flex items-center gap-2">
                                      <span className="w-10 block font-mono font-bold text-[10px]">{std.completionRate}%</span>
                                      <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-indigo-600 h-full" style={{ width: `${std.completionRate}%` }} />
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3 text-left">
                                    <button
                                      onClick={() => handleTriggerSendMessage(std.name)}
                                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold px-3 py-1.5 rounded-lg text-[10px] transition-all cursor-pointer"
                                    >
                                      ✉️ إرسال مذكرة
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              {teacherSearchedStudents.length === 0 && (
                                <tr>
                                  <td colSpan={7} className="text-center py-10 italic font-semibold text-slate-400">لا يوجد كشوف طلاب مسجلة تفي بالبحث المذكور في شعب الموجه النشطة.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {teacherActiveDashboardTab === 'scores' && (() => {
                      // Average score of current class
                      const educatorSchoolScores = scores.filter(s => s.school === teacherActiveSchool && teacherClasses.includes(s.classGroup));
                      
                      // Handle adding or updating score
                      const handleSaveOrUpdateScore = (e: React.FormEvent) => {
                        e.preventDefault();
                        const fData = new FormData(e.currentTarget);
                        const sName = fData.get('student_name') as string;
                        const sClass = fData.get('student_class') as string;
                        const sLessonId = fData.get('lesson_id') as string;
                        const sScoreValue = fData.get('score_value') as string;

                        if (!sName || !sClass || !sLessonId || !sScoreValue) {
                          alert("⚠️ يرجى ملء كافة الخانات لرصد العلامة!");
                          return;
                        }

                        const lessonTitle = allLessons.find(l => l.id === sLessonId)?.title || "تمرين منهج عام";

                        const existingIdx = scores.findIndex(s => s.name === sName && s.lessonId === sLessonId && s.school === teacherActiveSchool);

                        let updatedScores = [...scores];
                        if (existingIdx !== -1) {
                          updatedScores[existingIdx] = {
                            ...updatedScores[existingIdx],
                            score: `${sScoreValue}/5`,
                            classGroup: sClass
                          };
                        } else {
                          const newScore: StudentScore = {
                            name: sName,
                            school: teacherActiveSchool,
                            classGroup: sClass,
                            lessonId: sLessonId,
                            lessonTitle: lessonTitle,
                            score: `${sScoreValue}/5`,
                            code: "TEACHER_LOGGED",
                            date: new Date().toISOString().replace('T', ' ').split('.')[0]
                          };
                          updatedScores.push(newScore);
                        }

                        saveScoresToStorage(updatedScores);
                        
                        // Let's check if the score is low and trigger a SMART ALERT automatically if needed!
                        const numScore = parseFloat(sScoreValue) || 5;
                        if (numScore < 3) { // Low Grade Alert
                          const alertTitle = `تنبيه تدني الدرجة التعليمية للطالب: ${sName} ⚠️`;
                          const alertMsg = `رصد المعلم درجة متدنية (${numScore}/5) للطالب ${sName} في الدرس (${lessonTitle}) بشعبتكم التابعة ${sClass}. الرجاء اتخاذ الدعم العلمي العاجل.`;
                          const newAlert: SmartAlert = {
                            id: `alert_dyn_${Date.now()}`,
                            type: 'danger',
                            title: alertTitle,
                            message: alertMsg,
                            userType: 'all',
                            studentName: sName,
                            school: teacherActiveSchool,
                            classGroup: sClass,
                            date: 'اليوم',
                            alertType: 'grades'
                          };
                          setSmartAlerts(prev => [newAlert, ...prev]);
                        }

                        alert("🟢 تم رصد وتحديث علامة الطالب بنجاح بالمنظومة!");
                        e.currentTarget.reset();
                      };

                      return (
                        <div className="space-y-6 animate-fade-in text-right" dir="rtl">
                          
                          {/* 1. فورمة رصد علامات سريعة */}
                          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-3xl border border-indigo-200 shadow-xs space-y-4">
                            <h3 className="font-extrabold text-indigo-950 text-sm flex items-center gap-2">🏅 لوحة الرصد الفوري الذكي المباشر لعلامات الطلاب</h3>
                            <p className="text-[10px] text-indigo-700 leading-relaxed font-semibold">استخدم هذا الملحق لإدخال أو تعديل علامات أوراق ودفاتر رصد الطلاب في دروس الفيزياء والشعب التابعة لك فورياً.</p>
                            
                            <form onSubmit={handleSaveOrUpdateScore} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs font-semibold">
                              <div className="space-y-1">
                                <label className="block text-slate-700">اسم الطالب الكريم:</label>
                                <input
                                  name="student_name"
                                  list="educator_students_datalist"
                                  placeholder="اكتب اسم الطالب..."
                                  required
                                  className="w-full bg-white border border-slate-250 outline-none p-2.5 rounded-xl font-bold"
                                />
                                <datalist id="educator_students_datalist">
                                  {studentList.map(s => (
                                    <option key={s.name} value={s.name} />
                                  ))}
                                </datalist>
                              </div>

                              <div className="space-y-1">
                                <label className="block text-slate-700">الشعبة الدراسية:</label>
                                <select name="student_class" required className="w-full bg-white border border-slate-255 outline-none p-2.5 rounded-xl font-bold">
                                  {teacherClasses.map(cls => (
                                    <option key={cls} value={cls}>{cls}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="block text-slate-700">الوحدة/الدرس المستهدف:</label>
                                <select name="lesson_id" required className="w-full bg-white border border-slate-255 outline-none p-2.5 rounded-xl font-bold">
                                  {allLessons.map(l => (
                                    <option key={l.id} value={l.id}>{l.title}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="block text-slate-700">الدرجة النهائية المرصودة:</label>
                                <select name="score_value" required className="w-full bg-white border border-slate-255 outline-none p-2.5 rounded-xl font-bold font-mono">
                                  <option value="5">5 من 5 (ممتاز)</option>
                                  <option value="4">4 من 5 (جيد جداً)</option>
                                  <option value="3">3 من 5 (متوسط)</option>
                                  <option value="2">2 من 5 (ضعيف - إنذار)</option>
                                  <option value="1">1 من 5 (تدنٍ حاد - إنذار)</option>
                                  <option value="0">0 من 5 (غياب/لم يحل)</option>
                                </select>
                              </div>

                              <div className="flex items-end">
                                <button type="submit" className="w-full bg-indigo-650 hover:bg-indigo-600 text-white font-extrabold p-2.5 rounded-xl shadow-xs cursor-pointer transition-all active:scale-95 text-xs text-center">
                                  💾 رصد وتثبيت الدرجة
                                </button>
                              </div>
                            </form>
                          </div>

                          {/* 2. لائحة العلامات الحالية لطلاب الشعب */}
                          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-50 pb-3">
                              <div>
                                <h3 className="font-extrabold text-slate-805 text-sm">📋 رصيد العلامات التفصيلي لشعبك التابعة</h3>
                                <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">استعراض كافة درجات الطلاب الموثقة بالتحصيل والدروس الموازية.</p>
                              </div>
                              
                              <div className="flex gap-2 w-full sm:w-auto">
                                <select 
                                  value={teacherClassFilter}
                                  onChange={(e) => setTeacherClassFilter(e.target.value)}
                                  className="bg-slate-50 border border-slate-205 rounded-xl px-2 py-1.5 outline-none text-xs text-right font-bold"
                                >
                                  <option value="all">كل الشعب الدراسية</option>
                                  {teacherClasses.map(clsName => (
                                    <option key={clsName} value={clsName}>{clsName}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-xs text-right border-collapse">
                                <thead>
                                  <tr className="bg-slate-55 border-b border-slate-100 text-slate-500 font-black">
                                    <th className="p-3">اسم الطالب الكريم</th>
                                    <th className="p-3 text-center">شعبته</th>
                                    <th className="p-3">اسم الدرس المنسق</th>
                                    <th className="p-3 text-center">العلامة الدراسية</th>
                                    <th className="p-3 text-center">التأهيل والتقويم</th>
                                    <th className="p-3 text-left">التعديل اليدوي السريع</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {educatorSchoolScores
                                    .filter(s => teacherClassFilter === 'all' ? true : s.classGroup === teacherClassFilter)
                                    .map((s, idx) => {
                                      const parts = s.score.split('/');
                                      const scoreVal = parseFloat(parts[0]) || 0;
                                      return (
                                        <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/45 transition-colors font-semibold">
                                          <td className="p-3 font-extrabold text-slate-800">{s.name}</td>
                                          <td className="p-3 text-center text-indigo-700 font-extrabold">{s.classGroup}</td>
                                          <td className="p-3 text-slate-600 font-medium">{s.lessonTitle}</td>
                                          <td className="p-3 text-center font-mono text-indigo-900 font-black text-sm">{s.score}</td>
                                          <td className="p-3 text-center">
                                            {scoreVal >= 4 ? (
                                              <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-emerald-50 text-emerald-800 font-black">🏆 متميز ومتفوق</span>
                                            ) : scoreVal >= 3 ? (
                                              <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-sky-50 text-sky-800 font-black">⚡ متوسط وفهم راسخ</span>
                                            ) : (
                                              <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-rose-50 text-rose-800 font-black">🚨 متعثر ويستشرف المساعدة</span>
                                            )}
                                          </td>
                                          <td className="p-3 text-left">
                                            <div className="flex justify-end gap-1">
                                              <button
                                                onClick={() => {
                                                  const newVal = prompt(`أدخل الدرجة الجديدة للطالب (${s.name}) في الدرس (${s.lessonTitle}) من 5:`, parts[0]);
                                                  if (newVal !== null) {
                                                    const parsed = parseFloat(newVal);
                                                    if (isNaN(parsed) || parsed < 0 || parsed > 5) {
                                                      alert("⚠️ يجب أن تكون الدرجة قيمة صحيحة بين 0 و 5!");
                                                      return;
                                                    }
                                                    const updatedScores = scores.map(src => {
                                                      if (src.name === s.name && src.lessonId === s.lessonId && src.school === teacherActiveSchool) {
                                                        return { ...src, score: `${parsed}/5` };
                                                      }
                                                      return src;
                                                    });
                                                    saveScoresToStorage(updatedScores);
                                                    
                                                    // Trigger Alert on change if low
                                                    if (parsed < 3) {
                                                      const alertTitle = `تنبيه رصد درجة متدنية: ${s.name} ⚠️`;
                                                      const alertMsg = `رصد المعلم درجة متدنية (${parsed}/5) للطالب ${s.name} في الدرس (${s.lessonTitle}) بشعبتكم التابعة ${s.classGroup}. الرجاء اتخاذ الدعم التربوي العاجل.`;
                                                      const newAlert: SmartAlert = {
                                                        id: `alert_dyn_${Date.now()}`,
                                                        type: 'danger',
                                                        title: alertTitle,
                                                        message: alertMsg,
                                                        userType: 'all',
                                                        studentName: s.name,
                                                        school: teacherActiveSchool,
                                                        classGroup: s.classGroup,
                                                        date: 'اليوم',
                                                        alertType: 'grades'
                                                      };
                                                      setSmartAlerts(prev => [newAlert, ...prev]);
                                                    }
                                                    
                                                    alert("🟢 تم تعديل العلامة ورصدها فورياً!");
                                                  }
                                                }}
                                                className="bg-indigo-50 hover:bg-indigo-150 text-indigo-750 font-bold px-2.5 py-1 rounded-lg text-[9px]"
                                              >
                                                ✏️ تعديل درجة
                                              </button>
                                              
                                              <button
                                                onClick={() => {
                                                  if (confirm(`هل أنت متأكد من حذف رصد علامة الطالب (${s.name}) لدرس (${s.lessonTitle})؟`)) {
                                                    const updatedScores = scores.filter(src => !(src.name === s.name && src.lessonId === s.lessonId && src.school === teacherActiveSchool));
                                                    saveScoresToStorage(updatedScores);
                                                    alert("🗑️ تم حذف الرصد بنجاح!");
                                                  }
                                                }}
                                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold px-1.5 py-1 rounded-lg"
                                              >
                                                🗑️
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  {educatorSchoolScores.length === 0 && (
                                    <tr>
                                      <td colSpan={6} className="text-center py-10 italic text-slate-400 font-bold">لا يوجد درجات أو علامات اختبار مرصودة لطلاب مدرسة المعلم النشطة حالياً.</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {teacherActiveDashboardTab === 'attendance' && (
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5 animate-fade-in text-right">
                        <div>
                          <h3 className="font-extrabold text-slate-800 text-sm">📝 رصد وتحضير الحضور الدراسي اليومي للشعبة</h3>
                          <p className="text-[10px] text-slate-400">حدد شعبتك لحمل كشوفها ورصد حالة الحضور والتأخر والغياب فوراً.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                          <div className="space-y-1 text-right">
                            <label className="block text-[11px] font-bold text-slate-550">🏫 الشعبة التابعة المستهدفة بالتحضير:</label>
                            <select
                              value={attSelectedClass}
                              onChange={(e) => setAttSelectedClass(e.target.value)}
                              className="w-full bg-white border border-slate-250 rounded-xl p-2.5 outline-none focus:border-indigo-600 font-bold"
                            >
                              {teacherClasses.map((cls, idx) => (
                                <option key={idx} value={cls}>{cls}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1 text-right">
                            <label className="block text-[11px] font-bold text-slate-550">📅 تاريخ كشف التحضير:</label>
                            <input
                              type="date"
                              value={attDate}
                              onChange={(e) => setAttDate(e.target.value)}
                              className="w-full bg-white border border-slate-250 rounded-xl p-2.5 outline-none focus:border-indigo-600 font-mono text-center font-bold"
                            />
                          </div>
                        </div>

                        {/* الكشف الفعلي لطلاب الشعبة */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-right border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-black">
                                <th className="p-3">اسم الطالب من الكشف</th>
                                <th className="p-3">الشعبة</th>
                                <th className="p-3 text-center">حالة الرصد اليوم الحالية</th>
                                <th className="p-3 text-left">لوحة رصد الحضور والتأخير والغياب</th>
                              </tr>
                            </thead>
                            <tbody>
                              {studentList.filter(s => s.classGroup === attSelectedClass).map((std, idx) => {
                                const currentStatus = studentAttendances.find(
                                  a => a.studentName === std.name && a.classGroup === attSelectedClass && a.date === attDate && a.school === teacherActiveSchool
                                )?.status;

                                return (
                                  <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
                                    <td className="p-3 font-extrabold text-slate-800">{std.name}</td>
                                    <td className="p-3 font-semibold text-indigo-700">{std.classGroup}</td>
                                    <td className="p-3 text-center">
                                      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                                        currentStatus === 'present' 
                                          ? 'bg-emerald-105 bg-emerald-100 text-emerald-800' 
                                          : currentStatus === 'absent' 
                                            ? 'bg-rose-100 text-rose-805 text-rose-800' 
                                            : currentStatus === 'late'
                                              ? 'bg-amber-100 text-amber-800'
                                              : 'bg-slate-100 text-slate-400 font-semibold'
                                      }`}>
                                        {currentStatus === 'present' ? 'حاضر ✅' : currentStatus === 'absent' ? 'غائب ❌' : currentStatus === 'late' ? 'متأخر ⏳' : 'غير مرصود'}
                                      </span>
                                    </td>
                                    <td className="p-3 text-left">
                                      <div className="inline-flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                                        <button
                                          onClick={() => handleMarkAttendanceByTeacher(std.name, 'present')}
                                          className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${currentStatus === 'present' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-200 text-slate-650'}`}
                                        >
                                          حاضر
                                        </button>
                                        <button
                                          onClick={() => handleMarkAttendanceByTeacher(std.name, 'late')}
                                          className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${currentStatus === 'late' ? 'bg-amber-500 text-white' : 'hover:bg-slate-200 text-slate-650'}`}
                                        >
                                          متأخر
                                        </button>
                                        <button
                                          onClick={() => handleMarkAttendanceByTeacher(std.name, 'absent')}
                                          className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${currentStatus === 'absent' ? 'bg-rose-600 text-white' : 'hover:bg-slate-200 text-slate-650'}`}
                                        >
                                          غائب
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                              {studentList.filter(s => s.classGroup === attSelectedClass).length === 0 && (
                                <tr>
                                  <td colSpan={4} className="text-center py-10 italic font-semibold text-slate-400">لا يوجد طلاب نشطون مسجلون في {attSelectedClass} حالياً للتحضير.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {teacherActiveDashboardTab === 'activities' && (
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 animate-fade-in text-right">
                        <div>
                          <h3 className="font-extrabold text-slate-800 text-sm">⚡ سجل الأنشطة والخط المنهجي التزامني لطلاب صُفوفك</h3>
                          <p className="text-[10px] text-slate-400">يتعقب البرنامج حركات دخول طلاب شعبك وحلولهم للاستبيان والتقييم المباشر.</p>
                        </div>

                        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                          {timelineCombined.map((act) => (
                            <div key={act.id} className="relative pl-4 border-r-2 border-slate-200 pr-4 pb-2 text-xs text-right">
                              <div className="absolute top-1.5 -right-1.5 w-3 h-3 rounded-full bg-slate-305 bg-indigo-500 border-2 border-white flex items-center justify-center text-[7px]" />
                              
                              <div className="bg-slate-50 hover:bg-slate-50/80 transition-all p-3.5 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-baseline justify-between gap-2 text-right">
                                <div className="space-y-1 text-right">
                                  <span className="font-extrabold text-slate-800">{act.studentName} ({act.classGroup})</span>
                                  <p className="text-slate-500 text-[11px] leading-relaxed font-semibold">{act.description}</p>
                                  <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md inline-block">{act.meta}</span>
                                </div>
                                <span className="font-mono text-[9px] text-slate-400">{act.date}</span>
                              </div>
                            </div>
                          ))}
                          {timelineCombined.length === 0 && (
                            <p className="text-center italic font-semibold text-slate-400 py-10 text-xs">📭 لا يوجد حركات رصد أو فعاليات مسجلة على شعبك حتى الآن.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {teacherActiveDashboardTab === 'messages' && (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in text-right">
                        
                        {/* استمارة رسالة جديدة */}
                        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                          <h3 className="font-extrabold text-slate-800 text-xs block border-b border-rose-50 pb-2">✉️ إرسال توجيه ودعم وتنبيه جديد:</h3>
                          
                          <form onSubmit={handleSendMessageByTeacher} className="space-y-4 text-xs text-right">
                            <div className="space-y-1">
                              <label className="block text-[11px] font-bold text-slate-500 text-right">منظومة الاستهداف بالمنصة:</label>
                              <select
                                value={msgTargetType}
                                onChange={(e) => setMsgTargetType(e.target.value as any)}
                                className="w-full bg-slate-50 border border-slate-200 outline-none focus:border-indigo-600 rounded-xl p-2.5 font-bold text-slate-800"
                              >
                                <option value="all">📢 تعميم جماعي لكافة الشعب بالمنصة</option>
                                <option value="class">👥 مراسلة شعبة دراسية بالكامل</option>
                                <option value="student">📩 توجيه سري وتوجيه خاص لطالب بعينه</option>
                              </select>
                            </div>

                            {msgTargetType === 'class' && (
                              <div className="space-y-1 text-right font-semibold">
                                <label className="block text-[11px] font-bold text-slate-500">الشعبة المستهدفة:</label>
                                <select
                                  value={msgTargetClass}
                                  onChange={(e) => setMsgTargetClass(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 outline-none focus:border-indigo-600 rounded-xl p-2.5"
                                >
                                  {teacherClasses.map((cls, idx) => (
                                    <option key={idx} value={cls}>{cls}</option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {msgTargetType === 'student' && (
                              <div className="space-y-1 text-right font-semibold">
                                <label className="block text-[11px] font-bold text-slate-500 font-extrabold">الطالب المستهدف بالتوجيه:</label>
                                <select
                                  value={msgTargetStudentName}
                                  onChange={(e) => setMsgTargetStudentName(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 outline-none focus:border-indigo-600 rounded-xl p-2.5"
                                >
                                  <option value="">-- اختر طالب من الكشوف --</option>
                                  {studentList.map((s, idx) => (
                                    <option key={idx} value={s.name}>{s.name} ({s.classGroup})</option>
                                  ))}
                                </select>
                              </div>
                            )}

                            <div className="space-y-1 text-right font-semibold">
                              <label className="block text-[11px] font-bold text-slate-500">مضمون الإخطار والتنبيه:</label>
                              <textarea
                                value={msgContent}
                                onChange={(e) => setMsgContent(e.target.value)}
                                placeholder="اكتب مذكرتك هنا بطريقة تربوية هادفة..."
                                required
                                rows={5}
                                className="w-full bg-slate-50 border border-slate-200 outline-none focus:border-indigo-600 rounded-xl p-2.5"
                              />
                            </div>

                            <button
                              type="submit"
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl transition-all cursor-pointer shadow-xs uppercase tracking-wider text-xs"
                            >
                              إرسال وتعميم المذكرة فوراً ✉
                            </button>
                          </form>
                        </div>

                        {/* أرشيف الصادر وسجل التعاميم */}
                        <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                          <h3 className="font-extrabold text-slate-800 text-xs block border-b border-rose-50 pb-2">📖 سجل المراسلات والتعاميم الفعالة الموفدة من قبلك:</h3>
                          
                          <div className="space-y-3 max-h-[480px] overflow-y-auto">
                            {lmsMessages.filter(msg => msg.senderName === studentName || msg.senderRole === 'teacher').map((msg) => (
                              <div key={msg.id} className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 space-y-2 relative overflow-hidden text-right">
                                <div className="flex justify-between items-baseline">
                                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold ${msg.targetType === 'student' ? 'bg-rose-100 text-rose-800' : msg.targetType === 'class' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                    {msg.targetType === 'student' ? `📩 فردي: ${msg.targetStudentName}` : msg.targetType === 'class' ? `👥 شعبة: ${msg.targetClass}` : '📢 تعميم عام'}
                                  </span>
                                  <span className="font-mono text-[9px] text-slate-400">{msg.date}</span>
                                </div>
                                <p className="text-xs font-semibold text-slate-700 leading-relaxed pt-1 pr-1 border-r border-indigo-400 text-right">{msg.content}</p>
                                
                                <div className="text-left">
                                  <button
                                    onClick={() => handleDeleteMessage(msg.id)}
                                    className="text-rose-600 text-[10px] font-bold hover:underline transition-all cursor-pointer"
                                  >
                                    🗑️ سحب الرسالة وعزلها
                                  </button>
                                </div>
                              </div>
                            ))}
                            {lmsMessages.filter(msg => msg.senderName === studentName || msg.senderRole === 'teacher').length === 0 && (
                              <p className="text-center italic font-semibold text-slate-400 py-10 text-xs">لا يوجد توجيهات صادرة من قبلك حالياً.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {teacherActiveDashboardTab === 'setup' && (
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5 animate-fade-in text-right">
                        <div>
                          <h3 className="font-extrabold text-slate-800 text-sm">⚙️ تهيئة صُفوفي التابعة وإدارة الشعب للتدريس</h3>
                          <p className="text-[10px] text-slate-400">حدد الفئات والأقسام التي تقع في نطاق تدريسك اليومي لعزل وإخفاء الفئات الأخرى تنفيذاً لمبدأ رعاية شُعبي التامة ومبدأ "المعلم يعاين شعبه فقط".</p>
                        </div>

                        <div className="bg-yellow-50/50 rounded-2xl border border-yellow-105 p-4 flex gap-3 text-xs text-yellow-805 leading-relaxed text-right">
                          <span className="text-lg">📢</span>
                          <p className="font-semibold text-yellow-905">
                            <strong>ملاحظة تنظيمية:</strong> المنصة تعزل وتؤمن كشوف الدرجات والمحللات وسجل الحضور والأنشطة بناءً فقط على الشُّعب الدراسية النشطة في كشف المعرف أسفل.
                          </p>
                        </div>

                        <div className="border border-slate-100 rounded-3xl p-5 space-y-4">
                          <span className="font-bold text-slate-800 text-xs block border-b border-slate-50 pb-2 text-right">🏫 لائحة شعب الرصد والمتابعة العلمية المتاحة لمدرستكم:</span>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                            {['الشعبة أ', 'الشعبة ب', 'الشعبة ج', 'الشعبة د', 'شعبة الدمج العام'].map((cls, idx) => {
                              const active = teacherClasses.includes(cls);
                              return (
                                <div 
                                  key={idx} 
                                  onClick={() => handleToggleClassSetup(cls)}
                                  className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between ${active ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs' : 'bg-slate-50/50 border-slate-200 text-slate-500'}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-base">{active ? '📚' : '📖'}</span>
                                    <span className="font-extrabold">{cls}</span>
                                  </div>
                                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] ${active ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                                    {active ? '✓' : ''}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {teacherActiveDashboardTab === 'reports' && (
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
                    )}
                    
                  </div>
                );
              }
            })()}

              {/* ========================================== */}
              {/* 🏫 لوحة مدير المدرسة والقيادة التربوية */}
              {/* ========================================== */}
              {currentUserType === 'school' && (() => {
                const schoolActiveSchool = studentSchool;
                const schoolScores = scores.filter(s => s.school === schoolActiveSchool);
                const uniqueSchoolStudents = Array.from(new Set(schoolScores.map(s => s.name))) as string[];

                const schoolStudentList = uniqueSchoolStudents.map((name) => {
                  const stdScores = schoolScores.filter(s => s.name === name);
                  const currentClass = stdScores[0]?.classGroup || 'الشعبة أ';
                  
                  let totalGot = 0;
                  let totalMax = 0;
                  stdScores.forEach(s => {
                    const parts = s.score.split('/');
                    totalGot += (parseFloat(parts[0]) || 0);
                    totalMax += (parseFloat(parts[1]) || 5);
                  });
                  
                  const avgOutOf5 = stdScores.length > 0 ? Number(((totalGot / totalMax) * 5).toFixed(1)) : 0;
                  const avgPct = stdScores.length > 0 ? Math.round((totalGot / totalMax) * 100) : 0;
                  
                  const attemptedCount = Array.from(new Set(stdScores.map(s => s.lessonId))).length;
                  const completionRate = Math.round((attemptedCount / 18) * 105);
                  const safeCompletionRate = Math.min(100, completionRate);

                  return {
                    name,
                    classGroup: currentClass,
                    avgOutOf5,
                    avgPct,
                    completionRate: safeCompletionRate,
                    testCount: stdScores.length
                  };
                });

                // ترتيب الشعب حسب متوسط الأداء
                const schoolClassesList = Array.from(new Set(schoolScores.map(s => s.classGroup || 'الشعبة أ')));
                const classesStats = schoolClassesList.map(clsName => {
                  const clsStds = schoolStudentList.filter(s => s.classGroup === clsName);
                  const count = clsStds.length;
                  const avgScore = count > 0 ? Number((clsStds.reduce((sum, s) => sum + s.avgOutOf5, 0) / count).toFixed(1)) : 0;
                  const avgProgress = count > 0 ? Math.round(clsStds.reduce((sum, s) => sum + s.completionRate, 0) / count) : 0;
                  return {
                    className: clsName,
                    count,
                    avgScore,
                    avgProgress
                  };
                }).sort((a, b) => b.avgScore - a.avgScore);

                // ترتيب الطلاب (لوحة الفخر المدرسي)
                const rankedStudents = [...schoolStudentList].sort((a, b) => b.avgOutOf5 - a.avgOutOf5);

                // متابعة معلمي المدرسة
                const matchedSchoolId = schools.find(sch => sch.name === schoolActiveSchool)?.id || '';
                const schoolTeachersList = teachers.filter(t => t.schoolId === matchedSchoolId);

                const handleToggleTeacherStatusSchool = (id: string) => {
                  const updated = teachers.map(t => {
                    if (t.id === id) {
                      const next = t.status === 'suspended' ? 'active' : 'suspended';
                      return { ...t, status: next as any };
                    }
                    return t;
                  });
                  saveTeachersToStorage(updated);
                  alert("✅ تم تعديل وتحديث صلاحية وحالة المعلم التابع للمدرسة بنجاح!");
                };

                const handleDeleteTeacherSchool = (id: string, nameName: string) => {
                  if (confirm(`🚨 هل أنت متأكد من لزوم عزل المعلم الموجه "${nameName}" نهائياً من كادر المدرسة؟`)) {
                    saveTeachersToStorage(teachers.filter(t => t.id !== id));
                    alert("❌ تم عزل المعلم.");
                  }
                };

                const schoolStruggling = schoolStudentList.filter(s => s.avgPct < 60);
                const avgSchoolProgress = schoolStudentList.length > 0 ? Math.round(schoolStudentList.reduce((sum, s) => sum + s.completionRate, 0) / schoolStudentList.length) : 0;
                const avgSchoolScore = schoolStudentList.length > 0 ? Number((schoolStudentList.reduce((sum, s) => sum + s.avgOutOf5, 0) / schoolStudentList.length).toFixed(1)) : 0;

                return (
                  <div className="space-y-6 w-full animate-fade-in text-slate-800" dir="rtl">
                    
                    {/* الترويسة الرئيسية الحصرية لمدير المدرسة */}
                    <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-indigo-950 rounded-3xl p-6 text-white shadow-lg border border-emerald-500/10 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl" />
                      
                      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-right">
                        <div className="space-y-1 text-right">
                          <span className="bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                            🏫 القيادة التربوية وإدارة الصرح التعليمي
                          </span>
                          <h2 className="text-lg md:text-xl font-black mt-1">أهلاً بك، {studentName || 'حضرة المدير الفاضل'} 👋</h2>
                          <p className="text-xs text-slate-300 font-semibold">
                            صرح الدراسة الحالي: <span className="text-yellow-300 font-extrabold">{schoolActiveSchool}</span> (البيانات معزولة وصحيحة وتخص مدرستك فقط 🔒)
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => window.print()}
                            className="bg-white/10 hover:bg-white/20 text-white font-extrabold px-4 py-2 border border-white/20 rounded-xl transition-all text-xs cursor-pointer"
                          >
                            🖨️ تصدير التقرير الرقابي للمديرية
                          </button>
                        </div>
                      </div>

                      {/* كروت كفاءة الصرح التراكمي */}
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-right">
                          <span className="text-slate-300 text-[9px] block font-bold">إجمالي طلاب المدرسة:</span>
                          <span className="text-base font-black font-mono text-emerald-305 block mt-0.5">{schoolStudentList.length} طالب</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-right">
                          <span className="text-slate-300 text-[9px] block font-bold">إجمالي كشوف الاختبارات:</span>
                          <span className="text-base font-black font-mono text-amber-305 block mt-0.5">{schoolScores.length} ورقة</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-right">
                          <span className="text-slate-300 text-[9px] block font-bold">كادر المعلمين النشط:</span>
                          <span className="text-base font-black font-mono text-sky-305 block mt-0.5">{schoolTeachersList.length} موجه</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-right">
                          <span className="text-slate-300 text-[9px] block font-bold">معدل التحصيل الموحد:</span>
                          <span className="text-base font-black font-mono text-pink-305 block mt-0.5">{avgSchoolScore} / 5</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-right">
                          <span className="text-slate-300 text-[9px] block font-bold">نسبة إنجاز المنهج:</span>
                          <span className="text-base font-black font-mono text-indigo-305 block mt-0.5">{avgSchoolProgress}%</span>
                        </div>
                      </div>
                    </div>

                    {/* قائمة التبويب للمدير */}
                    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 print:hidden">
                      <button
                        onClick={() => setSchoolActiveDashboardTab('overview')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${schoolActiveDashboardTab === 'overview' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50'}`}
                      >
                        📊 جدار المؤشرات وتحليل المنهج
                      </button>
                      <button
                        onClick={() => setSchoolActiveDashboardTab('classes')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${schoolActiveDashboardTab === 'classes' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50'}`}
                      >
                        ⚖️ ترتيب الشعب المدرسية
                      </button>
                      <button
                        onClick={() => setSchoolActiveDashboardTab('students')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${schoolActiveDashboardTab === 'students' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50'}`}
                      >
                        🏆 كشف النتائج التنافسية وترتيب الطلاب
                      </button>
                      <button
                        onClick={() => setSchoolActiveDashboardTab('alerts')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${schoolActiveDashboardTab === 'alerts' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50'}`}
                      >
                        🚨 تنبيهات التدخل والمراقبة المباشرة ({schoolStruggling.length})
                      </button>
                      <button
                        onClick={() => setSchoolActiveDashboardTab('reports')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${schoolActiveDashboardTab === 'reports' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-rose-50 border border-slate-200 text-teal-850 hover:bg-rose-100/50'}`}
                      >
                        📈 مركز التقارير المتكامل
                      </button>
                    </div>

                    {/* تبويب Overview للمدير */}
                    {schoolActiveDashboardTab === 'overview' && (
                      <div className="space-y-6 animate-fade-in text-right">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                            <h3 className="font-extrabold text-slate-800 text-xs block border-b border-emerald-50 pb-2">📋 تقدم المقررات والمنهج الدراسي للدروس الـ١٨:</h3>
                            <div className="space-y-3 font-semibold text-xs text-right">
                              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">تابع مدى التغطية للمرجع الذكي للفيزياء عبر فئات المدرسة والصفوف المختلفة.</p>
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                                <div className="text-right">
                                  <div className="flex justify-between font-bold text-slate-700 mb-2">
                                    <span>مستوى إكمال المقررات التراكمي بمدرستكم:</span>
                                    <span>{avgSchoolProgress}%</span>
                                  </div>
                                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                                    <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${avgSchoolProgress}%` }} />
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 pt-1 text-right">
                                  <span>مكثف ومحرز: <strong className="text-indigo-900 font-black">{schoolStudentList.filter(s => s.completionRate >= 80).length} طلاب</strong></span>
                                  <span>مسار متوسط التحصيل: <strong className="text-emerald-750 font-black">{schoolStudentList.filter(s => s.completionRate >= 40 && s.completionRate < 80).length} طلاب</strong></span>
                                  <span>توجيه معلق بالمقدمات: <strong className="text-rose-650 font-black">{schoolStudentList.filter(s => s.completionRate < 40).length} طلاب</strong></span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                            <h3 className="font-extrabold text-slate-800 text-xs block border-b border-emerald-50 pb-2">📈 نسب ومعدلات الاختبارات والتحصيل الشامل بمدرستكم:</h3>
                            <div className="space-y-4 font-semibold text-xs text-slate-650 text-right">
                              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">تصف البيانات الإحصائية نسبة تفاعل طلاب المدرسة ونتائج محاولاتهم للاختبارات.</p>
                              
                              <div className="grid grid-cols-3 gap-2 text-right">
                                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                                  <span className="text-[10px] text-slate-405 block font-bold">الاختبارات الممتازة:</span>
                                  <span className="text-sm font-black font-mono text-emerald-600 block mt-1">{schoolStudentList.filter(s => s.avgPct >= 80).length} طلاب</span>
                                </div>
                                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                                  <span className="text-[10px] text-slate-405 block font-bold">محاولات الاختبار للتحصيل:</span>
                                  <span className="text-sm font-black font-mono text-indigo-700 block mt-1">{schoolScores.length} محاولات</span>
                                </div>
                                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                                  <span className="text-[10px] text-slate-405 block font-bold">متوسط درجة الفحص:</span>
                                  <span className="text-sm font-black font-mono text-amber-500 block mt-1">{avgSchoolScore} / 5</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* تبويب ترتيب الشعب للمدير */}
                    {schoolActiveDashboardTab === 'classes' && (
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 animate-fade-in text-right">
                        <div>
                          <h3 className="font-extrabold text-slate-800 text-sm">⚖️ ترتيب الشعب المدرسية الفعالة</h3>
                          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">رتب شعب وصوف مدرستك بناءً على التحصيل ومتوسط الأداء للطلاب المقترنين بالكود.</p>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-right border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-black">
                                <th className="p-3">الترتيب</th>
                                <th className="p-3">شعبة التسجيل الموحدة</th>
                                <th className="p-3">الطلاب النشطين</th>
                                <th className="p-3">متوسط الأداء الموحد</th>
                                <th className="p-3">مستوى إكمال المقرر المتوسط</th>
                                <th className="p-3">الحالة والمؤشر</th>
                              </tr>
                            </thead>
                            <tbody>
                              {classesStats.map((cls, idx) => (
                                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
                                  <td className="p-3">
                                    <span className="w-6 h-6 rounded-full bg-slate-105 bg-slate-100 font-mono font-black border border-slate-200 flex items-center justify-center text-[10px]">
                                      {idx + 1}
                                    </span>
                                  </td>
                                  <td className="p-3 font-extrabold text-slate-850">{cls.className}</td>
                                  <td className="p-3 font-semibold font-mono text-slate-650">{cls.count} طالب</td>
                                  <td className="p-3 font-black text-indigo-650">{cls.avgScore} / 5</td>
                                  <td className="p-3 font-semibold font-mono text-emerald-700">{cls.avgProgress}%</td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${idx === 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'}`}>
                                      {idx === 0 ? '🏆 الشعبة الأولى بالتحصيل والجهد' : 'شعبة نشطة'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                              {classesStats.length === 0 && (
                                <tr>
                                  <td colSpan={6} className="text-center py-10 italic font-semibold text-slate-400">لا يوجد كشوف شعب تابعة للمدرسة نشطة بعد.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                     {/* تبويب ترتيب الطلاب والنتائج التنافسية بمدرستهم فقط مع العشرة الأوائل على مستوى المنصة */}
                     {schoolActiveDashboardTab === 'students' && (() => {
                       // حساب العشرة الأوائل على مستوى الجمهورية والمنصة كاملة
                       const globalScores = scores;
                       const uniqueGlobalStudents = Array.from(new Set(globalScores.map(s => s.name))) as string[];
                       const globalStudentList = uniqueGlobalStudents.map((name) => {
                         const stdScores = globalScores.filter(s => s.name === name);
                         const currentClass = stdScores[0]?.classGroup || 'الشعبة أ';
                         const schoolName = stdScores[0]?.school || 'مدرسة ثانوية';
                         
                         let totalGot = 0;
                         let totalMax = 0;
                         stdScores.forEach(s => {
                           const parts = s.score.split('/');
                           totalGot += (parseFloat(parts[0]) || 0);
                           totalMax += (parseFloat(parts[1]) || 5);
                         });
                         
                         const avgOutOf5 = stdScores.length > 0 ? Number(((totalGot / totalMax) * 5).toFixed(1)) : 0;
                         const avgPct = stdScores.length > 0 ? Math.round((totalGot / totalMax) * 100) : 0;
                         
                         const attemptedCount = Array.from(new Set(stdScores.map(s => s.lessonId))).length;
                         const completionRate = Math.round((attemptedCount / 18) * 105);
                         const safeCompletionRate = Math.min(100, completionRate);

                         return {
                           name,
                           school: schoolName,
                           classGroup: currentClass,
                           avgOutOf5,
                           avgPct,
                           completionRate: safeCompletionRate,
                           testCount: stdScores.length
                         };
                       });

                       // أولاً: ترتيب العشرة الأوائل على مستوى الجمهورية (التكامل الوطني)
                       const nationalTop10 = [...globalStudentList]
                         .sort((a, b) => b.avgOutOf5 - a.avgOutOf5 || b.completionRate - a.completionRate || b.testCount - a.testCount)
                         .slice(0, 10);

                       // تصفية نتائج المدرسة بناءً على مدخلات البحث الحصرية
                       const schoolFilteredScores = schoolScores.filter(s => {
                         const searchVal = schoolSearchTerm.toLowerCase().trim();
                         if (!searchVal) return true;
                         
                         const matchName = s.name.toLowerCase().includes(searchVal);
                         const matchCode = s.code.toLowerCase().includes(searchVal);
                         const matchClass = s.classGroup ? s.classGroup.toLowerCase().includes(searchVal) : false;
                         
                         return matchName || matchClass || matchCode;
                       });

                       const handleExportExcelSchool = () => {
                         let csvContent = "\uFEFF"; // UTF-8 BOM
                         csvContent += "الاسم,الشعبة,الرقم السري (الكود),اسم الدرس,الدرجة,التاريخ\n";
                         
                         schoolFilteredScores.forEach(s => {
                           csvContent += `"${s.name}","${s.classGroup || 'غير معرف'}","${s.code}","${s.lessonTitle}",${s.score},"${s.date}"\n`;
                         });
                         
                         const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                         const url = URL.createObjectURL(blob);
                         const link = document.createElement("a");
                         link.setAttribute("href", url);
                         link.setAttribute("download", `نتائج_اختبارات_${schoolActiveSchool.replace(/ /g, "_")}.csv`);
                         document.body.appendChild(link);
                         link.click();
                         document.body.removeChild(link);
                       };

                       const handleTriggerSectionPrint = () => {
                         window.print();
                       };

                       // كشوف رصد الطلاب لشعبة الطباعة المحددة لنموذج المعاينة المطبوعة
                       const printClassStudents = Array.from(new Set(
                         (selectedPrintClass 
                           ? schoolScores.filter(s => s.classGroup === selectedPrintClass)
                           : schoolScores
                         ).map(s => s.name)
                       )).map(name => {
                         const stdScores = schoolScores.filter(s => s.name === name);
                         const code = stdScores[0]?.code || 'غير معرف';
                         const cls = stdScores[0]?.classGroup || 'الشعبة أ';
                         
                         let totalGot = 0;
                         let totalMax = 0;
                         stdScores.forEach(s => {
                           const parts = s.score.split('/');
                           totalGot += (parseFloat(parts[0]) || 0);
                           totalMax += (parseFloat(parts[1]) || 5);
                         });
                         
                         const avgOutOf5 = stdScores.length > 0 ? Number(((totalGot / totalMax) * 5).toFixed(1)) : 0;
                         const avgPct = stdScores.length > 0 ? Math.min(100, Math.round((totalGot / totalMax) * 100)) : 0;
                         
                         return {
                           name,
                           code,
                           classGroup: cls,
                           avgOutOf5,
                           avgPct,
                           testCount: stdScores.length
                         };
                       }).sort((a, b) => b.avgOutOf5 - a.avgOutOf5);

                       return (
                         <div className="space-y-6 animate-fade-in text-right font-sans" dir="rtl">
                           
                           {/* ==================== لوحة الصدارة الشرفية: العشرة الأوائل بالجمهورية ==================== */}
                           <div className="bg-gradient-to-r from-amber-950 via-yellow-905 to-yellow-950/25 p-5 rounded-3xl border border-amber-500/10 shadow-xs space-y-3">
                             <div className="flex items-center gap-2">
                               <span className="text-xl">🏆</span>
                               <div>
                                 <h3 className="font-extrabold text-amber-100 text-xs">نخبة الجمهورية: العشرة الأوائل وأبطال الفيزياء التنافسيون على مستوى المنصة</h3>
                                 <p className="text-[10px] text-amber-200/60 font-medium">الطلاب الحاصلون على أعلى مراتب التحصيل وسرعة إنجاز منهج الـ١٨ درساً في اليمن.</p>
                               </div>
                             </div>

                             <div className="overflow-x-auto">
                               <table className="w-full text-[11px] text-right border-collapse text-slate-200">
                                 <thead>
                                   <tr className="bg-amber-950/40 border-b border-amber-500/10 text-amber-200 font-bold">
                                     <th className="p-2 text-center">المركز</th>
                                     <th className="p-2">اسم البطل الكريم</th>
                                     <th className="p-2">الصرح التعليمي (المدرسة)</th>
                                     <th className="p-2 text-center font-bold">الشعبة</th>
                                     <th className="p-2 text-center">متوسط التحصيل التراكمي</th>
                                     <th className="p-2 text-center">إنجاز الـ١٨ درساً</th>
                                     <th className="p-2 text-center">الأوسمة ودرع التميز</th>
                                   </tr>
                                 </thead>
                                 <tbody>
                                   {nationalTop10.map((std, idx) => (
                                     <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                       <td className="p-2 text-center">
                                         <span className={`inline-flex w-5 h-5 rounded-full font-mono font-black items-center justify-center text-[9px] ${
                                           idx === 0 
                                             ? 'bg-yellow-400 text-slate-950' 
                                             : idx === 1 
                                               ? 'bg-slate-300 text-slate-950'
                                               : idx === 2
                                                 ? 'bg-amber-600 text-white'
                                                 : 'bg-white/10 text-slate-300'
                                         }`}>
                                           {idx + 1}
                                         </span>
                                       </td>
                                       <td className="p-2 font-black text-white">{std.name}</td>
                                       <td className="p-2 text-amber-200 font-bold">{std.school}</td>
                                       <td className="p-2 text-center text-slate-300 font-semibold">{std.classGroup}</td>
                                       <td className="p-2 text-center font-black text-yellow-350">{std.avgOutOf5} / 5 ({std.avgPct}%)</td>
                                       <td className="p-2 text-center font-mono text-emerald-400 font-bold">{std.completionRate}%</td>
                                       <td className="p-2 text-center">
                                         <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-md font-black">
                                           {idx === 0 ? '👑 وسام درع الصدارة الوطنية' : '🏅 وسام التميز الفائق'}
                                         </span>
                                       </td>
                                     </tr>
                                   ))}
                                 </tbody>
                               </table>
                             </div>
                           </div>

                           {/* ==================== لوحة نتائج طلاب مدرستنا المدمجة والكاملة ==================== */}
                           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                               <div>
                                 <h3 className="font-extrabold text-slate-900 text-sm">📋 كشف النتائج التنافسية ورصد علامات طلاب مدرستكم</h3>
                                 <p className="text-[10px] text-slate-400 font-semibold">عرض فوري حصرى لعلامات طلاب صرح <strong className="text-emerald-700">{schoolActiveSchool}</strong> لتسجيلات رصد المرجع الذكي.</p>
                               </div>

                               {/* أدوات التصدير والطباعة الاحترافية للمدير */}
                               <div className="flex flex-wrap items-center gap-2">
                                 <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                                   <span className="font-extrabold text-slate-650 text-[10px]">فصل الطباعة:</span>
                                   <select
                                     value={selectedPrintClass}
                                     onChange={(e) => setSelectedPrintClass(e.target.value)}
                                     className="bg-transparent font-bold outline-none text-slate-800"
                                   >
                                     <option value="">كافة شعب المدرسة</option>
                                     {schoolClassesList.map((cls, idx) => (
                                       <option key={idx} value={cls}>{cls}</option>
                                     ))}
                                   </select>
                                 </div>

                                 <button
                                   onClick={handleTriggerSectionPrint}
                                   className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-4 py-2 rounded-xl border border-indigo-700 transition-all flex items-center gap-1 cursor-pointer"
                                   title="طباعة تقرير رصد المدرسة الموجه أو شعبة مستقلة بتقرير ورقي رسمي"
                                 >
                                   🖨️ طباعة النتائج (PDF)
                                 </button>

                                 <button
                                   onClick={handleExportExcelSchool}
                                   className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2 rounded-xl border border-emerald-750 transition-all flex items-center gap-1 cursor-pointer"
                                   title="تصدير كشف العلامات بصيغة Excel/CSV تدعم اللغة العربية بالكامل"
                                 >
                                   📊 تصدير Excel
                                 </button>
                               </div>
                             </div>

                             {/* محرك البحث الحصري بالاسم، الكود، الشعبة */}
                             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                               <div className="relative">
                                 <input
                                   type="text"
                                   placeholder="ابحث فوراً بالاسم الكريم، أو الرقم السري الفردي للطالب (الكود)، أو معيار الشعبة (أ، ب)..."
                                   value={schoolSearchTerm}
                                   onChange={(e) => setSchoolSearchTerm(e.target.value)}
                                   className="w-full bg-white border border-slate-200 rounded-xl p-3 pr-4 text-xs font-semibold outline-none focus:border-emerald-600 text-right text-slate-800"
                                 />
                               </div>
                               <p className="text-[9px] text-slate-400 mt-1.5 font-medium">🔒 نظام عزل الخصوصية نشط: محرك البحث يبحث فقط ومحصور بسجلات طلاب صرحكم الدراسي الحالي.</p>
                             </div>

                             {/* جدول العلامات التفصيلي الفردي لنتائج الاختبارات والدروس */}
                             <div className="overflow-x-auto">
                               <table className="w-full text-xs text-right border-collapse">
                                 <thead>
                                   <tr className="bg-slate-50 border-b border-slate-100 text-slate-550 font-black">
                                     <th className="p-3">اسم الطالب الكريم</th>
                                     <th className="p-3 text-center">الرقم السري (الكود)</th>
                                     <th className="p-3 text-center">الشعبة</th>
                                     <th className="p-3">اسم الدرس المنهجي</th>
                                     <th className="p-3 text-center">الدرجة المحرزة</th>
                                     <th className="p-3 text-center">تاريخ الرصد الفوري</th>
                                     <th className="p-3 text-center">التقييم الوزاري</th>
                                   </tr>
                                 </thead>
                                 <tbody>
                                   {schoolFilteredScores.map((s, idx) => {
                                     const parts = s.score.split('/');
                                     const got = parseFloat(parts[0]) || 0;
                                     const max = parseFloat(parts[1]) || 5;
                                     const pct = Math.round((got / max) * 100);

                                     return (
                                       <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
                                         <td className="p-3 font-extrabold text-slate-850">{s.name}</td>
                                         <td className="p-3 text-center font-mono text-slate-550">{s.code}</td>
                                         <td className="p-3 text-center font-bold text-slate-655">{s.classGroup || 'العامة'}</td>
                                         <td className="p-3 font-semibold text-slate-700">{s.lessonTitle}</td>
                                         <td className="p-3 text-center font-black text-indigo-700">{s.score}</td>
                                         <td className="p-3 text-center font-mono text-slate-400">{s.date}</td>
                                         <td className="p-3 text-center">
                                           <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                             pct >= 90 
                                               ? 'bg-emerald-50 text-emerald-700' 
                                               : pct >= 80 
                                                 ? 'bg-blue-50 text-blue-700' 
                                                 : pct >= 55 
                                                   ? 'bg-amber-50 text-amber-700' 
                                                   : 'bg-rose-50 text-rose-700'
                                           }`}>
                                             {pct >= 90 ? 'ممتاز 🎖️' : pct >= 80 ? 'جيد جداً 👍' : pct >= 55 ? 'مستوى متوسط' : 'دون المتوسط ⚠️'}
                                           </span>
                                         </td>
                                       </tr>
                                     );
                                   })}
                                   {schoolFilteredScores.length === 0 && (
                                     <tr>
                                       <td colSpan={7} className="text-center py-10 italic font-semibold text-slate-400">لا توجد أوراق أو نتائج مطابقة لمعايير البحث المدخلة بمدرستكم.</td>
                                     </tr>
                                   )}
                                 </tbody>
                               </table>
                             </div>
                           </div>

                           {/* ============================== 🖨️ نموذج الطباعة الموجهة للوزارة والمدارس (عرض فقط عند الطباعة) ============================== */}
                           <div className="hidden print:block text-black bg-white min-h-screen p-8 text-right font-sans border-0" dir="rtl" style={{ color: '#000000', backgroundColor: '#ffffff' }}>
                             {/* ترويسة النموذج */}
                             <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4 mb-6">
                               <div className="text-right text-xs space-y-1">
                                 <p className="font-bold text-sm">الجمهورية اليمنية</p>
                                 <p>وزارة التربية والتعليم</p>
                                 <p>مكتب التربية بمحافظة صنعاء</p>
                                 <p>مدرستنا: <span className="font-extrabold">{schoolActiveSchool}</span></p>
                               </div>
                               <div className="text-center">
                                 <span className="text-3xl">🇾🇪</span>
                                 <h1 className="font-extrabold text-base mt-1 text-slate-950">كشف رصد وعلامات الفيزياء التجريبية</h1>
                                 <p className="text-[10px] text-slate-500 font-mono">منصة المرجع الذكي للفيزياء - الأستاذ سياف الشباطي</p>
                               </div>
                               <div className="text-left text-xs text-slate-500 space-y-1">
                                 <p>تاريخ الطباعة: {new Date().toLocaleDateString('ar-YE')}</p>
                                 <p>الشعبة المستهدفة: <span className="font-extrabold">{selectedPrintClass || 'جميع الفصول والشعب'}</span></p>
                                 <p>عدد المقيدين بالكشف: {printClassStudents.length} طالباً</p>
                               </div>
                             </div>

                             {/* جدول رصد الطباعة الحاد */}
                             <div className="mt-4">
                               <table className="w-full text-[11px] text-right border-collapse border border-slate-900">
                                 <thead>
                                   <tr className="bg-slate-100 text-slate-800 font-bold border border-slate-900">
                                     <th className="p-2 border border-slate-900 text-center w-10">م</th>
                                     <th className="p-2 border border-slate-900">اسم الطالب الكريم</th>
                                     <th className="p-2 border border-slate-900 text-center">الرقم السري (الكود)</th>
                                     <th className="p-2 border border-slate-900 text-center">الشعبة بالصرح</th>
                                     <th className="p-2 border border-slate-900 text-center">الاختبارات المؤداة</th>
                                     <th className="p-2 border border-slate-900 text-center">المعدل العام (من 5)</th>
                                     <th className="p-2 border border-slate-900 text-center">مستوى تقييم المنهج</th>
                                     <th className="p-2 border border-slate-900 text-center">تقدير الإنجاز</th>
                                   </tr>
                                 </thead>
                                 <tbody>
                                   {printClassStudents.map((std, idx) => (
                                     <tr key={idx} className="border border-slate-900">
                                       <td className="p-2 border border-slate-900 text-center font-mono font-bold">{idx + 1}</td>
                                       <td className="p-2 border border-slate-900 font-bold">{std.name}</td>
                                       <td className="p-2 border border-slate-900 text-center font-mono">{std.code}</td>
                                       <td className="p-2 border border-slate-900 text-center">{std.classGroup}</td>
                                       <td className="p-2 border border-slate-900 text-center font-mono">{std.testCount} / 18</td>
                                       <td className="p-2 border border-slate-900 text-center font-mono font-bold">{std.avgOutOf5} / 5</td>
                                       <td className="p-2 border border-slate-900 text-center font-mono font-bold">{std.avgPct}%</td>
                                       <td className="p-2 border border-slate-900 text-center font-bold">
                                         {std.avgPct >= 90 ? 'ممتاز مرتفع 🎖️' : std.avgPct >= 80 ? 'جيد جداً 👍' : std.avgPct >= 70 ? 'جيد' : std.avgPct >= 60 ? 'مقبول' : 'بحاجة لتدخل ومساعدة ⚠️'}
                                       </td>
                                     </tr>
                                   ))}
                                   {printClassStudents.length === 0 && (
                                     <tr>
                                       <td colSpan={8} className="text-center py-6 border border-slate-900">لا يوجد كشف رصد علامات لطباعته.</td>
                                     </tr>
                                   )}
                                 </tbody>
                               </table>
                             </div>

                             {/* التوقيعات الرسمية */}
                             <div className="mt-12 grid grid-cols-3 gap-4 text-center text-xs font-bold pt-6 border-t border-slate-400">
                               <div>
                                 <p className="underline text-slate-950 font-black">منسق منصة المرجع الذكي</p>
                                 <p className="mt-10">الاسم والتوقيع: ......................................</p>
                               </div>
                               <div>
                                 <p className="underline text-slate-950 font-black">المعلم الموجه للمادة (أ. سياف)</p>
                                 <p className="mt-10">الاسم والتوقيع: .......................................</p>
                               </div>
                               <div>
                                 <p className="underline text-slate-950 font-black">مدير الصرح المدرسي والختم</p>
                                 <p className="mt-10">الختم والتوقيع: .......................................</p>
                               </div>
                             </div>
                           </div>

                         </div>
                       );
                     })()}

                    {/* تبويب التنبيهات والأداء المتأخر للمدير */}
                    {schoolActiveDashboardTab === 'alerts' && (
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 animate-fade-in text-right">
                        <div>
                          <h3 className="font-extrabold text-slate-800 text-sm">🚨 كشف ومراقبة حالات التدخل المدرك والدعم</h3>
                          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">يعزل البرنامج تلقائياً الطلاب في مدرستكم الحاصلين على تحصيل أقل من 60% لاتخاذ التدابير اللازمة.</p>
                        </div>

                        <div className="space-y-2 text-right">
                          {schoolStruggling.map((std, idx) => (
                            <div key={idx} className="bg-rose-50/30 p-4 rounded-2xl border border-rose-100 flex justify-between items-center text-xs text-right">
                              <div className="space-y-1 text-right">
                                <h4 className="font-extrabold text-slate-850 text-xs">{std.name} ({std.classGroup})</h4>
                                <p className="text-slate-450 text-[10px] block">درجة الكفاءة التراكمية بالامتحانات: <strong className="text-rose-600 font-black">{std.avgOutOf5} / 5 ({std.avgPct}%)</strong></p>
                              </div>
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-750 rounded-lg text-[10px] font-black">⚠️ بحاجة لتدخل مساند سريع بالصرح</span>
                            </div>
                          ))}
                          {schoolStruggling.length === 0 && (
                            <p className="text-center italic font-semibold text-emerald-600 py-10 text-xs">👏 نهنئكم! لا توجد حالات تعثر مدرسي نشطة في الصرح التعليمي حالياً، مستويات الطلاب متميزة.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {schoolActiveDashboardTab === 'reports' && (
                      <ReportCenter 
                        currentUserType="school"
                        schools={schools}
                        scores={scores}
                        studentAttendances={studentAttendances}
                        teachers={teachers}
                        allLessons={allLessons}
                        selectedSchoolName={studentSchool || ''}
                      />
                    )}
                    
                  </div>
                );
              })()}

              {/* تصفية الكشوف بناءً على مدخلات البحث */}
              {['superadmin', 'teacher'].includes(currentUserType) && (() => {
                const filteredScores = scores.filter(s => {
                  const matchName = s.name.toLowerCase().includes(teacherSearchTerm.toLowerCase());
                  const matchSchool = teacherSelectedSchool ? s.school.includes(teacherSelectedSchool) : true;
                  return matchName && matchSchool;
                });

                const totalTests = scores.length;
                const uniqueStsCount = Array.from(new Set(scores.map(s => s.name))).length;
                
                let globalTotalGot = 0;
                let globalTotalMax = 0;
                scores.forEach(s => {
                  const parts = s.score.split('/');
                  globalTotalGot += parseFloat(parts[0]) || 0;
                  globalTotalMax += parseFloat(parts[1]) || 5;
                });
                const avgScoreGlobal = globalTotalMax > 0 ? Math.round((globalTotalGot / globalTotalMax) * 105) : 0;
                const schoolOptions = Array.from(new Set(schools.map(s => s.name)));

                const lessonsPerformanceList = allLessons.map(lesson => {
                  const lessonScores = scores.filter(s => s.lessonId === lesson.id);
                  let gotSum = 0;
                  let maxSum = 0;
                  lessonScores.forEach(s => {
                    const parts = s.score.split('/');
                    gotSum += parseFloat(parts[0]) || 0;
                    maxSum += parseFloat(parts[1]) || 5;
                  });
                  const pct = maxSum > 0 ? Math.round((gotSum / maxSum) * 100) : 0;
                  const avg = maxSum > 0 ? Number(((gotSum / maxSum) * 5).toFixed(1)) : 0;
                  return {
                    id: lesson.id,
                    title: lesson.title,
                    count: lessonScores.length,
                    pct,
                    avg
                  };
                });

                return (
                <div className="space-y-6 w-full animate-fade-in" dir="rtl">
                  
                  {/* أ. لوحة المعلم والمشرف للمؤشرات الكلية الفورية (KPI Dashboard Grid) */}
                  {(currentUserType === 'superadmin' || currentUserType === 'teacher' || currentUserType === 'school') && (
                    <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-3xl p-6 text-white space-y-5 shadow-lg border border-indigo-900">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400">منظومة الإحصاء القياسي الموحدة (LMS Admin Control)</span>
                          <h2 className="text-base font-black text-white">📡 لوحة تمكين ومتابعة التحصيل العلمي للمدارس والمعلمين</h2>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <button 
                            onClick={() => window.print()}
                            className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1.5 rounded-lg border border-white/15 transition-all text-[11px] cursor-pointer"
                          >
                            🖨️ طباعة تقرير الرصد العام
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* كرت 1 */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5">
                          <span className="text-slate-350 text-[10px] font-bold block">إجمالي أوراق الرصد المستلمة:</span>
                          <span className="text-2xl font-black font-mono text-amber-400 block mt-1">{totalTests} <span className="text-xs font-semibold text-white">امتحانًا</span></span>
                          <p className="text-[9px] text-slate-400 mt-1">كافة کُشوف السير المرفوعة والنشطة.</p>
                        </div>

                        {/* كرت 2 */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5">
                          <span className="text-slate-350 text-[10px] font-bold block">الطلاب المسجلون تحت المنصة:</span>
                          <span className="text-2xl font-black font-mono text-emerald-400 block mt-1">{uniqueStsCount} <span className="text-xs font-semibold text-white">طالبًا</span></span>
                          <p className="text-[9px] text-slate-400 mt-1">المفحوصين بنجاح بدخول رسمي.</p>
                        </div>

                        {/* كرت 3 */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5">
                          <span className="text-slate-350 text-[10px] font-bold block">المعدل وصحة الأداء المتوسط:</span>
                          <span className="text-2xl font-black font-mono text-sky-400 block mt-1">{avgScoreGlobal} <span className="text-xs font-semibold text-white">/ 5</span></span>
                          <p className="text-[9px] text-slate-400 mt-1">مؤشر التحصيل الجماعي الفعلي للدروس.</p>
                        </div>

                        {/* كرت 4 */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5">
                          <span className="text-slate-350 text-[10px] font-bold block">المدارس الفعالة علمياً:</span>
                          <span className="text-2xl font-black font-mono text-pink-400 block mt-1">{schoolOptions.length} <span className="text-xs font-semibold text-white">مؤسسة</span></span>
                          <p className="text-[9px] text-slate-400 mt-1">المدارس المانحة لكود الترخيص.</p>
                        </div>
                      </div>

                      {/* ب. تشخيص المنحنى العلمي للتحصيل (Class Learning Curve Metrics) */}
                      <div className="bg-slate-900/40 p-5 rounded-2xl border border-white/5">
                        <span className="text-amber-400 text-[10px] font-black block mb-3.5 flex items-center gap-1">
                          📊 منحنى التحجيم التشخيصي للتحصيل على مستوى المقررات المنهجية:
                        </span>
                        
                        {lessonsPerformanceList.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {lessonsPerformanceList.map((perf, idx) => (
                              <div key={idx} className="bg-indigo-950/40 p-3 rounded-xl border border-white/5 space-y-1.5 text-xs">
                                <div className="flex justify-between font-bold text-slate-100">
                                  <span className="truncate max-w-[200px]">{perf.title}</span>
                                  <span className="font-mono text-amber-400">{perf.avg} / 5 ({perf.pct}%)</span>
                                </div>
                                <div className="w-full h-2.5 bg-slate-900/80 rounded-full overflow-hidden border border-white/10">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                      perf.pct < 50 
                                        ? 'bg-gradient-to-r from-rose-500 to-rose-450' 
                                        : perf.pct < 75 
                                          ? 'bg-gradient-to-r from-amber-400 to-amber-500' 
                                          : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                    }`}
                                    style={{ width: `${perf.pct}%` }}
                                  />
                                </div>
                                <p className="text-[9px] text-slate-405">
                                  {perf.pct < 50 && '🔴 ثغرة ملموسة! يرجى الاستدراك وإعادة التطرق لقوانين هذا المبحث بالصف.'}
                                  {perf.pct >= 50 && perf.pct < 75 && '🟡 درجة تفاؤلية آمنة تتطلب تعزيز التدريبات والحلول الإثرائية.'}
                                  {perf.pct >= 75 && '🟢 تمكن متفوق وموثوق لمجسمات ومفاهيم السقوط والحركة العلمية!.'}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-slate-400 text-[11px] font-semibold italic">
                            أجرِ أحد الطلاب الكرام امتحاناً منهجياً لتوليد منحنى التحصيل والمقارنة التربوية هنا.
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* كشف النتائج والتسجيل العام لجميع الطلاب */}
                    <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                      
                      {/* ب. مصفاة وباحث الطلاب الكهفيين */}
                      <div className="flex flex-col sm:flex-row gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 items-center justify-between">
                        <div className="w-full sm:w-1/2 flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                          <input 
                            type="text" 
                            placeholder="🔍 ابحث عن اسم طالب معين..."
                            value={teacherSearchTerm}
                            onChange={(e) => setTeacherSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none w-full text-xs text-slate-800"
                          />
                        </div>
                        
                        <div className="w-full sm:w-1/2 flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                          <select 
                            value={teacherSelectedSchool}
                            onChange={(e) => setTeacherSelectedSchool(e.target.value)}
                            className="bg-transparent border-none outline-none w-full text-xs text-slate-700 font-bold"
                          >
                            <option value="">🏫 جميع المدارس المشاركة</option>
                            {schoolOptions.map((sch, i) => (
                              <option key={i} value={sch}>{sch}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                          <Trophy size={16} className="text-yellow-500" />
                          <span>🏆 كشف النتائج التنافسي الفوري (لوحة الشرف الوطنية):</span>
                        </span>
                        <button 
                          onClick={() => {
                            const csvContent = "data:text/csv;charset=utf-8," 
                              + ["الاسم,المدرسة,الدرس,النتيجة,تاريخ السجل"].join(",") + "\n"
                              + filteredScores.map(s => `"${s.name}","${s.school}","${s.lessonTitle}","${s.score}","${s.date}"`).join("\n");
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", "sayyaf_students_report.csv");
                            document.body.appendChild(link);
                            link.click();
                          }}
                          className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Download size={12} />
                          <span>تنزيل التقرير المالي CSV</span>
                        </button>
                      </div>

                      <div className="overflow-x-auto text-xs">
                        {filteredScores.length > 0 ? (
                          <table className="w-full text-right border-collapse">
                            <thead>
                              <tr className="bg-slate-50 text-slate-600 border-b border-slate-100">
                                <th className="p-3 font-bold">م</th>
                                <th className="p-3 font-bold">اسم الطالب الكريم</th>
                                <th className="p-3 font-bold">المدرسة المرتبطة</th>
                                <th className="p-3 font-bold">المقرر / الدرس المختبر</th>
                                <th className="p-3 font-bold text-center">الرصد والدرجة</th>
                                {(currentUserType === 'superadmin' || currentUserType === 'teacher') && <th className="p-3 text-center font-bold">صلاحيات</th>}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-55">
                              {filteredScores.map((s, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                              <td className="p-3 font-bold text-slate-800">{s.name}</td>
                              <td className="p-3 text-slate-600 font-semibold">{s.school}</td>
                              <td className="p-3 text-indigo-900 font-semibold">{s.lessonTitle}</td>
                              <td className="p-3 text-center">
                                <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full font-bold font-mono">
                                  {s.score}
                                </span>
                              </td>
                              {(currentUserType === 'superadmin' || currentUserType === 'teacher') && (
                                <td className="p-3 text-center">
                                  <button 
                                    onClick={() => handleDeleteScore(idx)}
                                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                    title="حذف هذا الرصد للطلاب"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-8 text-slate-400 font-semibold italic">
                        📭 لا توجد نتائج مرصودة حتى الآن. قدم درساً واختبر ليرى زملائك درجتك في لوحة الصدارة الشرفية!
                      </div>
                    )}
                  </div>
                </div>

                {/* لوحة الإدارة العليا (فعالة ومكتملة للأستاذ سياف) */}
                {(currentUserType === 'superadmin' || currentUserType === 'teacher' || currentUserType === 'school') && (
                  <div className="lg:col-span-4 space-y-6">
                    
                    {/* تم سحب لوحة الأكواد من هذه المنطقة وقصرها على المالك العام لضمان التأمين والأمان المطلق للمقرر */}

                    {/* إدارة المدارس والشُعَب الثانوية المسجلة بالمنصة */}
                    {currentUserType === 'superadmin' && (
                      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
                        <span className="font-extrabold text-slate-800 text-xs block border-b border-slate-55 pb-2">
                          🏫 تسجيل وإلحاق مدرسة ثانوية جديدة باليمن:
                        </span>

                        <form onSubmit={handleAddSchool} className="space-y-3 text-xs">
                          <input
                            type="text"
                            placeholder="اسم المدرسة والجمهورية بالكامل..."
                            value={newSchoolName}
                            onChange={(e) => setNewSchoolName(e.target.value)}
                            required
                            className="w-full bg-slate-50 border border-slate-250 p-2 rounded-lg outline-none"
                          />
                          <button
                            type="submit"
                            className="w-full py-2 bg-blue-750 hover:bg-blue-700 text-white rounded-lg font-bold cursor-pointer"
                          >
                            إضافة المدرسة للمنصة
                          </button>
                        </form>
                      </div>
                    )}

                    {/* المالك العام وحده هو المخول بالاطلاع على التراخيص وأكواد الدخول */}

                  </div>
                )}

                </div>
              </div>
              );
            })()}

          </div>
        )}

      </main>

    </div>
  );
}
