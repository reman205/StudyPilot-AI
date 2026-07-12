export default function Button({children, variant='primary', icon:Icon, ...props}) { return <button className={`button button-${variant}`} {...props}>{children}{Icon&&<Icon size={16}/>}</button>; }
