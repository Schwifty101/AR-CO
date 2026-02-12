import {
  facilitationServices,
  facilitationRegistrationForm,
  commonDocuments as facilitationDocuments,
  type FacilitationService,
  type FormSection,
} from '@/components/data/facilitationCenterData'

import {
  overseasServices,
  overseasRegistrationForm,
  type OverseasService,
} from '@/components/data/overseasServicesData'

import {
  womenDeskServices,
  womenDeskRegistrationForm,
  type WomenDeskService,
} from '@/components/data/womenDeskData'

import {
  regulatoryServices,
  regulatoryServiceForm,
  type RegulatoryService,
} from '@/components/data/regulatoryServiceData'

export type ServiceType =
  | FacilitationService
  | OverseasService
  | WomenDeskService
  | RegulatoryService

export type CategoryType = 'facilitation' | 'overseas' | 'women-desk' | 'regulatory'

interface CategoryData {
  services: ServiceType[]
  form: FormSection[]
  documents?: any[]
}

/**
 * Maps category to its respective services, forms, and documents
 */
export function getCategoryData(category: CategoryType): CategoryData | null {
  switch (category) {
    case 'facilitation':
      return {
        services: facilitationServices,
        form: facilitationRegistrationForm,
        documents: facilitationDocuments,
      }
    case 'overseas':
      return {
        services: overseasServices,
        form: overseasRegistrationForm,
      }
    case 'women-desk':
      return {
        services: womenDeskServices,
        form: womenDeskRegistrationForm,
      }
    case 'regulatory':
      return {
        services: regulatoryServices,
        form: regulatoryServiceForm,
      }
    default:
      return null
  }
}

/**
 * Finds a service by slug within a specific category
 */
export function findServiceBySlug(
  category: CategoryType,
  slug: string
): ServiceType | undefined {
  const categoryData = getCategoryData(category)
  if (!categoryData) return undefined

  return categoryData.services.find((service) => {
    // Convert service id to slug format (replace underscores with hyphens)
    const serviceSlug = service.id.replace(/_/g, '-')
    return serviceSlug === slug
  })
}

/**
 * Get form sections for a specific category
 */
export function getCategoryForm(category: CategoryType): FormSection[] {
  const categoryData = getCategoryData(category)
  return categoryData?.form || []
}

/**
 * Get documents for a specific category (if available)
 */
export function getCategoryDocuments(category: CategoryType): any[] {
  const categoryData = getCategoryData(category)
  return categoryData?.documents || []
}

/**
 * Validates if a category is valid
 */
export function isValidCategory(category: string): category is CategoryType {
  return ['facilitation', 'overseas', 'women-desk', 'regulatory'].includes(category)
}
