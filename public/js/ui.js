document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('darkToggle');
  if (!toggle) return;
  const setDark = (d) => {
    if (d) document.body.classList.add('dark'); else document.body.classList.remove('dark');
    localStorage.setItem('dark', d ? '1' : '0');
  };
  const pref = localStorage.getItem('dark');
  setDark(pref === '1');
  toggle.addEventListener('click', () => setDark(!document.body.classList.contains('dark')));
});
