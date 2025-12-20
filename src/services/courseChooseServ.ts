import { generalRequest } from '~/services/genServ'
import { DataResponse } from '~/models/general'

export function getMyCourseListByStudent(studentId: number): Promise<DataResponse> {
  return generalRequest('/api/courseChoose/list', {
    studentId
  }) as Promise<DataResponse>
}

export function selectMyCourse(studentId: number, courseId: number): Promise<DataResponse> {
  return generalRequest('/api/courseChoose/select', {
    studentId,
    courseId
  }) as Promise<DataResponse>
}

export function dropMyCourse(studentId: number, courseId: number): Promise<DataResponse> {
  return generalRequest('/api/courseChoose/drop', {
    studentId,
    courseId
  }) as Promise<DataResponse>
}
