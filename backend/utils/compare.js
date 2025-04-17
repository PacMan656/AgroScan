const tf = require('@tensorflow/tfjs');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

let model;
const datasetDir = path.join(__dirname, '../dataset/Jute_Pest_Dataset/test');
let index = [];

async function loadModel() {
  if (!model) {
    model = await tf.loadGraphModel(
      'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v2_1.0_224/model.json'
    );
  }
  return model;
}

async function preprocessImage(filePath) {
  const buffer = await sharp(filePath).resize(224, 224).toBuffer();
  const imageTensor = tf.node.decodeImage(buffer).toFloat().div(255).expandDims(0);
  return imageTensor;
}

async function extractFeatures(filePath) {
  const model = await loadModel();
  const imageTensor = await preprocessImage(filePath);
  const prediction = model.predict(imageTensor);
  const flattened = prediction.flatten();
  return flattened.array();
}

function euclidean(a, b) {
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}

async function prepareIndex() {
  const model = await loadModel();

  const folders = fs.readdirSync(datasetDir);
  for (const folder of folders) {
    const folderPath = path.join(datasetDir, folder);
    if (!fs.lstatSync(folderPath).isDirectory()) continue;

    const praga = folder.replace(/-/g, ' '); // transforma nomes como "Lagarta-da-juta"
    const cultura = "juta";

    for (const file of fs.readdirSync(folderPath)) {
      const ext = path.extname(file).toLowerCase();
      if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

      const filePath = path.join(folderPath, file);
      const features = await extractFeatures(filePath);
      index.push({ praga, cultura, features });
    }
  }
}

let isPrepared = false;

async function extractAndCompare(imagePath) {
  if (!isPrepared) {
    await prepareIndex();
    isPrepared = true;
  }

  const features = await extractFeatures(imagePath);

  const resultados = index.map(({ praga, cultura, features: f }) => {
    const dist = euclidean(features, f);
    return { praga, cultura, dist };
  });

  resultados.sort((a, b) => a.dist - b.dist);
  const melhor = resultados[0];
  const similaridade = +(1 / (1 + melhor.dist) * 100).toFixed(2);

  return {
    praga: melhor.praga,
    cultura: melhor.cultura,
    similaridade,
  };
}

module.exports = { extractAndCompare };
