import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BoxScreen } from './BoxScreen'
import { Screen } from './Screen'

export const LoadingScreen = ({ asBox = false }: { asBox?: boolean }) => {
  const { t } = useTranslation()
  // show the loading screen only after a little while to prevent flash of texts
  const [show, setShow] = useState(false)
  useEffect(() => {
    const timeout = setTimeout(() => setShow(true), 500)
    return () => clearTimeout(timeout)
  }, [])
  if (!show) {
    return null
  }
  const Container = asBox ? BoxScreen : Screen
  return (
    <Container>
      <p>{t('loading')}</p>
    </Container>
  )
}
