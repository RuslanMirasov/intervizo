'use client';

import { useState, useEffect } from 'react';
import { Button, Input } from '@/components';
import { useRouter } from 'next/navigation';
import useRequest from '@/hooks/useRequest';
import { useProgressStorage } from '@/hooks/useProgressStorage';
import css from './ConnectForm.module.scss';

const ConnectForm = ({ id, interviewId }) => {
  const router = useRouter();
  const { setMeta } = useProgressStorage();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [nameInvalid, setNameInvalid] = useState(false);
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [formValid, setFormValid] = useState(false);

  const validateName = value => {
    const trimmed = value.trim();
    return trimmed.length > 0 && !/\d/.test(trimmed);
  };

  const validateEmail = async value => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  };

  useEffect(() => {
    setNameInvalid(name !== '' && !validateName(name));
    setEmailInvalid(email !== '' && !validateEmail(email));
    setFormValid(validateName(name) && validateEmail(email));
  }, [name, email]);

  const { trigger: checkCandidate, isMutating } = useRequest({
    url: `/api/candidate/check`,
    method: 'POST',
  });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);

    setNameInvalid(!isNameValid);
    setEmailInvalid(!isEmailValid);

    if (!isNameValid || !isEmailValid) return;

    try {
      await checkCandidate({ email, interviewId });
      setMeta({ name: name.trim(), email: email.trim() });
      router.replace(`/room/${id}`);
    } catch {
      return;
    } finally {
      setLoading(false);
    }
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
      <Button type="submit" className="full" disabled={!formValid} loading={loading}>
        Подключится
      </Button>
    </form>
  );
};

export default ConnectForm;
