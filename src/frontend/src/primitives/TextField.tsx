import { styled } from '@/styled-system/jsx'
import {
  Label,
  Input,
  TextField as RACTextField,
  Text,
  FieldError,
} from 'react-aria-components'

const StyledRACTextField = styled(RACTextField, {
  base: {
    marginBottom: 'textfield',
  },
})

const StyledLabel = styled(Label, {
  base: {
    display: 'block',
  },
})

const StyledInput = styled(Input, {
  base: {
    width: 'full',
    paddingY: 0.125,
    paddingX: 0.25,
    border: '1px solid',
    borderColor: 'control.border',
    color: 'control.text',
    borderRadius: 4,
  },
})

const StyledDescription = styled(Text, {
  base: {
    display: 'block',
    textStyle: 'sm',
    color: 'default.subtle-text',
    marginTop: 0.125,
  },
})

const StyledFieldError = styled(FieldError, {
  base: {
    display: 'block',
    textStyle: 'sm',
    color: 'danger',
    marginTop: 0.125,
  },
})

export const TextField = ({ validate, label, description, ...inputProps }) => {
  const labelFor = inputProps.id
  return (
    <StyledRACTextField validate={validate}>
      <StyledLabel htmlFor={labelFor}>{label}</StyledLabel>
      <StyledInput {...inputProps} />
      <StyledDescription slot="description">{description}</StyledDescription>
      <StyledFieldError />
    </StyledRACTextField>
  )
}
