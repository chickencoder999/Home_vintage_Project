export interface CreateStaffReqBody {
  full_name: string
  phone_number: string
  email: string
  password: string
  confirm_password: string
  cccd: string
  day_on: number
  day_off: number
  salary: number
}

// export interface UpdateStaffReqBody {
//   full_name?: string
//   date_of_birth?: string
//   cccd?: string
//   phone_number?: string
//   day_on?: number
//   day_off?: number
//   salary?: number
// }

export interface UpdateActivityStaff {
  day_on?: number
  day_off?: number
}
