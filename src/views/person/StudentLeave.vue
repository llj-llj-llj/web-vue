<template>
  <div class="base_form">
    <!-- 通知提示 -->
    <el-alert
      v-if="notificationVisible"
      title="审核通知"
      :message="notificationMessage"
      type="success"
      center
      :closable="true"
      @close="notificationVisible = false"
      style="margin-bottom: 20px;"
    />

    <!-- 错误提示 -->
    <el-alert
      v-if="errorVisible"
      title="错误提示"
      :message="errorMessage"
      type="error"
      center
      :closable="true"
      @close="errorVisible = false"
      style="margin-bottom: 20px;"
    />

    <div class="base_header">
      <div class="blue_column"></div>
      <div class="base_title">学生请假管理</div>
    </div>

    <!-- 查询区域 -->
    <div class="base_query_oneLine" style="width: 97%">
      <!-- 左边操作按钮组 -->
      <div class="query_left">
          

      </div>
      <!-- 右边查询组 -->
      <div class="query_right">
         
        
      </div>
    </div>

    <div class="form-div" style="margin-top: 5px"  v-if="isStudent">
      <el-form :model="form" :rules="rules" ref="formRef" label-position="right" label-width="100px">
        <el-form-item label="学号" prop="studentNum">
          <el-input v-model="form.studentNum" placeholder="请输入学号" style="width: 97%" />
        </el-form-item>

        <el-form-item label="姓名" prop="studentName">
          <el-input v-model="form.studentName" placeholder="请输入姓名" style="width: 97%" />
        </el-form-item>

        <!-- ✅ 修复：prop 对应 form.leaveDateRange，date-picker 也直接绑 form.leaveDateRange -->
        <el-form-item label="请假时间范围" prop="leaveDateRange">
          <el-date-picker
            v-model="form.leaveDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 97%"
          />
        </el-form-item>

        <el-form-item label="请假原因" prop="reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入请假原因"
            style="width: 97%"
          />
        </el-form-item>

        <el-form-item label="请假证明">
          <el-upload
            v-model:file-list="fileList"
            :auto-upload="false"
            :on-change="handleFileChange"
            accept=".pdf,.doc,.docx,.jpg,.png"
            style="width: 97%"
          >
            <el-button type="primary">
              <el-icon><Plus /></el-icon>
              选择文件
            </el-button>
            <template #tip>
              <div class="el-upload__tip">支持上传 PDF, DOC, DOCX, JPG, PNG 格式文件</div>
            </template>
          </el-upload>

          <el-button
            type="success"
            size="small"
            @click="uploadFile"
            style="margin-top: 10px;"
            :disabled="!fileList.length"
            :loading="isUploading"
          >
            上传附件
          </el-button>

          <div v-if="form.attachment" style="margin-top: 10px; color: green;">
            已上传：{{ getFileName(form.attachment) }}
          </div>
        </el-form-item>

        <el-form-item label="选择教师" prop="teacherId">
          <el-select v-model="form.teacherId" placeholder="选择教师" style="width: 97%">
            <el-option v-for="item in teacherOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="default" @click="resetForm()">重置</el-button>
          <el-button type="primary" @click="submitForm()" style="margin-left: 10px;" :loading="loading.submitForm"
            >提交</el-button
          >
        </el-form-item>
      </el-form>
    </div>




    <!-- 数据表格区域 -->
     <div >
      <el-table
        :data="leaveList"
        :header-cell-style="{
          color: '#2E2E2E',
          fontSize: '10px',
          fontWeight: '400',
          background: 'rgb(242,242,242)',
        }"
        :row-style="{ height: '10px' }"
        :cell-style="{ padding: '2px' }"
        style="width: 100%"
        :loading="loading.leaveList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" fixed="left" />
        <el-table-column label="序号" width="50">
          <template v-slot="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>

        <el-table-column label="学号" color="black" align="center" width="100">
          <template v-slot="scope">
            {{ scope.row.studentNum }}
          </template>
        </el-table-column>

        <el-table-column label="姓名" color="black" align="center" width="100">
          <template v-slot="scope">
            {{ scope.row.studentName }}
          </template>
        </el-table-column>

        <el-table-column label="教师" color="black" align="center" width="150">
          <template v-slot="scope">
            {{ scope.row.teacherName }}
          </template>
        </el-table-column>

        <el-table-column label="请假时间范围" color="black" align="center" width="200">
          <template v-slot="scope">
            {{ scope.row.leaveStartDate }}至{{ scope.row.leaveEndDate }}
          </template>
        </el-table-column>

        <el-table-column label="请假原因" color="black" align="center" width="200">
          <template v-slot="scope">
            {{ scope.row.reason }}
          </template>
        </el-table-column>

        <el-table-column label="状态" color="black" align="center" width="100">
          <template v-slot="scope">
            {{ scope.row.stateName }}
          </template>
        </el-table-column>

        <el-table-column label="  " color="black" align="center" width="200" fixed="right" v-if="isAdmin"></el-table-column>

        <el-table-column label="操作" color="black" align="center" width="200" fixed="right" v-if="!isAdmin"
