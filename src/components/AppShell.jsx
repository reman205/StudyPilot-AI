import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; import TopBar from './TopBar'; import MobileNavigation from './MobileNavigation';
export default function AppShell({student,progress}){return <div className="app-shell"><Sidebar/><div className="main-column"><TopBar student={student} progress={progress}/><main className="page-wrap"><Outlet/></main></div><MobileNavigation/></div>}
