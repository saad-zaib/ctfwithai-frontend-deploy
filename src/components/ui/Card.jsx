import React, { useState } from 'react';
import { T } from '../../design/tokens';

/**
 * Reusable premium card container.
 * - hoverable: adds translateY(-2px) + shadow increase on hover
 * - clickable: shows cursor:pointer
 * - padded: applies T.cardPad (24px) internal padding
 */
const Card = ({
  children,
  style,
  hoverable = false,
  clickable = false,
  padded = true,
  onClick,
  className,
  ...rest
}) => {
  const [hov, setHov] = useState(false);

  return (
    <div
      className={className}
      onClick={onClick}
      onMouseEnter={() => hoverable && setHov(true)}
      onMouseLeave={() => hoverable && setHov(false)}
      {...rest}
      style={{
        background: T.cardBg,
        border: `1px solid ${T.border}`,
        borderRadius: T.cardRadius,
        boxShadow: hov ? T.shadowCardHover : T.shadowCard,
        padding: padded ? T.cardPad : 0,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        cursor: clickable || onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default Card;
