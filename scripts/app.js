(() => {
    const header = document.getElementById('siteHeader');
    const sentinel = document.getElementById('headerSentinel');
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const main = document.getElementById('conteudo');
    const footer = document.getElementById('siteFooter');
    const floatingCta = document.getElementById('floatingCta');
    const mobileCta = document.getElementById('mobileCta');
    const persistentCtas = [floatingCta, mobileCta].filter(Boolean);
    const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canObserve = 'IntersectionObserver' in window;
    const WHATSAPP_NUMBER = '5591993333032';
    const DEFAULT_WHATSAPP_MESSAGE = 'Olá, NOVE! Vim pelo site e gostaria de entender qual solução faz mais sentido para o meu espaço.';
    let lastFocus = null;

    function whatsappUrl(message) {
      return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    }

    const briefingLayout = document.createElement('style');
    briefingLayout.textContent = '@media (min-width:821px){.brief-form{grid-template-columns:repeat(5,1fr)}}';
    document.head.appendChild(briefingLayout);

    persistentCtas.forEach(el => el.classList.add('is-visible'));
    if (floatingCta) {
      floatingCta.href = whatsappUrl(DEFAULT_WHATSAPP_MESSAGE);
      floatingCta.target = '_blank';
      floatingCta.rel = 'noopener';
      floatingCta.innerHTML = '<i aria-hidden="true"></i> Falar no WhatsApp';
      floatingCta.setAttribute('aria-label', 'Falar com a NOVE pelo WhatsApp');
    }
    if (mobileCta) {
      mobileCta.href = whatsappUrl(DEFAULT_WHATSAPP_MESSAGE);
      mobileCta.target = '_blank';
      mobileCta.rel = 'noopener';
      mobileCta.innerHTML = '<span>Falar no WhatsApp</span><span class="arrow-mark" aria-hidden="true"></span>';
      mobileCta.setAttribute('aria-label', 'Falar com a NOVE pelo WhatsApp');
    }

    if (canObserve) {
      const headerObserver = new IntersectionObserver(([entry]) => {
        header.classList.toggle('scrolled', !entry.isIntersecting);
      }, { threshold: 0 });
      headerObserver.observe(sentinel);
    } else {
      header.classList.add('scrolled');
    }

    function focusables(container) {
      return [...container.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')];
    }

    function toggleMenu(force, instant = false) {
      const open = typeof force === 'boolean' ? force : !mobileMenu.classList.contains('open');
      if (instant) mobileMenu.classList.add('instant');
      if (open) lastFocus = document.activeElement;
      mobileMenu.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      mobileMenu.setAttribute('aria-hidden', String(!open));
      main.toggleAttribute('inert', open);
      footer.toggleAttribute('inert', open);
      if (open) {
        const first = focusables(mobileMenu)[0];
        if (first) first.focus({ preventScroll: true });
      } else if (lastFocus && typeof lastFocus.focus === 'function') {
        lastFocus.focus({ preventScroll: true });
      }
      if (instant) requestAnimationFrame(() => mobileMenu.classList.remove('instant'));
    }

    menuBtn.addEventListener('click', (event) => toggleMenu(undefined, event.detail === 0));
    mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => toggleMenu(false)));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && mobileMenu.classList.contains('open')) toggleMenu(false, true);
      if (event.key === 'Tab' && mobileMenu.classList.contains('open')) {
        const items = focusables(mobileMenu);
        if (!items.length) return;
        const first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });

    const introLines = [...document.querySelectorAll('.intro-title span')];
    if (prefersReduced || !canObserve) {
      introLines.forEach(line => line.classList.add('in'));
    } else {
      const introObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const lines = [...entry.target.querySelectorAll('span')];
          lines.forEach((line, index) => setTimeout(() => line.classList.add('in'), index * 70));
          introObserver.unobserve(entry.target);
        });
      }, { threshold: .28, rootMargin: '0px 0px -8% 0px' });
      const title = document.getElementById('introTitle');
      introObserver.observe(title);
    }

    const manifestoWords = [...document.querySelectorAll('.manifesto-word')];
    if (canObserve && !prefersReduced) {
      const manifestoObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => entry.target.classList.toggle('on', entry.isIntersecting));
      }, { threshold: .64, rootMargin: '-10% 0px -10% 0px' });
      manifestoWords.forEach(word => manifestoObserver.observe(word));
    } else {
      manifestoWords.forEach(word => word.classList.add('on'));
    }

    const tabs = [...document.querySelectorAll('.solution-row')];
    const panel = document.getElementById('solutionPanel');
    const svImage = document.getElementById('svImage');
    const svTitle = document.getElementById('svTitle');
    const svLabel = document.getElementById('svLabel');

    function activateTab(tab, moveFocus = false) {
      tabs.forEach(item => item.setAttribute('aria-selected', String(item === tab)));
      panel.setAttribute('aria-labelledby', tab.id);
      svTitle.textContent = tab.dataset.title;
      svLabel.textContent = tab.dataset.label;
      svImage.classList.add('is-changing');
      svImage.src = tab.dataset.src;
      svImage.alt = tab.dataset.alt;
      const finish = () => svImage.classList.remove('is-changing');
      if (svImage.complete) setTimeout(finish, 40); else svImage.addEventListener('load', finish, { once: true });
      if (moveFocus) tab.focus();
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activateTab(tab));
      tab.addEventListener('mouseenter', () => {
        if (matchMedia('(hover:hover) and (pointer:fine)').matches) activateTab(tab);
      });
      tab.addEventListener('keydown', event => {
        const keys = ['ArrowDown','ArrowRight','ArrowUp','ArrowLeft','Home','End'];
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        activateTab(tabs[next], true);
      });
    });

    const box = document.getElementById('compareBox');
    const after = document.getElementById('surfaceAfter');
    const line = document.getElementById('compareLine');
    const handle = document.getElementById('compareHandle');
    let dragging = false;
    let pct = 52;

    function setCompare(next) {
      pct = Math.max(4, Math.min(96, next));
      after.style.clipPath = `inset(0 0 0 ${pct}%)`;
      line.style.left = pct + '%';
      handle.style.left = pct + '%';
      box.setAttribute('aria-valuenow', String(Math.round(pct)));
      box.setAttribute('aria-valuetext', `${Math.round(100 - pct)} por cento da superfície revelada`);
    }
    function fromX(x) {
      const rect = box.getBoundingClientRect();
      setCompare((x - rect.left) / rect.width * 100);
    }
    box.addEventListener('pointerdown', event => { dragging = true; box.setPointerCapture(event.pointerId); fromX(event.clientX); });
    box.addEventListener('pointermove', event => { if (dragging) fromX(event.clientX); });
    box.addEventListener('pointerup', () => { dragging = false; });
    box.addEventListener('pointercancel', () => { dragging = false; });
    box.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); setCompare(pct - 3); }
      if (event.key === 'ArrowRight') { event.preventDefault(); setCompare(pct + 3); }
      if (event.key === 'Home') { event.preventDefault(); setCompare(4); }
      if (event.key === 'End') { event.preventDefault(); setCompare(96); }
    });
    setCompare(52);

    const arenaSteps = [...document.querySelectorAll('.arena-step')];
    if (canObserve && !prefersReduced) {
      const arenaObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { entry.target.classList.add('seen'); arenaObserver.unobserve(entry.target); }
        });
      }, { threshold: .42 });
      arenaSteps.forEach(step => arenaObserver.observe(step));
    } else {
      arenaSteps.forEach(step => step.classList.add('seen'));
    }

    const focusBrief = document.getElementById('focusBrief');
    const form = document.getElementById('briefForm');
    const status = document.getElementById('contactStatus');

    if (form && !document.getElementById('uso')) {
      const submitField = form.querySelector('.brief-submit')?.closest('.field');
      const useField = document.createElement('div');
      useField.className = 'field';
      useField.innerHTML = '<label for="uso">Uso do espaço</label><input id="uso" name="uso" placeholder="Ex.: lazer com crianças e pets" autocomplete="off" />';
      if (submitField) form.insertBefore(useField, submitField);
    }

    focusBrief.addEventListener('click', () => document.getElementById('tipo').focus({ preventScroll: false }));

    form.addEventListener('submit', event => {
      event.preventDefault();
      const tipo = document.getElementById('tipo').value;
      const uso = document.getElementById('uso')?.value.trim() || 'não informado';
      const cidade = document.getElementById('cidade').value.trim() || 'não informada';
      const medida = document.getElementById('medida').value.trim() || 'não informada';
      const message = `Olá! 👋 Vim pelo site da *NOVE* e gostaria de solicitar uma análise para o meu espaço.\n\n*BRIEFING DO PROJETO*\n• Tipo de espaço: ${tipo}\n• Uso do espaço: ${uso}\n• Cidade: ${cidade}\n• Medida aproximada: ${medida}\n\nPodem me orientar sobre a solução mais indicada e os próximos passos?`;

      window.open(whatsappUrl(message), '_blank', 'noopener');
      status.textContent = 'Abrimos o WhatsApp com seu briefing organizado e pronto para enviar.';
      status.dataset.state = 'success';
    });

    document.getElementById('year').textContent = new Date().getFullYear();
  })();