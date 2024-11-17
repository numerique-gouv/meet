import { Button, H, Text } from '@/primitives'
import { useState } from 'react'
import { cva } from '@/styled-system/css'
import { useTranslation } from 'react-i18next'
import { styled } from '@/styled-system/jsx'
import { usePostHog } from 'posthog-js/react'

const Card = styled('div', {
  base: {
    border: '1px solid',
    borderColor: 'gray.300',
    padding: '1rem',
    marginTop: '1.5rem',
    borderRadius: '0.25rem',
    boxShadow: '',
  },
})

const Bar = styled('div', {
  base: {
    display: 'flex',
    border: '2px solid',
    borderColor: 'gray.300',
    borderRadius: '8px',
    overflowY: 'hidden',
    scrollbar: 'hidden',
  },
})

const ratingButtonRecipe = cva({
  base: {
    backgroundColor: 'white',
    color: 'initial',
    border: 'none',
    borderRadius: 0,
    padding: '0.5rem 0.85rem',
    flexGrow: '1',
    cursor: 'pointer',
  },
  variants: {
    selected: {
      true: {
        backgroundColor: '#1d4ed8',
        color: 'white',
      },
    },
    borderLeft: {
      true: {
        borderLeft: '1px solid',
        borderColor: 'gray.300',
      },
    },
  },
})

const labelRecipe = cva({
  base: {
    color: 'gray.600',
    paddingTop: '0.25rem',
  },
})

export const Rating = ({ maxRating = 7, ...props }) => {
  const posthog = usePostHog()
  const { t } = useTranslation('rooms', { keyPrefix: 'rating' })
  const [selectedRating, setSelectedRating] = useState<number | null>(null)

  const handleRatingClick = (rating: number) => {
    setSelectedRating((prevRating) => (prevRating === rating ? null : rating))
  }

  const minLabel = props?.minLabel ?? t('levels.min')
  const maxLabel = props?.maxLabel ?? t('levels.max')

  const onSubmit = () => {
    try {
      posthog.capture('survey sent', {
        $survey_id: '01933c22-d005-0000-b623-20b752171e2e',
        $survey_response: `${selectedRating}`,
      })
      setSelectedRating(null)
    } catch (e) {
      console.warn(e)
      setSelectedRating(null)
    }
  }

  if (!posthog.__loaded) {
    return null
  }

  return (
    <Card>
      <H lvl={3}>{t('question')}</H>
      <Bar>
        {[...Array(maxRating)].map((_, index) => (
          <Button
            key={index}
            onPress={() => handleRatingClick(index + 1)}
            className={ratingButtonRecipe({
              selected: selectedRating === index + 1,
              borderLeft: index != 0,
            })}
          >
            {index + 1}
          </Button>
        ))}
      </Bar>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <Text variant="sm" className={labelRecipe()}>
          {minLabel}
        </Text>
        <Text variant="sm" className={labelRecipe()}>
          {maxLabel}
        </Text>
      </div>
      <Button
        variant="primary"
        size="sm"
        fullWidth
        isDisabled={!selectedRating}
        onPress={onSubmit}
      >
        {t('submit')}
      </Button>
    </Card>
  )
}
