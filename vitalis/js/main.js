/* ================================================================
   VITALIS — Shared Site Script
   ================================================================ */

/* 1. LOADER */
window.addEventListener('load',()=>{
  const loader=document.getElementById('loader');
  if(loader) setTimeout(()=>loader.classList.add('hidden'),500);
});

/* 2. CUSTOM CURSOR */
(function(){
  const dot=document.getElementById('cursor-dot');
  const ring=document.getElementById('cursor-ring');
  if(!dot||!ring) return;
  let mx=0,my=0,rx=0,ry=0;
  window.addEventListener('mousemove',e=>{
    mx=e.clientX;my=e.clientY;
    dot.style.left=mx+'px';dot.style.top=my+'px';
  });
  function animateCursor(){
    rx+=(mx-rx)*0.18; ry+=(my-ry)*0.18;
    ring.style.left=rx+'px'; ring.style.top=ry+'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
  document.querySelectorAll('[data-cursor-hover], a, button, input, textarea, select').forEach(el=>{
    el.addEventListener('mouseenter',()=>ring.classList.add('active'));
    el.addEventListener('mouseleave',()=>ring.classList.remove('active'));
  });
})();

/* 3. AMBIENT PARTICLE BACKGROUND */
(function(){
  const pCanvas=document.getElementById('bg-particles');
  if(!pCanvas) return;
  const pCtx=pCanvas.getContext('2d');
  let particles=[];
  function resizeParticleCanvas(){
    pCanvas.width=window.innerWidth; pCanvas.height=document.body.scrollHeight;
  }
  function initParticles(){
    particles=[];
    const count=Math.floor((window.innerWidth*window.innerHeight)/22000);
    for(let i=0;i<count;i++){
      particles.push({
        x:Math.random()*pCanvas.width,
        y:Math.random()*pCanvas.height,
        r:Math.random()*1.4+0.4,
        vy:Math.random()*0.15+0.03,
        alpha:Math.random()*0.4+0.1,
        hue: Math.random()>0.5 ? '0,240,214' : '232,183,92'
      });
    }
  }
  function drawParticles(){
    pCtx.clearRect(0,0,pCanvas.width,pCanvas.height);
    particles.forEach(p=>{
      p.y-=p.vy;
      if(p.y< -10) p.y=pCanvas.height+10;
      pCtx.beginPath();
      pCtx.arc(p.x,p.y,p.r,0,Math.PI*2);
      pCtx.fillStyle=`rgba(${p.hue},${p.alpha})`;
      pCtx.fill();
    });
    requestAnimationFrame(drawParticles);
  }
  resizeParticleCanvas(); initParticles(); drawParticles();
  window.addEventListener('resize',()=>{ resizeParticleCanvas(); initParticles(); });
})();

/* 4. NAV SCROLL STATE + MOBILE MENU + ACTIVE LINK */
(function(){
  const navEl=document.getElementById('nav');
  if(navEl){
    window.addEventListener('scroll',()=>{
      navEl.classList.toggle('scrolled', window.scrollY>40);
    });
  }
  const burger=document.getElementById('nav-burger');
  const mobileMenu=document.getElementById('mobile-menu');
  if(burger && mobileMenu){
    burger.addEventListener('click',()=>{
      burger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow=mobileMenu.classList.contains('open')?'hidden':'';
    });
    mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
      burger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow='';
    }));
  }
  // mark active nav link based on current page
  const current=(location.pathname.split('/').pop()||'index.html');
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a=>{
    const href=a.getAttribute('href');
    if(href===current || (current==='' && href==='index.html')){
      a.classList.add('active');
    }
  });
})();

