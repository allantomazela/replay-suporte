/**
 * Funções de máscara para inputs
 */

export const maskPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
}

export const maskCEP = (value: string): string => {
  const numbers = value.replace(/\D/g, '')
  return numbers.replace(/(\d{5})(\d{3})/, '$1-$2')
}

export const maskCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  return value
}

export const maskCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 14) {
    return numbers.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5',
    )
  }
  return value
}

export const maskCPFCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 11) {
    return maskCPF(value)
  }
  return maskCNPJ(value)
}

export const maskDate = (value: string): string => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 8) {
    return numbers.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3')
  }
  return value
}

