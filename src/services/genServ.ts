import axios, { type RawAxiosRequestHeaders } from "axios";
import { useAppStore } from "~/stores/app";
import { ElMessage } from "element-plus";
//一般数据请求函数，参数为url后台接口映射全路径，和data 为传递后台的数据，返回值为服务器返回的data
export async function generalRequest(
  url: string,
  data: any | null
): Promise<any> {
  try {
    const res = await axios.post(
      url,
      {
        data: data,
      },
      {
        headers: getAuthHeader(),
      }
    );
    
    if (res.status === 200) {
      // 检查业务状态码
      if (res.data && res.data.code !== undefined) {
        if (res.data.code === 0) {
          return res.data;
        } else {
          // 业务错误，显示错误消息
          ElMessage.error(res.data.message || '请求失败，请重试');
          throw new Error(res.data.message || '业务错误');
        }
      }
      return res.data;
    } else {
      // HTTP状态码错误
      ElMessage.error(`请求失败，状态码：${res.status}`);
      throw new Error(`HTTP错误：${res.status}`);
    }
  } catch (error: any) {
    // 网络错误或其他错误
    if (error.response) {
      // 服务器响应了错误
      ElMessage.error(`请求失败：${error.response.data?.message || error.response.statusText || '未知错误'}`);
    } else if (error.request) {
      // 请求已发送但没有收到响应
      ElMessage.error('网络错误，服务器无响应');
    } else {
      // 请求配置错误
      ElMessage.error(`请求错误：${error.message}`);
    }
    console.error('API请求错误:', error);
    throw error; // 重新抛出错误，让调用者可以进一步处理
  }
}
//文件数据上传服务器函数，参数为url后台接口映射全路径，和data 为传递后台的数据（包括文件数据），返回值为服务器返回的data
export async function uploadRequest(
  url: string,
  data: any | null
): Promise<any> {
  try {
    const res = await axios.post(url, data, {
      headers: getAuthHeaderFile(),
    });
    
    if (res.status === 200) {
      // 检查业务状态码
      if (res.data && res.data.code !== undefined) {
        if (res.data.code === 0) {
          return res.data;
        } else {
          // 业务错误，显示错误消息
          ElMessage.error(res.data.message || '文件上传失败，请重试');
          throw new Error(res.data.message || '业务错误');
        }
      }
      return res.data;
    } else {
      // HTTP状态码错误
      ElMessage.error(`文件上传失败，状态码：${res.status}`);
      throw new Error(`HTTP错误：${res.status}`);
    }
  } catch (error: any) {
    // 网络错误或其他错误
    if (error.response) {
      // 服务器响应了错误
      ElMessage.error(`文件上传失败：${error.response.data?.message || error.response.statusText || '未知错误'}`);
    } else if (error.request) {
      // 请求已发送但没有收到响应
      ElMessage.error('网络错误，服务器无响应');
    } else {
      // 请求配置错误
      ElMessage.error(`文件上传错误：${error.message}`);
    }
    console.error('文件上传错误:', error);
    throw error; // 重新抛出错误，让调用者可以进一步处理
  }
}
//获取数据请求Head信息，这个主要包括了用户的jwtToken信息
export function getAuthHeader(): any {
  return {
    Authorization: "Bearer " + useAppStore().userInfo.token,
  };
}
//获取文件上传请求Head信息，这个主要包括了用户的jwtToken信息和文件上传的Content-Type信息
export function getAuthHeaderFile(): RawAxiosRequestHeaders {
  return {
    Authorization: "Bearer " + useAppStore().userInfo.token,
    "Content-Type": "multipart/form-data",
  };
}
//文件下载函数，参数为url后台接口映射全路径，和label 为下载文件的名称，和data 为传递后台的数据，返回值为服务器返回的data
export async function downloadPost(url: string, label: string, data: any) {
  const requestOptions = {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: "Bearer " + useAppStore().userInfo.token,
    },
    body: JSON.stringify({
      data: data,
    }),
  };
  
  try {
    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      // 尝试解析错误响应
      let errorMessage = `文件下载失败，状态码：${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = `文件下载失败：${errorData.message}`;
        }
      } catch (e) {
        // 无法解析JSON，使用默认错误消息
      }
      ElMessage.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    // 检查响应类型是否为PDF
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/pdf')) {
      // 处理PDF下载
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = label.endsWith('.pdf') ? label : `${label}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
      
      ElMessage.success('PDF文件下载成功');
      return response.status;
    } else {
      // 尝试解析为JSON（用于处理错误消息）
      try {
        const jsonData = await response.json();
        if (jsonData.message) {
          ElMessage.error(`下载失败：${jsonData.message}`);
        } else {
          ElMessage.error('下载失败：未知错误');
        }
      } catch (e) {
        ElMessage.error('下载失败：响应格式错误');
      }
      throw new Error('下载失败');
    }
  } catch (error: any) {
    if (error.name === 'NetworkError') {
      ElMessage.error('网络错误，无法下载文件');
    } else {
      console.error('文件下载错误:', error);
    }
    throw error;
  }
}
