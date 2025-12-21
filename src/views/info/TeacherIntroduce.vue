<template>
  <div class="base_form">
    <div class="base_header">
      <div class="blue_column"></div>
      <div class="base_title">个人画像</div>
    </div>
    <div class="table_center" style="margin-top: 5px">
      <table class="content">
        <tr>
          <td>工号</td>
          <td>
            {{ info.num }}
          </td>
          <td>姓名</td>
          <td>
            {{ info.name }}
          </td>
          <td>院系</td>
          <td>
            {{ info.dept }}
          </td>
          <td rowspan="3">
            <img :src="imgStr" alt="个人照片" width="200" />
          </td>
        </tr>
        <tr>
          <td>职称</td>
          <td>
            {{ info.title }}
          </td>
              <td>学位</td>
          <td>
            {{ info.degree }}
          </td>
          <td>证件号码</td>
          <td>
            {{ info.card }}
          </td>
        </tr>
        <tr>
          <td>性别</td>
            <td>
              {{ info.gender ?? "" }}
            </td>

          <td>出生日期</td>
          <td>
            {{ info.birthday }}
          </td>
          <td>邮箱</td>
          <td>
            {{ info.email }}
          </td>
        </tr>
        <tr>
          <td>电话</td>
          <td>
            {{ info.phone }}
          </td>
          <td>地址</td>
          <td colspan="3">
            {{ info.address }}
          </td>
          <td>
            <input style="margin-left: 10px" type="file" id="file" accept=".jpg" />
            <input type="button" value="图片上传" @click="uploadFile()" />
          </td>
        </tr>
      </table>
    </div>
    
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import {
    TeacherViewItem,
  type TeacherItem,
} from "~/models/general";
import { downloadPost} from "~/services/genServ";
import {getTeacherIntroduceData,
  getPhotoImageStr,
  uploadPhoto,
} from "~/services/infoServ";
import { message } from "~/tools/messageBox";
import { ElMessage } from "element-plus";



export default defineComponent({
  data: () => ({
  info: {} as TeacherViewItem,
  personId: null as number | null,
  imgStr: "",
  }),
async created() {
  const pid = Number(this.$route.query.personId);
  if (!pid) {
    ElMessage.error("缺少人员ID，无法加载教师信息");
    return;
  }

  this.personId = pid;

  // ⚠️ generalRequest 返回的就是 DataResponse
  const res = await getTeacherIntroduceData(this.personId);

  // ✅ 正确取法
  const payload = res.data;
  if (!payload) {
    ElMessage.error("教师信息不存在");
    return;
  }

  const person = payload.person;
  if (!person) {
    ElMessage.error("教师信息不存在");
    return;
  }

  this.info = {
    ...person,
    title: payload.title,
    degree: payload.degree,
    personId: payload.personId,
  };

  // 加载头像
  const imgRes = await getPhotoImageStr(`photo/${this.personId}.jpg`);
  this.imgStr = imgRes.data;
},



  mounted() { },

  methods: {

    // 上传图片
    // 上传图片
async uploadFile() {
  const fileInput = document.querySelector("#file") as HTMLInputElement;

  if (!fileInput.files || fileInput.files.length === 0) {
    message(this, "请选择文件！");
    return;
  }

  const file = fileInput.files[0];

  // 1) 上传
  const res = await uploadPhoto(`photo/${this.personId}.jpg`, file);

  if (res.code === 0) {
    message(this, "上传成功");

    // 2) 上传成功后立刻重新拉取图片（加时间戳防缓存）
    const imgRes = await getPhotoImageStr(
      `photo/${this.personId}.jpg?t=${Date.now()}`
    );
    this.imgStr = imgRes.data;

    // 3) 可选：清空 input，方便下次选同一张也能触发 change
    fileInput.value = "";
  } else {
    message(this, "上传失败");
  }
},


    // 下载pdf
    downloadPdf() {
      const res = downloadPost(
        "/api/teacher/getTeacherIntroduceItextPdf",
        this.info.num + ".pdf",
        {
          personId: this.personId,
        }
      );
      console.log(res);
    },
    // 上传成功回调函数
    onSuccess(res: any) {
      if (res.code == 0) {
        message(this, "上传成功！");
      } else {
        message(this, res.msg);
      }
    },
  },
});
</script>