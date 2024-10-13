import { useRef } from "react";
import { PixelCrop } from "react-image-crop";
import { createALink } from "../utils";
import { message } from "antd";

export interface IUserDownloadCrop {
  completedCrop: PixelCrop;
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      resolve(base64data);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(blob);
  });
}

/**
 * 将一个 image 绘制到 canvas 上
 * @param srcImage
 * @param destCanvas
 */
export function drawCanvas(
 srcImage: HTMLImageElement,
 destCanvas: HTMLCanvasElement
) {
 const destCtx = destCanvas.getContext("2d");

 // 获取源 image 的宽度和高度
 const srcWidth = srcImage.width;
 const srcHeight = srcImage.height;

 // 获取目标 canvas 的宽度和高度
 const destWidth = destCanvas.width;
 const destHeight = destCanvas.height;

 // 计算缩放比例
 const scaleX = destWidth / srcWidth;
 const scaleY = destHeight / srcHeight;
 const scale = Math.max(scaleX, scaleY);

 // 计算绘制图像的尺寸
 const drawWidth = srcWidth * scale;
 const drawHeight = srcHeight * scale;

 // 计算绘制图像的起始位置，使其居中
 const offsetX = (destWidth - drawWidth) / 2;
 const offsetY = (destHeight - drawHeight) / 2;

 // 清空画布
 destCtx.clearRect(0, 0, destWidth, destHeight);

 // 绘制图像
 destCtx.drawImage(srcImage, 0, 0, srcWidth, srcHeight, offsetX, offsetY, drawWidth, drawHeight);
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string = "image/png",
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas to Blob conversion failed."));
        }
      },
      type,
      quality
    );
  });
}

function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url); // 释放 URL 对象
      resolve(img);
    };
    img.onerror = (error) => {
      URL.revokeObjectURL(url); // 释放 URL 对象
      reject(error);
    };
    img.src = url;
  });
}

export function useDownloadImg(props: IUserDownloadCrop) {
  const { completedCrop } = props;
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const blobUrlRef = useRef("");

  const getCanvasBlob = async () => {
    const image = imgRef.current;
    const previewCanvas = previewCanvasRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const offscreen = new OffscreenCanvas(
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );
    const ctx = offscreen.getContext("2d");
    if (!ctx) {
      throw new Error("No 2d context");
    }

    ctx.drawImage(
      previewCanvas,
      0,
      0,
      previewCanvas.width,
      previewCanvas.height,
      0,
      0,
      offscreen.width,
      offscreen.height
    );

    let blob = await offscreen.convertToBlob({
      type: "image/png",
    });
    // 将 blob 转换为 image后，然后重新绘制到 另一个固定大小的 canvas(1920* 1440)上
    const sourceImage = await blobToImage(blob);
    const getCanvasElement = () =>
      document.getElementById("download_canvas") as HTMLCanvasElement;
    drawCanvas(sourceImage, getCanvasElement());
    blob = await canvasToBlob(getCanvasElement());
    return blob;
  };

  const onDownload = async () => {
    const image = imgRef.current;

    const previewCanvas = previewCanvasRef.current;
    if (!image || !previewCanvas || !completedCrop) {
      message.error("资源下载失败，请重试");
      return;
    }
    message.loading({
      content: "正在下载资源，清稍后...",
      key: "download",
    });

    const blob = await getCanvasBlob();
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }
    blobUrlRef.current = URL.createObjectURL(blob);
    const { link, destroy } = createALink({
      href: blobUrlRef.current,
      download: "image.png",
    });
    link.click();
    setTimeout(() => destroy(), 0);

    message.success({
      content: "图片资源下载成功",
      key: "download",
    });
  };
  return {
    onDownload,
    imgRef,
    previewCanvasRef,
    getBase64: (cb) => {
      getCanvasBlob()
        .then(blobToBase64)
        .then(cb)
        .catch((error) => {
          console.error("getBase64 error", error);
          cb(null);
        });
    },
  };
}
