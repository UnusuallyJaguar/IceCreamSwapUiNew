import { z } from 'zod'

export const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })

export const schema = z.object({
  tokenAddress: z.string().length(42, 'Invalid Token Address'),
  tokenName: z.string().min(1, 'Token name must be at least 1 character'),
  tokenSymbol: z.string().min(1, 'Token symbol must be at least 1 character'),
  tokenDecimals: z
    .string()
    .or(z.number())
    .refine((value) => Number(value) >= 0 && Number(value) <= 18, 'Token decimals must be between 0 and 24')
    .transform(Number),
  logo: z
    .any()
    .transform(async (value) => ({ fileName: value[0].name, blob: await toBase64(value[0]) }))
    .optional(),
})

export type FormValues = z.infer<typeof schema>
