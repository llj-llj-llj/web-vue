import { generalRequest } from '~/services/genServ'
import { type DataResponse } from '~/models/general'

/**
 * 我的课程接口
 * 管理员：不用
 * 学生：已选课程 / 选课 / 退课
 * 教师：所授课程
 */

/** 学生：我的课程（已选） */
export async function getMyCourseListByStudent(): Promise<DataResponse> {
  return generalRequest('/api/myCourse/student/list', {}) as Promise<DataResponse>
}

/** 教师：我的课程（所授） */
export async function getMyCourseListByTeacher(): Promise<DataResponse> {
  return generalRequest('/api/myCourse/teacher/list', {}) as Promise<DataResponse>
}

/** 学生：选课 */
export async function selectMyCourse(
  studentId: number,
  courseId: number
): Promise<DataResponse> {
  return generalRequest('/api/myCourse/student/select', {
    studentId,
    courseId
  }) as Promise<DataResponse>
}

/** 学生：退课 */
export async function dropMyCourse(
  studentId: number,
  courseId: number
): Promise<DataResponse> {
  return generalRequest('/api/myCourse/student/drop', {
    studentId,
    courseId
  }) as Promise<DataResponse>
}
