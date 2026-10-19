import { useQuery } from '@tanstack/react-query'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import type { PageSection } from '@/types/database'

export function usePageSections(pageSlug: string) {
  return useQuery({
    queryKey: ['page-sections', pageSlug],
    queryFn: async () => {
      if (!isSupabaseConfigured) return [] as PageSection[]
      const { data: page, error: pageError } = await supabase
        .from('pages')
        .select('id')
        .eq('slug', pageSlug)
        .eq('status', 'published')
        .maybeSingle()
      if (pageError) throw pageError
      if (!page) return []
      const { data, error } = await supabase
        .from('page_sections')
        .select('*')
        .eq('page_id', page.id)
        .eq('is_visible', true)
        .order('sort_order')
      if (error) throw error
      return (data ?? []) as PageSection[]
    },
  })
}

export function getSectionContent<T extends Record<string, unknown>>(
  sections: PageSection[] | undefined,
  key: string,
  fallback: T,
): T {
  const section = sections?.find((s) => s.section_key === key)
  if (!section?.content_json) return fallback
  return { ...fallback, ...(section.content_json as T) }
}
