import css from './Section.module.scss';

const Section = ({ intop, width = '100%', children }) => {
  return (
    <section className={css.Section} style={{ maxWidth: width, marginBottom: intop ? 'auto' : 'none' }}>
      {children}
    </section>
  );
};

export default Section;
