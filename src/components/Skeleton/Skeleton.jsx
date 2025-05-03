import css from './Skeleton.module.scss';

const Skeleton = ({ width = '100%', height = '100%', radius = '100px', margin = 'none' }) => {
  return (
    <div
      className={css.Skeleton}
      style={{
        '--skeleton-width': width,
        '--skeleton-height': height,
        '--skeleton-radius': radius,
        '--skeleton-margin': margin,
      }}
    ></div>
  );
};

export default Skeleton;
