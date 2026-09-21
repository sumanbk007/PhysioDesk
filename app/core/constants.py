from enum import Enum


class Gender(str, Enum):
    MALE = "Male"
    FEMALE = "Female"
    OTHER = "Other"


class PatientStatus(str, Enum):
    ACTIVE = "Active"
    COMPLETED = "Completed"
    FOLLOW_UP = "Due for follow-up"


class AppointmentStatus(str, Enum):
    BOOKED = "Booked"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"
    NO_SHOW = "No-show"


class InvoiceStatus(str, Enum):
    DUE = "Due"
    PARTIAL = "Partial"
    PAID = "Paid"
    REFUNDED = "Refunded"


class PaymentMethod(str, Enum):
    CASH = "Cash"
    CARD = "Card"
    ESEWA = "eSewa"
    KHALTI = "Khalti"
    BANK = "Bank Transfer"


class NotificationType(str, Enum):
    APPOINTMENT_REMINDER = "Appointment reminder"
    APPOINTMENT_CONFIRMATION = "Appointment confirmation"
    CANCELLATION = "Cancellation"
    PAYMENT_REMINDER = "Payment reminder"
    FOLLOW_UP = "Follow-up reminder"
    PACKAGE_COMPLETION = "Package nearing completion"


class NotificationChannel(str, Enum):
    SMS = "SMS"
    WHATSAPP = "WhatsApp"
    VIBER = "Viber"
    EMAIL = "Email"
    PHONE = "Phone call"


class NotificationStatus(str, Enum):
    SCHEDULED = "Scheduled"
    SENT = "Sent"
    FAILED = "Failed"
    CANCELLED = "Cancelled"


class UserRole(str, Enum):
    FRONT_DESK = "front_desk"
    ADMIN = "admin"