import{c as l,r as o}from"./index-Ca5JFDiE.js";import{h as G,aP as T,a as i,u as b,_ as t,aQ as D,s as E,v as U,f as a}from"./OrbitControls-DP0yiWgp.js";/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R=l("Sun",[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W=l("Upload",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]]),V=E({cellSize:.5,sectionSize:1,fadeDistance:100,fadeStrength:1,fadeFrom:1,cellThickness:.5,sectionThickness:1,cellColor:new a,sectionColor:new a,infiniteGrid:!1,followCamera:!1,worldCamProjPosition:new i,worldPlanePosition:new i},`
    varying vec3 localPosition;
    varying vec4 worldPosition;

    uniform vec3 worldCamProjPosition;
    uniform vec3 worldPlanePosition;
    uniform float fadeDistance;
    uniform bool infiniteGrid;
    uniform bool followCamera;

    void main() {
      localPosition = position.xzy;
      if (infiniteGrid) localPosition *= 1.0 + fadeDistance;
      
      worldPosition = modelMatrix * vec4(localPosition, 1.0);
      if (followCamera) {
        worldPosition.xyz += (worldCamProjPosition - worldPlanePosition);
        localPosition = (inverse(modelMatrix) * worldPosition).xyz;
      }

      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,`
    varying vec3 localPosition;
    varying vec4 worldPosition;

    uniform vec3 worldCamProjPosition;
    uniform float cellSize;
    uniform float sectionSize;
    uniform vec3 cellColor;
    uniform vec3 sectionColor;
    uniform float fadeDistance;
    uniform float fadeStrength;
    uniform float fadeFrom;
    uniform float cellThickness;
    uniform float sectionThickness;

    float getGrid(float size, float thickness) {
      vec2 r = localPosition.xz / size;
      vec2 grid = abs(fract(r - 0.5) - 0.5) / fwidth(r);
      float line = min(grid.x, grid.y) + 1.0 - thickness;
      return 1.0 - min(line, 1.0);
    }

    void main() {
      float g1 = getGrid(cellSize, cellThickness);
      float g2 = getGrid(sectionSize, sectionThickness);

      vec3 from = worldCamProjPosition*vec3(fadeFrom);
      float dist = distance(from, worldPosition.xyz);
      float d = 1.0 - min(dist / fadeDistance, 1.0);
      vec3 color = mix(cellColor, sectionColor, min(1.0, sectionThickness * g2));

      gl_FragColor = vec4(color, (g1 + g2) * pow(d, fadeStrength));
      gl_FragColor.a = mix(0.75 * gl_FragColor.a, gl_FragColor.a, g2);
      if (gl_FragColor.a <= 0.0) discard;

      #include <tonemapping_fragment>
      #include <${U>=154?"colorspace_fragment":"encodings_fragment"}>
    }
  `),q=o.forwardRef(({args:s,cellColor:c="#000000",sectionColor:d="#2080ff",cellSize:f=.5,sectionSize:m=1,followCamera:u=!1,infiniteGrid:P=!1,fadeDistance:g=100,fadeStrength:p=1,fadeFrom:v=1,cellThickness:w=.5,sectionThickness:h=1,side:y=D,...x},C)=>{G({GridMaterial:V});const e=o.useRef(null);o.useImperativeHandle(C,()=>e.current,[]);const r=new T,k=new i(0,1,0),z=new i(0,0,0);b(j=>{r.setFromNormalAndCoplanarPoint(k,z).applyMatrix4(e.current.matrixWorld);const n=e.current.material,_=n.uniforms.worldCamProjPosition,F=n.uniforms.worldPlanePosition;r.projectPoint(j.camera.position,_.value),F.value.set(0,0,0).applyMatrix4(e.current.matrixWorld)});const M={cellSize:f,sectionSize:m,cellColor:c,sectionColor:d,cellThickness:w,sectionThickness:h},S={fadeDistance:g,fadeStrength:p,fadeFrom:v,infiniteGrid:P,followCamera:u};return o.createElement("mesh",t({ref:e,frustumCulled:!1},x),o.createElement("gridMaterial",t({transparent:!0,"extensions-derivatives":!0,side:y},M,S)),o.createElement("planeGeometry",{args:s}))});export{q as G,R as S,W as U};
