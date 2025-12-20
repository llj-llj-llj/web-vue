import { generalRequest } from '~/services/genServ'
import { DataResponse } from '~/models/general'

export function getTeacherCourseList(personId: number): Promise<DataResponse> {
  return generalRequest('/api/course/getTeacherCourse', {
    personId
  }) as Promise<DataResponse>
}
