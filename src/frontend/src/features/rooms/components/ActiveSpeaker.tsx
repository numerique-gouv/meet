import { styled } from '@/styled-system/jsx'

const StyledContainer = styled('div', {
  base: {
    width: '24px',
    height: '24px',
    boxSizing: 'border-box',
    backgroundColor: 'primary',
    borderRadius: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
  },
})

const StyledChild = styled('div', {
  base: {
    backgroundColor: 'white',
    width: '4px',
    height: '4px',
    borderRadius: '4px',
    animationDuration: '400ms',
    animationName: 'active_speaker',
    animationIterationCount: 'infinite',
    animationDirection: 'alternate',
  },
  variants: {
    active: {
      true: {
        animationIterationCount: 'infinite',
      },
      false: {
        animationIterationCount: 0,
      },
    },
    size: {
      small: {
        animationName: 'active_speake_small',
      },
    },
  },
})

export const ActiveSpeaker = ({ isSpeaking }: { isSpeaking: boolean }) => {
  return (
    <StyledContainer>
      <StyledChild
        active={isSpeaking}
        size="small"
        style={{
          animationDelay: '300ms',
        }}
      />
      <StyledChild
        active={isSpeaking}
        style={{
          animationDelay: '100ms',
        }}
      />
      <StyledChild
        active={isSpeaking}
        size="small"
        style={{
          animationDelay: '500ms',
        }}
      />
    </StyledContainer>
  )
}
