<template>
  <div class="weight-management">
    <h2>考试权重管理</h2>
    
    <div class="filter-section">
      <div class="filter-item">
        <label>选择课程：</label>
        <select v-model="selectedCourseId" @change="loadWeights">
          <option value="">所有课程</option>
          <option v-for="course in courseList" :key="course.courseId" :value="course.courseId">
            {{ course.num }} - {{ course.name }}
          </option>
        </select>
      </div>
      <div class="filter-item">
        <button @click="showAddDialog" class="btn btn-primary">添加权重配置</button>
      </div>
    </div>
    
    <div class="weight-table">
      <table>
        <thead>
          <tr>
            <th>课程</th>
            <th>考试类型</th>
            <th>权重</th>
            <th>说明</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="weight in weightList" :key="weight.weightId">
            <td>{{ weight.courseName }}</td>
            <td>{{ weight.examType }}</td>
            <td>{{ (weight.weight * 100).toFixed(0) }}%</td>
            <td>{{ weight.description || '-' }}</td>
            <td>{{ formatDate(weight.createdAt) }}</td>
            <td>
              <button @click="editWeight(weight)" class="btn btn-sm btn-secondary">编辑</button>
              <button @click="deleteWeight(weight.weightId)" class="btn btn-sm btn-danger">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 添加/编辑权重对话框 -->
    <dialog id="weightDialog" class="dialog">
      <div class="dialog-content">
        <h3>{{ isEditing ? '编辑权重配置' : '添加权重配置' }}</h3>
        <div class="form-group">
          <label>课程：</label>
          <select v-model="editedWeight.courseId" :disabled="isEditing">
            <option value="">请选择课程</option>
            <option value="0">默认配置</option>
            <option v-for="course in courseList" :key="course.courseId" :value="course.courseId">
              {{ course.num }} - {{ course.name }}
            </option>
          </select>
          <div v-if="validationErrors.courseId" class="error-message">{{ validationErrors.courseId }}</div>
        </div>
        
        <div class="form-group">
          <label>考试类型：</label>
          <select v-model="editedWeight.examType" :disabled="isEditing">
            <option value="">请选择考试类型</option>
            <option value="期中考试">期中考试</option>
            <option value="期末考试">期末考试</option>
            <option value="平时成绩">平时成绩</option>
            <option value="模拟考试">模拟考试</option>
          </select>
          <div v-if="validationErrors.examType" class="error-message">{{ validationErrors.examType }}</div>
        </div>
        
        <div class="form-group">
          <label>权重：</label>
          <input 
            type="number" 
            v-model="editedWeight.weight" 
            min="0" 
            max="1" 
            step="0.01"
            placeholder="0.60表示60%"
          />
          <div v-if="validationErrors.weight" class="error-message">{{ validationErrors.weight }}</div>
        </div>
        
        <div class="form-group">
          <label>说明：</label>
          <textarea v-model="editedWeight.description" placeholder="权重说明（可选）"></textarea>
        </div>
        
        <div class="dialog-actions">
          <button @click="saveWeight" class="btn btn-primary">保存</button>
          <button @click="closeDialog" class="btn btn-secondary">取消</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getCourseList } from '~/services/teachingServ';

// 数据定义
const selectedCourseId = ref<number | null>(null);
const weightList = ref<any[]>([]);
const courseList = ref<any[]>([]);
const isEditing = ref(false);
const editedWeight = ref({
  weightId: null as number | null,
  courseId: null as number | null,
  examType: '',
  weight: 0,
  description: ''
});
const validationErrors = ref({
  courseId: '',
  examType: '',
  weight: ''
});

// 加载课程列表
const loadCourses = async () => {
  try {
    const courses = await getCourseList('');
    courseList.value = courses;
  } catch (error) {
    console.error('加载课程列表失败:', error);
    ElMessage.error('加载课程列表失败');
  }
};

