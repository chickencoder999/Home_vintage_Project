import { ObjectId } from 'mongodb'
import databaseService from '../database/database.services'
import { STAFFS_MESSAGES } from './staff.mesage'

class StaffService {
  async updateActivityStaff(payload: { user_id: string; day_on: number; day_off: number }) {
    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(payload.user_id) },
      { $set: { day_on: payload.day_on, day_off: payload.day_off } },
      { returnDocument: 'after' }
    )
    return { message: STAFFS_MESSAGES.UPDATE_STAFF_SUCCESS, day_on: user.value?.day_off, day_off: user.value?.day_on }
  }

  async checkIDExist(id: string) {
    const user = await databaseService.users.findOne({ _id: new ObjectId(id) })
    return user !== null
  }

  async updateSalaryStaff(payload: { user_id: string; salary: number }) {
    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(payload.user_id) },
      { $set: { salary: payload.salary } },
      { returnDocument: 'after' }
    )
    return { message: STAFFS_MESSAGES.UPDATE_STAFF_SUCCESS, salary: user.value?.salary }
  }
}
const staffService = new StaffService()
export default staffService
