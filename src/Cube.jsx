import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Cube = () => {
  const mountRef = useRef(null);
  const isOpen = useRef(false); 
  const facesRef = useRef([]);
  const cubeGroupRef = useRef(new THREE.Group());

  useEffect(() => {
    if (mountRef.current) mountRef.current.innerHTML = "";
    
    const scene = new THREE.Scene();
    const loader = new THREE.TextureLoader();

    // 1. BACKGROUND 
    loader.load('/background.jpg', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = false;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      scene.background = tex;
    });

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance" 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio); 
    renderer.outputColorSpace = THREE.SRGBColorSpace; 
    mountRef.current.appendChild(renderer.domElement);

    // 2. THE CUBE 
    scene.add(cubeGroupRef.current);
    const cubeTex = loader.load('/texture.jpg', (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
    });
    
    const brightMat = new THREE.MeshBasicMaterial({ 
      map: cubeTex, 
      side: THREE.DoubleSide,
      transparent: true 
    });

    const size = 3; 
    const offset = size / 2;

    const faceData = [
      { pos: [0, 0, offset], rot: [0, 0, 0], dir: [0, 0, 1] },       
      { pos: [0, 0, -offset], rot: [0, Math.PI, 0], dir: [0, 0, -1] }, 
      { pos: [0, offset, 0], rot: [-Math.PI/2, 0, 0], dir: [0, 1, 0] }, 
      { pos: [0, -offset, 0], rot: [Math.PI/2, 0, 0], dir: [0, -1, 0] }, 
      { pos: [-offset, 0, 0], rot: [0, -Math.PI/2, 0], dir: [-1, 0, 0] }, 
      { pos: [offset, 0, 0], rot: [0, Math.PI/2, 0], dir: [1, 0, 0] },    
    ];

    faceData.forEach((data) => {
      const face = new THREE.Mesh(new THREE.PlaneGeometry(size, size), brightMat);
      const startPos = new THREE.Vector3(...data.pos);
      face.position.copy(startPos);
      face.rotation.set(...data.rot);
      
      const moveDir = new THREE.Vector3(...data.dir);
      const endPos = startPos.clone().add(moveDir.multiplyScalar(7));

      face.userData = { 
        origin: startPos,
        target: endPos
      };
      cubeGroupRef.current.add(face);
      facesRef.current.push(face);
    });

    // 3. EID MUBARAK LABEL
    const createCanvasLabel = (text, fontSize, color, glow) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 1024; canvas.height = 256;
      ctx.fillStyle = color;
      ctx.font = `bold ${fontSize}px "Segoe UI", Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = glow;
      ctx.shadowBlur = 40;
      ctx.fillText(text, 512, 128);

      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ 
        map: new THREE.CanvasTexture(canvas),
        depthTest: true,
        transparent: true,
        opacity: 0 
      }));
      
      sprite.position.set(0, 0, 0); 
      sprite.scale.set(8, 2, 1);
      sprite.renderOrder = 1;
      cubeGroupRef.current.add(sprite);
      return sprite;
    };

    const eidLabel = createCanvasLabel("Eid Mubarak!", 140, "#ffffff", "#0368a2");

    camera.position.z = 15;

    // Handle Window Resize 
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    const onClick = () => {
      isOpen.current = !isOpen.current;
    };
    window.addEventListener('mousedown', onClick);

    const animate = () => {
      requestAnimationFrame(animate);
  
      cubeGroupRef.current.rotation.y += 0.015; 
      cubeGroupRef.current.rotation.x += 0.01;

      const cubeSpeed = 0.05; 
      const textSpeed = 0.20; 

      facesRef.current.forEach((face) => {
        const d = face.userData;
        const destination = isOpen.current ? d.target : d.origin;
        face.position.lerp(destination, cubeSpeed);
      });

      const targetOpacity = isOpen.current ? 1 : 0;
      eidLabel.material.opacity = THREE.MathUtils.lerp(eidLabel.material.opacity, targetOpacity, textSpeed);

      renderer.render(scene, camera);
    };
    
    animate();

    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default Cube;