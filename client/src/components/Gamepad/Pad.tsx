import classnames from "classnames";
import { PadId } from "./types";
import { pads } from "./schema";

export interface PadProps {
  padId: PadId;
  active: boolean;
  onPointerDown: () => void;
  onDisabledPointerDown: () => void;
  onPointerUp: () => void;
  disabled: boolean;
}

export const Pad = (props: PadProps) => {
  const bgActiveClass = pads[props.padId].bgActiveColor;
  const bgClass = props.active ? bgActiveClass : pads[props.padId].bgColor;
  const borderRadiusClass = pads[props.padId].borderRadius;
  const key = pads[props.padId].key;

  const handlePointerDown = () => {
    if (props.disabled) {
      props.onDisabledPointerDown();
    } else {
      props.onPointerDown();
    }
  };

  return (
    <button
      onPointerDown={handlePointerDown}
      onPointerUp={props.onPointerUp}
      className={classnames(bgClass, borderRadiusClass)}
      disabled={props.disabled}
    >
      {props.disabled ? null : key}
    </button>
  );
};
