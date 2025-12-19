<template>
  <div class="base_form">
    <div class="base_header">
      <div class="blue_column"></div>
      <div class="base_title">课程管理</div>
    </div>

    <div class="base_query_oneLine">
      <div class="query_left">
        <button class="commButton" v-if="canEditCourse" @click="addItem()">添加</button>

      </div>
      <div class="query_right">
        <span style="margin-top: 5px">课程号或课程名</span>
        <input type="text" v-model="numName" style="margin-left: 10px; width: 230px" />
        <button style="margin-left: 5px" class="commButton" @click="query()">查询</button>
      </div>
    </div>
    <div class="table_center" style="margin-top: 5px">
      <table class="content">
        <tr class="table_th">
          <td>课程号</td>
          <td>课程名</td>
          <td>学分</td>
          <td>材料路径</td>
          <td>前序课</td>
          <td>上课时间</td>
          <td>上课地点</td>
           <td v-if="canEditCourse">操作</td>
          <td v-if="store.userInfo.role === 'ROLE_STUDENT'">选课</td>

        </tr>
        <tr v-for="item in pagedCourseList" :key="item.courseId">
          <td>{{ item.num }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.credit }}</td>
          <td>{{ item.coursePath }}</td>
          <td>{{ item.preCourse }}</td>
          <td>{{ item.courseTime }}</td>
          <td>{{ item.courseRoom }}</td>
           <!-- 教师 / 管理员操作 -->
          <td v-if="canEditCourse">
            <button class="table_edit_button" @click="editItem(item)">编辑</button>
            <button class="table_delete_button" @click="deleteItem(item.courseId)">删除</button>
          </td>

          <!-- 学生选课按钮 -->
          <td v-if="store.userInfo.role === 'ROLE_STUDENT'">
          <!-- 未选课 -->
          <button
            v-if="!selectedCourseIds.includes(item.courseId)"
            @click="selectCourse(item.courseId)"
          >
            选课
          </button>

          <!-- 已选课 -->
          <button
            v-else
            style="background:#67c23a"
            @click="cancelCourse(item.courseId)"
          >
            已选
          </button>
        </td>

        </tr>
      </table>
      <!-- 分页栏 -->
      <div
        class="page-bar"
        style="margin-top: 15px; display: flex; justify-content: center; align-items: center"
      >
        <!-- 上一页 -->
        <button
          class="commButton"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          上一页
        </button>

        <!-- 页码按钮 -->
        <button
          v-for="page in pageNumbers"
          :key="page"
          class="commButton"
          :style="{
            margin: '0 4px',
            background: page === currentPage ? '#409eff' : ''
          }"
          @click="currentPage = page"
        >
          {{ page }}
        </button>

        <!-- 下一页 -->
        <button
          class="commButton"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          下一页
        </button>

        <!-- 每页条数 -->
        <span style="margin-left: 20px">每页显示</span>
        <select
          v-model="pageSize"
          @change="currentPage = 1"
          style="margin: 0 5px"
        >
          <option
            v-for="size in pageSizeOptions"
            :key="size"
            :value="size"
          >
            {{ size }}
          </option>
        </select>
        <span>条</span>
        <!-- 跳转到指定页 -->
        <span style="margin-left: 20px">跳转到</span>
        <input
          type="number"
          v-model="jumpPage"
          style="width: 60px; margin: 0 5px"
          min="1"
          :max="totalPages"
        />
        <span>页</span>
        <button
          class="commButton"
          style="margin-left: 5px"
          @click="jumpToPage"
        >
          跳转
        </button>
      </div>
    </div>
  </div>
  <!-- 对话框显示 -->
  <dialog
    id="favDialog"
    onclose="close()"
    style="position: absolute; top: 300px; left: 300px; width: 300px; height: 310px"
  >
    <div class="base_title">课程添加修改对话框</div>
    <div class="dialog-div" style="margin-top: 5px">
      <table class="content">
        <tr>
          <td colspan="1" style="text-align: right">课程号</td>
          <td colspan="1"><input v-model="form.num" style="width: 97%" /></td>
        </tr>
        <tr>
          <td colspan="1" style="text-align: right">课程名</td>
          <td colspan="1"><input v-model="form.name" style="width: 97%" /></td>
        </tr>
        <tr>
          <td colspan="1" style="text-align: right">学分</td>
          <td colspan="1">
            <input v-model="form.credit" style="width: 97%" />
          </td>
        </tr>
        <tr>
          <td colspan="1" style="text-align: right">资料路径</td>
          <td colspan="1">
            <input v-model="form.coursePath" style="width: 97%" />
          </td>
        </tr>
        <tr>
          <td colspan="1" style="text-align: right">前序课</td>
          <td colspan="1">
            <select class="commInput" v-model="form.preCourseId">
              <option v-for="item in courseSelectList" :key="item.id" :value="item.id">
                {{ item.title }}
              </option>
            </select>
          </td>
        </tr>

        <tr>
          <td colspan="2">
            <button class="commButton" @click="close()" style="margin-right: 30px">取消</button>
            <button class="commButton" @click="confirm()">确认</button>
          </td>
        </tr>
      </table>
    </div>
  </dialog>
