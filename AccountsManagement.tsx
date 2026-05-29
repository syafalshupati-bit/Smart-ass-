import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Download, 
  Printer,
  Eye, 
  EyeOff, 
  RefreshCw,
  Check,
  AlertTriangle,
  X,
  Bell,
  BookOpen,
  School as SchoolIcon,
  ShieldAlert,
  Save,
  KeyRound
} from 'lucide-react';
import { Teacher, School, StudentAccount, SchoolManager } from '../types';

interface AccountsManagementProps {
  currentUserType: 'superadmin' | 'super_admin' | 'school' | 'teacher' | 'student' | 'guest';
  schools: School[];
  teachers: Teacher[];
  onUpdateTeachers: (updated: Teacher[]) => void;
  studentAccounts: StudentAccount[];
  onUpdateStudentAccounts: (updated: StudentAccount[]) => void;
  schoolManagers: SchoolManager[];
  onUpdateSchoolManagers: (updated: SchoolManager[]) => void;
}

export function AccountsManagement({
  currentUserType,
  schools,
  teachers,
  onUpdateTeachers,
  studentAccounts,
  onUpdateStudentAccounts,
  schoolManagers,
  onUpdateSchoolManagers
}: AccountsManagementProps) {

  // --- التحقق من الصلاحيات والمنع الصارم لمصادر أخرى ---
  const isAuthorized = currentUserType === 'superadmin' || currentUserType === 'super_admin';

  if (!isAuthorized) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-8 bg-slate-900 border border-rose-500/30 rounded-3xl text-right text-white shadow-xl space-y-4 animate-fade-in" dir="rtl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-2">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-black text-rose-400">⚠️ خطأ في الصلاحيات والأمان السيادي!</h2>
        <p className="text-slate-300 text-xs leading-relaxed font-semibold">
          عذراً، هذا القسم يقع تحت درع الحماية الفولاذية للمنصة ومقيد تفعيله حصراً لـ <strong className="text-amber-400 font-extrabold">المدير العام للمنصة (الأستاذ سياف الشباطي)</strong>. لا يمكن لمكامن الدخول الفرعية أو الزوار مراجعة البيانات السرية والأرقام التوجيهية للطلاب.
        </p>
      </div>
    );
  }

  // --- الحالات والتبويبات الداخلية ---
  // التبويب النشط بين الجداول الثلاثة: 'teachers' | 'managers' | 'students'
  const [activeTab, setActiveTab] = useState<'teachers' | 'managers' | 'students'>('teachers');

  // --- حالات الفرز والبحث والفلترة المتكاملة ---
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSchool, setSearchSchool] = useState('');
  const [searchClass, setSearchClass] = useState('');
  const [searchUsername, setSearchUsername] = useState('');
  
  // الفلترة الذكية: 'all' | 'active' | 'suspended' | 'expired_students'
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'expired_students'>('all');

  // --- حالة كلمات المرور المرئية ---
  // خارطة لتخزين معرفات الحسابات التي يتم إظهار كلماتها السرية
  const [visiblePasswords, setVisiblePasswords] = useState<{ [key: string]: boolean }>({});

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // --- نظام التنبيهات المحمول الذكي (Toasts / Custom Alerts) ---
  const [alerts, setAlerts] = useState<{ id: string; type: 'success' | 'warning' | 'info' | 'danger'; text: string }[]>([]);

  const addAlert = (type: 'success' | 'warning' | 'info' | 'danger', text: string) => {
    const id = Date.now().toString();
    setAlerts(prev => [...prev, { id, type, text }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(al => al.id !== id));
    }, 5000);
  };

  // --- توليد كلمة مرور عشوائية قوية ---
  const generateStrongPassword = (): string => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
    let pwd = "";
    // نضمن وجود حرف كبير وصغير ورقم ورمز
    pwd += chars.charAt(Math.floor(Math.random() * 24)); // uppercase
    pwd += chars.charAt(24 + Math.floor(Math.random() * 24)); // lowercase
    pwd += chars.charAt(48 + Math.floor(Math.random() * 8)); // digit
    pwd += chars.charAt(56 + Math.floor(Math.random() * 8)); // symbol
    
    for (let i = 0; i < 4; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // خلط الأحرف
    return pwd.split('').sort(() => 0.5 - Math.random()).join('');
  };

  // --- النوافذ المنبثقة (Modals) للإضافة والتعديل ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // الحساب المختار للتعديل
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // حقول حزمة النماذج الموحدة لمختلف الأنواع
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formSchoolId, setFormSchoolId] = useState('');
  const [formSchoolName, setFormSchoolName] = useState('');
  const [formClassGroup, setFormClassGroup] = useState('الشعبة أ');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formConfirmPassword, setFormConfirmPassword] = useState('');
  const [formPermissions, setFormPermissions] = useState('all');
  const [formStatus, setFormStatus] = useState<'active' | 'suspended'>('active');
  const [formExpireDate, setFormExpireDate] = useState('2027-12-31');

  // فتح نافذة جديدة مع توليد فوري لباسورد عشوائي لمنع روتين العمل
  const openNewAccountModal = () => {
    setFormName('');
    setFormPhone('');
    setFormSubject('الفيزياء المنهجية');
    
    if (schools.length > 0) {
      setFormSchoolId(schools[0].id);
      setFormSchoolName(schools[0].name);
    } else {
      setFormSchoolId('');
      setFormSchoolName('ثانوية جمال عبد الناصر للمتفوقين - صنعاء');
    }
    
    setFormClassGroup('الشعبة أ');
    setFormUsername('');
    setFormPermissions('all');
    setFormStatus('active');
    
    // الأستاذ سياف يحصل دائماً على تواريخ انتهاء جيدة افتراضياً
    const dateObj = new Date();
    dateObj.setFullYear(dateObj.getFullYear() + 1);
    setFormExpireDate(dateObj.toISOString().split('T')[0]);

    // توليد الرقم السري التلقائي القوي
    const strongPass = generateStrongPassword();
    setFormPassword(strongPass);
    setFormConfirmPassword(strongPass);

    setShowAddModal(true);
  };

  // توليد يدوي لباسورد جديد داخل المودال عند رغبة المدير
  const handleRegeneratePasswordInForm = () => {
    const strongPass = generateStrongPassword();
    setFormPassword(strongPass);
    setFormConfirmPassword(strongPass);
    addAlert('info', 'تم توليد رقم سري قوي عشوائي بنجاح! يمكنك تعديله خطوة بخطوة.');
  };

  // التحقق من تكرار الرقم السري أو اسم المستخدم
  const checkDuplicateUsernameOrPassword = (username: string, password?: string, excludeId?: string): boolean => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password?.trim();

    // فحص المعلمين
    for (const t of teachers) {
      if (t.id === excludeId) continue;
      if (t.username?.trim().toLowerCase() === cleanUser) return true;
      if (cleanPass && t.password?.trim() === cleanPass) return true;
    }

    // فحص المدراء
    for (const m of schoolManagers) {
      if (m.id === excludeId) continue;
      if (m.username.trim().toLowerCase() === cleanUser) return true;
      if (cleanPass && m.password?.trim() === cleanPass) return true;
    }

    // فحص الطلاب
    for (const s of studentAccounts) {
      if (s.id === excludeId) continue;
      if (s.username.trim().toLowerCase() === cleanUser) return true;
      if (cleanPass && s.password?.trim() === cleanPass) return true;
    }

    return false;
  };

  // --- حفظ الحساب الجديد (إضافة) ---
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || !formUsername.trim() || !formPassword.trim()) {
      addAlert('danger', '⚠️ يرجى تعبئة كافة الحقول الأساسية لإنشاء الحساب.');
      return;
    }

    if (formPassword !== formConfirmPassword) {
      addAlert('danger', '❌ خطأ: كلمتا المرور وتأكيد المرور غير متطابقتين!');
      return;
    }

    // فحص تكرار البيانات لمنع الاختراق أو الاصطدام داخل الكاش
    if (checkDuplicateUsernameOrPassword(formUsername, formPassword)) {
      addAlert('danger', '🛑 خطأ: هذا الرقم السري مرتبط بمستخدم آخر أو اسم المستخدم مستعمل بالفعل في حساب آخر بالمنصة!');
      return;
    }

    const uniqueId = activeTab[0] + "_" + Date.now();

    if (activeTab === 'teachers') {
      const newTeacher: Teacher = {
        id: uniqueId,
        name: formName.trim(),
        schoolId: formSchoolId || (schools.length > 0 ? schools[0].id : "s1"),
        username: formUsername.trim(),
        password: formPassword.trim(),
        status: formStatus,
        phone: formPhone.trim(),
        subject: formSubject.trim(),
        myClasses: [formClassGroup]
      };
      onUpdateTeachers([...teachers, newTeacher]);
      addAlert('success', `🟢 تم إنشاء حساب المعلم الموجه [${newTeacher.name}] بنجاح، وربطه بمدرسته بنجاح.`);

    } else if (activeTab === 'managers') {
      const newMgr: SchoolManager = {
        id: uniqueId,
        name: formName.trim(),
        schoolName: formSchoolName || (schools.length > 0 ? schools[0].name : "إدارة منسقي المدارس العام"),
        username: formUsername.trim(),
        password: formPassword.trim(),
        permissions: formPermissions,
        status: formStatus
      };
      onUpdateSchoolManagers([...schoolManagers, newMgr]);
      addAlert('success', `🟢 تم تسجيل المنسق الإداري [${newMgr.name}] وتعيينه على مدرسة [${newMgr.schoolName}].`);

    } else if (activeTab === 'students') {
      const newSt: StudentAccount = {
        id: uniqueId,
        name: formName.trim(),
        classGroup: formClassGroup,
        schoolName: formSchoolName || "ثانوية جمال عبد الناصر للمتفوقين - صنعاء",
        username: formUsername.trim(),
        password: formPassword.trim(),
        status: formStatus,
        expireDate: formExpireDate
      };
      onUpdateStudentAccounts([...studentAccounts, newSt]);
      addAlert('success', `🟢 تم رصد الطالب [${newSt.name}] بنجاح، وجدولة انتهاء اشتراكه بتاريخ [${newSt.expireDate}].`);
    }

    setShowAddModal(false);
  };

  // --- تشغيل وضع التعديل لحساب معين ---
  const handleEditClick = (item: any) => {
    setSelectedItem(item);
    setFormName(item.name || '');
    setFormUsername(item.username || '');
    setFormPassword(item.password || '');
    setFormConfirmPassword(item.password || '');
    setFormStatus(item.status || 'active');

    if (activeTab === 'teachers') {
      setFormPhone(item.phone || '');
      setFormSubject(item.subject || 'الفيزياء المنهجية');
      setFormSchoolId(item.schoolId || '');
    } else if (activeTab === 'managers') {
      setFormSchoolName(item.schoolName || '');
      setFormPermissions(item.permissions || 'all');
    } else if (activeTab === 'students') {
      setFormClassGroup(item.classGroup || 'الشعبة أ');
      setFormSchoolName(item.schoolName || '');
      setFormExpireDate(item.expireDate || '2027-12-31');
    }

    setShowEditModal(true);
  };

  // --- حفظ الحساب المعدل ---
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || !formUsername.trim() || !formPassword.trim()) {
      addAlert('danger', '⚠️ لا يمكن حفظ حساب بحقول فارغة.');
      return;
    }

    if (formPassword !== formConfirmPassword) {
      addAlert('danger', '❌ خطأ: كلمتا المرور وتأكيد المرور غير متطابقتين!');
      return;
    }

    if (checkDuplicateUsernameOrPassword(formUsername, formPassword, selectedItem.id)) {
      addAlert('danger', '🛑 تنبيه تكرار: البيانات المدخلة مكررة ومحفوظة لدى مستخدم آخر!');
      return;
    }

    if (activeTab === 'teachers') {
      const updated = teachers.map(t => t.id === selectedItem.id ? {
        ...t,
        name: formName.trim(),
        username: formUsername.trim(),
        password: formPassword.trim(),
        status: formStatus,
        phone: formPhone.trim(),
        subject: formSubject.trim(),
        schoolId: formSchoolId
      } : t);
      onUpdateTeachers(updated);
      addAlert('success', `💾 تم حياكة وتعديل بيانات المعلم [${formName}] بنجاح وتحديث السجلات المقررة.`);

    } else if (activeTab === 'managers') {
      const updated = schoolManagers.map(m => m.id === selectedItem.id ? {
        ...m,
        name: formName.trim(),
        username: formUsername.trim(),
        password: formPassword.trim(),
        status: formStatus,
        schoolName: formSchoolName,
        permissions: formPermissions
      } : m);
      onUpdateSchoolManagers(updated);
      addAlert('success', `💾 تم حفظ تعديلات المنسق الإداري [${formName}] في ملفات قاعدة المزامنة.`);

    } else if (activeTab === 'students') {
      const updated = studentAccounts.map(s => s.id === selectedItem.id ? {
        ...s,
        name: formName.trim(),
        username: formUsername.trim(),
        password: formPassword.trim(),
        status: formStatus,
        schoolName: formSchoolName,
        classGroup: formClassGroup,
        expireDate: formExpireDate
      } : s);
      onUpdateStudentAccounts(updated);
      addAlert('success', `💾 تم ملاءمة تعديلات الطالب [${formName}] وتحديث تاريخ اشتراكه [${formExpireDate}].`);
    }

    setShowEditModal(false);
    setSelectedItem(null);
  };

  // --- حذف حساب نهائياً ---
  const handleDeleteAccount = (id: string, name: string) => {
    if (confirm(`🚨 هل أنت متأكد تماماً من عزل وحذف حساب [${name}] نهائياً من مصفوفة المنصة؟ لن تتمكن من استرجاعه!`)) {
      if (activeTab === 'teachers') {
        onUpdateTeachers(teachers.filter(t => t.id !== id));
        addAlert('warning', `🗑️ تم مسح حساب المعلم الموجه [${name}] من نظام الكادر بشكل نهائي.`);
      } else if (activeTab === 'managers') {
        onUpdateSchoolManagers(schoolManagers.filter(m => m.id !== id));
        addAlert('warning', `🗑️ تم شطب المنسق [${name}] وعزل صلاحياته التابعة للمدرية.`);
      } else if (activeTab === 'students') {
        onUpdateStudentAccounts(studentAccounts.filter(s => s.id !== id));
        addAlert('warning', `🗑️ تم تجميد وإلغاء حساب الطالب [${name}] تماماً من السيرفر.`);
      }
    }
  };

  // --- تفعيل أو إيقاف سريع للحساب بكبسة واحدة ---
  const handleToggleStatus = (id: string, currentStatus: 'active' | 'suspended', name: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const alertLabel = nextStatus === 'active' ? 'تنشيط وملاءمة' : 'تجميد وتعليق';

    if (activeTab === 'teachers') {
      onUpdateTeachers(teachers.map(t => t.id === id ? { ...t, status: nextStatus } : t));
    } else if (activeTab === 'managers') {
      onUpdateSchoolManagers(schoolManagers.map(m => m.id === id ? { ...m, status: nextStatus } : m));
    } else if (activeTab === 'students') {
      onUpdateStudentAccounts(studentAccounts.map(s => s.id === id ? { ...s, status: nextStatus } : s));
    }

    addAlert('info', `⚡ تم إجراء (${alertLabel}) حساب [${name}] بنجاح.`);
  };

  // --- حساب الإحصائيات الفورية الشاملة للمنصة ---
  const statistics = useMemo(() => {
    const totalStudents = studentAccounts.length;
    const totalTeachers = teachers.length;
    const totalManagers = schoolManagers.length;

    // حساب النشط والمعطل بمختلف القوائم
    let active = 0;
    let suspended = 0;

    teachers.forEach(t => t.status === 'suspended' ? suspended++ : active++);
    schoolManagers.forEach(m => m.status === 'suspended' ? suspended++ : active++);
    studentAccounts.forEach(s => s.status === 'suspended' ? suspended++ : active++);

    return {
      totalStudents,
      totalTeachers,
      totalManagers,
      active,
      suspended,
      totalAccounts: totalStudents + totalTeachers + totalManagers
    };
  }, [studentAccounts, teachers, schoolManagers]);

  // --- تصفيات ذكية وبحث متكامل لكل تبويب ---
  const filteredData = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    if (activeTab === 'teachers') {
      return teachers.filter(t => {
        // فحص مدخلات البحث
        const matchName = t.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchSchool = searchSchool ? schools.find(s => s.id === t.schoolId)?.name.includes(searchSchool) : true;
        const matchUsername = t.username?.toLowerCase().includes(searchUsername.toLowerCase()) ?? true;

        // فحص الفلترة الذكية
        let matchFilter = true;
        if (filterStatus === 'active') matchFilter = t.status !== 'suspended';
        else if (filterStatus === 'suspended') matchFilter = t.status === 'suspended';
        else if (filterStatus === 'expired_students') matchFilter = false; // لا ينطبق على المعلم

        return matchName && matchSchool && matchUsername && matchFilter;
      });

    } else if (activeTab === 'managers') {
      return schoolManagers.filter(m => {
        const matchName = m.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchSchool = searchSchool ? m.schoolName.includes(searchSchool) : true;
        const matchUsername = m.username.toLowerCase().includes(searchUsername.toLowerCase());

        let matchFilter = true;
        if (filterStatus === 'active') matchFilter = m.status !== 'suspended';
        else if (filterStatus === 'suspended') matchFilter = m.status === 'suspended';
        else if (filterStatus === 'expired_students') matchFilter = false;

        return matchName && matchSchool && matchUsername && matchFilter;
      });

    } else { // students
      return studentAccounts.filter(s => {
        const matchName = s.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchSchool = searchSchool ? s.schoolName.includes(searchSchool) : true;
        const matchClass = searchClass ? s.classGroup.includes(searchClass) : true;
        const matchUsername = s.username.toLowerCase().includes(searchUsername.toLowerCase());

        let matchFilter = true;
        if (filterStatus === 'active') matchFilter = s.status !== 'suspended';
        else if (filterStatus === 'suspended') matchFilter = s.status === 'suspended';
        else if (filterStatus === 'expired_students') {
          matchFilter = s.expireDate < today;
        }

        return matchName && matchSchool && matchClass && matchUsername && matchFilter;
      });
    }
  }, [activeTab, teachers, schoolManagers, studentAccounts, searchTerm, searchSchool, searchClass, searchUsername, filterStatus, schools]);

  // --- رصد الطلاب المنتهية اشتراكاتهم لعرض تنبيه ذكي ---
  const expiredStudentsCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return studentAccounts.filter(s => s.expireDate < today).length;
  }, [studentAccounts]);

  // --- التصدير إلى إكسل (CSV) ---
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (activeTab === 'teachers') {
      headers = ['الرقم التسلسلي', 'اسم المدرس', 'رقم الهاتف', 'المادة', 'اسم المستخدم', 'الرقم السري', 'المدرسة التابعة', 'الحالة'];
      rows = filteredData.map((t: Teacher, idx) => {
        const sch = schools.find(s => s.id === t.schoolId)?.name || 'غير محدد';
        return [
          (idx + 1).toString(),
          t.name,
          t.phone || 'غير مسجل',
          t.subject || 'فيزياء',
          t.username || 'لا يوجد',
          t.password || 'مخفي',
          sch,
          t.status === 'suspended' ? 'معطل' : 'نشط'
        ];
      });
    } else if (activeTab === 'managers') {
      headers = ['الرقم التسلسلي', 'اسم المدير', 'المدرسة المرتبطة', 'اسم المستخدم', 'الرقم السري', 'الصلاحيات', 'الحالة'];
      rows = filteredData.map((m: SchoolManager, idx) => [
        (idx + 1).toString(),
        m.name,
        m.schoolName,
        m.username,
        m.password || 'مخفي',
        m.permissions === 'all' ? 'كاملة' : 'مقيدة',
        m.status === 'suspended' ? 'معطل' : 'نشط'
      ]);
    } else if (activeTab === 'students') {
      headers = ['الرقم التسلسلي', 'اسم الطالب الكافي', 'الصف / الشعبة', 'المدرسة', 'اسم المستخدم', 'الرقم السري', 'حالة الاشتراك', 'تاريخ الانتهاء'];
      rows = filteredData.map((s: StudentAccount, idx) => [
        (idx + 1).toString(),
        s.name,
        s.classGroup,
        s.schoolName,
        s.username,
        s.password || 'مخفي',
        s.status === 'suspended' ? 'معطل كلياً' : 'ساري',
        s.expireDate
      ]);
    }

    // بناء محتوى CSV بترميز متوافق مع اللغة العربية ببرنامج Excel
    const csvContent = "\uFEFF" // UTF-8 BOM
      + [headers.join(",")].concat(rows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sayyaf_accounts_report_${activeTab}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addAlert('success', `📥 تم تصدير الكشوف المفلترة بنجاح بصيغة CSV المتوافقة مع Microsoft Excel!`);
  };

  // --- تشغيل الطباعة بالمتصفح ---
  const handlePrint = () => {
    window.print();
    addAlert('info', '🖨️ تم تشغيل قنوات الطباعة الفورية للمتصفح المكتبي.');
  };

  return (
    <div className="space-y-6 text-right pb-12 select-none" dir="rtl">
      
      {/* نظام التنبيهات المنبثقة التلقائي */}
      <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2.5 max-w-sm w-full font-bold text-xs" style={{ direction: 'rtl' }}>
        {alerts.map(al => (
          <div 
            key={al.id} 
            className={`p-3.5 rounded-2xl border shadow-xl flex items-center gap-3 animate-slide-in transition-all text-white ${
              al.type === 'success' ? 'bg-emerald-600 border-emerald-500' :
              al.type === 'warning' ? 'bg-amber-600 border-amber-500' :
              al.type === 'danger' ? 'bg-rose-600 border-rose-500' : 'bg-blue-600 border-blue-500'
            }`}
          >
            <Bell size={16} className="shrink-0" />
            <span className="flex-1 font-semibold">{al.text}</span>
          </div>
        ))}
      </div>

      {/* لو تعليق ذكي على الشاشة بوجود اشتراكات طلاب منتهية */}
      {expiredStudentsCount > 0 && (
        <div className="bg-gradient-to-r from-red-600/10 to-transparent border-r-4 border-red-500 p-4 rounded-xl flex items-center justify-between text-xs text-red-105 font-bold animate-pulse-subtle bg-red-500/5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={16} />
            <span>⚠️ تنبيه المتابعة الدورية: يوجد عدد <strong className="text-red-650 text-sm font-black underline">{expiredStudentsCount} طلاب</strong> انتهت فترة رخص اشتراكاتهم بالمنصة! يرجى مراجعة الجدول.</span>
          </div>
          <button 
            onClick={() => { setActiveTab('students'); setFilterStatus('expired_students'); }}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-lg transition-all"
          >
            فلترة الطلاب المنتهين 🔍
          </button>
        </div>
      )}

      {/* 📊 بطاقات الإحصائيات الفورية الكبرى أعلى الصفحة */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* كرت الطلاب */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold text-[10px] block">إجمالي طلاب اليمن:</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white font-mono block leading-tight">{statistics.totalStudents}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg">🎓</div>
        </div>

        {/* كرت المدرسين */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold text-[10px] block">المعلمون الموجهون:</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white font-mono block leading-tight">{statistics.totalTeachers}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50/50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">👨‍🏫</div>
        </div>

        {/* كرت المدراء */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold text-[10px] block">منسقو المدارس:</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white font-mono block leading-tight">{statistics.totalManagers}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg">🏫</div>
        </div>

        {/* كرت الحسابات النشطة */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold text-[10px] block">الحسابات النشطة:</span>
            <span className="text-2xl font-black text-emerald-600 font-mono block leading-tight">{statistics.active}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg">🟢</div>
        </div>

        {/* كرت الحسابات المعطلة */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold text-[10px] block">حسابات موقوفة:</span>
            <span className="text-2xl font-black text-rose-600 font-mono block leading-tight">{statistics.suspended}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50/50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-lg">🔴</div>
        </div>

      </div>

      {/* 🧭 تبويبات اللوحة الرئيسية الثلاثة مع زر إنشاء الحساب التلقائي */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-850 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* أزرار التبويبات الفئوية الثلاثة */}
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => { setActiveTab('teachers'); setFilterStatus('all'); }}
            className={`px-4.5 py-2.5 rounded-xl font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'teachers' 
                ? 'bg-blue-750 text-white shadow-md' 
                : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200'
            }`}
          >
            <span>👨‍🏫 إدارة حسابات المدرسين</span>
            <span className="bg-white/20 dark:bg-white/10 px-1.5 py-0.5 rounded-md font-mono text-[9px]">{statistics.totalTeachers}</span>
          </button>

          <button
            onClick={() => { setActiveTab('managers'); setFilterStatus('all'); }}
            className={`px-4.5 py-2.5 rounded-xl font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'managers' 
                ? 'bg-blue-750 text-white shadow-md' 
                : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200'
            }`}
          >
            <span>🏫 إدارة حسابات المدراء</span>
            <span className="bg-white/20 dark:bg-white/10 px-1.5 py-0.5 rounded-md font-mono text-[9px]">{statistics.totalManagers}</span>
          </button>

          <button
            onClick={() => { setActiveTab('students'); setFilterStatus('all'); }}
            className={`px-4.5 py-2.5 rounded-xl font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'students' 
                ? 'bg-blue-750 text-white shadow-md' 
                : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200'
            }`}
          >
            <span>🎓 إدارة حسابات الطلاب</span>
            <span className="bg-white/20 dark:bg-white/10 px-1.5 py-0.5 rounded-md font-mono text-[9px]">{statistics.totalStudents}</span>
          </button>
        </div>

        {/* زر الإجراء: إضافة وإنشاء حساب فوري بكلمة مرور مولدة تلقائياً */}
        <button
          onClick={openNewAccountModal}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-450 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-2 self-start md:self-auto"
        >
          <Plus size={15} />
          <span>{
            activeTab === 'teachers' ? 'إنشاء حساب معلم جديد' :
            activeTab === 'managers' ? 'إضافة مدير مدرسة' : 'إضافة طالب بالمنظومة'
          }</span>
        </button>

      </div>

      {/* 🔍 أدوات التصفية والبحث السريع والذكية المدمجة */}
      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-3xl border border-slate-100 dark:border-slate-850 space-y-4">
        
        {/* صف أول: محركات البحث بالاسم، المدرسة، الصف، اسم المستخدم */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          <div className="bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-205 dark:border-slate-800 flex items-center gap-2 shadow-2xs">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input 
              type="text"
              placeholder="🔍 ابحث بالاسم بالكامل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-xs text-slate-800 dark:text-white"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-205 dark:border-slate-800 flex items-center gap-2 shadow-2xs">
            <SchoolIcon size={14} className="text-slate-400 shrink-0" />
            <input 
              type="text"
              placeholder="🏫 ابحث بالمدرسة الثانوية..."
              value={searchSchool}
              onChange={(e) => setSearchSchool(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-xs text-slate-800 dark:text-white"
            />
          </div>

          {activeTab === 'students' ? (
            <div className="bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-205 dark:border-slate-800 flex items-center gap-2 shadow-2xs animate-fade-in">
              <Filter size={14} className="text-slate-400 shrink-0" />
              <select
                value={searchClass}
                onChange={(e) => setSearchClass(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-xs text-slate-700 dark:text-slate-200 font-bold"
              >
                <option value="">🎯 جميع الشعب الفئوية</option>
                <option value="الشعبة أ">الشعبة أ</option>
                <option value="الشعبة ب">الشعبة ب</option>
                <option value="الشعبة ج">الشعبة ج</option>
                <option value="الشعبة د">الشعبة د</option>
                <option value="شعبة الدمج العام">شعبة الدمج العام</option>
              </select>
            </div>
          ) : (
            <div className="bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 font-bold text-center cursor-not-allowed">
              🚫 البحث بالصف (خاص بتبويب الطلاب)
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-205 dark:border-slate-800 flex items-center gap-2 shadow-2xs">
            <KeyRound size={14} className="text-slate-400 shrink-0" />
            <input 
              type="text"
              placeholder="📧 ابحث باسم المستخدم..."
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-xs text-slate-800 dark:text-white font-semibold font-mono placeholder:font-sans"
            />
          </div>

        </div>

        {/* صف ثاني: محفزات فلترة الحالات والأزرار السريعة */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          
          {/* خيارات الفلترة الذكية */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-500 dark:text-slate-300">مصفاة الحالات:</span>
            
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg border font-bold transition-all transition-colors cursor-pointer ${
                filterStatus === 'all' 
                  ? 'bg-blue-750 text-white border-blue-600' 
                  : 'bg-white hover:bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              عرض الكل
            </button>

            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1 rounded-lg border font-bold transition-all transition-colors cursor-pointer ${
                filterStatus === 'active' 
                  ? 'bg-emerald-600 text-white border-emerald-580' 
                  : 'bg-white hover:bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              نشط ومفعل فقط
            </button>

            <button
              onClick={() => setFilterStatus('suspended')}
              className={`px-3 py-1 rounded-lg border font-bold transition-all transition-colors cursor-pointer ${
                filterStatus === 'suspended' 
                  ? 'bg-rose-600 text-white border-rose-500' 
                  : 'bg-white hover:bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              حسابات معطلة فقط
            </button>

            {activeTab === 'students' && (
              <button
                onClick={() => setFilterStatus('expired_students')}
                className={`px-3 py-1 rounded-lg border font-bold transition-all transition-colors cursor-pointer ${
                  filterStatus === 'expired_students' 
                    ? 'bg-red-600 text-white border-red-500 animate-pulse-subtle' 
                    : 'bg-white hover:bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                رخص منتهية فقط ⚠️
              </button>
            )}
          </div>

          {/* أزرار التصدير والطباعة للمستندات */}
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 font-extrabold rounded-lg flex items-center gap-1.5 transition-all text-[11px] cursor-pointer"
            >
              <Download size={13} />
              <span>تصدير الحسابات (Excel)</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 text-slate-705 dark:text-slate-200 font-extrabold rounded-lg flex items-center gap-1.5 transition-all text-[11px] cursor-pointer"
            >
              <Printer size={13} />
              <span>طباعة الكشوف الشاملة</span>
            </button>
          </div>

        </div>

      </div>

      {/* 📋 الجدول الاحترافي العارض للحسابات والأرقام السرية */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-850 p-6 shadow-sm overflow-x-auto">
        <table className="w-full text-right border-collapse text-xs md:text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-350 border-b border-slate-100 dark:border-slate-850 font-black">
              <th className="p-3">م</th>
              <th className="p-3">الاسم بالكامل</th>
              
              {/* تفاصيل مخصصة لكل صنف */}
              {activeTab === 'teachers' && (
                <>
                  <th className="p-3">الهاتف</th>
                  <th className="p-3">المادة</th>
                  <th className="p-3">المدرسة الملحقة</th>
                </>
              )}
              {activeTab === 'managers' && (
                <>
                  <th className="p-3">المدرسة الترخيصية</th>
                  <th className="p-3">الصلاحيات</th>
                </>
              )}
              {activeTab === 'students' && (
                <>
                  <th className="p-3">المدرسة / الصرح</th>
                  <th className="p-3">الصف والشعبة</th>
                  <th className="p-3">تاريخ انتهاء الاشتراك</th>
                </>
              )}

              <th className="p-3 font-mono">اسم المستخدم</th>
              <th className="p-3 font-mono">الرقم السري</th>
              <th className="p-3 text-center">الحالة بالبرنامج</th>
              <th className="p-3 text-left">التحكم السيادي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-medium">
            {filteredData.map((item, idx) => {
              const isPasswordVisible = !!visiblePasswords[item.id];
              return (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors">
                  <td className="p-3 text-slate-400 font-extrabold font-mono">{idx + 1}</td>
                  <td className="p-3 font-extrabold text-slate-850 dark:text-white">{item.name}</td>
                  
                  {/* بيانات الصنف الفرعية */}
                  {activeTab === 'teachers' && (
                    <>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{item.phone || 'غير مدرج'}</td>
                      <td className="p-3 font-bold text-indigo-705 dark:text-indigo-400">{item.subject || 'فيزياء'}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-450">{schools.find(s => s.id === item.schoolId)?.name || 'الوزارة الكلية'}</td>
                    </>
                  )}
                  {activeTab === 'managers' && (
                    <>
                      <td className="p-3 text-slate-600 dark:text-slate-450">{item.schoolName}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                          item.permissions === 'all' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {item.permissions === 'all' ? 'صلاحية كاملة لمدرسته' : 'عناية فرعية'}
                        </span>
                      </td>
                    </>
                  )}
                  {activeTab === 'students' && (
                    <>
                      <td className="p-3 text-slate-650 dark:text-slate-450 truncate max-w-[150px]">{item.schoolName}</td>
                      <td className="p-3 font-bold text-amber-600 dark:text-amber-500">{item.classGroup}</td>
                      <td className="p-3 font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded-lg text-[11px] ${
                          new Date(item.expireDate) < new Date() ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300' : 'text-slate-600 dark:text-slate-300'
                        }`}>
                          📅 {item.expireDate}
                        </span>
                      </td>
                    </>
                  )}

                  {/* اسم المستخدم الرقمي الفريد */}
                  <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">{item.username}</td>
                  
                  {/* الرقم السري مع إمكانية الكشف الحامية */}
                  <td className="p-3 font-mono">
                    <div className="flex items-center gap-1.5 justify-start">
                      <span className="font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-850">
                        {isPasswordVisible ? item.password : '••••••••'}
                      </span>
                      <button 
                        onClick={() => togglePasswordVisibility(item.id)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700 shrink-0 cursor-pointer transition-colors"
                        title={isPasswordVisible ? 'إخفاء الرقم السري' : 'إظهار الرقم السري'}
                      >
                        {isPasswordVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </td>

                  {/* حالة الحساب التراخيصي */}
                  <td className="p-3 text-center">
                    <span className={`inline-flex px-2 rounded-full text-[10px] font-extrabold ${
                      item.status === 'suspended' 
                        ? 'bg-rose-100 text-rose-800' 
                        : (activeTab === 'students' && new Date(item.expireDate) < new Date())
                          ? 'bg-red-500/10 text-red-600'
                          : 'bg-emerald-100 text-emerald-850'
                    }`}>
                      {item.status === 'suspended' ? '⏸️ معطل وموقوف' : (activeTab === 'students' && new Date(item.expireDate) < new Date()) ? '⚠️ منتهي الاشتراك' : '🟢 نشط ومفعل'}
                    </span>
                  </td>

                  {/* أزرار الإجراءات الفورية */}
                  <td className="p-3 text-left">
                    <div className="inline-flex gap-1.5 items-center">
                      <button
                        onClick={() => handleToggleStatus(item.id, item.status || 'active', item.name)}
                        className={`px-2 py-1 rounded-md text-[10px] font-black border cursor-pointer transition-colors ${
                          item.status === 'suspended'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                            : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                        title={item.status === 'suspended' ? 'تنشيط الحساب' : 'تعطيل الحساب'}
                      >
                        {item.status === 'suspended' ? 'تنشيط الحساب' : 'تعطيل'}
                      </button>
                      
                      <button
                        onClick={() => handleEditClick(item)}
                        className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 cursor-pointer transition-colors"
                        title="تعديل البيانات بالكامل"
                      >
                        <Edit size={13} />
                      </button>

                      <button
                        onClick={() => handleDeleteAccount(item.id, item.name)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 cursor-pointer transition-colors"
                        title="مسح من السيرفر نهائياً"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredData.length === 0 && (
              <tr>
                <td colSpan={activeTab === 'teachers' ? 9 : activeTab === 'managers' ? 7 : 8} className="text-center py-16 text-slate-400 italic font-black">
                  📭 لم نعثر على أي نتائج مطابقة لبحثك بالاسم والمدرسة والفلتر المختار حالياً!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* 🟢 نافذة الإضافة المنبثقة (Add Model Window) */}
      {showAddModal && (
        <div className="fixed inset-0 z-55 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative animate-scale-up space-y-4">
            
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-850">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Plus size={18} className="text-emerald-500" />
                <span>إنشاء حساب جديد وتوليد الرقم السري</span>
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-3.5 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">👤 الاسم الكامل بالرباعية:</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="مثال: صالح أحمد بن عبد الله الرعيني"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 p-2.5 rounded-xl outline-none text-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">📧 اسم المستخدم (الإنكليزي):</label>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="مثال: sal_raimi"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 p-2.5 rounded-xl outline-none font-bold font-mono text-slate-800 dark:text-white placeholder:font-sans"
                  />
                </div>
              </div>

              {/* بيانات محددة للمدرسين */}
              {activeTab === 'teachers' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">📞 رقم الهاتف المحمول:</label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="77XXXXXXX"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 p-2.5 rounded-xl outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">📚 المادة العلمية:</label>
                    <input
                      type="text"
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      placeholder="الفيزياء المنهجية"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 p-2.5 rounded-xl outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">🏫 المدرسة التابعة:</label>
                    <select
                      value={formSchoolId}
                      onChange={(e) => setFormSchoolId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl outline-none text-slate-700"
                    >
                      {schools.map(sch => (
                        <option key={sch.id} value={sch.id}>{sch.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* الصلاحيات للمدراء والمنسقين */}
              {activeTab === 'managers' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">🏫 المدرسة المرتبطة:</label>
                    <select
                      value={formSchoolName}
                      onChange={(e) => setFormSchoolName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl outline-none text-slate-700"
                    >
                      {schools.map(sch => (
                        <option key={sch.id} value={sch.name}>{sch.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">🔑 نوع الصلاحية الممنوحة المديرية:</label>
                    <select
                      value={formPermissions}
                      onChange={(e) => setFormPermissions(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl outline-none text-slate-700"
                    >
                      <option value="all">كل الصلاحيات لمدرسته</option>
                      <option value="restricted">سحب التقارير المحدودة</option>
                    </select>
                  </div>
                </div>
              )}

              {/* الشعب والتواريخ للطلاب */}
              {activeTab === 'students' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">🏫 الصرح / المدرسة الثانوية:</label>
                    <select
                      value={formSchoolName}
                      onChange={(e) => setFormSchoolName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl outline-none text-slate-700"
                    >
                      {schools.map(sch => (
                        <option key={sch.id} value={sch.name}>{sch.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">🎯 الشعبة المقررة:</label>
                    <select
                      value={formClassGroup}
                      onChange={(e) => setFormClassGroup(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl outline-none text-slate-700"
                    >
                      <option value="الشعبة أ">الشعبة أ</option>
                      <option value="الشعبة ب">الشعبة ب</option>
                      <option value="الشعبة ج">الشعبة ج</option>
                      <option value="الشعبة د">الشعبة د</option>
                      <option value="شعبة الدمج العام">شعبة الدمج العام</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">📅 نهاية تاريخ الاشتراك:</label>
                    <input
                      type="date"
                      value={formExpireDate}
                      onChange={(e) => setFormExpireDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 p-2.5 rounded-xl outline-none"
                    />
                  </div>
                </div>
              )}

              {/* 🔑 توليد الأرقام السرية التلقائية الفائقة الأمان */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-blue-900 dark:text-blue-400">🔑 الرقم السري المولد آلياً (قوي):</span>
                  <button
                    type="button"
                    onClick={handleRegeneratePasswordInForm}
                    className="p-1 px-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-750 dark:text-blue-400 flex items-center gap-1 hover:bg-blue-150 rounded-lg cursor-pointer font-black"
                  >
                    <RefreshCw size={12} />
                    <span>توليد عشوائي جديد</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-600 dark:text-slate-400">كلمة المرور:</label>
                    <input
                      type="text"
                      required
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-2.5 rounded-xl outline-none font-bold font-mono text-center text-emerald-600 dark:text-emerald-400 tracking-wider text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-600 dark:text-slate-400">تأكيد كلمة المرور:</label>
                    <input
                      type="text"
                      required
                      value={formConfirmPassword}
                      onChange={(e) => setFormConfirmPassword(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-2.5 rounded-xl outline-none font-bold font-mono text-center text-emerald-600 dark:text-emerald-400 tracking-wider text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* حالة الحساب الأولية */}
              <div className="flex gap-4 items-center font-bold">
                <span className="text-slate-700 dark:text-slate-350">حالة الحساب فور الإنشاء:</span>
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={formStatus === 'active'}
                    onChange={() => setFormStatus('active')}
                    className="accent-emerald-600"
                  />
                  <span className="text-emerald-700">🟢 فعال ومفتوح</span>
                </label>
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={formStatus === 'suspended'}
                    onChange={() => setFormStatus('suspended')}
                    className="accent-rose-600"
                  />
                  <span className="text-rose-700">⏸️ موقوف معطل</span>
                </label>
              </div>

              {/* أزرار الحفظ والإغلاق */}
              <div className="flex gap-2 justify-end border-t pt-4 border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-extrabold rounded-xl transition-all cursor-pointer"
                >
                  إلغاء التراجع
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-750 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  حفظ وتسجيل الحساب المطور 🚀
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 💾 نافذة التعديل المنبثقة (Edit Model Window) */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 z-55 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative animate-scale-up space-y-4">
            
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-850">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Edit size={18} className="text-indigo-500" />
                <span>تعديل وحياكة بيانات الحساب المعرف</span>
              </h3>
              <button 
                onClick={() => { setShowEditModal(false); setSelectedItem(null); }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">👤 الاسم الكامل بالرباعية:</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 p-2.5 rounded-xl outline-none text-slate-800 dark:text-white font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">📧 اسم المستخدم (يمنع تكراره):</label>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 p-2.5 rounded-xl outline-none font-bold font-mono text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* تعديل المعلمين */}
              {activeTab === 'teachers' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">📞 رقم هاتف المعلم:</label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 p-2.5 rounded-xl outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">📚 المادة والمقرر التابع:</label>
                    <input
                      type="text"
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 p-2.5 rounded-xl outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">🏫 تغيير المدرسة:</label>
                    <select
                      value={formSchoolId}
                      onChange={(e) => setFormSchoolId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl outline-none text-slate-700"
                    >
                      {schools.map(sch => (
                        <option key={sch.id} value={sch.id}>{sch.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* تعديل المدراء */}
              {activeTab === 'managers' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">🏫 المدرسة الثانوية:</label>
                    <select
                      value={formSchoolName}
                      onChange={(e) => setFormSchoolName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl outline-none text-slate-700"
                    >
                      {schools.map(sch => (
                        <option key={sch.id} value={sch.name}>{sch.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">🔑 نوع التخويل:</label>
                    <select
                      value={formPermissions}
                      onChange={(e) => setFormPermissions(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl outline-none text-slate-700"
                    >
                      <option value="all">كل الصلاحيات لمدرسته</option>
                      <option value="restricted">سحب التقارير المحدودة</option>
                    </select>
                  </div>
                </div>
              )}

              {/* تعديل الطلاب */}
              {activeTab === 'students' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">🏫 المدرسة:</label>
                    <select
                      value={formSchoolName}
                      onChange={(e) => setFormSchoolName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl outline-none text-slate-700"
                    >
                      {schools.map(sch => (
                        <option key={sch.id} value={sch.name}>{sch.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">🎯 الشعبة المقررة للتعلم:</label>
                    <select
                      value={formClassGroup}
                      onChange={(e) => setFormClassGroup(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl outline-none text-slate-700"
                    >
                      <option value="الشعبة أ">الشعبة أ</option>
                      <option value="الشعبة ب">الشعبة ب</option>
                      <option value="الشعبة ج">الشعبة ج</option>
                      <option value="الشعبة د">الشعبة د</option>
                      <option value="شعبة الدمج العام">شعبة الدمج العام</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">📅 نهاية تاريخ الاشتراك اليوم غد:</label>
                    <input
                      type="date"
                      value={formExpireDate}
                      onChange={(e) => setFormExpireDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 p-2.5 rounded-xl outline-none"
                    />
                  </div>
                </div>
              )}

              {/* 🔑 الرقم السري القابل للمشاهدة والتعديل اليدوي */}
              <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-amber-950 dark:text-amber-400">🔑 كلمة المرور الحالية (تنسيق قوي):</span>
                  <button
                    type="button"
                    onClick={handleRegeneratePasswordInForm}
                    className="p-1 px-2.5 bg-amber-500/10 text-amber-955 flex items-center gap-1 hover:bg-amber-500/20 rounded-lg cursor-pointer font-extrabold"
                  >
                    <RefreshCw size={12} />
                    <span>توليد رقم سري عشوائي جديد</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-600 dark:text-slate-400">الرقم السري المعدل:</label>
                    <input
                      type="text"
                      required
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-2.5 rounded-xl outline-none font-bold font-mono text-center text-indigo-700 dark:text-indigo-400 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-600 dark:text-slate-400">تأكيد الرقم السري:</label>
                    <input
                      type="text"
                      required
                      value={formConfirmPassword}
                      onChange={(e) => setFormConfirmPassword(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-2.5 rounded-xl outline-none font-bold font-mono text-center text-indigo-700 dark:text-indigo-400 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* حالة الحساب التعليقية */}
              <div className="flex gap-4 items-center font-bold">
                <span className="text-slate-700 dark:text-slate-350">تغيير حالة تفعيل الحساب:</span>
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="statusEdit"
                    checked={formStatus === 'active'}
                    onChange={() => setFormStatus('active')}
                    className="accent-emerald-600"
                  />
                  <span className="text-emerald-700">🟢 فعال ومفتوح</span>
                </label>
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="statusEdit"
                    checked={formStatus === 'suspended'}
                    onChange={() => setFormStatus('suspended')}
                    className="accent-rose-600"
                  />
                  <span className="text-rose-700">⏸️ موقوف مؤقتاً</span>
                </label>
              </div>

              {/* أزرار الحفظ */}
              <div className="flex gap-2 justify-end border-t pt-4 border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedItem(null); }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-extrabold rounded-xl cursor-pointer"
                >
                  تراجع
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-750 to-indigo-800 hover:from-blue-750 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  حفظ التعديلات السلكية 💾
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
