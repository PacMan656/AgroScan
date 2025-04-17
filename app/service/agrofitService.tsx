import axios from 'axios';

const API_KEY = 'adb27e12-ac15-3c2d-a775-3471133c7199'; // Substitua por sua chave da Embrapa AgroAPI
const BASE_URL = 'https://api.cnptia.embrapa.br/agrofit/v1';

export async function buscarProdutosPorPraga(praga: string) {
  try {
    const response = await axios.get(`${BASE_URL}/produtos`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      params: {
        praga,
        pagina: 1,
        tamanhoPagina: 5,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao acessar a API AGROFIT:', error);
    throw new Error('Falha na comunicação com a Embrapa');
  }
}
