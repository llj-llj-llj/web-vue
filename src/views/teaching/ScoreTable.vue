<template>
  <div class="base_form" v-loading="loading.query" element-loading-text="查询中...">
    <div class="base_header">
      <div class="blue_column"></div>
      <div class="base_title">课程管理</div>
    </div>

    <div class="base_query_oneLine">
      <div class="query_left">
        <button class="commButton" @click="addItem()">添加</button>
        <input 
          style="margin-left: 10px" 
          type="file" 
          id="file" 
          accept=".xlsx,.xls" 
          @change="handleFileChange" 
        />
        <button class="commButton" @click="uploadExcel" :disabled="loading.upload">
          {{ loading.upload ? '导入中...' : '批量导入' }}
        </button>
        <button class="commButton" @click="generateReportCard" :disabled="loading.query">
          {{ loading.query ? '生成中...' : '生成成绩单' }}
        </button>
      </div>
      <div class="query_right">
        <span style="margin-top: 5px">学生</span>
        <select class="commInput" v-model="personId">
          <option value="0">请选择...</option>
          <option v-for="item in studentList" :key="item.id" :value="item.id">
            {{ item.title }}
          </option>
        </select>
        <span style="margin-top: 5px">课程</span>
        <select class="commInput" v-model="courseId">
          <option value="0">请选择...</option>
          <option v-for="item in courseList" :key="item.id" :value="item.id">
            {{ item.title }}
          </option>
        </select>
        <span style="margin-top: 5px">考试类型</span>
        <select class="commInput" v-model="examType">
          <option :value="null">请选择...</option>
          <option value="期中考试">期中考试</option>
          <option value="期末考试">期末考试</option>
          <option value="平时成绩">平时成绩</option>
          <option value="模拟考试">模拟考试</option>
        </select>
        <button style="margin-left: 5px" class="commButton" @click="query()">
          查询
        </button>
      </div>
    </div>
    <div class="table_center" style="margin-top: 5px">
      <table class="content">
        <tr class="table_th">
          <td>学号</td>
          <td>姓名</td>
          <td>班级</td>
          <td>课程号</td>
          <td @click="handleSort('courseName')">课程名</td>
          <td>学分</td>
          <td @click="handleSort('mark')">成绩</td>
          <td>操作</td>
        </tr>
        <tr v-for="item in scoreList" :key="item.scoreId">
          <td>{{ item.studentNum }}</td>
          <td>{{ item.studentName }}</td>
          <td>{{ item.className }}</td>
          <td>{{ item.courseNum }}</td>
          <td>{{ item.courseName }}</td>
          <td>{{ item.credit }}</td>
          <td>{{ item.mark }}</td>
          <td>
            <button class="table_edit_button" @click="editItem(item)">
              编辑
            </button>
            <button class="table_delete_button" @click="deleteItem(item.scoreId)" :disabled="loading.delete">
              {{ loading.delete ? '删除中...' : '删除' }}
            </button>
          </td>
        </tr>
      </table>
    </div>
    <!-- 分页区域 -->
    <div class="pagin">
      <el-pagination background style="margin-top: 15px" :total="pagination.dataTotal"
        :current-page="pagination.currentPage" :page-size="pagination.pageSize" @current-change="handleChangePage"
        layout="total, prev, pager, next, jumper" />
    </div>
    
    <!-- 成绩查询/分析区域 -->
    <div v-if="isStudent" class="analysis-section">
      <h3>个人成绩分析</h3>
      <div class="student-analysis">
        <div class="total-info">
          <div class="info-item">
            <span class="label">总分：</span>
            <span class="value">{{ studentAnalysis.totalScore }}</span>
          </div>
          <div class="info-item">
            <span class="label">排名：</span>
            <span class="value">{{ studentAnalysis.ranking }}</span>
          </div>
        </div>
        <div class="subjects-table">
          <h4>各科成绩</h4>
          <table class="content">
            <tr class="table_th">
              <td>课程名</td>
              <td>成绩</td>
              <td>学分</td>
              <td>考试类型</td>
            </tr>
            <tr v-for="item in studentAnalysis.subjects" :key="item.courseId">
              <td>{{ item.courseName }}</td>
              <td>{{ item.mark }}</td>
              <td>{{ item.credit }}</td>
              <td>{{ item.examType || '期末考试' }}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
    
    <!-- 教师成绩分析区域 -->
    <div v-if="isTeacher" class="analysis-section">
      <h3>班级成绩分析</h3>
      <div class="teacher-analysis">
        <div class="class-info">
          <div class="info-item">
            <span class="label">平均分：</span>
            <span class="value">{{ classAnalysis.averageScore.toFixed(2) }}</span>
          </div>
          <div class="info-item">
            <span class="label">最高分：</span>
            <span class="value">{{ classAnalysis.highestScore }}</span>
          </div>
          <div class="info-item">
            <span class="label">及格率：</span>
            <span class="value">{{ (classAnalysis.passRate * 100).toFixed(2) }}%</span>
          </div>
        </div>
        
        <div class="charts-container">
          <div class="chart-item">
            <h4>科目平均分对比</h4>
            <ECharts class="chart" :option="barChartOption" />
          </div>
          <div class="chart-item">
            <h4>成绩趋势分析</h4>
            <ECharts class="chart" :option="lineChartOption" />
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- 成绩修改对话框显示 -->
  <dialog id="favDialog" onclose="close()" style="
      position: absolute;
      top: 300px;
      left: 300px;
      width: 300px;
      height: 210px;
    ">
    <div class="base_title">成绩添加修改对话框</div>
    <div class="dialog-div" style="margin-top: 5px">
      <table class="dialog-content">
        <tr>
          <td colspan="1" style="text-align: right">学生</td>
          <td colspan="1">
            <select 
              class="commInput" 
              v-model="editedItem.personId"
              @change="validatePersonId"
            >
              <option value="0">请选择...</option>
              <option v-for="item in studentList" :key="item.id" :value="item.id">
                {{ item.title }}
              </option>
            </select>
            <div v-if="validationErrors.personId" class="error-message">{{ validationErrors.personId }}</div>
          </td>
        </tr>
        <tr>
          <td colspan="1" style="text-align: right">课程</td>
          <td colspan="1">
            <select 
              class="commInput" 
              v-model="editedItem.courseId"
              @change="validateCourseId"
            >
              <option value="0">请选择...</option>
              <option v-for="item in courseList" :key="item.id" :value="item.id">
                {{ item.title }}
              </option>
            </select>
            <div v-if="validationErrors.courseId" class="error-message">{{ validationErrors.courseId }}</div>
          </td>
        </tr>
        <tr>
        <td colspan="1" style="text-align: right">成绩</td>
        <td colspan="1">
          <input 
            :value="editedItem.mark" 
            class="commInput" 
            @input="handleMarkInput" 
            type="number"
            step="0.1"
            min="0"
            max="100"
          />
          <div v-if="validationErrors.mark" class="error-message">{{ validationErrors.mark }}</div>
        </td>
      </tr>
        <tr>
          <td colspan="2">
            <button class="commButton" @click="close()" style="margin-right: 30px">
              取消
            </button>
            <button 
              class="commButton" 
              @click="confirm()"
              :disabled="!isFormValid || loading.save"
              :class="{ 'disabled-button': !isFormValid || loading.save }"
            >
              {{ loading.save ? '保存中...' : '保存' }}
            </button>
          </td>
        </tr>
      </table>
    </div>
  </dialog>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted, computed } from "vue";
