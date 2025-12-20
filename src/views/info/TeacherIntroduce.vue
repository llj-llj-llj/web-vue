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
            {{ info.genderName }}
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

export default defineComponent({
  data: () => ({
  info: {} as TeacherViewItem,
  personId: null as number | null,
  imgStr: "",
  }),
  async created() {
    let res = await getTeacherIntroduceData(this.personId);
    const raw: TeacherItem = res.data.info;
    this.info = {
    ...raw.person,
    title: raw.title,
    degree: raw.degree,
    personId: raw.personId, // 保证一致
  };
    this.personId = this.info.personId;
    res = await getPhotoImageStr("photo/" + this.info.personId + ".jpg");
    this.imgStr = res.data;
  },
  mounted() { },

  methods: {

    // 上传图片
    async uploadFile() {
      const file = document.querySelector("#file") as any;
      if (file.files == null || file.files.length == 0) {
        message(this, "请选择文件！");
        return;
      }
      const res = await uploadPhoto(
        "photo/" + this.info.personId + ".jpg",
        file.files[0]
      );

      if (res.code === 0) {
        message(this, "上传成功");
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