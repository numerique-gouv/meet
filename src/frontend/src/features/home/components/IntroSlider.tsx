import firstSlide from '@/assets/intro-slider/1.png'
import { styled, VStack } from '@/styled-system/jsx'

const Heading = styled('h2', {
  base: {
    width: 'fit-content',
    marginBottom: 0,
    fontSize: '1.5rem',
    marginTop: '0.75rem',
    lineHeight: '2rem',
    maxWidth: '23rem',
    textAlign: 'center',
    textWrap: 'pretty',
  },
})

const Body = styled('p', {
  base: {
    maxWidth: '23rem',
    textAlign: 'center',
    textWrap: 'pretty',
    lineHeight: '1.2rem',
    fontSize: '1rem',
  },
})

const Image = styled('img', {
  base: {
    maxHeight: '330px',
    height: '100%',
    width: 'fit-content',
  },
})

// todo - refactor it in a proper slider, only displaying a single slide yet
export const IntroSlider = () => {
  return (
    <>
      <Image src={firstSlide} alt="" />
      <VStack justify={'center'} gap={0.5}>
        <Heading>Essayez Visio pour simplifier votre quotidien</Heading>
        <Body>
          Découvrez une solution intuitive et accessible, conçue pour tous les
          agents publics et leurs partenaires, et bien plus encore.
        </Body>
      </VStack>
    </>
  )
}
