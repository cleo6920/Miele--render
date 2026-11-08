const form = document.querySelector('#adesione form');
const feedback = form.querySelector('[role="status"]');
const submit = form.querySelector('button[type="submit"]');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (submit.disabled) return;
  submit.disabled = true;
  feedback.textContent = 'Invio in corso…';
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new URLSearchParams(new FormData(form))
    });
    const result = await response.json();
    feedback.textContent = result.message;
    if (response.ok) form.reset();
  } catch {
    feedback.textContent = 'Non è stato possibile verificare l’invio. Puoi riprovare.';
  } finally {
    submit.disabled = false;
  }
});
