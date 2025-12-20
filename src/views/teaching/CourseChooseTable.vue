<template>
  <div class="base_form">
    <div class="base_header">
      <div class="blue_column"></div>
      <div class="base_title">我的课程</div>
    </div>

    <div class="table_center">
      <table class="content">
        <tr class="table_th">
          <td>课程号</td>
          <td>课程名</td>
          <td>学分</td>
          <td>上课时间</td>
          <td>上课地点</td>
          <td v-if="isStudent">操作</td>
        </tr>

        <tr v-for="item in pagedCourseList" :key="item.courseId">
          <td>{{ item.num }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.credit }}</td>
          <td>{{ item.classTime }}</td>
          <td>{{ item.location }}</td>

          <!-- 学生才显示退课 -->
          <td v-if="isStudent">
            <button
              class="course-btn course-btn-drop"
              @click="dropCourse(item.courseId)"
            >
              退选
            </button>
          </td>
        </tr>
      </table>

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
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useAppStore } from '~/stores/app'
import {
  getMyCourseListByStudent,
  dropMyCourse
} from '~/services/courseChooseServ'
import { message, messageConform } from '~/tools/messageBox'

export default defineComponent({
  name: 'MyCourse',

  data() {
    return {
      courseList: [] as any[],
      currentPage: 1,
      pageSize: 5,
      pageSizeOptions: [5, 10, 20],
      jumpPage: '',
    }
  },

  computed: {
    store() {
      return useAppStore()
    },

    role() {
      return this.store.userInfo.role
    },

    isStudent() {
      return this.role === 'ROLE_STUDENT'
    },

    isTeacher() {
      return this.role === 'ROLE_TEACHER'
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

  created() {
    this.loadMyCourses()
  },

  methods: {
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
    async loadMyCourses() {
      const userId = this.store.userInfo.id

      //学生：已选课程
      if (this.isStudent) {
        const res = await getMyCourseListByStudent(userId)
        if (res.code === 0) {
          this.courseList = res.data
        }
      }
    },
    async dropCourse(courseId: number) {
      const ok = await messageConform('确认退选该课程吗？')
      if (!ok) return

      const studentId = this.store.userInfo.id
      const res = await dropMyCourse(studentId, courseId)

      if (res.code === 0) {
        message(this, '退课成功')
        this.loadMyCourses()
      } else {
        message(this, res.msg)
      }
    }
  }
})
</script>

<style scoped>
/* 基础按钮 */
.course-btn {
  width: 64px;
  height: 32px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  border: 2px solid #333;
  cursor: pointer;
  color: #fff;
}

/* 退选：灰色 */
.course-btn.course-btn-drop {
  background-color: #909399;
}

.course-btn.course-btn-drop:hover {
  background-color: #a6a9ad;
}
</style>

