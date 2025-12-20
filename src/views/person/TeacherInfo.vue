<template>
  <div class="base_form">
    <div class="base_header">
      <div class="blue_column"></div>
      <div class="base_title">教师信息</div>
    </div>
    <div class="form-div" style="margin-top: 5px">
      <table class="content">
        <tr>
          <td colspan="1" style="text-align: right">工号</td>
          <td colspan="1">
            <el-input v-model="form.person.num" style="width: 97%" />
          </td>
        </tr>
        <tr>
          <td colspan="1" style="text-align: right">姓名</td>
          <td colspan="1">
            <el-input v-model="form.person.name" style="width: 97%" />
          </td>
        </tr>
        <tr>
          <td colspan="1" style="text-align: right">学院</td>
          <td colspan="1">
            <el-input v-model="form.person.dept" style="width: 97%" />
          </td>
        </tr>
        <tr>
          <td colspan="1" style="text-align: right">职称</td>
          <td colspan="1">
            <el-input v-model="form.title" style="width: 97%" />
          </td>
        </tr>
        <tr>
          <td colspan="1" style="text-align: right">学位</td>
          <td colspan="1">
            <el-input v-model="form.degree" style="width: 97%" />
          </td>
        </tr>
        <tr>
          <td colspan="1" style="text-align: right">证件号码</td>
          <td colspan="1">
            <el-input v-model="form.person.card" style="width: 97%" />
          </td>
        </tr>
        <tr>
          <td colspan="1" style="text-align: right">性别</td>
          <td colspan="1">
            <el-select v-model="form.person.gender" placeholder="请选择性别" style="width: 97%">
              <el-option v-for="item in genderList" :key="item.value" :label="item.title" :value="item.value">
              </el-option>
            </el-select>
          </td>
        </tr>
        <tr>
          <td colspan="1" style="text-align: right">出生日期</td>
          <td colspan="1">
            <el-date-picker v-model="form.person.birthday" type="date" style="width: 97%" value-format="yyyy-MM-dd"
              placeholder="选择出生日期" />
          </td>
        </tr>
        <tr>
          <td colspan="1" style="text-align: right">邮箱</td>
          <td colspan="1">
            <el-input v-model="form.person.email" style="width: 97%" />
          </td>
        </tr>
        <tr>
          <td colspan="1" style="text-align: right">电话</td>
          <td colspan="1">
            <el-input v-model="form.person.phone" style="width: 97%" />
          </td>
        </tr>
        <tr>
          <td colspan="1" style="text-align: right">地址</td>
          <td colspan="1">
            <el-input v-model="form.person.address" style="width: 97%" />
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <button class="commButton" @click="submit">提交</button>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>
<script lang="ts">
import { getTeacherInfo, teacherEditSave } from "~/services/personServ";
import { defineComponent } from "vue";
import router from "~/router";
import { type OptionItem, type TeacherItem } from "~/models/general";
  import { getPersonIdFromToken } from "~/tools/auth";
  import { useAppStore } from "~/stores/app";



export default defineComponent({
  // 双向绑定数据
data: () => ({
  personId: null as number | null,
  form: {
    title: "",
    degree: "",
    person: {
      num: "",
      name: "",
      dept: "",
      card: "",
      gender: "",
      birthday: "",
      email: "",
      phone: "",
      address: ""
    }
  } as TeacherItem,
  genderList: [
    { value: "1", title: "男" },
    { value: "2", title: "女" }
  ]
}),

  // 页面加载函数

async created() {
  console.log("=== TeacherInfo created start ===");

  const store = useAppStore();

  // 1) 先从路由拿（如果是列表跳转带了 query 的情况）
  let pid = Number(this.$route.query.personId || 0) || null;

  // 2) 再从 pinia 拿（你这个项目里 userInfo.id 就是 317）
  if (!pid) pid = store.userInfo?.id ?? null;

  // 3) 最后从 localStorage 的 app 里兜底（你控制台已经验证这里有）
  if (!pid) {
    const app = JSON.parse(localStorage.getItem("app") || "{}");
    pid = app?.userInfo?.id ?? null;
  }

  console.log("[FINAL] resolved pid =", pid);

  if (!pid) {
    alert("无法获取当前登录教师ID，请重新登录");
    return;
  }

  this.personId = pid;

  // 然后正常调接口
  const resp = await getTeacherInfo(pid);
  // 注意你的接口返回大概率是 {code, data, msg}，所以取 resp.data
  const data = resp.data ?? resp; // 视你封装而定
  Object.assign(this.form, data);
},




  methods: {
    // 提交表单
async submit() {
  const res = await teacherEditSave(
    this.personId,
    this.form
  );

  if (res.code === 0) {
    if (this.personId == null && res.data) {
    this.personId = res.data;
  }
    router.push({ path: "/teacher-panel" });
  } else {
    alert(res.msg);
  }
}

  },
});
</script>
