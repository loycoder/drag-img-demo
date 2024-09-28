import { useRef } from "react";
import { PixelCrop } from "react-image-crop";
import { createALink } from "../utils";
import { message } from "antd";

export interface IUserDownloadCrop {
  completedCrop: PixelCrop;
}

export function useDownloadImg(props: IUserDownloadCrop) {
  const { completedCrop } = props;
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const blobUrlRef = useRef("");

  const onDownload = async () => {
    const image = imgRef.current;

    const previewCanvas = previewCanvasRef.current;
    if (!image || !previewCanvas || !completedCrop) {
      message.error("资源下载失败，请重试");
      return;
    }
    // message.loading("正在下载资源，清稍后...", 0);
    message.loading({
      content: "正在下载资源，清稍后...",
      key: "download",
    });

    // This will size relative to the uploaded image
    // size. If you want to size according to what they
    // are looking at on screen, remove scaleX + scaleY
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
    // You might want { type: "image/jpeg", quality: <0 to 1> } to
    // reduce image size
    const blob = await offscreen.convertToBlob({
      type: "image/png",
    });

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
    blobUrlRef,
  };
}
