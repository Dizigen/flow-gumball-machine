import React from 'react';

type SpacerProps = {
    orientation: 'vertical' | 'horizontal';
    size: number;
}
  
const Spacer: React.FunctionComponent<SpacerProps> = (props) => {
    const { orientation, size } = props;
    if (orientation === 'vertical') return <div style={{width: '5px', height: `${size}px`}}/>
    else if (orientation === 'horizontal') return <div style={{width: `${size}px`, height: '5px'}}/>
    else return <></>
}

export default Spacer;