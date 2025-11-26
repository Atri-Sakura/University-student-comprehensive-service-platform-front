/**
 * 多文件上传工具
 * 用于处理需要同时上传多个文件的场景
 */

import { API_BASE_URL } from './config.js';

/**
 * 创建多文件上传的FormData
 * @param {Object} files 文件对象 {fieldName: filePath}
 * @param {Object} formData 表单数据
 * @returns {Promise} 返回上传结果
 */
export async function multipartUpload(url, files, formData = {}, headers = {}) {
	return new Promise((resolve, reject) => {
		// 获取token
		const token = uni.getStorageSync('token');
		
		// 构建请求头
		const requestHeaders = {
			'Authorization': token ? `Bearer ${token}` : '',
			...headers
		};
		
		// 由于uni.uploadFile只支持单文件上传，我们需要使用一个变通方法
		// 将其他文件转换为base64并放在formData中
		
		const fileKeys = Object.keys(files);
		if (fileKeys.length === 0) {
			reject(new Error('没有文件需要上传'));
			return;
		}
		
		// 取第一个文件作为主文件上传
		const mainFileKey = fileKeys[0];
		const mainFilePath = files[mainFileKey];
		
		// 处理其他文件
		const otherFiles = fileKeys.slice(1);
		let processedFiles = 0;
		const fileDataMap = {};
		
		if (otherFiles.length === 0) {
			// 只有一个文件，直接上传
			uploadMainFile();
		} else {
			// 先处理其他文件转base64
			otherFiles.forEach(fileKey => {
				const filePath = files[fileKey];
				uni.getFileSystemManager().readFile({
					filePath: filePath,
					encoding: 'base64',
					success: (fileData) => {
						fileDataMap[fileKey] = {
							data: fileData.data,
							name: filePath.split('/').pop()
						};
						processedFiles++;
						
						if (processedFiles === otherFiles.length) {
							uploadMainFile();
						}
					},
					fail: (error) => {
						reject(new Error(`读取文件${fileKey}失败: ${error.errMsg}`));
					}
				});
			});
		}
		
		function uploadMainFile() {
			// 构建最终的formData
			const finalFormData = { ...formData };
			
			// 添加其他文件的base64数据
			Object.keys(fileDataMap).forEach(fileKey => {
				finalFormData[`${fileKey}Data`] = fileDataMap[fileKey].data;
				finalFormData[`${fileKey}Name`] = fileDataMap[fileKey].name;
			});
			
			// 上传主文件
			uni.uploadFile({
				url: `${API_BASE_URL}${url}`,
				filePath: mainFilePath,
				name: mainFileKey,
				formData: finalFormData,
				header: requestHeaders,
				success: (uploadResult) => {
					try {
						const result = JSON.parse(uploadResult.data);
						resolve(result);
					} catch (error) {
						reject(new Error('响应解析失败'));
					}
				},
				fail: (error) => {
					reject(new Error(`上传失败: ${error.errMsg}`));
				}
			});
		}
	});
}

export default {
	multipartUpload
};
