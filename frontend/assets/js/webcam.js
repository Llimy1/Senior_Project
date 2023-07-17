// COCO-SSD를 사용한 Object Detect

// boxing을 위한 x,y
let x = 0;
let y = 0;

// coco-ssd 모델 로드
async function loadModel() {
  return cocoSsd.load();
}

// coco-ssd 모델을 사용하여 웹캠에 박싱 처리
async function detectObjects(model) {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');
  const { videoWidth, videoHeight } = video;

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  const predictions = await model.detect(video);

  // context.clearRect(0, 0, canvas.width, canvas.height);

  predictions.forEach((prediction) => {
    const { bbox, class: label, score } = prediction;

    const centerX = bbox[0] + bbox[2] / 2;
    const centerY = bbox[1] + bbox[3] / 2;

    x = centerX;
    y = centerY;

    context.beginPath();
    context.rect(...bbox);
    context.lineWidth = 2;
    context.strokeStyle = 'red';
    context.fillStyle = 'red';
    context.stroke();
    context.fillText(`${label} (${Math.round(score * 100)}%)`, bbox[0], bbox[1] > 10 ? bbox[1] - 5 : 10);
  });

  requestAnimationFrame(() => detectObjects(model));
}

// 모델이 적용된 웹캠 실행
async function run() {
  const model = await loadModel();
  const video = document.getElementById('video');

  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        detectObjects(model);
      };
    });
}

run();
