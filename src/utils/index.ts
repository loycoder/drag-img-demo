import { centerCrop, makeAspectCrop } from "react-image-crop";

export function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

interface CanvasSize {
  width: number;
  height: number;
}

export function scaleCanvasToFitScreen(
  canvasWidth: number,
  canvasHeight: number
): CanvasSize {
  const screenWidth = window.innerWidth * 0.38;
  const screenHeight = window.innerHeight;
  const screenAspectRatio = screenWidth / screenHeight;
  const canvasAspectRatio = canvasWidth / canvasHeight;

  let scaledWidth: number;
  let scaledHeight: number;

  if (canvasAspectRatio > screenAspectRatio) {
    // Canvas is wider than screen, scale based on width
    scaledWidth = screenWidth;
    scaledHeight = screenWidth / canvasAspectRatio;
  } else {
    // Canvas is taller than screen, scale based on height
    scaledHeight = screenHeight;
    scaledWidth = screenHeight * canvasAspectRatio;
  }

  return {
    width: scaledWidth,
    height: scaledHeight,
  };
}
