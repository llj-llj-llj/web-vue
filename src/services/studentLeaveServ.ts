import { generalRequest, downloadPost } from "~/services/genServ";
import { type DataResponse } from "~/models/general";

// 教师选项类型
export interface TeacherOption {
  label: string; // 教师名称
  value: number; // 教师ID
}

// 请假列表项类型
export interface LeaveItem {
  studentLeaveId: number;
  studentNum: string;
  studentName: string;
  teacherName: string;
  leaveStartDate: string;
  leaveEndDate: string;
  reason: string;
  state: number;
  stateName: string;
  teacherComment: string;
  adminComment: string;
}

// 请假保存请求参数类型
export interface LeaveSaveRequest {
  studentLeaveId?: number;
  studentNum: string;
  studentName: string;
  teacherId: number;
  leaveStartDate: string | null;
  leaveEndDate: string | null;
  reason: string;
  attachment?: string;
  state?: number;
}

// 请假审核请求参数类型
export interface LeaveCheckRequest {
  studentLeaveId: number;
  state: number;
  teacherComment?: string;
  adminComment?: string;
}

// 文件上传响应类型
export interface UploadResponse {
  data: {
    filePath: string;
  };
}

// 搜索参数类型
export interface LeaveSearchParams {
  state: number;
  search: string;
}

// 获取教师选项列表
// 获取教师选项列表
export async function getTeacherItemOptionList(): Promise<TeacherOption[]> {
  const res: any = await generalRequest("/api/studentLeave/getTeacherItemOptionList", null);

  // ✅ 兼容：generalRequest 可能返回 raw，也可能返回 axiosResponse
  const raw = res?.data ?? res;

  // ✅ 你的后端字段叫 itemList，每项叫 title/value
  const list = Array.isArray(raw?.itemList) ? raw.itemList : [];

  // ✅ 在 service 层直接转成前端真正需要的 {label,value}
  return list.map((x: any) => ({
    label: x.title,
    value: Number(x.value ?? x.id),
  }));
}



// 获取请假列表
export async function getStudentLeaveList(data: LeaveSearchParams): Promise<LeaveItem[]> {
  const res = await generalRequest("/api/studentLeave/getStudentLeaveList", data);
  return res.data as LeaveItem[];
}

// 保存请假申请
export async function studentLeaveSave(data: LeaveSaveRequest): Promise<DataResponse> {
  const res = await generalRequest("/api/studentLeave/studentLeaveSave", data);
  return res as DataResponse;
}

// 审核请假申请
export async function studentLeaveCheck(data: LeaveCheckRequest): Promise<DataResponse> {
  const res = await generalRequest("/api/studentLeave/studentLeaveCheck", data);
  return res as DataResponse;
}

// 上传请假证明附件
export async function uploadAttachment(file: File, uploader: string): Promise<UploadResponse> {
  // 使用特殊的文件上传请求，设置正确的Content-Type
  const res = await fetch('/api/studentLeave/uploadAttachment', {
    method: 'POST',
    body: file,
    headers: {
      'uploader': uploader,
      'fileName': file.name
    }
  });
  
  if (!res.ok) {
    throw new Error('文件上传失败');
  }
  
  return res.json();
}

// 导出请假数据
export async function exportLeaveList(data: LeaveSearchParams) {
  // 使用downloadPost函数进行文件下载
  await downloadPost('/api/studentLeave/export', '请假数据列表.xlsx', data);
}