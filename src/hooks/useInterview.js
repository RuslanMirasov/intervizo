// import useLocalStorageState from 'use-local-storage-state';
// import { useSession } from 'next-auth/react';

// const interviewTemplate = {
//   company: null,
//   owners: [],
//   slug: '',
//   name: '',
//   category: '',
//   description: '',
//   thumbnail: '',
//   duration: null,
//   difficulty: '',
//   video: '',
//   data: [],
// };

// export const useInterview = () => {
//   const { data: session } = useSession();

//   const [interview, setInterview, { isPersistent }] = useLocalStorageState('interview', {
//     defaultValue: { ...interviewTemplate, company: session?.user?.id || null, owners: [session?.user?.email] },
//     ssr: false,
//   });

//   const [updates, setUpdates, { isPersistent: isUpdatesPersistent }] = useLocalStorageState('updates', {
//     defaultValue: {},
//     ssr: false,
//   });

//   const resetInterview = () => setInterview(interviewTemplate);
//   const resetUpdates = () => setUpdates({});

//   if (session?.user?.id && interview.company !== session.user.id) {
//     setInterview(prev => ({
//       ...prev,
//       company: session.user.id,
//       owners: session.user.email ? [session.user.email] : [],
//     }));
//   }

//   return {
//     interview,
//     updates,
//     isPersistent,
//     isUpdatesPersistent,
//     setInterview,
//     setUpdates,
//     resetInterview,
//     resetUpdates,
//   };
// };

'use client';

import { useEffect, useCallback } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { useSession } from 'next-auth/react';

const interviewTemplate = {
  company: null,
  owners: [],
  slug: '',
  name: '',
  category: '',
  description: '',
  thumbnail: '',
  duration: null,
  difficulty: '',
  video: '',
  data: [],
};

export const useInterview = () => {
  const { data: session } = useSession();

  // ВАЖНО: defaultValue больше не зависит от session
  const [interview, setInterview, { isPersistent }] = useLocalStorageState('interview', {
    defaultValue: { ...interviewTemplate },
    ssr: false,
  });

  const [updates, setUpdates, { isPersistent: isUpdatesPersistent }] = useLocalStorageState('updates', {
    defaultValue: {},
    ssr: false,
  });

  // Синхронизация владельца по готовности session — ТОЛЬКО в эффекте
  useEffect(() => {
    if (!session?.user?.id) return;

    const nextOwners = session.user.email ? [session.user.email] : [];

    setInterview(prev => {
      const curr = prev || { ...interviewTemplate };
      const ownersEq =
        Array.isArray(curr.owners) &&
        curr.owners.length === nextOwners.length &&
        curr.owners.every((v, i) => v === nextOwners[i]);

      if (curr.company === session.user.id && ownersEq) return curr;

      return {
        ...curr,
        company: session.user.id,
        owners: nextOwners,
      };
    });
  }, [session?.user?.id, session?.user?.email, setInterview]);

  const resetInterview = useCallback(() => setInterview({ ...interviewTemplate }), [setInterview]);
  const resetUpdates = useCallback(() => setUpdates({}), [setUpdates]);

  return {
    interview,
    updates,
    isPersistent,
    isUpdatesPersistent,
    setInterview,
    setUpdates,
    resetInterview,
    resetUpdates,
  };
};
