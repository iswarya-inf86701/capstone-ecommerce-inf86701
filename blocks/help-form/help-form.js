function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function decorate(block) {
  block.innerHTML = `
    <div class="help-form-content">
      <h1>Help</h1>
      <form class="help-form-form" novalidate>
        <div class="help-form-field">
          <label for="help-name">Name</label>
          <input id="help-name" name="name" type="text" autocomplete="name" required>
          <p class="help-form-error" id="help-name-error"></p>
        </div>

        <div class="help-form-field">
          <label for="help-email">Email</label>
          <input id="help-email" name="email" type="email" autocomplete="email" required>
          <p class="help-form-error" id="help-email-error"></p>
        </div>

        <div class="help-form-field">
          <label for="help-needed">Help needed</label>
          <textarea id="help-needed" name="helpNeeded" rows="6" required></textarea>
          <p class="help-form-error" id="help-needed-error"></p>
        </div>

        <button class="help-form-submit" type="submit">Submit</button>
        <p class="help-form-status" aria-live="polite"></p>
      </form>
    </div>
  `;

  const form = block.querySelector('.help-form-form');
  const name = block.querySelector('#help-name');
  const email = block.querySelector('#help-email');
  const helpNeeded = block.querySelector('#help-needed');
  const status = block.querySelector('.help-form-status');

  const showError = (field, message) => {
    const error = block.querySelector(`#${field.id}-error`);
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    field.setAttribute('aria-describedby', error.id);
    error.textContent = message;
  };

  const validate = () => {
    let valid = true;

    if (!name.value.trim()) {
      showError(name, 'Please enter your name.');
      valid = false;
    } else {
      showError(name, '');
    }

    if (!email.value.trim()) {
      showError(email, 'Please enter your email.');
      valid = false;
    } else if (!isValidEmail(email.value.trim())) {
      showError(email, 'Please enter a valid email address.');
      valid = false;
    } else {
      showError(email, '');
    }

    if (!helpNeeded.value.trim()) {
      showError(helpNeeded, 'Please tell us what help you need?');
      valid = false;
    } else {
      showError(helpNeeded, '');
    }

    return valid;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    status.textContent = '';

    if (!validate()) return;

    form.reset();
    [name, email, helpNeeded].forEach((field) => showError(field, ''));
    status.textContent = 'Thanks. Your help request has been submitted. We will reach out to you shortly via your email.';
  });
}
