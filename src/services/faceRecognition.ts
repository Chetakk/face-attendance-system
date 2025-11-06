import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export async function loadModels() {
  if (modelsLoaded) return;

  const MODEL_URL = '/models';

  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);

  modelsLoaded = true;
}

export async function detectFace(image: HTMLVideoElement | HTMLImageElement) {
  const detection = await faceapi
    .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  return detection;
}

export function compareFaces(descriptor1: Float32Array, descriptor2: number[]): number {
  const dist = faceapi.euclideanDistance(descriptor1, descriptor2);
  return 1 - dist;
}

export function getFaceDescriptor(detection: faceapi.WithFaceDescriptor<any>): number[] {
  return Array.from(detection.descriptor);
}
