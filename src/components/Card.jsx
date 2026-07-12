export default function Card({ children, className='', onClick }) { return <div onClick={onClick} className={`card ${className}`}>{children}</div>; }
