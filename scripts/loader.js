(() => {
  const loader = document.getElementById('siteLoader');
  const video = document.getElementById('siteLoaderVideo');
  if (!loader || !video) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let finished = false;
  let timeout;

  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(timeout);
    loader.classList.add('is-done');
    loader.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => {
      video.pause();
      loader.remove();
    }, 500);
  }

  if (reducedMotion || window.location.hash) {
    finish();
    return;
  }

  video.addEventListener('ended', finish, { once: true });
  video.addEventListener('error', finish, { once: true });
  video.querySelector('source')?.addEventListener('error', finish, { once: true });
  timeout = window.setTimeout(finish, 6500);
  const started = video.play();
  if (started && typeof started.catch === 'function') started.catch(finish);
})();
