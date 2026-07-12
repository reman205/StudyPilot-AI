import { Home,BookOpen,MessageCircle,TrendingUp,Calendar,User,GraduationCap,Leaf } from 'lucide-react';
import { NavLink } from 'react-router-dom';
const items=[['/','Home',Home],['/courses','Courses',BookOpen],['/mentor','AI Mentor',MessageCircle],['/progress','Progress',TrendingUp],['/study-plan','Study Plan',Calendar],['/profile','Profile',User]];
export default function Sidebar(){return <aside className="sidebar"><div className="brand"><span><GraduationCap size={18}/></span><div>StudyPilot <b>AI</b></div></div><nav>{items.map(([to,label,Icon])=><NavLink key={to} to={to} end={to==='/'}><Icon size={18}/>{label}</NavLink>)}</nav><div className="garden-note"><Leaf size={17}/><div><strong>Study Garden</strong><small>Your garden grows with consistency.</small></div></div></aside>}
