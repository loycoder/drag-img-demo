declare interface Window {
  rejectApi: {
    openCropModal: () => void;
    closeCropModal: () => void;
    getBase64Image: (cb: (base64: string) => void) => void;
  };

  // 需要业务提供的接口
  onCropModalConfirm: (base64: string) => boolean;
  onCropModalCancel: () => boolean;
}
