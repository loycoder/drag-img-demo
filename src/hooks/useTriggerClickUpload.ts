import { createInputFile } from "../utils";

export function useTriggerClickUpload(onChange: (event) => void) {
  const triggerUpload = () => {
    const { input, destroy } = createInputFile({
      multiple: false,
      accept: "image/*",
      onChange,
    });
    input.click();
    setTimeout(() => destroy(), 0); // 每次创建完一定要销毁掉
  };

  return {
    triggerUpload,
  };
}
