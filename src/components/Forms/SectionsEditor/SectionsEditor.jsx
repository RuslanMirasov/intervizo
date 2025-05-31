'use client';

import { debounce } from '@/lib/debounce';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useInterview } from '@/hooks/useInterview';
import { Button, Icon } from '@/components';
import { generateId } from '@/lib/generateId';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import css from './SectionsEditor.module.scss';
import { playAudio } from '@/lib/playAudio';

const SortableSection = ({ section, originalSection, onUpdate, playingId, setPlayingId, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const isPlaying = playingId === section.id;

  const isUpdated =
    originalSection &&
    (originalSection.text !== section.text ||
      originalSection.type !== section.type ||
      originalSection.audio !== section.audio);

  const style = {
    transform: isDragging
      ? CSS.Transform.toString({
          ...transform,
          scaleY: 1,
        })
      : CSS.Transform.toString(transform),
    transition,
    opacity: 1,
    zIndex: 100,
  };

  const styleP = {
    backgroundColor: isDragging ? 'var(--color)' : '',
    color: isDragging ? 'var(--white)' : '',
  };

  return (
    <div ref={setNodeRef} className={css.Section} style={style} {...attributes}>
      <p className={css.DragHandle} style={styleP}>
        <Icon name={section.type} size="16" color="currentColor" />
        <span {...listeners}>{section.type === 'question' ? 'Вопрос' : 'Сообщение'}</span>

        {children}
      </p>
      {section.audio && (
        <span
          className={css.SoundIndicator}
          style={{
            pointerEvents: isUpdated ? 'none' : 'all',
          }}
          onClick={async () => {
            if (!isUpdated) {
              setPlayingId(section.id); // сначала сбросим у других
              try {
                await playAudio(`${section.audio}?t=${Date.now()}`);
              } catch (e) {
                console.error(e.message);
              } finally {
                setPlayingId(null); // сбрасываем, когда закончилось
              }
            }
          }}
        >
          <Icon name="sound" size="16" color={isPlaying ? 'var(--green)' : isUpdated ? 'var(--red)' : 'var(--color)'} />
        </span>
      )}
      <textarea
        placeholder={`Введите ${section.type === 'question' ? 'вопрос' : 'сообщение'}...`}
        value={section.text}
        onChange={e => onUpdate(section.id, e.target.value)}
        //onChange={e => setLocalText(e.target.value)}
      />
    </div>
  );
};

const SectionsEditor = ({ currentInterview }) => {
  const { interview, setInterview } = useInterview();
  const [playingId, setPlayingId] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));
  const originalData = currentInterview?.data || [];

  const addSection = type => {
    setInterview(prev => ({
      ...prev,
      data: [...prev.data, { id: generateId(), type, text: '', audio: '' }],
    }));
  };

  const updateSection = useCallback(
    (id, text) => {
      setInterview(prev => {
        const section = prev.data.find(s => s.id === id);
        if (!section || section.text === text) return prev;

        return {
          ...prev,
          data: prev.data.map(s => (s.id === id ? { ...s, text } : s)),
        };
      });
    },
    [setInterview]
  );

  const removeSection = id => {
    setInterview(prev => ({
      ...prev,
      data: prev.data.filter(s => s.id !== id),
    }));
  };

  const handleDragEnd = event => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = interview.data.findIndex(s => s.id === active.id);
      const newIndex = interview.data.findIndex(s => s.id === over.id);
      const newData = arrayMove(interview.data, oldIndex, newIndex);
      setInterview(prev => ({ ...prev, data: newData }));
    }
  };

  return (
    <div className={css.SectionsEditor}>
      <div className={css.Buttons}>
        <Button className="grey" onClick={() => addSection('message')}>
          <Icon name="addmessage" size="18" color="currentColor" />
          добавить
          <br />
          сообщение
        </Button>
        <Button className="grey" onClick={() => addSection('question')}>
          <Icon name="addquestion" size="18" color="currentColor" />
          добавить
          <br />
          вопрос
        </Button>
      </div>
      <fieldset className={css.Inputs}>
        {interview.data.length === 0 && <p className={css.Empty}>Нет ни одной секции</p>}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={interview.data.map(s => s.id)} strategy={verticalListSortingStrategy}>
            {interview.data.map(section => {
              const originalSection = originalData.find(s => s.id === section.id);

              return (
                <SortableSection
                  key={section.id}
                  section={section}
                  originalSection={originalSection}
                  playingId={playingId}
                  setPlayingId={setPlayingId}
                  onUpdate={updateSection}
                >
                  <button type="button" onClick={() => removeSection(section.id)}>
                    <Icon name="close" size="10" color="currentColor" />
                  </button>
                </SortableSection>
              );
            })}
          </SortableContext>
        </DndContext>
      </fieldset>
    </div>
  );
};

export default SectionsEditor;
