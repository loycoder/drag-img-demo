import React, { useState, useMemo, useEffect } from 'react'

import ReactCrop, {
  Crop,
  PixelCrop,
} from 'react-image-crop'
import { canvasPreview } from '../utils/canvasPreview'
import { useDebounceEffect } from '../useDebounceEffect'
import 'react-image-crop/dist/ReactCrop.css'
import { centerAspectCrop, scaleCanvasToFitScreen } from '../utils';
import { useDownloadImg } from '../hooks/useDownloadImg';
import { DownloadOutlined, HarmonyOSOutlined, RedoOutlined, UploadOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import useWindowSize from '../hooks/useWindowSize'
import { useScale } from '../hooks/useScale'
import { useMemoizedFn } from 'ahooks'
import { ROTATE_ANGLE, useRotate } from '../hooks/useRotate'
import { useTriggerClickUpload } from '../hooks/useTriggerClickUpload'
import { Button, Empty, message, Tooltip } from 'antd'
import { isEmpty } from 'lodash-es'
import empty from '../assets/3333.png'
import './styles.less'

export default function App() {
  const [imgSrc, setImgSrc] = useState<string>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>(null)
  const [aspect, setAspect] = useState<number | undefined>(4 / 3);
  const { width: innerWidth, height: innerHeight } = useWindowSize();
  const { scale, onZoomIn, onWheelZoomOut, onWheelZoomIn, onZoomOut, resetZoomScale } = useScale(1, { min: 0.2, max: 5, step: 0.2 });
  const { onRotate, rotateZ: rotate, resetRotate } = useRotate(0);


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

  const { imgRef, previewCanvasRef, onDownload } = useDownloadImg({
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
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    isZoomOut ? onWheelZoomOut() : onWheelZoomIn();
  });


  useEffect(() => {
    document.body?.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      document.body?.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel])

  useDebounceEffect(
    async () => {
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
      }
    },
    100,
    [completedCrop, scale, rotate],
  )

  /*   function handleToggleAspectClick() {
      if (aspect) {
        setAspect(undefined)
      } else {
        setAspect(4 / 3)
        if (imgRef.current) {
          const { width, height } = imgRef.current
          const newCrop = centerAspectCrop(width, height, 4 / 3)
          setCrop(newCrop)
          setCompletedCrop(convertToPixelCrop(newCrop, width, height))
        }
      }
    } */

  const canvasStyle = useMemo(() => {
    if (!completedCrop) return null;
    const size = scaleCanvasToFitScreen(completedCrop.width, completedCrop.height);

    return {
      width: size.width,
      height: size.height
    }
  }, [completedCrop, innerHeight, innerWidth])

  return (
    <div className="container">
      <div className='left'>
        <div className="crop-controls">
          <div className='image-container'>
            {imgSrc ? (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
              // minWidth={500}
              // minHeight={100}
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

          <div className="toolbar">
            <div className='left-content'>
              <Tooltip title="图片素材建议尺寸:1920*1080">
                <div className="toolbar-item" onClick={triggerUpload}>
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

              <div onClick={() => {
                resetZoomScale();
                resetRotate();
                setAspect(4 / 3);
              }} className="toolbar-item">
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
      </div>

      <div className='right'>
        <div className='preview'>
          {isEmpty(completedCrop) ? <Empty description='上传素材后可预览' /> : (
            <canvas
              ref={previewCanvasRef}
              style={{
                objectFit: 'contain',
                ...canvasStyle,
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
