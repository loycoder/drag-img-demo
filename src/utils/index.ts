/* eslint-disable @typescript-eslint/no-explicit-any */
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

// 动态创建 style
export function createStyle(
  styleId: string,
  styleText: string,
  isOverwrite = true
) {
  const destroy = () => {
    const dom = document.getElementById(styleId);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    dom && dom?.parentNode?.removeChild(dom);
  };
  let style = document.createElement("style");
  console.log("style: ", style);

  if (isOverwrite && styleId) {
    const _dom = document.getElementById(styleId) as HTMLStyleElement;
    if (_dom) {
      style = _dom;
    }
  }
  style.setAttribute("id", styleId);
  style.type = "text/css";
  const sHtml = styleText;
  style.innerHTML = sHtml;
  document.getElementsByTagName("head").item(0).appendChild(style);
  return () => destroy();
}

export function scaleCanvasToFitScreen(
  canvasWidth: number,
  canvasHeight: number
): CanvasSize {
  const screenWidth = window.innerWidth; //* 0.38;
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
    height: scaledHeight + 20,
  };
}

/**
 * @description 动态生成 input file
 * @param config
 * @returns
 */
export function createInputFile(config: {
  multiple: boolean;
  accept?: string;
  onChange: (event: Event) => void;
  onClick?: () => void;
}) {
  const { multiple = true, accept = "*", onChange, onClick = null } = config;
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = multiple;
  input.accept = accept;
  input.style.display = "none";

  input.addEventListener("change", onChange);
  input.addEventListener("click", (event) => {
    (event.target as any).value = null;
    onClick?.();
  });

  document.body.appendChild(input);
  const destroy = () => document.body.removeChild(input);

  return {
    input,
    destroy,
  };
}

export function createALink(config: {
  href: string;
  download: string;
  onClick?: () => void;
}) {
  const { href, download, onClick } = config;
  const a = document.createElement("a");
  a.href = href;
  a.download = download;
  a.style.display = "none";

  a.addEventListener("click", onClick);
  document.body.appendChild(a);
  const destroy = () => {
    a.removeEventListener("click", onClick);
    document.body.removeChild(a);
  };

  return {
    link: a,
    destroy,
  };
}