>
          <template v-slot="scope">
            <el-button size="small" class="commButton" @click="editItem(scope.row)" v-if="isStudent">编辑</el-button>
            <el-button
              size="small"
              class="commButton"
              type="primary"
              @click="checkItem(scope.row, 1)"
              v-if="scope.row.state === 0 && isTeacher"
              >批准</el-button
            >
            <el-button
              size="small"
              class="commButton"
              type="danger"
              @click="checkItem(scope.row, 2)"
              v-if="scope.row.state === 0 && isTeacher"
              >拒绝</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 审核对话框 -->
    <el-dialog v-model="dialogVisible" title="审核请假" width="500px" :close-on-click-modal="false">
      <el-form :model="dialogForm" label-position="top" style="margin-top: 20px;">
        <el-form-item label="审核意见" required>
          <el-input
            v-model="dialogForm.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入审核意见"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmCheck" :loading="loading.checkItem">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, UploadFile } from 'element-plus';
import { Search, Plus } from '@element-plus/icons-vue';

import {
  getStudentLeaveList,
  studentLeaveSave,
  studentLeaveCheck,
  getTeacherItemOptionList,
  uploadAttachment,
  exportLeaveList,
  type TeacherOption,
  type LeaveItem,
  type LeaveSearchParams,
  type LeaveSaveRequest
} from '~/services/studentLeaveServ';

import { useAppStore } from '~/stores/app';   // ✅ 加这个

// ✅ 角色判断（和你第二张图那份逻辑一致）
const appStore = useAppStore();

const isStudent = computed(() => appStore.userInfo.role === 'ROLE_STUDENT');
const isTeacher = computed(() => appStore.userInfo.role === 'ROLE_TEACHER');
const isAdmin   = computed(() => appStore.userInfo.role === 'ROLE_ADMIN');

// （可选）有些项目后端也会给 ROLE_TEACHER / ROLE_ADMIN 以外的情况，这里你可以再加个兜底：
// const isTeacherOrAdmin = computed(() => isTeacher.value || isAdmin.value);

// ========== 响应式变量定义（指定类型） ==========

// ✅ 修复：给 form 真正加入 leaveDateRange，保证 prop/rules/model 一致
type FormData = LeaveSaveRequest & {
  studentLeaveId: number;
  state: number;
  teacherComment: string;
  adminComment: string;
  attachment: string;
  leaveDateRange: [string, string] | null;
};

// 错误处理相关
const errorMessage = ref('');
const errorVisible = ref(false);

const showError = (message: string) => {
  errorMessage.value = message;
  errorVisible.value = true;
  setTimeout(() => {
    errorVisible.value = false;
  }, 5000);
};

interface StateOption {
  value: number;
  label: string;
}

interface DialogForm {
  comment: string;
}

// 表单数据
const form = ref<FormData>({
  studentLeaveId: 0,
  studentNum: '',
  studentName: '',
  teacherId: 0,
  leaveStartDate: null,
  leaveEndDate: null,
  leaveDateRange: null,
  reason: '',
  state: 0,
  teacherComment: '',
  adminComment: '',
  attachment: ''
});

// ✅ 修复：formRef 正确类型
const formRef = ref<FormInstance>();

// 表单验证规则
const rules = {
  studentNum: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { min: 5, max: 20, message: '学号长度在 5 到 20 个字符', trigger: 'blur' }
  ],
  studentName: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  leaveDateRange: [
    { required: true, message: '请选择请假时间范围', trigger: 'change' }
  ],
  reason: [
    { required: true, message: '请输入请假原因', trigger: 'blur' },
    { min: 10, max: 500, message: '请假原因长度在 10 到 500 个字符', trigger: 'blur' }
  ],
  teacherId: [
    { required: true, message: '请选择教师', trigger: 'change' }
  ]
};

// 请假列表数据
const leaveList = ref<LeaveItem[]>([]);

// 教师选项列表
const teacherOptions = ref<TeacherOption[]>([]);

// 状态选项
const stateOptions: StateOption[] = [
  { value: -1, label: '全部' },
  { value: 0, label: '待审批' },
  { value: 1, label: '已批准' },
  { value: 2, label: '已拒绝' },
  { value: 3, label: '管理员已批准' },
  { value: 4, label: '管理员已拒绝' }
];

