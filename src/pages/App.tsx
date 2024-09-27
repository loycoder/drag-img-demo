import React, { useState, useMemo } from 'react'

import ReactCrop, {
  Crop,
  PixelCrop,
  convertToPixelCrop,
} from 'react-image-crop'
import { canvasPreview } from '../utils/canvasPreview'
import { useDebounceEffect } from '../useDebounceEffect'
import 'react-image-crop/dist/ReactCrop.css'
import { centerAspectCrop, scaleCanvasToFitScreen } from '../utils';
import { Button, InputNumber } from 'antd'
import { useDownloadImg } from '../hooks/useDownloadImg';
import { DownloadOutlined } from '@ant-design/icons';
import useWindowSize from '../hooks/useWindowSize'
import './styles.less';

export default function App() {
  const [imgSrc, setImgSrc] = useState('')
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>(null)
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [aspect, setAspect] = useState<number | undefined>(4 / 3);
  const { width: innerWidth, height: innerHeight } = useWindowSize();

  const {
    imgRef,
    previewCanvasRef,
    hiddenAnchorRef,
    onDownload
  } = useDownloadImg({
    completedCrop
  });

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined) // Makes crop preview update between images.
      const reader = new FileReader()
      reader.addEventListener('load', () =>
        setImgSrc(reader.result?.toString() || ''),
      )
      reader.readAsDataURL(e.target.files[0])
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, aspect))
    }
  }

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

  function handleToggleAspectClick() {
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
  }

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

        <input type="file" accept="image/*" onChange={onSelectFile} />
        <div className='action-wrapper'>
          <div>
            <label htmlFor="scale-input">缩放比例: </label>
            <input
              id="scale-input"
              type="number"
              step="0.1"
              value={scale}
              disabled={!imgSrc}
              onChange={(e) => setScale(Number(e.target.value))}
            />
          </div>

          <div>
            <label htmlFor="rotate-input">旋转角度: </label>
            <InputNumber
              disabled={!imgSrc} changeOnWheel min={-180} max={180} defaultValue={0} value={rotate} onChange={value => {
                setRotate(Math.min(180, Math.max(-180, Number(value))))
              }} />
          </div>
        </div>

        <div>
          <button onClick={handleToggleAspectClick}>
            Toggle aspect {aspect ? 'off' : 'on'}
          </button>
        </div>


        <div className="crop-controls">
          <div className='image-container'>
            {!!imgSrc && (
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
                  alt="Crop me"
                  src={imgSrc}
                  style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            )}
          </div>
          <Button type="primary" shape="round" icon={<DownloadOutlined />} size='middle' onClick={onDownload} >重新选择文件</Button>
          <Button type="primary" shape="round" icon={<DownloadOutlined />} size='middle' >下载</Button>
        </div>



      </div>

      <div className='right'>
        {!!completedCrop && (
          <>
            <div>
              <canvas
                ref={previewCanvasRef}
                style={{
                  objectFit: 'contain',
                  ...canvasStyle,
                }}
              />
            </div>
            <div>

              <a
                href="#hidden"
                ref={hiddenAnchorRef}
                download
                style={{
                  position: 'absolute',
                  top: '-200vh',
                  visibility: 'hidden',
                }}
              >
                Hidden download
              </a>
            </div>
          </>
        )}
      </div>

    </div>
  )
}