// 加载权重列表
const loadWeights = async () => {
  try {
    const response = await fetch('/api/examWeight/getWeightList', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        courseId: selectedCourseId.value || 0
      })
    });
    
    const result = await response.json();
    if (result.code === 0) {
      weightList.value = result.data || [];
    } else {
      ElMessage.error(result.msg || '加载权重列表失败');
    }
  } catch (error) {
    console.error('加载权重列表失败:', error);
    ElMessage.error('加载权重列表失败');
  }
};

// 显示添加对话框
const showAddDialog = () => {
  isEditing.value = false;
  editedWeight.value = {
    weightId: null,
    courseId: null,
    examType: '',
    weight: 0,
    description: ''
  };
  validationErrors.value = {
    courseId: '',
    examType: '',
    weight: ''
  };
  const dialog = document.getElementById('weightDialog') as HTMLDialogElement;
  dialog.show();
};

// 编辑权重
const editWeight = (weight: any) => {
  isEditing.value = true;
  editedWeight.value = {
    weightId: weight.weightId,
    courseId: weight.courseId,
    examType: weight.examType,
    weight: weight.weight,
    description: weight.description || ''
  };
  validationErrors.value = {
    courseId: '',
    examType: '',
    weight: ''
  };
  const dialog = document.getElementById('weightDialog') as HTMLDialogElement;
  dialog.show();
};

// 保存权重
const saveWeight = async () => {
  // 验证表单
  if (!validateForm()) {
    return;
  }
  
  try {
    const response = await fetch('/api/examWeight/weightSave', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(editedWeight.value)
    });
    
    const result = await response.json();
    if (result.code === 0) {
      ElMessage.success('保存成功');
      closeDialog();
      loadWeights();
    } else {
      ElMessage.error(result.msg || '保存失败');
    }
  } catch (error) {
    console.error('保存权重失败:', error);
    ElMessage.error('保存权重失败');
  }
};

// 删除权重
const deleteWeight = async (weightId: number) => {
  if (!confirm('确定要删除这个权重配置吗？')) {
    return;
  }
  
  try {
    const response = await fetch('/api/examWeight/weightDelete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ weightId })
    });
    
    const result = await response.json();
    if (result.code === 0) {
      ElMessage.success('删除成功');
      loadWeights();
    } else {
      ElMessage.error(result.msg || '删除失败');
    }
  } catch (error) {
    console.error('删除权重失败:', error);
    ElMessage.error('删除权重失败');
  }
};

// 关闭对话框
const closeDialog = () => {
  const dialog = document.getElementById('weightDialog') as HTMLDialogElement;
  dialog.close();
};

// 表单验证
const validateForm = () => {
  let isValid = true;
  validationErrors.value = {
    courseId: '',
    examType: '',
    weight: ''
  };
  
  if (!editedWeight.value.courseId && editedWeight.value.courseId !== 0) {
    validationErrors.value.courseId = '请选择课程';
    isValid = false;
  }
  
  if (!editedWeight.value.examType) {
    validationErrors.value.examType = '请选择考试类型';
    isValid = false;
  }
  
  if (editedWeight.value.weight <= 0 || editedWeight.value.weight > 1) {
    validationErrors.value.weight = '权重必须在0-1之间';
    isValid = false;
  }
  
  return isValid;
};

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 组件挂载时加载数据
onMounted(() => {
  loadCourses();
  loadWeights();
});
</script>

<style scoped>
.weight-management {
  padding: 20px;
}

.filter-section {
  display: flex;
  margin-bottom: 20px;
  gap: 15px;
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.weight-table {
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
}

.btn-primary {
  background-color: #409EFF;
  color: white;
}

.btn-secondary {
  background-color: #909399;
  color: white;
}

.btn-danger {
  background-color: #F56C6C;
  color: white;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 12px;
}

.dialog {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 0;
  width: 500px;
  max-width: 90vw;
}

.dialog-content {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.error-message {
  color: #F56C6C;
  font-size: 12px;
  margin-top: 5px;
}
</style>