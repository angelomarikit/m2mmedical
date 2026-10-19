import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase'
import { COMPANY } from '@/lib/constants'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { AdminCard } from '../components/AdminCard'
import { FormField } from '../components/FormField'
import { SaveBanner } from '../components/SaveBanner'
import { useLogoUrl } from '@/hooks/useSiteSettings'

type CompanyForm = {
  name: string
  tagline: string
  phone: string
  email: string
  website: string
  biomedUrl: string
  address: string
}

type SeoForm = {
  defaultTitle: string
  defaultDescription: string
}

export function AdminSettingsPage() {
  const qc = useQueryClient()
  const logoUrl = useLogoUrl()
  const [notice, setNotice] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)

  const { data: companySetting, isLoading } = useQuery({
    queryKey: ['admin-settings-company'],
    queryFn: async () => {
      const { data } = await supabase.from('site_settings').select('*').eq('key', 'company').maybeSingle()
      const v = (data?.value_json ?? {}) as Record<string, unknown>
      return {
        name: String(v.name ?? COMPANY.name),
        tagline: String(v.tagline ?? COMPANY.tagline),
        phone: String(v.phone ?? COMPANY.phone),
        email: String(v.email ?? COMPANY.email),
        website: String(v.website ?? COMPANY.website),
        biomedUrl: String(v.biomedUrl ?? COMPANY.biomedUrl),
        address: Array.isArray(v.addressLines)
          ? (v.addressLines as string[]).join('\n')
          : COMPANY.addressLines.join('\n'),
      } satisfies CompanyForm
    },
  })

  const { data: seoSetting } = useQuery({
    queryKey: ['admin-settings-seo'],
    queryFn: async () => {
      const { data } = await supabase.from('site_settings').select('*').eq('key', 'seo').maybeSingle()
      const v = (data?.value_json ?? {}) as Record<string, unknown>
      return {
        defaultTitle: String(v.defaultTitle ?? `${COMPANY.name} | ${COMPANY.tagline}`),
        defaultDescription: String(
          v.defaultDescription ??
            'Quality medical equipment, accessories, and healthcare supplies for hospitals and clinics.',
        ),
      } satisfies SeoForm
    },
  })

  const companyForm = useForm<CompanyForm>()
  const seoForm = useForm<SeoForm>()

  useEffect(() => {
    if (companySetting) companyForm.reset(companySetting)
  }, [companySetting, companyForm])

  useEffect(() => {
    if (seoSetting) seoForm.reset(seoSetting)
  }, [seoSetting, seoForm])

  const saveCompany = useMutation({
    mutationFn: async (values: CompanyForm) => {
      const phoneTel = values.phone.replace(/[^\d+]/g, '')
      const value_json = {
        name: values.name,
        tagline: values.tagline,
        phone: values.phone,
        phoneTel: phoneTel.startsWith('+') ? phoneTel : `+${phoneTel}`,
        email: values.email,
        website: values.website,
        biomedUrl: values.biomedUrl,
        addressLines: values.address
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean),
      }
      const { error } = await supabase.from('site_settings').upsert({ key: 'company', value_json })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-settings-company'] })
      qc.invalidateQueries({ queryKey: ['site-settings'] })
      setNotice('Company settings saved successfully.')
    },
    onError: () => setNotice('Could not save company settings. Please try again.'),
  })

  const saveSeo = useMutation({
    mutationFn: async (values: SeoForm) => {
      const { error } = await supabase.from('site_settings').upsert({
        key: 'seo',
        value_json: values,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-settings-seo'] })
      qc.invalidateQueries({ queryKey: ['site-settings'] })
      setNotice('SEO settings saved successfully.')
    },
    onError: () => setNotice('Could not save SEO settings.'),
  })

  async function onLogoUpload(file: File) {
    setLogoUploading(true)
    setNotice(null)
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
      const path = `logo.${ext}`
      const { error: upErr } = await supabase.storage.from('website-assets').upload(path, file, {
        upsert: true,
        contentType: file.type,
      })
      if (upErr) throw upErr
      await supabase.from('site_settings').upsert({
        key: 'branding',
        value_json: { logo_storage_path: path },
      })
      qc.invalidateQueries({ queryKey: ['site-settings'] })
      setNotice('Logo uploaded. It will appear in the header and footer on the public site.')
    } catch {
      setNotice('Logo upload failed. Check storage permissions and try again.')
    } finally {
      setLogoUploading(false)
    }
  }

  if (isLoading) {
    return <p className="text-sm text-text-muted">Loading settings…</p>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text">Site settings</h1>
        <p className="mt-2 text-sm text-text-muted">
          Update company details, contact information, and SEO defaults. Changes apply across the public website.
        </p>
      </div>

      <SaveBanner message={notice} tone={notice?.includes('failed') || notice?.includes('Could not') ? 'error' : 'success'} />

      <form onSubmit={companyForm.handleSubmit((v) => saveCompany.mutate(v))}>
        <AdminCard title="Company profile" description="Legal name and brand tagline shown in the footer and metadata.">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Company name" htmlFor="company-name">
              <Input id="company-name" {...companyForm.register('name', { required: true })} />
            </FormField>
            <FormField label="Tagline" htmlFor="company-tagline">
              <Input id="company-tagline" {...companyForm.register('tagline', { required: true })} />
            </FormField>
          </div>
        </AdminCard>

        <AdminCard
          title="Contact information"
          description="Phone, email, and addresses used on Contact and footer."
          className="mt-8"
        >
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Phone" htmlFor="company-phone">
                <Input id="company-phone" {...companyForm.register('phone', { required: true })} />
              </FormField>
              <FormField label="Email" htmlFor="company-email">
                <Input id="company-email" type="email" {...companyForm.register('email', { required: true })} />
              </FormField>
              <FormField label="Website URL" htmlFor="company-website">
                <Input id="company-website" {...companyForm.register('website', { required: true })} />
              </FormField>
              <FormField label="Biomedical services URL" htmlFor="company-biomed">
                <Input id="company-biomed" {...companyForm.register('biomedUrl', { required: true })} />
              </FormField>
            </div>
            <FormField label="Office address" hint="Enter each line of the address on a new line." htmlFor="company-address">
              <Textarea id="company-address" rows={4} {...companyForm.register('address', { required: true })} />
            </FormField>
            <div className="flex justify-end">
              <Button type="submit" disabled={saveCompany.isPending}>
                {saveCompany.isPending ? 'Saving…' : 'Save company & contact'}
              </Button>
            </div>
          </div>
        </AdminCard>
      </form>

      <AdminCard title="Logo" description="Upload a PNG or SVG for the header and admin. Recommended: transparent background.">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-24 w-48 items-center justify-center rounded-lg border border-border bg-surface-alt p-3">
            <img src={logoUrl} alt="Current logo preview" className="max-h-full max-w-full object-contain" />
          </div>
          <div>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-border bg-white px-4 py-2 text-sm font-medium hover:border-brand hover:text-brand">
              {logoUploading ? 'Uploading…' : 'Choose logo file'}
              <input
                type="file"
                accept="image/png,image/svg+xml,image/jpeg,image/webp"
                className="hidden"
                disabled={logoUploading}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) void onLogoUpload(f)
                }}
              />
            </label>
            <p className="mt-2 text-xs text-text-muted">
              PNG or SVG with a transparent background works best. Changes apply site-wide after upload.
            </p>
          </div>
        </div>
      </AdminCard>

      <AdminCard title="SEO defaults" description="Default title and description when a page does not set its own.">
        <form className="grid gap-4" onSubmit={seoForm.handleSubmit((v) => saveSeo.mutate(v))}>
          <FormField label="Default page title" htmlFor="seo-title">
            <Input id="seo-title" {...seoForm.register('defaultTitle', { required: true })} />
          </FormField>
          <FormField label="Default meta description" htmlFor="seo-desc">
            <Textarea id="seo-desc" rows={3} {...seoForm.register('defaultDescription', { required: true })} />
          </FormField>
          <div className="flex justify-end">
            <Button type="submit" disabled={saveSeo.isPending}>
              {saveSeo.isPending ? 'Saving…' : 'Save SEO settings'}
            </Button>
          </div>
        </form>
      </AdminCard>
    </div>
  )
}
