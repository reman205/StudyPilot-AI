import { useMemo, useState } from 'react';
import { Play, CheckCircle2, ArrowRight, Network, Clock3 } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { agents } from '../data/agentData';

const demoSteps=['Nova analyzed the request','Pulse diagnosed weak concepts','Tempo recalculated the study plan','Finale prepared targeted revision','Security Guard validated the result'];
export default function AIAgents(){
 const [selected,setSelected]=useState(agents[0]); const [running,setRunning]=useState(false); const [step,setStep]=useState(-1);
 const activeSteps=useMemo(()=>demoSteps.slice(0,step+1),[step]);
 const run=()=>{if(running)return;setRunning(true);setStep(-1);demoSteps.forEach((_,i)=>setTimeout(()=>setStep(i),650*(i+1)));setTimeout(()=>setRunning(false),650*(demoSteps.length+1));};
 return <div className="stack"><header className="page-title"><div><span className="eyebrow">Bootcamp Edition • Multi-Agent System</span><h1>AI Agents</h1><p>Nova coordinates specialized academic agents, tools, memory and verification.</p></div><Button icon={Play} onClick={run} disabled={running}>{running?'Running workflow…':'Run Demo Workflow'}</Button></header>
 <Card className="orchestrator-card"><div className="agent-hero-icon"><selected.icon size={30}/></div><div><div className="agent-title-line"><h2>{selected.name}</h2><Badge tone={selected.status==='Online'?'success':'neutral'}>{selected.status}</Badge></div><strong>{selected.title}</strong><p>{selected.goal}</p></div><div className="orchestrator-metric"><span>Today’s tasks</span><b>18</b><small>97% verified</small></div></Card>
 <div className="agent-layout"><section><div className="section-head"><h2>Agent Team</h2><span className="soft-label"><Network size={15}/> 7 connected agents</span></div><div className="agent-grid">{agents.map(a=><Card key={a.id} className={`agent-card ${selected.id===a.id?'selected':''}`} onClick={()=>setSelected(a)}><div className="agent-icon"><a.icon size={21}/></div><div><strong>{a.name}</strong><small>{a.title}</small></div><Badge tone={a.status==='Online'?'success':'neutral'}>{a.status}</Badge></Card>)}</div></section>
 <Card className="agent-detail"><span className="eyebrow">Selected Agent</span><h2>{selected.name}</h2><p>{selected.goal}</p><h3>Memory</h3><div className="chip-list">{selected.memory.map(x=><span key={x}>{x}</span>)}</div><h3>Allowed Tools</h3><div className="chip-list">{selected.tools.map(x=><span key={x}>{x}</span>)}</div><h3>Least-Privilege Permissions</h3>{selected.permissions.map(x=><div className="check-row" key={x}><CheckCircle2 size={16}/>{x}</div>)}</Card></div>
 <Card><div className="section-head"><div><span className="eyebrow">Live Agent Activity</span><h2>Execution trace</h2></div><span className="soft-label"><Clock3 size={15}/> Simulated local workflow</span></div><div className="execution-flow">{demoSteps.map((s,i)=><div className={`execution-step ${i<=step?'done':''}`} key={s}><span>{i<step?<CheckCircle2 size={17}/>:i===step?<span className="pulse-dot"/>:i+1}</span><p>{s}</p>{i<demoSteps.length-1&&<ArrowRight size={16}/>}</div>)}</div>{activeSteps.length===0&&<p className="muted">Run the demo to see the orchestrator delegate, verify and complete a task.</p>}</Card></div>
}
