import { useTranslation } from 'react-i18next'
import { Button } from '@/primitives'
import { Screen } from '@/layout/Screen'
import { Center, HStack, styled, VStack } from '@/styled-system/jsx'
import { Rating } from '@/features/rooms/components/Rating.tsx'
import { useLocation } from 'wouter'

// fixme - duplicated with home, refactor in a proper style
const Heading = styled('h1', {
  base: {
    fontWeight: '500',
    fontStyle: 'normal',
    fontStretch: 'normal',
    fontOpticalSizing: 'auto',
    fontSize: '2.3rem',
    lineHeight: '2.5rem',
    letterSpacing: '0',
    paddingBottom: '2rem',
  },
})

export const FeedbackRoute = () => {
  const { t } = useTranslation('rooms')
  const [, setLocation] = useLocation()
  return (
    <Screen layout="centered">
      <Center>
        <VStack>
          <Heading>{t('feedback.heading')}</Heading>
          <HStack>
            <Button variant="secondary" onPress={() => window.history.back()}>
              {t('feedback.back')}
            </Button>
            <Button variant="primary" onPress={() => setLocation('/')}>
              {t('feedback.home')}
            </Button>
          </HStack>
          <Rating />
        </VStack>
      </Center>
    </Screen>
  )
}
