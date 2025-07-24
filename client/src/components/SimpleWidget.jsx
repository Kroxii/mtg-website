import React from 'react';

const SimpleWidget = ({ widget, children }) => {
  return (
    <div className={`widget size-${widget.size}`}>
      <div className="widget-header">
        <widget.icon size={20} />
        <h3>{widget.title}</h3>
      </div>
      <div className="widget-content">
        {children}
      </div>
    </div>
  );
};

export default SimpleWidget;
