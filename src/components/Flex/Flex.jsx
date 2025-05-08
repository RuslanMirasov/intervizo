import css from './Flex.module.scss';

const Flex = ({ children, className = '' }) => {
  return <div className={`${css.Flex} ${className}`}>{children}</div>;
};

export default Flex;
