import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { AdminCard } from '../components/AdminCard'
import { FormField } from '../components/FormField'
import { SaveBanner } from '../components/SaveBanner'
import { AdminDeleteButton } from '../components/AdminDeleteButton'

type HeroForm = {
  heading: string
  subheading: string
  primaryCta: string
  primaryHref: string
  secondaryCta: string
  secondaryHref: string
}

interface SectionRow {
  id: string
  section_key: string
  section_type: string
  content_json: Record<string, unknown>
  sort_order: number
  is_visible: boolean
}

export function AdminPageSectionsPage() {
  const qc = useQueryClient()
  const [notice, setNotice] = useState<string | null>(null)

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['admin-sections'],
    queryFn: async () => {
      const { data: page } = await supabase.from('pages').select('id').eq('slug', 'home').maybeSingle()
      if (!page) return [] as SectionRow[]
      const { data, error } = await supabase
        .from('page_sections')
        .select('*')
        .eq('page_id', page.id)
        .order('sort_order')
      if (error) throw error
      return (data ?? []) as SectionRow[]
    },
  })

  const heroSection = sections.find((s) => s.section_key === 'hero')

  const heroForm = useForm<HeroForm>({
    defaultValues: {
      heading: 'Medical Equipment & Healthcare Solutions',
      subheading: 'Quality Medical Products for Hospitals and Healthcare Professionals.',
      primaryCta: 'Browse Products',
      primaryHref: '/products',
      secondaryCta: 'Request Quotation',
      secondaryHref: '/products',
    },
  })

  const [heroVisible, setHeroVisible] = useState(true)

  useEffect(() => {
    if (!heroSection) return
    const c = heroSection.content_json as HeroForm
    heroForm.reset({
      heading: String(c.heading ?? ''),
      subheading: String(c.subheading ?? ''),
      primaryCta: String(c.primaryCta ?? ''),
      primaryHref: String(c.primaryHref ?? '/products'),
      secondaryCta: String(c.secondaryCta ?? ''),
      secondaryHref: String(c.secondaryHref ?? '/products'),
    })
    setHeroVisible(heroSection.is_visible)
  }, [heroSection, heroForm])

  const deleteSection = useMutation({
    mutationFn: async (sectionId: string) => {
      const { error } = await supabase.from('page_sections').delete().eq('id', sectionId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-sections'] })
      qc.invalidateQueries({ queryKey: ['page-sections'] })
      setNotice('Section deleted.')
    },
    onError: () => setNotice('Could not delete section.'),
  })

  const saveHero = useMutation({
    mutationFn: async (payload: { content_json: HeroForm; is_visible: boolean }) => {
      if (!heroSection) {
        const { data: page, error: pageErr } = await supabase.from('pages').select('id').eq('slug', 'home').single()
        if (pageErr || !page) throw pageErr ?? new Error('Home page not found')
        const { error } = await supabase.from('page_sections').insert({
          page_id: page.id,
          section_key: 'hero',
          section_type: 'hero',
          content_json: payload.content_json,
          sort_order: 0,
          is_visible: payload.is_visible,
        })
        if (error) throw error
        return
      }
      const { error } = await supabase
        .from('page_sections')
        .update({
          content_json: payload.content_json,
          is_visible: payload.is_visible,
        })
        .eq('id', heroSection.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-sections'] })
      qc.invalidateQueries({ queryKey: ['page-sections'] })
      setNotice('Homepage hero saved. View the public homepage to confirm.')
    },
    onError: () => setNotice('Could not save homepage section.'),
  })

  async function createHomePageIfMissing() {
    await supabase.from('pages').upsert({ slug: 'home', title: 'Home', status: 'published' }, { onConflict: 'slug' })
    qc.invalidateQueries({ queryKey: ['admin-sections'] })
    setNotice('Home page record created. You can now edit the hero section.')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text">Homepage editor</h1>
        <p className="mt-2 text-sm text-text-muted">
          Edit homepage content using the fields below. No technical JSON editing is required.
        </p>
      </div>

      <SaveBanner message={notice} tone={notice?.includes('Could not') ? 'error' : 'success'} />

      {isLoading && <p className="text-sm text-text-muted">Loading sections…</p>}

      {!isLoading && !heroSection && sections.length === 0 && (
        <AdminCard title="Setup homepage" description="Create the homepage record to start editing sections.">
          <Button type="button" onClick={() => void createHomePageIfMissing()}>
            Create homepage
          </Button>
        </AdminCard>
      )}

      <AdminCard
        title="Hero section"
        description="Main banner at the top of the homepage — headline, text, and buttons."
      >
        <form
          className="space-y-5"
          onSubmit={heroForm.handleSubmit((values) =>
            saveHero.mutate({ content_json: values, is_visible: heroVisible }),
          )}
        >
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={heroVisible}
              onChange={(e) => setHeroVisible(e.target.checked)}
            />
            Show hero section on homepage
          </label>

          <FormField label="Headline" htmlFor="hero-heading">
            <Input id="hero-heading" {...heroForm.register('heading', { required: true })} />
          </FormField>

          <FormField label="Supporting text" htmlFor="hero-sub">
            <Textarea id="hero-sub" rows={3} {...heroForm.register('subheading', { required: true })} />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Primary button label" htmlFor="hero-pcta">
              <Input id="hero-pcta" {...heroForm.register('primaryCta', { required: true })} />
            </FormField>
            <FormField label="Primary button link" hint="Example: /products" htmlFor="hero-phref">
              <Input id="hero-phref" {...heroForm.register('primaryHref', { required: true })} />
            </FormField>
            <FormField label="Secondary button label" htmlFor="hero-scta">
              <Input id="hero-scta" {...heroForm.register('secondaryCta', { required: true })} />
            </FormField>
            <FormField label="Secondary button link" htmlFor="hero-shref">
              <Input id="hero-shref" {...heroForm.register('secondaryHref', { required: true })} />
            </FormField>
          </div>

          <p className="text-xs text-text-muted">
            Hero banner image is currently managed in code at <code className="text-text">public/hero-equipment.jpg</code>.
            Media library upload for hero images can be added in a future update.
          </p>

          <div className="flex flex-wrap gap-3 border-t border-border pt-5">
            <Button type="submit" disabled={saveHero.isPending}>
              {saveHero.isPending ? 'Saving…' : 'Save hero section'}
            </Button>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center rounded-md border border-border px-5 text-sm font-medium hover:border-brand hover:text-brand"
            >
              Preview homepage
            </a>
          </div>
        </form>
      </AdminCard>

      {sections.filter((s) => s.section_key !== 'hero').length > 0 && (
        <AdminCard title="Other sections" description="Additional homepage blocks. Editor forms can be added later; you can remove sections here.">
          <ul className="space-y-3 text-sm">
            {sections
              .filter((s) => s.section_key !== 'hero')
              .map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
                  <span>
                    {s.section_key}{' '}
                    <span className="text-text-muted">({s.section_type})</span>
                  </span>
                  <AdminDeleteButton
                    confirmMessage={`Delete homepage section “${s.section_key}”?`}
                    onDelete={async () => {
                      await deleteSection.mutateAsync(s.id)
                    }}
                  />
                </li>
              ))}
          </ul>
        </AdminCard>
      )}
    </div>
  )
}
