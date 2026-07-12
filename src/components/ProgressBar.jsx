export default function ProgressBar({value=0}) { return <div className="progress-bar"><span style={{width:`${Math.min(100,value)}%`}} /></div>; }
