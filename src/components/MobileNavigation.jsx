import { Home,BookOpen,MessageCircle,TrendingUp,BrainCircuit } from 'lucide-react';
import { NavLink } from 'react-router-dom';
const items=[['/','Home',Home],['/courses','Courses',BookOpen],['/mentor','Mentor',MessageCircle],['/progress','Progress',TrendingUp],['/agents','Agents',BrainCircuit]];
export default function MobileNavigation(){return <nav className="mobile-nav">{items.map(([to,label,Icon])=><NavLink key={to} to={to} end={to==='/'}><Icon size={19}/><small>{label}</small></NavLink>)}</nav>}
