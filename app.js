document.addEventListener('DOMContentLoaded', () => {
  
  let audioCtx = null;
  let soundEnabled = false;

  const initAudio = () => {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  };

  const playClickSound = () => {
    if (!soundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch (e) {
    }
  };

  const playSwooshSound = () => {
    if (!soundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    } catch (e) {
    }
  };

  const soundToggleBtn = document.getElementById('soundToggle');
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      initAudio();
      soundEnabled = !soundEnabled;
      const icon = soundToggleBtn.querySelector('i');
      const tooltip = soundToggleBtn.querySelector('.btn-tooltip');
      if (soundEnabled) {
        icon.className = 'fa-solid fa-volume-high';
        soundToggleBtn.style.borderColor = 'var(--accent-mint)';
        soundToggleBtn.style.color = 'var(--accent-mint)';
        if (tooltip) tooltip.innerText = 'SOUND: ON';
        playClickSound();
      } else {
        icon.className = 'fa-solid fa-volume-xmark';
        soundToggleBtn.style.borderColor = '';
        soundToggleBtn.style.color = '';
        if (tooltip) tooltip.innerText = 'SOUND: OFF';
      }
    });
  }

  
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const carousel = document.querySelector('.carousel');
  const items = carousel ? carousel.querySelectorAll('.list .item') : [];
  const indicator = carousel ? carousel.querySelector('.indicators') : null;
  const dots = indicator ? indicator.querySelectorAll('ul li') : [];
  const numberDisplay = indicator ? indicator.querySelector('.number') : null;

  let activeIndex = 0;
  const totalSlides = items.length;
  let autoPlayTimer;

  const startAutoPlay = () => {
    clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(() => {
      if (nextBtn) nextBtn.click();
    }, 6000);
  };

  const setSlider = (direction = 1) => {
    if (!items.length) return;

    items.forEach((item) => {
      item.classList.remove('active');
      item.classList.remove('activeOld');
    });

    items[activeIndex].classList.add('active');

    dots.forEach((dot) => dot.classList.remove('active'));
    if (dots[activeIndex]) {
      dots[activeIndex].classList.add('active');
    }

    if (numberDisplay) {
      numberDisplay.innerText = '0' + (activeIndex + 1);
    }

    playSwooshSound();
    startAutoPlay();
  };

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      playClickSound();
      carousel.style.setProperty('--calculation', '1');
      activeIndex = activeIndex + 1 >= totalSlides ? 0 : activeIndex + 1;
      setSlider(1);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      playClickSound();
      carousel.style.setProperty('--calculation', '-1');
      activeIndex = activeIndex - 1 < 0 ? totalSlides - 1 : activeIndex - 1;
      setSlider(-1);
    });
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      playClickSound();
      const dir = idx > activeIndex ? 1 : -1;
      carousel.style.setProperty('--calculation', dir.toString());
      activeIndex = idx;
      setSlider(dir);
    });
  });

  if (carousel) {
    carousel.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
    carousel.addEventListener('mouseleave', () => startAutoPlay());
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' && nextBtn) nextBtn.click();
    if (e.key === 'ArrowLeft' && prevBtn) prevBtn.click();
  });

  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  if (carousel) {
    carousel.addEventListener(
      'touchstart',
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      },
      { passive: true }
    );

    carousel.addEventListener(
      'touchend',
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
          if (diffX < 0) {
            if (nextBtn) nextBtn.click();
          } else {
            if (prevBtn) prevBtn.click();
          }
        }
      },
      { passive: true }
    );
  }

  if (carousel) {
    carousel.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 768) return;
      const activeShoe = carousel.querySelector('.item.active figure img');
      if (!activeShoe) return;
      const rect = carousel.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      activeShoe.style.transform = `rotate(${-22 + x * 10}deg) translateY(${y * -15}px) scale(1.02)`;
    });

    carousel.addEventListener('mouseleave', () => {
      const activeShoe = carousel.querySelector('.item.active figure img');
      if (activeShoe && window.innerWidth > 768) {
        activeShoe.style.transform = 'rotate(-22deg) scale(1)';
      }
    });
  }

  setSlider();

  const heroSizeBtns = document.querySelectorAll('.hero-specs-row ~ .size-picker .size-btn');
  heroSizeBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      playClickSound();
      const parent = e.target.closest('.size-options');
      parent.querySelectorAll('.size-btn').forEach((b) => b.classList.remove('active'));
      e.target.classList.add('active');
    });
  });

  
  const mainHeader = document.getElementById('mainHeader');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const closeMobileNav = document.getElementById('closeMobileNav');
  const mobileNavOverlay = document.getElementById('mobileNavOverlay');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  const openMobileMenu = () => {
    playClickSound();
    if (mobileNavDrawer) mobileNavDrawer.classList.add('active');
    if (mobileNavOverlay) mobileNavOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeMobileMenu = () => {
    playClickSound();
    if (mobileNavDrawer) mobileNavDrawer.classList.remove('active');
    if (mobileNavOverlay) mobileNavOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileMenu);
  if (closeMobileNav) closeMobileNav.addEventListener('click', closeMobileMenu);
  if (mobileNavOverlay) mobileNavOverlay.addEventListener('click', closeMobileMenu);

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      mainHeader.classList.add('scrolled');
    } else {
      mainHeader.classList.remove('scrolled');
    }
  });

  
  let cart = JSON.parse(localStorage.getItem('nike_cyber_cart') || '[]');
  const cartBtn = document.getElementById('cartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const closeCartBtn = document.getElementById('closeCart');
  const cartCountBadge = document.getElementById('cartCountBadge');
  const cartDrawerItemCount = document.getElementById('cartDrawerItemCount');
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const cartSubtotalEl = document.getElementById('cartSubtotal');
  const cartDiscountEl = document.getElementById('cartDiscount');
  const discountRow = document.getElementById('discountRow');
  const cartShippingEl = document.getElementById('cartShipping');
  const cartFinalTotalEl = document.getElementById('cartFinalTotal');
  const shippingMeterText = document.getElementById('shippingMeterText');
  const shippingMeterFill = document.getElementById('shippingMeterFill');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const promoInput = document.getElementById('promoInput');
  const applyPromoBtn = document.getElementById('applyPromoBtn');
  const promoNotice = document.getElementById('promoNotice');

  let appliedDiscount = 0;

  const saveCart = () => {
    localStorage.setItem('nike_cyber_cart', JSON.stringify(cart));
  };

  const openCart = () => {
    playClickSound();
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeCart = () => {
    playClickSound();
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  const updateCartUI = () => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountBadge) {
      cartCountBadge.innerText = totalItems;
      cartCountBadge.style.transform = 'scale(1.3)';
      setTimeout(() => (cartCountBadge.style.transform = 'scale(1)'), 250);
    }
    if (cartDrawerItemCount) cartDrawerItemCount.innerText = totalItems;

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="empty-cart-state">
          <i class="fa-solid fa-box-open"></i>
          <h4>DEPLOYMENT BAG IS EMPTY</h4>
          <p>No high-velocity silhouettes queued. Explore the archive below.</p>
        </div>
      `;
      if (cartSubtotalEl) cartSubtotalEl.innerText = '$0.00';
      if (discountRow) discountRow.style.display = 'none';
      if (cartShippingEl) cartShippingEl.innerText = 'FREE';
      if (cartFinalTotalEl) cartFinalTotalEl.innerText = '$0.00';
      if (shippingMeterFill) shippingMeterFill.style.width = '0%';
      if (shippingMeterText) {
        shippingMeterText.innerHTML = 'Add <strong>$150.00</strong> more for Free Worldwide Express Delivery';
      }
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    if (checkoutBtn) checkoutBtn.disabled = false;

    cartItemsContainer.innerHTML = cart
      .map(
        (item, index) => `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.name}" class="cart-item-img" />
        <div class="cart-item-info">
          <h4 class="cart-item-title">${item.name}</h4>
          <div class="cart-item-meta">SIZE: US ${item.size} &bull; ${item.color || 'EDITION'}</div>
          <div class="cart-item-controls">
            <div class="cart-qty-wrap">
              <button class="cart-qty-btn" onclick="window.changeCartQty(${index}, -1)"><i class="fa-solid fa-minus"></i></button>
              <span>${item.quantity}</span>
              <button class="cart-qty-btn" onclick="window.changeCartQty(${index}, 1)"><i class="fa-solid fa-plus"></i></button>
            </div>
            <span class="cart-item-price">$${item.price * item.quantity}</span>
          </div>
        </div>
        <button class="cart-remove-btn" onclick="window.removeCartItem(${index})" title="Remove"><i class="fa-solid fa-trash-can"></i></button>
      </div>
    `
      )
      .join('');

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = subtotal * appliedDiscount;
    const shipping = subtotal >= 150 ? 0 : 25;
    const finalTotal = subtotal - discountAmount + shipping;

    if (cartSubtotalEl) cartSubtotalEl.innerText = `$${subtotal.toFixed(2)}`;
    if (appliedDiscount > 0) {
      if (discountRow) discountRow.style.display = 'flex';
      if (cartDiscountEl) cartDiscountEl.innerText = `-$${discountAmount.toFixed(2)}`;
    } else {
      if (discountRow) discountRow.style.display = 'none';
    }

    if (cartShippingEl) {
      cartShippingEl.innerText = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    }
    if (cartFinalTotalEl) cartFinalTotalEl.innerText = `$${finalTotal.toFixed(2)}`;

    const freeShippingThreshold = 150;
    const percent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
    if (shippingMeterFill) shippingMeterFill.style.width = `${percent}%`;

    if (shippingMeterText) {
      if (subtotal >= freeShippingThreshold) {
        shippingMeterText.innerHTML = '<span style="color:var(--accent-mint)"><i class="fa-solid fa-check"></i> Free Express Freight Unlocked!</span>';
      } else {
        const remaining = (freeShippingThreshold - subtotal).toFixed(2);
        shippingMeterText.innerHTML = `Add <strong>$${remaining}</strong> more for Free Worldwide Express Delivery`;
      }
    }
  };

  window.changeCartQty = (index, delta) => {
    playClickSound();
    if (cart[index]) {
      cart[index].quantity += delta;
      if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
      }
      saveCart();
      updateCartUI();
    }
  };

  window.removeCartItem = (index) => {
    playClickSound();
    if (cart[index]) {
      cart.splice(index, 1);
      saveCart();
      updateCartUI();
    }
  };

  const addToCart = (product) => {
    playClickSound();
    const existingIndex = cart.findIndex(
      (item) => item.id === product.id && item.size === product.size
    );
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        img: product.img,
        size: product.size || '9',
        color: product.color || 'Standard',
        quantity: 1,
      });
    }
    saveCart();
    updateCartUI();
    openCart();
  };

  if (applyPromoBtn && promoInput) {
    applyPromoBtn.addEventListener('click', () => {
      playClickSound();
      const code = promoInput.value.trim().toUpperCase();
      if (code === 'CYBER20') {
        appliedDiscount = 0.2;
        promoNotice.style.color = 'var(--accent-mint)';
        promoNotice.innerText = '✓ CODE APPLIED: 20% DISCOUNT ACTIVATED';
      } else if (code === 'JUSTDOIT') {
        appliedDiscount = 0.15;
        promoNotice.style.color = 'var(--accent-mint)';
        promoNotice.innerText = '✓ CODE APPLIED: 15% VIP DISCOUNT ACTIVATED';
      } else {
        promoNotice.style.color = 'var(--accent-crimson)';
        promoNotice.innerText = '✗ INVALID PROTOCOL CODE. TRY "CYBER20"';
      }
      updateCartUI();
    });
  }

  document.querySelectorAll('.add-to-cart-hero').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const itemEl = e.target.closest('.item');
      if (!itemEl) return;
      const id = itemEl.getAttribute('data-id');
      const name = itemEl.getAttribute('data-name');
      const price = itemEl.getAttribute('data-price');
      const img = itemEl.getAttribute('data-img');
      const color = itemEl.getAttribute('data-color');
      const activeSizeBtn = itemEl.querySelector('.size-btn.active');
      const size = activeSizeBtn ? activeSizeBtn.getAttribute('data-size') : '9';

      addToCart({ id, name, price, img, color, size });
    });
  });

  updateCartUI();

  
  const telemetryData = {
    upper: {
      code: 'NODE: 01 // UPPER MATRIX',
      title: 'VAPORWEAVE AERO-TENSILE MESH',
      desc: 'Micro-woven monofilament weave that sheds 30% more weight while maintaining hydrophobic resistance against precipitation and thermal energy buildup during sustained exertion.',
      bars: [
        { label: 'AERODYNAMIC EFFICIENCY', val: '94.8%' },
        { label: 'ENERGY REBOUND VELOCITY', val: '89.2%' },
        { label: 'MOLECULAR TENSILE LOCK', val: '98.5%' },
      ],
      specs: { thickness: '0.85 MM', weight: '48.2 GRAMS', latency: '0.003 SEC' },
    },
    plate: {
      code: 'NODE: 02 // CARBON FLYPLATE',
      title: 'FULL-LENGTH KINETIC CARBON PLATE',
      desc: 'S-curved aerospace-grade carbon fiber composite tuned to deliver dynamic propulsive snapback upon forefoot transition, minimizing metatarsal joint fatigue.',
      bars: [
        { label: 'AERODYNAMIC EFFICIENCY', val: '98.2%' },
        { label: 'ENERGY REBOUND VELOCITY', val: '96.5%' },
        { label: 'MOLECULAR TENSILE LOCK', val: '99.9%' },
      ],
      specs: { thickness: '1.20 MM', weight: '36.5 GRAMS', latency: '0.001 SEC' },
    },
    cushion: {
      code: 'NODE: 03 // ZOOMX AIR PODS',
      title: 'DUAL-ZONE PRESSURE AIR MATRIX',
      desc: 'Hermetically sealed nitrogen-pressurized pods coupled with ultralight Pebax ZoomX foam, producing unmatched vertical impact absorption.',
      bars: [
        { label: 'AERODYNAMIC EFFICIENCY', val: '88.0%' },
        { label: 'ENERGY REBOUND VELOCITY', val: '99.4%' },
        { label: 'MOLECULAR TENSILE LOCK', val: '92.3%' },
      ],
      specs: { thickness: '38.0 MM', weight: '62.0 GRAMS', latency: '0.002 SEC' },
    },
    outsole: {
      code: 'NODE: 04 // CYBER LUGS',
      title: 'GENERATIVE WAFFLE CYBER-TRACTION',
      desc: 'Algorithmic micro-lug tread pattern mapped against multi-million stride velocity pressure tests for razor-sharp asphalt grip under wet cornering conditions.',
      bars: [
        { label: 'AERODYNAMIC EFFICIENCY', val: '91.5%' },
        { label: 'ENERGY REBOUND VELOCITY', val: '86.0%' },
        { label: 'MOLECULAR TENSILE LOCK', val: '97.8%' },
      ],
      specs: { thickness: '2.50 MM', weight: '35.5 GRAMS', latency: '0.004 SEC' },
    },
  };

  const hotspots = document.querySelectorAll('.hotspot');
  const telemetryCode = document.getElementById('telemetryCode');
  const telemetryTitle = document.getElementById('telemetryTitle');
  const telemetryDesc = document.getElementById('telemetryDesc');
  const metric1Val = document.getElementById('metric1Val');
  const metric1Bar = document.getElementById('metric1Bar');
  const metric2Val = document.getElementById('metric2Val');
  const metric2Bar = document.getElementById('metric2Bar');
  const metric3Val = document.getElementById('metric3Val');
  const metric3Bar = document.getElementById('metric3Bar');
  const telemetryFooterSpecs = document.querySelector('.telemetry-footer-specs');

  hotspots.forEach((spot) => {
    spot.addEventListener('click', () => {
      playClickSound();
      hotspots.forEach((s) => s.classList.remove('active'));
      spot.classList.add('active');

      const key = spot.getAttribute('data-spot');
      const data = telemetryData[key];
      if (!data) return;

      if (telemetryCode) telemetryCode.innerText = data.code;
      if (telemetryTitle) telemetryTitle.innerText = data.title;
      if (telemetryDesc) telemetryDesc.innerText = data.desc;

      if (metric1Val) metric1Val.innerText = data.bars[0].val;
      if (metric1Bar) metric1Bar.style.width = data.bars[0].val;
      if (metric2Val) metric2Val.innerText = data.bars[1].val;
      if (metric2Bar) metric2Bar.style.width = data.bars[1].val;
      if (metric3Val) metric3Val.innerText = data.bars[2].val;
      if (metric3Bar) metric3Bar.style.width = data.bars[2].val;

      if (telemetryFooterSpecs) {
        telemetryFooterSpecs.innerHTML = `
          <div><span>THICKNESS</span><strong>${data.specs.thickness}</strong></div>
          <div><span>WEIGHT PROFILE</span><strong>${data.specs.weight}</strong></div>
          <div><span>LATENCY ABSORPTION</span><strong>${data.specs.latency}</strong></div>
        `;
      }
    });
  });

  
  const filterTabs = document.querySelectorAll('.filter-tab');
  const productCards = document.querySelectorAll('.product-card');
  const catalogSort = document.getElementById('catalogSort');
  const productsGrid = document.getElementById('productsGrid');

  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      playClickSound();
      filterTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const cat = tab.getAttribute('data-category');
      productCards.forEach((card) => {
        const cardCat = card.getAttribute('data-category');
        if (cat === 'all' || cardCat === cat) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  if (catalogSort && productsGrid) {
    catalogSort.addEventListener('change', () => {
      playClickSound();
      const sortVal = catalogSort.value;
      const cardsArray = Array.from(productCards);

      cardsArray.sort((a, b) => {
        const priceA = parseFloat(a.getAttribute('data-price'));
        const priceB = parseFloat(b.getAttribute('data-price'));
        const weightA = parseFloat(a.getAttribute('data-weight'));
        const weightB = parseFloat(b.getAttribute('data-weight'));

        if (sortVal === 'price-asc') return priceA - priceB;
        if (sortVal === 'price-desc') return priceB - priceA;
        if (sortVal === 'weight') return weightA - weightB;
        return 0;
      });

      cardsArray.forEach((card) => productsGrid.appendChild(card));
    });
  }

  document.querySelectorAll('.card-sizes .sz').forEach((szBtn) => {
    szBtn.addEventListener('click', (e) => {
      playClickSound();
      const parent = e.target.closest('.card-sizes');
      parent.querySelectorAll('.sz').forEach((s) => s.classList.remove('active'));
      e.target.classList.add('active');
    });
  });

  document.querySelectorAll('.wishlist-btn').forEach((wBtn) => {
    wBtn.addEventListener('click', (e) => {
      playClickSound();
      const icon = wBtn.querySelector('i');
      wBtn.classList.toggle('active');
      if (wBtn.classList.contains('active')) {
        icon.className = 'fa-solid fa-heart';
      } else {
        icon.className = 'fa-regular fa-heart';
      }
    });
  });

  document.querySelectorAll('.catalog-add-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      if (!card) return;
      const id = card.getAttribute('data-id');
      const name = card.querySelector('.product-name').innerText;
      const price = card.getAttribute('data-price');
      const img = card.querySelector('.card-img').getAttribute('src');
      const activeSize = card.querySelector('.card-sizes .sz.active');
      const size = activeSize ? activeSize.getAttribute('data-size') : '9';

      addToCart({ id, name, price, img, size });
    });
  });

  
  const customizerShoe = document.getElementById('customizerShoe');
  const customizerGlow = document.getElementById('customizerGlow');
  const labLightBeam = document.getElementById('labLightBeam');
  const hudPresetCode = document.getElementById('hudPresetCode');
  const presetBtns = document.querySelectorAll('.preset-btn');
  const chassisPills = document.querySelectorAll('.chassis-pill');
  const addCustomShoeBtn = document.getElementById('addCustomShoeBtn');

  let activePresetName = 'CYBER MINT';
  let activeChassisImg = 'images/3.png';

  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      playClickSound();
      presetBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      const color = btn.getAttribute('data-color');
      const name = btn.getAttribute('data-name');
      activePresetName = name;

      if (customizerShoe) customizerShoe.style.filter = filter;
      if (customizerGlow) {
        customizerGlow.style.background = `radial-gradient(circle, ${color}55 0%, transparent 65%)`;
      }
      if (labLightBeam) {
        labLightBeam.style.background = `radial-gradient(ellipse at top, ${color}33 0%, transparent 70%)`;
      }
      if (hudPresetCode) {
        hudPresetCode.innerText = `CONFIG: // ${name} [ACTIVE]`;
      }
    });
  });

  chassisPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      playClickSound();
      chassisPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');

      const shoeImg = pill.getAttribute('data-shoe');
      activeChassisImg = shoeImg;
      if (customizerShoe) {
        customizerShoe.style.opacity = '0';
        setTimeout(() => {
          customizerShoe.src = shoeImg;
          customizerShoe.style.opacity = '1';
        }, 200);
      }
    });
  });

  if (addCustomShoeBtn) {
    addCustomShoeBtn.addEventListener('click', () => {
      addToCart({
        id: 'bespoke-' + Date.now(),
        name: `NIKE BESPOKE LAB // ${activePresetName}`,
        price: 270,
        img: activeChassisImg,
        color: activePresetName,
        size: '10',
      });
    });
  }

  
  const quickViewModal = document.getElementById('quickViewModal');
  const closeQuickModal = document.getElementById('closeQuickModal');
  const modalShoeImg = document.getElementById('modalShoeImg');
  const rotateSlider = document.getElementById('rotateSlider');
  const modalTitle = document.getElementById('modalTitle');
  const modalPrice = document.getElementById('modalPrice');
  const modalDesc = document.getElementById('modalDesc');
  const modalWeight = document.getElementById('modalWeight');
  const modalAddToCartBtn = document.getElementById('modalAddToCartBtn');

  let currentModalProduct = null;

  const openQuickModal = (data) => {
    playClickSound();
    currentModalProduct = data;
    if (modalShoeImg) modalShoeImg.src = data.img;
    if (modalTitle) modalTitle.innerText = data.name;
    if (modalPrice) modalPrice.innerText = `$${data.price} USD`;
    if (modalDesc) modalDesc.innerText = data.desc || 'High-performance concept silhouette engineered for maximum athletic output.';
    if (modalWeight) modalWeight.innerText = `${data.weight || '185'} Grams (Size 9)`;
    if (rotateSlider) rotateSlider.value = -20;
    if (modalShoeImg) modalShoeImg.style.transform = 'rotate(-20deg)';

    quickViewModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeQuickView = () => {
    playClickSound();
    quickViewModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (closeQuickModal) closeQuickModal.addEventListener('click', closeQuickView);
  if (quickViewModal) {
    quickViewModal.addEventListener('click', (e) => {
      if (e.target === quickViewModal) closeQuickView();
    });
  }

  if (rotateSlider && modalShoeImg) {
    rotateSlider.addEventListener('input', (e) => {
      const angle = e.target.value;
      modalShoeImg.style.transform = `rotate(${angle}deg) scale(${1 + Math.abs(angle) / 100})`;
    });
  }

  document.querySelectorAll('#modalSizesContainer .msz').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      playClickSound();
      document.querySelectorAll('#modalSizesContainer .msz').forEach((b) => b.classList.remove('active'));
      e.target.classList.add('active');
    });
  });

  if (modalAddToCartBtn) {
    modalAddToCartBtn.addEventListener('click', () => {
      if (!currentModalProduct) return;
      const activeSize = document.querySelector('#modalSizesContainer .msz.active');
      const size = activeSize ? activeSize.getAttribute('data-size') : '9';
      addToCart({
        ...currentModalProduct,
        size,
      });
      closeQuickView();
    });
  }

  document.querySelectorAll('.inspect-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const itemEl = e.target.closest('.item');
      if (!itemEl) return;
      openQuickModal({
        id: itemEl.getAttribute('data-id'),
        name: itemEl.getAttribute('data-name'),
        price: itemEl.getAttribute('data-price'),
        img: itemEl.getAttribute('data-img'),
        desc: itemEl.querySelector('.description').innerText,
        weight: '182',
      });
    });
  });

  document.querySelectorAll('.quick-view-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      if (!card) return;
      openQuickModal({
        id: card.getAttribute('data-id'),
        name: card.querySelector('.product-name').innerText,
        price: card.getAttribute('data-price'),
        img: card.querySelector('.card-img').getAttribute('src'),
        desc: card.querySelector('.product-desc').innerText,
        weight: card.getAttribute('data-weight') || '195',
      });
    });
  });

  
  const searchToggle = document.getElementById('searchToggle');
  const searchModal = document.getElementById('searchModal');
  const closeSearch = document.getElementById('closeSearch');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  const productsDatabase = [
    { id: 'p1', name: 'NIKE D.01 PHANTOM MINT', cat: 'ROAD RACING', price: 220, img: 'images/3.png', weight: '182' },
    { id: 'p2', name: 'NIKE D.02 NEBULA SPEED', cat: 'TRACK PLATFORM', price: 245, img: 'images/2.png', weight: '196' },
    { id: 'p3', name: 'NIKE D.03 OBSIDIAN CORE', cat: 'CYBER TECHWEAR', price: 260, img: 'images/1.png', weight: '210' },
    { id: 'p4', name: 'NIKE AIR MAX CYBERPULSE', cat: 'QUANTUM AIR', price: 290, img: 'images/4.jpg', weight: '205' },
    { id: 'p5', name: 'NIKE APEX CRIMSON STRIKE', cat: 'TRAIL RACER', price: 280, img: 'images/5.jpg', weight: '215' },
    { id: 'p6', name: 'NIKE ZOOMX HYPERVOLT', cat: 'MARATHON RACING', price: 250, img: 'images/6.jpg', weight: '186' },
    { id: 'p7', name: 'NIKE FUTURE RUN GLACIER', cat: 'GLACIER EDITION', price: 295, img: 'images/7.jpg', weight: '198' },
    { id: 'p8', name: 'NIKE REACT STEALTH TRAIL', cat: 'OFF-GRID CYBER', price: 270, img: 'images/8.jpg', weight: '218' },
    { id: 'p9', name: 'VELOCITY GOLD CHAMPIONSHIP', cat: 'OLYMPIC RECORD', price: 310, img: 'images/9.jpg', weight: '178' },
    { id: 'p10', name: 'HYPERCYBER REACT HIGH-TOP', cat: 'CYBER STREETWEAR', price: 320, img: 'images/10.jpg', weight: '225' },
  ];

  const openSearch = () => {
    playClickSound();
    searchModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => searchInput && searchInput.focus(), 100);
    renderSearchResults(productsDatabase);
  };

  const closeSearchModal = () => {
    playClickSound();
    searchModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  const renderSearchResults = (items) => {
    if (!searchResults) return;
    if (items.length === 0) {
      searchResults.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted); font-family:var(--font-tech);">NO SILHOUETTES MATCHING YOUR QUERY</div>`;
      return;
    }
    searchResults.innerHTML = items
      .map(
        (item) => `
      <div class="search-result-item" onclick="window.quickAddFromSearch('${item.id}')">
        <div class="search-result-left">
          <img src="${item.img}" alt="${item.name}" />
          <div>
            <div class="search-result-name">${item.name}</div>
            <div class="search-result-cat">${item.cat}</div>
          </div>
        </div>
        <div style="font-family:var(--font-tech); font-weight:700; color:var(--accent-mint);">$${item.price} USD</div>
      </div>
    `
      )
      .join('');
  };

  window.quickAddFromSearch = (id) => {
    const item = productsDatabase.find((p) => p.id === id);
    if (item) {
      addToCart(item);
      closeSearchModal();
    }
  };

  if (searchToggle) searchToggle.addEventListener('click', openSearch);
  if (closeSearch) closeSearch.addEventListener('click', closeSearchModal);
  if (searchModal) {
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearchModal();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        renderSearchResults(productsDatabase);
        return;
      }
      const filtered = productsDatabase.filter(
        (p) => p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q)
      );
      renderSearchResults(filtered);
    });
  }

  
  const checkoutSuccessModal = document.getElementById('checkoutSuccessModal');
  const closeSuccessModal = document.getElementById('closeSuccessModal');
  const finishOrderBtn = document.getElementById('finishOrderBtn');
  const trackingKeyBox = document.getElementById('trackingKeyBox');

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      playClickSound();
      closeCart();

      const randHex = Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .toUpperCase()
        .padStart(6, '0');
      if (trackingKeyBox) {
        trackingKeyBox.innerText = `NK-2026-X${randHex}-PDX`;
      }

      cart = [];
      saveCart();
      updateCartUI();

      setTimeout(() => {
        checkoutSuccessModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }, 300);
    });
  }

  const closeSuccess = () => {
    playClickSound();
    checkoutSuccessModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (closeSuccessModal) closeSuccessModal.addEventListener('click', closeSuccess);
  if (finishOrderBtn) finishOrderBtn.addEventListener('click', closeSuccess);

  
  const newsletterForm = document.getElementById('newsletterForm');
  const formFeedback = document.getElementById('formFeedback');
  const newsletterEmail = document.getElementById('newsletterEmail');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      playClickSound();
      const email = newsletterEmail ? newsletterEmail.value : '';
      if (formFeedback) {
        formFeedback.style.color = 'var(--accent-mint)';
        formFeedback.innerHTML = `<i class="fa-solid fa-check"></i> TRANSMISSION CONFIRMED: ${email} ENCRYPTED & QUEUED FOR ALPHA DROPS.`;
      }
      if (newsletterEmail) newsletterEmail.value = '';
    });
  }
});
