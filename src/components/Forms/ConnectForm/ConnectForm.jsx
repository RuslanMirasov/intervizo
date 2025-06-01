'use client';

import { useState, useEffect } from 'react';
import { Button, Input } from '@/components';
import { useRouter } from 'next/navigation';
import { useProgressStorage } from '@/hooks/useProgressStorage';
import css from './ConnectForm.module.scss';

const ConnectForm = ({ id }) => {
  const router = useRouter();
  const { setMeta } = useProgressStorage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [nameInvalid, setNameInvalid] = useState(false);
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [formValid, setFormValid] = useState(false);

  const validateName = value => {
    const trimmed = value.trim();
    return trimmed.length > 0 && !/\d/.test(trimmed);
  };

  useEffect(() => {
    setNameInvalid(name !== '' && !validateName(name));
    setEmailInvalid(email !== '' && !validateEmail(email));
    setFormValid(validateName(name) && validateEmail(email));
  }, [name, email]);

  const validateEmail = value => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  };

  const handleSubmit = e => {
    e.preventDefault();

    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);

    setNameInvalid(!isNameValid);
    setEmailInvalid(!isEmailValid);

    if (!isNameValid || !isEmailValid) return;

    setMeta({ name: name.trim(), email: email.trim() });
    router.replace(`/room/${id}`);
  };

  return (
    <form action="#" className={css.ConnectForm} noValidate onSubmit={handleSubmit}>
      <Input
        name="name"
        type="text"
        placeholder="Фамилия имя"
        value={name}
        onChange={e => setName(e.target.value)}
        invalid={nameInvalid}
      />
      <Input
        name="email"
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={e => setEmail(e.target.value)}
        invalid={emailInvalid}
      />
      <Button type="submit" className="full" disabled={!formValid}>
        Подключится
      </Button>
    </form>
  );
};

export default ConnectForm;