/* 5. THREE.JS — HERO "VITALITY CORE" ORB (home page only) */
function initOrb(){
  const mount=document.querySelector('.orb-mount');
  if(!mount || typeof THREE==='undefined') return;
  const w=mount.clientWidth, h=mount.clientHeight;

  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(45,w/h,0.1,100);
  camera.position.set(0,0,7);

  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
  renderer.setSize(w,h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  mount.appendChild(renderer.domElement);

  const orbGroup=new THREE.Group();
  scene.add(orbGroup);

  const coreGeo=new THREE.IcosahedronGeometry(1.8,2);
  const coreMat=new THREE.MeshBasicMaterial({color:0x00f0d6,wireframe:true,transparent:true,opacity:0.55});
  const coreMesh=new THREE.Mesh(coreGeo,coreMat);
  orbGroup.add(coreMesh);

  const glowGeo=new THREE.IcosahedronGeometry(1.5,1);
  const glowMat=new THREE.MeshBasicMaterial({color:0xe8b75c,wireframe:true,transparent:true,opacity:0.25});
  const glowMesh=new THREE.Mesh(glowGeo,glowMat);
  orbGroup.add(glowMesh);

  const ringGeo=new THREE.TorusGeometry(2.6,0.008,8,120);
  const ringMat=new THREE.MeshBasicMaterial({color:0x00f0d6,transparent:true,opacity:0.35});
  const ring1=new THREE.Mesh(ringGeo,ringMat);
  ring1.rotation.x=Math.PI/2.4;
  orbGroup.add(ring1);
  const ring2=new THREE.Mesh(ringGeo,ringMat.clone());
  ring2.material.opacity=0.18;
  ring2.rotation.x=Math.PI/1.6;
  ring2.rotation.y=Math.PI/3;
  orbGroup.add(ring2);

  const ptsGeo=new THREE.BufferGeometry();
  const ptsCount=60;
  const positions=new Float32Array(ptsCount*3);
  for(let i=0;i<ptsCount;i++){
    const r=2.9+Math.random()*1.1;
    const theta=Math.random()*Math.PI*2;
    const phi=Math.acos((Math.random()*2)-1);
    positions[i*3]=r*Math.sin(phi)*Math.cos(theta);
    positions[i*3+1]=r*Math.sin(phi)*Math.sin(theta);
    positions[i*3+2]=r*Math.cos(phi);
  }
  ptsGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const ptsMat=new THREE.PointsMaterial({color:0xffffff,size:0.03,transparent:true,opacity:0.5});
  const points=new THREE.Points(ptsGeo,ptsMat);
  orbGroup.add(points);

  function onOrbResize(){
    const w=mount.clientWidth, h=mount.clientHeight;
    camera.aspect=w/h; camera.updateProjectionMatrix();
    renderer.setSize(w,h);
  }
  window.addEventListener('resize',onOrbResize);

  let targetRotX=0,targetRotY=0;
  window.addEventListener('mousemove',(e)=>{
    targetRotY=(e.clientX/window.innerWidth-0.5)*0.6;
    targetRotX=(e.clientY/window.innerHeight-0.5)*0.4;
  });

  const clock=new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    const t=clock.getElapsedTime();
    coreMesh.rotation.y=t*0.15;
    coreMesh.rotation.x=t*0.08;
    glowMesh.rotation.y=-t*0.1;
    ring1.rotation.z=t*0.12;
    ring2.rotation.z=-t*0.09;
    points.rotation.y=t*0.03;

    orbGroup.rotation.y+=(targetRotY-orbGroup.rotation.y)*0.03;
    orbGroup.rotation.x+=(targetRotX-orbGroup.rotation.x)*0.03;

    const pulse=1+Math.sin(t*1.6)*0.03;
    coreMesh.scale.set(pulse,pulse,pulse);

    renderer.render(scene,camera);
  }
  animate();
}
initOrb();

/* 6. GSAP SCROLL REVEALS */
if(typeof gsap!=='undefined'){
  gsap.registerPlugin(ScrollTrigger);
  document.querySelectorAll('.reveal').forEach((el,i)=>{
    gsap.to(el,{
      opacity:1,y:0,duration:0.9,ease:'power3.out',
      scrollTrigger:{trigger:el,start:'top 88%'},
      delay:(i%4)*0.06
    });
  });
}

/* 7. 3D TILT (pricing / feature cards) */
document.querySelectorAll('[data-tilt]').forEach(card=>{
  card.addEventListener('mousemove',(e)=>{
    const rect=card.getBoundingClientRect();
    const px=(e.clientX-rect.left)/rect.width-0.5;
    const py=(e.clientY-rect.top)/rect.height-0.5;
    card.style.transform=`rotateY(${px*8}deg) rotateX(${-py*8}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave',()=>{
    card.style.transform='rotateY(0) rotateX(0) translateY(0)';
  });
});

/* 8. FAQ ACCORDION */
document.querySelectorAll('.faq-item').forEach(item=>{
  const q=item.querySelector('.faq-q');
  const a=item.querySelector('.faq-a');
  q.addEventListener('click',()=>{
    const isOpen=item.classList.contains('open');
    item.closest('.faq-list').querySelectorAll('.faq-item').forEach(other=>{
      other.classList.remove('open');
      other.querySelector('.faq-a').style.maxHeight=null;
    });
    if(!isOpen){
      item.classList.add('open');
      a.style.maxHeight=a.scrollHeight+'px';
    }
  });
});

/* 9. LEAD / CONTACT FORM VALIDATION + FAKE SUBMIT */
document.querySelectorAll('form[data-validate]').forEach(form=>{
  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    let valid=true;
    form.querySelectorAll('[required]').forEach(field=>{
      const wrap=field.closest('.field');
      wrap.classList.remove('has-error'); field.classList.remove('error');
      let ok=field.value.trim().length>1;
      if(field.type==='email'){
        ok=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
      }
      if(!ok){ wrap.classList.add('has-error'); field.classList.add('error'); valid=false; }
    });
    if(valid){
      form.style.display='none';
      const successId=form.getAttribute('data-success');
      const success=successId?document.getElementById(successId):form.nextElementSibling;
      if(success) success.classList.add('show');
    }
  });
});

/* 10. SMOOTH ANCHOR SCROLL (accounts for fixed nav, same-page only) */
document.querySelectorAll('a[href^="#"]').forEach(link=>{
  link.addEventListener('click',(e)=>{
    const targetId=link.getAttribute('href');
    if(targetId.length<2) return;
    const target=document.querySelector(targetId);
    if(target){
      e.preventDefault();
      const y=target.getBoundingClientRect().top+window.scrollY-84;
      window.scrollTo({top:y,behavior:'smooth'});
    }
  });
});
