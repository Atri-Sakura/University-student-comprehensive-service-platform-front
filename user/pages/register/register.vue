<template>
	<view class="register-container">
		<!-- 背景颜色 -->
		<view class="background-gradient"></view>
		
		<!-- 注册卡片 -->
		<view class="register-card">
			<!-- 标题 -->
			<view class="register-title">用户注册</view>
			
			<!-- 表单区域 -->
			<view class="form-container">
				<!-- 手机号输入 -->
				<view class="input-group">
					<text class="input-label">手机号</text>
					<input 
						class="input-field" 
						type="text" 
						v-model="formData.phoneNumber"
						@input="handlePhoneInput"
						placeholder="请输入手机号"
						maxlength="11"
					/>
				</view>
				
				<!-- 密码输入 -->
				<view class="input-group">
					<text class="input-label">密码</text>
					<view class="password-container">
						<input 
							class="input-field password-input" 
							:type="showPassword ? 'text' : 'password'" 
							v-model="formData.password" 
							placeholder="请输入密码（6-20位）"
						/>
						<view class="password-toggle" @click="togglePassword">
							<text class="toggle-icon">{{ showPassword ? '👁️' : '👁️‍🗨️' }}</text>
						</view>
					</view>
				</view>
				
				<!-- 确认密码输入 -->
				<view class="input-group">
					<text class="input-label">确认密码</text>
					<view class="password-container">
						<input 
							class="input-field password-input" 
							:type="showConfirmPassword ? 'text' : 'password'" 
							v-model="formData.confirmPassword" 
							placeholder="请再次输入密码"
						/>
						<view class="password-toggle" @click="toggleConfirmPassword">
							<text class="toggle-icon">{{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}</text>
						</view>
					</view>
				</view>
				
				<!-- 验证码输入 -->
				<view class="input-group">
					<text class="input-label">验证码</text>
					<view class="verification-code-container">
						<input 
							class="input-field verification-input" 
							type="text" 
							v-model="formData.verificationCode" 
							placeholder="请输入验证码"
							maxlength="6"
						/>
						<view class="captcha-container">
							<image 
								:src="captchaImage" 
								class="captcha-image" 
								@click="refreshCaptcha"
								mode="aspectFit"
							/>
						</view>
					</view>
				</view>
				
				<!-- 按钮区域 -->
				<view class="button-group">
					<button class="register-btn" @click="handleRegister">注册</button>
					<button class="login-btn" @click="goToLogin">已有账号，去登录</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import http from '@/api/request.js';

export default {
	data() {
		return {
			formData: {
				phoneNumber: '',
				password: '',
				confirmPassword: '',
				verificationCode: ''
			},
			showPassword: false,
			showConfirmPassword: false,
			captchaImage: '/static/c1.png',
			uuid: ''
		}
	},
	// 页面创建时获取验证码
	created() {
		this.refreshCaptcha();
	},
	
	// 页面加载时获取验证码
	onLoad() {
		if (!this.captchaImage) {
			this.refreshCaptcha();
		}
	},
	
	methods: {
		// 切换密码显示
		togglePassword() {
			this.showPassword = !this.showPassword;
		},
		
		// 切换确认密码显示
		toggleConfirmPassword() {
			this.showConfirmPassword = !this.showConfirmPassword;
		},
		
		// 处理手机号输入（过滤非数字字符）
		handlePhoneInput(e) {
			const value = e.detail.value.replace(/[^\d]/g, '');
			// 如果过滤后的值与原值不同，更新它
			if (value !== this.formData.phoneNumber) {
				this.$nextTick(() => {
					this.formData.phoneNumber = value;
				});
			}
		},
	
		// 显示消息
		showMessage(message, type) {
			const icon = type === 'error' ? 'none' : 'success';
			uni.showToast({
				title: message,
				icon: icon,
				duration: 3000
			});
		},
		
		// 处理注册
		async handleRegister() {
			if (!this.validateForm()) {
				return;
			}
			
			// 显示加载提示
			uni.showLoading({
				title: '注册中...'
			});
			
			try {
				// 准备请求数据（注意：注册接口使用 phone，登录接口使用 phonenumber）
				const requestData = {
					phone: String(this.formData.phoneNumber || '').trim(),
					password: this.formData.password,
					code: this.formData.verificationCode,
					uuid: this.uuid || uni.getStorageSync('captchaUuid')
				};
				
				console.log('注册请求数据:', requestData);
				console.log('手机号值:', requestData.phone, '类型:', typeof requestData.phone, '长度:', requestData.phone ? requestData.phone.length : 0);
				
				// 用户端注册接口
				const result = await http.post('/platform/auth/user/register', requestData);

				console.log('注册响应完整数据:', JSON.stringify(result, null, 2));
				console.log('注册响应 code:', result?.code);
				console.log('注册响应 msg:', result?.msg);
				uni.hideLoading();

				// 后端返回格式：{code: 200, msg: "注册成功"} 或 {code: 500, msg: "错误信息"}
				// 注意：有些后端可能使用不同的状态码，如 0 表示成功
				if (result && (result.code === 200 || result.code === 0)) {
					// 检查是否有错误信息（即使 code 是 200，也可能有错误）
					if (result.msg && (result.msg.includes('已注册') || result.msg.includes('已存在'))) {
						this.showMessage(result.msg, 'error');
						this.refreshCaptcha();
						return;
					}
					
					// 注册成功后，设置默认身份为学生（与登录页面保持一致）
					uni.setStorageSync('userType', 'student');
					uni.setStorageSync('identity', '学生');
					uni.setStorageSync('identityKey', 'student');
					
					this.showMessage(result.msg || '注册成功！', 'success');
					
					// 注册成功后跳转到登录页
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				} else {
					// 注册失败，显示错误信息
					const errorMsg = result?.msg || result?.message || '注册失败，请稍后重试';
					console.error('注册失败:', errorMsg, '完整响应:', result);
					this.showMessage(errorMsg, 'error');
					this.refreshCaptcha();
				}
			} catch (error) {
				uni.hideLoading();
				console.error('注册错误完整信息:', error);
				console.error('注册错误 data:', error?.data);
				console.error('注册错误 response:', error?.response);
				
				// 尝试从不同位置获取错误信息
				let errorMsg = '网络错误，请稍后重试';
				
				// 检查错误对象的不同属性
				if (error?.data?.msg) {
					errorMsg = error.data.msg;
				} else if (error?.data?.message) {
					errorMsg = error.data.message;
				} else if (error?.msg) {
					errorMsg = error.msg;
				} else if (error?.message) {
					errorMsg = error.message;
				} else if (error?.data && typeof error.data === 'string') {
					try {
						const errorData = JSON.parse(error.data);
						errorMsg = errorData.msg || errorData.message || errorMsg;
					} catch (e) {
						// 如果不是 JSON，使用原始字符串
						errorMsg = error.data;
					}
				}
				
				this.showMessage(errorMsg, 'error');
				this.refreshCaptcha();
			}
		},
		
		// 跳转到登录页
		goToLogin() {
			uni.navigateBack();
		},
		
		// 刷新验证码
		async refreshCaptcha() {
			// 首先使用静态验证码确保页面有验证码显示
			this.setStaticCaptcha();
			
			// 然后尝试从服务器获取验证码
			try {
				console.log('尝试获取服务器验证码');
				const result = await http.get('/captchaImage');
				console.log('验证码响应:', result);

				if (result.code === 200 && result.img) {
					// 获取uuid并保存
					this.uuid = result.uuid;
					uni.setStorageSync('captchaUuid', result.uuid);
					
					// 显示Base64图片
					this.captchaImage = 'data:image/jpeg;base64,' + result.img;
					console.log('服务器验证码加载成功');
				} else {
					console.log('服务器验证码返回错误或无图片:', result.msg);
					// 保持使用静态验证码
				}
			} catch (error) {
				console.error('获取服务器验证码失败:', error);
				// 保持使用静态验证码
			}
		},
		
		// 设置静态验证码
		setStaticCaptcha() {
			const randomNum = Math.floor(Math.random() * 9) + 1;
			const staticCaptchaPath = `/static/c${randomNum}.png?timestamp=${Date.now()}`;
			this.captchaImage = staticCaptchaPath;
			// 生成临时uuid
			this.uuid = 'temp_' + Date.now();
			uni.setStorageSync('captchaUuid', this.uuid);
			console.log('使用静态验证码:', staticCaptchaPath);
		},
		
		// 表单验证
		validateForm() {
			// 调试输出
			console.log('验证表单 - formData:', this.formData);
			console.log('验证表单 - phoneNumber 原始值:', this.formData.phoneNumber, '类型:', typeof this.formData.phoneNumber);
			
			// 获取手机号（已经在输入时过滤了非数字字符）
			let phoneNumber = this.formData.phoneNumber;
			
			// 如果是数字类型，转换为字符串
			if (typeof phoneNumber === 'number') {
				phoneNumber = String(phoneNumber);
			} else {
				phoneNumber = String(phoneNumber || '').trim();
			}
			
			console.log('验证表单 - phoneNumber 处理后:', phoneNumber, '长度:', phoneNumber.length);
			
			if (!phoneNumber || phoneNumber.length === 0) {
				uni.showToast({
					title: '请输入手机号',
					icon: 'none'
				});
				return false;
			}
			
			if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
				uni.showToast({
					title: '请输入正确的手机号',
					icon: 'none'
				});
				return false;
			}
			
			if (!this.formData.password) {
				uni.showToast({
					title: '请输入密码',
					icon: 'none'
				});
				return false;
			}
			
			if (this.formData.password.length < 6 || this.formData.password.length > 20) {
				uni.showToast({
					title: '密码长度为6-20位',
					icon: 'none'
				});
				return false;
			}
			
			if (!this.formData.confirmPassword) {
				uni.showToast({
					title: '请确认密码',
					icon: 'none'
				});
				return false;
			}
			
			if (this.formData.password !== this.formData.confirmPassword) {
				uni.showToast({
					title: '两次输入的密码不一致',
					icon: 'none'
				});
				return false;
			}
			
			// 验证验证码
			if (!this.formData.verificationCode) {
				uni.showToast({
					title: '请输入验证码',
					icon: 'none'
				});
				return false;
			}
			
			return true;
		}
	}
}
</script>

