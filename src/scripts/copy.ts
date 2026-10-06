// Copy email. The address is also plain selectable text in the card, so a clipboard
// failure degrades to "select it yourself" rather than a dead button.

const btn = document.getElementById('copy-email') as HTMLButtonElement | null;
const status = document.getElementById('copy-status');

if (btn) {
  const email = btn.dataset.email ?? '';
  const label = btn.querySelector('.copy-label');
  let resetTimer: number | undefined;

  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      if (status) status.textContent = `Copy blocked by your browser - the address is ${email}.`;
      return;
    }
    btn.classList.add('is-copied');
    if (label) label.textContent = 'Copied';
    if (status) status.textContent = `${email} copied to your clipboard.`;

    clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => {
      btn.classList.remove('is-copied');
      if (label) label.textContent = 'Copy';
      if (status) status.textContent = '';
    }, 2000);
  });
}

export {};
