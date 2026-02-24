'use client'

import { use, useState, useRef, useCallback } from 'react'
import { notFound, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  isValidCategory,
  findServiceBySlug,
  getCategoryDocuments,
  type CategoryType,
} from '@/lib/categoryDataMapper'

interface PageProps {
  params: Promise<{ category: string; slug: string }>
}

/** Slide animation variants */
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
}

/** Uploaded file with preview URL */
interface UploadedFile {
  file: File
  previewUrl: string | null
}

/** Check if file is an image for preview */
function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

/** Format file size */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Step 3: Required documents with upload interface */
export default function ServiceDocuments({ params }: PageProps) {
  const { category, slug } = use(params)

  const router = useRouter()

  // All hooks must be called before any conditional returns
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile[]>>({})
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Validate category
  const categoryValid = isValidCategory(category)
  const service = categoryValid ? findServiceBySlug(category as CategoryType, slug) : null
  const documents = categoryValid ? getCategoryDocuments(category as CategoryType) : []
  const total = documents.length

  const currentDoc = total > 0 ? documents[currentIndex] : null
  const currentDocId = currentDoc?.id ?? ''
  const currentFiles = uploadedFiles[currentDocId] ?? []
  const isFirst = currentIndex === 0
  const isLast = total > 0 ? currentIndex === total - 1 : true

  const goNext = useCallback(() => {
    if (isLast) return
    if (currentDoc?.required && currentFiles.length === 0) {
      setUploadError('This document is required — please upload at least one file before proceeding.')
      return
    }
    setUploadError(null)
    setDirection(1)
    setCurrentIndex((i) => i + 1)
  }, [isLast, currentDoc, currentFiles])

  const goBack = useCallback(() => {
    if (isFirst) return
    setUploadError(null)
    setDirection(-1)
    setCurrentIndex((i) => i - 1)
  }, [isFirst])

  /** Validates all required docs are uploaded, sets sessionStorage flag, navigates to form. */
  const handleContinueToForm = useCallback(() => {
    if (currentDoc?.required && currentFiles.length === 0) {
      setUploadError('This document is required — please upload at least one file to continue.')
      return
    }
    setUploadError(null)
    sessionStorage.setItem(`docs_completed_${category}_${slug}`, 'true')
    router.push(`/services/${category}/${slug}/form`)
  }, [currentDoc, currentFiles, category, slug, router])

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
        file,
        previewUrl: isImageFile(file) ? URL.createObjectURL(file) : null,
      }))
      setUploadedFiles((prev) => ({
        ...prev,
        [currentDocId]: [...(prev[currentDocId] ?? []), ...newFiles],
      }))
      setUploadError(null)
    },
    [currentDocId]
  )

  const removeFile = useCallback(
    (index: number) => {
      setUploadedFiles((prev) => {
        const existing = prev[currentDocId] ?? []
        const removed = existing[index]
        if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl)
        return {
          ...prev,
          [currentDocId]: existing.filter((_, i) => i !== index),
        }
      })
    },
    [currentDocId]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files)
      }
    },
    [addFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files)
        e.target.value = ''
      }
    },
    [addFiles]
  )

  // Early returns after all hooks
  if (!categoryValid) return notFound()
  if (!service) return notFound()
  if (!currentDoc) return notFound()

  return (
    <div className="px-4 md:px-12 lg:px-20 pt-2 md:pt-4 pb-16 md:pb-24">
      <style jsx global>{`
        .doc-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .doc-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .doc-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.15);
          border-radius: 2px;
        }
        .doc-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.25);
        }
        .doc-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(212, 175, 55, 0.15) transparent;
        }
      `}</style>
      {/* Main container */}
      <div
        className="relative rounded-xl overflow-hidden border"
        style={{
          background: 'transparent',
          borderColor: 'rgba(212, 175, 55, 0.25)',
          boxShadow: 'none',
        }}
      >
        {/* Grain texture overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.3,
            pointerEvents: 'none',
            zIndex: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
            backgroundSize: '256px 256px',
          }}
        />
        {/* Corner decorations */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            width: '24px',
            height: '24px',
            borderTop: '1px solid rgba(212, 175, 55, 0.2)',
            borderLeft: '1px solid rgba(212, 175, 55, 0.2)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            width: '24px',
            height: '24px',
            borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
            borderRight: '1px solid rgba(212, 175, 55, 0.2)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />

        {/* Progress bar at top */}
        <div className="relative h-[2px] w-full" style={{ background: 'rgba(212, 175, 55, 0.15)', zIndex: 2 }}>
          <motion.div
            className="absolute left-0 top-0 h-full"
            style={{ background: 'var(--heritage-gold)' }}
            animate={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          />
        </div>

        {/* Step counter */}
        <div className="px-6 md:px-12 pt-5 pb-2 flex items-center justify-between" style={{ position: 'relative', zIndex: 2 }}>
          <span
            className="text-xs uppercase font-medium"
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: '0.6rem',
              letterSpacing: '0.3em',
              color: 'var(--heritage-gold)',
              opacity: 0.55
            }}
          >
            Document {currentIndex + 1} of {total}
          </span>
          {!currentDoc.required && (
            <span
              className="text-xs uppercase tracking-wider px-2 py-0.5 border"
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: '0.65rem',
                letterSpacing: '0.12em',
                color: 'rgba(249, 248, 246, 0.4)',
                borderColor: 'rgba(249, 248, 246, 0.12)',
                borderRadius: '100px',
              }}
            >
              Optional
            </span>
          )}
        </div>

        {/* Animated content area — responsive height */}
        <div className="relative overflow-hidden min-h-[500px] md:h-[480px]" style={{ position: 'relative', zIndex: 2 }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentDoc.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              className="relative md:absolute md:inset-0 grid grid-cols-1 md:grid-cols-2"
            >
              {/* LEFT SIDE — Document Info */}
              <div className="relative px-6 md:px-12 pb-8 pt-6 md:pt-2 flex flex-col md:overflow-hidden doc-scrollbar md:h-full" style={{}}>
                {/* Document name */}
                <motion.h2
                  className="mb-4"
                  style={{
                    fontFamily: "'Lora', Georgia, serif",
                    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                    fontStyle: 'italic',
                    fontWeight: 300,
                    lineHeight: 1.1,
                    letterSpacing: '-0.03em',
                    color: 'var(--heritage-cream)',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                >
                  {currentDoc.name}
                </motion.h2>

                {/* Description */}
                {currentDoc.description && (
                  <motion.p
                    className="mb-5 max-w-md"
                    style={{
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                      fontSize: '0.85rem',
                      lineHeight: 1.7,
                      color: 'rgba(249, 248, 246, 0.55)',
                      letterSpacing: '0.01em'
                    }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
                  >
                    {currentDoc.description}
                  </motion.p>
                )}

                {/* Upload Specifications */}
                <motion.div
                  className="space-y-1 flex-1"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
                >
                  <h3
                    className="uppercase font-medium mb-3"
                    style={{
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                      fontSize: '0.6rem',
                      letterSpacing: '0.35em',
                      color: 'var(--heritage-gold)',
                      opacity: 0.7
                    }}
                  >
                    Upload Specifications
                  </h3>

                  {/* Required Status */}
                  <div className="flex gap-2.5 items-start">
                    <span className="text-[10px] mt-0.5" style={{ color: 'rgba(249, 248, 246, 0.3)' }}>•</span>
                    <p style={{
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                      fontSize: '0.75rem',
                      fontStyle: 'italic',
                      lineHeight: 1.6,
                      color: 'rgba(249, 248, 246, 0.55)',
                      letterSpacing: '0.01em'
                    }}>
                      <strong style={{ color: currentDoc.required ? 'var(--heritage-gold)' : 'rgba(249, 248, 246, 0.6)', fontWeight: 500 }}>
                        {currentDoc.required ? 'Required' : 'Optional'}
                      </strong> document
                    </p>
                  </div>

                  {/* Supported Formats - placeholder for now */}
                  <div className="flex gap-2.5 items-start">
                    <span className="text-[10px] mt-0.5" style={{ color: 'rgba(249, 248, 246, 0.3)' }}>•</span>
                    <p style={{
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                      fontSize: '0.75rem',
                      fontStyle: 'italic',
                      lineHeight: 1.6,
                      color: 'rgba(249, 248, 246, 0.55)',
                      letterSpacing: '0.01em'
                    }}>
                      Supported formats: PDF, JPG, PNG, DOCX
                    </p>
                  </div>

                  {/* Max file size */}
                  <div className="flex gap-2.5 items-start">
                    <span className="text-[10px] mt-0.5" style={{ color: 'rgba(249, 248, 246, 0.3)' }}>•</span>
                    <p style={{
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                      fontSize: '0.75rem',
                      fontStyle: 'italic',
                      lineHeight: 1.6,
                      color: 'rgba(249, 248, 246, 0.55)',
                      letterSpacing: '0.01em'
                    }}>
                      Maximum file size: 10 MB
                    </p>
                  </div>

                  {/* Multiple files allowed */}
                  <div className="flex gap-2.5 items-start">
                    <span className="text-[10px] mt-0.5" style={{ color: 'rgba(249, 248, 246, 0.3)' }}>•</span>
                    <p style={{
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                      fontSize: '0.75rem',
                      fontStyle: 'italic',
                      lineHeight: 1.6,
                      color: 'rgba(249, 248, 246, 0.55)',
                      letterSpacing: '0.01em'
                    }}>
                      Multiple files can be uploaded
                    </p>
                  </div>
                </motion.div>

                {/* Back button — bottom left (Desktop only) */}
                <div className="mt-6 hidden md:block">
                  {!isFirst && (
                    <button
                      onClick={goBack}
                      className="inline-flex items-center gap-2 transition-all duration-300"
                      style={{
                        padding: '0.65rem 1.25rem',
                        background: 'none',
                        border: '1px solid rgba(249, 248, 246, 0.1)',
                        borderRadius: '100px',
                        color: 'rgba(249, 248, 246, 0.5)',
                        fontFamily: "'Georgia', 'Times New Roman', serif",
                        fontSize: '0.85rem',
                        fontStyle: 'italic',
                        letterSpacing: '0.04em',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(249, 248, 246, 0.25)'
                        e.currentTarget.style.color = 'rgba(249, 248, 246, 0.75)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(249, 248, 246, 0.1)'
                        e.currentTarget.style.color = 'rgba(249, 248, 246, 0.5)'
                      }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                      </svg>
                      <span>Back</span>
                    </button>
                  )}
                </div>
              </div>

              {/* GOLD DIVIDER — vertical, desktop only */}
              <div
                className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px"
                style={{ background: 'var(--heritage-gold)', opacity: 0.15 }}
              />

              {/* Mobile horizontal divider */}
              <div
                className="md:hidden mx-6 h-px mb-6"
                style={{ background: 'var(--heritage-gold)', opacity: 0.15 }}
              />

              {/* RIGHT SIDE — Upload Area */}
              <div className="px-6 md:px-12 pb-8 pt-2 flex flex-col md:h-full" style={{ background: 'transparent' }}>
                {/* Drop zone */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className="hidden md:flex border-2 border-dashed p-8 flex-col items-center justify-center text-center cursor-pointer transition-all duration-300"
                  style={{
                    borderColor: isDragging ? 'var(--heritage-gold)' : 'rgba(212, 175, 55, 0.2)',
                    background: isDragging ? 'rgba(212, 175, 55, 0.03)' : 'rgba(249, 248, 246, 0.01)',
                    borderRadius: '1rem',
                    minHeight: '160px',
                  }}
                >
                  {/* Upload icon */}
                  <svg
                    className="w-8 h-8 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1}
                    style={{ color: isDragging ? 'var(--heritage-gold)' : 'rgba(249, 248, 246, 0.3)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p style={{
                    fontFamily: "'Lora', Georgia, serif",
                    fontSize: '0.95rem',
                    fontWeight: 400,
                    color: 'rgba(249, 248, 246, 0.55)',
                    marginBottom: '0.5rem'
                  }}>
                    Drag & drop files here
                  </p>
                  <p style={{
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    fontSize: '0.72rem',
                    color: 'rgba(249, 248, 246, 0.35)',
                    marginBottom: '1.5rem'
                  }}>
                    or click to browse
                  </p>
                  <p style={{
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    fontSize: '0.7rem',
                    color: 'var(--heritage-gold)',
                    opacity: 0.5,
                    letterSpacing: '0.05em'
                  }}>
                    Accepted: PDF, JPG, PNG, DOCX
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.docx"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </motion.div>

                {/* Mobile Upload Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="md:hidden w-full flex items-center justify-center gap-2 mb-6 transition-all duration-300"
                  style={{
                    padding: '1rem',
                    background: 'rgba(212, 175, 55, 0.1)',
                    border: '1px dashed var(--heritage-gold)',
                    borderRadius: '1rem',
                    color: 'var(--heritage-gold)',
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    fontSize: '0.85rem',
                    fontStyle: 'italic',
                    fontWeight: 500,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                  }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>Upload Document</span>
                </button>

                {/* Required doc error message */}
                {uploadError && (
                  <p
                    role="alert"
                    style={{
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                      fontSize: '0.75rem',
                      fontStyle: 'italic',
                      color: 'rgba(201, 116, 83, 1)',
                      marginTop: '0.75rem',
                      textAlign: 'center',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {uploadError}
                  </p>
                )}

                {/* Uploaded files list */}
                {currentFiles.length > 0 && (
                  <div className="mt-4 space-y-2 flex-1 overflow-y-auto doc-scrollbar" style={{ maxHeight: '200px' }}>
                    {currentFiles.map((uploaded, idx) => (
                      <div
                        key={`${uploaded.file.name}-${idx}`}
                        className="flex items-center gap-3 px-3 py-2 border transition-colors duration-200"
                        style={{
                          background: 'rgba(249, 248, 246, 0.02)',
                          borderColor: 'rgba(249, 248, 246, 0.08)',
                          borderRadius: '100px',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(249, 248, 246, 0.08)' }}
                      >
                        {/* Preview thumbnail or file icon */}
                        {uploaded.previewUrl ? (
                          <img
                            src={uploaded.previewUrl}
                            alt={uploaded.file.name}
                            className="w-6 h-6 rounded object-cover shrink-0"
                          />
                        ) : (
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                            style={{ background: 'rgba(249, 248, 246, 0.06)' }}
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'rgba(249, 248, 246, 0.4)' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                          </div>
                        )}

                        {/* File name & size */}
                        <div className="flex-1 min-w-0">
                          <p className="truncate leading-none mb-0.5" style={{
                            fontFamily: "'Georgia', 'Times New Roman', serif",
                            fontSize: '0.75rem',
                            color: 'var(--heritage-cream)'
                          }}>
                            {uploaded.file.name}
                          </p>
                          <p className="leading-none" style={{
                            fontFamily: "'Georgia', 'Times New Roman', serif",
                            fontSize: '0.65rem',
                            color: 'rgba(249, 248, 246, 0.35)'
                          }}>
                            {formatFileSize(uploaded.file.size)}
                          </p>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile(idx)
                          }}
                          className="shrink-0 p-0.5 rounded transition-colors hover:bg-red-500/10"
                          style={{ color: 'rgba(249, 248, 246, 0.3)' }}
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bottom buttons — Back, Skip & Next */}
                <div className="mt-auto pt-6 flex items-center justify-between md:justify-end gap-3" style={{ borderTop: '1px solid rgba(212, 175, 55, 0.2)', paddingTop: '1.5rem' }}>

                  {/* Mobile Back Button */}
                  {!isFirst && (
                    <button
                      onClick={goBack}
                      className="inline-flex md:hidden items-center gap-2 transition-all duration-300"
                      style={{
                        padding: '0.65rem 1rem', // Smaller padding for mobile fit
                        background: 'none',
                        border: '1px solid rgba(249, 248, 246, 0.1)',
                        borderRadius: '100px',
                        color: 'rgba(249, 248, 246, 0.5)',
                        fontFamily: "'Georgia', 'Times New Roman', serif",
                        fontSize: '0.85rem',
                        fontStyle: 'italic',
                        letterSpacing: '0.04em',
                        cursor: 'pointer',
                      }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                      </svg>
                      {/* Text hidden on very small screens if needed, but keeping for now */}
                      <span>Back</span>
                    </button>
                  )}

                  <div className="flex items-center gap-3 ml-auto">
                    {/* Skip (only for optional docs) */}
                    {!currentDoc.required && !isLast && (
                      <button
                        onClick={goNext}
                        className="inline-flex items-center gap-2 transition-all duration-300"
                        style={{
                          padding: '0.65rem 1.25rem',
                          background: 'none',
                          border: '1px solid rgba(249, 248, 246, 0.1)',
                          borderRadius: '100px',
                          color: 'rgba(249, 248, 246, 0.5)',
                          fontFamily: "'Georgia', 'Times New Roman', serif",
                          fontSize: '0.85rem',
                          fontStyle: 'italic',
                          letterSpacing: '0.04em',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--heritage-gold)'
                          e.currentTarget.style.color = 'var(--heritage-gold)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(249, 248, 246, 0.1)'
                          e.currentTarget.style.color = 'rgba(249, 248, 246, 0.5)'
                        }}
                      >
                        <span>Skip</span>
                      </button>
                    )}

                    {/* Next / Finish */}
                    {isLast ? (
                      <button
                        onClick={handleContinueToForm}
                        className="inline-flex items-center gap-2 transition-all duration-300"
                        style={{
                          padding: '0.7rem 1.5rem',
                          background: 'var(--heritage-gold)',
                          border: 'none',
                          borderRadius: '100px',
                          color: 'var(--wood-espresso)',
                          fontFamily: "'Georgia', 'Times New Roman', serif",
                          fontSize: '0.85rem',
                          fontStyle: 'italic',
                          fontWeight: 600,
                          letterSpacing: '0.04em',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#c9a430'
                          e.currentTarget.style.boxShadow = '0 4px 20px rgba(212, 175, 55, 0.25)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--heritage-gold)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        <span>Continue</span>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={goNext}
                        className="inline-flex items-center gap-2 transition-all duration-300"
                        style={{
                          padding: '0.7rem 1.5rem',
                          background: 'var(--heritage-gold)',
                          border: 'none',
                          borderRadius: '100px',
                          color: 'var(--wood-espresso)',
                          fontFamily: "'Georgia', 'Times New Roman', serif",
                          fontSize: '0.85rem',
                          fontStyle: 'italic',
                          fontWeight: 600,
                          letterSpacing: '0.04em',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#c9a430'
                          e.currentTarget.style.boxShadow = '0 4px 20px rgba(212, 175, 55, 0.25)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--heritage-gold)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        <span>Next</span>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
