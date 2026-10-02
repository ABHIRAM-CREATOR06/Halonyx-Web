/**
 * Halonyx - Interactive Handshake Visualization (X3DH Protocol)
 *
 * Illustrative session key fingerprint generation only - NOT real cryptographic key material.
 */

(function () {
  'use strict';

  // Protocol Step Specification
  const STEPS = [
    {
      id: 'FETCH',
      tag: 'FETCH',
      desc: 'Node A requests prekey bundle from Key Server K',
      sr: 'Step 1: FETCH — Node A requests public prekey bundle from Key Server K',
      type: 'pulse',
      from: 'A',
      to: 'K',
      active: ['A', 'K'],
      dots: 1
    },
    {
      id: 'BUNDLE',
      tag: 'BUNDLE',
      desc: 'Key Server K returns Bob public keys (IKb, SPKb, OPKb) to Node A',
      sr: 'Step 2: BUNDLE — Key Server K returns Bob public prekeys to Node A',
      type: 'pulse',
      from: 'K',
      to: 'A',
      active: ['K', 'A'],
      dots: 2
    },
    {
      id: 'DH1..DH4',
      tag: 'DH1..4',
      desc: 'Node A computes DH1=DH(IKa,SPKb), DH2=DH(EKa,IKb), DH3=DH(EKa,SPKb), DH4=DH(EKa,OPKb) locally',
      sr: 'Step 3: DH1 through DH4 — Four Diffie-Hellman exchanges computed locally at Node A',
      type: 'local',
      at: 'A',
      active: ['A'],
      dots: 3
    },
    {
      id: 'HKDF',
      tag: 'HKDF',
      desc: 'Master Secret Key (SK) derived locally at Node A via HKDF',
      sr: 'Step 4: HKDF — Master Secret Key derived locally at Node A',
      type: 'glow',
      at: 'A',
      active: ['A'],
      dots: 4
    },
    {
      id: 'INIT',
      tag: 'INIT',
      desc: 'Initial X3DH payload sent from Node A through Server K to Node B',
      sr: 'Step 5: INIT — Initial X3DH ciphertext relayed from Node A to Node B via Server K',
      type: 'relay',
      path: ['A', 'K', 'B'],
      active: ['A', 'K', 'B'],
      dots: 5
    },
    {
      id: 'READY',
      tag: 'ESTABLISHED',
      desc: 'Node B derives identical SK. Both A and B commit to shared session H.',
      sr: 'Step 6: ESTABLISHED — Shared session key derived independently on both ends',
      type: 'commit',
      from: ['A', 'B'],
      to: 'H',
      active: ['A', 'B', 'H'],
      dots: 6
    }
  ];

  const TOOLTIPS = {
    A: 'Alice: Initiator (computes DH1..DH4 locally)',
    B: 'Bob: Recipient (derives SK from initial message)',
    K: 'Key server: relays public prekey bundles and ciphertext, never private keys or plaintext',
    H: 'Shared session key, derived independently on both ends, never sent'
  };

  // State Variables
  let panelEl, tiltWrapEl, canvasEl, ctx;
  let liveRegionEl, stepTagEl, readoutKeyEl, readoutStatusEl;
  let nodeEls = {}, coreEl, orbitOuterEl;
  let stepControlPrev, stepControlNext, stepControlReplay, stepControlLabel;

  let isReducedMotion = false;
  let isVisible = false;
  let currentStepIdx = 0;
  let stepStartTime = 0;
  let stepTimer = null;
  let animFrameId = null;

  // Pointer & Physics State
  let pointerPos = { x: -1000, y: -1000, active: false };
  let targetTilt = { x: 0, y: 0 };
  let currentTilt = { x: 0, y: 0 };

  // Node Positions (angles in radians, radii normalized)
  const HOME_ANGLES = {
    A: -Math.PI / 2, // Top (-90 deg)
    B: 0,            // Right (0 deg)
    K: Math.PI / 2   // Bottom (90 deg)
  };

  let nodeAngles = { ...HOME_ANGLES };
  let draggingNode = null;
  let dragSpeedMultiplier = 1;
  let tooltipTimeout = null;

  // Canvas Grid & Particle System State
  let gridDots = [];
  let activePackets = [];
  let isGridAtRest = true;
  let dpr = 1;

  function init() {
    panelEl = document.querySelector('.hero-visual');
    if (!panelEl) return;

    tiltWrapEl = panelEl.querySelector('.orbital-tilt-wrap');
    liveRegionEl = document.getElementById('handshake-live-region');
    stepTagEl = document.getElementById('handshake-step-tag');
    readoutKeyEl = document.getElementById('readout-session-key');
    readoutStatusEl = document.getElementById('readout-status');
    coreEl = panelEl.querySelector('.core');
    orbitOuterEl = panelEl.querySelector('.orbit-outer');

    nodeEls.A = panelEl.querySelector('.node-top');
    nodeEls.B = panelEl.querySelector('.node-right');
    nodeEls.K = panelEl.querySelector('.node-bottom');
    nodeEls.H = coreEl;

    // Canvas Setup
    canvasEl = document.createElement('canvas');
    canvasEl.className = 'orbital-canvas';
    canvasEl.setAttribute('aria-hidden', 'true');
    if (tiltWrapEl) {
      tiltWrapEl.insertBefore(canvasEl, tiltWrapEl.firstChild);
    }

    // Reduced Motion Controls
    setupReducedMotionControls();

    // Event Listeners
    setupPointerEvents();
    setupNodeInteractivity();
    setupObservers();

    // Check motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    isReducedMotion = motionQuery.matches;
    motionQuery.addEventListener('change', (e) => {
      isReducedMotion = e.matches;
      handleMotionPreferenceChange();
    });

    // Mark JS as ready to hide static CSS dot grid
    panelEl.classList.add('js-ready');

    resizeCanvas();
    handleMotionPreferenceChange();
  }

  function setupReducedMotionControls() {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'reduced-motion-controls';
    controlsContainer.setAttribute('aria-label', 'Handshake manual controls');

    stepControlPrev = document.createElement('button');
    stepControlPrev.type = 'button';
    stepControlPrev.className = 'button button-ghost btn-sm';
    stepControlPrev.textContent = '← Prev';
    stepControlPrev.addEventListener('click', () => stepManual(-1));

    stepControlLabel = document.createElement('span');
    stepControlLabel.className = 'step-control-label';
    stepControlLabel.textContent = 'Step 1/6';

    stepControlNext = document.createElement('button');
    stepControlNext.type = 'button';
    stepControlNext.className = 'button button-ghost btn-sm';
    stepControlNext.textContent = 'Next →';
    stepControlNext.addEventListener('click', () => stepManual(1));

    stepControlReplay = document.createElement('button');
    stepControlReplay.type = 'button';
    stepControlReplay.className = 'button button-ghost btn-sm';
    stepControlReplay.textContent = '↻ Replay';
    stepControlReplay.addEventListener('click', () => triggerReplay(0, true));

    controlsContainer.appendChild(stepControlPrev);
    controlsContainer.appendChild(stepControlLabel);
    controlsContainer.appendChild(stepControlNext);
    controlsContainer.appendChild(stepControlReplay);

    panelEl.appendChild(controlsContainer);
  }

  function handleMotionPreferenceChange() {
    if (isReducedMotion) {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      clearTimeout(stepTimer);
      targetTilt = { x: 0, y: 0 };
      currentTilt = { x: 0, y: 0 };
      if (tiltWrapEl) tiltWrapEl.style.transform = 'none';
      setStep(currentStepIdx, false);
    } else {
      if (isVisible) {
        setStep(currentStepIdx, false);
        startAnimLoop();
      }
    }
  }

  function resizeCanvas() {
    if (!canvasEl) return;
    const rect = panelEl.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvasEl.width = rect.width * dpr;
    canvasEl.height = rect.height * dpr;
    canvasEl.style.width = rect.width + 'px';
    canvasEl.style.height = rect.height + 'px';

    ctx = canvasEl.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);

    initGridDots(rect.width, rect.height);
  }

  function initGridDots(width, height) {
    gridDots = [];
    const spacing = 16;
    const cols = Math.floor(width / spacing);
    const rows = Math.floor(height / spacing);
    const offsetX = (width - cols * spacing) / 2 + spacing / 2;
    const offsetY = (height - rows * spacing) / 2 + spacing / 2;

    const centerX = width / 2;
    const centerY = height / 2;
    const maxDist = Math.min(width, height) * 0.45;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = offsetX + c * spacing;
        const y = offsetY + r * spacing;
        const distFromCenter = Math.hypot(x - centerX, y - centerY);

        if (distFromCenter <= maxDist) {
          // Calculate opacity falloff
          const alpha = 0.45 * (1 - distFromCenter / maxDist);
          gridDots.push({
            baseX: x,
            baseY: y,
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            alpha: Math.max(0.05, alpha)
          });
        }
      }
    }
    isGridAtRest = false;
  }

  function setupPointerEvents() {
    panelEl.addEventListener('pointermove', (e) => {
      const rect = panelEl.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;

      pointerPos.x = relX;
      pointerPos.y = relY;
      pointerPos.active = true;

      // 3D Parallax Tilt Calculation (Max ~7deg)
      if (!isReducedMotion) {
        const normX = (relX / rect.width) * 2 - 1;
        const normY = (relY / rect.height) * 2 - 1;
        targetTilt.x = -normY * 7;
        targetTilt.y = normX * 7;
      }
      isGridAtRest = false;
    });

    panelEl.addEventListener('pointerleave', () => {
      pointerPos.active = false;
      targetTilt = { x: 0, y: 0 };
    });
  }

  function setupNodeInteractivity() {
    ['A', 'B', 'K'].forEach((key) => {
      const btn = nodeEls[key];
      if (!btn) return;

      btn.addEventListener('pointerdown', (e) => {
        btn.setPointerCapture(e.pointerId);
        draggingNode = key;
        dragSpeedMultiplier = 2.5;
        e.stopPropagation();
      });

      btn.addEventListener('pointermove', (e) => {
        if (draggingNode === key) {
          const rect = tiltWrapEl.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
          nodeAngles[key] = angle;
          updateNodeDOMPositions();
          isGridAtRest = false;
        }
      });

      const handlePointerUp = (e) => {
        if (draggingNode === key) {
          try {
            btn.releasePointerCapture(e.pointerId);
          } catch (_) {}
          draggingNode = null;
          dragSpeedMultiplier = 1;
        }
      };

      btn.addEventListener('pointerup', handlePointerUp);
      btn.addEventListener('pointercancel', handlePointerUp);

      btn.addEventListener('click', (e) => {
        showTooltip(key);
        triggerReplay(getStepForNode(key), true);
      });
    });

    if (coreEl) {
      coreEl.addEventListener('click', () => {
        showTooltip('H');
        triggerReplay(5, true);
      });
    }
  }

  function getStepForNode(nodeKey) {
    if (nodeKey === 'A') return 0; // FETCH / Local DH
    if (nodeKey === 'K') return 0; // FETCH / BUNDLE
    if (nodeKey === 'B') return 4; // INIT
    return 0;
  }

  function showTooltip(key) {
    const text = TOOLTIPS[key];
    if (!text) return;

    let tooltipEl = panelEl.querySelector(`.tooltip-${key}`);
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.className = `node-tooltip tooltip-${key}`;
      tooltipEl.setAttribute('role', 'tooltip');
      const targetBtn = nodeEls[key];
      if (targetBtn) targetBtn.appendChild(tooltipEl);
    }

    tooltipEl.textContent = text;
    tooltipEl.classList.add('is-visible');

    if (tooltipTimeout) clearTimeout(tooltipTimeout);
    tooltipTimeout = setTimeout(() => {
      panelEl.querySelectorAll('.node-tooltip').forEach((t) => t.classList.remove('is-visible'));
    }, 2500);
  }

  function setupObservers() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            if (!isReducedMotion) startAnimLoop();
          } else {
            if (animFrameId) cancelAnimationFrame(animFrameId);
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(panelEl);

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(panelEl);
  }

  function updateNodeDOMPositions() {
    if (!tiltWrapEl) return;
    const rect = tiltWrapEl.getBoundingClientRect();
    const radius = Math.min(rect.width, rect.height) * 0.46; // Radius on outer orbit ring

    ['A', 'B', 'K'].forEach((key) => {
      const btn = nodeEls[key];
      if (!btn) return;
      const angle = nodeAngles[key];
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  function getCenterPos(el) {
    if (!el || !panelEl) return { x: 0, y: 0 };
    const pRect = panelEl.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    return {
      x: eRect.left + eRect.width / 2 - pRect.left,
      y: eRect.top + eRect.height / 2 - pRect.top
    };
  }

  function triggerPacket(fromKey, toKey, duration = 800) {
    const fromEl = nodeEls[fromKey];
    const toEl = nodeEls[toKey];
    if (!fromEl || !toEl) return;

    activePackets.push({
      fromKey,
      toKey,
      startTime: performance.now(),
      duration
    });
    isGridAtRest = false;
  }

  function triggerReplay(stepIdx = 0, userInitiated = false) {
    clearTimeout(stepTimer);
    setStep(stepIdx, userInitiated);
  }

  function stepManual(delta) {
    let nextIdx = currentStepIdx + delta;
    if (nextIdx < 0) nextIdx = STEPS.length - 1;
    if (nextIdx >= STEPS.length) nextIdx = 0;
    triggerReplay(nextIdx, true);
  }

  function setStep(idx, userInitiated = false) {
    currentStepIdx = idx;
    const step = STEPS[currentStepIdx];
    stepStartTime = performance.now();

    // Update Step Tag (fixed width)
    if (stepTagEl) {
      stepTagEl.textContent = step.tag;
    }

    // Update Node Active Highlights
    Object.keys(nodeEls).forEach((key) => {
      if (nodeEls[key]) {
        if (step.active.includes(key)) {
          nodeEls[key].classList.add('is-active');
        } else {
          nodeEls[key].classList.remove('is-active');
        }
      }
    });

    // Update Step Control Label for reduced motion
    if (stepControlLabel) {
      stepControlLabel.textContent = `Step ${idx + 1}/${STEPS.length}`;
    }

    // Announce user-initiated step changes via aria-live
    if (userInitiated && liveRegionEl) {
      liveRegionEl.textContent = step.sr;
    }

    // Trigger visual packet effects for step
    if (step.type === 'pulse') {
      triggerPacket(step.from, step.to);
    } else if (step.type === 'relay') {
      triggerPacket('A', 'K', 500);
      setTimeout(() => triggerPacket('K', 'B', 500), 450);
    } else if (step.type === 'commit') {
      triggerPacket('A', 'H', 600);
      triggerPacket('B', 'H', 600);
    }

    // Session Key Footer Update
    updateReadoutFooter(step);

    // Schedule next autonomous step if not reduced motion
    if (!isReducedMotion) {
      const delay = step.id === 'READY' ? 2400 : 1300;
      stepTimer = setTimeout(() => {
        let nextIdx = (currentStepIdx + 1) % STEPS.length;
        setStep(nextIdx, false);
      }, delay);
    }
  }

  function updateReadoutFooter(step) {
    if (!readoutKeyEl || !readoutStatusEl) return;

    if (step.id === 'READY') {
      // Scramble to resolve random 4-hex fingerprint
      // Illustrative fingerprint only - NOT real cryptographic key material
      const hexChars = '0123456789ABCDEF';
      let randomHex = '';
      for (let i = 0; i < 4; i++) {
        randomHex += hexChars[Math.floor(Math.random() * 16)];
      }

      let scrambleCount = 0;
      const scrambleInterval = setInterval(() => {
        scrambleCount++;
        let tempHex = '';
        for (let i = 0; i < 4; i++) {
          tempHex += hexChars[Math.floor(Math.random() * 16)];
        }
        readoutKeyEl.textContent = `•••• •••• ${tempHex}`;

        if (scrambleCount > 6) {
          clearInterval(scrambleInterval);
          readoutKeyEl.textContent = `•••• •••• ${randomHex}`;
          readoutStatusEl.textContent = '✓ ESTABLISHED';
          readoutStatusEl.classList.add('is-flash');
          setTimeout(() => readoutStatusEl.classList.remove('is-flash'), 600);
        }
      }, 40);
    } else {
      // Progressively fill session key dots
      const dotsFilled = '•'.repeat(step.dots);
      const dotsEmpty = '•'.repeat(6 - step.dots);
      readoutKeyEl.textContent = `${dotsFilled}${dotsEmpty} ----`;
      readoutStatusEl.textContent = 'COMPUTING...';
    }
  }

  function startAnimLoop() {
    if (animFrameId) cancelAnimationFrame(animFrameId);

    let lastTime = performance.now();

    function loop(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!isReducedMotion && isVisible) {
        updatePhysics(now, dt);
        renderCanvas();
      }

      animFrameId = requestAnimationFrame(loop);
    }

    animFrameId = requestAnimationFrame(loop);
  }

  function updatePhysics(now, dt) {
    // 1. Oscillate Nodes along outer circle (±12 deg)
    if (!draggingNode) {
      const oscillation = Math.sin(now * 0.0015) * (12 * Math.PI / 180);
      ['A', 'B', 'K'].forEach((key) => {
        nodeAngles[key] = HOME_ANGLES[key] + oscillation;
      });
      updateNodeDOMPositions();
    }

    // 2. Smooth Lerp 3D Tilt
    currentTilt.x += (targetTilt.x - currentTilt.x) * 0.08;
    currentTilt.y += (targetTilt.y - currentTilt.y) * 0.08;

    if (tiltWrapEl) {
      tiltWrapEl.style.transform = `perspective(800px) rotateX(${currentTilt.x.toFixed(2)}deg) rotateY(${currentTilt.y.toFixed(2)}deg)`;
    }

    // 3. Grid Dot Physics & Pointer Proximity
    let activeDisplacement = false;
    gridDots.forEach((dot) => {
      if (pointerPos.active) {
        const dx = dot.x - pointerPos.x;
        const dy = dot.y - pointerPos.y;
        const dist = Math.hypot(dx, dy);
        const maxRadius = 90;

        if (dist < maxRadius && dist > 0) {
          const force = (1 - dist / maxRadius) * 14;
          dot.vx += (dx / dist) * force;
          dot.vy += (dy / dist) * force;
          activeDisplacement = true;
        }
      }

      // Spring return to base position
      const k = 0.12;
      const damp = 0.82;

      dot.vx += (dot.baseX - dot.x) * k;
      dot.vy += (dot.baseY - dot.y) * k;
      dot.vx *= damp;
      dot.vy *= damp;

      dot.x += dot.vx;
      dot.y += dot.vy;

      if (Math.abs(dot.vx) > 0.01 || Math.abs(dot.vy) > 0.01) {
        activeDisplacement = true;
      }
    });

    if (activeDisplacement || activePackets.length > 0 || pointerPos.active) {
      isGridAtRest = false;
    } else {
      isGridAtRest = true;
    }
  }

  function renderCanvas() {
    if (!ctx || !canvasEl || isGridAtRest) return;

    const width = canvasEl.width / dpr;
    const height = canvasEl.height / dpr;

    ctx.clearRect(0, 0, width, height);

    // Draw Grid Dots
    ctx.fillStyle = '#f4f4f0';
    gridDots.forEach((dot) => {
      ctx.globalAlpha = dot.alpha;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Render Active Packets
    const now = performance.now();
    activePackets = activePackets.filter((packet) => {
      const elapsed = now - packet.startTime;
      const progress = Math.min(elapsed / packet.duration, 1.0);

      const p1 = getCenterPos(nodeEls[packet.fromKey]);
      const p2 = getCenterPos(nodeEls[packet.toKey]);

      const curX = p1.x + (p2.x - p1.x) * progress;
      const curY = p1.y + (p2.y - p1.y) * progress;

      // Draw Packet Line
      ctx.strokeStyle = 'rgba(244, 244, 240, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // Draw Traveling Glow Packet
      ctx.fillStyle = '#f4f4f0';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(curX, curY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      return progress < 1.0;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
