/**
 * Helper utilities for working with facilitation service documents
 */

import type { DocumentRequirement, DocumentCategory, FacilitationService } from '@/components/data/facilitationServicesData';

/**
 * Filters documents based on conditional logic
 * @param documents - Array of document requirements
 * @param formData - Form data object with user inputs
 * @returns Filtered array of documents that should be collected
 */
export function getRequiredDocuments(
  documents: DocumentRequirement[],
  formData: Record<string, any>
): DocumentRequirement[] {
  return documents.filter((doc) => {
    // If document has no condition, include it if it's marked as required
    if (!doc.condition) {
      return doc.required;
    }

    // Check if condition is met
    const fieldValue = formData[doc.condition.field];
    const conditionValue = doc.condition.value;

    switch (doc.condition.operator) {
      case 'equals':
        return fieldValue === conditionValue;
      case 'notEquals':
        return fieldValue !== conditionValue;
      case 'includes':
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(conditionValue);
        }
        return String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase());
      case 'greaterThan':
        return Number(fieldValue) > Number(conditionValue);
      case 'lessThan':
        return Number(fieldValue) < Number(conditionValue);
      default:
        return false;
    }
  });
}

/**
 * Groups documents by category
 * @param documents - Array of document requirements
 * @param categories - Array of document categories
 * @returns Object with category IDs as keys and arrays of documents as values
 */
export function groupDocumentsByCategory(
  documents: DocumentRequirement[],
  categories: DocumentCategory[]
): Record<string, { category: DocumentCategory; documents: DocumentRequirement[] }> {
  const grouped: Record<string, { category: DocumentCategory; documents: DocumentRequirement[] }> = {};

  // Initialize categories
  categories.forEach((category) => {
    grouped[category.id] = {
      category,
      documents: [],
    };
  });

  // Group documents
  documents.forEach((doc) => {
    if (grouped[doc.category]) {
      grouped[doc.category].documents.push(doc);
    }
  });

  return grouped;
}

/**
 * Gets all required documents for a service based on form data
 * @param service - The facilitation service
 * @param formData - Form data object with user inputs
 * @returns Array of required documents with conditional logic applied
 */
export function getServiceRequiredDocuments(
  service: FacilitationService,
  formData: Record<string, any> = {}
): DocumentRequirement[] {
  const allDocuments = service.requiredDocuments;
  const requiredDocs = getRequiredDocuments(allDocuments, formData);
  
  // Also include conditionally required documents that meet their conditions
  const conditionalDocs = allDocuments.filter((doc) => {
    if (!doc.condition) return false;
    
    const fieldValue = formData[doc.condition.field];
    const conditionValue = doc.condition.value;

    switch (doc.condition.operator) {
      case 'equals':
        return fieldValue === conditionValue;
      case 'notEquals':
        return fieldValue !== conditionValue;
      case 'includes':
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(conditionValue);
        }
        return String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase());
      case 'greaterThan':
        return Number(fieldValue) > Number(conditionValue);
      case 'lessThan':
        return Number(fieldValue) < Number(conditionValue);
      default:
        return false;
    }
  });

  // Combine and deduplicate
  const allRequired = [...requiredDocs, ...conditionalDocs];
  return Array.from(new Map(allRequired.map((doc) => [doc.id, doc])).values());
}

/**
 * Gets document categories with their documents
 * @param service - The facilitation service
 * @param  formData - Form data object with user inputs
 * @returns Array of categories with their filtered documents
 */
export function getCategorizedDocuments(
  service: FacilitationService,
  formData: Record<string, any> = {}
): Array<{ category: DocumentCategory; documents: DocumentRequirement[] }> {
  const requiredDocs = getServiceRequiredDocuments(service, formData);
  const categories = service.documentCategories || [];
  const grouped = groupDocumentsByCategory(requiredDocs, categories);

  return Object.values(grouped)
    .filter((group) => group.documents.length > 0)
    .sort((a, b) => a.category.order - b.category.order);
}

/**
 * Validates if all required documents are provided
 * @param documents - Array of document requirements
 * @param uploadedDocumentIds - Array of document IDs that have been uploaded
 * @returns Object with validation result and missing documents
 */
export function validateDocuments(
  documents: DocumentRequirement[],
  uploadedDocumentIds: string[]
): { isValid: boolean; missingDocuments: DocumentRequirement[] } {
  const requiredDocs = documents.filter((doc) => doc.required || doc.condition);
  const missingDocuments = requiredDocs.filter((doc) => !uploadedDocumentIds.includes(doc.id));

  return {
    isValid: missingDocuments.length === 0,
    missingDocuments,
  };
}

/**
 * Generates a checklist for document collection
 * @param service - The facilitation service
 * @param formData - Form data object with user inputs
 * @returns Formatted checklist string
 */
export function generateDocumentChecklist(
  service: FacilitationService,
  formData: Record<string, any> = {}
): string {
  const categorized = getCategorizedDocuments(service, formData);
  
  let checklist = `Document Checklist for ${service.title}\n`;
  checklist += `${'='.repeat(50)}\n\n`;

  categorized.forEach(({ category, documents }) => {
    checklist += `${category.name}\n`;
    checklist += `${'-'.repeat(category.name.length)}\n`;
    if (category.description) {
      checklist += `${category.description}\n`;
    }
    checklist += `\n`;

    documents.forEach((doc, index) => {
      checklist += `${index + 1}. ${doc.name}${doc.required ? ' *' : ''}\n`;
      if (doc.description) {
        checklist += `   ${doc.description}\n`;
      }
      if (doc.copies && doc.copies > 1) {
        checklist += `   Copies needed: ${doc.copies}\n`;
      }
      if (doc.formats && doc.formats.length > 0) {
        checklist += `   Formats: ${doc.formats.join(', ')}\n`;
      }
      if (doc.alternatives && doc.alternatives.length > 0) {
        checklist += `   Alternatives: ${doc.alternatives.join(' OR ')}\n`;
      }
      if (doc.notes) {
        checklist += `   Note: ${doc.notes}\n`;
      }
      checklist += `\n`;
    });

    checklist += `\n`;
  });

  checklist += `\n* Required document\n`;
  checklist += `\nTotal documents to prepare: ${categorized.reduce((sum, cat) => sum + cat.documents.length, 0)}\n`;

  return checklist;
}

/**
 * Export types for external use
 */
export type { DocumentRequirement, DocumentCategory, FacilitationService };