<style lang="scss" scoped>
.register-container {
	position: relative;
	width: 100%;
	height: 100vh;
	overflow: hidden;
	background: #f0f8ff;
}

.background-gradient {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: linear-gradient(180deg, #e6f4fb 0%, #b6e0f8 100%);
	z-index: 1;
}

.register-card {
	position: relative;
	z-index: 2;
	margin: 0 auto;
	width: 75%;
	max-width: 320px;
	background: white;
	border-radius: 24px;
	padding: 35px 25px;
	box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
	margin-top: calc(50vh - 400px);
}

.register-title {
    font-size: 20px;
    font-weight: 500;
    color: #333;
    margin-bottom: 25px;
    text-align: center;
}

.form-container {
    width: 100%;
}

.input-group {
    margin-bottom: 20px;
}

.input-label {
    display: block;
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
}

.input-field {
    width: 100%;
    height: 44px;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 0 15px;
    font-size: 15px;
    color: #333;
    box-sizing: border-box;
}

/* 密码输入容器 */
.password-container {
    position: relative;
    width: 100%;
}

.password-input {
    padding-right: 50px;
}

.password-toggle {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.toggle-icon {
    font-size: 18px;
}

/* 验证码相关样式 */
.verification-code-container {
    display: flex;
    align-items: center;
    gap: 10px;
}

.verification-input {
    flex: 1;
    margin-bottom: 0;
}

.captcha-container {
    display: flex;
    align-items: center;
    justify-content: center;
}

.captcha-image {
    height: 44px;
    width: 120px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f5f5f5;
    cursor: pointer;
}

.captcha-image:active {
    opacity: 0.8;
}

.button-group {
    margin-top: 30px;
}

.register-btn {
    width: 100%;
    height: 44px;
    background-color: #87CEEB;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 12px;
    cursor: pointer;
}

.register-btn:active {
    opacity: 0.8;
}

.login-btn {
    width: 100%;
    height: 44px;
    background-color: transparent;
    color: #87CEEB;
    border: 1px solid #87CEEB;
    border-radius: 8px;
    font-size: 16px;
    margin-bottom: 12px;
    cursor: pointer;
}

.login-btn:active {
    opacity: 0.8;
}

/* 响应式设计 */
@media screen and (max-width: 480px) {
    .register-card {
        width: 85%;
        max-width: 280px;
        padding: 30px 20px;
        margin-top: calc(50vh - 350px);
    }
    
    .register-title {
        font-size: 18px;
        margin-bottom: 20px;
    }
    
    .input-group {
        margin-bottom: 15px;
    }
    
    .input-field {
        height: 38px;
        font-size: 13px;
    }
    
    .register-btn, .login-btn {
        height: 38px;
        font-size: 15px;
    }
}
</style>

