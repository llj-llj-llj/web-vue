import { generalRequest, uploadRequest } from "~/services/genServ";
import {
  type DataResponse,
  type CourseItem,
  type OptionItem,
  type TreeNode,
} from "~/models/general";
//获取课程数据表后台数据请求方法
export async function getCourseList(
  numName: string | null
): Promise<CourseItem[]> {
  const res = await generalRequest("/api/course/getCourseList", {
    numName: numName,
  });
  return res.data as CourseItem[];
}
//删除课程后台数据请求方法
export async function courseDelete(courseId: number): Promise<DataResponse> {
  const res = await generalRequest("/api/course/courseDelete", {
    courseId: courseId,
  });
  return res as DataResponse;
}
//课程保存后台数据请求方法
export async function courseSave(data: CourseItem): Promise<DataResponse> {
  const res = await generalRequest("/api/course/courseSave", data);
  return res as DataResponse;
}
//获取学生选择项列表后台数据请求方法
export async function getStudentItemOptionList(): Promise<OptionItem[]> {
  const res = await generalRequest("/api/score/getStudentItemOptionList", null);
  return res.itemList as OptionItem[];
}
//获取课程选择项列表后台数据请求方法
export async function getCourseItemOptionList(): Promise<OptionItem[]> {
  const res = await generalRequest("/api/score/getCourseItemOptionList", null);
  return res.itemList as OptionItem[];
}
//获取成绩列表后台数据请求方法
export async function getScoreList(
  personId: number | null,
  courseId: number | null,
  currentPage: number = 1,
  pageSize: number = 10,
  sortBy: string = '',
  sortDesc: boolean = false,
  examType: string | null = null
): Promise<[]> {
  const res = await generalRequest("/api/score/getScoreList", {
    personId: personId,
    courseId: courseId,
    currentPage: currentPage,
    pageSize: pageSize,
    sortBy: sortBy,
    sortDesc: sortDesc,
    examType: examType
  });
  return res.data as [];
}
//成绩保存后台数据请求方法
export async function scoreSave(
  scoreId: number | null,
  personId: number,
  courseId: number,
  mark: number
): Promise<DataResponse> {
  const res = await generalRequest("/api/score/scoreSave", {
    scoreId: scoreId,
    personId: personId,
    courseId: courseId,
    mark: mark,
  });
  return res as DataResponse;
}
//成绩删除后台数据请求方法
export async function scoreDelete(scoreId: number): Promise<DataResponse> {
  const res = await generalRequest("/api/score/scoreDelete", {
    scoreId: scoreId,
  });
  return res as DataResponse;
}
