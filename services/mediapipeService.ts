import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { MODEL_PATH, WASM_PATH } from '../constants';

let handLandmarker: HandLandmarker | null = null;

export const createHandLandmarker = async (): Promise<HandLandmarker> => {
  if (handLandmarker) return handLandmarker;

  const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
  
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MODEL_PATH,
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numHands: 2,
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  return handLandmarker;
};
