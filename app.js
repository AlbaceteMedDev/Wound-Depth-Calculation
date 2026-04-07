  document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.method-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const method = tab.dataset.method;
    document.getElementById('method-' + method).classList.add('active');
    document.getElementById('results').style.display = 'none';
  });
});

const GRAFT_SIZES = [
  { label: '2 x 2 cm', w: 2, h: 2, area: 4 },
  { label: '4 x 4 cm', w: 4, h: 4, area: 16 },
  { label: '5 x 5 cm', w: 5, h: 5, area: 25 },
  { label: '4 x 8 cm', w: 4, h: 8, area: 32 },
  { label: '5 x 10 cm', w: 5, h: 10, area: 50 },
  { label: '7
