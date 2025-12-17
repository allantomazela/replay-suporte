/**
 * Integração com API de CEP (ViaCEP) com cache
 */

export interface CEPData {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

// Cache simples em memória (pode ser melhorado com localStorage)
const cepCache = new Map<string, { data: CEPData; timestamp: number }>()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 horas

export const fetchCEP = async (cep: string): Promise<CEPData | null> => {
  try {
    const cleanCEP = cep.replace(/\D/g, '')
    if (cleanCEP.length !== 8) {
      return null
    }

    // Verificar cache
    const cached = cepCache.get(cleanCEP)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
    const data: CEPData = await response.json()

    if (data.erro) {
      return null
    }

    // Salvar no cache
    cepCache.set(cleanCEP, {
      data,
      timestamp: Date.now(),
    })

    return data
  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
    return null
  }
}

/**
 * Limpa o cache de CEP (útil para testes ou limpeza manual)
 */
export const clearCEPCache = () => {
  cepCache.clear()
}

