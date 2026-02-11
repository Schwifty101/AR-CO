/** User type enum matching the database `user_type` column */
export enum UserType {
  CLIENT = 'client',
  ATTORNEY = 'attorney',
  STAFF = 'staff',
  ADMIN = 'admin',
}

/** Company type enum matching the database `company_type` column */
export enum CompanyType {
  SOLE_PROPRIETORSHIP = 'sole_proprietorship',
  PARTNERSHIP = 'partnership',
  LLC = 'llc',
  CORPORATION = 'corporation',
  NGO = 'ngo',
  OTHER = 'other',
}
