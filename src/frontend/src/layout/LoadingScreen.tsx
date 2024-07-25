import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BoxScreen } from './BoxScreen'
import { Screen } from './Screen'
import { VerticallyOffCenter } from '@/primitives'
import { Center } from '@/styled-system/jsx'

export const LoadingScreen = ({
  asBox = false,
  renderTimeout = 500,
}: {
  asBox?: boolean
  renderTimeout?: number
}) => {
  const { t } = useTranslation()
  // show the loading screen only after a little while to prevent flash of texts
  const [show, setShow] = useState(false)
  useEffect(() => {
    const timeout = setTimeout(() => setShow(true), renderTimeout)
    return () => clearTimeout(timeout)
  }, [renderTimeout])
  if (!show) {
    return null
  }
  const Container = asBox ? BoxScreen : Screen
  return (
    <Container>
      <VerticallyOffCenter>
        <Center>
          <p>{t('loading')}</p>
        </Center>
      </VerticallyOffCenter>
    </Container>
  )
}
