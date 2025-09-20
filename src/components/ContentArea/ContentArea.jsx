import React from 'react';
import css from './ContentArea.module.scss';

const ContentArea = ({ align = 'left', children }) => {
  return (
    <div className={css.ContentArea} style={{ textAlign: align }}>
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return child;

        const hasFormWrapper = child.props.className?.includes('form-wrapper');

        return React.cloneElement(child, {
          className: hasFormWrapper ? `${child.props.className} ${css.FormWrapper}` : child.props.className,
        });
      })}
    </div>
  );
};

export default ContentArea;
