// 'use client';

// import { useState, useEffect } from 'react';
// import useLocalStorageState from 'use-local-storage-state';
// import useRequest from '@/hooks/useRequest';
// import { Button, Preloader, ProgressBar, Score } from '@/components';
// import css from './Scoring.module.scss';

// const Scoring = () => {
//   const [isComplete, setIsComplete] = useState(false);
//   const [progressItems, setProgressItems] = useState([]);
//   const [hasStartedScoring, setHasStartedScoring] = useState(false);

//   const [progress, setProgress] = useLocalStorageState('progress', {
//     defaultValue: [],
//   });

//   const { trigger, isMutating } = useRequest({
//     url: '/api/score',
//     method: 'POST',
//   });

//   const { trigger: submitCandidate } = useRequest({
//     url: '/api/candidate',
//     method: 'POST',
//   });

//   const percent =
//     progress?.data?.length > 0
//       ? Math.round(
//           (progressItems.filter(item => item.status === 'fullfield' || item.status === 'rejected').length /
//             progress.data.length) *
//             100
//         )
//       : 0;

//   const updateProgressItem = (index, status) => {
//     setProgressItems(prev => prev.map((item, i) => (i === index ? { ...item, status } : item)));
//   };

//   useEffect(() => {
//     if (progress?.data?.length > 0) {
//       setProgressItems(
//         progress.data.map((_, index) => ({
//           name: `Процесс обработки вопроса №${index + 1}`,
//           status: 'pending',
//         }))
//       );
//     }
//   }, [progress]);

//   // Функция для запуска скорирования
//   const startScoring = async () => {
//     if (hasStartedScoring || !progress?.data?.length) return;

//     setHasStartedScoring(true);

//     try {
//       const scoringPromises = progress.data.map(async (item, index) => {
//         try {
//           updateProgressItem(index, 'pending');

//           const result = await trigger({
//             question: item.question,
//             answer: item.answer,
//             questionIndex: index,
//           });

//           if (result.success) {
//             updateProgressItem(index, 'fullfield');
//             return {
//               index,
//               score: result.data.score,
//               feedback: result.data.feedback,
//             };
//           } else {
//             updateProgressItem(index, 'rejected');
//             return {
//               index,
//               score: 3.0,
//               feedback: 'Ошибка при оценке вопроса',
//             };
//           }
//         } catch (error) {
//           console.error(`Ошибка при скорировании вопроса ${index + 1}:`, error);
//           updateProgressItem(index, 'rejected');
//           return {
//             index,
//             score: 3.0,
//             feedback: 'Ошибка при оценке вопроса',
//           };
//         }
//       });

//       const results = await Promise.allSettled(scoringPromises);
//       const finalIndex = progressItems.length;
//       setProgressItems(prev => [...prev, { name: 'Сохранение результатов в базу', status: 'pending' }]);

//       const updatedData = [...progress.data];
//       let totalScore = 0;
//       let validScores = 0;

//       results.forEach((result, index) => {
//         if (result.status === 'fulfilled') {
//           const { score, feedback } = result.value;
//           updatedData[index] = {
//             ...updatedData[index],
//             score,
//             feedback,
//           };
//           totalScore += score;
//           validScores++;
//         } else {
//           updatedData[index] = {
//             ...updatedData[index],
//             score: 3.0,
//             feedback: 'Ошибка при оценке',
//           };
//           totalScore += 3.0;
//           validScores++;
//         }
//       });

//       const averageScore = validScores > 0 ? totalScore / validScores : 3.0;
//       const roundedScore = Math.round(averageScore * 10) / 10;

//       // Обновляем весь объект
//       setProgress(prev => ({
//         ...prev,
//         data: updatedData,
//         totalScore: roundedScore,
//       }));

//       setIsComplete(true);
//     } catch (error) {
//       console.error('Ошибка при скорировании:', error);
//       setIsComplete(true);
//     }
//   };

//   useEffect(() => {
//     if (progressItems.length > 0 && !hasStartedScoring && !isComplete) {
//       const timer = setTimeout(() => {
//         startScoring();
//       }, 1000);

//       return () => clearTimeout(timer);
//     }
//   }, [progressItems, hasStartedScoring, isComplete]);

//   if (!progress?.data?.length) return <Preloader />;

//   return (
//     <div className={css.Scoring}>
//       {!isComplete ? (
//         <>
//           <h1>Идет оценка интервью</h1>
//           <ProgressBar procent={percent} progress={progressItems} />
//           <p>Так же готовим обратную связь для улучшения ваших навыков</p>
//         </>
//       ) : (
//         <>
//           <h1>Вы набрали</h1>
//           <Score score={progress.totalScore} />
//           <Button href="./scoring/result" className="full radius">
//             Смотреть результат
//           </Button>
//         </>
//       )}
//     </div>
//   );
// };

