'use client'

import { use, useState, useRef, useCallback } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { facilitationServices } from '@/components/data/facilitationServicesData'
import type { DocumentRequirement } from '@/components/data/facilitationServicesData'

interface PageProps {
  params: Promise<{ slug: string }>
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

/** Get category display name from service data */
function getCategoryName(
  doc: DocumentRequirement,
  categories: { id: string; name: string }[] | undefined
): string {
  const cat = categories?.find((c) => c.id === doc.category)
  return cat?.name ?? doc.category
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

/** Step 3: Required documents & upload */
export default function FacilitationServiceDocuments({ params }: PageProps) {
  const { slug } = use(params)
  const service = facilitationServices.find((s) => s.slug === slug)
  if (!service) return notFound()

  const documents = service.requiredDocuments
  const total = documents.length

  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile[]>>({})
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentDoc = documents[currentIndex]
  const currentFiles = uploadedFiles[currentDoc.id] ?? []
  const isFirst = currentIndex === 0
  const isLast = currentIndex === total - 1

  const acceptFormats = currentDoc.formats
    ? currentDoc.formats.map((f) => `.${f.toLowerCase()}`).join(',')
    : undefined

  const goNext = useCallback(() => {
    if (isLast) return
    setDirection(1)
    setCurrentIndex((i) => i + 1)
  }, [isLast])

  const goBack = useCallback(() => {
    if (isFirst) return
    setDirection(-1)
    setCurrentIndex((i) => i - 1)
  }, [isFirst])

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
        file,
        previewUrl: isImageFile(file) ? URL.createObjectURL(file) : null,
      }))
      setUploadedFiles((prev) => ({
        ...prev,
        [currentDoc.id]: [...(prev[currentDoc.id] ?? []), ...newFiles],
      }))
    },
    [currentDoc.id]
  )

  const removeFile = useCallback(
    (index: number) => {
      setUploadedFiles((prev) => {
        const existing = prev[currentDoc.id] ?? []
        const removed = existing[index]
        if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl)
        return {
          ...prev,
          [currentDoc.id]: existing.filter((_, i) => i !== index),
        }
      })
    },
    [currentDoc.id]
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

  return (
    <div className="px-4 md:px-12 lg:px-20 pt-2 md:pt-4 pb-16 md:pb-24">
      {/* Main container */}
      <div
        className="relative rounded-xl overflow-hidden border"
        style={{
          borderColor: 'rgba(249, 248, 246, 0.08)',
          boxShadow: '0 0 40px rgba(201, 169, 106, 0.12), 0 0 80px rgba(201, 169, 106, 0.06), 0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Progress bar at top */}
        <div className="relative h-[2px] w-full" style={{ background: 'rgba(249, 248, 246, 0.06)' }}>
          <motion.div
            className="absolute left-0 top-0 h-full"
            style={{ background: 'var(--heritage-gold)' }}
            animate={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          />
        </div>

        {/* Step counter */}
        <div className="px-6 md:px-12 pt-5 pb-2 flex items-center justify-between">
          <span
            className="text-xs uppercase tracking-[0.15em] font-medium"
            style={{ color: 'var(--heritage-gold)', opacity: 0.7 }}
          >
            Document {currentIndex + 1} of {total}
          </span>
          {!currentDoc.required && (
            <span
              className="text-xs uppercase tracking-wider px-2 py-0.5 rounded-full border"
              style={{
                color: 'rgba(249, 248, 246, 0.4)',
                borderColor: 'rgba(249, 248, 246, 0.12)',
              }}
            >
              Optional
            </span>
          )}
        </div>

        {/* Animated content area — fixed height */}
        <div className="relative overflow-hidden" style={{ height: '480px' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentDoc.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              className="absolute inset-0 grid grid-cols-1 md:grid-cols-2"
            >
              {/* LEFT SIDE — Document Info */}
              <div className="relative px-6 md:px-12 pb-8 pt-2 flex flex-col overflow-hidden" style={{ height: '480px' }}>
                {/* Category */}
                <motion.span
                  className="text-xs uppercase tracking-[0.15em] font-medium mb-4 block"
                  style={{ color: 'var(--heritage-gold)', opacity: 0.7 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.7, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                >
                  {getCategoryName(currentDoc, service.documentCategories)}
                </motion.span>

                {/* Document name */}
                <motion.h2
                  className="uppercase mb-4"
                  style={{
                    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                    fontWeight: 100,
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    color: 'var(--heritage-cream)',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
                >
                  {currentDoc.name}
                </motion.h2>

                {/* Description */}
                {currentDoc.description && (
                  <motion.p
                    className="text-xs leading-tight mb-5 max-w-md"
                    style={{ color: 'rgba(249, 248, 246, 0.5)' }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
                  >
                    {currentDoc.description}
                  </motion.p>
                )}

                {/* Details section */}
                <motion.div
                  className="space-y-4 flex-1"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
                >
                  {/* Notes */}
                  {currentDoc.notes && (
                    <div className="flex gap-2.5 items-start">
                      <span className="text-[10px] mt-0.5" style={{ color: 'rgba(249, 248, 246, 0.3)' }}>•</span>
                      <p className="text-[11px] leading-snug" style={{ color: 'rgba(249, 248, 246, 0.4)' }}>
                        {currentDoc.notes}
                      </p>
                    </div>
                  )}

                  {/* Alternatives */}
                  {currentDoc.alternatives && currentDoc.alternatives.length > 0 && (
                    <div className="flex gap-2.5 items-start">
                      <span className="text-[10px] mt-0.5" style={{ color: 'rgba(249, 248, 246, 0.3)' }}>•</span>
                      <p className="text-[11px] leading-snug" style={{ color: 'rgba(249, 248, 246, 0.4)' }}>
                        {currentDoc.alternatives.join(' / ')}
                      </p>
                    </div>
                  )}

                  {/* Copies */}
                  {currentDoc.copies && currentDoc.copies > 1 && (
                    <div className="flex gap-2.5 items-start">
                      <span className="text-[10px] mt-0.5" style={{ color: 'rgba(249, 248, 246, 0.3)' }}>•</span>
                      <p className="text-[11px] leading-snug" style={{ color: 'rgba(249, 248, 246, 0.4)' }}>
                        {currentDoc.copies} copies required
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* Back button — bottom left */}
                <div className="mt-6">
                  {!isFirst && (
                    <button
                      onClick={goBack}
                      className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-medium transition-all duration-300 hover:gap-3"
                      style={{ color: 'rgba(249, 248, 246, 0.5)' }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                      </svg>
                      Back
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
              <div className="px-6 md:px-12 pb-8 pt-2 flex flex-col" style={{ height: '480px' }}>
                {/* Drop zone */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className="rounded-lg border-2 border-dashed p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200"
                  style={{
                    borderColor: isDragging ? 'var(--heritage-gold)' : 'rgba(249, 248, 246, 0.12)',
                    background: isDragging ? 'rgba(201, 169, 106, 0.05)' : 'transparent',
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
                  <p className="text-sm font-light mb-1" style={{ color: 'rgba(249, 248, 246, 0.5)' }}>
                    Drag & drop files here
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(249, 248, 246, 0.3)' }}>
                    or click to browse
                  </p>
                  {currentDoc.formats && (
                    <p className="text-xs mt-3" style={{ color: 'var(--heritage-gold)', opacity: 0.5 }}>
                      Accepted: {currentDoc.formats.join(', ')}
                    </p>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={acceptFormats}
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </motion.div>

                {/* Uploaded files list */}
                {currentFiles.length > 0 && (
                  <div className="mt-4 space-y-1 flex-1 overflow-y-auto" style={{ maxHeight: '200px' }}>
                    {currentFiles.map((uploaded, idx) => (
                      <div
                        key={`${uploaded.file.name}-${idx}`}
                        className="flex items-center gap-2 rounded px-2 py-1 border"
                        style={{
                          background: 'rgba(249, 248, 246, 0.02)',
                          borderColor: 'rgba(249, 248, 246, 0.08)',
                        }}
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
                          <p className="text-[11px] truncate leading-none mb-0.5" style={{ color: 'var(--heritage-cream)' }}>
                            {uploaded.file.name}
                          </p>
                          <p className="text-[9px] leading-none" style={{ color: 'rgba(249, 248, 246, 0.3)' }}>
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

                {/* Bottom buttons — Skip & Next */}
                <div className="mt-auto pt-6 flex items-center justify-end gap-3">
                  {/* Skip (only for optional docs) */}
                  {!currentDoc.required && !isLast && (
                    <button
                      onClick={goNext}
                      className="inline-flex items-center gap-2 px-5 py-2 text-xs font-medium uppercase tracking-wider rounded-full border transition-all duration-300 hover:border-[var(--heritage-gold)]"
                      style={{
                        color: 'rgba(249, 248, 246, 0.5)',
                        borderColor: 'rgba(249, 248, 246, 0.15)',
                      }}
                    >
                      Skip
                    </button>
                  )}

                  {/* Next / Finish */}
                  {isLast ? (
                    <Link
                      href={`/facilitation-service/${slug}/form`}
                      className="inline-flex items-center gap-2 px-6 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-all duration-300 hover:gap-4"
                      style={{
                        background: 'var(--heritage-gold)',
                        color: 'var(--wood-espresso)',
                      }}
                    >
                      Continue
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  ) : (
                    <button
                      onClick={goNext}
                      className="inline-flex items-center gap-2 px-6 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-all duration-300 hover:gap-4"
                      style={{
                        background: 'var(--heritage-gold)',
                        color: 'var(--wood-espresso)',
                      }}
                    >
                      Next
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
