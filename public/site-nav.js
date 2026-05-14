(() => {
  const posts = window.__POSTS__ || [];
  const isTyping = (el) => el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);

  const search = document.getElementById('search');
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  let searchFocus = 0;
  let filtered = posts;

  const shortDate = (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  function renderSearch() {
    if (!results) return;
    results.innerHTML = '';

    if (!filtered.length) {
      const empty = document.createElement('li');
      empty.className = 'search-empty';
      empty.textContent = 'nothing.';
      results.appendChild(empty);
      return;
    }

    filtered.forEach((post, i) => {
      const li = document.createElement('li');
      li.className = `search-result${i === searchFocus ? ' focused' : ''}`;
      li.innerHTML = `<span class="st"></span><span class="sd"></span>`;
      li.querySelector('.st').textContent = post.title;
      li.querySelector('.sd').textContent = shortDate(post.date);
      li.addEventListener('mouseenter', () => { searchFocus = i; renderSearch(); });
      li.addEventListener('click', () => { window.location.href = post.url; });
      results.appendChild(li);
    });
  }

  function updateSearch() {
    const q = input.value.trim().toLowerCase();
    filtered = q ? posts.filter((p) => p.title.toLowerCase().includes(q)) : posts;
    searchFocus = Math.min(searchFocus, Math.max(filtered.length - 1, 0));
    renderSearch();
  }

  function openSearch() {
    if (!search || !input) return;
    search.hidden = false;
    input.value = '';
    filtered = posts;
    searchFocus = 0;
    renderSearch();
    requestAnimationFrame(() => input.focus());
  }

  function closeSearch() {
    if (!search) return;
    search.hidden = true;
  }

  document.querySelectorAll('[data-search-open]').forEach((el) => {
    el.addEventListener('click', openSearch);
  });

  search?.addEventListener('click', (e) => {
    if (e.target === search) closeSearch();
  });

  input?.addEventListener('input', updateSearch);
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeSearch();
    } else if (e.key === 'ArrowDown' || (e.ctrlKey && e.key === 'n')) {
      e.preventDefault();
      searchFocus = Math.min(searchFocus + 1, filtered.length - 1);
      renderSearch();
    } else if (e.key === 'ArrowUp' || (e.ctrlKey && e.key === 'p')) {
      e.preventDefault();
      searchFocus = Math.max(searchFocus - 1, 0);
      renderSearch();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[searchFocus]) window.location.href = filtered[searchFocus].url;
    }
  });

  const links = Array.from(document.querySelectorAll('[data-post-link]'));
  let homeFocus = Math.max(links.findIndex((a) => a.closest('.post-item')?.classList.contains('focused')), 0);

  function setHomeFocus(i) {
    if (!links.length) return;
    homeFocus = Math.max(0, Math.min(i, links.length - 1));
    links.forEach((a, idx) => a.closest('.post-item')?.classList.toggle('focused', idx === homeFocus));
  }

  links.forEach((a, i) => {
    a.addEventListener('mouseenter', () => setHomeFocus(i));
  });

  window.addEventListener('keydown', (e) => {
    if (isTyping(e.target)) return;
    if (search && !search.hidden) return;

    const onHome = document.querySelector('.home');
    const onReader = document.querySelector('.reader');

    if (e.key === '/') {
      e.preventDefault();
      openSearch();
      return;
    }

    if (onHome && links.length) {
      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        setHomeFocus(homeFocus + 1);
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        setHomeFocus(homeFocus - 1);
      } else if (e.key === 'g') {
        e.preventDefault();
        setHomeFocus(0);
      } else if (e.key === 'G') {
        e.preventDefault();
        setHomeFocus(links.length - 1);
      } else if (e.key === 'Enter' || e.key === 'l' || e.key === 'ArrowRight') {
        e.preventDefault();
        window.location.href = links[homeFocus].href;
      }
    } else if (onReader) {
      if (e.key === 'Escape' || e.key === 'h' || e.key === 'ArrowLeft') {
        if (!window.getSelection()?.toString()) {
          e.preventDefault();
          window.location.href = '/';
        }
      } else if (e.key === 'j' || e.key === 'ArrowDown') {
        window.scrollBy({ top: 80, behavior: 'smooth' });
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        window.scrollBy({ top: -80, behavior: 'smooth' });
      }
    }
  });
})();
