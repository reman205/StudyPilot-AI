import { Search, Bell, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export default function TopBar({student,progress}) { const nav=useNavigate(); return <header className="topbar"><div className="search"><Search size={16}/><input placeholder="Search concepts, courses..." /></div><div className="top-actions"><span><Flame size={17}/>{progress.streak} days</span><Bell size={18}/><button className="avatar" onClick={()=>nav('/profile')}>{student.name?.[0]||'S'}</button></div></header>; }
