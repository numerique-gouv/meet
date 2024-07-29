import { useTranslation } from 'react-i18next'
import { BoxScreen } from '@/layout/BoxScreen'
import { Div, Link, P } from '@/primitives'

export const FeedbackRoute = () => {
  const { t } = useTranslation('rooms')
  return (
    <BoxScreen title={t('feedback.heading')}>
      <Div textAlign="left">
        <P>{t('feedback.body')}</P>
      </Div>
      <Div marginTop={1}>
        <P>
          <Link to="/">{t('backToHome', { ns: 'global' })}</Link>
        </P>
      </Div>
    </BoxScreen>
  )
}
