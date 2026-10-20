import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AdminCard } from './AdminCard'
import { FormField } from './FormField'
import { SaveBanner } from './SaveBanner'

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, 'Use at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your new password'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type PasswordForm = z.infer<typeof passwordSchema>

export function AdminChangePasswordCard() {
  const [notice, setNotice] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const form = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  async function onSubmit(values: PasswordForm) {
    setSaving(true)
    setNotice(null)
    try {
      const { error } = await supabase.auth.updateUser({ password: values.newPassword })
      if (error) throw error
      form.reset()
      setNotice('Password updated successfully.')
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not update password.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminCard title="Change password" description="Update your admin sign-in password.">
      <SaveBanner message={notice} tone={notice?.includes('successfully') ? 'success' : 'error'} />
      <form className="max-w-md space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField label="New password" htmlFor="settings-new-password" hint="Minimum 8 characters.">
          <Input
            id="settings-new-password"
            type="password"
            autoComplete="new-password"
            {...form.register('newPassword')}
          />
        </FormField>
        <FormField label="Confirm new password" htmlFor="settings-confirm-password">
          <Input
            id="settings-confirm-password"
            type="password"
            autoComplete="new-password"
            {...form.register('confirmPassword')}
          />
        </FormField>
        <Button type="submit" disabled={saving}>
          {saving ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </AdminCard>
  )
}