import {
  getScoreList,
  getStudentItemOptionList,
  getCourseItemOptionList,
  scoreSave,
  scoreDelete,
} from "~/services/teachingServ";
import { type OptionItem, type ScoreItem as BaseScoreItem } from "~/models/general";

// 扩展ScoreItem接口，添加examType属性
export interface ScoreItem extends BaseScoreItem {
  examType?: string;
}
import { uploadRequest, downloadPost } from "~/services/genServ";
import { ElMessage, ElMessageBox } from "element-plus";
import { useAppStore } from "~/stores/app";
import { use } from "echarts/core";
import { BarChart, LineChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import ECharts from "vue-echarts";

// 注册必要的组件
use([BarChart, LineChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);
export default defineComponent({
  components: {
    ECharts
  },
  data: () => ({
    scoreList: [] as ScoreItem[],
    personId: null,
    courseId: null,
    editedItem: {} as ScoreItem,
    studentList: [] as OptionItem[],
    courseList: [] as OptionItem[],
    deleteId: -1,
    // 分页状态
    pagination: {
      currentPage: 1,
      pageSize: 10,
      dataTotal: 0
    },
    // 排序状态
    sort: {
      sortBy: '',
      sortDesc: false
    },
    // 加载状态
    loading: {
      query: false,
      save: false,
      delete: false,
      upload: false,
      analysis: false
    },
    // 批量导入相关
    selectedFile: null as File | null,
    // 表单验证错误信息
    validationErrors: {
      mark: '',
      personId: '',
      courseId: ''
    },
    // 成绩分析相关
    userRole: '',
    examType: null,
    // 学生成绩分析
    studentAnalysis: {
      totalScore: 0,
      ranking: 0,
      subjects: [] as ScoreItem[]
    },
    // 班级成绩分析
    classAnalysis: {
      averageScore: 0,
      highestScore: 0,
      passRate: 0,
      subjectScores: [] as Array<{
        courseName: string;
        averageScore: number;
        highestScore: number;
        passRate: number;
      }>
    },
    // 图表配置
    barChartOption: {},
    lineChartOption: {}
  }),
  computed: {
    // 获取用户角色
    isStudent() {
      return this.userRole === 'STUDENT';
    },
    isTeacher() {
      return this.userRole === 'TEACHER';
    },
    isAdmin() {
      return this.userRole === 'ADMIN';
    },
    // 检查表单是否可以提交
    isFormValid() {
      // 验证所有必填项和成绩
      this.validatePersonId();
      this.validateCourseId();
      this.validateMark(); // 成绩现在是必填项，总是验证
      
      // 只有当所有必填项都已选择且没有验证错误时，表单才有效
      return !this.validationErrors.personId && 
             !this.validationErrors.courseId && 
             !this.validationErrors.mark && 
             (this.editedItem.personId && this.editedItem.personId != 0) && 
             (this.editedItem.courseId && this.editedItem.courseId != 0);
    }
  },
  created() {
    const appStore = useAppStore();
    this.userRole = appStore.userInfo.role || '';
    this.initialize();
  },

  methods: {
    // 初始化,获取学生选择项列表和课程选择项列表
    async initialize() {
      try {
        this.loading.query = true;
        // 并行获取学生和课程列表，提高性能
        const [students, courses] = await Promise.all([
          getStudentItemOptionList(),
          getCourseItemOptionList()
        ]);
        this.studentList = students;
        this.courseList = courses;
        // 查询成绩数据
        await this.query();
      } finally {
        this.loading.query = false;
      }
    },
    // 分页变化处理
    handleChangePage(val: number) {
      this.pagination.currentPage = val;
      this.query();
    },
    // 排序处理
    handleSort(sortBy: string) {
      if (this.sort.sortBy === sortBy) {
        this.sort.sortDesc = !this.sort.sortDesc;
      } else {
        this.sort.sortBy = sortBy;
        this.sort.sortDesc = false;
      }
      // 重新查询数据
      this.pagination.currentPage = 1;
      this.query();
    },
    // 处理成绩输入事件，转换为数字类型
    handleMarkInput(event: Event) {
      const input = event.target as HTMLInputElement;
      // 如果输入为空，设置为null
      this.editedItem.mark = input.value ? Number(input.value) : 0;
      this.validateMark();
    },
    
    // 验证成绩是否在0-100之间
    validateMark() {
      // 成绩不能为空
      if (this.editedItem.mark === undefined || this.editedItem.mark === null) {
        this.validationErrors.mark = '成绩不能为空';
        return;
      }
      
      // 处理数字类型，确保在0-100之间
      const mark = Number(this.editedItem.mark);
      if (isNaN(mark)) {
        this.validationErrors.mark = '请输入有效的成绩';
      } else if (mark < 0 || mark > 100) {
        this.validationErrors.mark = '成绩需在0-100之间';
      } else {
        this.validationErrors.mark = '';
      }
    },
    // 验证学生选择是否必填
    validatePersonId() {
      if (this.editedItem.personId == 0) {
        this.validationErrors.personId = '请选择学生';
      } else {
        this.validationErrors.personId = '';
      }
    },
    // 验证课程选择是否必填
    validateCourseId() {
      if (this.editedItem.courseId == 0) {
        this.validationErrors.courseId = '请选择课程';
      } else {
        this.validationErrors.courseId = '';
      }
    },
    // 查询
    async query() {
      try {
        this.loading.query = true;
        const res = await getScoreList(
          this.personId, 
          this.courseId,
          this.pagination.currentPage,
          this.pagination.pageSize,
          this.sort.sortBy,
          this.sort.sortDesc,
          this.examType
        );
        // 正确处理API返回的直接数组
        const allScores = res || [];
        // 设置总数据量
        this.pagination.dataTotal = allScores.length;
        
        // 实现前端分页
        const startIndex = (this.pagination.currentPage - 1) * this.pagination.pageSize;
        const endIndex = startIndex + this.pagination.pageSize;
        this.scoreList = allScores.slice(startIndex, endIndex);
        
        // 计算成绩分析 - 使用完整数据集allScores进行分析
        if (this.isStudent) {
          this.calculateStudentAnalysis(allScores);
        } else if (this.isTeacher) {
          this.calculateClassAnalysis(allScores);
          this.generateCharts();
        }
      } finally {
        this.loading.query = false;
      }
    },
    // 添加成绩,显示成绩修改对画框
    addItem() {
      this.editedItem = { personId: 0, courseId: 0 } as ScoreItem;
      // 清空验证错误信息
      this.validationErrors.mark = '';
      this.validationErrors.personId = '';
      this.validationErrors.courseId = '';
      const dialog = document.getElementById("favDialog") as HTMLDialogElement;
      dialog.show();
    },
    // 编辑成绩,显示成绩修改对画框
    editItem(item: ScoreItem) {
      this.editedItem = item;
      // 清空验证错误信息
      this.validationErrors.mark = '';
      this.validationErrors.personId = '';
      this.validationErrors.courseId = '';
      const dialog = document.getElementById("favDialog") as HTMLDialogElement;
      dialog.show();
    },
    // 关闭成绩修改对话框
    close() {
      const dialog = document.getElementById("favDialog") as HTMLDialogElement;
      dialog.close();
    },
    // 确认成绩修改对话框
    async confirm() {
      // 进行最终验证
      this.validatePersonId();
      this.validateCourseId();
      this.validateMark();
      
      // 检查是否有验证错误
      if (this.validationErrors.personId || this.validationErrors.courseId || this.validationErrors.mark) {
        ElMessage.warning("请检查表单填写是否正确");
        return;
      }
      
      this.close();
      try {
        this.loading.save = true;
        const res = await scoreSave(
          // 新增时scoreId为undefined或0，编辑时为实际ID
          this.editedItem.scoreId || 0,
          this.editedItem.personId,
          this.editedItem.courseId,
          this.editedItem.mark
        );
        if (res.code == 0) {
          ElMessage.success("保存成功");
          this.query();
        } else {
          ElMessage.error(res.msg);
        }
      } finally {
        this.loading.save = false;
      }
    },
    // 删除成绩
    async deleteItem(scoreId: number) {
      try {
        await ElMessageBox.confirm("确认删除吗?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        });
        
        this.loading.delete = true;
        const res = await scoreDelete(scoreId);
        if (res.code == 0) {
          ElMessage.success("删除成功");
          this.query();
        } else {
          ElMessage.error(res.msg);
        }
      } catch (error: any) {
        // 用户取消删除操作
        if (error.name === 'ElMessageBoxCancel') {
          return;
        }
        ElMessage.error("删除操作失败");
      } finally {
        this.loading.delete = false;
      }
    },
    // 处理文件选择
    handleFileChange(event: Event) {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        const file = input.files[0];
        
        // 验证文件类型
        const validExtensions = ['.xlsx', '.xls'];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!fileExtension || !validExtensions.includes(fileExtension)) {
          ElMessage.warning('请选择Excel文件（.xlsx或.xls格式）');
          input.value = ''; // 清空选择
          this.selectedFile = null;
          return;
        }
        
        // 验证文件大小（限制为5MB）
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          ElMessage.warning('文件大小不能超过5MB');
          input.value = ''; // 清空选择
          this.selectedFile = null;
          return;
        }
        
        this.selectedFile = file;
        ElMessage.success(`已选择文件: ${file.name}`);
      }
    },
    // 上传Excel文件
    async uploadExcel() {
      if (!this.selectedFile) {
        ElMessage.warning("请选择要导入的Excel文件");
        return;
      }
      
      try {
        this.loading.upload = true;
        
        // 创建FormData对象
        const formData = new FormData();
        formData.append("file", this.selectedFile);
        
        // 使用uploadRequest上传文件
        const res = await uploadRequest("/api/score/importScoreExcel", formData);
        
        if (res.code == 0) {
          ElMessage.success("批量导入成功");
          this.query();
          // 清空选择的文件
          const input = document.getElementById("file") as HTMLInputElement;
          if (input) input.value = '';
          this.selectedFile = null;
        } else {
          ElMessage.error(res.msg);
        }
      } catch (error) {
        ElMessage.error("导入失败，请检查文件格式是否正确");
      } finally {
        this.loading.upload = false;
      }
    },
    // 计算学生成绩分析
    calculateStudentAnalysis(allScores: ScoreItem[]) {
      const appStore = useAppStore();
      const studentId = appStore.userInfo.id;
      
      // 获取当前学生的所有成绩
      const studentScores = allScores.filter(item => item.personId === studentId);
      this.studentAnalysis.subjects = studentScores;
      
      // 计算总分
      this.studentAnalysis.totalScore = studentScores.reduce((sum, item) => sum + (item.mark || 0), 0);
      
      // 计算排名（假设当前查询结果包含所有学生的成绩）
      if (allScores.length > 0) {
        // 按班级分组计算排名
        const classGroups = allScores.reduce((groups, item) => {
          const className = item.className;
          if (!groups[className]) {
            groups[className] = [];
          }
          // 按学生分组计算总分
          const studentGroup = groups[className].find(group => group.studentId === item.personId);
          if (studentGroup) {
            studentGroup.totalScore += (item.mark || 0);
          } else {
            groups[className].push({
              studentId: item.personId,
              studentName: item.studentName,
              totalScore: item.mark || 0
            });
          }
          return groups;
        }, {} as Record<string, Array<{ studentId: number; studentName: string; totalScore: number }>>);
        
        // 找到当前学生所在的班级
        if (studentScores.length > 0) {
          const currentStudent = studentScores[0];
          if (currentStudent && currentStudent.className) {
            const classScores = classGroups[currentStudent.className] || [];
            
            // 按总分降序排序
            classScores.sort((a, b) => b.totalScore - a.totalScore);
            
            // 找到当前学生的排名
            const rank = classScores.findIndex(item => item.studentId === studentId) + 1;
            this.studentAnalysis.ranking = rank;
          }
        }
      } else {
        this.studentAnalysis.ranking = 0;
      }
    },
    // 计算班级成绩分析
    calculateClassAnalysis(allScores: ScoreItem[]) {
      if (allScores.length === 0) {
        this.classAnalysis = {
          averageScore: 0,
          highestScore: 0,
          passRate: 0,
          subjectScores: []
        };
        return;
      }
      
      // 计算全班平均分
      const totalScore = allScores.reduce((sum, item) => sum + (item.mark || 0), 0);
      this.classAnalysis.averageScore = totalScore / allScores.length;
      
      // 计算最高分
      this.classAnalysis.highestScore = Math.max(...allScores.map(item => item.mark || 0));
      
      // 计算及格率（60分及以上为及格）
      const passCount = allScores.filter(item => (item.mark || 0) >= 60).length;
      this.classAnalysis.passRate = passCount / allScores.length;
      
      // 按科目分组计算
      const subjectGroups = allScores.reduce((groups, item) => {
        const courseName = item.courseName;
        if (!groups[courseName]) {
          groups[courseName] = [];
        }
        groups[courseName].push(item);
        return groups;
      }, {} as Record<string, ScoreItem[]>);
      
      // 计算各科目成绩分析
      this.classAnalysis.subjectScores = Object.keys(subjectGroups).map(courseName => {
        const scores = subjectGroups[courseName];
        const subjectTotalScore = scores.reduce((sum, item) => sum + (item.mark || 0), 0);
        const subjectAverageScore = subjectTotalScore / scores.length;
        const subjectHighestScore = Math.max(...scores.map(item => item.mark || 0));
        const subjectPassCount = scores.filter(item => (item.mark || 0) >= 60).length;
        const subjectPassRate = subjectPassCount / scores.length;
        
        return {
          courseName,
          averageScore: subjectAverageScore,
          highestScore: subjectHighestScore,
          passRate: subjectPassRate
        };
      });
    },
    // 生成图表
    generateCharts() {
      const hasData = this.classAnalysis.subjectScores.length > 0;
      const subjectNames = hasData ? this.classAnalysis.subjectScores.map(item => item.courseName) : ['暂无数据'];
      
      // 柱状图配置：科目平均分对比
      this.barChartOption = {
        title: {
          text: hasData ? '各科目平均分对比' : '暂无成绩数据'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'category',
          data: subjectNames
        },
        yAxis: {
          type: 'value',
          name: '平均分',
          min: 0,
          max: 100
        },
        series: [
          {
            name: '平均分',
            type: 'bar',
            data: hasData ? this.classAnalysis.subjectScores.map(item => item.averageScore) : [0],
            itemStyle: {
              color: '#5470c6'
            },
            // 数据为空时隐藏柱子
            ...(!hasData && { itemStyle: { opacity: 0 } })
          }
        ]
      };
      
      // 折线图配置：科目及格率趋势
      this.lineChartOption = {
        title: {
          text: hasData ? '各科目及格率趋势' : '暂无成绩数据'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: subjectNames
        },
        yAxis: {
          type: 'value',
          name: '及格率',
          min: 0,
          max: 100,
          axisLabel: {
            formatter: '{value}%'
          }
        },
        series: [
          {
            name: '及格率',
            type: 'line',
            data: hasData ? this.classAnalysis.subjectScores.map(item => (item.passRate * 100)) : [0],
            itemStyle: {
              color: '#91cc75'
            },
            lineStyle: {
              width: 3
            },
            // 数据为空时隐藏线条
            ...(!hasData && { itemStyle: { opacity: 0 }, lineStyle: { opacity: 0 } })
          }
        ]
      };
    },
    
    // 生成成绩报告单PDF
    async generateReportCard() {
      try {
        this.loading.query = true;
        
        // 构建文件名
        let fileName = '成绩报告单.pdf';
        if (this.personId && this.personId !== 0) {
          // 查找当前学生信息
          const student = this.studentList.find(item => item.id === this.personId);
          if (student) {
            fileName = `${student.title}_成绩报告单.pdf`;
          }
        }
        
        // 准备请求参数
        const params = {
          personId: this.personId || null,
          courseId: this.courseId || null,
          examType: this.examType || null
        };
        
        // 调用后台接口生成并下载PDF
        const res = await downloadPost(
          '/api/teaching/generateScoreReport',
          fileName,
          params
        );
        
        if (res) {
          ElMessage.success('成绩报告单生成成功！');
        } else {
          ElMessage.error('成绩报告单生成失败！');
        }
      } catch (error) {
        console.error('生成成绩报告单失败:', error);
        ElMessage.error('生成成绩报告单失败，请稍后重试！');
      } finally {
        this.loading.query = false;
      }
    },
  },
});
</script>

<style scoped>
.error-message {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1;
}

.disabled-button {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
}

/* 成绩分析区域样式 */
.analysis-section {
  margin-top: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.analysis-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 10px;
}

/* 学生成绩分析样式 */
.student-analysis {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.total-info {
  display: flex;
  gap: 40px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-item .label {
  font-weight: bold;
  color: #666;
}

.info-item .value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.subjects-table h4 {
  margin-bottom: 15px;
  color: #333;
}

/* 教师成绩分析样式 */
.teacher-analysis {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.class-info {
  display: flex;
  gap: 40px;
  margin-bottom: 20px;
}

.charts-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.chart-item {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.1);
}

.chart-item h4 {
  margin-bottom: 15px;
  color: #333;
  text-align: center;
}

.chart {
  width: 100%;
  height: 400px;
}
</style>
