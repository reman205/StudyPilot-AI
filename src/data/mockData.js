import { Layers, BookOpen, Brain } from 'lucide-react';

export const defaultStudent = {
  name: 'Reman', university: 'Taibah University', major: 'Artificial Intelligence',
  level: '3rd Year', examDate: '2026-08-20', dailyTime: '1.5 hours',
  preferences: ['Arabic explanation with English technical terms', 'Exam-focused'],
  streak: 18, xp: 2140,
};

export const courses = [
  { id:'linalg', name:'Linear Algebra', icon:Layers, progress:82, readiness:78, nextLesson:'Rank–Nullity Theorem', examDate:'2026-07-17', weakest:'Kernel', chapters:6, concepts:42, definitions:31, formulas:8, examples:16, difficulty:4, studyHours:6 },
  { id:'se', name:'Software Engineering', icon:BookOpen, progress:67, readiness:64, nextLesson:'Software Quality Assurance', examDate:'2026-07-24', weakest:'Verification vs Validation', chapters:9, concepts:58, definitions:40, formulas:2, examples:21, difficulty:3, studyHours:8 },
  { id:'ai', name:'AI Fundamentals', icon:Brain, progress:41, readiness:46, nextLesson:'Search Algorithms', examDate:'2026-08-01', weakest:'Heuristics', chapters:7, concepts:35, definitions:22, formulas:5, examples:12, difficulty:4, studyHours:5 },
];

export const concept = {
  course:'Linear Algebra', chapter:'Linear Transformations', name:'Kernel',
  definition:'The kernel of a linear transformation T: V → W is the set of every vector in V that maps to the zero vector in W.',
  analogy:'Imagine a machine that transforms objects. The kernel contains everything that enters the machine and completely disappears into zero.',
  simple:'The kernel is the “zero-output club.” A vector belongs to it when the transformation sends that vector to zero.',
  technical:['Start with T(v) = 0 where v ∈ V.','Solve the resulting system of equations.','All solutions form ker(T), a subspace of the domain V.','The dimension of ker(T) is the nullity.'],
  example:'For T(x, y) = (x + y, x + y), solve x + y = 0. Therefore ker(T) = {(t, −t) : t ∈ ℝ}.',
  anotherExample:'For T(x,y,z)=(x+y, z), the kernel satisfies x+y=0 and z=0, so ker(T)={(t,−t,0)}.',
  prev:'Linear transformations preserve vector addition and scalar multiplication.',
  next:'Rank–Nullity connects the dimension of the kernel to the dimension of the image.',
  mistake:'Kernel lives in the domain. Range/Image lives in the codomain.',
  quickCheck:{ question:'If T(x, y) = (0, 0) for every (x, y), what is ker(T)?', options:['Only the zero vector','The entire space V','The entire space W','The kernel does not exist'], correct:1 },
};

export const quizQuestions = [
  ['The kernel of T: V → W is:', ['Vectors in W with a preimage','Vectors in V mapped to zero','Vectors unchanged by T','Every possible output'],1,'Kernel'],
  ['Rank + Nullity equals:', ['dim(V)','dim(W)','det(T)','0'],0,'Rank–Nullity'],
  ['Which is required for linearity?', ['T(cu)=cT(u)','T(u)=u²','T(0)=1','T(u+v)=T(u)−T(v)'],0,'Linearity'],
  ['Additivity means:', ['T(u+v)=T(u)+T(v)','T(cu)=cT(u)','T(0)=1','T is onto'],0,'Linearity'],
  ['The image of T is a subspace of:', ['Domain V','Codomain W','Kernel','Scalars'],1,'Image'],
  ['Homogeneity concerns:', ['Scalar multiplication','Only vector addition','Determinants','Eigenvalues'],0,'Linearity'],
  ['If ker(T)={0}, T is:', ['One-to-one','Always onto','Nonlinear','Undefined'],0,'Kernel'],
  ['Which is linear?', ['T(x)=x²','T(x,y)=(2x,x+y)','T(x)=x+1','T(x,y)=(xy,0)'],1,'Linearity'],
  ['Nullity is:', ['Dimension of image','Dimension of kernel','Number of rows','Determinant'],1,'Rank–Nullity'],
  ['Common Kernel/Range mistake:', ['Forgetting both are sets','Swapping domain and codomain locations','Assuming zero exists','Using a matrix'],1,'Kernel'],
].map((q,i)=>({id:i+1, question:q[0], options:q[1], correct:q[2], concept:q[3]}));

export const chapters = [
  ['1','Vector Spaces',100],['2','Basis & Dimension',100],['3','Linear Transformations',78],['4','Kernel & Image',64],['5','Rank–Nullity',25],['6','Eigenvalues',0]
];

export const planTasks = [
  {id:'p1',day:'Today',title:'Review Kernel concept',minutes:25,type:'Learn'},
  {id:'p2',day:'Today',title:'Complete targeted practice',minutes:20,type:'Practice'},
  {id:'p3',day:'Tomorrow',title:'Learn Rank–Nullity',minutes:35,type:'Learn'},
  {id:'p4',day:'Tomorrow',title:'Take a 10-question quiz',minutes:20,type:'Quiz'},
  {id:'p5',day:'Day 3',title:'Review weak concepts',minutes:30,type:'Revision'},
  {id:'p6',day:'Day 4',title:'Complete final mock exam',minutes:45,type:'Mock Exam'},
];
