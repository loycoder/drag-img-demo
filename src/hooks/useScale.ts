import { useState } from "react";
import { useMemoizedFn } from "ahooks";
import { IScaleOption } from "../types";

export const defaultScaleOption: IScaleOption = {
  max: 2,
  min: 0.2,
  step: 0.2,
};

export const defaultWheelStep = 0.02;

export const useScale = (
  initScale = 1,
  _scaleOption?: Partial<IScaleOption>
) => {
  const scaleOption = {
    ...defaultScaleOption,
    ..._scaleOption,
  };
  const [scale, setScale] = useState(initScale);

  function findClosestNumber(num: number) {
    return Math.round(num / scaleOption.step) * scaleOption.step;
  }
  const onZoomIn = useMemoizedFn(() => {
    const newScale = findClosestNumber(scale) + scaleOption.step;
    if (newScale < scaleOption.min) {
      return scaleOption.min;
    }
    if (newScale > scaleOption.max) {
      return scaleOption.max;
    }
    setScale(newScale);

    return newScale;
  });

  const onZoomOut = useMemoizedFn(() => {
    const newScale = findClosestNumber(scale) - scaleOption.step;
    if (newScale < scaleOption.min) {
      return scaleOption.min;
    }
    if (newScale > scaleOption.max) {
      return scaleOption.max;
    }
    setScale(newScale);

    return newScale;
  });

  const onWheelZoomOut = useMemoizedFn(() => {
    const newScale = scale - defaultWheelStep;
    if (newScale < scaleOption.min) {
      return scaleOption.min;
    }
    if (newScale > scaleOption.max) {
      return scaleOption.max;
    }
    setScale(newScale);

    return newScale;
  });

  const onWheelZoomIn = useMemoizedFn(() => {
    const newScale = scale + defaultWheelStep;
    if (newScale < scaleOption.min) {
      return scaleOption.min;
    }
    if (newScale > scaleOption.max) {
      return scaleOption.max;
    }
    setScale(newScale);

    return newScale;
  });

  const resetZoomScale = useMemoizedFn(() => {
    setScale(initScale);
    return initScale;
  });

  const setSafeScale = useMemoizedFn((newScale: number) => {
    const res = Math.min(Math.max(newScale, scaleOption.min), scaleOption.max);
    setScale(res);
    return res;
  });

  return {
    scale,
    setScale,
    setSafeScale,
    onZoomIn,
    onZoomOut,
    onWheelZoomIn,
    onWheelZoomOut,
    resetZoomScale,
  };
};
