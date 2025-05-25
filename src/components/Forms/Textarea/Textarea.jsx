import { Skeleton } from '@/components';
import { slugify } from '@/lib/slugify';
import { useInterview } from '@/hooks/useInterview';

const Textarea = ({ name, placeholder }) => {
  const { interview, setInterview } = useInterview();

  if (!interview) return <Skeleton width="40%" height="14px" radius="4px" />;

  return (
    <textarea
      name={name}
      placeholder={placeholder}
      value={interview[name]}
      onChange={e =>
        setInterview(prev => ({
          ...prev,
          [name]: e.target.value,
          slug: name === 'name' ? slugify(e.target.value) : interview.slug,
        }))
      }
    ></textarea>
  );
};

export default Textarea;
