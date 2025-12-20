<template>
  <div class="base_form">
    <div class="base_header">
      <div class="blue_column"></div>
      <div class="base_title">我的授课</div>
    </div>

    <div class="table_center">
      <table class="content">
        <tr class="table_th">
          <td>课程号</td>
          <td>课程名</td>
          <td>学分</td>
          <td>上课时间</td>
          <td>上课地点</td>
        </tr>

        <tr v-for="item in pagedCourseList" :key="item.courseId">
          <td>{{ item.num }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.credit }}</td>
          <td>{{ item.classTime || '-' }}</td>
          <td>{{ item.location || '-' }}</td>
        </tr>
      </table>

      <!-- 分页 -->
      <div
        class="page-bar"
        style="margin-top: 15px; display: flex; justify-content: center; align-items: center"
      >
        <button
          class="commButton"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          上一页
        </button>

        <button
          v-for="p in pageNumbers"
          :key="p"
          class="commButton"
          :style="{ background: p === currentPage ? '#409eff' : '' }"
          @click="currentPage = p"
        >
          {{ p }}
        </button>

        <button
          class="commButton"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useAppStore } from '~/stores/app'
import { getTeacherCourseList } from '~/services/teacherCourseServ'
import { message } from '~/tools/messageBox'

export default defineComponent({
  name: 'TeacherCourse',

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
    this.loadTeacherCourses()
  },

  methods: {
    async loadTeacherCourses() {
      const teacherId = this.store.userInfo.id

      const res = await getTeacherCourseList(teacherId)
      if (res.code === 0) {
        this.courseList = res.data
      } else {
        message(this, res.msg || '获取授课失败')
      }
    }
  }
})
</script>

<style scoped>
</style>
