'use client';

import { useEffect, useRef, useState } from 'react';

interface PushUpCounterProps {
  onPushUpComplete: () => void;
}

export default function PushUpCounter({ onPushUpComplete }: PushUpCounterProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [count, setCount] = useState(0);
  const [isDown, setIsDown] = useState(false);
  const [detector, setDetector] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    async function loadModules() {
      try {
        // Import TensorFlow modules
        const tf = await import('@tensorflow/tfjs');
        await import('@tensorflow/tfjs-backend-webgl');
        await tf.setBackend('webgl');
        await tf.ready();
        
        // Dynamically import pose detection
        const poseDetection = await import('@tensorflow-models/pose-detection');
        
        // Create detector with MoveNet (doesn't require MediaPipe)
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true,
        };
        
        const det = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          detectorConfig
        );
        
        setDetector(det);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading modules:', err);
        setError('Failed to load pose detection model. Please refresh the page.');
        setIsLoading(false);
      }
    }
    
    loadModules();
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        setError('');
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Failed to access camera. Please grant camera permissions.');
    }
  }

  function stopCamera() {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  }

  function calculateAngle(a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }) {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    return angle;
  }

  useEffect(() => {
    let animationId: number;
    let lastCountTime = 0;
    const MIN_TIME_BETWEEN_REPS = 500; // Minimum 500ms between reps to avoid double counting

    async function detectPose() {
      if (
        !detector ||
        !videoRef.current ||
        !canvasRef.current ||
        videoRef.current.readyState !== 4
      ) {
        animationId = requestAnimationFrame(detectPose);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        animationId = requestAnimationFrame(detectPose);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        const poses = await detector.estimatePoses(video);

        if (poses.length > 0) {
          const pose = poses[0];
          const keypoints = pose.keypoints;

          // Draw keypoints
          keypoints.forEach((keypoint: any) => {
            if (keypoint.score && keypoint.score > 0.3) {
              ctx.beginPath();
              ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
              ctx.fillStyle = 'red';
              ctx.fill();
            }
          });

          // Get shoulder, elbow, and wrist positions
          const leftShoulder = keypoints.find((kp: any) => kp.name === 'left_shoulder');
          const leftElbow = keypoints.find((kp: any) => kp.name === 'left_elbow');
          const leftWrist = keypoints.find((kp: any) => kp.name === 'left_wrist');
          const rightShoulder = keypoints.find((kp: any) => kp.name === 'right_shoulder');
          const rightElbow = keypoints.find((kp: any) => kp.name === 'right_elbow');
          const rightWrist = keypoints.find((kp: any) => kp.name === 'right_wrist');

          if (
            leftShoulder && leftElbow && leftWrist &&
            rightShoulder && rightElbow && rightWrist &&
            leftShoulder.score! > 0.3 && leftElbow.score! > 0.3 && leftWrist.score! > 0.3 &&
            rightShoulder.score! > 0.3 && rightElbow.score! > 0.3 && rightWrist.score! > 0.3
          ) {
            // Calculate elbow angles
            const leftAngle = calculateAngle(
              { x: leftShoulder.x, y: leftShoulder.y },
              { x: leftElbow.x, y: leftElbow.y },
              { x: leftWrist.x, y: leftWrist.y }
            );
            const rightAngle = calculateAngle(
              { x: rightShoulder.x, y: rightShoulder.y },
              { x: rightElbow.x, y: rightElbow.y },
              { x: rightWrist.x, y: rightWrist.y }
            );

            const avgAngle = (leftAngle + rightAngle) / 2;
            const currentTime = Date.now();

            // Push-up detection logic
            if (avgAngle < 90 && !isDown) {
              setIsDown(true);
            } else if (avgAngle > 160 && isDown && (currentTime - lastCountTime) > MIN_TIME_BETWEEN_REPS) {
              setIsDown(false);
              lastCountTime = currentTime;
              setCount(prev => prev + 1);
              onPushUpComplete();
            }

            // Display angle and status
            ctx.font = '30px Arial';
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3;
            
            const angleText = `Angle: ${Math.round(avgAngle)}°`;
            ctx.strokeText(angleText, 10, 40);
            ctx.fillText(angleText, 10, 40);
            
            const statusText = avgAngle < 90 ? '⬇️ DOWN' : avgAngle > 160 ? '⬆️ UP' : '↔️ MIDDLE';
            ctx.strokeText(statusText, 10, 80);
            ctx.fillText(statusText, 10, 80);
          }
        }
      } catch (err) {
        console.error('Error detecting pose:', err);
      }

      animationId = requestAnimationFrame(detectPose);
    }

    if (cameraActive && detector) {
      detectPose();
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [detector, cameraActive, isDown, onPushUpComplete]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading pose detection model...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a moment on first load</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-lg text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="hidden"
        />
        <canvas
          ref={canvasRef}
          className="border-2 border-gray-300 rounded-lg max-w-full"
          style={{ maxHeight: '500px' }}
        />
      </div>

      <div className="text-center">
        <h2 className="text-4xl font-bold mb-2">{count}</h2>
        <p className="text-lg text-gray-600">Push-ups</p>
        <p className="text-sm text-gray-500 mt-2">
          {isDown ? '⬇️ Down Position' : '⬆️ Up Position'}
        </p>
      </div>

      <div className="flex gap-4">
        {!cameraActive ? (
          <button
            onClick={startCamera}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Start Camera
          </button>
        ) : (
          <>
            <button
              onClick={stopCamera}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
            >
              Stop Camera
            </button>
            <button
              onClick={() => setCount(0)}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
            >
              Reset Count
            </button>
          </>
        )}
      </div>
    </div>
  );
}
