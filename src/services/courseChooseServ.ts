import { generalRequest } from '~/services/genServ'
import { DataResponse } from '~/models/general'

// ================== 学生 ==================

/**
 * 学生：已选课程
 */
export function getMyCourseListByStudent(studentId: number): Promise<DataResponse> {
  return generalRequest('/api/courseChoose/list', {
    studentId
  }) as Promise<DataResponse>
}

/**
 * 学生：选课
 */
export function selectMyCourse(studentId: number, courseId: number): Promise<DataResponse> {
  return generalRequest('/api/courseChoose/select', {
    studentId,
    courseId
  }) as Promise<DataResponse>
}

/**
 * 学生：退课
 */
export function dropMyCourse(studentId: number, courseId: number): Promise<DataResponse> {
  return generalRequest('/api/courseChoose/drop', {
    studentId,
    courseId
  }) as Promise<DataResponse>
}

