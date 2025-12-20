//请求数据接口定义 用于请求数据时的参数的定义
//export 表示输出，其他文件可以引用
export interface DataRequest {
  data: any;
}
//请求数据接口定义 用于请求数据时的返回值的定义
export interface DataResponse {
  data: any;
  code: number;
  msg: string;
}
// 用于文件数据结构的定义
export interface FileInfo {
  url: string;
  name: string;
}
//用于系统提示信息的定义
export interface NotificationMsg {
  show: boolean;
  msg: string;
}
//用于系统确认信息的定义
export interface ConfirmMsg {
  show: boolean;
  msg: string;
  confirm: Function;
}
//用于WebStocet状态数据信息的定义
export interface WebSocketState {
  data: Object;
  webSocket: WebSocket;
}
//用于聊天信息的定义
export interface ChatInfo {
  userId: number;
  username: string;
  avatar: string;
  content: string;
}
//用于验证码信息的定义
export interface ValidateCode {
  validateCodeId: number;
  img: string;
}
//用于菜单项信息的定义
export interface MenuInfo {
  id: number;
  name: string;
  title: string;
  sList: MenuInfo[];
}
//用于选择项信息的定义
export interface OptionItem {
  id: number;
  value: string;
  title: string;
}
//用于树节点信息的定义
export interface TreeNode {
  pid: number | null;
  id: number;
  value: string;
  title: string;
  label: string;
  userTypeIds: string;
  parentTitle: string;
  children: TreeNode[];
  isLeaf: number | null;
}
//用于系统配置信息的定义
export interface SystemConfig {
  naviList: MenuInfo[];
  showLeftMeun: boolean;
  leftList: MenuInfo[];
  id: number | null;
}
//用于用户信息的定义
export interface UserInfo {
  loggedIn: boolean;
  username: string;
  perName: string;
  token: string;
  id: number;
  role: string;
  password: string;
}
//用于Chart数据信息的定义
export interface ChartItem {
  value: string[];
  label1: string[];
  label2: string[];
}
//用于UserOnline数据信息的定义
export interface UserOnlineItem {
  total: number;
  monthCount: number;
  dayCount: number;
}
//用于学生选择数据信息的定义
export interface Student {
  id: number;
  num: string;
  name: string;
}
//用于成绩数据信息的定义
export interface ScoreItem {
  scoreId: number;
  personId: number;
  courseId: number;
  studentNum: string;
  studentName: string;
  className: string;
  courseNum: string;
  courseName: string;
  credit: number;
  mark: number;
}
//用于学生数据信息的定义
export interface StudentItem {
  personId: number;
  num: string;
  name: string;
  dept: string;
  major: string;
  className: string;
  card: string;
  gender: string;
  genderName: string;
  birthday: string;
  email: string;
  phone: string;
  address: string;
}
//用于课程数据信息的定义
export interface CourseItem {
  courseId: number;
  num: string;
  name: string;
  credit: number;
  coursePath: string;
  preCourse: string;
  preCourseId: number;
  courseTime: string;
  courseRoom: string;
}
//用于成绩数据信息的定义
export interface ScoreItem {
  scoreId: number;
  personId: number;
  courseId: number;
  studentNum: string;
  studentName: string;
  courseNum: string;
  courseName: string;
  credit: number;
  mark: number;
  examType?: string;
  ranking: number;
}
//用于家庭成员数据信息的定义
export interface FamilyMemberItem {
  memberId: number;
  personId: number;
  relation: string;
  name: string;
  gender: string;
  age: string;
  unit: string;
}

export interface PersonItem {
  personId: number;
  num: string;
  name: string;
  dept: string;
  card: string;
  gender: string;
  genderName: string;
  birthday: string;
  email: string;
  phone: string;
  address: string;
}

//用于教师数据信息的定义
export interface TeacherItem {
  personId: number;
  person: PersonItem;
  title: string;
  degree: string;
}
export interface TeacherViewItem extends PersonItem {
  title: string;
  degree: string;
}

