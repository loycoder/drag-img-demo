/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState, useMemo, useEffect, useRef } from 'react'

import ReactCrop, {
  Crop,
  PixelCrop,
} from 'react-image-crop'
import { canvasPreview } from '../utils/canvasPreview'
import { useDebounceEffect } from '../useDebounceEffect'
import 'react-image-crop/dist/ReactCrop.css'
import { centerAspectCrop, scaleCanvasToFitScreen } from '../utils';
import { useDownloadImg } from '../hooks/useDownloadImg';
import { DownloadOutlined, HarmonyOSOutlined, InfoCircleOutlined, RedoOutlined, UploadOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import useWindowSize from '../hooks/useWindowSize'
import { useScale } from '../hooks/useScale'
import { useMemoizedFn } from 'ahooks'
import { ROTATE_ANGLE, useRotate } from '../hooks/useRotate'
import { useTriggerClickUpload } from '../hooks/useTriggerClickUpload'
import { Button, Empty, message, Modal, Tooltip } from 'antd'
import { isEmpty } from 'lodash-es'
import empty from '../assets/empty.png'
import './styles.less'
import { unstable_batchedUpdates } from 'react-dom'

export default function App() {
  const [imgSrc, setImgSrc] = useState<string>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>(null)
  const [aspect, setAspect] = useState<number | undefined>(4 / 3);
  const [open, setOpen] = useState(true);
  const { width: innerWidth, height: innerHeight } = useWindowSize();
  const { scale, setScale, onZoomIn, onWheelZoomOut, onWheelZoomIn, onZoomOut, resetZoomScale } = useScale(1, { min: 0.2, max: 5, step: 0.2 });
  const { onRotate, rotateZ: rotate, resetRotate } = useRotate(0);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [isInit, setIsInit] = useState(true);
  const editContainerRef = useRef<HTMLDivElement>(null);


  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      const reader = new FileReader()
      reader.addEventListener('load', () =>
        setImgSrc(reader.result?.toString() || ''),
      )
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const { triggerUpload } = useTriggerClickUpload(onSelectFile);

  const { imgRef, previewCanvasRef, getBase64, onDownload } = useDownloadImg({
    completedCrop
  });

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, aspect))
    }
  }

  const handleWheel = useMemoizedFn((event: WheelEvent) => {
    event.preventDefault(); // 阻止默认滚动行为
    const isZoomOut = event?.deltaY > 0;

    isZoomOut ? onWheelZoomOut() : onWheelZoomIn();
  });

  const rejectApi = {
    openCropModal: () => {
      setOpen(true);
    },
    closeCropModal: () => {
      setOpen(false);
    },
    getBase64Image: useMemoizedFn((cb) => {
      if (!imgSrc) {
        console.error('no image source');
        return '';
      }
      return getBase64(cb)
    })
  }
  window.rejectApi = rejectApi;
  useEffect(() => {
    document.body?.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      document.body?.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel])

  const comp = useMemoizedFn(async () => {
    if (
      completedCrop?.width &&
      completedCrop?.height &&
      imgRef.current &&
      previewCanvasRef.current
    ) {


      canvasPreview(
        imgRef.current,
        previewCanvasRef.current,
        completedCrop,
        scale,
        rotate,
      )
      // return;
      setTimeout(() => {
        if (!isInit) {
          return
        }

        const container = editContainerRef.current;

        // 判断图片的缩放比例，缩放到多少, 宽高完全显示在容器内
        const img = imgRef.current;
        const imgHeight = img.naturalHeight;
        const containerHeight = container.clientHeight;

        if (imgHeight > containerHeight) {
          if (imgRef.current.height >= containerHeight) {
            const scale = containerHeight / imgHeight
            setScale(scale + 0.15);
          }
        }
        setIsInit(false);
      }, 0);
    }
  })

  useDebounceEffect(
    comp,
    100,
    [completedCrop, scale, rotate],
  )

  const canvasStyle = useMemo(() => {
    if (!completedCrop) return null;
    const size = scaleCanvasToFitScreen(completedCrop.width, completedCrop.height);

    return {
      width: size.width,
      height: size.height
    }
  }, [completedCrop, innerHeight, innerWidth]);


  const handleOk = () => {
    if (!imgRef.current) {
      return message.error('请先上传素材图片');
    }
    if (!window.onCropModalConfirm) {
      throw new Error('window.onCropModalConfirm is not defined');
    }
    getBase64((base64) => {
      const flag = window.onCropModalConfirm(base64);
      flag && setOpen(false);
    })
  }

  const handleCancel = () => {
    if (!window.onCropModalCancel) {
      throw new Error('window.onCropModalCancel is not defined');
    }
    const flag = window.onCropModalCancel();
    flag && setOpen(false);
  }

  const reset = () => {
    resetZoomScale();
    resetRotate();
    setAspect(4 / 3);
  }

  const _isEmptyCompletedCrop = isEmpty(completedCrop);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const alignItems = () => {
    if (_isEmptyCompletedCrop) {
      return 'center'
    }

    if (imgRef.current.naturalWidth / imgRef.current.naturalHeight === 4 / 3) {
      return 'flex-start'
    }
    if ((imgRef.current.naturalWidth >= imgRef.current.naturalHeight)) {
      return 'center'
    }
    return 'flex-start'
  }

  return (
    <Modal
      cancelText='取消'
      open={open}
      cancelButtonProps={{
        size: 'large',
      }}
      okButtonProps={{
        size: 'large',
      }}
      okText='确定'
      width={innerWidth * 0.8} style={{
        overflow: 'auto',
      }} title="图片编辑" onOk={handleOk} onCancel={handleCancel}>

      <div>
        <div className='tips'>
          <InfoCircleOutlined /> 操作说明：请将产品最大化的呈现在裁剪框内，滚动鼠标滚轮放大或缩小产品图
        </div>
        <div className="react-image-crop-container">

          <div className='left'>
            <div className="crop-controls">
              <div className='image-container' ref={editContainerRef}>
                {imgSrc ? (
                  <ReactCrop
                    crop={crop}
                    style={{
                      opacity: isInit ? 0 : 1,
                    }}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={aspect}
                    minWidth={90}
                    minHeight={90}
                  // circularCrop
                  >
                    <img
                      ref={imgRef}
                      src={imgSrc}
                      style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                      onLoad={onImageLoad}
                    />
                  </ReactCrop>
                ) : <Empty description={
                  <Button style={{ marginTop: 120 }} type='primary' onClick={triggerUpload}>点击上传图片素材</Button>
                } image={<img src={empty} style={{ height: 220 }} />} />}

              </div>
            </div>
            <div className="toolbar">
              <div className='left-content'>
                <Tooltip title="图片素材建议尺寸:1920*1080">
                  <div className="toolbar-item" onClick={() => {
                    unstable_batchedUpdates(() => {
                      setIsInit(true);
                      setImgSrc(null);
                      setCrop(null);
                      setCompletedCrop(null);
                      setScale(1);
                      setAspect(4 / 3);
                      resetRotate();
                      triggerUpload();

                    })
                  }}>
                    <UploadOutlined />
                    <span className="toolbar-text">重新选择文件</span>
                  </div>
                </Tooltip>

                <div className="toolbar-item" onClick={() => {
                  if (!imgSrc) return message.error('请先上传素材图片');
                  onDownload();
                }}>
                  <DownloadOutlined
                  />
                  <span className="toolbar-text">下载</span>
                </div>

              </div>
              <div className='right-content'>

                <div onClick={reset} className="toolbar-item">
                  <HarmonyOSOutlined />
                  <span className="toolbar-text">重置状态</span>
                </div>

                <div onClick={onZoomIn} className="toolbar-item">
                  <ZoomInOutlined />
                  <span className="toolbar-text">放大</span>
                </div>

                <div onClick={onZoomOut} className="toolbar-item">
                  <ZoomOutOutlined />
                  <span className="toolbar-text">缩小</span>
                </div>

                <div className="toolbar-item" onClick={() => {
                  onRotate(ROTATE_ANGLE);
                }}>
                  <RedoOutlined />
                  <span className="toolbar-text">顺时针旋转</span>
                </div>

                <div className="toolbar-item" onClick={() => {
                  onRotate(-ROTATE_ANGLE);
                }}>
                  <RedoOutlined style={{ transform: 'rotate(-180deg)' }} />
                  <span className="toolbar-text">逆时针旋转</span>
                </div>
              </div>
            </div>
          </div>

          <div className='right'>
            <div className='preview' ref={previewContainerRef} style={{
              height: _isEmptyCompletedCrop ? '100%' : 480,
              // alignItems: alignItems(),
            }}>
              {_isEmptyCompletedCrop ? <div className='preview-empty'> <Empty description='上传素材后可预览' /></div> : (
                <canvas
                  ref={previewCanvasRef}
                  style={{
                    objectFit: 'contain',
                    // marginTop: -56,
                    ...canvasStyle,
                  }}
                />
              )}
            </div>
          </div>
        </div>
        <canvas width="1920" id='download_canvas' style={{ opacity: 0, display: 'none' }} height="1440" />
      </div>
    </Modal>

  )
}
