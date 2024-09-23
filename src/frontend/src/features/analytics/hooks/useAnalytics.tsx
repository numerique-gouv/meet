import { useEffect } from 'react'
import { useLocation } from 'wouter'
import posthog from 'posthog-js'
import { ApiUser } from '@/features/auth/api/ApiUser'

const ANALYTICS_ID = 'phc_RPYko028Oqtj0c9exLIWwrlrjLxSdxT0ntW0Lam4iom'
const ANALYTICS_HOST = 'https://eu.i.posthog.com'

export const startAnalyticsSession = (data: ApiUser) => {
  if (posthog._isIdentified()) return
  const { id, email } = data
  posthog.identify(id, { email })
}

export const terminateAnalyticsSession = () => {
  if (!posthog._isIdentified()) return
  posthog.reset()
}

export const useAnalytics = () => {
  const [location] = useLocation()

  const isProduction = import.meta.env.PROD

  useEffect(() => {
    // We're on a free tier, so we need to limit the number of events we send to PostHog.
    // Be frugal with event tracking, even though we could filter them out later if necessary.
    if (!isProduction) return
    if (posthog.__loaded) return
    posthog.init(ANALYTICS_ID, {
      api_host: ANALYTICS_HOST,
      person_profiles: 'always',
    })
  }, [isProduction])

  // From PostHog tutorial on PageView tracking in a Single Page Application (SPA) context.
  useEffect(() => {
    posthog.capture('$pageview')
  }, [location])

  return null
}
