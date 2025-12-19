<template>
  <div class="base_form">
    <div class="base_header">
      <div class="blue_column"></div>
      <div class="base_title">我的课程</div>
    </div>

    <!-- 管理员提示 -->
    <div v-if="isAdmin" style="color:red;padding:20px">
      管理员不参与“我的课程”功能
    </div>

    <!-- 学生 / 教师 -->
    <div v-else class="table_center">
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
          <td>{{ item.courseTime }}</td>
          <td>{{ item.courseRoom }}</td>

          <td v-if="isStudent">
            <button class="table_delete_button" @click="drop(item.courseId)">
              退课
            </button>
          </td>
        </tr>
      </table>

      <!-- 分页 -->
      <div class="page-bar" style="margin-top:15px;text-align:center">
        <button class="commButton" :disabled="currentPage===1" @click="currentPage--">上一页</button>

        <button
          v-for="p in pageNumbers"
          :key="p"
          class="commButton"
          :style="{ background: p===currentPage ? '#409eff':'' }"
          @click="currentPage=p"
        >
          {{ p }}
        </button>

        <button class="commButton" :disabled="currentPage===totalPages" @click="currentPage++">下一页</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useAppStore } from '~/stores/app'
import {
  getMyCourseListByStudent,
  getMyCourseListByTeacher,
  dropMyCourse
} from '~/services/myCourseServ'
import { message, messageConform } from '~/tools/messageBox'

export default defineComponent({
  data() {
    return {
      courseList: [] as any[],
      currentPage: 1,
      pageSize: 5
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
    isAdmin() {
      return this.role === 'ROLE_ADMIN'
    },

    // ✅ 分页数据
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
    async loadMyCourses() {
      const store = useAppStore()
      const userId = store.userInfo.id

      if (this.isStudent) {
        const res = await getMyCourseListByStudent(userId)
        if (res.code === 0) this.courseList = res.data
      }

      if (this.isTeacher) {
        const res = await getMyCourseListByTeacher(userId)
        if (res.code === 0) this.courseList = res.data
      }
    },

    async drop(courseId: number) {
      const ok = await messageConform('确认退选该课程吗？')
      if (!ok) return

      const store = useAppStore()
      const res = await dropMyCourse(courseId, store.userInfo.id)

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
