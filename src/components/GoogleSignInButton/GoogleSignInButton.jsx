'use client';

import { Button } from '@/components';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const GoogleSignInButton = () => {
  const searchParams = useSearchParams();
  const [callbackUrl, setCallbackUrl] = useState('/');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const urlFromParams = searchParams.get('callbackUrl');
    setCallbackUrl(urlFromParams || '/');
  }, [searchParams]);

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl });
  };

  return (
    <Button variant="google" className="radius" icon="google" full loading={isLoading} onClick={handleSignIn}>
      Google
    </Button>
  );
};

export default GoogleSignInButton;
