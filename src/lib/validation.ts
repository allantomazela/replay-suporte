/**
 * Funções de validação
 */

/**
 * Valida CPF
 */
export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '')
  
  if (cleanCPF.length !== 11) return false
  if (/^(\d)\1+$/.test(cleanCPF)) return false // Todos os dígitos iguais
  
  let sum = 0
  let remainder
  
  // Valida primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false
  
  // Valida segundo dígito verificador
  sum = 0
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false
  
  return true
}

/**
 * Valida CNPJ
 */
export const validateCNPJ = (cnpj: string): boolean => {
  const cleanCNPJ = cnpj.replace(/\D/g, '')
  
  if (cleanCNPJ.length !== 14) return false
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false // Todos os dígitos iguais
  
  let length = cleanCNPJ.length - 2
  let numbers = cleanCNPJ.substring(0, length)
  const digits = cleanCNPJ.substring(length)
  let sum = 0
  let pos = length - 7
  
  // Valida primeiro dígito verificador
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--
    if (pos < 2) pos = 9
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(0))) return false
  
  // Valida segundo dígito verificador
  length = length + 1
  numbers = cleanCNPJ.substring(0, length)
  sum = 0
  pos = length - 7
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--
    if (pos < 2) pos = 9
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(1))) return false
  
  return true
}

/**
 * Valida CPF ou CNPJ
 */
export const validateCPFCNPJ = (value: string): boolean => {
  const clean = value.replace(/\D/g, '')
  if (clean.length === 11) {
    return validateCPF(value)
  } else if (clean.length === 14) {
    return validateCNPJ(value)
  }
  return false
}

/**
 * Formata mensagem de erro de validação
 */
export const getCPFCNPJErrorMessage = (value: string): string => {
  const clean = value.replace(/\D/g, '')
  if (clean.length === 11) {
    return 'CPF inválido'
  } else if (clean.length === 14) {
    return 'CNPJ inválido'
  }
  return 'CPF/CNPJ inválido'
}

