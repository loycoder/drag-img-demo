import { useMemoizedFn } from "ahooks";

export const ROTATE_ANGLE = 90;

// 旋转控制
import { useState } from "react";
export const useRotate = (initRotateZ = 0) => {
  const [rotateZ, setRotateZ] = useState(initRotateZ);

  const onRotate = useMemoizedFn((ROTATE_ANGLE: number) => {
    const val = rotateZ + ROTATE_ANGLE;
    setRotateZ(val);
    return val;
  });

  const resetRotate = useMemoizedFn(() => {
    setRotateZ(initRotateZ);
    return initRotateZ;
  });

  return {
    rotateZ,
    setRotateZ,
    onRotate,
    resetRotate,
  };
};
