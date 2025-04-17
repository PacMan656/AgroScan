import pragas from '../data/basePragas_completo.json';

export async function identifyPestFromImage(imageUri: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = Math.floor(Math.random() * pragas.length);
      const praga = pragas[index];

      const resultado = `
📌 Praga: ${praga.nome}
🔬 Nome Científico: ${praga.cientifico}

📝 Descrição:
${praga.descricao}

⚠️ Danos:
${praga.danos}
      `.trim();

      resolve(resultado);
    }, 1500);
  });
}
