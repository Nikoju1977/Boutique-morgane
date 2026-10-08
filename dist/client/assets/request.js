for (const form of document.querySelectorAll('[data-message-form]')) {
  const result = form.querySelector('.message-result');
  const output = form.querySelector('.message-output');
  const status = form.querySelector('.message-status');
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const read = name => String(data.get(name) || '').trim();
    const prenom = read('prenom'), sujet = read('sujet');
    const message = read('message'), preferences = read('preferences');
    const lines = ['Bonjour Morgane,', '', `Je m’appelle ${prenom}.`, `Objet : ${sujet}.`];
    if (preferences) lines.push(`Mes préférences de rendez-vous : ${preferences}`);
    if (message) lines.push('', message);
    lines.push('', 'Pouvez-vous me préciser les modalités et, pour une consultation, le tarif, la durée et vos disponibilités ?', '', 'Merci,', prenom);
    output.value = lines.join('\n');
    result.hidden = false;
    status.textContent = 'Message préparé. Il n’a pas été envoyé.';
    output.focus();
  });
  form.querySelector('[data-copy]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(output.value);
      status.textContent = 'Message copié. Vous pouvez le transmettre à Morgane.';
    } catch {
      output.focus();
      output.select();
      status.textContent = 'Texte sélectionné. Utilisez la commande Copier de votre appareil.';
    }
  });
}