// 文件上传相关
const fileList = ref<UploadFile[]>([]);
const isUploading = ref(false);

// 加载状态
const loading = ref({
  teacherOptions: false,
  leaveList: false,
  submitForm: false,
  checkItem: false,
  batchCheck: false
});

// 选中的行
const selectedRows = ref<LeaveItem[]>([]);

// 审核对话框状态
const dialogVisible = ref(false);
const dialogForm = ref<DialogForm>({
  comment: ''
});

// 当前审核的请假记录
const currentCheckItem = ref<LeaveItem | null>(null);
const currentCheckState = ref(0);

// 搜索条件
const searchParams = ref<LeaveSearchParams>({
  state: -1,
  search: ''
});

// ========= 工具：判断是不是“表单校验错误” =========
const isFormValidateError = (error: unknown): boolean => {
  // element-plus validate 的 reject 值在不同版本可能是 false / object / Error-like
  if (error === false) return true;
  if (typeof error === 'object' && error !== null) {
    const e = error as any;
    if (e?.name === 'FormValidationError') return true;
  }
  return false;
};

// ========== 方法定义 ==========

// 加载教师选项
const loadTeacherOptions = async () => {
  loading.value.teacherOptions = true;
  try {
    teacherOptions.value = await getTeacherItemOptionList();
    console.log("teacherOptions =", teacherOptions.value);
  } catch (e) {
    console.error(e);
    teacherOptions.value = [];
  } finally {
    loading.value.teacherOptions = false;
  }
};




// 加载请假列表
const loadLeaveList = async () => {
  loading.value.leaveList = true;
  try {
    const res = await getStudentLeaveList(searchParams.value);
    leaveList.value = res;
  } catch (error) {
    console.error('加载请假列表失败:', error);
    ElMessage.error('加载请假列表失败');
  } finally {
    loading.value.leaveList = false;
  }
};

// 提交表单
const submitForm = async () => {
  loading.value.submitForm = true;
  try {
    // ✅ 提交前同步 start/end（后端需要这两个字段）
    if (form.value.leaveDateRange) {
      form.value.leaveStartDate = form.value.leaveDateRange[0];
      form.value.leaveEndDate = form.value.leaveDateRange[1];
    } else {
      form.value.leaveStartDate = null;
      form.value.leaveEndDate = null;
    }

    // 表单验证
    await formRef.value?.validate();

    // 提交数据（studentLeaveSave 接口参数类型为 LeaveSaveRequest；多余字段 TS 不影响运行）
    await studentLeaveSave({
      studentLeaveId: form.value.studentLeaveId,
      studentNum: form.value.studentNum,
      studentName: form.value.studentName,
      teacherId: form.value.teacherId,
      leaveStartDate: form.value.leaveStartDate,
      leaveEndDate: form.value.leaveEndDate,
      reason: form.value.reason,
      attachment: form.value.attachment,
      state: form.value.state
    });

    ElMessage.success('提交成功');
    resetForm();
    loadLeaveList();
  } catch (error: unknown) {
    // ✅ 修复：error 是 unknown，不能直接 error.name
    if (!isFormValidateError(error)) {
      console.error('提交失败:', error);
      ElMessage.error('提交失败');
    }
  } finally {
    loading.value.submitForm = false;
  }
};

// 文件选择变化处理
const handleFileChange = (file: UploadFile) => {
  fileList.value = [file];
};

// 文件上传
const uploadFile = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择文件');
    return;
  }

  try {
    isUploading.value = true;
    const file = fileList.value[0].raw;
    if (!file) return;

    const uploader = form.value.studentNum || 'unknown';
    const res = await uploadAttachment(file, uploader);
    form.value.attachment = res.data.filePath;
    ElMessage.success('文件上传成功');
  } catch (error) {
    console.error('文件上传失败:', error);
    ElMessage.error('文件上传失败');
  } finally {
    isUploading.value = false;
  }
};

const getFileName = (filePath: string): string => {
  if (!filePath) return '';
  const parts = filePath.split('/');
  return parts[parts.length - 1] || '';
};

// 重置表单
const resetForm = () => {
  form.value = {
    studentLeaveId: 0,
    studentNum: '',
    studentName: '',
    teacherId: 0,
    leaveStartDate: null,
    leaveEndDate: null,
    leaveDateRange: null,
    reason: '',
    state: 0,
    teacherComment: '',
    adminComment: '',
    attachment: ''
  };
  fileList.value = [];
};

