import{c as t,B as i,j as e,D as l,z as n}from"./index-Ca5JFDiE.js";import{B as o}from"./bar-chart-2-DuAkhIFG.js";import{U as d}from"./users-BsMoDZjH.js";import{B as h}from"./box-D6hYb9oO.js";/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=t("Bell",[["path",{d:"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9",key:"1qo2s2"}],["path",{d:"M10.3 21a1.94 1.94 0 0 0 3.4 0",key:"qgo35s"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=t("Database",[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=t("FileText",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const r=t("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=t("Shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]]),j=[{icon:o,label:"Overview",path:"/admin"},{icon:d,label:"Users",path:"/admin/users"},{icon:h,label:"3D Content",path:"/admin/content"},{icon:p,label:"Resources",path:"/admin/resources"},{icon:x,label:"Storage",path:"/admin/storage"},{icon:b,label:"Security",path:"/admin/security"},{icon:r,label:"Settings",path:"/admin/settings"}],f=()=>{const a=i();return e.jsxs("aside",{className:"w-64 bg-[#121214] border-r border-[#242429] fixed top-0 left-0 h-screen",children:[e.jsx("div",{className:"p-6",children:e.jsx(l,{to:"/",className:"text-xl font-bold",children:"H3M Studio"})}),e.jsx("nav",{className:"mt-6",children:j.map(s=>{const c=a.pathname===s.path;return e.jsxs(l,{to:s.path,className:`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${c?"bg-[#242429] text-white":"text-gray-400 hover:text-white hover:bg-[#1a1a1f]"}`,children:[e.jsx(s.icon,{className:"w-5 h-5"}),s.label]},s.path)})})]})},u=()=>{var s;const{user:a}=n();return e.jsx("header",{className:"h-16 bg-[#121214] border-b border-[#242429] fixed top-0 right-0 left-64 z-50",children:e.jsxs("div",{className:"h-full px-8 flex items-center justify-between",children:[e.jsx("h1",{className:"text-xl font-bold",children:"Admin Dashboard"}),e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("button",{className:"p-2 hover:bg-[#242429] rounded-lg transition-colors",children:e.jsx(m,{className:"w-5 h-5"})}),e.jsx("button",{className:"p-2 hover:bg-[#242429] rounded-lg transition-colors",children:e.jsx(r,{className:"w-5 h-5"})}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center",children:(s=a==null?void 0:a.email)==null?void 0:s[0].toUpperCase()}),e.jsx("span",{className:"text-sm",children:a==null?void 0:a.email})]})]})]})})},v=({children:a})=>e.jsxs("div",{className:"min-h-screen bg-[#0a0a0b] text-white",children:[e.jsx(u,{}),e.jsxs("div",{className:"flex",children:[e.jsx(f,{}),e.jsx("main",{className:"flex-1 p-8 ml-64",children:a})]})]}),w=()=>{const{user:a}=n();return a!=null&&a.isAdmin?e.jsx(v,{children:e.jsx("div",{})}):e.jsx("div",{className:"min-h-screen flex items-center justify-center bg-[#0a0a0b]",children:e.jsxs("div",{className:"text-center",children:[e.jsx("h1",{className:"text-2xl font-bold text-red-500 mb-2",children:"Access Denied"}),e.jsx("p",{className:"text-gray-400",children:"You don't have permission to access this area."})]})})};export{w as default};
