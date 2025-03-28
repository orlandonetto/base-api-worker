import NodeCache from 'node-cache'

// Configuração básica do cache
const cacheTTL = 3600 * 1 // Tempo de vida padrão para o cache (em segundos) (3600 = 1h) => * 5 = 5h
const checkPeriod = 60 * 1 // Intervalo de verificação para itens expirados (em segundos)

// Instância do cache que será compartilhada pelo módulo
const cache = new NodeCache({ stdTTL: cacheTTL, checkperiod: checkPeriod })

// Função para salvar um valor no cache
export const setCache = (key: string, value, ttl?: number): boolean => {
  return cache.set(key, value, ttl) // TTL opcional
}

// Função para buscar um valor do cache
export const getCache = <T>(key: string): T | undefined => {
  return cache.get<T>(key)
}

// Função para remover um item do cache
export const delCache = (key: string): number => {
  return cache.del(key)
}

// Função para limpar todo o cache
export const clearCache = (): void => {
  cache.flushAll()
}

// Função para verificar se um item existe no cache
export const hasCache = (key: string): boolean => {
  return cache.has(key)
}
