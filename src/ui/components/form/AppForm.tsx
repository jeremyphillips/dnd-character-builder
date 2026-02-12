import { FormProvider, useForm, type DefaultValues, type FieldValues } from 'react-hook-form'
import { Stack } from '@mui/material'

type AppFormProps<T extends FieldValues> = {
  defaultValues: DefaultValues<T>
  onSubmit: (data: T) => void
  children: React.ReactNode
  spacing?: number
}

export default function AppForm<T extends FieldValues>({
  defaultValues,
  onSubmit,
  children,
  spacing = 3
}: AppFormProps<T>) {
  const methods = useForm<T>({
    defaultValues,
    mode: 'onBlur'
  })

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
        <Stack spacing={spacing}>
          {children}
        </Stack>
      </form>
    </FormProvider>
  )
}
