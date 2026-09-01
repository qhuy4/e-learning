import { useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"

interface UseCreateFormOptions<TForm extends Record<string, unknown>, TOutput> {
    emptyForm: TForm
    validate: (form: TForm) => Record<string, string | undefined>
    buildOutput: (form: TForm) => TOutput
    create: (output: TOutput) => Promise<unknown>
    successMessage: string
    redirectTo: string
}

interface UseCreateFormReturn<TForm extends Record<string, unknown>> {
    form: TForm
    errors: Record<string, string | undefined>
    submitting: boolean
    setField: <K extends keyof TForm>(key: K, value: TForm[K]) => void
    handleSubmit: (e: React.FormEvent) => Promise<void>
}

export function  useCreateForm<TForm extends Record<string, unknown>, TOutput>({
    emptyForm,
    validate,
    buildOutput,
    create,
    successMessage,
    redirectTo,
}: UseCreateFormOptions<TForm, TOutput>): UseCreateFormReturn<TForm> {
    const navigate = useNavigate()
    const [form, setForm] = useState<TForm>(emptyForm)
    const [errors, setErrors] = useState<Record<string, string | undefined>>({})

    function setField<K extends keyof TForm>(key: K, value: TForm[K]) {
        setForm((prev) => ({ ...prev, [key]: value }))
        if (key in errors) {
            setErrors((prev) => ({ ...prev, [key]: undefined }))
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        const validationErrors = validate(form)
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        setErrors({})

        try {
            const output = buildOutput(form)
            await create(output)
            toast.success(successMessage)
            navigate(redirectTo)
        } catch (err) {
            setErrors({
                submit: err instanceof Error ? err.message : "An unexpected error occurred",
            })
        }
    }

    return { form, errors, setField, handleSubmit }
}