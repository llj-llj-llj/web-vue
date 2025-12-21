<template>
  <div class="base_form" v-loading="loading.query" element-loading-text="查询中...">
    <div class="base_header">
      <div class="blue_column"></div>
      <div class="base_title">{{ isStudent ? '我的成绩' : '成绩管理' }}</div>
    </div>

    <div class="base_query_oneLine">
      <div class="query_left">
        <!-- 只有教师和管理员可以添加成绩 -->
        <button v-if="!isStudent" class="commButton" @click="addItem()">添加</button>

      </div>
      <div class="query_right">
        <!-- 教师和管理员可以选择学生 -->
        <div v-if="!isStudent" style="display: flex; align-items: center;">
          <span style="margin-top: 5px">学生</span>
          <select class="commInput" v-model="personId">
            <option value="0">请选择...</option>
            <option v-for="item in studentList" :key="item.id" :value="item.id">
              {{ item.title }}
            </option>
          </select>
        </div>
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
          <td v-if="!isStudent">学号</td>
          <td>{{ isStudent ? '我的' : '学生' }}姓名</td>
          <td v-if="!isStudent">班级</td>
          <td v-if="!isStudent">课程号</td>
          <td @click="handleSort('courseName')">课程名</td>
          <td>考试类型</td>
          <td>学分</td>
          <td @click="handleSort('mark')">成绩</td>
          <td v-if="!isStudent">操作</td>
        </tr>
        <tr v-for="item in scoreList" :key="item.scoreId">
          <td v-if="!isStudent">{{ item.studentNum }}</td>
          <td>{{ item.studentName }}</td>
          <td v-if="!isStudent">{{ item.className }}</td>
          <td v-if="!isStudent">{{ item.courseNum }}</td>
          <td>{{ item.courseName }}</td>
          <td>{{ item.examType || '期末考试' }}</td>
          <td>{{ item.credit }}</td>
          <td>{{ (item.mark || 0).toFixed(2) }}</td>
          <td v-if="!isStudent">
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
            <span class="label">最终成绩：</span>
            <span class="value">{{ studentAnalysis.weightedAverageScore.toFixed(2) }}</span>
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
              <td>最终成绩</td>
              <td>成绩水平</td>
              <td>学分</td>
            </tr>
            <tr v-for="item in studentAnalysis.courseFinalScores" :key="item.courseId">
              <td>{{ item.courseName }}</td>
              <td>{{ item.finalScore.toFixed(2) }}</td>
              <td>
                <span :class="getGradeLevel(item.finalScore).class">
                  {{ getGradeLevel(item.finalScore).text }}
                </span>
              </td>
              <td>{{ item.credit }}</td>
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
            <span class="value">{{ classAnalysis.weightedAverageScore.toFixed(2) }}</span>
          </div>
          <div class="info-item">
            <span class="label">最高分：</span>
            <span class="value">{{ classAnalysis.highestScore.toFixed(2) }}</span>
          </div>
          <div class="info-item">
            <span class="label">及格率：</span>
            <span class="value">{{ (classAnalysis.passRate * 100).toFixed(2) }}%</span>
          </div>
        </div>
        
        <!-- 考试类型权重说明 -->
        <div class="weight-info">
          <h4>考试类型权重说明</h4>
          <div class="weight-list">
            <div v-for="(weight, examType) in examTypeWeights" :key="examType" class="weight-item">
              <span class="exam-type">{{ examType }}：</span>
              <span class="weight-value">{{ (weight * 100).toFixed(0) }}%</span>
            </div>
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
      top: 200px;
      left: 300px;
      width: 450px;
      height: 450px;
    ">
    <div class="base_title">成绩添加修改</div>
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
          <td colspan="1" style="text-align: right">考试类型</td>
          <td colspan="1">
            <select 
              class="commInput" 
              v-model="editedItem.examType"
              @change="validateExamType"
            >
              <option value="">请选择...</option>
              <option value="期中考试">期中考试</option>
              <option value="期末考试">期末考试</option>
              <option value="平时成绩">平时成绩</option>
              <option value="模拟考试">模拟考试</option>
            </select>
            <div v-if="validationErrors.examType" class="error-message">{{ validationErrors.examType }}</div>
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
            <div v-if="validationErrors.duplicate" class="error-message">{{ validationErrors.duplicate }}</div>
          </td>
      </tr>
        <tr>
          <td colspan="2">
            <button class="commButton" @click="close()" style="margin-right: 170px">
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
import { getScoreList, getStudentItemOptionList, getCourseItemOptionList, scoreSave, scoreDelete, getStudentFinalScoreAnalysis, getClassFinalScoreAnalysis } from "~/services/teachingServ";
import { type DataResponse, type ScoreItem, type OptionItem } from "~/models/general";
import { downloadPost } from "~/services/genServ";
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
    allScoresList: [] as ScoreItem[], // 存储完整数据集用于校验和分析
    personId: null as number | null,
    courseId: null as number | null,
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
      analysis: false
    },
    // 表单验证错误信息
    validationErrors: {
      mark: '',
      personId: '',
      courseId: '',
      examType: '',
      duplicate: ''
    },
    // 成绩分析相关
    examType: null as string | null,
    // 学生成绩分析
    studentAnalysis: {
      studentId: 0,
      studentName: '',
      studentNum: '',
      className: '',
      totalCredits: 0,
      totalScore: 0,
      weightedAverageScore: 0,  // 加权平均分
      ranking: 0,
      subjects: [] as ScoreItem[],
      courseFinalScores: [] as Array<{
        courseId: number;
        courseName: string;
        courseNum: string;
        credit: number;
        finalScore: number;
        courseRanking: number;
        examTypeScores: Array<{
          examType: string;
          score: number;
          weight: number;
        }>;
      }>
    },
    // 班级成绩分析
    classAnalysis: {
      averageScore: 0,
      weightedAverageScore: 0,  // 加权平均分
      highestScore: 0,
      passRate: 0,
      subjectScores: [] as Array<{
        courseName: string;
        averageScore: number;
        weightedAverageScore: number;
        highestScore: number;
        passRate: number;
      }>
    },
    // 考试类型权重配置
    examTypeWeights: {} as Record<string, number>,
    // 图表配置
    barChartOption: {},
    lineChartOption: {}
  }),
  computed: {
    // 获取用户角色
    isStudent() {
      const appStore = useAppStore();
      return appStore.userInfo.role === 'ROLE_STUDENT';
    },
    isTeacher() {
      const appStore = useAppStore();
      return appStore.userInfo.role === 'ROLE_TEACHER';
    },
    isAdmin() {
      const appStore = useAppStore();
      return appStore.userInfo.role === 'ROLE_ADMIN';
    },
    // 检查表单是否可以提交
    isFormValid() {
      // 验证所有必填项和成绩
      this.validatePersonId();
      this.validateCourseId();
      this.validateExamType();
      this.validateMark(); // 成绩现在是必填项，总是验证
      this.validateDuplicate(); // 重复性检查
      
      // 只有当所有必填项都已选择且没有验证错误时，表单才有效
      return !this.validationErrors.personId && 
             !this.validationErrors.courseId && 
             !this.validationErrors.examType &&
             !this.validationErrors.mark && 
             !this.validationErrors.duplicate &&
             (this.editedItem.personId && this.editedItem.personId != 0) && 
             (this.editedItem.courseId && this.editedItem.courseId != 0) &&
             (this.editedItem.examType && this.editedItem.examType.trim() !== '');
    }
  },
  created() {
    this.initialize();
  },

  methods: {
    // 获取课程权重配置
    getCourseWeights(courseId: number): Record<string, number> {
      // 使用默认权重配置
      return {
        '期末考试': 0.6,
        '期中考试': 0.3,
        '平时成绩': 0.1,
        '模拟考试': 0.2
      };
    },
    
    // 初始化,获取学生选择项列表和课程选择项列表
    async initialize() {
      try {
        this.loading.query = true;
        
        if (this.isStudent) {
          // 学生只能获取课程列表和自己的ID
          const courses = await getCourseItemOptionList();
          this.courseList = courses;
          const appStore = useAppStore();
          this.personId = appStore.userInfo.id;
        } else {
          // 教师和管理员可以获取学生列表和课程列表
          const [students, courses] = await Promise.all([
            getStudentItemOptionList(),
            getCourseItemOptionList()
          ]);
          this.studentList = students;
          this.courseList = courses;
        }
        
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
      
      // 对于学生端，需要特殊处理排序，确保相同科目的成绩仍然放在一起
      if (this.isStudent) {
        // 重新查询数据
        this.pagination.currentPage = 1;
        this.query();
      } else {
        // 非学生端保持原有逻辑
        this.pagination.currentPage = 1;
        this.query();
      }
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
      // 学生变化时检查重复性
      this.validateDuplicate();
    },
    // 验证课程选择是否必填
    validateCourseId() {
      if (this.editedItem.courseId == 0) {
        this.validationErrors.courseId = '请选择课程';
      } else {
        this.validationErrors.courseId = '';
      }
      // 课程变化时检查重复性
      this.validateDuplicate();
    },
    // 验证考试类型是否必填
    validateExamType() {
      if (!this.editedItem.examType || this.editedItem.examType.trim() === '') {
        this.validationErrors.examType = '请选择考试类型';
      } else {
        this.validationErrors.examType = '';
      }
      // 考试类型变化时检查重复性
      this.validateDuplicate();
    },
    // 验证成绩是否重复
    validateDuplicate() {
      // 必须先有学生、课程和考试类型才能检查重复
      if (!this.editedItem.personId || this.editedItem.personId === 0 ||
          !this.editedItem.courseId || this.editedItem.courseId === 0 ||
          !this.editedItem.examType) {
        this.validationErrors.duplicate = '';
        return;
      }
      
      // 查找是否存在重复记录（使用完整数据集）
      const exists = this.allScoresList.find(item => 
        item.personId === this.editedItem.personId &&
        item.courseId === this.editedItem.courseId &&
        item.examType === this.editedItem.examType &&
        item.scoreId !== this.editedItem.scoreId // 排除编辑时的自身记录
      );
      
      if (exists) {
        this.validationErrors.duplicate = '该学生在此课程的此考试类型已存在成绩';
      } else {
        this.validationErrors.duplicate = '';
      }
    },
    // 查询
    async query() {
      try {
        this.loading.query = true;
        
        // 根据角色设置查询参数
        let queryPersonId = this.personId;
        // 对于学生角色，personId已经在初始化时设置为用户ID，无需重复获取
        
        const res = await getScoreList(
          queryPersonId, 
          this.courseId,
          this.pagination.currentPage,
          this.pagination.pageSize,
          this.sort.sortBy,
          this.sort.sortDesc,
          this.examType
        );
        // 正确处理API返回的直接数组
        const allScores = res || [];
        // 存储完整数据集用于校验和分析
        this.allScoresList = [...allScores];
        
        // 对于学生端，按课程名分组，将相同科目的成绩放在一起
        if (this.isStudent) {
          // 先按课程名分组
          const groupedScores: Record<string, ScoreItem[]> = allScores.reduce((groups: Record<string, ScoreItem[]>, item: ScoreItem) => {
            const courseName = item.courseName;
            if (!groups[courseName]) {
              groups[courseName] = [];
            }
            groups[courseName].push(item);
            return groups;
          }, {} as Record<string, ScoreItem[]>);
          
          // 对每个课程组内的成绩按考试类型排序（期末考试 > 期中考试 > 平时成绩 > 模拟考试）
          const examTypeOrder = {
            '期末考试': 1,
            '期中考试': 2,
            '平时成绩': 3,
            '模拟考试': 4
          };
          
          // 将分组后的成绩重新组合成一个数组
          let sortedScores = Object.keys(groupedScores).reduce((result, courseName) => {
            const courseScores = groupedScores[courseName];
            // 在同一课程内按考试类型排序
            courseScores.sort((a, b) => {
              // 明确类型转换，解决索引类型不匹配问题
              const examTypeA = a.examType || '期末考试';
              const examTypeB = b.examType || '期末考试';
              const orderA = examTypeOrder[examTypeA as keyof typeof examTypeOrder] ?? 5;
              const orderB = examTypeOrder[examTypeB as keyof typeof examTypeOrder] ?? 5;
              return orderA - orderB;
            });
            return result.concat(courseScores);
          }, [] as ScoreItem[]);
          
          // 如果有排序要求，对分组后的成绩进行排序
          if (this.sort.sortBy) {
            sortedScores.sort((a, b) => {
              let valueA: any, valueB: any;
              
              switch (this.sort.sortBy) {
                case 'courseName':
                  valueA = a.courseName || '';
                  valueB = b.courseName || '';
                  break;
                case 'mark':
                  valueA = a.mark || 0;
                  valueB = b.mark || 0;
                  break;
                default:
                  valueA = a[this.sort.sortBy as keyof ScoreItem] || '';
                  valueB = b[this.sort.sortBy as keyof ScoreItem] || '';
              }
              
              if (typeof valueA === 'string') {
                return this.sort.sortDesc ? 
                  valueB.localeCompare(valueA) : 
                  valueA.localeCompare(valueB);
              } else {
                return this.sort.sortDesc ? 
                  (valueB as number) - (valueA as number) : 
                  (valueA as number) - (valueB as number);
              }
            });
          }
          
          // 设置总数据量
          this.pagination.dataTotal = sortedScores.length;
          
          // 实现前端分页
          const startIndex = (this.pagination.currentPage - 1) * this.pagination.pageSize;
          const endIndex = startIndex + this.pagination.pageSize;
          this.scoreList = sortedScores.slice(startIndex, endIndex);
        } else {
          // 非学生端保持原有逻辑
          // 设置总数据量
          this.pagination.dataTotal = allScores.length;
          
          // 实现前端分页
          const startIndex = (this.pagination.currentPage - 1) * this.pagination.pageSize;
          const endIndex = startIndex + this.pagination.pageSize;
          this.scoreList = allScores.slice(startIndex, endIndex);
        }
        
        // 计算成绩分析 - 使用完整数据集allScores进行分析
        if (this.isStudent) {
          this.calculateStudentAnalysis(allScores);
        } else if (this.isTeacher) {
          await this.calculateClassAnalysis(allScores);
          this.generateCharts();
        }
      } finally {
        this.loading.query = false;
      }
    },
    // 添加成绩,显示成绩修改对画框
    addItem() {
      this.editedItem = { 
        personId: 0, 
        courseId: 0, 
        examType: '期末考试',
        mark: 0
      } as ScoreItem;
      // 清空验证错误信息
      this.validationErrors.mark = '';
      this.validationErrors.personId = '';
      this.validationErrors.courseId = '';
      this.validationErrors.examType = '';
      this.validationErrors.duplicate = '';
      const dialog = document.getElementById("favDialog") as HTMLDialogElement;
      dialog.show();
    },
    // 编辑成绩,显示成绩修改对画框
    editItem(item: ScoreItem) {
      this.editedItem = { ...item };
      // 清空验证错误信息
      this.validationErrors.mark = '';
      this.validationErrors.personId = '';
      this.validationErrors.courseId = '';
      this.validationErrors.examType = '';
      this.validationErrors.duplicate = '';
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
      this.validateExamType();
      this.validateMark();
      this.validateDuplicate();
      
      // 检查是否有验证错误
      if (this.validationErrors.personId || 
          this.validationErrors.courseId || 
          this.validationErrors.examType ||
          this.validationErrors.mark || 
          this.validationErrors.duplicate) {
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
          this.editedItem.mark,
          this.editedItem.examType
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
          this.loading.delete = false;
          return;
        }
        ElMessage.error("删除操作失败");
      } finally {
        this.loading.delete = false;
      }
    },

    // 计算学生成绩分析 - 使用后端API
    async calculateStudentAnalysis(allScores: ScoreItem[]) {
      try {
        this.loading.analysis = true;
        
        // 调用后端API获取学生最终成绩分析
        const appStore = useAppStore();
        const studentId = appStore.userInfo.id;
        
        const res = await getStudentFinalScoreAnalysis(studentId);
        
        if (res.code === 0 && res.data) {
          // 更新学生分析数据
          this.studentAnalysis.studentId = res.data.studentId;
          this.studentAnalysis.studentName = res.data.studentName;
          this.studentAnalysis.studentNum = res.data.studentNum;
          this.studentAnalysis.className = res.data.className;
          this.studentAnalysis.totalCredits = res.data.totalCredits;
          this.studentAnalysis.weightedAverageScore = res.data.weightedAverageScore || 0;
          this.studentAnalysis.ranking = res.data.classRanking || 0;
          
          // 处理课程最终成绩
          if (res.data.courseFinalScores && Array.isArray(res.data.courseFinalScores)) {
            this.studentAnalysis.courseFinalScores = res.data.courseFinalScores.map((course: any) => ({
              courseId: course.courseId,
              courseName: course.courseName,
              courseNum: course.courseNum,
              credit: course.credit,
              finalScore: course.finalScore,
              courseRanking: course.courseRanking || 0,
              examTypeScores: course.examTypeScores || []
            }));
          }
          
          // 保持与原有代码的兼容性，设置subjects字段
          this.studentAnalysis.subjects = allScores.filter(item => item.personId === studentId);
        } else {
          // 如果API调用失败，使用原有逻辑作为备选方案
          this.calculateStudentAnalysisFallback(allScores);
        }
      } catch (error) {
        console.error("获取学生最终成绩分析失败:", error);
        // 如果API调用失败，使用原有逻辑作为备选方案
        this.calculateStudentAnalysisFallback(allScores);
      } finally {
        this.loading.analysis = false;
      }
    },
    
    // 备选方案：使用原有逻辑计算学生成绩分析
    calculateStudentAnalysisFallback(allScores: ScoreItem[]) {
      const appStore = useAppStore();
      const studentId = appStore.userInfo.id;
      
      // 获取当前课程的权重配置
      const weights = this.getCourseWeights(this.courseId || 0);
      
      // 更新考试类型权重配置，用于模板显示
      this.examTypeWeights = weights;
      
      // 获取当前学生的所有成绩
      const studentScores = allScores.filter(item => item.personId === studentId);
      this.studentAnalysis.subjects = studentScores;
      
      // 计算总分
      this.studentAnalysis.totalScore = studentScores.reduce((sum, item) => sum + (item.mark || 0), 0);
      
      // 计算加权总分
      const totalWeightedScore = studentScores.reduce((sum, item) => {
        const mark = item.mark || 0;
        const examType = item.examType || '期末考试';
        const weight = weights[examType] || 0;
        return sum + (mark * weight);
      }, 0);
      
      // 计算总权重
      const totalWeight = studentScores.reduce((sum, item) => {
        const examType = item.examType || '期末考试';
        return sum + (weights[examType] || 0);
      }, 0);
      
      // 计算加权平均分
      this.studentAnalysis.weightedAverageScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
      
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
      
      // 计算各科最终成绩和单科排名
      this.calculateCourseFinalScoresAndRankings(allScores);
    },
    
    // 计算各科最终成绩和单科排名
    calculateCourseFinalScoresAndRankings(allScores: ScoreItem[]) {
      const appStore = useAppStore();
      const studentId = appStore.userInfo.id;
      
      // 获取当前课程的权重配置
      const weights = this.getCourseWeights(this.courseId || 0);
      
      // 按课程分组处理所有学生的成绩
      const courseGroups = allScores.reduce((groups, item) => {
        const courseId = item.courseId;
        if (!groups[courseId]) {
          groups[courseId] = {
            courseName: item.courseName,
            courseNum: item.courseNum || '',
            credit: item.credit || 0,
            students: []
          };
        }
        
        // 查找是否已有该学生的记录
        let studentRecord = groups[courseId].students.find(s => s.studentId === item.personId);
        if (!studentRecord) {
          studentRecord = {
            studentId: item.personId,
            studentName: item.studentName,
            className: item.className,
            examTypeScores: []
          };
          groups[courseId].students.push(studentRecord);
        }
        
        // 添加考试成绩
        studentRecord.examTypeScores.push({
          examType: item.examType || '期末考试',
          score: item.mark || 0,
          weight: weights[item.examType || '期末考试'] || 0
        });
        
        return groups;
      }, {} as Record<number, {
        courseName: string;
        courseNum: string;
        credit: number;
        students: Array<{
          studentId: number;
          studentName: string;
          className: string;
          examTypeScores: Array<{
            examType: string;
            score: number;
            weight: number;
          }>;
        }>;
      }>);
      
      // 计算每个学生的各科最终成绩并排名
      this.studentAnalysis.courseFinalScores = Object.keys(courseGroups).map(courseId => {
        const course = courseGroups[Number(courseId)];
        
        // 计算每个学生的最终成绩
        const studentFinalScores = course.students.map(student => {
          // 计算加权总分
          const totalWeightedScore = student.examTypeScores.reduce((sum, exam) => 
            sum + (exam.score * exam.weight), 0);
          
          // 计算总权重
          const totalWeight = student.examTypeScores.reduce((sum, exam) => 
            sum + exam.weight, 0);
          
          // 计算最终成绩
          const finalScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
          
          return {
            studentId: student.studentId,
            studentName: student.studentName,
            className: student.className,
            finalScore: finalScore
          };
        });
        
        // 按最终成绩降序排序
        studentFinalScores.sort((a, b) => b.finalScore - a.finalScore);
        
        // 找到当前学生的排名
        const currentStudentRank = studentFinalScores.findIndex(s => s.studentId === studentId) + 1;
        const currentStudentScore = studentFinalScores.find(s => s.studentId === studentId)?.finalScore || 0;
        
        return {
          courseId: Number(courseId),
          courseName: course.courseName,
          courseNum: course.courseNum,
          credit: course.credit,
          finalScore: currentStudentScore,
          courseRanking: currentStudentRank || 0,
          examTypeScores: course.students.find(s => s.studentId === studentId)?.examTypeScores || []
        };
      });
    },
    // 计算班级成绩分析 - 使用后端API
    async calculateClassAnalysis(allScores: ScoreItem[]) {
      try {
        this.loading.analysis = true;
        
        // 调用后端API获取班级最终成绩分析
        const res = await getClassFinalScoreAnalysis(this.courseId, this.examType);
        
        if (res.code === 0 && res.data && res.data.classAnalyses) {
          // 更新班级分析数据
          const classAnalyses = res.data.classAnalyses;
          
          if (classAnalyses.length > 0) {
            // 如果有多个班级，计算平均值
            const totalAverageScore = classAnalyses.reduce((sum: number, item: any) => sum + item.averageScore, 0);
            const totalWeightedAverageScore = classAnalyses.reduce((sum: number, item: any) => sum + (item.weightedAverageScore || item.averageScore), 0);
            const totalHighestScore = Math.max(...classAnalyses.map((item: any) => item.highestScore));
            const totalPassRate = classAnalyses.reduce((sum: number, item: any) => sum + item.passRate, 0) / classAnalyses.length;
            
            this.classAnalysis.averageScore = totalAverageScore / classAnalyses.length;
            this.classAnalysis.weightedAverageScore = totalWeightedAverageScore / classAnalyses.length;
            this.classAnalysis.highestScore = totalHighestScore;
            this.classAnalysis.passRate = totalPassRate;
            
            // 更新科目成绩分析
            this.classAnalysis.subjectScores = classAnalyses.map((item: any) => ({
              courseName: item.className,
              averageScore: item.averageScore,
              weightedAverageScore: item.weightedAverageScore || item.averageScore,
              highestScore: item.highestScore,
              passRate: item.passRate
            }));
          } else {
            // 如果没有数据，设置为0
            this.classAnalysis = {
              averageScore: 0,
              weightedAverageScore: 0,
              highestScore: 0,
              passRate: 0,
              subjectScores: []
            };
          }
          
          // 获取权重配置
          this.examTypeWeights = this.getCourseWeights(this.courseId || 0);
        } else {
          // 如果API调用失败，使用原有逻辑作为备选方案
          this.calculateClassAnalysisFallback(allScores);
        }
      } catch (error) {
        console.error("获取班级最终成绩分析失败:", error);
        // 如果API调用失败，使用原有逻辑作为备选方案
        this.calculateClassAnalysisFallback(allScores);
      } finally {
        this.loading.analysis = false;
      }
    },
    
    // 备选方案：使用原有逻辑计算班级成绩分析
    async calculateClassAnalysisFallback(allScores: ScoreItem[]) {
      if (allScores.length === 0) {
        this.classAnalysis = {
          averageScore: 0,
          weightedAverageScore: 0,  // 加权平均分
          highestScore: 0,
          passRate: 0,
          subjectScores: []
        };
        return;
      }
      
      // 获取当前课程的权重配置
      const weights = this.getCourseWeights(this.courseId || 0);
      
      // 更新考试类型权重配置，用于模板显示
      this.examTypeWeights = weights;
      
      // 计算全班平均分
      const totalScore = allScores.reduce((sum, item) => sum + (item.mark || 0), 0);
      this.classAnalysis.averageScore = totalScore / allScores.length;
      
      // 计算全班加权平均分
      const totalWeightedScore = allScores.reduce((sum, item) => {
        const mark = item.mark || 0;
        const examType = item.examType || '期末考试';
        const weight = weights[examType] || 0;
        return sum + (mark * weight);
      }, 0);
      
      // 计算总权重
      const totalWeight = allScores.reduce((sum, item) => {
        const examType = item.examType || '期末考试';
        return sum + (weights[examType] || 0);
      }, 0);
      
      // 避免除以0
      this.classAnalysis.weightedAverageScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
      
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
        
        // 计算科目加权平均分
        const subjectWeightedScore = scores.reduce((sum, item) => {
          const mark = item.mark || 0;
          const examType = item.examType || '期末考试';
          const weight = weights[examType] || 0;
          return sum + (mark * weight);
        }, 0);
        
        const subjectTotalWeight = scores.reduce((sum, item) => {
          const examType = item.examType || '期末考试';
          return sum + (weights[examType] || 0);
        }, 0);
        
        const subjectWeightedAverageScore = subjectTotalWeight > 0 ? subjectWeightedScore / subjectTotalWeight : 0;
        
        // 按考试类型统计成绩
        const examTypeScores: Record<string, { averageScore: number; count: number }> = {};
        scores.forEach(item => {
          const examType = item.examType || '期末考试';
          const mark = item.mark || 0;
          
          if (!examTypeScores[examType]) {
            examTypeScores[examType] = { averageScore: 0, count: 0 };
          }
          
          // 累计成绩和计数
          examTypeScores[examType].averageScore += mark;
          examTypeScores[examType].count += 1;
        });
        
        // 计算各考试类型的平均分
        Object.keys(examTypeScores).forEach(examType => {
          const scores = examTypeScores[examType];
          scores.averageScore = scores.averageScore / scores.count;
        });
        
        return {
          courseName,
          averageScore: subjectAverageScore,
          weightedAverageScore: subjectWeightedAverageScore,
          highestScore: subjectHighestScore,
          passRate: subjectPassRate,
          examTypeScores: examTypeScores
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
          text: hasData ? '各科目成绩对比' : '暂无成绩数据'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['平均分']
        },
        xAxis: {
          type: 'category',
          data: subjectNames
        },
        yAxis: {
          type: 'value',
          name: '分数',
          min: 0,
          max: 100
        },
        series: [
          {
            name: '平均分',
            type: 'bar',
            data: hasData ? this.classAnalysis.subjectScores.map(item => item.weightedAverageScore.toFixed(2)) : [0],
            itemStyle: {
              color: '#91cc75'
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
            data: hasData ? this.classAnalysis.subjectScores.map(item => (item.passRate * 100).toFixed(2)) : [0],
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
    
    // 获取成绩等级
    getGradeLevel(mark: number) {
      if (mark >= 80) {
        return { text: '优秀', class: 'score-excellent' };
      } else if (mark >= 60) {
        return { text: '及格', class: 'score-pass' };
      } else {
        return { text: '不及格', class: 'score-fail' };
      }
    }
  }
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

/* 整体布局美化 */
.base_form {
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  transition: all 0.3s ease;
}

.base_form:hover {
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.12);
}

.base_header {
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 20px;
}

.blue_column {
  background: url("/littleT.png");
  width: 30px;
  height: 20px;
  margin-left: 22px;
  margin-top: 22px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.base_title {
  margin-top: 18px;
  margin-left: 8px;
  font-family: 'SourceHanSansCN-Medium', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 20px;
  color: #2c3e50;
  letter-spacing: 0.5px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 查询区域美化 */
.base_query_oneLine {
  margin-top: 15px;
  margin-bottom: 20px;
  padding: 15px 20px;
  background-color: rgba(248, 249, 250, 0.7);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.query_left {
  margin-left: 15px;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.query_right {
  margin-right: 15px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.query_right span {
  font-weight: 500;
  color: #495057;
  font-size: 14px;
  white-space: nowrap;
}

/* 表格美化 */
.table_center {
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: 20px 0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.content {
  width: 100%;
  background-color: #ffffff;
  border: none;
  border-spacing: 0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.content tr {
  height: 45px;
  transition: all 0.2s ease;
}

.content tr:hover {
  background-color: rgba(64, 158, 255, 0.05);
  transform: scale(1.01);
}

.table_th {
  background: linear-gradient(135deg, #409eff 0%, #3a8ee6 100%);
  color: #ffffff;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 14px;
}

.table_th td {
  padding: 12px 8px;
  border: none;
  position: relative;
}

.table_th td::after {
  content: '';
  position: absolute;
  right: 0;
  top: 25%;
  height: 50%;
  width: 1px;
  background-color: rgba(255, 255, 255, 0.3);
}

.table_th td:last-child::after {
  display: none;
}

.table_th td:hover {
  background-color: rgba(255, 255, 255, 0.1);
  cursor: pointer;
}

.content td {
  padding: 10px 8px;
  border-bottom: 1px solid #f0f0f0;
  border-right: 1px solid #f0f0f0;
  text-align: center;
  font-size: 14px;
  color: #495057;
  position: relative;
}

.content td:last-child {
  border-right: none;
}

.content tr:last-child td {
  border-bottom: none;
}

/* 成绩单元格特殊样式 */
.content tr td:nth-child(7) {
  font-weight: 600;
  color: #2c3e50;
  font-size: 15px;
}

/* 按钮美化 */
.commButton {
  background: linear-gradient(135deg, #409eff 0%, #3a8ee6 100%);
  border: none;
  border-radius: 6px;
  color: #ffffff;
  padding: 8px 16px;
  margin-left: 10px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
}

.commButton:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  background: linear-gradient(135deg, #3a8ee6 0%, #337ecc 100%);
}

.commButton:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
}

.table_edit_button {
  padding: 6px 12px;
  margin: 0 4px;
  background: linear-gradient(135deg, #2874b3 0%, #1ab1dbb6 100%);
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(56, 134, 250, 0.582);
  transition: all 0.2s ease;
  cursor: pointer;
}

.table_edit_button:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(35, 115, 207, 0.623);
}

.table_delete_button {
  padding: 6px 12px;
  margin: 0 4px;
  background: linear-gradient(135deg, #f56c6c 0%, #e85d5d 100%);
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(245, 108, 108, 0.3);
  transition: all 0.2s ease;
  cursor: pointer;
}

.table_delete_button:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(245, 108, 108, 0.4);
}

.table_delete_button:disabled {
  background: linear-gradient(135deg, #c0c4cc 0%, #b4b8c0 100%);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 输入框美化 */
.commInput {
  height: 36px;
  border-radius: 6px;
  outline: none;
  border: 1px solid #dcdfe6;
  padding: 0 12px;
  font-size: 14px;
  color: #495057;
  background-color: #ffffff;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.commInput:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 分页区域美化 */
.pagin {
  margin: 25px auto;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 15px 0;
}

/* 成绩分析区域样式 */
.analysis-section {
  margin-top: 30px;
  padding: 25px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.analysis-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  background: linear-gradient(180deg, #409eff 0%, #3a8ee6 100%);
  border-radius: 3px 0 0 3px;
}

.analysis-section:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.analysis-section h3 {
  margin-top: 0;
  margin-bottom: 25px;
  color: #2c3e50;
  font-size: 22px;
  font-weight: 600;
  border-bottom: 2px solid #eaeaea;
  padding-bottom: 15px;
  position: relative;
  padding-left: 15px;
}

.analysis-section h3::before {
  content: '';
  position: absolute;
  left: 0;
  top: 5px;
  height: 24px;
  width: 4px;
  background: linear-gradient(180deg, #409eff 0%, #3a8ee6 100%);
  border-radius: 2px;
}

/* 学生成绩分析样式 */
.student-analysis {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.total-info {
  display: flex;
  gap: 40px;
  margin-bottom: 20px;
  padding: 20px;
  background-color: rgba(64, 158, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(64, 158, 255, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 15px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.info-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.info-item .label {
  font-weight: 600;
  color: #495057;
  font-size: 15px;
}

.info-item .value {
  font-size: 24px;
  font-weight: 700;
  color: #409eff;
  text-shadow: 0 1px 2px rgba(64, 158, 255, 0.2);
}

.subjects-table {
  background-color: #ffffff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.subjects-table h4 {
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
  position: relative;
  padding-left: 12px;
}

.subjects-table h4::before {
  content: '';
  position: absolute;
  left: 0;
  top: 5px;
  height: 18px;
  width: 3px;
  background: linear-gradient(180deg, #409eff 0%, #3a8ee6 100%);
  border-radius: 2px;
}

/* 教师成绩分析样式 */
.teacher-analysis {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.class-info {
  display: flex;
  gap: 40px;
  margin-bottom: 20px;
  padding: 20px;
  background-color: rgba(64, 158, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(64, 158, 255, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  flex-wrap: wrap;
}

.charts-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-top: 20px;
}

.weight-info {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 20px;
  margin-top: 15px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.weight-info:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.weight-info h4 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #2c3e50;
  font-weight: 600;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 10px;
  position: relative;
}

.weight-info h4::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, #409eff 0%, #3a8ee6 100%);
}

.weight-info .weight-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 15px;
}

.weight-info .weight-item {
  display: flex;
  align-items: center;
  padding: 8px 15px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  border: 1px solid rgba(64, 158, 255, 0.1);
}

.weight-info .weight-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  border-color: rgba(64, 158, 255, 0.3);
}

.weight-info .weight-item .exam-type {
  font-weight: 600;
  margin-right: 8px;
  color: #495057;
  font-size: 14px;
}

.weight-info .weight-item .weight-value {
  font-weight: 700;
  color: #409eff;
  font-size: 15px;
  text-shadow: 0 1px 2px rgba(64, 158, 255, 0.2);
}

.chart-item {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.chart-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.chart-item h4 {
  margin-bottom: 20px;
  color: #2c3e50;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  position: relative;
}

.chart-item h4::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #409eff 0%, #3a8ee6 100%);
  border-radius: 2px;
}

.chart {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .base_query_oneLine {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .query_left, .query_right {
    margin: 0;
    justify-content: center;
  }
  
  .total-info, .class-info {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .charts-container {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .base_form {
    padding: 15px;
    margin: 5px;
  }
  
  .base_title {
    font-size: 18px;
  }
  
  .content {
    font-size: 12px;
  }
  
  .content td, .table_th td {
    padding: 8px 4px;
  }
  
  .table_edit_button, .table_delete_button {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  .commButton {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
    padding: 8px 12px;
  }
  
  .info-item .value {
    font-size: 20px;
  }
  
  .chart {
    height: 300px;
  }
}

@media (max-width: 480px) {
  .query_right {
    flex-direction: column;
    gap: 10px;
  }
  
  .query_right span {
    margin-top: 0;
  }
  
  .commInput {
    width: 100%;
    max-width: 200px;
  }
  
  .content {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
  
  .analysis-section {
    padding: 15px;
  }
  
  .analysis-section h3 {
    font-size: 18px;
  }
  
  .chart {
    height: 250px;
  }
}

/* 加载动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* 应用动画 */
.base_form {
  animation: fadeIn 0.5s ease-out;
}

.base_header {
  animation: slideIn 0.6s ease-out;
}

.base_query_oneLine {
  animation: slideIn 0.7s ease-out;
}

.table_center {
  animation: fadeIn 0.8s ease-out;
}

.analysis-section {
  animation: fadeIn 0.9s ease-out;
}

.info-item {
  animation: pulse 2s infinite;
}

.info-item:hover {
  animation-play-state: paused;
}

/* 成绩等级颜色标识 */
.score-excellent {
  color: #67c23a !important;
  font-weight: 700;
}

.score-good {
  color: #409eff !important;
  font-weight: 600;
}

.score-pass {
  color: #e6a23c !important;
  font-weight: 600;
}

.score-fail {
  color: #f56c6c !important;
  font-weight: 700;
}

/* 对话框美化 */
#favDialog {
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: none;
  overflow: hidden;
  animation: fadeIn 0.3s ease-out;
}

#favDialog .base_title {
  background: linear-gradient(135deg, #409eff 0%, #3a8ee6 100%);
  color: white;
  padding: 15px 20px;
  margin: 0;
  text-align: center;
}

#favDialog .dialog-div {
  padding: 20px;
}

#favDialog .dialog-content {
  width: 100%;
}

#favDialog .dialog-content tr td {
  padding: 10px;
}

#favDialog .commInput {
  width: 100%;
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
