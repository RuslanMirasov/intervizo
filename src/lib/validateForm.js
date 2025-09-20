const validationRegEx = [
  {
    name: 'name',
    regex: /^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ\s\-]+$/,
    error: 'Цифры и спец. символы запрещены!',
  },
  {
    type: 'email',
    regex: /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/,
    error: 'Не верный формат E-mail!',
  },
  {
    type: 'password',
    name: 'password',
    regex: /^(?=.*[A-Za-z])(?=.*\d).{6,}$/,
    error: 'Не верный формат!',
  },
  {
    type: 'url',
    regex: /^(https?:\/\/)?([\w.-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/,
    error: 'Не верный формат URL',
  },
];

export const validateForm = form => {
  if (!form) return true;

  const CSS_ESCAPE = str => (window.CSS && CSS.escape ? CSS.escape(str) : String(str).replace(/"/g, '\\"'));

  const getRuleFor = input => {
    const byName = validationRegEx.find(r => r.name && r.name === input.name);
    if (byName) return byName;
    return validationRegEx.find(r => r.type && r.type === input.type);
  };

  const requiredInputs = Array.from(form.querySelectorAll('[required][name]'));
  const names = Array.from(new Set(requiredInputs.map(el => el.name)));
  let errors = 0;

  for (const groupName of names) {
    const group = Array.from(form.querySelectorAll(`[name="${CSS_ESCAPE(groupName)}"]`));

    let groupValid = false;

    for (const el of group) {
      const { type, value: raw, checked } = el;
      const value = String(raw).trim();
      const rule = getRuleFor(el);

      if (type === 'checkbox' || type === 'radio') {
        if (checked) {
          groupValid = true;
          break;
        }
      }

      if (type !== 'checkbox' && type !== 'radio') {
        if (value !== '' && (!rule?.regex || rule.regex.test(value))) {
          groupValid = true;
          break;
        }
      }
    }

    group.forEach(el => el.classList.toggle('invalid', !groupValid));
    if (!groupValid) errors += 1;
  }

  return errors === 0;
};
