import React, { useRef, useEffect, useState } from 'react';
import { Button, Space, message, Alert } from 'antd';
import { CameraOutlined, RedoOutlined, CheckOutlined } from '@ant-design/icons';
import './CameraCapture.css';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 重置所有状态
    setCapturedImage(null);
    setIsLoading(true);
    setError(null);
    
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Prefer rear camera
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Cannot access camera:', err);
      setError('Cannot access camera, please check permission settings');
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      message.error('Camera not ready');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      message.error('Cannot get canvas context');
      return;
    }

    // 设置画布尺寸
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 绘制视频帧到画布
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 转换为base64图片
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    // 重新启动相机
    if (!stream || stream.getTracks().length === 0) {
      startCamera();
    }
  };

  const confirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const handleCancel = () => {
    stopCamera();
    // 重置状态
    setCapturedImage(null);
    setIsLoading(true);
    setError(null);
    onCancel();
  };

  if (error) {
    return (
      <div className="camera-error">
        <Alert
          message="Camera Access Failed"
          description={error}
          type="error"
          showIcon
        />
        <div className="error-actions">
          <Space>
            <Button onClick={startCamera}>Retry</Button>
            <Button onClick={handleCancel}>Cancel</Button>
          </Space>
        </div>
      </div>
    );
  }

  return (
    <div className="camera-capture">
      <div className="camera-container">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              className="camera-video"
              autoPlay
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="camera-canvas"
              style={{ display: 'none' }}
            />
            {isLoading && (
              <div className="camera-loading">
                <div className="loading-spinner"></div>
                <div>Starting camera...</div>
              </div>
            )}
          </>
        ) : (
          <img
            src={capturedImage}
            alt="Captured photo"
            className="captured-image"
          />
        )}
      </div>

      <div className="camera-controls">
        {!capturedImage ? (
          <Space size="large">
            <Button
              size="large"
              onClick={handleCancel}
              className="cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<CameraOutlined />}
              onClick={capturePhoto}
              disabled={isLoading}
              className="capture-button"
            >
              Take Photo
            </Button>
          </Space>
        ) : (
          <Space size="large">
            <Button
              size="large"
              icon={<RedoOutlined />}
              onClick={retakePhoto}
              className="retake-button"
            >
              Retake
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<CheckOutlined />}
              onClick={confirmCapture}
              className="confirm-button"
            >
              Confirm
            </Button>
          </Space>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;