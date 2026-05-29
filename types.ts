export interface Lesson {
  id: string;
  title: string;
  unit: string;
  unitTitle: string;
  order: number;
  accordionData: { title: string; content: string }[];
  islamicReflections?: string[];
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  type: 'tf' | 'mc';
  options?: string[];
  correct: string;
  explain: string;
}

export interface School {
  id: string;
  name: string;
  password?: string;
  plan?: 'free' | 'silver' | 'gold' | string;
  expireDate?: string;
  capacity?: number;
}

export interface Teacher {
  id: string;
  name: string;
  password?: string;
  schoolId: string;
  username?: string;
  status?: 'active' | 'suspended';
}

export interface ActivationCode {
  code: string;
  status: 'active' | 'used' | 'stopped';
  school: string;
  usedBy?: string;
  createdAt: string;
  expireAt: string;
  deviceLimit: number;
  devicesUsed?: string[];
}

export interface StudentScore {
  name: string;
  school: string;
  code: string;
  lessonId: string;
  lessonTitle: string;
  score: string;
  date: string;
  classGroup?: string;
}

export interface Teacher {
  id: string;
  name: string;
  password?: string;
  schoolId: string;
  username?: string;
  status?: 'active' | 'suspended';
  myClasses?: string[]; // Classes assigned to the teacher
  phone?: string;
  subject?: string;
}

export interface LMSMessage {
  id: string;
  senderName: string;
  senderRole: 'teacher' | 'school' | 'superadmin' | 'system';
  targetType: 'student' | 'class' | 'all';
  targetSchool?: string;
  targetClass?: string;
  targetStudentName?: string;
  content: string;
  date: string;
}

export interface StudentAttendance {
  id: string;
  studentName: string;
  school: string;
  classGroup: string;
  status: 'present' | 'absent' | 'late';
  date: string;
}

export interface SmartAlert {
  id: string;
  type: 'danger' | 'warning' | 'info' | 'success'; 
  title: string;
  message: string;
  userType: 'student' | 'teacher' | 'school' | 'superadmin' | 'all';
  studentName?: string;
  school?: string;
  classGroup?: string;
  date: string;
  alertType: 'grades' | 'absences' | 'homework' | 'non_login' | 'teacher_delay' | 'curriculum_delay';
}

export interface StudentAccount {
  id: string;
  name: string;
  classGroup: string;
  schoolName: string;
  username: string;
  password?: string;
  status: 'active' | 'suspended';
  expireDate: string; // Dynamic subscription expiration date
}

export interface SchoolManager {
  id: string;
  name: string;
  schoolName: string;
  username: string;
  password?: string;
  permissions: 'all' | 'restricted' | string;
  status: 'active' | 'suspended';
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  username: string;
  userType: string;
  action: string;
}


