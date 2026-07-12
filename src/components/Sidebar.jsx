import { Home,BookOpen,MessageCircle,TrendingUp,Calendar,User,GraduationCap,Leaf,BrainCircuit,Puzzle,ShieldCheck,BarChart3,ScrollText } from 'lucide-react';
import { NavLink } from 'react-router-dom';
const main=[['/','Home',Home],['/courses','Courses',BookOpen],['/mentor','AI Mentor',MessageCircle],['/progress','Progress',TrendingUp],['/study-plan','Study Plan',Calendar],['/profile','Profile',User]];
const system=[['/agents','AI Agents',BrainCircuit],['/skills','Skills & Tools',Puzzle],['/evaluation','Evaluation',BarChart3],['/security','Security',ShieldCheck],['/logs','System Logs',ScrollText]];
const links=(items)=>items.map(([to,label,Icon])=><NavLink key={to} to={to} end={to==='/'}><Icon size={18}/>{label}</NavLink>);
export default function Sidebar(){return <aside className="sidebar"><div className="brand"><span><GraduationCap size={18}/></span><div>StudyPilot <b>AI</b></div></div><nav>{links(main)}<div className="nav-section-label">Bootcamp System</div>{links(system)}</nav><div className="garden-note"><Leaf size={17}/><div><strong>Study Garden</strong><small>Your garden grows with consistency.</small></div></div></aside>}
