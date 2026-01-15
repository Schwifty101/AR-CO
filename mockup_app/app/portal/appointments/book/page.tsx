"use client"

import { useState } from "react"
import Link from "next/link"
import PortalSidebar from "@/components/portal/PortalSidebar"
import Button from "@/components/Button"
import Breadcrumb from "@/components/Breadcrumb"
import styles from "./page.module.css"

type BookingStep = "service" | "attorney" | "datetime" | "payment" | "confirmation"

export default function BookAppointmentPage() {
  const [currentStep, setCurrentStep] = useState<BookingStep>("service")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedService, setSelectedService] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")

  const services = [
    { id: "consultation", title: "Initial Consultation", price: "PKR 5,000" },
    { id: "followup", title: "Follow-up Consultation", price: "PKR 3,000" },
    { id: "docreview", title: "Document Review", price: "PKR 2,500" },
    { id: "casediscussion", title: "Case Discussion", price: "PKR 4,000" },
  ]

  const availableSlots = ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"]

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId)
    setCurrentStep("attorney")
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  return (
    <div className={styles.container}>
      <PortalSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`${styles.main} page-transition`}>
        <div className={styles.topBar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>Book Appointment</h1>
        </div>

        <div className={styles.content}>
          <Breadcrumb items={[{ label: "Dashboard", href: "/portal/dashboard" }, { label: "Book Appointment" }]} />

          {/* Step Indicator */}
          <div className={styles.stepIndicator}>
            <div className={`${styles.step} ${currentStep === "service" ? styles.active : ""}`}>1. Service</div>
            <div className={`${styles.step} ${currentStep === "attorney" ? styles.active : ""}`}>2. Attorney</div>
            <div className={`${styles.step} ${currentStep === "datetime" ? styles.active : ""}`}>3. Date & Time</div>
            <div className={`${styles.step} ${currentStep === "payment" ? styles.active : ""}`}>4. Payment</div>
          </div>

          {/* Step 1: Service Selection */}
          {currentStep === "service" && (
            <section className={styles.step}>
              <h2>Select Service Type</h2>
              <div className={styles.servicesList}>
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`${styles.serviceOption} ${selectedService === service.id ? styles.selected : ""}`}
                    onClick={() => handleServiceSelect(service.id)}
                  >
                    <input
                      type="radio"
                      name="service"
                      value={service.id}
                      checked={selectedService === service.id}
                      onChange={() => {}}
                    />
                    <div className={styles.serviceInfo}>
                      <p className={styles.serviceTitle}>{service.title}</p>
                      <p className={styles.servicePrice}>{service.price}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.buttonGroup}>
                <Button onClick={() => setCurrentStep("attorney")} disabled={!selectedService}>
                  Next
                </Button>
              </div>
            </section>
          )}

          {/* Step 2: Attorney Selection */}
          {currentStep === "attorney" && (
            <section className={styles.step}>
              <h2>Choose Attorney</h2>
              <p className={styles.description}>Auto-assigned attorney for your consultation:</p>
              <div className={styles.attorneyCard}>
                <div className={styles.attorneyImage}>👨‍⚖️</div>
                <div className={styles.attorneyDetails}>
                  <p className={styles.attorneyName}>Mr. Shoaib Ahmed</p>
                  <p className={styles.attorneyTitle}>Lead Attorney</p>
                  <p className={styles.availability}>Available</p>
                </div>
              </div>
              <div className={styles.buttonGroup}>
                <Button onClick={() => setCurrentStep("service")} variant="secondary">
                  Back
                </Button>
                <Button onClick={() => setCurrentStep("datetime")}>Next</Button>
              </div>
            </section>
          )}

          {/* Step 3: Date & Time Selection */}
          {currentStep === "datetime" && (
            <section className={styles.step}>
              <h2>Select Date & Time</h2>
              <div className={styles.dateTimeWrapper}>
                <div className={styles.calendar}>
                  <h3>Select Date</h3>
                  <div className={styles.dateGrid}>
                    {Array.from({ length: 10 }).map((_, i) => {
                      const date = new Date()
                      date.setDate(date.getDate() + i + 1)
                      const dateStr = date.toISOString().split("T")[0]
                      return (
                        <button
                          key={dateStr}
                          className={`${styles.dateOption} ${selectedDate === dateStr ? styles.selected : ""}`}
                          onClick={() => handleDateSelect(dateStr)}
                        >
                          {date.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "numeric",
                            day: "numeric",
                          })}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {selectedDate && (
                  <div className={styles.timeSlots}>
                    <h3>Select Time</h3>
                    <div className={styles.slotGrid}>
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          className={`${styles.timeSlot} ${selectedTime === slot ? styles.selected : ""}`}
                          onClick={() => handleTimeSelect(slot)}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.buttonGroup}>
                <Button onClick={() => setCurrentStep("attorney")} variant="secondary">
                  Back
                </Button>
                <Button onClick={() => setCurrentStep("payment")} disabled={!selectedDate || !selectedTime}>
                  Next
                </Button>
              </div>
            </section>
          )}

          {/* Step 4: Payment */}
          {currentStep === "payment" && (
            <section className={styles.step}>
              <h2>Review & Pay</h2>
              <div className={styles.bookingSummary}>
                <h3>Booking Summary</h3>
                <div className={styles.summaryItem}>
                  <p>Service:</p>
                  <p>{services.find((s) => s.id === selectedService)?.title}</p>
                </div>
                <div className={styles.summaryItem}>
                  <p>Attorney:</p>
                  <p>Mr. Shoaib Ahmed</p>
                </div>
                <div className={styles.summaryItem}>
                  <p>Date & Time:</p>
                  <p>
                    {selectedDate} at {selectedTime}
                  </p>
                </div>
                <div className={styles.summaryItem}>
                  <p>Amount:</p>
                  <p className={styles.amount}>{services.find((s) => s.id === selectedService)?.price}</p>
                </div>
              </div>

              <div className={styles.paymentForm}>
                <h3>Payment Details</h3>
                <div className={styles.formGroup}>
                  <label>Card Number</label>
                  <input type="text" placeholder="1234 5678 9012 3456" />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Expiry Date</label>
                    <input type="text" placeholder="MM/YY" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>CVV</label>
                    <input type="text" placeholder="123" />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Name on Card</label>
                  <input type="text" placeholder="John Doe" />
                </div>
              </div>

              <div className={styles.buttonGroup}>
                <Button onClick={() => setCurrentStep("datetime")} variant="secondary">
                  Back
                </Button>
                <Button onClick={() => setCurrentStep("confirmation")}>Confirm & Pay</Button>
              </div>
            </section>
          )}

          {/* Step 5: Confirmation */}
          {currentStep === "confirmation" && (
            <section className={styles.step}>
              <div className={styles.confirmationBox}>
                <div className={styles.checkmark}>✓</div>
                <h2>Appointment Confirmed!</h2>
                <div className={styles.confirmationDetails}>
                  <div className={styles.detailItem}>
                    <p className={styles.label}>Reference Number</p>
                    <p className={styles.value}>APT-2026-001234</p>
                  </div>
                  <div className={styles.detailItem}>
                    <p className={styles.label}>Service</p>
                    <p className={styles.value}>{services.find((s) => s.id === selectedService)?.title}</p>
                  </div>
                  <div className={styles.detailItem}>
                    <p className={styles.label}>Attorney</p>
                    <p className={styles.value}>Mr. Shoaib Ahmed</p>
                  </div>
                  <div className={styles.detailItem}>
                    <p className={styles.label}>Date & Time</p>
                    <p className={styles.value}>
                      {selectedDate} at {selectedTime}
                    </p>
                  </div>
                  <div className={styles.detailItem}>
                    <p className={styles.label}>Amount Paid</p>
                    <p className={styles.value}>{services.find((s) => s.id === selectedService)?.price}</p>
                  </div>
                </div>
                <p className={styles.confirmationMessage}>
                  A confirmation email has been sent to your registered email address.
                </p>
              </div>

              <div className={styles.buttonGroup}>
                <Button variant="secondary">📥 Download Receipt</Button>
                <Button>📅 Add to Calendar</Button>
                <Link href="/portal/dashboard" className={styles.buttonLink}>
                  <Button variant="secondary">← Back to Dashboard</Button>
                </Link>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