// export default Scoring;

'use client';

import { useState, useEffect } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import useRequest from '@/hooks/useRequest';
import { Button, Preloader, ProgressBar, Score } from '@/components';
import css from './Scoring.module.scss';

const Scoring = () => {
  const [isComplete, setIsComplete] = useState(false);
  const [progressItems, setProgressItems] = useState([]);
  const [hasStartedScoring, setHasStartedScoring] = useState(false);

  const [progress, setProgress] = useLocalStorageState('progress', {
    defaultValue: [],
  });

  const { trigger: scoreTrigger } = useRequest({
    url: '/api/score',
    method: 'POST',
  });

  const { trigger: submitCandidate } = useRequest({
    url: '/api/candidate',
    method: 'POST',
  });

  const percent =
    progressItems.length > 0
      ? Math.round(
          (progressItems.filter(item => item.status === 'fullfield' || item.status === 'rejected').length /
            progressItems.length) *
            100
        )
      : 0;

  const updateProgressItem = (index, status) => {
    setProgressItems(prev => prev.map((item, i) => (i === index ? { ...item, status } : item)));
  };

  useEffect(() => {
    if (progress?.data?.length > 0) {
      const items = progress.data.map((_, index) => ({
        name: `Процесс обработки вопроса №${index + 1}`,
        status: 'pending',
      }));
      setProgressItems(items);
    }
  }, [progress]);

  const startScoring = async () => {
    if (hasStartedScoring || !progress?.data?.length) return;
    setHasStartedScoring(true);

    try {
      const scoringResults = await Promise.allSettled(
        progress.data.map(async (item, index) => {
          updateProgressItem(index, 'pending');

          const answer = item.answer?.trim();

          if (!answer) {
            updateProgressItem(index, 'rejected');
            return { index, score: 3.0, feedback: 'Ответ отсутствует' };
          }

          try {
            const result = await scoreTrigger({
              question: item.question,
              answer: item.answer,
              questionIndex: index,
            });

            if (result.success) {
              updateProgressItem(index, 'fullfield');
              return { index, score: result.data.score, feedback: result.data.feedback };
            } else {
              updateProgressItem(index, 'rejected');
              return { index, score: 3.0, feedback: 'Ошибка при оценке вопроса' };
            }
          } catch (err) {
            updateProgressItem(index, 'rejected');
            return { index, score: 3.0, feedback: 'Ошибка при оценке вопроса' };
          }
        })
      );

      const updatedData = [...progress.data];
      let totalScore = 0;
      let validScores = 0;

      scoringResults.forEach(result => {
        if (result.status === 'fulfilled') {
          const { index, score, feedback } = result.value;
          updatedData[index] = { ...updatedData[index], score, feedback };
          totalScore += score;
          validScores++;
        }
      });

      const average = validScores > 0 ? totalScore / validScores : 3.0;
      const roundedScore = Math.round(average * 10) / 10;

      // Добавляем шаг "Сохранение в базу"
      const finalIndex = progressItems.length;
      setProgressItems(prev => [...prev, { name: 'Сохранение результатов в базу', status: 'pending' }]);

      try {
        const res = await submitCandidate({
          ...progress,
          data: updatedData,
          totalScore: roundedScore,
        });

        setProgress(prev => ({
          ...prev,
          _id: res?.candidate?._id || null,
        }));

        updateProgressItem(finalIndex, 'fullfield');
      } catch (err) {
        updateProgressItem(finalIndex, 'rejected');
      }

      setProgress(prev => ({
        ...prev,
        data: updatedData,
        totalScore: roundedScore,
      }));

      setIsComplete(true);
    } catch (error) {
      console.error('Ошибка при скорировании:', error);
      setIsComplete(true);
    }
  };

  useEffect(() => {
    if (progressItems.length > 0 && !hasStartedScoring && !isComplete) {
      const timer = setTimeout(startScoring, 1000);
      return () => clearTimeout(timer);
    }
  }, [progressItems, hasStartedScoring, isComplete]);

  if (!progress?.data?.length) return <Preloader />;

  return (
    <div className={css.Scoring}>
      {!isComplete ? (
        <>
          <h1>Идет оценка интервью</h1>
          <ProgressBar procent={percent} progress={progressItems} />
          <p>Так же готовим обратную связь для улучшения ваших навыков</p>
        </>
      ) : (
        <>
          <h1>Вы набрали</h1>
          <Score score={progress.totalScore} />
          <Button href={`/interviews/${progress.interviewId}/${progress._id}`} className="full radius">
            Смотреть результат
          </Button>
        </>
      )}
    </div>
  );
};

export default Scoring;
