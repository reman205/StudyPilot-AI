export default function ProgressRing({value=0,label}) { return <div className="ring" style={{'--value':`${value*3.6}deg`}}><div><strong>{value}%</strong>{label&&<small>{label}</small>}</div></div>; }
