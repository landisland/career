/* Why Systems Work So Well: the apartment model.
   Requires THREE (r128) and THREE.OrbitControls. Usage:
   const m = SystemModel.mount(stageEl, labelsEl, {onChange(fig){}}); m.select('hvac'); */
(function(){
const C = {hvac:0x5aa9e6, hvacDk:0x3f7fb0, cold:0x2f9e6b, hot:0xe07a1f, dwv:0x8a6d4b, fire:0xd7263d, elec:0xe5b80b,
  face:0xf1f1ef, edge:0x2a2a2a, slab:0xdadad7, chord:0xbdbdb9, fix:0xfbfbfa, equip:0xd0d1ce, dark:0x3b3b3b,
  xfmr:0x6f8471, ground:0xf0f0ed, flow:0x141414, flow2:0x9a9a96, zone:0xeeeeeb};
const hex = n => '#'+n.toString(16).padStart(6,'0');
const ALL = ['structure','furniture','hvac','water','dwv','fire','elec'];

const FIGS = [
 {id:'overview', name:'Overview', caption:'Two units, one building, every system shown with the drywall removed.', layers:ALL, focus:null, cam:[[96,60,104],[24,3,19]], ex:0},
 {id:'elements', name:'Elements', caption:'Elements: what you can see. Walls, floors, furniture, appliances.', layers:['structure','furniture'], focus:null, cam:[[90,62,98],[24,5,17]], ex:0, nolabels:true},
 {id:'connections', name:'Connections', caption:'Interconnections: what hides behind the drywall. Power, water, air, drains, sprinklers.', layers:['structure','furniture','hvac','water','dwv','fire','elec'], focus:null, ghost:['structure','furniture'], cam:[[90,62,98],[24,5,17]], ex:0, nolabels:true},
 {id:'purpose', name:'Purpose', caption:'Purpose: what you actually feel. A quiet, comfortable home, with all of the above out of sight.', layers:[], focus:'purpose', cam:[[90,62,98],[24,5,17]], ex:0, nolabels:true},
 {id:'flow', name:'Flow', caption:'Groceries in, meals out, waste back out. The kitchen is laid out along the path.', layers:['structure','furniture','flow'], focus:'flow', cut:true, cam:[[20,64,58],[17,0,16]], ex:0},
 {id:'zones', name:'Zones', caption:'Each room is a zone with a job, sized from the furniture and the space to use it.', layers:['structure','furniture'], focus:'zones', cut:true, cam:[[58,56,56],[20,0,15]], ex:0},
 {id:'structure', name:'Structure', caption:'Slab, walls and trusses. Nine-foot ceilings and an 18-inch floor between units.', layers:['structure'], focus:'structure', cam:[[-44,24,72],[18,10.5,16]], ex:0},
 {id:'service', name:'Service', caption:'Power, water and sewer enter from the street and land in rooms with outside doors.', layers:['structure','hvac','water','dwv','fire','elec'], focus:'service', cam:[[72,36,96],[30,0,28]], ex:0},
 {id:'site', name:'Site', caption:'Zoom out one level: identical buildings share transformers and the mains under the street.', layers:['structure','water','dwv','elec'], focus:'site', cam:[[98,134,226],[93,2,34]], ex:0},
 {id:'hvac', name:'HVAC', caption:'A furnace downstairs, an air handler in the attic, ducts to a diffuser in every room.', layers:['structure','furniture','hvac'], focus:'hvac', cam:[[66,44,72],[20,10,14]], ex:6},
 {id:'plumbing', name:'Plumbing', caption:'Pressure in, gravity out. Wet rooms stacked so one drain serves both units.', layers:['structure','furniture','water','dwv'], focus:'plumbing', cam:[[58,32,-40],[18,8,7]], ex:6},
 {id:'elec', name:'Electrical', caption:'Transformer, meters, a panel per unit, then circuits to every light and outlet.', layers:['structure','furniture','elec'], focus:'elec', cam:[[86,46,88],[30,4,22]], ex:6},
 {id:'fire', name:'Fire', caption:'One riser, mains in the floor cavity and attic, a head in every room.', layers:['structure','furniture','fire'], focus:'fire', cam:[[72,46,76],[24,8,16]], ex:6},
 {id:'overhead', name:'Overhead', caption:'Every system shares the 18-inch floor between units, each at its own height.', layers:['structure','hvac','water','dwv','fire','elec'], focus:'overhead', cam:[[72,42,74],[20,11,14]], ex:12},
 {id:'clash', name:'Clash', caption:'Where the duct could not fit, a soffit took more than a foot of ceiling.', layers:['structure','hvac','water','fire','elec'], focus:'clash', cam:[[-14,16,30],[14,7,9]], ex:0},
 {id:'labels', name:'Labels', caption:'Unit numbers, meter IDs and panel names: the information layer of the building.', layers:['structure','water','dwv','fire','elec'], focus:'labels', cam:[[72,32,84],[26,7,16]], ex:0}
];

function mount(stage, labelsEl, opts={}){
  const layerOn = {base:true};
  ['structure','furniture','flow','hvac','water','dwv','fire','elec','site'].forEach(k=>layerOn[k]=true);
  const renderer = new THREE.WebGLRenderer({antialias:true, preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
  stage.insertBefore(renderer.domElement, labelsEl);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xffffff);
  const camera = new THREE.PerspectiveCamera(36, 1, 0.5, 3000);
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08; controls.screenSpacePanning = true;
  controls.enableZoom = opts.zoom !== false;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8b8b4, 0.95));
  const sun = new THREE.DirectionalLight(0xffffff, 0.55); sun.position.set(60,120,80); scene.add(sun);
  const fill = new THREE.DirectionalLight(0xffffff, 0.25); fill.position.set(-80,40,-60); scene.add(fill);

  const SPLIT = 10.33;
  const root = new THREE.Group(); scene.add(root);
  const groups = {}; const LABELS = [];
  let B = {tags:[], layer:'base', cavity:false, only:null};
  function grp(layer, upper){
    if(!groups[layer]){ const lo=new THREE.Group(), up=new THREE.Group(); root.add(lo, up); groups[layer]={lo,up}; }
    return upper ? groups[layer].up : groups[layer].lo;
  }
  const T = (...t)=>{ B.tags=t; }; const L = l=>{ B.layer=l; };
  function mat(color, op, o){
    return new THREE.MeshStandardMaterial({color, roughness:o.rough!=null?o.rough:0.8, metalness:o.metal!=null?o.metal:0.02,
      transparent:op<1, opacity:op, depthWrite:op>=0.5, side:op<1?THREE.DoubleSide:THREE.FrontSide,
      polygonOffset:true, polygonOffsetFactor:1, polygonOffsetUnits:1});
  }
  function isUp(y, o){ return (o && o.upper!==undefined) ? o.upper : y > SPLIT; }
  function put(obj, upper, op, o={}){
    obj.userData = {layer:B.layer, tags:B.tags.slice(), base:op, struct:!!o.struct, line:!!o.line, cavity:o.cavity!=null?o.cavity:B.cavity, only:o.only||B.only};
    grp(B.layer, upper).add(obj); return obj;
  }
  function box(x0,y0,z0,x1,y1,z1,color,op=1,o={}){
    const m = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(x1-x0)||0.01,Math.abs(y1-y0)||0.01,Math.abs(z1-z0)||0.01), mat(color,op,o));
    m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);
    const up = isUp((y0+y1)/2,o); put(m, up, op, o);
    if(o.edges!=null){
      const eo = o.edgeOp!=null?o.edgeOp:0.55;
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), new THREE.LineBasicMaterial({color:o.edges, transparent:true, opacity:eo}));
      e.position.copy(m.position); put(e, up, eo, {...o, line:true});
    }
    return m;
  }
  function cyl(x,y0,z,r,h,color,op=1,o={}){
    const m = new THREE.Mesh(new THREE.CylinderGeometry(o.r2!=null?o.r2:r, r, h, o.seg||28), mat(color,op,o));
    m.position.set(x,y0+h/2,z); const up=isUp(y0+h/2,o); put(m, up, op, o);
    if(o.edges!=null){ const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 30), new THREE.LineBasicMaterial({color:o.edges, transparent:true, opacity:o.edgeOp||.5})); e.position.copy(m.position); put(e, up, o.edgeOp||.5, {...o,line:true}); }
    return m;
  }
  const V = p=>new THREE.Vector3(p[0],p[1],p[2]);
  function splitSegs(P){
    const out=[];
    for(let i=0;i<P.length-1;i++){ const a=P[i], b=P[i+1];
      if((a.y-SPLIT)*(b.y-SPLIT)<0){ const m=a.clone().lerp(b,(SPLIT-a.y)/(b.y-a.y)); out.push([a,m],[m,b]); } else out.push([a,b]); }
    return out;
  }
  function rod(a,b,r,color,o={}){
    const d=new THREE.Vector3().subVectors(b,a), len=d.length(); if(len<0.01) return;
    const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,o.seg||12), mat(color,1,{rough:.5,metal:.1}));
    m.position.copy(a).add(b).multiplyScalar(.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), d.normalize());
    put(m, o.upper!==undefined?o.upper:m.position.y>SPLIT, 1, o); return m;
  }
  function pipe(pts, r, color, o={}){
    const P=pts.map(V);
    splitSegs(P).forEach(([a,b])=>rod(a,b,r,color,o));
    for(let i=1;i<P.length-1;i++){ const s=new THREE.Mesh(new THREE.SphereGeometry(r*1.04,12,8), mat(color,1,{rough:.5,metal:.1})); s.position.copy(P[i]); put(s, isUp(P[i].y,o), 1, o); }
  }
  function lines(arr, color, op=0.8, o={}){
    const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(arr,3));
    return put(new THREE.LineSegments(g, new THREE.LineBasicMaterial({color, transparent:true, opacity:op})), !!o.upper, op, {...o, line:true});
  }
  function quad(a,b,c,d,color,op,o={}){
    const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([...a,...b,...c,...a,...c,...d],3)); g.computeVertexNormals();
    return put(new THREE.Mesh(g, mat(color,op,o)), !!o.upper, op, o);
  }
  function dashed(pts, y, color, r=0.11){
    const P = pts.map(p=>new THREE.Vector3(p[0],y,p[1]));
    for(let i=0;i<P.length-1;i++){
      const a=P[i], b=P[i+1], len=a.distanceTo(b), dir=b.clone().sub(a).normalize();
      for(let t=0.2; t<len-0.5; t+=1.1){ rod(a.clone().addScaledVector(dir,t), a.clone().addScaledVector(dir,Math.min(t+0.6,len)), r, color, {upper:false, seg:8}); }
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.42,1.1,16), mat(color,1,{}));
      head.position.copy(a.clone().addScaledVector(dir, len*0.5+0.4));
      head.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir);
      put(head, false, 1);
    }
  }
  function label(text, p, o={}){
    const el=document.createElement('div'); el.className='lbl '+(o.kind||'');
    if(o.color){ const i=document.createElement('i'); i.style.background=o.color; el.appendChild(i); }
    if(o.kind==='room'){ const s=document.createElement('span'); s.textContent=text; if(o.sub){ const sm=document.createElement('small'); sm.textContent=o.sub; s.appendChild(sm);} el.appendChild(s); }
    else el.appendChild(document.createTextNode(text));
    el.style.display='none'; labelsEl.appendChild(el);
    LABELS.push({el, p:V(p), tags:(o.tags||B.tags).slice(), layer:o.layer||B.layer, upper:isUp(p[1],o), ov:!!o.ov, kind:o.kind||'', align:o.align||'c'});
  }

  // ---------- build (feet; x along the walkway, z toward the street, y up) ----------
  (function build(){
    const FL2=10.5, CL1=9, CL2=19.5, RIDGE=25;
    const roofY = z => z<16 ? CL2+(z+1)*(RIDGE-CL2)/17 : CL2+(33-z)*(RIDGE-CL2)/17;
    const S = {struct:true};
    const gable = (x0,x1,o)=>{
      quad([x0-1,CL2,-1],[x1+1,CL2,-1],[x1+1,RIDGE,16],[x0-1,RIDGE,16],0xe4e4e1,o.op,o);
      quad([x0-1,RIDGE,16],[x1+1,RIDGE,16],[x1+1,CL2,33],[x0-1,CL2,33],0xe4e4e1,o.op,o);
      const a=x0-1,b=x1+1;
      lines([a,CL2,-1,b,CL2,-1, a,RIDGE,16,b,RIDGE,16, a,CL2,33,b,CL2,33, a,CL2,-1,a,RIDGE,16, a,RIDGE,16,a,CL2,33, b,CL2,-1,b,RIDGE,16, b,RIDGE,16,b,CL2,33], C.edge, 0.55, o);
    };

    // site base
    L('base'); T('purpose');
    const grid = new THREE.GridHelper(320, 80, 0xe4e4e1, 0xececea); grid.position.set(85,-0.06,30); root.add(grid);
    box(-8,-0.05,32.2,196,0.06,38,0xffffff,1,{upper:false,edges:0xb8b8b4,edgeOp:.6});
    box(0,-0.05,-8,14,0.08,0,0xffffff,1,{upper:false,edges:0xb8b8b4,edgeOp:.6});
    box(-70,-0.05,58,240,0.04,76,0xe6e6e3,0.5,{upper:false,edges:0xb8b8b4,edgeOp:.6});

    // ---- structure ----
    L('structure'); T('structure','overview','site');
    box(0,-0.5,0,40,0,32,C.slab,0.75,{...S,edges:C.edge,edgeOp:.6});
    const ext=(y0,y1,up)=>{ const o={...S,upper:up,edges:C.edge,edgeOp:.55};
      box(0,y0,31.6,40,y1,32,C.face,0.1,o); box(0,y0,0,40,y1,0.4,C.face,0.1,o);
      box(0,y0,0.4,0.4,y1,31.6,C.face,0.1,o); box(39.6,y0,0.4,40,y1,31.6,C.face,0.1,o); };
    ext(0,CL1,false); ext(FL2,CL2,true);
    T('structure','flow','labels');
    box(2.6,0,31.55,5.8,7,32.05,0x8f8f8b,0.6,{upper:false});
    T('structure','labels');
    box(39.55,FL2,26,40.05,FL2+7,29,0x8f8f8b,0.6,{upper:true});
    T('structure');
    box(40,0,27,40.3,7,30,0x8f8f8b,0.6,{upper:false});
    T('structure','zones');
    const parts=[[22,14,22,31.6],[18,14,39.6,14],[12,0.4,12,8],[18,4,18,14],[18,4,26,4],[26,4,26,14],[26,8,31,8],[31,0.4,31,14],[12,4,16,4],[16,0.4,16,4]];
    [[0,CL1,false],[FL2,CL2,true]].forEach(([y0,y1,up])=>parts.forEach(([a,b,c,d])=>{ const t=0.12;
      box(Math.min(a,c)-t,y0,Math.min(b,d)-t,Math.max(a,c)+t,y1,Math.max(b,d)+t,C.face,0.16,{...S,upper:up,edges:0x6d6d6a,edgeOp:.4}); }));
    B.cavity=true;
    T('structure','overhead');
    box(0,CL1,31.7,40,SPLIT,32,C.chord,0.45,{...S,upper:false}); box(0,CL1,0,40,SPLIT,0.3,C.chord,0.45,{...S,upper:false});
    box(0.4,CL1-0.04,0.4,39.6,CL1,31.6,0xffffff,0.22,{...S,upper:false});
    const web=[];
    for(let x=1;x<=39;x+=2){
      box(x-0.12,CL1,0.4,x+0.12,CL1+0.25,31.6,C.chord,1,{...S,upper:false});
      box(x-0.12,10.08,0.4,x+0.12,SPLIT,31.6,C.chord,1,{...S,upper:false});
      for(let z=0.4;z<31.6;z+=2.4){ const z2=Math.min(z+1.2,31.6), z3=Math.min(z+2.4,31.6); web.push(x,CL1+0.25,z,x,10.08,z2, x,10.08,z2,x,CL1+0.25,z3); }
    }
    lines(web, 0x8e8e8a, 0.7, {upper:false,struct:true});
    B.cavity=false;
    T('structure','site');
    box(0,SPLIT,0,40,FL2,32,C.slab,0.45,{...S,upper:true,edges:C.edge,edgeOp:.5});
    T('structure');
    box(0.4,CL2-0.04,0.4,39.6,CL2,31.6,0xffffff,0.22,{...S,upper:true});
    T('structure','overhead');
    const rt=[];
    for(let x=0;x<=40;x+=2) rt.push(x,CL2,-1,x,CL2,33, x,CL2,-1,x,RIDGE,16, x,RIDGE,16,x,CL2,33, x,CL2,16,x,RIDGE,16,
      x,CL2,9,x,roofY(4),4, x,CL2,9,x,RIDGE,16, x,CL2,23,x,roofY(28),28, x,CL2,23,x,RIDGE,16);
    lines(rt, 0x8e8e8a, 0.5, {upper:true,struct:true});
    T('structure','site');
    gable(0,40,{upper:true,struct:true,op:0.14});
    T('structure');
    box(0,SPLIT,-8,14,FL2,0,C.slab,0.5,{...S,upper:true,edges:C.edge,edgeOp:.4});
    lines([0,FL2+3.5,-8,14,FL2+3.5,-8, 0,FL2+3.5,-8,0,FL2+3.5,0, 0,FL2,-8,0,FL2+3.5,-8, 14,FL2,-8,14,FL2+3.5,-8], C.edge, 0.5, {upper:true,struct:true});
    for(let i=0;i<14;i++){ const x=47+i*1.05, y=SPLIT-(i+1)*0.74; box(x,Math.max(0,y-0.25),28,x+1.05,y,32,0xffffff,0.8,{...S,upper:false,edges:0x8e8e8a,edgeOp:.5}); }
    box(40,10.0,24,47,SPLIT,32,0xffffff,0.8,{...S,upper:true,edges:0x8e8e8a,edgeOp:.5});
    T('structure','service','elec','fire','site','labels');
    box(40,0,24,47,9,32,C.face,0.22,{...S,upper:false,edges:C.edge,edgeOp:.85});
    T('structure','service','plumbing');
    box(10,0,-3,14,CL1,0,C.face,0.22,{...S,upper:false,edges:C.edge,edgeOp:.85});
    box(10,FL2,-3,14,CL2,0,C.face,0.22,{...S,upper:true,edges:C.edge,edgeOp:.85});
    T('structure');
    label('Unit B · upper floor', [-0.6,15,32.4], {ov:true, tags:['overview']});
    label('Unit A · ground floor', [-0.6,4.5,32.4], {ov:true, tags:['overview']});
    label('Floor trusses · 16 in deep, 24 in on center', [20,9.7,32.2], {tags:['structure']});
    label('Roof trusses + attic', [32,22.4,16], {tags:['structure']});
    label('Slab on grade', [30,-0.3,32.4], {tags:['structure']});

    // neighbors (site figure only)
    L('site'); T('site'); B.only='site';
    [64,128].forEach(x0=>{
      const o={upper:false,edges:C.edge,edgeOp:.6};
      box(x0,0,0,x0+40,CL2,32,0xfafaf9,0.92,o);
      lines([x0,FL2,32.01,x0+40,FL2,32.01, x0,FL2,-0.01,x0+40,FL2,-0.01], C.edge, 0.45, {upper:false});
      const a=x0-1,b=x0+41;
      quad([a,CL2,-1],[b,CL2,-1],[b,RIDGE,16],[a,RIDGE,16],0xe9e9e6,0.95,{upper:false});
      quad([a,RIDGE,16],[b,RIDGE,16],[b,CL2,33],[a,CL2,33],0xe9e9e6,0.95,{upper:false});
      lines([a,CL2,-1,b,CL2,-1, a,RIDGE,16,b,RIDGE,16, a,CL2,33,b,CL2,33, a,CL2,-1,a,RIDGE,16, a,RIDGE,16,a,CL2,33, b,CL2,-1,b,RIDGE,16, b,RIDGE,16,b,CL2,33], C.edge, 0.6, {upper:false});
      box(x0+40,0,24,x0+47,9,32,0xf3f3f1,0.95,o);
      box(x0+2.6,0,31.55,x0+5.8,7,32.05,0x8f8f8b,0.8,{upper:false});
      box(x0+29.2,-0.05,43.2,x0+30.8,0.35,44.8,0x8f8f8b,1,{upper:false});
    });
    box(179.6,-0.05,41.6,184.4,0.3,46.4,0xffffff,1,{upper:false,edges:0x8e8e8a,edgeOp:.6});
    box(180.2,0.3,42.2,183.8,4.6,45.8,C.xfmr,1,{upper:false,edges:0x2a2a2a,edgeOp:.5});
    pipe([[-70,-3,62],[240,-3,62]], 0.32, C.elec, {upper:false});
    pipe([[54,-3,62],[54,-3,45],[54,0.3,45]], 0.28, C.elec, {upper:false});
    pipe([[182,-3,62],[182,-3,45],[182,0.3,45]], 0.28, C.elec, {upper:false});
    pipe([[55.8,0.6,43],[57.5,-2.2,43],[107.5,-2.2,43],[107.5,-2.2,30],[107.5,0,30]], 0.2, C.elec, {upper:false});
    pipe([[182,0.3,42.2],[182,-2.2,42.2],[182,-2.2,30],[171.5,-2.2,30],[171.5,0,30]], 0.2, C.elec, {upper:false});
    pipe([[-70,-4.5,66],[240,-4.5,66]], 0.3, C.cold, {upper:false});
    [30,94,158].forEach(x=>pipe([[x,-4.5,66],[x,-3,66],[x,-3,44],[x,0,44]], 0.14, C.cold, {upper:false}));
    pipe([[-70,-6.5,70],[240,-6.5,70]], 0.34, C.dwv, {upper:false});
    pipe([[26.3,-3.4,52],[26.3,-6.5,70]], 0.16, C.dwv, {upper:false});
    [90.3,154.3].forEach(x=>pipe([[x,-2.9,32],[x,-3.4,52],[x,-6.5,70]], 0.16, C.dwv, {upper:false}));
    B.only=null;
    label('This building', [20,27.5,16], {color:'#141414'});
    label('Same unit stack, repeated', [84,27.5,16], {color:'#9a9a96'});
    label('One electrical room per building', [107.5,10.5,32.4], {color:hex(C.elec)});
    label('Shared transformers', [118,6,44], {color:hex(C.xfmr)});
    label('Street mains · power, water, sewer', [150,0.5,67], {color:'#9a9a96'});

    // dimensions (structure + clash only)
    L('dims'); T('structure'); B.only='structure';
    const dx=-3.2, dz=33.2, D=[];
    [0,CL1,FL2,CL2,RIDGE].forEach(y=>{ D.push(-4.4,y,dz, -0.2,y,dz, dx-0.35,y-0.35,dz, dx+0.35,y+0.35,dz); });
    D.push(dx,0,dz, dx,RIDGE,dz);
    lines(D, 0x141414, 0.9, {upper:false});
    label('9′-0″ ceiling', [dx-0.6,4.5,dz], {kind:'dim', align:'r', upper:false});
    label('1′-6″ floor + cavity', [dx-0.6,9.75,dz], {kind:'dim', align:'r', upper:false});
    label('9′-0″ ceiling', [dx-0.6,15,dz], {kind:'dim', align:'r', upper:false});
    label('5′-6″ attic at ridge', [dx-0.6,22.25,dz], {kind:'dim', align:'r', upper:false});
    B.only='clash'; T('clash');
    lines([12.4,0,9.5, 12.4,7.62,9.5, 11.9,7.62,9.5, 12.9,7.62,9.5, 11.9,0,9.5, 12.9,0,9.5,  11.4,0,12.6, 11.4,CL1,12.6, 10.9,CL1,12.6, 11.9,CL1,12.6, 10.9,0,12.6, 11.9,0,12.6], 0x141414, 0.95, {upper:false});
    label('7′-8″ under the soffit', [12.4,3.8,9.5], {kind:'dim', upper:false});
    label('9′-0″ elsewhere', [11.4,5.6,12.6], {kind:'dim', upper:false});
    B.only=null;

    // ---- furniture and fixtures, both floors ----
    L('furniture');
    const F = {upper:false, edges:0x3a3a3a, edgeOp:.6};
    [[0,false],[FL2,true]].forEach(([yb,up])=>{
      const f={...F, upper:up};
      T('zones','flow','plumbing');
      box(0.6,yb,0.6,12,yb+3,2.6,C.fix,1,f);
      box(5,yb+3,0.9,7,yb+3.05,2.2,0x9a9a96,1,{upper:up});
      T('zones','flow');
      box(8,yb+3,0.8,10.5,yb+3.06,2.4,0x2e2e2e,1,{upper:up});
      box(0.5,yb,3,3,yb+6,6,C.fix,1,f);
      box(0.5,yb,7,3,yb+7,10,C.fix,1,f);
      box(10,yb,11,11,yb+2.4,12,0xdcdcd9,1,f);
      box(14,yb+2.3,17,19,yb+2.5,21,C.fix,1,f);
      [[14.2,17.2],[18.6,17.2],[14.2,20.6],[18.6,20.6]].forEach(([x,z])=>box(x,yb,z,x+0.2,yb+2.3,z+0.2,0x9a9a96,1,{upper:up}));
      T('zones');
      box(8.5,yb,19,11.5,yb+1.5,26,C.fix,1,f); box(10.8,yb,19,11.5,yb+3,26,C.fix,1,f);
      box(4.5,yb,20.5,6.5,yb+1.4,24.5,C.fix,1,f);
      box(0.5,yb,19,2,yb+1.8,26,C.fix,1,f); box(0.9,yb+2.4,19.6,1.1,yb+5.6,25.4,0x2e2e2e,1,{upper:up});
      box(30,yb,24.5,36.5,yb+2,31,C.fix,1,f); box(30,yb,31,36.5,yb+3.6,31.5,C.fix,1,f);
      box(36.8,yb,29.4,38.6,yb+2,31.4,C.fix,1,f);
      T('zones','flow');
      box(23,yb,14.4,28,yb+3,16.2,C.fix,1,f);
      T('zones');
      box(33.5,yb,1,39,yb+2,7,C.fix,1,f); box(39,yb,1,39.5,yb+3.4,7,C.fix,1,f);
      box(31.5,yb,12,35.5,yb+2.5,13.6,C.fix,1,f);
      T('zones','plumbing');
      box(18.4,yb,4.3,25.8,yb+1.7,6.8,C.fix,1,f);
      box(23.4,yb,9.4,24.6,yb+1.4,11,C.fix,1,f);
      box(19,yb,12.6,21.2,yb+2.8,13.8,C.fix,1,f);
      T('zones','flow','plumbing','elec');
      box(27.4,yb,11.9,29.8,yb+3,13.8,C.fix,1,f);
      box(27.4,yb+3.05,11.9,29.8,yb+6,13.8,C.fix,1,f);
    });
    T('zones'); B.only='zones';
    [[0.4,0.4,12,14],[0.4,14,22,31.6],[22,14,39.6,31.6],[12,0.4,18,14],[18,4,26,14],[26,8,31,14],[31,0.4,39.6,14],[26,0.4,31,8],[18,0.4,26,4]]
      .forEach(([x0,z0,x1,z1])=>box(x0+0.15,0.02,z0+0.15,x1-0.15,0.05,z1-0.15,C.zone,1,{upper:false,edges:0x141414,edgeOp:.5}));
    B.only=null;
    T('zones','overview');
    label('Kitchen', [6.5,0.4,11], {kind:'room', sub:'fridge · pantry · stove · sink', ov:true});
    label('Living + dining', [9,0.4,28.5], {kind:'room', sub:'sofa · TV · table', ov:true});
    label('Bedroom', [27,0.4,23], {kind:'room', sub:'bed · dresser', ov:true});
    T('zones');
    label('Office', [35.5,0.4,10], {kind:'room', sub:'desk · bed'});
    label('Bath', [22,0.4,8.5], {kind:'room', sub:'tub · toilet · sink'});
    label('Laundry', [28.5,6.6,11], {kind:'room', sub:'washer · dryer'});
    label('Mech.', [14,0.4,2.2], {kind:'room', sub:'furnace'});
    label('Hall', [15,0.4,10], {kind:'room'});

    // ---- material flow ----
    L('flow'); T('flow');
    dashed([[3.6,37],[3.6,30],[3.6,20.5],[4.4,12],[4.4,8.5],[4.4,4.6],[7.2,3.6],[9.3,3.6],[12.6,9.5],[16.5,16.4]], 0.3, C.flow);
    dashed([[17.6,16.4],[13.6,8.6],[6.2,3.8],[10.4,12.6],[5.2,20],[5.2,30],[5.2,37]], 0.22, C.flow2, 0.08);
    dashed([[25.5,16.8],[28.4,14.4],[30.4,15.6],[27.2,17.6]], 0.3, C.flow2, 0.08);
    label('1  In · front door', [3.6,1.2,35.2], {color:'#141414'});
    label('2  Store · pantry + fridge', [-1.5,3.5,8], {color:'#141414'});
    label('3  Prepare · counter + stove', [8.6,4.6,1.2], {color:'#141414'});
    label('4  Serve · dining table', [16.5,3.8,19], {color:'#141414'});
    label('5  Back out · sink, trash', [9.2,2.6,13.6], {color:'#9a9a96'});
    label('Laundry loop', [28.6,7.2,15.2], {color:'#9a9a96'});

    // ---- electrical ----
    L('elec'); T('elec','service','site');
    box(51.6,-0.05,41.6,56.4,0.3,46.4,0xffffff,1,{upper:false,edges:0x8e8e8a,edgeOp:.6});
    box(52.2,0.3,42.2,55.8,4.6,45.8,C.xfmr,1,{upper:false,edges:0x2a2a2a,edgeOp:.5});
    T('elec','service');
    label('Pad-mount transformer', [54,5.8,44], {ov:true, color:hex(C.xfmr), tags:['elec','service','overview']});
    pipe([[54,0.3,42.2],[54,-2.2,42.2],[54,-2.2,30],[44,-2.2,30],[44,0,30],[44,2.2,24.5]], 0.2, C.elec);
    T('elec','service','labels');
    [41.2,42.6,44,45.4].forEach(x=>{ box(x-0.5,4.3,24.05,x+0.5,6,24.45,0xb9b9b5,1,{upper:false,edges:0x2a2a2a,edgeOp:.5}); box(x-0.45,2.2,24.05,x+0.45,3.8,24.45,0x8f8f8b,1,{upper:false}); });
    T('elec','service');
    label('Electrical room · meters + main disconnects', [43.5,7.6,32.3], {ov:true, color:hex(C.elec), tags:['elec','service','overview']});
    T('elec','overhead');
    pipe([[42.6,6,24.6],[42.6,9.15,24.6],[36.5,9.15,24.6],[36.5,9.15,11],[30.9,9.15,11],[30.9,6,11]], 0.11, C.elec);
    pipe([[45.4,6,24.8],[45.4,9.15,24.8],[37,9.15,24.8],[37,9.15,11.6],[30.9,9.15,11.6],[30.9,FL2+5.5,11.6]], 0.11, C.elec);
    label('Feeders to each unit panel', [40.5,9.2,24.7], {color:hex(C.elec), tags:['elec']});
    T('elec','labels');
    [0,FL2].forEach(yb=>box(30.75,yb+3.5,10.2,31.05,yb+6,12.2,0x8f8f8b,1,{upper:yb>0}));
    T('elec');
    label('Unit A panel', [31.1,6.8,10.4], {color:hex(C.elec)});
    label('Unit B panel', [31.1,FL2+6.8,10.4], {color:hex(C.elec)});
    T('elec','overhead','clash');
    pipe([[30.9,9.15,11],[36,9.15,11],[36,9.15,23],[10,9.15,23],[10,8.95,23]], 0.05, C.elec);
    pipe([[31,9.15,23],[31,8.95,23]], 0.05, C.elec);
    pipe([[30.9,9.15,10.6],[30.9,9.15,7],[6,9.15,7],[6,8.95,7]], 0.05, C.elec);
    pipe([[22,9.15,7],[22,9.15,9],[22,8.95,9]], 0.05, C.elec);
    pipe([[30.9,9.15,7],[35.5,9.15,7],[35.5,8.95,7]], 0.05, C.elec);
    label('Branch circuits in the cavity', [20,9.2,7], {color:hex(C.elec), tags:['elec']});
    T('elec');
    pipe([[30.9,FL2+6,11.6],[30.9,CL2+0.4,11.6],[36,CL2+0.4,11.6],[36,CL2+0.4,23],[10,CL2+0.4,23],[10,CL2,23]], 0.05, C.elec);
    pipe([[30.9,CL2+0.4,11.6],[30.9,CL2+0.4,7],[6,CL2+0.4,7],[6,CL2,7]], 0.05, C.elec);
    [[10,23],[31,23],[6,7],[22,9],[35.5,7]].forEach(([x,z])=>{ cyl(x,CL1-0.12,z,0.45,0.1,0xfff3c9,1,{upper:false}); cyl(x,CL2-0.12,z,0.45,0.1,0xfff3c9,1,{upper:true}); });
    label('Light boxes', [10,8.3,23.6], {color:hex(C.elec)});

    // ---- domestic water ----
    L('water'); T('plumbing','service','site');
    box(29.2,-0.05,43.2,30.8,0.35,44.8,0x8f8f8b,1,{upper:false});
    T('plumbing','service');
    label('Water meter', [30,1.2,44.6], {color:hex(C.cold)});
    pipe([[30,0,44],[30,-3,44],[-3,-3,44],[-3,-3,-1.5],[10.5,-3,-1.5]], 0.12, C.cold);
    T('plumbing','service','labels');
    cyl(12,0.15,-1.5,0.95,4.8,0xf3f3f1,1,{upper:false,edges:0x3a3a3a,edgeOp:.6});
    cyl(12,FL2+0.15,-1.5,0.95,4.8,0xf3f3f1,1,{upper:true,edges:0x3a3a3a,edgeOp:.6});
    T('plumbing','service');
    label('Water heater closets', [12,7.2,-3.4], {ov:true, color:hex(C.hot), tags:['plumbing','service','overview']});
    T('plumbing');
    pipe([[12,4.95,-1.5],[12,6.2,-1.5],[13.6,6.6,-2.6],[13.6,23,-2.6]], 0.17, 0xa9a9a5);
    pipe([[12,FL2+4.95,-1.5],[12,23,-1.5]], 0.17, 0xa9a9a5);
    pipe([[10.5,-3,-1.5],[10.5,16,-1.5],[11.6,16,-1.5],[11.6,FL2+4.95,-1.5]], 0.1, C.cold);
    pipe([[10.5,5.8,-1.5],[11.6,5.8,-1.5],[11.6,4.95,-1.5]], 0.08, C.cold);
    pipe([[12.4,FL2+4.95,-1.5],[12.4,16.3,-1.5],[13.4,16.3,-1.5],[13.4,16.3,0.3]], 0.08, C.hot);
    T('plumbing','overhead','clash');
    pipe([[10.5,9.6,-1.5],[10.5,9.6,9.2],[28.5,9.6,9.2]], 0.09, C.cold);
    pipe([[12.4,4.95,-1.5],[12.4,6,-1.5],[13.2,6,-1.5],[13.2,9.78,-1.5],[13.2,9.78,0.5],[10.9,9.78,0.5],[10.9,9.78,9.6],[28.9,9.78,9.6]], 0.08, C.hot);
    T('plumbing','overhead');
    pipe([[10.5,9.6,0.9],[6,9.6,0.9],[6,3,0.9]], 0.07, C.cold);
    pipe([[20,9.6,9.2],[20,9.6,13.4],[20,2.6,13.4]], 0.06, C.cold);
    pipe([[24,9.6,9.2],[24,1.6,9.2]], 0.06, C.cold);
    pipe([[22,9.6,9.2],[22,9.6,4.6],[22,3.4,4.6]], 0.06, C.cold);
    pipe([[28.5,9.6,9.2],[28.5,9.6,13.7],[28.5,4,13.7]], 0.06, C.cold);
    pipe([[10.9,9.78,0.5],[6.4,9.78,0.5],[6.4,3,0.5]], 0.07, C.hot);
    pipe([[20.4,9.78,9.6],[20.4,9.78,13.4],[20.4,2.6,13.4]], 0.06, C.hot);
    pipe([[22.4,9.78,9.6],[22.4,9.78,4.6],[22.4,3.4,4.6]], 0.06, C.hot);
    pipe([[28.9,9.78,9.6],[28.9,9.78,13.7],[28.9,4,13.7]], 0.06, C.hot);
    label('Cold water · pressure', [17,9.6,9.2], {color:hex(C.cold), tags:['plumbing','overhead']});
    label('Hot water · pressure', [25.5,9.78,9.6], {color:hex(C.hot), tags:['plumbing','overhead']});

    // ---- drain, waste, vent ----
    L('dwv'); T('plumbing','labels');
    pipe([[26.3,-2.7,6],[26.3,roofY(6)+1.2,6]], 0.16, C.dwv);
    T('plumbing');
    pipe([[6.5,-2.2,0.6],[6.5,roofY(0.6)+1.2,0.6]], 0.12, C.dwv);
    label('Drain stack + roof vent', [26.3,roofY(6)+1.8,6], {color:hex(C.dwv)});
    label('Kitchen stack', [6.5,roofY(0.6)+1.8,0.6], {color:hex(C.dwv)});
    T('plumbing','overhead');
    pipe([[24,FL2,10.2],[24,10.0,10.2],[24,9.93,6],[26.3,9.88,6]], 0.1, C.dwv);
    pipe([[20,FL2,13.2],[20,10.02,13.2],[20,10.0,10.2],[24,10.0,10.2]], 0.07, C.dwv);
    pipe([[22,FL2,5.5],[22,9.95,5.5],[22,9.94,6],[24,9.93,6]], 0.08, C.dwv);
    pipe([[28.6,FL2,12.8],[28.6,10.0,12.8],[28.6,9.92,6],[26.3,9.88,6]], 0.08, C.dwv);
    pipe([[6,FL2+2.2,1.3],[6.5,FL2+2.2,0.6]], 0.07, C.dwv);
    label('Unit B drains slope through the cavity', [22,10.4,3.4], {color:hex(C.dwv)});
    T('plumbing');
    pipe([[24,0,10.2],[24,-1.7,10.2],[24,-1.85,6],[26.3,-2.0,6]], 0.1, C.dwv);
    pipe([[20,1.8,13.6],[20,-1.6,13.6],[20,-1.7,10.2],[24,-1.7,10.2]], 0.07, C.dwv);
    pipe([[22,0.2,5.5],[22,-1.6,5.5],[22,-1.65,6],[24,-1.85,6]], 0.08, C.dwv);
    pipe([[28.6,2.4,13.6],[28.6,-1.6,13.6],[28.6,-1.9,6],[26.3,-2.0,6]], 0.08, C.dwv);
    pipe([[6,2.2,1.3],[6.5,2.2,0.6]], 0.07, C.dwv);
    label('Unit A drains under the slab', [15,-2.6,6], {color:hex(C.dwv)});
    T('plumbing','service','site');
    pipe([[6.5,-2.2,0.6],[6.5,-2.3,6],[26.3,-2.7,6],[26.3,-2.9,32],[26.3,-3.4,52]], 0.16, C.dwv);
    T('plumbing','service');
    label('Sewer lateral to the street', [26.3,-3.4,49], {color:hex(C.dwv)});

    // ---- HVAC ----
    L('hvac'); T('hvac','service');
    [[1,3.5],[5,7.5]].forEach(([z0,z1])=>{ box(-6.2,0,z0,-3.6,2.6,z1,0xe6e6e3,1,{upper:false,edges:0x3a3a3a,edgeOp:.6}); cyl(-4.9,2.6,(z0+z1)/2,0.95,0.06,0x3b3b3b,1,{upper:false}); });
    label('AC condensers', [-4.9,3.8,4.2], {ov:true, color:hex(C.hvac), tags:['hvac','service','overview']});
    T('hvac');
    pipe([[-3.6,1.8,2.2],[-0.6,1.8,2.2],[-0.6,1.8,0.25],[13.1,1.8,0.25],[13.1,4,0.25],[13.1,4,1.0]], 0.07, C.hvacDk);
    pipe([[-3.6,1.8,6.2],[-0.6,1.8,6.2],[-0.6,CL2+0.9,6.2],[10.5,CL2+0.9,6.2],[10.5,CL2+0.9,12.6]], 0.07, C.hvacDk);
    label('Refrigerant lines', [-0.6,14,6.2], {color:hex(C.hvacDk)});
    box(13.25,0,0.75,15.25,5,2.75,C.equip,1,{upper:false,edges:0x3a3a3a,edgeOp:.6});
    label('Furnace · Unit A', [14.3,5.8,1.8], {color:hex(C.hvac)});
    box(10.5,CL2+0.2,12,17.5,CL2+2.2,15,C.equip,1,{upper:true,edges:0x3a3a3a,edgeOp:.6});
    label('Air handler in the attic · Unit B', [14,CL2+2.9,13.5], {color:hex(C.hvac)});
    const D2 = {upper:false,rough:.45,metal:.25};
    T('hvac','clash');
    box(13.45,5,0.95,15.05,8.9,2.55,C.hvac,1,D2);
    box(13.45,7.9,2.55,15.05,8.9,14,C.hvac,1,D2);
    box(13.45,7.9,14,15.05,10.03,15,C.hvac,1,D2);
    L('structure'); T('clash');
    box(13.15,7.62,4,15.35,CL1,14.4,0xffffff,0.45,{upper:false,struct:true,edges:0x141414,edgeOp:.8});
    label('Soffit · duct too deep for the cavity', [14.25,7.2,6.2], {color:hex(C.hvac)});
    label('Pipes pass above the soffit', [10.9,10.4,4.6], {color:hex(C.cold)});
    L('hvac'); T('hvac','overhead');
    box(13.45,9.28,15,15.05,10.03,20.7,C.hvac,1,D2);
    box(3,9.28,19.3,34,10.03,20.7,C.hvac,1,D2);
    label('Supply trunk in the floor cavity', [27,10.4,20], {color:hex(C.hvac)});
    [[8,20.7,24],[18,20.7,24],[31,20.7,24]].forEach(([x,z0,z1])=>pipe([[x,9.65,z0],[x,9.65,z1],[x,9.05,z1]],0.3,C.hvac));
    pipe([[33,9.65,19.3],[33,9.65,7],[35.5,9.65,7],[35.5,9.05,7]],0.3,C.hvac);
    T('hvac');
    box(13.05,8.05,7,13.15,8.6,8.6,0xffffff,1,{upper:false});
    [[8,24],[18,24],[31,24],[35.5,7]].forEach(([x,z])=>box(x-0.6,CL1-0.08,z-0.6,x+0.6,CL1-0.02,z+0.6,0xffffff,1,{upper:false,edges:0x3a3a3a,edgeOp:.7}));
    label('Ceiling diffusers', [18,8.3,24.6], {color:hex(C.hvac)});
    box(13.45,CL2+0.8,15,15.05,CL2+1.6,20.7,C.hvac,1,{...D2,upper:true});
    box(3,CL2+0.8,19.3,34,CL2+1.6,20.7,C.hvac,1,{...D2,upper:true});
    [[8,20.7,24],[18,20.7,24],[31,20.7,24]].forEach(([x,z0,z1])=>pipe([[x,CL2+1.2,z0],[x,CL2+1.2,z1],[x,CL2+0.05,z1]],0.3,C.hvac));
    pipe([[33,CL2+1.2,19.3],[33,CL2+1.2,7],[35.5,CL2+1.2,7],[35.5,CL2+0.05,7]],0.3,C.hvac);
    pipe([[10.5,CL2+1.2,13.5],[6,CL2+1.2,13.5],[6,CL2+1.2,7],[6,CL2+0.05,7]],0.3,C.hvac);

    // ---- fire sprinkler ----
    L('fire'); T('fire','service','labels');
    pipe([[46,-1.5,25.2],[46,9.35,25.2]], 0.17, C.fire);
    box(45.6,3.5,24.8,46.4,4.4,25.6,0xb21e31,1,{upper:false});
    T('fire','service');
    label('Sprinkler riser', [46.6,3,25.2], {color:hex(C.fire)});
    T('fire');
    pipe([[39.6,9.35,25.2],[39.6,CL2+0.8,25.2]], 0.12, C.fire);
    pipe([[39.6,CL2+0.8,25.2],[1.5,CL2+0.8,25.2]], 0.12, C.fire);
    pipe([[38,CL2+0.8,25.2],[38,CL2+0.8,6],[2,CL2+0.8,6]], 0.1, C.fire);
    label('Mains in the attic', [6,CL2+1.3,25.2], {color:hex(C.fire)});
    T('fire','overhead','clash');
    pipe([[46,9.35,25.2],[1.5,9.35,25.2]], 0.12, C.fire);
    pipe([[38,9.35,25.2],[38,9.35,6],[2,9.35,6]], 0.1, C.fire);
    label('Sprinkler mains in the cavity', [6,9.35,25.2], {color:hex(C.fire), tags:['fire','overhead']});
    T('fire');
    [[5,25.2],[15,25.2],[28,25.2],[38,18],[38,10],[5,6],[16.8,6],[22,6],[30,6]].forEach(([x,z])=>{
      pipe([[x,9.35,z],[x,8.92,z]],0.04,C.fire); cyl(x,8.82,z,0.22,0.05,0x8f8f8b,1,{upper:false});
      pipe([[x,CL2+0.8,z],[x,CL2-0.08,z]],0.04,C.fire); cyl(x,CL2-0.18,z,0.22,0.05,0x8f8f8b,1,{upper:true});
    });
    label('Sprinkler heads', [5,8.3,5.2], {color:hex(C.fire)});

    // finished building (purpose figure only)
    L('shell'); T('purpose'); B.only='purpose';
    {
      const W=0xfbfbfa, E={upper:false,edges:C.edge,edgeOp:.7};
      box(0,-0.5,0,40,0,32,C.slab,1,{upper:false});
      box(0,0,0,40,CL2,32,W,1,E);
      lines([0,FL2,32.01,40,FL2,32.01, 0,FL2,-0.01,40,FL2,-0.01, -0.01,FL2,0,-0.01,FL2,32], C.edge, 0.35, {upper:false});
      quad([-1,CL2,-1],[41,CL2,-1],[41,RIDGE,16],[-1,RIDGE,16],0xececea,1,{upper:false});
      quad([-1,RIDGE,16],[41,RIDGE,16],[41,CL2,33],[-1,CL2,33],0xe4e4e1,1,{upper:false});
      lines([-1,CL2,-1,41,CL2,-1, -1,RIDGE,16,41,RIDGE,16, -1,CL2,33,41,CL2,33, -1,CL2,-1,-1,RIDGE,16, -1,RIDGE,16,-1,CL2,33, 41,CL2,-1,41,RIDGE,16, 41,RIDGE,16,41,CL2,33], C.edge, 0.7, {upper:false});
      quad([-1,CL2,-1],[-1,RIDGE,16],[-1,CL2,33],[-1,CL2,33],W,1,{upper:false});
      // windows and doors on the walkway side
      [[9,13],[16,20],[26,30],[33,37]].forEach(([a,b])=>{ box(a,3,32,b,7,32.08,0xd9dde0,1,{upper:false,edges:C.edge,edgeOp:.5}); box(a,FL2+3,32,b,FL2+7,32.08,0xd9dde0,1,{upper:false,edges:C.edge,edgeOp:.5}); });
      box(2.6,0,32,5.8,7,32.1,0x8f8f8b,1,{upper:false});
      box(40,0,24,47,9,32,0xf3f3f1,1,E);
      box(40,10.0,24,47,SPLIT,32,0xffffff,1,E);
      box(39.95,FL2,26,40.05,FL2+7,29,0x8f8f8b,1,{upper:false});
      for(let i=0;i<14;i++){ const x=47+i*1.05, y=SPLIT-(i+1)*0.74; box(x,Math.max(0,y-0.25),28,x+1.05,y,32,0xffffff,1,{upper:false,edges:0x8e8e8a,edgeOp:.6}); }
      box(0,SPLIT,-8,14,FL2,0,C.slab,1,{upper:false,edges:C.edge,edgeOp:.5});
      lines([0,FL2+3.5,-8,14,FL2+3.5,-8, 0,FL2+3.5,-8,0,FL2+3.5,0, 0,FL2,-8,0,FL2+3.5,-8, 14,FL2,-8,14,FL2+3.5,-8], C.edge, 0.6, {upper:false});
      [[1,3.5],[5,7.5]].forEach(([z0,z1])=>{ box(-6.2,0,z0,-3.6,2.6,z1,0xe6e6e3,1,{upper:false,edges:0x3a3a3a,edgeOp:.6}); });
      box(52.2,0.3,42.2,55.8,4.6,45.8,C.xfmr,1,{upper:false,edges:0x2a2a2a,edgeOp:.5});
    }
    B.only=null;

    // information layer
    L('base'); T('labels');
    label('Unit 101', [4.2,8,32.4], {color:'#141414'});
    label('Unit 201', [40.4,FL2+8,27.5], {color:'#141414'});
    label('Meters M-101 · M-102 · M-201 · M-202', [43.5,6.9,23.8], {color:hex(C.elec)});
    label('Panel 101', [31.2,6.9,10.4], {color:hex(C.elec)});
    label('Panel 201', [31.2,FL2+6.9,10.4], {color:hex(C.elec)});
    label('WH-101', [12,6.3,-2.6], {color:hex(C.hot)});
    label('WH-201', [12,FL2+6.3,-2.6], {color:hex(C.hot)});
    label('Riser FS-1', [46.6,4.6,25.2], {color:hex(C.fire)});
    label('Stack DS-1', [26.3,roofY(6)+1.8,6], {color:hex(C.dwv)});
    L('structure'); T('overview');
    label('Floor-ceiling cavity', [0.2,9.75,30.5], {ov:true, color:'#9a9a96'});
  })();

  // ---------- state ----------
  let fig = FIGS[0], labelsOn = true, tween = null, explode = 0, exTarget = 0;
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function applyVisibility(){
    Object.entries(groups).forEach(([k,g])=>{ const on = (k==='dims'||k==='site'||k==='shell') ? true : layerOn[k]!==false; g.lo.visible = on; g.up.visible = on && !fig.cut; });
  }
  function applyFocus(){
    const f = fig.focus;
    root.traverse(o=>{
      const ud=o.userData; if(!o.material || !ud || ud.base==null) return;
      o.visible = !(fig.cut && ud.cavity) && !(ud.only && ud.only!==f);
      let on = !f || ud.tags.includes(f);
      if(fig.ghost && fig.ghost.includes(ud.layer)) on = false;
      let op = ud.base;
      if(!on) op = ud.line ? Math.min(ud.base, 0.14) : Math.min(ud.base, ud.struct ? 0.03 : 0.07);
      o.material.opacity = op; o.material.transparent = op<1; o.material.depthWrite = op>=0.5; o.material.needsUpdate = true;
    });
  }
  function placeUppers(){ Object.values(groups).forEach(g=>g.up.position.y=explode); }
  function setCam(c, instant){
    const tp=V(c[0]), tt=V(c[1]);
    if(instant || reduce){ camera.position.copy(tp); controls.target.copy(tt); controls.update(); tween=null; return; }
    tween={fp:camera.position.clone(), ft:controls.target.clone(), tp, tt, s:performance.now(), d:1100};
  }
  function select(id, instant){
    const f = FIGS.find(x=>x.id===id) || FIGS[0];
    fig = f;
    ['structure','furniture','flow','hvac','water','dwv','fire','elec'].forEach(k=>layerOn[k]=f.layers.includes(k));
    exTarget = f.ex||0; if(instant || reduce){ explode = exTarget; placeUppers(); }
    applyVisibility(); applyFocus(); setCam(f.cam, instant);
    if(opts.onChange) opts.onChange(f);
  }
  function resize(){ const w=stage.clientWidth, h=stage.clientHeight; renderer.setSize(w,h,false); camera.aspect=w/Math.max(h,1); camera.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(stage); resize();
  const tmp=new THREE.Vector3();
  function updateLabels(){
    const w=stage.clientWidth, h=stage.clientHeight, f=fig.focus;
    LABELS.forEach(Lb=>{
      let show = labelsOn && !fig.nolabels && (Lb.layer==='dims' || Lb.layer==='site' || layerOn[Lb.layer]!==false) && !(fig.cut && Lb.upper);
      if(show) show = f ? Lb.tags.includes(f) : Lb.ov;
      if(!show){ if(Lb.el.style.display!=='none') Lb.el.style.display='none'; return; }
      tmp.copy(Lb.p); if(Lb.upper) tmp.y+=explode; tmp.project(camera);
      if(tmp.z>1||Math.abs(tmp.x)>1.05||Math.abs(tmp.y)>1.05){ Lb.el.style.display='none'; return; }
      const x=(tmp.x*.5+.5)*w, y=(-tmp.y*.5+.5)*h;
      Lb.el.style.display='flex';
      Lb.el.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(${Lb.align==='r'?'-100%':'-50%'},-50%)`;
    });
  }
  function tick(now){
    if(tween){ const k=Math.min(1,(now-tween.s)/tween.d), e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
      camera.position.lerpVectors(tween.fp,tween.tp,e); controls.target.lerpVectors(tween.ft,tween.tt,e); if(k>=1) tween=null; }
    const nx = explode + (exTarget-explode)*(reduce?1:0.12);
    if(Math.abs(nx-explode)>1e-4){ explode=nx; placeUppers(); }
    controls.update(); renderer.render(scene,camera); updateLabels();
    requestAnimationFrame(tick);
  }
  select(opts.start || 'overview', true);
  requestAnimationFrame(tick);
  return {figs:FIGS, select, current:()=>fig, reset:()=>setCam(fig.cam), labels:on=>{labelsOn=on;}};
}
window.SystemModel = {mount, FIGS};
})();
