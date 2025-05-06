import css from './Flex.module.scss';

const Flex = ({ children }) => {
  return <div className={css.Flex}>{children}</div>;
};

export default Flex;
