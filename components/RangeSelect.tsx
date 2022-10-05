import React, { useMemo } from 'react';
import ReactSlider from 'react-slider';
import styled from 'styled-components';

const StyledSlider = styled(ReactSlider)`
  width: 100%;
  height: 10px;
`;

const StyledThumb = styled.div`
  height: 30px;
  width: 22px;
  text-align: center;
  background-color: #D9D9D9;
  border-radius: 20px;
  cursor: grab;
  transform: translate(0, -10px);
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25),
    inset 0px 4px 8px 1px rgba(0, 0, 0, 0.07);
  &:focus-visible {
    outline: none;
  }
`;

const StyledTrack = styled.div`
  top: 0;
  bottom: 0;
  background: #525252;
  border-radius: 999px;
`;

type Props = {
  value: number;
  top: number;
  bottom?: number;
  onChange: (value: number) => void;
  unit?: string;
};

const RangeSelect: React.FC<Props> = ({
  value,
  top,
  bottom = 0,
  onChange,
  unit = '$',
}) => {
  const Thumb = (props: any, state: any) => (
    <StyledThumb {...props}>
    </StyledThumb>
  );
  const Track = (props: any, state: any) => (
    <StyledTrack {...props} index={state.index} />
  );

  return (
    <StyledSlider
      min={bottom}
      max={top}
      value={value}
      onChange={(value) =>
        onChange(value as number)
      }
      renderTrack={Track}
      renderThumb={Thumb}
      step={25}
    />
  );
};

export default RangeSelect;