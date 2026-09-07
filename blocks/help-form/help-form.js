function fieldId(field) {
  return `help-form-${String(field.Field || field.Name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function isMandatory(field) {
  return String(field.Mandatory).toLowerCase() === 'true';
}

function createLabel(field, id) {
  const label = document.createElement('label');
  label.setAttribute('for', id);
  label.textContent = field.Label || field.Name;
  if (isMandatory(field)) {
    const marker = document.createElement('span');
    marker.className = 'help-form-required';
    marker.setAttribute('aria-hidden', 'true');
    marker.textContent = '*';
    label.append(' ', marker);
  }
  return label;
}

function createControl(field, id) {
  const type = (field.Type || 'text').toLowerCase();
  let control;

  if (type === 'textarea') {
    control = document.createElement('textarea');
    control.rows = Number(field.Rows) || 6;
    if (field.Placeholder) control.placeholder = field.Placeholder;
  } else if (type === 'select') {
    control = document.createElement('select');
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = field.Placeholder || 'Select';
    control.append(placeholder);
    String(field.Options || '')
      .split(',')
      .map((option) => option.trim())
      .filter(Boolean)
      .forEach((option) => {
        const item = document.createElement('option');
        item.value = option;
        item.textContent = option;
        control.append(item);
      });
  } else {
    control = document.createElement('input');
    control.type = type;
    if (field.Placeholder) control.placeholder = field.Placeholder;
    if (field.Min) control.min = field.Min;
    if (field.Max) control.max = field.Max;
  }

  control.id = id;
  control.name = field.Name;
  if (field.Value) control.value = field.Value;
  if (field.Autocomplete) control.autocomplete = field.Autocomplete;
  if (isMandatory(field)) control.required = true;
  return control;
}

function showError(control, message) {
  const error = control.closest('.help-form-field').querySelector('.help-form-error');
  error.textContent = message;
  if (message) {
    control.setAttribute('aria-invalid', 'true');
    control.setAttribute('aria-describedby', error.id);
  } else {
    control.removeAttribute('aria-invalid');
    control.removeAttribute('aria-describedby');
  }
}

function validate(control) {
  if (control.checkValidity()) {
    showError(control, '');
    return true;
  }
  showError(control, control.dataset.errorMessage || control.validationMessage);
  return false;
}

function createField(field) {
  const id = fieldId(field);
  const wrapper = document.createElement('div');
  wrapper.className = 'help-form-field';

  const control = createControl(field, id);
  if (field.ErrorMessage) control.dataset.errorMessage = field.ErrorMessage;

  const error = document.createElement('p');
  error.className = 'help-form-error';
  error.id = `${id}-error`;
  error.setAttribute('role', 'alert');

  wrapper.append(createLabel(field, id), control, error);

  control.addEventListener('blur', () => validate(control));
  control.addEventListener('input', () => {
    if (control.getAttribute('aria-invalid') === 'true') validate(control);
  });

  return wrapper;
}

function generatePayload(form) {
  const payload = {};
  new FormData(form).forEach((value, key) => {
    payload[key] = typeof value === 'string' ? value.trim() : value;
  });
  return payload;
}

async function submitForm(form, status) {
  const controls = [...form.elements].filter((el) => el.name && el.type !== 'submit');
  const valid = controls.map(validate).every(Boolean);

  if (!valid) {
    controls.find((control) => control.getAttribute('aria-invalid') === 'true')?.focus();
    return;
  }

  const submit = form.querySelector('.help-form-submit');
  const label = submit.textContent;
  submit.disabled = true;
  submit.textContent = 'Submitting…';

  try {
    const response = await fetch(form.dataset.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: generatePayload(form) }),
    });
    if (!response.ok) throw new Error(response.status);
    form.reset();
    controls.forEach((control) => showError(control, ''));
    status.classList.remove('help-form-status-error');
    status.textContent = form.dataset.thankYou;
  } catch {
    status.classList.add('help-form-status-error');
    status.textContent = 'Sorry, we could not submit your request. Please try again.';
  } finally {
    submit.disabled = false;
    submit.textContent = label;
  }
}

export default async function decorate(block) {
  const link = block.querySelector('a[href$=".json"]');
  if (!link) return;

  const heading = block.querySelector('h1, h2, h3');
  const thankYou = link.closest('div')?.nextElementSibling?.textContent.trim();
  const source = new URL(link.href, window.location.href).pathname;

  let definition;
  try {
    const response = await fetch(source);
    if (!response.ok) throw new Error(response.status);
    definition = (await response.json()).data || [];
  } catch {
    block.textContent = 'Unable to load the form.';
    return;
  }

  const content = document.createElement('div');
  content.className = 'help-form-content';
  if (heading) content.append(heading);

  const form = document.createElement('form');
  form.className = 'help-form-form';
  form.noValidate = true;
  form.dataset.action = source.replace(/\.json$/, '');
  form.dataset.thankYou = thankYou || 'Thanks. Your help request has been submitted. We will reach out to you shortly via your email.';

  const submitRow = definition.find((field) => (field.Type || '').toLowerCase() === 'submit');
  definition
    .filter((field) => field.Name && (field.Type || '').toLowerCase() !== 'submit')
    .forEach((field) => form.append(createField(field)));

  const submit = document.createElement('button');
  submit.className = 'help-form-submit';
  submit.type = 'submit';
  submit.textContent = submitRow?.Label || 'Submit';

  const status = document.createElement('p');
  status.className = 'help-form-status';
  status.setAttribute('aria-live', 'polite');

  form.append(submit, status);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    status.textContent = '';
    submitForm(form, status);
  });

  content.append(form);
  block.replaceChildren(content);
}
