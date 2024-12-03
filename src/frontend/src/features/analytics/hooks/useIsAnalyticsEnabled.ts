import { useConfig } from '@/api/useConfig.ts'

export const useIsAnalyticsEnabled = () => {
  const { data } = useConfig()
  return !!data?.analytics?.id
}