</template>

<script lang="ts">
import { type CourseItem, type OptionItem } from '~/models/general'
import { defineComponent } from 'vue'
import { getCourseList, courseDelete, courseSave } from '~/services/teachingServ'
import { message, messageConform } from '~/tools/messageBox'
import { getDialog } from '~/tools/comMethod'
import { useAppStore } from '~/stores/app'
import {
  getMyCourseListByStudent,
  getMyCourseListByTeacher,
  selectMyCourse,
  dropMyCourse
} from '~/services/myCourseServ'

export default defineComponent({
  data() {
    return {
      numName: '',
      courseList: [] as CourseItem[],
      courseSelectList: [] as OptionItem[],
      form: {} as CourseItem,
      currentPage: 1,
      pageSize: 5,
      pageSizeOptions: [5, 10, 20],
      jumpPage: '',
      selectedCourseIds: [] as number[]
    }
  },

  created() {
    const store = useAppStore()
    this.query()

    if (store.userInfo.role === 'ROLE_STUDENT') {
      this.loadMyCourses()
    }
  },

  computed: {
    store() {
      return useAppStore()
    },
    canEditCourse() {
      return (
        this.store.userInfo.role === 'ROLE_ADMIN' ||
        this.store.userInfo.role === 'ROLE_TEACHER'
      )
    },
    pagedCourseList() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.courseList.slice(start, start + this.pageSize)
    },
    totalPages() {
      return Math.ceil(this.courseList.length / this.pageSize)
    },
    pageNumbers() {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1)
    }
  },

  methods: {
    makeSelectCourseList() {
      this.courseSelectList = this.courseList.map(item => ({
        id: item.courseId,
        value: item.num,
        title: item.num + '-' + item.name
      }))
    },

    async query() {
      this.currentPage = 1
      this.courseList = await getCourseList(this.numName)
      this.makeSelectCourseList()
    },

    addItem() {
      this.form = {} as CourseItem
      getDialog('favDialog').show()
    },

    editItem(item: CourseItem) {
      this.form = item
      getDialog('favDialog').show()
    },

    close() {
      getDialog('favDialog').close()
    },

    async confirm() {
      const isEdit = !!this.form.courseId
      const ok = await messageConform(
        isEdit ? '确认修改该课程信息吗？' : '确认新增该课程吗？'
      )
      if (!ok) return

      this.close()
      const res = await courseSave(this.form)
      if (res.code === 0) {
        message(this, isEdit ? '修改成功' : '新增成功')
        this.query()
      } else {
        message(this, res.msg)
      }
    },

    async deleteItem(courseId: number) {
      const ok = await messageConform('确认删除吗?')
      if (!ok) return

      const res = await courseDelete(courseId)
      if (res.code === 0) {
        message(this, '删除成功')
        this.query()
      } else {
        message(this, res.msg)
      }
    },

    jumpToPage() {
      const page = Number(this.jumpPage)
      if (!isNaN(page)) {
        this.currentPage = Math.min(
          Math.max(page, 1),
          this.totalPages
        )
      }
      this.jumpPage = ''
    },

    async selectCourse(courseId: number) {
      const studentId = this.store.userInfo.id
      const ok = await messageConform('确认选择该课程吗？')
      if (!ok) return

      const res = await selectMyCourse(studentId, courseId)
      if (res.code === 0) {
        message(this, '选课成功')
        this.loadMyCourses()
      } else {
        message(this, res.msg)
      }
    },

    async cancelCourse(courseId: number) {
      const studentId = this.store.userInfo.id
      const ok = await messageConform('确认退课吗？')
      if (!ok) return

      const res = await dropMyCourse(studentId, courseId)
      if (res.code === 0) {
        message(this, '退课成功')
        this.loadMyCourses()
      } else {
        message(this, res.msg)
      }
    },

    async loadMyCourses() {
    const store = useAppStore()
    const userId = store.userInfo.id

    if (store.userInfo.role === 'ROLE_STUDENT') {
      const res = await getMyCourseListByStudent()
      if (res.code === 0) {
        this.courseList = res.data
      }
    }

    if (store.userInfo.role === 'ROLE_TEACHER') {
      const res = await getMyCourseListByTeacher()
      if (res.code === 0) {
        this.courseList = res.data
      }
    }
}

  }
})
</script>

<style></style>