// ✅ 修复：严格映射字段，避免 form.value = {...row} 类型错误
const editItem = (row: LeaveItem) => {
  const matchedTeacher = teacherOptions.value.find(
    (item) => item.label === row.teacherName
  );

  form.value = {
    // LeaveSaveRequest 基础字段
    studentLeaveId: row.studentLeaveId ?? 0,
    studentNum: row.studentNum ?? '',
    studentName: row.studentName ?? '',
    teacherId: matchedTeacher?.value ?? 0,
    leaveStartDate: row.leaveStartDate ?? null,
    leaveEndDate: row.leaveEndDate ?? null,
    reason: row.reason ?? '',
    attachment: form.value.attachment ?? '',

    // 扩展字段（用于页面显示/编辑）
    state: row.state ?? 0,
    teacherComment: row.teacherComment ?? '',
    adminComment: row.adminComment ?? '',

    // ✅ 让 daterange 回显
    leaveDateRange:
      row.leaveStartDate && row.leaveEndDate ? [row.leaveStartDate, row.leaveEndDate] : null
  };
};

// 打开审核对话框
const checkItem = (row: LeaveItem, state: number) => {
  currentCheckItem.value = row;
  currentCheckState.value = state;
  dialogForm.value.comment = '';
  dialogVisible.value = true;
};

// 确认审核
const confirmCheck = async () => {
  if (!currentCheckItem.value) return;

  loading.value.checkItem = true;
  try {
    const params = {
      studentLeaveId: currentCheckItem.value.studentLeaveId,
      state: currentCheckState.value,
      teacherComment: dialogForm.value.comment,
      adminComment: dialogForm.value.comment
    };
    await studentLeaveCheck(params);
    ElMessage.success('审核成功');
    dialogVisible.value = false;
    loadLeaveList();
  } catch (error) {
    console.error('审核失败:', error);
    ElMessage.error('审核失败');
  } finally {
    loading.value.checkItem = false;
  }
};

// 导出请假数据
const handleExport = async () => {
  try {
    await exportLeaveList(searchParams.value);
    ElMessage.success('导出请求已发送，请等待下载');
  } catch (error) {
    console.error('导出数据失败:', error);
  }
};

// 处理选择行变化
const handleSelectionChange = (selection: LeaveItem[]) => {
  selectedRows.value = selection;
};

// 批量批准
const batchApprove = async () => {
  await batchProcess(1, '批量批准');
};

// 批量拒绝
const batchReject = async () => {
  await batchProcess(2, '批量拒绝');
};

// 批量处理
const batchProcess = async (state: number, actionName: string) => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要操作的记录');
    return;
  }

  loading.value.batchCheck = true;
  try {
    for (const item of selectedRows.value) {
      if (item.state === 0) {
        await studentLeaveCheck({
          studentLeaveId: item.studentLeaveId,
          state,
          teacherComment: actionName,
          adminComment: actionName
        });
      }
    }

    ElMessage.success(`${actionName}成功`);
    selectedRows.value = [];
    loadLeaveList();
  } catch (error) {
    console.error(`${actionName}失败:`, error);
    ElMessage.error(`${actionName}失败`);
  } finally {
    loading.value.batchCheck = false;
  }
};

// 通知相关
const notificationVisible = ref(false);
const notificationMessage = ref('');
let checkNotificationTimer: number | null = null;
let lastCheckTime = Date.now();

// 检查新的审核通知（保持你原逻辑）
const checkNotifications = async () => {
  try {
    const currentTime = Date.now();
    const res = await getStudentLeaveList(searchParams.value);

    const newNotifications = res.filter((item) => {
      return item.state !== 0 &&
        (item.teacherComment || item.adminComment) &&
        (currentTime - lastCheckTime < 300000);
    });

    if (newNotifications.length > 0) {
      notificationMessage.value = `${newNotifications.length} 条请假申请已审核完成`;
      notificationVisible.value = true;
      setTimeout(() => {
        notificationVisible.value = false;
      }, 5000);
      loadLeaveList();
    }

    lastCheckTime = currentTime;
  } catch (error) {
    console.error('检查通知失败:', error);
  }
};

// 页面加载时执行
onMounted(() => {
  loadTeacherOptions();
  loadLeaveList();

  checkNotificationTimer = window.setInterval(() => {
    checkNotifications();
  }, 30000);
});

// 组件卸载时清除定时器
onBeforeUnmount(() => {
  if (checkNotificationTimer) {
    window.clearInterval(checkNotificationTimer);
    checkNotificationTimer = null;
  }
});
</script>

<style scoped>
/* 可以添加自定义样式 */
</style>
