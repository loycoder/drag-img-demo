declare interface Window {
  rejectApi: {
    openCropModal: () => void;
    closeCropModal: () => void;
    getBase64Image: (cb: (base64: string) => void) => void;
  };
}
