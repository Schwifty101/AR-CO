"use client"

import type React from "react"

import { useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Breadcrumb from "@/components/Breadcrumb"
import Button from "@/components/Button"
import styles from "./page.module.css"

export default function CheckoutPage({ params }: { params: { service: string } }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    documents: [] as string[],
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileNames = Array.from(files).map((f) => f.name)
      setFormData({ ...formData, documents: [...formData.documents, ...fileNames] })
    }
  }

  const handleNextStep = () => {
    if (step < 4) {
      setStep(step + 1)
    }
  }

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = () => {
    // Redirect to confirmation page
    window.location.href = `/facilitation/checkout/${params.service}/confirmation`
  }

  return (
    <>
      <Header />
      <main className={`${styles.main} page-transition`}>
        <div className={styles.container}>
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Facilitation", href: "/facilitation" },
              { label: "Checkout" },
            ]}
          />

          <h1>Complete Your Order</h1>

          <div className={styles.progressBar}>
            <div className={styles.steps}>
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className={`${styles.step} ${s <= step ? styles.active : ""}`}>
                  <div className={styles.stepCircle}>{s}</div>
                  <span>{s === 1 ? "Details" : s === 2 ? "Documents" : s === 3 ? "Review" : "Payment"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.checkoutContent}>
            <div className={styles.formSection}>
              {step === 1 && (
                <div className={styles.stepContent}>
                  <h2>Your Details</h2>
                  <form className={styles.form}>
                    <div className={styles.formGroup}>
                      <label htmlFor="fullName">Full Name</label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </form>
                </div>
              )}

              {step === 2 && (
                <div className={styles.stepContent}>
                  <h2>Upload Required Documents</h2>
                  <p className={styles.stepDescription}>
                    Please upload the following documents for your service request.
                  </p>
                  <div className={styles.documentUploadArea}>
                    <div className={styles.uploadBox}>
                      <p>Click or drag files here to upload</p>
                      <input
                        type="file"
                        id="documents"
                        multiple
                        onChange={handleDocumentUpload}
                        className={styles.fileInput}
                      />
                    </div>
                  </div>
                  {formData.documents.length > 0 && (
                    <div className={styles.uploadedFiles}>
                      <h3>Uploaded Files</h3>
                      <ul>
                        {formData.documents.map((doc) => (
                          <li key={doc}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className={styles.stepContent}>
                  <h2>Review Your Order</h2>
                  <div className={styles.reviewSection}>
                    <div className={styles.reviewBlock}>
                      <h3>Service Details</h3>
                      <p>
                        <strong>Service:</strong> {decodeURIComponent(params.service).replace(/-/g, " ")}
                      </p>
                      <p>
                        <strong>Price:</strong> PKR 25,000
                      </p>
                      <p>
                        <strong>Timeline:</strong> 5 days
                      </p>
                    </div>

                    <div className={styles.reviewBlock}>
                      <h3>Your Information</h3>
                      <p>
                        <strong>Name:</strong> {formData.fullName}
                      </p>
                      <p>
                        <strong>Email:</strong> {formData.email}
                      </p>
                      <p>
                        <strong>Phone:</strong> {formData.phone}
                      </p>
                    </div>

                    <div className={styles.reviewBlock}>
                      <h3>Documents ({formData.documents.length})</h3>
                      <ul>
                        {formData.documents.map((doc) => (
                          <li key={doc}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className={styles.stepContent}>
                  <h2>Payment</h2>
                  <div className={styles.paymentSection}>
                    <div className={styles.paymentMethod}>
                      <h3>Select Payment Method</h3>
                      <div className={styles.methodOptions}>
                        <label className={styles.methodOption}>
                          <input type="radio" name="payment" value="card" defaultChecked />
                          <span>Credit/Debit Card</span>
                        </label>
                        <label className={styles.methodOption}>
                          <input type="radio" name="payment" value="bank" />
                          <span>Bank Transfer</span>
                        </label>
                        <label className={styles.methodOption}>
                          <input type="radio" name="payment" value="wallet" />
                          <span>Digital Wallet</span>
                        </label>
                      </div>
                    </div>

                    <div className={styles.priceBreakdown}>
                      <h3>Order Summary</h3>
                      <div className={styles.breakdownRow}>
                        <span>Service Fee</span>
                        <span>PKR 25,000</span>
                      </div>
                      <div className={styles.breakdownRow}>
                        <span>Processing Fee</span>
                        <span>PKR 500</span>
                      </div>
                      <div className={`${styles.breakdownRow} ${styles.total}`}>
                        <span>Total Amount</span>
                        <span>PKR 25,500</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.orderSummary}>
                <h3>Order Summary</h3>
                <div className={styles.summaryItem}>
                  <span>Service</span>
                  <span>{decodeURIComponent(params.service).replace(/-/g, " ")}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Price</span>
                  <span>PKR 25,000</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Documents</span>
                  <span>{formData.documents.length} files</span>
                </div>
                <div className={`${styles.summaryItem} ${styles.total}`}>
                  <span>Total</span>
                  <span>PKR 25,500</span>
                </div>
              </div>
            </aside>
          </div>

          <div className={styles.buttonGroup}>
            {step > 1 && <Button variant="secondary" onClick={handlePrevStep}>Previous</Button>}
            {step < 4 ? (
              <Button variant="primary" onClick={handleNextStep}>Next</Button>
            ) : (
              <Button variant="primary" onClick={handleSubmit}>Complete Payment</Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
