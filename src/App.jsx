import { createContext, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import { defaultStudent, courses } from './data/mockData';
import { storage } from './utils/storage';
import Onboarding from './pages/Onboarding'; import Home from './pages/Home'; import Courses from './pages/Courses'; import AddCourse from './pages/AddCourse'; import CourseOverview from './pages/CourseOverview'; import Learning from './pages/Learning'; import Quiz from './pages/Quiz'; import QuizResults from './pages/QuizResults'; import StudyPlan from './pages/StudyPlan'; import Progress from './pages/Progress'; import AIMentor from './pages/AIMentor'; import FinalRevision from './pages/FinalRevision'; import Profile from './pages/Profile';

export const AppContext=createContext(null);
export default function App(){
 const [student,setStudent]=useState(()=>storage.get('sp_student',null));
 const [progress,setProgress]=useState(()=>storage.get('sp_progress',{streak:18,xp:2140,garden:3,mastered:29}));
 const [courseList,setCourseList]=useState(()=>storage.get('sp_courses',courses));
 const [quizResult,setQuizResult]=useState(()=>storage.get('sp_quiz_result',null));
 useEffect(()=>storage.set('sp_student',student),[student]); useEffect(()=>storage.set('sp_progress',progress),[progress]); useEffect(()=>storage.set('sp_courses',courseList),[courseList]); useEffect(()=>storage.set('sp_quiz_result',quizResult),[quizResult]);
 const reset=()=>{localStorage.clear();setStudent(null);setProgress({streak:18,xp:2140,garden:3,mastered:29});setCourseList(courses);setQuizResult(null)};
 const value=useMemo(()=>({student:student||defaultStudent,setStudent,progress,setProgress,courses:courseList,setCourseList,quizResult,setQuizResult,reset}),[student,progress,courseList,quizResult]);
 if(!student)return <AppContext.Provider value={value}><Onboarding/></AppContext.Provider>;
 return <AppContext.Provider value={value}><Routes><Route element={<AppShell student={student} progress={progress}/>}> <Route path="/" element={<Home/>}/><Route path="/courses" element={<Courses/>}/><Route path="/courses/new" element={<AddCourse/>}/><Route path="/courses/:courseId" element={<CourseOverview/>}/><Route path="/courses/:courseId/learn" element={<Learning/>}/><Route path="/courses/:courseId/quiz" element={<Quiz/>}/><Route path="/quiz-results" element={<QuizResults/>}/><Route path="/study-plan" element={<StudyPlan/>}/><Route path="/progress" element={<Progress/>}/><Route path="/mentor" element={<AIMentor/>}/><Route path="/final-revision" element={<FinalRevision/>}/><Route path="/profile" element={<Profile/>}/><Route path="*" element={<Navigate to="/"/>}/></Route></Routes></AppContext.Provider>
}
