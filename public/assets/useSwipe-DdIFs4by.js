import{c as C,r as e}from"./index-Ca5JFDiE.js";/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=C("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]),d=(o,u,c=50)=>{const[s,r]=e.useState(null),[n,a]=e.useState(null),l=e.useCallback(t=>{a(null),r(t.targetTouches[0].clientX)},[]),i=e.useCallback(t=>{a(t.targetTouches[0].clientX)},[]),h=e.useCallback(()=>{if(!s||!n)return;const t=s-n,f=t>c,T=t<-c;f?o():T&&u()},[s,n,c,o,u]);return{onTouchStart:l,onTouchMove:i,onTouchEnd:h}};export{p as C,d as u};
